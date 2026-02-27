import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPublicPost } from "../api/profileApi.js";
import { HttpError } from "../api/http.js";
import {
  addComment,
  deletePost,
  hydratePostLikedByMe,
  like,
  listComments,
  replyToComment,
  unlike,
  updateComment,
  updatePost,
} from "../api/postsApi.js";
import { getSession } from "../api/authStore.js";
import { PostCard } from "../components/PostCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";

export function PublicPostPage() {
  const { username, postId } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const currentUsername = session?.username || null;
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  function countComments(nodes) {
    if (!Array.isArray(nodes)) return 0;
    return nodes.reduce(
      (total, node) => total + 1 + countComments(node.replies),
      0,
    );
  }

  async function refreshComments() {
    try {
      const comments = await listComments(postId);
      setPost((prev) =>
        prev
          ? { ...prev, comments, commentsCount: countComments(comments) }
          : prev,
      );
      return comments;
    } catch {
      return [];
    }
  }

  async function handleToggleLike(p) {
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
      setPost((prev) =>
        prev
          ? { ...prev, likedByMe: res.liked, likesCount: res.likesCount }
          : prev,
      );
    } catch {
      setPost(p);
    }
  }

  async function handleAddComment(_, content) {
    try {
      await addComment(postId, content);
      await refreshComments();
    } catch (e) {
      setError(e?.message || "Failed to add comment");
    }
  }

  async function handleReplyComment(_, parentCommentId, content) {
    try {
      await replyToComment(postId, parentCommentId, content);
      await refreshComments();
    } catch (e) {
      setError(e?.message || "Failed to reply");
    }
  }

  async function handleEditPost(_, content) {
    setError(null);
    const currentMood = post?.mood;
    if (!currentMood) return;
    try {
      const updated = await updatePost(postId, { content, mood: currentMood });
      setPost((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              comments: Array.isArray(updated?.comments)
                ? updated.comments
                : prev.comments,
            }
          : prev,
      );
    } catch (e) {
      setError(e?.message || "Failed to edit post");
    }
  }

  async function handleEditComment(_, commentId, content) {
    try {
      await updateComment(postId, commentId, content);
      await refreshComments();
    } catch (e) {
      setError(e?.message || "Failed to edit comment");
    }
  }

  async function handleDelete() {
    try {
      await deletePost(postId);
      navigate("/feed", { replace: true });
    } catch (e) {
      setError(e?.message || "Failed to delete post");
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getPublicPost(username, postId);
        const normalizedPost = await hydratePostLikedByMe(p, currentUsername);
        setPost(normalizedPost);
      } catch (e) {
        if (e instanceof HttpError && e.status === 404) {
          navigate("/404", { replace: true });
          return;
        }
        setError(e?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [username, postId, navigate, currentUsername]);

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-3 py-3 sm:px-4">
          <div>
            <h1 className="text-lg font-semibold text-black/90">Post</h1>
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
