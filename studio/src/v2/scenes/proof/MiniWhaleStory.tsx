/**
 * ProofStory30 — 30s narrative cut inside the miniature world (pain -> install -> four features -> end card).
 *
 * Concept: the official black-whale app icon becomes a tiny figurine standing on a
 * giant DSH composer card in a dark macro "desk studio". It walks to a big red 安装
 * button and presses it; a cyan-lit drawer slides open revealing the sidebar's four
 * tabs, and an install ticket prints out. Lit/blocked like a miniature film set.
 *
 * 900 frames @30fps = 30.0s. Rendered in 3D with canvas textures for exact Chinese.
 */

import React, {Suspense, useEffect, useMemo} from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {useFrame} from '@react-three/fiber';

const BG = '#06080d';
const CYAN = '#28e0ff';
const RED = '#e8382f';

const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a)));

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const FONT = '-apple-system, "SF Pro Text", "PingFang SC", sans-serif';
const MONO = '"SF Mono", Menlo, monospace';

/* ── textures ─────────────────────────────────────────────────────────────── */

function useComposerTex() {
  return useMemo(
    () =>
      canvasTex(1200, 620, (g) => {
        g.fillStyle = '#f7f8fb';
        g.beginPath();
        g.roundRect(0, 0, 1200, 620, 44);
        g.fill();
        g.strokeStyle = 'rgba(15,17,21,0.10)';
        g.lineWidth = 4;
        g.stroke();
        g.fillStyle = 'rgba(15,17,21,0.26)';
        g.font = `400 40px ${FONT}`;
        g.fillText('Describe what you want to build, / commands, @ files', 64, 168);
        g.fillStyle = 'rgba(15,17,21,0.55)';
        g.font = `400 30px ${FONT}`;
        g.fillText('＋', 74, 500);
        g.fillText('Default', 150, 500);
        g.fillText('Creator mode', 380, 500);
        g.fillStyle = '#4d8dff';
        g.beginPath();
        g.arc(1080, 505, 48, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(1080, 530);
        g.lineTo(1080, 482);
        g.moveTo(1058, 502);
        g.lineTo(1080, 480);
        g.lineTo(1102, 502);
        g.stroke();
      }),
    []
  );
}

function useDrawerTex() {
  return useMemo(
    () =>
      canvasTex(1024, 1400, (g) => {
        g.fillStyle = '#0f131b';
        g.beginPath();
        g.roundRect(0, 0, 1024, 1400, 40);
        g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.10)';
        g.lineWidth = 5;
        g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.94)';
        g.font = `600 56px ${FONT}`;
        g.fillText('Better Sidebar', 64, 118);
        g.fillStyle = 'rgba(255,255,255,0.42)';
        g.font = `400 30px ${FONT}`;
        g.fillText('侧栏 · 工作台', 64, 172);
        ['文件', 'Git', '任务', '侧聊'].forEach((tab, i) => {
          const ty = 270 + i * 235;
          g.fillStyle = i === 0 ? 'rgba(40,224,255,0.16)' : 'rgba(255,255,255,0.05)';
          g.beginPath();
          g.roundRect(60, ty, 904, 186, 30);
          g.fill();
          g.strokeStyle = i === 0 ? 'rgba(40,224,255,0.85)' : 'rgba(255,255,255,0.12)';
          g.lineWidth = 4;
          g.stroke();
          g.fillStyle = i === 0 ? '#9cf6ff' : 'rgba(255,255,255,0.78)';
          g.font = `600 60px ${FONT}`;
          g.fillText(tab, 108, ty + 112);
          g.fillStyle = 'rgba(255,255,255,0.32)';
          g.font = `400 34px ${FONT}`;
          g.fillText(['files · editor', 'changes · diff', 'agents · queue', 'chat · context'][i], 108, ty + 158);
        });
      }),
    []
  );
}

function useTicketTex() {
  return useMemo(
    () =>
      canvasTex(1200, 360, (g) => {
        g.fillStyle = '#f4efe3';
        g.beginPath();
        g.roundRect(0, 0, 1200, 360, 28);
        g.fill();
        g.fillStyle = '#13161d';
        g.font = `600 46px ${MONO}`;
        g.fillText('$ dsh plugin --profile web', 56, 128);
        g.fillText('  add dsh-better-sidebar', 56, 196);
        g.fillStyle = 'rgba(19,22,29,0.45)';
        g.font = `400 32px ${MONO}`;
        g.fillText('Better Sidebar · 0.28.2 · MIT', 56, 286);
      }),
    []
  );
}

