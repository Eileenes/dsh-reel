/**
 * v2 Remotion entry — the film + (later) poster/cover compositions.
 * Render:
 *   node_modules/.bin/remotion render src/v2/entry.ts ReelPromo out/reel-promo.mp4 --codec h264 --crf 16 --gl=angle
 *   node_modules/.bin/remotion still  src/v2/entry.ts ReelPromo out/reel-frame.png --frame=300 --gl=angle
 */

import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ReelPromo} from './compositions/ReelPromo';
import {ReelCase} from './compositions/ReelCase';
import {ReelCase30} from './compositions/ReelCase30';
import {ProofMiniComp} from './compositions/ProofMiniComp';
import {ProofStory30Comp} from './compositions/ProofStory30Comp';
import {ReelCaseVoxel30} from './compositions/ReelCaseVoxel30';
import {ReelCaseVoxelReal30} from './compositions/ReelCaseVoxelReal30';
import {WhaleSpriteComp} from './scenes/casevoxel/WhaleSpriteComp';
import {TOTAL_FRAMES, FPS} from './data/timeline';
import {VIDEO} from './tokens';

const V2Root: React.FC = () => (
  <>
    <Composition
      id="ReelPromo"
      component={ReelPromo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ReelCase"
      component={ReelCase}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="WhaleSprite"
      component={WhaleSpriteComp}
      durationInFrames={1}
      fps={FPS}
      width={1200}
      height={800}
    />
    <Composition
      id="ReelCaseVoxelReal30"
      component={ReelCaseVoxelReal30}
      durationInFrames={900}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ReelCaseVoxel30"
      component={ReelCaseVoxel30}
      durationInFrames={900}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ProofStory30"
      component={ProofStory30Comp}
      durationInFrames={900}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ProofMini"
      component={ProofMiniComp}
      durationInFrames={450}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ReelCase30"
      component={ReelCase30}
      durationInFrames={900}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);

registerRoot(V2Root);
