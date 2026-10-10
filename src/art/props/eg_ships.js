// Gruppe S2 – Schiffe (Seitenansicht, schauen nach +x, Rumpfunterkante y=0 = Wasserlinie):
// Papyrusboot, Nil-Segelboot (Part sail, ruder), Sonnenbarke des Ra (Parts sonne, ruder), griechisches Handelsschiff (sail, ruder).
import {
  C, rect, trap, fr, clipTo, shp, sideLight, vGrad, plaster, woodGrain, glyph, stripeBand, mk, opt,
  blob, limb, poly, mix, shade, rngOf, leaf, wavy, spline,
  fillPoly, fillPolys, fillGrad, strokePoly, curve, strokes, line,
} from './_eg_arch_kit.js';

// y einer Spline (x aufsteigend) an Stelle x
export function yAt(S, x) {
  for (let i = 0; i < S.length - 1; i++) { const a = S[i], b = S[i + 1]; if ((x >= a[0] && x <= b[0]) || (x <= a[0] && x >= b[0])) { const t = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t; } }
  return x < S[0][0] ? S[0][1] : S[S.length - 1][1];
}
/** Rumpfpolygon aus Boden- und Oberlinie (Kontrollpunkte [x,y], x aufsteigend). */
export function hullPoly(bot, top, per = 8) {
  const B = spline(bot.map(([x, y]) => [x, y, 0]), per), T = spline(top.map(([x, y]) => [x, y, 0]), per);
  return { poly: B.map(([x, y]) => [x, y]).concat(T.slice().reverse().map(([x, y]) => [x, y])), B, T };
}
// Papyrus-Dolde (Schiffsenden): Fächer aus Blättern
export function umbel(x, y, a, R, n = 9, spread = 2.2) {
  const out = [];
  for (let i = 0; i < n; i++) { const t = n === 1 ? 0.5 : i / (n - 1); out.push(leaf(x, y, a - spread / 2 + spread * t, R, R * 0.2, { fat: 0.4, curve: (t - 0.5) * 0.2 })); }
  out.push(blob(x, y, R * 0.14, R * 0.14, 0, 10));
  return out;
}

