/**
 * v2 Remotion entry — the film + poster/cover compositions.
 * Render:
 *   node_modules/.bin/remotion render src/v2/entry.tsx ReelPromo out/reel-promo.mp4 --codec h264 --crf 16 --gl=angle
 *   node_modules/.bin/remotion still  src/v2/entry.tsx ReelPromo out/reel-frame.png --frame=300 --gl=angle
 *
 * Composition durations come from the timeline data so timing changes only happen
 * in one place (data/*-timeline.ts), not here.
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
import {ReelCaseStory30} from './compositions/ReelCaseStory30';
import {ReelGuizang} from './compositions/ReelGuizang';
import {WhaleSpriteComp} from './scenes/casevoxel/WhaleSpriteComp';
import {Boot550C} from '../boot550c/Boot550C';
import {FPS, TOTAL_FRAMES as PROMO_FRAMES} from './data/timeline';
import {TOTAL_FRAMES as CASE_FRAMES} from './data/case-timeline';
import {TOTAL_FRAMES as CASE30_FRAMES} from './data/case30-timeline';
import {TOTAL_FRAMES as VOXEL30_FRAMES} from './data/casevoxel30-timeline';
import {TOTAL_FRAMES as VOXELREAL30_FRAMES} from './data/casevoxelreal30-timeline';
import {TOTAL_FRAMES as STORY30_FRAMES} from './data/story30-timeline';
import {TOTAL_FRAMES as GUIZANG_FRAMES} from './data/guizang-timeline';
import {PROOF_FRAMES as PROOF15_FRAMES} from './scenes/proof/proof-timeline';
import {PROOF_FRAMES as PROOF30_FRAMES} from './scenes/proof/proof30-timeline';
import {VIDEO} from './tokens';

const V2Root: React.FC = () => (
  <>
    <Composition
      id="Boot550C"
      component={Boot550C}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="ReelPromo"
      component={ReelPromo}
      durationInFrames={PROMO_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ReelCase"
      component={ReelCase}
      durationInFrames={CASE_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ReelGuizang"
      component={ReelGuizang}
      durationInFrames={GUIZANG_FRAMES}
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
      id="ReelCaseStory30"
      component={ReelCaseStory30}
      durationInFrames={STORY30_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="ReelCaseVoxelReal30"
      component={ReelCaseVoxelReal30}
      durationInFrames={VOXELREAL30_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ReelCaseVoxel30"
      component={ReelCaseVoxel30}
      durationInFrames={VOXEL30_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ProofStory30"
      component={ProofStory30Comp}
      durationInFrames={PROOF30_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ProofMini"
      component={ProofMiniComp}
      durationInFrames={PROOF15_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ReelCase30"
      component={ReelCase30}
      durationInFrames={CASE30_FRAMES}
      fps={FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);

registerRoot(V2Root);
