/**
 * P2 market scenes — S3 / S4 / S5 for the 24s dsh-reel promo film.
 *
 * These are self-contained Remotion scenes: each reads its own Sequence-relative
 * frame via useCurrentFrame() and renders the real dshmarket UI (MarketUI.tsx)
 * inside the deep-blue stage. The edit list lives in compositions/ReelPromo.tsx,
 * scene boundaries in data/timeline.ts.
 *
 * Layout contract (all three scenes share it):
 *   MarketUI is rendered at PANEL_W = 1500 px (1440 logical × 1.0417),
 *   so the panel is 1500×843.75 and sits at (210, 30). That keeps the
 *   lower-left Caption band free of UI for S3/S5; S4's push-in fades the
 *   panel bottom into a scrim so the caption never sits on legible UI.
 *
 * Timeline inside each scene (30fps):
 *   S3 (72f)  : match-cut out of S2's DSH window — panel settles 1.18→1.0,
 *               blur 2→0, fade in over 8f; search focused; caption 01/找插件
 *   S4 (120f) : type reel-studio → result card → camera push-in 1→1.18 onto
 *               the card + package-name annotation → 0.6s still
 *   S5 (78f)  : cut from S4's push-in — first 5f settle 1.06→1.0; detail page;
 *               install highlight → installing → ✓ installed + toast; caption
 */

import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT} from '../../tokens';
import {Caption, Grain} from '../../components/Chrome';
import {MarketUI, type MarketDetailData, type MarketItem} from '../../components/MarketUI';
import {DshBackdrop} from '../../stage/DshStage';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ───────────────────────── 共用布局常量 ─────────────────────────
/** 1440 逻辑宽 × 1.0417 = 1500 上屏宽；高度 810×1.0417 = 843.75 */
const PANEL_W = 1500;
const PANEL_H = 843.75;
const PANEL_LEFT = 210;
const PANEL_TOP = 30;
const UI_SCALE = PANEL_W / 1440;

/** MarketUI 内部（1440 逻辑）的卡片几何，换算到上屏坐标系。 */
const CARD_W = 585 * UI_SCALE;
const CARD_H = 196 * UI_SCALE;
const CARD_LEFT = 234 * UI_SCALE; // nav 208 + content padding 26
const CARD_TOP = 251 * UI_SCALE; // 20 + header 66 + tabs 40 + search 42 + cats 27 + gaps
const CARD_CENTER_X = CARD_LEFT + CARD_W / 2;
const CARD_CENTER_Y = CARD_TOP + CARD_H / 2;
const CARD_RIGHT = CARD_LEFT + CARD_W;
/** 推镜以卡片中心为原点，避免放大时把卡片推出画面。 */
const CARD_ORIGIN = `${(CARD_CENTER_X / PANEL_W) * 100}% ${(CARD_CENTER_Y / PANEL_H) * 100}%`;

const QUERY = 'reel-studio';

// ───────────────────────── 共用构件 ─────────────────────────
/** 面板背后的蓝色柔光 + 远处薄荷光；与片场 DshBackdrop 同族。 */
const BackGlow: React.FC<{drift?: number; strength?: number}> = ({drift = 0, strength = 1}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: PANEL_LEFT - 140 + drift,
        top: PANEL_TOP - 180,
        width: PANEL_W + 280,
        height: PANEL_H + 280,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(77,107,254,${0.26 * strength}) 0%, rgba(77,107,254,0) 62%)`,
        filter: 'blur(46px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: -260 - drift,
        bottom: -320,
        width: 980,
        height: 760,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(94,242,194,${0.12 * strength}) 0%, rgba(94,242,194,0) 66%)`,
        filter: 'blur(52px)',
      }}
    />
  </>
);

/** 产品 UI 落在片场里的地面阴影（让"窗口"有重量）。 */
const PanelShadow: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: PANEL_LEFT - 60,
      top: PANEL_TOP + PANEL_H - 40,
      width: PANEL_W + 120,
      height: 160,
      opacity,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 70%)',
      filter: 'blur(24px)',
    }}
  />
);

/** 字幕下方压暗带：只在 S4 推镜时出现，避免字幕压在可读卡片上。 */
const CaptionScrim: React.FC<{opacity: number}> = ({opacity}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity,
      background:
        'linear-gradient(180deg, rgba(5,7,13,0) 60%, rgba(5,7,13,0.42) 76%, rgba(5,7,13,0.82) 90%, rgba(5,7,13,0.94) 100%)',
    }}
  />
);

/** 卡片列表区（MarketUI 内部 grid）的几何，换算到上屏坐标，用于切换时盖住旧列表。 */
const GRID_LEFT = CARD_LEFT;
const GRID_TOP = CARD_TOP;
const GRID_W = 1180 * UI_SCALE;
const GRID_H = 552 * UI_SCALE;

/**
 * 搜索结果切换时的"清空带"：先把旧卡片列表快速压暗/清空，再切到新结果卡。
 * 关键点是 Result 切换用步进（0/1），MarketUI 内部新旧两套 grid 永远不同时可见；
 * 这个层只负责让过渡帧看起来是"刷新", 而不是两张卡叠在一起。
 */
