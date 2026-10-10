// Bilder der Ägypten-Zeitszenen: node tools/zeit-eg.mjs [indizes,komma|all|test] [zeiten,komma] [scale=2] [entry=src/ui/zeitszenen.js] [calm=1] [sheet=Spalten]
// Ohne sheet: ein PNG je Szene und Zeit nach $OUT_DIR (Standard /tmp/claude-0/zeit_Z) als s<nr>_t<zeit>.png.
// Mit sheet=N: ein Kontaktbogen sheet_<name>.png mit N Spalten (name=... optional). Testblätter: entry=...test.js mit Export TEST(g,t).
import { build } from 'esbuild';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.includes('=')).map((a) => a.split('=')));
const pos = process.argv.slice(2).filter((a) => !a.includes('='));
const which = pos[0] || 'all', times = (pos[1] || '3').split(',').map(Number), scale = +(args.scale || 2);
const entry = args.entry || 'src/ui/zeitszenen.js', calm = args.calm === '1', cols = +(args.sheet || 0);
const outDir = process.env.OUT_DIR || '/tmp/claude-0/zeit_Z'; fs.mkdirSync(outDir, { recursive: true });
const r = await build({ entryPoints: [entry], bundle: true, format: 'iife', globalName: 'ZS', write: false });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: Math.round(480 * scale * Math.max(1, cols)), height: Math.round(300 * scale) } });
const errs = []; page.on('pageerror', (e) => errs.push(e.message + '\n' + e.stack)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await page.setContent('<body style="margin:0;background:#222"><div id="w" style="display:flex;flex-wrap:wrap;gap:4px"></div></body>');
await page.addScriptTag({ content: r.outputFiles[0].text });
const n = await page.evaluate(() => (window.ZS.SCENES ? window.ZS.SCENES.length : 0));
const list = which === 'test' ? ['test'] : which === 'all' ? Array.from({ length: n }, (_, i) => i) : which.split(',').map(Number);
const frames = []; for (const idx of list) for (const t of times) frames.push([idx, t]);
const res = await page.evaluate(({ frames, scale, calm, cols }) => {
  const w = document.getElementById('w'); w.innerHTML = ''; const out = [];
  if (cols) w.style.width = cols * (480 * scale + 4) + 'px';
  frames.forEach(([idx, t], i) => {
    const c = document.createElement('canvas'); c.width = 480 * scale; c.height = 300 * scale; c.id = 'f' + i; c.style.width = c.width + 'px'; c.style.height = c.height + 'px'; w.append(c);
    const g = c.getContext('2d'); g.setTransform(scale, 0, 0, scale, 0, 0);
    try { if (idx === 'test') window.ZS.TEST(g, t); else window.ZS.SCENES[idx].draw(g, t, { calm }); } catch (e) { out.push(idx + ' @' + t + ': ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')); }
  });
  return out;
}, { frames, scale, calm, cols });
if (res.length) console.log('FEHLER\n' + res.join('\n'));
if (cols) { await page.locator('#w').screenshot({ path: path.join(outDir, `sheet_${args.name || 'x'}.png`) }); }
else for (let i = 0; i < frames.length; i++) { const [idx, t] = frames[i]; await page.locator('#f' + i).screenshot({ path: path.join(outDir, `s${idx}_t${String(t).replace('.', '_')}${calm ? 'c' : ''}.png`) }); }
console.log(errs.join('\n') || 'fertig', frames.length, 'Bilder');
await browser.close();
