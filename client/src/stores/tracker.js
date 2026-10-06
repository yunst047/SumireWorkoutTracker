import { defineStore } from 'pinia';
import { api, ApiError } from '../api.js';

export const useTrackerStore = defineStore('tracker', {
  state: () => ({
    profile: null,
    workouts: [],
    nextAllowedAt: null, // ISO string while a cooldown is running
    loaded: false,
  }),

  actions: {
    async load() {
      const [profile, workouts, cd] = await Promise.all([api.getProfile(), api.listWorkouts(), api.getCooldown()]);
      this.profile = profile;
      this.workouts = workouts;
      this.nextAllowedAt = cd.nextAllowedAt;
      this.loaded = true;
    },

    async saveProfile(p) {
      this.profile = await api.saveProfile(p);
      return this.profile;
    },

    // Returns { ok: true, workout } or { ok: false, nextAllowedAt } when the server says we're cooling down.
    async logWorkout(w) {
      try {
        const res = await api.logWorkout(w);
        this.workouts.unshift(res.workout);
        this.nextAllowedAt = res.nextAllowedAt;
        return { ok: true, workout: res.workout };
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          this.nextAllowedAt = e.body.nextAllowedAt;
          return { ok: false, nextAllowedAt: e.body.nextAllowedAt };
        }
        throw e;
      }
    },

    async deleteWorkout(id) {
      await api.deleteWorkout(id);
      this.workouts = this.workouts.filter((w) => w.id !== id);
      this.nextAllowedAt = (await api.getCooldown()).nextAllowedAt;
    },
  },
});
