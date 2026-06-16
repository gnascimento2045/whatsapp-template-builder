import { loadJSON } from '../utils/json-loader.js';
const patternsData = loadJSON('patterns.json');

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatches(text, patterns) {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const results = [];
  for (const p of patterns) {
    const cleaned = p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) continue;
    const escapedWords = words.map(w => escapeRegex(w));
    if (words.length === 1) {
      const regex = new RegExp(`\\b${escapedWords[0]}\\b`, 'i');
      if (regex.test(normalized)) results.push(p);
    } else {
      const wordPattern = escapedWords.map((w, i) =>
        i === 0 ? `\\b${w}\\b` : `(?:\\s+[^\\s]+)*?\\s+\\b${w}\\b`
      ).join('');
      const regex = new RegExp(wordPattern, 'i');
      if (regex.test(normalized)) results.push(p);
    }
  }
  return results;
}

export function detectMarketingIndicators(text) {
  const categories = patternsData.marketing;
  const found = [];
  for (const [key, cat] of Object.entries(categories)) {
    const matches = findMatches(text, cat.patterns);
    if (matches.length > 0) {
      found.push({
        category: key,
        label: cat.label,
        weight: cat.weight,
        matches,
        count: matches.length
      });
    }
  }
  return found;
}

export function detectUtilityIndicators(text) {
  const categories = patternsData.utility;
  const found = [];
  for (const [key, cat] of Object.entries(categories)) {
    const matches = findMatches(text, cat.patterns);
    if (matches.length > 0) {
      found.push({
        category: key,
        label: cat.label,
        weight: cat.weight,
        matches,
        count: matches.length
      });
    }
  }
  return found;
}

export function hasForbiddenInUtility(text) {
  const matches = findMatches(text, patternsData.forbidden_in_utility.patterns);
  return matches;
}

export function checkOpenQuestions(text) {
  const patterns = [
    /como vai/i,
    /tudo bem/i,
    /tudo certo/i,
    /como tem sido/i,
    /o que achou/i,
    /gostaria de saber/i,
    /me conta/i,
    /\?+\s*$/m
  ];
  const found = [];
  for (const p of patterns) {
    if (p.test(text)) {
      found.push(p.source);
    }
  }
  return found;
}

export function hasConcreteData(text) {
  const patterns = [
    /r?\$[\s\d.,]+/i,
    /valor/i,
    /\d{1,2}\/\d{1,4}/,
    /data/i,
    /saldo/i,
    /total/i,
    /vencimento/i,
    /validade/i
  ];
  return patterns.some(p => p.test(text));
}

export { findMatches };
