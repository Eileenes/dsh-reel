/**
 * ReelCaseStory30 — 30s story cut per the user's revised narrative:
 *   0–5s   terminal types dsh → pixel whale appears → spout → terminal closes
 *   5–9s   app dock → whale jumps onto the DSH app icon → DSH opens → looks around
 *   9–12s  whale jumps onto the whale plugin button → plugin page opens
 *   12–16s whale types better-sidebar → result card
 *   16–21s plugin features
 *   21–25s real sidebar/workbench
 *   25–30s end card
 */

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../tokens';
import {S1Hook} from '../scenes/hero/HeroScenes';
import {StoryDock, StoryWhaleButton, StorySearch} from '../scenes/story/StoryScenes';
import {C7Features, C8Workbench} from '../scenes/case-features/CaseFeatureScenes';
import {C7Outro} from '../scenes/case30/OutroScene';

const OVERLAP = 10;

const SCENES = [
  {from: 0, duration: 150, name: 'c1-terminal-whale', Comp: () => <S1Hook whale {...CASE_HOOK} />},
  {from: 150, duration: 120, name: 'c2-dock-dsh', Comp: () => <StoryDock />},
  {from: 270, duration: 90, name: 'c3-whale-button', Comp: () => <StoryWhaleButton />},
  {from: 360, duration: 120, name: 'c4-search', Comp: () => <StorySearch />},
  {from: 480, duration: 150, name: 'c5-features', Comp: () => <C7Features />},
  {from: 630, duration: 120, name: 'c6-workbench', Comp: () => <C8Workbench />},
  {from: 750, duration: 150, name: 'c7-outro', Comp: () => <C7Outro />},
];

const CASE_HOOK = {
  typed: 'dsh',
  termTitle: 'better-sidebar — zsh — 120×32',
  hook: '你的 DSH 侧边栏，还只是个文件列表？',
  eyebrow: 'DSH PLUGIN · BETTER SIDEBAR',
};

const SceneFadeIn: React.FC<{children: React.ReactNode; fade: boolean}> = ({children, fade}) => {
  const frame = useCurrentFrame();
  const o = fade ? Math.min(1, frame / OVERLAP) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const TopLine: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 96, right: 96, top: 54, height: 1, background: 'rgba(150,190,255,0.16)'}}>
      <div style={{width: `${(f / 900) * 100}%`, height: '100%', background: 'rgba(120,246,255,0.55)', boxShadow: '0 0 12px rgba(120,246,255,0.6)'}} />
    </div>
  );
};

export const ReelCaseStory30: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <Audio src={staticFile('audio/v2/preview-mix-story30.mp3')} />
    {SCENES.map(({from, duration, name, Comp}, i) => (
      <Sequence key={name} from={from} durationInFrames={duration + (i < SCENES.length - 1 ? OVERLAP : 0)} name={name}>
        <SceneFadeIn fade={i > 0}>
          <Comp />
        </SceneFadeIn>
      </Sequence>
    ))}
    <TopLine />
  </AbsoluteFill>
);