const ResultSwapBlank: React.FC<{opacity: number}> = ({opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: GRID_LEFT,
      top: GRID_TOP,
      width: GRID_W,
      height: GRID_H,
      opacity,
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, #0a1120 0%, #060a14 100%)',
    }}
  />
);

/** 结果卡描边发光：与 MarketUI 卡片位置严格对齐（随面板一起缩放/位移）。 */
const CardGlowRing: React.FC<{opacity: number; pulse?: number}> = ({opacity, pulse = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: CARD_LEFT,
      top: CARD_TOP,
      width: CARD_W,
      height: CARD_H,
      borderRadius: 12 * UI_SCALE,
      border: '1.5px solid rgba(142,166,255,0.85)',
      boxShadow: `0 0 ${54 * pulse}px rgba(77,107,254,${0.5 * pulse}), inset 0 0 ${26 * pulse}px rgba(77,107,254,0.14)`,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

/**
 * S4 右侧的"包名映射"标注：卡片标题是 dsh-reel，但 npm 包名是 dsh-reel-studio。
 * 一条细引导线 + 两行小字，只是视频注记（不是 UI 字段），不抢卡片主信息。
 */
const PackageAnnotation: React.FC<{opacity: number; text?: string}> = ({opacity, text = 'dsh-reel-studio'}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: CARD_RIGHT + 14,
        top: CARD_CENTER_Y - 3,
        width: 5,
        height: 5,
        borderRadius: 999,
        background: COLORS.blue2,
        boxShadow: '0 0 12px rgba(142,166,255,0.9)',
        opacity,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: CARD_RIGHT + 16,
        top: CARD_CENTER_Y - 0.5,
        width: 88,
        height: 1,
        background: 'linear-gradient(90deg, rgba(142,166,255,0.6), rgba(142,166,255,0.12))',
        opacity,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: CARD_RIGHT + 114,
        top: CARD_CENTER_Y - 24,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: 2.2,
          color: 'rgba(147,160,189,0.82)',
        }}
      >
        包名
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 15,
          letterSpacing: 0.3,
          color: COLORS.blue2,
          textShadow: '0 0 18px rgba(77,107,254,0.35)',
        }}
      >
        {text}
      </div>
    </div>
  </>
);

/** 三个场景共用的片场底：DshBackdrop + 光晕。 */
const StageBg: React.FC<{drift?: number; strength?: number}> = ({drift, strength}) => (
  <>
    <DshBackdrop />
    <BackGlow drift={drift} strength={strength} />
  </>
);

// ───────────────────────── S3：市场打开 ─────────────────────────
export const S3MarketOpen: React.FC = () => {
  const frame = useCurrentFrame();

  // 承接 S2 的"镜头穿过 DSH 窗口"：从 1.18 倍、2px blur、暗处收进 1.0（0–8f）。
  const settle = interpolate(frame, [0, 8], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const bgIn = settle; // 光晕/阴影与面板同步淡入

  // 入场后轻微呼吸运镜 + 背景与 UI 的差速（视差感）。
  const breatheX = Math.sin(frame / 34) * 3.2;
  const breatheY = Math.cos(frame / 42) * 2.2;
  const bgDrift = -Math.sin(frame / 40) * 14;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0, overflow: 'hidden'}}>
      <StageBg drift={bgDrift} strength={bgIn} />
      <PanelShadow opacity={bgIn} />
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT,
          top: PANEL_TOP,
          width: PANEL_W,
          height: PANEL_H,
          transformOrigin: '50% 50%',
          opacity: settle,
          filter: `blur(${(1 - settle) * 2}px)`,
          transform: `translate(${breatheX * settle}px, ${breatheY * settle}px) scale(${1.18 - 0.18 * settle})`,
        }}
      >
        <MarketUI
          width={PANEL_W}
          typed=''
          query=''
          resultState='default'
          installState='idle'
          detail={false}
          frame={frame}
          resultEnter={0}
          detailEnter={0}
        />
      </div>
      <Caption kicker='01 / 找插件' title='在 DSH 里，搜一下' delay={10} />
      <Grain />
    </AbsoluteFill>
  );
};

// ───────────────────────── S4：搜索 → 结果 → 推近 ─────────────────────────
export type S4SearchProps = {
  /** 要搜索的插件名，默认 dsh-reel */
  query?: string;
  /** 结果卡数据，默认 dsh-reel 市场条目 */
  item?: MarketItem;
  /** 卡片右侧的包名注记，默认 dsh-reel-studio */
  packageAnnotation?: string;
  captionTitle?: string;
  captionSub?: string;
};

