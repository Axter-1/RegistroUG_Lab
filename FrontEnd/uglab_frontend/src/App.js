import { lazy, Suspense } from 'react';
import LoginPage from './LoginPage';

const ConsultaAccesos = lazy(() => import('./consultaAccesos/ConsultaAccesos'));

function App() {
  const pagina = window.location.pathname.replace(/\/+$/, '');

  if (pagina.endsWith('/accesos')) {
    return (
      <Suspense fallback={<p role="status">Cargando consulta de accesos…</p>}>
        <ConsultaAccesos />
      </Suspense>
    );
  }

  return <LoginPage />;
}

export default App;
