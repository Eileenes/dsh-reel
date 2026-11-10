// Unit tests for the studio host core: jobs, progress, output serving, cancellation.
// Run with: node --test test/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {EventEmitter} from 'node:events';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createStudio} from '../lib/server.js';

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), 'dsh-reel-test-'));
  mkdirSync(join(root, 'cases', 'v01'), {recursive: true});
  mkdirSync(join(root, 'studio', 'out'), {recursive: true});
  mkdirSync(join(root, 'studio', 'public', 'shots'), {recursive: true});
  writeFileSync(join(root, 'studio', 'public', 'shots', 'demo.png'), Buffer.from('PNG'));
  mkdirSync(join(root, 'scripts'), {recursive: true});
  writeFileSync(join(root, 'package.json'), JSON.stringify({name: 'dsh-reel-studio', version: '9.9.9'}));
  mkdirSync(join(root, 'lib'), {recursive: true});
  writeFileSync(join(root, 'lib', 'client.js'), '// test bundle');
  writeFileSync(
    join(root, 'cases', 'demo.json'),
    JSON.stringify({
      plugin: {name: 'Demo', handle: 'demo', version: '1.0.0', tagline: 'a demo case'},
      features: [{title: 'one'}],
      promo: {address: 'example/demo'},
    }),
  );
  writeFileSync(
    join(root, 'cases', 'v01', 'v1.json'),
    JSON.stringify({slug: 'v1', plugin: {cardTitle: 'V1 case', cardDesc: 'v01 card', handle: 'h', version: '2.0.0'}, features: []}),
  );
  return root;
}

function makeFakeSpawn(script) {
  const calls = [];
  const spawnProcess = (command, args, options) => {
    calls.push({command, args, options});
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.killed = null;
    child.kill = (signal) => {
      child.killed = signal ?? 'SIGTERM';
    };
    script(child, args);
    return child;
  };
  return {spawnProcess, calls};
}

const successScript = (root) => (child) => {
  setTimeout(() => {
    child.stdout.emit(
      'data',
      [
        '[reel] props -> studio/out/props-demo.json',
        '[reel] progress {"phase":"render:video","progress":0.5,"done":50,"total":100}',
      ].join('\n') + '\n',
    );
    writeFileSync(join(root, 'studio', 'out', 'demo-demo.mp4'), Buffer.from('0123456789'));
    child.stdout.emit('data', '[reel] video  -> studio/out/demo-demo.mp4\n[reel] poster -> studio/out/demo-poster.png\n');
    child.stdout.emit('data', '[reel] progress {"phase":"done","progress":1}\n');
    child.emit('close', 0, null);
  }, 5);
};

test('render job streams progress, parses outputs and settles', async () => {
  const root = makeRoot();
  const {spawnProcess} = makeFakeSpawn(successScript(root));
  const studio = createStudio({root, spawnProcess});
  try {
    const job = studio.startRender({casePath: join(root, 'cases', 'demo.json'), mode: 'video'});
    assert.equal(job.state === 'queued' || job.state === 'running', true);
    const finished = await studio.wait(job.id);
    assert.equal(finished.state, 'done');
    assert.equal(finished.progress, 1);
    assert.equal(finished.outputs.video, join(root, 'studio', 'out', 'demo-demo.mp4'));
    assert.equal(finished.outputs.poster, join(root, 'studio', 'out', 'demo-poster.png'));
    assert.ok(finished.log.some((line) => line.includes('props-demo.json')));

    const view = studio.jobView(finished, {logTail: 10});
    assert.equal(view.outputs.video.url, '/dsh-reel/api/out/demo-demo.mp4');
    assert.equal(studio.displayPath(finished.outputs.video), join('studio', 'out', 'demo-demo.mp4'));
  } finally {
    studio.dispose();
    rmSync(root, {recursive: true, force: true});
  }
});

