/* Workout Tracker PWA — single-user, offline-first, localStorage. */
'use strict';

const DB_KEY = 'workout.v1';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_SLOTS_FALLBACK = 6;

let PLAN = null;
let db = loadDB();
let view = { tab: 'today', week: null, dayIdx: null, foodTab: 'check', histEx: null };
let player = null;   // {week, dayIdx, steps, i}
let timer = null;    // {mode:'rest'|'work', remain, total, int, next}

/* ================= storage ================= */
function loadDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB(); }
  catch { return defaultDB(); }
}
function defaultDB() {
  return { startDate: null, lifts: {}, endurance: [], meals: {}, bodyweight: [],
           restOverrides: {}, doneSets: {}, sessionsDone: {} };
}
function save() {
  db._updated = new Date().toISOString();
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  schedulePush();
}

/* ---- server sync (dashboard DB via /api/fitness/state) ---- */
let pushT = null;
function schedulePush() {
  clearTimeout(pushT);
  pushT = setTimeout(pushState, 1500);
}
function pushState() {
  fetch('/api/fitness/state', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: JSON.stringify(db) }),
  }).then(r => { if (r.ok) db._synced = true; }).catch(() => {});
}
function pullState() {
  return fetch('/api/fitness/state', { credentials: 'same-origin' })
    .then(r => r.ok ? r.json() : null)
    .then(res => {
      if (!res || !res.data) return;
      let remote;
      try { remote = JSON.parse(res.data); } catch { return; }
      const localT = db._updated || '';
      const remoteT = remote._updated || '';
      if (remoteT > localT) {
        db = Object.assign(defaultDB(), remote);
        localStorage.setItem(DB_KEY, JSON.stringify(db));
      } else if (localT > remoteT && db.startDate) {
        schedulePush();
      }
    }).catch(() => {});
}

/* ================= dates / program position ================= */
function todayISO() { const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function parseISO(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function programPos(dateStr) {
  const start = parseISO(db.startDate);
  const d = dateStr ? parseISO(dateStr) : parseISO(todayISO());
  let days = Math.floor((d - start) / 86400000);
  if (days < 0) days = 0;
  const max = PLAN.meta.totalWeeks * 7 - 1;
  if (days > max) days = max;
  return { week: Math.floor(days / 7) + 1, dayIdx: days % 7 };
}
function dateForPos(week, dayIdx) {
  const start = parseISO(db.startDate);
  const d = new Date(start.getTime() + ((week-1)*7 + dayIdx) * 86400000);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function fmtDate(iso) { return parseISO(iso).toLocaleDateString(undefined, {month:'short', day:'numeric'}); }

/* ================= plan resolution ================= */
function phaseFor(week) { return PLAN.phases.find(p => week >= p.weeks[0] && week <= p.weeks[1]); }
function runRuckFor(week) { return PLAN.runRuck.find(r => r.week === week); }
function resolveWeekly(item, week) {
  for (const v of item.variants) if (v.weeks && week >= v.weeks[0] && week <= v.weeks[1]) return v;
  const parity = week % 2 ? 'odd' : 'even';
  for (const v of item.variants) if (v.parity === parity) return v;
  for (const v of item.variants) if (v.parity === 'default') return v;
  return null;
}
function sessionFor(week, dayIdx) {
  const phase = phaseFor(week);
  const day = phase.days[dayIdx];
  const rr = runRuckFor(week);
  const items = [];
  for (const it of day.items) {
    if (it.kind === 'weekly') {
      const v = resolveWeekly(it, week);
      if (v) items.push({ kind: 'target', text: v.text });
    } else items.push(it);
  }
  const t = (day.title || '').toUpperCase();
  let type = 'lift';
  if (dayIdx === 6) type = 'rest';
  else if (t.includes('RUCK') && !t.includes('RUN')) type = 'ruck';
  else if (t.includes('RUN') && !t.includes('STRENGTH')) type = 'run';
  // Sat phase-4 alternates; detect from resolved target text
  if (dayIdx === 5) {
    const tt = items.filter(i => i.kind === 'target').map(i => i.text.toUpperCase()).join(' ');
    type = tt.includes('RUCK') ? 'ruck' : 'run';
  }
  return { phase, day, rr, items, type, week, dayIdx };
}
function liftItems(sess) {
  return sess.items.filter(i => i.kind === 'exercise' && i.sets &&
    (i.type === 'reps' || i.type === 'time' || i.type === 'max' || i.type === 'distance'));
}

/* ================= logging helpers ================= */
function lastLift(name) {
  const recs = db.lifts[name];
  return recs && recs.length ? recs[recs.length-1] : null;
}
function logSet(name, week, setIdx, entry) {
  const date = dateForPos(week, player ? player.dayIdx : 0);
  if (!db.lifts[name]) db.lifts[name] = [];
  let rec = db.lifts[name].find(r => r.date === date);
  if (!rec) { rec = { date, week, sets: [] }; db.lifts[name].push(rec); }
  rec.sets[setIdx] = entry;
  save();
}
function setDoneKey(week, dayIdx) { return week + ':' + dayIdx; }

/* ================= sounds / haptics ================= */
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.2;
    o.start(); o.stop(ctx.currentTime + 0.35);
    setTimeout(() => ctx.close(), 600);
  } catch {}
  if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
}

/* ================= render root ================= */
const $ = s => document.querySelector(s);
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; }
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function render() {
  if (!db.startDate) { $('#setup').classList.remove('hidden'); return; }
  $('#setup').classList.add('hidden');
  if (view.week == null) { const p = programPos(); view.week = p.week; view.dayIdx = p.dayIdx; }
  const phase = phaseFor(view.week);
  const rr = runRuckFor(view.week);
  const phaseShort = phase.name.split(':')[0].replace(/PHASE (\d) - /, 'P$1 · ').trim();
  let badges = '';
  if (rr) {
    if (rr.benchmark) badges += ' <span class="badge benchmark">BENCHMARK</span>';
    else if (rr.taper) badges += ' <span class="badge taper">TAPER</span>';
    else if (rr.deload) badges += ' <span class="badge deload">DELOAD</span>';
  }
  $('#week-label').innerHTML = `Week ${view.week} · ${esc(phaseShort)}${badges}`;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === view.tab));
  const main = $('#main');
  main.innerHTML = '';
  if (view.tab === 'today') renderToday(main);
  else if (view.tab === 'plan') renderPlan(main);
  else if (view.tab === 'food') renderFood(main);
  else renderHistory(main);
}

