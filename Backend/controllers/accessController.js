import { conexion } from "../config/database.js";

const ENCARGADO = "Encargado de laboratorio";
const DOCENTE = "Docente";

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseDate(value, fieldName) {
  if (value === undefined || value === "") return null;
  const parsedDate =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00.000Z`)
      : null;
  if (!parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) {
    throw httpError(`${fieldName} debe usar el formato AAAA-MM-DD.`);
  }
  return value;
}

function parsePositiveInteger(value, fieldName, maximum = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === "") return null;
  if (!/^\d+$/.test(String(value))) {
    throw httpError(`${fieldName} debe ser un entero positivo.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw httpError(`${fieldName} está fuera de rango.`);
  }
  return parsed;
}

function parseGroupId(value, fieldName = "id_grupo") {
  if (value === undefined || value === "") return null;
  if (!/^\d+$/.test(String(value))) {
    throw httpError(`${fieldName} debe ser un entero positivo.`);
  }
  const parsed = BigInt(value);
  if (parsed < 1n || parsed > 18446744073709551615n) {
    throw httpError(`${fieldName} está fuera de rango.`);
  }
  return String(value);
}

function buildTeacherScope(req, alias = "a") {
  if (req.auth.role !== DOCENTE) return { sql: "", params: [] };
  if (!req.auth.docenteId) {
    throw httpError("El usuario docente no tiene una asignación institucional.", 403);
  }
  return {
    sql: ` AND EXISTS (
      SELECT 1
        FROM docente_asignacion da
       WHERE da.id_docente = ?
         AND da.id_grupo = ${alias}.id_grupo
         AND da.activo = TRUE
    )`,
    params: [req.auth.docenteId],
  };
}

export function parseAccessFilters(query) {
  const fecha = parseDate(query.fecha, "fecha");
  let desde = parseDate(query.desde, "desde");
  let hasta = parseDate(query.hasta, "hasta");
  if (fecha && (desde || hasta)) {
    throw httpError("Usa fecha o el rango desde/hasta, no ambos.");
  }
  if (fecha) {
    desde = fecha;
    hasta = fecha;
  }
  if (desde && hasta && desde > hasta) {
    throw httpError("desde no puede ser posterior a hasta.");
  }

  const nua = query.nua === undefined || query.nua === "" ? null : String(query.nua).trim();
  if (nua !== null && (!/^\d{1,8}$/.test(nua) || Number(nua) < 1 || Number(nua) > 16777215)) {
    throw httpError("NUA debe ser un entero entre 1 y 16777215.");
  }

  let incluirAnulados = null;
  if (query.incluirAnulados !== undefined) {
    if (!["true", "false", "1", "0"].includes(String(query.incluirAnulados).toLowerCase())) {
      throw httpError("incluirAnulados debe ser true o false.");
    }
    incluirAnulados = ["true", "1"].includes(String(query.incluirAnulados).toLowerCase());
  }
  let anulado = null;
  if (query.anulado !== undefined) {
    if (!["true", "false", "1", "0"].includes(String(query.anulado).toLowerCase())) {
      throw httpError("anulado debe ser true o false.");
    }
    anulado = ["true", "1"].includes(String(query.anulado).toLowerCase());
  }

  return {
    desde,
    hasta,
    idLaboratorio: parsePositiveInteger(query.idLaboratorio, "idLaboratorio", 255),
    idGrupo: parseGroupId(query.idGrupo),
    nua: nua === null ? null : Number(nua),
    idUda: parseGroupId(query.idUda, "idUda"),
    incluirAnulados,
    anulado,
  };
}

