// Gruppe S1 – Gelände: wuestenduene (Dünenlagen), nil_wasser (Wasserstreifen), feld_getreide (Wachstumsstufen).
import {
  PAL, spec, lerp, clamp01, smooth, rect, duneLayers, sandSpeckle,
  blob, limb, poly, TAU, rngOf, variantOf, mix, shade, leaf, wavy, spline, volume,
  fillPoly, fillGrad, curve, strokes, centerline, along, strand, stalk, tip,
} from './_eg_land_kit.js';

// ------------------------------------------------------------------------------------------------
// wuestenduene 11 x 1,2 m: drei Reihen Dünen (hinten hell/dunstig, vorn kräftig). variant.seed (1|2) = zwei Anordnungen. opts.tone 'warm'|'rot'|'hell'
export function wuestenduene(opts = {}) {
  const seed = opts.seed ?? 1;
  const W = 11;
  const tone = opts.tone ?? 'warm';
  const x0 = -W / 2, x1 = W / 2;
  const far = duneLayers(x0, x1, { count: 6, amp: 0.36, base: 0.5, seed: seed * 10 + 1, tone: 'fern', lenK: 0.95, speck: false, ripples: false, edge: 1.2 });
  const mid = duneLayers(x0, x1, { count: 8, amp: 0.4, base: 0.24, seed: seed * 10 + 2, tone: tone === 'warm' ? 'hell' : tone, lenK: 0.85, gain: 0.5, edge: 1.0 });
  const near = duneLayers(x0, x1, { count: 11, amp: 0.3, base: 0.0, seed: seed * 10 + 3, tone, lenK: 0.8, edge: 0.8 });
  const parts = {
    body: { z: 0, layers: [...far.layers, ...mid.layers] },
    vorn: { z: 1, layers: near.layers },
  };
  return spec('wuestenduene', 'Wüstendüne', parts, { base: [0, 0], top: { rel: [0.5, 1] } },
    { kind: 'terrain', variants: 2, hint: 'variant.seed 1|2; opts.tone warm|rot|hell' }, { w: opts.w ?? W, floor: 0, centerX: true });
}

// ------------------------------------------------------------------------------------------------
// nil_wasser 11 m: Wasserstreifen, drei Lagen mit sanft welliger Oberkante, helle Wellenbögen und Glanzlichter.
// opts.tone 'hell'|'dunkel' (auch 'light'|'dark'), opts.h Höhe (Standard 0.9)
const WATER = {
  hell: { back: ['#3f9fa3', '#2a7f88'], mid: ['#52b6b2', '#34999a'], front: ['#73cfc2', '#46aaa7'], line: 'rgba(15,70,80,.5)', glint: 'rgba(255,255,255,.85)', arc: 'rgba(255,255,255,.6)', dim: 'rgba(10,60,80,.28)' },
  dunkel: { back: ['#265f6e', '#194354'], mid: ['#307581', '#1f5767'], front: ['#3f8e97', '#2b6d7c'], line: 'rgba(5,25,40,.6)', glint: 'rgba(210,240,245,.7)', arc: 'rgba(190,230,240,.4)', dim: 'rgba(0,20,40,.3)' },
};
export function nil_wasser(opts = {}) {
  const dark = opts.tone === 'dunkel' || opts.tone === 'dark' || opts.dunkel === true;
  const P = dark ? WATER.dunkel : WATER.hell;
  const seed = opts.seed ?? 1;
  const W = 11, x0 = -W / 2, x1 = W / 2;
  const tops = [0.84, 0.56, 0.3];
  const rows = [
    { y: tops[0], col: P.back, amp: 0.05, fr: 9, ph: 0.4 },
    { y: tops[1], col: P.mid, amp: 0.055, fr: 11, ph: 2.1 },
    { y: tops[2], col: P.front, amp: 0.06, fr: 8, ph: 4.0 },
  ];
  const layers = rows.map((r, i) => {
    const top = wavy(x0, x1, r.y, r.amp, r.fr, { n: 160, phase: r.ph + seed, seed: seed + i });
    // zweite, kleinere Welle überlagern -> weniger regelmäßig
    const top2 = top.map(([x, y], k) => [x, y + 0.02 * Math.sin(k * 0.33 + i + seed)]);
    return {
      shapes: [[[x0, -0.05]].concat(top2, [[x1, -0.05]])], fill: { top: r.col[0], bottom: r.col[1] }, stroke: P.line,
      deco(c, bb) {
        volume(c, bb, { dark: P.dim, light: 'rgba(220,255,250,.14)' });
        const rng = rngOf(seed * 7 + i, 33);
        // Wellenbögen: kleine „~“-Bögen in versetzten Reihen
        const rowsN = i === 2 ? 2 : 3;
        for (let q = 0; q < rowsN; q++) {
          const yy = r.y - 0.1 - q * 0.085;
          if (yy < 0.04) continue;
          let x = x0 + rng() * 0.6;
          while (x < x1) {
            const L = 0.28 + rng() * 0.4;
            const pts = [];
            for (let t = 0; t <= 1.001; t += 0.125) pts.push([x + L * t, yy + Math.sin(t * Math.PI * 2) * 0.014 + Math.sin(t * Math.PI) * 0.0]);
            curve(c, pts, P.arc, 0.017, { alpha: 1 });
            x += L + 0.5 + rng() * 0.9;
          }
        }
        // Wellenkamm: helle Kante unter der Oberkante
        curve(c, top2.map(([x, y]) => [x, y - 0.025]), P.arc, 0.024, { alpha: 1 });
        // Glanzlichter (Sonne): kurze helle Striche
        for (let k = 0; k < 7; k++) { const x = x0 + rng() * W, y = r.y - 0.14 - rng() * 0.18; if (y > 0.03) curve(c, [[x, y], [x + 0.1 + rng() * 0.18, y + 0.004]], P.glint, 0.018, { alpha: 1 }); }
      },
    };
  });
  const h = opts.h ?? 0.9;
  return spec('nil_wasser', 'Nil-Wasser', { body: { z: 0, layers } }, { base: [0, 0], top: { rel: [0.5, 1] }, surface: { rel: [0.5, 0.9] } },
    { kind: 'water', tone: dark ? 'dunkel' : 'hell', hint: 'opts.tone hell|dunkel; opts.h Höhe' }, { w: opts.w ?? W, floor: 0, centerX: true, baseY: true });
}

