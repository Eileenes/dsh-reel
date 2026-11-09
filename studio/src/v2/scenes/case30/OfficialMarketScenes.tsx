/**
 * CASE30 market scenes — the OFFICIAL DSH plugins page (light), not the third-party
 * dshmarket card UI. Copy/structure follow the official client source captured in
 * .research/dsh-reel-promo/official/ and the verbatim strings in ui-spec.md.
 *
 *   C3PluginsPage (90f)  : official plugins page rises into the dark stage (discover tab,
 *                          loading skeletons); caption 01 / 找插件
 *   C4Install     (150f) : type "better-sidebar" → single official row → confirm dialog
 *                          (official copy) → installing → 已安装，请重启 DSH 加载它。
 *
 * Self-contained scenes: each reads Sequence-relative frame via useCurrentFrame().
 * The 30s edit list lives in compositions/ReelCase30.tsx (C3 @210f, C4 @300f).
 */

import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT} from '../../tokens';
import {Caption, Grain} from '../../components/Chrome';
import {BETTER_SIDEBAR_ENTRY, OFFICIAL_DISCOVER_ENTRIES, OfficialPluginsUI} from '../../components/OfficialPluginsUI';
import {DshBackdrop} from '../../stage/DshStage';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// Panel is the same "screen" footprint as the v2 promo (>1500×843.75 at 210,30) so it
// cuts cleanly against the existing stage language. Captions sit below its bottom edge.
const PANEL_W = 1500;
const PANEL_H = 843.75;
const PANEL_LEFT = 210;
const PANEL_TOP = 30;

const QUERY = 'better-sidebar';

/** Light screen spilling onto the dark stage + the shadow that gives it weight. */
const ScreenLight: React.FC<{strength?: number; drift?: number}> = ({strength = 1, drift = 0}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: PANEL_LEFT - 180 + drift,
        top: PANEL_TOP - 200,
        width: PANEL_W + 360,
        height: PANEL_H + 340,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(150,175,255,${0.20 * strength}) 0%, rgba(77,107,254,0) 64%)`,
        filter: 'blur(52px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: PANEL_LEFT - 80,
        top: PANEL_TOP + PANEL_H - 34,
        width: PANEL_W + 160,
        height: 180,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(26px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: -300 - drift,
        bottom: -340,
        width: 1000,
        height: 780,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(94,242,194,${0.10 * strength}) 0%, rgba(94,242,194,0) 66%)`,
        filter: 'blur(56px)',
      }}
    />
  </>
);

const Stage: React.FC<{strength?: number; drift?: number}> = ({strength = 1, drift = 0}) => (
  <>
    <DshBackdrop />
    <ScreenLight strength={strength} drift={drift} />
  </>
);

// ───────────────────────── C3：官方插件页打开 ─────────────────────────
export const C3PluginsPage: React.FC = () => {
  const frame = useCurrentFrame();

  // 8-frame settle: the screen arrives fast so the real plugin list is readable from ~f8.
  const enter = interpolate(frame, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const rowsAppear = interpolate(frame, [0, 10], [0, 1], clamp);
  const breathe = Math.sin(frame / 40) * 2.2;
  const drift = -Math.sin(frame / 44) * 14;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0, overflow: 'hidden'}}>
      <Stage strength={enter} drift={drift} />
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT,
          top: PANEL_TOP,
          width: PANEL_W,
          height: PANEL_H,
          transformOrigin: '50% 52%',
          opacity: enter,
          transform: `perspective(1600px) translateY(${(1 - enter) * 40 + breathe}px) rotateX(${(1 - enter) * 2.6}deg) scale(${0.95 + 0.05 * enter})`,
        }}
      >
        <OfficialPluginsUI
          width={PANEL_W}
          typed=''
          listState='results'
          entries={OFFICIAL_DISCOVER_ENTRIES}
          rowsAppear={rowsAppear}
          frame={frame}
          searchFocused
        />
      </div>
      <Caption kicker='01 / 找插件' title='在 DSH 里，搜一下' delay={10} />
    </AbsoluteFill>
  );
};

// ───────────────────────── C4：搜索 → 详情确认 → 安装 ─────────────────────────
export type C4InstallProps = {
  /** Search text typed on screen (default better-sidebar). */
  query?: string;
  /** Rows available in the Discover list (default: the captured official index). */
  entries?: typeof OFFICIAL_DISCOVER_ENTRIES;
  /** Entry used by the confirm dialog / detail view (default: Better Sidebar). */
  targetEntry?: (typeof OFFICIAL_DISCOVER_ENTRIES)[number];
  captionKicker?: string;
  captionTitle?: string;
};

