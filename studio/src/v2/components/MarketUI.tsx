/**
 * DSH 插件市场 UI —— 第三方可视化市场（dshmarket 1.66.37）结构的暗色版。
 *
 * 还原依据：.research/dsh-reel-promo/dsh-market-ux.md
 *   §2.1.2 页面骨架 / §2.1.3 逐元素文案表 / §2.1.5 安装确认 / §2.1.6 安装成功
 *   §3.1.4 条目详情页（标题下包名小字 + 来源表）
 * 参照截图：.research/dsh-reel-promo/market-shots/dshmarket-ui-zh.png（浅色 v1.33.0，仅作视觉参照）
 *
 * 关键约束（来自任务）：
 *  - 卡片标题就是 `dsh-reel`（不是包名）；`dsh-reel-studio` 只出现在详情页标题下小字与软件包行。
 *  - 不展示下载量/星数；不写认证、背书类字样；不出现输入法候选条。
 *  - 填充卡片低对比、无编造数字。
 *  - 1440 逻辑宽设计，内部按 width/1440 缩放；字体用 PingFang SC + SF Mono（tokens）。
 *
 * 这个文件是纯展示组件：所有动画由外部传入的 frame / *Enter 进度驱动，方便在
 * Remotion 视频、静帧海报里复用同一套 UI。
 */

import React from 'react';
import {COLORS, FONT, RADIUS} from '../tokens';

// ---------------------------------------------------------------------------
// 真实文案 / 字段（逐字来自 dsh-market-ux.md，不要改）
// ---------------------------------------------------------------------------

export const MARKET_QUERY = 'reel-studio';

const PAGE = {
  settings: '设置',
  title: '插件市场',
  site: 'dsh-market',
  version: 'v1.66.37',
  subtitle: '发现社区为 DeepSeek Harness 开发的插件',
  submit: '申请收录插件 ↗',
  exportLog: '导出日志',
  openConfig: '打开配置文件',
  tabs: ['发现', '主题', '收藏', '已安装', '已屏蔽', '高级'] as const,
  tabsRight: '任务',
  searchPlaceholder: '搜索插件，例如：通知、终端、记忆…',
  categories: ['全部', 'UI 增强', '用量与计费', '主题与外观', '工具与能力', '记忆', '会话与消息'] as const,
  filter: '筛选',
  nav: ['通用设置', '模型', '插件', 'Agent 预设', '插件市场'] as const,
};

const REEL_ITEM: MarketItem = {
  title: 'dsh-reel',
  author: 'Eileenes',
  version: '0.1.0',
  description:
    '本地用 Remotion 从 DSH 插件仓库生成 16:9 宣传片与 3:4 宣传图的可用原型；DSH bundle 仍是脚手架，尚未在真实 DSH profile 中加载验证。需 Node.js 22+ 与 Chrome/Chromium 渲染。',
  tag: '工具与能力',
};

const DETAIL = {
  breadcrumb: '‹ 发现',
  title: 'Eileenes/dsh-reel',
  version: '0.1.0',
  packageLine: 'dsh-reel-studio',
  description:
    '本地用 Remotion 从 DSH 插件仓库生成 16:9 宣传片与 3:4 宣传图的可用原型；DSH bundle 仍是脚手架，尚未在真实 DSH profile 中加载验证。需 Node.js 22+ 与 Chrome/Chromium 渲染。',
  sourceTitle: '来源',
  sourceRows: [
    ['主页', 'awesome-dsh-plugin.com/p/Eileenes/dsh-reel/'],
    ['源代码', 'github.com/Eileenes/dsh-reel'],
    ['软件包', 'dsh-reel-studio@0.1.0'],
    ['发布时间', '2026年10月20日'],
    ['分类', '工具与能力'],
    ['插件市场', 'Awesome DSH Plugin 插件精选'],
  ] as ReadonlyArray<readonly [string, string]>,
  installNote: '插件在本机以你的权限运行',
};

const INSTALL_LABEL = {
  idle: '安装',
  installing: '安装中…',
  installed: '✓ 已安装',
} as const;

const TOAST_TEXT = 'dsh-reel 已安装并已生效';

