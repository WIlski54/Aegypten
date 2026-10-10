// Gruppe S2 – Bauwerke (Teil 1): Obelisk, Tempelpylon, Papyrus-/Lotossäulen (Reihe), Mastaba.
// Frontalansicht, Basis y=0, Mitte x=0, Meter. Sandstein/Granit, bemalte Zierde (nur echte, einzelne Zeichen).
import {
  C, rect, trap, crumbleTop, archPoly, fr, clipTo, clipRect, shp, sideLight, vGrad, vignette, bricks, blocks, plaster, woodGrain, logEnds,
  glyph, glyphRow, star5, stripeBand, cavetto, torusH, torusV, starCeiling, jar, wallFigure, mk, opt,
  blob, limb, poly, mix, shade, rngOf, leaf, wavy, ribbon, spline, variantOf,
  fillPoly, fillPolys, fillGrad, strokePoly, curve, strokes, volume, line,
} from './_eg_arch_kit.js';

// ------------------------------------------------------------------------------------------------
// Granitspeckel (rosa Granit von Assuan)
function graniteSpeckle(c, x0, y0, x1, y1, seed, n = 260) {
  const rng = rngOf(seed, 3);
  for (let i = 0; i < n; i++) {
    const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0), r = 0.006 + rng() * 0.014;
    fillPoly(c, blob(x, y, r, r * 0.8, rng() * 3, 5), rng() < 0.5 ? 'rgba(60,25,20,.5)' : 'rgba(255,225,200,.45)');
  }
}

