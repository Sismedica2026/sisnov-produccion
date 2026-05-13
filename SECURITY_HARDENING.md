# Endurecimiento de seguridad aplicado

## Cambios implementados

1. **JWT fuera de localStorage**
   - El token de sesión ahora se guarda en cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`.
   - El frontend ya no persiste `sisnov_token` ni `sisnov_user` en `localStorage`.

2. **Protección CSRF**
   - Se agregó token CSRF de doble envío para métodos `POST`, `PATCH` y `DELETE`.
   - El frontend envía `X-CSRF-Token` automáticamente.

3. **CORS restringido**
   - Ya no se usa `cors()` abierto.
   - Configure dominios permitidos con `ALLOWED_ORIGINS`.

4. **JWT_SECRET obligatorio**
   - En producción la app se detiene si `JWT_SECRET` no existe o tiene menos de 32 caracteres.

5. **Headers de seguridad**
   - Helmet queda activo con Content Security Policy básica, bloqueo de framing y políticas seguras.

6. **Rate limiting reforzado**
   - Login limitado a 5 intentos cada 15 minutos.
   - API limitada a 120 solicitudes por minuto.

7. **Contraseñas más fuertes**
   - Cambio de contraseña exige mínimo 12 caracteres y al menos 3 tipos de caracteres.
   - Bcrypt usa costo 12 para nuevas contraseñas.

8. **Semilla demo desactivada por defecto**
   - Los usuarios con contraseña conocida ya no se crean automáticamente.
   - Para pruebas locales puede activar `SEED_DEMO_DATA=true`.
   - En producción se crean usuarios iniciales faltantes con `INITIAL_USERS_PASSWORD` o `ADMIN_PASSWORD`, sin borrar ni modificar usuarios existentes.

9. **Control de permisos en novedades**
   - Supervisores no pueden registrar novedades fuera de su zona o concesiones asignadas aunque manipulen el navegador.
   - Coordinadores quedan restringidos a su zona.

10. **Validación y limpieza básica de entradas**
    - Se limitan longitudes y caracteres de control en campos sensibles.

## Variables mínimas en Render

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=clave_aleatoria_larga_de_32_o_mas_caracteres
ALLOWED_ORIGINS=https://su-dominio.onrender.com
INITIAL_USERS_PASSWORD=Cambie-Esta-Clave-2026!
ADMIN_PASSWORD=Cambie-Esta-Clave-2026!
SEED_DEMO_DATA=false
```

## Decisión importante

No use `SEED_DEMO_DATA=true` en producción. Esa opción conserva usuarios de demostración con contraseña compartida y solo debe utilizarse para pruebas internas.

## Ajuste aplicado para publicación

- Se retiró de `public/index.html` el bloque visible con credenciales de prueba.
- La aplicación crea o completa la estructura inicial de usuarios: 2 admin, 1 gerente, 2 directores, 2 coordinadores y 20 supervisores. Usa `ON CONFLICT DO NOTHING`, por lo que no borra ni cambia usuarios existentes.
- En producción no deben quedar usuarios, contraseñas, tokens ni credenciales demo en HTML, JavaScript, comentarios o documentación pública.

Variables mínimas para Render:

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
JWT_SECRET=clave_larga_de_32_o_mas_caracteres
INITIAL_USERS_PASSWORD=SisnovAdmin2026#Seguro
ADMIN_PASSWORD=SisnovAdmin2026#Seguro
SEED_DEMO_DATA=false
```

## Recuperación controlada de acceso inicial

Si los usuarios iniciales fueron creados con una contraseña incorrecta o desconocida, se puede activar temporalmente:

```env
INITIAL_USERS_PASSWORD=SisnovAdmin2026#Seguro
RESET_INITIAL_USERS_PASSWORD=true
```

Después del deploy exitoso y de confirmar acceso con `admin1`, cambiar `RESET_INITIAL_USERS_PASSWORD` nuevamente a `false` y desplegar otra vez.

No se debe dejar `RESET_INITIAL_USERS_PASSWORD=true` de forma permanente, porque cada reinicio volvería a asignar la misma contraseña inicial a todos los usuarios bootstrap.
