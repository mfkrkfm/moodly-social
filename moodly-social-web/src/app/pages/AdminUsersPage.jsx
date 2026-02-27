import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSession } from "../api/authStore.js";
import { adminListUsers, adminDeleteUser } from "../api/adminApi.js";
import { HttpError } from "../api/http.js";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { ConfirmDialog } from "../components/ui/confirm-dialog.jsx";

export function AdminUsersPage() {
  const nav = useNavigate();
  const session = useMemo(() => getSession(), []);
  const isAdmin = (session?.roles || []).includes("ROLE_ADMIN");

  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (!isAdmin) nav("/feed", { replace: true });
  }, [isAdmin, nav]);

  async function load() {
    setError(null);
    try {
      const data = await adminListUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load users");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function doDelete(id) {
    setError(null);
    try {
      await adminDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      if (e instanceof HttpError && e.details?.errors) setError(Object.values(e.details.errors).join("\n"));
      else setError(e?.message || "Failed to delete user");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">Admin • Users</h1>
            <p className="text-xs text-black/55">Manage roles & accounts</p>
          </div>
          <Link to="/feed" className="control-pill">Back</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-3 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        {users.map((u) => (
          <Card key={u.id} className="glass-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <Link
                  to={`/admin/users/${u.id}`}
                  className="text-sm font-medium text-black/85 hover:underline"
                >
                  {u.username} (id: {u.id})
                </Link>
                <p className="text-xs text-black/55">{u.email}</p>
              </div>
              <Button
                variant="outline"
                className="control-pill"
                onClick={() => setConfirm({ id: u.id, username: u.username })}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}

        <ConfirmDialog
          open={!!confirm}
          title="Delete user?"
          description={confirm ? `Delete ${confirm.username}? This cannot be undone.` : ""}
          confirmText="Delete"
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            const c = confirm;
            setConfirm(null);
            if (c) await doDelete(c.id);
          }}
        />
      </main>
    </div>
  );
}