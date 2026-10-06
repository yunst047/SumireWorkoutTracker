// Cooldown after a workout lasts exactly as long as the workout itself.
export function nextAllowedAt(lastWorkout) {
  if (!lastWorkout) return null;
  return new Date(Date.parse(lastWorkout.logged_at) + lastWorkout.minutes * 60_000);
}

export function cooldownActive(lastWorkout, now) {
  const next = nextAllowedAt(lastWorkout);
  return next !== null && now < next;
}
