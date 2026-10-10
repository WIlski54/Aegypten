// Gruppe O3 – Haus & Küche: mahlstein (unten, laeufer), ofen (body, flamme), brotlaib (variant 0..5), brotkorb, bierkrug, senet_brett (body, steine),
// spielzeug (variant krokodil|loewe|kreisel; Parts body, jaw), amphore. Blick nach +x, Boden y=0, Meter.
import {
  P, blob, limb, poly, spline, mk, L, rect, rrect, ring, polyline, rotPts, speckle, hatch, grain, gloss, bevel, vase, radiusAt, plasterBlotches, flameShape,
  fillPoly, strokePoly, curve, strokes, line, dot, rngOf, norm, volume, TAU, mix, shade,
} from './_eg_daily_kit.js';
import { variantOf } from './_e_kit.js';
import { drawGlyph } from './eg_glyphs.js';

const clayDeco = (seed, dark = 'rgba(60,25,10,.3)', light = 'rgba(255,225,180,.2)') => (c, bb) => {
  plasterBlotches(c, bb, ['#a5602f', '#e0a56d', '#8f5128'], 24, seed);
  volume(c, bb, { dark, light });
};

// ------------------------------------------------------------------------------------------------
// Mahlstein 0,9 m: Lehmziegelbank, schräger Mühlstein-Sattel, Kornhäufchen oben, Mehlschale unten (Part unten); beweglicher Läufer (Pivot = Mitte der Unterseite)
export function mahlstein(opts = {}) {
  const slope = -0.07; // y pro m
  const sy = (x) => 0.235 + slope * (x + 0.45); // Oberfläche der Mühle
  const bench = poly([[-0.44, 0], [0.2, 0], [0.2, sy(0.2) - 0.09], [-0.44, sy(-0.44) - 0.09]], 0);
  const slab = limb([[-0.46, sy(-0.46) - 0.05, 0.1], [-0.2, sy(-0.2) - 0.05, 0.11], [0.05, sy(0.05) - 0.05, 0.11], [0.27, sy(0.27) - 0.045, 0.08]], { per: 8 });
  const bowl = poly([[0.2, 0.1], [0.46, 0.1], [0.42, 0.02], [0.37, 0.0], [0.29, 0.0], [0.24, 0.02]], 2);
  const mound = poly([[0.23, 0.1], [0.29, 0.15], [0.35, 0.185], [0.4, 0.15], [0.44, 0.1]], 2);
  const grainPile = poly([[-0.44, sy(-0.44) - 0.005], [-0.4, sy(-0.4) + 0.04], [-0.33, sy(-0.33) + 0.06], [-0.26, sy(-0.26) + 0.035], [-0.2, sy(-0.2) - 0.005]], 2);
  const lx = -0.07, ly = sy(lx) + 0.002;
  const lw = 0.3, lh = 0.11;
  const handstone = poly([[-lw / 2, 0], [lw / 2, 0], [lw / 2 - 0.01, lh * 0.55], [lw / 2 - 0.04, lh], [-lw / 2 + 0.04, lh], [-lw / 2 + 0.01, lh * 0.55]], 2);
  const parts = {
    unten: {
      z: 0,
      layers: [
        {
          shapes: [bench], fill: P.ziegel,
          deco(c, bb) {
            for (let y = 0.0; y < 0.2; y += 0.045) line(c, [[bb.x0, y], [bb.x1, y]], 'rgba(70,40,15,.5)', 0.004);
            for (let r = 0; r < 5; r++) for (let x = bb.x0 + (r % 2) * 0.06; x < bb.x1; x += 0.12) line(c, [[x, r * 0.045], [x, r * 0.045 + 0.045]], 'rgba(70,40,15,.45)', 0.004);
            speckle(c, bb, ['#d9a770', '#8a5a30'], 30, 0.003, 0.009, 4, 0.45);
            volume(c, bb, { dark: 'rgba(60,30,10,.3)', light: 'rgba(255,225,170,.1)' });
          },
        },
        {
          shapes: [slab], fill: { top: '#a39a90', bottom: '#7d756c' },
          deco(c, bb) {
            speckle(c, bb, ['#5f5952', '#c8c0b4', '#8a6f60'], 80, 0.003, 0.009, 6, 0.55);
            line(c, [[-0.45, sy(-0.45) + 0.0], [0.25, sy(0.25) + 0.0]], 'rgba(255,245,225,.45)', 0.008);
            volume(c, bb, { dark: 'rgba(30,25,20,.3)', light: 'rgba(255,250,235,.2)' });
          },
        },
        {
          shapes: [grainPile], fill: '#e0b040',
          deco(c, bb) { speckle(c, bb, ['#fff0b3', '#b8861f', '#e8c060'], 40, 0.004, 0.008, 3, 0.9); },
        },
        { shapes: [bowl], fill: { top: P.ton, bottom: P.tonD }, deco: clayDeco(5) },
        {
          shapes: [mound], fill: '#f6edd6',
          deco(c, bb) { speckle(c, bb, ['#fff', '#e6d8b8'], 30, 0.003, 0.007, 8, 0.8); volume(c, bb, { dark: 'rgba(120,90,40,.2)', light: 'rgba(255,255,255,.2)' }); },
        },
        { shapes: [rrect(0.2, 0.085, 0.46, 0.115, 0.012)], fill: P.tonD },
      ],
    },
    laeufer: {
      z: 1, pivot: [lx, ly],
      layers: [{
        shapes: [handstone.map(([x, y]) => [x + lx, y + ly])], fill: { top: '#b8b0a4', bottom: '#8a8278' },
        deco(c, bb) {
          speckle(c, bb, ['#6a645c', '#d9d2c4', '#8a6f60'], 50, 0.003, 0.008, 12, 0.6);
          line(c, [[lx - 0.1, ly + 0.095], [lx + 0.1, ly + 0.095]], 'rgba(255,250,235,.55)', 0.008);
          // Griffmulden
          for (const dx of [-0.07, 0.07]) fillPoly(c, blob(lx + dx, ly + 0.075, 0.025, 0.016, 0, 14), 'rgba(60,50,40,.3)');
          volume(c, bb, { dark: 'rgba(30,25,20,.3)', light: 'rgba(255,250,235,.2)' });
        },
      }],
    },
  };
  return mk('mahlstein', 'Mahlstein mit Läufer', parts, { laeufer: [lx, ly + 0.06], korn: [-0.34, sy(-0.34) + 0.03], mehl: [0.34, 0.16], hand: [lx, ly + 0.11] }, {
    lengthM: 0.9, ranges: { laeufer: [0, 0.3] }, material: 'Granit',
  }, {});
}

