# 案例 · dsh-whale-widget V0.1 真机宣传片（28s）

> 走标准 V0.1 真机管线（[docs/v01-film-sop.md](v01-film-sop.md)），案例数据 `cases/v01/dsh-whale-widget.json`。

## 成片

- `studio/out/promo-whale-widget-intro-1080.mp4`（1920×1080 / 30fps / 28.0s / H.264 + AAC）
- 封面：`studio/out/promo-whale-widget-intro-poster.png`
- 备份：`.research/dsh-reel-promo/case/promo-whale-widget-intro-1080.mp4`

## 插件数据

| 项 | 值 |
| --- | --- |
| 包名 / 版本 | `dsh-whale-widget` / `0.4.2` |
| 仓库 | `github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget` |
| 许可 | MIT |
| 分类 | UI 增强（右下角常驻挂件） |
| 安装 | `dsh plugin --profile web add dsh-whale-widget` |
| 一句话 | 常驻 DSH 右下角的小鲸鱼：余额、今日已用、峰谷与自定义泡泡。 |

## 四个功能页（tab + 字幕）

| tab | 字幕 | 截图内容 |
| --- | --- | --- |
| 余额记账 | 点一下小鲸鱼：余额、今日已用、峰谷一屏看完 | 点击挂件后的余额泡泡 |
| 自定义泡泡 | 点击序列、A/B 加权、模块排版与逐行样式都能改 | 「自定义泡泡」编辑窗口 |
| 音效提示 | 按压音、每轮消耗、提问与授权提示分开设置 | 「提示与音效设置」窗口 |
| 用量记录 | 不用令牌：余额观测记账，近 7 天与逐条明细 | 「小鲸鱼记账」面板 |

## 截图来源（重要）

这个插件仓库里只有一张 hero 图，没有 4 张功能截图。为了不编造界面，用
[`tools/v01-film/widget-shots/`](../tools/v01-film/widget-shots/) 搭了一个 mock DSH 页面：
真实 DSH 聊天界面截图作背景、保留 `data-composer-input` 让挂件通过挂载检测、
用本地 HTTP server 桩出 `/dsh-whale/*` 接口（余额/设置等），再用 puppeteer-core
把插件**自己的客户端 bundle** 跑起来，截默认态、泡泡、菜单、各设置面板。

- 界面是插件真实渲染的 UI；余额数字是桩数据（`¥86.42 / 今日 ¥12.36`），不是任何真实账户。
- 截图裁剪到相关区域后作为 4 张功能图，存放在 `studio/public/shots/whale-widget/`。

## 复现

```bash
# 1) 生成 comp + 素材 + 音效时间轴
npm run v01:film -- cases/v01/dsh-whale-widget.json --workdir .research/onetake-promo --run-audio

# 2) 渲染（Onetake，约 9–12 分钟）
cd .research/onetake-promo
"$ONETAKE_PY" onetake/scripts/render.py comp-whale-widget.html \
  --out promo-whale-widget-intro-1080.mp4 --width 1920 --height 1080 --fps 30 --workers 4 --shutter 180

# 3) 混流 + 封面（见 SOP 第 5 步）
```

## 注意

- 功能截图来自插件真实 UI，但仍属于第三方插件素材，**不随仓库提交**（与 guizang 案例同样的处理）。
- Onetake 是 PolyForm Noncommercial：本片仅用于 DSH 插件宣传素材。
