import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the laboratory access login form', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /control de accesos y reservas de laboratorios/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
});

test('renders the access consultation page at /accesos', async () => {
  const rutaAnterior = window.location.pathname;
  window.history.pushState({}, '', '/accesos');

  render(<App />);
  expect(await screen.findByRole('heading', { name: /consulta de accesos/i })).toBeInTheDocument();

  window.history.pushState({}, '', rutaAnterior);
});
