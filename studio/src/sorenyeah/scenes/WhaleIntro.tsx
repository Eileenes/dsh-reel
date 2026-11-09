/**
 * C0 · whale opening (0–240, 8.0s) — rebuilt from the reference film's grammar
 * (Soren_DeepSeek_whale.mp4): a terminal types "sorenyeah", the voxel whale assembles
 * out of the cursor, hops onto the Sorenyeah app icon, the icon presses and the real
 * homepage rises out of the dock — then the camera pushes through it into C1/C2.
 *
 * The whale's own performance (assembly 1.14–2.5 s, spout 3.0 s, big hop 3.667–4.667 s,
 * landing squash, dust, shadow) is the repo's WaterVoxel component, driven by `time` so
 * it lines up with this scene's frames. Everything else is this scene: the terminal
 * canvas texture, the dock row, the app icon press, the site window and the camera.
 *
 * Pure functions of the current frame — no useFrame, no random without seed.
 */

import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {WhaleVoxel} from '../../v2/whale/WhaleVoxel';

const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a || 1)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Camera path: terminal close-up → dock reveal → crane → push into the site window. */
const camAt = (f: number) => {
  // 0-34f close on the terminal → 34-100f pull back to reveal the dock and the whale
  // assembling → 100-150f follow the hop → 150-196f crane up as the homepage rises →
  // 196-240f push into the homepage until it fills the frame.
  const k1 = smooth(seg(f, 0, 34));
  const k2 = smooth(seg(f, 34, 100));
  const k3 = smooth(seg(f, 100, 150));
  const k4 = smooth(seg(f, 150, 196));
  const k5 = smooth(seg(f, 196, 240));

  let px = lerp(-1.55, -1.2, k1);
  let py = lerp(1.5, 1.6, k1);
  let pz = lerp(6.4, 6.8, k1);
  let lx = lerp(-4.0, -3.7, k1);
  let ly = lerp(1.45, 1.55, k1);
  let lz = 1.0;

  px = lerp(px, 0.2, k2);
  py = lerp(py, 2.4, k2);
  pz = lerp(pz, 11.6, k2);
  lx = lerp(lx, 0.0, k2);
  ly = lerp(ly, 2.2, k2);
  lz = lerp(lz, 1.7, k2);

  // the hop arcs up to ~4.6 world units — look up to keep it in frame
  px = lerp(px, 0.3, k3);
  py = lerp(py, 3.0, k3);
  pz = lerp(pz, 10.9, k3);
  lx = lerp(lx, 0.0, k3);
  ly = lerp(ly, 2.95, k3);
  lz = lerp(lz, 1.95, k3);

  px = lerp(px, 0.6, k4);
  py = lerp(py, 4.45, k4);
  pz = lerp(pz, 11.3, k4);
  lx = lerp(lx, 0.0, k4);
  ly = lerp(ly, 4.15, k4);
  lz = lerp(lz, 0.1, k4);

  px = lerp(px, 0.0, k5);
  py = lerp(py, 4.35, k5);
  pz = lerp(pz, 9.7, k5);
  lx = lerp(lx, 0.0, k5);
  ly = lerp(ly, 4.35, k5);
  lz = lerp(lz, -0.6, k5);

  // small impacts: assembly land (f75), icon land (f140)
  const shake = (at: number, amp: number) => {
    const d = f - at;
    if (d < 0 || d > 14) return 0;
    const k = Math.pow(1 - d / 14, 2);
    return Math.sin(d * 1.9) * amp * k;
  };
  px += shake(75, 0.05) + shake(140, 0.04);
  py += shake(75, 0.08) + shake(140, 0.06);

  return {p: [px, py, pz] as [number, number, number], l: [lx, ly, lz] as [number, number, number]};
};

const CamRig: React.FC = () => {
  const f = useCurrentFrame();
  const {camera} = useThree();
  const {p, l} = camAt(f);
  (camera as THREE.PerspectiveCamera).position.set(...p);
  camera.lookAt(new THREE.Vector3(...l));
  camera.updateProjectionMatrix();
  return null;
};

/* ---------------------------------------------------------------- */
/* terminal canvas texture                                          */
/* ---------------------------------------------------------------- */

