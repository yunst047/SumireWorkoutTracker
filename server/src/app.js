import express from 'express';
import profileRoutes from './routes/profile.js';
import workoutRoutes, { cooldownRoute } from './routes/workouts.js';
import summaryRoutes from './routes/summary.js';

const SETTING_KEYS = ['last_week_summary_seen', 'last_month_summary_seen'];

// `now` is injectable so tests can move the clock through a cooldown.
export function createApp(db, { now = () => new Date() } = {}) {
  const app = express();
  app.use(express.json());

  app.use('/api/profile', profileRoutes(db, now));
  app.use('/api/workouts', workoutRoutes(db, now));
  app.get('/api/cooldown', cooldownRoute(db, now));
  app.use('/api/summary', summaryRoutes(db));

  app.get('/api/settings/:key', (req, res) => {
    if (!SETTING_KEYS.includes(req.params.key)) return res.status(404).json({ error: 'unknown setting' });
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
    res.json({ value: row?.value ?? null });
  });

  app.put('/api/settings/:key', (req, res) => {
    if (!SETTING_KEYS.includes(req.params.key)) return res.status(404).json({ error: 'unknown setting' });
    const value = req.body?.value == null ? null : String(req.body.value);
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value')
      .run(req.params.key, value);
    res.json({ value });
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON' });
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  });

  return app;
}
