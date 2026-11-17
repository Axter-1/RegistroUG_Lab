import { useEffect, useMemo, useState } from 'react'
import BarraLateral from '../components/BarraLateral'
import { cargarAgenda } from './datos'
import ControlesAgenda from './components/ControlesAgenda'
import FormularioAgenda from './components/FormularioAgenda'
import TablaAgenda from './components/TablaAgenda'
import './consultaAgendas.css'

const FECHA_INICIAL = new Date(2026, 9, 12)

function fechaISO(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function moverFecha(fecha, dias) {
  const siguiente = new Date(fecha)
  siguiente.setDate(siguiente.getDate() + dias)
  return siguiente
}

function inicioSemana(fecha) {
  const lunes = new Date(fecha)
  const desplazamiento = (lunes.getDay() + 6) % 7
  lunes.setDate(lunes.getDate() - desplazamiento)
  return lunes
}

function obtenerDias(fecha, modo) {
  if (modo === 'dia') return [fecha]
  const lunes = inicioSemana(fecha)
  return Array.from({ length: 5 }, (_, indice) => moverFecha(lunes, indice))
}

export default function ConsultaAgendas({ sesion = 'Docente' }) {
  const [laboratorio, setLaboratorio] = useState('Laboratorio 1')
  const [modo, setModo] = useState('semana')
  const [fecha, setFecha] = useState(FECHA_INICIAL)
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const esAdmin = sesion === 'Administrador'

  useEffect(() => {
    let vigente = true
    cargarAgenda()
      .then((datos) => vigente && setReservas(datos))
      .catch(() => vigente && setError('No se pudo cargar la agenda.'))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [])

  const dias = useMemo(() => obtenerDias(fecha, modo), [fecha, modo])

  function abrirFormulario(tipo, dia = fecha, hora = '08:00') {
    setMensaje('')
    setFormulario({
      tipo,
      laboratorio,
      fecha: fechaISO(dia),
      hora,
      docente: '',
      actividad: '',
      grupo: '',
    })
  }

  function guardarIntervalo(evento) {
    evento.preventDefault()
    const intervalo = {
      laboratorio: formulario.laboratorio,
      fecha: formulario.fecha,
      hora: formulario.hora,
      estado: formulario.tipo === 'bloqueo' ? 'bloqueado' : 'ocupado',
      docente: formulario.docente.trim(),
      actividad: formulario.actividad.trim(),
      grupo: formulario.grupo.trim(),
    }
    setReservas((actuales) => [
      ...actuales.filter(
        (reserva) =>
          reserva.laboratorio !== intervalo.laboratorio ||
          reserva.fecha !== intervalo.fecha ||
          reserva.hora !== intervalo.hora
      ),
      intervalo,
    ])
    setMensaje(formulario.tipo === 'bloqueo' ? 'Intervalo bloqueado.' : 'Reserva agregada a la agenda.')
    setFormulario(null)
  }

  return (
    <div className="agenda-disposicion">
      <BarraLateral activa="Agenda" sesion={sesion} />

      <main className="agenda-contenido">
        <header className="agenda-encabezado">
          <div>
            <p className="agenda-ceja">Laboratorios</p>
            <h1>Agenda semanal</h1>
          </div>
          <label className="agenda-laboratorio" htmlFor="agenda-laboratorio">
            <span>Laboratorio</span>
            <select
              id="agenda-laboratorio"
              value={laboratorio}
              onChange={(evento) => setLaboratorio(evento.target.value)}
            >
              <option>Laboratorio 1</option>
              <option>Laboratorio 2</option>
            </select>
          </label>
        </header>

        <ControlesAgenda
          fecha={fecha}
          modo={modo}
          onCambiarModo={setModo}
          onMover={(cantidad) => setFecha((actual) => moverFecha(actual, modo === 'semana' ? cantidad * 7 : cantidad))}
          onBloquear={esAdmin ? () => abrirFormulario('bloqueo') : undefined}
        />

        <div className="agenda-leyenda" aria-label="Estados de la agenda">
          <span><i className="agenda-punto agenda-punto--libre" /> Libre</span>
          <span><i className="agenda-punto agenda-punto--ocupado" /> Ocupado</span>
          <span><i className="agenda-punto agenda-punto--bloqueado" /> Bloqueado (motivo)</span>
        </div>

        {mensaje && <p className="agenda-mensaje" role="status">{mensaje}</p>}
        {error && <p className="agenda-error" role="alert">{error}</p>}
        {cargando ? (
          <p className="agenda-vacio" role="status">Cargando agenda…</p>
        ) : (
          <TablaAgenda
            dias={dias}
            reservas={reservas}
            laboratorio={laboratorio}
            esAdmin={esAdmin}
            onReservar={(dia, hora) => abrirFormulario('reserva', dia, hora)}
            onBloquear={(dia, hora) => abrirFormulario('bloqueo', dia, hora)}
            onSeleccionarDia={setFecha}
          />
        )}

        <p className="agenda-nota">
          Clic en «Libre +» abre el formulario con laboratorio, fecha y hora cargados.
          {esAdmin && ' Administrador: usa «Bloquear intervalo» para cerrar un horario.'}
        </p>
      </main>

      {formulario && (
        <FormularioAgenda
          valores={formulario}
          onCambiar={(campo, valor) =>
            setFormulario((actual) => ({ ...actual, [campo]: valor }))
          }
          onCancelar={() => setFormulario(null)}
          onGuardar={guardarIntervalo}
        />
      )}
    </div>
  )
}
