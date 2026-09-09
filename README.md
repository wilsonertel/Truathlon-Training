# Olympic Triathlon Program — race Saturday July 10, 2027

A 43-week training plan (Mon Sep 14, 2026 → Sat Jul 10, 2027) for an Olympic-distance
triathlon (1500 m swim · 40 km bike · 10 km run), built for an all-round athlete:

- **Two full-body barbell days every week** (Monday and Thursday, never the day before the
  Saturday brick). Heavy linear progression in the fall, 4×4 strength over winter, heavy-and-brief
  plus jumps in spring, short maintenance through the peak, light in the taper.
- **Core / ab work throughout**: a finisher on both lift days, a 10-minute circuit on Wednesday,
  five minutes after Friday's run, and an optional Sunday mobility session.
- Three swims, two or three runs, two bikes, and a long ride + brick run every Saturday.
- Recovery every fourth week, five test weeks, nine checkpoints, a dress rehearsal three weeks out,
  and a two-week taper.

It ships as a small installable web app that works offline and tracks your progress:
tick off each session, log time / distance / RPE / notes and the weight on the bar,
record time trials, and watch weekly volume, strength and test results on the Progress page.

## Files

    index.html            page + styles
    plan.js               the plan: week table, session builders, strength program, reference text
    app.js                rendering, logging, storage, charts
    manifest.webmanifest  install metadata
    sw.js                 offline cache
    icon-*.png, apple-touch-icon.png

## Put it on your phone with GitHub Pages

GitHub Pages only works on a **public** repository unless the account is on a paid plan.
If Settings → Pages shows an upgrade notice instead of a branch picker, first go to
**Settings → General → Danger Zone → Change visibility → Make public**.

1. In this repo go to **Settings → Pages**. Under *Build and deployment* set *Source* to
   **Deploy from a branch**, pick the branch that holds the app and the **/ (root)** folder,
   and save.
2. After a minute the app is live at `https://<your-username>.github.io/Truathlon-Training/`.
3. **Android (Chrome):** open the URL → menu (⋮) → **Add to Home screen** → **Install**.
   **iPhone (Safari):** open the URL in Safari → Share → **Add to Home Screen**.

It opens without browser bars and works with no signal once it has loaded once.
You can also just open `index.html` from a folder on your computer; progress saves in that browser.

## Progress and backups

Progress saves to the browser storage for that site, so use the same install every time.
**Back up to a file** (top of the This-week section) writes a `.json` you can keep in Drive —
do it every phase or so. **Restore** reads it back, including onto a new phone.

## Changing the plan

Edit `plan.js`:

- The `W` table holds the numbers that change week to week (key run, long swim, Saturday
  ride, brick, Friday run, notes, checkpoints). Dates are computed from `START`.
- `liftSession()` holds the strength program by phase; `CORE` holds the finishers.
- `buildWeek()` decides which session goes on which day in each phase.

After any change, bump the `CACHE` name in `sw.js` (e.g. `tri-v5-1` → `tri-v5-2`) so installed
phones fetch the new version. Logged progress is stored separately and survives updates.

Quick sanity check that every week still builds:

    node -e "const P=require('./plan.js');for(let n=1;n<=43;n++)P.buildWeek(n);console.log('ok')"