// ------------------------------------------------------------------------------------------------
// Lehmbackofen 1 m: kegelförmiger Ofen aus Tonwülsten, Feuerloch mit Glut, Rauchloch oben; Part `flamme` (Pivot unten, z. B. ±0.15 flackern)
export function ofen(opts = {}) {
  const prof = [[0.4, 0], [0.38, 0.1], [0.33, 0.4], [0.27, 0.72], [0.22, 0.93], [0.24, 1.0]];
  const outer = vase(prof, 0, 1);
  const skirt = rrect(-0.46, 0, 0.46, 0.08, 0.02);
  const mouth = poly([[-0.16, 0.08], [-0.16, 0.25], [-0.11, 0.35], [0, 0.39], [0.11, 0.35], [0.16, 0.25], [0.16, 0.08]], 2);
  const lip = poly([[-0.205, 0.08], [-0.205, 0.26], [-0.14, 0.4], [0, 0.45], [0.14, 0.4], [0.205, 0.26], [0.205, 0.08]], 2);
  const flame1 = flameShape(0, 0.09, 0.24, 0.36, 0.1), flame2 = flameShape(-0.09, 0.09, 0.12, 0.2, -0.2), flame3 = flameShape(0.09, 0.09, 0.11, 0.18, 0.25);
  const inner1 = flameShape(0, 0.1, 0.14, 0.24, 0.1), inner2 = flameShape(0, 0.1, 0.06, 0.13, 0.1);
  return mk('ofen', 'Lehmbackofen', {
    body: {
      z: 0,
      layers: [
        {
          shapes: [skirt], fill: P.ziegel,
          deco(c, bb) { for (let x = bb.x0 + 0.05; x < bb.x1; x += 0.11) line(c, [[x, 0], [x, 0.08]], 'rgba(70,40,15,.45)', 0.004); line(c, [[bb.x0, 0.04], [bb.x1, 0.04]], 'rgba(70,40,15,.45)', 0.004); },
        },
        {
          shapes: [outer], fill: { stops: [[0, '#6a3a22'], [0.35, '#b25e35'], [1, '#c8703f']], dir: 'v' },
          deco(c, bb) {
            // Tonwülste
            for (let y = 0.1; y < 0.97; y += 0.085) {
              const r = radiusAt(prof, y) + 0.01;
              curve(c, [[-r, y + 0.012], [-r * 0.5, y - 0.012], [0, y - 0.02], [r * 0.5, y - 0.012], [r, y + 0.012]], 'rgba(70,30,12,.5)', 0.006, { alpha: 1 });
              curve(c, [[-r, y + 0.02], [0, y - 0.01], [r, y + 0.02]], 'rgba(255,215,170,.28)', 0.005, { alpha: 1 });
            }
            plasterBlotches(c, bb, ['#8a4a26', '#e6b080', '#c8703f'], 26, 7);
            // Licht von links, Schatten rechts
            const g = c.ctx.createLinearGradient(...c.tf(bb.x0, 0), ...c.tf(bb.x1, 0));
            g.addColorStop(0, 'rgba(255,225,180,.28)'); g.addColorStop(0.45, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(50,20,10,.38)');
            c.ctx.save(); c.ctx.fillStyle = g; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore();
            // Rauchloch oben und Ruß
            fillPoly(c, blob(0, 0.985, 0.13, 0.03, 0, 24), '#2a1409');
            fillPoly(c, blob(0, 0.99, 0.15, 0.04, 0, 24), 'rgba(40,20,10,.35)');
            for (let i = 0; i < 6; i++) strokes(c, [[-0.1 + i * 0.04, 0.96], [-0.11 + i * 0.04 + (i % 2) * 0.01, 0.84]], 'rgba(30,15,8,.35)', 0.02, 1);
          },
        },
        {
          shapes: [lip], fill: { top: '#d98a52', bottom: '#b25e35' },
          deco(c, bb) { plasterBlotches(c, bb, ['#8a4a26', '#f0c090'], 8, 4); line(c, [[-0.19, 0.38], [0, 0.435], [0.19, 0.38]], 'rgba(255,230,190,.5)', 0.008); },
        },
        {
          shapes: [mouth], fill: '#2a1409',
          deco(c, bb) {
            const g = c.ctx.createRadialGradient(...c.tf(0, 0.1), 1, ...c.tf(0, 0.1), 0.2 * c.S);
            g.addColorStop(0, 'rgba(255,170,50,.95)'); g.addColorStop(0.5, 'rgba(210,70,20,.7)'); g.addColorStop(1, 'rgba(40,15,5,0)');
            c.ctx.save(); c.ctx.fillStyle = g; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore();
            const r = rngOf(3, 2);
            for (let i = 0; i < 14; i++) dot(c, -0.12 + r() * 0.24, 0.085 + r() * 0.05, 0.006 + r() * 0.005, r() < 0.5 ? '#ffd35a' : '#ff8a2a', 0.9);
            // zwei Holzscheite
            fillPoly(c, limb([[-0.13, 0.095, 0.035], [0.0, 0.1, 0.04], [0.13, 0.092, 0.035]], { per: 5 }), '#4a2a14');
          },
        },
      ],
    },
    flamme: {
      z: 2, pivot: [0, 0.09],
      layers: [
        { shapes: [flame1, flame2, flame3], fill: { top: '#e8431f', bottom: '#f6a23a' }, stroke: 'rgba(120,40,10,.55)' },
        { shapes: [inner1], fill: { top: '#ffb73a', bottom: '#ffe27a' }, stroke: null },
        { shapes: [inner2], fill: '#fff6c8', stroke: null },
      ],
    },
  }, { feuer: [0, 0.2], rauch: [0, 1.0], oeffnung: [0, 0.25] }, {
    heightM: 1.0, ranges: { flamme: [0, 0.18] }, material: 'Nilschlamm-Ton',
  }, {});
}

// ------------------------------------------------------------------------------------------------
// Brotlaib 0,25 m: variant 0 Fladen · 1 Kegelbrot · 2 Schneckenbrot · 3 Oval mit Schnitten · 4 Dreiecksbrot · 5 Horn
const LOAF_NAMES = ['Fladenbrot', 'Kegelbrot', 'Schneckenbrot', 'Ovalbrot mit Schnitten', 'Dreiecksbrot', 'Hornbrot'];
/** Liefert Layer eines Laibs; (cx, y0) Fußpunkt, w Breite in Metern. */
export function loafLayers(v, cx, y0, w, seed = 1) {
  const T = ([x, y]) => [cx + x * w, y0 + y * w];
  const Ts = (pts) => pts.map(T);
  let shape;
  const marks = [];
  if (v === 0) {
    shape = poly([[-0.5, 0], [-0.5, 0.09], [-0.36, 0.26], [0, 0.34], [0.36, 0.26], [0.5, 0.09], [0.5, 0]], 2);
    for (const x of [-0.24, -0.08, 0.08, 0.24]) marks.push({ pts: [[x - 0.04, 0.24], [x + 0.02, 0.15], [x + 0.06, 0.08]], c: '#8a4f1f', w: 0.03 });
  } else if (v === 1) {
    shape = poly([[-0.4, 0], [-0.34, 0.26], [-0.2, 0.58], [0, 0.76], [0.2, 0.58], [0.34, 0.26], [0.4, 0]], 2);
    for (const y of [0.16, 0.32, 0.48, 0.62]) { const hw = 0.4 - y * 0.44; marks.push({ pts: [[-hw, y + 0.02], [0, y - 0.02], [hw, y + 0.02]], c: '#8a4f1f', w: 0.028 }); }
  } else if (v === 2) {
    shape = blob(0, 0.3, 0.46, 0.3, 0, 36).map(([x, y]) => [x, Math.max(0, y)]);
    const sp = []; for (let i = 0; i < 40; i++) { const t = i / 39, a = t * TAU * 1.7 + 0.5, r = 0.05 + t * 0.38; sp.push([Math.cos(a) * r, 0.3 + Math.sin(a) * r * 0.62]); }
    marks.push({ pts: sp, c: '#8a4f1f', w: 0.03 });
  } else if (v === 3) {
    shape = poly(blob(0, 0.17, 0.5, 0.17, 0, 30).map(([x, y]) => [x, Math.max(0, y - 0.0)]), 1);
    for (let i = 0; i < 5; i++) marks.push({ pts: [[-0.3 + i * 0.15, 0.3], [-0.24 + i * 0.15, 0.1]], c: '#8a4f1f', w: 0.04 });
  } else if (v === 4) {
    shape = poly([[-0.5, 0], [-0.1, 0.5], [0, 0.6], [0.1, 0.5], [0.5, 0]], 3);
    for (const y of [0.1, 0.22, 0.34]) { const hw = 0.46 - y * 0.78; marks.push({ pts: [[-hw, y], [0, y + 0.05], [hw, y]], c: '#8a4f1f', w: 0.028 }); }
  } else {
    shape = limb([[-0.46, 0.03, 0.1], [-0.3, 0.2, 0.24], [0, 0.3, 0.3], [0.3, 0.2, 0.24], [0.46, 0.03, 0.1]], { per: 8 });
    for (const t of [-0.24, 0, 0.24]) marks.push({ pts: [[t - 0.05, 0.43], [t, 0.2]], c: '#8a4f1f', w: 0.03 });
  }
  const sh = Ts(shape);
  return [{
    shapes: [sh], fill: { top: '#e2a455', bottom: '#b8702e' },
    deco(c, bb) {
      const r = rngOf(seed + v, 4);
      volume(c, bb, { dark: 'rgba(90,40,10,.35)', light: 'rgba(255,230,160,.3)' });
      for (const m of marks) curve(c, Ts(m.pts), m.c, m.w * w, { alpha: 0.8 });
      for (const m of marks) curve(c, Ts(m.pts).map(([x, y]) => [x - 0.004, y + 0.006]), '#ffe0a0', m.w * w * 0.4, { alpha: 0.7 });
      // Mehlstaub und Körner
      for (let i = 0; i < 16; i++) fillPoly(c, blob(bb.x0 + r() * bb.w, bb.y0 + bb.h * (0.35 + r() * 0.6), 0.004 + r() * 0.004, 0.003, r() * 3, 6), '#fff3d4', 0.55);
      gloss(c, cx - w * 0.14, y0 + (v === 1 ? 0.5 : v === 4 ? 0.3 : 0.2) * w, w * 0.1, w * 0.035, 0.5, 0.35);
    },
  }];
}
export function brotlaib(opts = {}) {
  const o = norm(opts);
  const v = o.variant != null && isNaN(+o.variant) ? Math.max(0, ['fladen', 'kegel', 'schnecke', 'oval', 'dreieck', 'horn'].indexOf(o.variant)) : variantOf(o, 6);
  const w = 0.25;
  return mk('brotlaib', LOAF_NAMES[v], { body: { layers: loafLayers(v, 0, 0, w, o.seed ?? 1) } }, { top: [0, 0.2] }, { lengthM: 0.25, material: 'Emmerbrot' }, {});
}

// ------------------------------------------------------------------------------------------------
// Brotkorb 0,4 m: geflochtener Korb mit aufgetürmten Broten
export function brotkorb(opts = {}) {
  const o = norm(opts);
  const bowl = poly([[-0.2, 0.17], [0.2, 0.17], [0.17, 0.06], [0.1, 0.0], [-0.1, 0.0], [-0.17, 0.06]], 2);
  const rim = rrect(-0.215, 0.14, 0.215, 0.185, 0.02);
  const layers = [
    ...loafLayers(4, 0.12, 0.16, 0.15, 6),
    ...loafLayers(2, -0.13, 0.16, 0.15, 4),
    ...loafLayers(1, -0.01, 0.17, 0.15, 3),
    ...loafLayers(0, 0.09, 0.165, 0.2, 5),
    ...loafLayers(3, -0.07, 0.17, 0.2, 2),
    {
      shapes: [bowl], fill: '#e0b765',
      deco(c, bb) {
        // Flechtmuster: Fischgrät
        for (let y = 0.01; y < 0.17; y += 0.03) for (let x = bb.x0; x < bb.x1; x += 0.04) {
          const k = Math.round((y / 0.03)) % 2;
          line(c, [[x + (k ? 0 : 0.02), y], [x + (k ? 0.02 : 0.04), y + 0.025]], 'rgba(110,70,20,.55)', 0.005);
        }
        volume(c, bb, { dark: 'rgba(80,45,10,.35)', light: 'rgba(255,240,190,.18)' });
      },
    },
    {
      shapes: [rim], fill: '#c58f46',
      deco(c, bb) { for (let x = bb.x0; x < bb.x1; x += 0.03) line(c, [[x, 0.14], [x + 0.015, 0.185]], 'rgba(80,45,10,.5)', 0.005); line(c, [[bb.x0 + 0.01, 0.178], [bb.x1 - 0.01, 0.178]], 'rgba(255,235,180,.5)', 0.005); },
    },
  ];
  return mk('brotkorb', 'Brotkorb', { body: { layers } }, { brot: [0, 0.3], top: [0, 0.34] }, { lengthM: 0.43, material: 'Schilf' }, {});
}

// ------------------------------------------------------------------------------------------------
// Bierkrug 0,3 m: bauchiger Tonkrug mit Henkelösen, Schaumkrone und Trinkhalm (Strohhalm aus Rohr)
export function bierkrug(opts = {}) {
  const prof = [[0.07, 0], [0.1, 0.03], [0.14, 0.1], [0.145, 0.15], [0.12, 0.2], [0.075, 0.235], [0.07, 0.25], [0.085, 0.265]];
  const body = vase(prof, 0, 2);
  const handleL = limb([[-0.13, 0.19, 0.022], [-0.2, 0.17, 0.024], [-0.2, 0.1, 0.024], [-0.14, 0.07, 0.022]], { per: 8, caps: false });
  const handleR = limb([[0.13, 0.19, 0.022], [0.2, 0.17, 0.024], [0.2, 0.1, 0.024], [0.14, 0.07, 0.022]], { per: 8, caps: false });
  const foam = poly([[-0.085, 0.262], [-0.1, 0.285], [-0.06, 0.31], [-0.02, 0.325], [0.03, 0.31], [0.07, 0.32], [0.1, 0.29], [0.085, 0.262]], 2);
  const straw = limb([[0.02, 0.28, 0.016], [0.1, 0.36, 0.016], [0.17, 0.43, 0.016]], { per: 6 });
  return mk('bierkrug', 'Bierkrug', {
    body: {
      layers: [
        { shapes: [handleL, handleR], fill: P.tonD, deco: clayDeco(2) },
        {
          shapes: [body], fill: { stops: [[0, '#9a5a30'], [0.5, '#c98a55'], [1, '#d99a62']], dir: 'v' },
          deco(c, bb) {
            clayDeco(3)(c, bb);
            // helle Engobe-Bänder mit Zickzack und Punkten
            for (const [y0, y1] of [[0.12, 0.155], [0.185, 0.2]]) {
              const r = (y) => radiusAt(prof, y) + 0.02;
              fillPoly(c, [[-r(y0), y0], [r(y0), y0], [r(y1), y1], [-r(y1), y1]], '#f1dcae', 0.9);
            }
            const z = []; for (let i = -6; i <= 6; i++) z.push([i * 0.02, 0.1 + (i % 2 ? 0.0 : 0.028)]);
            line(c, z.map(([x, y]) => [x, y + 0.04]), P.karneol, 0.006, { alpha: 0.9 });
            for (let i = -5; i <= 5; i++) dot(c, i * 0.024, 0.17, 0.0055, '#8f2a18');
            gloss(c, -0.07, 0.13, 0.014, 0.05, -0.2, 0.3);
            volume(c, bb, { dark: 'rgba(60,25,10,.28)', light: 'rgba(255,225,180,.18)' });
          },
        },
        { shapes: [straw], fill: P.rohr, deco(c, bb) { line(c, [[0.02, 0.288], [0.17, 0.438]], 'rgba(255,245,200,.7)', 0.004); for (const t of [0.35, 0.7]) { const x = 0.02 + 0.15 * t, y = 0.28 + 0.15 * t; line(c, [[x - 0.01, y + 0.01], [x + 0.01, y - 0.01]], 'rgba(120,90,30,.6)', 0.004); } } },
        {
          shapes: [foam], fill: '#fbf1d6',
          deco(c, bb) { for (const [x, y, r] of [[-0.05, 0.3, 0.012], [0.0, 0.31, 0.015], [0.05, 0.3, 0.01], [-0.02, 0.28, 0.009], [0.06, 0.285, 0.008]]) strokePoly(c, blob(x, y, r, r, 0, 10), 'rgba(160,120,60,.55)', 0.003, 1); volume(c, bb, { dark: 'rgba(160,110,40,.25)', light: 'rgba(255,255,255,.2)' }); },
        },
      ],
    },
  }, { oeffnung: [0, 0.27], halm: [0.17, 0.43] }, { lengthM: 0.3, material: 'Ton' }, { h: 0.3 });
}

// ------------------------------------------------------------------------------------------------
// Senet-Brett 0,6 m: Draufsicht, 3 x 10 Felder, Sonderfelder 15/26–30, Spielsteine (Part steine: 5 Kegel + 5 Spulen), flach für Klappe
export function senet_brett(opts = {}) {
  const o = norm(opts);
  const sq = 0.054, fx = 0.03, W = sq * 10 + fx * 2, H = sq * 3 + fx * 2;
  const x0 = -W / 2, y0 = 0;
  const cell = (col, row) => [x0 + fx + col * sq + sq / 2, y0 + fx + (2 - row) * sq + sq / 2]; // row 0 = oben
  const numAt = (n) => { // Zickzack-Nummerierung 1..30
    const row = Math.floor((n - 1) / 10), k = (n - 1) % 10;
    return cell(row === 1 ? 9 - k : k, row);
  };
  const board = rrect(x0, y0, x0 + W, y0 + H, 0.02);
  const cells = [];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 10; k++) { const [cx, cy] = cell(k, r); cells.push({ cx, cy, light: (k + r) % 2 === 0 }); }
  const lightCells = cells.filter((q) => q.light).map(({ cx, cy }) => rect(cx - sq / 2, cy - sq / 2, cx + sq / 2, cy + sq / 2));
  const darkCells = cells.filter((q) => !q.light).map(({ cx, cy }) => rect(cx - sq / 2, cy - sq / 2, cx + sq / 2, cy + sq / 2));
  const parts = {
    body: {
      z: 0,
      layers: [
        {
          shapes: [board], fill: { top: '#8a5a30', bottom: '#6e4423' },
          deco(c, bb) {
            grain(c, bb, 'rgba(40,20,5,.5)', 30, { len: 0.16, w: 0.003, seed: 2 });
            // Intarsien-Punkte am Rand
            for (let i = 0; i < 20; i++) { dot(c, x0 + 0.015 + i * ((W - 0.03) / 19), y0 + 0.012, 0.004, P.goldH, 0.8); dot(c, x0 + 0.015 + i * ((W - 0.03) / 19), y0 + H - 0.012, 0.004, P.goldH, 0.8); }
            volume(c, bb, { dark: 'rgba(30,15,5,.3)', light: 'rgba(255,225,170,.15)' });
          },
        },
        { shapes: lightCells, fill: '#f3e6c0', deco(c, bb) { speckle(c, bb, ['#d9c28a', '#fff8e0'], 40, 0.002, 0.005, 3, 0.4); } },
        {
          shapes: darkCells, fill: '#d99a4a',
          deco(c, bb) {
            speckle(c, bb, ['#b8782a', '#f0c070'], 40, 0.002, 0.005, 5, 0.4);
          },
        },
        {
          shapes: [rect(x0 + fx, y0 + fx, x0 + W - fx, y0 + H - fx)], fill: 'rgba(0,0,0,0)', stroke: null,
          deco(c, bb) {
            // Feldlinien
            for (let k = 0; k <= 10; k++) line(c, [[x0 + fx + k * sq, y0 + fx], [x0 + fx + k * sq, y0 + fx + 3 * sq]], 'rgba(60,35,10,.7)', 0.004);
            for (let r = 0; r <= 3; r++) line(c, [[x0 + fx, y0 + fx + r * sq], [x0 + fx + 10 * sq, y0 + fx + r * sq]], 'rgba(60,35,10,.7)', 0.004);
            const S = sq * 0.8;
            // 15: Haus der Wiedergeburt (Anch-Andeutung)
            { const [x, y] = numAt(15); strokePoly(c, blob(x, y + S * 0.18, S * 0.17, S * 0.22, 0, 14), P.lapis, 0.007, 1); line(c, [[x, y - S * 0.04], [x, y - S * 0.4]], P.lapis, 0.009); line(c, [[x - S * 0.2, y - S * 0.14], [x + S * 0.2, y - S * 0.14]], P.lapis, 0.009); }
            // 26: Schönes Haus: goldene Scheibe
            { const [x, y] = numAt(26); dot(c, x, y, S * 0.3, P.gold); dot(c, x, y, S * 0.15, P.karneol); strokePoly(c, blob(x, y, S * 0.3, S * 0.3, 0, 16), 'rgba(80,50,10,.7)', 0.004, 1); }
            // 27: Wasser
            { const [x, y] = numAt(27); for (const dy of [0.2, 0, -0.2]) line(c, [[x - S * 0.32, y + S * dy], [x - S * 0.16, y + S * (dy + 0.1)], [x, y + S * dy], [x + S * 0.16, y + S * (dy + 0.1)], [x + S * 0.32, y + S * dy]], P.lapis, 0.006); }
            // 28: drei, 29: zwei Punkte
            { const [x, y] = numAt(28); for (const dx of [-0.24, 0, 0.24]) dot(c, x + S * dx, y, S * 0.09, P.karneol); }
            { const [x, y] = numAt(29); for (const dx of [-0.16, 0.16]) dot(c, x + S * dx, y, S * 0.09, P.karneol); }
            // 30: Sonne
            { const [x, y] = numAt(30); drawGlyph(c, 'sonne', x, y, S * 0.8); }
            strokePoly(c, [[x0 + fx, y0 + fx], [x0 + W - fx, y0 + fx], [x0 + W - fx, y0 + H - fx], [x0 + fx, y0 + H - fx]], 'rgba(40,20,5,.85)', 0.006, 1);
          },
        },
      ],
    },
    steine: {
      z: 1,
      layers: [
        // Kegel (hell) auf den ungeraden, Spulen (dunkel) auf den geraden Feldern 1–10
        {
          shapes: [1, 3, 5, 7, 9].map((n) => { const [x, y] = numAt(n); return blob(x, y, sq * 0.36, sq * 0.36, 0, 16); }), fill: '#f6efe0',
          deco(c, bb) {
            for (const n of [1, 3, 5, 7, 9]) { const [x, y] = numAt(n); strokePoly(c, blob(x, y, sq * 0.22, sq * 0.22, 0, 14), 'rgba(120,100,70,.7)', 0.004, 1); dot(c, x, y, sq * 0.07, '#d9cdb4'); gloss(c, x - sq * 0.1, y + sq * 0.1, sq * 0.08, sq * 0.04, 0.5, 0.7, '#fff'); }
          },
        },
        {
          shapes: [2, 4, 6, 8, 10].map((n) => { const [x, y] = numAt(n); return blob(x, y, sq * 0.36, sq * 0.36, 0, 16); }), fill: '#3a2b2a',
          deco(c, bb) {
            for (const n of [2, 4, 6, 8, 10]) { const [x, y] = numAt(n); strokePoly(c, blob(x, y, sq * 0.24, sq * 0.24, 0, 14), '#a05a3a', 0.004, 1); dot(c, x, y, sq * 0.11, '#1c1816'); gloss(c, x - sq * 0.12, y + sq * 0.1, sq * 0.07, sq * 0.035, 0.5, 0.5, '#fff'); }
          },
        },
      ],
    },
  };
  const anchors = {}; for (const n of [1, 10, 15, 26, 30]) { const [x, y] = numAt(n); anchors['feld' + n] = [x, y]; }
  return mk('senet_brett', 'Senet-Brettspiel', parts, anchors, { lengthM: 0.6, material: 'Holz, Elfenbein' }, {});
}