/** 填充卡片：真实社区插件（取自参照截图），只保留标题/作者/简介/标签，不展示下载量/星数。 */
const FILLER_ITEMS: MarketItem[] = [
  {
    title: 'dsh-web-ui-all',
    author: 'zhu1090093659',
    description: 'DSH Web UI 插件与皮肤合集：任务看板、git 图、右侧面板、远程移动端 UI、桌宠、实时 token 统计与皮肤中心。',
    tag: 'UI 增强',
  },
  {
    title: 'dsh-better-sidebar',
    author: 'omdsh-dev',
    description: '侧边栏完整工作台：内置文件渲染编辑、终端、Git 与子代理，支持三方插件注册新 Tab。',
    tag: 'UI 增强',
  },
  {
    title: 'modlens',
    author: 'liustack',
    description: '为纯文本模型架起视觉桥梁：粘贴图片，输出结构化 JSON 证据（OCR、版面、语义）。',
    tag: '视觉与多模态',
  },
  {
    title: 'dsh-vision-router',
    author: 'ysr666',
    description: '为纯文本 Agent 提供视觉能力：内置免 Key 视觉链 + 像素级视觉工具（看图问答、定位、裁剪、取色）。',
    tag: '视觉与多模态',
  },
];

// ---------------------------------------------------------------------------
// 尺寸：按真实 App 的 UI 尺码（1440 逻辑宽），不是 1920 舞台字号
// ---------------------------------------------------------------------------

export const MARKET_UI_DESIGN = {width: 1440, height: 810} as const;

const UI = {
  panelRadius: RADIUS.lg,
  navW: 208,
  contentX: 26,
  cardRadius: 12,
  cardPad: '14px 16px',
  cardGap: 10,
  cardHeight: 196,
  // 真实 dshmarket 字号（§2.1.2 / §2.1.3）
  fsPageTitle: 24,
  fsSite: 13,
  fsVersion: 11.5,
  fsSubtitle: 14.5,
  fsTab: 14,
  fsSearch: 14,
  fsChip: 12.5,
  fsCardTitle: 16.5,
  fsCardMeta: 12.5,
  fsCardBody: 13,
  fsCardTag: 11.5,
  fsButton: 13.5,
  fsNav: 13.5,
  fsDetailTitle: 22,
  fsDetailBody: 14,
} as const;

type InstallState = 'idle' | 'installing' | 'installed';

type MarketItem = {
  title: string;
  author: string;
  version?: string;
  description: string;
  tag: string;
};

export type MarketUIProps = {
  /** 组件渲染宽度（内部 1440 逻辑宽 → 自动缩放） */
  width: number;
  /** 搜索框里已输入的文字（由外部按帧切片，实现逐字输入） */
  typed: string;
  /** 已提交的搜索词（用于结果态文案/高亮） */
  query: string;
  /** 默认列表 / 刷新中 / 搜索结果 */
  resultState: 'default' | 'loading' | 'results';
  /** 安装按钮状态 */
  installState: InstallState;
  /** 详情页模式 */
  detail: boolean;
  /** 用于光标闪烁、spinner 等微动画 */
  frame?: number;
  /** 0..1 结果切换进度（默认列表 → 单卡结果） */
  resultEnter?: number;
  /** 0..1 详情页进入进度（结果卡 → 详情页） */
  detailEnter?: number;
  /** 0..1 安装按钮高亮脉冲 */
  installHighlight?: number;
};

// ---------------------------------------------------------------------------
// 小图标（内联 SVG，不依赖外部资源）
// ---------------------------------------------------------------------------

const LogoMark: React.FC<{size?: number}> = ({size = 26}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <g fill={COLORS.text} opacity={0.92}>
      {[
        [8, 8],
        [38, 8],
        [8, 38],
        [38, 38],
        [8, 68],
        [38, 68],
        [68, 38],
        [68, 68],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={24} height={24} rx={5} />
      ))}
    </g>
    <rect x={68} y={8} width={24} height={24} rx={5} fill={COLORS.danger} transform="rotate(9 80 20)" />
  </svg>
);

