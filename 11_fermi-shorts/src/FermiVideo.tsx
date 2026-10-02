import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import type {FermiProblem, PageRange, ProcessedWritingLine} from './problemSchema';
import {Narration} from './Narration';
import {buildPageRanges, getCurrentPage, processWritingPlan} from './layout';

const marker = '#242424';
const yellow = '#f4d84b';
const blue = '#50b5d4';

const BOARD_X = 55;
const BOARD_Y = 150;

const Handwrite: React.FC<{line: ProcessedWritingLine}> = ({line}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [line.start, line.start + line.duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });
  const chars = Array.from(line.text);
  const visibleChars = Math.ceil(chars.length * p);
  return (
    <div
      style={{
        position: 'absolute',
        top: line.top,
        left: line.left,
        maxWidth: line.maxTextWidth,
        fontSize: line.size,
        lineHeight: 1.25,
        fontWeight: line.emphasis ? 900 : 700,
        color: line.color ?? (line.emphasis ? '#c84034' : marker),
        letterSpacing: 1,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: '"Noto Sans CJK JP", "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif',
      }}
    >
      {chars.map((c, i) => (
        <span key={`${line.text}-${i}`} style={{opacity: i < visibleChars ? 1 : 0}}>
          {c}
        </span>
      ))}
    </div>
  );
};

const WriterCharacter: React.FC<{writingPlan: ProcessedWritingLine[]}> = ({writingPlan}) => {
  const frame = useCurrentFrame();
  const active = writingPlan.find((l) => frame >= l.start && frame <= l.start + l.duration);
  if (!active) return null;

  const p = interpolate(frame, [active.start, active.start + active.duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const totalChars = Array.from(active.text).length;
  const visibleChars = Math.max(1, Math.ceil(totalChars * p));
  const row = Math.min(active.wrappedLineCount - 1, Math.floor((visibleChars - 1) / active.charsPerLine));
  const indexInRow = (visibleChars - 1) % active.charsPerLine;
  const targetX = BOARD_X + active.left + 18 + Math.min(active.maxTextWidth - 20, indexInRow * active.size * 0.95);
  const targetY = BOARD_Y + active.top + row * active.lineHeight + active.size * 0.62;
  const width = 500;
  const penTipX = 118;
  const penTipY = 93;
  const left = targetX - penTipX;
  const top = targetY - penTipY;
  const toggle = Math.floor(frame / 5) % 2 === 0;
  const bounce = Math.sin(frame * 0.9) * 2.2;
  return (
    <Img
      src={staticFile(toggle ? 'characters/writing-a.png' : 'characters/writing-b.png')}
      style={{position: 'absolute', width, left, top: top + bounce, objectFit: 'contain', zIndex: 8}}
    />
  );
};

const Character: React.FC<{src: string; scale?: number; x?: number; y?: number; bob?: boolean}> = ({
  src,
  scale = 1,
  x = 0,
  y = 0,
  bob = false,
}) => {
  const frame = useCurrentFrame();
  const dy = bob ? Math.sin(frame / 9) * 5 : 0;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        width: 520 * scale,
        right: -50 + x,
        bottom: 30 + y + dy,
        objectFit: 'contain',
        zIndex: 7,
      }}
    />
  );
};

const Whiteboard: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 35,
      top: 130,
      width: 940,
      height: 1280,
      background: '#fffef8',
      border: '16px solid #d8d8d8',
      borderRadius: 32,
      boxShadow: '0 18px 50px rgba(0,0,0,.16)',
    }}
  >
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 30, height: 12, background: '#c7c7c7', borderRadius: 8}} />
    <div style={{position: 'absolute', left: 110, bottom: 16, width: 95, height: 20, background: '#444', borderRadius: 6}} />
    <div style={{position: 'absolute', left: 220, bottom: 16, width: 95, height: 20, background: blue, borderRadius: 6}} />
  </div>
);

const BoardContent: React.FC<{writingPlan: ProcessedWritingLine[]; pageRanges: PageRange[]}> = ({writingPlan, pageRanges}) => {
  const frame = useCurrentFrame();
  const currentPage = getCurrentPage(frame, pageRanges);
  const pageFrames = pageRanges.find((range) => range.page === currentPage);
  const pageOpacity = pageFrames
    ? interpolate(frame, [pageFrames.start, pageFrames.start + 6], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div style={{position: 'absolute', left: BOARD_X, top: BOARD_Y, width: 900, height: 1240, zIndex: 5, opacity: pageOpacity}}>
      {writingPlan
        .filter((line) => line.assignedPage === currentPage)
        .map((line) => (
          <Handwrite key={`${line.text}-${line.start}`} line={line} />
        ))}
    </div>
  );
};

const PageBadge: React.FC<{pageRanges: PageRange[]}> = ({pageRanges}) => {
  const frame = useCurrentFrame();
  const currentPage = getCurrentPage(frame, pageRanges);
  return (
    <div
      style={{
        position: 'absolute',
        left: 770,
        top: 145,
        padding: '10px 18px',
        background: 'rgba(80, 181, 212, 0.14)',
        borderRadius: 999,
        border: '2px solid rgba(80, 181, 212, 0.35)',
        fontSize: 26,
        fontWeight: 800,
        color: '#2b6c83',
        zIndex: 6,
        fontFamily: 'sans-serif',
      }}
    >
      {currentPage} / {pageRanges.length}
    </div>
  );
};

