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
   - En producción cree el primer admin con `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `ADMIN_NAME`.

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
ADMIN_USERNAME=admin
ADMIN_NAME=Administrador SisNov
ADMIN_PASSWORD=Cambie-Esta-Clave-2026!
SEED_DEMO_DATA=false
```

## Decisión importante

No use `SEED_DEMO_DATA=true` en producción. Esa opción conserva usuarios de demostración con contraseña compartida y solo debe utilizarse para pruebas internas.
