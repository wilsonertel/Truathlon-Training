/* ============================================================
   app.js — renders plan.js and tracks progress
   Storage keys (all inside one saved object):
     w{n}d{i}s{j}        true when a session is ticked off
     log:w{n}d{i}s{j}    {mins, dist, rpe, notes, lifts:{name:{w,r}}, tt}
     task{i}             setup checklist
   ============================================================ */
const $ = s => document.querySelector(s);
const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TNAME = {s:'Swim',b:'Bike',r:'Run',l:'Barbell',c:'Core',m:'Mobility',x:'Rest'};
const COLOR = {s:'swim',b:'bike',r:'run',l:'lift',c:'core',m:'mob',x:'rest'};
const DIST_UNIT = {s:'yd',b:'mi',r:'mi'};
const LIFT_KEYS = ['Back squat','Bench press','Deadlift','Overhead press'];
const LIFT_SHORT = {'Back squat':'Squat','Bench press':'Bench','Deadlift':'Deadlift','Overhead press':'Press'};
const sid = (n,i,j) => 'w'+n+'d'+i+'s'+j;
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let cur = 1;

/* ---------- 1. STORAGE ---------- */
const KEY = 'tri:v5';
let mem = {};
let layers = [];

function hasLocal(){
  try{
    if(typeof localStorage === 'undefined') return false;
    localStorage.setItem('tri:test','1'); localStorage.removeItem('tri:test');
    return true;
  }catch(e){ return false; }
}
async function loadState(){
  let loaded = null; layers = [];
  if(typeof window.storage !== 'undefined'){
    layers.push('app');
    try{ const r = await window.storage.get(KEY); if(r && r.value) loaded = JSON.parse(r.value); }catch(e){}
  }else if(hasLocal()){
    layers.push('browser');
    try{ const raw = localStorage.getItem(KEY); if(raw) loaded = JSON.parse(raw); }catch(e){}
  }
  if(!layers.length) layers.push('memory');
  mem = loaded && typeof loaded === 'object' ? loaded : {};
  return mem;
}
let saveTimer = null;
function saveState(){
  const json = JSON.stringify(mem);
  if(typeof window.storage !== 'undefined'){
    try{ window.storage.set(KEY, json).catch(()=>{}); }catch(e){}
  }else{
    try{ if(hasLocal()) localStorage.setItem(KEY, json); }catch(e){}
  }
  showStatus();
}
function showStatus(){
  const el = $('#saveState'); if(!el) return;
  const n = Object.keys(mem).filter(k=>!k.startsWith('log:') && !k.startsWith('task')).length;
  if(layers.includes('app') || layers.includes('browser')){
    const where = layers.includes('app') ? 'in Claude' : 'on this device';
    el.textContent = n ? 'Saved ' + where + ' · ' + n + ' sessions' : 'Saving ' + where;
    el.className = 'savestate ok';
  }else{
    el.textContent = 'Not saving — use Backup';
    el.className = 'savestate warn';
  }
}
function exportBackup(){
  const blob = new Blob([JSON.stringify({v:5, saved:new Date().toISOString(), data:mem}, null, 1)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'triathlon-progress-' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function importBackup(file){
  const fr = new FileReader();
  fr.onload = () => {
    try{
      const parsed = JSON.parse(fr.result);
      const data = parsed && parsed.data ? parsed.data : parsed;
      if(!data || typeof data !== 'object') throw new Error('bad file');
      mem = data; saveState(); refreshAll();
      alert('Progress restored.');
    }catch(e){ alert('That file could not be read. Pick the .json backup this program created.'); }
  };
  fr.readAsText(file);
}

/* ---------- 2. DATE HELPERS ---------- */
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
function weekIndexForToday(){
  const days = Math.floor((today() - START)/86400000);
  return Math.min(NWEEKS, Math.max(1, Math.floor(days/7)+1));
}
function todayPos(){                     // {n,i} or null when outside the plan
  const days = Math.floor((today() - START)/86400000);
  if(days < 0 || days >= NWEEKS*7) return null;
  return {n: Math.floor(days/7)+1, i: days%7};
}
const fmtDay = d => MON[d.getMonth()] + ' ' + d.getDate();

/* ---------- 3. SESSION ACCESS ---------- */
const weekCache = {};
function week(n){ return weekCache[n] || (weekCache[n] = buildWeek(n)); }
function countable(s){ return s.t !== 'x' && !s.opt; }
function doneMins(n,i,j,s){
  if(!mem[sid(n,i,j)]) return 0;
  const lg = mem['log:'+sid(n,i,j)];
  return lg && lg.mins ? +lg.mins : s.dur;
}
function weekStats(n){
  const st = {planned:0, done:0, sessions:0, doneSessions:0, by:{s:0,b:0,r:0,l:0,c:0}};
  week(n).forEach((d,i)=>d[1].forEach((s,j)=>{
    if(!countable(s)) return;
    st.planned += s.dur; st.sessions++;
    if(mem[sid(n,i,j)]){ st.doneSessions++; const m = doneMins(n,i,j,s); st.done += m; if(st.by[s.t]!==undefined) st.by[s.t] += m; }
  }));
  return st;
}

/* ---------- 4. TODAY CARD ---------- */
function renderToday(){
  const el = $('#today'); const pos = todayPos(); const t = today();
  if(!pos){
    const before = t < START;
    el.innerHTML = '<span class="tag">' + fmtDay(t) + '</span><div class="t">' + (before ? 'Plan starts Monday Sep 14' : 'The program is finished') + '</div>' +
      '<div class="m">' + (before ? 'Use the time to book swim lessons and find your starting weights. Week 1 is loaded below.' : 'Congratulations. Back up your log and keep it.') + '</div>';
    return;
  }
  const {n,i} = pos; const list = week(n)[i][1];
  const isRace = list.some(s=>s.race);
  const items = list.map((s,j)=>{
    if(s.t==='x') return '<li><span class="dcap" style="background:var(--rest)"></span>Rest day' + (list.length>1?' — mobility optional':'') + '</li>';
    if(s.opt) return '';
    const done = !!mem[sid(n,i,j)];
    return '<li class="' + (done?'done':'') + '"><span class="dcap" style="background:var(--' + COLOR[s.t] + ')"></span>' + esc(s.name) +
      '<span class="dur">' + (s.dur ? s.dur + ' min' : '') + '</span></li>';
  }).join('');
  el.innerHTML = '<span class="tag">Today · ' + DOW[i] + ' ' + fmtDay(t) + ' · Week ' + n + ' · ' + PHASE_NAME[PHASE(n)] + '</span>' +
    '<div class="t">' + (isRace ? 'Race day' : list[0].t==='x' ? 'Rest' : list.filter(s=>!s.opt).map(s=>TNAME[s.t]).join(' + ')) + '</div>' +
    '<div class="m">' + (isRace ? 'Everything is banked. Go enjoy it.' : (W[n-1].note || 'Steady week. Follow the sessions as written.')) + '</div>' +
    '<ul>' + items + '</ul>' +
    (cur!==n ? '<p style="margin:10px 0 0"><button class="btn sm" id="jumpToday">Open this week</button></p>' : '');
  const jb = $('#jumpToday'); if(jb) jb.onclick = ()=>{ renderWeek(n); };
}

/* ---------- 5. WEEK VIEW ---------- */
function logSummary(s, lg){
  if(!lg) return '';
  const bits = [];
  if(lg.mins) bits.push(lg.mins + ' min');
  if(lg.dist) bits.push(lg.dist + ' ' + (DIST_UNIT[s.t]||''));
  if(lg.rpe) bits.push('RPE ' + lg.rpe);
  if(lg.tt) bits.push(TESTS[s.log] ? TESTS[s.log].label + ' ' + lg.tt + (TESTS[s.log].kind==='dist'?' mi':'') : lg.tt);
  if(lg.lifts){
    LIFT_KEYS.forEach(k=>{ const e = lg.lifts[k]; if(e && e.w) bits.push(LIFT_SHORT[k] + ' ' + e.w + '×' + (e.r||'?')); });
  }
  if(lg.notes) bits.push('“' + lg.notes.slice(0,60) + (lg.notes.length>60?'…':'') + '”');
  return bits.length ? '<span class="logged">Logged: ' + esc(bits.join(' · ')) + '</span>' : '<span class="logged">Logged</span>';
}

function renderWeek(n){
  cur = n;
  const w = W[n-1], p = PHASE(n), days = week(n), pos = todayPos();
  $('#wkN').textContent = 'Week ' + n;
  $('#wkD').textContent = 'Week of ' + w.d + ' · Phase ' + p + ' · ' + PHASE_NAME[p];

  const pills = ['<span class="pill">' + w.hrs + ' hrs</span>'];
  if(w.kind==='rec') pills.push('<span class="pill rec">Recovery week</span>');
  if(w.kind==='tst') pills.push('<span class="pill test">Test week</span>');
  if(w.kind==='big' && n!==NWEEKS) pills.push('<span class="pill hot">Key week</span>');
  if(n===NWEEKS) pills.push('<span class="pill race">Race week</span>');
  if(w.swim) pills.push('<span class="pill">Long swim ' + w.swim.toLocaleString() + ' yd</span>');
  if(w.sat) pills.push('<span class="pill">Sat ride ' + w.sat + ' min</span>');
  pills.push('<span class="pill">Barbell ×2</span>');
  $('#wkMeta').innerHTML = pills.join('');
  $('#wkNote').textContent = w.note || 'Steady week. Follow the sessions as written.';
  $('#wkBanner').innerHTML = w.cp ? '<div class="banner"><b>Checkpoint</b><br>' + esc(w.cp) + '</div>' : '';

  $('#days').innerHTML = days.map((d,i) => {
    const dow = d[0], list = d[1], date = dayDate(n,i);
    const isToday = pos && pos.n===n && pos.i===i;
    const dowHtml = '<span class="dow">' + dow + '<small>' + fmtDay(date) + '</small></span>';
    if(list[0].t==='x'){
      const opt = list.find(s=>s.opt);
      return '<div class="day' + (isToday?' today-day':'') + '"><div class="day-head">' + dowHtml +
        '<div class="day-sum"><div class="t" style="color:var(--rest)">' + esc(list[0].name) + '</div>' +
        '<div class="m">Nothing required. This is part of the plan.</div></div></div>' +
        (opt ? '<div class="sess"><div class="bar m"></div><div class="sess-body"><div class="top"><h4>' + esc(opt.name) + '</h4><span class="dur">' + opt.dur + ' min</span></div>' +
          '<ol>' + opt.steps.map(x=>'<li>'+esc(x)+'</li>').join('') + '</ol><p class="why">' + esc(opt.why) + '</p></div></div>' : '') +
        '</div>';
    }
    const real = list.filter(countable);
    const tot = real.reduce((a,s)=>a+s.dur,0);
    const nDone = real.filter((s)=>mem[sid(n,i,list.indexOf(s))]).length;
    const allDone = real.length && nDone===real.length;
    const sum = real.map(s=>TNAME[s.t]).join(' + ');
    return '<div class="day' + (allDone?' done':'') + (isToday?' today-day':'') + '">' +
      '<div class="day-head">' + dowHtml +
      '<div class="day-sum"><div class="t">' + (list.some(s=>s.race) ? 'Race day' : sum) + '</div>' +
      '<div class="m">' + (tot ? tot + ' min planned' : 'Olympic distance') + (real.length>1 ? ' · ' + nDone + '/' + real.length + ' done' : '') + '</div></div></div>' +
      list.map((s,j) => {
        const key = sid(n,i,j), done = !!mem[key], lg = mem['log:'+key];
        return '<div class="sess' + (done?' done':'') + '"><div class="bar ' + s.t + '"></div><div class="sess-body">' +
          '<div class="top"><input type="checkbox" class="chk sess-chk" data-k="' + key + '"' + (done?' checked':'') + ' aria-label="Mark ' + esc(s.name) + ' complete">' +
          '<h4>' + esc(s.name) + '</h4><span class="dur">' + (s.dur ? s.dur + ' min' : '') + '</span></div>' +
          '<ol>' + s.steps.map(x=>'<li>'+esc(x)+'</li>').join('') + '</ol>' +
          (s.why ? '<p class="why">' + esc(s.why) + '</p>' : '') +
          '<div class="sess-foot"><button class="btn ghost sm log-btn" data-n="' + n + '" data-i="' + i + '" data-j="' + j + '">' + (lg ? 'Edit log' : 'Log') + '</button>' +
          logSummary(s, lg) + '</div></div></div>';
      }).join('') + '</div>';
  }).join('');

  const st = weekStats(n);
  $('#wkTotal').textContent = 'Planned: about ' + w.hrs + ' hours across 6 training days · done so far: ' + Math.round(st.done) + ' of ' + st.planned + ' min, ' + st.doneSessions + ' of ' + st.sessions + ' sessions.';
  $('#prev').disabled = n===1; $('#next').disabled = n===NWEEKS;
  document.querySelectorAll('#wkDots .dot').forEach(el=>el.classList.toggle('on', +el.dataset.n === n));
  const on = document.querySelector('#wkDots .dot.on');
  if(on && typeof on.scrollIntoView === 'function'){ try{ on.scrollIntoView({block:'nearest', inline:'center'}); }catch(e){} }
  document.querySelectorAll('#tbody tr[data-n]').forEach(tr=>tr.classList.toggle('now', tr.dataset.n===String(n)));
  updateProgress();
  renderToday();
}

function updateProgress(){
  let full = 0;
  for(let i=1;i<=NWEEKS;i++){
    const st = weekStats(i);
    const complete = st.sessions && st.doneSessions >= st.sessions;
    if(complete) full++;
    const dot = document.querySelector('#wkDots .dot[data-n="'+i+'"]');
    if(dot){ dot.classList.toggle('done', !!complete); dot.classList.toggle('part', !complete && st.doneSessions>0); }
  }
  $('#pTxt').textContent = full + ' of ' + NWEEKS + ' weeks logged';
  $('#pBar').style.width = (full/NWEEKS*100) + '%';
}

/* ---------- 6. LOG MODAL ---------- */
let modalCtx = null;
function lastLift(name, beforeN){
  for(let n=beforeN; n>=1; n--){
    for(let i=6;i>=0;i--) for(let j=3;j>=0;j--){
      const lg = mem['log:'+sid(n,i,j)];
      if(lg && lg.lifts && lg.lifts[name] && lg.lifts[name].w) return {n, ...lg.lifts[name]};
    }
  }
  return null;
}
function openLog(n,i,j){
  const s = week(n)[i][1][j]; const key = sid(n,i,j); const lg = mem['log:'+key] || {};
  modalCtx = {n,i,j,s,key};
  $('#mTitle').textContent = s.name;
  $('#mSub').textContent = 'Week ' + n + ' · ' + DOW[i] + ' ' + fmtDay(dayDate(n,i)) + ' · planned ' + (s.dur||0) + ' min';
  let html = '<div class="fields">';
  html += '<div class="field"><label for="f-mins">Minutes</label><input id="f-mins" type="number" inputmode="numeric" min="0" value="' + (lg.mins ?? s.dur ?? '') + '"></div>';
  if(DIST_UNIT[s.t]) html += '<div class="field"><label for="f-dist">Distance (' + DIST_UNIT[s.t] + ')</label><input id="f-dist" type="number" inputmode="decimal" step="any" min="0" value="' + (lg.dist ?? '') + '"></div>';
  html += '<div class="field"><label for="f-rpe">RPE (1–10)</label><input id="f-rpe" type="number" inputmode="numeric" min="1" max="10" value="' + (lg.rpe ?? '') + '"></div>';
  if(s.log && TESTS[s.log]){
    const T = TESTS[s.log];
    html += '<div class="field full"><label for="f-tt">' + T.label + ' result (' + T.unit + ')</label><input id="f-tt" type="text" inputmode="' + (T.kind==='time'?'numeric':'decimal') + '" placeholder="' + (T.kind==='time'?'mm:ss':'e.g. 6.4') + '" value="' + esc(lg.tt ?? '') + '"></div>';
  }
  html += '</div>';
  if(s.ex){
    html += '<div class="lifts"><div class="lift-hd"><span>Working set</span><span>Weight lb</span><span>Reps</span></div>';
    s.ex.forEach(e=>{
      const prev = (lg.lifts && lg.lifts[e[0]]) || null;
      const last = prev || lastLift(e[0], n) ;
      const hint = last && !prev ? 'last: ' + last.w + ' × ' + last.r + ' (wk ' + last.n + ')' : e[1] + ' × ' + e[2] + ' planned';
      html += '<div class="lift-row"><div class="nm">' + esc(e[0]) + '<small>' + esc(hint) + '</small></div>' +
        '<input type="number" inputmode="decimal" step="any" min="0" data-lift="' + esc(e[0]) + '" data-f="w" value="' + (prev ? prev.w : (last ? last.w : '')) + '" aria-label="' + esc(e[0]) + ' weight">' +
        '<input type="number" inputmode="numeric" min="0" data-lift="' + esc(e[0]) + '" data-f="r" value="' + (prev ? prev.r : e[2]) + '" aria-label="' + esc(e[0]) + ' reps"></div>';
    });
    html += '</div><p class="small" style="margin:-4px 0 12px">Enter your heaviest working set for each lift. Bodyweight moves can stay at 0.</p>';
  }
  html += '<div class="fields"><div class="field full"><label for="f-notes">Notes</label><textarea id="f-notes" placeholder="How it felt, what to change next time">' + esc(lg.notes ?? '') + '</textarea></div></div>';
  $('#mBody').innerHTML = html;
  $('#mDelete').style.display = mem['log:'+key] ? '' : 'none';
  $('#modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(()=>{ const f = $('#f-mins'); if(f) f.focus(); }, 50);
}
function closeLog(){ $('#modal').classList.remove('open'); document.body.style.overflow = ''; modalCtx = null; }
function saveLog(){
  if(!modalCtx) return;
  const {s,key} = modalCtx; const lg = {};
  const num = id => { const el = $(id); if(!el) return null; const v = parseFloat(el.value); return isNaN(v) ? null : v; };
  const mins = num('#f-mins'); if(mins!==null) lg.mins = mins;
  const dist = num('#f-dist'); if(dist!==null) lg.dist = dist;
  const rpe = num('#f-rpe'); if(rpe!==null) lg.rpe = Math.min(10, Math.max(1, rpe));
  const tt = $('#f-tt'); if(tt && tt.value.trim()) lg.tt = tt.value.trim();
  if(s.ex){
    lg.lifts = {};
    document.querySelectorAll('#mBody [data-lift]').forEach(inp=>{
      const nm = inp.dataset.lift; lg.lifts[nm] = lg.lifts[nm] || {};
      const v = parseFloat(inp.value); lg.lifts[nm][inp.dataset.f] = isNaN(v) ? 0 : v;
    });
    Object.keys(lg.lifts).forEach(k=>{ if(!lg.lifts[k].w && !lg.lifts[k].r) delete lg.lifts[k]; });
  }
  const notes = $('#f-notes'); if(notes && notes.value.trim()) lg.notes = notes.value.trim();
  mem['log:'+key] = lg; mem[key] = true;
  saveState(); closeLog(); refreshAll();
}
function deleteLog(){
  if(!modalCtx) return;
  delete mem['log:'+modalCtx.key];
  saveState(); closeLog(); refreshAll();
}

/* ---------- 7. PROGRESS: TILES, CHARTS, TABLES ---------- */
function allStats(){
  const rows = []; let done=0, planned=0, sessions=0, doneSessions=0, full=0;
  for(let n=1;n<=NWEEKS;n++){ const st = weekStats(n); st.n = n; rows.push(st);
    done += st.done; planned += st.planned; sessions += st.sessions; doneSessions += st.doneSessions;
    if(st.sessions && st.doneSessions>=st.sessions) full++; }
  return {rows, done, planned, sessions, doneSessions, full};
}
function streak(){
  // consecutive weeks, ending at the current/most recent started week, with every session done
  const pos = todayPos(); let n = pos ? pos.n : (today() < START ? 0 : NWEEKS);
  // don't count the in-progress week against the streak unless it is already complete
  let s = 0;
  for(; n>=1; n--){ const st = weekStats(n);
    if(st.sessions && st.doneSessions>=st.sessions) s++; else if(pos && n===pos.n && st.doneSessions>0) continue; else break; }
  return s;
}
function renderTiles(){
  const A = allStats(); const pos = todayPos();
  const elapsedWeeks = pos ? pos.n : (today() < START ? 0 : NWEEKS);
  const dueSoFar = A.rows.slice(0, elapsedWeeks).reduce((a,r)=>a+r.sessions,0);
  const doneSoFar = A.rows.slice(0, elapsedWeeks).reduce((a,r)=>a+r.doneSessions,0);
  const pct = dueSoFar ? Math.round(doneSoFar/dueSoFar*100) : 0;
  const lifts = A.rows.reduce((a,r)=>a + (r.by.l>0 ? 1 : 0), 0);
  const liftCount = (()=>{ let c=0; for(let n=1;n<=NWEEKS;n++) week(n).forEach((d,i)=>d[1].forEach((s,j)=>{ if(s.t==='l' && mem[sid(n,i,j)]) c++; })); return c; })();
  const tiles = [
    ['Hours trained', (A.done/60).toFixed(1), 'of ' + (A.planned/60).toFixed(0) + ' planned'],
    ['Sessions done', A.doneSessions, 'of ' + A.sessions + ' in the plan'],
    ['Consistency', elapsedWeeks ? pct + '%' : '—', elapsedWeeks ? 'of sessions due so far' : 'starts Sep 14'],
    ['Barbell sessions', liftCount, 'complete weeks in a row: ' + streak()]
  ];
  $('#tiles').innerHTML = tiles.map(t=>'<div class="tile"><p class="l">' + t[0] + '</p><div class="v">' + t[1] + '</div><div class="s">' + t[2] + '</div></div>').join('');
  void lifts;
}

/* SVG helpers */
const svgEl = (tag, attrs, inner) => { const a = Object.entries(attrs).map(([k,v])=>k+'="'+v+'"').join(' '); return '<'+tag+' '+a+'>'+(inner||'')+'</'+tag+'>'; };
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

function renderVolumeChart(){
  const A = allStats(); const rows = A.rows;
  const slot = 18, bw = 12, mL = 34, mR = 8, mT = 10, mB = 22, H = 200;
  const Wd = mL + mR + NWEEKS*slot;
  const maxM = Math.max(...rows.map(r=>Math.max(r.planned, r.done)), 60);
  const top = Math.ceil(maxM/60)*60;
  const y = m => mT + (H-mT-mB) * (1 - m/top);
  const order = ['s','b','r','l','c'];
  let g = '';
  // grid + axis
  for(let h=0; h<=top; h+=60){
    g += svgEl('line',{class:'g',x1:mL,x2:Wd-mR,y1:y(h),y2:y(h),stroke:css('--line'),'stroke-width':1});
    g += svgEl('text',{x:mL-6,y:y(h)+3,'text-anchor':'end',class:'ax'}, (h/60)+'h');
  }
  rows.forEach((r,idx)=>{
    const x = mL + idx*slot + (slot-bw)/2;
    // planned track
    g += svgEl('rect',{x, y:y(r.planned), width:bw, height:Math.max(0,y(0)-y(r.planned)), fill:css('--line'), rx:3});
    // done stack (2px surface gaps between segments)
    let acc = 0, segs = '';
    order.forEach(t=>{
      const m = r.by[t]; if(!m) return;
      const y0 = y(acc+m), h = y(acc) - y(acc+m);
      const gap = acc ? 2 : 0;
      segs += svgEl('rect',{x, y:y0, width:bw, height:Math.max(0,h-gap), fill:css('--'+COLOR[t])});
      acc += m;
    });
    g += segs;
    // hit target
    g += svgEl('rect',{x:mL+idx*slot, y:mT, width:slot, height:H-mT-mB, fill:'transparent', 'data-w':r.n, class:'hit'});
    if(r.n===1 || r.n%5===0) g += svgEl('text',{x:x+bw/2, y:H-6, 'text-anchor':'middle', class:'ax'}, 'W'+r.n);
  });
  // baseline
  g += svgEl('line',{x1:mL,x2:Wd-mR,y1:y(0),y2:y(0),stroke:css('--ink-3'),'stroke-width':1});
  $('#volSvg').innerHTML = '<svg width="' + Wd + '" height="' + H + '" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Weekly training minutes by discipline"><style>.ax{font-family:IBM Plex Mono,monospace;font-size:10px;fill:' + css('--ink-3') + '}</style>' + g + '</svg>';
  $('#volLegend').innerHTML = '<span><i class="track"></i>Planned</span>' + order.map(t=>'<span><i style="background:var(--' + COLOR[t] + ')"></i>' + TNAME[t] + '</span>').join('');
  // tooltip
  const tip = $('#volTip'), box = $('#volChart');
  const show = (e, wn) => {
    const r = rows[wn-1]; const w = W[wn-1];
    tip.innerHTML = '<b>Week ' + wn + ' · ' + w.d + '</b>' + Math.round(r.done) + ' of ' + r.planned + ' min · ' + r.doneSessions + '/' + r.sessions + ' sessions' +
      '<br>' + order.filter(t=>r.by[t]).map(t=>TNAME[t] + ' ' + Math.round(r.by[t])).join(' · ');
    tip.style.display = 'block';
    const bb = box.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - bb.left, py = (e.touches ? e.touches[0].clientY : e.clientY) - bb.top;
    tip.style.left = Math.max(8, Math.min(bb.width - tip.offsetWidth - 8, px + 12)) + 'px';
    tip.style.top = Math.max(8, py - tip.offsetHeight - 12) + 'px';
  };
  box.querySelectorAll('.hit').forEach(h=>{
    h.addEventListener('mousemove', e=>show(e,+h.dataset.w));
    h.addEventListener('touchstart', e=>show(e,+h.dataset.w), {passive:true});
    h.addEventListener('mouseleave', ()=>tip.style.display='none');
  });
  box.addEventListener('touchend', ()=>setTimeout(()=>tip.style.display='none', 1500), {passive:true});
  // scroll to current week
  const sc = $('#volSvg'); const pos = todayPos();
  if(pos) sc.scrollLeft = Math.max(0, mL + (pos.n-1)*slot - sc.clientWidth/2);
}

function liftSeries(){
  const series = {}; LIFT_KEYS.forEach(k=>series[k]=[]);
  for(let n=1;n<=NWEEKS;n++){
    const best = {};
    week(n).forEach((d,i)=>d[1].forEach((s,j)=>{
      const lg = mem['log:'+sid(n,i,j)]; if(!lg || !lg.lifts) return;
      LIFT_KEYS.forEach(k=>{ const e = lg.lifts[k]; if(e && e.w>0) best[k] = Math.max(best[k]||0, e.w); });
    }));
    LIFT_KEYS.forEach(k=>{ if(best[k]) series[k].push({n, w:best[k]}); });
  }
  return series;
}
const LIFT_COLORS = {'Back squat':'--lift','Bench press':'--swim','Deadlift':'--run','Overhead press':'--bike'};
function renderLiftChart(){
  const series = liftSeries(); const box = $('#liftChart'), tip = $('#liftTip');
  const any = LIFT_KEYS.some(k=>series[k].length);
  if(!any){ $('#liftSvg').innerHTML = '<p class="empty">No lifts logged yet. Tap Log on a barbell session and enter the weight for each lift.</p>'; $('#liftLegend').innerHTML=''; return; }
  const slot = 18, mL = 38, mR = 70, mT = 12, mB = 22, H = 220;
  const Wd = mL + mR + NWEEKS*slot;
  const all = LIFT_KEYS.flatMap(k=>series[k].map(p=>p.w));
  const top = Math.ceil((Math.max(...all)*1.1)/50)*50 || 100;
  const y = w => mT + (H-mT-mB)*(1 - w/top), x = n => mL + (n-1)*slot + slot/2;
  let g = '';
  const step = top >= 400 ? 100 : 50;
  for(let v=0; v<=top; v+=step){ g += svgEl('line',{x1:mL,x2:Wd-mR,y1:y(v),y2:y(v),stroke:css('--line')}); g += svgEl('text',{x:mL-6,y:y(v)+3,'text-anchor':'end',class:'ax'}, v); }
  for(let n=1;n<=NWEEKS;n+=5) g += svgEl('text',{x:x(n),y:H-6,'text-anchor':'middle',class:'ax'}, 'W'+n);
  const surface = css('--card') || '#fff';
  LIFT_KEYS.forEach(k=>{
    const pts = series[k]; if(!pts.length) return; const col = css(LIFT_COLORS[k]);
    if(pts.length>1) g += svgEl('polyline',{points:pts.map(p=>x(p.n)+','+y(p.w)).join(' '), fill:'none', stroke:col, 'stroke-width':2, 'stroke-linejoin':'round','stroke-linecap':'round'});
    pts.forEach(p=>{ g += svgEl('circle',{cx:x(p.n),cy:y(p.w),r:5,fill:col,stroke:surface,'stroke-width':2,'data-k':k,'data-n':p.n,'data-w':p.w,class:'pt'}); });
    const last = pts[pts.length-1];
    g += svgEl('text',{x:x(last.n)+9,y:y(last.w)+4,class:'ax lbl'}, LIFT_SHORT[k] + ' ' + last.w);
  });
  $('#liftSvg').innerHTML = '<svg width="' + Wd + '" height="' + H + '" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Heaviest logged set per lift by week"><style>.ax{font-family:IBM Plex Mono,monospace;font-size:10px;fill:' + css('--ink-3') + '}.lbl{fill:' + css('--ink-2') + '}</style>' + g + '</svg>';
  $('#liftLegend').innerHTML = LIFT_KEYS.filter(k=>series[k].length).map(k=>'<span><i style="background:var(' + LIFT_COLORS[k] + ')"></i>' + k + '</span>').join('');
  const show = (e, el) => {
    tip.innerHTML = '<b>Week ' + el.dataset.n + ' · ' + W[el.dataset.n-1].d + '</b>' + el.dataset.k + ' ' + el.dataset.w + ' lb';
    tip.style.display = 'block';
    const bb = box.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - bb.left, py = (e.touches ? e.touches[0].clientY : e.clientY) - bb.top;
    tip.style.left = Math.max(8, Math.min(bb.width - tip.offsetWidth - 8, px + 12)) + 'px';
    tip.style.top = Math.max(8, py - tip.offsetHeight - 12) + 'px';
  };
  box.querySelectorAll('.pt').forEach(p=>{
    p.addEventListener('mousemove', e=>show(e,p));
    p.addEventListener('touchstart', e=>show(e,p), {passive:true});
    p.addEventListener('mouseleave', ()=>tip.style.display='none');
  });
  box.addEventListener('touchend', ()=>setTimeout(()=>tip.style.display='none', 1500), {passive:true});
  const sc = $('#liftSvg'); const pos = todayPos();
  if(pos) sc.scrollLeft = Math.max(0, mL + (pos.n-1)*slot - sc.clientWidth/2);
}

function renderTTTable(){
  const rows = [];
  for(let n=1;n<=NWEEKS;n++) week(n).forEach((d,i)=>d[1].forEach((s,j)=>{
    const lg = mem['log:'+sid(n,i,j)]; if(!lg || !lg.tt || !s.log) return;
    const T = TESTS[s.log]; let pace = '—';
    if(T.kind==='time'){ const sec = parseT(lg.tt);
      if(sec){ if(s.log==='swim400') pace = fmt(sec/4) + ' /100 yd'; else if(s.log==='swim200') pace = fmt(sec/2) + ' /100 yd';
        else if(s.log==='run5k') pace = fmt(sec/3.107) + ' /mi'; else pace = fmt(sec) + ' /mi'; } }
    else { const mi = parseFloat(lg.tt); if(!isNaN(mi)) pace = (mi*3).toFixed(1) + ' mph'; }
    rows.push('<tr><td class="wk">' + n + '</td><td>' + T.label + '</td><td class="mono">' + esc(lg.tt) + (T.kind==='dist'?' mi':'') + '</td><td class="mono">' + pace + '</td></tr>');
  }));
  $('#ttTable tbody').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="4" class="empty">No tests logged yet. The first is the 1-mile run in Week 2.</td></tr>';
}
function renderVolTable(){
  const A = allStats();
  $('#volTable tbody').innerHTML = A.rows.map(r=>'<tr class="' + W[r.n-1].kind + '"><td class="wk">' + r.n + '</td><td>' + W[r.n-1].d + '</td><td class="num">' + r.planned + '</td><td class="num">' + Math.round(r.done) + '</td><td class="num">' + r.doneSessions + '/' + r.sessions + '</td>' +
    ['s','b','r','l','c'].map(t=>'<td class="num">' + (r.by[t] ? Math.round(r.by[t]) : '—') + '</td>').join('') + '</tr>').join('');
}
function latestTest(key){
  let out = null;
  for(let n=1;n<=NWEEKS;n++) week(n).forEach((d,i)=>d[1].forEach((s,j)=>{ const lg = mem['log:'+sid(n,i,j)]; if(lg && lg.tt && s.log===key) out = lg.tt; }));
  return out;
}
function renderProgress(){ renderTiles(); renderVolumeChart(); renderLiftChart(); renderTTTable(); renderVolTable(); }

function refreshAll(){
  document.querySelectorAll('.task .chk').forEach(c=>{ const on = !!mem[c.dataset.k]; c.checked = on; c.closest('.task').classList.toggle('done', on); });
  renderWeek(cur); renderProgress(); fillCalcFromTests(); calc();
}

/* ---------- 8. STATIC SECTIONS ---------- */
$('#wkDots').innerHTML = W.map(w =>
  '<button class="dot' + (w.kind==='rec'?' rc':'') + '" data-n="' + w.n + '" title="Week ' + w.n + ' · ' + w.d + '">' + w.n + '</button>').join('');

const HDRS = {1:'Phase 1 · Foundation · lifts heavy, linear progression · long swim Friday',
  13:'Phase 2 · Build · lifts 4 × 4 · long swim Thursday · Tuesday alternates tempo and long',
  25:'Phase 3 · Race specific · lifts 3 × 3 + jumps · race-pace swim Wednesday · Tuesday alternates intervals and long',
  37:'Phase 4 · Peak · lifts 2 × 5 maintenance · open water where possible',
  42:'Phase 5 · Taper · lifts light'};
const liftTxt = n => { const p = PHASE(n); return n===43 ? 'light + activation' : n===42 ? '70%' : p===1 ? '3×5 linear' : p===2 ? '4×4 RPE 8' : p===3 ? '3×3 + jumps' : '2×5 hold'; };
$('#tbody').innerHTML = W.map(w=>{
  const h = HDRS[w.n] ? '<tr class="phdr"><td colspan="9">'+HDRS[w.n]+'</td></tr>' : '';
  const runTxt = w.run.k==='test' ? 'Test · '+w.run.dsc
    : w.run.k==='tempo' ? 'tempo '+w.run.m
    : w.run.k==='long' ? 'long '+w.run.m
    : w.run.k==='int' ? w.run.dsc.split(' at ')[0]
    : w.run.k==='pickup' ? w.run.m+' w/ pickups'
    : (w.kind==='rec'?'easy ':'')+w.run.m+' min';
  return h + '<tr class="'+w.kind+'" data-n="'+w.n+'">' +
    '<td class="wk">'+w.n+'</td><td>'+w.d+'</td><td>'+runTxt+'</td>' +
    '<td>'+(w.swim?w.swim.toLocaleString()+' yd':'—')+'</td>' +
    '<td>'+(w.sat?w.sat:'rehearsal')+'</td><td>'+(w.brick?w.brick:'—')+'</td><td>'+liftTxt(w.n)+'</td>' +
    '<td>'+w.hrs+'</td><td>'+(w.cp?'<b>'+esc(w.cp)+'</b> ':'')+esc(w.note||'')+'</td></tr>';
}).join('');

$('#rpe').innerHTML = RPE.map(r=>'<div class="rpe-row"><div class="rpe-n"><b>'+r[0]+'</b><span>RPE</span></div>'+
  '<div class="rpe-d"><h4>'+r[1]+'</h4><p>'+r[2]+'</p><span class="use">'+r[3]+'</span></div></div>').join('');

$('#tasks').innerHTML = TASKS.map((t,i)=>
 '<div class="task" id="task'+i+'"><div class="box"><input type="checkbox" class="chk" data-k="task'+i+'" aria-label="'+esc(t[0])+'"></div>'+
 '<div class="body"><h3>'+t[0]+'</h3><p>'+t[2]+'</p><span class="due">'+t[1]+'</span></div></div>').join('');

$('#phases').innerHTML = PH.map(p=>
 '<div class="phase"><div class="phase-head"><span class="tag">'+p.tag+'</span>'+
 '<h3>'+p.name+'</h3><p class="aim">'+p.aim+'</p><div class="hours">'+p.hrs+'</div></div>'+
 '<div class="strip">'+p.strip.map((day,i)=>'<div class="sday"><div class="h">'+DOW[i]+'</div>'+
   day.map(c=>'<div class="chip c-'+c[2]+'"><span class="n">'+c[0]+'</span>'+(c[1]?'<span class="t">'+c[1]+'</span>':'')+'</div>').join('')+
   '</div>').join('')+'</div>'+
 '<div class="detail"><ul>'+p.bullets.map(b=>'<li>'+b+'</li>').join('')+'</ul></div></div>').join('');

function accordion(g){
  return '<details class="acc"><summary><div><h3><span class="dcap" style="background:var(--'+COLOR[g.t]+
   ')"></span>'+g.h+'</h3><span class="sub">'+g.s+'</span></div><span class="caret">›</span></summary>'+
   '<div class="acc-body">'+g.items.map(i=>'<h4>'+i[0]+'</h4><p>'+i[1]+'</p>'+
   (i[2]?'<p class="check">Check: '+i[2]+'</p>':'')).join('')+
   (g.foot?'<p class="check" style="margin-top:12px">'+g.foot+'</p>':'')+'</div></details>';
}
$('#lib').innerHTML = LIB.map(accordion).join('');
$('#raceLib').innerHTML = RLIB.map(accordion).join('');
$('#cps').innerHTML = W.filter(w=>w.cp).map(w=>{
  const parts = w.cp.split(' — ');
  return '<div class="cp"><div class="when">Week '+w.n+' · '+parts[0]+'</div><p>'+esc(parts.slice(1).join(' — '))+'</p></div>';
}).join('');

/* ---------- 9. PACE CALCULATOR ---------- */
function parseT(s){
  const p = String(s).trim().split(':').map(Number);
  if(p.length===2 && p.every(x=>!isNaN(x))) return p[0]*60+p[1];
  if(p.length===1 && p[0] && !isNaN(p[0])) return p[0]*60;
  return null;
}
function fmt(sec){
  if(sec===null||!isFinite(sec)) return '—';
  const m = Math.floor(sec/60), s = Math.round(sec%60);
  return m+':'+String(s).padStart(2,'0');
}
function fillCalcFromTests(){
  const sw = latestTest('swim400'), rn = latestTest('run5k');
  if(sw && parseT(sw)) $('#sw').value = sw;
  if(rn && parseT(rn)) $('#rn').value = rn;
}
function calc(){
  const sw = parseT($('#sw').value), rn = parseT($('#rn').value);
  const rows = [];
  if(sw){
    const per100 = sw/4;
    rows.push(['Swim test pace', fmt(per100)+' / 100 yd']);
    rows.push(['Race swim pace', fmt(per100+5)+'–'+fmt(per100+8)+' / 100', 1]);
    rows.push(['Projected 1500 m swim', fmt((per100+6.5)*16.5)]);
  }
  if(rn){
    const perMi = rn/3.107;
    rows.push(['5K pace', fmt(perMi)+' / mile']);
    rows.push(['Goal race-run pace', fmt(perMi+45)+'–'+fmt(perMi+60)+' / mile', 1]);
    rows.push(['Projected 10K off the bike', fmt((perMi+52)*6.214)]);
  }
  if(!rows.length) rows.push(['Enter a time as mm:ss','—']);
  $('#calcOut').innerHTML = rows.map(r=>'<div'+(r[2]?' class="hi"':'')+'><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
}

/* ---------- 10. EVENTS ---------- */
$('#sw').addEventListener('input', calc);
$('#rn').addEventListener('input', calc);
$('#prev').onclick = ()=>renderWeek(Math.max(1,cur-1));
$('#next').onclick = ()=>renderWeek(Math.min(NWEEKS,cur+1));
$('#wkDots').addEventListener('click', e=>{ const b = e.target.closest('.dot'); if(b) renderWeek(+b.dataset.n); });
document.addEventListener('change', e=>{
  const c = e.target.closest('.chk'); if(!c) return;
  if(c.checked) mem[c.dataset.k] = true; else delete mem[c.dataset.k];
  const task = c.closest('.task'); if(task) task.classList.toggle('done', c.checked);
  saveState();
  if(c.classList.contains('sess-chk')){ renderWeek(cur); renderProgress(); }
});
document.addEventListener('click', e=>{
  const b = e.target.closest('.log-btn'); if(!b) return;
  openLog(+b.dataset.n, +b.dataset.i, +b.dataset.j);
});
$('#mCancel').onclick = closeLog;
$('#mSave').onclick = saveLog;
$('#mDelete').onclick = ()=>{ if(confirm('Delete this log entry? The session stays ticked.')) deleteLog(); };
$('#modal').addEventListener('click', e=>{ if(e.target===$('#modal')) closeLog(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && modalCtx) closeLog(); });
$('#reset').onclick = ()=>{
  if(!confirm('Clear every logged session, log entry and setup task? This cannot be undone. Back up first if unsure.')) return;
  mem = {}; saveState(); refreshAll();
};
$('#backup').onclick = exportBackup;
$('#restore').onclick = ()=>$('#restoreFile').click();
$('#restoreFile').addEventListener('change', e=>{ if(e.target.files && e.target.files[0]) importBackup(e.target.files[0]); e.target.value=''; });
document.querySelectorAll('#tbody tr[data-n]').forEach(tr=>{
  tr.style.cursor='pointer';
  tr.onclick = ()=>{ renderWeek(+tr.dataset.n); document.getElementById('thisweek').scrollIntoView(); };
});
if(typeof IntersectionObserver === 'function'){
  const obs = new IntersectionObserver(es=>{
    es.forEach(en=>{ if(en.isIntersecting){
      document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('on', a.getAttribute('href')==='#'+en.target.id));
    }});
  },{rootMargin:'-60px 0px -70% 0px'});
  document.querySelectorAll('section[id]').forEach(s=>obs.observe(s));
}

/* ---------- 11. BOOT ---------- */
(function countdown(){
  const days = Math.round((RACE - today())/86400000);
  $('#cdDays').textContent = days > 0 ? days : days === 0 ? 'Today' : 'Done';
  if(days===0) $('#cdDays').nextElementSibling.textContent = 'race day';
  if(days<0) $('#cdDays').nextElementSibling.textContent = 'race complete';
})();
loadState().then(()=>{
  refreshAll();
  renderWeek(weekIndexForToday());
  showStatus();
});

/* ---------- 12. INSTALLABLE APP ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(()=>{}); });
}
