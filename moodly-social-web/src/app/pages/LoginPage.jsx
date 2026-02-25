import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../api/authApi.js";
import { saveAuthSession } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Logo } from "../components/Logo.jsx";

export function LoginPage() {
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
      password: String(form.get("password") || ""),
    };

    try {
      const res = await signin(payload);
      saveAuthSession(res);
      navigate("/feed");
    } catch (err) {
      if (err instanceof HttpError && err.details?.errors) {
        setError(Object.values(err.details.errors).join("\n"));
      } else {
        setError(err?.message || "Sign-in failed");
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
            <h2 className="text-xl font-semibold text-brand-title mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-6">Sign in to continue your mindful feed.</p>

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
                  autoComplete="username"
                  required
                  className="mt-1 bg-surface-card-80 border-surface-border focus-visible:ring-focus-accent"
                  placeholder="yourname"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Password</label>
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 bg-surface-card-80 border-surface-border focus-visible:ring-focus-accent"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-brand-secondary hover:from-brand-primary-hover hover:to-brand-secondary-hover text-primary-foreground"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                New here?{" "}
                <Link to="/signup" className="text-brand-link hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
