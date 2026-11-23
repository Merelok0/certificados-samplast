'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = (path) => fs.readFileSync(path, 'utf8');

function loadBatchParser() {
  const dom = {
    getElementById(id) {
      if (id === 'cert-form') return {};
      if (id === 'bulk-input') return {};
      if (id === 'btn-bulk-load') return { addEventListener() {} };
      return null;
    },
    querySelector() { return null; }
  };
  const window = {};
  vm.runInNewContext(read('js/lote-masivo-v4.js'), { document: dom, window, console, setTimeout, clearTimeout });
  return window.SamplastLotesV4;
}

const item = (fields = {}) => ({
  cliente: 'INDUSTRIAL BIOPLAST S.A.C.',
  tipo: 'MANUAL',
  color: '',
  codigo: '',
  formato: '',
  lote: '181126/R8-2IS',
  ...fields
});

test('código C conserva manual transparente sin color', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ codigo: '2012C019TD' })]))[0];
  assert.equal(row.error, '');
  assert.equal(row.tipo, 'MANUAL');
  assert.equal(row.color, '');
  assert.equal(row.peso, '1.9');
});

test('código R genera ROJO y MANUAL_COLOR sin que Gemini lo indique', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ codigo: '2012R015TD' })]))[0];
  assert.equal(row.error, '');
  assert.equal(row.tipo, 'MANUAL_COLOR');
  assert.equal(row.color, 'ROJO');
  assert.equal(row.espesor, '20');
  assert.equal(row.peso, '1.5');
});

test('código N genera NEGRO y MANUAL_COLOR', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ codigo: '2012N020TD' })]))[0];
  assert.equal(row.error, '');
  assert.equal(row.color, 'NEGRO');
  assert.equal(row.tipo, 'MANUAL_COLOR');
});

test('un manual rojo con medidas explícitas se corrige automáticamente', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ color: 'ROJO', formato: '20*20*1.50' })]))[0];
  assert.equal(row.error, '');
  assert.equal(row.tipo, 'MANUAL_COLOR');
});

test('otros colores siguen admitiéndose con formato explícito', () => {
  const rows = loadBatchParser().parseInput(JSON.stringify(['AZUL','VERDE','AMARILLO'].map(color => item({ color, formato: '18*20*1.50' }))));
  for (const row of rows) {
    assert.equal(row.error, '');
    assert.equal(row.tipo, 'MANUAL_COLOR');
  }
});

test('rechaza color explícito contradictorio con código', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ color: 'NEGRO', codigo: '2012R015TD' })]))[0];
  assert.match(row.error, /contradice/i);
});

test('no adivina letra técnica de color no validada', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ codigo: '2012A015TD' })]))[0];
  assert.match(row.error, /letra de color/i);
});

test('código SAP no se usa como técnico', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ codigo: 'P00435', formato: '20*20*2.00' })]))[0];
  assert.equal(row.error, '');
  assert.equal(row.codigo, '');
  assert.equal(row.peso, '2.0');
});

test('preestirado sin código conserva sus medidas', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ tipo: 'PRE-ESTIRADO', formato: '18*09*2.50' })]))[0];
  assert.equal(row.error, '');
  assert.equal(row.tipo, 'PRE-ESTIRADO');
});

test('no oculta color de tipo incompatible', () => {
  const row = loadBatchParser().parseInput(JSON.stringify([item({ tipo: 'AUTOMATICO', color: 'ROJO', formato: '20*20*2.0' })]))[0];
  assert.match(row.error, /no permite color/i);
});

test('progreso PDF visible fuera del formulario y restauración en ambos flujos', () => {
  const html = read('index.html');
  const css = read('css/lote-masivo.css');
  const individual = read('js/app.js');
  const batch = read('js/lote-masivo-v4.js');
  assert.ok(html.includes('id="pdf-progress-overlay"'));
  assert.ok(html.indexOf('id="pdf-progress-overlay"') > html.indexOf('</div>\n\n  <div id="batch-print-root"') || html.indexOf('id="pdf-progress-overlay"') > html.indexOf('id="batch-print-root"'));
  assert.ok(css.includes('.pdf-progress-overlay[hidden]'));
  assert.ok(individual.includes('window.SamplastPdfProgress ='));
  assert.ok(batch.includes('window.SamplastPdfProgress?.show?.('));
  assert.ok(batch.includes('window.SamplastPdfProgress?.hide?.()'));
  assert.ok(batch.includes('window.endPdfCapture?.()'));
});

test('la PWA y la publicación Pages usan rutas relativas', () => {
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  const workflow = read('.github/workflows/pages.yml');
  assert.ok(workflow.includes('actions/deploy-pages@'));
  assert.ok(workflow.includes('cp -R assets css js _site/'));
  assert.ok(!workflow.includes('.env '));
});

test('el instructivo mantiene catálogo dinámico y describe códigos R/N', () => {
  const script = read('js/clientes-admin-v2.js');
  const store = new Map();
  const window = {};
  vm.runInNewContext(script, {
    window,
    document: { getElementById() { return null; } },
    localStorage: {
      getItem(k) { return store.get(k) || null; },
      setItem(k,v) { store.set(k,v); },
      removeItem(k) { store.delete(k); }
    },
    CLIENTES_DB: [{ cliente: 'GOLCHI S.A.C.', corto: 'GOLCHI' }],
    console
  });
  const prompt1 = window.SamplastClientes.buildPrompt();
  assert.ok(prompt1.includes('GOLCHI S.A.C. | corto: GOLCHI'));
  assert.ok(prompt1.includes('"codigo":"2012R015TD"'));
  store.set('samplast_clientes_personalizados_v1', JSON.stringify([{ cliente: 'NUEVO CLIENTE S.A.C.', corto: 'NUEVO' }]));
  const prompt2 = window.SamplastClientes.buildPrompt();
  assert.ok(prompt2.includes('NUEVO CLIENTE S.A.C. | corto: NUEVO'));
  assert.ok(!prompt1.includes('NUEVO CLIENTE S.A.C.'));
});
