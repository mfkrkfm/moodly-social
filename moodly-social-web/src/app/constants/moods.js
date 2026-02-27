export const moodConfig = {
  CALM: {
    label: "Calm",
    emoji: "🌿",
    color: "#34C759",
    textColor: "#1f6f3a",
  },
  HAPPY: {
    label: "Happy",
    emoji: "✨",
    color: "#FFCC00",
    textColor: "#7a5a00",
  },
  SAD: {
    label: "Sad",
    emoji: "🌧",
    color: "#0A84FF",
    textColor: "#0a3f7a",
  },
  STRESSED: {
    label: "Stressed",
    emoji: "⚡",
    color: "#FF9F0A",
    textColor: "#7a4b00",
  },
  ANGRY: {
    label: "Angry",
    emoji: "🔥",
    color: "#FF3B30",
    textColor: "#7a1e1a",
  },
};

export function getMoodVisual(mood) {
  return moodConfig[mood] || moodConfig.CALM;
}

export const moodOptions = Object.entries(moodConfig).map(([value, config]) => ({
  value,
  label: `${config.emoji} ${config.label}`,
}));

const POSITIVE_MOODS = new Set(["HAPPY", "CALM"]);
const NEGATIVE_MOODS = new Set(["SAD", "STRESSED", "ANGRY"]);

function lerpChannel(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function lerpColor(hexA, hexB, t) {
  const parse = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = lerpChannel(r1, r2, t);
  const g = lerpChannel(g1, g2, t);
  const b = lerpChannel(b1, b2, t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Smooth aura color based on the ratio of positive / negative moods.
 *   - all positive → green (#34C759)
 *   - balanced     → yellow (#FFCC00)
 *   - all negative → red (#FF3B30)
 * @param {string[]} moods – array of mood keys (e.g. ["HAPPY","SAD","CALM"])
 */
export function getAuthorAuraColor(moods) {
  if (!Array.isArray(moods) || moods.length === 0) return null;

  let total = 0;
  for (const m of moods) {
    if (POSITIVE_MOODS.has(m)) total += 1;
    else if (NEGATIVE_MOODS.has(m)) total -= 1;
  }
  const avg = total / moods.length; // −1 … +1

  const GREEN = "#34C759";
  const YELLOW = "#FFCC00";
  const RED = "#FF3B30";

  if (avg >= 0) {
    return lerpColor(YELLOW, GREEN, avg);
  }
  return lerpColor(RED, YELLOW, 1 + avg);
}

