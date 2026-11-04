/**
 * P1WhaleProof — P1-A：5s 体素鲸鱼 proof（150 帧 @30fps，1920×1080）
 *
 * 目的：验证造型 / 材质 / 镜头手感（不是成片）。时间轴（帧 @30fps）：
 *   0–30    黑场 → 网格亮起 + 终端光标光晕（体素从这里飞出）
 *   30–75   体素从光标方向飞出、逐块 spring 拼合（头部先归位，dn 错峰 0.42s）
 *   75–90   落地：squash(sq 0.22/0.30 回弹) + 一次轻微震屏
 *   90–110  停住：3/4 侧对镜头，摆尾 / 眨眼一次 / 喷水一次
 *   110–150 向画面右侧大跳一个弧线，相机跟拍后拉，落地收住
 *
 * 镜头语言（参考片 CK）：fov 38–42、一镜一事、手持噪声 0.03–0.07、静止段乘 0。
 * 渲染（本机 M4 / Chrome 156 必须带 --gl=angle，否则 WebGL context 创建失败）：
 *   cd studio && node_modules/.bin/remotion still src/p1/entry.ts P1WhaleProof out/p1-whale-f0060.png --frame=60 --gl=angle
 *   cd studio && node_modules/.bin/remotion render src/p1/entry.ts P1WhaleProof out/p1-whale.mp4 --codec h264 --crf 18 --gl=angle
 */

import React, {useLayoutEffect} from 'react';
import {AbsoluteFill, Composition, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {COLORS, VIDEO} from '../v2/tokens';
import {DshBackdrop, DshStage, DshVignette} from '../v2/stage/DshStage';
import {WHALE_TIMELINE, WhaleVoxel, whalePoseAt} from '../v2/whale/WhaleVoxel';

// ───────────────────────── 常量 ─────────────────────────
/** 拼合起点（终端光标的世界坐标）：在鲸鱼左前方，屏幕偏左下 */
const CURSOR_WORLD: readonly [number, number, number] = [-0.85, 0.52, 0.62];

const DURATION = 150;
const FPS = VIDEO.fps;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a || 1e-9), 0, 1);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a || 1e-9), 0, 1);
  return k * k * (3 - 2 * k);
};

const ease = {
  sineInOut: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  expoOut: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  expoInOut: (x: number) =>
    x <= 0
      ? 0
      : x >= 1
        ? 1
        : x < 0.5
          ? Math.pow(2, 20 * x - 10) / 2
          : (2 - Math.pow(2, -20 * x + 10)) / 2,
  cubicInOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  easeOutCubic: (x: number) => 1 - Math.pow(1 - x, 3),
};

// ───────────────────────── 相机（CK） ─────────────────────────
type CamKey = {
  t: number;
  p: readonly [number, number, number];
  l: readonly [number, number, number];
  fov: number;
  /** 进入这个关键帧用的缓动 */
  e?: (x: number) => number;
};

/**
 * 一镜到底 7 个机位。语义：
 *  1) 起幅（低、略远，给网格/光标留空间）
 *  2) 极慢推进（拼合前）
 *  3) 抬升 + 推进（拼合落地，expoOut：前快后慢）
 *  4) 收成 hero 3/4 机位（90–110 帧停住）
 *  5) 完全冻结（hero 定格 0.6s，手持噪声也乘 0）
 *  6) 跟拍：向右平移 + 后拉（expoInOut）
 *  7) 落地收住：继续后拉到最宽
 */
