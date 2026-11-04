/**
 * 独立预览入口：只注册 S6/S7 两个 Montage Composition（不碰主 Composition / v1）。
 * 注意：entry 是 .ts，不能写 JSX —— Root 组件放在 MontageScenes.tsx 里。
 *
 * 渲染静帧：
 *   cd studio
 *   node_modules/.bin/remotion still src/v2/scenes/montage/entry.ts Montage6 out/montage-s6.png --frame=34
 *   node_modules/.bin/remotion still src/v2/scenes/montage/entry.ts Montage7 out/montage-s7-scan.png --frame=30
 */

import {registerRoot} from 'remotion';
import {MontageRoot} from './MontageScenes';

registerRoot(MontageRoot);
