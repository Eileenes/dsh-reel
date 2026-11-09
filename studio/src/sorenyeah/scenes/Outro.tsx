/**
 * C7 · outro (720–900, 6.0s) — the mark, the name, the address. Holds as a poster.
 */

import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BinaryName, LogoMark} from '../BinaryName';
import {SITE} from '../data';
import {Grain, Ink, Landscape, eased, spring} from '../kit';
import {COLORS, FONT} from '../tokens';

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // hard cut on the beat: the mark lands already scaled up and settles
  const mark = Math.min(1, 0.86 + frame / 8);
  const markScale = 1.14 - 0.14 * eased(frame / 9, 'out');
  const name = Math.min(1, 0.58 + frame / 14);
  const rule = eased((frame - 34) / 16, 'inout');
  const tag = eased((frame - 44) / 16, 'out');
  const pill = eased((frame - 60) / 16, 'out');
  const drink = eased(frame / 180, 'inout');

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, fontFamily: FONT.sans, overflow: 'hidden'}}>
      <Ink brightness={0.7} />
      <Landscape opacity={0.2} y={130} scale={1.12} drift={0.35} glow={0.35} />

      {/* the name field, as a watermark */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 150,
          transform: 'translateX(-50%)',
          opacity: 0.1 * eased(frame / 30, 'out'),
        }}
      >
        <BinaryName frame={999} assembleStart={-999} assembleEnd={-900} burstStart={null} scale={1.35} glow={0.1} />
      </div>

      <AbsoluteFill
        style={{
          transform: `scale(${1 + drink * 0.016})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 40,
        }}
      >
        <div style={{opacity: mark, transform: `scale(${markScale})`}}>
          <LogoMark size={96} />
        </div>

        <div
          style={{
            marginTop: 34,
            fontFamily: FONT.sans,
            fontSize: 116,
            fontWeight: 600,
            letterSpacing: -3,
            lineHeight: 1,
            color: COLORS.ink,
            opacity: name,
            transform: `translateY(${(1 - name) * 26}px)`,
          }}
        >
          Soren
        </div>

        <div
          style={{
            width: 260,
            height: 1,
            marginTop: 40,
            background: 'linear-gradient(90deg, rgba(130,233,255,0) 0%, rgba(130,233,255,0.55) 50%, rgba(130,233,255,0) 100%)',
            opacity: rule,
            transform: `scaleX(${rule})`,
          }}
        />

        <div
          style={{
            marginTop: 34,
            fontFamily: FONT.cjk,
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: 8,
            color: '#c6d3e2',
            opacity: tag,
            transform: `translateY(${(1 - tag) * 18}px)`,
          }}
        >
          AI 赋能与前瞻探索
        </div>

        <div
          style={{
            marginTop: 58,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '15px 26px',
            borderRadius: 999,
            background: 'rgba(16,22,33,0.72)',
            border: '1px solid rgba(177,214,239,0.26)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.4)',
            opacity: pill,
            transform: `translateY(${(1 - pill) * 16}px)`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: COLORS.accent,
              boxShadow: `0 0 16px ${COLORS.accent}`,
            }}
          />
          <span style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 1.6, color: '#e3f6f9'}}>sorenyeah.com</span>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 108,
          right: 108,
          bottom: 66,
          display: 'flex',
          justifyContent: 'space-between',
          opacity: pill * 0.8,
        }}
      >
        <span style={{fontFamily: FONT.mono, fontSize: 14, letterSpacing: 2, color: 'rgba(187,199,216,0.5)'}}>© 2026 Soren</span>
        <span style={{fontFamily: FONT.mono, fontSize: 14, letterSpacing: 2, color: 'rgba(187,199,216,0.5)'}}>MADE WITH DSH REEL</span>
      </div>

      <Grain opacity={0.055} />
    </AbsoluteFill>
  );
};
