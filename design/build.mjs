// dsh-reel campaign design build: renders the poster / 16:9 cover / 1:1 square
// HTML from the three templates + the voxel-whale SVG + the two output thumbnails.
//
//   node design/build.mjs
//   bash design/build.sh     # rasterizes into docs/ with headless Chrome + sips
//
// Everything here is original artwork (inline SVG + CSS); no external assets.

import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, 'build');
mkdirSync(outDir, {recursive: true});

const read = (rel) => readFileSync(resolve(here, rel), 'utf8');
const whale = read('parts/whale-voxel.svg').trim();

const MINT_THEME = `
  :root{
    --accent:#5ef2c2; --accent-soft:rgba(94,242,194,.30); --accent-strong:#a9f7e0;
    --a-05:rgba(94,242,194,.05); --a-08:rgba(94,242,194,.08); --a-16:rgba(94,242,194,.16);
    --a-20:rgba(94,242,194,.20); --a-26:rgba(94,242,194,.26); --a-34:rgba(94,242,194,.34);
    --ink:#eff6ff; --muted:#a2adbc; --dim:#8a95a3; --paper:#f2f5fa; --paper-ink:#2b3240; --paper-sub:#6b7587;
    --key-light:rgba(94,242,194,.19); --key-light-2:rgba(94,242,194,.03);
    --bg-glow:rgba(22,64,76,.30); --practical:rgba(94,242,194,.16);
    --soft-ink:#9ecfc3; --tag-ink:#a7d6cb; --scene-ink:#9fc4bd;
    --install-bg:linear-gradient(90deg,rgba(14,26,28,.92),rgba(8,12,14,.9));
    --accent-shadow:rgba(94,242,194,.22);
    --screen-brightness:.52; --screen-saturate:.85;
  }`;

// 1) poster (3:4, 2160×2880 output)
const poster = read('poster.tpl.html')
  .replace('/*__THEME__*/', MINT_THEME)
  .replaceAll('{{WHALE}}', whale);
writeFileSync(resolve(outDir, 'poster.html'), poster);
console.log('built build/poster.html');

// 2) cover (16:9) + square (1:1): need the two output thumbnails
const asset = (rel) => resolve(here, 'parts/assets', rel);
if (!existsSync(asset('poster-thumb.png')) || !existsSync(asset('video-still.png'))) {
  console.error('missing design/parts/assets/{poster-thumb,video-still}.png');
  process.exit(1);
}
const dataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
const posterThumb = dataUrl(asset('poster-thumb.png'));
const videoStill = dataUrl(asset('video-still.png'));

const cover = read('cover.tpl.html')
  .replaceAll('{{POSTER}}', posterThumb)
  .replaceAll('{{VIDEO}}', videoStill)
  .replaceAll('{{WHALE}}', whale);
writeFileSync(resolve(outDir, 'cover.html'), cover);
console.log('built build/cover.html');

const square = read('square.tpl.html')
  .replaceAll('{{POSTER}}', posterThumb)
  .replaceAll('{{VIDEO}}', videoStill)
  .replaceAll('{{WHALE}}', whale);
writeFileSync(resolve(outDir, 'square.html'), square);
console.log('built build/square.html');
