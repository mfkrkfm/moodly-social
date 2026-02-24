import { Navigate } from "react-router-dom";
import { getAuth } from "../api/authStore";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const token = getAuth();
  if (token) return <Navigate to="/feed" replace />;
  return <>{children}</>;
}
