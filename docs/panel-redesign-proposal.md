# 插件宣传台改版方案 v1 · 对齐「自媒体工作台」的设计语言

> 目标：把 `dsh-reel-studio` 的面板（插件宣传台）从「表单 + 进度条」升级成和 `dsh-media-desk`（自媒体工作台）同级别的「能看、能逛、有质感」的创作台，同时保留现有 V0.1 真机片管线与数据。
>
> 状态：**方案稿，未实施**。参考对象：`~/.dsh/profiles/desktop/node_modules/dsh-media-desk@2.5.3`（`dist/client.js` 194KB，MIT），官方展示图 `docs/assets/*.webp`（GitHub: woniuniuniu/dsh-media-desk）。

---

## 1. 参考对象的设计拆解（我实际读到的）

### 1.1 布局骨架

```
┌──────┬────────────────────────────────────────────┬──────────────┐
│ 图标 │  玻璃胶囊导航（灵感/内容/排期/复盘/风格）    │ 右侧助手 dock │
│ 轨   ├────────────────────────────────────────────┤（可收起，    │
│ 48px │  主画布（大标题 / 画墙 / 日历 / 图表）       │  玻璃面板）   │
│      │                                            │              │
│      │  底部：胶囊筛选条 / 生成输入 / 进度 step     │              │
└──────┴────────────────────────────────────────────┴──────────────┘
```

- `.md-topbar` 绝对定位悬浮、`pointer-events:none`；导航 `.md-nav` 是 `--glass` 玻璃胶囊（`backdrop-filter: blur(24px) saturate(160%)` + `elevation-soft`）。
- `.md-dock` 右侧助手面板：`blur(30px) saturate(160%)`、`0.5px` 左边线；浮起版本是 `--r-panel` 圆角 + `elevation-prominent`。
- 内容区大量使用弹性栅格：`minmax(0,1.7fr) minmax(0,1fr)`（成稿页左脚本右分镜）、`minmax(0,1fr) 248px`（日历 + 右栏）、`repeat(5, minmax(190px,1fr))`（内容看板）。
- 灵感墙用 CSS columns 瀑布流：`.md-wall { columns:236px; column-gap:16px }`；散落视图是绝对定位画布 `.md-node`，带视差 `translate(calc(var(--px)*var(--d)))`。

### 1.2 排版（最关键的一招）

- 大标题用**中文衬线**：`--serif: "Songti SC","STSong","Noto Serif SC",…`；拉丁衬线 `--latin-serif: "Iowan Old Style", Palatino, Georgia…`。
- `.md-hero-title`：`font-size: clamp(25px, 4.4cqw, 42px); font-weight: 300; letter-spacing: -.015em; line-height: 1.26` —— 大、轻、紧。
- 数字/元信息用等宽 + `font-variant-numeric: tabular-nums`；小字用 `--ink2/--ink3/--ink4` 分级。
- 大量「胶囊 meta」：`.md-pill`（34px 高、999 圆角、`inset 0 0 0 .5px` 内描边、`--glass` 底）。
- 卡片的编号/时长/镜头数用 mono 小字压在边上（`md-shot-meta` 11–12.5px）。

### 1.3 材质与主题

- **全部建立在 DSH 令牌上**：`--bg: var(--dsw-alias-bg-base)`、`--card: var(--dsw-alias-bg-layer-2)`、`--ink: var(--dsw-alias-label-primary)`、`--line: var(--dsw-alias-border-l2)`、`--glass: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent)`。
- 圆角一套：`--r-xs/sm/md/lg/xl/panel` 映射 `--dsw-radius-*`。
- 阴影全用 `--dsw-elevation-soft / prominent / panel`。
- 所以它在**深/浅色下都成立**——这正是我们上次深色按钮翻车的正解：不要硬编码白色，用 `--dsw-alias-label-primary-inverted` 这类语义令牌。

### 1.4 图像即界面

- 灵感墙的卡片是主角：图片 4:5 邮票遮罩（`.md-stamp` 用 radial-gradient mask 做出打孔的邮票边）、封面叠图（`.md-collage`）、6 格黑白线稿分镜（`.md-shot`）。
- 卡片悬停：`.md-card { transform: rotate(var(--r)) }` → hover `rotate(0) translateY(-4px) scale(1.025)`，过渡 `cubic-bezier(.2,1.3,.4,1)`（弹簧感）。
- 空/加载态有 `md-skeleton`、`md-shimmer`（渐变文字闪烁）、`md-shimmer-bg`（骨架扫光）。
- 品牌色只做点缀：极光渐变 `#1a1b3a → #4a2f6b → #d9745a`、蓝 `#4176e6`、薄荷、赭石；大面积为中性深色。

