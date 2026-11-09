/**
 * Sorenyeah home film — root composition.
 * 30.0s · 1920x1080 · 30fps · 120 BPM. Scene cuts sit on the score's cuts
 * (music-bed-30.wav) and every effect event lives in timeline.ts.
 */

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from './tokens';
import {FontGate} from './fonts';
import {SCENES} from './timeline';
import {WhaleIntroScene} from './scenes/WhaleIntro';
import {HookScene} from './scenes/Hook';
import {SiteScene} from './scenes/Site';
import {ProjectTourScene, ProjectsGridScene} from './scenes/Projects';
import {MusicScene} from './scenes/Music';
import {ContactScene} from './scenes/Contact';
import {OutroScene} from './scenes/Outro';

const COMPONENTS: Record<string, React.FC> = {
  C0: WhaleIntroScene,
  C1: HookScene,
  C2: SiteScene,
  C3: ProjectsGridScene,
  C4: ProjectTourScene,
  C5: MusicScene,
  C6: ContactScene,
  C7: OutroScene,
};

const CUTS: Array<[number, number]> = [
  [240, 0.1],
  [330, 0.12],
  [450, 0.1],
  [540, 0.12],
  [690, 0.1],
  [810, 0.14],
];

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let k = 0;
  for (const [cut, amp] of CUTS) {
    const d = frame - cut;
    if (d >= 0 && d < 7) k = Math.max(k, (1 - d / 7) * amp);
  }
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 46%, #FFFFFF 0%, #b8f4ff 30%, #82e9ff00 68%)',
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

export const SorenyeahHome: React.FC = () => {
  return (
    <FontGate>
      <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
        <Audio src={staticFile('sorenyeah/audio/preview-mix.mp3')} />
        {SCENES.map(({id, from, duration}) => {
          const Comp = COMPONENTS[id];
          return (
            <Sequence key={id} from={from} durationInFrames={duration} name={`${id} ${SCENES.find((s) => s.id === id)?.title ?? ''}`}>
              <Comp />
            </Sequence>
          );
        })}
        <CutFlash />
      </AbsoluteFill>
    </FontGate>
  );
};
