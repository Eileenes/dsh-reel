# Changelog

## 0.5.0 — 2026-11-11

- 新增 **仓库自带的 V0.1 影片渲染器** `tools/v01-film/render-frames.mjs`：驱动本机 Chrome 逐帧 `__seek(t)` 截图，
  快门区间内按 `window.__motion` 自适应采样（6px 间距、4–48 张）、在线性光下积分出运动模糊，并做硬切保护
  （相邻采样某一步变化 ≥3 倍即只积分帧时间那侧）；输出 H.264 High / yuv420p / `+faststart`，`--sfx` 一步混流，
  另写 `<out>.render.json`。PNG 编解码与积分都在文件内实现，除 `puppeteer-core` 外无额外依赖。
  **不再需要 Onetake 运行时**（Onetake 闭源、PolyForm Noncommercial，仍不随仓库分发）。
- 与参考实现 Onetake 对帧：同一条 `comp-<slug>.html` 帧数（840）、每帧采样次数（4162 vs 4168）、硬切判定一致，
  整片 PSNR 40.2 dB / SSIM 0.9946，差异只在字形抗锯齿；耗时 294s vs 410s（4 workers）。见 `docs/case-dsh-openpencil-v0.1.md`。
- `scripts/film.mjs`：渲染步骤默认走仓库渲染器（`--engine onetake` 可回退参考实现），环境检查改为
  comp 依赖 + ffmpeg + Chrome；新增 `--engine`；ffmpeg 绝对路径透传（GUI 最小 PATH 下也能用）。
- 新增 `tools/v01-film/comp-assets/`（comp 模板启动时加载的 27 个素材，约 10 MB）：
  干净安装时由 `film.mjs` 自动铺到 `.research/onetake-promo`（安装目录只读时用 `studio/out/.comp-workdir`），
  于是 npm 装上就能出片，只要求本机有 Chrome/Chromium + ffmpeg（+ python3 做音效）。
- `puppeteer-core` 成为运行时依赖；`npm run check` 覆盖新脚本，新增 `npm run v01:render`。
- 面板：运行环境一行从「Onetake runtime」改为「渲染器 · 无头 Chrome」，未就绪提示与交给 AI 的指令同步更新。
- 新增 **dsh-openpencil** 的 V0.1案例：`cases/v01/dsh-openpencil.json`（多帧预览 / 画布总览 / 托管编辑器 / 图层属性），
  四张截图来自插件随包文档截图与本机真实运行时（`op-host-web-server`、Web SDK），来源见 `studio/public/shots/openpencil/SOURCES.md`；
  案例记录在 `docs/case-dsh-openpencil-v0.1.md`。
- 文档：SOP §4 改为仓库渲染器为主路径（Onetake 收进可选折叠段），§8/§9 同步；README 的 V0.1 章节、PUBLISHING 的运行时说明更新。

## 0.4.1 — 2026-11-11

- docs: move the historical Chinese README out of the package root (`docs/README.zh-CN.md`), so npm renders the current `README.md` as the package readme instead of the stale "历史中文说明" file.

## 0.4.0 — 2026-11-10

