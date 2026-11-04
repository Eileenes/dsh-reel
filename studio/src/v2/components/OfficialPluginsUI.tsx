/**
 * Official DSH Plugins UI — light theme, reconstructed from the official client source
 * captured in .research/dsh-reel-promo/official/:
 *   - src_client_DiscoverSection.tsx / .module.css  (EntryCard rows, detail facts, ConfirmDialog)
 *   - PluginManagerPage.tsx / .module.css           (page head, SegmentedTabs, 添加插件)
 *   - ui-spec.md                                    (light tokens + verbatim zh copy)
 * Brand: studio/public/brand/dsh-app-icon.svg (official artwork; nothing is hand-drawn).
 *
 * This is deliberately the OFFICIAL plugins page (single-column rows, 48px artwork,
 * white surfaces), not the third-party dshmarket card wall. Everything is data-driven
 * and frame-driven so it can be reused by C3 / C4 scenes and stills.
 */

import React from 'react';
import {Img, staticFile} from 'remotion';

// ─────────────────────────────────────────────────────────────────────────────
// Light theme tokens (official design-platform light values, see ui-spec.md)
// ─────────────────────────────────────────────────────────────────────────────
const L = {
  labelPrimary: 'rgb(15,17,21)',
  labelSecondary: 'rgb(97,102,107)',
  labelTertiary: 'rgb(129,133,140)',
  layer1: 'rgb(255,255,255)',
  page: 'rgb(249,250,251)',
  borderL3: 'rgba(0,0,0,0.12)',
  borderL2: 'rgba(0,0,0,0.07)',
  hover: 'rgba(38,49,72,0.06)',
  primaryBg: 'rgb(15,17,21)',
  primaryFg: 'rgb(255,255,255)',
  warnBg: 'rgb(254,245,231)',
  warn: 'rgb(245,158,11)',
  infoBg: 'rgba(56,116,255,0.07)',
  info: 'rgb(46,99,229)',
  skeleton: 'rgba(15,17,21,0.095)',
  scrim: 'rgba(15,17,21,0.34)',
  link: 'rgb(46,99,229)',
} as const;

const FONT =
  '-apple-system, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
const MONO = '"SF Mono", "JetBrains Mono", Menlo, monospace';

export const OFFICIAL_UI_DESIGN = {width: 1440, height: 810} as const;

/** One plugin entry as the official page shows it (real Better Sidebar data). */
export type OfficialPluginEntry = {
  title: string;
  name: string;
  version: string;
  author: string;
  description: string;
  publishedAt: string;
  category: string;
  packageName: string;
  homepage: string;
  repository: string;
  indexLabel: string;
};

export const BETTER_SIDEBAR_ENTRY: OfficialPluginEntry = {
  title: 'omdsh-dev/DSH-better-sidebar',
  name: 'DSH-better-sidebar',
  version: '0.28.2',
  author: 'omdsh-dev',
  description:
    '内置于 DSH 的侧边栏完整工作台：文件渲染编辑、终端、Git 与子代理，支持三方插件注册新 Tab。',
  publishedAt: '2026年10月27日',
  category: 'UI 增强',
  packageName: 'dsh-better-sidebar',
  homepage: 'https://awesome-dsh-plugin.com/p/omdsh-dev/DSH-better-sidebar/',
  repository: 'https://github.com/omdsh-dev/DSH-better-sidebar',
  indexLabel: 'Awesome DSH Plugin 插件精选',
};

/**
 * Real entries from the captured dshmarket index (same index the official Discover tab
 * reads). Fields are metadata only — no downloads/stars. The Better Sidebar row is the
 * search target; the others make the unfiltered list feel like a live index.
 * zh descriptions for the three community rows come from the index's zh locale
 * (captured in .research/dsh-reel-promo/market-shots/dshmarket-ui-zh.png).
 */
