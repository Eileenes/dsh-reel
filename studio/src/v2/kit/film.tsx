/**
 * Shared edit shell for every v2 film.
 *
 * A film = scene timings (data/*-timeline.ts) + a scene-id → component map + one
 * audio track + edit-point flashes. This file owns the Sequence/overlap/fade/
 * finish chrome so compositions only declare their data.
 */

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../tokens';

export type Cut = [number, number];

/** Blue/mint bloom on a hard cut; amplitude 0 entries are ignored naturally. */
export const CutFlash: React.FC<{cuts: Cut[]}> = ({cuts}) => {
  const frame = useCurrentFrame();
  let k = 0;
  for (const [cut, amp] of cuts) {
    const d = frame - cut;
    if (d >= 0 && d < 6) k = Math.max(k, (1 - d / 6) * amp);
  }
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 46%, #FFFFFF 0%, ${COLORS.blue2} 28%, ${COLORS.blue}44 62%, transparent 100%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

/** 2px gradient hairline at the very top of the frame. */
export const TopLine: React.FC<{opacity?: number}> = ({opacity = 0.5}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.blue}66, ${COLORS.mint}44, transparent)`,
        opacity,
      }}
    />
  </AbsoluteFill>
);

/** Fade the first `overlap` frames of a scene in (used between overlapping Sequences). */
export const SceneFadeIn: React.FC<{children: React.ReactNode; overlap?: number; fade?: boolean}> = ({
  children,
  overlap = 10,
  fade = true,
}) => {
  const frame = useCurrentFrame();
  const opacity = fade ? Math.min(1, frame / overlap) : 1;
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export type FilmScene = {
  id: string;
  from: number;
  duration: number;
  title?: string;
};

export type FilmSceneMap = Record<string, React.FC>;

export type FilmProps = {
  scenes: FilmScene[];
  /** scene id → component; scenes missing here are skipped */
  sceneMap: FilmSceneMap;
  /** path under studio/public/, e.g. audio/v2/preview-mix.mp3 */
  audio: string;
  cuts?: Cut[];
  /** extra frames added to every scene except the last (cross-fade window) */
  overlap?: number;
  topLineOpacity?: number;
  showTopLine?: boolean;
};

/**
 * Render a film from data. Behaviours preserved from the hand-written compositions:
 * - every scene becomes one `<Sequence>` starting at its absolute `from`;
 * - with `overlap`, each non-last Sequence is extended and fades in after the first;
 * - optional cut flashes + 2px top line on top.
 */
export const Film: React.FC<FilmProps> = ({
  scenes,
  sceneMap,
  audio,
  cuts,
  overlap = 0,
  topLineOpacity = 0.5,
  showTopLine = true,
}) => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <Audio src={staticFile(audio)} />

    {scenes.map((scene, i) => {
      const Comp = sceneMap[scene.id];
      if (!Comp) return null;
      return (
        <Sequence
          key={scene.id}
          from={scene.from}
          durationInFrames={scene.duration + (i < scenes.length - 1 ? overlap : 0)}
          name={`${scene.id}-${scene.title ?? ''}`}
        >
          {overlap > 0 ? (
            <SceneFadeIn fade={i > 0} overlap={overlap}>
              <Comp />
            </SceneFadeIn>
          ) : (
            <Comp />
          )}
        </Sequence>
      );
    })}

    {showTopLine ? <TopLine opacity={topLineOpacity} /> : null}
    {cuts ? <CutFlash cuts={cuts} /> : null}
  </AbsoluteFill>
);

/** Compose a film spec into a Remotion composition component. */
export const makeReel = (spec: FilmProps): React.FC => () => <Film {...spec} />;
