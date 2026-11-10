// dsh-reel-studio · browser half.
//
// Registers one sidebar panel icon ("Reel Studio") and its main page. The page is
// plain React rendered into the host's main slot, so it inherits theme tokens and
// locale; it talks to the host half over /dsh-reel/api (same origin).
// Page styles are assigned at the bottom of this file, after the factory registers;
// App only reads them once React renders, which is later than module evaluation.
let CSS = '';

window.__ModuleLoader__.load({
  id: 'dsh-reel-studio',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const useState = React.useState;
    const useEffect = React.useEffect;
    const useRef = React.useRef;
    const useCallback = React.useCallback;

    const PANEL = 'dsh-reel';
    const API = '/dsh-reel/api';

    const DICT = {
      zh: {
        panelTitle: 'Reel Studio',
        subtitle: '插件宣传片工作台：选案例 → 生成 → 预览产物',
        refresh: '刷新',
        renderer: '渲染器',
        browser: '浏览器',
        ok: '就绪',
        missing: '缺失',
        notReadyTitle: '还没有可用的渲染环境',
        notReadyBody:
          '在插件目录跑一次 pnpm install（或 cd studio && pnpm install），装好 Remotion 和 Chrome 之后回来刷新。也可以先交给对话里的 agent 渲染。',
        handoff: '交给 agent 生成',
        handoffPrompt:
          '用 dsh-reel 帮我生成一条插件宣传片：先用 reel_scan 扫描目标插件仓库，再用 reel_plan 出分镜，最后用 reel_render 渲染案例。',
        cases: '案例',
        noCases: 'cases/ 下还没有案例 JSON。',
        notRenderable: '这个案例是 v01 分镜素材，缺少 promo 地址，当前渲染器不能直接渲染；可以选带 promo 的案例。',
        features: '能做什么',
        feature_scan: '扫描插件',
        feature_scan_desc: '读仓库的 package.json / README / 截图',
        feature_plan: '出分镜',
        feature_plan_desc: '6 段式宣传片结构，可直接改文案',
        feature_render: '渲染物料',
        feature_render_desc: '16:9 视频 + 封面 + 3:4 宣传图',
        generate: '生成物料',
        generating: '正在提交…',
        mode: '产物',
        mode_both: '视频 + 图',
        mode_video: '只出视频',
        mode_image: '只出图',
        posterFrame: '封面帧',
        jobs: '任务',
        noJobs: '还没有任务，点上面的「生成物料」开始。',
        outputs: '产物',
        noOutputs: 'studio/out 里还没有产物。',
        copyPath: '复制路径',
        copied: '已复制',
        cancel: '取消',
        state_queued: '排队中',
        state_running: '渲染中',
        state_done: '完成',
        state_failed: '失败',
        state_cancelled: '已取消',
        phase_prepare: '准备中',
        phase_validate: '校验案例',
        phase_props: '写出 props',
        phase_render: '渲染中',
        'phase_render:video': '渲染视频',
        'phase_render:poster': '渲染封面',
        'phase_render:image': '渲染宣传图',
        phase_done: '已完成',
        phase_starting: '启动渲染器',
        phase_queued: '排队中',
        seconds: '秒',
        log: '日志',
      },
      en: {
        panelTitle: 'Reel Studio',
        subtitle: 'Promo workshop: pick a case → render → preview the assets',
        refresh: 'Refresh',
        renderer: 'Renderer',
        browser: 'Browser',
        ok: 'ready',
        missing: 'missing',
        notReadyTitle: 'No render environment yet',
        notReadyBody:
          'Run pnpm install once in the plugin folder (or cd studio && pnpm install) to install Remotion and Chrome, then come back and refresh. You can also hand the render to the agent.',
        handoff: 'Hand off to agent',
        handoffPrompt:
          'Use dsh-reel to make a promo reel: run reel_scan on the target plugin repo, then reel_plan for the storyboard, then reel_render for the case.',
        cases: 'Cases',
        noCases: 'No case JSON under cases/ yet.',
        notRenderable: 'This is a v01 storyboard case without a promo address, so the renderer cannot use it yet. Pick a case that has one.',
        features: 'What it does',
        feature_scan: 'Scan plugin',
        feature_scan_desc: 'Reads package.json / README / screenshots',
        feature_plan: 'Storyboard',
        feature_plan_desc: 'Six-section reel outline, editable copy',
        feature_render: 'Render assets',
        feature_render_desc: '16:9 video, poster and 3:4 promo card',
        generate: 'Render assets',
        generating: 'Submitting…',
        mode: 'Output',
        mode_both: 'Video + image',
        mode_video: 'Video only',
        mode_image: 'Image only',
        posterFrame: 'Poster frame',
        jobs: 'Jobs',
        noJobs: 'No job yet — press “Render assets” above.',
        outputs: 'Outputs',
        noOutputs: 'No output under studio/out yet.',
        copyPath: 'Copy path',
        copied: 'Copied',
        cancel: 'Cancel',
        state_queued: 'Queued',
        state_running: 'Rendering',
        state_done: 'Done',
        state_failed: 'Failed',
        state_cancelled: 'Cancelled',
        phase_prepare: 'Preparing',
        phase_validate: 'Validating case',
        phase_props: 'Writing props',
        phase_render: 'Rendering',
        'phase_render:video': 'Rendering video',
        'phase_render:poster': 'Rendering poster',
        'phase_render:image': 'Rendering promo image',
        phase_done: 'Done',
        phase_starting: 'Starting renderer',
        phase_queued: 'Queued',
        seconds: 's',
        log: 'Log',
      },
    };

    function currentLang(ctx) {
      try {
        const locale = ctx && ctx.get ? ctx.get('locale') : undefined;
        const active = locale && locale.getLocale ? locale.getLocale().active : '';
        if (typeof active === 'string' && active) return /^zh/i.test(active) ? 'zh' : 'en';
      } catch {
        // fall through to the browser language
      }
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.language === 'string' && /^zh/i.test(navigator.language)) return 'zh';
      } catch {
        // keep English
      }
      return 'en';
    }

    function translator(ctx) {
      const lang = currentLang(ctx);
      const dict = DICT[lang] || DICT.en;
      return (key, fallback) => {
        if (Object.prototype.hasOwnProperty.call(dict, key) && dict[key]) return dict[key];
        if (Object.prototype.hasOwnProperty.call(DICT.en, key) && DICT.en[key]) return DICT.en[key];
        return fallback || key;
      };
    }

    function ReelIcon({size = 18, active}) {
      const edge = size || 18;
      return h(
        'svg',
        {
          width: edge,
          height: edge,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: active ? 2 : 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: {display: 'block'},
        },
        h('rect', {x: 3, y: 6, width: 18, height: 14, rx: 2.5}),
        h('path', {d: 'M3 10h18'}),
        h('path', {d: 'M7 6l2-2.5M13 6l2-2.5M12 13.2l3.6 1.9-3.6 1.9z'}),
      );
    }

    function formatSize(bytes) {
      if (typeof bytes !== 'number' || bytes < 0) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
      return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }

    function Section({title, extra, children}) {
      return h(
        'section',
        {className: 'reel-section'},
        h('div', {className: 'reel-section-head'}, h('h2', {className: 'reel-section-title'}, title), extra || null),
        children,
      );
    }

    function EnvBadge({ok, label}) {
      return h(
        'span',
        {className: 'reel-badge'},
        h('span', {className: 'reel-dot' + (ok ? ' is-ok' : ' is-bad')}),
        label,
      );
    }

    function JobCard({job, t, logRef, onCancel}) {
      const phase = t('phase_' + String(job.phase || ''), job.phase);
      const percent = typeof job.progress === 'number' ? Math.round(job.progress * 100) : null;
      const elapsed = job.startedAt ? Math.max(0, Math.round((((job.endedAt || Date.now())) - job.startedAt) / 1000)) : 0;
      const active = job.state === 'running' || job.state === 'queued';
      return h(
        'div',
        {className: 'reel-job'},
        h(
          'div',
          {className: 'reel-job-head'},
          h('span', {className: 'reel-job-title', title: job.casePath}, job.title),
          h('span', {className: 'reel-state is-' + job.state}, t('state_' + job.state, job.state)),
        ),
        h(
          'div',
          {className: 'reel-row'},
          h(
            'span',
            {className: 'reel-muted'},
            phase + (percent !== null ? ' · ' + percent + '%' : '') + (job.state === 'running' ? ' · ' + elapsed + t('seconds') : ''),
          ),
          active ? h('button', {className: 'reel-btn reel-mini', type: 'button', onClick: () => onCancel(job.id)}, t('cancel')) : null,
        ),
        h(
          'div',
          {className: 'reel-track'},
          h('div', {
            className: 'reel-fill' + (percent === null ? ' is-indeterminate' : ''),
            style: percent === null ? undefined : {width: percent + '%'},
          }),
        ),
        job.error ? h('div', {className: 'reel-alert reel-alert-error'}, job.error) : null,
        job.logTail && job.logTail.length
          ? h('pre', {className: 'reel-log', ref: logRef}, job.logTail.join('\n'))
          : null,
      );
    }

    function OutputCard({item, t, onCopy}) {
      const isVideo = /\.(mp4|webm|mov)$/i.test(item.name);
      return h(
        'div',
        {className: 'reel-output'},
        item.url
          ? isVideo
            ? h('video', {className: 'reel-thumb', src: item.url, controls: true, preload: 'metadata'})
            : h('img', {className: 'reel-thumb', src: item.url, alt: item.name, loading: 'lazy'})
          : null,
        h('span', {className: 'reel-output-name', title: item.path}, item.name),
        h(
          'div',
          {className: 'reel-output-meta'},
          h('span', null, formatSize(item.size)),
          h('button', {className: 'reel-btn reel-mini', type: 'button', onClick: () => onCopy(item.path)}, t('copyPath')),
        ),
      );
    }

    function App({ctx}) {
      const t = translator(ctx);
      const [state, setState] = useState(null);
      const [error, setError] = useState('');
      const [selected, setSelected] = useState('');
      const [mode, setMode] = useState('both');
      const [posterFrame, setPosterFrame] = useState('825');
      const [posting, setPosting] = useState(false);
      const [copied, setCopied] = useState('');
      const logRef = useRef(null);
      const running = state && state.running ? state.running : null;
      const ready = Boolean(state && state.env && state.env.renderer && state.env.renderer.found);

      const refresh = useCallback(() => {
        fetch(API + '/state', {cache: 'no-store'})
          .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then((data) => {
            setState(data);
            setError('');
          })
          .catch((err) => setError(String((err && err.message) || err)));
      }, []);

      useEffect(() => {
        refresh();
        const timer = setInterval(refresh, running ? 800 : 2500);
        return () => clearInterval(timer);
      }, [refresh, running]);

      useEffect(() => {
        if (!state || !state.cases || !state.cases.length) return;
        if (!selected || !state.cases.some((item) => item.id === selected)) setSelected(state.cases[0].id);
      }, [state, selected]);

      useEffect(() => {
        const node = logRef.current;
        if (node) node.scrollTop = node.scrollHeight;
      });

      const copy = (text) => {
        try {
          navigator.clipboard.writeText(text);
          setCopied(t('copied'));
          setTimeout(() => setCopied(''), 1500);
        } catch {
          // clipboard is best-effort
        }
      };

      const handoff = () => {
        const prompt = t('handoffPrompt');
        try {
          const ui = ctx && ctx.get ? ctx.get('uiWorkspace') : undefined;
          if (ui && typeof ui.startSession === 'function') {
            ui.startSession(undefined, {prompt, whenDraftExists: 'replace'});
            return;
          }
        } catch {
          // fall back to copying the prompt
        }
        copy(prompt);
      };

      const start = () => {
        if (!selected || posting || !ready) return;
        setPosting(true);
        fetch(API + '/jobs', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            casePath: selected,
            mode,
            posterFrame: posterFrame === '' ? undefined : Number(posterFrame),
          }),
        })
          .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
            refresh();
          })
          .catch((err) => setError(String((err && err.message) || err)))
          .finally(() => setPosting(false));
      };

      const cancel = (id) => {
        fetch(API + '/jobs/' + encodeURIComponent(id) + '/cancel', {method: 'POST'})
          .then(() => refresh())
          .catch(() => {});
      };

      const cases = (state && state.cases) || [];
      const outputs = (state && state.outputs) || [];
      const jobs = (state && state.jobs) || [];
      const activeJob = (running && jobs.find((job) => job.id === running)) || jobs[0] || null;
      const env = (state && state.env) || null;

      const selectedCase = cases.find((item) => item.id === selected) || null;
      const canRender = ready && Boolean(selectedCase && selectedCase.renderable !== false);

      const featureKeys = [
        ['scan', t('feature_scan'), t('feature_scan_desc')],
        ['plan', t('feature_plan'), t('feature_plan_desc')],
        ['render', t('feature_render'), t('feature_render_desc')],
      ];

      return h(
        'div',
        {className: 'reel-page'},
        h('style', null, CSS),
        h(
          'header',
          {className: 'reel-head'},
          h(
            'div',
            {className: 'reel-head-main'},
            h('div', {className: 'reel-logo'}, h(ReelIcon, {size: 22, active: true})),
            h(
              'div',
              null,
              h('h1', {className: 'reel-title'}, t('panelTitle')),
              h('p', {className: 'reel-sub'}, t('subtitle')),
            ),
          ),
          h(
            'div',
            {className: 'reel-head-actions'},
            h(EnvBadge, {ok: Boolean(env && env.renderer && env.renderer.found), label: t('renderer')}),
            h(EnvBadge, {ok: Boolean(env && env.browser && env.browser.found), label: t('browser')}),
            h('button', {className: 'reel-btn', type: 'button', onClick: refresh}, t('refresh')),
          ),
        ),
        error ? h('div', {className: 'reel-alert reel-alert-error'}, error) : null,
        state && !ready
          ? h(
              'div',
              {className: 'reel-alert'},
              h('strong', null, t('notReadyTitle')),
              h('p', null, t('notReadyBody')),
              h('code', {className: 'reel-code'}, 'pnpm install'),
              h(
                'div',
                {className: 'reel-row'},
                h('button', {className: 'reel-btn reel-primary', type: 'button', onClick: handoff}, t('handoff')),
                copied ? h('span', {className: 'reel-copied'}, copied) : null,
              ),
            )
          : null,
        h(
          'div',
          {className: 'reel-grid'},
          h(
            'div',
            {className: 'reel-col'},
            h(
              Section,
              {title: t('features')},
              h(
                'div',
                {className: 'reel-features'},
                featureKeys.map(([key, name, desc]) =>
                  h(
                    'div',
                    {className: 'reel-feature', key},
                    h('span', {className: 'reel-feature-name'}, name),
                    h('span', {className: 'reel-feature-desc'}, desc),
                  ),
                ),
              ),
            ),
            h(
              Section,
              {title: t('cases')},
              cases.length
                ? h(
                    'div',
                    {className: 'reel-cases'},
                    cases.map((item) =>
                      h(
                        'button',
                        {
                          key: item.id,
                          type: 'button',
                          className: 'reel-case' + (item.id === selected ? ' is-active' : ''),
                          onClick: () => setSelected(item.id),
                        },
                        h('span', {className: 'reel-case-title'}, item.title),
                        item.meta ? h('span', {className: 'reel-case-meta'}, item.meta) : null,
                        item.desc ? h('span', {className: 'reel-case-desc'}, item.desc) : null,
                      ),
                    ),
                  )
                : h('p', {className: 'reel-muted'}, t('noCases')),
            ),
            h(
              Section,
              {title: t('generate')},
              h(
                'div',
                {className: 'reel-form'},
                h(
                  'label',
                  {className: 'reel-field'},
                  t('mode'),
                  h(
                    'div',
                    {className: 'reel-seg'},
                    ['both', 'video', 'image'].map((value) =>
                      h(
                        'button',
                        {
                          key: value,
                          type: 'button',
                          className: 'reel-seg-btn' + (mode === value ? ' is-active' : ''),
                          onClick: () => setMode(value),
                        },
                        t('mode_' + value),
                      ),
                    ),
                  ),
                ),
                h(
                  'label',
                  {className: 'reel-field'},
                  t('posterFrame'),
                  h('input', {
                    className: 'reel-input',
                    type: 'number',
                    min: 0,
                    value: posterFrame,
                    onChange: (event) => setPosterFrame(event.target.value),
                  }),
                ),
                h(
                  'div',
                  {className: 'reel-row'},
                  h(
                    'button',
                    {
                      className: 'reel-btn reel-primary',
                      type: 'button',
                      disabled: posting || !selected || !canRender,
                      onClick: start,
                    },
                    posting ? t('generating') : t('generate'),
                  ),
                  h('button', {className: 'reel-btn', type: 'button', onClick: handoff}, t('handoff')),
                  copied && !ready ? h('span', {className: 'reel-copied'}, copied) : null,
                ),
                selectedCase && selectedCase.renderable === false
                  ? h('p', {className: 'reel-muted'}, t('notRenderable'))
                  : null,
              ),
            ),
          ),
          h(
            'div',
            {className: 'reel-col'},
            h(
              Section,
              {title: t('jobs')},
              activeJob
                ? h(JobCard, {job: activeJob, t, logRef, onCancel: cancel})
                : h('p', {className: 'reel-muted'}, t('noJobs')),
              jobs.length > 1
                ? h(
                    'div',
                    {className: 'reel-cases'},
                    jobs
                      .filter((job) => !activeJob || job.id !== activeJob.id)
                      .slice(0, 8)
                      .map((job) =>
                        h(
                          'div',
                          {className: 'reel-case', key: job.id},
                          h('span', {className: 'reel-case-title'}, job.title),
                          h('span', {className: 'reel-case-meta'}, t('state_' + job.state, job.state)),
                        ),
                      ),
                  )
                : null,
            ),
            h(
              Section,
              {title: t('outputs')},
              outputs.length
                ? h(
                    'div',
                    {className: 'reel-outputs'},
                    outputs.map((item) => h(OutputCard, {key: item.name, item, t, onCopy: copy})),
                  )
                : h('p', {className: 'reel-muted'}, t('noOutputs')),
            ),
          ),
        ),
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const label = () => translator(ctx)('panelTitle');
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register({name: 'sidebar.panellist', id: PANEL, order: 30, label}, ReelIcon),
        );
        ctx.slots.inject('main', () => ctx.slots.register({name: 'main', key: PANEL}, () => h(App, {ctx})));
      },
    };
  },
});

