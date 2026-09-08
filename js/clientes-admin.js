// SAMPLAST - Gestión local de clientes + prompt dinámico para IA
(() => {
  "use strict";

  const STORAGE_KEY = "samplast_clientes_personalizados_v1";
  const DEFAULT_EXTRA_CLIENTS = [
    { cliente: "ITS", corto: "ITS" },
    { cliente: "PRODUCTORA DE ALIMENTOS", corto: "PRODUCTORA" },
    { cliente: "INDUSTRIAS QUIMICA MENDOZA", corto: "MENDOZA" },
  ];

  const promptText = document.getElementById("ia-prompt-text");
  const promptCount = document.getElementById("ia-prompt-client-count");
  const copyPromptBtn = document.getElementById("btn-copy-ia-prompt");
  const copyPromptStatus = document.getElementById("copy-prompt-status");

  const clientNameInput = document.getElementById("nuevo-cliente-nombre");
  const clientShortInput = document.getElementById("nuevo-cliente-corto");
  const addClientBtn = document.getElementById("btn-add-client");
  const clientsStatus = document.getElementById("clientes-status");
  const customClientsList = document.getElementById("clientes-personalizados-list");
  const totalClientsEl = document.getElementById("clientes-total");

  function safeBaseClients() {
    try {
      const base = typeof CLIENTES_DB !== "undefined" && Array.isArray(CLIENTES_DB)
        ? CLIENTES_DB
        : [];
      return [...base, ...DEFAULT_EXTRA_CLIENTS]
        .map((item) => ({
          cliente: String(item?.cliente || "").trim(),
          corto: String(item?.corto || "").trim(),
          origen: "base",
        }))
        .filter((item) => item.cliente);
    } catch (_) {
      return DEFAULT_EXTRA_CLIENTS.map((item) => ({ ...item, origen: "base" }));
    }
  }

  function loadCustomClients() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => ({
          cliente: String(item?.cliente || "").trim(),
          corto: String(item?.corto || "").trim(),
          origen: "personalizado",
        }))
        .filter((item) => item.cliente);
    } catch (error) {
      console.warn("No se pudieron leer clientes personalizados:", error);
      return [];
    }
  }

  function saveCustomClients(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(({ cliente, corto }) => ({ cliente, corto }))));
  }

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function getAllClients() {
    const combined = [...safeBaseClients(), ...loadCustomClients()];
    const seen = new Set();
    return combined
      .filter((item) => {
        const key = normalizeKey(item.cliente);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.cliente.localeCompare(b.cliente, "es", { sensitivity: "base" }));
  }

  function refreshDatalist() {
    const datalist = document.getElementById("clientes-list");
    if (!datalist) return;
    datalist.innerHTML = "";
    getAllClients().forEach((item) => {
      const option = document.createElement("option");
      option.value = item.cliente;
      if (item.corto) option.label = item.corto;
      datalist.appendChild(option);
    });
  }

  function buildPrompt() {
    const clients = getAllClients();
    const clientLines = clients
      .map((item) => item.corto
        ? `- ${item.cliente} | alias/corto: ${item.corto}`
        : `- ${item.cliente}`)
      .join("\n");

    return `PROMPT — SAMPLAST / TRANSCRIPCIÓN MASIVA DE CAPTURAS PARA IMPORTAR AL HTML\n\nOBJETIVO\nVoy a adjuntarte una o varias capturas de WhatsApp y/o fotos de etiquetas de producción SAMPLAST. Debes identificar cada etiqueta física y devolver los datos listos para pegarlos en el modo \"Lote masivo\" de mi página web.\n\nSALIDA OBLIGATORIA\nDevuelve ÚNICAMENTE JSON válido, sin Markdown, sin explicaciones, sin bloques de código y sin texto antes o después.\n\nUsa exactamente esta estructura:\n[\n  {\"cliente\":\"NOMBRE DEL CLIENTE\",\"codigo\":\"2010C030TD\",\"lote\":\"040926/R1-2DC\"}\n]\n\nREGLAS DE LECTURA\n1. Debe existir UN objeto JSON por CADA etiqueta física visible. Si hay 5 etiquetas, devuelve exactamente 5 objetos.\n2. Lee el cliente desde el mensaje de WhatsApp relacionado con la foto o grupo de fotos. Frases como \"De PRODUCTORA DE ALIMENTOS\", \"También te envío de INDUSTRIAS QUIMICA MENDOZA\" o \"Buen día te envío ITS\" indican el cliente.\n3. Si un mensaje de cliente precede a varias fotos, ese cliente se repite en cada objeto correspondiente hasta que aparezca un nuevo mensaje que cambie el cliente.\n4. De la etiqueta física extrae solamente:\n   - codigo: texto completo después de CODIGO:\n   - lote: texto completo después de LOTE:\n5. NO calcules ancho, micras, peso, fecha de fabricación ni fecha de emisión. La web SAMPLAST hará esos cálculos automáticamente.\n6. Conserva CODIGO y LOTE exactamente como aparecen, eliminando únicamente espacios accidentales.\n7. Si el nombre visto en WhatsApp coincide claramente con un cliente de la lista de CLIENTES CONOCIDOS, usa EXACTAMENTE el nombre oficial de esa lista. Puedes ayudarte con el alias/corto indicado.\n8. Si el cliente es legible pero NO aparece en CLIENTES CONOCIDOS, conserva el nombre tal como se ve en WhatsApp. NO inventes una razón social.\n9. Si no puedes determinar el cliente con seguridad, usa \"REVISAR_CLIENTE\".\n10. Si CODIGO o LOTE están borrosos o dudosos, usa \"REVISAR\" solamente en el campo dudoso. Nunca inventes caracteres.\n11. Ignora horas de WhatsApp, emojis, saludos, nombres de archivo y cualquier texto que no sea cliente, CODIGO o LOTE.\n12. Aunque haya dos fotos visualmente parecidas, si son dos etiquetas distintas deben ser dos objetos JSON.\n13. Antes de responder, cuenta las etiquetas físicas y confirma internamente que el número de objetos JSON sea el mismo.\n\nEJEMPLO\nSi las capturas muestran dos etiquetas de PRODUCTORA DE ALIMENTOS y una de INDUSTRIAS QUIMICA MENDOZA, la respuesta debe tener esta forma:\n[\n  {\"cliente\":\"PRODUCTORA DE ALIMENTOS\",\"codigo\":\"2010C030TD\",\"lote\":\"290826/R1-1DC\"},\n  {\"cliente\":\"PRODUCTORA DE ALIMENTOS\",\"codigo\":\"2010C030TD\",\"lote\":\"040926/R1-2DC\"},\n  {\"cliente\":\"INDUSTRIAS QUIMICA MENDOZA\",\"codigo\":\"2004C015TD\",\"lote\":\"070926/R1-2IS\"}\n]\n\nCLIENTES CONOCIDOS ACTUALES (${clients.length})\nUsa esta lista para normalizar el nombre del cliente cuando haya una coincidencia clara:\n${clientLines}\n\nRECUERDA: responde SOLO con el JSON final válido.`;
  }

  function refreshPrompt() {
    const prompt = buildPrompt();
    if (promptText) promptText.value = prompt;
    const total = getAllClients().length;
    if (promptCount) promptCount.textContent = String(total);
    if (totalClientsEl) totalClientsEl.textContent = String(total);
  }

  function setClientStatus(message, isError = false) {
    if (!clientsStatus) return;
    clientsStatus.textContent = message;
    clientsStatus.classList.toggle("is-error", isError);
    clientsStatus.classList.toggle("is-ok", Boolean(message) && !isError);
  }

  function renderCustomClients() {
    if (!customClientsList) return;
    const custom = loadCustomClients();
    if (!custom.length) {
      customClientsList.innerHTML = '<p class="clientes-empty">Todavía no has añadido clientes nuevos en este navegador.</p>';
      return;
    }

    customClientsList.innerHTML = custom.map((item, index) => `
      <div class="cliente-custom-row">
        <div>
          <strong>${escapeHtml(item.cliente)}</strong>
          ${item.corto ? `<span>${escapeHtml(item.corto)}</span>` : ""}
        </div>
        <button type="button" class="cliente-delete-btn" data-index="${index}" title="Eliminar cliente añadido">Eliminar</button>
      </div>
    `).join("");

    customClientsList.querySelectorAll(".cliente-delete-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const items = loadCustomClients();
        const removed = items[index];
        if (!removed) return;
        items.splice(index, 1);
        saveCustomClients(items);
        refreshAll();
        setClientStatus(`Cliente eliminado: ${removed.cliente}`);
      });
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function addClient() {
    const cliente = String(clientNameInput?.value || "").trim();
    const corto = String(clientShortInput?.value || "").trim().toUpperCase();

    if (!cliente) {
      setClientStatus("Escriba el nombre del cliente.", true);
      clientNameInput?.focus();
      return;
    }

    const key = normalizeKey(cliente);
    const all = getAllClients();
    if (all.some((item) => normalizeKey(item.cliente) === key)) {
      setClientStatus("Ese cliente ya existe en la base actual.", true);
      return;
    }

    const custom = loadCustomClients();
    custom.push({ cliente, corto, origen: "personalizado" });
    saveCustomClients(custom);

    if (clientNameInput) clientNameInput.value = "";
    if (clientShortInput) clientShortInput.value = "";

    refreshAll();
    setClientStatus(`Cliente añadido: ${cliente}. Ya aparece en el autocompletado y en el prompt.`);
  }

  async function copyPrompt() {
    const text = buildPrompt();
    try {
      await navigator.clipboard.writeText(text);
      if (copyPromptStatus) copyPromptStatus.textContent = `Prompt copiado completo con ${getAllClients().length} clientes.`;
    } catch (_) {
      if (promptText) {
        promptText.focus();
        promptText.select();
        document.execCommand("copy");
        if (copyPromptStatus) copyPromptStatus.textContent = "Prompt seleccionado/copiado. Si el navegador lo bloqueó, use Ctrl+C.";
      }
    }
  }

  function refreshAll() {
    refreshDatalist();
    renderCustomClients();
    refreshPrompt();
  }

  addClientBtn?.addEventListener("click", addClient);
  clientNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addClient();
    }
  });
  clientShortInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addClient();
    }
  });
  copyPromptBtn?.addEventListener("click", copyPrompt);

  refreshAll();

  window.SamplastClientes = {
    getAll: getAllClients,
    getCustom: loadCustomClients,
    refresh: refreshAll,
    buildPrompt,
  };
})();
