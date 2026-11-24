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

    // La función central ya usa el corto personalizado sin alterar la razón social.
    return window.buildPdfFilename(window.getFormData());
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

    // El nombre se resuelve en buildPdfFilename: no se modifica el formulario durante el guardado.

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