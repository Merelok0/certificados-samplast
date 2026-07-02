const CLIENTES_DB = [{"cliente": "1818 S.A.C", "corto": "1818"}, {"cliente": "ACINSA TUBOS S.A.", "corto": "ACINSA"}, {"cliente": "ADHESIVOS DEL SUR S.A.C.", "corto": "ADHESIVOS"}, {"cliente": "ADHESIVOS PERUVIAN S.A.C", "corto": "PERUVIAN"}, {"cliente": "AGRO INDUSTRIAL PARAMONGA S.A.", "corto": "PARAMO"}, {"cliente": "ALIMENTOS CIELO SOCIEDAD ANONIMA CERRADA - ALI CI S.A.C.", "corto": "CIELO"}, {"cliente": "ALIMENTOS DESHIDRATADOS Y BEBIDAS ALDEBSA S.A.C", "corto": "ALIMENTOS"}, {"cliente": "ALL THE KEYS OF THE MARKETING SOCIEDAD ANONIMA CERRADA - AKM S.A.C.", "corto": "KEYS"}, {"cliente": "AMFA VITRUM S.A.", "corto": "AMFA"}, {"cliente": "ANTALIS TFM S.A.", "corto": "ANTALIS"}, {"cliente": "AROMAS DEL PERU S.A.", "corto": "AROMA"}, {"cliente": "ARPACKING S.A.C.", "corto": "ARPACKI"}, {"cliente": "BAKELS PERU S.A.C", "corto": "BAKELS"}, {"cliente": "BAMC REPRESENTACIONES & SERVICIOS INTEGRALES S.A.C.", "corto": "BAMC"}, {"cliente": "BIOPLAST PERU S.A.C.", "corto": "BIOPLAST"}, {"cliente": "BODEGAS DON LUIS S.A.C", "corto": "DON L"}, {"cliente": "CALIZA CEMENTO INCA S.A.", "corto": "INCA"}, {"cliente": "CERUTI FABRICA DE ENVASES DE CARTON S.A.", "corto": "CERUTI"}, {"cliente": "CLUTE S.R.L", "corto": "CLUTE"}, {"cliente": "COCINAS SUPERIOR S.A", "corto": "COCINAS"}, {"cliente": "COMPAÑIA INDUSTRIAL DE ROTOMOLDEO S.A.C.", "corto": "ROTOM"}, {"cliente": "COMPAÑIA MOLINERA DEL CENTRO S.A.", "corto": "MOLIN"}, {"cliente": "COMPAÑIA PAPELERA CHASQUI S.A.", "corto": "CHASQUI"}, {"cliente": "CORPOLON S.A.C.", "corto": "CORPOL"}, {"cliente": "CORPORACION FRUTICOLA DE CHINCHA S.A.C.", "corto": "FRUTI"}, {"cliente": "CORPORACION MARA S.A", "corto": "MARA"}, {"cliente": "CORPORACION SEPACH S.A.C.", "corto": "SEPACH"}, {"cliente": "CORPORACION V & M EMBALAJES DEL PERU E.I.R.L.", "corto": "V&M"}, {"cliente": "CORPORACION VEGA S.A.C.", "corto": "VEGA"}, {"cliente": "CORPORACIÓN LON S.A.C.", "corto": "CORPO"}, {"cliente": "CS SOLUCIONES INDUSTRIALES S.A.C.", "corto": "CS SOLUC"}, {"cliente": "DAYR INVERSIONES MULTIPLES S.A.C.", "corto": "SUDA"}, {"cliente": "DISPERCOL S.A.", "corto": "DISPER"}, {"cliente": "DISTRIBUIDORA Y COMERCIALIZADORA HERAL S.A.C.", "corto": "HERAL"}, {"cliente": "E & M S.R.L.", "corto": "E&M"}, {"cliente": "EDUGRAPH S.A.C.", "corto": "EDUGRA"}, {"cliente": "EFICIENCIA PLASTICA S.A.C.", "corto": "EFICIENCI"}, {"cliente": "EKONO DRYWALL S.A.C.", "corto": "EKONO"}, {"cliente": "EL PEDREGAL S.A", "corto": "PEDREGAL"}, {"cliente": "EMPRESA AGROINDUSTRIAL DEL PERU S.A.", "corto": "AGRO I"}, {"cliente": "ESTANTERIAS METALICAS J.R.M. S.A.C", "corto": "ESTANT"}, {"cliente": "ETIKA S.A.C", "corto": "ETIKA"}, {"cliente": "EUROTUBO S.A.C.", "corto": "EUROTU"}, {"cliente": "FAR-PLAST S.A.C.", "corto": "FAR-PLAST"}, {"cliente": "FARMEX S.A.", "corto": "FARMEX"}, {"cliente": "FASTER DEL PERU E.I.R.L.", "corto": "FASTER"}, {"cliente": "FERROSALT S.A", "corto": "FERROSA"}, {"cliente": "FLINT GROUP PERU S.A.", "corto": "FLINT"}, {"cliente": "FROMM PERU S.A.C", "corto": "FROMM"}, {"cliente": "FULL PACK S.A.C.", "corto": "FULL"}, {"cliente": "GALVEZ FILM S.A.C.", "corto": "GALVEZ"}, {"cliente": "GOLCHI S.A.C.", "corto": "GOLCHI"}, {"cliente": "GRAFIPAPEL S.A", "corto": "GRAFIP"}, {"cliente": "GRUPO ASK E.I.R.L", "corto": "ASK"}, {"cliente": "GRUPO MISTIPLAST SOCIEDAD ANONIMA CERRADA", "corto": "MISTIPLAS"}, {"cliente": "GRUPO PANAMUNDO .S.A.C", "corto": "PANAMUNDO"}, {"cliente": "GRUPO SADDA E.I.R.L.", "corto": "GRUPO SADDA"}, {"cliente": "GRUPO SANTA ELENA S.A.", "corto": "SANTA E"}, {"cliente": "HANGART CREATIVE S.A.C", "corto": "HANGART"}, {"cliente": "HERMES TRANSPORTES BLINDADOS S.A.", "corto": "HERMES"}, {"cliente": "HUEMURA S.A.C.", "corto": "HUEMURA"}, {"cliente": "IDERSA PERU S.A.C.", "corto": "SIDERSA"}, {"cliente": "IMPLEMENTOS PERU S.A.C.", "corto": "IMPLE"}, {"cliente": "IMPORT PACKING PERU S.A.C.", "corto": "IMPORTEXP"}, {"cliente": "IMPORTACIONES SUDAMERICA S.A.C.", "corto": "SUDA"}, {"cliente": "INDURAMA PERU S.A.C.", "corto": "INDURAM"}, {"cliente": "INDUSTRIAL BIOPLAST S.A.C.", "corto": "BIOPL"}, {"cliente": "INDUSTRIAS DEL PAPEL S.A.", "corto": "PAPEL"}, {"cliente": "INDUSTRIAS GABUTEAU S.A.", "corto": "GABU"}, {"cliente": "INGCOVA INGENIEROS S.A.C", "corto": "INGCOVA"}, {"cliente": "INKAFERRO PERÚ S.A.C.", "corto": "INKAFERRO"}, {"cliente": "INVERSIONES FARMCOR E.I.R.L", "corto": "FAMCOR"}, {"cliente": "INVERSIONES NORLIMA SOCIEDAD ANONIMA", "corto": "NORLIMA"}, {"cliente": "INVERSIONES PKR E.I.R.L", "corto": "PKR"}, {"cliente": "INVERSIONES SOCIALES B P S.A.C.", "corto": "B P"}, {"cliente": "IPESA S.A.C", "corto": "IPESA"}, {"cliente": "IQMEH S.A.C.", "corto": "IQMEH"}, {"cliente": "KLO PERU S.A.C.", "corto": "KLO"}, {"cliente": "KPAMA LOGISTIC S.A.C", "corto": "KPAMA"}, {"cliente": "KROTON S.A.C.", "corto": "KROTON"}, {"cliente": "KURESA S.A", "corto": "KURESA"}, {"cliente": "LA CASA DEL EXTINTOR S.R.L", "corto": "LACASA"}, {"cliente": "LABEL PERU S.A.C.", "corto": "LABEL"}, {"cliente": "LABORATORIOS BIOMONT S.A.", "corto": "BIOMONT"}, {"cliente": "LAPICES Y CONEXOS S.A.", "corto": "LAPICEZ"}, {"cliente": "LATERCER S.A.C.", "corto": "LATERCER"}, {"cliente": "LIMPACK SOCIEDAD ANONIMA CERRADA", "corto": "LIMPACK"}, {"cliente": "LINROS S.R.L.", "corto": "LINROS"}, {"cliente": "LOGISTICA ESPECIALIZADA DEL PERU S.A.C.", "corto": "LOG"}, {"cliente": "MEGA PRODUCT DISTRIBUIDORA S.A.C", "corto": "MEGA PRO"}, {"cliente": "MENDEZ CANALES JOSE EDGAR", "corto": "MEND"}, {"cliente": "MIRCONSA S.A.C.", "corto": "MIRCONSA"}, {"cliente": "MOLPACK DEL PERU S.A.", "corto": "MO9PACK"}, {"cliente": "MONARK PERU S.A.", "corto": "MONARK"}, {"cliente": "NAVIGROUP IMPORT EXPORT S.A.C", "corto": "NAVIGROUP"}, {"cliente": "NAVIGROUP IMPORT EXPORT S.A.C.", "corto": "NAVIGROUP"}, {"cliente": "NOVO EXPORT S.R.LTDA.", "corto": "NOVO"}, {"cliente": "OLVA COURIER S.A.C.", "corto": "OLVA"}, {"cliente": "OMNIA LATAM GROUP S.A.C.", "corto": "OMNIA"}, {"cliente": "PANADERIA SAN JORGE S.A", "corto": "SANJORGE"}, {"cliente": "PAPELERA REYES S.A.C", "corto": "REYES"}, {"cliente": "PERU PIMA S.A.", "corto": "PIMA"}, {"cliente": "PERUANA DE MOLDEADOS S.A.C.", "corto": "PAMOLSA"}, {"cliente": "PLASTIENVASES S.A.C.", "corto": "PLASTIE"}, {"cliente": "PLASTIFAST E.I.R.L.", "corto": "PLASTIFAST"}, {"cliente": "PLATERS S.A.C.", "corto": "PLATERS"}, {"cliente": "POLINPLAST S.A.C.", "corto": "POLINPLA"}, {"cliente": "PQP PERU S.A.C.", "corto": "SUDA"}, {"cliente": "PRO INDUSTRIAL PERU S.A.C.", "corto": "PRO"}, {"cliente": "PRODIMIN S.A.C.", "corto": "PRODIMIN"}, {"cliente": "PRODUCTOS NATURALES DE EXPORTACION S.A", "corto": "PRODUCTOSN"}, {"cliente": "PROMHIL S.A.C.", "corto": "PROMHIL"}, {"cliente": "QUIAGRAL S.A.C.", "corto": "QUIAGRAL"}, {"cliente": "QUIMEX S.A.", "corto": "QUIMEX"}, {"cliente": "QUIMICA INDUSTRIAL TANIA CORRALES S.A.C. - QUINTACOR S.A.C.", "corto": "QUINTA"}, {"cliente": "REPRIND S.A.C.", "corto": "REPIND"}, {"cliente": "RESINPLAST S.A", "corto": "RESINPLAS"}, {"cliente": "ROLLOS DE PAPEL SOCIEDAD ANONIMA CERRADA", "corto": "ROLLOS PAP"}, {"cliente": "SAFETY SOLUTIONS COMPANY S.A.C.", "corto": "SAFETY"}, {"cliente": "SALMAPLAST S.A.C.", "corto": "SALMA"}, {"cliente": "SANTARIA CHAHUAYO FRANCISCO HILARIO", "corto": "SANTARIA"}, {"cliente": "SCHROTH CORPORACION PAPELERA S.A.C.", "corto": "SCROTH"}, {"cliente": "SEGURINDUSTRIA S.A.", "corto": "SEGURIN"}, {"cliente": "SEKUR PERU S.A", "corto": "SEKUR"}, {"cliente": "SERVIDATA SOLUCIONES S.A.C.", "corto": "SERVIDATA"}, {"cliente": "SHALOM EMPRESARIAL S.A.C.", "corto": "SHALOM"}, {"cliente": "SHIFU GROUP E.I.R.L", "corto": "SHIFU"}, {"cliente": "SOLUCIONES ALIMENTICIAS S.A.C.", "corto": "SOLUCIONES"}, {"cliente": "SUCDEN PERU S.A.", "corto": "SUCDEN"}, {"cliente": "TRAMONTINA DEL PERU S.A.C.", "corto": "TRAMONTIN"}, {"cliente": "TRANINSA COMERCIAL S.A.C", "corto": "TRANINSA"}, {"cliente": "TUBOS Y QUIMICOS INDUSTRIALES E.I.R.L", "corto": "TUBOS"}, {"cliente": "UNITRADE S.A.C.", "corto": "UNITRADE"}, {"cliente": "VARTINI PACKING' S.A.C", "corto": "VARTINI"}, {"cliente": "VIA FOODS INGREDIENTES S.A.C", "corto": "VIA FOODS"}, {"cliente": "ZUR DISTRIBUIDORA DE ALIMENTOS S.A.C.", "corto": "ZUR"}];

