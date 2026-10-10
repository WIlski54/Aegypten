// Gruppe O1 – Streitwagen (zweirädrig, Gold; Seitenansicht, Deichsel nach +x). Parts: `body` (Kasten + Deichsel), `radA` (nahes Rad, z vorn),
// `radB` (fernes Rad, z hinten, leicht versetzt); beide drehen um die Achse (Pivot = Nabe). Gebaut in cm, skaliert auf Länge 2 m.
import {
  K, spec, blob, limb, poly, rect, rrect, stroke2poly, sym, ring, spline, fillPoly, bandedLimb,
  gold, inlay, flat, goldFill, bevel, gloss, volume, seg, ln, dotAt, ellipseAt, TAU,
} from './_eg_royal_kit.js';

const AX = [-30, 45];          // Achsmitte (nahes Rad)
const R = 45;                   // Radradius

function wheelLayers(cx, cy, tag) {
  const layers = [];
  layers.push(inlay([ring(cx, cy, 38.5, R, 0, TAU, 56)], '#6a4a2a', { stroke: 'rgba(30,18,6,.7)', bevel: true, up: 0.15, down: -0.3 }));   // Lederreifen
  layers.push(gold([ring(cx, cy, 31, 38.5, 0, TAU, 56)], {
    dir: 'v', deco(c) {
      for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; dotAt(c, cx + Math.cos(a) * 34.7, cy + Math.sin(a) * 34.7, 1.05, i % 2 ? K.lapis : K.carn); }
    },
  }));
  const spokes = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.26;
    spokes.push(limb([[cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 5.2], [cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, 4.3], [cx + Math.cos(a) * 33, cy + Math.sin(a) * 33, 3.6]], { per: 6, caps: false }));
  }
  layers.push(gold(spokes, { dir: 'h', gloss: false }));
  layers.push(gold([blob(cx, cy, 9.4, 9.4, 0, 24)], { dir: 'v', gloss: true }));
  layers.push({
    shapes: [blob(cx, cy, 5.6, 5.6, 0, 20)], fill: { stops: [[0, K.carnHi], [0.7, K.carn], [1, K.carnLo]], dir: 'v' }, stroke: 'rgba(60,20,10,.8)',
    deco(c) { dotAt(c, cx - 1.5, cy + 1.8, 1.3, 'rgba(255,230,210,.7)'); },
  });
  return layers;
}

export function streitwagen(opts = {}) {
  const body = [];
  // Deichsel (steigt nach vorn an) + Joch am Ende
  const pole = limb([[14, 68, 6.4], [48, 80, 6.0], [82, 94, 5.4], [108, 106, 4.8]], { per: 10 });
  body.push(gold([pole], { dir: 'v', deco(c) { for (let i = 0; i < 6; i++) { const t = i / 5; dotAt(c, 26 + t * 78, 73 + t * 31 + 0.5, 0.9, i % 2 ? K.lapis : K.carn); } } }));
  body.push(gold([limb([[106, 94, 3.4], [108, 106, 3.4], [109, 120, 3.4]], { per: 4 }), blob(110, 122, 3.6, 3.6, 0, 14)], { dir: 'v', gloss: false }));
  // Kasten: Seitenwand (Viertelellipse), Boden
  const panel = poly([[-56, 70], [-55, 86], [-42, 92], [-20, 102], [0, 118], [14, 132], [24, 138], [30, 132], [30.6, 70]], 2);
  body.push(gold([panel], {
    dir: 'v', ga: 0.35, deco(c, bb) {
      // Netzmuster (Rauten) in Türkis/Karneol
      for (let r = 0; r < 8; r++) for (let q = -1; q < 9; q++) {
        const x = -50 + q * 11.5 + (r % 2) * 5.7, y = 76 + r * 8.6;
        const col = (q + r) % 2 ? K.turq : K.carn;
        fillPoly(c, [[x, y - 3.4], [x + 3.4, y], [x, y + 3.4], [x - 3.4, y]], col, 0.92);
      }
    },
  }));
  // Oberkante: Lapisband mit Goldrosetten
  const railPts = [[-54, 88], [-42, 94], [-20, 104], [0, 120], [14, 134], [26, 139.5]];
  body.push(inlay([stroke2poly(railPts, 5.2)], K.lapis, { bevel: true }));
  const rosettes = [];
  for (let i = 1; i < railPts.length - 1; i++) rosettes.push(blob(railPts[i][0] + 1, railPts[i][1] + 0.4, 1.7, 1.7, 0, 12));
  body.push(gold(rosettes, { dir: 'v', gloss: false }));
  // Boden und Achslager
  body.push(gold([poly(rrect(-60, 64, 33, 71.5, 2, 4), 0)], { dir: 'v', gloss: false }));
  body.push(gold([rect(-34, 44, -26, 66)], { dir: 'v', gloss: false }));
  // Frontstütze (Kante vorn): Goldleiste
  body.push(gold([stroke2poly([[30, 72], [30.4, 124], [26, 140]], 3.4)], { dir: 'v', gloss: false }));
  const wA = wheelLayers(AX[0], AX[1], 'A');
  const ox = 9, oy = 3;
  const wB = wheelLayers(AX[0] + ox, AX[1] + oy, 'B');
  const parts = {
    radB: { z: 0, pivot: [AX[0] + ox, AX[1] + oy], layers: wB },
    body: { z: 1, layers: body },
    radA: { z: 2, pivot: [...AX], layers: wA },
  };
  return spec('streitwagen', 'Streitwagen des Königs', parts, { axle: [...AX], pole: [106, 92], floor: [-10, 71] },
    { lengthM: 2.0, ranges: { radA: [0, 6.283], radB: [0, 6.283] }, swing: { radA: [-6.283, 6.283], radB: [-6.283, 6.283] },
      desc: 'Zweirädriger Streitwagen aus Holz mit Goldauflage; Räder drehen um die Nabe (gegen den Uhrzeigersinn = Rückwärtsfahrt, im Uhrzeigersinn vorwärts)' }, { w: opts.w || 2.0 });
}
