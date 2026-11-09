/**
 * GuizangScenes — dsh-guizang-design film, built strictly on the v0.1 promo method
 * (docs/promo-method-v0.1.md + .research/dsh-reel-promo/better-sidebar-storyboard-v4.md):
 *
 *   0–5s    terminal dsh → voxel whale assembles → spout
 *   5–9s    app dock → 文件 → Git → DSH icon (three hops) → DSH window expands
 *   9–12s   DSH main window → whale jumps onto the 「插件」 tab → plugin page opens
 *           (same window shell all the way; no invented highlight box)
 *   12–15s  search plugin name → result card → whale jumps 「安装」 → blue progress → installed
 *   15–27.5s four skills, each in the method's four beats
 *           (聚焦 0.6s tab highlight / 点击 0.4s whale lands + ripple / 结果 1.2s panel switches / 停留 0.8s)
 *   27.5–30s black end card: name + install command + whale top-right
 *
 * The DSH window shell (left rail + window chrome) is the same in S3/S4/S5 so the
 * interface never switches underneath the viewer.
 */

import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, MOTION} from '../../tokens';
import {Grain} from '../../components/Chrome';
import {DshBackdrop} from '../../stage/DshStage';
import {S1Hook} from '../hero/HeroScenes';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const seg = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a || 1)));
const smooth = (x: number) => x * x * (3 - 2 * x);

// ── DSH window shell geometry (same numbers the story film uses) ─────────────
const W = 1280;
const H = 720;
const LEFT = 320;
const TOP = 110;

// ── assets ──────────────────────────────────────────────────────────────────
const SPRITE = 'shots/whale-sprite.png';
const DSH_MAIN = 'shots/dsh-main-clean.png';
const DSH_PLUGIN_PAGE = 'shots/dsh-plugin-page.png';
const PLUGIN_PAGE = 'shots/guizang/plugin-page.png';
const INSTALL_CMD = 'dsh plugin --profile web add dsh-guizang-design';

// ── whale sprite ────────────────────────────────────────────────────────────
const WhaleAt: React.FC<{
  x: number;
  y: number;
  rot?: number;
  squash?: number;
  width?: number;
  opacity?: number;
}> = ({x, y, rot = 0, squash = 0, width = 56, opacity = 1}) => {
  const h = (width * 340) / 560;
  return (
    <img
      src={staticFile(SPRITE)}
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - h / 2,
        width,
        height: h,
        opacity,
        transform: `rotate(${rot}deg) scale(1, ${1 - squash})`,
        filter: 'drop-shadow(0 16px 26px rgba(0,0,0,.42)) drop-shadow(0 0 16px rgba(120,180,255,.3))',
        pointerEvents: 'none',
      }}
    />
  );
};

const arcPos = (f: number, t0: number, t1: number, from: [number, number], to: [number, number], arc: number) => {
  const p = smooth(seg(f, t0, t1));
  return {
    x: from[0] + (to[0] - from[0]) * p,
    y: from[1] + (to[1] - from[1]) * p - Math.sin(Math.PI * p) * arc,
    rot: Math.sin(Math.PI * p) * 9 - p * 5,
    p,
    landed: f >= t1,
  };
};

const Ripple: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => {
  const k = Math.max(0, Math.min(1, (f - at) / 16));
  if (f < at || k >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 20,
        top: y - 20,
        width: 40,
        height: 40,
        borderRadius: 999,
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: '0 0 18px rgba(110,180,255,0.7)',
        opacity: 1 - k,
        transform: `scale(${0.4 + k * 0.6})`,
      }}
    />
  );
};

// ── S1 · 0–5s terminal → whale assembles → spout ─────────────────────────────
export const S1TerminalWhale: React.FC = () => (
  <S1Hook
    typed='dsh'
    termTitle='guizang-design — zsh — 120×32'
    hook='一套设计系统，'
    eyebrow='DSH PLUGIN · GUIZANG DESIGN'
    whale
  />
);

// ── S2 · 5–9s dock three hops → DSH window expands ──────────────────────────
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

