/**
 * C1 · hook (0–90, 3.0s) — the site's binary name assembles out of 0/1 digits on the
 * midnight landscape, then the Remix control bursts the digits apart into the site itself.
 */

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BinaryName} from '../BinaryName';
import {Grain, Ink, Kicker, Landscape, Rise, eased} from '../kit';
import {COLORS, FONT} from '../tokens';
import {SITE} from '../data';

const RemixGlyph: React.FC<{color?: string}> = ({color = '#a5bdcd'}) => (
  <svg viewBox="0 0 28 28" fill="none" width={22} height={22} aria-hidden>
    <path
      d="M5 10a10 10 0 0 1 17-3M23 18A10 10 0 0 1 6 21"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <path
      d="m18 6 5 1-1-5M10 22l-5-1 1 5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x={10} y={10} width={3} height={3} rx={0.6} fill={color} />
    <rect x={15} y={15} width={3} height={3} rx={0.6} fill={color} />
    <path d="M16.5 10v3M10 16.5h3" stroke={color} strokeWidth={1.5} />
  </svg>
);

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const landscapeIn = eased((frame - 4) / 46, 'inout');
  const remixIn = eased((frame - 58) / 12, 'out');
  const clicked = eased((frame - 74) / 5, 'out');
  const flash = eased((frame - 84) / 6, 'out');
  const exit = eased((frame - 82) / 8, 'out');

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, fontFamily: FONT.sans}}>
      <Ink brightness={0.9} />
      <Landscape opacity={0.28 + landscapeIn * 0.4} y={18} scale={1.06} glow={0.5 + landscapeIn * 0.3} />

      {/* name field */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 198,
          transform: 'translateX(-50%)',
          opacity: 1 - exit * 0.55,
        }}
      >
        <BinaryName frame={frame} assembleStart={2} assembleEnd={44} burstStart={74} burstEnd={94} scale={1.27} glow={0.7} />
      </div>

      {/* URL / identity kicker */}
      <div style={{position: 'absolute', left: 108, top: 92}}>
        <Rise delay={10} distance={18}>
          <Kicker>{SITE.kicker}</Kicker>
        </Rise>
      </div>

      {/* Remix control, the site's own signature interaction */}
      <div
        style={{
          position: 'absolute',
          right: 250,
          top: 170,
          opacity: remixIn * (1 - exit * 0.85),
          transform: `scale(${0.86 + remixIn * 0.14 - clicked * 0.08})`,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(38,55,76,0.86) 0%, rgba(28,26,40,0.86) 100%)',
            border: `1px solid rgba(183,206,224,${0.2 + clicked * 0.35})`,
            boxShadow: clicked > 0.2 ? '0 0 26px rgba(130,233,255,0.35)' : '0 8px 26px rgba(0,0,0,0.35)',
          }}
        >
          <RemixGlyph color={clicked > 0.15 ? '#82e9ff' : '#a5bdcd'} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 64,
            top: 17,
            fontFamily: FONT.mono,
            fontSize: 13,
            letterSpacing: 2,
            color: 'rgba(187,199,216,0.7)',
            whiteSpace: 'nowrap',
          }}
        >
          REMIX
        </div>
      </div>

      {/* the hero line, set in the site's voice */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 744,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          opacity: 1 - exit * 0.75,
        }}
      >
        <Rise delay={48} distance={26}>
          <div
            style={{
              fontFamily: FONT.cjk,
              fontSize: 47,
              fontWeight: 500,
              letterSpacing: 7,
              color: COLORS.ink,
              textShadow: '0 2px 26px rgba(8,11,18,0.7)',
            }}
          >
            AI 赋能与前瞻探索
          </div>
        </Rise>
        <Rise delay={57} distance={20}>
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: 21,
              letterSpacing: 3.2,
              color: COLORS.muted2,
              fontWeight: 400,
            }}
          >
            独立 AI 开发者 · QODER 大使 · 十年产品经理
          </div>
        </Rise>
      </div>

      {/* bottom hairline, as on the site */}
      <div
        style={{
          position: 'absolute',
          left: 108,
          right: 108,
          bottom: 74,
          height: 1,
          background: 'linear-gradient(90deg, rgba(165,197,225,0.0) 0%, rgba(165,197,225,0.18) 50%, rgba(165,197,225,0.0) 100%)',
          opacity: eased((frame - 40) / 20, 'out'),
        }}
      />

      <Grain opacity={0.06} />

      {/* flash into the site */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 46%, rgba(241,252,255,0.85) 0%, rgba(130,233,255,0.4) 34%, rgba(8,11,18,0) 72%)`,
          opacity: flash * 0.55,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
