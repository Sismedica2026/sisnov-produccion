// ============================================================
// SEGUIMIENTO NOVEDADES OPERATIVAS - Sismedica SAS
// Cliente JavaScript — conecta con API backend
// CSP legacy event compatibility: server permits script-src-attr for existing HTML handlers
// ============================================================

// ── CONSTANTS ─────────────────────────────────────────────
const RL = {
  admin:"Administrador", gerente:"Gerente",
  "director-norte":"Director Zona Norte", "director-sur":"Director Zona Sur",
  "coordinador-norte":"Coordinador Zona Norte", "coordinador-sur":"Coordinador Zona Sur",
  supervisor:"Supervisor"
};
const RC = {
  admin:"rc rc-admin", gerente:"rc rc-gerente",
  "director-norte":"rc rc-director-norte", "director-sur":"rc rc-director-sur",
  "coordinador-norte":"rc rc-coord-norte", "coordinador-sur":"rc rc-coord-sur",
  supervisor:"rc rc-supervisor"
};
const AVC = {
  admin:"#e42421", gerente:"#f0a832",
  "director-norte":"#294996", "director-sur":"#5a6e9a",
  "coordinador-norte":"#0e7a4e", "coordinador-sur":"#0e7a4e",
  supervisor:"#1a7a3c"
};

// ── STATE ─────────────────────────────────────────────────
let CU = null, NV = "", fBq = "", fAr = "", fNv = "";
let itmr = null, iwmr = null, iwc = 30;
let asignUser = null;
const asignHistory = {};
const RT_NOMBRES = {}, RT_ACTIVO = {}, RT_ZONA = {};
const ASIGNACIONES = {};
let uFilter = 'todos', uSearch = '';
let ctrlFilter = 'todos';
let nov = [];

// ── CATALOG ───────────────────────────────────────────────
const CAT = {
  NORTE: {
    "AUTOPISTA DEL CARIBE":["ARROYO DE PIEDRA","SABANA GRANDE","TURBACO"],
    "RUTA AL MAR ANTIOQUIA":["MATA DE CAÑA","SAN ONOFRE","LORICA","MONTERIA","PLANETA RICA"],
    "YUMA":["A06 - VALENCIA","A03 - EL DIFICIL","A04 - PLATO","A01 - TUCURINCA","A02 - EL COPEY","A05 - LA LOMA"],
    "RUTAS DEL CACAO":["UBCI RIO SOGAMOSO","PUENTE RIO SOGAMOSO","LA LIZAMA"],
    "PERIMETRAL":["CHOACHI","GUASCA","LA CALERA"],
    "ACCENORTE":["ACCENORTE"],
    "AUTOPISTA DEL RIO GRANDE":["MORRISON","PAILITAS","LA GOMEZ"],
    "AUTOPISTA MAGDALENA MEDIO":["EL TRIQUE","EL HATO","CAMPO 23"],
    "RUTA BOGOTA NORTE":["BUDA","INSPECTOR","CARRO TALLER","GRUA LIVIANA"],
    "COVIANDINA":["NARANJAL","BUENAVISTA","BOQUERON","PUENTE QUETAME"],
    "SISGA":["MACHETA","SAN LUIS DE GACENO"],
    "ALTO MAGDALENA":["HONDA","CAMBAO","NARIÑO"],
    "COSTERA":["CARTAGENA","GALAPA","BARRANQUILLA"],
    "NORDESTE":["CAUCASIA","ZARAGOZA"],
  },
  SUR: {
    "COVIORIENTE":["AGUAZUL","MONTERREY","VERACRUZ","VILLANUEVA"],
    "PACIFICO 3":["LA MANUELA","LA VIRGINIA","LA FELISA"],
    "PACIFICO 2 - LA PINTADA":["EL GUAYABO","LA PINTADA","MULATOS"],
    "UNION DEL SUR":["CEBADAL","RUMICHACA"],
    "TUNEL ABURRA":["TUNEL ABURRA"],
    "PANAMERICANA":["LA RIOJA","JALISCO","GUAYABAL"],
    "RUTAS DEL VALLE":["MEDIACANOA","CERRITO","CIAT"],
    "TUNEL DE LA LINEA":["ALASKA","BERMELLON","LOS PINOS","AMERICAS"],
    "PERIMETRAL":["CHOACHI","GUASCA","LA CALERA"],
    "VIAL DEL NUS":["SAN JOSE DEL NUS","LA PALOMA","BARBOSA"],
    "NUEVO CAUCA":["OVEJAS"],
    "UNION VIAL RIO PAMPLONITA":["ACACIOS","GUAYABALES"],
  }
};
const MOV = {
  "AUTOPISTA DEL CARIBE|ARROYO DE PIEDRA":["UM188 KPL977","UM178 HFR729"],
  "AUTOPISTA DEL CARIBE|SABANA GRANDE":["UM213 NXS562","UM174 HFQ802"],
  "AUTOPISTA DEL CARIBE|TURBACO":["UM193 KPM515","UM177 HFQ749"],
  "YUMA|A06 - VALENCIA":["UM184 KPL703"],"YUMA|A01 - TUCURINCA":["UM182 KPL719"],
  "YUMA|A02 - EL COPEY":["UM183 KPL705"],"YUMA|A05 - LA LOMA":["UM186 KPL979"],
  "PERIMETRAL|CHOACHI":["UM820 HFN820"],"PERIMETRAL|GUASCA":["UM819 HFN819"],
  "SISGA|MACHETA":["UM201 KTW589"],"SISGA|SAN LUIS DE GACENO":["UM200 KPM511"],
  "COSTERA|CARTAGENA":["UM106 IJK163"],"COSTERA|BARRANQUILLA":["UM000 USU107"],
  "COVIORIENTE|AGUAZUL":["UM205 LIT467"],"COVIORIENTE|MONTERREY":["UM203 LIT468"],
  "COVIORIENTE|VERACRUZ":["UM208 LIT460"],"COVIORIENTE|VILLANUEVA":["UM639 POT639"],
  "PACIFICO 3|LA MANUELA":["UM161 HFP741"],"PACIFICO 3|LA FELISA":["UM164 HFQ165"],
  "TUNEL DE LA LINEA|BERMELLON":["UM185 KPL707"],"TUNEL DE LA LINEA|ALASKA":["UM170 FYL859"],
  "RUTAS DEL VALLE|MEDIACANOA":["UM190 KPL983"],"RUTAS DEL VALLE|CERRITO":["UM189 KPL982"],
};
const TIP = {
  MANTENIMIENTO:["MOTOR","DIRECCION","FRENOS","LUCES","LIQUIDOS","ELECTRICO","LLANTAS","CARROCERIA","OTRO"],
  INSUMOS:["MAL DESPACHADO","INCOMPLETO","NO TOMARON REQUISICION","NO DESPACHARON","FECHAS VENCIDAS O CORTAS","OTRO"],
  BIOMEDICOS:["CALIBRACION","DAÑO","INCOMPLETO","VENCIMIENTO","FALTANTE","OTRO"],
  TH:["VACANTES","INGRESO HEINSOHN","AUSENCIA","INCAPACIDAD","PERMISOS","OTRO"],
  TECNOLOGIA:["FALLA EQUIPO CELULAR","FALLA BIOMETRICOS FALCON","FALLA ROXDOC","FALLA EQUIPO COMPUTO","FALLA IMPRESORA","OTRO"],
  SST:["RECOLECCION BIOLOGICOS","EPP","REPORTE ACCIDENTES E INCIDENTES","INFORMES MENSUALES","INSPECCIONES","OTRO"],
  NOMINA:["MALAS LIQUIDACIONES","ERROR MARCACIONES","HORAS EXTRAS","DESCUENTOS","OTRO"],
};

// ── API CLIENT ────────────────────────────────────────────
const API = {
  user: null,

  csrf() {
    const item = document.cookie.split('; ').find(row => row.startsWith('sisnov_csrf='));
    return item ? decodeURIComponent(item.split('=')[1]) : '';
  },

  headers(method) {
    const h = { 'Content-Type': 'application/json' };
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) h['X-CSRF-Token'] = this.csrf();
    return h;
  },

  async request(method, url, body) {
    const opts = { method, credentials: 'same-origin', headers: this.headers(method) };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Error del servidor');
    return data;
  },

  post:   (url, body) => API.request('POST',   url, body),
  get:    (url)       => API.request('GET',    url),
  patch:  (url, body) => API.request('PATCH',  url, body),
  delete: (url)       => API.request('DELETE', url),

  save(user) { this.user = user; },
  clear() { this.user = null; }
};

// ── INIT ──────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await API.get('/api/auth/me');
    API.save(data.user);
    CU = { ...data.user, user: data.user.username, rol: data.user.rol };
    initApp();
  } catch { /* sin sesión activa */ }
});

// ── LOGIN ─────────────────────────────────────────────────
async function doLogin() {
  const u = document.getElementById('lu').value.trim().toLowerCase();
  const p = document.getElementById('lp').value;
  const err = document.getElementById('lerr');
  const btn = document.querySelector('.lbtn');
  if (!u || !p) { err.textContent='Complete usuario y contraseña.'; err.classList.add('show'); return; }
  btn.textContent = 'Verificando...'; btn.disabled = true;
  try {
    const data = await API.post('/api/auth/login', { username: u, password: p });
    API.save(data.user);
    CU = { ...data.user, user: data.user.username, rol: data.user.rol };
    err.classList.remove('show');
    initApp();
  } catch(e) {
    err.textContent = e.message || 'Credenciales incorrectas.';
    err.classList.add('show');
    document.getElementById('lp').value = '';
  } finally {
    btn.textContent = 'Ingresar al Sistema →'; btn.disabled = false;
  }
}

function initApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').classList.add('vis');
  document.getElementById('tun').textContent = CU.nombre;
  const rc = document.getElementById('trc');
  rc.className = RC[CU.rol] || 'rc';
  rc.textContent = RL[CU.rol] || CU.rol;
  document.getElementById('fsu').value = CU.nombre;
  // sync concesiones into ASIGNACIONES for supervisor
  if (CU.concesiones) ASIGNACIONES[CU.user] = CU.concesiones;
  buildSidebar();
  showPage('dashboard');
  resetIA();
  const fz = document.getElementById('fz');
  if (CU.rol === 'supervisor') {
    fz.value = CU.zona; fz.disabled = true; buildSupConSelect();
  } else if (['director-norte','coordinador-norte'].includes(CU.rol)) {
    fz.value = 'NORTE'; fz.disabled = true; fc();
  } else if (['director-sur','coordinador-sur'].includes(CU.rol)) {
    fz.value = 'SUR'; fz.disabled = true; fc();
  } else { fz.disabled = false; }
}

async function doLogout() {
  try { await API.post('/api/auth/logout', {}); } catch {}
  API.clear(); CU = null; nov = [];
  clearTimeout(itmr); clearTimeout(iwmr);
  document.getElementById('iw').style.display = 'none';
  document.getElementById('appShell').classList.remove('vis');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('lu').value = '';
  document.getElementById('lp').value = '';
}

// ── DATA ACCESS ───────────────────────────────────────────
function vis() {
  const r = CU.rol;
  if (r==='admin'||r==='gerente') return nov;
  if (r==='director-norte'||r==='coordinador-norte') return nov.filter(n=>n.zona==='NORTE');
  if (r==='director-sur'||r==='coordinador-sur')     return nov.filter(n=>n.zona==='SUR');
  if (r==='supervisor') return nov.filter(n=>n.user===CU.user);
  return [];
}
function getSupConcesiones(u) { return ASIGNACIONES[u] || []; }

// ── CLOCK ─────────────────────────────────────────────────
function tick() {
  const n = new Date();
  const el = document.getElementById('tclock');
  if (el) el.textContent = n.toLocaleTimeString('es-CO', {hour12:false});
  const fd = document.getElementById('fdt');
  if (fd) fd.value = n.toLocaleString('es-CO', {hour12:false});
}
setInterval(tick, 1000); tick();

// ── SIDEBAR & NAVIGATION ──────────────────────────────────
function ns(t) { return `<div class="nsl">${t}</div>`; }
function ni(id, icon, lbl) {
  return `<div class="ni" id="nav-${id}" onclick="showPage('${id}')"><span class="nico">${icon}</span><span>${lbl}</span></div>`;
}
function buildSidebar() {
  const r = CU.rol; let h = '';
  if (r==='supervisor') {
    h+=ns('MI ÁREA'); h+=ni('dashboard','📊','Mi Dashboard'); h+=ni('registro','✏️','Nueva Novedad'); h+=ni('historial','📋','Mis Novedades');
    h+=ns('SISTEMA'); h+=ni('seguridad','🛡','Seguridad');
  }
  if (r==='coordinador-norte'||r==='coordinador-sur') {
    const z = r==='coordinador-norte'?'NORTE':'SUR';
    h+=ns('COORDINACIÓN '+z); h+=ni('dashboard','📊','Dashboard '+z); h+=ni('registro','✏️','Registrar Novedad');
    h+=ni('historial','📋','Novedades '+z); h+=ni('reportes','📈','Reportes '+z); h+=ni('control','📅','Control Diario');
    h+=ns('SISTEMA'); h+=ni('seguridad','🛡','Seguridad');
  }
  if (r==='director-norte'||r==='director-sur') {
    const z = r==='director-norte'?'NORTE':'SUR';
    h+=ns('DIRECCIÓN '+z); h+=ni('dashboard','📊','Dashboard '+z); h+=ni('historial','📋','Novedades '+z);
    h+=ni('reportes','📈','Reportes '+z); h+=ni('control','📅','Control Diario');
    h+=ns('SISTEMA'); h+=ni('seguridad','🛡','Seguridad');
  }
  if (r==='gerente') {
    h+=ns('GERENCIA'); h+=ni('dashboard','📊','Dashboard Global'); h+=ni('historial','📋','Todas las Novedades');
    h+=ni('reportes','📈','Reportes Globales'); h+=ni('control','📅','Control Diario');
    h+=ns('SISTEMA'); h+=ni('seguridad','🛡','Seguridad');
  }
  if (r==='admin') {
    h+=ns('OPERACIONES'); h+=ni('dashboard','📊','Dashboard Global'); h+=ni('historial','📋','Todas las Novedades'); h+=ni('reportes','📈','Reportes');
    h+=ns('ADMINISTRACIÓN'); h+=ni('registro','✏️','Crear Novedad'); h+=ni('usuarios','👥','Usuarios');
    h+=ni('permisos','🔑','Permisos'); h+=ni('auditoria','🕵️','Auditoría'); h+=ni('control','📅','Control Diario');
    h+=ns('SISTEMA'); h+=ni('seguridad','🛡','Seguridad');
  }
  document.getElementById('sidebar').innerHTML = h;
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  const pg = document.getElementById('pg-'+id); if (!pg) return;
  pg.classList.add('active');
  const nv = document.getElementById('nav-'+id); if (nv) nv.classList.add('active');
  resetIA();
  if (id==='dashboard')  renderDash();
  if (id==='historial')  renderHist();
  if (id==='reportes')   renderRep();
  if (id==='usuarios')   renderUsers();
  if (id==='permisos')   renderPerms();
  if (id==='auditoria')  renderAudit();
  if (id==='seguridad')  renderSec();
  if (id==='control')    renderControl();
}

