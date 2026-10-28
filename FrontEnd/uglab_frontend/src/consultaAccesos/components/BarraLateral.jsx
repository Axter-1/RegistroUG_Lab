const SECCIONES = ['Accesos', 'Agenda', 'Reportes', 'Administración']

export default function BarraLateral({
  activa = 'Accesos',
  onCambiar,
  sesion = 'Sin rol',
  onSalir,
}) {
  return (
    <aside className="barra">
      <div className="barra__marca">Laboratorios</div>

      <nav className="barra__nav" aria-label="Secciones">
        <ul>
          {SECCIONES.map((seccion) => (
            <li key={seccion}>
              <button
                type="button"
                className={`barra__enlace ${seccion === activa ? 'is-activa' : ''}`}
                aria-current={seccion === activa ? 'page' : undefined}
                onClick={() => onCambiar?.(seccion)}
              >
                {seccion}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="barra__sesion">
        <span className="barra__sesion-rol">Sesión: {sesion}</span>
        <button type="button" className="barra__salir" onClick={onSalir}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
