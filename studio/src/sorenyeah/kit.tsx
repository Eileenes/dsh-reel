/**
 * Shared kit for the Sorenyeah home film.
 * Everything is a pure function of the current frame.
 */

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, COLORS, VIDEO, clamp} from './tokens';

/** Spring helper used by every entrance. */
export const useSpringIn = (delay = 0, config = {damping: 200, mass: 0.7, stiffness: 120}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring(frame - delay, fps, config);
};

export const spring = (frame: number, fps: number, config: {damping: number; mass: number; stiffness: number}) => {
  const f = Math.max(0, frame);
  const w = (config.stiffness / config.mass) ** 0.5;
  const z = config.damping / (2 * Math.sqrt(config.stiffness * config.mass));
  if (z >= 1) {
    return 1 - Math.exp(-w * f / fps) * (1 + (w * f) / fps);
  }
  const wd = w * Math.sqrt(1 - z * z);
  const t = f / fps;
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
};

export const Rise: React.FC<{
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({delay = 0, distance = 36, style, children}) => {
  const p = useSpringIn(delay);
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style}}>{children}</div>
  );
};

/** Mono kicker line with a glowing dot, as used across the film. */
export const Kicker: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
  dot?: boolean;
}> = ({children, color = COLORS.accent, style, dot = true}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: FONT.mono,
      fontSize: 19,
      letterSpacing: 4.5,
      textTransform: 'uppercase',
      color,
      ...style,
    }}
  >
    {dot ? (
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: color,
          boxShadow: `0 0 16px ${color}`,
          display: 'inline-block',
        }}
      />
    ) : null}
    {children}
  </div>
);

/** Grain + vignette that keeps every frame feeling like the site's surface. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.055}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Img
      src={staticFile('sorenyeah/images/landscape-grain.png')}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse 74% 62% at 50% 44%, rgba(0,0,0,0) 42%, rgba(3,5,10,0.62) 100%)',
      }}
    />
  </AbsoluteFill>
);

/** Ink ground: the site's midnight surface with the teal/rose ambient glow. */
export const Ink: React.FC<{brightness?: number}> = ({brightness = 1}) => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  const a = Math.sin(t * 0.55) * 0.5 + 0.5;
  const b = Math.cos(t * 0.4) * 0.5 + 0.5;
  return (
    <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: '-12%',
          top: '-22%',
          width: '70%',
          height: '86%',
          background: `radial-gradient(circle, rgba(120,202,213,${0.1 * brightness}) 0%, rgba(120,202,213,0) 68%)`,
          filter: 'blur(30px)',
          transform: `translate(${a * 24}px, ${b * 14}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '-16%',
          bottom: '-30%',
          width: '74%',
          height: '92%',
          background: `radial-gradient(circle, rgba(207,140,193,${0.11 * brightness}) 0%, rgba(167,106,124,0) 66%)`,
          filter: 'blur(34px)',
          transform: `translate(${b * -22}px, ${a * -16}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8,11,18,0.35) 0%, rgba(8,11,18,0) 40%, rgba(8,11,18,0.5) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * The site's own hero landscape: sky + glows, three ridge layers, vignette.
 * Three separate SVG layers so the ridges can drift a pixel or two apart.
 */
export const Landscape: React.FC<{
  opacity?: number;
  y?: number;
  scale?: number;
  drift?: number;
  /** 0..1 extra warm light on the horizon */
  glow?: number;
}> = ({opacity = 0.55, y = 0, scale = 1.04, drift = 1, glow = 0}) => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  const dy = Math.sin(t * 0.32) * 3 * drift;
  const dx = Math.cos(t * 0.23) * 4 * drift;
  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity}}>
      <div
        style={{
          position: 'absolute',
          inset: '-2%',
          transform: `translate(${dx * 0.4}px, ${y + dy * 0.4}px) scale(${scale})`,
        }}
      >
        <Img src={staticFile('sorenyeah/landscape-sky.svg')} style={layerStyle} />
        {glow > 0 ? (
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 46% 26% at 66% 56%, rgba(242,184,172,${0.5 * glow}) 0%, rgba(207,140,193,0) 70%)`,
              mixBlendMode: 'screen',
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: '-2%',
          transform: `translate(${-dx * 0.8}px, ${y + dy}px) scale(${scale * 1.006})`,
        }}
      >
        <Img src={staticFile('sorenyeah/landscape-ridges.svg')} style={layerStyle} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: '-2%',
          transform: `translate(0px, ${y}px) scale(${scale})`,
        }}
      >
        <Img src={staticFile('sorenyeah/landscape-overlay.svg')} style={layerStyle} />
      </div>
    </AbsoluteFill>
  );
};

/** A browser window carrying a real screenshot of the site. */
export const BrowserWindow: React.FC<{
  width: number;
  title?: string;
  chrome?: number;
  radius?: number;
  scrollY?: number;
  image?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  width,
  title = 'sorenyeah.com',
  chrome = 54,
  radius = 18,
  scrollY = 0,
  image = 'sorenyeah/shots/home-hero.png',
  children,
  style,
}) => {
  const contentH = width * (1800 / 2880);
  return (
    <div
      style={{
        width,
        borderRadius: radius,
        overflow: 'hidden',
        background: '#0a0f1a',
        border: '1px solid rgba(164,175,194,0.22)',
        boxShadow: '0 70px 180px rgba(0,0,0,0.72), 0 0 0 1px rgba(130,233,255,0.06)',
        ...style,
      }}
    >
      <div
        style={{
          height: chrome,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 18px',
          background: 'linear-gradient(180deg, #131b29 0%, #0d1421 100%)',
          borderBottom: '1px solid rgba(164,175,194,0.16)',
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{width: 11, height: 11, borderRadius: 99, background: c, opacity: 0.8}} />
        ))}
        <div
          style={{
            marginLeft: 16,
            flex: 1,
            maxWidth: 420,
            height: 26,
            borderRadius: 13,
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(164,175,194,0.14)',
            color: '#8f9cb2',
            fontFamily: FONT.mono,
            fontSize: 13,
            letterSpacing: 0.4,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 13,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{height: contentH, overflow: 'hidden', position: 'relative'}}>
        {children ?? (
          <Img
            src={staticFile(image)}
            style={{
              width: '100%',
              display: 'block',
              transform: `translateY(${-scrollY * width / 1440}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

/** Section heading in the site's voice: heavy CJK, one accent period. */
export const SectionTitle: React.FC<{
  children: React.ReactNode;
  accent?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, accent = COLORS.accent, size = 104, style}) => (
  <div
    style={{
      fontFamily: FONT.cjk,
      fontSize: size,
      lineHeight: 1.06,
      fontWeight: 600,
      letterSpacing: -2,
      color: COLORS.ink,
      ...style,
    }}
  >
    {children}
    <span style={{color: accent, fontWeight: 500}}>.</span>
  </div>
);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const useProgress = (from: number, to: number) => {
  const frame = useCurrentFrame();
  return clamp01((frame - from) / Math.max(1, to - from));
};

export const eased = (x: number, kind: 'out' | 'inout' | 'expo' = 'out') => {
  const t = clamp01(x);
  if (kind === 'expo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  if (kind === 'inout') return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return 1 - Math.pow(1 - t, 3);
};

export {clamp};
