/**
 * Shared chrome for the dsh-reel v2 film: wordmark, captions, pills, install bar,
 * glass panels, grain. Pure 2D (crisp text), no 3D.
 *
 * Every scene composes these instead of re-inventing type/spacing.
 */

import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, RADIUS, SPACE, TYPE} from '../tokens';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/** DeepSeek whale mark — simplified own illustration (not the official logo file). */
export const WhaleMark: React.FC<{size?: number; color?: string; style?: React.CSSProperties}> = ({
  size = 34,
  color = COLORS.blue2,
  style,
}) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 100 78" style={style} aria-hidden>
    <path
      d="M8 40c0-14 12-24 30-27 16-3 30 2 38 11l10-8c4-3 8-1 7 4l-2 9 6 5c3 3 1 7-3 7h-12c-8 11-22 18-38 18C22 59 8 52 8 40Z"
      fill={color}
    />
    <path d="M44 56c9 8 22 9 33 3-7 12-25 15-38 7l5-10Z" fill={COLORS.mint} opacity={0.9} />
    <circle cx="66" cy="33" r="4.6" fill="#0A1020" />
    <circle cx="67.6" cy="31.4" r="1.6" fill="#FFFFFF" />
  </svg>
);

export const Wordmark: React.FC<{scale?: number; dark?: boolean; style?: React.CSSProperties}> = ({
  scale = 1,
  dark = false,
  style,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, ...style}}>
    <WhaleMark size={44 * scale} />
    <span
      style={{
        fontFamily: FONT.latin,
        fontWeight: 700,
        fontSize: 34 * scale,
        letterSpacing: -0.8,
        color: dark ? '#0B1220' : COLORS.text,
      }}
    >
      deepseek
    </span>
    <span
      style={{
        fontFamily: FONT.mono,
        fontSize: 13 * scale,
        fontWeight: 600,
        letterSpacing: 2.4,
        color: COLORS.blue2,
        border: `1px solid ${COLORS.lineStrong}`,
        borderRadius: 6 * scale,
        padding: `${4 * scale}px ${8 * scale}px`,
        lineHeight: 1,
      }}
    >
      HARNESS
    </span>
  </div>
);

export const Pill: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({children, color = COLORS.blue2, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 18px',
      borderRadius: RADIUS.pill,
      border: `1px solid ${color}55`,
      background: `${color}14`,
      color,
      fontFamily: FONT.mono,
      fontSize: 17,
      letterSpacing: 3,
      textTransform: 'uppercase',
      ...style,
    }}
  >
    <span style={{width: 7, height: 7, borderRadius: 99, background: color, boxShadow: `0 0 14px ${color}`}} />
    {children}
  </span>
);

export const Step: React.FC<{no: string; color?: string}> = ({no, color = COLORS.mint}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 64,
      height: 64,
      borderRadius: 18,
      border: `1px solid ${color}66`,
      background: `${color}12`,
      color,
      fontFamily: FONT.mono,
      fontSize: 28,
      fontWeight: 700,
    }}
  >
    {no}
  </span>
);

/** Bottom-left caption block. Appears with a short rise; never overlaps the UI center. */
export const Caption: React.FC<{
  kicker?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  color?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({kicker, title, sub, color = COLORS.mint, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame - delay, [0, 10], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 108,
        bottom: 92,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
        ...style,
      }}
    >
      {kicker ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 18,
            letterSpacing: 4,
            color,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{width: 26, height: 2, background: color}} />
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT.zh,
          fontSize: 54,
          fontWeight: 600,
          lineHeight: 1.18,
          letterSpacing: -0.6,
          color: COLORS.text,
          textShadow: '0 10px 40px rgba(0,0,0,0.6)',
        }}
      >
        {title}
      </div>
      {sub ? (
        <div style={{fontFamily: FONT.zh, fontSize: 26, color: COLORS.dim, letterSpacing: 0.4}}>{sub}</div>
      ) : null}
    </div>
  );
};

export const GlassPanel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: string;
}> = ({children, style, glow = COLORS.blue}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: RADIUS.lg,
      border: `1px solid ${COLORS.line}`,
      background: 'linear-gradient(160deg, rgba(16,24,44,0.92), rgba(8,13,26,0.96))',
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 90px ${glow}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Terminal-style install bar with a typing progress (0..1). */
export const InstallCmd: React.FC<{
  typed?: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({typed = 1, width = 1200, style}) => {
  const cmd = 'dsh plugin --profile web add dsh-reel-studio';
  const shown = Math.max(0, Math.min(cmd.length, Math.floor(typed * cmd.length)));
  return (
    <div
      style={{
        width,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '20px 26px',
        borderRadius: 14,
        border: `1px solid ${COLORS.lineStrong}`,
        background: 'rgba(6,10,20,0.92)',
        boxShadow: `0 24px 70px rgba(0,0,0,0.5), 0 0 50px ${COLORS.blue}18`,
        fontFamily: FONT.mono,
        ...style,
      }}
    >
      <span style={{color: COLORS.mint, fontSize: 20}}>$</span>
      <span style={{color: COLORS.text, fontSize: 23, letterSpacing: 0.3, whiteSpace: 'pre'}}>
        {cmd.slice(0, shown)}
        <span style={{opacity: shown < cmd.length ? 0.7 : 0, color: COLORS.mint}}>▌</span>
      </span>
      <span style={{marginLeft: 'auto', color: COLORS.faint, fontSize: 13, letterSpacing: 2}}>MIT</span>
    </div>
  );
};

/** Subtle film grain + vignette for every scene. */
export const Grain: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
      }}
    />
  </AbsoluteFill>
);

/** Scene entry helper: fade in over N frames at the start of a Sequence. */
export const SceneFade: React.FC<{children: React.ReactNode; duration?: number; out?: boolean}> = ({
  children,
  duration = 8,
  out = false,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = Math.min(
    interpolate(frame, [0, duration], [0, 1], clamp),
    out ? interpolate(durationInFrames - duration, [durationInFrames - duration, durationInFrames], [1, 0], clamp) : 1
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
