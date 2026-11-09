/**
 * dsh-reel v2 promo timeline — single source of truth for scene boundaries and
 * sound-event anchors. Frame numbers are 30fps, total = 24.0s / 720 frames.
 *
 * Scene S1..S9 follow the approved storyboard (see .research/dsh-reel-promo/PROPOSAL.md §5.3).
 */

import {VIDEO} from '../tokens';

export const FPS = VIDEO.fps;
export const TOTAL_FRAMES = 720;

export type SceneId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9';

export type Scene = {
  id: SceneId;
  title: string;
  from: number;
  duration: number;
  /** seconds, for audio/storyboard docs */
  seconds: number;
};

export const SCENES: Scene[] = [
  {id: 'S1', title: 'hook-terminal', from: 0, duration: 78, seconds: 2.6},
  {id: 'S2', title: 'whale-hatch', from: 78, duration: 78, seconds: 2.6},
  {id: 'S3', title: 'dsh-market-open', from: 156, duration: 72, seconds: 2.4},
  {id: 'S4', title: 'search-reel-studio', from: 228, duration: 120, seconds: 4.0},
  {id: 'S5', title: 'install', from: 348, duration: 78, seconds: 2.6},
  {id: 'S6', title: 'handoff-agent', from: 426, duration: 36, seconds: 1.2},
  {id: 'S7', title: 'scan-plan-render', from: 462, duration: 126, seconds: 4.2},
  {id: 'S8', title: 'outputs-land', from: 588, duration: 72, seconds: 2.4},
  {id: 'S9', title: 'end-card', from: 660, duration: 60, seconds: 2.0},
];

/** Reading holds: freeze whale + camera + particles. */
export const STILLS: Array<[number, number]> = [
  [300, 318], // after search result lands (S4)
  [616, 640], // after outputs land (S8)
  [696, 718], // end card (S9)
];

/** Edit-point flashes: [absolute frame, amplitude]. */
export const CUTS: Array<[number, number]> = [
  [156, 0.2], // S2 -> S3 (enter the DSH window)
  [348, 0.14], // S4 -> S5 (result -> detail)
  [426, 0.11], // S5 -> S6 (installed -> hand-off)
  [462, 0.09], // S6 -> S7 (hand-off -> pipeline)
  [588, 0.17], // S7 -> S8 (render -> world with outputs)
  [660, 0.15], // S8 -> S9 (outputs -> end card)
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
  /** frame number (30fps) */
  frame: number;
  kind: SfxKind;
  /** 0..1 relative gain */
  gain?: number;
  note?: string;
};

/**
 * Sound anchors. These are intentionally close to the reference film's event
 * grammar (key ticks -> riser -> land -> window -> result -> install -> title).
 */
