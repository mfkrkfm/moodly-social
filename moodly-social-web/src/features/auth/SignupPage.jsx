import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "./authApi";
import { saveAuth } from "./authStore";

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.target);
    const password = String(form.get("password") || "");

    if (!validatePassword(password)) {
      setError(
        "Password must be 8+ characters and include uppercase, lowercase, number and special character."
      );
      setLoading(false);
      return;
    }

    const payload = {
      username: String(form.get("username") || "").trim(),
      email: String(form.get("email") || "").trim(),
      password,
    };

    try {
      const response = await signup(payload);
      saveAuth(response.accessToken);
      navigate("/feed");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Signup failed. Email may already be used.";
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

        <div className="auth-title">Create account</div>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Username</label>
          <input
            className="auth-input"
            name="username"
            placeholder="Your username"
            required
          />

          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="you@email.com"
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Create a password"
            required
          />

          <div className="auth-helper">
            Must be 8+ characters, include uppercase, lowercase,
            number and special character.
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-button" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </button>

          <div className="auth-row">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </div>
        </form>
      </div>

      <div className="mini">Moodly</div>
    </div>
  );
}