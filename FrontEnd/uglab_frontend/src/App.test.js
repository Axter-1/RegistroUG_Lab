import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the laboratory access login form', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /control de accesos y reservas de laboratorios/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
});
