/**
 * CASE30 Hero — 30s Better Sidebar case 片的开场两场。
 *
 *  C1Hook   90f：暗色 DSH 片场 + 网格/光柱常驻；左下真实 mac 终端逐字打 `dsh`；
 *               右上 hook；f56 起真实 DSH 界面（截图裁切，light）从下方升起。
 *  C2Reveal 120f：DSH 界面继续升起并稳定；官方黑鲸鱼 app icon 作为"鲸鱼徽章"浮现/落定
 *               （squash 回弹，悬浮在窗口旁）；字幕 00 / DSH「在 DSH 里，装上它」。
 *
 * 关键约束：
 *  - 全程保持 DSH 片场背景（网格 / 光柱 / 窗光），不允许出现黑屏空景；
 *  - 品牌只用官方资产（brand/dsh-app-icon.svg、dsh-wordmark-white.svg），不自绘 DSH wordmark / 蓝色体素鲸；
 *  - DSH 界面用真实截图 shots/files-tree.png 裁切（object-fit 裁掉右侧栏），不自绘窗口内容；
 *  - C1→C2 的窗口位置 / 终端退出 / hook 状态严格衔接（同一个函数两端取值）。
 */

import React from 'react';
import {AbsoluteFill, Composition, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, MOTION, RADIUS, VIDEO} from '../../tokens';
import {Caption, Grain} from '../../components/Chrome';
import {DshBackdrop, DshVignette} from '../../stage/DshStage';
import {C7Outro} from './OutroScene';

// ───────────────────────── helpers ─────────────────────────
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const seg = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const springAt = (
  frame: number,
  fps: number,
  delay: number,
  config: {damping: number; mass: number; stiffness: number} = MOTION.spring
) => spring({frame: Math.max(0, frame - delay), fps, config});

// ───────────────────────── 片场背景（C1/C2 共用，保证不黑屏） ─────────────────────────
const Stage30: React.FC<{brightness?: number}> = ({brightness = 1}) => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <DshBackdrop />
    {/* 网格 */}
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
        backgroundPosition: 'center center',
        WebkitMaskImage: 'radial-gradient(ellipse 82% 72% at 50% 46%, #000 16%, rgba(0,0,0,0.32) 60%, transparent 92%)',
        maskImage: 'radial-gradient(ellipse 82% 72% at 50% 46%, #000 16%, rgba(0,0,0,0.32) 60%, transparent 92%)',
        opacity: 0.9 * brightness,
      }}
    />
    {/* 光柱：左薄荷 / 右蓝 */}
    <div
      style={{
        position: 'absolute',
        left: -160,
        top: -320,
        width: 860,
        height: 1500,
        transform: 'rotate(15deg)',
        background:
          'linear-gradient(180deg, rgba(94,242,194,0.15) 0%, rgba(77,107,254,0.06) 55%, rgba(0,0,0,0) 80%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
        opacity: brightness,
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: -240,
        top: -360,
        width: 1020,
        height: 1580,
        transform: 'rotate(-13deg)',
        background:
          'linear-gradient(180deg, rgba(77,107,254,0.26) 0%, rgba(77,107,254,0.08) 58%, rgba(0,0,0,0) 82%)',
        filter: 'blur(36px)',
        pointerEvents: 'none',
        opacity: brightness,
      }}
    />
    {/* 右上方蓝光池（衬 hook / wordmark 的层次） */}
    <div
      style={{
        position: 'absolute',
        right: -260,
        top: -300,
        width: 1200,
        height: 980,
        background: 'radial-gradient(closest-side, rgba(77,107,254,0.30), rgba(77,107,254,0.08) 54%, transparent 76%)',
        filter: 'blur(44px)',
        pointerEvents: 'none',
      }}
    />
    {/* 左下方薄荷微光 */}
    <div
      style={{
        position: 'absolute',
        left: -200,
        bottom: -260,
        width: 1000,
        height: 820,
        background: 'radial-gradient(closest-side, rgba(94,242,194,0.12), transparent 72%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }}
    />
    {/* 地面光池 */}
    <div
      style={{
        position: 'absolute',
        left: '12%',
        right: '12%',
        bottom: -200,
        height: 580,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(77,107,254,0.26), transparent 70%)',
        filter: 'blur(28px)',
        pointerEvents: 'none',
      }}
    />
    <DshVignette />
  </AbsoluteFill>
);

