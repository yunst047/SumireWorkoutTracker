# 💪 Sumire Workout Tracker

A Blue Archive–themed workout tracker. **Otohana Sumire**, head of Millennium Science School's Gym Training
Department, checks your BMI, logs your training, makes you rest and reports on your effort every week and month.

> ### ⚠️ Disclaimer — unofficial fan project, not for profit
> **Blue Archive** and all related characters, artwork, music and voice are © **NEXON Games Co., Ltd. / NEXON Korea
> Corp. / Yostar**. This is an unofficial, non-commercial fan project made without profit. It is **not affiliated
> with or endorsed by** Nexon or Yostar. All Blue Archive assets in this repository belong to their respective
> owners and are **not** covered by this project's license. If a rights holder requests removal, the assets will be
> taken down.

## Features

| | |
|---|---|
| **Body Check** | Enter height, weight and age. You get your BMI (WHO adult categories), a gauge, your healthy weight range, and Sumire's reaction. Under 18, adult categories aren't used. |
| **Training Log** | Log the workout type, time spent and calories burned. There's an optional calorie estimate from MET values. |
| **Cooldown** | After each workout you have to rest **as long as you trained** (30 min workout → 30 min cooldown) before logging again. The server enforces this; it isn't only a UI lock. |
| **Weekly / Monthly report** | At the end of each week (Mon–Sun) and month, Sumire shows a report card the next time you open the app: minutes, kcal, sessions, active days, a per-type breakdown, and the change vs. the previous period. Effort tiers follow the WHO guideline of 150 active minutes a week. |
| **Blue Archive feel** | "Touch to Start" title screen, VN-style dialog box with a typewriter effect, sprite expressions, looping BGM, voice lines, and slanted BA buttons. |

## Stack

- **client/**: Vue 3, Vite, Pinia, Vue Router
- **server/**: Express 5, SQLite (better-sqlite3). Single user, no login.
- Data is stored in `server/data/sumire.db`, which is gitignored.

## Run it

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev      # API on :3001 + Vite on http://localhost:5173
npm test         # server API tests + client unit tests
npm start        # build the client and serve everything from http://localhost:3001
```

## Assets

Put the files at these paths under `client/public/assets/sumire/`. **Any missing file is handled gracefully:** sprites
show a placeholder silhouette and missing audio stays silent, so the app works with none of them.
`client/src/data/assetManifest.js` is the single source of truth if you want to rename files.

| Path | Used for |
|---|---|
| `sprites/sumire_normal.png` | default expression |
| `sprites/sumire_happy.png` | happy / greeting / title screen |
| `sprites/sumire_proud.png` | workout logged, great report |
| `sprites/sumire_worried.png` | low BMI / high BMI / empty report |
| `sprites/sumire_surprised.png` | cooldown warning, overweight, under 18 |
| `bgm/theme.ogg` | looping background music |
| `voice/title.ogg`, `voice/greeting.ogg` | title / greeting |
| `voice/bmi_underweight.ogg`, `bmi_normal`, `bmi_overweight`, `bmi_obese`, `bmi_child` | BMI reactions |
| `voice/workout_logged.ogg`, `voice/cooldown.ogg` | training log |
| `voice/summary_great.ogg`, `summary_steady`, `summary_light`, `summary_none` | period reports |
| `voice/tap.ogg` | tapping Sumire |
| `ui/background.jpg` | stage / title background |
| `ui/logo.png` | optional title logo |

Use transparent PNGs for the sprites (full-body or knee-up standing art works best). The dialog lines in
`client/src/data/sumireLines.js` are original fan-written text and can be edited freely.

## API

| Method | Path | |
|---|---|---|
| GET/PUT | `/api/profile` | `{height_cm, weight_kg, age}` |
| GET | `/api/workouts?from&to` | newest first |
| POST | `/api/workouts` | `{type, minutes, calories}` → `201`, or `409 {nextAllowedAt}` during cooldown |
| DELETE | `/api/workouts/:id` | |
| GET | `/api/cooldown` | `{nextAllowedAt \| null}` |
| GET | `/api/summary?from&to&tz` | totals for a period |

## License

The source code is MIT-licensed (see [LICENSE](LICENSE)). **This does not include** any Blue Archive characters,
images, music, voice or other assets, which remain the property of NEXON Games / NEXON Korea / Yostar.