// ── FORM SELECTS ──────────────────────────────────────────
function buildSupConSelect() {
  if (!CU||CU.rol!=='supervisor') return;
  const concList = CU.concesiones||[];
  const fz = document.getElementById('fz'); fz.value=CU.zona; fz.disabled=true;
  const infoDiv = document.getElementById('reg-sup-info');
  const chipsDiv = document.getElementById('reg-sup-chips');
  infoDiv.style.display='block';
  chipsDiv.innerHTML = concList.length
    ? concList.map(c=>`<span class="con-chip" style="cursor:default">${c}</span>`).join('')
    : '<span class="con-chip-empty">⚠️ Sin concesiones asignadas. Contacte al administrador.</span>';
  const fco = document.getElementById('fco');
  fco.innerHTML='<option value="">— Seleccione Concesión —</option>';
  fco.disabled = concList.length===0;
  concList.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;fco.appendChild(o);});
}

function fc() {
  if (CU&&CU.rol==='supervisor') { buildSupConSelect(); return; }
  const z=document.getElementById('fz').value, c=document.getElementById('fco');
  c.innerHTML='<option value="">— Seleccione —</option>'; c.disabled=!z;
  document.getElementById('fpu').innerHTML='<option value="">— Seleccione —</option>'; document.getElementById('fpu').disabled=true;
  document.getElementById('fmo').innerHTML='<option value="">— Seleccione —</option>'; document.getElementById('fmo').disabled=true;
  if (!z) return;
  Object.keys(CAT[z]||{}).sort().forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k;c.appendChild(o);});
}

function fp() {
  const isSup=CU&&CU.rol==='supervisor';
  const z=isSup?CU.zona:document.getElementById('fz').value;
  const c=document.getElementById('fco').value, p=document.getElementById('fpu');
  p.innerHTML='<option value="">— Seleccione —</option>'; p.disabled=!c;
  document.getElementById('fmo').innerHTML='<option value="">— Seleccione —</option>'; document.getElementById('fmo').disabled=true;
  if (!c) return;
  (CAT[z]?.[c]||[]).sort().forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k;p.appendChild(o);});
}

function fm() {
  const c=document.getElementById('fco').value, p=document.getElementById('fpu').value;
  const m=document.getElementById('fmo'); m.innerHTML='<option value="">— Seleccione —</option>'; m.disabled=!p;
  const mv=(MOV[c+'|'+p])||[];
  mv.forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k;m.appendChild(o);});
  if (!mv.length){const o=document.createElement('option');o.textContent='Sin móvil asignado';m.appendChild(o);}
}

function ftp() {
  const a=document.getElementById('far').value, t=document.getElementById('fti');
  t.innerHTML='<option value="">— Seleccione —</option>'; t.disabled=!a;
  (TIP[a]||[]).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k;t.appendChild(o);});
}

function sn(n) {
  NV=n; ['baja','media','critica'].forEach(x=>document.getElementById('nb-'+x).className='nb');
  document.getElementById('nb-'+n.toLowerCase()).classList.add('sel-'+n.toLowerCase());
}

function resetReg(keep=false) {
  const isSup=CU&&CU.rol==='supervisor';
  const isDir=CU&&['director-norte','director-sur','coordinador-norte','coordinador-sur'].includes(CU.rol);
  const fz=document.getElementById('fz');
  if (!isSup&&!isDir) { fz.value=''; fz.disabled=false; document.getElementById('reg-sup-info').style.display='none'; }
  ['fco','fpu','fmo'].forEach(id=>{document.getElementById(id).innerHTML='<option value="">— Seleccione —</option>'; document.getElementById(id).disabled=true;});
  document.getElementById('far').value='';
  document.getElementById('fti').innerHTML='<option value="">— Seleccione —</option>'; document.getElementById('fti').disabled=true;
  document.getElementById('fde').value='';
  NV=''; ['baja','media','critica'].forEach(x=>document.getElementById('nb-'+x).className='nb');
  if (isSup&&CU.zona) buildSupConSelect();
  else if (isDir) { const zona=['director-norte','coordinador-norte'].includes(CU.rol)?'NORTE':'SUR'; fz.value=zona; fz.disabled=true; fc(); }
}

// ── GUARDAR NOVEDAD ───────────────────────────────────────
async function guardar() {
  const z=document.getElementById('fz').value, c=document.getElementById('fco').value,
        p=document.getElementById('fpu').value, m=document.getElementById('fmo').value,
        a=document.getElementById('far').value, t=document.getElementById('fti').value,
        d=document.getElementById('fde').value.trim();
  const ok=document.getElementById('rok'), er=document.getElementById('rerr');
  ok.style.display=er.style.display='none';
  if (!z||!c||!p||!a||!t||!NV||!d) { er.style.display='flex'; er.scrollIntoView({behavior:'smooth',block:'nearest'}); return; }
  const btn=document.querySelector('#pg-registro .btn-p');
  btn.textContent='Guardando...'; btn.disabled=true;
  try {
    const data = await API.post('/api/novedades', {zona:z,concesion:c,puesto:p,movil:m||null,area:a,tipo_novedad:t,nivel:NV,descripcion:d});
    const n = data.novedad;
    nov.unshift({...n, fecha:n.fecha_formato, ts:new Date(n.creado_en).getTime(),
      tipo:n.tipo_novedad, user:n.registrado_por, name:n.nombre_supervisor, movil:n.movil||'—'});
    renderDash();
    if (document.getElementById('pg-control')?.classList.contains('active')) renderControl();
    ok.style.display='flex'; ok.scrollIntoView({behavior:'smooth',block:'nearest'});
    setTimeout(()=>{ok.style.display='none';},4000); resetReg(true);
  } catch(e) { er.textContent='⚠️ '+(e.message||'Error al guardar'); er.style.display='flex'; }
  finally { btn.textContent='💾 Guardar Novedad'; btn.disabled=false; }
}

// ── LOAD NOVEDADES ────────────────────────────────────────
async function cargarNovedades() {
  try {
    const data = await API.get('/api/novedades');
    nov = data.novedades.map(n=>({
      ...n, fecha:n.fecha_formato, ts:new Date(n.creado_en).getTime(),
      tipo:n.tipo_novedad, user:n.registrado_por, name:n.nombre_supervisor, movil:n.movil||'—'
    }));
  } catch(e) { console.error('Error cargando novedades:', e); }
}

// ── DASHBOARD ─────────────────────────────────────────────
async function renderDash() {
  await cargarNovedades();
  const data=vis(), r=CU.rol;
  let badge='';
  if (r==='director-norte') badge='<span class="zp zp-n">🔵 Zona Norte</span>';
  else if (r==='director-sur') badge='<span class="zp zp-s">🟣 Zona Sur</span>';
  else if (r==='coordinador-norte') badge='<span class="zp zp-coord">🟢 Coord. Zona Norte</span>';
  else if (r==='coordinador-sur') badge='<span class="zp zp-coord">🟢 Coord. Zona Sur</span>';
  else if (r==='gerente'||r==='admin') badge='<span class="zp zp-g">🌍 Global</span>';
  else badge=`<span class="zp zp-${CU.zona?.toLowerCase()==='norte'?'n':'s'}">${(CU.concesiones||[]).join(' · ')||CU.zona}</span>`;
  document.getElementById('dzbadge').innerHTML=badge;
  document.getElementById('dsub').textContent=r==='supervisor'
    ?`Mis novedades — ${(CU.concesiones||[]).join(', ')} (${CU.zona})`
    :`${data.length} novedades visibles según su nivel de acceso`;
  document.getElementById('s0').textContent=data.length;
  document.getElementById('s1').textContent=data.filter(n=>n.nivel==='CRITICA').length;
  document.getElementById('s2').textContent=data.filter(n=>n.nivel==='MEDIA').length;
  document.getElementById('s3').textContent=data.filter(n=>n.nivel==='BAJA').length;
  barchart(data,'area',document.getElementById('d-area'),{MANTENIMIENTO:'#e42421',INSUMOS:'#f0a832',BIOMEDICOS:'#294996',TH:'#1a7a3c',TECNOLOGIA:'#8b5cf6',SST:'#e67e22',NOMINA:'#1abc9c'});
  const rec=[...data].slice(0,5);
  const rd=document.getElementById('d-rec');
  if (!rec.length) { rd.innerHTML=empty('⏱','Sin novedades aún.'); return; }
  rd.innerHTML=rec.map(n=>`
    <div style="padding:9px 0;border-bottom:1px solid var(--border);font-size:.78rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span class="badge b-area">${n.area}</span>
        <span class="badge b-${n.nivel.toLowerCase()}">${n.nivel}</span>
      </div>
      <div style="font-weight:500">${n.puesto} — <span style="color:var(--muted)">${n.concesion}</span></div>
      <div style="color:var(--muted);font-size:.7rem;margin-top:2px">${n.tipo} · ${n.name} · ${n.fecha}</div>
    </div>`).join('');
  const cc=document.getElementById('d-concard');
  if (r!=='supervisor') { cc.style.display='block'; barchart(data,'concesion',document.getElementById('d-con')); }
  else cc.style.display='none';
}

// ── HISTORIAL ─────────────────────────────────────────────
async function renderHist() {
  await cargarNovedades();
  const r=CU.rol; let badge='', sub='';
  if (r==='supervisor') {
    badge=`<span class="zp zp-${CU.zona?.toLowerCase()==='norte'?'n':'s'}">${(CU.concesiones||[]).join(' · ')||CU.zona}</span>`;
    sub=`Sus propias novedades. Concesiones: ${(CU.concesiones||[]).join(', ')||'—'}`;
  } else if (r==='coordinador-norte') { badge='<span class="zp zp-coord">🟢 Zona Norte</span>'; sub='Novedades Zona Norte.'; }
  else if (r==='coordinador-sur')  { badge='<span class="zp zp-coord">🟢 Zona Sur</span>';  sub='Novedades Zona Sur.'; }
  else if (r==='director-norte')   { badge='<span class="zp zp-n">Zona Norte</span>';        sub='Novedades Zona Norte.'; }
  else if (r==='director-sur')     { badge='<span class="zp zp-s">Zona Sur</span>';          sub='Novedades Zona Sur.'; }
  else { badge='<span class="zp zp-g">Global</span>'; sub='Acceso completo a todas las novedades.'; }
  document.getElementById('hbadge').innerHTML=badge;
  document.getElementById('hsub').textContent=sub;
  renderTbl();
}

function renderTbl() {
  let data=vis();
  if (fBq) { const q=fBq.toLowerCase(); data=data.filter(n=>JSON.stringify(n).toLowerCase().includes(q)); }
  if (fAr) data=data.filter(n=>n.area===fAr);
  if (fNv) data=data.filter(n=>n.nivel===fNv);
  document.getElementById('tcount').textContent=`Mostrando ${data.length} novedad(es)`;
  const tb=document.getElementById('tbody');
  if (!data.length) { tb.innerHTML=`<tr><td colspan="9">${empty('📋','No hay registros que coincidan.')}</td></tr>`; return; }
  tb.innerHTML=data.map(n=>`<tr>
    <td style="font-weight:700;color:var(--muted)">#${n.id}</td>
    <td class="tdm" style="white-space:nowrap;font-size:.72rem">${n.fecha}</td>
    <td><span class="badge b-${n.zona?.toLowerCase()==='norte'?'norte':'sur'}">${n.zona}</span></td>
    <td style="font-size:.8rem">${n.concesion}</td>
    <td style="font-size:.8rem">${n.puesto}</td>
    <td><span class="badge b-area">${n.area}</span></td>
    <td class="tdm">${n.tipo}</td>
    <td><span class="badge b-${n.nivel.toLowerCase()}">${n.nivel}</span></td>
    <td class="tdm">${n.name}</td>
  </tr>`).join('');
}
function fh(v) { fBq=v; renderTbl(); }
function fa2(v) { fAr=v; renderTbl(); }
function fn2(v) { fNv=v; renderTbl(); }

function exportCSV() {
  const data=vis();
  if (!data.length) { alert('Sin datos para exportar.'); return; }
  const h=['ID','Fecha','Zona','Concesion','Puesto','Movil','Area','Tipo','Nivel','Descripcion','Usuario','Nombre'];
  const rows=data.map(n=>[n.id,n.fecha,n.zona,n.concesion,n.puesto,n.movil||'—',n.area,n.tipo,n.nivel,
    `"${(n.descripcion||'').replace(/"/g,'""')}"`,n.user,n.name].join(','));
  const csv=[h.join(','),...rows].join('\n');
  const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download='novedades_sismedica_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
}

// ── REPORTES ──────────────────────────────────────────────
async function renderRep() {
  try {
    const data = await API.get('/api/reportes/resumen');
    const mkChart = (rows, field, el, colorMap={}) => {
      if (!rows.length) { el.innerHTML=empty('📊','Sin datos.'); return; }
      const counts={}; rows.forEach(r=>{counts[r[field]]=parseInt(r.total);});
      const max=Math.max(...Object.values(counts));
      const dc=['#e42421','#294996','#f0a832','#1a7a3c','#8b5cf6','#1abc9c','#e67e22']; let i=0;
      el.innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
        const c=colorMap[k]||(dc[i++%dc.length]);
        return `<div class="br"><div class="bl" style="font-size:.7rem">${k}</div><div class="bt"><div class="bf" style="width:${(v/max*100).toFixed(0)}%;background:${c}"></div></div><div class="bc">${v}</div></div>`;
      }).join('');
    };
    mkChart(data.porArea,'area',document.getElementById('r-area'),{MANTENIMIENTO:'#e42421',INSUMOS:'#f0a832',BIOMEDICOS:'#294996',TH:'#1a7a3c',TECNOLOGIA:'#8b5cf6',SST:'#e67e22',NOMINA:'#1abc9c'});
    mkChart(data.porNivel,'nivel',document.getElementById('r-niv'),{BAJA:'#1a7a3c',MEDIA:'#f0a832',CRITICA:'#e42421'});
    mkChart(data.porConcesion,'concesion',document.getElementById('r-con'));
    const rz=document.getElementById('r-zona-card');
    if (CU.rol==='admin'||CU.rol==='gerente') {
      rz.style.display='block';
      mkChart(data.porZona,'zona',document.getElementById('r-zona'),{NORTE:'#294996',SUR:'#5a6e9a'});
    } else rz.style.display='none';
  } catch(e) { console.error('Reportes error:', e); }
}

