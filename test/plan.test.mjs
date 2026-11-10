// Storyboard derivation: a case JSON must always produce the six reel sections in order.
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildStoryboard} from '../lib/plan.js';

const caseData = {
  plugin: {name: 'DSH Game Studio', handle: 'dsh-game-studio', version: '0.1.0-rc.1', tagline: '一句话，把游戏放进 DSH 侧栏'},
  features: [
    {no: '01', title: '一句话生成游戏', desc: '2D / 3D 模板', img: 'shots/game-studio/banner.png'},
    {no: '02', title: '侧栏直接玩', desc: '改完自动重建', img: 'shots/game-studio/overview.png'},
  ],
  promo: {
    hook: {kicker: 'DSH PLUGIN · GAME STUDIO', line1: '一句话，', line2: '在侧栏里玩到游戏。', sub: '描述一个小游戏。', bg: 'shots/game-studio/overview.png'},
    problem: '想做个游戏，先学引擎？',
    problemScene: {title: '想做个游戏，先学引擎？', sub: '你只差一句话。', chips: ['2D', '3D 体素']},
    solution: {title: 'DSH Game\nStudio', sub: '一句话放进侧栏。', points: ['生成', '试玩'], img: 'shots/game-studio/overview.png'},
    howto: {title: '三步用起来', steps: [{title: '安装插件', desc: '装进 profile', cmd: 'dsh plugin add x'}]},
    proof: {title: '一个人也能做游戏', stats: [{num: '10', label: 'AGENT TOOLS'}], note: '装上它。'},
    outroLogo: 'shots/game-studio/logo.png',
  },
};

test('buildStoryboard keeps the six reel sections in order', () => {
  const plan = buildStoryboard(caseData, '这次重点讲侧栏试玩');
  assert.equal(plan.plugin.name, 'DSH Game Studio');
  assert.equal(plan.brief, '这次重点讲侧栏试玩');
  assert.equal(plan.scenes[0].id, 'hook');
  assert.equal(plan.scenes[0].text, '这次重点讲侧栏试玩');
  assert.equal(plan.scenes[0].image, 'shots/game-studio/overview.png');
  assert.deepEqual(plan.scenes.slice(1, 3).map((scene) => scene.id), ['problem', 'solution']);
  assert.deepEqual(plan.scenes.slice(3, 5).map((scene) => scene.id), ['feature-01', 'feature-02']);
  const last = plan.scenes.slice(-2).map((scene) => scene.id);
  assert.deepEqual(last, ['howto', 'proof']);
  assert.equal(plan.scenes.at(-1).stats[0].num, '10');
  assert.equal(plan.scenes.at(-1).image, 'shots/game-studio/logo.png');
});

test('buildStoryboard falls back to the case tagline when no brief is given', () => {
  const plan = buildStoryboard(caseData);
  assert.equal(plan.brief, '描述一个小游戏。');
  const bare = buildStoryboard({plugin: {name: 'X', tagline: 'tag'}, features: [{title: 'a'}], promo: {address: 'a/b'}});
  assert.equal(bare.brief, 'tag');
  assert.equal(bare.scenes[0].title, 'X');
});
