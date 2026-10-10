// Gruppe S1 – Pflanzen des Niltals: papyrus, lotus, dattelpalme, sykomore, oase.
// Papyrus-Grün #5b9a4b, Nilgrün #3f8f5a, Licht von links oben, Papierschnitt mit vielen kleinen Teilen (Doldenfäden, Fiedern).
import {
  PAL, spec, lerp, clamp01, smooth, rect, sandSpeckle, duneLayers,
  blob, limb, poly, TAU, rngOf, variantOf, mix, shade, leaf, wavy, spline, volume, cluster, beads, profile, frond,
  fillPoly, fillPolys, fillGrad, curve, strokes, centerline, along, strand, stalk,
} from './_eg_land_kit.js';

// ------------------------------------------------------------------------------------------------
// papyrus 2,5 m: Büschel dreikantiger Halme mit Blattscheiden-Ringen, oben je eine Dolde aus herabhängenden Fäden. variant.seed 1..3
export function papyrus(opts = {}) {
  const seed = opts.seed ?? 1, v = variantOf(opts, 3);
  const rng = rngOf(seed, 701);
  const defs = [   // [x am Boden, Winkel°, Höhe, Biegung]
    [[-0.34, 104, 2.0, 0.14], [-0.14, 96, 2.35, 0.08], [0.06, 88, 2.5, -0.05], [0.26, 80, 2.2, -0.12], [0.46, 72, 1.75, -0.16], [-0.5, 112, 1.5, 0.18], [0.12, 92, 1.4, 0.02]],
    [[-0.42, 108, 2.1, 0.16], [-0.2, 98, 2.45, 0.1], [0.0, 90, 2.3, 0.0], [0.2, 82, 2.5, -0.1], [0.42, 74, 2.0, -0.14], [0.6, 68, 1.45, -0.2], [-0.05, 94, 1.6, 0.04]],
    [[-0.3, 100, 1.9, 0.12], [-0.1, 94, 2.4, 0.06], [0.1, 86, 2.2, -0.06], [0.3, 78, 2.45, -0.12], [-0.5, 112, 1.6, 0.2], [0.5, 70, 1.6, -0.18]],
  ][v];
  const layers = [];
  const stems = defs.map(([x, deg, H, bend]) => ({ x, st: stalk(x, 0.0, deg * Math.PI / 180, H, bend * 1.6, 0.075, 0.05, { n: 16, p: 1.3 }), H, depth: rng() }));
  stems.sort((a, b) => a.depth - b.depth);
  // Basisblätter (kurze, breite Scheiden/Blätter am Fuß)
  const baseLeaves = [];
  for (let k = 0; k < 9; k++) { const side = k % 2 ? 1 : -1; baseLeaves.push(leaf(-0.45 + k * 0.11, 0, Math.PI / 2 - side * (0.2 + (k % 4) * 0.13), 0.55 + (k % 3) * 0.14, 0.09, { fat: 0.3, curve: side * 0.3, baseW: 0.5, n: 8 })); }
  layers.push({ shapes: baseLeaves, fill: { top: '#7fb25a', bottom: '#3f7a3e' }, deco(c, bb) { volume(c, bb, { dark: 'rgba(15,50,15,.4)', light: 'rgba(240,255,170,.25)' }); } });
  const umbelAt = (st, H) => {
    const [tx, ty, ta] = along(st.cl, 1.0);
    return [tx, ty, ta];
  };
  const mkStemLayer = (s, i) => {
    const [tx, ty] = umbelAt(s.st, s.H);
    return {
      shapes: [s.st.shape], fill: { top: mix('#6fae52', '#8fc563', 0.4), bottom: '#3f7e3f' },
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(15,50,15,.38)', light: 'rgba(240,255,170,.3)' });
        // Scheiden-Ringe (dunkle Querstriche) und helle Kante links (Licht)
        const cl = s.st.cl;
        for (let k = 3; k < cl.length - 2; k += 3) { const [px, py, a] = cl[k]; const nx = -Math.sin(a), ny = Math.cos(a); strokes(c, [[px + nx * 0.04, py + ny * 0.04, px - nx * 0.04, py - ny * 0.04]], 'rgba(20,70,25,.5)', 0.012, 1); }
        curve(c, cl.map(([x, y, a]) => [x - 0.014 * Math.cos(a - Math.PI / 2 + 1.57), y]), 'rgba(235,250,170,.55)', 0.013, { alpha: 1 });
      },
    };
  };
  const mkUmbel = (s, k) => {
    const [tx, ty, ta] = umbelAt(s.st, s.H);
    const fils = [];
    const N = 30, R = rngOf(seed * 11 + k, 8);
    for (let q = 0; q < N; q++) {
      const t = q / (N - 1);
      const ang = lerp(-0.25, Math.PI + 0.25, t) + (R() - 0.5) * 0.14;      // von rechts-unten über oben nach links-unten
      const L = 0.46 + 0.16 * Math.sin(t * Math.PI) + R() * 0.1;
      const dir = ang > Math.PI / 2 ? 1 : -1;                                 // links: kippt nach links, rechts: nach rechts
      const cl = centerline(tx, ty, Math.min(Math.PI - 0.05, Math.max(0.05, ang)), L, dir * (1.4 + R() * 0.5), { n: 9, p: 1.4 });
      fils.push(strand(cl, 0.024, 0.006, { every: 2, per: 3 }));
    }
    fils.push(blob(tx, ty, 0.05, 0.045, 0, 10));
    return {
      shapes: fils, fill: { top: '#b9d56a', bottom: '#6aa24a' },
      deco(c, bb) { volume(c, bb, { dark: 'rgba(20,60,15,.3)', light: 'rgba(255,255,200,.35)' }); fillPoly(c, blob(tx, ty, 0.045, 0.04, 0, 10), 'rgba(60,100,30,.5)'); },
    };
  };
  const order = stems;
  order.forEach((s, i) => { layers.push(mkStemLayer(s, i)); layers.push(mkUmbel(s, i)); });
  return spec('papyrus', 'Papyrus', { body: { z: 1, layers } }, { base: [0, 0], top: { rel: [0.5, 1] }, dolde: { rel: [0.5, 0.97] } },
    { kind: 'plant', variant: v + 1, variants: 3 }, { h: opts.h ?? 2.5, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// lotus 0,6 m: schwimmende Blätter (flache Scheiben mit Kerbe, Wasserlinie y=0), Blüten weiß/blau auf Stielen, eine Knospe.
// opts.farbe: 'mix' (Standard) | 'weiss' | 'blau'
export function lotus(opts = {}) {
  const farbe = opts.farbe ?? 'mix';
  const rng = rngOf(opts.seed ?? 1, 711);
  const layers = [];
  // Stiele (grün, dünn) zuerst
  const blooms = [[-0.34, 0.52, 'weiss', 1.0, -0.1], [0.12, 0.62, 'blau', 1.1, 0.06], [0.5, 0.44, 'weiss', 0.82, 0.14]].map(([x, y, col, s, tilt]) => ({ x, y, col: farbe === 'mix' ? col : farbe, s, tilt }));
  const bud = { x: -0.06, y: 0.34, tilt: -0.1 };
  const stemShapes = blooms.map((b) => limb([[b.x * 0.6, 0.0, 0.03], [b.x * 0.9, b.y * 0.5, 0.026], [b.x, b.y - 0.02, 0.024]], { per: 6 }));
  stemShapes.push(limb([[bud.x * 0.4, 0, 0.026], [bud.x, bud.y * 0.6, 0.022], [bud.x, bud.y - 0.02, 0.02]], { per: 6 }));
  layers.push({ shapes: stemShapes, fill: { top: '#7bb458', bottom: '#3f7e3f' }, deco(c, bb) { volume(c, bb); } });
  // Schwimmblätter: flache Ellipsen (leicht von oben gesehen) mit Einschnitt
  const pads = [[-0.55, 0.05, 0.2, 0.062], [-0.08, 0.055, 0.22, 0.07], [0.36, 0.05, 0.19, 0.06], [0.72, 0.042, 0.13, 0.045], [-0.86, 0.04, 0.12, 0.04]];
  const padLayer = (list, top, bot) => ({
    shapes: list.map(([x, y, rx, ry]) => blob(x, y, rx, ry, 0, 30)), fill: { top, bottom: bot },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(10,50,30,.35)', light: 'rgba(235,255,190,.4)' });
      for (const [x, y, rx, ry] of list) {
        curve(c, [[x - rx * 0.9, y], [x - rx * 0.2, y + ry * 0.45], [x + rx * 0.5, y + ry * 0.2], [x + rx * 0.95, y]], 'rgba(235,255,200,.55)', 0.012, { alpha: 1 });
        fillPoly(c, [[x, y], [x + rx * 1.0, y - ry * 0.1], [x + rx * 1.0, y + ry * 0.2]], 'rgba(60,110,50,.0)');
        strokes(c, [[x - rx * 0.1, y, x + rx * 0.7, y + ry * 0.35], [x - rx * 0.1, y, x - rx * 0.7, y + ry * 0.3]], 'rgba(20,70,40,.5)', 0.01, 1);
      }
    },
  });
  layers.push(padLayer(pads.slice(0, 3), '#6fb064', '#2f7a50'));
  layers.push(padLayer(pads.slice(3), '#7bba68', '#3a8656'));
  // Blüten
  const bloom = (b) => {
    const petals = [];
    const N = 9;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1), a = Math.PI / 2 + b.tilt + (t - 0.5) * 2.1;
      const L = (0.2 + 0.07 * (1 - Math.abs(t - 0.5) * 2)) * b.s;
      petals.push({ k, t, a, L, p: leaf(b.x, b.y, a, L, 0.1 * b.s, { fat: 0.5, curve: (t - 0.5) * 0.25, n: 7 }) });
    }
    petals.sort((p, q) => Math.abs(q.t - 0.5) - Math.abs(p.t - 0.5));   // außen zuerst, Mitte zuletzt
    const white = b.col === 'weiss';
    return {
      shapes: petals.map((p) => p.p), fill: white ? { top: '#fffaf0', bottom: '#f2dce6' } : { top: '#8fbdf0', bottom: '#3f72c4' },
      deco(c) {
        volume(c, { x0: b.x - 0.3, x1: b.x + 0.3, y0: b.y, y1: b.y + 0.3, w: 0.6, h: 0.3 }, { dark: white ? 'rgba(160,80,110,.25)' : 'rgba(10,30,100,.3)', light: 'rgba(255,255,255,.2)' });
        for (const p of petals) strokes(c, [[b.x, b.y, b.x + Math.cos(p.a) * p.L * 0.85, b.y + Math.sin(p.a) * p.L * 0.85]], white ? 'rgba(200,120,150,.5)' : 'rgba(240,248,255,.6)', 0.008, 1);
        fillPoly(c, blob(b.x, b.y + 0.045 * b.s, 0.045 * b.s, 0.05 * b.s, 0, 12), '#f2c24a');            // gelbe Mitte
        fillPoly(c, blob(b.x, b.y + 0.045 * b.s, 0.022 * b.s, 0.026 * b.s, 0, 10), '#fff0a0');
      },
    };
  };
  blooms.forEach((b) => layers.push(bloom(b)));
  // Knospe
  layers.push({
    shapes: [leaf(bud.x, bud.y, Math.PI / 2 + bud.tilt, 0.22, 0.11, { fat: 0.45, n: 8 })], fill: { top: '#f7efe4', bottom: '#e7a6bc' },
    deco(c) { strokes(c, [[bud.x, bud.y, bud.x - 0.005, bud.y + 0.17]], 'rgba(190,100,130,.5)', 0.01, 1); },
  });
  return spec('lotus', 'Lotos', { body: { z: 1, layers } }, { base: [0, 0], top: { rel: [0.5, 1] }, bluete: [0.12, 0.62] },
    { kind: 'plant', hint: 'opts.farbe mix|weiss|blau; Wasserlinie bei y=0' }, { h: opts.h ?? 0.6, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// Dattelpalme als Baukasten (für dattelpalme und oase). Schreibt Layer in `layers`; Koordinaten skaliert um s, Ursprung (ox,oy).
// o: { ox, oy, s, flip, seed, lean, fruit(0..1 Reife), dates(bool) }
export function datePalmLayers(layers, o = {}) {
  const { ox = 0, oy = 0, s = 1, flip = false, seed = 1, lean = 0.25, fruit = 1, dates = true } = o;
  const rng = rngOf(seed, 721);
  const fx = flip ? -1 : 1;
  const T = ([x, y]) => [ox + x * fx * s, oy + y * s];
  // Stamm: kräftig, nach oben schlanker, leicht gebogen
  const tkL = [[0, 0, 0.62], [0.03 * lean, 0.5, 0.5], [0.12 * lean * 4, 1.6, 0.44], [0.22 * lean * 4, 2.8, 0.42], [0.28 * lean * 4, 3.7, 0.4], [0.3 * lean * 4, 4.1, 0.38]];
  const tk = tkL.map(([x, y, w]) => [...T([x, y]), w * s]);
  const prof = profile(tk);
  const top = T([tkL[5][0], tkL[5][1]]);
  layers.push({
    shapes: [limb(tk, { per: 10 })], fill: { stops: [[0, '#8a6a48'], [0.5, '#b08d62'], [1, '#9a7a52']], dir: 'v' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,22,8,.35)', light: 'rgba(255,235,190,.2)' });
      // Narbenmuster der alten Blattansätze: Schuppen-Reihen (Chevrons)
      const r = rngOf(seed + 4, 3);
      for (let y = oy + 0.25 * s; y < top[1] - 0.15 * s; y += 0.17 * s) {
        const p = prof(y), hw = (p.w / 2) * 0.95;
        curve(c, [[p.x - hw, y + 0.07 * s], [p.x - hw * 0.3, y - 0.01 * s], [p.x, y - 0.045 * s], [p.x + hw * 0.3, y - 0.01 * s], [p.x + hw, y + 0.07 * s]], 'rgba(60,35,15,.6)', 0.028 * s, { alpha: 1 });
        curve(c, [[p.x - hw, y + 0.1 * s], [p.x, y - 0.015 * s], [p.x + hw, y + 0.1 * s]], 'rgba(255,230,180,.28)', 0.016 * s, { alpha: 1 });
      }
      for (let y = oy + 0.2 * s; y < top[1]; y += 0.45 * s) { const p = prof(y); strokes(c, [[p.x - p.w * 0.3, y, p.x - p.w * 0.3, y + 0.4 * s]], '#e6ccA0', 0.04 * s, 0.3); }
    },
  });
  // Krone: unterste Wedel hängen, mittlere bogig, oberste aufrecht
  const defs = [   // [Winkel°, Länge, bend, Tiefe]
    [182, 1.8, 1.9, 0.0], [-2, 1.8, -1.9, 0.0], [165, 2.1, 1.6, 0.15], [15, 2.1, -1.6, 0.15], [145, 2.2, 1.3, 0.35], [35, 2.2, -1.3, 0.35],
    [122, 2.05, 1.0, 0.55], [58, 2.05, -1.0, 0.55], [105, 1.7, 0.6, 0.75], [76, 1.7, -0.6, 0.75], [92, 1.3, 0.15, 0.95],
  ];
  const cr = [top[0], top[1] - 0.05 * s];
  defs.sort((a, b) => a[3] - b[3]).forEach(([deg, L, bend, d]) => {
    const dd = flip ? 180 - deg : deg, bb = flip ? -bend : bend;
    const f = frond(cr[0], cr[1], dd * Math.PI / 180, L * s, {
      bend: bb, p: 1.5, pairs: 15, leafL: L * s * 0.26, leafW: L * s * 0.045, spread: 0.72, start: 0.1, end: 0.97, shrink: 0.5, curve: 0.06, fat: 0.4, droop: 0.55, rachisW: 0.07 * s, rng, sizeJit: 0.1,
    });
    const topC = mix('#5c9a4c', '#a9d060', d), bot = mix('#2d6a40', '#5aa04a', d);
    layers.push({
      shapes: f.all, fill: { top: topC, bottom: bot },
      deco(c, bbx) {
        volume(c, bbx, { dark: 'rgba(8,40,20,.38)', light: 'rgba(245,255,170,.28)' });
        strokes(c, f.veins, shade(bot, -0.3), 0.012 * s, 0.4);
        curve(c, f.cl.map((p) => [p[0], p[1]]), shade(bot, -0.45), 0.035 * s, { alpha: 0.85 });
      },
    });
  });
  if (dates) {
    // Fruchtstände: zwei dichte Büschel hängen unter der Krone
    const col = (t) => mix(mix('#c9d04a', '#f0a030', smooth(fruit * 1.6)), mix('#e08a2a', '#9a3a1a', clamp01(fruit * 1.3 - 0.3)), clamp01(fruit * 1.2 - 0.2));
    for (const [dx, len, sd] of [[-0.2, 1.05, 0], [0.24, 0.85, 1]]) {
      const x0 = cr[0] + dx * s * fx, y0 = cr[1] - 0.08 * s;
      const stalkS = [limb([[x0, y0, 0.07 * s], [x0 + 0.04 * s * fx, y0 - 0.2 * s, 0.05 * s], [x0 + 0.02 * s * fx, y0 - len * s * 0.5, 0.045 * s]], { per: 5 })];
      const balls = [];
      const R = rngOf(seed + sd * 3, 9);
      for (let k = 0; k < 30; k++) {
        const t = k / 30, y = y0 - 0.1 * s - t * len * s * 0.85, hw = (0.13 + 0.2 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * s;
        for (const side of [-1, 1]) balls.push(blob(x0 + side * hw * (0.2 + R() * 0.8) + 0.03 * s * fx, y + (R() - 0.5) * 0.05 * s, 0.062 * s, 0.085 * s, (R() - 0.5) * 0.5, 10));
      }
      layers.push({ shapes: stalkS, fill: { top: '#8a6a3a', bottom: '#5a4024' }, deco(c, bb) { volume(c, bb); } });
      layers.push({
        shapes: balls, fill: { top: col(0.2), bottom: col(0.9) },
        deco(c, bb) { volume(c, bb, { dark: 'rgba(80,25,0,.4)', light: 'rgba(255,240,170,.38)' }); const r2 = rngOf(seed + 9, 2); for (let k = 0; k < 18; k++) fillPoly(c, blob(bb.x0 + r2() * bb.w, bb.y0 + r2() * bb.h, 0.012 * s, 0.018 * s, 0, 6), 'rgba(255,245,200,.45)'); },
      });
    }
  }
  return { top, crown: cr };
}

export function dattelpalme(opts = {}) {
  const layers = [];
  const r = datePalmLayers(layers, { ox: 0, oy: 0, s: 1, seed: opts.seed ?? 1, lean: opts.lean ?? 0.25, fruit: opts.reife ?? 0.7, dates: opts.datteln !== false });
  return spec('dattelpalme', 'Dattelpalme', { body: { z: 1, layers } }, { base: [0, 0], top: { rel: [0.5, 1] }, crown: r.crown, datteln: [r.crown[0], r.crown[1] - 0.4] },
    { kind: 'plant', hint: 'opts.reife 0..1 (grün-gelb -> orange-braun), opts.datteln false, opts.lean' }, { h: opts.h ?? 4.5, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// sykomore 4 m: Feigenbaum mit breiter, dichter Krone, knorrigem Stamm, Feigenbüscheln am Stamm.
export function sykomore(opts = {}) {
  const rng = rngOf(opts.seed ?? 1, 731);
  const layers = [];
  const tk = [[0, 0, 1.05], [-0.03, 0.4, 0.8], [0.0, 1.2, 0.7], [0.02, 1.9, 0.62]];
  const arms = [
    [[-0.1, 1.7, 0.46], [-0.8, 2.15, 0.34], [-1.6, 2.6, 0.22], [-2.3, 2.95, 0.1]],
    [[0.0, 1.8, 0.46], [-0.3, 2.4, 0.34], [-0.4, 3.0, 0.22], [-0.5, 3.5, 0.1]],
    [[0.05, 1.8, 0.46], [0.3, 2.4, 0.34], [0.45, 3.0, 0.22], [0.5, 3.45, 0.1]],
    [[0.1, 1.7, 0.46], [0.9, 2.15, 0.34], [1.7, 2.6, 0.22], [2.4, 2.95, 0.1]],
  ];
  const clumps = [   // [x, y, rx, ry, depth]
    [-2.4, 2.9, 0.95, 0.6, 0.0], [2.45, 2.9, 0.95, 0.6, 0.05], [-1.5, 3.35, 1.1, 0.7, 0.25], [1.55, 3.35, 1.1, 0.7, 0.3], [0, 3.5, 1.35, 0.7, 0.55], [-0.7, 2.85, 1.0, 0.55, 0.4], [0.8, 2.85, 1.0, 0.55, 0.45],
  ];
  const mkClump = ([cx, cy, rx, ry, d], i) => {
    const sh = cluster(cx, cy, rx, ry, { bumps: Math.round(8 + rx * 4), rb: ry * 0.5, seed: i + 3, jit: 0.14, inset: 0.88, core: 0.84 });
    const R = rngOf(i + 50, 4); const dots = [];
    for (let k = 0; k < 40; k++) { const a = R() * TAU, rr = Math.sqrt(R()) * 0.9; dots.push([cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr * 0.9, a]); }
    return {
      shapes: sh, fill: { top: mix('#4f9a4c', '#9bcf5e', d), bottom: mix('#2b6a3c', '#4f9a4c', d * 0.8) },
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(8,40,20,.42)', light: 'rgba(240,255,170,.32)' });
        // Blätter als kleine Herzblatt-Tupfen
        for (const [x, y, a] of dots) { fillPoly(c, blob(x, y, 0.09, 0.075, a, 10), 'rgba(235,255,170,.28)'); }
        for (const [x, y, a] of dots.slice(0, 14)) curve(c, [[x - 0.08, y - 0.03], [x, y + 0.02], [x + 0.08, y - 0.03]], 'rgba(10,50,20,.25)', 0.012, { alpha: 1 });
      },
    };
  };
  layers.push(mkClump(clumps[0], 0), mkClump(clumps[1], 1));
  layers.push({
    shapes: [limb(tk, { per: 8 }), ...arms.map((a) => limb(a, { per: 8 }))], fill: { stops: [[0, '#5a4636'], [0.5, '#8a7660'], [1, '#6c5844']], dir: 'v' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(25,14,6,.35)', light: 'rgba(255,235,200,.18)' });
      const R = rngOf(6, 2);
      strokes(c, Array.from({ length: 28 }, () => { const y = 0.05 + R() * 1.6, x = (R() - 0.5) * 0.6; return [x, y, x + (R() - 0.5) * 0.05, y - 0.35]; }), '#2b1d12', 0.035, 0.38);
      strokes(c, [[-0.3, 0.1, -0.26, 1.4], [-0.05, 0.4, -0.03, 1.6]], '#c9ad86', 0.06, 0.3);
    },
  });
  layers.push(mkClump(clumps[2], 2), mkClump(clumps[3], 3), mkClump(clumps[5], 5), mkClump(clumps[6], 6), mkClump(clumps[4], 4));
  // Feigenbüschel am Stamm und an dicken Ästen (Sykomoren tragen Feigen direkt am Holz)
  const figs = [];
  const pos = [[-0.3, 1.5], [0.25, 1.35], [-0.1, 1.0], [0.32, 1.85], [-0.9, 2.25], [1.0, 2.3], [-1.5, 2.55]];
  pos.forEach(([x, y], i) => { for (let k = 0; k < 4; k++) figs.push(blob(x + (k % 2) * 0.1 - 0.05 + (k > 1 ? 0.04 : 0), y - Math.floor(k / 2) * 0.1, 0.08, 0.085, 0, 12)); });
  layers.push({
    shapes: figs, fill: { top: '#e9b650', bottom: '#b8602a' },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(90,25,0,.4)', light: 'rgba(255,245,190,.4)' }); },
  });
  return spec('sykomore', 'Sykomore (Maulbeerfeige)', { body: { z: 1, layers } }, { base: [0, 0], top: { rel: [0.5, 1] }, feigen: [-0.3, 1.5] },
    { kind: 'plant' }, { h: opts.h ?? 4, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// oase 4 m: kleiner Teich mit Sandufer, drei Dattelpalmen, Schilf und Gräsern
export function oase(opts = {}) {
  const rng = rngOf(opts.seed ?? 1, 741);
  const layers = [];
  // hinterer Sandhügel
  const back = duneLayers(-3.4, 3.4, { count: 3, amp: 0.3, base: 0.32, seed: 5, tone: 'fern', speck: false, ripples: false, edge: 0.8, edgeMin: 0.3 });
  layers.push(...back.layers);
  datePalmLayers(layers, { ox: -1.85, oy: 0.3, s: 0.8, seed: 3, lean: 0.4, flip: true, fruit: 0.8 });
  datePalmLayers(layers, { ox: 1.9, oy: 0.28, s: 0.86, seed: 5, lean: 0.3, fruit: 1 });
  datePalmLayers(layers, { ox: 0.05, oy: 0.36, s: 1.0, seed: 8, lean: 0.12, fruit: 0.9 });
  // Büsche am Ufer
  for (const [x, s2] of [[-0.95, 1], [1.05, 0.85]]) {
    const sh = [];
    for (let k = 0; k < 9; k++) sh.push(leaf(x + (k - 4) * 0.05, 0.28, Math.PI / 2 + (k - 4) * 0.28, 0.5 * s2, 0.07, { fat: 0.3, curve: (k - 4) * 0.06, n: 8 }));
    layers.push({ shapes: sh, fill: { top: '#7fb25a', bottom: '#3f7a3e' }, deco(c, bb) { volume(c, bb, { dark: 'rgba(15,50,15,.4)', light: 'rgba(240,255,170,.3)' }); } });
  }
  // Wasserfläche (vorne, mit Sandrand)
  const bank = poly([[-3.4, 0], [-3.3, 0.2], [-2.7, 0.36], [-2.0, 0.4], [-1.7, 0.3], [-2.3, 0.0]], 1);
  const bankR = poly([[3.4, 0], [3.3, 0.2], [2.7, 0.34], [2.1, 0.38], [1.8, 0.28], [2.4, 0.0]], 1);
  const wTop = wavy(-2.3, 2.3, 0.32, 0.04, 7, { n: 80, phase: 1 });
  layers.push({
    shapes: [[[-2.4, 0.0]].concat(wTop, [[2.4, 0.0]])], fill: { top: '#58c0b6', bottom: '#2a8c92' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(0,50,70,.3)', light: 'rgba(230,255,250,.2)' });
      for (let k = 0; k < 6; k++) { const x = -2.0 + k * 0.72 + (k % 2) * 0.15, y = 0.1 + (k % 3) * 0.05; curve(c, [[x, y], [x + 0.12, y + 0.018], [x + 0.28, y]], 'rgba(255,255,255,.7)', 0.014, { alpha: 1 }); }
      curve(c, wTop.map(([x, y]) => [x, y - 0.02]), 'rgba(255,255,255,.55)', 0.02, { alpha: 1 });
    },
  });
  for (const b of [bank, bankR]) layers.push({ shapes: [b], fill: { top: '#f0d79c', bottom: '#d9b977' }, deco(c, bb) { volume(c, bb); sandSpeckle(c, bb, 4, 24); } });
  // Schilf vorn
  const reeds = [];
  for (let k = 0; k < 8; k++) { const side = k % 2 ? 1 : -1; reeds.push(leaf(-2.2 + (k % 4) * 0.07, 0.12, Math.PI / 2 - side * (0.1 + (k % 4) * 0.1), 0.55 + (k % 3) * 0.1, 0.05, { fat: 0.25, curve: side * 0.3, baseW: 0.4, n: 8 })); }
  for (let k = 0; k < 6; k++) { const side = k % 2 ? 1 : -1; reeds.push(leaf(2.25 + (k % 3) * 0.07, 0.1, Math.PI / 2 - side * (0.1 + (k % 3) * 0.12), 0.5 + (k % 3) * 0.1, 0.05, { fat: 0.25, curve: side * 0.3, baseW: 0.4, n: 8 })); }
  layers.push({ shapes: reeds, fill: { top: '#8db54e', bottom: '#52792f' }, deco(c, bb) { volume(c, bb); } });
  return spec('oase', 'Oase', { body: { z: 1, layers } }, { base: [0, 0], top: { rel: [0.5, 1] }, wasser: [0, 0.15] },
    { kind: 'plant', hint: 'Teich in der Mitte (Anker wasser), drei Dattelpalmen' }, { h: opts.h ?? 4, floor: 0 });
}
