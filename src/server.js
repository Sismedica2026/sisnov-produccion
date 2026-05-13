// ============================================================
// SEGUIMIENTO NOVEDADES OPERATIVAS - Sismedica SAS
// Servidor Node.js + PostgreSQL para Render
// Versión endurecida para despliegue web multiusuario
// ============================================================

require('dotenv').config();
const crypto       = require('crypto');
const express      = require('express');
const { Pool }     = require('pg');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_COOKIE = 'sisnov_access';
const CSRF_COOKIE = 'sisnov_csrf';
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '8h';
const MIN_PASSWORD_LENGTH = Number(process.env.MIN_PASSWORD_LENGTH || 12);

if (isProduction && (!JWT_SECRET || JWT_SECRET.length < 32)) {
  console.error('❌ JWT_SECRET es obligatorio en producción y debe tener mínimo 32 caracteres.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL es obligatorio.');
  process.exit(1);
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: 8 * 60 * 60 * 1000
};
const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: 8 * 60 * 60 * 1000
};

// ── PostgreSQL Pool ──────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// ── Middleware ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      // La aplicación heredada usa manejadores HTML como onclick/onchange.
      // CSP3 bloquea esos atributos con script-src-attr si no se declara explícitamente.
      // Se habilita solo para atributos, manteniendo connect-src, frame-ancestors y demás restricciones.
      "script-src-attr": ["'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "style-src-elem": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "style-src-attr": ["'unsafe-inline'"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      "img-src": ["'self'", 'data:'],
      "connect-src": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'none'"],
      "base-uri": ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true); // same-origin, curl, health checks
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
// En producción evitamos que el navegador conserve versiones antiguas del login.
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.path.endsWith('.js')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, '../public'), {
  extensions: ['html'],
  maxAge: 0,
  etag: false
}));

// Rate limiting — protección contra abuso y fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espere 15 minutos.' }
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes.' }
});
app.use('/api/', apiLimiter);

// ── Helpers ─────────────────────────────────────────────────
function publicUser(user, concesiones = []) {
  return {
    username: user.username,
    nombre: user.nombre,
    rol: user.rol,
    zona: user.zona,
    concesiones
  };
}

function signToken(user) {
  return jwt.sign(
    { username: user.username, nombre: user.nombre, rol: user.rol, zona: user.zona },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL, issuer: 'sisnov', audience: 'sisnov-web' }
  );
}

function setSessionCookies(res, token) {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(ACCESS_COOKIE, token, cookieOptions);
  res.cookie(CSRF_COOKIE, csrfToken, csrfCookieOptions);
}

function clearSessionCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.clearCookie(CSRF_COOKIE, { ...csrfCookieOptions, maxAge: undefined });
}

function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.path === '/api/auth/login') return next();
  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF inválido o ausente' });
  }
  next();
}
app.use(csrfProtection);

function sanitizeText(value, max = 255) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max);
}
function validEnum(value, allowed) {
  return allowed.includes(value);
}
function strongPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) return false;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(rx => rx.test(password)).length;
  return classes >= 3;
}
async function userConcesiones(username) {
  const conResult = await pool.query(
    'SELECT concesion FROM asignaciones WHERE username = $1 ORDER BY concesion',
    [username]
  );
  return conResult.rows.map(r => r.concesion);
}

// ── Auth Middleware ──────────────────────────────────────────
async function auth(req, res, next) {
  const header = req.headers.authorization;
  const bearer = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = req.cookies[ACCESS_COOKIE] || bearer;
  if (!token) return res.status(401).json({ error: 'Sin sesión de autenticación' });

  try {
    const payload = jwt.verify(token, JWT_SECRET, { issuer: 'sisnov', audience: 'sisnov-web' });
    const result = await pool.query(
      'SELECT username, nombre, rol, zona, activo FROM usuarios WHERE username = $1',
      [payload.username]
    );
    const dbUser = result.rows[0];
    if (!dbUser || !dbUser.activo) return res.status(401).json({ error: 'Usuario inactivo o inexistente' });
    req.user = dbUser;
    next();
  } catch {
    clearSessionCookies(res);
    res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Sin permisos para esta acción' });
    }
    next();
  };
}

