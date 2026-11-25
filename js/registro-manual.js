// SAMPLAST: acceso local mediante contraseña a la hoja de registro.
// El enlace se cifra; los permisos REALES se configuran en Google Drive.
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const decode = x => Uint8Array.from(atob(x), c => c.charCodeAt(0));
  const salt=decode("H32QlKDxOmyCVo9XCtNAxw==");
  const iv=decode("NyplQ7UZAj7G4ejY");
  const encrypted=decode("UofsqPxg3S96UvpJR5+dYjYLjXGY3HKVnCimBq8HBLQCR1C5nq/0wI32coRl54ubIgdy3gtfCo+LThsFxpKPG0EautV5X4DgT7lMsGdKNGhcdEC57aJnxRGajTwO7qL/4zjZV2IA0KKmpNinpl8h3FIzV8g=");
  const status=(s,err=false)=>{const el=$("registro-estado");if(el){el.textContent=s;el.classList.toggle("is-error",err);}};
  const stamp=()=>new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Lima",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).format(new Date());
  const clean=s=>String(s??"").replace(/[\t\r\n]+/g," ").replace(/^[=+@-]/,"'$&");
  let url="", busy=false;
  const rows=[], clients=[];
  const seen=new Set();
  const existing=window.SamplastDrive||{};
  function capture(data,meta={}){
    try{
      const d=data||{};
      if(!d.cliente||!d.tipo||!d.lote||!d.fechaFab||!d.ancho||!d.espesor||!d.peso)return;
      const norm=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]/g,"");
      const short=window.SamplastClientes?.getAll?.().find(x=>norm(x.cliente)===norm(d.cliente))?.corto||"";
      const now=stamp();
      const row=[now,d.cliente,short,d.tipo,d.color||"",meta.codigo||"",[d.ancho,d.espesor,d.peso].join("*"),d.ancho,d.espesor,d.peso,d.lote,d.fechaFab,d.fechaEmision||"",d.analista||"",meta.orientation||"portrait",meta.filename||"",meta.state||"PDF GENERADO","samplast-20261125"];
      const k=JSON.stringify([now.slice(0,10),...row.slice(1)]);
      if(!seen.has(k)){
        seen.add(k);
        rows.push(["M-"+(crypto.randomUUID?.()||Date.now()+"-"+rows.length),...row]);
        count();
      }
    }catch(_){}
  }
  function client(item,state){
    try{
      if(!item?.cliente)return;
      const id=String(item.cliente).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]/g,"");
      const row=[id,item.cliente,item.corto||"",item.origen||"personalizado",state,stamp()];
      const i=clients.findIndex(r=>r[0]===id);
      if(i<0)clients.push(row);else clients[i]=row;
      count();
    }catch(_){}
  }
  // Mantiene la integración previa. La copia manual no depende de autorización.
  window.SamplastDrive={...existing,
    record(d,m){capture(d,m);try{existing.record?.(d,m);}catch(_){}},
    clientChange(i,s){client(i,s);try{existing.clientChange?.(i,s);}catch(_){}}
  };
  function count(){
    if($("registro-contador"))$("registro-contador").textContent=rows.length+" certificados · "+clients.length+" cambios de clientes";
  }
  async function unlock(){
    if(busy)return;
    const input=$("registro-clave"),password=input.value;input.value="";
    if(!password){status("Ingrese la contraseña.",true);return;}
    if(!crypto.subtle){status("Abra la aplicación mediante HTTPS o el servidor local.",true);return;}
    busy=true;$("registro-desbloquear").disabled=true;
    try{
      const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveKey"]);
      const key=await crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:310000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["decrypt"]);
      const result=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,encrypted);
      url=new TextDecoder().decode(result);
      const parsed=new URL(url);
      if(parsed.origin!=="https://docs.google.com"||!parsed.pathname.startsWith("/spreadsheets/d/"))throw Error("Enlace inválido");
      $("registro-protegido").hidden=false;$("registro-acceso").hidden=true;
      status("Acceso habilitado en esta pestaña. Google controla los permisos de la hoja.");
    }catch(_){url="";status("Contraseña incorrecta o acceso no disponible.",true);}
    finally{busy=false;$("registro-desbloquear").disabled=false;}
  }
  function lock(){
    url="";$("registro-protegido").hidden=true;$("registro-acceso").hidden=false;status("Acceso bloqueado.");
  }
  function open(){
    if(url)window.open(url,"_blank","noopener,noreferrer");
  }
  async function copy(data,label){
    if(!url)return;
    if(!data.length){status("No hay "+label+" registrados en esta pestaña.",true);return;}
    const t=data.map(r=>r.map(clean).join("\t")).join("\n");
    try{await navigator.clipboard.writeText(t);status(data.length+" fila(s) de "+label+" copiadas. Péguelas en la siguiente fila vacía de la hoja correspondiente.");}
    catch(_){const el=$("registro-copia");el.hidden=false;el.value=t;el.select();status("Pulse Ctrl+C y pegue los datos en Google Sheets.");}
  }
  $("registro-desbloquear")?.addEventListener("click",()=>void unlock());
  $("registro-clave")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();void unlock();}});
  $("registro-abrir")?.addEventListener("click",open);
  $("registro-bloquear")?.addEventListener("click",()=>{const t=$("registro-copia");t.value="";t.hidden=true;lock();});
  $("registro-copiar-cert")?.addEventListener("click",()=>void copy(rows,"certificados"));
  $("registro-copiar-cli")?.addEventListener("click",()=>void copy(clients,"clientes"));
  count();
})();
