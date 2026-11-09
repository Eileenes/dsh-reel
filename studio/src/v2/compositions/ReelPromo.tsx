/**
 * ReelPromo — the 24s / 1920×1080 / 30fps dsh-reel v2 promo film.
 *
 * Scene boundaries + sound anchors live in ../data/timeline.ts; the edit shell
 * (Sequence/overlap/finish chrome) lives in ../kit/film.tsx.
 */

import {CUTS, SCENES} from '../data/timeline';
import {makeReel, type FilmSceneMap} from '../kit/film';
import {S1Hook, S2Hatch, S8Outputs, S9Outro} from '../scenes/hero/HeroScenes';
import {S3MarketOpen, S4Search, S5Install} from '../scenes/market/MarketScenes';
import {S6Handoff, S7Pipeline} from '../scenes/montage/MontageScenes';

const SCENE_MAP: FilmSceneMap = {
  S1: S1Hook,
  S2: S2Hatch,
  S3: S3MarketOpen,
  S4: S4Search,
  S5: S5Install,
  S6: S6Handoff,
  S7: S7Pipeline,
  S8: S8Outputs,
  S9: S9Outro,
};

export const ReelPromo = makeReel({
  scenes: SCENES,
  sceneMap: SCENE_MAP,
  audio: 'audio/v2/preview-mix.mp3',
  cuts: CUTS,
  topLineOpacity: 0.5,
});
