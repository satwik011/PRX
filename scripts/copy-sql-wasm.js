/**
 * sql.js loads its WASM binary at runtime. Serving it from our own origin (rather
 * than a CDN) keeps the PWA installable and fully offline once cached.
 * public/ is copied verbatim into the web build.
 */
const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const target = path.join(__dirname, '..', 'public', 'sql-wasm.wasm');

if (!fs.existsSync(source)) {
  console.log('[sql-wasm] sql.js not installed yet — skipping');
  process.exit(0);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log(`[sql-wasm] copied to public/sql-wasm.wasm (${(fs.statSync(target).size / 1024).toFixed(0)} KB)`);
