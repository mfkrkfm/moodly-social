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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <Card className="shadow-lg border-emerald-100/60">
          <CardContent className="p-7">
            <h2 className="text-xl font-semibold text-[#1F453F] mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-6">Sign in to continue your mindful feed.</p>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-line">
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
                  className="mt-1 bg-white/80 border-emerald-100 focus-visible:ring-emerald-300/50"
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
                  className="mt-1 bg-white/80 border-emerald-100 focus-visible:ring-emerald-300/50"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1F453F] to-[#3C7680] hover:from-[#16352F] hover:to-[#2F6068] text-white"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                New here?{" "}
                <Link to="/signup" className="text-[#3C7680] hover:underline font-medium">
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
