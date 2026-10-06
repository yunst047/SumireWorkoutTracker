<script setup>
import { ref } from 'vue';
import TitleView from './views/TitleView.vue';
import SumireStage from './components/SumireStage.vue';
import SummaryCard from './components/SummaryCard.vue';
import AudioControls from './components/AudioControls.vue';
import DisclaimerFooter from './components/DisclaimerFooter.vue';
import { useAudioStore } from './stores/audio.js';
import { useDialogStore } from './stores/dialog.js';
import { useTrackerStore } from './stores/tracker.js';
import { api } from './api.js';
import { pendingReport, previousRange, effortTier, rangeLabel } from './lib/periods.js';
import { CHARACTER, LINES } from './data/sumireLines.js';
import router from './router.js';

const audio = useAudioStore();
const dialog = useDialogStore();
const tracker = useTrackerStore();

const started = ref(false);
const loadError = ref('');
const reports = ref([]); // end-of-period reports waiting to be shown

const navRoutes = router.options.routes.filter((r) => r.meta?.label);

// Month first, then week, so the bigger picture comes first.
async function findPendingReports() {
  const now = new Date();
  const out = [];
  for (const kind of ['month', 'week']) {
    const key = `last_${kind}_summary_seen`;
    const { report, markSeen } = pendingReport(kind, now, await api.getSetting(key));
    if (report) {
      const [summary, previous] = await Promise.all([api.getSummary(report), api.getSummary(previousRange(report))]);
      out.push({ range: report, summary, previous });
    }
    // Marked as soon as it is queued, so each report appears exactly once.
    if (markSeen) await api.setSetting(key, markSeen);
  }
  return out;
}

function presentReport(r) {
  const tier = effortTier(r.summary, r.range);
  const period = `${r.range.kind === 'week' ? 'Weekly' : 'Monthly'} (${rangeLabel(r.range)})`;
  dialog.say(LINES.summary[tier]({ ...r.summary, period }));
}

function closeReport() {
  reports.value.shift();
  if (reports.value.length) presentReport(reports.value[0]);
  else dialog.say(tracker.profile ? LINES.greetingReturning : LINES.greeting);
}

async function start() {
  started.value = true;
  audio.startBgm();
  try {
    await tracker.load();
    reports.value = await findPendingReports();
  } catch (e) {
    loadError.value = `Can't reach the gym server (${e.message}). Is \`npm run dev\` running?`;
  }
  if (reports.value.length) presentReport(reports.value[0]);
  else dialog.say(tracker.profile ? LINES.greetingReturning : LINES.greeting);
}
</script>

<template>
  <TitleView v-if="!started" @start="start" />

  <div v-else class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="mark">💪</span>
        <div>
          <b>Sumire Workout Tracker</b>
          <small>{{ CHARACTER.school }} · {{ CHARACTER.affiliation }}</small>
        </div>
      </div>
      <nav>
        <RouterLink v-for="r in navRoutes" :key="r.path" :to="r.path">{{ r.meta.label }}</RouterLink>
      </nav>
      <AudioControls />
    </header>

    <p v-if="loadError" class="error banner">{{ loadError }}</p>

    <main class="layout">
      <div class="stage-col"><SumireStage /></div>
      <div class="content-col">
        <section v-if="reports.length" class="report" aria-label="Period report">
          <div class="ribbon">Sumire's {{ reports[0].range.kind === 'week' ? 'Weekly' : 'Monthly' }} Report</div>
          <SummaryCard :range="reports[0].range" :summary="reports[0].summary" :previous="reports[0].previous" />
          <button class="ba-btn blue" @click="closeReport">
            <span>{{ reports.length > 1 ? 'Next report' : 'Got it!' }}</span>
          </button>
        </section>
        <RouterView v-else />
      </div>
    </main>

    <DisclaimerFooter />

  </div>
</template>

<style scoped>
.shell { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  background: linear-gradient(180deg, rgba(230, 244, 255, 0.95), rgba(230, 244, 255, 0.8));
  backdrop-filter: blur(6px);
}
.brand { display: flex; align-items: center; gap: 0.6rem; }
.brand .mark { font-size: 1.6rem; }
.brand b { display: block; font-family: 'M PLUS Rounded 1c', sans-serif; font-weight: 800; font-style: italic; }
.brand small { font-size: 0.7rem; font-weight: 700; color: var(--ba-blue); }
nav { display: flex; gap: 0.4rem; }
nav a {
  padding: 0.45rem 1.1rem;
  font-weight: 800;
  text-decoration: none;
  color: var(--ba-navy);
  background: #fff;
  border-radius: 6px;
  transform: skewX(-12deg);
  box-shadow: var(--shadow);
}
nav a.router-link-exact-active { background: var(--ba-blue); color: #fff; }

.banner { background: #ffe5ea; padding: 0.6rem 1rem; border-radius: 8px; }

.layout { display: grid; grid-template-columns: minmax(320px, 5fr) 6fr; gap: 1.25rem; align-items: start; }
.stage-col { position: sticky; top: 4.75rem; height: calc(100vh - 6rem); max-height: 760px; }

.report { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding-top: 0.5rem; }
.report > :deep(.card) { width: 100%; }
.ribbon {
  font-family: 'M PLUS Rounded 1c', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  color: #fff;
  background: var(--ba-blue);
  padding: 0.4rem 2rem;
  transform: skewX(-12deg);
  box-shadow: var(--shadow);
}

@media (max-width: 900px) {
  .topbar { flex-wrap: wrap; }
  nav { order: 3; width: 100%; justify-content: center; }
  .layout { grid-template-columns: 1fr; }
  .stage-col { position: relative; top: 0; height: 52vh; min-height: 380px; }
}
</style>
