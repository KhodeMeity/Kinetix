/* ==========================================================================
   i18n.js — سیستم چندزبانهٔ سبک (فارسی fa / انگلیسی en)
   متن‌ها در locales/fa.json و locales/en.json هستند و با
   `node tools/build-locales.mjs` داخل www/js/locales.js (window.LOCALES) ساخته می‌شوند
   تا برنامه بدون سرور و بدون fetch هم (مثلاً با file:// یا داخل اپ) کار کند.
     ui    : متن‌های رابط کاربری با کلید  (t('کلید', {param}))
     data  : ترجمهٔ متن‌های ذخیره‌شده/دادهٔ فارسی (عضلات، نام اهداف پیشنهادی، واحدها...)  (ts('متن فارسی'))
     moves : ترجمهٔ حرکت‌های داخلی بر اساس شناسه (name, desc, steps, tips, mistakes)
   ========================================================================== */
(function () {
  'use strict';
  const KEY = 'calis-app-v1', FAD = '۰۱۲۳۴۵۶۷۸۹';
  const L = window.LOCALES || { fa: { ui: {}, data: {}, moves: {} }, en: { ui: {}, data: {}, moves: {} } };
  let lang = 'fa';
  try { const d = JSON.parse(localStorage.getItem(KEY) || '{}'); if (d.lang === 'en' || d.lang === 'fa') lang = d.lang; } catch (e) {}

  const dict = () => L[lang] || L.fa;
  function t(k, p) {
    let s = (dict().ui || {})[k];
    if (s == null) s = (L.fa.ui || {})[k];
    if (s == null) s = k;
    return p ? s.replace(/\{(\w+)\}/g, (m, n) => (p[n] != null ? p[n] : m)) : s;
  }
  const ts = s => { const v = (dict().data || {})[s]; return v != null ? v : s; };
  const num = n => (lang === 'fa' ? String(n).replace(/\d/g, d => FAD[+d]) : String(n));
  /* واحد با مفرد/جمع انگلیسی: tu(1,'تکرار') → rep ؛ tu(5,'تکرار') → reps */
  const tu = (n, u) => { const v = ts(u); return lang === 'en' && Number(n) === 1 && /^(reps|seconds|sessions|days)$/.test(v) ? v.slice(0, -1) : v; };
  const move = id => (dict().moves || {})[id] || null;

  function apply() {
    const h = document.documentElement;
    h.lang = lang; h.dir = lang === 'fa' ? 'rtl' : 'ltr'; h.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => { const [a, k] = pair.split(':'); if (a && k) el.setAttribute(a.trim(), t(k.trim())); });
    });
  }

  window.I18N = {
    t, ts, tu, num, move, apply,
    get lang() { return lang; },
    get dir() { return lang === 'fa' ? 'rtl' : 'ltr'; },
    get locale() { return lang === 'fa' ? 'fa-IR' : 'en-US'; },
    set(l) { if (l === 'fa' || l === 'en') lang = l; }
  };
})();
