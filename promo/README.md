# V0.1 宣传片 comp（Better Sidebar）

`comp-better-sidebar.html` 是 v0.1 成片使用的 Onetake composition 源文件，保留作参考/二次修改。

## 依赖

- Onetake 渲染器（`motion.js`、`three.bundle.js`、`comp.html` 等）；
- Onetake 是 **PolyForm Noncommercial** 许可，不在本仓库内分发；商用需另行授权；
- comp 里引用的图片以 `data:image/png;base64` 形式注入（`dshwin.js`、`dshpage.js`、Better Sidebar 截图等），这些素材文件未随仓库提供，需按 `docs/promo-method-v0.1.md` 的素材规范自行准备。

## 使用

1. 在 Onetake 的 `onetake/` 目录旁放置本 comp 与素材 JS；
2. 用 Onetake 的 `stills.py` / `render.py` 渲染；
3. 1080p、30fps、shutter 180°，4 workers；
4. 音频按 `docs/promo-method-v0.1.md` §1.8 重新生成并 mux。

## 说明

- 本 comp 是项目自己的分镜/动画代码；Better Sidebar 截图来自 MIT 仓库，DSH 界面来自本项目 clean UI；
- 商用前请同时确认 Onetake 许可、截图/字体/音乐许可。
