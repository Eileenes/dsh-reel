// dsh-reel studio server: case catalogue, render jobs, progress, output serving.
//
// Shared by the agent tools (lib/index.js) and the panel UI (lib/client.js), so both
// callers drive one implementation instead of two drifting copies. Plain Node ESM on
// purpose: no DSH imports here, so this module is unit-testable with `node --test`.
import {createReadStream, existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, extname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {homedir} from 'node:os';
import {randomUUID} from 'node:crypto';

export const API_PREFIX = '/dsh-reel';

const OUTPUT_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.png', '.jpg', '.jpeg', '.gif']);
const MIME = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
};
const MAX_LOG_LINES = 400;
const MAX_JOBS = 20;
const MAX_BODY_BYTES = 256 * 1024;

/** V0.1 real-UI film pipeline (docs/v01-film-sop.md): Onetake comp + Python renderer + ffmpeg. */
const FILM_WORKDIR = '.research/onetake-promo';
const ONETAKE_PYTHON_CANDIDATES = [
  process.env.ONETAKE_PY,
  join(homedir(), 'Downloads', 'travel-capsule', 'outputs', 'soren-xiaohongshu-film', '.venv', 'bin', 'python'),
].filter(Boolean);
/** GUI apps often start with a minimal PATH, so probe the usual absolute installs too. */
const FFMPEG_CANDIDATES = [
  process.env.FFMPEG_PATH,
  '/opt/homebrew/bin/ffmpeg',
  '/usr/local/bin/ffmpeg',
  '/usr/bin/ffmpeg',
].filter(Boolean);

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const exists = (path) => {
  try {
    return existsSync(path);
  } catch {
    return false;
  }
};

/** First existing candidate, or undefined. */
const firstExisting = (paths) => paths.find(exists);

function sendJson(res, status, body) {
  if (res.headersSent) {
    res.end();
    return;
  }
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('request body is too large'), {status: 413}));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  const raw = await readBody(req);
  if (!raw.trim()) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    throw Object.assign(new Error('request body is not valid JSON'), {status: 400});
  }
}

