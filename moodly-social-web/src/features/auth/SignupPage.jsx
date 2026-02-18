import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "./authApi";
import { saveAuth } from "./authStore";

export default function SignupPage() {
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strongPassword =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,100}$/;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      username: String(form.get("username") || "").trim(),
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    };

    if (!strongPassword.test(payload.password)) {
      setError(
        "Password must be 8+ chars and include: uppercase, lowercase, number and symbol (@#$%^&+=!)"
      );
      setLoading(false);
      return;
    }

    try {
      const response = await signup(payload);

      // backend AuthResponse: token
      saveAuth(response.token);

      navigate("/feed");
    } catch (err) {
      console.log("SIGNUP ERROR:", err?.response || err);

      const msg =
        err?.response?.data?.errors?.password ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (err?.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : null) ||
        err?.message ||
        "Signup failed.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-title">Create account</div>

      <form onSubmit={handleSubmit}>
        <input
          className="auth-input"
          name="username"
          placeholder="Username"
          required
        />

        <input
          className="auth-input"
          name="email"
          type="email"
          placeholder="Email"
          required
        />

        <div style={{ position: "relative" }}>
          <input
            className="auth-input"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#336D85",
              userSelect: "none",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "rgba(31,69,64,0.7)",
            marginTop: "-8px",
            marginBottom: "12px",
          }}
        >
          8+ chars • 1 uppercase • 1 lowercase • 1 number • 1 symbol (@#$%^&+=!)
        </p>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-button" disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>

        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
