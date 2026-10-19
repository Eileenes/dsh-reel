# dsh-reel-studio

**把一个 DeepSeek Harness (DSH) 插件仓库，在本地变成一条 16:9 宣传片 + 一张 3:4 宣传图。**

npm 包名：`dsh-reel-studio` · 仓库：`Eileenes/dsh-reel`  
[English](README.md) · 简体中文

> 状态：可运行原型。Remotion 管线与两种输出已端到端验证；DSH host 插件包（`dsh.bundle`）已搭好骨架，但**还没有在真实 DSH profile 里加载验证**。

## 样片

- [看 32.5 秒宣传片](docs/demo.mp4)
- [宣传图（2160×2880 PNG）](docs/promo.png)
- [视频封面](docs/poster.png)

![Better Sidebar 宣传图](docs/promo.png)

样片目标插件：[omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)（MIT）。这是非官方样片，用来验证“插件仓库 → 发布物料”的流程。截图来自该公开仓库；任务拓扑/侧边对话面板是合成的，不包含真实会话内容。

## 能产出什么

### 宣传片

- 32.5 秒 / 1920×1080 / 30fps / H.264 + AAC 立体声；
- 7 段结构：Hook → 问题 → 方案 → 四张功能王牌 → 怎么用 → 数据/安装/地址 → 片尾；
- 120 BPM 程序化配乐，场景切换与卡片入场落在半拍上；
- 真实 DSH 截图 + DSH 风格字标/配色 + 卡通小鲸鱼；
- 覆盖：是什么、解决什么问题、怎么用、安装命令、仓库地址、数据。

### 宣传图

- 1080×1440 设计稿，2× 输出 = 2160×2880 PNG；
- DSH 关联元素：`deepseek HARNESS` 字标、DSH 蓝/薄荷绿、网格、真实 DSH 截图、卡通小鲸鱼；
- 信息分区：是什么 / 解决什么 / 三步用起来 / 安装命令 / 地址 / 数据；
- 任务和侧聊使用合成 mock，不包含任何私有会话或个人信息。

## 环境要求

- Node.js 22+
- pnpm
- Chrome / Chromium（Remotion 用于渲染）；不在默认路径时设置 `CHROME_PATH`。
- Python 3 仅用于重新生成 BGM。

## 快速开始

```sh
git clone https://github.com/Eileenes/dsh-reel.git
cd dsh-reel/studio
pnpm install
cd ..

# 可选：CLI 也会检查 macOS/Windows/Linux 的常见 Chrome 路径
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 宣传片 + 封面 + 宣传图
node scripts/reel.mjs --case cases/dsh-better-sidebar.json --mode both

# 只出其中一种
node scripts/reel.mjs --case cases/dsh-better-sidebar.json --mode video
node scripts/reel.mjs --case cases/dsh-better-sidebar.json --mode image
```

输出在 `studio/out/`：

- `<slug>-demo.mp4`
- `<slug>-poster.png`
- `<slug>-promo.png`（2×）

可选参数：`--poster-frame 825`、`--dry-run`（只生成 props）。

## Case 格式

一个 case 就是一个 JSON 文件，显式列出所有要展示的事实，便于人和 agent 审核：

```json
{
  "plugin": {
    "name": "Better Sidebar",
    "handle": "dsh-better-sidebar",
    "version": "0.28.0",
    "repo": "github.com/omdsh-dev/DSH-better-sidebar",
    "install": "dsh plugin --profile web add dsh-better-sidebar",
    "downloads": 46445,
    "stars": 4297,
    "tagline": "一个侧边栏，装下整个开发工作台"
  },
  "features": [
    {"no": "01", "title": "文件树 + 编辑器", "desc": "...", "img": "shots/files-tree.png", "accent": "#4d6bfe"},
    {"no": "02", "title": "Git 工作台", "desc": "...", "img": "shots/changes-tree.png", "accent": "#5ef2c2"},
    {"no": "03", "title": "任务拓扑", "desc": "...", "mock": "tasks", "accent": "#ffb86b"},
    {"no": "04", "title": "侧边对话", "desc": "...", "mock": "sidechat", "accent": "#8ea6ff"}
  ],
  "promo": {
    "problem": "一个会话，五个工作面，却只有半块屏幕。",
    "what": "原生右栏 + 底部工作台。",
    "how": ["安装插件", "打开右侧栏", "按 tab 使用"],
    "address": "github.com/omdsh-dev/DSH-better-sidebar"
  }
}
```

图片从 `studio/public/` 读取。请使用自己的干净截图或内置合成 mock，不要提交含隐私/密钥的素材。

## 作为 DSH 插件使用

仓库包含 host 侧插件包：

- `reel_scan`：读取本地插件 package/README/截图目录；
- `reel_plan`：把 brief 转成确定性 storyboard；
- `reel_render`：本地渲染 `mode=video|image|both`。

安装到 scratch profile（尚未在真实 DSH 构建上验证）。npm 发布后：

```sh
dsh plugin --profile scratch add dsh-reel-studio
```

在那之前可以直接从 GitHub 装：

```sh
dsh plugin --profile scratch add github:Eileenes/dsh-reel
```

## 限制 / 下一步

- case 目前需要手写；下一步接 `reel_scan` + `reel_plan` 自动生成。
- 只有 16:9 视频和 3:4 图片；9:16 竖版和 1:1 方版还没做。
- 没有旁白；当前是程序化 BGM + 字幕。
- host 插件还需要真实 profile 的加载/HMR/dispose 验证，以及更轻的市场发布包。
- 未获授权不要渲染第三方截图；优先用合成 mock 或自己的 UI。

## 发布 / 插件市场

见 [PUBLISHING.md](PUBLISHING.md)。

## 免责声明

这是非官方社区项目，与 DeepSeek 无隶属或背书关系。“DeepSeek”“DSH”等名称归其所有者，此处仅用于描述兼容性。卡通鲸鱼是原创插画，不是官方 logo。样片中的截图来自 MIT 许可的 better-sidebar 仓库；任务/侧聊面板为合成内容。

## License

MIT，见 [LICENSE](LICENSE)。
