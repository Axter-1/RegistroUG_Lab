const CAMPOS_FECHA = ['Todas', 'Hoy', 'Ayer', 'Últimos 7 días', 'Este mes']

export default function Filtros({ valores, opciones, onCambiar }) {
  const campos = [
    { id: 'laboratorio', etiqueta: 'Laboratorio', todas: 'Todos', opciones: opciones.laboratorios },
    { id: 'grupo', etiqueta: 'Grupo', todas: 'Todos', opciones: opciones.grupos },
    { id: 'uda', etiqueta: 'UDA', todas: 'Todas', opciones: opciones.udas },
  ]

  return (
    <div className="filtros">
      <div className="filtro">
        <label htmlFor="filtro-fecha">Fecha / rango</label>
        <select
          id="filtro-fecha"
          value={valores.fecha}
          onChange={(e) => onCambiar('fecha', e.target.value)}
        >
          {CAMPOS_FECHA.map((opcion) => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </div>

      {campos.map(({ id, etiqueta, todas, opciones: valoresOpciones }) => (
        <div className="filtro" key={id}>
          <label htmlFor={`filtro-${id}`}>{etiqueta}</label>
          <select
            id={`filtro-${id}`}
            value={valores[id]}
            onChange={(e) => onCambiar(id, e.target.value)}
          >
            <option value={todas}>{todas}</option>
            {valoresOpciones.map((opcion) => (
              <option key={opcion.id ?? opcion} value={opcion.id ?? opcion}>
                {opcion.nombre ?? opcion}
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
