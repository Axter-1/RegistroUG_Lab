import { useMemo, useState } from 'react'
import BarraLateral from '../components/BarraLateral'
import { accesosDemo } from '../consultaAccesos/datos'
import './reportes.css'

const RESERVAS = [
  { laboratorio: 'Laboratorio 1', fecha: '2026-10-12', hora: '10:00', docente: 'Docente A', uda: 'UDA 1', grupo: '1°A' },
  { laboratorio: 'Laboratorio 1', fecha: '2026-10-14', hora: '10:00', docente: 'Docente A', uda: 'UDA 1', grupo: '1°A' },
  { laboratorio: 'Laboratorio 1', fecha: '2026-10-14', hora: '11:00', docente: 'Docente B', uda: 'UDA 2', grupo: '2°B' },
  { laboratorio: 'Laboratorio 1', fecha: '2026-10-15', hora: '12:00', docente: '', uda: '', grupo: '' },
  { laboratorio: 'Laboratorio 1', fecha: '2026-10-15', hora: '13:00', docente: '', uda: '', grupo: '' },
  { laboratorio: 'Laboratorio 1', fecha: '2026-10-16', hora: '09:00', docente: 'Docente C', uda: 'UDA 3', grupo: '3°A' },
]

const FORMATO_FECHA = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const LABORATORIOS = ['Laboratorio 1', 'Laboratorio 2']
const INDICADORES = [
  { campo: 'asistencias', etiqueta: 'Total de asistencias', definicion: 'Número de entradas registradas que coinciden con los filtros.' },
  { campo: 'alumnos', etiqueta: 'Alumnos únicos', definicion: 'Cantidad de NUA diferentes con al menos una asistencia.' },
  { campo: 'horasReservadas', etiqueta: 'Horas reservadas', definicion: 'Intervalos de una hora reservados en la agenda.' },
  { campo: 'horasDisponibles', etiqueta: 'Horas disponibles', definicion: 'Horas de apertura de los laboratorios en días hábiles.' },
  { campo: 'ocupacion', etiqueta: '% de ocupación', definicion: 'Horas reservadas divididas entre las horas disponibles.' },
]

function fechaLocal(fecha) {
  const desplazamiento = fecha.getTimezoneOffset() * 60000
  return new Date(fecha.getTime() - desplazamiento).toISOString().slice(0, 10)
}

function obtenerRango(periodo, inicio, fin) {
  if (periodo === 'rango') return { desde: inicio, hasta: fin }
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = ahora.getMonth()
  if (periodo === 'semestre') {
    const inicioMes = mes < 6 ? 0 : 6
    return {
      desde: `${anio}-${String(inicioMes + 1).padStart(2, '0')}-01`,
      hasta: fechaLocal(new Date(anio, inicioMes + 6, 0)),
    }
  }
  return {
    desde: `${anio}-${String(mes + 1).padStart(2, '0')}-01`,
    hasta: fechaLocal(new Date(anio, mes + 1, 0)),
  }
}

function fechaAcceso(fecha) {
  const partes = fecha.split('/')
  return `${partes[2]}-${partes[1]}-${partes[0]}`
}

function coincide(fila, filtros, rango) {
  if (filtros.laboratorio !== 'Todos' && fila.laboratorio !== filtros.laboratorio) return false
  if (filtros.uda !== 'Todas' && fila.uda !== filtros.uda) return false
  if (filtros.docente !== 'Todos' && fila.docente !== filtros.docente) return false
  if (filtros.grupo !== 'Todos' && fila.grupo !== filtros.grupo) return false
  return fila.fecha >= rango.desde && fila.fecha <= rango.hasta
}

function csvEscape(valor) {
  return `"${String(valor ?? '').replaceAll('"', '""')}"`
}

