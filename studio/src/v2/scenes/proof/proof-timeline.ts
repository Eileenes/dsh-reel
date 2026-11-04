/** 8s proof timeline — miniature-diorama concept test. */
export const PROOF_FPS = 30;
export const PROOF_FRAMES = 240;

export type ProofEvent = {frame: number; kind: 'hum' | 'riser' | 'click' | 'window' | 'tile' | 'key' | 'landSmall' | 'chime' | 'whoosh'; gain?: number; note?: string};

export const SOUND_EVENTS: ProofEvent[] = [
  {frame: 0, kind: 'hum', gain: 0.6, note: 'music bed'},
  {frame: 20, kind: 'riser', gain: 0.45, note: 'camera push'},
  {frame: 66, kind: 'click', gain: 0.75, note: 'big install button'},
  {frame: 84, kind: 'window', gain: 0.65, note: 'drawer slides open'},
  {frame: 120, kind: 'tile', gain: 0.5, note: 'four tabs revealed'},
  {frame: 140, kind: 'key', gain: 0.35, note: 'ticket printing'},
  {frame: 146, kind: 'key', gain: 0.35},
  {frame: 152, kind: 'key', gain: 0.35},
  {frame: 158, kind: 'key', gain: 0.35},
  {frame: 172, kind: 'landSmall', gain: 0.55, note: 'ticket lands'},
  {frame: 196, kind: 'chime', gain: 0.6, note: 'end card'},
  {frame: 210, kind: 'whoosh', gain: 0.35},
];
