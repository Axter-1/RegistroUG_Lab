import { authClient } from "./lib/auth-client.ts"; //import the auth client
import { useState } from 'react';
import FluidGlass from './components/FluidGlass';

import './styles.css';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      await authClient.signIn.email({
        email: correo,
        password,
        rememberMe: true,
        callbackURL: 'http://localhost:3001/accesos' // Replace with your dashboard URL
      }, {
        onSuccess: (ctx) => {
          alert('Inicio de sesión exitoso');
        },
        onError: (ctx) => {
          setError('Error: correo o contraseña incorrectos.');
          alert(ctx.error.message);
        },
      });
    } catch {
      setError('No se pudo conectar con el servicio de inicio de sesión.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pantalla">
      <video
        className="pantalla__fondo"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/imagen.webm" type="video/webm" />
      </video>
      <FluidGlass className="tarjeta" blur={20} distortion={5} radius={24}>
        <div className="logo-slot">
          <img src={`${process.env.PUBLIC_URL}/logo_ug.png`} alt="Universidad de Guanajuato" />
        </div>

        <h1 className="titulo">Control de accesos y reservas de laboratorios</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="username"
              placeholder="correo@institucion"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          {error && (
            <p className="alerta" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? 'Verificando…' : 'Iniciar sesión'}
          </button>
        </form>


      </FluidGlass>
    </main>
  );
}
