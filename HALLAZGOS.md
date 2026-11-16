# Veredicto y hallazgos

**Veredicto superficial:** el repositorio ya reúne las piezas de un sistema
completo —interfaz, API, MySQL y firmware ESP32—, pero hoy tiene bloqueos de
funcionalidad y no está listo para producción. Esta es una auditoría inicial,
no una certificación de seguridad.

## Hallazgos prioritarios

### Críticos

1. **Frontend con conflicto de merge sin resolver.**
   `Frontend/src/consultaAccesos/datos.js` contiene marcadores `<<<<<<<`,
   `=======` y `>>>>>>>` (líneas 1, 71 y 214). Esto impide compilar el módulo y
   puede afectar también las pantallas que lo importan.

2. **El endpoint QR puede quedar bloqueado.**
   `Backend/routes/router.js` registra `/api/accesos/qr` con un handler de
   depuración que solo hace `console.log` y no llama a `next()`. La petición no
   llega al middleware de dispositivo ni al controlador.

### Altos

3. **Las rutas privadas no están protegidas como se espera.**
   En `Frontend/src/index.js`, el `Route` que usa `IsLogged` no tiene rutas
   hijas; accesos, agendas, reportes y administración se declaran fuera de él.

4. **Varias pantallas no persisten datos reales.**
   Administración e informes usan datos simulados o estado local; la agenda
   tampoco persiste sus cambios. No deben presentarse como funciones completas
   hasta conectarlas y probarlas con la API.

5. **El firmware incluye una dirección IP fija.**
   `IoT/firmware/main.py` y `IoT/firmware/request_handler/api_handler.py`
   requieren configuración de red adecuada para cada instalación.

6. **Hay una credencial en un fragmento histórico que se retiró.**
   El archivo legado eliminado del árbol contenía una credencial de ejemplo.
   Si llegó a ser real, borrarlo del directorio actual no la elimina del
   historial Git: debe rotarse.

### Medios

7. **Gestión de dependencias inconsistente.**
   Frontend conserva `package-lock.json` y `pnpm-lock.yaml`. Backend declara
   una versión de pnpm que no coincide con el entorno local probado.

8. **Persistencia y esquema sin migraciones versionadas.**
   `Backend/db/db.sql` se aplica al inicializar un volumen nuevo; no actualiza
   automáticamente bases existentes.

9. **Cobertura de pruebas limitada.**
   No se verificaron pruebas de integración para API, autenticación, base de
   datos, dispositivo QR ni hardware.

## Verificación realizada

- La configuración combinada de Docker Compose pasó
  `docker compose ... config --quiet`.
- Los tests no pudieron validarse en este entorno: faltan dependencias locales
  (`better-auth` y `react-scripts`). Además, `npm test` en Backend se detiene
  por el requisito declarado de pnpm.
- Se comprobó que todos los archivos rastreados antes de la reorganización
  tienen destino en la estructura nueva.

## Próximos pasos recomendados

1. Resolver los marcadores de merge y conseguir un build limpio del frontend.
2. Quitar el handler de depuración que bloquea el endpoint QR y probar ese
   flujo con autenticación de dispositivo.
3. Anidar correctamente las rutas privadas y probar permisos por rol.
4. Conectar las pantallas simuladas a endpoints reales o identificarlas
   explícitamente como prototipos.
5. Elegir un gestor de paquetes y una versión, instalar dependencias y ejecutar
   tests y build reproducibles en CI.
6. Definir cómo cada acceso se asocia a una reserva vigente (laboratorio,
   horario, UDA/razón y grupo), incluyendo reglas para reservas solapadas.
7. Antes de producción, decidir si los motores de base de datos deben separarse
   y planificar la migración de datos; agregar también migraciones versionadas.
8. Parametrizar la configuración IoT, rotar credenciales reales si las hubo,
   y completar pruebas de integración y validación en hardware.
