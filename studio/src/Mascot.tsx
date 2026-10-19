import React from 'react';

export const WhaleMascot: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 220, style}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 220 176" style={style} aria-hidden="true">
    <defs>
      <linearGradient id="whaleBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6f8bff" />
        <stop offset="100%" stopColor="#3d5af0" />
      </linearGradient>
      <linearGradient id="whaleBelly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e6f8ff" />
        <stop offset="100%" stopColor="#9ee8ff" />
      </linearGradient>
    </defs>
    <ellipse cx="112" cy="154" rx="72" ry="12" fill="rgba(0,0,0,0.28)" />
    <path d="M26,94 C24,54 64,32 110,36 C158,40 190,68 188,98 C186,124 148,142 104,140 C62,138 24,122 26,94 Z" fill="url(#whaleBody)" />
    <path d="M56,108 C78,130 128,134 164,112 C146,138 98,146 68,130 Z" fill="url(#whaleBelly)" opacity="0.9" />
    <path d="M30,96 C12,84 -2,92 2,108 C12,104 22,108 28,116 Z" fill="#314bc4" />
    <path d="M84,114 C92,128 106,132 116,122 C106,120 98,112 96,104 Z" fill="#2f49c9" opacity="0.85" />
    <path d="M110,34 C108,22 116,12 126,6" stroke="#5ef2c2" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
    <path d="M124,38 C128,28 136,22 144,20" stroke="#8ea6ff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
    <circle cx="154" cy="82" r="7" fill="#07101f" />
    <circle cx="157" cy="79" r="2.2" fill="#ffffff" />
    <circle cx="138" cy="98" r="8" fill="#ff9fb2" opacity="0.55" />
    <path d="M120,64 C126,56 136,54 142,58" stroke="#e6f8ff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);

export const DshWordmark: React.FC<{scale?: number}> = ({scale = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, fontFamily: 'Inter, "Helvetica Neue", sans-serif'}}>
    <WhaleMascot size={34 * scale} style={{marginTop: -4 * scale}} />
    <span style={{fontSize: 24 * scale, fontWeight: 800, letterSpacing: -0.8, color: '#f4f7ff'}}>deepseek</span>
    <span
      style={{
        fontFamily: '"SF Mono", Menlo, monospace',
        fontSize: 11 * scale,
        fontWeight: 700,
        letterSpacing: 1.5,
        color: '#8ea6ff',
        border: '1px solid rgba(142,166,255,0.45)',
        borderRadius: 5 * scale,
        padding: (3 * scale) + 'px ' + (6 * scale) + 'px',
        lineHeight: 1,
      }}
    >
      HARNESS
    </span>
  </div>
);