export const OFFICIAL_DISCOVER_ENTRIES: OfficialPluginEntry[] = [
  {
    title: 'liustack/modlens',
    name: 'modlens',
    version: '3.27.2',
    author: 'liustack',
    description: '为纯文本模型架起视觉桥梁：粘贴图片，输出结构化 JSON 证据（OCR、版面、语义）。',
    publishedAt: '2026年10月23日',
    category: '视觉与多模态',
    packageName: '@liustack/modlens',
    homepage: 'https://awesome-dsh-plugin.com/p/liustack/modlens/',
    repository: 'https://github.com/liustack/modlens',
    indexLabel: 'Awesome DSH Plugin 插件精选',
  },
  {
    title: 'omdsh-dev/DSH-better-sidebar',
    name: 'DSH-better-sidebar',
    version: '0.28.2',
    author: 'omdsh-dev',
    description: '内置于 DSH 的侧边栏完整工作台：文件渲染编辑、终端、Git 与子代理，支持三方插件注册新 Tab。',
    publishedAt: '2026年10月27日',
    category: 'UI 增强',
    packageName: 'dsh-better-sidebar',
    homepage: 'https://awesome-dsh-plugin.com/p/omdsh-dev/DSH-better-sidebar/',
    repository: 'https://github.com/omdsh-dev/DSH-better-sidebar',
    indexLabel: 'Awesome DSH Plugin 插件精选',
  },
  {
    title: 'ysr666/dsh-vision-router',
    name: 'dsh-vision-router',
    version: '3.1.1',
    author: 'ysr666',
    description:
      '为纯文本 Agent 提供视觉能力：内置免 Key 视觉链 + 像素级视觉工具（看图问答、定位、裁剪、图像对比、取色、OCR、矢量化、抠图、截图）；粘贴图片即可用。',
    publishedAt: '2026年10月31日',
    category: '视觉与多模态',
    packageName: 'dsh-vision-router',
    homepage: 'https://awesome-dsh-plugin.com/p/ysr666/dsh-vision-router/',
    repository: 'https://github.com/ysr666/dsh-vision-router',
    indexLabel: 'Awesome DSH Plugin 插件精选',
  },
  {
    title: 'zhu1090093659/dsh-web#packages/dsh-web-all',
    name: 'dsh-web-all',
    version: '0.4.14',
    author: 'zhu1090093659',
    description: 'DSH Web UI 插件与皮肤合集：任务看板、git 图、右侧面板、远程移动端 UI、桌宠、实时 token 统计与皮肤中心。',
    publishedAt: '2026年11月2日',
    category: 'UI 增强',
    packageName: '@linxin666/dsh-web-all',
    homepage: 'https://awesome-dsh-plugin.com/p/zhu1090093659/dsh-web--packages-dsh-web-all/',
    repository: 'https://github.com/zhu1090093659/dsh-web',
    indexLabel: 'Awesome DSH Plugin 插件精选',
  },
];

export const OFFICIAL_CATEGORIES = [
  '全部',
  'UI 增强',
  '用量与计费',
  '主题与外观',
  '模型与账号接入',
  '会话与消息',
] as const;

export type OfficialInstallState = 'idle' | 'installing' | 'installed';

export type OfficialPluginsUIProps = {
  /** Rendered width; internal design is 1440×810 and scales by width/1440. */
  width: number;
  /** Search input text (typed逐字 by the scene). */
  typed: string;
  /** List body: official loading skeleton or the searched entry row. */
  listState?: 'skeleton' | 'results';
  /** 0..1 highlight on the result row (after search lands). */
  rowHighlight?: number;
  /** List vs detail view (detail is supported for reuse; C3/C4 use list + modal). */
  view?: 'list' | 'detail';
  /** Official install confirmation dialog. */
  confirmOpen?: boolean;
  /** 0..1 dialog entrance. */
  confirmEnter?: number;
  /** Install phase shown on the row + notice strip. */
  installState?: OfficialInstallState;
  /** Official post-install notice: 已安装，请重启 DSH 加载它。 */
  restartNotice?: boolean;
  /** Frame for caret blink / skeleton shimmer / dots. */
  frame?: number;
  /** Show the focus ring on the search field. */
  searchFocused?: boolean;
  /** Rows to show in the list (default: 4 real index entries incl. the target). */
  entries?: OfficialPluginEntry[];
  /** 0..1 staggered row reveal (C3 uses 0→1 over its first ~10 frames). */
  rowsAppear?: number;
  /** Which row gets the "found it" highlight (defaults to the Better Sidebar row). */
  highlightTitle?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Tiny official-style icons (generic glyphs, not brand artwork)
// ─────────────────────────────────────────────────────────────────────────────

const PlusIcon: React.FC = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.4" />
    <path d="m15.4 15.4 5.1 5.1" />
  </svg>
);

