const reservasDemo = [
  {
    laboratorio: 'Laboratorio 1',
    fecha: '2026-10-12',
    hora: '10:00',
    estado: 'ocupado',
    docente: 'Docente A',
    actividad: 'UDA 1',
    grupo: '1°A',
  },
  {
    laboratorio: 'Laboratorio 1',
    fecha: '2026-10-14',
    hora: '10:00',
    estado: 'ocupado',
    docente: 'Docente A',
    actividad: 'UDA 1',
    grupo: '1°A',
  },
  {
    laboratorio: 'Laboratorio 1',
    fecha: '2026-10-14',
    hora: '11:00',
    estado: 'ocupado',
    docente: 'Docente B',
    actividad: 'Práctica',
    grupo: '2°B',
  },
  {
    laboratorio: 'Laboratorio 1',
    fecha: '2026-10-15',
    hora: '12:00',
    estado: 'bloqueado',
    actividad: 'taller',
  },
  {
    laboratorio: 'Laboratorio 1',
    fecha: '2026-10-15',
    hora: '13:00',
    estado: 'bloqueado',
    actividad: 'taller',
  },
  {
    laboratorio: 'Laboratorio 1',
    fecha: '2026-10-16',
    hora: '09:00',
    estado: 'ocupado',
    docente: 'Docente C',
    actividad: 'UDA 3',
    grupo: '3°A',
  },
]

export async function cargarAgenda() {
  await new Promise((resolver) => setTimeout(resolver, 150))
  return reservasDemo.map((reserva) => ({ ...reserva }))
}