// ------------------------------------------------------------------------------------------------
// Spielzeug 0,3 m: variant 'krokodil' (0) / 'loewe' (1) mit beweglichem Kiefer (Part jaw, Pivot am Mundwinkel, Range −0.5), 'kreisel' (2) ohne Kiefer
export function spielzeug(opts = {}) {
  const o = norm(opts);
  const names = ['krokodil', 'loewe', 'kreisel'];
  const v = isNaN(+o.variant) && o.variant != null ? Math.max(0, names.indexOf(o.variant)) : variantOf(o, 3);
  const WD = (c, bb) => { grain(c, bb, 'rgba(60,30,10,.35)', 18, { len: 0.1, w: 0.003, seed: 3 }); volume(c, bb, { dark: 'rgba(50,25,8,.28)', light: 'rgba(255,230,170,.18)' }); };
  if (v === 2) {
    const top = poly([[-0.1, 0.18], [0.1, 0.18], [0.12, 0.14], [0.0, 0.01], [-0.12, 0.14]], 2);
    return mk('spielzeug', 'Kreisel', {
      body: {
        layers: [
          { shapes: [limb([[0, 0.28, 0.03], [0, 0.2, 0.03]], { per: 3 })], fill: P.holzD },
          { shapes: [top], fill: { top: '#d4a15e', bottom: P.holz }, deco(c, bb) { WD(c, bb); line(c, [[-0.11, 0.15], [0.11, 0.15]], P.karneol, 0.012); line(c, [[-0.085, 0.1], [0.085, 0.1]], P.tuerkis, 0.012); line(c, [[-0.05, 0.055], [0.05, 0.055]], P.karneol, 0.01); } },
        ],
      },
    }, { spitze: [0, 0.0] }, { lengthM: 0.3, material: 'Holz' }, { h: 0.3 });
  }
  const jawPivot = v === 0 ? [0.1, 0.1] : [0.12, 0.14];
  const parts = {};
  if (v === 0) {
    const body = limb([[-0.17, 0.05, 0.02], [-0.1, 0.08, 0.07], [0.0, 0.1, 0.09], [0.1, 0.11, 0.08]], { per: 8 });
    const upper = poly([[0.08, 0.1], [0.28, 0.12], [0.29, 0.15], [0.2, 0.17], [0.1, 0.19]], 1);
    const wheels = [-0.04, 0.08].map((x) => blob(x, 0.032, 0.032, 0.032, 0, 16));
    parts.body = {
      z: 1,
      layers: [
        { shapes: [rrect(-0.12, 0.0, 0.14, 0.012, 0.004)], fill: P.holzD },
        { shapes: [limb([[-0.17, 0.07, 0.016], [-0.14, 0.1, 0.05], [-0.1, 0.12, 0.045]], { per: 5 }), body, upper], fill: { top: '#6fa85a', bottom: '#3f7a40' }, deco(c, bb) { WD(c, bb); for (let x = -0.12; x < 0.1; x += 0.04) line(c, [[x, 0.06], [x + 0.025, 0.145]], P.gold, 0.012, { alpha: 0.9 }); dot(c, 0.17, 0.168, 0.012, '#fff0b3'); dot(c, 0.17, 0.168, 0.006, '#1c1816'); } },
        { shapes: wheels, fill: P.holz, deco(c, bb) { for (const x of [-0.04, 0.08]) { dot(c, x, 0.032, 0.012, P.holzD); } } },
      ],
    };
    parts.jaw = {
      z: 0, pivot: jawPivot,
      layers: [{ shapes: [poly([[0.07, 0.085], [0.28, 0.1], [0.27, 0.12], [0.2, 0.113], [0.08, 0.115]], 1)], fill: { top: '#5f9a4e', bottom: '#2f6a38' }, deco(c, bb) { for (let x = 0.12; x < 0.27; x += 0.03) { fillPoly(c, [[x, 0.113], [x + 0.008, 0.113], [x + 0.004, 0.125]], '#fff8e0'); } } }],
    };
  } else {
    const body = poly([[-0.16, 0.0], [-0.17, 0.1], [-0.1, 0.14], [0.05, 0.145], [0.1, 0.12], [0.1, 0.0]], 2);
    const head = blob(0.12, 0.19, 0.075, 0.08, 0, 24);
    const mane = blob(0.1, 0.19, 0.11, 0.115, 0, 26);
    parts.body = {
      z: 1,
      layers: [
        { shapes: [limb([[-0.15, 0.1, 0.03], [-0.22, 0.14, 0.025], [-0.24, 0.2, 0.02]], { per: 6 })], fill: '#c98a45' },
        { shapes: [body], fill: { top: '#e0b050', bottom: '#b87f35' }, deco(c, bb) { WD(c, bb); for (const x of [-0.12, -0.05, 0.02]) line(c, [[x, 0.02], [x + 0.01, 0.12]], 'rgba(120,70,20,.5)', 0.008); } },
        { shapes: [rrect(-0.18, -0.01, 0.12, 0.012, 0.004)], fill: P.holzD },
        { shapes: [mane], fill: '#8a5f1c', deco(c, bb) { for (let a = 0; a < TAU; a += 0.5) line(c, [[0.1 + Math.cos(a) * 0.06, 0.19 + Math.sin(a) * 0.06], [0.1 + Math.cos(a) * 0.105, 0.19 + Math.sin(a) * 0.11]], '#5e3d1f', 0.008, { alpha: 0.8 }); } },
        { shapes: [head], fill: '#e5b25a', deco(c, bb) { dot(c, 0.14, 0.215, 0.01, '#fff0b3'); dot(c, 0.14, 0.215, 0.005, '#1c1816'); dot(c, 0.185, 0.19, 0.008, '#1c1816'); } },
      ],
    };
    parts.jaw = { z: 0, pivot: jawPivot, layers: [{ shapes: [poly([[0.1, 0.115], [0.225, 0.125], [0.225, 0.145], [0.12, 0.15]], 1)], fill: '#d9a042', deco(c, bb) { fillPoly(c, [[0.17, 0.15], [0.18, 0.15], [0.175, 0.16]], '#fff8e0'); } }] };
  }
  const nm = v === 0 ? 'Spielzeug-Krokodil' : 'Spielzeug-Löwe';
  return mk('spielzeug', nm, parts, { mund: [0.27, 0.11], schnur: [-0.1, 0.1] }, { lengthM: 0.3, ranges: { jaw: [0, -0.5] }, material: 'bemaltes Holz' }, {});
}

