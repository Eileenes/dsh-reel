# tools/v01-film — V0.1 插件宣传片生成器

把一条案例 JSON 生成成可渲染的 comp（+ 素材 + 音效时间轴），再用**仓库自带的渲染器**出片。

```bash
# 1) 案例 JSON → comp / feat1-4 / config-case / 音效时间轴 / 混音
node tools/v01-film/make-v01-film.mjs cases/v01/<slug>.json \
  --workdir .research/onetake-promo --run-audio

# 2) comp → 成片（含运动模糊与音频混流，不需要 Onetake）
node tools/v01-film/render-frames.mjs .research/onetake-promo/comp-<slug>.html \
  --out studio/out/promo-<slug>-intro-1080.mp4 \
  --sfx studio/out/<slug>-v01-mix.wav \
  --width 1920 --height 1080 --fps 30 --workers 4 --shutter 180
```

- 模板：`comp-template.html`（28s 固定帧表：终端 → 鲸鱼 → Dock 三跳 → 插件页搜索/安装 → 四个功能页 → 片尾）
- 案例：`cases/v01/dsh-guizang-design.json`、`cases/v01/dsh-openpencil.json`
- 完整流程与 QA：`docs/v01-film-sop.md`
- `widget-shots/`：界面类插件没有现成截图时，用 mock 宿主把插件自己的客户端跑起来截图

## render-frames.mjs

替代 Onetake 的渲染器（Onetake 是闭源、PolyForm Noncommercial，不随仓库分发）。

做的事和参考实现一样：

1. 打开 comp，等 `window.__ready`，从 `window.__meta.dur` 取时长；
2. 每帧 `window.__seek(t)` 后截图；快门区间 `[t−open/2, t+open/2]` 内按 `window.__motion(t0,t1)`
   决定采样张数（默认 6 px 间距、4–48 张），首末两张相同就判定静止帧直接复用；
3. 多张采样在**线性光**下平均（`sRGB → linear → 平均 → sRGB`），并做硬切保护：
   相邻采样若某一步变化 ≥3 倍于其他步，只积分该帧时间所在的一侧，切点保持硬的；
4. `ffmpeg` 编码 H.264 High / yuv420p / `+faststart`，给了 `--sfx` 就同时 AAC 256k 混流；
5. 写 `<out>.render.json`（帧数、采样分布、硬切数、耗时）。

依赖只有 `node ≥ 18`、Chrome、`ffmpeg`、`puppeteer-core`：

```bash
NODE_PATH=~/.dsh/profiles/desktop/node_modules node tools/v01-film/render-frames.mjs ...
# 或 --puppeteer /path/to/puppeteer-core，或 --chrome /path/to/chromium
```

常用参数：`--from/--to`（只渲一段帧试片）、`--shutter 0`（关掉运动模糊）、`--scale 2`（4K）、
`--workers`、`--crf`、`--keep-frames`、`--gpu`。PNG 解码/编码、线性光积分都在文件内实现，无额外 npm 依赖。

与本机 Onetake 输出对帧：同一条 comp 帧数、每帧采样数、硬切判定完全一致，画面差异只在字形抗锯齿
（SSIM ≈ 0.99）；`--chrome` 指向 Onetake 那个 Chromium 可以进一步逼近。
