/**
 * WhaleVoxel — InstancedMesh 体素鲸鱼（278 实例 = body 237 / tail 26 / fin 10 + 喷水 5）
 *
 * 造型参数来自参考片实测（`.research/dsh-reel-promo/reference-analysis.md` §5）：
 *   - V=0.088，方块画 0.93V（留 7% 缝隙，体素感的来源）
 *   - 超椭球轮廓 (|y−cy|/hy)^2.7 + (|z|/hz)^2.7 ≤ 1，沿 x 收窄 f=(1−|u|^3.2)^(1/3.2)
 *   - 眼睛 2×2 / 喷水 5 块在 (3,9,0) / 假影子
 *
 * 观感（第 2 轮，Lead 反馈"不够亮、不够透、眼洞太大、喷水像漂浮方块"）：
 *   - 材质改成"发亮的玻璃蓝"：roughness .38 / metalness .08，主体色提亮到 #5A79FF、肚皮 #E6F0FF
 *   - 眼睛：眼窝前移到 x∈{5,6}×y∈{3,4}，每块缩到 0.88 让缝隙把它读成"眼窝"而不是黑洞；
 *     白高光改到眼窝前上方 1 格 (7,5)，缩到 0.52 → 可爱的小眼神光
 *   - 喷水：5 个主体素 + 10 个更小的水滴 + 3 条速度线（加色混合、逐帧淡出），0.6s 内收干净
 *   - 落地：一圈很淡的冲击环 + 6 颗尘点（拼合落地、大跳落地各一次）
 *   - 影子：更浓（中心 ~0.8）更贴身，离地才放大变淡
 *
 * 表演全部是 useCurrentFrame 的纯函数（禁止 useFrame 累计时间 → Remotion 逐帧确定性）。
 * 注意：本组件必须渲染在 <ThreeCanvas> 子树内。
 */

import React, {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';

// ───────────────────────── 模型 / 颜色常量 ─────────────────────────
export const VOXEL = 0.088; // V：体素世界边长
const BOX = VOXEL * 0.93; // 0.93V：留 7% 缝隙

/** 主体色：tokens.COLORS.blue(#4D6BFE) 再提亮一档 → "发亮的玻璃蓝" */
const WHALE_BLUE = '#5A79FF';
const WHALE_BELLY = '#E6F0FF';
const EYE_DARK = '#070B18';
const EYE_HI = '#EAF0FF'; // 眼神光：微灰白，避免在这个光照下炸成纯白

const ASM_T0 = 1.14; // 拼合开始（s）
const ASM_T1 = 2.5; // 拼合完成 / 落地（s）
const BLINK_AT = 3.44; // 眨眼（90–110 帧这一段里只眨一次）
const BLINK_DUR = 0.13;
const PUFF_AT = 3.0; // 喷水（同上，只喷一次；在 90–110 的停住段里）
// 参考片喷水 0.9s；P1 只有 5s，压到 0.6s，让水花在起跳（3.667s）前收干净
const PUFF_DUR = 0.6;
const HOP_T0 = 110 / 30; // 大跳起跳（帧 110）
const HOP_T1 = 140 / 30; // 大跳落地（帧 140）
const HOP_H = 1.55; // 弧高
const HOP_TO_X = 1.85; // 向"画面右"跳（世界 +x 在镜头里偏右）
const HOP_TO_Z = -1.05;
const YAW_HERO = -0.1; // 3/4 侧对镜头（偏侧面：背脊 + 吻部收窄都要露出来）
const YAW_PRE = -0.24;

export const WHALE_TIMELINE = {
  asmT0: ASM_T0,
  asmT1: ASM_T1,
  hopT0: HOP_T0,
  hopT1: HOP_T1,
} as const;

// ───────────────────────── 小工具（全部确定性、无副作用） ─────────────────────────
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const segf = (t: number, a: number, b: number) => clamp((t - a) / (b - a || 1e-9), 0, 1);
const sineInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const cubicInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** 解析阻尼弹簧：spring(dt, ζ=0.62, ω=15) → 0..1.25（约 8% 过冲，和参考片的拼合回弹一致） */
function springAt(dt: number, zeta = 0.62, omega = 15): number {
  if (dt <= 0) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const e = Math.exp(-zeta * omega * dt);
  return 1 - e * (Math.cos(wd * dt) + ((zeta * omega) / wd) * Math.sin(wd * dt));
}

/** 落地挤压回弹：横向鼓 sqx / 纵向压 sqy，cos 衰减振荡 */
function impactAt(t: number, at: number, sqx = 0.22, sqy = 0.3): {sx: number; sy: number} {
  const tau = t - at;
  if (tau < 0) return {sx: 1, sy: 1};
  const d = Math.exp(-8 * tau) * Math.cos(24 * tau);
  return {sx: 1 + sqx * d, sy: 1 - sqy * d};
}

/** 固定种子 PRNG：参考片每块亮度 ×(0.93+0.12·rng)，用 mulberry32 复现同一分布 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ───────────────────────── 体素模型（复刻 §5.1 的循环，数值与参考片一致） ─────────────────────────
type Part = 'body' | 'tail' | 'fin' | 'eye' | 'eyehi' | 'spout';
type Voxel = {
  x: number;
  y: number;
  z: number;
  part: Part;
  col: THREE.Color;
  /** 到头部的归一化距离：拼合错峰用（头部先归位） */
  dn: number;
  /** 喷水第 j 块 */
  j: number;
};

