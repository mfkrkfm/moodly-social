import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicPost } from "../api/profileApi.js";
import { PostCard } from "../components/PostCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";

export function PublicPostPage() {
  const { username, postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getPublicPost(username, postId);
        setPost(p);
      } catch (e) {
        setError(e?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [username, postId]);

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">Post</h1>
            <p className="text-xs text-black/55">@{username}</p>
          </div>
          <Link to={`/u/${encodeURIComponent(username)}`} className="control-pill">Back</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-5 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        {loading ? <LoadingState /> : post ? <PostCard post={post} /> : null}
      </main>
    </div>
  );
}