### 1.5 动效

- 14 组 keyframes：`md-rise / md-fade / md-pop / md-grow / md-develop / md-draw / md-shimmer / md-drift / md-breathe / md-wash / md-dock-in / md-toast / md-pulse / md-shimmer-bg`。
- 入场 `.6s` stagger；生成过程是「骨架先排好、内容一块块 develop 出来」——这和我们「分镜图逐张出现」是同一个思路，但它把**整个页面**都做成这样。
- 交互反馈：按钮 36px 高、`transition: background .15s, transform .25s`；步骤条 `.md-progress-step` 用颜色 + tabular 数字表达等待/进行/完成。

### 1.6 交互（不只是好看）

- 右侧「助手」dock：输入一句话就能改稿；改完在左侧以「✓ 重写开场和三个小标题 / ✓ 封面字改成…」气泡列出，可撤销。
- 底部常驻「怎么改，直接说」输入 + 圆形发送按钮。
- 顶部右侧是状态胶囊（示例数据/清空/助手）。
- 排期页：右侧永远显示「下一条」（大号时间），主区日历 + 待排期列表 → **状态永远在视线里**。

---

## 2. 现状审计（插件宣传台）

现在面板的流程是对的（V0.1 管线、案例匹配、渲染进度、成片/封面、终止任务都在），但界面是「后台管理表单」气质：

| 维度 | 现状 | 参考对象 |
| --- | --- | --- |
| 布局 | 单列：标题 → 生成框 → 生成过程 | 图标轨 + 玻璃 tab + 画布 + 右侧 dock |
| 排版 | 统一 13px，标题 14–19px | 衬线 25–42px 大标题 + 数字 + 胶囊 meta |
| 图像 | 只有 74px 分镜缩略图、130px 案例缩略图 | 封面/分镜/画墙是页面主体 |
| 材质 | 平铺白/深卡片 | 玻璃层 + 0.5px 描边 + 柔光 + elevation |
| 状态 | 进度条 + 文字行 | 步骤条 + 胶囊状态 + 产物 chips + toast |
| 动效 | 骨架脉冲 | rise/develop/shimmer/spring hover |
| 信息量 | 一次只能看一个任务 | 案例墙、成片库、最近动态并列可逛 |
| 深浅色 | 已修主按钮，但仍有零散硬编码 | 100% 令牌，无硬编码色 |

---

## 3. 改版概念：从「提交表单」到「导演台」

保留三件事：V0.1 管线、`cases/v01/<slug>.json` 案例、`scripts/film.mjs` 任务。
改变的是外壳：**一个页面，三个视图**，用一个玻璃胶囊 tab 切换：

### 视图 A · 案例墙（Wall）
- 主体：masonry 卡片墙，每张卡 = 一个可出片的插件案例：
  - 大图：案例的成片封面 / 4 张真实界面截图拼贴
  - 标题：`dsh-pet`；副标：`蓝毛小女仆 · 28s · 840 帧`
  - 胶囊：`可出真机片` / `渲染中` / `已出片 2 次` / `待准备`（无案例的插件）
  - hover：倾斜归正 + 抬升 + 显示「进生成台 →」
- 顶部：搜索 + 筛选胶囊（全部/已出片/待准备）+ 视图切换（墙/网格）
- 「+ 新增插件」卡：点击 → 右侧 dock 里生成一段 agent prompt（复制/交给 agent）
- 数据：`state.cases`（v01）+ `state.outputs`（成片封面）+ `state.jobs`（状态）；「待准备」列表来自 profile 扫描（需新增只读接口，或第一版只展示手工登记）

### 视图 B · 生成台（Studio）
三栏，响应式折叠：

```
┌──────────────────────────┬──────────────────────────┬────────────────┐
│ 左：目标 + 对话微调        │ 中：大标题 + 元信息 + 封面  │ 右：分镜/进度   │
│ 案例选择（下拉/卡片）      │ dsh-pet 蓝毛小女仆         │ 01 开场        │
│ 已匹配：V0.1 真机片案例    │ 20:34 · 28s · 840 帧      │ 02 问题        │
│ 指令气泡（✓ 已执行/撤销）  │ [封面叠图 3 张]            │ 03 方案        │
│ 「怎么改，直接说」输入      │ [生成真机片] [终止任务]     │ 04-07 功能页   │
│                          │                            │ 08 用法 09 片尾│
└──────────────────────────┴──────────────────────────┴────────────────┘
底部 dockbar：素材 → 音效 → 渲染 840 帧 → 混流 → 封面（步骤胶囊 + 进度）+ 产物 chips（播放/下载/复制）
```

