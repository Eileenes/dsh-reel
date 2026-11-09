/**
 * Case film timeline — same 24.0s / 720-frame edit as the dsh-reel campaign, but
 * retargeted to another DSH plugin (Better Sidebar). The scene boundaries are
 * intentionally identical so the case film reuses the same soundtrack grammar.
 */

import {VIDEO} from '../tokens';

export const FPS = VIDEO.fps;
export const TOTAL_FRAMES = 720;

export type CaseSceneId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9';

export type CaseScene = {
  id: CaseSceneId;
  title: string;
  from: number;
  duration: number;
  seconds: number;
};

export const CASE_SCENES: CaseScene[] = [
  {id: 'S1', title: 'hook', from: 0, duration: 78, seconds: 2.6},
  {id: 'S2', title: 'whale-hatch', from: 78, duration: 78, seconds: 2.6},
  {id: 'S3', title: 'market-open', from: 156, duration: 72, seconds: 2.4},
  {id: 'S4', title: 'search-better-sidebar', from: 228, duration: 120, seconds: 4.0},
  {id: 'S5', title: 'install', from: 348, duration: 78, seconds: 2.6},
  {id: 'S6', title: 'sidebar-open', from: 426, duration: 36, seconds: 1.2},
  {id: 'S7', title: 'four-features', from: 462, duration: 126, seconds: 4.2},
  {id: 'S8', title: 'workbench', from: 588, duration: 72, seconds: 2.4},
  {id: 'S9', title: 'outro', from: 660, duration: 60, seconds: 2.0},
];

/** Edit-point flashes: [absolute frame, amplitude]. Same edit grammar as the dsh-reel film. */
export const CASE_CUTS: Array<[number, number]> = [
  [156, 0.2],
  [348, 0.14],
  [426, 0.11],
  [462, 0.09],
  [588, 0.17],
  [660, 0.15],
];

export type SfxKind =
  | 'key'
  | 'riser'
  | 'whoosh'
  | 'landBig'
  | 'landSmall'
  | 'tile'
  | 'window'
  | 'enter'
  | 'result'
  | 'click'
  | 'chime'
  | 'toolPop'
  | 'spout'
  | 'hum'
  | 'title';

export type SoundEvent = {
  frame: number;
  kind: SfxKind;
  gain?: number;
  note?: string;
};

/** Case-film sound anchors. Aligned to the scene beats in CaseMarket/CaseFeature scenes. */
export const SOUND_EVENTS: SoundEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.55, note: 'drone bed in'},
  {frame: 12, kind: 'key', gain: 0.5},
  {frame: 21, kind: 'key', gain: 0.5},
  {frame: 30, kind: 'key', gain: 0.5},
  {frame: 62, kind: 'riser', gain: 0.65, note: 'voxels gather'},
  {frame: 116, kind: 'landBig', gain: 0.95, note: 'whale lands'},
  {frame: 122, kind: 'spout', gain: 0.5},
  {frame: 126, kind: 'window', gain: 0.6, note: 'DSH window grows'},
  {frame: 130, kind: 'whoosh', gain: 0.45},
  {frame: 152, kind: 'tile', gain: 0.55},
  {frame: 158, kind: 'window', gain: 0.5, note: 'market opens'},
  // C4 · typing "better-sidebar"
  {frame: 236, kind: 'key', gain: 0.35},
  {frame: 240, kind: 'key', gain: 0.35},
  {frame: 244, kind: 'key', gain: 0.35},
  {frame: 248, kind: 'key', gain: 0.35},
  {frame: 252, kind: 'key', gain: 0.35},
  {frame: 256, kind: 'key', gain: 0.35},
  {frame: 260, kind: 'key', gain: 0.35},
  {frame: 264, kind: 'key', gain: 0.35},
  {frame: 268, kind: 'key', gain: 0.35},
  {frame: 272, kind: 'key', gain: 0.35},
  {frame: 300, kind: 'result', gain: 0.6, note: 'result lands (C4 f72)'},
  {frame: 308, kind: 'whoosh', gain: 0.5, note: 'push into card'},
  {frame: 360, kind: 'click', gain: 0.7, note: 'install click'},
  {frame: 374, kind: 'riser', gain: 0.4},
  {frame: 386, kind: 'chime', gain: 0.7, note: 'installed'},
  // C6 · sidebar opens
  {frame: 434, kind: 'window', gain: 0.55, note: 'right sidebar slides in (C6 f7)'},
  {frame: 440, kind: 'tile', gain: 0.5, note: 'sidebar settles (C6 f12)'},
  {frame: 448, kind: 'chime', gain: 0.45},
  // C7 · four features
  {frame: 470, kind: 'whoosh', gain: 0.5, note: 'feature stage enters'},
  {frame: 472, kind: 'tile', gain: 0.45, note: 'feature 01 (C7 f10)'},
  {frame: 492, kind: 'tile', gain: 0.45, note: 'feature 02 (C7 f30)'},
  {frame: 512, kind: 'tile', gain: 0.45, note: 'feature 03 (C7 f50)'},
  {frame: 532, kind: 'tile', gain: 0.45, note: 'feature 04 (C7 f70)'},
  {frame: 548, kind: 'landSmall', gain: 0.45, note: 'features resolved'},
  {frame: 560, kind: 'hum', gain: 0.4},
  {frame: 580, kind: 'chime', gain: 0.5, note: 'features resolved'},
  // C8 · workbench
  {frame: 594, kind: 'whoosh', gain: 0.5, note: 'workbench drops (C8 f6)'},
  {frame: 604, kind: 'landSmall', gain: 0.65, note: 'left shot lands (C8 f16)'},
  {frame: 610, kind: 'landSmall', gain: 0.6, note: 'right shot lands (C8 f22)'},
  {frame: 618, kind: 'chime', gain: 0.4},
  // C9 · outro
  {frame: 666, kind: 'title', gain: 0.7, note: 'Better Sidebar title'},
  {frame: 684, kind: 'key', gain: 0.3},
  {frame: 688, kind: 'key', gain: 0.3},
  {frame: 692, kind: 'key', gain: 0.3},
  {frame: 700, kind: 'chime', gain: 0.5, note: 'freeze / end'},
];

export const caseSceneAt = (frame: number): CaseScene => {
  for (let i = CASE_SCENES.length - 1; i >= 0; i--) {
    if (frame >= CASE_SCENES[i].from) return CASE_SCENES[i];
  }
  return CASE_SCENES[0];
};
