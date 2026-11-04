/**
 * P1-C 预览：DSH 插件市场 UI 三态（1440 逻辑宽 → 1756px 上屏）落在深蓝片场里。
 *
 * 时间轴（120 帧 @30fps = 4s，仅用于 P1 静帧预览）：
 *   0–40   市场页；搜索框逐字输入 `reel-studio`
 *   40–70  结果刷新为 1 张 dsh-reel 卡片
 *   70–120 进详情页 + 安装按钮高亮 → 安装中 → ✓ 已安装（带 toast）
 *
 * 静帧检查点：frame 40 / 70 / 110（见 studio/out/p1m-f00*.png）
 */

import React from 'react';
import {AbsoluteFill, Composition, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../v2/tokens';
import {MARKET_QUERY, MarketUI} from '../v2/components/MarketUI';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/** 组件上屏缩放：1440×810 设计稿 → 1756.8×988.2（四周留出深蓝片场） */
const PANEL_SCALE = 1.22;
const PANEL_LEFT = 82;
const PANEL_TOP = 46;

/** 深蓝片场：径向暗角 + 网格 + 双色光晕 + 底部反光。 */
const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 10;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 14%, #0e1a34 0%, #080e1c 48%, #05070d 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(142,166,255,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(142,166,255,0.075) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 46%, black 18%, transparent 76%)',
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 760,
          left: 360 + drift,
          top: -260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,107,254,0.30) 0%, rgba(77,107,254,0) 64%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 640,
          right: -180 - drift,
          bottom: -260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,242,194,0.16) 0%, rgba(94,242,194,0) 66%)',
          filter: 'blur(34px)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.62) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(77,107,254,0.5), rgba(94,242,194,0.35), transparent)',
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};

/** 面板背后的柔光，让“产品 UI 被搬进片场”有落点。 */
const PanelBacklight: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: PANEL_LEFT - 60,
      top: PANEL_TOP - 40,
      width: 1440 * PANEL_SCALE + 120,
      height: 810 * PANEL_SCALE + 120,
      borderRadius: 40,
      background:
        'radial-gradient(ellipse at 50% 18%, rgba(77,107,254,0.20) 0%, rgba(77,107,254,0.05) 45%, rgba(77,107,254,0) 72%)',
      filter: 'blur(18px)',
    }}
  />
);

export const P1MarketUI: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 搜索框逐字输入：11 个字符，约 4 帧/字，41 帧打完
  const typedLen = Math.max(0, Math.min(MARKET_QUERY.length, Math.floor((frame - 6) / 2.9) + 1));
  const typed = MARKET_QUERY.slice(0, typedLen);
  const query = frame >= 40 ? MARKET_QUERY : '';
  const resultEnter = interpolate(frame, [42, 54], [0, 1], clamp);
  const resultState: 'default' | 'loading' | 'results' = frame < 42 ? 'default' : frame < 54 ? 'loading' : 'results';

  // 详情页 / 安装
  const detailEnter = interpolate(frame, [72, 86], [0, 1], clamp);
  const detail = frame >= 72;
  const installHighlight =
    frame >= 86 && frame <= 98 ? Math.sin(((frame - 86) / 12) * Math.PI) : 0;
  const installState: 'idle' | 'installing' | 'installed' =
    frame >= 104 ? 'installed' : frame >= 98 ? 'installing' : 'idle';

  // 面板入场：轻微 spring（静帧 40/70/110 早已稳定）
  const enter = spring({frame: frame - 2, fps, config: {damping: 200, mass: 0.8, stiffness: 110}});
  const breathe = Math.sin(frame / 70) * 2.5;

  return (
    <AbsoluteFill style={{background: COLORS.bg0, fontFamily: FONT.zh}}>
      <Stage />
      <PanelBacklight />
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT,
          top: PANEL_TOP + breathe,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 26}px) scale(${0.985 + enter * 0.015})`,
          transformOrigin: '50% 50%',
        }}
      >
        <MarketUI
          width={1440 * PANEL_SCALE}
          typed={typed}
          query={query}
          resultState={resultState}
          installState={installState}
          detail={detail}
          frame={frame}
          resultEnter={resultEnter}
          detailEnter={detailEnter}
          installHighlight={installHighlight}
        />
      </div>
    </AbsoluteFill>
  );
};

export const P1MarketRoot: React.FC = () => (
  <Composition
    id='P1MarketUI'
    component={P1MarketUI}
    durationInFrames={120}
    fps={30}
    width={1920}
    height={1080}
  />
);
