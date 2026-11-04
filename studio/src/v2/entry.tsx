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
      id="ProofMini"
      component={ProofMiniComp}
      durationInFrames={240}
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
