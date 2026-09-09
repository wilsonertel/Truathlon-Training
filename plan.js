/* ============================================================
   Olympic Triathlon — 43 week program · Sep 14 2026 → race Sat Jul 10 2027
   This file is the PLAN. app.js renders it and tracks progress.
   Editing rules of thumb:
     • Change numbers in the W table, not in the session builders.
     • Two barbell days every week (Mon + Thu). Never the day before Saturday.
     • Core ("abs") rides on both lift days, Wednesday, and Friday runs.
   ============================================================ */

const START = new Date(2026, 8, 14);          // Mon Sep 14 2026
const RACE  = new Date(2027, 6, 10);          // Sat Jul 10 2027
const NWEEKS = 43;
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const weekStart = n => new Date(START.getFullYear(), START.getMonth(), START.getDate() + (n-1)*7);
const fmtD = d => MON[d.getMonth()] + ' ' + d.getDate();
const dayDate = (n,i) => { const d = weekStart(n); d.setDate(d.getDate()+i); return d; };

/* ---------- 1. WEEK TABLE (the numbers that change) ----------
   kind: '' normal | 'rec' recovery | 'tst' test | 'big' key week
   run : Tuesday key run {k: easy|test|tempo|long|int|pickup, m: minutes, dsc}
   swim: long/continuous swim in yards · sat: Saturday ride minutes
   brick: run off the bike minutes · fri: Friday easy run minutes (0 = none) */
const W = [
 /* ---- Phase 1 · Foundation ---- */
 {n:1, kind:'',    run:{k:'easy',m:20}, swim:200, sat:55, brick:10, fri:0,
  note:'Week one. Everything feels awkward, and the weights should feel too light. Go slower than you want to.'},
 {n:2, kind:'tst', run:{k:'test',m:25,dsc:'1-mile time trial'}, swim:250, sat:58, brick:10, fri:0,
  note:'Baseline week: 1-mile run test Tuesday, 200 yd swim test Friday. Write everything down, including the weights you lifted.'},
 {n:3, kind:'',    run:{k:'easy',m:25}, swim:300, sat:60, brick:15, fri:0,
  note:'Your first swim lesson should have happened by now.'},
 {n:4, kind:'rec', run:{k:'easy',m:16}, swim:200, sat:40, brick:10, fri:0,
  note:'Recovery week. Same sessions, about a third shorter, nothing hard. Weights stay the same; sets drop.'},
 {n:5, kind:'',    run:{k:'easy',m:27}, swim:350, sat:65, brick:15, fri:20,
  note:'A second easy run joins the week on Friday.'},
 {n:6, kind:'',    run:{k:'easy',m:29}, swim:400, sat:68, brick:15, fri:20, note:''},
 {n:7, kind:'big', run:{k:'easy',m:32}, swim:450, sat:70, brick:15, fri:20,
  note:'Checkpoint week.', cp:'Nov 1 — swim 400 m (18 lengths) continuous, run 30 min nonstop, and squat at least your bodyweight on the bar for 5.'},
 {n:8, kind:'rec', run:{k:'easy',m:20}, swim:300, sat:45, brick:10, fri:15, note:'Recovery week.'},
 {n:9, kind:'',    run:{k:'easy',m:33}, swim:550, sat:72, brick:15, fri:20, note:''},
 {n:10,kind:'',    run:{k:'easy',m:35}, swim:700, sat:74, brick:15, fri:20,
  note:'Start shopping for the road bike if you don\'t already own one.'},
 {n:11,kind:'tst', run:{k:'test',m:40,dsc:'5K time trial'}, swim:875, sat:75, brick:15, fri:20,
  note:'Test week, and Thanksgiving is Thursday. Move the lift to Wednesday if you need to; the tests stay on separate days.',
  cp:'Nov 29 — swim 800 m (35 lengths) continuous, bike 75 min, run 35 min.'},
 {n:12,kind:'rec', run:{k:'easy',m:24}, swim:500, sat:50, brick:10, fri:15,
  note:'Recovery week. Register for the race by Dec 6 if you haven\'t.'},

 /* ---- Phase 2 · Build ---- */
 {n:13,kind:'',    run:{k:'tempo',m:40}, swim:900, sat:75, brick:15, fri:20,
  note:'New shape. Tuesday becomes the key run, Wednesday the threshold bike, Thursday the long swim. Barbell moves to 4 × 4.'},
 {n:14,kind:'',    run:{k:'long',m:45}, swim:1000, sat:78, brick:15, fri:20, note:'First long run.'},
 {n:15,kind:'',    run:{k:'tempo',m:40}, swim:1100, sat:80, brick:15, fri:25,
  note:'Christmas week. Shuffle days freely, but keep Saturday and both lifts.'},
 {n:16,kind:'rec', run:{k:'easy',m:30}, swim:800, sat:55, brick:12, fri:20,
  note:'Recovery week over New Year. Convenient.'},
 {n:17,kind:'',    run:{k:'tempo',m:40}, swim:1200, sat:82, brick:17, fri:25, note:''},
 {n:18,kind:'',    run:{k:'long',m:52}, swim:1300, sat:85, brick:17, fri:25, note:''},
 {n:19,kind:'big', run:{k:'tempo',m:42}, swim:1400, sat:88, brick:17, fri:25,
  note:'Checkpoint week.', cp:'Jan 24 — swim 1,200 yd continuous, ride 88 min, run 50 min, deadlift 1.5 × bodyweight for 3.'},
 {n:20,kind:'rec', run:{k:'easy',m:32}, swim:1000, sat:60, brick:12, fri:20, note:'Recovery week.'},
 {n:21,kind:'',    run:{k:'tempo',m:42}, swim:1500, sat:90, brick:20, fri:25,
  note:'Road bike bought and fitted by Feb 7 at the latest.', cp:'Feb 7 — road bike owned and professionally fitted.'},
 {n:22,kind:'',    run:{k:'long',m:60}, swim:1550, sat:92, brick:20, fri:25,
  note:'Saturday can move outdoors whenever it\'s above about 40°F and dry. Expect it to feel harder than the trainer.'},
 {n:23,kind:'tst', run:{k:'test',m:45,dsc:'5K time trial'}, swim:1650, sat:95, brick:20, fri:25,
  note:'All three time trials this week, on three different days. This is where your goal paces get set.',
  cp:'Feb 21 — swim 1500 m (66 lengths) continuous, ride 95 min, run 60 min. All three tests done, goal paces set.'},
 {n:24,kind:'rec', run:{k:'easy',m:35}, swim:1200, sat:60, brick:15, fri:20, note:'Recovery week.'},

 /* ---- Phase 3 · Race specific ---- */
 {n:25,kind:'',    run:{k:'int',m:45,dsc:'6 × 2 min at RPE 8, 2 min jog between'}, swim:1200, sat:100, brick:25, fri:30,
  note:'Move to maintenance calories now. Brick run goes to 25 min at goal pace. Barbell shifts to heavy-but-brief plus jumps.'},
 {n:26,kind:'',    run:{k:'long',m:60}, swim:1400, sat:100, brick:25, fri:30,
  note:'First transition rehearsal in the driveway this week.'},
 {n:27,kind:'big', run:{k:'int',m:45,dsc:'8 × 2 min at RPE 8, 2 min jog between'}, swim:1500, sat:105, brick:25, fri:30,
  note:'From this week on, fuel every brick exactly as you will on race day.',
  cp:'Mar 21 — 26-mile ride plus 25 min at goal pace, fuelled as on race day.'},
 {n:28,kind:'rec', run:{k:'easy',m:35}, swim:1000, sat:70, brick:15, fri:20, note:'Recovery week.'},
 {n:29,kind:'',    run:{k:'int',m:48,dsc:'5 × 3 min at RPE 8, 2 min jog between'}, swim:1500, sat:105, brick:25, fri:30, note:''},
 {n:30,kind:'',    run:{k:'long',m:65}, swim:1650, sat:108, brick:25, fri:30, note:''},
 {n:31,kind:'tst', run:{k:'test',m:45,dsc:'5K time trial'}, swim:1650, sat:110, brick:25, fri:30,
  note:'Re-test the 5K and the 400 yd swim; reset your paces. Second transition rehearsal.'},
 {n:32,kind:'rec', run:{k:'easy',m:35}, swim:1200, sat:70, brick:15, fri:20,
  note:'Recovery week. Buy or rent the wetsuit now if the race is likely to be wetsuit-legal.'},
 {n:33,kind:'',    run:{k:'int',m:50,dsc:'5 × 800 m at RPE 8, 90s jog between'}, swim:1650, sat:112, brick:30, fri:30, note:''},
 {n:34,kind:'',    run:{k:'long',m:70}, swim:1800, sat:115, brick:30, fri:30, note:'Longest run of the program.'},
 {n:35,kind:'big', run:{k:'int',m:52,dsc:'6 × 800 m at RPE 8, 90s jog between'}, swim:1800, sat:118, brick:30, fri:30,
  note:'Checkpoint week.', cp:'May 16 — 28-mile ride plus 30 min at goal pace, fuelled as on race day.'},
 {n:36,kind:'rec', run:{k:'easy',m:35}, swim:1200, sat:75, brick:15, fri:20,
  note:'Recovery week. First open-water swim once the water is above 60°F.'},

 /* ---- Phase 4 · Peak ---- */
 {n:37,kind:'',    run:{k:'int',m:52,dsc:'3 × 1 mile at RPE 7–8, 3 min jog between'}, swim:1800, sat:120, brick:30, fri:30,
  note:'Peak block. Swims move to open water where you can. Barbell drops to short maintenance.'},
 {n:38,kind:'tst', run:{k:'test',m:45,dsc:'5K time trial'}, swim:1800, sat:110, brick:30, fri:30,
  note:'Final 5K and 20-min bike test. Lock in race paces from these.'},
 {n:39,kind:'big', run:{k:'int',m:55,dsc:'4 × 1000 m at RPE 8, 2 min jog between'}, swim:2000, sat:120, brick:35, fri:30,
  note:'Biggest normal week of the program. Longest ride, longest brick.'},
 {n:40,kind:'big', run:{k:'easy',m:35}, swim:null, sat:null, brick:null, fri:0,
  note:'Dress rehearsal Saturday, three weeks out. Midweek is deliberately light to make room for it.',
  cp:'Jun 19 — full dress rehearsal: 1500 m swim, 25-mile ride, 4-mile run, in race kit, with race nutrition, at race start time.'},
 {n:41,kind:'',    run:{k:'int',m:45,dsc:'4 × 800 m at RPE 8, 90s jog between'}, swim:1500, sat:90, brick:20, fri:25,
  note:'Last full week. Fix whatever the rehearsal exposed.'},

 /* ---- Phase 5 · Taper ---- */
 {n:42,kind:'',    run:{k:'pickup',m:30}, swim:1000, sat:60, brick:15, fri:20,
  note:'Taper. Volume down about 40%, intensity stays. Lifts stay on the calendar but get light.',
  cp:'Jul 4 — both open-water swims done, and every piece of race gear used on at least one Saturday.'},
 {n:43,kind:'big', run:{k:'pickup',m:25}, swim:800, sat:20, brick:10, fri:0,
  note:'Race week. Short and sharp all week. Nothing new — no new food, no new gear, no new anything. Race is Saturday.'}
];