- 面板重构为「**安利墙 + 生成台**」两视图（参考自媒体工作台的设计语言：图标轨、玻璃胶囊导航、衬线大标题、mono 数字、封面/分镜叠图、真实阶段 dockbar）；顶部输入框录入插件名并实时提示是否已有案例，`?` 打开四步「怎么用」说明，没有案例时把插件名交给 agent 准备（截图见 `docs/panel/`）；
- 新增 **dsh-pet** 的 V0.1 真机片案例：`cases/v01/dsh-pet.json` + `studio/public/shots/dsh-pet/`（4 张插件真实界面截图，来自仓库 `assets/screenshots/`）→ `studio/out/promo-dsh-pet-intro-1080.mp4`（28s / 1080p / 840 帧；随机动作、余额气泡、多开同屏、桌宠配置四页）；面板输入 `dsh-pet` 即可直接生成；
- 面板深色主题：主按钮文字改用 `--dsw-alias-label-primary-inverted`（深色下自动变深色字），终止任务按钮在深色下改用 red-600 + 白字，随系统深色/浅色切换都可见；
- 面板帮助浮层：改为显示 V0.1 案例的真实分镜图（剧本 4 个功能页截图）与最终海报，生成过程说明也换成真机片工作流（素材/音效 → 渲染 840 帧 → 混流 → 封面）；
- 面板文案：输入框下不再列出可用案例；操作说明改为「录入插件名称 + 点击后系统按工作流依次做什么」，说清 V0.1 出片步骤；
- 面板改为走 **V0.1 真机管线**出片：输入插件名 → 匹配 `cases/v01/<slug>.json` → `scripts/film.mjs` 依次执行 make-v01-film（comp/素材/音效时间轴）→ 本地合成混音 → Onetake 渲染 840 帧（约 10 分钟）→ ffmpeg 混流 + 封面，面板显示两个阶段的进度；没有案例时提示并一键把需求交给 agent 按 SOP 准备真实界面截图与文案，不再渲染内置 Game Studio 案例；宿主新增 `type:"film"` 任务、`state.film` 运行时探测与 `startFilm()`，ffmpeg / python3 会同时探测 `/opt/homebrew/bin`、`/usr/local/bin` 等绝对路径，避免 GUI 最小 PATH 下误判环境缺失；
- 面板帮助浮层：「这次介绍」改为「案例」；海报/分镜缩略图不再裁切，统一 130px 图块 + `object-fit:contain` 完整显示，浮层加宽到 440px 并在内容超高时内部滚动；
- 面板：任务进行中时「开始生成」主按钮变为「终止任务」，点击即可停止当前任务；
- 面板分镜阶段改为随任务进度逐张出现真实分镜图：`reel.mjs` 新增 `--storyboard`，按 PluginDemo 分镜时间轴逐张渲染 `studio/out/storyboard/`，服务端解析 `[reel] shot` 产物并通过 `shots` 返回，面板在图片出来前显示占位骨架、不再直接复用案例截图；
- 面板生成框文案：去掉示例需求的自动预填，输入框为空并显示灰色提示「输入插件名称，AI 会自动生成这个插件的宣传视频」，字段标签改为「插件名称」，相关引导文案同步调整；
- 面板帮助浮层：「这次介绍」改为「案例」；海报/分镜缩略图不再裁切，统一 130px 图块 + `object-fit:contain` 完整显示，浮层加宽到 440px 并在内容超高时内部滚动；
- 新增 **dsh-whale-widget** 的 V0.1 案例：`cases/v01/dsh-whale-widget.json` → `studio/out/promo-whale-widget-intro-1080.mp4`（28s / 1080p；余额泡泡、自定义泡泡、音效提示、用量记录四页）；插件仓库缺功能截图，新增 `tools/v01-film/widget-shots/`（mock DSH 页面 + 宿主接口桩 + puppeteer 截图）来截取插件自己的真实 UI，见 `docs/case-dsh-whale-widget-v0.1.md`；
- 新增 **V0.1 按插件名出片流水线**：`tools/v01-film/make-v01-film.mjs` + 通用模板 `tools/v01-film/comp-template.html` + `cases/v01/` + `docs/v01-film-sop.md`；一条命令从案例 JSON 生成 comp、四张功能图、config 和 61 事件音效时间轴，随后按固定步骤用 Onetake 渲染 28s / 1080p 成片；
- 新增 dsh-guizang-design 的 V0.1 案例：`cases/v01/dsh-guizang-design.json` → `studio/out/promo-guizang-intro-1080.mp4`（结构：终端 → 鲸鱼 → Dock 三跳 → 插件页搜索/安装（蓝色进度）→ 四个功能页 → 片尾 AGPL-3.0 · 仓库）；案例说明见 `docs/case-guizang-v0.1.md`；
- 新增 dsh-guizang-design 案例：`cases/dsh-guizang-design.json`（v1 模板）与规范版 30s 影片 `ReelGuizang`（严格按 `docs/promo-method-v0.1.md` 五段式 + `.research/dsh-reel-promo/better-sidebar-storyboard-v4.md` 分镜表）：
  - 0–5s 终端 `dsh` → 鲸鱼拼合 → 喷水；
  - 5–9s Dock 文件 → Git → DSH 三跳 → DSH 窗口展开 → 鲸鱼跳窗口；
  - 9–12s DSH 主界面 → 鲸鱼跳到「插件」文字上按下（只给波纹/按压，不新增高亮框）→ 插件页在同一个 DSH 窗口壳内展开；
  - 12–15s 搜索 `guizang-design` → 结果卡 → 鲸鱼跳「安装」→ 结果卡下方蓝色进度条 → 已安装；
  - 15–27.5s 四个 skill 各四拍（聚焦 tab 高亮 / 点击鲸鱼落下+波纹 / 结果面板切换 / 停留）；
  - 27.5–30s 黑底片尾：名称 + 安装命令 + 鲸鱼右上角；
  - 全片共用同一个 DSH 窗口壳（左侧栏常驻），点击波纹按方法文档的 40px 规范；
