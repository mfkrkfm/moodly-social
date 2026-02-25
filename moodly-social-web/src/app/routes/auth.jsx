import { Navigate } from "react-router-dom";
import { getAuth } from "../api/authStore.js";

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