const PHASE = n => n<=12 ? 1 : n<=24 ? 2 : n<=36 ? 3 : n<=41 ? 4 : 5;
const PHASE_NAME = ['','Foundation','Build','Race specific','Peak','Taper'];
const isRec = n => W[n-1].kind === 'rec';
const r5 = m => Math.round(m/5)*5;
const scale = (m,n) => isRec(n) ? r5(m*0.67) : m;

/* ---------- 2. STRENGTH PROGRAM ----------
   ex: [name, sets, reps, note]. Sets drop on recovery weeks; the weight does not. */
const CORE = {
  A1:['Plank 3 × 45s','Dead bug 3 × 10 per side','Side plank 2 × 30s per side'],
  B1:['Hanging knee raise 3 × 10','Pallof press 2 × 10 per side','Bird dog 2 × 8 per side'],
  A2:['Ab wheel rollout (or plank walkout) 3 × 8','Copenhagen plank 2 × 20s per side','Hollow hold 3 × 30s'],
  B2:['Hanging leg raise 3 × 10','Farmer carry 3 × 40 m, heavy','Pallof press 3 × 10 per side'],
  A3:['Hollow hold 3 × 40s','Side plank with hip dip 2 × 10 per side','Dead bug 2 × 12 per side'],
  B3:['Hanging knee raise 3 × 12','Suitcase carry 3 × 30 m per side','Bird dog 2 × 10 per side'],
  short:['Plank 2 × 45s','Side plank 1 × 30s per side','Dead bug 2 × 10 per side']
};
const coreLines = (list,n) => ['Core finisher (8–10 min): ' + (isRec(n) ? list.map(s=>s.replace(/3 ×/,'2 ×')) : list).join(' · ')];