/* ================= TODAY ================= */
function renderToday(main) {
  const sess = sessionFor(view.week, view.dayIdx);
  const date = dateForPos(view.week, view.dayIdx);
  const isToday = date === todayISO();
  const nav = h(`<div class="day-nav">
    <button id="nav-prev">‹</button>
    <div class="day-title"><b>${sess.day.day}${isToday ? ' · Today' : ''}</b>
      <span>${fmtDate(date)} · Week ${view.week}</span></div>
    <button id="nav-next">›</button>
  </div>`);
  main.append(nav);
  $('#nav-prev').onclick = () => { shiftDay(-1); };
  $('#nav-next').onclick = () => { shiftDay(1); };
  if (!isToday) {
    const b = h(`<button class="btn ghost" style="margin-bottom:12px;color:var(--accent)">↩ Back to today</button>`);
    b.querySelector('button').onclick = () => { const p = programPos(); view.week = p.week; view.dayIdx = p.dayIdx; render(); };
    main.append(b);
  }

  const head = h(`<div class="card session-head">
    <h2>${esc(sess.day.title)}</h2>
    <div class="muted">${sess.day.duration ? '~' + esc(sess.day.duration).replace(/^~/, '') : ''}</div>
  </div>`);
  main.append(head);

  // endurance target card
  if (sess.type === 'run' || sess.type === 'ruck') renderEndurance(main, sess);

  // exercise list + guided start
  const lifts = liftItems(sess);
  const others = sess.items.filter(i => !lifts.includes(i));
  if (sess.items.length) {
    const doneKey = setDoneKey(view.week, view.dayIdx);
    const doneSets = db.doneSets[doneKey] || {};
    let listHTML = '';
    for (const it of sess.items) {
      if (it.kind === 'exercise') {
        const done = lifts.includes(it) && (doneSets[it.name] || 0) >= (it.sets || 1);
        listHTML += `<div class="ex-item ${done ? 'done' : ''}"><span class="nm">${esc(it.name)}</span><span class="rx">${esc(it.raw)}</span></div>`;
      } else if (it.kind === 'target' && sess.type === 'lift') {
        listHTML += `<div class="ex-item hl"><span class="nm">▶ ${esc(it.text)}</span></div>`;
      } else if (it.kind === 'note') {
        listHTML += `<div class="ex-item"><span class="nm muted">${esc(it.raw)}</span></div>`;
      }
    }
    const card = h(`<div class="card"><h3>Session</h3>${listHTML}</div>`);
    main.append(card);
  }

  if (lifts.length && sess.type !== 'rest') {
    const done = db.sessionsDone[setDoneKey(view.week, view.dayIdx)];
    const b = h(`<button class="btn primary big" id="start-workout">${done ? '✓ Done — restart workout' : 'Start workout'}</button>`);
    main.append(b);
    $('#start-workout').onclick = () => startPlayer(sess);
  }

  // Sunday: mobility routine
  if (view.dayIdx === 6) renderMobilityCard(main);

  if (sess.day.notes) main.append(h(`<div class="card"><h3>Coach notes</h3><div class="notes-block">${esc(sess.day.notes)}</div></div>`));
}

function shiftDay(dir) {
  let d = view.dayIdx + dir, w = view.week;
  if (d < 0) { d = 6; w--; } if (d > 6) { d = 0; w++; }
  if (w < 1 || w > PLAN.meta.totalWeeks) return;
  view.week = w; view.dayIdx = d; render();
}