// ───────────────────────── 真实 DSH 界面窗口（截图裁切，不重画 UI） ─────────────────────────
/**
 * 窗口里放的是真实截图 shots/files-tree.png（1440×900）。
 * 通过把 <Img> 放大到窗口宽的 170%（左对齐、顶部对齐）裁掉右侧 Better Sidebar 区域，
 * 只露出会话栏 + composer（此时还没装插件）。
 */
const DSH_WIN = {left: 660, width: 1160, height: 725};

const DshScreenshotWindow: React.FC<{top: number; scale?: number; opacity?: number}> = ({
  top,
  scale = 1,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: DSH_WIN.left,
      top,
      width: DSH_WIN.width,
      height: DSH_WIN.height,
      borderRadius: 20,
      overflow: 'hidden',
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: '50% 100%',
      border: '1px solid rgba(142,166,255,0.42)',
      background: '#F5F7FB',
      boxShadow:
        '0 0 0 1px rgba(142,166,255,0.14), 0 70px 170px rgba(0,0,0,0.66), 0 0 110px rgba(77,107,254,0.22)',
    }}
  >
    {/* 窗口标题栏（真机风的 chrome，不是 DSH 界面重画） */}
    <div
      style={{
        height: 46,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 18px',
        background: 'linear-gradient(180deg,#FBFCFE,#F2F5FA)',
        borderBottom: '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <div style={{display: 'flex', gap: 8}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span key={c} style={{width: 12, height: 12, borderRadius: 99, background: c, opacity: 0.9}} />
        ))}
      </div>
      <span style={{fontFamily: FONT.mono, fontSize: 17, letterSpacing: 0.5, color: '#667085'}}>
        deepseek harness — 新会话
      </span>
      <span
        style={{
          marginLeft: 'auto',
          fontFamily: FONT.mono,
          fontSize: 16,
          letterSpacing: 1.6,
          color: '#98A2B3',
        }}
      >
        workspace
      </span>
    </div>

    {/* 真实截图（整张，含左侧会话栏 + composer）；右侧 Better Sidebar 区域用遮罩盖住（此时还没装） */}
    <div style={{position: 'relative', height: DSH_WIN.height - 46, overflow: 'hidden', background: '#F7F8FB'}}>
      <Img
        src={staticFile('shots/files-tree.png')}
        style={{width: '100%', height: 'auto', display: 'block'}}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '46%',
          background: '#F7F8FB',
          borderLeft: '1px solid rgba(15,23,42,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 232,
            height: 132,
            borderRadius: 12,
            border: '1px dashed rgba(142,166,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT.mono,
            fontSize: 16,
            letterSpacing: 2,
            color: '#98A2B3',
          }}
        >
          BETTER SIDEBAR
        </div>
        <div style={{fontFamily: FONT.zh, fontSize: 18, color: '#98A2B3', letterSpacing: 0.5}}>
          侧栏 · 安装后出现
        </div>
      </div>
    </div>

    {/* 窗口整体在下缘的接触阴影 */}
    <div
      style={{
        position: 'absolute',
        left: '8%',
        right: '8%',
        bottom: -40,
        height: 60,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.55), transparent 70%)',
        filter: 'blur(14px)',
        pointerEvents: 'none',
      }}
    />
  </div>
);