function liftSession(n, day){
  const p = PHASE(n), rec = isRec(n);
  const sets = (s) => rec ? Math.max(1, s-1) : s;
  let name, ex, why, dur, core;
  if (p === 1){
    if (day==='A'){
      name='Barbell A — squat & bench'; dur=50; core=CORE.A1;
      ex=[['Back squat',sets(3),5,'Add 10 lb each time you finish all reps cleanly'],
          ['Bench press',sets(3),5,'Add 5 lb each time'],
          ['Barbell row',sets(3),8,'Add 5 lb each time'],
          ['Romanian deadlift',2,8,'Moderate — this is a hamstring lesson, not a max']];
      why='Phase 1 is where strength is actually built. Linear progression: add weight every session you finish all reps with clean form. Miss a rep? Repeat that weight. Miss twice? Drop 10% and build back.';
    } else {
      name='Barbell B — deadlift & press'; dur=50; core=CORE.B1;
      ex=[['Deadlift',sets(3),5,'One top set; two back-off sets at 85% of it'],
          ['Overhead press',sets(3),5,'Add 5 lb each time — this one stalls first, that\'s normal'],
          ['Pull-up or lat pulldown',sets(3),8,'Assisted if needed; add weight when you get 3 × 8'],
          ['Bulgarian split squat',2,8,'Per leg. Bodyweight to start']];
      why='Thursday on purpose: never a barbell session the day before the Saturday brick. The single-leg work is what protects your knees when the run volume climbs.';
    }
  } else if (p === 2){
    if (day==='A'){
      name='Barbell A — strength'; dur=50; core=CORE.A2;
      ex=[['Back squat',sets(4),4,'RPE 8 — two reps left in the tank'],
          ['Bench press',sets(4),4,'RPE 8'],
          ['Weighted or assisted pull-up',3,6,''],
          ['Single-leg Romanian deadlift',2,8,'Per leg, dumbbells']];
      why='Heavier, fewer reps. You\'re converting Phase 1 muscle into usable strength. Move the bar fast on every rep; if speed drops, the set is over.';
    } else {
      name='Barbell B — strength'; dur=50; core=CORE.B2;
      ex=[['Deadlift',sets(3),3,'RPE 8'],
          ['Overhead press',sets(4),5,''],
          ['Dumbbell row',3,10,'Per side'],
          ['Reverse lunge',3,8,'Per leg, dumbbells or bar']];
      why='Progress by adding 5 lb when all sets hit RPE 8 or easier. This session is two days clear of Saturday, so go heavy — Friday is easy.';
    }
  } else if (p === 3){
    if (day==='A'){
      name='Barbell A — heavy & fast'; dur=40; core=CORE.A3;
      ex=[['Back squat',sets(3),3,'About 85% of your best 5 — heavy, crisp, no grinding'],
          ['Box jump',3,5,'Step down, never jump down. Full rest between sets'],
          ['Bench press',sets(3),5,'Same weight as Phase 2, one fewer set'],
          ['Pull-up',3,6,'']];
      why='Race-specific block: strength is held, not built. Low reps, full rests, in and out in 40 minutes. Jumps teach your legs to produce force quickly — that\'s free running economy.';
    } else {
      name='Barbell B — heavy & fast'; dur=40; core=CORE.B3;
      ex=[['Deadlift',sets(2),3,'About 85% — one crisp double, one triple'],
          ['Kettlebell swing',3,12,'Hips, not arms'],
          ['Overhead press',sets(3),5,''],
          ['Step-up',2,8,'Per leg, box at knee height, dumbbells']];
      why='Same day as the threshold bike. Ride first, lift after — or split morning and evening. Never lift before a hard ride.';
    }
  } else if (p === 4){
    if (day==='A'){
      name='Barbell A — maintenance'; dur=30; core=CORE.A3;
      ex=[['Back squat',2,5,'About 80% — same weight every week now'],
          ['Bench press',2,5,''],['Pull-up',2,6,''],['Box jump',2,5,'']];
      why='Peak block: the run and bike volume is at its highest, so the barbell gets brief. Same weight, fewer sets. Cutting load loses strength; cutting sets mostly doesn\'t.';
    } else {
      name='Barbell B — maintenance'; dur=30; core=CORE.B3;
      ex=[['Deadlift',1,3,'About 80%'],['Overhead press',2,5,''],
          ['Kettlebell swing',3,10,''],['Step-up',2,8,'Per leg']];
      why='Thirty minutes, done. If you feel wrecked from Wednesday, drop the deadlift and keep the rest.';
    }
  } else {
    if (n === 42){
      if (day==='A'){
        name='Barbell A — taper'; dur=25; core=CORE.short;
        ex=[['Back squat',2,3,'About 70% — fast and easy'],['Bench press',2,5,'Light'],['Pull-up',2,5,'']];
        why='Taper: keep the movement pattern, drop the load. You should leave feeling springy, not worked.';
      } else {
        name='Barbell B — taper'; dur=20; core=CORE.short;
        ex=[['Deadlift',1,3,'About 70%'],['Overhead press',2,5,'Light'],['Kettlebell swing',2,10,'']];
        why='Last barbell session with any weight on it. Nothing here should leave you sore.';
      }
    } else {
      if (day==='A'){
        name='Barbell — race week, light'; dur=20; core=CORE.short.slice(0,2);
        ex=[['Back squat',2,3,'About 60% — bar speed only'],['Overhead press',2,5,'Light'],['Pull-up',2,5,'']];
        why='Keeps the nervous system awake. Five days out, this cannot make you fitter, so keep it short.';
      } else {
        name='Activation — bodyweight & bands'; dur=15; core=['Plank 2 × 30s','Glute bridge 2 × 15'];
        ex=[['Bodyweight squat',2,10,''],['Band pull-apart',2,15,''],['Walking lunge',2,8,'Per leg'],['Push-up',2,10,'']];
        why='Second "lift" of race week is deliberately just movement. No load, no soreness, three days out.';
      }
    }
  }
  const steps = ['Warm up: 5 min easy cardio, then 2–3 progressively heavier sets of the first lift (those don\'t count)']
    .concat(ex.map(e => e[0] + ' ' + e[1] + ' × ' + e[2] + (e[3] ? ' — ' + e[3] : '')))
    .concat(coreLines(core, n));
  return {t:'l', name, dur:scale(dur,n), steps, why, ex};
}

function coreSession(n, mins){
  const p = PHASE(n);
  const circuit = p===1 ? ['Plank 40s','Dead bug 10 per side','Glute bridge 15','Side plank 25s per side','Bird dog 8 per side']
    : p===2 ? ['Hollow hold 30s','Mountain climbers 30s','Russian twist 20','Copenhagen plank 20s per side','Superman 12']
    : ['Ab wheel or plank walkout 8','Hanging knee raise 10','Side plank with hip dip 10 per side','Pallof press 10 per side','Back extension 12'];
  return {t:'c', name:'Core circuit', dur:mins, steps:[
    (mins>=10?'3':'2') + ' rounds, 45s rest between rounds:', ...circuit],
    why:'A strong trunk is what keeps your stroke long at 1200 m, your hips level at mile 5 and your back happy in the aero position. Ten minutes, no equipment needed.'};
}

