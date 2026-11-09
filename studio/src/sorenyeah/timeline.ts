/**
 * Sorenyeah home film — 38.0s / 30fps / 1920x1080 timeline.
 *
 * 120 BPM (score bed: music-bed-home38.wav, 19 bars), so the cuts sit exactly on beats:
 * beat = 15 frames, bar = 60 frames.
 *
 * C0 is the whale opening rebuilt from the reference film's grammar
 * (Soren_DeepSeek_whale.mp4: terminal types → voxel whale assembles → hops onto the
 * app icon → the site window rises). It replaces the old cold open and hands over to
 * the binary-name hook, which now opens the site itself.
 *
 * The sound events below are the single source of truth for effects:
 * studio/scripts/make_home_audio.py parses this file with a regex (same format as the v2
 * timeline), so keep every event on one line: frame, kind, gain, note.
 */

export const FPS = 30;
export const TOTAL_FRAMES = 1140;
export const BPM = 120;
export const BEAT_FRAMES = 15;
export const BAR_FRAMES = 60;

export type SceneId = 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7';

export const SCENES: Array<{id: SceneId; title: string; from: number; duration: number}> = [
  {id: 'C0', title: 'whale-onto-the-icon', from: 0, duration: 240},
  {id: 'C1', title: 'hook-binary-name', from: 240, duration: 90},
  {id: 'C2', title: 'site-reveal', from: 330, duration: 120},
  {id: 'C3', title: 'projects-grid', from: 450, duration: 90},
  {id: 'C4', title: 'projects-tour', from: 540, duration: 150},
  {id: 'C5', title: 'music-and-writing', from: 690, duration: 120},
  {id: 'C6', title: 'contact', from: 810, duration: 150},
  {id: 'C7', title: 'outro', from: 960, duration: 180},
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

export type SoundEvent = {frame: number; kind: SfxKind; gain?: number; note?: string};

export const SOUND_EVENTS: SoundEvent[] = [
  // C0 — the whale opening: typing, assembly, spout, the hop onto the site icon, the site opening
  {frame: 8, kind: 'key', gain: 0.42, note: 's'},
  {frame: 11, kind: 'key', gain: 0.4, note: 'o'},
  {frame: 14, kind: 'key', gain: 0.4, note: 'r'},
  {frame: 17, kind: 'key', gain: 0.4, note: 'e'},
  {frame: 20, kind: 'key', gain: 0.4, note: 'n'},
  {frame: 24, kind: 'key', gain: 0.4, note: 'y'},
  {frame: 27, kind: 'key', gain: 0.4, note: 'e'},
  {frame: 30, kind: 'key', gain: 0.4, note: 'a'},
  {frame: 33, kind: 'key', gain: 0.42, note: 'h'},
  {frame: 45, kind: 'riser', gain: 0.55, note: 'voxels fly in'},
  {frame: 75, kind: 'landBig', gain: 0.85, note: 'whale assembled and lands'},
  {frame: 90, kind: 'spout', gain: 0.5, note: 'whale spout'},
  {frame: 105, kind: 'whoosh', gain: 0.45, note: 'crouch, big hop'},
  {frame: 140, kind: 'landBig', gain: 0.85, note: 'lands on the site icon'},
  {frame: 143, kind: 'click', gain: 0.5, note: 'icon presses'},
  {frame: 149, kind: 'chime', gain: 0.45, note: 'icon glow'},
  {frame: 152, kind: 'window', gain: 0.7, note: 'site window rises'},
  {frame: 186, kind: 'chime', gain: 0.5, note: 'homepage opens'},
  {frame: 215, kind: 'whoosh', gain: 0.45, note: 'camera pushes into the window'},
  {frame: 232, kind: 'riser', gain: 0.55, note: 'into the name'},
  // C1 — binary name hook (was the cold open; now it opens the site itself)
  {frame: 262, kind: 'key', gain: 0.45, note: 'digits start'},
  {frame: 285, kind: 'landBig', gain: 0.75, note: 'Soren name lands'},
  {frame: 292, kind: 'chime', gain: 0.4, note: 'name settle'},
  {frame: 314, kind: 'whoosh', gain: 0.55, note: 'remix explosion'},
  {frame: 324, kind: 'riser', gain: 0.55, note: 'into the site'},
  // C2 — site reveal
  {frame: 330, kind: 'result', gain: 0.6, note: 'site appears'},
  {frame: 366, kind: 'key', gain: 0.3, note: 'URL pill'},
  {frame: 390, kind: 'tile', gain: 0.35, note: 'camera settles'},
  {frame: 438, kind: 'riser', gain: 0.5, note: 'into projects'},
  // C3 — projects grid
  {frame: 450, kind: 'landBig', gain: 0.8, note: 'projects stage cut'},
  {frame: 456, kind: 'title', gain: 0.6, note: '想法，运行中'},
  {frame: 465, kind: 'tile', gain: 0.45, note: 'card 01'},
  {frame: 480, kind: 'tile', gain: 0.45, note: 'card 02'},
  {frame: 495, kind: 'tile', gain: 0.45, note: 'card 03'},
  {frame: 510, kind: 'tile', gain: 0.45, note: 'card 04'},
  {frame: 528, kind: 'chime', gain: 0.4, note: 'grid complete'},
  // C4 — projects tour, one whip per beat
  {frame: 540, kind: 'whoosh', gain: 0.5, note: 'camera into grid'},
  {frame: 555, kind: 'click', gain: 0.42, note: 'Pi Desktop'},
  {frame: 570, kind: 'whoosh', gain: 0.42, note: 'whip'},
  {frame: 585, kind: 'click', gain: 0.42, note: 'Creative Skills'},
  {frame: 600, kind: 'whoosh', gain: 0.42, note: 'whip'},
  {frame: 615, kind: 'click', gain: 0.42, note: 'DSH Reel'},
  {frame: 630, kind: 'whoosh', gain: 0.42, note: 'whip'},
  {frame: 645, kind: 'click', gain: 0.42, note: 'Whack a Tibo'},
  {frame: 660, kind: 'tile', gain: 0.4, note: 'grid pulls back'},
  {frame: 678, kind: 'riser', gain: 0.5, note: 'into music'},
  // C5 — music and writing (peak)
  {frame: 690, kind: 'landBig', gain: 0.85, note: 'music stage cut'},
  {frame: 696, kind: 'title', gain: 0.6, note: '我的音乐'},
  {frame: 705, kind: 'key', gain: 0.35, note: 'track 01'},
  {frame: 720, kind: 'key', gain: 0.35, note: 'track 03'},
  {frame: 735, kind: 'key', gain: 0.35, note: 'track 05'},
  {frame: 750, kind: 'key', gain: 0.35, note: 'track 07'},
  {frame: 765, kind: 'result', gain: 0.5, note: 'player playing'},
  {frame: 780, kind: 'tile', gain: 0.4, note: 'writing cards'},
  {frame: 795, kind: 'riser', gain: 0.55, note: 'into contact'},
  // C6 — contact
  {frame: 810, kind: 'landBig', gain: 0.8, note: 'contact stage cut'},
  {frame: 818, kind: 'title', gain: 0.55, note: '下一个有趣的想法'},
  {frame: 836, kind: 'click', gain: 0.4, note: 'email'},
  {frame: 870, kind: 'chime', gain: 0.45, note: 'WeChat QR'},
  {frame: 930, kind: 'riser', gain: 0.5, note: 'into outro'},
  // C7 — outro mark
  {frame: 960, kind: 'landBig', gain: 0.9, note: 'logo slam'},
  {frame: 968, kind: 'chime', gain: 0.55, note: 'logo resolves'},
  {frame: 1020, kind: 'title', gain: 0.55, note: 'sorenyeah.com'},
  {frame: 1090, kind: 'chime', gain: 0.35, note: 'final resolve'},
];

/** Frame at which a scene starts; used by the composition. */
export const sceneAt = (frame: number) => {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (frame >= SCENES[i].from) return SCENES[i];
  }
  return SCENES[0];
};
