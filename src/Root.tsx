import React from 'react';
import {Composition} from 'remotion';
import {AvicennaSinusNodeReel} from './compositions/AvicennaSinusNodeReel';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './data/timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AvicennaSinusNodeReel"
        component={AvicennaSinusNodeReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
