import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {ProofMini} from '../scenes/proof/MiniWhaleProof';

export const ProofMiniComp: React.FC = () => (
  <AbsoluteFill>
    <ProofMini />
    <Audio src={staticFile('audio/v2/preview-mix-proof.mp3')} />
  </AbsoluteFill>
);