const GearIcon: React.FC<{size?: number}> = ({size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6h.09A1.7 1.7 0 0 0 10 3.05V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
  </svg>
);

const CubeIcon: React.FC<{size?: number}> = ({size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7Z" />
    <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
  </svg>
);

const PlugIcon: React.FC<{size?: number}> = ({size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 0 1-10 0Z" />
    <path d="M12 17v5" />
  </svg>
);

const SparkIcon: React.FC<{size?: number}> = ({size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9Z" />
  </svg>
);

const GridIcon: React.FC<{size?: number}> = ({size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </svg>
);

const SearchIcon: React.FC<{size?: number}> = ({size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);

const ChevronDown: React.FC<{size?: number}> = ({size = 13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const FilterIcon: React.FC<{size?: number}> = ({size = 13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3.5 5.5h17l-6.6 7.8v6.2l-3.8-2v-4.2Z" />
  </svg>
);

const CloseIcon: React.FC<{size?: number}> = ({size = 15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="m5 5 14 14M19 5 5 19" />
  </svg>
);

const ExternalIcon: React.FC<{size?: number}> = ({size = 13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M8 6h10v10M18 6 6 18" />
  </svg>
);

const BranchIcon: React.FC<{size?: number}> = ({size = 13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <circle cx="7" cy="5" r="2.2" />
    <circle cx="7" cy="19" r="2.2" />
    <circle cx="17" cy="9" r="2.2" />
    <path d="M7 7.2v9.6M17 11.2c0 2.6-2.4 4-5.6 4.6" />
  </svg>
);

const CheckIcon: React.FC<{size?: number}> = ({size = 13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4.5 12.5 5 5L19.5 7" />
  </svg>
);

// ---------------------------------------------------------------------------
// 基础样式块
// ---------------------------------------------------------------------------

const hairline = `1px solid ${COLORS.line}`;

const glassButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  height: 30,
  padding: '0 12px',
  borderRadius: RADIUS.sm,
  border: hairline,
  background: 'rgba(255,255,255,0.03)',
  color: 'rgba(244,247,255,0.78)',
  fontFamily: FONT.zh,
  fontSize: 12,
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

const mutedText: React.CSSProperties = {color: COLORS.dim, fontFamily: FONT.zh};

const mono: React.CSSProperties = {fontFamily: FONT.mono, fontVariantNumeric: 'tabular-nums'};

// ---------------------------------------------------------------------------
// 原子组件
// ---------------------------------------------------------------------------

const Avatar: React.FC<{name: string; size?: number}> = ({name, size = 18}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.52,
      fontWeight: 600,
      color: 'rgba(10,16,32,0.9)',
      background: 'linear-gradient(135deg, #8ea6ff, #5ef2c2)',
      flexShrink: 0,
    }}
  >
    {name.slice(0, 1).toUpperCase()}
  </span>
);

const InstallButton: React.FC<{
  state: InstallState;
  highlight?: number;
  frame: number;
  size?: 'card' | 'detail';
}> = ({state, highlight = 0, frame, size = 'card'}) => {
  const h = Math.max(0, Math.min(1, highlight));
  const detail = size === 'detail';
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minWidth: detail ? 108 : 68,
    height: detail ? 36 : 30,
    padding: detail ? '0 18px' : '0 14px',
    borderRadius: RADIUS.sm,
    fontFamily: FONT.zh,
    fontSize: detail ? 14 : UI.fsButton,
    fontWeight: 600,
    letterSpacing: 0.2,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  if (state === 'installed') {
    return (
      <div
        style={{
          ...base,
          color: COLORS.mint,
          background: 'rgba(94,242,194,0.12)',
          border: '1px solid rgba(94,242,194,0.42)',
        }}
      >
        <CheckIcon size={detail ? 14 : 12} />
        {INSTALL_LABEL.installed.replace('✓ ', '')}
      </div>
    );
  }

  if (state === 'installing') {
    return (
      <div
        style={{
          ...base,
          color: COLORS.blue2,
          background: 'rgba(77,107,254,0.16)',
          border: '1px solid rgba(77,107,254,0.45)',
        }}
      >
        <span
          style={{
            width: detail ? 13 : 11,
            height: detail ? 13 : 11,
            borderRadius: 999,
            border: '2px solid rgba(142,166,255,0.28)',
            borderTopColor: COLORS.blue2,
            transform: `rotate(${frame * 26}deg)`,
          }}
        />
        {INSTALL_LABEL.installing}
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        color: COLORS.white,
        background: 'linear-gradient(180deg, #5a78ff 0%, #4d6bfe 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: `0 ${6 + 6 * h}px ${18 + 26 * h}px rgba(77,107,254,${0.32 + 0.4 * h})`,
        transform: `scale(${1 + 0.035 * h})`,
      }}
    >
      {INSTALL_LABEL.idle}
    </div>
  );
};

const Chip: React.FC<{label: string; active?: boolean; muted?: boolean}> = ({label, active = false, muted = false}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 27,
      padding: '0 12px',
      borderRadius: RADIUS.pill,
      border: active ? `1px solid rgba(77,107,254,0.62)` : hairline,
      background: active ? 'rgba(77,107,254,0.16)' : 'rgba(255,255,255,0.015)',
      color: active ? 'rgba(244,247,255,0.96)' : muted ? 'rgba(244,247,255,0.55)' : 'rgba(244,247,255,0.72)',
      fontFamily: FONT.zh,
      fontSize: UI.fsChip,
      fontWeight: active ? 600 : 500,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    {label}
  </div>
);

const SectionLabel: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      fontFamily: FONT.zh,
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 1.2,
      color: 'rgba(244,247,255,0.62)',
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// 左侧设置导航
// ---------------------------------------------------------------------------

const navIcons = [GearIcon, CubeIcon, PlugIcon, SparkIcon, GridIcon];

const SettingsNav: React.FC = () => (
  <div
    style={{
      width: UI.navW,
      height: '100%',
      flexShrink: 0,
      padding: '22px 18px 18px',
      background: 'rgba(255,255,255,0.018)',
      borderRight: hairline,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      fontFamily: FONT.zh,
    }}
  >
    <div style={{fontSize: 19, fontWeight: 600, color: 'rgba(244,247,255,0.94)', padding: '0 10px', marginBottom: 18}}>
      {PAGE.settings}
    </div>
    {PAGE.nav.map((label, i) => {
      const active = label === '插件市场';
      const Icon = navIcons[i] ?? GridIcon;
      return (
        <div
          key={label}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 40,
            padding: '0 10px',
            borderRadius: RADIUS.sm,
            background: active ? 'rgba(77,107,254,0.14)' : 'transparent',
            color: active ? 'rgba(244,247,255,0.96)' : 'rgba(244,247,255,0.62)',
            fontSize: UI.fsNav,
            fontWeight: active ? 600 : 500,
          }}
        >
          {active ? (
            <span
              style={{
                position: 'absolute',
                left: -18,
                top: 10,
                width: 3,
                height: 20,
                borderRadius: '0 3px 3px 0',
                background: COLORS.blue,
                boxShadow: '0 0 12px rgba(77,107,254,0.8)',
              }}
            />
          ) : null}
          <Icon size={16} />
          {label}
        </div>
      );
    })}
    <div style={{flex: 1}} />
  </div>
);

// ---------------------------------------------------------------------------
// 市场页头 / Tabs / 搜索 / 分类
// ---------------------------------------------------------------------------

const MarketHeader: React.FC = () => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <LogoMark size={26} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
          <span style={{fontFamily: FONT.zh, fontSize: UI.fsPageTitle, fontWeight: 600, color: 'rgba(244,247,255,0.97)', letterSpacing: 0.2}}>
            {PAGE.title}
          </span>
          <span style={{...mono, fontSize: UI.fsSite, color: 'rgba(244,247,255,0.5)'}}>{PAGE.site}</span>
          <span
            style={{
              ...mono,
              fontSize: UI.fsVersion,
              color: 'rgba(142,166,255,0.78)',
              border: '1px solid rgba(142,166,255,0.22)',
              borderRadius: 5,
              padding: '1px 6px',
              lineHeight: 1.4,
            }}
          >
            {PAGE.version}
          </span>
        </div>
        <div style={{flex: 1}} />
        <div style={{...glassButton, color: 'rgba(244,247,255,0.62)'}}>{PAGE.openConfig}</div>
        <div style={{color: 'rgba(244,247,255,0.42)', display: 'flex', alignItems: 'center', padding: 4}}>
          <CloseIcon />
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{...mutedText, fontSize: UI.fsSubtitle}}>{PAGE.subtitle}</span>
        <span style={{...mutedText, fontSize: UI.fsSubtitle, color: 'rgba(142,166,255,0.86)', marginLeft: 8}}>{PAGE.submit}</span>
        <div style={{flex: 1}} />
        <div style={{...glassButton, height: 26, fontSize: 11.5}}>{PAGE.exportLog}</div>
      </div>
    </div>
  );
};

const TabBar: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 26, height: 40, borderBottom: hairline}}>
    {PAGE.tabs.map((tab, i) => {
      const active = i === 0;
      return (
        <div
          key={tab}
          style={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontFamily: FONT.zh,
            fontSize: UI.fsTab,
            fontWeight: active ? 600 : 500,
            color: active ? 'rgba(244,247,255,0.96)' : 'rgba(244,247,255,0.52)',
          }}
        >
          {tab}
          {active ? (
            <span
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -1,
                height: 2,
                borderRadius: 2,
                background: COLORS.blue,
                boxShadow: '0 0 10px rgba(77,107,254,0.8)',
              }}
            />
          ) : null}
        </div>
      );
    })}
    <div style={{flex: 1}} />
    <span style={{...mutedText, fontSize: 12.5}}>{PAGE.tabsRight}</span>
  </div>
);

