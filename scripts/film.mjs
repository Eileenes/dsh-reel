#!/usr/bin/env node
/**
 * film.mjs — render one V0.1 real-UI plugin film from a cases/v01/<slug>.json.
 *
 * This is the pipeline behind the reference films (Better Sidebar / Game Studio /
 * Guizang Design / Whale Widget), see docs/v01-film-sop.md:
 *
 *   1. make-v01-film.mjs  -> comp-<slug>.html + feat*.js + config-case.js + sound timeline
 *   2. make_sfx_v2.py     -> studio/out/<slug>-v01-mix.wav
 *   3. render-frames.mjs  -> 840 frames / 28s / 1920x1080 / 30fps (about 5-10 minutes)
 *   4. ffmpeg mux         -> studio/out/promo-<slug>-intro-1080.mp4
 *   5. ffmpeg poster      -> studio/out/promo-<slug>-intro-poster.png
 *
 * It speaks the same machine-readable protocol as scripts/reel.mjs, so the studio
 * panel can run a film as a job without a second progress implementation:
 *   [reel] progress {"phase": "...", "progress": 0.42, ...}
 *   [reel] video  -> studio/out/promo-<slug>-intro-1080.mp4
 *   [reel] poster -> studio/out/promo-<slug>-intro-poster.png
 *
 * Usage:
 *   node scripts/film.mjs --case cases/v01/dsh-whale-widget.json \
 *     [--workdir .research/onetake-promo] [--out studio/out] [--engine repo|onetake]
 */
import {copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn, spawnSync} from 'node:child_process';
import {homedir} from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const args = process.argv.slice(2);

const fail = (message) => {
  console.error('[film] ' + message);
  process.exit(1);
};

/** Read a flag value; a following flag counts as "no value" instead of being eaten. */
const get = (name, fallback) => {
  const i = args.indexOf(name);
  const value = i >= 0 ? args[i + 1] : undefined;
  return value && !value.startsWith('--') ? value : fallback;
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(
    [
      'Usage: node scripts/film.mjs --case cases/v01/<slug>.json [options]',
      '',
      'Options:',
      '  --case <path>      V0.1 case JSON (required)',
      '  --workdir <dir>    comp workdir with the comp dependencies (default: .research/onetake-promo)',
      '  --out <dir>        output directory (default: studio/out)',
      '  --engine <name>    frame renderer: repo (tools/v01-film/render-frames.mjs, default) or onetake',
      '  --python <path>    Onetake Python runtime, only for --engine onetake (default: $ONETAKE_PY)',
      '  --workers <n>      render workers (default: 4)',
      '  --prepare-only     build comp/assets/audio and stop (setup check, no render)',
      '  --help             show this help',
    ].join('\n'),
  );
  process.exit(0);
}

const casePath = resolve(get('--case', ''));
if (!get('--case', '') || !existsSync(casePath)) fail('--case 指向的案例不存在: ' + (get('--case', '') || '(missing)'));
let spec;
try {
  spec = JSON.parse(readFileSync(casePath, 'utf8'));
} catch (err) {
  fail('案例不是合法 JSON: ' + (err?.message ?? err));
}
const slug = String(spec?.slug ?? '').trim();
if (!slug) fail('案例缺少 slug 字段: ' + casePath);

const workdir = resolve(get('--workdir', join(root, '.research', 'onetake-promo')));
const engine = String(get('--engine', process.env.FILM_ENGINE || 'repo')).toLowerCase();
const outDir = resolve(get('--out', join(root, 'studio', 'out')));
const python = get(
  '--python',
  process.env.ONETAKE_PY ||
    join(homedir(), 'Downloads', 'travel-capsule', 'outputs', 'soren-xiaohongshu-film', '.venv', 'bin', 'python'),
);
const workers = String(get('--workers', '4'));
const prepareOnly = args.includes('--prepare-only');

// ── env checks: fail early with a readable message instead of 30s into the render ──
const compName = `comp-${slug}.html`;
const templatePath = join(root, 'tools', 'v01-film', 'comp-template.html');
const makeFilm = join(root, 'tools', 'v01-film', 'make-v01-film.mjs');
const sfxScript = join(root, 'studio', 'scripts', 'make_sfx_v2.py');
const musicBed = join(root, 'studio', 'public', 'audio', 'v2', 'music-bed-30.wav');
/**
 * A fresh install (npm / another machine) has the comp template but not the 27 template
 * assets the comp loads at boot (three.bundle.js, motion.js, the DSH screenshots …).
 * Seed them from tools/v01-film/comp-assets/ so a clean install can render without a git clone.
 */
