/**
 * Story scenes per the user's revised narrative:
 *   S2: app dock → whale jumps onto the DSH app icon → DSH opens → whale looks around.
 *   S3: whale jumps onto the whale plugin button → plugin page opens.
 *   S4: whale types the plugin name into the search box → result card.
 */

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Grain} from '../../components/Chrome';
import {DshBackdrop} from '../../stage/DshStage';
import {COLORS} from '../../tokens';

const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a || 1)));
const W = 1280;
const H = 720;
const LEFT = 320;
const TOP = 110;

const Whale: React.FC<{f: number; from: [number, number]; to: [number, number]; start: number; end: number; height: number; width: number; face?: number}> = ({
  f,
  from,
  to,
  start,
  end,
  height,
  width,
  face = 1,
}) => {
  const p = smooth(seg(f, start, end));
  const landed = Math.max(0, f - end);
  const squash = Math.exp(-Math.pow(landed / 4, 2)) * 0.14;
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const arc = Math.sin(Math.PI * p) * height;
  const rot = Math.sin(Math.PI * p) * 10 - p * 6;
  const h = (width * 340) / 560;
  return (
    <img
      src={staticFile('shots/whale-sprite.png')}
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - arc - h / 2,
        width,
        height: h,
        transform: `rotate(${rot}deg) scale(${face * (1 + squash)}, ${1 - squash})`,
        filter: 'drop-shadow(0 16px 26px rgba(0,0,0,.42)) drop-shadow(0 0 16px rgba(120,180,255,.3))',
        pointerEvents: 'none',
      }}
    />
  );
};

const Ripple: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => {
  const k = Math.max(0, Math.min(1, (f - at) / 16));
  if (f < at || k >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 40,
        top: y - 40,
        width: 80,
        height: 80,
        borderRadius: 999,
        border: '3px solid rgba(255,255,255,0.95)',
        boxShadow: '0 0 40px rgba(110,180,255,0.9)',
        opacity: 1 - k,
        transform: `scale(${0.3 + k})`,
      }}
    />
  );
};

const Window: React.FC<{children?: React.ReactNode; scale?: number; opacity?: number; origin?: string}> = ({children, scale = 1, opacity = 1, origin = '50% 100%'}) => (
  <div
    style={{
      position: 'absolute',
      left: LEFT,
      top: TOP,
      width: W,
      height: H,
      opacity,
      transformOrigin: origin,
      transform: `scale(${scale})`,
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
      {children}
    </div>
  </div>
);

/* ── S2: app dock → DSH opens → whale looks around ───────────────────────── */

const DockIcon: React.FC<{children: React.ReactNode; active?: boolean; press?: number}> = ({children, active, press = 0}) => (
  <div
    style={{
      width: 104,
      height: 104,
      borderRadius: 24,
      background: active ? 'linear-gradient(160deg,#2c6bff,#173a9a)' : 'rgba(255,255,255,0.92)',
      boxShadow: active
        ? '0 0 0 2px rgba(140,200,255,0.9), 0 0 44px rgba(70,140,255,0.85), 0 14px 30px rgba(0,0,0,0.4)'
        : '0 14px 30px rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${1 - press * 0.08})`,
    }}
  >
    {children}
  </div>
);

export const StoryDock: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 14));
  const dockFade = 1 - smooth(seg(f, 66, 88));
  const winScale = 0.18 + 0.82 * smooth(seg(f, 48, 80));
  const winOpacity = smooth(seg(f, 46, 56));
  const press = smooth(seg(f, 44, 50)) * (1 - smooth(seg(f, 58, 66)));
  const look = f > 104 ? Math.sin((f - 104) / 7) : 0;
  const face = look > 0.15 ? -1 : 1;
  const windowTopRight: [number, number] = [1460, 250];
  const dockTarget: [number, number] = [960, 856];
  const START: [number, number] = [660, 480];
  const whalePos: [number, number] = [
    START[0] + (dockTarget[0] - START[0]) * smooth(seg(f, 8, 44)),
    START[1] + (dockTarget[1] - START[1]) * smooth(seg(f, 8, 44)),
  ];
  const jumpFromDock = smooth(seg(f, 78, 100));
  const finalPos: [number, number] = [
    whalePos[0] + (windowTopRight[0] - whalePos[0]) * jumpFromDock,
    whalePos[1] + (windowTopRight[1] - whalePos[1]) * jumpFromDock,
  ];
  const arc = f < 100 ? Math.sin(Math.PI * smooth(seg(f, 8, 44))) * 120 : Math.sin(Math.PI * jumpFromDock) * 90;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <div style={{position: 'absolute', inset: 0, opacity: enter}}>
        <Window scale={winScale} opacity={winOpacity} origin="50% 100%">
          <Img src={staticFile('shots/dsh-main-clean.png')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        </Window>
        {f < 46 ? (
          <Whale f={f} from={[660, 480]} to={[660, 480]} start={0} end={1} height={0} width={230} face={1} />
        ) : f < 78 ? (
          <Whale f={f} from={[660, 480]} to={[960, 856]} start={8} end={44} height={130} width={170} face={1} />
        ) : (
          <img
            src={staticFile('shots/whale-sprite.png')}
            style={{
              position: 'absolute',
              left: finalPos[0] - 85,
              top: finalPos[1] - arc - 52,
              width: 170,
              height: 103,
              transform: `rotate(${look * 8}deg) scale(${face}, 1)`,
              filter: 'drop-shadow(0 16px 26px rgba(0,0,0,.42)) drop-shadow(0 0 16px rgba(120,180,255,.3))',
            }}
          />
        )}
        <Ripple f={f} at={44} x={960} y={856} />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 84,
            transform: 'translateX(-50%)',
            width: 1040,
            height: 168,
            borderRadius: 34,
            background: 'rgba(14,22,42,0.55)',
            border: '1px solid rgba(160,200,255,0.22)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 30px 90px rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 44,
            opacity: dockFade,
          }}
        >
          <DockIcon><svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M3 6.5h6l1.8 2H21v9.5H3V6.5Z" stroke="#4a5568" strokeWidth="1.6"/></svg></DockIcon>
          <DockIcon><svg width="46" height="46" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="2.5" stroke="#4a5568" strokeWidth="1.6"/><circle cx="18" cy="18" r="2.5" stroke="#4a5568" strokeWidth="1.6"/><path d="M6 8.5v7a2.5 2.5 0 0 0 2.5 2.5H15M18 15.5v-7A2.5 2.5 0 0 0 15.5 6H9" stroke="#4a5568" strokeWidth="1.6"/></svg></DockIcon>
          <DockIcon active press={press}>
            <Img src={staticFile('brand/dsh-app-icon.svg')} style={{width: 86, height: 86, objectFit: 'contain'}} />
          </DockIcon>
          <DockIcon><svg width="46" height="46" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6"/></svg></DockIcon>
          <DockIcon><svg width="46" height="46" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#4a5568" strokeWidth="1.6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="#4a5568" strokeWidth="1.6" strokeLinecap="round"/></svg></DockIcon>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── S3: whale jumps onto the whale plugin button → plugin page ─────────── */

