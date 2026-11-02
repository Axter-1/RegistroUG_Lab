import { createHash, randomBytes } from "node:crypto";
import { conexion } from "../config/database.js";

export function parseScannerInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const rawIdLaboratorio = body.id_laboratorio;
  if (
    (typeof rawIdLaboratorio !== "string" && typeof rawIdLaboratorio !== "number") ||
    !/^\d+$/.test(String(rawIdLaboratorio))
  ) {
    return { error: "id_laboratorio debe ser un entero entre 1 y 255." };
  }

  const idLaboratorio = Number(rawIdLaboratorio);
  if (
    !Number.isInteger(idLaboratorio) ||
    idLaboratorio < 1 ||
    idLaboratorio > 255
  ) {
    return { error: "id_laboratorio debe ser un entero entre 1 y 255." };
  }

  if (body.nombre != null && typeof body.nombre !== "string") {
    return { error: "nombre debe ser texto." };
  }

  const nombre = body.nombre == null ? null : body.nombre.trim();
  if (nombre !== null && (nombre.length < 1 || nombre.length > 80)) {
    return { error: "nombre debe tener entre 1 y 80 caracteres." };
  }

  if (body.activo !== undefined && typeof body.activo !== "boolean") {
    return { error: "activo debe ser un valor booleano." };
  }

  return { idLaboratorio, nombre, activo: body.activo ?? false };
}

export async function createScanner(req, res) {
  const input = parseScannerInput(req.body ?? {});
  if (input.error) {
    return res.status(400).json({ error: input.error });
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [result] = await conexion.execute(
    `INSERT INTO escaner (id_laboratorio, nombre, token_hash, activo)
     VALUES (?, ?, ?, ?)`,
    [input.idLaboratorio, input.nombre, tokenHash, input.activo],
  );

  return res.status(201).json({
    id_escaner: result.insertId,
    id_laboratorio: input.idLaboratorio,
    nombre: input.nombre,
    activo: input.activo,
    token,
  });
}
