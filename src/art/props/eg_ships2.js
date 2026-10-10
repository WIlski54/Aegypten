// Gruppe S2 – Schiffe (Teil 2): Sonnenbarke des Ra, griechisches Handelsschiff von Alexandria.
import {
  C, rect, fr, cavetto, woodGrain, glyph, mk, opt,
  blob, limb, poly, spline,
  fillPoly, fillGrad, strokePoly, line,
} from './_eg_arch_kit.js';
import { yAt, hullPoly, umbel } from './eg_ships.js';

// ================================================================================================
// SONNENBARKE ~3 m: goldener Rumpf mit Papyrus-Dolden an Bug und Heck, Schrein, Sonnenscheibe (Part `sonne`, Pivot in der Mitte),
// Steuerruder (Part `ruder`). Freies Deck rechts vom Schrein für Figuren (Ra u. a.).
export function sonnenbarke(o0 = {}) {
  const o = opt(o0);
  const hull = hullPoly([[-1.5, 0.62], [-1.15, 0.2], [-0.5, 0.04], [0.4, 0.04], [1.05, 0.2], [1.5, 0.6]],
    [[-1.55, 0.92], [-1.1, 0.58], [-0.4, 0.48], [0.4, 0.48], [1.05, 0.56], [1.55, 0.92]]);
  const bow = limb([[1.42, 0.7, 0.2], [1.62, 1.05, 0.15], [1.68, 1.45, 0.12], [1.55, 1.78, 0.1]], { per: 6 });
  const stern = limb([[-1.42, 0.7, 0.2], [-1.62, 1.05, 0.15], [-1.68, 1.45, 0.12], [-1.55, 1.78, 0.1]], { per: 6 });
  const bowU = umbel(1.55, 1.8, 1.0, 0.34, 9, 2.4), sternU = umbel(-1.55, 1.8, 2.14, 0.34, 9, 2.4);
  const hullLayer = {
    shapes: [hull.poly], fill: { top: '#f0c85a', bottom: '#b88a2c' },
    deco(c) {
      const lerpLine = (k) => hull.B.map(([x, y]) => [x, y + (yAt(hull.T, x) - y) * k]);
      const band = (k0, k1, col) => fillPoly(c, lerpLine(k1).concat(lerpLine(k0).slice().reverse()), col);
      band(0.62, 0.9, C.lapis); band(0.9, 1.0, '#f8dc7c'); band(0.52, 0.62, C.carn); band(0.44, 0.52, C.turq);
      for (let x = -1.45; x < 1.45; x += 0.2) { const yb = yAt(hull.B, x), yt = yAt(hull.T, x), ym = yb + (yt - yb) * 0.76; fillPoly(c, [[x, ym], [x + 0.06, ym + 0.05], [x + 0.12, ym], [x + 0.06, ym - 0.05]], C.gold); }
      fillGrad(c, hull.poly, 0, 0.9, 0, 0, [[0, 'rgba(255,248,200,.3)'], [1, 'rgba(90,50,0,.35)']]);
      line(c, lerpLine(0.99), 'rgba(110,70,10,.6)', 0.014);
      glyph(c, 'auge', 0.8, 0.1, 0.26, C.black, 0.018);
    },
  };
  const endsLayer = {
    shapes: [bow, stern, ...bowU, ...sternU], fill: { top: '#f0c85a', bottom: '#c0922c' },
    deco(c) {
      for (const s of [-1, 1]) {
        const ux = s * 1.55, uy = 1.8;
        fillGrad(c, [[ux - 0.4, uy - 0.05], [ux + 0.4, uy - 0.05], [ux + 0.4, uy + 0.45], [ux - 0.4, uy + 0.45]], 0, uy + 0.4, 0, uy, [[0, 'rgba(70,170,110,.6)'], [1, 'rgba(70,170,110,0)']]);
        for (const [y, col] of [[0.95, C.lapis], [1.05, C.carn], [1.58, C.turq]]) fr(c, s * 1.66 - 0.12, y, s * 1.66 + 0.12, y + 0.05, col);
      }
    },
  };
  const shrine = [rect(-1.0, 0.48, -0.25, 1.02), rect(-1.06, 1.0, -0.19, 1.1)];
  const shrineLayer = {
    shapes: shrine, fill: C.gold,
    deco(c) {
      fr(c, -1.0, 0.48, -0.25, 1.02, '#f0c85a'); fr(c, -0.9, 0.5, -0.35, 0.92, '#3a2418'); fr(c, -0.9, 0.5, -0.35, 0.92, 'rgba(255,220,120,.12)');
      cavetto(c, -1.06, 1.0, -0.19, 1.1, { base: C.gold, cols: [C.lapis, C.carn, C.turq], step: 0.07 });
      glyph(c, 'ankh', -0.62, 0.55, 0.3, C.gold, 0.02);
      fillGrad(c, shrine[0], -1.0, 0, -0.25, 0, [[0, 'rgba(255,255,255,.3)'], [1, 'rgba(70,40,0,.3)']]);
    },
  };
  const dcx = -0.62, dcy = 1.75, R = 0.42;
  const standLayer = { shapes: [rect(dcx - 0.07, 1.1, dcx + 0.07, dcy - 0.3)], fill: C.gold, deco(c) { fr(c, dcx - 0.1, 1.1, dcx + 0.1, dcy, '#e0b040'); fr(c, dcx - 0.07, 1.1, dcx - 0.03, dcy - 0.3, 'rgba(255,255,255,.4)'); } };
  const uraeus = limb([[dcx + 0.02, dcy + R - 0.02, 0.1], [dcx + 0.12, dcy + R + 0.1, 0.09], [dcx + 0.1, dcy + R + 0.2, 0.07]], { per: 5 });
  const disc = blob(dcx, dcy, R, R, 0, 40);
  const sonne = {
    z: 2, pivot: [dcx, dcy],
    layers: [{
      shapes: [disc, uraeus, blob(dcx + 0.1, dcy + R + 0.22, 0.07, 0.06, 0, 12)], fill: C.gold,
      deco(c) {
        fillPoly(c, disc, '#f0c85a');
        const inner = blob(dcx, dcy, R * 0.8, R * 0.8, 0, 36);
        fillPoly(c, inner, '#d8412b');
        fillGrad(c, inner, dcx - 0.3, dcy + 0.3, dcx + 0.3, dcy - 0.3, [[0, 'rgba(255,200,150,.5)'], [1, 'rgba(120,10,0,.35)']]);
        strokePoly(c, inner, '#fff0b3', 0.02);
        fillPoly(c, blob(dcx - 0.12, dcy + 0.14, 0.09, 0.05, 0.6, 12), 'rgba(255,255,255,.4)');
        fillPoly(c, blob(dcx + 0.11, dcy + R + 0.23, 0.07, 0.06, 0, 12), '#f0c85a'); fillPoly(c, blob(dcx + 0.13, dcy + R + 0.24, 0.012, 0.012, 0, 6), '#1c1816');
      },
    }],
  };
  const rpiv = [-1.62, 1.05];
  const ruder = {
    z: 4, pivot: rpiv,
    layers: [{
      shapes: [limb([[rpiv[0], rpiv[1] + 0.12, 0.08], [rpiv[0] - 0.12, 0.7, 0.08], [rpiv[0] - 0.3, 0.32, 0.08]], { per: 5 }), poly([[rpiv[0] - 0.22, 0.42], [rpiv[0] - 0.52, -0.02], [rpiv[0] - 0.34, -0.06], [rpiv[0] - 0.12, 0.26]], 1), blob(rpiv[0], rpiv[1] + 0.15, 0.1, 0.1, 0, 14)], fill: C.gold,
      deco(c) {
        fr(c, -2.4, -0.1, -1.4, 1.4, '#e8bd4c');
        fillPoly(c, [[rpiv[0] - 0.2, 0.4], [rpiv[0] - 0.46, 0.02], [rpiv[0] - 0.34, -0.01], [rpiv[0] - 0.14, 0.28]], C.lapis, 0.9);
        fillGrad(c, [[-2.4, -0.1], [-1.4, -0.1], [-1.4, 1.4], [-2.4, 1.4]], -2.4, 0, -1.4, 0, [[0, 'rgba(255,255,255,.3)'], [1, 'rgba(80,40,0,.25)']]);
      },
    }],
  };
  return mk('sonnenbarke', 'Sonnenbarke des Ra', { body: { z: 1, layers: [hullLayer, endsLayer, shrineLayer, standLayer] }, sonne, ruder },
    { base: [0, 0], deck: [0.35, 0.5], mitte: [0.35, 0.5], scheibe: [dcx, dcy], bug: [1.6, 1.0], heck: [-1.6, 1.0], top: { rel: [0.5, 1] } },
    { kind: 'boat', lengthM: 3, ranges: { sonne: [0, Math.PI], ruder: [0, 0.35] }, note: 'Freies Deck rechts vom Schrein (x ≈ -0.1 … 1.1) für Figuren; sonne dreht um ihre Mitte' }, { w: o.len ?? 3.3 });
}