/** Read a JSON file, returning undefined instead of throwing. */
function readJsonFile(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

function clampProgress(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;
}

function lineSplitter(onLine) {
  let buffer = '';
  return {
    push(chunk) {
      buffer += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      const parts = buffer.split(/\r\n|\n|\r/);
      buffer = parts.pop() ?? '';
      for (const line of parts) onLine(line);
    },
    flush() {
      if (buffer) onLine(buffer);
      buffer = '';
    },
  };
}

/**
 * Create one studio instance owned by a plugin context.
 *
 * @param {object} options
 * @param {string} options.root plugin package root
 * @param {typeof spawn} [options.spawnProcess] process starter (tests inject a fake)
 * @param {string} [options.execPath] Node executable used for scripts/reel.mjs
 * @param {object} [options.filmRuntime] V0.1 film runtime facts (tests inject a fake)
 */
export function createStudio({root: rawRoot, spawnProcess = spawn, execPath = process.execPath, filmRuntime}) {
  const root = resolve(rawRoot);
  const studioDir = join(root, 'studio');
  const outDir = join(studioDir, 'out');
  const scriptPath = join(root, 'scripts', 'reel.mjs');
  const casesDir = join(root, 'cases');
  const publicDir = join(studioDir, 'public');
  const preferredCase = join(casesDir, 'dsh-game-studio.json');

  const version = readJsonFile(join(root, 'package.json'))?.version ?? '0.0.0';
  const clientFile = join(root, 'lib', 'client.js');
  const filmScript = join(root, 'scripts', 'film.mjs');
  const filmWorkdir = join(root, FILM_WORKDIR);
  /** Onetake runtime facts, probed once so state polling stays cheap. */
  let onetakeEnv;
  const probeOnetake = () => {
    const python = firstExisting(ONETAKE_PYTHON_CANDIDATES) ?? null;
    const ffmpeg =
      firstExisting(FFMPEG_CANDIDATES) ?? (spawnSync('ffmpeg', ['-version'], {stdio: 'ignore'}).status === 0 ? 'ffmpeg' : null);
    const workdirReady =
      exists(join(filmWorkdir, 'onetake', 'scripts', 'render.py')) && exists(join(filmWorkdir, 'config.js'));
    return {
      available: Boolean(python && workdirReady && ffmpeg && exists(filmScript)),
      workdir: filmWorkdir,
      python,
      ffmpeg: Boolean(ffmpeg),
      ffmpegPath: ffmpeg,
      workdirReady,
    };
  };
  const detectOnetake = () => {
    if (onetakeEnv === undefined) onetakeEnv = filmRuntime ?? probeOnetake();
    return onetakeEnv;
  };
  /** Fingerprint of the browser bundle: lets a loaded panel notice that its code changed. */
  const clientRev = () => {
    try {
      const info = statSync(clientFile);
      return info.mtimeMs.toString(36) + '-' + info.size.toString(36);
    } catch {
      return undefined;
    }
  };
  /** @type {Map<string, object>} */
  const jobs = new Map();
  /** @type {object[]} */
  const queue = [];
  /** @type {object | null} */
  let running = null;
  let disposed = false;

  const displayPath = (path) => {
    if (!path) return '';
    const rel = relative(root, path);
    return rel && !rel.startsWith('..') ? rel : path;
  };

  const urlForPath = (path) => {
    if (!path) return undefined;
    const rel = relative(outDir, path);
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) return undefined;
    return API_PREFIX + '/api/out/' + rel.split(sep).map(encodeURIComponent).join('/');
  };

  function detectRenderer() {
    const bin = process.platform === 'win32' ? 'remotion.cmd' : 'remotion';
    const candidates = [
      {path: join(studioDir, 'node_modules', '.bin', bin), source: 'studio'},
      {path: join(root, 'node_modules', '.bin', bin), source: 'root'},
      // Installed bundles sit inside <profile>/node_modules, so .bin is one level up.
      {path: join(root, '..', '.bin', bin), source: 'hoisted'},
      // A repo checkout inside a workspace keeps deps at <workspace>/node_modules.
      {path: join(root, '..', 'node_modules', '.bin', bin), source: 'workspace'},
    ];
    const found = candidates.find((candidate) => exists(candidate.path));
    return found ? {found: true, path: found.path, source: found.source} : {found: false, source: null};
  }

  function detectBrowser() {
    const chrome = firstExisting(CHROME_CANDIDATES);
    if (chrome) return {found: true, path: chrome, source: 'system', executable: chrome};
    const cached = [
      join(studioDir, 'node_modules', '.remotion', 'chrome-headless-shell'),
      join(root, 'node_modules', '.remotion', 'chrome-headless-shell'),
    ].find(exists);
    if (cached) return {found: true, path: cached, source: 'remotion-cache', executable: undefined};
    return {found: false, source: null, executable: undefined};
  }

  function env() {
    const renderer = detectRenderer();
    const browser = detectBrowser();
    return {
      version,
      platform: process.platform,
      node: process.version,
      root,
      outDir,
      renderer,
      browser,
      chromeExecutable: browser.executable ?? null,
      ready: renderer.found,
    };
  }

  function listCases() {
    const entries = [];
    const walk = (dir, kind) => {
      if (!exists(dir)) return;
      for (const item of readdirSync(dir, {withFileTypes: true})) {
        if (item.name.startsWith('.')) continue;
        const full = join(dir, item.name);
        if (item.isDirectory()) {
          walk(full, kind === 'case' ? item.name : kind);
          continue;
        }
        if (!item.name.endsWith('.json')) continue;
        const data = readJsonFile(full);
        if (!data) continue;
        const plugin = data.plugin ?? {};
        const meta = [
          plugin.handle ?? plugin.repo,
          plugin.version,
          data.slug && !plugin.cardTitle ? data.slug : undefined,
        ]
          .filter(Boolean)
          .join(' · ');
        entries.push({
          id: relative(root, full).split(sep).join('/'),
          kind,
          title: String(plugin.cardTitle ?? plugin.name ?? data.slug ?? item.name.replace(/\.json$/, '')),
          meta,
          desc: String(plugin.cardDesc ?? plugin.tagline ?? ''),
          features: Array.isArray(data.features) ? data.features.length : 0,
          // reel.mjs only renders cases with plugin.name + features + promo.address.
          renderable: Boolean(
            plugin.name && Array.isArray(data.features) && data.features.length > 0 && data.promo?.address,
          ),
          mode: 'both',
        });
      }
    };
    walk(casesDir, 'case');
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  function scanRepo(target) {
    const raw = String(target ?? '');
    const dir = isAbsolute(raw) ? resolve(raw) : resolve(root, raw);
    if (!exists(dir) || !statSync(dir).isDirectory()) throw new Error('not a directory: ' + dir);
    const pkg = readJsonFile(join(dir, 'package.json')) ?? {};
    const readme = ['README.md', 'README.zh.md', 'readme.md', 'README.zh-CN.md']
      .map((file) => join(dir, file))
      .find(exists);
    const screenshots = [];
    for (const rel of ['docs/screenshots', 'assets', 'preview']) {
      const full = join(dir, rel);
      if (!exists(full)) continue;
      try {
        for (const file of readdirSync(full)) {
          if (/\.(png|jpe?g|webp|gif)$/i.test(file)) screenshots.push(join(rel, file));
        }
      } catch {
        // an unreadable asset folder is not fatal for the scan
      }
    }
    return {
      name: String(pkg.name ?? ''),
      version: String(pkg.version ?? ''),
      description: String(pkg.description ?? ''),
      hasReadme: Boolean(readme),
      screenshots,
    };
  }

  /** Read a case JSON by path (relative to the plugin root) or throw. */
  function readCase(target) {
    const raw = String(target ?? '');
    if (!raw) throw new Error('case path is required');
    const file = isAbsolute(raw) ? resolve(raw) : resolve(root, raw);
    if (!exists(file) || !statSync(file).isFile()) throw new Error('case file not found: ' + file);
    const data = readJsonFile(file);
    if (!data || typeof data !== 'object') throw new Error('case file is not valid JSON: ' + file);
    return {id: relative(root, file).split(sep).join('/'), data};
  }

  /** Resolve a public asset (storyboard screenshots) without leaving studio/public. */
  function resolvePublicAsset(requestPath) {
    let rel;
    try {
      rel = decodeURIComponent(requestPath);
    } catch {
      return undefined;
    }
    if (!rel || rel.startsWith('/') || rel.split('/').includes('..')) return undefined;
    const file = resolve(publicDir, rel);
    if (file !== publicDir && !file.startsWith(publicDir + sep)) return undefined;
    if (!exists(file) || !statSync(file).isFile()) return undefined;
    return file;
  }

  /**
   * Real-UI film artifacts (`promo-<slug>-intro-poster.png` / `-intro-1080.mp4`)
   * must stay visible even when the out dir holds hundreds of newer renders —
   * otherwise the wall shows "未出片" for films that exist and the player has
   * nothing to play. `listOutputs` therefore returns the recent N files *plus*
   * every film artifact.
   */
  function isFilmArtifact(name) {
    return /^promo-.*-intro-(poster\.png|1080\.mp4)$/i.test(name);
  }

  function listOutputs(limit = 30) {
    if (!exists(outDir)) return [];
    const items = [];
    for (const item of readdirSync(outDir, {withFileTypes: true})) {
      if (!item.isFile()) continue;
      const ext = extname(item.name).toLowerCase();
      if (!OUTPUT_EXTENSIONS.has(ext)) continue;
      const full = join(outDir, item.name);
      let info;
      try {
        info = statSync(full);
      } catch {
        continue;
      }
      items.push({
        name: item.name,
        path: full,
        url: urlForPath(full),
        size: info.size,
        mtime: info.mtimeMs,
      });
    }
    const sorted = items.sort((a, b) => b.mtime - a.mtime);
    if (!Number.isFinite(limit) || limit <= 0) return sorted;
    const recent = sorted.slice(0, limit);
    const films = sorted.filter((item) => isFilmArtifact(item.name) && !recent.includes(item));
    if (!films.length) return recent;
    return [...recent, ...films].sort((a, b) => b.mtime - a.mtime);
  }

  function jobView(job, {logTail = 0} = {}) {
    return {
      id: job.id,
      type: job.type,
      title: job.title,
      state: job.state,
      phase: job.phase,
      progress: job.progress,
      casePath: job.casePath,
      mode: job.mode,
      posterFrame: job.posterFrame,
      startedAt: job.startedAt,
      endedAt: job.endedAt,
      error: job.error,
      outputs: Object.fromEntries(
        Object.entries(job.outputs).map(([kind, path]) => [
          kind,
          {path: displayPath(path), url: urlForPath(path)},
        ]),
      ),
      shots: (Array.isArray(job.shots) ? job.shots : [])
        .map((path, index) => (path ? {index, path: displayPath(path), url: urlForPath(path)} : null))
        .filter((shot) => shot && shot.url),
      logCount: job.log.length,
      logTail: logTail > 0 ? job.log.slice(-logTail) : undefined,
    };
  }

  function state() {
    const views = [...jobs.values()].slice(-MAX_JOBS).reverse();
    const cases = listCases();
    const preferred = cases.find((item) => item.id === 'cases/dsh-game-studio.json') ?? cases.find((item) => item.renderable) ?? cases[0];
    return {
      version,
      clientRev: clientRev(),
      env: env(),
      film: detectOnetake(),
      defaultCase: preferred ?? null,
      cases,
      outputs: listOutputs(),
      running: running?.id ?? null,
      jobs: views.map((job) => jobView(job, {logTail: 60})),
    };
  }

  function pushLog(job, line) {
    const text = String(line).replace(/\r$/, '');
    if (!text.trim()) return;
    job.log.push(text);
    if (job.log.length > MAX_LOG_LINES) job.log.splice(0, job.log.length - MAX_LOG_LINES);
  }

  function handleLine(job, line) {
    const text = String(line).replace(/\r$/, '');
    if (!text.trim()) return;
    const progressMatch = /^\[reel\] progress (\{.*\})$/.exec(text);
    if (progressMatch) {
      try {
        const payload = JSON.parse(progressMatch[1]);
        if (typeof payload.phase === 'string' && payload.phase) job.phase = payload.phase;
        const next = clampProgress(payload.progress);
        if (next !== null) job.progress = next;
        return;
      } catch {
        // a malformed progress line is just a log line
      }
    }
    const outputMatch = /^\[reel\] (video|poster|image)\s+-> (.*)$/.exec(text);
    if (outputMatch) {
      const file = outputMatch[2].trim();
      if (file) job.outputs[outputMatch[1]] = isAbsolute(file) ? file : resolve(root, file);
    }
    // Storyboard stills arrive one by one while the job runs; keep the index so the
    // panel can fill card #0, #1, ... in order.
    const shotMatch = /^\[reel\] shot (\d+)\s+-> (.*)$/.exec(text);
    if (shotMatch) {
      const index = Number(shotMatch[1]);
      const file = shotMatch[2].trim();
      if (Number.isInteger(index) && index >= 0 && file) {
        if (!Array.isArray(job.shots)) job.shots = [];
        job.shots[index] = isAbsolute(file) ? file : resolve(root, file);
      }
    }
    pushLog(job, text);
  }

  function finish(job, outcome, detail) {
    job.endedAt = Date.now();
    if (job.state === 'cancelled') {
      // keep the cancellation, but record the exit detail for diagnostics
      pushLog(job, '[studio] cancelled' + (detail ? ' (' + detail + ')' : ''));
    } else if (outcome === 'done') {
      job.state = 'done';
      job.progress = 1;
      job.phase = 'done';
    } else {
      job.state = 'failed';
      job.error = detail || 'render failed';
      pushLog(job, '[studio] failed: ' + job.error);
    }
    job.resolve?.(job);
    job.resolve = undefined;
    job.child = undefined;
    if (running === job) running = null;
    pump();
  }

  function startChild(job) {
    let args;
    if (job.type === 'film') {
      args = [filmScript, '--case', job.casePath, '--workdir', filmWorkdir, '--out', outDir];
      if (job.filmPython) args.push('--python', job.filmPython);
    } else {
      args = [scriptPath, '--case', job.casePath, '--mode', job.mode, '--progress-json', '--storyboard'];
      if (job.posterFrame !== undefined) args.push('--poster-frame', String(job.posterFrame));
      if (job.browserExecutable) args.push('--browser-executable', job.browserExecutable);
    }
    job.phase = 'starting';
    let child;
    try {
      child = spawnProcess(execPath, args, {
        cwd: root,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      finish(job, 'failed', err?.message ?? String(err));
      return;
    }
    job.child = child;
    const stdout = lineSplitter((line) => handleLine(job, line));
    const stderr = lineSplitter((line) => handleLine(job, line));
    child.stdout?.on('data', (chunk) => stdout.push(chunk));
    child.stderr?.on('data', (chunk) => stderr.push(chunk));
    child.on('error', (err) => {
      stdout.flush();
      stderr.flush();
      finish(job, 'failed', err?.message ?? String(err));
    });
    child.on('close', (code, signal) => {
      stdout.flush();
      stderr.flush();
      if (job.state === 'cancelled') return finish(job, 'cancelled', signal ?? undefined);
      if (code === 0) return finish(job, 'done');
      finish(job, 'failed', 'reel.mjs exited with code ' + code + (signal ? ' (' + signal + ')' : ''));
    });
  }

  function pump() {
    if (disposed || running) return;
    const next = queue.shift();
    if (!next) return;
    running = next;
    next.state = 'running';
    next.startedAt = Date.now();
    startChild(next);
  }

  /**
   * Put one job on the queue. The studio renders one job at a time, so films and
   * v1 template renders share the same queue/runner.
   */
  function enqueue(fields) {
    const job = {
      type: 'render',
      title: '',
      casePath: undefined,
      mode: undefined,
      posterFrame: undefined,
      filmPython: undefined,
      browserExecutable: undefined,
      ...fields,
      id: randomUUID(),
      state: 'queued',
      phase: 'queued',
      progress: null,
      outputs: {},
      shots: [],
      log: [],
      startedAt: null,
      endedAt: null,
      error: undefined,
      child: undefined,
      resolve: undefined,
      promise: undefined,
    };
    job.promise = new Promise((resolveJob) => {
      job.resolve = resolveJob;
    });
    jobs.set(job.id, job);
    if (jobs.size > MAX_JOBS) {
      const oldest = [...jobs.keys()][0];
      if (oldest !== job.id) jobs.delete(oldest);
    }
    queue.push(job);
    pump();
    return job;
  }

  /**
   * Start one V0.1 real-UI film (docs/v01-film-sop.md) for a cases/v01 case.
   * This is the pipeline the reference plugin films were made with; it takes about
   * 10 minutes per film and needs the local Onetake runtime.
   */
  function startFilm(input) {
    if (disposed) throw new Error('studio is disposed');
    const raw = String(input?.casePath ?? '');
    if (!raw) throw new Error('film case path is required');
    const casePath = isAbsolute(raw) ? resolve(raw) : resolve(root, raw);
    if (!exists(casePath) || !statSync(casePath).isFile()) throw new Error('film case not found: ' + casePath);
    const rel = relative(casesDir, casePath);
    if (rel.startsWith('..') || isAbsolute(rel) || !rel.startsWith('v01' + sep)) {
      throw new Error('film case must live under cases/v01: ' + casePath);
    }
    const spec = readJsonFile(casePath);
    if (!spec || typeof spec !== 'object' || !spec.slug) throw new Error('film case has no slug: ' + casePath);
    const film = detectOnetake();
    if (!film.available) {
      const missing = [
        film.workdirReady ? undefined : 'Onetake workdir',
        film.python ? undefined : 'Onetake Python',
        film.ffmpeg ? undefined : 'ffmpeg',
      ].filter(Boolean);
      throw new Error('V0.1 film environment is not ready (missing: ' + missing.join(', ') + ')');
    }
    const job = enqueue({
      type: 'film',
      title: displayPath(casePath),
      casePath,
      filmPython: film.python,
    });
    return jobView(job);
  }

  function startRender(input) {
    if (disposed) throw new Error('studio is disposed');
    const fallback = exists(preferredCase) ? preferredCase : listCases().find((item) => item.renderable)?.id;
    const wanted = input?.casePath === undefined || input?.casePath === '' ? fallback : input.casePath;
    if (!wanted) throw new Error('no case JSON available');
    const raw = String(wanted);
    const casePath = isAbsolute(raw) ? resolve(raw) : resolve(root, raw);
    if (!exists(casePath) || !statSync(casePath).isFile()) throw new Error('case file not found: ' + casePath);
    const mode = String(input?.mode ?? 'both');
    if (!['video', 'image', 'both'].includes(mode)) throw new Error('mode must be one of: video, image, both');
    const posterFrameRaw = input?.posterFrame;
    let posterFrame;
    if (posterFrameRaw !== undefined && posterFrameRaw !== null && posterFrameRaw !== '') {
      const value = Number(posterFrameRaw);
      if (!Number.isInteger(value) || value < 0) throw new Error('posterFrame must be a non-negative integer');
      posterFrame = value;
    }
    const job = enqueue({
      type: 'render',
      title: displayPath(casePath),
      casePath,
      mode,
      posterFrame,
      browserExecutable: env().chromeExecutable,
    });
    return jobView(job);
  }

  function getJob(id) {
    return jobs.get(String(id));
  }

  function wait(id) {
    const job = getJob(id);
    if (!job) return Promise.resolve(undefined);
    if (job.state === 'done' || job.state === 'failed' || job.state === 'cancelled') return Promise.resolve(job);
    return job.promise;
  }

  function cancel(id) {
    const job = getJob(String(id));
    if (!job) return undefined;
    if (job.state === 'queued') {
      const index = queue.indexOf(job);
      if (index >= 0) queue.splice(index, 1);
      job.state = 'cancelled';
      job.endedAt = Date.now();
      job.resolve?.(job);
      job.resolve = undefined;
      return jobView(job);
    }
    if (job.state === 'running' && job.child) {
      job.state = 'cancelled';
      try {
        job.child.kill('SIGTERM');
      } catch {
        // the close handler still settles the job
      }
      return jobView(job);
    }
    return jobView(job);
  }

  async function streamFile(req, res, file) {
    const info = statSync(file);
    const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
    const range = req.headers?.range;
    if (typeof range === 'string') {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (match) {
        const start = match[1] === '' ? 0 : Number(match[1]);
        const end = match[2] === '' ? info.size - 1 : Math.min(Number(match[2]), info.size - 1);
        if (Number.isFinite(start) && Number.isFinite(end) && start <= end) {
          res.writeHead(206, {
            'content-type': type,
            'content-length': end - start + 1,
            'accept-ranges': 'bytes',
            'content-range': 'bytes ' + start + '-' + end + '/' + info.size,
            'cache-control': 'no-store',
          });
          if (req.method === 'HEAD') return res.end();
          createReadStream(file, {start, end}).pipe(res);
          return;
        }
      }
    }
    res.writeHead(200, {
      'content-type': type,
      'content-length': info.size,
      'accept-ranges': 'bytes',
      'cache-control': 'no-store',
    });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  }

  function resolveOutputFile(requestPath) {
    let rel;
    try {
      rel = decodeURIComponent(requestPath);
    } catch {
      return undefined;
    }
    if (!rel || rel.startsWith('/') || rel.split('/').includes('..')) return undefined;
    const file = resolve(outDir, rel);
    if (file !== outDir && !file.startsWith(outDir + sep)) return undefined;
    if (!exists(file) || !statSync(file).isFile()) return undefined;
    return file;
  }

  async function route(req, res) {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const path = url.pathname;
    if (!path.startsWith(API_PREFIX)) return sendJson(res, 404, {error: 'not found'});
    const rest = path.slice(API_PREFIX.length);
    const method = (req.method ?? 'GET').toUpperCase();

    if (rest === '' || rest === '/') {
      res.writeHead(200, {'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store'});
      return res.end('dsh-reel studio API\n');
    }
    if (rest === '/api/state' && method === 'GET') return sendJson(res, 200, state());
    if (rest === '/api/env' && method === 'GET') return sendJson(res, 200, env());
    if (rest === '/api/cases' && method === 'GET') return sendJson(res, 200, {cases: listCases()});
    if (rest === '/api/case' && method === 'GET') {
      const requested = url.searchParams.get('path') ?? '';
      try {
        const found = readCase(requested);
        if (!found.id.startsWith('cases/')) return sendJson(res, 403, {error: 'case path must live under cases/'});
        return sendJson(res, 200, {id: found.id, case: found.data});
      } catch (err) {
        return sendJson(res, 404, {error: err?.message ?? String(err)});
      }
    }
    if (rest === '/api/outputs' && method === 'GET') return sendJson(res, 200, {outputs: listOutputs()});
    if (rest === '/api/scan' && method === 'POST') {
      const body = await readJsonBody(req);
      try {
        return sendJson(res, 200, scanRepo(body.path));
      } catch (err) {
        return sendJson(res, 400, {error: err?.message ?? String(err)});
      }
    }
    if (rest === '/api/jobs' && method === 'POST') {
      const body = await readJsonBody(req);
      try {
        const job = String(body.type ?? '') === 'film' ? startFilm(body) : startRender(body);
        return sendJson(res, 201, {job});
      } catch (err) {
        return sendJson(res, 400, {error: err?.message ?? String(err)});
      }
    }
    const jobMatch = /^\/api\/jobs\/([^/]+)(\/cancel)?$/.exec(rest);
    if (jobMatch) {
      const id = jobMatch[1];
      if (jobMatch[2] === '/cancel' && method === 'POST') {
        const job = cancel(id);
        if (!job) return sendJson(res, 404, {error: 'job not found'});
        return sendJson(res, 200, {job});
      }
      if (method === 'GET') {
        const job = getJob(id);
        if (!job) return sendJson(res, 404, {error: 'job not found'});
        return sendJson(res, 200, {job: jobView(job, {logTail: 400})});
      }
    }
    const assetMatch = /^\/api\/asset\/(.+)$/.exec(rest);
    if (assetMatch && (method === 'GET' || method === 'HEAD')) {
      const file = resolvePublicAsset(assetMatch[1]);
      if (!file) return sendJson(res, 404, {error: 'asset not found'});
      return streamFile(req, res, file);
    }
    const outMatch = /^\/api\/out\/(.+)$/.exec(rest);
    if (outMatch && (method === 'GET' || method === 'HEAD')) {
      const file = resolveOutputFile(outMatch[1]);
      if (!file) return sendJson(res, 404, {error: 'output not found'});
      return streamFile(req, res, file);
    }
    return sendJson(res, 404, {error: 'not found'});
  }

  async function handle(req, res) {
    try {
      await route(req, res);
    } catch (err) {
      if (res.headersSent) {
        res.end();
        return;
      }
      sendJson(res, err?.status ?? 500, {error: err?.message ?? String(err)});
    }
  }

  function dispose() {
    disposed = true;
    for (const job of queue) {
      job.state = 'cancelled';
      job.resolve?.(job);
      job.resolve = undefined;
    }
    queue.length = 0;
    if (running?.child) {
      running.state = 'cancelled';
      try {
        running.child.kill('SIGTERM');
      } catch {
        // already gone
      }
    }
  }

  return {
    root,
    outDir,
    env,
    state,
    listCases,
    listOutputs,
    scanRepo,
    readCase,
    startRender,
    startFilm,
    wait,
    cancel,
    getJob,
    jobView,
    displayPath,
    handle,
    dispose,
  };
}
