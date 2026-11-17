import { useState } from 'react'
import BarraLateral from '../components/BarraLateral'
import './administracion.css'

const SECCIONES = {
  Laboratorios: {
    columnas: ['Nombre', 'Ubicación', 'Salidas', 'Horario', 'Estado'],
    campos: [
      { id: 'nombre', etiqueta: 'Nombre', requerido: true },
      { id: 'ubicacion', etiqueta: 'Ubicación', requerido: true },
    ],
    iniciales: [
      { nombre: 'Laboratorio 1', ubicacion: 'Edificio A', salidas: 'No', horario: '08:00–15:00', estado: 'Activo' },
      { nombre: 'Laboratorio 2', ubicacion: 'Edificio B', salidas: 'Sí', horario: '08:00–15:00', estado: 'Activo' },
    ],
  },
  Periodos: {
    columnas: ['Nombre', 'Inicio', 'Fin', 'Estado'],
    campos: [
      { id: 'nombre', etiqueta: 'Nombre del periodo', requerido: true },
      { id: 'inicio', etiqueta: 'Fecha de inicio', tipo: 'date', requerido: true },
      { id: 'fin', etiqueta: 'Fecha de término', tipo: 'date', requerido: true },
    ],
    iniciales: [{ nombre: 'Semestre agosto–diciembre 2026', inicio: '2026-08-03', fin: '2026-12-18', estado: 'Activo' }],
  },
  UDA: {
    columnas: ['Clave', 'Nombre', 'Estado'],
    campos: [
      { id: 'clave', etiqueta: 'Clave', requerido: true },
      { id: 'nombre', etiqueta: 'Nombre de la UDA', requerido: true },
    ],
    iniciales: [
      { clave: 'UDA 1', nombre: 'Fundamentos de programación', estado: 'Activa' },
      { clave: 'UDA 2', nombre: 'Bases de datos', estado: 'Activa' },
    ],
  },
  Grupos: {
    columnas: ['Nombre', 'Programa', 'Periodo', 'Estado'],
    campos: [
      { id: 'nombre', etiqueta: 'Nombre del grupo', requerido: true },
      { id: 'programa', etiqueta: 'Programa educativo' },
    ],
    iniciales: [
      { nombre: '1°A', programa: 'Ingeniería en Sistemas', periodo: '2026', estado: 'Activo' },
      { nombre: '2°B', programa: 'Ingeniería en Sistemas', periodo: '2026', estado: 'Activo' },
    ],
  },
  Asignaciones: {
    columnas: ['UDA', 'Grupo', 'Docente', 'Periodo'],
    campos: [
      { id: 'uda', etiqueta: 'UDA', requerido: true },
      { id: 'grupo', etiqueta: 'Grupo', requerido: true },
      { id: 'docente', etiqueta: 'Docente', requerido: true },
    ],
    iniciales: [
      { uda: 'UDA 1', grupo: '1°A', docente: 'Docente A', periodo: '2026' },
      { uda: 'UDA 2', grupo: '2°B', docente: 'Docente B', periodo: '2026' },
    ],
  },
}

const DISPOSITIVOS_INICIALES = [
  { nombre: 'ESP32 puerta', laboratorio: 'Laboratorio 1', activo: true },
  { nombre: 'ESP32 puerta', laboratorio: 'Laboratorio 2', activo: false },
]

function tokenNuevo() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID().replaceAll('-', '')
  if (!window.crypto?.getRandomValues) throw new Error('El navegador no permite generar un token seguro.')
  return Array.from(window.crypto.getRandomValues(new Uint8Array(24)), (valor) =>
    valor.toString(16).padStart(2, '0')
  ).join('')
}

