import { Router } from 'express';
import { WORKOUT_TYPES, numberIn, isoOrNull } from '../lib/validate.js';
import { nextAllowedAt, cooldownActive } from '../lib/cooldown.js';

export default function workoutRoutes(db, now) {
  const r = Router();
  const latest = db.prepare('SELECT * FROM workouts ORDER BY logged_at DESC, id DESC LIMIT 1');

  r.get('/', (req, res) => {
    const from = isoOrNull(req.query.from) ?? '0000';
    const to = isoOrNull(req.query.to) ?? '9999';
    const rows = db
      .prepare('SELECT * FROM workouts WHERE logged_at >= ? AND logged_at < ? ORDER BY logged_at DESC, id DESC')
      .all(from, to);
    res.json(rows);
  });

  r.post('/', (req, res) => {
    const type = String(req.body?.type ?? '').toLowerCase();
    const minutes = numberIn(req.body?.minutes, 1, 600, { integer: true });
    const calories = numberIn(req.body?.calories, 0, 5000, { integer: true });
    if (!WORKOUT_TYPES.includes(type)) return res.status(400).json({ error: `type must be one of ${WORKOUT_TYPES.join(', ')}` });
    if (minutes === null) return res.status(400).json({ error: 'minutes must be a whole number between 1 and 600' });
    if (calories === null) return res.status(400).json({ error: 'calories must be a whole number between 0 and 5000' });

    const t = now();
    const last = latest.get();
    if (cooldownActive(last, t)) {
      return res.status(409).json({ error: 'cooldown', nextAllowedAt: nextAllowedAt(last).toISOString() });
    }

    const logged_at = t.toISOString();
    const { lastInsertRowid } = db
      .prepare('INSERT INTO workouts (type, minutes, calories, logged_at) VALUES (?, ?, ?, ?)')
      .run(type, minutes, calories, logged_at);
    const row = { id: Number(lastInsertRowid), type, minutes, calories, logged_at };
    res.status(201).json({ workout: row, nextAllowedAt: nextAllowedAt(row).toISOString() });
  });

  r.delete('/:id', (req, res) => {
    const { changes } = db.prepare('DELETE FROM workouts WHERE id = ?').run(Number(req.params.id));
    if (!changes) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  });

  return r;
}

export function cooldownRoute(db, now) {
  const latest = db.prepare('SELECT * FROM workouts ORDER BY logged_at DESC, id DESC LIMIT 1');
  return (_req, res) => {
    const last = latest.get();
    res.json({ nextAllowedAt: cooldownActive(last, now()) ? nextAllowedAt(last).toISOString() : null });
  };
}