// ================================================================================================
// SEGELSCHIFF_GRIECHISCH ~4 m: Handelsschiff der Ptolemäerzeit (Alexandria): bauchiger Holzrumpf mit Schwanenhals-Heck (Gänsekopf),
// Bug mit Auge und Artemon (Vorsegel), großes Rahsegel (Part `sail`, Pivot Rah-Mitte) mit Rot-Streifen, Steuerruder (Part `ruder`).
export function segelschiff_griechisch(o0 = {}) {
  const o = opt(o0);
  const hull = hullPoly([[-1.9, 0.95], [-1.6, 0.28], [-0.8, 0.05], [0.4, 0.0], [1.3, 0.1], [1.85, 0.42], [2.1, 0.78]],
    [[-1.95, 1.4], [-1.7, 0.95], [-1.0, 0.76], [0.3, 0.72], [1.3, 0.8], [1.9, 0.95], [2.18, 1.05]]);
  const stern = limb([[-1.85, 1.2, 0.2], [-2.05, 1.6, 0.16], [-1.95, 2.05, 0.13], [-1.65, 2.2, 0.1], [-1.45, 2.1, 0.09]], { per: 6 });
  const gooseHead = [blob(-1.4, 2.06, 0.1, 0.08, 0.3, 14), poly([[-1.34, 2.08], [-1.16, 2.0], [-1.18, 1.96], [-1.34, 2.0]], 0)];
  const bow = limb([[2.0, 0.95, 0.2], [2.2, 1.12, 0.14], [2.3, 1.32, 0.1]], { per: 5 });
  const mastX = 0.3, mastTop = 3.15, yardY = 2.95;
  const deckhouse = [rect(-1.5, 0.76, -0.85, 1.35)], roofP = [[-1.6, 1.32], [-0.75, 1.32], [-0.98, 1.62], [-1.37, 1.62]];
  const layers = [
    {
      shapes: [hull.poly], fill: { top: '#c08850', bottom: '#8a5a30' },
      deco(c) {
        const lerpLine = (k) => hull.B.map(([x, y]) => [x, y + (yAt(hull.T, x) - y) * k]);
        const band = (k0, k1, col) => fillPoly(c, lerpLine(k1).concat(lerpLine(k0).slice().reverse()), col);
        band(0.0, 0.3, '#2a2220'); band(0.3, 0.34, '#f6efe0'); band(0.7, 0.84, C.carn); band(0.84, 0.88, '#f6efe0'); band(0.88, 1.0, '#2a2220');
        for (const k of [0.45, 0.58]) line(c, lerpLine(k), 'rgba(50,25,8,.4)', 0.01);
        fillGrad(c, hull.poly, 0, 1.4, 0, 0, [[0, 'rgba(255,240,200,.18)'], [1, 'rgba(30,10,0,.3)']]);
        fillPoly(c, blob(1.58, 0.5, 0.11, 0.075, 0.1, 16), '#fff8e6'); fillPoly(c, blob(1.6, 0.5, 0.05, 0.05, 0, 12), C.lapis); fillPoly(c, blob(1.6, 0.5, 0.025, 0.025, 0, 8), '#1c1816');
        strokePoly(c, blob(1.58, 0.5, 0.11, 0.075, 0.1, 16), '#1c1816', 0.012);
      },
    },
    {
      shapes: [stern, ...gooseHead, bow], fill: '#b07c48',
      deco(c) {
        woodGrain(c, -2.2, 0.9, 2.4, 2.3, '#b07c48', { n: 14, seed: 5 }); fillPoly(c, blob(-1.4, 2.06, 0.1, 0.08, 0.3, 14), '#f6efe0'); fillPoly(c, blob(-1.43, 2.08, 0.015, 0.015, 0, 8), '#1c1816');
        fillPoly(c, [[-1.34, 2.08], [-1.16, 2.0], [-1.18, 1.96], [-1.34, 2.0]], C.gold);
        for (const [x, y] of [[-1.98, 1.65], [-2.0, 1.9]]) fr(c, x - 0.1, y, x + 0.1, y + 0.04, C.carn);
        fr(c, 2.12, 1.05, 2.3, 1.1, C.gold);
      },
    },
    {
      shapes: [...deckhouse, poly(roofP, 0)], fill: '#d9c08a',
      deco(c) {
        fr(c, -1.5, 0.76, -0.85, 1.32, '#e6d3a0'); fr(c, -1.3, 0.76, -1.05, 1.15, '#3a2a1a'); strokePoly(c, rect(-1.3, 0.76, -1.05, 1.15), '#7a4a28', 0.025);
        fillPoly(c, roofP, '#c8553a'); for (let k = 0; k < 4; k++) line(c, [[-1.6 + k * 0.05, 1.32 + k * 0.08], [-0.75 - k * 0.05, 1.32 + k * 0.08]], 'rgba(80,20,10,.5)', 0.012);
        fillGrad(c, roofP, 0, 1.62, 0, 1.3, [[0, 'rgba(255,220,180,.3)'], [1, 'rgba(60,10,0,.2)']]);
      },
    },
    {
      shapes: [rect(mastX - 0.05, 0.7, mastX + 0.05, mastTop), limb([[1.55, 0.9, 0.06], [1.95, 1.6, 0.05], [2.3, 2.1, 0.04]], { per: 5 }), poly([[1.62, 1.1], [2.28, 2.06], [2.1, 1.1]], 0)], fill: C.woodLt,
      deco(c) {
        woodGrain(c, mastX - 0.06, 0.7, mastX + 0.06, mastTop, '#a8744a', { dir: 'v', n: 5 }); fr(c, mastX - 0.1, mastTop - 0.1, mastX + 0.1, mastTop + 0.02, C.gold);
        fillPoly(c, [[1.7, 1.15], [2.22, 1.98], [2.08, 1.15]], '#f6efe0'); strokePoly(c, [[1.7, 1.15], [2.22, 1.98], [2.08, 1.15]], 'rgba(90,60,30,.5)', 0.01);
        fillPoly(c, [[1.78, 1.2], [2.1, 1.7], [2.05, 1.2]], 'rgba(192,67,46,.8)');
      },
    },
  ];
  const sw = 1.05, sb = 1.35;
  const sailP = poly([[mastX - sw, yardY], [mastX + sw, yardY], [mastX + sw * 1.04, (yardY + sb) / 2 + 0.03], [mastX + sw * 0.96, sb], [mastX, sb - 0.1], [mastX - sw * 0.96, sb], [mastX - sw * 1.04, (yardY + sb) / 2 + 0.03]], 1);
  const topsail = [[mastX - sw * 0.45, yardY + 0.02], [mastX, mastTop - 0.05], [mastX + sw * 0.45, yardY + 0.02]];
  const sail = {
    z: 3, pivot: [mastX, yardY],
    layers: [{
      shapes: [sailP, poly(topsail, 0)], fill: '#f7edd0',
      deco(c) {
        for (let i = -4; i <= 4; i++) if (i % 2 === 0) fr(c, mastX + i * 0.22 - 0.1, sb - 0.1, mastX + i * 0.22 + 0.1, yardY + 0.05, C.carn, 0.9);
        for (let x = mastX - sw; x < mastX + sw; x += 0.22) line(c, [[x, yardY], [x + 0.01, sb]], 'rgba(120,95,60,.4)', 0.008);
        for (const k of [0.35, 0.65]) line(c, [[mastX - sw, yardY - (yardY - sb) * k], [mastX + sw, yardY - (yardY - sb) * k]], 'rgba(120,95,60,.35)', 0.008);
        fillGrad(c, sailP, mastX - sw, 0, mastX + sw, 0, [[0, 'rgba(255,255,255,.3)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(90,60,20,.3)']]);
        fillPoly(c, topsail, '#fbf4de'); strokePoly(c, topsail, 'rgba(90,60,30,.5)', 0.01); fillPoly(c, [[mastX - 0.15, yardY + 0.1], [mastX + 0.15, yardY + 0.1], [mastX, mastTop - 0.2]], C.lapis, 0.85);
      },
    }, {
      shapes: [rect(mastX - sw * 1.12, yardY - 0.02, mastX + sw * 1.12, yardY + 0.07), rect(mastX - sw * 1.0, sb - 0.05, mastX + sw * 1.0, sb + 0.02)], fill: '#a8744a',
      deco(c) { woodGrain(c, mastX - 1.2, yardY - 0.02, mastX + 1.2, yardY + 0.07, '#a8744a', { n: 6 }); woodGrain(c, mastX - 1.1, sb - 0.05, mastX + 1.1, sb + 0.02, '#a8744a', { n: 6, seed: 3 }); },
    }],
  };
  const rpiv = [-1.78, 1.2];
  const ruder = {
    z: 4, pivot: rpiv,
    layers: [{
      shapes: [limb([[rpiv[0], rpiv[1] + 0.2, 0.07], [rpiv[0] - 0.15, 0.85, 0.08], [rpiv[0] - 0.35, 0.4, 0.08]], { per: 5 }), poly([[rpiv[0] - 0.25, 0.5], [rpiv[0] - 0.56, 0.0], [rpiv[0] - 0.38, -0.05], [rpiv[0] - 0.14, 0.3]], 1)], fill: C.woodLt,
      deco(c) { woodGrain(c, -2.6, -0.1, -1.5, 1.5, '#b07c48', { dir: 'v', n: 8, seed: 4 }); fillPoly(c, [[rpiv[0] - 0.22, 0.46], [rpiv[0] - 0.5, 0.02], [rpiv[0] - 0.38, -0.02], [rpiv[0] - 0.16, 0.32]], '#2a2220', 0.55); },
    }],
  };
  return mk('segelschiff_griechisch', 'Griechisches Handelsschiff', { body: { z: 1, layers }, sail, ruder },
    { base: [0, 0], deck: [0.4, 0.78], mast: [mastX, mastTop], segel: [mastX, yardY], bug: [2.25, 1.2], heck: [-1.9, 1.3], top: { rel: [0.5, 1] } },
    { kind: 'boat', lengthM: 4, ranges: { sail: [0, 0.1], ruder: [0, 0.35] }, note: 'Segel breit gezeigt (Seitenansicht-Konvention)' }, { w: o.len ?? 4.4 });
}
