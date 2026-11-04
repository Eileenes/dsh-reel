/**
 * ReelCaseVoxelReal30 — 30s Better Sidebar film in the Soren/voxel form, but the
 * DSH interfaces are the user's actual screenshots:
 *   1) real DSH main window (voxel-whale hero scene + plugins entry close-up)
 *   2) official 「添加插件」 dialog (install step)
 * followed by real DSH sidebar screenshots for the feature proof, official end card.
 */

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../tokens';
import {S1Hook, S2Hatch} from '../scenes/hero/HeroScenes';
import {C3OpenPlugins, C3AddPlugin} from '../scenes/casevoxel/RealUIScenes';
import {C7Features, C8Workbench} from '../scenes/case-features/CaseFeatureScenes';
import {C7Outro} from '../scenes/case30/OutroScene';

const CUTS: Array<[number, number]> = [
  [90, 0.15],
  [210, 0.16],
  [340, 0.3],
  [540, 0.3],
  [680, 0.18],
  [770, 0.16],
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
  {from: 90, duration: 120, name: 'c2-whale-real-dsh', Comp: () => <S2Hatch />},
  {from: 210, duration: 130, name: 'c3-open-plugins', Comp: () => <C3OpenPlugins />},
  {from: 340, duration: 200, name: 'c4-add-plugin', Comp: () => <C3AddPlugin />},
  {from: 540, duration: 140, name: 'c5-features', Comp: () => <C7Features />},
  {from: 680, duration: 90, name: 'c6-workbench', Comp: () => <C8Workbench />},
  {from: 770, duration: 130, name: 'c7-outro', Comp: () => <C7Outro />},
];

const OVERLAP = 10;

const SceneFadeIn: React.FC<{children: React.ReactNode; fade: boolean}> = ({children, fade}) => {
  const frame = useCurrentFrame();
  const o = fade ? Math.min(1, frame / OVERLAP) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const ReelCaseVoxelReal30: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <Audio src={staticFile('audio/v2/preview-mix-casevoxelreal30.mp3')} />

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
