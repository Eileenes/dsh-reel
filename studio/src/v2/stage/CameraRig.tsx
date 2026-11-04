/**
 * CameraRig — 每帧把 three 相机摆到指定机位（必须渲染在 <ThreeCanvas> 子树里）。
 *
 * 用 useLayoutEffect（而不是 useFrame 累计），保证 Remotion 逐帧确定性渲染：
 * 场景把自己的（帧 → 机位）纯函数结果传进来，Rig 只负责 apply。
 */

import React, {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

export type CameraPose = {
  p: readonly [number, number, number];
  l: readonly [number, number, number];
  fov: number;
};

export const CameraRig: React.FC<CameraPose> = ({p, l, fov}) => {
  const {camera} = useThree();

  useLayoutEffect(() => {
    camera.position.set(p[0], p[1], p[2]);
    const persp = camera as THREE.PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }
    camera.lookAt(l[0], l[1], l[2]);
    camera.updateMatrixWorld();
  }, [camera, p[0], p[1], p[2], l[0], l[1], l[2], fov]);

  return null;
};