function renderMobilityCard(main) {
  const sun = PLAN.mobility.find(r => r.name.toLowerCase().includes('sunday')) || PLAN.mobility[PLAN.mobility.length-1];
  let rows = '';
  for (const ex of sun.exercises)
    rows += `<div class="ex-item"><span class="nm">${esc(ex.name)}</span><span class="rx">${esc(ex.sets || '')} · ${esc(ex.duration || '')}</span></div>`;
  main.append(h(`<div class="card"><h3>${esc(sun.name)}</h3>${rows}</div>`));
}

/* ---- endurance ---- */
function enduranceTargets(sess) {
  const rr = sess.rr || {};
  const targets = sess.items.filter(i => i.kind === 'target').map(i => i.text);
  let line = targets[0] || '';
  let goalPaceSec = null, goalLabel = '';
  if (sess.type === 'ruck') {
    // benchmark: total-time target like "sub-3:15" over 12 mi
    const bm = line.match(/(\d+)[\s-]*MI.*sub[- ]?(\d+):(\d+)/i);
    if (bm) {
      const mi = +bm[1], tot = (+bm[2])*60 + (+bm[3]);
      goalPaceSec = tot * 60 / mi;
      goalLabel = `sub-${bm[2]}:${bm[3]} total (${fmtPace(goalPaceSec)})`;
    } else { goalPaceSec = 15*60; goalLabel = 'sub-15:00/mi'; }
  }
  return { line, extra: targets.slice(1), goalPaceSec, goalLabel,
           weekRun: rr.runMiles, keyRun: rr.keyRun, ruckMi: rr.ruckMiles, ruckWt: rr.ruckWeight };
}
function fmtPace(sec) {
  const m = Math.floor(sec/60), s = Math.round(sec%60);
  return m + ':' + String(s).padStart(2,'0') + '/mi';
}
function renderEndurance(main, sess) {
  const t = enduranceTargets(sess);
  const date = dateForPos(view.week, view.dayIdx);
  const existing = db.endurance.find(e => e.date === date);
  const isRuck = sess.type === 'ruck';
  let html = `<div class="card"><h3>${isRuck ? 'Ruck target' : 'Run target'}</h3>
    <div class="target-line">${esc(t.line || (isRuck ? (t.ruckMi + ' mi @ ' + t.ruckWt + ' lb') : 'see plan'))}</div>`;
  if (t.extra.length) html += `<div class="muted">${t.extra.map(esc).join('<br>')}</div>`;
  if (isRuck && t.goalLabel) html += `<div class="muted">Pace goal: ${esc(t.goalLabel)}</div>`;
  if (!isRuck && t.keyRun) html += `<div class="muted">This week: ${esc(String(t.keyRun))} · ${esc(String(t.weekRun))} mi total</div>`;
  html += `</div>`;
  main.append(h(html));

  const f = h(`<div class="card"><h3>Log ${isRuck ? 'ruck' : 'run'}</h3>
    <div class="row" style="margin-bottom:10px">
      <div><label class="fld">Distance (mi)</label><input type="number" inputmode="decimal" step="0.1" id="en-dist" value="${existing ? existing.dist : ''}"></div>
      <div><label class="fld">Time (min)</label><input type="number" inputmode="decimal" step="0.1" id="en-time" value="${existing ? existing.minutes : ''}"></div>
    </div>
    ${isRuck ? `<div style="margin-bottom:10px"><label class="fld">Ruck weight (lb, dry)</label><input type="number" inputmode="numeric" id="en-wt" value="${existing ? (existing.weight ?? '') : ''}"></div>` : ''}
    <div style="margin-bottom:10px"><label class="fld">Notes</label><input type="text" id="en-notes" placeholder="feet, terrain, how it felt…" value="${existing ? esc(existing.notes || '') : ''}"></div>
    <div id="pace-out" class="pace-result"></div>
    <button class="btn primary" id="en-save" style="margin-top:10px">${existing ? 'Update log' : 'Save log'}</button>
  </div>`);
  main.append(f);
  const out = $('#pace-out');
  const show = () => {
    const d = parseFloat($('#en-dist').value), m = parseFloat($('#en-time').value);
    if (!d || !m) { out.textContent = ''; return; }
    const pace = m*60/d;
    let txt = fmtPace(pace);
    if (t.goalPaceSec) {
      const good = pace <= t.goalPaceSec;
      txt += good ? ` ✓ vs ${t.goalLabel}` : ` vs ${t.goalLabel}`;
      out.className = 'pace-result ' + (good ? 'good' : 'bad');
    } else out.className = 'pace-result good';
    out.textContent = txt;
  };
  $('#en-dist').oninput = show; $('#en-time').oninput = show; show();
  $('#en-save').onclick = () => {
    const d = parseFloat($('#en-dist').value), m = parseFloat($('#en-time').value);
    if (!d || !m) return;
    const entry = { date, week: view.week, type: sess.type, dist: d, minutes: m,
      weight: isRuck ? (parseFloat($('#en-wt').value) || null) : null,
      notes: $('#en-notes').value.trim(), paceSec: m*60/d };
    const i = db.endurance.findIndex(e => e.date === date);
    if (i >= 0) db.endurance[i] = entry; else db.endurance.push(entry);
    save(); render();
  };
}

