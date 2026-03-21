/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const roots = ['src', 'App.js', 'index.js', 'app.json', 'package.json', 'README.md'];
const allowedExtensions = new Set(['.js', '.json', '.md']);
const issues = [];
const warnings = [];
const mojibakePattern = /(Ã.|Â.|â.|ðŸ|�)/;
const ignoreMojibakeWarningsFor = new Set(['src\\utils\\i18n.js', 'src\\utils\\textSanitizer.js']);

function inspectFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const content = buffer.toString('utf8');
  const relativePath = path.relative(process.cwd(), filePath);

  if (content.includes('\uFFFD')) {
    issues.push(`${relativePath}: contiene caracteres de reemplazo (�).`);
  }

  if (content.includes('`r`n')) {
    issues.push(`${relativePath}: contiene secuencias literales \`r\`n.`);
  }

  if (content.includes('\0')) {
    issues.push(`${relativePath}: contiene null bytes.`);
  }

  if (mojibakePattern.test(content)) {
    if (!ignoreMojibakeWarningsFor.has(relativePath)) {
      warnings.push(`${relativePath}: posible mojibake detectado.`);
    }
  }
}

function walk(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      walk(path.join(targetPath, entry));
    }
    return;
  }

  const ext = path.extname(targetPath);
  if (allowedExtensions.has(ext)) {
    inspectFile(targetPath);
  }
}

for (const root of roots) {
  walk(path.resolve(process.cwd(), root));
}

if (issues.length > 0) {
  console.error('Encoding check failed:');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('Encoding check warnings:');
  for (const warning of warnings.slice(0, 30)) {
    console.warn(`- ${warning}`);
  }
  if (warnings.length > 30) {
    console.warn(`... y ${warnings.length - 30} avisos adicionales`);
  }

  if (process.env.STRICT_MOJIBAKE === '1') {
    process.exit(1);
  }
}

console.log('Encoding check passed.');
