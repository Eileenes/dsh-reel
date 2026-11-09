/**
 * ReelCaseStory30 — 30s story cut per the user's revised narrative:
 *   0–5s   terminal types dsh → pixel whale appears → spout → terminal closes
 *   5–9s   app dock → whale jumps onto the DSH app icon → DSH opens → looks around
 *   9–12s  whale jumps onto the whale plugin button → plugin page opens
 *   12–16s whale types better-sidebar → result card
 *   16–21s plugin features
 *   21–25s real sidebar/workbench
 *   25–30s end card
 *
 * The edit shell lives in kit/film.tsx; this film keeps its own animated progress line.
 */

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TOTAL_FRAMES} from '../data/story30-timeline';
import {Film, type FilmScene, type FilmSceneMap} from '../kit/film';
import {S1Hook} from '../scenes/hero/HeroScenes';
import {StoryDock, StoryWhaleButton, StorySearch} from '../scenes/story/StoryScenes';
import {C7Features, C8Workbench} from '../scenes/case-features/CaseFeatureScenes';
import {C7Outro} from '../scenes/case30/OutroScene';

const OVERLAP = 10;

const CASE_HOOK = {
  typed: 'dsh',
  termTitle: 'better-sidebar — zsh — 120×32',
  hook: '你的 DSH 侧边栏，还只是个文件列表？',
  eyebrow: 'DSH PLUGIN · BETTER SIDEBAR',
};

const SCENES: FilmScene[] = [
  {id: 'c1-terminal-whale', from: 0, duration: 150, title: 'terminal-whale'},
  {id: 'c2-dock-dsh', from: 150, duration: 120, title: 'dock-dsh'},
  {id: 'c3-whale-button', from: 270, duration: 90, title: 'whale-button'},
  {id: 'c4-search', from: 360, duration: 120, title: 'search'},
  {id: 'c5-features', from: 480, duration: 150, title: 'features'},
  {id: 'c6-workbench', from: 630, duration: 120, title: 'workbench'},
  {id: 'c7-outro', from: 750, duration: 150, title: 'outro'},
];

const SCENE_MAP: FilmSceneMap = {
  'c1-terminal-whale': () => <S1Hook whale {...CASE_HOOK} />,
  'c2-dock-dsh': StoryDock,
  'c3-whale-button': StoryWhaleButton,
  'c4-search': StorySearch,
  'c5-features': C7Features,
  'c6-workbench': C8Workbench,
  'c7-outro': C7Outro,
};

/** Progress hairline unique to this story cut. */
const StoryProgressLine: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          top: 54,
          height: 1,
          background: 'rgba(150,190,255,0.16)',
        }}
      >
        <div
          style={{
            width: `${(frame / TOTAL_FRAMES) * 100}%`,
            height: '100%',
            background: 'rgba(120,246,255,0.55)',
            boxShadow: '0 0 12px rgba(120,246,255,0.6)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const ReelCaseStory30: React.FC = () => (
  <>
    <Film
      scenes={SCENES}
      sceneMap={SCENE_MAP}
      audio="audio/v2/preview-mix-story30.mp3"
      overlap={OVERLAP}
      showTopLine={false}
    />
    <StoryProgressLine />
  </>
);