// ───────────────────────── 左下真实 mac 终端 ─────────────────────────
const Terminal: React.FC<{typed: number; opacity: number; translateY: number}> = ({
  typed,
  opacity,
  translateY,
}) => {
  const frame = useCurrentFrame();
  const text = 'dsh'.slice(0, typed);
  const caretOn = frame % 20 < 11;
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        top: 566,
        width: 548,
        height: 330,
        borderRadius: 14,
        overflow: 'hidden',
        opacity,
        transform: `translateY(${translateY}px)`,
        background: 'linear-gradient(180deg, rgba(12,16,24,0.96), rgba(7,10,16,0.98))',
        border: '1px solid rgba(142,166,255,0.24)',
        boxShadow: '0 50px 120px rgba(0,0,0,0.65), 0 0 60px rgba(77,107,254,0.14)',
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          height: 38,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 14px',
          borderBottom: '1px solid rgba(142,166,255,0.14)',
          background: 'rgba(18,24,36,0.9)',
        }}
      >
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span key={c} style={{width: 11, height: 11, borderRadius: 99, background: c, opacity: 0.85}} />
        ))}
        <span style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: 0.6, color: '#8A94A8'}}>
          better-sidebar — zsh — 120×32
        </span>
      </div>

      {/* 命令行 */}
      <div style={{padding: '22px 22px 0', fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.6}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'pre'}}>
          <span style={{color: COLORS.mint}}>➜</span>
          <span style={{color: COLORS.blue2}}>~</span>
          <span style={{color: COLORS.text}}>{text}</span>
          <span
            style={{
              display: 'inline-block',
              width: 13,
              height: 26,
              background: COLORS.mint,
              opacity: typed < 3 ? (caretOn ? 1 : 0.15) : 0.9,
              boxShadow: `0 0 12px ${COLORS.mint}`,
            }}
          />
        </div>
        <div style={{marginTop: 12, color: '#5F6B85', fontSize: 20}}>
          {typed >= 3 ? 'DeepSeek Harness · 已就绪' : ''}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════ C1 · HOOK ═══════════════════════════
// 90f / 3s：片场 + 终端打字 + 右上 hook；f56 起真实 DSH 窗口从底部升起。

const WINDOW_TOP_C1_END = 640; // C2 从这里继续升起（两场严格衔接）
const TERMINAL_OUT_START = 70;