const CAM_KEYS: CamKey[] = [
  // 起幅：略高、略远，把网格和终端光标留在画面里
  {t: 0.0, p: [1.0, 1.32, 3.85], l: [0.0, 0.32, 0.02], fov: 38},
  // 极慢推进
  {t: 1.12, p: [1.06, 1.2, 3.05], l: [0.01, 0.34, 0.01], fov: 38.5, e: ease.sineInOut},
  // 拼合落地：抬升 + 推进（expoOut，前快后慢）
  {t: WHALE_TIMELINE.asmT1, p: [1.12, 1.13, 2.62], l: [0.02, 0.38, 0.0], fov: 40, e: ease.expoOut},
  // hero 3/4 机位（90–110 帧停住；俯角 ~15°，鲸鱼几何占宽 ~60%）
  {t: 3.2, p: [1.12, 1.1, 2.3], l: [0.02, 0.4, 0.02], fov: 40, e: ease.sineInOut},
  // 完全冻结 0.42s（hero 定格）
  {t: 3.62, p: [1.12, 1.1, 2.3], l: [0.02, 0.4, 0.02], fov: 40, e: ease.sineInOut},
  // 跟拍起跳：镜头抬起跟住弧线（看点抬到鲸鱼高度，避免它顶在画面上沿）
  {t: 4.06, p: [1.3, 1.6, 2.85], l: [0.3, 1.18, -0.18], fov: 41, e: ease.sineInOut},
  // 跟随弧线下落 + 后拉
  {t: 4.62, p: [1.92, 1.62, 3.35], l: [1.1, 0.72, -0.56], fov: 41, e: ease.expoInOut},
  // 落地收住：继续后拉（别拉太远，鲸鱼还得占画面 1/3）
  {t: 5.0, p: [2.1, 1.3, 3.35], l: [1.6, 0.34, -0.74], fov: 41, e: ease.cubicInOut},
];

/** 静止窗口：手持噪声乘 0（hero 定格 + 最后一拍） */
const STILL: readonly (readonly [number, number])[] = [
  [3.2, 3.62],
  [4.92, 5.0],
];

const stillAt = (t: number): number => {
  let m = 0;
  for (const [a, b] of STILL) {
    m = Math.max(m, smoothstep(a - 0.16, a, t) * (1 - smoothstep(b, b + 0.16, t)));
  }
  return m;
};

/** 震屏：轻，衰减快；只加在落点（拼合落地 2.5s / 大跳落地 4.667s） */
const SHAKES = [
  {at: WHALE_TIMELINE.asmT1, amp: 0.055, decay: 9},
  {at: WHALE_TIMELINE.hopT1, amp: 0.08, decay: 8},
];

const shakeAt = (t: number): {x: number; y: number} => {
  let x = 0;
  let y = 0;
  for (const s of SHAKES) {
    const tau = t - s.at;
    if (tau < 0 || tau > 1.1) continue;
    const e = s.amp * Math.exp(-s.decay * tau);
    x += e * Math.sin(tau * 52 + s.at * 7);
    y += e * Math.cos(tau * 47 + 1.3);
  }
  return {x, y};
};

const camAt = (t: number) => {
  let i = 0;
  while (i + 1 < CAM_KEYS.length && CAM_KEYS[i + 1].t <= t) i++;
  const A = CAM_KEYS[i];
  const B = CAM_KEYS[Math.min(i + 1, CAM_KEYS.length - 1)];
  const k = A === B ? 0 : (B.e ?? ease.cubicInOut)(seg(t, A.t, B.t));

  const p: [number, number, number] = [
    lerp(A.p[0], B.p[0], k),
    lerp(A.p[1], B.p[1], k),
    lerp(A.p[2], B.p[2], k),
  ];
  const l: [number, number, number] = [
    lerp(A.l[0], B.l[0], k),
    lerp(A.l[1], B.l[1], k),
    lerp(A.l[2], B.l[2], k),
  ];
  const fov = lerp(A.fov, B.fov, k);

  // 手持噪声：幅度只有 0.03–0.07 单位，但全程存在（"非 CG 感"的关键）；静止段乘 0
  const hm = 1 - stillAt(t);
  p[0] += hm * (Math.sin(t * 0.9) * 0.05 + Math.sin(t * 2.3 + 1) * 0.02);
  p[1] += hm * Math.sin(t * 1.3 + 2) * 0.03;
  l[0] += hm * Math.sin(t * 0.7 + 0.4) * 0.03;
  l[1] += hm * Math.sin(t * 1.1 + 1.7) * 0.02;

  // 落点震屏（只动看点和一点点机位，避免"整屏抖动"）
  const sh = shakeAt(t);
  l[0] += sh.x;
  l[1] += sh.y;
  p[0] += sh.x * 0.35;
  p[1] += sh.y * 0.35;

  return {p, l, fov};
};

