/* ==========================================================================
   notify.js — اعلان‌های محلی (@capacitor/local-notifications)، بدون سرور و آفلاین
     • یادآور هفتگی روزهای تمرین (هر روز تمرینی در ساعت انتخابی؛ روزهای استراحت ندارند)
     • اعلان یک‌باره برای پایان استراحت/نگه‌داشتن وقتی اپ در پس‌زمینه است
   در مرورگر (بدون پلاگین) همهٔ تابع‌ها بی‌اثرند و available() مقدار false می‌دهد.
   ========================================================================== */
(function () {
  'use strict';
  const LN = () => { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.LocalNotifications || null; };
  const CH_REMIND = 'kx-reminders', CH_TIMER = 'kx-timer', ONE = 100;
  let chDone = '';

  async function channels(names) {
    const L = LN(); if (!L || !L.createChannel) return;
    const key = JSON.stringify(names); if (key === chDone) return;
    try {
      await L.createChannel({ id: CH_REMIND, name: names.remind, importance: 4, visibility: 1, vibration: true });
      await L.createChannel({ id: CH_TIMER, name: names.timer, importance: 5, visibility: 1, vibration: true });
      chDone = key;
    } catch (e) {}
  }
  async function granted() { const L = LN(); if (!L) return false; try { return (await L.checkPermissions()).display === 'granted'; } catch (e) { return false; } }
  async function ask() {
    const L = LN(); if (!L) return false;
    try { let p = await L.checkPermissions(); if (p.display !== 'granted') p = await L.requestPermissions(); return p.display === 'granted'; } catch (e) { return false; }
  }

  /* opts: { on, time:'HH:MM', days:[{ jsDay, rest, title, n }], title, body(d), names:{remind,timer} }
     jsDay: ۰=یک‌شنبه … ۶=شنبه  →  weekday پلاگین: ۱=یک‌شنبه … ۷=شنبه */
  async function sync(opts) {
    const L = LN(); if (!L) return false;
    try { await L.cancel({ notifications: [0, 1, 2, 3, 4, 5, 6].map(d => ({ id: 1 + d })) }); } catch (e) {}
    if (!opts.on) return true;
    if (!(await granted())) return false;
    await channels(opts.names);
    const [h, m] = String(opts.time || '18:00').split(':').map(x => parseInt(x, 10));
    const list = opts.days.filter(d => !d.rest && d.n > 0).map(d => ({
      id: 1 + d.jsDay, title: opts.title, body: opts.body(d), channelId: CH_REMIND,
      schedule: { on: { weekday: d.jsDay + 1, hour: isNaN(h) ? 18 : h, minute: isNaN(m) ? 0 : m }, allowWhileIdle: true },
      smallIcon: 'ic_stat_kinetix', iconColor: '#c9f53b'
    }));
    if (!list.length) return true;
    try { await L.schedule({ notifications: list }); return true; } catch (e) { return false; }
  }

  async function at(ms, title, body, names) {
    const L = LN(); if (!L || !(await granted())) return;
    await channels(names || { remind: 'Kinetix', timer: 'Kinetix' });
    try { await L.schedule({ notifications: [{ id: ONE, title, body, channelId: CH_TIMER, schedule: { at: new Date(ms), allowWhileIdle: true }, smallIcon: 'ic_stat_kinetix', iconColor: '#c9f53b' }] }); } catch (e) {}
  }
  async function cancelAt() { const L = LN(); if (!L) return; try { await L.cancel({ notifications: [{ id: ONE }] }); } catch (e) {} }

  window.Notify = { available: () => !!LN(), ask, granted, sync, at, cancelAt };
})();
