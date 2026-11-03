import { fireEvent, render, screen } from '@testing-library/react'
import Reportes from './Reportes'

test('genera indicadores filtrables para el reporte', () => {
  render(<Reportes />)

  fireEvent.click(screen.getByRole('button', { name: 'Generar' }))

  expect(screen.getByRole('heading', { name: 'Reportes' })).toBeInTheDocument()
  expect(screen.getByText('Total de asistencias')).toBeInTheDocument()
  expect(screen.getByText('Total de asistencias').parentElement.querySelector('strong')).toHaveTextContent('4')
  expect(screen.getByRole('button', { name: 'Exportar Excel (.csv)' })).toBeEnabled()
})

test('rejects a custom date range with an end before its start', () => {
  render(<Reportes />)
  fireEvent.change(screen.getByLabelText('Periodo de tiempo'), { target: { value: 'rango' } })
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-20' } })
  fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Generar' }))

  expect(screen.getByRole('alert')).toHaveTextContent('La fecha inicial debe ser anterior o igual a la fecha final.')
})
