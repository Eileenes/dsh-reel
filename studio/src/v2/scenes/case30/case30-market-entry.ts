/**
 * Independent preview entry for the CASE30 official-plugins scenes (C3 / C4).
 * The 30s edit list is compositions/ReelCase30.tsx — do not modify it here.
 *
 *   cd studio
 *   node_modules/.bin/remotion still src/v2/scenes/case30/case30-market-entry.ts Case30Market4 out/case30-market-c4-f0120.png --frame=120
 *
 * Kept as .ts (not .tsx): no JSX here.
 */

import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {C3PluginsPage, C4Install} from './OfficialMarketScenes';

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

const Case30MarketRoot: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    comp('Case30Market3', C3PluginsPage, 90),
    comp('Case30Market4', C4Install, 150)
  );

registerRoot(Case30MarketRoot);