/* ================= PLAYER ================= */
function startPlayer(sess) {
  const lifts = liftItems(sess);
  const steps = [];
  for (const ex of lifts)
    for (let s = 0; s < ex.sets; s++) steps.push({ ex, setIdx: s });
  if (!steps.length) return;
  player = { week: sess.week, dayIdx: sess.dayIdx, sess, steps, i: 0 };
  // resume past completed sets
  const doneKey = setDoneKey(sess.week, sess.dayIdx);
  const done = db.doneSets[doneKey] || {};
  while (player.i < steps.length) {
    const st = steps[player.i];
    if ((done[st.ex.name] || 0) > st.setIdx) player.i++; else break;
  }
  if (player.i >= steps.length) { player.i = 0; db.doneSets[doneKey] = {}; save(); }
  renderPlayer();
  $('#player').classList.remove('hidden');
}
function closePlayer() { player = null; $('#player').classList.add('hidden'); render(); }

function restFor(ex) { return db.restOverrides[ex.name] || 90; }

function renderPlayer() {
  const st = player.steps[player.i];
  const ex = st.ex;
  const pct = Math.round(player.i / player.steps.length * 100);
  const last = lastLift(ex.name);
  const prevSet = last ? (last.sets[st.setIdx] || last.sets[last.sets.length-1]) : null;
  const isTimed = ex.type === 'time';
  const isMax = ex.type === 'max';
  const isCarry = ex.type === 'distance';
  let targetStr = ex.raw;
  const rest = restFor(ex);

  let logHTML;
  if (isTimed) {
    const secs = ex.seconds;
    logHTML = `<button class="btn primary big" id="work-start">Start ${secs >= 60 ? Math.round(secs/60)+' min' : secs+' sec'} timer</button>
      <button class="btn ghost" id="work-manual" style="margin-top:8px;color:var(--dim)">Done without timer</button>`;
  } else {
    logHTML = `<div class="log-grid">
      <div><label class="fld">Weight</label>
        <div class="stepper"><button data-t="w" data-d="-5">−</button><input type="number" inputmode="decimal" id="in-w" value="${prevSet && prevSet.w != null ? prevSet.w : ''}" placeholder="lb"><button data-t="w" data-d="5">+</button></div></div>
      <div><label class="fld">Reps</label>
        <div class="stepper"><button data-t="r" data-d="-1">−</button><input type="number" inputmode="numeric" id="in-r" value="${prevSet && prevSet.r != null ? prevSet.r : (ex.reps || '')}"><button data-t="r" data-d="1">+</button></div></div>
      <div><label class="fld">RPE</label>
        <div class="stepper"><button data-t="p" data-d="-1">−</button><input type="number" inputmode="decimal" id="in-p" value="${prevSet && prevSet.rpe != null ? prevSet.rpe : ''}" placeholder="1-10"><button data-t="p" data-d="1">+</button></div></div>
    </div>
    <button class="btn primary big" id="set-done">Complete set</button>`;
    if (isCarry) logHTML = logHTML.replace('<label class="fld">Reps</label>', '<label class="fld">Yards</label>');
  }

  $('#player').innerHTML = `<div class="player-inner">
    <div class="player-top">
      <button id="pl-close">✕ Exit</button>
      <span class="muted small">${player.i+1} / ${player.steps.length}</span>
      <button id="pl-skip">Skip ›</button>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="player-ex">${esc(ex.name)}</div>
    <div class="player-set">SET ${st.setIdx+1} OF ${ex.sets}</div>
    <div class="player-target">Target: ${esc(targetStr)}${prevSet ? `<br><span class="small">Last time: ${prevSet.w != null ? prevSet.w + ' lb × ' : ''}${prevSet.r ?? ''}${prevSet.rpe ? ' @ RPE ' + prevSet.rpe : ''}</span>` : ''}</div>
    ${logHTML}
    <div class="rest-cfg">
      <span>Rest</span>
      <button id="rest-minus">−15</button>
      <b id="rest-val">${rest}s</b>
      <button id="rest-plus">+15</button>
    </div>
    <div class="player-spacer"></div>
    ${player.sess.day.notes ? `<div class="player-notes">${esc(player.sess.day.notes)}</div>` : ''}
  </div>`;

  $('#pl-close').onclick = closePlayer;
  $('#pl-skip').onclick = () => advance(false);
  $('#rest-minus').onclick = () => { adjustRest(ex, -15); };
  $('#rest-plus').onclick = () => { adjustRest(ex, 15); };
  document.querySelectorAll('.stepper button').forEach(b => b.onclick = () => {
    const inp = { w: $('#in-w'), r: $('#in-r'), p: $('#in-p') }[b.dataset.t];
    if (!inp) return;
    inp.value = Math.max(0, (parseFloat(inp.value) || 0) + parseFloat(b.dataset.d));
  });
  if (isTimed) {
    $('#work-start').onclick = () => startTimer('work', ex.seconds, () => finishSet({ t: ex.seconds }));
    $('#work-manual').onclick = () => finishSet({ t: ex.seconds });
  } else {
    $('#set-done').onclick = () => {
      const w = parseFloat($('#in-w').value), r = parseFloat($('#in-r').value), p = parseFloat($('#in-p').value);
      finishSet({ w: isNaN(w) ? null : w, r: isNaN(r) ? null : r, rpe: isNaN(p) ? null : p });
    };
  }
}

