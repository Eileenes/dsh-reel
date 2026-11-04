/**
 * HeroScenes — P2 成片（24s / 720f）的 4 个 3D 主角场景：S1 / S2 / S8 / S9。
 *
 * 每个场景都是独立的 1920×1080 Composition 组件（正片由 src/v2/entry.tsx 的 ReelPromo
 * 用 <Sequence> 截取；也由 scenes/hero/entry.ts 注册成 Hero1/Hero2/Hero8/Hero9 单独预览）。
 *
 * 分层（关键！鲸鱼要能站在 HTML 窗口/成品卡"上面"，所以 3D 拆两层）：
 *   1. DshBackdrop     — CSS 深蓝底
 *   2. StageCanvas     — DshStage（网格/光晕/雾，3D）    ← 在 HTML 下面
 *   3. DshVignette     — 先压暗 3D，别把 HTML UI 也压暗
 *   4. HTML UI         — 终端 / DSH 主窗 / 成品卡 / 片尾卡（DOM = 清晰文字）
 *   5. WhaleCanvas     — 鲸鱼单独一层（透明底，同一台相机） ← 在 HTML 上面
 *   6. Grain           — 最后加胶片颗粒
 *
 * 全部动画是 useCurrentFrame 的纯函数；3D 相机走 stage/CameraRig。
 * 渲染必须带 --gl=angle（本机 headless 默认拿不到 WebGL context）。
 */

import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraPose, CameraRig} from '../../stage/CameraRig';
import {DshBackdrop, DshStage, DshVignette} from '../../stage/DshStage';
import {WhaleVoxel} from '../../whale/WhaleVoxel';
import {Caption, Grain, InstallCmd, Wordmark} from '../../components/Chrome';
import {COLORS, FONT, RADIUS, TYPE, VIDEO} from '../../tokens';

// ───────────────────────── 小工具（纯函数） ─────────────────────────
const seg = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / (b - a || 1)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const E = {
  sineInOut: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  cubicOut: (x: number) => 1 - Math.pow(1 - x, 3),
  cubicInOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  expoOut: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
};

const mixPose = (a: CameraPose, b: CameraPose, k: number): CameraPose => ({
  p: [lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k), lerp(a.p[2], b.p[2], k)],
  l: [lerp(a.l[0], b.l[0], k), lerp(a.l[1], b.l[1], k), lerp(a.l[2], b.l[2], k)],
  fov: lerp(a.fov, b.fov, k),
});

// ───────────────────────── 3D 公共件 ─────────────────────────
/** 与 P1 proof 一致的灯光（鲸鱼观感不要变） */
const HeroLights: React.FC = () => (
  <>
    <hemisphereLight args={[0xaabfff, 0x0a1024, 1.6]} />
    <directionalLight position={[4.5, 10, 7]} intensity={3.0} color={0xffffff} />
    <directionalLight position={[6, 3, -8]} intensity={2.0} color={0x4d6bfe} />
    <directionalLight position={[2.8, 2.6, 6.2]} intensity={0.6} color={0x8ea6ff} />
    <pointLight position={[1.5, 2.1, 1.5]} intensity={1.15} color={0xbfd4ff} decay={2} />
  </>
);

/** 透明 3D 画布（显式 width/height；camera 初值 + CameraRig 每帧摆位） */
const LayerCanvas: React.FC<{camera: CameraPose; children: React.ReactNode}> = ({camera, children}) => (
  <ThreeCanvas
    width={VIDEO.width}
    height={VIDEO.height}
    flat
    dpr={1}
    gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}
    camera={{fov: camera.fov, near: 0.1, far: 90, position: [camera.p[0], camera.p[1], camera.p[2]]}}
    style={{position: 'absolute', top: 0, left: 0}}
  >
    <CameraRig {...camera} />
    {children}
  </ThreeCanvas>
);

// ───────────────────────── HTML 终端窗（S1） ─────────────────────────
const TERM_W = 860;

