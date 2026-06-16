export function toCents(value) {
  if (typeof value === 'number') return Math.round(value * 100);
  if (typeof value === 'string') {
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return Math.round(parseFloat(cleaned) * 100);
  }
  return 0;
}

export function fromCents(cents) {
  return (cents / 100).toFixed(2);
}

export function formatCurrency(value) {
  if (typeof value === 'number') {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
  return `R$ ${value}`;
}

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function truncate(text, maxLen = 1024) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}