const SearchField: React.FC<{typed: string; focused: boolean; frame: number}> = ({typed, focused, frame}) => {
  const caretOn = frame % 16 < 10;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 42,
        padding: '0 14px',
        borderRadius: 10,
        background: focused ? 'rgba(77,107,254,0.06)' : 'rgba(255,255,255,0.03)',
        border: focused ? '1px solid rgba(77,107,254,0.55)' : hairline,
        boxShadow: focused ? '0 0 0 3px rgba(77,107,254,0.10), 0 10px 30px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      <span style={{color: focused ? COLORS.blue2 : 'rgba(147,160,189,0.7)', display: 'flex', alignItems: 'center'}}>
        <SearchIcon size={15} />
      </span>
      {typed ? (
        <span style={{fontFamily: FONT.zh, fontSize: UI.fsSearch, color: 'rgba(244,247,255,0.94)', letterSpacing: 0.2}}>
          {typed}
        </span>
      ) : (
        <span style={{fontFamily: FONT.zh, fontSize: UI.fsSearch, color: 'rgba(147,160,189,0.68)'}}>{PAGE.searchPlaceholder}</span>
      )}
      {focused ? (
        <span
          style={{
            width: 1.5,
            height: 17,
            borderRadius: 1,
            background: COLORS.blue2,
            opacity: caretOn ? 0.9 : 0,
          }}
        />
      ) : null}
      <div style={{flex: 1}} />
      {typed ? (
        <span style={{color: 'rgba(147,160,189,0.6)', display: 'flex', alignItems: 'center'}}>
          <CloseIcon size={13} />
        </span>
      ) : null}
    </div>
  );
};

