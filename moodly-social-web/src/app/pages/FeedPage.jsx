import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Logo } from "../components/Logo.jsx";
import { PostComposer } from "../components/PostComposer.jsx";
import { PostCard } from "../components/PostCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { getPublicProfile } from "../api/publicApi.js";
import { getAuthorAuraColor } from "../constants/moods.js";

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

export function FeedPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);
  const currentUsername = session?.username || null;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  // ONE search bar only (posts + @user lookup)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // user lookup result (triggered only when search starts with "@")
  const [userResult, setUserResult] = useState(null);
  const [userSearching, setUserSearching] = useState(false);
  const [userSearchError, setUserSearchError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const isUserMode = useMemo(() => search.trim().startsWith("@"), [search]);
  const userQuery = useMemo(() => (isUserMode ? search.trim().slice(1) : ""), [search, isUserMode]);

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
      const problem = extractProblem(err);
      const status = problem?.status ?? err?.status;
      if (status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }
      setError(problem?.detail || err?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search user when in "@mode"
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!isUserMode) {
        setUserSearching(false);
        setUserSearchError(null);
        setUserResult(null);
        return;
      }

      const q = userQuery.trim();
      if (!q) {
        setUserSearching(false);
        setUserSearchError(null);
        setUserResult(null);
        return;
      }

      setUserSearching(true);
      setUserSearchError(null);
      setUserResult(null);

      try {
        const profile = await getPublicProfile(q);
        if (!alive) return;
        setUserResult(profile);
      } catch (e) {
        if (!alive) return;
        const problem = extractProblem(e);
        const msg =
          problem?.status === 404 ? "User not found" : problem?.detail || e?.message || "User not found";
        setUserSearchError(msg);
      } finally {
        if (!alive) return;
        setUserSearching(false);
      }
    }

    const t = setTimeout(run, 250); // small debounce for @user search
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [isUserMode, userQuery]);

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

      const status = problem?.status ?? err?.status;
      if (status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        throw new Error("Unauthorized");
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
      const problem = extractProblem(err);
      setError(problem?.detail || err?.message || "Failed to add comment");
    }
  }

  async function handleReplyComment(postId, parentCommentId, content) {
    try {
      await replyToComment(postId, parentCommentId, content);
      await refreshComments(postId);
    } catch (err) {
      const problem = extractProblem(err);
      setError(problem?.detail || err?.message || "Failed to reply");
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
      const problem = extractProblem(err);
      setError(problem?.detail || err?.message || "Failed to edit post");
    }
  }

  async function handleEditComment(postId, commentId, content) {
    try {
      await updateComment(postId, commentId, content);
      await refreshComments(postId);
    } catch (err) {
      const problem = extractProblem(err);
      setError(problem?.detail || err?.message || "Failed to edit comment");
    }
  }

  async function handleDelete(postId) {
    const prev = posts;
    setPosts((p) => p.filter((x) => x.id !== postId));
    try {
      await deletePost(postId);
    } catch (err) {
      setPosts(prev);
      const problem = extractProblem(err);
      setError(problem?.detail || err?.message || "Failed to delete post");
    }
  }

  // Compute dominant mood border color per author
  const authorMoodColors = useMemo(() => {
    const byAuthor = {};
    for (const p of posts) {
      const author = p.authorUsername;
      if (!author) continue;
      if (!byAuthor[author]) byAuthor[author] = [];
      byAuthor[author].push(p.mood);
    }
    const colors = {};
    for (const [author, moods] of Object.entries(byAuthor)) {
      colors[author] = getAuthorAuraColor(moods);
    }
    return colors;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    // if user mode, don’t filter posts (you can change this if you want)
    if (isUserMode) return posts;

    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((p) => {
      const content = String(p?.content || "").toLowerCase();
      const author = String(p?.authorUsername || "").toLowerCase();
      const mood = String(p?.mood || "").toLowerCase();
      return content.includes(q) || author.includes(q) || mood.includes(q);
    });
  }, [posts, debouncedSearch, isUserMode]);

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center gap-3 px-3 py-3 sm:px-4">
          <Link to="/feed" className="inline-flex items-center shrink-0">
            <Logo />
          </Link>

          {/* ONE search bar */}
          <div className="flex flex-1 items-center gap-2">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts or @username…"
              className="h-9 w-full rounded-full border-black/10 bg-white/70 px-4 text-sm text-black/80 placeholder:text-black/40 shadow-sm"
            />

            {search.trim() && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setSearch("")}
                className="h-9 rounded-full border-black/10 bg-white/60 px-3 text-xs text-black/75 transition hover:bg-black/5 active:scale-95"
                aria-label="Clear search"
                title="Clear"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
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

        {/* User search result area (NO second input) */}
        {isUserMode && (
          <div className="glass rounded-2xl border border-black/10 p-4">
            {userSearching ? (
              <p className="text-sm text-black/60">Searching user…</p>
            ) : userSearchError ? (
              <p className="text-sm text-error-text">{userSearchError}</p>
            ) : userResult ? (
              <Link
                to={`/u/${encodeURIComponent(userResult.username)}`}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white/60 p-3 hover:bg-black/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black/85">@{userResult.username}</p>
                  <p className="truncate text-xs text-black/55">
                    {userResult.firstName || ""} {userResult.lastName || ""}
                  </p>
                </div>
                <span className="text-xs text-black/55">{userResult.followersCount} followers</span>
              </Link>
            ) : (
              <p className="text-sm text-black/60">Type a username like @anna</p>
            )}
          </div>
        )}

        <PostComposer onCreate={handleCreate} loading={posting} />

        {loading ? (
          <LoadingState />
        ) : filteredPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filteredPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                currentUsername={currentUsername}
                authorMoodColor={authorMoodColors[p.authorUsername]}
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