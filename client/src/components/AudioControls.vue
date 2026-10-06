<script setup>
import { useAudioStore } from '../stores/audio.js';
const audio = useAudioStore();
</script>

<template>
  <div class="audio">
    <button class="mute" :aria-pressed="audio.muted" :title="audio.muted ? 'Unmute' : 'Mute'" @click="audio.toggleMute()">
      {{ audio.muted ? '🔇' : '🔊' }}
    </button>
    <label title="BGM volume">
      BGM
      <input v-model.number="audio.bgmVolume" type="range" min="0" max="1" step="0.05" @input="audio.persist()" />
    </label>
    <label title="Voice volume">
      Voice
      <input v-model.number="audio.voiceVolume" type="range" min="0" max="1" step="0.05" @input="audio.persist()" />
    </label>
  </div>
</template>

<style scoped>
.audio { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 700; color: var(--ba-muted); }
.mute { border: none; background: #fff; border-radius: 50%; width: 2.2rem; height: 2.2rem; box-shadow: var(--shadow); }
label { display: flex; align-items: center; gap: 0.3rem; }
input[type='range'] { width: 70px; accent-color: var(--ba-blue); }
@media (max-width: 640px) { label { display: none; } }
</style>
