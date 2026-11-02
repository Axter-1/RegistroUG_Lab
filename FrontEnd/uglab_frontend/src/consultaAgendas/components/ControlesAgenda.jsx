const FORMATO_RANGO = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function inicioSemana(fecha) {
  const lunes = new Date(fecha)
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7))
  return lunes
}

function textoRango(fecha, modo) {
  if (modo === 'dia') {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(fecha)
  }

  const lunes = inicioSemana(fecha)
  const viernes = new Date(lunes)
  viernes.setDate(viernes.getDate() + 4)
  if (lunes.getMonth() === viernes.getMonth() && lunes.getFullYear() === viernes.getFullYear()) {
    return `${FORMATO_RANGO.format(lunes).slice(0, 2)} – ${FORMATO_RANGO.format(viernes)}`
  }
  return `${FORMATO_RANGO.format(lunes)} – ${FORMATO_RANGO.format(viernes)}`
}

export default function ControlesAgenda({
  fecha,
  modo,
  onCambiarModo,
  onMover,
  onBloquear,
}) {
  return (
    <div className="agenda-controles">
      <div className="agenda-segmento" role="group" aria-label="Vista de agenda">
        <button
          type="button"
          className={modo === 'semana' ? 'is-activo' : ''}
          aria-pressed={modo === 'semana'}
          onClick={() => onCambiarModo('semana')}
        >
          Semana
        </button>
        <button
          type="button"
          className={modo === 'dia' ? 'is-activo' : ''}
          aria-pressed={modo === 'dia'}
          onClick={() => onCambiarModo('dia')}
        >
          Día
        </button>
      </div>

      <div className="agenda-navegacion">
        <button type="button" aria-label="Periodo anterior" onClick={() => onMover(-1)}>
          ‹
        </button>
        <span aria-live="polite">
          {textoRango(fecha, modo)}
        </span>
        <button type="button" aria-label="Periodo siguiente" onClick={() => onMover(1)}>
          ›
        </button>
      </div>

      {onBloquear && (
        <button type="button" className="agenda-boton-bloqueo" onClick={onBloquear}>
          Bloquear intervalo
        </button>
      )}
    </div>
  )
}