// ================================================================================================
// SCHILFBOOT ~3,5 m: Papyrusboot aus drei verschnürten Bündeln, hochgezogener Bug und Heck mit Dolden, rote Schnürung.
export function schilfboot(o0 = {}) {
  const o = opt(o0);
  const L = 1.75;
  const curveY = (t, off) => 0.12 + off + 0.72 * Math.pow(Math.abs(t), 2.3);
  const pts = (off, tmax, n = 19) => Array.from({ length: n }, (_, i) => { const t = -tmax + (2 * tmax * i) / (n - 1); return [L * t, curveY(t, off)]; });
  const mkStrand = (off, tmax, w) => limb(pts(off, tmax).map(([x, y], i, arr) => { const k = Math.abs(i - (arr.length - 1) / 2) / ((arr.length - 1) / 2); return [x, y, w * (1 - 0.5 * Math.pow(k, 2))]; }), { per: 4 });
  const defs = [[0.0, 0.86, 0.28, '#c8b058', '#a38d3e'], [0.2, 0.95, 0.26, '#d6c068', '#b09a48'], [0.4, 1.0, 0.24, '#e0cc78', '#b8a24c']];
  const fillLens = poly(pts(0, 0.86).map(([x, y]) => [x, y - 0.1]).concat(pts(0.4, 1.0).slice().reverse().map(([x, y]) => [x, y + 0.1])), 0);
  const layers = [{ shapes: [fillLens], fill: '#a8903e', deco(c) { fillGrad(c, fillLens, 0, 1.2, 0, 0, [[0, 'rgba(255,240,170,.2)'], [1, 'rgba(60,40,10,.3)']]); } }].concat(defs.map(([off, tm, w, ct, cb], i) => ({
    shapes: [mkStrand(off, tm, w)], fill: { top: ct, bottom: cb },
    deco(c) {
      for (const k of [-0.3, 0.3]) line(c, pts(off, tm * 0.98).map(([x, y]) => [x, y + w * k * 0.5]), 'rgba(90,70,20,.45)', 0.01);
      line(c, pts(off, tm * 0.98).map(([x, y]) => [x, y + w * 0.32]), 'rgba(255,248,200,.5)', 0.014);
      // Querriefen
      const P = pts(off, tm, 60); const rr = rngOf(i + 3, 2);
      for (let k = 2; k < P.length - 2; k += 2) strokes(c, [[P[k][0], P[k][1] - w * 0.4, P[k][0] + 0.03, P[k][1] + w * 0.4]], 'rgba(80,60,20,.2)', 0.008, 1);
      fillGrad(c, [[-L * 1.1, -1], [L * 1.1, -1], [L * 1.1, 3], [-L * 1.1, 3]], 0, off + 0.3, 0, off - 0.1, [[0, 'rgba(255,248,200,.15)'], [1, 'rgba(60,40,10,.25)']]);
    },
  })));
  // Schnürung: rote Bänder quer über die drei Bündel, plus Kreuzwicklung an den Enden
  const lash = [];
  const lt = [-0.8, -0.58, -0.36, -0.12, 0.12, 0.36, 0.58, 0.8];
  for (const t of lt) { const x = L * t, y0 = curveY(t, 0) - 0.1, y1 = curveY(t, 0.32) + 0.1; const s = 0.4 * Math.abs(t); lash.push([[x - 0.035 - s * 0.02, y0], [x + 0.035 - s * 0.02, y0], [x + 0.035 + s * 0.04, y1], [x - 0.035 + s * 0.04, y1]]); }
  layers.push({
    shapes: lash, fill: '#a8452c',
    deco(c) { for (const q of lash) { strokePoly(c, q, 'rgba(50,15,5,.5)', 0.008); const [a, b, d, e] = q; line(c, [[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.03], [(d[0] + e[0]) / 2, (d[1] + e[1]) / 2 - 0.02]], 'rgba(255,200,170,.5)', 0.01); } fillPolys(c, lash, '#b5502f', 0.0); },
  });
  // Enden: Fächer-Dolden an Bug und Heck, Halteleinen
  const tipB = [L, curveY(1, 0.4)], tipS = [-L, curveY(1, 0.4)];
  layers.push({
    shapes: [...umbel(tipB[0] + 0.04, tipB[1] + 0.02, Math.PI / 2 + 0.5, 0.34, 7, 1.7), ...umbel(tipS[0] - 0.04, tipS[1] + 0.02, Math.PI / 2 - 0.5, 0.34, 7, 1.7)],
    fill: { top: '#a9c25a', bottom: '#5b9a4b' },
    deco(c) { for (const [x, y, d] of [[tipB[0], tipB[1], 1], [tipS[0], tipS[1], -1]]) { fillGrad(c, [[x - 0.6, y - 0.1], [x + 0.6, y - 0.1], [x + 0.6, y + 0.6], [x - 0.6, y + 0.6]], 0, y + 0.5, 0, y, [[0, 'rgba(255,255,200,.3)'], [1, 'rgba(10,50,20,.25)']]); strokePoly(c, blob(x + d * 0.04, y + 0.04, 0.04, 0.04, 0, 8), '#a8452c', 0.015); } },
  });
  return mk('schilfboot', 'Papyrusboot', { body: { z: 1, layers } }, { base: [0, 0.1], deck: [0, 0.6], bug: [L, curveY(1, 0.3)], heck: [-L, curveY(1, 0.3)], stand: [0, 0.5] },
    { kind: 'boat', lengthM: 3.5, note: 'Papyrusbündel mit Schnürung; Deck bei y≈0.5' }, { w: o.len ?? 3.5 });
}

