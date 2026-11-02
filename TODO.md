# TODO

- [ ] Separar los motores de base de datos para producción. Por ahora, mantener las dos bases en el mismo servidor MySQL para evitar reconfigurar el entorno desde cero. Antes del despliegue, definir servicios independientes para cada motor, con volúmenes persistentes y credenciales propios, y planificar la migración y verificación de los datos existentes.
- [ ] Al registrar un acceso QR o manual, asociar automáticamente la UDA o razón y el grupo a la reserva vigente que coincida con el laboratorio y la hora. Definir primero el modelo/endpoint de reservas y la regla para reservas solapadas.
