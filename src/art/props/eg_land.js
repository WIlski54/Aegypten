// Gruppe S1 – Landschaft und Bauwerke der Wüste: Pyramiden (Gizeh, Cheops, Bau-Schichten, Querschnitt, Stufenpyramide),
// Sphinx, Baurampe, Steinbruchwand, Tal der Könige, Dünen, Nilwasser, Getreidefeld.
// Papierschnitt-Look: Licht von links oben (linke Pyramidenseite hell, rechte im Schatten), wellige Oberkanten, kräftige Quader.
import {
  PAL, spec, lerp, clamp01, smooth, rect, bar, courseEdges, masonry, sandSpeckle, duneLayers,
  blob, limb, poly, TAU, rngOf, variantOf, mix, shade, leaf, ribbon, wavy, clipBelow, clipAxis, spline, volume,
  fillPoly, fillPolys, fillGrad, curve, strokes, centerline, strand, groundShade, stalk, tip, cluster, beads,
} from './_eg_land_kit.js';

// ------------------------------------------------------------------------------------------------
// Pyramide aus zwei Flächen (links hell, rechts im Schatten) mit Quaderreihen. Rückgabe: Layer-Liste.
// o: cx, half, h, y0, shift (Lage der Mittelkante), n (Schichten), seed, tone ('kalk'|'warm'), cap (Anteil heller Spitze),
//    granit (Anteil roter Granitfuß), gold (Anteil vergoldete Spitze), eingang (bool), wScale
const TONES = {
  kalk: { lit: ['#f8efd2', '#f1e4bf', '#fbf3da', '#ecdcb0'], shade: ['#cdb184', '#c2a375', '#d4b98d', '#b99a6b'], litF: ['#f9f1d6', '#eddcae'], shadeF: ['#d2b88c', '#b8956a'] },
  warm: { lit: ['#efdca8', '#e6d095', '#f3e4b6', '#e0c88a'], shade: ['#c19a62', '#b68e57', '#c9a46c', '#ab8450'], litF: ['#f1e0ae', '#dfc58a'], shadeF: ['#c7a068', '#a67f4d'] },
};
export function pyramidLayers(o = {}) {
  const { cx = 0, half = 2, h = 2.5, y0 = 0, shift = 0.14, n = 16, seed = 1, tone = 'kalk', cap = 0, granit = 0, gold = 0, eingang = false, taper = 0.28 } = o;
  const T = TONES[tone];
  const ws = (o.wScale ?? h / 5) ;
  const edges = courseEdges(y0, h, n, taper);
  const A = [cx, y0 + h], Lc = [cx - half, y0], M = [cx + half * shift, y0], Rc = [cx + half, y0];
  // Breite der Fläche in Höhe y
  const xl = (y) => cx - half * (1 - (y - y0) / h), xr = (y) => cx + half * (1 - (y - y0) / h), xm = (y) => cx + half * shift * (1 - (y - y0) / h);
  const litP = [Lc, M, A], shadeP = [M, Rc, A];
  const layers = [];
  const faceDeco = (lit, sd) => (c, bb) => {
    masonry(c, bb, edges, {
      tones: lit ? T.lit : T.shade, wMin: 0.5, wMax: 1.05, wScale: ws, seed: sd, speck: 1,
      joint: lit ? 'rgba(110,75,35,.5)' : 'rgba(55,32,14,.55)', hi: lit ? 'rgba(255,252,236,.6)' : 'rgba(255,235,190,.22)',
      lo: lit ? 'rgba(120,80,36,.30)' : 'rgba(40,22,8,.34)', jw: 0.012 + 0.006 * (h / 5), bevel: 0.15,
    });
    volume(c, bb, lit ? { dark: 'rgba(120,80,36,.22)', light: 'rgba(255,252,235,.35)' } : { dark: 'rgba(40,22,8,.32)', light: 'rgba(255,225,170,.10)' });
  };
  layers.push({ shapes: [litP], fill: { top: T.litF[0], bottom: T.litF[1] }, deco: faceDeco(true, seed) });
  layers.push({ shapes: [shadeP], fill: { top: T.shadeF[0], bottom: T.shadeF[1] }, deco: faceDeco(false, seed + 9) });
  // Zusatzbänder (Spitze / Granitfuß / Gold): als Flächen zwischen zwei Höhen
  const band = (ya, yb, lit) => {
    const f = lit ? litP : shadeP;
    let p = clipAxis(f, 1, ya, true); p = clipAxis(p, 1, yb, false);
    return p;
  };
  if (granit > 0) {
    const yc = y0 + h * granit;
    const gEdges = courseEdges(y0, h * granit, Math.max(3, Math.round(n * granit * 1.1)), 0.05);
    for (const lit of [true, false]) {
      layers.push({
        shapes: [band(y0 - 0.01, yc, lit)], fill: lit ? { top: '#d9a58e', bottom: '#c28570' } : { top: '#a56a58', bottom: '#8c5446' },
        deco(c, bb) {
          masonry(c, bb, gEdges, { tones: lit ? ['#dfae98', '#d49c85', '#e6b9a4', '#cf9680'] : ['#a96e5c', '#9c6050', '#b27867', '#955848'], wMin: 0.8, wMax: 1.5, wScale: ws, seed: seed + (lit ? 31 : 32), joint: lit ? 'rgba(90,40,30,.5)' : 'rgba(40,16,10,.55)', hi: lit ? 'rgba(255,240,225,.45)' : 'rgba(255,215,190,.2)', lo: 'rgba(60,24,16,.3)', jw: 0.014 + 0.006 * (h / 5) });
          volume(c, bb, { dark: 'rgba(60,24,16,.25)', light: 'rgba(255,235,220,.22)' });
          // Granit: dunkle Sprenkel
          const r = rngOf(seed + 5, 6); for (let k = 0; k < 60; k++) fillPoly(c, blob(bb.x0 + r() * bb.w, bb.y0 + r() * bb.h, 0.012 + r() * 0.012, 0.01, 0, 6), r() < 0.5 ? 'rgba(70,30,26,.4)' : 'rgba(255,225,205,.4)');
        },
      });
    }
  }
  const capLayer = (frac, fills, cols, seedOff, smoothCasing) => {
    const ycut = y0 + h * (1 - frac);
    // Untergrenze mit „Stufen“ (nicht ganz gerade): wir schneiden gerade, die Fuge zeichnet die Deckschicht
    for (const lit of [true, false]) {
      const f = lit ? fills.lit : fills.shade;
      layers.push({
        shapes: [clipAxis(lit ? litP : shadeP, 1, ycut, true)], fill: { top: f[0], bottom: f[1] },
        deco(c, bb) {
          const cEdges = courseEdges(ycut, h * frac, Math.max(2, Math.round(n * frac * 0.9)), 0.15);
          masonry(c, bb, cEdges, { tones: lit ? cols.lit : cols.shade, wMin: 0.55, wMax: 1.1, wScale: ws, seed: seed + seedOff + (lit ? 0 : 3), joint: lit ? 'rgba(150,115,70,.45)' : 'rgba(80,55,30,.5)', hi: lit ? 'rgba(255,255,245,.65)' : 'rgba(255,240,205,.22)', lo: lit ? 'rgba(130,95,50,.22)' : 'rgba(40,22,8,.3)', jw: 0.012 + 0.005 * (h / 5), bevel: 0.1 });
          volume(c, bb, lit ? { dark: 'rgba(120,85,45,.18)', light: 'rgba(255,255,250,.35)' } : { dark: 'rgba(40,22,8,.28)', light: 'rgba(255,235,190,.1)' });
          // Unterkante der Deckschicht: kräftige Linie
          curve(c, [[bb.x0 - 1, ycut], [bb.x1 + 1, ycut]], lit ? 'rgba(110,80,40,.6)' : 'rgba(40,22,8,.6)', 0.022, { alpha: 1 });
        },
      });
    }
  };
  if (cap > 0) capLayer(cap, { lit: ['#fffdf3', '#f7f1dc'], shade: ['#e0cfaa', '#cdb88e'] }, { lit: ['#fffcee', '#fbf6e2', '#f6efd8'], shade: ['#dccaa2', '#d4c098', '#e3d3ae'] }, 40);
  if (gold > 0) capLayer(gold, { lit: ['#fff0b3', '#f2cd62'], shade: ['#c99a30', '#a77a22'] }, { lit: ['#ffe9a0', '#f7d672', '#fff3c0'], shade: ['#c89b34', '#b88a2a', '#d4a63c'] }, 60);
  if (eingang) {
    const ey = y0 + h * 0.2, ex = cx - half * 0.36 * (1 - 0.2), ew = Math.max(0.1, h * 0.05), eh = h * 0.05;
    // Giebel aus zwei schrägen Steinen + dunkle Öffnung
    layers.push({
      shapes: [[[ex - ew * 1.1, ey - eh * 0.1], [ex + ew * 1.1, ey - eh * 0.1], [ex + ew * 0.05, ey + eh * 2.3], [ex - ew * 0.05, ey + eh * 2.3]]],
      fill: { top: '#e9dcb4', bottom: '#cdb98c' },
      deco(c) {
        fillPoly(c, [[ex - ew * 0.7, ey - eh], [ex + ew * 0.7, ey - eh], [ex + ew * 0.7, ey + eh * 0.5], [ex, ey + eh * 1.55], [ex - ew * 0.7, ey + eh * 0.5]], '#2c1e14');
        fillPoly(c, [[ex - ew * 0.7, ey - eh], [ex - ew * 0.45, ey - eh], [ex - ew * 0.45, ey + eh * 0.6], [ex - ew * 0.7, ey + eh * 0.5]], 'rgba(0,0,0,.35)');
      },
    });
  }
  return { layers, edges, A, M, litP, shadeP, ridgeAt: (y) => xm(y), xl, xr };
}