// ================================================================================================
// SEGELBOOT_NIL ~4 m: Holzrumpf mit bemaltem Band, Wedjat-Auge am Bug, Papyrus-Heckpfosten, Schilfhütte, Mast mit Tau.
// Parts: body (Rumpf, Mast, Takelage), sail (Rahsegel mit Rah und Baum; Pivot = Mastspitze, wölbt sich durch scale.x / leichte Rotation),
// ruder (Steuerruder am Heck; Pivot am Ruderlager).
export function segelboot_nil(o0 = {}) {
  const o = opt(o0);
  const hull = hullPoly([[-1.85, 0.72], [-1.5, 0.22], [-0.8, 0.04], [0.2, 0.0], [1.1, 0.07], [1.75, 0.3], [2.0, 0.62]],
    [[-1.9, 1.05], [-1.5, 0.74], [-0.8, 0.62], [0.2, 0.6], [1.1, 0.66], [1.7, 0.78], [2.05, 0.9]]);
  const mastX = 0.2, mastTop = 2.55, yardY = 2.45, sailB = 1.15, sailHalf = 0.88;
  const bow = limb([[1.95, 0.7, 0.14], [2.1, 0.95, 0.1], [2.12, 1.15, 0.07]], { per: 5 });
  const bowFlower = umbel(2.12, 1.15, Math.PI / 2 + 0.3, 0.22, 6, 1.5);
  const stern = limb([[-1.85, 0.85, 0.16], [-1.98, 1.15, 0.12], [-1.92, 1.45, 0.09], [-1.78, 1.65, 0.07]], { per: 5 });
  const sternFlower = umbel(-1.78, 1.65, -0.9 + Math.PI / 2 - 0.5, 0.24, 6, 1.6);
  const mast = rect(mastX - 0.045, 0.5, mastX + 0.045, mastTop);
  const hut = [[-1.4, 0.6], [-0.55, 0.6], [-0.55, 1.1], [-0.75, 1.25], [-1.2, 1.25], [-1.4, 1.1]];
  const layers = [
    { // Rumpf
      shapes: [hull.poly], fill: { top: '#b87a44', bottom: '#8a5530' },
      deco(c) {
        const topY = (x) => yAt(hull.T, x);
        // Planken
        for (const k of [0.25, 0.5, 0.72]) line(c, hull.B.map(([x, y]) => [x, y + (yAt(hull.T, x) - y) * k]), 'rgba(50,25,8,.4)', 0.01);
        // Zierband unter der Reling: Türkis, Rot, Weiß
        const band = (k0, k1, col) => { const up = hull.B.filter((_, i) => i % 1 === 0).map(([x, y]) => [x, y + (yAt(hull.T, x) - y) * k1]), dn = hull.B.map(([x, y]) => [x, y + (yAt(hull.T, x) - y) * k0]); fillPoly(c, up.concat(dn.slice().reverse()), col); };
        band(0.72, 0.99, C.turq); band(0.64, 0.72, '#f6efe0'); band(0.56, 0.64, C.carn);
        fillGrad(c, hull.poly, 0, 0.9, 0, 0, [[0, 'rgba(255,240,200,.15)'], [1, 'rgba(30,10,0,.35)']]);
        // Wedjat-Auge am Bug
        glyph(c, 'auge', 1.52, 0.2, 0.42, C.black, 0.022);
        for (const x of [-1.1, -0.45, 0.2, 0.85, 1.4]) { fr(c, x - 0.012, 0.65, x + 0.012, 0.75, 'rgba(255,255,255,.0)'); }
        // Rotes Ruderlager am Heck
      },
    },
    { // Bug- und Heckpfosten (Papyrusbündel) + Dolden
      shapes: [bow, stern, ...bowFlower, ...sternFlower], fill: { top: '#d6c068', bottom: '#a8903e' },
      deco(c) {
        for (const [x, y, ang] of [[2.12, 1.15, 1.0], [-1.78, 1.65, 1.0]]) fillGrad(c, [[x - 0.4, y - 0.05], [x + 0.4, y - 0.05], [x + 0.4, y + 0.4], [x - 0.4, y + 0.4]], 0, y + 0.4, 0, y, [[0, 'rgba(160,210,90,.55)'], [1, 'rgba(160,210,90,.0)']]);
        for (const [x0, y0, x1, y1] of [[2.1, 0.8, 2.12, 1.1], [-1.9, 0.95, -1.95, 1.4]]) line(c, [[x0 - 0.04, y0], [x1 - 0.04, y1]], 'rgba(90,70,20,.5)', 0.01);
        for (const [x, y] of [[2.1, 0.92], [-1.92, 1.1]]) { fr(c, x - 0.1, y, x + 0.1, y + 0.04, '#a8452c'); }
      },
    },
    { // Schilfhütte am Heck
      shapes: [poly(hut, 1)], fill: '#d9bd6a',
      deco(c) {
        for (let x = -1.45; x < -0.5; x += 0.06) line(c, [[x, 0.6], [x + 0.02, 1.3]], 'rgba(110,80,25,.3)', 0.008);
        fillPoly(c, [[-1.05, 0.6], [-0.7, 0.6], [-0.7, 0.98], [-1.05, 0.98]], '#3a2a1a');
        fr(c, -1.4, 1.08, -0.55, 1.11, '#a8452c');
        fillGrad(c, poly(hut, 1), -1.4, 0, -0.55, 0, [[0, 'rgba(255,245,200,.25)'], [1, 'rgba(60,30,0,.3)']]);
      },
    },
    { // Mast
      shapes: [mast, rect(mastX - 0.1, mastTop - 0.12, mastX + 0.1, mastTop + 0.03), limb([[mastX, mastTop - 0.1, 0.03], [1.1, 1.8, 0.03], [2.05, 1.14, 0.03]], { per: 4 }), limb([[mastX, mastTop - 0.1, 0.03], [-0.8, 2.0, 0.03], [-1.8, 1.62, 0.03]], { per: 4 })], fill: C.woodLt,
      deco(c) { woodGrain(c, mastX - 0.06, 0.5, mastX + 0.06, mastTop, '#a8744a', { dir: 'v', n: 5 }); fr(c, mastX - 0.1, mastTop - 0.12, mastX + 0.1, mastTop - 0.08, C.gold); fr(c, mastX - 0.045, 0.5, mastX - 0.03, mastTop, 'rgba(255,235,190,.35)'); fr(c, mastX + 0.03, 0.5, mastX + 0.045, mastTop, 'rgba(30,10,0,.35)'); },
    },
  ];
  // Rah-Segel: leicht gewölbt (Bug-seitig bauchig)
  const sw = sailHalf;
  const sail = poly([[mastX - sw, yardY], [mastX - sw * 0.4, yardY + 0.02], [mastX + sw * 0.4, yardY + 0.02], [mastX + sw, yardY], [mastX + sw * 1.02, (yardY + sailB) / 2 + 0.03], [mastX + sw * 0.98, sailB], [mastX + sw * 0.3, sailB - 0.08], [mastX - sw * 0.3, sailB - 0.08], [mastX - sw * 0.98, sailB], [mastX - sw * 1.02, (yardY + sailB) / 2 + 0.03]], 1);
  const sailPart = {
    z: 3, pivot: [mastX, yardY],
    layers: [{
      shapes: [sail], fill: { top: '#fbf4de', bottom: '#e9dcb8' },
      deco(c) {
        // Nähte (senkrechte Bahnen) und blau/rote Randborte
        for (let x = mastX - sw; x < mastX + sw; x += 0.23) line(c, [[x, yardY], [x + 0.01, sailB]], 'rgba(120,95,60,.35)', 0.008);
        fr(c, mastX - sw * 1.1, yardY - 0.12, mastX + sw * 1.1, yardY - 0.06, C.carn); fr(c, mastX - sw * 1.1, yardY - 0.06, mastX + sw * 1.1, yardY - 0.03, C.lapis);
        fr(c, mastX - sw * 1.1, sailB + 0.07, mastX + sw * 1.1, sailB + 0.16, C.lapis); fr(c, mastX - sw * 1.1, sailB + 0.16, mastX + sw * 1.1, sailB + 0.22, C.carn);
        fillGrad(c, sail, mastX - sw, 0, mastX + sw, 0, [[0, 'rgba(255,255,255,.35)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(90,60,20,.28)']]);
        glyph(c, 'sonne', mastX, (yardY + sailB) / 2 - 0.2, 0.4, 'rgba(192,67,46,.8)', 0.03);
      },
    }, { // Rah (oben) und Baum (unten)
      shapes: [rect(mastX - sw * 1.12, yardY, mastX + sw * 1.12, yardY + 0.07), rect(mastX - sw * 1.1, sailB - 0.06, mastX + sw * 1.1, sailB + 0.01)], fill: '#a8744a',
      deco(c) { woodGrain(c, mastX - 1.1, yardY, mastX + 1.1, yardY + 0.07, '#a8744a', { n: 6, seed: 2 }); woodGrain(c, mastX - 1.1, sailB - 0.06, mastX + 1.1, sailB + 0.01, '#a8744a', { n: 6, seed: 3 }); },
    }],
  };
  // Steuerruder (großes Ruder am Heck, schräg nach unten/hinten)
  const rpiv = [-1.82, 1.05];
  const ruder = {
    z: 4, pivot: rpiv,
    layers: [{
      shapes: [limb([[rpiv[0], rpiv[1] + 0.18, 0.06], [rpiv[0] - 0.12, 0.75, 0.07], [rpiv[0] - 0.3, 0.35, 0.07]], { per: 5 }), poly([[rpiv[0] - 0.22, 0.45], [rpiv[0] - 0.5, 0.0], [rpiv[0] - 0.36, -0.05], [rpiv[0] - 0.12, 0.28]], 1)], fill: C.woodLt,
      deco(c) { woodGrain(c, -2.4, -0.1, -1.6, 1.3, '#b07c48', { dir: 'v', n: 8, seed: 4 }); fillPoly(c, [[rpiv[0] - 0.2, 0.42], [rpiv[0] - 0.42, 0.06], [rpiv[0] - 0.33, 0.04], [rpiv[0] - 0.14, 0.32]], C.turq, 0.8); },
    }],
  };
    return mk('segelboot_nil', 'Nil-Segelboot', { body: { z: 1, layers }, sail: sailPart, ruder },
    { base: [0, 0], deck: [0, 0.65], mast: [mastX, mastTop], segel: [mastX, yardY], bug: [2.1, 1.1], heck: [-1.85, 1.0] },
    { kind: 'boat', lengthM: 4, ranges: { sail: [0, 0.1], ruder: [0, 0.35] }, note: 'sail: Pivot an der Rah-Mitte (Mastspitze); wölben per scale.x 1→1.12 oder Rotation' },
    { w: o.len ?? 4 });
}
