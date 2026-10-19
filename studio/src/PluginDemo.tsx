import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, MONO, ZH} from './theme';
import {defaultReel, ReelData} from './data';
import {DshWordmark, WhaleMascot} from './Mascot';
import {SideChatMock, TaskTopologyMock} from './Mocks';

const ReelContext = React.createContext<ReelData>(defaultReel);
const useReel = () => React.useContext(ReelContext);

const TOTAL = 975;
const FPS = 30;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const rise = (frame: number, fps: number, delay = 0, distance = 46) => {
  const p = spring({frame: frame - delay, fps, config: {damping: 200, mass: 0.7, stiffness: 120}});
  return {
    opacity: p,
    transform: 'translateY(' + (1 - p) * distance + 'px)',
  };
};

const Rise: React.FC<{delay?: number; distance?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  delay = 0,
  distance = 46,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div style={{...rise(frame, fps, delay, distance), ...style}}>{children}</div>;
};

const Pill: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.blue}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 18px',
      borderRadius: 999,
      border: '1px solid ' + color + '66',
      background: color + '14',
      color,
      fontFamily: MONO,
      fontSize: 17,
      letterSpacing: 3,
      textTransform: 'uppercase',
    }}
  >
    <span style={{width: 7, height: 7, borderRadius: 99, background: color, boxShadow: '0 0 14px ' + color}} />
    {children}
  </div>
);

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift1 = Math.sin(frame / 110) * 46;
  const drift2 = Math.cos(frame / 140) * 38;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #05070d 0%, #080d19 45%, #05070d 100%)', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 78%)',
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 980,
          height: 980,
          borderRadius: '50%',
          left: -260 + drift1,
          top: -420,
          background: 'radial-gradient(circle, rgba(77,107,254,0.32) 0%, rgba(77,107,254,0) 64%)',
          filter: 'blur(24px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 860,
          height: 860,
          borderRadius: '50%',
          right: -220 + drift2,
          bottom: -380,
          background: 'radial-gradient(circle, rgba(94,242,194,0.18) 0%, rgba(94,242,194,0) 66%)',
          filter: 'blur(28px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.68) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(77,107,254,0.55), rgba(94,242,194,0.4), transparent)',
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};

