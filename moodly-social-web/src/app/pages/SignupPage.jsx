import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/authApi.js";
import { saveAuthSession } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Logo } from "../components/Logo.jsx";

function validatePassword(password) {
  // at least 8, uppercase, lowercase, digit, special, no spaces
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/.test(password);
}

export function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    if (!validatePassword(payload.password)) {
      setLoading(false);
      setError(
        "Password must be 8+ characters and include uppercase, lowercase, number and special character. No spaces."
      );
      return;
    }

    try {
      const res = await signup(payload);
      saveAuthSession(res);
      navigate("/feed");
    } catch (err) {
      console.error("Signup error caught:", err);

      // err.message is already processed by pickErrorMessage in http.js
      // so it contains the validation error text, not raw JSON
      const errorMessage = err?.message || "Sign-up failed";

      console.error("Final error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <Card className="glass">
          <CardContent className="p-7">
            <h2 className="mb-1 text-xl font-semibold text-black/90">Create your account</h2>
            <p className="mb-6 text-sm text-black/55">Start a calmer, mood-aware feed.</p>

            {error && (
              <div className="mb-4 rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-black/60">Username</label>
                <Input
                  name="username"
                  required
                  minLength={4}
                  maxLength={50}
                  autoComplete="username"
                  className="mt-1"
                  placeholder="username"
                />
                <p className="mt-1 text-xs text-black/55">
                  Only English letters, numbers, underscores and hyphens allowed.
                </p>
              </div>

              <div>
                <label className="text-sm text-black/60">Email</label>
                <Input
                  name="email"
                  type="email"
                  required
                  maxLength={100}
                  autoComplete="email"
                  className="mt-1"
                  placeholder="you@example.com"
                />
                <p className="mt-1 text-xs text-black/55">
                  We'll send a verification link to this email.
                </p>
              </div>

              <div>
                <label className="text-sm text-black/60">Password</label>
                <Input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                  className="mt-1"
                  placeholder="••••••••"
                />
                <p className="mt-2 text-xs leading-relaxed text-black/55">
                  Must be 8+ characters, include uppercase, lowercase, number and special character (@#$%^&+=!). No spaces.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-xl bg-black text-white transition hover:bg-black/90 disabled:bg-black/10 disabled:text-black/40"
              >
                {loading ? "Creating…" : "Create account"}
              </Button>

              <p className="text-center text-sm text-black/55">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-black/85 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
