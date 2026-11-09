/**
 * C6 · contact (570–720, 5.0s) — the site's closing line, the real contact channels.
 */

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {SITE} from '../data';
import {LogoMark} from '../BinaryName';
import {Grain, Ink, Landscape, Kicker, eased} from '../kit';
import {COLORS, FONT} from '../tokens';

export const ContactScene: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = eased((frame - 10) / 130, 'inout');
  // hard cut: the headline is already there and settles; the channels follow
  const line1 = Math.min(1, 0.8 + frame / 12);
  const line2 = Math.min(1, 0.62 + frame / 12);
  const qr = Math.min(1, 0.5 + frame / 14);
  const links = Math.min(1, 0.45 + frame / 12);
  const bottom = Math.min(1, 0.7 + frame / 10);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: FONT.sans,
        transform: `scale(${1 + drift * 0.05})`,
        transformOrigin: '50% 46%',
      }}
    >
      <Ink brightness={0.85} />
      <Landscape opacity={0.34} y={70} scale={1.1} drift={0.5} glow={0.55} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8,11,18,0.55) 0%, rgba(8,11,18,0.1) 40%, rgba(8,11,18,0.7) 100%)',
        }}
      />

      {/* brand */}
      <div style={{position: 'absolute', left: 108, top: 84, display: 'flex', alignItems: 'center', gap: 16, opacity: bottom}}>
        <LogoMark size={40} />
        <div style={{fontFamily: FONT.sans, fontSize: 25, fontWeight: 500, color: COLORS.ink}}>Soren</div>
      </div>

      {/* headline */}
      <div style={{position: 'absolute', left: 108, top: 264}}>
        <div
          style={{
            fontFamily: FONT.cjk,
            fontSize: 92,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1.18,
            color: COLORS.ink,
            opacity: line1,
            transform: `translateY(${(1 - line1) * 34}px)`,
          }}
        >
          {SITE.footerLine1}
        </div>
        <div
          style={{
            fontFamily: FONT.cjk,
            fontSize: 92,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1.18,
            color: COLORS.ink,
            opacity: line2,
            transform: `translateY(${(1 - line2) * 34}px)`,
          }}
        >
          一起做<span style={{color: COLORS.accent}}>。</span>
        </div>

        <div
          style={{
            marginTop: 58,
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
            opacity: links,
            transform: `translateY(${(1 - links) * 22}px)`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <span style={{fontFamily: FONT.mono, fontSize: 15, letterSpacing: 2, color: 'rgba(187,199,216,0.55)'}}>
              EMAIL
            </span>
            <span style={{fontFamily: FONT.sans, fontSize: 31, fontWeight: 500, color: '#d9edf0', letterSpacing: 0.2}}>
              {SITE.email}
            </span>
            <span style={{color: COLORS.accent, fontSize: 26}}>↗</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 44}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#b5c4d7" strokeWidth={1.8} aria-hidden>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <span style={{fontFamily: FONT.sans, fontSize: 21, color: '#b5c4d7'}}>GitHub</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="#b5c4d7" aria-hidden>
                <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L6 22H2.9l7.5-8.6L2.4 2h6.6l4.6 6.7L18.9 2Zm-1.1 18h1.8L8.1 3.9H6.2L17.8 20Z" />
              </svg>
              <span style={{fontFamily: FONT.sans, fontSize: 21, color: '#b5c4d7'}}>X</span>
            </div>
            <div style={{fontFamily: FONT.mono, fontSize: 15, letterSpacing: 1.6, color: 'rgba(187,199,216,0.5)'}}>
              {SITE.github} · {SITE.x}
            </div>
          </div>
        </div>
      </div>

      {/* a slow light behind the QR */}
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 210,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(130,233,255,0.12) 0%, rgba(130,233,255,0) 66%)',
          filter: 'blur(26px)',
          opacity: 0.55 + 0.45 * (Math.sin((frame / 30) * 1.2) * 0.5 + 0.5),
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* WeChat QR */}
      <div
        style={{
          position: 'absolute',
          right: 128,
          top: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: qr,
          transform: `translateY(${(1 - qr) * 30}px) scale(${0.96 + qr * 0.04})`,
        }}
      >
        <div
          style={{
            width: 236,
            height: 236,
            padding: 14,
            borderRadius: 20,
            background: '#f6fbff',
            boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
          }}
        >
          <Img src={staticFile('sorenyeah/images/wechat-qr.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        </div>
        <div style={{fontFamily: FONT.cjk, fontSize: 23, color: COLORS.ink}}>微信 · {SITE.wechat}</div>
        <div style={{fontFamily: FONT.mono, fontSize: 14, letterSpacing: 1.8, color: 'rgba(187,199,216,0.55)'}}>SCAN TO SAY HI</div>
      </div>

      {/* bottom line */}
      <div
        style={{
          position: 'absolute',
          left: 108,
          right: 108,
          bottom: 62,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(165,197,225,0.12)',
          paddingTop: 26,
          opacity: bottom,
        }}
      >
        <Kicker color="rgba(187,199,216,0.6)" dot={false}>
          SORENYEAH.COM
        </Kicker>
        <span style={{fontFamily: FONT.mono, fontSize: 14, letterSpacing: 1.5, color: 'rgba(187,199,216,0.45)'}}>© 2026 Soren</span>
      </div>

      <Grain opacity={0.055} />
    </AbsoluteFill>
  );
};
