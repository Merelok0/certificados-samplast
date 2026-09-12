// SAMPLAST - Prioridad del nombre corto personalizado al nombrar PDFs.
(() => {
  "use strict";

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function getCustomShort(cliente) {
    try {
      const items = window.SamplastClientes?.getCustom?.() || [];
      const key = normalizeKey(cliente);
      const match = items.find(x => normalizeKey(x?.cliente) === key);
      return String(match?.corto || "").trim().toUpperCase();
    } catch (_) {
      return "";
    }
  }

  function buildFilenameWithCustomShort() {
    const clientInput = document.getElementById("cliente");
    if (!clientInput) return "";
    if (typeof window.buildPdfFilename !== "function" || typeof window.getFormData !== "function") return "";

    const officialName = clientInput.value;
    const shortName = getCustomShort(officialName);
    if (!shortName) return "";

    // Reutiliza exactamente la lógica oficial de nombres del sistema.
    // Solo sustituye temporalmente el cliente para calcular el nombre del archivo;
    // el certificado mostrado mantiene la razón social completa.
    clientInput.value = shortName;
    try {
      return window.buildPdfFilename(window.getFormData());
    } finally {
      clientInput.value = officialName;
    }
  }

  function refreshPdfNamePreview() {
    const output = document.getElementById("pdf-name-preview");
    if (!output) return;
    const filename = buildFilenameWithCustomShort();
    if (filename && output.textContent !== filename) {
      output.textContent = filename;
    }
  }

  function install() {
    const form = document.getElementById("cert-form");
    const output = document.getElementById("pdf-name-preview");
    const clientInput = document.getElementById("cliente");
    const pdfButton = document.getElementById("btn-pdf");

    if (output) {
      const observer = new MutationObserver(() => {
        queueMicrotask(refreshPdfNamePreview);
      });
      observer.observe(output, { childList: true, characterData: true, subtree: true });
    }

    if (form) {
      const refreshSoon = () => setTimeout(refreshPdfNamePreview, 0);
      form.addEventListener("input", refreshSoon);
      form.addEventListener("change", refreshSoon);
    }

    // El guardado individual usa la función original del proyecto, pero calcula
    // el nombre con el corto personalizado antes de abrir Guardar como.
    pdfButton?.addEventListener("click", (event) => {
      if (!clientInput || typeof window.exportPdf !== "function") return;
      const officialName = clientInput.value;
      const shortName = getCustomShort(officialName);
      if (!shortName) return; // clientes de la base siguen usando la lógica anterior

      event.preventDefault();
      event.stopImmediatePropagation();

      clientInput.value = shortName;
      let result;
      try {
        result = window.exportPdf();
      } catch (error) {
        clientInput.value = officialName;
        throw error;
      }

      Promise.resolve(result).finally(() => {
        clientInput.value = officialName;
        setTimeout(refreshPdfNamePreview, 0);
      });
    }, true);

    refreshPdfNamePreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }

  window.SamplastPdfNombres = {
    getCustomShort,
    refresh: refreshPdfNamePreview
  };
})();