test('cases are listed with both plain and v01 kinds', async () => {
  const root = makeRoot();
  const {spawnProcess} = makeFakeSpawn(() => {});
  const studio = createStudio({root, spawnProcess});
  try {
    const cases = studio.listCases();
    assert.equal(cases.length, 2);
    assert.equal(cases.find((item) => item.kind === 'case').title, 'Demo');
    assert.equal(cases.find((item) => item.kind === 'case').renderable, true);
    assert.equal(cases.find((item) => item.kind === 'v01').title, 'V1 case');
    assert.equal(cases.find((item) => item.kind === 'v01').renderable, false);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('validation rejects unknown cases and bad modes', () => {
  const root = makeRoot();
  const {spawnProcess} = makeFakeSpawn(() => {});
  const studio = createStudio({root, spawnProcess});
  try {
    assert.throws(() => studio.startRender({casePath: join(root, 'cases', 'missing.json')}), /case file not found/);
    assert.throws(() => studio.startRender({casePath: join(root, 'cases', 'demo.json'), mode: 'gif'}), /mode must be one of/);
    assert.throws(
      () => studio.startRender({casePath: join(root, 'cases', 'demo.json'), mode: 'video', posterFrame: -3}),
      /posterFrame/,
    );
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('queued job can be cancelled, next one still runs', async () => {
  const root = makeRoot();
  const children = [];
  // The first job hangs until released; the second stays queued.
  const script = (child) => {
    children.push(child);
  };
  const {spawnProcess} = makeFakeSpawn(script);
  const studio = createStudio({root, spawnProcess});
  try {
    const first = studio.startRender({casePath: join(root, 'cases', 'demo.json'), mode: 'video'});
    const second = studio.startRender({casePath: join(root, 'cases', 'demo.json'), mode: 'image'});
    assert.equal(children.length, 1, 'only one render runs at a time');
    assert.equal(studio.getJob(second.id).state, 'queued');

    const cancelled = studio.cancel(second.id);
    assert.equal(cancelled.state, 'cancelled');
    assert.equal((await studio.wait(second.id)).state, 'cancelled');

    const queued = studio.cancel(first.id);
    assert.equal(queued.state, 'cancelled');
    assert.equal(children[0].killed, 'SIGTERM');
  } finally {
    studio.dispose();
    rmSync(root, {recursive: true, force: true});
  }
});

test('HTTP API serves state, jobs, outputs with Range and blocks traversal', async () => {
  const root = makeRoot();
  const {spawnProcess, calls} = makeFakeSpawn(successScript(root));
  const studio = createStudio({root, spawnProcess});
  const server = http.createServer((req, res) => studio.handle(req, res));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    const state = await fetch(base + '/dsh-reel/api/state').then((res) => res.json());
    assert.equal(state.version, '9.9.9');
    assert.equal(state.cases.length, 2);
    assert.equal(state.env.renderer.found, false);
    assert.equal(state.defaultCase.id, 'cases/demo.json');
    assert.equal(typeof state.clientRev, 'string');

    const caseJson = await fetch(base + '/dsh-reel/api/case?path=' + encodeURIComponent('cases/demo.json')).then((res) => res.json());
    assert.equal(caseJson.case.plugin.name, 'Demo');
    const outsideCases = await fetch(base + '/dsh-reel/api/case?path=' + encodeURIComponent('package.json'));
    assert.equal(outsideCases.status, 403);

    const asset = await fetch(base + '/dsh-reel/api/asset/shots/demo.png');
    assert.equal(asset.status, 200);
    assert.equal(asset.headers.get('content-type'), 'image/png');
    assert.equal(await asset.text(), 'PNG');
    const badAsset = await fetch(base + '/dsh-reel/api/asset/..%2Fpackage.json');
    assert.equal(badAsset.status, 404);

    const created = await fetch(base + '/dsh-reel/api/jobs', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({casePath: 'cases/demo.json', mode: 'video', posterFrame: 12}),
    });
    assert.equal(created.status, 201);
    const {job} = await created.json();
    assert.equal(job.mode, 'video');
    assert.equal(job.posterFrame, 12);
    assert.ok(calls[0].args.includes('--progress-json'));
    assert.ok(calls[0].args.includes('--poster-frame'));

    const finished = await studio.wait(job.id);
    assert.equal(finished.state, 'done');

    const defaultJob = await fetch(base + '/dsh-reel/api/jobs', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({mode: 'image'}),
    });
    assert.equal(defaultJob.status, 201);
    const defaultView = await defaultJob.json();
    assert.equal(defaultView.job.title, join('cases', 'demo.json'));
    assert.equal((await studio.wait(defaultView.job.id)).state, 'done');

    const detail = await fetch(base + '/dsh-reel/api/jobs/' + job.id).then((res) => res.json());
    assert.equal(detail.job.state, 'done');
    assert.equal(detail.job.outputs.video.url, '/dsh-reel/api/out/demo-demo.mp4');

    const full = await fetch(base + '/dsh-reel/api/out/demo-demo.mp4');
    assert.equal(full.status, 200);
    assert.equal(await full.text(), '0123456789');

    const partial = await fetch(base + '/dsh-reel/api/out/demo-demo.mp4', {headers: {range: 'bytes=2-5'}});
    assert.equal(partial.status, 206);
    assert.equal(partial.headers.get('content-range'), 'bytes 2-5/10');
    assert.equal(await partial.text(), '2345');

    const traversal = await fetch(base + '/dsh-reel/api/out/..%2Fpackage.json');
    assert.equal(traversal.status, 404);

    const missingCancel = await fetch(base + '/dsh-reel/api/jobs/nope/cancel', {method: 'POST'});
    assert.equal(missingCancel.status, 404);

    const scan = await fetch(base + '/dsh-reel/api/scan', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({path: root}),
    }).then((res) => res.json());
    assert.equal(scan.name, 'dsh-reel-studio');
    assert.equal(scan.version, '9.9.9');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    studio.dispose();
    rmSync(root, {recursive: true, force: true});
  }
});

test('renderer detection also finds a hoisted profile node_modules', () => {
  const base = mkdtempSync(join(tmpdir(), 'dsh-reel-hoist-'));
  const plugin = join(base, 'node_modules', 'dsh-reel-studio');
  mkdirSync(join(plugin, 'cases'), {recursive: true});
  mkdirSync(join(plugin, 'studio', 'out'), {recursive: true});
  writeFileSync(join(plugin, 'package.json'), JSON.stringify({name: 'dsh-reel-studio', version: '1.0.0'}));
  mkdirSync(join(base, 'node_modules', '.bin'), {recursive: true});
  writeFileSync(join(base, 'node_modules', '.bin', process.platform === 'win32' ? 'remotion.cmd' : 'remotion'), '');
  const studio = createStudio({root: plugin});
  try {
    const env = studio.env();
    assert.equal(env.renderer.found, true);
    assert.equal(env.renderer.source, 'hoisted');
    assert.equal(env.version, '1.0.0');
  } finally {
    studio.dispose();
    rmSync(base, {recursive: true, force: true});
  }
});

test('dispose cancels queued work and kills the running child', () => {
  const root = makeRoot();
  const children = [];
  const {spawnProcess} = makeFakeSpawn((child) => children.push(child));
  const studio = createStudio({root, spawnProcess});
  try {
    studio.startRender({casePath: join(root, 'cases', 'demo.json'), mode: 'video'});
    studio.dispose();
    assert.equal(children[0].killed, 'SIGTERM');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
