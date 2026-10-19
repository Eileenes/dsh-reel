# dsh-reel-studio

**Turn a DeepSeek Harness (DSH) plugin repo into a 16:9 promo video and a 3:4 promo image — locally, with Remotion.**

Package: `dsh-reel-studio` · Repo: `Eileenes/dsh-reel`  
English · [简体中文](README.zh-CN.md)

> Status: working prototype. The Remotion pipeline and both outputs are tested end-to-end. The DSH host package (`dsh.bundle`) is scaffolded, but has **not yet been loaded into a real DSH profile**.

## Demo

- [Watch the 32.5s promo video](docs/demo.mp4)
- [Promo image (2160×2880 PNG)](docs/promo.png)
- [Video poster](docs/poster.png)

![Better Sidebar promo image](docs/promo.png)

The demo targets [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) (MIT). It is an unofficial sample used to test the *repo → promo material* workflow. Screenshots are from that public repo; task/side-chat visuals are synthetic mocks.

## What it makes

### Promo video

- 32.5s / 1920×1080 / 30fps / H.264 + AAC stereo.
- Seven scenes: hook → problem → solution → four features → how to use → proof/install/address → outro.
- Cut to a 120 BPM generated soundtrack; scene cuts and card entrances land on half-beats.
- Real DSH screenshots + DSH-style wordmark / palette / cartoon whale mascot.
- Covers: what it is, what it solves, how to use it, install command, repo address, numbers.

### Promo image

- 1080×1440 layout, rendered at 2× = 2160×2880 PNG.
- DSH visual language: `deepseek HARNESS` wordmark, DSH blue/mint, grid, real DSH screenshots, cartoon whale with speech bubble.
- Information blocks: what it is / what it solves / how to use / install command / address / stats.
- No private data: task and side-chat panels are synthetic mocks, not captured conversations.

## Requirements

- Node.js 22+
- pnpm
- Chrome or Chromium (Remotion renders with it). Set `CHROME_PATH` if it is not in a standard location.
- Python 3 only if you want to regenerate the BGM.

## Quick start

```sh
git clone https://github.com/Eileenes/dsh-reel.git
cd dsh-reel/studio
pnpm install
cd ..

# optional; the CLI also checks common macOS/Windows/Linux paths
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# video + poster + promo image
node scripts/reel.mjs --case cases/dsh-better-sidebar.json --mode both

# only one output
node scripts/reel.mjs --case cases/dsh-better-sidebar.json --mode video
node scripts/reel.mjs --case cases/dsh-better-sidebar.json --mode image
```

Outputs go to `studio/out/`:

- `<slug>-demo.mp4`
- `<slug>-poster.png`
- `<slug>-promo.png` (2×)

Options: `--poster-frame 825`, `--dry-run` (write props only).

## Case format

A case is one JSON file. It is deliberately explicit so a human or an agent can review every claim before rendering.

```json
{
  "plugin": {
    "name": "Better Sidebar",
    "handle": "dsh-better-sidebar",
    "version": "0.28.0",
    "repo": "github.com/omdsh-dev/DSH-better-sidebar",
    "install": "dsh plugin --profile web add dsh-better-sidebar",
    "downloads": 46445,
    "stars": 4297,
    "tagline": "一个侧边栏，装下整个开发工作台"
  },
  "features": [
    {"no": "01", "title": "File tree + editor", "desc": "...", "img": "shots/files-tree.png", "accent": "#4d6bfe"},
    {"no": "02", "title": "Git", "desc": "...", "img": "shots/changes-tree.png", "accent": "#5ef2c2"},
    {"no": "03", "title": "Tasks", "desc": "...", "mock": "tasks", "accent": "#ffb86b"},
    {"no": "04", "title": "Side chat", "desc": "...", "mock": "sidechat", "accent": "#8ea6ff"}
  ],
  "promo": {
    "problem": "One session, five surfaces, half a screen.",
    "what": "Native right sidebar + a bottom workbench.",
    "how": ["Install", "Open the right sidebar", "Use the tabs"],
    "address": "github.com/omdsh-dev/DSH-better-sidebar"
  }
}
```

Images are resolved from `studio/public/`. Use your own clean screenshots or the built-in synthetic mocks.

## Use as a DSH plugin

The repo includes a host-side plugin package:

- `reel_scan` — read a local plugin package/README/screenshot directory.
- `reel_plan` — turn a brief into a deterministic storyboard.
- `reel_render` — render `mode=video|image|both` locally.

Install into a scratch profile (not yet validated against a real DSH build). Once published to npm:

```sh
dsh plugin --profile scratch add dsh-reel-studio
```

Until then, install straight from GitHub:

```sh
dsh plugin --profile scratch add github:Eileenes/dsh-reel
```

## Limitations / roadmap

- The case is authored by hand for now; `reel_scan`/`reel_plan` automation is next.
- Only 16:9 video and 3:4 image; 9:16 vertical and 1:1 square are TODO.
- No voiceover yet; the video uses generated music + captions.
- Host package needs real-profile validation, HMR/dispose checks, and a slimmer publish shape before it is market-ready.
- Do not render third-party screenshots without permission; prefer synthetic mocks or your own UI.

## Publishing / plugin market

See [PUBLISHING.md](PUBLISHING.md) for the npm + DSH market checklist.

## Disclaimer

This is an unofficial community project, not affiliated with or endorsed by DeepSeek. “DeepSeek”, “DSH”, and related marks belong to their owners; they are used here only to describe compatibility. The cartoon whale is an original illustration, not the official logo. Demo screenshots come from the MIT-licensed better-sidebar repo; task/side-chat panels are synthetic.

## License

MIT. See [LICENSE](LICENSE).
