import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, updateMyProfile, uploadProfilePicture, deleteProfilePicture } from "../api/profileApi.js";
import { getSession } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import { moodOptions } from "../constants/moods.js";
import { MediaImage } from "../components/MediaImage.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
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
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-[680px]">
          <p className="text-sm text-black/55">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">Your profile</h1>
            <p className="text-xs text-black/55">@{session?.username || profile?.username}</p>
          </div>
          <Link
            to="/feed"
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/60 px-3 text-xs font-medium text-black/75 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Back to feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-5 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        <Card className="glass-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-black/10 flex items-center justify-center">
                {profile?.authorPicture?.url ? (
                  <MediaImage url={profile.authorPicture.url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black/80 font-semibold text-xl">{(profile?.username || "?")[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-black/85">{profile?.username}</p>
                <p className="text-xs text-black/55">Followers {profile?.followersCount ?? 0} • Following {profile?.followingCount ?? 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="control-pill cursor-pointer active:scale-95">
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  Upload
                </label>
                <Button variant="outline" onClick={onDeletePicture} className="control-pill">
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">First name</label>
                <Input
                  value={form.firstName}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="field-label">Last name</label>
                <Input
                  value={form.lastName}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Bio</label>
              <Textarea
                value={form.bio}
                maxLength={500}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="mt-1 min-h-[100px]"
                placeholder="Tell people what you’re about…"
              />
              <p className="mt-1 text-xs text-black/50">{form.bio.length}/500</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Birth date</label>
                <Input
                  type="date"
                  value={form.birthDate || ""}
                  onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="field-label">Mood</label>
                <div className="mt-1">
                  <Select value={form.mood} onValueChange={(v) => setForm((f) => ({ ...f, mood: v }))}>
                    <SelectTrigger>
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
              className="primary-action w-full"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
