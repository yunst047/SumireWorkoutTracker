import { defineStore } from 'pinia';
import { BGM, VOICES, assetUrl } from '../data/assetManifest.js';

const PREFS_KEY = 'sumire.audio';

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {};
  } catch {
    return {};
  }
}

// Audio elements live outside reactive state; missing files just stay silent.
let bgm = null;
let voice = null;

export const useAudioStore = defineStore('audio', {
  state: () => ({ bgmVolume: 0.4, voiceVolume: 0.9, muted: false, ...loadPrefs() }),

  actions: {
    persist() {
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(this.$state));
      } catch {
        /* storage unavailable — prefs just won't persist */
      }
      if (bgm) bgm.volume = this.muted ? 0 : this.bgmVolume;
      if (voice) voice.volume = this.muted ? 0 : this.voiceVolume;
    },

    // Must be called from a user gesture (the title screen tap) to satisfy autoplay rules.
    startBgm() {
      if (!bgm) {
        bgm = new Audio(assetUrl(BGM.theme));
        bgm.loop = true;
      }
      bgm.volume = this.muted ? 0 : this.bgmVolume;
      bgm.play().catch(() => {});
    },

    playVoice(key) {
      const src = assetUrl(VOICES[key]);
      if (!src) return;
      voice?.pause();
      voice = new Audio(src);
      voice.volume = this.muted ? 0 : this.voiceVolume;
      voice.play().catch(() => {});
    },

    toggleMute() {
      this.muted = !this.muted;
      this.persist();
    },
  },
});
