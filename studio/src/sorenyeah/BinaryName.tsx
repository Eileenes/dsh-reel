/**
 * The site's signature image, rebuilt: "Soren" written as a field of 0/1 digits.
 *
 * The site's canvas rasterises Arial-900 "Soren" into a mask and fills it with ~8.7 px
 * monospace digits (cursor repulsion, a 27 s scan wave, and the Remix explosion).
 * For a deterministic film we rebuild the same picture as SVG: the site's own
 * `binary-grid` pattern (rows "01" / "10") masked by a `textLength`-fitted "Soren".
 * The film adds the assembly (digits flying in from the edges) and the Remix burst.
 */

import React from 'react';
import {VIDEO} from './tokens';

const DIGITS = ['0', '1'];

/** Deterministic 0..1 pseudo-random from an integer seed. */
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Particle = {
  ch: string;
  tx: number;
  ty: number;
  fromX: number;
  fromY: number;
  outX: number;
  outY: number;
  size: number;
  delay: number;
  opacity: number;
};

const makeParticles = (count: number): Particle[] => {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const r1 = rnd(i * 3 + 1);
    const r2 = rnd(i * 3 + 2);
    const r3 = rnd(i * 3 + 3);
    const r4 = rnd(i * 7 + 11);
    const tx = 26 + r1 * 1148;
    const ty = 120 + r2 * 210;
    const edge = Math.floor(r3 * 4);
    const sx = tx + (edge === 0 ? -900 : edge === 1 ? 900 : (r4 - 0.5) * 700);
    const sy = ty + (edge === 2 ? -700 : edge === 3 ? 700 : (r4 - 0.5) * 500);
    const ang = r4 * Math.PI * 2;
    const dist = 420 + rnd(i * 11 + 5) * 620;
    out.push({
      ch: DIGITS[Math.floor(rnd(i * 13 + 7) * 2)],
      tx,
      ty,
      fromX: sx,
      fromY: sy,
      outX: tx + Math.cos(ang) * dist,
      outY: ty + Math.sin(ang) * dist,
      size: 9 + rnd(i * 17 + 2) * 5,
      delay: Math.floor(rnd(i * 19 + 3) * 22),
      opacity: 0.25 + rnd(i * 23 + 9) * 0.65,
    });
  }
  return out;
};

const PARTICLES = makeParticles(150);

const easeOutCubic = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

