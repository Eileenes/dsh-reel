/**
 * Independent preview entry for the CASE-1 (Better Sidebar) market scenes.
 * Same three beats as scenes/market, but with the case data on MarketUI.
 *
 *   cd studio
 *   node_modules/.bin/remotion still src/v2/scenes/case-market/entry.ts CaseMarket4 out/case-market-c4-f0112.png --frame=112
 *
 * NOTE: kept as .ts (not .tsx) → no JSX here.
 */

import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {C3MarketOpen, C4Search, C5Install} from './CaseMarketScenes';

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

const CaseMarketRoot: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    comp('CaseMarket3', C3MarketOpen, 72),
    comp('CaseMarket4', C4Search, 120),
    comp('CaseMarket5', C5Install, 78)
  );

registerRoot(CaseMarketRoot);
