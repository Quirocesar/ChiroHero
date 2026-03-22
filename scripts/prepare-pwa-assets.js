const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const copies = [
  {
    from: path.join(projectRoot, 'public', 'manifest.json'),
    to: path.join(distDir, 'manifest.json'),
  },
  { from: path.join(projectRoot, 'public', 'sw.js'), to: path.join(distDir, 'sw.js') },
  { from: path.join(projectRoot, 'assets', 'icon.png'), to: path.join(distDir, 'icon-192.png') },
  { from: path.join(projectRoot, 'assets', 'icon.png'), to: path.join(distDir, 'icon-512.png') },
];

if (!fs.existsSync(distDir)) {
  console.error('dist folder not found. Run `expo export --platform web` first.');
  process.exit(1);
}

let missing = false;
for (const file of copies) {
  if (!fs.existsSync(file.from)) {
    console.error(`Missing required file: ${file.from}`);
    missing = true;
  }
}

if (missing) {
  process.exit(1);
}

for (const file of copies) {
  fs.copyFileSync(file.from, file.to);
}

console.log('PWA static assets copied to dist/');
