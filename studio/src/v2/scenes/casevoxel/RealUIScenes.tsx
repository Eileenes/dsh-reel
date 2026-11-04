/**
 * Real-UI scenes for the Better Sidebar film, using the sanitized DSH illustrations
 * (no personal workspace content) plus the voxel-whale sprite for continuity:
 *
 *   C3OpenPlugins: whale jumps onto the「插件」nav item, clicks, plugin name card appears.
 *   C3AddPlugin:  whale jumps onto the「安装」button, click, install progress, toast.
 */

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Grain} from '../../components/Chrome';
import {DshBackdrop} from '../../stage/DshStage';
import {COLORS} from '../../tokens';

const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a || 1)));

const W = 1280;
const H = 720;
const LEFT = 320;
const TOP = 128;

type JumpProps = {
  frame: number;
  from: [number, number];
  to: [number, number];
  start: number;
  end: number;
  height: number;
  width: number;
};

const WhaleJump: React.FC<JumpProps> = ({frame, from, to, start, end, height, width}) => {
  const p = smooth(seg(frame, start, end));
  const landed = Math.max(0, frame - end);
  const squash = Math.exp(-Math.pow(landed / 4, 2)) * 0.16;
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const arc = Math.sin(Math.PI * p) * height;
  const rot = Math.sin(Math.PI * p) * 10 - p * 6;
  const h = (width * 270) / 470;
  return (
    <img
      src={staticFile('shots/whale-sprite.png')}
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - arc - h / 2,
        width,
        height: h,
        transform: `rotate(${rot}deg) scale(${1 + squash}, ${1 - squash})`,
        filter: 'drop-shadow(0 14px 24px rgba(10,20,40,.35))',
        pointerEvents: 'none',
      }}
    />
  );
};

const ClickRipple: React.FC<{frame: number; at: number; x: number; y: number}> = ({frame, at, x, y}) => {
  const k = Math.max(0, Math.min(1, (frame - at) / 16));
  if (frame < at || k >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 48,
        top: y - 48,
        width: 96,
        height: 96,
        borderRadius: 999,
        border: '3px solid rgba(255,255,255,0.95)',
        boxShadow: '0 0 50px rgba(110,180,255,0.95)',
        opacity: 1 - k,
        transform: `scale(${0.3 + k * 1.0})`,
      }}
    />
  );
};

/* ── C3: jump onto 插件, click, show plugin name ───────────────────────────── */