// ── Auditoría helper ─────────────────────────────────────────
async function logAudit(username, rol, accion, detalle, ip) {
  try {
    await pool.query(
      'INSERT INTO auditoria (usuario, rol, accion, detalle, ip) VALUES ($1,$2,$3,$4,$5)',
      [username, rol, accion, detalle, ip]
    );
  } catch { /* no bloquear la operación principal */ }
}

// ── DB Init ──────────────────────────────────────────────────
const INITIAL_USERS = [
  // 2 ADMINISTRADORES
  { username: 'admin1',      nombre: 'Administrador Principal',      rol: 'admin',             zona: null },
  { username: 'admin2',      nombre: 'Administrador Secundario',     rol: 'admin',             zona: null },
  // GERENCIA
  { username: 'gerente',     nombre: 'Gerente General',              rol: 'gerente',           zona: null },
  // DIRECCIÓN POR ZONA
  { username: 'dir.norte',   nombre: 'Director Zona Norte',          rol: 'director-norte',    zona: 'NORTE' },
  { username: 'dir.sur',     nombre: 'Director Zona Sur',            rol: 'director-sur',      zona: 'SUR' },
  // COORDINACIÓN POR ZONA
  { username: 'coord.norte', nombre: 'Coordinador Zona Norte',       rol: 'coordinador-norte', zona: 'NORTE' },
  { username: 'coord.sur',   nombre: 'Coordinador Zona Sur',         rol: 'coordinador-sur',   zona: 'SUR' },
  // 20 SUPERVISORES
  { username: 'sup01', nombre: 'Supervisor Norte 01', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup02', nombre: 'Supervisor Norte 02', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup03', nombre: 'Supervisor Norte 03', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup04', nombre: 'Supervisor Norte 04', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup05', nombre: 'Supervisor Norte 05', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup06', nombre: 'Supervisor Norte 06', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup07', nombre: 'Supervisor Norte 07', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup08', nombre: 'Supervisor Norte 08', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup09', nombre: 'Supervisor Norte 09', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup10', nombre: 'Supervisor Norte 10', rol: 'supervisor', zona: 'NORTE' },
  { username: 'sup11', nombre: 'Supervisor Sur 11',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup12', nombre: 'Supervisor Sur 12',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup13', nombre: 'Supervisor Sur 13',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup14', nombre: 'Supervisor Sur 14',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup15', nombre: 'Supervisor Sur 15',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup16', nombre: 'Supervisor Sur 16',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup17', nombre: 'Supervisor Sur 17',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup18', nombre: 'Supervisor Sur 18',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup19', nombre: 'Supervisor Sur 19',   rol: 'supervisor', zona: 'SUR' },
  { username: 'sup20', nombre: 'Supervisor Sur 20',   rol: 'supervisor', zona: 'SUR' }
];

const INITIAL_ASSIGNMENTS = [
  ['sup01', 'AUTOPISTA DEL CARIBE'],
  ['sup02', 'RUTA AL MAR ANTIOQUIA'], ['sup02', 'YUMA'],
  ['sup03', 'YUMA'],
  ['sup04', 'PERIMETRAL'], ['sup04', 'SISGA'],
  ['sup05', 'COSTERA'],
  ['sup06', 'RUTAS DEL CACAO'],
  ['sup07', 'ACCENORTE'], ['sup07', 'AUTOPISTA DEL CARIBE'],
  ['sup08', 'AUTOPISTA DEL RIO GRANDE'],
  ['sup09', 'COVIANDINA'],
  ['sup10', 'SISGA'], ['sup10', 'NORDESTE'],
  ['sup11', 'PACIFICO 3'],
  ['sup12', 'RUTAS DEL VALLE'], ['sup12', 'PACIFICO 3'],
  ['sup13', 'COVIORIENTE'],
  ['sup14', 'TUNEL DE LA LINEA'],
  ['sup15', 'PACIFICO 2 - LA PINTADA'], ['sup15', 'TUNEL DE LA LINEA'],
  ['sup16', 'PERIMETRAL'], ['sup16', 'RUTA BOGOTA NORTE'],
  ['sup17', 'COVIANDINA'],
  ['sup18', 'PANAMERICANA'],
  ['sup19', 'VIAL DEL NUS'],
  ['sup20', 'UNION DEL SUR']
];

function envFlagEnabled(value) {
  return ['true', '1', 'yes', 'si', 'sí'].includes(String(value || '').trim().toLowerCase());
}

async function bootstrapInitialUsers() {
  const password = process.env.INITIAL_USERS_PASSWORD || process.env.ADMIN_PASSWORD;
  const resetInitialUsers = envFlagEnabled(process.env.RESET_INITIAL_USERS_PASSWORD);

  if (!password || !strongPassword(password)) {
    throw new Error(`INITIAL_USERS_PASSWORD o ADMIN_PASSWORD es obligatorio para crear usuarios iniciales y debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres con 3 tipos de caracteres.`);
  }

  const hash = await bcrypt.hash(password, 12);
  let created = 0;
  let updated = 0;

  for (const user of INITIAL_USERS) {
    const result = await pool.query(
      `INSERT INTO usuarios (username, password_hash, nombre, rol, zona, activo)
       VALUES ($1,$2,$3,$4,$5,true)
       ON CONFLICT (username) DO NOTHING
       RETURNING username`,
      [user.username, hash, user.nombre, user.rol, user.zona]
    );
    if (result.rowCount > 0) created += 1;

    // Recuperación segura: si RESET_INITIAL_USERS_PASSWORD=true, actualiza contraseña
    // de TODOS los usuarios iniciales existentes sin borrar registros ni novedades.
    if (resetInitialUsers && result.rowCount === 0) {
      const updateResult = await pool.query(
        `UPDATE usuarios
         SET password_hash = $2,
             nombre = $3,
             rol = $4,
             zona = $5,
             activo = true,
             actualizado_en = NOW()
         WHERE LOWER(TRIM(username)) = LOWER(TRIM($1))`,
        [user.username, hash, user.nombre, user.rol, user.zona]
      );
      updated += updateResult.rowCount;
    }
  }

  // Garantía adicional para recuperación de acceso: admin1 y admin2 siempre quedan
  // activos y con la contraseña indicada cuando el reset está habilitado.
  if (resetInitialUsers) {
    for (const admin of INITIAL_USERS.filter(u => ['admin1', 'admin2'].includes(u.username))) {
      await pool.query(
        `INSERT INTO usuarios (username, password_hash, nombre, rol, zona, activo)
         VALUES ($1,$2,$3,$4,$5,true)
         ON CONFLICT (username)
         DO UPDATE SET password_hash = EXCLUDED.password_hash,
                       nombre = EXCLUDED.nombre,
                       rol = EXCLUDED.rol,
                       zona = EXCLUDED.zona,
                       activo = true,
                       actualizado_en = NOW()`,
        [admin.username, hash, admin.nombre, admin.rol, admin.zona]
      );
    }
    console.log('🔐 Reset de acceso aplicado para admin1 y admin2. Desactive RESET_INITIAL_USERS_PASSWORD después de ingresar.');
  }

  for (const [username, concesion] of INITIAL_ASSIGNMENTS) {
    await pool.query(
      `INSERT INTO asignaciones (username, concesion, asignado_por)
       VALUES ($1,$2,$3)
       ON CONFLICT (username, concesion) DO NOTHING`,
      [username, concesion, 'bootstrap']
    );
  }

  const total = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios');
  const resetMsg = resetInitialUsers ? ` Usuarios existentes actualizados: ${updated}.` : '';
  console.log(`✅ Bootstrap de usuarios listo. Usuarios creados ahora: ${created}.${resetMsg} Total usuarios: ${total.rows[0].total}.`);
}

async function initDB() {
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await pool.query(schema);

  if (process.env.SEED_DEMO_DATA === 'true') {
    const seed = fs.readFileSync(path.join(__dirname, '../db/seed_demo.sql'), 'utf8');
    await pool.query(seed);
    console.log('⚠️ Datos demo cargados. No active SEED_DEMO_DATA en producción.');
  } else {
    await bootstrapInitialUsers();
  }
  console.log('✅ Base de datos inicializada correctamente');
}

// ============================================================
// RUTAS AUTH
// ============================================================

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const rawUsername = req.body.username || req.body.usuario || req.body.user || req.body.email || '';
  const username = sanitizeText(rawUsername, 50).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user || !user.activo) {
      console.warn(`Login fallido: usuario inexistente o inactivo [${username}]`);
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.warn(`Login fallido: contraseña inválida para [${username}]`);
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const concesiones = await userConcesiones(user.username);
    const token = signToken(user);
    setSessionCookies(res, token);

    await logAudit(user.username, user.rol, 'LOGIN', 'Inicio de sesión exitoso', req.ip);
    res.json({ user: publicUser(user, concesiones) });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const concesiones = await userConcesiones(req.user.username);
  res.json({ user: publicUser(req.user, concesiones) });
});