function formatAccess(row) {
  const states = {
    Pendiente: "pendiente",
    "No aplica": "no-aplica",
    "Salida registrada": "registrada",
    "Cerrado por registro": "cerrado-por-registro",
  };

  return {
    id: row.id,
    nua: String(row.nua).padStart(6, "0"),
    laboratorio: `Lab. ${row.idLaboratorio}`,
    idLaboratorio: row.idLaboratorio,
    grupo: row.idGrupo === null ? null : row.nombreGrupo || `Grupo ${row.idGrupo}`,
    idGrupo: row.idGrupo,
    idUda: row.idUda,
    fecha: row.fecha,
    entrada: row.entrada,
    salida: row.salida,
    estadoSalida: states[row.estadoSalida] || "pendiente",
    uda: row.uda,
    udaRazon: row.udaRazon || row.uda || row.razon || "—",
    origen: row.origen === "Qr" ? "QR" : row.origen,
    anulado: row.anulado === true || Number(row.anulado) === 1,
    observaciones: row.observaciones || "",
    justificacionAnulacion: row.justificacionAnulacion || "",
  };
}

async function loadOptions(req) {
  const scope = buildTeacherScope(req);
  const [laboratories] = await conexion.execute(
    `SELECT id FROM (
       SELECT DISTINCT a.id_laboratorio AS id
         FROM acceso a
        WHERE a.id_laboratorio IS NOT NULL
          AND a.estado_registro = FALSE${scope.sql}
       ${req.auth.role === DOCENTE ? "" : `UNION
       SELECT DISTINCT e.id_laboratorio AS id
         FROM escaner e`}
     ) laboratorios
     ORDER BY id`,
    req.auth.role === DOCENTE ? [req.auth.docenteId] : [],
  );
  const [groups] = await conexion.execute(
    `SELECT DISTINCT g.id_grupo AS id, g.nombre
       FROM grupo g
       ${req.auth.role === DOCENTE
         ? "JOIN docente_asignacion da ON da.id_grupo = g.id_grupo AND da.activo = TRUE"
         : ""}
      WHERE g.activo = TRUE${req.auth.role === DOCENTE ? " AND da.id_docente = ?" : ""}
      ORDER BY g.nombre`,
    req.auth.role === DOCENTE ? [req.auth.docenteId] : [],
  );
  const [udas] = await conexion.execute(
    `SELECT DISTINCT u.id_uda AS id, u.nombre, u.activo
       FROM uda u
       ${req.auth.role === DOCENTE
         ? "JOIN docente_asignacion da ON da.id_uda = u.id_uda AND da.activo = TRUE"
         : ""}
      WHERE ${req.auth.role === DOCENTE ? "da.id_docente = ?" : "TRUE"}
      ORDER BY u.nombre`,
    req.auth.role === DOCENTE ? [req.auth.docenteId] : [],
  );

  return {
    laboratorios: laboratories.map(({ id }) => ({ id, nombre: `Lab. ${id}` })),
    grupos: groups.map(({ id, nombre }) => ({ id: String(id), nombre })),
    udas: udas.map(({ id, nombre, activo }) => ({
      id: String(id),
      nombre,
      activo: activo === true || Number(activo) === 1,
    })),
  };
}

