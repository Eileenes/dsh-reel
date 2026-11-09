# V0.1 插件宣传片标准流程（按插件名出片）

> 用途：用户给一个 DSH 插件（包名 / 仓库 / 或只说插件名），产出一条 **28 秒真机宣传片**。
> 这条片走 **V0.1 真机管线**：Onetake comp（Three.js 舞台 + canvas UI）+ 外部渲染 + 本地混音。
> 参考片血缘：Better Sidebar（`promo/comp-better-sidebar.html`）→ Game Studio → Guizang Design（`comp-guizang.html`）。
>
> **不要再拿 `reel_render` 的 v1 模板或 v2 campaign 去近似这条片**——它们是另外两条产线，结构不同（v1 是 32.5s Hook/Problem/Fix 模板，v2 是 24s 品牌片）。

## 0. 固定结构（28.0s / 840 帧 / 1920×1080 / 30fps）

| 时间 | 画面 |
| --- | --- |
| 0–3s | 终端输入 `dsh` |
| 3–5s | 体素鲸鱼拼合 + 喷水 |
| 5–9s | 鲸鱼依次跳 文件 → Git → DSH 图标 → 进入 DSH 窗口 |
| 9–12s | DSH 主界面 → 鲸鱼跳到「插件」→ 插件页展开 |
| 12–15s | 插件页搜索 `<包名>` → 结果卡 → 安装 → 蓝色进度 → 已安装 |
| 15.4–26s | 四个功能页：顶部 4 个 tab + 全屏截图 + 底部字幕 |
| 26–28s | 片尾：`DSH PLUGIN · <KICKER>` + 名称 + 包名 + 一句话 + 安装命令 + 许可·仓库，鲸鱼右上角 |

## 1. 每次开始前先收数据

```bash
# 1) npm 元数据（名称 / 版本 / 作者 / 描述 / 许可 / 仓库）
npm view <包名> name version description license repository.url author --json

# 2) 拿仓库里的 README / gallery / 截图
npm pack <包名> --pack-destination /tmp/<slug>-pkg
mkdir -p /tmp/<slug>-pkg && tar -xzf /tmp/<slug>-pkg/<包名>-*.tgz -C /tmp/<slug>-pkg
```

从 tarball / 仓库 README 里确定：

- 插件名（片尾大字）、包名（搜索词 + @handle 行）、作者、版本、分类（如「主题与外观」）
- 一句话简介（片尾 tagline 与结果卡描述，≤ ~45 字宽）
- **4 个功能点**：tab 名（≤ 6 字）+ 一句字幕（≤ ~38 字宽）+ 一张真实截图
- 安装命令：`dsh plugin --profile web add <包名>`
- 许可 + 仓库：`<LICENSE> · github.com/<owner>/<repo>`（**必须真实，别抄参考片的 MIT**）

功能截图要求：16:10 或宽幅，宽 ≥ 1440px；优先插件真实输出/页面截图。宽幅图会被 comp 上下留边（参考片也这样），可接受。

## 2. 写案例 JSON：`cases/v01/<slug>.json`

字段见已跑通示例 [cases/v01/dsh-guizang-design.json](../cases/v01/dsh-guizang-design.json)：

```jsonc
{
  "slug": "guizang-design",                    // 输出文件前缀（英文/连字符）
  "plugin": {
    "query": "dsh-guizang-design",             // 搜索框里打的字
    "cardTitle": "dsh-guizang-design",         // 结果卡标题
    "cardMeta": "op7418 · 0.1.4 · 主题与外观",  // 结果卡第二行
    "cardDesc": "把……",                        // 结果卡描述
    "kicker": "DSH PLUGIN · GUIZANG DESIGN",   // 片尾 kicker
    "name": "歸藏设计",                        // 片尾大字
    "handle": "op7418/dsh-guizang-design",     // 片尾 @handle 行
    "tagline": "把……",                         // 片尾一句话
    "install": "dsh plugin --profile web add dsh-guizang-design",
    "licenseLine": "AGPL-3.0 · github.com/op7418/dsh-guizang-design",
    "termTitle": "guizang-design — zsh — 120×32",
    "termFooter": "🐋  dsh-guizang-design · promo"
  },
  "features": [                                 // 必须 4 条
    {"tab": "网页 PPT", "caption": "网页 PPT：横向翻页，杂志风 / 瑞士风", "image": "studio/public/shots/guizang/ppt-magazine.jpg"},
    {"tab": "图文卡片", "caption": "……", "image": "..."},
    {"tab": "网页排版", "caption": "……", "image": "..."},
    {"tab": "去 AI 味", "caption": "……", "image": "..."}
  ]
}
```

图片路径相对仓库根目录。

## 3. 一条命令生成 comp / 素材 / 音效时间轴

