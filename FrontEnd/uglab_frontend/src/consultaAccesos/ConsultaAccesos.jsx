import { useEffect, useState } from "react";
import BarraLateral from "./components/BarraLateral";
import Filtros from "./components/Filtros";
import TablaAccesos from "./components/TablaAccesos";
import {
  agregarObservacion,
  anularAcceso,
  cargarAccesos,
  crearAccesoManual,
  editarAcceso,
} from "./datos";
import { authClient } from "../lib/auth-client.ts";
import "./consultaAccesos.css";

const FILTROS_INICIALES = {
  fecha: "Todas",
  laboratorio: "Todos",
  grupo: "Todos",
  uda: "Todas",
  nua: "",
};

const OPCIONES_INICIALES = { laboratorios: [], grupos: [], udas: [] };
const ENCARGADO = "Encargado de laboratorio";

function errorDeApi(error) {
  return error.response?.data?.error || "No se pudo completar la solicitud.";
}

export default function ConsultaAccesos() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [vista, setVista] = useState("consolidada");
  const [incluirAnulados, setIncluirAnulados] = useState(false);
  const [mostrarRegistroManual, setMostrarRegistroManual] = useState(false);
  const [registroManual, setRegistroManual] = useState({
    nua: "",
    laboratorio: "",
    grupo: "",
    tipoContenido: "uda",
    contenido: "",
  });
  const [accesos, setAccesos] = useState([]);
  const [opciones, setOpciones] = useState(OPCIONES_INICIALES);
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [accion, setAccion] = useState(null);
  const [valorAccion, setValorAccion] = useState("");
  const [horas, setHoras] = useState({ hora_entrada: "", hora_salida: "" });
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setCargando(true);
      setError("");
      cargarAccesos(filtros, incluirAnulados, controller.signal)
        .then((resultado) => {
          setAccesos(resultado.accesos);
          setOpciones(resultado.opciones);
          setRol(resultado.role);
        })
        .catch((requestError) => {
          if (requestError.code !== "ERR_CANCELED") {
            setAccesos([]);
            setOpciones(OPCIONES_INICIALES);
            setRol("");
            setError(errorDeApi(requestError));
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setCargando(false);
        });
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [filtros, incluirAnulados, recarga]);

  function cambiarFiltro(id, valor) {
    setFiltros((previos) => ({ ...previos, [id]: valor }));
  }

  function manejarAccion(tipo, fila) {
    setError("");
    setMensaje("");
    setAccion({ tipo, fila });
    setValorAccion("");
    setHoras({
      hora_entrada: fila.entrada || "",
      hora_salida: fila.salida || "",
    });
  }

  async function enviarAccion(evento) {
    evento.preventDefault();
    if (!accion) return;

    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      if (accion.tipo === "obs") {
        await agregarObservacion(accion.fila.id, valorAccion);
        setMensaje("Observación añadida.");
      } else if (accion.tipo === "anular") {
        await anularAcceso(accion.fila.id, valorAccion);
        setMensaje("Acceso anulado.");
      } else {
        const cambios = {};
        if (horas.hora_entrada !== accion.fila.entrada) {
          cambios.hora_entrada = horas.hora_entrada;
        }
        if ((horas.hora_salida || null) !== (accion.fila.salida || null)) {
          cambios.hora_salida = horas.hora_salida || null;
        }
        if (Object.keys(cambios).length === 0) {
          setError("Modifica al menos una hora antes de guardar.");
          return;
        }
        await editarAcceso(accion.fila.id, cambios);
        setMensaje("Horario actualizado.");
      }
      setAccion(null);
      setRecarga((actual) => actual + 1);
    } catch (requestError) {
      setError(errorDeApi(requestError));
    } finally {
      setGuardando(false);
    }
  }

  async function registrarEntrada(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const registro = {
        nua: registroManual.nua.trim(),
        id_laboratorio: registroManual.laboratorio,
        id_grupo: registroManual.grupo || undefined,
        [registroManual.tipoContenido === "uda" ? "uda" : "razon_entrada"]:
          registroManual.contenido.trim(),
      };
      await crearAccesoManual(registro);
      setRegistroManual({
        nua: "",
        laboratorio: "",
        grupo: "",
        tipoContenido: "uda",
        contenido: "",
      });
      setMostrarRegistroManual(false);
      setMensaje("Entrada manual registrada.");
      setRecarga((actual) => actual + 1);
    } catch (requestError) {
      setError(errorDeApi(requestError));
    } finally {
      setGuardando(false);
    }
  }

  async function cerrarSesion() {
    try {
      await authClient.signOut();
      window.location.assign("/");
    } catch (requestError) {
      setError(errorDeApi(requestError));
    }
  }

  const esEncargado = rol === ENCARGADO;

  return (
    <div className="disposicion">
      <BarraLateral activa="Accesos" sesion={rol || "Verificando"} onSalir={cerrarSesion} />

      <main className="contenido">
        <header className="encabezado">
          <h1>Consulta de accesos</h1>
          {esEncargado && (
            <button
              type="button"
              className="boton-primario"
              onClick={() => {
                setError("");
                setMensaje("");
                setMostrarRegistroManual(true);
              }}
            >
              + Registrar entrada manual
            </button>
          )}
        </header>

        {mostrarRegistroManual && (
          <div className="modal-fondo">
            <section
              className="modal-registro"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-registro-manual"
            >
              <h2 id="titulo-registro-manual">Registrar entrada manual</h2>
              <p>Fecha, hora de entrada, estado y origen se asignan automáticamente.</p>
              <form className="formulario-manual" onSubmit={registrarEntrada}>
                <div className="registro-manual__campo">
                  <label htmlFor="registro-nua">NUA</label>
                  <input
                    id="registro-nua"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{1,8}"
                    title="Escribe el NUA usando solo números."
                    value={registroManual.nua}
                    onChange={(evento) =>
                      setRegistroManual((actual) => ({ ...actual, nua: evento.target.value }))
                    }
                    required
                    autoFocus
                  />
                </div>
                <div className="registro-manual__campo">
                  <label htmlFor="registro-laboratorio">Laboratorio</label>
                  <select
                    id="registro-laboratorio"
                    value={registroManual.laboratorio}
                    onChange={(evento) =>
                      setRegistroManual((actual) => ({
                        ...actual,
                        laboratorio: evento.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Selecciona un laboratorio</option>
                    {opciones.laboratorios.map((laboratorio) => (
                      <option key={laboratorio.id} value={laboratorio.id}>
                        {laboratorio.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="registro-manual__campo">
                  <label htmlFor="registro-grupo">Grupo (opcional)</label>
                  <select
                    id="registro-grupo"
                    value={registroManual.grupo}
                    onChange={(evento) =>
                      setRegistroManual((actual) => ({ ...actual, grupo: evento.target.value }))
                    }
                  >
                    <option value="">Sin grupo</option>
                    {opciones.grupos.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="registro-manual__campo">
                  <label htmlFor="registro-tipo-contenido">UDA o razón</label>
                  <select
                    id="registro-tipo-contenido"
                    value={registroManual.tipoContenido}
                    onChange={(evento) =>
                      setRegistroManual((actual) => ({
                        ...actual,
                        tipoContenido: evento.target.value,
                        contenido: "",
                      }))
                    }
                  >
                    <option value="uda">UDA</option>
                    <option value="razon">Razón</option>
                  </select>
                </div>
                <div className="registro-manual__campo">
                  <label htmlFor="registro-contenido">
                    {registroManual.tipoContenido === "uda" ? "UDA" : "Razón"}
                  </label>
                  {registroManual.tipoContenido === "uda" ? (
                    <input
                      id="registro-contenido"
                      type="text"
                      maxLength={100}
                      list="registro-opciones-uda"
                      value={registroManual.contenido}
                      onChange={(evento) =>
                        setRegistroManual((actual) => ({
                          ...actual,
                          contenido: evento.target.value,
                        }))
                      }
                      required
                    />
                  ) : (
                    <input
                      id="registro-contenido"
                      type="text"
                      maxLength={100}
                      value={registroManual.contenido}
                      onChange={(evento) =>
                        setRegistroManual((actual) => ({
                          ...actual,
                          contenido: evento.target.value,
                        }))
                      }
                      required
                    />
                  )}
                  {registroManual.tipoContenido === "uda" && (
                    <datalist id="registro-opciones-uda">
                      {opciones.udas.filter((uda) => uda.activo).map((uda) => (
                        <option key={uda.id} value={uda.nombre} />
                      ))}
                    </datalist>
                  )}
                </div>
                <div className="registro-manual__acciones">
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => setMostrarRegistroManual(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton-primario" disabled={guardando}>
                    {guardando ? "Registrando…" : "Registrar entrada"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {accion && (
          <div className="modal-fondo">
            <section
              className="modal-registro"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-accion"
            >
              <h2 id="titulo-accion">
                {accion.tipo === "obs"
                  ? "Añadir observación"
                  : accion.tipo === "anular"
                    ? "Anular acceso"
                    : "Corregir horario"}
              </h2>
              <p>NUA {accion.fila.nua} · {accion.fila.fecha} · {accion.fila.laboratorio}</p>
              <form className="formulario-manual" onSubmit={enviarAccion}>
                {accion.tipo === "hora" ? (
                  <>
                    <div className="registro-manual__campo">
                      <label htmlFor="hora-entrada">Hora entrada</label>
                      <input
                        id="hora-entrada"
                        type="time"
                        value={horas.hora_entrada}
                        onChange={(evento) =>
                          setHoras((actual) => ({
                            ...actual,
                            hora_entrada: evento.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="registro-manual__campo">
                      <label htmlFor="hora-salida">Hora salida (opcional)</label>
                      <input
                        id="hora-salida"
                        type="time"
                        value={horas.hora_salida}
                        onChange={(evento) =>
                          setHoras((actual) => ({
                            ...actual,
                            hora_salida: evento.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="registro-manual__campo">
                    <label htmlFor="valor-accion">
                      {accion.tipo === "obs" ? "Observación" : "Justificación obligatoria"}
                    </label>
                    <textarea
                      id="valor-accion"
                      rows="4"
                      maxLength={accion.tipo === "obs" ? 5000 : 1000}
                      value={valorAccion}
                      onChange={(evento) => setValorAccion(evento.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="registro-manual__acciones">
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => setAccion(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton-primario" disabled={guardando}>
                    {guardando ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {mensaje && <p className="mensaje-exito" role="status">{mensaje}</p>}
        <Filtros valores={filtros} opciones={opciones} onCambiar={cambiarFiltro} />

        <div className="barra-vista">
          <div className="grupo-chips" role="group" aria-label="Vista">
            <button
              type="button"
              className={`chip ${vista === "consolidada" ? "is-activo" : ""}`}
              aria-pressed={vista === "consolidada"}
              onClick={() => setVista("consolidada")}
            >
              Vista: Consolidada
            </button>
            <button
              type="button"
              className={`chip ${vista === "detalle" ? "is-activo" : ""}`}
              aria-pressed={vista === "detalle"}
              onClick={() => setVista("detalle")}
            >
              Detalle (todas las entradas)
            </button>
          </div>

          <label className="casilla">
            <input
              type="checkbox"
              checked={incluirAnulados}
              onChange={(evento) => setIncluirAnulados(evento.target.checked)}
            />
            Incluir anulados
          </label>

          <span className="conteo" aria-live="polite">
            {cargando
              ? "Cargando…"
              : `${accesos.length} ${accesos.length === 1 ? "asistencia" : "asistencias"}`}
          </span>
        </div>

        {error && <p className="vacio" role="alert">{error}</p>}
        {cargando ? (
          <p className="vacio">Cargando accesos…</p>
        ) : (
          <TablaAccesos filas={accesos} esAdmin={esEncargado} onAccion={manejarAccion} />
        )}

        <p className="nota">
          Docente: solo consulta grupos asignados y puede añadir observaciones. El encargado de
          laboratorio puede corregir horarios y anular accesos con justificación.
        </p>
      </main>
    </div>
  );
}