- 官方插件页参数化（供后续案例复用）：`OfficialPluginsUI` 新增 `targetEntry`，`C4Install` 支持 `query` / `entries` / `targetEntry` / 字幕；
- 市场场景参数化：`S4Search` 支持 `query` / `item` / 包名注记 / 字幕，`S5Install` 支持 `detailItem` / `item` / 字幕；
- 新配乐 `studio/public/audio/v2/preview-mix-guizang.mp3`：由 `make_sfx_v2.py` 按 `data/guizang-timeline.ts` 的 61 个 `SOUND_EVENTS` 生成（30s，music-bed-30.wav）；
- 修复：proof 场景第 4 个数字没有配色（数组越界显示为黑色）；片尾说明行的 DSH 版本改为读取 `plugin.dshRange`；
- 修复：`studio/src/v2/data/case-timeline.ts` 缺逗号导致 `tsc` 失败；删除 `CaseFeatureScenes` 对不存在导出的引用；
- 工程：新增 `npm run typecheck` / `npm run check`、GitHub Actions CI（语法检查 + tsc + `npm pack --dry-run`）、`studio/pnpm-lock.yaml`；`.gitignore` 补 Python 缓存等；
- 影片：`ReelCase` / `ReelCase30` 的场景时间与转场改为从 `data/case-timeline.ts`、`data/case30-timeline.ts` 读取；`S2Hatch` 支持 `termTitle`，修复 dsh-reel 品牌片 S2 误显示 Better Sidebar 的问题；
- 重构：抽出共享剪辑壳 `studio/src/v2/kit/film.tsx`（Sequence/overlap/fade/CutFlash/顶线 + `makeReel`），6 个 composition 共用；`entry.tsx` 的时长改为从各 timeline 的 `TOTAL_FRAMES` 读取，不再写死 900/450；删除 `Chrome.tsx` 里未使用的 `SceneFade`；
- CLI：`scripts/reel.mjs` 支持 `--out`、`--help`，参数缺失不再吞掉下一个 flag；非 ASCII 插件名用稳定哈希兜底 slug；坏 case / 缺失文件给出可读错误。

## 0.2.1 — 2026-11-05

- 安装/使用海报改用官方 DSH logo，去掉旧版手绘/体素鲸鱼；
- 标题改为「给插件，拍一条片。」；
- 新增 550C 开机片 Remotion 示例：`studio/src/boot550c/`；
- README 主海报指向新安装海报。

## 0.2.0 — 2026-11-04

- 新增 V0.1「真机界面宣传片」方法文档：`docs/promo-method-v0.1.md`；
- 新增 Better Sidebar 案例拆解：`docs/case-better-sidebar-v0.1.md`；
- 新增 28s 成片与片尾帧：`docs/better-sidebar-v0.1.mp4`、`docs/better-sidebar-endcard.png`；
- 新增 Onetake comp 参考：`promo/comp-better-sidebar.html`；
- README 增加 V0.1 管线入口；
- 新增交流群二维码 `docs/wechat-group.png` 与 README 扫码入口；
- 明确 Onetake 为 PolyForm Noncommercial，不是商用授权，商用需另行授权；
- npm 包精简为运行时代码 + 方法/案例文档（0.2.0 已发布）。

## 0.1.1

- 早期 Remotion v2 campaign 与 v1 case 模板。
