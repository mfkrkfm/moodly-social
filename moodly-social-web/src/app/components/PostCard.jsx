import { useMemo, useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getMoodVisual } from "../constants/moods.js";
import { MediaImage } from "./MediaImage.jsx";
import { MoodBadge } from "./MoodBadge.jsx";
import { Button } from "./ui/button.jsx";
import { Card, CardContent } from "./ui/card.jsx";
import { ConfirmDialog } from "./ui/confirm-dialog.jsx";
import { Input } from "./ui/input.jsx";

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

export function PostCard({ post, currentUsername, onToggleLike, onAddComment, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const timestamp = useMemo(() => formatTime(post.createdAt), [post.createdAt]);
  const isOwn = currentUsername && post.authorUsername === currentUsername;
  const mood = getMoodVisual(post.mood);

  const moodOverlayStyle = { backgroundColor: mood.color };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <Card className="glass relative overflow-hidden transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]">
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-10" style={moodOverlayStyle} />

      <CardContent className="relative space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-black/10">
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
              <p className="truncate text-sm font-semibold text-black/90">{post.authorUsername}</p>
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
                onClick={() => setDeleteModalOpen(true)}
                title="Delete post"
                className="rounded-full p-2 text-black/45 transition hover:bg-red-500/10 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/25"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-black/90 break-words [overflow-wrap:anywhere]">
          {post.content}
        </p>

        {Array.isArray(post.pictures) && post.pictures.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.pictures.length === 1 ? "grid-cols-1" : post.pictures.length === 2 ? "grid-cols-2" : "grid-cols-3"
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
            onClick={() => setShowComments((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full p-2 text-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
              showComments
                ? "bg-black/6 text-black/80"
                : "text-black/60 hover:bg-black/5 hover:text-black/80"
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
                {Array.isArray(post.comments) && post.comments.length > 0 && (
                  <div className="space-y-3">
                    {post.comments.map((c) => (
                      <CommentNode key={c.id} node={c} />
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
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

function CommentNode({ node, depth = 0 }) {
  return (
    <div className={`${depth ? "ml-6" : ""} space-y-2`}>
      <div className="flex gap-3">
        <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-black/10">
          {node.authorPicture?.url ? (
            <MediaImage
              url={node.authorPicture.url}
              alt={node.authorUsername}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-medium text-black/70">
              {initials(node.authorUsername)}
            </span>
          )}
        </div>
        <div className="flex-1 rounded-xl border border-black/10 bg-white/70 px-3 py-2">
          <p className="mb-0.5 text-xs font-medium text-black/80">
            {node.authorUsername}
            {node.edited ? " • edited" : ""}
          </p>
          <p className="whitespace-pre-wrap text-sm text-black/80 break-words [overflow-wrap:anywhere]">
            {node.content}
          </p>
        </div>
      </div>

      {Array.isArray(node.replies) &&
        node.replies.map((reply) => <CommentNode key={reply.id} node={reply} depth={depth + 1} />)}
    </div>
  );
}