const TERM_W = 1024;
const TERM_H = 620;
const PROMPT = 'soren@mac ~ % ';

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const drawTerminal = (canvas: HTMLCanvasElement, f: number) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = TERM_W;
  const H = TERM_H;
  ctx.clearRect(0, 0, W, H);

  // window
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  roundRect(ctx, 10, 10, W - 20, H - 20, 30);
  ctx.fillStyle = 'rgba(13,23,41,0.98)';
  ctx.fill();
  ctx.restore();

  roundRect(ctx, 10, 10, W - 20, H - 20, 30);
  ctx.strokeStyle = 'rgba(130,233,255,0.34)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // title bar
  ctx.save();
  roundRect(ctx, 10, 10, W - 20, 86, 30);
  ctx.clip();
  ctx.fillStyle = 'rgba(16,28,46,0.98)';
  ctx.fillRect(10, 10, W - 20, 86);
  ctx.restore();
  ctx.fillStyle = 'rgba(165,197,225,0.16)';
  ctx.fillRect(10, 96, W - 20, 1);

  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(52 + i * 34, 54, 9, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  ctx.font = '500 24px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillStyle = '#8fa3bf';
  ctx.fillText('sorenyeah — zsh — 120×32', 168, 63);

  // typed line
  const letters = clamp01((f - 8) / 27) * 9;
  const typed = 'sorenyeah'.slice(0, Math.floor(letters) + (letters >= 9 ? 0 : 0));
  ctx.font = '500 34px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillStyle = '#bfe9f2';
  ctx.fillText(PROMPT, 56, 236);
  const promptW = ctx.measureText(PROMPT).width;
  ctx.fillStyle = '#eaf6ff';
  ctx.fillText(typed, 56 + promptW, 236);
  const typedW = ctx.measureText(typed).width;

  // cursor
  if (f % 30 < 17) {
    ctx.fillStyle = 'rgba(130,233,255,0.85)';
    ctx.fillRect(56 + promptW + typedW + 4, 208, 18, 36);
  }

  // log lines
  ctx.font = '400 26px ui-monospace, "SF Mono", Menlo, monospace';
  if (f > 44) {
    ctx.fillStyle = 'rgba(130,233,255,0.85)';
    ctx.fillText('→  opening sorenyeah.com', 56, 312);
  }
  if (f > 50) {
    ctx.fillStyle = 'rgba(143,163,191,0.8)';
    ctx.fillText('voxels: 278 / 278   assembling whale…', 56, 372);
  }
  if (f > 78) {
    ctx.fillStyle = 'rgba(143,163,191,0.55)';
    ctx.fillText('whale ready · hop → app icon', 56, 428);
  }
  if (f > 148) {
    ctx.fillStyle = 'rgba(130,233,255,0.7)';
    ctx.fillText('homepage window: rising', 56, 484);
  }
};

/* ---------------------------------------------------------------- */
/* 3D scene                                                          */
/* ---------------------------------------------------------------- */

const SHADOW_TEX = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.62)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.26)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

/** Soft radial glow used for the icon press and the terminal halo. */
const GLOW_TEX = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 4, 128, 128, 126);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

