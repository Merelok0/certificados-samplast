// SAMPLAST - Carga masiva final: tipos robustos, eliminación puntual y PDFs separados.
(() => {
  "use strict";

  const MICRON_BY_CODE = {
    "01":"8","02":"9","03":"10","04":"12","05":"13","06":"14","07":"15","08":"16","09":"17","10":"18","11":"19","12":"20",
    "13":"22","14":"23","15":"25","16":"28","17":"30","18":"35","19":"40","20":"45","21":"48","22":"50"
  };
  const VALID_TYPES = new Set(["MANUAL","AUTOMATICO","PRE-ESTIRADO","MANUAL_COLOR"]);
  const VALID_COLORS = new Set(["NEGRO","ROJO","AZUL","VERDE","AMARILLO"]);

  const form = document.getElementById("cert-form");
  const bulkInput = document.getElementById("bulk-input");
  const bulkStatus = document.getElementById("bulk-status");
  const bulkTableContainer = document.getElementById("bulk-table-container");
  const btnLoad = document.getElementById("btn-bulk-load");
  const btnPrint = document.getElementById("btn-bulk-print");
  const btnPdf = document.getElementById("btn-bulk-pdf");
  const batchRoot = document.getElementById("batch-print-root");
  const loteDateStatus = document.getElementById("lote-date-status");
  if (!form || !bulkInput || !btnLoad) return;

  let batchItems = [];

  const esc = (v) => String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/\"/g,"&quot;")
    .replace(/'/g,"&#039;");

  function normCodigo(v) {
    return String(v || "").trim().toUpperCase()
      .replace(/^CODIGO\s*[:：]?\s*/i,"")
      .replace(/\s+/g,"");
  }

  function normLote(v) {
    return String(v || "").trim().toUpperCase()
      .replace(/^LOTE\s*[:：]?\s*/i,"")
      .replace(/\s+/g,"");
  }

  function normTipo(v) {
    const x = String(v || "").trim().toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/_/g,"-")
      .replace(/\s+/g," ");
    if (!x) return "";
    if (["MANUAL","STFM","STMF","STRETCH FILM MANUAL"].includes(x)) return "MANUAL";
    if (["AUTOMATICO","AUTOMATICA","AUTOMATIC","STRETCH FILM AUTOMATICO"].includes(x)) return "AUTOMATICO";
    if (["PRE-ESTIRADO","PRE ESTIRADO","PREESTIRADO","PRE-STRETCHED","PRESTRETCH"].includes(x)) return "PRE-ESTIRADO";
    if (["MANUAL COLOR","MANUAL-COLOR","MANUAL CON COLOR","COLOR"].includes(x)) return "MANUAL_COLOR";
    if (["REVISAR","REVISAR TIPO","REVISAR-TIPO"].includes(x)) return "REVISAR";
    return x.replace(/ /g,"-");
  }

  function inferTipo(codigo) {
    const c = normCodigo(codigo);
    if (/TD$/i.test(c)) return "MANUAL";
    if (/TG$/i.test(c)) return "AUTOMATICO";
    return "";
  }

  function parseDate(lote) {
    const m = normLote(lote).match(/^(\d{2})(\d{2})(\d{2})(?:\/|$)/);
    if (!m) return "";
    const d = +m[1], mo = +m[2], y = 2000 + +m[3];
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return "";
    return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function addDay(iso) {
    const [y,m,d] = iso.split("-").map(Number);
    const dt = new Date(y,m-1,d);
    dt.setDate(dt.getDate()+1);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const [y,m,d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function parseFormatoString(raw) {
    const text = String(raw || "").trim();
    if (!text) return null;
    const cleaned = text.toUpperCase()
      .replace(/PULGADAS?|PULG|INCH(?:ES)?/g,"")
      .replace(/MICRAS?|MC|UM|µM/g,"")
      .replace(/KILOGRAMOS?|KGS?|KG/g,"")
      .replace(/[\"']/g,"")
      .replace(/,/g,".")
      .trim();
    const nums = cleaned.match(/\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 3) return null;
    const [a,e,p] = nums.slice(0,3).map(Number);
    if (![a,e,p].every(n => Number.isFinite(n) && n > 0)) return null;
    return {
      ancho: String(a),
      espesor: String(e),
      peso: p.toFixed(1),
      formato: `${a}*${e}*${p.toFixed(1)}`
    };
  }

  function explicitMeasures(raw) {
    const direct = parseFormatoString(raw?.formato_etiqueta ?? raw?.formato ?? raw?.medidas ?? raw?.especificacion ?? "");
    if (direct) return direct;
    const a = raw?.ancho ?? raw?.ancho_pulg;
    const e = raw?.espesor ?? raw?.espesor_micras;
    const p = raw?.peso ?? raw?.peso_kg;
    if ([a,e,p].every(n => Number.isFinite(+n) && +n > 0)) {
      return {
        ancho: String(+a),
        espesor: String(+e),
        peso: (+p).toFixed(1),
        formato: `${+a}*${+e}*${(+p).toFixed(1)}`
      };
    }
    return null;
  }

  function decodeCodigo(codigo) {
    const c = normCodigo(codigo);
    const m = c.match(/^(\d{2})(\d{2})C(\d{3,4})([A-Z][A-Z0-9]*)$/i);
    if (!m) return { error: `Código no reconocido: ${c || "vacío"}` };
    const espesor = MICRON_BY_CODE[m[2]];
    if (!espesor) return { error: `Código de espesor ${m[2]} fuera de tabla 01-22` };
    const peso = (+m[3] / 10).toFixed(1);
    return {
      codigo: c,
      ancho: m[1],
      espesor,
      peso,
      formato: `${m[1]}*${espesor}*${peso}`,
      sufijo: m[4]
    };
  }

  function normalizeRow(raw, source="") {
    const cliente = String(raw?.cliente ?? raw?.empresa ?? "").trim();
    const codigo = normCodigo(raw?.codigo ?? raw?.codigo_raw ?? "");
    const lote = normLote(raw?.lote ?? raw?.lote_raw ?? "");
    const tipo = normTipo(raw?.tipo ?? raw?.categoria ?? raw?.tipo_producto ?? "") || inferTipo(codigo);
    const color = String(raw?.color || "").trim().toUpperCase();
    const explicit = explicitMeasures(raw);

    if (!cliente || !lote) return { cliente, tipo, color, codigo, lote, formatoFuente: explicit?.formato || "", error: "Falta CLIENTE o LOTE", source };
    if (!tipo || tipo === "REVISAR") return { cliente, tipo: tipo || "REVISAR", color, codigo, lote, formatoFuente: explicit?.formato || "", error: "Falta identificar el TIPO de producto. Revise la etiqueta.", source };
    if (!VALID_TYPES.has(tipo)) return { cliente, tipo, color, codigo, lote, formatoFuente: explicit?.formato || "", error: `Tipo no reconocido: ${tipo}`, source };
    if (tipo === "MANUAL_COLOR" && !VALID_COLORS.has(color)) return { cliente, tipo, color, codigo, lote, formatoFuente: explicit?.formato || "", error: "MANUAL_COLOR requiere un color válido.", source };

    let measures = explicit;
    let decoded = null;

    if (tipo === "PRE-ESTIRADO") {
      if (!measures && codigo && codigo !== "REVISAR") {
        decoded = decodeCodigo(codigo);
        if (!decoded.error) measures = decoded;
      }
      if (!measures) {
        return {
          cliente, tipo, color, codigo, lote, formatoFuente: "",
          error: "PRE-ESTIRADO requiere las medidas de la etiqueta en 'formato' (ej. 18*09*2.50). El código puede quedar vacío.",
          source
        };
      }
    } else {
      if (!codigo || codigo === "REVISAR") return { cliente, tipo, color, codigo, lote, formatoFuente: explicit?.formato || "", error: "Falta CODIGO para este tipo de producto", source };
      decoded = decodeCodigo(codigo);
      if (!measures && !decoded.error) measures = decoded;
      if (!measures) {
        return {
          cliente, tipo, color, codigo, lote, formatoFuente: explicit?.formato || "",
          error: `${decoded?.error || "No se pudieron obtener las medidas"}. Si el código es especial, incluya ancho, espesor y peso en el JSON.`,
          source
        };
      }
    }

    const fechaFab = parseDate(lote);
    if (!fechaFab) return { cliente, tipo, color, codigo, lote, formatoFuente: explicit?.formato || "", error: `No se pudo obtener una fecha DDMMAA válida desde ${lote}`, source };

    return {
      cliente,
      tipo,
      color: VALID_COLORS.has(color) ? color : "",
      codigo: decoded && !decoded.error ? decoded.codigo : codigo,
      lote,
      ancho: measures.ancho,
      espesor: measures.espesor,
      peso: measures.peso,
      formato: measures.formato,
      formatoFuente: explicit?.formato || (tipo === "PRE-ESTIRADO" ? measures.formato : ""),
      fechaFab,
      fechaEmision: addDay(fechaFab),
      error: "",
      source
    };
  }

  function parseInput(text) {
    const t = String(text || "").trim();
    if (!t) return [];
    if (t.startsWith("[") || t.startsWith("{")) {
      const parsed = JSON.parse(t);
      const rows = Array.isArray(parsed) ? parsed : (parsed.certificados || parsed.items || parsed.lotes || []);
      if (!Array.isArray(rows)) throw new Error("El JSON debe ser una lista de certificados.");
      return rows.map((r,i) => normalizeRow(r, `JSON #${i+1}`));
    }
    return t.split(/\r?\n/).map(x => x.trim()).filter(Boolean).map(line => {
      const p = line.replace(/^[-•]\s*/,"").split("|").map(x => x.trim());
      if (p.length >= 5) return normalizeRow({cliente:p[0],tipo:p[1],codigo:p[2],formato:p[3],lote:p.slice(4).join("|")}, line);
      if (p.length === 4) return normalizeRow({cliente:p[0],tipo:p[1],codigo:p[2],lote:p[3]}, line);
      if (p.length === 3) return normalizeRow({cliente:p[0],codigo:p[1],lote:p[2]}, line);
      return {cliente:p[0]||"",tipo:"",codigo:p[1]||"",lote:p[2]||"",error:"Formato esperado: CLIENTE | TIPO | CODIGO | LOTE",source:line};
    });
  }

  function status(msg,error=false) {
    if (!bulkStatus) return;
    bulkStatus.textContent = msg;
    bulkStatus.classList.toggle("is-error",error);
    bulkStatus.classList.toggle("is-ok",!!msg && !error);
  }

  function setButtons() {
    const ok = batchItems.length > 0 && batchItems.every(x => !x.error);
    if (btnPrint) btnPrint.disabled = !ok;
    if (btnPdf) btnPdf.disabled = !ok;
  }

  function serializeCurrentBatch() {
    const rows = batchItems.map(x => ({
      cliente: x.cliente || "",
      tipo: x.tipo || "REVISAR",
      color: x.color || "",
      codigo: x.codigo || "",
      formato: x.formatoFuente || (x.tipo === "PRE-ESTIRADO" ? (x.formato || "") : ""),
      lote: x.lote || ""
    }));
    bulkInput.value = JSON.stringify(rows, null, 2);
  }

  function removeItem(index) {
    const removed = batchItems[index];
    if (!removed) return;
    batchItems.splice(index,1);
    serializeCurrentBatch();
    renderTable();
    setButtons();
    if (!batchItems.length) {
      status("No quedan certificados en la carga.");
      return;
    }
    const next = batchItems.find(x => !x.error);
    if (next) loadItem(next);
    status(`Certificado eliminado. Quedan ${batchItems.length}.`);
  }

  function renderTable() {
    if (!bulkTableContainer) return;
    if (!batchItems.length) {
      bulkTableContainer.hidden = true;
      bulkTableContainer.innerHTML = "";
      return;
    }

    const rows = batchItems.map((x,i) => {
      const codeText = x.tipo === "PRE-ESTIRADO" && !x.codigo ? "No aplica" : x.codigo;
      return `<tr class="${x.error ? "has-error" : ""}">
        <td>${i+1}</td>
        <td>${esc(x.cliente)}</td>
        <td>${esc(x.tipo || "REVISAR")}</td>
        <td><code>${esc(codeText)}</code></td>
        <td><code>${esc(x.lote)}</code></td>
        <td>${x.error ? "—" : esc(fmtDate(x.fechaFab))}</td>
        <td>${x.error ? "—" : `${esc(x.ancho)}\" · ${esc(x.espesor)} µm · ${esc(x.peso)} kg`}</td>
        <td>${x.error ? `<span class="bulk-row-error">${esc(x.error)}</span>` : '<span class="bulk-row-ok">Listo</span>'}</td>
        <td class="bulk-row-actions">
          ${x.error ? "" : `<button type="button" class="bulk-row-load" data-index="${i}">Ver</button>`}
          <button type="button" class="bulk-row-delete" data-index="${i}">Eliminar</button>
        </td>
      </tr>`;
    }).join("");

    bulkTableContainer.innerHTML = `<table class="bulk-table"><thead><tr><th>#</th><th>Cliente</th><th>Tipo</th><th>Código</th><th>Lote</th><th>Fabricación</th><th>Producto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table>`;
    bulkTableContainer.hidden = false;

    bulkTableContainer.querySelectorAll(".bulk-row-load").forEach(b => {
      b.addEventListener("click", e => {
        e.stopImmediatePropagation();
        const x = batchItems[+b.dataset.index];
        if (x && !x.error) loadItem(x);
      });
    });
    bulkTableContainer.querySelectorAll(".bulk-row-delete").forEach(b => {
      b.addEventListener("click", e => {
        e.stopImmediatePropagation();
        removeItem(+b.dataset.index);
      });
    });
  }

  function loadItem(x) {
    form.cliente.value = x.cliente;
    form.fecha_fabricacion.value = x.fechaFab;
    form.fecha_emision.value = x.fechaEmision;
    form.tipo.value = x.tipo;
    if (form.color) form.color.value = x.color || "";
    if (typeof window.applyTipoRules === "function") window.applyTipoRules();
    form.formato_etiqueta.value = x.formato;
    form.ancho.value = x.ancho;
    form.espesor.value = x.espesor;
    form.peso.value = x.peso;
    form.lote.value = x.lote;
    form.lote.dataset.manual = "1";
    if (typeof window.applyFormatoToFields === "function") window.applyFormatoToFields();
    if (typeof window.updatePreview === "function") window.updatePreview();
    if (loteDateStatus) {
      loteDateStatus.textContent = `Fecha detectada: ${fmtDate(x.fechaFab)} · Emisión: ${fmtDate(x.fechaEmision)}`;
      loteDateStatus.classList.remove("is-error");
    }
  }

  function saveState() {
    const s = {};
    for (const el of Array.from(form.elements)) {
      if (el.name && !["button","submit","file"].includes(el.type)) s[el.name] = el.value;
    }
    s.__manual = form.lote?.dataset.manual || "";
    return s;
  }

  function restoreState(s) {
    for (const [n,v] of Object.entries(s)) {
      if (n.startsWith("__")) continue;
      const el = form.elements.namedItem(n);
      if (el && typeof el.value !== "undefined") el.value = v;
    }
    if (form.lote) form.lote.dataset.manual = s.__manual || "";
    if (typeof window.applyTipoRules === "function") window.applyTipoRules();
    if (typeof window.applyFormatoToFields === "function") window.applyFormatoToFields();
    if (typeof window.updatePreview === "function") window.updatePreview();
  }

  const paint = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  async function buildPages() {
    if (!batchRoot) throw new Error("No se encontró el contenedor de impresión.");
    if (!batchItems.length || batchItems.some(x => x.error)) throw new Error("Corrija o elimine los registros marcados antes de continuar.");
    const st = saveState();
    batchRoot.innerHTML = "";
    try {
      for (let i=0; i<batchItems.length; i++) {
        loadItem(batchItems[i]);
        await paint();
        const src = document.getElementById("cert-print-area");
        if (!src) throw new Error(`No se pudo renderizar el certificado ${i+1}.`);
        const c = src.cloneNode(true);
        c.removeAttribute("id");
        c.classList.add("batch-cert-page");
        batchRoot.appendChild(c);
      }
    } finally {
      restoreState(st);
    }
    return batchRoot;
  }

  async function printAll(e) {
    e?.preventDefault();
    e?.stopImmediatePropagation();
    const old = btnPrint.textContent;
    try {
      btnPrint.disabled = true;
      btnPrint.textContent = "Preparando…";
      status(`Preparando ${batchItems.length} certificados…`);
      await buildPages();
      batchRoot.setAttribute("aria-hidden","false");
      document.body.classList.add("batch-print-mode");
      await paint();
      const clean = () => {
        document.body.classList.remove("batch-print-mode");
        batchRoot.setAttribute("aria-hidden","true");
        btnPrint.disabled = false;
        btnPrint.textContent = old;
      };
      window.addEventListener("afterprint", clean, {once:true});
      window.print();
    } catch (err) {
      document.body.classList.remove("batch-print-mode");
      batchRoot?.setAttribute("aria-hidden","true");
      btnPrint.disabled = false;
      btnPrint.textContent = old;
      status(err.message || "No se pudo imprimir.", true);
    }
  }

  function downloadBlob(blob,name) {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u),1500);
  }

  function currentPdfName() {
    const name = String(document.getElementById("pdf-name-preview")?.textContent || "").trim();
    return name || `CERTIFICADO_${Date.now()}.pdf`;
  }

  async function currentPdfBlob() {
    const element = document.getElementById("cert-print-area");
    if (!element) throw new Error("No se encontró el certificado en pantalla.");
    const orientation = form.pdf_orientation?.value === "landscape" ? "landscape" : "portrait";
    if (typeof window.buildCertificatePdfBlob === "function") {
      if (typeof window.beginPdfCapture === "function") window.beginPdfCapture();
      try {
        return await window.buildCertificatePdfBlob(element, orientation);
      } finally {
        if (typeof window.endPdfCapture === "function") window.endPdfCapture();
      }
    }
    if (typeof html2pdf === "undefined") throw new Error("No se cargó la librería PDF.");
    return await html2pdf().set({
      margin:[4,4,4,4],
      image:{type:"jpeg",quality:.98},
      html2canvas:{backgroundColor:"#ffffff",scale:2,logging:false,useCORS:false,allowTaint:false,scrollX:0,scrollY:0},
      jsPDF:{unit:"mm",format:"a4",orientation}
    }).from(element).outputPdf("blob");
  }

  async function writeToDirectory(directoryHandle, filename, blob) {
    const fileHandle = await directoryHandle.getFileHandle(filename, {create:true});
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  async function savePdfsSeparately(e) {
    e?.preventDefault();
    e?.stopImmediatePropagation();
    if (!batchItems.length || batchItems.some(x => x.error)) {
      status("Corrija o elimine los registros marcados antes de guardar.", true);
      return;
    }

    const old = btnPdf.textContent;
    const st = saveState();
    let directoryHandle = null;
    try {
      btnPdf.disabled = true;
      btnPdf.textContent = "Preparando…";

      if (window.isSecureContext && typeof window.showDirectoryPicker === "function") {
        status("Elija una carpeta. Se guardará un PDF separado por certificado con su nombre individual.");
        directoryHandle = await window.showDirectoryPicker({mode:"readwrite"});
      } else {
        status("El navegador no permite elegir una carpeta única; se descargarán los PDFs por separado.");
      }

      for (let i=0; i<batchItems.length; i++) {
        loadItem(batchItems[i]);
        await paint();
        const filename = currentPdfName();
        btnPdf.textContent = `Guardando ${i+1}/${batchItems.length}…`;
        status(`Generando ${i+1} de ${batchItems.length}: ${filename}`);
        const blob = await currentPdfBlob();
        if (!blob || blob.size < 1000) throw new Error(`El PDF ${i+1} salió vacío.`);
        if (directoryHandle) {
          await writeToDirectory(directoryHandle, filename, blob);
        } else {
          downloadBlob(blob, filename);
          await new Promise(r => setTimeout(r, 700));
        }
      }

      status(`${batchItems.length} PDFs separados guardados correctamente.`);
    } catch (err) {
      if (err?.name === "AbortError") status("Guardado cancelado.");
      else status(`Error al guardar PDFs: ${err?.message || "desconocido"}`, true);
    } finally {
      restoreState(st);
      btnPdf.disabled = false;
      btnPdf.textContent = old;
    }
  }

  function loadAll(e) {
    e?.preventDefault();
    e?.stopImmediatePropagation();
    try {
      batchItems = parseInput(bulkInput.value);
      renderTable();
      setButtons();
      if (!batchItems.length) {
        status("Pegue al menos un certificado.", true);
        return;
      }
      const errors = batchItems.filter(x => x.error);
      if (errors.length) {
        status(`${batchItems.length-errors.length} listos y ${errors.length} con error. Puede corregirlos o eliminarlos.`, true);
        const firstOk = batchItems.find(x => !x.error);
        if (firstOk) loadItem(firstOk);
        return;
      }
      loadItem(batchItems[0]);
      status(`${batchItems.length} certificados listos. Puede revisar, eliminar, imprimir o guardar por separado.`);
    } catch (err) {
      batchItems = [];
      renderTable();
      setButtons();
      status(err.message || "No se pudo interpretar el JSON.", true);
    }
  }

  bulkInput.placeholder = '[{"cliente":"GALVEZ FILM S.A.C.","tipo":"MANUAL","codigo":"1812C029TD","formato":"","lote":"090926/R9-2JC"},{"cliente":"CS SOLUCIONES INDUSTRIALES S.A.C.","tipo":"MANUAL","codigo":"2012C0170TD","formato":"","lote":"090926/E4-2RQ"}]';
  const help = document.querySelector(".bulk-help");
  if (help) help.innerHTML = 'Pegue el JSON generado por la IA. Puede revisar o eliminar registros puntuales. <strong>Guardar PDFs separados</strong> crea un archivo por certificado respetando el nombre individual.';

  btnLoad.addEventListener("click", loadAll, true);
  btnPrint?.addEventListener("click", printAll, true);
  btnPdf?.addEventListener("click", savePdfsSeparately, true);

  window.SamplastLotesV3 = { parseInput, decodeCodigo, normTipo, inferTipo, parseFormatoString };
})();
