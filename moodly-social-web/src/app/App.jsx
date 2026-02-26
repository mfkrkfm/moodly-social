import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { RequireAuth, RedirectIfAuth } from "./routes/auth";

import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AccountPage } from "./pages/AccountPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { FollowersPage } from "./pages/FollowersPage";
import { FollowingPage } from "./pages/FollowingPage";
import { PublicPostPage } from "./pages/PublicPostPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminUserDetailPage } from "./pages/AdminUserDetailPage";
import { PostPage } from "./pages/PostPage";

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

          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />

          <Route
            path="/:username"
            element={
              <RequireAuth>
                <PublicProfilePage />
              </RequireAuth>
            }
          />
        <Route
          path="/:username/followers"
          element={
            <RequireAuth>
              <FollowersPage />
            </RequireAuth>
          }
          />
          <Route
            path="/:username/following"
            element={
              <RequireAuth>
                <FollowingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/:username/posts/:postId"
            element={
              <RequireAuth>
                <PublicPostPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RequireAuth>
                <AdminUsersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <RequireAuth>
                <AdminUserDetailPage />
              </RequireAuth>
            }
          />

          <Route
            path="/posts/:postId"
            element={
              <RequireAuth>
                <PostPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/feed" replace />} />
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

