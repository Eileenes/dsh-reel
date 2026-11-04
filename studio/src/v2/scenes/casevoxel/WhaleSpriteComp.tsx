import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {WhaleVoxel} from '../../whale/WhaleVoxel';

/** Transparent render of the voxel whale for 2D sprite use. */
export const WhaleSpriteComp: React.FC = () => (
  <AbsoluteFill style={{background: 'transparent'}}>
    <ThreeCanvas
      width={700}
      height={700}
      shadows={false}
      camera={{fov: 34, near: 0.1, far: 40, position: [0, 0.2, 5.2]}}
      gl={{antialias: true, alpha: true}}
      style={{background: 'transparent'}}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={2.6} color="#ffffff" />
      <pointLight position={[-4, 2, 3]} intensity={12} color="#8fb4ff" />
      <group position={[0, -0.55, 0]} scale={0.95}>
        <WhaleVoxel cursorWorld={[0, 0, 0]} time={0} idle spout={false} />
      </group>
    </ThreeCanvas>
  </AbsoluteFill>
);
