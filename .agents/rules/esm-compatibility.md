

# ESM Compatibility (ESモジュール互換性)

**Activation:** This rule is **ALWAYS ON** for TypeScript/JavaScript files (`**/*.{ts,js,mts,mjs}`).

## 背景

このプロジェクトは `package.json` で `"type": "module"` が設定されており、
**ESモジュール（ESM）** として動作する。CommonJS 専用の API は使用できない。

## 禁止事項

以下の CommonJS 専用グローバル変数は **ESM では未定義（ReferenceError）** になるため使用禁止：

| ❌ 禁止（CommonJS専用） | ✅ ESM での代替 |
|---|---|
| `__dirname` | `path.dirname(fileURLToPath(import.meta.url))` |
| `__filename` | `fileURLToPath(import.meta.url)` |
| `require()` | `import` / `import()` |
| `module.exports` | `export` / `export default` |
| `exports` | `export` |

## 正しい書き方

```typescript
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

## 適用範囲

- `src/` 配下のフロントエンドコード
- `scripts/` 配下のCLIスクリプト
- プロジェクトルート直下のスクリプト

すべて ESM として解決されるため、例外なくこのルールに従うこと。
