import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run make:problem -- <slug>');
  process.exit(1);
}
if (process.platform !== 'darwin') {
  console.error('make:problem uses macOS `say` for narration. Use render:problem on non-Mac systems.');
  process.exit(1);
}

const steps = [
  [process.execPath, [path.join(root, 'scripts', 'select-problem.mjs'), slug]],
  ['bash', [path.join(root, 'scripts', 'generate-narration-mac.sh')]],
  [process.execPath, [path.join(root, 'scripts', 'render-problem.mjs'), slug]],
];

for (const [cmd, args] of steps) {
  const r = spawnSync(cmd, args, {cwd: root, stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
}