const ChevronDownIcon: React.FC<{size?: number}> = ({size = 12}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const RefreshIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
    <path d="M20 11a8 8 0 1 0-2.3 6.3" />
    <path d="M20 5v6h-6" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
    <path d="m5 5 14 14M19 5 5 19" />
  </svg>
);

const WarningIcon: React.FC<{size?: number; color?: string}> = ({size = 14, color = L.warn}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} aria-hidden>
    <path d="M12 3.6 21.2 20H2.8L12 3.6Z" />
    <path d="M12 9.4v4.6" />
    <circle cx="12" cy="17" r="0.9" fill={color} stroke="none" />
  </svg>
);

const InfoIcon: React.FC<{size?: number; color?: string}> = ({size = 14, color = L.info}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} aria-hidden>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 10.8v5.4" />
    <circle cx="12" cy="7.9" r="0.9" fill={color} stroke="none" />
  </svg>
);

const CheckIcon: React.FC<{size?: number}> = ({size = 12}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
    <path d="m4.5 12.5 5 5L19.5 7" />
  </svg>
);

const Spinner: React.FC<{frame: number; size?: number; color?: string}> = ({frame, size = 11, color = L.labelSecondary}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      border: `2px solid rgba(15,17,21,0.14)`,
      borderTopColor: color,
      display: 'inline-block',
      transform: `rotate(${frame * 26}deg)`,
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

const buttonBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  height: 28,
  padding: '0 11px',
  borderRadius: 8,
  fontFamily: FONT,
  fontSize: 13,
  lineHeight: 20 / 13,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const OutlineButton: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <span
    style={{
      ...buttonBase,
      border: `1px solid ${L.borderL3}`,
      background: L.layer1,
      color: L.labelPrimary,
      ...style,
    }}
  >
    {children}
  </span>
);

const PrimaryButton: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <span
    style={{
      ...buttonBase,
      height: 32,
      padding: '0 12px',
      border: '1px solid transparent',
      background: L.primaryBg,
      color: L.primaryFg,
      ...style,
    }}
  >
    {children}
  </span>
);

const GhostButton: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <span
    style={{
      ...buttonBase,
      border: '1px solid transparent',
      background: 'transparent',
      color: L.labelSecondary,
      ...style,
    }}
  >
    {children}
  </span>
);

const SkeletonBar: React.FC<{width: number | string; height?: number; opacity?: number}> = ({
  width,
  height = 12,
  opacity = 1,
}) => (
  <span
    style={{
      display: 'block',
      width,
      height,
      borderRadius: 4,
      background: L.skeleton,
      opacity,
    }}
  />
);

/** 48×48 official artwork frame (0.5px border, radius 12) with the official app icon. */
const Artwork: React.FC<{size?: number; frameSize?: number}> = ({size = 36, frameSize = 48}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: frameSize,
      height: frameSize,
      flexShrink: 0,
      border: `0.5px solid ${L.borderL3}`,
      borderRadius: 12,
      background: L.layer1,
      overflow: 'hidden',
    }}
  >
    <Img src={staticFile('brand/dsh-app-icon.svg')} style={{width: size, height: size, display: 'block'}} />
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Official page chrome
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_PAD = '0 48px';
const CONTENT_MAX = 960;

const PageHead: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16}}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <h1
        style={{
          margin: 0,
          fontFamily: FONT,
          fontSize: 20,
          lineHeight: '28px',
          fontWeight: 500,
          color: L.labelPrimary,
          letterSpacing: 0.1,
        }}
      >
        插件
      </h1>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <PrimaryButton>
        <PlusIcon />
        添加插件
      </PrimaryButton>
    </div>
  </div>
);

