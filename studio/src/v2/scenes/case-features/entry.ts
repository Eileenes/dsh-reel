/**
 * CASE-2 独立预览入口：只注册 CaseFeat6/7/8/9 四场（不碰主 Composition / v1）。
 * entry 是 .ts，不能写 JSX —— Root 组件放在 CaseFeatureScenes.tsx 里。
 *
 * 静帧：
 *   cd studio
 *   node_modules/.bin/remotion still src/v2/scenes/case-features/entry.ts CaseFeat6 out/case-feat-c6-f10.png --frame=10
 */

import {registerRoot} from 'remotion';
import {CaseFeatRoot} from './CaseFeatureScenes';

registerRoot(CaseFeatRoot);
