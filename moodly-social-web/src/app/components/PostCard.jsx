import { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card.jsx";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { MoodBadge, getMoodBackgroundColor } from "./MoodBadge.jsx";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MediaImage } from "./MediaImage.jsx";

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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwn = currentUsername && post.authorUsername === currentUsername;

  const timestamp = useMemo(() => formatTime(post.createdAt), [post.createdAt]);

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

  const handleDelete = () => {
    if (confirmDelete) onDelete(post.id);
    else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <Card className={`shadow-sm transition-shadow hover:shadow-md border-emerald-100/40 ${getMoodBackgroundColor(post.mood)}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-[#1F453F] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {post.authorPicture?.url ? (
                <MediaImage url={post.authorPicture.url} alt={post.authorUsername} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-medium">{initials(post.authorUsername)}</span>
              )}
            </div>
            <div>
              <p className="font-medium leading-none mb-1 text-[#1F453F]">{post.authorUsername}</p>
              <p className="text-xs text-muted-foreground">{timestamp}{post.edited ? " • edited" : ""}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MoodBadge mood={post.mood} size="sm" />
            {isOwn && (
              <button
                onClick={handleDelete}
                title={confirmDelete ? "Click again to confirm" : "Delete post"}
                className={`p-1.5 rounded-lg transition-colors ${
                  confirmDelete
                    ? "bg-rose-100 text-rose-600"
                    : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>

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
                className={`relative overflow-hidden rounded-lg bg-muted ${
                  post.pictures.length === 1 ? "aspect-video" : "aspect-square"
                }`}
              >
                <MediaImage url={pic.url} alt={`Media ${pic.id}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleLike(post)}
            className={`gap-1.5 rounded-lg ${
              post.likedByMe
                ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
                : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
            }`}
          >
            <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-rose-500" : ""}`} />
            <span className="text-sm">{post.likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((v) => !v)}
            className={`gap-1.5 rounded-lg ${
              showComments
                ? "text-emerald-800 bg-emerald-50"
                : "text-muted-foreground hover:text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.commentsCount}</span>
          </Button>
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
              <div className="pt-4 border-t border-emerald-100/60 space-y-4">
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
                    className="bg-white/80 border-emerald-100 focus-visible:ring-emerald-300/50 text-sm"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-[#1F453F] to-[#3C7680] hover:from-[#16352F] hover:to-[#2F6068] text-white"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function CommentNode({ node, depth = 0 }) {
  return (
    <div className={`flex gap-3 ${depth ? "ml-6" : ""}`}>
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-[#3C7680] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {node.authorPicture?.url ? (
          <MediaImage url={node.authorPicture.url} alt={node.authorUsername} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-xs font-medium">{initials(node.authorUsername)}</span>
        )}
      </div>
      <div className="flex-1 bg-white/70 rounded-xl px-3 py-2 shadow-sm">
        <p className="text-xs font-medium text-[#1F453F] mb-0.5">
          {node.authorUsername}
          {node.edited ? " • edited" : ""}
        </p>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{node.content}</p>
      </div>
      {Array.isArray(node.replies) && node.replies.length > 0 && (
        <div className="w-full" />
      )}
      {Array.isArray(node.replies) && node.replies.length > 0 && (
        <div className="w-full mt-2">
          {node.replies.map((r) => (
            <CommentNode key={r.id} node={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
