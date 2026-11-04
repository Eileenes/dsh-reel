#!/usr/bin/env python3
"""
make_music_v2.py — dsh-reel v2 24s campaign film 的卡点 BGM（纯 Python 合成）。

背景：用户反馈旧版背景"是个脉冲 drone、没有节奏"。本脚本用纯标准库
（array / math / random / json / wave / pathlib）合成一条 120 BPM、A 小调、
能卡画面切点的音乐，供两条 24s 片共用（ReelPromo 与 ReelCase 的场景边界完全一致）。

产物（路径相对 studio/）：
    public/audio/v2/music-bed.wav        24.000s / 48kHz / stereo / 16-bit
    public/audio/v2/music-manifest.json  BPM/小节/section/impact/riser/电平/切点网格误差
    （out/music-bed-audit.md 由 /tmp 的测量脚本生成，见任务）

音乐规格（按 lead 的骨架，不自作主张改结构）：
    120 BPM / 4-4 → 1 拍 0.5s、1 小节 2.0s、24s = 48 拍 = 12 小节
    A 小调，Am–F–C–G 循环 3 遍（每小节一个和弦）
    section：intro 0.0–2.6 / lift 2.6–5.2 / groove 5.2–11.6 / build 11.6–14.2
             / peak 14.2–19.6 / drop 19.6–22.0 / outro 22.0–24.0
    卡点：8 个 cut（2.6/5.2/7.6/11.6/14.2/15.4/19.6/22.0）各放一个 impact
    riser：1.6–2.6 / 10.6–11.6 / 13.2–14.2 / 18.6–19.6（结束点就是 cut）
    侧链：pad/bass 在每次 kick 落点做 ~-4dB / 0.15s 的 duck
    电平：RMS ≈ −21 dBFS、peak ≤ −6 dBFS、无削波；首 0.05s 淡入、末 0.4s 淡出

关于"cut 不在 120 BPM 网格上"：场景切点是手工按秒定的（2.6s = 第 5.2 拍、
11.6s = 第 23.2 拍……只有 22.0s 正好落在第 44 拍）。本脚本的处理是——
鼓组/和声等"持续律动"严格贴着 120 BPM 网格；**impact / riser 收尾 / section
换挡落点按帧精确对齐 cut**（2.6s = 124800 samples 等，全部整数），所以观众听到的
重音与画面切点零误差，而节奏本身不跑偏。manifest 里给了每个 cut 的网格误差。

用法：
    python3 studio/scripts/make_music_v2.py                  # 24s 版（默认，产物与旧版逐字节一致）
    python3 studio/scripts/make_music_v2.py --duration 30    # 30s Better Sidebar 版
    python3 studio/scripts/make_music_v2.py --quiet
"""

from __future__ import annotations

import argparse
import json
import math
import random
import wave
from array import array
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# 基础参数
# ─────────────────────────────────────────────────────────────────────────────
SR = 48000
FPS = 30
BPM = 120.0
BEAT = 60.0 / BPM          # 0.5 s
BAR = BEAT * 4             # 2.0 s
S16 = BEAT / 4             # 0.125 s（十六分音符）

TAU = 2.0 * math.pi
PI = math.pi
SIN = math.sin
EXP = math.exp
POW = math.pow
LOG10 = math.log10
COS = math.cos

STUDIO = Path(__file__).resolve().parents[1]
AUDIO_DIR = STUDIO / "public" / "audio" / "v2"

# 和弦（MIDI）。Am / F / C / G，每小节 1 个
CHORDS = {
    "Am": {"notes": [45, 48, 52], "bass": 33, "name": "Am"},   # A2 C3 E3 / bass A1
    "F":  {"notes": [41, 45, 48], "bass": 29, "name": "F"},    # F2 A2 C3 / bass F1
    "C":  {"notes": [48, 52, 55], "bass": 36, "name": "C"},    # C3 E3 G3 / bass C2
    "G":  {"notes": [43, 47, 50], "bass": 31, "name": "G"},    # G2 B2 D3 / bass G1
}

# 各层整条轨道的目标 RMS（dBFS）。母带前按这个值统一归一化，保证配比不靠猜。两个 profile 共用。
LAYER_TARGET_RMS = {
    "pad": -20.5, "bass": -18.0, "kick": -15.5, "perc": -17.5,
    "arp": -20.0, "bell": -28.0, "impact": -17.0, "riser": -20.0,
}

