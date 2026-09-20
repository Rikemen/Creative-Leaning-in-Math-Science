export const LANDSCAPE_SIZE = Object.freeze({ width: 1600, height: 900 });
const rect = (x, y, width, height) => ({ x, y, width, height });

// All DOM and canvas geometry shares these logical coordinates. The portrait
// arrangement keeps touch targets legible instead of shrinking four columns.
export function createLayout(pixelWidth) {
  if (!Number.isFinite(pixelWidth) || pixelWidth <= 0) throw new RangeError('Layout width must be positive');
  const portrait = pixelWidth < 700;
  const width = portrait ? 900 : LANDSCAPE_SIZE.width, height = portrait ? 1600 : LANDSCAPE_SIZE.height;
  const cards = Array.from({ length: 4 }, (_, i) => portrait
    ? rect(70 + (i % 2) * 410, 520 + Math.floor(i / 2) * 350, 350, 280)
    : rect(100 + i * 360, 400, 320, 240));
  return {
    width, height, scale: pixelWidth / width, portrait,
    hud: portrait ? rect(36, 10, 828, 140) : rect(40, 26, 1520, 86),
    timeTrack: portrait ? rect(36, 160, 828, 4) : rect(40, 130, 1520, 4),
    label: portrait ? rect(70, 185, 760, 40) : rect(450, 155, 700, 32),
    problem: portrait ? rect(70, 230, 760, 110) : rect(400, 190, 800, 100),
    hint: portrait ? rect(70, 345, 760, 45) : rect(400, 292, 800, 40),
    feedback: portrait ? rect(50, 405, 800, 75) : rect(200, 338, 1200, 36),
    cards,
    numbers: cards.map(c => rect(c.x + 45, c.y + 55, c.width - 90, c.height - 105)),
    avatar: portrait ? rect(202, 1000, 496, 496) : rect(552, 400, 496, 496),
    hero: portrait ? rect(280, 1370, 340, 230) : rect(630, 770, 340, 130),
    arms: portrait ? rect(180, 1300, 540, 110) : rect(530, 730, 540, 100),
    emitter: portrait ? { x: 450, y: 1372 } : { x: 800, y: 772 },
  };
}

export function beamPath(layout, index) {
  const card = layout.cards[index];
  if (!card) return [];
  const target = { x: card.x + card.width / 2, y: card.y + card.height + 14 };
  // For top-row portrait cards, travel through the central gutter, never
  // through the lower row's numbers. The final segment stays below the card.
  return layout.portrait
    ? [layout.emitter, { x: layout.emitter.x, y: target.y }, target]
    : [layout.emitter, target];
}

export function mountLayout(arena, cards) {
  let layout, lastWidth;
  const place = (element, box) => {
    if (!element) return;
    for (const [key, value] of Object.entries({ left: box.x, top: box.y, width: box.width, height: box.height })) {
      element.style[key] = `${value * layout.scale}px`;
    }
  };
  const placeCards = () => [...cards.children].forEach((card, i) => place(card, layout.cards[i]));
  const update = () => {
    if (!arena.clientWidth || arena.clientWidth === lastWidth) return;
    lastWidth = arena.clientWidth;
    layout = createLayout(lastWidth);
    arena.dataset.layout = layout.portrait ? 'portrait' : 'landscape';
    arena.style.setProperty('--layout-scale', layout.scale);
    arena.style.height = `${layout.height * layout.scale + 2}px`;
    for (const [selector, key] of [['.hud', 'hud'], ['.time-track', 'timeTrack'], ['.question-label', 'label'],
      ['#problem', 'problem'], ['#counting-hint', 'hint'], ['#feedback', 'feedback']]) place(arena.querySelector(selector), layout[key]);
    placeCards();
  };
  update();
  const observer = new ResizeObserver(update); observer.observe(arena);
  return { getLayout: () => layout, placeCards, destroy: () => observer.disconnect() };
}
