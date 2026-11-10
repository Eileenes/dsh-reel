# widget-shots — 给「界面类/挂件类」插件截真实 UI 图

当插件仓库里没有 4 张可直接用的功能截图时，用这套 mock 环境把插件自己的客户端脚本跑起来，截出真实界面：

1. 解包插件：`npm pack <包名>` → `tar -xzf`，得到 `package/assets/` 里的客户端 bundle、图片和音频；
2. 按插件的宿主接口改 `server.py` 里的 `MAP`（静态资源）和 `DATA`（`/dsh-whale/*` 之类的接口桩）；
3. `WHALE_PKG=/tmp/<pkg>/package python3 tools/v01-film/widget-shots/server.py 8767`
4. `NODE_PATH=~/.dsh/profiles/desktop/node_modules OUT=/tmp/whale-shots3 node tools/v01-film/widget-shots/capture.cjs`
5. 把 `raw-*.png` 裁到相关区域（保留页面上下文），存成 4 张功能图，填进 `cases/v01/<slug>.json`。

> 这个目录里的脚本是按 `dsh-whale-widget` 的接口写的示例（`/dsh-whale/*`、`.dshwv-*` DOM）。
> 换插件时改 `server.py` 的接口和 `capture.cjs` 里的选择器/菜单文案即可。
