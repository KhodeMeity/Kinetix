/* ==========================================================================
   onboarding.js — تعیین سطح کاربر (Calisthenics Readiness Score)
   امتیاز کل از ۱۰۰ = ترکیب بدنی (WHtR، ۳۰ امتیاز) + آزمون عملکردی (۴ حرکت × حداکثر ۱۷٫۵)
     ۰ تا ۴۵  → مبتدی   |   ۴۶ تا ۷۸ → متوسط   |   ۷۹ تا ۱۰۰ → پیشرفته
   API:  Onboard.compute(input) → نتیجه (تابع خالص؛ برای تست)
         Onboard.start(env)     → رابط تمام‌صفحه؛ env = { T, num, ico, esc, onDone(result|null, action) }
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- منطق امتیازدهی (طبق مشخصات) ---------------- */
  const PTS = [5, 12, 17.5];                       /* مبتدی / متوسط / پیشرفته برای هر حرکت */
  const tierOf = {
    pull:   v => (v <= 4 ? 0 : v <= 12 ? 1 : 2),
    dips:   v => (v <= 6 ? 0 : v <= 15 ? 1 : 2),
    push:   v => (v <= 10 ? 0 : v <= 25 ? 1 : 2),
    hollow: v => (v < 15 ? 0 : v <= 40 ? 1 : 2)
  };
  const KEYS = ['pull', 'dips', 'push', 'hollow'];

  function compute(inp) {
    /* ۱) WHtR */
    let cat = 'none', whtr = 20;                    /* بدون اندازه‌ها: امتیاز خنثی (محدودهٔ متعادل) */
    const h = +inp.height, w = +inp.waist;
    if (h > 0 && w > 0) {
      const r = w / h;
      if (r < 0.48) { cat = 'gold'; whtr = 30; } else if (r <= 0.52) { cat = 'bal'; whtr = 20; } else { cat = 'high'; whtr = 10; }
    }
    /* ۲) آزمون عملکردی (یا اسلایدر «نمی‌دانم») */
    const tiers = {};
    KEYS.forEach(k => { tiers[k] = inp.tier != null ? inp.tier : tierOf[k](+inp[k] || 0); });
    const parts = {}; KEYS.forEach(k => { parts[k] = PTS[tiers[k]]; });
    const total = whtr + KEYS.reduce((a, k) => a + parts[k], 0);
    const level = total < 46 ? 1 : total < 79 ? 2 : 3;
    /* ۳) تحلیل ترکیبی: قدرت بالاتنه (بارفیکس، دیپ، شنا) در برابر WHtR */
    const avg = (tiers.pull + tiers.dips + tiers.push) / 3;
    const upper = avg < 0.67 ? 'low' : avg < 1.34 ? 'mid' : 'high';
    return { whtrScore: whtr, whtrCat: cat, parts, tiers, total, level, upper };
  }

  /* ---------------- رابط ---------------- */
  const FAD = '۰۱۲۳۴۵۶۷۸۹';
  const toEn = s => String(s).replace(/[۰-۹]/g, d => FAD.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const parse = v => { const n = parseFloat(toEn(v).replace(/[^\d.]/g, '')); return isNaN(n) ? '' : n; };

  let env = null, root = null, st = null, prevFocus = null;
  const t = (k, p) => env.T(k, p);

  const freshState = () => ({ step: 0, height: '', waist: '', noBody: false, pull: 0, dips: 0, push: 0, hollow: 0, unknown: false, tier: 1, res: null });
  const STEPS = 3;                                  /* بدن، قدرت، نتیجه (+ خوش‌آمد) */

  const bodyValid = () => st.noBody || (st.height >= 100 && st.height <= 230 && st.waist >= 40 && st.waist <= 200 && st.waist < st.height);

  function dots() { return `<div class="ob-dots" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i class="${i <= st.step ? 'on' : ''}"></i>`).join('')}</div>`; }

  function field(key, label, unit, hint) {
    const v = st[key];
    return `<div class="ob-field"><label for="ob-${key}">${label}${hint ? `<small>${hint}</small>` : ''}</label>
      <div class="ob-step"><button type="button" data-ob="step" data-k="${key}" data-d="-1" aria-label="${t('c.less')}">${env.ico('i-minus')}</button>
      <input id="ob-${key}" inputmode="numeric" autocomplete="off" data-ob-in="${key}" value="${v === '' ? '' : env.num(v)}" placeholder="${key === 'height' ? env.num(170) : key === 'waist' ? env.num(80) : env.num(0)}" aria-describedby="ob-unit-${key}">
      <button type="button" data-ob="step" data-k="${key}" data-d="1" aria-label="${t('c.more')}">${env.ico('i-plus')}</button></div>
      <span class="ob-unit" id="ob-unit-${key}">${unit}</span></div>`;
  }

  function body() {
    if (st.step === 0) {
      return `<div class="ob-hero">${env.ico('p-pull', 'pict')}</div>
        <h2 id="ob-h">${t('ob.welcome.t')}</h2><p class="ob-p">${t('ob.welcome.d')}</p>
        <button type="button" class="btn sm ghost" style="align-self:flex-start" data-ob="lang" aria-label="${t('chrome.lang')}">${t('chrome.lang.btn')} · ${t('chrome.lang')}</button>`;
    }
    if (st.step === 1) {
      return `<p class="ob-step-n">${t('ob.step', { n: env.num(1), t: env.num(2) })}</p>
        <h2 id="ob-h">${t('ob.body.t')}</h2><p class="ob-p">${t('ob.body.d')}</p>
        <div class="ob-fields ${st.noBody ? 'off' : ''}">${field('height', t('ob.height'), t('ob.cm'))}${field('waist', t('ob.waist'), t('ob.cm'), t('ob.waist.hint'))}</div>
        <label class="ob-check"><input type="checkbox" data-ob-check="noBody" ${st.noBody ? 'checked' : ''}><span>${t('ob.nobody')}</span></label>
        <p class="ob-err" role="alert" ${st.showErr && !bodyValid() ? '' : 'hidden'}>${t('ob.err.body')}</p>`;
    }
    if (st.step === 2) {
      const unk = st.unknown;
      return `<p class="ob-step-n">${t('ob.step', { n: env.num(2), t: env.num(2) })}</p>
        <h2 id="ob-h">${unk ? t('ob.slider.t') : t('ob.str.t')}</h2><p class="ob-p">${unk ? t('ob.slider.d') : t('ob.str.d')}</p>
        ${unk ? `<div class="ob-tiers" role="radiogroup" aria-label="${t('ob.slider.t')}">${[0, 1, 2].map(i => `<button type="button" role="radio" aria-checked="${st.tier === i}" class="ob-tier ${st.tier === i ? 'on' : ''}" data-ob="tier" data-v="${i}">
            <b>${t('ob.tier.' + (i + 1))}</b><small>${t('ob.tier.' + (i + 1) + '.s')}</small></button>`).join('')}</div>
          <button type="button" class="ob-link" data-ob="known">${t('ob.known')}</button>`
        : `<div class="ob-fields">${field('pull', t('ob.q.pull'), t('ob.unit.rep'))}${field('dips', t('ob.q.dips'), t('ob.unit.rep'))}${field('push', t('ob.q.push'), t('ob.unit.rep'))}${field('hollow', t('ob.q.hollow'), t('ob.unit.sec'))}</div>
          <button type="button" class="ob-link" data-ob="unknown">${t('ob.unknown')}</button>`}`;
    }
    /* نتیجه */
    const r = st.res, pct = Math.round(r.total), C = 2 * Math.PI * 52;
    return `<div class="ob-ring" role="img" aria-label="${t('ob.score')}: ${env.num(pct)} / ${env.num(100)}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" style="stroke-dasharray:${(C * pct / 100).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <div><b>${env.num(pct)}</b><small>${t('ob.score')}</small></div></div>
      <h2 id="ob-h" class="ob-res-t">${t('ob.res.t', { lvl: t('level.' + r.level) })}</h2>
      <p class="ob-focus">${t('ob.focus.' + r.level)}</p>
      <div class="ob-card"><b>${env.ico('i-flame')}${t('ob.card.body')}</b><p>${t('ob.whtr.' + r.whtrCat)}</p></div>
      <div class="ob-card"><b>${env.ico('i-bolt')}${t('ob.card.mix')}</b><p>${t('ob.mix.' + r.upper + '.' + r.whtrCat)}</p></div>`;
  }

  function foot() {
    if (st.step === 0) return `<button class="btn primary block" data-ob="next">${t('ob.start')}</button><button class="btn ghost block" data-ob="skipall">${t('ob.skipall')}</button>`;
    if (st.step === 3) return `<button class="btn primary block" data-ob="apply">${env.ico('i-check')}${t('ob.apply')}</button><button class="btn ghost block" data-ob="keep">${t('ob.keep')}</button>`;
    return `<button class="btn ghost" data-ob="back">${t('ob.back')}</button><button class="btn primary grow" data-ob="next">${st.step === 2 ? t('ob.calc') : t('ob.next')}</button>`;
  }

  function paint(focus = true) {
    root.innerHTML = `<div class="ob-in">${dots()}<div class="ob-body">${body()}</div><div class="ob-foot">${foot()}</div></div>`;
    root.scrollTop = 0;
    if (focus) { const h = root.querySelector('#ob-h'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }

  function close(result, action) {
    root.hidden = true; root.innerHTML = '';
    document.documentElement.classList.remove('ob-open');
    try { prevFocus && prevFocus.focus && prevFocus.focus(); } catch (e) {}
    env.onDone && env.onDone(result, action);
  }

  function onClick(e) {
    const b = e.target.closest('[data-ob]'); if (!b) return;
    const a = b.dataset.ob;
    if (a === 'step') {
      const k = b.dataset.k, d = +b.dataset.d, cur = +st[k] || 0;
      const lim = { height: [100, 230], waist: [40, 200], hollow: [0, 600] }[k] || [0, 200];
      const base = (cur === 0 && (k === 'height' || k === 'waist')) ? (k === 'height' ? 170 : 80) : cur + d;
      st[k] = Math.min(lim[1], Math.max(lim[0] === 0 ? 0 : lim[0], base)); st.showErr = false; paint(false);
      const i = root.querySelector('#ob-' + k); i && i.focus({ preventScroll: true });
      return;
    }
    if (a === 'next') {
      if (st.step === 1 && !bodyValid()) { st.showErr = true; paint(false); return; }
      if (st.step === 2) { st.res = compute({ height: st.noBody ? 0 : st.height, waist: st.noBody ? 0 : st.waist, pull: st.pull, dips: st.dips, push: st.push, hollow: st.hollow, tier: st.unknown ? st.tier : null }); }
      st.step++; paint(); return;
    }
    if (a === 'lang') { env.onLang && env.onLang(); paint(); return; }
    if (a === 'back') { st.step = Math.max(0, st.step - 1); paint(); return; }
    if (a === 'unknown') { st.unknown = true; paint(); return; }
    if (a === 'known') { st.unknown = false; paint(); return; }
    if (a === 'tier') { st.tier = +b.dataset.v; paint(false); const x = root.querySelector('.ob-tier.on'); x && x.focus({ preventScroll: true }); return; }
    if (a === 'skipall') { close(null, 'skip'); return; }
    if (a === 'apply' || a === 'keep') {
      const r = st.res;
      close({ ...r, height: st.noBody ? null : st.height, waist: st.noBody ? null : st.waist, bench: st.unknown ? null : { pull: st.pull, dips: st.dips, push: st.push, hollow: st.hollow }, estimated: st.unknown, at: Date.now() }, a);
    }
  }
  function onInput(e) {
    const el = e.target.closest('[data-ob-in]'); if (!el) return;
    const v = parse(el.value); st[el.dataset.obIn] = v; st.showErr = false;
  }
  function onChange(e) {
    const c = e.target.closest('[data-ob-check]'); if (!c) return;
    st[c.dataset.obCheck] = c.checked; st.showErr = false; paint(false);
    const x = root.querySelector('[data-ob-check]'); x && x.focus({ preventScroll: true });
  }
  function onKey(e) { if (e.key === 'Escape') e.preventDefault(); }

  function start(e) {
    env = e; root = document.getElementById('onboard'); if (!root) return;
    st = freshState(); prevFocus = document.activeElement;
    if (!root.dataset.bound) {
      root.addEventListener('click', onClick); root.addEventListener('input', onInput);
      root.addEventListener('change', onChange); root.addEventListener('keydown', onKey); root.dataset.bound = '1';
    }
    root.hidden = false; document.documentElement.classList.add('ob-open'); paint();
  }

  window.Onboard = { compute, start, isOpen: () => !!root && !root.hidden, back: () => { if (!root || root.hidden) return false; if (st.step > 0) { st.step--; paint(); } else close(null, 'skip'); return true; } };
})();
