#!/usr/bin/env node
/**
 * Capture the real widget UI at four states (default / bubble / panels).
 * Requires puppeteer-core from the DSH desktop profile:
 *   NODE_PATH=~/.dsh/profiles/desktop/node_modules node tools/v01-film/widget-shots/capture.cjs
 * Start server.py first; PORT / OUT can be overridden with env.
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || '8767';
const OUT = process.env.OUT || '/tmp/whale-shots3';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, {recursive: true});

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
    userDataDir: '/tmp/whale-pptr',
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1600, height: 900, deviceScaleFactor: 2});
  page.on('pageerror', (e) => console.log('pageerror:', e.message.slice(0, 120)));

  const fresh = async () => {
    await page.goto(`http://127.0.0.1:${PORT}/`, {waitUntil: 'networkidle2'});
    await sleep(2800);
  };
  const clickText = async (txt) => page.evaluate((t) => {
    const hit = [...document.querySelectorAll('.dshwv-menu button')].find((n) => (n.textContent || '').trim() === t);
    if (hit) { hit.click(); return true; }
    return false;
  }, txt);
  const openMenu = async () => {
    await page.evaluate(() => { const b = document.querySelector('.dshwv-menu-btn'); if (b) b.click(); });
    await sleep(700);
  };
  const openBubble = async () => {
    await page.evaluate(() => {
      const img = document.querySelector('.dshwv-img');
      if (!img) return;
      const r = img.getBoundingClientRect();
      for (const [fx, fy] of [[0.55, 0.6], [0.62, 0.72]]) {
        const x = r.x + r.width * fx, y = r.y + r.height * fy;
        for (const type of ['pointerdown', 'pointerup', 'click']) {
          const ev = new PointerEvent(type, {bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', button: 0});
          (type === 'click' ? img : document).dispatchEvent(ev);
        }
        if (document.querySelector('.dshwv-pop-open')) return;
      }
    });
    await sleep(900);
  };
  const shot = async (name) => {
    await page.screenshot({path: path.join(OUT, `raw-${name}.png`)});
    console.log('shot', name);
  };

  await fresh(); await openBubble(); await shot('balance');
  await fresh(); await openMenu(); await shot('menu');
  await fresh(); await openMenu(); await clickText('音效/提示泡泡设置'); await sleep(900); await shot('sound');
  await fresh(); await openMenu(); await clickText('按压泡泡设置'); await sleep(900); await shot('editor');
  await fresh(); await openMenu(); await clickText('- = 小鲸鱼记账 = -'); await sleep(900); await shot('usage');
  await browser.close();
})();
