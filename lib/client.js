// dsh-reel-studio · browser half ("插件介绍宣传台").
//
// One sidebar panel icon and its main page. The page walks the user through a
// single built-in case: read the case, write the requirement, press generate, and
// watch the storyboard and then the rendered assets appear in place — no task page.
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
        panelTitle: '插件介绍宣传台',
        subtitle: '写一句需求，在这个页面里看分镜、看成片',
        refresh: '刷新',
        renderer: '渲染器',
        browser: '浏览器',
        caseEyebrow: '本次介绍',
        caseHelp: '看这个案例里有什么',
        caseHelpClose: '收起案例',
        caseNote: '当前内置这一个案例；分镜里的画面和文案都来自它。',
        reportFeatures: '个功能点',
        step1: '看一眼案例',
        step1Desc: '点右上角「?」展开案例卡片，知道这次介绍谁',
        step2: '写一句需求',
        step2Desc: '已按案例简介填好，可以改成你想强调的一句话',
        step3: '点开始生成',
        step3Desc: '先出分镜，再依次出宣传图、封面和成片',
        step4: '在这里看结果',
        step4Desc: '全部产物都留在本页，可以直接预览和复制路径',
        briefLabel: '这次想强调什么？',
        briefPlaceholder: '例如：一句话，把游戏放进 DSH 侧栏',
        generate: '开始生成',
        generating: '正在提交…',
        regenerate: '再做一条',
        mode: '要产出什么',
        mode_both: '图 + 视频',
        mode_video: '只出视频',
        mode_image: '只出图',
        posterFrame: '封面帧',
        processTitle: '生成过程',
        storyboardTitle: '分镜（已生成）',
        storyboardHint: '渲染开始前就能看到这版分镜',
        artifactsTitle: '产物',
        artifactsHint: '每完成一个就出现在这里',
        pending: '排队中',
        rendering: '渲染中…',
        notStarted: '还没生成',
        log: '查看渲染日志',
        logHide: '收起日志',
        cancel: '取消',
        copyPath: '复制路径',
        copied: '已复制',
        handoff: '交给 agent 生成',
        handoffPrompt: '用 dsh-reel 帮我生成一条插件宣传片：先用 reel_storyboard 看分镜，再用 reel_render 渲染内置案例。',
        notReadyTitle: '渲染环境还没就绪',
        notReadyBody: '在插件目录跑一次 pnpm install 装好 Remotion，然后回来刷新；Chrome 会自动探测系统浏览器。',
        noCase: '案例信息还没加载到，刷新一下试试。',
        recent: '最近产物',
        emptyRecent: '还没有历史产物。',
        state_queued: '排队中',
        state_running: '生成中',
        state_done: '完成',
        state_failed: '失败',
        state_cancelled: '已取消',
        phase_prepare: '准备中',
        phase_validate: '校验案例',
        phase_props: '写出分镜数据',
        phase_render: '渲染中',
        'phase_render:image': '生成宣传图（3:4）',
        'phase_render:poster': '生成封面（16:9）',
        'phase_render:video': '渲染成片（16:9）',
        phase_done: '完成',
        phase_starting: '启动渲染器',
        phase_queued: '排队中',
        seconds: '秒',
        artifact_image: '宣传图 · 3:4',
        artifact_poster: '封面 · 16:9',
        artifact_video: '成片 · 16:9',
        needBrief: '先写一句需求，再生成。',
        doneHint: '产物已生成，可以直接预览；再点一次可以重新生成。',
      },
      en: {
        panelTitle: 'Plugin Intro Studio',
        subtitle: 'Write one requirement, then watch the storyboard and the reel appear here',
        refresh: 'Refresh',
        renderer: 'Renderer',
        browser: 'Browser',
        caseEyebrow: 'Introducing',
        caseHelp: 'What is in this case',
        caseHelpClose: 'Hide case',
        caseNote: 'One built-in case; the storyboard copy and screenshots come from it.',
        reportFeatures: 'feature cards',
        step1: 'Look at the case',
        step1Desc: 'Open the case card with “?” to see what is being introduced',
        step2: 'Write one line',
        step2Desc: 'Pre-filled from the case tagline; change it to your own focus',
        step3: 'Press generate',
        step3Desc: 'The storyboard comes first, then image, poster and the video',
        step4: 'Watch it here',
        step4Desc: 'Every artifact stays on this page for preview and path copying',
        briefLabel: 'What should it say?',
        briefPlaceholder: 'e.g. one line, put a game into the DSH sidebar',
        generate: 'Generate',
        generating: 'Submitting…',
        regenerate: 'Make another',
        mode: 'Outputs',
        mode_both: 'Image + video',
        mode_video: 'Video only',
        mode_image: 'Image only',
        posterFrame: 'Poster frame',
        processTitle: 'Progress',
        storyboardTitle: 'Storyboard (ready)',
        storyboardHint: 'Visible before rendering starts',
        artifactsTitle: 'Artifacts',
        artifactsHint: 'Each one appears as soon as it is finished',
        pending: 'Queued',
        rendering: 'Rendering…',
        notStarted: 'Not generated',
        log: 'Show render log',
        logHide: 'Hide log',
        cancel: 'Cancel',
        copyPath: 'Copy path',
        copied: 'Copied',
        handoff: 'Hand off to agent',
        handoffPrompt: 'Use dsh-reel to make a plugin promo: reel_storyboard first, then reel_render on the built-in case.',
        notReadyTitle: 'Render environment is not ready',
        notReadyBody: 'Run pnpm install once in the plugin folder to install Remotion, then refresh; system Chrome is detected automatically.',
        noCase: 'Case data has not loaded; try refreshing.',
        recent: 'Recent artifacts',
        emptyRecent: 'No previous artifacts yet.',
        state_queued: 'Queued',
        state_running: 'Generating',
        state_done: 'Done',
        state_failed: 'Failed',
        state_cancelled: 'Cancelled',
        phase_prepare: 'Preparing',
        phase_validate: 'Validating case',
        phase_props: 'Writing storyboard data',
        phase_render: 'Rendering',
        'phase_render:image': 'Promo image (3:4)',
        'phase_render:poster': 'Poster (16:9)',
        'phase_render:video': 'Video (16:9)',
        phase_done: 'Done',
        phase_starting: 'Starting renderer',
        phase_queued: 'Queued',
        seconds: 's',
        artifact_image: 'Promo image · 3:4',
        artifact_poster: 'Poster · 16:9',
        artifact_video: 'Video · 16:9',
        needBrief: 'Write your one-line requirement first.',
        doneHint: 'Artifacts are ready to preview; press again to re-render.',
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

    function formatSize(bytes) {
      if (typeof bytes !== 'number' || bytes < 0) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
      return (bytes / 1024 / 1024).toFixed(1) + ' MB';
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
          kicker: promo.hook?.kicker,
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
          label: '一句话方案',
          title: String(promo.solution?.title || plugin.name || '').replace(/\n/g, ' '),
          text: String(promo.solution?.sub || promo.what || ''),
          points: Array.isArray(promo.solution?.points) ? promo.solution.points.map(String) : [],
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
        label: '怎么用',
        title: String(promo.howto?.title || ''),
        steps: Array.isArray(promo.howto?.steps)
          ? promo.howto.steps.map((step) => ({
              title: String(step?.title || ''),
              desc: String(step?.desc || ''),
              cmd: typeof step?.cmd === 'string' ? step.cmd : '',
            }))
          : [],
      });
      scenes.push({
        id: 'proof',
        no: '06',
        label: '数据与片尾',
        title: String(promo.proof?.title || ''),
        stats: Array.isArray(promo.proof?.stats)
          ? promo.proof.stats.map((stat) => ({num: String(stat?.num || ''), label: String(stat?.label || '')}))
          : [],
        text: String(promo.proof?.note || ''),
        image: promo.outroLogo,
      });
      return scenes;
    }

    function Guide({t, steps}) {
      return h(
        'ol',
        {className: 'reel-guide'},
        steps.map((step, index) =>
          h(
            'li',
            {key: String(index), className: 'reel-guide-step is-' + step.state},
            h('span', {className: 'reel-guide-no'}, String(index + 1)),
            h(
              'span',
              {className: 'reel-guide-body'},
              h('span', {className: 'reel-guide-title'}, step.title),
              h('span', {className: 'reel-guide-desc'}, step.desc),
            ),
          ),
        ),
      );
    }

    function CaseDetail({t, caseData, summary}) {
      const features = (caseData && Array.isArray(caseData.features) && caseData.features) || [];
      return h(
        'div',
        {className: 'reel-case-detail'},
        h(
          'div',
          {className: 'reel-case-detail-head'},
          h('strong', null, summary ? summary.title : ''),
          h('span', {className: 'reel-muted'}, summary ? summary.meta : ''),
        ),
        h('p', {className: 'reel-muted'}, t('caseNote')),
        features.length
          ? h(
              'div',
              {className: 'reel-case-features'},
              features.map((feature, index) =>
                h(
                  'div',
                  {className: 'reel-case-feature', key: String(index)},
                  h('img', {className: 'reel-case-thumb', src: assetUrl(feature.img), alt: String(feature.title || ''), loading: 'lazy'}),
                  h('span', {className: 'reel-case-feature-title'}, String(feature.title || '')),
                  h('span', {className: 'reel-case-feature-desc'}, String(feature.desc || '')),
                ),
              ),
            )
          : h('p', {className: 'reel-muted'}, t('noCase')),
      );
    }

    function SceneCard({t, scene}) {
      const img = assetUrl(scene.image);
      return h(
        'article',
        {className: 'reel-scene', style: scene.accent ? {borderColor: scene.accent} : undefined},
        h(
          'div',
          {className: 'reel-scene-head'},
          h('span', {className: 'reel-scene-no'}, scene.no),
          h('span', {className: 'reel-scene-label'}, scene.label),
        ),
        img ? h('img', {className: 'reel-scene-img', src: img, alt: scene.title || scene.label, loading: 'lazy'}) : null,
        scene.kicker ? h('span', {className: 'reel-scene-kicker'}, scene.kicker) : null,
        h('h3', {className: 'reel-scene-title'}, scene.title || scene.label),
        scene.text ? h('p', {className: 'reel-scene-text'}, scene.text) : null,
        scene.chips && scene.chips.length
          ? h('div', {className: 'reel-chips'}, scene.chips.map((chip, index) => h('span', {className: 'reel-chip', key: String(index)}, chip)))
          : null,
        scene.points && scene.points.length
          ? h('ul', {className: 'reel-points'}, scene.points.map((point, index) => h('li', {key: String(index)}, point)))
          : null,
        scene.steps && scene.steps.length
          ? h(
              'div',
              {className: 'reel-howto'},
              scene.steps.map((step, index) =>
                h(
                  'div',
                  {className: 'reel-howto-step', key: String(index)},
                  h('span', {className: 'reel-howto-title'}, step.title),
                  h('span', {className: 'reel-howto-desc'}, step.desc),
                  step.cmd ? h('code', {className: 'reel-code'}, step.cmd) : null,
                ),
              ),
            )
          : null,
        scene.stats && scene.stats.length
          ? h(
              'div',
              {className: 'reel-stats'},
              scene.stats.map((stat, index) =>
                h('span', {className: 'reel-stat', key: String(index)}, h('strong', null, stat.num), h('span', null, stat.label)),
              ),
            )
          : null,
      );
    }

    function ArtifactCard({t, kind, artifact}) {
      const isVideo = kind === 'video';
      return h(
        'div',
        {className: 'reel-artifact' + (artifact ? ' has-artifact' : ' is-pending')},
        artifact
          ? isVideo
            ? h('video', {className: 'reel-artifact-media', src: artifact.url, controls: true, preload: 'metadata'})
            : h('img', {className: 'reel-artifact-media', src: artifact.url, alt: t('artifact_' + kind)})
          : h('div', {className: 'reel-artifact-skeleton'}, h('span', {className: 'reel-pulse'})),
        h('span', {className: 'reel-artifact-label'}, t('artifact_' + kind)),
        artifact ? h('span', {className: 'reel-artifact-meta'}, artifact.path) : h('span', {className: 'reel-artifact-meta'}, t('rendering')),
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
      const [showCase, setShowCase] = useState(false);
      const [showLog, setShowLog] = useState(false);
      const [copied, setCopied] = useState('');
      const logRef = useRef(null);

      const env = (state && state.env) || null;
      const ready = Boolean(env && env.renderer && env.renderer.found);
      const summary = (state && state.defaultCase) || null;
      const jobs = (state && state.jobs) || [];
      const job = (jobId && jobs.find((item) => item.id === jobId)) || jobs[0] || null;
      const jobRunning = Boolean(job && (job.state === 'running' || job.state === 'queued'));
      const scenes = buildScenes(caseData, brief);
      const recent = (state && state.outputs) || [];

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
        const id = summary && summary.id;
        if (!id) return;
        let alive = true;
        fetch(API + '/case?path=' + encodeURIComponent(id), {cache: 'no-store'})
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
      }, [summary]);

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
            setShowLog(true);
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

      const phase = job ? t('phase_' + String(job.phase || ''), job.phase) : '';
      const percent = job && typeof job.progress === 'number' ? Math.round(job.progress * 100) : null;
      const elapsed = job && job.startedAt ? Math.max(0, Math.round((((job.endedAt || Date.now())) - job.startedAt) / 1000)) : 0;

      const kinds = mode === 'image' ? ['image'] : mode === 'video' ? ['poster', 'video'] : ['image', 'poster', 'video'];

      const guideSteps = [
        {title: t('step1'), desc: t('step1Desc'), state: caseData || showCase ? 'done' : 'active'},
        {title: t('step2'), desc: t('step2Desc'), state: String(brief).trim() ? (job ? 'done' : 'active') : 'todo'},
        {title: t('step3'), desc: t('step3Desc'), state: job ? (job.state === 'done' ? 'done' : 'active') : 'todo'},
        {title: t('step4'), desc: t('step4Desc'), state: job && job.state === 'done' ? 'done' : job ? 'active' : 'todo'},
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
            h('span', {className: 'reel-badge'}, h('span', {className: 'reel-dot' + (ready ? ' is-ok' : ' is-bad')}), t('renderer')),
            h('span', {className: 'reel-badge'}, h('span', {className: 'reel-dot' + (env && env.browser && env.browser.found ? ' is-ok' : ' is-bad')}), t('browser')),
            h('button', {className: 'reel-btn', type: 'button', onClick: refresh}, t('refresh')),
          ),
        ),
        error ? h('div', {className: 'reel-alert reel-alert-error'}, error) : null,
        !ready && state
          ? h(
              'div',
              {className: 'reel-alert'},
              h('strong', null, t('notReadyTitle')),
              h('p', null, t('notReadyBody')),
              h('code', {className: 'reel-code'}, 'pnpm install'),
              h(
                'div',
                {className: 'reel-row'},
                h('button', {className: 'reel-btn', type: 'button', onClick: handoff}, t('handoff')),
                copied ? h('span', {className: 'reel-copied'}, copied) : null,
              ),
            )
          : null,
        h(Guide, {t, steps: guideSteps}),
        h(
          'section',
          {className: 'reel-casebar'},
          h(
            'div',
            {className: 'reel-casebar-main'},
            h('span', {className: 'reel-eyebrow'}, t('caseEyebrow')),
            h('h2', {className: 'reel-case-name'}, summary ? summary.title : t('noCase')),
            summary ? h('span', {className: 'reel-case-meta'}, summary.meta) : null,
            summary && summary.desc ? h('p', {className: 'reel-case-desc'}, summary.desc) : null,
            summary ? h('span', {className: 'reel-muted'}, (summary.features || 0) + ' ' + t('reportFeatures')) : null,
          ),
          h(
            'button',
            {
              className: 'reel-help' + (showCase ? ' is-open' : ''),
              type: 'button',
              'aria-expanded': showCase,
              title: showCase ? t('caseHelpClose') : t('caseHelp'),
              onClick: () => setShowCase(!showCase),
            },
            '?',
          ),
        ),
        showCase ? h(CaseDetail, {t, caseData, summary}) : null,
        h(
          'section',
          {className: 'reel-panel'},
          h(
            'div',
            {className: 'reel-panel-head'},
            h('h2', {className: 'reel-panel-title'}, t('briefLabel')),
            h('span', {className: 'reel-step-tag'}, t('step2')),
          ),
          h('textarea', {
            className: 'reel-textarea',
            rows: 3,
            value: brief,
            placeholder: t('briefPlaceholder'),
            onChange: (event) => {
              setBrief(event.target.value);
              setBriefTouched(true);
            },
          }),
          h(
            'div',
            {className: 'reel-form-row'},
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
              'button',
              {className: 'reel-btn reel-primary', type: 'button', disabled: posting || !ready || !summary || !String(brief).trim(), onClick: start},
              posting ? t('generating') : job && job.state === 'done' ? t('regenerate') : t('generate'),
            ),
            jobRunning
              ? h('button', {className: 'reel-btn', type: 'button', onClick: cancel}, t('cancel'))
              : h('button', {className: 'reel-btn', type: 'button', onClick: handoff}, t('handoff')),
          ),
        ),
        job
          ? h(
              'section',
              {className: 'reel-panel'},
              h(
                'div',
                {className: 'reel-panel-head'},
                h('h2', {className: 'reel-panel-title'}, t('processTitle')),
                h('span', {className: 'reel-state is-' + job.state}, t('state_' + job.state, job.state)),
              ),
              h(
                'div',
                {className: 'reel-row reel-progress-line'},
                h('span', {className: 'reel-muted'}, phase + (percent !== null ? ' · ' + percent + '%' : '') + (job.state === 'running' ? ' · ' + elapsed + t('seconds') : '')),
                h(
                  'button',
                  {className: 'reel-btn reel-mini', type: 'button', onClick: () => setShowLog(!showLog)},
                  showLog ? t('logHide') : t('log'),
                ),
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
              job.state === 'done' ? h('p', {className: 'reel-muted'}, t('doneHint')) : null,
              showLog && job.logTail && job.logTail.length ? h('pre', {className: 'reel-log', ref: logRef}, job.logTail.join('\n')) : null,
            )
          : null,
        job
          ? h(
              'section',
              {className: 'reel-panel'},
              h(
                'div',
                {className: 'reel-panel-head'},
                h('h2', {className: 'reel-panel-title'}, t('storyboardTitle')),
                h('span', {className: 'reel-badge'}, t('storyboardHint')),
              ),
              scenes.length
                ? h('div', {className: 'reel-storyboard'}, scenes.map((scene) => h(SceneCard, {key: scene.id, t, scene})))
                : h('p', {className: 'reel-muted'}, t('noCase')),
            )
          : null,
        job
          ? h(
              'section',
              {className: 'reel-panel'},
              h(
                'div',
                {className: 'reel-panel-head'},
                h('h2', {className: 'reel-panel-title'}, t('artifactsTitle')),
                h('span', {className: 'reel-muted'}, t('artifactsHint')),
              ),
              h(
                'div',
                {className: 'reel-artifacts'},
                kinds.map((kind) => h(ArtifactCard, {key: kind, t, kind, artifact: (job.outputs && job.outputs[kind]) || null})),
              ),
            )
          : null,
        recent.length
          ? h(
              'section',
              {className: 'reel-panel'},
              h('div', {className: 'reel-panel-head'}, h('h2', {className: 'reel-panel-title'}, t('recent'))),
              h(
                'div',
                {className: 'reel-recent'},
                recent.slice(0, 8).map((item) =>
                  h(
                    'div',
                    {className: 'reel-recent-item', key: item.name},
                    /\.(mp4|webm|mov)$/i.test(item.name)
                      ? h('video', {className: 'reel-recent-thumb', src: item.url, muted: true, preload: 'metadata'})
                      : h('img', {className: 'reel-recent-thumb', src: item.url, alt: item.name, loading: 'lazy'}),
                    h('span', {className: 'reel-recent-name', title: item.path}, item.name),
                    h(
                      'span',
                      {className: 'reel-recent-meta'},
                      formatSize(item.size),
                      h('button', {className: 'reel-btn reel-mini', type: 'button', onClick: () => copy(item.path)}, t('copyPath')),
                    ),
                  ),
                ),
              ),
            )
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
.reel-page{--reel-radius:12px;display:flex;flex-direction:column;gap:14px;height:100%;overflow:auto;padding:24px 28px 48px;box-sizing:border-box;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55}
.reel-page>*{width:100%;max-width:1080px;margin-left:auto;margin-right:auto}
.reel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.reel-head-main{display:flex;align-items:center;gap:12px}
.reel-logo{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-brand-primary)}
.reel-title{margin:0;font-size:20px;font-weight:600;letter-spacing:.01em}
.reel-sub{margin:2px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.reel-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.reel-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:11px;color:var(--dsw-alias-label-secondary)}
.reel-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary)}
.reel-dot.is-ok{background:var(--dsw-alias-state-success-primary)}
.reel-dot.is-bad{background:var(--dsw-alias-state-error-primary)}
.reel-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer;transition:background .15s,border-color .15s}
.reel-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.reel-btn:disabled{opacity:.45;cursor:default}
.reel-btn.reel-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff;font-weight:600;padding:7px 18px}
.reel-btn.reel-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.reel-alert{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:var(--reel-radius);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px}
.reel-alert strong{color:var(--dsw-alias-label-primary);font-size:13px}
.reel-alert p{margin:0}
.reel-alert-error{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.reel-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;padding:2px 7px;border-radius:5px;background:var(--dsw-alias-markdown-inline-code);color:var(--dsw-alias-label-primary);align-self:flex-start}
.reel-guide{list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:2px 0 0;padding:0}
@media (max-width:920px){.reel-guide{grid-template-columns:repeat(2,minmax(0,1fr))}}
.reel-guide-step{display:flex;gap:9px;padding:10px 11px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.reel-guide-step.is-active{border-color:var(--dsw-alias-brand-primary)}
.reel-guide-step.is-done .reel-guide-no{background:var(--dsw-alias-state-success-primary);border-color:transparent;color:#0b1a12}
.reel-guide-no{flex:none;display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2)}
.reel-guide-body{display:flex;flex-direction:column;gap:2px;min-width:0}
.reel-guide-title{font-size:12px;font-weight:600}
.reel-guide-desc{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.45}
.reel-casebar{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:16px 18px;border-radius:var(--reel-radius);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.reel-casebar-main{display:flex;flex-direction:column;gap:3px;min-width:0}
.reel-eyebrow{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}
.reel-case-name{margin:0;font-size:17px;font-weight:600}
.reel-case-meta{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.reel-case-desc{margin:4px 0 0;font-size:12px;color:var(--dsw-alias-label-primary);max-width:70ch}
.reel-help{flex:none;width:30px;height:30px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;font-weight:600;cursor:pointer;line-height:1}
.reel-help:hover,.reel-help.is-open{background:var(--dsw-alias-interactive-bg-hover)}
.reel-help.is-open{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.reel-case-detail{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-radius:var(--reel-radius);border:1px dashed var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}
.reel-case-detail-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.reel-case-features{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.reel-case-feature{display:flex;flex-direction:column;gap:4px;padding:8px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);min-width:0}
.reel-case-thumb{width:100%;height:88px;object-fit:cover;border-radius:6px;background:var(--dsw-alias-bg-layer-3)}
.reel-case-feature-title{font-size:12px;font-weight:600}
.reel-case-feature-desc{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.45}
.reel-panel{display:flex;flex-direction:column;gap:10px;padding:16px 18px;border-radius:var(--reel-radius);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.reel-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.reel-panel-title{margin:0;font-size:13.5px;font-weight:600}
.reel-step-tag{font-size:10.5px;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:2px 8px}
.reel-muted{color:var(--dsw-alias-label-secondary);font-size:12px;margin:0}
.reel-textarea{width:100%;box-sizing:border-box;resize:vertical;min-height:64px;padding:10px 12px;border-radius:9px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.5}
.reel-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.reel-form-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.reel-field{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.reel-seg{display:inline-flex;gap:4px;padding:3px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}
.reel-seg-btn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;padding:4px 12px;border-radius:6px;cursor:pointer}
.reel-seg-btn.is-active{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.reel-input{width:86px;padding:4px 8px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}
.reel-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.reel-progress-line{justify-content:space-between}
.reel-copied{font-size:11px;color:var(--dsw-alias-state-success-primary)}
.reel-state{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.reel-state.is-running{color:var(--dsw-alias-brand-primary)}
.reel-state.is-done{color:var(--dsw-alias-state-success-primary)}
.reel-state.is-failed{color:var(--dsw-alias-state-error-primary)}
.reel-track{height:6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}
.reel-fill{height:100%;background:var(--dsw-alias-brand-primary);transition:width .3s ease}
.reel-fill.is-indeterminate{width:35%;animation:reel-pulse 1.2s ease-in-out infinite}
@keyframes reel-pulse{0%{transform:translateX(-120%)}100%{transform:translateX(340%)}}
.reel-log{max-height:180px;overflow:auto;margin:0;padding:9px 10px;border-radius:8px;background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.reel-storyboard{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.reel-scene{display:flex;flex-direction:column;gap:5px;padding:11px 12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);min-width:0}
.reel-scene-head{display:flex;align-items:center;gap:7px}
.reel-scene-no{font-size:10px;font-weight:700;letter-spacing:.04em;padding:1px 6px;border-radius:5px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary)}
.reel-scene-label{font-size:10.5px;color:var(--dsw-alias-label-secondary);letter-spacing:.02em}
.reel-scene-img{width:100%;height:104px;object-fit:cover;border-radius:7px;background:var(--dsw-alias-bg-layer-3);margin:3px 0}
.reel-scene-kicker{font-size:9.5px;letter-spacing:.08em;color:var(--dsw-alias-label-secondary)}
.reel-scene-title{margin:0;font-size:13px;font-weight:600;line-height:1.35}
.reel-scene-text{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary);line-height:1.5}
.reel-chips{display:flex;flex-wrap:wrap;gap:4px}
.reel-chip{font-size:10px;padding:1px 7px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.reel-points,.reel-howto{margin:2px 0 0;padding-left:16px;display:flex;flex-direction:column;gap:2px}
.reel-points li{font-size:11px;color:var(--dsw-alias-label-secondary)}
.reel-howto{list-style:none;padding-left:0}
.reel-howto-step{display:flex;flex-direction:column;gap:1px;font-size:11px}
.reel-howto-title{font-weight:600}
.reel-howto-desc{color:var(--dsw-alias-label-secondary)}
.reel-stats{display:flex;gap:12px;margin-top:4px;flex-wrap:wrap}
.reel-stat{display:flex;flex-direction:column;font-size:10px;color:var(--dsw-alias-label-secondary)}
.reel-stat strong{font-size:15px;color:var(--dsw-alias-label-primary)}
.reel-artifacts{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.reel-artifact{display:flex;flex-direction:column;gap:5px;padding:9px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);min-width:0}
.reel-artifact-media{width:100%;height:150px;object-fit:cover;border-radius:7px;background:#000;display:block}
.reel-artifact-skeleton{display:flex;align-items:center;justify-content:center;width:100%;height:150px;border-radius:7px;background:var(--dsw-alias-bg-layer-3);overflow:hidden}
.reel-pulse{display:block;width:35%;height:100%;background:linear-gradient(90deg,transparent,var(--dsw-alias-interactive-bg-hover),transparent);animation:reel-sweep 1.2s ease-in-out infinite}
@keyframes reel-sweep{0%{transform:translateX(-150%)}100%{transform:translateX(320%)}}
.reel-artifact-label{font-size:11.5px;font-weight:600}
.reel-artifact-meta{font-size:10px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.reel-recent{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.reel-recent-item{display:flex;flex-direction:column;gap:4px;padding:7px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);min-width:0}
.reel-recent-thumb{width:100%;height:78px;object-fit:cover;border-radius:6px;background:#000;display:block}
.reel-recent-name{font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.reel-recent-meta{display:flex;align-items:center;justify-content:space-between;gap:5px;font-size:10px;color:var(--dsw-alias-label-secondary)}
.reel-mini{padding:2px 7px;font-size:10.5px}
`;