export const BinaryName: React.FC<{
  /** scene-relative frame */
  frame: number;
  /** assembly start/end (scene frames) */
  assembleStart?: number;
  assembleEnd?: number;
  /** remix burst start/end; null = no burst */
  burstStart?: number | null;
  burstEnd?: number;
  /** 0..1 overall opacity multiplier */
  opacity?: number;
  /** 0..1 name glow */
  glow?: number;
  style?: React.CSSProperties;
  scale?: number;
  /** watermarks/poster: keep the computed digits out of the way */
  showParticles?: boolean;
  /** the ~27 s highlight band; off for posters */
  scan?: boolean;
}> = ({
  frame,
  assembleStart = 0,
  assembleEnd = 42,
  burstStart = null,
  burstEnd = 92,
  opacity = 1,
  glow = 0.55,
  style,
  scale = 1,
  showParticles = true,
  scan: showScan = true,
}) => {
  const assemble = easeOutCubic((frame - assembleStart) / Math.max(1, assembleEnd - assembleStart));
  const nameIn = easeOutCubic((frame - assembleStart - 26) / 22);
  const burst =
    burstStart === null ? 0 : easeOutCubic((frame - burstStart) / Math.max(1, burstEnd - burstStart));
  const nameOut = burstStart === null ? 1 : 1 - Math.min(1, burst * 1.6);
  const scan = ((frame % 210) / 210) * 1500 - 250;

  return (
    <div
      style={{
        position: 'relative',
        width: 1200,
        height: 360,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        opacity,
        filter: `drop-shadow(0 0 ${18 + glow * 22}px rgba(130,233,255,${0.18 + glow * 0.22}))`,
        ...style,
      }}
    >
      <svg width={1200} height={360} viewBox="0 0 1200 360" style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern id="soren-binary-grid" width={16} height={18} patternUnits="userSpaceOnUse">
            <text fill="#82e9ff" fontSize={8} fontFamily="monospace">
              <tspan x={0} y={8}>
                01
              </tspan>
              <tspan x={0} y={17}>
                10
              </tspan>
            </text>
          </pattern>
          <mask id="soren-name-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1200} height={360}>
            <text
              x={18}
              y={308}
              fill="#ffffff"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight={900}
              fontSize={380}
              textLength={1164}
              lengthAdjust="spacingAndGlyphs"
            >
              Soren
            </text>
          </mask>
          <linearGradient id="soren-scan-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#f1fcff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#f1fcff" stopOpacity={0.92} />
            <stop offset="1" stopColor="#f1fcff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g opacity={nameIn * nameOut} mask="url(#soren-name-mask)">
          <rect x={0} y={0} width={1200} height={360} fill="url(#soren-binary-grid)" />
          {/* the ~27 s scan band, brightened digits */}
          {showScan ? <rect x={scan} y={0} width={260} height={360} fill="url(#soren-scan-grad)" opacity={0.55} /> : null}
        </g>
      </svg>

      {/* digits flying in from the edges, and out again on the Remix burst */}
      <div style={{position: 'absolute', inset: 0, display: showParticles ? 'block' : 'none'}}>
        {PARTICLES.map((p, i) => {
          const ap = Math.max(0, Math.min(1, (frame - assembleStart - p.delay + 8) / 26));
          const bx = burst === 0 ? 0 : burst;
          const x = p.fromX + (p.tx - p.fromX) * easeOutCubic(ap) + (p.outX - p.tx) * bx;
          const y = p.fromY + (p.ty - p.fromY) * easeOutCubic(ap) + (p.outY - p.ty) * bx;
          const visible = ap > 0 ? 1 : 0;
          const fadeOut = burst > 0 ? Math.max(0, 1 - burst * 0.78) : 1;
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                fontFamily: 'monospace',
                fontSize: p.size,
                lineHeight: 1,
                color: i % 11 === 0 ? '#b8f4ff' : '#82e9ff',
                opacity: visible * p.opacity * (ap < 1 ? 0.9 : 0.55) * fadeOut * (1 + burst * 0.6),
                textShadow: '0 0 8px rgba(130,233,255,0.5)',
              }}
            >
              {p.ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** The site's S-arrow mark, 40x40 viewBox, as used in the header and footer. */
export const LogoMark: React.FC<{size?: number; color?: string; accent?: string; style?: React.CSSProperties}> = ({
  size = 42,
  color = '#e9edf5',
  accent = '#82e9ff',
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={style} aria-hidden>
    <rect x={1} y={1} width={38} height={38} rx={11} stroke="rgba(233,237,245,0.34)" strokeWidth={1.4} />
    <rect x={15.4} y={6.9} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={18.8} y={6.9} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={22.2} y={6.9} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={25.6} y={6.9} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={12} y={10.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={15.4} y={10.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={18.8} y={10.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={22.2} y={10.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={25.6} y={10.3} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={29} y={10.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={8.6} y={13.7} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={12} y={13.7} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={12} y={17.1} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={15.4} y={17.1} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={18.8} y={17.1} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={22.2} y={17.1} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={22.2} y={20.5} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={25.6} y={20.5} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={25.6} y={23.9} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={29} y={23.9} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={8.6} y={27.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={12} y={27.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={15.4} y={27.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={18.8} y={27.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={22.2} y={27.3} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={25.6} y={27.3} width={2.7} height={2.7} rx={0.55} fill={accent} />
    <rect x={12} y={30.7} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={15.4} y={30.7} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={18.8} y={30.7} width={2.7} height={2.7} rx={0.55} fill={color} />
    <rect x={22.2} y={30.7} width={2.7} height={2.7} rx={0.55} fill={color} />
  </svg>
);

export const OUTRO_SIZE = {width: 1200, height: 360, designWidth: VIDEO.width};
