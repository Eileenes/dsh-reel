import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {WhaleVoxel} from '../../whale/WhaleVoxel';

const Look: React.FC = () => {
  const {camera} = useThree();
  camera.lookAt(new THREE.Vector3(0, 0.08, 0));
  camera.updateProjectionMatrix();
  return null;
};

/** Transparent, larger render of the voxel whale for 2D sprite use. */
export const WhaleSpriteComp: React.FC = () => (
  <AbsoluteFill style={{background: 'transparent'}}>
    <ThreeCanvas
      width={1200}
      height={800}
      shadows={false}
      camera={{fov: 26, near: 0.1, far: 40, position: [2.1, 1.1, 5.6]}}
      gl={{antialias: true, alpha: true}}
      style={{background: 'transparent'}}
    >
      <Look />
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 6, 5]} intensity={3.4} color="#ffffff" />
      <pointLight position={[-4, 2, 3]} intensity={22} color="#7aa2ff" />
      <pointLight position={[2, 4, -3]} intensity={12} color="#9cf6ff" />
      <group position={[0, -0.85, 0]} scale={0.95}>
        <WhaleVoxel cursorWorld={[0, 0, 0]} time={0} idle spout={false} />
      </group>
    </ThreeCanvas>
  </AbsoluteFill>
);
