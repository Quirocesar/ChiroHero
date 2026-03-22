const MOJIBAKE_REPLACEMENTS = [
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã', 'Á'],
  ['Ã‰', 'É'],
  ['Ã', 'Í'],
  ['Ã“', 'Ó'],
  ['Ãš', 'Ú'],
  ['Ã±', 'ñ'],
  ['Ã‘', 'Ñ'],
  ['Ã¼', 'ü'],
  ['Ãœ', 'Ü'],
  ['Â¡', '¡'],
  ['Â¿', '¿'],
  ['â€™', "'"],
  ['â€œ', '"'],
  ['â€', '"'],
  ['â€”', '-'],
  ['â€“', '-'],
  ['â€¦', '...'],
  ['âœ…', '✓'],
  ['âŒ', '✗'],
  ['âš ï¸', '⚠️'],
  ['ðŸŽ¾', '🎾'],
  ['ðŸŽ¬', '🎬'],
  ['ðŸŽ¤', '🎤'],
  ['ðŸƒ', '🏃'],
  ['ðŸŽï¸', '🏎️'],
  ['ðŸ“–', '📖'],
  ['âš½', '⚽'],
  ['â›³', '⛳'],
];

export function normalizeDisplayText(text) {
  if (typeof text !== 'string') return text;

  let normalized = text;
  for (const [broken, fixed] of MOJIBAKE_REPLACEMENTS) {
    if (normalized.includes(broken)) {
      normalized = normalized.split(broken).join(fixed);
    }
  }
  return normalized;
}

export function normalizeDeepText(value) {
  if (typeof value === 'string') {
    return normalizeDisplayText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDeepText(item));
  }

  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = normalizeDeepText(item);
    }
    return out;
  }

  return value;
}

export default {
  normalizeDisplayText,
  normalizeDeepText,
};