const CategoryRow: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
    {PAGE.categories.map((label, i) => (
      <Chip key={label} label={label} active={i === 0} muted={i === PAGE.categories.length - 1} />
    ))}
    <div style={{display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(147,160,189,0.7)'}}>
      <ChevronDown size={12} />
    </div>
    <div style={{flex: 1}} />
    <div style={{...glassButton, height: 27, fontSize: 12, gap: 6}}>
      <FilterIcon size={12} />
      {PAGE.filter}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// 插件卡片
// ---------------------------------------------------------------------------

const CardTag: React.FC<{label: string; dim?: boolean}> = ({label, dim = false}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      padding: '0 8px',
      borderRadius: 6,
      border: `1px solid ${dim ? 'rgba(142,166,255,0.14)' : 'rgba(142,166,255,0.22)'}`,
      color: dim ? 'rgba(147,160,189,0.72)' : 'rgba(244,247,255,0.72)',
      fontFamily: FONT.zh,
      fontSize: UI.fsCardTag,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

const MarketCard: React.FC<{
  item: MarketItem;
  frame: number;
  installState?: InstallState;
  installHighlight?: number;
  featured?: boolean;
  dim?: boolean;
  width: number;
}> = ({item, frame, installState = 'idle', installHighlight = 0, featured = false, dim = false, width}) => (
  <div
    style={{
      width,
      height: UI.cardHeight,
      padding: UI.cardPad,
      borderRadius: UI.cardRadius,
      background: featured
        ? 'linear-gradient(180deg, rgba(77,107,254,0.13) 0%, rgba(255,255,255,0.035) 62%)'
        : 'rgba(255,255,255,0.032)',
      border: featured ? '1px solid rgba(77,107,254,0.46)' : '1px solid rgba(142,166,255,0.14)',
      boxShadow: featured ? '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(77,107,254,0.08)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      opacity: dim ? 0.62 : 1,
      overflow: 'hidden',
      fontFamily: FONT.zh,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <span
        style={{
          fontFamily: FONT.zh,
          fontSize: UI.fsCardTitle,
          fontWeight: 600,
          color: dim ? 'rgba(244,247,255,0.72)' : 'rgba(244,247,255,0.96)',
          letterSpacing: 0.1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.title}
      </span>
      <span style={{color: 'rgba(147,160,189,0.55)', display: 'flex', alignItems: 'center', flexShrink: 0}}>
        <BranchIcon size={13} />
      </span>
      <div style={{flex: 1}} />
      <InstallButton state={installState} highlight={installHighlight} frame={frame} />
    </div>

    <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: UI.fsCardMeta, color: 'rgba(147,160,189,0.85)'}}>
      <Avatar name={item.author} size={17} />
      <span style={{color: 'rgba(244,247,255,0.7)'}}>{item.author}</span>
      {item.version ? (
        <>
          <span style={{color: 'rgba(147,160,189,0.5)'}}>·</span>
          <span style={mono}>{item.version}</span>
        </>
      ) : null}
    </div>

    <div
      style={{
        fontSize: UI.fsCardBody,
        lineHeight: 1.58,
        color: dim ? 'rgba(244,247,255,0.5)' : 'rgba(244,247,255,0.7)',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: 62,
      }}
    >
      {item.description}
    </div>

    <div style={{flex: 1}} />
    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
      <CardTag label={item.tag} dim={dim} />
      <div style={{flex: 1}} />
      <span style={{...mutedText, fontSize: UI.fsCardMeta, color: 'rgba(147,160,189,0.6)'}}>评论</span>
    </div>
  </div>
);

/** 无信息的占位卡：低对比、不编造名字/数字。 */
const SkeletonCard: React.FC<{width: number}> = ({width}) => (
  <div
    style={{
      width,
      height: UI.cardHeight,
      padding: UI.cardPad,
      borderRadius: UI.cardRadius,
      background: 'rgba(255,255,255,0.022)',
      border: '1px solid rgba(142,166,255,0.09)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      opacity: 0.55,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <div style={{width: 120, height: 14, borderRadius: 4, background: 'rgba(244,247,255,0.1)'}} />
      <div style={{flex: 1}} />
      <div style={{width: 66, height: 28, borderRadius: RADIUS.sm, background: 'rgba(255,255,255,0.05)'}} />
    </div>
    <div style={{width: 96, height: 11, borderRadius: 4, background: 'rgba(244,247,255,0.07)'}} />
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div style={{width: '92%', height: 10, borderRadius: 4, background: 'rgba(244,247,255,0.06)'}} />
      <div style={{width: '78%', height: 10, borderRadius: 4, background: 'rgba(244,247,255,0.06)'}} />
    </div>
    <div style={{flex: 1}} />
    <div style={{width: 74, height: 20, borderRadius: 6, background: 'rgba(244,247,255,0.06)'}} />
  </div>
);

// ---------------------------------------------------------------------------
// 详情页（标题下包名小字 + 来源表）
// ---------------------------------------------------------------------------

export const PluginDetail: React.FC<{frame: number; installState: InstallState; installHighlight: number}> = ({
  frame,
  installState,
  installHighlight,
}) => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(142,166,255,0.82)', fontSize: 13.5, fontFamily: FONT.zh}}>
      <span style={{fontSize: 16, lineHeight: 1, marginTop: -1}}>‹</span>
      <span>发现</span>
    </div>

    <div style={{display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 16}}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'linear-gradient(140deg, rgba(77,107,254,0.9), rgba(94,242,194,0.72))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 32px rgba(77,107,254,0.28)',
          border: '1px solid rgba(255,255,255,0.18)',
          flexShrink: 0,
        }}
      >
        <LogoMark size={30} />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{fontFamily: FONT.zh, fontSize: UI.fsDetailTitle, fontWeight: 600, color: 'rgba(244,247,255,0.97)', letterSpacing: 0.1}}>
            {DETAIL.title}
          </span>
          <span
            style={{
              ...mono,
              fontSize: 11.5,
              color: 'rgba(142,166,255,0.82)',
              border: '1px solid rgba(142,166,255,0.26)',
              borderRadius: 5,
              padding: '1px 7px',
              lineHeight: 1.5,
            }}
          >
            {DETAIL.version}
          </span>
        </div>
        <span style={{...mono, fontSize: 12.5, color: 'rgba(147,160,189,0.7)', letterSpacing: 0.3}}>{DETAIL.packageLine}</span>
      </div>

      <div style={{flex: 1}} />
      <InstallButton state={installState} highlight={installHighlight} frame={frame} size='detail' />
    </div>

    <div
      style={{
        marginTop: 18,
        maxWidth: 960,
        fontFamily: FONT.zh,
        fontSize: UI.fsDetailBody,
        lineHeight: 22 / 14,
        color: 'rgba(244,247,255,0.76)',
      }}
    >
      {DETAIL.description}
    </div>

    <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 8}}>
      <SectionLabel>{DETAIL.sourceTitle}</SectionLabel>
      <div style={{flex: 1, height: 1, background: 'rgba(142,166,255,0.12)'}} />
    </div>

    <div style={{marginTop: 4}}>
      {DETAIL.sourceRows.map(([label, value]) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 44,
            borderBottom: '1px solid rgba(142,166,255,0.09)',
            fontFamily: FONT.zh,
          }}
        >
          <span style={{width: 170, fontSize: 13, color: 'rgba(147,160,189,0.82)', flexShrink: 0}}>{label}</span>
          <span
            style={{
              ...(label === '主页' || label === '源代码' || label === '软件包' ? mono : {}),
              fontSize: label === '主页' || label === '源代码' ? 12.5 : 13.5,
              color: label === '主页' || label === '源代码' ? 'rgba(142,166,255,0.86)' : 'rgba(244,247,255,0.82)',
              letterSpacing: label === '软件包' ? 0.2 : 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {value}
            {label === '主页' || label === '源代码' ? <ExternalIcon size={11} /> : null}
          </span>
        </div>
      ))}
    </div>

    <div style={{marginTop: 20, display: 'flex', alignItems: 'center', gap: 8}}>
      <SectionLabel>版本</SectionLabel>
      <div style={{flex: 1, height: 1, background: 'rgba(142,166,255,0.12)'}} />
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 46}}>
      <span style={{...mono, fontSize: 15, fontWeight: 600, color: 'rgba(244,247,255,0.9)'}}>{DETAIL.version}</span>
      <span style={{fontFamily: FONT.zh, fontSize: 12.5, color: 'rgba(147,160,189,0.72)'}}>2026年10月20日</span>
      <div style={{flex: 1}} />
      <div
        style={{
          ...glassButton,
          height: 30,
          fontSize: 12,
          color: installState === 'installed' ? COLORS.mint : undefined,
          border: installState === 'installed' ? '1px solid rgba(94,242,194,0.34)' : undefined,
          background: installState === 'installed' ? 'rgba(94,242,194,0.08)' : undefined,
        }}
      >
        {installState === 'installed' ? '已安装' : installState === 'installing' ? INSTALL_LABEL.installing : INSTALL_LABEL.idle}
      </div>
    </div>

    <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(147,160,189,0.62)', fontSize: 12}}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          border: '1px solid rgba(142,166,255,0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: 'rgba(142,166,255,0.8)',
          flexShrink: 0,
        }}
      >
        i
      </span>
      {DETAIL.installNote}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Toast（安装成功，A 界面的热装文案）
