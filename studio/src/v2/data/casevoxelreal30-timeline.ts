/** Sound events for the 30s real-UI Better Sidebar film. */
export const FPS = 30;
export const TOTAL_FRAMES = 900;
export type SfxKind = 'key' | 'riser' | 'whoosh' | 'landBig' | 'landSmall' | 'tile' | 'window' | 'enter' | 'result' | 'click' | 'chime' | 'toolPop' | 'spout' | 'hum' | 'title';
export type SoundEvent = {frame: number; kind: SfxKind; gain?: number; note?: string};

export const SOUND_EVENTS: SoundEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.55},
  {frame: 12, kind: 'key', gain: 0.5},
  {frame: 21, kind: 'key', gain: 0.5},
  {frame: 30, kind: 'key', gain: 0.5},
  {frame: 70, kind: 'riser', gain: 0.6, note: 'whale assemble'},
  {frame: 100, kind: 'landBig', gain: 0.8},
  {frame: 112, kind: 'window', gain: 0.6, note: 'real DSH window'},
  {frame: 150, kind: 'tile', gain: 0.5},
  {frame: 188, kind: 'chime', gain: 0.4},
  {frame: 214, kind: 'whoosh', gain: 0.5, note: 'open plugins'},
  {frame: 232, kind: 'window', gain: 0.55},
  {frame: 288, kind: 'click', gain: 0.6, note: 'click Plugins'},
  {frame: 326, kind: 'whoosh', gain: 0.55, note: 'add-plugin dialog'},
  {frame: 448, kind: 'click', gain: 0.8, note: 'Install button'},
  {frame: 470, kind: 'riser', gain: 0.45},
  {frame: 486, kind: 'chime', gain: 0.75, note: 'installed toast'},
  {frame: 544, kind: 'whoosh', gain: 0.45, note: 'features'},
  {frame: 550, kind: 'tile', gain: 0.45},
  {frame: 570, kind: 'tile', gain: 0.45},
  {frame: 590, kind: 'tile', gain: 0.45},
  {frame: 610, kind: 'tile', gain: 0.45},
  {frame: 650, kind: 'chime', gain: 0.4},
  {frame: 682, kind: 'whoosh', gain: 0.5, note: 'workbench'},
  {frame: 696, kind: 'landSmall', gain: 0.6},
  {frame: 702, kind: 'landSmall', gain: 0.6},
  {frame: 738, kind: 'chime', gain: 0.4},
  {frame: 772, kind: 'title', gain: 0.65, note: 'end card'},
  {frame: 800, kind: 'key', gain: 0.3},
  {frame: 806, kind: 'key', gain: 0.3},
  {frame: 812, kind: 'key', gain: 0.3},
  {frame: 818, kind: 'key', gain: 0.3},
  {frame: 838, kind: 'chime', gain: 0.5},
  {frame: 870, kind: 'chime', gain: 0.35},
];
