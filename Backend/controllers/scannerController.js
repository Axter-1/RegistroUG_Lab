import { conexion } from "../config/database.js";

export async function registerQrAccess(req, res) {
  const nua = typeof req.query.NUA === "string" ? req.query.NUA.trim() : "";
  if (!/^\d{1,8}$/.test(nua) || Number(nua) < 1 || Number(nua) > 16777215) {
    return res.status(400).json({ error: "El parámetro NUA debe ser un entero válido." });
  }

  const [resultSets] = await conexion.query("CALL registrar_acceso_qr(?, ?, ?)", [
    Number(nua),
    req.device.id_laboratorio,
    req.device.id_escaner,
  ]);
  const response = Array.isArray(resultSets?.[0]) ? resultSets[0][0] : null;
  if (!response) {
    throw new Error("El procedimiento de registro QR no devolvió el resultado esperado.");
  }

  return res.json({
    id: response.id_acceso,
    accion: response.accion,
    message: "Registro QR procesado.",
  });
}