// Sandfuß / wellige Wüste vor Bauwerken (mehrere Dünenlagen). Rückgabe: Layer-Liste.
export function sandSkirt({ x0, x1, base = 0, amp = 0.3, count = 5, seed = 1, floor = -0.05, tone = 'warm' } = {}) {
  const D = duneLayers(x0, x1, { count, amp, base, seed, tone, floor, lenK: 0.9 });
  return { layers: D.layers, topAt: D.topAt };
}

// ------------------------------------------------------------------------------------------------
// pyramide_gizeh: die drei Pyramiden (Cheops hinten links, Chephren mit heller Spitze, Mykerinos klein mit rotem Granitfuß) und wellige Wüste davor
export function pyramide_gizeh(opts = {}) {
  const seed = opts.seed ?? 1;
  const cheops = pyramidLayers({ cx: -2.55, half: 2.3, h: 2.95, n: 17, seed: 11, tone: 'kalk' });
  const chephren = pyramidLayers({ cx: 0.45, half: 2.1, h: 2.75, n: 16, seed: 21, tone: 'kalk', cap: 0.25, shift: 0.1 });
  const myk = pyramidLayers({ cx: 3.35, half: 1.05, y0: 0.1, h: 1.4, n: 11, seed: 31, tone: 'warm', granit: 0.26, shift: 0.16 });
  // drei kleine Nebenpyramiden vor Mykerinos / zwischen den Großen
  const q1 = pyramidLayers({ cx: 1.95, half: 0.42, h: 0.5, n: 5, seed: 41, tone: 'warm', shift: 0.15 });
  const sk = sandSkirt({ x0: -5.4, x1: 4.9, base: 0.0, amp: 0.3, count: 7, seed: seed + 4 });
  const parts = {
    body: { z: 0, layers: cheops.layers },
    chephren: { z: 1, layers: chephren.layers },
    mykerinos: { z: 2, layers: [...myk.layers] },
    neben: { z: 3, layers: q1.layers },
    duene: { z: 4, layers: sk.layers },
  };
  return spec('pyramide_gizeh', 'Die Pyramiden von Gizeh', parts,
    { base: [0, 0], top: { rel: [0.3, 1] }, cheops: [-2.55, 2.95], chephren: [0.45, 2.75], mykerinos: [3.35, 1.4] },
    { kind: 'building', heightM: 146, ranges: {}, hint: 'Cheops (hinten links), Chephren mit heller Spitze, Mykerinos mit rotem Granitfuß; Echtgröße: Cheops 146 m hoch, 230 m breit' },
    { w: opts.w ?? 8, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// pyramide_cheops: einzelne große Pyramide mit Quadern, Licht-/Schattenseite, Eingang und Sandfuß. opts.spitze 'gold' = vergoldeter Schlussstein.
export function pyramide_cheops(opts = {}) {
  const H = 5, half = 3.95;
  const p = pyramidLayers({ cx: 0, half, h: H, y0: 0.0, n: 20, seed: 5, tone: opts.ton ?? 'kalk', eingang: true, gold: opts.spitze === 'gold' ? 0.07 : 0, taper: 0.3, shift: 0.12 });
  const sk = sandSkirt({ x0: -5.3, x1: 5.3, base: 0.0, amp: 0.3, count: 6, seed: (opts.seed ?? 1) + 1 });
  return spec('pyramide_cheops', 'Cheops-Pyramide', { body: { z: 0, layers: p.layers }, sand: { z: 1, layers: sk.layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, apex: [0, H], eingang: [-1.2, H * 0.21] },
    { kind: 'building', heightM: 146.6, baseM: 230 }, { h: opts.h ?? 5, floor: 0 });
}

// ------------------------------------------------------------------------------------------------
// pyramide_bau: 12 Schichten (schicht0 unten … schicht11 Spitze), jede ein eigener Part; zusammen = fertige Pyramide.
export function pyramide_bau(opts = {}) {
  const N = 12, H = 5, half = 3.95, shift = 0.12;
  const parts = {};
  const T = TONES[opts.ton ?? 'kalk'];
  const edgesAll = courseEdges(0, H, 24, 0.25);
  const sk = (i) => (i / N) * H;
  for (let i = 0; i < N; i++) {
    const ya = sk(i), yb = sk(i + 1), ov = i === 0 ? 0 : 0.05;
    const wa = half * (1 - ya / H), wb = half * (1 - yb / H);
    const wa2 = half * (1 - (ya - ov) / H);
    // links / rechts getrennt (Mittelkante); jede Schicht = ein Part mit zwei Layern
    const xmA = half * shift * (1 - (ya - ov) / H), xmB = half * shift * (1 - yb / H);
    const litPoly = i === N - 1 ? [[-wa2, ya - ov], [xmA, ya - ov], [0, yb]] : [[-wa2, ya - ov], [xmA, ya - ov], [xmB, yb], [-wb, yb]];
    const shadePoly = i === N - 1 ? [[xmA, ya - ov], [wa2, ya - ov], [0, yb]] : [[xmA, ya - ov], [wa2, ya - ov], [wb, yb], [xmB, yb]];
    // zwei Quaderreihen pro Schicht (obere etwas niedriger)
    const e = [ya - ov, ya + (yb - ya) * 0.54, yb];
    const goldTop = opts.spitze === 'gold' && i === N - 1;
    const mk = (shapeP, lit, sd) => ({
      shapes: [shapeP],
      fill: goldTop ? (lit ? { top: '#fff0b3', bottom: '#f2cd62' } : { top: '#c99a30', bottom: '#a77a22' }) : (lit ? { top: T.litF[0], bottom: T.litF[1] } : { top: T.shadeF[0], bottom: T.shadeF[1] }),
      deco(c, bb) {
        masonry(c, bb, e, {
          tones: goldTop ? (lit ? ['#ffe9a0', '#f7d672', '#fff3c0'] : ['#c89b34', '#b88a2a']) : (lit ? T.lit : T.shade), wMin: 0.5, wMax: 1.05, wScale: 1, seed: sd, speck: 1,
          joint: lit ? 'rgba(110,75,35,.55)' : 'rgba(55,32,14,.6)', hi: lit ? 'rgba(255,252,236,.6)' : 'rgba(255,235,190,.22)', lo: lit ? 'rgba(120,80,36,.30)' : 'rgba(40,22,8,.34)', jw: 0.022, bevel: 0.14,
        });
        volume(c, bb, lit ? { dark: 'rgba(120,80,36,.2)', light: 'rgba(255,252,235,.3)' } : { dark: 'rgba(40,22,8,.3)', light: 'rgba(255,225,170,.10)' });
        // Unterkante der Schicht kräftig (Schichtgrenze lesbar)
        curve(c, [[bb.x0 - 1, ya - ov + 0.01], [bb.x1 + 1, ya - ov + 0.01]], lit ? 'rgba(110,75,35,.65)' : 'rgba(40,22,8,.7)', 0.03, { alpha: 1 });
      },
    });
    parts['schicht' + i] = { z: i, layers: [mk(litPoly, true, 100 + i * 7), mk(shadePoly, false, 300 + i * 5)] };
  }
  const anchors = { base: [0, 0], top: { rel: [0.5, 1] }, apex: [0, H] };
  for (let i = 0; i < N; i++) anchors['schicht' + i] = [0, (i + 0.5) * (H / N)];
  return spec('pyramide_bau', 'Pyramide im Bau (12 Schichten)', parts, anchors,
    { kind: 'building', layers: N, layerHeightM: H / N, heightM: 146.6, hint: 'Parts schicht0 (unten) … schicht11 (Spitze); Seite blendet je nach Hebelwert ein' },
    { h: opts.h ?? 5, floor: 0 });
}
