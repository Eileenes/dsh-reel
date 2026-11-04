/**
 * Real-UI scenes for the Better Sidebar film: use the actual DSH screenshots the
 * user provided (main interface + official "添加插件" dialog) instead of mock UI.
 */

import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Grain} from '../../components/Chrome';
import {DshBackdrop} from '../../stage/DshStage';
import {COLORS} from '../../tokens';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type ClickRingProps = {x: number; y: number; k: number};
const ClickRing: React.FC<ClickRingProps> = ({x, y, k}) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: 90,
        height: 90,
        marginLeft: -45,
        marginTop: -45,
        borderRadius: 999,
        border: '3px solid rgba(255,255,255,0.9)',
        boxShadow: '0 0 40px rgba(120,190,255,0.9)',
        opacity: 1 - k,
        transform: `scale(${0.35 + k * 0.9})`,
        pointerEvents: 'none',
      }}
    />
  );
};

const Cursor: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <svg
    width={30 * scale}
    height={38 * scale}
    viewBox="0 0 30 38"
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.45))',
      pointerEvents: 'none',
    }}
  >
    <path d="M3 2 L26 20 L15.5 22 L20 33 L14.5 35.5 L10 24.5 L3 31 Z" fill="#ffffff" stroke="#1b2430" strokeWidth="1.6" />
  </svg>
);

const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a || 1)));

/* ── C3: official 添加插件 dialog ─────────────────────────────────────────── */

export const C3AddPlugin: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 20));
  const push = 1 + 0.055 * smooth(seg(f, 0, 220));
  const move = smooth(seg(f, 34, 118));
  const clickK = Math.max(0, Math.min(1, (f - 128) / 16));
  const installed = smooth(seg(f, 150, 174));
  const cursorX = 51 - move * 1.2;
  const cursorY = 45 + move * 42.5;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />

      <div
        style={{
          position: 'absolute',
          left: 280,
          top: 116,
          width: 1360,
          height: 680,
          opacity: enter,
          transformOrigin: '50% 50%',
          transform: `perspective(1800px) translateY(${(1 - enter) * 26}px) rotateX(${(1 - enter) * 5}deg) scale(${push})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid rgba(180,205,255,0.20)',
            boxShadow: '0 60px 180px rgba(0,0,0,0.75), 0 0 140px rgba(60,110,230,0.28)',
            background: '#f4f6fa',
          }}
        >
          <Img
            src={staticFile('shots/dsh-add-plugin.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left top', display: 'block'}}
          />
          <Cursor x={cursorX} y={cursorY} scale={1.15} />
          <ClickRing x={cursorX} y={cursorY} k={clickK} />
        </div>

        {/* installed toast (official wording) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -30,
            transform: `translateX(-50%) translateY(${(1 - installed) * 18}px)`,
            opacity: installed,
            padding: '14px 26px',
            borderRadius: 12,
            background: 'rgba(11,18,32,0.92)',
            border: '1px solid rgba(120,246,200,0.45)',
            boxShadow: '0 18px 60px rgba(0,0,0,0.6), 0 0 40px rgba(40,224,255,0.18)',
            fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", sans-serif',
            fontSize: 22,
            color: 'rgba(235,250,245,0.94)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{color: COLORS.mint, marginRight: 10}}>✓</span>
          dsh-better-sidebar 已安装，重启 DSH 生效
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 96,
          bottom: 96,
          opacity: installed,
          textAlign: 'right',
        }}
      >
        <div
          style={{
            fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", sans-serif',
            fontSize: 16,
            letterSpacing: 2,
            color: 'rgba(180,200,255,0.55)',
            marginBottom: 10,
          }}
        >
          安装命令
        </div>
        <div
          style={{
            display: 'inline-block',
            padding: '14px 20px',
            borderRadius: 10,
            border: '1px solid rgba(150,190,255,0.22)',
            background: 'rgba(6,10,20,0.72)',
            fontFamily: '"SF Mono", Menlo, monospace',
            fontSize: 20,
            color: 'rgba(235,244,255,0.85)',
          }}
        >
          <span style={{color: COLORS.mint}}>$</span> dsh plugin --profile web add dsh-better-sidebar
        </div>
      </div>

      <Caption kicker="02 / 安装" title="在 DSH 里，添加插件。" delay={10} />
    </AbsoluteFill>
  );
};

/* ── optional: C2.5 real DSH main interface close-up ─────────────────────── */

export const C3OpenPlugins: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 20));
  const push = 1 + 0.06 * smooth(seg(f, 0, 130));
  const move = smooth(seg(f, 30, 88));
  const cursorX = 62 - move * 55;
  const cursorY = 70 - move * 45;
  const clickK = Math.max(0, Math.min(1, (f - 100) / 16));
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 130,
          width: 1320,
          height: 660,
          opacity: enter,
          transformOrigin: '50% 50%',
          transform: `perspective(1800px) translateY(${(1 - enter) * 24}px) rotateX(${(1 - enter) * 4}deg) scale(${push})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid rgba(180,205,255,0.20)',
            boxShadow: '0 60px 180px rgba(0,0,0,0.75), 0 0 140px rgba(60,110,230,0.28)',
            background: '#f4f6fa',
          }}
        >
          <Img
            src={staticFile('shots/dsh-main-interface.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left top', display: 'block'}}
          />
          <Cursor x={cursorX} y={cursorY} scale={1.1} />
          <ClickRing x={cursorX} y={cursorY} k={clickK} />
        </div>
      </div>
      <Caption kicker="01 / 打开" title="在 DSH 里，打开「插件」。" delay={8} />
    </AbsoluteFill>
  );
};
