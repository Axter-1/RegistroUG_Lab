export default function FormularioAgenda({ valores, onCambiar, onCancelar, onGuardar }) {
  const esBloqueo = valores.tipo === 'bloqueo'
  const titulo = esBloqueo ? 'Bloquear intervalo' : 'Reservar laboratorio'

  return (
    <div className="agenda-modal-fondo">
      <section
        className="agenda-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-formulario-agenda"
      >
        <h2 id="titulo-formulario-agenda">{titulo}</h2>
        <p>Confirma el laboratorio, la fecha y la hora del intervalo.</p>
        <form onSubmit={onGuardar}>
          <div className="agenda-form-campo">
            <label htmlFor="reserva-laboratorio">Laboratorio</label>
            <select
              id="reserva-laboratorio"
              value={valores.laboratorio}
              onChange={(evento) => onCambiar('laboratorio', evento.target.value)}
            >
              <option>Laboratorio 1</option>
              <option>Laboratorio 2</option>
            </select>
          </div>
          <div className="agenda-form-fila">
            <div className="agenda-form-campo">
              <label htmlFor="reserva-fecha">Fecha</label>
              <input
                id="reserva-fecha"
                type="date"
                value={valores.fecha}
                onChange={(evento) => onCambiar('fecha', evento.target.value)}
                required
              />
            </div>
            <div className="agenda-form-campo">
              <label htmlFor="reserva-hora">Hora</label>
              <select
                id="reserva-hora"
                value={valores.hora}
                onChange={(evento) => onCambiar('hora', evento.target.value)}
              >
                {Array.from({ length: 7 }, (_, indice) => `${String(indice + 8).padStart(2, '0')}:00`).map((hora) => (
                  <option key={hora}>{hora}</option>
                ))}
              </select>
            </div>
          </div>
          {esBloqueo ? (
            <div className="agenda-form-campo">
              <label htmlFor="reserva-motivo">Motivo del bloqueo</label>
              <input
                id="reserva-motivo"
                type="text"
                value={valores.actividad}
                onChange={(evento) => onCambiar('actividad', evento.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="agenda-form-campo">
                <label htmlFor="reserva-docente">Docente</label>
                <input
                  id="reserva-docente"
                  type="text"
                  value={valores.docente}
                  onChange={(evento) => onCambiar('docente', evento.target.value)}
                  required
                />
              </div>
              <div className="agenda-form-fila">
                <div className="agenda-form-campo">
                  <label htmlFor="reserva-actividad">UDA o actividad</label>
                  <input
                    id="reserva-actividad"
                    type="text"
                    value={valores.actividad}
                    onChange={(evento) => onCambiar('actividad', evento.target.value)}
                    required
                  />
                </div>
                <div className="agenda-form-campo">
                  <label htmlFor="reserva-grupo">Grupo</label>
                  <input
                    id="reserva-grupo"
                    type="text"
                    value={valores.grupo}
                    onChange={(evento) => onCambiar('grupo', evento.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}
          <div className="agenda-form-acciones">
            <button type="button" className="agenda-boton-secundario" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="agenda-boton-primario">
              {esBloqueo ? 'Bloquear intervalo' : 'Confirmar reserva'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