// ── USUARIOS (ADMIN) ──────────────────────────────────────
async function renderUsers() {
  try {
    const data = await API.get('/api/usuarios');
    data.usuarios.forEach(u => {
      RT_NOMBRES[u.username]=u.nombre; RT_ACTIVO[u.username]=u.activo;
      RT_ZONA[u.username]=u.zona; ASIGNACIONES[u.username]=u.concesiones||[];
    });
    const sups=data.usuarios.filter(u=>u.rol==='supervisor');
    const active=sups.filter(u=>u.activo).length, vacant=sups.filter(u=>!u.activo).length;
    const noCon=sups.filter(u=>u.activo&&!(u.concesiones||[]).length).length;
    document.getElementById('u-stat-act').textContent=active;
    document.getElementById('u-stat-vac').textContent=vacant;
    document.getElementById('u-stat-nocon').textContent=noCon;
    document.getElementById('u-stat-slots').textContent=20-active;
    let filtered=sups;
    if (uFilter==='activos') filtered=sups.filter(u=>u.activo);
    if (uFilter==='vacios')  filtered=sups.filter(u=>!u.activo);
    if (uFilter==='nocon')   filtered=sups.filter(u=>u.activo&&!(u.concesiones||[]).length);
    if (uFilter==='norte')   filtered=sups.filter(u=>u.zona==='NORTE');
    if (uFilter==='sur')     filtered=sups.filter(u=>u.zona==='SUR');
    if (uSearch) filtered=filtered.filter(u=>(u.nombre+u.username+(u.zona||'')).toLowerCase().includes(uSearch));
    const supHtml=filtered.map(u=>{
      const cons=u.concesiones||[];
      const conInfo=u.activo
        ?(cons.length?cons.map(c=>`<span class="con-chip" style="font-size:.6rem;padding:1px 6px;cursor:default">${c}</span>`).join('')
          :'<span style="font-size:.7rem;color:var(--red)">⚠️ Sin concesiones</span>')
        :'<span style="font-size:.7rem;color:var(--muted);font-style:italic">Sin asignar</span>';
      return `<div class="usr-row${u.activo?'':' inactive'}${asignUser===u.username?' selected':''}" onclick="openEdit('${u.username}')">
        <div class="ua" style="background:${AVC.supervisor}22;color:${AVC.supervisor}">${u.nombre.charAt(0).toUpperCase()}</div>
        <div style="flex:1;min-width:0">
          <div class="un">${u.nombre} <span style="color:var(--muted);font-size:.7rem">@${u.username}</span></div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:2px">
            ${u.zona?`<span class="badge b-${u.zona.toLowerCase()==='norte'?'norte':'sur'}" style="font-size:.6rem">${u.zona}</span>`:'<span style="font-size:.68rem;color:var(--muted)">Sin zona</span>'}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">${conInfo}</div>
        </div>
        <div class="${u.activo?'usr-badge-active':'usr-badge-inactive'}"></div>
      </div>`;
    }).join('');
    const others=data.usuarios.filter(u=>u.rol!=='supervisor').map(u=>`
      <div class="usr-row" style="cursor:default">
        <div class="ua" style="background:${AVC[u.rol]||'#888'}22;color:${AVC[u.rol]||'#888'}">${u.nombre.charAt(0)}</div>
        <div style="flex:1"><div class="un">${u.nombre} <span style="color:var(--muted);font-size:.72rem">@${u.username}</span></div>
          <span class="${RC[u.rol]||'rc'}" style="font-size:.62rem;padding:2px 8px">${RL[u.rol]||u.rol}</span>
        </div><div class="usr-badge-active"></div>
      </div>`).join('');
    const sep=(txt)=>`<div style="padding:8px 16px;font-size:.63rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;background:var(--surface2);border-bottom:1px solid var(--border)">${txt}</div>`;
    document.getElementById('users-list').innerHTML=sep(`Supervisores (${filtered.length} de 20)`)+supHtml+sep('Otros usuarios')+others;
  } catch(e) { console.error('Usuarios error:', e); }
}

function setUFilter(f,el) { uFilter=f; document.querySelectorAll('.filter-tabs .ftab').forEach(t=>t.classList.remove('act')); if(el)el.classList.add('act'); renderUsers(); }
function filterUsers(v) { uSearch=v.toLowerCase(); renderUsers(); }

function openEdit(userKey) {
  asignUser=userKey;
  const nombre=RT_NOMBRES[userKey]||userKey, zona=RT_ZONA[userKey], activo=RT_ACTIVO[userKey]!==false;
  document.getElementById('edit-empty').style.display='none';
  document.getElementById('edit-panel').style.display='block';
  const av=document.getElementById('ep-avatar'); av.textContent=nombre.charAt(0).toUpperCase(); av.style.background=AVC.supervisor+'22'; av.style.color=AVC.supervisor;
  document.getElementById('ep-title').textContent=nombre;
  document.getElementById('ep-user').textContent=`@${userKey} · Supervisor`;
  document.getElementById('ep-nombre').value=nombre===userKey?'':nombre;
  document.getElementById('ep-nombre-hint').textContent=nombre===userKey?'⚠️ Sin nombre asignado.':'';
  ['btn-activar','btn-ocultar'].forEach(id=>document.getElementById(id).className='nb');
  document.getElementById(activo?'btn-activar':'btn-ocultar').classList.add(activo?'sel-activo':'sel-oculto');
  ['btn-zona-norte','btn-zona-sur'].forEach(id=>document.getElementById(id).className='nb');
  if (zona==='NORTE') document.getElementById('btn-zona-norte').classList.add('sel-norte');
  else if (zona==='SUR') document.getElementById('btn-zona-sur').classList.add('sel-sur');
  renderEpChips(userKey); buildEpConSel(userKey); renderEpHistory(userKey);
}
function closeEdit() { asignUser=null; document.getElementById('edit-panel').style.display='none'; document.getElementById('edit-empty').style.display='block'; renderUsers(); }
function renderEpChips(u) { const cons=getSupConcesiones(u), div=document.getElementById('ep-chips'); if(!cons.length){div.innerHTML='<span class="con-chip-empty">Sin concesiones</span>';return;} div.innerHTML=cons.map(c=>`<span class="con-chip">${c}<button onclick="removeCon('${u}','${c}')" title="Quitar">✕</button></span>`).join(''); }
function buildEpConSel(u) { const zona=RT_ZONA[u], sel=document.getElementById('ep-con-sel'); sel.innerHTML='<option value="">— Agregar concesión —</option>'; if(!zona){sel.disabled=true;return;} sel.disabled=false; const cur=getSupConcesiones(u); Object.keys(CAT[zona]||{}).sort().filter(c=>!cur.includes(c)).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);}); }
function renderEpHistory(u) { const hist=asignHistory[u]||[], div=document.getElementById('ep-history'); if(!hist.length){div.innerHTML='<span style="font-style:italic">Sin cambios en esta sesión.</span>';return;} div.innerHTML=hist.map(h=>`<div style="padding:5px 0;border-bottom:1px solid var(--border);display:flex;gap:8px"><span style="color:var(--accent2);font-size:.68rem;font-weight:600">${h.action}</span><span style="flex:1">${h.detail}</span><span style="white-space:nowrap;font-size:.68rem">${h.ts?.split(',')[1]||h.ts}</span></div>`).join(''); }
function logChange(u,action,detail) { if(!asignHistory[u])asignHistory[u]=[]; asignHistory[u].unshift({ts:new Date().toLocaleString('es-CO',{hour12:false}),action,detail}); }

async function saveNombre() { if(!asignUser)return; const val=document.getElementById('ep-nombre').value.trim(); if(!val){alert('El nombre no puede estar vacío.');return;} try{await API.patch(`/api/usuarios/${asignUser}`,{nombre:val});RT_NOMBRES[asignUser]=val;logChange(asignUser,'NOMBRE',val);openEdit(asignUser);renderUsers();if(CU.user===asignUser){document.getElementById('tun').textContent=val;document.getElementById('fsu').value=val;}}catch(e){alert(e.message);} }
async function setActivo(val) { if(!asignUser||RT_ACTIVO[asignUser]===val)return; try{await API.patch(`/api/usuarios/${asignUser}`,{activo:val});RT_ACTIVO[asignUser]=val;logChange(asignUser,'VISIBILIDAD',val?'Activo':'Oculto');openEdit(asignUser);renderUsers();}catch(e){alert(e.message);} }
async function setZona(zona) { if(!asignUser||RT_ZONA[asignUser]===zona)return; try{await API.patch(`/api/usuarios/${asignUser}`,{zona});const old=RT_ZONA[asignUser];RT_ZONA[asignUser]=zona;if(old&&old!==zona)ASIGNACIONES[asignUser]=[];logChange(asignUser,'ZONA',zona);openEdit(asignUser);renderUsers();}catch(e){alert(e.message);} }
async function addCon() { if(!asignUser)return; const val=document.getElementById('ep-con-sel').value; if(!val)return; try{await API.post(`/api/usuarios/${asignUser}/concesiones`,{concesion:val});const cur=getSupConcesiones(asignUser);if(!cur.includes(val))ASIGNACIONES[asignUser]=[...cur,val];logChange(asignUser,'AGREGAR',val);openEdit(asignUser);renderUsers();if(CU.user===asignUser&&CU.concesiones)CU.concesiones.push(val);}catch(e){alert(e.message);} }
async function removeCon(u,con) { try{await API.delete(`/api/usuarios/${u}/concesiones/${encodeURIComponent(con)}`);ASIGNACIONES[u]=getSupConcesiones(u).filter(c=>c!==con);logChange(u,'QUITAR',con);openEdit(u);renderUsers();}catch(e){alert(e.message);} }

// ── CONTROL DIARIO ────────────────────────────────────────
function setCtrlFilter(f,el) { ctrlFilter=f; document.querySelectorAll('.filter-tabs .ftab').forEach(t=>t.classList.remove('act')); if(el)el.classList.add('act'); renderControlCards(); }
function getHoyStr() { const n=new Date(); return `${n.getDate().toString().padStart(2,'0')}/${(n.getMonth()+1).toString().padStart(2,'0')}/${n.getFullYear()}`; }

async function renderControl() {
  const now=new Date();
  document.getElementById('ctrl-fecha').textContent=now.toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).toUpperCase();
  try {
    const data = await API.get('/api/novedades/hoy');
    const ss=data.reporte;
    document.getElementById('ctrl-n-ok').textContent=ss.filter(s=>s.status==='ok').length;
    document.getElementById('ctrl-n-miss').textContent=ss.filter(s=>s.status==='miss').length;
    document.getElementById('ctrl-n-warn').textContent=ss.filter(s=>s.status==='warn').length;
    document.getElementById('ctrl-total-reg').textContent=ss.reduce((a,s)=>a+s.registros_hoy,0);
    const miss=ss.filter(s=>s.status==='miss');
    const ad=document.getElementById('ctrl-alerta');
    if (miss.length) { ad.style.display='flex'; document.getElementById('ctrl-alerta-count').textContent=`${miss.length} supervisor(es)`; document.getElementById('ctrl-alerta-list').innerHTML=miss.map(s=>`⚠️ <b>${s.nombre}</b> — ${(s.concesiones||[]).join(', ')||'Sin concesión'} (${s.zona})`).join('<br>'); }
    else ad.style.display='none';
    const nav=document.getElementById('nav-control'); if(nav){const e=nav.querySelector('.notif-dot');if(e)e.remove();if(miss.length){const d=document.createElement('span');d.className='notif-dot';nav.appendChild(d);}}
    window._supStatus=ss.map(s=>({user:s.username,name:s.nombre,zona:s.zona,concesiones:s.concesiones,status:s.status,count:s.registros_hoy,areas:[...new Set((s.detalle||[]).map(d=>d.area))],lastReg:s.detalle?.[0]?{fecha:`${getHoyStr()}, ${s.detalle[0].hora}`,concesion:s.detalle[0].concesion,area:s.detalle[0].area}:null}));
    renderControlCards(); renderControlTable(window._supStatus);
  } catch(e) { console.error('Control error:', e); }
}

function renderControlCards() {
  const ss=window._supStatus||[], r=CU.rol, f=ctrlFilter;
  const applyF=list=>{if(f==='miss')return list.filter(s=>s.status==='miss');if(f==='warn')return list.filter(s=>s.status==='warn');if(f==='ok')return list.filter(s=>s.status==='ok');if(f==='norte')return list.filter(s=>s.zona==='NORTE');if(f==='sur')return list.filter(s=>s.zona==='SUR');return list;};
  const norte=applyF(ss.filter(s=>s.zona==='NORTE')), sur=applyF(ss.filter(s=>s.zona==='SUR'));
  const showN=!['director-sur','coordinador-sur'].includes(r)&&f!=='sur';
  const showS=!['director-norte','coordinador-norte'].includes(r)&&f!=='norte';
  document.getElementById('ctrl-lista-norte').style.display=showN?'block':'none';
  document.getElementById('ctrl-lista-sur').style.display=showS?'block':'none';
  document.getElementById('ctrl-cards-norte').innerHTML=norte.length?norte.map(supCard).join(''):empty('','Sin datos.');
  document.getElementById('ctrl-cards-sur').innerHTML=sur.length?sur.map(supCard).join(''):empty('','Sin datos.');
}

function supCard(s) {
  const sl={ok:'✅ Reportó hoy',warn:'⚡ Solo 1 registro',miss:'❌ Sin reporte hoy'};
  const bc={ok:'sb-ok',warn:'sb-warn',miss:'sb-miss'};
  const ac={ok:'rgba(26,122,60,.15)',warn:'rgba(240,168,50,.15)',miss:'rgba(228,36,33,.15)'};
  const at={ok:'#1a7a3c',warn:'#f0a832',miss:'#e42421'};
  const lastInfo=s.lastReg?`Último: ${(s.lastReg.fecha||'').split(', ')[1]||''} — <b>${s.lastReg.area}</b> (${s.lastReg.concesion})`:'Sin registros hoy';
  const cons=(s.concesiones&&s.concesiones.length)?s.concesiones.map(c=>`<span class="con-chip" style="font-size:.62rem;padding:2px 7px;cursor:default">${c}</span>`).join(''):'<span style="font-size:.7rem;color:var(--red)">⚠️ Sin concesiones</span>';
  return `<div class="sup-card ${s.status}">
    <div class="sup-avatar" style="background:${ac[s.status]};color:${at[s.status]}">${s.name.charAt(0)}</div>
    <div class="sup-info">
      <div class="sup-name">${s.name} <span style="color:var(--muted);font-size:.72rem">@${s.user}</span></div>
      <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">${cons}</div>
      <div class="sup-meta" style="margin-top:4px">${lastInfo}</div>
      ${s.areas?.length?`<div style="margin-top:2px;font-size:.7rem;color:var(--muted)">Áreas: ${s.areas.join(', ')}</div>`:''}
    </div>
    <div class="sup-status">
      <span class="sup-badge ${bc[s.status]}">${sl[s.status]}</span>
      <span class="sup-count">${s.count} registro${s.count!==1?'s':''} hoy</span>
    </div>
  </div>`;
}

function renderControlTable(ss) {
  const tbody=document.getElementById('ctrl-tbody');
  document.getElementById('ctrl-tbl-sub').textContent=`${ss.length} supervisores · ${getHoyStr()}`;
  tbody.innerHTML=ss.sort((a,b)=>({miss:0,warn:1,ok:2}[a.status]-{miss:0,warn:1,ok:2}[b.status])).map(s=>{
    const bc={ok:'b-baja',warn:'b-media',miss:'b-critica'};
    const sl={ok:'Al día',warn:'Incompleto',miss:'Sin reporte'};
    const lastT=s.lastReg?(s.lastReg.fecha||'—').split(', ')[1]||'—':'—';
    const areas=s.areas?.length?s.areas.map(a=>`<span class="badge b-area" style="margin:1px">${a}</span>`).join(''):'—';
    const cons=(s.concesiones&&s.concesiones.length)?s.concesiones.map(c=>`<span class="badge" style="background:rgba(41,73,150,.1);color:var(--accent2);margin:1px;font-size:.62rem">${c}</span>`).join(''):'⚠️';
    return `<tr>
      <td style="font-weight:600">${s.name}<br><span class="tdm">@${s.user}</span></td>
      <td>${cons}</td>
      <td><span class="badge b-${s.zona?.toLowerCase()==='norte'?'norte':'sur'}">${s.zona}</span></td>
      <td style="text-align:center;font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:${s.count===0?'var(--red)':s.count===1?'var(--gold)':'var(--green)'}">${s.count}</td>
      <td class="tdm">${lastT}</td><td>${areas}</td>
      <td><span class="badge ${bc[s.status]}">${sl[s.status]}</span></td>
    </tr>`;
  }).join('');
}
setInterval(()=>{if(CU&&document.getElementById('pg-control')?.classList.contains('active'))renderControl();},60000);

