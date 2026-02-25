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
    try {
      await onCreate({ content: content.trim(), mood, files });
      setContent("");
      setFiles([]);
    } catch {
      // Parent handles displaying the error; keep draft intact.
    }
  };

  return (
    <Card className="border-surface-border-muted shadow-sm">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-brand-title">New Pulse</h2>
        </div>

        {/* Content */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What’s your mood today? Share your pulse…"
          className="min-h-[120px] bg-surface-card-80 border-surface-border focus-visible:ring-focus-accent"
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
              <span className="inline-flex cursor-pointer items-center rounded-lg border border-surface-border bg-surface-card-80 px-3 py-1.5 text-xs hover:bg-accent">
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
          <div className="flex items-end gap-3 justify-end sm:flex-nowrap flex-wrap">
            {/* IMPORTANT: z-index wrapper so dropdown renders above without messing layout */}
            <div className="relative z-30">
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-[160px] bg-surface-card-80 border-surface-border">
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
              className="w-24 bg-gradient-to-r from-primary to-brand-secondary hover:from-brand-primary-hover hover:to-brand-secondary-hover text-primary-foreground"
            >
              {loading ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
