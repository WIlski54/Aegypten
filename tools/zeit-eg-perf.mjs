// Fehler- und Zeitprüfung aller Ägypten-Zeitszenen (480x300 und 960x600): node tools/zeit-eg-perf.mjs
import { build } from 'esbuild';
import { chromium } from 'playwright-core';
const r = await build({ entryPoints: ['src/ui/zeitszenen.js'], bundle: true, format: 'iife', globalName: 'ZS', write: false });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<body></body>'); await page.addScriptTag({ content: r.outputFiles[0].text });
const out = await page.evaluate(() => {
  const res = [], S = window.ZS.SCENES;
  const ok = S.every((s, i) => i === 0 || S[i - 1].at > s.at) && S.every((s) => ['Frühzeit', 'Altes Reich', 'Mittleres Reich', 'Neues Reich', 'Späte Zeit', 'Ptolemäer'].includes(s.era) && s.title && s.cap && s.fact && s.short && s.when);
  res.push('Reihenfolge/Felder ok: ' + ok);
  res.push('sceneIndexAt: ' + [4000, 3300, 3200, 3100, 2600, 2560, 2000, 1500, 1323, 1000, 331, 100, 30, 0].map((b) => b + '->' + window.ZS.sceneIndexAt(b)).join(' '));
  for (const [k, scale] of [[0, 1], [1, 2]]) for (let i = 0; i < S.length; i++) {
    const c = document.createElement('canvas'); c.width = 480 * scale; c.height = 300 * scale; const g = c.getContext('2d');
    for (const calm of [false, true]) {
      const t0 = performance.now(); let n = 0;
      try { for (let t = 0; t < 120; t += 1.37) { g.setTransform(scale, 0, 0, scale, 0, 0); g.clearRect(0, 0, 480, 300); S[i].draw(g, t, { calm }); n++; } } catch (e) { res.push('FEHLER ' + i + ' ' + e.message); }
      if (!calm && k === 1) res.push(i + ' ' + S[i].id + ': ' + ((performance.now() - t0) / n).toFixed(1) + ' ms/Bild @960x600');
    }
  }
  return res;
});
console.log(out.join('\n'));
await browser.close();