app.post('/api/auth/logout', auth, async (req, res) => {
  await logAudit(req.user.username, req.user.rol, 'LOGOUT', 'Cierre de sesión', req.ip);
  clearSessionCookies(res);
  res.json({ ok: true });
});

// ============================================================
// RUTAS NOVEDADES
// ============================================================

app.get('/api/novedades', auth, async (req, res) => {
  try {
    const { rol, username } = req.user;
    const { desde, hasta } = req.query;
    const area = sanitizeText(req.query.area || '', 30);
    const nivel = sanitizeText(req.query.nivel || '', 10);
    const concesion = sanitizeText(req.query.concesion || '', 100);

    let where = [];
    let params = [];
    let i = 1;

    if (rol === 'director-norte' || rol === 'coordinador-norte') where.push(`n.zona = 'NORTE'`);
    else if (rol === 'director-sur' || rol === 'coordinador-sur') where.push(`n.zona = 'SUR'`);
    else if (rol === 'supervisor') { where.push(`n.registrado_por = $${i++}`); params.push(username); }

    if (desde)     { where.push(`n.creado_en >= $${i++}`); params.push(desde); }
    if (hasta)     { where.push(`n.creado_en <= $${i++}`); params.push(hasta + ' 23:59:59'); }
    if (area)      { where.push(`n.area = $${i++}`);       params.push(area); }
    if (nivel)     { where.push(`n.nivel = $${i++}`);      params.push(nivel); }
    if (concesion) { where.push(`n.concesion = $${i++}`);  params.push(concesion); }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const result = await pool.query(`
      SELECT n.*, TO_CHAR(n.creado_en AT TIME ZONE 'America/Bogota', 'DD/MM/YYYY HH24:MI:SS') as fecha_formato
      FROM novedades n
      ${whereStr}
      ORDER BY n.creado_en DESC
      LIMIT 1000
    `, params);

    res.json({ novedades: result.rows, total: result.rows.length });
  } catch (e) {
    console.error('GET novedades error:', e);
    res.status(500).json({ error: 'Error al obtener novedades' });
  }
});

