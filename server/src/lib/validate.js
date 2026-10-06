export const WORKOUT_TYPES = ['running', 'walking', 'cycling', 'swimming', 'strength', 'hiit', 'yoga', 'other'];

// Returns the number if it is finite and within [min, max], else null.
export function numberIn(value, min, max, { integer = false } = {}) {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  if (integer && !Number.isInteger(n)) return null;
  return n >= min && n <= max ? n : null;
}

export function isoOrNull(value) {
  if (typeof value !== 'string') return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
