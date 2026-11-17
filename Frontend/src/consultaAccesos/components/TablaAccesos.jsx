import { ETIQUETAS_ESTADO } from '../datos'

const COLUMNAS = [
  'NUA',
  'Laboratorio',
  'Fecha',
  'Hora entrada',
  'Hora salida',
  'Estado de salida',
  'UDA o Razón',
  'Origen del registro',
  'Acciones',
]

/**
 * @param {boolean} esAdmin  El docente solo añade observaciones; corregir hora
 *                           y anular son acciones del encargado de laboratorio.
 */
export default function TablaAccesos({ filas, esAdmin = true, onAccion }) {
  if (filas.length === 0) {
    return <p className="vacio">No hay accesos que coincidan con los filtros.</p>
  }

  return (
    <div className="tabla-envoltorio">
      <table className="tabla">
        <caption className="sr-only">
          Accesos registrados según los filtros seleccionados
        </caption>
        <thead>
          <tr>
            {COLUMNAS.map((columna) => (
              <th key={columna} scope="col">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indice) => (
            <tr
              key={fila.id ?? `${fila.nua}-${fila.fecha}-${fila.entrada}-${fila.laboratorio}-${indice}`}
              className={fila.anulado ? 'fila--anulada' : undefined}
            >

              <td className="celda-nua">{fila.nua}</td>
              <td>{fila.laboratorio}</td>
              <td>{fila.fecha}</td>
              <td className="celda-hora">{fila.entrada}</td>
              <td className="celda-hora">{fila.salida ?? '—'}</td>
              <td>
                <span className={`estado estado--${fila.estadoSalida}`}>
                  {ETIQUETAS_ESTADO[fila.estadoSalida] ?? fila.estadoSalida}
                </span>
              </td>
              <td>{fila.udaRazon || '—'}</td>
              <td>
                <span className={`origen origen--${(fila.origen || '').toLowerCase()}`}>{fila.origen || '—'}</span>
              </td>
              <td className="celda-acciones">
                <button type="button" className="accion" onClick={() => onAccion?.('obs', fila)}>
                  Obs.
                </button>
                <span aria-hidden="true"> · </span>
                <button
                  type="button"
                  className="accion"
                  disabled={!esAdmin}
                  title={esAdmin ? undefined : 'Solo el encargado puede corregir la hora'}
                  onClick={() => onAccion?.('hora', fila)}
                >
                  Hora
                </button>
                <span aria-hidden="true"> · </span>
                <button
                  type="button"
                  className="accion accion--anular"
                  disabled={!esAdmin || fila.anulado}
                  title={esAdmin ? undefined : 'Solo el encargado puede anular'}
                  onClick={() => onAccion?.('anular', fila)}
                >
                  Anular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
