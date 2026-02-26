import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession } from "../api/authStore.js";
import { adminGetUser, adminUpdateUserRoles } from "../api/adminApi.js";
import { HttpError } from "../api/http.js";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";

const ALL_ROLES = ["ROLE_ADMIN", "ROLE_CLIENT"];

export function AdminUserDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const session = useMemo(() => getSession(), []);
  const isAdmin = (session?.roles || []).includes("ROLE_ADMIN");

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) nav("/feed", { replace: true });
  }, [isAdmin, nav]);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const u = await adminGetUser(id);
        setUser(u);
        // backend shape not specified in your contract for admin dto; we only use roles array if present
        const current = Array.isArray(u?.appUserRoles) ? u.appUserRoles : Array.isArray(u?.roles) ? u.roles : [];
        setRoles(current);
      } catch (e) {
        setError(e?.message || "Failed to load user");
      }
    })();
  }, [id]);

  function toggleRole(r) {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const next = roles.length ? roles : ["ROLE_CLIENT"]; // must be non-empty per contract
      const updated = await adminUpdateUserRoles(id, next);
      setUser(updated);
      const current = Array.isArray(updated?.appUserRoles)
        ? updated.appUserRoles
        : Array.isArray(updated?.roles)
          ? updated.roles
          : next;
      setRoles(current);
    } catch (e) {
      if (e instanceof HttpError && e.details?.errors) setError(Object.values(e.details.errors).join("\n"));
      else setError(e?.message || "Failed to update roles");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">Admin • User</h1>
            <p className="text-xs text-black/55">id: {id}</p>
          </div>
          <Link to="/admin/users" className="control-pill">Back</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-5 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        <Card className="glass-hover">
          <CardContent className="p-6 space-y-3">
            <div className="text-sm text-black/75">
              <div><span className="text-black/50">Username:</span> {user?.username || "—"}</div>
              <div><span className="text-black/50">Email:</span> {user?.email || "—"}</div>
            </div>

            <div className="pt-2">
              <p className="field-label mb-2">Roles (must be non-empty)</p>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    className={`control-pill ${roles.includes(r) ? "bg-black text-white border-black/10" : ""}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={save} disabled={saving} className="primary-action w-full">
              {saving ? "Saving…" : "Save roles"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}