# ─────────────────────────────────────────────────────────────────────────────
# 两个 profile：
#   "24" → ReelPromo / ReelCase 24s 片（12 小节 / 8 cuts / 7 段）—— 默认行为，产物与旧版逐字节一致
#   "30" → ReelCase30 30s Better Sidebar 片（15 小节 / 6 cuts / 7 段）
# SEC_GAIN 里除各层增益外还带 kickpat / hat / clap / snare 四个编排开关，
# 这样 build_kick / build_perc 不再写死 section id，两个 profile 共用同一套音色与代码路径。
# ─────────────────────────────────────────────────────────────────────────────
PROFILES = {
    "24": {
        "dur": 24.0,
        "purpose": "24s campaign 片卡点 BGM，ReelPromo 与 ReelCase 共用（两条片场景边界一致）",
        "bed": "music-bed.wav",
        "manifest": "music-manifest.json",
        "scene_frames": [(0, "S1"), (78, "S2"), (156, "S3"), (228, "S4"), (348, "S5"),
                         (426, "S6"), (462, "S7"), (588, "S8"), (660, "S9"), (720, "END")],
        "cut_frames": [78, 156, 228, 348, 426, 462, 588, 660],
        "cut_weight": {78: 0.80, 156: 1.00, 228: 0.70, 348: 0.85,
                       426: 1.00, 462: 0.60, 588: 1.15, 660: 1.00},
        "riser_frames": [(48, 78), (318, 348), (396, 426), (558, 588)],
        "sections": [
            # id,        from, to,    scene,  说明
            ("intro", 0.0, 2.6, "S1", "pad 铺底 + 稀疏 hats + 末尾 riser，不要 kick"),
            ("lift", 2.6, 5.2, "S2", "kick 进入（每小节 1、3 拍）+ hats 8 分"),
            ("groove", 5.2, 11.6, "S3+S4", "4-on-floor kick + sub bass + 16 分 arp + 轻 clap"),
            ("build", 11.6, 14.2, "S5", "full 编制 + 上升 riser（13.2→14.2）"),
            ("peak", 14.2, 19.6, "S6+S7", "peak：全编制 + open hat + 16 分 hat，能量最高"),
            ("drop", 19.6, 22.0, "S8", "drop 到 pad + bell + 慢 kick，impact 在 19.6"),
            ("outro", 22.0, 24.0, "S9", "pad 收束 + 末击 23.5，最后 0.4s 淡出"),
        ],
        "sec_gain": {
            "intro":  {"pad": 1.12, "kick": 0.0,  "kickpat": "none",   "perc": 1.00, "hat": "8sparse", "arp": 0.0,  "bass": 0.0,  "clap": 0, "snare": 0},
            "lift":   {"pad": 1.00, "kick": 1.00, "kickpat": "13",     "perc": 0.90, "hat": "8",       "arp": 0.0,  "bass": 0.0,  "clap": 0, "snare": 0},
            "groove": {"pad": 0.85, "kick": 1.00, "kickpat": "4floor", "perc": 1.00, "hat": "16",      "arp": 1.00, "bass": 1.00, "clap": 1, "snare": 0},
            "build":  {"pad": 0.88, "kick": 1.00, "kickpat": "4floor", "perc": 1.05, "hat": "16",      "arp": 1.08, "bass": 1.00, "clap": 1, "snare": 0},
            "peak":   {"pad": 0.95, "kick": 1.08, "kickpat": "4floor", "perc": 1.25, "hat": "16open",  "arp": 1.22, "bass": 1.00, "clap": 1, "snare": 1},
            "drop":   {"pad": 0.78, "kick": 0.55, "kickpat": "13",     "perc": 0.00, "hat": "none",    "arp": 0.0,  "bass": 0.0,  "clap": 0, "snare": 0},
            "outro":  {"pad": 1.00, "kick": 0.0,  "kickpat": "none",   "perc": 0.00, "hat": "none",    "arp": 0.0,  "bass": 0.0,  "clap": 0, "snare": 0},
        },
        "progression": ["Am", "F", "C", "G"] * 3,      # 12 小节
        "pad_last_bar_cut": 23.5,                       # 末小节在末击前收住
        "bell_notes": [(76, 20.0, 0.32, 0.26, 1.15), (81, 20.5, 0.32, 0.26, 1.15),
                       (84, 21.0, 0.32, 0.26, 1.15), (79, 21.5, 0.32, 0.26, 1.15)],
        "final_bells": [(81, 23.5, 0.26, 0.22, 0.9), (84, 23.5, 0.26, 0.22, 0.9),
                        (88, 23.5, 0.26, 0.22, 0.9)],
        "final_hit": {"sec": 23.5, "weight": 1.0, "dur": 1.5, "gain": 0.9},
        "grid_note": "持续律动严格贴 120BPM 网格；impact/riser/section 换挡按帧对齐 cut（2.6s=第5.2拍，故 cut 不在拍点上，属设计取舍，见 cuts.delta_ms_vs_beat）",
        "final_hit_note": {"sec": 23.5, "type": "impact + Am bell chord（bVII→i 收束）"},
        "usage": "Remotion: <Audio src={staticFile('audio/v2/music-bed.wav')} />；或由 make_sfx_v2.py --music public/audio/v2/music-bed.wav 混入（会自动跳过旧 drone）",
    },
    "30": {
        "dur": 30.0,
        "purpose": "30s Better Sidebar case 片（ReelCase30）卡点 BGM，按 case30-timeline.ts 的 C1–C7 场景边界对齐，两条片共用同一套音色写法",
        "bed": "music-bed-30.wav",
        "manifest": "music-manifest-30.json",
        "version": "v2-30s",
        "scene_frames": [(0, "C1"), (90, "C2"), (210, "C3"), (300, "C4"),
                         (450, "C5"), (570, "C6"), (720, "C7"), (900, "END")],
        "cut_frames": [90, 210, 300, 450, 570, 720],
        "cut_weight": {90: 0.85, 210: 0.90, 300: 0.75, 450: 1.00, 570: 1.00, 720: 1.15},
        "riser_frames": [(60, 90), (270, 300), (420, 450), (540, 570), (690, 720)],
        "sections": [
            ("intro", 0.0, 3.0, "C1", "hook：pad 铺底 + 稀疏 hats + 末尾 riser（1.0→3.0），不要 kick"),
            ("lift", 3.0, 7.0, "C2", "whale + DSH window：kick 进入（每小节 1、3 拍）+ hats 8 分"),
            ("groove", 7.0, 10.0, "C3", "official plugins page：4-on-floor kick + sub bass + 16 分 arp + 轻 clap"),
            ("build", 10.0, 15.0, "C4", "search + install：full 编制 + riser（14.0→15.0）"),
            ("peak", 15.0, 19.0, "C5", "sidebar ready：全编制 + open hat + 16 分 hat + snare，能量最高"),
            ("resolve", 19.0, 24.0, "C6", "four features：收一档（half-time kick + 8 分 hat + clap），给 peak 让出落差"),
            ("outro", 24.0, 30.0, "C7", "outro：Am 长音 pad + bell，末击 27.0，27–30s 静止收尾后 0.4s 淡出"),
        ],
        "sec_gain": {
            "intro":   {"pad": 1.12, "kick": 0.0,  "kickpat": "none",   "perc": 1.00, "hat": "8sparse", "arp": 0.0,  "bass": 0.0,  "clap": 0, "snare": 0},
            "lift":    {"pad": 1.00, "kick": 1.00, "kickpat": "13",     "perc": 0.90, "hat": "8",       "arp": 0.0,  "bass": 0.0,  "clap": 0, "snare": 0},
            "groove":  {"pad": 0.85, "kick": 1.00, "kickpat": "4floor", "perc": 1.00, "hat": "16",      "arp": 1.00, "bass": 1.00, "clap": 1, "snare": 0},
            "build":   {"pad": 0.88, "kick": 1.02, "kickpat": "4floor", "perc": 1.08, "hat": "16",      "arp": 1.12, "bass": 1.00, "clap": 1, "snare": 0},
            "peak":    {"pad": 1.00, "kick": 1.12, "kickpat": "4floor", "perc": 1.32, "hat": "16open",  "arp": 1.28, "bass": 1.00, "clap": 1, "snare": 1},
            "resolve": {"pad": 0.92, "kick": 0.72, "kickpat": "13",     "perc": 0.55, "hat": "8",       "arp": 0.0,  "bass": 0.88, "clap": 1, "snare": 0},
            "outro":   {"pad": 1.06, "kick": 0.0,  "kickpat": "none",   "perc": 0.00, "hat": "none",    "arp": 0.0,  "bass": 0.0,  "clap": 0, "snare": 0},
        },
        # 12 小节完整循环 + 3 小节主和弦收束（否则 15 小节会停在 C/G 上，静止收尾不落地）
        "progression": ["Am", "F", "C", "G"] * 3 + ["Am", "Am", "Am"],
        "pad_last_bar_cut": None,
        "bell_notes": [(76, 24.6, 0.30, 0.24, 1.15), (81, 25.4, 0.28, 0.22, 1.15),
                       (84, 26.2, 0.26, 0.21, 1.15)],
        "final_bells": [(81, 27.0, 0.30, 0.26, 2.6), (84, 27.0, 0.28, 0.24, 2.6),
                        (88, 27.0, 0.25, 0.21, 2.6)],
        "final_hit": {"sec": 27.0, "weight": 1.10, "dur": 2.2, "gain": 0.95},
        # 30s 片子更长、密织段更满：riser 与结尾 bell 单独抬一点，24s 不受影响
        "layer_targets": {"riser": -19.0, "bell": -26.0},
        "grid_note": "持续律动与 impact/riser 都严格贴 120BPM 网格：6 个 cut 全部落在整拍（3s=第6拍、7s=14、10s=20、15s=30、19s=38、24s=48 拍），没有 24s 版那种 off-grid 取舍",
        "final_hit_note": {"sec": 27.0, "type": "impact + Am bell chord（静止段第 1 秒收在主和弦）"},
        "recommended_mix_note": "30s 片的 SFX 混音还没做（make_sfx_v2.py 目前写死 DUR=24 + timeline.ts 事件表）：music bus 仍按 -21 dBFS 摆，SFX bus -23.5、总 -19.5/-1.5 是同一套目标；做 30s mix 时需要把事件表换成 case30-timeline.ts 并把时长参数化",
        "usage": "Remotion: <Audio src={staticFile('audio/v2/music-bed-30.wav')} />；ReelCase30 目前指向 preview-mix-case30.mp3，需要先做 30s 的 SFX 混音（make_sfx_v2.py 当前写死 24s，需另开 --duration 或新 mix 脚本）",
        "extra_manifest": {
            "profile": "30",
            "sibling_24s": {"bed": "music-bed.wav", "manifest": "music-manifest.json"},
            "hard_cap_note": "30.000s 硬上限：N = 30×48000 = 1 440 000 samples（正好 900 帧 @30fps），文件时长 30.000000s",
        },
    },
}

