# UG_LABS

Sistema para gestionar el acceso a laboratorios universitarios mediante una
aplicación web, una API y un dispositivo ESP32.

## Componentes

- **Frontend:** aplicación web React para consultar accesos, agendas, reportes
  y administración.
- **Backend:** API Node.js/Express con autenticación Better Auth y base de
  datos MySQL.
- **IoT:** firmware MicroPython para escanear credenciales QR y comunicarse con
  la API.

## Inicio rápido

Se requiere Docker Desktop o Docker Compose. Copia `.env.example` a `.env`,
configura los secretos locales y, desde la raíz del repositorio, ejecuta:

```sh
docker compose --env-file .env -f docker-compose.yml -f compose.frontend.yaml up --build
```

Abre <http://localhost:3001>. La API está disponible en el puerto `3000`.
Consulta [DOCUMENTACION.md](DOCUMENTACION.md) para configuración, desarrollo y
despliegue del firmware.

## Estado

El proyecto está en desarrollo. Hay limitaciones funcionales y verificaciones
pendientes antes de usarlo en producción. El resumen de la auditoría y las
prioridades están en [HALLAZGOS.md](HALLAZGOS.md).
