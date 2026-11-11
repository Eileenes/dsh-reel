// dsh-reel-studio · browser half ("插件宣传台").
//
// Wall + studio layout (media-desk inspired): the wall lists every V0.1 film case
// (poster + real UI shots + status); the studio is a three-column writer's desk
// that runs the films through scripts/film.mjs (prepare -> audio -> 840 frames ->
// mux -> poster) and plays the finished film in place. Everything is theme-driven
// through the host's --dsw-alias-* tokens, so light and dark stay legible.
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
        navWall: '安利墙',
        navStudio: '生成台',
        railWall: '安利墙',
        railStudio: '生成台',
        railHelp: '怎么用',
        heroEyebrow: 'DSH Plugin Films · V0.1 真机管线',
        heroTitleA: '给每个插件，',
        heroTitleB: '拍一条',
        heroTitleEm: '能安利人',
        heroTitleC: '的片。',
        heroSub: '选一个插件，28 秒真机宣传片：真实界面、真实安装流程、四个功能页，全程自动生成。看完就能拿去安利。',
        inputPlaceholder: '输入插件名称，例如 dsh-pet',
        next: '下一步',
        matched: '已匹配案例',
        matchedGo: '点「下一步」进生成台',
        noCase: '暂无现成案例',
        noCaseNext: '下一步：交给 AI 准备案例（抓真实截图 + 写文案），然后再生成真机片',
        inputHint: '有现成案例的插件直接出片；没有案例的会先交给 AI 准备。',
        availableCases: '已有案例',
        howto: '怎么用？完整说明',
        heroStatCases: '可出片案例',
        heroStatDuration: '每条时长',
        heroStatFrames: '逐帧渲染',
        wallSearch: '搜索插件名 / handle',
        filterAll: '全部',
        filterFilmed: '已出片',
        filterUnfilmed: '未出片',
        addTitle: '安利下一个插件',
        addDesc: '录入插件名，交给 AI 按 SOP 收 4 张真实界面截图、写案例文案，准备好后就能进生成台。',
        addGo: '交给 AI 准备',
        filmedTimes: '已出片 {n} 次',
        notFilmed: '未出片',
        openStudio: '进生成台',
        durationBadge: '28.0s',
        searchEmpty: '没有匹配的插件',
        targetTitle: '目标插件',
        targetCaseTag: 'V0.1 case',
        matchedMeta: '已匹配到 V0.1 真机片案例',
        switchCase: '换插件 / 输入插件名',
        askLabel: '说一句，就改',
        ask1: '重点讲余额气泡',
        ask2: '封面字更有冲击力',
        ask3: '开场再快一点',
        askPlaceholder: '怎么改，直接说…',
        prepareNew: '交给 AI 准备新案例',
        recentFilms: '最近出片',
        recentEmpty: '还没有成片',
        studioEyebrow: '生成台 · 28s 真机片',
        metaDuration: '28.0s',
        metaFrames: '840 帧 · 30fps',
        metaRes: '1920 × 1080',
        playerPlaceholder: '生成后在这里预览成片',
        playerBusy: '渲染中 · 840 帧',
        playerExisting: '已有成片',
        generate: '生成真机片',
        generating: '提交中…',
        regenerate: '重新生成',
        stop: '终止任务',
        copyPath: '复制产物路径',
        genHint: '约 10 分钟 · 可随时终止',
        genHintBusy: '渲染中 · 可随时终止',
        shotsTitle: '分镜 · 6 格',
        shotsHint: '开场 / 4 功能页 / 片尾',
        shotOpen: '开场 · 安装命令',
        shotEnd: '片尾 · 一键安装',
        outDuration: '时长',
        outSpec: '规格',
        outCodec: '编码',
        outPath: '产物',
        dockPipeline: 'Pipeline',
        stageAssets: '素材与音效',
        stageRender: '渲染 840 帧',
        stageMux: '混流',
        stagePoster: '封面',
        dockReady: '就绪',
        dockDone: '已完成',
        dockQueued: '排队中',
        logShow: '日志',
        logHide: '收起日志',
        guideEyebrow: '怎么用',
        guideTitle: '四步，出一条插件宣传片',
        guideSub: '顶部输入插件名 → 匹配案例 → 生成真机片',
        guide1: '录入插件名称',
        guide1d: '在安利墙顶部的输入框填插件名（如 dsh-pet），或直接点墙上的案例卡。输入时会实时提示：有没有现成案例、下一步去哪。',
        guide2: '匹配案例',
        guide2d: '有案例 → 直接进生成台；没有案例 → 点「交给 AI 准备案例」，AI 按 SOP 收 4 张真实界面截图、写文案、生成 cases/v01/<slug>.json（约 10–20 分钟）。',
        guide3: '生成真机片',
        guide3d: '在生成台点「生成真机片」：素材与音效 → 渲染 840 帧 → 混流 → 封面，约 10 分钟，可随时终止。',
        guide4: '看成片',
        guide4d: '完成后直接在生成台播放，可复制产物路径；想再来一条点「重新生成」。',
        guideNote: '两条路径：已有案例的插件 = 输入名字/点卡片直接出片；没有案例的插件 = 先把插件名交给 AI 准备案例，再回来出片。',
        prepareEyebrow: '下一步',
        prepareTitle: '「{name}」还没有真机片案例',
        prepareSub: '先让 AI 按 SOP 准备案例，再回来生成真机片',
        prepare1: '录入插件名',
        prepare1d: '{name} —— 已收到。若插件在本机 profile 里，AI 会直接读它的 package.json / README / 真实界面截图。',
        prepare2: '交给 AI 准备案例（约 10–20 分钟）',
        prepare2d: '按 docs/v01-film-sop.md 收数据与真实界面截图，写 cases/v01/<slug>.json，生成分镜和音效时间轴；准备好后案例会自动出现在安利墙上。',
        prepare3: '回到生成台出片（约 10 分钟）',
        prepare3d: '案例就绪后，用同样的名字再进来，或直接点墙上的新卡片 →「生成真机片」。',
        prepareNote: '你只需要提供插件名；如果不在本机，再补一个仓库地址或安装包路径。文案、截图、许可信息由 AI 按 SOP 收集。',
        modalCopy: '复制 AI 指令',
        modalGo: '交给 AI 准备',
        modalClose: '知道了',
        notReadyTitle: '真机片渲染环境还没就绪',
        notReadyBody: 'V0.1 真机片用仓库自带渲染器：需要 Chrome/Chromium、ffmpeg 和 .research/onetake-promo 里的 comp 依赖；配置好后刷新页面。',
        noActiveCase: '还没有可出片的案例',
        noActiveCaseBody: '往顶部输入框录入插件名，按「下一步」把需求交给 AI 准备案例。',
        jobError: '任务失败：{error}',
        toastStarted: '已开始渲染 · 面板会实时显示进度',
        toastStopped: '已终止任务',
        toastCopied: '已复制',
        toastPathCopied: '已复制产物路径',
        toastCopyFailed: '复制失败，请手动复制',
        toastCancelFailed: '终止失败，请重试',
        filmedBadge: '已出片',
        caseLoadFailed: '案例读取失败',
        timeJustNow: '刚刚',
        timeMinutes: '{n} 分钟前',
        dockStarting: '启动中',
        toastAskCopied: '已复制修改指令，去对话里发给 AI 即可',
        toastPrepareCopied: '已复制「准备案例」指令，去对话里发给 AI',
        toastHanded: '已把指令填进对话，确认后交给 AI 执行',
        toastNeedInput: '先输入插件名称，比如 dsh-pet',
        toastBusy: '有任务在渲染，先终止或等它完成',
        toastCaseSwitched: '已切换到「{name}」',
        elapsedSeconds: '秒',
        phase_queued: '排队中',
        phase_starting: '启动中',
        phase_prepare: '准备素材',
        phase_audio: '合成音效',
        'phase_render:video': '渲染 840 帧',
        phase_mux: '混流',
        phase_poster: '封面',
        phase_done: '完成',
        state_queued: '排队中',
        state_running: '生成中',
        state_done: '完成',
        state_failed: '失败',
        state_cancelled: '已取消',
        timelineRows: [
          '00 — 03s|终端安装 · dsh plugin add',
          '03 — 15s|插件页 · 搜索 / 结果卡 / 安装进度',
          '15 — 26s|四个功能页 · 真实界面截图',
          '26 — 28s|片尾 · 名称 / 安装命令 / 许可',
        ],
        askPrompt: '给「{case}」的 V0.1 真机片提一个修改：{text}。按 docs/v01-film-sop.md 调整案例/comp 后重新渲染。',
        preparePrompt: '用 dsh-reel 的 V0.1 真机管线给插件「{name}」做一条 28s 宣传片：按 docs/v01-film-sop.md 收集 npm/仓库数据与真实界面截图，写 cases/v01/<slug>.json，然后跑 make-v01-film + render-frames.mjs 渲染 + 混流，产物放 studio/out/。',
        runner: '渲染器',
      },
      en: {
        panelTitle: 'Plugin Promo Studio',
        navWall: 'Wall',
        navStudio: 'Studio',
        railWall: 'Wall',
        railStudio: 'Studio',
        railHelp: 'How it works',
        heroEyebrow: 'DSH Plugin Films · V0.1 real-UI pipeline',
        heroTitleA: 'One plugin,',
        heroTitleB: 'one film ',
        heroTitleEm: 'worth sharing',
        heroTitleC: '.',
        heroSub: 'Pick a plugin and get a 28-second real-UI promo: the actual interface, the real install flow, four feature pages — generated end to end.',
        inputPlaceholder: 'Type a plugin name, e.g. dsh-pet',
        next: 'Next',
        matched: 'Case matched',
        matchedGo: 'Press “Next” to open the studio',
        noCase: 'No case yet',
        noCaseNext: 'Next: hand it to the AI to prepare a case (real screenshots + copy), then generate.',
        inputHint: 'Plugins with a prepared case generate right away; others are handed to the AI first.',
        availableCases: 'Film-ready',
        howto: 'How it works',
        heroStatCases: 'film-ready cases',
        heroStatDuration: 'per film',
        heroStatFrames: 'frames rendered',
        wallSearch: 'Search plugin / handle',
        filterAll: 'All',
        filterFilmed: 'Filmed',
        filterUnfilmed: 'Not filmed',
        addTitle: 'Recommend the next plugin',
        addDesc: 'Type a plugin name; the AI collects four real UI screenshots and the copy following the SOP, then it shows up here.',
        addGo: 'Hand to AI',
        filmedTimes: 'Filmed {n}×',
        notFilmed: 'Not filmed',
        openStudio: 'Open studio',
        durationBadge: '28.0s',
        searchEmpty: 'No matching plugin',
        targetTitle: 'Target plugin',
        targetCaseTag: 'V0.1 case',
        matchedMeta: 'V0.1 film case matched',
        switchCase: 'Switch plugin / type a name',
        askLabel: 'Say it, get it changed',
        ask1: 'Focus on the balance bubble',
        ask2: 'Make the poster type hit harder',
        ask3: 'Open a bit faster',
        askPlaceholder: 'What should change?',
        prepareNew: 'Ask the AI to prepare a case',
        recentFilms: 'Recent films',
        recentEmpty: 'No films yet',
        studioEyebrow: 'Studio · 28s real-UI film',
        metaDuration: '28.0s',
        metaFrames: '840 frames · 30fps',
        metaRes: '1920 × 1080',
        playerPlaceholder: 'The finished film will play here',
        playerBusy: 'Rendering · 840 frames',
        playerExisting: 'Existing film',
        generate: 'Generate film',
        generating: 'Submitting…',
        regenerate: 'Generate again',
        stop: 'Stop task',
        copyPath: 'Copy output path',
        genHint: 'About 10 minutes · can be stopped',
        genHintBusy: 'Rendering · can be stopped',
        shotsTitle: 'Storyboard · 6 shots',
        shotsHint: 'hook / 4 features / end card',
        shotOpen: 'Hook · install command',
        shotEnd: 'End card · one install line',
        outDuration: 'Duration',
        outSpec: 'Spec',
        outCodec: 'Codec',
        outPath: 'Output',
        dockPipeline: 'Pipeline',
        stageAssets: 'Assets & audio',
        stageRender: 'Render 840 frames',
        stageMux: 'Mux',
        stagePoster: 'Poster',
        dockReady: 'Ready',
        dockDone: 'Done',
        dockQueued: 'Queued',
        logShow: 'Log',
        logHide: 'Hide log',
        guideEyebrow: 'How it works',
        guideTitle: 'Four steps to one plugin film',
        guideSub: 'Type a plugin name → match a case → generate the film',
        guide1: 'Type the plugin name',
        guide1d: 'Use the input at the top of the wall (e.g. dsh-pet), or click a case card. The hint under the input tells you whether a case exists.',
        guide2: 'Match a case',
        guide2d: 'With a case → straight into the studio. Without one → press “Hand to AI” and the agent collects four real screenshots and the copy, then writes cases/v01/<slug>.json (about 10–20 minutes).',
        guide3: 'Generate the film',
        guide3d: 'Press “Generate film”: assets & audio → 840 frames → mux → poster. About 10 minutes, and you can stop it at any time.',
        guide4: 'Watch it',
        guide4d: 'The finished film plays right in the studio; copy the output path or generate again.',
        guideNote: 'Two paths: prepared cases generate from the name or a card; new plugins are prepared by the AI first.',
        prepareEyebrow: 'Next',
        prepareTitle: 'No V0.1 film case for “{name}” yet',
        prepareSub: 'Let the AI prepare the case, then come back and generate',
        prepare1: 'Plugin name received',
        prepare1d: '{name} — got it. If the plugin is installed locally the agent reads its package.json / README / real screenshots.',
        prepare2: 'AI prepares the case (about 10–20 minutes)',
        prepare2d: 'Following docs/v01-film-sop.md it collects the data and real UI screenshots, writes cases/v01/<slug>.json and builds the storyboard/audio timeline. The case then appears on the wall.',
        prepare3: 'Back to the studio (about 10 minutes)',
        prepare3d: 'Once ready, enter the same name again or click the new card → “Generate film”.',
        prepareNote: 'You only need the plugin name; add a repo URL or package path when it is not installed locally.',
        modalCopy: 'Copy agent prompt',
        modalGo: 'Hand to AI',
        modalClose: 'Got it',
        notReadyTitle: 'Film render environment is not ready',
        notReadyBody: 'V0.1 films render with this repo\'s own renderer: Chrome/Chromium, ffmpeg and the comp dependencies in .research/onetake-promo; refresh after fixing.',
        noActiveCase: 'No film-ready case yet',
        noActiveCaseBody: 'Type a plugin name at the top and press Next to hand it to the AI.',
        jobError: 'Job failed: {error}',
        toastStarted: 'Rendering started · progress shows live',
        toastStopped: 'Task stopped',
        toastCopied: 'Copied',
        toastPathCopied: 'Output path copied',
        toastCopyFailed: 'Copy failed — copy manually',
        toastCancelFailed: 'Stop failed — try again',
        filmedBadge: 'Filmed',
        caseLoadFailed: 'Case failed to load',
        timeJustNow: 'just now',
        timeMinutes: '{n} min ago',
        dockStarting: 'Starting',
        toastAskCopied: 'Change request copied — send it to the agent',
        toastPrepareCopied: '“Prepare case” prompt copied — send it to the agent',
        toastHanded: 'Prompt placed in the composer — confirm to run',
        toastNeedInput: 'Type a plugin name first, e.g. dsh-pet',
        toastBusy: 'A task is rendering; stop it or wait for it',
        toastCaseSwitched: 'Switched to “{name}”',
        elapsedSeconds: 's',
        phase_queued: 'Queued',
        phase_starting: 'Starting',
        phase_prepare: 'Preparing assets',
        phase_audio: 'Mixing audio',
        'phase_render:video': 'Rendering 840 frames',
        phase_mux: 'Muxing',
        phase_poster: 'Poster',
        phase_done: 'Done',
        state_queued: 'Queued',
        state_running: 'Running',
        state_done: 'Done',
        state_failed: 'Failed',
        state_cancelled: 'Cancelled',
        timelineRows: [
          '00 — 03s|Terminal · dsh plugin add',
          '03 — 15s|Plugin page · search / result / install',
          '15 — 26s|Four feature pages · real screenshots',
          '26 — 28s|End card · name / install / license',
        ],
        askPrompt: 'Change request for the V0.1 film of “{case}”: {text}. Follow docs/v01-film-sop.md, adjust the case/comp and re-render.',
        preparePrompt: 'Use the dsh-reel V0.1 real-UI pipeline to make a 28s promo film for the plugin "{name}": follow docs/v01-film-sop.md, collect npm/repo metadata and real UI screenshots, write cases/v01/<slug>.json, then run make-v01-film + render-frames.mjs render + mux into studio/out/.',
        runner: 'Renderer',
      },
    };

    function currentLang(ctx) {
      try {
        const locale = ctx && ctx.get ? ctx.get('locale') : undefined;
        const active = locale && locale.getLocale ? locale.getLocale().active : '';
        if (typeof active === 'string' && active) return /^zh/i.test(active) ? 'zh' : 'en';
      } catch {
        // fall through
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

    function Icon({name, size = 18}) {
      const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      };
      const paths = {
        wall: [h('rect', {key: 1, x: 3, y: 3, width: 7.5, height: 7.5, rx: 2}), h('rect', {key: 2, x: 13.5, y: 3, width: 7.5, height: 7.5, rx: 2}), h('rect', {key: 3, x: 3, y: 13.5, width: 7.5, height: 7.5, rx: 2}), h('rect', {key: 4, x: 13.5, y: 13.5, width: 7.5, height: 7.5, rx: 2})],
        studio: [h('rect', {key: 1, x: 2.5, y: 5, width: 19, height: 14, rx: 2.5}), h('path', {key: 2, d: 'M6.5 5v14M17.5 5v14M2.5 12h19'})],
        help: [h('circle', {key: 1, cx: 12, cy: 12, r: 9}), h('path', {key: 2, d: 'M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2-2.5 3.6'}), h('path', {key: 3, d: 'M12 17h.01'})],
        search: [h('circle', {key: 1, cx: 11, cy: 11, r: 7}), h('path', {key: 2, d: 'M20 20l-3.2-3.2'})],
        arrow: [h('path', {key: 1, d: 'M5 12h14M13 6l6 6-6 6'})],
        play: [h('path', {key: 1, d: 'M8 5.5v13l10-6.5z'})],
        close: [h('path', {key: 1, d: 'M6 6l12 12M18 6L6 18'})],
        check: [h('path', {key: 1, d: 'M4 12.5l5 5L20 6.5'})],
        spine: [h('path', {key: 1, d: 'M12 19V5M5.5 11.5L12 5l6.5 6.5'})],
      };
      return h('svg', common, paths[name] || null);
    }

    function assetUrl(rel) {
      if (typeof rel !== 'string' || !rel) return undefined;
      const clean = rel.replace(/^\.?\//, '').replace(/^studio\/public\//, '');
      if (clean.includes('..')) return undefined;
      return API + '/asset/' + clean.split('/').map(encodeURIComponent).join('/');
    }

    /**
     * Match the typed plugin name against the V0.1 cases.
     * Conservative on purpose: only the case slug / card title are matched, the
     * input needs at least 3 latin chars (2 CJK chars), and the longest key wins.
     * Typing a substring of one case must not silently select a shorter case
     * (e.g. "dsh-pet-widget" is not "dsh-pet").
     */
    function matchFilmCase(text, cases) {
      const raw = String(text || '').trim().toLowerCase();
      if (!raw) return null;
      const minLength = /[\u4e00-\u9fff]/.test(raw) ? 2 : 3;
      if (raw.length < minLength) return null;
      const candidates = [];
      for (const item of Array.isArray(cases) ? cases : []) {
        if (!item || item.kind !== 'v01') continue;
        const slug = String(item.id || '')
          .split('/')
          .pop()
          .replace(/\.json$/i, '')
          .toLowerCase();
        const title = String(item.title || '').toLowerCase();
        for (const key of [slug, title]) {
          if (key) candidates.push({item, key});
        }
      }
      candidates.sort((a, b) => b.key.length - a.key.length);
      const exact = candidates.find(({key}) => raw === key);
      if (exact) return exact.item;
      const prefix = candidates.find(({key}) => key.startsWith(raw));
      return prefix ? prefix.item : null;
    }

    const caseSlugOf = (id) =>
      String(id || '')
        .split('/')
        .pop()
        .replace(/\.json$/i, '');

    const pad2 = (value) => String(value).padStart(2, '0');

    /** Build the film index (poster + video) out of the studio outputs. */
    function buildFilmIndex(outputs) {
      const list = Array.isArray(outputs) ? outputs : [];
      const posters = list.filter((item) => /-intro-poster\.png$/i.test(item.name || ''));
      const videos = list.filter((item) => /-intro-1080\.mp4$/i.test(item.name || ''));
      const films = posters.map((poster) => {
        const base = String(poster.name).replace(/-intro-poster\.png$/i, ''); // promo-<slug>
        const slug = base.replace(/^promo-/, '');
        const video = videos.find((item) => item.name === base + '-intro-1080.mp4') || null;
        return {slug, poster, video, mtime: Math.max(poster.mtime || 0, video ? video.mtime || 0 : 0)};
      });
      films.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
      const bySlug = new Map(films.map((film) => [film.slug, film]));
      return {list: films, bySlug};
    }

    /**
     * Find the film for a case slug. Exact slug wins; older renders may use a
     * *shorter* slug (promo-guizang-* for the guizang-design case), so accept a
     * single direction only: the case slug starts with the film slug + "-".
     * The longest film slug wins when several match.
     */
    function filmForSlug(filmIndex, slug) {
      if (!filmIndex || !slug) return null;
      const exact = filmIndex.bySlug.get(slug);
      if (exact) return exact;
      const list = filmIndex.list || [];
      const candidates = list
        .filter((film) => slug.startsWith(film.slug + '-'))
        .sort((a, b) => b.slug.length - a.slug.length);
      return candidates[0] || null;
    }

    function timeLabel(timestamp, t) {
      if (!timestamp) return '';
      const diff = Date.now() - timestamp;
      if (diff < 60 * 1000) return t('timeJustNow');
      if (diff < 60 * 60 * 1000) return t('timeMinutes').split('{n}').join(String(Math.floor(diff / 60000)));
      const date = new Date(timestamp);
      return pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()) + ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes());
    }

    function Modal({modal, t, onClose, onCopy, onHandoff}) {
      useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [onClose]);
      if (!modal) return null;
      const isPrepare = modal.mode === 'prepare';
      const name = modal.name || '';
      const steps = isPrepare
        ? [
            {title: t('prepare1'), body: t('prepare1d').split('{name}').join(name), now: true},
            {title: t('prepare2'), body: t('prepare2d')},
            {title: t('prepare3'), body: t('prepare3d')},
          ]
        : [
            {title: t('guide1'), body: t('guide1d')},
            {title: t('guide2'), body: t('guide2d')},
            {title: t('guide3'), body: t('guide3d')},
            {title: t('guide4'), body: t('guide4d')},
          ];
      return h(
        'div',
        {
          className: 'reel-modal-mask',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose();
          },
        },
        h(
          'div',
          {className: 'reel-modal', role: 'dialog', 'aria-modal': 'true'},
          h(
            'div',
            {className: 'reel-modal-head'},
            h(
              'div',
              null,
              h('div', {className: 'reel-eyebrow'}, isPrepare ? t('prepareEyebrow') : t('guideEyebrow')),
              h('h2', null, isPrepare ? t('prepareTitle').split('{name}').join(name) : t('guideTitle')),
              h('div', {className: 'reel-modal-sub'}, isPrepare ? t('prepareSub') : t('guideSub')),
            ),
            h('button', {className: 'reel-icon-btn', type: 'button', onClick: onClose, 'aria-label': t('modalClose')}, h(Icon, {name: 'close', size: 16})),
          ),
          h(
            'div',
            {className: 'reel-modal-body'},
            steps.map((step, index) =>
              h(
                'div',
                {className: 'reel-guide-step' + (step.now ? ' is-now' : ''), key: String(index)},
                h('span', {className: 'reel-guide-no'}, String(index + 1)),
                h('div', null, h('div', {className: 'reel-guide-title'}, step.title), h('div', {className: 'reel-guide-body'}, step.body)),
              ),
            ),
            h('div', {className: 'reel-modal-note'}, isPrepare ? t('prepareNote') : t('guideNote')),
          ),
          h(
            'div',
            {className: 'reel-modal-foot'},
            h('span', {className: 'reel-mono reel-dim'}, 'V0.1 · 840 frames / 28s'),
            h('span', {style: {flex: 1}}),
            isPrepare
              ? h('button', {className: 'reel-chip', type: 'button', onClick: onCopy}, t('modalCopy'))
              : null,
            h('button', {className: 'reel-btn', type: 'button', onClick: isPrepare ? onHandoff : onClose}, isPrepare ? t('modalGo') : t('modalClose')),
          ),
        ),
      );
    }

    function App({ctx}) {
      const t = translator(ctx);
      const [state, setState] = useState(null);
      const [details, setDetails] = useState({});
      const [detailErrors, setDetailErrors] = useState({});
      const [view, setView] = useState('wall');
      const [selectedId, setSelectedId] = useState('');
      const [pluginInput, setPluginInput] = useState('');
      const [modal, setModal] = useState(null);
      const [bubbles, setBubbles] = useState([]);
      const [askValue, setAskValue] = useState('');
      const [posting, setPosting] = useState(false);
      const [jobId, setJobId] = useState('');
      const [error, setError] = useState('');
      const [toastText, setToastText] = useState('');
      const [showLog, setShowLog] = useState(false);
      const [copiedId, setCopiedId] = useState('');
      const [wallSearch, setWallSearch] = useState('');
      const [wallFilter, setWallFilter] = useState('all');
      const fetchedRef = useRef(new Set());
      const toastTimer = useRef(null);
      const copiedTimer = useRef(null);
      const submittedAt = useRef(0);

      const toast = useCallback((text) => {
        setToastText(text);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastText(''), 2400);
      }, []);

      const copy = useCallback(
        (text, id) => {
          if (!text) return false;
          try {
            const result = navigator.clipboard.writeText(text);
            if (result && typeof result.catch === 'function') {
              result.catch(() => toast(t('toastCopyFailed')));
            }
          } catch {
            toast(t('toastCopyFailed'));
            return false;
          }
          if (id) {
            setCopiedId(id);
            if (copiedTimer.current) clearTimeout(copiedTimer.current);
            copiedTimer.current = setTimeout(() => setCopiedId(''), 1500);
          }
          return true;
        },
        [toast, t],
      );

      const refresh = useCallback(() => {
        fetch(API + '/state', {cache: 'no-store'})
          .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then((data) => {
            setState(data);
          })
          .catch((err) => setError(String((err && err.message) || err)));
      }, []);

      const jobs = (state && state.jobs) || [];
      const filmJobs = jobs.filter((item) => item && item.type === 'film');
      const job = jobId
        ? filmJobs.find((item) => item.id === jobId) || null
        : filmJobs[0] || null;
      const jobStarting = Boolean(jobId && !job);
      const jobRunning = Boolean(job && (job.state === 'running' || job.state === 'queued'));
      const busy = jobRunning || jobStarting;
      const filmEnv = (state && state.film) || null;
      const filmReady = Boolean(filmEnv && filmEnv.available);
      const filmCases = ((state && state.cases) || []).filter((item) => item && item.kind === 'v01');
      const filmIndex = buildFilmIndex((state && state.outputs) || []);

      useEffect(() => {
        refresh();
        const timer = setInterval(refresh, busy ? 900 : 2500);
        return () => clearInterval(timer);
      }, [refresh, busy]);

      // A submitted job shows up in the next state poll. If the server never
      // reports it (POST raced a restart), drop the id after a grace period so
      // the studio does not stay stuck in "starting".
      useEffect(() => {
        if (!state || !jobId || job) return;
        if (state.running && state.running === jobId) return;
        if (Date.now() - submittedAt.current < 6000) return;
        setJobId('');
      }, [state, jobId, job]);

      // Load every V0.1 case JSON once: the wall and the studio both need the
      // feature pages, plugin name and slug (output file names use the slug).
      useEffect(() => {
        const pending = filmCases.filter((item) => !fetchedRef.current.has(item.id) && !details[item.id]);
        if (!pending.length) return;
        pending.forEach((item) => {
          fetchedRef.current.add(item.id);
          fetch(API + '/case?path=' + encodeURIComponent(item.id), {cache: 'no-store'})
            .then((res) => {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              return res.json();
            })
            .then((data) => {
              if (!data || !data.case) return;
              setDetails((prev) => ({...prev, [item.id]: data.case}));
            })
            .catch(() => {
              // A broken case file should not retry in a loop; the wall falls back
              // to the list metadata and the studio disables generation.
              setDetailErrors((prev) => ({...prev, [item.id]: true}));
            });
        });
      }, [filmCases.map((item) => item.id).join(','), details]);

      const models = filmCases.map((item) => {
        const data = details[item.id] || null;
        const plugin = (data && data.plugin) || {};
        const slug = (data && data.slug) || caseSlugOf(item.id);
        const film = filmForSlug(filmIndex, slug);
        const features = ((data && data.features) || []).map((feature) => ({
          tab: String(feature.tab || ''),
          caption: String(feature.caption || ''),
          img: assetUrl(feature.image),
        }));
        return {
          id: item.id,
          slug,
          caseTitle: item.title || slug,
          name: plugin.name || (data && data.plugin && data.plugin.cardTitle) || item.title || slug,
          handle: plugin.handle || item.meta || '',
          version: plugin.version || '',
          tagline: plugin.tagline || item.desc || '',
          features,
          film,
          poster: (film && film.poster && film.poster.url) || (features[0] && features[0].img),
          video: (film && film.video && film.video.url) || null,
          ready: Boolean(data) && features.length > 0,
          mtime: film ? film.mtime : 0,
        };
      });

      const recentFilms = filmIndex.list
        .map((film) => {
          const model = models.find((item) => item.slug === film.slug || item.slug.startsWith(film.slug + '-') || film.slug.startsWith(item.slug + '-')) || null;
          return {film, model};
        })
        .filter((item) => item.model)
        .slice(0, 3);

      const caseIdFromPath = (path) => 'cases/v01/' + caseSlugOf(path) + '.json';
      const jobCaseId = job ? caseIdFromPath(job.casePath) : '';
      const activeCaseId = selectedId || jobCaseId || (models[0] && models[0].id) || '';
      const activeIndex = models.findIndex((item) => item.id === activeCaseId);
      const activeModel = models[activeIndex] || models[0] || null;
      const activeJob = job && activeModel && jobCaseId === activeModel.id ? job : null;

      // Keep the selection pointing at the case of the latest film job.
      useEffect(() => {
        if (!models.length) return;
        if (selectedId && models.some((item) => item.id === selectedId)) return;
        const latest = models
          .filter((item) => item.film)
          .sort((a, b) => (b.mtime || 0) - (a.mtime || 0))[0];
        const preferred = jobCaseId && models.some((item) => item.id === jobCaseId)
          ? jobCaseId
          : (latest && latest.id) || models[0].id;
        setSelectedId(preferred);
      }, [models.map((item) => item.id).join(','), jobCaseId]);

      const matched = matchFilmCase(pluginInput, filmCases);

      const setViewSafe = (next) => {
        setView(next);
        if (next === 'wall') setShowLog(false);
      };

      const selectCase = (id) => {
        if (busy && id !== activeCaseId) {
          toast(t('toastBusy'));
          return;
        }
        setSelectedId(id);
        const model = models.find((item) => item.id === id);
        if (model) toast(t('toastCaseSwitched').split('{name}').join(model.name));
      };

      const goNext = () => {
        const value = pluginInput.trim();
        if (!value) {
          toast(t('toastNeedInput'));
          return;
        }
        if (matched) {
          if (busy && matched.id !== activeCaseId) {
            toast(t('toastBusy'));
            return;
          }
          selectCase(matched.id);
          setViewSafe('studio');
          return;
        }
        setModal({mode: 'prepare', name: value});
      };

      const handoff = (prompt, doneText) => {
        try {
          const ui = ctx && ctx.get ? ctx.get('uiWorkspace') : undefined;
          if (ui && typeof ui.startSession === 'function') {
            ui.startSession(undefined, {prompt, whenDraftExists: 'replace'});
            toast(doneText || t('toastHanded'));
            return;
          }
        } catch {
          // fall back to copying
        }
        copy(prompt, 'handoff');
        toast(t('toastPrepareCopied'));
      };

      const preparePrompt = (name) => t('preparePrompt').split('{name}').join(name || '<插件名>');
      const askPrompt = (model, text) =>
        t('askPrompt')
          .split('{case}')
          .join(model ? model.name + ' (' + model.slug + ')' : '<插件名>')
          .split('{text}')
          .join(text);

      const submitAsk = () => {
        const text = askValue.trim();
        if (!text) return;
        setBubbles((prev) => [
          ...prev,
          {id: String(Date.now()), text, caseSlug: activeModel ? activeModel.slug : '', caseName: activeModel ? activeModel.name : ''},
        ]);
        setAskValue('');
        copy(askPrompt(activeModel, text), 'ask');
        toast(t('toastAskCopied'));
      };

      const start = () => {
        if (posting || busy) return;
        if (!filmReady) {
          toast(t('notReadyBody'));
          return;
        }
        if (!activeModel || !activeModel.ready) {
          toast(t('noActiveCaseBody'));
          return;
        }
        setPosting(true);
        setError('');
        fetch(API + '/jobs', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({type: 'film', casePath: activeModel.id}),
        })
          .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
            if (data.job && data.job.id) {
              submittedAt.current = Date.now();
              setJobId(data.job.id);
            }
            setShowLog(false);
            toast(t('toastStarted'));
            refresh();
          })
          .catch((err) => setError(String((err && err.message) || err)))
          .finally(() => setPosting(false));
      };

      const cancel = () => {
        if (!job && !activeJob) return;
        const target = job || activeJob;
        fetch(API + '/jobs/' + encodeURIComponent(target.id) + '/cancel', {method: 'POST'})
          .then((res) => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            toast(t('toastStopped'));
            refresh();
          })
          .catch(() => toast(t('toastCancelFailed')));
      };

      // One reload when the browser bundle changed on disk (no manual refresh needed).
      const clientRev = state && state.clientRev;
      useEffect(() => {
        if (!clientRev) return;
        try {
          const key = 'dsh-reel-client-rev';
          const seen = sessionStorage.getItem(key);
          if (!seen) {
            sessionStorage.setItem(key, clientRev);
            return;
          }
          if (seen !== clientRev) {
            sessionStorage.setItem(key, clientRev);
            location.reload();
          }
        } catch {
          // sessionStorage may be unavailable; skip the self-reload
        }
      }, [clientRev]);

      const phase = job && job.phase ? t('phase_' + String(job.phase), job.phase) : '';
      const caseNameOf = (model) => (model ? model.name : '');

      const pipeline = (() => {
        if (jobStarting) return {index: 0, progress: 0.02, done: false, status: t('dockStarting')};
        if (!activeJob) {
          if (job && jobRunning) return {index: -1, progress: 0, done: false, status: t('state_running')};
          return {index: -1, progress: 0, done: false, status: t('dockReady')};
        }
        if (activeJob.state === 'queued') return {index: -1, progress: 0, done: false, status: t('dockQueued')};
        if (activeJob.state === 'done') return {index: 4, progress: 1, done: true, status: t('dockDone')};
        if (activeJob.state === 'failed') return {index: -1, progress: 0, done: false, status: t('state_failed')};
        if (activeJob.state === 'cancelled') return {index: -1, progress: 0, done: false, status: t('state_cancelled')};
        const jobPhase = String(activeJob.phase || '');
        if (jobPhase === 'mux') return {index: 2, progress: 0.9, done: false, status: t('stageMux')};
        if (jobPhase === 'poster') return {index: 3, progress: 0.96, done: false, status: t('stagePoster')};
        if (jobPhase === 'render:video') return {index: 1, progress: 0.16 + (activeJob.progress || 0) * 0.74, done: false, status: t('stageRender')};
        if (jobPhase === 'audio') return {index: 0, progress: 0.12, done: false, status: t('stageAudio')};
        return {index: 0, progress: 0.04, done: false, status: t('stageAssets')};
      })();

      const revealCount = (() => {
        if (jobStarting) return 1;
        if (!activeJob) return 6;
        if (activeJob.state === 'done') return 6;
        if (!busy) return 6;
        const jobPhase = String(activeJob.phase || '');
        if (jobPhase === 'render:video') return 2 + Math.min(4, Math.floor((activeJob.progress || 0) * 4));
        if (jobPhase === 'mux' || jobPhase === 'poster') return 6;
        if (jobPhase === 'audio') return 2;
        return 1;
      })();

      const storyboard = activeModel
        ? [
            {no: '01', label: t('shotOpen'), img: activeModel.poster},
            ...activeModel.features.map((feature, index) => ({no: pad2(index + 2), label: feature.tab, img: feature.img})),
            {no: '06', label: t('shotEnd'), img: activeModel.poster},
          ]
        : [];

      const playerVideo = (() => {
        if (activeModel && activeModel.video) return {video: activeModel.video, poster: activeModel.poster, existing: true};
        if (activeJob && activeJob.state === 'done' && activeJob.outputs && activeJob.outputs.video) {
          return {
            video: activeJob.outputs.video.url,
            poster: activeJob.outputs.poster ? activeJob.outputs.poster.url : activeModel && activeModel.poster,
            existing: false,
          };
        }
        return null;
      })();

      const activeBusy = Boolean(jobStarting || (activeJob && (activeJob.state === 'running' || activeJob.state === 'queued')));
      const videoTone = activeBusy ? 'busy' : playerVideo ? 'video' : 'idle';
      const canStop = jobRunning;
      const otherJobRunning = jobRunning && !activeJob;
      const activeTitle = activeModel ? activeModel.name : t('noActiveCase');

      const filteredModels = models.filter((model) => {
        const q = wallSearch.trim().toLowerCase();
        if (q && !(model.name + ' ' + model.slug + ' ' + model.handle + ' ' + model.tagline).toLowerCase().includes(q)) return false;
        if (wallFilter === 'filmed') return Boolean(model.film);
        if (wallFilter === 'unfilmed') return !model.film;
        return true;
      });

      const feedback = (() => {
        const value = pluginInput.trim();
        if (!value) return h('span', null, t('inputHint'));
        if (matched) {
          return h(
            React.Fragment,
            null,
            h('span', {className: 'reel-fb-ok'}, h(Icon, {name: 'check', size: 12}), t('matched')),
            h(
              'span',
              {className: 'reel-fb-case'},
              models.find((item) => item.id === matched.id) && models.find((item) => item.id === matched.id).poster
                ? h('img', {src: models.find((item) => item.id === matched.id).poster, alt: ''})
                : null,
              h('b', null, (models.find((item) => item.id === matched.id) || {}).name || matched.title),
              h('span', {className: 'reel-mono'}, matched.title || caseSlugOf(matched.id)),
            ),
            h('span', null, t('matchedGo')),
          );
        }
        return h(
          React.Fragment,
          null,
          h('span', {className: 'reel-fb-warn'}, '· ' + t('noCase')),
          h('span', null, '「' + value + '」' + t('noCaseNext')),
        );
      })();

      // ---------------------------------------------------------------- render
      const wallCard = (model, index) => {
        const thumbs = model.features.slice(1, 3).filter((feature) => feature.img);
        const filmed = Boolean(model.film);
        return h(
          'article',
          {
            className: 'reel-card' + (filmed ? ' is-filmed' : ''),
            key: model.id,
            style: {animationDelay: Math.min(index, 4) * 55 + 'ms'},
            onClick: () => {
              if (busy) {
                toast(t('toastBusy'));
                return;
              }
              setSelectedId(model.id);
              setViewSafe('studio');
            },
          },
          h(
            'div',
            {className: 'reel-card-media'},
            model.poster
              ? h('img', {className: 'reel-card-main', src: model.poster, alt: (model.name || model.slug) + ' poster', loading: 'lazy'})
              : h('div', {className: 'reel-card-main reel-skeleton'}),
            h(
              'div',
              {className: 'reel-card-badges'},
              h('span', {className: 'reel-badge is-mint'}, filmed ? t('filmedBadge') : t('notFilmed')),
              h('span', {className: 'reel-badge reel-mono'}, t('durationBadge')),
            ),
            thumbs.length
              ? h(
                  'div',
                  {className: 'reel-card-thumbs'},
                  thumbs.map((feature, thumbIndex) =>
                    feature.img ? h('img', {key: String(thumbIndex), src: feature.img, alt: feature.tab || '', loading: 'lazy'}) : null,
                  ),
                )
              : null,
          ),
          h(
            'div',
            {className: 'reel-card-body'},
            h('h3', null, model.name || model.slug),
            h('div', {className: 'reel-card-handle'}, model.handle + (model.version ? ' · v' + model.version : '')),
            detailErrors[model.id]
              ? h('p', {className: 'reel-card-tag reel-dim'}, t('caseLoadFailed'))
              : h('p', {className: 'reel-card-tag'}, model.tagline),
            h(
              'div',
              {className: 'reel-card-foot'},
              model.film ? h('span', {className: 'reel-meta-pill'}, timeLabel(model.film.mtime, t)) : null,
              h('span', {className: 'reel-card-go'}, t('openStudio'), h(Icon, {name: 'arrow', size: 13})),
            ),
          ),
        );
      };

      const wallView = h(
        'section',
        {className: 'reel-view'},
        h(
          'div',
          {className: 'reel-wrap'},
          h(
            'div',
            {className: 'reel-hero'},
            h(
              'div',
              {className: 'reel-hero-main'},
              h('div', {className: 'reel-eyebrow'}, t('heroEyebrow')),
              h('h1', null, t('heroTitleA'), h('br'), t('heroTitleB'), h('em', null, t('heroTitleEm')), t('heroTitleC')),
              h('p', null, t('heroSub')),
              h(
                'div',
                {className: 'reel-inputwrap'},
                h(
                  'div',
                  {className: 'reel-inputbox'},
                  h(Icon, {name: 'search', size: 17}),
                  h('input', {
                    value: pluginInput,
                    placeholder: t('inputPlaceholder'),
                    onChange: (event) => setPluginInput(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') goNext();
                    },
                    'aria-label': t('inputPlaceholder'),
                    spellCheck: false,
                  }),
                  h('button', {className: 'reel-next', type: 'button', onClick: goNext}, t('next'), h(Icon, {name: 'arrow', size: 14})),
                ),
                h('div', {className: 'reel-feedback'}, feedback),
                h(
                  'div',
                  {className: 'reel-input-links'},
                  h('button', {className: 'reel-link', type: 'button', onClick: () => setModal({mode: 'help'})}, t('howto')),
                  h('span', {className: 'reel-dot'}, '·'),
                  h('span', null, t('availableCases') + '：' + models.map((model) => model.slug).join(' · ')),
                ),
              ),
            ),
            h(
              'div',
              {className: 'reel-hero-stats'},
              h('div', {className: 'reel-stat'}, h('b', null, pad2(models.length)), h('span', null, t('heroStatCases'))),
              h('div', {className: 'reel-stat'}, h('b', null, '28s'), h('span', null, t('heroStatDuration'))),
              h('div', {className: 'reel-stat'}, h('b', null, '840'), h('span', null, t('heroStatFrames'))),
            ),
          ),
          h(
            'div',
            {className: 'reel-toolrow'},
            h(
              'label',
              {className: 'reel-search'},
              h(Icon, {name: 'search', size: 14}),
              h('input', {value: wallSearch, placeholder: t('wallSearch'), onChange: (event) => setWallSearch(event.target.value)}),
            ),
            h(
              'div',
              {className: 'reel-chips'},
              [
                ['all', t('filterAll')],
                ['filmed', t('filterFilmed')],
                ['unfilmed', t('filterUnfilmed')],
              ].map(([value, label]) =>
                h(
                  'button',
                  {
                    key: value,
                    type: 'button',
                    className: 'reel-chip' + (wallFilter === value ? ' is-active' : ''),
                    onClick: () => setWallFilter(value),
                  },
                  label,
                ),
              ),
            ),
            h('span', {style: {flex: 1}}),
          ),
          !state || filmReady
            ? null
            : h(
                'div',
                {className: 'reel-banner'},
                h('div', null, h('b', null, t('notReadyTitle')), h('span', {className: 'reel-dim'}, t('notReadyBody'))),
                h('button', {className: 'reel-chip', type: 'button', onClick: () => setModal({mode: 'help'})}, t('howto')),
              ),
          h(
            'div',
            {className: 'reel-wall'},
            filteredModels.length
              ? filteredModels.map(wallCard)
              : h('div', {className: 'reel-wall-empty'}, t('searchEmpty')),
            h(
              'article',
              {
                className: 'reel-add',
                onClick: () => {
                  const input = document.querySelector('.reel-inputbox input');
                  const scroller = document.querySelector('.reel-view');
                  if (scroller) scroller.scrollTo({top: 0, behavior: 'smooth'});
                  if (input) {
                    input.focus();
                    input.select();
                  }
                  toast(t('toastNeedInput'));
                },
              },
              h('div', {className: 'reel-add-plus'}, '+'),
              h(
                'div',
                {className: 'reel-add-txt'},
                h('h3', null, t('addTitle')),
                h('p', null, t('addDesc')),
              ),
              h('span', {className: 'reel-add-go'}, t('addGo'), h(Icon, {name: 'arrow', size: 13})),
            ),
          ),
        ),
      );

      const studioView = h(
        'section',
        {className: 'reel-view reel-view-studio'},
        h(
          'div',
          {className: 'reel-wrap'},
          h(
            'div',
            {className: 'reel-studio'},
            // left
            h(
              'div',
              {className: 'reel-col'},
              h(
                'div',
                {className: 'reel-pane'},
                h(
                  'div',
                  {className: 'reel-pane-head'},
                  h('span', null, t('targetTitle')),
                  h('span', {className: 'reel-mono reel-dim'}, t('targetCaseTag')),
                ),
                h(
                  'div',
                  {className: 'reel-pane-body'},
                  activeModel
                    ? h(
                        React.Fragment,
                        null,
                        h(
                          'div',
                          {className: 'reel-target'},
                          activeModel.poster
                            ? h('img', {className: 'reel-target-poster', src: activeModel.poster, alt: ''})
                            : h('div', {className: 'reel-target-poster reel-skeleton'}),
                          h(
                            'div',
                            {className: 'reel-target-info'},
                            h('b', null, activeTitle),
                            h('span', {className: 'reel-mono'}, activeModel.handle),
                            h('span', {className: 'reel-dim'}, t('matchedMeta')),
                          ),
                        ),
                        h('button', {className: 'reel-ghost', type: 'button', onClick: () => setViewSafe('wall')}, t('switchCase'), h(Icon, {name: 'arrow', size: 13})),
                        h('div', {className: 'reel-rule'}),
                        h('div', {className: 'reel-mini-label'}, t('askLabel')),
                        h(
                          'div',
                          null,
                          [t('ask1'), t('ask2'), t('ask3')].map((label, index) =>
                            h(
                              'button',
                              {
                                key: String(index),
                                className: 'reel-ask-chip',
                                type: 'button',
                                onClick: () => {
                                  setAskValue(label);
                                },
                              },
                              label,
                            ),
                          ),
                        ),
                        h(
                          'div',
                          {className: 'reel-ask-input'},
                          h('input', {
                            value: askValue,
                            placeholder: t('askPlaceholder'),
                            onChange: (event) => setAskValue(event.target.value),
                            onKeyDown: (event) => {
                              if (event.key === 'Enter') submitAsk();
                            },
                          }),
                          h(
                            'button',
                            {type: 'button', onClick: submitAsk, 'aria-label': t('askLabel')},
                            h(Icon, {name: 'spine', size: 13}),
                          ),
                        ),
                        bubbles.length
                          ? h(
                              'div',
                              {className: 'reel-bubbles'},
                              bubbles.map((bubble) =>
                                h(
                                  'div',
                                  {className: 'reel-bubble', key: bubble.id},
                                  h('span', {className: 'reel-bubble-ok'}, '✓'),
                                  h('span', null,
                                    bubble.caseSlug
                                      ? h('span', {className: 'reel-bubble-case reel-mono'}, '[' + bubble.caseSlug + '] ')
                                      : null,
                                    bubble.text,
                                  ),
                                  h(
                                    'button',
                                    {
                                      className: 'reel-bubble-undo',
                                      type: 'button',
                                      onClick: () => setBubbles((prev) => prev.filter((item) => item.id !== bubble.id)),
                                    },
                                    '×',
                                  ),
                                ),
                              ),
                            )
                          : null,
                        h(
                          'button',
                          {
                            className: 'reel-ghost',
                            type: 'button',
                            style: {marginTop: '12px'},
                            onClick: () => {
                              setViewSafe('wall');
                              const input = document.querySelector('.reel-inputbox input');
                              if (input) {
                                input.focus();
                                input.select();
                              }
                              toast(t('toastNeedInput'));
                            },
                          },
                          t('prepareNew'),
                        ),
                        h('div', {className: 'reel-rule'}),
                        h('div', {className: 'reel-mini-label'}, t('recentFilms')),
                        recentFilms.length
                          ? h(
                              'div',
                              {className: 'reel-recent'},
                              recentFilms.map(({film, model}) =>
                                h(
                                  'button',
                                  {
                                    key: film.slug,
                                    type: 'button',
                                    className: 'reel-recent-row',
                                    onClick: () => {
                                      if (busy && model.id !== activeCaseId) {
                                        toast(t('toastBusy'));
                                        return;
                                      }
                                      setSelectedId(model.id);
                                      toast(t('toastCaseSwitched').split('{name}').join(model.name));
                                    },
                                  },
                                  h('span', {className: 'reel-recent-thumb', style: {backgroundImage: 'url(' + (film.poster ? film.poster.url : '') + ')'}}),
                                  h('span', {className: 'reel-recent-name'}, model.slug),
                                  h('span', {className: 'reel-mono reel-dim'}, timeLabel(film.mtime, t)),
                                ),
                              ),
                            )
                          : h('div', {className: 'reel-dim reel-recent-empty'}, t('recentEmpty')),
                      )
                    : h('div', {className: 'reel-dim'}, t('noActiveCaseBody')),
                ),
                h(
                  'div',
                  {className: 'reel-pane-foot'},
                  h('div', {className: 'reel-row'}, h('span', null, '渲染器 · 无头 Chrome'), h('span', {className: 'reel-ok'}, filmReady ? '✓' : '—')),
                  h('div', {className: 'reel-row'}, h('span', null, 'ffmpeg · python3'), h('span', {className: 'reel-ok'}, filmReady ? '✓' : '—')),
                  h(
                    'div',
                    {className: 'reel-row'},
                    h('span', null, 'case assets'),
                    h('span', {className: 'reel-ok'}, activeModel ? activeModel.features.length + ' / 4' : '—'),
                  ),
                ),
              ),
            ),
            // center
            h(
              'div',
              {className: 'reel-col'},
              h(
                'div',
                {className: 'reel-pane reel-stage'},
                h('div', {className: 'reel-eyebrow'}, t('studioEyebrow')),
                h('h1', null, activeTitle),
                activeModel ? h('p', {className: 'reel-stage-tagline'}, activeModel.tagline) : null,
                h(
                  'div',
                  {className: 'reel-meta-row'},
                  h('span', {className: 'reel-meta-pill'}, t('metaDuration')),
                  h('span', {className: 'reel-meta-pill'}, t('metaFrames')),
                  h('span', {className: 'reel-meta-pill'}, t('metaRes')),
                  activeModel
                    ? h('span', {className: 'reel-meta-pill'}, activeModel.slug + (activeModel.version ? ' · v' + activeModel.version : ''))
                    : null,
                ),
                h(
                  'div',
                  {className: 'reel-cover'},
                  activeModel && activeModel.poster ? h('img', {className: 'is-a', src: activeModel.poster, alt: ''}) : null,
                  activeModel && activeModel.features[1] && activeModel.features[1].img
                    ? h('img', {className: 'is-b', src: activeModel.features[1].img, alt: ''})
                    : null,
                  activeModel && activeModel.features[3] && activeModel.features[3].img
                    ? h('img', {className: 'is-c', src: activeModel.features[3].img, alt: ''})
                    : h('img', {className: 'is-c', src: activeModel && activeModel.poster, alt: ''}),
                ),
                activeModel && activeModel.features.length
                  ? h(
                      'div',
                      {className: 'reel-features'},
                      activeModel.features.map((feature, index) =>
                        h(
                          'figure',
                          {key: String(index)},
                          feature.img ? h('img', {src: feature.img, alt: feature.tab || '', loading: 'lazy'}) : h('div', {className: 'reel-skeleton reel-feature-skeleton'}),
                          h('figcaption', null, feature.tab),
                        ),
                      ),
                    )
                  : null,
                h(
                  'div',
                  {className: 'reel-stage-actions'},
                  h(
                    'button',
                    {
                      className: 'reel-btn' + (canStop ? ' is-stop' : ''),
                      type: 'button',
                      disabled: posting || jobStarting || (!canStop && (!activeModel || !activeModel.ready || !filmReady)),
                      onClick: canStop ? cancel : start,
                    },
                    canStop
                      ? h(React.Fragment, null, h(Icon, {name: 'play', size: 15}), t('stop'))
                      : h(
                          React.Fragment,
                          null,
                          h(Icon, {name: 'play', size: 15}),
                          posting || jobStarting ? t('generating') : activeModel && activeModel.film ? t('regenerate') : t('generate'),
                        ),
                  ),
                  h(
                    'button',
                    {
                      className: 'reel-ghost',
                      type: 'button',
                      onClick: () => {
                        const artifact =
                          (activeJob && activeJob.outputs && (activeJob.outputs.video || activeJob.outputs.poster)) ||
                          (activeModel && activeModel.film && (activeModel.film.video || activeModel.film.poster)) ||
                          null;
                        if (!artifact) {
                          toast(t('recentEmpty'));
                          return;
                        }
                        if (copy(artifact.path, 'path')) toast(t('toastPathCopied'));
                      },
                    },
                    copiedId === 'path' ? t('toastCopied') : t('copyPath'),
                  ),
                  h('span', {className: 'reel-mono reel-dim'}, busy ? t('genHintBusy') : t('genHint')),
                ),
                h(
                  'div',
                  {className: 'reel-player is-' + videoTone},
                  h(
                    'div',
                    {className: 'reel-player-stage'},
                    (playerVideo && playerVideo.poster) || (activeModel && activeModel.poster)
                      ? h('img', {src: (playerVideo && playerVideo.poster) || activeModel.poster, alt: ''})
                      : h('div', {className: 'reel-player-empty'}),
                    videoTone === 'video' && playerVideo
                      ? h('video', {
                          controls: true,
                          preload: 'metadata',
                          poster: playerVideo.poster || '',
                          src: playerVideo.video,
                          className: 'reel-player-video',
                        })
                      : h(
                          'div',
                          {className: 'reel-player-veil' + (videoTone === 'busy' ? ' is-busy' : '')},
                          h('span', null, videoTone === 'busy' ? t('playerBusy') : t('playerPlaceholder')),
                        ),
                  ),
                  h(
                    'div',
                    {className: 'reel-player-foot'},
                    h('span', {className: 'reel-mono reel-dim'},
                      activeModel
                        ? ((activeModel.film && activeModel.film.video && activeModel.film.video.name) ||
                            (activeJob && activeJob.outputs && activeJob.outputs.video && activeJob.outputs.video.path
                              ? activeJob.outputs.video.path.split('/').pop()
                              : 'promo-' + activeModel.slug + '-intro-1080.mp4'))
                        : '—',
                    ),
                    h('span', {style: {flex: 1}}),
                    h('span', {className: 'reel-mono reel-dim'}, 'H.264 · AAC · 28.0s'),
                  ),
                ),
              ),
            ),
            // right
            h(
              'div',
              {className: 'reel-col'},
              h(
                'div',
                {className: 'reel-pane'},
                h(
                  'div',
                  {className: 'reel-pane-head'},
                  h('span', null, t('shotsTitle')),
                  h('span', {className: 'reel-mono reel-dim'}, t('shotsHint')),
                ),
                h(
                  'div',
                  {className: 'reel-pane-body'},
                  h(
                    'div',
                    {className: 'reel-shots'},
                    storyboard.length
                      ? storyboard.map((shot, index) => {
                          const revealed = !busy || index < revealCount;
                          return h(
                            'figure',
                            {className: 'reel-shot' + (revealed ? ' is-develop' : ' is-pending'), key: String(index)},
                            h('span', {className: 'reel-shot-no'}, shot.no),
                            shot.img
                              ? h('img', {src: shot.img, alt: shot.label, loading: 'lazy'})
                              : h('div', {className: 'reel-skeleton'}),
                            h('figcaption', null, shot.label),
                          );
                        })
                      : h('div', {className: 'reel-dim'}, t('noActiveCaseBody')),
                  ),
                  h(
                    'div',
                    {className: 'reel-timeline'},
                    (t('timelineRows') || []).map((row, index) => {
                      const [time, label] = String(row).split('|');
                      return h(
                        'div',
                        {className: 'reel-tl-row', key: String(index)},
                        h('span', {className: 'reel-mono reel-dim'}, time),
                        h('span', null, label),
                      );
                    }),
                  ),
                ),
                h(
                  'div',
                  {className: 'reel-pane-foot'},
                  h('div', {className: 'reel-row'}, h('span', null, t('outDuration')), h('b', null, '28.0s')),
                  h('div', {className: 'reel-row'}, h('span', null, t('outSpec')), h('b', null, '1920×1080 · 30fps')),
                  h('div', {className: 'reel-row'}, h('span', null, t('outCodec')), h('b', null, 'H.264 + AAC')),
                  h(
                    'div',
                    {className: 'reel-out-path reel-mono reel-dim'},
                    activeModel
                      ? 'studio/out/' +
                        ((activeModel.film && activeModel.film.video && activeModel.film.video.name) ||
                          'promo-' + activeModel.slug + '-intro-1080.mp4')
                      : '—',
                  ),
                ),
              ),
            ),
          ),
        ),
      );

      const dockbar = h(
        'div',
        {className: 'reel-dockbar'},
        h('span', {className: 'reel-dock-label reel-mono'}, t('dockPipeline')),
        h(
          'div',
          {className: 'reel-steps'},
          [
            t('stageAssets'),
            t('stageRender'),
            t('stageMux'),
            t('stagePoster'),
          ].map((label, index) => {
            const active = pipeline.index === index && !pipeline.done;
            const done = pipeline.done || index < pipeline.index;
            return h(
              'span',
              {className: 'reel-step' + (active ? ' is-active' : '') + (done ? ' is-done' : ''), key: String(index)},
              h('i', null, done ? '✓' : String(index + 1)),
              label,
            );
          }),
        ),
        h('div', {className: 'reel-bar'}, h('i', {style: {width: Math.round(pipeline.progress * 100) + '%'}})),
        h('span', {className: 'reel-dock-meta reel-mono reel-dim'},
          canStop || jobStarting
            ? (jobStarting ? t('dockStarting') : (phase || '')) + ' · ' + Math.round(pipeline.progress * 100) + '%'
            : pipeline.status,
        ),
        activeJob || otherJobRunning
          ? h(
              'button',
              {className: 'reel-chip', type: 'button', onClick: () => setShowLog(!showLog)},
              showLog ? t('logHide') : t('logShow'),
            )
          : null,
      );

      return h(
        'div',
        {className: 'reel-page'},
        h('style', null, CSS),
        h('div', {className: 'reel-ambient'}),
        h(
          'div',
          {className: 'reel-app'},
          h(
            'aside',
            {className: 'reel-rail'},
            h('div', {className: 'reel-logo'}, h(ReelIcon, {size: 18, active: true})),
            h(
              'nav',
              {className: 'reel-rail-nav'},
              h(
                'button',
                {
                  className: 'reel-rail-btn' + (view === 'wall' ? ' is-active' : ''),
                  type: 'button',
                  title: t('railWall'),
                  onClick: () => setViewSafe('wall'),
                },
                h(Icon, {name: 'wall', size: 18}),
              ),
              h(
                'button',
                {
                  className: 'reel-rail-btn' + (view === 'studio' ? ' is-active' : ''),
                  type: 'button',
                  title: t('railStudio'),
                  onClick: () => setViewSafe('studio'),
                },
                h(Icon, {name: 'studio', size: 18}),
              ),
            ),
            h(
              'div',
              {className: 'reel-rail-bottom'},
              h('div', {className: 'reel-rail-sep'}),
              h(
                'button',
                {className: 'reel-rail-btn', type: 'button', title: t('railHelp'), onClick: () => setModal({mode: 'help'})},
                h(Icon, {name: 'help', size: 18}),
              ),
            ),
          ),
          h(
            'main',
            {className: 'reel-main'},
            h('h1', {className: 'reel-sr'}, t('panelTitle')),
            h(
              'header',
              {className: 'reel-topbar'},
              h(
                'div',
                {className: 'reel-nav-pill'},
                h(
                  'button',
                  {className: view === 'wall' ? 'is-active' : '', type: 'button', onClick: () => setViewSafe('wall')},
                  t('navWall'),
                ),
                h(
                  'button',
                  {className: view === 'studio' ? 'is-active' : '', type: 'button', onClick: () => setViewSafe('studio')},
                  t('navStudio'),
                ),
              ),
              h(
                'div',
                {className: 'reel-topright'},
                h(
                  'span',
                  {className: 'reel-status' + (busy || otherJobRunning ? ' is-busy' : '')},
                  h('i', {className: 'reel-dot'}),
                  h(
                    'span',
                    null,
                    jobStarting
                      ? t('state_running') + ' · ' + t('dockStarting')
                      : canStop
                        ? t('state_running') + ' · ' + (phase || '')
                        : activeJob && activeJob.state === 'done'
                          ? t('state_done') + ' · ' + caseNameOf(activeModel)
                          : otherJobRunning
                            ? t('state_running') + ' · ' + caseNameOf(models.find((item) => item.id === jobCaseId))
                            : t('recentFilms') + ' · ' + caseNameOf((recentFilms[0] && recentFilms[0].model) || activeModel),
                  ),
                  h('span', {className: 'reel-mono reel-dim'}, busy || otherJobRunning ? Math.round(pipeline.progress * 100) + '%' : '28.0s'),
                ),
                h(
                  'button',
                  {className: 'reel-icon-btn', type: 'button', title: t('howto'), onClick: () => setModal({mode: 'help'})},
                  h(Icon, {name: 'help', size: 16}),
                ),
              ),
            ),
            error
              ? h(
                  'div',
                  {className: 'reel-error', onClick: () => setError(''), title: t('modalClose'), style: {cursor: 'pointer'}},
                  error + ' ×',
                )
              : activeJob && activeJob.state === 'failed'
                ? h('div', {className: 'reel-error'}, t('jobError').split('{error}').join(activeJob.error || activeJob.state))
                : null,
            view === 'wall' ? wallView : studioView,
            view === 'studio' ? dockbar : null,
            view === 'studio' && showLog && activeJob
              ? h(
                  'pre',
                  {className: 'reel-log'},
                  ((activeJob && activeJob.logTail) || []).join('\n') || '—',
                )
              : null,
          ),
        ),
        h(Modal, {
          modal,
          t,
          onClose: () => setModal(null),
          onCopy: () => {
            const name = modal && modal.name ? modal.name : pluginInput.trim() || '<插件名>';
            copy(preparePrompt(name), 'prepare');
            toast(t('toastPrepareCopied'));
          },
          onHandoff: () => {
            const name = modal && modal.name ? modal.name : pluginInput.trim() || '<插件名>';
            handoff(preparePrompt(name));
            setModal(null);
          },
        }),
        toastText ? h('div', {className: 'reel-toast'}, toastText) : null,
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
.reel-page{--reel-serif:"Songti SC","STSong","Noto Serif SC","Source Han Serif SC",Georgia,serif;--reel-latin:"Iowan Old Style","Palatino",Georgia,"Songti SC",serif;--reel-mono:ui-monospace,SFMono-Regular,Menlo,monospace;--reel-spring:cubic-bezier(.2,1.3,.4,1);--reel-ease:cubic-bezier(.2,.8,.2,1);--reel-glass:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 72%,transparent);--reel-glass2:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 88%,transparent);position:relative;display:flex;height:100%;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55;font-family:var(--dsw-font-family);box-sizing:border-box}
.reel-page *{box-sizing:border-box}
.reel-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.reel-ambient{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0}
.reel-ambient::before{content:"";position:absolute;inset:0;background:radial-gradient(760px 520px at 10% -6%,color-mix(in srgb,var(--dsw-static-deepseek-500,#4d6bfe) 16%,transparent),transparent 62%),radial-gradient(900px 620px at 96% 6%,rgba(244,177,131,.10),transparent 60%),radial-gradient(700px 520px at 70% 108%,color-mix(in srgb,var(--dsw-static-deepseek-500,#4d6bfe) 12%,transparent),transparent 62%)}
.reel-ambient::after{content:"";position:absolute;inset:0;opacity:.5;background-image:linear-gradient(var(--dsw-alias-border-l1) 1px,transparent 1px),linear-gradient(90deg,var(--dsw-alias-border-l1) 1px,transparent 1px);background-size:88px 88px;-webkit-mask-image:radial-gradient(ellipse at 50% 26%,black 18%,transparent 80%);mask-image:radial-gradient(ellipse at 50% 26%,black 18%,transparent 80%)}
.reel-app{position:relative;z-index:1;display:flex;flex:1;min-height:0;width:100%}
.reel-rail{flex:none;width:58px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 0 14px;border-right:.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 55%,transparent);backdrop-filter:blur(24px) saturate(150%)}
.reel-logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(145deg,var(--dsw-alias-bg-layer-3),var(--dsw-alias-bg-layer-2));border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-link);margin-bottom:10px}
.reel-rail-nav,.reel-rail-bottom{display:flex;flex-direction:column;gap:4px}
.reel-rail-bottom{margin-top:auto}
.reel-rail-btn{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;color:var(--dsw-alias-label-tertiary);background:none;border:0;cursor:pointer;transition:background .2s,color .2s,transform .25s var(--reel-spring)}
.reel-rail-btn:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-3) 80%,transparent);transform:translateY(-1px)}
.reel-rail-btn.is-active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}
.reel-rail-sep{width:22px;height:1px;background:var(--dsw-alias-border-l2);margin:8px auto}
.reel-main{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden}
.reel-topbar{position:absolute;z-index:30;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 26px 0;pointer-events:none}
.reel-topbar>*{pointer-events:auto}
.reel-nav-pill{display:inline-flex;gap:2px;padding:4px;border-radius:14px;background:var(--reel-glass);border:.5px solid var(--dsw-alias-border-l2);backdrop-filter:blur(24px) saturate(160%);box-shadow:var(--dsw-elevation-soft)}
.reel-nav-pill button{height:32px;padding:0 16px;border-radius:10px;font-size:13px;color:var(--dsw-alias-label-secondary);background:none;border:0;cursor:pointer;transition:background .2s,color .2s}
.reel-nav-pill button:hover{color:var(--dsw-alias-label-primary)}
.reel-nav-pill button.is-active{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);font-weight:600}
.reel-topright{display:flex;align-items:center;gap:8px}
.reel-status{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 13px;border-radius:999px;background:var(--reel-glass);border:.5px solid var(--dsw-alias-border-l2);backdrop-filter:blur(20px);color:var(--dsw-alias-label-secondary);font-size:12px}
.reel-status .reel-dot{width:6px;height:6px;border-radius:999px;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 10px var(--dsw-alias-state-success-primary)}
.reel-status.is-busy .reel-dot{background:var(--dsw-alias-state-warning-primary,#f7ad31);box-shadow:0 0 10px var(--dsw-alias-state-warning-primary,#f7ad31);animation:reel-pulse-dot 1.4s infinite}
.reel-icon-btn{width:32px;height:32px;border-radius:999px;display:grid;place-items:center;background:var(--reel-glass);border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;backdrop-filter:blur(20px);transition:color .2s,transform .25s var(--reel-spring)}
.reel-icon-btn:hover{color:var(--dsw-alias-label-primary);transform:translateY(-1px)}
.reel-view{flex:1;min-height:0;overflow:hidden auto;padding:74px 26px 34px;scrollbar-width:thin}
.reel-view-studio{overflow:hidden;padding-bottom:96px}
.reel-wrap{max-width:1320px;margin:0 auto;height:100%}
.reel-eyebrow{font-family:var(--reel-mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}
.reel-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;margin:14px 0 24px;flex-wrap:wrap}
.reel-hero-main{min-width:0;max-width:760px}
.reel-hero h1{margin:10px 0 12px;font-family:var(--reel-serif);font-weight:300;font-size:clamp(30px,4.1vw,52px);line-height:1.16;letter-spacing:-.015em;color:var(--dsw-alias-label-primary)}
.reel-hero h1 em{font-style:normal;color:var(--dsw-alias-link);font-weight:400}
.reel-hero p{margin:0;color:var(--dsw-alias-label-secondary);font-size:14px;max-width:640px;line-height:1.7}
.reel-hero-stats{display:flex;align-items:flex-end;gap:26px;flex:none}
.reel-stat{display:flex;flex-direction:column;gap:2px;padding-left:14px;border-left:.5px solid var(--dsw-alias-border-l2)}
.reel-stat:first-child{padding-left:0;border-left:0}
.reel-stat b{font-family:var(--reel-latin);font-weight:400;font-size:30px;line-height:1;letter-spacing:-.02em;color:var(--dsw-alias-label-primary)}
.reel-stat span{font-family:var(--reel-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}
.reel-inputwrap{margin-top:22px;max-width:640px}
.reel-inputbox{display:flex;align-items:center;gap:10px;height:52px;padding:0 8px 0 18px;border-radius:999px;background:var(--reel-glass2);border:.5px solid var(--dsw-alias-border-l2);backdrop-filter:blur(24px) saturate(160%);box-shadow:var(--dsw-elevation-soft);transition:border-color .25s,box-shadow .25s}
.reel-inputbox:focus-within{border-color:color-mix(in srgb,var(--dsw-alias-link) 55%,var(--dsw-alias-border-l2))}
.reel-inputbox>svg{flex:none;color:var(--dsw-alias-label-tertiary)}
.reel-inputbox input{flex:1;min-width:0;border:0;outline:0;background:none;font:inherit;font-size:14.5px;color:var(--dsw-alias-label-primary)}
.reel-inputbox input::placeholder{color:var(--dsw-alias-label-caption)}
.reel-next{flex:none;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 17px;border-radius:999px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);font-size:12.5px;font-weight:600;border:0;cursor:pointer;transition:transform .3s var(--reel-spring)}
.reel-next:hover{transform:translateY(-1px)}
.reel-feedback{margin-top:9px;font-size:12px;color:var(--dsw-alias-label-tertiary);min-height:20px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.reel-fb-ok{color:var(--dsw-alias-state-success-primary);display:inline-flex;align-items:center;gap:4px}
.reel-fb-warn{color:var(--dsw-alias-state-warning-primary,#d39a2c)}
.reel-fb-case{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 11px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 70%,transparent);border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.reel-fb-case img{width:34px;height:20px;border-radius:5px;object-fit:cover;border:.5px solid var(--dsw-alias-border-l1)}
.reel-fb-case b{font-weight:600;color:var(--dsw-alias-label-primary)}
.reel-input-links{display:flex;align-items:center;gap:9px;margin-top:6px;font-size:11px;color:var(--dsw-alias-label-tertiary);flex-wrap:wrap}
.reel-link{font-size:11px;color:var(--dsw-alias-label-secondary);border-bottom:.5px solid var(--dsw-alias-border-l3);padding-bottom:1px;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer}
.reel-link:hover{color:var(--dsw-alias-label-primary)}
.reel-dot{opacity:.5}
.reel-toolrow{display:flex;align-items:center;gap:10px;margin:8px 0 16px;flex-wrap:wrap}
.reel-search{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 13px;border-radius:999px;background:var(--reel-glass);border:.5px solid var(--dsw-alias-border-l2);backdrop-filter:blur(18px);min-width:220px;color:var(--dsw-alias-label-tertiary)}
.reel-search input{border:0;outline:0;background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;width:100%}
.reel-search input::placeholder{color:var(--dsw-alias-label-caption)}
.reel-chips{display:inline-flex;gap:6px}
.reel-chip{height:30px;padding:0 13px;border-radius:999px;font-size:12px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 55%,transparent);border:.5px solid var(--dsw-alias-border-l2);cursor:pointer;transition:background .2s,color .2s,transform .25s var(--reel-spring)}
.reel-chip:hover{color:var(--dsw-alias-label-primary);transform:translateY(-1px)}
.reel-chip.is-active{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);border-color:transparent;font-weight:600}
.reel-hint{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.reel-banner{display:flex;align-items:center;gap:14px;justify-content:space-between;padding:12px 16px;margin:0 0 14px;border-radius:12px;border:.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 60%,transparent);font-size:12px;color:var(--dsw-alias-label-secondary)}
.reel-banner b{display:block;color:var(--dsw-alias-label-primary);margin-bottom:2px}
.reel-wall{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding-bottom:10px}
.reel-card{position:relative;border-radius:22px;overflow:hidden;cursor:pointer;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-soft);transition:transform .5s var(--reel-spring),box-shadow .35s var(--reel-ease),border-color .3s;animation:reel-rise .6s var(--reel-ease) both}
.reel-card:hover{transform:translateY(-5px);box-shadow:var(--dsw-elevation-prominent);border-color:var(--dsw-alias-border-l4)}
.reel-card-media{position:relative;aspect-ratio:16/8.2;overflow:hidden;background:var(--dsw-alias-bg-layer-3)}
.reel-card-main{width:100%;height:100%;object-fit:cover;transition:transform .7s var(--reel-ease)}
.reel-card:hover .reel-card-main{transform:scale(1.035)}
.reel-card-media::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.16),transparent 34%,rgba(0,0,0,.5));pointer-events:none}
.reel-card-badges{position:absolute;left:14px;top:14px;display:flex;gap:6px;z-index:2}
.reel-badge{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:11px;background:rgba(10,12,17,.55);border:.5px solid rgba(255,255,255,.22);color:#f3f5f9;backdrop-filter:blur(10px)}
.reel-badge.is-mint{color:#06110c;background:#5ef2c2;border-color:transparent;font-weight:600}
.reel-card-thumbs{position:absolute;right:14px;bottom:14px;display:flex;z-index:2}
.reel-card-thumbs img{width:62px;aspect-ratio:16/10;object-fit:cover;border-radius:9px;border:.5px solid rgba(255,255,255,.35);box-shadow:0 10px 22px rgba(0,0,0,.45);transform:rotate(-2.5deg);transition:transform .45s var(--reel-spring)}
.reel-card-thumbs img+img{margin-left:-16px;transform:rotate(2deg) translateY(4px)}
.reel-card:hover .reel-card-thumbs img{transform:rotate(-1deg)}
.reel-card:hover .reel-card-thumbs img+img{transform:rotate(.5deg) translateY(2px)}
.reel-card-body{padding:14px 16px 16px}
.reel-card-body h3{margin:0 0 3px;font-family:var(--reel-serif);font-size:22px;font-weight:400;line-height:1.25;letter-spacing:-.01em}
.reel-card-handle{font-family:var(--reel-mono);font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reel-card-tag{margin:8px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.reel-card-foot{display:flex;align-items:center;gap:6px;margin-top:12px}
.reel-meta-pill{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-family:var(--reel-mono);font-size:10.5px;letter-spacing:.03em}
.reel-card-go{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);opacity:0;transform:translateX(-6px);transition:opacity .3s,transform .4s var(--reel-spring)}
.reel-card:hover .reel-card-go{opacity:1;transform:none;color:var(--dsw-alias-label-primary)}
.reel-add{grid-column:1/-1;border:1px dashed var(--dsw-alias-border-l3);border-radius:18px;display:flex;align-items:center;gap:16px;padding:16px 20px;cursor:pointer;transition:background .25s,border-color .25s;animation:reel-rise .6s var(--reel-ease) both}
.reel-add:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 55%,transparent);border-color:var(--dsw-alias-border-l4)}
.reel-add-plus{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;flex:none;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-size:18px}
.reel-add-txt{min-width:0}
.reel-add-txt h3{margin:0 0 2px;font-family:var(--reel-serif);font-size:19px;font-weight:400}
.reel-add-txt p{margin:0;color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:1.55}
.reel-add-go{margin-left:auto;font-family:var(--reel-mono);font-size:10.5px;letter-spacing:.1em;color:var(--dsw-alias-link);white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
.reel-wall-empty{grid-column:1/-1;padding:40px 0;text-align:center;color:var(--dsw-alias-label-tertiary)}
.reel-studio{display:grid;grid-template-columns:290px minmax(0,1fr) 338px;gap:20px;align-items:stretch;grid-auto-rows:minmax(0,1fr);height:calc(100% - 0px);min-height:0}
.reel-col{min-width:0;min-height:0;display:flex;flex-direction:column}
.reel-pane{display:flex;flex-direction:column;min-height:0;flex:1;overflow:hidden;border-radius:22px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 88%,transparent);border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-soft)}
.reel-pane-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:.5px solid var(--dsw-alias-border-l1);font-size:12px;font-weight:600}
.reel-pane-body{padding:14px 16px;flex:1;min-height:0;display:flex;flex-direction:column;overflow:auto;scrollbar-width:thin}
.reel-pane-foot{margin-top:auto;padding:12px 16px;border-top:.5px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:6px}
.reel-pane-foot .reel-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11px;color:var(--dsw-alias-label-tertiary)}
.reel-pane-foot .reel-row b{font-weight:500;color:var(--dsw-alias-label-secondary);font-family:var(--reel-mono);font-size:10.5px}
.reel-target{display:flex;gap:12px;align-items:center}
.reel-target-poster{width:86px;height:50px;border-radius:8px;object-fit:cover;flex:none;border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-soft)}
.reel-target-info{min-width:0}
.reel-target-info b{display:block;font-family:var(--reel-serif);font-size:19px;font-weight:400;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reel-target-info span{display:block;font-size:10px;color:var(--dsw-alias-label-tertiary);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reel-ghost{width:100%;min-height:34px;margin-top:12px;border-radius:10px;font-size:12px;color:var(--dsw-alias-label-secondary);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:background .2s,color .2s}
.reel-ghost:hover{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary)}
.reel-rule{height:.5px;background:var(--dsw-alias-border-l1);margin:14px 0}
.reel-mini-label{font-family:var(--reel-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary);margin:0 0 8px}
.reel-ask-chip{display:inline-flex;align-items:center;height:28px;padding:0 11px;margin:0 6px 6px 0;border-radius:999px;font-size:11.5px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-3) 80%,transparent);border:.5px solid var(--dsw-alias-border-l1);cursor:pointer;transition:background .2s,color .2s,transform .25s var(--reel-spring)}
.reel-ask-chip:hover{color:var(--dsw-alias-label-primary);transform:translateY(-1px);background:var(--dsw-alias-bg-layer-3)}
.reel-ask-input{display:flex;align-items:center;gap:8px;margin-top:10px;height:38px;padding:0 6px 0 12px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2)}
.reel-ask-input input{border:0;outline:0;background:none;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);flex:1;min-width:0}
.reel-ask-input input::placeholder{color:var(--dsw-alias-label-caption)}
.reel-ask-input button{width:28px;height:28px;border-radius:999px;display:grid;place-items:center;flex:none;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);border:0;cursor:pointer}
.reel-bubbles{display:flex;flex-direction:column;gap:6px;margin-top:10px;max-height:150px;overflow:auto}
.reel-bubble{display:flex;gap:7px;align-items:flex-start;font-size:11.5px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,var(--dsw-alias-bg-layer-3) 60%,transparent);border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;padding:7px 9px;animation:reel-pop .35s var(--reel-spring) both}
.reel-bubble-ok{color:var(--dsw-alias-state-success-primary);font-family:var(--reel-mono);font-size:11px;flex:none;margin-top:1px}
.reel-bubble-case{font-size:9.5px;color:var(--dsw-alias-label-tertiary)}
.reel-bubble-undo{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:10px;flex:none;background:none;border:0;cursor:pointer}
.reel-bubble-undo:hover{color:var(--dsw-alias-state-error-primary)}
.reel-recent{display:flex;flex-direction:column;gap:6px}
.reel-recent-row{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-secondary);background:none;border:0;padding:0;cursor:pointer;text-align:left}
.reel-recent-row:hover{color:var(--dsw-alias-label-primary)}
.reel-recent-thumb{width:34px;height:20px;border-radius:5px;background-size:cover;background-position:center;border:.5px solid var(--dsw-alias-border-l1);flex:none}
.reel-recent-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reel-recent-empty{font-size:11px}
.reel-dim{color:var(--dsw-alias-label-tertiary)}
.reel-mono{font-family:var(--reel-mono);font-variant-numeric:tabular-nums}
.reel-ok{color:var(--dsw-alias-state-success-primary);font-family:var(--reel-mono)}
.reel-stage{padding:22px 26px 20px;overflow:auto}
.reel-stage h1{margin:8px 0 0;font-family:var(--reel-serif);font-weight:300;font-size:clamp(30px,3.4vw,44px);line-height:1.18;letter-spacing:-.015em}
.reel-stage-tagline{margin:10px 0 0;color:var(--dsw-alias-label-secondary);font-size:13.5px;line-height:1.7;max-width:92%}
.reel-meta-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.reel-cover{position:relative;height:196px;margin:16px 2px 2px;flex:none}
.reel-cover img{position:absolute;border-radius:12px;object-fit:cover;border:.5px solid rgba(255,255,255,.28);box-shadow:0 24px 60px -20px rgba(0,0,0,.8);transition:transform .6s var(--reel-spring)}
.reel-cover img.is-a{left:0;top:10px;width:64%;height:176px;transform:rotate(-1.6deg);z-index:1}
.reel-cover img.is-b{right:0;top:0;width:41%;height:112px;transform:rotate(2.2deg);z-index:2}
.reel-cover img.is-c{right:6%;bottom:-4px;width:34%;height:94px;transform:rotate(-2.6deg);z-index:3}
.reel-cover:hover img.is-a{transform:rotate(-.6deg) translateY(-3px)}
.reel-cover:hover img.is-b{transform:rotate(1deg) translateY(-4px)}
.reel-cover:hover img.is-c{transform:rotate(-1.4deg) translateY(-3px)}
.reel-features{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px;flex:none}
.reel-features figure{margin:0;min-width:0}
.reel-features img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:9px;border:.5px solid var(--dsw-alias-border-l1);transition:transform .5s var(--reel-ease)}
.reel-features figure:hover img{transform:translateY(-2px)}
.reel-features figcaption{font-size:10px;color:var(--dsw-alias-label-tertiary);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reel-feature-skeleton{aspect-ratio:16/9;border-radius:9px}
.reel-stage-actions{display:flex;align-items:center;gap:10px;margin-top:16px;flex-wrap:wrap;flex:none}
.reel-btn{display:inline-flex;align-items:center;gap:9px;height:42px;padding:0 20px;border-radius:999px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);font-size:13.5px;font-weight:600;border:0;cursor:pointer;transition:transform .3s var(--reel-spring),box-shadow .3s,background .2s}
.reel-btn:hover:not(:disabled){transform:translateY(-2px)}
.reel-btn:disabled{opacity:.4;cursor:default;transform:none}
.reel-btn.is-stop{background:var(--dsw-alias-state-error-primary);color:#fff}
.reel-stage-actions .reel-ghost{width:auto;margin-top:0;padding:0 16px;height:42px;border-radius:999px;background:transparent}
.reel-player{margin-top:16px;max-width:430px;border-radius:18px;overflow:hidden;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);flex:none;animation:reel-rise .5s var(--reel-ease) both}
.reel-player-stage{position:relative;aspect-ratio:16/9;overflow:hidden;background:var(--dsw-alias-bg-layer-3)}
.reel-player-stage>img{width:100%;height:100%;object-fit:cover;filter:brightness(.62) saturate(.9)}
.reel-player-empty{width:100%;height:100%;background:var(--dsw-alias-bg-layer-3)}
.reel-player-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}
.reel-player-veil{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,.10),rgba(0,0,0,.46))}
.reel-player-veil span{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 16px;border-radius:999px;background:rgba(10,12,17,.55);border:.5px solid rgba(255,255,255,.24);color:#f3f5f9;font-size:11.5px;backdrop-filter:blur(12px)}
.reel-player-veil.is-busy span{color:#fff;background:color-mix(in srgb,var(--dsw-alias-state-warning-primary,#f7ad31) 38%,rgba(10,12,17,.6))}
.reel-player-foot{display:flex;align-items:center;gap:10px;padding:11px 14px;border-top:.5px solid var(--dsw-alias-border-l1);font-size:10.5px}
.reel-shots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.reel-shot{position:relative;margin:0;border-radius:11px;overflow:hidden;background:var(--dsw-alias-bg-layer-3);border:.5px solid var(--dsw-alias-border-l1);aspect-ratio:16/10}
.reel-shot img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--reel-ease)}
.reel-shot:hover img{transform:scale(1.05)}
.reel-shot-no{position:absolute;left:6px;top:6px;z-index:2;font-family:var(--reel-mono);font-size:9px;background:rgba(10,12,17,.6);color:#f3f5f9;border:.5px solid rgba(255,255,255,.2);border-radius:5px;padding:0 5px;backdrop-filter:blur(8px)}
.reel-shot figcaption{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:14px 8px 5px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.72));color:#f3f5f9;font-size:10.5px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reel-shot.is-pending::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent) 50%,transparent 70%);background-size:220% 100%;animation:reel-shimmer 1.6s linear infinite}
.reel-shot.is-develop{animation:reel-develop .55s var(--reel-ease) both}
.reel-timeline{display:flex;flex-direction:column;gap:7px;margin-top:18px;padding-top:14px;border-top:.5px solid var(--dsw-alias-border-l1)}
.reel-tl-row{display:flex;gap:10px;align-items:baseline;font-size:11px;color:var(--dsw-alias-label-secondary)}
.reel-tl-row .reel-mono{flex:none;font-size:9.5px}
.reel-out-path{font-size:9.5px;word-break:break-all;line-height:1.5}
.reel-dockbar{position:absolute;left:26px;right:26px;bottom:18px;z-index:25;display:flex;align-items:center;gap:16px;padding:10px 14px 10px 18px;border-radius:18px;border:.5px solid var(--dsw-alias-border-l2);background:var(--reel-glass2);backdrop-filter:blur(30px) saturate(160%);box-shadow:var(--dsw-elevation-prominent);animation:reel-dock-in .5s var(--reel-ease) both}
.reel-dock-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary);flex:none}
.reel-steps{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.reel-step{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 11px;border-radius:999px;font-size:11.5px;color:var(--dsw-alias-label-tertiary);border:.5px solid transparent;white-space:nowrap;font-variant-numeric:tabular-nums}
.reel-step i{width:16px;height:16px;border-radius:999px;display:grid;place-items:center;font-family:var(--reel-mono);font-size:9px;font-style:normal;border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-tertiary)}
.reel-step.is-active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.reel-step.is-active i{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);border-color:transparent}
.reel-step.is-done{color:var(--dsw-alias-label-secondary)}
.reel-step.is-done i{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent)}
.reel-bar{position:relative;flex:1;min-width:120px;height:3px;border-radius:999px;background:var(--dsw-alias-bg-layer-3);overflow:hidden}
.reel-bar i{position:absolute;inset:0;width:0;border-radius:999px;background:linear-gradient(90deg,var(--dsw-alias-link),var(--dsw-alias-state-success-primary));transition:width .35s var(--reel-ease)}
.reel-dock-meta{font-size:10.5px;flex:none;min-width:74px;text-align:right}
.reel-log{position:absolute;left:26px;right:26px;bottom:86px;z-index:24;max-height:150px;overflow:auto;margin:0;padding:10px 12px;border-radius:12px;background:var(--dsw-alias-markdown-code-block);border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font-family:var(--reel-mono);font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.reel-error{position:absolute;left:26px;right:26px;top:70px;z-index:28;padding:10px 14px;border-radius:12px;border:.5px solid var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-error-primary);font-size:12px}
.reel-modal-mask{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(5,7,11,.5);backdrop-filter:blur(8px);animation:reel-fade .25s var(--reel-ease) both}
.reel-modal{width:min(660px,100%);max-height:min(82vh,760px);display:flex;flex-direction:column;border-radius:24px;background:var(--reel-glass2);border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-prominent);backdrop-filter:blur(30px) saturate(160%);animation:reel-pop .35s var(--reel-spring) both;overflow:hidden}
.reel-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:22px 24px 14px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.reel-modal-head h2{margin:6px 0 0;font-family:var(--reel-serif);font-weight:300;font-size:26px;letter-spacing:-.01em}
.reel-modal-sub{color:var(--dsw-alias-label-tertiary);font-size:11.5px;margin-top:6px}
.reel-modal-body{padding:18px 24px;overflow:auto;display:flex;flex-direction:column;gap:14px}
.reel-guide-step{display:flex;gap:14px;align-items:flex-start;min-width:0}
.reel-guide-no{flex:none;width:26px;height:26px;border-radius:999px;display:grid;place-items:center;font-family:var(--reel-mono);font-size:11px;background:var(--dsw-alias-bg-layer-3);border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.reel-guide-step.is-now .reel-guide-no{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);border-color:transparent}
.reel-guide-step>div{min-width:0;flex:1}
.reel-guide-title{font-size:13px;font-weight:600;margin-bottom:3px}
.reel-guide-body{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.7;white-space:normal;overflow-wrap:anywhere}
.reel-modal-note{border-radius:12px;border:.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-layer-3) 55%,transparent);padding:12px 14px;font-size:11.5px;color:var(--dsw-alias-label-secondary);line-height:1.75}
.reel-modal-foot{display:flex;align-items:center;gap:10px;padding:14px 24px 18px;border-top:.5px solid var(--dsw-alias-border-l1)}
.reel-modal-foot .reel-btn{height:36px;padding:0 16px;font-size:12.5px}
.reel-toast{position:fixed;left:50%;bottom:96px;transform:translate(-50%,12px);z-index:60;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border-radius:999px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);font-size:12px;opacity:0;pointer-events:none;transition:opacity .25s,transform .35s var(--reel-spring);box-shadow:var(--dsw-elevation-prominent);animation:reel-toast-in .35s var(--reel-spring) both}
.reel-skeleton{background:linear-gradient(100deg,color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent) 30%,color-mix(in srgb,var(--dsw-alias-label-primary) 14%,transparent) 50%,color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent) 70%);background-size:220% 100%;animation:reel-shimmer 1.6s linear infinite}
@keyframes reel-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes reel-pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes reel-fade{from{opacity:0}to{opacity:1}}
@keyframes reel-develop{from{opacity:.2;filter:blur(10px) brightness(.55);transform:scale(1.03)}to{opacity:1;filter:none;transform:none}}
@keyframes reel-shimmer{0%{background-position:200% 0}100%{background-position:-120% 0}}
@keyframes reel-dock-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes reel-toast-in{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes reel-pulse-dot{0%,100%{opacity:1}50%{opacity:.35}}
@media (max-width:1180px){.reel-studio{grid-template-columns:260px minmax(0,1fr)}.reel-studio>.reel-col:last-child{grid-column:1/-1;order:3;min-height:320px}.reel-shots{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:900px){.reel-wall{grid-template-columns:1fr}.reel-studio{grid-template-columns:1fr;height:auto;grid-auto-rows:minmax(0,auto)}.reel-studio>.reel-col:last-child{grid-column:auto}.reel-hero-stats{display:none}.reel-topbar{padding:12px 16px 0}.reel-view{padding:64px 16px 30px}.reel-view-studio{overflow:auto;padding-bottom:150px}.reel-stage{overflow:visible}.reel-pane-body{overflow:visible}.reel-dockbar{left:16px;right:16px;bottom:12px;flex-wrap:wrap}.reel-log,.reel-error{left:16px;right:16px}}
`;
