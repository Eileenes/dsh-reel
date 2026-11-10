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

  for (const entry of ['lib', 'scripts', 'tools/v01-film', 'locale', 'icon.svg', 'studio/src', 'studio/public/audio/bgm.wav', 'studio/public/audio/v2/music-bed-30.wav', 'studio/scripts/*.py']) {
    assert.ok(pkg.files.includes(entry), 'files must ship ' + entry);
  }
  for (const entry of ['cases/v01', 'cases/dsh-better-sidebar.json', 'cases/dsh-game-studio.json', 'cases/dsh-guizang-design.json']) {
    assert.ok(pkg.files.includes(entry), 'files must ship ' + entry);
  }
  // Never whitelist the whole directory: `cases` would drag the local meteor WIP
  // into the tarball and `studio/scripts` would drag __pycache__ in.
  assert.ok(!pkg.files.includes('cases'), 'do not ship the whole cases directory');
  assert.ok(!pkg.files.includes('studio/scripts'), 'do not ship the whole studio/scripts directory');
  // Screenshots ship per case (the wall and the 6-shot storyboard need them) but
  // the package must not drag in every campaign asset under studio/public/shots.
  assert.ok(
    pkg.files.some((entry) => entry.startsWith('studio/public/shots')),
    'files must ship case screenshots',
  );
  for (const entry of ['studio/public/shots/game-studio', 'studio/public/shots/dsh-pet', 'studio/public/shots/whale-widget', 'studio/public/shots/guizang']) {
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
