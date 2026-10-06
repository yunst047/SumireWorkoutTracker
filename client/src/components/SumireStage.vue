<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import SafeImg from './SafeImg.vue';
import { useDialogStore } from '../stores/dialog.js';
import { SPRITES, UI, assetUrl } from '../data/assetManifest.js';
import { CHARACTER, LINES } from '../data/sumireLines.js';

const dialog = useDialogStore();
const shown = ref('');
const typing = ref(false);
let timer = null;

function typeOut(text) {
  clearInterval(timer);
  shown.value = '';
  typing.value = true;
  let i = 0;
  timer = setInterval(() => {
    shown.value = text.slice(0, ++i);
    if (i >= text.length) finish(text);
  }, 28);
}

function finish(text) {
  clearInterval(timer);
  shown.value = text;
  typing.value = false;
}

watch(() => dialog.current, (l) => l && typeOut(l.text), { immediate: true });
onBeforeUnmount(() => clearInterval(timer));

function onDialogClick() {
  if (typing.value) finish(dialog.current.text);
  else dialog.advance();
}

function onSpriteClick() {
  dialog.say([LINES.tap[Math.floor(Math.random() * LINES.tap.length)]]);
}
</script>

<template>
  <section class="stage" :style="{ '--bg': `url(${assetUrl(UI.background)})` }">
    <Transition name="sprite" mode="out-in">
      <button :key="dialog.sprite" class="sprite" title="Tap Sumire" @click="onSpriteClick">
        <SafeImg
          :src="assetUrl(SPRITES[dialog.sprite])"
          :alt="`Sumire (${dialog.sprite})`"
          :label="SPRITES[dialog.sprite]"
        />
      </button>
    </Transition>

    <div v-if="dialog.current" class="dialog" role="button" tabindex="0" @click="onDialogClick" @keydown.enter.space.prevent="onDialogClick">
      <div class="nameplate">
        <span class="name">{{ CHARACTER.name }}</span>
        <span class="affiliation">{{ CHARACTER.affiliation }}</span>
      </div>
      <p class="text" aria-live="polite">{{ shown }}</p>
      <span v-if="!typing && dialog.hasNext" class="next">▼</span>
    </div>
  </section>
</template>

<style scoped>
.stage {
  position: relative;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  border-radius: var(--radius);
  background:
    var(--bg) center / cover no-repeat,
    linear-gradient(180deg, #bfe6ff 0%, #eaf6ff 55%, #ffffff 100%);
  box-shadow: var(--shadow);
}

.sprite {
  position: absolute;
  inset: 0 0 0 0;
  border: none;
  padding: 0;
  background: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.sprite :deep(img) {
  height: 100%;
  max-width: 100%;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 8px 16px rgba(20, 60, 120, 0.2));
}
.sprite :deep(.placeholder) { height: 85%; }

.sprite-enter-active { transition: transform 0.25s ease-out, opacity 0.25s; }
.sprite-leave-active { transition: opacity 0.1s; }
.sprite-enter-from { transform: translateY(10px); opacity: 0.4; }
.sprite-leave-to { opacity: 0.6; }

.dialog {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 34%;
  padding: 1rem 1.5rem 1.4rem;
  background: linear-gradient(180deg, rgba(16, 28, 54, 0) 0%, rgba(16, 28, 54, 0.82) 22%, rgba(16, 28, 54, 0.92) 100%);
  color: #fff;
  cursor: pointer;
  user-select: none;
}
.nameplate {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.6rem 0 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  margin-bottom: 0.6rem;
}
.name { font-size: 1.35rem; font-weight: 900; }
.affiliation { font-size: 0.85rem; font-weight: 700; color: #7cc8ff; }
.text { margin: 0; font-size: 1.05rem; line-height: 1.65; min-height: 3.3em; }
.next {
  position: absolute;
  right: 1.4rem;
  bottom: 0.8rem;
  color: var(--ba-cyan);
  animation: bob 0.9s ease-in-out infinite;
}
@keyframes bob { 50% { transform: translateY(4px); } }
</style>
