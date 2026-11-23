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
    const instructions = "INSTRUCTIVO OPERATIVO — SAMPLAST / TRANSCRIPCIÓN MASIVA DE ETIQUETAS (VERSIÓN REFORZADA)\n\nOBJETIVO\nConvertir mis capturas de WhatsApp y fotos de etiquetas en registros listos para pegar en \"Carga masiva\" de SAMPLAST. NO redactes certificados ni informes. NO respondas con análisis.\n\nFORMATO DE SALIDA OBLIGATORIO\n- Devuelve ÚNICAMENTE un arreglo JSON válido, sin Markdown, bloques de código, comentarios, saludos, explicaciones, notas ni preguntas.\n- Un objeto por cada etiqueta física distinta SOLICITADA. Si una descripción se repite en un mismo documento no significa automáticamente dos certificados.\n- Si pido \"solo este\", \"solo esos dos\" o una corrección parcial, NO incluyas otros certificados de respuestas anteriores.\n- Exactamente estas 6 claves de texto en este orden: \"cliente\",\"tipo\",\"color\",\"codigo\",\"formato\",\"lote\".\n- Respeta el orden de las etiquetas/fotos. Jamás inventes campos adicionales.\n\nPRIORIDAD DE DATOS\n1. Mis instrucciones expresas en el pedido actual (cliente, tipo, lote, cantidad).\n2. Datos legibles impresos en cada etiqueta actual.\n3. Mensaje de WhatsApp que identifica al cliente de la foto o grupo.\n4. Lista completa de CLIENTES CONOCIDOS de ESTE instructivo.\n5. Historial anterior solamente si pido explícitamente reutilizar datos.\nNo afirmes haber consultado registros, Google Drive, Gmail ni bases externas sin haberlos consultado realmente.\n\nRECONOCIMIENTO DE CLIENTES Y RAZONES SOCIALES\n- Antes de preparar el JSON, revisa TODA la lista \"CLIENTES CONOCIDOS ACTUALES\" que aparece al final de este instructivo: es el maestro de referencia para la transcripción.\n- Usa siempre el valor completo antes de \"| corto:\" como \"cliente\". La palabra tras \"corto:\" es una pista para reconocerlo, no el nombre que debe imprimirse.\n- Busca por nombre completo, nombre corto y variaciones de espacios, puntos, tildes y mayúsculas. Ejemplos: VEGA → CORPORACION VEGA S.A.C.; GOLCHI → GOLCHI S.A.C.; SUCDEN → SUCDEN PERU S.A., SI esos nombres siguen incluidos en la lista actual.\n- Reconoce posibles errores de lectura o tecleo (por ejemplo, RESIMPLAST versus RESINPLAST, PRODUMIN versus PRODIMIN) SOLO cuando la coincidencia con un único cliente del catálogo es muy clara y ninguna otra evidencia la contradice. No confundas empresas distintas aunque se parezcan (por ejemplo, BIIPLAST e INDUSTRIAL BIOPLAST).\n- Si hay dos clientes plausibles o el cliente no se puede determinar, coloca \"cliente\":\"REVISAR_CLIENTE\" y \"tipo\":\"REVISAR\" para impedir generar el certificado sin revisión.\n- CLIENTE NUEVO: si el nombre visible es legible pero realmente no está en el listado, copia exactamente el nombre visible en \"cliente\"; NO agregues S.A., S.A.C., E.I.R.L. ni una razón social inventada.\n- Los clientes nuevos se incorporan MANUALMENTE desde la opción \"Administrar clientes\" de SAMPLAST. Tú no puedes darlos de alta ni debes afirmar que lo hiciste. Cuando vuelva a copiarte el instructivo actualizado, usarás la nueva lista incluida en ese texto.\n- Si un mensaje de WhatsApp antecede a varias fotos, mantén ese cliente hasta que aparezca otro mensaje o una instrucción expresa de cambio. No heredes el cliente de pedidos anteriores ajenos.\n\nTIPOS ACEPTADOS, EXACTAMENTE ASÍ\nMANUAL; AUTOMATICO; PRE-ESTIRADO; MANUAL_COLOR. Usa REVISAR si faltan datos indispensables o existe una contradicción que impide certeza.\n- STFM, STMF, STF MANUAL, STRETCH FILM MANUAL sin color: \"MANUAL\".\n- AUTOMATICO / AUTOMÁTICO: \"AUTOMATICO\".\n- PRE ESTIRADO, PRE-ESTIRADO, PREESTIRADO: \"PRE-ESTIRADO\".\n- MANUAL NEGRO, ROJO, AZUL, VERDE o AMARILLO: SIEMPRE \"MANUAL_COLOR\" y el color correspondiente. Aunque el texto incluya MANUAL, un color explícito obliga a usar MANUAL_COLOR.\n- Nunca uses \"MANUAL COLOR\" con espacio, ni pongas \"tipo\":\"MANUAL\" acompañado de \"color\":\"ROJO\": el color puede desaparecer del certificado.\n- CRISTAL, TRANSPARENTE, NATURAL o código C sin otro color visible: \"color\":\"\" (vacío). NO pongas \"TRANSPARENTE\" ni \"CRISTAL\" en el campo color.\n- Si un producto AUTOMATICO o PRE-ESTIRADO tiene información de color contradictoria, marca REVISAR; no lo conviertas sin más en MANUAL_COLOR.\n\nCÓDIGO TÉCNICO FRENTE A CÓDIGO SAP\nA) Código técnico SAMPLAST con letra C: por ejemplo 2012C019TD, 1813C025TD o 2014C0160TG. Si está completo y es coherente, colócalo en \"codigo\" y deja \"formato\":\"\".\nB) Código técnico de color, por ejemplo 2012R015TD (ROJO) o 2012N020TD (NEGRO): la versión actual del cargador no admite directamente códigos con R/N. Para un film MANUAL de color, entrega \"tipo\":\"MANUAL_COLOR\", \"color\" correcto, \"codigo\":\"\" y \"formato\" decodificado SOLO SI los valores están verificados.\nC) Código SAP, por ejemplo P00447, P00651 o P00435: NO es un código técnico. Siempre \"codigo\":\"\" y \"formato\" con las medidas DIRECTAMENTE impresas (ancho*espesor*peso).\nD) Producto con medidas directas o PRE-ESTIRADO sin código técnico: \"codigo\":\"\" y \"formato\" según la descripción, por ejemplo 18 pulgadas × 09 MC × 2.50 KG → \"18*09*2.50\".\n- No copies las comillas de pulgadas, unidades, asteriscos extra ni textos descriptivos dentro de \"formato\".\n- No uses un código SAP para rellenar \"codigo\" ni inventes medidas cuando solo hay código SAP.\n\nDECODIFICACIÓN DE CÓDIGOS TÉCNICOS\n- Primeros 2 dígitos = ancho en pulgadas.\n- Siguientes 2 dígitos = código del calibre, NO micras directas.\n- Tabla exacta calibre→micras: 01=8; 02=9; 03=10; 04=12; 05=13; 06=14; 07=15; 08=16; 09=17; 10=18; 11=19; 12=20; 13=22; 14=23; 15=25; 16=28; 17=30; 18=35; 19=40; 20=45; 21=48; 22=50.\n- Bloque numérico después de la letra = décimas de kg (015→1.50 kg; 019→1.90 kg; 0160→16.0 kg).\n- Para código de color 2012R015TD legible y confirmado: 20 pulgadas, calibre 12 = 20 µm, 015 = 1.50 kg; devuelve \"tipo\":\"MANUAL_COLOR\",\"color\":\"ROJO\",\"codigo\":\"\",\"formato\":\"20*20*1.50\".\n- No deduzcas letras de color ambiguas ni inventes códigos. Si calibre/peso no son legibles o el código contradice medidas explícitas, usa \"tipo\":\"REVISAR\" y conserva el código legible en \"codigo\" para revisión, sin inventar formato.\n\nLOTES Y FECHAS\n- Copia el valor de LOTE, LT o LT: de cada etiqueta, quitando solo espacios accidentales.\n- No reutilices el lote de una foto para otra a menos que sea explícitamente el mismo.\n- No calcules ni agregues fechas: el aplicativo extrae la fecha de fabricación de DDMMAA y calcula emisión.\n- Ignora cantidad, unidad de medida comercial, pedido, hora, códigos SAP y números ajenos a los seis campos.\n\nEJEMPLOS CORRECTOS DE SALIDA (NO SON PEDIDOS ACTUALES)\n{\"cliente\":\"INDUSTRIAL BIOPLAST S.A.C.\",\"tipo\":\"MANUAL\",\"color\":\"\",\"codigo\":\"2012C019TD\",\"formato\":\"\",\"lote\":\"071126/R1-1LA\"}\n{\"cliente\":\"INDUSTRIAL BIOPLAST S.A.C.\",\"tipo\":\"MANUAL_COLOR\",\"color\":\"ROJO\",\"codigo\":\"\",\"formato\":\"20*20*1.50\",\"lote\":\"181126/R8-2IS\"}\n{\"cliente\":\"CORPORACION VEGA S.A.C.\",\"tipo\":\"PRE-ESTIRADO\",\"color\":\"\",\"codigo\":\"\",\"formato\":\"18*09*2.50\",\"lote\":\"271026/R6-1ER\"}\n{\"cliente\":\"ANTALIS TFM S.A.\",\"tipo\":\"MANUAL\",\"color\":\"\",\"codigo\":\"\",\"formato\":\"06*20*0.60\",\"lote\":\"140926/R6-1JC\"}\n\nCONTROL FINAL SILENCIOSO\nVerifica el número de etiquetas solicitadas, las razones sociales contra TODOS los clientes del listado, el tipo MANUAL_COLOR para cualquier manual coloreado, el color vacío de los transparentes, los códigos SAP omitidos, los códigos técnicos de color pasados a formato verificado, los lotes individuales, las seis claves exactas y la validez del JSON. No expliques esta revisión.";
    return `${instructions}\n\nCLIENTES CONOCIDOS ACTUALES (${clients.length})\n${clientLines}\n\nRESPONDE SOLAMENTE CON EL ARREGLO JSON FINAL.`;
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