const SceneFade: React.FC<{duration: number; children: React.ReactNode}> = ({duration, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], clamp);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const BrowserFrame: React.FC<{
  src: string;
  width: number;
  theme?: 'light' | 'dark';
  style?: React.CSSProperties;
}> = ({src, width, theme = 'light', style}) => {
  const light = theme === 'light';
  return (
    <div
      style={{
        width,
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.16)',
        background: light ? '#eef2f9' : '#0b0f19',
        boxShadow: '0 60px 160px rgba(0,0,0,0.65), 0 0 0 1px rgba(77,107,254,0.18)',
        ...style,
      }}
    >
      <div
        style={{
          height: 42,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 16px',
          background: light ? '#e5eaf3' : '#0c1220',
          borderBottom: light ? '1px solid #d5dce8' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{width: 12, height: 12, borderRadius: 99, background: c, opacity: 0.9}} />
        ))}
        <div
          style={{
            marginLeft: 14,
            flex: 1,
            maxWidth: 460,
            height: 24,
            borderRadius: 12,
            background: light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
            color: light ? '#64748b' : '#8b96b0',
            fontSize: 12,
            fontFamily: MONO,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
          }}
        >
          dsh / better-sidebar
        </div>
      </div>
      <Img src={staticFile(src)} style={{width: '100%', display: 'block'}} />
    </div>
  );
};

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {plugin} = useReel();
  return (
    <AbsoluteFill style={{fontFamily: ZH}}>
      <Img
        src={staticFile('shots/files-tree.png')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.09,
          filter: 'blur(16px)',
          transform: 'scale(1.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -60,
          bottom: 30,
          fontFamily: MONO,
          fontSize: 190,
          fontWeight: 900,
          letterSpacing: -8,
          color: 'rgba(255,255,255,0.035)',
          whiteSpace: 'nowrap',
          transform: 'rotate(-90deg)',
          transformOrigin: 'right bottom',
        }}
      >
        BETTER SIDEBAR
      </div>
      <div style={{position: 'absolute', left: 110, top: 108}}>
        <Rise delay={2} distance={24}>
          <Pill>DSH PLUGIN · BETTER SIDEBAR</Pill>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 106, top: 300, width: 1500}}>
        <Rise delay={8} distance={54}>
          <div style={{fontSize: 116, lineHeight: 1.12, fontWeight: 800, letterSpacing: -3, color: C.text}}>
            你的 DSH 侧边栏，
          </div>
        </Rise>
        <Rise delay={18} distance={54}>
          <div style={{fontSize: 116, lineHeight: 1.12, fontWeight: 800, letterSpacing: -3, color: C.dim, marginTop: 6}}>
            还只是个
            <span style={{color: C.amber, marginLeft: 18, textDecoration: 'line-through', textDecorationThickness: 8, textDecorationColor: C.amber}}>
              文件列表
            </span>
            ?
          </div>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 110, top: 690, width: 1200}}>
        <Rise delay={34}>
          <div style={{fontSize: 30, color: C.dim, letterSpacing: 1}}>
            但一个会话，本来就有五个工作面。
          </div>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 110, bottom: 96}}>
        <Rise delay={44}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <DshWordmark scale={0.9} />
            <span style={{fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2}}>PLUGIN</span>
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', right: 100, bottom: 120}}>
        <Rise delay={48}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '18px 26px',
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(10,16,32,0.72)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Img src={staticFile('shots/avatar.png')} style={{width: 52, height: 52, borderRadius: 14}} />
            <div>
              <div style={{fontSize: 26, fontWeight: 700, color: C.text}}>{plugin.name}</div>
              <div style={{fontSize: 15, color: C.dim, fontFamily: MONO, marginTop: 4}}>{plugin.downloads.toLocaleString()} downloads / week</div>
            </div>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chips = [
    {label: '文件', color: C.blue},
    {label: 'Git', color: C.mint},
    {label: '终端', color: C.amber},
    {label: '子代理', color: C.blue2},
    {label: '侧聊', color: C.red},
  ];
  return (
    <AbsoluteFill style={{fontFamily: ZH}}>
      <div style={{position: 'absolute', left: 110, top: 118}}>
        <Rise delay={2} distance={20}>
          <Pill color={C.amber}>THE PROBLEM</Pill>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 106, top: 230, width: 1600}}>
        <Rise delay={10} distance={50}>
          <div style={{fontSize: 96, fontWeight: 800, color: C.text, letterSpacing: -2}}>来回切窗口，思路全断。</div>
        </Rise>
        <Rise delay={22}>
          <div style={{fontSize: 30, color: C.dim, marginTop: 28, letterSpacing: 1}}>一个会话，五个工作面，却只有半块屏幕。</div>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', gap: 24}}>
        {chips.map((chip, i) => {
          const p = spring({frame: frame - 32 - i * 7, fps, config: {damping: 180, mass: 0.7}});
          return (
            <div
              key={chip.label}
              style={{
                opacity: p,
                transform: 'translateY(' + (1 - p) * 60 + 'px) rotate(' + ((i - 2) * 2.2) * (1 - p) + 'deg)',
                padding: '26px 34px',
                borderRadius: 22,
                border: '1px solid ' + chip.color + '55',
                background: chip.color + '12',
                color: C.text,
                fontSize: 34,
                fontWeight: 700,
                minWidth: 168,
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              }}
            >
              <span style={{display: 'block', width: 10, height: 10, borderRadius: 99, background: chip.color, margin: '0 auto 16px', boxShadow: '0 0 16px ' + chip.color}} />
              {chip.label}
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center'}}>
        <Rise delay={78}>
          <div style={{fontSize: 24, color: 'rgba(255,255,255,0.45)', fontFamily: MONO, letterSpacing: 3}}>
            Ctrl + Tab · Ctrl + Tab · Ctrl + Tab
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {plugin} = useReel();
  const enter = spring({frame: frame - 14, fps, config: {damping: 200, mass: 0.8}});
  const float = Math.sin(frame / 26) * 8;
  return (
    <AbsoluteFill style={{fontFamily: ZH}}>
      <div style={{position: 'absolute', left: 110, top: 118}}>
        <Rise delay={2} distance={20}>
          <Pill color={C.mint}>THE FIX</Pill>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 106, top: 224, width: 760}}>
        <Rise delay={10} distance={50}>
          <div style={{fontSize: 104, lineHeight: 1.05, fontWeight: 800, color: C.text, letterSpacing: -3}}>Better<br />Sidebar</div>
        </Rise>
        <Rise delay={24}>
          <div style={{fontSize: 32, color: C.mint, marginTop: 26, fontWeight: 600}}>{plugin.tagline}</div>
        </Rise>
        <Rise delay={36}>
          <div style={{fontSize: 23, color: C.dim, marginTop: 18, lineHeight: 1.7}}>
            原生右栏 + 自绘底部面板，属于每个会话的独立工作台。
          </div>
        </Rise>
        <div style={{marginTop: 44, display: 'flex', flexDirection: 'column', gap: 18}}>
          {[
            ['01', '文件、编辑器、Git、任务、侧聊，一个侧栏全收'],
            ['02', '可拖拽分栏 + 多终端，底部工作台与会话绑定'],
            ['03', '开放 ctx.betterSidebar，其他插件也能注册页面'],
          ].map((row, i) => (
            <Rise key={row[0]} delay={48 + i * 8}>
              <div style={{display: 'flex', alignItems: 'flex-start', gap: 16}}>
                <span style={{fontFamily: MONO, fontSize: 15, color: C.blue2, marginTop: 5}}>{row[0]}</span>
                <span style={{fontSize: 24, color: 'rgba(244,247,255,0.86)', lineHeight: 1.55}}>{row[1]}</span>
              </div>
            </Rise>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 62,
          top: 168 + float,
          opacity: enter,
          transform: 'translateY(' + (1 - enter) * 70 + 'px) scale(' + (0.96 + enter * 0.04) + ')',
        }}
      >
        <div style={{position: 'absolute', inset: -60, background: 'radial-gradient(circle, rgba(77,107,254,0.28), transparent 66%)', filter: 'blur(30px)'}} />
        <BrowserFrame src='shots/files-tree.png' width={1010} theme='light' />
        <div
          style={{
            position: 'absolute',
            left: -70,
            bottom: -54,
            padding: '18px 24px',
            borderRadius: 18,
            background: 'rgba(8,13,26,0.92)',
            border: '1px solid rgba(94,242,194,0.35)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{width: 10, height: 10, borderRadius: 99, background: C.mint, boxShadow: '0 0 18px ' + C.mint}} />
          <span style={{fontFamily: MONO, fontSize: 18, color: C.text}}>{plugin.downloads.toLocaleString()} / WEEK</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FeatureCard: React.FC<{
  index: number;
  no: string;
  title: string;
  desc: string;
  img?: string;
  mock?: 'tasks' | 'sidechat';
  accent: string;
}> = ({index, no, title, desc, img, mock, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 15 - index * 15, fps, config: {damping: 190, mass: 0.8}});
  return (
    <div
      style={{
        width: 820,
        height: 332,
        borderRadius: 22,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(16,24,44,0.94), rgba(8,13,26,0.96))',
        border: '1px solid ' + accent + '3d',
        boxShadow: '0 30px 90px rgba(0,0,0,0.42)',
        opacity: p,
        transform: 'translateY(' + (1 - p) * 70 + 'px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{height: 238, overflow: 'hidden', position: 'relative', background: '#0a0f1c'}}>
        {mock === 'tasks' ? <TaskTopologyMock /> : mock === 'sidechat' ? <SideChatMock /> : img ? <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center'}} /> : null}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 58%, rgba(8,13,26,0.92) 100%)'}} />
        {mock ? null : <div style={{position: 'absolute', left: 24, top: 20, fontFamily: MONO, fontSize: 15, color: accent, letterSpacing: 2}}>{no}</div>}
      </div>
      <div style={{flex: 1, padding: '18px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontSize: 32, fontWeight: 700, color: C.text}}>
          {mock ? <span style={{fontFamily: MONO, fontSize: 17, color: accent, marginRight: 12, letterSpacing: 1}}>{no}</span> : null}
          {title}
        </div>
        <div style={{fontSize: 19, color: C.dim, marginTop: 8, lineHeight: 1.45}}>{desc}</div>
      </div>
    </div>
  );
};

const SceneFeatures: React.FC = () => {
  const {features} = useReel();
  return (
    <AbsoluteFill style={{fontFamily: ZH}}>
      <div style={{position: 'absolute', left: 110, top: 92}}>
        <Rise delay={2} distance={20}>
          <Pill color={C.blue}>THE WORKBENCH</Pill>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 106, top: 170, width: 1700, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
        <Rise delay={10} distance={44}>
          <div style={{fontSize: 70, fontWeight: 800, color: C.text, letterSpacing: -2}}>一个侧边栏，四张王牌。</div>
        </Rise>
        <Rise delay={18}>
          <div style={{fontFamily: MONO, fontSize: 17, color: C.dim, letterSpacing: 2}}>04 / 05 PAGES</div>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 120, top: 276, display: 'flex', flexWrap: 'wrap', gap: 38, width: 1680}}>
        {features.map((f, i) => (
          <FeatureCard key={f.no} index={i} {...f} />
        ))}
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, bottom: 66, textAlign: 'center'}}>
        <Rise delay={64}>
          <div style={{fontFamily: MONO, fontSize: 17, color: 'rgba(255,255,255,0.42)', letterSpacing: 2}}>
            + 底部终端 · Markdown / Mermaid · 多仓库 Git · 开放插件 API
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const SceneHowTo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {plugin, promo} = useReel();
  const steps = [
    {no: '01', title: '安装插件', desc: '一行命令装进你的 DSH profile', cmd: plugin.install, color: C.blue},
    {no: '02', title: '打开右侧栏', desc: '每个会话独立布局，不打断主对话', cmd: 'right sidebar · per session', color: C.mint},
    {no: '03', title: '按 tab 使用', desc: '文件 / Git / 任务 / 侧聊 / 终端', cmd: 'files · git · tasks · chat', color: C.amber},
  ];
  return (
    <AbsoluteFill style={{fontFamily: ZH}}>
      <div style={{position: 'absolute', left: 110, top: 96}}>
        <Rise delay={2} distance={20}>
          <Pill color={C.blue}>HOW TO USE</Pill>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 106, top: 196, width: 1700}}>
        <Rise delay={10} distance={44}>
          <div style={{fontSize: 72, fontWeight: 800, color: C.text, letterSpacing: -2}}>三步，把侧栏变成工作台。</div>
        </Rise>
        <Rise delay={20}>
          <div style={{fontSize: 26, color: C.dim, marginTop: 16}}>{promo.what}</div>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 150, top: 392, display: 'flex', gap: 28}}>
        {steps.map((s, i) => {
          const p = spring({frame: frame - 15 - i * 15, fps, config: {damping: 190, mass: 0.8}});
          return (
            <div
              key={s.no}
              style={{
                width: 520,
                height: 300,
                borderRadius: 22,
                padding: '26px 28px',
                background: 'rgba(10,17,32,0.9)',
                border: '1px solid ' + s.color + '3d',
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                opacity: p,
                transform: 'translateY(' + (1 - p) * 60 + 'px)',
              }}
            >
              <div style={{fontFamily: MONO, fontSize: 54, fontWeight: 700, color: s.color + '66', lineHeight: 1}}>{s.no}</div>
              <div style={{fontSize: 32, fontWeight: 750, color: C.text, marginTop: 22}}>{s.title}</div>
              <div style={{fontSize: 20, color: C.dim, marginTop: 10, lineHeight: 1.5}}>{s.desc}</div>
              <div style={{fontFamily: MONO, fontSize: 12, color: s.color, marginTop: 18, wordBreak: 'break-all'}}>{i === 0 ? '$ ' : '· '}{s.cmd}</div>
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center'}}>
        <Rise delay={70}>
          <div style={{fontFamily: MONO, fontSize: 17, color: 'rgba(255,255,255,0.42)', letterSpacing: 2}}>
            {promo.address}
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const {plugin} = useReel();
  const count = (target: number, start: number) =>
    Math.round(interpolate(frame, [start, start + 34], [0, target], clamp));
  const downloads = count(plugin.downloads, 26);
  const stars = count(plugin.stars, 34);
  const install = plugin.install;
  const typed = Math.floor(interpolate(frame, [34, 86], [0, install.length], clamp));
  const command = install.slice(0, typed);
  const cursorOn = Math.floor(frame / 12) % 2 === 0;

  return (
    <AbsoluteFill style={{fontFamily: ZH}}>
      <div style={{position: 'absolute', left: 110, top: 96}}>
        <Rise delay={2} distance={20}>
          <Pill color={C.mint}>TRACTION</Pill>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 106, top: 176, width: 1600}}>
        <Rise delay={10} distance={44}>
          <div style={{fontSize: 72, fontWeight: 800, color: C.text, letterSpacing: -2}}>数字不会说谎。</div>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 110, right: 110, top: 300, display: 'flex', justifyContent: 'space-between'}}>
        {[
          {num: downloads.toLocaleString(), label: 'WEEKLY DOWNLOADS', color: C.blue},
          {num: stars.toLocaleString(), label: 'GitHub Stars', color: C.mint},
          {num: 'MIT', label: 'License', color: C.amber},
        ].map((s, i) => (
          <Rise key={s.label} delay={20 + i * 8} style={{flex: 1}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{fontSize: 132, fontWeight: 850, color: s.color, letterSpacing: -4, lineHeight: 1}}>{s.num}</div>
              <div style={{fontFamily: MONO, fontSize: 17, color: C.dim, letterSpacing: 3, marginTop: 16, textTransform: 'uppercase'}}>{s.label}</div>
            </div>
          </Rise>
        ))}
      </div>

      <div style={{position: 'absolute', left: 310, top: 580, width: 1300}}>
        <Rise delay={34}>
          <div
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(8,13,26,0.9)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: '#0c1220', borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <span key={c} style={{width: 11, height: 11, borderRadius: 99, background: c, opacity: 0.85}} />
              ))}
              <span style={{marginLeft: 14, fontFamily: MONO, fontSize: 12, color: '#7c87a1'}}>install.sh</span>
            </div>
            <div style={{padding: '26px 30px', fontFamily: MONO, fontSize: 25, color: C.mint, display: 'flex', alignItems: 'center', minHeight: 88}}>
              <span style={{color: C.dim, marginRight: 14}}>$</span>
              <span>{command}</span>
              <span style={{display: 'inline-block', width: 13, height: 30, background: C.mint, marginLeft: 6, opacity: cursorOn ? 0.25 : 0.9}} />
            </div>
          </div>
        </Rise>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center'}}>
        <Rise delay={92}>
          <div style={{fontSize: 26, color: 'rgba(244,247,255,0.72)'}}>装上它，把侧栏变成工作台。</div>
          <div style={{fontFamily: MONO, fontSize: 16, color: C.dim, marginTop: 12}}>{plugin.repo} · DSH 0.2.1-rc.1+ · v{plugin.version}</div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {plugin} = useReel();
  return (
    <AbsoluteFill style={{fontFamily: ZH, justifyContent: 'center', alignItems: 'center'}}>
      <Rise delay={4} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div
          style={{
            width: 168,
            height: 168,
            borderRadius: 40,
            background: 'linear-gradient(135deg, #4d6bfe 0%, #5ef2c2 100%)',
            position: 'relative',
            boxShadow: '0 30px 90px rgba(77,107,254,0.45)',
          }}
        >
          <div style={{position: 'absolute', left: 26, top: 26, width: 40, height: 116, borderRadius: 12, background: 'rgba(5,7,13,0.82)'}} />
          <div style={{position: 'absolute', right: 26, top: 26, width: 70, height: 76, borderRadius: 12, background: 'rgba(5,7,13,0.5)'}} />
          <div style={{position: 'absolute', left: 26, right: 26, bottom: 26, height: 24, borderRadius: 9, background: 'rgba(5,7,13,0.34)'}} />
        </div>
        <div style={{fontSize: 88, fontWeight: 850, color: C.text, letterSpacing: -2, marginTop: 42}}>{plugin.name}</div>
        <div style={{fontSize: 32, color: C.mint, marginTop: 18}}>{plugin.tagline}</div>
        <div style={{fontFamily: MONO, fontSize: 19, color: C.dim, marginTop: 40, letterSpacing: 1}}>{plugin.repo}</div>
        <div style={{fontFamily: MONO, fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 28, letterSpacing: 3}}>DEMO REEL · MADE WITH DSH-REEL</div>
      </Rise>
      <div style={{position: 'absolute', right: 132, top: 196, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.95}}>
        <div style={{padding: '10px 16px', borderRadius: 14, background: 'rgba(8,14,28,0.92)', border: '1px solid rgba(94,242,194,0.35)', fontSize: 18, color: C.text, marginBottom: 10}}>装上它</div>
        <WhaleMascot size={168} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#05070d',
          opacity: interpolate(frame, [durationInFrames - 18, durationInFrames], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = [105, 225, 375, 555, 705, 855];
  let opacity = 0;
  for (const c of cuts) {
    const d = Math.abs(frame - c);
    if (d <= 4) opacity = Math.max(opacity, ((4 - d) / 4) * 0.16);
  }
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, background: 'linear-gradient(90deg, #4d6bfe, #5ef2c2)'}} />
  );
};

