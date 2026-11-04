/**
 * Independent preview entry for the P2 market scenes (S3/S4/S5).
 * The real edit list is compositions/ReelPromo.tsx — this entry exists only to
 * render the three market scenes in isolation while they are being tuned.
 *
 *   cd studio
 *   node_modules/.bin/remotion still src/v2/scenes/market/entry.ts Market3 out/market-s3-f0060.png --frame=60
 *
 * NOTE: kept as .ts (not .tsx) → no JSX here.
 */

import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {S3MarketOpen, S4Search, S5Install} from './MarketScenes';

const comp = (
  id: string,
  component: React.FC,
  durationInFrames: number
): React.ReactElement =>
  React.createElement(Composition, {
    id,
    component,
    durationInFrames,
    fps: 30,
    width: 1920,
    height: 1080,
  });

const MarketScenesRoot: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    comp('Market3', S3MarketOpen, 72),
    comp('Market4', S4Search, 120),
    comp('Market5', S5Install, 78)
  );

registerRoot(MarketScenesRoot);
