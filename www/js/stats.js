/* ==========================================================================
   stats.js — صفحهٔ آمار (کارت‌هایی شبیه Namida، برای تمرین)
   ورودی: env = { D, LIST, getMove, CAT, DAYS, ico, moveIcon, esc, range, GOAL }
   خروجی: رشتهٔ HTML (همهٔ نمودارها SVG/CSS خالص هستند)
   رویدادهای D.log:
     { k:'s', t, m:moveId, a:مقدار, u:'rep'|'sec'|'max', ps:یک‌طرفه؟, r:استراحت, i:itemId, n:شمارهٔ ست, d:کلید روز, c:چرخه }
     { k:'d', t, d:کلید روز, c:چرخه }   ← «انجام دادم»ِ روز
   ========================================================================== */
(function () {
  'use strict';
  let E = null;                                   /* env فعلی (زبان، t، ...) */
  const t = (k, p) => E.t(k, p);
  const fa = n => E.num(n);
  const nf = (n, d) => new Intl.NumberFormat(E.locale, d ? { maximumFractionDigits: 1 } : {}).format(Math.round(n * (d ? 10 : 1)) / (d ? 10 : 1));
  const pct = n => t('s.pct', { n: nf(n) });
  const DAY = 864e5;
  const localNum = t => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / DAY);
  const numDate = n => { const u = new Date(n * DAY); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  const dowSat = n => (n + 5) % 7;                 // شنبه = ۰
  const weekStart = n => n - dowSat(n);
  const F = (d, o) => new Intl.DateTimeFormat(E.locale, o).format(d);
  const dShort = n => F(numDate(n), { day: 'numeric', month: 'short' });
  const dLong = n => F(numDate(n), { day: 'numeric', month: 'long' });
  const dFull = n => F(numDate(n), { weekday: 'long', day: 'numeric', month: 'long' });
  const hh = h => fa(String(h).padStart(2, '0'));
  const hhmm = ms => { const d = new Date(ms); return fa(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')); };
  const repsOf = e => (e.u === 'sec' ? 0 : (e.a || 0) * (e.ps ? 2 : 1));
  const secsOf = e => (e.u === 'sec' ? (e.a || 0) * (e.ps ? 2 : 1) : 0);
  const mins = ms => { const m = Math.round(ms / 60000); return m < 60 ? t('s.min', { n: nf(m) }) : t('s.hmin', { h: nf(Math.floor(m / 60)), m: nf(m % 60) }); };
  const ago = n => { const d = localNum(Date.now()) - n; return d <= 0 ? t('s.ago.today') : d === 1 ? t('s.ago.yest') : d < 14 ? t('s.ago.d', { n: nf(d) }) : d < 60 ? t('s.ago.w', { n: nf(Math.round(d / 7)) }) : t('s.ago.m', { n: nf(Math.round(d / 30)) }); };
  const level = (v, max) => (v <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(v / max * 4))));

  /* ---------- محاسبات ---------- */
  function compute(env, range) {
    const D = env.D, todayN = localNum(Date.now());
    const fromN = range ? todayN - range + 1 : -1e9;
    const allSets = D.log.filter(e => e.k === 's');
    const allDayEv = D.log.filter(e => e.k === 'd');
    const inR = e => localNum(e.t) >= fromN;
    const sets = allSets.filter(inR);
    const prevSets = range ? allSets.filter(e => { const n = localNum(e.t); return n >= fromN - range && n < fromN; }) : [];

    // روزهای فعال (برای رکورد پیاپی، همیشه روی کل تاریخچه)
    const activeAll = new Set(D.log.map(e => localNum(e.t)));
    const sortedAll = [...activeAll].sort((a, b) => a - b);
    let best = { len: 0, a: 0, b: 0 }, run = { len: 0, a: 0, b: 0 };
    sortedAll.forEach((n, i) => {
      if (i && n === sortedAll[i - 1] + 1) { run.len++; run.b = n; } else run = { len: 1, a: n, b: n };
      if (run.len > best.len) best = { ...run };
    });
    let cur = 0, curA = 0;
    if (activeAll.has(todayN) || activeAll.has(todayN - 1)) {
      let n = activeAll.has(todayN) ? todayN : todayN - 1; curA = n;
      while (activeAll.has(n)) { cur++; n--; }
    }

    // نشست‌ها (به تفکیک روز)
    const byDay = new Map();
    const addDay = n => { if (!byDay.has(n)) byDay.set(n, { n, sets: [], first: Infinity, last: 0, reps: 0, secs: 0, moves: new Map() }); return byDay.get(n); };
    sets.forEach(e => {
      const n = localNum(e.t), s = addDay(n);
      s.sets.push(e); s.first = Math.min(s.first, e.t); s.last = Math.max(s.last, e.t);
      s.reps += repsOf(e); s.secs += secsOf(e);
      const mv = s.moves.get(e.m) || { m: e.m, sets: 0, reps: 0, secs: 0, best: 0, u: e.u }; mv.sets++; mv.reps += repsOf(e); mv.secs += secsOf(e); mv.best = Math.max(mv.best, e.a || 0); mv.u = e.u; s.moves.set(e.m, mv);
    });
    allDayEv.filter(inR).forEach(e => addDay(localNum(e.t)));
    const days = [...byDay.values()].sort((a, b) => a.n - b.n);

    // ساعت و روز هفته
    const hours = Array(24).fill(0), wk = Array(7).fill(0), hm = Array.from({ length: 7 }, () => Array(24).fill(0));
    sets.forEach(e => { const d = new Date(e.t), h = d.getHours(), w = dowSat(localNum(e.t)); hours[h]++; wk[w]++; hm[w][h]++; });

    // به تفکیک حرکت (کل تاریخچه برای رکورد؛ بازه برای رتبه)
    const perMove = new Map(), mkMv = id => { if (!perMove.has(id)) perMove.set(id, { m: id, sets: 0, reps: 0, secs: 0, best: 0, bestU: 'rep', bestT: 0, days: new Set(), last: 0, weeks: new Set() }); return perMove.get(id); };
    allSets.forEach(e => {
      const x = mkMv(e.m); const n = localNum(e.t); x.days.add(n); x.weeks.add(weekStart(n)); x.last = Math.max(x.last, e.t);
      if (inR(e)) { x.sets++; x.reps += repsOf(e); x.secs += secsOf(e); }
      const v = (e.a || 0) * (e.ps ? 1 : 1);
      if (v > x.best || (v === x.best && e.t > x.bestT)) { x.best = v; x.bestU = e.u === 'sec' ? 'sec' : 'rep'; x.bestT = e.t; }
    });

    // ماهیچه‌ها و دسته‌ها
    const muscles = new Map(), cats = {};
    sets.forEach(e => {
      const m = env.getMove(e.m); if (!m) return;
      cats[m.cat] = (cats[m.cat] || 0) + 1;
      (m.muscles || []).forEach(x => muscles.set(x, (muscles.get(x) || 0) + 1));
    });

    // هفته‌ها
    const wkMap = new Map();
    allSets.forEach(e => { const w = weekStart(localNum(e.t)); wkMap.set(w, (wkMap.get(w) || 0) + 1); });
    const thisW = weekStart(todayN), weeks = [];
    for (let i = 11; i >= 0; i--) { const w = thisW - i * 7; weeks.push({ w, v: wkMap.get(w) || 0 }); }
    // تقویم فعالیت
    const dayCnt = new Map(); allSets.forEach(e => { const n = localNum(e.t); dayCnt.set(n, (dayCnt.get(n) || 0) + 1); });

    // پایبندی
    let plannedWeek = 0; env.DAYS.forEach(d => { const p = env.D.plan[d.key]; if (!p.rest) p.items.forEach(i => plannedWeek += i.sets); });
    const last28 = allSets.filter(e => localNum(e.t) > todayN - 28).length;
    const adherence = plannedWeek ? Math.min(100, Math.round(last28 / (plannedWeek * 4) * 100)) : null;

    const sessions = days.filter(d => d.sets.length);
    const spans = sessions.filter(d => d.sets.length > 1 && d.last - d.first < 3 * 3600e3).map(d => d.last - d.first);
    const sum = a => a.reduce((x, y) => x + y, 0);
    return { sets, prevSets, days, sessions, hours, wk, hm, perMove, muscles, cats, weeks, dayCnt, adherence, plannedWeek, best, cur, curA, spans, sum, todayN, allSets, repsAll: sum(sets.map(repsOf)), secsAll: sum(sets.map(secsOf)), activeAll };
  }

  /* ---------- اجزای نمودار ---------- */
  const shareBtn = (env, kind) => (kind ? `<button class="share-btn" data-act="st-share" data-k="${kind}" aria-label="${t('sh.share')}" title="${t('sh.share')}">${env.ico('i-share')}</button>` : '');
  const head = (env, icon, title, extra, kind) => `<div class="st-h">${env.ico(icon)}<h3>${title}</h3>${extra || ''}${shareBtn(env, kind)}</div>`;

  function clockSVG(hours) {
    const max = Math.max(...hours, 1), cx = 150, cy = 150, ri = 58, ro = 112;
    const P = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)].map(v => v.toFixed(1)).join(' ');
    let bars = '';
    hours.forEach((v, h) => {
      if (!v) return;
      const a0 = h * 15 - 90 + 1.2, a1 = h * 15 - 90 + 13.8, r = Math.max(ri + 7, ri + (ro - ri) * v / max);
      bars += `<path d="M${P(ri, a0)} L${P(r, a0)} A${r} ${r} 0 0 1 ${P(r, a1)} L${P(ri, a1)} A${ri} ${ri} 0 0 0 ${P(ri, a0)} Z" fill="var(--accent)" opacity="${(.3 + .7 * v / max).toFixed(2)}"><title>${t('s.clock.tip', { h: hh(h), n: nf(v) })}</title></path>`;
    });
    const peak = hours.indexOf(max), any = hours.some(Boolean);
    const lbl = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="clk-l">${t}</text>`;
    return `<svg viewBox="0 0 300 300" class="st-clock" role="img" aria-label="${t('s.clock')}">
      <circle cx="150" cy="150" r="${ro}" class="clk-ring"/>${bars}<circle cx="150" cy="150" r="${ri}" class="clk-hole"/>
      ${lbl(150, 14, fa('00:00'))}${lbl(286, 150, fa('06:00'))}${lbl(150, 286, fa('12:00'))}${lbl(14, 150, fa('18:00'))}
      <text x="150" y="146" text-anchor="middle" class="clk-big">${any ? fa(String(peak).padStart(2, '0') + ':00') : '—'}</text>
      <text x="150" y="172" text-anchor="middle" class="clk-sm">${t('s.clock.peak')}</text></svg>`;
  }

  function weekdayBars(env, wk) {
    const max = Math.max(...wk, 1), top = wk.indexOf(Math.max(...wk));
    return `<div class="wk-bars">${env.DAYS.map((d, i) => `<div class="wk ${i === top && wk[i] ? 'top' : ''}"><span class="v">${wk[i] ? nf(wk[i]) : ''}</span><i style="height:${Math.max(wk[i] ? 6 : 2, wk[i] / max * 100)}%"></i><span class="d">${d.name}</span></div>`).join('')}</div>`;
  }

  function heatmap(env, hm) {
    let max = 0; hm.forEach(r => r.forEach(v => max = Math.max(max, v)));
    let h = '<div class="hm" dir="ltr"><span></span>';
    for (let c = 0; c < 24; c++) h += `<span class="hl">${c % 3 === 0 ? hh(c) : ''}</span>`;
    env.DAYS.forEach((d, r) => {
      h += `<span class="hr">${d.name}</span>`;
      for (let c = 0; c < 24; c++) h += `<i class="l${level(hm[r][c], max)}" title="${t('s.hm.tip', { d: d.name, h: hh(c), n: nf(hm[r][c]) })}"></i>`;
    });
    return h + '</div>';
  }

  function calendar(env, c) {
    const WEEKS = 18, thisW = weekStart(c.todayN);
    let max = 0; c.dayCnt.forEach(v => max = Math.max(max, v));
    let cells = '', months = '', lastM = '';
    for (let w = WEEKS - 1; w >= 0; w--) {
      const ws = thisW - w * 7, mn = F(numDate(ws), { month: 'short' });
      months += `<span>${mn !== lastM ? mn : ''}</span>`; lastM = mn;
      for (let r = 0; r < 7; r++) {
        const n = ws + r, v = c.dayCnt.get(n) || 0;
        cells += n > c.todayN ? '<i class="fut"></i>' : `<i class="l${level(v, max)}" title="${t('s.cal.tip', { d: dFull(n), n: nf(v) })}"></i>`;
      }
    }
    const rows = env.DAYS.map((d, i) => `<span>${i % 2 === 0 ? d.name : ''}</span>`).join('');
    return `<div class="cal-wrap" dir="ltr"><div class="cal-rows">${rows}</div><div><div class="cal-months" style="grid-template-columns:repeat(${WEEKS},1fr)">${months}</div><div class="cal" style="grid-template-columns:repeat(${WEEKS},1fr)">${cells}</div></div></div>
      <div class="legend" dir="ltr"><span>${t('s.legend.less')}</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>${t('s.legend.more')}</span></div>`;
  }

  function spark(hist, w = 120, h = 34) {
    if (!hist || hist.length < 2) return `<svg class="spark" viewBox="0 0 ${w} ${h}"><line x1="0" y1="${h - 2}" x2="${w}" y2="${h - 2}" class="sp-base"/></svg>`;
    const t0 = hist[0].t, t1 = hist[hist.length - 1].t || t0 + 1, vs = hist.map(x => x.v), lo = Math.min(...vs), hi = Math.max(...vs, lo + 1);
    const pts = hist.map(x => `${(((x.t - t0) / Math.max(t1 - t0, 1)) * (w - 6) + 3).toFixed(1)},${(h - 4 - ((x.v - lo) / (hi - lo)) * (h - 8)).toFixed(1)}`);
    const last = pts[pts.length - 1].split(',');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}"><polyline points="${pts.join(' ')}" class="sp-line"/><circle cx="${last[0]}" cy="${last[1]}" r="2.8" class="sp-dot"/></svg>`;
  }

  const chip = (env, icon, val, label, cls) => `<div class="hchip ${cls || ''}">${env.ico(icon)}<b>${val}</b><span>${label}</span></div>`;

  /* ---------- نمای اصلی ---------- */
  function view(env) {
    E = env;
    const D = env.D, range = env.range, c = compute(env, range);
    const demo = D.log.some(e => e.demo) || D.goals.some(g => g.demo);
    const total = D.log.filter(e => e.k === 's').length;
    const ranges = [[7, 's.range.7'], [30, 's.range.30'], [90, 's.range.90'], [0, 's.range.0']];
    const bar = `<div class="st-bar"><div class="chips" role="group" aria-label="${t('s.range')}">${ranges.map(([v, k]) => `<button class="chip" data-act="st-range" data-v="${v}" aria-pressed="${range === v}">${t(k)}</button>`).join('')}</div>
      <div class="st-bar-r">${total ? `<button class="btn sm" data-act="st-share" data-k="all">${env.ico('i-share')}${t('sh.all')}</button>` : ''}${demo ? `<button class="btn sm" data-act="demo-clear">${env.ico('i-trash')}${t('s.demo.clear')}</button>` : `<button class="btn sm" data-act="demo-load">${env.ico('i-reset')}${t('s.demo.load')}</button>`}</div></div>`;
    if (!total) {
      return bar + `<div class="empty" style="margin-top:8px"><b>${t('s.empty.t')}</b>${t('s.empty.d')}<br><br><button class="btn primary" data-act="demo-load">${env.ico('i-reset')}${t('s.empty.btn')}</button></div>`;
    }
    const fmtDelta = (a, b) => (range && b ? `<small class="${a >= b ? 'up' : 'dn'}">${t('s.delta', { a: a >= b ? '▲' : '▼', n: nf(Math.abs(Math.round((a - b) / b * 100))) })}</small>` : '');
    const nSess = c.sessions.length, nSets = c.sets.length;
    const prevSess = new Set(c.prevSets.map(e => localNum(e.t))).size;
    const tiles = [
      [t('s.t.sessions'), nf(nSess), fmtDelta(nSess, prevSess)],
      [t('s.t.sets'), nf(nSets), fmtDelta(nSets, c.prevSets.length)],
      [t('s.t.reps'), nf(c.repsAll), fmtDelta(c.repsAll, c.sum(c.prevSets.map(repsOf)))],
      [t('s.t.hold'), nf(c.secsAll / 60, 1), ''],
      [t('s.t.moves'), nf(new Set(c.sets.map(e => e.m)).size), `<small>${t('s.t.of', { n: nf(env.LIST.length) })}</small>`],
      [t('s.t.avgsets'), nSess ? nf(nSets / nSess, 1) : '—', '']
    ].map(([l, v, sub]) => `<div class="st-tile"><b>${v}</b><span>${l}</span>${sub}</div>`).join('');

    /* --- ساعت تمرین --- */
    const clock = `<section class="st-card">${head(env, 'i-clock', t('s.clock'), '', 'clock')}
      <div class="clock-wrap">${clockSVG(c.hours)}</div>${weekdayBars(env, c.wk)}${heatmap(env, c.hm)}</section>`;

    /* --- عادت‌ها --- */
    const allPM = [...c.perMove.values()];
    const once = allPM.filter(x => x.days.size === 1).length, ten = allPM.filter(x => x.days.size >= 10).length;
    const rep = allPM.length ? Math.round(allPM.filter(x => x.weeks.size >= 2).length / allPM.length * 100) : 0;
    const startMin = d => { const x = new Date(d); return x.getHours() * 60 + x.getMinutes(); };
    const firstH = c.sessions.map(d => startMin(d.first));
    const avgStart = firstH.length ? c.sum(firstH) / firstH.length : null;
    const early = firstH.length ? Math.min(...firstH) : null;
    const late = c.sessions.length ? Math.max(...c.sessions.map(d => startMin(d.last))) : null;
    const clk = m => m == null ? '—' : fa(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0'));
    const topMv = [...c.perMove.values()].filter(x => x.sets).sort((a, b) => b.sets - a.sets)[0];
    const topM = topMv && env.getMove(topMv.m);
    const maxSetsDay = c.sessions.length ? c.sessions.reduce((a, b) => (b.sets.length > a.sets.length ? b : a)) : null;
    const nMoves = n => t('s.nmoves', { n: nf(n) });
    const habits = `<section class="st-card">${head(env, 'i-activity', t('s.habits'), '', 'habits')}
      <div class="hchips">
        ${chip(env, 'i-repeat', c.adherence == null ? '—' : pct(c.adherence), t('s.h.adh'))}
        ${chip(env, 'i-flame', t('s.ndays', { n: nf(c.cur) }), t('s.h.streak'))}
        ${chip(env, 'i-layers', nMoves(allPM.length), t('s.h.reach', { total: nf(env.LIST.length), p: nf(Math.round(allPM.length / env.LIST.length * 100)) }))}
        ${chip(env, 'i-eye', nMoves(env.LIST.length - allPM.length), t('s.h.never'))}
        ${chip(env, 'i-bolt', nMoves(once), t('s.h.once'))}
        ${chip(env, 'i-trophy', nMoves(ten), t('s.h.ten'))}
        ${chip(env, 'i-repeat', pct(rep), t('s.h.repeat'))}
        ${chip(env, 'i-sun', clk(avgStart), t('s.h.avgstart'))}
        ${chip(env, 'i-sunrise', clk(early), t('s.h.earliest'))}
        ${chip(env, 'i-moon', clk(late), t('s.h.latest'))}
        ${chip(env, 'i-clock', c.spans.length ? mins(c.sum(c.spans) / c.spans.length) : '—', t('s.h.avgdur'))}
        ${chip(env, 'i-layers', maxSetsDay ? t('s.nsets', { n: nf(maxSetsDay.sets.length) }) : '—', maxSetsDay ? t('s.h.maxsets') + ' • ' + dShort(maxSetsDay.n) : t('s.h.maxsets'))}
      </div>
      <div class="st-streak"><b>${t('s.best', { n: nf(c.best.len) })}${c.best.len ? t('s.best.range', { a: dLong(c.best.a), b: dLong(c.best.b) }) : ''}</b></div>
      ${topM ? `<div class="st-top c-${topM.cat}"><span class="ti">${env.moveIcon(topM)}</span><div><b>${env.esc(env.mName(topM))}</b><small>${t('s.top', { cat: env.catName(topM.cat) })}</small></div><em>${nf(topMv.sets)}</em></div>` : ''}
    </section>`;

    /* --- تقویم --- */
    const cal = `<section class="st-card wide">${head(env, 'i-calendar', t('s.cal'), `<span class="st-sub">${t('s.cal.sub')}</span>`, 'cal')}${calendar(env, c)}</section>`;

    /* --- روند هفتگی --- */
    const wmax = Math.max(...c.weeks.map(x => x.v), 1);
    const cw = c.weeks[c.weeks.length - 1].v, pw = c.weeks[c.weeks.length - 2].v;
    const weekly = `<section class="st-card">${head(env, 'i-chart', t('s.weekly'), `<span class="st-sub">${pw ? t('s.weekly.vs', { a: cw >= pw ? '▲' : '▼', n: nf(Math.abs(Math.round((cw - pw) / pw * 100))) }) : ''}</span>`, 'weekly')}
      <div class="wbars" dir="ltr">${c.weeks.map((x, i) => `<div class="wb ${i === c.weeks.length - 1 ? 'cur' : ''}" title="${t('s.weekly.tip', { d: dLong(x.w), n: nf(x.v) })}"><span class="v">${x.v ? nf(x.v) : ''}</span><i style="height:${Math.max(x.v ? 5 : 2, x.v / wmax * 100)}%"></i><span class="d">${i % 2 === 1 || i === 11 ? dShort(x.w) : ''}</span></div>`).join('')}</div>
      <div class="st-note">${t('s.weekly.avg', { n: nf(c.sum(c.weeks.map(x => x.v)) / 12, 1) })}</div></section>`;

    /* --- تعادل عضلات --- */
    const catTotal = Object.values(c.cats).reduce((a, b) => a + b, 0) || 1;
    const mus = [...c.muscles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 9), mmax = mus.length ? mus[0][1] : 1;
    const push = c.cats.push || 0, pull = c.cats.pull || 0;
    const ratio = push && pull ? (push / pull) : null;
    const balance = `<section class="st-card">${head(env, 'i-layers', t('s.bal'), '', 'balance')}
      <div class="stack">${env.CATEGORIES.map(k => c.cats[k.id] ? `<i class="c-${k.id}" style="flex:${c.cats[k.id]}" title="${t('s.bal.tip', { c: env.catName(k.id), n: nf(c.cats[k.id]) })}"></i>` : '').join('')}</div>
      <div class="legend2">${env.CATEGORIES.map(k => `<span class="c-${k.id}"><i></i>${env.catName(k.id)} ${pct(Math.round((c.cats[k.id] || 0) / catTotal * 100))}</span>`).join('')}</div>
      ${ratio ? `<div class="st-note">${t('s.bal.ratio', { r: nf(1 / ratio, 1), msg: ratio > 1.5 ? t('s.bal.lowpull') : ratio < 0.67 ? t('s.bal.lowpush') : t('s.bal.ok') })}</div>` : ''}
      <div class="mbars">${mus.map(([k, v]) => `<div><span>${env.esc(env.ts(k))}</span><div class="bar"><i style="width:${v / mmax * 100}%"></i></div><b>${nf(v)}</b></div>`).join('')}</div></section>`;

    /* --- حرکات برتر و رکوردها --- */
    const rank = [...c.perMove.values()].filter(x => x.sets).sort((a, b) => b.sets - a.sets).slice(0, 10), rmax = rank.length ? rank[0].sets : 1;
    const top = `<section class="st-card wide">${head(env, 'i-trophy', t('s.top.t'), '', 'top')}
      <div class="rank">${rank.map((x, i) => {
        const m = env.getMove(x.m); if (!m) return '';
        const unitKey = x.bestU === 'sec' ? 's.top.rec.sec' : 's.top.rec.rep';
        return `<div class="rk c-${m.cat}"><span class="n">${nf(i + 1)}</span><span class="ti">${env.moveIcon(m)}</span>
          <div class="nm"><b>${env.esc(env.mName(m))}</b><div class="bar"><i style="width:${x.sets / rmax * 100}%"></i></div></div>
          <div class="cols"><span><b>${nf(x.sets)}</b>${t('s.top.sets')}</span><span><b>${x.best ? nf(x.best) : '—'}</b>${x.best ? t(unitKey) : t('s.top.rec')}</span><span><b>${nf(x.days.size)}</b>${t('s.top.sessions')}</span><span class="lt">${ago(localNum(x.last))}</span></div></div>`;
      }).join('') || `<div class="st-note">${t('s.none')}</div>`}</div></section>`;

    /* --- اهداف --- */
    const gl = D.goals, gDone = gl.filter(g => g.target > 0 && g.current >= g.target).length;
    const goals = `<section class="st-card">${head(env, 'i-goal', t('s.goals'), `<span class="st-sub">${t('s.goals.sub', { a: nf(gDone), b: nf(gl.length) })}</span>`, 'goals')}
      <div class="glist">${gl.map(g => {
        const p = g.target > 0 ? Math.min(100, Math.round(g.current / g.target * 100)) : 0, h = g.hist || [], unit = env.esc(env.tu(g.target, g.unit));
        let pace = '', eta = '';
        if (h.length >= 2 && !(g.current >= g.target)) {
          const dt = (h[h.length - 1].t - h[0].t) / DAY / 7, dv = h[h.length - 1].v - h[0].v;
          if (dt >= 1 / 7 && dv > 0) { const rate = dv / dt; pace = t('s.g.pace', { n: nf(rate, 1), u: unit }); eta = t('s.g.eta', { d: F(new Date(Date.now() + (g.target - g.current) / rate * 7 * DAY), { day: 'numeric', month: 'long', year: 'numeric' }) }); }
        }
        return `<div class="gs ${g.current >= g.target ? 'ok' : ''}"><div><b>${env.esc(env.ts(g.title))}</b><small>${t('s.g.line', { c: nf(g.current), t: nf(g.target), u: unit, p: nf(p) })}${pace ? ' • ' + pace : ''}</small>${eta ? `<small>${eta}</small>` : g.doneAt ? `<small>${t('s.g.doneat', { d: dLong(localNum(g.doneAt)) })}</small>` : ''}<div class="bar"><i style="width:${p}%"></i></div></div>${spark(h)}</div>`;
      }).join('') || `<div class="st-note">${t('s.g.none')}</div>`}</div></section>`;

    /* --- سابقهٔ جلسات --- */
    const sess = [...c.sessions].reverse().slice(0, 14);
    const history = `<section class="st-card">${head(env, 'i-calendar', t('s.sess'), `<span class="st-sub">${t('s.sess.sub', { n: nf(c.sessions.length) })}</span>`)}
      <div class="sess">${sess.map((d, i) => `<details ${i === 0 ? 'open' : ''}><summary><b>${dFull(d.n)}</b><span>${t('s.sess.line', { sets: nf(d.sets.length), reps: nf(d.reps) })}${d.secs ? t('s.sec.part', { n: nf(d.secs) }) : ''}${d.last > d.first && d.last - d.first < 3 * 3600e3 ? ' • ' + mins(d.last - d.first) : ''}</span></summary>
        <div class="sl"><small>${t('s.sess.time', { a: hhmm(d.first), b: hhmm(d.last) })}</small>${[...d.moves.values()].map(x => { const m = env.getMove(x.m); return m ? `<div class="c-${m.cat}"><i></i><span>${env.esc(env.mName(m))}</span><em>${t('s.nsets', { n: nf(x.sets) })}${x.reps ? ' • ' + t('s.nreps', { n: nf(x.reps) }) : ''}${x.secs ? t('s.sec.part', { n: nf(x.secs) }) : ''}${x.best ? ' • ' + t('s.best.of', { n: nf(x.best) }) : ''}</em></div>` : ''; }).join('')}</div></details>`).join('') || `<div class="st-note">${t('s.sess.none')}</div>`}</div></section>`;

    return `${bar}${demo ? `<div class="st-demo">${t('s.demo.banner')}</div>` : ''}
      <div class="st-tiles">${tiles}</div>
      <div class="st-grid">${clock}${habits}${cal}${weekly}${balance}${top}${goals}${history}</div>`;
  }

  /* داده و قالب‌بندی‌ها برای کارت‌های اشتراک‌گذاری (share.js) */
  function prep(env) {
    E = env;
    const c = compute(env, env.range), D = env.D;
    return { c, D, nf, pct, mins, ago, dShort, dLong, dFull, hhmm, fa, F, localNum, numDate, weekStart, level, DAY, repsOf, secsOf };
  }

  window.Stats = { view, prep };
})();
