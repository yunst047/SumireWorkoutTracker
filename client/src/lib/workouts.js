// MET values approximated from the Compendium of Physical Activities.
export const WORKOUT_TYPES = [
  { id: 'running', label: 'Running', met: 9.8, icon: '🏃' },
  { id: 'walking', label: 'Walking', met: 3.5, icon: '🚶' },
  { id: 'cycling', label: 'Cycling', met: 7.5, icon: '🚴' },
  { id: 'swimming', label: 'Swimming', met: 7.0, icon: '🏊' },
  { id: 'strength', label: 'Strength', met: 5.0, icon: '🏋️' },
  { id: 'hiit', label: 'HIIT', met: 8.0, icon: '🔥' },
  { id: 'yoga', label: 'Yoga', met: 2.5, icon: '🧘' },
  { id: 'other', label: 'Other', met: 4.0, icon: '⭐' },
];

export const typeInfo = (id) => WORKOUT_TYPES.find((t) => t.id === id) ?? WORKOUT_TYPES.at(-1);

export function estimateCalories(typeId, minutes, weightKg) {
  if (!(minutes > 0) || !(weightKg > 0)) return null;
  return Math.round(typeInfo(typeId).met * weightKg * (minutes / 60));
}

export function formatDuration(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

export function topType(byType) {
  let best = null;
  for (const [id, t] of Object.entries(byType ?? {})) if (!best || t.minutes > best.minutes) best = { id, ...t };
  return best;
}