// ------------------------------------------------------------------------------------------------
// feld_getreide 5 m: Streifen Nilschlamm mit Getreide in Wachstumsstufen. opts.stage 0..1:
// 0 = kahle schwarze Erde mit Furchen, 0.2 = erste Keimlinge, 0.5 = grüne Halme, 0.8 = reifend, 1 = goldgelbe Ähren.
export function feld_getreide(opts = {}) {
  const stage = clamp01(opts.stage ?? 1);
  const seed = opts.seed ?? 1;
  const W = 5, x0 = -W / 2, x1 = W / 2;
  const rng = rngOf(seed + Math.round(stage * 10), 601);
  // Höhe und Reife
  const grow = smooth((stage - 0.08) / 0.72);        // 0 .. 1 (Halmhöhe)
  const ripe = smooth((stage - 0.55) / 0.4);          // 0 .. 1 (grün -> gold)
  const earK = smooth((stage - 0.42) / 0.4);          // Ähren sichtbar
  const Hmax = opts.h ?? 1.15;
  const layers = [];
  // --- Erde: dunkler Nilschlamm, Furchen (leicht gewellt), Schollen
  const soilTop = wavy(x0, x1, 0.26, 0.03, 7, { n: 80, seed: 3 });
  layers.push({
    shapes: [[[x0, -0.02]].concat(soilTop, [[x1, -0.02]])], fill: { top: '#5a4130', bottom: '#2e2118' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(0,0,0,.32)', light: 'rgba(255,230,190,.12)' });
      for (let k = 0; k < 4; k++) curve(c, wavy(x0 - 0.1, x1 + 0.1, 0.05 + k * 0.06, 0.012, 9 + k, { n: 60, phase: k * 1.7 }), k % 2 ? 'rgba(20,12,6,.5)' : 'rgba(150,110,75,.28)', 0.022, { alpha: 1 });
      const r = rngOf(seed + 5, 9);
      for (let k = 0; k < 70; k++) fillPoly(c, blob(x0 + r() * W, 0.03 + r() * 0.24, 0.025 + r() * 0.035, 0.018 + r() * 0.02, r() * 3, 7), r() < 0.5 ? 'rgba(160,120,85,.35)' : 'rgba(15,9,5,.45)');
      if (stage < 0.35) curve(c, soilTop.map(([x, y]) => [x, y - 0.02]), 'rgba(190,150,110,.25)', 0.025, { alpha: 1 });
    },
  });
  if (stage < 0.04) {
    return spec('feld_getreide', 'Getreidefeld', { body: { z: 0, layers } }, { base: [0, 0], top: { rel: [0.5, 1] } },
      { kind: 'plant', stage }, { w: opts.w ?? W, floor: 0, centerX: true });
  }
  // --- Halme in drei Tiefenreihen
  const hGreen = (t) => mix('#4f9a46', '#8cc652', t), hGold = (t) => mix('#d9a83c', '#f2d56e', t);
  const stalkCol = (t) => mix(hGreen(t), hGold(t), ripe);
  const rowsDef = [
    { n: 46, hk: 0.82, z: 0, depth: 0.0, w: 0.03 },
    { n: 50, hk: 0.92, z: 1, depth: 0.5, w: 0.032 },
    { n: 54, hk: 1.0, z: 2, depth: 1.0, w: 0.034 },
  ];
  rowsDef.forEach((rw, ri) => {
    const shapes = [], ears = [], veins = [];
    const rr = rngOf(seed * 13 + ri, 41);
    for (let k = 0; k < rw.n; k++) {
      const x = x0 + 0.1 + ((k + rr() * 0.8) / rw.n) * (W - 0.2);
      const hh = (0.06 + Hmax * grow * rw.hk * (0.86 + rr() * 0.28)) * (1 - 0.0);
      const lean = (rr() - 0.5) * 0.35 * (0.3 + grow) + (ripe > 0.6 ? 0.1 * (rr() - 0.4) * ripe : 0);
      const baseY = 0.2 + rw.depth * 0.04 + rr() * 0.04;
      const L = Math.max(0.05, hh);
      const st = stalk(x, baseY, Math.PI / 2 - lean, L, lean * 0.6 + (rr() - 0.5) * 0.15, rw.w * (0.8 + 0.2 * grow), rw.w * 0.45, { n: 8, p: 1.4 });
      shapes.push(st.shape);
      // zwei Blätter
      const nl = stage < 0.25 ? 2 : 3;
      for (let q = 0; q < nl; q++) {
        const s = stage < 0.25 ? 0.5 + q * 0.2 : 0.25 + q * 0.2 + rr() * 0.08;
        const [px, py, ang] = along(st.cl, Math.min(0.95, s));
        const side = (q + k) % 2 ? 1 : -1;
        const ll = Math.max(0.07, L * (0.42 - q * 0.05) * (0.8 + rr() * 0.3)) * (stage < 0.25 ? 1.1 : 1);
        shapes.push(leaf(px, py, ang + side * (0.55 + rr() * 0.35), ll, 0.045 + 0.02 * grow, { fat: 0.3, curve: -side * (0.12 + 0.25 * ripe), n: 6 }));
      }
      if (earK > 0.05) {
        const [tx, ty, ta] = along(st.cl, 1.0);
        const droop = 0.2 + ripe * 0.7;
        const el = 0.16 * (0.4 + 0.6 * earK) * (0.9 + rr() * 0.25);
        const ec = centerline(tx, ty - 0.01, ta + (lean >= 0 ? -droop : droop) * 0.3, el, (lean >= 0 ? -1 : 1) * droop * 0.7, { n: 6, p: 1.3 });
        ears.push(ec);
        // Ähre: Spindel + Körnerpaare
        shapes.push(strand(ec, 0.034 * (0.5 + 0.5 * earK), 0.016, { every: 1, per: 2 }));
        for (let g = 0; g < 4; g++) for (const sd of [-1, 1]) {
          const [gx, gy, ga] = along(ec, 0.12 + g * 0.22 + (sd < 0 ? 0.08 : 0));
          shapes.push(leaf(gx, gy, ga + sd * 0.55, el * 0.42, 0.028, { fat: 0.5, n: 5 }));
        }
        // Grannen (Spitzen) bei Reife
        if (ripe > 0.5) shapes.push(leaf(...along(ec, 1).slice(0, 2), along(ec, 1)[2], 0.1 * ripe, 0.008, { fat: 0.5, n: 4 }));
      }
    }
    const t = rw.depth;
    layers.push({
      shapes, fill: { top: stalkCol(0.3 + 0.6 * t), bottom: mix(stalkCol(0.1 + 0.4 * t), '#2a4a24', 0.35 * (1 - ripe) + 0.15) },
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(50,40,0,.32)', light: 'rgba(255,250,200,.30)' });
        const r2 = rngOf(ri + 70, 5);
        const ls = []; for (let k = 0; k < 40; k++) { const x = bb.x0 + r2() * bb.w, y = bb.y0 + r2() * bb.h; ls.push([x, y, x + (r2() - 0.5) * 0.03, y + 0.18]); }
        strokes(c, ls, ripe > 0.5 ? 'rgba(130,85,10,.35)' : 'rgba(25,70,20,.35)', 0.012, 1);
      },
    });
  });
  return spec('feld_getreide', 'Getreidefeld', { body: { z: 0, layers } }, { base: [0, 0], top: { rel: [0.5, 1] } },
    { kind: 'plant', stage, hint: 'opts.stage 0..1: kahl -> Keimlinge -> grün -> goldgelb' }, { w: opts.w ?? W, floor: 0, centerX: true });
}
