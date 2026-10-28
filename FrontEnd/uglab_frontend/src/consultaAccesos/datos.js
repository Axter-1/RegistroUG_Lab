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
