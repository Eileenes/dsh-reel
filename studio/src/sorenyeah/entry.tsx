/**
 * Remotion entry for the Sorenyeah home film.
 *
 *   studio/node_modules/.bin/remotion render src/sorenyeah/entry.tsx SorenyeahHome \
 *     out/sorenyeah-home.mp4 --codec h264 --crf 16 --concurrency=1
 *   studio/node_modules/.bin/remotion still  src/sorenyeah/entry.tsx SorenyeahHome \
 *     out/sorenyeah-frame.png --frame=300
 */

import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {SorenyeahHome} from './HomePromo';
import {SorenyeahPoster} from './Poster';
import {VIDEO} from './tokens';

const Root: React.FC = () => (
  <>
    <Composition
      id="SorenyeahHome"
      component={SorenyeahHome}
      durationInFrames={VIDEO.totalFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="SorenyeahPoster"
      component={SorenyeahPoster}
      durationInFrames={1}
      fps={VIDEO.fps}
      width={1080}
      height={1440}
    />
  </>
);

registerRoot(Root);
