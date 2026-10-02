export type WritingLine = {
  text: string;
  start: number;
  duration: number;
  top?: number;
  left?: number;
  size: number;
  emphasis?: boolean;
  width?: number;
  color?: string;
  page?: number;
};

export type CaptionLine = {
  text: string;
  start: number;
  end: number;
};

export type NarrationLine = {
  from: number;
  text: string;
};

export type FermiProblem = {
  slug: string;
  title: string;
  shortLabel?: string;
  totalFrames: number;
  writingPlan: WritingLine[];
  captions: CaptionLine[];
  narration: NarrationLine[];
  reactionDelayFrames?: number;
};

export type ProcessedWritingLine = WritingLine & {
  assignedPage: number;
  top: number;
  left: number;
  maxTextWidth: number;
  lineHeight: number;
  charsPerLine: number;
  wrappedLineCount: number;
};

export type PageRange = {
  page: number;
  start: number;
  end: number;
};