function adjustRest(ex, d) {
  db.restOverrides[ex.name] = Math.max(15, restFor(ex) + d);
  save();
  $('#rest-val').textContent = restFor(ex) + 's';
}

function finishSet(entry) {
  const st = player.steps[player.i];
  logSet(st.ex.name, player.week, st.setIdx, entry);
  const doneKey = setDoneKey(player.week, player.dayIdx);
  if (!db.doneSets[doneKey]) db.doneSets[doneKey] = {};
  db.doneSets[doneKey][st.ex.name] = st.setIdx + 1;
  save();
  advance(true);
}

function advance(withRest) {
  const last = player.i >= player.steps.length - 1;
  if (last) {
    db.sessionsDone[setDoneKey(player.week, player.dayIdx)] = true;
    save();
    $('#player').innerHTML = `<div class="timer-inner rest">
      <div style="font-size:4rem">✓</div>
      <div class="timer-label">Session complete</div>
      <div class="timer-next">${player.steps.length} sets logged</div>
      <button class="btn primary big" id="pl-finish">Finish</button>
    </div>`;
    $('#pl-finish').onclick = closePlayer;
    return;
  }
  const cur = player.steps[player.i];
  player.i++;
  const next = player.steps[player.i];
  if (withRest) {
    const nextLabel = next.ex.name + ' — set ' + (next.setIdx+1) + ' of ' + next.ex.sets;
    startTimer('rest', restFor(cur.ex), () => renderPlayer(), nextLabel);
  } else renderPlayer();
}

/* ---- timer overlay ---- */
function startTimer(mode, seconds, onDone, nextLabel) {
  stopTimer();
  timer = { mode, remain: seconds, total: seconds, onDone };
  const ov = $('#timer-overlay');
  ov.classList.remove('hidden');
  const draw = () => {
    ov.innerHTML = `<div class="timer-inner ${mode}">
      <div class="timer-label">${mode === 'rest' ? 'Rest' : 'Work'}</div>
      <div class="timer-clock">${fmtClock(timer.remain)}</div>
      <div class="timer-next">${nextLabel ? 'Next: ' + esc(nextLabel) : ''}</div>
      <button class="btn" id="t-add">+30 sec</button>
      <button class="btn primary" id="t-skip">${mode === 'rest' ? 'Skip rest' : 'Done'}</button>
    </div>`;
    $('#t-add').onclick = () => { timer.remain += 30; draw(); };
    $('#t-skip').onclick = () => { finishTimer(); };
  };
  draw();
  timer.int = setInterval(() => {
    timer.remain--;
    if (timer.remain <= 0) { beep(); finishTimer(); }
    else { const c = ov.querySelector('.timer-clock'); if (c) c.textContent = fmtClock(timer.remain); }
  }, 1000);
}
function finishTimer() {
  const cb = timer && timer.onDone;
  stopTimer();
  if (cb) cb();
}
function stopTimer() {
  if (timer && timer.int) clearInterval(timer.int);
  timer = null;
  $('#timer-overlay').classList.add('hidden');
}
function fmtClock(s) { return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }

