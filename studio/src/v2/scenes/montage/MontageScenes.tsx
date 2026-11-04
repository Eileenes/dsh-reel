/**
 * MontageScenes — S6「交接」+ S7「三段能力蒙太奇」。
 *
 * 这段是 24s 片子的"能力证明"段：S6 是 DSH 会话里的 composer 特写（一句话交给它），
 * S7 是一屏内的蒙太奇（扫描 → 分镜 → 渲染），用局部动效把三个阶段串起来，不做 PPT 三栏。
 *
 * 约束（来自任务）：
 *  - 纯 2D，复用 components/Chrome.tsx 的 Caption / GlassPanel / Grain 与 tokens；
 *  - 场景底 DshBackdrop（stage/DshStage）+ 细网格 + DshVignette + Grain；
 *  - 1080p 下最小字号 18px；不出现伪造数字 / 认证 / 下载量；
 *  - S7 里鲸鱼不出现（它在 S8 回来）。
 *
 * 静帧自检：
 *   cd studio && node_modules/.bin/remotion still src/v2/scenes/montage/entry.ts Montage7 out/montage-s7-scan.png --frame=30
 */

import React from 'react';
import {AbsoluteFill, Composition, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, MOTION, RADIUS, VIDEO} from '../../tokens';
import {Caption, GlassPanel, Grain, WhaleMark} from '../../components/Chrome';
import {DshBackdrop, DshVignette} from '../../stage/DshStage';

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

