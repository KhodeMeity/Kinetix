/* ==========================================================================
   workout.js — حالت «شروع تمرین»
   صفحهٔ تمام‌صفحه برای اجرای برنامهٔ یک روز: نمایش حرکت و ست، تایمر نگه‌داشتن (برای حرکات ثانیه‌ای)،
   تایمر استراحت با لرزش و بوق، روشن ماندن صفحه، و ثبت هر ست در همان تاریخچهٔ برنامه/آمار.
   تایمرها بر پایهٔ زمان پایان (Date.now) هستند، پس با قفل شدن صفحه هم خراب نمی‌شوند.

   Workout.start(env)  env = {
     T, num, ico, esc,                      // ترجمه و ابزارها
     title,                                 // عنوان روز
     items: [{ it, m, done }],              // it: آیتم برنامه، m: حرکت، done: ست‌های انجام‌شده تا الان
     moveIcon(m), mName(m), amountLabel(it),
     completeSet(it, actual) → { dayComplete },   // ثبت ست در داده‌ها
     sound: bool, onSound(bool),            // ترجیح صدا/لرزش
     buzz(kind), notifyAt(ms, title, body), cancelNotify(),
     onClose(summary)                       // پس از بسته شدن
   }
   ========================================================================== */
(function () {
  'use strict';
  let env = null, root = null, st = null, tick = 0, wake = null, ac = null;
  const t = (k, p) => env.T(k, p);
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return env.num(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')); };
  const C = 2 * Math.PI * 100;

  /* ---------- صدا و لرزش ---------- */
  function beep(freq, ms) {
    if (!st.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = freq; g.gain.value = 0.0001;
      o.connect(g); g.connect(ac.destination);
      const n = ac.currentTime; g.gain.exponentialRampToValueAtTime(0.35, n + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, n + ms / 1000);
      o.start(n); o.stop(n + ms / 1000 + 0.02);
    } catch (e) {}
  }
  const buzz = kind => { env.buzz && env.buzz(kind); };   /* لرزش مستقل از صداست؛ خاموش‌کردنش در تنظیمات */

  /* ---------- روشن ماندن صفحه ---------- */
  async function lock() { try { if (navigator.wakeLock && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) { wake = null; } }
  function unlock() { try { wake && wake.release(); } catch (e) {} wake = null; }
  const onVis = () => {
    if (!root || root.hidden || !st) return;
    if (document.visibilityState === 'visible') { env.cancelNotify && env.cancelNotify(); lock(); tickNow(); }
    else if (st.endAt && (st.phase === 'rest' || st.phase === 'hold') && env.notifyAt) {   /* اپ در پس‌زمینه است: پایان تایمر را اعلان کن */
      const n = st.phase === 'rest' ? cur() : null;
      env.notifyAt(st.endAt, t(st.phase === 'rest' ? 'ws.notify.t' : 'ws.notify.hold'), n ? t('ws.notify.d', { name: env.mName(n.m) }) : t('ws.notify.hold.d'));
    }
  };

  /* ---------- ساخت مراحل ---------- */
  function buildSteps() {
    const s = [];
    env.items.forEach(({ it, m, done }) => { for (let n = done + 1; n <= it.sets; n++) s.push({ it, m, n }); });
    return s;
  }
  const cur = () => st.steps[st.i];
  const nextStep = () => st.steps[st.i + 1];
  const totalSets = () => env.items.reduce((a, x) => a + x.it.sets, 0);
  const doneSets = () => env.items.reduce((a, x) => a + x.done, 0) + st.finished;

  /* ---------- رابط ---------- */
  function topBar() {
    return `<div class="rn-top"><button class="icon-btn" data-rn="exit" aria-label="${t('c.close')}">${env.ico('i-x')}</button>
      <div class="t"><b>${env.esc(env.title)}</b><small>${t('ws.progress', { d: env.num(doneSets()), t: env.num(totalSets()) })}</small></div>
      <button class="icon-btn" data-rn="sound" aria-pressed="${st.sound}" aria-label="${t('ws.sound')}">${env.ico(st.sound ? 'i-bolt' : 'i-moon-rest')}</button></div>
      <div class="rn-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${totalSets()}" aria-valuenow="${doneSets()}"><i style="width:${totalSets() ? Math.round(doneSets() / totalSets() * 100) : 0}%"></i></div>`;
  }
  const ring = (frac, big, small) => `<div class="rn-ring" role="timer" aria-live="off"><svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="100" class="bg"/><circle cx="110" cy="110" r="100" class="fg" id="rn-fg" style="stroke-dasharray:${(C * frac).toFixed(1)} ${C.toFixed(1)}"/></svg><div><b id="rn-num">${big}</b><small>${small}</small></div></div>`;

  function nextLine() {
    const n = st.phase === 'rest' ? cur() : nextStep(); if (!n) return `<p class="rn-next">${t('ws.last')}</p>`;
    return `<p class="rn-next">${t('ws.next')}: <b>${env.esc(env.mName(n.m))}</b> — ${t('ws.setof', { n: env.num(n.n), t: env.num(n.it.sets) })}</p>`;
  }

  function stageEx() {
    const s = cur(), { it, m } = s, sec = it.unit === 'sec', mx = it.unit === 'max', hold = mx && !!m.iso;
    const target = mx ? t('c.tomax') : env.amountLabel(it) + (it.perSide ? ' (' + t('c.perside') + ')' : '');
    return `<div class="rn-stage c-${m.cat}">
        <div class="rn-ico">${env.moveIcon(m)}</div>
        <h2 class="rn-name" id="rn-h" tabindex="-1">${env.esc(env.mName(m))}</h2>
        <div class="rn-set">${t('ws.setof', { n: env.num(s.n), t: env.num(it.sets) })}</div>
        <div class="rn-target">${target}</div>
        ${it.note ? `<p class="rn-note">${env.esc(it.note)}</p>` : ''}
        ${mx ? (hold ? `<p class="rn-note">${t('ws.sw.hint')}</p>
          <div class="rn-actual"><span>${t('ws.actual.sec')}</span><div class="ob-step"><button type="button" data-rn="adj" data-d="-1" aria-label="${t('c.less')}">${env.ico('i-minus')}</button>
          <input id="rn-act" inputmode="numeric" autocomplete="off" value="${env.num(st.actual)}" aria-label="${t('ws.actual.sec')}"><button type="button" data-rn="adj" data-d="1" aria-label="${t('c.more')}">${env.ico('i-plus')}</button></div></div>`
          : `<div class="rn-count"><button type="button" class="rn-minus" data-rn="adj" data-d="-1" aria-label="${t('c.less')}">${env.ico('i-minus')}</button>
          <button type="button" class="rn-tap" data-rn="tap" aria-label="${t('ws.tap')}"><b id="rn-cnt">${env.num(st.actual)}</b><small>${t('ws.tap')}</small></button></div>
          <input id="rn-act" type="hidden" value="${env.num(st.actual)}">`) : ''}
        ${nextLine()}
      </div>
      <div class="rn-acts">
        ${sec || (hold && !st.actual) ? `<button class="btn primary rn-big" data-rn="hold">${env.ico('i-play')}${t(sec ? 'ws.hold' : 'ws.sw.go')}</button>`
              : `<button class="btn primary rn-big" data-rn="done">${env.ico('i-check')}${t('ws.done')}</button>`}
        <div class="row"><button class="btn ghost" data-rn="skip">${t('ws.skip')}</button>${sec || (hold && !st.actual) ? `<button class="btn ghost" data-rn="done">${t('ws.done.manual')}</button>` : hold ? `<button class="btn ghost" data-rn="hold">${t('ws.sw.again')}</button>` : ''}</div>
      </div>`;
  }
  function stageHold() {
    const s = cur();
    return `<div class="rn-stage c-${s.m.cat}"><h2 class="rn-name" id="rn-h" tabindex="-1">${env.esc(env.mName(s.m))}</h2>
        ${ring(1, '', '')}${nextLine()}</div>
      <div class="rn-acts">${st.phase === 'hold' ? `<button class="btn primary rn-big" data-rn="done">${env.ico('i-check')}${t('ws.done.early')}</button>` : ''}
        <div class="row"><button class="btn ghost" data-rn="cancelhold">${t('ws.cancel')}</button></div></div>`;
  }
  /* کرونومتر حرکات نگه‌داشتنیِ «تا ناتوانی» */
  const swFmt = s => { s = Math.max(0, Math.floor(s)); return env.num(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')); };
  function stageSw() {
    const s = cur();
    return `<div class="rn-stage c-${s.m.cat}"><h2 class="rn-name" id="rn-h" tabindex="-1">${env.esc(env.mName(s.m))}</h2>
        <div class="rn-sw" role="timer" aria-live="off"><b id="rn-sw">${swFmt((Date.now() - st.swAt) / 1000)}</b><small>${t('ws.sw.hint')}</small></div></div>
      <div class="rn-acts"><button class="btn primary rn-big" data-rn="swstop">${env.ico('i-check')}${t('ws.sw.stop')}</button>
        <div class="row"><button class="btn ghost" data-rn="cancelhold">${t('ws.cancel')}</button></div></div>`;
  }
  function stageRest() {
    return `<div class="rn-stage"><h2 class="rn-name" id="rn-h" tabindex="-1">${t('ws.rest')}</h2>
        ${ring(1, '', (cur() && cur().it.id !== st.steps[st.i-1].it.id) ? t('ws.rest.sub2') : t('ws.rest.sub'))}${nextLine()}</div>
      <div class="rn-acts"><div class="row"><button class="btn" data-rn="plus">${env.ico('i-plus')}${t('ws.plus', { n: env.num(15) })}</button>
        <button class="btn primary" data-rn="skiprest">${t('ws.skiprest')}</button></div></div>`;
  }
  /* جمع تکرار و ثانیه به تفکیک دسته (هل دادن، کشیدن، پایین‌تنه…) */
  function catSummary() {
    const rows = Object.keys(st.byCat).map(c => ({ c, ...st.byCat[c] })).filter(x => x.reps || x.secs).sort((a, b) => (b.reps - a.reps) || (b.secs - a.secs));
    if (!rows.length) return '';
    return `<ul class="rn-cats" aria-label="${t('ws.cat.t')}">${rows.map(r => `<li class="c-${r.c}"><span class="dotc"></span><b>${env.esc(env.catName(r.c))}</b>
      <em>${[r.reps ? t('ws.cat.reps', { n: env.num(r.reps) }) : '', r.secs ? t('ws.cat.secs', { n: env.num(r.secs) }) : ''].filter(Boolean).join(' · ')}</em></li>`).join('')}</ul>`;
  }
  function stageDone() {
    const secs = Math.round((Date.now() - st.t0) / 1000), mins = Math.max(1, Math.round(secs / 60));
    return `<div class="rn-stage"><div class="ob-hero">${env.ico('i-trophy')}</div>
        <h2 class="rn-name" id="rn-h" tabindex="-1">${st.skipped ? t('ws.fin.partial') : t('ws.fin.t')}</h2>
        <p class="rn-note">${st.skipped ? t('ws.fin.partial.d') : t('ws.fin.d')}</p>
        ${catSummary()}
        <div class="rn-sum"><div><b>${env.num(st.finished)}</b><small>${t('ws.sum.sets')}</small></div><div><b>${env.num(mins)}</b><small>${t('ws.sum.min')}</small></div><div><b>${env.num(st.reps)}</b><small>${t('ws.sum.reps')}</small></div></div></div>
      <div class="rn-acts"><button class="btn primary rn-big" data-rn="close">${env.ico('i-check')}${t('ws.close')}</button></div>`;
  }
  function stageConfirm() {
    return `<div class="rn-stage"><div class="rn-confirm" role="alertdialog" aria-labelledby="rn-h"><h3 id="rn-h" tabindex="-1">${t('ws.exit.t')}</h3><p>${t('ws.exit.d')}</p>
      <div class="row" style="display:flex;gap:10px"><button class="btn ghost grow" data-rn="stay">${t('ws.exit.stay')}</button><button class="btn danger grow" data-rn="close">${t('ws.exit.go')}</button></div></div></div>`;
  }

  function paint(focus = true) {
    const body = st.phase === 'ex' ? stageEx() : st.phase === 'sw' ? stageSw() : st.phase === 'hold' || st.phase === 'ready' ? stageHold() : st.phase === 'rest' ? stageRest() : st.phase === 'confirm' ? stageConfirm() : stageDone();
    root.innerHTML = `<div class="rn-in">${topBar()}${body}</div>`;
    if (st.phase === 'ready') { const sm = root.querySelector('.rn-ring small'); if (sm) sm.textContent = t('ws.ready'); }
    tickNow();
    if (focus) { const h = root.querySelector('#rn-h'); if (h) h.focus({ preventScroll: true }); }
  }

  /* ---------- تایمرها ---------- */
  function startTimer(phase, secs) { st.phase = phase; st.dur = secs; st.endAt = Date.now() + secs * 1000; st.lastBeep = null; paint(); clearInterval(tick); tick = setInterval(tickNow, 200); }
  function stopTimer() { clearInterval(tick); tick = 0; st.endAt = 0; }

  function startSw0() { st.phase = 'sw'; paint(); clearInterval(tick); tick = setInterval(tickNow, 200); }
  function startSw() { st.phase = 'sw'; st.swAt = Date.now(); paint(); clearInterval(tick); tick = setInterval(tickNow, 200); }
  function tickNow() {
    if (st && st.phase === 'sw' && root && !root.hidden) { const el = root.querySelector('#rn-sw'); if (el) el.textContent = swFmt((Date.now() - st.swAt) / 1000); return; }
    if (!st || !st.endAt || !root || root.hidden) return;
    const left = (st.endAt - Date.now()) / 1000, num = root.querySelector('#rn-num'), fg = root.querySelector('#rn-fg');
    if (num) num.textContent = fmt(left);
    if (fg) fg.style.strokeDasharray = `${(C * Math.max(0, left) / st.dur).toFixed(1)} ${C.toFixed(1)}`;
    const sec = Math.ceil(left);
    if (sec <= 3 && sec >= 1 && st.lastBeep !== sec && st.phase !== 'ready') { st.lastBeep = sec; beep(660, 120); }
    if (left <= 0) {
      const ph = st.phase; stopTimer();
      if (ph === 'ready') { beep(880, 300); buzz('start'); if (cur().it.unit === 'max') startSw(); else startTimer('hold', cur().it.amount || 20); }
      else if (ph === 'hold') { beep(990, 450); buzz('end'); completeCurrent(cur().it.amount); }
      else if (ph === 'rest') { beep(990, 450); buzz('end'); env.cancelNotify && env.cancelNotify(); gotoNext(); }
    }
  }

  /* ---------- جریان ---------- */
  function completeCurrent(actual) {
    const s = cur(); if (!s) return;
    const r = env.completeSet(s.it, actual, s.m.iso ? 'sec' : 'rep');
    st.finished++;
    /* شمارش به تفکیک دسته: تکرار برای حرکات تکراری، ثانیه برای حرکات نگه‌داشتنی */
    const hold = s.it.unit === 'sec' || (s.it.unit === 'max' && s.m.iso), q = (s.it.unit === 'max' ? (actual || 0) : s.it.amount) * (s.it.perSide ? 2 : 1);
    const bc = st.byCat[s.m.cat] || (st.byCat[s.m.cat] = { sets: 0, reps: 0, secs: 0 });
    bc.sets++; if (hold) bc.secs += q; else { bc.reps += q; st.reps += q; }
    st.dayComplete = r && r.dayComplete;
    const n = nextStep();
    st.i++; st.actual = 0;
    if (!n) { finish(); return; }
    /* بین ست‌های یک حرکت: استراحت همان حرکت؛ هنگام رفتن به حرکت دیگر: استراحت بین حرکات (تنظیمات) */
    const gap = n.it.id !== s.it.id && env.restMove != null ? env.restMove : s.it.rest;
    if (gap > 0) { startTimer('rest', gap); }
    else gotoNext();
  }
  function gotoNext() { st.phase = 'ex'; paint(); }
  function finish() { stopTimer(); st.phase = 'done'; env.cancelNotify && env.cancelNotify(); buzz('end'); beep(990, 500); paint(); }
  function skipItem() {
    const s = cur(); if (!s) return;
    st.skipped = true; const id = s.it.id;
    st.steps = st.steps.filter((x, k) => k < st.i || x.it.id !== id);
    st.actual = 0;
    if (!cur()) finish(); else gotoNext();
  }
  function closeAll() {
    stopTimer(); unlock(); env.cancelNotify && env.cancelNotify();
    document.removeEventListener('visibilitychange', onVis);
    root.hidden = true; root.innerHTML = ''; document.documentElement.classList.remove('rn-open');
    const sum = { sets: st.finished, secs: Math.round((Date.now() - st.t0) / 1000), reps: st.reps, complete: !!st.dayComplete };
    const prev = st.prevFocus; st = null;
    try { prev && prev.focus && prev.focus(); } catch (e) {}
    env.onClose && env.onClose(sum);
  }

  function onClick(e) {
    const b = e.target.closest('[data-rn]'); if (!b || !st) return;
    const a = b.dataset.rn;
    if (a === 'done') { const inp = root.querySelector('#rn-act'); const v = inp ? Math.max(0, parseInt(String(inp.value).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)), 10) || 0) : (cur() && cur().it.amount); stopTimer(); completeCurrent(v); return; }
    if (a === 'hold') { beep(440, 80); startTimer('ready', 3); return; }
    if (a === 'swstop') { const secs = Math.max(1, Math.round((Date.now() - st.swAt) / 1000)); stopTimer(); st.actual = Math.min(999, secs); beep(990, 300); buzz('end'); st.phase = 'ex'; paint(); return; }
    if (a === 'tap') { st.actual = Math.min(999, (st.actual || 0) + 1); const i = root.querySelector('#rn-act'), c = root.querySelector('#rn-cnt'); if (i) i.value = env.num(st.actual); if (c) c.textContent = env.num(st.actual); beep(540, 40); buzz('tap'); return; }
    if (a === 'cancelhold') { stopTimer(); st.phase = 'ex'; paint(); return; }
    if (a === 'skip') { skipItem(); return; }
    if (a === 'plus') { st.endAt += 15000; st.dur += 15; st.lastBeep = null; tickNow(); return; }
    if (a === 'skiprest') { stopTimer(); env.cancelNotify && env.cancelNotify(); gotoNext(); return; }
    if (a === 'sound') { st.sound = !st.sound; env.onSound && env.onSound(st.sound); b.setAttribute('aria-pressed', st.sound); b.innerHTML = env.ico(st.sound ? 'i-bolt' : 'i-moon-rest'); return; }
    if (a === 'adj') { const inp = root.querySelector('#rn-act'); st.actual = Math.max(0, Math.min(999, (parseInt(String(inp.value).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)), 10) || 0) + (+b.dataset.d))); inp.value = env.num(st.actual); const c = root.querySelector('#rn-cnt'); if (c) c.textContent = env.num(st.actual); return; }
    if (a === 'exit') { if (st.phase === 'done') { closeAll(); return; } st.back = st.phase; st.paused = st.endAt ? st.endAt - Date.now() : 0; if (st.phase === 'sw') st.swPaused = Date.now() - st.swAt; stopTimer(); st.phase = 'confirm'; paint(); return; }
    if (a === 'stay') { const ph = st.back; if (ph === 'sw') { st.swAt = Date.now() - (st.swPaused || 0); startSw0(); return; } if (st.paused > 0 && (ph === 'rest' || ph === 'hold' || ph === 'ready')) { st.phase = ph; st.endAt = Date.now() + st.paused; paint(); clearInterval(tick); tick = setInterval(tickNow, 200); } else { st.phase = ph || 'ex'; paint(); } return; }
    if (a === 'close') { closeAll(); }
  }

  function start(e) {
    env = e; root = document.getElementById('runner'); if (!root) return false;
    st = { steps: [], i: 0, phase: 'ex', finished: 0, reps: 0, byCat: {}, actual: 0, t0: Date.now(), sound: e.sound !== false, skipped: false, prevFocus: document.activeElement, dayComplete: false };
    st.steps = buildSteps();
    if (!st.steps.length) return false;
    if (!root.dataset.bound) { root.addEventListener('click', onClick); root.dataset.bound = '1'; }
    root.hidden = false; document.documentElement.classList.add('rn-open');
    document.addEventListener('visibilitychange', onVis);
    lock(); paint();
    return true;
  }
  window.Workout = { start, isOpen: () => !!root && !root.hidden && !!st, back() { if (!root || root.hidden || !st) return false; if (st.phase === 'confirm') { onClick({ target: root.querySelector('[data-rn="stay"]') }); } else onClick({ target: root.querySelector('[data-rn="exit"]') || root }); return true; } };
})();