/** Warm horizon halo behind the dock, echoing the site's twilight landscape. */
const HALO_TEX = (() => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(330, 150, 20, 330, 150, 240);
  grd.addColorStop(0, 'rgba(242,184,172,0.34)');
  grd.addColorStop(0.45, 'rgba(207,140,193,0.16)');
  grd.addColorStop(1, 'rgba(130,233,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

const TILE_SIZE = 2.0;
const TILE_Y = 1.0;
const TILE_Z = 2.2;
const ICON_X = [0, 0, 0, 0, 0]; // replaced below when textures are loaded
const SLOT_X = [-5.2, -2.6, 0, 2.6, 5.2];

const Tile: React.FC<{x: number; tex: THREE.Texture; press: number; glow: string}> = ({x, tex, press, glow}) => (
  <group position={[x, TILE_Y - 0.1 * press, TILE_Z]}>
    {/* depth: a darker plate behind the icon face */}
    <mesh position={[0, 0, -0.06]}>
      <planeGeometry args={[TILE_SIZE * 1.02, TILE_SIZE * 1.02]} />
      <meshBasicMaterial color="#0a1424" transparent opacity={0.9} />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
    {/* press glow: a soft halo around the icon */}
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[TILE_SIZE * 2.1, TILE_SIZE * 2.1]} />
      <meshBasicMaterial
        map={GLOW_TEX}
        color={glow}
        transparent
        opacity={0.5 * press}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  </group>
);

const Scene: React.FC = () => {
  const f = useCurrentFrame();

  // textures
  const siteWin = useLoader(THREE.TextureLoader, staticFile('sorenyeah/shots/home-1920.png'));
  const siteIcon = useLoader(THREE.TextureLoader, staticFile('sorenyeah/icon/sorenyeah-tile.png'));
  const i0 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-0.png'));
  const i1 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-1.png'));
  const i2 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-2.png'));
  const i3 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-3.png'));

  useMemo(() => {
    [siteWin, siteIcon, i0, i1, i2, i3].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });
  }, [siteWin, siteIcon, i0, i1, i2, i3]);

  // terminal texture (redrawn per frame)
  const termCanvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = TERM_W;
    c.height = TERM_H;
    return c;
  }, []);
  const termTex = useMemo(() => {
    const t = new THREE.CanvasTexture(termCanvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [termCanvas]);
  drawTerminal(termCanvas, f);
  termTex.needsUpdate = true;

  // beat timings (frames)
  const termFade = 1 - smooth(seg(f, 62, 96));
  const press = smooth(seg(f, 137, 143)) * (1 - smooth(seg(f, 152, 172)));
  const winK = smooth(seg(f, 148, 190));
  const sink = smooth(seg(f, 152, 205));

  // camera + haze
  return (
    <>
      <color attach="background" args={['#050a14']} />
      <fog attach="fog" args={['#050a14', 22, 46]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 8, 6]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-5, 3, 4]} intensity={28} color="#4d8dff" distance={18} />
      <pointLight position={[5, 4, 4]} intensity={20} color="#9cf6ff" distance={18} />
      <pointLight position={[1, 2.5, -2]} intensity={14} color="#f2b8ac" distance={16} />
      <CamRig />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[70, 46]} />
        <meshStandardMaterial color="#07101f" roughness={0.52} metalness={0.38} />
      </mesh>
      <gridHelper args={[46, 46, '#1d4a86', '#0c1b31']} position={[0, 0.012, 0]} />

      {/* warm halo behind the dock */}
      <mesh position={[1.5, 4.5, -7]}>
        <planeGeometry args={[26, 13]} />
        <meshBasicMaterial map={HALO_TEX} transparent opacity={0.9} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* terminal window, floating at the left */}
      <mesh position={[-4.3, 1.45, 0.7]}>
        <planeGeometry args={[6.4, 4.4]} />
        <meshBasicMaterial map={GLOW_TEX} color="#2f8fa8" transparent opacity={0.35 * termFade} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <group position={[-4.3, 1.5, 1.0]} rotation={[0.02, 0.42, 0]}>
        <mesh>
          <planeGeometry args={[3.8, 2.3]} />
          <meshBasicMaterial map={termTex} transparent opacity={termFade} toneMapped={false} />
        </mesh>
      </group>

      {/* dock row + whale: rises out of the floor early, sinks out once the window fills */}
      <group position={[0, -6 * (1 - smooth(seg(f, 58, 92))) - 5.0 * sink, 0]}>
        <Tile x={SLOT_X[0]} tex={i0} press={0} glow="#8ea6ff" />
        <Tile x={SLOT_X[1]} tex={i1} press={0} glow="#8ea6ff" />
        <Tile x={SLOT_X[2]} tex={siteIcon} press={press} glow="#82e9ff" />
        <Tile x={SLOT_X[3]} tex={i2} press={0} glow="#8ea6ff" />
        <Tile x={SLOT_X[4]} tex={i3} press={0} glow="#8ea6ff" />

        {/* press ring on the floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, TILE_Z]}>
          <ringGeometry args={[1.25, 1.42, 48]} />
          <meshBasicMaterial color="#9fe6ff" transparent opacity={0.55 * press} toneMapped={false} />
        </mesh>

        {/* the whale: assembly at (0,0) in its own group, hop lands on the site icon */}
        <group position={[-1.85, 1.95, TILE_Z + 1.05]}>
          <group scale={1.3}>
            <WhaleVoxel
              cursorWorld={[-1.5, -0.65, -1.5]}
              time={f / 30}
              spout
            />
          </group>
        </group>
      </group>

      {/* the real homepage, rising out of the dock behind the icons */}
      <group
        position={[0, 1.0 + 3.3 * winK - 6 * (1 - smooth(seg(f, 58, 92))), -0.6]}
        scale={[0.2 + 0.8 * winK, 0.2 + 0.8 * winK, 1]}
      >
        <mesh>
          <planeGeometry args={[12.0, 6.75]} />
          <meshBasicMaterial map={siteWin} transparent opacity={winK} toneMapped={false} />
        </mesh>
        {/* soft light edge */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[12.4, 7.15]} />
          <meshBasicMaterial color="#82e9ff" transparent opacity={0.18 * winK} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
};

export const WhaleIntroScene: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#050a14'}}>
    <ThreeCanvas
      width={1920}
      height={1080}
      camera={{fov: 38, position: [-1.9, 1.75, 6.9], near: 0.1, far: 100}}
      gl={{antialias: true}}
      style={{background: '#050a14'}}
    >
      <Scene />
    </ThreeCanvas>
  </AbsoluteFill>
);
