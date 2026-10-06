export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const rangeQuery = (r) =>
  `from=${encodeURIComponent(r.start.toISOString())}&to=${encodeURIComponent(r.end.toISOString())}`;

export const api = {
  getProfile: () => request('GET', '/profile'),
  saveProfile: (p) => request('PUT', '/profile', p),
  listWorkouts: (range) => request('GET', `/workouts${range ? `?${rangeQuery(range)}` : ''}`),
  logWorkout: (w) => request('POST', '/workouts', w),
  deleteWorkout: (id) => request('DELETE', `/workouts/${id}`),
  getCooldown: () => request('GET', '/cooldown'),
  getSummary: (range) => request('GET', `/summary?${rangeQuery(range)}&tz=${new Date().getTimezoneOffset()}`),
  getSetting: (key) => request('GET', `/settings/${key}`).then((r) => r.value),
  setSetting: (key, value) => request('PUT', `/settings/${key}`, { value }),
};
