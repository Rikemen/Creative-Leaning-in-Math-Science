'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('preview page exposes playback, recording, seeking, and guide controls', () => {
  const indexPath = path.join(root, 'index.html');
  assert.equal(fs.existsSync(indexPath), true);
  const html = fs.readFileSync(indexPath, 'utf8');
  ['canvasHost', 'frameSlider', 'frameOutput', 'replayButton', 'recordButton', 'statusText', 'guideToggle'].forEach(
    (id) => assert.match(html, new RegExp(`id=["']${id}["']`)),
  );
  assert.match(html, /max="899"/);
  assert.match(html, /\.\.\/rikemen-opening\/recorder\.js/);
});

test('README documents fifteen-second H.264/AAC export and three YouTube elements', () => {
  const readmePath = path.join(root, 'README.md');
  assert.equal(fs.existsSync(readmePath), true);
  const readme = fs.readFileSync(readmePath, 'utf8');
  ['15秒', '60fps', 'libx264', 'AAC', 'おすすめ', 'つぎに見る', 'チャンネル登録'].forEach(
    (term) => assert.match(readme, new RegExp(term, 'i')),
  );
});