const seedDir = join(root, 'tools', 'v01-film', 'comp-assets');
const seedWorkdir = () => {
  if (!existsSync(seedDir)) return workdir;
  const names = readdirSync(seedDir);
  for (const dir of [workdir, join(outDir, '.comp-workdir')]) {
    try {
      mkdirSync(dir, {recursive: true});
      for (const name of names) {
        const target = join(dir, name);
        if (!existsSync(target)) copyFileSync(join(seedDir, name), target);
      }
      return dir;
    } catch {
      // read-only install dir: try the next writable location
    }
  }
  return workdir;
};
const activeWorkdir = seedWorkdir();
const relativeWorkdir = activeWorkdir !== workdir;

const repoRenderer = join(root, 'tools', 'v01-film', 'render-frames.mjs');
const onetakeRenderer = join(activeWorkdir, 'onetake', 'scripts', 'render.py');
const workdirConfig = join(activeWorkdir, 'config.js');
const workdirComp = join(activeWorkdir, 'three.bundle.js');
if (!['repo', 'onetake'].includes(engine)) fail(`未知渲染引擎: ${engine}（可选 repo / onetake）`);

const problems = [];
for (const [label, path] of [
  ['comp 模板', templatePath],
  ['make-v01-film.mjs', makeFilm],
  ['音效脚本', sfxScript],
  ['配乐 bed', musicBed],
  ['comp workdir', activeWorkdir],
  ['comp config.js', workdirConfig],
  ['comp three.bundle.js', workdirComp],
  ['render-frames.mjs', repoRenderer],
]) {
  if (!existsSync(path)) problems.push(`${label} 不存在: ${path}`);
}
if (engine === 'onetake' && !existsSync(onetakeRenderer)) {
  problems.push(`Onetake render.py 不存在: ${onetakeRenderer}`);
}
if (engine === 'onetake' && !existsSync(python)) {
  problems.push(`Onetake Python 不存在: ${python}（可用 --python 或 ONETAKE_PY 指定）`);
}
if (problems.length) fail('V0.1 渲染环境未就绪:\n - ' + problems.join('\n - '));

/** Probe candidates in order; use the first one that actually runs. */
const pickExecutable = (candidates, argv) => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      if (spawnSync(candidate, argv, {stdio: 'ignore'}).status === 0) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
};
// GUI hosts start with a minimal PATH: probe the usual absolute installs as well.
const ffmpeg = pickExecutable(
  [process.env.FFMPEG_PATH, '/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg', 'ffmpeg'].filter(Boolean),
  ['-version'],
);
const python3 = pickExecutable(
  [process.env.PYTHON3_PATH, 'python3', '/opt/homebrew/bin/python3', '/usr/local/bin/python3', '/usr/bin/python3'].filter(Boolean),
  ['-c', 'import sys'],
);
if (!ffmpeg) fail('找不到 ffmpeg（可用 FFMPEG_PATH 指定）');
if (!python3) fail('找不到可用的 python3（可用 PYTHON3_PATH 指定）');

const timelinePath = join(root, 'studio', 'src', 'v2', 'data', `v01-${slug}-timeline.ts`);
const mixWav = join(outDir, `${slug}-v01-mix.wav`);
const rendered = join(activeWorkdir, `promo-${slug}-intro-1080.mp4`);
const finalOut = join(outDir, `promo-${slug}-intro-1080.mp4`);
const posterOut = join(outDir, `promo-${slug}-intro-poster.png`);
mkdirSync(outDir, {recursive: true});

/** Path relative to the repo when possible (job logs read better), absolute otherwise. */
const show = (path) => {
  const rel = relative(root, path);
  return rel && !rel.startsWith('..') ? rel : path;
};

/** Machine-readable progress for the studio panel; no-op for plain CLI use. */
const emitProgress = (phase, extra = {}) => {
  console.log('[reel] progress ' + JSON.stringify({phase, ...extra}));
};
/** Print one artifact the moment it exists, so the panel can show it before the job ends. */
const emitArtifact = (kind, path) => {
  console.log('[reel] ' + kind + ' -> ' + show(path));
};

// ── child process plumbing (kills the whole tree when the panel cancels the job) ──
const children = new Set();
const killChildren = () => {
  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {
      // already gone
    }
  }
};
process.on('SIGTERM', () => {
  killChildren();
  process.exit(143);
});
process.on('SIGINT', () => {
  killChildren();
  process.exit(130);
});

/**
 * Run one step, forwarding its output to the job log.
 * onLine may swallow a line (return true) — used for the render's progress bar.
 */
