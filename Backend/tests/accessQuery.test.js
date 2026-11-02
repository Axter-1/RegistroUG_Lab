import assert from "node:assert/strict";
import { test } from "node:test";
import { fromNodeHeaders } from "better-auth/node";

process.env.MYSQL_HOST = "127.0.0.1";
process.env.MYSQL_USER = "test";
process.env.MYSQL_NAME = "test";
process.env.BETTER_AUTH_SECRET = "unit_test_secret_that_is_at_least_32_characters";

const { parseAccessFilters } = await import("../controllers/accessController.js");
const { parseScannerInput } = await import("../controllers/scannerManagementController.js");
const { requireRoles } = await import("../middleware/roleMiddleware.js");

test("Better Auth expone el adaptador para headers de Node", () => {
  assert.equal(typeof fromNodeHeaders, "function");
});

test("no aplica filtros opcionales que no se enviaron", () => {
  assert.deepEqual(parseAccessFilters({}), {
    desde: null,
    hasta: null,
    idLaboratorio: null,
    idGrupo: null,
    nua: null,
    idUda: null,
    incluirAnulados: null,
    anulado: null,
  });
});

test("valida y normaliza filtros de acceso", () => {
  assert.deepEqual(
    parseAccessFilters({
      desde: "2026-10-01",
      hasta: "2026-10-27",
      idLaboratorio: "2",
      idGrupo: "120",
      nua: "000001",
      idUda: "1",
      incluirAnulados: "false",
    }),
    {
      desde: "2026-10-01",
      hasta: "2026-10-27",
      idLaboratorio: 2,
      idGrupo: "120",
      nua: 1,
      idUda: "1",
      incluirAnulados: false,
      anulado: null,
    },
  );
  assert.equal(parseAccessFilters({ fecha: "2026-10-27" }).desde, "2026-10-27");
  assert.equal(parseAccessFilters({ fecha: "2026-10-27" }).hasta, "2026-10-27");
});

test("rechaza rangos y fechas inválidas", () => {
  assert.throws(() => parseAccessFilters({ desde: "2026-02-30" }), /AAAA-MM-DD/);
  assert.throws(
    () => parseAccessFilters({ desde: "2026-10-28", hasta: "2026-10-27" }),
    /posterior/,
  );
});

test("permite filtrar anulados de forma explícita", () => {
  assert.equal(parseAccessFilters({ anulado: "true" }).anulado, true);
  assert.equal(parseAccessFilters({ incluirAnulados: "true" }).incluirAnulados, true);
  assert.throws(() => parseAccessFilters({ anulado: "maybe" }), /anulado debe ser true o false/);
});

test("aplica autorización por rol", () => {
  const allowedRequest = { auth: { role: "Docente" } };
  let allowedNext = false;
  requireRoles("Docente", "Encargado de laboratorio")(
    allowedRequest,
    {},
    () => {
      allowedNext = true;
    },
  );
  assert.equal(allowedNext, true);

  const deniedResponse = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  requireRoles("Encargado de laboratorio")(
    { auth: { role: "Docente" } },
    deniedResponse,
    () => assert.fail("Un docente no debe poder ejecutar una acción de encargado."),
  );
  assert.equal(deniedResponse.statusCode, 403);
  assert.match(deniedResponse.body.error, /permiso/);
});

test("valida los datos para registrar un escáner", () => {
  assert.deepEqual(parseScannerInput({ id_laboratorio: "12", nombre: "Entrada norte" }), {
    idLaboratorio: 12,
    nombre: "Entrada norte",
  });
  assert.deepEqual(parseScannerInput({ id_laboratorio: 1 }), {
    idLaboratorio: 1,
    nombre: null,
    activo: false,
  });
  assert.deepEqual(parseScannerInput({ id_laboratorio: 1, activo: true }), {
    idLaboratorio: 1,
    nombre: null,
    activo: true,
  });
  assert.match(parseScannerInput({ id_laboratorio: 0 }).error, /entero entre 1 y 255/);
  assert.match(parseScannerInput({ id_laboratorio: true }).error, /entero entre 1 y 255/);
  assert.match(parseScannerInput({ id_laboratorio: 1, nombre: 42 }).error, /debe ser texto/);
  assert.match(parseScannerInput({ id_laboratorio: 1, activo: "true" }).error, /valor booleano/);
  assert.match(
    parseScannerInput({ id_laboratorio: 1, nombre: "x".repeat(81) }).error,
    /entre 1 y 80 caracteres/,
  );
});
