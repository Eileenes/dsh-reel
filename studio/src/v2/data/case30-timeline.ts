/**
 * Case 30s timeline — Better Sidebar promo, official DSH UI + official brand.
 * 900 frames @30fps = 30.0s (hard cap: must not exceed 30s).
 */

import {VIDEO} from '../tokens';

export const FPS = VIDEO.fps;
export const TOTAL_FRAMES = 900;

export type Case30SceneId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7';

export type Case30Scene = {
  id: Case30SceneId;
  title: string;
  from: number;
  duration: number;
};

export const CASE30_SCENES: Case30Scene[] = [
  {id: 'C1', title: 'hook-terminal', from: 0, duration: 90},
  {id: 'C2', title: 'whale-and-dsh', from: 90, duration: 120},
  {id: 'C3', title: 'official-plugins-page', from: 210, duration: 90},
  {id: 'C4', title: 'search-install', from: 300, duration: 150},
  {id: 'C5', title: 'sidebar-ready', from: 450, duration: 120},
  {id: 'C6', title: 'four-features', from: 570, duration: 150},
  {id: 'C7', title: 'outro', from: 720, duration: 180},
];

export type SfxKind =
  | 'key' | 'riser' | 'whoosh' | 'landBig' | 'landSmall' | 'tile' | 'window'
  | 'enter' | 'result' | 'click' | 'chime' | 'toolPop' | 'spout' | 'hum' | 'title';

export type SoundEvent = {frame: number; kind: SfxKind; gain?: number; note?: string};

export const SOUND_EVENTS: SoundEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.55, note: 'music bed'},
  // C1 hook
  {frame: 12, kind: 'key', gain: 0.5},
  {frame: 21, kind: 'key', gain: 0.5},
  {frame: 30, kind: 'key', gain: 0.5},
  {frame: 70, kind: 'riser', gain: 0.6, note: 'desktop reveal'},
  // C2 whale badge + real DSH window
  {frame: 108, kind: 'landBig', gain: 0.8, note: 'whale badge lands (C2 f18)'},
  {frame: 118, kind: 'chime', gain: 0.5, note: 'badge settles'},
  {frame: 150, kind: 'tile', gain: 0.45},
  {frame: 180, kind: 'chime', gain: 0.35},
  // C3 official plugins page
  {frame: 212, kind: 'window', gain: 0.55, note: 'official plugins page opens'},
  {frame: 240, kind: 'whoosh', gain: 0.4},
  // C4 search + install (typing 36-88 -> abs 336-388)
  {frame: 326, kind: 'key', gain: 0.35},
  {frame: 332, kind: 'key', gain: 0.35},
  {frame: 338, kind: 'key', gain: 0.35},
  {frame: 344, kind: 'key', gain: 0.35},
  {frame: 350, kind: 'key', gain: 0.35},
  {frame: 356, kind: 'key', gain: 0.35},
  {frame: 362, kind: 'key', gain: 0.35},
  {frame: 368, kind: 'key', gain: 0.35},
  {frame: 374, kind: 'key', gain: 0.35},
  {frame: 384, kind: 'result', gain: 0.6, note: 'single result row (C4 f84)'},
  {frame: 400, kind: 'click', gain: 0.65, note: 'open official confirm dialog (C4 f100)'},
  {frame: 424, kind: 'click', gain: 0.7, note: 'confirm install (C4 f124)'},
  {frame: 432, kind: 'chime', gain: 0.75, note: 'installed, restart DSH (C4 f132)'},
  // C5 workbench screenshot lands (shots 6/12, land 16/22 -> abs 466/472)
  {frame: 456, kind: 'whoosh', gain: 0.5, note: 'workbench drops'},
  {frame: 466, kind: 'landSmall', gain: 0.6, note: 'left shot lands'},
  {frame: 472, kind: 'landSmall', gain: 0.55, note: 'right shot lands'},
  {frame: 520, kind: 'chime', gain: 0.4},
  // C6 features (cards at 10/30/50/70 -> abs 580/600/620/640)
  {frame: 574, kind: 'whoosh', gain: 0.5},
  {frame: 580, kind: 'tile', gain: 0.45},
  {frame: 600, kind: 'tile', gain: 0.45},
  {frame: 620, kind: 'tile', gain: 0.45},
  {frame: 640, kind: 'tile', gain: 0.45},
  {frame: 700, kind: 'chime', gain: 0.45},
  // C7 outro (title 0-40 -> 720-760; install cmd 30-60 -> 750-780)
  {frame: 730, kind: 'title', gain: 0.7},
  {frame: 750, kind: 'key', gain: 0.3},
  {frame: 756, kind: 'key', gain: 0.3},
  {frame: 762, kind: 'key', gain: 0.3},
  {frame: 768, kind: 'key', gain: 0.3},
  {frame: 774, kind: 'key', gain: 0.3},
  {frame: 786, kind: 'chime', gain: 0.5},
  {frame: 820, kind: 'chime', gain: 0.35, note: 'final resolve'},
];

export const case30SceneAt = (frame: number): Case30Scene => {
  for (let i = CASE30_SCENES.length - 1; i >= 0; i--) {
    if (frame >= CASE30_SCENES[i].from) return CASE30_SCENES[i];
  }
  return CASE30_SCENES[0];
};
