/**
 * Sorenyeah home film — 3:4 cover / poster (1080×1440), rendered as a still.
 * Same world as the film: binary name over the site's twilight landscape.
 */

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BinaryName} from './BinaryName';
import {SITE} from './data';
import {FontGate} from './fonts';
import {Grain, Ink, Kicker, Landscape} from './kit';
import {COLORS, FONT} from './tokens';

export const SorenyeahPoster: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <FontGate>
      <AbsoluteFill style={{backgroundColor: COLORS.bg, fontFamily: FONT.sans, overflow: 'hidden'}}>
        <Ink brightness={0.95} />
        <Landscape opacity={0.62} y={-40} scale={1.24} glow={0.55} />
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(8,11,18,0.35) 0%, rgba(8,11,18,0) 34%, rgba(8,11,18,0.55) 100%)',
          }}
        />

        <div style={{position: 'absolute', left: 72, top: 78}}>
          <Kicker>{SITE.kicker}</Kicker>
        </div>

        <div style={{position: 'absolute', left: '50%', top: 300, transform: 'translateX(-50%)'}}>
          <BinaryName
            frame={999}
            assembleStart={-999}
            assembleEnd={-900}
            burstStart={null}
            scale={0.9}
            glow={0.9}
            showParticles={false}
            scan={false}
          />
        </div>

        <div style={{position: 'absolute', left: 0, right: 0, top: 812, textAlign: 'center'}}>
          <div
            style={{
              fontFamily: FONT.cjk,
              fontSize: 58,
              fontWeight: 600,
              letterSpacing: 6,
              color: COLORS.ink,
              lineHeight: 1.2,
            }}
          >
            AI 赋能与前瞻探索
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: FONT.sans,
              fontSize: 27,
              letterSpacing: 2.4,
              color: COLORS.muted2,
            }}
          >
            独立 AI 开发者 · QODER 大使 · 十年产品经理
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 214,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 32px',
              borderRadius: 999,
              background: 'rgba(10,16,28,0.6)',
              border: '1px solid rgba(177,214,239,0.26)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 99,
                background: COLORS.accent,
                boxShadow: `0 0 18px ${COLORS.accent}`,
              }}
            />
            <span style={{fontFamily: FONT.mono, fontSize: 28, letterSpacing: 1.6, color: '#e3f6f9'}}>
              sorenyeah.com
            </span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 72,
            right: 72,
            bottom: 62,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{fontFamily: FONT.mono, fontSize: 19, letterSpacing: 2.4, color: 'rgba(187,199,216,0.55)'}}>
            个人主页 · 2026
          </span>
          <span style={{fontFamily: FONT.mono, fontSize: 19, letterSpacing: 2.4, color: 'rgba(187,199,216,0.55)'}}>
            © 2026 Soren
          </span>
        </div>

        <Grain opacity={0.06} />
      </AbsoluteFill>
    </FontGate>
  );
};