const TerminalWindow: React.FC<{
  /** 已输入的字符数 */
  typed: number;
  /** 要逐字打出的完整命令 */
  copy: string;
  /** 标题栏文案 */
  termTitle: string;
  /** 右下角 mono 小标（由 termTitle 首段派生，如 DSH-REEL / BETTER-SIDEBAR） */
  product: string;
  caretOn: boolean;
  /** 结尾蓝光涌出强度 0..1 */
  gather: number;
}> = ({typed, copy, termTitle, product, caretOn, gather}) => {
  const chars = copy.slice(0, typed);
  return (
    <div style={{position: 'relative', width: TERM_W}}>
      {/* 结尾从字符里涌出的蓝光（在终端面板后面，只从边缘透出来） */}
      <div
        style={{
          position: 'absolute',
          left: -190,
          right: -150,
          bottom: -200,
          height: 560,
          background: `radial-gradient(ellipse at 30% 74%, ${COLORS.blue}EE 0%, ${COLORS.blue2}55 34%, rgba(0,0,0,0) 70%)`,
          opacity: Math.min(1, gather * 1.15),
          filter: 'blur(28px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          borderRadius: RADIUS.lg,
          border: `1px solid ${COLORS.lineStrong}`,
          background: 'linear-gradient(180deg, rgba(12,18,34,0.97), rgba(6,10,20,0.985))',
          boxShadow: `0 50px 150px rgba(0,0,0,0.72), 0 0 ${70 + gather * 130}px ${COLORS.blue}${gather > 0.2 ? '66' : '22'}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          overflow: 'hidden',
        }}
      >
        {/* 标题栏 */}
        <div
          style={{
            height: 50,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            borderBottom: `1px solid ${COLORS.line}`,
            background: 'rgba(255,255,255,0.025)',
          }}
        >
          <div style={{display: 'flex', gap: 9, width: 96}}>
            {[COLORS.danger, COLORS.amber, COLORS.mint].map((c) => (
              <span key={c} style={{width: 11, height: 11, borderRadius: 99, background: c, opacity: 0.85}} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: FONT.mono,
              fontSize: 16,
              letterSpacing: 1,
              color: COLORS.faint,
            }}
          >
            {termTitle}
          </div>
          <div style={{width: 96}} />
        </div>

        {/* 终端正文 */}
        <div style={{padding: '32px 40px 34px', fontFamily: FONT.mono}}>
          <div style={{fontSize: 17, color: COLORS.faint, letterSpacing: 0.3}}>
            Last login: Tue Nov 4 10:51:02 on harness
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 26}}>
            <span style={{fontSize: 28, color: COLORS.mint}}>$</span>
            <span
              style={{
                fontSize: 28,
                color: COLORS.text,
                letterSpacing: 1.5,
                textShadow: gather > 0.05 ? `0 0 ${gather * 44}px ${COLORS.blue2}` : 'none',
              }}
            >
              {chars}
            </span>
            <span
              style={{
                width: 14,
                height: 29,
                borderRadius: 2,
                background: caretOn ? COLORS.blue2 : 'transparent',
                boxShadow: caretOn ? `0 0 22px ${COLORS.blue2}` : 'none',
              }}
            />
          </div>
          <div style={{marginTop: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{fontSize: 14, letterSpacing: 5, color: COLORS.faint}}>DEEPSEEK HARNESS</div>
            <div style={{fontSize: 13, letterSpacing: 2.6, color: `${COLORS.blue2}99`}}>{product} · PROMO KIT</div>
          </div>
        </div>
        {/* 聚光时从光标处亮起来的一层蓝光洗（在面板内，压不住文字） */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 20% 76%, ${COLORS.blue2}3a 0%, rgba(0,0,0,0) 62%)`,
            opacity: gather,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════ S1 · HOOK（78f） ═══════════════════════════
/** 结尾蓝光聚集点：终端光标附近（世界坐标 → 屏幕左下） */
const S1_CURSOR: [number, number, number] = [-0.95, 0.13, 1.36];

/** 终端上屏尺寸：面板 860 × scale 1.3 = 1118 ≈ Lead 说的"宽 1100" */
const S1_TERM_SCALE = 1.3;
const S1_TERM_LEFT = 120;
const S1_TERM_BOTTOM = 118;

/**
 * S1 背景动势：一束很淡的竖光 + 一条慢扫描线，从 f0 到 f78 缓慢移动。
 * 画在 3D 舞台之上、终端之下（终端不会被盖），mixBlendMode: screen 只提亮不加雾。
 */
const S1Sweep: React.FC<{f: number}> = ({f}) => {
  const k = seg(f, 0, 78);
  const beamX = lerp(66, 40, E.sineInOut(k)); // 光柱从上往下缓慢左移
  const beamRot = lerp(9, -5, E.sineInOut(k));
  const scanY = lerp(-14, 112, k); // 扫描线每 78 帧扫过一遍
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {/* 竖光柱 */}
      <div
        style={{
          position: 'absolute',
          left: `${beamX}%`,
          top: '-24%',
          width: 460,
          height: '150%',
          transform: `translateX(-50%) rotate(${beamRot}deg)`,
          background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, ${COLORS.blue2}1f 42%, ${COLORS.blue}18 58%, rgba(0,0,0,0) 100%)`,
          filter: 'blur(30px)',
          opacity: 0.6,
        }}
      />
      {/* 横向扫描光 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${scanY}%`,
          height: 210,
          background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${COLORS.blue2}10 50%, rgba(0,0,0,0) 100%)`,
          filter: 'blur(20px)',
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * S1 右上角品牌/钩子（f18 后淡入，字号克制，不抢 S9 的片尾主标题）：
 * DSH wordmark 小标 + mono kicker + 一行中文钩子。
 */
const S1Brand: React.FC<{f: number; hook: string; eyebrow: string}> = ({f, hook, eyebrow}) => {
  const p = E.cubicOut(seg(f, 18, 34));
  // 长钩子自动降一档字号（40px），保证右上区域一行放得下；默认 15 字仍用 44px
  const hookSize = hook.length > 18 ? 40 : 44;
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: 120,
        top: 122,
        width: 880,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 16,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <Wordmark scale={0.62} />
      <div
        style={{
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: FONT.mono,
          fontSize: 13,
          letterSpacing: 4.6,
          color: COLORS.mint,
        }}
      >
        {eyebrow}
        <span style={{width: 24, height: 2, background: COLORS.mint, flexShrink: 0}} />
      </div>
      <div
        style={{
          fontFamily: FONT.zh,
          fontSize: hookSize,
          fontWeight: 500,
          letterSpacing: 0.6,
          lineHeight: 1.25,
          color: COLORS.text,
          textAlign: 'right',
          whiteSpace: 'pre-line',
          textShadow: '0 12px 44px rgba(0,0,0,0.55)',
        }}
      >
        {hook}
      </div>
    </div>
  );
};

/**
 * S1 开场的可替换文案（供其它插件 case 复用；不传 = dsh-reel 现状）。
 * 布局/时间轴/聚光节奏全部不变，只换文字。
 */
export type S1HookProps = {
  /** 终端里逐字打出的命令：f12/f21/f30 三拍，更长的命令按 9 帧/字符继续 */
  typed?: string;
  /** 终端标题栏 */
  termTitle?: string;
  /** 右上中文钩子（放不下自动折到第二行，最多两行） */
  hook?: string;
  /** 右上 mono 小标 */
  eyebrow?: string;
  /** 是否在结尾出现小鲸鱼 + 喷水（用于 30s 故事版的 S1） */
  whale?: boolean;
};

const S1Whale: React.FC<{f: number}> = ({f}) => {
  const enter = E.cubicOut(seg(f, 88, 104));
  const bob = Math.sin(f / 9) * 4;
  const spoutT = Math.max(0, Math.min(1, (f - 106) / 22));
  const spoutOn = f >= 106 && f <= 130;
  const drops = [
    {x: -26, y: -8, s: 14, d: 0},
    {x: -12, y: -16, s: 11, d: 2},
    {x: 4, y: -20, s: 15, d: 1},
    {x: 20, y: -14, s: 11, d: 3},
    {x: 34, y: -6, s: 10, d: 4},
    {x: -34, y: 2, s: 10, d: 5},
    {x: 42, y: 4, s: 9, d: 6},
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: 520,
        bottom: 520 + bob,
        width: 320,
        opacity: enter,
        transform: `scale(${0.5 + enter * 0.5})`,
        transformOrigin: '50% 100%',
      }}
    >
      {spoutOn
        ? drops.map((d, i) => {
            const k = Math.max(0, Math.min(1, (f - 106 - d.d * 2) / 20));
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: 160 + d.x,
                  top: 20 + d.y - k * (70 + d.s * 2),
                  width: d.s,
                  height: d.s,
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg,#eaf7ff,#8ecbff)',
                  boxShadow: '0 0 10px rgba(150,215,255,0.85)',
                  opacity: k > 0 ? (1 - k) * 0.95 : 0,
                  transform: `translateX(${k * (d.x * 0.5)}px) scale(${1 - k * 0.3})`,
                }}
              />
            );
          })
        : null}
      <img
        src={staticFile('shots/whale-sprite.png')}
        style={{
          width: 280,
          height: 170,
          filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45)) drop-shadow(0 0 18px rgba(120,180,255,0.35))',
        }}
      />
    </div>
  );
};

export const S1Hook: React.FC<S1HookProps> = ({
  typed: typedCopy = 'dsh',
  termTitle = 'dsh-reel — zsh — 120×32',
  hook = '给每个插件，一条自己的宣传片。',
  eyebrow = 'DSH PLUGIN · PROMO KIT',
  whale = false,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;

  // 地面网格从暗到亮 + 一圈扫描；结尾蓝光聚在终端前（为 S2 拼合做引子）
  const reveal = E.cubicOut(seg(f, 2, 30));
  const ring = seg(f, 4, 46);
  const gather = E.cubicInOut(seg(f, 46, 76));
  const cursorOpacity = gather * (0.75 + 0.25 * Math.sin(t * 9));
  // 打字节奏保持：f12 / f21 / f30 各一个字符（长命令按 9 帧/字符继续）
  const shown = f < 12 ? 0 : Math.min(typedCopy.length, 1 + Math.floor((f - 12) / 9));
  const caretOn = shown < typedCopy.length ? true : Math.floor(f / 7) % 2 === 0;
  // 右下角小标由标题首段派生：'dsh-reel — …' → DSH-REEL（默认输出与改版前一致）
  const product = termTitle.split('—')[0].trim().toUpperCase();

  const push = E.sineInOut(seg(f, 0, 78));
  const cam: CameraPose = {
    p: [lerp(1.06, 0.98, push), lerp(1.36, 1.27, push), lerp(3.95, 3.45, push)],
    l: [0.02, lerp(0.32, 0.35, push), 0.02],
    fov: 38,
  };

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <LayerCanvas camera={cam}>
        <DshStage
          reveal={reveal}
          ring={ring}
          cursorOpacity={cursorOpacity}
          cursorScaleY={0.001}
          cursorWorld={S1_CURSOR}
        />
      </LayerCanvas>
      <DshVignette />
      {/* 背景动势：淡竖光 + 扫描光（在终端下面，不会盖过打字） */}
      <S1Sweep f={f} />
      {/* 终端：放大 1.3 倍、往画面中心偏左下移，让 `$ dsh` 打字更清楚 */}
      {(() => {
        const exit = whale ? E.cubicInOut(seg(f, 128, 146)) : 0;
        return (
          <div
            style={{
              position: 'absolute',
              left: S1_TERM_LEFT,
              bottom: S1_TERM_BOTTOM,
              width: TERM_W,
              transformOrigin: 'left bottom',
              transform: `perspective(2000px) translateY(${exit * 90}px) rotateY(4deg) rotateX(1.6deg) scale(${S1_TERM_SCALE * (1 - 0.22 * exit)})`,
              opacity: 1 - exit,
            }}
          >
            <TerminalWindow
              typed={shown}
              copy={typedCopy}
              termTitle={termTitle}
              product={product}
              caretOn={f < 100}
              gather={gather}
            />
          </div>
        );
      })()}
      {/* 小鲸鱼出现 + 喷水 */}
      {whale ? <S1Whale f={f} /> : null}
      {/* 右上品牌 + 中文钩子（f18 后淡入，鲸鱼出现后让位） */}
      <div style={{opacity: whale ? 1 - E.cubicOut(seg(f, 92, 108)) : 1}}>
        <S1Brand f={f} hook={hook} eyebrow={eyebrow} />
      </div>
      {/* 黑场起幅：前 ~8 帧压黑，f0–f8 保持黑场，之后淡入 */}
      <AbsoluteFill
        style={{
          backgroundColor: '#000000',
          opacity: f < 8 ? 1 : 1 - E.cubicOut(seg(f, 8, 18)),
          pointerEvents: 'none',
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ S2 · HATCH（78f） ═══════════════════════════
/**
 * S2 的鲸鱼时间重映射（scene frame → WhaleVoxel 内部时间秒）。
 * P1 的时间轴是 5s 的：拼合 1.14–2.5s、喷水 3.0s、眨眼 3.44s、大跳 3.667–4.667s。
 * 成片里 S2 只有 78 帧（2.6s），所以用分段线性把 5s 的表演压/挪到 2.6s：
 *   f0-8 蓝光（体素还没出现）→ f8-40 拼合 → f40 落地 → f45 喷水 → f48 眨眼
 *   → f52-64 大跳（提前落地，参考片的大跳本来就是 0.5s 级）→ f64-78 站定在窗口边转 3/4
 * 最后 8 帧（f70-78）镜头朝 DSH 窗口里推、窗口放大压暗 → "进入 DSH" 的动机，接 S3 市场页。
 */
const S2_WARP: Array<[number, number]> = [
  [0, 1.02],
  [8, 1.14],
  [40, 2.5],
  [45, 3.0],
  [48, 3.44],
  [52, 3.667],
  [64, 4.667],
  [78, 4.95],
];

const warpS2 = (f: number): number => {
  for (let i = 1; i < S2_WARP.length; i++) {
    const [f0, t0] = S2_WARP[i - 1];
    const [f1, t1] = S2_WARP[i];
    if (f <= f1) return t0 + (t1 - t0) * seg(f, f0, f1);
  }
  return S2_WARP[S2_WARP.length - 1][1];
};

/** S2 拼合起点：屏幕左下的一点（终端光标的方向），世界坐标 */
const S2_CURSOR: [number, number, number] = [-0.74, 0.16, 0.87];

/** DSH 主窗（HTML mock）：左会话栏 / 中间 composer / 底部输入框；半躺在桌面上 */
const SIDE_W = 286;

const DshWindow: React.FC<{reveal: number; glow: number; zoom: number}> = ({reveal, glow, zoom}) => {
  const ease = E.cubicOut(Math.min(1, reveal * 1.06));
  return (
    <div
      style={{
        position: 'absolute',
        right: 30,
        top: 140,
        width: 1560,
        height: 900,
        transformOrigin: '4% 19%',
        transform: `scale(${zoom})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '50% 100%',
          transform: 'perspective(1600px) rotateX(38deg) rotateZ(-2.2deg)',
          clipPath: `inset(${(1 - ease) * 100}% 0 0 0)`,
          opacity: Math.min(1, reveal * 2.8),
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -10,
            height: 120,
            background: `radial-gradient(ellipse at 50% 0%, ${COLORS.blue}88 0%, rgba(0,0,0,0) 70%)`,
            opacity: glow,
            filter: 'blur(14px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 22,
            border: '1px solid rgba(180,205,255,0.22)',
            background: '#f6f8fc',
            boxShadow: `0 60px 170px rgba(0,0,0,0.78), 0 0 160px ${COLORS.blue}2e, inset 0 1px 0 rgba(255,255,255,0.09)`,
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile('shots/dsh-main-clean.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left top', display: 'block'}}
          />
        </div>
      </div>
    </div>
  );
};

/** S2 相机：低机位慢推 → 落地抬升后拉 → 结尾朝窗口里推（衔接 S3 市场页） */
const S2_CAM_A: CameraPose = {p: [1.02, 1.26, 3.5], l: [0.0, 0.34, 0.0], fov: 38.5};
const S2_CAM_B: CameraPose = {p: [1.3, 1.5, 3.95], l: [0.12, 0.42, 0.0], fov: 40};
/** 鲸鱼站定在窗口边（f48-70） */
const S2_CAM_C: CameraPose = {p: [1.5, 1.5, 3.6], l: [0.38, 0.24, -0.3], fov: 40};
/** 最后 8 帧：镜头朝窗口里推（压低看点、向前） */
const S2_CAM_D: CameraPose = {p: [1.4, 1.24, 2.9], l: [0.5, 0.02, -0.72], fov: 41};

export const S2Hatch: React.FC = () => {
  const f = useCurrentFrame();

  const k1 = E.sineInOut(seg(f, 10, 44));
  const k2 = E.cubicInOut(seg(f, 48, 70));
  const k3 = E.cubicInOut(seg(f, 70, 78));
  const cam = mixPose(mixPose(mixPose(S2_CAM_A, S2_CAM_B, k1), S2_CAM_C, k2), S2_CAM_D, k3);

  const cursorOpacity = 1 - E.sineInOut(seg(f, 8, 42));
  const windowReveal = E.cubicInOut(seg(f, 40, 64));
  const windowGlow = Math.max(0, 1 - Math.abs(f - 64) / 18);
  // 结尾 8 帧：窗口放大（进入 DSH）+ 画面轻微压暗
  const enter = seg(f, 70, 78);
  const windowZoom = 1 + 0.75 * enter * enter;
  const endDim = 0.4 * Math.pow(seg(f, 71, 78), 1.3);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      {/* 3D 舞台在 HTML 下面 */}
      <LayerCanvas camera={cam}>
        <DshStage
          reveal={1}
          ring={1}
          cursorOpacity={cursorOpacity}
          cursorScaleY={0.001}
          cursorWorld={S2_CURSOR}
        />
      </LayerCanvas>
      <DshVignette />
      <DshWindow reveal={windowReveal} glow={windowGlow} zoom={windowZoom} />
      {/* 终端在鲸鱼出现时保留：从 S1 的完整尺寸缩小到左侧，不消失 */}
      <div
        style={{
          position: 'absolute',
          left: S1_TERM_LEFT,
          bottom: S1_TERM_BOTTOM,
          width: TERM_W,
          transformOrigin: 'left bottom',
          transform: `perspective(2000px) translateY(${E.cubicOut(seg(f, 46, 60)) * 80}px) translateX(${-E.cubicOut(seg(f, 46, 60)) * 50}px) rotateY(4deg) rotateX(1.6deg) scale(${S1_TERM_SCALE - 0.5 * E.cubicOut(seg(f, 0, 24)) - 0.12 * E.cubicOut(seg(f, 46, 60))})`,
          opacity: 1 - E.cubicOut(seg(f, 46, 60)),
        }}
      >
        <TerminalWindow
          typed={3}
          copy="dsh"
          termTitle="better-sidebar — zsh — 120×32"
          product="BETTER-SIDEBAR"
          caretOn={false}
          gather={0}
        />
      </div>
      {/* 鲸鱼单独一层，盖在 HTML 窗口上面（跳到窗口上才不会被盖住） */}
      <LayerCanvas camera={cam}>
        <HeroLights />
        <group scale={0.55} position={[0.6, -0.02, 0.1]}>
          <WhaleVoxel time={warpS2(f)} cursorWorld={S2_CURSOR} />
        </group>
      </LayerCanvas>
      {/* 进入窗口的压暗（接 S3 市场页） */}
      <AbsoluteFill style={{backgroundColor: COLORS.bg0, opacity: endDim, pointerEvents: 'none'}} />
      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ S8 · OUTPUTS（72f） ═══════════════════════════
type ArtifactProps = {
  f: number;
  fps: number;
  /** 开始下落的帧 */
  start: number;
  /** 砸到桌面的帧 */
  land: number;
  fromX: number;
  fromY: number;
  rotate0: number;
  rotate1: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: string;
};

const Artifact: React.FC<ArtifactProps> = ({
  f,
  fps,
  start,
  land,
  fromX,
  fromY,
  rotate0,
  rotate1,
  children,
  style,
  glow = COLORS.blue,
}) => {
  const k = spring({frame: f - start, fps, config: {damping: 13, mass: 0.9, stiffness: 110}});
  const op = Math.min(1, Math.max(0, (f - start + 2) / 5));
  // 落地余震：轻微 squash（纸落到桌面上的一次挤压）
  const tau = Math.max(0, f - land);
  const ring = Math.exp(-12 * tau) * Math.cos(26 * tau);
  const sy = 1 - 0.07 * ring;
  const sx = 1 + 0.055 * ring;
  const flash = f >= land ? Math.exp(-9 * tau) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        opacity: op,
        transform: `translate(${fromX * (1 - k)}px, ${fromY * (1 - k)}px) rotate(${lerp(rotate0, rotate1, k)}deg) scale(${sx}, ${sy})`,
        transformOrigin: '50% 92%',
        ...style,
      }}
    >
      {/* 落桌光晕 */}
      <div
        style={{
          position: 'absolute',
          left: '-8%',
          right: '-8%',
          bottom: '-12%',
          top: '30%',
          background: `radial-gradient(ellipse at 50% 80%, ${glow}${flash > 0.2 ? '66' : '33'} 0%, rgba(0,0,0,0) 68%)`,
          opacity: 0.25 + flash * 0.75,
          filter: 'blur(16px)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
};

/** 16:9 视频帧卡：截图 + 播放按钮 + 进度条 + 1080p · LOCAL RENDER 角标 */
const VideoArtifact: React.FC = () => (
  <div
    style={{
      position: 'relative',
      width: 590,
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${COLORS.lineStrong}`,
      background: '#05070D',
      boxShadow: `0 46px 120px rgba(0,0,0,0.7), 0 0 80px ${COLORS.blue}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
    }}
  >
    <Img src={staticFile('v2/video-still.png')} style={{width: '100%', display: 'block'}} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(180deg, rgba(3,5,11,0.5) 0%, rgba(3,5,11,0) 26%, rgba(3,5,11,0.15) 62%, rgba(3,5,11,0.86) 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 16,
        top: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: FONT.mono,
        fontSize: 12,
        letterSpacing: 2,
        color: COLORS.blue2,
        background: 'rgba(5,7,13,0.7)',
        border: `1px solid ${COLORS.line}`,
        borderRadius: 7,
        padding: '6px 10px',
      }}
    >
      <span style={{width: 6, height: 6, borderRadius: 99, background: COLORS.mint, boxShadow: `0 0 10px ${COLORS.mint}`}} />
      1080p · LOCAL RENDER
    </div>
    {/* 播放按钮 */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '47%',
        transform: 'translate(-50%, -50%)',
        width: 84,
        height: 84,
        borderRadius: 99,
        background: 'rgba(8,13,26,0.55)',
        border: `1px solid ${COLORS.lineStrong}`,
        boxShadow: `0 0 50px ${COLORS.blue}55, inset 0 1px 0 rgba(255,255,255,0.12)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          marginLeft: 6,
          borderTop: '15px solid transparent',
          borderBottom: '15px solid transparent',
          borderLeft: `24px solid ${COLORS.text}`,
        }}
      />
    </div>
    {/* 进度条 */}
    <div style={{position: 'absolute', left: 20, right: 20, bottom: 22}}>
      <div style={{height: 4, borderRadius: 99, background: 'rgba(244,247,255,0.18)', overflow: 'hidden'}}>
        <div style={{width: '34%', height: '100%', background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.mint})`, borderRadius: 99}} />
      </div>
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONT.mono,
          fontSize: 12,
          letterSpacing: 1.6,
          color: 'rgba(244,247,255,0.62)',
        }}
      >
        <span>16:9 · 宣传片</span>
        <span>00:08 / 00:24</span>
      </div>
    </div>
  </div>
);