// ── AUDITORÍA ─────────────────────────────────────────────
async function renderAudit() {
  try {
    const data = await API.get('/api/auditoria');
    const al=document.getElementById('audit-log');
    if (!data.registros.length) { al.innerHTML=empty('🕵️','Sin eventos registrados.'); return; }
    const colors={LOGIN:'#1a7a3c',LOGOUT:'#e42421',REGISTRO:'#294996',EXPORTAR:'#f0a832',EDICION:'#8b5cf6',ASIGNACION:'#0e7a4e',CAMBIO_PASS:'#e67e22'};
    al.innerHTML=data.registros.map(a=>`<div class="ai">
      <div class="ad" style="background:${colors[a.accion]||'#6b7289'}"></div>
      <div style="flex:1;line-height:1.4"><b>${a.accion}</b> — <span style="color:var(--muted)">${a.detalle||''}</span><br>
      <span style="font-size:.7rem;color:var(--muted)">👤 ${a.usuario} (${RL[a.rol]||a.rol})</span></div>
      <div class="at">${a.fecha_formato}</div>
    </div>`).join('');
  } catch(e) { console.error('Auditoría error:',e); }
}

// ── PERMISOS ──────────────────────────────────────────────
function renderPerms() {
  const roles=['Administrador','Gerente','Dir. Norte','Dir. Sur','Coord. Norte','Coord. Sur','Supervisor'];
  const perms=[
    {l:'Ver TODAS',         v:['✅','✅','❌','❌','❌','❌','❌']},
    {l:'Ver Zona Norte',    v:['✅','✅','✅','❌','✅','❌','⚡']},
    {l:'Ver Zona Sur',      v:['✅','✅','❌','✅','❌','✅','⚡']},
    {l:'Registrar',         v:['✅','❌','❌','❌','✅','✅','✅']},
    {l:'Exportar CSV',      v:['✅','✅','✅','✅','✅','✅','✅']},
    {l:'Reportes globales', v:['✅','✅','❌','❌','❌','❌','❌']},
    {l:'Reportes zona',     v:['✅','✅','✅','✅','✅','✅','❌']},
    {l:'Control Diario',    v:['✅','✅','✅','✅','✅','✅','❌']},
    {l:'Gestionar usuarios',v:['✅','❌','❌','❌','❌','❌','❌']},
    {l:'Log auditoría',     v:['✅','❌','❌','❌','❌','❌','❌']},
  ];
  const cs=v=>v==='✅'?'py':v==='❌'?'pn':'pp';
  document.getElementById('perm-grid').style.gridTemplateColumns='160px repeat(7,1fr)';
  let h=['FUNCIÓN',...roles].map(r=>`<div class="ph">${r}</div>`).join('');
  perms.forEach(p=>{h+=`<div class="ph prl">${p.l}</div>`;p.v.forEach(v=>{h+=`<div class="pc ${cs(v)}" style="font-size:1rem">${v}</div>`;});});
  document.getElementById('perm-grid').innerHTML=h;
  const rd=[
    {r:'Administrador',c:AVC.admin,d:'Control total. Gestiona usuarios, roles, permisos y auditoría.'},
    {r:'Gerente',c:AVC.gerente,d:'Visibilidad global de ambas zonas. Solo lectura.'},
    {r:'Director Zona Norte',c:AVC['director-norte'],d:'Ve y reporta todas las novedades de Zona Norte.'},
    {r:'Director Zona Sur',c:AVC['director-sur'],d:'Ve y reporta todas las novedades de Zona Sur.'},
    {r:'Coordinador Norte',c:AVC['coordinador-norte'],d:'Registra novedades y gestiona el control diario de Zona Norte.'},
    {r:'Coordinador Sur',c:AVC['coordinador-sur'],d:'Registra novedades y gestiona el control diario de Zona Sur.'},
    {r:'Supervisor',c:AVC.supervisor,d:'Registra novedades. Solo ve sus propios registros.'},
  ];
  document.getElementById('role-desc').innerHTML=rd.map(x=>`
    <div style="display:flex;gap:11px;padding:11px 0;border-bottom:1px solid var(--border);align-items:flex-start;">
      <div style="width:9px;height:9px;border-radius:50%;background:${x.c};flex-shrink:0;margin-top:4px"></div>
      <div><div style="font-weight:600;font-size:.84rem;margin-bottom:2px">${x.r}</div>
      <div style="font-size:.78rem;color:var(--muted);line-height:1.5">${x.d}</div></div>
    </div>`).join('');
}

// ── SEGURIDAD ─────────────────────────────────────────────
function renderSec() {
  document.getElementById('sec-info').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.82rem">
      <div><span style="color:var(--muted)">Usuario:</span> <b>${CU.user}</b></div>
      <div><span style="color:var(--muted)">Nombre:</span> <b>${CU.nombre}</b></div>
      <div><span style="color:var(--muted)">Rol:</span> <span class="${RC[CU.rol]}" style="font-size:.65rem;padding:2px 8px">${RL[CU.rol]}</span></div>
      <div><span style="color:var(--muted)">Zona:</span> <b>${CU.zona||'Global'}</b></div>
      <div><span style="color:var(--muted)">Novedades visibles:</span> <b style="color:var(--accent2)">${vis().length}</b></div>
      <div><span style="color:var(--muted)">Estado:</span> <span class="badge" style="background:rgba(26,122,60,.12);color:var(--green)">● Activa</span></div>
    </div>
    <div style="margin-top:11px;padding:10px 13px;background:var(--surface2);border-radius:8px;font-size:.76rem;color:var(--muted);border:1px solid var(--border);line-height:1.6">
      ⚠️ <b style="color:var(--gold)">Aviso:</b> No comparta sus credenciales. Todas las acciones quedan auditadas con usuario, rol y timestamp.
    </div>`;
}

// ── CHART ─────────────────────────────────────────────────
function barchart(data, field, container, colorMap={}) {
  if (!data.length) { container.innerHTML=empty('📊','Sin datos disponibles.'); return; }
  const counts={}; data.forEach(n=>{const v=n[field]||'—';counts[v]=(counts[v]||0)+1;});
  const max=Math.max(...Object.values(counts));
  const dc=['#e42421','#294996','#f0a832','#1a7a3c','#8b5cf6','#1abc9c','#e67e22']; let i=0;
  container.innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
    const c=colorMap[k]||(dc[i++%dc.length]);
    return `<div class="br"><div class="bl">${k}</div><div class="bt"><div class="bf" style="width:${(v/max*100).toFixed(0)}%;background:${c}"></div></div><div class="bc">${v}</div></div>`;
  }).join('');
}
function empty(icon, msg) { return `<div class="empty"><div class="ei">${icon}</div><div class="em">${msg}</div></div>`; }

// ── INACTIVITY ────────────────────────────────────────────
function resetIA() {
  clearTimeout(itmr); clearTimeout(iwmr);
  document.getElementById('iw').style.display='none';
  if (!CU) return;
  itmr=setTimeout(()=>{iwc=30;document.getElementById('iw').style.display='block';countdown();},29.5*60*1000);
}
function countdown() {
  document.getElementById('iwc').textContent=iwc;
  if (iwc<=0){doLogout();return;}
  iwc--; iwmr=setTimeout(countdown,1000);
}
document.addEventListener('mousemove', ()=>{if(CU)resetIA();});
document.addEventListener('keydown', ()=>{if(CU)resetIA();});


// ============================================================
// ACTUALIZACIÓN OPERATIVA: estados, catálogos, clave inicial y dashboard
// ============================================================
async function cargarCatalogos() {
  try {
    const data = await API.get('/api/catalogos');
    if (data.CAT) {
      Object.keys(CAT).forEach(k => delete CAT[k]);
      Object.assign(CAT, data.CAT);
    }
    if (data.MOV) {
      Object.keys(MOV).forEach(k => delete MOV[k]);
      Object.assign(MOV, data.MOV);
    }
  } catch (e) { console.warn('Catálogo remoto no disponible, usando catálogo local:', e.message); }
}

function ensureUpgradePages() {
  if (!document.getElementById('pg-catalogos')) {
    const content = document.querySelector('.content');
    const page = document.createElement('div');
    page.className = 'page'; page.id = 'pg-catalogos';
    page.innerHTML = `
      <div class="pgt">Catálogos Operativos</div>
      <div class="pgs">Administración de concesiones, puestos de trabajo y placas/UM utilizadas en el registro de novedades.</div>
      <div class="g3">
        <div class="card"><div class="ct2">➕ Concesión</div><div class="fg" style="margin-top:12px"><label>Zona</label><select id="cat-zona"><option>NORTE</option><option>SUR</option></select></div><div class="fg"><label>Concesión</label><input id="cat-con" placeholder="Nombre de concesión"></div><button class="btn btn-p" onclick="addCatalogCon()">Agregar concesión</button></div>
        <div class="card"><div class="ct2">➕ Puesto de trabajo</div><div class="fg" style="margin-top:12px"><label>Zona</label><select id="cat-zona-p" onchange="buildCatSelects()"><option>NORTE</option><option>SUR</option></select></div><div class="fg"><label>Concesión</label><select id="cat-con-p"></select></div><div class="fg"><label>Puesto</label><input id="cat-puesto" placeholder="Nombre del puesto"></div><button class="btn btn-p" onclick="addCatalogPuesto()">Agregar puesto</button></div>
        <div class="card"><div class="ct2">➕ Placa / UM</div><div class="fg" style="margin-top:12px"><label>Zona</label><select id="cat-zona-m" onchange="buildCatSelects()"><option>NORTE</option><option>SUR</option></select></div><div class="fg"><label>Concesión</label><select id="cat-con-m" onchange="buildCatSelects()"></select></div><div class="fg"><label>Puesto</label><select id="cat-puesto-m"></select></div><div class="fg"><label>Placa / móvil</label><input id="cat-placa" placeholder="UM123 ABC456"></div><button class="btn btn-p" onclick="addCatalogPlaca()">Agregar placa</button></div>
      </div>
      <div class="card"><div class="ch"><div class="ct2">📚 Catálogo actual</div><button class="btn btn-s btn-sm" onclick="renderCatalogos()">Actualizar</button></div><div id="catalog-list"></div></div>`;
    content.appendChild(page);
  }
  if (!document.getElementById('pwd-modal')) {
    const modal = document.createElement('div');
    modal.id = 'pwd-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:2000;background:rgba(13,27,62,.55);align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `<div class="card" style="max-width:460px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25)"><div class="pgt" style="font-size:1.35rem">Cambio obligatorio de contraseña</div><div class="pgs">Por seguridad, debe cambiar la contraseña inicial antes de continuar.</div><div id="pwd-err" class="alert aerr"></div><div id="pwd-ok" class="alert aok"></div><div class="fg"><label>Contraseña actual</label><input id="pwd-current" type="password"></div><div class="fg"><label>Nueva contraseña</label><input id="pwd-new" type="password"></div><div class="fg"><label>Confirmar nueva contraseña</label><input id="pwd-confirm" type="password"></div><div style="font-size:.74rem;color:var(--muted);margin-top:8px;line-height:1.5">Debe tener mínimo 12 caracteres e incluir al menos 3 tipos: mayúsculas, minúsculas, números o símbolos.</div><div class="fa"><button class="btn btn-p" onclick="changeOwnPassword(true)">Cambiar contraseña</button></div></div>`;
    document.body.appendChild(modal);
  }
}

const _origInitApp = initApp;
initApp = function() {
  ensureUpgradePages();
  cargarCatalogos().then(() => { try { fc(); buildCatSelects(); } catch {} });
  _origInitApp();
  if (CU && CU.must_change_password) setTimeout(() => showPasswordModal(true), 300);
};

const _origBuildSidebar = buildSidebar;
buildSidebar = function() {
  _origBuildSidebar();
  if (CU && CU.rol === 'admin' && !document.getElementById('nav-catalogos')) {
    const side = document.getElementById('sidebar');
    const marker = document.getElementById('nav-permisos');
    const item = document.createElement('div');
    item.className='ni'; item.id='nav-catalogos'; item.onclick=()=>showPage('catalogos');
    item.innerHTML='<span class="nico">🗂</span><span>Catálogos</span>';
    side.insertBefore(item, marker || side.lastChild);
  }
  if (!document.getElementById('nav-mi-cuenta')) {
    const side = document.getElementById('sidebar');
    const item = document.createElement('div');
    item.className='ni'; item.id='nav-mi-cuenta'; item.onclick=()=>showPasswordModal(false);
    item.innerHTML='<span class="nico">🔐</span><span>Mi clave</span>';
    side.appendChild(item);
  }
};

const _origShowPage = showPage;
showPage = function(id) {
  if (CU && CU.must_change_password && id !== 'seguridad') { showPasswordModal(true); return; }
  _origShowPage(id);
  if (id === 'catalogos') renderCatalogos();
};

function showPasswordModal(forced) {
  ensureUpgradePages();
  const m=document.getElementById('pwd-modal');
  m.style.display='flex';
  m.dataset.forced=forced?'1':'0';
  document.getElementById('pwd-current').focus();
}
function hidePasswordModal() { document.getElementById('pwd-modal').style.display='none'; }
async function changeOwnPassword(forced=false) {
  const cur=document.getElementById('pwd-current').value;
  const np=document.getElementById('pwd-new').value;
  const cf=document.getElementById('pwd-confirm').value;
  const er=document.getElementById('pwd-err'), ok=document.getElementById('pwd-ok');
  er.style.display=ok.style.display='none';
  if (!cur||!np||!cf) { er.textContent='Complete todos los campos.'; er.style.display='flex'; return; }
  if (np!==cf) { er.textContent='La confirmación no coincide.'; er.style.display='flex'; return; }
  try {
    await API.post('/api/auth/change-password',{currentPassword:cur,newPassword:np});
    CU.must_change_password=false;
    ok.textContent='Contraseña actualizada correctamente.'; ok.style.display='flex';
    setTimeout(()=>{ hidePasswordModal(); showPage('dashboard'); }, 900);
  } catch(e) { er.textContent=e.message||'No fue posible cambiar la contraseña.'; er.style.display='flex'; }
}

function estadoBadge(e) {
  const cls={ABIERTA:'b-critica',GESTION:'b-media',CERRADA:'b-baja'}[e]||'b-area';
  return `<span class="badge ${cls}">${e||'ABIERTA'}</span>`;
}

async function cambiarEstadoNovedad(id, estado) {
  const detalle = estado==='ABIERTA' ? '' : prompt(`Detalle de gestión para cambiar a ${estado}:`, '') || '';
  try {
    await API.patch(`/api/novedades/${id}/estado`, { estado, detalle });
    await cargarNovedades();
    if (document.getElementById('pg-historial')?.classList.contains('active')) renderTbl();
    if (document.getElementById('pg-dashboard')?.classList.contains('active')) renderDash();
  } catch(e) { alert(e.message); }
}

const _origCargarNovedades = cargarNovedades;
cargarNovedades = async function() {
  await _origCargarNovedades();
  nov = nov.map(n => ({ ...n, estado: n.estado || 'ABIERTA' }));
};

const _origRenderDash = renderDash;
renderDash = async function() {
  await _origRenderDash();
  const data=vis();
  const abiertas=data.filter(n=>n.estado==='ABIERTA').length;
  const gestion=data.filter(n=>n.estado==='GESTION').length;
  const cerradas=data.filter(n=>n.estado==='CERRADA').length;
  const critAbiertas=data.filter(n=>n.nivel==='CRITICA'&&n.estado!=='CERRADA').length;
  document.getElementById('s0').textContent=data.length;
  document.getElementById('s1').textContent=critAbiertas;
  document.getElementById('s2').textContent=gestion;
  document.getElementById('s3').textContent=cerradas;
  const labels=document.querySelectorAll('#pg-dashboard .sc .sl');
  if(labels[1]) labels[1].textContent='Críticas abiertas';
  if(labels[2]) labels[2].textContent='En gestión';
  if(labels[3]) labels[3].textContent='Cerradas';
  let panel=document.getElementById('dash-estado-extra');
  if(!panel){panel=document.createElement('div');panel.id='dash-estado-extra';panel.className='card';document.querySelector('#pg-dashboard .sg').after(panel);}
  panel.innerHTML=`<div class="ch"><div class="ct2">🚦 Control por estado de novedad</div><div class="tdm">ABIERTA → GESTIÓN → CERRADA</div></div>
  <div class="g3"><div><div class="sl">Abiertas</div><div class="sv vr">${abiertas}</div></div><div><div class="sl">En gestión</div><div class="sv vg2">${gestion}</div></div><div><div class="sl">Cerradas</div><div class="sv vgr">${cerradas}</div></div></div>`;
};

renderTbl = function() {
  let data=vis();
  if (fBq) { const q=fBq.toLowerCase(); data=data.filter(n=>JSON.stringify(n).toLowerCase().includes(q)); }
  if (fAr) data=data.filter(n=>n.area===fAr);
  if (fNv) data=data.filter(n=>n.nivel===fNv);
  document.getElementById('tcount').textContent=`Mostrando ${data.length} novedad(es)`;
  const tb=document.getElementById('tbody');
  if (!data.length) { tb.innerHTML=`<tr><td colspan="10">${empty('📋','No hay registros que coincidan.')}</td></tr>`; return; }
  tb.innerHTML=data.map(n=>`<tr>
    <td style="font-weight:700;color:var(--muted)">#${n.id}</td>
    <td class="tdm" style="white-space:nowrap;font-size:.72rem">${n.fecha}</td>
    <td><span class="badge b-${n.zona?.toLowerCase()==='norte'?'norte':'sur'}">${n.zona}</span></td>
    <td style="font-size:.8rem">${n.concesion}</td>
    <td style="font-size:.8rem">${n.puesto}</td>
    <td><span class="badge b-area">${n.area}</span></td>
    <td class="tdm">${n.tipo}</td>
    <td><span class="badge b-${n.nivel.toLowerCase()}">${n.nivel}</span><br>${estadoBadge(n.estado)}</td>
    <td class="tdm">${n.name}</td>
    <td><select class="si" style="font-size:.72rem;padding:5px" onchange="cambiarEstadoNovedad(${n.id},this.value)"><option value="">Cambiar...</option><option value="ABIERTA">Abierta</option><option value="GESTION">Gestión</option><option value="CERRADA">Cerrada</option></select></td>
  </tr>`).join('');
};

const _origExportCSV = exportCSV;
exportCSV = function() {
  const data=vis();
  if (!data.length) { alert('Sin datos para exportar.'); return; }
  const h=['ID','Fecha','Zona','Concesion','Puesto','Movil','Area','Tipo','Nivel','Estado','Descripcion','Usuario','Nombre'];
  const rows=data.map(n=>[n.id,n.fecha,n.zona,n.concesion,n.puesto,n.movil||'—',n.area,n.tipo,n.nivel,n.estado||'ABIERTA',`"${(n.descripcion||'').replace(/"/g,'""')}"`,n.user,n.name].join(','));
  const csv=[h.join(','),...rows].join('\n');
  const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download='novedades_sismedica_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
};

