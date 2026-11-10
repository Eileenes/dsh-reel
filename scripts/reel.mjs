#!/usr/bin/env node
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const studio = join(root, 'studio');
const args = process.argv.slice(2);

const fail = (message) => {
  console.error('[reel] ' + message);
  process.exit(1);
};

/** Read a flag value; a following flag is treated as "no value" instead of being eaten. */
const get = (name, fallback) => {
  const i = args.indexOf(name);
  const value = i >= 0 ? args[i + 1] : undefined;
  return value && !value.startsWith('--') ? value : fallback;
};

const progressJson = args.includes('--progress-json');
let currentPhase = 'prepare';
/** Machine-readable progress for the studio UI; no-op for plain CLI use. */
const emitProgress = (phase, extra = {}) => {
  currentPhase = phase;
  if (progressJson) console.log('[reel] progress ' + JSON.stringify({phase, ...extra}));
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(
    [
      'Usage: node scripts/reel.mjs --case <case.json> [options]',
      '',
      'Options:',
      '  --case <path>             case JSON (default: cases/dsh-better-sidebar.json)',
      '  --mode <video|image|both> what to render (default: both)',
      '  --poster-frame <n>        frame used for the video poster (default: 825)',
      '  --out <dir>               output directory (default: studio/out)',
      '  --browser-executable <p>  Chrome/Chromium binary handed to Remotion',
      '  --progress-json           print machine-readable "[reel] progress {...}" lines',
      '  --dry-run                 validate the case and write props; do not render',
      '  --storyboard             also render one still per storyboard card (for the studio panel)',
      '  --help                    show this help',
    ].join('\n'),
  );
  process.exit(0);
}

const casePath = resolve(get('--case', join(root, 'cases', 'dsh-better-sidebar.json')));
const dryRun = args.includes('--dry-run');
const wantStoryboard = args.includes('--storyboard');
const mode = get('--mode', 'both');
const posterFrame = String(get('--poster-frame', '825'));
if (!['video', 'image', 'both'].includes(mode)) {
  fail('--mode must be one of: video, image, both');
}
if (!/^\d+$/.test(posterFrame)) fail('--poster-frame must be a non-negative integer');

let caseData;
try {
  caseData = JSON.parse(readFileSync(casePath, 'utf8'));
} catch (err) {
  fail('cannot read case file ' + casePath + ': ' + (err?.message ?? err));
}

if (!caseData.plugin?.name || !Array.isArray(caseData.features) || caseData.features.length === 0) {
  fail('case file must contain plugin.name and a non-empty features array: ' + casePath);
}
if (!caseData.promo?.address) {
  fail('case file must contain promo.address (promo card needs the plugin address): ' + casePath);
}

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const rawSlug = String(caseData.plugin.handle || caseData.plugin.name || '');
let slug = slugify(rawSlug);
if (!slug) {
  // A non-ASCII handle/name (e.g. only Chinese) would otherwise produce files such as
  // "-demo.mp4". Derive a stable fallback slug instead.
  slug = 'plugin-' + createHash('sha1').update(rawSlug || casePath).digest('hex').slice(0, 6);
  console.warn('[reel] plugin handle/name has no ASCII characters; using fallback slug ' + slug);
}

const outDir = resolve(get('--out', join(studio, 'out')));
mkdirSync(outDir, {recursive: true});
/** Remotion wants a path relative to its cwd when possible; keep absolute paths absolute. */
const remotionOutput = (fileName) => {
  const full = join(outDir, fileName);
  const rel = relative(studio, full);
  return rel.startsWith('..') ? full : rel;
};
const propsPath = join(outDir, 'props-' + slug + '.json');
/** Log paths relative to the repo when possible, absolute otherwise. */
const displayPath = (p) => {
  const rel = relative(root, p);
  return rel.startsWith('..') ? p : rel;
};
writeFileSync(propsPath, JSON.stringify(caseData, null, 2) + '\n');
console.log('[reel] props ->', displayPath(propsPath));
console.log('[reel] mode  ->', mode);
emitProgress('validate', {progress: 0});

