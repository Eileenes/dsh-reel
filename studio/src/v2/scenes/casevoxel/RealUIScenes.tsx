/**
 * Real-UI scenes for the Better Sidebar film (sanitized DSH illustrations):
 *
 *   C3OpenPlugins:   whale jumps onto the「插件」nav item, clicks once.
 *   C4SearchInstall: the clean Discover page appears; the plugin name is typed
 *                    into the search box; a result card appears; the whale jumps
 *                    onto 安装, clicks, install progress → installed → command.
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

type JumpProps = {frame: number; from: [number, number]; to: [number, number]; start: number; end: number; height: number; width: number};

const WhaleJump: React.FC<JumpProps> = ({frame, from, to, start, end, height, width}) => {
  const p = smooth(seg(frame, start, end));
  const landed = Math.max(0, frame - end);
  const squash = Math.exp(-Math.pow(landed / 4, 2)) * 0.16;
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const arc = Math.sin(Math.PI * p) * height;
  const rot = Math.sin(Math.PI * p) * 10 - p * 6;
  const h = (width * 340) / 560;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - width * 0.7,
          top: y - arc - h * 0.72,
          width: width * 1.4,
          height: h * 1.45,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(140,195,255,.42), rgba(140,195,255,0) 72%)',
          filter: 'blur(9px)',
          pointerEvents: 'none',
        }}
      />
      <img
        src={staticFile('shots/whale-sprite.png')}
        style={{
          position: 'absolute',
          left: x - width / 2,
          top: y - arc - h / 2,
          width,
          height: h,
          transform: `rotate(${rot}deg) scale(${1 + squash}, ${1 - squash})`,
          filter: 'drop-shadow(0 16px 26px rgba(10,20,40,.38)) drop-shadow(0 0 16px rgba(120,180,255,.28))',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

const ClickRipple: React.FC<{frame: number; at: number; x: number; y: number}> = ({frame, at, x, y}) => {
  const k = Math.max(0, Math.min(1, (frame - at) / 16));
  if (frame < at || k >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 44,
        top: y - 44,
        width: 88,
        height: 88,
        borderRadius: 999,
        border: '3px solid rgba(255,255,255,0.95)',
        boxShadow: '0 0 50px rgba(110,180,255,0.95)',
        opacity: 1 - k,
        transform: `scale(${0.3 + k * 1.0})`,
      }}
    />
  );
};

const WindowFrame: React.FC<{children: React.ReactNode; opacity: number; transform: string}> = ({children, opacity, transform}) => (
  <div style={{position: 'absolute', left: LEFT, top: TOP, width: W, height: H, opacity, transformOrigin: '5.6% 25.8%', transform}}>
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
      {children}
    </div>
  </div>
);

/* ── C3: jump onto 插件, click ────────────────────────────────────────────── */

export const C3OpenPlugins: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 14));
  const out = smooth(seg(f, 108, 122));
  const push = 1 + 0.035 * smooth(seg(f, 0, 122));
  const startZoom = 1 + 0.75 * (1 - smooth(seg(f, 0, 44)));
  const targetX = (90 / 1600) * W;
  const targetY = (171 / 900) * H - (130 * 340) / 560 / 2 + 14;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <WindowFrame opacity={enter} transform={`perspective(1900px) translateY(${(1 - enter) * 30}px) rotateX(${(1 - enter) * 5}deg) scale(${push * startZoom}) translateX(${out * 40}px)`}>
        <Img src={staticFile('shots/dsh-main-clean.png')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        <WhaleJump frame={f} from={[W + 110, H + 50]} to={[targetX, targetY]} start={10} end={54} height={140} width={130} />
        <ClickRipple frame={f} at={60} x={targetX} y={targetY} />
      </WindowFrame>
      <Caption kicker="01 / 打开" title="跳到「插件」，点一下。" delay={6} />
    </AbsoluteFill>
  );
};

/* ── C4: search the plugin name, then jump onto 安装 ─────────────────────── */

const QUERY = 'better-sidebar';
const CARD_LEFT = 317;
const CARD_TOP = 272;
const CARD_W = 700;
const CARD_H = 132;
const INSTALL_X = CARD_LEFT + CARD_W - 60;
const INSTALL_Y = CARD_TOP + CARD_H / 2;

