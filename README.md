# 🏥 Seguimiento Novedades Operativas — Sismedica SAS

Sistema web para registro y seguimiento de novedades operativas con roles jerárquicos.

---

## 🗂 Estructura del proyecto

```
sisnov/
├── public/
│   ├── index.html      ← Frontend (UI)
│   └── app.js          ← Lógica cliente + llamadas API
├── src/
│   └── server.js       ← Backend Node.js + API REST
├── db/
│   └── schema.sql      ← Esquema PostgreSQL + datos iniciales
├── package.json
├── .env.example        ← Variables de entorno (copiar como .env)
└── .gitignore
```

---

## 🚀 Despliegue en GitHub + Render

### PASO 1 — Subir a GitHub

```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "Seguimiento Novedades Operativas - Sismedica SAS"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sisnov-sismedica.git
git push -u origin main
```

### PASO 2 — Crear base de datos en Render

1. Ir a **render.com** → Dashboard
2. Clic en **"New +"** → **"PostgreSQL"**
3. Configurar:
   - Name: `sisnov-db`
   - Database: `sisnov`
   - User: `sisnov_user`
   - Region: **Oregon (US West)** o el más cercano
   - Plan: **Free**
4. Clic en **"Create Database"**
5. Esperar ~2 minutos
6. Copiar la **"Internal Database URL"** (la necesitas en el paso 3)

### PASO 3 — Crear Web Service en Render

1. Clic en **"New +"** → **"Web Service"**
2. Conectar con tu repositorio de GitHub
3. Configurar:
   - Name: `sisnov-sismedica`
   - Region: **misma que la base de datos**
   - Branch: `main`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**
4. En **"Environment Variables"** agregar:
   ```
   DATABASE_URL = [pegar la Internal Database URL del paso 2]
   JWT_SECRET             = una_clave_larga_de_minimo_32_caracteres
   NODE_ENV               = production
   INITIAL_USERS_PASSWORD = una_contrasena_inicial_segura
   ADMIN_PASSWORD         = una_contrasena_inicial_segura
   SEED_DEMO_DATA         = false
   ```
5. Clic en **"Create Web Service"**

### PASO 4 — Inicializar la base de datos

La base de datos se inicializa automáticamente al arrancar el servidor
(el archivo `db/schema.sql` se ejecuta en el primer inicio).

Esperar ~3-5 minutos mientras Render hace el deploy.

### PASO 5 — Acceder

Tu aplicación estará disponible en:
```
https://sisnov-sismedica.onrender.com
```

---

## 🔐 Usuarios iniciales de producción

Al iniciar, el sistema crea usuarios faltantes sin borrar ni modificar usuarios existentes.

Estructura creada automáticamente si no existe:

| Cantidad | Rol | Usuarios |
|---------:|-----|----------|
| 2 | Administrador | `admin1`, `admin2` |
| 1 | Gerente | `gerente` |
| 2 | Director | `dir.norte`, `dir.sur` |
| 2 | Coordinador | `coord.norte`, `coord.sur` |
| 20 | Supervisor | `sup01` a `sup20` |

La contraseña inicial se toma de `INITIAL_USERS_PASSWORD`. Si esa variable no existe, usa `ADMIN_PASSWORD`.

⚠️ No hay credenciales visibles en el frontend. Después del primer ingreso, cambia las contraseñas desde administración.

---

## 🔧 Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL local

# 3. Arrancar
npm start
# La app estará en http://localhost:3000
```

---

## 📡 API Endpoints

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | /api/auth/login | Login | Todos |
| POST | /api/auth/logout | Logout | Autenticados |
| GET | /api/novedades | Listar novedades | Autenticados |
| POST | /api/novedades | Crear novedad | Admin, Coord, Sup |
| GET | /api/novedades/hoy | Control diario | Admin, Dir, Coord, Gerente |
| GET | /api/usuarios | Listar usuarios | Admin |
| PATCH | /api/usuarios/:u | Editar usuario | Admin |
| POST | /api/usuarios/:u/concesiones | Asignar concesión | Admin |
| DELETE | /api/usuarios/:u/concesiones/:c | Quitar concesión | Admin |
| GET | /api/reportes/resumen | Datos reportes | Autenticados |
| GET | /api/auditoria | Log auditoría | Admin |

---

## 🛡 Seguridad implementada

- ✅ JWT con expiración de 8 horas
- ✅ Bcrypt para contraseñas (salt rounds: 10)
- ✅ Rate limiting: 10 intentos de login / 15 min
- ✅ Helmet.js para cabeceras HTTP seguras
- ✅ RBAC (Control de acceso basado en roles)
- ✅ Auditoría completa de todas las acciones
- ✅ HTTPS automático en Render
- ✅ Validación de datos en backend

# Recuperación temporal de acceso inicial. Usar solo una vez y volver a false.
RESET_INITIAL_USERS_PASSWORD=false
INITIAL_USERS_PASSWORD=SisnovAdmin2026#Seguro
LOGIN_RATE_LIMIT_MAX=30


## Actualización funcional 2026

Incluye:
- Estados de novedad: ABIERTA, GESTION y CERRADA.
- Cambio obligatorio de contraseña al primer ingreso mediante `must_change_password`.
- Cambio de contraseña propio desde “Mi clave”.
- Catálogos administrables por admin: concesiones, puestos de trabajo y placas/UM.
- Dashboard mejorado con control por estado.

Después de desplegar, confirme que `RESET_INITIAL_USERS_PASSWORD=false` para evitar reseteos operativos.

## Actualización funcional v2.1

### 1. Placa activa e histórico
Cuando se agrega una nueva placa para la misma zona, concesión y puesto de trabajo, el sistema deja solo la nueva placa como activa. Las placas anteriores no se eliminan: quedan inactivas como histórico consultable por administración.

### 2. Integración Power BI gerencial
Se agregó endpoint seguro para BI:

```text
GET /api/bi/kpis
Header: x-bi-token: <BI_API_TOKEN>
```

Variable obligatoria recomendada en Render:

```env
BI_API_TOKEN=clave_larga_segura_para_powerbi
```

El endpoint entrega novedades, criticidades, responsables, concesiones y tiempos de cierre para KPIs gerenciales.

### 3. Dashboard criticidades
El dashboard y reportes ahora muestran resumen por criticidad, área, tipo de novedad, estado y tiempo promedio de cierre.
