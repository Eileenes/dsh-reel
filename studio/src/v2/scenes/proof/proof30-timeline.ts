/** 30s narrative story timeline — miniature world. */
export const PROOF_FPS = 30;
export const PROOF_FRAMES = 900;

export type StoryEvent = {frame: number; kind: 'hum' | 'riser' | 'click' | 'window' | 'tile' | 'key' | 'landSmall' | 'chime' | 'whoosh'; gain?: number; note?: string};

export const SOUND_EVENTS: StoryEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.6, note: 'music bed'},
  {frame: 190, kind: 'riser', gain: 0.5, note: 'install build'},
  {frame: 226, kind: 'landSmall', gain: 0.3, note: 'footstep'},
  {frame: 248, kind: 'landSmall', gain: 0.28},
  {frame: 270, kind: 'landSmall', gain: 0.3},
  {frame: 292, kind: 'landSmall', gain: 0.3},
  {frame: 306, kind: 'click', gain: 0.85, note: 'install button'},
  {frame: 322, kind: 'riser', gain: 0.55, note: 'LED on'},
  {frame: 340, kind: 'window', gain: 0.75, note: 'drawer opens'},
  {frame: 420, kind: 'tile', gain: 0.45, note: 'feature 文件'},
  {frame: 492, kind: 'tile', gain: 0.45, note: 'feature Git'},
  {frame: 564, kind: 'tile', gain: 0.45, note: 'feature 任务'},
  {frame: 636, kind: 'tile', gain: 0.45, note: 'feature 侧聊'},
  {frame: 640, kind: 'key', gain: 0.32, note: 'ticket printing'},
  {frame: 648, kind: 'key', gain: 0.32},
  {frame: 656, kind: 'key', gain: 0.32},
  {frame: 664, kind: 'key', gain: 0.32},
  {frame: 700, kind: 'landSmall', gain: 0.55, note: 'ticket lifts'},
  {frame: 790, kind: 'chime', gain: 0.65, note: 'end card'},
  {frame: 850, kind: 'whoosh', gain: 0.35},
];
