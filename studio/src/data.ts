export const plugin = {
  name: 'Better Sidebar',
  handle: 'dsh-better-sidebar',
  version: '0.28.0',
  repo: 'github.com/omdsh-dev/DSH-better-sidebar',
  install: 'dsh plugin --profile web add dsh-better-sidebar',
  downloads: 46445,
  stars: 4297,
  tagline: '一个侧边栏，装下整个开发工作台',
};

export type ReelFeature = {
  no: string;
  title: string;
  desc: string;
  img?: string;
  mock?: 'tasks' | 'sidechat';
  accent: string;
};

export const features: ReelFeature[] = [
  {
    no: '01',
    title: '文件树 + 编辑器',
    desc: '懒加载、全局搜索、CodeMirror 编辑、Markdown / Mermaid 预览',
    img: 'shots/files-tree.png',
    accent: '#4d6bfe',
  },
  {
    no: '02',
    title: 'Git 工作台',
    desc: '变更分组、AI 变更透镜、只读提交图谱、多仓库状态',
    img: 'shots/changes-tree.png',
    accent: '#5ef2c2',
  },
  {
    no: '03',
    title: '任务拓扑',
    desc: '子代理运行图、后台任务列表、实时输出与强杀',
    mock: 'tasks',
    accent: '#ffb86b',
  },
  {
    no: '04',
    title: '侧边对话',
    desc: '继承完整上下文、独立运行、一键提升为顶层会话',
    mock: 'sidechat',
    accent: '#8ea6ff',
  },
];

export type ReelPromo = {
  problem: string;
  what: string;
  how: string[];
  address: string;
};

export const promo: ReelPromo = {
  problem: '一个会话，五个工作面，却只有半块屏幕。',
  what: '原生右栏 + 底部工作台：文件、编辑器、Git、任务、侧聊、终端。',
  how: ['安装插件', '打开右侧栏', '按 tab 使用'],
  address: 'github.com/omdsh-dev/DSH-better-sidebar',
};

export type ReelData = {
  plugin: typeof plugin;
  features: ReelFeature[];
  promo: ReelPromo;
};

export const defaultReel: ReelData = {plugin, features, promo};
