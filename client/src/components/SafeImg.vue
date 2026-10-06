<script setup>
import { ref, watch } from 'vue';

// Shows the image if the file exists, otherwise a labelled placeholder
// so the app works before any Blue Archive assets are added.
const props = defineProps({ src: String, alt: String, label: String });
const failed = ref(false);
watch(() => props.src, () => (failed.value = false));
</script>

<template>
  <img v-if="src && !failed" :src="src" :alt="alt" @error="failed = true" />
  <div v-else class="placeholder" role="img" :aria-label="alt">
    <div class="halo"></div>
    <div class="silhouette"></div>
    <small>{{ label ?? alt }}</small>
  </div>
</template>

<style scoped>
.placeholder {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  min-height: 160px;
  padding-bottom: 0.75rem;
}
.halo {
  position: absolute;
  top: 6%;
  width: 34%;
  aspect-ratio: 3 / 1;
  border: 4px solid #ff9ad5;
  border-radius: 50%;
  opacity: 0.8;
}
.silhouette {
  width: 46%;
  height: 78%;
  background: linear-gradient(180deg, #c9dcf3, #a9c3e6);
  border-radius: 45% 45% 18% 18% / 30% 30% 10% 10%;
  opacity: 0.8;
}
small {
  margin-top: 0.4rem;
  font-size: 0.7rem;
  color: var(--ba-muted);
  background: rgba(255, 255, 255, 0.8);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}
</style>
