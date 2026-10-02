import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];

if (!slug) {
  console.error('Usage: npm run select:problem -- <slug>');
  process.exit(1);
}

const source = path.join(root, 'src', 'problems', `${slug}.json`);
const target = path.join(root, 'src', 'problems', 'current-problem.json');

if (!fs.existsSync(source)) {
  console.error(`Problem not found: src/problems/${slug}.json`);
  process.exit(1);
}

const parsed = JSON.parse(fs.readFileSync(source, 'utf8'));
if (!parsed.slug || !parsed.title || !Array.isArray(parsed.writingPlan) || !Array.isArray(parsed.captions) || !Array.isArray(parsed.narration)) {
  console.error(`Invalid problem JSON: ${source}`);
  process.exit(1);
}

fs.copyFileSync(source, target);
console.log(`Selected problem: ${parsed.slug} — ${parsed.title}`);
