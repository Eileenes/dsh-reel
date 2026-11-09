/**
 * C5 · music and writing (450–570, 4.0s) — the emotional peak of the film.
 *
 * Left: the site's #music now-playing deck and all seven tracks, with their real
 * 72-bar waveforms and signature colours. Right: the three real articles.
 */

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ARTICLES} from '../data';
import {TRACKS} from '../tracks';
import {Grain, Ink, Landscape, Kicker, Rise, eased} from '../kit';
import {COLORS, FONT} from '../tokens';

const Waveform: React.FC<{values: number[]; color: string; height: number; barWidth: number; live?: number}> = ({
  values,
  color,
  height,
  barWidth,
  live = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 2.5, height}}>
      {values.map((v, i) => {
        const wave = live > 0 ? 0.72 + 0.28 * Math.abs(Math.sin(t * 5.2 + i * 0.55)) : 1;
        const h = Math.max(2.5, (v / 100) * height * wave);
        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: h,
              borderRadius: barWidth / 2,
              background: color,
              opacity: live > 0 ? 0.55 + 0.45 * (v / 100) : 0.75,
            }}
          />
        );
      })}
    </div>
  );
};

const PlayButton: React.FC<{size?: number; pulse?: number}> = ({size = 56, pulse = 0}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 99,
      background: '#d8edf0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 ${18 + pulse * 30}px rgba(213,236,240,${0.18 + pulse * 0.3})`,
    }}
  >
    <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="#13232d" aria-hidden>
      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
    </svg>
  </div>
);

