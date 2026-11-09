/**
 * ReelCaseVoxelReal30 — 30s Better Sidebar film in the Soren/voxel form, but the
 * DSH interfaces are the user's actual screenshots:
 *   1) real DSH main window (voxel-whale hero scene + plugins entry close-up)
 *   2) official 「添加插件」 dialog (install step)
 * followed by real DSH sidebar screenshots for the feature proof, official end card.
 *
 * The edit shell lives in kit/film.tsx.
 */

import {makeReel, type Cut, type FilmScene, type FilmSceneMap} from '../kit/film';
import {S1Hook, S2Hatch} from '../scenes/hero/HeroScenes';
import {C3OpenPlugins, C4SearchInstall} from '../scenes/casevoxel/RealUIScenes';
import {C7Features, C8Workbench} from '../scenes/case-features/CaseFeatureScenes';
import {C7Outro} from '../scenes/case30/OutroScene';

const CUTS: Cut[] = [
  [90, 0.15],
  [178, 0.0],
  [300, 0.0],
  [580, 0.24],
  [710, 0.16],
  [780, 0.15],
];

const CASE_HOOK = {
  termTitle: 'better-sidebar — zsh — 120×32',
  hook: '你的 DSH 侧边栏，还只是个文件列表？',
  eyebrow: 'DSH PLUGIN · BETTER SIDEBAR',
};

const SCENES: FilmScene[] = [
  {id: 'c1-hook', from: 0, duration: 90, title: 'hook'},
  {id: 'c2-whale-real-dsh', from: 90, duration: 88, title: 'whale-real-dsh'},
  {id: 'c3-open-plugins', from: 178, duration: 122, title: 'open-plugins'},
  {id: 'c4-search-install', from: 300, duration: 280, title: 'search-install'},
  {id: 'c5-features', from: 580, duration: 130, title: 'features'},
  {id: 'c6-workbench', from: 710, duration: 70, title: 'workbench'},
  {id: 'c7-outro', from: 780, duration: 120, title: 'outro'},
];

const SCENE_MAP: FilmSceneMap = {
  'c1-hook': () => <S1Hook {...CASE_HOOK} />,
  'c2-whale-real-dsh': () => <S2Hatch termTitle={CASE_HOOK.termTitle} />,
  'c3-open-plugins': C3OpenPlugins,
  'c4-search-install': C4SearchInstall,
  'c5-features': C7Features,
  'c6-workbench': C8Workbench,
  'c7-outro': C7Outro,
};

export const ReelCaseVoxelReal30 = makeReel({
  scenes: SCENES,
  sceneMap: SCENE_MAP,
  audio: 'audio/v2/preview-mix-casevoxelreal30.mp3',
  cuts: CUTS,
  overlap: 10,
});
