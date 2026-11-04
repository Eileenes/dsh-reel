/**
 * Hero scenes 独立预览入口：只注册 P2 成片的 4 个 3D 主角场景。
 *   渲染例：node_modules/.bin/remotion still src/v2/scenes/hero/entry.ts Hero2 out/hero-s2-f60.png --frame=60 --gl=angle
 *
 * 正片由 src/v2/entry.tsx（ReelPromo，720 帧）按 timeline.ts 用 <Sequence> 拼装，
 * 这里只是给每个 2–3s 场景单独出静帧/试片用。
 */

import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {VIDEO} from '../../tokens';
import {S1Hook, S2Hatch, S8Outputs, S9Outro} from './HeroScenes';

const comp = (id: string, component: React.FC, durationInFrames: number) =>
  React.createElement(Composition, {
    id,
    component,
    durationInFrames,
    fps: VIDEO.fps,
    width: VIDEO.width,
    height: VIDEO.height,
  });

const HeroRoot: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    comp('Hero1', S1Hook, 78),
    comp('Hero2', S2Hatch, 78),
    comp('Hero8', S8Outputs, 72),
    comp('Hero9', S9Outro, 60)
  );

registerRoot(HeroRoot);
