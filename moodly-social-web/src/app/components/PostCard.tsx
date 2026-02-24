import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MoodBadge, getMoodBackgroundColor, type Mood } from "./MoodBadge";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: number;
}

export interface Post {
  id: string;
  author: string;
  authorId: string;
  content: string;
  mood: Mood;
  media: string[];
  createdAt: number;
  likes: string[]; // array of userIds
  comments: Comment[];
  timestamp?: string; // computed display value
}

interface PostCardProps {
  post: Post & { timestamp: string };
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onDelete: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onLike, onComment, onDelete }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLiked = post.likes.includes(currentUserId);
  const isOwn = post.authorId === currentUserId;

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(post.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <Card className={`shadow-sm transition-shadow hover:shadow-md border-teal-100/40 ${getMoodBackgroundColor(post.mood)}`}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-[#1E4D4D] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">{post.author[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-medium leading-none mb-1 text-[#1E4D4D]">{post.author}</p>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
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

        {/* Content */}
        <p className="text-foreground/90 leading-relaxed">{post.content}</p>

        {/* Media Grid */}
        {post.media.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.media.length === 1
                ? "grid-cols-1"
                : post.media.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {post.media.slice(0, 6).map((src, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg bg-muted ${
                  post.media.length === 1 ? "aspect-video" : "aspect-square"
                }`}
              >
                <img src={src} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`gap-1.5 rounded-lg ${
              isLiked ? "text-rose-500 bg-rose-50 hover:bg-rose-100" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
            <span className="text-sm">{post.likes.length}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className={`gap-1.5 rounded-lg ${
              showComments ? "text-teal-700 bg-teal-50" : "text-muted-foreground hover:text-teal-700 hover:bg-teal-50"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments.length}</span>
          </Button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-teal-100/60 space-y-4">
                {/* Existing Comments */}
                {post.comments.length > 0 && (
                  <div className="space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-300 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">{comment.author[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 bg-white/70 rounded-xl px-3 py-2 shadow-sm">
                          <p className="text-xs font-medium text-[#1E4D4D] mb-0.5">{comment.author}</p>
                          <p className="text-sm text-foreground/80">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-white/80 border-teal-100 focus-visible:ring-teal-300/50 text-sm"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-[#1E4D4D] to-[#236B6B] hover:from-[#163C3C] hover:to-[#1E5C5C] text-white"
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
