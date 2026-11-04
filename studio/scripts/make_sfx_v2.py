#!/usr/bin/env python3
"""
make_sfx_v2.py — dsh-reel v2 宣传片（24s / 30fps / 1920x1080）声音包生成器。

纯 Python 标准库（math / random / wave / struct / array / json / re / hashlib / pathlib），
不使用任何第三方音频库、采样或版权音乐。所有声音都是"振荡器 + 噪声 + 包络 + 轻混响"
的确定性合成结果（固定种子，可重复生成，跨机器一致）。

产物（路径相对 studio/）：
    public/audio/v2/drone.wav              24.0s 低音 bed
    public/audio/v2/sfx/<kind>.wav         15 类一次性音效
    public/audio/v2/manifest.json          每个文件时长/峰值/用途 + 解析出的事件表
    out/p1-audio-mix.wav                   按 SOUND_EVENTS 铺好的 24s 预览混音

声音设计依据（不自由发挥）：
    .research/dsh-reel-promo/reference-analysis.md §7
        —— 参考片全片只有一条 110/164.8/220.5Hz drone（1.5s 淡入、结尾淡出、4s 呼吸），
           其余全是事件驱动的一次性音效；无配乐、无 BPM。
    /tmp/xpromo/kit/xpromo/score.py
        —— wood / glass / air / bubble / sub 五种合成音色的调用方式（只借鉴音色，
           不引入 Onetake 依赖）。
    studio/src/v2/data/timeline.ts
        —— SOUND_EVENTS 是唯一事件来源：本脚本运行时用正则解析它，事件表不复制、
           不手写，保证与时间轴永远一致（解析失败直接报错，不静默降级）。

用法：
    python3 studio/scripts/make_sfx_v2.py            # 生成全部文件
    python3 studio/scripts/make_sfx_v2.py --quiet    # 只打印摘要
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import re
import struct
import wave
from array import array
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# 全局参数
# ─────────────────────────────────────────────────────────────────────────────
SR = 48000                 # 采样率（与参考片一致）
DUR = 24.0                 # 宣传片总长（秒）
FPS = 30
TOTAL_FRAMES = 720
TAU = 2.0 * math.pi
PI = math.pi

SFX_PEAK_DBFS = -12.0      # 每个音效文件的归一化峰值
DRONE_RMS_DBFS = -37.5     # drone 单独文件的 RMS（bed 级；见 manifest 的混音内电平）
MIX_RMS_DBFS = -27.0       # 预览混音目标 RMS（对齐参考片实测 −27.5）
MIX_PEAK_CEIL_DBFS = -8.05  # 预览混音峰值上限（参考片实测 −8.0，留 0.05dB 量化余量）
MIX_END_FADE_SEC = 0.10    # 混音末尾淡出（片尾静止段）

STUDIO = Path(__file__).resolve().parents[1]
AUDIO_DIR = STUDIO / "public" / "audio" / "v2"
SFX_DIR = AUDIO_DIR / "sfx"
MIX_PATH = STUDIO / "out" / "p1-audio-mix.wav"
TIMELINE_TS = STUDIO / "src" / "v2" / "data" / "timeline.ts"

SIN = math.sin
COS = math.cos
POW = math.pow
SQRT = math.sqrt
LOG10 = math.log10


# ─────────────────────────────────────────────────────────────────────────────
# 小工具：电平 / 归一化 / 读写
# ─────────────────────────────────────────────────────────────────────────────
def dbfs(amp: float) -> float:
    """线性幅度 → dBFS。"""
    return 20.0 * LOG10(amp) if amp > 0.0 else -180.0


def peak_of(buf) -> float:
    return max(max(buf), -min(buf)) if len(buf) else 0.0


def stereo_peak(left, right) -> float:
    """真正的立体声峰值 = 各声道峰值的最大值（不是 L+R 的和）。"""
    return max(peak_of(left), peak_of(right))


def rms_of(bufs) -> float:
    """多声道联合 RMS（按全部样本的均方根计算）。"""
    total = 0.0
    count = 0
    for b in bufs:
        for v in b:
            total += v * v
        count += len(b)
    return SQRT(total / count) if count else 0.0


def normalize_rms(buf, target_dbfs: float = DRONE_RMS_DBFS):
    r = rms_of([buf])
    if r < 1e-12:
        return list(buf)
    g = POW(10.0, target_dbfs / 20.0) / r
    return [v * g for v in buf]


def write_wav(path: Path, left, right) -> None:
    """写 48kHz / stereo / 16-bit WAV（写前做一次安全限幅）。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    n = len(left)
    frames = array("h")
    append = frames.append
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
        append(int(lv * 32767.0 + 0.5) if lv >= 0.0 else int(lv * 32767.0 - 0.5))
        append(int(rv * 32767.0 + 0.5) if rv >= 0.0 else int(rv * 32767.0 - 0.5))
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames.tobytes())


