import { conexion } from "../config/database.js";

export async function requireDevice(req, res, next) {
  try {
    const authorization = req.get("authorization") || "";
    const bearerToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = req.get("x-device-token") || bearerToken;

    if (!token || token.length > 4096) {
      return res.status(401).json({ error: "Se requiere un token de escáner válido." });
    }

    const [devices] = await conexion.execute(
      `SELECT id_escaner, id_laboratorio
         FROM escaner
        WHERE token_hash = SHA2(?, 256)
          AND activo = TRUE
        LIMIT 1`,
      [token],
    );

    if (!devices[0]) {
      return res.status(401).json({ error: "El token de escáner no es válido o está inactivo." });
    }

    req.device = devices[0];
    return next();
  } catch (error) {
    return next(error);
  }
}