function useButtonTex() {
  return useMemo(
    () =>
      canvasTex(512, 512, (g) => {
        g.fillStyle = 'rgba(255,255,255,1)';
        g.font = `700 210px ${FONT}`;
        g.textAlign = 'center';
        g.fillText('安装', 256, 320);
      }),
    []
  );
}

/* ── props ────────────────────────────────────────────────────────────────── */

const ComposerCard: React.FC = () => {
  const tex = useComposerTex();
  const geo = useMemo(() => new RoundedBoxGeometry(5.0, 0.34, 2.9, 6, 0.12), []);
  return (
    <group position={[-1.05, 0.17, 0.05]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#eef1f7" roughness={0.62} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.176, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.86, 2.76]} />
        <meshStandardMaterial map={tex} roughness={0.72} metalness={0.02} />
      </mesh>
    </group>
  );
};

const WhaleFigurine: React.FC<{frame: number}> = ({frame}) => {
  const img = useLoader(THREE.TextureLoader, staticFile('proof/whale-black.png'));
  const pixelTex = useMemo(() => {
    const src = img.image as HTMLImageElement;
    const small = document.createElement('canvas');
    small.width = 48;
    small.height = 40;
    const sg = small.getContext('2d')!;
    sg.imageSmoothingEnabled = false;
    sg.drawImage(src, 0, 0, 48, 40);
    const c = document.createElement('canvas');
    c.width = 480;
    c.height = 400;
    const g = c.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.drawImage(small, 0, 0, 480, 400);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
  }, [img]);
  const glowTex = useMemo(
    () =>
      canvasTex(256, 256, (g) => {
        const grd = g.createRadialGradient(128, 128, 10, 128, 128, 126);
        grd.addColorStop(0, 'rgba(130,220,255,0.55)');
        grd.addColorStop(0.55, 'rgba(130,220,255,0.16)');
        grd.addColorStop(1, 'rgba(130,220,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 256, 256);
      }),
    []
  );

  const walk = smooth(seg(frame, 212, 300));
  const walking = walk > 0.02 && walk < 0.98 ? 1 : 0;
  const press = smooth(seg(frame, 306, 318)) * (1 - smooth(seg(frame, 328, 352)));
  const settle = smooth(seg(frame, 360, 420));
  const bob = Math.abs(Math.sin((frame / 9) * Math.PI)) * 0.035 * (1 - settle * 0.6);
  const rock = Math.sin(frame * 0.7) * 0.08 * walking;
  const x = -1.7 + walk * 2.0 - settle * 0.5;
  const y = 0.36 + 0.5 + bob - press * 0.02;
  const z = 0.22 + press * 0.3;
  return (
    <group position={[x, y, z]} rotation={[0.1, -0.32 + walk * 0.1 + settle * -0.25, -press * 0.3 + rock]}>
      <mesh position={[0, -0.02, -0.04]}>
        <planeGeometry args={[1.75, 1.55]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh castShadow>
        <planeGeometry args={[1.18, 0.98]} />
        <meshStandardMaterial map={pixelTex} transparent alphaTest={0.5} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.5, -0.01]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 0.08, 40]} />
        <meshStandardMaterial color="#12161d" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
};

const InstallButton: React.FC<{frame: number}> = ({frame}) => {
  const press = smooth(seg(frame, 306, 318)) * (1 - smooth(seg(frame, 328, 352)));
  const tex = useButtonTex();
  const geo = useMemo(() => new RoundedBoxGeometry(0.62, 0.46, 0.62, 6, 0.12), []);
  return (
    <group position={[0.98, 0.34, 0.42]}>
      <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.12, 40]} />
        <meshStandardMaterial color="#161a22" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh
        geometry={geo}
        position={[0, 0.23 - press * 0.12, 0]}
        scale={[1, 1 - press * 0.28, 1]}
        castShadow
      >
        <meshStandardMaterial
          color={RED}
          roughness={0.28}
          metalness={0.06}
          emissive={RED}
          emissiveIntensity={0.15 + press * 1.6}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5 + press * 0.5, 0.53 + press * 0.5, 48]} />
        <meshBasicMaterial color={CYAN} transparent opacity={press * 0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.475 - press * 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.52, 0.52]} />
        <meshStandardMaterial map={tex} transparent roughness={0.3} />
      </mesh>
    </group>
  );
};

