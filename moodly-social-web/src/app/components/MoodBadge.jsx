import { Badge } from "./ui/badge.jsx";
import { getMoodVisual } from "../constants/moods.js";

/** @typedef {"CALM"|"HAPPY"|"SAD"|"STRESSED"|"ANGRY"} Mood */

/**
 * @param {{ mood: Mood, size?: "sm"|"md" }} props
 */
export function MoodBadge({ mood, size = "md" }) {
  const config = getMoodVisual(mood);
  const sizeClass = size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5";
  const badgeStyle = {
    color: config.textColor,
    backgroundColor: `${config.color}1A`,
    borderColor: `${config.color}40`,
  };

  return (
    <Badge
      variant="outline"
      className={`rounded-full border font-medium ${sizeClass}`}
      style={badgeStyle}
    >
      {config.emoji} {config.label}
    </Badge>
  );
}