export const C4SearchInstall: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 14));
  const push = 1 + 0.045 * smooth(seg(f, 0, 260));
  const typed = Math.min(QUERY.length, Math.max(0, Math.floor((f - 20) / 4.6) + (f >= 20 ? 1 : 0)));
  const showText = f >= 20;
  const resultIn = smooth(seg(f, 78, 98));
  const clickAt = 172;
  const progress = smooth(seg(f, 184, 240));
  const installed = smooth(seg(f, 246, 266));
  const jumpStart = 116;
  const jumpEnd = 160;
  const steps = ['下载包', '校验完整性', '写入 profile'];
  const activeStep = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <WindowFrame opacity={enter} transform={`perspective(1900px) translateY(${(1 - enter) * 26}px) rotateX(${(1 - enter) * 4}deg) scale(${push})`}>
        <Img src={staticFile('shots/dsh-plugin-page.png')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        {showText ? (
          <div
            style={{
              position: 'absolute',
              left: 326,
              top: 186,
              fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", sans-serif',
              fontSize: 15,
              color: '#1b2432',
              whiteSpace: 'nowrap',
            }}
          >
            {QUERY.slice(0, typed)}
            <span style={{opacity: Math.floor(f / 7) % 2 === 0 ? 1 : 0}}>|</span>
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            left: CARD_LEFT,
            top: CARD_TOP,
            width: CARD_W,
            height: CARD_H,
            opacity: resultIn,
            transform: `translateY(${(1 - resultIn) * 18}px)`,
            background: '#ffffff',
            border: '1px solid #e6eaf1',
            borderRadius: 14,
            boxShadow: '0 18px 46px rgba(20,32,60,0.10)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 18px',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'linear-gradient(160deg,#e9eefb,#dce6ff)',
              border: '1px solid #dbe3f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={staticFile('brand/dsh-whale-black.svg')} style={{width: 34, height: 30}} />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: 18, fontWeight: 600, color: '#15181d', fontFamily: '-apple-system, "PingFang SC", sans-serif'}}>dsh-better-sidebar</span>
              <span style={{fontSize: 11, color: '#6b7280', border: '1px solid #e3e7ee', borderRadius: 6, padding: '2px 7px'}}>UI 增强</span>
            </div>
            <div style={{marginTop: 4, fontSize: 12, color: '#8a8f99'}}>omdsh-dev · 0.28.2 · 2026年10月27日</div>
            <div style={{marginTop: 7, fontSize: 13, color: '#5b6370', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              侧边栏完整工作台：内置文件渲染编辑、终端、Git 与子代理，支持三方插件注册新 Tab。
            </div>
          </div>
          <div
            style={{
              width: 76,
              height: 36,
              borderRadius: 9,
              background: '#15181d',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            安装
          </div>
        </div>

        <WhaleJump frame={f} from={[W + 80, H + 60]} to={[INSTALL_X, INSTALL_Y]} start={jumpStart} end={jumpEnd} height={120} width={130} />
        <ClickRipple frame={f} at={clickAt} x={INSTALL_X} y={INSTALL_Y} />

        <div
          style={{
            position: 'absolute',
            left: 300,
            top: 440,
            width: 680,
            padding: '18px 22px',
            borderRadius: 12,
            background: 'rgba(9,16,30,0.94)',
            border: '1px solid rgba(120,246,255,0.3)',
            boxShadow: '0 26px 70px rgba(0,0,0,0.55)',
            opacity: f < 184 ? 0 : 1 - installed,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 18, color: '#e8f2ff'}}>
            正在安装 dsh-better-sidebar<span style={{color: 'rgba(160,240,255,0.9)'}}>…</span>
            <span style={{marginLeft: 'auto', fontFamily: '"SF Mono", Menlo, monospace', fontSize: 15, color: '#9cf6ff'}}>{Math.round(progress * 100)}%</span>
          </div>
          <div style={{display: 'flex', gap: 16, marginTop: 9}}>
            {steps.map((s, i) => (
              <span key={s} style={{fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 13, color: i <= activeStep ? 'rgba(160,240,255,0.9)' : 'rgba(255,255,255,0.35)'}}>
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
            top: 456,
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
            <div style={{fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 19, color: 'rgba(240,252,248,0.96)'}}>dsh-better-sidebar 已安装</div>
            <div style={{marginTop: 3, fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 14, color: 'rgba(180,230,220,0.7)'}}>重启 DSH 加载它，然后打开右侧栏</div>
          </div>
        </div>
      </WindowFrame>

      <div style={{position: 'absolute', right: 96, bottom: 96, opacity: installed, textAlign: 'right'}}>
        <div style={{fontFamily: '-apple-system, "PingFang SC", sans-serif', fontSize: 15, letterSpacing: 2, color: 'rgba(170,195,255,0.55)', marginBottom: 10}}>安装命令</div>
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

      <Caption kicker="02 / 搜索 + 安装" title="搜到它，跳到「安装」。" delay={8} />
    </AbsoluteFill>
  );
};
