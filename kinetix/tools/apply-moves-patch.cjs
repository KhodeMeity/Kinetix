/* اجرا: node tools/apply-moves-patch.cjs
   حرکت‌های جدید را به www/js/data.js و locales/en.json اضافه و توضیحات حرکت‌های ناقص را کامل می‌کند.
   سپس:  node tools/build-locales.mjs */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const P = [require('./moves-patch-1.cjs'), require('./moves-patch-2.cjs')];
const fills = Object.assign({}, ...P.map(p => p.fills));
const merges = Object.assign({}, ...P.map(p => p.merges));
const news = [].concat(...P.map(p => p.news));

const dataPath = path.join(root, 'www/js/data.js');
let src = fs.readFileSync(dataPath, 'utf8');
const sandbox = { window: {} }; vm.runInNewContext(src, sandbox);
const MOVES = sandbox.window.MOVES;
const byId = new Map(MOVES.map(m => [m.id, m]));
const enPath = path.join(root, 'locales/en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const q = s => JSON.stringify(s);
const fa = a => a.map(x => x[0]), eng = a => a.map(x => x[1]);

/* ----- سریال‌سازی همان سبک فایل ----- */
function block(m) {
  const L = [];
  L.push('  {');
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
const uniq = (arr, add) => { const out = arr.slice(); add.forEach(x => { if (!out.includes(x)) out.push(x); }); return out; };

const report = { filled: [], merged: [], added: [] };

/* ----- ۱) تکمیل حرکت‌های بدون توضیح ----- */
for (const [id, f] of Object.entries(fills)) {
  const m = byId.get(+id); if (!m) throw new Error('no move ' + id);
  if (m.steps && m.steps.length) throw new Error('move ' + id + ' already has steps; move it to merges');
  m.steps = fa(f.steps); m.tips = fa(f.tips); m.mistakes = fa(f.mistakes);
  const o = en.moves[id] || (en.moves[id] = {});
  o.steps = eng(f.steps); o.tips = eng(f.tips); o.mistakes = eng(f.mistakes);
  report.filled.push(+id);
}
/* ----- ۲) ترکیب با توضیحات موجود (بدون تکرار) ----- */
for (const [id, g] of Object.entries(merges)) {
  const m = byId.get(+id); if (!m || !m.steps) throw new Error('merge target invalid ' + id);
  const o = en.moves[id];
  for (const k of ['tips', 'mistakes']) {
    if (!g[k]) continue;
    m[k] = uniq(m[k] || [], fa(g[k])); o[k] = uniq(o[k] || [], eng(g[k]));
    if (m[k].length !== o[k].length) throw new Error('FA/EN length mismatch ' + id + ' ' + k);
  }
  report.merged.push(+id);
}
for (const id of [...Object.keys(fills), ...Object.keys(merges)]) {
  const [s, e] = findBlock(id); src = src.slice(0, s) + block(byId.get(+id)) + src.slice(e);
}

/* ----- ۳) حرکت‌های جدید (۱۰۱ به بعد) ----- */
let nextId = Math.max(...MOVES.map(m => m.id)) + 1;
const newBlocks = [];
for (const n of news) {
  const id = nextId++;
  const m = { id, cat: n.cat, level: n.level, iso: !!n.iso, name: n.name[0], en: n.name[1],
    muscles: fa(n.muscles), desc: n.desc[0], rec: n.rec, steps: fa(n.steps), tips: fa(n.tips), mistakes: fa(n.mistakes) };
  newBlocks.push(block(m));
  en.moves[id] = { desc: n.desc[1], steps: eng(n.steps), tips: eng(n.tips), mistakes: eng(n.mistakes) };
  n.muscles.forEach(([f, e]) => { if (!(f in en.data)) en.data[f] = e; });
  report.added.push(id);
}
const endMarker = '\n];\n\n/* مسیرهای پیشرفت';
const at = src.indexOf(endMarker); if (at < 0) throw new Error('MOVES end not found');
src = src.slice(0, at).replace(/,\s*$/, '') + ',\n' + newBlocks.join(',\n') + src.slice(at);

fs.writeFileSync(dataPath, src);
fs.writeFileSync(enPath, JSON.stringify(en, null, 1) + '\n');
console.log(JSON.stringify({ filled: report.filled.length, merged: report.merged.length, added: report.added.length, firstNew: report.added[0], lastNew: report.added.at(-1) }));
