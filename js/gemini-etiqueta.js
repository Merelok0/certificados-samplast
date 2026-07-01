// js/gemini-etiqueta.js - Lector de Etiquetas con Gemini (API Key directa)

let _systemPrompt = null;

async function getSystemPrompt() {
  if (_systemPrompt) return _systemPrompt;
  try {
    const res = await fetch('PROMPT_LECTURA_ETIQUETA_GEMINI.txt');
    if (!res.ok) throw new Error('No se encontró el archivo de instrucciones.');
    _systemPrompt = await res.text();
    return _systemPrompt;
  } catch (e) {
    console.error('Error cargando prompt:', e);
    return null;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function llamarGemini(imageBase64, mimeType, systemPrompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{
      parts: [
        { inline_data: { mime_type: mimeType, data: imageBase64 } },
        { text: 'Decodifica esta etiqueta y devuelve ÚNICAMENTE el JSON.' }
      ]
    }],
    generation_config: { response_mime_type: 'application/json' }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.status === 400 || res.status === 403) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || '';
    if (msg.includes('API_KEY') || msg.includes('key')) {
      throw new Error('API_KEY_INVALID');
    }
    throw new Error(`Error Gemini (${res.status}): ${msg}`);
  }

  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(text);
}

document.addEventListener('DOMContentLoaded', () => {
  const fotoInput = document.getElementById('foto-etiqueta');
  const btnLeerIa = document.getElementById('btn-leer-ia');
  const iaStatus = document.getElementById('ia-status');
  const certForm = document.getElementById('cert-form');
  if (!fotoInput || !btnLeerIa || !iaStatus || !certForm) return;

  // Mostrar estado inicial del botón IA según si hay clave configurada
  function updateIaButtonState() {
    const hasKey = !!(window.Auth?.apiKey);
    if (fotoInput.files?.length > 0) {
      btnLeerIa.disabled = false;
      btnLeerIa.classList.add('pulse-animation');
      if (!hasKey) {
        setStatus('📷 Foto lista — pulsa ⚙ para configurar la clave de IA primero.', 'ia-warning');
      } else {
        setStatus('Foto lista. Pulsa "Leer etiqueta con IA".', 'ia-ready');
      }
    } else {
      btnLeerIa.disabled = true;
      btnLeerIa.classList.remove('pulse-animation');
      iaStatus.textContent = '';
    }
  }

  fotoInput.addEventListener('change', updateIaButtonState);

  btnLeerIa.addEventListener('click', async () => {
    const file = fotoInput.files?.[0];
    if (!file) { alert('Selecciona una foto primero.'); return; }

    const apiKey = window.GEMINI_KEY || window.Auth?.apiKey || '';
    if (!apiKey) {
      setStatus('❌ No hay clave de Gemini configurada en config.js', 'ia-error');
      return;
    }

    btnLeerIa.disabled = true;
    btnLeerIa.classList.remove('pulse-animation');
    const orig = btnLeerIa.innerHTML;
    btnLeerIa.innerHTML = '⏳ Analizando...';
    setStatus('Gemini está leyendo la etiqueta...', 'ia-loading');
    limpiarResaltados();

    try {
      const prompt = await getSystemPrompt();
      if (!prompt) throw new Error('No se pudo cargar el archivo de instrucciones de la IA.');

      const base64 = await fileToBase64(file);
      const mime = file.type || 'image/jpeg';
      const result = await llamarGemini(base64, mime, prompt, apiKey);

      if (result.error) {
        setStatus(`❌ ${result.notas || 'No es una etiqueta de lote SAMPLAST.'}`, 'ia-error');
        return;
      }

      llenarFormulario(result);

      if (result.confianza === 'alta') {
        setStatus('✅ Lote leído con éxito. Solo falta el nombre del cliente.', 'ia-success');
      } else {
        setStatus(`⚠️ Confianza ${result.confianza}. Revisa los campos resaltados.`, 'ia-warning');
        resaltarCampos(result.confianza);
      }

    } catch (e) {
      console.error(e);
      if (e.message === 'API_KEY_INVALID') {
        setStatus('❌ Clave de Gemini inválida. Pulsa "Cambiar clave API".', 'ia-error');
        alert('La clave API de Gemini no es válida o expiró.\nPulsa "Cambiar clave API" e ingresa una clave correcta.');
      } else {
        setStatus(`❌ Error: ${e.message}`, 'ia-error');
      }
    } finally {
      btnLeerIa.disabled = false;
      btnLeerIa.innerHTML = orig;
    }
  });

  function setStatus(msg, cls) {
    iaStatus.textContent = msg;
    iaStatus.className = `field-note ${cls}`;
  }

  function llenarFormulario(d) {
    if (d.tipo) certForm.tipo.value = d.tipo;
    if (d.formato_etiqueta) certForm.formato_etiqueta.value = d.formato_etiqueta;
    if (d.ancho) certForm.ancho.value = d.ancho;
    if (d.espesor) certForm.espesor.value = d.espesor;
    if (d.peso) certForm.peso.value = d.peso;
    if (d.codigo_lote) certForm.codigo_lote.value = d.codigo_lote;
    if (d.lote) { certForm.lote.value = d.lote; certForm.lote.dataset.manual = '1'; }
    if (d.fecha_fabricacion) certForm.fecha_fabricacion.value = d.fecha_fabricacion;
    if (typeof window.applyTipoRules === 'function') window.applyTipoRules();
    if (typeof window.applyFormatoToFields === 'function') window.applyFormatoToFields();
    if (typeof window.autoFillDates === 'function') window.autoFillDates();
    if (typeof window.updatePreview === 'function') window.updatePreview();
  }

  function resaltarCampos(confianza) {
    const cls = confianza === 'baja' ? 'highlight-ia-low' : 'highlight-ia-medium';
    ['formato_etiqueta','ancho','espesor','peso','codigo_lote','lote','fecha_fabricacion'].forEach(id => {
      const el = document.getElementById(id);
      if (el?.value) {
        el.classList.add(cls);
        el.addEventListener('focus', () => el.classList.remove('highlight-ia-low','highlight-ia-medium'), { once: true });
      }
    });
  }

  function limpiarResaltados() {
    ['formato_etiqueta','ancho','espesor','peso','codigo_lote','lote','fecha_fabricacion']
      .forEach(id => document.getElementById(id)?.classList.remove('highlight-ia-low','highlight-ia-medium'));
  }
});
