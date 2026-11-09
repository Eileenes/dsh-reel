/**
 * Sorenyeah home film — design tokens.
 * Colours and type are taken from the live site (sorenyeah.com CSS variables + the
 * hero landscape SVG gradients), not invented:
 *   --bg #080b12  --surface #101621  --surface-2 #17202d  --ink #e9edf5
 *   --muted #a4afc2  --line #2a3444  --accent #82e9ff  --wave #3b4a60
 *   sky #0b1424 → #1c203a → #50334f → #a46a7c → #26233c → #0a1221
 */

export const COLORS = {
  bg: '#080b12',
  surface: '#101621',
  surface2: '#17202d',
  ink: '#e9edf5',
  muted: '#a4afc2',
  muted2: '#bbc7d8',
  line: '#2a3444',
  accent: '#82e9ff',
  wave: '#3b4a60',
  // landscape
  sky0: '#0b1424',
  sky1: '#1c203a',
  sky2: '#50334f',
  sky3: '#a46a7c',
  sky4: '#26233c',
  sky5: '#0a1221',
  horizon: '#f2b8ac',
  rose: '#cf8cc1',
  cool: '#78cad5',
  ridge0: '#70506c',
  ridge1: '#39344f',
  ridge2: '#202a3b',
  // accents used by the site's own media only
  lavender: '#c2b6ff',
  cream: '#ffd19b',
} as const;

export const FONT = {
  /** Latin display/UI: the site serves DM Sans locally. */
  sans: '"DM Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  /** Chinese: the site falls back to the system PingFang stack. */
  cjk: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  serif: '"Instrument Serif", "Songti SC", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  totalFrames: 1140,
} as const;

/** 120 BPM score grid: 1 beat = 15 frames, 1 bar = 60 frames at 30fps. */
export const BPM = 120;
export const BEAT = (VIDEO.fps * 60) / BPM; // 15
export const BAR = BEAT * 4; // 60

export const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
export const easeInOutCubic = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOutExpo = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
};