app.post('/api/novedades', auth, requireRoles('admin','coordinador-norte','coordinador-sur','supervisor'), async (req, res) => {
  const zona = sanitizeText(req.body.zona || '', 10).toUpperCase();
  const concesion = sanitizeText(req.body.concesion || '', 100);
  const puesto = sanitizeText(req.body.puesto || '', 100);
  const movil = sanitizeText(req.body.movil || '', 50) || null;
  const area = sanitizeText(req.body.area || '', 30).toUpperCase();
  const tipo_novedad = sanitizeText(req.body.tipo_novedad || '', 100).toUpperCase();
  const nivel = sanitizeText(req.body.nivel || '', 10).toUpperCase();
  const descripcion = sanitizeText(req.body.descripcion || '', 3000);

  if (!zona || !concesion || !puesto || !area || !tipo_novedad || !nivel || !descripcion) {
    return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
  }
  if (!validEnum(zona, ['NORTE', 'SUR']) || !validEnum(nivel, ['BAJA', 'MEDIA', 'CRITICA'])) {
    return res.status(400).json({ error: 'Zona o nivel inválido' });
  }

  if (req.user.rol === 'supervisor') {
    const asignadas = await userConcesiones(req.user.username);
    if (zona !== req.user.zona || !asignadas.includes(concesion)) {
      return res.status(403).json({ error: 'No puede registrar novedades fuera de su zona o concesiones asignadas' });
    }
  }
  if (req.user.rol === 'coordinador-norte' && zona !== 'NORTE') {
    return res.status(403).json({ error: 'Solo puede registrar novedades de la zona NORTE' });
  }
  if (req.user.rol === 'coordinador-sur' && zona !== 'SUR') {
    return res.status(403).json({ error: 'Solo puede registrar novedades de la zona SUR' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO novedades (zona, concesion, puesto, movil, area, tipo_novedad, nivel, descripcion, registrado_por, nombre_supervisor)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *, TO_CHAR(creado_en AT TIME ZONE 'America/Bogota', 'DD/MM/YYYY HH24:MI:SS') as fecha_formato
    `, [zona, concesion, puesto, movil, area, tipo_novedad, nivel, descripcion, req.user.username, req.user.nombre]);

    await logAudit(req.user.username, req.user.rol, 'REGISTRO',
      `Novedad #${result.rows[0].id} — ${area}/${tipo_novedad}/${nivel} en ${concesion}-${puesto}`, req.ip);

    res.status(201).json({ novedad: result.rows[0] });
  } catch (e) {
    console.error('POST novedad error:', e);
    res.status(500).json({ error: 'Error al guardar novedad' });
  }
});

app.get('/api/novedades/hoy', auth, async (req, res) => {
  try {
    const { rol } = req.user;
    let zonaFilter = '';
    if (rol === 'director-norte' || rol === 'coordinador-norte') zonaFilter = "AND u.zona = 'NORTE'";
    else if (rol === 'director-sur' || rol === 'coordinador-sur') zonaFilter = "AND u.zona = 'SUR'";

    const supResult = await pool.query(`
      SELECT u.username, u.nombre, u.zona, u.activo,
             COALESCE(json_agg(a.concesion) FILTER (WHERE a.concesion IS NOT NULL), '[]') as concesiones
      FROM usuarios u
      LEFT JOIN asignaciones a ON a.username = u.username
      WHERE u.rol = 'supervisor' AND u.activo = true ${zonaFilter}
      GROUP BY u.username, u.nombre, u.zona, u.activo
      ORDER BY u.zona, u.nombre
    `);

    const novHoyResult = await pool.query(`
      SELECT registrado_por, COUNT(*) as total,
             json_agg(json_build_object('area', area, 'concesion', concesion,
               'hora', TO_CHAR(creado_en AT TIME ZONE 'America/Bogota','HH24:MI'))) as registros
      FROM novedades
      WHERE creado_en::date = (NOW() AT TIME ZONE 'America/Bogota')::date
      GROUP BY registrado_por
    `);

    const novMap = {};
    novHoyResult.rows.forEach(r => { novMap[r.registrado_por] = r; });
    const reporte = supResult.rows.map(s => {
      const novHoy = novMap[s.username];
      const count = novHoy ? parseInt(novHoy.total, 10) : 0;
      return {
        username: s.username, nombre: s.nombre, zona: s.zona, concesiones: s.concesiones,
        registros_hoy: count, status: count >= 2 ? 'ok' : count === 1 ? 'warn' : 'miss',
        detalle: novHoy ? novHoy.registros : []
      };
    });

    res.json({ reporte, fecha: new Date().toLocaleDateString('es-CO') });
  } catch (e) {
    console.error('GET hoy error:', e);
    res.status(500).json({ error: 'Error al obtener control diario' });
  }
});

// ============================================================
// RUTAS USUARIOS (solo admin)
// ============================================================

app.get('/api/usuarios', auth, requireRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.username, u.nombre, u.rol, u.zona, u.activo, u.creado_en,
             COALESCE(json_agg(a.concesion ORDER BY a.concesion) FILTER (WHERE a.concesion IS NOT NULL), '[]') as concesiones
      FROM usuarios u
      LEFT JOIN asignaciones a ON a.username = u.username
      GROUP BY u.username, u.nombre, u.rol, u.zona, u.activo, u.creado_en
      ORDER BY u.rol, u.username
    `);
    res.json({ usuarios: result.rows });
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.patch('/api/usuarios/:username', auth, requireRoles('admin'), async (req, res) => {
  const username = sanitizeText(req.params.username || '', 50).toLowerCase();
  const nombre = req.body.nombre === undefined ? null : sanitizeText(req.body.nombre, 100);
  const zona = req.body.zona === undefined || req.body.zona === null || req.body.zona === '' ? null : sanitizeText(req.body.zona, 10).toUpperCase();
  const activo = typeof req.body.activo === 'boolean' ? req.body.activo : null;
  if (zona && !validEnum(zona, ['NORTE', 'SUR'])) return res.status(400).json({ error: 'Zona inválida' });

  try {
    await pool.query(`
      UPDATE usuarios SET
        nombre = COALESCE($1, nombre),
        zona   = COALESCE($2, zona),
        activo = COALESCE($3, activo),
        actualizado_en = NOW()
      WHERE username = $4
    `, [nombre, zona, activo, username]);

    await logAudit(req.user.username, req.user.rol, 'EDICION', `Usuario @${username}`, req.ip);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

app.post('/api/usuarios/:username/concesiones', auth, requireRoles('admin'), async (req, res) => {
  const username = sanitizeText(req.params.username || '', 50).toLowerCase();
  const concesion = sanitizeText(req.body.concesion || '', 100);
  if (!concesion) return res.status(400).json({ error: 'Concesión requerida' });
  try {
    await pool.query(
      'INSERT INTO asignaciones (username, concesion, asignado_por) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [username, concesion, req.user.username]
    );
    await logAudit(req.user.username, req.user.rol, 'ASIGNACION', `Agregó concesión a @${username}`, req.ip);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al asignar concesión' });
  }
});

app.delete('/api/usuarios/:username/concesiones/:concesion', auth, requireRoles('admin'), async (req, res) => {
  const username = sanitizeText(req.params.username || '', 50).toLowerCase();
  const concesion = sanitizeText(decodeURIComponent(req.params.concesion || ''), 100);
  try {
    await pool.query('DELETE FROM asignaciones WHERE username=$1 AND concesion=$2', [username, concesion]);
    await logAudit(req.user.username, req.user.rol, 'ASIGNACION', `Quitó concesión de @${username}`, req.ip);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al quitar concesión' });
  }
});

app.patch('/api/usuarios/:username/password', auth, requireRoles('admin'), async (req, res) => {
  const username = sanitizeText(req.params.username || '', 50).toLowerCase();
  const { password } = req.body;
  if (!strongPassword(password)) {
    return res.status(400).json({ error: `Contraseña débil. Use mínimo ${MIN_PASSWORD_LENGTH} caracteres y 3 tipos: mayúsculas, minúsculas, números o símbolos.` });
  }
  const hash = await bcrypt.hash(password, 12);
  await pool.query('UPDATE usuarios SET password_hash=$1, actualizado_en=NOW() WHERE username=$2', [hash, username]);
  await logAudit(req.user.username, req.user.rol, 'CAMBIO_PASS', `Contraseña cambiada para @${username}`, req.ip);
  res.json({ ok: true });
});

// ============================================================
// RUTAS AUDITORÍA (solo admin)
// ============================================================

app.get('/api/auditoria', auth, requireRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, TO_CHAR(creado_en AT TIME ZONE 'America/Bogota','DD/MM/YYYY HH24:MI:SS') as fecha_formato
      FROM auditoria ORDER BY creado_en DESC LIMIT 200
    `);
    res.json({ registros: result.rows });
  } catch {
    res.status(500).json({ error: 'Error al obtener auditoría' });
  }
});

