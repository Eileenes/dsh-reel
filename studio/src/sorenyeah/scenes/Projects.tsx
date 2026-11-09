/**
 * C3 · projects grid (210–300, 3.0s) and C4 · project tour (300–450, 5.0s).
 *
 * The four projects are the real ones from sorenyeah.com with their real one-liners and
 * real key art. The cards are rebuilt at film scale (the site's 644×330 art window, 14 px
 * radius, pill type labels), then the film cuts into each one on the beat.
 */

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PROJECTS, Project} from '../data';
import {Grain, Ink, Landscape, Kicker, Rise, eased, spring} from '../kit';
import {COLORS, FONT} from '../tokens';

const DARK = '#111d2b';

/** The project's own key art, rebuilt from the same assets the site uses. */
export const ProjectArt: React.FC<{project: Project; width: number; height: number; live?: number}> = ({
  project,
  width,
  height,
  live = 1,
}) => {
  const art = project.art;
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (art.kind === 'image') {
    return (
      <div style={{width, height, overflow: 'hidden', position: 'relative', background: DARK}}>
        <Img
          src={staticFile(art.src)}
          style={{width: '100%', height: '100%', objectFit: art.fit ?? 'cover', transform: `scale(${1 + 0.03 * live})`}}
        />
        <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px rgba(8,11,18,0.6)'}} />
      </div>
    );
  }
  if (art.kind === 'pi') {
    return (
      <div
        style={{
          width,
          height,
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(ellipse 62% 78% at 50% 46%, #17273a 0%, ${DARK} 62%, #0c1622 100%)`,
        }}
      >
        {[1.55, 1.15].map((k, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: width * k,
              height: height * k,
              marginLeft: (-width * k) / 2,
              marginTop: (-height * k) / 2,
              borderRadius: '50%',
              border: '1px solid rgba(136,178,196,0.10)',
              transform: `rotate(${t * 4 * (i ? -1 : 1)}deg)`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 42,
          }}
        >
          <div style={{fontFamily: FONT.sans, fontSize: height * 1.05, lineHeight: 0.8, color: 'rgba(150,190,205,0.5)', fontWeight: 300}}>
            [
          </div>
          <div
            style={{
              width: height * 0.52,
              height: height * 0.52,
              borderRadius: height * 0.12,
              background: 'linear-gradient(180deg, #f2f5f7 0%, #c9d3d8 100%)',
              boxShadow: '0 22px 46px rgba(0,0,0,0.45), inset 0 -3px 0 rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Img src={staticFile('sorenyeah/images/pi-desktop-icon.png')} style={{width: '72%', height: '72%'}} />
          </div>
          <div style={{fontFamily: FONT.sans, fontSize: height * 1.05, lineHeight: 0.8, color: 'rgba(150,190,205,0.5)', fontWeight: 300}}>
            ]
          </div>
        </div>
      </div>
    );
  }
  // creative skills
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse 70% 90% at 62% 46%, #1a1a2e 0%, #141425 55%, #0d1120 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: width * 0.06,
          top: height * 0.14,
          fontFamily: FONT.mono,
          fontSize: height * 0.085,
          lineHeight: 1.5,
          color: 'rgba(194,182,255,0.5)',
          whiteSpace: 'pre',
        }}
      >
        {'{\n / / / \n}'}
      </div>
      <div
        style={{
          position: 'absolute',
          right: width * 0.05,
          top: height * 0.1,
          width: height * 0.66,
          height: height * 0.66,
          borderRadius: height * 0.2,
          overflow: 'hidden',
          transform: `rotate(-3deg) scale(${1.02 + 0.02 * Math.sin(t * 0.8)})`,
          boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
        }}
      >
        <Img src={staticFile('sorenyeah/images/avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: width * 0.545,
          top: height * 0.055,
          fontFamily: FONT.sans,
          fontSize: height * 0.2,
          lineHeight: 0.9,
          color: COLORS.lavender,
          transform: `rotate(${10 + Math.sin(t) * 8}deg)`,
        }}
      >
        ✳
      </div>
      <div
        style={{
          position: 'absolute',
          left: width * 0.06,
          bottom: height * 0.09,
          fontFamily: FONT.sans,
          fontSize: height * 0.2,
          lineHeight: 0.98,
          fontWeight: 500,
          letterSpacing: -1,
          color: COLORS.ink,
        }}
      >
        Creative
        <br />
        Skills
        <span style={{color: COLORS.lavender, marginLeft: 10}}>↗</span>
      </div>
    </div>
  );
};

const TypePill: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      alignSelf: 'flex-start',
      fontFamily: FONT.sans,
      fontSize: 15,
      color: '#b5c4d7',
      border: '1px solid rgba(165,197,225,0.145)',
      background: 'rgba(165,197,225,0.06)',
      borderRadius: 5,
      padding: '5px 10px',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const CARD_W = 800;
const CARD_ART_H = 266;
const CARD_GAP = 32;
const CARD_ROW_H = 402;

const cardPos = (i: number) => ({
  x: 108 + (i % 2) * (CARD_W + CARD_GAP),
  y: 206 + Math.floor(i / 2) * CARD_ROW_H,
});

const Card: React.FC<{project: Project; index: number; active?: boolean; dim?: number; lift?: number}> = ({
  project,
  index,
  active = false,
  dim = 0,
  lift = 0,
}) => {
  const {x, y} = cardPos(index);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        transform: `translateY(${lift}px)`,
        opacity: 1 - dim,
      }}
    >
      <div
        style={{
          width: CARD_W,
          height: CARD_ART_H,
          borderRadius: 14,
          overflow: 'hidden',
          background: DARK,
          border: `1px solid ${active ? 'rgba(91,144,167,0.95)' : 'rgba(173,200,222,0.145)'}`,
          boxShadow: active ? '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(130,233,255,0.18)' : '0 24px 60px rgba(0,0,0,0.4)',
        }}
      >
        <ProjectArt project={project} width={CARD_W} height={CARD_ART_H} live={active ? 1 : 0} />
      </div>
      <div style={{paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{fontFamily: FONT.sans, fontSize: 31, fontWeight: 500, letterSpacing: -0.4, color: COLORS.ink}}>
            {project.title}
          </div>
          <TypePill>{project.type}</TypePill>
          <div style={{flex: 1}} />
          <div style={{fontFamily: FONT.mono, fontSize: 15, letterSpacing: 1.5, color: active ? COLORS.accent : 'rgba(187,199,216,0.5)'}}>
            {project.no}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 18,
            lineHeight: 1.55,
            color: active ? '#c6d3e2' : COLORS.muted,
            maxWidth: 760,
          }}
        >
          {project.desc}
        </div>
      </div>
    </div>
  );
};

