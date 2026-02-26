import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getMoodVisual } from "../constants/moods.js";
import { listLikes } from "../api/postsApi.js";
import { MediaImage } from "./MediaImage.jsx";
import { MoodBadge } from "./MoodBadge.jsx";
import { Button } from "./ui/button.jsx";
import { Card, CardContent } from "./ui/card.jsx";
import { ConfirmDialog } from "./ui/confirm-dialog.jsx";
import { Input } from "./ui/input.jsx";
import { Textarea } from "./ui/textarea.jsx";

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

function initials(name) {
  if (!name) return "?";
  return name.slice(0, 1).toUpperCase();
}

export function PostCard({
  post,
  currentUsername,
  authorMoodColor,
  onToggleLike,
  onLoadComments,
  onAddComment,
  onReplyComment,
  onEditPost,
  onEditComment,
  onDelete,
}) {
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState(post.content || "");
  const [savingPostEdit, setSavingPostEdit] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Likes modal
  const [likesOpen, setLikesOpen] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likesError, setLikesError] = useState(null);
  const [likesUsers, setLikesUsers] = useState([]);

  const timestamp = useMemo(() => formatTime(post.createdAt), [post.createdAt]);
  const isOwn = currentUsername && post.authorUsername === currentUsername;
  const mood = getMoodVisual(post.mood);

  const moodBorderStyle = { borderColor: mood.color };
  const postCanSave =
    !!postDraft.trim() && postDraft.trim() !== (post.content || "").trim() && !savingPostEdit;

  const handleSavePostEdit = async () => {
    if (!postCanSave || !onEditPost) return;
    setSavingPostEdit(true);
    try {
      await onEditPost(post.id, postDraft.trim());
      setEditingPost(false);
    } finally {
      setSavingPostEdit(false);
    }
  };

  const handleCancelPostEdit = () => {
    setPostDraft(post.content || "");
    setEditingPost(false);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (!next || !onLoadComments) return;

    setLoadingComments(true);
    try {
      await onLoadComments(post.id);
    } finally {
      setLoadingComments(false);
    }
  };

  const openLikes = async () => {
    setLikesOpen(true);
    setLikesError(null);
    setLikesLoading(true);
    try {
      const users = await listLikes(post.id);
      setLikesUsers(Array.isArray(users) ? users : []);
    } catch (e) {
      setLikesUsers([]);
      setLikesError(e?.message || "Failed to load likes");
    } finally {
      setLikesLoading(false);
    }
  };

  return (
    <Card className="glass relative overflow-hidden border-2 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]" style={moodBorderStyle}>

      <CardContent className="relative space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-black/10 ring-2 ring-offset-1"
              style={{ '--tw-ring-color': authorMoodColor || '#9CA3AF' }}
            >
              {post.authorPicture?.url ? (
                <MediaImage
                  url={post.authorPicture.url}
                  alt={post.authorUsername}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-medium text-black/70">
                  {initials(post.authorUsername)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <Link
                to={`/u/${encodeURIComponent(post.authorUsername)}`}
                className="truncate text-sm font-semibold text-black/90 hover:underline"
              >
                {post.authorUsername}
              </Link>
              <p className="text-xs text-black/50">
                {timestamp}
                {post.edited ? " • edited" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MoodBadge mood={post.mood} size="sm" />
            {isOwn && (
              <button
                onClick={() => {
                  setPostDraft(post.content || "");
                  setEditingPost((value) => !value);
                }}
                title={editingPost ? "Cancel edit" : "Edit post"}
                className="rounded-full p-2 text-black/45 transition hover:bg-black/8 hover:text-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                title="Delete post"
                className="rounded-full p-2 text-black/45 transition hover:bg-red-500/10 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/25"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {editingPost ? (
          <div className="space-y-2">
            <Textarea
              value={postDraft}
              onChange={(event) => setPostDraft(event.target.value)}
              className="min-h-[110px] rounded-2xl border-black/10 bg-white/65 px-4 py-3 text-[15px] text-black/90"
              maxLength={2000}
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" className="control-pill" onClick={handleCancelPostEdit}>
                Cancel
              </Button>
              <Button
                className="h-9 rounded-full bg-black px-4 text-white hover:bg-black/90 disabled:bg-black/10 disabled:text-black/35"
                disabled={!postCanSave}
                onClick={handleSavePostEdit}
              >
                {savingPostEdit ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-black/90 break-words [overflow-wrap:anywhere]">
            {post.content}
          </p>
        )}

        {Array.isArray(post.pictures) && post.pictures.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.pictures.length === 1
                ? "grid-cols-1"
                : post.pictures.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {post.pictures.slice(0, 6).map((pic) => (
              <div
                key={pic.id}
                className={`relative overflow-hidden rounded-xl bg-black/5 ${
                  post.pictures.length === 1 ? "aspect-video" : "aspect-square"
                }`}
              >
                <MediaImage url={pic.url} alt={`Media ${pic.id}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => onToggleLike(post)}
            className={`inline-flex items-center gap-1.5 rounded-full p-2 text-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
              post.likedByMe
                ? "text-red-600 hover:bg-red-500/10"
                : "text-black/60 hover:bg-black/5 hover:text-black/80"
            }`}
          >
            <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-red-600" : ""}`} />
            <span>{post.likesCount}</span>
          </button>

          <button
            type="button"
            onClick={openLikes}
            className="inline-flex items-center rounded-full px-3 py-2 text-sm text-black/60 transition hover:bg-black/5 hover:text-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Liked by
          </button>

          <button
            onClick={handleToggleComments}
            className={`inline-flex items-center gap-1.5 rounded-full p-2 text-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
              showComments ? "bg-black/6 text-black/80" : "text-black/60 hover:bg-black/5 hover:text-black/80"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-black/10 pt-4">
                {loadingComments && <p className="text-xs text-black/55">Loading comments...</p>}
                {Array.isArray(post.comments) && post.comments.length > 0 && (
                  <div className="space-y-3">
                    {post.comments.map((comment) => (
                      <CommentNode
                        key={comment.id}
                        node={comment}
                        postId={post.id}
                        currentUsername={currentUsername}
                        onReply={onReplyComment}
                        onEdit={onEditComment}
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    className="h-10 rounded-xl border-black/10 bg-white/65 text-sm placeholder:text-black/40 focus-visible:border-black/20 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/20"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    size="sm"
                    className="h-10 rounded-xl bg-black text-white transition hover:bg-black/90 active:scale-95 disabled:bg-black/10 disabled:text-black/35"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Likes modal */}
        <AnimatePresence>
          {likesOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLikesOpen(false)}
            >
              <motion.div
                className="w-full max-w-md rounded-2xl border border-black/10 bg-white/90 p-4 shadow-xl backdrop-blur"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-black/85">Likes</p>
                  <button className="control-pill" type="button" onClick={() => setLikesOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {likesLoading ? (
                    <p className="text-sm text-black/55">Loading…</p>
                  ) : likesError ? (
                    <p className="text-sm text-error-text whitespace-pre-line">{likesError}</p>
                  ) : likesUsers.length === 0 ? (
                    <p className="text-sm text-black/55">No likes yet.</p>
                  ) : (
                    likesUsers.map((u) => (
                      <div
                        key={u.username}
                        className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/60 p-3"
                      >
                        <div className="h-9 w-9 overflow-hidden rounded-full bg-black/10 flex items-center justify-center">
                          {u.authorPicture?.url ? (
                            <MediaImage
                              url={u.authorPicture.url}
                              alt={u.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-black/70">{initials(u.username)}</span>
                          )}
                        </div>
                        <Link
                          to={`/u/${encodeURIComponent(u.username)}`}
                          className="text-sm font-medium text-black/85 hover:underline"
                        >
                          @{u.username}
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <ConfirmDialog
        open={deleteModalOpen}
        title="Delete post?"
        description="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        destructive
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(post.id);
          setDeleteModalOpen(false);
        }}
      />
    </Card>
  );
}

function CommentNode({ node, postId, currentUsername, depth = 0, onReply, onEdit }) {
  const maxVisualDepth = 3;
  const addLevelIndent = depth > 0 && depth <= maxVisualDepth;
  const continuedThread = depth === maxVisualDepth + 1;
  const isOwnComment = !!currentUsername && currentUsername === node.authorUsername;

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.content || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const commentTime = useMemo(() => formatTime(node.createdAt), [node.createdAt]);

  const submitReply = async () => {
    if (!onReply || !replyText.trim() || replying) return;
    setReplying(true);
    try {
      await onReply(postId, node.id, replyText.trim());
      setReplyText("");
      setReplyOpen(false);
    } finally {
      setReplying(false);
    }
  };

  const onReplyKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitReply();
    }
  };

  const submitEdit = async () => {
    if (!onEdit || !editText.trim() || savingEdit || editText.trim() === (node.content || "").trim()) return;
    setSavingEdit(true);
    try {
      await onEdit(postId, node.id, editText.trim());
      setEditing(false);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className={`space-y-2 ${addLevelIndent ? "ml-2 border-l border-black/15 pl-3" : ""}`}>
      {continuedThread && <p className="ml-10 text-[11px] font-medium text-black/45">Thread continues</p>}

      <div className="flex min-w-0 gap-3">
        <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-black/10">
          {node.authorPicture?.url ? (
            <MediaImage url={node.authorPicture.url} alt={node.authorUsername} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-medium text-black/70">
              {initials(node.authorUsername)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white/70 px-3 py-2">
          <p className="mb-1 text-xs text-black/80">
            <span className="font-semibold text-black/90">{node.authorUsername}</span>
            {commentTime ? ` • ${commentTime}` : ""}
            {node.edited ? " • edited" : ""}
          </p>

          {editing ? (
            <div className="space-y-3">
              <Textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                className="min-h-[86px] rounded-xl border-black/10 bg-white/65 px-3 py-2 text-sm text-black/85"
                maxLength={1000}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={() => {
                    setEditText(node.content || "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="h-8 rounded-full bg-black px-3 text-xs text-white hover:bg-black/90 disabled:bg-black/10 disabled:text-black/35"
                  onClick={submitEdit}
                  disabled={savingEdit || !editText.trim() || editText.trim() === (node.content || "").trim()}
                >
                  {savingEdit ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-black/80 break-words [overflow-wrap:anywhere]">{node.content}</p>
          )}

          <div className="mt-2 flex items-center gap-3">
            {onReply && (
              <button
                onClick={() => setReplyOpen((value) => !value)}
                className="text-xs font-medium text-black/55 transition hover:text-black/80"
              >
                {replyOpen ? "Cancel" : "Reply"}
              </button>
            )}
            {isOwnComment && onEdit && (
              <button
                onClick={() => {
                  setEditText(node.content || "");
                  setEditing((value) => !value);
                }}
                className="text-xs font-medium text-black/55 transition hover:text-black/80"
              >
                {editing ? "Close edit" : "Edit"}
              </button>
            )}
          </div>
        </div>
      </div>

      {replyOpen && (
        <div className="ml-8 flex min-w-0 gap-2 sm:ml-10">
          <Input
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            onKeyDown={onReplyKeyDown}
            placeholder={`Reply to ${node.authorUsername}...`}
            className="h-9 rounded-xl border-black/10 bg-white/65 text-sm placeholder:text-black/40 focus-visible:border-black/20 focus-visible:ring-2 focus-visible:ring-black/20"
          />
          <Button
            size="sm"
            onClick={submitReply}
            disabled={!replyText.trim() || replying}
            className="h-9 rounded-xl bg-black px-3 text-white transition hover:bg-black/90 disabled:bg-black/10 disabled:text-black/35"
          >
            {replying ? "..." : "Send"}
          </Button>
        </div>
      )}

      {Array.isArray(node.replies) &&
        node.replies.map((reply) => (
          <CommentNode
            key={reply.id}
            node={reply}
            postId={postId}
            currentUsername={currentUsername}
            depth={depth + 1}
            onReply={onReply}
            onEdit={onEdit}
          />
        ))}
    </div>
  );
}