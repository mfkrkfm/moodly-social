import { useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MoodBadge, moodOptions, type Mood } from "./MoodBadge";
import { Image, X, Loader2 } from "lucide-react";

interface PostComposerProps {
  onPost: (content: string, mood: Mood, media: string[]) => void;
  isPosting?: boolean;
}

export function PostComposer({ onPost, isPosting = false }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [media, setMedia] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!content.trim()) {
      setError("Please share a pulse before posting");
      return;
    }
    if (!mood) {
      setError("Please select a mood");
      return;
    }

    onPost(content, mood, media);
    setContent("");
    setMood(null);
    setMedia([]);
    setError("");
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMedia = Array.from(files).map((file) => URL.createObjectURL(file));
      setMedia([...media, ...newMedia].slice(0, 6));
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-sm border-teal-100/60">
      <CardContent className="p-6 space-y-4">
        {/* Mood selector row */}
        <div className="flex items-center gap-3">
          <Select
            value={mood || ""}
            onValueChange={(value) => {
              setMood(value as Mood);
              setError("");
            }}
          >
            <SelectTrigger className="w-44 bg-teal-50/60 border-teal-100 text-sm focus:ring-teal-300/50">
              <SelectValue placeholder="How are you feeling?" />
            </SelectTrigger>
            <SelectContent>
              {moodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {mood && <MoodBadge mood={mood} size="sm" />}
        </div>

        {/* Text area */}
        <Textarea
          placeholder="Share a pulse…"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError("");
          }}
          className="min-h-24 bg-teal-50/30 border-teal-100 resize-none focus-visible:ring-teal-300/50 placeholder:text-muted-foreground/60"
        />

        {/* Media preview */}
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {media.map((src, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
              >
                <img src={src} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={media.length >= 6}
            className="text-muted-foreground hover:text-[#1E4D4D] hover:bg-teal-50"
          >
            <Image className="w-4 h-4 mr-2" />
            Add media {media.length > 0 && `(${media.length}/6)`}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleMediaSelect}
            className="hidden"
          />

          <Button
            onClick={handlePost}
            disabled={!content.trim() || !mood || isPosting}
            className="bg-gradient-to-r from-[#1E4D4D] to-[#236B6B] hover:from-[#163C3C] hover:to-[#1E5C5C] text-white min-w-[80px]"
          >
            {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
