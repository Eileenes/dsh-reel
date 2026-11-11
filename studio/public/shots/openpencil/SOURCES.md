# OpenPencil promo shots — sources

All four images are real captures of the shipped `@zseven-w/dsh-openpencil` UI. Nothing is a mock-up,
and no pixel was painted by hand. Only `feature-preview.png` is a crop of an existing screenshot; the
other three are fresh headless-Chrome captures made for this film.

Common capture setup for files 2–4: headless Google Chrome 157.0.8103.39 (puppeteer-core, `puppeteer-core` from
`~/.dsh/profiles/desktop/node_modules`), viewport **1600 × 1000 CSS px at deviceScaleFactor 2**,
output **3200 × 2000 PNG**, no browser chrome (page screenshot only), no cursor overlay.
UI fonts render from the app's own bundled assets; system UI in the editor is the binary's own.

---

## feature-preview.png — 2546 × 1591

- **Source**: `/tmp/owl-pkg/package/docs/images/dsh-openpencil-overview.png` (author's genuine DSH
  screenshot shipped in the npm package, 3600 × 1914), crop region **x 100–2646, y 150–1741**.
  No rescale, no retouch; PNG re-encode only (`optimize=True`).
- **What it shows**: the DSH chat side of the product — the OpenPencil preview card `2 / 4 · Search`
  with its exact-PNG first frame, the 4-thumbnail strip, the selection dock
  ("Music Home · frame · 375 × 1361 · n171 · OpenPencil 修改目标"), the composer edge, and (right third)
  the live managed editor with the same document's Music Home and Search frames.
- **Caveat**: this is a crop of the author's screenshot, not a fresh capture; the aspect is 16:10 by
  construction (2546 / 1591 = 1.600) but the region was chosen to include the whole card, so the
  DSH window's own title bar (top ~150 px of the original) is not in frame.

## feature-canvas.png — 3200 × 2000

- **Source**: the plugin's real read-only Web SDK
  `/tmp/owl-pkg/package/lib/viewer-assets/` (`sdk.js` + `op_web_sdk_bg.wasm` + `canvaskit/`,
  served byte-for-byte from a 127.0.0.1 static server), mounting `createViewer({canvas, …})` on a
  1600 × 1000 canvas at DPR 2, `viewer.zoomToFit(1600, 1000)` and then a single
  `panTo(panX, panY + 180)` so the artboard block sits in the upper canvas rather than hugging the
  top edge of the window.
  Document: the **shipped** template
  `web-bundle/assets/scene_templates/photo-composition-tutorial.op` ("手机摄影构图教学 · 3:4 五帧",
  5 top-level frames, 1080 × 1440 each) — a real `.op` file from the plugin package.
- **What it shows**: the interactive canvas as the plugin mounts it — a 5-frame real `.op` document
  (3 + 2 contact sheet; the lower row is partly outside the viewport, as on any canvas) on the SDK's
  #18181b canvas, rendered by the SDK's own CanvasKit pipeline.
  The SDK ships no chrome of its own, so there is no pan/zoom widget in this view (the wheel/zoom API
  is live in the page; nothing is drawn for it).

## feature-editor.png — 3200 × 2000

- **Source**: fresh capture of `op-host-web-server --serve-web --port 8767 --file /tmp/fashion.op`
  (the managed-editor runtime shipped in
  `@zseven-w/dsh-openpencil-darwin-arm64/bin/`), headless Chrome 1600 × 1000 @ 2x.
  Document: `/Users/huayang.sun/Downloads/travel-capsule/designs/edit-fashion/edit-fashion-home.op`
  (real user design: ÉDIT 衣序 · 服装购物首页, 393 × 1246). State driven by real mouse input:
  zoomed to 84 % with the zoom pill, then the "Status Bar" layer clicked in the layers rail.
- **What it shows**: the managed editor workbench — layers rail with the document tree
  (Status Bar expanded: Time, Levels, Cellular, WiFi, Battery, Border, Cap, Capacity), the canvas with
  the fashion home page at 84 % and a live selection box ("393 × 62"), and the properties panel
  (设计 / 代码 tabs, 位置, 弹性布局, 尺寸, 图层, 填充, 描边, 效果, 交互, 导出).

## feature-inspector.png — 3200 × 2000

- **Source**: same runtime, same document, separate fresh capture; default 100 % zoom, then the
  text layer **"品牌"** clicked in the layers rail at (150, 553) CSS.
- **What it shows**: the property inspector in focus — selected text layer `品牌` (W 77 / H 36) with the
  typography block open: 排版, font **Bodoni 72**, 常规, S **32**, 行高 110 %, 字间距 0.60, horizontal /
  vertical alignment buttons, fill **#292823**, 效果 — while the canvas shows the page at 100 %
  (hero image, "穿上，自在的秋天", category chips, product grid) with the text's bounding box.
  Different zoom, different selected layer and a different panel section than `feature-editor.png`.

---

### Caveats for the cut

- `feature-preview.png` is a 16:10 crop of the author's screenshot (see above); the other three are
  fresh captures from this machine.
- The editor's top-centre document title reads **未命名** ("untitled") — that is genuine app state for a
  file opened through `--file` (the shell shows its own label rather than the document name). If that
  word would distract on screen, crop the top ~55 CSS px or keep the page motion low.
- The managed editor draws its own floating prompt bar ("用 Agent 设计 … 未连接模型", with page dots at
  the bottom centre) over the canvas; it is real shipped UI, but it overlaps the lower edge of the
  design in both editor shots.
- `feature-canvas.png` is the bare SDK surface: full-bleed canvas, no panels — that is what the
  read-only viewer actually mounts, and it reads best if the film treats it as a canvas close-up
  rather than as a windowed app.
