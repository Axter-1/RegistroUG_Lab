<<<<<<< HEAD
import { api } from "../api/axiosClient";

export const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  "no-aplica": "No aplica",
  registrada: "Salida registrada",
  "cerrado-por-registro": "Cerrado por registro",
};

function formatoFecha(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function obtenerRangoFecha(fecha) {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(inicio);

  if (fecha === "Hoy") return { desde: formatoFecha(inicio), hasta: formatoFecha(fin) };
  if (fecha === "Ayer") {
    inicio.setDate(inicio.getDate() - 1);
    return { desde: formatoFecha(inicio), hasta: formatoFecha(inicio) };
  }
  if (fecha === "Últimos 7 días") {
    inicio.setDate(inicio.getDate() - 6);
    return { desde: formatoFecha(inicio), hasta: formatoFecha(fin) };
  }
  if (fecha === "Este mes") {
    inicio.setDate(1);
    return { desde: formatoFecha(inicio), hasta: formatoFecha(fin) };
  }
  return {};
}

export async function cargarAccesos(filtros, incluirAnulados, signal) {
  const params = {
    ...obtenerRangoFecha(filtros.fecha),
    idLaboratorio: filtros.laboratorio !== "Todos" ? filtros.laboratorio : undefined,
    idGrupo: filtros.grupo !== "Todos" ? filtros.grupo : undefined,
    idUda: filtros.uda !== "Todas" ? filtros.uda : undefined,
    nua: filtros.nua.trim() || undefined,
    incluirAnulados: incluirAnulados ? "true" : "false",
  };
  const { data } = await api.get("/api/accesos", { params, signal });
  return data;
}

export async function crearAccesoManual(registro) {
  const { data } = await api.post("/api/accesos/manual", registro);
  return data;
}

export async function editarAcceso(id, cambios) {
  const { data } = await api.patch(`/api/accesos/${id}`, cambios);
  return data;
}

export async function anularAcceso(id, justificacion) {
  const { data } = await api.post(`/api/accesos/${id}/anular`, { justificacion });
  return data;
}

export async function agregarObservacion(id, observacion) {
  const { data } = await api.post(`/api/accesos/${id}/observaciones`, { observacion });
  return data;
}
=======
import { api } from "../api/axiosClient";

/**
 * Estos datos son de ejemplo, se usaron para pruebas de interfaz.
 */

export const accesosDemo = [
  {
    nua: '123456',
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
    nua: '654321',
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
  pendiente: "Pendiente",
  "no-aplica": "No aplica",
  registrada: "Salida registrada",
  "cerrado-por-registro": "Cerrado por registro",
};

function formatoFecha(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function obtenerRangoFecha(fecha) {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(inicio);

  if (fecha === "Hoy") return { desde: formatoFecha(inicio), hasta: formatoFecha(fin) };
  if (fecha === "Ayer") {
    inicio.setDate(inicio.getDate() - 1);
    return { desde: formatoFecha(inicio), hasta: formatoFecha(inicio) };
  }
  if (fecha === "Últimos 7 días") {
    inicio.setDate(inicio.getDate() - 6);
    return { desde: formatoFecha(inicio), hasta: formatoFecha(fin) };
  }
  if (fecha === "Este mes") {
    inicio.setDate(1);
    return { desde: formatoFecha(inicio), hasta: formatoFecha(fin) };
  }
  return {};
}

export async function cargarAccesos(filtros, incluirAnulados, signal) {
  const params = {
    ...obtenerRangoFecha(filtros.fecha),
    idLaboratorio: filtros.laboratorio !== "Todos" ? filtros.laboratorio : undefined,
    idGrupo: filtros.grupo !== "Todos" ? filtros.grupo : undefined,
    idUda: filtros.uda !== "Todas" ? filtros.uda : undefined,
    nua: filtros.nua.trim() || undefined,
    incluirAnulados: incluirAnulados ? "true" : "false",
  };
  const { data } = await api.get("/api/accesos", { params, signal });
  return data;
}

export async function crearAccesoManual(registro) {
  const { data } = await api.post("/api/accesos/manual", registro);
  return data;
}

export async function editarAcceso(id, cambios) {
  const { data } = await api.patch(`/api/accesos/${id}`, cambios);
  return data;
}

export async function anularAcceso(id, justificacion) {
  const { data } = await api.post(`/api/accesos/${id}/anular`, { justificacion });
  return data;
}

export async function agregarObservacion(id, observacion) {
  const { data } = await api.post(`/api/accesos/${id}/observaciones`, { observacion });
  return data;
}
>>>>>>> a131e91dcbbfed4b2794d33f12726360cd0f4f5c