const MiniIcon: React.FC<{d: string; size?: number; color?: string}> = ({d, size = 20, color = '#8fa0b6'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

export const MusicScene: React.FC = () => {
  const frame = useCurrentFrame();
  // hard cut: heading and deck are already on screen, they settle while the list fills
  const headIn = Math.min(1, 0.74 + frame / 10);
  const deckIn = Math.min(1, 0.62 + frame / 12);
  const playing = eased((frame - 72) / 20, 'out');
  const rightIn = Math.min(1, 0.55 + frame / 14);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: FONT.sans,
        transform: `scale(${1 + eased(frame / 140, 'inout') * 0.02})`,
        transformOrigin: '50% 48%',
      }}
    >
      <Ink brightness={1} />
      <Landscape opacity={0.26} y={40} scale={1.1} drift={0.7} glow={0.4} />

      {/* left column header */}
      <div
        style={{
          position: 'absolute',
          left: 108,
          top: 88,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 24,
          opacity: headIn,
          transform: `translateY(${(1 - headIn) * 14}px)`,
        }}
      >
        <div style={{fontFamily: FONT.cjk, fontSize: 66, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1, color: COLORS.ink}}>
          我的音乐
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 15, letterSpacing: 2.4, color: 'rgba(187,199,216,0.55)', paddingBottom: 8}}>
          07 TRACKS · SOREN / SOUNDS
        </div>
      </div>

      {/* a beat glow behind the deck: the peak stretch */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 150,
          width: 1160,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 42% 42%, rgba(130,233,255,0.16) 0%, rgba(130,233,255,0) 62%)',
          filter: 'blur(28px)',
          opacity: 0.5 + 0.5 * Math.abs(Math.sin((frame / 15) * Math.PI)),
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* now playing deck */}
      <div
        style={{
          position: 'absolute',
          left: 108,
          top: 206,
          width: 1010,
          height: 196,
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(38,55,76,0.78) 0%, rgba(58,48,70,0.72) 100%)',
          border: '1px solid rgba(183,206,224,0.27)',
          boxShadow: '0 34px 90px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '0 30px',
          opacity: deckIn,
          transform: `translateY(${(1 - deckIn) * 26}px)`,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 18,
            overflow: 'hidden',
            flex: 'none',
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
          }}
        >
          <Img src={staticFile('sorenyeah/images/avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
            <div style={{fontFamily: FONT.cjk, fontSize: 37, fontWeight: 600, letterSpacing: -0.6, color: COLORS.ink}}>
              再往前一步
            </div>
            <div style={{fontFamily: FONT.sans, fontSize: 18, color: COLORS.muted}}>One Step Further</div>
          </div>
          <div style={{fontFamily: FONT.mono, fontSize: 14, letterSpacing: 2, color: 'rgba(187,199,216,0.6)', marginTop: 8}}>
            SOREN / SOUNDS · TRACK 01
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 18}}>
            <span style={{fontFamily: FONT.mono, fontSize: 13, color: '#8fa0b6'}}>0:00</span>
            <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 2.4, height: 26}}>
              {TRACKS[0].waveform.map((v, i) => {
                const played = i / TRACKS[0].waveform.length < 0.08 + playing * 0.24;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: Math.max(2, (v / 100) * 26 * (played ? 0.86 + 0.14 * Math.abs(Math.sin(frame / 6 + i * 0.5)) : 0.7)),
                      borderRadius: 1.4,
                      background: played ? '#d8edf0' : 'rgba(233,237,245,0.2)',
                    }}
                  />
                );
              })}
            </div>
            <span style={{fontFamily: FONT.mono, fontSize: 13, color: '#8fa0b6'}}>3:01</span>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, flex: 'none'}}>
          <MiniIcon d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432zM3 20V4" size={24} />
          <PlayButton pulse={playing} />
          <MiniIcon d="M21 4v16M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" size={24} />
        </div>
      </div>

      {/* track rows */}
      <div style={{position: 'absolute', left: 108, top: 430}}>
        {TRACKS.map((tr, i) => {
          const p = eased((frame + 6 - i * 5.2) / 12, 'out');
          return (
            <div
              key={tr.no}
              style={{
                width: 1010,
                height: 62,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                borderBottom: '1px solid rgba(165,197,225,0.09)',
                opacity: p,
                transform: `translateX(${(1 - p) * -18}px)`,
              }}
            >
              <span style={{fontFamily: FONT.mono, fontSize: 15, color: tr.color, width: 26}}>{tr.no}</span>
              <span style={{fontFamily: FONT.cjk, fontSize: 24, color: COLORS.ink, fontWeight: 500, width: 244}}>{tr.title}</span>
              <span style={{fontFamily: FONT.sans, fontSize: 16, color: 'rgba(187,199,216,0.7)', flex: 1}}>{tr.en}</span>
              <div style={{opacity: 0.9}}>
                <Waveform values={tr.waveform} color={tr.color} height={22} barWidth={1.6} live={i === 0 ? 1 : 0} />
              </div>
              <span style={{fontFamily: FONT.mono, fontSize: 14, color: '#8fa0b6', width: 46, textAlign: 'right'}}>{tr.duration}</span>
            </div>
          );
        })}
      </div>

      {/* writing column */}
      <div style={{position: 'absolute', left: 1176, top: 108, width: 636, opacity: rightIn}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 22}}>
          <div style={{fontFamily: FONT.cjk, fontSize: 44, fontWeight: 600, letterSpacing: -1, lineHeight: 1, color: COLORS.ink}}>
            记录，持续更新<span style={{color: COLORS.accent}}>.</span>
          </div>
          <div style={{fontFamily: FONT.mono, fontSize: 13, letterSpacing: 2, color: 'rgba(187,199,216,0.5)', paddingBottom: 6}}>
            03 NOTES
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
          {ARTICLES.map((a, i) => {
            const p = eased((frame + 4 - i * 8) / 14, 'out');
            return (
              <div
                key={a.title}
                style={{
                  opacity: p,
                  transform: `translateY(${(1 - p) * 22}px)`,
                }}
              >
                <div
                  style={{
                    width: 636,
                    height: 208,
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: '1px solid rgba(173,200,222,0.12)',
                  }}
                >
                  <Img
                    src={staticFile(a.cover)}
                    style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center'}}
                  />
                </div>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 10}}>
                  <div style={{fontFamily: FONT.cjk, fontSize: 19, lineHeight: 1.4, color: COLORS.ink, flex: 1}}>{a.title}</div>
                  <div style={{fontFamily: FONT.mono, fontSize: 12, color: 'rgba(187,199,216,0.55)', paddingTop: 4, whiteSpace: 'nowrap'}}>
                    {a.category} · {a.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Grain opacity={0.055} />
    </AbsoluteFill>
  );
};