/* ---------- 3. ENDURANCE SESSION BUILDERS ---------- */
const S = {
  swimTech: (n, drill, main) => ({t:'s', name:'Swim — technique', dur:scale(25,n), steps:[
    '200 easy freestyle, no clock — RPE 2',
    '6 × 50 as 25 ' + drill + ' / 25 swim, 20s rest',
    '4 × 25 six-kick switch, 20s rest',
    main || '4 × 50 steady, breathing every 3rd stroke, 25s rest — RPE 4',
    '100 easy cooldown, any stroke'],
    why:'Sixty to seventy percent drill work. Don\'t chase distance here — if you finish out of breath, you swam it instead of drilling it.'}),
  swimEasy: (n, mins) => ({t:'s', name:'Swim — easy and technical', dur:scale(mins,n), steps:[
    '200 easy freestyle', '6 × 50 as 25 drill of your choice / 25 swim, 20s rest',
    '4 × 50 steady, breathing every 3rd stroke', '100 easy cooldown'],
    why:'Keep a drill set in every short swim. Frequency is what teaches stroke mechanics.'}),
  swimCont: (n, yd, mins) => ({t:'s', name:'Swim — continuous', dur:scale(mins,n), steps:[
    '200 easy, then 4 × 50 drill of your choice, 15s rest',
    yd.toLocaleString() + ' yd straight through — RPE 4, breathing every 3rd stroke, turning at the wall without stopping',
    '100 easy cooldown'],
    why:'No intervals, no clock. This is the session that gets you to the 400 m, 800 m and 1500 m checkpoints. If you have to stop, stop, then note where: next week\'s job is five lengths past that point.'}),
  swimRace: (n, yd, ow) => ({t:'s', name:'Swim — race pace' + (ow?' (open water if possible)':''), dur:scale(35,n), steps:[
    '200 easy, then 4 × 50 drill, 15s rest',
    '6 × 100 at RPE 5–6, 20s rest — the effort you\'ll hold in the lake',
    'Then ' + yd.toLocaleString() + ' yd continuous at RPE 4, no wall stops' + (ow?', sighting every 6–8 strokes':''),
    '100 easy cooldown'],
    why:'Race-pace swimming should feel controlled, not hard. If you\'re gasping at 100, it\'s too fast for 1500.'}),
  swimTT: (n, yd) => ({t:'s', name:'Swim — ' + yd + ' yd time trial', dur:30, log:yd===200?'swim200':'swim400', steps:[
    '10 min easy warm-up with a few 25s building',
    yd + ' yd (' + (yd/25) + ' lengths) as steadily hard as you can hold — one effort, no stopping',
    'Log the time below. Divide by ' + (yd/100) + ' for your per-100 pace.',
    '200 easy cooldown'],
    why:'The result feeds the pace calculator and sets your race swim pace.'}),

  bikeCadence: n => ({t:'b', name:'Bike — cadence work (trainer)', dur:scale(45,n), steps:[
    '10 min easy spin, RPE 2–3',
    (isRec(n)?'6':'8') + ' × (1 min at 100+ rpm in an easy gear / 2 min at your natural cadence) — all at RPE 3–4',
    '10 min easy, last 5 at 90 rpm'],
    why:'Not about fitness. It teaches your legs to turn over fast without bouncing, which is what makes 40 km cost your quads less.'}),
  bikeThr2: n => ({t:'b', name:'Bike — threshold (trainer)', dur:scale(50,n), steps:[
    '10 min easy spin, raising cadence to 95 rpm',
    isRec(n) ? '3 × 5 min at RPE 4–5, 3 min easy between — recovery week, steady not hard'
             : '4 × 6 min at RPE 6–7, 3 min easy spinning between',
    '10 min easy cooldown'],
    why:'The single most productive bike session in the program. The last interval should feel like the first — if number three collapses, you started too hard. Aim for 85–95 rpm.'}),
  bikeThr3: n => ({t:'b', name:'Bike — threshold', dur:scale(45,n), steps:[
    '10 min easy spin, raising cadence to 95 rpm',
    isRec(n) ? '2 × 6 min at RPE 4–5, 4 min easy between — recovery week'
             : '3 × 8 min at RPE 6–7, 4 min easy between',
    '8 min easy cooldown'],
    why:'Honest but never RPE 8 — Saturday is the priority and this sits two days clear of it on purpose.'}),
  bikeTT: () => ({t:'b', name:'Bike — 20 min time trial (trainer)', dur:40, log:'bike20', steps:[
    '10 min progressive warm-up',
    '20 min at the hardest effort you could hold for exactly 20 minutes',
    'Log the distance (and average power if you have it)', '10 min easy cooldown'],
    why:'Your distance here tells you whether the bike is getting faster across the phases.'}),
  bikeLong: (n, mins, outdoor, raceFinish) => ({t:'b',
    name:'Bike — long ' + (outdoor?'ride (outdoors when you can)':'endurance (trainer)'), dur:mins, steps:[
    '10 min easy, building to RPE 4',
    raceFinish ? 'First two-thirds at RPE 4–5, last third at race effort (RPE 5)'
               : 'Steady at RPE 4–5 the whole way — flat or rolling, not hilly',
    'Eat something every 30 minutes and drink a bottle an hour, even in winter',
    '5 min easy spin to finish'],
    why:'Practise taking a hand off the bars to eat and drink on every ride. If you can\'t eat on the bike, you can\'t fuel a three-hour race.'}),
  bikeEasy: (n, mins) => ({t:'b', name:'Bike — easy spin', dur:mins, steps:[mins + ' min at RPE 2–3, legs turning over, nothing more'],
    why:'Deliberately light.'}),

  runEasy: (n, mins, core) => ({t:'r', name:'Run — easy', dur:mins + (core?5:0), steps:[
    mins + ' min at RPE 2–3 — full sentences the whole way'].concat(core ? ['Finish with 5 min of core: plank 45s, side plank 30s per side, dead bug 10 per side, twice through'] : []),
    why:'Almost everyone runs these too fast. If unsure, slow down another 30 seconds per mile. This is the aerobic base that carries the 10K.'}),
  runLong: (n, mins) => ({t:'r', name:'Run — long', dur:mins, steps:[
    mins + ' min continuous at RPE 2–3, conversational throughout',
    'Carry water if it\'s over 45 minutes'],
    why:'This is the session that makes the last 3 km of the race survivable. Never grow it more than 10 minutes at a time — the plan already handles that.'}),
  runTempo: (n, mins) => ({t:'r', name:'Run — tempo', dur:scale(mins,n), steps:[
    '10 min easy, RPE 2–3',
    (mins-25) + ' min at RPE 6–7 — a few words at a time, controlled and rhythmic',
    '10 min easy, then 5 min walk'],
    why:'The middle piece should feel hard but not a fight. If you\'re gasping, you\'ve turned it into an interval session.'}),
  runInt: (n, dsc, mins) => ({t:'r', name:'Run — intervals', dur:mins, steps:[
    '10 min easy warm-up with 4 × 20s strides — never start intervals cold', dsc, '5–10 min easy cooldown'],
    why:'Your one genuinely hard run of the week. Don\'t add a second one.'}),
  runTT: (n, dsc) => ({t:'r', name:'Run — ' + dsc, dur:scale(45,n), log:dsc==='1-mile time trial'?'runMile':'run5k', steps:[
    '10 min easy warm-up on a flat route',
    dsc === '1-mile time trial' ? '1 mile as hard as you can hold evenly'
                                : '5K (3.1 miles) as hard as you can hold evenly',
    'Log the finish time below', '5–10 min easy cooldown'],
    why:'The result feeds the pace calculator and resets your goal race-run pace.'}),
  runPickup: (n, mins) => ({t:'r', name:'Run — easy with pickups', dur:mins, steps:[
    mins + ' min easy at RPE 2–3',
    'Include 4 × 30-second pickups at race effort, 90s easy between'],
    why:'Taper rule: keep the intensity, cut the volume. Short and sharp arrives fast; easy and long arrives flat.'}),
  brick: (n, mins, goalPace) => ({t:'r', name:'Brick run — straight off the bike', dur:mins, steps:[
    'Transition in under 90 seconds — bike racked, helmet off, shoes on, race belt, hat, go',
    'First 5 min deliberately slower than feels right; shorten your stride and raise your cadence',
    goalPace ? 'Then hold goal race pace (RPE 6–7) for the rest' : 'Then settle into steady RPE 4'],
    why:'Your legs will feel like someone else\'s for the first five minutes. That\'s normal, that\'s the point, and it goes away with practice.'}),
  mobility: () => ({t:'m', name:'Mobility (optional)', dur:15, opt:true, steps:[
    'Hip flexor stretch 90s per side', 'Couch stretch 60s per side', 'Thoracic rotations 10 per side',
    'Calf stretch 60s per side', 'Foam roll quads, IT band, upper back', 'Ankle circles and wall ankle mobilisation'],
    why:'Sunday is a rest day. This doesn\'t count against that — it\'s fifteen minutes on the floor while you watch something.'}),
  rest: () => ({t:'x', name:'Rest', dur:0, steps:[], why:''})
};