const SegmentedTabs: React.FC = () => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      padding: 2,
      borderRadius: 9,
      background: 'rgba(15,17,21,0.055)',
      width: 'fit-content',
    }}
  >
    {['已安装', '发现'].map((label) => {
      const active = label === '发现';
      return (
        <span
          key={label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 26,
            padding: '0 12px',
            borderRadius: 7,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: active ? 500 : 400,
            color: active ? L.labelPrimary : L.labelSecondary,
            background: active ? L.layer1 : 'transparent',
            boxShadow: active ? '0 1px 2px rgba(15,17,21,0.10)' : 'none',
          }}
        >
          {label}
        </span>
      );
    })}
  </div>
);

const SearchField: React.FC<{typed: string; focused: boolean; frame: number}> = ({typed, focused, frame}) => {
  const caretOn = frame % 16 < 10;
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 32,
        padding: '0 10px',
        borderRadius: 8,
        background: L.layer1,
        border: focused ? `1px solid ${L.primaryBg}` : `1px solid ${L.borderL3}`,
        boxShadow: focused ? '0 0 0 3px rgba(15,17,21,0.06)' : 'none',
      }}
    >
      <span style={{color: L.labelTertiary, display: 'flex', alignItems: 'center'}}>
        <SearchIcon />
      </span>
      {typed ? (
        <span style={{fontFamily: FONT, fontSize: 13, color: L.labelPrimary}}>{typed}</span>
      ) : (
        <span style={{fontFamily: FONT, fontSize: 13, color: L.labelTertiary}}>搜索插件</span>
      )}
      {focused ? (
        <span
          style={{
            width: 1,
            height: 15,
            background: L.labelPrimary,
            opacity: caretOn ? 0.85 : 0,
          }}
        />
      ) : null}
    </div>
  );
};