// ───────────────────────── shared backdrop ─────────────────────────
const StageBackdrop: React.FC<{glow?: string}> = ({glow = COLORS.blue}) => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <DshBackdrop />
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
        backgroundPosition: 'center center',
        WebkitMaskImage: 'radial-gradient(ellipse 78% 68% at 50% 46%, #000 18%, rgba(0,0,0,0.35) 62%, transparent 92%)',
        maskImage: 'radial-gradient(ellipse 78% 68% at 50% 46%, #000 18%, rgba(0,0,0,0.35) 62%, transparent 92%)',
        opacity: 0.85,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 62% 52% at 50% 44%, ${glow}1f, transparent 72%)`,
      }}
    />
    <DshVignette />
  </AbsoluteFill>
);

// ═══════════════════════════ S6 · HANDOFF ═══════════════════════════
// 36f / 1.2s：窗口就位 → 逐字输入 → 回车 → 三枚工具 chips 依次点亮。

const S6_PROMPT = '给这个插件做一条宣传片';
const S6_TOOLS = [
  {label: 'reel_scan', color: COLORS.blue},
  {label: 'reel_plan', color: COLORS.blue2},
  {label: 'reel_render', color: COLORS.mint},
] as const;

const WindowDots: React.FC<{size?: number}> = ({size = 12}) => (
  <div style={{display: 'flex', gap: size * 0.75}}>
    {['#FF7B72', '#FFBD2E', '#27C93F'].map((c) => (
      <span key={c} style={{width: size, height: size, borderRadius: 99, background: c, opacity: 0.85}} />
    ))}
  </div>
);

const ToolChip: React.FC<{label: string; color: string; p: number; dot: number}> = ({label, color, p, dot}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '13px 24px',
      borderRadius: RADIUS.pill,
      border: `1px solid ${dot > 0.3 ? `${color}66` : COLORS.line}`,
      background: dot > 0.3 ? `${color}12` : 'rgba(8,12,22,0.72)',
      boxShadow: dot > 0.3 ? `0 0 38px ${color}26` : 'none',
      opacity: p,
      transform: `translateY(${(1 - p) * 16}px) scale(${0.9 + 0.1 * p})`,
      fontFamily: FONT.mono,
      fontSize: 23,
      letterSpacing: 1.4,
      color: dot > 0.3 ? COLORS.text : COLORS.dim,
      whiteSpace: 'nowrap',
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 99,
        background: dot > 0.3 ? color : COLORS.faint,
        boxShadow: dot > 0.3 ? `0 0 16px ${color}` : 'none',
      }}
    />
    {label}
  </div>
);

export const S6Handoff: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 0.9 → 1 的轻推
  const push = 0.9 + 0.1 * easeOut(seg(frame, 0, 34));
  const cardIn = springAt(frame, fps, 0);
  const cardO = seg(frame, 0, 6);

  // 逐字：第 7 帧起，约 0.95 帧/字，第 18 帧打完
  const typedRaw = Math.floor((frame - 7) / 0.95) + 1;
  const typedCount = Math.max(0, Math.min(S6_PROMPT.length, frame < 7 ? 0 : typedRaw));
  const typing = frame < 21;
  const caretOn = frame % 18 < 9;

  // 20–22 发送，22 起输入框清空、气泡浮出，24/27/30 三枚 chip
  const sendPress = seg(frame, 20, 22);
  const cleared = frame >= 22;
  const bubbleP = springAt(frame, fps, 21, {damping: 200, mass: 0.6, stiffness: 140});
  const bubbleO = seg(frame, 21, 24);
  const activeChips = [0, 1, 2].map((i) => seg(frame, 23 + i * 3, 26 + i * 3));

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <StageBackdrop />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${push})`,
          transformOrigin: '50% 44%',
        }}
      >
        {/* 卡片背后的光 */}
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: 180,
            width: 1700,
            height: 660,
            background: `radial-gradient(closest-side, ${COLORS.blue}33, ${COLORS.blue}14 52%, transparent 74%)`,
            filter: 'blur(48px)',
            opacity: cardO,
          }}
        />

        <GlassPanel
          glow={COLORS.blue}
          style={{
            position: 'absolute',
            left: 140,
            top: 240,
            width: 1640,
            height: 502,
            display: 'flex',
            flexDirection: 'column',
            opacity: cardO,
            transform: `translateY(${(1 - cardIn) * 54}px)`,
            border: '1px solid rgba(142,166,255,.36)',
            boxShadow:
              '0 0 0 1px rgba(142,166,255,.18), 0 0 90px rgba(77,107,254,.44), 0 0 190px rgba(77,107,254,.26), 0 44px 120px rgba(0,0,0,.62), inset 0 1px 0 rgba(255,255,255,.09)',
          }}
        >
          {/* 窗口标题栏 */}
          <div
            style={{
              height: 68,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '0 32px',
              borderBottom: `1px solid ${COLORS.line}`,
              background: 'rgba(10,16,30,0.55)',
            }}
          >
            <WindowDots size={14} />
            <span style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 2, color: COLORS.dim}}>
              deepseek harness
            </span>
            <span style={{color: COLORS.faint, fontSize: 22}}>/</span>
            <span style={{fontFamily: FONT.zh, fontSize: 23, color: COLORS.text, opacity: 0.9}}>新会话</span>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: FONT.mono,
                fontSize: 21,
                letterSpacing: 2,
                color: COLORS.faint,
              }}
            >
              profile · web
            </span>
          </div>

          {/* 会话体 */}
          <div style={{position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 36px 26px'}}>
            {/* 安装完成上下文（承接 S5） */}
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <span style={{color: COLORS.mint, fontSize: 26, lineHeight: 1}}>✓</span>
              <span style={{fontFamily: FONT.zh, fontSize: 24, color: COLORS.dim}}>
                <span style={{color: COLORS.text}}>dsh-reel-studio</span> 已安装
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: FONT.mono,
                  fontSize: 21,
                  letterSpacing: 2,
                  color: COLORS.faint,
                }}
              >
                ready
              </span>
            </div>

            {/* 空会话状态：发送后淡出 */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 42,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                opacity: 0.5 * (1 - seg(frame, 18, 23)),
                pointerEvents: 'none',
              }}
            >
              <WhaleMark size={62} />
              <span style={{fontFamily: FONT.mono, fontSize: 21, letterSpacing: 5, color: COLORS.dim}}>
                NEW SESSION
              </span>
            </div>

            {/* 发送后的用户气泡 */}
            <div style={{display: 'flex', alignItems: 'center', gap: 18, height: 80, marginTop: 14}}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 99,
                  background: `linear-gradient(160deg, ${COLORS.blue}, #2F46C8)`,
                  boxShadow: `0 0 28px ${COLORS.blue}55`,
                  opacity: bubbleO,
                  flex: 'none',
                }}
              />
              <div
                style={{
                  padding: '12px 24px',
                  borderRadius: 16,
                  border: `1px solid ${COLORS.blue2}33`,
                  background: `linear-gradient(160deg, ${COLORS.blue}24, ${COLORS.blue}10)`,
                  fontFamily: FONT.zh,
                  fontSize: 38,
                  color: COLORS.text,
                  opacity: bubbleO,
                  transform: `translateY(${(1 - bubbleP) * 14}px) scale(${0.96 + 0.04 * bubbleP})`,
                  whiteSpace: 'nowrap',
                }}
              >
                {S6_PROMPT}
              </div>
            </div>

            {/* 工具调用 chips */}
            <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 78, marginTop: 4}}>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 21,
                  letterSpacing: 2,
                  color: COLORS.faint,
                  marginRight: 6,
                  opacity: seg(frame, 22, 26),
                }}
              >
                TOOLS
              </span>
              {S6_TOOLS.map((tool, i) => (
                <ToolChip
                  key={tool.label}
                  label={tool.label}
                  color={tool.color}
                  p={springAt(frame, fps, 23 + i * 3, {damping: 200, mass: 0.6, stiffness: 150})}
                  dot={activeChips[i]}
                />
              ))}
            </div>

            {/* composer */}
            <div
              style={{
                marginTop: 'auto',
                height: 126,
                borderRadius: 16,
                border: `1px solid ${COLORS.lineStrong}`,
                background: 'rgba(5,8,16,0.86)',
                boxShadow: `0 26px 70px rgba(0,0,0,0.52), 0 0 54px ${COLORS.blue}20`,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '0 22px 0 30px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontFamily: FONT.zh,
                  fontSize: 46,
                  letterSpacing: 0.5,
                  color: COLORS.text,
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'pre',
                }}
              >
                {cleared ? (
                  <span style={{color: COLORS.faint, fontSize: 35}}>继续输入，或使用上面的工具…</span>
                ) : (
                  <>
                    {S6_PROMPT.slice(0, typedCount)}
                    <span
                      style={{
                        display: 'inline-block',
                        width: 4,
                        height: 48,
                        marginLeft: 4,
                        background: COLORS.mint,
                        opacity: typing ? (caretOn ? 1 : 0.12) : 0,
                        boxShadow: `0 0 12px ${COLORS.mint}`,
                      }}
                    />
                  </>
                )}
              </div>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 99,
                  background: `linear-gradient(160deg, ${COLORS.blue}, #3349D6)`,
                  boxShadow: `0 0 40px ${COLORS.blue}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${1 - sendPress * 0.1})`,
                  opacity: cleared ? 0.45 : 1,
                  flex: 'none',
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5" />
                  <path d="M6 11l6-6 6 6" />
                </svg>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: FONT.mono,
                fontSize: 19,
                letterSpacing: 1.6,
                color: COLORS.faint,
              }}
            >
              <span>Enter 发送 · Shift+Enter 换行</span>
              <span style={{color: cleared ? COLORS.mint : COLORS.faint}}>
                {cleared ? '✓ 已交给 agent' : 'web · local'}
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      <Caption kicker="02 / 交给它" title="一句话，开拍" delay={2} />
      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ S7 · PIPELINE MONTAGE ═══════════════════════════