if (dryRun) {
  console.log('[reel] dry run, skip render');
  process.exit(0);
}

const remotionName = process.platform === 'win32' ? 'remotion.cmd' : 'remotion';
const remotionCandidates = [
  join(studio, 'node_modules', '.bin', remotionName),
  join(root, 'node_modules', '.bin', remotionName),
  // Installed bundles sit inside <profile>/node_modules, so .bin is one level up.
  join(root, '..', '.bin', remotionName),
  // A repo checkout inside a workspace keeps deps at <workspace>/node_modules.
  join(root, '..', 'node_modules', '.bin', remotionName),
];
const remotion = remotionCandidates.find((candidate) => {
  try {
    return existsSync(candidate);
  } catch {
    return false;
  }
});
if (!remotion) {
  console.error('[reel] Remotion is not installed. Run: pnpm install (repo root) or cd studio && pnpm install');
  process.exit(1);
}

const chromeCandidates = [
  get('--browser-executable'),
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
].filter(Boolean);
const chrome = chromeCandidates.find((candidate) => {
  try {
    return existsSync(candidate);
  } catch {
    return false;
  }
});
const browserArgs = chrome ? ['--browser-executable=' + chrome] : [];
const propsArg = '--props=' + relative(studio, propsPath);
console.log('[reel] browser ->', chrome || 'auto (Remotion default)');

/**
 * Run one Remotion CLI invocation.
 * Plain CLI use keeps the inherited stdio (live progress bar). With --progress-json the
 * output is captured, progress-looking lines are turned into progress events, and the
 * remaining lines are forwarded so the studio log shows the real render output.
 */
const runRemotion = (argv, {trackProgress = true} = {}) => {
  if (!progressJson) {
    const result = spawnSync(remotion, argv, {cwd: studio, stdio: 'inherit'});
    if (result.status !== 0) process.exit(result.status ?? 1);
    return Promise.resolve();
  }
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(remotion, argv, {cwd: studio, stdio: ['ignore', 'pipe', 'pipe']});
    let lastPercent = -1;
    const consume = (chunk) => {
      for (const line of String(chunk).split(/\r\n|\r|\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const exact = /(?:Rendered|Encoded)\s+(\d+)\s*\/\s*(\d+)/i.exec(trimmed);
        const percent = /(\d{1,3})%/.exec(trimmed);
        if (exact) {
          const done = Number(exact[1]);
          const total = Number(exact[2]);
          if (trackProgress && total > 0) emitProgress(currentPhase, {done, total, progress: Math.min(1, done / total)});
          continue;
        }
        if (percent) {
          const value = Number(percent[1]);
          if (trackProgress && value >= 0 && value <= 100 && value !== lastPercent) {
            lastPercent = value;
            emitProgress(currentPhase, {progress: value / 100});
          }
          continue;
        }
        console.log(trimmed.slice(0, 500));
      }
    };
    child.stdout?.on('data', consume);
    child.stderr?.on('data', consume);
    child.on('error', rejectRun);
    child.on('close', (code, signal) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error('remotion exited with ' + (code ?? signal)));
    });
  });
};

const outputs = {};

/** Print one artifact the moment it exists, so a UI can show it before the render ends. */
const emitArtifact = (kind, path) => {
  outputs[kind] = path;
  console.log('[reel] ' + kind.padEnd(6) + ' ->', displayPath(path));
};

/**
 * Storyboard cards in the same order the studio panel draws them (hook / problem /
 * solution / features / how-to / proof), each paired with the reel frame that shows
 * it. The frames follow the PluginDemo sequence layout (0-105-225-375-555-705-855).
 */
