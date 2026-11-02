// src/context/AuthContext.jsx
import { Navigate, Outlet } from "react-router";
import { authClient } from "../lib/auth-client.ts";

export function IsLogged({ requiredRole }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return <p>Verificando sesión...</p>;
  if (!session) return <Navigate to="/" replace />;

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (
    requiredRole !== undefined &&
    !allowedRoles.includes(Number(session.user.id_rol))
  ) {
    return <h1>Accesso Denegado</h1>;
  }

  return <Outlet />;
}