import { Badge } from "./ui/badge.jsx";

/** @typedef {"CALM"|"HAPPY"|"SAD"|"STRESSED"|"ANGRY"} Mood */

const moodConfig = {
  CALM: { label: "🌿 Calm", bg: "bg-mood-calm-bg", text: "text-mood-calm-text", border: "border-mood-calm-border" },
  HAPPY: { label: "✨ Happy", bg: "bg-mood-happy-bg", text: "text-mood-happy-text", border: "border-mood-happy-border" },
  SAD: { label: "🌧 Sad", bg: "bg-mood-sad-bg", text: "text-mood-sad-text", border: "border-mood-sad-border" },
  STRESSED: { label: "⚡ Stressed", bg: "bg-mood-stressed-bg", text: "text-mood-stressed-text", border: "border-mood-stressed-border"},
  ANGRY: { label: "🔥 Angry", bg: "bg-mood-angry-bg", text: "text-mood-angry-text", border: "border-mood-angry-border" },
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
    CALM: "bg-mood-calm-soft",
    HAPPY: "bg-mood-happy-soft",
    SAD: "bg-mood-sad-soft",
    STRESSED: "bg-mood-stressed-soft",
    ANGRY: "bg-mood-angry-soft",
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
