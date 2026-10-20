#!/usr/bin/env node
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const studio = join(root, 'studio');
const args = process.argv.slice(2);
const get = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const casePath = resolve(get('--case', join(root, 'cases', 'dsh-better-sidebar.json')));
const dryRun = args.includes('--dry-run');
const mode = get('--mode', 'both');
if (!['video', 'image', 'both'].includes(mode)) {
  throw new Error('--mode must be one of: video, image, both');
}
const caseData = JSON.parse(readFileSync(casePath, 'utf8'));

if (!caseData.plugin?.name || !Array.isArray(caseData.features) || caseData.features.length === 0) {
  throw new Error('case file must contain plugin.name and a non-empty features array: ' + casePath);
}
if (!caseData.promo?.address) {
  throw new Error('case file must contain promo.address (promo card needs the plugin address): ' + casePath);
}

const slug = String(caseData.plugin.handle || caseData.plugin.name)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const outDir = join(studio, 'out');
mkdirSync(outDir, {recursive: true});
const propsPath = join(outDir, 'props-' + slug + '.json');
writeFileSync(propsPath, JSON.stringify(caseData, null, 2) + '\n');
console.log('[reel] props ->', relative(root, propsPath));
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
    'render', 'src/index.ts', 'PluginDemo', 'out/' + videoName,
    '--codec', 'h264', '--crf', '18',
    propsArg, ...browserArgs,
    '--concurrency=4', '--overwrite',
  ]);
  outputs.video = join(outDir, videoName);

  const posterFrame = String(get('--poster-frame', '825'));
  const posterName = slug + '-poster.png';
  runRemotion([
    'still', 'src/index.ts', 'PluginDemo', 'out/' + posterName,
    '--frame=' + posterFrame, propsArg,
    ...browserArgs, '--overwrite',
  ]);
  outputs.poster = join(outDir, posterName);
}

if (mode !== 'video') {
  const imageName = slug + '-promo.png';
  console.log('[reel] rendering promo image', imageName);
  runRemotion([
    'still', 'src/index.ts', 'PromoCard', 'out/' + imageName,
    '--frame=0', '--scale=2', propsArg,
    ...browserArgs, '--overwrite',
  ]);
  outputs.image = join(outDir, imageName);
}

for (const [kind, path] of Object.entries(outputs)) {
  console.log('[reel] ' + kind.padEnd(6) + ' ->', path);
}