export const ProjectsGridScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // hard cut: the section is already there; the heading settles, the cards catch up
  const titleIn = Math.min(1, 0.72 + frame / 12);
  const exits = eased((frame - 78) / 12, 'inout');

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, fontFamily: FONT.sans}}>
      <Ink brightness={0.8} />
      <Landscape opacity={0.22} y={-40} scale={1.08} drift={0.6} />

      <div
        style={{
          position: 'absolute',
          left: 108,
          top: 104,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 26,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 18}px)`,
        }}
      >
        <div style={{fontFamily: FONT.cjk, fontSize: 78, fontWeight: 600, letterSpacing: -2, lineHeight: 1, color: COLORS.ink}}>
          想法，运行中<span style={{color: COLORS.accent}}>.</span>
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 16, letterSpacing: 2.4, color: 'rgba(187,199,216,0.55)', paddingBottom: 10}}>
          04 PROJECTS · github.com/Eileenes
        </div>
      </div>

      <AbsoluteFill style={{opacity: 1 - exits * 0.45, transform: `scale(${1 + exits * 0.03})`}}>
        {PROJECTS.map((p, i) => {
          const p2 = spring(frame + 10 - i * 6, fps, {damping: 200, mass: 0.7, stiffness: 120});
          return <Card key={p.no} project={p} index={i} lift={(1 - p2) * 46} dim={(1 - p2) * 1} />;
        })}
      </AbsoluteFill>

      <Grain opacity={0.055} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* C4: one project at a time, cut on the beat                          */
/* ------------------------------------------------------------------ */

const STATION = 36;
const STATIONS: Array<{from: number; project: Project; index: number}> = [
  {from: 0, project: PROJECTS[0], index: 0},
  {from: 36, project: PROJECTS[1], index: 1},
  {from: 72, project: PROJECTS[2], index: 2},
  {from: 108, project: PROJECTS[3], index: 3},
];

export const ProjectTourScene: React.FC = () => {
  const frame = useCurrentFrame();
  const at = Math.min(3, Math.floor(frame / STATION));
  const local = frame - STATIONS[at].from;
  const project = STATIONS[at].project;
  // hard cuts: the incoming card is already on screen, it only settles
  const inP = Math.min(1, 0.8 + local / 8);
  const copyIn = Math.min(1, 0.64 + local / 8);
  const slot = eased(frame / 150, 'inout');
  const {fps} = useVideoConfig();
  const artP = spring(local, fps, {damping: 200, mass: 0.7, stiffness: 120});
  const outro = eased((frame - 120) / 14, 'inout');

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, fontFamily: FONT.sans, overflow: 'hidden'}}>
      <Ink brightness={0.95} />
      <Landscape opacity={0.3} y={30} scale={1.1} drift={0.8} glow={0.35} />

      {/* the project number, as a graphic element */}
      <div
        style={{
          position: 'absolute',
          right: 60,
          top: -70,
          fontFamily: FONT.sans,
          fontSize: 620,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: -30,
          color: 'rgba(233,237,245,0.045)',
          transform: `translateX(${(1 - inP) * 40}px)`,
        }}
      >
        {project.no}
      </div>

      {/* art window */}
      <div
        style={{
          position: 'absolute',
          left: 108,
          top: 268,
          width: 1130,
          height: 500,
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(173,200,222,0.2)',
          boxShadow: '0 46px 120px rgba(0,0,0,0.6)',
          opacity: inP * (1 - outro * 0.55),
          transform: `translateX(${(1 - artP) * 38}px) scale(${0.985 + artP * 0.015 - slot * 0.01 - outro * 0.02})`,
        }}
      >
        <ProjectArt project={project} width={1130} height={500} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 108,
          top: 268 + 500 + 16,
          fontFamily: FONT.mono,
          fontSize: 15,
          letterSpacing: 2.2,
          color: 'rgba(187,199,216,0.5)',
          opacity: copyIn,
        }}
      >
        {project.no} / 04 · {project.title.toUpperCase()}
      </div>

      {/* copy */}
      <div
        style={{
          position: 'absolute',
          left: 1312,
          top: 300,
          width: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          opacity: copyIn * (1 - outro * 0.55),
          transform: `translateY(${(1 - copyIn) * 20}px)`,
        }}
      >
        <Kicker color={COLORS.accent}>PROJECT {project.no}</Kicker>
        <div style={{fontFamily: FONT.sans, fontSize: 66, fontWeight: 500, letterSpacing: -1.6, lineHeight: 1.04, color: COLORS.ink}}>
          {project.title}
        </div>
        <TypePill>{project.type}</TypePill>
        <div style={{fontFamily: FONT.sans, fontSize: 23, lineHeight: 1.72, color: '#c0cddb', marginTop: 6}}>{project.desc}</div>
      </div>

      {/* the section's real link, closing the tour */}
      <div
        style={{
          position: 'absolute',
          left: 1312,
          bottom: 192,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: outro,
          transform: `translateY(${(1 - outro) * 16}px)`,
        }}
      >
        <span style={{fontFamily: FONT.cjk, fontSize: 21, color: '#b5c4d7'}}>全部项目</span>
        <span style={{fontFamily: FONT.mono, fontSize: 14, letterSpacing: 1.4, color: 'rgba(187,199,216,0.6)'}}>
          github.com/Eileenes
        </span>
        <span style={{color: COLORS.accent, fontSize: 20}}>↗</span>
      </div>

      <Grain opacity={0.055} />
      {/* beat flash on each cut */}
      <AbsoluteFill style={{background: '#d9edf0', opacity: Math.max(0, 0.1 - local * 0.02)}} />
    </AbsoluteFill>
  );
};
