import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {ProofStory30} from '../scenes/proof/MiniWhaleStory';

export const ProofStory30Comp: React.FC = () => (
  <AbsoluteFill>
    <ProofStory30 />
    <Audio src={staticFile('audio/v2/preview-mix-proof30.mp3')} />
  </AbsoluteFill>
);
