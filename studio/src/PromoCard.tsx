import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, ZH} from './theme';
import {defaultReel, ReelData} from './data';
import {DshWordmark, WhaleMascot} from './Mascot';
import {TaskTopologyMock} from './Mocks';

const ShotFrame: React.FC<{src: string; width: number; theme?: 'light' | 'dark'}> = ({src, width, theme = 'light'}) => {
  const light = theme === 'light';
  return (
    <div
      style={{
        width,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.16)',
        background: light ? '#eef2f9' : '#0a0f1c',
        boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(77,107,254,0.18)',
      }}
    >
      <div
        style={{
          height: 34,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 14px',
          background: light ? '#e5eaf3' : '#0c1220',
          borderBottom: light ? '1px solid #d5dce8' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{width: 10, height: 10, borderRadius: 99, background: c, opacity: 0.9}} />
        ))}
        <span style={{marginLeft: 10, fontFamily: MONO, fontSize: 10, color: light ? '#64748b' : '#7c87a1'}}>dsh / better-sidebar</span>
      </div>
      <Img src={staticFile(src)} style={{width: '100%', display: 'block'}} />
    </div>
  );
};

const Badge: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.blue2}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 11px',
      borderRadius: 999,
      border: '1px solid ' + color + '55',
      background: color + '14',
      color,
      fontFamily: MONO,
      fontSize: 12,
      letterSpacing: 1.5,
    }}
  >
    <span style={{width: 5, height: 5, borderRadius: 99, background: color}} />
    {children}
  </span>
);

