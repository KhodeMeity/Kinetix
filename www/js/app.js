/* ==========================================================================
   app.js — منطق برنامهٔ کلیستنیکس (بدون وابستگی خارجی)
   داده‌های کاربر در localStorage با کلید calis-app-v1 ذخیره می‌شود.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- ابزارها ---------- */
  const KEY = 'calis-app-v1';
  const FAD = '۰۱۲۳۴۵۶۷۸۹';
  const $ = (s, r = document) => r.querySelector(s);
  const T = I18N.t, TS = I18N.ts, fa = n => I18N.num(n);
  const toEn = s => String(s).replace(/[۰-۹]/g, d => FAD.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const norm = s => toEn(String(s || '')).toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').replace(/\s+/g, ' ').trim();
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ico = (id, cls = '') => `<svg class="ico ${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
  /* نام‌ها و متن‌های وابسته به زبان */
  const mName = m => { if (I18N.lang !== 'en') return m.name; const o = m.custom ? null : I18N.move(m.id); return (o && o.name) || m.en || m.name; };
  const mSub = m => (I18N.lang === 'en' ? '' : (m.en || ''));
  const mText = (m, k) => { const o = I18N.lang === 'en' && !m.custom ? I18N.move(m.id) : null; return (o && o[k]) || m[k]; };
  const catName = id => T('cat.' + id), catHint = id => T('cathint.' + id), lvlName = l => T('level.' + l);
  const dName = d => T('day.' + d.key), dShort = d => T('dayS.' + d.key);
  const hay = m => [m.name, m.en, mName(m), mText(m, 'desc'), (m.muscles || []).map(x => x + ' ' + TS(x)).join(' '), m.num].join(' ');
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);

  /* ---------- ذخیره‌سازی ---------- */
  function load() { try { const r = JSON.parse(localStorage.getItem(KEY)); if (r && typeof r === 'object') return r; } catch (e) {} return {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} schedulePrefs(); scheduleNotif(); }
  /* پلاگین‌های بومی Capacitor (فقط داخل اپ؛ در مرورگر undefined است) */
  const native = () => { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() ? (C.Plugins || {}) : null; };
  /* آینهٔ داده در @capacitor/preferences (SharedPreferences)؛ اگر WebView پاک شد، داده برمی‌گردد */
  let prefT = 0;
  function schedulePrefs() {
    const N = native(); if (!N || !N.Preferences) return;
    clearTimeout(prefT);
    prefT = setTimeout(() => { try { N.Preferences.set({ key: KEY, value: localStorage.getItem(KEY) || '' }); } catch (e) {} }, 400);
  }

  function buildPlan(src) {
    const p = {};
    DAYS.forEach(d => {
      const s = (src && src[d.key]) || {};
      p[d.key] = {
        title: s.title || '', rest: !!s.rest,
        items: (s.items || []).map(i => ({
          id: i.id || uid(), moveId: i.moveId, sets: +i.sets || 3, amount: +i.amount || 0,
          unit: i.unit || 'rep', rest: i.rest == null ? 60 : +i.rest, perSide: !!i.perSide, note: i.note || '',
          up: ['rep', 'sec', 'move', 'sets'].includes(i.up) ? i.up : ''
        }))
      };
    });
    return p;
  }
  /* چالش روزانه: today = انتخاب امروز، done = {YYYYMMDD: id چالش انجام‌شده} */
  function cleanCh(c) {
    const o = { today: null, done: {} };
    if (!c || typeof c !== 'object') return o;
    const t = c.today;
    if (t && +t.day > 20000101 && [1, 2, 3].includes(+t.lvl) && +t.id > 0) o.today = { day: +t.day, lvl: +t.lvl, id: +t.id, seen: (Array.isArray(t.seen) ? t.seen : []).map(Number).filter(Boolean).slice(0, 5), rerolls: Math.min(2, Math.max(0, +t.rerolls || 0)) };
    if (c.done && typeof c.done === 'object') Object.keys(c.done).filter(k => /^\d{8}$/.test(k)).sort().slice(-400).forEach(k => { o.done[k] = +c.done[k] || 0; });
    return o;
  }
  /* پروفایل کاربر؛ نسخه‌های قدیمی (آزمون سطح) را به سطح/قد تبدیل می‌کند */
  function cleanUser(u, old) {
    const n = (v, a, b) => { v = Math.round(+v); return v >= a && v <= b ? v : 0; };
    if ((!u || typeof u !== 'object') && old && [1, 2, 3].includes(+old.level)) u = { height: old.height, level: old.level, at: old.at };
    if (!u || typeof u !== 'object') return null;
    return { name: String(u.name || '').trim().slice(0, 30), age: n(u.age, 5, 100), height: n(u.height, 100, 230), weight: n(u.weight, 25, 250), level: [1, 2, 3].includes(+u.level) ? +u.level : 0, at: +u.at || 0 };
  }
  function cleanSkills(s) {
    const o = {}; if (!s || typeof s !== 'object') return o;
    Object.keys(s).slice(0, 300).forEach(id => { const v = s[id]; if (v && typeof v === 'object') o[id] = { at: +v.at || 0 }; });
    return o;
  }
  function cleanRecords(r) {
    const o = {}; if (!r || typeof r !== 'object') return o;
    Object.keys(r).slice(0, 300).forEach(id => { const v = r[id]; if (v && +v.v > 0 && +v.v < 100000) o[id] = { v: +v.v, u: v.u === 'sec' ? 'sec' : 'rep', at: +v.at || 0 }; });
    return o;
  }
  function normalize(d) {
    d = d && typeof d === 'object' ? d : {};
    const o = {
      theme: d.theme === 'light' || d.theme === 'dark' ? d.theme : null,
      lang: d.lang === 'en' || d.lang === 'fa' ? d.lang : (I18N.lang || 'fa'),
      customMoves: Array.isArray(d.customMoves) ? d.customMoves : [],
      notes: d.notes && typeof d.notes === 'object' ? d.notes : {},
      plan: buildPlan(d.plan),
      progress: { done: {}, sets: {}, cycle: 1, start: 0 },
      weeks: [],
      goals: (Array.isArray(d.goals) ? d.goals : []).map(g => ({ ...g, hist: Array.isArray(g.hist) ? g.hist : [] })),
      reminders: { on: !!(d.reminders && d.reminders.on), time: d.reminders && /^\d{2}:\d{2}$/.test(d.reminders.time) ? d.reminders.time : '18:00' },
      font: [1, 2, 3, 4].includes(+d.font) ? +d.font : 1,
      sound: d.sound !== false,
      vib: d.vib !== false,
      restSet: [15, 30, 45, 60, 90, 120].includes(+d.restSet) ? +d.restSet : 60,
      restMove: Math.min(600, Math.max(0, +d.restMove || 0)) || 180,
      user: cleanUser(d.user, d.profile),
      skills: cleanSkills(d.skills),
      records: cleanRecords(d.records),
      ch: cleanCh(d.ch),
      log: Array.isArray(d.log) ? d.log.filter(e => e && typeof e.t === 'number' && (e.k === 's' || e.k === 'd')) : []
    };
    if (d.progress) { o.progress.done = d.progress.done || {}; o.progress.sets = d.progress.sets || {}; o.progress.cycle = +d.progress.cycle || 1; o.progress.start = +d.progress.start || 0; }
    /* آرشیو هفته‌ها: هر هفته عکسی از برنامه + ست‌های انجام‌شده است */
    if (Array.isArray(d.weeks)) {
      const seen = new Set();
      o.weeks = d.weeks.filter(w => w && +w.n > 0 && !seen.has(+w.n) && seen.add(+w.n)).map(w => ({
        n: +w.n, start: +w.start || 0, end: +w.end || 0, plan: buildPlan(w.plan), done: w.done && typeof w.done === 'object' ? w.done : {}, sets: w.sets && typeof w.sets === 'object' ? w.sets : {}, level: +w.level || 0
      })).sort((a, b) => a.n - b.n).slice(-260);
    }
    const mx = o.weeks.reduce((m, w) => Math.max(m, w.n), 0); if (o.progress.cycle <= mx) o.progress.cycle = mx + 1;
    if (!o.progress.start) { const first = o.log.filter(e => e.c === o.progress.cycle && !e.demo).map(e => e.t); o.progress.start = first.length ? Math.min(...first) : Date.now(); }
    return o;
  }
  let D = normalize(load());

  /* ---------- فهرست حرکات (داخلی + شخصی) ---------- */
  let LIST = [], INDEX = new Map();
  function rebuild() {
    const custom = D.customMoves.map((m, i) => ({ ...m, custom: true, num: MOVES.length + i + 1 }));
    LIST = MOVES.map(m => ({ ...m, num: m.id })).concat(custom);
    INDEX = new Map(LIST.map(m => [String(m.id), m]));
  }
  const getMove = id => INDEX.get(String(id));
  rebuild();

  /* ---------- وضعیت لحظه‌ای ---------- */
  const todayKey = () => { const j = new Date().getDay(); return (DAYS.find(d => d.jsDay === j) || DAYS[0]).key; };
  const newDraft = () => ({ id: null, name: '', en: '', cat: 'push', level: 1, unit: 'rep', sets: 3, amount: 10, muscles: [], desc: '', steps: '', tips: '', mistakes: '' });
  const S = {
    view: 'home', f: { q: '', cat: 'all', level: 0, basic: false },
    exId: 1, exOpen: false, eq: '', ecat: 'all',
    day: todayKey(), draft: newDraft(), range: 30
  };
  let MS = null;      // وضعیت مودال فعال
  let CONFIRM = null; // callback تأیید
  let UNDO = null;

  /* ---------- ثبت تاریخچهٔ تمرین (برای بخش آمار) ---------- */
  function logSets(it, from, to) {
    const now = Date.now();
    for (let n = from; n <= to; n++) {
      D.log.push({ k: 's', t: now + (n - from), m: it.moveId, a: it.unit === 'max' ? 0 : it.amount, u: it.unit, ps: !!it.perSide, r: it.rest || 0, i: it.id, n, d: S.day, c: D.progress.cycle });
    }
  }
  function unlogSets(id, fromN) {
    D.log = D.log.filter(e => !(e.k === 's' && e.i === id && e.c === D.progress.cycle && e.n >= fromN));
  }
  function logDay(on) {
    const c = D.progress.cycle, d = S.day;
    D.log = D.log.filter(e => !(e.k === 'd' && e.d === d && e.c === c));
    if (on) D.log.push({ k: 'd', t: Date.now(), d, c });
  }
  function gBase(g) { if (!g.hist) g.hist = []; if (!g.hist.length) g.hist.push({ t: Date.now() - 1, v: g.current }); }
  function gMark(g) {
    if (!g.hist) g.hist = [];
    const l = g.hist[g.hist.length - 1];
    if (!l || l.v !== g.current) { g.hist.push({ t: Date.now(), v: g.current }); if (g.hist.length > 300) g.hist.splice(1, g.hist.length - 300); }
    if (g.target > 0 && g.current >= g.target) { if (!g.doneAt) g.doneAt = Date.now(); } else delete g.doneAt;
  }

  /* داده‌ی آزمایشی برای دیدن آمار (قابل حذف؛ تمرین‌های واقعی را لمس نمی‌کند) */
  function demoLoad() {
    let s = 20260611;
    const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const now = Date.now(), DM = 864e5, N = 110, out = [];
    for (let k = N; k >= 0; k--) {
      const date = new Date(now - k * DM), dk = (DAYS.find(d => d.jsDay === date.getDay()) || DAYS[0]).key, p = D.plan[dk];
      if (!p || p.rest || !p.items.length) continue;
      if (rnd() < 0.16 + (k > 60 ? 0.14 : 0)) continue;
      const prog = 1 - k / N, r = rnd();
      const hr = r < .2 ? 6 + Math.floor(rnd() * 3) : r < .34 ? 12 + Math.floor(rnd() * 2) : 17 + Math.floor(rnd() * 4);
      let t = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hr, Math.floor(rnd() * 50)).getTime(), full = true;
      p.items.forEach(it => {
        if (!getMove(it.moveId)) return;
        for (let n = 1; n <= it.sets; n++) {
          t += (n === 1 ? 45000 : (it.rest || 60) * 1000) + 25000 + rnd() * 20000;
          if (t > now) { full = false; return; }
          let a;
          if (it.unit === 'max') a = Math.round(4 + prog * 7 + rnd() * 3 - (n - 1) * rnd() * 1.5);
          else if (it.unit === 'sec') a = Math.round(it.amount * (0.7 + 0.45 * prog) + rnd() * 3 - (n - 1) * rnd());
          else a = Math.round(it.amount * (0.72 + 0.34 * prog) + rnd() * 3 - 1 - (n - 1) * rnd() * 1.2);
          out.push({ k: 's', t, m: it.moveId, a: Math.max(1, a), u: it.unit, ps: !!it.perSide, r: it.rest || 0, i: it.id, n, d: dk, c: 0, demo: true });
        }
      });
      if (full && rnd() < .85) out.push({ k: 'd', t: t + 60000, d: dk, c: 0, demo: true });
    }
    D.log = D.log.concat(out).sort((a, b) => a.t - b.t);
    const have = new Set(D.goals.map(g => g.title));
    const fin = [.72, .45, 1, .2];
    GOAL_PRESETS.slice(0, 4).forEach((P, i) => {
      if (have.has(P.title)) return;
      const cur = Math.round(P.target * fin[i]), pts = 8, hist = [];
      for (let j = 0; j < pts; j++) hist.push({ t: now - (70 - j * 9) * DM, v: Math.round(cur * (j / (pts - 1)) ** 1.2) });
      const g = { id: uid(), title: P.title, moveId: P.moveId, unit: P.unit, current: cur, target: P.target, hist, demo: true };
      if (cur >= P.target) g.doneAt = now - 3 * DM;
      D.goals.push(g);
    });
    save();
  }
  function demoClear() { D.log = D.log.filter(e => !e.demo); D.goals = D.goals.filter(g => !g.demo); save(); }

  /* ---------- زبان ---------- */
  function applyLang() { I18N.apply(); }

  /* ---------- تم ---------- */
  function applyTheme() {
    const t = D.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', t);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#090b0e' : '#f2f3ec';
    const N = native();
    if (N) {
      try { N.StatusBar && N.StatusBar.setStyle && N.StatusBar.setStyle({ style: t === 'dark' ? 'DARK' : 'LIGHT' }); } catch (e) {}
      try { N.StatusBar && N.StatusBar.setBackgroundColor && N.StatusBar.setBackgroundColor({ color: t === 'dark' ? '#090b0e' : '#f2f3ec' }); } catch (e) {}
      try { N.SystemBars && N.SystemBars.setStyle && N.SystemBars.setStyle({ style: t === 'dark' ? 'DARK' : 'LIGHT' }); } catch (e) {}
    }
  }

  /* ---------- قطعه‌های کوچک UI ---------- */
  const lvlHTML = l => `<span class="lvl" title="${T('c.level')}">${'<i>'}${[1, 2, 3].map(i => `<b class="${i <= l ? 'on' : ''}"></b>`).join('')}${'</i>'}${lvlName(l)}</span>`;
  const stepper = (ctx, k, val, o = {}) => {
    const { min = 0, max = 999, step = 1 } = o;
    return `<div class="stepper" data-min="${min}" data-max="${max}" data-step="${step}">
      <button type="button" data-act="step" data-ctx="${ctx}" data-k="${k}" data-d="-1" aria-label="${T('c.less')}">${ico('i-minus')}</button>
      <input inputmode="numeric" autocomplete="off" data-in="num" data-ctx="${ctx}" data-k="${k}" value="${fa(val)}" aria-label="${esc(k)}">
      <button type="button" data-act="step" data-ctx="${ctx}" data-k="${k}" data-d="1" aria-label="${T('c.more')}">${ico('i-plus')}</button></div>`;
  };
  const seg = (ctx, k, cur, opts) => `<div class="seg" role="group">${opts.map(([v, lb]) =>
    `<button type="button" data-act="seg" data-ctx="${ctx}" data-k="${k}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${lb}</button>`).join('')}</div>`;
  const cx = c => (c === 'm' ? (MS && MS.form) : S.draft);

  function amountLabel(it) {
    if (it.unit === 'max') return T('c.tomax');
    return it.unit === 'sec' ? `${fa(it.amount)} ${T('unit.sec')}` : `${fa(it.amount)} ${T('unit.rep')}`;
  }

  /* آیکون اختصاصی حرکت (js/icons.js)؛ برای حرکت‌های شخصی پیکتوگرام دسته */
  const moveIcon = m => (window.MOVE_ICONS && !m.custom && MOVE_ICONS[m.id])
    ? `<svg class="ico pict mv" viewBox="0 0 64 64" aria-hidden="true">${MOVE_ICONS[m.id]}</svg>`
    : ico('p-' + m.cat, 'pict');

  /* ---------- کارت حرکت ---------- */
  function cardHTML(m, o = {}) {
    const iso = m.iso || (m.rec && m.rec.unit === 'sec');
    return `<article class="mcard c-${m.cat}" ${o.preview ? '' : `data-act="open-move" data-id="${m.id}" tabindex="0" role="button" aria-label="${esc(mName(m))}"`}>
      <div class="art">
        ${moveIcon(m)}
        <div class="badges">${m.basic ? `<span class="badge basic">${ico('i-bolt')}${T('c.basic')}</span>` : ''}${m.custom ? `<span class="badge">${T('c.custom')}</span>` : ''}</div>
      </div>
      <h3>${esc(mName(m)) || `<span style="color:var(--faint)">${T('mv.name.ph')}</span>`}</h3>
      ${mSub(m) ? `<div class="en latin">${esc(mSub(m))}</div>` : ''}
      <div class="meta">${lvlHTML(m.level)}<span class="tag">${iso ? T('mv.hold') : T('mv.reps')}</span></div>
      ${m.muscles && m.muscles.length ? `<div class="muscles">${m.muscles.slice(0, 3).map(x => `<span class="tag">${esc(TS(x))}</span>`).join('')}</div>` : ''}
      ${o.preview ? '' : `<div class="actions">
        <button class="btn sm" data-act="open-move" data-id="${m.id}">${ico('i-book')}${T('mv.guide')}</button>
        <button class="btn sm primary" data-act="add-plan" data-id="${m.id}">${ico('i-plus')}${T('mv.toplan')}</button></div>`}
    </article>`;
  }

  /* ======================================================================
     بخش ۱ — حرکات
     ====================================================================== */
  function filtered() {
    const f = S.f, q = norm(f.q);
    return LIST.filter(m => {
      if (f.cat === 'mine' ? !m.custom : (f.cat !== 'all' && m.cat !== f.cat)) return false;
      if (f.level && m.level !== f.level) return false;
      if (f.basic && !m.basic) return false;
      if (q) {
        const h = norm(hay(m));
        return q.split(' ').every(w => h.includes(w));
      }
      return true;
    });
  }
  function viewMoves() {
    const f = S.f;
    const hasMine = D.customMoves.length > 0;
    return `<div class="toolbar">
      <div class="row">
        <label class="search">${ico('i-search')}<input class="input" id="q" type="search" data-in="q" placeholder="${T('mv.search')}" value="${esc(f.q)}" autocomplete="off"></label>
        <span class="result-count" id="rc"></span>
      </div>
      <div class="chips" role="group" aria-label="${T('mv.cats')}">
        <button class="chip" data-act="f-cat" data-v="all" aria-pressed="${f.cat === 'all'}">${T('c.all')}</button>
        ${CATEGORIES.map(c => `<button class="chip c-${c.id}" data-act="f-cat" data-v="${c.id}" aria-pressed="${f.cat === c.id}"><span class="dotc"></span>${catName(c.id)}</button>`).join('')}
        ${hasMine ? `<button class="chip c-mine" data-act="f-cat" data-v="mine" aria-pressed="${f.cat === 'mine'}"><span class="dotc"></span>${T('mv.mine')}</button>` : ''}
      </div>
      <div class="chips" role="group" aria-label="${T('mv.levels')}">
        ${[[0, T('mv.alllevels')], [1, lvlName(1)], [2, lvlName(2)], [3, lvlName(3)]].map(([v, lb]) => `<button class="chip" data-act="f-level" data-v="${v}" aria-pressed="${f.level === v}">${lb}</button>`).join('')}
        <button class="chip" data-act="f-basic" aria-pressed="${f.basic}">${ico('i-bolt')}${T('mv.basiconly')}</button>
      </div>
    </div>
    <div class="grid" id="mGrid"></div>`;
  }
  function fillGrid() {
    const list = filtered();
    $('#mGrid').innerHTML = list.length ? list.map(m => cardHTML(m)).join('')
      : `<div class="empty"><b>${T('mv.empty.t')}</b>${T('mv.empty.d')}</div>`;
    $('#rc').textContent = T('mv.count', { n: fa(list.length) });
  }

  /* ======================================================================
     بخش ۳ — توضیح حرکات
     ====================================================================== */
  const liHTML = (m, cur, act) => `<button class="li c-${m.cat}" type="button" data-act="${act}" data-id="${m.id}" ${cur ? 'aria-current="true"' : ''}>
      <span class="n">${fa(m.num)}</span><span style="display:grid;min-width:0"><span class="t">${esc(mName(m))}</span><span class="s">${catName(m.cat)} · ${lvlName(m.level)}</span></span></button>`;
  function viewExplain() {
    if (!getMove(S.exId)) S.exId = LIST[0].id;
    return `<div class="split ${S.exOpen ? 'open' : ''}" id="split">
      <aside class="list-pane">
        <label class="search">${ico('i-search')}<input class="input" data-in="eq" placeholder="${T('ex.search')}" value="${esc(S.eq)}" autocomplete="off"></label>
        <div class="chips" role="group">
          <button class="chip" data-act="ex-cat" data-v="all" aria-pressed="${S.ecat === 'all'}">${T('c.all')}</button>
          ${CATEGORIES.map(c => `<button class="chip c-${c.id}" data-act="ex-cat" data-v="${c.id}" aria-pressed="${S.ecat === c.id}"><span class="dotc"></span>${catName(c.id)}</button>`).join('')}
        </div>
        <div class="list-scroll" id="eList"></div>
      </aside>
      <div class="detail" id="detail"></div></div>`;
  }
  function fillExList() {
    const q = norm(S.eq);
    const list = LIST.filter(m => (S.ecat === 'all' || m.cat === S.ecat) && (!q || norm([m.name, m.en, mName(m), m.num].join(' ')).includes(q)));
    $('#eList').innerHTML = list.length ? list.map(m => liHTML(m, String(m.id) === String(S.exId), 'ex-pick')).join('') : `<div class="empty" style="padding:24px">${T('c.none')}</div>`;
  }
  function fillDetail() {
    const m = getMove(S.exId); if (!m) return;
    const steps = mText(m, 'steps') || [], tips = mText(m, 'tips') || [], mistakes = mText(m, 'mistakes') || [];
    const rich = steps.length;
    const chains = CHAINS.filter(c => c.ids.some(i => String(i) === String(m.id)));
    $('#detail').innerHTML = `
      <button class="btn back-btn" data-act="ex-back" style="justify-self:start">${ico('i-back')}${T('ex.back')}</button>
      <div class="hero c-${m.cat}">
        <span class="bignum" aria-hidden="true">${fa(m.num)}</span>
        ${moveIcon(m)}
        <span class="cat">${catName(m.cat)} · ${catHint(m.cat)}</span>
        <h2>${esc(mName(m))}</h2>
        ${mSub(m) ? `<div class="en latin">${esc(mSub(m))}</div>` : ''}
        <div class="pills">${lvlHTML(m.level)}${m.basic ? `<span class="badge basic">${ico('i-bolt')}${T('ex.basicmove')}</span>` : ''}${m.custom ? `<span class="badge">${T('c.custom')}</span>` : ''}
          ${m.rec ? `<span class="tag">${T('ex.suggest', { sets: fa(m.rec.sets), amt: m.rec.unit === 'max' ? T('c.tomax') : fa(m.rec.amount) + ' ' + (m.rec.unit === 'sec' ? T('unit.sec') : T('unit.rep')), side: m.rec.perSide ? ' (' + T('c.perside') + ')' : '' })}</span>` : ''}</div>
      </div>
      <div class="detail-actions c-${m.cat}">
        <button class="btn primary" data-act="add-plan" data-id="${m.id}">${ico('i-plus')}${T('ex.addplan')}</button>
        ${m.custom ? `<button class="btn" data-act="move-edit" data-id="${m.id}">${ico('i-edit')}${T('c.edit')}</button><button class="btn danger" data-act="move-del" data-id="${m.id}">${ico('i-trash')}${T('c.delete')}</button>` : ''}
      </div>
      <div class="panel c-${m.cat}">
        <h3>${ico('i-book')}${T('ex.about')}</h3>
        <p class="lead">${esc(mText(m, 'desc')) || `<span style="color:var(--faint)">${T('ex.nodesc')}</span>`}</p>
        ${m.muscles && m.muscles.length ? `<div><div class="lbl" style="margin-bottom:8px">${T('ex.muscles')}</div><div class="chips">${m.muscles.map(x => `<span class="chip">${esc(TS(x))}</span>`).join('')}</div></div>` : ''}
      </div>
      ${rich ? `<div class="panel c-${m.cat}"><h3>${ico('i-check')}${T('ex.steps')}</h3><ol class="steps">${steps.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol></div>` : `
      <div class="notice">${T('ex.nosteps')}</div>`}
      ${tips.length || mistakes.length ? `<div class="two">
        ${tips.length ? `<div class="panel"><h3>${ico('i-bolt')}${T('ex.tips')}</h3><ul class="bullets">${tips.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
        ${mistakes.length ? `<div class="panel"><h3>${ico('i-x')}${T('ex.mistakes')}</h3><ul class="bullets bad">${mistakes.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}</div>` : ''}
      ${chains.length ? `<div class="panel c-${m.cat}"><h3>${ico('i-up')}${T('ex.chain')}</h3>${chains.map(c => `
        <div><div class="chain-title">${T('ex.chain.sub', { name: esc(TS(c.name)) })}</div>
        <div class="chain">${c.ids.map((id, i) => { const x = getMove(id); return x ? `${i ? ico('i-back') : ''}<button data-act="ex-pick" data-id="${x.id}" ${String(x.id) === String(m.id) ? 'aria-current="true"' : ''}>${esc(mName(x))}</button>` : ''; }).join('')}</div></div>`).join('')}</div>` : ''}
      <div class="panel"><h3>${ico('i-edit')}${T('ex.note')}</h3>
        <textarea class="input" data-in="note" placeholder="${T('ex.note.ph')}">${esc(D.notes[m.id] || '')}</textarea></div>`;
    /* حرکت فعلی را در مسیر پیشرفت وسط نمایش بده */
    $('#detail').querySelectorAll('.chain').forEach(c => {
      const cur = c.querySelector('[aria-current="true"]'); if (!cur) return;
      c.scrollLeft += cur.getBoundingClientRect().left - c.getBoundingClientRect().left - (c.clientWidth - cur.offsetWidth) / 2;
    });
  }

  /* ======================================================================
     بخش ۲ — اهداف
     ====================================================================== */
  const goalPct = g => g.target > 0 ? clamp(Math.round(g.current / g.target * 100), 0, 100) : 0;
  const goalDone = g => g.target > 0 && g.current >= g.target;
  const goalStep = g => (g.unit === 'ثانیه' ? 5 : 1);   // مقدار ذخیره‌شده همیشه فارسی است؛ نمایش با TS ترجمه می‌شود
  function goalHTML(g) {
    const m = g.moveId != null ? getMove(g.moveId) : null;
    const done = goalDone(g), st = goalStep(g);
    return `<article class="goal ${done ? 'done' : ''} ${m ? 'c-' + m.cat : ''}" ${m ? '' : 'style="--c:var(--accent)"'}>
      <div class="top"><div><h3>${esc(TS(g.title))}</h3>${m ? `<button class="chip" style="margin-top:6px" data-act="open-move" data-id="${m.id}">${esc(mName(m))}</button>` : ''}</div>
        ${done ? `<span class="flag">${ico('i-check')}${T('g.done')}</span>` : ''}</div>
      <div class="nums"><b>${fa(g.current)}</b><span>${T('g.of', { n: fa(g.target), u: esc(I18N.tu(g.target, g.unit)) })}</span><em>${T('s.pct', { n: fa(goalPct(g)) })}</em></div>
      <div class="bar" role="progressbar" aria-valuenow="${goalPct(g)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${goalPct(g)}%"></i></div>
      <div class="ctrl">
        <button class="btn sm" data-act="g-inc" data-id="${g.id}" data-d="-1" aria-label="${T('c.less')}">${ico('i-minus')}${fa(st)}</button>
        <button class="btn sm primary" data-act="g-inc" data-id="${g.id}" data-d="1" aria-label="${T('c.more')}">${ico('i-plus')}${fa(st)}</button>
        <span class="grow"></span>
        <button class="mini" data-act="goal-edit" data-id="${g.id}" aria-label="${T('c.edit')}">${ico('i-edit')}</button>
        <button class="mini del" data-act="goal-del" data-id="${g.id}" aria-label="${T('c.delete')}">${ico('i-trash')}</button>
      </div></article>`;
  }
  function viewGoals() {
    const total = D.goals.length, done = D.goals.filter(goalDone).length;
    const sorted = [...D.goals].sort((a, b) => goalDone(a) - goalDone(b));
    const have = new Set(D.goals.map(g => g.title));
    const presets = GOAL_PRESETS.filter(p => !have.has(p.title));
    return `<div class="stats">
        <div class="stat"><b>${fa(total)}</b><span>${T('g.total')}</span></div>
        <div class="stat"><b>${fa(total - done)}</b><span>${T('g.active')}</span></div>
        <div class="stat hl"><b>${fa(done)}</b><span>${T('g.reached')}</span></div>
      </div>
      <div class="section-head"><h2>${T('g.mine')}</h2><button class="btn primary" data-act="goal-new">${ico('i-plus')}${T('g.new')}</button></div>
      <div class="goal-list">${sorted.length ? sorted.map(goalHTML).join('') : `<div class="empty" style="grid-column:1/-1"><b>${T('g.empty.t')}</b>${T('g.empty.d')}</div>`}</div>
      ${presets.length ? `<div class="section-head"><h2>${T('g.presets')}</h2></div>
      <div class="presets">${presets.map(p => `<button class="preset" data-act="g-preset" data-t="${esc(p.title)}">${ico('i-goal')}<span><b>${esc(TS(p.title))}</b><small>${T('g.target', { n: fa(p.target), u: esc(I18N.tu(p.target, p.unit)) })}</small></span></button>`).join('')}</div>` : ''}`;
  }
  function goalModal(id) {
    const g = id ? D.goals.find(x => x.id === id) : null;
    MS = { kind: 'goal', id, form: g ? { ...g } : { title: '', moveId: null, unit: 'تکرار', current: 0, target: 10 } };
    const f = MS.form;
    const opts = CATEGORIES.map(c => `<optgroup label="${catName(c.id)}">${LIST.filter(m => m.cat === c.id).map(m => `<option value="${m.id}" ${String(f.moveId) === String(m.id) ? 'selected' : ''}>${esc(mName(m))}</option>`).join('')}</optgroup>`).join('');
    openModal({
      title: g ? T('g.edit') : T('g.new'),
      body: `<div class="field"><label>${T('g.title')}</label><input class="input" data-in="text" data-ctx="m" data-k="title" value="${esc(TS(f.title))}" placeholder="${T('g.title.ph')}" maxlength="60"></div>
        <div class="field"><label>${T('g.move')}</label><select class="input" data-in="sel" data-ctx="m" data-k="moveId"><option value="">${T('g.nomove')}</option>${opts}</select></div>
        <div class="row2">
          <div class="field"><label>${T('g.unit')}</label><select class="input" data-in="sel" data-ctx="m" data-k="unit">${GOAL_UNITS.map(u => `<option value="${u}" ${u === f.unit ? 'selected' : ''}>${TS(u)}</option>`).join('')}</select></div>
          <div class="field"><label>${T('g.current')}</label>${stepper('m', 'current', f.current, { max: 99999 })}</div>
        </div>
        <div class="field"><label>${T('g.targetv')}</label>${stepper('m', 'target', f.target, { min: 1, max: 99999 })}</div>`,
      foot: `<button class="btn ghost" data-act="close">${T('c.cancel')}</button><button class="btn primary" data-act="goal-save">${ico('i-check')}${T('c.save')}</button>`
    });
  }

  /* ======================================================================
     بخش ۴ — برنامه تمرینی
     ====================================================================== */
  const dayItems = k => D.plan[k].items;
  const dayStats = k => {
    const its = dayItems(k); let t = 0, d = 0;
    its.forEach(i => { t += i.sets; d += clamp(D.progress.sets[i.id] || 0, 0, i.sets); });
    return { t, d, n: its.length, complete: its.length > 0 && its.every(i => (D.progress.sets[i.id] || 0) >= i.sets) };
  };
  function weekSummary() {
    const train = DAYS.filter(d => !D.plan[d.key].rest);
    const done = train.filter(d => D.progress.done[d.key]).length;
    return { n: train.length, done, pct: train.length ? Math.round(done / train.length * 100) : 0 };
  }
  function exHTML(it, i, last) {
    const m = getMove(it.moveId);
    const dn = clamp(D.progress.sets[it.id] || 0, 0, it.sets);
    const complete = dn >= it.sets;
    if (!m) return `<li class="ex c-core"><span class="idx">${fa(i + 1)}</span><div class="info"><h4>${T('p.gone.t')}</h4><span class="note">${T('p.gone.d')}</span></div><div class="tools"><button class="mini del" data-act="ex-del" data-id="${it.id}" aria-label="${T('c.delete')}">${ico('i-trash')}</button></div></li>`;
    return `<li class="ex c-${m.cat} ${complete ? 'complete' : ''}">
      <span class="idx">${fa(i + 1)}</span>
      <div class="info">
        <h4 data-act="open-move" data-id="${m.id}" title="${T('p.viewguide')}">${esc(mName(m))}</h4>
        <div class="spec"><span>${T('p.spec', { sets: fa(it.sets), amt: amountLabel(it), side: it.perSide ? ' (' + T('c.perside') + ')' : '' })}</span>${it.rest ? `<span>${T('p.rest', { n: fa(it.rest) })}</span>` : ''}${it.up ? `<span class="badge up">${ico('i-up')}${T('up.' + it.up)}</span>` : ''}</div>
        ${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}
        <div class="sets" role="group" aria-label="${T('p.setsdone')}">${Array.from({ length: it.sets }, (_, s) => `<button class="set ${s < dn ? 'on' : ''}" data-act="set" data-id="${it.id}" data-n="${s + 1}" aria-pressed="${s < dn}" aria-label="${T('p.setn', { n: s + 1 })}">${fa(s + 1)}</button>`).join('')}${dn ? `<button class="set actual" data-act="set-actual" data-id="${it.id}" title="${T('p.actual')}" aria-label="${T('p.actual.s')}">${ico('i-edit')}</button>` : ''}</div>
      </div>
      <div class="tools"><div class="row">
        <button class="mini" data-act="ex-up" data-id="${it.id}" ${i === 0 ? 'disabled style="opacity:.3"' : ''} aria-label="${T('c.up')}">${ico('i-up')}</button>
        <button class="mini" data-act="ex-down" data-id="${it.id}" ${last ? 'disabled style="opacity:.3"' : ''} aria-label="${T('c.down')}">${ico('i-down')}</button></div>
        <div class="row"><button class="mini" data-act="ex-edit" data-id="${it.id}" aria-label="${T('c.edit')}">${ico('i-edit')}</button>
        <button class="mini del" data-act="ex-del" data-id="${it.id}" aria-label="${T('c.delete')}">${ico('i-trash')}</button></div></div>
    </li>`;
  }
  function weekStripHTML() {
    const tk = tdKey();
    return `${weekBarHTML()}<div class="week-strip" role="tablist">${DAYS.map(d => {
      const p = D.plan[d.key], done = !!D.progress.done[d.key];
      return `<button class="day-tab ${done ? 'done' : ''} ${p.rest ? 'rest' : ''}" role="tab" data-act="day-pick" data-k="${d.key}" aria-current="${S.day === d.key}" aria-selected="${S.day === d.key}">
        ${d.key === tk ? `<span class="today">${T('c.today')}</span>` : ''}
        <span class="dn"><span class="full">${dName(d)}</span><span class="abbr" aria-hidden="true">${dShort(d)}</span></span><span class="dt">${esc(TS(p.title)) || (p.rest ? T('p.restday') : '—')}</span>
        <span class="st">${p.rest && !done ? ico('i-moon-rest') : ico('i-check')}</span></button>`;
    }).join('')}</div>`;
  }
  function dayPanelHTML() {
    const k = S.day, d = DAYS.find(x => x.key === k), p = D.plan[k], st = dayStats(k), done = !!D.progress.done[k];
    const pct = st.t ? Math.round(st.d / st.t * 100) : 0;
    return `<div class="day-panel">
      <div class="day-head">
        <div class="who"><h2>${dName(d)}${k === tdKey() ? ` <span class="badge basic">${T('c.today')}</span>` : ''}</h2>
          <input class="title-input" data-in="day-title" value="${esc(TS(p.title))}" placeholder="${T('p.day.title')}" maxlength="40" aria-label="${T('p.day.title.a')}"></div>
        ${p.rest || !p.items.length ? '' : `<button class="btn primary start-btn" data-act="wk-start">${ico('i-play')}${T('ws.start')}</button>`}
        <button class="done-btn" data-act="day-done" aria-pressed="${done}"><span class="box">${ico('i-check')}</span>${T('p.done')}</button>
      </div>
      <div class="day-meta">
        <button class="chip" data-act="day-rest" aria-pressed="${p.rest}">${ico('i-moon-rest')}${T('p.restchip')}</button>
        ${p.rest ? '' : `<div class="day-bar"><div class="bar"><i style="width:${pct}%"></i></div><small>${T('p.setsprog', { d: fa(st.d), t: fa(st.t) })}</small></div>`}
      </div>
      ${p.rest ? `<div class="rest-box"><b>${T('p.restbox.t')}</b>${T('p.restbox.d')}</div>`
        : (p.items.length ? `<ul class="ex-list">${p.items.map((it, i) => exHTML(it, i, i === p.items.length - 1)).join('')}</ul>` : `<div class="empty" style="grid-column:auto"><b>${T('p.empty.t')}</b>${T('p.empty.d')}</div>`)}
      ${p.rest ? '' : `<div class="plan-foot"><button class="btn primary" data-act="ex-add">${ico('i-plus')}${T('p.addto', { day: dName(d) })}</button></div>`}
    </div>
    <div class="plan-foot" style="margin-top:14px"><button class="btn sm" data-act="wk-next">${ico('i-up')}${T('p.newweek')}</button></div>`;
  }
  function viewPlan() { return `<div id="weekStrip">${weekStripHTML()}</div><div id="dayPanel">${dayPanelHTML()}</div>`; }
  function refreshPlan() {
    const ws = $('#weekStrip'); if (!ws) return;
    ws.innerHTML = weekStripHTML(); $('#dayPanel').innerHTML = dayPanelHTML(); chrome();
  }

  /* مودال افزودن/ویرایش حرکت در برنامه */
  function recFor(m) {
    const r = (m && m.rec) || { sets: 3, amount: m && m.iso ? 20 : 10, unit: m && m.iso ? 'sec' : 'rep' };
    return { sets: r.sets, amount: r.amount, unit: r.unit, perSide: !!r.perSide };
  }
  function planModal({ day, itemId, moveId }) {
    const it = itemId ? dayItems(day).find(x => x.id === itemId) : null;
    const base = it ? { ...it } : { moveId: moveId != null ? moveId : null, ...recFor(getMove(moveId)), rest: D.restSet || 60, note: '' };
    MS = { kind: 'plan', day, itemId, form: base, q: '' };
    const f = base;
    openModal({
      title: it ? T('p.pm.edit') : T('p.pm.add'),
      body: `${it ? '' : `<div class="field"><span class="lbl">${T('p.pm.day')}</span><div class="day-pick" id="dayPick">${DAYS.map(d => `<button type="button" data-act="pm-day" data-v="${d.key}" aria-pressed="${d.key === day}">${dName(d)}</button>`).join('')}</div></div>`}
        <div class="field"><span class="lbl">${T('p.pm.move')}</span>
          <label class="search">${ico('i-search')}<input class="input" data-in="pmq" placeholder="${T('p.pm.search')}" autocomplete="off"></label>
          <div class="pick-list" id="pmList"></div></div>
        <div class="row2">
          <div class="field"><span class="lbl">${T('p.pm.sets')}</span>${stepper('m', 'sets', f.sets, { min: 1, max: 20 })}</div>
          <div class="field"><span class="lbl">${T('p.pm.rest')}</span>${stepper('m', 'rest', f.rest, { min: 0, max: 600, step: 15 })}</div>
        </div>
        <div class="field"><span class="lbl">${T('p.pm.type')}</span>${seg('m', 'unit', f.unit, [['rep', T('unit.rep')], ['sec', T('unit.sec')], ['max', T('c.tomax')]])}</div>
        <div class="row2">
          <div class="field" id="amountField" ${f.unit === 'max' ? 'hidden' : ''}><span class="lbl" id="amountLbl">${f.unit === 'sec' ? T('p.pm.dur') : T('p.pm.reps')}</span>${stepper('m', 'amount', f.amount, { min: 1, max: 999, step: f.unit === 'sec' ? 5 : 1 })}</div>
          <div class="field"><span class="lbl">${T('p.pm.oneside')}</span><div><button type="button" class="chip" data-act="toggle" data-k="perSide" aria-pressed="${!!f.perSide}">${T('p.pm.eachside')}</button></div></div>
        </div>
        <div class="field"><label>${T('p.pm.note')}</label><input class="input" data-in="text" data-ctx="m" data-k="note" value="${esc(f.note)}" placeholder="${T('p.pm.note.ph')}" maxlength="80"></div>`,
      foot: `<button class="btn ghost" data-act="close">${T('c.cancel')}</button><button class="btn primary" data-act="pm-save">${ico('i-check')}${it ? T('c.save') : T('c.add')}</button>`
    });
    fillPick();
  }
  function fillPick() {
    const el = $('#pmList'); if (!el) return;
    const q = norm(MS.q);
    const list = LIST.filter(m => !q || norm(hay(m)).includes(q));
    el.innerHTML = list.length ? list.slice(0, 80).map(m => liHTML(m, String(m.id) === String(MS.form.moveId), 'pm-pick')).join('') : `<div class="notice" style="margin:6px">${T('c.none')}</div>`;
    const cur = el.querySelector('[aria-current="true"]'); if (cur && !q) cur.scrollIntoView({ block: 'nearest' });
  }

  /* ======================================================================
     هفته‌ها: شمارهٔ هفته، آرشیو، پیشنهاد پیشرفت، تاریخچه
     برنامه هر هفته ریست نمی‌شود؛ با «شروع هفتهٔ بعد» عکسی از هفته در D.weeks ذخیره می‌شود
     و همان برنامه (با ارتقاهای انتخابی) برای هفتهٔ بعد ادامه پیدا می‌کند.
     ====================================================================== */
  const weekNo = () => D.progress.cycle || 1;
  /* هفتهٔ جدید همیشه از شنبه شروع می‌شود؛ اگر وسط هفته ثبتش کنی، تا شنبه «در انتظار» است و هیچ روزی «امروز» نیست */
  const pendingWeek = () => D.progress.start > Date.now();
  const tdKey = () => (pendingWeek() ? null : todayKey());
  function nextWeekStart() {
    const d = new Date(); d.setHours(0, 0, 0, 0); const j = d.getDay();
    const sat = (DAYS.find(x => x.key === 'sat') || {}).jsDay; if (j === sat) return Date.now();
    d.setDate(d.getDate() + ((sat - j + 7) % 7)); return d.getTime();
  }
  const sinceTxt = () => T(pendingWeek() ? 'wk.starts' : 'wk.since', { d: esc(fmtDay(D.progress.start)) });
  const maxSaved = () => D.weeks.reduce((m, w) => Math.max(m, w.n), 0);
  const nextNo = () => Math.max(weekNo(), maxSaved()) + 1;
  const hasProgress = () => Object.values(D.progress.sets).some(v => v > 0) || Object.values(D.progress.done).some(Boolean);
  const clone = o => JSON.parse(JSON.stringify(o));
  const fmtDay = ts => { try { return ts ? new Intl.DateTimeFormat(I18N.locale, { day: 'numeric', month: 'long' }).format(new Date(ts)) : ''; } catch (e) { return ''; } };
  const rangeTxt = (a, b) => { const x = fmtDay(a), y = b ? fmtDay(b) : ''; return y && y !== x ? x + ' – ' + y : x; };
  const arrow = () => (I18N.dir === 'rtl' ? '←' : '→');
  function weekStat(plan, done, sets) {
    let days = 0, dn = 0, st = 0, sd = 0, up = 0;
    DAYS.forEach(d => {
      const p = plan[d.key]; if (!p || p.rest || !p.items.length) return;
      days++; if (done[d.key]) dn++;
      p.items.forEach(i => { st += i.sets; sd += clamp(sets[i.id] || 0, 0, i.sets); if (i.up) up++; });
    });
    return { days, dn, st, sd, up, pct: st ? Math.round(sd / st * 100) : 0 };
  }
  const curStat = () => weekStat(D.plan, D.progress.done, D.progress.sets);
  function archiveWeek() {
    const n = weekNo();
    D.weeks = D.weeks.filter(w => w.n !== n);
    D.weeks.push({ n, start: D.progress.start, end: Date.now(), plan: clone(D.plan), done: { ...D.progress.done }, sets: { ...D.progress.sets }, level: (D.user && D.user.level) || 0 });
    D.weeks.sort((a, b) => a.n - b.n); if (D.weeks.length > 260) D.weeks.shift();
  }
  /* جایگزینی کل برنامه (برنامهٔ نمونه، آزمون سطح، استفاده از هفتهٔ قدیمی): هفتهٔ فعلی اگر چیزی ثبت شده بود آرشیو می‌شود */
  function replacePlan(plan) {
    if (hasProgress()) { archiveWeek(); D.progress = { done: {}, sets: {}, cycle: nextNo(), start: Date.now() }; }
    else D.progress = { done: {}, sets: {}, cycle: weekNo(), start: Date.now() };
    D.plan = plan;
  }

  /* --- پیشنهاد پیشرفت --- */
  const nextVariation = id => {
    for (const c of CHAINS) { const i = c.ids.findIndex(x => String(x) === String(id)); if (i >= 0 && i < c.ids.length - 1) { const nx = getMove(c.ids[i + 1]); if (nx) return nx; } }
    return null;
  };
  function avgActual(it) {
    const a = D.log.filter(e => e.k === 's' && e.i === it.id && e.c === weekNo() && e.a > 0).map(e => e.a);
    return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  }
  function suggestFor(it, sibs) {
    const m = getMove(it.moveId); if (!m) return { kind: 'hold', why: 'gone' };
    if ((D.progress.sets[it.id] || 0) < it.sets) return { kind: 'hold', why: 'part' };
    let nx = nextVariation(it.moveId); const avg = avgActual(it);
    if (nx && (sibs || []).some(x => x !== it && String(x.moveId) === String(nx.id))) nx = null;   /* حرکت سخت‌تر همان روز در برنامه هست */
    const toVar = () => ({ kind: 'move', to: nx.id, ...recFor(nx), sets: it.sets });
    if (it.unit === 'max') return nx && avg >= 12 ? toVar() : { kind: 'hold', why: nx ? 'max' : 'maxflat' };
    if (avg && avg < it.amount * 0.9) return { kind: 'hold', why: 'under' };
    if (it.unit === 'sec') {
      if (it.amount >= 30 && nx) return toVar();
      if (it.amount >= 60 && it.sets < 5) return { kind: 'sets', sets: it.sets + 1 };
      return it.amount >= 120 ? { kind: 'hold', why: 'cap' } : { kind: 'sec', amount: Math.min(120, it.amount + 5) };
    }
    if (it.amount >= 12 && nx) return toVar();
    if (it.amount >= 12 && it.sets < 5) return { kind: 'sets', sets: it.sets + 1 };
    return it.amount >= 40 ? { kind: 'hold', why: 'cap' } : { kind: 'rep', amount: it.amount + (it.amount >= 12 ? 2 : 1) };
  }
  function sugText(it, s) {
    if (s.kind === 'hold') return T('nw.why.' + s.why);
    if (s.kind === 'move') { const m = getMove(s.to); return `${arrow()} ${esc(mName(m))} · ${fa(s.sets)} × ${amountLabel(s)}`; }
    if (s.kind === 'sets') return `${fa(it.sets)} ${arrow()} ${fa(s.sets)} ${T('nw.sets')}`;
    return `${amountLabel(it)} ${arrow()} ${amountLabel({ ...it, amount: s.amount })}`;
  }

  /* --- پیش‌نمایش هفتهٔ بعد: هر حرکت یک «پیش‌نویس» دارد که با پیشنهاد پر می‌شود و کاربر می‌تواند
         حرکت را عوض کند یا ست و تکرار/ثانیه را کم و زیاد کند؛ فقط با «شروع هفته» روی برنامه اعمال می‌شود --- */
  const itemBase = it => ({ moveId: it.moveId, sets: it.sets, amount: it.amount, unit: it.unit, perSide: !!it.perSide });
  function draftFromSug(it, s) {
    const d = itemBase(it);
    if (s.kind === 'rep' || s.kind === 'sec') d.amount = s.amount;
    else if (s.kind === 'sets') d.sets = s.sets;
    else if (s.kind === 'move') Object.assign(d, { moveId: s.to, amount: s.amount, unit: s.unit, perSide: !!s.perSide });
    return d;
  }
  const sameD = (a, b) => String(a.moveId) === String(b.moveId) && a.sets === b.sets && a.unit === b.unit && (a.unit === 'max' || a.amount === b.amount) && !!a.perSide === !!b.perSide;
  function nwChangeText(o, d) {
    const now = `${fa(d.sets)} × ${amountLabel(d)}`;
    if (String(d.moveId) !== String(o.moveId)) { const m0 = getMove(o.moveId); return `${T('nw.from', { name: esc(m0 ? mName(m0) : '') })} · ${now}`; }
    return `${fa(o.sets)} × ${amountLabel(o)} ${arrow()} ${now}`;
  }
  function nwStep(id, f, val, lab) {
    return `<div class="nw-f"><span class="lb">${lab}</span><div class="nw-st">
      <button type="button" data-act="nw-adj" data-id="${id}" data-f="${f}" data-d="-1" aria-label="${T('c.less')}: ${lab}">${ico('i-minus')}</button><b>${fa(val)}</b>
      <button type="button" data-act="nw-adj" data-id="${id}" data-f="${f}" data-d="1" aria-label="${T('c.more')}: ${lab}">${ico('i-plus')}</button></div></div>`;
  }
  function nwRow(it) {
    const m0 = getMove(it.moveId), s = MS.sug[it.id], d = MS.draft[it.id], o = MS.orig[it.id]; if (!m0 || !s || !d) return '';
    const m = getMove(d.moveId) || m0, hold = s.kind === 'hold', changed = !sameD(d, o), applied = !hold && sameD(d, draftFromSug(it, s));
    const hint = changed ? nwChangeText(o, d) : (hold ? T('nw.why.' + s.why) : T('nw.sug', { t: sugText(it, s) }));
    return `<div class="nw-item c-${m.cat} ${hold ? 'hold' : ''} ${changed ? 'chg' : ''}" id="nwr-${it.id}">
      <div class="nw-top">
        <button type="button" class="nw-main" data-act="nw-toggle" data-id="${it.id}" aria-pressed="${applied}" ${hold ? 'disabled' : ''}>
          <span class="box">${applied ? ico('i-check') : ''}</span>
          <span class="tx"><b>${esc(mName(m))}</b><small>${hint}</small></span></button>
        <button type="button" class="mini" data-act="nw-swap" data-id="${it.id}" aria-label="${T('nw.swap')}" title="${T('nw.swap')}">${ico('i-repeat')}</button></div>
      <div class="nw-ctl">${nwStep(it.id, 'sets', d.sets, T('nw.sets'))}${d.unit === 'max' ? '' : nwStep(it.id, 'amount', d.amount, d.unit === 'sec' ? T('unit.sec') : T('unit.rep'))}</div></div>`;
  }
  function nwList() {
    return DAYS.map(d => {
      const p = D.plan[d.key]; if (p.rest || !p.items.length) return '';
      return `<div class="nw-day"><h5>${dName(d)}${p.title ? ' · ' + esc(TS(p.title)) : ''}</h5>${p.items.map(nwRow).join('')}</div>`;
    }).join('');
  }
  function nwSumHTML() {
    let a = 0, b = 0, n = 0;
    Object.keys(MS.items).forEach(id => { const d = MS.draft[id], o = MS.orig[id]; a += o.sets; b += d.sets; if (!sameD(d, o)) n++; });
    return n ? T('nw.delta', { n: fa(n), a: fa(a), b: fa(b) }) : T('nw.delta0', { a: fa(a) });
  }
  function nwUpdate(id, focusSel) {
    const r = $('#nwr-' + id); if (r) r.outerHTML = nwRow(MS.items[id]);
    const s = $('#nwSum2'); if (s) s.innerHTML = nwSumHTML();
    if (focusSel) { const f = $(focusSel); if (f && !f.disabled) f.focus(); }
  }
  function nwAll(on) {
    Object.keys(MS.items).forEach(id => { const it = MS.items[id], s = MS.sug[id]; MS.draft[id] = on && s.kind !== 'hold' ? draftFromSug(it, s) : itemBase(it); });
    $('#nwList').innerHTML = nwList(); $('#nwSum2').innerHTML = nwSumHTML();
  }
  function fillNwPick() {
    const el = $('#nwPickList'); if (!el || !MS.pick) return;
    const q = norm(MS.q), cur = MS.draft[MS.pick], cat = (getMove(MS.orig[MS.pick].moveId) || {}).cat;
    let list = LIST.filter(m => !q || norm(hay(m)).includes(q));
    if (!q) list = [...list.filter(m => m.cat === cat), ...list.filter(m => m.cat !== cat)];
    el.innerHTML = list.length ? list.slice(0, 80).map(m => liHTML(m, String(m.id) === String(cur.moveId), 'nw-pick')).join('') : `<div class="notice" style="margin:6px">${T('c.none')}</div>`;
  }
  function nwShowPick(on) {
    $('#nwMain').hidden = on; $('#nwPick').hidden = !on;
    const b = modal.querySelector('.m-body'); if (b) b.scrollTop = 0;
  }
  function newWeekModal() {
    const sug = {}, draft = {}, orig = {}, items = {};
    DAYS.forEach(d => { const p = D.plan[d.key]; if (p.rest) return; p.items.forEach(it => {
      if (!getMove(it.moveId)) return;
      const s = suggestFor(it, p.items); sug[it.id] = s; items[it.id] = it; orig[it.id] = itemBase(it); draft[it.id] = s.kind === 'hold' ? itemBase(it) : draftFromSug(it, s);
    }); });
    MS = { kind: 'newweek', sug, draft, orig, items, pick: null, q: '' };
    const st = curStat(), n = nextNo(), any = Object.values(sug).some(s => s.kind !== 'hold');
    openModal({
      title: T('nw.title', { n: fa(n) }),
      body: `<div id="nwMain" class="nw-main-wrap"><p class="nw-sum">${T('nw.sum', { n: fa(weekNo()), dn: fa(st.dn), days: fa(st.days), sd: fa(st.sd), st: fa(st.st) })}</p>
        <p class="nw-hint">${any ? T('nw.hint') : T('nw.none')}</p>
        <div class="chips"><button class="chip" data-act="nw-all" data-v="1">${T('nw.all')}</button><button class="chip" data-act="nw-all" data-v="0">${T('nw.nothing')}</button></div>
        <p class="nw-delta" id="nwSum2">${nwSumHTML()}</p>
        <div id="nwList" class="nw-list">${nwList()}</div></div>
        <div id="nwPick" hidden class="nw-main-wrap">
          <button type="button" class="btn sm" data-act="nw-pickback">${T('nw.pick.back')}</button>
          <p class="nw-hint" id="nwPickFor"></p>
          <label class="search">${ico('i-search')}<input class="input" data-in="nwq" placeholder="${T('p.pm.search')}" autocomplete="off"></label>
          <div class="pick-list" id="nwPickList"></div></div>`,
      foot: `<button class="btn ghost" data-act="close">${T('c.cancel')}</button><button class="btn primary" data-act="nw-go">${ico('i-check')}${T('nw.go', { n: fa(n) })}</button>`
    });
  }
  function newWeekGo() {
    const { draft } = MS, n = nextNo();
    const prev = { plan: clone(D.plan), progress: clone(D.progress), weeks: clone(D.weeks) };
    archiveWeek();
    DAYS.forEach(d => D.plan[d.key].items.forEach(it => {
      it.up = ''; const dr = draft[it.id]; if (!dr) return;
      if (String(dr.moveId) !== String(it.moveId)) it.up = 'move';
      else if (dr.unit === it.unit && dr.amount > it.amount) it.up = dr.unit === 'sec' ? 'sec' : 'rep';
      else if (dr.sets > it.sets) it.up = 'sets';
      Object.assign(it, { moveId: dr.moveId, sets: dr.sets, amount: dr.amount, unit: dr.unit, perSide: !!dr.perSide });
    }));
    D.progress = { done: {}, sets: {}, cycle: n, start: nextWeekStart() };
    S.day = tdKey() || DAYS[0].key; save(); closeModal(); render();
    toast(T('nw.done', { n: fa(n) }), () => { D.plan = prev.plan; D.progress = prev.progress; D.weeks = prev.weeks; save(); render(); });
  }

  /* --- نوار هفته در صفحهٔ برنامه --- */
  function weekBarHTML() {
    const st = curStat();
    return `<div class="wk-bar"><div class="wk-id"><b>${T('wk.week', { n: fa(weekNo()) })}</b><small>${sinceTxt()} · ${T('wk.prog', { d: fa(st.dn), t: fa(st.days) })}</small></div>
      <div class="wk-acts"><button class="btn sm primary" data-act="wk-next">${ico('i-up')}${T('nw.cta')}</button><button class="btn sm" data-act="nav" data-v="weeks">${ico('i-layers')}${T('wk.history')}</button></div></div>`;
  }

  /* --- نمای «هفته‌های قبل» --- */
  function weekCardHTML(w) {
    const st = weekStat(w.plan, w.done, w.sets);
    return `<article class="wk-card">
      <div class="top"><div><h3>${T('wk.week', { n: fa(w.n) })}</h3><small>${esc(rangeTxt(w.start, w.end))}</small></div>
        ${st.days && st.dn >= st.days ? `<span class="flag">${ico('i-check')}${T('wv.full')}</span>` : ''}</div>
      <div class="bar" role="progressbar" aria-valuenow="${st.pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${st.pct}%"></i></div>
      <div class="chips"><span class="tag">${T('wk.prog', { d: fa(st.dn), t: fa(st.days) })}</span><span class="tag">${T('wv.sets', { d: fa(st.sd), t: fa(st.st) })}</span>${st.up ? `<span class="tag up">${ico('i-up')}${T('wv.ups', { n: fa(st.up) })}</span>` : ''}</div>
      <div class="ctrl"><button class="btn sm primary" data-act="wk-view" data-n="${w.n}">${ico('i-eye')}${T('wv.view')}</button><span class="grow"></span>
        <button class="mini del" data-act="wk-del" data-n="${w.n}" aria-label="${T('c.delete')}">${ico('i-trash')}</button></div></article>`;
  }
  function viewWeeks() {
    const st = curStat(), list = [...D.weeks].sort((a, b) => b.n - a.n);
    return `<section class="wk-cur">
        <div class="wk-cur-h"><div><span class="hm-k">${T('wv.current')}</span><h2>${T('wk.week', { n: fa(weekNo()) })}</h2><small>${sinceTxt()}</small></div>
          <button class="mini" data-act="wk-no" aria-label="${T('wv.editno')}" title="${T('wv.editno')}">${ico('i-edit')}</button></div>
        <div class="bar"><i style="width:${st.pct}%"></i></div>
        <div class="chips"><span class="tag">${T('wk.prog', { d: fa(st.dn), t: fa(st.days) })}</span><span class="tag">${T('wv.sets', { d: fa(st.sd), t: fa(st.st) })}</span>${st.up ? `<span class="tag up">${ico('i-up')}${T('wv.ups', { n: fa(st.up) })}</span>` : ''}</div>
        <p>${T('wv.cur.d')}</p>
        <button class="btn primary" data-act="wk-next">${ico('i-up')}${T('p.newweek')}</button></section>
      <div class="section-head"><h2>${T('wv.saved')}</h2><span class="tag">${fa(list.length)}</span></div>
      <div class="wk-list">${list.length ? list.map(weekCardHTML).join('') : `<div class="empty" style="grid-column:1/-1"><b>${T('wv.empty.t')}</b>${T('wv.empty.d')}</div>`}</div>`;
  }
  function weekDetailModal(n) {
    const w = D.weeks.find(x => x.n === n); if (!w) return;
    const st = weekStat(w.plan, w.done, w.sets);
    MS = { kind: 'wkdetail', n };
    const days = DAYS.filter(d => { const p = w.plan[d.key]; return p && (p.rest || p.items.length); }).map(d => {
      const p = w.plan[d.key], full = !!w.done[d.key];
      return `<div class="wd-day"><h5>${dName(d)}${p.title && !p.rest ? ' · ' + esc(TS(p.title)) : ''}${full ? `<span class="ck">${ico('i-check')}</span>` : ''}</h5>
        ${p.rest ? `<div class="wd-rest">${ico('i-moon-rest')}${T('p.restday')}</div>` : `<ul>${p.items.map(it => {
          const m = getMove(it.moveId), dn = clamp(w.sets[it.id] || 0, 0, it.sets);
          return `<li class="c-${m ? m.cat : 'core'} ${dn >= it.sets ? 'ok' : ''}"><span class="nm">${m ? esc(mName(m)) : T('p.gone.t')}</span><span class="sp">${fa(it.sets)} × ${amountLabel(it)}${it.perSide ? ' · ' + T('c.perside') : ''}</span>
            <span class="dn">${dn >= it.sets ? ico('i-check') : `${fa(dn)}/${fa(it.sets)}`}</span>${it.up ? `<span class="badge up">${ico('i-up')}${T('up.' + it.up)}</span>` : ''}</li>`;
        }).join('')}</ul>`}</div>`;
    }).join('');
    openModal({
      title: T('wk.week', { n: fa(n) }),
      body: `<p class="nw-sum">${esc(rangeTxt(w.start, w.end))} · ${T('wk.prog', { d: fa(st.dn), t: fa(st.days) })} · ${T('wv.sets', { d: fa(st.sd), t: fa(st.st) })}</p>${days || `<div class="notice">${T('wv.noitems')}</div>`}`,
      foot: `<button class="btn ghost" data-act="close">${T('c.close')}</button><button class="btn primary" data-act="wk-use" data-n="${n}">${ico('i-reset')}${T('wv.use')}</button>`
    });
  }
  function weekNoModal() {
    const min = maxSaved() + 1;
    MS = { kind: 'weekno', form: { wn: Math.max(weekNo(), min) }, min };
    openModal({
      title: T('wv.editno'),
      body: `<p style="color:var(--muted);font-weight:300;line-height:2">${T('wv.editno.d', { n: fa(min) })}</p>
        <div class="field"><label>${T('wv.editno.f')}</label>${stepper('m', 'wn', MS.form.wn, { min, max: 999 })}</div>`,
      foot: `<button class="btn ghost" data-act="close">${T('c.cancel')}</button><button class="btn primary" data-act="wn-save">${T('c.save')}</button>`
    });
  }

  /* ======================================================================
     صفحهٔ اصلی
     ====================================================================== */
  /* ======================================================================
     چالش روزانه — انتخاب پایدار بر اساس تاریخ، تعویض (حداکثر ۲ بار در روز)، زنجیرهٔ روزهای متوالی
     ====================================================================== */
  const CH_LVL = { 1: 'beginner', 2: 'intermediate', 3: 'advanced' };
  const CH_CLS = { core: 'core', push: 'push', pull: 'pull', legs: 'legs', mobility: 'skills', balance: 'skills', general: 'mine' };
  const dateSeed = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const chLevel = () => (D.user && [1, 2, 3].includes(+D.user.level) ? +D.user.level : 1);
  const chPool = l => (window.CHALLENGES && CHALLENGES[CH_LVL[l]]) || [];
  const chTitle = c => (I18N.lang === 'en' ? c.te : c.t), chDesc = c => (I18N.lang === 'en' ? c.de : c.d);
  const chTypeName = t => (['push', 'pull', 'legs', 'core'].includes(t) ? catName(t) : T('ch.type.' + t));
  /* چالش امروز؛ در طول روز با بستن و باز کردن برنامه ثابت می‌ماند */
  function chToday() {
    const seed = dateSeed(), lvl = chLevel();
    let t = D.ch.today; const done = D.ch.done[seed] != null;
    if (!t || t.day !== seed || (t.lvl !== lvl && !done) || !chPool(t.lvl).some(c => c.id === t.id)) {
      const pool = chPool(lvl); if (!pool.length) return null;
      t = D.ch.today = { day: seed, lvl, id: pool[seed % pool.length].id, seen: [], rerolls: 0 };
    }
    const c = chPool(t.lvl).find(x => x.id === t.id);
    return c ? { c, t, done, left: 2 - t.rerolls } : null;
  }
  function chStreak() {
    const d = new Date(); if (D.ch.done[dateSeed(d)] == null) d.setDate(d.getDate() - 1);
    let n = 0; while (D.ch.done[dateSeed(d)] != null) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function homeChallenge() {
    const cur = chToday(); if (!cur) return '';
    const { c, t, done, left } = cur, st = chStreak();
    return `<section class="hm-card hm-ch c-${CH_CLS[c.type] || 'mine'} ${done ? 'done' : ''}">
      <div class="hm-row"><span class="hm-k">${T('ch.title')}</span><span class="ch-streak ${st ? 'on' : ''}">${ico('i-flame')}${st ? T('ch.streak', { n: fa(st) }) : T('ch.streak0')}</span></div>
      <div class="ch-badges"><span class="badge ch-type">${esc(chTypeName(c.type))}</span><span class="badge">${lvlName(t.lvl)}</span></div>
      <h3>${esc(chTitle(c))}</h3><p>${esc(chDesc(c))}</p>
      ${D.user && D.user.level ? '' : `<small class="hm-sm ch-note">${T('ch.nolevel')} <button class="linkbtn" data-act="nav" data-v="profile">${T('nav.profile')}</button></small>`}
      <div class="hm-act">${done
        ? `<span class="badge basic">${ico('i-check')}${T('ch.done')}</span><button class="btn sm ghost" data-act="ch-undo">${T('ch.undo')}</button>`
        : `<button class="btn primary" data-act="ch-done">${ico('i-check')}${T('ch.do')}</button><button class="btn" data-act="ch-roll" ${left > 0 ? '' : 'disabled'}>${ico('i-repeat')}${T('ch.roll')}</button>`}</div>
      ${done ? '' : `<small class="hm-sm">${left > 0 ? T('ch.left', { n: fa(left) }) : T('ch.left0')}</small>`}</section>`;
  }

  function homeToday() {
    if (pendingWeek()) {
      return `<section class="hm-card hm-today rest"><span class="hm-k">${T('wk.week', { n: fa(weekNo()) })}</span><h2>${T('hm.pending.t', { d: esc(fmtDay(D.progress.start)) })}</h2><p>${T('hm.pending.d')}</p>
        <div class="hm-act"><button class="btn" data-act="home-day" data-k="${DAYS[0].key}">${T('hm.openplan')}</button><button class="btn primary" data-act="wk-early">${ico('i-play')}${T('hm.pending.early')}</button></div></section>`;
    }
    const k = todayKey(), d = DAYS.find(x => x.key === k), p = D.plan[k], st = dayStats(k), done = !!D.progress.done[k];
    const items = p.items.map(it => ({ it, m: getMove(it.moveId) })).filter(x => x.m);
    const lab = `<span class="hm-k">${T('hm.today')} · ${dName(d)}</span>`;
    if (p.rest) {
      const idx = DAYS.findIndex(x => x.key === k); let nx = null;
      for (let i = 1; i < 7 && !nx; i++) { const dd = DAYS[(idx + i) % 7], pp = D.plan[dd.key]; if (!pp.rest && pp.items.length) nx = dd; }
      return `<section class="hm-card hm-today rest">${lab}<h2>${T('hm.rest.t')}</h2><p>${nx ? T('hm.rest.next', { day: dName(nx), title: TS(D.plan[nx.key].title) ? ' · ' + esc(TS(D.plan[nx.key].title)) : '' }) : T('hm.rest.d')}</p>
        <div class="hm-act"><button class="btn" data-act="home-day" data-k="${k}">${T('hm.openplan')}</button></div></section>`;
    }
    if (!items.length) return `<section class="hm-card hm-today">${lab}<h2>${T('hm.empty.t')}</h2><p>${T('hm.empty.d')}</p>
      <div class="hm-act"><button class="btn primary" data-act="home-add">${ico('i-plus')}${T('hm.empty.btn')}</button></div></section>`;
    const pct = st.t ? Math.round(st.d / st.t * 100) : 0;
    return `<section class="hm-card hm-today ${done ? 'done' : ''}">${lab}<h2>${esc(TS(p.title)) || dName(d)}</h2>
      <p>${T('hm.meta', { n: fa(items.length), s: fa(st.t) })}</p>
      <div class="bar"><i style="width:${pct}%"></i></div><small class="hm-sm">${T('p.setsprog', { d: fa(st.d), t: fa(st.t) })}</small>
      <div class="hm-moves">${items.slice(0, 6).map(({ it, m }) => `<span class="hm-mv c-${m.cat}" data-act="open-move" data-id="${m.id}" role="button" tabindex="0">${moveIcon(m)}<span>${esc(mName(m))}</span></span>`).join('')}${items.length > 6 ? `<span class="hm-more">+${fa(items.length - 6)}</span>` : ''}</div>
      <div class="hm-act">${done ? `<span class="badge basic">${ico('i-check')}${T('hm.done')}</span>` : `<button class="btn primary" data-act="start-today">${ico('i-play')}${T('ws.start')}</button>`}
        <button class="btn" data-act="home-day" data-k="${k}">${T('hm.openplan')}</button></div></section>`;
  }
  function homeWeek() {
    const st = curStat(), tk = tdKey();
    const ready = st.days > 0 && (st.dn >= st.days || Date.now() - D.progress.start >= 7 * 864e5);
    return `<section class="hm-card">
      <div class="hm-row"><h3>${T('wk.week', { n: fa(weekNo()) })}</h3><span class="tag">${T('wk.prog', { d: fa(st.dn), t: fa(st.days) })}</span></div>
      <div class="hm-days">${DAYS.map(d => { const p = D.plan[d.key], dn = !!D.progress.done[d.key];
        return `<button class="hm-d ${dn ? 'done' : ''} ${p.rest ? 'rest' : ''} ${d.key === tk ? 'today' : ''}" data-act="home-day" data-k="${d.key}" aria-label="${dName(d)}${d.key === tk ? ' – ' + T('c.today') : ''}"><span>${dShort(d)}</span><i>${dn ? ico('i-check') : p.rest ? ico('i-moon-rest') : ''}</i></button>`; }).join('')}</div>
      <div class="bar"><i style="width:${st.pct}%"></i></div>
      ${ready ? `<div class="hm-next"><p>${T('hm.next.d', { n: fa(nextNo()) })}</p><button class="btn sm primary" data-act="wk-next">${ico('i-up')}${T('hm.next.btn')}</button></div>` : ''}</section>`;
  }
  function homeStats() {
    let streak = 0; try { streak = window.Stats ? Stats.prep(statsEnv()).c.cur : 0; } catch (e) {}
    const st = curStat(), act = D.goals.filter(g => !goalDone(g)).length;
    return `<div class="stats hm-stats"><div class="stat hl"><b>${fa(streak)}</b><span>${T('hm.streak')}</span></div><div class="stat"><b>${fa(st.sd)}</b><span>${T('hm.sets')}</span></div><div class="stat"><b>${fa(act)}</b><span>${T('hm.goals')}</span></div></div>`;
  }
  function homeGoals() {
    const act = D.goals.filter(g => !goalDone(g)).sort((a, b) => goalPct(b) - goalPct(a)).slice(0, 3);
    return `<section class="hm-card"><div class="hm-row"><h3>${T('hm.goals.t')}</h3><button class="btn sm ghost" data-act="nav" data-v="goals">${T('hm.all')}</button></div>
      ${act.length ? act.map(g => `<button class="hm-goal" data-act="nav" data-v="goals"><span class="t">${esc(TS(g.title))}</span><em>${T('s.pct', { n: fa(goalPct(g)) })}</em><span class="bar"><i style="width:${goalPct(g)}%"></i></span></button>`).join('') : `<p class="hm-muted">${T('hm.goals.empty')}</p>`}</section>`;
  }
  function homeMoves() {
    const cnt = id => LIST.filter(m => m.cat === id).length;
    return `<section class="hm-card"><div class="hm-row"><h3>${T('hm.moves.t')}</h3><button class="btn sm ghost" data-act="home-cat" data-v="all">${T('hm.all')}</button></div>
      <div class="chips">${CATEGORIES.map(c => `<button class="chip c-${c.id}" data-act="home-cat" data-v="${c.id}"><span class="dotc"></span>${catName(c.id)} <small>${fa(cnt(c.id))}</small></button>`).join('')}</div></section>`;
  }
  function homeTiles() {
    const t = [['moves', 'i-moves', fa(LIST.length)], ['explain', 'i-book', ''], ['add', 'i-plus', ''], ['goals', 'i-goal', ''], ['profile', 'i-user', ''], ['stats', 'i-stats', ''], ['weeks', 'i-layers', D.weeks.length ? fa(D.weeks.length) : '']];
    return `<div class="hm-tiles">${t.map(([id, ic, c]) => `<button class="hm-tile" data-act="nav" data-v="${id}">${ico(ic)}<span>${T('nav.' + id)}</span>${c ? `<em>${c}</em>` : ''}</button>`).join('')}</div>`;
  }
  function homeRemind() {
    if (!(window.Notify && Notify.available())) return '';
    return `<section class="hm-card"><div class="set-row"><span class="set-t"><b>${T('set.remind')}</b><small>${D.reminders.on ? T('hm.remind.on', { t: fa(D.reminders.time) }) : T('hm.remind.off')}</small></span>
      <button type="button" class="switch" role="switch" aria-checked="${D.reminders.on}" data-act="remind-toggle" aria-label="${T('set.remind')}"></button></div></section>`;
  }
  function viewHome() {
    return `<div class="hm-grid"><div class="hm-col">${homeToday()}${homeChallenge()}${homeWeek()}${homeGoals()}</div>
      <div class="hm-col">${homeStats()}${homeMoves()}${homeTiles()}${homeRemind()}</div></div>`;
  }

  /* ======================================================================
     پروفایل: اطلاعات، سطح، مهارت‌ها و رکوردها
     ====================================================================== */
  const fmtDate = t => { try { return t ? new Intl.DateTimeFormat(I18N.locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(t)) : ''; } catch (e) { return ''; } };
  const recUnit = u => T(u === 'sec' ? 'unit.sec' : 'unit.rep');
  /* رکورد هر حرکت = بیشتر از (بهترین ثبت‌شده در تمرین‌ها، رکورد دستی) */
  function recordsList() {
    const map = new Map();
    try { Stats.prep(statsEnv()).c.perMove.forEach((x, id) => { if (x.best > 0 && getMove(id)) map.set(String(id), { id: String(id), v: x.best, u: x.bestU, at: x.bestT, auto: true }); }); } catch (e) {}
    Object.keys(D.records).forEach(id => { const r = D.records[id], cur = map.get(id); if (getMove(id) && (!cur || r.v >= cur.v)) map.set(id, { id, v: r.v, u: r.u, at: r.at, auto: false }); });
    return [...map.values()].sort((a, b) => b.at - a.at);
  }
  function viewProfile() {
    const U = D.user || {}, bmi = U.height && U.weight ? (U.weight / Math.pow(U.height / 100, 2)).toFixed(1) : '';
    let sets = 0, days = 0;
    try { const P = Stats.prep(statsEnv()); sets = P.c.allSets.length; days = new Set(P.c.allSets.map(e => P.localNum(e.t))).size; } catch (e) {}
    const meta = [U.age ? T('prof.age.v', { n: fa(U.age) }) : '', U.height ? T('prof.cm', { n: fa(U.height) }) : '', U.weight ? T('prof.kg', { n: fa(U.weight) }) : ''].filter(Boolean).join(' · ');
    const skills = Object.keys(D.skills).map(id => ({ id, m: getMove(id), at: D.skills[id].at })).filter(x => x.m).sort((a, b) => b.at - a.at);
    const recs = recordsList(), shown = S.profAll ? recs : recs.slice(0, 6);
    const lv = U.level || 0;
    return `<div class="pf-wrap">
      <section class="hm-card pf-head-card"><div class="pf-head"><div class="pf-av" aria-hidden="true">${esc((U.name || '').trim().charAt(0).toUpperCase()) || ico('i-user')}</div>
        <div class="pf-id"><h2>${esc(U.name || T('prof.noname'))}</h2>${meta ? `<p>${meta}</p>` : ''}${bmi ? `<p>${T('prof.bmi', { n: fa(bmi) })}</p>` : ''}</div></div>
        <button class="btn block" data-act="prof-edit">${ico('i-edit')}${T('prof.edit')}</button>
        <div class="field"><span class="lbl">${T('prof.level')}</span>
          <div class="seg wrap" role="group">${[1, 2, 3].map(v => `<button type="button" data-act="prof-level" data-v="${v}" aria-pressed="${lv === v}">${T('level.' + v)}</button>`).join('')}</div>
          <small class="hm-sm">${T('prof.level.d')}</small></div></section>
      <div class="stats pf-stats"><div class="stat"><b>${fa(days)}</b><span>${T('prof.stat.days')}</span></div><div class="stat"><b>${fa(sets)}</b><span>${T('prof.stat.sets')}</span></div><div class="stat"><b>${fa(skills.length)}</b><span>${T('prof.stat.skills')}</span></div></div>
      <section class="hm-card"><div class="hm-row"><h3>${ico('i-bolt')}${T('prof.skills')}</h3><button class="btn sm" data-act="skill-add">${ico('i-plus')}${T('prof.skills.add')}</button></div>
        ${skills.length ? `<div class="pf-chips">${skills.map(({ id, m, at }) => `<span class="pf-skill c-${m.cat}"><button type="button" class="pf-sk-main" data-act="open-move" data-id="${m.id}">${moveIcon(m)}<span><b>${esc(mName(m))}</b>${at ? `<small>${T('prof.skills.since', { d: fmtDate(at) })}</small>` : ''}</span></button><button type="button" class="pf-x" data-act="skill-del" data-id="${id}" aria-label="${T('prof.skill.del')}: ${esc(mName(m))}">${ico('i-x')}</button></span>`).join('')}</div>`
          : `<p class="hm-muted">${T('prof.skills.empty')}</p>`}</section>
      <section class="hm-card"><div class="hm-row"><h3>${ico('i-trophy')}${T('prof.records')}</h3><button class="btn sm" data-act="rec-add">${ico('i-plus')}${T('prof.rec.add')}</button></div>
        ${recs.length ? `<ul class="pf-recs">${shown.map(r => { const m = getMove(r.id); return `<li class="c-${m.cat}"><button type="button" class="pf-rec-main" data-act="open-move" data-id="${m.id}">${moveIcon(m)}<span class="pf-rn"><b>${esc(mName(m))}</b><small>${fmtDate(r.at)} · ${T(r.auto ? 'prof.rec.auto' : 'prof.rec.manual')}</small></span><em>${fa(r.v)} <small>${recUnit(r.u)}</small></em></button>${r.auto ? '' : `<button type="button" class="pf-x" data-act="rec-del" data-id="${r.id}" aria-label="${T('prof.rec.del')}: ${esc(mName(m))}">${ico('i-x')}</button>`}</li>`; }).join('')}</ul>
          ${recs.length > 6 ? `<button class="btn sm ghost" data-act="prof-all">${T(S.profAll ? 'prof.rec.less' : 'prof.rec.all', { n: fa(recs.length) })}</button>` : ''}`
          : `<p class="hm-muted">${T('prof.rec.empty')}</p>`}</section></div>`;
  }
  /* انتخاب مهارت: روی هر حرکت بزن تا اضافه یا حذف شود */
  function skillModal() {
    MS = { kind: 'skill', q: '', cat: 'skills' };
    openModal({ title: T('prof.skills.pick'), body: `<p class="nw-hint">${T('prof.skills.pick.d')}</p>
      <label class="search">${ico('i-search')}<input class="input" data-in="skq" placeholder="${T('p.pm.search')}" autocomplete="off"></label>
      <div class="chips" id="skCats" role="group"></div><div class="pick-list" id="skList"></div>`, foot: `<button class="btn primary" data-act="close">${ico('i-check')}${T('c.done')}</button>` });
    fillSkillList();
  }
  function fillSkillList() {
    const el = $('#skList'); if (!el || !MS || MS.kind !== 'skill') return;
    const q = norm(MS.q);
    $('#skCats').innerHTML = [['skills', T('prof.skills')], ['all', T('c.all')]].map(([v, lb]) => `<button class="chip" data-act="skill-cat" data-v="${v}" aria-pressed="${MS.cat === v}">${lb}</button>`).join('');
    const list = LIST.filter(m => (q || MS.cat === 'all' || m.cat === 'skills') && (!q || norm(hay(m)).includes(q)));
    el.innerHTML = list.length ? list.slice(0, 120).map(m => liHTML(m, !!D.skills[m.id], 'skill-pick')).join('') : `<div class="notice" style="margin:6px">${T('c.none')}</div>`;
  }
  /* ثبت رکورد دستی: انتخاب حرکت، سپس عدد */
  function recModal(sel) {
    MS = { kind: 'rec', q: '', sel: sel || null };
    if (!sel) {
      openModal({ title: T('prof.rec.pick'), body: `<label class="search">${ico('i-search')}<input class="input" data-in="rcq" placeholder="${T('p.pm.search')}" autocomplete="off"></label><div class="pick-list" id="rcList"></div>`, foot: `<button class="btn ghost" data-act="close">${T('c.cancel')}</button>` });
      fillRecList(); return;
    }
    const m = getMove(sel), u = m.iso ? 'sec' : 'rep', cur = D.records[sel];
    openModal({ title: T('prof.rec.add'), body: `<p class="rc-mv c-${m.cat}">${moveIcon(m)}<b>${esc(mName(m))}</b></p>
      <div class="field"><label for="rcVal">${T('prof.rec.value', { u: recUnit(u) })}</label><input class="input" id="rcVal" inputmode="numeric" autocomplete="off" maxlength="5" value="${cur ? fa(cur.v) : ''}" placeholder="${fa(10)}"></div>
      <p class="ob-err" id="rcErr" role="alert" hidden>${T('prof.rec.err')}</p>`,
      foot: `<button class="btn ghost" data-act="rec-back">${T('prof.rec.back')}</button><button class="btn primary" data-act="rec-save">${ico('i-check')}${T('prof.rec.save')}</button>` });
    setTimeout(() => { const i = $('#rcVal'); i && i.focus(); }, 50);
  }
  function fillRecList() {
    const el = $('#rcList'); if (!el || !MS || MS.kind !== 'rec') return;
    const q = norm(MS.q), list = LIST.filter(m => !q || norm(hay(m)).includes(q));
    el.innerHTML = list.length ? list.slice(0, 120).map(m => liHTML(m, false, 'rec-pick')).join('') : `<div class="notice" style="margin:6px">${T('c.none')}</div>`;
  }

  /* ======================================================================
     تنظیمات (زبان، تم، اندازهٔ متن، صدا، یادآور، سطح، داده‌ها)
     ====================================================================== */
  function viewSettings() {
    const can = !!(window.Notify && Notify.available()), th = D.theme || 'auto';
    const sg = (act, cur, opts) => `<div class="seg wrap" role="group">${opts.map(([v, lb]) => `<button type="button" data-act="${act}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${lb}</button>`).join('')}</div>`;
    const rl = v => (v >= 60 && v % 60 === 0 ? T('rest.m', { n: fa(v / 60) }) : T('rest.s', { n: fa(v) }));
    return `<div class="set-grid">
      <section class="set-sec"><h4>${ico('i-clock')}${T('set.rest')}</h4><p>${T('set.rest.d')}</p>
        <div class="field"><span class="lbl">${T('set.rest.set')}</span>${sg('set-rest-set', D.restSet, [30, 45, 60, 90, 120].map(v => [v, rl(v)]))}</div>
        <div class="field"><span class="lbl">${T('set.rest.move')}</span>${sg('set-rest-move', D.restMove, [60, 90, 120, 180, 240, 300].map(v => [v, rl(v)]))}</div>
        <button class="btn block" data-act="rest-apply">${ico('i-repeat')}${T('set.rest.apply')}</button></section>
      <section class="set-sec"><h4>${ico('i-eye')}${T('set.look')}</h4>
        <div class="field"><span class="lbl">${T('set.lang')}</span>${sg('set-lang', I18N.lang, [['fa', 'فارسی'], ['en', 'English']])}</div>
        <div class="field"><span class="lbl">${T('set.theme')}</span>${sg('set-theme', th, [['auto', T('set.theme.auto')], ['dark', T('set.theme.dark')], ['light', T('set.theme.light')]])}</div>
        <div class="field"><span class="lbl">${T('set.font')}</span>${sg('set-font', D.font || 1, [1, 2, 3, 4].map(n => [n, T('set.font.' + n)]))}<div class="fs-preview">${T('set.font.prev')}</div></div></section>
      <section class="set-sec"><h4>${ico('i-bolt')}${T('set.remind')}</h4><p>${T('set.remind.d')}</p>
        ${can ? `<div class="set-row"><span>${T('set.remind')}</span><button type="button" class="switch" role="switch" id="remindSw" aria-checked="${D.reminders.on}" data-act="remind-toggle" aria-label="${T('set.remind')}"></button></div>
          <div class="set-row"><label for="remindTime">${T('set.remind.time')}</label><input type="time" id="remindTime" class="time-in" data-in="remind-time" value="${D.reminders.time}"></div>`
          : `<p>${T('set.remind.web')}</p>`}</section>
      <section class="set-sec"><h4>${ico('i-play')}${T('set.train')}</h4>
        <div class="set-row"><span>${T('set.vib')}</span><button type="button" class="switch" role="switch" aria-checked="${D.vib !== false}" data-act="set-vib" aria-label="${T('set.vib')}"></button></div>
        <p>${T('set.vib.d')}</p>
        <div class="set-row"><span>${T('set.sound')}</span><button type="button" class="switch" role="switch" aria-checked="${D.sound !== false}" data-act="set-sound" aria-label="${T('set.sound')}"></button></div>
        <p>${T('set.sound.d')}</p></section>
      <section class="set-sec"><h4>${ico('i-db')}${T('set.data')}</h4><p>${T('b.text')}</p>
        <div style="display:grid;gap:10px">
          <button class="btn block" data-act="export">${ico('i-download')}${T('b.export')}</button>
          <button class="btn block" data-act="import-click">${ico('i-upload')}${T('b.import')}</button>
          <input type="file" id="importFile" accept="application/json,.json" hidden data-in="import">
          <button class="btn block danger" data-act="reset-all">${ico('i-trash')}${T('b.reset')}</button></div></section>
      <p class="set-about">${T('set.about')}</p></div>`;
  }

  /* ======================================================================
     بخش ۵ — افزودن حرکت
     ====================================================================== */
  const MUSCLE_SUGG = ['سینه', 'سرشانه', 'پشت‌بازو', 'جلوبازو', 'زیربغل (لت)', 'پشت میانی', 'کمر', 'شکم', 'پهلو', 'کور', 'چهارسر', 'همسترینگ', 'باسن', 'ساق', 'مچ و ساعد', 'کل بدن'];
  function draftMove() {
    const d = S.draft;
    return {
      id: d.id || 'u_' + uid(), cat: d.cat, level: d.level, iso: d.unit === 'sec',
      name: d.name.trim(), en: d.en.trim(), muscles: d.muscles.slice(), desc: d.desc.trim(),
      rec: { sets: d.sets, amount: d.amount, unit: d.unit },
      steps: lines(d.steps), tips: lines(d.tips), mistakes: lines(d.mistakes)
    };
  }
  function viewAdd() {
    const d = S.draft, editing = !!d.id;
    return `<div class="form-split">
      <div style="display:grid;gap:22px;min-width:0">
        <form class="form" id="addForm" onsubmit="return false" novalidate>
          ${editing ? `<div class="notice" style="padding:12px 16px">${T('a.editing', { name: esc(d.name || T('a.move')) })}</div>` : ''}
          <div class="cols">
            <div class="field"><label for="f-name">${T('a.name')}</label><input class="input" id="f-name" data-in="text" data-ctx="d" data-k="name" value="${esc(d.name)}" placeholder="${T('a.name.ph')}" maxlength="60" autocomplete="off"></div>
            <div class="field"><label for="f-en">${T('a.en')}</label><input class="input" id="f-en" dir="ltr" data-in="text" data-ctx="d" data-k="en" value="${esc(d.en)}" placeholder="Stone Breaker Push-up" maxlength="60" autocomplete="off"></div>
          </div>
          <div class="field"><span class="lbl">${T('a.cat')}</span><div class="cat-pick">${CATEGORIES.map(c => `<button type="button" class="c-${c.id}" data-act="seg" data-ctx="d" data-k="cat" data-v="${c.id}" aria-pressed="${d.cat === c.id}">${ico('p-' + c.id)}${catName(c.id)}</button>`).join('')}</div></div>
          <div class="cols">
            <div class="field"><span class="lbl">${T('a.level')}</span>${seg('d', 'level', d.level, [[1, lvlName(1)], [2, lvlName(2)], [3, lvlName(3)]])}</div>
            <div class="field"><span class="lbl">${T('a.type')}</span>${seg('d', 'unit', d.unit, [['rep', T('a.type.rep')], ['sec', T('a.type.sec')]])}</div>
          </div>
          <div class="cols">
            <div class="field"><span class="lbl">${T('a.sugg.sets')}</span>${stepper('d', 'sets', d.sets, { min: 1, max: 20 })}</div>
            <div class="field"><span class="lbl" id="amountLblD">${d.unit === 'sec' ? T('a.sugg.dur') : T('a.sugg.reps')}</span>${stepper('d', 'amount', d.amount, { min: 1, max: 999 })}</div>
          </div>
          <div class="field"><span class="lbl">${T('a.muscles')}</span>
            <div class="tag-box" id="tagBox"><span id="tagList" style="display:contents"></span><input id="tagIn" data-in="tag" placeholder="${T('a.muscles.ph')}" autocomplete="off"></div>
            <div class="sugg" id="sugg"></div></div>
          <div class="field"><label for="f-desc">${T('a.desc')}</label><textarea class="input" id="f-desc" data-in="text" data-ctx="d" data-k="desc" placeholder="${T('a.desc.ph')}">${esc(d.desc)}</textarea></div>
          <div class="field"><label for="f-steps">${T('a.steps')}</label><textarea class="input" id="f-steps" data-in="text" data-ctx="d" data-k="steps" placeholder="${T('a.steps.ph')}">${esc(d.steps)}</textarea><span class="hint">${T('a.steps.hint')}</span></div>
          <div class="cols">
            <div class="field"><label for="f-tips">${T('a.tips')}</label><textarea class="input" id="f-tips" data-in="text" data-ctx="d" data-k="tips" placeholder="${T('a.tips.ph')}">${esc(d.tips)}</textarea></div>
            <div class="field"><label for="f-mis">${T('a.mis')}</label><textarea class="input" id="f-mis" data-in="text" data-ctx="d" data-k="mistakes" placeholder="${T('a.mis.ph')}">${esc(d.mistakes)}</textarea></div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn primary" type="button" data-act="draft-save">${ico('i-check')}${editing ? T('a.savech') : T('a.save')}</button>
            ${editing ? `<button class="btn ghost" type="button" data-act="draft-cancel">${T('c.cancel')}</button>` : `<button class="btn ghost" type="button" data-act="draft-cancel">${T('a.clear')}</button>`}
          </div>
        </form>
        <div>
          <div class="section-head" style="margin-top:0"><h2>${T('a.mine')}</h2></div>
          <div class="mine-list" id="mineList"></div>
        </div>
      </div>
      <aside class="preview-pane"><span class="lbl">${ico('i-search')}${T('a.preview')}</span><div id="preview"></div></aside>
    </div>`;
  }
  function fillMine() {
    const el = $('#mineList'); if (!el) return;
    el.innerHTML = D.customMoves.length ? D.customMoves.map(m => `<div class="mine c-${m.cat}"><div class="t">${esc(mName(m))}<small>${catName(m.cat)} · ${lvlName(m.level)}</small></div>
      <button class="mini" data-act="open-move" data-id="${m.id}" aria-label="${T('c.view')}">${ico('i-book')}</button>
      <button class="mini" data-act="move-edit" data-id="${m.id}" aria-label="${T('c.edit')}">${ico('i-edit')}</button>
      <button class="mini del" data-act="move-del" data-id="${m.id}" aria-label="${T('c.delete')}">${ico('i-trash')}</button></div>`).join('')
      : `<div class="empty"><b>${T('a.empty.t')}</b>${T('a.empty.d')}</div>`;
  }
  function fillTags() {
    $('#tagList').innerHTML = S.draft.muscles.map((x, i) => `<span class="t">${esc(TS(x))}<button type="button" data-act="tag-del" data-i="${i}" aria-label="${T('c.delete')}">${ico('i-x')}</button></span>`).join('');
    $('#sugg').innerHTML = MUSCLE_SUGG.filter(x => !S.draft.muscles.includes(x)).map(x => `<button type="button" data-act="tag-add" data-v="${esc(x)}">+ ${esc(TS(x))}</button>`).join('');
  }
  function refreshPreview() {
    const el = $('#preview'); if (!el) return;
    const m = draftMove();
    m.num = S.draft.id ? (D.customMoves.findIndex(x => x.id === S.draft.id) + MOVES.length + 1) : (MOVES.length + 1 + D.customMoves.length);
    m.custom = true; el.innerHTML = cardHTML(m, { preview: true });
    const l = $('#amountLblD'); if (l) l.textContent = S.draft.unit === 'sec' ? T('a.sugg.dur') : T('a.sugg.reps');
  }
  function addTag(v) {
    v = String(v).trim().replace(/[،,]+$/, '').trim();
    if (v && !S.draft.muscles.includes(v) && S.draft.muscles.length < 8) S.draft.muscles.push(v);
    fillTags(); refreshPreview();
  }

  /* ======================================================================
     مودال، تأیید، توست
     ====================================================================== */
  const modal = $('#modal');
  function openModal({ title, body, foot }) {
    modal.innerHTML = `<div class="m-head"><h3>${title}</h3><button class="icon-btn" data-act="close" aria-label="${T('c.close')}">${ico('i-x')}</button></div>
      <div class="m-body">${body}</div><div class="m-foot">${foot || ''}</div>`;
    if (!modal.open) modal.showModal();
  }
  function closeModal() { if (modal.open) modal.close(); }
  modal.addEventListener('close', () => { MS = MS && MS.keep ? MS : null; });
  function confirmDlg({ title, text, ok = T('c.confirm'), danger = true, cb }) {
    CONFIRM = cb; MS = { keep: false };
    openModal({ title, body: `<p style="line-height:2">${text}</p>`, foot: `<button class="btn ghost" data-act="close">${T('c.cancel')}</button><button class="btn ${danger ? 'danger' : 'primary'}" data-act="confirm-ok">${ok}</button>` });
  }
  let tT;
  function toast(msg, undo) {
    const el = $('#toast'); UNDO = undo || null;
    el.innerHTML = esc(msg) + (undo ? ` <button class="btn sm" data-act="undo" style="margin-inline-start:10px">${T('c.undo')}</button>` : '');
    el.style.pointerEvents = undo ? 'auto' : 'none'; el.classList.add('show');
    clearTimeout(tT); tT = setTimeout(() => el.classList.remove('show'), undo ? 5000 : 2400);
  }

  /* مودال ثبت تکرار/ثانیهٔ واقعی آخرین ستِ انجام‌شده */
  function actualModal(id) {
    const c = D.progress.cycle, ev = D.log.filter(e => e.k === 's' && e.i === id && e.c === c).sort((a, b) => b.t - a.t)[0];
    const it = dayItems(S.day).find(x => x.id === id); if (!ev || !it) return;
    const m = getMove(ev.m), sec = ev.u === 'sec';
    MS = { kind: 'actual', evT: ev.t, iid: id, form: { a: ev.a || it.amount || 0 } };
    openModal({
      title: T('p.actual.t', { n: fa(ev.n) }),
      body: `<p style="color:var(--muted);font-weight:300;line-height:2">${m ? esc(mName(m)) + ' — ' : ''}${T('p.actual.d', { u: sec ? T('unit.sec') : T('unit.rep') })}</p>
        <div class="field"><label>${T('p.actual.f', { u: sec ? T('unit.sec') : T('unit.rep'), side: ev.ps ? T('c.perside') : T('p.side.total') })}</label>${stepper('m', 'a', MS.form.a, { max: 999 })}</div>`,
      foot: `<button class="btn ghost" data-act="close">${T('c.later')}</button><button class="btn primary" data-act="actual-save">${T('c.save')}</button>`
    });
  }

  /* ======================================================================
     چارچوب: ناوبری، عنوان، رندر
     ====================================================================== */
  const NAV = [
    { id: 'home', icon: 'i-home', sub: () => (D.user && D.user.name ? T('prof.hello', { name: D.user.name }) : T('nav.sub.home')) },
    { id: 'moves', icon: 'i-moves', sub: () => T('nav.sub.moves', { n: fa(LIST.length) }) },
    { id: 'goals', icon: 'i-goal', sub: () => T('nav.sub.goals') },
    { id: 'explain', icon: 'i-book', sub: () => T('nav.sub.explain') },
    { id: 'plan', icon: 'i-calendar', sub: () => T('nav.sub.plan') },
    { id: 'weeks', icon: 'i-layers', sub: () => T('nav.sub.weeks') },
    { id: 'stats', icon: 'i-stats', sub: () => T('nav.sub.stats') },
    { id: 'add', icon: 'i-plus', sub: () => T('nav.sub.add') },
    { id: 'profile', icon: 'i-user', sub: () => (D.user && D.user.name ? D.user.name : T('nav.sub.profile')) },
    { id: 'settings', icon: 'i-gear', sub: () => T('nav.sub.settings') }
  ];
  /* نوار پایین موبایل: ۳ گروه؛ بقیهٔ بخش‌ها داخل هر گروه با تب‌های بالای صفحه */
  const GROUPS = [
    { id: 'g-home', key: 'home', icon: 'i-home', views: ['home'] },
    { id: 'g-moves', key: 'moves', icon: 'i-moves', views: ['moves', 'explain', 'add'] },
    { id: 'g-plan', key: 'plan', icon: 'i-calendar', views: ['plan', 'weeks'] },
    { id: 'g-prog', key: 'prog', icon: 'i-stats', views: ['goals', 'stats'] },
    { id: 'g-set', key: 'prof', icon: 'i-user', views: ['profile', 'settings'] }
  ];
  const LAST = {};
  const VIEWS = {
    home: { render: viewHome },
    moves: { render: viewMoves, after: fillGrid },
    goals: { render: viewGoals },
    explain: { render: viewExplain, after() { fillExList(); fillDetail(); } },
    plan: { render: viewPlan },
    weeks: { render: viewWeeks },
    profile: { render: viewProfile },
    settings: { render: viewSettings },
    stats: { render: () => window.Stats ? Stats.view(statsEnv()) : '' },
    add: { render: viewAdd, after() { fillTags(); refreshPreview(); fillMine(); } }
  };
  function chrome() {
    const cur = NAV.find(n => n.id === S.view);
    const activeGoals = D.goals.filter(g => !goalDone(g)).length;
    const counts = { moves: fa(LIST.length), goals: activeGoals ? fa(activeGoals) : '' };
    $('#sideNav').innerHTML = NAV.map(n => `<button class="nav-item" data-act="nav" data-v="${n.id}" ${n.id === S.view ? 'aria-current="page"' : ''}>${ico(n.icon)}<span>${T('nav.' + n.id)}</span>${counts[n.id] ? `<span class="count">${counts[n.id]}</span>` : ''}</button>`).join('');
    const grp = GROUPS.find(g => g.views.includes(S.view)); LAST[grp.id] = S.view;
    $('#tabBar').innerHTML = GROUPS.map(g => `<button data-act="nav" data-v="${LAST[g.id] || g.views[0]}" ${g === grp ? 'aria-current="page"' : ''}>${ico(g.icon)}<span>${T('grp.' + g.key)}</span></button>`).join('');
    $('#subNav').innerHTML = grp.views.length > 1 ? `<div class="subnav" role="tablist" style="--n:${grp.views.length}">${grp.views.map(v => { const n = NAV.find(x => x.id === v); return `<button role="tab" data-act="nav" data-v="${v}" aria-selected="${v === S.view}">${T('navs.' + n.id)}</button>`; }).join('')}</div>` : '';
    $('#pageTitle').textContent = T('nav.' + cur.id); $('#pageSub').textContent = cur.sub();
    document.title = `${T('nav.' + cur.id)} | ${T('app.name')}`;
    const w = weekSummary();
    $('#weekCard').innerHTML = `<h4>${T('wk.week', { n: fa(weekNo()) })}</h4><div class="big">${fa(w.done)}<small>${T('week.of', { n: fa(w.n) })}</small></div><div class="bar"><i style="width:${w.pct}%;--c:var(--accent)"></i></div>`;
    try { $('#dateChip').textContent = new Intl.DateTimeFormat(I18N.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); } catch (e) {}
  }
  function render() {
    const V = VIEWS[S.view];
    $('#view').innerHTML = V.render();
    V.after && V.after();
    chrome();
  }
  function go(v, top = true) {
    S.view = v; try { history.replaceState(null, '', '#' + v); } catch (e) {}
    render(); if (top) window.scrollTo({ top: 0 });
  }
  function openExplain(id) { S.exId = id; S.exOpen = true; S.eq = ''; S.ecat = 'all'; closeModal(); go('explain'); }

  /* ======================================================================
     رویدادها
     ====================================================================== */
  const ACT = {
    nav: el => go(el.dataset.v),
    'set-rest-set'(el) { D.restSet = +el.dataset.v; save(); markSeg(el); },
    'set-rest-move'(el) { D.restMove = +el.dataset.v; save(); markSeg(el); },
    'rest-apply'() { DAYS.forEach(d => D.plan[d.key].items.forEach(i => { i.rest = D.restSet; })); save(); toast(T('set.rest.applied', { n: fa(D.restSet) })); },
    'prof-edit'() { profileModal(false); },
    'prof-level'(el) { if (!D.user) D.user = cleanUser({ at: Date.now() }); D.user.level = +el.dataset.v; save(); markSeg(el); },
    'prof-all'() { S.profAll = !S.profAll; render(); },
    'skill-add': skillModal,
    'skill-cat'(el) { MS.cat = el.dataset.v; fillSkillList(); },
    'skill-pick'(el) {
      const id = el.dataset.id; if (D.skills[id]) delete D.skills[id]; else D.skills[id] = { at: Date.now() };
      save(); fillSkillList(); if (S.view === 'profile') $('#view').innerHTML = viewProfile();
    },
    'skill-del'(el) { delete D.skills[el.dataset.id]; save(); render(); },
    'rec-add'() { recModal(null); },
    'rec-pick'(el) { recModal(el.dataset.id); },
    'rec-back'() { recModal(null); },
    'rec-save'() {
      const m = getMove(MS && MS.sel); if (!m) return;
      const n = parseInt(toEn(($('#rcVal') || {}).value || '').replace(/[^\d]/g, ''), 10);
      if (!(n > 0 && n < 100000)) { const e = $('#rcErr'); if (e) e.hidden = false; return; }
      D.records[m.id] = { v: n, u: m.iso ? 'sec' : 'rep', at: Date.now() }; save(); closeModal(); render(); toast(T('prof.rec.saved'));
    },
    'rec-del'(el) { const id = el.dataset.id, prev = D.records[id]; delete D.records[id]; save(); render(); toast(T('prof.rec.deleted'), () => { D.records[id] = prev; save(); render(); }); },
    'prof-skip'() { closeModal(); if (!D.user) { D.user = cleanUser({ at: Date.now() }); save(); } },
    'prof-save'() {
      const g = id => ($('#' + id) || {}).value || '', num = id => parseInt(toEn(g(id)).replace(/[^\d]/g, ''), 10) || 0;
      D.user = cleanUser({ name: g('pfName'), age: num('pfAge'), height: num('pfHeight'), weight: num('pfWeight'), level: (D.user && D.user.level) || 0, at: Date.now() });
      save(); closeModal(); render(); chrome();
    },
    'set-theme'(el) { D.theme = el.dataset.v === 'auto' ? null : el.dataset.v; save(); applyTheme(); markSeg(el); },
    'set-lang'(el) { if (el.dataset.v !== I18N.lang) ACT.lang(); },
    'set-sound'(el) { D.sound = !(D.sound !== false); el.setAttribute('aria-checked', D.sound); save(); },
    lang() { D.lang = I18N.lang === 'fa' ? 'en' : 'fa'; I18N.set(D.lang); save(); closeModal(); applyLang(); S.draft = newDraft(); render(); },
    settings: () => go('settings'),
    'wk-start': startWorkout,
    'set-font'(el) { D.font = +el.dataset.v; save(); applyFont(); markSeg(el); },
    async 'remind-toggle'(el) {
      const on = el.getAttribute('aria-checked') !== 'true';
      if (on && !(await Notify.ask())) { toast(T('set.remind.denied')); return; }
      D.reminders.on = on; el.setAttribute('aria-checked', on); save(); scheduleNotif(true); if (S.view === 'home') render(); toast(T(on ? 'set.remind.on' : 'set.remind.off'));
    },
    async 'st-share'(el) {
      if (!D.log.some(e => e.k === 's')) { toast(T('sh.nodata')); return; }
      if (!window.Share) return; el.classList.add('share-busy'); toast(T('sh.working'));
      try { await Share.send(el.dataset.k, statsEnv()); } catch (e) { toast(T('sh.fail')); }
      el.classList.remove('share-busy');
    },
    close: closeModal,
    undo() { const u = UNDO; UNDO = null; $('#toast').classList.remove('show'); u && u(); },

    /* حرکات */
    'f-cat'(el) { S.f.cat = el.dataset.v; render(); },
    'f-level'(el) { S.f.level = +el.dataset.v; render(); },
    'f-basic'() { S.f.basic = !S.f.basic; render(); },
    'open-move'(el) { const id = el.dataset.id; openExplain(isNaN(id) ? id : +id); },
    'add-plan'(el) { const id = el.dataset.id; closeModal(); planModal({ day: S.day, moveId: isNaN(id) ? id : +id }); },

    /* توضیح */
    'ex-pick'(el) { const id = el.dataset.id; S.exId = isNaN(id) ? id : +id; S.exOpen = true; $('#split').classList.add('open'); fillExList(); fillDetail(); window.scrollTo({ top: 0, behavior: innerWidth <= 880 ? 'auto' : 'smooth' }); },
    'ex-back'() { S.exOpen = false; $('#split').classList.remove('open'); },
    'ex-cat'(el) { S.ecat = el.dataset.v; render(); },

    /* اهداف */
    'goal-new': () => goalModal(null),
    'goal-edit': el => goalModal(el.dataset.id),
    'goal-save'() {
      const f = MS.form;
      if (!f.title.trim() && f.moveId != null) { const m = getMove(f.moveId); f.title = m ? T('g.prefix', { name: mName(m) }) : ''; }
      if (!f.title.trim()) { toast(T('g.err.title')); return; }
      f.title = f.title.trim(); f.target = Math.max(1, +f.target || 1); f.current = Math.max(0, +f.current || 0);
      if (MS.id) { const i = D.goals.findIndex(g => g.id === MS.id), g = D.goals[i]; gBase(g); D.goals[i] = { ...g, ...f, hist: g.hist, doneAt: g.doneAt }; gMark(D.goals[i]); }
      else { const g = { id: uid(), ...f, hist: [{ t: Date.now(), v: f.current }] }; gMark(g); D.goals.push(g); }
      save(); closeModal(); render(); toast(T('g.saved'));
    },
    'goal-del'(el) {
      const g = D.goals.find(x => x.id === el.dataset.id); if (!g) return;
      confirmDlg({ title: T('g.del.t'), text: T('g.del.d', { name: esc(TS(g.title)) }), ok: T('c.delete'), cb() { D.goals = D.goals.filter(x => x.id !== g.id); save(); render(); toast(T('g.deleted')); } });
    },
    'g-inc'(el) { const g = D.goals.find(x => x.id === el.dataset.id); if (!g) return; const was = goalDone(g); gBase(g); g.current = Math.max(0, g.current + (+el.dataset.d) * goalStep(g)); gMark(g); save(); render(); if (!was && goalDone(g)) toast(T('g.hit')); },
    'g-preset'(el) { const p = GOAL_PRESETS.find(x => x.title === el.dataset.t); if (!p) return; D.goals.push({ id: uid(), title: p.title, moveId: p.moveId, unit: p.unit, current: 0, target: p.target, hist: [{ t: Date.now(), v: 0 }] }); save(); render(); toast(T('g.added')); },

    /* برنامه */
    'day-pick'(el) { S.day = el.dataset.k; refreshPlan(); },
    'day-done'() { D.progress.done[S.day] = !D.progress.done[S.day]; logDay(D.progress.done[S.day]); save(); refreshPlan(); if (D.progress.done[S.day]) toast(T('p.daydone')); },
    'day-rest'() { const p = D.plan[S.day]; p.rest = !p.rest; if (p.rest && !p.title) p.title = 'استراحت'; if (!p.rest && p.title === 'استراحت') p.title = ''; save(); refreshPlan(); },
    set(el) {
      const id = el.dataset.id, n = +el.dataset.n, cur = D.progress.sets[id] || 0;
      const nxt = cur === n ? n - 1 : n, it = dayItems(S.day).find(x => x.id === id);
      D.progress.sets[id] = nxt;
      if (nxt > cur) { if (it) logSets(it, cur + 1, nxt); } else unlogSets(id, nxt + 1);
      const was = !!D.progress.done[S.day], st = dayStats(S.day);
      if (st.complete && !was) { D.progress.done[S.day] = true; logDay(true); toast(T('p.alldone')); haptic('end'); } else if (nxt > cur) haptic('tap');
      save(); refreshPlan();
      if (nxt > cur && it && it.unit === 'max') actualModal(id);
    },
    'set-actual'(el) { actualModal(el.dataset.id); },
    'actual-save'() {
      const e = MS && D.log.find(x => x.t === MS.evT && x.k === 's' && x.i === MS.iid); if (!e) { closeModal(); return; }
      e.a = clamp(+MS.form.a || 0, 0, 999); save(); closeModal(); refreshPlan(); toast(T('p.actual.saved'));
    },
    'st-range'(el) { S.range = +el.dataset.v; render(); },
    'demo-load'() { demoLoad(); if (S.view !== 'stats') { go('stats'); } else render(); toast(T('demo.added')); },
    'demo-clear'() { demoClear(); render(); toast(T('demo.removed')); },
    'ex-add': () => planModal({ day: S.day }),
    'ex-edit': el => planModal({ day: S.day, itemId: el.dataset.id }),
    'ex-up'(el) { moveItem(el.dataset.id, -1); },
    'ex-down'(el) { moveItem(el.dataset.id, 1); },
    'ex-del'(el) {
      const arr = dayItems(S.day), i = arr.findIndex(x => x.id === el.dataset.id); if (i < 0) return;
      const [it] = arr.splice(i, 1), day = S.day; save(); refreshPlan();
      toast(T('p.removed'), () => { D.plan[day].items.splice(Math.min(i, D.plan[day].items.length), 0, it); save(); refreshPlan(); });
    },
    'wk-next': newWeekModal,
    'nw-toggle'(el) {
      const id = el.dataset.id, it = MS.items[id], s = MS.sug[id]; if (!it || s.kind === 'hold') return;
      const full = draftFromSug(it, s); MS.draft[id] = sameD(MS.draft[id], full) ? itemBase(it) : full;
      nwUpdate(id, `#nwr-${id} .nw-main`);
    },
    'nw-all'(el) { nwAll(el.dataset.v === '1'); },
    'nw-adj'(el) {
      const id = el.dataset.id, d = MS.draft[id], f = el.dataset.f, dir = +el.dataset.d; if (!d) return;
      if (f === 'sets') d.sets = clamp(d.sets + dir, 1, 20);
      else { const st = d.unit === 'sec' ? 5 : 1; d.amount = clamp(d.amount + dir * st, st, 999); }
      nwUpdate(id, `#nwr-${id} [data-f="${f}"][data-d="${dir}"]`);
    },
    'nw-swap'(el) {
      const id = el.dataset.id; MS.pick = id; MS.q = '';
      const m = getMove(MS.draft[id].moveId); $('#nwPickFor').textContent = T('nw.pick.for', { name: m ? mName(m) : '' });
      const i = $('#nwPick input'); if (i) i.value = '';
      fillNwPick(); nwShowPick(true);
    },
    'nw-pickback'() { const id = MS.pick; MS.pick = null; nwShowPick(false); nwUpdate(id, `#nwr-${id} .nw-top .mini`); },
    'nw-pick'(el) {
      const rid = el.dataset.id, mid = isNaN(rid) ? rid : +rid, m = getMove(mid), id = MS.pick; if (!m || !id) return;
      const o = MS.orig[id], cur = MS.draft[id];
      MS.draft[id] = String(m.id) === String(o.moveId) ? { ...o, sets: cur.sets } : { ...recFor(m), moveId: m.id, sets: cur.sets };
      MS.pick = null; nwShowPick(false); nwUpdate(id, `#nwr-${id} .nw-top .mini`);
    },
    'nw-go': newWeekGo,
    'wk-view'(el) { weekDetailModal(+el.dataset.n); },
    'wk-use'(el) {
      const w = D.weeks.find(x => x.n === +el.dataset.n); if (!w) return;
      confirmDlg({ title: T('wv.use.t'), text: T('wv.use.d', { n: fa(w.n), m: fa(hasProgress() ? nextNo() : weekNo()) }), ok: T('wv.use.ok'), danger: false, cb() {
        const prev = { plan: clone(D.plan), progress: clone(D.progress), weeks: clone(D.weeks) }, pl = clone(w.plan);
        DAYS.forEach(d => pl[d.key].items.forEach(i => { i.id = uid(); i.up = ''; }));
        replacePlan(buildPlan(pl)); S.day = todayKey(); save(); go('plan');
        toast(T('wv.use.done'), () => { D.plan = prev.plan; D.progress = prev.progress; D.weeks = prev.weeks; save(); render(); });
      } });
    },
    'wk-del'(el) {
      const w = D.weeks.find(x => x.n === +el.dataset.n); if (!w) return;
      confirmDlg({ title: T('wv.del.t'), text: T('wv.del.d', { n: fa(w.n) }), ok: T('c.delete'), cb() {
        D.weeks = D.weeks.filter(x => x.n !== w.n); save(); render();
        toast(T('wv.deleted'), () => { D.weeks.push(w); D.weeks.sort((a, b) => a.n - b.n); save(); render(); });
      } });
    },
    'wk-no': weekNoModal,
    'wn-save'() {
      const n = clamp(Math.round(+MS.form.wn) || 0, MS.min, 999), old = weekNo();
      if (n !== old) {
        if (D.log.some(e => e.c === n && !e.demo)) { toast(T('wv.editno.used')); return; }
        D.log.forEach(e => { if (e.c === old && !e.demo) e.c = n; });
        D.progress.cycle = n;
      }
      save(); closeModal(); render(); toast(T('wv.editno.done', { n: fa(n) }));
    },
    'ch-done'() {
      const cur = chToday(); if (!cur || cur.done) return;
      D.ch.done[dateSeed()] = cur.c.id; save(); haptic('end'); render(); toast(T('ch.done.t', { n: fa(chStreak()) }));
    },
    'ch-undo'() { delete D.ch.done[dateSeed()]; save(); render(); toast(T('ch.undone')); },
    'ch-roll'() {
      const cur = chToday(); if (!cur || cur.done || cur.left <= 0) return;
      const t = cur.t, used = new Set([...t.seen, t.id]), cand = chPool(t.lvl).filter(c => !used.has(c.id));
      if (!cand.length) return;
      t.seen.push(t.id); t.id = cand[Math.floor(Math.random() * cand.length)].id; t.rerolls++;
      save(); haptic('tap'); render(); toast(T('ch.rolled'));
    },
    'set-vib'(el) { D.vib = !(D.vib !== false); el.setAttribute('aria-checked', D.vib); save(); if (D.vib) haptic('tap'); },
    'start-today'() { S.day = todayKey(); startWorkout(); },
    'wk-early'() { D.progress.start = Date.now(); save(); render(); },
    'home-day'(el) { S.day = el.dataset.k; go('plan'); },
    'home-add'() { planModal({ day: todayKey() }); },
    'home-cat'(el) { S.f.cat = el.dataset.v; go('moves'); },

    /* مودال برنامه */
    'pm-day'(el) { MS.day = el.dataset.v; $('#dayPick').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el)); },
    'pm-pick'(el) {
      const id = el.dataset.id, f = MS.form; f.moveId = isNaN(id) ? id : +id;
      if (!MS.itemId) { const r = recFor(getMove(f.moveId)); Object.assign(f, r); syncPlanFields(); }
      fillPick();
    },
    'pm-save'() {
      const f = MS.form;
      if (f.moveId == null) { toast(T('p.err.move')); return; }
      const rec = { moveId: f.moveId, sets: clamp(+f.sets || 1, 1, 20), amount: f.unit === 'max' ? 0 : clamp(+f.amount || 1, 1, 999), unit: f.unit, rest: clamp(+f.rest || 0, 0, 600), perSide: !!f.perSide, note: (f.note || '').trim() };
      const day = MS.day, editing = !!MS.itemId;
      if (MS.itemId) { const it = dayItems(day).find(x => x.id === MS.itemId); Object.assign(it, rec); }
      else { D.plan[day].rest = false; if (D.plan[day].title === 'استراحت') D.plan[day].title = ''; D.plan[day].items.push({ id: uid(), ...rec }); }
      S.day = day; save(); closeModal();
      if (S.view === 'plan') refreshPlan(); else { chrome(); }
      toast(editing ? T('p.saved') : T('p.addedto', { day: dName(DAYS.find(d => d.key === day)) }));
    },

    /* کنترل‌های فرم (مشترک) */
    step(el) {
      const box = el.closest('.stepper'), c = cx(el.dataset.ctx), k = el.dataset.k; if (!c) return;
      let step = +box.dataset.step; if (k === 'amount' && c.unit === 'sec') step = Math.max(step, 5);
      const v = clamp((+c[k] || 0) + (+el.dataset.d) * step, +box.dataset.min, +box.dataset.max);
      c[k] = v; box.querySelector('input').value = fa(v); afterChange(el.dataset.ctx, k);
    },
    seg(el) {
      const c = cx(el.dataset.ctx), k = el.dataset.k; if (!c) return;
      const v = /^\d+$/.test(el.dataset.v) ? +el.dataset.v : el.dataset.v; c[k] = v;
      el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el));
      afterChange(el.dataset.ctx, k);
    },
    toggle(el) { const c = MS.form; c[el.dataset.k] = !c[el.dataset.k]; el.setAttribute('aria-pressed', !!c[el.dataset.k]); },

    /* افزودن/ویرایش حرکت شخصی */
    'tag-del'(el) { S.draft.muscles.splice(+el.dataset.i, 1); fillTags(); refreshPreview(); },
    'tag-add'(el) { addTag(el.dataset.v); },
    'draft-save'() {
      const pending = $('#tagIn').value.trim(); if (pending) { addTag(pending); $('#tagIn').value = ''; }
      if (!S.draft.name.trim()) { toast(T('a.err.name')); $('#f-name').focus(); return; }
      const m = draftMove(), editing = !!S.draft.id;
      if (editing) { const i = D.customMoves.findIndex(x => x.id === m.id); D.customMoves[i] = m; } else D.customMoves.push(m);
      rebuild(); save(); S.draft = newDraft(); render(); toast(editing ? T('p.saved') : T('a.added'));
    },
    'draft-cancel'() { S.draft = newDraft(); render(); },
    'move-edit'(el) {
      const m = D.customMoves.find(x => String(x.id) === el.dataset.id); if (!m) return;
      S.draft = { id: m.id, name: m.name, en: m.en || '', cat: m.cat, level: m.level, unit: (m.rec && m.rec.unit) === 'sec' ? 'sec' : 'rep', sets: m.rec ? m.rec.sets : 3, amount: m.rec ? m.rec.amount : 10, muscles: (m.muscles || []).slice(), desc: m.desc || '', steps: (m.steps || []).join('\n'), tips: (m.tips || []).join('\n'), mistakes: (m.mistakes || []).join('\n') };
      go('add');
    },
    'move-del'(el) {
      const m = D.customMoves.find(x => String(x.id) === el.dataset.id); if (!m) return;
      confirmDlg({ title: T('a.del.t'), text: T('a.del.d', { name: esc(m.name) }), ok: T('c.delete'), cb() {
        D.customMoves = D.customMoves.filter(x => x.id !== m.id);
        DAYS.forEach(d => { D.plan[d.key].items = D.plan[d.key].items.filter(i => String(i.moveId) !== String(m.id)); });
        D.goals.forEach(g => { if (String(g.moveId) === String(m.id)) g.moveId = null; });
        delete D.notes[m.id]; rebuild(); save();
        if (S.view === 'explain') S.exId = 1; if (S.f.cat === 'mine' && !D.customMoves.length) S.f.cat = 'all';
        render(); toast(T('a.deleted'));
      } });
    },

    /* داده‌ها */
    export() {
      const json = JSON.stringify(D, null, 2), name = `kinetix-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const P = window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() ? Capacitor.Plugins : null;
      if (P && P.Filesystem && P.Share) {   /* داخل اپ اندروید: فایل را بساز و منوی اشتراک‌گذاری را باز کن */
        P.Filesystem.writeFile({ path: name, data: json, directory: 'CACHE', encoding: 'utf8' })
          .then(r => P.Share.share({ title: T('b.share.title'), url: r.uri, dialogTitle: T('b.share.dialog') }))
          .catch(() => toast(T('b.share.err')));
        return;
      }
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    'import-click': () => $('#importFile').click(),
    'reset-all'() { confirmDlg({ title: T('b.rst.t'), text: T('b.rst.d'), ok: T('b.rst.ok'), cb() { D = normalize({ theme: D.theme, lang: D.lang }); rebuild(); S.draft = newDraft(); save(); render(); toast(T('b.rst.done')); } }); },
    'confirm-ok'() { const cb = CONFIRM; CONFIRM = null; closeModal(); cb && cb(); }
  };

  function moveItem(id, d) {
    const a = dayItems(S.day), i = a.findIndex(x => x.id === id), j = i + d;
    if (i < 0 || j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; save(); refreshPlan();
  }
  function syncPlanFields() {
    const f = MS.form, m = $('#modal');
    ['sets', 'rest', 'amount'].forEach(k => { const i = m.querySelector(`input[data-k="${k}"]`); if (i) i.value = fa(f[k]); });
    m.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === f.unit));
    const pb = m.querySelector('[data-act="toggle"]'); if (pb) pb.setAttribute('aria-pressed', !!f.perSide);
    afterChange('m', 'unit');
  }
  function afterChange(ctx, k) {
    if (ctx === 'd') {
      if (k === 'unit') { const d = S.draft, i = $('#addForm input[data-k="amount"]'); if (d.unit === 'sec' && d.amount === 10) d.amount = 20; else if (d.unit === 'rep' && d.amount === 20) d.amount = 10; if (i) i.value = fa(d.amount); }
      refreshPreview(); return;
    }
    if (MS && MS.kind === 'plan' && k === 'unit') {
      const f = MS.form, af = $('#amountField'); if (!af) return;
      af.hidden = f.unit === 'max';
      $('#amountLbl').textContent = f.unit === 'sec' ? T('p.pm.dur') : T('p.pm.reps');
      const inp = af.querySelector('input'); if (f.unit === 'sec' && f.amount < 5) f.amount = 20; if (f.unit === 'rep' && f.amount > 60) f.amount = 10; if (f.amount < 1) f.amount = 10; inp.value = fa(f.amount);
    }
  }

  document.addEventListener('click', e => {
    if (e.target === modal) { closeModal(); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const fn = ACT[el.dataset.act]; if (fn) fn(el, e);
  });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('[role="button"]')) { e.preventDefault(); t.click(); return; }
    if (t.id === 'tagIn') {
      if (e.key === 'Enter' || e.key === ',' || e.key === '،') { e.preventDefault(); addTag(t.value); t.value = ''; }
      else if (e.key === 'Backspace' && !t.value && S.draft.muscles.length) { S.draft.muscles.pop(); fillTags(); refreshPreview(); }
    }
  });
  function onInput(e) {
    const t = e.target, k = t.dataset && t.dataset.in; if (!k) return;
    const c = t.dataset.ctx ? cx(t.dataset.ctx) : null;
    switch (k) {
      case 'q': S.f.q = t.value; fillGrid(); break;
      case 'eq': S.eq = t.value; fillExList(); break;
      case 'pmq': MS.q = t.value; fillPick(); break;
      case 'nwq': MS.q = t.value; fillNwPick(); break;
      case 'skq': MS.q = t.value; fillSkillList(); break;
      case 'rcq': MS.q = t.value; fillRecList(); break;
      case 'num': {
        if (!c) break; const box = t.closest('.stepper');
        const n = parseInt(toEn(t.value).replace(/[^\d]/g, ''), 10);
        if (e.type === 'change' || isNaN(n)) { const v = clamp(isNaN(n) ? +box.dataset.min : n, +box.dataset.min, +box.dataset.max); c[t.dataset.k] = v; if (e.type === 'change') t.value = fa(v); }
        else c[t.dataset.k] = clamp(n, +box.dataset.min, +box.dataset.max);
        afterChange(t.dataset.ctx, t.dataset.k); break;
      }
      case 'text': if (c) { c[t.dataset.k] = t.value; afterChange(t.dataset.ctx, t.dataset.k); } break;
      case 'sel': if (c) { const v = t.value; c[t.dataset.k] = t.dataset.k === 'moveId' ? (v === '' ? null : (isNaN(v) ? v : +v)) : v; } break;
      case 'note': D.notes[S.exId] = t.value; save(); break;
      case 'day-title': D.plan[S.day].title = t.value; save(); if (e.type === 'change') refreshPlan(); break;
      case 'remind-time': if (/^\d{2}:\d{2}$/.test(t.value)) { D.reminders.time = t.value; save(); scheduleNotif(true); } break;
      case 'import': if (e.type === 'change' && t.files[0]) importFile(t.files[0]); break;
    }
  }
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);

  function mergeHistory(list) {
    const key = e => [e.k, e.t, e.i || e.d, e.n || ''].join('|');
    const have = new Set(D.log.map(key)); let s = 0, d = 0;
    list.forEach(e => {
      if (!e || typeof e.t !== 'number' || (e.k !== 's' && e.k !== 'd') || (e.k === 's' && !getMove(e.m))) return;
      const k = key(e); if (have.has(k)) return; have.add(k); D.log.push(e); if (e.k === 's') s++; else d++;
    });
    D.log.sort((a, b) => a.t - b.t); return { s, d };
  }
  function importFile(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        /* فایل «تاریخچه»: فقط ستِ انجام‌شده‌ها به آمار اضافه می‌شود؛ برنامه، اهداف و حرکات شخصی دست نمی‌خورد */
        if (j && j.kinetix === 'history' && Array.isArray(j.log)) {
          const res = mergeHistory(j.log); save(); closeModal(); render();
          toast(res.s || res.d ? T('b.merged', { s: fa(res.s), d: fa(res.d) }) : T('b.merged0')); return;
        }
        if (!j || typeof j !== 'object' || (!j.plan && !j.goals && !j.customMoves)) throw 0;
        D = normalize(j); I18N.set(D.lang); rebuild(); save(); applyTheme(); applyFont(); applyLang(); closeModal(); render(); toast(T('b.imported'));
      } catch (e) { toast(T('b.bad')); }
    };
    r.readAsText(file);
  }

  /* ======================================================================
     قابلیت‌های تکمیلی: اندازهٔ متن، اعلان‌ها، تنظیمات، پروفایل، شروع تمرین، اشتراک آمار
     ====================================================================== */
  const FONT_SCALE = [1, 1.15, 1.3, 1.5];
  function applyFont() { document.documentElement.style.setProperty('--fs', FONT_SCALE[(D.font || 1) - 1]); }

  /* env مشترک بخش آمار و کارت‌های اشتراک */
  function statsEnv() {
    return { D, LIST, getMove, CAT, CATEGORIES, DAYS: DAYS.map(d => ({ ...d, name: dName(d), short: dShort(d) })), ico, moveIcon, esc, range: S.range,
      t: T, ts: TS, tu: I18N.tu, num: fa, locale: I18N.locale, dir: I18N.dir, mName, catName };
  }

  /* --- اعلان‌های محلی --- */
  const notifyNames = () => ({ remind: T('nt.ch.remind'), timer: T('nt.ch.timer') });
  let ntT = 0, ntSig = '';
  function notifSig() {
    return JSON.stringify([D.reminders, I18N.lang, DAYS.map(d => [D.plan[d.key].rest, D.plan[d.key].title, D.plan[d.key].items.length])]);
  }
  function scheduleNotif(force) {
    if (!window.Notify || !Notify.available()) return;
    const sig = notifSig(); if (!force && sig === ntSig) return;
    clearTimeout(ntT); ntT = setTimeout(syncNotif, 1000);
  }
  function syncNotif() {
    if (!window.Notify || !Notify.available()) return Promise.resolve(false);
    ntSig = notifSig();
    const days = DAYS.map(d => ({ jsDay: d.jsDay, rest: D.plan[d.key].rest, title: TS(D.plan[d.key].title), n: D.plan[d.key].items.length }));
    return Notify.sync({ on: D.reminders.on, time: D.reminders.time, days, title: T('nt.title'), names: notifyNames(),
      body: d => (d.title ? T('nt.body', { title: d.title, n: fa(d.n) }) : T('nt.body.generic')) });
  }

  /* --- لرزش --- */
  function haptic(kind) {
    if (D.vib === false) return;
    const N = native(), H = N && N.Haptics;
    try {
      if (H) { if (kind === 'end') H.vibrate({ duration: 400 }); else H.impact({ style: kind === 'tap' ? 'LIGHT' : 'MEDIUM' }); }
      else if (navigator.vibrate) navigator.vibrate(kind === 'end' ? [200, 80, 200] : kind === 'tap' ? 30 : 80);
    } catch (e) {}
  }

  /* --- شروع تمرین --- */
  function completeSetFromRunner(it, actual, unit) {
    const cur = D.progress.sets[it.id] || 0, nxt = Math.min(it.sets, cur + 1);
    D.progress.sets[it.id] = nxt; logSets(it, nxt, nxt);
    if (it.unit === 'max' && actual != null) { const e = D.log[D.log.length - 1]; if (e && e.i === it.id) { e.a = clamp(+actual || 0, 0, 999); if (unit === 'sec') e.u = 'sec'; } }
    const was = !!D.progress.done[S.day]; let dayComplete = false;
    if (dayStats(S.day).complete && !was) { D.progress.done[S.day] = true; logDay(true); dayComplete = true; }
    save(); return { dayComplete };
  }
  function startWorkout() {
    const p = D.plan[S.day]; if (!p || p.rest || !window.Workout) return;
    if (pendingWeek()) {
      confirmDlg({ title: T('wk.early.t', { n: fa(weekNo()) }), text: T('wk.early.d', { d: fmtDay(D.progress.start) }), ok: T('hm.pending.early'), danger: false, cb() { D.progress.start = Date.now(); save(); render(); startWorkout(); } });
      return;
    }
    const items = dayItems(S.day).map(it => ({ it, m: getMove(it.moveId), done: clamp(D.progress.sets[it.id] || 0, 0, it.sets) })).filter(x => x.m && x.done < x.it.sets);
    if (!items.length) { toast(T('ws.empty')); return; }
    const day = DAYS.find(d => d.key === S.day);
    Workout.start({
      T, num: fa, ico, esc, title: TS(p.title) || dName(day), items, moveIcon, mName, catName, amountLabel,
      completeSet: completeSetFromRunner, restMove: D.restMove, sound: D.sound, onSound(v) { D.sound = v; save(); }, buzz: haptic,
      notifyAt: (ms, t, b) => window.Notify && Notify.at(ms, t, b, notifyNames()), cancelNotify: () => window.Notify && Notify.cancelAt(),
      onClose(sum) { if (S.view === 'home') render(); else refreshPlan(); if (sum.complete) toast(T('p.alldone')); }
    });
  }

  function profileModal(first) {
    const U = D.user || {};
    const f = (id, lb, v, ph, mode) => `<div class="field"><label for="${id}">${lb}</label><input class="input" id="${id}" ${mode ? 'inputmode="numeric"' : ''} autocomplete="off" value="${v ? esc(mode ? fa(v) : v) : ''}" placeholder="${ph}" maxlength="${mode ? 3 : 30}"></div>`;
    MS = { kind: 'profile' };
    openModal({
      title: T(first ? 'prof.welcome' : 'prof.title'),
      body: `${first ? `<p class="nw-hint">${T('prof.d')}</p>` : ''}${f('pfName', T('prof.name'), U.name, T('prof.name.ph'))}
        <div class="row2">${f('pfAge', T('prof.age'), U.age, fa(25), 1)}${f('pfHeight', T('prof.height'), U.height, fa(175), 1)}</div>${f('pfWeight', T('prof.weight'), U.weight, fa(70), 1)}`,
      foot: `<button class="btn ghost" data-act="${first ? 'prof-skip' : 'close'}">${T(first ? 'prof.skip' : 'c.cancel')}</button><button class="btn primary" data-act="prof-save">${ico('i-check')}${T('c.save')}</button>`
    });
  }
  /* اولین اجرا: فقط نام (و اطلاعات اختیاری) پرسیده می‌شود */
  function maybeOnboard() { if (!D.user && !D.log.length) profileModal(true); }

  function markSeg(el) { el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el)); }

  /* ---------- شروع ---------- */
  function init() {
    applyLang(); applyTheme(); applyFont();
    const h = location.hash.replace('#', '');
    if (VIEWS[h]) S.view = h;
    render();
    nativeInit();
    if (!native()) maybeOnboard();
  }
  /* راه‌اندازی اولیهٔ پلاگین‌ها: بستن اسپلش بعد از اولین رندر، حافظهٔ پایدار، وضعیت برنامه */
  function nativeInit() {
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    const N = native(); if (!N) return;
    const hide = () => { try { N.SplashScreen && N.SplashScreen.hide && N.SplashScreen.hide({ fadeOutDuration: 200 }); } catch (e) {} };
    requestAnimationFrame(() => requestAnimationFrame(hide)); setTimeout(hide, 2500);
    try { N.StatusBar && N.StatusBar.setOverlaysWebView && N.StatusBar.setOverlaysWebView({ overlay: true }); } catch (e) {}
    if (N.Preferences) {
      let has = false; try { has = !!localStorage.getItem(KEY); } catch (e) {}
      if (has) { schedulePrefs(); maybeOnboard(); }
      else N.Preferences.get({ key: KEY }).then(r => {
        if (!r || !r.value) return;
        try { localStorage.setItem(KEY, r.value); } catch (e) {}
        D = normalize(load()); I18N.set(D.lang); rebuild(); applyTheme(); applyFont(); applyLang(); render();
      }).catch(() => {}).then(maybeOnboard);
    } else maybeOnboard();
    if (N.App && N.App.addListener) N.App.addListener('appStateChange', st => { if (st && !st.isActive) { save(); } });
  }
  /* دکمهٔ بازگشت اندروید (فقط داخل Capacitor) */
  try {
    const A = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App;
    if (A && A.addListener) A.addListener('backButton', () => {
      if (window.Workout && Workout.isOpen()) Workout.back();
      else if (modal.open) closeModal();
      else if (S.view === 'explain' && S.exOpen && innerWidth <= 880) ACT['ex-back']();
      else if (S.view !== 'home') go('home');
      else A.exitApp();
    });
  } catch (e) {}
  /* حس اپ بومی: نگه‌داشتن انگشت روی متن/لینک/آیکون، انتخاب متن یا منوی مرورگر باز نکند (فقط فیلدهای ورودی) */
  document.addEventListener('contextmenu', e => { if (!e.target.closest('input, textarea')) e.preventDefault(); });
  document.addEventListener('selectstart', e => { if (!e.target.closest || !e.target.closest('input, textarea')) e.preventDefault(); });
  window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); if (VIEWS[h] && h !== S.view) go(h); });
  init();
})();
