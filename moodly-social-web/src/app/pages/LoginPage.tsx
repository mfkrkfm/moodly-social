import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../api/authApi";
import { saveAuth } from "../api/authStore";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Logo } from "../components/Logo";
import { AlertCircle } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    };

    try {
      const response = await signin(payload);
      saveAuth(response.token);
      navigate("/feed");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c2cfbc]/40 via-white to-[#3d7680]/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <Card className="border-teal-100/50 shadow-lg">
          <CardContent className="p-7 space-y-5">
            <div>
              <h1 className="text-xl font-semibold text-[#1f453f]">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue to your calm feed.</p>
            </div>

            {error && (
              <div className="flex gap-2 items-start rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-[#1f453f]">Email</label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="bg-white/90 border-teal-100 focus-visible:ring-[#3d7680]/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#1f453f]">Password</label>
                <Input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="bg-white/90 border-teal-100 focus-visible:ring-[#3d7680]/40"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#1f453f] to-[#3d7680] hover:from-[#183632] hover:to-[#335f66] text-white"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="text-[#3d7680] hover:underline font-medium">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
