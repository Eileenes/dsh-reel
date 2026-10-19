import math
import random
import struct
import wave
from array import array
from pathlib import Path

SR = 48000
DUR = 33.0
N = int(SR * DUR)
random.seed(7)

L = array('f', [0.0]) * N
R = array('f', [0.0]) * N

CHORDS = [
    [110.00, 130.81, 164.81],   # Am
    [87.31, 110.00, 130.81],    # F
    [130.81, 164.81, 196.00],   # C
    [98.00, 123.47, 146.83],    # G
]
BAR = 2.0
TRANSITIONS = [3.5, 7.5, 12.5, 18.5, 23.5, 28.5]

for i in range(N):
    t = i / SR
    bar_i = int(t / BAR) % 4
    chord = CHORDS[bar_i]
    bt = t % BAR
    penv = min(1.0, bt / 0.35) * min(1.0, (BAR - bt) / 0.5)

    pad = 0.0
    for k, f in enumerate(chord):
        pad += math.sin(2.0 * math.pi * f * t + k * 0.7)
    pad *= penv * 0.030

    phase = t % 0.25
    bass = math.sin(2.0 * math.pi * (chord[0] / 2.0) * t) * math.exp(-phase * 8.0) * 0.085

    pi = int(t / 0.125)
    pp = t % 0.125
    pf = chord[(pi * 2 + 1) % 3] * 2.0
    pluck = math.sin(2.0 * math.pi * pf * t) * math.exp(-pp * 14.0) * 0.028
    pan = 0.35 if pi % 2 == 0 else 0.65

    kp = t % 0.5
    k_env = math.exp(-kp * 16.0)
    kf = 48.0 + 70.0 * math.exp(-kp * 30.0)
    kick = math.sin(2.0 * math.pi * kf * kp) * k_env * 0.16

    hp = (t - 0.125) % 0.25
    hat = (random.random() * 2.0 - 1.0) * math.exp(-hp * 90.0) * 0.018

    who = 0.0
    for tr in TRANSITIONS:
        dt = t - tr
        if 0.0 <= dt < 0.6:
            who += (random.random() * 2.0 - 1.0) * (math.sin(math.pi * dt / 0.6) ** 2) * 0.035

    fade = min(1.0, t / 0.6) * min(1.0, (DUR - t) / 1.6)
    base = (pad + bass + kick) * fade
    pl = pluck * fade
    hh = hat * fade
    ww = who * fade
    L[i] = base + pl * (1.2 - pan) + hh * (1.2 - pan) + ww * 0.8
    R[i] = base + pl * pan + hh * pan + ww * 1.2

peak = max(max(abs(x) for x in L), max(abs(x) for x in R))
scale = 0.78 / peak if peak > 0 else 1.0

path = Path(__file__).resolve().parents[1] / 'public' / 'audio' / 'bgm.wav'
path.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(path), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i in range(N):
        l = int(max(-1.0, min(1.0, L[i] * scale)) * 32767)
        r = int(max(-1.0, min(1.0, R[i] * scale)) * 32767)
        frames += struct.pack('<hh', l, r)
    w.writeframes(bytes(frames))
print('wrote', path, 'peak', round(peak, 3), 'scale', round(scale, 3))
