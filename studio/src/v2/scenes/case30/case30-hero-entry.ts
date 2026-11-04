/**
 * CASE30 独立预览入口：只注册开场 C1/C2 + 片尾 C7 三场（不碰主 Composition / v1）。
 * entry 是 .ts，不能写 JSX —— Root 在 HeroScenes30.tsx 的 Case30HeroRoot。
 *
 * 静帧：
 *   cd studio
 *   node_modules/.bin/remotion still src/v2/scenes/case30/case30-hero-entry.ts Case30Hero1 out/case30-hero-c1-f020.png --frame=20
 */

import {registerRoot} from 'remotion';
import {Case30HeroRoot} from './HeroScenes30';

registerRoot(Case30HeroRoot);
