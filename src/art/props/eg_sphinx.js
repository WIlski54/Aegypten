// Gruppe S1 – sphinx: Große Sphinx von Gizeh von der Seite (schaut nach +x), Löwenkörper, Königskopf mit Nemes-Kopftuch.
// Sandstein-Töne mit Schichtlinien (der echte Fels hat Gesteinsbänder). opts.paint = 'bunt': Nemes blau/gold, Gesicht rotbraun (ursprüngliche Bemalung).
import {
  PAL, spec, rect, blob, limb, poly, rngOf, wavy, volume, fillPoly, fillGrad, curve, strokes, sandSpeckle, mix, shade,
} from './_eg_land_kit.js';

export function sphinx(opts = {}) {
  const bunt = opts.paint === 'bunt';
  const rng = rngOf(opts.seed ?? 1, 501);
  const stone = { top: '#ecd196', bottom: '#c39b60' }, stoneDark = { top: '#cfa86c', bottom: '#a47d48' };
  const edgeDark = 'rgba(70,40,15,.5)';
  const layers = [];
  const strata = (c, bb, y0, y1, step, seed, alpha = 0.26) => {
    const r = rngOf(seed, 3);
    for (let y = y0; y < y1; y += step * (0.8 + r() * 0.5)) curve(c, wavy(bb.x0 - 0.2, bb.x1 + 0.2, y, 0.02, 3 + Math.floor(r() * 3), { n: 50, phase: r() * 6 }), `rgba(90,55,20,${alpha})`, 0.02 + r() * 0.015, { alpha: 1 });
  };
  // --- Schwanz (kleine Schleife hinten) und fernes Hinterbein/Pfote
  layers.push({
    shapes: [limb([[0.5, 0.2, 0.2], [0.05, 0.12, 0.16], [-0.22, 0.4, 0.14], [-0.18, 0.82, 0.12], [-0.02, 1.0, 0.18]], { per: 6 })], fill: stoneDark,
    deco(c, bb) { volume(c, bb); },
  });
  // fernes Vorderbein (dahinter, dunkler)
  layers.push({
    shapes: [limb([[4.6, 0.5, 0.5], [5.3, 0.3, 0.44], [5.9, 0.2, 0.38]], { per: 6 }), blob(6.0, 0.2, 0.19, 0.19, 0, 14)], fill: stoneDark,
    deco(c, bb) { volume(c, bb, { dark: 'rgba(60,30,10,.35)', light: 'rgba(255,230,170,.1)' }); },
  });
  // --- Körper
  const body = poly([
    [0.4, 0.0], [0.08, 0.22], [0.0, 0.7], [0.2, 1.08], [0.7, 1.34], [1.4, 1.42], [2.2, 1.43], [3.0, 1.41], [3.6, 1.5], [4.05, 1.68], [4.35, 1.95], [4.55, 2.0],
    [4.95, 1.7], [5.1, 1.2], [5.05, 0.75], [4.9, 0.5], [4.7, 0.0],
  ], 2);
  layers.push({
    shapes: [body], fill: stone,
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(90,50,15,.42)', light: 'rgba(255,245,210,.25)' });
      strata(c, bb, 0.14, 1.9, 0.2, 3, 0.26);
      // Schatten unter dem Bauch und am Rücken-Licht
      fillGrad(c, rect(bb.x0 - 1, bb.y0 - 1, bb.x1 + 1, 0.5), 0, 0, 0, 0.5, [[0, 'rgba(70,35,10,.4)'], [1, 'rgba(70,35,10,0)']]);
      curve(c, [[0.25, 1.0], [0.8, 1.2], [1.6, 1.3], [2.4, 1.32], [3.1, 1.3], [3.65, 1.38], [4.05, 1.54]].map(([x, y]) => [x, y - 0.03]), 'rgba(255,246,214,.6)', 0.05, { alpha: 1 });
      sandSpeckle(c, bb, 5, 90, { rmax: 0.02 });
      // Hinterschenkel: runde Wölbung mit dunkler Kontur
      const th = []; for (let a = 0.2; a < 4.6; a += 0.2) th.push([1.0 + Math.cos(a) * 0.82, 0.58 + Math.sin(a) * 0.62]);
      curve(c, th, 'rgba(80,45,15,.4)', 0.03, { alpha: 1 });
      fillPoly(c, blob(0.82, 0.72, 0.38, 0.3, 0.3, 20), 'rgba(255,240,200,.16)');
      // Rippen-/Bauchschatten an der Brust
      curve(c, [[4.5, 1.1], [4.75, 0.9], [4.85, 0.6]], 'rgba(80,45,15,.3)', 0.03, { alpha: 1 });
    },
  });
  // Hinterpfote
  layers.push({
    shapes: [poly([[1.25, 0.0], [1.15, 0.14], [1.45, 0.3], [2.0, 0.28], [2.12, 0.12], [2.05, 0.0]], 2)], fill: stone,
    deco(c, bb) { volume(c, bb, { dark: 'rgba(90,50,15,.4)', light: 'rgba(255,245,210,.2)' }); for (const x of [1.85, 2.0]) curve(c, [[x, 0.04], [x + 0.03, 0.2]], edgeDark, 0.014, { alpha: 1 }); },
  });
  // --- nahes Vorderbein mit Pfote und Zehen
  layers.push({
    shapes: [limb([[4.3, 0.7, 0.8], [4.9, 0.5, 0.7], [5.6, 0.38, 0.62], [5.95, 0.33, 0.55]], { per: 6 }), blob(6.0, 0.42, 0.13, 0.13, 0, 12), blob(6.1, 0.27, 0.13, 0.13, 0, 12), blob(6.04, 0.13, 0.11, 0.11, 0, 12)], fill: stone,
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(90,50,15,.42)', light: 'rgba(255,245,210,.28)' });
      strata(c, bb, 0.1, 0.8, 0.18, 8, 0.22);
      curve(c, [[4.5, 1.0], [5.2, 0.78], [5.8, 0.66]], 'rgba(255,246,214,.55)', 0.04, { alpha: 1 });
      for (const y of [0.35, 0.2]) curve(c, [[5.85, y], [6.1, y]], edgeDark, 0.016, { alpha: 1 });
      sandSpeckle(c, bb, 7, 30, { rmax: 0.015 });
    },
  });
  // --- Kopf (Skalierung K um den Halsansatz, damit das Gesicht gut lesbar ist) ---------------------------------
  const K = opts.kopf ?? 1.28, OX = 4.55, OY = 1.45;
  const H = ([x, y]) => [OX + (x - OX) * K, OY + (y - OY) * K];
  const HP = (pts) => pts.map(H);
  const Hr = (r) => r * K;
  const blobH = (x, y, rx, ry, rot, n) => { const [X, Y] = H([x, y]); return blob(X, Y, rx * K, ry * K, rot, n); };
  const curveH = (c, pts, col, w, o) => curve(c, HP(pts), col, w * K, o);
  const face = poly(HP([
    [5.2, 2.58], [5.33, 2.4], [5.33, 2.24], [5.42, 2.1], [5.5, 2.0], [5.42, 1.95], [5.43, 1.84], [5.4, 1.78], [5.4, 1.7], [5.32, 1.54], [5.12, 1.42], [4.85, 1.45], [4.8, 2.0], [4.95, 2.5],
  ]), 1);
  const faceFill = bunt ? { top: '#d58a5a', bottom: '#b8603c' } : stone;
  layers.push({
    shapes: [face], fill: faceFill,
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(90,50,15,.38)', light: 'rgba(255,245,210,.25)' });
      const ex = 5.2, ey = 2.2;
      fillPoly(c, poly(HP([[ex - 0.1, ey - 0.005], [ex - 0.03, ey + 0.045], [ex + 0.07, ey + 0.04], [ex + 0.12, ey - 0.01], [ex + 0.03, ey - 0.045], [ex - 0.05, ey - 0.035]]), 1), '#fff4dc');
      fillPoly(c, blobH(ex + 0.04, ey, 0.03, 0.032, 0, 10), '#2a1a10');
      curveH(c, [[ex - 0.23, ey + 0.015], [ex - 0.12, ey + 0.0], [ex - 0.03, ey + 0.045], [ex + 0.08, ey + 0.045], [ex + 0.14, ey - 0.01]], '#1c1410', 0.026, { alpha: 1 });
      curveH(c, [[ex - 0.08, ey + 0.11], [ex + 0.05, ey + 0.125], [ex + 0.15, ey + 0.1]], '#2a1a10', 0.032, { alpha: 0.75 });
      fillPoly(c, blobH(5.44, 1.99, 0.05, 0.034, 0.3, 10), 'rgba(80,40,15,.3)');
      curveH(c, [[5.2, 1.77], [5.32, 1.75], [5.4, 1.78]], 'rgba(60,30,10,.7)', 0.022, { alpha: 1 });
      curveH(c, [[5.26, 1.65], [5.34, 1.67]], 'rgba(60,30,10,.3)', 0.016, { alpha: 1 });
      fillPoly(c, blobH(5.1, 1.85, 0.12, 0.09, 0.3, 14), 'rgba(255,240,200,.22)');
      curveH(c, [[5.3, 2.02], [5.3, 1.9]], 'rgba(80,40,15,.25)', 0.015, { alpha: 1 });
    },
  });
  const nemes = poly(HP([
    [5.2, 2.6], [5.15, 2.84], [4.85, 2.98], [4.4, 2.88], [4.0, 2.55], [3.8, 2.05], [3.85, 1.6], [4.25, 1.4], [4.6, 1.34], [4.6, 1.0], [5.0, 0.93], [5.04, 1.45], [4.97, 1.9], [4.98, 2.28],
  ]), 1);
  const nemesFill = bunt ? { top: '#3a6fb8', bottom: '#2a5aa0' } : stone;
  layers.push({
    shapes: [nemes], fill: nemesFill,
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(90,50,15,.38)', light: 'rgba(255,245,210,.25)' });
      const yb = H([0, 0.92])[1], dy = 0.125 * K;
      for (let k = 0; k < 18; k++) {
        const y = yb + k * dy;
        const col = bunt ? (k % 2 ? 'rgba(240,200,80,.95)' : 'rgba(30,60,130,.0)') : (k % 2 ? 'rgba(90,50,15,.24)' : 'rgba(255,246,214,.28)');
        fillPoly(c, rect(bb.x0 - 0.1, y, bb.x1 + 0.1, y + dy * 0.5), col);
        if (!bunt) curve(c, [[bb.x0 - 0.1, y], [bb.x1 + 0.1, y]], 'rgba(90,50,15,.22)', 0.01, { alpha: 1 });
      }
      curveH(c, [[5.2, 2.6], [5.12, 2.82]], bunt ? '#f0cc6a' : 'rgba(255,246,214,.7)', 0.04, { alpha: 1 });
      fillPoly(c, blobH(5.2, 2.7, 0.045, 0.07, 0.2, 10), bunt ? '#e0b040' : 'rgba(255,240,200,.65)');
      curveH(c, [[4.62, 1.34], [4.62, 1.05]], 'rgba(60,30,10,.35)', 0.03, { alpha: 1 });
    },
  });
  const top = H([5.1, 2.98]);
  return spec('sphinx', 'Große Sphinx von Gizeh', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.72, 1] }, head: H([5.1, 2.1]), eye: H([5.2, 2.2]), mouth: H([5.38, 1.78]), paws: [6.0, 0.3] },
    { kind: 'building', lengthM: 73, heightM: 20 }, { w: opts.w ?? 6, floor: 0 });
}
