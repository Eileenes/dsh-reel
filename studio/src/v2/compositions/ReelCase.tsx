/**
 * ReelCase — 24s promo film for another DSH plugin (Better Sidebar), rendered with
 * the same v2 campaign system as the dsh-reel film. Used as a "can the system be
 * retargeted?" demo; the story is plugin-specific, the visual system is shared.
 *
 * Scene boundaries live in data/case-timeline.ts; the edit shell is kit/film.tsx.
 */

import {CASE_CUTS, CASE_SCENES} from '../data/case-timeline';
import {makeReel, type FilmSceneMap} from '../kit/film';
import {S1Hook, S2Hatch} from '../scenes/hero/HeroScenes';
import {C3MarketOpen, C4Search, C5Install} from '../scenes/case-market/CaseMarketScenes';
import {C6SidebarOpen, C7Features, C8Workbench, C9Outro} from '../scenes/case-features/CaseFeatureScenes';

/** Case-specific copy injected into the shared hook / hatch scenes. */
const CASE_HOOK = {
  termTitle: 'better-sidebar — zsh — 120×32',
  hook: '你的 DSH 侧边栏，还只是个文件列表？',
  eyebrow: 'DSH PLUGIN · BETTER SIDEBAR',
};

const SCENE_MAP: FilmSceneMap = {
  S1: () => <S1Hook {...CASE_HOOK} />,
  S2: () => <S2Hatch termTitle={CASE_HOOK.termTitle} />,
  S3: C3MarketOpen,
  S4: C4Search,
  S5: C5Install,
  S6: C6SidebarOpen,
  S7: C7Features,
  S8: C8Workbench,
  S9: C9Outro,
};

export const ReelCase = makeReel({
  scenes: CASE_SCENES,
  sceneMap: SCENE_MAP,
  audio: 'audio/v2/preview-mix-case.mp3',
  cuts: CASE_CUTS,
  topLineOpacity: 0.5,
});
