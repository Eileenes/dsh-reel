/**
 * P1-C 独立预览入口：只注册 P1MarketUI（市场 UI 三态）。
 * 不要改 src/index.ts / src/Root.tsx（v1 入口），也不要和 v2 主 Composition 混用。
 *
 * 渲染：
 *   cd studio
 *   node_modules/.bin/remotion still src/p1m/entry.ts P1MarketUI out/p1m-f0040.png --frame=40
 */

import {registerRoot} from 'remotion';
import {P1MarketRoot} from './P1MarketUI';

registerRoot(P1MarketRoot);
