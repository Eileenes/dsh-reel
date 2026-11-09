#!/usr/bin/env node
/**
 * make-v01-film.mjs — turn one plugin case JSON into a runnable V0.1 (Onetake) film.
 *
 * The V0.1 real-UI film is the pipeline that produced the Better Sidebar / Game Studio
 * reference videos: 28s / 840 frames, terminal → voxel whale → dock hops → DSH window →
 * 插件 page (search / install / blue progress) → 4 feature screens with top tabs and
 * bottom captions → end card.
 *
 * This script does every mechanical step from a case file:
 *   1. config-case.js   (terminal title/footer, other CFG from the workdir's config.js)
 *   2. feat1..4.js      (feature screens as data URLs)
 *   3. comp-<slug>.html (the comp template with this plugin's copy)
 *   4. studio/src/v2/data/v01-<slug>-timeline.ts (60-ish sound events for the 28s cut)
 * and then prints (or runs, with --run-audio) the audio, render and mux commands.
 *
 * Usage:
 *   node tools/v01-film/make-v01-film.mjs cases/v01/dsh-guizang-design.json \
 *     --workdir .research/onetake-promo --run-audio
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');

const argv = process.argv.slice(2);
const casePath = argv.find((a) => !a.startsWith('--'));
if (!casePath) {
  console.error('用法: node tools/v01-film/make-v01-film.mjs <case.json> [--workdir .research/onetake-promo] [--template ...] [--run-audio]');
  process.exit(1);
}
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const has = (name) => argv.includes(name);

const workdir = resolve(REPO, flag('--workdir', '.research/onetake-promo'));
const templatePath = resolve(REPO, flag('--template', 'tools/v01-film/comp-template.html'));
const runAudio = has('--run-audio');
const caseFile = resolve(process.cwd(), casePath);
const spec = JSON.parse(readFileSync(caseFile, 'utf8'));

// ── validate ────────────────────────────────────────────────────────────────
const problems = [];
if (!spec.slug) problems.push('slug 缺失');
if (!spec.plugin || !spec.plugin.query || !spec.plugin.name) problems.push('plugin.query / plugin.name 缺失');
if (!Array.isArray(spec.features) || spec.features.length !== 4) problems.push('features 必须正好 4 条（对应 4 个 tab）');
for (const f of spec.features ?? []) {
  const p = resolve(REPO, f.image ?? '');
  if (!f.image || !existsSync(p)) problems.push(`功能图不存在: ${f.image}`);
}
if (!existsSync(templatePath)) problems.push(`模板不存在: ${templatePath}`);
if (!existsSync(resolve(workdir, 'config.js'))) problems.push(`workdir 缺少 config.js: ${workdir}`);
if (problems.length) {
  console.error('案例不可用:\n - ' + problems.join('\n - '));
  process.exit(1);
}

const warn = [];
const cjk = (s) => (s.match(/[\u3400-\u9fff]/g) ?? []).length;
const estLen = (s) => cjk(s) + (s.length - cjk(s)) * 0.55;
if (estLen(spec.plugin.cardDesc) > 52) warn.push(`cardDesc 偏长（约 ${estLen(spec.plugin.cardDesc).toFixed(0)} 字宽），可能溢出结果卡`);
if (estLen(spec.plugin.tagline) > 46) warn.push('tagline 偏长，片尾可能溢出');
for (const f of spec.features) if (estLen(f.caption) > 40) warn.push(`字幕偏长: ${f.caption}`);
if (spec.plugin.name.length > 10) warn.push('插件名偏长，片尾大字会自动缩小');

// ── write asset JS + config + comp ──────────────────────────────────────────
const dataUrlJs = (varName, file) => {
  const raw = readFileSync(file);
  const mime = raw.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    ? 'image/png'
    : raw.subarray(0, 3).toString() === 'GIF'
      ? 'image/gif'
      : 'image/jpeg';
  return `window.${varName}='data:${mime};base64,${raw.toString('base64')}';\n`;
};
const written = [];
const write = (name, content) => {
  const p = resolve(workdir, name);
  writeFileSync(p, content);
  written.push(p);
  return p;
};

// config-case.js: keep the workdir's CFG, only swap terminal copy
const configSrc = readFileSync(resolve(workdir, 'config.js'), 'utf8');
const jsonText = configSrc.slice(configSrc.indexOf('{'), configSrc.lastIndexOf('}') + 1);
const cfg = JSON.parse(jsonText);
cfg.termTitle = spec.plugin.termTitle ?? `${spec.slug} — zsh — 120×32`;
cfg.termFooter = spec.plugin.termFooter ?? `🐋  ${spec.plugin.query} · promo`;
write('config-case.js', `window.CFG=${JSON.stringify(cfg)};\n`);

spec.features.forEach((f, i) => write(`feat${i + 1}.js`, dataUrlJs(`FEAT${i + 1}`, resolve(REPO, f.image))));

const typeDiv = ((12.55 - 10.6) / spec.plugin.query.length).toFixed(4);
const nameFont = Math.max(72, Math.min(150, Math.floor(150 * 1600 / Math.max(1, estLen(spec.plugin.name) * 150))));
let comp = readFileSync(templatePath, 'utf8');
const kindInstall = spec.plugin.install.startsWith('$') ? spec.plugin.install : `$ ${spec.plugin.install}`;
const subs = {
  __QUERY__: spec.plugin.query,
  __TYPE_DIV__: typeDiv,
  __CARD_TITLE__: spec.plugin.cardTitle,
  __CARD_META__: spec.plugin.cardMeta,
  __CARD_DESC__: spec.plugin.cardDesc,
  __NAV__: JSON.stringify(spec.features.map((f) => f.tab)),
  __CAPS__: JSON.stringify(spec.features.map((f) => f.caption)),
  __KICKER__: spec.plugin.kicker,
  __NAME_FONT__: String(nameFont),
  __NAME__: spec.plugin.name,
  __HANDLE__: spec.plugin.handle,
  __TAGLINE__: spec.plugin.tagline,
  __INSTALL_LINE__: kindInstall,
  __LICENSE_LINE__: spec.plugin.licenseLine,
};
for (const [token, value] of Object.entries(subs)) {
  if (!comp.includes(token)) {
    console.error(`模板缺少占位符 ${token}`);
    process.exit(1);
  }
  comp = comp.split(token).join(value);
}
const compName = `comp-${spec.slug}.html`;
write(compName, comp);

// ── sound timeline ──────────────────────────────────────────────────────────
const keys = [];
const keyStart = 318; // 10.6s
const keyStep = 3.45; // 0.115s * 30fps
for (let i = 0; i < spec.plugin.query.length; i++) keys.push(Math.round(keyStart + i * keyStep));
const events = [
  {frame: 0, kind: 'hum', gain: 0.55},
  {frame: 12, kind: 'key', gain: 0.5},
  {frame: 14, kind: 'key', gain: 0.5},
  {frame: 16, kind: 'key', gain: 0.5},
  {frame: 34, kind: 'whoosh', gain: 0.5, note: 'voxels gather'},
  {frame: 56, kind: 'landBig', gain: 0.8, note: 'whale lands'},
  {frame: 63, kind: 'spout', gain: 0.45},
  {frame: 83, kind: 'whoosh', gain: 0.5},
  {frame: 98, kind: 'tile', gain: 0.55},
  {frame: 101, kind: 'whoosh', gain: 0.4},
  {frame: 109, kind: 'tile', gain: 0.55},
  {frame: 112, kind: 'whoosh', gain: 0.45},
  {frame: 119, kind: 'tile', gain: 0.6},
  {frame: 121, kind: 'window', gain: 0.6, note: 'DSH window grows'},
  {frame: 129, kind: 'whoosh', gain: 0.5},
  {frame: 148, kind: 'landBig', gain: 0.7, note: 'into the window'},
  {frame: 184, kind: 'enter', gain: 0.5},
  {frame: 240, kind: 'whoosh', gain: 0.5, note: 'to 插件'},
  {frame: 253, kind: 'click', gain: 0.65, note: 'click 插件'},
  {frame: 255, kind: 'landSmall', gain: 0.55},
  {frame: 258, kind: 'window', gain: 0.55, note: 'plugin page'},
  {frame: 306, kind: 'whoosh', gain: 0.45, note: 'to search box'},
  {frame: 321, kind: 'landSmall', gain: 0.45},
  ...keys.map((frame) => ({frame, kind: 'key', gain: 0.3})),
  {frame: 372, kind: 'result', gain: 0.6, note: 'result card'},
  {frame: 390, kind: 'whoosh', gain: 0.45, note: 'to 安装'},
  {frame: 405, kind: 'landSmall', gain: 0.55},
  {frame: 407, kind: 'click', gain: 0.7, note: 'install'},
  {frame: 417, kind: 'riser', gain: 0.4, note: 'progress'},
  {frame: 457, kind: 'chime', gain: 0.7, note: 'installed'},
  {frame: 462, kind: 'window', gain: 0.5, note: 'feature stage'},
  {frame: 472, kind: 'title', gain: 0.5},
  {frame: 486, kind: 'whoosh', gain: 0.45},
  {frame: 498, kind: 'tile', gain: 0.55},
  {frame: 552, kind: 'whoosh', gain: 0.45},
  {frame: 564, kind: 'tile', gain: 0.55},
  {frame: 636, kind: 'whoosh', gain: 0.45},
  {frame: 648, kind: 'tile', gain: 0.55},
  {frame: 708, kind: 'whoosh', gain: 0.45},
  {frame: 720, kind: 'tile', gain: 0.55},
  {frame: 780, kind: 'whoosh', gain: 0.4},
  {frame: 780, kind: 'title', gain: 0.7},
  {frame: 792, kind: 'landBig', gain: 0.55},
  {frame: 828, kind: 'chime', gain: 0.5},
].sort((a, b) => a.frame - b.frame);
if (events[0].frame !== 0 || events[events.length - 1].frame >= 840) {
  console.error('音效事件越界（0–839 帧）');
  process.exit(1);
}
const tsPath = resolve(REPO, `studio/src/v2/data/v01-${spec.slug}-timeline.ts`);
// make_sfx_v2.py parses the TS object literals (`{frame: 12, kind: 'key', gain: 0.5}`),
// so emit that shape instead of JSON.
const fmtEvent = (e) =>
  `  {frame: ${e.frame}, kind: '${e.kind}', gain: ${e.gain}${e.note ? `, note: '${String(e.note).replace(/'/g, "\\'")}'` : ''}},`;
const tsBody = `/**\n * Generated by tools/v01-film/make-v01-film.mjs — sound events for the 28s V0.1 film\n * of ${spec.plugin.name} (${spec.plugin.query}). Do not edit by hand; re-run the generator.\n */\nexport const FPS = 30;\nexport const TOTAL_FRAMES = 840;\n\nexport type SfxKind =\n  | 'key' | 'riser' | 'whoosh' | 'landBig' | 'landSmall' | 'tile'\n  | 'window' | 'enter' | 'result' | 'click' | 'chime' | 'toolPop'\n  | 'spout' | 'hum' | 'title';\n\nexport type SoundEvent = {frame: number; kind: SfxKind; gain?: number; note?: string};\n\nexport const SOUND_EVENTS: SoundEvent[] = [\n${events.map(fmtEvent).join('\n')}\n];\n`;
writeFileSync(tsPath, tsBody);

// ── report + commands ───────────────────────────────────────────────────────
const mixWav = `studio/out/${spec.slug}-v01-mix.wav`;
const mp3 = `studio/public/audio/v2/preview-mix-${spec.slug}-v01.mp3`;
const renderOut = resolve(workdir, `promo-${spec.slug}-intro-1080.mp4`);
const finalOut = `studio/out/promo-${spec.slug}-intro-1080.mp4`;
const poster = `studio/out/promo-${spec.slug}-intro-poster.png`;

console.log(`\n✓ ${spec.plugin.name}  (${spec.plugin.query})`);
console.log(`  workdir   ${workdir}`);
for (const p of written) console.log(`  wrote     ${p}`);
console.log(`  timeline  ${tsPath}  (${events.length} events)`);
if (warn.length) console.log('\n⚠ ' + warn.join('\n⚠ '));
console.log(`\n下一步：`);
console.log(`  1) 音频：python3 studio/scripts/make_sfx_v2.py \\\n       --timeline ${tsPath.replace(REPO + '/', '')} \\\n       --music studio/public/audio/v2/music-bed-30.wav \\\n       --duration 28 --total-frames 840 \\\n       --mix ${mixWav} --manifest /tmp/${spec.slug}-v01-audio-manifest.json`);
console.log(`  2) mp3 ：ffmpeg -y -i ${mixWav} -b:a 256k ${mp3}`);
console.log(`  3) 渲染：cd ${workdir.replace(REPO + '/', '')} && "$ONETAKE_PY" onetake/scripts/render.py ${compName} \\\n       --out ${renderOut.replace(workdir + '/', '')} --width 1920 --height 1080 --fps 30 --workers 4 --shutter 180`);
console.log(`  4) 混流：ffmpeg -y -i ${renderOut.replace(REPO + '/', '')} -i ${mixWav} \\\n       -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -movflags +faststart -t 28 ${finalOut}`);
console.log(`  5) 封面：ffmpeg -y -ss 16.5 -i ${finalOut} -frames:v 1 ${poster}`);
console.log(`\nQA 抽帧：4.0 / 9.5 / 11.6 / 13.7 / 14.5 / 16.5 / 19.8 / 22.9 / 25.5 / 27.3`);

if (runAudio) {
  const a = spawnSync('python3', ['studio/scripts/make_sfx_v2.py', '--timeline', tsPath, '--music', 'studio/public/audio/v2/music-bed-30.wav', '--duration', '28', '--total-frames', '840', '--mix', mixWav, '--manifest', `/tmp/${spec.slug}-v01-audio-manifest.json`], {cwd: REPO, stdio: 'inherit'});
  if (a.status !== 0) process.exit(a.status ?? 1);
  const b = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mixWav, '-b:a', '256k', mp3], {cwd: REPO, stdio: 'inherit'});
  if (b.status !== 0) process.exit(b.status ?? 1);
  console.log(`\n✓ 音频已生成: ${mixWav} + ${mp3}`);
}
