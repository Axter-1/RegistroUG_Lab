import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import ConsultaAgendas from './ConsultaAgendas'

test('muestra la agenda semanal con los intervalos indicados en el diseño', async () => {
  render(<ConsultaAgendas />)

  expect(await screen.findByRole('heading', { name: 'Agenda semanal' })).toBeInTheDocument()
  expect(await screen.findByRole('table', { name: 'Disponibilidad semanal del laboratorio' })).toBeInTheDocument()
  expect(screen.getAllByText('Bloqueado: taller')).toHaveLength(2)
  expect(screen.getAllByText(/Docente A · UDA 1 · 1°A/)).toHaveLength(2)
  expect(screen.getByRole('button', { name: /libre, reservar lun 12 a las 08:00/i })).toBeInTheDocument()
})

test('abre una reserva con laboratorio, fecha y hora precargados', async () => {
  render(<ConsultaAgendas />)

  const botonLibre = await screen.findByRole('button', {
    name: /libre, reservar lun 12 a las 08:00/i,
  })
  fireEvent.click(botonLibre)

  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByLabelText('Laboratorio')).toHaveValue('Laboratorio 1')
  expect(within(dialog).getByLabelText('Fecha')).toHaveValue('2026-10-12')
  expect(within(dialog).getByLabelText('Hora')).toHaveValue('08:00')

  fireEvent.change(within(dialog).getByLabelText('Docente'), {
    target: { value: 'Docente de prueba' },
  })
  fireEvent.change(within(dialog).getByLabelText('UDA o actividad'), {
    target: { value: 'Práctica' },
  })
  fireEvent.change(within(dialog).getByLabelText('Grupo'), {
    target: { value: '1°A' },
  })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar reserva' }))

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByRole('status')).toHaveTextContent('Reserva agregada')
  expect(screen.getByText(/Docente de prueba · Práctica · 1°A/)).toBeInTheDocument()
})

test('permite cambiar a la vista diaria y administrar bloqueos', async () => {
  render(<ConsultaAgendas sesion="Administrador" />)

  await screen.findByRole('table')
  expect(screen.getByRole('button', { name: 'Bloquear intervalo' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Día' }))
  expect(screen.getAllByRole('columnheader')).toHaveLength(2)
})
