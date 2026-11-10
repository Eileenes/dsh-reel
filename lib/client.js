// dsh-reel-studio · browser half ("插件宣传台").
//
// One sidebar panel and one page: a bordered generate box with built-in guidance,
// then a step-by-step pipeline where each step shows what it just produced
// (storyboard -> promo image -> poster -> video). The case lives behind the "?"
// help dot in the header; hover it to read the case and the process.
// Page styles are assigned at the bottom of this file, after the factory registers.
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
        panelTitle: '插件宣传台',
        helpLabel: '这个面板是怎么工作的',
        caseLabel: '这次介绍',
        processTitle: '生成过程',
        logShow: '查看日志',
        logHide: '收起日志',
        cancel: '取消',
        genTitle: '生成一条宣传物料',
        genHint: '写一句需求，选好要产出什么，点「开始生成」。下面会按步骤出现分镜、图片和成片。',
        demandLabel: '需求',
        demandPlaceholder: '例如：一句话，把游戏放进 DSH 侧栏',
        demandHint: '这句话会用在分镜的开场，也会作为本次任务说明。',
        outputLabel: '产出',
        mode_both: '图 + 视频',
        mode_video: '只出视频',
        mode_image: '只出图',
        posterFrame: '关键帧',
        posterFrameHelp: '封面帧：从成片里截第几帧当封面。数字是帧序号，30fps 下 825 ≈ 第 27.5 秒；没有特别要求就保持默认 825。',
        generate: '开始生成',
        generating: '正在提交…',
        regenerate: '重新生成',
        needBrief: '先写一句需求再生成。',
        stageStoryboardTitle: '分镜',
        stageStoryboardDesc: '先把结构定下来：开场 / 问题 / 方案 / 功能 / 用法 / 片尾',
        stageImageTitle: '宣传图 · 3:4',
        stageImageDesc: '竖版图，适合发动态或当封面图',
        stagePosterTitle: '封面 · 16:9',
        stagePosterDesc: '成片里截取的一帧，当视频封面',
        stageVideoTitle: '成片 · 16:9',
        stageVideoDesc: '完整宣传视频',
        statusWait: '等待中',
        statusActive: '生成中',
        statusDone: '已完成',
        statusFailed: '失败',
        statusSkipped: '已跳过',
        pendingHint: '排队中，轮到这一步会自动开始',
        emptyStoryboard: '分镜还没生成',
        state_queued: '排队中',
        state_running: '生成中',
        state_done: '完成',
        state_failed: '失败',
        state_cancelled: '已取消',
        phase_prepare: '准备中',
        phase_validate: '校验案例',
        phase_props: '准备分镜数据',
        phase_render: '渲染中',
        'phase_render:image': '生成宣传图',
        'phase_render:poster': '生成封面',
        'phase_render:video': '渲染成片',
        phase_done: '完成',
        phase_starting: '启动渲染器',
        phase_queued: '排队中',
        seconds: '秒',
        doneHint: '全部完成，产物就在上面。',
        notReadyTitle: '渲染环境还没就绪',
        notReadyBody: '在插件目录跑一次 pnpm install 装好 Remotion 后刷新页面。',
        handoff: '交给 agent 生成',
        handoffPrompt: '用 dsh-reel 帮我生成一条插件宣传片：先用 reel_storyboard 看分镜，再用 reel_render 渲染内置案例。',
        copyPath: '复制路径',
        copied: '已复制',
      },
      en: {
        panelTitle: 'Plugin Promo Studio',
        helpLabel: 'How this panel works',
        caseLabel: 'Introducing',
        processTitle: 'Process',
        logShow: 'Show log',
        logHide: 'Hide log',
        cancel: 'Cancel',
        genTitle: 'Generate promo assets',
        genHint: 'Write one requirement, pick the outputs, then press Generate. The storyboard, images and video appear below step by step.',
        demandLabel: 'Requirement',
        demandPlaceholder: 'e.g. one line, put a game into the DSH sidebar',
        demandHint: 'This line becomes the opening scene copy and the task note.',
        outputLabel: 'Outputs',
        mode_both: 'Image + video',
        mode_video: 'Video only',
        mode_image: 'Image only',
        posterFrame: 'Poster frame',
        posterFrameHelp: 'Poster frame: which frame of the video becomes the cover. It is a frame number; at 30fps, 825 ≈ second 27.5. Keep 825 unless you need a different moment.',
        generate: 'Generate',
        generating: 'Submitting…',
        regenerate: 'Generate again',
        needBrief: 'Write one requirement first.',
        stageStoryboardTitle: 'Storyboard',
        stageStoryboardDesc: 'Structure first: hook / problem / solution / features / how-to / proof',
        stageImageTitle: 'Promo image · 3:4',
        stageImageDesc: 'Portrait card for social posts',
        stagePosterTitle: 'Poster · 16:9',
        stagePosterDesc: 'A frame from the video used as its cover',
        stageVideoTitle: 'Video · 16:9',
        stageVideoDesc: 'The full promo video',
        statusWait: 'Waiting',
        statusActive: 'Rendering',
        statusDone: 'Done',
        statusFailed: 'Failed',
        statusSkipped: 'Skipped',
        pendingHint: 'Queued; starts automatically when the previous step finishes',
        emptyStoryboard: 'Storyboard not generated yet',
        state_queued: 'Queued',
        state_running: 'Generating',
        state_done: 'Done',
        state_failed: 'Failed',
        state_cancelled: 'Cancelled',
        phase_prepare: 'Preparing',
        phase_validate: 'Validating case',
        phase_props: 'Preparing storyboard data',
        phase_render: 'Rendering',
        'phase_render:image': 'Promo image',
        'phase_render:poster': 'Poster',
        'phase_render:video': 'Video',
        phase_done: 'Done',
        phase_starting: 'Starting renderer',
        phase_queued: 'Queued',
        seconds: 's',
        doneHint: 'All done; the artifacts are above.',
        notReadyTitle: 'Render environment is not ready',
        notReadyBody: 'Run pnpm install once in the plugin folder to install Remotion, then refresh.',
        handoff: 'Hand off to agent',
        handoffPrompt: 'Use dsh-reel to make a plugin promo: reel_storyboard first, then reel_render on the built-in case.',
        copyPath: 'Copy path',
        copied: 'Copied',
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

    function assetUrl(rel) {
      if (typeof rel !== 'string' || !rel) return undefined;
      const clean = rel.replace(/^\.?\//, '').replace(/^studio\/public\//, '');
      if (clean.includes('..')) return undefined;
      return API + '/asset/' + clean.split('/').map(encodeURIComponent).join('/');
    }

    /** Display mapping from a case JSON to the storyboard cards. */
    function buildScenes(caseData, brief) {
      if (!caseData || typeof caseData !== 'object') return [];
      const plugin = caseData.plugin || {};
      const promo = caseData.promo || {};
      const features = Array.isArray(caseData.features) ? caseData.features : [];
      const requirement = String(brief || '').trim() || String(promo.hook?.sub || plugin.tagline || '');
      const scenes = [
        {
          id: 'hook',
          no: '01',
          label: '开场',
          title: [promo.hook?.line1, promo.hook?.line2].filter(Boolean).join('') || String(plugin.name || ''),
          text: requirement,
          image: promo.hook?.bg || promo.solution?.img || features[0]?.img,
        },
        {
          id: 'problem',
          no: '02',
          label: '问题',
          title: String(promo.problemScene?.title || promo.problem || ''),
          text: String(promo.problemScene?.sub || ''),
          chips: Array.isArray(promo.problemScene?.chips) ? promo.problemScene.chips.map(String) : [],
        },
        {
          id: 'solution',
          no: '03',
          label: '方案',
          title: String(promo.solution?.title || plugin.name || '').replace(/\n/g, ' '),
          text: String(promo.solution?.sub || promo.what || ''),
          image: promo.solution?.img,
        },
      ];
      for (let index = 0; index < features.length; index += 1) {
        const feature = features[index] || {};
        scenes.push({
          id: 'feature-' + String(feature.no || index + 1),
          no: '04',
          label: '功能 ' + String(feature.no || index + 1),
          title: String(feature.title || ''),
          text: String(feature.desc || ''),
          image: feature.img,
          accent: typeof feature.accent === 'string' ? feature.accent : undefined,
        });
      }
      scenes.push({
        id: 'howto',
        no: '05',
        label: '用法',
        title: String(promo.howto?.title || ''),
        steps: Array.isArray(promo.howto?.steps)
          ? promo.howto.steps.map((step) => ({title: String(step?.title || ''), desc: String(step?.desc || '')}))
          : [],
      });
      scenes.push({
        id: 'proof',
        no: '06',
        label: '片尾',
        title: String(promo.proof?.title || ''),
        stats: Array.isArray(promo.proof?.stats)
          ? promo.proof.stats.map((stat) => ({num: String(stat?.num || ''), label: String(stat?.label || '')}))
          : [],
        image: promo.outroLogo,
      });
      return scenes;
    }

    /** Hover/focus popover used by the header "?" and the poster-frame help. */
    function HelpDot({label, align = 'right', wide, children}) {
      return h(
        'span',
        {className: 'reel-help', tabIndex: 0, role: 'note', 'aria-label': label},
        h('span', {className: 'reel-help-dot', 'aria-hidden': true}, '?'),
        h('span', {className: 'reel-help-pop is-' + align + (wide ? ' is-wide' : '')}, children),
      );
    }

    function SceneCard({scene}) {
      const img = assetUrl(scene.image);
      return h(
        'article',
        {className: 'reel-scene'},
        h(
          'div',
          {className: 'reel-scene-head'},
          h('span', {className: 'reel-scene-no'}, scene.no),
          h('span', {className: 'reel-scene-label'}, scene.label),
        ),
        img ? h('img', {className: 'reel-scene-img', src: img, alt: scene.title || scene.label, loading: 'lazy'}) : null,
        h('h3', {className: 'reel-scene-title'}, scene.title || scene.label),
        scene.text ? h('p', {className: 'reel-scene-text'}, scene.text) : null,
        scene.chips && scene.chips.length
          ? h('div', {className: 'reel-chips'}, scene.chips.map((chip, index) => h('span', {className: 'reel-chip', key: String(index)}, chip)))
          : null,
        scene.steps && scene.steps.length
          ? h(
              'div',
              {className: 'reel-howto'},
              scene.steps.map((step, index) =>
                h('span', {className: 'reel-howto-step', key: String(index)}, h('strong', null, step.title), step.desc),
              ),
            )
          : null,
        scene.stats && scene.stats.length
          ? h(
              'div',
              {className: 'reel-stats'},
              scene.stats.map((stat, index) => h('span', {className: 'reel-stat', key: String(index)}, h('strong', null, stat.num), stat.label)),
            )
          : null,
      );
    }

    function StagePreview({kind, job, scenes, t}) {
      const artifact = job.outputs && job.outputs[kind];
      if (kind === 'storyboard') {
        return scenes.length
          ? h('div', {className: 'reel-stage-scenes'}, scenes.map((scene) => h(SceneCard, {key: scene.id, scene})))
          : h('p', {className: 'reel-muted'}, t('emptyStoryboard'));
      }
      if (!artifact) {
        return h('div', {className: 'reel-stage-skeleton'}, h('span', {className: 'reel-pulse'}));
      }
      if (kind === 'video') {
        return h('video', {className: 'reel-stage-media', src: artifact.url, controls: true, preload: 'metadata'});
      }
      return h('img', {className: 'reel-stage-media', src: artifact.url, alt: t('artifact_' + kind)});
    }

    function Process({t, job, scenes, kinds, showLog, setShowLog, onCancel, onCopy, copied, logRef}) {
      const phase = t('phase_' + String(job.phase || ''), job.phase);
      const percent = typeof job.progress === 'number' ? Math.round(job.progress * 100) : null;
      const elapsed = job.startedAt ? Math.max(0, Math.round((((job.endedAt || Date.now())) - job.startedAt) / 1000)) : 0;
      const stageMeta = {
        storyboard: {title: t('stageStoryboardTitle'), desc: t('stageStoryboardDesc')},
        image: {title: t('stageImageTitle'), desc: t('stageImageDesc')},
        poster: {title: t('stagePosterTitle'), desc: t('stagePosterDesc')},
        video: {title: t('stageVideoTitle'), desc: t('stageVideoDesc')},
      };
      return h(
        'section',
        {className: 'reel-panel reel-process'},
        h(
          'div',
          {className: 'reel-panel-head'},
          h('h2', {className: 'reel-panel-title'}, t('processTitle')),
          h(
            'div',
            {className: 'reel-row'},
            h('span', {className: 'reel-state is-' + job.state}, t('state_' + job.state, job.state)),
            job.state === 'running' || job.state === 'queued'
              ? h('button', {className: 'reel-btn reel-mini', type: 'button', onClick: onCancel}, t('cancel'))
              : null,
          ),
        ),
        h(
          'div',
          {className: 'reel-row reel-progress-line'},
          h(
            'span',
            {className: 'reel-muted'},
            phase + (percent !== null ? ' · ' + percent + '%' : '') + (job.state === 'running' ? ' · ' + elapsed + t('seconds') : ''),
          ),
          h('button', {className: 'reel-btn reel-mini', type: 'button', onClick: () => setShowLog(!showLog)}, showLog ? t('logHide') : t('logShow')),
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
        showLog && job.logTail && job.logTail.length ? h('pre', {className: 'reel-log', ref: logRef}, job.logTail.join('\n')) : null,
        h(
          'div',
          {className: 'reel-stages'},
          kinds.map((kind, index) => {
            const meta = stageMeta[kind];
            const artifact = job.outputs && job.outputs[kind];
            const isCurrent = job.phase === 'render:' + kind;
            const status = kind === 'storyboard' ? 'done' : artifact ? 'done' : isCurrent ? 'active' : job.state === 'failed' && !artifact ? 'skipped' : job.state === 'done' ? 'skipped' : 'wait';
            return h(
              'div',
              {className: 'reel-stage is-' + status, key: kind},
              h(
                'div',
                {className: 'reel-stage-head'},
                h('span', {className: 'reel-stage-no'}, String(index + 1).padStart(2, '0')),
                h(
                  'span',
                  {className: 'reel-stage-titlebox'},
                  h('span', {className: 'reel-stage-title'}, meta.title),
                  h('span', {className: 'reel-stage-desc'}, meta.desc),
                ),
                h('span', {className: 'reel-stage-status is-' + status}, t('status' + status.charAt(0).toUpperCase() + status.slice(1))),
              ),
              h('div', {className: 'reel-stage-body'}, h(StagePreview, {kind, job, scenes, t})),
              artifact && kind !== 'video'
                ? h(
                    'div',
                    {className: 'reel-stage-foot'},
                    h('button', {className: 'reel-btn reel-mini', type: 'button', onClick: () => onCopy(artifact.path)}, t('copyPath')),
                    copied ? h('span', {className: 'reel-copied'}, copied) : null,
                  )
                : null,
            );
          }),
        ),
        job.state === 'done' ? h('p', {className: 'reel-muted'}, t('doneHint')) : null,
      );
    }

    function App({ctx}) {
      const t = translator(ctx);
      const [state, setState] = useState(null);
      const [caseData, setCaseData] = useState(null);
      const [error, setError] = useState('');
      const [brief, setBrief] = useState('');
      const [briefTouched, setBriefTouched] = useState(false);
      const [mode, setMode] = useState('both');
      const [posterFrame, setPosterFrame] = useState('825');
      const [posting, setPosting] = useState(false);
      const [jobId, setJobId] = useState('');
      const [showLog, setShowLog] = useState(false);
      const [copied, setCopied] = useState('');
      const logRef = useRef(null);

      const env = (state && state.env) || null;
      const ready = Boolean(env && env.renderer && env.renderer.found);
      const summary = (state && state.defaultCase) || null;
      const summaryId = summary ? summary.id : '';
      const jobs = (state && state.jobs) || [];
      const job = (jobId && jobs.find((item) => item.id === jobId)) || jobs[0] || null;
      const jobRunning = Boolean(job && (job.state === 'running' || job.state === 'queued'));
      const scenes = buildScenes(caseData, brief);
      const kinds = mode === 'image' ? ['storyboard', 'image'] : mode === 'video' ? ['storyboard', 'poster', 'video'] : ['storyboard', 'image', 'poster', 'video'];

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
        const timer = setInterval(refresh, jobRunning ? 900 : 2500);
        return () => clearInterval(timer);
      }, [refresh, jobRunning]);

      useEffect(() => {
        if (!summaryId) return;
        let alive = true;
        fetch(API + '/case?path=' + encodeURIComponent(summaryId), {cache: 'no-store'})
          .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then((data) => {
            if (alive) setCaseData(data.case);
          })
          .catch(() => {});
        return () => {
          alive = false;
        };
      }, [summaryId]);

      useEffect(() => {
        if (!caseData || briefTouched) return;
        const tagline = (caseData.promo && caseData.promo.hook && caseData.promo.hook.sub) || (caseData.plugin && caseData.plugin.tagline) || '';
        setBrief(String(tagline));
      }, [caseData, briefTouched]);

      useEffect(() => {
        const node = logRef.current;
        if (node) node.scrollTop = node.scrollHeight;
      }, [job && job.logTail && job.logTail.length, showLog]);

      const copy = (text) => {
        if (!text) return;
        try {
          navigator.clipboard.writeText(text);
          setCopied(t('copied'));
          setTimeout(() => setCopied(''), 1500);
        } catch {
          // clipboard is best-effort
        }
      };

      const start = () => {
        if (posting || !ready || !summary) return;
        if (!String(brief).trim()) {
          setError(t('needBrief'));
          return;
        }
        setPosting(true);
        setError('');
        fetch(API + '/jobs', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            casePath: summary.id,
            brief,
            mode,
            posterFrame: posterFrame === '' ? undefined : Number(posterFrame),
          }),
        })
          .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
            if (data.job && data.job.id) setJobId(data.job.id);
            setShowLog(false);
            refresh();
          })
          .catch((err) => setError(String((err && err.message) || err)))
          .finally(() => setPosting(false));
      };

      const cancel = () => {
        if (!job) return;
        fetch(API + '/jobs/' + encodeURIComponent(job.id) + '/cancel', {method: 'POST'})
          .then(() => refresh())
          .catch(() => {});
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

      const helpCase = summary
        ? h(
            'span',
            null,
            h('strong', null, summary.title),
            summary.meta ? h('span', {className: 'reel-help-meta'}, summary.meta) : null,
            summary.desc ? h('span', {className: 'reel-help-text'}, summary.desc) : null,
          )
        : h('span', {className: 'reel-help-text'}, t('caseLabel') + '…');

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
            h('h1', {className: 'reel-title'}, t('panelTitle')),
          ),
          h(
            HelpDot,
            {label: t('helpLabel'), wide: true},
            h(
              'span',
              {className: 'reel-help-block'},
              h('span', {className: 'reel-help-eyebrow'}, t('caseLabel')),
              helpCase,
            ),
            h(
              'span',
              {className: 'reel-help-block'},
              h('span', {className: 'reel-help-eyebrow'}, t('processTitle')),
              h(
                'span',
                {className: 'reel-help-list'},
                h('span', null, '01 ' + t('stageStoryboardTitle') + ' — ' + t('stageStoryboardDesc')),
                h('span', null, '02 ' + t('stageImageTitle') + ' — ' + t('stageImageDesc')),
                h('span', null, '03 ' + t('stagePosterTitle') + ' — ' + t('stagePosterDesc')),
                h('span', null, '04 ' + t('stageVideoTitle') + ' — ' + t('stageVideoDesc')),
              ),
            ),
            h('span', {className: 'reel-help-hint'}, t('genHint')),
          ),
        ),
        error ? h('div', {className: 'reel-alert reel-alert-error'}, error) : null,
        !ready && state
          ? h(
              'div',
              {className: 'reel-alert'},
              h('strong', null, t('notReadyTitle')),
              h('p', null, t('notReadyBody')),
              h('button', {className: 'reel-btn', type: 'button', onClick: handoff}, t('handoff')),
            )
          : null,
        h(
          'section',
          {className: 'reel-panel reel-generate'},
          h('h2', {className: 'reel-panel-title'}, t('genTitle')),
          h('p', {className: 'reel-gen-hint'}, t('genHint')),
          h(
            'div',
            {className: 'reel-field-block'},
            h('label', {className: 'reel-label', htmlFor: 'reel-brief'}, t('demandLabel')),
            h('textarea', {
              id: 'reel-brief',
              className: 'reel-textarea',
              rows: 3,
              value: brief,
              placeholder: t('demandPlaceholder'),
              onChange: (event) => {
                setBrief(event.target.value);
                setBriefTouched(true);
              },
            }),
            h('span', {className: 'reel-muted'}, t('demandHint')),
          ),
          h(
            'div',
            {className: 'reel-form-row'},
            h(
              'div',
              {className: 'reel-field-block'},
              h('span', {className: 'reel-label'}, t('outputLabel')),
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
              'div',
              {className: 'reel-field-block'},
              h(
                'span',
                {className: 'reel-label'},
                t('posterFrame'),
                h(HelpDot, {label: t('posterFrameHelp'), align: 'left'}, h('span', {className: 'reel-help-text'}, t('posterFrameHelp'))),
              ),
              h('input', {
                className: 'reel-input',
                type: 'number',
                min: 0,
                value: posterFrame,
                onChange: (event) => setPosterFrame(event.target.value),
              }),
            ),
            h(
              'button',
              {className: 'reel-btn reel-primary', type: 'button', disabled: posting || !ready || !summary || !String(brief).trim(), onClick: start},
              posting ? t('generating') : job && job.state === 'done' ? t('regenerate') : t('generate'),
            ),
          ),
        ),
        job
          ? h(Process, {
              t,
              job,
              scenes,
              kinds,
              showLog,
              setShowLog,
              onCancel: cancel,
              onCopy: copy,
              copied,
              logRef,
            })
          : null,
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
.reel-page{--reel-radius:12px;display:flex;flex-direction:column;gap:14px;height:100%;overflow:auto;padding:26px 30px 52px;box-sizing:border-box;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55}
.reel-page>*{width:100%;max-width:900px;margin-left:auto;margin-right:auto}
.reel-head{display:flex;align-items:center;justify-content:space-between;gap:14px}
.reel-head-main{display:flex;align-items:center;gap:11px}
.reel-logo{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:11px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-brand-primary)}
.reel-title{margin:0;font-size:19px;font-weight:600;letter-spacing:.01em}
.reel-help{position:relative;display:inline-flex;align-items:center;vertical-align:middle;outline:none}
.reel-help-dot{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:600;cursor:help;user-select:none}
.reel-help:hover .reel-help-dot,.reel-help:focus-within .reel-help-dot{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
.reel-help-pop{display:none;position:absolute;top:calc(100% + 8px);right:0;z-index:20;width:280px;padding:11px 12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);box-shadow:0 10px 28px rgba(0,0,0,.28);flex-direction:column;gap:8px;font-size:11.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);font-weight:400;text-align:left;white-space:normal}
.reel-help:hover .reel-help-pop,.reel-help:focus-within .reel-help-pop{display:flex}
.reel-help-pop.is-left{right:auto;left:0;width:260px}
.reel-help-pop.is-wide{width:340px;right:0}
.reel-help-block{display:flex;flex-direction:column;gap:3px}
.reel-help-eyebrow{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}
.reel-help-block strong{font-size:12.5px;color:var(--dsw-alias-label-primary);font-weight:600}
.reel-help-meta{display:block;font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.reel-help-text{display:block;color:var(--dsw-alias-label-primary)}
.reel-help-list{display:flex;flex-direction:column;gap:3px;color:var(--dsw-alias-label-secondary)}
.reel-help-hint{color:var(--dsw-alias-label-secondary);font-size:11px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:7px}
.reel-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer;transition:background .15s,border-color .15s}
.reel-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.reel-btn:disabled{opacity:.45;cursor:default}
.reel-btn.reel-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff;font-weight:600;padding:8px 20px;margin-left:auto}
.reel-btn.reel-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.reel-alert{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:var(--reel-radius);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px}
.reel-alert strong{color:var(--dsw-alias-label-primary);font-size:13px}
.reel-alert p{margin:0}
.reel-alert-error{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.reel-panel{display:flex;flex-direction:column;gap:12px;padding:18px 20px;border-radius:var(--reel-radius);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.reel-generate{gap:10px;border-color:var(--dsw-alias-border-l2);background:linear-gradient(180deg,var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-2))}
.reel-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.reel-panel-title{margin:0;font-size:14px;font-weight:600}
.reel-gen-hint{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.reel-field-block{display:flex;flex-direction:column;gap:5px;min-width:0}
.reel-label{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-secondary)}
.reel-muted{color:var(--dsw-alias-label-secondary);font-size:11px;margin:0}
.reel-textarea{width:100%;box-sizing:border-box;resize:vertical;min-height:62px;padding:10px 12px;border-radius:9px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.5}
.reel-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.reel-form-row{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-top:2px}
.reel-seg{display:inline-flex;gap:3px;padding:3px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);align-self:flex-start}
.reel-seg-btn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;padding:4px 12px;border-radius:6px;cursor:pointer}
.reel-seg-btn.is-active{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.reel-input{width:84px;padding:5px 8px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;margin-top:2px}
.reel-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.reel-progress-line{justify-content:space-between}
.reel-copied{font-size:11px;color:var(--dsw-alias-state-success-primary)}
.reel-state{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.reel-state.is-running{color:var(--dsw-alias-brand-primary)}
.reel-state.is-done{color:var(--dsw-alias-state-success-primary)}
.reel-state.is-failed{color:var(--dsw-alias-state-error-primary)}
.reel-track{height:5px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
.reel-fill{height:100%;background:var(--dsw-alias-brand-primary);transition:width .3s ease}
.reel-fill.is-indeterminate{width:35%;animation:reel-pulse 1.2s ease-in-out infinite}
@keyframes reel-pulse{0%{transform:translateX(-120%)}100%{transform:translateX(340%)}}
.reel-log{max-height:160px;overflow:auto;margin:0;padding:9px 10px;border-radius:8px;background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.reel-stages{display:flex;flex-direction:column;gap:12px}
.reel-stage{display:flex;flex-direction:column;gap:9px;padding:12px 13px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.reel-stage.is-active{border-color:var(--dsw-alias-brand-primary)}
.reel-stage.is-wait{opacity:.72}
.reel-stage-head{display:flex;align-items:center;gap:9px;min-width:0}
.reel-stage-no{font-size:10px;font-weight:700;letter-spacing:.05em;padding:1px 6px;border-radius:5px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary)}
.reel-stage-titlebox{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.reel-stage-title{font-size:12.5px;font-weight:600}
.reel-stage-desc{font-size:10.5px;color:var(--dsw-alias-label-secondary);line-height:1.4}
.reel-stage-status{font-size:10.5px;padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.reel-stage-status.is-active{color:var(--dsw-alias-brand-primary)}
.reel-stage-status.is-done{color:var(--dsw-alias-state-success-primary)}
.reel-stage-status.is-failed{color:var(--dsw-alias-state-error-primary)}
.reel-stage-body{min-width:0}
.reel-stage-scenes{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:9px}
.reel-scene{display:flex;flex-direction:column;gap:4px;padding:9px 10px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);min-width:0}
.reel-scene-head{display:flex;align-items:center;gap:6px}
.reel-scene-no{font-size:9.5px;font-weight:700;padding:0 5px;border-radius:4px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary)}
.reel-scene-label{font-size:10px;color:var(--dsw-alias-label-secondary)}
.reel-scene-img{width:100%;height:74px;object-fit:cover;border-radius:6px;background:var(--dsw-alias-bg-layer-3);margin:2px 0}
.reel-scene-title{margin:0;font-size:11.5px;font-weight:600;line-height:1.35}
.reel-scene-text{margin:0;font-size:10.5px;color:var(--dsw-alias-label-secondary);line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.reel-chips{display:flex;flex-wrap:wrap;gap:3px}
.reel-chip{font-size:9.5px;padding:0 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.reel-howto{display:flex;flex-direction:column;gap:2px;font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.reel-howto-step{display:flex;gap:6px}
.reel-howto-step strong{color:var(--dsw-alias-label-primary);font-weight:600}
.reel-stats{display:flex;gap:10px;flex-wrap:wrap}
.reel-stat{display:flex;flex-direction:column;font-size:9.5px;color:var(--dsw-alias-label-secondary)}
.reel-stat strong{font-size:14px;color:var(--dsw-alias-label-primary)}
.reel-stage-skeleton{display:flex;align-items:center;justify-content:center;height:110px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.reel-pulse{display:block;width:35%;height:100%;background:linear-gradient(90deg,transparent,var(--dsw-alias-interactive-bg-hover),transparent);animation:reel-sweep 1.2s ease-in-out infinite}
@keyframes reel-sweep{0%{transform:translateX(-150%)}100%{transform:translateX(320%)}}
.reel-stage-media{width:100%;max-height:300px;object-fit:contain;border-radius:8px;background:#000;display:block}
.reel-stage-foot{display:flex;align-items:center;gap:8px}
.reel-mini{padding:2px 7px;font-size:10.5px}
`;
