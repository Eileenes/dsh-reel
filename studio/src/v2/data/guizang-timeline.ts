/**
 * dsh-guizang-design film timeline — 30.0s / 900 frames @30fps.
 *
 * Follows docs/promo-method-v0.1.md (five-act template) and
 * .research/dsh-reel-promo/better-sidebar-storyboard-v4.md (30s frame table):
 *
 *   0–5s      terminal dsh → whale assembles → spout
 *   5–9s      app dock → 文件 → Git → DSH → window expands
 *   9–12s     DSH main → whale jumps onto 「插件」 → plugin page opens
 *   12–15.7s  search guizang-design → result card → install → blue progress → installed
 *   15.7–27.5s four skills, four beats each
 *   27.5–30s  black end card + install command + whale top-right
 */

import {VIDEO} from '../tokens';

export const FPS = VIDEO.fps;
export const TOTAL_FRAMES = 900;

export type GuizangSceneId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export type GuizangScene = {
  id: GuizangSceneId;
  title: string;
  from: number;
  duration: number;
};

export const GUIZANG_SCENES: GuizangScene[] = [
  {id: 'S1', title: 'terminal-whale', from: 0, duration: 150},
  {id: 'S2', title: 'dock-window', from: 150, duration: 120},
  {id: 'S3', title: 'plugin-tab', from: 270, duration: 90},
  {id: 'S4', title: 'search-install', from: 360, duration: 110},
  {id: 'S5', title: 'four-skills', from: 470, duration: 355},
  {id: 'S6', title: 'end-card', from: 825, duration: 75},
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

export const SOUND_EVENTS: SoundEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.55, note: 'bed in'},
  // S1 · terminal types dsh, whale assembles, spout
  {frame: 12, kind: 'key', gain: 0.5, note: 'd'},
  {frame: 21, kind: 'key', gain: 0.5, note: 's'},
  {frame: 30, kind: 'key', gain: 0.5, note: 'h'},
  {frame: 90, kind: 'riser', gain: 0.55, note: 'voxels gather'},
  {frame: 108, kind: 'spout', gain: 0.5, note: 'whale spout'},
  {frame: 128, kind: 'chime', gain: 0.35},
  // S2 · dock: 文件 → Git → DSH → window expands
  {frame: 160, kind: 'whoosh', gain: 0.45, note: 'whale to dock'},
  {frame: 180, kind: 'landSmall', gain: 0.55, note: 'lands 文件'},
  {frame: 184, kind: 'whoosh', gain: 0.4},
  {frame: 204, kind: 'landSmall', gain: 0.55, note: 'lands Git'},
  {frame: 208, kind: 'whoosh', gain: 0.4},
  {frame: 228, kind: 'landSmall', gain: 0.6, note: 'lands DSH'},
  {frame: 230, kind: 'click', gain: 0.6, note: 'opens DSH'},
  {frame: 240, kind: 'window', gain: 0.55, note: 'window expands'},
  {frame: 256, kind: 'whoosh', gain: 0.45, note: 'hop to window'},
  {frame: 268, kind: 'landSmall', gain: 0.45},
  // S3 · whale jumps onto 「插件」, plugin page opens
  {frame: 280, kind: 'whoosh', gain: 0.45},
  {frame: 306, kind: 'landSmall', gain: 0.6, note: 'lands 插件 tab'},
  {frame: 308, kind: 'click', gain: 0.65, note: 'click 插件'},
  {frame: 324, kind: 'window', gain: 0.55, note: 'plugin page opens'},
  {frame: 344, kind: 'chime', gain: 0.35},
  // S4 · search → result → install → blue progress → installed
  {frame: 376, kind: 'key', gain: 0.3},
  {frame: 379, kind: 'key', gain: 0.3},
  {frame: 382, kind: 'key', gain: 0.3},
  {frame: 385, kind: 'key', gain: 0.3},
  {frame: 388, kind: 'key', gain: 0.3},
  {frame: 391, kind: 'key', gain: 0.3},
  {frame: 394, kind: 'key', gain: 0.3},
  {frame: 397, kind: 'key', gain: 0.3},
  {frame: 400, kind: 'key', gain: 0.3},
  {frame: 403, kind: 'key', gain: 0.3},
  {frame: 406, kind: 'key', gain: 0.3},
  {frame: 409, kind: 'key', gain: 0.3},
  {frame: 412, kind: 'key', gain: 0.3},
  {frame: 415, kind: 'key', gain: 0.3},
  {frame: 426, kind: 'result', gain: 0.6, note: 'result card'},
  {frame: 440, kind: 'whoosh', gain: 0.45, note: 'whale to 安装'},
  {frame: 452, kind: 'click', gain: 0.7, note: 'install click'},
  {frame: 456, kind: 'riser', gain: 0.4, note: 'installing'},
  {frame: 468, kind: 'chime', gain: 0.7, note: 'installed'},
  // S5 · four skills: focus / click / result / hold
  {frame: 482, kind: 'whoosh', gain: 0.4, note: 'skill 1'},
  {frame: 514, kind: 'landSmall', gain: 0.55},
  {frame: 520, kind: 'window', gain: 0.45},
  {frame: 556, kind: 'chime', gain: 0.35},
  {frame: 564, kind: 'whoosh', gain: 0.4, note: 'skill 2'},
  {frame: 596, kind: 'landSmall', gain: 0.55},
  {frame: 602, kind: 'window', gain: 0.45},
  {frame: 638, kind: 'chime', gain: 0.35},
  {frame: 646, kind: 'whoosh', gain: 0.4, note: 'skill 3'},
  {frame: 678, kind: 'landSmall', gain: 0.55},
  {frame: 684, kind: 'window', gain: 0.45},
  {frame: 720, kind: 'chime', gain: 0.35},
  {frame: 728, kind: 'whoosh', gain: 0.4, note: 'skill 4'},
  {frame: 760, kind: 'landSmall', gain: 0.55},
  {frame: 766, kind: 'window', gain: 0.45},
  {frame: 802, kind: 'chime', gain: 0.4},
  // S6 · end card
  {frame: 836, kind: 'title', gain: 0.7, note: 'end card'},
  {frame: 852, kind: 'key', gain: 0.3},
  {frame: 858, kind: 'key', gain: 0.3},
  {frame: 880, kind: 'chime', gain: 0.5},
];
