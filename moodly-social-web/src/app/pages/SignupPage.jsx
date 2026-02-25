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
      if (err instanceof HttpError && err.details?.errors) {
        setError(Object.values(err.details.errors).join("\n"));
      } else {
        setError(err?.message || "Sign-up failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-tint via-background to-mood-calm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <Card className="shadow-lg border-surface-border-soft">
          <CardContent className="p-7">
            <h2 className="text-xl font-semibold text-brand-title mb-1">Create your account</h2>
            <p className="text-sm text-muted-foreground mb-6">Start a calmer, mood-aware feed.</p>

            {error && (
              <div className="mb-4 rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Username</label>
                <Input
                  name="username"
                  required
                  minLength={4}
                  maxLength={50}
                  autoComplete="username"
                  className="mt-1 bg-surface-card-80 border-surface-border focus-visible:ring-focus-accent"
                  placeholder="yourname"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  name="email"
                  type="email"
                  required
                  maxLength={100}
                  autoComplete="email"
                  className="mt-1 bg-surface-card-80 border-surface-border focus-visible:ring-focus-accent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Password</label>
                <Input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                  className="mt-1 bg-surface-card-80 border-surface-border focus-visible:ring-focus-accent"
                  placeholder="••••••••"
                />
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Must be 8+ characters, include uppercase, lowercase, number and special character. No spaces.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-brand-secondary hover:from-brand-primary-hover hover:to-brand-secondary-hover text-primary-foreground"
              >
                {loading ? "Creating…" : "Create account"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-brand-link hover:underline font-medium">
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