export const C1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const brandIn = easeOut(seg(frame, 4, 20));
  const hookIn = easeOut(seg(frame, 10, 28));

  // 终端打字：f12 d / f21 s / f30 h
  const typed = frame >= 30 ? 3 : frame >= 21 ? 2 : frame >= 12 ? 1 : 0;
  // 终端退出：f70 起下滑淡出（C2 继续接）
  const termOut = easeInOut(seg(frame, TERMINAL_OUT_START, 89));
  const termOpacity = 1 - 0.7 * termOut;
  const termY = 34 * termOut;

  // 窗口从底部升起：f56 → f90，从 1080 升到 640
  const winIn = easeOut(seg(frame, 56, 89));
  const winTop = 1080 - (1080 - WINDOW_TOP_C1_END) * winIn;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <Stage30 brightness={0.94 + 0.06 * easeOut(seg(frame, 0, 20))} />

      {/* 官方白 wordmark（左上） */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 78,
          opacity: brandIn,
          transform: `translateY(${(1 - brandIn) * 10}px)`,
        }}
      >
        <Img
          src={staticFile('brand/dsh-wordmark-white.svg')}
          style={{width: 268, height: 'auto', display: 'block'}}
        />
      </div>

      {/* 右上 hook */}
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 96,
          width: 860,
          textAlign: 'right',
          opacity: hookIn,
          transform: `translateY(${(1 - hookIn) * 16}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 20,
            letterSpacing: 4,
            color: COLORS.mint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          DSH PLUGIN · BETTER SIDEBAR
          <span style={{width: 30, height: 2, background: COLORS.mint}} />
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT.zh,
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.24,
            letterSpacing: 0.4,
            color: COLORS.text,
            textShadow: '0 18px 60px rgba(0,0,0,0.55)',
          }}
        >
          你的 DSH 侧边栏，
          <br />
          还只是个<span style={{color: COLORS.blue2}}>文件列表</span>？
        </div>
      </div>

      {/* 真实 DSH 窗口（从底部升起；此段到 C1 末为 640，C2 继续） */}
      <DshScreenshotWindow top={winTop} opacity={seg(frame, 52, 62)} />

      {/* 左下终端 */}
      <Terminal typed={typed} opacity={termOpacity} translateY={termY} />

      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ C2 · REVEAL ═══════════════════════════
// 120f / 4s：窗口继续升起稳定；官方黑鲸鱼 app icon 浮现/落定（squash）；
// 背景始终是 DSH 片场，不黑屏。

const WHALE = {left: 384, top: 300, size: 244};

export const C2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 窗口：从 C1 末的 640 继续升到 320（spring 带一点过冲再落定）
  const winSpr = springAt(frame, fps, 0, {damping: 200, mass: 0.95, stiffness: 62});
  const winTop = 640 - 320 * Math.min(1.02, winSpr);
  const winScale = 1 + 0.008 * Math.sin(Math.min(Math.PI, Math.max(0, (frame - 10) / 46)));

  // hook 淡出（承接 C1 的完全可见）
  const hookOut = easeInOut(seg(frame, 14, 46));

  // 鲸鱼徽章：f2 起浮现 → f18 落定（带 squash 回弹）→ 轻微悬浮
  const whaleSpr = springAt(frame, fps, 2, {damping: 150, mass: 0.7, stiffness: 120});
  const landK = Math.exp(-Math.pow((frame - 18) / 3.4, 2)); // 落地瞬间的挤压包络
  const whaleScaleY = 0.86 + 0.14 * Math.min(1, whaleSpr) - 0.1 * landK;
  const whaleScaleX = 0.9 + 0.1 * Math.min(1, whaleSpr) + 0.06 * landK;
  const bob = Math.sin((frame - 20) / 11) * 5 * seg(frame, 20, 40) * (1 - seg(frame, 96, 118) * 0.4);
  const whaleO = seg(frame, 2, 10);

  // 终端接 C1 的状态继续退场
  const termOut2 = easeInOut(seg(frame, 0, 18));

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <Stage30 brightness={1} />

      {/* 官方白 wordmark（延续 C1） + hook 淡出 */}
      <div style={{position: 'absolute', left: 96, top: 78}}>
        <Img
          src={staticFile('brand/dsh-wordmark-white.svg')}
          style={{width: 268, height: 'auto', display: 'block'}}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 96,
          width: 860,
          textAlign: 'right',
          opacity: 1 - hookOut,
          transform: `translateY(${-14 * hookOut}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 20,
            letterSpacing: 4,
            color: COLORS.mint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          DSH PLUGIN · BETTER SIDEBAR
          <span style={{width: 30, height: 2, background: COLORS.mint}} />
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT.zh,
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.24,
            letterSpacing: 0.4,
            color: COLORS.text,
          }}
        >
          你的 DSH 侧边栏，
          <br />
          还只是个<span style={{color: COLORS.blue2}}>文件列表</span>？
        </div>
      </div>

      {/* 真实 DSH 窗口继续升起 */}
      <DshScreenshotWindow top={winTop} scale={winScale} />

      {/* 终端：接 C1 末状态继续下滑淡出（保证两场衔接） */}
      <Terminal
        typed={3}
        opacity={0.3 * (1 - termOut2)}
        translateY={34 + 40 * termOut2}
      />

      {/* 鲸鱼徽章：官方 app icon，悬浮在窗口左侧 */}
      <div
        style={{
          position: 'absolute',
          left: WHALE.left,
          top: WHALE.top + bob,
          width: WHALE.size,
          height: WHALE.size,
          zIndex: 8,
          opacity: whaleO,
          transform: `scale(${whaleScaleX}, ${whaleScaleY}) rotate(${-6 + 4 * Math.min(1, whaleSpr)}deg)`,
          transformOrigin: '50% 72%',
        }}
      >
        {/* 光晕 */}
        <div
          style={{
            position: 'absolute',
            inset: -70,
            borderRadius: 999,
            background: `radial-gradient(closest-side, ${COLORS.blue}33, ${COLORS.mint}14 55%, transparent 76%)`,
            filter: 'blur(18px)',
            pointerEvents: 'none',
          }}
        />
        <Img
          src={staticFile('brand/dsh-app-icon.svg')}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            filter: 'drop-shadow(0 24px 42px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(77,107,254,0.28))',
          }}
        />
      </div>

      {/* C2 字幕 */}
      <Caption kicker="00 / DSH" title="在 DSH 里，装上它" delay={26} />

      <Grain />
    </AbsoluteFill>
  );
};

// ───────────────────────── 独立预览入口用 Root ─────────────────────────
/** 只注册 CASE30 的开场 + 片尾三场；主 Composition 由 compositions/ReelCase30.tsx 负责。 */
export const Case30HeroRoot: React.FC = () => (
  <>
    <Composition id="Case30Hero1" component={C1Hook} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Case30Hero2" component={C2Reveal} durationInFrames={120} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Case30Outro" component={C7Outro} durationInFrames={180} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
