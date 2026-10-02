import React from 'react';
import {Composition} from 'remotion';
import {FermiVideo} from './FermiVideo';
import {currentProblem} from './problems';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FermiTemplate"
        component={() => <FermiVideo problem={currentProblem} />}
        durationInFrames={currentProblem.totalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