// Inicializar la lista de autocompletado de clientes
function initClientesDatalist() {
  const datalist = document.getElementById("clientes-list");
  if (!datalist) return;
  datalist.innerHTML = "";
  CLIENTES_DB.forEach(c => {
    const option = document.createElement("option");
    option.value = c.cliente;
    datalist.appendChild(option);
  });
}
const MICRON_GAUGE = [
  ["01", "08 Micras"], ["02", "09 Micras"], ["03", "10 Micras"], ["04", "12Micras"],
  ["05", "13Micras"], ["06", "14 Micras"], ["07", "15 Micras"], ["08", "16 Micras"],
  ["09", "17 Micras"], ["10", "18 Micras"], ["11", "19 Micras"], ["12", "20 Micras"],
  ["13", "22 Micras"], ["14", "23 Micras"], ["15", "25 Micras"], ["16", "28 Micras"],
  ["17", "30 Micras"], ["18", "35 Micras"], ["19", "40 Micras"], ["20", "45 Micras"],
  ["21", "48 Micras"], ["22", "50 Micras"],
];

const APARIENCIA = {
  transparente: "Transparencia óptica superior y alta reflectancia de la luz.",
  AZUL: "Azúl óptico superior y alta reflectancia de la luz.",
  NEGRO: "Negro óptico superior y alta reflectancia de la luz.",
  ROJO: "Rojo óptico superior y alta reflectancia de la luz.",
  VERDE: "Verde óptico superior y alta reflectancia de la luz.",
  AMARILLO: "Amarillo óptico superior y alta reflectancia de la luz.",
};

