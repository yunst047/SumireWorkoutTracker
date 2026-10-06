<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { formatDuration } from '../lib/workouts.js';

const props = defineProps({ until: { type: String, required: true }, total: Number });
const emit = defineEmits(['done']);

const now = ref(Date.now());
const remaining = computed(() => Date.parse(props.until) - now.value);
const pct = computed(() => (props.total ? Math.max(0, Math.min(100, (remaining.value / props.total) * 100)) : 0));

let t;
onMounted(() => {
  t = setInterval(() => {
    now.value = Date.now();
    if (remaining.value <= 0) {
      clearInterval(t);
      emit('done');
    }
  }, 250);
});
onBeforeUnmount(() => clearInterval(t));

defineExpose({ remaining });
</script>

<template>
  <div class="cooldown" role="timer">
    <div class="label">Recovery time</div>
    <div class="time">{{ formatDuration(remaining) }}</div>
    <div class="bar"><div class="fill" :style="{ width: pct + '%' }"></div></div>
  </div>
</template>

<style scoped>
.cooldown {
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: linear-gradient(120deg, #24324f, #2e4677);
  color: #fff;
}
.label { font-size: 0.8rem; font-weight: 700; color: #7cc8ff; letter-spacing: 0.08em; text-transform: uppercase; }
.time { font-size: 2.2rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.bar { height: 6px; background: rgba(255, 255, 255, 0.15); border-radius: 3px; overflow: hidden; }
.fill { height: 100%; background: var(--ba-cyan); transition: width 0.25s linear; }
</style>