// 126f / 4.2s：读仓库（0–42）→ 写分镜（42–84）→ 渲成片（84–126）。
// 一屏内推进：源文件卡走到左侧、胶片条进中间、两件产物从右下析出。

const S7_FILES = [
  {name: 'package.json', kind: 'JSON'},
  {name: 'README.md', kind: 'MD'},
  {name: '入口 ui.tsx', kind: 'TSX'},
  {name: '预览图 ×3', kind: 'PNG'},
] as const;

const S7_SHOTS = [
  {no: '01', name: 'HOOK'},
  {no: '02', name: 'PROBLEM'},
  {no: '03', name: 'SOLUTION'},
  {no: '04', name: 'FEATURE'},
  {no: '05', name: 'HOWTO'},
  {no: '06', name: 'OUTRO'},
] as const;

/** 6 格不同的抽象分镜缩略（避免每格长得一样） */
const S7_THUMBS: Array<{rect: {l: number; t: number; w: number; h: number}; bars: number[]; extra?: {l: number; t: number; w: number; h: number}}> = [
  {rect: {l: 12, t: 14, w: 144, h: 52}, bars: [120, 84]},
  {rect: {l: 10, t: 12, w: 62, h: 62}, bars: [96, 130], extra: {l: 84, t: 12, w: 74, h: 40}},
  {rect: {l: 78, t: 12, w: 80, h: 62}, bars: [132, 92], extra: {l: 10, t: 12, w: 54, h: 28}},
  {rect: {l: 12, t: 68, w: 144, h: 30}, bars: [104, 68]},
  {rect: {l: 24, t: 14, w: 120, h: 46}, bars: [140, 100]},
  {rect: {l: 44, t: 10, w: 80, h: 74}, bars: [112, 76]},
];

