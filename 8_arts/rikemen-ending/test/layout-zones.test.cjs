'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const timeline = require('../timeline-utils.js');

test('YouTube zones are 16:9, inside the safe area, and non-overlapping', () => {
  const safeX = timeline.CANVAS_WIDTH * 0.05;
  const safeY = timeline.CANVAS_HEIGHT * 0.05;
  const zones = Object.values(timeline.END_SCREEN_ZONES).map(timeline.getZoneBounds);
  const { leftVideo, rightVideo } = timeline.END_SCREEN_ZONES;

  assert.equal(leftVideo.width / leftVideo.height, 16 / 9);
  assert.equal(rightVideo.width / rightVideo.height, 16 / 9);
  zones.forEach((zone) => {
    assert.ok(zone.x >= safeX);
    assert.ok(zone.y >= safeY);
    assert.ok(zone.x + zone.width <= timeline.CANVAS_WIDTH - safeX);
    assert.ok(zone.y + zone.height <= timeline.CANVAS_HEIGHT - safeY);
  });
  zones.forEach((zone, index) => {
    zones.slice(index + 1).forEach((other) => {
      assert.equal(timeline.rectsIntersect(zone, other), false);
    });
  });
});

test('all ten source illustrations and both Japanese fonts exist', () => {
  assert.equal(timeline.CHARACTERS.length, 10);
  timeline.CHARACTERS.forEach((character) => {
    assert.equal(fs.existsSync(path.resolve(__dirname, '..', character.file)), true);
  });
  assert.equal(
    fs.existsSync(
      path.resolve(
        __dirname,
        '../../../2_calculus/2_1_空間曲線の接線と法平面/assets/fonts/Rampart_One/RampartOne-Regular.ttf',
      ),
    ),
    true,
  );
  assert.equal(
    fs.existsSync(
      path.resolve(
        __dirname,
        '../../../2_calculus/2_1_空間曲線の接線と法平面/assets/fonts/Noto_Sans_JP/static/NotoSansJP-Regular.ttf',
      ),
    ),
    true,
  );
});

test('characters remain in the safe area and outside YouTube zones during the hold', () => {
  const safeX = timeline.CANVAS_WIDTH * 0.05;
  const safeY = timeline.CANVAS_HEIGHT * 0.05;
  const zones = Object.values(timeline.END_SCREEN_ZONES).map(timeline.getZoneBounds);

  for (let frame = 330; frame < timeline.TOTAL_FRAMES; frame += 1) {
    timeline.CHARACTERS.forEach((_character, index) => {
      const bounds = timeline.getCharacterBounds(index, frame);
      assert.ok(bounds.x >= safeX);
      assert.ok(bounds.y >= safeY);
      assert.ok(bounds.x + bounds.width <= timeline.CANVAS_WIDTH - safeX);
      assert.ok(bounds.y + bounds.height <= timeline.CANVAS_HEIGHT - safeY);
      zones.forEach((zone) => assert.equal(timeline.rectsIntersect(bounds, zone), false));
    });
  }
});

test('hold motion stays gentle and visible decorations avoid reserved zones', () => {
  timeline.CHARACTERS.forEach((character, index) => {
    for (let frame = 330; frame <= 809; frame += 24) {
      const state = timeline.getCharacterState(index, frame);
      assert.ok(Math.abs(state.y - character.y) <= 2.51);
    }
  });
  timeline.createDecorations(80, 100).forEach((decoration) => {
    [330, 540, 809, 899].forEach((frame) => {
      const state = timeline.getDecorationState(decoration, frame);
      if (state.visible) {
        assert.equal(timeline.isPointReserved(state.x, state.y, state.size + 12), false);
      }
    });
  });
});
