/**
 * ReelGuizang — 30s / 1920×1080 / 30fps promo for dsh-guizang-design, built on the
 * v0.1 promo method (docs/promo-method-v0.1.md). Scene timings live in
 * data/guizang-timeline.ts; the whole film keeps one DSH window shell in S3–S5 so
 * the interface never switches underneath the viewer.
 */

import React from 'react';
import {GUIZANG_SCENES} from '../data/guizang-timeline';
import {makeReel, type FilmSceneMap} from '../kit/film';
import {
  S1TerminalWhale,
  S2Dock,
  S3PluginTab,
  S4SearchInstall,
  S5Skills,
  S6EndCard,
} from '../scenes/guizang/GuizangScenes';

const SCENE_MAP: FilmSceneMap = {
  S1: S1TerminalWhale,
  S2: S2Dock,
  S3: S3PluginTab,
  S4: S4SearchInstall,
  S5: S5Skills,
  S6: S6EndCard,
};

export const ReelGuizang = makeReel({
  scenes: GUIZANG_SCENES,
  sceneMap: SCENE_MAP,
  audio: 'audio/v2/preview-mix-guizang.mp3',
  showTopLine: false,
});