/* ---------- 4. BUILD A WEEK ---------- */
function buildWeek(n){
  const w = W[n-1], p = PHASE(n), R = w.run;
  const runSess = () => {
    if (R.k==='test')   return S.runTT(n, R.dsc);
    if (R.k==='tempo')  return S.runTempo(n, R.m);
    if (R.k==='long')   return S.runLong(n, R.m);
    if (R.k==='int')    return S.runInt(n, R.dsc, R.m);
    if (R.k==='pickup') return S.runPickup(n, R.m);
    return S.runEasy(n, R.m, false);
  };
  const A = liftSession(n,'A'), B = liftSession(n,'B');
  const sun = [S.rest(), S.mobility()];
  const friRun = core => w.fri ? [S.runEasy(n, w.fri, core)] : [];

  if (n === 40) return [           /* dress rehearsal week */
    ['Mon',[A, S.swimEasy(n,20)]],
    ['Tue',[S.runEasy(n,35,false)]],
    ['Wed',[S.swimEasy(n,25), coreSession(n,10)]],
    ['Thu',[S.bikeEasy(n,30), B]],
    ['Fri',[S.rest()]],
    ['Sat',[
      {t:'s',name:'Dress rehearsal — swim',dur:40,steps:[
        '1500 m continuous — in the wetsuit if you have open water, otherwise 1,650 yd in the pool',
        'Race kit, race start time, everything exactly as it will be on the day'],
       why:'Whatever breaks today, you have three weeks to fix it.'},
      {t:'b',name:'Dress rehearsal — bike',dur:95,steps:[
        '25 miles at race effort (RPE 4–5)',
        'Full race nutrition on the clock — about 60 g of carbohydrate an hour',
        'Full T1 and T2 rehearsal either side'],
       why:'About 80% of race distance. You never do the full distance in training.'},
      {t:'r',name:'Dress rehearsal — run',dur:40,steps:[
        '4 miles at goal race pace off the bike',
        'Race belt, hat, and the shoes you will actually wear'],
       why:'Write down everything that annoyed you. Those are your next three weeks of fixes.'}]],
    ['Sun',sun]];

  if (n === 43) return [           /* race week — race is Saturday */
    ['Mon',[A, S.swimEasy(n,20)]],
    ['Tue',[S.runPickup(n,25)]],
    ['Wed',[B, {t:'s',name:'Swim — sharpener',dur:20,steps:[
        '800 yd total','200 easy, then 4 × 50 drill','4 × 50 at race pace, 30s rest','200 easy'],
       why:'Sharp, brief, then stop.'}]],
    ['Thu',[{t:'b',name:'Bike — sharpener',dur:30,steps:[
        '15 min easy','3 × 2 min at race effort, 3 min easy between','5 min easy'],
       why:'Last real ride. Confirm the bike is mechanically perfect while you\'re on it.'}]],
    ['Fri',[
      {t:'b',name:'Shakeout ride and gear check',dur:20,steps:[
        '20 min very easy — confirm nothing is loose, shifting is clean, tyres are good',
        'Lay every piece of race kit out and photograph the layout',
        'Pack the transition bag tonight, using the photo'],
       why:'This is a gear check, not training.'},
      {t:'r',name:'Shakeout jog',dur:10,steps:['10 min very easy with 2 × 20-second strides'],
       why:'Just keeps the legs awake.'}]],
    ['Sat',[{t:'r',name:'RACE DAY — Olympic triathlon',dur:0,race:true,steps:[
        'Eat 2½–3 hours before the start — something you\'ve eaten dozens of Saturdays',
        'Sip fluid until 45 minutes out, then stop',
        'Arrive early, set your spot up in the usual layout, count racks, walk swim-exit → rack → bike-out',
        'Warm up: 5–10 min easy jog with a few 20s pickups, then 3–5 min easy swim if allowed',
        'Swim controlled, bike at RPE 4–5 and eat on the clock, run the first mile slower than feels right'],
       why:'You will feel sluggish and slightly anxious all week. Everyone does. It is not a sign you\'ve lost fitness.'}]],
    ['Sun',[{t:'x',name:'Rest — you did it',dur:0,steps:[],why:''}]]];

  if (p === 1) return [
    ['Mon',[A]],
    ['Tue',[S.swimTech(n,'fingertip drag'), runSess()]],
    ['Wed',[n===11 ? S.bikeTT() : S.bikeCadence(n), coreSession(n, isRec(n)?8:10)]],
    ['Thu',[B, S.swimTech(n,'catch-up','200 steady, breathing every 3rd stroke — RPE 4')]],
    ['Fri',[w.kind==='tst' ? S.swimTT(n, n===2 ? 200 : 400) : S.swimCont(n, w.swim, 25)].concat(friRun(false))],
    ['Sat',[S.bikeLong(n, w.sat, false, false), S.brick(n, w.brick, false)]],
    ['Sun',sun]];

  if (p === 2) return [
    ['Mon',[A, S.swimEasy(n,20)]],
    ['Tue',[runSess()]],
    ['Wed',[n===23 ? S.bikeTT() : S.bikeThr2(n), coreSession(n, isRec(n)?8:10)]],
    ['Thu',[w.kind==='tst' ? S.swimTT(n,400) : S.swimCont(n, w.swim, 35), B]],
    ['Fri',friRun(true).concat([S.swimEasy(n,20)])],
    ['Sat',[S.bikeLong(n, w.sat, n>=22, n>=21), S.brick(n, w.brick, n>=21)]],
    ['Sun',sun]];

  if (p === 3 || p === 4) return [
    ['Mon',[A, S.swimEasy(n,20)]],
    ['Tue',[runSess()]],
    ['Wed',[w.kind==='tst' && n!==38 ? S.swimTT(n,400) : S.swimRace(n, w.swim, p===4), coreSession(n, isRec(n)?8:10)]],
    ['Thu',[n===38 ? S.bikeTT() : S.bikeThr3(n), B]],
    ['Fri',friRun(true).concat([S.swimEasy(n,20)])],
    ['Sat',[S.bikeLong(n, w.sat, true, true), S.brick(n, w.brick, true)]],
    ['Sun',sun]];

  /* week 42 — taper: phase 4 shape at ~60%, intensity kept */
  const trim = (sess, dur) => { sess.dur = dur; return sess; };
  return [
    ['Mon',[A, S.swimEasy(n,15)]],
    ['Tue',[S.runPickup(n, w.run.m)]],
    ['Wed',[trim(S.swimRace(n, w.swim, false),25), coreSession(n,6)]],
    ['Thu',[trim(S.bikeThr3(n),30), B]],
    ['Fri',[S.runEasy(n, w.fri, false)]],
    ['Sat',[S.bikeLong(n, w.sat, true, true),
      {t:'r',name:'Brick run — race effort finish',dur:w.brick,steps:[
        'Fast transition as usual','First 5 min easy, then last 10 min at race effort'],
       why:'Keep the intensity, cut the duration. That is the whole rule of tapering.'}]],
    ['Sun',sun]];
}

/* Weekly hours come from the sessions themselves (optional mobility excluded),
   so the summary can never disagree with the daily plan. */
W.forEach(w => {
  w.d = fmtD(weekStart(w.n));
  const mins = buildWeek(w.n).reduce((a,d)=>a + d[1].reduce((b,s)=>b+(s.opt?0:s.dur),0), 0);
  w.mins = mins;
  w.hrs = Math.round(mins/15)/4;
});

