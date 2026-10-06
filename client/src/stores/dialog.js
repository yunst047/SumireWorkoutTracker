import { defineStore } from 'pinia';
import { useAudioStore } from './audio.js';

export const useDialogStore = defineStore('dialog', {
  state: () => ({ lines: [], index: 0, sprite: 'normal' }),

  getters: {
    current: (s) => s.lines[s.index] ?? null,
    hasNext: (s) => s.index < s.lines.length - 1,
  },

  actions: {
    say(lines) {
      this.lines = lines;
      this.index = 0;
      this.show();
    },

    advance() {
      if (!this.hasNext) return false;
      this.index++;
      this.show();
      return true;
    },

    show() {
      const l = this.current;
      if (!l) return;
      this.sprite = l.sprite ?? this.sprite;
      if (l.voice) useAudioStore().playVoice(l.voice);
    },
  },
});