/** 3:4 海报卡 */
const PosterArtifact: React.FC = () => (
  <div
    style={{
      position: 'relative',
      width: 322,
      padding: 12,
      borderRadius: 16,
      border: `1px solid ${COLORS.lineStrong}`,
      background: 'linear-gradient(165deg, rgba(240,244,255,0.96), rgba(208,217,240,0.9))',
      boxShadow: `0 44px 110px rgba(0,0,0,0.68), 0 0 70px ${COLORS.mint}22, inset 0 1px 0 rgba(255,255,255,0.4)`,
    }}
  >
    <Img src={staticFile('v2/poster-mint.png')} style={{width: '100%', display: 'block', borderRadius: 9}} />
    <div
      style={{
        marginTop: 10,
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: FONT.mono,
        fontSize: 11,
        letterSpacing: 2,
        color: 'rgba(11,18,32,0.62)',
      }}
    >
      <span>POSTER · 3:4</span>
      <span>2160×2880</span>
    </div>
  </div>
);

export const S8Outputs: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sceneT = f / fps;

  // 缓慢拉开（一镜一事：只做后拉）
  const pull = E.sineInOut(seg(f, 0, 72));
  const cam: CameraPose = {
    p: [lerp(1.34, 1.48, pull), lerp(1.24, 1.32, pull), lerp(3.2, 3.62, pull)],
    l: [lerp(0.2, 0.3, pull), 0.42, 0.0],
    fov: 40,
  };

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <LayerCanvas camera={cam}>
        <DshStage reveal={1} ring={1} cursorOpacity={0} cursorScaleY={0.001} cursorWorld={S2_CURSOR} />
      </LayerCanvas>
      <DshVignette />

      {/* 成品落桌：先海报（右、远），再视频（左、近） */}
      <Artifact
        f={f}
        fps={fps}
        start={2}
        land={11}
        fromX={150}
        fromY={-920}
        rotate0={9}
        rotate1={3.2}
        style={{left: 1188, top: 300}}
        glow={COLORS.mint}
      >
        <PosterArtifact />
      </Artifact>
      <Artifact
        f={f}
        fps={fps}
        start={6}
        land={16}
        fromX={-420}
        fromY={-980}
        rotate0={-8}
        rotate1={-2.4}
        style={{left: 604, top: 486}}
      >
        <VideoArtifact />
      </Artifact>

      <Caption
        kicker="OUTPUT · 双画幅"
        title="16:9 宣传片 + 3:4 宣传图"
        sub="本地渲染 · 1080p · 一条命令出片"
        delay={18}
        color={COLORS.mint}
      />

      {/* 鲸鱼单独一层，盖在成品卡上面（idle：呼吸/摆尾/眨眼 + 一次喷水） */}
      <LayerCanvas camera={cam}>
        <HeroLights />
        <group position={[0.05, 0, 0.06]} rotation={[0, 0.14, 0]} scale={0.78}>
          <WhaleVoxel idle time={sceneT + 2.2} cursorWorld={S2_CURSOR} spout={false} />
        </group>
      </LayerCanvas>
      <Grain />
    </AbsoluteFill>
  );
};

