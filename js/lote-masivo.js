// SAMPLAST - Modo masivo de certificados
// Permite pegar CLIENTE | CODIGO | LOTE, decodificar etiquetas MANUAL y generar varios certificados.

(() => {
  "use strict";

  const MICRON_BY_CODE = {
    "01": "8", "02": "9", "03": "10", "04": "12", "05": "13", "06": "14",
    "07": "15", "08": "16", "09": "17", "10": "18", "11": "19", "12": "20",
    "13": "22", "14": "23", "15": "25", "16": "28", "17": "30", "18": "35",
    "19": "40", "20": "45", "21": "48", "22": "50",
  };

  const form = document.getElementById("cert-form");
  const loteInput = document.getElementById("lote");
  const loteDateStatus = document.getElementById("lote-date-status");
  const bulkInput = document.getElementById("bulk-input");
  const bulkStatus = document.getElementById("bulk-status");
  const bulkTableContainer = document.getElementById("bulk-table-container");
  const btnBulkLoad = document.getElementById("btn-bulk-load");
  const btnBulkPrint = document.getElementById("btn-bulk-print");
  const btnBulkPdf = document.getElementById("btn-bulk-pdf");
  const batchPrintRoot = document.getElementById("batch-print-root");

  if (!form || !loteInput) return;

  let batchItems = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeLote(raw) {
    return String(raw || "")
      .trim()
      .replace(/^LOTE\s*[:：]?\s*/i, "")
      .replace(/\s+/g, "");
  }

  function normalizeCodigo(raw) {
    return String(raw || "")
      .trim()
      .toUpperCase()
      .replace(/^CODIGO\s*[:：]?\s*/i, "")
      .replace(/\s+/g, "");
  }

  function parseDateFromLote(rawLote) {
    const lote = normalizeLote(rawLote);
    const match = lote.match(/^(\d{2})(\d{2})(\d{2})(?:\/|$)/);
    if (!match) return "";

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = 2000 + Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return "";
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function addOneDay(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function formatIsoDate(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  }

  function decodeCodigo(rawCodigo) {
    const codigo = normalizeCodigo(rawCodigo);
    const match = codigo.match(/^(\d{2})(\d{2})C(\d{3})([A-Z0-9]+)$/);

    if (!match) {
      return { error: `Código no reconocido: ${codigo || "vacío"}` };
    }

    const ancho = match[1];
    const codigoEspesor = match[2];
    const pesoRaw = match[3];
    const sufijo = match[4];
    const espesor = MICRON_BY_CODE[codigoEspesor];

    if (!espesor) {
      return { error: `Código de espesor ${codigoEspesor} fuera de tabla 01-22` };
    }

    const pesoNumber = Number(pesoRaw) / 10;
    if (!Number.isFinite(pesoNumber) || pesoNumber <= 0) {
      return { error: `Peso no válido en código ${codigo}` };
    }

    const peso = pesoNumber.toFixed(1);
    return {
      codigo,
      ancho,
      codigoEspesor,
      espesor,
      peso,
      sufijo,
      formato: `${ancho}*${espesor}*${peso}`,
    };
  }

  function normalizeBulkObject(raw, sourceLine = "") {
    const cliente = String(raw?.cliente ?? raw?.client ?? raw?.empresa ?? "").trim();
    const codigo = normalizeCodigo(raw?.codigo ?? raw?.codigo_raw ?? raw?.code ?? "");
    const lote = normalizeLote(raw?.lote ?? raw?.lote_raw ?? raw?.lot ?? "");
    const tipo = String(raw?.tipo || "MANUAL").trim().toUpperCase();

    if (!cliente || !codigo || !lote) {
      return {
        cliente,
        codigo,
        lote,
        sourceLine,
        error: "Falta CLIENTE, CODIGO o LOTE",
      };
    }

    if (tipo !== "MANUAL") {
      return {
        cliente,
        codigo,
        lote,
        tipo,
        sourceLine,
        error: `El modo masivo automático está validado por ahora para MANUAL; recibido: ${tipo}`,
      };
    }

    const decoded = decodeCodigo(codigo);
    if (decoded.error) {
      return { cliente, codigo, lote, tipo, sourceLine, error: decoded.error };
    }

    const fechaFab = parseDateFromLote(lote);
    if (!fechaFab) {
      return {
        cliente,
        codigo,
        lote,
        tipo,
        sourceLine,
        error: `No se pudo obtener una fecha DDMMAA válida desde ${lote}`,
      };
    }

    return {
      cliente,
      codigo: decoded.codigo,
      lote,
      tipo: "MANUAL",
      color: "",
      ancho: decoded.ancho,
      espesor: decoded.espesor,
      peso: decoded.peso,
      formato: decoded.formato,
      fechaFab,
      fechaEmision: addOneDay(fechaFab),
      sourceLine,
      error: "",
    };
  }

  function parseBulkText(text) {
    const rawText = String(text || "").trim();
    if (!rawText) return [];

    if (rawText.startsWith("[") || rawText.startsWith("{")) {
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (error) {
        throw new Error(`JSON inválido: ${error.message}`);
      }

      let rows = parsed;
      if (!Array.isArray(rows)) {
        rows = parsed.certificados || parsed.items || parsed.lotes || [];
      }
      if (!Array.isArray(rows)) {
        throw new Error("El JSON debe ser una lista o contener certificados/items/lotes.");
      }
      return rows.map((row, index) => normalizeBulkObject(row, `JSON #${index + 1}`));
    }

    return rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const cleanLine = line.replace(/^[-•]\s*/, "");
        const parts = cleanLine.split("|").map((part) => part.trim());
        if (parts.length < 3) {
          return {
            cliente: parts[0] || "",
            codigo: parts[1] || "",
            lote: parts[2] || "",
            sourceLine: line,
            error: "Formato esperado: CLIENTE | CODIGO | LOTE",
          };
        }
        return normalizeBulkObject(
          {
            cliente: parts[0],
            codigo: parts[1],
            lote: parts.slice(2).join("|").trim(),
          },
          line
        );
      });
  }

  function setBulkStatus(message, isError = false) {
    if (!bulkStatus) return;
    bulkStatus.textContent = message;
    bulkStatus.classList.toggle("is-error", Boolean(isError));
    bulkStatus.classList.toggle("is-ok", Boolean(message) && !isError);
  }

  function updateBulkButtons() {
    const ready = batchItems.length > 0 && batchItems.every((item) => !item.error);
    if (btnBulkPrint) btnBulkPrint.disabled = !ready;
    if (btnBulkPdf) btnBulkPdf.disabled = !ready;
  }

  function renderBulkTable() {
    if (!bulkTableContainer) return;
    if (!batchItems.length) {
      bulkTableContainer.hidden = true;
      bulkTableContainer.innerHTML = "";
      return;
    }

    const rowsHtml = batchItems.map((item, index) => {
      const status = item.error
        ? `<span class="bulk-row-error">${escapeHtml(item.error)}</span>`
        : `<span class="bulk-row-ok">Listo</span>`;
      const producto = item.error
        ? "—"
        : `${escapeHtml(item.ancho)}\" · ${escapeHtml(item.espesor)} µm · ${escapeHtml(item.peso)} kg`;
      const fecha = item.error ? "—" : formatIsoDate(item.fechaFab);
      const action = item.error
        ? ""
        : `<button type="button" class="bulk-row-load" data-index="${index}">Ver</button>`;

      return `
        <tr class="${item.error ? "has-error" : ""}">
          <td>${index + 1}</td>
          <td>${escapeHtml(item.cliente)}</td>
          <td><code>${escapeHtml(item.codigo)}</code></td>
          <td><code>${escapeHtml(item.lote)}</code></td>
          <td>${escapeHtml(fecha)}</td>
          <td>${producto}</td>
          <td>${status}</td>
          <td>${action}</td>
        </tr>`;
    }).join("");

    bulkTableContainer.innerHTML = `
      <table class="bulk-table">
        <thead>
          <tr>
            <th>#</th><th>Cliente</th><th>Código</th><th>Lote</th><th>Fabricación</th><th>Producto</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
    bulkTableContainer.hidden = false;

    bulkTableContainer.querySelectorAll(".bulk-row-load").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const item = batchItems[index];
        if (item && !item.error) {
          loadItemIntoForm(item);
          document.getElementById("cert-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function loadItemIntoForm(item) {
    if (!item || item.error) return;

    form.cliente.value = item.cliente;
    form.fecha_fabricacion.value = item.fechaFab;
    form.fecha_emision.value = item.fechaEmision;
    form.tipo.value = "MANUAL";
    if (form.color) form.color.value = "";
    form.formato_etiqueta.value = item.formato;
    form.ancho.value = item.ancho;
    form.espesor.value = item.espesor;
    form.peso.value = item.peso;
    form.lote.value = item.lote;
    form.lote.dataset.manual = "1";

    if (typeof window.applyTipoRules === "function") window.applyTipoRules();
    if (typeof window.applyFormatoToFields === "function") window.applyFormatoToFields();
    if (typeof window.updatePreview === "function") window.updatePreview();

    if (loteDateStatus) {
      loteDateStatus.textContent = `Fecha detectada: ${formatIsoDate(item.fechaFab)} · Emisión: ${formatIsoDate(item.fechaEmision)}`;
      loteDateStatus.classList.remove("is-error");
    }
  }

  function saveFormState() {
    const state = {};
    for (const element of Array.from(form.elements)) {
      if (!element.name) continue;
      if (["button", "submit", "file"].includes(element.type)) continue;
      state[element.name] = element.value;
    }
    state.__loteManual = form.lote?.dataset.manual || "";
    return state;
  }

  function restoreFormState(state) {
    if (!state) return;
    for (const [name, value] of Object.entries(state)) {
      if (name.startsWith("__")) continue;
      const element = form.elements.namedItem(name);
      if (element && typeof element.value !== "undefined") element.value = value;
    }
    if (form.lote) form.lote.dataset.manual = state.__loteManual || "";
    if (typeof window.applyTipoRules === "function") window.applyTipoRules();
    if (typeof window.applyFormatoToFields === "function") window.applyFormatoToFields();
    if (typeof window.updatePreview === "function") window.updatePreview();
  }

  function nextPaint() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  async function buildBatchPages() {
    if (!batchPrintRoot) throw new Error("No se encontró el contenedor de impresión masiva.");
    if (!batchItems.length || batchItems.some((item) => item.error)) {
      throw new Error("Primero cargue y corrija todos los registros del lote masivo.");
    }

    const originalState = saveFormState();
    batchPrintRoot.innerHTML = "";

    try {
      for (let index = 0; index < batchItems.length; index += 1) {
        const item = batchItems[index];
        loadItemIntoForm(item);
        await nextPaint();

        const source = document.getElementById("cert-print-area");
        if (!source) throw new Error(`No se pudo renderizar el certificado ${index + 1}.`);

        const clone = source.cloneNode(true);
        clone.removeAttribute("id");
        clone.classList.add("batch-cert-page");
        clone.dataset.batchIndex = String(index + 1);
        batchPrintRoot.appendChild(clone);
      }
    } finally {
      restoreFormState(originalState);
    }

    return batchPrintRoot;
  }

  function ensureBatchPageStyle(orientation = "portrait") {
    let style = document.getElementById("batch-page-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "batch-page-style";
      document.head.appendChild(style);
    }
    style.textContent = `@page { size: A4 ${orientation}; margin: 6mm; }`;
  }

  async function printBatch() {
    if (!btnBulkPrint) return;
    const originalText = btnBulkPrint.textContent;
    try {
      btnBulkPrint.disabled = true;
      btnBulkPrint.textContent = "Preparando…";
      setBulkStatus(`Preparando ${batchItems.length} certificados para imprimir…`);

      await buildBatchPages();
      const orientation = form.pdf_orientation?.value === "landscape" ? "landscape" : "portrait";
      ensureBatchPageStyle(orientation);

      batchPrintRoot.setAttribute("aria-hidden", "false");
      document.body.classList.add("batch-print-mode");
      await nextPaint();

      const cleanup = () => {
        document.body.classList.remove("batch-print-mode");
        batchPrintRoot.setAttribute("aria-hidden", "true");
        btnBulkPrint.disabled = false;
        btnBulkPrint.textContent = originalText;
      };
      window.addEventListener("afterprint", cleanup, { once: true });
      window.print();
      setBulkStatus(`${batchItems.length} certificados enviados al diálogo de impresión.`);
    } catch (error) {
      console.error(error);
      document.body.classList.remove("batch-print-mode");
      batchPrintRoot?.setAttribute("aria-hidden", "true");
      btnBulkPrint.disabled = false;
      btnBulkPrint.textContent = originalText;
      setBulkStatus(error.message || "No se pudo imprimir el lote.", true);
    }
  }

  function buildBatchFilename() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    return `CERTIFICADOS_${dd}-${mm}-${yy}_${batchItems.length}.pdf`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportBatchPdf() {
    if (!btnBulkPdf) return;
    if (typeof html2pdf === "undefined") {
      setBulkStatus("No se cargó la librería para generar PDF.", true);
      return;
    }

    const originalText = btnBulkPdf.textContent;
    try {
      btnBulkPdf.disabled = true;
      btnBulkPdf.textContent = "Generando…";
      setBulkStatus(`Generando PDF con ${batchItems.length} páginas…`);

      const root = await buildBatchPages();
      const orientation = form.pdf_orientation?.value === "landscape" ? "landscape" : "portrait";
      document.body.classList.add("batch-pdf-mode");
      root.setAttribute("aria-hidden", "false");
      await nextPaint();

      const options = {
        margin: 0,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          useCORS: false,
          allowTaint: false,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation,
        },
        pagebreak: { mode: ["css", "legacy"] },
      };

      const blob = await html2pdf().set(options).from(root).outputPdf("blob");
      if (!blob || blob.size < 1000) throw new Error("El PDF generado salió vacío.");

      const filename = buildBatchFilename();
      downloadBlob(blob, filename);
      setBulkStatus(`PDF generado: ${filename}`);
    } catch (error) {
      console.error(error);
      setBulkStatus(`Error al generar PDF: ${error.message || "desconocido"}`, true);
    } finally {
      document.body.classList.remove("batch-pdf-mode");
      batchPrintRoot?.setAttribute("aria-hidden", "true");
      if (btnBulkPdf) {
        btnBulkPdf.disabled = false;
        btnBulkPdf.textContent = originalText;
      }
    }
  }

  function updateIndividualDatesFromLote() {
    const raw = loteInput.value;
    if (!raw.trim()) {
      if (loteDateStatus) loteDateStatus.textContent = "";
      return;
    }

    const fechaFab = parseDateFromLote(raw);
    if (!fechaFab) {
      if (loteDateStatus && normalizeLote(raw).length >= 6) {
        loteDateStatus.textContent = "No se reconoce una fecha DDMMAA válida al inicio del lote.";
        loteDateStatus.classList.add("is-error");
      }
      return;
    }

    const fechaEmision = addOneDay(fechaFab);
    form.fecha_fabricacion.value = fechaFab;
    form.fecha_emision.value = fechaEmision;
    if (loteDateStatus) {
      loteDateStatus.textContent = `Fecha detectada: ${formatIsoDate(fechaFab)} · Emisión: ${formatIsoDate(fechaEmision)}`;
      loteDateStatus.classList.remove("is-error");
    }
    if (typeof window.updatePreview === "function") window.updatePreview();
  }

  if (btnBulkLoad && bulkInput) {
    btnBulkLoad.addEventListener("click", () => {
      try {
        batchItems = parseBulkText(bulkInput.value);
        renderBulkTable();
        updateBulkButtons();

        if (!batchItems.length) {
          setBulkStatus("Pegue al menos una línea CLIENTE | CODIGO | LOTE.", true);
          return;
        }

        const errors = batchItems.filter((item) => item.error);
        if (errors.length) {
          setBulkStatus(`${batchItems.length - errors.length} listos y ${errors.length} con error. Corrija las líneas marcadas antes de imprimir.`, true);
          return;
        }

        loadItemIntoForm(batchItems[0]);
        setBulkStatus(`${batchItems.length} certificados listos. Revise la tabla y luego imprima o guarde el PDF.`);
      } catch (error) {
        batchItems = [];
        renderBulkTable();
        updateBulkButtons();
        setBulkStatus(error.message || "No se pudo interpretar el bloque pegado.", true);
      }
    });
  }

  btnBulkPrint?.addEventListener("click", printBatch);
  btnBulkPdf?.addEventListener("click", exportBatchPdf);
  loteInput.addEventListener("input", updateIndividualDatesFromLote);
  loteInput.addEventListener("change", updateIndividualDatesFromLote);

  // Utilidades expuestas para diagnóstico y futuras integraciones.
  window.SamplastLotes = {
    parseDateFromLote,
    decodeCodigo,
    parseBulkText,
  };
})();