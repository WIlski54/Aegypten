// Gruppe S1 – Bauten und Felsen: stufenpyramide (Djoser), rampe, steinbruch_wand, felsental_tal.
import {
  PAL, spec, lerp, clamp01, smooth, rect, bar, courseEdges, masonry, sandSpeckle,
  blob, limb, poly, TAU, rngOf, variantOf, mix, shade, leaf, ribbon, wavy, clipBelow, clipAxis, volume,
  fillPoly, fillPolys, fillGrad, curve, strokes, groundShade,
} from './_eg_land_kit.js';

// ------------------------------------------------------------------------------------------------
// stufenpyramide 3,5 m: Djoser-Pyramide von Sakkara, sechs Stufen (Kalkstein), links hell / rechts Schatten.
export function stufenpyramide(opts = {}) {
  const NS = 6, H = 3.5;
  const hs = [0.7, 0.64, 0.58, 0.55, 0.52, 0.51];                     // Stufenhöhen (von unten)
  const sum = hs.reduce((a, b) => a + b, 0), k = H / sum;
  const w0 = 3.4, step = 0.56, inset = 0.2, shift = 0.12;
  const layers = [];
  let y = 0;
  const stepsGeo = [];
  for (let i = 0; i < NS; i++) {
    const wb = w0 - i * step, wt = wb - inset, yb = y, yt = y + hs[i] * k;
    stepsGeo.push({ wb, wt, yb, yt });
    y = yt;
  }
  stepsGeo.forEach((g, i) => {
    const { wb, wt, yb, yt } = g;
    // helle Standfläche (Absatz) der vorherigen Stufe zuerst: dünner Streifen oberhalb
    if (i > 0) {
      const p = stepsGeo[i - 1];
      layers.push({
        shapes: [[[-p.wt, p.yt - 0.02], [p.wt, p.yt - 0.02], [p.wt - 0.03, p.yt + 0.07], [-p.wt + 0.03, p.yt + 0.07]]], fill: { top: '#fff8e2', bottom: '#f0e2b8' },
        deco(c, bb) { fillPoly(c, rect(bb.x0 + (bb.x1 - bb.x0) * 0.55, bb.y0 - 1, bb.x1 + 1, bb.y1 + 1), 'rgba(120,80,35,.22)'); },
      });
    }
    const nC = i < 2 ? 3 : 2;
    const e = courseEdges(yb, yt - yb, nC, 0);
    const lit = [[-wb, yb], [wb * shift, yb], [wt * shift, yt], [-wt, yt]];
    const sh = [[wb * shift, yb], [wb, yb], [wt, yt], [wt * shift, yt]];
    const mk = (P, isLit, sd) => ({
      shapes: [P], fill: isLit ? { top: '#f8efd0', bottom: '#e8d6a6' } : { top: '#cdb184', bottom: '#b39468' },
      deco(c, bb) {
        masonry(c, bb, e, {
          tones: isLit ? ['#f8efd2', '#f1e4bf', '#fbf3da', '#ecdcb0'] : ['#cdb184', '#c2a375', '#d4b98d', '#b99a6b'], wMin: 0.5, wMax: 1.0, wScale: 0.9, seed: sd, speck: 1,
          joint: isLit ? 'rgba(110,75,35,.5)' : 'rgba(55,32,14,.55)', hi: isLit ? 'rgba(255,252,236,.6)' : 'rgba(255,235,190,.22)', lo: isLit ? 'rgba(120,80,36,.3)' : 'rgba(40,22,8,.34)', jw: 0.016, bevel: 0.14,
        });
        volume(c, bb, isLit ? { dark: 'rgba(120,80,36,.22)', light: 'rgba(255,252,235,.35)' } : { dark: 'rgba(40,22,8,.32)', light: 'rgba(255,225,170,.1)' });
        curve(c, [[bb.x0 - 1, yb + 0.005], [bb.x1 + 1, yb + 0.005]], isLit ? 'rgba(110,75,35,.6)' : 'rgba(40,22,8,.65)', 0.026, { alpha: 1 });
      },
    });
    layers.push(mk(lit, true, 100 + i * 5), mk(sh, false, 200 + i * 5));
  });
  const topG = stepsGeo[NS - 1];
  // flache Oberseite der obersten Stufe
  layers.push({
    shapes: [[[-topG.wt, topG.yt - 0.02], [topG.wt, topG.yt - 0.02], [topG.wt - 0.03, topG.yt + 0.07], [-topG.wt + 0.03, topG.yt + 0.07]]], fill: { top: '#fff8e2', bottom: '#f0e2b8' },
    deco(c, bb) { fillPoly(c, rect(bb.x0 + (bb.x1 - bb.x0) * 0.55, bb.y0 - 1, bb.x1 + 1, bb.y1 + 1), 'rgba(120,80,36,.22)'); },
  });
  return spec('stufenpyramide', 'Stufenpyramide des Djoser (Sakkara)', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, apex: [0, H] }, { kind: 'building', heightM: 62, steps: NS }, { h: opts.h ?? 3.5, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// rampe 6 m: Baurampe aus Lehmziegeln und Bruchstein (steigt nach rechts an), Holzbahn oben, Seitenpfähle mit Seil, Geröll am Fuß.
export function rampe(opts = {}) {
  const rng = rngOf(opts.seed ?? 1, 801);
  const L = 6, Hh = 2.1;
  const sx = -L / 2, ex = L / 2;
  const yAt = (x) => 0.18 + (Hh - 0.18) * ((x - sx) / L);
  const layers = [];
  // Körper: Keil
  const wedge = poly([[sx, 0], [sx, 0.18], [ex, Hh], [ex, 0]], 0);
  layers.push({
    shapes: [wedge], fill: { top: '#d9a46f', bottom: '#a8703f' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,30,10,.4)', light: 'rgba(255,230,190,.22)' });
      // Schichten parallel zur Böschung: Lehmziegel (warmbraun) und Kalkstein (hell), abwechselnd
      const slope = (Hh - 0.18) / L;
      for (let k = 0; k < 9; k++) {
        const off = 0.2 + k * 0.23;
        const stone = k % 3 === 0;
        const p = [[sx - 0.2, 0.18 - off - slope * 0.2], [ex + 0.2, Hh - off + slope * 0.2], [ex + 0.2, Hh - off + slope * 0.2 - 0.18], [sx - 0.2, 0.18 - off - slope * 0.2 - 0.18]];
        fillPoly(c, p, stone ? 'rgba(245,232,196,.55)' : (k % 2 ? 'rgba(130,80,40,.22)' : 'rgba(200,140,85,.18)'));
        curve(c, [p[0], p[1]], 'rgba(70,38,14,.4)', 0.02, { alpha: 1 });
        // Fugen (senkrecht zur Böschung, kurze Striche)
        const n = 12;
        for (let q = 0; q < n; q++) {
          const t = (q + rng() * 0.7) / n, x = lerp(sx, ex, t), yy = lerp(p[0][1], p[1][1], t);
          strokes(c, [[x, yy, x + 0.03, yy - 0.17]], 'rgba(70,38,14,.4)', 0.014, 1);
        }
      }
      sandSpeckle(c, bb, 9, 70, { dark: 'rgba(80,45,18,.32)' });
      // Rampenfuß beschatten
      groundShade(c, bb, 0.25, 'rgba(60,30,10,.35)');
    },
  });
  // Holzbahn oben (Querbalken auf der Böschung): Band entlang der Oberkante mit Querstreben
  const track = [[sx + 0.1, yAt(sx + 0.1) + 0.0, 0.09], [ex - 0.05, yAt(ex - 0.05) + 0.0, 0.09]];
  const tp = limb(track, { per: 2, caps: false });
  layers.push({
    shapes: [tp], fill: { top: '#9a6a3a', bottom: '#6e4a28' },
    deco(c, bb) {
      volume(c, bb);
      const slope = (Hh - 0.18) / L;
      for (let q = 0; q < 26; q++) { const t = (q + 0.5) / 26, x = lerp(sx + 0.1, ex - 0.05, t), yy = yAt(x); strokes(c, [[x, yy + 0.05, x + 0.012, yy - 0.05]], 'rgba(40,22,8,.6)', 0.015, 1); }
    },
  });
  // Seitenpfähle mit Seil
  const posts = [];
  const pxs = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  const ptop = [];
  for (const x of pxs) { const y0 = yAt(x), h = 0.55 + rng() * 0.08; posts.push(limb([[x, y0 - 0.15, 0.08], [x + 0.01, y0 + h * 0.6, 0.075], [x, y0 + h, 0.07]], { per: 3 })); ptop.push([x, yAt(x) + 0.5]); }
  layers.push({
    shapes: posts, fill: { top: '#a8784a', bottom: '#6a4526' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,20,5,.4)', light: 'rgba(255,225,180,.3)' });
      const r = rngOf(6, 5); for (const [x, y] of ptop) strokes(c, [[x - 0.03, y - 0.5, x - 0.03, y + 0.05]], 'rgba(255,230,190,.35)', 0.012, 1);
    },
  });
  // Seil zwischen den Pfosten (hängt durch)
  const ropeShapes = [];
  for (let i = 0; i < ptop.length - 1; i++) {
    const a = ptop[i], b = ptop[i + 1], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.12];
    ropeShapes.push(limb([[a[0], a[1] - 0.02, 0.035], [mid[0], mid[1], 0.035], [b[0], b[1] - 0.02, 0.035]], { per: 6 }));
  }
  layers.push({ shapes: ropeShapes, fill: { top: '#e8d09a', bottom: '#b89a5c' }, deco(c, bb) { for (let q = 0; q < 40; q++) { const x = bb.x0 + q * bb.w / 40; strokes(c, [[x, bb.y0, x + 0.03, bb.y1]], 'rgba(120,85,40,.55)', 0.008, 1); } } });
  // Geröll / Steinblöcke am Fuß und eine kleine Sandwehe
  const rub = [];
  for (const [x, r] of [[-3.1, 0.2], [-2.8, 0.14], [3.2, 0.26], [2.9, 0.17]]) rub.push(blob(x, r * 0.7, r * 1.2, r * 0.75, rng(), 10));
  layers.push({ shapes: rub, fill: { top: '#f2e6c4', bottom: '#cdb888' }, deco(c, bb) { volume(c, bb, { dark: 'rgba(110,75,35,.4)', light: 'rgba(255,252,236,.4)' }); } });
  return spec('rampe', 'Baurampe', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [1, 1] }, hoch: [ex, Hh], tief: [sx, 0.2] }, { kind: 'building', hint: 'steigt nach rechts an; Seitenpfähle mit Seil' }, { w: opts.w ?? 6, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// steinbruch_wand 6 m: Kalksteinwand mit Abbaustufen, ausgeschlagenen Quader-Nischen, Meißelrillen, Keillöchern und losen Blöcken.
export function steinbruch_wand(opts = {}) {
  const rng = rngOf(opts.seed ?? 1, 811);
  const j = (k = 0.05) => (rng() - 0.5) * k;
  const prof = [[-3, 0], [-3, 2.6], [-2.2, 2.65], [-2.15, 2.2], [-1.05, 2.25], [-1.0, 2.85], [0.15, 2.9], [0.2, 2.25], [1.35, 2.3], [1.4, 1.75], [2.55, 1.8], [2.6, 1.2], [3, 1.22], [3, 0]];
  const wall = poly(prof.map(([x, y], i) => [x + (i > 1 && i < prof.length - 2 ? j(0.06) : 0), y + (i > 1 ? j(0.05) : 0)]), 0);
  const layers = [];
  const recess = [   // [x, y, w, h] ausgebrochene Quader
    [-2.7, 0.35, 1.0, 0.7], [-1.45, 1.1, 0.85, 0.55], [-0.6, 0.3, 1.2, 0.8], [0.85, 1.25, 0.9, 0.6], [1.7, 0.4, 0.85, 0.65], [-0.2, 1.7, 0.8, 0.5], [-2.2, 1.7, 0.7, 0.45],
  ];
  layers.push({
    shapes: [wall], fill: { top: '#ecd9a4', bottom: '#c9a46a' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(90,55,20,.38)', light: 'rgba(255,248,215,.25)' });
      // Gesteinsbänder
      for (let k = 0; k < 11; k++) curve(c, wavy(bb.x0 - 0.1, bb.x1 + 0.1, 0.18 + k * 0.28, 0.025, 4 + (k % 3), { n: 60, phase: k * 1.4 }), k % 2 ? 'rgba(120,80,35,.3)' : 'rgba(255,248,215,.35)', 0.02 + (k % 3) * 0.01, { alpha: 1 });
      // Kanten der Abbaustufen: helle Oberkante, dunkler Schatten darunter
      for (let i = 1; i < prof.length - 2; i++) {
        const [x0, y0] = prof[i], [x1, y1] = prof[i + 1];
        if (Math.abs(y1 - y0) < 0.1) curve(c, [[x0, y0 - 0.02], [x1, y1 - 0.02]], 'rgba(255,250,225,.75)', 0.04, { alpha: 1 });
      }
      // Ausgebrochene Quader: Nischen mit Innenschatten (Licht links oben)
      for (const [x, y, w, h] of recess) {
        fillPoly(c, rect(x, y, x + w, y + h), '#d2ae74');
        fillPoly(c, rect(x, y + h - 0.07, x + w, y + h), 'rgba(60,35,12,.5)');    // Schatten unter der oberen Kante (innen oben)
        fillPoly(c, rect(x, y, x + 0.06, y + h), 'rgba(60,35,12,.38)');           // linke Innenwand im Schatten
        fillPoly(c, rect(x + w - 0.04, y, x + w, y + h - 0.07), 'rgba(255,245,215,.55)'); // rechte Kante hell
        fillPoly(c, rect(x, y, x + w, y + 0.04), 'rgba(255,245,215,.65)');       // Vorderkante des Absatzes unten
        // Meißelspuren am Boden der Nische (schräge Striche)
        for (let q = 0; q < 9; q++) { const xx = x + 0.15 + rng() * (w - 0.3), yy = y + 0.1 + rng() * (h - 0.35); strokes(c, [[xx, yy, xx + 0.07, yy + 0.09]], 'rgba(60,35,12,.4)', 0.012, 1); }
      }
      // Meißelrillen (senkrechte Gräben um einen noch anhaftenden Block) und Keillöcher-Reihe
      for (const [x, y0, y1] of [[1.0, 0.1, 1.15], [1.35, 0.1, 1.15], [-2.0, 0.1, 1.55], [-1.7, 0.1, 1.55]]) {
        fillPoly(c, rect(x - 0.03, y0, x + 0.03, y1), 'rgba(50,28,10,.65)');
        fillPoly(c, rect(x + 0.03, y0, x + 0.05, y1), 'rgba(255,245,215,.5)');
      }
      for (const [x0, x1, y] of [[-2.0, -1.7, 1.55], [1.0, 1.35, 1.17], [-1.0, -0.2, 1.62]]) for (let q = 0; q <= 5; q++) { const x = lerp(x0, x1, q / 5); fillPoly(c, blob(x, y, 0.028, 0.04, 0, 8), '#3a2412'); fillPoly(c, blob(x - 0.008, y + 0.012, 0.012, 0.018, 0, 6), 'rgba(255,240,200,.6)'); }
      sandSpeckle(c, bb, 11, 100, { rmax: 0.018 });
      groundShade(c, bb, 0.3, 'rgba(70,40,15,.35)');
    },
  });
  // lose Blöcke und Schutt am Fuß (Quader in Kalksteinfarbe)
  const blocks = [[1.6, 0.0, 0.7, 0.4], [2.3, 0.0, 0.5, 0.3], [-2.9, 0.0, 0.55, 0.32]];
  blocks.forEach(([x, y, w, h], i) => {
    layers.push({
      shapes: [poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 0)], fill: { top: '#f6ecca', bottom: '#d9c690' },
      deco(c, bb) {
        masonry(c, bb, [y, y + h], { tones: ['#f6ecca'], wMin: 5, wMax: 6, seed: i, joint: 'rgba(0,0,0,0)', hi: 'rgba(255,252,236,.6)', lo: 'rgba(120,80,36,.25)', bevel: 0.14 });
        fillPoly(c, rect(x + w * 0.62, y, x + w + 0.1, y + h + 0.1), 'rgba(110,75,35,.28)');   // Schattenseite
      },
    });
  });
  const rubble = [blob(0.2, 0.08, 0.28, 0.1, 0, 12), blob(0.65, 0.05, 0.16, 0.06, 0, 10), blob(-1.9, 0.07, 0.22, 0.08, 0, 12)];
  layers.push({ shapes: rubble, fill: { top: '#e7d6a0', bottom: '#b99a64' }, deco(c, bb) { volume(c, bb); sandSpeckle(c, bb, 3, 14); } });
  return spec('steinbruch_wand', 'Steinbruchwand', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, nische: [-2.2, 0.7], keilloecher: [-1.85, 1.55] }, { kind: 'terrain', hint: 'Kalkstein, Abbaustufen, Nischen, Keillöcher' }, { w: opts.w ?? 6, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// felsental_tal 11 m: Tal der Könige. Parts: gipfel (pyramidenförmiger Berg, hinten, dunstig) und body (Felswände mit Grabeingängen, Talsohle).
export function felsental_tal(opts = {}) {
  const rng = rngOf(opts.seed ?? 1, 821);
  const L = [[-5.5, 0], [-5.5, 3.3], [-4.7, 3.35], [-4.65, 3.0], [-3.9, 3.05], [-3.85, 3.5], [-3.2, 3.55], [-3.15, 2.8], [-2.6, 2.85], [-2.55, 2.2], [-2.0, 2.25], [-1.95, 1.5], [-1.4, 1.55], [-1.35, 0.8], [-0.8, 0.85], [-0.75, 0.3], [-0.3, 0.3]];
  const R = [[0.3, 0.3], [0.75, 0.3], [0.8, 0.85], [1.35, 0.9], [1.4, 1.5], [1.95, 1.55], [2.0, 2.2], [2.6, 2.25], [2.65, 2.9], [3.3, 2.95], [3.35, 3.45], [4.0, 3.5], [4.05, 3.0], [4.7, 3.05], [4.75, 3.4], [5.5, 3.4], [5.5, 0]];
  const jit = (pts) => pts.map(([x, y], i) => [x + (rng() - 0.5) * 0.06, y + (i > 0 && i < pts.length - 1 && y > 0.35 ? (rng() - 0.5) * 0.06 : 0)]);
  const outline = poly(jit(L).concat(jit(R)), 0);
  const bandCols = ['#e0b070', '#c98d4e', '#e8c58a', '#b97a42', '#d9a362'];
  // --- Gipfel (hinten)
  const peak = poly([[-3.3, 0], [-2.0, 1.6], [-1.85, 1.75], [-0.9, 3.45], [-0.75, 3.6], [0.1, 5.0], [0.7, 4.0], [0.85, 3.9], [1.6, 2.5], [1.75, 2.45], [3.4, 0]], 0);
  const gipfel = {
    z: 0, layers: [{
      shapes: [peak], fill: { top: '#ead2a2', bottom: '#d9b57c' },
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(100,60,30,.2)', light: 'rgba(255,248,225,.25)' });
        for (let k = 0; k < 14; k++) curve(c, wavy(bb.x0 - 0.1, bb.x1 + 0.1, 0.4 + k * 0.34, 0.03, 4 + (k % 3), { n: 50, phase: k * 2 }), 'rgba(140,95,50,.25)', 0.02, { alpha: 1 });
        // Schattenseite rechts der Gratlinie (Licht von links)
        fillPoly(c, [[0.1, 5.1], [0.5, 4.3], [1.0, 3.3], [1.7, 2.4], [2.3, 1.5], [3.2, -0.1], [0.5, -0.1], [0.3, 2.6]], 'rgba(120,75,40,.3)');
        fillPoly(c, [[-3.1, -0.1], [-2.2, 1.3], [-1.6, 2.1], [-0.9, 3.5], [-0.3, 4.4], [0.0, 4.9], [-0.1, 2.8], [-1.0, 0.6]], 'rgba(255,248,225,.14)');
        curve(c, [[0.1, 5.0], [0.3, 2.6], [0.5, 0.3]], 'rgba(120,75,40,.35)', 0.03, { alpha: 1 });
      },
    }],
  };
  // --- Felswände mit Schichtbändern, Schattenseiten, Grabeingängen
  const doors = [[-4.3, 1.55], [-3.4, 1.1], [-2.4, 0.75], [2.9, 1.3], [3.9, 1.85], [4.7, 1.45], [1.7, 0.62]];
  const layers = [{
    shapes: [outline], fill: { top: '#d9a864', bottom: '#b57a40' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(70,35,15,.4)', light: 'rgba(255,235,190,.22)' });
      for (let k = 0; k < 12; k++) {
        const y = 0.3 + k * 0.32, col = bandCols[k % bandCols.length];
        fillPoly(c, [].concat(wavy(bb.x0 - 0.2, bb.x1 + 0.2, y + 0.3, 0.03, 5 + (k % 4), { n: 80, phase: k * 1.9, seed: k }), wavy(bb.x1 + 0.2, bb.x0 - 0.2, y, 0.03, 5 + ((k + 1) % 4), { n: 80, phase: (k - 1) * 1.9, seed: k - 1 })), col);
        curve(c, wavy(bb.x0 - 0.2, bb.x1 + 0.2, y + 0.3, 0.03, 5 + (k % 4), { n: 80, phase: k * 1.9, seed: k }), 'rgba(80,40,15,.45)', 0.02, { alpha: 1 });
        curve(c, wavy(bb.x0 - 0.2, bb.x1 + 0.2, y + 0.3, 0.03, 5 + (k % 4), { n: 80, phase: k * 1.9, seed: k }).map(([x, yy]) => [x, yy + 0.03]), 'rgba(255,235,190,.3)', 0.014, { alpha: 1 });
      }
      // Verwitterungsrillen
      const ls = []; for (let k = 0; k < 130; k++) { const x = bb.x0 + rng() * bb.w, y = 0.5 + rng() * 3, l = 0.2 + rng() * 0.6; ls.push([x, y, x + (rng() - 0.5) * 0.04, y - l]); }
      strokes(c, ls, 'rgba(70,32,12,.35)', 0.03, 1);
      strokes(c, ls.map(([a, b, d, e]) => [a + 0.04, b, d + 0.04, e]), 'rgba(255,235,190,.2)', 0.018, 1);
      // Schattenverlauf: linke Wand beschienen, rechte Wand dunkler
      fillGrad(c, rect(bb.x0 - 1, bb.y0 - 1, bb.x1 + 1, bb.y1 + 1), bb.x0, 0, bb.x1, 0, [[0, 'rgba(255,235,190,.2)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(60,25,15,.3)']]);
      // Talsohle (Wadi): heller Sand mit Geröll
      fillPoly(c, [].concat(wavy(bb.x0 - 0.2, bb.x1 + 0.2, 0.2, 0.04, 8, { n: 90, phase: 2 }), [[bb.x1 + 0.2, -0.1], [bb.x0 - 0.2, -0.1]]), '#eed6a0');
      curve(c, wavy(bb.x0 - 0.2, bb.x1 + 0.2, 0.2, 0.04, 8, { n: 90, phase: 2 }), 'rgba(255,250,225,.7)', 0.03, { alpha: 1 });
      sandSpeckle(c, bb, 6, 90, { rmax: 0.02 });
      // Grabeingänge: Rahmen mit dunkler Öffnung, Giebel/Sturz, Treppchen
      for (const [dx, dy] of doors) {
        const w = 0.38, h = 0.54;
        fillPoly(c, rect(dx - w / 2 - 0.05, dy - 0.03, dx + w / 2 + 0.05, dy + h + 0.07), '#f2dfae');          // heller Rahmen
        fillPoly(c, rect(dx - w / 2, dy, dx + w / 2, dy + h), '#2a1a12');
        fillPoly(c, rect(dx - w / 2, dy, dx - w / 2 + 0.07, dy + h), 'rgba(0,0,0,.45)');
        fillPoly(c, rect(dx - w / 2 - 0.08, dy + h + 0.05, dx + w / 2 + 0.08, dy + h + 0.1), '#e0b040');             // Goldschimmer/Sturz
        // Rampe/Stufen davor
        fillPoly(c, [[dx - w / 2 - 0.05, dy - 0.03], [dx + w / 2 + 0.05, dy - 0.03], [dx + w / 2 + 0.3, dy - 0.28], [dx - w / 2 - 0.3, dy - 0.28]], 'rgba(255,240,200,.75)');
      }
    },
  }];
  return spec('felsental_tal', 'Tal der Könige', { gipfel, body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, gipfel: [0.1, 5.0], eingang1: doors[0], eingang2: doors[3], tal: [0, 0.3] },
    { kind: 'terrain', hint: 'Part gipfel (hinten, Al-Qurn), Part body (Felswände mit 7 Grabeingängen)' }, { w: opts.w ?? 11, floor: 0 });
}
