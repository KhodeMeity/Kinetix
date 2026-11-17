// ساخت js/locales.js از locales/fa.json و locales/en.json
// اجرا:  node tools/build-locales.mjs      (یا: npm run locales)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => JSON.parse(readFileSync(join(root, 'locales', f), 'utf8'));
const out = { fa: read('fa.json'), en: read('en.json') };
for (const k of Object.keys(out.fa.ui)) if (!(k in out.en.ui)) console.warn('⚠ کلید در en.json نیست:', k);
for (const k of Object.keys(out.en.ui)) if (!(k in out.fa.ui)) console.warn('⚠ کلید در fa.json نیست:', k);
writeFileSync(join(root, 'www', 'js', 'locales.js'), '/* خودکار از locales/*.json ساخته می‌شود؛ مستقیم ویرایش نکن */\nwindow.LOCALES = ' + JSON.stringify(out) + ';\n');
console.log('www/js/locales.js ساخته شد —', Object.keys(out.fa.ui).length, 'کلید رابط،', Object.keys(out.en.moves).length, 'حرکت ترجمه‌شده');
