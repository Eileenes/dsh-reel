# Campaign design sources

The 2026 dsh-reel campaign assets (3:4 poster, 16:9 cover, 1:1 square) are authored
as plain HTML/CSS + inline SVG, then rasterized with headless Chrome at 2× and
downscaled. No external assets, fonts are the system stack.

| File | Output | Size |
| --- | --- | --- |
| `poster.tpl.html` | `docs/promo.png` | 2160×2880 (3:4) |
| `cover.tpl.html` | `docs/poster.png` | 1920×1080 (16:9) |
| `square.tpl.html` | `docs/promo-1x1.png` | 1080×1080 (1:1) |
| `install-poster.html` | `docs/install-poster.png` | 2160×2880 (3:4) · 安装/使用/Star 海报 |
| `parts/whale-voxel.svg` | generated voxel whale (mint) | — |
| `parts/gen-whale.mjs` | regenerates `whale-voxel.svg` | — |
| `parts/assets/poster-thumb.png` | 3:4 thumbnail used inside the cover/square | — |
| `parts/assets/video-still.png` | 16:9 promo still used inside the cover/square | — |

## Build

```bash
node design/build.mjs   # templates -> design/build/{poster,cover,square}.html
bash design/build.sh    # headless Chrome 2x -> sips -> docs/*.png   (macOS)
```

`build.sh` uses `CHROME_PATH` if set, otherwise the default macOS Chrome path.
On Linux, replace the `sips` downscale with ImageMagick (`convert -resize`) or keep
the 2× output.

## Notes

- The market listing uses `docs/promo.png` as its card image: replacing that file is
  what updates the plugin's storefront visual.
- Facts embedded in the artwork must stay true: install command
  `dsh plugin --profile web add dsh-reel-studio` (+ "desktop: Settings → Plugins → Install"),
  no fake download/star counts, no "certified" badges.
- `studio/public/v2/` holds the same poster / video still for the Remotion film.
