/**
 * CASE30 Outro — 30s Better Sidebar case 片的片尾（C7Outro 180f / 6s）。
 *
 * 节奏：
 *   0–40f   官方白色 wordmark 淡入 → Better Sidebar → dsh-better-sidebar → tagline
 *   26–62f  安装条出现，安装命令逐字打出
 *   40–58f  GitHub 一行淡入
 *   88–100f 收起 tagline / mono 行，只留「Better Sidebar + 安装命令」（+ 官方 wordmark 小标 + GitHub）
 *   100–180f 完全静止；最后 1s（150–180f）逐帧一致 → 最后一帧停在插件名字 + 安装命令
 *
 * 品牌：只用官方资产 brand/dsh-wordmark-white.svg；不出现自绘 wordmark / 蓝色鲸鱼 / 下载量 / 星数 / 认证。
 */

import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, MOTION, VIDEO} from '../../tokens';
import {Grain} from '../../components/Chrome';
import {DshBackdrop, DshVignette} from '../../stage/DshStage';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const seg = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

const INSTALL_CMD = 'dsh plugin --profile web add dsh-better-sidebar';

/** 片场底（比开场更静：只有底色 + 柔和光池 + 网格 + 暗角） */
const OutroStage: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
    <DshBackdrop />
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
        backgroundPosition: 'center center',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 62% at 50% 48%, #000 12%, rgba(0,0,0,0.28) 58%, transparent 90%)',
        maskImage: 'radial-gradient(ellipse 70% 62% at 50% 48%, #000 12%, rgba(0,0,0,0.28) 58%, transparent 90%)',
        opacity: 0.75,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '46%',
        width: 1400,
        height: 900,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(77,107,254,0.20), rgba(94,242,194,0.05) 46%, transparent 72%)',
        filter: 'blur(34px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '10%',
        right: '10%',
        bottom: -220,
        height: 620,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(77,107,254,0.20), transparent 70%)',
        filter: 'blur(30px)',
      }}
    />
    <DshVignette />
  </AbsoluteFill>
);

export const C7Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const rise = (start: number, dur = 14) => {
    const p = easeOut(seg(frame, start, start + dur));
    return {opacity: p, transform: `translateY(${(1 - p) * 22}px)`};
  };

  // 安装命令逐字（34→62f 打完）
  const typed = Math.floor(seg(frame, 30, 60) * INSTALL_CMD.length);
  const typingDone = frame >= 60;

  // 90f 之后收起 mono/tagline，只留 名字 + 安装命令（+ wordmark + GitHub）
  const extras = 1 - easeOut(seg(frame, 88, 100));

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg0}}>
      <OutroStage />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 官方白色 wordmark */}
        <div style={rise(0, 18)}>
          <Img
            src={staticFile('brand/dsh-wordmark-white.svg')}
            style={{width: 340, height: 'auto', display: 'block'}}
          />
        </div>

        {/* 插件名 */}
        <div
          style={{
            marginTop: 56,
            fontFamily: FONT.latin,
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3.2,
            lineHeight: 1.02,
            color: COLORS.text,
            textShadow: '0 26px 80px rgba(0,0,0,0.55)',
            ...rise(6, 14),
          }}
        >
          Better Sidebar
        </div>

        {/* 包名（90f 后淡出并折叠占位） */}
        <div
          style={{
            marginTop: 24 * extras,
            maxHeight: 42 * extras,
            overflow: 'hidden',
            fontFamily: FONT.mono,
            fontSize: 28,
            letterSpacing: 1.2,
            color: COLORS.mint,
            ...rise(12, 12),
            opacity: rise(12, 12).opacity * extras,
          }}
        >
          dsh-better-sidebar
        </div>

        {/* tagline（90f 后淡出并折叠占位） */}
        <div
          style={{
            marginTop: 18 * extras,
            maxHeight: 50 * extras,
            overflow: 'hidden',
            fontFamily: FONT.zh,
            fontSize: 34,
            letterSpacing: 0.6,
            color: COLORS.text,
            opacity: 0.92 * rise(16, 12).opacity * extras,
            transform: rise(16, 12).transform,
          }}
        >
          一个侧边栏，装下整个开发工作台。
        </div>

        {/* 安装条（逐字） */}
        <div
          style={{
            marginTop: 24 + 28 * extras,
            width: 1010,
            height: 74,
            borderRadius: 12,
            border: `1px solid ${COLORS.lineStrong}`,
            background: 'rgba(6,10,20,0.92)',
            boxShadow: `0 26px 80px rgba(0,0,0,0.55), 0 0 60px ${COLORS.blue}1c`,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 26px',
            opacity: rise(22, 12).opacity,
            transform: rise(26, 12).transform,
          }}
        >
          <span style={{color: COLORS.mint, fontSize: 24}}>$</span>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 27,
              color: COLORS.text,
              letterSpacing: 0.2,
              whiteSpace: 'pre',
            }}
          >
            {INSTALL_CMD.slice(0, typed)}
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 30,
                marginLeft: 2,
                verticalAlign: '-5px',
                background: COLORS.mint,
                opacity: typingDone ? 0 : 1,
                boxShadow: `0 0 14px ${COLORS.mint}`,
              }}
            />
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: FONT.mono,
              fontSize: 20,
              letterSpacing: 2,
              color: COLORS.faint,
              opacity: typingDone ? 1 : 0.5,
            }}
          >
            MIT
          </span>
        </div>

        {/* GitHub 一行 */}
        <div
          style={{
            marginTop: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: FONT.mono,
            fontSize: 20,
            letterSpacing: 1.2,
            color: COLORS.dim,
            ...rise(40, 12),
          }}
        >
          <span>github.com/omdsh-dev/DSH-better-sidebar</span>
          <span style={{width: 3, height: 3, borderRadius: 9, background: 'rgba(140,140,140,0.5)'}} />
          <span style={{color: COLORS.faint}}>MIT LICENSE</span>
        </div>
      </div>

      <Grain />
    </AbsoluteFill>
  );
};
