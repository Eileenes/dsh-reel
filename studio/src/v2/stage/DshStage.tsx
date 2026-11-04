/**
 * DshStage — 深蓝网格桌面片场（3D 部分）+ CSS 暗角 / 底色。
 *
 * 参考片实测：scene.background 0x03050b、Fog(0x03050b, 9, 24)、
 * 60×60 深色桌面贴图（1 世界单位网格 + 蓝色光池）。
 * 这里把"桌面"做成 3D 地板 + 加色光晕 + 开场扫描环 + 终端光标光晕，
 * 暗角 / 底色用 CSS 叠在 canvas 上（components 内混用 3D 与 2D 的成本最低）。
 *
 * 所有动画数值由 props 传入（P1WhaleProof 用 useCurrentFrame 算），本文件不做时间状态。
 */

import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {COLORS} from '../tokens';

// ───────────────────────── 贴图（离屏 canvas，一次性生成） ─────────────────────────
const makeCanvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** 桌面贴图：深蓝底 + 蓝色光池 + 1 单位主网格 / 0.5 单位副网格（参考片 1 世界单位 = 200px 口径） */
function buildFloorTexture(): THREE.CanvasTexture {
  const S = 2048;
  const c = makeCanvas(S, S);
  const g = c.getContext('2d')!;
  g.fillStyle = '#04070F';
  g.fillRect(0, 0, S, S);

  // 蓝色光池（加色叠加，模拟参考片桌面上的环境光斑）
  const pool = (x: number, y: number, r: number, col: string, a: number) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = a;
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  };
  pool(S * 0.5, S * 0.58, S * 0.34, '#0d1f47', 0.55);
  pool(S * 0.4, S * 0.52, S * 0.22, '#122a5e', 0.32);
  pool(S * 0.62, S * 0.5, S * 0.2, '#16306e', 0.22);
  pool(S * 0.5, S * 0.62, S * 0.26, '#0b1c3f', 0.4);

  // 网格：1 世界单位 = 64/64 = S/64 px
  const major = S / 64;
  g.strokeStyle = 'rgba(142,166,255,0.06)';
  g.lineWidth = 1.4;
  for (let i = 0; i <= 64; i++) {
    const p = i * major;
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, S);
    g.stroke();
    g.beginPath();
    g.moveTo(0, p);
    g.lineTo(S, p);
    g.stroke();
  }
  g.strokeStyle = 'rgba(142,166,255,0.024)';
  g.lineWidth = 1;
  for (let i = 0; i <= 128; i++) {
    const p = i * (S / 128);
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, S);
    g.stroke();
    g.beginPath();
    g.moveTo(0, p);
    g.lineTo(S, p);
    g.stroke();
  }

  // 远处地平线渐隐：贴图 y=0 那一侧是世界 −z 远端，压暗到接近底色（网格不再抢鲸鱼）
  const hz = g.createLinearGradient(0, 0, 0, S * 0.64);
  hz.addColorStop(0, 'rgba(3,5,11,0.94)');
  hz.addColorStop(0.42, 'rgba(3,5,11,0.6)');
  hz.addColorStop(1, 'rgba(3,5,11,0)');
  g.fillStyle = hz;
  g.fillRect(0, 0, S, S * 0.64);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** 白色径向光晕（用 material.color 上色） */