export async function listAccess(req, res) {
  const filters = parseAccessFilters(req.query);
  const conditions = [];
  const params = [];
  const scope = buildTeacherScope(req);

  if (filters.anulado !== null) {
    conditions.push("a.estado_registro = ?");
    params.push(filters.anulado);
  } else if (filters.incluirAnulados === false) {
    conditions.push("a.estado_registro = FALSE");
  }
  if (filters.desde) {
    conditions.push("a.fecha >= ?");
    params.push(filters.desde);
  }
  if (filters.hasta) {
    conditions.push("a.fecha <= ?");
    params.push(filters.hasta);
  }
  if (filters.idLaboratorio !== null) {
    conditions.push("a.id_laboratorio = ?");
    params.push(filters.idLaboratorio);
  }
  if (filters.idGrupo !== null) {
    conditions.push("a.id_grupo = ?");
    params.push(filters.idGrupo);
  }
  if (filters.nua !== null) {
    conditions.push("a.nua = ?");
    params.push(filters.nua);
  }
  if (filters.idUda !== null) {
    conditions.push("a.id_uda = ?");
    params.push(filters.idUda);
  }
  if (scope.sql) {
    conditions.push(scope.sql.trim().replace(/^AND\s+/i, ""));
    params.push(...scope.params);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await conexion.execute(
    `SELECT a.id_acceso AS id,
            a.nua,
            a.id_laboratorio AS idLaboratorio,
            CAST(a.id_grupo AS CHAR) AS idGrupo,
            CAST(a.id_uda AS CHAR) AS idUda,
            g.nombre AS nombreGrupo,
            DATE_FORMAT(a.fecha, '%d/%m/%Y') AS fecha,
            DATE_FORMAT(a.hora_entrada, '%H:%i') AS entrada,
            DATE_FORMAT(a.hora_salida, '%H:%i') AS salida,
            a.estado_salida AS estadoSalida,
            u.nombre AS uda,
            COALESCE(NULLIF(u.nombre, ''), a.razon_entrada) AS udaRazon,
            a.razon_entrada AS razon,
            a.origen,
            a.estado_registro AS anulado,
            a.observaciones,
            a.justificacion_anulacion AS justificacionAnulacion
       FROM acceso a
       LEFT JOIN grupo g ON g.id_grupo = a.id_grupo
       LEFT JOIN uda u ON u.id_uda = a.id_uda
       ${whereSql}
      ORDER BY a.fecha DESC, a.hora_entrada DESC, a.id_acceso DESC`,
    params,
  );

  const opciones = await loadOptions(req);
  return res.json({
    role: req.auth.role,
    accesos: rows.map(formatAccess),
    opciones,
  });
}

export async function createManualAccess(req, res) {
  const body = req.body ?? {};
  const nua = parsePositiveInteger(body.nua, "nua", 16777215);
  const idLaboratorio = parsePositiveInteger(body.id_laboratorio, "id_laboratorio", 255);
  const idGrupo = parseGroupId(body.id_grupo);
  const uda = typeof body.uda === "string" ? body.uda.trim() : "";
  const razon =
    typeof body.razon_entrada === "string" ? body.razon_entrada.trim() : "";

  if (!nua || !idLaboratorio) {
    throw httpError("NUA y laboratorio son obligatorios.");
  }
  if (Boolean(uda) === Boolean(razon)) {
    throw httpError("Debes proporcionar exactamente una UDA o una razón.");
  }
  if (uda.length > 100 || razon.length > 100) {
    throw httpError("UDA y razón no pueden superar 100 caracteres.");
  }
  let idUda = null;
  if (idGrupo && uda) {
    const [assignments] = await conexion.execute(
      `SELECT da.id_asignacion
         FROM docente_asignacion da
         JOIN uda u ON u.id_uda = da.id_uda
        WHERE da.id_grupo = ?
          AND u.nombre = ?
          AND da.activo = TRUE
          AND u.activo = TRUE
        LIMIT 1`,
      [idGrupo, uda],
    );
    if (assignments.length === 0) {
      throw httpError("El grupo no tiene asignada la UDA seleccionada.");
    }
  }
  if (uda) {
    const [udaResult] = await conexion.execute(
      `INSERT INTO uda (nombre)
       VALUES (?)
       ON DUPLICATE KEY UPDATE id_uda = LAST_INSERT_ID(id_uda)`,
      [uda],
    );
    idUda = udaResult.insertId;
    const [activeUdas] = await conexion.execute(
      "SELECT id_uda FROM uda WHERE id_uda = ? AND activo = TRUE LIMIT 1",
      [idUda],
    );
    if (activeUdas.length === 0) {
      throw httpError("La UDA existe, pero está inactiva.");
    }
  }

  const [result] = await conexion.execute(
    `INSERT INTO acceso (
       nua, id_laboratorio, id_grupo, id_uda, razon_entrada, fecha,
       hora_entrada, estado_salida, origen, estado_registro
     ) VALUES (?, ?, ?, ?, ?, CURRENT_DATE(), CURRENT_TIME(), 'Pendiente', 'Manual', FALSE)`,
    [nua, idLaboratorio, idGrupo, idUda, razon || null],
  );

  return res.status(201).json({ id: result.insertId, message: "Acceso manual registrado." });
}

function parseAccessId(value) {
  const id = parsePositiveInteger(value, "id", 4294967295);
  if (!id) throw httpError("El identificador del acceso es obligatorio.");
  return id;
}

function isValidTime(value) {
  return (
    typeof value === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)
  );
}

