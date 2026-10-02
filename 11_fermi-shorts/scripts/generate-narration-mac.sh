#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/audio/narration
VOICE="${VOICE:-Kyoko}"

python3 - <<'PY'
import json
from pathlib import Path
problem = json.loads(Path('src/problems/current-problem.json').read_text(encoding='utf-8'))
lines = [item['text'] for item in problem['narration']]
out = Path('public/audio/narration/_lines.txt')
out.write_text('\n'.join(lines), encoding='utf-8')
print(f"Prepared {len(lines)} narration lines for: {problem['slug']}")
PY

count=0
while IFS= read -r line || [ -n "$line" ]; do
  count=$((count+1))
  n=$(printf "%02d" "$count")
  say -v "$VOICE" -r 235 -o "public/audio/narration/${n}.aiff" "$line"
done < public/audio/narration/_lines.txt
rm -f public/audio/narration/_lines.txt
printf 'Generated narration with voice: %s\n' "$VOICE"
