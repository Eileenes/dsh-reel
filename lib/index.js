import {defineTool} from '@deepseek-ai/dsh-tools';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const text = (s) => ({type: 'string', description: s});
const requiredText = (s) => ({type: 'string', required: true, description: s});

const scan = defineTool({
  name: 'reel_scan',
  description: 'Read a local plugin repository (package.json + README) and return the facts needed for a demo reel: name, version, description, install command and available screenshots.',
  parameters: {
    target: requiredText('Local path to the plugin repository or installed package.'),
  },
  output: {
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: text('Package name'),
        version: text('Package version'),
        description: text('Package description'),
        hasReadme: {type: 'boolean', required: true},
        screenshots: {type: 'array', required: true, items: {type: 'string'}},
      },
    },
    render: (_args, value) =>
      [value.name + '@' + value.version, value.description || '', 'README: ' + (value.hasReadme ? 'yes' : 'no'), 'assets: ' + value.screenshots.length]
        .filter(Boolean)
        .join('\n'),
  },
  async execute({target}) {
    const dir = resolve(target);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error('not a directory: ' + dir);
    const pkgPath = join(dir, 'package.json');
    const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {};
    const readmeCandidates = ['README.md', 'README.zh.md', 'readme.md'];
    const readme = readmeCandidates.map((f) => join(dir, f)).find((p) => existsSync(p));
    const screenshots = [];
    for (const rel of ['docs/screenshots', 'assets', 'preview']) {
      const p = join(dir, rel);
      if (!existsSync(p)) continue;
      try {
        for (const f of readdirSync(p)) {
          if (/\.(png|jpe?g|webp|gif)$/i.test(f)) screenshots.push(join(rel, f));
        }
      } catch {}
    }
    return {
      name: String(pkg.name || ''),
      version: String(pkg.version || ''),
      description: String(pkg.description || ''),
      hasReadme: Boolean(readme),
      screenshots,
    };
  },
});

const plan = defineTool({
  name: 'reel_plan',
  description: 'Turn a short product brief into a deterministic 6-scene storyboard for a DSH plugin demo reel (hook / problem / solution / features / how-to / proof / outro).',
  parameters: {
    name: requiredText('Plugin display name.'),
    brief: text('What the plugin does, ideally one sentence.'),
    proof: text('One proof point, e.g. weekly downloads or stars.'),
  },
  output: {
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        storyboard: {type: 'json', required: true},
      },
    },
    render: (_args, value) => JSON.stringify(value.storyboard, null, 2),
  },
  async execute({name, brief, proof}) {
    return {
      storyboard: {
        durationFrames: 975,
        scenes: [
          {from: 0, duration: 105, label: 'hook', text: '你的 DSH 侧边栏，还只是个文件列表？'},
          {from: 105, duration: 120, label: 'problem', text: '来回切窗口，思路全断。'},
          {from: 225, duration: 150, label: 'solution', text: name + ' — ' + (brief || '一个侧边栏，装下整个开发工作台')},
          {from: 375, duration: 180, label: 'features'},
          {from: 555, duration: 150, label: 'howto', text: '安装 → 打开右侧栏 → 按 tab 使用'},
          {from: 705, duration: 150, label: 'proof', text: proof || ''},
          {from: 855, duration: 120, label: 'outro'},
        ],
      },
    };
  },
});

const render = defineTool({
  name: 'reel_render',
  description: 'Render a plugin reel from a case JSON: a 16:9 promo video, a 3:4 promo image, or both. Long-running local Chrome/Remotion render; writes under dsh-reel/studio/out.',
  parameters: {
    caseFile: requiredText('Path to a reel case JSON.'),
    mode: {type: 'string', enum: ['video', 'image', 'both'], description: 'video: MP4 + poster; image: promo card PNG; both: all. Default both.'},
    posterFrame: text('Optional frame for the video poster. Default 825.'),
  },
  output: {
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        video: text('Promo video path when mode includes video.'),
        poster: text('Video poster path when mode includes video.'),
        image: text('Promo card PNG path when mode includes image.'),
      },
    },
    render: (_args, value) =>
      [value.video ? 'video: ' + value.video : '', value.poster ? 'poster: ' + value.poster : '', value.image ? 'image: ' + value.image : '']
        .filter(Boolean)
        .join('\n'),
  },
  timeoutMs: 900000,
  async execute({caseFile, mode, posterFrame}) {
    const args = [join(root, 'scripts', 'reel.mjs'), '--case', resolve(caseFile)];
    if (mode) args.push('--mode', String(mode));
    if (posterFrame) args.push('--poster-frame', String(posterFrame));
    const {stdout, stderr} = await run(process.execPath, args, {maxBuffer: 20 * 1024 * 1024});
    process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    const pick = (tag) => {
      const line = stdout.split('\n').find((l) => l.includes('[reel] ' + tag));
      return line ? line.split('->').pop().trim() : '';
    };
    return {video: pick('video'), poster: pick('poster'), image: pick('image')};
  },
});

export const name = 'dsh-reel';
export const inject = ['tools'];

export function apply(ctx) {
  ctx.tools.register(scan);
  ctx.tools.register(plan);
  ctx.tools.register(render);
}