/* ---------- 5. REFERENCE CONTENT ---------- */
const RPE = [
 ['2–3','Easy · conversational','You can hold a full conversation in complete sentences. It should feel almost too slow. If you\'re breathing hard through your mouth, you\'re going too fast.','Most of your training lives here'],
 ['4–5','Steady','Short sentences only. Comfortable, but you\'re aware you\'re working. You could hold this for two hours.','Long Saturday rides · race-day bike effort'],
 ['6–7','Comfortably hard · threshold','A few words at a time. Uncomfortable but controlled — you could hold it about an hour if you had to.','Tempo runs · bike threshold · goal race-run pace'],
 ['8','Hard','One or two words. Breathing is loud. Sustainable maybe 20–30 minutes on a good day.','Run intervals · barbell working sets (two reps in reserve)'],
 ['9–10','Very hard','No talking. You\'re counting down the seconds.','Not used — you don\'t need it for an Olympic']
];

const TASKS = [
 ['Book 3–4 swim lessons','Within the next month','"Can swim but not far" is almost always a technique problem, not a fitness one — the highest-return item on this list. A coach fixing your head position and your exhale adds more distance in a month than 12 weeks of grinding laps. A masters group works too. Ask them to watch your breathing specifically.'],
 ['Find your starting weights','Week 1–2','Work up to a weight you could clearly do three more reps with on squat, bench, deadlift, press and row. Log them in the app — every later session builds on those numbers. Nobody cares what they are; they only need to go up.'],
 ['Buy or borrow a road bike','By February 7','A trainer covers you through winter, but you can\'t race on one, and bike handling is a skill you only build outside. A used road bike with clip-on aerobars runs $600–1,200, and a $75 bike fit is worth more than any upgrade.'],
 ['Pick the race and register','By December 6','Registering makes it real. Note whether the swim is a pool, lake or reservoir, and the expected water temperature — it decides your wetsuit plan. You\'ll need a USAT membership too, one-day or annual.'],
 ['Plan the fuelling switch','At Week 25 · March 1','Eat roughly at maintenance from Phase 3 on. Training hard while under-fuelled is how people get hurt in the last 15 weeks. Protein stays high the whole way (about 0.7–0.8 g per lb). If a Saturday session goes badly two weeks running, eat more before you train less.']
];

const PH = [
 {tag:'Phase 1 · Weeks 1–12 · Sep 14 – Dec 6', name:'Foundation',
  aim:'Learn to swim properly. Build an aerobic base that doesn\'t hurt. Lift the most you\'ll lift all year, because this is the only phase with room for real strength gains.',
  hrs:'5h → 6h per week',
  strip:[[['Barbell','50','l']],[['Swim','25','s'],['Run','20–35','r']],[['Bike','45','b'],['Core','10','c']],[['Barbell','50','l'],['Swim','25','s']],[['Swim','25','s'],['Run','20','r']],[['Bike','55–75','b'],['Run','15','r']],[['Rest','','x']]],
  bullets:[
   'Two full-body barbell days, Monday and Thursday, on linear progression: add weight every session you finish clean. This is where the strength gets built.',
   'Core finisher on both lift days, a 10-minute circuit on Wednesday, and a mobility session on Sunday if you want it.',
   'Three swims a week, 60–70% drill work on Tuesday and Thursday. Friday is the continuous swim — no intervals, no clock.',
   'Runs stay conversational. Tuesday grows 20 → 35 min; a second short easy run joins on Friday from Week 5.',
   'Bike is all trainer. Wednesday works cadence; Saturday is easy endurance growing 55 → 75 min, then a short run off the bike.',
   'Every fourth week is a recovery week: sets drop, distances shrink by a third, the weights stay the same.']},
 {tag:'Phase 2 · Weeks 13–24 · Dec 7 – Feb 28', name:'Build',
  aim:'Turn technique into endurance. Swim continuous for the first time, get the road bike underneath you, make bricks routine, and convert Phase 1 muscle into heavier lifts.',
  hrs:'6h → 7h per week',
  strip:[[['Barbell','50','l'],['Swim','20','s']],[['Run','40–60','r']],[['Bike','50','b'],['Core','10','c']],[['Swim','35','s'],['Barbell','50','l']],[['Run','25','r'],['Swim','20','s']],[['Bike','75–95','b'],['Run','17','r']],[['Rest','','x']]],
  bullets:[
   'Barbell moves to 4 × 4 at RPE 8 with single-leg accessories. Progress by adding 5 lb when every set feels like RPE 8 or easier.',
   'Tuesday alternates: odd weeks tempo, even weeks a long easy run growing 45 → 60 min.',
   'Thursday is the continuous swim, building 900 → 1,650 yd straight through, then the second lift.',
   'Wednesday\'s bike is your threshold session plus the core circuit, three days clear of Saturday on purpose.',
   'Friday: easy run with a 5-minute core finish, then an easy technical swim.',
   'Saturday can move outdoors from Week 22 once the bike is fitted and the weather allows.']},
 {tag:'Phase 3 · Weeks 25–36 · Mar 1 – May 23', name:'Race specific',
  aim:'Everything starts to look like race day. Race-pace efforts, open water, transitions, and the exact nutrition you\'ll use in July. Strength is held with heavy, brief sessions plus jumps.',
  hrs:'About 7h per week',
  strip:[[['Barbell','40','l'],['Swim','20','s']],[['Run','45–70','r']],[['Swim','35','s'],['Core','10','c']],[['Bike','45','b'],['Barbell','40','l']],[['Run','30','r'],['Swim','20','s']],[['Bike','100–118','b'],['Run','25–30','r']],[['Rest','','x']]],
  bullets:[
   'Barbell drops to 3 × 3 at about 85%, plus box jumps and kettlebell swings. Forty minutes, in and out. Strength is held, not built.',
   'Tuesday is your one genuinely hard run — intervals on odd weeks, long easy on even ones, up to 70 min.',
   'Wednesday\'s swim adds race-pace 100s; Thursday pairs the threshold bike with the second lift (ride first).',
   'Saturday brick is the centrepiece: ride, then 25–30 min at goal pace, fuelled exactly as on race day.',
   'Rehearse transitions four or five times in the driveway. Free minutes live here.',
   'First open-water swim in Week 36 once the water is above 60°F. Never swim open water alone.']},
 {tag:'Phase 4 · Weeks 37–41 · May 24 – Jun 27', name:'Peak',
  aim:'The biggest weeks of the year, then a full dress rehearsal three weeks out. The barbell goes brief so the legs have room.',
  hrs:'7h → 7½h, then the rehearsal',
  strip:[[['Barbell','30','l'],['Swim','20','s']],[['Run','45–55','r']],[['Swim','35','s'],['Core','10','c']],[['Bike','45','b'],['Barbell','30','l']],[['Run','30','r'],['Swim','20','s']],[['Bike','110–120','b'],['Run','30–35','r']],[['Rest','','x']]],
  bullets:[
   'Barbell: 2 × 5 at about 80%, same weight every week. Thirty minutes.',
   'Week 38 is the final test week: 5K and 20-minute bike. Race paces come from these.',
   'Week 39 is the biggest normal week — 2-hour ride, 35-minute brick at goal pace.',
   'Week 40 is the dress rehearsal: about 80% of race distance in race kit, with race nutrition, at race start time.',
   'Week 41 is the last full week. Fix whatever the rehearsal exposed.']},
 {tag:'Phase 5 · Weeks 42–43 · Jun 28 – Jul 10', name:'Taper',
  aim:'Fitness is already banked. The only job left is arriving fresh. Nothing you do in these two weeks can make you fitter; plenty of it can make you tired.',
  hrs:'4h → 2h across the two weeks',
  strip:[[['Barbell','20','l'],['Swim','20','s']],[['Run','25','r']],[['Activate','15','l'],['Swim','20','s']],[['Bike','30','b']],[['Bike','20','b'],['Run','10','r']],[['Race','','r']],[['Rest','','x']]],
  bullets:[
   'The strip above is race week; race is Saturday July 10. Week 42 keeps the Phase 4 shape at about 60% length.',
   'Keep intensity, cut volume. Short and sharp arrives fast; easy and long arrives flat.',
   'Both lifts stay on the calendar but go light: 70% in Week 42, 60% Monday of race week, and a bodyweight activation on Wednesday.',
   'Friday of race week is a shakeout and a full gear check, not training.',
   'No new food, no new gear, no new anything. Everything you use on Saturday should be something you\'ve already used on a Saturday.',
   'You will feel sluggish, heavy-legged and slightly anxious. Everyone does. Your body is repairing itself.']}
];

