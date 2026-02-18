import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signin } from "./authApi";
import { saveAuth } from "./authStore";

export default function LoginPage() {
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      username: String(form.get("username") || "").trim(),
      password: String(form.get("password") || ""),
    };

    try {
      const response = await signin(payload);
      saveAuth(response.token);
      navigate("/feed");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Login failed. Check username/password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-logo">
            <img src="/logo.png" alt="Moodly" />
          </div>
          <div>
            <div className="brand-title">Moodly Social</div>
            <div className="brand-sub">calm space for your daily pulse</div>
          </div>
        </div>

        <div className="auth-title">Sign in</div>
        <p className="auth-text">Welcome back. Continue gently.</p>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Username</label>
          <input className="auth-input" name="username" placeholder="your username" required />

          <label className="auth-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              className="auth-input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="your password"
              required
            />
            <span className="pw-toggle" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="auth-row">
            No account?{" "}
            <Link to="/signup" className="auth-link">
              Create one
            </Link>
          </div>
        </form>
      </div>

      <div className="mini">Moodly • gentle by design</div>
    </div>
  );
}
