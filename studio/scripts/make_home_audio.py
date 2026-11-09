#!/usr/bin/env python3
"""
make_home_audio.py — sound package for the Sorenyeah home film (30s), built with the
dsh-reel v2 synthesis engine (make_sfx_v2.py): the same 15 synthesized SFX, the same
event-driven mix, the site film's own 120 BPM music bed.

Everything is local, deterministic and licence-free: no samples, no third-party music.

Inputs:
  studio/public/sorenyeah/audio/music-bed.wav 120 BPM bed, 38.0 s (profile "38" of make_music_v2.py)
  studio/src/sorenyeah/timeline.ts            SOUND_EVENTS — the single event source

Outputs (all under studio/public/sorenyeah/audio/):
  sfx/<kind>.wav           15 event sounds
  mix.wav                  30.0 s preview mix (music + SFX, ducked)
  sound-manifest.json      levels, events, music info
  preview-mix.mp3          AAC 192k, what Remotion plays

Usage:
  python3 studio/scripts/make_home_audio.py
  ffmpeg -y -i studio/public/sorenyeah/audio/mix.wav -b:a 192k \\
         studio/public/sorenyeah/audio/preview-mix.mp3
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

STUDIO = Path(__file__).resolve().parents[1]
ENGINE = STUDIO / "scripts" / "make_sfx_v2.py"
OUT_DIR = STUDIO / "public" / "sorenyeah" / "audio"
TIMELINE = STUDIO / "src" / "sorenyeah" / "timeline.ts"
MUSIC = STUDIO / "public" / "sorenyeah" / "audio" / "music-bed.wav"


def main() -> None:
    spec = importlib.util.spec_from_file_location("make_sfx_v2", ENGINE)
    if spec is None or spec.loader is None:
        raise SystemExit(f"cannot load {ENGINE}")
    engine = importlib.util.module_from_spec(spec)
    sys.modules["make_sfx_v2"] = engine
    spec.loader.exec_module(engine)

    # Redirect every output of the engine into this film's own folder.
    engine.AUDIO_DIR = OUT_DIR
    engine.SFX_DIR = OUT_DIR / "sfx"
    engine.MIX_PATH = OUT_DIR / "mix.wav"
    engine.TIMELINE_TS = TIMELINE

    sys.argv = [
        "make_sfx_v2.py",
        "--timeline", str(TIMELINE),
        "--music", str(MUSIC),
        "--duration", "38",
        "--total-frames", "1140",
        "--mix", str(OUT_DIR / "mix.wav"),
        "--manifest", str(OUT_DIR / "sound-manifest.json"),
    ]
    engine.main()


if __name__ == "__main__":
    main()
