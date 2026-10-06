<script setup>
import { computed } from 'vue';
import { rangeLabel, effortTier } from '../lib/periods.js';
import { typeInfo } from '../lib/workouts.js';

const props = defineProps({
  range: { type: Object, required: true },
  summary: { type: Object, default: null },
  previous: { type: Object, default: null },
  current: Boolean,
});

const TIER = {
  great: { label: 'EXCELLENT', color: '#ffb300' },
  steady: { label: 'GREAT', color: '#128cff' },
  light: { label: 'GOOD START', color: '#2fc58c' },
  none: { label: 'REST', color: '#8a99b8' },
};

const tier = computed(() => (props.summary ? effortTier(props.summary, props.range) : null));
const types = computed(() => {
  const entries = Object.entries(props.summary?.byType ?? {}).sort((a, b) => b[1].minutes - a[1].minutes);
  const max = entries[0]?.[1].minutes || 1;
  return entries.map(([id, t]) => ({ ...typeInfo(id), ...t, pct: (t.minutes / max) * 100 }));
});

function delta(key) {
  if (!props.previous || !props.summary) return null;
  const d = props.summary[key] - props.previous[key];
  return d === 0 ? '±0' : d > 0 ? `+${d}` : `${d}`;
}
</script>

<template>
  <article class="card">
    <header>
      <div>
        <div class="kind">{{ range.kind === 'week' ? 'Weekly' : 'Monthly' }} report<span v-if="current"> · in progress</span></div>
        <h3>{{ rangeLabel(range) }}</h3>
      </div>
      <span v-if="tier" class="tier" :style="{ background: TIER[tier].color }">{{ TIER[tier].label }}</span>
    </header>

    <div v-if="!summary" class="muted">Loading…</div>
    <template v-else>
      <div class="stats">
        <div><b>{{ summary.totalMinutes }}</b><span>minutes</span><i v-if="delta('totalMinutes')">{{ delta('totalMinutes') }}</i></div>
        <div><b>{{ summary.totalCalories }}</b><span>kcal</span><i v-if="delta('totalCalories')">{{ delta('totalCalories') }}</i></div>
        <div><b>{{ summary.sessions }}</b><span>sessions</span><i v-if="delta('sessions')">{{ delta('sessions') }}</i></div>
        <div><b>{{ summary.activeDays }}</b><span>active days</span><i v-if="delta('activeDays')">{{ delta('activeDays') }}</i></div>
      </div>
      <ul v-if="types.length" class="types">
        <li v-for="t in types" :key="t.id">
          <span class="tname">{{ t.icon }} {{ t.label }}</span>
          <span class="bar"><span :style="{ width: t.pct + '%' }"></span></span>
          <span class="tval">{{ t.minutes }} min · {{ t.calories }} kcal</span>
        </li>
      </ul>
      <p v-else class="muted empty">No training logged.</p>
    </template>
    <slot />
  </article>
</template>

<style scoped>
.card { background: #fff; border: 1px solid var(--ba-line); border-radius: var(--radius); padding: 1rem 1.1rem; box-shadow: var(--shadow); }
header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.8rem; }
.kind { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ba-blue); }
h3 { font-size: 1.1rem; }
.tier { color: #fff; font-weight: 900; font-size: 0.75rem; padding: 0.25rem 0.7rem; transform: skewX(-12deg); border-radius: 4px; white-space: nowrap; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.stats div { display: flex; flex-direction: column; align-items: center; background: var(--ba-sky); border-radius: 8px; padding: 0.55rem 0.25rem; }
.stats b { font-size: 1.35rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.stats span { font-size: 0.7rem; color: var(--ba-muted); font-weight: 700; }
.stats i { font-style: normal; font-size: 0.7rem; font-weight: 800; color: var(--ba-blue); }
.types { list-style: none; padding: 0; margin: 0.9rem 0 0; display: flex; flex-direction: column; gap: 0.4rem; }
.types li { display: grid; grid-template-columns: 7.5rem 1fr auto; align-items: center; gap: 0.6rem; font-size: 0.85rem; }
.tname { font-weight: 700; }
.bar { height: 8px; background: var(--ba-sky); border-radius: 4px; overflow: hidden; }
.bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--ba-blue), var(--ba-cyan)); }
.tval { color: var(--ba-muted); font-size: 0.78rem; font-variant-numeric: tabular-nums; }
.empty { margin: 0.8rem 0 0; }
@media (max-width: 520px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .types li { grid-template-columns: 6rem 1fr; }
  .tval { grid-column: 1 / -1; }
}
</style>