- 大标题用**衬线 40px**，副标 mono 小字（插件名 · 版本 · 案例状态）。
- 中间是「封面叠图」：成片 poster + 2 张功能页缩略图错落叠放（呼应参考页的封面 stack）。
- 右侧 9 格分镜（对应 `buildScenes` 的 9 镜头；V0.1 片实际用：安装页 + 4 功能页 + 片尾，可标出哪格对应成片时间），渲染中逐格 develop，未出图为骨架。
- 生成按钮旁的状态：`已匹配到 V0.1 真机片案例` 胶囊；无案例时显示「交给 AI 准备案例」主按钮 + 说明。
- 进度 dockbar 常驻：不给假进度，按 `film.mjs` 的真实阶段（prepare/audio/render:video/mux/poster）推进；完成后变成「成片已出 · 播放 / 打开文件 / 复制路径」。

### 视图 C · 成片库（Archive）
- 网格卡片：poster 图 + 时长/大小/日期 + 案例名；点击内嵌播放（`<video>` 用现有 `/api/out` 支持 Range）。
- 筛选：全部/最近 7 天/按插件；操作：重渲染、复制路径、在 Finder 中显示（用路径复制）。
- 顶部统计条：`本周 3 条 · 最近 1 条 20:34 · 渲染中 1`（对应参考页右上角「下一条」的位置）。

### 全局
- 顶部玻璃胶囊 tab（案例墙/生成台/成片库）+ 右侧「?」帮助浮层（保留现有内容）。
- 右侧可收起的 **Assistant Dock**：
  - 第一版不接 LLM：预设指令按钮（"给这个插件出片"、"重渲染最近一条"、"换成 guizang"、"看这条日志"）+ 自由输入 → 点击后要么执行本地动作，要么复制成 agent prompt（复用现有 handoff）。
  - 第二阶段再接 agent/LLM 做真正的「说一句就改」。
- 底部状态条：渲染中任务、最近成片、今日出片数。

---

## 4. 设计规范（可直接落 CSS）

### 4.1 令牌映射（全部用 DSH 语义令牌，主题自适应）

| 用途 | 令牌 |
| --- | --- |
| 画布底 | `--dsw-alias-bg-base` |
| 卡面 | `--dsw-alias-bg-layer-1/2/3` |
| 文字 | `--dsw-alias-label-primary / secondary / tertiary / caption` |
| 线 | `--dsw-alias-border-l1..l4` |
| 交互 | `--dsw-alias-interactive-bg-hover / active` |
| 品牌/链接 | `--dsw-alias-link` |
| 强调底色上的字 | `--dsw-alias-label-primary-inverted` |
| 阴影 | `--dsw-elevation-soft / prominent / panel` |
| 圆角 | `--dsw-radius-xs..xl`、`--dsw-radius-panel` |
| 字体 | `--dsw-font-family` + 自定义 `--reel-serif` / `--reel-latin` / `--reel-mono` |

自定义少量局部变量：
```css
--reel-glass: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent);
--reel-serif: "Songti SC","STSong","Noto Serif SC","Source Han Serif SC",Georgia,serif;
--reel-latin: "Iowan Old Style","Palatino",Georgia,serif;
--reel-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
--reel-spring: cubic-bezier(.2, 1.3, .4, 1);
```

### 4.2 字号阶梯

| 用途 | 字号/字重 | 字体 |
| --- | --- | --- |
| 页面大标题 | `clamp(28px, 4.4cqw, 42px)` / 300 | serif |
| 区块标题 | 20–24px / 500 | serif 或 DSH sans |
| 卡片标题 | 15–16px / 600 | sans |
| 正文 | 13px / 400 | sans |
| meta / 胶囊 | 11–12px，`tabular-nums` | mono / sans |
| 按钮 | 13px / 550 | sans |

### 4.3 材质参数

- 玻璃：`background: var(--reel-glass); backdrop-filter: blur(24px) saturate(160%); box-shadow: var(--dsw-elevation-soft);` + `inset 0 0 0 .5px var(--dsw-alias-border-l2)`。
- 卡片：`border-radius: var(--dsw-radius-xl); background: var(--dsw-alias-bg-layer-1); box-shadow: var(--dsw-elevation-soft); border: .5px solid var(--dsw-alias-border-l1)`。
- hover：`transform: translateY(-4px) scale(1.02); box-shadow: var(--dsw-elevation-prominent); transition: .45s var(--reel-spring)`。
- 画布 ambient：`bg-base` 上叠两层 radial-gradient（品牌蓝 8%、暖橙 6%，暗色下更深），加 88px 网格线 opacity 3%——和成片调色（#05070d / #4d6bfe / #5ef2c2 / 暖橙）同源。

