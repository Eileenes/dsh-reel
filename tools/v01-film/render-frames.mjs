#!/usr/bin/env node
/**
 * render-frames.mjs — the repo's own comp renderer. No Onetake runtime required.
 *
 * The V0.1 films are authored as one deterministic HTML comp (`comp-<slug>.html`) that
 * exposes `window.__ready`, `window.__meta{dur}`, `window.__seek(t)` and — for motion
 * blur — `window.__motion(t0, t1) → CSS px travelled`. That is all a renderer needs, so
 * this script does the job with Chrome already on the machine:
 *
 *   1. launch Chrome (puppeteer-core), open the comp, await `__ready`, read `__meta.dur`
 *   2. for each frame, seek across the open shutter and average the captures in *linear*
 *      light (a screenshot is an instant; a film camera integrates while the shutter is open)
 *   3. ffmpeg: H.264 High / yuv420p / +faststart, AAC 256k when `--sfx` is given
 *
 * Sampling and the hard-cut guard mirror the reference Onetake renderer exactly, so a film
 * rendered here matches one rendered there (same 840-frame timeline, same blur):
 *
 *   - shutter angle → open_s = (shutter/360)/fps; samples are spread over [t−open_s/2, t+open_s/2]
 *   - `__motion` gives the farthest travel across that window; captures are spaced
 *     `--gap` CSS px apart, clamped to [--samples-min, --samples-max]
 *   - the first and last capture are compared first: identical → nothing moved → still frame
 *   - when one step between neighbours carries ≥3× the change of any other, that is a cut,
 *     not motion: only the side holding the frame time is integrated, so cuts stay hard
 *
 * Usage:
 *   node tools/v01-film/render-frames.mjs .research/onetake-promo/comp-<slug>.html \
 *     --out studio/out/promo-<slug>-intro-1080.mp4 --sfx studio/out/<slug>-v01-mix.wav
 *
 *   # quick slice while iterating (frames 480–540 only), no audio
 *   node tools/v01-film/render-frames.mjs comp-x.html --out /tmp/x.mp4 --from 480 --to 540
 *
 * Needs: node ≥ 18, Chrome, ffmpeg, and puppeteer-core (see --puppeteer; the DSH desktop
 * profile ships one). Nothing else — PNG decoding and the integration are below.
 */

import {existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {spawnSync, fork} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import {homedir, cpus} from 'node:os';
import {deflateSync, inflateSync} from 'node:zlib';

const SELF = fileURLToPath(import.meta.url);
/** true when executed as a CLI (not imported by a test) */
const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === SELF;

// ── CLI ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const has = (name) => argv.includes(name);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const num = (name, fallback) => {
  const v = flag(name, undefined);
  return v === undefined ? fallback : Number(v);
};

const compArg = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && argv[i - 1] !== '--gpu'));
const opts = {
  comp: compArg,
  out: flag('--out', 'draft.mp4'),
  width: num('--width', 1920),
  height: num('--height', 1080),
  fps: num('--fps', 30),
  scale: num('--scale', 1),
  shutter: num('--shutter', 180),
  samples: Math.max(2, num('--samples', 8)),
  gap: num('--gap', 6),
  samplesMin: Math.max(2, num('--samples-min', 4)),
  samplesMax: Math.max(2, num('--samples-max', 48)),
  workers: Math.max(1, num('--workers', Math.min(4, Math.max(1, cpus().length - 2)))),
  dur: flag('--dur', undefined) === undefined ? undefined : Number(flag('--dur')),
  from: Math.max(0, num('--from', 0)),
  to: flag('--to', undefined) === undefined ? undefined : Number(flag('--to')),
  sfx: flag('--sfx', undefined),
  crf: num('--crf', 16),
  recycle: num('--recycle', 150),
  keepFrames: has('--keep-frames'),
  gpu: has('--gpu'),
  continuous: has('--continuous'),
  chrome: flag('--chrome', process.env.CHROME),
  ffmpeg: flag('--ffmpeg', process.env.FFMPEG_PATH || 'ffmpeg'),
  puppeteer: flag('--puppeteer', process.env.PUPPETEER_CORE_PATH),
  framesDir: flag('--frames-dir', undefined),
  quiet: has('--quiet'),
};

