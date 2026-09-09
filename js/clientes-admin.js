// SAMPLAST - Gestión local de clientes e instructivo dinámico para IA.
(() => {
  "use strict";

  const STORAGE_KEY = "samplast_clientes_personalizados_v1";
  const DEFAULT_EXTRA_CLIENTS = [
    { cliente: "ITS", corto: "ITS" },
    { cliente: "PRODUCTORA DE ALIMENTOS", corto: "PRODUCTORA" },
    { cliente: "INDUSTRIAS QUIMICA MENDOZA", corto: "MENDOZA" },
    { cliente: "BIIPLAST", corto: "BIIPLAST" },
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

  function normalizeKey(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }
  function safeBaseClients() {
    try {
      const base = typeof CLIENTES_DB !== "undefined" && Array.isArray(CLIENTES_DB) ? CLIENTES_DB : [];
      return [...base, ...DEFAULT_EXTRA_CLIENTS].map(x => ({ cliente: String(x?.cliente || "").trim(), corto: String(x?.corto || "").trim(), origen: "base" })).filter(x => x.cliente);
    } catch (_) {
      return DEFAULT_EXTRA_CLIENTS.map(x => ({ ...x, origen: "base" }));
    }
  }
  function loadCustomClients() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(x => ({ cliente: String(x?.cliente || "").trim(), corto: String(x?.corto || "").trim(), origen: "personalizado" })).filter(x => x.cliente) : [];
    } catch (_) { return []; }
  }
  function saveCustomClients(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(({ cliente, corto }) => ({ cliente, corto }))));
  }
  function getAllClients() {
    const seen = new Set();
    return [...safeBaseClients(), ...loadCustomClients()].filter(x => {
      const key = normalizeKey(x.cliente); if (!key || seen.has(key)) return false; seen.add(key); return true;
    }).sort((a,b) => a.cliente.localeCompare(b.cliente, "es", { sensitivity: "base" }));
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
  }
  function refreshDatalist() {
    const datalist = document.getElementById("clientes-list"); if (!datalist) return;
    datalist.innerHTML = "";
    getAllClients().forEach(item => { const option = document.createElement("option"); option.value = item.cliente; if (item.corto) option.label = item.corto; datalist.appendChild(option); });
  }

  function buildPrompt() {
    const clients = getAllClients();
    const clientLines = clients.map(x => x.corto ? `- ${x.cliente} | alias/corto: ${x.corto}` : `- ${x.cliente}`).join("\n");
    return `INSTRUCTIVO — SAMPLAST / TRANSCRIPCIÓN MASIVA DE CAPTURAS PARA CERTIFICADOS\n\nOBJETIVO\nVoy a adjuntarte una o varias capturas de WhatsApp y/o fotos de etiquetas de producción SAMPLAST. Debes identificar cada etiqueta física y devolver los datos listos para pegar en la sección \"Carga masiva\" de mi página.\n\nSALIDA OBLIGATORIA\nDevuelve ÚNICAMENTE JSON válido. No uses Markdown, bloques de código, explicaciones ni texto antes o después.\n\nCada etiqueta debe devolver exactamente estos campos:\n[\n  {\"cliente\":\"NOMBRE DEL CLIENTE\",\"tipo\":\"MANUAL\",\"color\":\"\",\"codigo\":\"2012C030TD\",\"lote\":\"080926/R1-1DC\"}\n]\n\nVALORES PERMITIDOS PARA tipo\n- MANUAL\n- AUTOMATICO\n- PRE-ESTIRADO\n- MANUAL_COLOR\n- REVISAR, solo si realmente no puede determinarse\n\nREGLAS PARA IDENTIFICAR EL TIPO\n1. NO asumas que todo es MANUAL. Lee el encabezado de CADA etiqueta.\n2. Si la etiqueta dice solamente STFM, STMF o STRETCH FILM sin otra categoría, usa tipo = \"MANUAL\".\n3. Si la etiqueta dice AUTOMATICO / AUTOMÁTICO, por ejemplo \"STRETCH FILM AUTOMATICO 20\\\"\", usa tipo = \"AUTOMATICO\".\n4. Si dice PRE-ESTIRADO, PRE ESTIRADO o PREESTIRADO, usa tipo = \"PRE-ESTIRADO\".\n5. Si identifica explícitamente un film manual de color, usa tipo = \"MANUAL_COLOR\" y completa color con NEGRO, ROJO, AZUL, VERDE o AMARILLO.\n6. Un mismo cliente puede tener etiquetas de tipos distintos. No copies el tipo de una foto a las demás.\n7. Si no puedes leer el tipo con seguridad, usa \"REVISAR\". Nunca lo conviertas por defecto a MANUAL.\n\nREGLAS DE LECTURA\n1. Debe existir UN objeto JSON por CADA etiqueta física visible.\n2. Lee el cliente desde el mensaje de WhatsApp relacionado con la foto o grupo de fotos.\n3. Si un mensaje de cliente precede a varias fotos, repite ese cliente hasta que aparezca otro mensaje que cambie de cliente.\n4. De cada etiqueta extrae tipo, color cuando corresponda, codigo y lote.\n5. NO calcules ancho, micras, peso ni fechas. La página SAMPLAST hará esos cálculos.\n6. Conserva CODIGO y LOTE exactamente como aparecen, quitando solo espacios accidentales.\n7. Si el nombre coincide claramente con CLIENTES CONOCIDOS, usa exactamente el nombre oficial de la lista.\n8. Si el cliente es legible pero no está en la lista, conserva el nombre visible; no inventes una razón social.\n9. Si el cliente no puede determinarse, usa \"REVISAR_CLIENTE\".\n10. Si CODIGO o LOTE son dudosos, usa \"REVISAR\" solo en ese campo; nunca inventes caracteres.\n11. Ignora horas, emojis, saludos y otros textos ajenos a los datos.\n12. Antes de responder, cuenta las etiquetas y verifica que el JSON tenga exactamente el mismo número de objetos.\n\nEJEMPLO MIXTO IMPORTANTE\nSi ves una etiqueta de INDUSTRIAS DEL PAPEL con STFM 20\", luego para BIIPLAST una etiqueta que dice STRETCH FILM AUTOMATICO 20\" y debajo otra STFM 20\", la salida correcta es:\n[\n  {\"cliente\":\"INDUSTRIAS DEL PAPEL S.A.\",\"tipo\":\"MANUAL\",\"color\":\"\",\"codigo\":\"2012C030TD\",\"lote\":\"080926/R1-1DC\"},\n  {\"cliente\":\"BIIPLAST\",\"tipo\":\"AUTOMATICO\",\"color\":\"\",\"codigo\":\"2014C0160TG\",\"lote\":\"270626/E4-2RQ\"},\n  {\"cliente\":\"BIIPLAST\",\"tipo\":\"MANUAL\",\"color\":\"\",\"codigo\":\"2012C014TD\",\"lote\":\"080926/R1-2IS\"}\n]\n\nCLIENTES CONOCIDOS ACTUALES (${clients.length})\n${clientLines}\n\nRECUERDA: responde SOLO con el JSON final válido y conserva el tipo real de cada etiqueta.`;
  }

  function refreshPrompt() {
    if (promptText) promptText.value = buildPrompt();
    const total = getAllClients().length; if (promptCount) promptCount.textContent = String(total); if (totalClientsEl) totalClientsEl.textContent = String(total);
  }
  function setClientStatus(message, error=false) {
    if (!clientsStatus) return; clientsStatus.textContent = message; clientsStatus.classList.toggle("is-error", error); clientsStatus.classList.toggle("is-ok", !!message && !error);
  }
  function renderCustomClients() {
    if (!customClientsList) return; const custom = loadCustomClients();
    if (!custom.length) { customClientsList.innerHTML = '<p class="clientes-empty">Todavía no ha añadido clientes nuevos en este navegador.</p>'; return; }
    customClientsList.innerHTML = custom.map((x,i) => `<div class="cliente-custom-row"><div><strong>${escapeHtml(x.cliente)}</strong>${x.corto ? `<span>${escapeHtml(x.corto)}</span>` : ""}</div><button type="button" class="cliente-delete-btn" data-index="${i}">Eliminar</button></div>`).join("");
    customClientsList.querySelectorAll(".cliente-delete-btn").forEach(btn => btn.addEventListener("click", () => { const items=loadCustomClients(), i=+btn.dataset.index, removed=items[i]; if(!removed)return; items.splice(i,1); saveCustomClients(items); refreshAll(); setClientStatus(`Cliente eliminado: ${removed.cliente}`); }));
  }
  function addClient() {
    const cliente=String(clientNameInput?.value||"").trim(), corto=String(clientShortInput?.value||"").trim().toUpperCase();
    if(!cliente){setClientStatus("Escriba el nombre del cliente.",true);clientNameInput?.focus();return;}
    if(getAllClients().some(x=>normalizeKey(x.cliente)===normalizeKey(cliente))){setClientStatus("Ese cliente ya existe en la base actual.",true);return;}
    const custom=loadCustomClients();custom.push({cliente,corto,origen:"personalizado"});saveCustomClients(custom);if(clientNameInput)clientNameInput.value="";if(clientShortInput)clientShortInput.value="";refreshAll();setClientStatus(`Cliente añadido: ${cliente}. Ya aparece en el autocompletado y en el instructivo para IA.`);
  }
  async function copyPrompt() {
    const text=buildPrompt();
    try{await navigator.clipboard.writeText(text);if(copyPromptStatus)copyPromptStatus.textContent=`Instructivo copiado completo con ${getAllClients().length} clientes.`;}
    catch(_){if(promptText){promptText.focus();promptText.select();document.execCommand("copy");if(copyPromptStatus)copyPromptStatus.textContent="Instructivo seleccionado. Si la copia automática fue bloqueada, use Ctrl+C.";}}
  }
  function refreshAll(){refreshDatalist();renderCustomClients();refreshPrompt();}

  addClientBtn?.addEventListener("click",addClient);
  clientNameInput?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addClient();}});
  clientShortInput?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addClient();}});
  copyPromptBtn?.addEventListener("click",copyPrompt);
  refreshAll();

  function loadBatchV2(){
    if(document.querySelector('script[data-samplast-lotes-v2]')) return;
    const script=document.createElement("script"); script.src="js/lote-masivo-v2.js?v=final-20260909-1"; script.dataset.samplastLotesV2="1"; document.body.appendChild(script);
  }
  if(document.readyState==="loading") window.addEventListener("DOMContentLoaded",loadBatchV2,{once:true}); else loadBatchV2();

  window.SamplastClientes={getAll:getAllClients,getCustom:loadCustomClients,refresh:refreshAll,buildPrompt};
})();