### 4.4 动效

| 场景 | 参数 |
| --- | --- |
| 卡片入场 | `md-rise .5s var(--reel-spring) both`，stagger 40–60ms |
| 分镜出图 | opacity 0→1 + blur 6px→0 + translateY 12px→0，450ms |
| 生成中 | 骨架扫光 1.6s linear infinite；文字 shimmer |
| 按钮/胶囊 hover | 背景 .15s；transform .25s spring |
| 页面切换 | 淡入 + 轻微上移 8px，250ms；tab 胶囊滑动 |
| 完成 | 成片卡片 wash（亮度闪一下）+ toast |

### 4.5 空/错/加载态

- 空案例墙：大衬线一句「还没有可出片的插件」+「录入插件名」输入 + 两个示例胶囊。
- 无案例：说明 + 「交给 AI 准备案例」按钮（复用 handoff prompt）。
- 渲染失败：错误胶囊展开日志（现有 reel-log 保留，包一层玻璃）。
- 深色回归：所有颜色走令牌，禁止 `#fff/#000`；`body[data-ds-dark-theme]` 只作为极少数特殊覆盖（如红色危险按钮）。

---

## 5. 组件清单（仍保持单文件 `lib/client.js`，按函数拆分）

| 组件 | 说明 |
| --- | --- |
| `TopBar` | 玻璃胶囊 tab、状态胶囊、帮助按钮 |
| `Ambient` | 画布光影/网格背景层 |
| `CaseWall` | masonry 卡片墙、搜索、筛选、待准备卡 |
| `StudioView` | 大标题区 + 元信息 + 封面叠图 + 分镜网格 + 主按钮 |
| `ShotGrid` / `ShotCell` | 9 格分镜、develop 骨架、成片时间标注 |
| `AssistantDock` | 指令气泡（✓/撤销）、快捷指令、输入框 |
| `ProgressDock` | 步骤胶囊 + 进度 + 产物 chips + 日志抽屉 |
| `ArchiveView` | 成片卡片、筛选、内嵌播放器 |
| `Toast` / `Empty` / `Skeleton` | 反馈与占位 |

CSS 仍作为文件底部一个 `CSS` 字符串（和现在一致），但按块加注释分组；如果继续膨胀，再拆 `lib/client.css.js` 导出字符串（仍无需构建）。

---

## 6. 数据与接口

复用（都已有）：
- `GET /api/state`：`cases`（含 kind=v01）、`jobs`、`outputs`、`film`、`clientRev`
- `GET /api/case?path=…`：读案例详情（v01 case 里的 features/图片）
- `POST /api/jobs`（`type:"film"`）、`POST /api/jobs/:id/cancel`、`GET /api/out/*`（Range）

建议新增（只读，工作量小）：
1. `GET /api/films`：把 `outputs` 聚合为成片记录（video/poster/mix + 案例名 + 时间 + 时长/大小），给成片库用；前端也可先自行聚合。
2. `GET /api/plugins`：扫描 profile `node_modules` 里的 DSH 插件（package.json 的 dsh.client/dsh.bundle），返回「可准备案例」的插件清单（案例墙的待准备卡）。
3. `GET /api/cases/:id`：v01 案例详情 + 是否就绪（图片存在/是否需要重新生成 comp）。

不改渲染管线、不改 `scripts/film.mjs`。

---

## 7. 实施计划

| 阶段 | 内容 | 验收 | 估时 |
| --- | --- | --- | --- |
| P1 骨架 + 视觉系统 | Ambient、TopBar、StudioView 布局、按钮/胶囊/卡片/步骤组件、字号/材质令牌；现有生成逻辑原样搬入 | 深浅色截图对照、点击生成/终止/看进度与现状一致 | 0.5–1 天 |
| P2 案例墙 | CaseWall、卡片、搜索/筛选、待准备卡、案例详情预览 | 3 个案例卡都能正确展示并能进入 Studio；无案例卡给出交接提示 | 0.5 天 |
| P3 成片库 + 播放器 | ArchiveView、聚合数据、内嵌播放、复制路径 | 历史成片可播；筛选正确；新成片自动出现 | 0.5 天 |
| P4 助手 dock + 动效打磨 | AssistantDock（第一版预设指令 + handoff）、develop/shimmer/toast、响应式折叠 | 小窗（<900px）不破版；深色/生成中/失败/取消回归 | 0.5–1 天 |

