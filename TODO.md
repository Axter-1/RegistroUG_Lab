# TODO

- [ ] Separar los motores de base de datos para producción. Por ahora, mantener las dos bases en el mismo servidor MySQL para evitar reconfigurar el entorno desde cero. Antes del despliegue, definir servicios independientes para cada motor, con volúmenes persistentes y credenciales propios, y planificar la migración y verificación de los datos existentes.
