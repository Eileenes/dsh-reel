// dsh-reel studio server: case catalogue, render jobs, progress, output serving.
//
// Shared by the agent tools (lib/index.js) and the panel UI (lib/client.js), so both
// callers drive one implementation instead of two drifting copies. Plain Node ESM on
// purpose: no DSH imports here, so this module is unit-testable with `node --test`.
import {createReadStream, existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, extname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {spawn} from 'node:child_process';
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
  '.json': 'application/json; charset=utf-8',
};
const MAX_LOG_LINES = 400;
const MAX_JOBS = 20;
const MAX_BODY_BYTES = 256 * 1024;

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
 */
export function createStudio({root: rawRoot, spawnProcess = spawn, execPath = process.execPath}) {
  const root = resolve(rawRoot);
  const studioDir = join(root, 'studio');
  const outDir = join(studioDir, 'out');
  const scriptPath = join(root, 'scripts', 'reel.mjs');
  const casesDir = join(root, 'cases');

  const version = readJsonFile(join(root, 'package.json'))?.version ?? '0.0.0';
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
    return items.sort((a, b) => b.mtime - a.mtime).slice(0, limit);
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
      logCount: job.log.length,
      logTail: logTail > 0 ? job.log.slice(-logTail) : undefined,
    };
  }

  function state() {
    const views = [...jobs.values()].slice(-MAX_JOBS).reverse();
    return {
      version,
      env: env(),
      cases: listCases(),
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
    const args = [scriptPath, '--case', job.casePath, '--mode', job.mode, '--progress-json'];
    if (job.posterFrame !== undefined) args.push('--poster-frame', String(job.posterFrame));
    if (job.browserExecutable) args.push('--browser-executable', job.browserExecutable);
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

  function startRender(input) {
    if (disposed) throw new Error('studio is disposed');
    const raw = String(input?.casePath ?? '');
    const casePath = isAbsolute(raw) ? resolve(raw) : resolve(root, raw);
    if (!raw || !exists(casePath) || !statSync(casePath).isFile()) throw new Error('case file not found: ' + casePath);
    const mode = String(input?.mode ?? 'both');
    if (!['video', 'image', 'both'].includes(mode)) throw new Error('mode must be one of: video, image, both');
    const posterFrameRaw = input?.posterFrame;
    let posterFrame;
    if (posterFrameRaw !== undefined && posterFrameRaw !== null && posterFrameRaw !== '') {
      const value = Number(posterFrameRaw);
      if (!Number.isInteger(value) || value < 0) throw new Error('posterFrame must be a non-negative integer');
      posterFrame = value;
    }
    const job = {
      id: randomUUID(),
      type: 'render',
      title: displayPath(casePath),
      state: 'queued',
      phase: 'queued',
      progress: null,
      casePath,
      mode,
      posterFrame,
      browserExecutable: env().chromeExecutable,
      outputs: {},
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
        const job = startRender(body);
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
    startRender,
    wait,
    cancel,
    getJob,
    jobView,
    displayPath,
    handle,
    dispose,
  };
}