CSS = `
.reel-page{--reel-radius:10px;display:flex;flex-direction:column;gap:14px;height:100%;overflow:auto;padding:22px 24px 40px;box-sizing:border-box;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55}
.reel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.reel-head-main{display:flex;align-items:center;gap:12px}
.reel-logo{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:11px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-brand-primary)}
.reel-title{margin:0;font-size:19px;font-weight:600;letter-spacing:.01em}
.reel-sub{margin:2px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.reel-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.reel-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:11px;color:var(--dsw-alias-label-secondary)}
.reel-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary)}
.reel-dot.is-ok{background:var(--dsw-alias-state-success-primary)}
.reel-dot.is-bad{background:var(--dsw-alias-state-error-primary)}
.reel-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer;transition:background .15s,border-color .15s}
.reel-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.reel-btn:disabled{opacity:.45;cursor:default}
.reel-btn.reel-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff;font-weight:600}
.reel-btn.reel-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.reel-alert{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:var(--reel-radius);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px}
.reel-alert strong{color:var(--dsw-alias-label-primary);font-size:13px}
.reel-alert p{margin:0}
.reel-alert-error{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.reel-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;padding:2px 7px;border-radius:5px;background:var(--dsw-alias-markdown-inline-code);color:var(--dsw-alias-label-primary);align-self:flex-start}
.reel-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}
@media (max-width:920px){.reel-grid{grid-template-columns:minmax(0,1fr)}}
.reel-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.reel-section{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:var(--reel-radius);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.reel-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.reel-section-title{margin:0;font-size:13px;font-weight:600}
.reel-muted{color:var(--dsw-alias-label-secondary);font-size:12px;margin:0}
.reel-features{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.reel-feature{display:flex;flex-direction:column;gap:2px;padding:9px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);min-width:0}
.reel-feature-name{font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-primary)}
.reel-feature-desc{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.45}
.reel-cases{display:flex;flex-direction:column;gap:6px;max-height:280px;overflow:auto}
.reel-case{appearance:none;text-align:left;display:flex;flex-direction:column;gap:2px;padding:9px 11px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:inherit;font:inherit;cursor:pointer}
.reel-case:hover{border-color:var(--dsw-alias-border-l2)}
.reel-case.is-active{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary) inset}
.reel-case-title{font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.reel-case-meta{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.reel-case-desc{font-size:11px;color:var(--dsw-alias-label-secondary)}
.reel-form{display:flex;flex-direction:column;gap:10px}
.reel-field{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.reel-seg{display:inline-flex;gap:4px;padding:3px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);align-self:flex-start}
.reel-seg-btn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;padding:4px 12px;border-radius:6px;cursor:pointer}
.reel-seg-btn.is-active{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.reel-input{width:110px;padding:5px 9px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}
.reel-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.reel-copied{font-size:11px;color:var(--dsw-alias-state-success-primary)}
.reel-job{display:flex;flex-direction:column;gap:8px}
.reel-job-head{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}
.reel-job-title{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.reel-state{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.reel-state.is-running{color:var(--dsw-alias-brand-primary)}
.reel-state.is-done{color:var(--dsw-alias-state-success-primary)}
.reel-state.is-failed{color:var(--dsw-alias-state-error-primary)}
.reel-track{height:6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
.reel-fill{height:100%;background:var(--dsw-alias-brand-primary);transition:width .3s ease}
.reel-fill.is-indeterminate{width:35%;animation:reel-pulse 1.2s ease-in-out infinite}
@keyframes reel-pulse{0%{transform:translateX(-120%)}100%{transform:translateX(340%)}}
.reel-log{max-height:190px;overflow:auto;margin:0;padding:9px 10px;border-radius:8px;background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.reel-outputs{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.reel-output{display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);min-width:0}
.reel-thumb{width:100%;height:110px;object-fit:cover;border-radius:6px;background:#000;display:block}
.reel-output-name{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.reel-output-meta{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.reel-mini{padding:2px 7px;font-size:10.5px}
`;
