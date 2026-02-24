import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/authApi";
import { saveAuth } from "../api/authStore";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Logo } from "../components/Logo";
import { AlertCircle } from "lucide-react";

function validatePassword(password: string) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  return regex.test(password);
}

export function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");

    if (!validatePassword(password)) {
      setLoading(false);
      setError(
        "Password must be 8+ characters and include uppercase, lowercase, number and special character."
      );
      return;
    }

    const payload = {
      username: String(form.get("username") || "").trim(),
      email: String(form.get("email") || "").trim(),
      password,
    };

    try {
      const response = await signup(payload);
      saveAuth(response.token);
      navigate("/profile");
    } catch (err: any) {
      setError(err?.message || "Signup failed");
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
              <h1 className="text-xl font-semibold text-[#1f453f]">Create account</h1>
              <p className="text-sm text-muted-foreground mt-1">Join Moodly for a calmer social experience.</p>
            </div>

            {error && (
              <div className="flex gap-2 items-start rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-[#1f453f]">Username</label>
                <Input
                  name="username"
                  required
                  minLength={4}
                  placeholder="yourname"
                  className="bg-white/90 border-teal-100 focus-visible:ring-[#3d7680]/40"
                />
              </div>

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
                <p className="text-xs text-muted-foreground">
                  Must be 8+ chars, include uppercase, lowercase, number & special character.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#1f453f] to-[#3d7680] hover:from-[#183632] hover:to-[#335f66] text-white"
              >
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-[#3d7680] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
