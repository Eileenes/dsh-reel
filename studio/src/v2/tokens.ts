/**
 * dsh-reel v2 design tokens — the single source of truth for the DSH promo system.
 * Colors / type / spacing / motion. Do not hardcode hex or px in scenes.
 */

export const COLORS = {
  bg0: '#05070D',
  bg1: '#0A1020',
  panel: '#0C1424',
  blue: '#4D6BFE',
  blue2: '#8EA6FF',
  mint: '#5EF2C2',
  amber: '#FFB86B',
  text: '#F4F7FF',
  dim: '#93A0BD',
  faint: '#5A6785',
  line: 'rgba(142,166,255,0.16)',
  lineStrong: 'rgba(142,166,255,0.34)',
  grid: 'rgba(142,166,255,0.10)',
  white: '#FFFFFF',
  black: '#000000',
  danger: '#FF7B8A',
} as const;

/** Chinese-first stack. Display weights must exist on this machine (PingFang has 6 weights). */
export const FONT = {
  zh: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  latin: 'Inter, "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", "JetBrains Mono", Menlo, monospace',
} as const;

/** Type scale (px at 1920x1080 design space). */
export const TYPE = {
  display: 132,
  h1: 96,
  h2: 64,
  h3: 44,
  lead: 34,
  body: 26,
  small: 20,
  micro: 15,
  mono: 18,
  monoSmall: 13,
} as const;

/** 8px base grid. */
export const SPACE = (n: number) => n * 8;

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const MOTION = {
  fps: 30,
  /** canonical entrance spring */
  spring: { damping: 200, mass: 0.7, stiffness: 120 },
  /** softer spring for big objects */
  springSoft: { damping: 200, mass: 0.9, stiffness: 90 },
  /** camera fov range used by the reference film */
  fovMin: 38,
  fovMax: 42,
  /** reading holds: freeze whale + camera + particles */
  still: [
    [11.7, 12.35],
    [17.75, 19.5],
  ] as const,
} as const;

/** Video specs. */
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  posterWidth: 1080,
  posterHeight: 1440,
  posterScale: 2,
} as const;

export const SHADOWS = {
  card: '0 40px 100px rgba(0,0,0,0.55)',
  glowBlue: '0 0 80px rgba(77,107,254,0.45)',
  glowMint: '0 0 60px rgba(94,242,194,0.35)',
} as const;
