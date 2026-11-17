const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00']

function fechaISO(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function etiquetaDia(fecha) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
  }).format(fecha)
}

function buscarReserva(reservas, laboratorio, fecha, hora) {
  return reservas.find(
    (reserva) =>
      reserva.laboratorio === laboratorio &&
      reserva.fecha === fecha &&
      reserva.hora === hora
  )
}

function CeldaAgenda({ reserva, dia, hora, esAdmin, onReservar, onBloquear }) {
  if (!reserva) {
    return (
      <td className="agenda-celda agenda-celda--libre">
        <button
          type="button"
          className="agenda-slot agenda-slot--libre"
          aria-label={`Libre, reservar ${etiquetaDia(dia)} a las ${hora}`}
          onClick={() => onReservar(dia, hora)}
        >
          Libre <span aria-hidden="true">+</span>
        </button>
      </td>
    )
  }

  if (reserva.estado === 'bloqueado') {
    return (
      <td className="agenda-celda agenda-celda--bloqueada">
        <span className="agenda-slot agenda-slot--bloqueado">
          Bloqueado: {reserva.actividad || 'sin motivo'}
        </span>
      </td>
    )
  }

  return (
    <td className="agenda-celda agenda-celda--ocupada">
      <span className="agenda-slot agenda-slot--ocupado">
        <strong>Ocupado</strong>
        <span>{[reserva.docente, reserva.actividad, reserva.grupo].filter(Boolean).join(' · ')}</span>
      </span>
      {esAdmin && (
        <button
          type="button"
          className="agenda-bloquear-celda"
          aria-label={`Bloquear ${etiquetaDia(dia)} a las ${hora}`}
          onClick={() => onBloquear(dia, hora)}
        >
          Bloquear
        </button>
      )}
    </td>
  )
}

export default function TablaAgenda({
  dias,
  reservas,
  laboratorio,
  esAdmin,
  onReservar,
  onBloquear,
  onSeleccionarDia,
}) {
  return (
    <div className="agenda-tabla-envoltorio">
      <table className="agenda-tabla">
        <caption className="sr-only">Disponibilidad semanal del laboratorio</caption>
        <thead>
          <tr>
            <th scope="col" className="agenda-columna-hora">Hora</th>
            {dias.map((dia) => (
              <th scope="col" key={fechaISO(dia)}>
                <button
                  type="button"
                  className="agenda-dia"
                  aria-label={`Ver el día ${etiquetaDia(dia)}`}
                  onClick={() => onSeleccionarDia(dia)}
                >
                  {etiquetaDia(dia)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HORAS.map((hora) => (
            <tr key={hora}>
              <th scope="row" className="agenda-hora">{hora}</th>
              {dias.map((dia) => (
                <CeldaAgenda
                  key={`${fechaISO(dia)}-${hora}`}
                  reserva={buscarReserva(reservas, laboratorio, fechaISO(dia), hora)}
                  dia={dia}
                  hora={hora}
                  esAdmin={esAdmin}
                  onReservar={onReservar}
                  onBloquear={onBloquear}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
