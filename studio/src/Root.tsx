import {Composition} from 'remotion';
import {PluginDemo} from './PluginDemo';
import {PromoCard} from './PromoCard';
import {defaultReel} from './data';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PluginDemo"
        component={PluginDemo}
        durationInFrames={975}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultReel}
      />
      <Composition
        id="PromoCard"
        component={PromoCard}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1440}
        defaultProps={defaultReel}
      />
    </>
  );
};