const DiscoverToolbar: React.FC<{typed: string; searchFocused: boolean; frame: number}> = ({
  typed,
  searchFocused,
  frame,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
    <GhostButton style={{maxWidth: 240, marginLeft: -8, padding: '0 8px'}}>
      <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {BETTER_SIDEBAR_ENTRY.indexLabel}
      </span>
      <ChevronDownIcon />
    </GhostButton>
    <SearchField typed={typed} focused={searchFocused} frame={frame} />
    <GhostButton>
      排序：最佳匹配
      <ChevronDownIcon />
    </GhostButton>
    <GhostButton style={{width: 28, padding: 0}}>
      <RefreshIcon />
    </GhostButton>
  </div>
);

const CategoryPills: React.FC = () => (
  <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6}}>
    {OFFICIAL_CATEGORIES.map((label, i) => {
      const active = i === 0;
      return (
        <span
          key={label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 26,
            padding: '0 10px',
            borderRadius: 999,
            border: `1px solid ${active ? 'transparent' : L.borderL3}`,
            background: active ? L.primaryBg : L.layer1,
            color: active ? L.primaryFg : L.labelSecondary,
            fontFamily: FONT,
            fontSize: 12.5,
            fontWeight: active ? 500 : 400,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Entry rows
// ─────────────────────────────────────────────────────────────────────────────

const RowTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      fontFamily: FONT,
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 500,
      color: L.labelPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

type RowActionProps = {installState: OfficialInstallState; frame: number};

const RowAction: React.FC<RowActionProps> = ({installState, frame}) => {
  if (installState === 'installed') {
    return (
      <GhostButton style={{color: L.labelSecondary}}>
        <CheckIcon />
        已安装
      </GhostButton>
    );
  }
  if (installState === 'installing') {
    return (
      <OutlineButton style={{color: L.labelSecondary, background: 'rgba(15,17,21,0.03)'}}>
        <Spinner frame={frame} />
        安装中…
      </OutlineButton>
    );
  }
  return <OutlineButton>安装</OutlineButton>;
};

const EntryRow: React.FC<{
  entry: OfficialPluginEntry;
  highlight: number;
  installState: OfficialInstallState;
  frame: number;
  appear?: number;
}> = ({entry, highlight, installState, frame, appear = 1}) => {
  const hl = Math.max(0, Math.min(1, highlight));
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        margin: '0 -8px',
        padding: 8,
        borderRadius: 16,
        background: `rgba(38,49,72,${0.08 * hl})`,
        boxShadow: hl > 0.01 ? `inset 0 0 0 1px rgba(15,17,21,${0.05 * hl})` : 'none',
        opacity: appear,
        transform: `translateY(${(1 - appear) * 8}px)`,
      }}
    >
      <Artwork />
      <div style={{display: 'flex', flex: 1, flexDirection: 'column', gap: 2, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
          <RowTitle>{entry.title}</RowTitle>
        </div>
        <span
          style={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: FONT,
            fontSize: 13,
            lineHeight: '18px',
            color: L.labelTertiary,
          }}
        >
          {entry.description}
        </span>
        <span style={{fontFamily: FONT, fontSize: 12, lineHeight: '18px', color: L.labelTertiary}}>
          {entry.version} · {entry.author} · {entry.publishedAt}
        </span>
      </div>
      <div style={{position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8}}>
        <RowAction installState={installState} frame={frame} />
      </div>
    </div>
  );
};

const SkeletonRow: React.FC<{opacity: number}> = ({opacity}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, margin: '0 -8px', padding: 8}}>
    <span
      style={{
        display: 'inline-block',
        width: 48,
        height: 48,
        borderRadius: 12,
        background: L.skeleton,
        opacity,
        flexShrink: 0,
      }}
    />
    <div style={{display: 'flex', flex: 1, flexDirection: 'column', gap: 8}}>
      <SkeletonBar width="min(144px, 60%)" height={12} opacity={opacity} />
      <SkeletonBar width="min(360px, 85%)" height={12} opacity={opacity} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Detail view (component capability; C3/C4 use list + modal)
// ─────────────────────────────────────────────────────────────────────────────

const Crumb: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 6, color: L.labelTertiary, fontFamily: FONT, fontSize: 12.5}}>
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{transform: 'rotate(90deg)'}} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
    {children}
  </div>
);

const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <h4 style={{margin: 0, fontFamily: FONT, fontSize: 14, lineHeight: '20px', fontWeight: 500, color: L.labelPrimary}}>
    {children}
  </h4>
);

const Fact: React.FC<{label: string; children: React.ReactNode; mono?: boolean}> = ({label, children, mono = false}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      minHeight: 44,
      padding: '8px 2px',
      borderBottom: `0.5px solid ${L.borderL2}`,
    }}
  >
    <dt style={{flex: 'none', margin: 0, fontFamily: FONT, fontSize: 13, lineHeight: '20px', color: L.labelSecondary}}>{label}</dt>
    <dd
      style={{
        margin: 0,
        minWidth: 0,
        fontFamily: mono ? MONO : FONT,
        fontSize: mono ? 12 : 13,
        lineHeight: '20px',
        color: L.labelPrimary,
        textAlign: 'end',
        overflowWrap: 'anywhere',
      }}
    >
      {children}
    </dd>
  </div>
);

