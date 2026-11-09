/**
 * Sorenyeah home film — copy and content.
 * Every string, number and image below points at a real page or asset of
 * https://sorenyeah.com/ (checked 2026-11-08); nothing is invented.
 */

export const SITE = {
  brand: 'Soren',
  domain: 'sorenyeah.com',
  tagline: 'AI 赋能与前瞻探索',
  role: '独立 AI 开发者 · Qoder 大使 · 十年产品经理',
  bio: '做过物联网、创过业、互联网清洁工，把好奇心做成产品。',
  cta: '探索我的作品',
  kicker: 'SOREN · SORENYEAH.COM',
  email: 'taoyeyeah@gmail.com',
  wechat: 'Eileeness',
  github: 'github.com/Eileenes',
  x: 'x.com/Eileeness160708',
  projectsHeading: '想法，运行中',
  writingHeading: '记录，持续更新',
  musicHeading: '我的音乐',
  footerLine1: '下一个有趣的想法，',
  footerLine2: '一起做。',
  proof: [
    {num: '4', label: '个作品'},
    {num: '7', label: '首原创音乐'},
    {num: '10', label: '年产品经验'},
  ],
} as const;

export type Project = {
  no: string;
  title: string;
  type: string;
  desc: string;
  /** 'art' = the project's own key art, rebuilt with the same assets; 'image' = the site's real cover. */
  art: {kind: 'pi'} | {kind: 'skills'} | {kind: 'image'; src: string; fit?: 'cover' | 'contain'};
  accent: string;
};

export const PROJECTS: Project[] = [
  {
    no: '01',
    title: 'Pi Desktop',
    type: '桌面应用',
    desc: '基于 Pi 的独立桌面编程客户端，把项目、模型对话、文件、Git 与终端放进一个窗口。',
    art: {kind: 'pi'},
    accent: '#7fd8e8',
  },
  {
    no: '02',
    title: 'Creative Skills',
    type: '创作工具',
    desc: '为 AI 助手准备的 8 个创作技能，覆盖立体头像、角色卡、个人 IP、文章配图与宣传视频。',
    art: {kind: 'skills'},
    accent: '#c2b6ff',
  },
  {
    no: '03',
    title: 'DSH Reel',
    type: '视频工具',
    desc: '用 Remotion 制作 DSH 插件的横屏视频、封面和竖版宣传图。',
    art: {kind: 'image', src: 'sorenyeah/images/dsh-reel-still.jpg', fit: 'cover'},
    accent: '#8ea6ff',
  },
  {
    no: '04',
    title: 'Whack a Tibo',
    type: '浏览器游戏',
    desc: '把互联网的一个梗，做成可以亲手玩的小小打地鼠游戏。',
    art: {kind: 'image', src: 'sorenyeah/images/game-cover.jpg', fit: 'cover'},
    accent: '#ffb86b',
  },
];

export const ARTICLES = [
  {
    title: 'DeepSeek Harness 保姆级上手教程',
    category: 'AI 工作流',
    date: '2026.11.07',
    cover: 'sorenyeah/images/article-1.jpg',
  },
  {
    title: '不用 iPhone、不找代充：Starryblu 保姆级开户，订阅 AI 自己就能付',
    category: '实用教程',
    date: '2026.11.04',
    cover: 'sorenyeah/images/article-2.jpg',
  },
  {
    title: '别再找代充了，手把手教你订阅 ChatGPT',
    category: '实用教程',
    date: '2026.11.03',
    cover: 'sorenyeah/images/article-3.jpg',
  },
];

export const TRACKS = [
  {no: '01', zh: '再往前一步', en: 'One Step Further', dur: '3:01'},
  {no: '02', zh: '將日子唱到發光', en: 'Sing the Days into Light', dur: '4:07'},
  {no: '03', zh: '春风绕', en: 'Spring Breeze', dur: '3:32'},
  {no: '04', zh: '下一拍，轮到我们', en: 'The Next Beat Is Ours', dur: '4:04'},
  {no: '05', zh: '多待一晚', en: 'One More Night', dur: '3:36'},
  {no: '06', zh: '每一刻都揀你', en: 'You Every Moment', dur: '3:17'},
  {no: '07', zh: '绿灯亮了', en: 'The Light Turns Green', dur: '3:39'},
] as const;