export const PromoCard: React.FC<Partial<ReelData>> = (props) => {
  const plugin = {...defaultReel.plugin, ...(props.plugin || {})};
  const promo = {...defaultReel.promo, ...(props.promo || {})};
  const stats = [
    {value: plugin.downloads.toLocaleString(), label: '周下载'},
    {value: plugin.stars.toLocaleString(), label: 'GitHub Stars'},
    {value: 'MIT', label: 'License'},
    {value: '0.2.1+', label: 'DSH'},
  ];

  return (
    <AbsoluteFill style={{background: 'linear-gradient(155deg, #05070d 0%, #080f20 50%, #05070d 100%)', overflow: 'hidden', fontFamily: ZH, color: C.text}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '58px 58px',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 25%, transparent 82%)',
        }}
      />
      <div style={{position: 'absolute', width: 760, height: 760, borderRadius: '50%', left: -280, top: -300, background: 'radial-gradient(circle, rgba(77,107,254,0.34), transparent 64%)', filter: 'blur(26px)'}} />
      <div style={{position: 'absolute', width: 620, height: 620, borderRadius: '50%', right: -220, bottom: -220, background: 'radial-gradient(circle, rgba(94,242,194,0.2), transparent 66%)', filter: 'blur(26px)'}} />
      <WhaleMascot size={620} style={{position: 'absolute', right: -170, bottom: -120, opacity: 0.06}} />

      <div style={{position: 'absolute', inset: 0, padding: '52px 64px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44}}>
          <DshWordmark scale={1} />
          <Badge color={C.blue2}>DSH PLUGIN · 001</Badge>
        </div>

        <div style={{position: 'absolute', left: 64, top: 124, width: 700}}>
          <div style={{fontSize: 78, lineHeight: 1.02, fontWeight: 850, letterSpacing: -3}}>{plugin.name}</div>
          <div style={{fontSize: 27, color: C.mint, fontWeight: 650, marginTop: 18, letterSpacing: 0.3}}>{plugin.tagline}</div>
          <div style={{fontFamily: MONO, fontSize: 15, color: C.dim, marginTop: 12, letterSpacing: 1}}>{plugin.handle} · v{plugin.version}</div>
        </div>

        <div style={{position: 'absolute', right: 64, top: 128, width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <WhaleMascot size={252} />
          <div
            style={{
              position: 'absolute',
              left: -46,
              top: 42,
              padding: '10px 14px',
              borderRadius: 14,
              background: 'rgba(8,14,28,0.92)',
              border: '1px solid rgba(94,242,194,0.35)',
              fontSize: 18,
              fontWeight: 650,
              color: C.text,
              boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
            }}
          >
            把侧栏变成
            <br />
            工作台
          </div>
        </div>

        <div style={{position: 'absolute', left: 64, top: 332, width: 952}}>
          <ShotFrame src='shots/files-tree.png' width={952} theme='light' />
          <div
            style={{
              position: 'absolute',
              right: -18,
              bottom: -34,
              width: 300,
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid rgba(94,242,194,0.35)',
              boxShadow: '0 26px 70px rgba(0,0,0,0.55)',
              background: '#0a1020',
            }}
          >
            <div style={{height: 190, overflow: 'hidden'}}><TaskTopologyMock compact /></div>
            <div style={{padding: '8px 12px', fontFamily: MONO, fontSize: 11, color: C.mint, letterSpacing: 1}}>TASKS · 子代理拓扑</div>
          </div>
        </div>

        <div style={{position: 'absolute', left: 64, top: 1012, width: 460, padding: '18px 20px', borderRadius: 16, background: 'rgba(11,19,36,0.86)', border: '1px solid rgba(94,242,194,0.28)'}}>
          <div style={{fontFamily: MONO, fontSize: 12, color: C.mint, letterSpacing: 2}}>它是什么</div>
          <div style={{fontSize: 20, lineHeight: 1.55, color: 'rgba(244,247,255,0.9)', marginTop: 8}}>{promo.what}</div>
        </div>
        <div style={{position: 'absolute', left: 556, top: 1012, width: 460, padding: '18px 20px', borderRadius: 16, background: 'rgba(11,19,36,0.86)', border: '1px solid rgba(255,184,107,0.26)'}}>
          <div style={{fontFamily: MONO, fontSize: 12, color: C.amber, letterSpacing: 2}}>解决什么</div>
          <div style={{fontSize: 20, lineHeight: 1.55, color: 'rgba(244,247,255,0.9)', marginTop: 8}}>{promo.problem}</div>
        </div>

        <div style={{position: 'absolute', left: 64, top: 1158, width: 952}}>
          <div style={{fontFamily: MONO, fontSize: 12, color: C.dim, letterSpacing: 2, marginBottom: 10}}>三步用起来</div>
          <div style={{display: 'flex', gap: 14}}>
            {promo.how.map((step, i) => (
              <div key={step} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: 'rgba(11,19,36,0.76)', border: '1px solid rgba(255,255,255,0.09)'}}>
                <span style={{width: 34, height: 34, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', background: [C.blue, C.mint, C.amber][i] + '22', color: [C.blue, C.mint, C.amber][i], fontFamily: MONO, fontSize: 13, fontWeight: 700}}>0{i + 1}</span>
                <div>
                  <div style={{fontSize: 18, fontWeight: 650}}>{step}</div>
                  <div style={{fontFamily: MONO, fontSize: 10, color: C.dim, marginTop: 3}}>
                    {i === 0 ? 'dsh plugin add …' : i === 1 ? '右侧栏 · 会话级' : '文件 / Git / 任务 / 侧聊'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{position: 'absolute', left: 64, top: 1274, width: 952, height: 62, borderRadius: 14, background: '#07101e', border: '1px solid rgba(77,107,254,0.38)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12}}>
          <span style={{fontFamily: MONO, fontSize: 12, color: C.dim}}>INSTALL</span>
          <span style={{fontFamily: MONO, fontSize: 18, color: C.mint}}>$ {plugin.install}</span>
        </div>

        <div style={{position: 'absolute', left: 64, right: 64, top: 1360, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', gap: 18}}>
            {stats.map((s) => (
              <div key={s.label} style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
                <span style={{fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text}}>{s.value}</span>
                <span style={{fontFamily: MONO, fontSize: 10, color: C.dim, letterSpacing: 1}}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{fontFamily: MONO, fontSize: 12, color: C.dim, letterSpacing: 0.5}}>{promo.address}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
