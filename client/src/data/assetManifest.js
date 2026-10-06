// Every Blue Archive asset the app looks for. Drop files at these paths under
// client/public/assets/sumire/. Anything missing falls back to a placeholder / silence.
// Blue Archive assets © NEXON Games / NEXON Korea / Yostar — see README disclaimer.
const BASE = `${import.meta.env.BASE_URL}assets/sumire/`;

export const SPRITES = {
  normal: 'sprites/sumire_normal.png',
  happy: 'sprites/sumire_happy.png',
  proud: 'sprites/sumire_proud.png',
  worried: 'sprites/sumire_worried.png',
  surprised: 'sprites/sumire_surprised.png',
};

export const BGM = {
  theme: 'bgm/theme.ogg',
};

export const VOICES = {
  title: 'voice/title.ogg',
  greeting: 'voice/greeting.ogg',
  bmi_underweight: 'voice/bmi_underweight.ogg',
  bmi_normal: 'voice/bmi_normal.ogg',
  bmi_overweight: 'voice/bmi_overweight.ogg',
  bmi_obese: 'voice/bmi_obese.ogg',
  bmi_child: 'voice/bmi_child.ogg',
  workout_logged: 'voice/workout_logged.ogg',
  cooldown: 'voice/cooldown.ogg',
  summary_great: 'voice/summary_great.ogg',
  summary_steady: 'voice/summary_steady.ogg',
  summary_light: 'voice/summary_light.ogg',
  summary_none: 'voice/summary_none.ogg',
  tap: 'voice/tap.ogg',
};

export const UI = {
  background: 'ui/background.jpg',
  logo: 'ui/logo.png',
};

export const assetUrl = (path) => (path ? BASE + path : null);
