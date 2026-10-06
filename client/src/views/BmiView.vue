<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { useTrackerStore } from '../stores/tracker.js';
import { useDialogStore } from '../stores/dialog.js';
import { calcBmi, bmiCategory, healthyWeightRange, CATEGORY_LABEL } from '../lib/bmi.js';
import { LINES } from '../data/sumireLines.js';

const tracker = useTrackerStore();
const dialog = useDialogStore();

const form = reactive({ height_cm: '', weight_kg: '', age: '' });
const error = ref('');
const saving = ref(false);

watch(
  () => tracker.profile,
  (p) => p && Object.assign(form, { height_cm: p.height_cm, weight_kg: p.weight_kg, age: p.age }),
  { immediate: true },
);

const saved = computed(() => tracker.profile);
const bmi = computed(() => saved.value && calcBmi(saved.value.height_cm, saved.value.weight_kg));
const category = computed(() => bmi.value && bmiCategory(bmi.value, saved.value.age));
const range = computed(() => saved.value && healthyWeightRange(saved.value.height_cm));

// Position on a 10–40 BMI scale for the gauge marker.
const gaugePos = (v) => `${Math.max(0, Math.min(100, ((v - 10) / 30) * 100))}%`;

async function submit() {
  error.value = '';
  saving.value = true;
  try {
    const p = await tracker.saveProfile({
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      age: Number(form.age),
    });
    const b = calcBmi(p.height_cm, p.weight_kg);
    dialog.say(LINES.bmi[bmiCategory(b, p.age)](b));
  } catch (e) {
    error.value = e.message;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="view">
    <section class="panel">
      <h2 class="panel-title">Body Check</h2>
      <form @submit.prevent="submit">
        <div class="grid">
          <label class="field">Height (cm)<input v-model="form.height_cm" type="number" step="0.1" min="50" max="272" required /></label>
          <label class="field">Weight (kg)<input v-model="form.weight_kg" type="number" step="0.1" min="2" max="650" required /></label>
          <label class="field">Age<input v-model="form.age" type="number" step="1" min="2" max="120" required /></label>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="ba-btn" :disabled="saving"><span>{{ saved ? 'Update & Ask Sumire' : 'Check with Sumire' }}</span></button>
      </form>
    </section>

    <section v-if="bmi" class="panel result">
      <h2 class="panel-title">Result</h2>
      <div class="bmi-row">
        <div class="bmi-value">{{ bmi.toFixed(1) }}<small>BMI</small></div>
        <span class="badge" :class="category">{{ CATEGORY_LABEL[category] }}</span>
      </div>
      <div class="gauge" aria-hidden="true">
        <div class="seg under"></div><div class="seg normal"></div><div class="seg over"></div><div class="seg obese"></div>
        <div class="marker" :style="{ left: gaugePos(bmi) }"></div>
      </div>
      <div class="ticks"><span>18.5</span><span>25</span><span>30</span></div>
      <p v-if="category !== 'child'" class="muted">
        Healthy weight for {{ saved.height_cm }} cm: <b>{{ range.min }}–{{ range.max }} kg</b>
      </p>
      <p v-else class="muted">Under 18: adult BMI categories don't apply — use a BMI-for-age percentile chart.</p>
      <p class="muted note">BMI is a rough screening number; it doesn't measure muscle or body fat. Ask a doctor for real advice.</p>
    </section>
  </div>
</template>

<style scoped>
.view { display: flex; flex-direction: column; gap: 1rem; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
@media (max-width: 520px) { .grid { grid-template-columns: 1fr; } }
.bmi-row { display: flex; align-items: center; gap: 1rem; }
.bmi-value { font-size: 3rem; font-weight: 900; line-height: 1; font-variant-numeric: tabular-nums; }
.bmi-value small { font-size: 0.9rem; margin-left: 0.3rem; color: var(--ba-muted); }
.badge { padding: 0.3rem 0.8rem; border-radius: 4px; font-weight: 800; color: #fff; transform: skewX(-12deg); }
.badge.underweight { background: #5aa9ff; }
.badge.normal { background: var(--ba-ok); }
.badge.overweight { background: #ffae33; }
.badge.obese { background: var(--ba-danger); }
.badge.child { background: #9a7cff; }
/* 10–40 scale: 18.5 → 28.3%, 25 → 50%, 30 → 66.7% */
.gauge { position: relative; display: grid; grid-template-columns: 28.3% 21.7% 16.7% 33.3%; height: 12px; border-radius: 6px; overflow: visible; margin: 1.2rem 0 0.25rem; }
.seg.under { background: #b6dbff; border-radius: 6px 0 0 6px; }
.seg.normal { background: #9fe7c8; }
.seg.over { background: #ffd89a; }
.seg.obese { background: #ffb3c1; border-radius: 0 6px 6px 0; }
.marker { position: absolute; top: -5px; width: 4px; height: 22px; background: var(--ba-navy); border-radius: 2px; transform: translateX(-50%); transition: left 0.4s; }
.ticks { position: relative; height: 1rem; font-size: 0.7rem; color: var(--ba-muted); }
.ticks span { position: absolute; transform: translateX(-50%); }
.ticks span:nth-child(1) { left: 28.3%; }
.ticks span:nth-child(2) { left: 50%; }
.ticks span:nth-child(3) { left: 66.7%; }
.note { font-size: 0.75rem; }
</style>
