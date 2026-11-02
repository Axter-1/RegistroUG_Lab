import { render, screen } from '@testing-library/react'
import BarraLateral from './BarraLateral'

test('navigates to access and agenda pages', () => {
  render(<BarraLateral activa="Accesos" />)

  expect(screen.getByRole('link', { name: 'Accesos' })).toHaveAttribute('href', '/accesos')
  expect(screen.getByRole('link', { name: 'Agenda' })).toHaveAttribute('href', '/agendas')
  expect(screen.getByRole('link', { name: 'Accesos' })).toHaveAttribute('aria-current', 'page')
})

test('links to reports and administration pages', () => {
  render(<BarraLateral />)

  expect(screen.getByRole('link', { name: 'Reportes' })).toHaveAttribute('href', '/reportes')
  expect(screen.getByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/administracion')
})