// ================================================================================================
// OBELISK ~4 m: rosa Granitnadel auf Sockel, zwei Seitenflächen (hell/dunkel), senkrechte Zierzeichen-Spalte, goldenes Pyramidion.
export function obelisk(o0 = {}) {
  const o = opt(o0);
  const yS = 0.4, yP = 3.55, yT = 4.0;                       // Sockelhöhe, Schaftende, Spitze
  const hwB = 0.27, hwT = 0.19;
  const base = [rect(-0.55, 0, 0.55, 0.16), rect(-0.45, 0.14, 0.45, 0.3), rect(-0.37, 0.28, 0.37, yS)];
  const shaftL = [[-hwB, yS], [0.0, yS], [0.0, yP], [-hwT, yP]];
  const shaftR = [[0.0, yS], [hwB, yS], [hwT, yP], [0.0, yP]];
  const pyrL = [[-hwT, yP], [0.0, yP], [0.0, yT + 0.2]], pyrR = [[0.0, yP], [hwT, yP], [0.0, yT + 0.2]];
  const col = (x) => (x < 0 ? C.graniteLt : C.graniteDk);
  const layers = [
    { // Sockel (Sandstein)
      shapes: base, fill: C.sand,
      deco(c) {
        blocks(c, -0.6, 0, 0.6, yS, { ch: 0.13, bw: 0.4, base: C.sand, seed: 4 });
        fr(c, -0.6, 0.14, 0.6, 0.155, 'rgba(60,30,10,.4)'); fr(c, -0.6, 0.285, 0.6, 0.3, 'rgba(60,30,10,.4)');
        sideLight(c, -0.6, 0, 0.6, yS, { left: 'rgba(255,240,200,.25)', right: 'rgba(60,30,0,.3)' });
      },
    },
    { // Schaft links (Licht) und rechts (Schatten)
      shapes: [shaftL], fill: { top: '#d08a70', bottom: '#b86e58' },
      deco(c) {
        graniteSpeckle(c, -hwB, yS, 0, yP, 1);
        fillGrad(c, shaftL, -hwB, 0, 0, 0, [[0, 'rgba(255,235,210,.25)'], [1, 'rgba(0,0,0,0)']]);
        // Zierzeichen-Spalte (vertieft, dunkelrot)
        const seq = ['sonne', 'wasser', 'ankh', 'feder', 'nb', 'schilf', 'djed', 'lotus', 'was'];
        for (let i = 0, y = yP - 0.18; y > yS + 0.25; i++, y -= 0.27) glyph(c, seq[i % seq.length], -0.1 + (y - yS) * 0.0045, y - 0.12, 0.2, 'rgba(95,40,30,.8)', 0.016);
        vGrad(c, -hwB, yS, 0, yS + 0.5, 'rgba(0,0,0,0)', 'rgba(40,10,0,.22)');
      },
    },
    {
      shapes: [shaftR], fill: { top: '#a6604b', bottom: '#8a4a3a' },
      deco(c) {
        graniteSpeckle(c, 0, yS, hwB, yP, 2);
        const seq = ['ankh', 'djed', 'sonne', 'wellen', 'was', 'nb', 'feder'];
        for (let i = 0, y = yP - 0.18; y > yS + 0.25; i++, y -= 0.27) glyph(c, seq[i % seq.length], 0.1 - (y - yS) * 0.0045, y - 0.12, 0.2, 'rgba(50,15,10,.75)', 0.016);
        fillGrad(c, shaftR, 0, 0, hwB, 0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(30,5,0,.3)']]);
        vGrad(c, 0, yS, hwB, yS + 0.5, 'rgba(0,0,0,0)', 'rgba(40,10,0,.22)');
      },
    },
    { // Pyramidion (Gold), Seitenflächen
      shapes: [pyrL, pyrR], fill: C.gold,
      deco(c) {
        fillPoly(c, pyrL, '#f6d060'); fillPoly(c, pyrR, '#b98a2a');
        fillPoly(c, [[-hwT + 0.03, yP], [-0.02, yP], [-0.01, yT - 0.05]], 'rgba(255,248,200,.7)');
        line(c, [[0, yP], [0, yT + 0.2]], '#8a5f1c', 0.01, { alpha: 0.7 });
        fr(c, -hwT, yP, hwT, yP + 0.012, 'rgba(60,30,0,.5)');
      },
    },
  ];
  return mk('obelisk', 'Obelisk', { body: { z: 1, layers } }, { base: [0, 0], top: [0, yT + 0.2], pyramidion: [0, yP + 0.1] },
    { kind: 'monument', heightM: 4, note: 'Granitnadel, Zierzeichen als Dekor' }, { h: o.h ?? 4, floor: 0 });
}

// ================================================================================================
// TEMPEL_PYLON ~5 m hoch, ~6 m breit: Doppelturm-Tor mit Neigung (Böschung), Rundstab-Wulst an den Kanten, Hohlkehle oben,
// Flaggenmasten in Nischen, bemalte Götterreliefs (Zierde), geflügelte Sonnenscheibe über dem Tor.
export function tempel_pylon(o0 = {}) {
  const o = opt(o0);
  const hTow = 3.95, hGate = 3.4;
  const tL = (xb0, xb1, xt0, xt1, yt) => trap(xb0, xb1, 0, xt0, xt1, yt);
  const towerL = tL(-3.1, -0.78, -2.75, -0.78, hTow), towerR = tL(0.78, 3.1, 0.78, 2.75, hTow);
  const lintelP = rect(-0.95, 2.55, 0.95, hGate);
  const cornTow = [rect(-2.95, hTow - 0.02, -0.7, hTow + 0.3), rect(0.7, hTow - 0.02, 2.95, hTow + 0.3)];
  const cornGate = rect(-1.05, hGate - 0.02, 1.05, hGate + 0.26);
  const xs = (x) => x; // lesbar
  const taper = (y) => 0.16 * (y / hTow);                   // Böschung: Einrückung an Höhe y
  const layers = [
    { // Türme + Torsturz
      shapes: [towerL, towerR, lintelP], fill: C.sand,
      deco(c) {
        blocks(c, -3.1, 0, 3.1, hTow, { ch: 0.34, bw: 0.85, base: '#dcbd80', seed: 11, vary: 0.13 });
        // Lichtseite links, Schatten rechts je Turm
        for (const [a, b] of [[-3.0, -0.78], [0.78, 3.0]]) sideLight(c, a, 0, b, hTow, { left: 'rgba(255,240,200,.22)', right: 'rgba(60,30,0,.26)' });
        vGrad(c, -3.1, 0, 3.1, 0.7, 'rgba(0,0,0,0)', 'rgba(70,40,10,.25)');
      },
    },
    { // Rundstab-Wulst an den Turmkanten (außen geneigt, innen senkrecht)
      shapes: [[[-3.1, 0], [-2.98, 0], [-2.63, hTow], [-2.75, hTow]], [[-0.9, 0], [-0.78, 0], [-0.78, hTow], [-0.9, hTow]], [[0.78, 0], [0.9, 0], [0.9, hTow], [0.78, hTow]], [[3.1, 0], [2.98, 0], [2.63, hTow], [2.75, hTow]]], fill: C.sand,
      deco(c) { for (const [a, b] of [[-3.12, -2.6], [-0.9, -0.76], [0.76, 0.9], [2.6, 3.12]]) torusV(c, a, b, 0, hTow, { base: '#e0c488' }); },
    },
    { // Hohlkehle oben
      shapes: [...cornTow, cornGate], fill: C.sand,
      deco(c) {
        for (const [a, b, y0, y1] of [[-2.95, -0.7, hTow - 0.02, hTow + 0.3], [0.7, 2.95, hTow - 0.02, hTow + 0.3], [-1.1, 1.1, hGate - 0.02, hGate + 0.26]]) cavetto(c, a, y0, b, y1, { cols: [C.turq, C.lapis, C.carn, C.gold], step: 0.1 });
      },
    },
    { // Relieffelder (Zierde) auf den Türmen
      shapes: [rect(-2.4, 0.75, -1.38, 3.3), rect(1.38, 0.75, 2.4, 3.3)], fill: '#f0dfb0',
      deco(c) {
        for (const [x0, x1, dir, kind, hold] of [[-2.4, -1.38, 1, 'horus', 'ankh'], [1.38, 2.4, -1, 'isis', 'ankh']]) {
          fr(c, x0, 0.75, x1, 3.3, '#efdcaa');
          plaster(c, x0, 0.75, x1, 3.3, '#efdcaa', { seed: 6 + dir, alpha: 0.12, n: 25 });
          wallFigure(c, (x0 + x1) / 2 + dir * 0.1, 0.95, 1.9, kind, { dir, hold });
          // Rahmen: Lapis + Gold
          for (const [d, col] of [[0, C.lapis], [0.05, C.gold]]) { strokePoly(c, rect(x0 + d + 0.02, 0.77 + d, x1 - d - 0.02, 3.28 - d), col, 0.045); }
          // Zierzeichen-Streifen oben
          glyph(c, 'sonne', (x0 + x1) / 2, 3.0, 0.2, C.goldDk, 0.02);
        }
      },
    },
    { // Mastnischen
      shapes: [rect(-2.62, 0.5, -2.46, 3.7), rect(-1.32, 0.5, -1.16, 3.7), rect(1.16, 0.5, 1.32, 3.7), rect(2.46, 0.5, 2.62, 3.7)], fill: '#8a6a3c',
      deco(c) {
        for (const x of [-2.54, -1.24, 1.24, 2.54]) { fr(c, x - 0.08, 0.5, x + 0.08, 3.7, '#6a4a28'); fr(c, x - 0.08, 0.5, x + 0.08, 0.56, 'rgba(255,230,170,.3)'); fr(c, x - 0.08, 3.55, x + 0.08, 3.7, 'rgba(0,0,0,.25)'); fr(c, x - 0.085, 0.5, x - 0.07, 3.7, 'rgba(255,235,190,.5)'); }
      },
    },
    { // Torsturz-Relief: geflügelte Sonnenscheibe
      shapes: [rect(-0.85, 2.7, 0.85, 3.3)], fill: C.lapis,
      deco(c) {
        fr(c, -0.85, 2.7, 0.85, 3.3, C.lapisDk); fr(c, -0.85, 2.7, 0.85, 3.3, 'rgba(255,255,255,.04)');
        const cy = 3.02;
        // Flügel: Federreihen (Gold/Rot/Blau)
        for (const s of [-1, 1]) {
          const rows = [[C.gold, 0.0, 0.1, 0.78], [C.carn, 0.0, 0.0, 0.7], [C.turq, 0.0, -0.1, 0.6]];
          rows.forEach(([col, dx, dy, len]) => {
            for (let k = 0; k < 6; k++) { const xx = s * (0.13 + k * 0.1 * len); fillPoly(c, [[xx, cy + dy + 0.02], [xx + s * 0.1, cy + dy + 0.03 - k * 0.002], [xx + s * 0.09, cy + dy - 0.1], [xx, cy + dy - 0.1]], col); strokePoly(c, [[xx, cy + dy + 0.02], [xx + s * 0.1, cy + dy + 0.03 - k * 0.002], [xx + s * 0.09, cy + dy - 0.1], [xx, cy + dy - 0.1]], 'rgba(20,20,40,.5)', 0.008); }
          });
        }
        fillPoly(c, blob(0, cy, 0.16, 0.16, 0, 20), C.carn); strokePoly(c, blob(0, cy, 0.16, 0.16, 0, 20), C.gold, 0.03);
        fillPoly(c, blob(0, cy, 0.1, 0.1, 0, 16), '#e86a3c');
        for (const s of [-1, 1]) { const q = limb([[s * 0.17, cy - 0.02, 0.04], [s * 0.26, cy - 0.12, 0.035], [s * 0.3, cy - 0.2, 0.02]], { per: 5 }); fillPoly(c, q, C.nile); }
        strokePoly(c, rect(-0.85, 2.7, 0.85, 3.3), C.gold, 0.03);
      },
    },
  ];
  // Fahnenmasten (Zedernholz) mit Wimpeln ragen über die Türme
  const poleX = [-2.54, -1.24, 1.24, 2.54];
  const poles = poleX.map((x) => rect(x - 0.045, 0.4, x + 0.045, 4.72));
  const flags = poleX.map((x, i) => {
    const d = x < 0 ? 1 : -1, y0 = 4.62 - (i % 2) * 0.1;
    return poly([[x, y0], [x + d * 0.26, y0 + 0.02], [x + d * 0.55, y0 - 0.06], [x + d * 0.8, y0 - 0.02], [x + d * 0.55, y0 - 0.13], [x + d * 0.3, y0 - 0.19], [x + d * 0.0, y0 - 0.17]], 1);
  });
  layers.push({
    shapes: poles, fill: C.wood,
    deco(c) { for (const x of poleX) { woodGrain(c, x - 0.05, 0.4, x + 0.05, 4.72, '#8a5a32', { dir: 'v', n: 4, seed: 3 }); fr(c, x - 0.045, 0.4, x - 0.03, 4.72, 'rgba(255,230,170,.35)'); fr(c, x + 0.03, 0.4, x + 0.045, 4.72, 'rgba(30,10,0,.35)'); } for (const x of poleX) fr(c, x - 0.07, 4.66, x + 0.07, 4.72, C.gold); },
  });
  layers.push({
    shapes: flags, fill: C.carn,
    deco(c) { flags.forEach((f, i) => { const cols = [C.carn, C.lapis, C.gold, C.turq]; fillPoly(c, f, cols[i % 4]); fillGrad(c, f, 0, 4.7, 0, 4.4, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(0,0,0,.25)']]); }); },
  });
  return mk('tempel_pylon', 'Tempelpylon', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, tor: [0, 0], torOben: [0, 2.55] },
    { kind: 'building', heightM: 5, note: 'Tor zwischen den Türmen offen (Seite dahinter sichtbar)' }, { h: o.h ?? 5, floor: 0 });
}

// ================================================================================================
// SÄULEN (Papyrusbündelsäule, Lotosknospensäule): 3,5 m hoch, optionale Reihe. variant:{ n: 4 } = Anzahl Säulen (Standard 4),
// n:1 = Einzelsäule. Eine gemeinsame Architrav-Balkenzeile (Sandstein, bemaltes Zierband) liegt auf den Kapitellen.
function column(id, name, o0, kind) {
  const o = opt(o0);
  const n = Math.max(1, Math.round(o.n ?? 4));
  const pitch = 1.45;
  const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * pitch);
  const pap = kind === 'papyrus';
  const yB = 0.14, yS1 = 2.45, yCap1 = 3.2, yAb = yCap1 + 0.14, yArch = yAb + 0.2;
  const shaftW = pap ? [[0.14, 0.42], [0.55, 0.52], [1.3, 0.56], [2.0, 0.5], [yS1 + 0.02, 0.44]] : [[0.14, 0.4], [0.5, 0.5], [1.3, 0.54], [2.0, 0.48], [yS1 + 0.02, 0.4]];
  const shaft = (x) => limb(shaftW.map(([y, w]) => [x, y, w]), { per: 8, caps: false });
  const hwAt = (y) => { for (let i = 0; i < shaftW.length - 1; i++) { const [y0, w0] = shaftW[i], [y1, w1] = shaftW[i + 1]; if (y >= y0 && y <= y1) return (w0 + (w1 - w0) * ((y - y0) / (y1 - y0))) / 2; } return 0.22; };
  const baseP = xs.map((x) => [[x - 0.34, 0], [x + 0.34, 0], [x + 0.3, yB + 0.02], [x - 0.3, yB + 0.02]]);
  const bell = (x) => limb([[x, yS1 - 0.02, 0.42], [x, yS1 + 0.18, 0.5], [x, yS1 + 0.42, 0.7], [x, yS1 + 0.64, 0.9], [x, yCap1, 1.0]], { per: 8, caps: false });
  const sepals = (x) => poly([[x - 0.26, yS1 - 0.02], [x + 0.26, yS1 - 0.02], [x + 0.24, yS1 + 0.3], [x, yS1 + 0.38], [x - 0.24, yS1 + 0.3]], 1);
  const budC = (x) => limb([[x, yS1 + 0.12, 0.3], [x, yS1 + 0.3, 0.46], [x, yS1 + 0.52, 0.4], [x, yS1 + 0.68, 0.22], [x, yCap1, 0.0]], { per: 8, caps: false });
  const budS = (x, s) => limb([[x + s * 0.12, yS1 + 0.1, 0.22], [x + s * 0.24, yS1 + 0.28, 0.3], [x + s * 0.34, yS1 + 0.5, 0.26], [x + s * 0.4, yS1 + 0.66, 0.1], [x + s * 0.42, yS1 + 0.72, 0.0]], { per: 8, caps: false });
  const abHalf = pap ? 0.54 : 0.4;
  const abacus = xs.map((x) => rect(x - abHalf, yCap1 - 0.02, x + abHalf, yAb));
  const x0 = xs[0] - 0.8, x1 = xs[n - 1] + 0.8;
  const arch = rect(x0, yAb - 0.01, x1, yArch);
  const g1 = pap ? ['#6cae52', '#4c8a3e'] : ['#4aa88a', '#2f8a6c'];
  const layers = [
    { shapes: baseP, fill: C.black, deco(c) { for (const x of xs) { fr(c, x - 0.38, 0, x + 0.38, yB + 0.02, '#2a2420'); fr(c, x - 0.36, yB - 0.03, x + 0.36, yB + 0.02, 'rgba(255,255,255,.18)'); } } },
    {
      shapes: xs.map(shaft), fill: { top: '#7fbd5e', bottom: '#4c8a3e' },
      deco(c) {
        for (const x of xs) {
          const lobes = 6, hw0 = 0.3;
          for (let i = 0; i < lobes; i++) {
            const t = (i + 0.5) / lobes, xx = x - hw0 + t * hw0 * 2;
            // Stängel als Zickzack-Dreikant: abwechselnd hell/dunkel
            fr(c, xx - hw0 / lobes, yB, xx + hw0 / lobes, yS1, i % 2 ? g1[0] : g1[1], 0.6);
            strokes(c, [[xx - hw0 / lobes, yB + 0.4, xx - hw0 / lobes, yS1 - 0.2]], 'rgba(20,50,20,.5)', 0.012, 1);
          }
          fillGrad(c, rect(x - 0.34, yB, x + 0.34, yS1), x - 0.3, 0, x + 0.3, 0, [[0, 'rgba(255,255,220,.32)'], [0.35, 'rgba(255,255,255,0)'], [1, 'rgba(10,40,20,.5)']]);
          for (let i = 0; i < 7; i++) { const xx = x - 0.24 + i * 0.08; fillPoly(c, [[xx - 0.045, yB], [xx + 0.045, yB], [xx, yB + 0.38]], i % 2 ? C.gold : C.carn); strokePoly(c, [[xx - 0.045, yB], [xx + 0.045, yB], [xx, yB + 0.38]], 'rgba(60,30,10,.5)', 0.01); }
          for (const [yy, hh, col] of [[2.2, 0.04, C.lapis], [2.27, 0.05, C.carn], [2.34, 0.05, C.lapis], [2.41, 0.04, C.gold]]) { fr(c, x - 0.26, yy, x + 0.26, yy + hh, col); fr(c, x - 0.26, yy, x + 0.26, yy + 0.01, 'rgba(0,0,0,.3)'); }
          fr(c, x - hwAt(1.3) - 0.01, 1.2, x + hwAt(1.3) + 0.01, 1.25, C.lapis); fr(c, x - hwAt(1.3) - 0.01, 1.25, x + hwAt(1.3) + 0.01, 1.28, C.gold);
          glyph(c, pap ? 'schilf' : 'lotus', x, 1.5, 0.3, 'rgba(255,240,170,.9)', 0.02);
        }
      },
    },
  ];
  if (pap) {
    layers.push({
      shapes: xs.map(bell), fill: { top: '#79b85a', bottom: '#3f7e3a' },
      deco(c) {
        for (const x of xs) {
          // Doldenblätter: fächerförmige Rippen vom Hals zum Rand, Farbwechsel
          const K = 9;
          for (let i = 0; i < K; i++) {
            const t0 = i / K, t1 = (i + 1) / K, xa = x - 0.5 + t0 * 1.0, xb = x - 0.5 + t1 * 1.0;
            fillPoly(c, [[x - 0.21 + t0 * 0.42, yS1], [x - 0.21 + t1 * 0.42, yS1], [xb, yCap1 + 0.02], [xa, yCap1 + 0.02]], i % 2 ? '#8ccb62' : '#3f8a46', 0.8);
            line(c, [[x - 0.21 + t0 * 0.42, yS1], [xa, yCap1]], 'rgba(10,50,25,.55)', 0.012);
          }
          fillGrad(c, rect(x - 0.5, yS1, x + 0.5, yCap1), x - 0.5, 0, x + 0.5, 0, [[0, 'rgba(255,255,210,.3)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(10,40,20,.45)']]);
          // Randband
          fr(c, x - 0.52, yCap1 - 0.09, x + 0.52, yCap1 - 0.04, C.gold); fr(c, x - 0.52, yCap1 - 0.04, x + 0.52, yCap1 + 0.02, C.carn);
          for (let i = 0; i < 8; i++) fillPoly(c, [[x - 0.45 + i * 0.12, yCap1 - 0.09], [x - 0.35 + i * 0.12, yCap1 - 0.09], [x - 0.4 + i * 0.12, yCap1 - 0.22]], i % 2 ? C.lapis : C.turq, 0.9);
        }
      },
    });
  } else {
    layers.push({ shapes: xs.map(sepals), fill: C.nile, deco(c) { for (const x of xs) { for (let i = 0; i < 5; i++) { const xx = x - 0.2 + i * 0.1; fillPoly(c, [[xx - 0.05, yS1 - 0.02], [xx + 0.05, yS1 - 0.02], [xx, yS1 + 0.36]], i % 2 ? '#4aa86a' : '#2a7a4c'); } fillGrad(c, rect(x - 0.3, yS1, x + 0.3, yS1 + 0.4), x - 0.3, 0, x + 0.3, 0, [[0, 'rgba(255,255,255,.2)'], [1, 'rgba(0,30,10,.35)']]); } } });
    layers.push({
      shapes: xs.flatMap((x) => [budS(x, -1), budS(x, 1)]), fill: { top: '#7fb4de', bottom: '#2a5aa0' },
      deco(c) { for (const x of xs) for (const s of [-1, 1]) { line(c, [[x + s * 0.2, yS1 + 0.2], [x + s * 0.36, yS1 + 0.5], [x + s * 0.41, yS1 + 0.7]], 'rgba(255,255,255,.7)', 0.012); line(c, [[x + s * 0.3, yS1 + 0.2], [x + s * 0.4, yS1 + 0.5]], 'rgba(10,30,90,.5)', 0.012); } fillGrad(c, rect(x0, yS1, x1, yS1 + 0.8), x0, 0, x1, 0, [[0, 'rgba(255,255,255,.1)'], [1, 'rgba(0,0,40,.2)']]); },
    });
    layers.push({
      shapes: xs.map(budC), fill: { top: '#a8cdee', bottom: '#2f66b0' },
      deco(c) {
        for (const x of xs) {
          for (const k of [-1, 0, 1]) line(c, [[x + k * 0.07, yS1 + 0.3], [x + k * 0.09, yS1 + 0.55], [x + k * 0.02, yCap1 - 0.02]], k === 0 ? 'rgba(255,255,255,.75)' : 'rgba(10,40,110,.45)', 0.014);
          fillGrad(c, rect(x - 0.25, yS1, x + 0.25, yCap1), x - 0.25, 0, x + 0.25, 0, [[0, 'rgba(255,255,255,.3)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,20,80,.4)']]);
          for (const [yy, col] of [[yS1 + 0.12, C.carn], [yS1 + 0.18, C.gold]]) fr(c, x - 0.16, yy, x + 0.16, yy + 0.05, col);
        }
      },
    });
  }
  layers.push({ shapes: abacus, fill: C.sand, deco(c) { for (const x of xs) blocks(c, x - abHalf - 0.01, yCap1 - 0.03, x + abHalf + 0.01, yAb, { ch: 0.16, bw: 1.2, base: C.sand, seed: 9 }); } });
  layers.push({
    shapes: [arch], fill: C.sand,
    deco(c) {
      blocks(c, x0 - 0.1, yAb - 0.02, x1 + 0.1, yArch, { ch: 0.2, bw: 1.6, base: '#dcbd80', seed: 12 });
      fr(c, x0, yAb + 0.03, x1, yArch - 0.03, C.lapis);
      glyphRow(c, x0 + 0.1, x1 - 0.1, yAb + 0.04, 0.12, ['ankh', 'djed', 'was'], C.gold, { pitch: 0.26, lw: 0.016 });
      fr(c, x0, yArch - 0.03, x1, yArch, C.gold); fr(c, x0, yAb - 0.02, x1, yAb + 0.03, C.gold);
      sideLight(c, x0, yAb, x1, yArch, { left: 'rgba(255,240,200,.15)', right: 'rgba(40,20,0,.2)' });
    },
  });
  return mk(id, name, { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, first: [xs[0], 0], last: [xs[n - 1], 0] },
    { kind: 'building', heightM: 3.5, n, note: 'variant:{n:Anzahl}; n=1 Einzelsäule; len/w skaliert die ganze Reihe' }, { h: o.h ?? 3.5, w: o.len ?? o.w, floor: 0 });
}
export const saeule_papyrus = (o) => column('saeule_papyrus', 'Papyrusbündelsäule', o, 'papyrus');
export const saeule_lotus = (o) => column('saeule_lotus', 'Lotosknospensäule', o, 'lotus');

// ================================================================================================
// MASTABA: flaches Bankgrab, 2,5 m lang, ~1,2 m hoch; Lehmziegel (weiß getüncht), Nischenfassade, Scheintür, Opferplatte.
export function mastaba(o0 = {}) {
  const o = opt(o0);
  const W = 2.5, H = 1.1;
  const body = trap(-W / 2, W / 2, 0, -W / 2 + 0.14, W / 2 - 0.14, H);
  const cap = rect(-W / 2 + 0.12, H - 0.04, W / 2 - 0.12, H + 0.06);
  const layers = [
    {
      shapes: [body, cap], fill: '#d9b98a',
      deco(c) {
        bricks(c, -1.4, 0, 1.4, H + 0.1, { bw: 0.24, bh: 0.1, base: '#d6b484', seed: 5, vary: 0.12, mortar: '#a98458' });
        fr(c, -1.4, 0.2, 1.4, 0.26, 'rgba(255,248,225,.5)'); // Putzband
        // Nischenfassade: schmale Vertiefungen im Wechsel
        const fx = [-1.0, -0.8, -0.6, 0.6, 0.8, 1.0];
        for (const x of fx) { fr(c, x - 0.045, 0.3, x + 0.045, 0.98, '#7d5a38'); fr(c, x - 0.045, 0.3, x - 0.035, 0.98, 'rgba(255,240,200,.35)'); fr(c, x - 0.045, 0.94, x + 0.045, 0.98, 'rgba(0,0,0,.3)'); }
        // Scheintür in der Mitte
        fr(c, -0.3, 0.0, 0.3, 0.82, '#4a2e1a'); fr(c, -0.24, 0.0, 0.24, 0.76, '#2a1a10');
        fr(c, -0.3, 0.0, -0.24, 0.82, C.carn); fr(c, 0.24, 0.0, 0.3, 0.82, C.carn); fr(c, -0.3, 0.76, 0.3, 0.82, C.carn);
        fr(c, -0.2, 0.84, 0.2, 0.92, C.lapis); // Rolle (Türsturz)
        fr(c, -0.2, 0.84, 0.2, 0.86, 'rgba(255,255,255,.3)');
        glyph(c, 'ankh', 0, 0.12, 0.28, C.gold, 0.02);
        fillGrad(c, body, 0, 0, W, 0, [[0, 'rgba(255,245,210,.25)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(50,25,0,.3)']]);
        vGrad(c, -1.4, 0, 1.4, 0.4, 'rgba(0,0,0,0)', 'rgba(70,40,10,.25)');
        fr(c, -1.4, H - 0.05, 1.4, H + 0.06, 'rgba(255,240,200,.35)');
      },
    },
    { // Opferplatte
      shapes: [rect(-0.4, 0, 0.4, 0.07), rect(-0.28, 0.06, 0.28, 0.11)], fill: C.sand,
      deco(c) { blocks(c, -0.42, 0, 0.42, 0.12, { ch: 0.06, bw: 0.3, base: '#e0c488', seed: 2 }); },
    },
  ];
  return mk('mastaba', 'Mastaba', { body: { z: 1, layers } }, { base: [0, 0], top: [0, H + 0.06], tuer: [0, 0.4] },
    { kind: 'monument', lengthM: 2.5, note: 'Bankgrab mit Scheintür' }, { w: o.w ?? W, floor: 0 });
}