const _origRenderRep = renderRep;
renderRep = async function() {
  await _origRenderRep();
  try {
    const data = await API.get('/api/reportes/resumen');
    let card=document.getElementById('r-estado-card');
    if(!card){card=document.createElement('div');card.id='r-estado-card';card.className='card';card.innerHTML='<div class="ct2" style="margin-bottom:14px">🚦 Por Estado</div><div id="r-estado"></div>';document.querySelector('#pg-reportes .g2')?.appendChild(card);}
    const rows=data.porEstado||[];
    if(!rows.length) document.getElementById('r-estado').innerHTML=empty('📊','Sin datos.');
    else {
      const total=rows.reduce((a,r)=>a+parseInt(r.total),0)||1;
      document.getElementById('r-estado').innerHTML=rows.map(r=>`<div class="br"><div class="bl">${r.estado}</div><div class="bt"><div class="bf" style="width:${(parseInt(r.total)/total*100).toFixed(0)}%;background:${r.estado==='CERRADA'?'#1a7a3c':r.estado==='GESTION'?'#f0a832':'#e42421'}"></div></div><div class="bc">${r.total}</div></div>`).join('');
    }
  } catch(e){}
};

function buildCatSelects() {
  const fill=(selId,zonaId)=>{const sel=document.getElementById(selId), z=document.getElementById(zonaId)?.value||'NORTE'; if(!sel)return; const old=sel.value; sel.innerHTML='<option value="">— Seleccione —</option>'; Object.keys(CAT[z]||{}).sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);}); sel.value=old;};
  fill('cat-con-p','cat-zona-p'); fill('cat-con-m','cat-zona-m');
  const z=document.getElementById('cat-zona-m')?.value||'NORTE', c=document.getElementById('cat-con-m')?.value, ps=document.getElementById('cat-puesto-m');
  if(ps){ps.innerHTML='<option value="">— Seleccione —</option>'; (CAT[z]?.[c]||[]).sort().forEach(p=>{const o=document.createElement('option');o.value=p;o.textContent=p;ps.appendChild(o);});}
}
async function renderCatalogos() {
  await cargarCatalogos(); buildCatSelects();
  const el=document.getElementById('catalog-list'); if(!el)return;
  el.innerHTML=Object.entries(CAT).map(([zona,cons])=>`<div class="card" style="padding:14px"><div class="ct2">${zona}</div>${Object.entries(cons).sort().map(([c,puestos])=>`<div style="border-top:1px solid var(--border);padding:10px 0"><div style="display:flex;justify-content:space-between;gap:8px"><b>${c}</b><button class="btn btn-s btn-sm" onclick="delCatalogCon('${zona}','${encodeURIComponent(c)}')">Eliminar concesión</button></div><div style="margin-top:6px">${(puestos||[]).map(p=>`<div style="font-size:.78rem;color:var(--muted);padding:3px 0">• ${p} <button class="btn btn-s btn-sm" onclick="delCatalogPuesto('${zona}','${encodeURIComponent(c)}','${encodeURIComponent(p)}')">Eliminar puesto</button> <span style="color:#294996">${(MOV[c+'|'+p]||[]).join(' · ')}</span></div>`).join('')||'<span class="tdm">Sin puestos</span>'}</div></div>`).join('')}</div>`).join('');
}
async function addCatalogCon(){try{await API.post('/api/catalogos/concesiones',{zona:document.getElementById('cat-zona').value,concesion:document.getElementById('cat-con').value});document.getElementById('cat-con').value='';renderCatalogos();}catch(e){alert(e.message);}}
async function addCatalogPuesto(){try{await API.post('/api/catalogos/puestos',{zona:document.getElementById('cat-zona-p').value,concesion:document.getElementById('cat-con-p').value,puesto:document.getElementById('cat-puesto').value});document.getElementById('cat-puesto').value='';renderCatalogos();}catch(e){alert(e.message);}}
async function addCatalogPlaca(){try{await API.post('/api/catalogos/placas',{zona:document.getElementById('cat-zona-m').value,concesion:document.getElementById('cat-con-m').value,puesto:document.getElementById('cat-puesto-m').value,placa:document.getElementById('cat-placa').value});document.getElementById('cat-placa').value='';renderCatalogos();}catch(e){alert(e.message);}}
async function delCatalogCon(z,c){if(!confirm('¿Eliminar concesión del catálogo?'))return;try{await API.delete(`/api/catalogos/concesiones/${z}/${c}`);renderCatalogos();}catch(e){alert(e.message);}}
async function delCatalogPuesto(z,c,p){if(!confirm('¿Eliminar puesto del catálogo?'))return;try{await API.delete(`/api/catalogos/puestos/${z}/${c}/${p}`);renderCatalogos();}catch(e){alert(e.message);}}

// ============================================================
// V2.1 — Histórico de placas, KPIs Power BI y criticidades dashboard
// ============================================================
async function getPlacasHistorico() {
  try {
    if (!CU || !['admin','gerente'].includes(CU.rol)) return [];
    const data = await API.get('/api/catalogos/placas/historial');
    return data.placas || [];
  } catch(e) { return []; }
}

// Reemplaza renderCatalogos para mostrar placa activa + histórico conservado.
renderCatalogos = async function() {
  await cargarCatalogos(); buildCatSelects();
  const el=document.getElementById('catalog-list'); if(!el)return;
  const hist = await getPlacasHistorico();
  const histMap = {};
  hist.forEach(x => {
    const key = `${x.concesion}|${x.puesto}`;
    histMap[key] = histMap[key] || [];
    histMap[key].push(x);
  });
  el.innerHTML=Object.entries(CAT).map(([zona,cons])=>`<div class="card" style="padding:14px"><div class="ct2">${zona}</div>${Object.entries(cons).sort().map(([c,puestos])=>`<div style="border-top:1px solid var(--border);padding:10px 0"><div style="display:flex;justify-content:space-between;gap:8px"><b>${c}</b><button class="btn btn-s btn-sm" onclick="delCatalogCon('${zona}','${encodeURIComponent(c)}')">Eliminar concesión</button></div><div style="margin-top:6px">${(puestos||[]).map(p=>{const key=c+'|'+p; const active=(MOV[key]||[]); const old=(histMap[key]||[]).filter(x=>!x.activo); return `<div style="font-size:.78rem;color:var(--muted);padding:7px 0;border-top:1px dashed var(--border)">• <b>${p}</b> <button class="btn btn-s btn-sm" onclick="delCatalogPuesto('${zona}','${encodeURIComponent(c)}','${encodeURIComponent(p)}')">Eliminar puesto</button><br><span style="color:#1a7a3c;font-weight:700">Activa: ${active.length?active.join(' · '):'Sin placa activa'}</span>${old.length?`<details style="margin-top:5px"><summary style="cursor:pointer;color:#294996">Histórico de placas (${old.length})</summary><div style="margin-top:5px">${old.map(h=>`<span class="badge" style="background:#f3f4f6;color:#444;margin:2px">${h.placa} · inactiva · ${h.desactivado_en_formato||h.creado_en_formato||''}</span>`).join('')}</div></details>`:''}</div>`}).join('')||'<span class="tdm">Sin puestos</span>'}</div></div>`).join('')}</div>`).join('');
};

function renderCriticidadResumen(rows) {
  if (!rows || !rows.length) return empty('🎯','Sin criticidades registradas.');
  const top = rows.slice(0, 12);
  return `<div style="display:grid;gap:8px">${top.map(r => {
    const nivel = r.nivel || '—';
    const cls = nivel === 'CRITICA' ? 'b-critica' : nivel === 'MEDIA' ? 'b-media' : 'b-baja';
    return `<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;border-bottom:1px solid var(--border);padding:7px 0">
      <div style="min-width:0"><span class="badge ${cls}">${nivel}</span> <b>${r.area || '—'}</b><br><span class="tdm">${r.tipo_novedad || '—'} · Estado: ${r.estado || '—'}</span></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.35rem;color:var(--accent2)">${r.total}</div>
    </div>`;
  }).join('')}</div>`;
}

const _dashV21 = renderDash;
renderDash = async function() {
  await _dashV21();
  try {
    const data = await API.get('/api/reportes/resumen');
    let panel=document.getElementById('dash-criticidad-extra');
    const anchor=document.getElementById('dash-estado-extra') || document.querySelector('#pg-dashboard .g2');
    if(!panel){panel=document.createElement('div');panel.id='dash-criticidad-extra';panel.className='card';anchor.after(panel);}
    const t=data.tiemposCierre || {};
    panel.innerHTML=`<div class="ch"><div class="ct2">🎯 Resumen de criticidades y oportunidad de cierre</div><div class="tdm">KPI gerencial</div></div>
      <div class="g3" style="margin-bottom:14px">
        <div><div class="sl">Cerradas</div><div class="sv vgr">${t.cerradas || 0}</div></div>
        <div><div class="sl">Horas prom. cierre</div><div class="sv vb">${t.horas_promedio_cierre || '—'}</div></div>
        <div><div class="sl">Horas prom. abiertas</div><div class="sv vr">${t.horas_promedio_abiertas || '—'}</div></div>
      </div>
      ${renderCriticidadResumen(data.porCriticidadDetalle || [])}`;
  } catch(e) { console.warn('Resumen criticidades no disponible:', e.message); }
};

const _repV21 = renderRep;
renderRep = async function() {
  await _repV21();
  try {
    const data = await API.get('/api/reportes/resumen');
    let crit=document.getElementById('r-criticidad-card');
    if(!crit){crit=document.createElement('div');crit.id='r-criticidad-card';crit.className='card';crit.innerHTML='<div class="ct2" style="margin-bottom:14px">🎯 Criticidades por área, tipo y estado</div><div id="r-criticidad"></div>';document.querySelector('#pg-reportes')?.appendChild(crit);}
    document.getElementById('r-criticidad').innerHTML=renderCriticidadResumen(data.porCriticidadDetalle || []);
    let bi=document.getElementById('r-bi-card');
    if(!bi && ['admin','gerente'].includes(CU.rol)){
      bi=document.createElement('div');bi.id='r-bi-card';bi.className='card';document.querySelector('#pg-reportes')?.appendChild(bi);
    }
    if(bi){bi.innerHTML=`<div class="ct2" style="margin-bottom:10px">📊 Integración Power BI Gerencial</div>
      <div class="pgs">Endpoint seguro para conectar Power BI Web/API. Use header <b>x-bi-token</b> con la variable <b>BI_API_TOKEN</b> configurada en Render.</div>
      <code style="display:block;background:var(--surface2);padding:10px;border-radius:8px;margin-top:8px;font-size:.75rem;white-space:pre-wrap">${location.origin}/api/bi/kpis</code>
      <div style="margin-top:8px;font-size:.76rem;color:var(--muted)">Incluye novedades, criticidades, responsables, concesiones y tiempos promedio de cierre.</div>`;}
  } catch(e) { console.warn('Reportes v2.1 no disponibles:', e.message); }
};