/* ================= PLAN TAB ================= */
function renderPlan(main) {
  const opts = [];
  for (let w = 1; w <= PLAN.meta.totalWeeks; w++) {
    const rr = runRuckFor(w);
    let tag = rr ? (rr.benchmark ? ' ★' : rr.taper ? ' taper' : rr.deload ? ' deload' : '') : '';
    opts.push(`<option value="${w}" ${w === view.week ? 'selected' : ''}>Week ${w}${tag}</option>`);
  }
  main.append(h(`<div class="week-picker">
    <button class="btn" style="flex:0 0 52px" id="wk-prev">‹</button>
    <select id="wk-sel">${opts.join('')}</select>
    <button class="btn" style="flex:0 0 52px" id="wk-next">›</button>
  </div>`));
  $('#wk-sel').onchange = e => { view.week = +e.target.value; render(); };
  $('#wk-prev').onclick = () => { if (view.week > 1) { view.week--; render(); } };
  $('#wk-next').onclick = () => { if (view.week < PLAN.meta.totalWeeks) { view.week++; render(); } };

  const rr = runRuckFor(view.week);
  const phase = phaseFor(view.week);
  if (rr) {
    let badges = '';
    if (rr.benchmark) badges = '<span class="badge benchmark">BENCHMARK</span> ';
    else if (rr.taper) badges = '<span class="badge taper">TAPER</span> ';
    else if (rr.deload) badges = '<span class="badge deload">DELOAD</span> ';
    main.append(h(`<div class="card">
      <h3>${esc(phase.name)}</h3>
      <div style="margin-bottom:6px">${badges}</div>
      <div class="hist-row"><b>Run</b><span>${esc(String(rr.runMiles))} mi · ${esc(rr.keyRun || '')}</span></div>
      <div class="hist-row"><b>Ruck</b><span>${esc(String(rr.ruckMiles))} mi @ ${esc(String(rr.ruckWeight))} lb</span></div>
      ${rr.notes ? `<div class="muted small" style="margin-top:8px">${esc(rr.notes)}</div>` : ''}
    </div>`));
  }

  const today = programPos();
  let rows = '';
  for (let d = 0; d < 7; d++) {
    const sess = sessionFor(view.week, d);
    const isToday = view.week === today.week && d === today.dayIdx;
    const done = db.sessionsDone[setDoneKey(view.week, d)];
    rows += `<div class="plan-day ${isToday ? 'today' : ''}" data-d="${d}">
      <div class="dot">${sess.day.day.slice(0,3).toUpperCase()}</div>
      <div class="info"><b>${done ? '✓ ' : ''}${esc(sess.day.title)}</b><span>${sess.day.duration ? esc(sess.day.duration) : ''}</span></div>
      <div class="go">›</div>
    </div>`;
  }
  const card = h(`<div class="card">${rows}</div>`);
  main.append(card);
  document.querySelectorAll('.plan-day').forEach(el => el.onclick = () => {
    view.dayIdx = +el.dataset.d; view.tab = 'today'; render();
  });
}

/* ================= FUEL TAB ================= */
function renderFood(main) {
  const tabs = [['check','Checklist'],['meals','Meal Plan'],['groc','Grocery'],['rules','Guidelines']];
  main.append(h(`<div class="subtabs">${tabs.map(([k,l]) =>
    `<button data-ft="${k}" class="${view.foodTab === k ? 'active' : ''}">${l}</button>`).join('')}</div>`));
  document.querySelectorAll('[data-ft]').forEach(b => b.onclick = () => { view.foodTab = b.dataset.ft; render(); });

  if (view.foodTab === 'check') renderFoodCheck(main);
  else if (view.foodTab === 'meals') renderMeals(main);
  else if (view.foodTab === 'groc') renderGrocery(main);
  else renderFoodRules(main);
}

function renderFoodCheck(main) {
  const date = todayISO();
  const slots = PLAN.nutrition.meals.map(m => m.slot);
  const checks = db.meals[date] || new Array(slots.length || MEAL_SLOTS_FALLBACK).fill(false);
  let rows = '';
  slots.forEach((s, i) => {
    rows += `<div class="meal-check ${checks[i] ? 'on' : ''}" data-i="${i}">
      <div class="box">✓</div><div class="lbl">${esc(s)}</div></div>`;
  });
  main.append(h(`<div class="card"><h3>Today · ${fmtDate(date)}</h3>${rows}</div>`));
  document.querySelectorAll('.meal-check').forEach(el => el.onclick = () => {
    const arr = db.meals[date] || new Array(slots.length).fill(false);
    arr[+el.dataset.i] = !arr[+el.dataset.i];
    db.meals[date] = arr; save(); render();
  });

  const todayBW = db.bodyweight.find(b => b.date === date);
  const bw = h(`<div class="card"><h3>Bodyweight</h3>
    <div class="row">
      <input type="number" inputmode="decimal" step="0.1" id="bw-in" placeholder="lb" value="${todayBW ? todayBW.lb : ''}">
      <button class="btn primary" id="bw-save" style="flex:0 0 110px">${todayBW ? 'Update' : 'Save'}</button>
    </div>
    ${trendLine()}
  </div>`);
  main.append(bw);
  $('#bw-save').onclick = () => {
    const v = parseFloat($('#bw-in').value);
    if (!v) return;
    const i = db.bodyweight.findIndex(b => b.date === date);
    if (i >= 0) db.bodyweight[i].lb = v; else db.bodyweight.push({ date, lb: v });
    db.bodyweight.sort((a,b) => a.date < b.date ? -1 : 1);
    save(); render();
  };
}
function trendLine() {
  const n = db.bodyweight.length;
  if (n < 8) return `<div class="muted small" style="margin-top:8px">Weigh in daily — the plan's adjustment rule uses your 7-day average.</div>`;
  const avg = a => a.reduce((s,x) => s+x.lb, 0) / a.length;
  const lastW = avg(db.bodyweight.slice(-7));
  const prevW = avg(db.bodyweight.slice(-14, -7));
  const d = lastW - prevW;
  let advice = 'On track.';
  if (Math.abs(d) < 0.3) advice = 'Flat 2 weeks? Add 200 kcal/day (+1 tbsp PB at breakfast & evening).';
  else if (d > 1) advice = 'Gaining over 1 lb/week — subtract 200 kcal/day.';
  return `<div class="muted small" style="margin-top:8px">7-day avg: <b>${lastW.toFixed(1)} lb</b> (${d >= 0 ? '+' : ''}${d.toFixed(1)} vs prior week). ${advice}</div>`;
}