function makeDrawerTexture(active: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1400;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0f131b';
  g.beginPath();
  g.roundRect(0, 0, 1024, 1400, 40);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.10)';
  g.lineWidth = 5;
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.94)';
  g.font = `600 56px ${FONT}`;
  g.fillText('Better Sidebar', 64, 118);
  g.fillStyle = 'rgba(255,255,255,0.42)';
  g.font = `400 30px ${FONT}`;
  g.fillText('侧栏 · 工作台', 64, 172);
  ['文件', 'Git', '任务', '侧聊'].forEach((tab, i) => {
    const ty = 270 + i * 235;
    const on = i === active;
    g.fillStyle = on ? 'rgba(40,224,255,0.18)' : 'rgba(255,255,255,0.05)';
    g.beginPath();
    g.roundRect(60, ty, 904, 186, 30);
    g.fill();
    g.strokeStyle = on ? 'rgba(40,224,255,0.9)' : 'rgba(255,255,255,0.12)';
    g.lineWidth = on ? 5 : 4;
    g.stroke();
    g.fillStyle = on ? '#b6f8ff' : 'rgba(255,255,255,0.72)';
    g.font = `600 60px ${FONT}`;
    g.fillText(tab, 108, ty + 112);
    g.fillStyle = on ? 'rgba(140,246,255,0.85)' : 'rgba(255,255,255,0.30)';
    g.font = `400 34px ${FONT}`;
    g.fillText(['files · editor', 'changes · diff', 'agents · queue', 'chat · context'][i], 108, ty + 158);
    if (on) {
      g.fillStyle = 'rgba(40,224,255,0.9)';
      g.beginPath();
      g.arc(930, ty + 92, 12, 0, Math.PI * 2);
      g.fill();
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const Drawer: React.FC<{frame: number}> = ({frame}) => {
  const open = smooth(seg(frame, 340, 460));
  const led = Math.max(smooth(seg(frame, 312, 334)), open);
  const tabFrame = frame < 492 ? 0 : frame < 564 ? 1 : frame < 636 ? 2 : 3;
  const faceTex = useMemo(() => makeDrawerTexture(tabFrame), [tabFrame]);
  const geo = useMemo(() => new RoundedBoxGeometry(2.35, 3.45, 0.36, 6, 0.08), []);
  const mats = useMemo(() => {
    const dark = new THREE.MeshStandardMaterial({color: '#161b25', roughness: 0.4, metalness: 0.28});
    const face = new THREE.MeshStandardMaterial({map: faceTex, roughness: 0.5, metalness: 0.08});
    return [dark, dark, dark, dark, face, dark];
  }, [faceTex]);
  const beat = [420, 492, 564, 636][tabFrame];
  const pulse = Math.exp(-Math.pow((frame - beat) / 8, 2));
  return (
    <group position={[3.05, 1.75, -0.7 + open * 1.05]} rotation={[0, -0.32 + open * 0.12, 0]}>
      <mesh geometry={geo} material={mats} castShadow receiveShadow />
      <mesh position={[-1.23, 0, 0.12]}>
        <boxGeometry args={[0.04, 3.25, 0.04]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.3 + led * 3.4} />
      </mesh>
      <mesh position={[0, 1.78, 0.12]}>
        <boxGeometry args={[2.28, 0.04, 0.04]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.1 + led * 2.2 + pulse * 1.5} />
      </mesh>
      <pointLight position={[-1.05, 0.2, 0.7]} color={CYAN} intensity={led * 10 + pulse * 4} distance={4} />
    </group>
  );
};

const PrinterTicket: React.FC<{frame: number}> = ({frame}) => {
  const out = smooth(seg(frame, 640, 690));
  const rise = smooth(seg(frame, 690, 748));
  const tex = useTicketTex();
  return (
    <group position={[2.65, 0.36, 1.55]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.2, 0.72]} />
        <meshStandardMaterial color="#121620" roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.125, 0.02]}>
        <boxGeometry args={[1.32, 0.02, 0.5]} />
        <meshStandardMaterial color="#04060a" emissive="#04060a" />
      </mesh>
      <group
        position={[-0.55 - out * 0.5, 0.16 + rise * 0.46, 0.32 + rise * 0.34]}
        rotation={[-1.47 + rise * 1.32, 0.12 - rise * 0.1, -0.03]}
      >
        <mesh castShadow>
          <planeGeometry args={[1.05, 0.38]} />
          <meshStandardMaterial map={tex} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};


const Keyboard: React.FC = () => {
  const keys = useMemo(() => {
    const rows: Array<{x: number; z: number; w: number}> = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 12; c++) {
        rows.push({x: -1.85 + c * 0.32 + (r % 2) * 0.05, z: -0.55 + r * 0.3, w: 0.26});
      }
    }
    return rows;
  }, []);
  return (
    <group position={[-1.1, 0.05, 2.35]} rotation={[0, 0.12, 0]}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.1, 0.12, 1.55]} />
        <meshStandardMaterial color="#151a22" roughness={0.55} metalness={0.2} />
      </mesh>
      {keys.map((k, i) => (
        <mesh key={i} position={[k.x, 0.13, k.z]} castShadow>
          <boxGeometry args={[k.w, 0.06, 0.24]} />
          <meshStandardMaterial color={i % 9 === 0 ? '#2a3442' : '#20262f'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

const Mug: React.FC = () => (
  <group position={[3.05, 0.3, 2.35]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.32, 0.28, 0.6, 36]} />
      <meshStandardMaterial color="#e9e3d5" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.31, 0]}>
      <cylinderGeometry args={[0.27, 0.27, 0.02, 36]} />
      <meshStandardMaterial color="#2a1a12" roughness={0.4} />
    </mesh>
    <mesh position={[0.32, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.16, 0.045, 12, 24]} />
      <meshStandardMaterial color="#e9e3d5" roughness={0.6} />
    </mesh>
  </group>
);

const Cable: React.FC = () => {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.4, 0.08, 1.4),
        new THREE.Vector3(2.9, 0.06, 2.2),
        new THREE.Vector3(2.2, 0.05, 3.1),
        new THREE.Vector3(1.2, 0.05, 3.3),
        new THREE.Vector3(0.2, 0.06, 2.9),
      ]),
    []
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.035, 8, false]} />
      <meshStandardMaterial color="#0d1117" roughness={0.5} metalness={0.3} />
    </mesh>
  );
};


