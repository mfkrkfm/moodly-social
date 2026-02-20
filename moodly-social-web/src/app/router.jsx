import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import SignupPage from "../features/auth/SignupPage";
import LoginPage from "../features/auth/LoginPage";
import { isAuthed } from "../features/auth/authStore";

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function FeedPlaceholder() {
  return <div className="p-6">Feed page coming next 🚀</div>;
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/feed" replace /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/feed",
    element: (
      <PrivateRoute>
        <FeedPlaceholder />
      </PrivateRoute>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