const Dock: React.FC<{f: number; opacity: number; dshPress: number; gitPress: number; filePress: number}> = ({
  f,
  opacity,
  dshPress,
  gitPress,
  filePress,
}) => (
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
      opacity,
    }}
  >
    <DockIcon press={filePress}>
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
        <path d="M3 6.5h6l1.8 2H21v9.5H3V6.5Z" stroke="#4a5568" strokeWidth="1.6" />
      </svg>
    </DockIcon>
    <DockIcon press={gitPress}>
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="6" r="2.5" stroke="#4a5568" strokeWidth="1.6" />
        <circle cx="18" cy="18" r="2.5" stroke="#4a5568" strokeWidth="1.6" />
        <path d="M6 8.5v7a2.5 2.5 0 0 0 2.5 2.5H15M18 15.5v-7A2.5 2.5 0 0 0 15.5 6H9" stroke="#4a5568" strokeWidth="1.6" />
      </svg>
    </DockIcon>
    <DockIcon active press={dshPress}>
      <Img src={staticFile('brand/dsh-app-icon.svg')} style={{width: 86, height: 86, objectFit: 'contain'}} />
    </DockIcon>
    <DockIcon>
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#4a5568" strokeWidth="1.6" />
      </svg>
    </DockIcon>
    <DockIcon>
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#4a5568" strokeWidth="1.6" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="#4a5568" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </DockIcon>
  </div>
);

export const S2Dock: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 12));
  const dockFade = 1 - smooth(seg(f, 96, 112));
  const winScale = 0.18 + 0.82 * smooth(seg(f, 88, 112));
  const winOpacity = smooth(seg(f, 86, 96));
  const filePress = smooth(seg(f, 26, 32)) * (1 - smooth(seg(f, 38, 46)));
  const gitPress = smooth(seg(f, 48, 54)) * (1 - smooth(seg(f, 60, 68)));
  const dshPress = smooth(seg(f, 72, 78)) * (1 - smooth(seg(f, 88, 104)));

  // 1040px dock centered: icon centers at 664 / 812 / 960 (window-space)
  const FILE: [number, number] = [664, 856];
  const GIT: [number, number] = [812, 856];
  const DSH: [number, number] = [960, 856];
  const WTR: [number, number] = [1460, 250];

  let x = 660;
  let y = 470;
  let rot = 0;
  let squash = 0;
  let opacity = enter;
  if (f < 12) {
    // fall in from above the dock
  } else if (f < 34) {
    const h = arcPos(f, 12, 30, [660, 470], FILE, 120);
    x = h.x;
    y = h.y;
    rot = h.rot;
    squash = Math.exp(-Math.pow(Math.max(0, f - 30) / 4, 2)) * 0.14;
  } else if (f < 58) {
    const h = arcPos(f, 34, 54, FILE, GIT, 110);
    x = h.x;
    y = h.y;
    rot = h.rot;
    squash = Math.exp(-Math.pow(Math.max(0, f - 54) / 4, 2)) * 0.14;
  } else if (f < 82) {
    const h = arcPos(f, 58, 78, GIT, DSH, 110);
    x = h.x;
    y = h.y;
    rot = h.rot;
    squash = Math.exp(-Math.pow(Math.max(0, f - 78) / 4, 2)) * 0.14;
  } else if (f < 104) {
    x = DSH[0];
    y = DSH[1];
  } else {
    const h = arcPos(f, 104, 120, DSH, WTR, 90);
    x = h.x;
    y = h.y;
    rot = h.rot;
    squash = Math.exp(-Math.pow(Math.max(0, f - 120) / 4, 2)) * 0.14;
  }

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <div style={{position: 'absolute', inset: 0, opacity: enter}}>
        <div
          style={{
            position: 'absolute',
            left: LEFT,
            top: TOP,
            width: W,
            height: H,
            opacity: winOpacity,
            transformOrigin: '50% 100%',
            transform: `scale(${winScale})`,
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
            <Img src={staticFile(DSH_MAIN)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
          </div>
        </div>

        <Dock f={f} opacity={enter * dockFade} filePress={filePress} gitPress={gitPress} dshPress={dshPress} />
        <Ripple f={f} at={30} x={FILE[0]} y={FILE[1]} />
        <Ripple f={f} at={54} x={GIT[0]} y={GIT[1]} />
        <Ripple f={f} at={78} x={DSH[0]} y={DSH[1]} />
        <WhaleAt x={x} y={y} rot={rot} squash={squash} width={f >= 104 ? 48 : 64} opacity={opacity} />
      </div>
    </AbsoluteFill>
  );
};

// ── shared DSH window shell (S3/S4/S5 use it, so the interface never switches) ─
const DshWindow: React.FC<{
  children: React.ReactNode;
  scale?: number;
  opacity?: number;
  origin?: string;
}> = ({children, scale = 1, opacity = 1, origin = '50% 50%'}) => (
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

// ── S3 · 9–12s whale jumps onto the 「插件」 tab, plugin page opens ──────────
// dsh-main-clean.png is 3200×1800 rendered cover into 1280×720:
// scale = 1280/3200 = 0.4, height 720 → no vertical crop.
const PLUGIN_TAB: [number, number] = [100, 128]; // window-space top edge of the 「插件」 row

export const S3PluginTab: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 10));
  const pageIn = smooth(seg(f, 52, 68));
  const push = 1 + 0.02 * smooth(seg(f, 0, 90));

  const h = arcPos(f, 8, 36, [W - 60, 130], PLUGIN_TAB, 70);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <DshWindow scale={push} opacity={enter} origin='50% 50%'>
        <Img src={staticFile(DSH_MAIN)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        <div style={{position: 'absolute', inset: 0, opacity: pageIn}}>
          <Img src={staticFile(DSH_PLUGIN_PAGE)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        </div>
        <Ripple f={f} at={36} x={PLUGIN_TAB[0]} y={PLUGIN_TAB[1]} />
        <WhaleAt
          x={h.x}
          y={h.y}
          rot={h.rot}
          squash={Math.exp(-Math.pow(Math.max(0, f - 36) / 4, 2)) * 0.14}
          width={44}
        />
      </DshWindow>
    </AbsoluteFill>
  );
};

