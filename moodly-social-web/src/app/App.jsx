import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />

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

        {/* NEW: account */}
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />

        {/* NEW: public profile area (but still requires auth in your app) */}
        <Route
          path="/u/:username"
          element={
            <RequireAuth>
              <PublicProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/u/:username/followers"
          element={
            <RequireAuth>
              <FollowersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/u/:username/following"
          element={
            <RequireAuth>
              <FollowingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/u/:username/posts/:postId"
          element={
            <RequireAuth>
              <PublicPostPage />
            </RequireAuth>
          }
        />

        {/* NEW: admin */}
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
      </Routes>
    </BrowserRouter>
  );
}