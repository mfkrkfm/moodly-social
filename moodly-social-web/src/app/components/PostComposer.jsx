import { useMemo, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Card, CardContent } from "./ui/card.jsx";
import { Button } from "./ui/button.jsx";
import { Textarea } from "./ui/textarea.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.jsx";
import { moodOptions } from "../constants/moods.js";

export function PostComposer({ onCreate, loading }) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("CALM");
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);

  const canPost = useMemo(
    () => content.trim().length > 0 && !!mood,
    [content, mood]
  );

  const handleContentChange = (event) => {
    const nextValue = event.target.value;
    setContent(nextValue);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 260)}px`;
    }
  };

  const handleSubmit = async () => {
    if (!canPost) return;
    try {
      await onCreate({ content: content.trim(), mood, files });
      setContent("");
      setFiles([]);
    } catch {
      // Parent handles displaying the error; keep draft intact.
    }
  };

  return (
    <Card className="glass-hover">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-black/80">New Pulse</h2>
        </div>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="What’s your mood today? Share your pulse…"
          className="min-h-[116px] max-h-[260px] overflow-y-auto rounded-2xl border-black/10 bg-white/60 px-4 py-3 text-[15px] text-black/90 placeholder:text-black/40 focus-visible:border-black/20 focus-visible:ring-2 focus-visible:ring-black/20"
          maxLength={2000}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-xs text-black/55">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
              />
              <span className="control-pill cursor-pointer gap-2 text-black/70 active:scale-95">
                <ImagePlus className="h-3.5 w-3.5" />
                Add images
              </span>
            </label>

            {files.length > 0 && <span className="text-xs text-black/50">{files.length} selected</span>}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
            <div className="relative z-30">
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="control-pill w-[156px] justify-between">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent align="end" className="z-50">
                  {moodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="px-1 text-xs text-black/45">{content.length}/2000</span>

            <Button
              onClick={handleSubmit}
              disabled={!canPost || loading}
              className="h-9 min-w-24 rounded-full bg-black px-4 text-white transition hover:bg-black/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/40 disabled:shadow-none"
            >
              {loading ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
