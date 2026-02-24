import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../api/authStore";
import { getMe, updateMe, type UpdateProfileRequest, type UserResponse } from "../api/userApi";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Logo } from "../components/Logo";
import { AlertCircle, LogOut, ArrowLeft } from "lucide-react";

export function ProfilePage() {
  const navigate = useNavigate();
  const token = getAuth();
  const [me, setMe] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!token) return;
        const data = await getMe(token);
        if (alive) setMe(data);
      } catch (err: any) {
        if (alive) setError(err?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const initials = useMemo(() => {
    if (!me) return "?";
    const a = (me.username?.[0] || "?").toUpperCase();
    return a;
  }, [me]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !me) return;
    setError(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const payload: UpdateProfileRequest = {
      username: String(form.get("username") || "").trim(),
      email: String(form.get("email") || "").trim(),
      newPassword: String(form.get("newPassword") || "").trim() || undefined,
    };

    try {
      const updated = await updateMe(token, payload);
      setMe(updated);
      navigate("/feed");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c2cfbc]/40 via-white to-[#3d7680]/10">
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/feed">
                <ArrowLeft className="w-4 h-4" />
                Feed
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="border-teal-100/50 shadow-lg">
          <CardContent className="p-7">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3d7680] to-[#1f453f] flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold">{initials}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#1f453f]">@{me?.username}</p>
                    <p className="text-sm text-muted-foreground">{me?.email}</p>
                  </div>
                </div>

                {error && (
                  <div className="flex gap-2 items-start rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={onSave} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#1f453f]">Username</label>
                    <Input
                      name="username"
                      required
                      minLength={4}
                      defaultValue={me?.username || ""}
                      className="bg-white/90 border-teal-100 focus-visible:ring-[#3d7680]/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-[#1f453f]">Email</label>
                    <Input
                      name="email"
                      type="email"
                      required
                      defaultValue={me?.email || ""}
                      className="bg-white/90 border-teal-100 focus-visible:ring-[#3d7680]/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-[#1f453f]">New password (optional)</label>
                    <Input
                      name="newPassword"
                      type="password"
                      placeholder="Leave blank to keep current"
                      className="bg-white/90 border-teal-100 focus-visible:ring-[#3d7680]/40"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must include digit, lowercase, uppercase, special char, and no spaces.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-[#1f453f] to-[#3d7680] hover:from-[#183632] hover:to-[#335f66] text-white"
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
