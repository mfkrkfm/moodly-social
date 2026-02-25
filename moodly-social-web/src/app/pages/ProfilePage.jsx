import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, updateMyProfile, uploadProfilePicture, deleteProfilePicture } from "../api/profileApi.js";
import { getSession } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import { moodOptions } from "../components/MoodBadge.jsx";
import { MediaImage } from "../components/MediaImage.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.jsx";

export function ProfilePage() {
  const session = useMemo(() => getSession(), []);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ firstName: "", lastName: "", bio: "", birthDate: "", mood: "CALM" });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const p = await getMyProfile();
      setProfile(p);
      setForm({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        bio: p.bio || "",
        birthDate: p.birthDate || "",
        mood: p.mood || "CALM",
      });
    } catch (err) {
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMyProfile({
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        bio: form.bio || null,
        birthDate: form.birthDate || null,
        mood: form.mood,
      });
      setProfile(updated);
    } catch (err) {
      if (err instanceof HttpError && err.details?.errors) setError(Object.values(err.details.errors).join("\n"));
      else setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const updated = await uploadProfilePicture(file);
      setProfile(updated);
    } catch (err) {
      setError(err?.message || "Failed to upload picture");
    } finally {
      e.target.value = "";
    }
  }

  async function onDeletePicture() {
    setError(null);
    try {
      const updated = await deleteProfilePicture();
      setProfile(updated);
    } catch (err) {
      setError(err?.message || "Failed to delete picture");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] via-white to-emerald-50 p-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] via-white to-emerald-50">
      <header className="sticky top-0 z-10 border-b border-emerald-100/60 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#1F453F]">Your profile</h1>
            <p className="text-xs text-muted-foreground">@{session?.username || profile?.username}</p>
          </div>
          <Link to="/feed" className="text-sm text-[#3C7680] hover:underline font-medium">
            Back to feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-line">
            {error}
          </div>
        )}

        <Card className="border-emerald-100/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
                {profile?.authorPicture?.url ? (
                  <MediaImage url={profile.authorPicture.url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#1F453F] font-semibold text-xl">{(profile?.username || "?")[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1F453F]">{profile?.username}</p>
                <p className="text-xs text-muted-foreground">Followers {profile?.followersCount ?? 0} • Following {profile?.followingCount ?? 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-emerald-100 bg-white/80 px-3 py-2 text-xs hover:bg-emerald-50">
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  Upload
                </label>
                <Button variant="outline" onClick={onDeletePicture} className="border-emerald-200">
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100/60 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">First name</label>
                <Input
                  value={form.firstName}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="mt-1 bg-white/80 border-emerald-100"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Last name</label>
                <Input
                  value={form.lastName}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="mt-1 bg-white/80 border-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Bio</label>
              <textarea
                value={form.bio}
                maxLength={500}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="mt-1 w-full min-h-[100px] rounded-md border border-emerald-100 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                placeholder="Tell people what you’re about…"
              />
              <p className="mt-1 text-xs text-muted-foreground">{form.bio.length}/500</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Birth date</label>
                <Input
                  type="date"
                  value={form.birthDate || ""}
                  onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                  className="mt-1 bg-white/80 border-emerald-100"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Mood</label>
                <div className="mt-1">
                  <Select value={form.mood} onValueChange={(v) => setForm((f) => ({ ...f, mood: v }))}>
                    <SelectTrigger className="bg-white/80 border-emerald-100">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              onClick={onSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#1F453F] to-[#3C7680] hover:from-[#16352F] hover:to-[#2F6068] text-white"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
