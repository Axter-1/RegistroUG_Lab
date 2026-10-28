import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.ts";
import { conexion } from "../config/database.js";

export async function requireSession(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Se requiere una sesión activa." });
    }

    const [users] = await conexion.execute(
      `SELECT u.id, u.id_rol, u.activo, r.descripcion AS role, du.id_docente
         FROM Usuario u
         LEFT JOIN Rol r ON r.id_rol = u.id_rol
         LEFT JOIN docente_usuario du ON du.user_id = u.id
        WHERE u.id = ?
        LIMIT 1`,
      [session.user.id],
    );
    
    console.log(users)

    const user = users[0];
    if (!user || !user.activo || !user.role || user.role === "Sin_rol") {
      return res.status(403).json({ error: "La cuenta no tiene acceso operativo." });
    }

    req.auth = {
      userId: user.id,
      role: user.role,
      roleId: user.id_rol,
      docenteId: user.id_docente,
      sessionId: session.session?.id,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