export const C4Install: React.FC<C4InstallProps> = ({
  query = QUERY,
  entries = OFFICIAL_DISCOVER_ENTRIES,
  targetEntry = BETTER_SIDEBAR_ENTRY,
  captionKicker = '02 / 安装',
  captionTitle = '装好，重启生效',
}) => {
  const frame = useCurrentFrame();

  // 搜索逐字：36–88f 打完 14 个字符（≈3.7f/字）。列表从第 0 帧就是已加载状态，
  // 输入暂停（250ms 防抖）后在第 90 帧收窄成 1 行——不会出现骨架屏。
  const typedLen = Math.max(0, Math.min(query.length, Math.floor((frame - 26) / 3.7) + 1));
  const typed = query.slice(0, typedLen);
  const RESULT_AT = 84;
  const filterText = typed.trim();
  const listEntries =
    filterText === ''
      ? entries
      : entries.filter((entry) =>
          `${entry.title} ${entry.description}`.toLowerCase().includes(filterText.toLowerCase()),
        );
  const rowHighlight = interpolate(frame, [RESULT_AT, RESULT_AT + 12], [0, 1], clamp);

  // 点安装 → 官方 ConfirmDialog（100–128f 打开并定格可读，约 0.9s）
  const CLICK_AT = 100;
  const CONFIRM_END = 128;
  const confirmOpen = frame >= CLICK_AT && frame < CONFIRM_END;
  const confirmEnter = interpolate(frame, [CLICK_AT, CLICK_AT + 8], [0, 1], clamp);

  // 确认后：安装中（带进度条，约 1.1s）→ 已安装（官方话术「已安装，请重启 DSH 加载它。」）
  const INSTALL_START = CONFIRM_END;
  const INSTALL_DONE = 160;
  const installState: 'idle' | 'installing' | 'installed' =
    frame >= INSTALL_DONE ? 'installed' : frame >= INSTALL_START ? 'installing' : 'idle';
  const installProgress = interpolate(frame, [INSTALL_START, INSTALL_DONE - 4], [0, 1], clamp);
  const progressIn = interpolate(frame, [INSTALL_START, INSTALL_START + 6], [0, 1], clamp);
  const progressOut = interpolate(frame, [INSTALL_DONE, INSTALL_DONE + 8], [1, 0], clamp);

  // 轻推镜：180f 内 1 → 1.03，跟随“屏幕被吸近”的剪辑感
  const push = interpolate(frame, [0, 180], [1, 1.03], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const drift = -Math.sin(frame / 55) * 8;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0, overflow: 'hidden'}}>
      <Stage drift={drift} />
      <Grain />
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT,
          top: PANEL_TOP,
          width: PANEL_W,
          height: PANEL_H,
          transformOrigin: '50% 50%',
          transform: `translateY(${Math.sin(frame / 70) * 1.5}px) scale(${push})`,
        }}
      >
        <OfficialPluginsUI
          width={PANEL_W}
          typed={typed}
          listState='results'
          entries={listEntries}
          targetEntry={targetEntry}
          highlightTitle={targetEntry?.title}
          rowHighlight={rowHighlight}
          confirmOpen={confirmOpen}
          confirmEnter={confirmEnter}
          installState={installState}
          restartNotice={frame >= INSTALL_DONE}
          frame={frame}
          searchFocused
        />
      </div>
      {/* 安装进度条：官方页面的安装态只有文字，这里补一条明确的进度反馈 */}
      <div
        style={{
          position: 'absolute',
          right: 300,
          bottom: 116,
          width: 520,
          opacity: progressIn * progressOut,
          transform: `translateY(${(1 - progressIn) * 10}px)`,
          fontFamily: FONT.mono,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, letterSpacing: 1.5, color: 'rgba(244,247,255,0.82)', marginBottom: 10}}>
          <span>正在安装 {targetEntry.packageName}</span>
          <span>{Math.round(installProgress * 100)}%</span>
        </div>
        <div style={{height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.14)', overflow: 'hidden', boxShadow: '0 0 24px rgba(77,107,254,0.35)'}}>
          <div
            style={{
              width: `${installProgress * 100}%`,
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #4d6bfe, #5ef2c2)',
              boxShadow: '0 0 18px rgba(94,242,194,0.65)',
            }}
          />
        </div>
      </div>
      <Caption kicker={captionKicker} title={captionTitle} delay={96} />
    </AbsoluteFill>
  );
};