// ---------------------------------------------------------------------------

const InstalledToast: React.FC<{frame: number; show: boolean}> = ({frame, show}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      bottom: 26,
      transform: `translate(-50%, ${show ? 0 : 14}px)`,
      opacity: show ? 1 : 0,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 42,
      padding: '0 18px',
      borderRadius: RADIUS.sm,
      background: 'rgba(9,16,30,0.96)',
      border: '1px solid rgba(94,242,194,0.34)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
      color: 'rgba(244,247,255,0.92)',
      fontFamily: FONT.zh,
      fontSize: 13.5,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}
  >
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: 999,
        background: 'rgba(94,242,194,0.16)',
        border: '1px solid rgba(94,242,194,0.5)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.mint,
        transform: `scale(${1 + Math.sin(frame / 10) * 0.03})`,
      }}
    >
      <CheckIcon size={12} />
    </span>
    {TOAST_TEXT}
  </div>
);

// ---------------------------------------------------------------------------
// 主组件
// ---------------------------------------------------------------------------

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const MarketUI: React.FC<MarketUIProps> = ({
  width,
  typed,
  query,
  resultState,
  installState,
  detail,
  frame = 0,
  resultEnter,
  detailEnter,
  installHighlight = 0,
}) => {
  const scale = width / MARKET_UI_DESIGN.width;
  const rEnter = clamp01(resultEnter ?? (resultState === 'results' ? 1 : 0));
  const dEnter = clamp01(detailEnter ?? (detail ? 1 : 0));
  const showToast = detail && installState === 'installed';

  const contentWidth = MARKET_UI_DESIGN.width - UI.navW - UI.contentX * 2;
  const cardWidth = (contentWidth - UI.cardGap) / 2;

  const grid = (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: UI.cardGap, width: contentWidth}}>
      {FILLER_ITEMS.map((item) => (
        <MarketCard key={item.title} item={item} frame={frame} dim width={cardWidth} />
      ))}
      <SkeletonCard width={cardWidth} />
      <SkeletonCard width={cardWidth} />
    </div>
  );

  const resultGrid = (
    <div style={{display: 'flex', gap: UI.cardGap, width: contentWidth}}>
      <MarketCard
        item={REEL_ITEM}
        frame={frame}
        featured
        installState={installState}
        installHighlight={installHighlight}
        width={cardWidth}
      />
    </div>
  );

  const marketContent = (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
      <MarketHeader />
      <TabBar />
      <SearchField typed={typed || query} focused frame={frame} />
      <CategoryRow />
      <div style={{position: 'relative', height: 552, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - rEnter}}>{grid}</div>
        <div style={{position: 'absolute', inset: 0, opacity: rEnter, transform: `translateY(${(1 - rEnter) * 10}px)`}}>
          {resultGrid}
        </div>
        {resultState === 'loading' ? (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'rgba(147,160,189,0.72)',
              fontFamily: FONT.zh,
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 999,
                border: '2px solid rgba(142,166,255,0.22)',
                borderTopColor: COLORS.blue2,
                transform: `rotate(${frame * 26}deg)`,
              }}
            />
            正在搜索
          </div>
        ) : null}
      </div>
    </div>
  );

  const detailContent = <PluginDetail frame={frame} installState={installState} installHighlight={installHighlight} />;

  return (
    <div
      style={{
        width,
        height: MARKET_UI_DESIGN.height * scale,
        position: 'relative',
        fontFamily: FONT.zh,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: MARKET_UI_DESIGN.width,
          height: MARKET_UI_DESIGN.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          borderRadius: UI.panelRadius,
          overflow: 'hidden',
          background: `linear-gradient(168deg, rgba(15,24,44,0.97) 0%, rgba(8,13,26,0.985) 58%, rgba(6,10,20,0.99) 100%)`,
          border: '1px solid rgba(142,166,255,0.16)',
          boxShadow: '0 60px 160px rgba(0,0,0,0.62), 0 0 0 1px rgba(77,107,254,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* 顶部高光 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(142,166,255,0.5), rgba(94,242,194,0.28), transparent)',
            opacity: 0.6,
          }}
        />

        <div style={{display: 'flex', height: '100%'}}>
          <SettingsNav />
          <div style={{position: 'relative', flex: 1, padding: `20px ${UI.contentX}px 16px`, overflow: 'hidden'}}>
            {/* 市场页 */}
            <div
              style={{
                opacity: 1 - dEnter,
                transform: `translateY(${-14 * dEnter}px)`,
                pointerEvents: 'none',
              }}
            >
              {marketContent}
            </div>

            {/* 详情页 */}
            <div
              style={{
                position: 'absolute',
                left: UI.contentX,
                right: UI.contentX,
                top: 20,
                opacity: dEnter,
                transform: `translateY(${12 * (1 - dEnter)}px)`,
                pointerEvents: 'none',
              }}
            >
              {detailContent}
            </div>

            <InstalledToast frame={frame} show={showToast} />
          </div>
        </div>
      </div>
    </div>
  );
};

export type {InstallState};
