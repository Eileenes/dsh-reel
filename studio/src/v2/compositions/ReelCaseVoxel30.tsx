/**
 * ReelCaseVoxel30 — 30s Better Sidebar film in the original Soren/voxel-whale form:
 * dark blue DSH stage, voxel whale, DSH window, market search/install, four real
 * feature screenshots, end card with the official wordmark + install command.
 *
 * 900 frames @30fps = 30.0s.
 */

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../tokens';
import {S1Hook, S2Hatch} from '../scenes/hero/HeroScenes';
import {C3MarketOpen, C4Search, C5Install} from '../scenes/case-market/CaseMarketScenes';
import {C7Features, C8Workbench} from '../scenes/case-features/CaseFeatureScenes';
import {C7Outro} from '../scenes/case30/OutroScene';

const CUTS: Array<[number, number]> = [
  [90, 0.16],
  [210, 0.18],
  [270, 0.15],
  [420, 0.16],
  [510, 0.14],
  [630, 0.16],
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

const TopLine: React.FC = () => (
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

const CASE_HOOK = {
  termTitle: 'better-sidebar — zsh — 120×32',
  hook: '你的 DSH 侧边栏，还只是个文件列表？',
  eyebrow: 'DSH PLUGIN · BETTER SIDEBAR',
};

const SCENES = [
  {from: 0, duration: 90, name: 'c1-hook', Comp: () => <S1Hook {...CASE_HOOK} />},
  {from: 90, duration: 120, name: 'c2-whale', Comp: () => <S2Hatch />},
  {from: 210, duration: 60, name: 'c3-market', Comp: () => <C3MarketOpen />},
  {from: 270, duration: 150, name: 'c4-search', Comp: () => <C4Search />},
  {from: 420, duration: 90, name: 'c5-install', Comp: () => <C5Install />},
  {from: 510, duration: 120, name: 'c6-features', Comp: () => <C7Features />},
  {from: 630, duration: 90, name: 'c7-workbench', Comp: () => <C8Workbench />},
  {from: 720, duration: 180, name: 'c8-outro', Comp: () => <C7Outro />},
];

const OVERLAP = 10;

const SceneFadeIn: React.FC<{children: React.ReactNode; fade: boolean}> = ({children, fade}) => {
  const frame = useCurrentFrame();
  const o = fade ? Math.min(1, frame / OVERLAP) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const ReelCaseVoxel30: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <Audio src={staticFile('audio/v2/preview-mix-casevoxel30.mp3')} />

    {SCENES.map(({from, duration, name, Comp}, i) => (
      <Sequence
        key={name}
        from={from}
        durationInFrames={duration + (i < SCENES.length - 1 ? OVERLAP : 0)}
        name={name}
      >
        <SceneFadeIn fade={i > 0}>
          <Comp />
        </SceneFadeIn>
      </Sequence>
    ))}

    <TopLine />
    <CutFlash />
  </AbsoluteFill>
);
