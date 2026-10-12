# Tests del frontend

Desde `diagAuto-frontend`, instala las dependencias con `npm ci` si aún no están instaladas.

Ejecuta la suite una vez:

```bash
npm test -- --watch=false
```

Para repetir los tests automáticamente al editar archivos:

```bash
npm test
```

En PowerShell, usa `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

Los tests usan Angular TestBed, Vitest y peticiones HTTP simuladas con
`HttpTestingController`. No hace falta iniciar el backend y no se modifican datos reales.

La suite comprueba:

- Peticiones HTTP, cookies de sesión, login, registro y cierre de sesión.
- Recuperación de sesión y protección de las rutas privadas.
- Validación de formularios, navegación y errores de autenticación.
- Consulta, creación, actualización de averías y borrado de vehículos.
- Confirmación antes de borrar y conservación de los datos cuando falla el servidor.
- Cabecera de usuario autenticado y estructura principal de la aplicación.

Cada archivo `*.spec.ts` está junto al servicio o componente que comprueba.
Los datos y utilidades comunes están en `src/app/testing/test-helpers.ts`.
