// بعد از هر «cap sync» اجرا می‌شود:
//  ۱) مطمئن می‌شود مجوزهای لازم در مانیفست هست (شبکه برای WebView، WAKE_LOCK برای روشن ماندن صفحه در «شروع تمرین»)
//  ۲) آیکون کوچک اعلان (ic_stat_kinetix) را داخل پروژهٔ اندروید کپی می‌کند
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';

const manifest = 'android/app/src/main/AndroidManifest.xml';
if (!existsSync(manifest)) { console.log('[patch] پوشهٔ android پیدا نشد؛ ردشد.'); process.exit(0); }

let xml = readFileSync(manifest, 'utf8'), changed = false;
for (const p of ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE', 'android.permission.WAKE_LOCK']) {
  if (!xml.includes(p)) { xml = xml.replace(/<\/manifest>/, `    <uses-permission android:name="${p}" />\n</manifest>`); changed = true; console.log('[patch] مجوز اضافه شد:', p); }
}
if (changed) writeFileSync(manifest, xml);

const src = 'assets/android/ic_stat_kinetix.png', dir = 'android/app/src/main/res/drawable';
if (existsSync(src)) { mkdirSync(dir, { recursive: true }); copyFileSync(src, `${dir}/ic_stat_kinetix.png`); console.log('[patch] آیکون اعلان کپی شد.'); }
else console.log('[patch] assets/android/ic_stat_kinetix.png پیدا نشد؛ اعلان‌ها آیکون پیش‌فرض می‌گیرند.');

/* ۳) امضای ثابت: هر بار با همان کلید (signing/kinetix.p12) امضا می‌شود تا نسخهٔ جدید روی نسخهٔ قبلی نصب شود.
      هر دو حالت debug و release با همین کلید ساخته می‌شوند. */
const gradle = 'android/app/build.gradle', ks = 'signing/kinetix.p12';
if (existsSync(gradle) && existsSync(ks)) {
  let g = readFileSync(gradle, 'utf8');
  if (g.includes('// kinetix-signing')) console.log('[patch] امضای ثابت از قبل هست.');
  else if (!/buildTypes\s*\{/.test(g)) console.log('[patch] هشدار: بلوک buildTypes پیدا نشد؛ امضای ثابت اعمال نشد.');
  else {
    const block = `// kinetix-signing
    signingConfigs {
        kinetix {
            storeFile rootProject.file('../${ks}')
            storeType 'pkcs12'
            storePassword System.getenv('KINETIX_STORE_PASS') ?: 'kinetix-app-2026'
            keyAlias 'kinetix'
            keyPassword System.getenv('KINETIX_KEY_PASS') ?: 'kinetix-app-2026'
        }
    }
    buildTypes {
        debug { signingConfig signingConfigs.kinetix }
        release { signingConfig signingConfigs.kinetix }`;
    g = g.replace(/buildTypes\s*\{/, block);
    writeFileSync(gradle, g); console.log('[patch] امضای ثابت به build.gradle اضافه شد.');
  }
} else console.log('[patch] build.gradle یا signing/kinetix.p12 پیدا نشد؛ امضای ثابت رد شد.');