function renderMeals(main) {
  for (const meal of PLAN.nutrition.meals) {
    let rows = '';
    for (const o of meal.options) {
      rows += `<div class="meal-opt"><b>${esc(o.option)}</b>
        <div class="foods">${esc(o.foods)}</div>
        <div class="macros"><span>${o.protein}P</span><span>${o.carbs}C</span><span>${o.fat}F</span><span>${o.calories} kcal</span></div>
        ${o.notes ? `<div class="muted small" style="margin-top:3px">${esc(o.notes)}</div>` : ''}
      </div>`;
    }
    main.append(h(`<div class="card"><h3>${esc(meal.slot)}</h3>${rows}</div>`));
  }
  for (const t of PLAN.nutrition.mealTotals)
    main.append(h(`<div class="card"><h3>${esc(t.label)}</h3>
      <div class="macros"><span>${esc(String(t.protein))}P</span><span>${esc(String(t.carbs))}C</span><span>${esc(String(t.fat))}F</span><span>${esc(String(t.calories))} kcal</span></div></div>`));
}

function renderGrocery(main) {
  const cats = {};
  for (const g of PLAN.nutrition.grocery) (cats[g.category] = cats[g.category] || []).push(g);
  for (const [cat, items] of Object.entries(cats)) {
    let rows = '';
    for (const g of items) rows += `<div class="groc-item"><b>${esc(g.item)}</b><span>${esc(g.amount || '')}</span></div>`;
    main.append(h(`<div class="card"><h3>${esc(cat)}</h3>${rows}</div>`));
  }
}

function renderFoodRules(main) {
  for (const sec of PLAN.nutrition.overview) {
    let rows = '';
    for (const e of sec.entries) rows += `<div style="margin-bottom:10px"><b class="small">${esc(e.label)}</b><div class="muted small">${esc(e.text)}</div></div>`;
    if (rows) main.append(h(`<div class="card"><h3>${esc(sec.heading)}</h3>${rows}</div>`));
  }
}

