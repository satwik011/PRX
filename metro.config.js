const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle ships migrations as .sql files that get inlined at build time.
config.resolver.sourceExts.push('sql');

// sql.js loads its SQLite build as WASM on web.
config.resolver.assetExts.push('wasm');

// NOTE: no COOP/COEP headers here on purpose.
//
// expo-sqlite's web build needs SharedArrayBuffer, which requires the page to be
// cross-origin isolated — headers on the dev server AND the host, no cross-origin
// assets ever, and a `credentialless` COEP that Safari does not support. Since iOS
// Safari is the delivery target, that chain was too fragile to build on.
//
// sql.js is single-threaded WASM and needs none of it. See src/db/client.web.ts.

// withUniwindConfig MUST be the outermost wrapper.
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