// ------------------------------------------------------------------------------------------------
// Amphore 0,6 m: spitzer Tonkrug mit zwei Henkeln, Siegelpfropfen, bemalten Bändern auf Tonständer
export function amphore(opts = {}) {
  const prof = [[0.02, 0.12], [0.07, 0.2], [0.125, 0.32], [0.13, 0.4], [0.105, 0.5], [0.06, 0.56], [0.045, 0.6], [0.055, 0.65], [0.065, 0.67]];
  const body = vase(prof, 0, 2);
  const stand = poly([[-0.13, 0], [-0.09, 0.1], [0.09, 0.1], [0.13, 0]], 1);
  const hL = limb([[-0.05, 0.62, 0.025], [-0.15, 0.6, 0.028], [-0.17, 0.5, 0.028], [-0.11, 0.46, 0.026]], { per: 8, caps: false });
  const hR = limb([[0.05, 0.62, 0.025], [0.15, 0.6, 0.028], [0.17, 0.5, 0.028], [0.11, 0.46, 0.026]], { per: 8, caps: false });
  const plug = poly([[-0.05, 0.665], [-0.05, 0.69], [-0.02, 0.715], [0.02, 0.715], [0.05, 0.69], [0.05, 0.665]], 2);
  return mk('amphore', 'Amphore', {
    body: {
      layers: [
        { shapes: [hL, hR], fill: P.tonD, deco: clayDeco(2) },
        {
          shapes: [stand], fill: P.ziegel,
          deco(c, bb) { fillPoly(c, [[-0.05, 0], [-0.03, 0.06], [0.03, 0.06], [0.05, 0]], '#3a2314'); line(c, [[bb.x0, 0.05], [bb.x1, 0.05]], 'rgba(70,40,15,.45)', 0.004); },
        },
        {
          shapes: [body], fill: { stops: [[0, '#a96a3a'], [0.5, '#d29a62'], [1, '#c98a55']], dir: 'v' },
          deco(c, bb) {
            clayDeco(4)(c, bb);
            const r = (y) => radiusAt(prof, y) + 0.02;
            for (const [y0, y1, col] of [[0.52, 0.55, P.karneol], [0.34, 0.37, P.lapis], [0.26, 0.285, P.karneol]]) fillPoly(c, [[-r(y0), y0], [r(y0), y0], [r(y1), y1], [-r(y1), y1]], col, 0.9);
            const z = []; for (let i = -6; i <= 6; i++) z.push([i * 0.018, 0.435 + (i % 2 ? 0.02 : 0)]);
            line(c, z, P.tuerkis, 0.008); line(c, z.map(([x, y]) => [x, y - 0.05]), P.tuerkis, 0.008);
            gloss(c, -0.07, 0.4, 0.012, 0.06, -0.12, 0.3);
            volume(c, bb, { dark: 'rgba(60,25,10,.28)', light: 'rgba(255,225,180,.18)' });
          },
        },
        {
          shapes: [plug], fill: '#a98a62',
          deco(c, bb) { fillPoly(c, blob(0, 0.695, 0.022, 0.016, 0, 14), '#7a5a3a'); strokePoly(c, blob(0, 0.695, 0.012, 0.009, 0, 12), 'rgba(40,20,5,.7)', 0.003, 1); },
        },
      ],
    },
  }, { oeffnung: [0, 0.7], bauch: [0, 0.35] }, { lengthM: 0.6, material: 'Ton' }, { h: 0.6 });
}