export const S4Search: React.FC<S4SearchProps> = ({
  query = QUERY,
  item,
  packageAnnotation = 'dsh-reel-studio',
  captionTitle = '搜到了：dsh-reel-studio',
  captionSub = '插件市场 · 一键安装',
}) => {
  const frame = useCurrentFrame();

  // 逐字输入：8→58 帧打完整个查询词（速度按词长自适应）；0.25s 防抖后（≈66 帧）结果落地。
  const perChar = (58 - 8) / Math.max(1, query.length);
  const typedLen = Math.max(0, Math.min(query.length, Math.floor((frame - 8) / perChar) + 1));
  const typed = query.slice(0, typedLen);
  const committed = frame >= 64;
  // 关键：resultEnter 用步进而不是 crossfade —— MarketUI 内旧列表(opacity 1-r)
  // 与新结果卡(opacity r) 永远不会同时可见，杜绝 64–76f 的双层重影。
  const SWAP_FRAME = 72;
  const resultEnter = frame >= SWAP_FRAME ? 1 : 0;
  const resultState: 'default' | 'results' = frame < SWAP_FRAME ? 'default' : 'results';
  // 68–72 压暗/清空旧列表（dip→1），72f 完成切换，72–76 揭开新结果卡；
  // 过渡中间有 1–2 帧空结果区，宁可空也不叠字。
  const dip =
    frame < 66
      ? 0
      : frame <= SWAP_FRAME
        ? (frame - 66) / (SWAP_FRAME - 66)
        : frame <= 76
          ? 1 - (frame - SWAP_FRAME) / (76 - SWAP_FRAME)
          : 0;

  // 结果出现后推近：scale 1→1.18、translate 更贴卡片（右侧自然裁切在面板边缘）；102 帧后完全定格（0.6s）。
  const push = interpolate(frame, [80, 102], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const uiFrame = Math.min(frame, 102);
  const ringPulse = 0.85 + 0.15 * Math.sin(uiFrame / 5.5);
  // 包名标注在推镜后段淡入（不是 UI 字段，是视频注记）
  const annOpacity = interpolate(frame, [84, 98], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const annotationOpacity = annOpacity * Math.min(1, push * 1.6);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0, overflow: 'hidden'}}>
      <StageBg drift={-Math.sin(frame / 50) * 10} strength={1.05} />
      <PanelShadow />
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT,
          top: PANEL_TOP,
          width: PANEL_W,
          height: PANEL_H,
          transformOrigin: CARD_ORIGIN,
          transform: `translate(${240 * push}px, ${95 * push}px) scale(${1 + 0.18 * push})`,
        }}
      >
        <MarketUI
          width={PANEL_W}
          typed={typed}
          query={committed ? query : ''}
          resultState={resultState}
          installState='idle'
          detail={false}
          frame={uiFrame}
          resultEnter={resultEnter}
          detailEnter={0}
          item={item}
        />
        <CardGlowRing opacity={resultEnter * (0.55 + 0.45 * push) * (1 - dip)} pulse={ringPulse} />
        <PackageAnnotation opacity={annotationOpacity} text={packageAnnotation} />
        <ResultSwapBlank opacity={dip} />
      </div>
      {/* 推近时渐入字幕压暗带：字幕落在暗带上，不压可读 UI */}
      <CaptionScrim opacity={push} />
      <Caption title={captionTitle} sub={captionSub} delay={72} />
      <Grain />
    </AbsoluteFill>
  );
};

// ───────────────────────── S5：详情 + 安装 ─────────────────────────
export type S5InstallProps = {
  /** 详情页数据，默认 dsh-reel 详情 */
  detailItem?: MarketDetailData;
  /** 卡片数据（决定安装成功 toast 里的插件名），默认 dsh-reel */
  item?: MarketItem;
  captionTitle?: string;
};

export const S5Install: React.FC<S5InstallProps> = ({
  detailItem,
  item,
  captionTitle = '装上，就开拍',
}) => {
  const frame = useCurrentFrame();

  // 从 S4 的推近构图接续：前 5 帧 1.06→1.0，配合 0.6→1 的淡入。
  const pull = interpolate(frame, [0, 5], [1.06, 1.0], {...clamp, easing: Easing.out(Easing.cubic)});
  const enter = interpolate(frame, [0, 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  // 安装状态机：高亮脉冲 → 安装中… → ✓ 已安装 + toast
  const highlight = frame >= 12 && frame <= 26 ? Math.sin(((frame - 12) / 14) * Math.PI) : 0;
  const installState: 'idle' | 'installing' | 'installed' =
    frame >= 36 ? 'installed' : frame >= 26 ? 'installing' : 'idle';

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0, overflow: 'hidden'}}>
      <StageBg drift={Math.sin(frame / 60) * 8} strength={0.95} />
      <PanelShadow />
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT,
          top: PANEL_TOP,
          width: PANEL_W,
          height: PANEL_H,
          transformOrigin: '50% 52%',
          opacity: 0.6 + 0.4 * enter,
          transform: `translateY(${(1 - enter) * 10}px) scale(${pull})`,
        }}
      >
        <MarketUI
          width={PANEL_W}
          typed=''
          query=''
          resultState='default'
          installState={installState}
          detail
          frame={frame}
          resultEnter={1}
          detailEnter={1}
          installHighlight={highlight}
          detailItem={detailItem}
          item={item}
        />
      </div>
      <Caption title={captionTitle} delay={18} />
      <Grain />
    </AbsoluteFill>
  );
};
