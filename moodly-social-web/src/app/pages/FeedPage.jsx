import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listFeed, createPost, like, unlike, addComment, deletePost, listComments } from "../api/postsApi.js";
import { getSession, clearAuth } from "../api/authStore.js";
import { HttpError } from "../api/http.js";
import { Logo } from "../components/Logo.jsx";
import { PostComposer } from "../components/PostComposer.jsx";
import { PostCard } from "../components/PostCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Button } from "../components/ui/button.jsx";

export function FeedPage() {
  const session = useMemo(() => getSession(), []);
  const currentUsername = session?.username || null;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await listFeed();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate({ content, mood, files }) {
    setPosting(true);
    try {
      const created = await createPost({ content, mood, files });
      setError(null);
      setPosts((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else setError("Failed to create post");
      throw err;
    } finally {
      setPosting(false);
    }
  }

  async function refreshComments(postId) {
    try {
      const comments = await listComments(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments, commentsCount: p.commentsCount } : p))
      );
    } catch {
    }
  }

  async function handleToggleLike(post) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== post.id) return p;
        const liked = !p.likedByMe;
        return {
          ...p,
          likedByMe: liked,
          likesCount: Math.max(0, (p.likesCount || 0) + (liked ? 1 : -1)),
        };
      })
    );

    try {
      const res = post.likedByMe ? await unlike(post.id) : await like(post.id);
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, likedByMe: res.liked, likesCount: res.likesCount } : p))
      );
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    }
  }

  async function handleAddComment(postId, content) {
    try {
      await addComment(postId, content);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
      );
      await refreshComments(postId);
    } catch (err) {
      setError(err?.message || "Failed to add comment");
    }
  }

  async function handleDelete(postId) {
    const prev = posts;
    setPosts((p) => p.filter((x) => x.id !== postId));
    try {
      await deletePost(postId);
    } catch (err) {
      setPosts(prev);
      setError(err?.message || "Failed to delete post");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/60 px-3 text-xs font-medium text-black/75 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              Profile
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                clearAuth();
                window.location.href = "/login";
              }}
              className="h-9 rounded-full border-black/10 bg-white/60 px-3 text-xs text-black/75 transition hover:bg-black/5 active:scale-95"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-5 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        <PostComposer onCreate={handleCreate} loading={posting} />

        {loading ? (
          <LoadingState />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                currentUsername={currentUsername}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
