/* ==========================================================================
   share.js — کارت تصویری آمار برای اشتراک‌گذاری (PNG ۱۰۸۰×۱۳۵۰ با canvas)
   Share.send(kind, env)  kind: all | cal | weekly | clock | balance | top | goals | habits
   روی گوشی: Filesystem(CACHE) + Share با فایل؛ در مرورگر: Web Share با فایل، یا دانلود.
   ساخت تصویر کاملاً روی خود دستگاه انجام می‌شود (بدون اینترنت).
   ========================================================================== */
(function () {
  'use strict';
  const W = 1080, H = 1350, PAD = 100, CW = W - 2 * PAD;
  let ctx, E, rtl, V, col;

  /* ---------- رنگ‌ها از تم فعلی ---------- */
  const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function palette() {
    return { bg: cssv('--bg'), bg2: cssv('--bg-2'), surface: cssv('--surface'), s2: cssv('--surface-2'), s3: cssv('--surface-3'), line: cssv('--line-2'),
      text: cssv('--text'), muted: cssv('--muted'), faint: cssv('--faint'), accent: cssv('--accent'), ink: cssv('--accent-ink'),
      cat: { push: cssv('--c-push'), pull: cssv('--c-pull'), legs: cssv('--c-legs'), core: cssv('--c-core'), skills: cssv('--c-skills'), mine: cssv('--c-mine') } };
  }
  const alpha = (hex, a) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim()); if (!m) return hex; const n = parseInt(m[1], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  /* ---------- ابزارهای رسم ---------- */
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  const fillRR = (x, y, w, h, r, c) => { rr(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); };
  /* مختصات منطقی: x از لبهٔ شروعِ ناحیهٔ محتوا (راست در فارسی، چپ در انگلیسی) */
  const X = x => (rtl ? W - PAD - x : PAD + x);
  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.s || 30}px Waw, system-ui, sans-serif`; ctx.fillStyle = o.c || col.text; ctx.textBaseline = 'alphabetic';
    const a = o.a || 'start'; ctx.direction = rtl ? 'rtl' : 'ltr';
    if (o.abs) { ctx.textAlign = o.a || 'center'; ctx.direction = 'ltr'; ctx.fillText(s, x, y); return; }
    ctx.textAlign = a === 'center' ? 'center' : a === 'start' ? (rtl ? 'right' : 'left') : (rtl ? 'left' : 'right');
    ctx.fillText(s, X(x), y);
  }
  function fit(s, maxW, size, w) { let z = size; ctx.font = `${w} ${z}px Waw`; while (ctx.measureText(s).width > maxW && z > 16) { z -= 2; ctx.font = `${w} ${z}px Waw`; } return z; }
  const ellipsis = (s, maxW, size, w) => { ctx.font = `${w} ${size}px Waw`; if (ctx.measureText(s).width <= maxW) return s; while (s.length > 2 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1); return s + '…'; };
  const nd = (n, P) => { const r = V.t('s.ndays', { n: P.nf(n) }); return n === 1 && !rtl ? r.replace('days', 'day') : r; };
  const lvlC = (l) => (l === 0 ? col.s3 : alpha(col.accent, [0, .28, .5, .75, 1][l]));

  /* ---------- قاب مشترک ---------- */
  function frame(title, sub) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(80, 40, 10, 80, 40, 760); g.addColorStop(0, alpha(col.accent, .22)); g.addColorStop(1, alpha(col.accent, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W, H, 10, W, H, 700); g.addColorStop(0, alpha(col.cat.pull, .16)); g.addColorStop(1, alpha(col.cat.pull, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = alpha(col.text, .05); for (let y = 24; y < H; y += 36) for (let x = 24; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 6.3); ctx.fill(); }
    fillRR(44, 44, W - 88, H - 88, 56, alpha(col.surface, .92)); rr(44, 44, W - 88, H - 88, 56); ctx.strokeStyle = col.line; ctx.lineWidth = 2; ctx.stroke();
    /* لوگو */
    const lx = X(0) - (rtl ? 84 : 0), ly = 96;
    fillRR(lx, ly, 84, 84, 26, col.accent);
    ctx.save(); ctx.translate(lx + 12, ly + 12); ctx.scale(60 / 48, 60 / 48); ctx.strokeStyle = col.ink; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(new Path2D('M8 6h32M16 6l6 11M32 6l-6 11M24 20v14M24 34l-3.5 10M24 34l3.5 10')); ctx.beginPath(); ctx.arc(24, 15, 3.2, 0, 6.3); ctx.stroke(); ctx.restore();
    const tx = 100 + 84 + 22 - PAD;
    txt('Kinetix', tx - 0, ly + 40, { s: 40, w: 900 }); txt(V.tag, tx, ly + 76, { s: 22, w: 400, c: col.muted });
    txt(V.rangeLabel, CW, ly + 52, { a: 'end', s: 26, w: 600, c: col.muted });
    txt(title, 0, 292, { s: fit(title, CW, 68, 900), w: 900 });
    txt(sub, 0, 344, { s: 27, w: 400, c: col.muted });
    /* پانویس */
    ctx.fillStyle = col.line; ctx.fillRect(PAD, H - 142, CW, 2);
    txt(V.footer, 0, H - 92, { s: 24, w: 500, c: col.muted });
    txt('Kinetix', CW, H - 92, { a: 'end', s: 28, w: 900, c: col.accent });
  }

  function tile(x, y, w, h, big, label, o = {}) {
    fillRR(PAD + (rtl ? CW - x - w : x), y, w, h, 28, o.bg || col.s2);
    const cx = PAD + (rtl ? CW - x - w : x) + w / 2;
    ctx.textAlign = 'center'; ctx.direction = rtl ? 'rtl' : 'ltr';
    ctx.font = `900 ${fit(big, w - 30, o.bs || 58, 900)}px Waw`; ctx.fillStyle = o.c || col.text; ctx.fillText(big, cx, y + h / 2 + (o.dy || 6));
    ctx.font = `400 ${fit(label, w - 24, 23, 400)}px Waw`; ctx.fillStyle = col.muted; ctx.fillText(label, cx, y + h - 26);
  }

  /* ---------- کارت‌ها ---------- */
  const R = {};

  R.all = P => {
    const { c, nf } = P, nSess = c.sessions.length, nSets = c.sets.length;
    frame(V.t('sh.all.t'), V.t('sh.all.sub'));
    const items = [[nf(nSess), V.t('s.t.sessions')], [nf(nSets), V.t('s.t.sets')], [nf(c.repsAll), V.t('s.t.reps')], [nf(c.secsAll / 60, 1), V.t('s.t.hold')], [nf(new Set(c.sets.map(e => e.m)).size), V.t('s.t.moves')], [nSess ? nf(nSets / nSess, 1) : '—', V.t('s.t.avgsets')]];
    const tw = (CW - 40) / 3;
    items.forEach(([b, l], i) => tile((i % 3) * (tw + 20), 400 + Math.floor(i / 3) * 170, tw, 150, b, l, { c: i === 0 ? col.accent : col.text }));
    tile(0, 756, (CW - 20) / 2, 130, nd(c.cur, P), V.t('s.h.streak'), { c: col.accent, bs: 50 });
    tile((CW - 20) / 2 + 20, 756, (CW - 20) / 2, 130, nd(c.best.len, P), V.t('sh.bestlabel'), { bs: 50 });
    txt(V.t('s.weekly'), 0, 944, { s: 30, w: 700 });
    bars(c.weeks.map(x => x.v), c.weeks.map((x, i) => (i % 3 === 2 || i === 11 ? P.dShort(x.w) : '')), 970, 1160, true, P);
  };

  /* نمودار میله‌ای عمومی (محور زمان چپ→راست) */
  function bars(vals, labels, top, base, showVals, P, hi) {
    const n = vals.length, gap = n > 14 ? 8 : 16, bw = (CW - gap * (n - 1)) / n, max = Math.max(...vals, 1), hmax = base - top - 34;
    vals.forEach((v, i) => {
      const x = PAD + i * (bw + gap), h = Math.max(v ? 10 : 4, v / max * hmax), cur = hi == null ? i === n - 1 : i === hi;
      fillRR(x, base - h, bw, h, Math.min(14, bw / 2), v ? (cur ? col.accent : alpha(col.accent, .45)) : col.s3);
      if (showVals && v) txt(P.nf(v), x + bw / 2, base - h - 12, { abs: true, a: 'center', s: n > 14 ? 20 : 25, w: 700, c: cur ? col.accent : col.muted });
      if (labels[i]) txt(labels[i], x + bw / 2, base + 34, { abs: true, a: 'center', s: 22, w: 400, c: col.muted });
    });
  }

  R.weekly = P => {
    const { c, nf } = P, w = c.weeks, cw = w[w.length - 1].v, pw = w[w.length - 2].v, avg = c.sum(w.map(x => x.v)) / w.length;
    frame(V.t('s.weekly'), V.t('sh.weekly.sub'));
    tile(0, 400, (CW - 20) / 2, 150, nf(cw), V.t('sh.thisweek'), { c: col.accent });
    tile((CW - 20) / 2 + 20, 400, (CW - 20) / 2, 150, pw ? V.t('s.pct', { n: (cw >= pw ? '▲ ' : '▼ ') + nf(Math.abs(Math.round((cw - pw) / pw * 100))) }) : '—', V.t('sh.vsprev'), { c: cw >= pw ? col.accent : col.text, bs: 50 });
    bars(w.map(x => x.v), w.map((x, i) => (i % 2 === 1 || i === 11 ? P.dShort(x.w) : '')), 610, 1090, true, P);
    txt(V.t('s.weekly.avg', { n: nf(avg, 1) }), 0, 1170, { s: 26, w: 500, c: col.muted });
  };

  R.cal = P => {
    const { c, nf } = P, WEEKS = 18, thisW = P.weekStart(c.todayN), LBL = 96;
    frame(V.t('s.cal'), V.t('s.cal.sub'));
    let active = 0; for (let n = thisW - (WEEKS - 1) * 7; n <= c.todayN; n++) if (c.dayCnt.get(n)) active++;
    const tw = (CW - 40) / 3;
    [[nf(active), V.t('sh.activedays')], [nd(c.cur, P), V.t('s.h.streak')], [nd(c.best.len, P), V.t('sh.bestlabel')]].forEach(([b, l], i) => tile(i * (tw + 20), 400, tw, 150, b, l, { c: i === 0 ? col.accent : col.text, bs: 50 }));
    let max = 0; c.dayCnt.forEach(v => { max = Math.max(max, v); });
    const y0 = 680;
    let lastM = '';
    for (let w = 0; w < WEEKS; w++) {
      const ws = thisW - (WEEKS - 1 - w) * 7, x = PAD + LBL + w * ((CW - LBL) / WEEKS), mn = P.F(P.numDate(ws), { month: 'short' });
      if (mn !== lastM) { txt(mn, x + 4, y0 - 20, { abs: true, a: 'left', s: 22, w: 500, c: col.muted }); lastM = mn; }
      for (let r = 0; r < 7; r++) {
        const n = ws + r, v = c.dayCnt.get(n) || 0, cw2 = (CW - LBL) / WEEKS - 8;
        if (n > c.todayN) { rr(x, y0 + r * (cw2 + 8), cw2, cw2, 8); ctx.strokeStyle = alpha(col.text, .12); ctx.lineWidth = 2; ctx.stroke(); }
        else fillRR(x, y0 + r * (cw2 + 8), cw2, cw2, 8, lvlC(P.level(v, max)));
      }
    }
    E.DAYS.forEach((d, r) => { if (r % 2 === 0) txt(rtl ? (d.short || d.name) : d.name.slice(0, 3), PAD + LBL - 14, y0 + r * (((CW - LBL) / WEEKS - 8) + 8) + 28, { abs: true, a: 'right', s: 22, w: 400, c: col.muted }); });
    const ly = y0 + 7 * (((CW - LBL) / WEEKS - 8) + 8) + 50;
    txt(V.t('s.legend.less'), PAD + LBL, ly + 22, { abs: true, a: 'left', s: 22, c: col.muted });
    for (let i = 0; i < 5; i++) fillRR(PAD + LBL + 70 + i * 40, ly, 30, 30, 8, lvlC(i));
    txt(V.t('s.legend.more'), PAD + LBL + 70 + 5 * 40 + 6, ly + 22, { abs: true, a: 'left', s: 22, c: col.muted });
  };

  R.clock = P => {
    const { c, nf } = P, any = c.hours.some(Boolean), peak = c.hours.indexOf(Math.max(...c.hours)), pad2 = h => P.fa(String(h).padStart(2, '0'));
    frame(V.t('s.clock'), V.t('sh.clock.sub'));
    tile(0, 400, (CW - 20) / 2, 150, any ? pad2(peak) + ':' + P.fa('00') : '—', V.t('s.clock.peak'), { c: col.accent });
    const wmax = Math.max(...c.wk), wi = wmax ? c.wk.indexOf(wmax) : -1;
    tile((CW - 20) / 2 + 20, 400, (CW - 20) / 2, 150, wi >= 0 ? E.DAYS[wi].name : '—', V.t('sh.topday'), { bs: 46 });
    bars(c.hours, c.hours.map((v, h) => (h % 3 === 0 ? pad2(h) : '')), 610, 900, false, P, any ? peak : -1);
    txt(V.t('sh.byhour'), 0, 600, { s: 26, w: 600, c: col.muted });
    txt(V.t('sh.byday'), 0, 960, { s: 26, w: 600, c: col.muted });
    bars(c.wk, E.DAYS.map(d => (rtl ? (d.short || d.name) : d.name.slice(0, 3))), 985, 1140, true, P, wi);
  };

  R.balance = P => {
    const { c, nf, pct } = P, tot = Object.values(c.cats).reduce((a, b) => a + b, 0) || 1;
    frame(V.t('s.bal'), V.t('sh.bal.sub'));
    let x = PAD; const y = 400;
    E.CATEGORIES.forEach(k => { const v = c.cats[k.id] || 0; if (!v) return; const w = CW * v / tot; fillRR(x, y, Math.max(6, w - 4), 70, 20, col.cat[k.id] || col.accent); x += w; });
    E.CATEGORIES.forEach((k, i) => {
      const yy = 530 + i * 56; fillRR(X(0) - (rtl ? 26 : 0), yy - 24, 26, 26, 8, col.cat[k.id]);
      txt(E.catName(k.id), 44, yy, { s: 30, w: 600 }); txt(pct(Math.round((c.cats[k.id] || 0) / tot * 100)), CW, yy, { a: 'end', s: 30, w: 800, c: col.muted });
    });
    const mus = [...c.muscles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5), mmax = mus.length ? mus[0][1] : 1;
    txt(V.t('sh.muscles'), 0, 860, { s: 28, w: 700 });
    mus.forEach(([k, v], i) => {
      const yy = 916 + i * 58, label = E.ts(k);
      txt(label, 0, yy, { s: 26, w: 500, c: col.muted }); fillRR(PAD + (rtl ? 100 : 230), yy - 26, CW - 330, 22, 11, col.s3);
      const bw = Math.max(14, (CW - 330) * v / mmax); fillRR(PAD + (rtl ? CW - 230 - bw : 230), yy - 26, bw, 22, 11, col.accent);
      txt(nf(v), CW, yy, { a: 'end', s: 26, w: 700 });
    });
  };

  R.top = P => {
    const { c, nf } = P, rank = [...c.perMove.values()].filter(x => x.sets).sort((a, b) => b.sets - a.sets).slice(0, 5), rmax = rank.length ? rank[0].sets : 1;
    frame(V.t('s.top.t'), V.t('sh.top.sub'));
    if (!rank.length) { txt(V.t('s.none'), 0, 480, { s: 30, c: col.muted }); return; }
    rank.forEach((x, i) => {
      const m = E.getMove(x.m); if (!m) return; const y = 400 + i * 150, cc = col.cat[m.cat] || col.accent;
      fillRR(PAD, y, CW, 128, 28, col.s2);
      fillRR(X(18) - (rtl ? 64 : 0), y + 32, 64, 64, 20, alpha(cc, .2));
      txt(nf(i + 1), 18 + 32, y + 78, { a: 'center', s: 34, w: 900, c: cc });
      const nx = 18 + 64 + 24, nw = CW - nx - 24 - 230;
      txt(ellipsis(E.mName(m), nw, 31, 700), nx, y + 54, { s: 31, w: 700 });
      const fw = Math.max(10, nw * x.sets / rmax);
      fillRR(PAD + (rtl ? CW - nx - nw : nx), y + 76, nw, 14, 7, col.s3);
      fillRR(PAD + (rtl ? CW - nx - fw : nx), y + 76, fw, 14, 7, cc);
      txt(V.t('s.nsets', { n: nf(x.sets) }), CW - 24, y + 56, { a: 'end', s: 30, w: 800 });
      txt(x.best ? (x.bestU === 'sec' ? V.t('sh.rec.sec', { n: nf(x.best) }) : V.t('sh.rec.rep', { n: nf(x.best) })) : '', CW - 24, y + 100, { a: 'end', s: 23, w: 400, c: col.muted });
    });
  };

  R.goals = P => {
    const { nf } = P, gl = P.D.goals.slice().sort((a, b) => ((a.current >= a.target) - (b.current >= b.target)) || (b.current / (b.target || 1) - a.current / (a.target || 1))).slice(0, 5), done = P.D.goals.filter(g => g.target > 0 && g.current >= g.target).length;
    frame(V.t('s.goals'), V.t('s.goals.sub', { a: nf(done), b: nf(P.D.goals.length) }));
    if (!gl.length) { txt(V.t('s.g.none'), 0, 480, { s: 30, c: col.muted }); return; }
    gl.forEach((g, i) => {
      const y = 400 + i * 168, p = g.target > 0 ? Math.min(1, g.current / g.target) : 0, ok = g.current >= g.target;
      fillRR(PAD, y, CW, 148, 28, col.s2);
      txt(ellipsis(E.ts(g.title), CW - 220, 32, 700), 28, y + 52, { s: 32, w: 700 });
      txt(V.t('s.pct', { n: nf(Math.round(p * 100)) }), CW - 28, y + 52, { a: 'end', s: 34, w: 900, c: ok ? col.accent : col.text });
      fillRR(PAD + 28, y + 76, CW - 56, 20, 10, col.s3); fillRR(PAD + (rtl ? CW - 28 - Math.max(20, (CW - 56) * p) : 28), y + 76, Math.max(20, (CW - 56) * p), 20, 10, ok ? col.accent : alpha(col.accent, .7));
      txt(V.t('sh.goal.line', { c: nf(g.current), t: nf(g.target), u: E.tu(g.target, g.unit) }), 28, y + 128, { s: 24, w: 400, c: col.muted });
    });
  };

  R.habits = P => {
    const { c, nf, pct } = P, all = [...c.perMove.values()], tot = E.LIST.length;
    const rep = all.length ? Math.round(all.filter(x => x.weeks.size >= 2).length / all.length * 100) : 0;
    const starts = c.sessions.map(d => { const x = new Date(d.first); return x.getHours() * 60 + x.getMinutes(); });
    const avgS = starts.length ? c.sum(starts) / starts.length : null;
    frame(V.t('s.habits'), V.t('sh.habits.sub'));
    const tw = (CW - 20) / 2, items = [
      [c.adherence == null ? '—' : pct(c.adherence), V.t('sh.adh')], [nd(c.cur, P), V.t('s.h.streak')],
      [nd(c.best.len, P), V.t('sh.bestlabel')], [nf(all.length) + '/' + nf(tot), V.t('sh.reach')],
      [pct(rep), V.t('sh.repeat')], [avgS == null ? '—' : P.fa(String(Math.floor(avgS / 60)).padStart(2, '0') + ':' + String(Math.round(avgS % 60)).padStart(2, '0')), V.t('s.h.avgstart')]];
    items.forEach(([b, l], i) => tile((i % 2) * (tw + 20), 400 + Math.floor(i / 2) * 190, tw, 168, b, l, { c: i < 2 ? col.accent : col.text, bs: 52 }));
    const topMv = all.filter(x => x.sets).sort((a, b) => b.sets - a.sets)[0], m = topMv && E.getMove(topMv.m);
    if (m) { fillRR(PAD, 990, CW, 130, 28, col.s2); txt(V.t('sh.favmove'), 28, 1038, { s: 24, c: col.muted }); txt(ellipsis(E.mName(m), CW - 240, 34, 800), 28, 1088, { s: 34, w: 800 }); txt(V.t('s.nsets', { n: nf(topMv.sets) }), CW - 28, 1074, { a: 'end', s: 32, w: 800, c: col.accent }); }
  };

  /* ---------- ساخت و ارسال ---------- */
  async function render(kind, env) {
    E = env; const P = Stats.prep(env); rtl = env.dir === 'rtl'; col = palette();
    const ranges = { 7: 's.range.7', 30: 's.range.30', 90: 's.range.90', 0: 's.range.0' };
    V = { t: env.t, tag: env.t('sh.tag'), footer: env.t('sh.footer'), rangeLabel: kind === 'cal' || kind === 'weekly' || kind === 'habits' ? '' : env.t(ranges[env.range] || 's.range.30') };
    try { await Promise.all(['300 30px Waw', '400 30px Waw', '500 30px Waw', '600 30px Waw', '700 30px Waw', '800 30px Waw', '900 30px Waw'].map(f => document.fonts.load(f))); await document.fonts.ready; } catch (e) {}
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; ctx = cv.getContext('2d');
    (R[kind] || R.all)(P);
    return cv;
  }
  const toBlob = cv => new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error('blob'))), 'image/png'));

  async function send(kind, env) {
    const cv = await render(kind, env), name = `kinetix-${kind}-${new Date().toISOString().slice(0, 10)}.png`;
    const C = window.Capacitor, P = C && C.isNativePlatform && C.isNativePlatform() ? C.Plugins : null;
    if (P && P.Filesystem && P.Share) {
      const r = await P.Filesystem.writeFile({ path: name, data: cv.toDataURL('image/png').split(',')[1], directory: 'CACHE' });
      await P.Share.share({ title: env.t('sh.title'), files: [r.uri], dialogTitle: env.t('sh.dialog') });
      return 'native';
    }
    const blob = await toBlob(cv), file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: env.t('sh.title') }); return 'web'; } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    return 'download';
  }

  window.Share = { send, render, kinds: Object.keys(R) };
})();
