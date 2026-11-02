const SECCIONES = [
  { nombre: 'Accesos', ruta: '/accesos' },
  { nombre: 'Agenda', ruta: '/agendas' },
  { nombre: 'Reportes', ruta: '/reportes' },
  { nombre: 'Administración', ruta: '/administracion' },
]

export default function BarraLateral({ activa = 'Accesos', sesion = 'Administrador' }) {
  return (
    <aside className="barra">
      <div className="barra__marca">Laboratorios</div>

      <nav className="barra__nav" aria-label="Secciones">
        <ul>
          {SECCIONES.map(({ nombre, ruta }) => (
            <li key={nombre}>
              {ruta ? (
                <a
                  className={`barra__enlace ${nombre === activa ? 'is-activa' : ''}`}
                  href={ruta}
                  aria-current={nombre === activa ? 'page' : undefined}
                >
                  {nombre}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>

      <div className="barra__sesion">
        <span className="barra__sesion-rol">Sesión: {sesion}</span>
        <button type="button" className="barra__salir">
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