export default function Administracion() {
  const [seccion, setSeccion] = useState('Dispositivos')
  const [registros, setRegistros] = useState(SECCIONES)
  const [dispositivos, setDispositivos] = useState(DISPOSITIVOS_INICIALES)
  const [laboratorios, setLaboratorios] = useState(SECCIONES.Laboratorios.iniciales)
  const [token, setToken] = useState('')
  const [mensaje, setMensaje] = useState('')
  function agregarRegistro(evento) {
    evento.preventDefault()
    const formulario = new FormData(evento.currentTarget)
    const nuevo = Object.fromEntries(
      SECCIONES[seccion].campos.map(({ id }) => [id, String(formulario.get(id) || '').trim()])
    )
    if (seccion === 'Laboratorios') {
      const salidas = formulario.get('salidas') === 'on'
      const apertura = String(formulario.get('apertura') || '08:00')
      const cierre = salidas ? String(formulario.get('cierre') || '') : '15:00'
      nuevo.salidas = salidas ? 'Sí' : 'No'
      nuevo.horario = `${apertura}–${cierre || '15:00'}`
      nuevo.estado = formulario.get('activo') === 'on' ? 'Activo' : 'Inactivo'
      setLaboratorios((actuales) => [...actuales, nuevo])
    } else {
      setRegistros((actuales) => ({
        ...actuales,
        [seccion]: {
          ...actuales[seccion],
          iniciales: [...actuales[seccion].iniciales, { ...nuevo, estado: 'Activo' }],
        },
      }))
    }
    evento.currentTarget.reset()
    setMensaje(`Registro agregado en ${seccion}.`)
  }

  function agregarDispositivo(evento) {
    evento.preventDefault()
    const formulario = new FormData(evento.currentTarget)
    const nombre = String(formulario.get('nombre') || '').trim()
    const laboratorio = String(formulario.get('laboratorio') || '')
    const generado = tokenNuevo()
    setDispositivos((actuales) => [...actuales, { nombre, laboratorio, activo: true }])
    setToken(generado)
    setMensaje('Dispositivo registrado. Guarda el token: solo se muestra una vez.')
    evento.currentTarget.reset()
  }

  async function copiarToken() {
    try {
      await navigator.clipboard.writeText(token)
      setMensaje('Token copiado al portapapeles.')
    } catch (error) {
      setMensaje(`No se pudo copiar el token: ${error.message}`)
    }
  }

  const configuracion = SECCIONES[seccion]
  const filas = seccion === 'Laboratorios' ? laboratorios : registros[seccion]?.iniciales

  return (
    <div className="admin-disposicion">
      <BarraLateral activa="Administración" />
      <main className="admin-contenido">
        <header className="admin-encabezado">
          <h1>Administración</h1>
        </header>

        <nav className="admin-pestanas" aria-label="Administrar catálogo">
          {[...Object.keys(SECCIONES), 'Dispositivos'].map((nombre) => (
            <button
              type="button"
              key={nombre}
              className={nombre === seccion ? 'is-activa' : ''}
              aria-current={nombre === seccion ? 'page' : undefined}
              onClick={() => {
                setSeccion(nombre)
                setMensaje('')
              }}
            >
              {nombre}
            </button>
          ))}
        </nav>

        {mensaje && <p className="admin-mensaje" role="status">{mensaje}</p>}

        {seccion === 'Dispositivos' ? (
          <div className="admin-columnas">
            <section className="admin-panel">
              <h2>Dispositivos de acceso</h2>
              <div className="admin-tabla-envoltorio">
                <table className="admin-tabla">
                  <thead><tr><th>Nombre</th><th>Laboratorio</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {dispositivos.map((dispositivo, indice) => (
                      <tr key={`${dispositivo.laboratorio}-${indice}`}>
                        <td>{dispositivo.nombre}</td>
                        <td>{dispositivo.laboratorio}</td>
                        <td>{dispositivo.activo ? 'Activo' : 'Inactivo'}</td>
                        <td className="admin-acciones">
                          <button
                            type="button"
                            onClick={() => setDispositivos((actuales) => actuales.map((item, posicion) =>
                              posicion === indice ? { ...item, activo: !item.activo } : item
                            ))}
                          >
                            {dispositivo.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          {' · '}
                          <button
                            type="button"
                            onClick={() => setDispositivos((actuales) =>
                              actuales.filter((_, posicion) => posicion !== indice)
                            )}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="admin-nota">Un dispositivo, un laboratorio. El mismo equipo registra entradas y salidas.</p>
            </section>

            <div className="admin-columna-formularios">
              <section className="admin-panel">
                <h2>Nuevo dispositivo</h2>
                <form className="admin-formulario" onSubmit={agregarDispositivo}>
                  <label>Nombre<input name="nombre" placeholder="ESP32 puerta" required /></label>
                  <label>Laboratorio
                    <select name="laboratorio" defaultValue="" required>
                      <option value="" disabled>Selecciona un laboratorio</option>
                      {laboratorios.filter((lab) => lab.estado !== 'Inactivo').map((lab) => (
                        <option key={lab.nombre} value={lab.nombre}>{lab.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="admin-boton admin-boton--primario">Registrar</button>
                </form>
                {token && (
                  <p className="admin-token" role="status">
                    <strong>Token (se muestra una sola vez):</strong><br />
                    <code>{token}</code>{' '}
                    <button type="button" onClick={copiarToken}>Copiar</button>
                  </p>
                )}
              </section>

              <section className="admin-panel">
                <h2>Laboratorio</h2>
                <form className="admin-formulario" onSubmit={agregarRegistro}>
                  <label>Nombre y ubicación
                    <input name="nombre" placeholder="Nombre del laboratorio" required />
                  </label>
                  <label>Ubicación<input name="ubicacion" placeholder="Edificio y aula" required /></label>
                  <label className="admin-casilla">
                    <input type="checkbox" name="salidas" />
                    Registrar salidas (por defecto: no)
                  </label>
                  <div className="admin-horarios">
                    <label>Apertura<input type="time" name="apertura" defaultValue="08:00" /></label>
                    <label>Cierre<input type="time" name="cierre" defaultValue="15:00" /></label>
                  </div>
                  <label className="admin-casilla"><input type="checkbox" name="activo" defaultChecked />Activo</label>
                  <button type="submit" className="admin-boton admin-boton--secundario">Registrar laboratorio</button>
                </form>
              </section>
            </div>
          </div>
        ) : (
          <div className="admin-columnas">
            <section className="admin-panel">
              <h2>{seccion}</h2>
              <div className="admin-tabla-envoltorio">
                <table className="admin-tabla">
                  <thead><tr>{configuracion.columnas.map((columna) => <th key={columna}>{columna}</th>)}</tr></thead>
                  <tbody>
                    {filas.map((fila, indice) => (
                      <tr key={`${fila[configuracion.columnas[0].toLowerCase()]}-${indice}`}>
                        {configuracion.columnas.map((columna) => {
                          const clave = Object.keys(fila).find((key) => key.toLowerCase() === columna.toLowerCase())
                          return <td key={columna}>{fila[clave] || '—'}</td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="admin-panel">
              <h2>Nuevo registro</h2>
              <form className="admin-formulario" onSubmit={agregarRegistro}>
                {configuracion.campos.map(({ id, etiqueta, tipo = 'text', requerido }) => (
                  <label key={id}>{etiqueta}<input name={id} type={tipo} required={requerido} /></label>
                ))}
                {seccion === 'Laboratorios' && (
                  <>
                    <label className="admin-casilla"><input type="checkbox" name="salidas" />Registrar salidas</label>
                    <div className="admin-horarios">
                      <label>Apertura<input type="time" name="apertura" defaultValue="08:00" /></label>
                      <label>Cierre<input type="time" name="cierre" defaultValue="15:00" /></label>
                    </div>
                    <label className="admin-casilla"><input type="checkbox" name="activo" defaultChecked />Activo</label>
                  </>
                )}
                <button type="submit" className="admin-boton admin-boton--primario">Agregar {seccion.toLowerCase().replace(/s$/, '')}</button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