const LIB = [
 {t:'s', h:'Swim drills', s:'Do these in the first third of every swim · all at RPE 2–3', items:[
  ['Exhale underwater','Not a drill — the habit everything else depends on. Blow all your air out steadily through nose and mouth while your face is in the water, so that when you turn to breathe your only job is to inhale. Most adults hold their breath, then have to exhale and inhale in the same half-second, which is why they run out of air at 50 yards.','You should see a continuous stream of bubbles, and the exhale should feel slightly long, not rushed.'],
  ['Fingertip drag','Normal freestyle, except on the recovery — when your arm comes forward out of the water — drag your fingertips along the surface with your elbow high and pointed at the ceiling. Teaches a relaxed, high-elbow recovery and forces you to roll your body instead of swinging your arm around.','If your fingertips keep leaving the water, your elbow has dropped.'],
  ['Catch-up','One arm stays stretched out in front. The other pulls all the way through and comes forward to touch it before the first arm moves. Slows everything down and teaches you to hold a long body line instead of windmilling.','There should be a distinct pause with both hands out front on every stroke.'],
  ['Six-kick switch','Push off on your side — bottom arm forward, top arm at your hip, head looking at the bottom of the pool. Kick six times, take one stroke, roll to the other side. Teaches rotation and balance, which is where most beginner drag comes from.','If you\'re sinking, press your chest down slightly and look straight down, not forward.'],
  ['Breathing every 3rd stroke','Breathe right, three strokes later left, three later right. Keeps your stroke even and matters in open water when chop or sun is on one side. It feels awful for about two weeks, then it doesn\'t.',''],
  ['Sighting','Open-water only, from Phase 3. Every 6–8 strokes lift your eyes just above the waterline — eyes only, like an alligator — spot the buoy, then drop your face and roll to breathe on the next stroke. Practise in the pool by picking a spot on the far wall.','Without it you will swim a surprisingly long detour.']],
  foot:'Ask your coach to watch all six. A drill performed wrong just trains the wrong movement more efficiently, and you cannot see your own stroke.'},
 {t:'b', h:'Bike sessions', s:'Trainer through winter, then Saturday moves outside', items:[
  ['Cadence work','Cadence is pedal revolutions per minute. Alternate 1 min at 100+ rpm in an easy gear with 2 min at your natural cadence, 8 times, all at RPE 3–4. The goal isn\'t fitness, it\'s teaching your legs to spin smoothly without bouncing in the saddle.',''],
  ['Threshold intervals','Phase 2: 4 × 6 min at RPE 6–7 with 3 min easy. Phases 3–4: 3 × 8 min with 4 min easy. Pick a gear you can hold at 85–90 rpm without your form falling apart. The single most productive bike session in the program.','The last interval should feel like the first. If number three collapses, you started too hard.'],
  ['Long endurance ride','Saturday. RPE 4–5 throughout, except where a race-effort finish is called for. Flat or rolling routes, not hilly — you\'re building time in the saddle, not climbing legs. Eat every 30 minutes, drink a bottle an hour, even in winter.',''],
  ['Eating and drinking while moving','A real skill, and one people skip. On a quiet road: look ahead, take one hand off, drink, replace the bottle without looking down. Same with a gel — open it before you need it, pocket the wrapper.','If you can\'t eat on the bike, you can\'t fuel a three-hour race.']]},
 {t:'r', h:'Run sessions', s:'Two or three runs a week, and only one of them is hard', items:[
  ['Easy / conversational run','RPE 2–3, full sentences. Almost everyone runs these too fast. If unsure, slow down another 30 seconds per mile. Running them hard just makes you tired for the sessions that matter.',''],
  ['Long run','Every other Tuesday at easy pace, growing 45 → 70 min across Phases 2 and 3. Never grow it more than 10 minutes at a time, and never during a recovery week — the plan handles both.','This is the session that makes the last 3 km survivable.'],
  ['Tempo run','10 min easy, 15–17 min at RPE 6–7, 10 min easy. The middle piece should feel controlled and rhythmic — hard, but you\'re not fighting it.','If you\'re gasping, you\'ve turned it into an interval session.'],
  ['Intervals','Start at 6 × 2 min at RPE 8 with 2 min jog. Build toward 4 × 1000 m by Week 39. Always warm up 10 min with strides and cool down 5.','Intervals from cold is how calves get pulled.'],
  ['Brick run','The run immediately off the bike, with the shortest possible gap. First 5 minutes deliberately slower than feels right, then settle into goal pace. Shorten your stride and raise your cadence for that first stretch.','The first mile off the bike always feels wrong. The only cure is repetition.']]},
 {t:'l', h:'Barbell — the lifts', s:'Two full-body days every week · squat, hinge, push, pull, single-leg', items:[
  ['Back squat','Bar on the upper back, feet about shoulder width, toes slightly out. Sit between your hips, knees tracking over toes, until the crease of your hip is below the knee. Drive the floor away. Brace as if about to be punched before every rep.','Heels stay down and the bar path is a straight vertical line.'],
  ['Deadlift','Bar over mid-foot, shins to the bar, grip just outside the legs. Chest up, back flat, pull the slack out of the bar, then push the floor away — the bar stays in contact with your legs. Lock out by squeezing glutes, not leaning back.','If your back rounds, the weight is too heavy for today. Drop 10%.'],
  ['Bench press','Feet flat, shoulder blades pinched back and down, slight arch. Bar to the lower chest with elbows about 45° from the body, press back up over the shoulders. Always with a spotter or safety pins when going heavy.',''],
  ['Overhead press','Bar on the front of the shoulders, grip just outside shoulder width, glutes and abs tight. Press straight up, move your head back out of the way, finish with the bar over the middle of your foot. This lift stalls first — that\'s normal. Progress in 2.5 lb jumps if you can.',''],
  ['Barbell row / dumbbell row','Hinge to about 45°, back flat, pull the bar to the lower ribs, pause, lower under control. No heaving with the hips. Rows balance all the pressing and are what keeps your shoulders healthy through 2,000 yards of swimming a week.',''],
  ['Pull-up','Full hang to chin over the bar. Use a band or the assisted machine until you can do 3 × 8, then add weight. If you have no bar, lat pulldown is the substitute.',''],
  ['Single-leg work','Bulgarian split squat, reverse lunge, step-up, single-leg Romanian deadlift. Bodyweight to start, dumbbells later. These build the hip stability that stops your knees caving when you run tired — the most triathlon-relevant thing in the gym.','Both sides equal. If one side is weaker, start there and match the reps.'],
  ['Box jump & kettlebell swing','Phases 3–4 only. Box jump: land softly, knees over toes, step down — never jump down. Swing: hinge at the hips, snap them forward, arms are ropes. Both teach fast force production, which is running economy for free.','']]},
 {t:'l', h:'Barbell — how to progress', s:'Read this once, then just follow the numbers on the day', items:[
  ['Phase 1 — linear progression','Weeks 1–12. Squat, bench, deadlift, press and row all in the 3 × 5 / 3 × 8 range. Add 10 lb to squat and deadlift, 5 lb to press, bench and row, every session you complete every rep with clean form. Miss a rep? Repeat the weight. Miss twice? Drop 10% and build back.',''],
  ['Phase 2 — strength','Weeks 13–24. 4 × 4 at RPE 8 (two reps left in the tank). Add 5 lb when every set feels like RPE 8 or easier. Single-leg and carry work enters. This is the peak of your strength year.',''],
  ['Phases 3–4 — hold and sharpen','Weeks 25–41. Heavy but brief: 3 × 3 at about 85%, then 2 × 5 at about 80% in the peak block. Jumps and swings for power. Same weight week to week — the goal is to keep the strength you built while the endurance load peaks.',''],
  ['Taper','Weeks 42–43. Loads drop to 70% then 60%. The pattern stays; the effort goes away. A bodyweight activation replaces the second lift in race week.',''],
  ['Recovery weeks','Every fourth week the sets drop by one but the weight on the bar stays. Cutting load is what loses strength; cutting sets mostly doesn\'t.',''],
  ['The scheduling rules','Never a barbell session the day before Saturday. On Thursdays with a hard ride, ride first and lift after, or split morning and evening. If a lift feels off, cut it — in this program the endurance sessions are protected and the barbell bends.','']]},
 {t:'c', h:'Core & abs', s:'On both lift days, Wednesday, and Friday runs · never skipped, never long', items:[
  ['Plank family','Front plank, side plank, side plank with hip dip. Squeeze glutes, tuck the ribs, breathe. Stop the set when your hips sag, not when the timer ends.','Straight line from ear to ankle.'],
  ['Dead bug & bird dog','Slow, anti-rotation. Dead bug: back flat on the floor, opposite arm and leg extend, lower back never lifts. Bird dog: on hands and knees, opposite arm and leg reach, hips level. These are the swimming-and-running core, not the beach core.',''],
  ['Hollow hold','Lie on your back, lower back pressed into the floor, arms and legs raised. Bend the knees to make it easier. This is the swimming body line — practise it on land.',''],
  ['Hanging knee / leg raise','From a pull-up bar. Control the way down; no swinging. Knees first, straight legs once 3 × 12 knees is easy.',''],
  ['Pallof press & carries','Pallof: cable or band at chest height, press it straight out and resist the twist. Farmer and suitcase carries: heavy, walk tall, don\'t lean. Anti-rotation is what keeps your hips level when you run tired.',''],
  ['Copenhagen plank & ab wheel','Phase 2 on. Copenhagen: side plank with the top leg on a bench — adductors, which protect the groin on the bike. Ab wheel: from the knees, roll out only as far as you can keep your lower back flat.','']]}
];