const RESISTENCIA =
  "Alta resistencia a la tracción, al desgarro y a la \nperforación, además de una excelente adherencia.";

const PRE_ESTIRADO_ANCHO_PULG = "18";
const PRE_ESTIRADO_MEDIDAS_ANCHO = "420*";
const PRE_ESTIRADO_VALOR_ANCHO = "421";

const form = document.getElementById("cert-form");
const preview = document.getElementById("cert-preview");
const labelInput = document.getElementById("foto-etiqueta");

let labelObjectUrl = "";
let syncingFormato = false;

function certAssetSrc(key, fallbackPath) {
  const assets = window.CERT_ASSETS || {};
  return assets[key] || fallbackPath;
}

function parseFormatoEtiqueta(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  const parts = text.split(/[xX*×]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length !== 3) return null;
  const [ancho, espesor, peso] = parts;
  if (!ancho || !espesor || !peso) return null;
  return { ancho, espesor, peso };
}

function formatPesoLabel(peso) {
  const n = Number(peso);
  if (!Number.isFinite(n)) return String(peso);
  // Always show one decimal place (e.g., 2 → 2.0)
  return n.toFixed(1);
}

function buildFormatoEtiqueta(ancho, espesor, peso) {
  if (!ancho && !espesor && !peso) return "";
  return `${ancho}*${espesor}*${formatPesoLabel(peso)}`;
}

function applyFormatoToFields() {
  const parsed = parseFormatoEtiqueta(form.formato_etiqueta.value);
  if (!parsed) return false;
  syncingFormato = true;
  form.ancho.value = parsed.ancho;
  form.espesor.value = parsed.espesor;
  form.peso.value = parsed.peso;
  syncingFormato = false;
  return true;
}

function syncFormatoFromFields() {
  if (syncingFormato) return;
  const fmt = buildFormatoEtiqueta(form.ancho.value, form.espesor.value, form.peso.value);
  if (fmt) form.formato_etiqueta.value = fmt;
}