const BTN = {x: LEFT + 34, y: TOP + 160};

export const StoryWhaleButton: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 12));
  const pageIn = smooth(seg(f, 54, 66));
  const press = smooth(seg(f, 40, 46)) * (1 - smooth(seg(f, 56, 64)));
  const target: [number, number] = [BTN.x + 6, BTN.y + 6];
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <Window scale={1 + 0.02 * smooth(seg(f, 0, 90))} opacity={enter} origin="5% 25%">
        <Img src={staticFile('shots/dsh-main-clean.png')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        <div style={{position: 'absolute', inset: 0, opacity: pageIn}}>
          <Img src={staticFile('shots/dsh-plugin-page.png')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 140,
            width: 48,
            height: 48,
            borderRadius: 13,
            background: '#ffffff',
            border: '1px solid #dbe3f2',
            boxShadow: '0 0 0 3px rgba(77,141,255,0.18), 0 8px 22px rgba(40,80,180,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${1 - 0.1 * press})`,
          }}
        >
          <img src={staticFile('brand/dsh-whale-black.svg')} style={{width: 30, height: 26}} />
        </div>
        <Whale f={f} from={[W - 80, 120]} to={target} start={4} end={38} height={110} width={120} face={1} />
        <Ripple f={f} at={40} x={target[0]} y={target[1]} />
      </Window>
    </AbsoluteFill>
  );
};

/* ── S4: type the plugin name → result card ──────────────────────────────── */

const QUERY = 'better-sidebar';
const CARD = {left: 317, top: 272, w: 700, h: 132};

export const StorySearch: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 12));
  const typed = Math.min(QUERY.length, Math.max(0, Math.floor((f - 26) / 4.2) + (f >= 26 ? 1 : 0)));
  const resultIn = smooth(seg(f, 82, 102));
  const target: [number, number] = [520, 150];
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <Window scale={1 + 0.015 * smooth(seg(f, 0, 120))} opacity={enter} origin="20% 30%">
        <Img src={staticFile('shots/dsh-plugin-page.png')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        {f >= 26 ? (
          <div style={{position: 'absolute', left: 326, top: 186, fontSize: 15, color: '#1b2432', fontFamily: '-apple-system, "PingFang SC", sans-serif', whiteSpace: 'nowrap'}}>
            {QUERY.slice(0, typed)}
            <span style={{opacity: Math.floor(f / 7) % 2 === 0 ? 1 : 0}}>|</span>
          </div>
        ) : null}
        <Whale f={f} from={[W - 60, H + 40]} to={target} start={8} end={40} height={100} width={90} />
        <div
          style={{
            position: 'absolute',
            left: CARD.left,
            top: CARD.top,
            width: CARD.w,
            height: CARD.h,
            opacity: resultIn,
            transform: `translateY(${(1 - resultIn) * 18}px)`,
            background: '#fff',
            border: '1px solid #e6eaf1',
            borderRadius: 14,
            boxShadow: '0 18px 46px rgba(20,32,60,0.10)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 18px',
          }}
        >
          <div style={{width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(160deg,#e9eefb,#dce6ff)', border: '1px solid #dbe3f2', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={staticFile('brand/dsh-whale-black.svg')} style={{width: 34, height: 30}} />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: 18, fontWeight: 600, color: '#15181d'}}>dsh-better-sidebar</span>
              <span style={{fontSize: 11, color: '#6b7280', border: '1px solid #e3e7ee', borderRadius: 6, padding: '2px 7px'}}>UI 增强</span>
            </div>
            <div style={{marginTop: 4, fontSize: 12, color: '#8a8f99'}}>omdsh-dev · 0.28.2 · 2026年10月27日</div>
            <div style={{marginTop: 7, fontSize: 13, color: '#5b6370', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>侧边栏完整工作台：内置文件渲染编辑、终端、Git 与子代理，支持三方插件注册新 Tab。</div>
          </div>
        </div>
        <Whale f={f} from={[CARD.left + 80, CARD.top - 10]} to={[CARD.left + CARD.w - 80, CARD.top + 20]} start={104} end={124} height={60} width={90} />
      </Window>
    </AbsoluteFill>
  );
};
