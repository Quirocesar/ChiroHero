/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const I18N_PATH = path.join(ROOT, 'src', 'utils', 'i18n.js');
const SEARCH_PATHS = [path.join(ROOT, 'src'), path.join(ROOT, 'App.js')];
const FILE_EXTENSIONS = new Set(['.js']);

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function collectFiles(targetPath, result = []) {
  if (!fs.existsSync(targetPath)) return result;
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      collectFiles(path.join(targetPath, entry), result);
    }
    return result;
  }

  if (FILE_EXTENSIONS.has(path.extname(targetPath))) {
    result.push(targetPath);
  }
  return result;
}

function extractEsKeys(i18nSource) {
  const startToken = 'const translations =';
  const endToken = 'let currentLanguage';
  const start = i18nSource.indexOf(startToken);
  const end = i18nSource.indexOf(endToken);
  if (start < 0 || end < 0 || end <= start) return new Set();

  const objectLiteral = i18nSource
    .slice(start + startToken.length, end)
    .trim()
    .replace(/;\s*$/, '');

  const translations = Function(`"use strict"; return (${objectLiteral});`)();
  return new Set(Object.keys(translations?.es || {}));
}

function extractUsedTranslationKeys(fileSource) {
  const keys = [];
  const regex = /\bt\(\s*['"`]([^'"`]+)['"`]/g;
  let match = regex.exec(fileSource);
  while (match) {
    keys.push(match[1]);
    match = regex.exec(fileSource);
  }
  return keys;
}

function main() {
  const i18nSource = readFile(I18N_PATH);
  const knownKeys = extractEsKeys(i18nSource);

  if (knownKeys.size === 0) {
    console.error('i18n key check failed: no se pudieron extraer claves de es en i18n.js');
    process.exit(1);
  }

  const files = SEARCH_PATHS.flatMap((p) => collectFiles(p));
  const missing = [];
  const usedKeys = new Set();

  for (const filePath of files) {
    if (filePath === I18N_PATH) continue;
    const source = readFile(filePath);
    const usedInFile = extractUsedTranslationKeys(source);
    for (const key of usedInFile) {
      if (key.includes('${')) {
        continue;
      }
      usedKeys.add(key);
      if (!knownKeys.has(key)) {
        missing.push(`${path.relative(ROOT, filePath)} -> "${key}"`);
      }
    }
  }

  if (missing.length > 0) {
    console.error('i18n key check failed: faltan claves en traducciones base (es):');
    for (const item of missing.slice(0, 50)) {
      console.error(`- ${item}`);
    }
    if (missing.length > 50) {
      console.error(`... y ${missing.length - 50} más`);
    }
    process.exit(1);
  }

  const unused = [...knownKeys].filter((key) => !usedKeys.has(key));
  console.log(
    `i18n key check passed. used=${usedKeys.size}, defined(es)=${knownKeys.size}, unused=${unused.length}`
  );
}

main();