const Plant: React.FC = () => (
  <group position={[-4.6, 0.02, -1.4]}>
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.55, 0.42, 0.6, 36]} />
      <meshStandardMaterial color="#c9c1b2" roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.63, 0]} castShadow>
      <sphereGeometry args={[0.42, 20, 20]} />
      <meshStandardMaterial color="#2d4a33" roughness={0.9} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.34, 0.95 + (i % 2) * 0.18, Math.sin(a) * 0.34]} rotation={[0.5 * Math.cos(a), 0.3, 0.5 * Math.sin(a)]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#365c3c' : '#2a4a31'} roughness={0.85} />
        </mesh>
      );
    })}
  </group>
);

const Lamp: React.FC = () => (
  <group position={[5.15, 0.02, -0.4]}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.04, 2.4, 16]} />
      <meshStandardMaterial color="#1a1f27" roughness={0.5} metalness={0.5} />
    </mesh>
    <mesh position={[0, 2.5, 0]} castShadow>
      <coneGeometry args={[0.34, 0.3, 24, 1, true]} />
      <meshStandardMaterial color="#20262f" roughness={0.4} metalness={0.35} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 2.42, 0]}>
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshStandardMaterial color="#ffd9a8" emissive="#ffc078" emissiveIntensity={4} />
    </mesh>
    <pointLight position={[0, 2.35, 0]} color="#ffcf9a" intensity={12} distance={6} />
  </group>
);

const StickyNotes: React.FC = () => (
  <group>
    {[
      {p: [-2.7, 0.02, 1.9], r: -0.2, c: '#f6d35c', t: '侧栏?'},
      {p: [-2.25, 0.03, 2.05], r: 0.15, c: '#7cc7a4', t: '文件'},
      {p: [1.9, 0.02, 2.5], r: 0.1, c: '#e88b7a', t: 'Git'},
    ].map((n, i) => (
      <mesh key={i} position={n.p as [number, number, number]} rotation={[-Math.PI / 2, 0, n.r]} receiveShadow>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial color={n.c} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);

const PaperStack: React.FC = () => (
  <group position={[-4.0, 0.02, 0.6]} rotation={[0, 0.28, 0]}>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh
        key={i}
        position={[i * 0.03, 0.08 + i * 0.13, -i * 0.05]}
        rotation={[0, 0.04 * i, 0.015 * (i % 2 === 0 ? 1 : -1)]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.4 - i * 0.14, 0.13, 1.7 - i * 0.1]} />
        <meshStandardMaterial color={['#ded7c9', '#ece5d7', '#d3cbbc', '#f0e9db', '#e2dbcd'][i]} roughness={0.88} />
      </mesh>
    ))}
  </group>
);