# 运行期全局：由 configure() 按 profile 设置。函数体在调用时读全局，
# 所以 configure 后所有 build_* 都用当前 profile，且 24s 默认行为与旧版逐字节一致。
DUR = 24.0
N = int(SR * DUR)
TOTAL_BEATS = int(round(DUR / BEAT))
TOTAL_BARS = int(round(DUR / BAR))
SCENE_FRAMES = []
CUT_FRAMES = []
CUT_WEIGHT = {}
RISER_FRAMES = []
SECTIONS = []
SEC_GAIN = {}
PROGRESSION = []
PAD_LAST_BAR_CUT = None
BELL_NOTES = []
FINAL_BELLS = []
FINAL_HIT = {}
BED_PATH = AUDIO_DIR / "music-bed.wav"
MANIFEST_PATH = AUDIO_DIR / "music-manifest.json"
PROFILE_NAME = "24"
PROFILE = None


def configure(name: str):
    """按 profile 名字设置模块级全局（默认 "24"）。"""
    global DUR, N, TOTAL_BEATS, TOTAL_BARS, SCENE_FRAMES, CUT_FRAMES, CUT_WEIGHT, \
        RISER_FRAMES, SECTIONS, SEC_GAIN, PROGRESSION, PAD_LAST_BAR_CUT, \
        BELL_NOTES, FINAL_BELLS, FINAL_HIT, BED_PATH, MANIFEST_PATH, PROFILE_NAME, PROFILE
    if name not in PROFILES:
        raise SystemExit("未知 profile: %s（可选 %s）" % (name, " / ".join(PROFILES)))
    p = PROFILES[name]
    PROFILE_NAME = name
    PROFILE = p
    DUR = p["dur"]
    N = int(SR * DUR)
    TOTAL_BEATS = int(round(DUR / BEAT))
    TOTAL_BARS = int(round(DUR / BAR))
    SCENE_FRAMES = p["scene_frames"]
    CUT_FRAMES = p["cut_frames"]
    CUT_WEIGHT = p["cut_weight"]
    RISER_FRAMES = p["riser_frames"]
    SECTIONS = p["sections"]
    SEC_GAIN = p["sec_gain"]
    PROGRESSION = p["progression"]
    PAD_LAST_BAR_CUT = p["pad_last_bar_cut"]
    BELL_NOTES = p["bell_notes"]
    FINAL_BELLS = p["final_bells"]
    FINAL_HIT = p["final_hit"]
    BED_PATH = AUDIO_DIR / p["bed"]
    MANIFEST_PATH = AUDIO_DIR / p["manifest"]


configure("24")   # 模块导入即 24s 默认（main 里可按 --duration 重新 configure）


def midi_hz(m: float) -> float:
    return 440.0 * POW(2.0, (m - 69.0) / 12.0)


def db2lin(db: float) -> float:
    return POW(10.0, db / 20.0)


def dbfs(amp: float) -> float:
    return 20.0 * LOG10(amp) if amp > 0.0 else -180.0


# ─────────────────────────────────────────────────────────────────────────────
# 波形表（避免每样本 sin，纯 Python 也能跑得动）
# ─────────────────────────────────────────────────────────────────────────────
def build_saw_table(harmonics: int, size: int = 2048):
    """限谐波锯齿表（1/k 衰减），相位 0..1 内采样 size 个点，末尾补首点方便插值。"""
    tbl = [0.0] * (size + 1)
    for k in range(1, harmonics + 1):
        amp = 1.0 / k
        step = TAU * k / size
        for i in range(size):
            tbl[i] += amp * SIN(step * i)
    peak = max(max(tbl), -min(tbl))
    if peak > 0:
        tbl = [v / peak for v in tbl]
    tbl[size] = tbl[0]
    return tbl


TABLE_SIZE = 2048
PAD_TABLE = build_saw_table(16)      # 暖 pad：谐波到 16 次（110Hz 时 ~1.8kHz）
BASS_TABLE = build_saw_table(8)      # sub bass：8 次（55Hz 时 ~440Hz），再低通
ARP_TABLE = build_saw_table(7)       # 方感 pluck


def table_read(tbl, phase: float) -> float:
    p = phase * TABLE_SIZE
    i = int(p)
    frac = p - i
    return tbl[i] * (1.0 - frac) + tbl[i + 1] * frac


# ─────────────────────────────────────────────────────────────────────────────
# 振荡器 / 滤波器小工具（全部单声道小缓冲，最后统一铺）
# ─────────────────────────────────────────────────────────────────────────────
def one_pole_lp(buf, cutoff: float, passes: int = 1):
    a = 1.0 - EXP(-TAU * cutoff / SR)
    out = list(buf)
    for _ in range(passes):
        y = 0.0
        for i, x in enumerate(out):
            y += a * (x - y)
            out[i] = y
    return out