/* ================= HISTORY ================= */
function renderHistory(main) {
  // lifts
  const names = Object.keys(db.lifts).sort();
  if (!names.length && !db.endurance.length && !db.bodyweight.length) {
    main.append(h(`<div class="card"><div class="muted">No history yet. Log a session and it shows up here.</div></div>`));
    return;
  }
  if (names.length) {
    if (!view.histEx || !names.includes(view.histEx)) view.histEx = names[0];
    main.append(h(`<div class="card"><h3>Lift progression</h3>
      <select id="hist-sel">${names.map(n => `<option ${n === view.histEx ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <canvas class="chart" id="ch-lift"></canvas>
      <div id="lift-rows"></div>
    </div>`));
    $('#hist-sel').onchange = e => { view.histEx = e.target.value; render(); };
    const recs = db.lifts[view.histEx];
    const pts = recs.map(r => {
      const best = Math.max(...r.sets.filter(Boolean).map(s => s.w || 0));
      return { x: r.date, y: best };
    }).filter(p => p.y > 0);
    drawChart($('#ch-lift'), pts, 'lb');
    let rows = '';
    for (const r of recs.slice(-8).reverse()) {
      const setsTxt = r.sets.filter(Boolean).map(s =>
        s.t ? fmtClock(s.t) : `${s.w != null ? s.w + '×' : ''}${s.r ?? '?'}`).join(', ');
      rows += `<div class="hist-row"><b>wk ${r.week} · ${fmtDate(r.date)}</b><span>${esc(setsTxt)}</span></div>`;
    }
    $('#lift-rows').innerHTML = rows;
  }

  // rucks
  const rucks = db.endurance.filter(e => e.type === 'ruck');
  if (rucks.length) {
    main.append(h(`<div class="card"><h3>Ruck pace</h3><canvas class="chart" id="ch-ruck"></canvas><div id="ruck-rows"></div></div>`));
    drawChart($('#ch-ruck'), rucks.map(r => ({ x: r.date, y: +(r.paceSec/60).toFixed(2) })), 'min/mi', true);
    let rows = '';
    for (const r of rucks.slice(-8).reverse())
      rows += `<div class="hist-row"><b>wk ${r.week} · ${fmtDate(r.date)}</b><span>${r.dist} mi @ ${r.weight || '—'} lb · ${fmtPace(r.paceSec)}</span></div>`;
    $('#ruck-rows').innerHTML = rows;
  }

  // runs
  const runs = db.endurance.filter(e => e.type === 'run');
  if (runs.length) {
    main.append(h(`<div class="card"><h3>Run pace</h3><canvas class="chart" id="ch-run"></canvas></div>`));
    drawChart($('#ch-run'), runs.map(r => ({ x: r.date, y: +(r.paceSec/60).toFixed(2) })), 'min/mi', true);
  }

  // bodyweight
  if (db.bodyweight.length > 1) {
    main.append(h(`<div class="card"><h3>Bodyweight</h3><canvas class="chart" id="ch-bw"></canvas></div>`));
    drawChart($('#ch-bw'), db.bodyweight.map(b => ({ x: b.date, y: b.lb })), 'lb');
  }
}

function drawChart(canvas, pts, unit, invert) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 320, H = canvas.clientHeight || 190;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  if (pts.length < 2) {
    ctx.fillStyle = '#93a29a'; ctx.font = '13px system-ui';
    ctx.fillText(pts.length ? 'Need 2+ entries for a trend.' : 'No data yet.', 10, 24);
    return;
  }
  const pad = { l: 40, r: 10, t: 12, b: 22 };
  const ys = pts.map(p => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min; min -= span * 0.1; max += span * 0.1;
  const X = i => pad.l + (W - pad.l - pad.r) * (i / (pts.length - 1));
  const Y = v => invert
    ? pad.t + (H - pad.t - pad.b) * ((v - min) / (max - min))
    : H - pad.b - (H - pad.t - pad.b) * ((v - min) / (max - min));
  // gridlines
  ctx.strokeStyle = '#2a352f'; ctx.fillStyle = '#93a29a'; ctx.font = '11px system-ui'; ctx.lineWidth = 1;
  for (let g = 0; g <= 3; g++) {
    const v = min + (max - min) * g / 3;
    const y = Y(v);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillText(v.toFixed(unit === 'lb' ? 0 : 1), 4, y + 4);
  }
  // line
  ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(X(i), Y(p.y)) : ctx.moveTo(X(i), Y(p.y)));
  ctx.stroke();
  ctx.fillStyle = '#4ade80';
  pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(X(i), Y(p.y), 3, 0, 7); ctx.fill(); });
  // x labels: first + last
  ctx.fillStyle = '#93a29a';
  ctx.fillText(fmtDate(pts[0].x), pad.l, H - 6);
  const lastLbl = fmtDate(pts[pts.length-1].x);
  ctx.fillText(lastLbl, W - pad.r - ctx.measureText(lastLbl).width, H - 6);
}

/* ================= SETTINGS ================= */
function openSettings() {
  const s = $('#settings-sheet');
  s.classList.remove('hidden');
  s.innerHTML = `<div class="sheet-inner">
    <div class="player-top"><button id="st-close">✕ Close</button></div>
    <h2>Settings</h2>
    <div class="set-row"><label class="fld">Program start date (Week 1 Monday)</label>
      <input type="date" id="st-date" value="${db.startDate || ''}"></div>
    <div class="set-row"><button class="btn" id="st-export">Export all data (JSON)</button></div>
    <div class="set-row"><button class="btn" id="st-import">Import data from file</button></div>
    <div class="set-row"><button class="btn" id="st-reset" style="color:var(--red)">Erase all history</button></div>
    <p class="muted small">Data saves to this browser and syncs to your dashboard server whenever you're online and logged in. Export is a manual backup on top of that.</p>
  </div>`;
  $('#st-close').onclick = () => s.classList.add('hidden');
  $('#st-date').onchange = e => { db.startDate = e.target.value; view.week = null; save(); render(); };
  $('#st-export').onclick = () => {
    const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'workout-backup-' + todayISO() + '.json';
    a.click();
  };
  $('#st-import').onclick = () => $('#import-file').click();
  $('#st-reset').onclick = () => {
    if (confirm('Erase ALL logged history and settings? Export first if unsure.')) {
      db = defaultDB(); save(); location.reload();
    }
  };
}
$('#import-file').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  f.text().then(txt => {
    try {
      const data = JSON.parse(txt);
      if (!('lifts' in data)) throw new Error('not a backup');
      db = Object.assign(defaultDB(), data);
      save(); location.reload();
    } catch { alert('That file is not a valid backup.'); }
  });
});

/* ================= boot ================= */
document.querySelectorAll('.tab').forEach(b => b.onclick = () => { view.tab = b.dataset.tab; render(); });
$('#btn-settings').onclick = openSettings;
$('#setup-go').onclick = () => {
  const v = $('#setup-date').value;
  if (!v) return;
  db.startDate = v; save(); view.week = null; render();
};

Promise.all([fetch('plan.json').then(r => r.json()), pullState()]).then(([p]) => {
  PLAN = p;
  const d = $('#setup-date');
  if (d && !d.value) d.value = todayISO();
  render();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
