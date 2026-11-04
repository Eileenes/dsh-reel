#!/usr/bin/env bash
# Rasterize the three campaign designs into docs/ with headless Chrome + sips.
#
#   bash design/build.sh
#
# macOS only (uses sips for the 2x → 1x downscale). On Linux replace the sips
# calls with ImageMagick, or just use the 2x output directly.
set -euo pipefail
cd "$(dirname "$0")"

node build.mjs

CH="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ ! -x "$CH" ]; then
  echo "Chrome not found. Set CHROME_PATH to your Chrome/Chromium binary." >&2
  exit 1
fi

shot() { # $1=html $2=window-size $3=raw png $4=final png $5=final w $6=final h
  "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size="$2" --screenshot="$3" "file://$PWD/build/$1"
  sips -z "$6" "$5" "$3" --out "$4" >/dev/null
}

mkdir -p ../docs
shot poster.html "1080,1440" build/poster-2x.png ../docs/promo.png 2160 2880
shot cover.html "1920,1080" build/cover-2x.png ../docs/poster.png 1920 1080
shot square.html "1080,1080" build/square-2x.png ../docs/promo-1x1.png 1080 1080

echo "wrote docs/promo.png (2160x2880), docs/poster.png (1920x1080), docs/promo-1x1.png (1080x1080)"