export default function Reportes() {
  const hoy = fechaLocal(new Date())
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    inicio: hoy.slice(0, 8) + '01',
    fin: hoy,
    laboratorio: 'Todos',
    uda: 'Todas',
    docente: 'Todos',
    grupo: 'Todos',
    consolidada: true,
    anulados: false,
  })
  const [reporte, setReporte] = useState(null)
  const [error, setError] = useState('')

  const rango = useMemo(
    () => obtenerRango(filtros.periodo, filtros.inicio, filtros.fin),
    [filtros.periodo, filtros.inicio, filtros.fin]
  )

  function cambiar(campo, valor) {
    setFiltros((actuales) => ({ ...actuales, [campo]: valor }))
  }

  function generarReporte() {
    if (filtros.periodo === 'rango' && filtros.inicio > filtros.fin) {
      setError('La fecha inicial debe ser anterior o igual a la fecha final.')
      return
    }
    const accesos = accesosDemo
      .filter((acceso) => filtros.anulados || !acceso.anulado)
      .map((acceso) => ({
        ...acceso,
        laboratorio: acceso.laboratorio.replace('Lab. ', 'Laboratorio '),
        fecha: fechaAcceso(acceso.fecha),
        docente: acceso.grupo === '1°A' ? 'Docente A' : acceso.grupo === '2°B' ? 'Docente B' : '',
      }))
      .filter((acceso) => coincide(acceso, filtros, rango))
    const reservas = RESERVAS.filter((reserva) => coincide(reserva, filtros, rango))
    const grupos = new Map()
    accesos.forEach((acceso) => {
      const nombre = acceso.uda || 'Sin UDA (razón)'
      const fila = grupos.get(nombre) || { nombre, asistencias: 0, alumnos: new Set() }
      fila.asistencias += 1
      fila.alumnos.add(acceso.nua)
      grupos.set(nombre, fila)
    })
    reservas.forEach((reserva) => {
      const nombre = reserva.uda || 'Sin UDA (razón)'
      const fila = grupos.get(nombre) || { nombre, asistencias: 0, alumnos: new Set() }
      fila.horas += 1
      grupos.set(nombre, fila)
    })
    const horasReservadas = reservas.length
    const desde = new Date(`${rango.desde}T12:00:00`)
    const hasta = new Date(`${rango.hasta}T12:00:00`)
    let diasLaborables = 0
    for (const dia = new Date(desde); dia <= hasta; dia.setDate(dia.getDate() + 1)) {
      if (dia.getDay() !== 0 && dia.getDay() !== 6) diasLaborables += 1
    }
    const laboratorios = filtros.laboratorio === 'Todos' ? LABORATORIOS.length : 1
    const horasDisponibles = diasLaborables * 7 * laboratorios
    setReporte({
      filtros: { ...filtros },
      rango,
      generado: new Date(),
      asistencias: accesos.length,
      alumnos: new Set(accesos.map((acceso) => acceso.nua)).size,
      horasReservadas,
      horasDisponibles,
      ocupacion: horasDisponibles ? (horasReservadas / horasDisponibles) * 100 : 0,
      filas: [...grupos.values()].map((fila) => ({
        ...fila,
        horas: fila.horas || 0,
        ocupacion: horasDisponibles ? ((fila.horas || 0) / horasDisponibles) * 100 : 0,
      })),
    })
    setError('')
  }

  function exportarCSV() {
    if (!reporte) return
    const filas = [
      ['UDA', 'Asistencias', 'Horas reservadas', 'Ocupación'],
      ...reporte.filas.map((fila) => [
        fila.nombre,
        fila.asistencias,
        fila.horas,
        `${fila.ocupacion.toFixed(1)}%`,
      ]),
    ]
    const contenido = `\uFEFF${filas.map((fila) => fila.map(csvEscape).join(',')).join('\r\n')}`
    const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'reporte-laboratorios.csv'
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reportes-disposicion">
      <BarraLateral activa="Reportes" />
      <main className="reportes-contenido">
        <header className="reportes-encabezado">
          <h1>Reportes</h1>
          <div className="reportes-exportar">
            <button type="button" className="reportes-boton reportes-boton--secundario" disabled={!reporte} onClick={exportarCSV}>Exportar Excel (.csv)</button>
            <button type="button" className="reportes-boton reportes-boton--primario" disabled={!reporte} onClick={() => window.print()}>Exportar PDF</button>
          </div>
        </header>

        <form
          className="reportes-filtros"
          onSubmit={(evento) => {
            evento.preventDefault()
            generarReporte()
          }}
        >
          <label>Periodo de tiempo
            <select value={filtros.periodo} onChange={(evento) => cambiar('periodo', evento.target.value)}>
              <option value="mes">Mes actual</option>
              <option value="semestre">Semestre actual</option>
              <option value="rango">Rango personalizado</option>
            </select>
          </label>
          {filtros.periodo === 'rango' && (
            <div className="reportes-fechas">
              <label>Desde<input type="date" value={filtros.inicio} onChange={(evento) => cambiar('inicio', evento.target.value)} /></label>
              <label>Hasta<input type="date" value={filtros.fin} onChange={(evento) => cambiar('fin', evento.target.value)} /></label>
            </div>
          )}
          <label>Laboratorio
            <select value={filtros.laboratorio} onChange={(evento) => cambiar('laboratorio', evento.target.value)}>
              <option>Todos</option>{LABORATORIOS.map((lab) => <option key={lab}>{lab}</option>)}
            </select>
          </label>
          <label>UDA
            <select value={filtros.uda} onChange={(evento) => cambiar('uda', evento.target.value)}>
              <option>Todas</option><option>UDA 1</option><option>UDA 2</option><option>UDA 3</option>
            </select>
          </label>
          <label>Docente
            <select value={filtros.docente} onChange={(evento) => cambiar('docente', evento.target.value)}>
              <option>Todos</option><option>Docente A</option><option>Docente B</option><option>Docente C</option>
            </select>
          </label>
          <label>Grupo
            <select value={filtros.grupo} onChange={(evento) => cambiar('grupo', evento.target.value)}>
              <option>Todos</option><option>1°A</option><option>2°B</option><option>3°A</option>
            </select>
          </label>
          <button type="submit" className="reportes-boton reportes-boton--primario">Generar</button>
        </form>

        <div className="reportes-opciones">
          <label><input type="checkbox" checked={filtros.consolidada} onChange={(evento) => cambiar('consolidada', evento.target.checked)} />Vista consolidada</label>
          <label><input type="checkbox" checked={filtros.anulados} onChange={(evento) => cambiar('anulados', evento.target.checked)} />Incluir anulados</label>
        </div>

        {error && <p className="reportes-error" role="alert">{error}</p>}
        {reporte ? (
          <section aria-label="Resultados del reporte">
            <div className="reportes-indicadores">
              {INDICADORES.map(({ campo, etiqueta, definicion }) => (
                <article key={campo} aria-label={`${etiqueta}: ${definicion}`} title={definicion}>
                  <span>{etiqueta}</span>
                  <strong>{campo === 'ocupacion' ? `${reporte.ocupacion.toFixed(1)}%` : reporte[campo]}</strong>
                </article>
              ))}
            </div>
            <div className="reportes-tabla-envoltorio">
              <table className="reportes-tabla">
                <thead><tr><th>UDA</th><th>Asistencias</th><th>Horas reservadas</th><th>Ocupación</th></tr></thead>
                <tbody>
                  {reporte.filas.map((fila) => (
                    <tr key={fila.nombre}>
                      <td>{fila.nombre}</td><td>{fila.asistencias}</td><td>{fila.horas}</td><td>{fila.ocupacion.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {reporte.filas.length === 0 && <tr><td colSpan="4">No hay datos para los filtros seleccionados.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="reportes-generado">
              Filtros: {reporte.filtros.periodo === 'rango'
                ? `${reporte.rango.desde} – ${reporte.rango.hasta}`
                : reporte.filtros.periodo}
              {' · '}{reporte.filtros.laboratorio} · {reporte.filtros.uda} · {reporte.filtros.docente} · {reporte.filtros.grupo}
              {' · Anulados: '}{reporte.filtros.anulados ? 'incluidos' : 'excluidos'}
              <br />Generado: {FORMATO_FECHA.format(reporte.generado)} a las {reporte.generado.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </section>
        ) : (
          <p className="reportes-vacio">Seleccione los filtros y haga clic en "Generar" para ver el reporte.</p>
        )}
      </main>
    </div>
  )
}