function buildVoxels(): Voxel[] {
  const R = rng(11);
  const set = new Map<string, {x: number; y: number; z: number; part: Part}>();
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  const add = (x: number, y: number, z: number, part: Part) =>
    set.set(key(x, y, z), {x, y, z, part});

  // 身体：超椭球，沿 x 收窄；尾段额外 ×(1−0.5·(−x/7))
  for (let x = -7; x <= 8; x++) {
    for (let y = 0; y <= 7; y++) {
      for (let z = -4; z <= 4; z++) {
        const u = (x - 0.8) / 7.9;
        const f =
          Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 3.2)), 1 / 3.2) *
          (x < 0 ? 1 - 0.5 * (-x / 7) : 1);
        const cy = 3.4 + (x < -2 ? (-2 - x) * 0.18 : 0);
        const hy = 3.5 * f;
        const hz = 3.5 * f;
        if (hy < 0.6) continue;
        const p = 2.7;
        if (Math.pow(Math.abs(y - cy) / hy, p) + Math.pow(Math.abs(z) / hz, p) <= 1) {
          add(x, y, z, 'body');
        }
      }
    }
  }

  // 尾巴（尾柄）与尾鳍
  for (let x = -10; x <= -8; x++) {
    for (let y = 4; y <= 5; y++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(z) === 1 && y === 5) continue;
        add(x, y + (x === -10 ? 1 : 0), z, 'tail');
      }
    }
  }
  for (let z = -4; z <= 4; z++) {
    const lift = Math.abs(z) >= 3 ? 1 : 0;
    add(-11 - (Math.abs(z) >= 3 ? 1 : 0), 6 + lift, z, 'tail');
    if (Math.abs(z) <= 2) add(-11, 5, z, 'tail');
  }

  // 胸鳍（两侧各 5 块）
  for (const s of [-1, 1]) {
    add(1, 1, s * 4, 'fin');
    add(2, 1, s * 4, 'fin');
    add(1, 0, s * 5, 'fin');
    add(2, 0, s * 5, 'fin');
    add(3, 0, s * 5, 'fin');
  }

  // 只保留表面体素：剔除六邻居全满的内部格（490 → 273，省 44%）
  const has = (x: number, y: number, z: number) => set.has(key(x, y, z));
  const surface: {x: number; y: number; z: number; part: Part}[] = [];
  for (const v of set.values()) {
    if (
      has(v.x + 1, v.y, v.z) &&
      has(v.x - 1, v.y, v.z) &&
      has(v.x, v.y + 1, v.z) &&
      has(v.x, v.y - 1, v.z) &&
      has(v.x, v.y, v.z + 1) &&
      has(v.x, v.y, v.z - 1)
    ) {
      continue;
    }
    surface.push(v);
  }

  // 上色：主体色 × 亮度抖动；肚皮 / 嘴部暗带
  const voxels: Voxel[] = surface.map((v) => {
    let col = new THREE.Color(WHALE_BLUE);
    if (v.part === 'body' && v.y <= 1 && v.x > -3) col = new THREE.Color(WHALE_BELLY);
    if (v.part === 'body' && v.y === 2 && v.x >= 6 && Math.abs(v.z) <= 2) {
      col = new THREE.Color(WHALE_BLUE).multiplyScalar(0.45);
    }
    const sh = 0.93 + 0.12 * R() + (v.y >= 7 ? 0.06 : 0);
    col.multiplyScalar(sh);
    return {x: v.x, y: v.y, z: v.z, part: v.part, col, dn: 0, j: 0};
  });

  /** 取 (x,y) 这一行最外侧（|z| 最大）的表面体素 */
  const outermost = (x: number, y: number, sd: number): Voxel | null => {
    let best: Voxel | null = null;
    for (const v of voxels) {
      if (v.x === x && v.y === y && Math.sign(v.z) === sd) {
        if (!best || Math.abs(v.z) > Math.abs(best.z)) best = v;
      }
    }
    return best;
  };

  // 眼睛（第 2 轮改）：眼窝前移到 x∈{5,6}×y∈{3,4}，深色；白高光在眼窝前上方 1 格 (7,5)
  for (const sd of [-1, 1]) {
    for (const x of [5, 6]) {
      for (const y of [3, 4]) {
        const v = outermost(x, y, sd);
        if (v) {
          v.part = 'eye';
          v.col = new THREE.Color(EYE_DARK);
        }
      }
    }
  }

  // 喷水 5 块固定在 (3,9,0)：#A9D4FF×3 + #D8ECFF×2（拼合期间 scale 0，喷水时才出现）
  for (let j = 0; j < 5; j++) {
    voxels.push({
      x: 3,
      y: 9,
      z: 0,
      part: 'spout',
      col: new THREE.Color(j < 3 ? '#A9D4FF' : '#D8ECFF'),
      dn: 0,
      j,
    });
  }

  // 拼合错峰：头部（离 (8,3,0) 近）先归位
  const dmax = voxels.reduce((m, v) => Math.max(m, Math.hypot(v.x - 8, v.y - 3, v.z)), 0) || 1;
  for (const v of voxels) v.dn = Math.hypot(v.x - 8, v.y - 3, v.z) / dmax;

  return voxels;
}

