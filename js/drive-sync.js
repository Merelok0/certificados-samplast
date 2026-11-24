// SAMPLAST: historial y catálogo privado en Google Sheets. Sin tokens persistidos.
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const trusted = (location.origin === "https://merelok0.github.io" && location.pathname.startsWith("/certificados-samplast/")) ||
    location.origin === "http://127.0.0.1:8765" || location.origin === "http://localhost:8765";
  const CFG = "samplast_drive_config_v1", QUEUE = "samplast_drive_pending_v1", CLIENTQ = "samplast_drive_client_pending_v1";
  const CUSTOM = "samplast_clientes_personalizados_v1", HIDDEN = "samplast_clientes_ocultos_v1";
  const SCOPE = "https://www.googleapis.com/auth/drive.file";
  const TITLE = "BASE DE DATOS SAMPLAST";
  const HEADERS_H = ["ID registro","Fecha de registro (Lima)","Razón social","Nombre corto PDF","Tipo","Color","Código técnico","Formato","Ancho (pulg.)","Espesor (µm)","Peso (kg)","Lote","Fecha fabricación","Fecha emisión","Analista","Orientación","Nombre PDF","Estado de salida","Versión"];
  const HEADERS_C = ["ID cliente","Razón social","Nombre corto PDF","Origen","Estado","Fecha actualización (Lima)"];
  const key = x => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  const read = (k,f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch (_) { return f; } };
  const store = (k,v) => localStorage.setItem(k,JSON.stringify(v));
  const pending = k => { const v=read(k,[]); return Array.isArray(v)?v:[]; };
  const stamp = () => new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Lima",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).format(new Date());
  let token="", expiry=0, sheetId="", config={}, syncing=null, history=[], lastError="", timer=null;
  const status = (s,err=false) => {
    const el=$("drive-sync-status"); if(el){el.textContent=s;el.classList.toggle("is-error",err);}
    const ct=$("drive-pending-count");if(ct)ct.textContent=String(pending(QUEUE).length+pending(CLIENTQ).length);
  };
  const active = () => trusted && !!sheetId && !!token && Date.now()<expiry;
  function refreshStatus(){
    if(!trusted){status("Drive deshabilitado en este enlace compartido. Use GitHub Pages propio o ABRIR_CERTIFICADO.bat. Puede exportar sus clientes de este navegador.");return;}
    if(active())status("Conexión autorizada. Pendientes: "+(pending(QUEUE).length+pending(CLIENTQ).length)+(lastError?" · "+lastError:""),!!lastError);
    else status("Sin conexión a Drive. Los datos nuevos quedan pendientes en este navegador hasta conectar.");
  }
  function schedule(){
    refreshStatus();
    if(active()&&!syncing){clearTimeout(timer);timer=setTimeout(()=>void sync().catch(()=>{}),1200);}
  }
  function record(data, meta={}){
    if(!trusted)return;
    try {
      const d=data||{}, now=stamp(), cliente=String(d.cliente||"").trim(), lote=String(d.lote||"").trim();
      if(!cliente||!lote||!d.tipo||!d.fechaFab||!d.ancho||!d.espesor||!d.peso)return;
      const short=(window.SamplastClientes?.getAll?.()||[]).find(x=>key(x.cliente)===key(cliente))?.corto || "";
      const row=["",now,cliente,short,d.tipo,d.color||"",meta.codigo||"",[d.ancho,d.espesor,d.peso].join("*"),String(d.ancho),String(d.espesor),String(d.peso),lote,d.fechaFab,d.fechaEmision||"",d.analista||"",meta.orientation||"portrait",meta.filename||"",meta.state||"PDF GENERADO","samplast-20261124"];
      // Misma fecha y contenido = mismo registro; distinto día conserva la nueva emisión.
      const identity=JSON.stringify([now.slice(0,10),...row.slice(2,18)]);
      const q=pending(QUEUE);
      if(!q.some(x=>x.identity===identity)){q.push({identity,row});store(QUEUE,q);}
      schedule();
    }catch(e){status("El PDF se generó, pero no se pudo conservar el registro local: "+e.message,true);}
  }
  function clientChange(item,state){
    if(!trusted)return;
    try{
      const k=key(item?.cliente);if(!k)return;
      const q=pending(CLIENTQ).filter(x=>x.id!==k);
      q.push({id:k,row:[k,String(item.cliente),String(item.corto||""),String(item.origen||"personalizado"),state,stamp()]});
      store(CLIENTQ,q);schedule();
    }catch(e){status("Cliente conservado localmente; no se pudo preparar la sincronización: "+e.message,true);}
  }
  async function api(path,method="GET",body){
    if(!trusted||!token||Date.now()>=expiry)throw Error("Sesión Google vencida. Pulse Conectar.");
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
    try{
      const r=await fetch("https://sheets.googleapis.com/v4/spreadsheets/"+encodeURIComponent(sheetId)+path,{
        method,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},
        ...(body?{body:JSON.stringify(body)}:{}),signal:controller.signal
      });
      if(r.status===401){token="";expiry=0;throw Error("Sesión Google vencida. Pulse Conectar.");}
      if(!r.ok)throw Error("Google Sheets: "+r.status+" "+((await r.json().catch(()=>({}))).error?.message||""));
      return await r.json();
    }finally{clearTimeout(timer);}
  }
  const range = a => "/values/"+encodeURIComponent(a);
  const values = async a => (await api(range(a))).values||[];
  const append = (a,rows) => rows.length?api(range(a)+":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS","POST",{values:rows}):Promise.resolve();
  const update = (a,row) => api(range(a)+"?valueInputOption=RAW","PUT",{values:[row]});
  async function validate(){
    const m=await api("?fields=properties(title),sheets(properties(title))");
    if(m.properties?.title!==TITLE)throw Error("Seleccione exclusivamente "+TITLE+".");
    const [h,c]=await Promise.all([values("Historial!A1:S1"),values("Clientes!A1:F1")]);
    if(JSON.stringify(h[0])!==JSON.stringify(HEADERS_H)||JSON.stringify(c[0])!==JSON.stringify(HEADERS_C))throw Error("Las cabeceras no coinciden. No se escribió nada.");
  }
  async function digest(s){
    const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
  }
  function applyCloudClients(rows){
    const local=window.SamplastClientes?.getCustom?.()||[];
    const custom=new Map(local.map(x=>[key(x.cliente),{cliente:x.cliente,corto:x.corto}]));
    const hidden=new Set(window.SamplastClientes?.getHidden?.()||[]);
    const queued=new Set(pending(CLIENTQ).map(x=>x.id));
    let conflicts=0;
    for(const r of rows){
      const [id,cliente,corto,origen,state]=r;
      if(!id||!cliente||key(cliente)!==id||queued.has(id))continue;
      if(state==="INACTIVO"){
        const existing=custom.get(id);
        if(existing&&existing.corto!==corto){conflicts++;continue;}
        custom.delete(id);hidden.add(id);
      }
      else if(state==="ACTIVO"){
        hidden.delete(id);
        if(origen==="personalizado"){
          const existing=custom.get(id);
          if(existing && existing.corto!==corto){conflicts++;continue;}
          custom.set(id,{cliente,corto:String(corto||"")});
        }
      }
    }
    store(CUSTOM,[...custom.values()]);store(HIDDEN,[...hidden]);window.SamplastClientes?.refresh?.();
    return conflicts;
  }
  async function syncClients(){
    let rows=await values("Clientes!A2:F");
    const map=new Map(rows.map((r,i)=>[r[0],{row:r,index:i+2}]).filter(([id])=>id));
    // Primera vinculación: subir las altas que ya estaban guardadas localmente.
    const local=window.SamplastClientes?.getCustom?.()||[];
    const migrationKey="samplast_drive_migrated_"+sheetId;
    const changes=pending(CLIENTQ);
    if(!read(migrationKey,false)){
      store("samplast_drive_client_backup_"+sheetId,{custom:local,hidden:window.SamplastClientes?.getHidden?.()||[]});
      for(const x of local){
        const k=key(x.cliente), remote=map.get(k)?.row;
        if(!changes.some(q=>q.id===k)&&(!remote||remote[3]==="base"&&remote[4]==="ACTIVO"))
          changes.push({id:k,row:[k,x.cliente,x.corto,"personalizado","ACTIVO",stamp()]});
      }
      for(const id of window.SamplastClientes?.getHidden?.()||[]){
        const remote=map.get(id)?.row;
        if(remote&&remote[3]==="base"&&remote[4]==="ACTIVO"&&!remote[5]&&!changes.some(q=>q.id===id))
          changes.push({id,row:[id,remote[1],remote[2],"base","INACTIVO",stamp()]});
      }
      store(CLIENTQ,changes);
    }
    const newRows=[];
    for(const q of changes){
      const hit=map.get(q.id);
      if(hit)await update("Clientes!A"+hit.index+":F"+hit.index,q.row);
      else newRows.push(q.row);
    }
    await append("Clientes!A:F",newRows);
    const done=new Map(changes.map(x=>[x.id,JSON.stringify(x.row)]));
    store(CLIENTQ,pending(CLIENTQ).filter(x=>done.get(x.id)!==JSON.stringify(x.row)));
    store(migrationKey,true);
    rows=(await values("Clientes!A2:F")).filter(r=>r[0]);
    return applyCloudClients(rows);
  }
  async function syncHistory(){
    const ids=new Set((await values("Historial!A2:A")).flat().map(String));
    const q=pending(QUEUE), done=new Set(), rows=[];
    for(const item of q){
      const id=await digest(item.identity);
      if(!ids.has(id)){const row=item.row.slice();row[0]=id;rows.push(row);ids.add(id);}
      done.add(item.identity);
    }
    // Si la respuesta falla después de escribir, el próximo intento lee IDs y no repite.
    await append("Historial!A:S",rows);
    store(QUEUE,pending(QUEUE).filter(x=>!done.has(x.identity)));
    history=(await values("Historial!A2:S")).filter(r=>r[0]).reverse();
    renderHistory();
  }
  function sync(){
    if(syncing)return syncing;
    if(!active()){refreshStatus();return Promise.resolve();}
    syncing=(async()=>{
      status("Sincronizando con Google Sheets…");
      try{
        await validate();
        const conflicts=await syncClients();await syncHistory();
        lastError=conflicts?conflicts+" nombre(s) corto(s) en conflicto. Se conservó el valor local; revise Clientes.":"";
        refreshStatus();
      }catch(e){lastError=e.message;status("No sincronizado: "+e.message+". Los pendientes permanecen en esta PC.",true);throw e;}
      finally{syncing=null;if(!lastError&&(pending(QUEUE).length||pending(CLIENTQ).length))schedule();}
    })();
    return syncing;
  }
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const el=document.createElement("script");el.src=src;el.async=true;el.onload=resolve;
      el.onerror=()=>reject(Error("No se pudo cargar Google. Revise la conexión."));document.head.append(el);
    });
  }
  let libs;
  function libraries(){
    if(!libs)libs=Promise.all([loadScript("https://accounts.google.com/gsi/client"),loadScript("https://apis.google.com/js/api.js")])
      .then(()=>new Promise((ok,fail)=>gapi.load("picker",{callback:ok,onerror:()=>fail(Error("No cargó Google Picker")),timeout:20000,ontimeout:()=>fail(Error("Google Picker no respondió"))})))
      .catch(e=>{libs=null;throw e;});
    return libs;
  }
  function pick(){
    const view=new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setMimeTypes("application/vnd.google-apps.spreadsheet");
    new google.picker.PickerBuilder().addView(view).setOAuthToken(token)
      .setDeveloperKey(config.apiKey).setAppId(config.project).setOrigin(location.origin)
      .setTitle("Seleccione BASE DE DATOS SAMPLAST")
      .setCallback(async data=>{
        if(data.action!==google.picker.Action.PICKED){if(data.action===google.picker.Action.CANCEL)status("Selección cancelada; no se escribió nada.");return;}
        const doc=data.docs?.[0];if(!doc||doc.name!==TITLE){status("Seleccione el archivo exacto "+TITLE+".",true);return;}
        sheetId=doc.id;
        try{
          await validate();config.sheetId=sheetId;store(CFG,config);
          lastError="";await sync();
        }catch(e){sheetId="";status("No se vinculó la hoja: "+e.message,true);}
      }).build().setVisible(true);
  }
  async function connect(){
    if(!trusted){refreshStatus();return;}
    try{
      const clientId=$("drive-client-id").value.trim(), apiKey=$("drive-api-key").value.trim(), project=$("drive-project-number").value.trim();
      if(!/^[\w.-]+\.apps\.googleusercontent\.com$/.test(clientId)||!apiKey||!/^\d+$/.test(project))throw Error("Complete el ID de cliente OAuth, la clave de API restringida y el número del proyecto de Google Cloud.");
      const previous=read(CFG,{});
      config={clientId,apiKey,project,sheetId:previous.clientId===clientId?previous.sheetId||"":""};
      store(CFG,config);
      if(!window.google?.accounts?.oauth2 || !window.google?.picker){
        await libraries();
        status("Google preparado. Pulse Conectar nuevamente para autorizar.");return;
      }
      status("Autorice la conexión en Google.");
      const client=google.accounts.oauth2.initTokenClient({
        client_id:clientId,scope:SCOPE,include_granted_scopes:false,
        callback:async response=>{
          if(response.error||!response.access_token){status("Google no autorizó el acceso: "+(response.error||"sin token"),true);return;}
          if(!google.accounts.oauth2.hasGrantedAllScopes(response,SCOPE)){status("No se otorgó el permiso al archivo.",true);return;}
          token=response.access_token;expiry=Date.now()+Math.max(0,Number(response.expires_in||3600)-60)*1000;
          sheetId=config.sheetId;
          if(sheetId){try{await validate();await sync();return;}catch(e){sheetId="";status("Seleccione de nuevo la hoja: "+e.message,true);}}
          try{pick();}catch(e){status(e.message,true);}
        },
        error_callback:e=>status("Google no abrió la autorización: "+(e.type||"error"),true)
      });
      client.requestAccessToken({prompt:"consent"});
    }catch(e){status(e.message,true);}
  }
  function disconnect(){clearTimeout(timer);token="";expiry=0;sheetId="";history=[];renderHistory();refreshStatus();}
  function renderHistory(){
    const container=$("drive-history-results");if(!container)return;
    container.replaceChildren();
    const q=($("drive-history-search")?.value||"").toLowerCase();
    const filtered=history.filter(r=>r.slice(1).join(" ").toLowerCase().includes(q));
    const count=document.createElement("p");count.textContent=filtered.length+" registro(s). Se muestran hasta 100.";container.append(count);
    for(const r of filtered.slice(0,100)){
      const wrap=document.createElement("div");wrap.className="cliente-custom-row";
      const text=document.createElement("span");text.textContent=[r[1],r[2],r[4],r[5],r[7],r[11]].filter(Boolean).join(" · ");
      const button=document.createElement("button");button.type="button";button.className="btn btn-secondary";button.textContent="Recuperar";
      button.addEventListener("click",()=>restore(r));wrap.append(text,button);container.append(wrap);
    }
  }
  function restore(r){
    const f=$("cert-form");if(!f||!r[2]||!r[11])return;
    const set=(n,v)=>{if(f.elements.namedItem(n))f.elements.namedItem(n).value=v||"";};
    set("cliente",r[2]);set("tipo",r[4]);set("color",r[5]);window.applyTipoRules?.();
    set("formato_etiqueta",r[7]);set("ancho",r[8]);set("espesor",r[9]);set("peso",r[10]);set("lote",r[11]);
    if(f.lote)f.lote.dataset.manual="1";
    set("fecha_fabricacion",r[12]);set("fecha_emision",r[13]);set("analista",r[14]);set("pdf_orientation",r[15]);
    window.applyFormatoToFields?.();window.updatePreview?.();window.SamplastPdfNombres?.refresh?.();
    const details=f.closest("details");if(details)details.open=true;
    status("Certificado recuperado. Revise la vista previa antes de guardar.");
  }
  function exportClients(){
    const data={version:1,custom:window.SamplastClientes?.getCustom?.()||[],hidden:window.SamplastClientes?.getHidden?.()||[]};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="samplast-clientes-respaldo.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  async function importClients(file){
    if(!trusted||!file)return;
    try{
      const d=JSON.parse(await file.text());if(d.version!==1||!Array.isArray(d.custom)||!Array.isArray(d.hidden))throw Error("Respaldo inválido.");
      const map=new Map((window.SamplastClientes?.getCustom?.()||[]).map(x=>[key(x.cliente),{cliente:x.cliente,corto:x.corto}]));
      let n=0,conflicts=0;
      for(const x of d.custom){
        const cliente=String(x?.cliente||"").trim(),corto=String(x?.corto||"").trim(),id=key(cliente);
        if(!id||!corto)continue;
        if(map.has(id)){if(map.get(id).corto!==corto)conflicts++;continue;}
        map.set(id,{cliente,corto});n++;
      }
      store(CUSTOM,[...map.values()]);
      const hidden=new Set([...(window.SamplastClientes?.getHidden?.()||[]),...d.hidden.filter(x=>typeof x==="string"&&key(x)===x)]);
      store(HIDDEN,[...hidden]);window.SamplastClientes?.refresh?.();
      if(sheetId)localStorage.removeItem("samplast_drive_migrated_"+sheetId);
      status(n+" clientes importados, "+conflicts+" conflictos conservados localmente. Pulse Sincronizar.");
    }catch(e){status("No se pudo importar: "+e.message,true);}
  }
  const cfg=trusted?read(CFG,{}):{};
  for(const [id,value] of [["drive-client-id",cfg.clientId],["drive-api-key",cfg.apiKey],["drive-project-number",cfg.project]])if($(id))$(id).value=value||"";
  if($("drive-config"))$("drive-config").hidden=!trusted;
  $("drive-connect")?.addEventListener("click",()=>void connect());
  $("drive-sync")?.addEventListener("click",()=>void sync().catch(()=>{}));
  $("drive-disconnect")?.addEventListener("click",disconnect);
  $("drive-history-search")?.addEventListener("input",renderHistory);
  $("drive-export-clients")?.addEventListener("click",exportClients);
  $("drive-import-clients")?.addEventListener("change",e=>void importClients(e.target.files?.[0]));
  window.addEventListener("online",schedule);
  window.SamplastDrive={record,clientChange};
  refreshStatus();
})();
