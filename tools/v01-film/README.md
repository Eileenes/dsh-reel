# tools/v01-film — V0.1 插件宣传片生成器

把一条案例 JSON 生成成可渲染的 Onetake comp（+ 素材 + 音效时间轴）。

```bash
node tools/v01-film/make-v01-film.mjs cases/v01/<slug>.json \
  --workdir .research/onetake-promo --run-audio
```

- 模板：`comp-template.html`（28s 固定帧表：终端 → 鲸鱼 → Dock 三跳 → 插件页搜索/安装 → 四个功能页 → 片尾）
- 案例：`cases/v01/dsh-guizang-design.json`
- 完整流程与 QA：`docs/v01-film-sop.md`
- Onetake 是 PolyForm Noncommercial，产物只用于 DSH 插件宣传素材。