总计约 2–3 天；每一步都可单独上线，风险低。

---

## 8. 风险与降级

- **不要在面板里伪造进度**：11 分钟渲染只按真实阶段推进；等待体验用「可切走继续跑 + 顶部状态胶囊」解决。
- **图片体积**：成片库用 poster 缩略（已有 `/api/out`），分镜用 960px 素材即可；避免一次加载 9 张 1.4MB 原图。
- **单文件膨胀**：client.js 会到 ~3–4k 行；按视图拆函数 + CSS 分块注释；必要时拆 `client.css.js`（无构建）。
- **深浅色回归**：全部令牌 + 一条 headless 截图回归（浅/深各 3 视图），避免再出现「白字白底」。
- **案例墙待准备列表**：v1 先只列 `cases/v01` 已有案例 + 1 张「新增插件」卡；`/api/plugins` 扫描放到 P3 之后。

---

## 9. 待确认（影响排期与设计）

1. 三视图（案例墙 / 生成台 / 成片库）是否都做，还是第一版只做「生成台」视觉升级？
2. 右侧 Assistant Dock 第一版走「预设指令 + 复制 agent prompt」可以吗？（真正 LLM 对话放后面）
3. 案例墙的「待准备插件」要不要扫描整个 profile（所有已安装插件）？这决定是否新增 `/api/plugins`。
4. 要不要我先出一个**可交互的静态原型**（HTML/截图）给你过目，再改面板？

---

## 10. 已确认的决策与原型（2026-11-10）

1. **只做两个视图**：安利墙 + 生成台；**不做成片库**（成片只在生成台里播放/预览，左侧保留一小块「最近出片」上下文）。
2. **先保证生成链路可用**：视觉重构不动 `scripts/film.mjs` / `POST /api/jobs` 的现有逻辑，P1 先把现有生成/终止/进度原样搬进新布局。
3. **不做 profile 扫描**：第一版安利墙只展示已有 `cases/v01` 案例 + 一张「安利下一个插件」入口卡（点一下复制 agent prompt）。扫描的价值只在于「新增案例时从已安装插件里挑」——放到二期，作为新增流程的选择器，而不是墙上的空卡。
4. **交互原型已产出**：`studio/out/prototype/index.html`（真实 3 个案例 + 真实成片/封面，生成进度为加速模拟）。
   - 打开方式：Chrome 打开该文件；页面内可切「安利墙 / 生成台」、点卡片进生成台、点「生成真机片」看完整状态机、切深浅色。
   - 截图：`studio/out/prototype/screenshots/`。

---

## 11. 输入流程与说明（2026-11-10 补充，已进原型）

面板的入口统一为「**顶部输入框录入插件名**」，而不是只靠点已有案例：

1. **录入插件名**：安利墙 hero 下方的大输入框（`输入插件名称，例如 dsh-pet`），输入时实时提示：
   - 命中案例 → 显示案例缩略卡 + `✓ 已匹配案例 · 蓝毛小女仆 dsh-pet` + 「下一步进生成台」；
   - 未命中 → 显示 `· 暂无现成案例` + 「下一步：交给 AI 准备案例」。
2. **匹配案例**：点「下一步」→ 命中则直接进生成台；未命中则弹出**下一步说明弹层**：① 已收到插件名 → ② 交给 AI 按 SOP 准备案例（读 package.json/README/真实截图，写 `cases/v01/<slug>.json`，约 10–20 分钟）→ ③ 案例就绪后回生成台出片（约 10 分钟）；弹层底部「复制 agent 指令 / 去准备」。
3. **生成真机片**：生成台里点主按钮，按真实阶段推进（素材与音效 → 840 帧 → 混流 → 封面），可终止、可切走。
4. **看成片**：生成台内播放器直接播放，复制产物路径 / 重新生成。

**说明介绍**：右上角 `?` 与输入框下方「怎么用？完整说明」打开同一个弹层，包含上述四步和「有案例 / 无案例」两条路径；墙上的案例卡是「已有案例」的快捷入口。

实现映射（P1）：
- 输入框 → 用 `/api/state.cases` 里的 `kind==="v01"` 做前端匹配（复用 `matchFilmCase`）；
- 未命中 → 用 `uiWorkspace.startSession(prompt)`（现有 handoff 机制）把插件名交给 agent；
- 帮助弹层 → 纯前端组件（HTML/CSS），无需接口。
