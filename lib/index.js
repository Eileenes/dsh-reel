// Host half of dsh-reel-studio: agent tools plus the panel's HTTP API.
//
// The panel (lib/client.js) and the agent tools both drive the same studio instance
// from lib/server.js, so an action has one implementation and two callers.
import {defineTool} from '@deepseek-ai/dsh-tools';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createStudio, API_PREFIX} from './server.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const text = (s) => ({type: 'string', description: s});
const requiredText = (s) => ({type: 'string', required: true, description: s});

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

/** Tools bound to one studio instance, registered by apply(). */
function createTools(studio) {
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
      return studio.scanRepo(target);
    },
  });

  const render = defineTool({
    name: 'reel_render',
    description: 'Render a plugin reel from a case JSON: a 16:9 promo video, a 3:4 promo image, or both. Long-running local Chrome/Remotion render; writes under studio/out. The Reel Studio panel shows the same job and its progress.',
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
          jobId: text('Studio job id, visible in the Reel Studio panel.'),
        },
      },
      render: (_args, value) =>
        [value.video ? 'video: ' + value.video : '', value.poster ? 'poster: ' + value.poster : '', value.image ? 'image: ' + value.image : '']
          .filter(Boolean)
          .join('\n'),
    },
    timeoutMs: 900000,
    async execute({caseFile, mode, posterFrame}) {
      let job;
      try {
        job = studio.startRender({casePath: resolve(caseFile), mode, posterFrame});
      } catch (err) {
        throw new Error('cannot start the render: ' + (err?.message ?? err));
      }
      const finished = await studio.wait(job.id);
      if (!finished) throw new Error('render job ' + job.id + ' disappeared');
      if (finished.state !== 'done') {
        const detail = finished.error || finished.state;
        throw new Error('render ' + finished.state + ': ' + detail + (finished.log.length ? '\n' + finished.log.slice(-12).join('\n') : ''));
      }
      const output = (path) => (path ? studio.displayPath(path) : '');
      return {
        video: output(finished.outputs.video),
        poster: output(finished.outputs.poster),
        image: output(finished.outputs.image),
        jobId: finished.id,
      };
    },
  });

  return [scan, plan, render];
}

export const name = 'dsh-reel-studio';
export const inject = ['tools', 'webServer', 'connection'];

export function apply(ctx) {
  ctx.effect(() => {
    const studio = createStudio({root});
    const disposers = createTools(studio).map((tool) => ctx.tools.register(tool));

    const disconnect = ctx.webServer.register({
      kind: 'prefix',
      path: API_PREFIX,
      handler: (req, res) => {
        const connection = ctx.get('connection');
        if (connection && typeof connection.requestRejection === 'function') {
          const rejected = connection.requestRejection({headers: req.headers});
          if (rejected) {
            res.writeHead(rejected, {'content-type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({error: 'unauthorized'}));
            return;
          }
        }
        studio.handle(req, res);
      },
    });

    return () => {
      for (const dispose of disposers) dispose();
      disconnect();
      studio.dispose();
    };
  }, 'dsh-reel: studio tools and panel API');
}