function mmFromInches(inches, forTable = false) {
  const value = Number(inches);
  if (!Number.isFinite(value)) return "";
  const mm = value * 25.4;
  if (forTable) {
    const rounded = Math.round(mm);
    return Math.abs(mm - rounded) < 0.3 ? String(rounded) : mm.toFixed(1);
  }
  return Number.isInteger(mm) ? String(mm) : mm.toFixed(1).replace(/\.0$/, "");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function addDays(dateValue, days) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildProductName(tipo, color, ancho, espesor, peso) {
  const mc = String(Math.round(Number(espesor))).padStart(2, "0");
  const weight = formatPesoLabel(peso);
  const anchoTxt = tipo === "PRE-ESTIRADO" ? PRE_ESTIRADO_ANCHO_PULG : String(ancho).trim();
  if (tipo === "PRE-ESTIRADO") {
    return `STRETCH FILM PRE-ESTIRADO ${anchoTxt}" X  ${mc} MC X ${weight} KG`;
  }
  if (tipo === "AUTOMATICO") {
    return `STRETCH FILM AUTOMATICO ${anchoTxt}" X  ${mc} MC X ${weight} KG`;
  }
  if (tipo === "MANUAL_COLOR" || color) {
    const colorTxt = color ? String(color).trim().toUpperCase() : "";
    if (!colorTxt) return `STRETCH FILM MANUAL ${anchoTxt}" X ${mc} MC X ${weight} KG`;
    return `STRETCH FILM MANUAL ${colorTxt} ${anchoTxt}" X ${mc} MC X ${weight} KG`;
  }
  return `STRETCH FILM MANUAL ${anchoTxt}" X  ${mc} MC X ${weight} KG`;
}

function formatMedidaTable(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return Number.isInteger(n) ? String(n) : String(n);
}

function formatPesoTable(peso) {
  const n = Number(peso);
  if (!Number.isFinite(n)) return String(peso);
  // If integer, show one decimal; otherwise keep original precision
  return Number.isInteger(n) ? n.toFixed(1) : String(peso);
}

function formatTolerancia(valor) {
  return String(valor).trim();
}

function suggestLote(fechaFab, codigo) {
  if (!fechaFab) return "";
  const [y, m, d] = fechaFab.split("-");
  const base = `${d}${m}${y.slice(2)}`;
  return codigo ? `${base}/${codigo}` : `${base}/`;
}

const CLIENTE_STOP_WORDS = new Set([
  "S.A.C.", "S.A.", "SAC", "SA", "S.A.A.", "E.I.R.L.", "EIRL",
  "DEL", "DE", "LA", "EL", "Y", "LOS", "LAS", "LO",
  "CERRADA", "ANONIMA", "ANÓNIMA", "SOCIEDAD", "COMPAÑIA", "COMPAÑÍA",
  "PERU", "PERUANA", "INDUSTRIAL", "IMPORTACIONES", "ALIMENTOS",
]);

const TIPO_FILENAME_SUFFIX = {
  "PRE-ESTIRADO": "PE",
  AUTOMATICO: "A",
  MANUAL: "M",
};

const COLOR_FILENAME_SUFFIX = {
  NEGRO: "MN",
  ROJO: "MR",
  AZUL: "MA",
  VERDE: "MV",
  AMARILLO: "MY",
};

function clienteShortName(cliente) {
  const raw = String(cliente || "").trim().toUpperCase();
  if (!raw) return "CLIENTE";
  const tokens = raw
    .replace(/[.,]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/[^A-Z0-9ÁÉÍÓÚÜÑ/-]/gi, ""))
    .filter((t) => t && !CLIENTE_STOP_WORDS.has(t));
  if (!tokens.length) return "CLIENTE";

  let word = tokens[0];
  if (["COMPAÑIA", "COMPAÑÍA", "IMPORTACIONES", "INDUSTRIAL", "ALIMENTOS"].includes(word) && tokens[1]) {
    word = tokens[1];
  }
  const cleaned = word.replace(/[^A-Z0-9]/gi, "");
  if (cleaned === "MOLINERA" || cleaned.startsWith("MOLIN")) return "MOLIN";
  if (cleaned === "SUDAMERICA" || cleaned.startsWith("SUDAM")) return "SUDA";
  if (cleaned.length > 10) return cleaned.slice(0, 8);
  return cleaned.slice(0, 12) || "CLIENTE";
}

