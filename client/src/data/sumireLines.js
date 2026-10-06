// Original fan-written lines for Otohana Sumire (Millennium Science School,
// head of the Gym Training Department). `sprite` keys SPRITES, `voice` keys VOICES.
export const CHARACTER = {
  name: 'Sumire',
  fullName: 'Otohana Sumire',
  affiliation: 'Gym Training Department',
  school: 'Millennium Science School',
};

const line = (text, sprite = 'normal', voice = null) => ({ text, sprite, voice });

export const LINES = {
  title: [line('Sensei! Ready to train with the Gym Training Department?', 'happy', 'title')],

  greeting: [
    line("Welcome back, Sensei! Muscles don't build themselves, you know.", 'happy', 'greeting'),
    line("Let's start by checking your condition. Tell me your height, weight and age!"),
  ],
  greetingReturning: [
    line("Sensei! You came back to the gym. That's the spirit!", 'happy', 'greeting'),
    line('Log your training and I\'ll keep track of every drop of sweat.'),
  ],

  bmi: {
    underweight: (b) => [
      line(`Your BMI is ${b}... that's on the light side, Sensei.`, 'worried', 'bmi_underweight'),
      line("Eat properly — protein, rice, everything! Then we'll build strength together, step by step."),
    ],
    normal: (b) => [
      line(`BMI ${b}! A healthy range — excellent!`, 'happy', 'bmi_normal'),
      line("But healthy is just the starting line. Let's aim for strong next!", 'proud'),
    ],
    overweight: (b) => [
      line(`BMI ${b}. Slightly above the healthy range, Sensei.`, 'surprised', 'bmi_overweight'),
      line("No problem at all! Steady cardio and good sleep — I'll be your training partner.", 'happy'),
    ],
    obese: (b) => [
      line(`BMI ${b}... Sensei, your body is asking for some care.`, 'worried', 'bmi_obese'),
      line("Start small — walks count too! And please check in with a doctor. I'll cheer for every session.", 'normal'),
    ],
    child: (b) => [
      line(`Your BMI number is ${b}, but you're still growing!`, 'surprised', 'bmi_child'),
      line('Adult BMI categories don\'t apply under 18 — a BMI-for-age chart is the right tool. Stay active and eat well!'),
    ],
  },

  workoutLogged: (w) => [
    line(`${w.minutes} minutes of ${w.label}, ${w.calories} kcal burned! Nice work, Sensei!`, 'proud', 'workout_logged'),
    line(`Now rest for ${w.minutes} minutes. Recovery is part of training too!`),
  ],
  cooldown: (remaining) => [
    line(`Hold it, Sensei! Your muscles need rest — ${remaining} more.`, 'surprised', 'cooldown'),
  ],
  cooldownOver: [line("Rest time's over! Ready for the next set, Sensei?", 'happy')],

  summary: {
    great: (s) => [
      line(`${s.period} report! ${s.totalMinutes} minutes over ${s.sessions} sessions — that's Gym Training Department level!`, 'proud', 'summary_great'),
      line(`${s.totalCalories} kcal burned, ${s.activeDays} active days. I'm so proud of you, Sensei!`, 'happy'),
    ],
    steady: (s) => [
      line(`${s.period} report: ${s.totalMinutes} minutes, ${s.sessions} sessions. Steady progress!`, 'happy', 'summary_steady'),
      line(`${s.totalCalories} kcal burned. Push a little more and you'll hit 150 minutes a week!`),
    ],
    light: (s) => [
      line(`${s.period} report: ${s.totalMinutes} minutes across ${s.sessions} session${s.sessions === 1 ? '' : 's'}.`, 'normal', 'summary_light'),
      line("A start is a start! Let's build the habit — even short sessions add up.", 'happy'),
    ],
    none: (s) => [
      line(`${s.period} report... Sensei, there's nothing here!`, 'worried', 'summary_none'),
      line("It's fine — today is a new day. Shall we do a quick warm-up together?", 'normal'),
    ],
  },

  tap: [
    line('Hm? Want to feel my biceps, Sensei?', 'proud', 'tap'),
    line('Squats, push-ups, planks... which one shall we do first?', 'happy'),
    line('Remember to hydrate!', 'normal'),
  ],
};
