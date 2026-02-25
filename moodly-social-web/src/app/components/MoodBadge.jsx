import { Badge } from "./ui/badge.jsx";

/** @typedef {"CALM"|"HAPPY"|"SAD"|"STRESSED"|"ANGRY"} Mood */

const moodConfig = {
  CALM: { label: "🌿 Calm", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  HAPPY: { label: "✨ Happy", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  SAD: { label: "🌧 Sad", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
  STRESSED: { label: "⚡ Stressed", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  ANGRY: { label: "🔥 Angry", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

/**
 * @param {{ mood: Mood, size?: "sm"|"md" }} props
 */
export function MoodBadge({ mood, size = "md" }) {
  const config = moodConfig[mood] || moodConfig.CALM;
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

/** @param {Mood} mood */
export function getMoodBackgroundColor(mood) {
  const colors = {
    CALM: "bg-emerald-50/25",
    HAPPY: "bg-amber-50/25",
    SAD: "bg-slate-50/30",
    STRESSED: "bg-orange-50/25",
    ANGRY: "bg-rose-50/25",
  };
  return colors[mood] || colors.CALM;
}

export const moodOptions = [
  { value: "CALM", label: "🌿 Calm" },
  { value: "HAPPY", label: "✨ Happy" },
  { value: "SAD", label: "🌧 Sad" },
  { value: "STRESSED", label: "⚡ Stressed" },
  { value: "ANGRY", label: "🔥 Angry" },
];