if (isMain && !process.env.RENDER_FRAME_JOB && !opts.comp) {
  console.error(`用法: node tools/v01-film/render-frames.mjs <comp.html> --out <film.mp4> [选项]

  --width/--height   授权尺寸（CSS px，默认 1920×1080）
  --fps              帧率（默认 30）
  --scale            像素倍率（默认 1；2 = 3840×2160）
  --shutter          快门角度（默认 180；0 = 关掉运动模糊）
  --gap              相邻采样的最大位移（默认 6 px，仅 __motion 页面生效）
  --samples[-min/-max]  无 __motion 页面的固定张数 / 自适应上下限（8 / 4 / 48）
  --workers          并行 Chrome 进程数（默认 min(4, 核数-2)）
  --dur              覆盖 __meta.dur
  --from/--to        只渲染这段帧（调试用）
  --sfx              混入音频（wav/mp3），AAC 256k
  --crf              x264 质量（默认 16）
  --frames-dir       帧缓存目录（默认 <out 目录>/_frames）
  --chrome           Chrome 可执行文件路径
  --ffmpeg           ffmpeg 可执行文件路径（默认取 PATH 里的 ffmpeg）
  --puppeteer        puppeteer-core 安装目录
  --gpu              启用 GPU（ANGLE/Metal）
  --keep-frames      保留 _frames/
  --continuous       跳过硬切保护（已知连续镜头）
  --quiet            只打印结果`);
  process.exit(1);
}

