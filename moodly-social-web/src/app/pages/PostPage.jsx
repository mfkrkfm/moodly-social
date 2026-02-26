import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPost, listComments, like, unlike, addComment, replyToComment, updatePost, updateComment, deletePost } from "../api/postsApi.js";
import { getSession } from "../api/authStore.js";
import { getAuthorAuraColor } from "../constants/moods.js";
import { PostCard } from "../components/PostCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { HttpError } from "../api/http.js";

export function PostPage() {
  const { postId } = useParams();
  const session = getSession();
  const currentUsername = session?.username || null;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ERROR_MAP = {
    "User not found": "This user's profile was not found.",
    "Profile not found": "This user's profile was not found.",
    "Post not found": "This post no longer exists or has been deleted.",
  };

  function friendlyError(err, fallback) {
    const msg = err?.message || "";
    return ERROR_MAP[msg] || msg || fallback;
  }

  function countComments(nodes) {
    if (!Array.isArray(nodes)) return 0;
    return nodes.reduce((total, node) => total + 1 + countComments(node.replies), 0);
  }

  async function refreshComments() {
    try {
      const comments = await listComments(postId);
      setPost((p) => (p ? { ...p, comments, commentsCount: countComments(comments) } : p));
      return comments;
    } catch {
      return [];
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const p = await getPost(postId);
      setPost(p);
    } catch (e) {
      setError(friendlyError(e, "Failed to load post"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [postId]);

  async function handleToggleLike(p) {
    // optimistic
    setPost((prev) => {
      if (!prev) return prev;
      const liked = !prev.likedByMe;
      return {
        ...prev,
        likedByMe: liked,
        likesCount: Math.max(0, (prev.likesCount || 0) + (liked ? 1 : -1)),
      };
    });

    try {
      const res = p.likedByMe ? await unlike(p.id) : await like(p.id);
      setPost((prev) => (prev ? { ...prev, likedByMe: res.liked, likesCount: res.likesCount } : prev));
    } catch {
      setPost(p); // rollback
    }
  }

  async function handleAddComment(_, content) {
    try {
      await addComment(postId, content);
      await refreshComments();
    } catch (e) {
      setError(friendlyError(e, "Failed to add comment"));
    }
  }

  async function handleReplyComment(_, parentCommentId, content) {
    try {
      await replyToComment(postId, parentCommentId, content);
      await refreshComments();
    } catch (e) {
      setError(friendlyError(e, "Failed to reply"));
    }
  }

  async function handleEditPost(_, content) {
    if (!post) return;
    try {
      const updated = await updatePost(postId, { content, mood: post.mood });
      setPost((prev) =>
        prev
          ? { ...prev, ...updated, comments: Array.isArray(updated?.comments) ? updated.comments : prev.comments }
          : prev
      );
    } catch (e) {
      setError(friendlyError(e, "Failed to edit post"));
    }
  }

  async function handleEditComment(_, commentId, content) {
    try {
      await updateComment(postId, commentId, content);
      await refreshComments();
    } catch (e) {
      setError(friendlyError(e, "Failed to edit comment"));
    }
  }

  async function handleDelete() {
    try {
      await deletePost(postId);
      window.location.href = "/feed";
    } catch (e) {
      setError(friendlyError(e, "Failed to delete post"));
    }
  }

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">Post</h1>
            <p className="text-xs text-black/55">#{postId}</p>
          </div>
          <Link
            to="/feed"
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/60 px-3 text-xs font-medium text-black/75 transition hover:bg-black/5"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-5 px-3 py-5 sm:px-4 sm:py-6">
        {error && (
          <div className="rounded-2xl border border-error-border bg-error-bg/95 px-4 py-3 text-sm text-error-text whitespace-pre-line">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : post ? (
          <PostCard
            post={post}
            currentUsername={currentUsername}
            authorAuraColor={post.mood ? getAuthorAuraColor([post.mood]) : null}
            onToggleLike={handleToggleLike}
            onLoadComments={refreshComments}
            onAddComment={handleAddComment}
            onReplyComment={handleReplyComment}
            onEditPost={handleEditPost}
            onEditComment={handleEditComment}
            onDelete={handleDelete}
          />
        ) : null}
      </main>
    </div>
  );
}