/**
 * P1-A 独立预览入口：只注册 P1WhaleProof 一个 Composition。
 * 不要动 src/index.ts / src/Root.tsx（v1 入口），也不要和 v2 主 Composition 混用。
 *
 * 渲染（本机 M4 / Chrome 156 必须带 --gl=angle，否则 WebGL context 创建失败）：
 *   cd studio
 *   node_modules/.bin/remotion still src/p1/entry.ts P1WhaleProof out/p1-whale-f0060.png --frame=60 --gl=angle
 *   node_modules/.bin/remotion render src/p1/entry.ts P1WhaleProof out/p1-whale.mp4 --codec h264 --crf 18 --gl=angle
 */

import {registerRoot} from 'remotion';
import {P1WhaleRoot} from './P1WhaleProof';

registerRoot(P1WhaleRoot);
