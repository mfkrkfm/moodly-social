import { useMemo, useState } from "react";
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
import { moodOptions } from "./MoodBadge.jsx";

export function PostComposer({ onCreate, loading }) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("CALM");
  const [files, setFiles] = useState([]);

  const canPost = useMemo(
    () => content.trim().length > 0 && !!mood,
    [content, mood]
  );

  const handleSubmit = async () => {
    if (!canPost) return;
    await onCreate({ content: content.trim(), mood, files });
    setContent("");
    setFiles([]);
  };

  return (
    <Card className="border-emerald-100/50 shadow-sm">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-[#1F453F]">New Pulse</h2>
        </div>

        {/* Content */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What’s your mood today? Share your pulse…"
          className="min-h-[120px] bg-white/80 border-emerald-100 focus-visible:ring-emerald-300/50"
          maxLength={2000}
        />

        {/* Controls (Fix A layout) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setFiles(Array.from(e.target.files || []).slice(0, 5))
                }
              />
              <span className="inline-flex cursor-pointer items-center rounded-lg border border-emerald-100 bg-white/80 px-3 py-1.5 text-xs hover:bg-emerald-50">
                Add images
              </span>
            </label>

            {files.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {files.length} selected
              </span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-end gap-3 flex-wrap justify-end">
            {/* IMPORTANT: z-index wrapper so dropdown renders above without messing layout */}
            <div className="relative z-30">
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-[160px] bg-white/80 border-emerald-100">
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

            <span className="text-xs text-muted-foreground pb-2">
              {content.length}/2000
            </span>

            <Button
              onClick={handleSubmit}
              disabled={!canPost || loading}
              className="bg-gradient-to-r from-[#1F453F] to-[#3C7680] hover:from-[#16352F] hover:to-[#2F6068] text-white"
            >
              {loading ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}