def one_pole_hp(buf, cutoff: float, passes: int = 1):
    a = 1.0 / (1.0 + TAU * cutoff / SR)
    out = list(buf)
    for _ in range(passes):
        y = 0.0
        prev = 0.0
        for i, x in enumerate(out):
            y = a * (y + x - prev)
            prev = x
            out[i] = y
    return out


def sweep_band(buf, f0: float, f1: float, q: float = 1.2, curve: float = 1.0):
    """Chamberlin 状态变量带通，中心频率 f0→f1 指数扫（riser / crash 用）。"""
    n = len(buf)
    if n == 0:
        return []
    n1 = float(max(1, n - 1))
    inv_q = 1.0 / q
    low = band = 0.0
    out = [0.0] * n
    ratio = f1 / f0 if f0 > 0 else 1.0
    for i in range(n):
        u = (i / n1) ** curve
        fc = f0 * POW(ratio, u)
        if fc > SR * 0.42:
            fc = SR * 0.42
        f = 2.0 * SIN(PI * fc / SR)
        high = buf[i] - low - inv_q * band
        band += f * high
        low += f * band
        out[i] = band
    return out


def rng_for(name: str) -> random.Random:
    h = 0
    for ch in name.encode("utf-8"):
        h = (h * 131 + ch) & 0xFFFFFFFF
    return random.Random(h)


def noise(n: int, seed: str):
    r = rng_for(seed)
    return [r.random() * 2.0 - 1.0 for _ in range(n)]


def norm_peak(buf, peak_db: float = 0.0):
    p = max(max(buf), -min(buf)) if buf else 0.0
    if p < 1e-12:
        return list(buf)
    g = db2lin(peak_db) / p
    return [v * g for v in buf]


def edge_fade(buf, fin_ms: float = 1.0, fout_ms: float = 4.0):
    n = len(buf)
    if n < 4:
        return buf
    ni = min(n, max(1, int(fin_ms * SR / 1000.0)))
    no = min(n, max(1, int(fout_ms * SR / 1000.0)))
    out = list(buf)
    for i in range(ni):
        out[i] *= i / float(ni)
    for i in range(no):
        out[n - 1 - i] *= i / float(no)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# 乐器：每次返回 mono 小缓冲（峰值 ~1），由调度器按 gain 铺进总线
# ─────────────────────────────────────────────────────────────────────────────
def synth_kick(dur: float = 0.34):
    n = int(dur * SR)
    out = [0.0] * n
    ph = 0.0
    r = rng_for("kick")
    for i in range(n):
        t = i / SR
        u = t / dur
        f = 55.0 + 75.0 * EXP(-t * 32.0)          # 130Hz → 55Hz（落在 A1，和声不打架）
        ph += TAU * f / SR
        env = EXP(-t * 10.5) * (1.0 - EXP(-t * 2000.0))
        body = SIN(ph) * env + 0.22 * SIN(TAU * 180.0 * t) * EXP(-t * 45.0)
        click = 0.0
        if t < 0.004:
            click = (r.random() * 2.0 - 1.0) * 0.35 * (1.0 - t / 0.004)
        out[i] = body + click
    out = one_pole_hp(out, 42.0)
    return edge_fade(out, 0.5, 6.0)


def synth_snare(dur: float = 0.20):
    n = int(dur * SR)
    raw = noise(n, "snare")
    raw = one_pole_hp(raw, 1300.0, passes=2)
    raw = one_pole_lp(raw, 7000.0, passes=1)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = EXP(-t * 22.0)
        body = SIN(TAU * 185.0 * t) * EXP(-t * 34.0) * 0.55
        out[i] = raw[i] * env * 0.9 + body
    return edge_fade(out, 1.0, 5.0)


def synth_clap(dur: float = 0.26):
    n = int(dur * SR)
    raw = noise(n, "clap")
    raw = one_pole_hp(raw, 900.0, passes=2)
    raw = one_pole_lp(raw, 3600.0, passes=1)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = 0.0
        for off, amp in ((0.000, 1.0), (0.010, 0.8), (0.021, 0.65)):
            if t >= off:
                env += amp * EXP(-(t - off) * 120.0)
        env += 0.32 * EXP(-t * 12.0)          # 尾巴
        out[i] = raw[i] * env
    peak = max(max(out), -min(out)) or 1.0
    return edge_fade([v / peak for v in out], 1.0, 6.0)


def synth_hat(dur: float = 0.06, open_hat: bool = False):
    n = int(dur * SR)
    raw = noise(n, "hat-open" if open_hat else "hat")
    raw = one_pole_hp(raw, 5200.0, passes=1)
    raw = one_pole_lp(raw, 11000.0, passes=1)
    decay = 15.0 if open_hat else 110.0
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        out[i] = raw[i] * EXP(-t * decay) * (1.0 - EXP(-t * 4000.0))
    peak = max(max(out), -min(out)) or 1.0
    return edge_fade([v / peak for v in out], 0.5, 4.0)


def synth_impact(weight: float = 1.0, dur: float = 1.30):
    """cut 上的重音：sub boom（70→38Hz 下扫）+ 噪声 crash + click。"""
    n = int(dur * SR)
    out = [0.0] * n
    ph = 0.0
    raw = noise(n, "impact-crash")
    raw = one_pole_hp(raw, 1400.0, passes=1)
    raw = sweep_band(raw, 5200.0, 1800.0, q=0.7, curve=1.0)
    for i in range(n):
        t = i / SR
        f = 38.0 + 34.0 * EXP(-t * 14.0)
        ph += TAU * f / SR
        boom = SIN(ph) * EXP(-t * 2.6) * (1.0 - EXP(-t * 900.0))
        crash = raw[i] * EXP(-t * 3.4) * 0.55
        click = 0.0
        if t < 0.003:
            click = (rng_for("impact-click").random() * 2.0 - 1.0) * 0.5
        out[i] = (boom + crash + click) * weight
    return edge_fade(out, 0.5, 20.0)


def synth_riser(dur: float = 1.0, seed_l: str = "riser-l", seed_r: str = "riser-r",
                f0: float = 700.0, f1: float = 5200.0):
    """上升 riser：两路不同种子的噪声带通上扫 + 正弦上滑 + 渐强，结束点即 cut。"""
    n = int(dur * SR)
    left = [0.0] * n
    right = [0.0] * n
    ph = 0.0
    rl = sweep_band(noise(n, seed_l), f0, f1, q=1.1, curve=0.8)
    rr = sweep_band(noise(n, seed_r), f0 * 1.03, f1 * 1.02, q=1.1, curve=0.8)
    for i in range(n):
        u = i / float(max(1, n - 1))
        amp = u ** 1.9
        f = 220.0 * POW(4.0, u)
        ph += TAU * f / SR
        tone = SIN(ph) * 0.18 * u
        left[i] = (rl[i] * 0.9 + tone) * amp
        right[i] = (rr[i] * 0.9 + tone) * amp
    left = one_pole_lp(left, 9000.0, passes=1)
    right = one_pole_lp(right, 9000.0, passes=1)
    peak = max(max(left), -min(left), max(right), -min(right)) or 1.0
    left = [v / peak for v in left]
    right = [v / peak for v in right]
    fi = int(0.02 * SR)
    for i in range(fi):
        g = i / fi
        left[i] *= g
        right[i] *= g
    return left, right


