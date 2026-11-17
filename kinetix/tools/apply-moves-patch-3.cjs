/* اجرا (فقط یک بار): node tools/apply-moves-patch-3.cjs
   بخش ۳ «آپدیت حرکات»: توضیح کامل ۵۸ حرکتی که هنوز مراحل نداشتند (مراحل اجرا، نکته‌ها، اشتباهات) +
   متن «دربارهٔ حرکت»، عضلات درگیر و پیشنهاد ست/تکرار از فایل tools/moves-patch-3.json
   (هر متن به‌صورت [فارسی، English]). سپس:  node tools/build-locales.mjs
   اگر حرکتی از قبل مراحل داشته باشد رد می‌شود؛ پس اجرای دوباره چیزی را دوبار اضافه نمی‌کند. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'moves-patch-3.json'), 'utf8'));
const dataPath = path.join(root, 'www/js/data.js'), enPath = path.join(root, 'locales/en.json');
let src = fs.readFileSync(dataPath, 'utf8');
const sandbox = { window: {} }; vm.runInNewContext(src, sandbox);
const byId = new Map(sandbox.window.MOVES.map(m => [m.id, m]));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const q = s => JSON.stringify(s), fa = a => a.map(x => x[0]), eng = a => a.map(x => x[1]);
const RENAME = { 3: 'Shiskabob Push-up (3-Position Pause)' };   /* در فایل، «شیس‌کاک» همان شنای مکث سه‌نقطه‌ای است */

function block(m) {
  const L = ['  {'];
  L.push(`    id: ${m.id}, cat: ${q(m.cat)}, level: ${m.level}, iso: ${!!m.iso}${m.basic ? ', basic: true' : ''},`);
  L.push(`    name: ${q(m.name)}, en: ${q(m.en)},`);
  L.push(`    muscles: [${m.muscles.map(q).join(', ')}],`);
  L.push(`    desc: ${q(m.desc)},`);
  L.push(`    rec: { sets: ${m.rec.sets}, amount: ${m.rec.amount}, unit: ${q(m.rec.unit)}${m.rec.perSide ? ', perSide: true' : ''} }${m.steps ? ',' : ''}`);
  if (m.steps) {
    L.push('    steps: [', ...m.steps.map(s => '      ' + q(s) + ','), '    ],');
    L.push('    tips: [', ...(m.tips || []).map(s => '      ' + q(s) + ','), '    ],');
    L.push('    mistakes: [', ...(m.mistakes || []).map(s => '      ' + q(s) + ','), '    ]');
  }
  L.push('  }');
  return L.join('\n');
}
function findBlock(id) {
  const key = `\n  {\n    id: ${id}, `;
  const s = src.indexOf(key); if (s < 0) throw new Error('block not found ' + id);
  const e = src.indexOf('\n  }', s + key.length); if (e < 0) throw new Error('end not found ' + id);
  return [s + 1, e + 4];
}
let done = 0, skipped = [];
for (const p of P) {
  const m = byId.get(p.id); if (!m) throw new Error('no move ' + p.id);
  if (m.steps && m.steps.length) { skipped.push(p.id); continue; }
  m.desc = p.desc[0];
  if (p.muscles) { m.muscles = fa(p.muscles); p.muscles.forEach(([f, e]) => { if (!(f in en.data)) en.data[f] = e; }); }
  m.rec = p.rec; m.iso = p.rec.unit === 'sec';
  m.steps = fa(p.steps); m.tips = fa(p.tips); m.mistakes = fa(p.mistakes);
  if (RENAME[p.id]) m.en = RENAME[p.id];
  const o = en.moves[p.id] || (en.moves[p.id] = {});
  o.desc = p.desc[1]; o.steps = eng(p.steps); o.tips = eng(p.tips); o.mistakes = eng(p.mistakes);
  if (RENAME[p.id] && o.name) o.name = RENAME[p.id];
  const [s, e] = findBlock(p.id); src = src.slice(0, s) + block(m) + src.slice(e); done++;
}
fs.writeFileSync(dataPath, src);
fs.writeFileSync(enPath, JSON.stringify(en, null, 1) + '\n');
console.log(JSON.stringify({ updated: done, skipped }));