const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const {plugin} = useReel();
  const seconds = Math.floor(frame / FPS);
  return (
    <>
      <div style={{position: 'absolute', top: 34, left: 64, fontFamily: MONO, fontSize: 14, letterSpacing: 3, color: 'rgba(255,255,255,0.42)'}}>
        DSH REEL / 001
      </div>
      <div style={{position: 'absolute', top: 34, right: 64, fontFamily: MONO, fontSize: 14, letterSpacing: 3, color: 'rgba(255,255,255,0.32)'}}>
        BETTER SIDEBAR · {plugin.version}
      </div>
      <div style={{position: 'absolute', bottom: 28, right: 64, fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: 'rgba(255,255,255,0.3)'}}>
        00:{String(seconds).padStart(2, '0')} / 00:32
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 4, width: (frame / TOTAL) * 1920, background: 'linear-gradient(90deg, #4d6bfe, #5ef2c2)'}} />
      <div
        style={{
          position: 'absolute',
          left: 64,
          bottom: 30,
          width: 9,
          height: 9,
          borderRadius: 99,
          background: C.mint,
          opacity: 0.4 + 0.6 * (1 - (frame % 15) / 15),
          transform: 'scale(' + (1 + ((frame % 15) / 15) * 1.6) + ')',
          boxShadow: '0 0 16px ' + C.mint,
        }}
      />
    </>
  );
};

