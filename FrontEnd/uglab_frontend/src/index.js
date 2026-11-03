import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import LoginPage from './LoginPage';
import App from './App';

import { IsLogged } from "./context/AuthContext";
import { BrowserRouter , Routes, Route, Navigate} from "react-router";

import './index.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route element={<IsLogged requiredRole={[2, 3]} />}>
            <Route path="accesos" element={<App />} />
          </Route>

          <Route path="agendas" element={<App />} />
          <Route path="reportes" element={<App />} />
          <Route path="administracion" element={<App />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
