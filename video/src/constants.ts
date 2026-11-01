export const COLORS = {
  bg: "#162821",          // Deep forest atelier background
  bgCard: "#1f352d",      // Elevated dark forest card
  bgCanvas: "#0d1713",    // Deepest atelier obsidian
  bgPaper: "#f5f2eb",     // Warm atelier paper
  bgPaperSoft: "#faf7f0", // Warm atelier paper soft
  accent: "#7b8c4d",      // Olive leaf brand accent
  accentBright: "#d9e7ad",// Luminous lime badge highlight
  accentMuted: "#a3b567", // Light olive secondary
  cream: "#fbfaf8",       // High-contrast cream text
  creamMuted: "#c5cec8",  // Secondary sage text
  sage: "#68736b",        // Muted atelier sage
  darkInk: "#1f352d",     // Deep ink for paper backgrounds
  border: "#2e4338",      // Subtle card border
  borderLight: "#d8dcce", // Paper card border
  amber: "#f59e0b",       // Revision invalidation amber
  amberBg: "#fae8c8",     // Amber banner background
  amberText: "#8a5a00",   // Amber text
  red: "#ef4444",         // Discrepancy alert red
  redBg: "#fbe0dc",       // Red alert background
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Scene timings in frames (at 30 fps)
// Total: 5,910 frames (197.00 seconds ~ 3 min 17 sec)
export const TIMINGS = {
  hook: 23 * FPS,               // 690 frames (0:00 - 0:23)
  contrast: 16 * FPS,           // 480 frames (0:23 - 0:39)
  pitch: 23 * FPS,              // 690 frames (0:39 - 1:02)
  buyerStudio: 29 * FPS,        // 870 frames (1:02 - 1:31)
  makerDesk: 29 * FPS,          // 870 frames (1:31 - 2:00)
  revisionInvalidation: 31 * FPS,// 930 frames (2:00 - 2:31)
  architecture: 25 * FPS,       // 750 frames (2:31 - 2:56)
  close: 21 * FPS,              // 630 frames (2:56 - 3:17)
};

export const TOTAL_FRAMES = Object.values(TIMINGS).reduce((a, b) => a + b, 0);
