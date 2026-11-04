/**
 * 3D app-dock scene (5–9s): low camera, row of 3D app tiles, whale jumps onto the
 * DSH tile, tile presses, DSH window rises from above the tiles, whale hops onto
 * the window's top-right corner and looks around.
 */

import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {WhaleVoxel} from '../../whale/WhaleVoxel';

const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a || 1)));

const camAt = (f: number) => {
  const k1 = smooth(seg(f, 0, 48));
  const k2 = smooth(seg(f, 48, 82));
  const k3 = smooth(seg(f, 82, 110));
  // pos: start low/far -> press -> crane -> window push
  const p: [number, number, number] = [
    0,
    1.9 + 1.0 * k1 + 1.4 * k2 + 0.2 * k3,
    12.5 - 2.5 * k1 - 2.0 * k2 + 2.0 * k3,
  ];
  const l: [number, number, number] = [0, 1.1 + 1.0 * k1 + 1.5 * k2 + 0.7 * k3, 0];
  return {p, l};
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

const shadowTex = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.65)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.28)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  return t;
})();

const Tile: React.FC<{x: number; tex?: THREE.Texture; color?: string; press: number; z?: number}> = ({x, tex, color, press, z = 0}) => (
  <group position={[x, 1.0 - 0.08 * press, z]}>
    <mesh>
      <planeGeometry args={[2.0, 2.0]} />
      <meshBasicMaterial color={color ?? '#ffffff'} transparent opacity={0.16} />
    </mesh>
    <mesh position={[0, 0, 0.02]}>
      <planeGeometry args={[2.0, 2.0]} />
      {tex ? <meshBasicMaterial map={tex} transparent /> : <meshBasicMaterial color={color ?? '#1a2333'} />}
    </mesh>
    {/* glow on press */}
    <mesh position={[0, 0, -0.01]}>
      <planeGeometry args={[2.5, 2.5]} />
      <meshBasicMaterial color="#4d8dff" transparent opacity={0.35 * press} />
    </mesh>
  </group>
);

const DockScene: React.FC = () => {
  const f = useCurrentFrame();
  const dsh = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-dsh.png'));
  const i0 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-0.png'));
  const i1 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-1.png'));
  const i2 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-2.png'));
  const i3 = useLoader(THREE.TextureLoader, staticFile('shots/dock/icon-3.png'));
  const win = useLoader(THREE.TextureLoader, staticFile('shots/dsh-main-clean.png'));

  // textures: DSH plate is white, keep as is
  const tiles = useMemo(() => [i0, i1, i2, i3], [i0, i1, i2, i3]);

  const press = smooth(seg(f, 40, 46)) * (1 - smooth(seg(f, 54, 62)));
  const winK = smooth(seg(f, 48, 80));
  const iconFade = 1 - 0.55 * smooth(seg(f, 78, 100));

  // whale path
  const p1 = smooth(seg(f, 6, 38));
  const p2 = smooth(seg(f, 74, 96));
  const start: [number, number, number] = [-5.2, 1.9, 1.4];
  const onTile: [number, number, number] = [0, 2.15, 0.75];
  const onWindow: [number, number, number] = [4.7, 7.15, 0.5];
  const x = start[0] + (onTile[0] - start[0]) * p1 + (onWindow[0] - onTile[0]) * p2;
  const y = start[1] + (onTile[1] - start[1]) * p1 + (onWindow[1] - onTile[1]) * p2 + Math.sin(Math.PI * p1) * 1.1 + Math.sin(Math.PI * p2) * 1.4;
  const z = start[2] + (onTile[2] - start[2]) * p1 + (onWindow[2] - onTile[2]) * p2;
  const look = f > 104 ? Math.sin((f - 104) / 8) * 0.35 : 0;
  const whaleScale = 0.62;

  return (
    <>
      <color attach="background" args={['#050b16']} />
      <fog attach="fog" args={['#050b16', 18, 34]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 8, 6]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-5, 3, 4]} intensity={30} color="#4d8dff" distance={16} />
      <pointLight position={[5, 4, 4]} intensity={22} color="#9cf6ff" distance={16} />
      <CamRig />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#07101f" roughness={0.55} metalness={0.35} />
      </mesh>
      <gridHelper args={[40, 40, '#1b3f7a', '#0d1c33']} position={[0, 0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* icons */}
      <group position={[0, -0.9 * smooth(seg(f, 78, 104)), 2.2]}>
        <Tile x={-5} tex={tiles[0]} press={0} />
        <Tile x={-2.5} tex={tiles[1]} press={0} />
        <Tile x={0} tex={dsh} press={press} />
        <Tile x={2.5} tex={tiles[2]} press={0} />
        <Tile x={5} tex={tiles[3]} press={0} />
      </group>

      {/* DSH window plane rising behind the tiles */}
      <group position={[0, 1.0 + 3.2 * winK, -0.6]} scale={[0.18 + 0.82 * winK, 0.18 + 0.82 * winK, 1]}>
        <mesh>
          <planeGeometry args={[12.0, 6.75]} />
          <meshBasicMaterial map={win} transparent opacity={winK} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[12.2, 6.95]} />
          <meshBasicMaterial color="#4d8dff" transparent opacity={0.35 * winK} />
        </mesh>
      </group>

      {/* whale */}
      <group position={[x, y, z]} scale={whaleScale} rotation={[0, look, 0]}>
        <WhaleVoxel cursorWorld={[0, 0, 0]} time={0} idle spout={false} />
      </group>
      {/* contact shadow under whale */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* dust/ring on icon press */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 2.2]}>
        <ringGeometry args={[1.2, 1.35, 48]} />
        <meshBasicMaterial color="#8fc8ff" transparent opacity={0.55 * press} />
      </mesh>
    </>
  );
};

export const StoryDock3D: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#050b16'}}>
    <ThreeCanvas width={1920} height={1080} camera={{fov: 38, position: [0, 1.9, 12.5], near: 0.1, far: 80}} gl={{antialias: true}} style={{background: '#050b16'}}>
      <DockScene />
    </ThreeCanvas>
  </AbsoluteFill>
);
