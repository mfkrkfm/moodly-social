import { Navigate } from "react-router-dom";
import { getAuth, getSession } from "../api/authStore.js";

export function RequireAuth({ children }) {
  const token = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RedirectIfAuth({ children }) {
  const token = getAuth();
  if (token) return <Navigate to="/feed" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }) {
  const token = getAuth();
  if (!token) return <Navigate to="/login" replace />;

  const session = getSession();
  const isAdmin = (session?.roles || []).includes("ROLE_ADMIN");
  if (!isAdmin) return <Navigate to="/error/403" replace />;

  return <>{children}</>;
}