const Desk: React.FC = () => (
  <group>
    <mesh position={[0, -0.2, 0.6]} receiveShadow>
      <boxGeometry args={[22, 0.4, 12]} />
      <meshStandardMaterial color="#0a0e15" roughness={0.24} metalness={0.5} />
    </mesh>
    <mesh position={[5.2, 0.01, 3.2]}>
      <boxGeometry args={[0.06, 0.02, 3.4]} />
      <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2.2} />
    </mesh>
    <pointLight position={[4.9, 0.3, 3.2]} color={CYAN} intensity={7} distance={5} />
  </group>
);

const Bokeh: React.FC<{frame: number}> = ({frame}) => {
  const items = useMemo(
    () =>
      Array.from({length: 16}, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        return {
          x: Math.cos(a) * (3.2 + (i % 4) * 1.4),
          y: 1.9 + ((i * 0.47) % 2.6),
          z: -2.8 - (i % 5) * 0.7,
          s: 0.03 + (i % 3) * 0.018,
          c: i % 3 === 0 ? '#28e0ff' : i % 3 === 1 ? '#ffd9a0' : '#7aa2ff',
        };
      }),
    []
  );
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x + Math.sin((frame + i * 25) / 80) * 0.1, it.y + Math.cos((frame + i * 18) / 100) * 0.07, it.z]}>
          <sphereGeometry args={[it.s, 12, 12]} />
          <meshBasicMaterial color={it.c} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};


const PostFX: React.FC = () => {
  const {gl, scene, camera, size} = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.setSize(size.width, size.height);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new BokehPass(scene, camera, {focus: 9.2, aperture: 0.00065, maxblur: 0.016}));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.22, 0.45, 1.0));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera]);
  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);
  useFrame(() => {
    composer.render();
  }, 1);
  return null;
};