const DetailView: React.FC<{entry: OfficialPluginEntry; frame: number}> = ({entry, frame}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    <Crumb>发现</Crumb>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <Artwork />
      <div style={{display: 'flex', flex: 1, flexDirection: 'column', gap: 4, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{fontFamily: FONT, fontSize: 20, lineHeight: '28px', fontWeight: 500, color: L.labelPrimary}}>{entry.title}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 22,
              padding: '0 7px',
              borderRadius: 6,
              border: `1px solid ${L.borderL3}`,
              fontFamily: FONT,
              fontSize: 12,
              color: L.labelSecondary,
            }}
          >
            {entry.version}
          </span>
        </div>
        <span style={{fontFamily: MONO, fontSize: 12, color: L.labelTertiary}}>{entry.name}</span>
      </div>
      <OutlineButton>安装</OutlineButton>
    </div>
    <p style={{margin: 0, fontFamily: FONT, fontSize: 14, lineHeight: '22px', color: L.labelSecondary, maxWidth: 760}}>
      {entry.description}
    </p>
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16}}>
      <SectionTitle>版本</SectionTitle>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0',
          borderBottom: `0.5px solid ${L.borderL2}`,
        }}
      >
        <span style={{fontFamily: MONO, fontSize: 13, fontWeight: 600, color: L.labelPrimary}}>{entry.version}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 20,
            padding: '0 7px',
            borderRadius: 5,
            background: 'rgba(46,99,229,0.08)',
            color: L.link,
            fontFamily: FONT,
            fontSize: 11.5,
          }}
        >
          推荐
        </span>
        <span style={{fontFamily: FONT, fontSize: 12, color: L.labelTertiary}}>{entry.publishedAt}</span>
        <div style={{flex: 1}} />
        <GhostButton style={{color: L.labelSecondary}}>安装</GhostButton>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16}}>
      <SectionTitle>来源</SectionTitle>
      <dl style={{margin: 0}}>
        <Fact label='作者'>{entry.author}</Fact>
        <Fact label='主页'>{entry.homepage}</Fact>
        <Fact label='源代码'>{entry.repository}</Fact>
        <Fact label='软件包' mono>
          {entry.packageName}
        </Fact>
        <Fact label='发布时间'>{entry.publishedAt}</Fact>
        <Fact label='分类'>{entry.category}</Fact>
        <Fact label='插件索引'>{entry.indexLabel}</Fact>
      </dl>
    </div>
    {/* frame keeps the component deterministic for shimmer/caret reuse */}
    <span style={{display: 'none'}}>{frame}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Confirm dialog (official Modal + ConfirmDialog copy)
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmDialog: React.FC<{
  entry: OfficialPluginEntry;
  enter: number;
  frame: number;
}> = ({entry, enter, frame}) => {
  const p = Math.max(0, Math.min(1, enter));
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: L.scrim,
        opacity: p,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 480,
          borderRadius: 16,
          background: L.layer1,
          border: `1px solid ${L.borderL2}`,
          boxShadow: '0 30px 90px rgba(15,17,21,0.24), 0 0 0 1px rgba(15,17,21,0.04)',
          padding: '20px 22px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          transform: `translateY(${(1 - p) * 14}px) scale(${0.97 + 0.03 * p})`,
          fontFamily: FONT,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{flex: 1, fontFamily: FONT, fontSize: 16, lineHeight: '24px', fontWeight: 500, color: L.labelPrimary}}>
            安装「{entry.title}」？
          </span>
          <span style={{color: L.labelTertiary, display: 'flex', alignItems: 'center', padding: 2}}>
            <CloseIcon />
          </span>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Artwork />
          <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <span style={{fontFamily: FONT, fontSize: 14, lineHeight: '20px', fontWeight: 500, color: L.labelPrimary}}>{entry.title}</span>
            <span style={{fontFamily: MONO, fontSize: 12, color: L.labelTertiary}}>{entry.version}</span>
          </div>
        </div>

        <dl style={{margin: 0}}>
          <Fact label='作者'>{entry.author}</Fact>
          <Fact label='软件包' mono>
            {entry.packageName}
          </Fact>
          <Fact label='发布时间'>{entry.publishedAt}</Fact>
        </dl>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 8,
            background: L.warnBg,
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: '18px',
            color: L.labelSecondary,
          }}
        >
          <span style={{flex: 'none', marginTop: 2, display: 'flex'}}>
            <WarningIcon />
          </span>
          <span>插件在本机以你的权限运行。请确认你信任它的来源</span>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 2}}>
          <OutlineButton style={{height: 32, padding: '0 14px'}}>取消</OutlineButton>
          <span
            style={{
              ...buttonBase,
              height: 32,
              padding: '0 14px',
              background: L.primaryBg,
              color: L.primaryFg,
              boxShadow: `0 0 0 ${3 + Math.sin(frame / 5) * 0.8}px rgba(15,17,21,0.08)`,
            }}
          >
            安装
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Notices (installing / installed-restart)
// ─────────────────────────────────────────────────────────────────────────────

