import { Router } from 'express';
import { isoOrNull } from '../lib/validate.js';

// `from`/`to` are local period boundaries converted to ISO by the client;
// `tz` is the client's getTimezoneOffset() so "active days" are counted in local time.
export default function summaryRoutes(db) {
  const r = Router();

  r.get('/', (req, res) => {
    const from = isoOrNull(req.query.from);
    const to = isoOrNull(req.query.to);
    if (!from || !to) return res.status(400).json({ error: 'from and to must be ISO dates' });
    const tzOffsetMin = Number(req.query.tz) || 0;

    const rows = db
      .prepare('SELECT type, minutes, calories, logged_at FROM workouts WHERE logged_at >= ? AND logged_at < ?')
      .all(from, to);

    const byType = {};
    const days = new Set();
    let totalMinutes = 0;
    let totalCalories = 0;
    let longestSession = 0;
    for (const w of rows) {
      totalMinutes += w.minutes;
      totalCalories += w.calories;
      longestSession = Math.max(longestSession, w.minutes);
      const t = (byType[w.type] ??= { sessions: 0, minutes: 0, calories: 0 });
      t.sessions++;
      t.minutes += w.minutes;
      t.calories += w.calories;
      days.add(new Date(Date.parse(w.logged_at) - tzOffsetMin * 60_000).toISOString().slice(0, 10));
    }

    res.json({
      from,
      to,
      sessions: rows.length,
      totalMinutes,
      totalCalories,
      activeDays: days.size,
      longestSession,
      byType,
    });
  });

  return r;
}
