# Changelog

## Unreleased

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
