export function studentDisplayName(name) {
  if (typeof name !== 'string' || name.includes('@')) return 'Learner';
  const parts = name.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu);
  if (!parts) return 'Learner';
  return parts[0] + parts.slice(1).map(part => ` ${Array.from(part)[0].toUpperCase()}.`).join('');
}
