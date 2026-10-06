<script setup>
import { reactive, ref, computed } from 'vue';
import { useTrackerStore } from '../stores/tracker.js';
import { useDialogStore } from '../stores/dialog.js';
import CooldownTimer from '../components/CooldownTimer.vue';
import { WORKOUT_TYPES, typeInfo, estimateCalories, formatDuration } from '../lib/workouts.js';
import { LINES } from '../data/sumireLines.js';

const tracker = useTrackerStore();
const dialog = useDialogStore();

const form = reactive({ type: 'running', minutes: 30, calories: '' });
const error = ref('');
const busy = ref(false);

const coolingDown = computed(() => tracker.nextAllowedAt && Date.parse(tracker.nextAllowedAt) > Date.now());
const cooldownTotal = computed(() => {
  const last = tracker.workouts[0];
  return last ? last.minutes * 60_000 : null;
});
const estimate = computed(() => estimateCalories(form.type, Number(form.minutes), tracker.profile?.weight_kg));
const recent = computed(() => tracker.workouts.slice(0, 30));

function useEstimate() {
  if (estimate.value != null) form.calories = estimate.value;
}

async function submit() {
  error.value = '';
  busy.value = true;
  try {
    const res = await tracker.logWorkout({
      type: form.type,
      minutes: Number(form.minutes),
      calories: Number(form.calories),
    });
    if (res.ok) {
      dialog.say(LINES.workoutLogged({ ...res.workout, label: typeInfo(res.workout.type).label }));
      form.calories = '';
    } else {
      dialog.say(LINES.cooldown(formatDuration(Date.parse(res.nextAllowedAt) - Date.now())));
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

function onCooldownDone() {
  tracker.nextAllowedAt = null;
  dialog.say(LINES.cooldownOver);
}

async function remove(w) {
  if (!confirm(`Delete ${w.minutes} min of ${typeInfo(w.type).label}?`)) return;
  try {
    await tracker.deleteWorkout(w.id);
  } catch (e) {
    error.value = e.message;
  }
}

const when = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
</script>

<template>
  <div class="view">
    <section class="panel">
      <h2 class="panel-title">Training Log</h2>

      <CooldownTimer
        v-if="coolingDown"
        :key="tracker.nextAllowedAt"
        :until="tracker.nextAllowedAt"
        :total="cooldownTotal"
        class="cd"
        @done="onCooldownDone"
      />

      <form @submit.prevent="submit">
        <fieldset :disabled="coolingDown || busy">
          <div class="types" role="radiogroup" aria-label="Workout type">
            <button
              v-for="t in WORKOUT_TYPES"
              :key="t.id"
              type="button"
              role="radio"
              :aria-checked="form.type === t.id"
              :class="{ active: form.type === t.id }"
              @click="form.type = t.id"
            >
              <span class="icon">{{ t.icon }}</span>{{ t.label }}
            </button>
          </div>
          <div class="grid">
            <label class="field">Time spent (min)<input v-model="form.minutes" type="number" min="1" max="600" step="1" required /></label>
            <label class="field">
              Calories burned (kcal)
              <input v-model="form.calories" type="number" min="0" max="5000" step="1" required />
            </label>
          </div>
          <p class="hint muted">
            <template v-if="estimate != null">
              Estimate for {{ form.minutes }} min of {{ typeInfo(form.type).label }}: ~{{ estimate }} kcal
              <button type="button" class="link" @click="useEstimate">use it</button>
            </template>
            <template v-else>Save your weight in Body Check to get a calorie estimate.</template>
          </p>
          <p v-if="error" class="error">{{ error }}</p>
          <button class="ba-btn"><span>{{ coolingDown ? 'Resting…' : 'Log Training' }}</span></button>
        </fieldset>
      </form>
      <p class="muted small">After each workout you must rest for as long as you trained before logging the next one.</p>
    </section>

    <section class="panel">
      <h2 class="panel-title">History</h2>
      <p v-if="!recent.length" class="muted">No training yet. Sumire is waiting, Sensei!</p>
      <ul class="history">
        <li v-for="w in recent" :key="w.id">
          <span class="icon">{{ typeInfo(w.type).icon }}</span>
          <div class="info">
            <b>{{ typeInfo(w.type).label }}</b>
            <small class="muted">{{ when(w.logged_at) }}</small>
          </div>
          <span class="num">{{ w.minutes }} min</span>
          <span class="num">{{ w.calories }} kcal</span>
          <button class="del" title="Delete" @click="remove(w)">✕</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.view { display: flex; flex-direction: column; gap: 1rem; }
.cd { margin-bottom: 1rem; }
fieldset { border: none; padding: 0; margin: 0; }
.types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
.types button {
  display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  padding: 0.6rem 0.25rem; border: 2px solid var(--ba-line); border-radius: 8px; background: #fff;
  font-weight: 700; font-size: 0.8rem; color: var(--ba-navy); transition: all 0.12s;
}
.types button.active { border-color: var(--ba-blue); background: var(--ba-sky); color: var(--ba-blue-deep); }
.types .icon { font-size: 1.4rem; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.hint { font-size: 0.8rem; margin: 0.5rem 0 1rem; }
.link { border: none; background: none; color: var(--ba-blue); font-weight: 800; text-decoration: underline; padding: 0; }
.small { font-size: 0.75rem; margin: 0.8rem 0 0; }
.history { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
.history li { display: grid; grid-template-columns: 2rem 1fr auto auto 2rem; align-items: center; gap: 0.6rem; padding: 0.55rem 0; border-bottom: 1px solid var(--ba-line); }
.history .icon { font-size: 1.3rem; text-align: center; }
.info { display: flex; flex-direction: column; }
.num { font-weight: 800; font-variant-numeric: tabular-nums; font-size: 0.9rem; }
.del { border: none; background: none; color: var(--ba-muted); border-radius: 50%; width: 2rem; height: 2rem; }
.del:hover { background: #ffe5ea; color: var(--ba-danger); }
@media (max-width: 520px) {
  .types { grid-template-columns: repeat(2, 1fr); }
  .grid { grid-template-columns: 1fr; }
  .history li { grid-template-columns: 2rem 1fr auto 2rem; }
  .history li .num:nth-of-type(2) { display: none; }
}
</style>
