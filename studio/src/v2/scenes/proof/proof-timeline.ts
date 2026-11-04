/** 15s proof timeline — miniature-diorama concept test. */
export const PROOF_FPS = 30;
export const PROOF_FRAMES = 450;

export type ProofEvent = {frame: number; kind: 'hum' | 'riser' | 'click' | 'window' | 'tile' | 'key' | 'landSmall' | 'chime' | 'whoosh'; gain?: number; note?: string};

export const SOUND_EVENTS: ProofEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.6, note: 'music bed'},
  {frame: 20, kind: 'riser', gain: 0.45, note: 'camera push'},
  {frame: 62, kind: 'landSmall', gain: 0.28, note: 'footstep'},
  {frame: 86, kind: 'landSmall', gain: 0.26, note: 'footstep'},
  {frame: 110, kind: 'landSmall', gain: 0.3, note: 'footstep'},
  {frame: 136, kind: 'click', gain: 0.8, note: 'big install button'},
  {frame: 150, kind: 'riser', gain: 0.5, note: 'LED on'},
  {frame: 164, kind: 'window', gain: 0.7, note: 'drawer slides open'},
  {frame: 268, kind: 'tile', gain: 0.4, note: 'tab 文件'},
  {frame: 292, kind: 'tile', gain: 0.4, note: 'tab Git'},
  {frame: 316, kind: 'tile', gain: 0.4, note: 'tab 任务'},
  {frame: 340, kind: 'tile', gain: 0.4, note: 'tab 侧聊'},
  {frame: 330, kind: 'key', gain: 0.32, note: 'ticket printing'},
  {frame: 338, kind: 'key', gain: 0.32},
  {frame: 346, kind: 'key', gain: 0.32},
  {frame: 354, kind: 'key', gain: 0.32},
  {frame: 372, kind: 'landSmall', gain: 0.55, note: 'ticket lifts'},
  {frame: 408, kind: 'chime', gain: 0.6, note: 'end card'},
  {frame: 432, kind: 'whoosh', gain: 0.35},
];
