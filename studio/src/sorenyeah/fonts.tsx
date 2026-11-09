/**
 * Loads the site's self-hosted fonts (DM Sans 400/500/600) into the Remotion page before
 * any frame is captured. Chinese falls back to the system PingFang SC stack, the same way
 * sorenyeah.com renders it on macOS.
 */

import React, {useEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const FACES: Array<{weight: string; file: string}> = [
  {weight: '400', file: 'sorenyeah/fonts/dm-sans-400.ttf'},
  {weight: '500', file: 'sorenyeah/fonts/dm-sans-500.ttf'},
  {weight: '600', file: 'sorenyeah/fonts/dm-sans-600.ttf'},
];

let started = false;

export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [ready, setReady] = useState(false);
  const handle = useRef<number | null>(null);

  useEffect(() => {
    if (handle.current === null) handle.current = delayRender('loading sorenyeah fonts');
    if (started) {
      setReady(true);
      return;
    }
    started = true;
    const load = async () => {
      try {
        await Promise.all(
          FACES.map(async ({weight, file}) => {
            const face = new FontFace('DM Sans', `url(${staticFile(file)}) format('truetype')`, {
              weight,
              style: 'normal',
            });
            await face.load();
            // TS 5.6 lib.dom 把 FontFaceSet 声明成只继承 EventTarget，缺 Set.add；
            // 浏览器里它确实是 FontFace 集合，这里按运行时语义收窄。
            (document.fonts as unknown as Set<FontFace>).add(face);
          }),
        );
        await document.fonts.ready;
      } catch (err) {
        // A missing face must not block the render: PingFang / the fallback stack still works.
        console.warn('font load failed', err);
      }
      setReady(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (ready && handle.current !== null) {
      continueRender(handle.current);
      handle.current = null;
    }
  }, [ready]);

  return <>{children}</>;
};
