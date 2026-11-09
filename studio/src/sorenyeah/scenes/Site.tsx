/**
 * C2 · site reveal (90–210, 4.0s) — three real pages of sorenyeah.com, full-bleed and cut
 * on the beat: the homepage (3 beats) → the music page (3 beats) → the projects section
 * (2 beats), which hands over to C3's rebuilt project grid.
 *
 * These are the live site's own pixels (captured 2026-11-08 at 1920×1080 / 2x). The only
 * additions are the persistent domain pill, the site's own ambient meteors, a breathing
 * glow over the binary name and a slow push — no invented UI.
 */

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grain, Kicker, eased} from '../kit';
import {COLORS, FONT, VIDEO} from '../tokens';

type Shot = {from: number; to: number; src: string; label: string; /** keep the page header in frame */ fitTop?: boolean};

// scene-relative frames (C2 starts at 90 and lasts 120 frames)
const SHOTS: Shot[] = [
  {from: 0, to: 45, src: 'sorenyeah/shots/home-1920.png', label: '首页'},
  {from: 45, to: 90, src: 'sorenyeah/shots/music.png', label: '音乐', fitTop: true},
  {from: 90, to: 120, src: 'sorenyeah/shots/projects.png', label: '作品'},
];

const Meteor: React.FC<{from: number; x0: number; y0: number; len: number; dur: number; warm?: boolean}> = ({
  from,
  x0,
  y0,
  len,
  dur,
  warm = false,
}) => {
  const frame = useCurrentFrame();
  const p = (frame - from) / dur;
  if (p <= 0 || p >= 1) return null;
  const e2 = eased(p, 'inout');
  const x = x0 - e2 * 520;
  const y = y0 + e2 * 300;
  const alpha = Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: len,
        height: 2,
        transform: 'rotate(30deg)',
        transformOrigin: 'left center',
        background: warm
          ? 'linear-gradient(90deg, rgba(250,215,225,0) 0%, rgba(250,215,225,0.85) 100%)'
          : 'linear-gradient(90deg, rgba(193,229,255,0) 0%, rgba(193,229,255,0.85) 100%)',
        opacity: alpha * 0.9,
        filter: 'blur(0.4px)',
        borderRadius: 2,
      }}
    />
  );
};

const ShotView: React.FC<{shot: Shot; index: number}> = ({shot, index}) => {
  const frame = useCurrentFrame();
  // each shot gets its own slow push so nothing is ever completely still
  const p = Math.max(0, Math.min(1, (frame - shot.from) / (shot.to - shot.from)));
  const scale = 1.02 + eased(p, 'inout') * 0.055;
  const firstShot = index === 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: firstShot ? '50% 6%' : '50% 42%',
        }}
      >
        <Img
          src={staticFile(shot.src)}
          style={
            shot.fitTop
              ? {position: 'absolute', left: 0, top: 0, width: VIDEO.width, height: (VIDEO.width * 1800) / 2880}
              : {position: 'absolute', inset: 0, width: VIDEO.width, height: VIDEO.height, objectFit: 'cover'}
          }
        />
        {firstShot ? (
          <>
            {/* the name's breathing light, as the site's canvas has */}
            <AbsoluteFill
              style={{
                background: `radial-gradient(ellipse 40% 17% at 50% 39%, rgba(130,233,255,${0.06 + 0.05 * (Math.sin((frame / 30) * 1.6) * 0.5 + 0.5)}) 0%, rgba(130,233,255,0) 70%)`,
                mixBlendMode: 'screen',
              }}
            />
            <Meteor from={10} x0={1500} y0={180} len={220} dur={32} />
            <Meteor from={28} x0={620} y0={230} len={160} dur={26} warm />
          </>
        ) : null}
      </AbsoluteFill>
      {/* micro-flash on the cut */}
      <AbsoluteFill style={{background: '#d9edf0', opacity: Math.max(0, 0.09 - p * 30 * 0.09)}} />
    </AbsoluteFill>
  );
};

export const SiteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shot = SHOTS.find((s) => frame >= s.from && frame < s.to) ?? SHOTS[SHOTS.length - 1];
  const pill = eased((frame - 38) / 16, 'out');
  const sweep = eased((frame - 8) / 130, 'inout');
  const glow = 0.5 + 0.5 * Math.sin((frame / fps) * 1.6 - 1.2);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden', fontFamily: FONT.sans}}>
      {SHOTS.map((s, i) => {
        if (frame < s.from || frame >= s.to) return null;
        return <ShotView key={s.from} shot={s} index={i} />;
      })}

      {/* a slow light sweep across the glass */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(104deg, rgba(255,255,255,0) 34%, rgba(181,231,242,0.06) 46%, rgba(255,255,255,0) 58%)',
          transform: `translateX(${(sweep - 0.5) * 820}px)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* bottom shading so the pill sits cleanly */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(0deg, rgba(6,9,15,0.62) 0%, rgba(6,9,15,0) 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 108,
          bottom: 56,
          opacity: pill,
          transform: `translateY(${(1 - pill) * 14}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 22px',
            borderRadius: 999,
            background: 'rgba(10,16,28,0.62)',
            border: '1px solid rgba(177,214,239,0.24)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: COLORS.accent,
              boxShadow: `0 0 14px ${COLORS.accent}`,
            }}
          />
          <span style={{fontFamily: FONT.mono, fontSize: 17, letterSpacing: 1.4, color: '#d9edf0'}}>
            sorenyeah.com
          </span>
        </div>
        <Kicker color="rgba(187,199,216,0.72)" dot={false}>
          {shot.label}
        </Kicker>
      </div>

      <Grain opacity={0.045} />
    </AbsoluteFill>
  );
};
