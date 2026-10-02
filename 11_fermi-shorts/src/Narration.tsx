import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import type {NarrationLine} from './problemSchema';

// `npm run audio:mac` 実行後に true にしてください。
// 音声ファイルが無い状態でもStudioが起動できるよう既定はfalseです。
export const NARRATION_ENABLED = false;

export const Narration: React.FC<{narration: NarrationLine[]}> = ({narration}) => {
  if (!NARRATION_ENABLED) return null;
  return (
    <>
      {narration.map((clip, index) => {
        const file = `${String(index + 1).padStart(2, '0')}.aiff`;
        return (
          <Sequence key={`${file}-${clip.from}`} from={clip.from}>
            <Audio src={staticFile(`audio/narration/${file}`)} volume={0.95} />
          </Sequence>
        );
      })}
    </>
  );
};
