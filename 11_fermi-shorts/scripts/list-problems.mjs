import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src', 'problems');
const ignored = new Set(['current-problem.json']);

for (const file of fs.readdirSync(dir).filter((x) => x.endsWith('.json') && !ignored.has(x)).sort()) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`${p.slug ?? file.replace(/\.json$/, '')}\t${p.title ?? '(no title)'}`);
  } catch {
    console.log(`${file}\t(invalid JSON)`);
  }
}
