import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signin } from "./authApi";
import { saveAuth } from "./authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    };

    try {
      const response = await signin(payload);

      saveAuth(response.accessToken);

      navigate("/feed");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed. Check email/password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <img src="/logo.png" alt="Moodly" />
          <div>
            <div className="brand-title">Moodly Social</div>
            <div className="brand-sub">Space for your daily pulse</div>
          </div>
        </div>

        <div className="auth-title">Sign in</div>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input className="auth-input" name="email" type="email" placeholder="you@email.com" required />

          <label className="auth-label">Password</label>
          <input className="auth-input" name="password" type="password" placeholder="Your password" required />

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

      <div className="mini">Moodly</div>
    </div>
  );
}
