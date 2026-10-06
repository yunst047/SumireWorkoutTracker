<script setup>
import SafeImg from '../components/SafeImg.vue';
import DisclaimerFooter from '../components/DisclaimerFooter.vue';
import { SPRITES, UI, assetUrl } from '../data/assetManifest.js';
import { CHARACTER } from '../data/sumireLines.js';

const emit = defineEmits(['start']);
</script>

<template>
  <div class="title" :style="{ '--bg': `url(${assetUrl(UI.background)})` }" @click="emit('start')" @keydown.enter="emit('start')" tabindex="0">
    <div class="sprite"><SafeImg :src="assetUrl(SPRITES.happy)" alt="Sumire" :label="SPRITES.happy" /></div>
    <div class="logo">
      <img class="logo-img" :src="assetUrl(UI.logo)" alt="" @error="$event.target.remove()" />
      <div class="sub">{{ CHARACTER.school }} · {{ CHARACTER.affiliation }}</div>
      <h1>SUMIRE<span>WORKOUT TRACKER</span></h1>
    </div>
    <div class="touch">TOUCH TO START</div>
    <DisclaimerFooter class="foot" />
  </div>
</template>

<style scoped>
.title {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto auto;
  cursor: pointer;
  background:
    var(--bg) center / cover no-repeat,
    radial-gradient(circle at 70% 30%, #ffffff 0, transparent 45%),
    linear-gradient(160deg, #9fd8ff 0%, #e4f4ff 60%, #ffffff 100%);
  outline: none;
}
.sprite { grid-row: 1 / 3; display: flex; align-items: flex-end; justify-content: center; padding-top: 2rem; }
.sprite :deep(img) { max-height: 88vh; max-width: 100%; object-fit: contain; }
.sprite :deep(.placeholder) { height: 70vh; width: 70%; }
.logo { align-self: center; padding: 1rem 2rem; }
.logo-img { display: block; max-width: min(360px, 80%); margin-bottom: 0.75rem; }
.sub { font-weight: 800; color: var(--ba-blue); letter-spacing: 0.06em; font-size: 0.9rem; }
h1 { font-size: clamp(2.6rem, 7vw, 5.5rem); font-weight: 800; line-height: 0.95; color: var(--ba-navy); font-style: italic; letter-spacing: -0.02em; }
h1 span { display: block; margin-top: 0.15em; font-size: 0.42em; line-height: 1; color: var(--ba-blue); letter-spacing: 0.04em; }
.touch {
  align-self: start;
  padding: 0 2rem;
  font-weight: 900;
  letter-spacing: 0.25em;
  color: var(--ba-blue-deep);
  animation: blink 1.6s ease-in-out infinite;
}
.foot { grid-column: 1 / -1; background: rgba(255, 255, 255, 0.7); max-width: none; }
@keyframes blink { 50% { opacity: 0.25; } }
@media (max-width: 720px) {
  .title { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto auto; }
  .logo { grid-row: 1; text-align: center; padding-top: 2rem; }
  .sprite { grid-row: 2; padding: 0; }
  .sprite :deep(img) { max-height: 55vh; }
  .sprite :deep(.placeholder) { height: 45vh; }
  .touch { grid-row: 3; text-align: center; padding: 1rem; }
}
</style>
