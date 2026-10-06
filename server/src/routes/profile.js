import { Router } from 'express';
import { numberIn } from '../lib/validate.js';

export default function profileRoutes(db, now) {
  const r = Router();

  r.get('/', (_req, res) => {
    res.json(db.prepare('SELECT height_cm, weight_kg, age, updated_at FROM profile WHERE id = 1').get() ?? null);
  });

  r.put('/', (req, res) => {
    const height_cm = numberIn(req.body?.height_cm, 50, 272);
    const weight_kg = numberIn(req.body?.weight_kg, 2, 650);
    const age = numberIn(req.body?.age, 2, 120, { integer: true });
    if (height_cm === null) return res.status(400).json({ error: 'height_cm must be between 50 and 272' });
    if (weight_kg === null) return res.status(400).json({ error: 'weight_kg must be between 2 and 650' });
    if (age === null) return res.status(400).json({ error: 'age must be a whole number between 2 and 120' });

    const updated_at = now().toISOString();
    db.prepare(`
      INSERT INTO profile (id, height_cm, weight_kg, age, updated_at) VALUES (1, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET height_cm = excluded.height_cm, weight_kg = excluded.weight_kg,
        age = excluded.age, updated_at = excluded.updated_at
    `).run(height_cm, weight_kg, age, updated_at);
    res.json({ height_cm, weight_kg, age, updated_at });
  });

  return r;
}
