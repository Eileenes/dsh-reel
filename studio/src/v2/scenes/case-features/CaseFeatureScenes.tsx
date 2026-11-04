/**
 * CaseFeatureScenes — CASE-2（Better Sidebar）的能力展示段 + 工作台 + 片尾。
 *
 * 四场（均为 1920×1080 @30fps，由 scenes/case-features/entry.ts 单独注册预览）：
 *   C6SidebarOpen 36f  DSH 会话窗口 mock，右侧栏 panel 从右侧滑出；字幕「02 / 装好 · 侧栏已就位」
 *   C7Features   126f  4 张能力卡（真实截图 ×2 + 示意图 ×2），10/30/50/70f 依次进入，最后 20f 定格
 *   C8Workbench   72f  两张真实截图并排放大落位（轻微 3D 透视 + 落地 squash）
 *   C9Outro       60f  片尾卡（Better Sidebar / 安装命令 / GitHub / PROMO MADE WITH DSH-REEL）
 *
 * 约束：不写下载量/星数/认证/emoji；除 C9 的 `PROMO MADE WITH DSH-REEL` 外不出现 dsh-reel 字眼；
 * 字号 ≥18px；素材用 studio/public/shots/（staticFile('shots/files-tree.png') 等）。
 */

import React from 'react';
import {
  AbsoluteFill,
  Composition,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, FONT, MOTION, RADIUS, VIDEO} from '../../tokens';
import {Caption, GlassPanel, Grain, Pill, Step, Wordmark} from '../../components/Chrome';
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

