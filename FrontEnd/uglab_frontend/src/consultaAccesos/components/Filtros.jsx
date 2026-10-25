const CAMPOS_SELECT = [
  { id: 'fecha', etiqueta: 'Fecha / rango', opciones: ['Hoy', 'Ayer', 'Últimos 7 días', 'Este mes'] },
  { id: 'laboratorio', etiqueta: 'Laboratorio', opciones: ['Todos', 'Lab. 1', 'Lab. 2'] },
  { id: 'grupo', etiqueta: 'Grupo', opciones: ['Todos', '1°A', '2°B'] },
  { id: 'uda', etiqueta: 'UDA', opciones: ['Todas', 'UDA 1', 'UDA 2'] },
]

export default function Filtros({ valores, onCambiar }) {
  return (
    <div className="filtros">
      {CAMPOS_SELECT.map(({ id, etiqueta, opciones }) => (
        <div className="filtro" key={id}>
          <label htmlFor={`filtro-${id}`}>{etiqueta}</label>
          <select
            id={`filtro-${id}`}
            value={valores[id]}
            onChange={(e) => onCambiar(id, e.target.value)}
          >
            {opciones.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="filtro filtro--ancho">
        <label htmlFor="filtro-nua">NUA</label>
        <input
          id="filtro-nua"
          type="search"
          placeholder="Buscar por NUA…"
          value={valores.nua}
          onChange={(e) => onCambiar('nua', e.target.value)}
        />
      </div>
    </div>
  )
}
