import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listFeed,
  createPost,
  like,
  unlike,
  addComment,
  replyToComment,
  updatePost,
  updateComment,
  deletePost,
  listComments,
} from "../api/postsApi.js";
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

  function countComments(nodes) {
    if (!Array.isArray(nodes)) return 0;
    return nodes.reduce((total, node) => total + 1 + countComments(node.replies), 0);
  }

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

  async function handleCreate({ content, mood, files }) {
    setPosting(true);
    try {
      const created = await createPost({ content, mood, files });
      setError(null);
      setPosts((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const problem = extractProblem(err);
      const detail = problem?.detail || "";

      if (detail.includes("Daily post limit")) {
        const friendly = "You’ve reached your daily limit of 3 posts. Come back tomorrow ✨";
        setError(friendly);
        throw new Error(friendly);
      }

      if (detail) {
        setError(detail);
        throw new Error(detail);
      }

      const fallback = err?.message || "Failed to create post";
      setError(fallback);
      throw new Error(fallback);
    } finally {
      setPosting(false);
    }
  }

  async function refreshComments(postId) {
    try {
      const comments = await listComments(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments, commentsCount: countComments(comments) } : p
        )
      );
      return comments;
    } catch {
      return [];
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
      await refreshComments(postId);
    } catch (err) {
      setError(err?.message || "Failed to add comment");
    }
  }

  async function handleReplyComment(postId, parentCommentId, content) {
    try {
      await replyToComment(postId, parentCommentId, content);
      await refreshComments(postId);
    } catch (err) {
      setError(err?.message || "Failed to reply");
    }
  }

  async function handleEditPost(postId, content) {
    const existing = posts.find((post) => post.id === postId);
    if (!existing) return;

    try {
      const updated = await updatePost(postId, { content, mood: existing.mood });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                ...updated,
                comments: Array.isArray(updated?.comments) ? updated.comments : post.comments,
              }
            : post
        )
      );
    } catch (err) {
      setError(err?.message || "Failed to edit post");
    }
  }

  async function handleEditComment(postId, commentId, content) {
    try {
      await updateComment(postId, commentId, content);
      await refreshComments(postId);
    } catch (err) {
      setError(err?.message || "Failed to edit comment");
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

            <Link
              to="/account"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/60 px-3 text-xs font-medium text-black/75 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              Account
            </Link>

            {(session?.roles || []).includes("ROLE_ADMIN") && (
              <Link
                to="/admin/users"
                className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/60 px-3 text-xs font-medium text-black/75 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                Admin
              </Link>
            )}

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
                onLoadComments={refreshComments}
                onAddComment={handleAddComment}
                onReplyComment={handleReplyComment}
                onEditPost={handleEditPost}
                onEditComment={handleEditComment}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
