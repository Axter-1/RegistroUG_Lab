/**
 * Estos datos son de ejemplo, se usaron para pruebas de interfaz.
 */

export const accesosDemo = [
  {
    nua: '000001',
    laboratorio: 'Lab. 1',
    fecha: '15/10/2026',
    entrada: '10:02',
    salida: null,
    estadoSalida: 'no-aplica',
    udaRazon: 'UDA 1 · 1°A',
    grupo: '1°A',
    uda: 'UDA 1',
    origen: 'QR',
    anulado: false,
  },
  {
    nua: '000002',
    laboratorio: 'Lab. 1',
    fecha: '15/10/2026',
    entrada: '10:05',
    salida: null,
    estadoSalida: 'no-aplica',
    udaRazon: 'Sin reserva vigente',
    grupo: null,
    uda: null,
    origen: 'QR',
    anulado: false,
  },
  {
    nua: '000003',
    laboratorio: 'Lab. 2',
    fecha: '15/10/2026',
    entrada: '11:00',
    salida: '11:48',
    estadoSalida: 'registrada',
    udaRazon: 'UDA 2 · 2°B',
    grupo: '2°B',
    uda: 'UDA 2',
    origen: 'Manual',
    anulado: false,
  },
  {
    nua: '000004',
    laboratorio: 'Lab. 2',
    fecha: '15/10/2026',
    entrada: '11:03',
    salida: null,
    estadoSalida: 'cerrada-por-nuevo',
    udaRazon: 'Proyecto',
    grupo: null,
    uda: null,
    origen: 'QR',
    anulado: false,
  },
  // Registro anulado — oculto salvo que marques "Incluir anulados".
  {
    nua: '000005',
    laboratorio: 'Lab. 1',
    fecha: '15/10/2026',
    entrada: '09:40',
    salida: null,
    estadoSalida: 'no-aplica',
    udaRazon: 'Registro duplicado',
    grupo: '1°A',
    uda: 'UDA 1',
    origen: 'Manual',
    anulado: true,
  },
]

export const ETIQUETAS_ESTADO = {
  'no-aplica': 'No aplica',
  registrada: 'Salida registrada',
  'cerrada-por-nuevo': 'Cerrada por nuevo registro',
}

/**
 * Punto único de entrada de datos. Sustituye el cuerpo por:
 *
 *   const res = await fetch(`/api/accesos?${new URLSearchParams(filtros)}`)
 *   if (!res.ok) throw new Error('No se pudieron cargar los accesos')
 *   return res.json()
 *
 * Si filtras en el servidor, quita también `aplicarFiltros` de ConsultaAccesos.
 */
export async function cargarAccesos() {
  await new Promise((r) => setTimeout(r, 300)) // latencia simulada
  return accesosDemo
}
