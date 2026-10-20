# Ejecutar el frontend con Docker

Este documento explica cómo se preparó y cómo usar la configuración Docker del
frontend de RegistroUG_Lab, tanto en la computadora de desarrollo como en otra
máquina.

## Qué se ejecuta

La configuración actual ejecuta solamente la aplicación web React del
directorio `FrontEnd/uglab_frontend`. No inicia un backend/API ni programa o
simula el ESP32. Por eso, las funciones que necesiten esos servicios no estarán
disponibles por el solo hecho de iniciar este contenedor.

Docker contiene Node.js, pnpm y las dependencias del frontend dentro del
contenedor. No hace falta instalar Node.js, npm ni pnpm en Windows. Sí hace falta
instalar y mantener en ejecución Docker Desktop (o un entorno Docker compatible
con Docker Compose).

## Archivos de la configuración

- `compose.yaml`: define el servicio `frontend`, la construcción de la imagen,
  el puerto y los montajes de desarrollo.
- `FrontEnd/uglab_frontend/Dockerfile`: usa la imagen `node:22-alpine`, activa
  pnpm mediante Corepack y ejecuta `pnpm install --frozen-lockfile` usando el
  manifiesto y el lockfile del frontend. Al iniciar el contenedor, ejecuta
  `npm start`, que lanza el servidor de desarrollo de Create React App.
- `FrontEnd/uglab_frontend/.dockerignore`: evita copiar `node_modules`, la
  carpeta de compilación y archivos `.env` al contexto de construcción.

Compose monta el código fuente del frontend en `/app` para que el servidor de
desarrollo detecte cambios. También monta un volumen Docker separado en
`/app/node_modules`: así, el directorio `node_modules` de Windows no reemplaza
los paquetes Linux que se instalaron dentro de la imagen. La opción
`CHOKIDAR_USEPOLLING` ayuda a detectar cambios en archivos cuando se usa Docker
Desktop.

## Iniciar en la máquina anfitriona

1. Instala Docker Desktop para Windows y espera a que indique que Docker está en
   ejecución.
2. Abre PowerShell en la raíz del repositorio, es decir, en la carpeta que
   contiene `compose.yaml`.
3. Construye la imagen e inicia el servicio:

   ```powershell
   docker compose up --build
   ```

   La primera vez, Docker descargará la imagen base e instalará las dependencias
   del frontend dentro de la imagen. Se necesita conexión a Internet durante
   este paso. Las siguientes ejecuciones normalmente reutilizan la imagen y las
   capas ya construidas.
4. Cuando aparezca que el servidor de desarrollo está listo, abre
   <http://localhost:3000>.
5. Para detener el servidor, presiona `Ctrl+C` en la terminal. También puedes
   iniciar en segundo plano con `docker compose up --build -d` y detenerlo con
   `docker compose down`.

Comandos útiles, ejecutados desde la raíz del repositorio:

```powershell
docker compose ps
docker compose logs -f frontend
docker compose restart frontend
docker compose down
```

Si se actualizan `package.json` o `pnpm-lock.yaml`, reconstruye la imagen para
instalar la nueva lista de dependencias:

```powershell
docker compose up --build
```

## Usarlo desde otra máquina

Hay dos escenarios distintos:

### Otra computadora en la misma red local

La computadora que ejecuta Docker será el anfitrión; la otra computadora será
el cliente.

1. Asegúrate de que ambas computadoras estén en una red local confiable (por
   ejemplo, la misma red Wi-Fi). Inicia el frontend en el anfitrión con
   `docker compose up --build`.
2. En el anfitrión, abre PowerShell y ejecuta:

   ```powershell
   ipconfig
   ```

   Busca la dirección IPv4 del adaptador conectado a esa red, por ejemplo
   `192.168.1.25`. No uses `127.0.0.1` ni `localhost` desde el cliente: esas
   direcciones apuntan a la propia computadora cliente.
3. Desde la otra computadora, abre un navegador en
   `http://DIRECCION-IP-DEL-ANFITRION:3000`, por ejemplo
   <http://192.168.1.25:3000>.
4. Si no carga, revisa que Docker siga ejecutando el servicio, que ambas
   computadoras puedan comunicarse en la red y que el firewall del anfitrión
   permita conexiones entrantes TCP al puerto 3000 en una red privada confiable.
   Las reglas del firewall deben configurarse según las políticas de esa
   computadora o institución.

La dirección IP local puede cambiar al reconectar o reiniciar el router. Si
cambia, consulta `ipconfig` de nuevo. El puerto `3000:3000` de Compose publica
el servidor en el anfitrión; el firewall de Windows y la red determinan si otros
equipos pueden alcanzarlo.

### Una máquina fuera de la red local

No se recomienda publicar directamente este servidor de desarrollo en Internet.
No es una configuración de producción ni incluye medidas como un proxy HTTPS,
gestión de acceso o endurecimiento del servidor. No abras ni reenvíes el puerto
3000 en el router para hacerlo accesible públicamente.

Para compartirlo con alguien remoto, las opciones más seguras son desplegar una
versión de producción en un servicio de hosting con HTTPS y controles adecuados,
o usar una VPN privada administrada por la organización para que ambas máquinas
se conecten a una red confiable. La publicación de producción requiere una
configuración distinta a este Compose de desarrollo.

## Preparar otra computadora

La otra computadora necesita los archivos del proyecto, incluyendo `compose.yaml`,
`FrontEnd/uglab_frontend/Dockerfile` y
`FrontEnd/uglab_frontend/.dockerignore`. La forma recomendada de obtenerlos es
clonar o actualizar el repositorio con Git; también se puede copiar el proyecto
completo respetando la estructura de carpetas. Después:

1. Instala e inicia Docker Desktop.
2. Abre una terminal en la raíz del repositorio.
3. Ejecuta `docker compose up --build`.
4. Abre <http://localhost:3000> en esa computadora.

No es necesario copiar `node_modules`; Docker instala las dependencias a partir
de `package.json` y `pnpm-lock.yaml`. Los archivos `.env` se excluyen de la
construcción. Si en el futuro se necesitan variables de entorno, deben
configurarse de forma segura en la máquina destino y no incluir secretos en Git
ni en la imagen.

## Limitaciones y solución de problemas

- **`docker` no se reconoce:** instala Docker Desktop, ábrelo y vuelve a abrir
  PowerShell para que cargue el PATH actualizado.
- **Docker no está en ejecución:** inicia Docker Desktop y espera a que el motor
  esté listo.
- **El puerto 3000 ya está ocupado:** detén la otra aplicación que lo usa o
  cambia el puerto del lado del anfitrión en `compose.yaml` (por ejemplo,
  `"3001:3000"`). En ese caso, abre `http://localhost:3001` y usa el puerto
  `3001` desde los clientes de la red.
- **No aparecen cambios en el navegador:** revisa los registros con
  `docker compose logs -f frontend` y confirma que el servicio está activo.
- **No se puede descargar o instalar paquetes:** la construcción inicial
  necesita Internet y acceso al registro de paquetes. Revisa la conexión y los
  permisos de red.
- **Se ve la interfaz, pero una función no opera:** este Compose solo inicia el
  frontend. Comprueba si esa función necesita un backend/API o el dispositivo
  ESP32, que no se han configurado en este contenedor.
