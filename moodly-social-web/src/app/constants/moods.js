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
