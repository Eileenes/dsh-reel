# 案例 · dsh-guizang-design V0.1 真机宣传片（28s）

> 本案例已纳入标准流程：[docs/v01-film-sop.md](v01-film-sop.md)；生成器 `tools/v01-film/make-v01-film.mjs`，案例数据 `cases/v01/dsh-guizang-design.json`。

## 成片

- `studio/out/promo-guizang-intro-1080.mp4`（1920×1080 / 30fps / 28.0s / H.264 + AAC）
- 封面：`studio/out/promo-guizang-intro-poster.png`
- 备份：`.research/dsh-reel-promo/case/promo-guizang-intro-1080.mp4`

## 结构（与参考片同帧表）

| 时间 | 内容 |
| --- | --- |
| 0–3s | 终端输入 `dsh` |
| 3–5s | 体素鲸鱼拼合 + 喷水 |
| 5–9s | 鲸鱼依次跳 文件 → Git → DSH 图标 → 进入 DSH 窗口 |
| 9–12s | DSH 主界面 → 跳到「插件」→ 插件页展开 |
| 12–15s | 搜索 `dsh-guizang-design` → 结果卡 → 安装 → 蓝色进度 → 已安装 |
| 15.4–26s | 网页 PPT / 图文卡片 / 网页排版 / 去 AI 味（顶部 tab + 全屏截图 + 底部字幕） |
| 26–28s | 片尾：`DSH PLUGIN · GUIZANG DESIGN` + 歸藏设计 + `op7418/dsh-guizang-design` + 安装命令 + `AGPL-3.0 · 仓库` |

## 数据来源

- npm：`dsh-guizang-design@0.1.4`，author `op7418`，license `AGPL-3.0-only`
- 仓库：`github.com/op7418/dsh-guizang-design`
- 功能图：插件官方输出截图（`studio/public/shots/guizang/`）

## 复现

```bash
node tools/v01-film/make-v01-film.mjs cases/v01/dsh-guizang-design.json \
  --workdir .research/onetake-promo --run-audio
```

之后按 SOP 第 4–6 步渲染、混流、QA。音效时间轴由生成器写到 `studio/src/v2/data/v01-guizang-design-timeline.ts`（61 个事件）。
