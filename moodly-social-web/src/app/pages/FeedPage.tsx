import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { PostComposer } from "../components/PostComposer";
import { PostCard, type Post } from "../components/PostCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Button } from "../components/ui/button";
import { RefreshCw, LogOut, User } from "lucide-react";
import type { Mood } from "../components/MoodBadge";
import { clearAuth, getAuth } from "../api/authStore";
import { getMe } from "../api/userApi";
import { addComment, createPost, deletePost, listPosts, toggleLike } from "../api/postsApi";

function formatTimestamp(createdAtMs: number): string {
  const diff = Date.now() - createdAtMs;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(createdAtMs).toLocaleDateString();
}

export function FeedPage() {
  const navigate = useNavigate();
  const token = getAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meName, setMeName] = useState<string>("You");
  const [meId, setMeId] = useState<string>("me");

  // Load me
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) return;
      try {
        const me = await getMe(token);
        if (!alive) return;
        const display = me.username;
        setMeName(display);
        setMeId(String(me.id));
      } catch {
        // If token invalid, force logout
        clearAuth();
        navigate("/login", { replace: true });
      }
    })();

    return () => {
      alive = false;
    };
  }, [token, navigate]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listPosts(token);
      setPosts(res.posts || []);
    } catch (err: any) {
      setError(err?.message || "Could not load posts");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Create post
  const handlePost = async (content: string, mood: Mood, media: string[]) => {
    if (!token) return;
    setIsPosting(true);
    setError(null);
    try {
      const res = await createPost(token, { content, mood, media });
      setPosts((prev) => [res.post as any, ...prev]);
    } catch (err: any) {
      setError(err?.message || "Could not create post");
    } finally {
      setIsPosting(false);
    }
  };

  // Like/unlike
  const handleLike = async (postId: string) => {
    if (!token) return;
    // optimistic
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const likes = [...p.likes];
        const idx = likes.indexOf(meId);
        if (idx === -1) likes.push(meId);
        else likes.splice(idx, 1);
        return { ...p, likes };
      })
    );

    try {
      const res = await toggleLike(token, postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? (res.post as any) : p)));
    } catch {
      fetchPosts();
    }
  };

  // Add comment
  const handleComment = async (postId: string, content: string) => {
    if (!token) return;
    try {
      const res = await addComment(token, postId, content);
      setPosts((prev) => prev.map((p) => (p.id === postId ? (res.post as any) : p)));
    } catch (err: any) {
      setError(err?.message || "Could not add comment");
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!token) return;
    // optimistic
    const prev = posts;
    setPosts((p) => p.filter((x) => x.id !== postId));
    try {
      await deletePost(token, postId);
    } catch {
      setPosts(prev);
    }
  };

  function logout() {
    clearAuth();
    navigate("/login");
  }

  const postsWithTimestamp = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        timestamp: formatTimestamp(p.createdAt),
      })),
    [posts]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50/40">
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/profile">
                <User className="w-4 h-4" />
                {meName}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E4D4D]">Your feed</h1>
            <p className="text-sm text-muted-foreground mt-1">Mindful posts, mood-aware interactions.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            className="gap-2 border-teal-200 hover:bg-teal-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <PostComposer onPost={handlePost} isPosting={isPosting} />

        {error && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">{error}</div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : postsWithTimestamp.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {postsWithTimestamp.map((post) => (
              <PostCard
                key={post.id}
                post={post as any}
                currentUserId={meId}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
