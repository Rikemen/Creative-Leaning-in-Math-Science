/** 入力元を1本に限定。画面イベントとゲーム判定の境界。 */
export class PointerInput {
  constructor(game) { this.game = game; this.active = null; }
  down(id, index, now, button = 0) {
    if (button !== 0 || this.active !== null || !Number.isInteger(index)) return;
    this.active = id;
    this.game.press(index, now);
  }
  move(id, index, now) { if (this.active === id) this.game.move(index, now); }
  up(id, now) { if (this.active === id) this.cancel(now); }
  cancel(now) {
    if (this.active !== null) this.game.release(now);
    this.active = null;
  }
}

export function bindPointerInput(container, game, enabled = () => true) {
  const input = new PointerInput(game);
  const cardIndex = element => {
    const card = element?.closest('[data-choice]');
    return card && container.contains(card) ? Number(card.dataset.choice) : null;
  };
  container.addEventListener('pointerdown', event => {
    if (!enabled()) return;
    const index = cardIndex(event.target);
    if (index === null || event.button !== 0) return;
    event.preventDefault();
    event.target.closest('[data-choice]').focus({ preventScroll: true });
    input.down(event.pointerId, index, performance.now(), event.button);
    if (input.active === event.pointerId) container.setPointerCapture(event.pointerId);
  });
  container.addEventListener('pointermove', event => {
    input.move(event.pointerId, cardIndex(document.elementFromPoint(event.clientX, event.clientY)), performance.now());
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    container.addEventListener(name, event => input.up(event.pointerId, performance.now()));
  }
  container.addEventListener('keydown', event => {
    if (!enabled()) return;
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (!event.repeat) input.down('keyboard', cardIndex(event.target), performance.now());
  });
  container.addEventListener('keyup', event => {
    if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); input.up('keyboard', performance.now()); }
  });
  container.addEventListener('focusout', () => input.up('keyboard', performance.now()));
  return input;
}
