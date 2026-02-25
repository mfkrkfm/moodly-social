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
      <div className="min-h-screen bg-gradient-to-br from-surface-tint via-background to-mood-calm-bg p-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-tint via-background to-mood-calm-bg">
      <header className="sticky top-0 z-10 border-b border-surface-border-soft bg-surface-card-80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-brand-title">Your profile</h1>
            <p className="text-xs text-muted-foreground">@{session?.username || profile?.username}</p>
          </div>
          <Link to="/feed" className="text-sm text-brand-link hover:underline font-medium">
            Back to feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {error && (
          <div className="rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        <Card className="border-surface-border-soft shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-accent flex items-center justify-center">
                {profile?.authorPicture?.url ? (
                  <MediaImage url={profile.authorPicture.url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-title font-semibold text-xl">{(profile?.username || "?")[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-title">{profile?.username}</p>
                <p className="text-xs text-muted-foreground">Followers {profile?.followersCount ?? 0} • Following {profile?.followingCount ?? 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-surface-border bg-surface-card-80 px-3 py-2 text-xs hover:bg-accent">
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  Upload
                </label>
                <Button variant="outline" onClick={onDeletePicture} className="border-surface-border-strong">
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-surface-border-soft shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">First name</label>
                <Input
                  value={form.firstName}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="mt-1 bg-surface-card-80 border-surface-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Last name</label>
                <Input
                  value={form.lastName}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="mt-1 bg-surface-card-80 border-surface-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Bio</label>
              <textarea
                value={form.bio}
                maxLength={500}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="mt-1 w-full min-h-[100px] rounded-md border border-surface-border bg-surface-card-80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus-accent"
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
                  className="mt-1 bg-surface-card-80 border-surface-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Mood</label>
                <div className="mt-1">
                  <Select value={form.mood} onValueChange={(v) => setForm((f) => ({ ...f, mood: v }))}>
                    <SelectTrigger className="bg-surface-card-80 border-surface-border">
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
              className="w-full bg-gradient-to-r from-primary to-brand-secondary hover:from-brand-primary-hover hover:to-brand-secondary-hover text-primary-foreground"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