const S7_STEPS = ['01 SCAN', '02 STORYBOARD', '03 RENDER'] as const;

/**
 * SCAN 段在右侧依次"扫出来"的事实 chips（全部来自真实条目信息，不含评分/下载量）。
 * 位置按 x 递增排列，和右侧那道很淡的扫描竖光同步点亮。
 */
const S7_FACTS = [
  {label: 'v0.1.0', color: COLORS.blue2, left: 1028, top: 296},
  {label: '工具与能力', color: COLORS.mint, left: 1140, top: 368},
  {label: 'MIT', color: COLORS.blue2, left: 1252, top: 440},
  {label: '截图 ×3', color: COLORS.mint, left: 1362, top: 512},
] as const;

/**
 * S7 节拍（场景内相对帧 @30fps）。要跟 timeline.ts 的音效锚点对齐时只改这里。
 * 现行：scan 扫光 19–35，胶片条 39 进、46 起每 6f 点亮一格（46/52/58/64/70/76），
 * 80–96 条上移缩小，86 海报 / 94 视频落位，96–118 进度条走完。
 */
const S7_BEATS = {
  sweep: [19, 35] as const,
  stripIn: 39,
  cellStart: 46,
  cellStep: 6,
  stripOut: [80, 96] as const,
  posterIn: 86,
  videoIn: 94,
  progress: [96, 118] as const,
  captionSwitch: [37, 44, 79, 86] as const,
} as const;

const Holes: React.FC<{n: number}> = ({n}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
    {Array.from({length: n}).map((_, i) => (
      <span
        key={i}
        style={{
          width: 20,
          height: 14,
          borderRadius: 4,
          background: 'rgba(142,166,255,0.10)',
          border: `1px solid ${COLORS.line}`,
        }}
      />
    ))}
  </div>
);

