import React from 'react';
import {C, MONO, ZH} from './theme';

const panel: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'linear-gradient(160deg, #0a1222 0%, #070d18 100%)',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: ZH,
};

const Node: React.FC<{left: number; top: number; label: string; sub: string; color: string}> = ({left, top, label, sub, color}) => (
  <div style={{position: 'absolute', left, top, width: 210, padding: '10px 12px', borderRadius: 10, background: 'rgba(17,28,51,0.95)', border: '1px solid ' + color + '55', boxShadow: '0 8px 24px rgba(0,0,0,0.35)'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 7}}>
      <span style={{width: 8, height: 8, borderRadius: 99, background: color, boxShadow: '0 0 10px ' + color}} />
      <span style={{fontFamily: MONO, fontSize: 10, color, letterSpacing: 1}}>{sub}</span>
    </div>
    <div style={{fontSize: 14, color: C.text, marginTop: 5, fontWeight: 650}}>{label}</div>
  </div>
);

export const TaskTopologyMock: React.FC<{compact?: boolean}> = ({compact = false}) => (
  <div style={{...panel, padding: compact ? '12px' : '14px'}}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontFamily: MONO, fontSize: 11, color: C.mint, letterSpacing: 2}}>TASKS · SUBAGENTS</div>
      <div style={{fontFamily: MONO, fontSize: 10, color: C.dim}}>3 ACTIVE</div>
    </div>
    <div style={{position: 'relative', height: compact ? 126 : 160, marginTop: 6}}>
      <Node left={compact ? 8 : 24} top={compact ? 6 : 8} label='Lead' sub='LEAD' color={C.blue} />
      <Node left={compact ? 110 : 270} top={compact ? 42 : 52} label='Scout' sub='SCOUT' color={C.mint} />
      <Node left={compact ? 30 : 100} top={compact ? 78 : 96} label='Exec' sub='EXEC' color={C.amber} />
      <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
        <path d='M120 45 C170 45 190 70 220 82' stroke={C.mint} strokeWidth='1.5' fill='none' opacity='.55' />
        <path d='M120 45 C130 90 120 120 150 145' stroke={C.amber} strokeWidth='1.5' fill='none' opacity='.45' />
      </svg>
    </div>
    <div style={{fontFamily: MONO, fontSize: 9, color: C.dim, marginTop: 4}}>workflow graph · background jobs · live output</div>
  </div>
);

export const SideChatMock: React.FC<{compact?: boolean}> = ({compact = false}) => (
  <div style={{...panel, padding: compact ? '14px' : '18px 20px'}}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontFamily: MONO, fontSize: 11, color: C.blue2, letterSpacing: 2}}>SIDE CHAT · BETA</div>
      <div style={{fontFamily: MONO, fontSize: 10, color: C.dim}}>ctx inherited</div>
    </div>
    <div style={{marginTop: compact ? 12 : 18, display: 'flex', flexDirection: 'column', gap: 10}}>
      <div style={{alignSelf: 'flex-start', maxWidth: '82%', padding: '10px 13px', borderRadius: '12px 12px 12px 4px', background: 'rgba(77,107,254,0.16)', border: '1px solid rgba(77,107,254,0.35)', color: 'rgba(244,247,255,0.9)', fontSize: compact ? 12 : 15, lineHeight: 1.45}}>
        用完整上下文，开一条不打断主线的侧线程。
      </div>
      <div style={{alignSelf: 'flex-end', maxWidth: '82%', padding: '10px 13px', borderRadius: '12px 12px 4px 12px', background: 'rgba(94,242,194,0.1)', border: '1px solid rgba(94,242,194,0.3)', color: 'rgba(244,247,255,0.9)', fontSize: compact ? 12 : 15, lineHeight: 1.45}}>
        独立运行 · 可撤回 · 一键提升为会话
      </div>
    </div>
    <div style={{marginTop: compact ? 12 : 18, height: compact ? 28 : 34, borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(5,10,20,0.6)', display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: MONO, fontSize: compact ? 9 : 11, color: C.dim}}>
      给侧线程发消息…
    </div>
  </div>
);
