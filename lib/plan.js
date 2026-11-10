// Storyboard planning shared by the agent tool and the studio panel.
//
// One deterministic derivation from a case JSON: six scenes in reel order
// (hook / problem / solution / features / how-to / proof), each carrying the copy
// and the screenshot a UI needs to draw a storyboard card. Pure data, no I/O.

const imageOf = (value) => (typeof value === 'string' && value ? value : undefined);

/**
 * @param {object} caseData parsed case JSON
 * @param {string} [brief] user requirement shown on the hook card
 * @returns {{plugin: object, brief: string, scenes: object[]}}
 */
export function buildStoryboard(caseData, brief) {
  const data = caseData && typeof caseData === 'object' ? caseData : {};
  const plugin = data.plugin ?? {};
  const promo = data.promo ?? {};
  const features = Array.isArray(data.features) ? data.features : [];
  const name = String(plugin.name ?? plugin.cardTitle ?? '演示插件');
  const requirement = String(brief ?? '').trim() || String(promo.hook?.sub ?? plugin.tagline ?? '');

  const scenes = [
    {
      id: 'hook',
      no: '01',
      label: '开场',
      title: [promo.hook?.line1, promo.hook?.line2].filter(Boolean).join('') || name,
      text: requirement,
      image: imageOf(promo.hook?.bg) ?? imageOf(promo.solution?.img) ?? imageOf(features[0]?.img),
      kicker: promo.hook?.kicker,
    },
    {
      id: 'problem',
      no: '02',
      label: '问题',
      title: String(promo.problemScene?.title ?? promo.problem ?? '为什么需要它'),
      text: String(promo.problemScene?.sub ?? ''),
      chips: Array.isArray(promo.problemScene?.chips) ? promo.problemScene.chips.map(String) : [],
    },
    {
      id: 'solution',
      no: '03',
      label: '一句话方案',
      title: String(promo.solution?.title ?? name).replace(/\n/g, ' '),
      text: String(promo.solution?.sub ?? promo.what ?? ''),
      points: Array.isArray(promo.solution?.points) ? promo.solution.points.map(String) : [],
      image: imageOf(promo.solution?.img),
    },
    ...features.map((feature, index) => ({
      id: 'feature-' + String(feature?.no ?? index + 1),
      no: '04',
      label: '功能 ' + String(feature?.no ?? index + 1),
      title: String(feature?.title ?? ''),
      text: String(feature?.desc ?? ''),
      image: imageOf(feature?.img),
      accent: typeof feature?.accent === 'string' ? feature.accent : undefined,
    })),
    {
      id: 'howto',
      no: '05',
      label: '怎么用',
      title: String(promo.howto?.title ?? '三步用起来'),
      steps: Array.isArray(promo.howto?.steps)
        ? promo.howto.steps.map((step) => ({
            title: String(step?.title ?? ''),
            desc: String(step?.desc ?? ''),
            cmd: typeof step?.cmd === 'string' ? step.cmd : '',
          }))
        : [],
    },
    {
      id: 'proof',
      no: '06',
      label: '数据与片尾',
      title: String(promo.proof?.title ?? ''),
      stats: Array.isArray(promo.proof?.stats)
        ? promo.proof.stats.map((stat) => ({num: String(stat?.num ?? ''), label: String(stat?.label ?? '')}))
        : [],
      text: String(promo.proof?.note ?? ''),
      image: imageOf(promo.outroLogo),
    },
  ];

  // Tool outputs must be lossless JSON: drop undefined-valued keys produced by
  // optional case fields before handing the plan to a caller.
  const plan = {
    plugin: {
      name,
      handle: String(plugin.handle ?? ''),
      version: String(plugin.version ?? ''),
      repo: String(plugin.repo ?? ''),
      tagline: String(plugin.tagline ?? ''),
    },
    brief: requirement,
    scenes,
  };
  return JSON.parse(JSON.stringify(plan));
}

export default buildStoryboard;