const StageBackdrop: React.FC<{glow?: string}> = ({glow = COLORS.blue}) => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <DshBackdrop />
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
        backgroundPosition: 'center center',
        WebkitMaskImage: 'radial-gradient(ellipse 78% 68% at 50% 46%, #000 18%, rgba(0,0,0,0.32) 62%, transparent 92%)',
        maskImage: 'radial-gradient(ellipse 78% 68% at 50% 46%, #000 18%, rgba(0,0,0,0.32) 62%, transparent 92%)',
        opacity: 0.85,
      }}
    />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 62% 52% at 50% 44%, ${glow}1c, transparent 72%)`}} />
    <DshVignette />
  </AbsoluteFill>
);

// ═══════════════════════════ C6 · SIDEBAR OPEN ═══════════════════════════
// 36f / 1.2s：DSH 会话窗口就位 → 右侧栏 panel 从右侧滑出 → tab 依次亮起。

const Dots: React.FC = () => (
  <div style={{display: 'flex', gap: 9}}>
    {['#FF7B72', '#FFBD2E', '#27C93F'].map((c) => (
      <span key={c} style={{width: 13, height: 13, borderRadius: 99, background: c, opacity: 0.85}} />
    ))}
  </div>
);

const SIDEBAR_TABS = ['文件', 'Git', '任务', '侧聊'] as const;

/** 侧栏里的 mock 行（纯装饰，无数字/状态） */
const SidebarRows: React.FC<{baseColor: string}> = ({baseColor}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 18px'}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, height: 40}}>
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            background: i === 1 ? `${baseColor}66` : 'rgba(142,166,255,0.20)',
            border: `1px solid ${COLORS.line}`,
          }}
        />
        <span
          style={{
            height: 10,
            width: `${[62, 78, 48, 70, 56][i]}%`,
            borderRadius: 5,
            background: i === 1 ? `${baseColor}44` : 'rgba(142,166,255,0.14)',
          }}
        />
      </div>
    ))}
  </div>
);

export const C6SidebarOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const winIn = springAt(frame, fps, 0, {damping: 200, mass: 0.9, stiffness: 90});
  const winO = seg(frame, 0, 7);
  const panelIn = springAt(frame, fps, 7, {damping: 200, mass: 0.9, stiffness: 80});
  const panelO = seg(frame, 7, 12);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <StageBackdrop />

      {/* 窗口背后的蓝光 */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 40,
          width: 1640,
          height: 900,
          background: `radial-gradient(closest-side, ${COLORS.blue}2e, transparent 72%)`,
          filter: 'blur(46px)',
          opacity: winO,
        }}
      />

      {/* DSH 会话窗口 mock */}
      <div
        style={{
          position: 'absolute',
          left: 180,
          top: 92,
          width: 1560,
          height: 770,
          borderRadius: 20,
          overflow: 'hidden',
          opacity: winO,
          transform: `translateY(${(1 - winIn) * 46}px) scale(${0.965 + 0.035 * winIn})`,
          background: 'linear-gradient(160deg, rgba(16,24,44,0.94), rgba(6,10,20,0.97))',
          border: `1px solid ${COLORS.lineStrong}`,
          boxShadow: `0 0 0 1px rgba(142,166,255,.14), 0 0 90px ${COLORS.blue}30, 0 50px 130px rgba(0,0,0,.65)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 标题栏 */}
        <div
          style={{
            height: 62,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '0 28px',
            borderBottom: `1px solid ${COLORS.line}`,
            background: 'rgba(10,16,30,0.6)',
            flex: 'none',
          }}
        >
          <Dots />
          <span style={{fontFamily: FONT.mono, fontSize: 20, letterSpacing: 2, color: COLORS.dim}}>
            deepseek harness
          </span>
          <span style={{color: COLORS.faint, fontSize: 20}}>/</span>
          <span style={{fontFamily: FONT.zh, fontSize: 21, color: COLORS.text, opacity: 0.9}}>新会话</span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: FONT.mono,
              fontSize: 19,
              letterSpacing: 2,
              color: COLORS.faint,
            }}
          >
            profile · web
          </span>
        </div>

        {/* 主体：左对话 + 右栏 */}
        <div style={{flex: 1, display: 'flex', position: 'relative', overflow: 'hidden'}}>
          {/* 左：会话区 */}
          <div style={{flex: 1, padding: '34px 40px', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  background: `linear-gradient(160deg, ${COLORS.blue}, #2F46C8)`,
                  boxShadow: `0 0 24px ${COLORS.blue}55`,
                }}
              />
              <div
                style={{
                  padding: '12px 22px',
                  borderRadius: 14,
                  border: `1px solid ${COLORS.blue2}33`,
                  background: `linear-gradient(160deg, ${COLORS.blue}22, ${COLORS.blue}0e)`,
                  fontFamily: FONT.zh,
                  fontSize: 28,
                  color: COLORS.text,
                }}
              >
                把侧边栏打开看看
              </div>
            </div>

            <div style={{marginTop: 26, display: 'flex', gap: 14, alignItems: 'flex-start'}}>
              <span
                style={{
                  marginTop: 6,
                  width: 26,
                  height: 26,
                  borderRadius: 99,
                  border: `1px solid ${COLORS.mint}55`,
                  boxShadow: `0 0 18px ${COLORS.mint}33`,
                }}
              />
              <div style={{display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4}}>
                {[520, 420, 470].map((w, i) => (
                  <span
                    key={i}
                    style={{height: 12, width: w, borderRadius: 6, background: 'rgba(142,166,255,0.14)'}}
                  />
                ))}
              </div>
            </div>

            {/* composer */}
            <div
              style={{
                marginTop: 'auto',
                height: 96,
                borderRadius: 14,
                border: `1px solid ${COLORS.lineStrong}`,
                background: 'rgba(5,8,16,0.86)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                gap: 16,
              }}
            >
              <span style={{fontFamily: FONT.zh, fontSize: 24, color: COLORS.faint}}>
                描述你想构建的东西，/ 命令、@ 文件或会话…
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  width: 52,
                  height: 52,
                  borderRadius: 99,
                  background: `linear-gradient(160deg, ${COLORS.blue}, #3349D6)`,
                  boxShadow: `0 0 26px ${COLORS.blue}55`,
                  flex: 'none',
                  opacity: 0.55,
                }}
              />
            </div>
          </div>

          {/* 右：侧栏 panel（从右侧滑出） */}
          <div
            style={{
              width: 560,
              flex: 'none',
              transform: `translateX(${(1 - panelIn) * 100}%)`,
              opacity: panelO,
              borderLeft: `1px solid ${COLORS.lineStrong}`,
              background: 'linear-gradient(180deg, rgba(20,30,56,0.96), rgba(9,14,28,0.98))',
              boxShadow: `inset 1px 0 0 rgba(142,166,255,.18), -30px 0 80px rgba(0,0,0,.5), 0 0 80px ${COLORS.blue}22`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* 左缘亮线 */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                background: `linear-gradient(180deg, transparent, ${COLORS.blue}, ${COLORS.mint}66, transparent)`,
                boxShadow: `0 0 20px ${COLORS.blue}`,
              }}
            />
            {/* tabs */}
            <div
              style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 18px',
                borderBottom: `1px solid ${COLORS.line}`,
                flex: 'none',
              }}
            >
              {SIDEBAR_TABS.map((tab, i) => {
                const lit = seg(frame, 14 + i * 3, 18 + i * 3);
                const active = i === 0;
                return (
                  <span
                    key={tab}
                    style={{
                      fontFamily: FONT.zh,
                      fontSize: 21,
                      padding: '8px 16px',
                      borderRadius: 9,
                      color: active ? COLORS.text : COLORS.dim,
                      background: active ? 'rgba(142,166,255,0.14)' : 'transparent',
                      border: `1px solid ${active ? COLORS.lineStrong : 'transparent'}`,
                      opacity: 0.35 + 0.65 * lit,
                    }}
                  >
                    {tab}
                  </span>
                );
              })}
            </div>

            <div style={{flex: 1, overflow: 'hidden'}}>
              <SidebarRows baseColor={COLORS.blue} />
            </div>

            <div
              style={{
                height: 46,
                borderTop: `1px solid ${COLORS.line}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 18px',
                fontFamily: FONT.mono,
                fontSize: 18,
                letterSpacing: 2,
                color: COLORS.faint,
              }}
            >
              BETTER SIDEBAR
            </div>
          </div>
        </div>
      </div>

      <Caption kicker="02 / 装好" title="侧栏已就位" delay={3} />
      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ C7 · FEATURES ═══════════════════════════
// 126f / 4.2s：四张能力卡按 10/30/50/70f 依次进入，最后 20f 定格。

type FeatureKind = 'shot' | 'tasks' | 'chat';

type Feature = {
  no: string;
  title: string;
  desc: string;
  kind: FeatureKind;
  src?: string;
  accent: string;
  left: number;
  top: number;
  rot: number;
  beat: number;
};

const FEATURES: Feature[] = [
  {
    no: '01',
    title: '文件树 + 编辑器',
    desc: '懒加载、全局搜索、CodeMirror 编辑、Markdown / Mermaid 预览',
    kind: 'shot',
    src: 'shots/files-tree.png',
    accent: COLORS.blue,
    left: 40,
    top: 256,
    rot: -1.8,
    beat: 10,
  },
  {
    no: '02',
    title: 'Git 工作台',
    desc: '变更分组、AI 变更透镜、提交图谱、多仓库状态',
    kind: 'shot',
    src: 'shots/changes-tree.png',
    accent: COLORS.mint,
    left: 506,
    top: 330,
    rot: 1.6,
    beat: 30,
  },
  {
    no: '03',
    title: '任务拓扑',
    desc: '子代理运行图、后台任务列表、实时输出与强杀',
    kind: 'tasks',
    accent: COLORS.amber,
    left: 972,
    top: 222,
    rot: -1.5,
    beat: 50,
  },
  {
    no: '04',
    title: '侧边对话',
    desc: '继承完整上下文、独立运行、一键提升为顶层会话',
    kind: 'chat',
    accent: COLORS.blue2,
    left: 1438,
    top: 300,
    rot: 1.9,
    beat: 70,
  },
];

const CARD_W = 442;
const CARD_H = 404;

/** 03 任务拓扑示意图：节点 + 连线（无假数字） */
const TasksSketch: React.FC<{accent: string; frame: number}> = ({accent, frame}) => {
  const nodes = [
    {x: 139, y: 24, label: 'LEAD', color: COLORS.blue},
    {x: 22, y: 148, label: 'SCOUT', color: COLORS.mint},
    {x: 256, y: 148, label: 'EXEC', color: accent},
  ];
  const flow = easeInOut(seg(frame, 58, 86));
  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <svg width="100%" height="100%" viewBox="0 0 410 256" style={{position: 'absolute', inset: 0}}>
        <path d="M205 62 L116 148" stroke={COLORS.lineStrong} strokeWidth={2} />
        <path d="M205 62 L350 148" stroke={COLORS.lineStrong} strokeWidth={2} />
        <path
          d="M205 62 L116 148"
          stroke={COLORS.mint}
          strokeWidth={2}
          strokeDasharray="6 8"
          strokeDashoffset={-flow * 46}
          opacity={0.5}
        />
      </svg>
      {nodes.map((n) => (
        <div
          key={n.label}
          style={{
            position: 'absolute',
            left: n.x,
            top: n.y,
            width: 120,
            height: 46,
            borderRadius: 12,
            border: `1px solid ${n.color}66`,
            background: 'rgba(10,16,30,0.9)',
            boxShadow: `0 0 26px ${n.color}22`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 14px',
            fontFamily: FONT.mono,
            fontSize: 18,
            letterSpacing: 2,
            color: COLORS.text,
          }}
        >
          <span style={{width: 9, height: 9, borderRadius: 99, background: n.color, boxShadow: `0 0 12px ${n.color}`}} />
          {n.label}
        </div>
      ))}
    </div>
  );
};

/** 04 侧边对话示意图：两条气泡 + 继承上下文 */
const ChatSketch: React.FC = () => (
  <div style={{position: 'relative', width: '100%', height: '100%', padding: '8px 6px'}}>
    <div
      style={{
        marginLeft: 'auto',
        width: 246,
        padding: '10px 14px',
        borderRadius: 12,
        background: `linear-gradient(160deg, ${COLORS.blue}30, ${COLORS.blue}12)`,
        border: `1px solid ${COLORS.blue2}33`,
        fontFamily: FONT.zh,
        fontSize: 18,
        color: COLORS.text,
      }}
    >
      帮我看下这个文件
    </div>
    <div
      style={{
        marginTop: 12,
        width: 286,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(10,16,30,0.9)',
        border: `1px solid ${COLORS.line}`,
        fontFamily: FONT.zh,
        fontSize: 18,
        color: COLORS.dim,
      }}
    >
      已继承当前会话上下文
    </div>
    <div
      style={{
        position: 'absolute',
        left: 6,
        bottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: FONT.mono,
        fontSize: 18,
        letterSpacing: 2,
        color: COLORS.mint,
      }}
    >
      <span style={{width: 20, height: 2, background: COLORS.mint}} />
      CONTEXT CARRIED OVER
    </div>
  </div>
);

const FeatureCard: React.FC<{item: Feature; frame: number; fps: number}> = ({item, frame, fps}) => {
  const p = springAt(frame, fps, item.beat, {damping: 200, mass: 0.85, stiffness: 88});
  const o = seg(frame, item.beat, item.beat + 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: item.left,
        top: item.top,
        width: CARD_W,
        height: CARD_H,
        boxSizing: 'border-box',
        borderRadius: 20,
        padding: 15,
        transform: `translateX(${(1 - p) * 110}px) translateY(${(1 - p) * 90}px) rotate(${item.rot + (1 - p) * 5}deg) scale(${0.9 + 0.1 * p})`,
        opacity: o,
        background: 'linear-gradient(160deg, rgba(18,27,50,0.95), rgba(7,11,22,0.97))',
        border: `1px solid ${COLORS.lineStrong}`,
        boxShadow: `0 40px 110px rgba(0,0,0,.6), 0 0 80px ${item.accent}18, inset 0 1px 0 rgba(255,255,255,.07)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 头部 */}
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12, padding: '0 4px 10px'}}>
        <span style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 2, color: item.accent}}>{item.no}</span>
        <span style={{fontFamily: FONT.zh, fontSize: 23, fontWeight: 600, color: COLORS.text, letterSpacing: 0.5}}>
          {item.title}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            width: 8,
            height: 8,
            borderRadius: 99,
            background: item.accent,
            boxShadow: `0 0 14px ${item.accent}`,
            opacity: 0.9,
          }}
        />
      </div>

      {/* 视觉区 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 256,
          boxSizing: 'border-box',
          borderRadius: 12,
          overflow: 'hidden',
          background: item.kind === 'shot' ? '#EDF1F9' : 'rgba(5,9,16,0.9)',
          border: item.kind === 'shot' ? `1px solid rgba(15,23,42,0.10)` : `1px solid ${COLORS.line}`,
        }}
      >
        {item.kind === 'shot' && item.src ? (
          <Img
            src={staticFile(item.src)}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block'}}
          />
        ) : null}
        {item.kind === 'tasks' ? (
          <div style={{position: 'absolute', inset: 0, padding: '18px 16px'}}>
            <TasksSketch accent={item.accent} frame={frame} />
          </div>
        ) : null}
        {item.kind === 'chat' ? (
          <div style={{position: 'absolute', inset: 0}}>
            <ChatSketch />
          </div>
        ) : null}
      </div>

      {/* 描述 */}
      <div
        style={{
          marginTop: 11,
          width: '100%',
          fontFamily: FONT.zh,
          fontSize: 18,
          lineHeight: 1.45,
          color: COLORS.dim,
          padding: '0 4px',
          boxSizing: 'border-box',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        {item.desc}
      </div>
    </div>
  );
};

