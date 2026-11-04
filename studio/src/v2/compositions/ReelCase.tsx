/**
 * ReelCase — 24s promo film for another DSH plugin (Better Sidebar), rendered with
 * the same v2 campaign system as the dsh-reel film. Used as a "can the system be
 * retargeted?" demo; the story is plugin-specific, the visual system is shared.
 *
 * Scene boundaries are identical to the dsh-reel film (see data/case-timeline.ts).
 */

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../tokens';
import {CASE_SCENES} from '../data/case-timeline';
import {S1Hook, S2Hatch} from '../scenes/hero/HeroScenes';
import {C3MarketOpen, C4Search, C5Install} from '../scenes/case-market/CaseMarketScenes';
import {C6SidebarOpen, C7Features, C8Workbench, C9Outro} from '../scenes/case-features/CaseFeatureScenes';

const CUTS: Array<[number, number]> = [
  [156, 0.2],
  [348, 0.14],
  [426, 0.11],
  [462, 0.09],
  [588, 0.17],
  [660, 0.15],
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

const Finish: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.blue}66, ${COLORS.mint}44, transparent)`,
        opacity: 0.5,
      }}
    />
  </AbsoluteFill>
);

/** Case-specific copy injected into the shared 3D hook scene. */
const CASE_HOOK = {
  termTitle: 'better-sidebar — zsh — 120×32',
  hook: '你的 DSH 侧边栏，还只是个文件列表？',
  eyebrow: 'DSH PLUGIN · BETTER SIDEBAR',
};

export const ReelCase: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <Audio src={staticFile('audio/v2/preview-mix-case.mp3')} />

      <Sequence from={0} durationInFrames={78} name="c1-hook">
        <S1Hook {...CASE_HOOK} />
      </Sequence>
      <Sequence from={78} durationInFrames={78} name="c2-hatch">
        <S2Hatch />
      </Sequence>
      <Sequence from={156} durationInFrames={72} name="c3-market">
        <C3MarketOpen />
      </Sequence>
      <Sequence from={228} durationInFrames={120} name="c4-search">
        <C4Search />
      </Sequence>
      <Sequence from={348} durationInFrames={78} name="c5-install">
        <C5Install />
      </Sequence>
      <Sequence from={426} durationInFrames={36} name="c6-sidebar">
        <C6SidebarOpen />
      </Sequence>
      <Sequence from={462} durationInFrames={126} name="c7-features">
        <C7Features />
      </Sequence>
      <Sequence from={588} durationInFrames={72} name="c8-workbench">
        <C8Workbench />
      </Sequence>
      <Sequence from={660} durationInFrames={60} name="c9-outro">
        <C9Outro />
      </Sequence>

      <Finish />
      <CutFlash />
    </AbsoluteFill>
  );
};