// ── S4 · 12–15s search → result → install → blue progress → installed ───────
export const QUERY = 'guizang-design';
const CARD = {left: 317, top: 272, w: 700, h: 132};
const SEARCH_TEXT = {left: 330, top: 186};
const INSTALL_BTN: [number, number] = [CARD.left + CARD.w - 64, CARD.top + CARD.h / 2];
const WHALE_SEARCH: [number, number] = [SEARCH_TEXT.left - 44, SEARCH_TEXT.top - 2];
const WHALE_INSTALL: [number, number] = [INSTALL_BTN[0], INSTALL_BTN[1] - 40];

export const S4SearchInstall: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 10));
  const typedLen = Math.max(0, Math.min(QUERY.length, Math.floor((f - 16) / 2.7) + (f >= 16 ? 1 : 0)));
  const typed = QUERY.slice(0, typedLen);
  const resultIn = smooth(seg(f, 64, 76));
  const clickAt = 92;
  const progress = smooth(seg(f, 94, 108));
  const installed = f >= 108;

  // whale: continues from the 插件 tab → search box; jumps to 安装 after the result appears
  const toSearch = arcPos(f, 6, 30, [100, 128], WHALE_SEARCH, 60);
  const toInstall = arcPos(f, 76, 92, WHALE_SEARCH, WHALE_INSTALL, 55);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <DshWindow
        scale={1 + 0.015 * smooth(seg(f, 0, 110))}
        opacity={enter}
        origin='20% 30%'
      >
        <Img src={staticFile(DSH_PLUGIN_PAGE)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />

        {/* typed query inside the real search field */}
        {f >= 16 ? (
          <div
            style={{
              position: 'absolute',
              left: SEARCH_TEXT.left,
              top: SEARCH_TEXT.top,
              fontSize: 15,
              color: '#1b2432',
              fontFamily: '-apple-system, "PingFang SC", sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {typed}
            <span style={{opacity: Math.floor(f / 7) % 2 === 0 ? 1 : 0}}>|</span>
          </div>
        ) : null}

        {/* result card */}
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
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid #dbe3f2',
            }}
          >
            <Img src={staticFile('brand/guizang-icon.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: 18, fontWeight: 600, color: '#15181d'}}>dsh-guizang-design</span>
              <span style={{fontSize: 11, color: '#6b7280', border: '1px solid #e3e7ee', borderRadius: 6, padding: '2px 7px'}}>主题与外观</span>
            </div>
            <div style={{marginTop: 4, fontSize: 12, color: '#8a8f99'}}>op7418 · 0.1.4 · 2026年11月5日</div>
            <div style={{marginTop: 7, fontSize: 13, color: '#5b6370', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              把歸藏的内容生产 skill 装进 dsh：网页 PPT、图文卡片、网页排版、去 AI 味，共用一套设计系统。
            </div>
          </div>
          {/* install button + progress states */}
          <div
            style={{
              width: 96,
              height: 34,
              borderRadius: 8,
              background: installed ? '#f2f4f8' : '#2c6bff',
              color: installed ? '#5b6370' : '#fff',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {installed ? '✓ 已安装' : f >= 94 ? '安装中…' : '安装'}
          </div>
        </div>

        {/* blue progress bar under the card (v0.1 reference position) */}
        {f >= 94 && f <= 112 ? (
          <div
            style={{
              position: 'absolute',
              left: CARD.left,
              top: CARD.top + CARD.h + 12,
              width: CARD.w,
              height: 8,
              borderRadius: 99,
              background: '#e8edf5',
              overflow: 'hidden',
              opacity: 1 - smooth(seg(f, 108, 112)),
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                borderRadius: 99,
                background: '#2c6bff',
                boxShadow: '0 0 14px rgba(44,107,255,0.55)',
              }}
            />
          </div>
        ) : null}

        <Ripple f={f} at={clickAt} x={INSTALL_BTN[0]} y={INSTALL_BTN[1]} />
        <WhaleAt
          x={f < 76 ? toSearch.x : toInstall.x}
          y={f < 76 ? toSearch.y : toInstall.y}
          rot={f < 76 ? toSearch.rot : toInstall.rot}
          squash={Math.exp(-Math.pow(Math.max(0, f - 92) / 4, 2)) * 0.14}
          width={44}
          opacity={f > 104 ? 1 - smooth(seg(f, 104, 110)) : 1}
        />
      </DshWindow>
    </AbsoluteFill>
  );
};

// ── S5 · 15–27.5s four skills, method's four beats each ─────────────────────
type Skill = {
  title: string;
  desc: string;
  resultTitle: string;
  resultSub: string;
  img: string;
  /** window-space centre of the skill card (from plugin-page.png) */
  at: [number, number];
  /** window-space card rect for the focus highlight */
  rect: {left: number; top: number; width: number; height: number};
};

const SKILLS: Skill[] = [
  {
    title: '网页 PPT',
    desc: '杂志风 / 瑞士风 · 横向翻页，WebGL 背景',
    resultTitle: '网页 PPT · 杂志风',
    resultSub: '横向翻页、演讲者视图、讲稿备注，单个 HTML 文件',
    img: 'shots/guizang/feature-ppt.png',
    at: [356, 348],
    rect: {left: 236, top: 352, width: 474, height: 147},
  },
  {
    title: '图文卡片',
    desc: '小红书 3:4 组图、公众号 21:9、1:1 分享卡',
    resultTitle: '图文卡片 · 一套主题三种尺寸',
    resultSub: '小红书 3:4 组图、公众号 21:9 头图、1:1 分享卡',
    img: 'shots/guizang/feature-cards.png',
    at: [850, 348],
    rect: {left: 730, top: 352, width: 467, height: 147},
  },
  {
    title: '网页排版',
    desc: '文章排成精排单页，可导 PDF 和长图',
    resultTitle: '网页排版 · 精排单页',
    resultSub: '忠实模式 / 解释模式，可导出 PDF 和长图',
    img: 'shots/guizang/feature-page.png',
    at: [356, 508],
    rect: {left: 236, top: 512, width: 474, height: 147},
  },
  {
    title: '去 AI 味',
    desc: '删空话和模板表达；语气档案保留你的写法',
    resultTitle: '去 AI 味 · 语气档案',
    resultSub: '删掉套话；从你的对话和文章学写作习惯',
    img: 'shots/guizang/feature-voice.png',
    at: [850, 508],
    rect: {left: 730, top: 512, width: 467, height: 147},
  },
];

const FEATURE_INTRO = 16;
const BEAT = 82; // 聚焦 16f + 点击 12f + 结果 36f + 停留 18f
const FOCUS_TAIL = 16;
const CLICK_TAIL = 28;

const Panel: React.FC<{skill: Skill; progress: number}> = ({skill, progress}) => (
  <div
    style={{
      position: 'absolute',
      left: 236,
      top: 330,
      width: 961,
      height: 340,
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e6eaf1',
      boxShadow: '0 28px 70px rgba(20,32,60,0.18)',
      opacity: progress,
      transform: `translateY(${(1 - progress) * 20}px)`,
      padding: '22px 26px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <div style={{fontSize: 20, fontWeight: 700, color: '#15181d', fontFamily: FONT.zh}}>{skill.resultTitle}</div>
    <div style={{fontSize: 13, color: '#6b7280', fontFamily: FONT.zh}}>{skill.resultSub}</div>
    <div style={{flex: 1, borderRadius: 10, overflow: 'hidden', border: '1px solid #e6eaf1', background: '#f8f9fb'}}>
      <Img src={staticFile(skill.img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center'}} />
    </div>
  </div>
);

export const S5Skills: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 12));

  // current feature + beat progress
  const local = f - FEATURE_INTRO;
  const index = local < 0 ? -1 : Math.min(SKILLS.length - 1, Math.floor(local / BEAT));
  const beat = local < 0 ? 0 : local - index * BEAT;
  const active = index >= 0 ? SKILLS[index] : null;
  const panelIn = index >= 0 ? smooth(seg(beat, CLICK_TAIL, CLICK_TAIL + 8)) : 0;

  // whale: hops to the target card (聚焦→点击), then perches on the panel's top-right
  // corner during 结果/停留 so it never covers the panel copy
  const PANEL_CORNER: [number, number] = [1146, 346];
  let whale = {x: W + 40, y: 120, rot: 0, squash: 0, opacity: 0};
  if (index >= 0) {
    const prev = index === 0 ? ([W + 40, 120] as [number, number]) : PANEL_CORNER;
    const toCard = arcPos(beat, 0, CLICK_TAIL, prev, active!.at, 70);
    const toCorner = arcPos(beat, CLICK_TAIL, CLICK_TAIL + 12, active!.at, PANEL_CORNER, 40);
    if (beat < CLICK_TAIL + 12) {
      whale = {
        x: toCard.x,
        y: toCard.y,
        rot: toCard.rot,
        squash: Math.exp(-Math.pow(Math.max(0, beat - CLICK_TAIL) / 4, 2)) * 0.14,
        opacity: 1,
      };
    } else {
      whale = {
        x: toCorner.x,
        y: toCorner.y,
        rot: toCorner.rot,
        squash: Math.exp(-Math.pow(Math.max(0, beat - CLICK_TAIL - 12) / 4, 2)) * 0.14,
        opacity: 1,
      };
    }
  }

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <Grain />
      <DshWindow scale={1 + 0.012 * smooth(seg(f, 0, 355))} opacity={enter} origin='50% 40%'>
        <Img src={staticFile(DSH_PLUGIN_PAGE)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        {/* the plugin page slides in from the right — no hard interface cut */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: smooth(seg(f, 2, 16)),
            transform: `translateX(${(1 - smooth(seg(f, 2, 16))) * 160}px)`,
          }}
        >
          <Img src={staticFile(PLUGIN_PAGE)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        </div>

        {/* focus highlight on the target skill card (subtle, like a pressed tab) */}
        {active && panelIn < 0.6 ? (
          <div
            style={{
              position: 'absolute',
              left: active.rect.left,
              top: active.rect.top,
              width: active.rect.width,
              height: active.rect.height,
              borderRadius: 10,
              background: 'rgba(15,23,42,0.10)',
              border: '1px solid rgba(15,23,42,0.22)',
              boxShadow: '0 10px 30px rgba(20,32,60,0.10)',
              opacity: smooth(seg(beat, 0, FOCUS_TAIL)) * (1 - panelIn),
            }}
          />
        ) : null}

        {active ? <Panel skill={active} progress={panelIn} /> : null}
        <Ripple f={beat} at={CLICK_TAIL} x={active ? active.at[0] : W} y={active ? active.at[1] : 0} />
        <WhaleAt x={whale.x} y={whale.y} rot={whale.rot} squash={whale.squash} width={44} opacity={whale.opacity * enter} />
      </DshWindow>
    </AbsoluteFill>
  );
};

// ── S6 · 27.5–30s black end card: name + install command + whale top-right ──
export const S6EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const enter = smooth(seg(f, 0, 14));
  const bob = Math.sin(f / 9) * 6;
  const whaleX = 1680;
  const whaleY = 210 + bob;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0, justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 20}px)`,
        }}
      >
        <div style={{fontSize: 88, fontWeight: 850, color: COLORS.text, letterSpacing: -2, fontFamily: FONT.zh}}>歸藏设计</div>
        <div style={{fontSize: 30, color: COLORS.mint, marginTop: 16, fontFamily: FONT.zh}}>把歸藏的内容生产 skill 装进 dsh</div>
        <div
          style={{
            marginTop: 40,
            padding: '18px 26px',
            borderRadius: 14,
            border: `1px solid ${COLORS.lineStrong}`,
            background: 'rgba(10,16,32,0.85)',
            fontFamily: FONT.mono,
            fontSize: 22,
            color: COLORS.text,
            display: 'flex',
            gap: 14,
          }}
        >
          <span style={{color: COLORS.mint}}>$</span>
          {INSTALL_CMD}
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 18, color: COLORS.dim, marginTop: 22}}>github.com/op7418/dsh-guizang-design</div>
      </div>
      <WhaleAt x={whaleX} y={whaleY} width={92} rot={-6} opacity={enter} />
    </AbsoluteFill>
  );
};

/** Kept for the composition data file. */
export const GUIZANG_SCENE_ASSETS = {INSTALL_CMD};
