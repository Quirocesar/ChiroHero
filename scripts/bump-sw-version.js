#!/usr/bin/env node
// Auto-increments CACHE_VERSION in public/sw.js before each PWA build.
// Called automatically via the prebuild:pwa npm script.
// Prerequisite: public/sw.js must already contain: const CACHE_VERSION = 'vN';

const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../public/sw.js');

if (!fs.existsSync(swPath)) {
  console.error('ERROR: public/sw.js not found');
  process.exit(1);
}

let content = fs.readFileSync(swPath, 'utf8');
const match = content.match(/const CACHE_VERSION = 'v(\d+)'/);

if (!match) {
  // CACHE_VERSION missing — insert it at the top rather than failing
  content = "const CACHE_VERSION = 'v1';\nconst CACHE_NAME = `chirohero-${CACHE_VERSION}`;\n" + content;
  fs.writeFileSync(swPath, content, 'utf8');
  console.log('CACHE_VERSION inserted at v1 (was missing)');
  process.exit(0);
}

const newVersion = parseInt(match[1], 10) + 1;
content = content.replace(
  /const CACHE_VERSION = 'v\d+'/,
  `const CACHE_VERSION = 'v${newVersion}'`
);
fs.writeFileSync(swPath, content, 'utf8');
console.log(`sw.js CACHE_VERSION bumped to v${newVersion}`);
