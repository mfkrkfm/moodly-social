import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../api/authApi.js";
import { saveAuthSession } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Logo } from "../components/Logo.jsx";

function toStringSafe(v) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function normalizeBackendErrors(details) {
  const fieldErrors = {};
  const global = [];

  const status = details?.status;
  const title = toStringSafe(details?.title);
  const detail = toStringSafe(details?.detail);

  const errors = details?.errors;
  if (errors && typeof errors === "object") {
    for (const [key, val] of Object.entries(errors)) {
      if (!val) continue;
      const msg = Array.isArray(val)
        ? val.map(toStringSafe).filter(Boolean).join(", ")
        : toStringSafe(val);

      if (key === "global" || key === "message") global.push(msg);
      else fieldErrors[key] = msg;
    }
  }

  if (global.length === 0) {
    if (detail) global.push(detail);
    else if (title) global.push(title);
  }

  return { status, fieldErrors, global: global.filter(Boolean) };
}

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState({ username: "", password: "" });

  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const hasFieldErrors = useMemo(
    () => Object.keys(fieldErrors).length > 0,
    [fieldErrors]
  );

  function setField(name, value) {
    setValues((p) => ({ ...p, [name]: value }));

    setFieldErrors((p) => {
      if (!p?.[name]) return p;
      const next = { ...p };
      delete next[name];
      return next;
    });

    if (globalError) setGlobalError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});
    setLoading(true);

    const payload = {
      username: values.username.trim(),
      password: values.password,
    };

    const clientFields = {};
    if (!payload.username) clientFields.username = "Username is required.";
    if (!payload.password) clientFields.password = "Password is required.";

    if (Object.keys(clientFields).length) {
      setFieldErrors(clientFields);
      setLoading(false);
      return;
    }

    try {
      const res = await signin(payload);
      saveAuthSession(res);
      navigate("/feed");
    } catch (err) {
      if (err instanceof HttpError) {
        const status = err.status ?? err.details?.status;

        if (status === 401) {
          setGlobalError("Incorrect username or password.");
          return;
        }

        const normalized = normalizeBackendErrors(err.details);

        if (
          normalized &&
          (Object.keys(normalized.fieldErrors).length ||
            normalized.global.length)
        ) {
          setFieldErrors(normalized.fieldErrors || {});
          setGlobalError(normalized.global?.[0] || "Sign-in failed.");
          return;
        }

        setGlobalError(err.message || "Sign-in failed.");
        return;
      }

      setGlobalError(
        toStringSafe(err?.message) ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <Card className="glass">
          <CardContent className="p-7">
            <h2 className="mb-1 text-xl font-semibold text-black/90">
              Welcome back
            </h2>
            <p className="mb-6 text-sm text-black/55">
              Sign in to continue your mindful feed.
            </p>

            {!!globalError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text"
              >
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-black/60">Username</label>
                <Input
                  name="username"
                  autoComplete="username"
                  value={values.username}
                  onChange={(e) =>
                    setField("username", e.target.value)
                  }
                  aria-invalid={!!fieldErrors.username}
                  className={`mt-1 ${
                    fieldErrors.username
                      ? "border-error-border focus-visible:ring-error-border"
                      : ""
                  }`}
                  placeholder="yourname"
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-error-text">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-black/60">Password</label>
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(e) =>
                    setField("password", e.target.value)
                  }
                  aria-invalid={!!fieldErrors.password}
                  className={`mt-1 ${
                    fieldErrors.password
                      ? "border-error-border focus-visible:ring-error-border"
                      : ""
                  }`}
                  placeholder="••••••••"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-error-text">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-xl bg-black text-white transition hover:bg-black/90 disabled:bg-black/10 disabled:text-black/40"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-center text-sm text-black/55">
                New here?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-black/85 hover:underline"
                >
                  Create an account
                </Link>
              </p>

              {hasFieldErrors && !globalError ? (
                <p className="text-center text-xs text-black/45">
                  Please fix the highlighted fields.
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}