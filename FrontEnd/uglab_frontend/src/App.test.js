import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

jest.mock('./lib/auth-client.ts', () => ({
  authClient: {
    signIn: { email: jest.fn() },
    token: jest.fn(),
  },
}));

test('renders the laboratory access login form', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  expect(screen.getByRole('heading', { name: /control de accesos y reservas de laboratorios/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
});

test('renders the access consultation page at /accesos', async () => {
  const rutaAnterior = window.location.pathname;
  window.history.pushState({}, '', '/accesos');

  try {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(await screen.findByRole('heading', { name: /consulta de accesos/i })).toBeInTheDocument();
  } finally {
    window.history.pushState({}, '', rutaAnterior);
  }
});

test('renders the weekly agenda at /agendas', async () => {
  const rutaAnterior = window.location.pathname;
  window.history.pushState({}, '', '/agendas');

  try {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(await screen.findByRole('heading', { name: /agenda semanal/i })).toBeInTheDocument();
  } finally {
    window.history.pushState({}, '', rutaAnterior);
  }
});

test('renders reports at /reportes', async () => {
  const rutaAnterior = window.location.pathname;
  window.history.pushState({}, '', '/reportes');

  try {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(await screen.findByRole('heading', { name: 'Reportes' })).toBeInTheDocument();
  } finally {
    window.history.pushState({}, '', rutaAnterior);
  }
});

test('renders administration at /administracion', async () => {
  const rutaAnterior = window.location.pathname;
  window.history.pushState({}, '', '/administracion');

  try {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(await screen.findByRole('heading', { name: 'Administración' })).toBeInTheDocument();
  } finally {
    window.history.pushState({}, '', rutaAnterior);
  }
});
