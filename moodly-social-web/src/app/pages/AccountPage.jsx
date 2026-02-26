import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAccount, updateAccount } from "../api/accountApi.js";
import { getSession, clearAuth } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

function extractProblem(err) {
  const d = err?.details;
  if (d && typeof d === "object") return d;

  const tryParse = (v) => {
    if (!v || typeof v !== "string") return null;
    try {
      const obj = JSON.parse(v);
      return obj && typeof obj === "object" ? obj : null;
    } catch {
      return null;
    }
  };

  return tryParse(err?.details) || tryParse(err?.message) || null;
}

function formatProblemMessage(problem, fallback) {
  if (!problem || typeof problem !== "object") return fallback;
  if (typeof problem.detail === "string" && problem.detail.trim()) return problem.detail;
  if (typeof problem.title === "string" && problem.title.trim()) return problem.title;
  return fallback;
}

export function AccountPage() {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState(() => getSession());
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  async function load() {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const a = await getAccount();
      setAccount(a);
      setForm({
        username: a.username || "",
        email: a.email || "",
        newPassword: "",
      });
    } catch (e) {
      if (e instanceof HttpError) {
        const problem = extractProblem(e);
        const status = problem?.status ?? e.status;

        if (status === 401) {
          clearAuth();
          navigate("/login", { replace: true });
          return;
        }

        setError(formatProblemMessage(problem, e.message || "Failed to load account"));
        return;
      }

      setError(e?.message || "Failed to load account");
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
    setSuccess(null);
    setFieldErrors({});
    try {
      const updated = await updateAccount({
        username: form.username.trim(),
        email: form.email.trim(),
        newPassword: form.newPassword ? form.newPassword : undefined,
      });
      setAccount(updated);
      setForm((f) => ({ ...f, newPassword: "" }));

      // Update session in localStorage with new username and email
      const newSession = {
        ...getSession(),
        username: updated.username,
        email: updated.email,
      };
      saveAuthSession(newSession);
      setSessionState(newSession);

      setSuccess("Account updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      if (e instanceof HttpError) {
        const problem = extractProblem(e);
        const status = problem?.status ?? e.status;

        if (status === 401) {
          clearAuth();
          navigate("/login", { replace: true });
          return;
        }

        if (problem?.errors && typeof problem.errors === "object") {
          const normalized = {};

          if (problem.errors.username) {
            normalized.username = "Username must be between 4 and 50 characters.";
          }

          if (problem.errors.email) {
            normalized.email = "Enter a valid email address (max 100 characters).";
          }

          if (problem.errors.newPassword) {
            normalized.newPassword =
              "Password must be 8–100 characters and include uppercase, lowercase, number and special character (no spaces).";
          }

          setFieldErrors(normalized);
          setError("Please fix the highlighted fields.");
          return;
        }

        setError("Failed to update account.");
        return;
      }

      setError(e?.message || "Failed to update account");
    } finally {
      setSaving(false);
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
            <h1 className="text-lg font-semibold text-black/90">Account</h1>
            <p className="text-xs text-black/55">@{sessionState?.username || account?.username}</p>
          </div>
          <Link
            to="/feed"
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/60 px-3 text-xs font-medium text-black/75 transition hover:bg-black/5"
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

        {success && (
          <div className="rounded-2xl border border-green-300 bg-green-50/95 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <Card className="glass-hover">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="field-label">Username</label>
              <Input
                value={form.username}
                minLength={4}
                maxLength={50}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className={`mt-1 ${fieldErrors?.username ? "border-error-border focus-visible:ring-error-border" : ""}`}
              />
              {fieldErrors?.username && (
                <p className="mt-1 text-xs text-error-text">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label className="field-label">Email</label>
              <Input
                value={form.email}
                maxLength={100}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={`mt-1 ${fieldErrors?.email ? "border-error-border focus-visible:ring-error-border" : ""}`}
              />
              {fieldErrors?.email && (
                <p className="mt-1 text-xs text-error-text">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="field-label">New password (optional)</label>
              <Input
                type="password"
                value={form.newPassword}
                minLength={8}
                maxLength={100}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                className={`mt-1 ${fieldErrors?.newPassword ? "border-error-border focus-visible:ring-error-border" : ""}`}
                placeholder="Leave empty to keep current password"
              />
              {fieldErrors?.newPassword && (
                <p className="mt-1 text-xs text-error-text">{fieldErrors.newPassword}</p>
              )}
            </div>

            <Button onClick={onSave} disabled={saving} className="primary-action w-full">
              {saving ? "Saving…" : "Save"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}