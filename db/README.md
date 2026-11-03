# Esquema de la base de datos

`db.sql` define el esquema inicial de la aplicación, incluidos los dispositivos
escáner y el procedimiento `registrar_acceso_qr`. En
`docker-compose.yml`, MySQL lo ejecuta al inicializar un volumen de datos vacío.

Los scripts de `/docker-entrypoint-initdb.d` solo se ejecutan cuando MySQL crea
su directorio de datos por primera vez. Si el esquema cambia después de crear
el volumen, aplica una migración compatible con los datos existentes; no borres
el volumen para actualizar una base que contenga información que quieras
conservar.

Para reconstruir únicamente la base local desde cero, confirma primero que
puedes perder todos sus datos y ejecuta:

```sh
docker compose -f docker-compose.yml down
docker volume rm proyecto_registro_mysql_data
docker compose -f docker-compose.yml up --build
```

La API usa `MYSQL_USER` y `MYSQL_PASSWORD` para conectarse. Deben coincidir con
las credenciales configuradas para el servicio `db`.
