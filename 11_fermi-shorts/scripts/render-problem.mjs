import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run render:problem -- <slug>');
  process.exit(1);
}

let r = spawnSync(process.execPath, [path.join(root, 'scripts', 'select-problem.mjs'), slug], {cwd: root, stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);

const current = JSON.parse(fs.readFileSync(path.join(root, 'src', 'problems', 'current-problem.json'), 'utf8'));
fs.mkdirSync(path.join(root, 'out'), {recursive: true});
const out = path.join('out', `${current.slug}.mp4`);

r = spawnSync('npx', ['remotion', 'render', 'src/index.ts', 'FermiTemplate', out], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(r.status ?? 1);
