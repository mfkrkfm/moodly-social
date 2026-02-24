import { Badge } from "./ui/badge";

export type Mood = "CALM" | "HAPPY" | "SAD" | "STRESSED" | "ANGRY";

interface MoodBadgeProps {
  mood: Mood;
  size?: "sm" | "md";
}

const moodConfig = {
  CALM: {
    label: "🌿 Calm",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  HAPPY: {
    label: "✨ Happy",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  SAD: {
    label: "🌧 Sad",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  STRESSED: {
    label: "⚡ Stressed",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  ANGRY: {
    label: "🔥 Angry",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

export function MoodBadge({ mood, size = "md" }: MoodBadgeProps) {
  const config = moodConfig[mood];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} border ${sizeClass} rounded-full font-medium`}
    >
      {config.label}
    </Badge>
  );
}

export function getMoodBackgroundColor(mood: Mood): string {
  const colors = {
    CALM: "bg-emerald-50/25",
    HAPPY: "bg-amber-50/25",
    SAD: "bg-slate-50/30",
    STRESSED: "bg-orange-50/25",
    ANGRY: "bg-rose-50/25",
  };
  return colors[mood];
}

export const moodOptions: { value: Mood; label: string }[] = [
  { value: "CALM", label: "🌿 Calm" },
  { value: "HAPPY", label: "✨ Happy" },
  { value: "SAD", label: "🌧 Sad" },
  { value: "STRESSED", label: "⚡ Stressed" },
  { value: "ANGRY", label: "🔥 Angry" },
];
