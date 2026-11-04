/**
 * ReelCase30 — 30.0s Better Sidebar promo with official DSH brand + official plugins UI.
 *
 * Hard cap: 900 frames (30.0s @30fps). The final frames hold on the plugin name and
 * install command (see C7Outro).
 */

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../tokens';
import {CASE30_SCENES} from '../data/case30-timeline';
import {C1Hook, C2Reveal} from '../scenes/case30/HeroScenes30';
import {C3PluginsPage, C4Install} from '../scenes/case30/OfficialMarketScenes';
import {C7Outro} from '../scenes/case30/OutroScene';
import {C7Features} from '../scenes/case-features/CaseFeatureScenes';
import {C8Workbench} from '../scenes/case-features/CaseFeatureScenes';

const CUTS: Array<[number, number]> = [
  [90, 0.16],
  [210, 0.2],
  [300, 0.12],
  [450, 0.18],
  [570, 0.16],
  [720, 0.15],
];

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let k = 0;
  for (const [cut, amp] of CUTS) {
    const d = frame - cut;
    if (d >= 0 && d < 6) k = Math.max(k, (1 - d / 6) * amp);
  }
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 46%, #FFFFFF 0%, ${COLORS.blue2} 28%, ${COLORS.blue}44 62%, transparent 100%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

const FRAME_LINES: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.blue}66, ${COLORS.mint}44, transparent)`,
        opacity: 0.45,
      }}
    />
  </AbsoluteFill>
);

const OVERLAP = 12;

const SceneFade: React.FC<{children: React.ReactNode; fade: boolean}> = ({children, fade}) => {
  const frame = useCurrentFrame();
  const o = fade ? Math.min(1, frame / OVERLAP) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const SCENES: Array<{from: number; duration: number; name: string; Comp: React.FC}> = [
  {from: 0, duration: 90, name: 'c1-hook', Comp: C1Hook},
  {from: 90, duration: 120, name: 'c2-reveal', Comp: C2Reveal},
  {from: 210, duration: 90, name: 'c3-official-plugins', Comp: C3PluginsPage},
  {from: 300, duration: 150, name: 'c4-search-install', Comp: C4Install},
  {from: 450, duration: 120, name: 'c5-sidebar', Comp: C8Workbench},
  {from: 570, duration: 150, name: 'c6-features', Comp: C7Features},
  {from: 720, duration: 180, name: 'c7-outro', Comp: C7Outro},
];

export const ReelCase30: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <Audio src={staticFile('audio/v2/preview-mix-case30.mp3')} />

    {SCENES.map(({from, duration, name, Comp}, i) => (
      <Sequence
        key={name}
        from={from}
        durationInFrames={duration + (i < SCENES.length - 1 ? OVERLAP : 0)}
        name={name}
      >
        <SceneFade fade={i > 0}>
          <Comp />
        </SceneFade>
      </Sequence>
    ))}

    <FRAME_LINES />
    <CutFlash />
  </AbsoluteFill>
);
