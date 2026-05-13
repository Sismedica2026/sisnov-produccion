-- ============================================================
-- SEGUIMIENTO NOVEDADES OPERATIVAS - SISMEDICA SAS
-- Schema PostgreSQL para Render
-- ============================================================

-- USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(30) NOT NULL CHECK (rol IN (
    'admin','gerente','director-norte','director-sur',
    'coordinador-norte','coordinador-sur','supervisor'
  )),
  zona VARCHAR(10) CHECK (zona IN ('NORTE','SUR') OR zona IS NULL),
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- CONCESIONES ASIGNADAS A SUPERVISORES
CREATE TABLE IF NOT EXISTS asignaciones (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) REFERENCES usuarios(username) ON DELETE CASCADE,
  concesion VARCHAR(100) NOT NULL,
  asignado_en TIMESTAMP DEFAULT NOW(),
  asignado_por VARCHAR(50),
  UNIQUE(username, concesion)
);

-- NOVEDADES
CREATE TABLE IF NOT EXISTS novedades (
  id SERIAL PRIMARY KEY,
  zona VARCHAR(10) NOT NULL,
  concesion VARCHAR(100) NOT NULL,
  puesto VARCHAR(100) NOT NULL,
  movil VARCHAR(50),
  area VARCHAR(30) NOT NULL,
  tipo_novedad VARCHAR(100) NOT NULL,
  nivel VARCHAR(10) NOT NULL CHECK (nivel IN ('BAJA','MEDIA','CRITICA')),
  estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA','GESTION','CERRADA')),
  descripcion TEXT NOT NULL,
  registrado_por VARCHAR(50) REFERENCES usuarios(username),
  nombre_supervisor VARCHAR(100),
  creado_en TIMESTAMP DEFAULT NOW(),
  gestionado_en TIMESTAMP,
  cerrado_en TIMESTAMP
);

-- HISTORIAL DE CAMBIOS (auditoría)
CREATE TABLE IF NOT EXISTS auditoria (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(50),
  rol VARCHAR(30),
  accion VARCHAR(50) NOT NULL,
  detalle TEXT,
  ip VARCHAR(45),
  creado_en TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_novedades_zona ON novedades(zona);
CREATE INDEX IF NOT EXISTS idx_novedades_fecha ON novedades(creado_en);
CREATE INDEX IF NOT EXISTS idx_novedades_usuario ON novedades(registrado_por);
CREATE INDEX IF NOT EXISTS idx_novedades_nivel ON novedades(nivel);
CREATE INDEX IF NOT EXISTS idx_novedades_estado ON novedades(estado);
CREATE INDEX IF NOT EXISTS idx_asignaciones_user ON asignaciones(username);

-- Datos iniciales: por seguridad no se cargan usuarios demo en producción.
-- Use ADMIN_USERNAME, ADMIN_PASSWORD y ADMIN_NAME para crear el primer administrador.
-- Para pruebas locales, active SEED_DEMO_DATA=true.