function formatFilenameDate(isoDate) {
  if (!isoDate) return "sin-fecha";
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y.slice(2)}`;
}

function formatFilenamePeso(peso) {
  const n = Number(peso);
  if (!Number.isFinite(n)) return String(peso || "0");
  return Number.isInteger(n) ? `${n}.0` : n.toFixed(1);
}

function formatFilenameSegment(ancho, espesor, peso) {
  const a = Number(ancho);
  const e = Number(espesor);
  const aStr = Number.isFinite(a) ? (Number.isInteger(a) ? String(a) : String(a)) : String(ancho || "");
  let eStr;
  if (Number.isFinite(e) && Number.isInteger(e) && e < 10) {
    eStr = String(e).padStart(2, "0");
  } else if (Number.isFinite(e) && Number.isInteger(e)) {
    eStr = String(e);
  } else {
    eStr = String(espesor || "");
  }
  return `${aStr}X${eStr}X${formatFilenamePeso(peso)}`;
}

function tipoFilenameSuffix(tipo, color) {
  if (tipo === "MANUAL_COLOR" && color) {
    return COLOR_FILENAME_SUFFIX[color] || "M";
  }
  return TIPO_FILENAME_SUFFIX[tipo] || "M";
}

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim();
}

function buildPdfFilename(data) {
  const datePart = formatFilenameDate(data.fechaFab);
  const clientePart = clienteShortName(data.cliente);
  const formatPart = formatFilenameSegment(data.ancho, data.espesor, data.peso);
  const suffix = tipoFilenameSuffix(data.tipo, data.color);
  return sanitizeFilename(`${datePart} ${clientePart} ${formatPart} ${suffix}.pdf`);
}

function getFormData() {
  applyFormatoToFields();
  const data = Object.fromEntries(new FormData(form).entries());
  const tipo = data.tipo;
  const color = tipo === "MANUAL_COLOR" ? String(data.color || "").trim().toUpperCase() : "";
  const ancho = data.ancho;
  const espesor = data.espesor;
  const peso = data.peso;
  const fechaFab = data.fecha_fabricacion;
  const fechaEmision = data.fecha_emision || addDays(fechaFab, 1);
  const aparienciaKey = color || "transparente";
  const isPreEstirado = tipo === "PRE-ESTIRADO";
  const anchoProducto = isPreEstirado ? PRE_ESTIRADO_ANCHO_PULG : ancho;
  const anchoMedidas = isPreEstirado ? PRE_ESTIRADO_MEDIDAS_ANCHO : mmFromInches(ancho, true);
  const anchoMedido = isPreEstirado ? PRE_ESTIRADO_VALOR_ANCHO : mmFromInches(ancho, true);

  return {
    cliente: data.cliente.trim(),
    fechaFab,
    fechaEmision,
    tipo,
    color,
    ancho,
    espesor,
    peso,
    isPreEstirado,
    pesoTable: formatPesoTable(peso),
    espesorTable: formatMedidaTable(espesor),
    lote: data.lote.trim() || suggestLote(fechaFab, data.codigo_lote),
    producto: buildProductName(tipo, color, anchoProducto, espesor, peso),
    isManualColor: tipo === "MANUAL_COLOR",
    mm: mmFromInches(anchoProducto),
    mmTable: anchoMedidas,
    anchoMedido,
    apariencia: APARIENCIA[aparienciaKey] || APARIENCIA.transparente,
    analista: data.analista || "Dan Mergildo C.",
  };
}

function renderResultadoAncho(data) {
  if (!data.isPreEstirado) return "CONFORME";
  return `CONFORME<br><span class="resultado-nota">*Lámina Estirada</span>`;
}

function renderGaugeRows() {
  return MICRON_GAUGE.map(
    ([num, micras]) => `<tr><td class="num">${num}</td><td>${micras}</td></tr>`
  ).join("");
}

function renderHelper(data) {
  const helper = document.getElementById("preview-helper");
  if (!helper) return;
  helper.innerHTML = `
    <p class="helper-title">Solo referencia</p>
    <p class="helper-note">Columnas L-M y O-Q del Excel. No imprime.</p>
    <table class="conv-table">
      <thead>
        <tr><th colspan="2">Conversión</th></tr>
        <tr><th>pulgadas</th><th>mm</th></tr>
      </thead>
      <tbody><tr><td>${data.isPreEstirado ? PRE_ESTIRADO_ANCHO_PULG : data.ancho}</td><td>${data.isPreEstirado ? "420* (pre-estirado)" : data.mm}</td></tr></tbody>
    </table>
    <table class="gauge-table"><tbody>${renderGaugeRows()}</tbody></table>
  `;
}

function labelHtml() {
  if (labelObjectUrl) {
    return `<img class="label-photo" src="${labelObjectUrl}" alt="Etiqueta">`;
  }
  return `<div class="label-photo empty">Foto etiqueta</div>`;
}

function renderCertificate(data) {
  preview.innerHTML = `
    <article class="cert-page" id="cert-print-area">
      <table class="cert-sheet" aria-label="Certificado de calidad">
        <colgroup>
          <col class="c-a"><col class="c-b"><col class="c-c"><col class="c-d"><col class="c-e">
          <col class="c-f"><col class="c-g"><col class="c-h"><col class="c-i"><col class="c-j">
        </colgroup>
        <tbody>
          <tr class="sp-2"><td colspan="10" class="no-border"></td></tr>

          <tr>
            <td class="no-border"></td>
            <td colspan="2" rowspan="2" class="logo-cell">
              <img src="${certAssetSrc("logo", "assets/logo.jpeg")}" alt="SAMPLAST">
            </td>
            <td colspan="4" rowspan="2" class="title-cell">CERTIFICADO DE CALIDAD<br>STRETCH FILM</td>
            <td colspan="2" class="code-cell"><span class="code-lbl">CÓDIGO:</span> CC-FO-005</td>
            <td class="no-border"></td>
          </tr>
          <tr>
            <td class="no-border"></td>
            <td colspan="2" class="code-cell"><span class="code-lbl">VER.:</span> 03 – <span class="code-lbl">Rev.:</span> 02</td>
            <td class="no-border"></td>
          </tr>

          <tr class="sp-1"><td colspan="10" class="no-border"></td></tr>

          <tr class="field-area">
            <td class="no-border"></td>
            <td class="lbl">FECHA DE FABRICACIÓN :</td>
            <td colspan="3" class="val-lg val-wrap">${formatDate(data.fechaFab)}</td>
            <td class="no-border"></td>
            <td class="lbl">FECHA DE EMISIÓN:</td>
            <td colspan="2" class="val-lg val-wrap">${formatDate(data.fechaEmision)}</td>
            <td class="no-border"></td>
          </tr>

          <tr class="field-area field-row-lote">
            <td class="no-border"></td>
            <td rowspan="3" class="lbl lbl-producto">PRODUCTO:</td>
            <td colspan="3" rowspan="3" class="val-lg val-wrap val-producto">${data.producto}</td>
            <td class="no-border"></td>
            <td class="lbl">LOTE:</td>
            <td colspan="2" class="val-lg val-wrap">${data.lote}</td>
            <td class="no-border"></td>
          </tr>
          <tr class="field-area field-row-cliente">
            <td class="no-border"></td>
            <td class="no-border"></td>
            <td class="lbl">CLIENTE:</td>
            <td colspan="2" rowspan="2" class="val-md val-wrap val-cliente">${data.cliente}</td>
            <td class="no-border"></td>
          </tr>
          <tr class="field-area field-grow">
            <td class="no-border"></td>
            <td class="no-border"></td>
            <td class="no-border"></td>
            <td class="no-border"></td>
          </tr>

          <tr>
            <td class="no-border"></td>
            <td colspan="8" class="section-title"><span>ESPECIFICACIONES TÉCNICAS</span></td>
            <td class="no-border"></td>
          </tr>

          <tr class="row-head-spec">
            <td class="no-border"></td>
            <td colspan="2" class="thead">VARIABLES</td>
            <td class="thead">MÉTODO DE PRUEBA</td>
            <td class="thead">UNIDAD</td>
            <td class="thead thead-med">MEDIDAS</td>
            <td class="thead thead-tol">TOLERANCIAS</td>
            <td class="thead">VALOR MEDIDO</td>
            <td class="thead">RESULTADO</td>
            <td class="no-border"></td>
          </tr>

          <tr class="row-spec">
            <td class="no-border"></td>
            <td colspan="2" class="param">ESPESOR</td>
            <td class="center metodo">CC-INT-002</td>
            <td class="center">µm</td>
            <td class="center cell-med">${data.espesorTable}</td>
            <td class="center cell-tol">${formatTolerancia("+/- 5%")}</td>
            <td class="center">${data.espesorTable}</td>
            <td class="center">CONFORME</td>
            <td class="no-border"></td>
          </tr>
          <tr class="row-spec">
            <td class="no-border"></td>
            <td colspan="2" class="param">${data.isPreEstirado ? "ANCHO DE LAMINA*" : "ANCHO DE LAMINA"}</td>
            <td class="center metodo">CC-INT-001</td>
            <td class="center">mm</td>
            <td class="center cell-med">${data.mmTable}</td>
            <td class="center cell-tol">${formatTolerancia("+/- 3mm")}</td>
            <td class="center">${data.anchoMedido}</td>
            <td class="center resultado-ancho">${renderResultadoAncho(data)}</td>
            <td class="no-border"></td>
          </tr>
          <tr class="row-spec">
            <td class="no-border"></td>
            <td colspan="2" class="param">PESO NETO</td>
            <td class="center metodo">CC-INT-008</td>
            <td class="center">Kg</td>
            <td class="center cell-med">${data.pesoTable}</td>
            <td class="center cell-tol">${formatTolerancia("+/- 2%")}</td>
            <td class="center">${data.pesoTable}</td>
            <td class="center">CONFORME</td>
            <td class="no-border"></td>
          </tr>

          <tr class="sp-3"><td colspan="10" class="no-border"></td></tr>

          <tr>
            <td class="no-border"></td>
            <td colspan="2" rowspan="2" class="thead">ATRIBUTOS</td>
            <td rowspan="2" class="thead">MÉTODO DE PRUEBA</td>
            <td colspan="4" rowspan="2" class="thead">ESTANDAR DE REFERNCIA</td>
            <td rowspan="2" class="thead">RESULTADO</td>
            <td class="no-border"></td>
          </tr>
          <tr><td class="no-border"></td><td class="no-border"></td></tr>

          <tr class="row-attr">
            <td class="no-border"></td>
            <td colspan="2" class="param">APARIENCIA</td>
            <td class="center metodo">CC-INT-009</td>
            <td colspan="4" class="attr-text">${data.apariencia}</td>
            <td class="center">CONFORME</td>
            <td class="no-border"></td>
          </tr>
          <tr class="row-attr">
            <td class="no-border"></td>
            <td colspan="2" class="param">RESISTENCIA</td>
            <td class="center metodo">CC-INT-010</td>
            <td colspan="4" class="attr-text">${RESISTENCIA.replace("\n", " ")}</td>
            <td class="center">CONFORME</td>
            <td class="no-border"></td>
          </tr>

          <tr class="sp-3"><td colspan="10" class="no-border"></td></tr>

          <tr>
            <td class="no-border"></td>
            <td colspan="8" class="fda">Apto para el contacto con alimentos El material cumple con la regulación FDA CFR 177.1520 3.2a</td>
            <td class="no-border"></td>
          </tr>

          <tr class="sp-1"><td colspan="10" class="no-border"></td></tr>

          <tr>
            <td class="no-border"></td>
            <td colspan="8" class="storage-block">
              <div class="storage-layout">
                <div class="storage-content">
                  <div class="storage-title">ALMACENAMIENTO</div>
                  <p class="storage-line">Almacenar en el envase original, en un lugar seco y bien ventilado, a temperaturas entre 17°C y 30°C.</p>
                  <p class="storage-line">Proteger de la luz solar directa, fuentes de calor y humedad.</p>
                  <p class="storage-line">Apilar verticalmente en no más de cuatro niveles, sobre superficies planas y resistentes.</p>
                  <p class="storage-line">El producto tiene una garantía de 12 meses en condiciones de almacenamiento recomendado.</p>
                  <p class="footnote-inline">* Para más detalles, véase la ficha técnica y hoja de seguridad.</p>
                </div>
                <div class="stamp-side">
                  <img class="stamp-img" src="${certAssetSrc("stamp", "assets/aprobado.jpg")}" alt="Aprobado">
                  <div class="footer-sign">
                    <img src="${certAssetSrc("signature", "assets/signature.png")}" alt="Firma">
                    <div class="name">${data.analista}</div>
                    <div class="role">Analista de Calidad</div>
                  </div>
                </div>
              </div>
            </td>
            <td class="no-border"></td>
          </tr>
        </tbody>
      </table>
    </article>
  `;
}

function updatePreview() {
  const data = getFormData();
  renderCertificate(data);
  renderHelper(data);
  const productoPreview = document.getElementById("producto-preview");
  if (productoPreview) {
    productoPreview.textContent = data.isManualColor && !data.color
      ? "Seleccione un color para generar el nombre del producto"
      : data.producto;
  }
  const pdfNamePreview = document.getElementById("pdf-name-preview");
  if (pdfNamePreview) {
    pdfNamePreview.textContent = buildPdfFilename(data);
  }
  const aparienciaPreview = document.getElementById("apariencia-preview");
  if (aparienciaPreview) {
    aparienciaPreview.textContent = data.isManualColor && data.color
      ? `Apariencia en certificado: ${data.apariencia}`
      : data.isManualColor
        ? "El texto de apariencia cambia según el color elegido"
        : "";
  }
}

function setColor(value) {
  const colorValue = value ? String(value).trim().toUpperCase() : "";
  form.color.value = colorValue;
  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.color === colorValue);
  });
}

function toggleColorField() {
  const colorField = document.getElementById("color-field");
  const showColor = form.tipo.value === "MANUAL_COLOR";
  colorField.hidden = !showColor;
  if (!showColor) setColor("");
}

function applyTipoRules() {
  if (form.tipo.value === "PRE-ESTIRADO") {
    form.ancho.value = PRE_ESTIRADO_ANCHO_PULG;
    syncFormatoFromFields();
  }
  toggleColorField();
}

function autoFillDates() {
  const fab = form.fecha_fabricacion.value;
  if (fab) {
    form.fecha_emision.value = addDays(fab, 1);
  }
}

function autoFillLote() {
  if (form.lote.dataset.manual === "1") return;
  const codLote = form.codigo_lote ? form.codigo_lote.value : "";
  form.lote.value = suggestLote(form.fecha_fabricacion.value, codLote);
}

function loadExampleBase({
  cliente,
  fechaFab,
  fechaEmision,
  tipo,
  color,
  formato,
  codigoLote,
  lote,
}) {
  form.cliente.value = cliente;
  form.fecha_fabricacion.value = fechaFab;
  form.fecha_emision.value = fechaEmision;
  form.tipo.value = tipo;
  setColor(color || "");
  form.formato_etiqueta.value = formato;
  if (form.codigo_lote) {
    form.codigo_lote.value = codigoLote;
  }
  form.lote.value = lote;
  form.lote.dataset.manual = "1";
  form.analista.value = "Dan Mergildo C.";
  applyTipoRules();
  applyFormatoToFields();
  updatePreview();
}

function loadExample() {
  loadExampleBase({
    cliente: "INSUPACK S.A.C.",
    fechaFab: "2026-06-23",
    fechaEmision: "2026-06-24",
    tipo: "MANUAL",
    formato: "18*20*2.0",
    codigoLote: "R7-1SG",
    lote: "230626/R7-1SG",
  });
}

function loadExamplePre() {
  loadExampleBase({
    cliente: "PAMOLSA",
    fechaFab: "2026-06-07",
    fechaEmision: "2026-06-08",
    tipo: "PRE-ESTIRADO",
    formato: "18*09*2.5",
    codigoLote: "PE-01",
    lote: "070626/PE-01",
  });
}

function loadExampleAuto() {
  loadExampleBase({
    cliente: "CIELO",
    fechaFab: "2026-06-20",
    fechaEmision: "2026-06-21",
    tipo: "AUTOMATICO",
    formato: "20*17*12.0",
    codigoLote: "A-01",
    lote: "200626/A-01",
  });
}

function loadExampleColor() {
  loadExampleBase({
    cliente: "SUDA",
    fechaFab: "2026-06-17",
    fechaEmision: "2026-06-18",
    tipo: "MANUAL_COLOR",
    color: "NEGRO",
    formato: "20*20*2.2",
    codigoLote: "MN-01",
    lote: "170626/MN-01",
  });
}

function getExportOrientation() {
  const select = document.getElementById("pdf-orientation");
  return select?.value === "landscape" ? "landscape" : "portrait";
}

function applyPrintOrientation() {
  let styleEl = document.getElementById("print-page-style");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "print-page-style";
    document.head.appendChild(styleEl);
  }
  const orientation = getExportOrientation();
  styleEl.textContent = `@page { size: A4 ${orientation}; margin: 6mm; }`;
}

function setPdfExportStatus(message, isError = false) {
  const status = document.getElementById("pdf-export-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function waitForImage(img) {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

async function waitForImages(root) {
  const images = [...root.querySelectorAll("img")];
  await Promise.all(images.map(waitForImage));
}

async function imageSrcToDataUrl(src) {
  if (!src || src.startsWith("data:")) return src;
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`No se pudo leer la imagen (${response.status})`);
  }
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo convertir la imagen para PDF"));
    reader.readAsDataURL(blob);
  });
}

async function inlineImagesForExport(root) {
  const images = [...root.querySelectorAll("img")];
  for (const img of images) {
    const originalSrc = img.currentSrc || img.src;
    if (!originalSrc || originalSrc.startsWith("data:")) continue;
    try {
      img.src = await imageSrcToDataUrl(originalSrc);
    } catch (error) {
      console.warn("Imagen omitida en PDF:", originalSrc, error);
    }
  }
  await waitForImages(root);
}

function beginPdfCapture() {
  document.body.classList.add("pdf-capture-mode");
}

function endPdfCapture() {
  document.body.classList.remove("pdf-capture-mode");
}

function fixPdfCloneLayout(root) {
  root.querySelectorAll(".storage-layout").forEach((block) => {
    block.style.display = "block";
  });
  root.querySelectorAll(".storage-content").forEach((block) => {
    block.style.display = "block";
    block.style.width = "100%";
  });
  root.querySelectorAll(".stamp-side").forEach((block) => {
    block.style.display = "block";
    block.style.float = "right";
    block.style.width = "118px";
    block.style.marginTop = "0";
  });
  root.querySelectorAll(".cert-sheet .thead").forEach((cell) => {
    cell.style.backgroundColor = "#F2F2F2";
    cell.style.verticalAlign = "middle";
  });
  root.querySelectorAll(".cert-sheet .cell-med, .cert-sheet .cell-tol").forEach((cell) => {
    cell.style.verticalAlign = "middle";
    cell.style.maxWidth = "0";
    cell.style.minWidth = "0";
    cell.style.overflow = "hidden";
    cell.style.whiteSpace = "normal";
    cell.style.wordBreak = "break-word";
    cell.style.overflowWrap = "break-word";
    cell.style.boxSizing = "border-box";
  });
  root.querySelectorAll(".cert-sheet .thead-med, .cert-sheet .thead-tol").forEach((cell) => {
    cell.style.maxWidth = "0";
    cell.style.minWidth = "0";
    cell.style.overflow = "hidden";
    cell.style.whiteSpace = "normal";
    cell.style.wordBreak = "break-word";
    cell.style.overflowWrap = "break-word";
    cell.style.boxSizing = "border-box";
  });
}

function mountViewportExportClone(source) {
  const wrapper = document.createElement("div");
  wrapper.id = "pdf-export-wrapper";
  wrapper.setAttribute("aria-hidden", "true");
  Object.assign(wrapper.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "210mm",
    margin: "0",
    padding: "0",
    background: "#ffffff",
    zIndex: "2147483646",
    opacity: "0.01",
    pointerEvents: "none",
  });

  const clone = source.cloneNode(true);
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  fixPdfCloneLayout(clone);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  return { wrapper, clone };
}

function unmountViewportExportClone(wrapper) {
  wrapper?.remove();
}

async function preparePdfExportTarget(element) {
  element.scrollIntoView({ block: "start" });
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  await waitForImages(element);
  await inlineImagesForExport(element);
}

function canvasHasVisibleContent(canvas) {
  if (!canvas || !canvas.width || !canvas.height) return false;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const sampleWidth = Math.min(canvas.width, 120);
  const sampleHeight = Math.min(canvas.height, 120);
  const pixels = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha > 0 && (pixels[i] < 245 || pixels[i + 1] < 245 || pixels[i + 2] < 245)) {
      return true;
    }
  }
  return false;
}

async function renderPdfBlobFromTarget(target, orientation) {
  const worker = html2pdf()
    .set(getPdfRenderOptions(orientation, 2))
    .from(target);

  await worker.toCanvas();
  const canvas = await worker.get("canvas");
  if (!canvasHasVisibleContent(canvas)) {
    throw new Error("La captura del certificado salió vacía.");
  }

  await worker.toPdf();
  return worker.outputPdf("blob");
}

function getPdfRenderOptions(orientation, scale = 2) {
  return {
    margin: [4, 4, 4, 4],
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      backgroundColor: "#ffffff",
      scale,
      logging: false,
      useCORS: false,
      allowTaint: false,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation,
    },
  };
}

async function renderPdfBlobSimple(target, orientation, scale = 2) {
  return html2pdf()
    .set(getPdfRenderOptions(orientation, scale))
    .from(target)
    .outputPdf("blob");
}

async function buildCertificatePdfBlob(element, orientation) {
  await preparePdfExportTarget(element);

  const attempts = [
    () => renderPdfBlobFromTarget(element, orientation),
    async () => {
      const { wrapper, clone } = mountViewportExportClone(element);
      try {
        await waitForImages(clone);
        await inlineImagesForExport(clone);
        return await renderPdfBlobFromTarget(clone, orientation);
      } finally {
        unmountViewportExportClone(wrapper);
      }
    },
    () => renderPdfBlobSimple(element, orientation, 2),
    () => renderPdfBlobSimple(element, orientation, 1),
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const blob = await attempt();
      if (blob && blob.size > 1000) return blob;
      lastError = new Error("El PDF generado está vacío.");
    } catch (error) {
      lastError = error;
      console.warn("Intento PDF falló:", error);
    }
  }

  throw lastError || new Error("No se pudo generar el PDF.");
}

function canUseSaveFilePicker() {
  return typeof window.showSaveFilePicker === "function" && window.isSecureContext;
}

function downloadPdfBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function requestPdfSaveTarget(filename) {
  if (!canUseSaveFilePicker()) return null;
  return window.showSaveFilePicker({
    suggestedName: filename,
    types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }],
  });
}

async function writePdfBlob(blob, filename, fileHandle = null) {
  if (fileHandle) {
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return { mode: "picker", name: fileHandle.name };
  }
  downloadPdfBlob(blob, filename);
  return { mode: "download", name: filename };
}

async function exportPdf() {
  const btn = document.getElementById("btn-pdf");
  const element = document.getElementById("cert-print-area");
  const orientation = getExportOrientation();
  const filename = buildPdfFilename(getFormData());

  if (!element) {
    setPdfExportStatus("No se encontró el certificado en pantalla.", true);
    return;
  }
  if (typeof html2pdf === "undefined") {
    setPdfExportStatus("No se cargó la librería PDF. Use ABRIR_CERTIFICADO.bat.", true);
    return;
  }

  const originalLabel = btn?.textContent || "Guardar PDF…";
  let fileHandle = null;
  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Guardar PDF…";
    }

    if (canUseSaveFilePicker()) {
      setPdfExportStatus("Elija carpeta y nombre del archivo…");
      fileHandle = await requestPdfSaveTarget(filename);
    } else {
      setPdfExportStatus("Abra con ABRIR_CERTIFICADO.bat para elegir carpeta al guardar.");
    }

    if (btn) btn.textContent = "Generando PDF…";
    setPdfExportStatus("Generando PDF, espere un momento…");

    beginPdfCapture();
    const blob = await buildCertificatePdfBlob(element, orientation);

    if (!blob || blob.size < 1000) {
      throw new Error("El PDF salió vacío. Use Imprimir → Guardar como PDF.");
    }

    const result = await writePdfBlob(blob, filename, fileHandle);
    if (result.mode === "picker") {
      setPdfExportStatus(`PDF guardado: ${result.name}`);
    } else {
      setPdfExportStatus(`PDF descargado: ${result.name} (revise Descargas si no eligió carpeta).`);
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      setPdfExportStatus("Guardado cancelado.");
      return;
    }
    console.error(error);
    setPdfExportStatus(`Error al generar PDF: ${error?.message || "desconocido"}`, true);
    const usePrint = window.confirm(
      "No se pudo guardar el PDF.\n\n" +
        `${error?.message || "Error desconocido"}\n\n` +
        "¿Desea abrir Imprimir para guardar como PDF?\n" +
        "(En impresora elija 'Guardar como PDF' o 'Microsoft Print to PDF')"
    );
    if (usePrint) {
      printCertificate();
    }
  } finally {
    endPdfCapture();
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  }
}

function printCertificate() {
  applyPrintOrientation();
  window.print();
}

form.addEventListener("input", (event) => {
  if (event.target.name === "lote") form.lote.dataset.manual = event.target.value ? "1" : "";
  if (event.target.name === "fecha_fabricacion" || event.target.name === "codigo_lote") {
    autoFillDates();
    autoFillLote();
  }
  if (event.target.name === "formato_etiqueta") {
    applyFormatoToFields();
  }
  if (["ancho", "espesor", "peso"].includes(event.target.name)) {
    syncFormatoFromFields();
  }
  if (event.target.name === "tipo") applyTipoRules();
  if (["formato_etiqueta", "ancho", "espesor", "peso", "cliente"].includes(event.target.name)) {
    toggleColorField();
  }
  updatePreview();
});

form.tipo.addEventListener("change", () => {
  applyTipoRules();
  updatePreview();
});

document.querySelectorAll(".color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setColor(btn.dataset.color);
    updatePreview();
  });
});

labelInput.addEventListener("change", () => {
  const file = labelInput.files?.[0];
  if (labelObjectUrl) URL.revokeObjectURL(labelObjectUrl);
  labelObjectUrl = file ? URL.createObjectURL(file) : "";
  updatePreview();
});

document.getElementById("btn-ejemplo").addEventListener("click", loadExample);
document.getElementById("btn-ejemplo-pre").addEventListener("click", loadExamplePre);
document.getElementById("btn-ejemplo-auto").addEventListener("click", loadExampleAuto);
document.getElementById("btn-ejemplo-color").addEventListener("click", loadExampleColor);
document.getElementById("btn-pdf").addEventListener("click", exportPdf);
document.getElementById("btn-print").addEventListener("click", printCertificate);

toggleColorField();
if (!window.isSecureContext) {
  setPdfExportStatus(
    "Para elegir carpeta al guardar, abra con ABRIR_CERTIFICADO.bat (Chrome o Edge)."
  );
}
initClientesDatalist();
loadExample();

// === EXPONER FUNCIONES AL SCOPE GLOBAL (para gemini-etiqueta.js) ===
window.applyTipoRules = applyTipoRules;
window.applyFormatoToFields = applyFormatoToFields;
window.updatePreview = updatePreview;
window.autoFillDates = autoFillDates;