import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import ConsultaAccesos from './ConsultaAccesos'

test('registra una entrada manual con fecha, hora y origen automáticos', async () => {
  render(<ConsultaAccesos />)

  fireEvent.click(screen.getByRole('button', { name: /registrar entrada manual/i }))
  const dialog = screen.getByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText('NUA'), { target: { value: '009999' } })
  fireEvent.change(within(dialog).getByLabelText('Laboratorio'), {
    target: { value: 'Lab. 2' },
  })
  fireEvent.change(within(dialog).getByLabelText('UDA o razón'), {
    target: { value: 'Proyecto especial' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Registrar entrada' }))

  await waitFor(() => expect(screen.queryByText('Cargando accesos…')).not.toBeInTheDocument())
  const fila = screen.getByRole('row', { name: /009999/ })
  const celdas = within(fila).getAllByRole('cell')

  expect(celdas[2]).toHaveTextContent(/^\d{2}\/\d{2}\/\d{4}$/)
  expect(celdas[3]).toHaveTextContent(/^\d{2}:\d{2}$/)
  expect(celdas[6]).toHaveTextContent('Proyecto especial')
  expect(celdas[7]).toHaveTextContent('Manual')
  expect(screen.getByRole('status')).toHaveTextContent(/añadida a la lista/i)
})