function makeWindowTexture(variant: number): THREE.CanvasTexture {
  return canvasTex(900, 620, (g) => {
    g.clearRect(0, 0, 900, 620);
    g.fillStyle = 'rgba(247,249,252,0.93)';
    g.beginPath();
    g.roundRect(0, 0, 900, 620, 30);
    g.fill();
    g.strokeStyle = 'rgba(15,17,21,0.12)';
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = 'rgba(15,17,21,0.10)';
    g.fillRect(0, 48, 900, 2);
    g.fillStyle = '#ff5f57';
    g.beginPath(); g.arc(34, 24, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#febc2e';
    g.beginPath(); g.arc(60, 24, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#28c840';
    g.beginPath(); g.arc(86, 24, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(15,17,21,0.16)';
    g.fillRect(40, 90, 200, 14);
    for (let i = 0; i < 5; i++) {
      g.fillStyle = i === variant % 5 ? 'rgba(40,224,255,0.35)' : 'rgba(15,17,21,0.10)';
      g.fillRect(40, 140 + i * 46, 220, 22);
    }
    g.fillStyle = 'rgba(15,17,21,0.08)';
    g.fillRect(300, 90, 560, 10);
    g.fillRect(300, 118, 420, 10);
    g.fillStyle = 'rgba(15,17,21,0.05)';
    for (let i = 0; i < 7; i++) g.fillRect(300, 160 + i * 52, 520 - (i % 3) * 90, 14);
    g.fillStyle = 'rgba(15,17,21,0.10)';
    g.beginPath(); g.roundRect(300, 530, 560, 44, 22); g.fill();
  });
}

const MessWindows: React.FC<{frame: number}> = ({frame}) => {
  const textures = useMemo(() => [0, 1, 2, 3].map((v) => makeWindowTexture(v)), []);
  const suck = smooth(seg(frame, 210, 286));
  const conf = [
    {p: [-2.35, 1.55, 0.35], r: [0.1, 0.38, -0.06]},
    {p: [-0.75, 2.2, -0.55], r: [-0.08, 0.18, 0.05]},
    {p: [0.95, 1.75, -0.85], r: [0.06, -0.22, -0.04]},
    {p: [2.25, 2.35, 0.15], r: [0.12, -0.42, 0.06]},
  ];
  return (
    <>
      {textures.map((tex, i) => {
        const c = conf[i];
        const bob = Math.sin((frame + i * 40) / 55) * 0.05;
        const target = new THREE.Vector3(3.15, 1.75, -0.55);
        const base = new THREE.Vector3(c.p[0], c.p[1] + bob, c.p[2]);
        const pos = base.lerp(target, suck);
        const s = 1 - suck * 0.97;
        return (
          <mesh key={i} position={pos} rotation={c.r as [number, number, number]} scale={s}>
            <planeGeometry args={[1.9, 1.3]} />
            <meshStandardMaterial map={tex} transparent opacity={1 - suck * 0.85} roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </>
  );
};

function screenshotTexture(
  image: HTMLImageElement | HTMLCanvasElement,
  label: string,
  accent: string
): THREE.CanvasTexture {
  return canvasTex(1100, 760, (g) => {
    g.fillStyle = '#0f141c';
    g.beginPath(); g.roundRect(0, 0, 1100, 760, 28); g.fill();
    g.fillStyle = accent;
    g.beginPath(); g.roundRect(24, 22, 130, 46, 23); g.fill();
    g.fillStyle = '#0b1018';
    g.font = `600 30px ${FONT}`;
    g.fillText(label, 46, 54);
    g.save();
    g.beginPath(); g.roundRect(24, 92, 1052, 640, 14); g.clip();
    const iw = 1052;
    const ih = 640;
    const r = Math.max(iw / image.width, ih / image.height);
    const w = image.width * r;
    const h = image.height * r;
    g.drawImage(image, 24 + (iw - w) / 2, 92 + (ih - h) / 2, w, h);
    g.restore();
    g.fillStyle = 'rgba(6,10,16,0.34)';
    g.fillRect(24, 92, 1052, 640);
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 4;
    g.beginPath(); g.roundRect(24, 92, 1052, 640, 14); g.stroke();
  });
}

function diagramTexture(kind: 'task' | 'chat'): THREE.CanvasTexture {
  return canvasTex(1100, 760, (g) => {
    g.fillStyle = '#0f141c';
    g.beginPath(); g.roundRect(0, 0, 1100, 760, 28); g.fill();
    g.fillStyle = kind === 'task' ? '#9cf6ff' : '#ffd9a0';
    g.beginPath(); g.roundRect(24, 22, 130, 46, 23); g.fill();
    g.fillStyle = '#0b1018';
    g.font = `600 30px ${FONT}`;
    g.fillText(kind === 'task' ? '任务' : '侧聊', 46, 54);
    if (kind === 'task') {
      const nodes = [
        {x: 550, y: 170, t: 'LEAD', c: '#28e0ff'},
        {x: 330, y: 420, t: 'SCOUT', c: '#9cf6ff'},
        {x: 770, y: 420, t: 'EXEC', c: '#ffd9a0'},
        {x: 550, y: 600, t: 'DONE', c: '#6ee7a8'},
      ];
      g.strokeStyle = 'rgba(255,255,255,0.18)';
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(550, 200); g.lineTo(330, 400); g.stroke();
      g.beginPath(); g.moveTo(550, 200); g.lineTo(770, 400); g.stroke();
      g.beginPath(); g.moveTo(330, 450); g.lineTo(550, 580); g.stroke();
      g.beginPath(); g.moveTo(770, 450); g.lineTo(550, 580); g.stroke();
      nodes.forEach((n) => {
        g.fillStyle = 'rgba(15,20,28,0.95)';
        g.strokeStyle = n.c;
        g.lineWidth = 3;
        g.beginPath(); g.roundRect(n.x - 110, n.y - 34, 220, 68, 20); g.fill(); g.stroke();
        g.fillStyle = n.c;
        g.font = `600 34px ${MONO}`;
        g.textAlign = 'center';
        g.fillText(n.t, n.x, n.y + 11);
        g.textAlign = 'left';
      });
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.font = `400 26px ${FONT}`;
      g.fillText('子代理运行图 · 后台任务 · 实时输出', 60, 700);
    } else {
      const bubbles = [
        {x: 180, y: 170, w: 520, t: '帮我看下这个文件', me: false},
        {x: 400, y: 290, w: 620, t: '已继承当前会话语境上下文', me: true},
        {x: 180, y: 410, w: 480, t: '改好了，diff 已生成', me: false},
        {x: 480, y: 530, w: 540, t: '继续做下一个任务', me: true},
      ];
      bubbles.forEach((b) => {
        g.fillStyle = b.me ? 'rgba(40,224,255,0.22)' : 'rgba(255,255,255,0.1)';
        g.strokeStyle = b.me ? 'rgba(40,224,255,0.7)' : 'rgba(255,255,255,0.18)';
        g.lineWidth = 3;
        g.beginPath(); g.roundRect(b.x, b.y, b.w, 84, 22); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.82)';
        g.font = `400 30px ${FONT}`;
        g.fillText(b.t, b.x + 28, b.y + 52);
      });
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.font = `400 26px ${FONT}`;
      g.fillText('侧边对话 · 上下文连续 · 可提升为顶层会话', 60, 700);
    }
  });
}

const FeatureScreens: React.FC<{frame: number}> = ({frame}) => {
  const filesImg = useLoader(THREE.TextureLoader, staticFile('shots/files-tree.png'));
  const changesImg = useLoader(THREE.TextureLoader, staticFile('shots/changes-tree.png'));
  const textures = useMemo(
    () => [
      screenshotTexture(filesImg.image as HTMLImageElement, '文件', '#28e0ff'),
      screenshotTexture(changesImg.image as HTMLImageElement, 'Git', '#ffd9a0'),
      diagramTexture('task'),
      diagramTexture('chat'),
    ],
    [filesImg, changesImg]
  );
  const beats = [420, 492, 564, 636];
  const endAt = [492, 564, 636, 760];
  const targets = [
    {p: [0.85, 1.8, 0.9], r: [0.02, 0.22, 0.02]},
    {p: [0.55, 1.55, 1.0], r: [0.02, 0.16, -0.02]},
    {p: [0.35, 1.3, 0.9], r: [0.02, 0.1, 0.02]},
    {p: [0.65, 1.6, 1.0], r: [0.02, 0.06, -0.02]},
  ];
  return (
    <>
      {textures.map((tex, i) => {
        if (frame < beats[i] || frame > endAt[i]) return null;
        const inP = smooth(seg(frame, beats[i], beats[i] + 18));
        const outP = smooth(seg(frame, endAt[i] - 18, endAt[i]));
        const t = targets[i];
        const from = new THREE.Vector3(3.15, 1.75, -0.55);
        const to = new THREE.Vector3(t.p[0], t.p[1], t.p[2]);
        const pos = from.clone().lerp(to, inP);
        return (
          <mesh key={i} position={pos} rotation={t.r as [number, number, number]} scale={0.6 + 0.4 * inP}>
            <planeGeometry args={[1.2, 0.83]} />
            <meshStandardMaterial map={tex} transparent opacity={inP * (1 - outP * 0.92)} roughness={0.6} metalness={0.04} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </>
  );
};

/* ── camera ───────────────────────────────────────────────────────────────── */

const CameraRig: React.FC<{frame: number}> = ({frame}) => {
  const {camera} = useThree();
  const painPan = smooth(seg(frame, 0, 210));
  const push = smooth(seg(frame, 212, 300));
  const tab = smooth(seg(frame, 352, 430)) * (1 - smooth(seg(frame, 650, 700)));
  const pull = smooth(seg(frame, 700, 790));
  const sway = Math.sin(frame / 70) * 0.035;

  const P0 = new THREE.Vector3(2.9, 2.7, 10.4);
  const P1 = new THREE.Vector3(3.5, 2.4, 9.2);
  const P2 = new THREE.Vector3(1.75, 2.1, 7.4);
  const P3 = new THREE.Vector3(1.25, 2.05, 7.2);
  const P4 = new THREE.Vector3(2.85, 2.65, 10.1);
  const L0 = new THREE.Vector3(0.15, 1.0, 0.0);
  const L1 = new THREE.Vector3(-0.25, 1.25, 0.0);
  const L2 = new THREE.Vector3(0.35, 0.95, 0.15);
  const L3 = new THREE.Vector3(1.35, 1.35, 0.0);
  const L4 = new THREE.Vector3(0.45, 0.95, 0.2);

  const pos = P0.clone().lerp(P1, painPan).lerp(P2, push).lerp(P3, tab).lerp(P4, pull);
  const look = L0.clone().lerp(L1, painPan).lerp(L2, push).lerp(L3, tab).lerp(L4, pull);
  camera.position.set(pos.x + sway, pos.y, pos.z);
  camera.lookAt(look);
  camera.updateProjectionMatrix();
  return null;
};

/* ── scene ────────────────────────────────────────────────────────────────── */

const Scene: React.FC<{frame: number}> = ({frame}) => (
  <>
    <fog attach="fog" args={[BG, 14, 26]} />
    <ambientLight intensity={0.55} />
    <directionalLight
      position={[-4, 7, 6]}
      intensity={3.2}
      color="#ffd8a8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
      shadow-bias={-0.0004}
    />
    <pointLight position={[6, 3.5, 0.5]} intensity={24} color="#ff9a5c" distance={16} />
    <pointLight position={[-6, 2.6, 3.5]} intensity={14} color="#4a6bff" distance={16} />
    <spotLight position={[3.5, 6, 3.5]} angle={0.55} penumbra={0.9} intensity={30} color="#ffffff" castShadow />

    <Desk />
    <Keyboard />
    <Mug />
    <Cable />
    <Plant />
    <Lamp />
    <StickyNotes />
    <PaperStack />
    <ComposerCard />
    <WhaleFigurine frame={frame} />
    <InstallButton frame={frame} />
    <Drawer frame={frame} />
    <PrinterTicket frame={frame} />
    <MessWindows frame={frame} />
    <FeatureScreens frame={frame} />
    <Bokeh frame={frame} />
    <CameraRig frame={frame} />
    <PostFX />
  </>
);

/* ── composition ──────────────────────────────────────────────────────────── */

export const ProofStory30: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 14], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const overlayIn = interpolate(frame, [806, 834], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hookIn = interpolate(frame, [16, 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hookOut = interpolate(frame, [170, 204], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const midIn = interpolate(frame, [212, 240], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const midOut = interpolate(frame, [330, 360], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        backgroundImage: `url(${staticFile('proof/bg-blur.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Suspense fallback={null}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{fov: 40, near: 0.1, far: 80, position: [2.9, 2.7, 10.4]}}
          gl={{antialias: true, alpha: true, toneMappingExposure: 1.08}}
          style={{position: 'absolute', inset: 0}}
        >
          <Scene frame={frame} />
        </ThreeCanvas>
      </Suspense>

      <AbsoluteFill
        style={{
          background:
            'linear-gradient(115deg, transparent 38%, rgba(255,205,150,.10) 46%, transparent 56%), radial-gradient(900px 520px at 80% 4%, rgba(255,190,120,.22), transparent 62%), radial-gradient(1200px 800px at 50% 55%, transparent 42%, rgba(0,0,0,.70) 100%)',
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 280px 90px rgba(0,0,0,.85)', pointerEvents: 'none'}} />

      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 84,
          opacity: hookIn * hookOut,
          fontFamily: FONT,
          color: 'rgba(255,255,255,0.92)',
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: 1,
          textShadow: '0 2px 24px rgba(0,0,0,.85)',
        }}
      >
        文件、Git、任务、侧聊，全散在桌面上。
      </div>

      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 84,
          opacity: midIn * midOut,
          fontFamily: FONT,
          color: 'rgba(255,255,255,0.94)',
          fontSize: 34,
          fontWeight: 600,
          letterSpacing: 0.5,
          textShadow: '0 2px 24px rgba(0,0,0,.85)',
        }}
      >
        装一个侧栏，把散落的都收回来。
      </div>

      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 76,
          opacity: overlayIn,
          transform: `translateY(${(1 - overlayIn) * 18}px)`,
        }}
      >
        <img src={staticFile('brand/dsh-wordmark-white.svg')} style={{width: 300, height: 'auto', opacity: 0.92, display: 'block'}} />
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT,
            fontSize: 92,
            fontWeight: 700,
            color: '#f5f7fb',
            letterSpacing: -1.5,
            lineHeight: 1,
          }}
        >
          Better Sidebar
        </div>
        <div style={{marginTop: 14, fontFamily: FONT, fontSize: 30, color: 'rgba(255,255,255,0.62)'}}>
          一个侧边栏，装下整个开发工作台。
        </div>
        <div
          style={{
            marginTop: 22,
            display: 'inline-block',
            padding: '14px 20px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.04)',
            fontFamily: MONO,
            fontSize: 22,
            color: 'rgba(255,255,255,0.82)',
          }}
        >
          <span style={{color: CYAN}}>$</span> dsh plugin --profile web add dsh-better-sidebar
        </div>
      </div>

      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('proof/grain.png')})`,
          backgroundSize: '540px 540px',
          opacity: 0.08,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill style={{backgroundColor: BG, opacity: fadeIn, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