export async function editAccess(req, res) {
  const body = req.body ?? {};
  const id = parseAccessId(req.params.id);
  const fields = [];
  const params = [];

  if (body.hora_entrada !== undefined) {
    if (!isValidTime(body.hora_entrada)) {
      throw httpError("hora_entrada debe usar el formato HH:MM o HH:MM:SS.");
    }
    fields.push("hora_entrada = ?");
    params.push(body.hora_entrada);
  }
  if (body.hora_salida !== undefined) {
    if (body.hora_salida !== null && !isValidTime(body.hora_salida)) {
      throw httpError("hora_salida debe usar el formato HH:MM, HH:MM:SS o null.");
    }
    fields.push("hora_salida = ?");
    params.push(body.hora_salida);
  }
  if (fields.length === 0) throw httpError("Indica al menos una hora para corregir.");

  const [result] = await conexion.execute(
    `UPDATE acceso
        SET ${fields.join(", ")}
      WHERE id_acceso = ?
        AND estado_registro = FALSE`,
    [...params, id],
  );
  if (result.affectedRows === 0) {
    const [accesses] = await conexion.execute(
      "SELECT id_acceso FROM acceso WHERE id_acceso = ? AND estado_registro = FALSE LIMIT 1",
      [id],
    );
    if (accesses.length === 0) {
      throw httpError("No se encontró un acceso activo con ese identificador.", 404);
    }
  }
  return res.json({ message: "Acceso actualizado." });
}

export async function cancelAccess(req, res) {
  const body = req.body ?? {};
  const id = parseAccessId(req.params.id);
  const justification =
    typeof body.justificacion === "string" ? body.justificacion.trim() : "";
  if (!justification || justification.length > 1000) {
    throw httpError("La justificación es obligatoria y no puede superar 1000 caracteres.");
  }

  const [result] = await conexion.execute(
    `UPDATE acceso
        SET estado_registro = TRUE,
            justificacion_anulacion = ?,
            anulado_por = ?,
            anulado_en = CURRENT_TIMESTAMP
      WHERE id_acceso = ?
        AND estado_registro = FALSE`,
    [justification, req.auth.userId, id],
  );
  if (result.affectedRows === 0) {
    throw httpError("No se encontró un acceso activo con ese identificador.", 404);
  }
  return res.json({ message: "Acceso anulado." });
}

export async function addObservation(req, res) {
  const body = req.body ?? {};
  const id = parseAccessId(req.params.id);
  const observation =
    typeof body.observacion === "string" ? body.observacion.trim() : "";
  if (!observation || observation.length > 5000) {
    throw httpError("La observación es obligatoria y no puede superar 5000 caracteres.");
  }

  const scope = buildTeacherScope(req);
  const [result] = await conexion.execute(
    `UPDATE acceso a
        SET observaciones = CONCAT_WS('\n', NULLIF(a.observaciones, ''), ?)
      WHERE a.id_acceso = ?${scope.sql}`,
    [observation, id, ...scope.params],
  );
  if (result.affectedRows === 0) {
    throw httpError("No se encontró un acceso disponible para agregar la observación.", 404);
  }
  return res.json({ message: "Observación añadida." });
}
