// SAMPLAST - Administración de clientes v2: altas, bajas locales y prompt robusto para IA.
(() => {
  "use strict";

  const CUSTOM_KEY = "samplast_clientes_personalizados_v1";
  const HIDDEN_KEY = "samplast_clientes_ocultos_v1";
  const DEFAULT_EXTRA_CLIENTS = [
    { cliente: "ITS", corto: "ITS" },
    { cliente: "PRODUCTORA DE ALIMENTOS", corto: "PRODUCTORA" },
    { cliente: "INDUSTRIAS QUIMICA MENDOZA", corto: "MENDOZA" },
    { cliente: "BIIPLAST", corto: "BIIPLAST" }
  ];

  const promptText = document.getElementById("ia-prompt-text");
  const promptCount = document.getElementById("ia-prompt-client-count");
  const copyPromptBtn = document.getElementById("btn-copy-ia-prompt");
  const copyPromptStatus = document.getElementById("copy-prompt-status");
  const clientNameInput = document.getElementById("nuevo-cliente-nombre");
  const clientShortInput = document.getElementById("nuevo-cliente-corto");
  const addClientBtn = document.getElementById("btn-add-client");
  const clientsStatus = document.getElementById("clientes-status");
  const clientsList = document.getElementById("clientes-personalizados-list");
  const totalClientsEl = document.getElementById("clientes-total");
  const searchInput = document.getElementById("buscar-cliente-admin");
  const restoreBtn = document.getElementById("btn-restore-hidden-clients");
  const hiddenCountEl = document.getElementById("clientes-ocultos-total");

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function safeBaseClients() {
    try {
      const base = typeof CLIENTES_DB !== "undefined" && Array.isArray(CLIENTES_DB) ? CLIENTES_DB : [];
      return [...base, ...DEFAULT_EXTRA_CLIENTS]
        .map(x => ({ cliente: String(x?.cliente || "").trim(), corto: String(x?.corto || "").trim(), origen: "base" }))
        .filter(x => x.cliente);
    } catch (_) {
      return DEFAULT_EXTRA_CLIENTS.map(x => ({ ...x, origen: "base" }));
    }
  }

  function loadCustomClients() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
      return Array.isArray(parsed)
        ? parsed.map(x => ({ cliente: String(x?.cliente || "").trim(), corto: String(x?.corto || "").trim(), origen: "personalizado" })).filter(x => x.cliente)
        : [];
    } catch (_) {
      return [];
    }
  }

  function saveCustomClients(items) {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(items.map(({cliente,corto}) => ({cliente,corto}))));
  }

  function loadHiddenKeys() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (_) {
      return [];
    }
  }

  function saveHiddenKeys(keys) {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify([...new Set(keys)]));
  }

  function getAllClients() {
    const hidden = new Set(loadHiddenKeys());
    const seen = new Set();
    const out = [];

    // Los personalizados van primero para permitir corregir/reemplazar un nombre base ocultado.
    for (const item of loadCustomClients()) {
      const key = normalizeKey(item.cliente);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }

    for (const item of safeBaseClients()) {
      const key = normalizeKey(item.cliente);
      if (!key || hidden.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }

    return out.sort((a,b) => a.cliente.localeCompare(b.cliente, "es", {sensitivity:"base"}));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function refreshDatalist() {
    const datalist = document.getElementById("clientes-list");
    if (!datalist) return;
    datalist.innerHTML = "";
    getAllClients().forEach(item => {
      const option = document.createElement("option");
      option.value = item.cliente;
      if (item.corto) option.label = item.corto;
      datalist.appendChild(option);
    });
  }

  function buildPrompt() {
    const clients = getAllClients();
    const clientLines = clients
      .map(x => x.corto ? `- ${x.cliente} | corto: ${x.corto}` : `- ${x.cliente}`)
      .join("\n");

    return `INSTRUCTIVO — SAMPLAST / TRANSCRIPCIÓN MASIVA DE ETIQUETAS\n\nOBJETIVO\nVoy a adjuntar capturas de WhatsApp y/o fotos de etiquetas. Debes devolver los datos listos para pegar en \"Carga masiva\".\n\nSALIDA OBLIGATORIA\nDevuelve ÚNICAMENTE JSON válido. Sin Markdown, comentarios ni explicaciones. Un objeto por cada etiqueta física.\n\nFORMATO\n[\n  {\"cliente\":\"NOMBRE OFICIAL\",\"tipo\":\"MANUAL\",\"color\":\"\",\"codigo\":\"2012C030TD\",\"formato\":\"\",\"lote\":\"080926/R1-1DC\"}\n]\n\nTIPOS PERMITIDOS\n- MANUAL\n- AUTOMATICO\n- PRE-ESTIRADO\n- MANUAL_COLOR\n- REVISAR, solo si de verdad no puede determinarse\n\nREGLA CRÍTICA SOBRE CODIGOS\nHay dos clases de etiqueta y NO debes confundirlas:\n\nA) ETIQUETA CON CODIGO TECNICO SAMPLAST\nEjemplos: 2012C030TD, 1812C029TD, 2014C0160TG.\n- Ese valor sí va en \"codigo\".\n- Normalmente deja \"formato\" vacío.\n\nB) ETIQUETA CON MEDIDAS DIRECTAS Y CODIGO SAP\nEjemplo: \"STF MANUAL 06\\\"\", \"06\\\" x 20 x 0.60 KG\", \"CODIGO SAP: P00447\".\n- El CODIGO SAP tipo P00447, P00651, etc. NO sirve para generar el certificado. IGNÓRALO.\n- En estos casos deja \"codigo\":\"\".\n- Lee las medidas impresas y colócalas en \"formato\" como ancho*espesor*peso.\n- Ejemplo: 06\\\" x 20 x 0.60 KG → \"formato\":\"06*20*0.60\".\n- Si aparece \"LT:\" úsalo como lote igual que si dijera \"LOTE:\".\n- Ignora CANTIDAD, UND.MED, CODIGO SAP y cualquier número que no sea ancho, espesor, peso o lote.\n\nREGLAS DE TIPO\n1. STFM, STMF, STF MANUAL o STRETCH FILM MANUAL → MANUAL.\n2. AUTOMATICO / AUTOMÁTICO → AUTOMATICO.\n3. PRE-ESTIRADO / PRE ESTIRADO → PRE-ESTIRADO.\n4. STF NEGRO / ROJO / AZUL / VERDE / AMARILLO → MANUAL_COLOR y usa ese color.\n5. No asumas MANUAL por defecto si la categoría está visible.\n\nPRE-ESTIRADO\n- Puede no tener CODIGO. Eso es normal.\n- Lee las medidas impresas (ej. 18\\\" X 09 MC X 2.50 KG) y devuelve \"formato\":\"18*09*2.50\".\n- Deja \"codigo\":\"\" si no existe código técnico.\n\nCLIENTE\n1. Toma el cliente del mensaje de WhatsApp que precede a la foto o grupo de fotos.\n2. Si varias fotos pertenecen al mismo mensaje, repite el mismo cliente hasta que otro mensaje cambie el cliente.\n3. Si coincide con la lista de clientes conocidos, usa exactamente el nombre oficial de la lista.\n4. Si el cliente es legible pero no está en la lista, conserva el nombre visible. No inventes razón social.\n\nLOTE Y FECHAS\n- Copia LOTE o LT exactamente, quitando solo espacios accidentales.\n- NO calcules fechas; la página usa los primeros 6 dígitos DDMMAA.\n\nEJEMPLO ANTALIS\nPara una etiqueta que diga STF MANUAL 06\\\", 06\\\" x 20 x 0.60 KG, CODIGO SAP P00447 y LT:140926/R6-1JC, devuelve:\n{\"cliente\":\"ANTALIS TFM S.A.\",\"tipo\":\"MANUAL\",\"color\":\"\",\"codigo\":\"\",\"formato\":\"06*20*0.60\",\"lote\":\"140926/R6-1JC\"}\n\nPara STF NEGRO 09\\\", 09\\\" x 20 x 1.00 KG, CODIGO SAP P00651 y el mismo lote, devuelve:\n{\"cliente\":\"ANTALIS TFM S.A.\",\"tipo\":\"MANUAL_COLOR\",\"color\":\"NEGRO\",\"codigo\":\"\",\"formato\":\"09*20*1.00\",\"lote\":\"140926/R6-1JC\"}\n\nCONTROL FINAL\n- Cuenta las etiquetas físicas y devuelve exactamente el mismo número de objetos.\n- Si algo realmente no se lee, usa REVISAR solo en ese campo.\n- Nunca uses un CODIGO SAP Pxxxxx como codigo técnico.\n\nCLIENTES CONOCIDOS ACTUALES (${clients.length})\n${clientLines}\n\nRESPONDE SOLO CON EL JSON FINAL.`;
  }

  function refreshPrompt() {
    if (promptText) promptText.value = buildPrompt();
    const total = getAllClients().length;
    if (promptCount) promptCount.textContent = String(total);
    if (totalClientsEl) totalClientsEl.textContent = String(total);
    if (hiddenCountEl) hiddenCountEl.textContent = String(loadHiddenKeys().length);
  }

  function setClientStatus(message,error=false) {
    if (!clientsStatus) return;
    clientsStatus.textContent = message;
    clientsStatus.classList.toggle("is-error",error);
    clientsStatus.classList.toggle("is-ok",!!message && !error);
  }

  function deleteClient(item) {
    const key = normalizeKey(item?.cliente);
    if (!key) return;

    if (item.origen === "personalizado") {
      const custom = loadCustomClients().filter(x => normalizeKey(x.cliente) !== key);
      saveCustomClients(custom);
    } else {
      const hidden = loadHiddenKeys();
      if (!hidden.includes(key)) hidden.push(key);
      saveHiddenKeys(hidden);
    }

    refreshAll();
    setClientStatus(`Cliente eliminado de esta instalación: ${item.cliente}`);
  }

  function renderClients() {
    if (!clientsList) return;
    const q = normalizeKey(searchInput?.value || "");
    const all = getAllClients();
    const filtered = q
      ? all.filter(x => normalizeKey(`${x.cliente} ${x.corto}`).includes(q))
      : all;

    if (!filtered.length) {
      clientsList.innerHTML = '<p class="clientes-empty">No se encontraron clientes.</p>';
      return;
    }

    clientsList.innerHTML = filtered.map((x,i) => `
      <div class="cliente-custom-row">
        <div>
          <strong>${escapeHtml(x.cliente)}</strong>
          ${x.corto ? `<span>${escapeHtml(x.corto)}</span>` : ""}
        </div>
        <button type="button" class="cliente-delete-btn" data-index="${i}">Eliminar</button>
      </div>`).join("");

    clientsList.querySelectorAll(".cliente-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = filtered[+btn.dataset.index];
        if (item) deleteClient(item);
      });
    });
  }

  function addClient() {
    const cliente = String(clientNameInput?.value || "").trim();
    const corto = String(clientShortInput?.value || "").trim().toUpperCase();
    if (!cliente) {
      setClientStatus("Escriba el nombre del cliente.",true);
      clientNameInput?.focus();
      return;
    }
    if (!corto) {
      setClientStatus("Escriba el nombre corto.",true);
      clientShortInput?.focus();
      return;
    }
    if (getAllClients().some(x => normalizeKey(x.cliente) === normalizeKey(cliente))) {
      setClientStatus("Ese cliente ya existe en la base actual.",true);
      return;
    }

    const custom = loadCustomClients();
    custom.push({cliente,corto,origen:"personalizado"});
    saveCustomClients(custom);
    if (clientNameInput) clientNameInput.value = "";
    if (clientShortInput) clientShortInput.value = "";
    refreshAll();
    setClientStatus(`Cliente añadido: ${cliente}.`);
  }

  function restoreHidden() {
    localStorage.removeItem(HIDDEN_KEY);
    refreshAll();
    setClientStatus("Clientes eliminados de la base original restaurados.");
  }

  async function copyPrompt() {
    const text = buildPrompt();
    try {
      await navigator.clipboard.writeText(text);
      if (copyPromptStatus) copyPromptStatus.textContent = `Instructivo copiado con ${getAllClients().length} clientes.`;
    } catch (_) {
      if (promptText) {
        promptText.focus();
        promptText.select();
        document.execCommand("copy");
        if (copyPromptStatus) copyPromptStatus.textContent = "Instructivo seleccionado. Si la copia fue bloqueada, use Ctrl+C.";
      }
    }
  }

  function refreshAll() {
    refreshDatalist();
    renderClients();
    refreshPrompt();
    window.SamplastPdfNombres?.refresh?.();
  }

  addClientBtn?.addEventListener("click",addClient);
  clientNameInput?.addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();addClient();} });
  clientShortInput?.addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();addClient();} });
  searchInput?.addEventListener("input",renderClients);
  restoreBtn?.addEventListener("click",restoreHidden);
  copyPromptBtn?.addEventListener("click",copyPrompt);

  refreshAll();

  window.SamplastClientes = {
    getAll: getAllClients,
    getCustom: loadCustomClients,
    getHidden: loadHiddenKeys,
    refresh: refreshAll,
    buildPrompt
  };
})();