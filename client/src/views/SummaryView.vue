<script setup>
import { ref, watch } from 'vue';
import SummaryCard from '../components/SummaryCard.vue';
import { api } from '../api.js';
import { recentRanges, effortTier, rangeLabel } from '../lib/periods.js';
import { useDialogStore } from '../stores/dialog.js';
import { useTrackerStore } from '../stores/tracker.js';
import { LINES } from '../data/sumireLines.js';

const dialog = useDialogStore();
const tracker = useTrackerStore();
const kind = ref('week');
const items = ref([]);
const error = ref('');

async function load() {
  error.value = '';
  // One extra range so the oldest shown card still has a "previous" to compare against.
  const ranges = recentRanges(kind.value, new Date(), 7);
  items.value = ranges.slice(0, 6).map((range) => ({ range, summary: null, previous: null }));
  try {
    const sums = await Promise.all(ranges.map((r) => api.getSummary(r)));
    items.value = ranges.slice(0, 6).map((range, i) => ({ range, summary: sums[i], previous: sums[i + 1] }));
  } catch (e) {
    error.value = e.message;
  }
}

// Reload when switching tabs or after a workout is logged/deleted.
watch([kind, () => tracker.workouts.length], load, { immediate: true });

function askSumire(item) {
  const tier = effortTier(item.summary, item.range);
  const period = `${item.range.kind === 'week' ? 'Weekly' : 'Monthly'} (${rangeLabel(item.range)})`;
  dialog.say(LINES.summary[tier]({ ...item.summary, period }));
}
</script>

<template>
  <div class="view">
    <section class="panel">
      <div class="head">
        <h2 class="panel-title">Effort Report</h2>
        <div class="tabs" role="tablist">
          <button role="tab" :aria-selected="kind === 'week'" :class="{ on: kind === 'week' }" @click="kind = 'week'">Weekly</button>
          <button role="tab" :aria-selected="kind === 'month'" :class="{ on: kind === 'month' }" @click="kind = 'month'">Monthly</button>
        </div>
      </div>
      <p class="muted small">
        Sumire delivers the report automatically at the end of each week (Mon–Sun) and month. Targets follow the WHO
        guideline of 150 active minutes per week.
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <SummaryCard
      v-for="(it, i) in items"
      :key="it.range.key"
      :range="it.range"
      :summary="it.summary"
      :previous="it.previous"
      :current="i === 0"
    >
      <button v-if="it.summary" class="ba-btn ghost ask" @click="askSumire(it)"><span>Ask Sumire</span></button>
    </SummaryCard>
  </div>
</template>

<style scoped>
.view { display: flex; flex-direction: column; gap: 1rem; }
.head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
.head .panel-title { margin: 0; }
.tabs { display: flex; gap: 0.25rem; background: var(--ba-sky); padding: 0.25rem; border-radius: 8px; }
.tabs button { border: none; background: none; padding: 0.4rem 1rem; border-radius: 6px; font-weight: 800; color: var(--ba-muted); }
.tabs button.on { background: var(--ba-blue); color: #fff; }
.small { font-size: 0.8rem; margin: 0.6rem 0 0; }
.ask { margin-top: 0.9rem; padding: 0.4rem 1.1rem; font-size: 0.85rem; }
</style>
