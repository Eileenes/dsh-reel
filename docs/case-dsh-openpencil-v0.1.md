# dsh-openpencil · V0.1 宣传片案例记录

> 管线：[`docs/v01-film-sop.md`](v01-film-sop.md) · 案例：[`cases/v01/dsh-openpencil.json`](../cases/v01/dsh-openpencil.json)
> 产物：`studio/out/promo-openpencil-intro-1080.mp4`（28.0s / 1920×1080 / 30fps / H.264 + AAC）

## 1. 数据来源（均在 2026-11-11 实测）

| 项 | 值 | 来源 |
| --- | --- | --- |
| 包名 | `@zseven-w/dsh-openpencil` | `npm view` |
| 版本 | `0.1.0-rc.15`（published 2026-11-10） | `npm view … dist-tags.latest / time` |
| 许可 | MIT | `package.json` / tarball `LICENSE` |
| 仓库 | `github.com/ZSeven-W/dsh-openpencil` | `package.json` `repository.url` |
| 维护者 | zseven-w（npm maintainers: kayshen / finiking） | `npm view … maintainers` |
| 一句话 | 在对话里预览、检查并编辑真实 `.op` 设计文档 | `package.json` description |
| 安装 | `dsh plugin --profile web add @zseven-w/dsh-openpencil@latest` | `README.zh.md` §安装到 DSH |
| 分类 | 设计画布 | 结果卡 meta 行（自拟，非官方分类字段） |

确认磁盘上的已安装版本与 npm `latest` 一致（`~/.dsh/profiles/desktop/local/dsh-openpencil` 为 `0.1.0-rc.15`），
渲染/编辑器运行时取自平台包 `@zseven-w/dsh-openpencil-darwin-arm64`（含 `op-host-web-server` 与 `web-bundle`）。

## 2. 四个功能点 ↔ 四张真实截图

| # | tab | 截图 | 来源 |
| --- | --- | --- | --- |
| 1 | 多帧预览 | `studio/public/shots/openpencil/feature-preview.png` | 插件随包文档截图 `docs/images/dsh-openpencil-overview.png`（3600×1914）左半区裁切，x 100–2646 / y 150–1741 |
| 2 | 画布总览 | `studio/public/shots/openpencil/feature-canvas.png` | 用插件真实的 `lib/viewer-assets/`（`sdk.js` + `op_web_sdk_bg.wasm` + canvaskit）在无头 Chrome 挂载只读 SDK，载入随包场景模板 `photo-composition-tutorial.op`（5 个 1080×1440 画板） |
| 3 | 托管编辑器 | `studio/public/shots/openpencil/feature-editor.png` | 平台包真实运行时 `op-host-web-server --serve-web --port 8767 --file edit-fashion-home.op`，84% 缩放 + 选中 Status Bar 图层 |
| 4 | 图层属性 | `studio/public/shots/openpencil/feature-inspector.png` | 同一运行时与文档，100% 缩放并选中文本图层「品牌」，属性面板为 排版/填充 |

- 全部 4 张 16:10、宽 ≥ 1440（3 张 3200×2000 @DSF2，1 张 2546×1591 裁切）。
- 逐图来源与裁切坐标见 `studio/public/shots/openpencil/SOURCES.md`。
- 无人为绘制像素、无 mock UI；只有第 1 张是既有截图的裁切，其余三张为本机新截。

第 2 张是只读 Web SDK 自身画布（该 SDK 不自带 chrome），因此 tab 写「画布总览」而不是「交互画布」——
描述画布内容而非不可见的控件，避免字幕与画面不符。

## 3. 生成链路

```bash
node tools/v01-film/make-v01-film.mjs cases/v01/dsh-openpencil.json \
  --workdir .research/onetake-promo --run-audio
```

产出（`.research/onetake-promo/`）：`comp-openpencil.html`、`config-case.js`、`feat1–4.js`；
仓库内：`studio/src/v2/data/v01-openpencil-timeline.ts`（67 个音效事件）、
`studio/out/openpencil-v01-mix.wav`、`studio/public/audio/v2/preview-mix-openpencil-v01.mp3`。

本片先用 Onetake 出过一次（`studio/out/promo-openpencil-intro-1080.mp4`），
之后用仓库自带的 `tools/v01-film/render-frames.mjs` 复现：
`studio/out/promo-openpencil-intro-1080.offline.mp4`（一条命令含混流）。

```bash
# 仓库自带渲染器（不需要 Onetake）
node tools/v01-film/render-frames.mjs .research/onetake-promo/comp-openpencil.html \
  --out studio/out/promo-openpencil-intro-1080.offline.mp4 \
  --sfx studio/out/openpencil-v01-mix.wav \
  --width 1920 --height 1080 --fps 30 --workers 4 --shutter 180
```

两条片子的对齐结果：840 帧 / 4162 vs 4168 次采样 / 294s vs 410s（4 workers）/
整片 PSNR 40.2 dB、SSIM 0.9946；差异集中在字形抗锯齿与二次压缩，肉眼不可见。
若确实要用 Onetake（闭源、PolyForm Noncommercial，不随仓库分发），命令见 `docs/v01-film-sop.md` §4 折叠段。

## 4. 与参考片的差异

- 文案全部按本插件实测信息重写，没有沿用参考片的 MIT/作者/描述。
- 搜索词为 24 字符的 scoped 包名，生成器已按 `(12.55-10.6)/query.length` 重算打字节奏，结果卡前打完。
- 四张功能图均为 16:10，comp 内上下留边极小（参考片为宽幅图留边）。

## 5. 许可

- 本片由 Onetake 渲染（**PolyForm Noncommercial**）：仅用于 DSH 插件宣传素材，商用需另取 Onetake 授权。
- 目标插件为 MIT。
- 截图内容版权归 OpenPencil / 插件作者；样例 `.op` 文档为作者随包模板与本机自建设计。