const storyboardPlan = () => {
  const features = Array.isArray(caseData.features) ? caseData.features : [];
  const shots = [
    {id: 'hook', frame: 70},
    {id: 'problem', frame: 205},
    {id: 'solution', frame: 325},
  ];
  // Each feature card appears on its own beat inside the features scene (375-555).
  const span = features.length > 1 ? Math.min(18, Math.floor(100 / (features.length - 1))) : 0;
  features.forEach((feature, index) => {
    shots.push({id: 'feature-' + String(feature?.no ?? index + 1), frame: 375 + 40 + index * span});
  });
  shots.push({id: 'howto', frame: 655});
  shots.push({id: 'proof', frame: 815});
  return shots;
};

const shotDir = join(outDir, 'storyboard');

/** Render one still per storyboard card so the panel can show them appear while the job runs. */
const renderStoryboard = async () => {
  const shots = storyboardPlan();
  mkdirSync(shotDir, {recursive: true});
  console.log('[reel] rendering storyboard shots', shots.length);
  emitProgress('render:storyboard', {progress: 0, done: 0, total: shots.length});
  for (let index = 0; index < shots.length; index += 1) {
    const shot = shots[index];
    const name = slug + '-shot-' + String(index + 1).padStart(2, '0') + '-' + shot.id.replace(/[^a-z0-9]+/g, '-') + '.png';
    const relFile = 'storyboard/' + name;
    const file = join(shotDir, name);
    try {
      await runRemotion(
        ['still', 'src/index.ts', 'PluginDemo', remotionOutput(relFile), '--frame=' + shot.frame, '--scale=0.5', propsArg, ...browserArgs, '--overwrite'],
        {trackProgress: false},
      );
      console.log('[reel] shot ' + index + ' ->', displayPath(file));
    } catch (err) {
      // A missing storyboard tile must not block the real outputs.
      console.warn('[reel] storyboard shot ' + index + ' failed:', err?.message ?? err);
    }
    emitProgress('render:storyboard', {progress: (index + 1) / shots.length, done: index + 1, total: shots.length});
  }
};

try {
  if (wantStoryboard) await renderStoryboard();

  // Stills first: the 3:4 promo card and the poster are quick, so a viewer sees
  // a finished image long before the video finishes rendering.
  if (mode !== 'video') {
    const imageName = slug + '-promo.png';
    console.log('[reel] rendering promo image', imageName);
    emitProgress('render:image', {progress: 0});
    await runRemotion([
      'still', 'src/index.ts', 'PromoCard', remotionOutput(imageName),
      '--frame=0', '--scale=2', propsArg,
      ...browserArgs, '--overwrite',
    ]);
    emitProgress('render:image', {progress: 1, done: 1, total: 1});
    emitArtifact('image', join(outDir, imageName));
  }

  if (mode !== 'image') {
    const posterName = slug + '-poster.png';
    console.log('[reel] rendering poster', posterName);
    emitProgress('render:poster', {progress: 0});
    await runRemotion([
      'still', 'src/index.ts', 'PluginDemo', remotionOutput(posterName),
      '--frame=' + posterFrame, propsArg,
      ...browserArgs, '--overwrite',
    ]);
    emitProgress('render:poster', {progress: 1, done: 1, total: 1});
    emitArtifact('poster', join(outDir, posterName));

    const videoName = slug + '-demo.mp4';
    console.log('[reel] rendering video', videoName);
    emitProgress('render:video', {progress: 0});
    await runRemotion([
      'render', 'src/index.ts', 'PluginDemo', remotionOutput(videoName),
      '--codec', 'h264', '--crf', '18',
      propsArg, ...browserArgs,
      '--concurrency=4', '--overwrite',
    ]);
    emitProgress('render:video', {progress: 1, done: 1, total: 1});
    emitArtifact('video', join(outDir, videoName));
  }
} catch (err) {
  console.error('[reel] render failed:', err?.message ?? err);
  process.exit(1);
}

emitProgress('done', {progress: 1});
