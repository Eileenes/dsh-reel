# 案例：Better Sidebar 真机宣传片 v0.1

- 成片：[`better-sidebar-v0.1.mp4`](./better-sidebar-v0.1.mp4)（28s / 1920×1080 / 30fps / 带声音）
- 目标插件：[`omdsh-dev/DSH-better-sidebar`](https://github.com/omdsh-dev/DSH-better-sidebar)（MIT）
- 方法：[`promo-method-v0.1.md`](./promo-method-v0.1.md)

---

## 1. 插件实际功能

| Tab | 真实功能 | 片中使用 |
| --- | --- | --- |
| 文件 | 懒加载文件树、Git 状态色、搜索、拖拽上传、多选、Open with、Zip/Download、编辑器/预览 | 文件树 → 文件菜单 |
| Git | Merge/Staged/Changes、commit message + Generate、分支/同步、AI 变更透镜、commit graph | Changes → Graph |
| 任务 | 子代理拓扑（workflow/tree）、后台任务、exit code、实时输出、force-kill | 功能页卡 + 拓扑示意 |
| 侧聊 | 继承父上下文、实时推送、队列、按线程选模型、提升为主会话 | 功能页卡 + 对话示意 |

---

## 2. 28s 时间线

| 时间 | 内容 | 鲸鱼 |
| --- | --- | --- |
| 0–5s | 终端 `dsh` → 鲸鱼拼合 → 喷水 | 拼合/落地/喷水 |
| 5–9s | Dock 文件 → Git → DSH → 窗口展开 | 三跳 |
| 9–12s | DSH 正面 → 跳到「插件」→ 插件页 | 跳插件按钮 |
| 12–15s | 搜索 `better-sidebar` → 结果卡 → 安装 → 蓝色进度 → 已安装 | 跳搜索/安装 |
| 15–16s | Better Sidebar 侧栏从右滑入，tab 栏出现 | 停在侧栏 |
| 16–18.2s | 文件 tab → 文件树 → 文件菜单 | tab → 文件行 |
| 18.2–21s | Git tab → Changes → commit graph | tab → Graph |
| 21–23.5s | 任务 tab → 子代理拓扑页卡 | tab |
| 23.5–26s | 侧聊 tab → 侧聊页卡 | tab |
| 26–28s | 黑底片尾 + 安装命令，鲸鱼右上角 | 跳到右上角 |

---

## 3. 素材来源

| 素材 | 来源 | 用途 |
| --- | --- | --- |
| `files-tree.png` / `files-menu.png` | Better Sidebar 官方仓库 `docs/screenshots/`（浅色） | 文件 tab、文件菜单 |
| `changes-tree.png` | 同上（浅色） | Git tab、commit graph |
| 任务 / 侧聊 | 官方 README 附件（深色、含真实会话） | **未直接使用**，改为浅色功能页卡 |
| DSH 主界面/插件页 | 本项目自己的 clean UI 截图 | 9–15s |

> 公开片里不出现个人对话、个人路径、真实账号；任务/侧聊后续可用同主题干净截图替换页卡。

---

## 4. 鲸鱼路线

```text
安装按钮 → 文件 tab → 文件行 → Git tab → Graph → 任务 tab → 侧聊 tab → 画面右上角
```

规则：只沿 tab 栏单向移动；不在面板左右折返；每个 tab 一次按下 + 波纹。

---

## 5. 渲染参数

- Onetake 自定义 comp：`promo/comp-better-sidebar.html`（见 `promo/README.md`）
- 1920×1080 / 30fps / shutter 180°
- 4 workers；H.264 CRF 16
- 音频：BGM + 49 个 SFX 事件；RMS -18.8 dBFS，peak -1.0 dBFS；AAC 256k

---

## 6. 已知限制

1. 任务/侧聊是浅色功能页卡，不是真实截图；
2. 文件/Git 的真实截图来自官方浅色示例，demo 数据；
3. 0–15s 的 DSH UI 是 clean 重建界面，不是逐像素实拍；
4. 片尾停留在黑底卡，不回到 DSH 主界面。