export const SOUND_EVENTS: SoundEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.55, note: 'drone bed in'},
  // S1 · terminal typing "dsh"
  {frame: 12, kind: 'key', gain: 0.5, note: 'd'},
  {frame: 21, kind: 'key', gain: 0.5, note: 's'},
  {frame: 30, kind: 'key', gain: 0.5, note: 'h'},
  {frame: 62, kind: 'riser', gain: 0.65, note: 'voxels gather'},
  // S2 · hatch + land + window grows
  {frame: 116, kind: 'landBig', gain: 0.95, note: 'whale lands (S2 f38)'},
  {frame: 122, kind: 'spout', gain: 0.5, note: 'first spout (S2 f44)'},
  {frame: 126, kind: 'window', gain: 0.6, note: 'DSH window grows (S2 f40-62)'},
  {frame: 130, kind: 'whoosh', gain: 0.45, note: 'hop to window (S2 f52)'},
  {frame: 152, kind: 'tile', gain: 0.55, note: 'lands on window edge (S2 f74)'},
  // S3 · market opens
  {frame: 158, kind: 'window', gain: 0.5, note: 'plugin market rises'},
  // S4 · search
  {frame: 236, kind: 'key', gain: 0.35, note: 'r'},
  {frame: 241, kind: 'key', gain: 0.35, note: 'e'},
  {frame: 246, kind: 'key', gain: 0.35, note: 'e'},
  {frame: 251, kind: 'key', gain: 0.35, note: 'l'},
  {frame: 256, kind: 'key', gain: 0.35, note: '-'},
  {frame: 261, kind: 'key', gain: 0.35, note: 's'},
  {frame: 266, kind: 'key', gain: 0.35, note: 't'},
  {frame: 271, kind: 'key', gain: 0.35, note: 'u'},
  {frame: 276, kind: 'key', gain: 0.35, note: 'd'},
  {frame: 281, kind: 'key', gain: 0.35, note: 'i'},
  {frame: 286, kind: 'key', gain: 0.35, note: 'o'},
  {frame: 292, kind: 'result', gain: 0.6, note: 'result lands (S4 f64)'},
  {frame: 308, kind: 'whoosh', gain: 0.5, note: 'push into card (S4 f80)'},
  // S5 · install
  {frame: 360, kind: 'click', gain: 0.7, note: 'install click (S5 f12)'},
  {frame: 374, kind: 'riser', gain: 0.4, note: 'installing (S5 f26)'},
  {frame: 386, kind: 'chime', gain: 0.7, note: 'installed + toast (S5 f36)'},
  // S6 · hand-off to the agent
  {frame: 433, kind: 'key', gain: 0.35, note: 'prompt typing'},
  {frame: 436, kind: 'key', gain: 0.35},
  {frame: 439, kind: 'key', gain: 0.35},
  {frame: 442, kind: 'key', gain: 0.35},
  {frame: 445, kind: 'key', gain: 0.35},
  {frame: 447, kind: 'enter', gain: 0.8, note: 'send (S6 f20)'},
  {frame: 449, kind: 'toolPop', gain: 0.5, note: 'reel_scan chip'},
  {frame: 452, kind: 'toolPop', gain: 0.5, note: 'reel_plan chip'},
  {frame: 455, kind: 'toolPop', gain: 0.5, note: 'reel_render chip'},
  // S7 · scan -> storyboard -> render
  {frame: 481, kind: 'whoosh', gain: 0.5, note: 'scan sweep (S7 f19)'},
  {frame: 501, kind: 'window', gain: 0.45, note: 'film strip enters (S7 f39)'},
  {frame: 508, kind: 'tile', gain: 0.45, note: 'shot 01'},
  {frame: 514, kind: 'tile', gain: 0.45, note: 'shot 02'},
  {frame: 520, kind: 'tile', gain: 0.45, note: 'shot 03'},
  {frame: 526, kind: 'tile', gain: 0.45, note: 'shot 04'},
  {frame: 532, kind: 'tile', gain: 0.45, note: 'shot 05'},
  {frame: 538, kind: 'tile', gain: 0.45, note: 'shot 06'},
  {frame: 548, kind: 'landSmall', gain: 0.5, note: 'poster lands (S7 f86)'},
  {frame: 556, kind: 'landSmall', gain: 0.5, note: 'video lands (S7 f94)'},
  {frame: 558, kind: 'hum', gain: 0.45, note: 'render progress (S7 f96)'},
  {frame: 580, kind: 'chime', gain: 0.55, note: 'render done (S7 f118)'},
  // S8 · both artifacts land on the desk
  {frame: 590, kind: 'whoosh', gain: 0.4, note: 'poster drops (S8 f2)'},
  {frame: 599, kind: 'landSmall', gain: 0.6, note: 'poster lands (S8 f11)'},
  {frame: 604, kind: 'landSmall', gain: 0.55, note: 'video lands (S8 f16)'},
  {frame: 606, kind: 'chime', gain: 0.35, note: 'both outputs on desk'},
  // S9 · end card
  {frame: 674, kind: 'title', gain: 0.7, note: 'title lands (S9 f14)'},
  {frame: 688, kind: 'key', gain: 0.3, note: 'install cmd typing'},
  {frame: 692, kind: 'key', gain: 0.3},
  {frame: 696, kind: 'key', gain: 0.3},
  {frame: 700, kind: 'chime', gain: 0.5, note: 'freeze / end'},
];

export const sceneAt = (frame: number): Scene => {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (frame >= SCENES[i].from) return SCENES[i];
  }
  return SCENES[0];
};
