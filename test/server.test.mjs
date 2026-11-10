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
  writeFileSync(
    join(root, 'cases', 'v01', 'film-demo.json'),
    JSON.stringify({slug: 'film-demo', plugin: {query: 'film-demo', name: 'Film Demo', cardTitle: 'Film Demo'}, features: []}),
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
    mkdirSync(join(root, 'studio', 'out', 'storyboard'), {recursive: true});
    writeFileSync(join(root, 'studio', 'out', 'storyboard', 'demo-shot-01-hook.png'), Buffer.from('PNG'));
    child.stdout.emit(
      'data',
      [
        '[reel] props -> studio/out/props-demo.json',
        '[reel] shot 0 -> studio/out/storyboard/demo-shot-01-hook.png',
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
  const {spawnProcess, calls} = makeFakeSpawn(successScript(root));
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
    assert.equal(finished.shots[0], join(root, 'studio', 'out', 'storyboard', 'demo-shot-01-hook.png'));

    const view = studio.jobView(finished, {logTail: 10});
    assert.equal(view.outputs.video.url, '/dsh-reel/api/out/demo-demo.mp4');
    assert.equal(view.shots.length, 1);
    assert.equal(view.shots[0].index, 0);
    assert.equal(view.shots[0].url, '/dsh-reel/api/out/storyboard/demo-shot-01-hook.png');
    assert.equal(studio.displayPath(finished.outputs.video), join('studio', 'out', 'demo-demo.mp4'));

    // The studio asks the renderer for storyboard stills as well as the real artifacts.
    const spawnCalls = calls.map((call) => call.args);
    assert.ok(spawnCalls.length === 1);
    assert.ok(spawnCalls[0].includes('--storyboard'));
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
    assert.equal(cases.length, 3);
    assert.equal(cases.find((item) => item.id === 'cases/demo.json').title, 'Demo');
    assert.equal(cases.find((item) => item.id === 'cases/demo.json').renderable, true);
    assert.equal(cases.find((item) => item.id === 'cases/v01/v1.json').title, 'V1 case');
    assert.equal(cases.find((item) => item.id === 'cases/v01/v1.json').renderable, false);
    assert.equal(cases.filter((item) => item.kind === 'v01').length, 2);
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

test('film jobs run the V0.1 pipeline and expose video/poster artifacts', async () => {
  const root = makeRoot();
  const spawnCalls = [];
  const spawnProcess = (command, args, options) => {
    spawnCalls.push({command, args, options});
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.killed = null;
    child.kill = (signal) => {
      child.killed = signal ?? 'SIGTERM';
    };
    setTimeout(() => {
      mkdirSync(join(root, 'studio', 'out'), {recursive: true});
      writeFileSync(join(root, 'studio', 'out', 'promo-film-demo-intro-1080.mp4'), Buffer.from('MP4'));
      writeFileSync(join(root, 'studio', 'out', 'promo-film-demo-intro-poster.png'), Buffer.from('PNG'));
      child.stdout.emit(
        'data',
        [
          '[reel] progress {"phase":"render:video","progress":0.5,"done":420,"total":840}',
          '[reel] video  -> studio/out/promo-film-demo-intro-1080.mp4',
          '[reel] poster -> studio/out/promo-film-demo-intro-poster.png',
        ].join('\n') + '\n',
      );
      child.emit('close', 0, null);
    }, 5);
    return child;
  };
  const filmRuntime = {
    available: true,
    workdir: join(root, '.research', 'onetake-promo'),
    python: join(root, 'fake-onetake-python'),
    ffmpeg: true,
    workdirReady: true,
  };
  const studio = createStudio({root, spawnProcess, filmRuntime});
  try {
    assert.equal(studio.state().film.available, true);
    const job = studio.startFilm({casePath: 'cases/v01/film-demo.json'});
    assert.equal(job.type, 'film');
    assert.equal(spawnCalls.length, 1);
    assert.match(spawnCalls[0].args[0], /scripts[\\/]film\.mjs$/);
    assert.ok(spawnCalls[0].args.includes('--case'));
    assert.ok(spawnCalls[0].args.includes(join(root, 'cases', 'v01', 'film-demo.json')));

    const finished = await studio.wait(job.id);
    assert.equal(finished.state, 'done');
    assert.equal(finished.type, 'film');
    const view = studio.jobView(finished, {logTail: 10});
    assert.equal(view.outputs.video.url, '/dsh-reel/api/out/promo-film-demo-intro-1080.mp4');
    assert.equal(view.outputs.poster.url, '/dsh-reel/api/out/promo-film-demo-intro-poster.png');
    assert.equal(finished.phase, 'done');
  } finally {
    studio.dispose();
    rmSync(root, {recursive: true, force: true});
  }
});

test('film validation only accepts cases/v01 cases', () => {
  const root = makeRoot();
  const filmRuntime = {available: true, workdir: root, python: 'python', ffmpeg: true, workdirReady: true};
  const studio = createStudio({root, spawnProcess: () => {
    throw new Error('should not spawn');
  }, filmRuntime});
  try {
    assert.throws(() => studio.startFilm({}), /film case path is required/);
    assert.throws(() => studio.startFilm({casePath: 'cases/missing.json'}), /film case not found/);
    assert.throws(() => studio.startFilm({casePath: 'cases/demo.json'}), /cases\/v01/);
  } finally {
    studio.dispose();
    rmSync(root, {recursive: true, force: true});
  }
});

test('film jobs are rejected when the Onetake runtime is missing', () => {
  const root = makeRoot();
  const studio = createStudio({
    root,
    spawnProcess: () => {
      throw new Error('should not spawn');
    },
    filmRuntime: {available: false, workdir: root, python: null, ffmpeg: false, workdirReady: false},
  });
  try {
    assert.throws(() => studio.startFilm({casePath: 'cases/v01/film-demo.json'}), /V0\.1 film environment is not ready/);
  } finally {
    studio.dispose();
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
    assert.equal(state.cases.length, 3);
    assert.equal(state.env.renderer.found, false);
    assert.equal(state.defaultCase.id, 'cases/demo.json');
    assert.equal(typeof state.clientRev, 'string');
    assert.equal(typeof state.film.available, 'boolean');

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

    const filmWithoutRuntime = await fetch(base + '/dsh-reel/api/jobs', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({type: 'film', casePath: 'cases/v01/film-demo.json'}),
    });
    assert.equal(filmWithoutRuntime.status, 400);

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
