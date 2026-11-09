#!/usr/bin/env node
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
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
      '  --dry-run                 validate the case and write props; do not render',
      '  --help                    show this help',
    ].join('\n'),
  );
  process.exit(0);
}

const casePath = resolve(get('--case', join(root, 'cases', 'dsh-better-sidebar.json')));
const dryRun = args.includes('--dry-run');
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

if (dryRun) {
  console.log('[reel] dry run, skip render');
  process.exit(0);
}

const remotionName = process.platform === 'win32' ? 'remotion.cmd' : 'remotion';
const remotionCandidates = [
  join(studio, 'node_modules', '.bin', remotionName),
  join(root, 'node_modules', '.bin', remotionName),
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

const runRemotion = (argv) => {
  const result = spawnSync(remotion, argv, {cwd: studio, stdio: 'inherit'});
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const outputs = {};

if (mode !== 'image') {
  const videoName = slug + '-demo.mp4';
  console.log('[reel] rendering video', videoName);
  runRemotion([
    'render', 'src/index.ts', 'PluginDemo', remotionOutput(videoName),
    '--codec', 'h264', '--crf', '18',
    propsArg, ...browserArgs,
    '--concurrency=4', '--overwrite',
  ]);
  outputs.video = join(outDir, videoName);

  const posterName = slug + '-poster.png';
  runRemotion([
    'still', 'src/index.ts', 'PluginDemo', remotionOutput(posterName),
    '--frame=' + posterFrame, propsArg,
    ...browserArgs, '--overwrite',
  ]);
  outputs.poster = join(outDir, posterName);
}

if (mode !== 'video') {
  const imageName = slug + '-promo.png';
  console.log('[reel] rendering promo image', imageName);
  runRemotion([
    'still', 'src/index.ts', 'PromoCard', remotionOutput(imageName),
    '--frame=0', '--scale=2', propsArg,
    ...browserArgs, '--overwrite',
  ]);
  outputs.image = join(outDir, imageName);
}

for (const [kind, path] of Object.entries(outputs)) {
  console.log('[reel] ' + kind.padEnd(6) + ' ->', displayPath(path));
}