const InstallingNotice: React.FC<{frame: number}> = ({frame}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      borderRadius: 8,
      background: L.infoBg,
      fontFamily: FONT,
      fontSize: 12.5,
      lineHeight: '18px',
      color: L.labelSecondary,
    }}
  >
    <Spinner frame={frame} size={12} color={L.info} />
    插件安装中…
  </div>
);

const RestartNotice: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      borderRadius: 8,
      background: L.warnBg,
      fontFamily: FONT,
      fontSize: 12.5,
      lineHeight: '18px',
      color: L.labelSecondary,
    }}
  >
    <span style={{flex: 'none', display: 'flex'}}>
      <WarningIcon />
    </span>
    已安装，请重启 DSH 加载它。
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const OfficialPluginsUI: React.FC<OfficialPluginsUIProps> = ({
  width,
  typed,
  listState = 'skeleton',
  rowHighlight = 0,
  view = 'list',
  confirmOpen = false,
  confirmEnter = 0,
  installState = 'idle',
  restartNotice = false,
  frame = 0,
  searchFocused = true,
  entries = OFFICIAL_DISCOVER_ENTRIES,
  rowsAppear = 1,
  highlightTitle = BETTER_SIDEBAR_ENTRY.title,
}) => {
  const scale = width / OFFICIAL_UI_DESIGN.width;
  const hl = clamp01(rowHighlight);
  // Official skeleton shimmer: 2s pulse, frozen by frame in stills.
  const shimmer = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((frame / 60) * Math.PI * 2));

  const showInstallNotice = installState === 'installing';
  const showRestart = restartNotice || installState === 'installed';

  return (
    <div
      style={{
        width,
        height: OFFICIAL_UI_DESIGN.height * scale,
        position: 'relative',
        fontFamily: FONT,
        color: L.labelPrimary,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: OFFICIAL_UI_DESIGN.width,
          height: OFFICIAL_UI_DESIGN.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          borderRadius: 20,
          overflow: 'hidden',
          background: L.page,
          border: `1px solid ${L.borderL3}`,
          boxShadow:
            '0 40px 120px rgba(0,0,0,0.55), 0 0 90px rgba(142,166,255,0.16), 0 0 0 1px rgba(255,255,255,0.55) inset, 0 2px 0 rgba(255,255,255,0.7) inset',
        }}
      >
        {/* top edge highlight — keeps the light screen from looking like a flat sticker */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4), rgba(255,255,255,0.9))',
          }}
        />

        <div
          style={{
            height: '100%',
            padding: PAGE_PAD,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{width: '100%', maxWidth: CONTENT_MAX, paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 14}}>
            <PageHead />
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 14, borderBottom: `1px solid ${L.borderL2}`}}>
              <SegmentedTabs />
            </div>

            {showInstallNotice ? <InstallingNotice frame={frame} /> : null}
            {showRestart ? <RestartNotice /> : null}

            {view === 'detail' ? (
              <DetailView entry={BETTER_SIDEBAR_ENTRY} frame={frame} />
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <DiscoverToolbar typed={typed} searchFocused={searchFocused} frame={frame} />
                <CategoryPills />
                {listState === 'skeleton' ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2}}>
                    {[0.95, 0.9, 0.8, 0.75, 0.62, 0.55].map((opacity, i) => (
                      <SkeletonRow key={i} opacity={Math.min(1, opacity * (0.7 + 0.3 * shimmer))} />
                    ))}
                  </div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2}}>
                    {entries.map((entry, i) => (
                      <EntryRow
                        key={entry.title}
                        entry={entry}
                        highlight={entry.title === highlightTitle ? hl : 0}
                        installState={installState}
                        frame={frame}
                        appear={Math.max(0, Math.min(1, rowsAppear * 1.5 - i * 0.18))}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {confirmOpen ? <ConfirmDialog entry={BETTER_SIDEBAR_ENTRY} enter={confirmEnter} frame={frame} /> : null}
      </div>
    </div>
  );
};