const run = (command, argv, {cwd = root, onLine} = {}) =>
  new Promise((resolveRun, rejectRun) => {
    let child;
    try {
      child = spawn(command, argv, {cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe']});
    } catch (err) {
      rejectRun(err);
      return;
    }
    children.add(child);
    let buffer = '';
    const handle = (line) => {
      const text = String(line).replace(/\r$/, '');
      if (!text.trim()) return;
      if (onLine && onLine(text)) return;
      console.log(text.slice(0, 600));
    };
    const consume = (chunk) => {
      buffer += String(chunk);
      const parts = buffer.split(/\r\n|\n|\r/);
      buffer = parts.pop() ?? '';
      for (const part of parts) handle(part);
    };
    child.stdout?.on('data', consume);
    child.stderr?.on('data', consume);
    child.on('error', (err) => {
      children.delete(child);
      rejectRun(err);
    });
    child.on('close', (code, signal) => {
      if (buffer.trim()) handle(buffer);
      buffer = '';
      children.delete(child);
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${command.split('/').pop()} exited with ${code ?? signal}`));
    });
  });

const stage = (message) => console.log('[film] ' + message);

try {
  // 1. comp + per-case assets + sound timeline
  emitProgress('prepare', {progress: 0});
  stage('准备 comp / 素材 / 音效时间轴: ' + slug);
  if (relativeWorkdir) stage('comp 依赖不在 ' + show(workdir) + '，改用 ' + show(activeWorkdir));
  await run(process.execPath, [makeFilm, casePath, '--workdir', activeWorkdir]);
  emitProgress('prepare', {progress: 1});

  // 2. 本地合成音效 + 混音
  emitProgress('audio', {progress: 0});
  stage('生成音效混音: ' + show(mixWav));
  await run(
    python3,
    [
      sfxScript,
      '--timeline', timelinePath,
      '--music', musicBed,
      '--duration', '28',
      '--total-frames', '840',
      '--mix', mixWav,
      '--manifest', join(outDir, `${slug}-v01-audio-manifest.json`),
    ],
  );
  emitProgress('audio', {progress: 1});

  if (prepareOnly) {
    emitProgress('done', {progress: 1});
    console.log('[film] prepare-only done; comp/audio are ready, render skipped');
    process.exit(0);
  }

  // 3. frame render: 840 frames, 1920x1080 / 30fps / shutter 180°, about 5-10 minutes.
  //    The default engine is this repo's own renderer (Chrome + ffmpeg, no Onetake runtime).
  emitProgress('render:video', {progress: 0, done: 0, total: 840});
  stage(`渲染 840 帧（${engine === 'onetake' ? 'Onetake' : '仓库渲染器'}，约 5–10 分钟）: ` + compName);
  const renderCommand = engine === 'onetake' ? python : process.execPath;
  const renderArgv = engine === 'onetake'
    ? [onetakeRenderer, compName, '--out', rendered, '--width', '1920', '--height', '1080', '--fps', '30', '--workers', workers, '--shutter', '180']
    : [repoRenderer, compName, '--out', rendered, '--width', '1920', '--height', '1080', '--fps', '30', '--workers', workers, '--shutter', '180', '--ffmpeg', ffmpeg];
  await run(
    renderCommand,
    renderArgv,
    {
      cwd: activeWorkdir,
      onLine: (line) => {
        const progressLine = /^\s*(\d+)\s*\/\s*(\d+)\s+\d+s\s*$/.exec(line);
        if (!progressLine) return false;
        const done = Number(progressLine[1]);
        const total = Number(progressLine[2]);
        if (total > 0) emitProgress('render:video', {done, total, progress: Math.min(1, done / total)});
        return true;
      },
    },
  );
  emitProgress('render:video', {progress: 1, done: 840, total: 840});

  // 4. mux the mix back onto the rendered film (video is copied, not re-encoded)
  emitProgress('mux', {progress: 0});
  stage('混流: ' + show(finalOut));
  await run(ffmpeg, [
    '-y', '-loglevel', 'error',
    '-i', rendered,
    '-i', mixWav,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
    '-movflags', '+faststart', '-t', '28',
    finalOut,
  ]);
  emitArtifact('video', finalOut);
  emitProgress('mux', {progress: 1});

  // 5. poster frame at 16.5s (first feature page), as in the SOP
  emitProgress('poster', {progress: 0});
  stage('截取封面: ' + show(posterOut));
  await run(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '16.5', '-i', finalOut, '-frames:v', '1', posterOut]);
  emitArtifact('poster', posterOut);
  emitProgress('poster', {progress: 1});
} catch (err) {
  killChildren();
  console.error('[film] render failed:', err?.message ?? err);
  process.exit(1);
}

emitProgress('done', {progress: 1});
console.log('[film] done ->', show(finalOut));
