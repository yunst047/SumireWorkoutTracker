// Weeks run Monday 00:00 → next Monday 00:00, months by calendar month, all in local time.
const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function weekRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  return { kind: 'week', start, end, key: dateKey(start) };
}

export function monthRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { kind: 'month', start, end, key: `${start.getFullYear()}-${pad(start.getMonth() + 1)}` };
}

export const rangeOf = (kind, date) => (kind === 'week' ? weekRange(date) : monthRange(date));

// The period immediately before the one `range` describes.
export function previousRange(range) {
  return rangeOf(range.kind, new Date(range.start.getTime() - 1));
}

// Most recently *finished* period of this kind, as of `now`.
export function lastCompleted(kind, now) {
  return previousRange(rangeOf(kind, now));
}

// Which finished period (if any) still needs its end-of-period report.
// First run (nothing seen yet) records silently instead of reporting on an empty past.
export function pendingReport(kind, now, lastSeenKey) {
  const done = lastCompleted(kind, now);
  if (lastSeenKey == null) return { report: null, markSeen: done.key };
  if (done.key > lastSeenKey) return { report: done, markSeen: done.key };
  return { report: null, markSeen: null };
}

// Last `count` periods, newest first, starting with the current (in-progress) one.
export function recentRanges(kind, now, count) {
  const out = [rangeOf(kind, now)];
  while (out.length < count) out.push(previousRange(out[out.length - 1]));
  return out;
}

export function rangeLabel(range) {
  if (range.kind === 'month') {
    return range.start.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  }
  const last = new Date(range.end.getTime() - 1);
  const fmt = { month: 'short', day: 'numeric' };
  return `${range.start.toLocaleDateString(undefined, fmt)} – ${last.toLocaleDateString(undefined, fmt)}`;
}

// WHO recommends ≥150 min/week of moderate activity; months scale by their length.
export function effortTier(summary, range) {
  if (!summary || summary.sessions === 0) return 'none';
  const weeks = (range.end - range.start) / (7 * 24 * 3600 * 1000);
  const perWeek = summary.totalMinutes / weeks;
  if (perWeek >= 150) return 'great';
  if (perWeek >= 75) return 'steady';
  return 'light';
}