```bash
# 两种写法等价
node tools/v01-film/make-v01-film.mjs cases/v01/<slug>.json \
  --workdir .research/onetake-promo --run-audio
npm run v01:film -- cases/v01/<slug>.json --workdir .research/onetake-promo --run-audio
```

生成（都在 `--workdir` 内）：

- `comp-<slug>.html` —— 本案例的 comp（模板 `tools/v01-film/comp-template.html` + 本案例文案）
- `config-case.js` —— 终端标题/页脚等 CFG
- `feat1.js … feat4.js` —— 四张功能页（data URL）
- 仓库内 `studio/src/v2/data/v01-<slug>-timeline.ts` —— 61 个音效事件
- `studio/out/<slug>-v01-mix.wav` + `studio/public/audio/v2/preview-mix-<slug>-v01.mp3`（`--run-audio`）

> workdir 必须包含 Onetake comp 依赖（`three.bundle.js`、`motion.js`、`assets.js`、`config.js`、`dshwin.js`、`dshpage.js`、`dshicon.js`、`p550*.js` 等）。仓库里就是 `.research/onetake-promo`。

## 4. 渲染（Onetake，约 9–12 分钟）

```bash
cd .research/onetake-promo
ONETAKE_PY="${ONETAKE_PY:-$HOME/Downloads/travel-capsule/outputs/soren-xiaohongshu-film/.venv/bin/python}"
"$ONETAKE_PY" onetake/scripts/render.py comp-<slug>.html \
  --out promo-<slug>-intro-1080.mp4 \
  --width 1920 --height 1080 --fps 30 --workers 4 --shutter 180
```

结束时确认日志：`840 frames ... page errors: none`。

## 5. 混流 + 封面

```bash
ffmpeg -y -i .research/onetake-promo/promo-<slug>-intro-1080.mp4 -i studio/out/<slug>-v01-mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -movflags +faststart -t 28 \
  studio/out/promo-<slug>-intro-1080.mp4

ffmpeg -y -ss 16.5 -i studio/out/promo-<slug>-intro-1080.mp4 -frames:v 1 \
  studio/out/promo-<slug>-intro-poster.png
```

## 6. QA（必须做）

抽帧：

```bash
for t in 4.0 9.5 11.6 13.7 14.5 16.5 19.8 22.9 25.5 27.3; do
  ffmpeg -y -loglevel error -ss $t -i studio/out/promo-<slug>-intro-1080.mp4 -frames:v 1 /tmp/qa-$t.png
done
```

| 时间 | 必检 |
| --- | --- |
| 4.0 | Dock 三跳（文件/Git/DSH 图标）+ 鲸鱼在跳 |
| 9.5 | DSH 插件页（同一窗口壳，左侧栏在） |
| 11.6 | 搜索框里正在打插件名 |
| 13.7 | 结果卡：标题 / 作者·版本·分类 / 安装按钮 |
| 14.5 | **蓝色进度条** + 安装中 |
| 16.5 / 19.8 / 22.9 / 25.5 | 四个功能页，tab 高亮顺序正确、字幕对得上、截图真实 |
| 27.3 | 片尾六项齐全（kicker/名称/包名/一句话/安装命令/许可·仓库） |

验收清单：

- [ ] `1920×1080 / 30fps / 28.0s / H.264 + AAC 48k 立体声`
- [ ] 鲸鱼开场、Dock、插件页、搜索、安装、进度、已安装全部在
- [ ] 无残留占位符（`__*__`）、无其他插件文案、许可信息真实
- [ ] 四个 tab 与四张截图一一对应
- [ ] 音频有声、打字/点击/安装卡点对得上

## 7. 交付

- `studio/out/promo-<slug>-intro-1080.mp4`
- `studio/out/promo-<slug>-intro-poster.png`
- 备份：`.research/dsh-reel-promo/case/promo-<slug>-intro-1080.mp4`
- 可选：`docs/case-<slug>-v0.1.md` 记录数据来源与改动

## 8. 许可

- Onetake 是 **PolyForm Noncommercial**：本管线/产物仅用于 DSH 插件宣传素材；商用需另行取得 Onetake 授权。
- 目标插件许可按实际写（AGPL-3.0 / MIT / …），不要照抄别的案例。
- 插件截图、字体、音乐版权按来源确认。

## 9. 常见坑

- 搜索词长度变化：生成器会按 `(12.55-10.6)/query.length` 重算打字间隔，保证在结果卡出现前打完。
- 片尾名称过长：生成器自动缩小字号；`cardDesc` / `tagline` / 字幕过长会告警，需手动缩短文案。
- 宽幅功能图会上下留边：这是 comp 的 `fit` 行为，和参考片一致；要满屏就换 16:10 截图。
- 渲染依赖本机 Onetake 运行时（不在仓库内分发），换机器先确认 `ONETAKE_PY`。
