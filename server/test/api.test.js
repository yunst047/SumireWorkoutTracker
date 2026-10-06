import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { openDb } from '../src/db.js';
import { createApp } from '../src/app.js';

let clock;
let app;
const advance = (minutes) => { clock = new Date(clock.getTime() + minutes * 60_000); };

beforeEach(() => {
  clock = new Date('2026-10-05T10:00:00.000Z');
  app = createApp(openDb(':memory:'), { now: () => clock });
});

describe('profile', () => {
  it('is null before first save, then round-trips', async () => {
    expect((await request(app).get('/api/profile')).body).toBeNull();
    const put = await request(app).put('/api/profile').send({ height_cm: 170, weight_kg: 65, age: 25 });
    expect(put.status).toBe(200);
    const get = await request(app).get('/api/profile');
    expect(get.body).toMatchObject({ height_cm: 170, weight_kg: 65, age: 25 });
  });

  it.each([
    [{ height_cm: 20, weight_kg: 65, age: 25 }, /height_cm/],
    [{ height_cm: 170, weight_kg: -1, age: 25 }, /weight_kg/],
    [{ height_cm: 170, weight_kg: 65, age: 25.5 }, /age/],
    [{ height_cm: 'abc', weight_kg: 65, age: 25 }, /height_cm/],
  ])('rejects %j', async (body, msg) => {
    const res = await request(app).put('/api/profile').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(msg);
  });
});

describe('workouts + cooldown', () => {
  const run30 = { type: 'running', minutes: 30, calories: 300 };

  it('blocks a second log until the cooldown (= minutes spent) is over', async () => {
    const first = await request(app).post('/api/workouts').send(run30);
    expect(first.status).toBe(201);
    expect(first.body.nextAllowedAt).toBe('2026-10-05T10:30:00.000Z');

    advance(29);
    const blocked = await request(app).post('/api/workouts').send(run30);
    expect(blocked.status).toBe(409);
    expect(blocked.body.nextAllowedAt).toBe('2026-10-05T10:30:00.000Z');
    expect((await request(app).get('/api/cooldown')).body.nextAllowedAt).toBe('2026-10-05T10:30:00.000Z');

    advance(1);
    expect((await request(app).get('/api/cooldown')).body.nextAllowedAt).toBeNull();
    expect((await request(app).post('/api/workouts').send(run30)).status).toBe(201);
  });

  it('validates input', async () => {
    expect((await request(app).post('/api/workouts').send({ ...run30, type: 'napping' })).status).toBe(400);
    expect((await request(app).post('/api/workouts').send({ ...run30, minutes: 0 })).status).toBe(400);
    expect((await request(app).post('/api/workouts').send({ ...run30, calories: 99999 })).status).toBe(400);
  });

  it('deleting the latest workout lifts its cooldown', async () => {
    const { body } = await request(app).post('/api/workouts').send(run30);
    expect((await request(app).delete(`/api/workouts/${body.workout.id}`)).status).toBe(204);
    expect((await request(app).get('/api/cooldown')).body.nextAllowedAt).toBeNull();
    expect((await request(app).delete('/api/workouts/999')).status).toBe(404);
  });
});

describe('summary', () => {
  it('aggregates only workouts inside [from, to)', async () => {
    await request(app).post('/api/workouts').send({ type: 'running', minutes: 30, calories: 300 });
    advance(60);
    await request(app).post('/api/workouts').send({ type: 'yoga', minutes: 20, calories: 80 });
    advance(60 * 24);
    await request(app).post('/api/workouts').send({ type: 'running', minutes: 45, calories: 450 });
    advance(60 * 24 * 7);
    await request(app).post('/api/workouts').send({ type: 'hiit', minutes: 10, calories: 150 }); // next week

    const res = await request(app)
      .get('/api/summary')
      .query({ from: '2026-10-05T00:00:00.000Z', to: '2026-10-12T00:00:00.000Z', tz: 0 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      sessions: 3,
      totalMinutes: 95,
      totalCalories: 830,
      activeDays: 2,
      longestSession: 45,
      byType: {
        running: { sessions: 2, minutes: 75, calories: 750 },
        yoga: { sessions: 1, minutes: 20, calories: 80 },
      },
    });
  });

  it('requires from/to', async () => {
    expect((await request(app).get('/api/summary')).status).toBe(400);
  });
});

describe('settings', () => {
  it('stores known keys and rejects unknown ones', async () => {
    await request(app).put('/api/settings/last_week_summary_seen').send({ value: '2026-09-28' });
    expect((await request(app).get('/api/settings/last_week_summary_seen')).body.value).toBe('2026-09-28');
    expect((await request(app).get('/api/settings/admin')).status).toBe(404);
  });
});