def synth_bell(midi: float, dur: float = 1.15):
    """pad+bell 段的钟：正弦 + 2.4/4.1 次泛音，指数衰减。"""
    f = midi_hz(midi)
    n = int(dur * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = EXP(-t * 4.6) * (1.0 - EXP(-t * 600.0))
        s = (SIN(TAU * f * t)
             + 0.45 * SIN(TAU * f * 2.41 * t + 0.4) * EXP(-t * 2.0)
             + 0.22 * SIN(TAU * f * 4.07 * t + 0.9) * EXP(-t * 1.4))
        out[i] = s * env
    return edge_fade(out, 2.0, 12.0)


def synth_pluck(midi: float, dur: float = 0.22):
    """arp pluck：带表锯齿 + 高通，短衰减。"""
    f = midi_hz(midi)
    n = int(dur * SR)
    out = [0.0] * n
    ph = 0.0
    inc = f / SR
    for i in range(n):
        t = i / SR
        ph += inc
        if ph >= 1.0:
            ph -= 1.0
        v = table_read(ARP_TABLE, ph)
        out[i] = v * EXP(-t * 16.0) * (1.0 - EXP(-t * 3000.0))
    out = one_pole_hp(out, 260.0, passes=1)
    return edge_fade(out, 0.5, 8.0)


# ─────────────────────────────────────────────────────────────────────────────
# 总线 / 调度
# ─────────────────────────────────────────────────────────────────────────────
def zero_buf(n: int = -1):
    if n < 0:
        n = N
    return array("f", [0.0]) * n


def add_mono(bus, mono, start: int, gain: float):
    n = len(bus)
    m = len(mono)
    if start >= n:
        return
    end = min(n, start + m)
    for i in range(start, end):
        bus[i] += mono[i - start] * gain


def add_stereo(bl, br, left, right, start: int, gain: float):
    n = len(bl)
    m = len(left)
    if start >= n:
        return
    end = min(n, start + m)
    for i in range(start, end):
        j = i - start
        bl[i] += left[j] * gain
        br[i] += right[j] * gain


def sec_of(t: float):
    for sid, a, b, scene, note in SECTIONS:
        if a <= t < b:
            return sid, a, b
    return SECTIONS[-1][0], SECTIONS[-1][1], SECTIONS[-1][2]


def beat_grid(a: float, b: float):
    """[a,b) 内所有 120BPM 拍点。"""
    k = int(math.floor(a / BEAT + 1e-9))
    while True:
        t = k * BEAT
        if t >= b - 1e-9:
            break
        if t >= a - 1e-9:
            yield t
        k += 1


def s16_grid(a: float, b: float):
    k = int(math.floor(a / S16 + 1e-9))
    while True:
        t = k * S16
        if t >= b - 1e-9:
            break
        if t >= a - 1e-9:
            yield t
        k += 1


def sample_at(t: float) -> int:
    return int(round(t * SR))


# ─────────────────────────────────────────────────────────────────────────────
# 生成各部分
# ─────────────────────────────────────────────────────────────────────────────
def build_pad():
    """每小节一个和弦，3 音 × 2 路 detune（±5 cents），左右互为主次 → 立体声宽度。"""
    left = zero_buf()
    right = zero_buf()
    for bar in range(TOTAL_BARS):
        a = bar * BAR
        b = a + BAR
        if PAD_LAST_BAR_CUT is not None and bar == TOTAL_BARS - 1:
            b = PAD_LAST_BAR_CUT          # 24s：末小节在末击前收住
        chord = CHORDS[PROGRESSION[bar]]
        dur = min((b - a) + 0.45, DUR - a)   # 释放尾巴叠到下一小节
        n = int(dur * SR)
        r = rng_for("pad%d" % bar)
        voices = []
        for m in chord["notes"]:
            f = midi_hz(m)
            for cent in (-5.0, 5.0):
                voices.append((f * POW(2.0, cent / 1200.0), r.random()))
        pg = SEC_GAIN[sec_of(a + 0.01)[0]]["pad"]
        left_seg = array("f", [0.0]) * n
        right_seg = array("f", [0.0]) * n
        att = int(0.30 * SR)
        rel = 0.45
        nv = len(voices)
        for i in range(n):
            e = 1.0
            if i < att:
                e = i / att
            rem = (n - i) / SR
            if rem < rel:
                e *= rem / rel
            vl = 0.0
            vr = 0.0
            for idx in range(nv):
                f, ph0 = voices[idx]
                p = (ph0 + f * (i / SR)) % 1.0
                v = table_read(PAD_TABLE, p)
                if idx % 2 == 0:
                    vl += v * 0.62
                    vr += v * 0.38
                else:
                    vl += v * 0.38
                    vr += v * 0.62
            left_seg[i] = vl * e * pg
            right_seg[i] = vr * e * pg
        start = sample_at(a)
        end = min(N, start + n)
        for i in range(start, end):
            left[i] += left_seg[i - start]
            right[i] += right_seg[i - start]
    return left, right


def build_bass():
    """sub bass：每小节根音，锯齿表 + 正弦，段内起停；之后整体低通 160Hz。"""
    left = zero_buf()
    right = zero_buf()
    for bar in range(TOTAL_BARS):
        a = bar * BAR
        b = a + BAR
        # 只在有 bass 的 section 内发声
        sid = sec_of(a + 0.01)[0]
        bg = SEC_GAIN[sid]["bass"]
        if bg <= 0.0:
            continue
        f = midi_hz(CHORDS[PROGRESSION[bar]]["bass"])
        dur = BAR - 0.06
        n = int(dur * SR)
        seg = [0.0] * n
        ph_t = 0.0
        ph_s = 0.0
        inc_t = f / SR
        inc_s = f / SR
        for i in range(n):
            t = i / SR
            ph_t += inc_t
            if ph_t >= 1.0:
                ph_t -= 1.0
            ph_s += inc_s
            if ph_s >= 1.0:
                ph_s -= 1.0
            saw = table_read(BASS_TABLE, ph_t)
            sub = SIN(TAU * ph_s)
            v = saw * 0.55 + sub * 0.65
            v = math.tanh(v * 1.5) * 0.8
            e = 1.0
            if i < int(0.008 * SR):
                e = i / (0.008 * SR)
            if i > n - int(0.05 * SR):
                e = (n - i) / (0.05 * SR)
            seg[i] = v * e
        seg = one_pole_lp(seg, 120.0, passes=2)
        add_mono(left, seg, sample_at(a), 0.9 * bg)
        add_mono(right, seg, sample_at(a), 0.9 * bg)
    return left, right


def build_kick():
    """kick 单独一层（和其他打击乐分开归一化，保证低频冲击不被 hat 的 RMS 稀释）。"""
    left = zero_buf()
    right = zero_buf()
    kick = synth_kick()
    kick_times = []

    def kick_at(t, sid):
        g = SEC_GAIN[sid]["kick"]
        if g <= 0.0:
            return
        kick_times.append(round(t, 6))
        add_mono(left, kick, sample_at(t), 1.00 * g)
        add_mono(right, kick, sample_at(t), 1.00 * g)

    for sid, a, b, scene, _note in SECTIONS:
        pat = SEC_GAIN[sid]["kickpat"]
        if pat == "none" or SEC_GAIN[sid]["kick"] <= 0.0:
            continue
        kick_at(a, sid)                       # section 入口 accent（正好是 cut / 换挡点）
        for t in beat_grid(a, b):
            if pat == "4floor":
                kick_at(t, sid)
            elif abs((t % BAR)) < 1e-6 or abs((t % BAR) - 1.0) < 1e-6:
                kick_at(t, sid)               # "13"：每小节 1、3 拍
    return left, right, kick_times


def build_perc():
    """hats / clap / snare —— 节奏的"高频骨架"，单独一层。"""
    left = zero_buf()
    right = zero_buf()
    snare = synth_snare()
    clap = synth_clap()
    hat_c = synth_hat(0.06, False)
    hat_o = synth_hat(0.30, True)
    hat_times = []

    for sid, a, b, scene, _note in SECTIONS:
        pg = SEC_GAIN[sid]["perc"]
        if pg <= 0.0:
            continue
        hm = SEC_GAIN[sid]["hat"]
        if hm in ("8sparse", "8"):
            g_l, g_r = (0.26, 0.22) if hm == "8sparse" else (0.34, 0.29)
            for t in s16_grid(a, b):
                if abs((t / S16) % 2) < 1e-6:          # 8 分
                    hat_times.append(round(t, 6))
                    add_mono(left, hat_c, sample_at(t), g_l * pg)
                    add_mono(right, hat_c, sample_at(t), g_r * pg)
        elif hm in ("16", "16open"):
            hat_gain = 0.58 if hm == "16open" else 0.48
            for t in s16_grid(a, b):
                on16 = int(round(t / S16))
                acc = 1.0 if on16 % 4 == 0 else (0.72 if on16 % 2 == 0 else 0.5)
                hat_times.append(round(t, 6))
                pan = 0.55 if on16 % 2 == 0 else 0.45
                add_mono(left, hat_c, sample_at(t), hat_gain * acc * (1.25 - pan) * pg)
                add_mono(right, hat_c, sample_at(t), hat_gain * acc * pan * pg)
                if hm == "16open" and on16 % 4 == 2:
                    add_mono(left, hat_o, sample_at(t), 0.28 * pg)
                    add_mono(right, hat_o, sample_at(t), 0.25 * pg)
        # clap（2、4 拍）；peak 段再叠 snare
        if SEC_GAIN[sid]["clap"]:
            is_peak = sid == "peak"
            for t in beat_grid(a, b):
                phase = t % BAR
                if abs(phase - 0.5) < 1e-6 or abs(phase - 1.5) < 1e-6:
                    add_mono(left, clap, sample_at(t), (0.52 if is_peak else 0.46) * pg)
                    add_mono(right, clap, sample_at(t), (0.46 if is_peak else 0.40) * pg)
                    if SEC_GAIN[sid]["snare"]:
                        add_mono(left, snare, sample_at(t), 0.46 * pg)
                        add_mono(right, snare, sample_at(t), 0.40 * pg)
    return left, right, hat_times


def build_arp():
    """16 分 arp pluck，偏右；0.25s 回声在左。"""
    dry = zero_buf()
    for sid, a, b, scene, _note in SECTIONS:
        if SEC_GAIN[sid]["arp"] <= 0.0:
            continue
        for t in s16_grid(a, b):
            bar = int(t // BAR)
            chord = CHORDS[PROGRESSION[min(bar, TOTAL_BARS - 1)]]
            notes = chord["notes"]
            k = int(round(t / S16))
            idx = k % 8
            octave = 12 if idx < 4 else 24
            pat = [0, 1, 2, 0, 2, 1, 0, 1][idx]
            midi = notes[pat] + octave
            add_mono(dry, synth_pluck(midi), sample_at(t), 0.55 * SEC_GAIN[sid]["arp"])
    # 回声：0.25s + 0.5s 两级
    d = int(0.25 * SR)
    echo = [0.0] * N
    for i in range(N):
        v = 0.0
        if i >= d:
            v += dry[i - d] * 0.40
        if i >= 2 * d:
            v += dry[i - 2 * d] * 0.16
        echo[i] = v
    # 立体声：dry 偏右，echo 偏左
    left = zero_buf()
    right = zero_buf()
    for i in range(N):
        left[i] = dry[i] * 0.34 + echo[i] * 0.62
        right[i] = dry[i] * 0.62 + echo[i] * 0.34
    return left, right


def build_bell():
    """钟声：profile 给两段 —— outro/drop 的动机 + 末击的和弦钟。"""
    left = zero_buf()
    right = zero_buf()
    for midi, t, gl, gr, dur in BELL_NOTES:
        b = synth_bell(midi, dur)
        add_mono(left, b, sample_at(t), gl)
        add_mono(right, b, sample_at(t), gr)
    for midi, t, gl, gr, dur in FINAL_BELLS:
        b = synth_bell(midi, dur)
        add_mono(left, b, sample_at(t), gl)
        add_mono(right, b, sample_at(t), gr)
    return left, right


def build_impacts():
    left = zero_buf()
    right = zero_buf()
    hits = []
    for fr in CUT_FRAMES:
        t = fr / FPS
        w = CUT_WEIGHT.get(fr, 0.8)
        imp = synth_impact(weight=w)
        add_mono(left, imp, sample_at(t), 0.85)
        add_mono(right, imp, sample_at(t), 0.85)
        hits.append({"frame": fr, "sec": round(t, 6), "weight": w})
    # 末击（不是 cut，但需要收束）——由 profile 给秒数/权重/长度/增益
    hit = FINAL_HIT
    imp = synth_impact(weight=hit["weight"], dur=hit["dur"])
    add_mono(left, imp, sample_at(hit["sec"]), hit["gain"])
    add_mono(right, imp, sample_at(hit["sec"]), hit["gain"])
    hits.append({"frame": int(hit["sec"] * FPS), "sec": hit["sec"],
                 "weight": hit["weight"], "note": "final hit"})
    return left, right, hits


def build_risers():
    left = zero_buf()
    right = zero_buf()
    risers = []
    for i, (f0, f1) in enumerate(RISER_FRAMES):
        a = f0 / FPS
        b = f1 / FPS
        dur = b - a
        rl, rr = synth_riser(dur, seed_l="riserL%d" % i, seed_r="riserR%d" % i)
        add_stereo(left, right, rl, rr, sample_at(a), 0.62)
        risers.append({"from_frame": f0, "to_frame": f1,
                       "from_sec": round(a, 6), "to_sec": round(b, 6)})
    return left, right, risers


def build_duck(kick_times):
    """侧链：pad 压 -4dB / bass 压 -7dB（bass 让 kick 的低频更有冲击）。"""
    def make(depth_db: float, n_rec_sec: float):
        depth = 1.0 - db2lin(depth_db)
        n_rec = int(n_rec_sec * SR)
        duck = array("f", [1.0]) * N
        for kt in kick_times:
            st = sample_at(kt)
            for i in range(n_rec):
                idx = st + i
                if idx >= N:
                    break
                u = i / n_rec
                duck[idx] *= 1.0 - depth * (1.0 - EXP(-u * 250.0)) * EXP(-u * (4.5 if depth_db > -5.0 else 3.2))
        return duck
    return make(-4.0, 0.22), make(-7.0, 0.30)


# ─────────────────────────────────────────────────────────────────────────────
# 主流程
# ─────────────────────────────────────────────────────────────────────────────
def write_wav(path: Path, left, right):
    path.parent.mkdir(parents=True, exist_ok=True)
    n = len(left)
    frames = array("h")
    ap = frames.append
    for i in range(n):
        lv = left[i]
        rv = right[i]
        if lv > 1.0:
            lv = 1.0
        elif lv < -1.0:
            lv = -1.0
        if rv > 1.0:
            rv = 1.0
        elif rv < -1.0:
            rv = -1.0
        ap(int(lv * 32767.0 + 0.5) if lv >= 0.0 else int(lv * 32767.0 - 0.5))
        ap(int(rv * 32767.0 + 0.5) if rv >= 0.0 else int(rv * 32767.0 - 0.5))
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames.tobytes())


def rms_of(bufs):
    total = 0.0
    cnt = 0
    for b in bufs:
        for v in b:
            total += v * v
        cnt += len(b)
    return math.sqrt(total / cnt) if cnt else 0.0


def peak_of(bufs):
    p = 0.0
    for b in bufs:
        m = max(max(b), -min(b))
        if m > p:
            p = m
    return p


def apply_soft_limiter(left, right, knee_db=-9.0, ceil_db=-6.0):
    """软限幅：-9dB 以下不动，以上用 tanh 平滑压到 -6dB 以内（保证无削波）。"""
    knee = db2lin(knee_db)
    ceil = db2lin(ceil_db)
    span = ceil - knee
    for buf in (left, right):
        for i in range(N):
            x = buf[i]
            a = x if x >= 0.0 else -x
            if a <= knee:
                continue
            sign = 1.0 if x >= 0.0 else -1.0
            buf[i] = sign * (knee + span * math.tanh((a - knee) / span))
    # 返回实际被压过的样本数
    return left, right


def soft_limit_count(left, right, knee_db=-9.0):
    knee = db2lin(knee_db)
    c = 0
    for buf in (left, right):
        for v in buf:
            if v > knee or v < -knee:
                c += 1
    return c


def main():
    ap = argparse.ArgumentParser(
        description="生成 dsh-reel v2 卡点 BGM（纯 Python，120BPM / A 小调 / Am–F–C–G）")
    ap.add_argument("--duration", type=int, choices=sorted(int(k) for k in PROFILES), default=24,
                    help="片子时长 profile：24（默认，ReelPromo/ReelCase）或 30（ReelCase30）")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()
    configure(str(args.duration))
    say = (lambda *a, **k: None) if args.quiet else print

    say("[1/5] 铺 pad（%s，%d 小节，每小节一个和弦，3 音 ×2 detune 立体声）…"
        % ("–".join(["Am", "F", "C", "G"]) + " 循环", TOTAL_BARS))
    pad_l, pad_r = build_pad()
    say("[2/5] 铺 sub bass（每小节根音，锯齿+正弦，低通 160Hz）…")
    bass_l, bass_r = build_bass()
    say("[3/5] 铺鼓组（kick / snare / clap / hat / open hat）…")
    kick_l, kick_r, kick_times = build_kick()
    perc_l, perc_r, hat_times = build_perc()
    say("      kick %d 个 / hat %d 个" % (len(kick_times), len(hat_times)))
    say("[4/5] 铺 arp（16 分 pluck + 0.25s 回声）/ bell / impact / riser …")
    arp_l, arp_r = build_arp()
    bell_l, bell_r = build_bell()
    imp_l, imp_r, impacts = build_impacts()
    ris_l, ris_r, risers = build_risers()

    # 侧链：pad / bass 在 kick 落点 duck（bass 压得深，给 kick 让位）
    duck_pad, duck_bass = build_duck(kick_times)
    for i in range(N):
        pad_l[i] *= duck_pad[i]
        pad_r[i] *= duck_pad[i]
        bass_l[i] *= duck_bass[i]
        bass_r[i] *= duck_bass[i]

    say("[5/5] 混总线 + 母带（RMS −21 dBFS / peak ≤ −6 dBFS）+ 写 WAV …")
    left = zero_buf()
    right = zero_buf()
    # 各层按目标整轨 RMS 归一化后求和（配比用数字定死，不靠耳朵猜；
    # 低频分层：sub 55–90Hz、kick body 90–150Hz，pad/arp 让中频可读）
    layers = [
        ("pad", pad_l, pad_r),
        ("bass", bass_l, bass_r),
        ("kick", kick_l, kick_r),
        ("perc", perc_l, perc_r),
        ("arp", arp_l, arp_r),
        ("bell", bell_l, bell_r),
        ("impact", imp_l, imp_r),
        ("riser", ris_l, ris_r),
    ]
    layer_targets = dict(LAYER_TARGET_RMS)
    layer_targets.update(PROFILE.get("layer_targets", {}))
    layer_info = {}
    for name, bl, br in layers:
        r = rms_of([bl, br])
        target = db2lin(layer_targets[name])
        g = target / r if r > 0.0 else 0.0
        layer_info[name] = {"raw_rms_dbfs": round(dbfs(r), 2),
                            "target_rms_dbfs": layer_targets[name],
                            "applied_gain_db": round(20.0 * LOG10(g), 2)}
        for i in range(N):
            left[i] += bl[i] * g
            right[i] += br[i] * g

    # 首 0.05s 淡入、末 0.4s 淡出
    fi = int(0.05 * SR)
    for i in range(fi):
        g = i / fi
        left[i] *= g
        right[i] *= g
    fo = int(0.4 * SR)
    for i in range(fo):
        g = 0.5 - 0.5 * COS(PI * (i + 1) / fo)
        left[N - 1 - i] *= g
        right[N - 1 - i] *= g

    # 归一化到目标 RMS，再用软限幅保证 peak ≤ −6
    target_rms = db2lin(-21.0)
    r0 = rms_of([left, right])
    g0 = target_rms / r0 if r0 > 0 else 1.0
    for i in range(N):
        left[i] *= g0
        right[i] *= g0
    p1 = peak_of([left, right])
    limited = False
    limit_samples = 0
    if p1 > db2lin(-6.0):
        limited = True
        limit_samples = soft_limit_count(left, right)
        apply_soft_limiter(left, right, knee_db=-9.0, ceil_db=-6.5)
        # 限幅会略微降 RMS，补一次增益；但补的倍数要被 −6dBFS 硬上限夹住（保证不顶）
        r1 = rms_of([left, right])
        p1b = peak_of([left, right])
        g1 = target_rms / r1 if r1 > 0 else 1.0
        if p1b > 0:
            g1 = min(g1, db2lin(-6.0) / p1b)
        for i in range(N):
            left[i] *= g1
            right[i] *= g1
    rms_final = rms_of([left, right])
    peak_final = peak_of([left, right])
    clip = 0
    for buf in (left, right):
        for v in buf:
            if v >= 0.9999 or v <= -0.9999:
                clip += 1
    write_wav(BED_PATH, left, right)

    # ── manifest（含每个 cut 与 120BPM 网格的误差，方便下游对齐）
    cut_table = []
    for fr in CUT_FRAMES:
        t = fr / FPS
        beat_f = t / BEAT
        nearest_beat = round(beat_f)
        nearest_16 = round(t / S16)
        cut_table.append({
            "frame": fr,
            "sec": round(t, 6),
            "scene": dict(SCENE_FRAMES).get(fr, ""),
            "beat_float": round(beat_f, 4),
            "nearest_beat": nearest_beat,
            "nearest_beat_sec": round(nearest_beat * BEAT, 4),
            "delta_ms_vs_beat": round((t - nearest_beat * BEAT) * 1000.0, 1),
            "nearest_16th": nearest_16,
            "nearest_16th_sec": round(nearest_16 * S16, 4),
            "delta_ms_vs_16th": round((t - nearest_16 * S16) * 1000.0, 1),
        })
    section_table = []
    for sid, a, b, scene, note in SECTIONS:
        s0 = sample_at(a)
        s1 = sample_at(b)
        sl = sum(left[s0:s1])
        sec_rms = rms_of([left[s0:s1], right[s0:s1]])
        section_table.append({
            "id": sid, "from_sec": a, "to_sec": b, "scene": scene, "note": note,
            "rms_dbfs": round(dbfs(sec_rms), 2),
        })
    manifest = {
        "version": PROFILE.get("version", "v2"),
        "generator": "studio/scripts/make_music_v2.py",
        "purpose": PROFILE["purpose"],
        "format": {"sample_rate": SR, "channels": 2, "bit_depth": 16, "codec": "PCM"},
        "duration_sec": DUR,
        "tempo": {"bpm": BPM, "time_signature": "4/4", "beat_sec": BEAT,
                  "bar_sec": BAR, "sixteenth_sec": S16,
                  "total_beats": TOTAL_BEATS, "total_bars": TOTAL_BARS},
        "key": "A minor",
        "progression": {"chords": PROGRESSION,
                        "per_bar": [{"bar": i + 1, "from_sec": round(i * BAR, 3),
                                     "to_sec": round((i + 1) * BAR, 3),
                                     "chord": PROGRESSION[i]} for i in range(TOTAL_BARS)]},
        "sections": section_table,
        "cuts": cut_table,
        "impacts": impacts,
        "risers": risers,
        "sidechain": {"targets": {"pad": -4.0, "bass": -7.0}, "trigger": "kick",
                      "recovery_sec": {"pad": 0.22, "bass": 0.30}},
        "layer_mix": layer_info,
        "instruments": ["pad", "sub_bass", "kick", "snare", "clap",
                        "hat_closed", "hat_open", "arp_pluck", "bell",
                        "impact", "riser"],
        "kick_count": len(kick_times),
        "hat_count": len(hat_times),
        "kick_times_sec": kick_times,
        "hat_times_sec": hat_times,
        "levels": {
            "rms_dbfs": round(dbfs(rms_final), 2),
            "peak_dbfs": round(dbfs(peak_final), 2),
            "target_rms_dbfs": -21.0,
            "peak_ceiling_dbfs": -6.0,
            "clipped_samples": clip,
            "soft_limiter_applied": limited,
            "soft_limiter_samples": limit_samples,
            "normalize_gain_db": round(20.0 * LOG10(g0), 2),
            "fade_in_sec": 0.05,
            "fade_out_sec": 0.4,
        },
        "grid_note": PROFILE["grid_note"],
        "final_hit": PROFILE["final_hit_note"],
        "recommended_mix": {
            "music_bus_rms_dbfs": -21.0,
            "sfx_bus_rms_dbfs": -23.5,
            "final_rms_dbfs": -19.5,
            "final_peak_dbfs": -1.5,
            "note": PROFILE.get("recommended_mix_note",
                                "这组值就是 make_sfx_v2.py --music 的默认值；music 抢戏时把 music bus 降到 -22.5，或把 make_sfx_v2 的 sidechain 0.18 提到 0.25"),
            "drop_old_drone": True,
        },
        "usage": PROFILE["usage"],
    }
    if PROFILE.get("extra_manifest"):
        manifest.update(PROFILE["extra_manifest"])
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("\n完成：")
    print("  profile  %s（%d 帧 / %d 小节 / %d cuts）" % (PROFILE_NAME, int(round(DUR * FPS)), TOTAL_BARS, len(CUT_FRAMES)))
    print("  WAV      %s  %.3fs  %dHz  stereo 16bit" % (BED_PATH, N / SR, SR))
    print("  manifest %s" % MANIFEST_PATH)
    print("  电平     RMS %+.2f dBFS / peak %+.2f dBFS / clip %d / soft-limit %s"
          % (dbfs(rms_final), dbfs(peak_final), clip, limited))
    print("  节奏     %d BPM / %d 拍 / %d 小节 / kick %d / hat %d / impact %d / riser %d"
          % (BPM, TOTAL_BEATS, TOTAL_BARS, len(kick_times), len(hat_times),
             len(impacts), len(risers)))
    print("  分区 RMS " + " ".join("%s %+.1f" % (s["id"], s["rms_dbfs"]) for s in section_table))


if __name__ == "__main__":
    main()
