/**
 * Storyboard guardrails.
 * The plan may describe what was actually captured. It may not invent
 * metrics, customers, or integrations.
 */

const DEFAULT_PATTERNS = [
  { id: 'trusted', re: /trusted by/i, why: 'invented social proof' },
  { id: 'customers', re: /\bcustomers?\b/i, why: 'invented customers' },
  { id: 'users-love', re: /\busers?\b/i, why: 'invented users' },
  { id: 'loved', re: /loved by|fans of|as seen/i, why: 'invented social proof' },
  { id: 'revenue', re: /\b(revenue|mrr|arr|valuation)\b/i, why: 'invented business metric' },
  { id: 'growth', re: /\b\d+(\.\d+)?\s*%|\b\d+(\.\d+)?x\b/i, why: 'invented growth metric' },
  { id: 'big-count', re: /\b\d{3,}\b/, why: 'invented count' },
  { id: 'url', re: /https?:\/\/|\bwww\./i, why: 'URL in on-screen or post copy' },
  { id: 'stripe', re: /\bstripe\b/i, why: 'integration not shown' },
  { id: 'marketplace', re: /\b(doordash|uber\s*eats|grubhub|toast|square)\b/i, why: 'integration not shown' },
  { id: 'seamless', re: /\bseamless(ly)?\b/i, why: 'generic claim' },
  { id: 'stars', re: /\b\d(\.\d)?\s*stars?\b/i, why: 'invented rating' }
];

function compileExtra(list = []) {
  return list.map((source, i) => ({ id: `custom-${i}`, re: new RegExp(source, 'i'), why: 'banned by disclaimer config' }));
}

export function scanText(text, { allow = [], extraPatterns = [] } = {}) {
  const allowed = allow.map(s => String(s).toLowerCase());
  const patterns = [...DEFAULT_PATTERNS, ...compileExtra(extraPatterns)];
  const hits = [];
  const raw = String(text || '');
  for (const pattern of patterns) {
    const match = raw.match(pattern.re);
    if (!match) continue;
    const frag = match[0].toLowerCase();
    if (allowed.some(entry => entry.includes(frag) || frag.includes(entry))) continue;
    hits.push({ id: pattern.id, match: match[0], why: pattern.why });
  }
  return hits;
}

export function assertHonest(blocks, options) {
  const problems = [];
  for (const block of blocks) {
    const hits = scanText(block.text, options);
    for (const hit of hits) problems.push({ ...hit, where: block.where });
  }
  return problems;
}

export function disclaimerLines(config) {
  const lines = Array.isArray(config?.disclaimers) ? config.disclaimers.map(s => String(s).trim()).filter(Boolean) : [];
  if (!lines.length) throw new Error('Disclaimer config needs at least one disclaimer string.');
  return lines;
}