const VOXELS = buildVoxels();

// ───────────────────────── 喷水粒子 / 尘点参数（确定性） ─────────────────────────
const DROP_RND = rng(29);
const DROPS = Array.from({length: 10}, () => ({
  dx: (DROP_RND() - 0.5) * 1.3,
  dz: (DROP_RND() - 0.5) * 1.3,
  speed: 4.4 + DROP_RND() * 3.6, // cells / s
  size: 0.3 + DROP_RND() * 0.32, // 相对体素
  phase: DROP_RND() * 0.1,
}));
const STREAKS = Array.from({length: 3}, (_, i) => ({
  dx: (i - 1) * 0.55,
  dz: (DROP_RND() - 0.5) * 0.9,
  speed: 5.6 + i * 0.7,
}));
const DUST = Array.from({length: 6}, (_, i) => ({
  ang: (i / 6) * Math.PI * 2 + 0.35,
  rad: 0.34 + (i % 3) * 0.12,
}));

const FX_AIR_COUNT = 13; // 10 水滴 + 3 速度线
const FX_GROUND_COUNT = DUST.length * 2; // 两次落地

/** 落地事件（世界坐标）：拼合落地 + 大跳落地 */
const LANDINGS = [
  {at: ASM_T1, x: 0, z: 0},
  {at: HOP_T1, x: HOP_TO_X, z: HOP_TO_Z},
];

