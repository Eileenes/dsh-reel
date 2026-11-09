/**
 * ReelCaseVoxel30 — 30s Better Sidebar film in the original Soren/voxel-whale form:
 * dark blue DSH stage, voxel whale, DSH window, market search/install, four real
 * feature screenshots, end card with the official wordmark + install command.
 *
 * 900 frames @30fps = 30.0s. The edit shell lives in kit/film.tsx.
 */

import {makeReel, type Cut, type FilmScene, type FilmSceneMap} from '../kit/film';
import {S1Hook, S2Hatch} from '../scenes/hero/HeroScenes';
import {C3MarketOpen, C4Search, C5Install} from '../scenes/case-market/CaseMarketScenes';
import {C7Features, C8Workbench} from '../scenes/case-features/CaseFeatureScenes';
import {C7Outro} from '../scenes/case30/OutroScene';

const CUTS: Cut[] = [
  [90, 0.16],
  [210, 0.18],
  [270, 0.15],
  [420, 0.16],
  [510, 0.14],
  [630, 0.16],
  [720, 0.15],
];

const CASE_HOOK = {
  termTitle: 'better-sidebar — zsh — 120×32',
  hook: '你的 DSH 侧边栏，还只是个文件列表？',
  eyebrow: 'DSH PLUGIN · BETTER SIDEBAR',
};

const SCENES: FilmScene[] = [
  {id: 'c1-hook', from: 0, duration: 90, title: 'hook'},
  {id: 'c2-whale', from: 90, duration: 120, title: 'whale'},
  {id: 'c3-market', from: 210, duration: 60, title: 'market'},
  {id: 'c4-search', from: 270, duration: 150, title: 'search'},
  {id: 'c5-install', from: 420, duration: 90, title: 'install'},
  {id: 'c6-features', from: 510, duration: 120, title: 'features'},
  {id: 'c7-workbench', from: 630, duration: 90, title: 'workbench'},
  {id: 'c8-outro', from: 720, duration: 180, title: 'outro'},
];

const SCENE_MAP: FilmSceneMap = {
  'c1-hook': () => <S1Hook {...CASE_HOOK} />,
  'c2-whale': () => <S2Hatch termTitle={CASE_HOOK.termTitle} />,
  'c3-market': C3MarketOpen,
  'c4-search': C4Search,
  'c5-install': C5Install,
  'c6-features': C7Features,
  'c7-workbench': C8Workbench,
  'c8-outro': C7Outro,
};

export const ReelCaseVoxel30 = makeReel({
  scenes: SCENES,
  sceneMap: SCENE_MAP,
  audio: 'audio/v2/preview-mix-casevoxel30.mp3',
  cuts: CUTS,
  overlap: 10,
});
