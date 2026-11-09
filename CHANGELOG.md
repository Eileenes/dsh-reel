# Changelog

## Unreleased

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