// ───────────────────────── 鲸鱼根运动（时间 → 姿态，纯函数） ─────────────────────────
export type WhalePose = {
  x: number;
  y: number;
  z: number;
  /** 离地高度（影子大小/浓淡、空中摆尾用它） */
  air: number;
  yaw: number;
  pitch: number;
  sx: number;
  sy: number;
};

function yawAt(t: number, keys: [number, number][]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1];
    const [t1, v1] = keys[i];
    if (t <= t1) {
      let d = v1 - v0;
      d = Math.atan2(Math.sin(d), Math.cos(d)); // 走最短弧
      return v0 + d * sineInOut(segf(t, t0, t1));
    }
  }
  return keys[keys.length - 1][1];
}

export const whalePoseAt = (t: number): WhalePose => {
  let x = 0;
  let z = 0;
  let air = 0;
  let pitch = 0;
  let sx = 1;
  let sy = 1;

  // 110–140 帧：向右大跳一个弧线（cubicInOut 位移 + sin 弧高）
  if (t >= HOP_T1) {
    x = HOP_TO_X;
    z = HOP_TO_Z;
  } else if (t > HOP_T0) {
    const u = segf(t, HOP_T0, HOP_T1);
    const k = cubicInOut(u);
    x = HOP_TO_X * k;
    z = HOP_TO_Z * k;
    air = Math.sin(Math.PI * sineInOut(u)) * HOP_H;
    pitch = (0.5 - u) * 0.9; // 起跳抬尾、落地低头
    sy *= 1 + 0.12 * Math.sin(Math.PI * u); // 上升段拉长 12%
  }

  // 落点挤压（拼合落地 + 大跳落地）
  for (const at of [ASM_T1, HOP_T1]) {
    const im = impactAt(t, at);
    sx *= im.sx;
    sy *= im.sy;
  }

  // 起跳前 0.14s 下蹲压扁
  const crouch = Math.sin(Math.PI * segf(t, HOP_T0 - 0.14, HOP_T0)) * 0.2;
  sy *= 1 - crouch;
  sx *= 1 + crouch * 0.6;

  // 朝向：拼合期微转 → 3/4 对镜头；起跳前 0.12s 转向跳跃方向；落地后转回侧 3/4
  const faceHop = Math.atan2(-HOP_TO_Z, HOP_TO_X);
  const yaw = yawAt(t, [
    [0, YAW_PRE],
    [1.95, YAW_PRE],
    [2.4, YAW_HERO],
    [HOP_T0 - 0.12, YAW_HERO],
    [HOP_T0 + 0.1, faceHop],
    [HOP_T1, faceHop],
    [4.98, 0.06],
  ]);

  return {x, y: 0, z, air, yaw, pitch, sx, sy};
};

/**
 * 待机场（`idle` prop）：固定 3/4 站位，不做拼合/大跳，
 * 只留轻微呼吸（缩放/上下 0.01）+ 摆尾（沿用下方 sin(7.5t)）+ 周期性眨眼。
 * 场景想换站位/朝向/大小，用外层 <group position/rotation/scale> 包住本组件即可。
 */
export const idlePoseAt = (t: number): WhalePose => {
  const breathe = Math.sin(t * 2.0);
  return {
    x: 0,
    y: 0,
    z: 0,
    air: 0.01 + 0.01 * breathe, // 极轻微起伏，影子几乎不动
    yaw: YAW_HERO,
    pitch: 0,
    sx: 1 + 0.006 * breathe,
    sy: 1 - 0.006 * breathe,
  };
};

/** idle 的眨眼：每 2.2s 眨一次（相位错开一点，别在画面第一帧就闭眼） */
const idleBlinkAt = (t: number): boolean => ((t + 1.0) % 2.2) < BLINK_DUR;

