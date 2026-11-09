/**
 * ReelCase30 — 30.0s Better Sidebar promo with official DSH brand + official plugins UI.
 *
 * Hard cap: 900 frames (30.0s @30fps). The final frames hold on the plugin name and
 * install command (see C7Outro). Scene timings live in data/case30-timeline.ts.
 */

import {CASE30_CUTS, CASE30_SCENES} from '../data/case30-timeline';
import {makeReel, type FilmSceneMap} from '../kit/film';
import {C1Hook, C2Reveal} from '../scenes/case30/HeroScenes30';
import {C3PluginsPage, C4Install} from '../scenes/case30/OfficialMarketScenes';
import {C7Outro} from '../scenes/case30/OutroScene';
import {C7Features, C8Workbench} from '../scenes/case-features/CaseFeatureScenes';

/** 12-frame cross-fade between scenes (matches the legacy hand-written edit). */
const OVERLAP = 12;

const SCENE_MAP: FilmSceneMap = {
  C1: C1Hook,
  C2: C2Reveal,
  C3: C3PluginsPage,
  C4: C4Install,
  C5: C8Workbench,
  C6: C7Features,
  C7: C7Outro,
};

export const ReelCase30 = makeReel({
  scenes: CASE30_SCENES,
  sceneMap: SCENE_MAP,
  audio: 'audio/v2/preview-mix-case30.mp3',
  cuts: CASE30_CUTS,
  overlap: OVERLAP,
  topLineOpacity: 0.45,
});
