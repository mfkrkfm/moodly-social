import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFollowing } from "../api/profileApi.js";
import { MediaImage } from "../components/MediaImage.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";

function Avatar({ url, fallback }) {
  return (
    <div className="h-10 w-10 overflow-hidden rounded-full bg-black/10 flex items-center justify-center">
      {url ? (
        <MediaImage
          url={url}
          alt={fallback}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-black/70 text-sm font-semibold">
          {(fallback || "?")[0]?.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function FollowingPage() {
  const { username } = useParams();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const data = await getFollowing(username);
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load following");
      }
    })();
  }, [username]);

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">Following</h1>
            <p className="text-xs text-black/55">@{username}</p>
          </div>
          <Link
            to={`/u/${encodeURIComponent(username)}`}
            className="control-pill"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-3 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <Card className="glass-hover">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-black/65">
                This user is not following anyone yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          items.map((u) => (
            <Card key={u.username} className="glass-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar url={u.avatarUrl} fallback={u.username} />
                <div className="flex-1">
                  <Link
                    to={`/u/${encodeURIComponent(u.username)}`}
                    className="text-sm font-medium text-black/85 hover:underline"
                  >
                    @{u.username}
                  </Link>
                  <p className="text-xs text-black/55">
                    {`${u.name || ""} ${u.surname || ""}`.trim()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
