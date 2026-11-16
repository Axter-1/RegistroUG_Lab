# Documentación técnica

## Estructura

```text
Backend/
  config/ controllers/ middleware/ routes/ tests/ utils/
  db/                    Esquema inicial y documentación de MySQL
Frontend/
  public/ src/            Aplicación React
IoT/
  firmware/               Firmware vigente para ESP32
  legacy_root/             Código anterior preservado; no desplegar
docker-compose.yml         API y MySQL
compose.frontend.yaml      Frontend
```

## Requisitos

- Docker Desktop / Docker Compose para levantar el entorno de desarrollo.
- Node.js y pnpm para ejecutar pruebas o scripts fuera de Docker.
- Placa ESP32 compatible y MicroPython para validar el firmware.

## Configuración y servicios

1. Copia `.env.example` a `.env`.
2. Sustituye los valores de ejemplo por secretos y credenciales locales. No
   publiques `.env`.
3. Desde la raíz, levanta el entorno completo:

   ```sh
   docker compose --env-file .env -f docker-compose.yml -f compose.frontend.yaml up --build
   ```

   - Frontend: <http://localhost:3001>
   - API: <http://localhost:3000>
   - MySQL: puerto `3306`

4. Para detenerlo:

   ```sh
   docker compose --env-file .env -f docker-compose.yml -f compose.frontend.yaml down
   ```

Para iniciar solo API y base de datos, usa `-f docker-compose.yml`; para solo
frontend, usa `-f compose.frontend.yaml`.

`REACT_APP_API_URL` es la dirección de API que usa el navegador. El valor local
predeterminado es `http://localhost:3000`. Para probar desde otro equipo,
configúrala con la dirección de red del equipo que ejecuta Docker y ajusta los
orígenes permitidos de CORS y Better Auth.

## Base de datos

El esquema inicial está en `Backend/db/db.sql`. MySQL lo carga al crear por
primera vez un volumen vacío. Cambios posteriores al esquema necesitan una
migración compatible con los datos existentes: reiniciar los contenedores no
vuelve a ejecutar el esquema.

El volumen `mysql_data` conserva datos. No lo elimines salvo que quieras borrar
la base local completa.

## Frontend

La aplicación usa React, Create React App (`react-scripts`), React Router y
Axios. Desde `Frontend/`:

```sh
pnpm start
pnpm test -- --watchAll=false
pnpm build
```

Conviven `package-lock.json` y `pnpm-lock.yaml`; el proyecto debe elegir un
único gestor de paquetes y mantenerlo alineado con el Dockerfile.

## Backend

La API usa Express, Better Auth y `mysql2`. Desde `Backend/`:

```sh
pnpm dev
pnpm test
```

El backend requiere variables MySQL y secretos configurados. Las rutas están
en `Backend/routes/`; los controladores y el middleware asociado están en sus
carpetas respectivas.

## Firmware ESP32

`IoT/firmware/` es la versión vigente. Al copiar al dispositivo, conserva la
estructura interna y carga su contenido en la raíz del sistema de archivos
MicroPython. Los imports esperan allí los módulos `QR/`, `screen/`,
`request_handler/` y `lib/`; los recursos de audio e imagen también usan rutas
relativas.

`IoT/firmware/lib/` es la biblioteca canónica. `IoT/legacy_root/` preserva el
código MicroPython anterior y una copia divergente de `lib/`; no es parte del
despliegue actual. El firmware requiere pruebas físicas de Wi-Fi, QR, pantalla,
audio y comunicación con la API.

## Seguridad y producción

Las configuraciones Docker actuales son para desarrollo. Antes de producción:

- servir el frontend como build de producción detrás de HTTPS;
- gestionar secretos fuera del repositorio y rotar cualquier credencial que
  haya sido real;
- parametrizar direcciones de API y dispositivos;
- agregar migraciones de base de datos y respaldos probados;
- probar autenticación, autorización y flujos de acceso en integración;
- validar el firmware en la placa y versión de MicroPython objetivo.