const RLIB = [
 {t:'b', h:'Race fuelling', s:'Rehearse it on every Saturday from Week 27', items:[
  ['The target','About 60 g of carbohydrate per hour, starting 45 minutes into the bike. That\'s more than most people guess. One hour looks like two gels (about 22 g each) plus 16 oz of sports drink (about 15 g).',''],
  ['Simpler alternative','One bottle of concentrated drink mix at 40–60 g per bottle, plus one gel. Fewer wrappers, less chewing, easier to manage on the bike.',''],
  ['Fluid and timing','About one bottle an hour, more in July heat — plan on 1.5 bottles if it\'s over 80°F. Eat on the clock, not on feel. Nothing solid in the last 20 minutes of the bike.',''],
  ['On the run','Most people can\'t stomach much. Water at the aid stations and, if you want it, one gel around 20 minutes in.','Test that on a brick before you test it in a race.']]},
 {t:'s', h:'Open water', s:'Two sessions minimum · both done by July 4', items:[
  ['Never alone','Go with a group or have someone on shore watching. Wear a bright cap and tow a swim buoy.',''],
  ['Expect the gasp','Cold water on your face triggers a reflex that makes you breathe fast and shallow for the first minute or two. Wade in slowly, splash your face, and float for thirty seconds before you start swimming. It passes.','Knowing that it passes is most of the battle.'],
  ['Wetsuit or not','USAT permits wetsuits up to 78°F. A July race may or may not be wetsuit-legal — check last year\'s water temperature for your venue and rehearse both ways. If it\'s legal, two swims in the suit beforehand is a minimum. Practise getting it off fast, too.',''],
  ['Sighting','Every 6–8 strokes, and pick something tall and fixed behind the buoy — a tree, a building — because the buoy itself disappears in chop.','']]},
 {t:'r', h:'Transitions', s:'Rehearse in the driveway · 4–5 times before race day', items:[
  ['T1 — swim to bike','Wetsuit unzipped and pulled to your waist while you run in. Wetsuit off — step on the legs to pull your feet free. Sunglasses on. Helmet on and buckled before you touch the bike. Shoes on. Grab the bike by the saddle, run it to the mount line, get on after the line.','Under USAT rules the strap must be fastened from the moment you take the bike off the rack until after you rack it.'],
  ['T2 — bike to run','Dismount before the line. Run the bike to your rack and hang it. Helmet stays on and buckled until the bike is racked. Bike shoes off, running shoes on, race belt, hat, go.',''],
  ['Set your spot up identically every time','Towel down, shoes at the front, helmet upside-down on the bars with straps open, glasses inside the helmet, race belt on top of the shoes. Same order, same layout, every rehearsal.','On race day you\'ll be too adrenalised to think, and you want to be running a routine, not solving a problem.']]},
 {t:'r', h:'Race morning', s:'Rehearse this on the dress rehearsal Saturday too', items:[
  ['Eating','Eat 2½–3 hours before the start — something you\'ve eaten before dozens of Saturdays. Sip fluid until about 45 minutes out, then stop.',''],
  ['Arriving','Get to transition early, set your spot up in your usual layout, and walk the route from the swim exit to your rack, and from your rack to the bike-out gate.','Counting racks is how you find your bike when everything looks the same.'],
  ['Warming up','5–10 minutes of easy jogging with a few 20-second pickups, then, if the venue allows it, 3–5 minutes of easy swimming with a couple of harder 25s.',''],
  ['Heat','A July start means heat. Pre-cool with cold water on the neck, start the bike with a frozen bottle, and pour water on your head at every run aid station. Slow the first mile of the run more than you think you need to.','']]}
];

/* Time-trial definitions: what the log field asks for and how it feeds the pace calculator */
const TESTS = {
  swim200:{label:'200 yd swim',  unit:'mm:ss', kind:'time'},
  swim400:{label:'400 yd swim',  unit:'mm:ss', kind:'time'},
  runMile:{label:'1-mile run',   unit:'mm:ss', kind:'time'},
  run5k:  {label:'5K run',       unit:'mm:ss', kind:'time'},
  bike20: {label:'20-min bike',  unit:'miles', kind:'dist'}
};

if (typeof module !== 'undefined') module.exports = {W, buildWeek, PHASE, PHASE_NAME, START, RACE, NWEEKS, weekStart, dayDate, TESTS};