const Caption: React.FC<{text: string; start: number; end: number}> = ({text, start, end}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 6, end - 6, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 70,
        background: 'rgba(0,0,0,.80)',
        color: 'white',
        padding: '24px 32px',
        borderRadius: 24,
        fontSize: 42,
        fontWeight: 800,
        textAlign: 'center',
        opacity,
        fontFamily: 'sans-serif',
        zIndex: 20,
      }}
    >
      {text}
    </div>
  );
};

const Sfx: React.FC<{
  problem: FermiProblem;
  writingPlan: ProcessedWritingLine[];
  pageRanges: PageRange[];
  reactionStart: number;
}> = ({
  problem,
  writingPlan,
  pageRanges,
  reactionStart,
}) => {
  const firstWritingStart = writingPlan[0]?.start ?? 90;
  const dingStart = Math.min(problem.totalFrames - 24, reactionStart + 60);
  const pageTurnFrames = pageRanges.slice(1).map((range) => Math.max(0, range.start - 12));

  return (
    <>
      {writingPlan.map((line) => (
        <Sequence key={`sfx-${line.text}-${line.start}`} from={line.start} durationInFrames={line.duration}>
          <Audio src={staticFile('audio/marker.wav')} loop volume={0.22} />
        </Sequence>
      ))}
      <Sequence from={Math.max(0, firstWritingStart - 15)} durationInFrames={12}>
        <Audio src={staticFile('audio/whoosh.wav')} volume={0.28} />
      </Sequence>
      {pageTurnFrames.map((from, index) => (
        <Sequence key={`page-turn-${index}`} from={from} durationInFrames={12}>
          <Audio src={staticFile('audio/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
      <Sequence from={Math.max(0, reactionStart - 15)} durationInFrames={12}>
        <Audio src={staticFile('audio/pop.wav')} volume={0.35} />
      </Sequence>
      <Sequence from={dingStart} durationInFrames={24}>
        <Audio src={staticFile('audio/ding.wav')} volume={0.45} />
      </Sequence>
    </>
  );
};

export const FermiVideo: React.FC<{problem: FermiProblem}> = ({problem}) => {
  const frame = useCurrentFrame();
  const introScale = interpolate(frame, [0, 18], [0.92, 1], {extrapolateRight: 'clamp'});
  const processedWritingPlan = React.useMemo(() => processWritingPlan(problem.writingPlan), [problem.writingPlan]);
  const pageRanges = React.useMemo(() => buildPageRanges(processedWritingPlan, problem.totalFrames), [processedWritingPlan, problem.totalFrames]);
  const firstWritingStart = processedWritingPlan[0]?.start ?? 90;
  const lastWritingEnd = processedWritingPlan.reduce(
    (latest, line) => Math.max(latest, line.start + line.duration),
    0,
  );
  const reactionDelay = Math.max(0, problem.reactionDelayFrames ?? 0);
  const reactionStart = lastWritingEnd + 1 + reactionDelay;
  const thinkingStart = Math.max(30, firstWritingStart - 57);
  const pageCount = pageRanges.length;

  return (
    <AbsoluteFill style={{background: '#fff6cc', overflow: 'hidden'}}>
      <Sfx
        problem={problem}
        writingPlan={processedWritingPlan}
        pageRanges={pageRanges}
        reactionStart={reactionStart}
      />
      <Narration narration={problem.narration} />
      <div style={{position: 'absolute', top: 28, left: 42, fontSize: 42, fontWeight: 900, color: '#665500', fontFamily: 'sans-serif'}}>
        30秒フェルミ推定
      </div>
      <Whiteboard />
      <BoardContent writingPlan={processedWritingPlan} pageRanges={pageRanges} />
      {pageCount > 1 ? <PageBadge pageRanges={pageRanges} /> : null}

      <Sequence from={0} durationInFrames={thinkingStart}>
        <div style={{transform: `scale(${introScale})`, transformOrigin: 'bottom right'}}>
          <Character src="characters/normal.png" scale={0.95} x={10} bob />
        </div>
      </Sequence>
      <Sequence from={thinkingStart} durationInFrames={Math.max(20, firstWritingStart - thinkingStart)}>
        <Character src="characters/thinking.png" scale={0.95} x={5} bob />
      </Sequence>
      <WriterCharacter writingPlan={processedWritingPlan} />
      <Sequence from={reactionStart} durationInFrames={Math.max(1, problem.totalFrames - reactionStart)}>
        <Character src="characters/surprised.png" scale={1.02} x={-5} bob />
      </Sequence>

      {problem.captions.map((caption) => (
        <Caption key={`${caption.text}-${caption.start}`} {...caption} />
      ))}

      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 40,
          width: 160,
          height: 160,
          borderRadius: 80,
          background: yellow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 42,
          color: '#4b3d00',
          zIndex: 30,
        }}
      >
        {problem.shortLabel ?? 'Aru'}
      </div>
    </AbsoluteFill>
  );
};