// ───────────────────────── 复用的临时对象（避免每帧 GC） ─────────────────────────
const TMP_P = new THREE.Vector3();
const TMP_S = new THREE.Vector3();
const TMP_CURSOR = new THREE.Vector3();
const TMP_ROOT = new THREE.Matrix4();
const TMP_INV = new THREE.Matrix4();
const TMP_MTX = new THREE.Matrix4();
const TMP_COL = new THREE.Color();
const Q_YAW = new THREE.Quaternion();
const Q_PITCH = new THREE.Quaternion();
const Q_ID = new THREE.Quaternion();
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

function buildShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  // 平台状衰减：中心一大片保持高不透明度，边缘再收掉（Lead：中心 ~0.8、贴地更紧）
  const gr = g.createRadialGradient(128, 128, 6, 128, 128, 126);
  gr.addColorStop(0, 'rgba(0,0,0,0.85)');
  gr.addColorStop(0.4, 'rgba(0,0,0,0.66)');
  gr.addColorStop(0.72, 'rgba(0,0,0,0.26)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const FX_UNIT = new THREE.BoxGeometry(1, 1, 1);

/** 眼神光贴片大小 / 位置：贴在眼窝（x=6,y=4,z=±3）的前上角外表面 */
const GLINT_SIZE = BOX * 0.68;
const GLINT_X = 6 * VOXEL + BOX * 0.25;
const GLINT_Y = 4.5 * VOXEL + BOX * 0.25;
const GLINT_Z = 3 * VOXEL + BOX * 0.68;
/** 眼窝块 (6,4,±3) 的拼合错峰系数（和主体素一起飞回来） */
const EYE_DN = (() => {
  const v = VOXELS.find((k) => k.part === 'eye' && k.x === 6 && k.y === 4 && k.z === 3);
  return v ? v.dn : 0.2;
})();

// ───────────────────────── 组件 ─────────────────────────
export type WhaleVoxelProps = {
  /** 拼合起点（光标世界坐标），体素从这里飞出 */
  cursorWorld: readonly [number, number, number];
  /**
   * 覆盖内部时间（秒）。默认用 useCurrentFrame()/fps；
   * 场景里想把拼合/落地/跳跃挪到自己的时间轴，就传一个（可做时间重映射的）秒数进来。
   */
  time?: number;
  /** 待机表演：跳过拼合与大跳，固定 3/4 站位，轻微呼吸/摆尾/眨眼（喷水仍由 time 驱动） */
  idle?: boolean;
  /** 是否允许喷水。默认 true；成片里 S8/S9 这类"干净构图"的镜头传 false，避免悬空方块 */
  spout?: boolean;
};

export const WhaleVoxel: React.FC<WhaleVoxelProps> = ({cursorWorld, time, idle = false, spout = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = time ?? frame / fps;
  const pose = idle ? idlePoseAt(t) : whalePoseAt(t);

  // 主 InstancedMesh：挂载前就有合法矩阵（全 0 缩放）+ 颜色，避免首帧闪现原点方块
  const mesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(BOX, BOX, BOX);
    // 玻璃蓝材质：roughness 从 .55 降到 .38、metalness .08 → 有干净的高光
    const material = new THREE.MeshStandardMaterial({roughness: 0.38, metalness: 0.08});
    const im = new THREE.InstancedMesh(geometry, material, VOXELS.length);
    im.frustumCulled = false;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    VOXELS.forEach((v, i) => {
      im.setMatrixAt(i, zero);
      im.setColorAt(i, v.col);
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return im;
  }, []);

  // FX（喷水粒子 / 速度线 / 尘点）：加色混合 + 逐实例颜色淡出
  const fxAir = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const im = new THREE.InstancedMesh(FX_UNIT, material, FX_AIR_COUNT);
    im.frustumCulled = false;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const white = new THREE.Color('#FFFFFF');
    for (let i = 0; i < FX_AIR_COUNT; i++) {
      im.setMatrixAt(i, zero);
      im.setColorAt(i, white);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return im;
  }, []);

  const fxGround = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const im = new THREE.InstancedMesh(FX_UNIT, material, FX_GROUND_COUNT);
    im.frustumCulled = false;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const white = new THREE.Color('#FFFFFF');
    for (let i = 0; i < FX_GROUND_COUNT; i++) {
      im.setMatrixAt(i, zero);
      im.setColorAt(i, white);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return im;
  }, []);

  // 眼神光：2 枚小白块贴在眼窝的「前上角」表面（Lead：前上方 1 格、缩小、可爱）
  const eyeGlint = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({color: EYE_HI, roughness: 0.22, metalness: 0.02});
    const GEO = new THREE.BoxGeometry(GLINT_SIZE, GLINT_SIZE, GLINT_SIZE);
    const im = new THREE.InstancedMesh(GEO, material, 2);
    im.frustumCulled = false;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    im.setMatrixAt(0, zero);
    im.setMatrixAt(1, zero);
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, []);

  const shadowTex = useMemo(() => buildShadowTexture(), []);

  // 假影子：更浓 + 更贴身（离地才放大变淡）
  const shOpacity = clamp(1 - pose.air / 2.6, 0.15, 1) * 0.95 * clamp((t - ASM_T0) * 3, 0, 1);
  const shScale = 1 + pose.air * 0.18;

  useLayoutEffect(() => {
    // 拼合起点换到鲸鱼本地坐标（含根变换的逆：位置/朝向/pitch/squash）
    Q_YAW.setFromAxisAngle(AXIS_Y, pose.yaw);
    Q_PITCH.setFromAxisAngle(AXIS_Z, pose.pitch);
    Q_YAW.multiply(Q_PITCH);
    TMP_ROOT.compose(
      TMP_P.set(pose.x, pose.y + pose.air, pose.z),
      Q_YAW,
      TMP_S.set(pose.sx, pose.sy, pose.sx)
    );
    TMP_INV.copy(TMP_ROOT).invert();
    TMP_CURSOR.set(cursorWorld[0], cursorWorld[1], cursorWorld[2]).applyMatrix4(TMP_INV);

    const wag = Math.sin(t * 7.5) * 0.22 + (pose.air > 0.05 ? Math.sin(t * 16) * 0.2 : 0);
    const blink = idle ? idleBlinkAt(t) : t > BLINK_AT && t < BLINK_AT + BLINK_DUR;
    const puffTau = t - PUFF_AT;
    const puffing = spout && puffTau > 0 && puffTau < PUFF_DUR;
    // idle 场景不拼合：体素直接是完整状态
    const assembling = !idle && t < ASM_T1 + 0.01;

    for (let i = 0; i < VOXELS.length; i++) {
      const v = VOXELS[i];
      let x = v.x;
      let y = v.y;
      let z = v.z;
      let s = 1;
      let sY = 1;

      // 摆尾：绕支点 (−4,4) 旋转；尾段权重 1，body x≤−6 带 0.35
      if (v.part === 'tail' || (v.part === 'body' && v.x <= -6)) {
        const w = v.part === 'tail' ? 1 : 0.35;
        const a = wag * w;
        const dx = x + 4;
        const dy = y - 4;
        x = -4 + dx * Math.cos(a) - dy * Math.sin(a);
        y = 4 + dx * Math.sin(a) + dy * Math.cos(a);
      }

      // 胸鳍：上下小幅抖动
      if (v.part === 'fin') y += Math.sin(t * 9 + v.z) * 0.25;

      // 眨眼：眼块 y 缩到 0.15
      if (v.part === 'eye' && blink) sY = 0.15;

      // 眼睛：眼窝保持满格（缩放会露出体腔变成黑框）；小白高光是独立的贴片 mesh

      // 喷水主体 5 块：头顶上冲后散开
      if (v.part === 'spout') {
        s = 0;
        if (puffing) {
          const tau = puffTau;
          const k = tau / PUFF_DUR;
          if (v.j < 3) {
            // P1 镜头比参考片更贴脸，上冲速度从 9 降到 7 cells/s，免得水花飞出画面上沿
            y = 9 + tau * 7 + v.j * 0.9 - tau * tau * 3.2;
            x = 3;
            z = 0;
            s = Math.max(0, 1 - k) * 1.05;
          } else {
            const sd = v.j === 3 ? -1 : 1;
            x = 3;
            y = 9 + 2.6 + tau * 4.5 - tau * tau * 7;
            z = sd * tau * 5;
            s = Math.max(0, 1 - k) * 0.9;
          }
        }
      }

      TMP_P.set(x * VOXEL, (y + 0.5) * VOXEL, z * VOXEL);

      // 拼合：全 0 缩放进场 → 从光标位置 spring 飞回（头部先到，dn 越大越晚）
      if (assembling) {
        if (t < ASM_T0) {
          s = 0;
        } else {
          const k = clamp(springAt(t - ASM_T0 - v.dn * 0.42), 0, 1.25);
          TMP_P.x = TMP_CURSOR.x + (TMP_P.x - TMP_CURSOR.x) * k;
          TMP_P.y = TMP_CURSOR.y + (TMP_P.y - TMP_CURSOR.y) * k;
          TMP_P.z = TMP_CURSOR.z + (TMP_P.z - TMP_CURSOR.z) * k;
          s *= clamp(k, 0, 1) * (v.part === 'spout' ? 0 : 1);
        }
      }

      TMP_MTX.compose(TMP_P, Q_ID, TMP_S.set(s, s * sY, s));
      mesh.setMatrixAt(i, TMP_MTX);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // ── 喷水水滴 + 速度线（本地空间，跟随鲸鱼） ──
    const puffK = clamp(puffTau / PUFF_DUR, 0, 1);
    for (let i = 0; i < FX_AIR_COUNT; i++) {
      if (!puffing) {
        TMP_MTX.makeScale(0, 0, 0);
        fxAir.setMatrixAt(i, TMP_MTX);
        fxAir.setColorAt(i, TMP_COL.setRGB(0, 0, 0));
        continue;
      }
      const fade = Math.pow(1 - puffK, 1.3);
      if (i < DROPS.length) {
        const d = DROPS[i];
        const y = 9.2 + puffTau * d.speed - 2.2 * puffTau * puffTau + d.phase;
        const spread = 1 + 2.4 * puffTau;
        const px = 3 + d.dx * spread;
        const pz = d.dz * spread;
        const sz = VOXEL * d.size * (0.35 + 0.65 * (1 - puffK));
        TMP_P.set(px * VOXEL, (y + 0.5) * VOXEL, pz * VOXEL);
        TMP_MTX.compose(TMP_P, Q_ID, TMP_S.set(sz, sz, sz));
        fxAir.setMatrixAt(i, TMP_MTX);
        fxAir.setColorAt(i, TMP_COL.set('#CBE8FF').multiplyScalar(fade));
      } else {
        const q = STREAKS[i - DROPS.length];
        const y = 9.4 + puffTau * q.speed;
        const h = 0.2 * (1 - puffK) + 0.03;
        TMP_P.set((3 + q.dx) * VOXEL, (y + 0.5) * VOXEL, q.dz * VOXEL);
        TMP_MTX.compose(TMP_P, Q_ID, TMP_S.set(0.022, h, 0.022));
        fxAir.setMatrixAt(i, TMP_MTX);
        fxAir.setColorAt(i, TMP_COL.set('#E6F4FF').multiplyScalar(fade * 0.8));
      }
    }
    fxAir.instanceMatrix.needsUpdate = true;
    if (fxAir.instanceColor) fxAir.instanceColor.needsUpdate = true;

    // ── 落地尘点（世界空间） ──
    let di = 0;
    for (const land of LANDINGS) {
      const k = segf(t, land.at, land.at + 0.35);
      const active = k > 0 && k < 1;
      for (const dust of DUST) {
        if (!active) {
          TMP_MTX.makeScale(0, 0, 0);
          fxGround.setMatrixAt(di, TMP_MTX);
          fxGround.setColorAt(di, TMP_COL.setRGB(0, 0, 0));
          di++;
          continue;
        }
        const fade = Math.pow(1 - k, 2.2);
        const rad = dust.rad + k * 0.75;
        const px = land.x + Math.cos(dust.ang) * rad;
        const pz = land.z + Math.sin(dust.ang) * rad;
        const py = 0.012 + Math.sin(Math.PI * k) * 0.05;
        const sz = 0.03 * (1 - k) + 0.012;
        TMP_P.set(px, py, pz);
        TMP_MTX.compose(TMP_P, Q_ID, TMP_S.set(sz, sz, sz));
        fxGround.setMatrixAt(di, TMP_MTX);
        fxGround.setColorAt(di, TMP_COL.set('#A9D4FF').multiplyScalar(fade * 0.5));
        di++;
      }
    }
    fxGround.instanceMatrix.needsUpdate = true;
    if (fxGround.instanceColor) fxGround.instanceColor.needsUpdate = true;

    // ── 眼神光贴片（跟着拼合/眨眼一起动） ──
    const eyeK = assembling
      ? clamp(springAt(t - ASM_T0 - EYE_DN * 0.42), 0, 1)
      : 1;
    const glintSY = blink ? 0.15 : 1;
    for (let i = 0; i < 2; i++) {
      const sd = i === 0 ? -1 : 1;
      TMP_P.set(GLINT_X, GLINT_Y, sd * GLINT_Z);
      TMP_MTX.compose(TMP_P, Q_ID, TMP_S.set(eyeK, eyeK * glintSY, eyeK));
      eyeGlint.setMatrixAt(i, TMP_MTX);
    }
    eyeGlint.instanceMatrix.needsUpdate = true;
  }, [mesh, fxAir, fxGround, eyeGlint, pose, t, cursorWorld, idle, spout]);

  // 冲击环（每个落点一圈，很淡）
  const rings = LANDINGS.map((land) => {
    const k = segf(t, land.at, land.at + 0.4);
    return {
      x: land.x,
      z: land.z,
      scale: 0.26 + k * 0.95,
      opacity: k > 0 && k < 1 ? 0.13 * Math.pow(1 - k, 2) : 0,
    };
  });

  return (
    <group>
      <group position={[pose.x, pose.y + pose.air, pose.z]} rotation={[0, pose.yaw, 0]}>
        {/* 喷水粒子/速度线在鲸鱼本地空间，跟着身体走 */}
        <primitive object={fxAir} />
        <group rotation={[0, 0, pose.pitch]} scale={[pose.sx, pose.sy, pose.sx]}>
          <primitive object={mesh} />
          <primitive object={eyeGlint} />
        </group>
      </group>

      {/* 落地尘点（世界空间） */}
      <primitive object={fxGround} />

      {/* 冲击环 */}
      {rings.map((r, i) => (
        <mesh
          key={i}
          position={[r.x, 0.012, r.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[r.scale, r.scale, 1]}
          renderOrder={-1}
        >
          <ringGeometry args={[0.94, 1, 96]} />
          <meshBasicMaterial
            color={0x8ea6ff}
            transparent
            opacity={r.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      <group position={[pose.x, 0.004, pose.z]} rotation={[0, pose.yaw, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[shScale, shScale, 1]} renderOrder={-1}>
          <planeGeometry args={[2.0, 1.32]} />
          <meshBasicMaterial
            map={shadowTex}
            transparent
            depthWrite={false}
            toneMapped={false}
            opacity={shOpacity}
          />
        </mesh>
      </group>
    </group>
  );
};