// ───────────────────────── 3D 场景（ThreeCanvas 子树） ─────────────────────────
const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const {camera} = useThree();

  useLayoutEffect(() => {
    camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
    const persp = camera as THREE.PerspectiveCamera;
    persp.fov = cam.fov;
    persp.updateProjectionMatrix();
    camera.lookAt(cam.l[0], cam.l[1], cam.l[2]);
    camera.updateMatrixWorld();
  }, [camera, t]);

  // 开场：网格"通电"、扫描环、终端光标（体素从这里被抽出来）
  const reveal = ease.easeOutCubic(seg(t, 0.06, 0.92));
  const ring = seg(t, 0.08, 1.32);
  const caretBlink = t < 1.06 ? ((t * 2.15) % 1 < 0.62 ? 1 : 0.2) : 1;
  const cursorOpacity = clamp(
    ease.easeOutCubic(seg(t, 0.3, 0.66)) * (1 - ease.sineInOut(seg(t, 1.62, 2.04))) * caretBlink,
    0,
    1
  );
  const cursorScaleY = 1 - 0.85 * ease.sineInOut(seg(t, 1.55, 1.95));

  return (
    <>
      <DshStage
        reveal={reveal}
        ring={ring}
        cursorOpacity={cursorOpacity}
        cursorScaleY={cursorScaleY}
        cursorWorld={CURSOR_WORLD}
      />
      <WhaleVoxel cursorWorld={CURSOR_WORLD} />

      {/* 灯光（第 2 轮提亮成"发亮的玻璃蓝"）：
          Hemisphere 1.6 + Key 3.0（相机侧前上方）+ Rim 蓝 2.0（背后）+ 冷色补光 0.6（相机侧前）。
          Key 的相对光位沿用参考片（参考片相机在鲸鱼另一侧，照抄世界坐标会让朝向镜头的面吃不到主光）。 */}
      <hemisphereLight args={[0xaabfff, 0x0a1024, 1.6]} />
      <directionalLight position={[4.5, 10, 7]} intensity={3.0} color={0xffffff} />
      <directionalLight position={[6, 3, -8]} intensity={2.0} color={0x4d6bfe} />
      <directionalLight position={[2.8, 2.6, 6.2]} intensity={0.6} color={0x8ea6ff} />
      {/* 相机侧的近点光：主光/补光都是平行光，平面对它们整面同色（哑光）；点光产生高光渐变 → 玻璃感 */}
      <pointLight position={[1.5, 2.1, 1.5]} intensity={1.15} color={0xbfd4ff} decay={2} />
    </>
  );
};

// ───────────────────────── 合成 ─────────────────────────
export const P1WhaleProof: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // 黑场起幅：0–0.5s 从纯黑淡入
  const blackout = 1 - ease.easeOutCubic(seg(t, 0, 0.5));

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <DshBackdrop />

      <ThreeCanvas
        width={VIDEO.width}
        height={VIDEO.height}
        flat
        dpr={1}
        gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}
        camera={{
          fov: CAM_KEYS[0].fov,
          near: 0.1,
          far: 90,
          position: [CAM_KEYS[0].p[0], CAM_KEYS[0].p[1], CAM_KEYS[0].p[2]],
        }}
        style={{position: 'absolute', top: 0, left: 0}}
      >
        <Scene />
      </ThreeCanvas>

      <AbsoluteFill style={{backgroundColor: '#000000', opacity: blackout, pointerEvents: 'none'}} />
      <DshVignette />
    </AbsoluteFill>
  );
};

export const P1WhaleRoot: React.FC = () => (
  <Composition
    id="P1WhaleProof"
    component={P1WhaleProof}
    durationInFrames={DURATION}
    fps={FPS}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