// ============================================================
// SISNOV FIX INTERACCIÓN MOUSE / CSP
// Convierte manejadores inline legacy (onclick/onchange) en eventos
// delegados desde app.js. Esto permite que los botones funcionen incluso
// cuando el navegador bloquea event handlers inline por CSP.
// ============================================================
(function sisnovMouseCspCompatibility(){
  if (window.__sisnovMouseCspCompatibilityLoaded) return;
  window.__sisnovMouseCspCompatibilityLoaded = true;

  function splitArgs(raw) {
    const args = [];
    let cur = '';
    let quote = null;
    let esc = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (esc) { cur += ch; esc = false; continue; }
      if (ch === '\\') { esc = true; cur += ch; continue; }
      if (quote) {
        cur += ch;
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"') { quote = ch; cur += ch; continue; }
      if (ch === ',') { args.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim() || raw.trim()) args.push(cur.trim());
    return args.filter(a => a.length || raw.trim()==='');
  }

  function parseValue(v, el) {
    if (v === '' || v === undefined) return undefined;
    if (v === 'this') return el;
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    const m = v.match(/^['"]([\s\S]*)['"]$/);
    if (m) return m[1]
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r');
    return v;
  }

  function runLegacyHandler(code, el) {
    if (!code || typeof code !== 'string') return false;
    const parts = code.split(';').map(x => x.trim()).filter(Boolean);
    let executed = false;
    for (const part of parts) {
      const m = part.match(/^([A-Za-z_$][\w$]*)\(([^)]*)\)$/);
      if (!m) continue;
      const fnName = m[1];
      const fn = window[fnName];
      if (typeof fn !== 'function') continue;
      const args = m[2].trim() ? splitArgs(m[2]).map(a => parseValue(a, el)) : [];
      fn.apply(el, args);
      executed = true;
    }
    return executed;
  }

  document.addEventListener('click', function(e){
    const el = e.target.closest && e.target.closest('[onclick]');
    if (!el) return;
    const code = el.getAttribute('onclick');
    if (!code) return;
    const ok = runLegacyHandler(code, el);
    if (ok) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('change', function(e){
    const el = e.target.closest && e.target.closest('[onchange]');
    if (!el) return;
    const code = el.getAttribute('onchange');
    if (!code) return;
    const ok = runLegacyHandler(code, el);
    if (ok) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    }
  }, true);

  // Limpieza defensiva: si la app está visible, evita que el login oculto bloquee clics.
  setInterval(function(){
    const login = document.getElementById('loginScreen');
    const shell = document.getElementById('appShell');
    if (login && shell && shell.classList.contains('vis')) {
      login.style.display = 'none';
      login.style.pointerEvents = 'none';
    }
    const pwd = document.getElementById('pwd-modal');
    if (pwd && pwd.style.display === 'none') pwd.style.pointerEvents = 'none';
    if (pwd && pwd.style.display === 'flex') pwd.style.pointerEvents = 'auto';
  }, 750);
})();

// ============================================================
// SISNOV — Ajuste puntual Historial: días abiertos, hallazgo y dona diaria
// Cambios solo frontend. No toca usuarios, contraseñas, BD ni Power BI.
// ============================================================
(function sisnovHistorialSlaHallazgoDona(){
  if (window.__sisnovHistorialSlaHallazgoDonaLoaded) return;
  window.__sisnovHistorialSlaHallazgoDonaLoaded = true;

  function esc(v){
    return String(v ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function shortText(v, max=62){
    const s = String(v || '').replace(/\s+/g,' ').trim();
    if (!s) return '—';
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function parseDateSafe(v){
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  function diasGestion(n){
    const inicio = parseDateSafe(n.creado_en) || (n.ts ? new Date(n.ts) : null);
    if (!inicio) return {dias:'—', texto:'Sin fecha'};
    const cerrado = String(n.estado || '').toUpperCase() === 'CERRADA';
    const fin = cerrado && n.cerrado_en ? (parseDateSafe(n.cerrado_en) || new Date()) : new Date();
    const ms = Math.max(0, fin.getTime() - inicio.getTime());
    const dias = Math.max(0, Math.ceil(ms / 86400000));
    return {
      dias,
      texto: cerrado ? `${dias} día(s) al cierre` : `${dias} día(s) abierta`
    };
  }

  function isTodayRecord(n){
    const d = parseDateSafe(n.creado_en) || (n.ts ? new Date(n.ts) : null);
    if (!d) return false;
    const now = new Date();
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
  }

  function datosHistorialFiltrados(){
    let data = typeof vis === 'function' ? vis() : (window.nov || []);
    try {
      if (typeof fBq !== 'undefined' && fBq) {
        const q=String(fBq).toLowerCase();
        data=data.filter(n=>JSON.stringify(n).toLowerCase().includes(q));
      }
      if (typeof fAr !== 'undefined' && fAr) data=data.filter(n=>n.area===fAr);
      if (typeof fNv !== 'undefined' && fNv) data=data.filter(n=>n.nivel===fNv);
    } catch(e) {}
    return data;
  }

  function ensureHistorialUi(){
    const page = document.getElementById('pg-historial');
    if (!page) return;
    const tr = page.querySelector('table thead tr');
    if (tr && !tr.dataset.historialEnhanced) {
      tr.dataset.historialEnhanced = '1';
      tr.innerHTML = `
        <th>#</th><th>Fecha/Hora</th><th>Zona</th><th>Concesión</th><th>Puesto</th>
        <th>Área</th><th>Tipo</th><th>Nivel</th><th>Estado</th><th>Días abierta / cierre</th>
        <th>Descripción del Hallazgo</th><th>Supervisor</th><th>Gestión</th>`;
    }
    if (!document.getElementById('hist-dona-supervisores')) {
      const card = document.createElement('div');
      card.id = 'hist-dona-supervisores';
      card.className = 'card';
      card.style.marginBottom = '14px';
      card.innerHTML = `<div class="ch"><div class="ct2">🍩 Participación diaria por supervisor</div><div class="tdm">Novedades registradas hoy dentro del alcance visible</div></div><div id="hist-dona-body"></div>`;
      const toolbar = page.querySelector('.toolbar');
      if (toolbar) toolbar.after(card);
      else page.prepend(card);
    }
  }

  function renderDonaSupervisores(){
    ensureHistorialUi();
    const el = document.getElementById('hist-dona-body');
    if (!el) return;
    const data = datosHistorialFiltrados().filter(isTodayRecord);
    if (!data.length) {
      el.innerHTML = `<div style="padding:12px;color:var(--muted);font-size:.82rem">Sin novedades registradas hoy para graficar.</div>`;
      return;
    }
    const counts = {};
    data.forEach(n=>{
      const key = n.name || n.nombre_supervisor || n.user || n.registrado_por || 'Sin supervisor';
      counts[key] = (counts[key] || 0) + 1;
    });
    const rows = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const total = rows.reduce((a,r)=>a+r[1],0) || 1;
    const palette = ['#294996','#e42421','#1a7a3c','#f0a832','#8b5cf6','#1abc9c','#e67e22','#5a6e9a','#0f766e','#be185d'];
    let acc = 0;
    const parts = rows.map(([name,count],i)=>{
      const pct = count/total*100;
      const start = acc;
      acc += pct;
      return `${palette[i % palette.length]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
    }).join(', ');
    el.innerHTML = `<div style="display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:center">
      <div style="width:148px;height:148px;border-radius:50%;background:conic-gradient(${parts});position:relative;margin:auto;box-shadow:0 8px 22px rgba(0,0,0,.08)">
        <div style="position:absolute;inset:34px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;color:var(--text)">${total}<br><span style="font-size:.65rem;color:var(--muted);font-weight:600">hoy</span></div>
      </div>
      <div>${rows.map(([name,count],i)=>{
        const pct = (count/total*100).toFixed(1);
        return `<div style="display:grid;grid-template-columns:14px 1fr auto auto;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)">
          <span style="width:10px;height:10px;border-radius:50%;background:${palette[i % palette.length]};display:inline-block"></span>
          <span style="font-size:.78rem;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(name)}">${esc(name)}</span>
          <span class="tdm">${count}</span>
          <span class="badge b-area">${pct}%</span>
        </div>`;
      }).join('')}</div>
    </div>`;
  }

  const prevRenderHist = window.renderHist;
  if (typeof prevRenderHist === 'function') {
    window.renderHist = async function(){
      await prevRenderHist.apply(this, arguments);
      ensureHistorialUi();
      renderDonaSupervisores();
    };
  }

  window.renderTbl = function(){
    ensureHistorialUi();
    let data = datosHistorialFiltrados();
    const tcount = document.getElementById('tcount');
    if (tcount) tcount.textContent = `Mostrando ${data.length} novedad(es)`;
    const tb = document.getElementById('tbody');
    if (!tb) return;
    if (!data.length) {
      tb.innerHTML = `<tr><td colspan="13">${typeof empty==='function'?empty('📋','No hay registros que coincidan.'):'No hay registros que coincidan.'}</td></tr>`;
      renderDonaSupervisores();
      return;
    }
    tb.innerHTML = data.map(n=>{
      const d = diasGestion(n);
      const desc = n.descripcion || n.hallazgo_descripcion || n.descripcion_hallazgo || '';
      const estado = n.estado || 'ABIERTA';
      const nivel = n.nivel || 'BAJA';
      const zona = n.zona || '—';
      return `<tr>
        <td style="font-weight:700;color:var(--muted)">#${esc(n.id)}</td>
        <td class="tdm" style="white-space:nowrap;font-size:.72rem">${esc(n.fecha || '')}</td>
        <td><span class="badge b-${String(zona).toLowerCase()==='norte'?'norte':'sur'}">${esc(zona)}</span></td>
        <td style="font-size:.8rem">${esc(n.concesion)}</td>
        <td style="font-size:.8rem">${esc(n.puesto)}</td>
        <td><span class="badge b-area">${esc(n.area)}</span></td>
        <td class="tdm">${esc(n.tipo)}</td>
        <td><span class="badge b-${String(nivel).toLowerCase()}">${esc(nivel)}</span></td>
        <td>${typeof estadoBadge==='function'?estadoBadge(estado):`<span class="badge b-area">${esc(estado)}</span>`}</td>
        <td class="tdm" title="${esc(d.texto)}"><b>${esc(d.dias)}</b><br><span style="font-size:.65rem">${String(estado).toUpperCase()==='CERRADA'?'al cierre':'abierta'}</span></td>
        <td style="max-width:260px;font-size:.76rem;line-height:1.35" title="${esc(desc)}">${esc(shortText(desc, 90))}</td>
        <td class="tdm">${esc(n.name)}</td>
        <td><select class="si" data-hist-estado="1" data-id="${esc(n.id)}" style="font-size:.72rem;padding:5px"><option value="">Cambiar...</option><option value="ABIERTA">Abierta</option><option value="GESTION">Gestión</option><option value="CERRADA">Cerrada</option></select></td>
      </tr>`;
    }).join('');
    renderDonaSupervisores();
  };

  const oldFh = window.fh, oldFa2 = window.fa2, oldFn2 = window.fn2;
  window.fh = function(v){ if (typeof oldFh==='function') oldFh(v); else { window.fBq=v; window.renderTbl(); } renderDonaSupervisores(); };
  window.fa2 = function(v){ if (typeof oldFa2==='function') oldFa2(v); else { window.fAr=v; window.renderTbl(); } renderDonaSupervisores(); };
  window.fn2 = function(v){ if (typeof oldFn2==='function') oldFn2(v); else { window.fNv=v; window.renderTbl(); } renderDonaSupervisores(); };

  document.addEventListener('change', function(e){
    const sel = e.target && e.target.closest && e.target.closest('select[data-hist-estado]');
    if (!sel || !sel.value) return;
    if (typeof cambiarEstadoNovedad === 'function') cambiarEstadoNovedad(sel.dataset.id, sel.value);
  });
})();


// ============================================================
// SISNOV — Fix definitivo filtros Historial
// Corrige búsqueda/área, agrega filtros por Estado y Criticidad,
// y permite restaurar la tabla al limpiar filtros.
// Cambio solo frontend. No toca usuarios, contraseñas, BD ni Power BI.
// ============================================================
(function sisnovHistorialFiltrosFinal(){
  if (window.__sisnovHistorialFiltrosFinalLoaded) return;
  window.__sisnovHistorialFiltrosFinalLoaded = true;

  const HIST_FILTERS = {
    q: '',
    area: '',
    criticidad: '',
    estado: ''
  };

  function esc(v){
    return String(v ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function norm(v){
    return String(v ?? '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .trim().toUpperCase();
  }

  function shortText(v, max=90){
    const s = String(v || '').replace(/\s+/g,' ').trim();
    if (!s) return '—';
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function parseDateSafe(v){
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  function diasGestion(n){
    const inicio = parseDateSafe(n.creado_en) || (n.ts ? new Date(n.ts) : null);
    if (!inicio) return {dias:'—', texto:'Sin fecha'};
    const estado = norm(n.estado || 'ABIERTA');
    const cerrado = estado === 'CERRADA';
    const fin = cerrado && n.cerrado_en ? (parseDateSafe(n.cerrado_en) || new Date()) : new Date();
    const ms = Math.max(0, fin.getTime() - inicio.getTime());
    const dias = Math.max(0, Math.ceil(ms / 86400000));
    return { dias, texto: cerrado ? `${dias} día(s) al cierre` : `${dias} día(s) abierta` };
  }

  function getBaseHistorial(){
    const base = (typeof vis === 'function') ? vis() : (Array.isArray(window.NV) ? window.NV : []);
    return Array.isArray(base) ? base.slice() : [];
  }

  function applyHistorialFilters(list){
    let data = Array.isArray(list) ? list.slice() : [];
    const q = String(HIST_FILTERS.q || '').trim().toLowerCase();
    if (q) {
      data = data.filter(n => {
        const blob = [
          n.id, n.fecha, n.zona, n.concesion, n.puesto, n.movil,
          n.area, n.tipo, n.nivel, n.estado, n.descripcion,
          n.hallazgo_descripcion, n.descripcion_hallazgo, n.user, n.name
        ].join(' ').toLowerCase();
        return blob.includes(q);
      });
    }
    if (HIST_FILTERS.area) {
      data = data.filter(n => norm(n.area) === norm(HIST_FILTERS.area));
    }
    if (HIST_FILTERS.criticidad) {
      data = data.filter(n => norm(n.nivel) === norm(HIST_FILTERS.criticidad));
    }
    if (HIST_FILTERS.estado) {
      data = data.filter(n => norm(n.estado || 'ABIERTA') === norm(HIST_FILTERS.estado));
    }
    return data;
  }

  function datosHistorialFiltradosFinal(){
    return applyHistorialFilters(getBaseHistorial());
  }

  function ensureHistorialFiltersUi(){
    const page = document.getElementById('pg-historial');
    if (!page) return;
    const toolbar = page.querySelector('.tc');
    if (!toolbar) return;

    const inputs = toolbar.querySelectorAll('input,select');
    const search = inputs[0];
    const area = inputs[1];
    const crit = inputs[2];

    if (search && !search.id) search.id = 'hist-filter-search';
    if (area && !area.id) area.id = 'hist-filter-area';
    if (crit && !crit.id) crit.id = 'hist-filter-criticidad';

    if (crit) {
      const first = crit.querySelector('option[value=""]') || crit.querySelector('option:first-child');
      if (first) first.textContent = 'Todas las criticidades';
    }

    if (!document.getElementById('hist-filter-estado')) {
      const estado = document.createElement('select');
      estado.className = 'si';
      estado.id = 'hist-filter-estado';
      estado.style.width = '145px';
      estado.innerHTML = `
        <option value="">Todos los estados</option>
        <option value="ABIERTA">Abierta</option>
        <option value="GESTION">En gestión</option>
        <option value="CERRADA">Cerrada</option>`;
      if (crit && crit.parentNode) crit.after(estado);
      else toolbar.appendChild(estado);
    }

    if (!document.getElementById('hist-filter-clear')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-s btn-sm';
      btn.id = 'hist-filter-clear';
      btn.textContent = 'Limpiar filtros';
      const csv = toolbar.querySelector('button');
      if (csv) csv.before(btn);
      else toolbar.appendChild(btn);
    }

    if (toolbar.dataset.historialFilterBound === '1') return;
    toolbar.dataset.historialFilterBound = '1';

    toolbar.addEventListener('input', function(e){
      if (e.target && e.target.id === 'hist-filter-search') {
        HIST_FILTERS.q = e.target.value || '';
        safeRenderTbl();
      }
    });

    toolbar.addEventListener('change', function(e){
      const t = e.target;
      if (!t) return;
      if (t.id === 'hist-filter-area') HIST_FILTERS.area = t.value || '';
      if (t.id === 'hist-filter-criticidad') HIST_FILTERS.criticidad = t.value || '';
      if (t.id === 'hist-filter-estado') HIST_FILTERS.estado = t.value || '';
      if (['hist-filter-area','hist-filter-criticidad','hist-filter-estado'].includes(t.id)) safeRenderTbl();
    });

    toolbar.addEventListener('click', function(e){
      const clear = e.target && e.target.closest && e.target.closest('#hist-filter-clear');
      if (!clear) return;
      e.preventDefault();
      HIST_FILTERS.q = '';
      HIST_FILTERS.area = '';
      HIST_FILTERS.criticidad = '';
      HIST_FILTERS.estado = '';
      const search = document.getElementById('hist-filter-search');
      const area = document.getElementById('hist-filter-area');
      const crit = document.getElementById('hist-filter-criticidad');
      const estado = document.getElementById('hist-filter-estado');
      if (search) search.value = '';
      if (area) area.value = '';
      if (crit) crit.value = '';
      if (estado) estado.value = '';
      safeRenderTbl();
    });
  }

  function ensureHistorialHeader(){
    const page = document.getElementById('pg-historial');
    if (!page) return;
    const tr = page.querySelector('table thead tr');
    if (!tr) return;
    tr.innerHTML = `
      <th>#</th><th>Fecha/Hora</th><th>Zona</th><th>Concesión</th><th>Puesto</th>
      <th>Área</th><th>Tipo</th><th>Criticidad</th><th>Estado</th>
      <th>Días abierta / cierre</th><th>Descripción del Hallazgo</th><th>Supervisor</th><th>Gestión</th>`;
  }

  function isTodayRecord(n){
    const d = parseDateSafe(n.creado_en) || (n.ts ? new Date(n.ts) : null);
    if (!d) return false;
    const now = new Date();
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
  }

  function renderDonaSupervisoresFinal(){
    const page = document.getElementById('pg-historial');
    if (!page) return;
    if (!document.getElementById('hist-dona-supervisores')) {
      const card = document.createElement('div');
      card.id = 'hist-dona-supervisores';
      card.className = 'card';
      card.style.marginBottom = '14px';
      card.innerHTML = `<div class="ch"><div class="ct2">🍩 Participación diaria por supervisor</div><div class="tdm">Novedades registradas hoy dentro del alcance visible y filtros aplicados</div></div><div id="hist-dona-body"></div>`;
      const toolbar = page.querySelector('.toolbar') || page.querySelector('.tc');
      if (toolbar && toolbar.parentElement) toolbar.parentElement.before(card);
      else page.prepend(card);
    }
    const el = document.getElementById('hist-dona-body');
    if (!el) return;
    const data = datosHistorialFiltradosFinal().filter(isTodayRecord);
    if (!data.length) {
      el.innerHTML = `<div style="padding:12px;color:var(--muted);font-size:.82rem">Sin novedades registradas hoy para graficar con los filtros actuales.</div>`;
      return;
    }
    const counts = {};
    data.forEach(n=>{
      const key = n.name || n.nombre_supervisor || n.user || n.registrado_por || 'Sin supervisor';
      counts[key] = (counts[key] || 0) + 1;
    });
    const rows = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const total = rows.reduce((a,r)=>a+r[1],0) || 1;
    const palette = ['#294996','#e42421','#1a7a3c','#f0a832','#8b5cf6','#1abc9c','#e67e22','#5a6e9a','#0f766e','#be185d'];
    let acc = 0;
    const parts = rows.map(([name,count],i)=>{
      const pct = count/total*100;
      const start = acc; acc += pct;
      return `${palette[i % palette.length]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
    }).join(', ');
    el.innerHTML = `<div style="display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:center">
      <div style="width:148px;height:148px;border-radius:50%;background:conic-gradient(${parts});position:relative;margin:auto;box-shadow:0 8px 22px rgba(0,0,0,.08)">
        <div style="position:absolute;inset:34px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;color:var(--text)">${total}<br><span style="font-size:.65rem;color:var(--muted);font-weight:600">hoy</span></div>
      </div>
      <div>${rows.map(([name,count],i)=>{
        const pct = (count/total*100).toFixed(1);
        return `<div style="display:grid;grid-template-columns:14px 1fr auto auto;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)">
          <span style="width:10px;height:10px;border-radius:50%;background:${palette[i % palette.length]};display:inline-block"></span>
          <span style="font-size:.78rem;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(name)}">${esc(name)}</span>
          <span class="tdm">${count}</span>
          <span class="badge b-area">${pct}%</span>
        </div>`;
      }).join('')}</div>
    </div>`;
  }

  function safeRenderTbl(){
    ensureHistorialFiltersUi();
    ensureHistorialHeader();
    const data = datosHistorialFiltradosFinal();
    const tcount = document.getElementById('tcount');
    if (tcount) {
      const parts = [];
      if (HIST_FILTERS.q) parts.push(`búsqueda: "${HIST_FILTERS.q}"`);
      if (HIST_FILTERS.area) parts.push(`área: ${HIST_FILTERS.area}`);
      if (HIST_FILTERS.criticidad) parts.push(`criticidad: ${HIST_FILTERS.criticidad}`);
      if (HIST_FILTERS.estado) parts.push(`estado: ${HIST_FILTERS.estado}`);
      tcount.textContent = `Mostrando ${data.length} novedad(es)` + (parts.length ? ` · Filtros: ${parts.join(' · ')}` : '');
    }
    const tb = document.getElementById('tbody');
    if (!tb) return;
    if (!data.length) {
      tb.innerHTML = `<tr><td colspan="13">${typeof empty==='function'?empty('📋','No hay registros que coincidan. Limpie filtros o cambie criterios.'):'No hay registros que coincidan. Limpie filtros o cambie criterios.'}</td></tr>`;
      renderDonaSupervisoresFinal();
      return;
    }
    tb.innerHTML = data.map(n=>{
      const d = diasGestion(n);
      const desc = n.descripcion || n.hallazgo_descripcion || n.descripcion_hallazgo || '';
      const estado = n.estado || 'ABIERTA';
      const nivel = n.nivel || 'BAJA';
      const zona = n.zona || '—';
      return `<tr>
        <td style="font-weight:700;color:var(--muted)">#${esc(n.id)}</td>
        <td class="tdm" style="white-space:nowrap;font-size:.72rem">${esc(n.fecha || '')}</td>
        <td><span class="badge b-${String(zona).toLowerCase()==='norte'?'norte':'sur'}">${esc(zona)}</span></td>
        <td style="font-size:.8rem">${esc(n.concesion)}</td>
        <td style="font-size:.8rem">${esc(n.puesto)}</td>
        <td><span class="badge b-area">${esc(n.area)}</span></td>
        <td class="tdm">${esc(n.tipo)}</td>
        <td><span class="badge b-${String(nivel).toLowerCase()}">${esc(nivel)}</span></td>
        <td>${typeof estadoBadge==='function'?estadoBadge(estado):`<span class="badge b-area">${esc(estado)}</span>`}</td>
        <td class="tdm" title="${esc(d.texto)}"><b>${esc(d.dias)}</b><br><span style="font-size:.65rem">${norm(estado)==='CERRADA'?'al cierre':'abierta'}</span></td>
        <td style="max-width:260px;font-size:.76rem;line-height:1.35" title="${esc(desc)}">${esc(shortText(desc, 90))}</td>
        <td class="tdm">${esc(n.name)}</td>
        <td><select class="si" data-hist-estado="1" data-id="${esc(n.id)}" style="font-size:.72rem;padding:5px"><option value="">Cambiar...</option><option value="ABIERTA">Abierta</option><option value="GESTION">Gestión</option><option value="CERRADA">Cerrada</option></select></td>
      </tr>`;
    }).join('');
    renderDonaSupervisoresFinal();
  }

  window.renderTbl = safeRenderTbl;
  window.fh = function(v){ HIST_FILTERS.q = v || ''; safeRenderTbl(); };
  window.fa2 = function(v){ HIST_FILTERS.area = v || ''; safeRenderTbl(); };
  window.fn2 = function(v){ HIST_FILTERS.criticidad = v || ''; safeRenderTbl(); };
  window.fe2 = function(v){ HIST_FILTERS.estado = v || ''; safeRenderTbl(); };

  const prevRenderHist = window.renderHist;
  if (typeof prevRenderHist === 'function') {
    window.renderHist = async function(){
      await prevRenderHist.apply(this, arguments);
      ensureHistorialFiltersUi();
      safeRenderTbl();
    };
  }

  document.addEventListener('change', function(e){
    const sel = e.target && e.target.closest && e.target.closest('select[data-hist-estado]');
    if (!sel || !sel.value) return;
    if (typeof cambiarEstadoNovedad === 'function') cambiarEstadoNovedad(sel.dataset.id, sel.value);
  });
})();


// ============================================================
// SISNOV — Ajuste puntual Dashboard Global: dona gestión/criticidad,
// promedios en días y eliminación de paneles duplicados.
// No modifica usuarios, contraseñas, base de datos ni Power BI.
// ============================================================
(function(){
  if (typeof renderDash !== 'function') return;
  const _renderDashDashboardGlobal = renderDash;

  const escDash = (v) => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num = (v) => Number(v || 0);
  const toDias = (horas) => {
    const h = Number(horas);
    if (!Number.isFinite(h) || h <= 0) return '—';
    const d = h / 24;
    return d < 1 ? d.toFixed(2) : d.toFixed(1);
  };

  function isGlobalRole(){
    return CU && ['admin','gerente'].includes(CU.rol);
  }

  function setCriticidadCardsVisible(visible){
    ['s1','s2','s3'].forEach(id => {
      const el = document.getElementById(id);
      const card = el && el.closest('.sc');
      if (card) card.style.display = visible ? '' : 'none';
    });
  }

  function removeOldDuplicatedDashboardPanels(){
    ['dash-estado-extra','dash-criticidad-extra','dash-gerencial-unico'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function rowsToMap(rows, keyField){
    const out = {};
    (rows || []).forEach(r => {
      const k = String(r[keyField] || 'SIN DATO').toUpperCase();
      out[k] = num(r.total);
    });
    return out;
  }

  function donutHtml(title, subtitle, counts, palette){
    const rows = Object.entries(counts).filter(([,v]) => num(v) > 0).sort((a,b)=>b[1]-a[1]);
    const total = rows.reduce((a,[,v])=>a+num(v),0);
    if (!total) {
      return `<div class="dash-donut-box"><div class="ct2">${escDash(title)}</div><div class="tdm">Sin datos disponibles</div></div>`;
    }
    let acc = 0;
    const parts = rows.map(([k,v], i) => {
      const pct = num(v) / total * 100;
      const start = acc; acc += pct;
      const color = palette[k] || ['#294996','#e42421','#1a7a3c','#f0a832','#8b5cf6','#1abc9c'][i % 6];
      return `${color} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
    }).join(', ');
    return `<div class="dash-donut-box">
      <div class="ct2">${escDash(title)}</div>
      <div class="tdm" style="margin-bottom:10px">${escDash(subtitle || '')}</div>
      <div style="display:grid;grid-template-columns:138px 1fr;gap:16px;align-items:center">
        <div style="width:132px;height:132px;border-radius:50%;background:conic-gradient(${parts});position:relative;margin:auto;box-shadow:0 8px 22px rgba(0,0,0,.08)">
          <div style="position:absolute;inset:32px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;text-align:center;font-weight:900;color:var(--text);font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.5px">${total}<br><span style="font-family:Outfit,sans-serif;font-size:.62rem;color:var(--muted);font-weight:700">total</span></div>
        </div>
        <div>${rows.map(([k,v], i) => {
          const pct = (num(v) / total * 100).toFixed(1);
          const color = palette[k] || ['#294996','#e42421','#1a7a3c','#f0a832','#8b5cf6','#1abc9c'][i % 6];
          return `<div style="display:grid;grid-template-columns:12px 1fr auto auto;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)">
            <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block"></span>
            <span style="font-size:.76rem;font-weight:800;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escDash(k)}">${escDash(k)}</span>
            <span class="tdm">${v}</span>
            <span class="badge b-area">${pct}%</span>
          </div>`;
        }).join('')}</div>
      </div>
    </div>`;
  }

  async function renderDashboardGlobalUnico(){
    const page = document.getElementById('pg-dashboard');
    if (!page) return;

    removeOldDuplicatedDashboardPanels();

    if (!isGlobalRole()) {
      setCriticidadCardsVisible(true);
      return;
    }

    // Evita duplicar la misma información: los conteos CRÍTICA/MEDIA/BAJA
    // quedan resumidos en la dona de criticidad.
    setCriticidadCardsVisible(false);

    const anchor = page.querySelector('.sg') || page.querySelector('.pgt');
    if (!anchor) return;

    const panel = document.createElement('div');
    panel.id = 'dash-gerencial-unico';
    panel.className = 'card';
    panel.style.marginTop = '14px';
    panel.innerHTML = `<div class="ch"><div class="ct2">📊 Dashboard gerencial consolidado</div><div class="tdm">Gestión, criticidad y tiempos promedio sin información repetida</div></div>
      <div style="padding:10px;color:var(--muted);font-size:.82rem">Cargando indicadores...</div>`;
    anchor.after(panel);

    try {
      const data = await API.get('/api/reportes/resumen');
      const estadoCounts = rowsToMap(data.porEstado, 'estado');
      const criticidadCounts = rowsToMap(data.porNivel, 'nivel');
      const t = data.tiemposCierre || {};
      const diasPromCierre = toDias(t.horas_promedio_cierre);
      const diasPromAbiertas = toDias(t.horas_promedio_abiertas);

      panel.innerHTML = `<div class="ch"><div class="ct2">📊 Dashboard gerencial consolidado</div><div class="tdm">Gestión, criticidad y tiempos promedio</div></div>
        <div class="g3" style="margin-bottom:16px">
          <div><div class="sl">Días prom. abiertas</div><div class="sv vr">${escDash(diasPromAbiertas)}</div><div class="ss">promedio en días, no horas</div></div>
          <div><div class="sl">Días prom. cierre</div><div class="sv vgr">${escDash(diasPromCierre)}</div><div class="ss">solo novedades cerradas</div></div>
          <div><div class="sl">Cerradas</div><div class="sv vb">${escDash(t.cerradas || 0)}</div><div class="ss">novedades con cierre registrado</div></div>
        </div>
        <div class="g2" style="align-items:start">
          ${donutHtml('🍩 Estado de gestión', 'Participación porcentual: abiertas, gestión y cerradas', estadoCounts, {ABIERTA:'#e42421',GESTION:'#f0a832',CERRADA:'#1a7a3c'})}
          ${donutHtml('🍩 Criticidades', 'Participación porcentual por criticidad', criticidadCounts, {CRITICA:'#e42421',MEDIA:'#f0a832',BAJA:'#1a7a3c'})}
        </div>`;
    } catch(e) {
      panel.innerHTML = `<div class="ch"><div class="ct2">📊 Dashboard gerencial consolidado</div></div><div style="padding:12px;color:var(--red);font-size:.82rem">No fue posible cargar los indicadores gerenciales: ${escDash(e.message || 'error')}</div>`;
    }
  }

  renderDash = async function(){
    await _renderDashDashboardGlobal.apply(this, arguments);
    await renderDashboardGlobalUnico();
  };
  window.renderDash = renderDash;
})();

// ============================================================
// SISNOV — FIX FINAL FILTROS HISTORIAL
// Alcance: solo Historial. No toca usuarios, contraseñas, BD ni Power BI.
// Corrige filtros que no restauran, normaliza valores y agrega Estado/Criticidad.
// ============================================================
(function sisnovHistorialFiltrosFinalDefinitivo(){
  if (window.__sisnovHistorialFiltrosFinalDefinitivo) return;
  window.__sisnovHistorialFiltrosFinalDefinitivo = true;

  const state = { q:'', area:'', criticidad:'', estado:'' };

  function esc(v){
    return String(v ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function norm(v){
    return String(v ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim()
      .toUpperCase();
  }

  function shortText(v, max=90){
    const s = String(v || '').replace(/\s+/g,' ').trim();
    if (!s) return '—';
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function parseDateSafe(v){
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function diasGestion(n){
    const inicio = parseDateSafe(n.creado_en) || parseDateSafe(n.fecha_iso) || parseDateSafe(n.fecha) || (n.ts ? new Date(n.ts) : null);
    if (!inicio) return { dias:'—', texto:'Sin fecha' };
    const estado = norm(n.estado || 'ABIERTA');
    const cerrado = estado === 'CERRADA';
    const fin = cerrado ? (parseDateSafe(n.cerrado_en) || parseDateSafe(n.fecha_cierre) || new Date()) : new Date();
    const ms = Math.max(0, fin.getTime() - inicio.getTime());
    const dias = Math.max(0, Math.ceil(ms / 86400000));
    return { dias, texto: cerrado ? `${dias} día(s) al cierre` : `${dias} día(s) abierta` };
  }

  function baseHistorial(){
    try {
      const rows = (typeof vis === 'function') ? vis() : [];
      return Array.isArray(rows) ? rows.slice() : [];
    } catch(e) {
      return [];
    }
  }

  function getToolbar(){
    const page = document.getElementById('pg-historial');
    if (!page) return null;
    return page.querySelector('.tc') || page.querySelector('.toolbar');
  }

  function readFiltersFromDom(){
    const toolbar = getToolbar();
    if (!toolbar) return;
    const input = document.getElementById('hist-filter-search') || toolbar.querySelector('input');
    const area = document.getElementById('hist-filter-area') || toolbar.querySelector('select[data-hist-filter="area"]') || toolbar.querySelectorAll('select')[0];
    const crit = document.getElementById('hist-filter-criticidad') || toolbar.querySelector('select[data-hist-filter="criticidad"]') || toolbar.querySelectorAll('select')[1];
    const est = document.getElementById('hist-filter-estado') || toolbar.querySelector('select[data-hist-filter="estado"]') || toolbar.querySelectorAll('select')[2];
    state.q = input ? input.value : state.q;
    state.area = area ? area.value : state.area;
    state.criticidad = crit ? crit.value : state.criticidad;
    state.estado = est ? est.value : state.estado;
  }

  function matchNormalized(value, filter){
    const a = norm(value);
    const b = norm(filter);
    if (!b) return true;
    if (!a) return false;
    return a === b || a.includes(b) || b.includes(a);
  }

  function filteredHistorial(){
    readFiltersFromDom();
    let data = baseHistorial();
    const q = String(state.q || '').trim().toLowerCase();
    if (q) {
      data = data.filter(n => [
        n.id, n.fecha, n.zona, n.concesion, n.puesto, n.movil, n.placa,
        n.area, n.tipo, n.nivel, n.estado, n.descripcion, n.hallazgo_descripcion,
        n.descripcion_hallazgo, n.user, n.name, n.nombre_supervisor
      ].join(' ').toLowerCase().includes(q));
    }
    if (state.area) data = data.filter(n => matchNormalized(n.area, state.area));
    if (state.criticidad) data = data.filter(n => matchNormalized(n.nivel, state.criticidad));
    if (state.estado) data = data.filter(n => matchNormalized(n.estado || 'ABIERTA', state.estado));
    return data;
  }

  function optionHtml(values, selected, label){
    const opts = [`<option value="">${esc(label)}</option>`];
    [...new Set(values.filter(Boolean).map(v => String(v).trim()))]
      .sort((a,b)=>a.localeCompare(b,'es'))
      .forEach(v => opts.push(`<option value="${esc(v)}" ${norm(v)===norm(selected)?'selected':''}>${esc(v)}</option>`));
    return opts.join('');
  }

  function ensureFiltersUi(){
    const toolbar = getToolbar();
    if (!toolbar) return;
    const selects = toolbar.querySelectorAll('select');
    let search = document.getElementById('hist-filter-search') || toolbar.querySelector('input');
    let area = document.getElementById('hist-filter-area') || selects[0];
    let crit = document.getElementById('hist-filter-criticidad') || selects[1];
    let est = document.getElementById('hist-filter-estado') || selects[2];

    if (search) { search.id = 'hist-filter-search'; search.setAttribute('data-hist-filter','q'); }
    if (area) { area.id = 'hist-filter-area'; area.setAttribute('data-hist-filter','area'); }
    if (crit) { crit.id = 'hist-filter-criticidad'; crit.setAttribute('data-hist-filter','criticidad'); }

    if (!est) {
      est = document.createElement('select');
      est.className = 'si';
      est.id = 'hist-filter-estado';
      est.setAttribute('data-hist-filter','estado');
      est.style.width = '150px';
      if (crit && crit.parentNode) crit.after(est);
      else toolbar.appendChild(est);
    }

    const base = baseHistorial();
    if (area) area.innerHTML = optionHtml(base.map(n=>n.area), state.area || area.value, 'Todas las áreas');
    if (crit) crit.innerHTML = optionHtml(['CRITICA','MEDIA','BAJA', ...base.map(n=>n.nivel)], state.criticidad || crit.value, 'Todas las criticidades');
    if (est) est.innerHTML = optionHtml(['ABIERTA','GESTION','CERRADA', ...base.map(n=>n.estado || 'ABIERTA')], state.estado || est.value, 'Todos los estados');

    if (!document.getElementById('hist-filter-clear')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-s btn-sm';
      btn.id = 'hist-filter-clear';
      btn.textContent = 'Limpiar filtros';
      const csv = [...toolbar.querySelectorAll('button')].find(b => /csv/i.test(b.textContent || ''));
      if (csv) csv.before(btn);
      else toolbar.appendChild(btn);
    }

    if (toolbar.dataset.histFinalFiltersBound === '1') return;
    toolbar.dataset.histFinalFiltersBound = '1';
    toolbar.addEventListener('input', function(e){
      if (e.target && e.target.matches('#hist-filter-search')) {
        state.q = e.target.value || '';
        renderTbl();
      }
    });
    toolbar.addEventListener('change', function(e){
      const t = e.target;
      if (!t) return;
      if (t.matches('#hist-filter-area')) state.area = t.value || '';
      if (t.matches('#hist-filter-criticidad')) state.criticidad = t.value || '';
      if (t.matches('#hist-filter-estado')) state.estado = t.value || '';
      if (t.matches('#hist-filter-area,#hist-filter-criticidad,#hist-filter-estado')) renderTbl();
    });
    toolbar.addEventListener('click', function(e){
      const btn = e.target && e.target.closest && e.target.closest('#hist-filter-clear');
      if (!btn) return;
      e.preventDefault();
      state.q = state.area = state.criticidad = state.estado = '';
      const search = document.getElementById('hist-filter-search');
      const area = document.getElementById('hist-filter-area');
      const crit = document.getElementById('hist-filter-criticidad');
      const est = document.getElementById('hist-filter-estado');
      if (search) search.value = '';
      if (area) area.value = '';
      if (crit) crit.value = '';
      if (est) est.value = '';
      renderTbl();
    });
  }

  function ensureHeader(){
    const page = document.getElementById('pg-historial');
    const tr = page && page.querySelector('table thead tr');
    if (!tr) return;
    tr.innerHTML = `
      <th>#</th><th>Fecha/Hora</th><th>Zona</th><th>Concesión</th><th>Puesto</th>
      <th>Área</th><th>Tipo</th><th>Criticidad</th><th>Estado</th>
      <th>Días abierta / cierre</th><th>Descripción del Hallazgo</th><th>Supervisor</th><th>Gestión</th>`;
  }

  function isToday(n){
    const d = parseDateSafe(n.creado_en) || parseDateSafe(n.fecha_iso) || parseDateSafe(n.fecha) || (n.ts ? new Date(n.ts) : null);
    if (!d) return false;
    const now = new Date();
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
  }

  function renderDona(){
    const page = document.getElementById('pg-historial');
    if (!page) return;
    let card = document.getElementById('hist-dona-supervisores');
    if (!card) {
      card = document.createElement('div');
      card.id = 'hist-dona-supervisores';
      card.className = 'card';
      card.style.marginBottom = '14px';
      card.innerHTML = `<div class="ch"><div class="ct2">🍩 Participación diaria por supervisor</div><div class="tdm">Novedades de hoy según filtros aplicados</div></div><div id="hist-dona-body"></div>`;
      const toolbar = getToolbar();
      if (toolbar && toolbar.parentNode) toolbar.parentNode.insertBefore(card, toolbar);
      else page.prepend(card);
    }
    const el = document.getElementById('hist-dona-body');
    if (!el) return;
    const rows = filteredHistorial().filter(isToday);
    if (!rows.length) {
      el.innerHTML = `<div style="padding:12px;color:var(--muted);font-size:.82rem">Sin novedades de hoy para graficar con los filtros actuales.</div>`;
      return;
    }
    const counts = {};
    rows.forEach(n => {
      const k = n.name || n.nombre_supervisor || n.user || 'Sin supervisor';
      counts[k] = (counts[k] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const total = entries.reduce((s,x)=>s+x[1],0) || 1;
    const palette = ['#294996','#e42421','#1a7a3c','#f0a832','#8b5cf6','#1abc9c','#e67e22','#5a6e9a','#0f766e','#be185d'];
    let acc = 0;
    const gradient = entries.map(([_,count],i)=>{ const pct=count/total*100; const start=acc; acc+=pct; return `${palette[i%palette.length]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`; }).join(', ');
    el.innerHTML = `<div style="display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:center">
      <div style="width:148px;height:148px;border-radius:50%;background:conic-gradient(${gradient});position:relative;margin:auto;box-shadow:0 8px 22px rgba(0,0,0,.08)">
        <div style="position:absolute;inset:34px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;color:var(--text)">${total}<br><span style="font-size:.65rem;color:var(--muted);font-weight:600">hoy</span></div>
      </div>
      <div>${entries.map(([name,count],i)=>`<div style="display:grid;grid-template-columns:14px 1fr auto auto;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)">
        <span style="width:10px;height:10px;border-radius:50%;background:${palette[i%palette.length]};display:inline-block"></span>
        <span style="font-size:.78rem;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(name)}">${esc(name)}</span>
        <span class="tdm">${count}</span><span class="badge b-area">${(count/total*100).toFixed(1)}%</span>
      </div>`).join('')}</div>
    </div>`;
  }

  const prevRenderHist = window.renderHist;
  if (typeof prevRenderHist === 'function') {
    window.renderHist = async function(){
      await prevRenderHist.apply(this, arguments);
      ensureFiltersUi();
      renderTbl();
    };
  }

  window.renderTbl = function(){
    ensureFiltersUi();
    ensureHeader();
    const rows = filteredHistorial();
    const tcount = document.getElementById('tcount');
    if (tcount) {
      const tags = [];
      if (state.q) tags.push(`búsqueda: "${state.q}"`);
      if (state.area) tags.push(`área: ${state.area}`);
      if (state.criticidad) tags.push(`criticidad: ${state.criticidad}`);
      if (state.estado) tags.push(`estado: ${state.estado}`);
      tcount.textContent = `Mostrando ${rows.length} novedad(es)` + (tags.length ? ` · Filtros: ${tags.join(' · ')}` : '');
    }
    const tb = document.getElementById('tbody');
    if (!tb) return;
    if (!rows.length) {
      tb.innerHTML = `<tr><td colspan="13">${typeof empty==='function'?empty('📋','No hay registros que coincidan. Use Limpiar filtros para restaurar la vista.'):'No hay registros que coincidan.'}</td></tr>`;
      renderDona();
      return;
    }
    tb.innerHTML = rows.map(n=>{
      const estado = n.estado || 'ABIERTA';
      const nivel = n.nivel || 'BAJA';
      const zona = n.zona || '—';
      const d = diasGestion(n);
      const desc = n.descripcion || n.hallazgo_descripcion || n.descripcion_hallazgo || '';
      return `<tr>
        <td style="font-weight:700;color:var(--muted)">#${esc(n.id)}</td>
        <td class="tdm" style="white-space:nowrap;font-size:.72rem">${esc(n.fecha || '')}</td>
        <td><span class="badge b-${norm(zona)==='NORTE'?'norte':'sur'}">${esc(zona)}</span></td>
        <td style="font-size:.8rem">${esc(n.concesion)}</td>
        <td style="font-size:.8rem">${esc(n.puesto)}</td>
        <td><span class="badge b-area">${esc(n.area)}</span></td>
        <td class="tdm">${esc(n.tipo)}</td>
        <td><span class="badge b-${String(nivel).toLowerCase()}">${esc(nivel)}</span></td>
        <td>${typeof estadoBadge==='function'?estadoBadge(estado):`<span class="badge b-area">${esc(estado)}</span>`}</td>
        <td class="tdm" title="${esc(d.texto)}"><b>${esc(d.dias)}</b><br><span style="font-size:.65rem">${norm(estado)==='CERRADA'?'al cierre':'abierta'}</span></td>
        <td style="max-width:260px;font-size:.76rem;line-height:1.35" title="${esc(desc)}">${esc(shortText(desc, 90))}</td>
        <td class="tdm">${esc(n.name || n.user || '')}</td>
        <td><select class="si" data-hist-estado="1" data-id="${esc(n.id)}" style="font-size:.72rem;padding:5px"><option value="">Cambiar...</option><option value="ABIERTA">Abierta</option><option value="GESTION">Gestión</option><option value="CERRADA">Cerrada</option></select></td>
      </tr>`;
    }).join('');
    renderDona();
  };

  window.fh = function(v){ state.q = v || ''; renderTbl(); };
  window.fa2 = function(v){ state.area = v || ''; renderTbl(); };
  window.fn2 = function(v){ state.criticidad = v || ''; renderTbl(); };
  window.fe2 = function(v){ state.estado = v || ''; renderTbl(); };

  document.addEventListener('change', function(e){
    const sel = e.target && e.target.closest && e.target.closest('select[data-hist-estado]');
    if (!sel || !sel.value) return;
    if (typeof cambiarEstadoNovedad === 'function') cambiarEstadoNovedad(sel.dataset.id, sel.value);
  });
})();