export const PluginDemo: React.FC<Partial<ReelData>> = (props) => {
  const data: ReelData = {
    plugin: {...defaultReel.plugin, ...(props.plugin || {})},
    features: props.features ?? defaultReel.features,
    promo: props.promo ?? defaultReel.promo,
  };
  return (
    <ReelContext.Provider value={data}>
    <AbsoluteFill style={{background: C.bg0}}>
      <Backdrop />
      <Audio src={staticFile('audio/bgm.wav')} volume={0.45} />
      <Sequence from={0} durationInFrames={105}>
        <SceneFade duration={105}><SceneHook /></SceneFade>
      </Sequence>
      <Sequence from={105} durationInFrames={120}>
        <SceneFade duration={120}><SceneProblem /></SceneFade>
      </Sequence>
      <Sequence from={225} durationInFrames={150}>
        <SceneFade duration={150}><SceneSolution /></SceneFade>
      </Sequence>
      <Sequence from={375} durationInFrames={180}>
        <SceneFade duration={180}><SceneFeatures /></SceneFade>
      </Sequence>
      <Sequence from={555} durationInFrames={150}>
        <SceneFade duration={150}><SceneHowTo /></SceneFade>
      </Sequence>
      <Sequence from={705} durationInFrames={150}>
        <SceneFade duration={150}><SceneProof /></SceneFade>
      </Sequence>
      <Sequence from={855} durationInFrames={120}>
        <SceneFade duration={120}><SceneOutro /></SceneFade>
      </Sequence>
      <CutFlash />
      <HUD />
    </AbsoluteFill>
    </ReelContext.Provider>
  );
};