function buildGlowTexture(): THREE.CanvasTexture {
  const S = 512;
  const c = makeCanvas(S, S);
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, 'rgba(255,255,255,0.95)');
  gr.addColorStop(0.22, 'rgba(255,255,255,0.55)');
  gr.addColorStop(0.55, 'rgba(255,255,255,0.16)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ───────────────────────── 3D 片场 ─────────────────────────
export type DshStageProps = {
  /** 0→1：网格 / 光晕"亮起" */
  reveal: number;
  /** 0→1：开场扫描环进度（1 = 已扫过） */
  ring: number;
  /** 0→1：终端光标（体素从这里飞出）显隐 */
  cursorOpacity: number;
  /** 光标纵向压扁（拼合收束时被抽干） */
  cursorScaleY: number;
  /** 拼合起点世界坐标 */
  cursorWorld: readonly [number, number, number];
};

export const DshStage: React.FC<DshStageProps> = ({
  reveal,
  ring,
  cursorOpacity,
  cursorScaleY,
  cursorWorld,
}) => {
  const floorTex = useMemo(() => buildFloorTexture(), []);
  const glowTex = useMemo(() => buildGlowTexture(), []);

  const ringR = 0.55 + ring * 9;
  const ringOpacity = Math.max(0, 1 - ring) ** 1.6 * 0.45;

  return (
    <>
      {/* 雾：参考片 Fog(0x03050b, 9, 24)；这里收紧到 8–21，让远端网格更早融进底色 */}
      <fog attach="fog" args={['#03050B', 8, 21]} />

      {/* 桌面：64×64，中心在 (0,-6)，按 1 单位为网格 */}
      <mesh position={[0, -0.004, -6]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-3}>
        <planeGeometry args={[64, 64]} />
        <meshBasicMaterial map={floorTex} transparent opacity={reveal} depthWrite={false} />
      </mesh>

      {/* 鲸鱼脚下的柔光池（"终端光晕"的地面部分；比影子先画，影子才压得住它） */}
      <mesh position={[0.2, 0.004, 0.15]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-2}>
        <planeGeometry args={[7.2, 5.6]} />
        <meshBasicMaterial
          map={glowTex}
          color={COLORS.blue}
          transparent
          opacity={0.3 * reveal}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* 开场：一圈向外扫过的光（网格"通电"） */}
      <mesh position={[0.2, 0.006, 0.25]} rotation={[-Math.PI / 2, 0, 0]} scale={[ringR, ringR, 1]}>
        <ringGeometry args={[0.985, 1, 128]} />
        <meshBasicMaterial
          color={COLORS.blue2}
          transparent
          opacity={ringOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* 背景光晕：在鲸鱼身后给一层蓝色体积感（billboard sprites） */}
      <sprite position={[0.6, 1.2, -2.4]} scale={[6.8, 4.0, 1]}>
        <spriteMaterial
          map={glowTex}
          color={COLORS.blue}
          transparent
          opacity={0.4 * reveal}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <sprite position={[4.2, 0.5, -5.5]} scale={[5.2, 3.2, 1]}>
        <spriteMaterial
          map={glowTex}
          color={COLORS.mint}
          transparent
          opacity={0.12 * reveal}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* 终端光标光晕：体素从这里飞出的视觉源头 */}
      <group position={cursorWorld}>
        <sprite scale={[1.25, 1.25, 1]}>
          <spriteMaterial
            map={glowTex}
            color={COLORS.blue2}
            transparent
            opacity={0.75 * cursorOpacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        <mesh scale={[1, cursorScaleY, 1]}>
          <boxGeometry args={[0.03, 0.3, 0.03]} />
          <meshBasicMaterial
            color={COLORS.blue2}
            transparent
            opacity={cursorOpacity}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -cursorWorld[1] + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshBasicMaterial
            map={glowTex}
            color={COLORS.blue}
            transparent
            opacity={0.4 * cursorOpacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
};

// ───────────────────────── CSS：底色 + 暗角（叠在 canvas 上） ─────────────────────────
/**
 * 天空/底色：上半部一层极淡的蓝，28% 处已收敛到 #03050B，
 * 与雾色一致 → 桌面远端和 CSS 底之间没有接缝。
 */
export const DshBackdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg0,
      backgroundImage:
        'linear-gradient(180deg, rgba(22,44,100,0.55) 0%, rgba(8,14,30,0.35) 12%, rgba(3,5,11,0) 26%, rgba(3,5,11,0) 100%)',
    }}
  />
);

/** 暗角：四周压暗 + 顶部/底部轻微压边，让画面像"片场"而不是 CG 场景 */
export const DshVignette: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 72% 62% at 50% 47%, rgba(3,5,11,0) 33%, rgba(3,5,11,0.42) 72%, rgba(2,3,8,0.9) 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, rgba(3,5,11,0.55) 0%, rgba(3,5,11,0) 16%, rgba(3,5,11,0) 80%, rgba(2,3,8,0.72) 100%)',
      }}
    />
  </AbsoluteFill>
);
