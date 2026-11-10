// Manifest guard: the market-facing bundle declaration must point at real files, and
// the browser half must register the panel ids the host page expects.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

test('bundle manifest wires the client half and display resources', () => {
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(pkg.dsh.client.platform, 'web');
  assert.equal(pkg.dsh.client.immediately, true);
  assert.equal(typeof pkg.engines.dsh, 'string');

  for (const subpath of ['.', './client', './cordis.patch.yml', './locale/*.json', './icon', './package.json']) {
    assert.ok(pkg.exports[subpath], 'missing export ' + subpath);
  }
  assert.ok(existsSync(join(root, pkg.exports['./client'])), 'client bundle file exists');
  assert.ok(existsSync(join(root, pkg.exports['./cordis.patch.yml'])), 'patch file exists');

  for (const entry of ['lib', 'scripts', 'cases', 'locale', 'icon.svg', 'studio/src', 'studio/public/audio/bgm.wav', 'studio/public/shots']) {
    assert.ok(pkg.files.includes(entry), 'files must ship ' + entry);
  }
  assert.ok(pkg.icon && existsSync(join(root, pkg.icon)), 'icon exists');
  assert.ok(statSync(join(root, pkg.icon)).size < 256 * 1024, 'icon within the 256 KiB limit');

  const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8');
  assert.match(patch, /id:\s*dsh-reel/);
  assert.match(patch, /name:\s*dsh-reel-studio/);
});

test('locale metadata exists and the client registers the matching panel ids', () => {
  for (const file of ['zh.json', 'en.json']) {
    const locale = JSON.parse(readFileSync(join(root, 'locale', file), 'utf8'));
    assert.ok(locale.meta.title, file + ' meta.title');
    assert.ok(locale.meta.description, file + ' meta.description');
  }
  const client = readFileSync(join(root, 'lib', 'client.js'), 'utf8');
  assert.match(client, /id:\s*'dsh-reel-studio'/);
  assert.match(client, /name:\s*'sidebar\.panellist'/);
  assert.match(client, /id:\s*PANEL/);
  assert.match(client, /name:\s*'main'/);
  assert.match(client, /key:\s*PANEL/);
});
