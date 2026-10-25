import { useEffect, useMemo, useState } from 'react'
import BarraLateral from './components/BarraLateral'
import Filtros from './components/Filtros'
import TablaAccesos from './components/TablaAccesos'
import { cargarAccesos } from './datos'
import './consultaAccesos.css'

const FILTROS_INICIALES = {
  fecha: 'Hoy',
  laboratorio: 'Todos',
  grupo: 'Todos',
  uda: 'Todas',
  nua: '',
}

/** Filtrado en cliente. Si filtras en el servidor, borra esto y manda
 *  `filtros` como query params en cargarAccesos(). */
function aplicarFiltros(filas, filtros, incluirAnulados) {
  const busqueda = filtros.nua.trim().toLowerCase()

  return filas.filter((fila) => {
    if (!incluirAnulados && fila.anulado) return false
    if (filtros.laboratorio !== 'Todos' && fila.laboratorio !== filtros.laboratorio) return false
    if (filtros.grupo !== 'Todos' && fila.grupo !== filtros.grupo) return false
    if (filtros.uda !== 'Todas' && fila.uda !== filtros.uda) return false
    if (busqueda && !fila.nua.toLowerCase().includes(busqueda)) return false
    return true
  })
}

export default function ConsultaAccesos() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [vista, setVista] = useState('consolidada')
  const [incluirAnulados, setIncluirAnulados] = useState(false)
  const [mostrarRegistroManual, setMostrarRegistroManual] = useState(false)
  const [registroManual, setRegistroManual] = useState({ nua: '', laboratorio: '', udaRazon: '' })
  const [accesos, setAccesos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let vigente = true
    cargarAccesos()
      .then((datos) => vigente && setAccesos((actuales) => [...actuales, ...datos]))
      .catch(() => vigente && setError('No se pudieron cargar los accesos.'))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [])

  const filas = useMemo(
    () => aplicarFiltros(accesos, filtros, incluirAnulados),
    [accesos, filtros, incluirAnulados]
  )

  function cambiarFiltro(id, valor) {
    setFiltros((previos) => ({ ...previos, [id]: valor }))
  }

  function registrarEntrada(evento) {
    evento.preventDefault()
    const ahora = new Date()
    const fecha = [
      String(ahora.getDate()).padStart(2, '0'),
      String(ahora.getMonth() + 1).padStart(2, '0'),
      ahora.getFullYear(),
    ].join('/')
    const entrada = [
      String(ahora.getHours()).padStart(2, '0'),
      String(ahora.getMinutes()).padStart(2, '0'),
    ].join(':')
    const uda = /^UDA(?:\s|$)/i.test(registroManual.udaRazon.trim())
      ? registroManual.udaRazon.trim()
      : null

    setAccesos((actuales) => [
      {
        nua: registroManual.nua.trim(),
        laboratorio: registroManual.laboratorio,
        fecha,
        entrada,
        salida: null,
        estadoSalida: 'no-aplica',
        udaRazon: registroManual.udaRazon.trim(),
        grupo: null,
        uda,
        origen: 'Manual',
        anulado: false,
      },
      ...actuales,
    ])
    setRegistroManual({ nua: '', laboratorio: '', udaRazon: '' })
    setMostrarRegistroManual(false)
    setMensaje('Entrada manual añadida a la lista.')
  }

  function manejarAccion(tipo, fila) {
    // Engancha aquí tus modales / llamadas a la API.
    console.log(tipo, fila)
  }

  return (
    <div className="disposicion">
      <BarraLateral activa="Accesos" />

      <main className="contenido">
        <header className="encabezado">
          <h1>Consulta de accesos</h1>
          <button
            type="button"
            className="boton-primario"
            onClick={() => {
              setMensaje('')
              setMostrarRegistroManual(true)
            }}
          >
            + Registrar entrada manual
          </button>
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
              <p>La fecha, la hora de entrada y el origen se asignarán automáticamente.</p>
              <form className="formulario-manual" onSubmit={registrarEntrada}>
                <div className="registro-manual__campo">
                  <label htmlFor="registro-nua">NUA</label>
                  <input
                    id="registro-nua"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+"
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
                    <option value="Lab. 1">Lab. 1</option>
                    <option value="Lab. 2">Lab. 2</option>
                  </select>
                </div>
                <div className="registro-manual__campo">
                  <label htmlFor="registro-uda-razon">UDA o razón</label>
                  <input
                    id="registro-uda-razon"
                    type="text"
                    maxLength={120}
                    value={registroManual.udaRazon}
                    onChange={(evento) =>
                      setRegistroManual((actual) => ({
                        ...actual,
                        udaRazon: evento.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="registro-manual__acciones">
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => setMostrarRegistroManual(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton-primario">
                    Registrar entrada
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {mensaje && <p className="mensaje-exito" role="status">{mensaje}</p>}
        <Filtros valores={filtros} onCambiar={cambiarFiltro} />

        <div className="barra-vista">
          <div className="grupo-chips" role="group" aria-label="Vista">
            <button
              type="button"
              className={`chip ${vista === 'consolidada' ? 'is-activo' : ''}`}
              aria-pressed={vista === 'consolidada'}
              onClick={() => setVista('consolidada')}
            >
              Vista: Consolidada
            </button>
            <button
              type="button"
              className={`chip ${vista === 'detalle' ? 'is-activo' : ''}`}
              aria-pressed={vista === 'detalle'}
              onClick={() => setVista('detalle')}
            >
              Detalle (todas las entradas)
            </button>
          </div>

          <label className="casilla">
            <input
              type="checkbox"
              checked={incluirAnulados}
              onChange={(e) => setIncluirAnulados(e.target.checked)}
            />
            Incluir anulados
          </label>

          <span className="conteo" aria-live="polite">
            {cargando
              ? 'Cargando…'
              : `${filas.length} ${filas.length === 1 ? 'asistencia' : 'asistencias'}`}
          </span>
        </div>

        {error && <p className="vacio" role="alert">{error}</p>}
        {cargando ? (
          <p className="vacio">Cargando accesos…</p>
        ) : (
          <TablaAccesos filas={filas} esAdmin onAccion={manejarAccion} />
        )}

        <p className="nota">
          Docente: solo ve accesos de sus grupos y edita observaciones. Corregir hora y anular (con
          justificación obligatoria) solo lo hace el administrador. Cada cambio queda en el
          historial.
        </p>
      </main>
    </div>
  )
}