export const C7Features: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const push = 1 + 0.03 * easeInOut(seg(frame, 0, 106));

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <StageBackdrop />

      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 48%'}}>
        {FEATURES.map((item, i) => (
          <div key={item.no} style={{position: 'absolute', inset: 0, zIndex: 10 + i}}>
            <FeatureCard item={item} frame={frame} fps={fps} />
          </div>
        ))}
      </div>

      <Caption kicker="03 / 四张王牌" title="文件 · Git · 任务 · 侧聊" delay={6} />
      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ C8 · WORKBENCH ═══════════════════════════
// 72f / 2.4s：两张真实截图并排放大落位（轻微 3D 透视 + 落地 squash）。

const WORKBENCH_SHOTS = [
  {src: 'shots/files-tree.png', left: 150, from: 6, land: 16, tilt: 11},
  {src: 'shots/changes-tree.png', left: 1010, from: 12, land: 22, tilt: -11},
];

const WorkbenchShot: React.FC<{item: (typeof WORKBENCH_SHOTS)[number]; frame: number; fps: number}> = ({
  item,
  frame,
  fps,
}) => {
  const p = springAt(frame, fps, item.from, {damping: 200, mass: 0.9, stiffness: 86});
  // 落地 squash：land 前 4 帧轻微压扁再回弹
  const squash = 1 - 0.055 * Math.exp(-Math.pow((frame - item.land) / 2.6, 2));
  const o = seg(frame, item.from, item.from + 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: item.left,
        top: 152,
        width: 760,
        height: 475,
        perspective: 1600,
        opacity: o,
        transform: `translateY(${(1 - p) * 70}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${COLORS.lineStrong}`,
          background: '#EDF1F9',
          boxShadow: `0 50px 130px rgba(0,0,0,.62), 0 0 70px ${COLORS.blue}18`,
          transform: `rotateY(${item.tilt}deg) rotateX(1.6deg) scaleY(${squash}) scaleX(${1 + (1 - squash) * 0.5})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Img
          src={staticFile(item.src)}
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block'}}
        />
      </div>
    </div>
  );
};

export const C8Workbench: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <StageBackdrop />

      {WORKBENCH_SHOTS.map((item) => (
        <WorkbenchShot key={item.src} item={item} frame={frame} fps={fps} />
      ))}

      <Caption
        kicker="04 / 工作台"
        title="一个侧边栏，装下整个开发工作台。"
        delay={4}
        style={{maxWidth: 1060}}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ C9 · OUTRO ═══════════════════════════
// 60f / 2s：Better Sidebar 片尾卡；最后 15 帧静止。

const INSTALL_CMD = 'dsh plugin --profile web add dsh-better-sidebar';

export const C9Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rise = (start: number, dur = 12) => {
    const p = easeOut(seg(frame, start, start + dur));
    return {opacity: p, transform: `translateY(${(1 - p) * 26}px)`};
  };

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <StageBackdrop glow={COLORS.blue} />

      {/* 右侧柔光 + 两张截图 */}
      <div
        style={{
          position: 'absolute',
          right: -80,
          top: 110,
          width: 900,
          height: 900,
          background: `radial-gradient(closest-side, ${COLORS.blue}26, transparent 72%)`,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{position: 'absolute', left: 1080, top: 236, width: 420, height: 263, ...rise(8, 14)}}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${COLORS.lineStrong}`,
            transform: 'rotate(-3.2deg)',
            boxShadow: '0 40px 100px rgba(0,0,0,.6)',
            background: '#EDF1F9',
          }}
        >
          <Img
            src={staticFile('shots/files-tree.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block'}}
          />
        </div>
      </div>

      <div style={{position: 'absolute', left: 1244, top: 402, width: 420, height: 263, ...rise(13, 14)}}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${COLORS.lineStrong}`,
            transform: 'rotate(2.4deg)',
            boxShadow: '0 40px 100px rgba(0,0,0,.62)',
            background: '#EDF1F9',
          }}
        >
          <Img
            src={staticFile('shots/changes-tree.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block'}}
          />
        </div>
      </div>

      {/* 左侧片尾卡 */}
      <div style={{position: 'absolute', left: 110, top: 206, width: 1080}}>
        <div style={rise(2, 12)}>
          <Wordmark scale={0.74} />
        </div>

        <div
          style={{
            marginTop: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: FONT.mono,
            fontSize: 18,
            letterSpacing: 4,
            color: COLORS.mint,
            ...rise(6, 10),
          }}
        >
          <span style={{width: 26, height: 2, background: COLORS.mint}} />
          PLUGIN PROMO · CASE 02
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: FONT.latin,
            fontSize: 108,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
            color: COLORS.text,
            textShadow: '0 24px 80px rgba(0,0,0,0.55)',
            ...rise(10, 12),
          }}
        >
          Better Sidebar
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: FONT.mono,
            fontSize: 26,
            letterSpacing: 1,
            color: COLORS.mint,
            ...rise(14, 10),
          }}
        >
          dsh-better-sidebar
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: FONT.zh,
            fontSize: 34,
            letterSpacing: 0.4,
            color: COLORS.text,
            opacity: 0.92,
            ...rise(18, 12),
          }}
        >
          一个侧边栏，装下整个开发工作台。
        </div>

        {/* 安装条（同 v2 安装条风格，命令为 Better Sidebar） */}
        <div
          style={{
            marginTop: 34,
            width: 900,
            height: 62,
            borderRadius: 11,
            border: `1px solid ${COLORS.lineStrong}`,
            background: 'rgba(6,10,20,0.92)',
            boxShadow: `0 24px 70px rgba(0,0,0,.5), 0 0 50px ${COLORS.blue}18`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 22px',
            ...rise(22, 10),
          }}
        >
          <span style={{color: COLORS.mint, fontSize: 20}}>$</span>
          <span style={{fontFamily: FONT.mono, fontSize: 23, color: COLORS.text, letterSpacing: 0.3}}>
            {INSTALL_CMD}
          </span>
          <span style={{marginLeft: 'auto', fontFamily: FONT.mono, fontSize: 18, letterSpacing: 2, color: COLORS.faint}}>
            MIT
          </span>
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            fontFamily: FONT.mono,
            fontSize: 19,
            letterSpacing: 1.4,
            color: COLORS.dim,
            ...rise(26, 10),
          }}
        >
          <span>github.com/omdsh-dev/DSH-better-sidebar</span>
          <span style={{width: 3, height: 3, borderRadius: 9, background: 'rgba(140,140,140,.45)'}} />
          <span style={{color: COLORS.faint}}>PROMO MADE WITH DSH-REEL</span>
        </div>
      </div>

      <Grain />
    </AbsoluteFill>
  );
};

// ───────────────────────── 独立预览入口用 Root ─────────────────────────
/** 只注册 CASE-2 的四场；主 Composition 仍由 compositions/ReelPromo 负责。 */
export const CaseFeatRoot: React.FC = () => (
  <>
    <Composition id="CaseFeat6" component={C6SidebarOpen} durationInFrames={36} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="CaseFeat7" component={C7Features} durationInFrames={126} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="CaseFeat8" component={C8Workbench} durationInFrames={72} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="CaseFeat9" component={C9Outro} durationInFrames={60} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