// ============================================================
// RUTA REPORTES
// ============================================================

app.get('/api/reportes/resumen', auth, async (req, res) => {
  try {
    const { rol } = req.user;
    let zFilter = '';
    if (rol === 'director-norte' || rol === 'coordinador-norte') zFilter = "AND zona='NORTE'";
    else if (rol === 'director-sur' || rol === 'coordinador-sur') zFilter = "AND zona='SUR'";

    const [totales, porArea, porNivel, porZona, porCon] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, zona FROM novedades WHERE 1=1 ${zFilter} GROUP BY zona`),
      pool.query(`SELECT area, COUNT(*) as total FROM novedades WHERE 1=1 ${zFilter} GROUP BY area ORDER BY total DESC`),
      pool.query(`SELECT nivel, COUNT(*) as total FROM novedades WHERE 1=1 ${zFilter} GROUP BY nivel`),
      pool.query(`SELECT zona, COUNT(*) as total FROM novedades GROUP BY zona`),
      pool.query(`SELECT concesion, COUNT(*) as total FROM novedades WHERE 1=1 ${zFilter} GROUP BY concesion ORDER BY total DESC LIMIT 10`)
    ]);

    res.json({
      totales: totales.rows,
      porArea: porArea.rows,
      porNivel: porNivel.rows,
      porZona: porZona.rows,
      porConcesion: porCon.rows
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

app.get('/healthz', (req, res) => res.json({ ok: true }));

// ── Servir el frontend para cualquier ruta ───────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Arrancar servidor ────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SisNov corriendo en puerto ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(e => {
  console.error('❌ Error iniciando DB:', e);
  process.exit(1);
});