// ═══════════════════════════ S9 · OUTRO（60f） ═══════════════════════════
export const S9Outro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sceneT = f / fps;

  // 最后 20 帧完全静止：鲸鱼时间/相机/文字动画都在 f40 前收干净
  const FREEZE = 40;
  const frozen = f >= FREEZE;
  // idle 时间不偏移 → 没有喷水（片尾要静）；f40 之后冻住呼吸/摆尾
  const wt = Math.min(sceneT, FREEZE / 30);
  const drift = frozen ? 0 : seg(f, 0, FREEZE);

  const cam: CameraPose = {
    p: [1.22 - 0.02 * drift, 1.32 + 0.012 * drift, 3.74 - 0.05 * drift],
    l: [0.14, 0.44, 0.0],
    fov: 39,
  };

  // 鲸鱼从右侧游入 → 悬浮在右侧
  const inK = E.sineInOut(seg(f, 0, 22));
  const wx = lerp(3.2, 0.72, inK);
  const bob = frozen ? 0 : Math.sin(f / 7) * 0.04 * (1 - inK * 0.45);

  const rise = (start: number, dur = 12) => {
    const p = E.cubicOut(seg(f, start, start + dur));
    return {opacity: p, transform: `translateY(${(1 - p) * 24}px)`};
  };

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />
      <LayerCanvas camera={cam}>
        <DshStage reveal={1} ring={1} cursorOpacity={0} cursorScaleY={0.001} cursorWorld={S2_CURSOR} />
      </LayerCanvas>
      <DshVignette />

      {/* 右侧柔光，让悬浮的鲸鱼有落点 */}
      <div
        style={{
          position: 'absolute',
          right: -120,
          top: 90,
          width: 900,
          height: 820,
          background: `radial-gradient(ellipse at 50% 52%, ${COLORS.blue}30 0%, ${COLORS.blue}10 42%, rgba(0,0,0,0) 72%)`,
          filter: 'blur(26px)',
          pointerEvents: 'none',
        }}
      />

      {/* 片尾卡（左） */}
      <div style={{position: 'absolute', left: 120, top: 168, width: 1020}}>
        <div style={{...rise(4, 14)}}>
          <Wordmark scale={0.82} />
        </div>

        <div
          style={{
            marginTop: 52,
            fontFamily: FONT.mono,
            fontSize: 15,
            letterSpacing: 4.5,
            color: COLORS.mint,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            ...rise(10, 10),
          }}
        >
          <span style={{width: 28, height: 2, background: COLORS.mint}} />
          DSH PLUGIN · REEL STUDIO
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: FONT.latin,
            fontSize: TYPE.h1,
            fontWeight: 800,
            letterSpacing: -3.4,
            lineHeight: 1,
            color: COLORS.text,
            textShadow: '0 24px 80px rgba(0,0,0,0.55)',
            ...rise(14, 12),
          }}
        >
          dsh-reel-studio
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: FONT.zh,
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: 0.4,
            color: COLORS.text,
            ...rise(20, 12),
          }}
        >
          让每个插件，都有一条自己的宣传片。
        </div>

        <div style={{marginTop: 42, ...rise(26, 12)}}>
          <div style={{fontFamily: FONT.mono, fontSize: 12, letterSpacing: 3, color: COLORS.faint, marginBottom: 12}}>
            INSTALL
          </div>
          <InstallCmd typed={E.cubicOut(seg(f, 28, 40))} width={880} />
        </div>

        <div
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            fontFamily: FONT.mono,
            fontSize: 19,
            letterSpacing: 0.6,
            color: COLORS.blue2,
            ...rise(30, 12),
          }}
        >
          <span>github.com/Eileenes/dsh-reel</span>
          <span style={{color: COLORS.line}}>/</span>
          <span style={{color: COLORS.faint, fontSize: 15, letterSpacing: 2.6}}>MIT · 本地渲染 · 1080p</span>
        </div>
      </div>

      {/* 鲸鱼层（右侧，游入后轻微呼吸，f40 后完全静止） */}
      <LayerCanvas camera={cam}>
        <HeroLights />
        <group position={[wx, 0.24 + bob, -0.02]} rotation={[0, 0.2, 0]} scale={0.78}>
          <WhaleVoxel idle time={wt} cursorWorld={S2_CURSOR} spout={false} />
        </group>
      </LayerCanvas>
      <Grain />
    </AbsoluteFill>
  );
};