const ShotCell: React.FC<{idx: number; label: string; name: string; lit: number; flash: number}> = ({
  idx,
  label,
  name,
  lit,
  flash,
}) => {
  const thumb = S7_THUMBS[idx];
  const lineBg = lit > 0.2 ? `${COLORS.mint}55` : COLORS.line;
  return (
    <div
      style={{
        position: 'relative',
        width: 196,
        height: 228,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${lit > 0.05 ? `${COLORS.mint}77` : COLORS.line}`,
        background:
          lit > 0.05
            ? 'linear-gradient(180deg, rgba(94,242,194,0.10), rgba(8,13,26,0.97) 62%)'
            : 'linear-gradient(180deg, rgba(16,24,44,0.92), rgba(8,13,26,0.97))',
        boxShadow: lit > 0.05 ? `0 0 30px ${COLORS.mint}1f, inset 0 0 34px ${COLORS.mint}12` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        flex: 'none',
      }}
    >
      {/* 抽象分镜缩略 */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 14,
          width: 168,
          height: 112,
          borderRadius: 8,
          border: `1px solid ${COLORS.line}`,
          background: 'rgba(4,8,15,0.72)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: thumb.rect.l,
            top: thumb.rect.t,
            width: thumb.rect.w,
            height: thumb.rect.h,
            borderRadius: 5,
            background: lit > 0.2 ? `linear-gradient(160deg, ${COLORS.blue}55, ${COLORS.mint}22)` : 'rgba(142,166,255,0.10)',
            border: `1px solid ${lineBg}`,
          }}
        />
        {thumb.extra ? (
          <div
            style={{
              position: 'absolute',
              left: thumb.extra.l,
              top: thumb.extra.t,
              width: thumb.extra.w,
              height: thumb.extra.h,
              borderRadius: 5,
              background: 'rgba(142,166,255,0.10)',
              border: `1px solid ${COLORS.line}`,
            }}
          />
        ) : null}
        {thumb.bars.map((w, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 12,
              top: 76 + i * 14,
              width: w,
              height: 6,
              borderRadius: 3,
              background: lineBg,
            }}
          />
        ))}
      </div>

      {/* 镜头号 + 名称 */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 16,
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          fontFamily: FONT.mono,
          fontSize: 20,
          letterSpacing: 2,
        }}
      >
        <span style={{color: lit > 0.2 ? COLORS.mint : COLORS.faint}}>{label}</span>
        <span style={{color: lit > 0.2 ? COLORS.text : COLORS.faint}}>{name}</span>
      </div>

      {/* 曝光闪 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, ${COLORS.mint}44, transparent 60%)`,
          opacity: flash * 0.55,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export const S7Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 全局轻推
  const push = 1 + 0.04 * easeInOut(seg(frame, 0, 126));

  // ── 阶段权重（字幕交叉淡入淡出） ──
  const p1 = 1 - easeInOut(seg(frame, S7_BEATS.captionSwitch[0], S7_BEATS.captionSwitch[1]));
  const p2 = easeInOut(seg(frame, S7_BEATS.captionSwitch[0], S7_BEATS.captionSwitch[1])) * (1 - easeInOut(seg(frame, S7_BEATS.captionSwitch[2], S7_BEATS.captionSwitch[3])));
  const p3 = easeInOut(seg(frame, S7_BEATS.captionSwitch[2], S7_BEATS.captionSwitch[3]));
  const activeStep = frame < 41 ? 0 : frame < 83 ? 1 : 2;

  // ── 1) SCAN：仓库事实卡 ──
  const cardIn = springAt(frame, fps, 0);
  const cardO = seg(frame, 0, 6);
  const cardOut = easeInOut(seg(frame, 34, 44));
  const scanSweep = interpolate(frame, [S7_BEATS.sweep[0], S7_BEATS.sweep[1]], [-280, 820], clamp);
  const scanDone = frame >= S7_BEATS.sweep[1];
  // 右侧承接：一道很淡的竖光从卡片扫向右侧 + 事实 chips 逐条点亮（38f 前收干净，接胶片条）
  const factSweep = interpolate(frame, [10, 34], [900, 1800], clamp);
  const factFade = seg(frame, 8, 14) * (1 - seg(frame, 32, 38));

  // ── 2) STORYBOARD：6 格胶片条 ──
  const stripIn = springAt(frame, fps, S7_BEATS.stripIn, MOTION.springSoft);
  const stripO = seg(frame, S7_BEATS.stripIn, S7_BEATS.stripIn + 7);
  const stripOut = easeInOut(seg(frame, S7_BEATS.stripOut[0], S7_BEATS.stripOut[1]));
  const litAt = (i: number) => seg(frame, S7_BEATS.cellStart + i * S7_BEATS.cellStep, S7_BEATS.cellStart + (i + 1) * S7_BEATS.cellStep);
  const flashAt = (i: number) => {
    const t = frame - (S7_BEATS.cellStart + i * S7_BEATS.cellStep);
    return Math.max(0, 1 - Math.abs(t - 1) / 4);
  };

  // ── 3) RENDER：两件产物 + 进度 ──
  const posterIn = springAt(frame, fps, S7_BEATS.posterIn, MOTION.springSoft);
  const posterO = seg(frame, S7_BEATS.posterIn, S7_BEATS.posterIn + 8);
  const videoIn = springAt(frame, fps, S7_BEATS.videoIn, MOTION.springSoft);
  const videoO = seg(frame, S7_BEATS.videoIn, S7_BEATS.videoIn + 8);
  const progress = easeInOut(seg(frame, S7_BEATS.progress[0], S7_BEATS.progress[1]));
  const done = frame >= S7_BEATS.progress[1];
  const sweepGlow = Math.max(0, 1 - Math.abs(frame - 108) / 10);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <StageBackdrop glow={COLORS.blue} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${push})`,
          transformOrigin: '50% 50%',
        }}
      >
        {/* 阶段指示（右上，弱化信息量） */}
        <div style={{position: 'absolute', right: 108, top: 66, display: 'flex', gap: 12}}>
          {S7_STEPS.map((step, i) => {
            const active = i === activeStep;
            const accent = [COLORS.blue, COLORS.blue2, COLORS.mint][i];
            return (
              <div
                key={step}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 18,
                  letterSpacing: 2,
                  padding: '10px 16px',
                  borderRadius: RADIUS.pill,
                  border: `1px solid ${active ? `${accent}77` : COLORS.line}`,
                  color: active ? accent : COLORS.faint,
                  background: active ? `${accent}12` : 'transparent',
                  boxShadow: active ? `0 0 30px ${accent}26` : 'none',
                }}
              >
                {step}
              </div>
            );
          })}
        </div>

        {/* 当前工具（承接 S6）：SCAN → PLAN → RENDER */}
        <div style={{position: 'absolute', right: 108, top: 138, display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 2, color: COLORS.faint}}>TOOL</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              borderRadius: RADIUS.pill,
              border: `1px solid ${[COLORS.blue, COLORS.blue2, COLORS.mint][activeStep]}66`,
              background: `${[COLORS.blue, COLORS.blue2, COLORS.mint][activeStep]}12`,
              fontFamily: FONT.mono,
              fontSize: 20,
              letterSpacing: 1.4,
              color: COLORS.text,
              boxShadow: `0 0 32px ${[COLORS.blue, COLORS.blue2, COLORS.mint][activeStep]}22`,
              opacity: seg(frame, 4, 10),
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 99,
                background: [COLORS.blue, COLORS.blue2, COLORS.mint][activeStep],
                boxShadow: `0 0 14px ${[COLORS.blue, COLORS.blue2, COLORS.mint][activeStep]}`,
              }}
            />
            {['reel_scan', 'reel_plan', 'reel_render'][activeStep]}
          </div>
        </div>

        {/* ════════ 1) SCAN · 插件仓库事实卡 ════════ */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 222,
            width: 760,
            height: 486,
            opacity: cardO * (1 - cardOut),
            transform: `translateX(${-110 * cardOut}px) translateY(${(1 - cardIn) * 40}px) scale(${1 - 0.03 * cardOut})`,
          }}
        >
          <GlassPanel glow={COLORS.blue} style={{width: '100%', height: '100%', padding: '26px 26px 22px'}}>
            {/* 扫光 */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                bottom: -20,
                left: scanSweep,
                width: 240,
                background: `linear-gradient(90deg, transparent, ${COLORS.blue}2e 34%, ${COLORS.mint}44 62%, transparent)`,
                filter: 'blur(6px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: scanSweep + 224,
                width: 2,
                background: `linear-gradient(180deg, transparent, ${COLORS.mint}, transparent)`,
                boxShadow: `0 0 22px ${COLORS.mint}`,
                opacity: scanDone ? 0 : 1,
                pointerEvents: 'none',
              }}
            />

            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: COLORS.mint}}>
                REPO SCAN
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: FONT.mono,
                  fontSize: 18,
                  letterSpacing: 2,
                  color: scanDone ? COLORS.mint : COLORS.faint,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: scanDone ? COLORS.mint : COLORS.blue,
                    boxShadow: `0 0 12px ${scanDone ? COLORS.mint : COLORS.blue}`,
                    opacity: scanDone ? 1 : 0.4 + 0.6 * Math.abs(Math.sin(frame / 4)),
                  }}
                />
                {scanDone ? 'READY' : 'SCANNING'}
              </span>
            </div>

            <div style={{marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 14}}>
              <span style={{fontFamily: FONT.mono, fontSize: 30, color: COLORS.text, letterSpacing: 0.5}}>
                Eileenes/dsh-reel
              </span>
              <span style={{fontFamily: FONT.zh, fontSize: 20, color: COLORS.dim}}>插件源码与界面素材</span>
            </div>

            <div style={{marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12}}>
              {S7_FILES.map((file, i) => {
                const rowIn = springAt(frame, fps, 5 + i * 3, {damping: 200, mass: 0.6, stiffness: 150});
                const lit = frame >= 22 + i * 2.4;
                return (
                  <div
                    key={file.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 18,
                      height: 68,
                      padding: '0 18px',
                      borderRadius: 14,
                      border: `1px solid ${lit ? `${COLORS.mint}55` : COLORS.line}`,
                      background: lit ? 'rgba(94,242,194,0.055)' : 'rgba(8,12,22,0.55)',
                      opacity: rowIn,
                      transform: `translateX(${(1 - rowIn) * 26}px)`,
                    }}
                  >
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        border: `1px solid ${COLORS.line}`,
                        background: 'rgba(142,166,255,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '0 9px',
                        flex: 'none',
                      }}
                    >
                      {[0.9, 0.6, 0.75].map((w, k) => (
                        <span key={k} style={{height: 3, width: `${w * 100}%`, borderRadius: 2, background: lit ? COLORS.mint : COLORS.blue2, opacity: lit ? 0.85 : 0.4}} />
                      ))}
                    </span>
                    <span style={{fontFamily: FONT.mono, fontSize: 24, color: COLORS.text}}>{file.name}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontFamily: FONT.mono,
                        fontSize: 18,
                        letterSpacing: 2,
                        color: lit ? COLORS.mint : COLORS.faint,
                      }}
                    >
                      {file.kind}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>

        {/* ════════ 1.5) SCAN 右侧承接：淡扫光 + 事实 chips ════════ */}
        <div
          style={{
            position: 'absolute',
            top: 208,
            height: 480,
            width: 180,
            left: factSweep,
            background: `linear-gradient(90deg, transparent, ${COLORS.mint}08 42%, ${COLORS.mint}15 56%, transparent)`,
            filter: 'blur(12px)',
            opacity: factFade,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 228,
            height: 436,
            width: 2,
            left: factSweep + 90,
            background: `linear-gradient(180deg, transparent, ${COLORS.mint}55 22%, ${COLORS.mint}aa 50%, ${COLORS.mint}55 78%, transparent)`,
            boxShadow: `0 0 20px ${COLORS.mint}`,
            opacity: 0.34 * factFade,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
        {S7_FACTS.map((fact, i) => {
          const p = springAt(frame, fps, 12 + i * 3.5, {damping: 200, mass: 0.6, stiffness: 150});
          return (
            <div
              key={fact.label}
              style={{
                position: 'absolute',
                left: fact.left,
                top: fact.top,
                zIndex: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 22px',
                borderRadius: RADIUS.pill,
                border: `1px solid ${fact.color}55`,
                background: 'rgba(8,13,24,0.74)',
                boxShadow: `0 0 34px ${fact.color}1c, inset 0 1px 0 rgba(255,255,255,0.06)`,
                fontFamily: FONT.mono,
                fontSize: 21,
                letterSpacing: 1.2,
                color: COLORS.text,
                opacity: p * (1 - seg(frame, 32, 38)),
                transform: `translateX(${(1 - p) * -26}px) scale(${0.94 + 0.06 * p})`,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 99,
                  background: fact.color,
                  boxShadow: `0 0 14px ${fact.color}`,
                }}
              />
              {fact.label}
            </div>
          );
        })}

        {/* ════════ 2) STORYBOARD · 6 格胶片条 ════════ */}
        <div
          style={{
            position: 'absolute',
            left: 300,
            top: 312,
            width: 1320,
            opacity: stripO * (1 - 0.62 * stripOut),
            transform: `translateX(${(1 - stripIn) * 90}px) translateY(${-172 * stripOut}px) scale(${1 - 0.38 * stripOut})`,
            transformOrigin: '50% 0%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 6,
              top: -38,
              fontFamily: FONT.mono,
              fontSize: 18,
              letterSpacing: 3,
              color: COLORS.faint,
            }}
          >
            STORYBOARD · 6 SHOTS
          </div>
          <div
            style={{
              borderRadius: 18,
              border: `1px solid ${COLORS.line}`,
              background: 'linear-gradient(180deg, rgba(12,18,32,0.96), rgba(6,10,18,0.97))',
              boxShadow: '0 50px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
              padding: '14px 18px',
            }}
          >
            <Holes n={38} />
            <div style={{display: 'flex', gap: 18, margin: '12px 0'}}>
              {S7_SHOTS.map((shot, i) => (
                <ShotCell
                  key={shot.no}
                  idx={i}
                  label={shot.no}
                  name={shot.name}
                  lit={litAt(i)}
                  flash={flashAt(i)}
                />
              ))}
            </div>
            <Holes n={38} />
          </div>
        </div>

        {/* ════════ 3) RENDER · 两件产物 ════════ */}
        {/* 产物背后的光 */}
        <div
          style={{
            position: 'absolute',
            left: 600,
            top: 300,
            width: 1000,
            height: 620,
            background: `radial-gradient(closest-side, ${COLORS.mint}1f, transparent 70%)`,
            filter: 'blur(26px)',
            opacity: p3,
            pointerEvents: 'none',
          }}
        />

        {/* 3:4 海报 */}
        <div
          style={{
            position: 'absolute',
            left: 600,
            top: 352,
            width: 300,
            height: 400,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 46px 110px rgba(0,0,0,0.66), 0 0 60px rgba(94,242,194,0.10)',
            opacity: posterO,
            transform: `translateY(${(1 - posterIn) * 74}px) scale(${0.95 + 0.05 * posterIn})`,
            zIndex: 2,
            background: COLORS.panel,
          }}
        >
          <img
            src={staticFile('v2/poster-mint.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
        </div>

        {/* 产物标注：海报 */}
        <div
          style={{
            position: 'absolute',
            left: 600,
            top: 766,
            fontFamily: FONT.mono,
            fontSize: 18,
            letterSpacing: 2.4,
            color: COLORS.mint,
            opacity: posterO,
          }}
        >
          3:4 · 宣传图
        </div>

        {/* 16:9 视频帧 */}
        <div
          style={{
            position: 'absolute',
            left: 820,
            top: 404,
            width: 760,
            height: 427,
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${COLORS.lineStrong}`,
            boxShadow: '0 56px 130px rgba(0,0,0,0.7), 0 0 90px rgba(77,107,254,0.16)',
            opacity: videoO,
            transform: `translateY(${(1 - videoIn) * 84}px) scale(${0.97 + 0.03 * videoIn})`,
            zIndex: 1,
            background: COLORS.panel,
          }}
        >
          <img
            src={staticFile('v2/video-still.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
          {/* 产物标注：视频 */}
          <div
            style={{
              position: 'absolute',
              left: 18,
              bottom: 16,
              fontFamily: FONT.mono,
              fontSize: 18,
              letterSpacing: 2.4,
              color: COLORS.mint,
              textShadow: '0 2px 14px rgba(0,0,0,0.9)',
            }}
          >
            16:9 · 宣传片
          </div>

          {/* 渲染扫光 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${interpolate(frame, [100, 116], [-30, 110], clamp)}%`,
              width: '22%',
              background: `linear-gradient(90deg, transparent, ${COLORS.mint}22, transparent)`,
              opacity: sweepGlow,
              pointerEvents: 'none',
            }}
          />
          {/* 角标 */}
          <div
            style={{
              position: 'absolute',
              right: 16,
              top: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: RADIUS.pill,
              background: 'rgba(4,8,14,0.72)',
              border: `1px solid ${COLORS.mint}66`,
              fontFamily: FONT.mono,
              fontSize: 18,
              letterSpacing: 2,
              color: COLORS.mint,
              opacity: seg(frame, 116, 120),
            }}
          >
            <span style={{width: 7, height: 7, borderRadius: 99, background: COLORS.mint, boxShadow: `0 0 12px ${COLORS.mint}`}} />
            1080p · LOCAL
          </div>
        </div>

        {/* 渲染进度 */}
        <div style={{position: 'absolute', left: 820, top: 852, width: 760, opacity: videoO}}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: FONT.mono,
              fontSize: 18,
              letterSpacing: 2.4,
              color: done ? COLORS.mint : COLORS.dim,
              marginBottom: 10,
            }}
          >
            <span>{done ? 'RENDERED' : 'RENDERING · REMOTION'}</span>
            <span>{done ? '100%' : `${Math.round(progress * 100)}%`}</span>
          </div>
          <div style={{height: 8, borderRadius: 4, background: 'rgba(142,166,255,0.14)', overflow: 'hidden'}}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.mint})`,
                boxShadow: `0 0 18px ${COLORS.mint}66`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 字幕随阶段切换（kicker 不变） */}
      <div style={{position: 'absolute', inset: 0, opacity: p1}}>
        <Caption kicker="03 / 出片" title="读仓库" />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: p2}}>
        <Caption kicker="03 / 出片" title="写分镜" />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: p3}}>
        <Caption kicker="03 / 出片" title="渲成片" />
      </div>

      <Grain />
    </AbsoluteFill>
  );
};


// ───────────────────────── 独立预览入口用 Root ─────────────────────────
/** 只注册 S6/S7 两个 Composition；主 Composition 仍由 compositions/ReelPromo.tsx 负责。 */
export const MontageRoot: React.FC = () => (
  <>
    <Composition
      id="Montage6"
      component={S6Handoff}
      durationInFrames={36}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="Montage7"
      component={S7Pipeline}
      durationInFrames={126}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);
