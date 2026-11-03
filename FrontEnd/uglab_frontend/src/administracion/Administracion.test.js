import { fireEvent, render, screen, within } from '@testing-library/react'
import Administracion from './Administracion'

test('registra un dispositivo y presenta su token de un solo uso', () => {
  Object.defineProperty(window, 'crypto', {
    configurable: true,
    value: { randomUUID: () => 'token-seguro-de-prueba' },
  })
  render(<Administracion />)

  fireEvent.change(screen.getByLabelText('Nombre', { selector: 'input' }), {
    target: { value: 'ESP32 laboratorio 3' },
  })
  fireEvent.change(screen.getByLabelText('Laboratorio'), {
    target: { value: 'Laboratorio 1' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))

  expect(screen.getByRole('row', { name: /ESP32 laboratorio 3/ })).toBeInTheDocument()
  expect(screen.getByText('Token (se muestra una sola vez):')).toBeInTheDocument()
  expect(screen.getByText('tokensegurodeprueba')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument()
})

test('permite crear registros en las pestañas de catálogo', () => {
  render(<Administracion />)
  fireEvent.click(screen.getByRole('button', { name: 'UDA' }))

  const formulario = screen.getByRole('heading', { name: 'Nuevo registro' }).parentElement
  fireEvent.change(within(formulario).getByLabelText('Clave'), { target: { value: 'UDA 4' } })
  fireEvent.change(within(formulario).getByLabelText('Nombre de la UDA'), {
    target: { value: 'Robótica' },
  })
  fireEvent.click(within(formulario).getByRole('button', { name: /agregar uda/i }))

  expect(screen.getByRole('row', { name: /UDA 4 Robótica Activo/ })).toBeInTheDocument()
})

test('no muestra opciones para registrar alumnos y limita las acciones del dispositivo', () => {
  render(<Administracion />)

  expect(screen.queryByRole('button', { name: /importar alumnos/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Alumnos' })).not.toBeInTheDocument()

  const dispositivo = screen.getByRole('row', { name: /ESP32 puerta Laboratorio 1 Activo/ })
  expect(within(dispositivo).queryByRole('button', { name: /regenerar token/i })).not.toBeInTheDocument()
  expect(within(dispositivo).getByRole('button', { name: 'Desactivar' })).toBeInTheDocument()
  expect(within(dispositivo).getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()

  fireEvent.click(within(dispositivo).getByRole('button', { name: 'Desactivar' }))
  const dispositivoInactivo = screen.getByRole('row', { name: /ESP32 puerta Laboratorio 1 Inactivo/ })
  fireEvent.click(within(dispositivoInactivo).getByRole('button', { name: 'Eliminar' }))

  expect(screen.queryByRole('row', { name: /ESP32 puerta Laboratorio 1/ })).not.toBeInTheDocument()
})