export const C3OpenPlugins: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 16));
  const push = 1 + 0.04 * smooth(seg(f, 0, 110));
  const nameIn = smooth(seg(f, 74, 92));
  const targetX = (72 / 1600) * W;
  const targetY = (195 / 900) * H;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: TOP,
          width: W,
          height: H,
          opacity: enter,
          transformOrigin: '50% 50%',
          transform: `perspective(1900px) translateY(${(1 - enter) * 30}px) rotateX(${(1 - enter) * 5}deg) scale(${push})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(180,205,255,0.22)',
            boxShadow: '0 60px 180px rgba(0,0,0,0.78), 0 0 150px rgba(60,110,230,0.26)',
            background: '#f8f9fb',
          }}
        >
          <Img
            src={staticFile('shots/dsh-main-clean.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
          <WhaleJump
            frame={f}
            from={[W + 120, H + 60]}
            to={[targetX, targetY]}
            start={16}
            end={66}
            height={150}
            width={190}
          />
          <ClickRipple frame={f} at={72} x={targetX} y={targetY} />
          <div
            style={{
              position: 'absolute',
              right: 30,
              top: 30,
              padding: '22px 26px',
              borderRadius: 14,
              background: 'rgba(9,16,30,0.94)',
              border: '1px solid rgba(120,246,255,0.35)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.5), 0 0 50px rgba(40,224,255,0.16)',
              opacity: nameIn,
              transform: `translateX(${(1 - nameIn) * 26}px)`,
            }}
          >
            <div style={{fontFamily: '-apple-system, "SF Pro Display", "PingFang SC", sans-serif', fontSize: 34, fontWeight: 700, color: '#f4f7ff', letterSpacing: -0.5}}>
              Better Sidebar
            </div>
            <div style={{marginTop: 8, fontFamily: '"SF Mono", Menlo, monospace', fontSize: 17, color: 'rgba(160,240,255,0.9)'}}>
              dsh-better-sidebar
            </div>
            <div style={{marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.58)'}}>
              <span style={{padding: '4px 9px', borderRadius: 7, border: '1px solid rgba(160,200,255,0.3)'}}>0.28.2</span>
              <span style={{padding: '4px 9px', borderRadius: 7, border: '1px solid rgba(160,200,255,0.3)'}}>UI 增强</span>
              <span>MIT</span>
            </div>
          </div>
        </div>
      </div>
      <Caption kicker="01 / 打开" title="跳到「插件」，打开它。" delay={8} />
    </AbsoluteFill>
  );
};

/* ── C4: jump onto 安装, click, progress, installed ───────────────────────── */

export const C3AddPlugin: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 16));
  const push = 1 + 0.045 * smooth(seg(f, 0, 220));
  const targetX = (800 / 1600) * W;
  const targetY = (575 / 900) * H;
  const clickAt = 82;
  const progress = smooth(seg(f, 96, 168));
  const installed = smooth(seg(f, 176, 196));
  const steps = ['下载包', '校验完整性', '写入 profile'];
  const activeStep = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: TOP,
          width: W,
          height: H,
          opacity: enter,
          transformOrigin: '50% 50%',
          transform: `perspective(1900px) translateY(${(1 - enter) * 28}px) rotateX(${(1 - enter) * 5}deg) scale(${push})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(180,205,255,0.22)',
            boxShadow: '0 60px 180px rgba(0,0,0,0.78), 0 0 150px rgba(60,110,230,0.26)',
            background: '#f8f9fb',
          }}
        >
          <Img
            src={staticFile('shots/dsh-add-plugin-clean.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
          <WhaleJump
            frame={f}
            from={[W + 100, H + 80]}
            to={[targetX, targetY]}
            start={22}
            end={70}
            height={145}
            width={180}
          />
          <ClickRipple frame={f} at={clickAt} x={targetX} y={targetY} />
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 470,
              width: 680,
              padding: '18px 22px',
              borderRadius: 12,
              background: 'rgba(9,16,30,0.94)',
              border: '1px solid rgba(120,246,255,0.3)',
              boxShadow: '0 26px 70px rgba(0,0,0,0.55)',
              opacity: f < 96 ? 0 : 1 - installed,
              transform: `translateY(${(1 - progress) * 10}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 18, color: '#e8f2ff'}}>
              正在安装 dsh-better-sidebar<span style={{color: 'rgba(160,240,255,0.9)'}}>…</span>
              <span style={{marginLeft: 'auto', fontFamily: '"SF Mono", Menlo, monospace', fontSize: 15, color: '#9cf6ff'}}>{Math.round(progress * 100)}%</span>
            </div>
            <div style={{display: 'flex', gap: 16, marginTop: 9}}>
              {steps.map((s, i) => (
                <span
                  key={s}
                  style={{
                    fontFamily: '-apple-system, "PingFang SC", sans-serif',
                    fontSize: 13,
                    color: i <= activeStep ? 'rgba(160,240,255,0.9)' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {i < activeStep ? '✓' : '·'} {s}
                </span>
              ))}
            </div>
            <div style={{marginTop: 12, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
              <div style={{width: `${progress * 100}%`, height: '100%', background: 'linear-gradient(90deg,#28e0ff,#7aa2ff)', boxShadow: '0 0 18px rgba(40,224,255,0.7)'}} />
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 330,
              top: 486,
              width: 620,
              padding: '18px 24px',
              borderRadius: 12,
              background: 'rgba(9,16,30,0.96)',
              border: '1px solid rgba(120,246,200,0.5)',
              boxShadow: '0 26px 70px rgba(0,0,0,0.55), 0 0 40px rgba(40,224,255,0.18)',
              opacity: installed,
              transform: `translateY(${(1 - installed) * 14}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{color: COLORS.mint, fontSize: 24}}>✓</span>
            <div>
              <div style={{fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 19, color: 'rgba(240,252,248,0.96)'}}>
                dsh-better-sidebar 已安装
              </div>
              <div style={{marginTop: 3, fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 14, color: 'rgba(180,230,220,0.7)'}}>
                重启 DSH 加载它，然后打开右侧栏
              </div>
            </div>
          </div>
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
        <div style={{fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 15, letterSpacing: 2, color: 'rgba(170,195,255,0.55)', marginBottom: 10}}>
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
      <Caption kicker="02 / 安装" title="跳到「安装」，等它装好。" delay={8} />
    </AbsoluteFill>
  );
};