// ── PNG decode (node:zlib only) ─────────────────────────────────────────────
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Decode one 8-bit non-interlaced PNG to {width, height, channels, data}. */
function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error('not a PNG');
  let off = 8, width = 0, height = 0, depth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      depth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (depth !== 8 || interlace !== 0) throw new Error(`unsupported PNG (depth ${depth}, interlace ${interlace})`);
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`unsupported PNG color type ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.allocUnsafe(stride * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const row = pos; pos += stride;
    const o = y * stride, prev = o - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[o + x - channels] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = y > 0 && x >= channels ? out[prev + x - channels] : 0;
      let v = raw[row + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`bad PNG filter ${filter}`);
      out[o + x] = v & 255;
    }
  }
  return {width, height, channels, data: out};
}

// ── linear-light tables, same as the reference renderer ─────────────────────
const SRGB_TO_LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const u = i / 255;
  SRGB_TO_LIN[i] = u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4;
}
const LIN_TO_SRGB = new Uint8Array(65536);
for (let i = 0; i < 65536; i++) {
  const l = i / 65535;
  const s = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
  LIN_TO_SRGB[i] = Math.max(0, Math.min(255, Math.round(s * 255)));
}

/** 8×8 box-filtered greyscale, for the cut guard (cheap, motion changes every step). */
function boxGray(img) {
  const {width, height, channels, data} = img;
  const bw = Math.max(1, Math.floor(width / 8)), bh = Math.max(1, Math.floor(height / 8));
  const g = new Int16Array(bw * bh);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let sum = 0;
      for (let y = 0; y < 8; y++) {
        let p = ((by * 8 + y) * width + bx * 8) * channels;
        for (let x = 0; x < 8; x++, p += channels) sum += (data[p] * 299 + data[p + 1] * 587 + data[p + 2] * 114) / 1000;
      }
      g[by * bw + bx] = Math.round(sum / 64);
    }
  }
  return g;
}

/**
 * Indices of the captures to integrate: all of them, unless one step between neighbours
 * carries the change (a cut, not motion) — then the side holding the frame time.
 */
function cutSide(grays) {
  const n = grays.length;
  if (n < 4) return [...Array(n).keys()];
  const d = [];
  for (let k = 0; k < n - 1; k++) {
    let s = 0;
    for (let i = 0; i < grays[k].length; i++) s += Math.abs(grays[k + 1][i] - grays[k][i]);
    d.push(s / grays[k].length);
  }
  let j = 0;
  for (let k = 1; k < d.length; k++) if (d[k] > d[j]) j = k;
  const others = d.filter((_, k) => k !== j);
  const alt = others.length ? Math.max(...others) : 0;
  if (d[j] <= 0 || d[j] < 3 * alt) return [...Array(n).keys()];
  const range = (a, b) => [...Array(Math.max(0, b - a)).keys()].map((i) => a + i);
  return j < Math.floor(n / 2) ? range(j + 1, n) : range(0, j + 1);
}

/** Average captures in linear light, leaving out the far side of a cut. Returns {png, cut}. */
function integratePng(pngBuffers, preserveCuts) {
  const keep = preserveCuts && pngBuffers.length >= 4
    ? cutSide(pngBuffers.map((p) => boxGray(decodePng(p))))
    : [...Array(pngBuffers.length).keys()];
  let acc = null, width = 0, height = 0;
  for (const k of keep) {
    const img = decodePng(pngBuffers[k]);
    width = img.width; height = img.height;
    if (!acc) acc = new Float32Array(width * height * 3);
    const {data, channels} = img;
    for (let p = 0, q = 0; p < width * height; p++, q += channels) {
      const o = p * 3;
      acc[o] += SRGB_TO_LIN[data[q]];
      acc[o + 1] += SRGB_TO_LIN[data[q + 1]];
      acc[o + 2] += SRGB_TO_LIN[data[q + 2]];
    }
  }
  const rgb = Buffer.allocUnsafe(width * height * 3);
  const inv = 65535 / keep.length;
  for (let i = 0; i < acc.length; i++) {
    rgb[i] = LIN_TO_SRGB[Math.max(0, Math.min(65535, Math.round(acc[i] * inv)))];
  }
  return {rgb, width, height, cut: keep.length < pngBuffers.length};
}

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Raw RGB → PNG, so an integrated frame can be written without an image library. */
function encodePng(rgb, width, height) {
  const stride = width * 3;
  const raw = Buffer.allocUnsafe((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const deflated = deflateSync(raw, {level: 1});
  return Buffer.concat([PNG_SIG, chunk('IHDR', ihdr), chunk('IDAT', deflated), chunk('IEND', Buffer.alloc(0))]);
}

// ── Chrome / puppeteer resolution ───────────────────────────────────────────
const requireFrom = createRequire(import.meta.url);
function loadPuppeteer() {
  const candidates = [
    opts.puppeteer,
    process.env.PUPPETEER_CORE_PATH,
    'puppeteer-core',
    'puppeteer',
    join(homedir(), '.dsh/profiles/desktop/node_modules/puppeteer-core'),
    join(homedir(), '.dsh/profiles/web/node_modules/puppeteer-core'),
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      return requireFrom(c);
    } catch {
      /* try the next one */
    }
  }
  throw new Error(`找不到 puppeteer-core：设 --puppeteer <目录> 或 PUPPETEER_CORE_PATH，或\n  NODE_PATH=~/.dsh/profiles/desktop/node_modules`);
}

function chromePath() {
  const candidates = [
    opts.chrome,
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  try {
    return loadPuppeteer().executablePath();
  } catch {
    return undefined;
  }
}

// ── worker ──────────────────────────────────────────────────────────────────
async function renderWorker(job) {
  const puppeteer = loadPuppeteer();
  const stats = {captures: 0, still: 0, cuts: 0, errors: [], hist: {}, relaunched: 0};
  const launchArgs = ['--no-sandbox', '--disable-gpu-sandbox', '--hide-scrollbars', '--mute-audio'];
  if (job.gpu) launchArgs.push('--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization');
  else launchArgs.push('--enable-unsafe-swiftshader');

  const chrome = job.chrome || chromePath();
  let browser = null, page = null;
  const launch = async () => {
    if (browser) await browser.close().catch(() => {});
    browser = await puppeteer.launch({executablePath: chrome, headless: 'new', args: launchArgs, protocolTimeout: 180000});
    page = await browser.newPage();
    await page.setViewport({width: job.width, height: job.height, deviceScaleFactor: job.scale});
    page.on('pageerror', (e) => stats.errors.push(String(e).slice(0, 200)));
    page.on('console', (m) => { if (m.type() === 'error') stats.errors.push(m.text().slice(0, 200)); });
    await page.goto('file://' + job.comp, {waitUntil: 'load', timeout: 120000});
    await page.evaluate(() => window.__ready);
    await new Promise((r) => setTimeout(r, 150)); // let the first paint settle
  };

  await launch();
  const adaptive = job.shutter > 0 && (await page.evaluate(() => typeof window.__motion === 'function'));
  const openS = job.shutter > 0 ? (job.shutter / 360) / job.fps : 0;

  const grab = async (t) => {
    await page.evaluate((tt) => window.__seek(tt), t);
    stats.captures++;
    return Buffer.from(await page.screenshot({type: 'png'}));
  };

  const renderFrame = async (t, path) => {
    if (job.shutter <= 0) {
      writeFileSync(path, await grab(t));
      return;
    }
    let S = job.samples;
    if (adaptive) {
      const far = await page.evaluate(
        ([a, b]) => window.__motion(a, b),
        [Math.max(t - openS / 2, 0), Math.min(t + openS / 2, job.dur - 1e-6)],
      );
      S = Math.min(job.samplesMax, Math.max(job.samplesMin, Math.ceil((far * job.scale) / job.gap)));
    }
    const times = [];
    for (let k = 0; k < S; k++) {
      times.push(Math.min(Math.max(t + openS * ((k + 0.5) / S - 0.5), 0), job.dur - 1e-6));
    }
    const first = await grab(times[0]);
    const last = await grab(times[times.length - 1]);
    if (first.equals(last)) {                 // nothing moved while the shutter was open
      writeFileSync(path, first);
      stats.still++;
      return;
    }
    const pngs = [first];
    for (const tk of times.slice(1, -1)) pngs.push(await grab(tk));
    pngs.push(last);
    const {rgb, width, height, cut} = integratePng(pngs, !job.continuous);
    if (cut) stats.cuts++;
    stats.hist[S] = (stats.hist[S] || 0) + 1;
    writeFileSync(path, encodePng(rgb, width, height));
  };

  let done = 0;
  for (let f = job.f0 + job.k; f < job.f1; f += job.n) {
    const t = f / job.fps, path = join(job.framesDir, `${String(f).padStart(5, '0')}.png`);
    if (job.resume && existsSync(path)) continue;
    if (done && job.recycle && done % job.recycle === 0) await launch();
    done++;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await renderFrame(t, path);
        break;
      } catch (e) {
        if (attempt === 3) throw new Error(`frame ${f}: ${e && e.message ? e.message : e}`);
        stats.relaunched++;
        await launch();                        // a long-lived Chrome can be closed mid-frame
      }
    }
  }
  await browser.close().catch(() => {});
  return stats;
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  const comp = resolve(process.cwd(), opts.comp);
  if (!existsSync(comp)) throw new Error(`comp 不存在: ${comp}`);
  const out = resolve(process.cwd(), opts.out);
  const framesDir = opts.framesDir ? resolve(process.cwd(), opts.framesDir) : join(dirname(out), '_frames');
  mkdirSync(dirname(out), {recursive: true});
  rmSync(framesDir, {recursive: true, force: true});
  mkdirSync(framesDir, {recursive: true});

  // page info: duration + whether it can size its own blur sampling
  const puppeteer = loadPuppeteer();
  const chrome = chromePath();
  if (!opts.quiet) console.log(`chrome    ${chrome}`);
  const args = ['--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader'];
  if (opts.gpu) args.push('--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist');
  const probe = await puppeteer.launch({executablePath: chrome, headless: 'new', args});
  const probePage = await probe.newPage();
  await probePage.setViewport({width: opts.width, height: opts.height, deviceScaleFactor: opts.scale});
  const probeErrors = [];
  probePage.on('pageerror', (e) => probeErrors.push(String(e).slice(0, 200)));
  await probePage.goto('file://' + comp, {waitUntil: 'load', timeout: 120000});
  await probePage.evaluate(() => window.__ready);
  const info = await probePage.evaluate(() => ({
    dur: (window.__meta && window.__meta.dur) || null,
    motion: typeof window.__motion === 'function',
  }));
  await probe.close();

  const dur = opts.dur ?? info.dur ?? 15;
  const total = Math.round(dur * opts.fps);
  const from = Math.min(opts.from, total);
  const to = Math.min(opts.to ?? total, total);
  const N = Math.max(0, to - from);
  if (!N) throw new Error(`帧区间为空：from=${from} to=${to} total=${total}`);
  const workers = Math.max(1, Math.min(opts.workers, N));

  const adaptive = opts.shutter > 0 && info.motion;
  const how = opts.shutter <= 0
    ? 'no shutter'
    : `shutter ${opts.shutter}°, ` + (adaptive
      ? `captures per frame sized by __motion (gap ${opts.gap} px, ${opts.samplesMin}–${opts.samplesMax})`
      : `${opts.samples} captures per moving frame`);
  if (!opts.quiet) {
    console.log(`${N} frames on ${workers} workers · ${how}`);
    if (from || to !== total) console.log(`  帧区间 ${from}–${to - 1}（总长 ${total}）`);
  }

  const t0 = Date.now();
  const jobBase = {
    comp, chrome, framesDir, dur, f0: from, f1: to, n: workers, fps: opts.fps, width: opts.width, height: opts.height,
    scale: opts.scale, shutter: opts.shutter, samples: opts.samples, gap: opts.gap,
    samplesMin: opts.samplesMin, samplesMax: opts.samplesMax, recycle: opts.recycle,
    gpu: opts.gpu, continuous: opts.continuous, resume: false,
  };
  const jobs = [...Array(workers).keys()].map((k) => ({...jobBase, k}));

  const results = await Promise.all(jobs.map((job) => runChild(job, opts.quiet, framesDir, N, t0)));

  const secs = (Date.now() - t0) / 1000;
  const captures = results.reduce((a, r) => a + r.captures, 0);
  const still = results.reduce((a, r) => a + r.still, 0);
  const cuts = results.reduce((a, r) => a + r.cuts, 0);
  const relaunched = results.reduce((a, r) => a + (r.relaunched || 0), 0);
  const errs = results.flatMap((r) => r.errors);
  const hist = {};
  for (const r of results) for (const [k, v] of Object.entries(r.hist)) hist[k] = (hist[k] || 0) + v;
  console.log(
    `${N} frames, ${captures} captures (${still} still frames skipped the shutter, ${cuts} kept a cut hard) ` +
    `in ${secs.toFixed(0)}s on ${workers} workers; page errors: ${errs.length ? errs.slice(0, 3).join(' | ') : 'none'}` +
    (relaunched ? `; relaunched a closed browser ${relaunched}×` : ''),
  );

  const ff = ['-v', 'error', '-y', '-framerate', String(opts.fps), '-start_number', String(from), '-i', join(framesDir, '%05d.png')];
  if (opts.sfx) ff.push('-i', resolve(process.cwd(), opts.sfx));
  ff.push('-c:v', 'libx264', '-preset', 'medium', '-crf', String(opts.crf), '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '5.2', '-movflags', '+faststart');
  if (opts.sfx) ff.push('-c:a', 'aac', '-b:a', '256k', '-shortest');
  ff.push(out);
  const enc = spawnSync(opts.ffmpeg, ff, {stdio: ['ignore', 'ignore', 'pipe']});
  if (enc.status !== 0) throw new Error('ffmpeg 编码失败:\n' + enc.stderr.toString().slice(-800));
  if (!opts.keepFrames) rmSync(framesDir, {recursive: true, force: true});

  const meta = {
    comp, fps: opts.fps, scale: opts.scale, size: [opts.width * opts.scale, opts.height * opts.scale],
    shutter: opts.shutter > 0 ? opts.shutter : 0,
    samples: opts.shutter > 0 ? (adaptive ? 'adaptive' : opts.samples) : 1,
    ...(adaptive ? {gap_px: opts.gap, samples_per_moving_frame: hist} : {}),
    workers, frames: N, frame_range: [from, from + N], still_frames: still, cut_frames: cuts,
    captures, seconds: Math.round(secs * 10) / 10, continuous: opts.continuous,
  };
  writeFileSync(out.replace(/\.mp4$/, '') + '.render.json', JSON.stringify(meta, null, 1) + '\n');
  console.log('wrote', out);
}

/** Fork one worker process and pump its progress into the parent's timer. */
function runChild(job, quiet, framesDir, N, t0) {
  return new Promise((resolvePromise, reject) => {
    const child = fork(SELF, [], {
      env: {...process.env, RENDER_FRAME_JOB: JSON.stringify(job)},
      stdio: ['ignore', 'pipe', 'inherit', 'ipc'],
    });
    let result = null;
    child.on('message', (m) => { if (m && m.stats) result = m.stats; });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== 0) return reject(new Error(`worker ${job.k} 退出码 ${code}`));
      if (!result) return reject(new Error(`worker ${job.k} 没有返回统计`));
      resolvePromise(result);
    });
    if (!quiet && job.k === 0) {
      const timer = setInterval(() => {
        const n = existsSync(framesDir) ? readdirSync(framesDir).length : 0;
        console.log(`  ${n}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }, 15000);
      child.on('exit', () => clearInterval(timer));
    }
  });
}

export {decodePng, encodePng, integratePng, boxGray, cutSide};

// worker entry: the parent passes the job through the environment; otherwise this is the CLI
if (process.env.RENDER_FRAME_JOB) {
  const job = JSON.parse(process.env.RENDER_FRAME_JOB);
  renderWorker(job)
    .then((stats) => { process.send({stats}); process.exit(0); })
    .catch((e) => { console.error(e && e.stack ? e.stack : String(e)); process.exit(1); });
} else if (isMain) {
  main().catch((e) => {
    console.error(e && e.stack ? e.stack : String(e));
    process.exit(1);
  });
}
