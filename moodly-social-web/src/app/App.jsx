import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { RequireAuth, RedirectIfAuth } from "./routes/auth";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/errors/NotFoundPage";
import { ErrorPage } from "./pages/errors/ErrorPage";
import { ErrorBoundary } from "./pages/errors/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/feed" replace />}
          />

          <Route
            path="/login"
            element={
              <RedirectIfAuth>
                <LoginPage />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAuth>
                <SignupPage />
              </RedirectIfAuth>
            }
          />

          <Route
            path="/feed"
            element={
              <RequireAuth>
                <FeedPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />

          {/* Error pages — accessible directly for testing */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/error" element={<ErrorPage code={500} />} />
          <Route path="/error/:code" element={<ErrorPageByCode />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function ErrorPageByCode() {
  const { code } = useParams();
  return <ErrorPage code={Number(code)} />;
}

