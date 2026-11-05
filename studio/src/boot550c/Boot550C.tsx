import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const MONO = '"SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
const SANS = '"PingFang SC", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const f = (frame: number, from: number, to: number, a: number, b: number) =>
  interpolate(frame, [from, to], [a, b], clamp);

const Blink: React.FC<{frame: number; period?: number; children?: React.ReactNode}> = ({frame, period = 14, children}) => (
  <span style={{opacity: Math.floor(frame / period) % 2 === 0 ? 1 : 0}}>{children ?? '▌'}</span>
);

const Scanlines: React.FC<{opacity?: number}> = ({opacity = 0.16}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 4px)',
      opacity,
      zIndex: 40,
    }}
  />
);

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(120% 90% at 50% 45%, transparent 42%, rgba(0,0,0,0.65) 100%)',
      zIndex: 39,
    }}
  />
);

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity: 0.08,
      zIndex: 41,
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.7'/></svg>\")",
      mixBlendMode: 'overlay',
    }}
  />
);

const Hud: React.FC<{frame: number; label: string; right?: string; accent?: string}> = ({frame, label, right, accent = '#ff4b3e'}) => (
  <>
    <div style={{position: 'absolute', left: 54, top: 38, display: 'flex', alignItems: 'center', gap: 12, zIndex: 30, fontFamily: MONO, fontSize: 13, letterSpacing: '0.16em', color: 'rgba(235,240,255,0.72)'}}>
      <span style={{width: 7, height: 7, background: accent, boxShadow: `0 0 12px ${accent}`}} />
      {label}
    </div>
    <div style={{position: 'absolute', right: 54, top: 38, zIndex: 30, fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', color: 'rgba(235,240,255,0.5)'}}>
      {right ?? '550C // UEG-SYS'} <span style={{color: accent}}>●</span> {String(Math.floor(frame / 30)).padStart(2, '0')}:{String(frame % 30).padStart(2, '0')}
    </div>
  </>
);

const Type: React.FC<{frame: number; text: string; start: number; cps?: number; style?: React.CSSProperties}> = ({frame, text, start, cps = 2.2, style}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) * cps)));
  return <span style={style}>{text.slice(0, n)}</span>;
};

const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = f(frame, 0, 18, 0, 1);
  const scale = f(frame, 0, durationInFrames, 1.04, 1.0);
  const out = f(frame, durationInFrames - 12, durationInFrames, 1, 0);
  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <AbsoluteFill style={{opacity, transform: `scale(${scale})`}}>
        <Img src={staticFile('550c/simple.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 52%, transparent 35%, rgba(0,0,0,0.55) 100%)'}} />
      <div style={{position: 'absolute', left: 64, bottom: 58, zIndex: 30, fontFamily: MONO, color: 'rgba(230,238,255,0.55)', fontSize: 12, letterSpacing: '0.22em'}}>
        550C SYSTEM BOOT <span style={{color: '#ff4b3e'}}>//</span> DSH STARTUP FILM
      </div>
      <div style={{position: 'absolute', right: 64, bottom: 58, zIndex: 30, fontFamily: MONO, color: 'rgba(230,238,255,0.38)', fontSize: 12, letterSpacing: '0.22em'}}>
        <Blink frame={frame}>INSERT CARTRIDGE</Blink>
      </div>
    </AbsoluteFill>
  );
};

const FullScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = f(frame, 0, durationInFrames, 1.06, 1.0);
  const inOp = f(frame, 0, 10, 0, 1);
  const out = f(frame, durationInFrames - 12, durationInFrames, 1, 0);
  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <AbsoluteFill style={{opacity: inOp, transform: `scale(${scale})`}}>
        <Img src={staticFile('550c/full.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 26%, transparent 62%, rgba(0,0,0,0.72) 100%)'}} />
      <Hud frame={frame} label="550C // FULL BOOT" right="OVERRIDE · 47/47" />
      <div style={{position: 'absolute', left: 64, bottom: 72, zIndex: 30}}>
        <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: '0.22em', color: '#ff4b3e', marginBottom: 12}}>FULL BOOT · 17 SEC</div>
        <div style={{fontFamily: SANS, fontSize: 44, fontWeight: 650, letterSpacing: '-0.02em', color: '#f2f5ff', lineHeight: 1.2}}>
          47 个节点，<span style={{color: '#ffba4a'}}>逐点覆写</span>。
        </div>
        <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.04em', color: 'rgba(235,240,255,0.6)', marginTop: 14, lineHeight: 1.7}}>
          <Type frame={frame} text="> 完整开机流程 · 片头结束前 0.5 秒收束" start={16} cps={1.4} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AccessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = f(frame, 0, durationInFrames, 1.04, 1.0);
  const out = f(frame, durationInFrames - 12, durationInFrames, 1, 0);
  const grant = f(frame, 44, 56, 0, 1);
  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <Img src={staticFile('550c/cyan.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.78) 100%)'}} />
      <Hud frame={frame} label="UEG // ACCESS AUTHORIZATION" right="AWAITING CONFIRM" accent="#38d6ff" />
      <div style={{position: 'absolute', left: 64, top: 180, zIndex: 30, maxWidth: 660}}>
        <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: '0.22em', color: '#38d6ff', marginBottom: 16}}>UEG ACCESS · 三幕</div>
        <div style={{fontFamily: SANS, fontSize: 46, fontWeight: 650, letterSpacing: '-0.02em', color: '#f2f5ff', lineHeight: 1.22}}>
          片头之后，<br />你是一名<span style={{color: '#38d6ff'}}>操作员</span>。
        </div>
        <div style={{fontFamily: MONO, fontSize: 15, color: 'rgba(235,240,255,0.62)', marginTop: 18, lineHeight: 1.8}}>
          身份核验 → 权限判定 → 许可证签发<br />
          点击 / Enter 推进 · Esc 跳过
        </div>
      </div>
      <div style={{position: 'absolute', right: 64, bottom: 80, zIndex: 30, textAlign: 'right'}}>
        <div style={{fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', color: 'rgba(235,240,255,0.5)', marginBottom: 10}}>AUTH RESOLUTION</div>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: '0.12em', color: '#8cf7c9', opacity: grant}}>
          ▸ 核验通过 · ACCESS GRANTED <Blink frame={frame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const out = f(frame, durationInFrames - 12, durationInFrames, 1, 0);
  const scale = f(frame, 0, durationInFrames, 1.07, 1.0);
  const chips = [
    ['01', '两个档位', '简易 4s / 完整 17s / 关闭'],
    ['02', '两套主题', 'UEG 公文风 / 550C 终端风'],
    ['03', '可 DIY', '身份卡 · 二维码 · 开机音乐'],
    ['04', '随时跳过', '点击 / Esc · 不打断 DSH'],
  ];
  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, opacity: 0.55}}>
        <Img src={staticFile('550c/full.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.78), rgba(0,0,0,0.9))'}} />
      <Hud frame={frame} label="550C // SETTINGS" right="PLUGIN CONTROL" accent="#ffba4a" />
      <div style={{position: 'absolute', left: 64, top: 150, zIndex: 30}}>
        <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: '0.22em', color: '#ffba4a', marginBottom: 14}}>MORE THAN A BOOT FILM</div>
        <div style={{fontFamily: SANS, fontSize: 50, fontWeight: 650, letterSpacing: '-0.025em', color: '#f2f5ff', lineHeight: 1.18}}>
          一套 550C，<br />开机到登录都接管。
        </div>
      </div>
      <div style={{position: 'absolute', left: 64, right: 64, bottom: 74, zIndex: 30, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
        {chips.map(([n, t, d], i) => {
          const a = f(frame, 10 + i * 6, 22 + i * 6, 0, 1);
          return (
            <div key={n} style={{opacity: a, transform: `translateY(${f(frame, 10 + i * 6, 30 + i * 6, 18, 0)}px)`, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(9,12,16,0.7)', padding: '18px 18px 16px', minHeight: 128}}>
              <div style={{fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', color: '#ff4b3e', marginBottom: 10}}>{n}</div>
              <div style={{fontFamily: SANS, fontSize: 21, fontWeight: 600, color: '#f2f5ff', marginBottom: 6}}>{t}</div>
              <div style={{fontFamily: MONO, fontSize: 11.5, lineHeight: 1.6, color: 'rgba(235,240,255,0.55)'}}>{d}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const a = f(frame, 0, 18, 0, 1);
  const y = f(frame, 0, 24, 16, 0);
  return (
    <AbsoluteFill style={{background: '#050608', opacity: a}}>
      <AbsoluteFill style={{opacity: 0.26}}>
        <Img src={staticFile('550c/simple.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(80% 70% at 50% 44%, transparent 20%, rgba(0,0,0,0.78) 100%)'}} />
      <div style={{position: 'absolute', left: 80, top: 300, zIndex: 30, transform: `translateY(${y}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 14, letterSpacing: '0.22em', color: '#ff4b3e', marginBottom: 20}}>DSH PLUGIN · STARTUP FILM</div>
        <div style={{fontFamily: MONO, fontSize: 82, fontWeight: 600, letterSpacing: '-0.03em', color: '#f2f5ff', lineHeight: 1}}>dsh-550c-boot</div>
        <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 500, color: 'rgba(235,240,255,0.78)', marginTop: 22, lineHeight: 1.5}}>
          给 DSH 加一段 550C 开机片头，<br />接一段能点着玩的 UEG 访问授权。
        </div>
        <div style={{marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 14, border: '1px solid rgba(255,75,62,0.4)', background: 'rgba(0,0,0,0.45)', padding: '16px 22px'}}>
          <span style={{fontFamily: MONO, fontSize: 16, color: '#ff4b3e'}}>$</span>
          <span style={{fontFamily: MONO, fontSize: 24, color: '#f2f5ff', letterSpacing: '0.01em'}}>npm i dsh-550c-boot</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, bottom: 60, zIndex: 30, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em', color: 'rgba(235,240,255,0.42)'}}>
        <span>MIT · github.com/yannicksong0106/dsh-550c-boot</span>
        <span>550C // SYSTEM BOOT <span style={{color: '#ff4b3e'}}>●</span></span>
      </div>
    </AbsoluteFill>
  );
};

const GlitchOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = [88, 296, 470, 596].some((x) => frame >= x && frame <= x + 5);
  if (!pulse) return null;
  return (
    <AbsoluteFill style={{zIndex: 50, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{position: 'absolute', left: `${(i * 23 + frame * 7) % 80}%`, top: `${(i * 17 + frame * 3) % 90}%`, width: '30%', height: 3, background: i % 2 ? 'rgba(255,75,62,0.7)' : 'rgba(56,214,255,0.7)', opacity: 0.8}} />
      ))}
    </AbsoluteFill>
  );
};

export const Boot550C: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#020304', overflow: 'hidden'}}>
      <Sequence from={0} durationInFrames={90}><LogoScene /></Sequence>
      <Sequence from={90} durationInFrames={210}><FullScene /></Sequence>
      <Sequence from={300} durationInFrames={180}><AccessScene /></Sequence>
      <Sequence from={480} durationInFrames={120}><FeatureScene /></Sequence>
      <Sequence from={600} durationInFrames={120}><EndScene /></Sequence>
      <Scanlines />
      <Vignette />
      <Grain />
      <GlitchOverlay />
    </AbsoluteFill>
  );
};
