import type {PageRange, ProcessedWritingLine, WritingLine} from './problemSchema';

const PAGE_TOP = 45;
const PAGE_BOTTOM = 1150;
const PAGE_GAP = 30;
const DEFAULT_LEFT = 70;
const DEFAULT_RIGHT_MARGIN = 55;
const BOARD_CONTENT_WIDTH = 900;

const estimateCharsPerLine = (size: number, maxTextWidth: number) => {
  const approxCharWidth = size * 0.95;
  return Math.max(6, Math.floor(maxTextWidth / approxCharWidth));
};

export const processWritingPlan = (writingPlan: WritingLine[]): ProcessedWritingLine[] => {
  const sorted = [...writingPlan].sort((a, b) => a.start - b.start);
  let currentPage = 1;
  let currentTop = PAGE_TOP;

  return sorted.map((line, index) => {
    const left = line.left ?? DEFAULT_LEFT;
    const maxTextWidth = line.width ?? (BOARD_CONTENT_WIDTH - left - DEFAULT_RIGHT_MARGIN);
    const lineHeight = line.size * 1.25;
    const charsPerLine = estimateCharsPerLine(line.size, maxTextWidth);
    const wrappedLineCount = Math.max(1, Math.ceil(Array.from(line.text).length / charsPerLine));
    const blockHeight = wrappedLineCount * lineHeight;

    if (typeof line.page === 'number' && line.page !== currentPage) {
      currentPage = line.page;
      currentTop = PAGE_TOP;
    }

    const requestedTop = line.top;
    const needsNewPage =
      typeof line.page !== 'number' &&
      currentTop !== PAGE_TOP &&
      currentTop + blockHeight > PAGE_BOTTOM;

    if (needsNewPage) {
      currentPage += 1;
      currentTop = PAGE_TOP;
    }

    const top = typeof requestedTop === 'number' ? requestedTop : currentTop;

    currentTop = Math.max(currentTop, top + blockHeight + PAGE_GAP);

    return {
      ...line,
      assignedPage: currentPage,
      top,
      left,
      maxTextWidth,
      lineHeight,
      charsPerLine,
      wrappedLineCount,
    } as ProcessedWritingLine;
  });
};

export const buildPageRanges = (lines: ProcessedWritingLine[], totalFrames: number): PageRange[] => {
  const grouped = new Map<number, {start: number; end: number}>();
  lines.forEach((line) => {
    const existing = grouped.get(line.assignedPage);
    const start = line.start;
    const end = line.start + line.duration;
    if (!existing) {
      grouped.set(line.assignedPage, {start, end});
      return;
    }
    existing.start = Math.min(existing.start, start);
    existing.end = Math.max(existing.end, end);
  });

  const pages = [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([page, range]) => ({page, start: range.start, end: range.end}));

  return pages.map((range, index) => ({
    page: range.page,
    start: range.start,
    end: index < pages.length - 1 ? pages[index + 1].start - 1 : totalFrames,
  }));
};

export const getCurrentPage = (frame: number, pageRanges: PageRange[]) => {
  if (pageRanges.length === 0) return 1;
  let current = pageRanges[0].page;
  for (const pageRange of pageRanges) {
    if (frame >= pageRange.start) current = pageRange.page;
  }
  return current;
};
