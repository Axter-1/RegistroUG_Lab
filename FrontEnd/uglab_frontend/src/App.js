import { lazy, Suspense } from 'react';
import LoginPage from './LoginPage';
// import Dashboard from "./pages/Dashboard";
// import usuarios from "./pages/usuarios";
// import Login from "./pages/Login";

const ConsultaAccesos = lazy(() => import('./consultaAccesos/ConsultaAccesos'));
const ConsultaAgendas = lazy(() => import('./consultaAgendas/ConsultaAgendas'));
const Administracion = lazy(() => import('./administracion/Administracion'));
const Reportes = lazy(() => import('./reportes/Reportes'));

function App() {
  const pagina = window.location.pathname.replace(/\/+$/, '');

  if (pagina.endsWith('/accesos')) {
    return (
      <Suspense fallback={<p role="status">Cargando consulta de accesos…</p>}>
        <ConsultaAccesos />
      </Suspense>
    );
  }

  if (pagina.endsWith('/agendas')) {
    return (
      <Suspense fallback={<p role="status">Cargando agenda…</p>}>
        <ConsultaAgendas />
      </Suspense>
    );
  }

  if (pagina.endsWith('/administracion')) {
    return (
      <Suspense fallback={<p role="status">Cargando administración…</p>}>
        <Administracion />
      </Suspense>
    );
  }

  if (pagina.endsWith('/reportes')) {
    return (
      <Suspense fallback={<p role="status">Cargando reportes…</p>}>
        <Reportes />
      </Suspense>
    );
  }

  return <LoginPage />;
}

export default App;