def read_wav(path: Path):
    """读 16-bit WAV → (left, right, sample_rate, channels)，用于回读校验。"""
    with wave.open(str(path), "rb") as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        sw = w.getsampwidth()
        raw = w.readframes(w.getnframes())
    if ch != 2 or sw != 2:
        raise SystemExit(f"{path} 不是 16-bit stereo（ch={ch}, sampwidth={sw}）")
    ints = struct.unpack("<%dh" % (len(raw) // 2), raw)
    left = [ints[i] / 32768.0 for i in range(0, len(ints), 2)]
    right = [ints[i] / 32768.0 for i in range(1, len(ints), 2)]
    return left, right, sr, ch


# ─────────────────────────────────────────────────────────────────────────────
# DSP 原语（单声道浮点列表；全部 O(n)，无第三方库）
# ─────────────────────────────────────────────────────────────────────────────
def rng_for(name: str) -> random.Random:
    """按名字派生固定种子，保证每次生成的噪声完全一致。"""
    digest = hashlib.md5(name.encode("utf-8")).hexdigest()
    return random.Random(int(digest[:12], 16))


def one_pole_lp(buf, cutoff: float, passes: int = 1):
    """一阶低通（可级联），用来给噪声/合成音去毛刺。"""
    a = 1.0 - math.exp(-TAU * cutoff / SR)
    out = list(buf)
    for _ in range(passes):
        y = 0.0
        for i, x in enumerate(out):
            y += a * (x - y)
            out[i] = y
    return out


def one_pole_hp(buf, cutoff: float, passes: int = 1):
    """一阶高通（去直流/超低频堆积）。a = RC/(RC+dt)，低频截止时 a 接近 1。"""
    a = 1.0 / (1.0 + TAU * cutoff / SR)
    out = list(buf)
    for _ in range(passes):
        y = 0.0
        prev_x = 0.0
        for i, x in enumerate(out):
            y = a * (y + x - prev_x)
            prev_x = x
            out[i] = y
    return out


def band_sweep(buf, f0: float, f1: float, q: float = 1.2, curve: float = 1.0):
    """Chamberlin 状态变量带通，中心频率从 f0 指数扫到 f1（做 air/whoosh）。"""
    n = len(buf)
    if n == 0:
        return []
    n1 = float(max(1, n - 1))
    inv_q = 1.0 / max(q, 0.2)
    low = 0.0
    band = 0.0
    out = [0.0] * n
    ratio = (f1 / f0) if f0 > 0.0 else 1.0
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


def reverb_tail(mono, decay: float = 0.34, damp: float = 3600.0):
    """Schroeder-lite：2 个反馈梳状 + 1 个全通 + 低通，生成单声道混响尾。"""
    n = len(mono)
    if n == 0:
        return []
    combs = []
    for delay_s in (0.0297, 0.0371):
        d = int(delay_s * SR)
        line = [0.0] * n
        for i in range(n):
            v = mono[i]
            if i >= d:
                v += decay * line[i - d]
            line[i] = v
        combs.append(line)
    tail = [(combs[0][i] + combs[1][i]) * 0.5 for i in range(n)]
    tail = one_pole_lp(tail, damp, passes=1)
    # 全通 7.1ms
    ap = int(0.0071 * SR)
    a = 0.5
    y = [0.0] * n
    for i in range(n):
        v = tail[i]
        if i >= ap:
            y[i] = -a * v + tail[i - ap] + a * y[i - ap]
        else:
            y[i] = -a * v
    return y


def stereoize(mono, wet: float = 0.0, wet_shift_l: float = 0.0131, wet_shift_r: float = 0.0197):
    """单声道 → 立体声：干声居中，湿声左右错开做宽度（单声道兼容，不会反相）。"""
    n = len(mono)
    if wet <= 0.0:
        return list(mono), list(mono)
    tail = reverb_tail(mono)
    dl = int(wet_shift_l * SR)
    dr = int(wet_shift_r * SR)
    dry = 1.0 - wet
    left = [0.0] * n
    right = [0.0] * n
    for i in range(n):
        v = mono[i]
        left[i] = v * dry + (tail[i - dl] * wet if i >= dl else 0.0)
        right[i] = v * dry + (tail[i - dr] * wet if i >= dr else 0.0)
    return left, right


def ease_in_out(u: float) -> float:
    return u * u * (3.0 - 2.0 * u)


def tame(buf, cutoff: float = 7000.0, passes: int = 2):
    """给噪声/气声类音效做高频收束，避免 6k+ 嘶声刺耳。"""
    return one_pole_lp(buf, cutoff, passes=passes)


def edge_fade(left, right, fade_in_ms: float = 1.0, fade_out_ms: float = 4.0):
    """给每个音效首尾加极短淡入淡出，避免 WAV 边界出现台阶（爆音）。"""
    n = len(left)
    ni = min(n, max(1, int(fade_in_ms * SR / 1000.0)))
    no = min(n, max(1, int(fade_out_ms * SR / 1000.0)))
    for i in range(ni):
        g = i / float(ni)
        left[i] *= g
        right[i] *= g
    for i in range(no):
        g = i / float(no)
        left[n - 1 - i] *= g
        right[n - 1 - i] *= g
    return left, right


def resample_pitch(mono, factor: float):
    """线性插值重采样 = 变调（factor>1 更高更短），用于同一音效的多次触发微调。"""
    if abs(factor - 1.0) < 1e-4 or len(mono) < 2:
        return list(mono)
    n_out = max(2, int(len(mono) / factor))
    out = [0.0] * n_out
    for i in range(n_out):
        pos = i * factor
        i0 = int(pos)
        frac = pos - i0
        if i0 + 1 < len(mono):
            out[i] = mono[i0] * (1.0 - frac) + mono[i0 + 1] * frac
        else:
            out[i] = mono[-1]
    return out


# ─────────────────────────────────────────────────────────────────────────────
# 五种基础音色（对应 score.py 的 wood / glass / air / bubble / sub）
# ─────────────────────────────────────────────────────────────────────────────
def tone_wood(freq: float, dur: float, click: float = 0.22, body: float = 1.0):
    """木质敲击：基频 + 两个非谐分音 + 极短噪声咔哒。"""
    n = int(dur * SR)
    rnd = rng_for("wood:%.1f" % freq)
    k1 = 5.5 / dur
    k2 = 11.0 / dur
    k3 = 18.0 / dur
    out = [0.0] * n
    attack = int(0.0009 * SR) + 1
    for i in range(n):
        t = i / SR
        env1 = math.exp(-k1 * t)
        env2 = math.exp(-k2 * t)
        env3 = math.exp(-k3 * t)
        s = (
            SIN(TAU * freq * t) * env1
            + 0.32 * SIN(TAU * freq * 2.71 * t + 0.6) * env2
            + 0.11 * SIN(TAU * freq * 4.13 * t + 1.1) * env3
        )
        s *= body
        if i < attack:
            s *= i / attack
        if click > 0.0 and i < int(0.004 * SR):
            s += (rnd.random() * 2.0 - 1.0) * click * (1.0 - i / (0.004 * SR))
        out[i] = s
    # 尾部 5ms 收干净，避免爆音
    tail = min(n, int(0.005 * SR))
    for i in range(tail):
        out[n - tail + i] *= 1.0 - i / tail
    return out


def tone_glass(freq: float, dur: float, amp: float = 1.0, shimmer: float = 0.15):
    """玻璃/铃：三个近似谐波分音 + 轻微颤音 + 软起音。"""
    n = int(dur * SR)
    k1 = 3.2 / dur
    k2 = 5.0 / dur
    k3 = 7.4 / dur
    out = [0.0] * n
    attack = int(0.0016 * SR) + 1
    for i in range(n):
        t = i / SR
        vib = 1.0 + 0.0008 * SIN(TAU * 5.3 * t)
        s = (
            SIN(TAU * freq * vib * t) * math.exp(-k1 * t)
            + 0.46 * SIN(TAU * freq * 2.76 * t + 0.35) * math.exp(-k2 * t)
            + 0.20 * SIN(TAU * freq * 5.40 * t + 0.9) * math.exp(-k3 * t)
        )
        s *= amp
        if i < attack:
            s *= i / attack
        out[i] = s
    tail = min(n, int(0.008 * SR))
    for i in range(tail):
        out[n - tail + i] *= 1.0 - i / tail
    if shimmer > 0.0:
        # 起音瞬间的极轻气声，让铃"有击打点"
        rnd = rng_for("glass:%.1f" % freq)
        nz = [rnd.random() * 2.0 - 1.0 for _ in range(n)]
        nz = one_pole_lp(nz, 5200.0)
        for i in range(n):
            out[i] += nz[i] * shimmer * math.exp(-i / (0.012 * SR))
    return out


def tone_air(dur: float, f0: float, f1: float, q: float = 1.3, shape: float = 1.0,
             curve: float = 1.0, seed: str = "air"):
    """气流：白噪声过扫描带通，包络 sin^shape（whoosh / riser / 窗口生长）。"""
    n = int(dur * SR)
    rnd = rng_for(seed)
    raw = [rnd.random() * 2.0 - 1.0 for _ in range(n)]
    band = band_sweep(raw, f0, f1, q=q, curve=curve)
    out = [0.0] * n
    for i in range(n):
        u = i / float(max(1, n - 1))
        env = SIN(PI * u) ** shape
        out[i] = band[i] * env
    return out


def tone_bubble(freq: float, dur: float, rise: float = 2.2):
    """气泡/水泡：音高快速上滑 + 短包络 + 一点水声噪声。"""
    n = int(dur * SR)
    rnd = rng_for("bubble:%.1f" % freq)
    out = [0.0] * n
    phase = 0.0
    attack = int(0.004 * SR) + 1
    for i in range(n):
        t = i / SR
        u = t / dur
        f = freq * (1.0 + (rise - 1.0) * (1.0 - math.exp(-4.0 * u)))
        phase += TAU * f / SR
        env = math.exp(-5.2 * u) if u > 0.35 else ease_in_out(u / 0.35) if u < 0.35 else 1.0
        s = SIN(phase) * env
        if i < int(0.006 * SR):
            s += (rnd.random() * 2.0 - 1.0) * 0.07 * (1.0 - i / (0.006 * SR))
        out[i] = s
    for i in range(n):
        u = i / float(max(1, n - 1))
        out[i] *= 1.0 - u ** 6  # 收尾
    return out


def tone_sub(freq: float, dur: float, drive: float = 1.0):
    """超低冲击：起音瞬间音高下滑，做落地的"重量"。"""
    n = int(dur * SR)
    out = [0.0] * n
    phase = 0.0
    attack = int(0.002 * SR) + 1
    for i in range(n):
        t = i / SR
        u = t / dur
        f = freq * (1.0 + 0.45 * math.exp(-7.0 * u))
        phase += TAU * f / SR
        env = math.exp(-3.6 * u)
        s = SIN(phase) * env * drive
        if i < attack:
            s *= i / attack
        out[i] = s
    return out


def noise_burst(dur: float, cutoff: float, amp: float = 0.25, seed: str = "nb"):
    n = int(dur * SR)
    rnd = rng_for(seed)
    raw = [rnd.random() * 2.0 - 1.0 for _ in range(n)]
    raw = one_pole_lp(raw, cutoff)
    out = [0.0] * n
    for i in range(n):
        out[i] = raw[i] * amp * math.exp(-6.0 * i / float(n))
    return out


def mixdown(*bufs):
    """把若干等长（或不等长）单声道缓冲叠加，返回最长长度缓冲。"""
    if not bufs:
        return []
    n = max(len(b) for b in bufs)
    out = [0.0] * n
    for b in bufs:
        for i, v in enumerate(b):
            out[i] += v
    return out


def place(base, mono, offset_sec: float):
    """把 mono 叠加到 base 的 offset 处（就地修改 base）。"""
    start = int(round(offset_sec * SR))
    n = len(base)
    m = len(mono)
    if start >= n:
        return base
    end = min(n, start + m)
    for i in range(start, end):
        base[i] += mono[i - start]
    return base


# ─────────────────────────────────────────────────────────────────────────────
# 15 类音效（名字与 timeline.ts 的 SfxKind 一一对应）
# ─────────────────────────────────────────────────────────────────────────────
def sfx_key():
    """键盘 tick（0.10s）：短 wood，混音时会按次数微调音高。"""
    x = tone_wood(1560.0, 0.10, click=0.28)
    x = one_pole_hp(x, 120.0)
    return x, 0.0


def sfx_riser():
    """拼合/装机前的上冲 riser（1.00s）：气流上扫 + 正弦上滑，音量渐强。"""
    air = tone_air(1.00, 240.0, 2600.0, q=1.6, shape=0.7, curve=1.4, seed="riser-air")
    n = len(air)
    sine = [0.0] * n
    phase = 0.0
    for i in range(n):
        u = i / float(max(1, n - 1))
        f = 110.0 * POW(3.0, u)
        phase += TAU * f / SR
        sine[i] = SIN(phase) * 0.35 * u * u
    x = mixdown(air, sine)
    x = one_pole_hp(x, 30.0)
    x = tame(x, 6500.0, passes=2)
    return x, 0.22


def sfx_whoosh():
    """快速气流（0.62s）：上扫后收回，用于窗口生长 / 卡片提起 / 转场。"""
    x = tone_air(0.62, 420.0, 2200.0, q=1.2, shape=1.15, curve=1.25, seed="whoosh-air")
    x = one_pole_hp(x, 90.0)
    x = tame(x, 6000.0, passes=2)
    return x, 0.20


def sfx_land_big():
    """大落地（0.55s）：sub 55Hz + wood 160 + 低频噪声 thump。"""
    x = mixdown(
        tone_sub(55.0, 0.55, drive=1.0),
        tone_wood(160.0, 0.28, click=0.10, body=0.55),
        noise_burst(0.09, 220.0, amp=0.30, seed="land-big-nb"),
    )
    x = one_pole_hp(x, 22.0)
    return x, 0.12


def sfx_land_small():
    """小落地（0.22s）：wood 320 + 很轻的 sub。"""
    x = mixdown(
        tone_wood(320.0, 0.22, click=0.12, body=0.85),
        tone_sub(85.0, 0.12, drive=0.35),
    )
    return x, 0.06


def sfx_tile():
    """踩格子（0.26s）：wood 260 + 极短 glass 和弦（混音时换音高）。"""
    x = mixdown(
        tone_wood(260.0, 0.26, click=0.14, body=0.9),
        [v * 0.18 for v in tone_glass(1046.5, 0.26, amp=0.6)],
        [v * 0.12 for v in tone_glass(1568.0, 0.26, amp=0.5)],
    )
    return x, 0.10


def sfx_window():
    """窗口/面板生长（0.50s）：气流 + 392Hz glass 点一下。"""
    air = tone_air(0.50, 300.0, 1500.0, q=1.1, shape=1.0, curve=1.2, seed="window-air")
    gl = tone_glass(392.0, 0.40, amp=0.5)
    x = mixdown(air, [0.0] * int(0.10 * SR) + gl)
    x = tame(x, 6500.0, passes=2)
    return x, 0.18


def sfx_enter():
    """回车确认（0.32s）：wood 220 + glass 659。"""
    x = mixdown(
        tone_wood(220.0, 0.30, click=0.15, body=0.9),
        [0.0] * int(0.035 * SR) + [v * 0.35 for v in tone_glass(659.25, 0.30, amp=0.7)],
    )
    return x, 0.10


def sfx_result():
    """结果弹入（0.24s）：620Hz 气泡 blip，像 UI pop。"""
    x = tone_bubble(620.0, 0.24, rise=1.9)
    return x, 0.08


def sfx_click():
    """按压 click（0.09s）：极短 wood 2200 + 噪声点。"""
    x = mixdown(
        tone_wood(2200.0, 0.09, click=0.35, body=0.8),
        noise_burst(0.03, 6000.0, amp=0.18, seed="click-nb"),
    )
    return x, 0.04


def sfx_chime():
    """成功 chime（1.10s）：两部分 glass（784 / 1175）+ 轻 sub 支撑。"""
    a = tone_glass(784.0, 1.10, amp=1.0)
    b = [0.0] * int(0.06 * SR) + [v * 0.62 for v in tone_glass(1174.7, 1.00, amp=1.0)]
    x = mixdown(a, b, [v * 0.18 for v in tone_sub(98.0, 0.30, drive=0.6)])
    return x, 0.26


def sfx_tool_pop():
    """工具 chip 点亮（0.20s）：气泡 480 + 极短高 wood。"""
    x = mixdown(
        tone_bubble(480.0, 0.20, rise=2.6),
        [0.0] * int(0.005 * SR) + [v * 0.30 for v in tone_wood(1800.0, 0.07, click=0.05)],
    )
    return x, 0.06


def sfx_spout():
    """喷水（0.50s）：三颗气泡 + 一层水声噪声。"""
    x = [0.0] * int(0.50 * SR)
    for j, (freq, off) in enumerate(((560.0, 0.0), (700.0, 0.055), (860.0, 0.115))):
        place(x, tone_bubble(freq, 0.30, rise=1.7), off)
    shimmer = tame(tone_air(0.45, 1500.0, 3200.0, q=0.9, shape=1.4, seed="spout-air"), 6000.0, passes=2)
    for i, v in enumerate(shimmer):
        if i < len(x):
            x[i] += v * 0.15
    return x, 0.18


def sfx_hum():
    """渲染/低鸣（1.20s）：55/82.5/110Hz 长音 + 低通噪声，慢起慢收。

    同时用作 S1 的 "drone in" 和 S7 的 "render hum"。
    """
    n = int(1.20 * SR)
    rnd = rng_for("hum")
    raw = [rnd.random() * 2.0 - 1.0 for _ in range(n)]
    raw = one_pole_lp(raw, 220.0, passes=2)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        u = i / float(max(1, n - 1))
        env = 1.0
        if u < 0.22:
            env = ease_in_out(u / 0.22)
        elif u > 0.62:
            env = ease_in_out((1.0 - u) / 0.38)
        trem = 1.0 + 0.06 * SIN(TAU * 2.5 * t)
        out[i] = (
            0.55 * SIN(TAU * 55.0 * t)
            + 0.30 * SIN(TAU * 82.5 * t + 0.4)
            + 0.15 * SIN(TAU * 110.0 * t + 0.9)
            + 0.02 * raw[i] * 6.0
        ) * env * trem
    return out, 0.10


def sfx_title():
    """片尾标题（1.10s）：sub 冲击 + 523/784 glass（沿用参考片片尾音高）。"""
    x = mixdown(
        tone_sub(55.0, 0.55, drive=0.9),
        tone_glass(523.25, 1.10, amp=1.0),
        [0.0] * int(0.10 * SR) + [v * 0.55 for v in tone_glass(783.99, 1.00, amp=1.0)],
        tame(noise_burst(0.18, 3200.0, amp=0.16, seed="title-nb"), 6000.0, passes=2),
    )
    return x, 0.30


# kind → (builder, 说明, 混音时是否做音高循环)
SFX_SPECS = {
    "key": (sfx_key, "键盘逐字 tick（S1 打 dsh / S4 打 reel-studio / S6 打字 / S9 安装命令）", (1.00, 1.12, 1.24, 1.36)),
    "riser": (sfx_riser, "拼合/装机前的上冲 riser（S1→S2、S5 安装）", None),
    "whoosh": (sfx_whoosh, "气流转场：窗口生长 / 卡片提起 / 回到会话 / 扫描", None),
    "landBig": (sfx_land_big, "大落地：鲸鱼砸落 / 海报落桌（带震屏）", None),
    "landSmall": (sfx_land_small, "小落地：踩键盘 / 视频帧落桌", None),
    "tile": (sfx_tile, "踩格子：Dock/胶片条逐格点亮（6 格）", (1.00, 1.05, 1.10, 1.16, 1.22, 1.28)),
    "window": (sfx_window, "窗口/面板生长：市场面板、详情页", None),
    "enter": (sfx_enter, "回车确认：发送 prompt", None),
    "result": (sfx_result, "结果弹入：搜索结果刷新出一张卡", None),
    "click": (sfx_click, "按压 click：点「安装」", None),
    "chime": (sfx_chime, "成功 chime：已安装 / 安装完成", None),
    "toolPop": (sfx_tool_pop, "工具 chip 点亮：reel_scan / reel_plan / reel_render", None),
    "spout": (sfx_spout, "鲸鱼喷水（全片 3 次以内）", None),
    "hum": (sfx_hum, "渲染低鸣 / 开场 drone 进入", None),
    "title": (sfx_title, "片尾标题 chime", None),
}


# ─────────────────────────────────────────────────────────────────────────────
# drone（24s）—— 规格严格照参考片实测
# ─────────────────────────────────────────────────────────────────────────────
def build_drone_mono():
    n = int(SR * DUR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        # 三音：A2 + E3(略偏高) + A3，与参考片 score.py 完全一致
        v = 0.5 * (SIN(TAU * 110.0 * t) + 0.6 * SIN(TAU * 164.8 * t) + 0.4 * SIN(TAU * 220.5 * t))
        fade_in = min(1.0, t / 1.5)
        fade_out = min(1.0, (DUR - t) / 0.8)
        breath = 0.55 + 0.45 * (SIN(TAU * t / 8.0) ** 2)  # sin² 项，4s 一次呼吸
        out[i] = v * fade_in * fade_out * breath
    out = one_pole_lp(out, 900.0, passes=2)  # 低通 ~900Hz（参考片同款处理）
    out = normalize_rms(out, DRONE_RMS_DBFS)
    # 立体声：右声道用 1.7ms 延迟做极轻宽度（单声道兼容）
    d = 83
    right = [0.0] * n
    for i in range(n):
        right[i] = 0.94 * out[i] + (0.06 * out[i - d] if i >= d else 0.0)
    return out, right


# ─────────────────────────────────────────────────────────────────────────────
# 解析 timeline.ts 的 SOUND_EVENTS（唯一事件来源）
# ─────────────────────────────────────────────────────────────────────────────
EVENT_RE = re.compile(
    r"\{\s*frame:\s*(\d+)\s*,\s*kind:\s*'([A-Za-z_]+)'\s*"
    r"(?:,\s*gain:\s*(-?[0-9.]+))?"
    r"(?:,\s*note:\s*'([^']*)')?\s*\}"
)


def load_events(timeline_path: Path = TIMELINE_TS):
    if not timeline_path.is_file():
        raise SystemExit(f"找不到 timeline: {timeline_path}")
    text = timeline_path.read_text(encoding="utf-8")
    start = text.find("SOUND_EVENTS")
    if start < 0:
        raise SystemExit("timeline.ts 里没有 SOUND_EVENTS")
    block = text[start:]
    end = block.find("];")
    if end > 0:
        block = block[: end + 2]
    events = []
    for m in EVENT_RE.finditer(block):
        frame = int(m.group(1))
        kind = m.group(2)
        gain = float(m.group(3)) if m.group(3) else 1.0
        note = m.group(4) or ""
        if kind not in SFX_SPECS:
            raise SystemExit(f"timeline.ts 出现了未知音效类型 '{kind}'（frame {frame}）")
        if not (0 <= frame <= TOTAL_FRAMES):
            raise SystemExit(f"事件帧号越界: {frame}")
        events.append({"frame": frame, "time_sec": round(frame / float(FPS), 4),
                       "kind": kind, "gain": gain, "note": note})
    events.sort(key=lambda e: (e["frame"], e["kind"]))
    raw_count = len(re.findall(r"\{frame:", block))
    if raw_count != len(events):
        raise SystemExit(
            f"timeline.ts 解析对不上：声明 {raw_count} 个事件，正则只认出 {len(events)} 个"
            "（格式变了？请检查 EVENT_RE）")
    if not events:
        raise SystemExit("SOUND_EVENTS 解析结果为空——正则可能需要跟着 timeline.ts 更新")
    return events


# ─────────────────────────────────────────────────────────────────────────────
# 主流程
# ─────────────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="生成 dsh-reel v2 宣传片声音包（纯 Python 合成）")
    ap.add_argument("--quiet", action="store_true", help="只打印摘要")
    ap.add_argument("--timeline", default=str(TIMELINE_TS),
                    help="带 SOUND_EVENTS 的时间轴 TS 文件（默认 v2 campaign 的 timeline.ts）")
    ap.add_argument("--mix", default=str(MIX_PATH), help="预览混音输出 WAV 路径")
    ap.add_argument("--manifest", default=str(AUDIO_DIR / "manifest.json"), help="manifest 输出路径")
    args = ap.parse_args()
    say = (lambda *a, **k: None) if args.quiet else print

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    SFX_DIR.mkdir(parents=True, exist_ok=True)

    # 1) drone ---------------------------------------------------------------
    say("[1/4] 合成 drone（24.0s / 110+164.8+220.5Hz / 900Hz LP / 4s 呼吸）…")
    d_left, d_right = build_drone_mono()
    drone_path = AUDIO_DIR / "drone.wav"
    write_wav(drone_path, d_left, d_right)
    drone_stats = {
        "duration_sec": round(len(d_left) / SR, 4),
        "peak_dbfs": round(dbfs(stereo_peak(d_left, d_right)), 2),
        "rms_dbfs": round(dbfs(rms_of([d_left, d_right])), 2),
    }
    say("      drone  peak %+.1f dBFS  RMS %+.1f dBFS" %
        (drone_stats["peak_dbfs"], drone_stats["rms_dbfs"]))

    # 2) 15 类音效 ------------------------------------------------------------
    say("[2/4] 合成 %d 类事件音效…" % len(SFX_SPECS))
    sfx_stereo = {}
    for kind, (builder, _purpose, _pitches) in SFX_SPECS.items():
        mono, wet = builder()
        left, right = stereoize(mono, wet=wet)
        left, right = edge_fade(left, right)
        # 立体声峰值归一化到 −12 dBFS（在 stereoize 之后做，文件峰值即真值）
        p = stereo_peak(left, right)
        if p > 1e-12:
            g = POW(10.0, SFX_PEAK_DBFS / 20.0) / p
            left = [v * g for v in left]
            right = [v * g for v in right]
        path = SFX_DIR / f"{kind}.wav"
        write_wav(path, left, right)
        sfx_stereo[kind] = (left, right)
        say("      %-10s %5.2fs  peak %+.1f dBFS  wet %.0f%%" %
            (kind, len(left) / SR, SFX_PEAK_DBFS, wet * 100))

    # 3) 预览混音 -------------------------------------------------------------
    say("[3/4] 按 timeline.ts 的 SOUND_EVENTS 铺 24s 预览混音…")
    events = load_events(Path(args.timeline))
    n = int(SR * DUR)
    left = [0.0] * n
    right = [0.0] * n
    # drone 铺底
    for i in range(n):
        left[i] = d_left[i]
        right[i] = d_right[i]
    # 同种音效的循环计数（用于 key/tile 的音高变化，模仿参考片 wood 音高 1500+180*i）
    counters = {}
    placed = 0
    for ev in events:
        kind = ev["kind"]
        sl, sr_ = sfx_stereo[kind]
        pitches = SFX_SPECS[kind][2]
        if pitches:
            idx = counters.get(kind, 0)
            counters[kind] = idx + 1
            f = pitches[idx % len(pitches)]
            sl = resample_pitch(sl, f)
            sr_ = resample_pitch(sr_, f)
        # 直接按帧落位：48000/30 = 1600 samples/帧，事件与视频帧零误差对齐
        start = int(round(ev["frame"] * SR / FPS))
        gain = ev["gain"]
        m = len(sl)
        if start >= n:
            continue
        end = min(n, start + m)
        for i in range(start, end):
            j = i - start
            left[i] += sl[j] * gain
            right[i] += sr_[j] * gain
        placed += 1

    # 整体归一化：目标 RMS −27 dBFS，峰值不超过 −8 dBFS
    rms_raw = rms_of([left, right])
    peak_raw = stereo_peak(left, right)
    gain_rms = POW(10.0, ((MIX_RMS_DBFS - dbfs(rms_raw)) / 20.0))
    gain_peak = POW(10.0, ((MIX_PEAK_CEIL_DBFS - dbfs(peak_raw)) / 20.0))
    gain = min(gain_rms, gain_peak)
    for i in range(n):
        left[i] *= gain
        right[i] *= gain
    # 末尾 100ms 淡到 0：片尾最后 0.8s 本就是"静止淡出"，同时兜住 chime 尾巴越过 24.0s 的截断
    fade_n = int(MIX_END_FADE_SEC * SR)
    for i in range(fade_n):
        g = 0.5 - 0.5 * COS(PI * (i + 1) / fade_n)
        left[n - 1 - i] *= g
        right[n - 1 - i] *= g
    mix_rms = dbfs(rms_of([left, right]))
    mix_peak = dbfs(stereo_peak(left, right))
    mix_path = Path(args.mix)
    mix_path.parent.mkdir(parents=True, exist_ok=True)
    write_wav(mix_path, left, right)
    say("      原始 RMS %+.1f dBFS / peak %+.1f dBFS → 增益 %+.2f dB（限幅由 %s 决定）" %
        (dbfs(rms_raw), dbfs(peak_raw), 20.0 * LOG10(gain),
         "RMS 目标" if gain_rms <= gain_peak else "峰值上限"))
    say("      混音 RMS %+.1f dBFS / peak %+.1f dBFS / %d 事件" %
        (mix_rms, mix_peak, placed))

    # 4) manifest -------------------------------------------------------------
    say("[4/4] 写 manifest.json…")
    files = {}
    files["drone"] = {
        "file": "drone.wav",
        **drone_stats,
        "channels": 2,
        "sample_rate": SR,
        "purpose": "全片低音 bed：110/164.8/220.5Hz 三音，900Hz 低通，1.5s 淡入 / 最后 0.8s 淡出 / 4s sin² 呼吸（参考片 score.py 同款）",
    }
    for kind, (builder, purpose, pitches) in SFX_SPECS.items():
        fl, fr = sfx_stereo[kind]
        files[kind] = {
            "file": f"sfx/{kind}.wav",
            "duration_sec": round(len(fl) / SR, 4),
            "peak_dbfs": SFX_PEAK_DBFS,
            "rms_dbfs": round(dbfs(rms_of([fl, fr])), 2),
            "channels": 2,
            "sample_rate": SR,
            "purpose": purpose,
        }
        if pitches:
            files[kind]["pitch_cycle"] = list(pitches)
            files[kind]["pitch_cycle_note"] = (
                "同一音效多次触发时，混音脚本按此系数线性插值重采样做音高变化"
                "（模仿参考片 wood 音高 1500+180*i 的手法），文件本身只有一个")
    manifest = {
        "version": "v2",
        "generator": "studio/scripts/make_sfx_v2.py",
        "generated_note": "纯 Python 标准库合成，无第三方采样/音乐，固定种子可重复生成",
        "format": {"sample_rate": SR, "channels": 2, "bit_depth": 16, "codec": "PCM"},
        "video": {"duration_sec": DUR, "fps": FPS, "total_frames": TOTAL_FRAMES,
                  "resolution": "1920x1080"},
        "levels": {
            "sfx_peak_dbfs": SFX_PEAK_DBFS,
            "drone_rms_dbfs": DRONE_RMS_DBFS,
            "drone_in_mix_rms_dbfs": round(drone_stats["rms_dbfs"] + 20.0 * LOG10(gain), 2),
            "mix_rms_dbfs": round(mix_rms, 2),
            "mix_peak_dbfs": round(mix_peak, 2),
            "master_gain_db": round(20.0 * LOG10(gain), 2),
            "master_limit": ("RMS 目标" if gain_rms <= gain_peak else "峰值上限"),
            "mix_end_fade_sec": MIX_END_FADE_SEC,
            "note_chime_overrun": "最后一个 chime 事件在 frame 690 / 23.0s，文件 1.1s，会越过 24.0s 约 0.1s；混音已在末尾 100ms 淡出，若分轨摆放请同样处理",
            "reference_film_rms_dbfs": -27.5,
            "reference_film_peak_dbfs": -8.0,
        },
        "files": files,
        "mix": {
            "file": str(mix_path),
            "duration_sec": round(n / SR, 4),
            "frame_samples": SR // FPS,
            "event_count": placed,
            "events_source": f"{Path(args.timeline).name} :: SOUND_EVENTS（运行时解析，未复制）",
        },
        "events": events,
    }
    manifest_path = Path(args.manifest)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    say("      %s" % manifest_path)

    # 5) 回读校验：确认落盘 WAV 的采样率/声道/时长/峰值都能被 ffprobe 级工具读出来
    checked = 0
    for label, path, expect_peak in (
        ("drone", drone_path, drone_stats["peak_dbfs"]),
        ("mix", MIX_PATH, mix_peak),
        *[(k, SFX_DIR / f"{k}.wav", SFX_PEAK_DBFS) for k in SFX_SPECS],
    ):
        l, r, sr, ch = read_wav(path)
        if sr != SR or ch != 2:
            raise SystemExit(f"回读 {label}: 采样率/声道不对（{sr}Hz/{ch}ch）")
        got_peak = dbfs(stereo_peak(l, r))
        if abs(got_peak - expect_peak) > 0.8:
            raise SystemExit(f"回读 {label}: 峰值 {got_peak:+.2f} dBFS 与目标 {expect_peak:+.2f} 偏差过大")
        checked += 1
    say("      回读校验 %d 个文件 OK（48kHz / stereo / 16-bit）" % checked)

    print("\n完成：")
    print("  drone   %s  %.2fs  peak %+.1f / RMS %+.1f dBFS" %
          (drone_path, drone_stats["duration_sec"], drone_stats["peak_dbfs"], drone_stats["rms_dbfs"]))
    print("  sfx     %d 个 → %s" % (len(SFX_SPECS), SFX_DIR))
    print("  manifest %s" % manifest_path)
    print("  mix     %s  %.2fs  RMS %+.1f / peak %+.1f dBFS  (%d events)" %
          (mix_path, n / SR, mix_rms, mix_peak, placed))


if __name__ == "__main__":
    main()
