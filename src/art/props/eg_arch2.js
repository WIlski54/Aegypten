// Gruppe S2 – Bauwerke (Teil 2): Schaduf, Nilometer, Grabtreppe, Ziegelmauer, Hafen-Kulisse.
import {
  C, rect, trap, crumbleTop, archPoly, fr, clipTo, shp, sideLight, vGrad, vignette, bricks, blocks, plaster, woodGrain, logEnds,
  glyph, glyphRow, stripeBand, cavetto, torusH, jar, mk, opt,
  blob, limb, poly, mix, shade, rngOf, leaf, wavy, ribbon, spline, variantOf,
  fillPoly, fillPolys, fillGrad, strokePoly, curve, strokes, volume, line,
} from './_eg_arch_kit.js';

// Wellenlinien (hell) auf Wasserflächen
function waterLines(c, x0, x1, y0, y1, seed = 1, col = 'rgba(255,255,255,.45)') {
  const rng = rngOf(seed, 9);
  for (let y = y0 + 0.08; y < y1; y += 0.14) {
    for (let x = x0 + rng() * 0.5; x < x1; x += 0.6 + rng() * 0.8) { const l = 0.25 + rng() * 0.4; curve(c, [[x, y], [x + l * 0.5, y + 0.03], [x + l, y]], col, 0.014, { alpha: 1 }); }
  }
}

// ================================================================================================
// SCHADUF (Schwengelbrunnen) ~3 m: Lehmziegelpfosten mit Gabel, langer Schwengel (Part `arm`, Pivot an der Gabel, Gegengewicht aus
// Lehm links), Seil + Lederei mer (Part `eimer`, Pivot am Schwengelende). Positive Winkel = rechtes Ende hoch.
// Kinematik: Schwengelende bei Winkel a: tip = pivot + R(a)·(tipLocal); eimer.position = tip - tipRest (alles in Modellmetern * Skalierung).
export function schaduf(o0 = {}) {
  const o = opt(o0);
  const piv = [0, 2.35], tipX = 1.75, tipY = 2.38;
  const pillar = poly([[-0.34, 0.18], [0.34, 0.18], [0.27, 2.2], [-0.27, 2.2]], 0);
  const fork = [rect(-0.34, 2.15, 0.34, 2.32), poly([[-0.34, 2.32], [-0.2, 2.32], [-0.12, 2.5], [-0.27, 2.5]], 0), poly([[0.2, 2.32], [0.34, 2.32], [0.27, 2.5], [0.12, 2.5]], 0)];
  const mound = poly([[-1.2, 0], [-0.9, 0.12], [-0.5, 0.2], [0.5, 0.2], [0.9, 0.12], [1.2, 0]], 1);
  const bodyLayers = [
    { shapes: [mound], fill: '#b99a62', deco(c) { plaster(c, -1.3, 0, 1.3, 0.3, '#b99a62', { seed: 4, n: 12, alpha: 0.2 }); for (let i = 0; i < 14; i++) fillPoly(c, blob(-1.0 + i * 0.15, 0.08, 0.05, 0.03, 0, 6), i % 2 ? 'rgba(255,240,200,.5)' : 'rgba(80,50,20,.4)'); } },
    {
      shapes: [pillar], fill: C.mud,
      deco(c) { bricks(c, -0.4, 0.15, 0.4, 2.25, { bw: 0.26, bh: 0.13, base: '#b9824f', seed: 7 }); sideLight(c, -0.34, 0.15, 0.34, 2.25, { left: 'rgba(255,240,200,.2)', right: 'rgba(40,15,0,.35)' }); vGrad(c, -0.4, 0.15, 0.4, 0.6, 'rgba(0,0,0,0)', 'rgba(50,30,10,.25)'); },
    },
    { shapes: fork, fill: C.woodLt, deco(c) { woodGrain(c, -0.4, 2.1, 0.4, 2.55, '#a8744a', { n: 8, seed: 3 }); fr(c, -0.34, 2.15, 0.34, 2.18, 'rgba(255,230,180,.4)'); } },
  ];
  // Schwengel: langer Balken (Holz), Gegengewicht (Lehmballen) links
  const armShape = limb([[-0.85, piv[1] + 0.02, 0.1], [0, piv[1], 0.13], [tipX, tipY, 0.075]], { per: 8 });
  const ball = blob(-1.0, piv[1] - 0.12, 0.32, 0.3, 0, 22);
  const arm = {
    z: 3, pivot: piv,
    layers: [{
      shapes: [armShape], fill: C.woodLt,
      deco(c) { woodGrain(c, -1, 2.2, 1.9, 2.6, '#a8744a', { n: 10, seed: 11 }); fr(c, -1, piv[1] + 0.02, 1.9, piv[1] + 0.06, 'rgba(255,230,180,.35)'); for (const x of [-0.6, 0.8, 1.45]) strokes(c, [[x, 2.28, x + 0.05, 2.5]], 'rgba(50,25,8,.4)', 0.012, 1); },
    }, {
      shapes: [ball], fill: '#9a6c40',
      deco(c) { plaster(c, -1.4, 2.0, -0.6, 2.6, '#a4764a', { seed: 5, n: 12, alpha: 0.25 }); fillGrad(c, ball, -1.3, 0, -0.7, 0, [[0, 'rgba(255,230,190,.3)'], [1, 'rgba(40,15,0,.35)']]); for (let k = 0; k < 4; k++) curve(c, [[-1.25, 2.1 + k * 0.1], [-1.0, 2.04 + k * 0.1], [-0.75, 2.1 + k * 0.1]], 'rgba(60,30,10,.4)', 0.014, { alpha: 1 }); },
    }, { // Lagerzapfen
      shapes: [blob(piv[0], piv[1], 0.09, 0.09, 0, 12)], fill: '#4a2e1a', deco(c) { fillPoly(c, blob(piv[0], piv[1], 0.05, 0.05, 0, 10), '#e0b040'); },
    }],
  };
  // Eimer an Seil: Pivot am Schwengelende
  const rope = limb([[tipX, tipY, 0.04], [tipX, tipY - 0.55, 0.035], [tipX, 1.55, 0.035]], { per: 4 });
  const bucket = poly([[tipX - 0.26, 1.55], [tipX + 0.26, 1.55], [tipX + 0.2, 1.05], [tipX - 0.2, 1.05]], 1);
  const eimer = {
    z: 4, pivot: [tipX, tipY],
    layers: [{
      shapes: [rope], fill: '#6a4a2a', deco(c) { fr(c, tipX - 0.05, 1.5, tipX + 0.05, 2.4, '#7a5832'); },
    }, {
      shapes: [bucket, blob(tipX, 1.58, 0.28, 0.05, 0, 14)], fill: { top: '#a8683a', bottom: '#7a4a28' },
      deco(c) {
        fr(c, tipX - 0.3, 1.05, tipX + 0.3, 1.6, '#9a6038');
        for (const y of [1.25, 1.45]) fr(c, tipX - 0.3, y, tipX + 0.3, y + 0.035, '#4a2e1a');
        fillGrad(c, bucket, tipX - 0.26, 0, tipX + 0.26, 0, [[0, 'rgba(255,230,190,.3)'], [1, 'rgba(40,15,0,.35)']]);
        fillPoly(c, blob(tipX, 1.58, 0.24, 0.035, 0, 14), '#2a2218');
      },
    }],
  };
  return mk('schaduf', 'Schaduf (Schwengelbrunnen)', { body: { z: 1, layers: bodyLayers }, arm, eimer },
    { base: [0, 0], pivot: piv, tip: [tipX, tipY], eimerRuhe: [tipX, 1.05], gegengewicht: [-1.0, piv[1] - 0.12], top: { rel: [0.5, 1] } },
    { kind: 'tool', heightM: 3, ranges: { arm: [0, -0.5], eimer: [0, 0] }, note: 'arm: negativ = Eimerseite (rechts) senkt sich; ±0.5 rad. eimer hängt am Schwengelende: Seite setzt eimer.position auf die Spitze (anchors.tip) und dreht ihn gegen arm' },
    { h: o.h ?? 3, floor: null, baseY: true });
}

// ================================================================================================
// NILOMETER ~3 m: Schnitt durch einen Treppenbrunnen: Quaderwände, Stufen an der rechten Wand, Wasser unten, an der linken Wand die
// Messskala (Part `marken`: Elle-Streifen mit Strichen; ohne Zahlen, nur Zierstriche).
export function nilometer(o0 = {}) {
  const o = opt(o0);
  const W = 2.4, H = 3.0;
  const wallL = rect(0, 0, 0.5, 2.75), wallR = rect(1.9, 0, W, 2.75), floor = rect(0, 0, W, 0.3);
  const capL = rect(-0.1, 2.7, 0.6, 2.95), capR = rect(1.8, 2.7, W + 0.1, 2.95);
  // Treppe an der rechten Innenwand: von oben rechts nach unten links ins Wasser
  const nSt = 9, sx0 = 1.0, sx1 = 1.9, sy0 = 0.62, sy1 = 2.7;
  const stairs = [[sx1, sy1], [sx1, 0.3]];
  for (let i = nSt - 1; i >= 0; i--) { const xa = sx0 + ((sx1 - sx0) / nSt) * i, yt = sy0 + ((sy1 - sy0) / nSt) * (i + 0.0) * 1.0; stairs.push([xa + (sx1 - sx0) / nSt, yt + (sy1 - sy0) / nSt * 0.0]); stairs.push([xa, yt]); }
  // sauber aufbauen: Stufe i hat Trittfläche bei y_i (i=0 unten links)
  const st = [[sx0, 0.3], [sx1, 0.3], [sx1, sy1]];
  for (let i = nSt - 1; i >= 0; i--) { const y = sy0 + ((sy1 - sy0) / nSt) * i; const xa = sx0 + ((sx1 - sx0) / nSt) * i; const xb = xa + (sx1 - sx0) / nSt; st.push([xb, y + (sy1 - sy0) / nSt]); st.push([xb, y]); st.push([xa, y]); }
  const layers = [
    { // Rückwand (Schatten) – bildet den Brunnenhintergrund
      shapes: [rect(0.4, 0.2, 2.0, 2.76)], fill: '#3d6068',
      deco(c) {
        blocks(c, 0.4, 0.2, 2.0, 2.76, { ch: 0.28, bw: 0.55, base: '#4a6e72', seed: 14, vary: 0.12, joint: 'rgba(10,30,35,.6)' });
        fillGrad(c, rect(0.4, 0.2, 2.0, 2.76), 0, 2.76, 0, 0.2, [[0, 'rgba(255,245,200,.35)'], [0.35, 'rgba(255,245,200,.0)'], [1, 'rgba(0,15,30,.45)']]);
      },
    },
    { // Stufen (rechts) + Außenwände
      shapes: [st.length > 3 ? poly(st, 0) : poly([[0, 0]]), wallL, wallR, floor, capL, capR], fill: C.sand,
      deco(c) {
        blocks(c, -0.2, 0, 2.6, 3.0, { ch: 0.3, bw: 0.7, base: '#dcbd80', seed: 3, vary: 0.12 });
        sideLight(c, 0, 0, 0.5, 2.75, { left: 'rgba(255,240,200,.22)', right: 'rgba(60,30,0,.28)' });
        for (let i = 0; i < nSt; i++) { const y = sy0 + ((sy1 - sy0) / nSt) * (i + 1); const xa = sx0 + ((sx1 - sx0) / nSt) * i; fr(c, xa, y - 0.04, xa + (sx1 - sx0) / nSt, y, 'rgba(255,245,215,.6)'); fr(c, xa + (sx1 - sx0) / nSt - 0.02, y - (sy1 - sy0) / nSt, xa + (sx1 - sx0) / nSt, y, 'rgba(60,30,0,.35)'); }
        fr(c, -0.1, 2.7, 0.6, 2.75, 'rgba(60,30,0,.35)'); fr(c, 1.8, 2.7, 2.5, 2.75, 'rgba(60,30,0,.35)'); fr(c, -0.1, 2.91, 0.6, 2.95, 'rgba(255,245,215,.5)'); fr(c, 1.8, 2.91, 2.5, 2.95, 'rgba(255,245,215,.5)');
        vGrad(c, -0.2, 0, 2.6, 0.5, 'rgba(0,0,0,0)', 'rgba(70,40,10,.25)');
      },
    },
    { // Wasser
      shapes: [rect(0.45, 0.3, 1.95, 0.88)], fill: { top: '#4f9a78', bottom: '#2f6f5e' },
      deco(c) { waterLines(c, 0.45, 1.95, 0.3, 0.88, 3, 'rgba(230,255,235,.55)'); fillGrad(c, rect(0.45, 0.3, 1.95, 0.88), 0, 0.88, 0, 0.3, [[0, 'rgba(255,255,255,.2)'], [1, 'rgba(0,30,30,.3)']]); fr(c, 0.45, 0.84, 1.95, 0.88, 'rgba(255,255,255,.55)'); },
    },
  ];
  // Marken: linke Innenwand, 11 Elle-Felder, längere Striche an Vielfachen
  const mx0 = 0.5, mx1 = 0.92, my0 = 0.35, my1 = 2.62;
  const marken = {
    z: 3, layers: [{
      shapes: [rect(mx0, my0, mx1, my1)], fill: '#f0e2b8',
      deco(c) {
        fr(c, mx0, my0, mx1, my1, '#efe0b2'); plaster(c, mx0, my0, mx1, my1, '#efe0b2', { seed: 2, n: 14, alpha: 0.12 });
        const n = 11, step = (my1 - my0) / n;
        for (let i = 0; i <= n; i++) {
          const y = my0 + step * i, long = i % 2 === 0;
          fr(c, mx0, y - 0.012, mx0 + (long ? 0.32 : 0.2), y + 0.012, i % 4 === 0 ? C.carn : '#3a2a1a');
          if (i < n) fr(c, mx1 - 0.1, y + 0.02, mx1 - 0.03, y + step - 0.02, i % 2 ? C.lapis : '#f6efe0', 0.9);
        }
        fr(c, mx0, my0, mx0 + 0.02, my1, 'rgba(60,30,0,.4)');
        fillGrad(c, rect(mx0, my0, mx1, my1), mx0, 0, mx1, 0, [[0, 'rgba(60,30,0,.25)'], [1, 'rgba(255,255,255,.05)']]);
      },
    }],
  };
  return mk('nilometer', 'Nilometer (Treppenbrunnen)', { body: { z: 1, layers }, marken },
    { base: [W / 2, 0], wasser: [1.2, 0.85], marken: [(mx0 + mx1) / 2, my0], top: { rel: [0.5, 1] } },
    { kind: 'building', heightM: 3, note: 'Part marken = Messskala (linke Innenwand), Pegel y ≈ 0.85' }, { h: o.h ?? 3, floor: 0 });
}

// ================================================================================================
// GRABTREPPE ~3 m: Schnitt durch den Fels: Stufen führen von links oben hinab zum versiegelten Grabeingang (rechts unten).
// Part `tuer` = Putz-Verschluss mit Siegelabdrücken, Pivot unten Mitte; kippt zur Treppe (nach links/vorn): positive Rotation um z
// (Oberkante bewegt sich nach links), ranges.tuer = [0, 1.25]. Dahinter ein dunkler Gang mit Goldschimmer (im body).
export function grabtreppe(o0 = {}) {
  const o = opt(o0);
  const nSt = 11, x0 = 0.0, x1 = 1.75, yT = 2.35, yB = 0.4;
  const run = (x1 - x0) / nSt, rise = (yT - yB) / nSt;
  const rockP = [[0, 0], [3.0, 0], [3.0, 2.55], [2.6, 2.7], [2.15, 2.62], [1.95, 2.45], [1.95, yB]];
  for (let i = nSt - 1; i >= 0; i--) { rockP.push([x0 + run * (i + 1), yB + rise * i]); rockP.push([x0 + run * i, yB + rise * i]); }
  rockP.push([x0, yT]);
  const dx0 = 1.7, dx1 = 2.2, dy0 = yB, dy1 = 1.85;
  const layers = [
    {
      shapes: [poly(rockP, 0)], fill: { top: '#e0c08a', bottom: '#b8905a' },
      deco(c) {
        const rng = rngOf(7, 4);
        // Kalksteinschichten
        for (let y = 0.15; y < 2.8; y += 0.32 + rng() * 0.12) { curve(c, wavy(-0.2, 3.2, y, 0.02, 3 + rng() * 2, { n: 30, phase: rng() * 6 }), 'rgba(110,70,30,.5)', 0.016, { alpha: 1 }); curve(c, wavy(-0.2, 3.2, y - 0.03, 0.02, 3, { n: 30, phase: rng() * 6 }), 'rgba(255,240,200,.35)', 0.012, { alpha: 1 }); }
        for (let k = 0; k < 40; k++) { const x = rng() * 3, y = rng() * 2.6; fillPoly(c, blob(x, y, 0.025 + rng() * 0.04, 0.02 + rng() * 0.03, rng() * 3, 6), rng() < 0.5 ? 'rgba(255,240,200,.35)' : 'rgba(80,50,20,.3)'); }
        // Trittkanten
        for (let i = 0; i < nSt; i++) { const y = yB + rise * i, xa = x0 + run * i; fr(c, xa, y - 0.03, xa + run, y + 0.005, 'rgba(255,245,215,.7)'); fr(c, xa + run - 0.02, y - rise, xa + run, y, 'rgba(70,40,10,.4)'); }
        fillGrad(c, poly(rockP, 0), 0, 0, 3, 0, [[0, 'rgba(255,245,210,.2)'], [1, 'rgba(60,30,0,.28)']]);
        vGrad(c, -0.2, 0, 3.2, 0.6, 'rgba(0,0,0,0)', 'rgba(60,35,10,.25)');
        // dunkler Gang hinter der Tür
        fr(c, 1.95, yB, 2.75, 1.9, '#1a1210'); fr(c, 1.95, yB, 2.75, 1.9, 'rgba(0,0,0,.2)');
        fillGrad(c, rect(1.95, yB, 2.75, 1.9), 1.95, 0, 2.75, 0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(90,60,10,.5)']]);
        for (const [gx, gy, gr] of [[2.4, 0.7, 0.05], [2.55, 0.95, 0.04], [2.3, 1.1, 0.03], [2.6, 0.6, 0.03]]) fillPoly(c, blob(gx, gy, gr, gr, 0, 8), '#f0c850');
        strokePoly(c, rect(1.95, yB, 2.75, 1.9), '#6a4a28', 0.05);
        fr(c, 1.9, 1.9, 2.8, 2.0, '#7a5a38');
      },
    },
  ];
  const piv = [(dx0 + dx1) / 2 - 0.0, dy0];
  const doorP = rect(dx0, dy0, dx1, dy1);
  const tuer = {
    z: 4, pivot: piv,
    layers: [{
      shapes: [doorP], fill: '#e6d7b0',
      deco(c) {
        plaster(c, dx0, dy0, dx1, dy1, '#e8dab4', { seed: 4, n: 20, alpha: 0.14 });
        bricks(c, dx0, dy0, dx1, dy1, { bw: 0.2, bh: 0.1, base: '#e2d1a6', seed: 3, vary: 0.08, mortar: '#b8a478', hi: 0.1 });
        // Siegelabdrücke (Ovale) + Schmierung
        for (const [sx, sy] of [[0.5, 0.5], [0.3, 0.85], [0.6, 1.15]]) { const x = dx0 + sx * 0.5, y = dy0 + sy * 0.9; fillPoly(c, blob(x, y, 0.07, 0.09, 0, 14), '#b9a276'); strokePoly(c, blob(x, y, 0.07, 0.09, 0, 14), '#6a4a28', 0.012); line(c, [[x - 0.03, y - 0.03], [x + 0.03, y + 0.03]], '#6a4a28', 0.012); line(c, [[x - 0.03, y + 0.03], [x + 0.03, y - 0.03]], '#6a4a28', 0.012); }
        strokePoly(c, rect(dx0 + 0.02, dy0 + 0.02, dx1 - 0.02, dy1 - 0.02), '#6a4a28', 0.025);
        fr(c, dx0, dy0, dx1, dy0 + 0.1, 'rgba(110,70,30,.35)');
        sideLight(c, dx0, dy0, dx1, dy1, { left: 'rgba(255,255,255,.2)', right: 'rgba(60,30,0,.25)' });
      },
    }],
  };
  return mk('grabtreppe', 'Grabtreppe (versiegelter Eingang)', { body: { z: 1, layers }, tuer },
    { base: [1.5, 0], tuerFuss: piv, tuer: [(dx0 + dx1) / 2, 1.1], treppeOben: [0.1, yT], top: { rel: [0.5, 1] } },
    { kind: 'building', heightM: 3, ranges: { tuer: [0, 1.25] }, note: 'tuer: Pivot unten; positive Rotation kippt die Tür nach links (vorn, auf die Treppe). Alternativ rotation.x der Part-Gruppe' },
    { h: o.h ?? 3, floor: 0 });
}

// ================================================================================================
// ZIEGELMAUER ~6 m lang, ~1,9 m hoch. variant 0: gerade Mauer mit Putzband | 1: mit Torbogen | 2: verfallen mit Schutt.
export function ziegelmauer(o0 = {}) {
  const o = opt(o0);
  const v = variantOf(o, 3);
  const W = 6, H = 1.9;
  const layers = [];
  let shapes;
  if (v === 0) shapes = [poly([[-W / 2, 0], [W / 2, 0], [W / 2 - 0.1, H], [-W / 2 + 0.1, H]], 0), crumbleTop(-W / 2 + 0.05, W / 2 - 0.05, H - 0.02, H + 0.1, { amp: 0.03, step: 0.2, seed: 3 })];
  else if (v === 1) {
    const g = archPoly(0, 0, 1.2, 0.8, 18);
    // Mauer links und rechts + Bogenstein oberhalb des Tores (Tor bleibt offen)
    const arc = []; for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI; arc.push([Math.cos(a) * 0.6, 0.8 + Math.sin(a) * 0.6]); }
    shapes = [rect(-W / 2, 0, -0.6, H), rect(0.6, 0, W / 2, H), poly([[-0.62, 0.8], ...arc.map(([x, y]) => [x, y]).slice().reverse().map(([x, y]) => [x, y]), [0.62, 0.8], [0.62, H], [-0.62, H]], 0), crumbleTop(-W / 2, W / 2, H - 0.02, H + 0.1, { amp: 0.03, step: 0.2, seed: 5 })];
    shapes[2] = poly([[-0.6, 0.8], ...arc, [0.6, 0.8], [0.6, H], [-0.6, H]], 0);
  } else {
    const r = rngOf(9, 9); const top = [[-W / 2, 0], [-W / 2, 1.3]];
    let x = -W / 2;
    const prof = [[-3.0, 1.4], [-2.6, 1.7], [-2.1, 1.55], [-1.7, 1.2], [-1.3, 1.35], [-0.9, 0.9], [-0.5, 0.6], [0.0, 0.75], [0.4, 0.5], [0.8, 0.8], [1.3, 1.25], [1.8, 1.5], [2.3, 1.3], [2.7, 1.0], [3.0, 0.7]];
    shapes = [poly([[-W / 2, 0], ...prof, [W / 2, 0]], 0)];
  }
  layers.push({
    shapes, fill: C.mud,
    deco(c) {
      bricks(c, -3.2, -0.05, 3.2, 2.1, { bw: 0.38, bh: 0.17, base: '#c08a54', seed: 5 + v, vary: 0.2, hi: 0.2 });
      if (v !== 2) {
        // Putzband, stellenweise abgeplatzt
        fr(c, -3.2, 0.7, 3.2, 1.0, '#e8d8b4', 0.55); for (let i = 0; i < 12; i++) { const x = -3 + i * 0.52; fillPoly(c, blob(x, 0.85 + ((i * 7) % 5) * 0.03, 0.2, 0.1, 0, 10), '#c08a54', 0.7); }
      }
      if (v === 1) {
        // Tor: dunkle Öffnung hinter dem Bogen ist ausgeschnitten (Papier offen) – Rahmen malen
        strokePoly(c, archPoly(0, 0, 1.2, 0.8, 18), '#6a4a28', 0.05);
        glyph(c, 'sonne', 0, 1.45, 0.26, C.carn, 0.025);
      }
      sideLight(c, -3, 0, 3, 2, { left: 'rgba(255,240,200,.2)', right: 'rgba(50,20,0,.28)' });
      vGrad(c, -3.2, 0, 3.2, 0.5, 'rgba(0,0,0,0)', 'rgba(70,40,10,.25)');
      if (v === 2) for (let i = 0; i < 4; i++) { fillPoly(c, poly([[-2.4 + i * 1.5, 1.2 - i * 0.1], [-2.2 + i * 1.5, 1.28], [-2.05 + i * 1.5, 1.2]], 0), 'rgba(0,0,0,0)'); }
    },
  });
  // Sand/Schutt am Fuß
  const sand = poly([[-W / 2 - 0.2, 0], [-W / 2 + 0.5, 0.18], [-1.6, 0.22], [-0.5, 0.12], [0.8, 0.2], [2.0, 0.14], [W / 2 - 0.4, 0.2], [W / 2 + 0.2, 0]], 1);
  layers.push({ shapes: [v === 2 ? poly([[-W / 2 - 0.2, 0], [-2.0, 0.3], [-1.0, 0.28], [-0.3, 0.55], [0.5, 0.5], [1.2, 0.35], [2.0, 0.3], [W / 2 + 0.2, 0]], 1) : sand], fill: '#e2c88a', deco(c) { fillGrad(c, rect(-3.3, 0, 3.3, 0.7), 0, 0.5, 0, 0, [[0, 'rgba(255,248,215,.35)'], [1, 'rgba(120,80,30,.2)']]); const rng = rngOf(3, 3); for (let i = 0; i < 30; i++) fillPoly(c, blob(-3 + rng() * 6, rng() * 0.4, 0.03, 0.02, 0, 6), rng() < 0.5 ? 'rgba(255,250,225,.5)' : 'rgba(120,80,30,.3)'); } });
  return mk('ziegelmauer', 'Lehmziegelmauer', { body: { z: 1, layers } }, { base: [0, 0], top: { rel: [0.5, 1] } },
    { kind: 'wall', lengthM: 6, variant: v, variants: 3, note: 'variant 0 gerade, 1 mit Torbogen (offen), 2 verfallen' }, { w: o.w ?? W, floor: 0 });
}

// ================================================================================================
// HAFEN_KULISSE ~11 m: Kai aus Quadern mit Pollern, Kaitreppen ins Wasser, Wasserstreifen davor, dahinter Speicherhäuser
// (flache Lehmziegelhäuser + ein hellenistisches Lagerhaus mit Giebel und Ziegeldach).
export function hafen_kulisse(o0 = {}) {
  const o = opt(o0);
  const W = 11, yW = 0.5, yK = 1.25;
  const layers = [];
  // Speicherhäuser (hinten)
  const houses = [
    { x0: 0.0, x1: 2.4, h: 3.2, kind: 'flat', col: '#c9a470' }, { x0: 2.55, x1: 4.1, h: 2.6, kind: 'flat', col: '#d6b684' },
    { x0: 4.3, x1: 7.1, h: 3.9, kind: 'gable', col: '#ecdcb8' }, { x0: 7.3, x1: 9.0, h: 2.9, kind: 'flat', col: '#c7a16c' }, { x0: 9.15, x1: 11.0, h: 3.4, kind: 'flat', col: '#d9bb88' },
  ];
  const hshapes = houses.map((h) => (h.kind === 'gable' ? poly([[h.x0, yK - 0.05], [h.x1, yK - 0.05], [h.x1, h.h - 0.5], [(h.x0 + h.x1) / 2, h.h + 0.25], [h.x0, h.h - 0.5]], 0) : crumbleTop(h.x0, h.x1, yK - 0.05, h.h, { amp: 0.04, step: 0.15, seed: Math.round(h.x0 * 5), bevel: 0 })));
  layers.push({
    shapes: hshapes, fill: '#d6b684',
    deco(c) {
      houses.forEach((h, i) => {
        const rng = rngOf(i + 2, 4);
        if (h.kind === 'gable') {
          fr(c, h.x0, yK - 0.05, h.x1, h.h + 0.3, h.col); plaster(c, h.x0, yK, h.x1, h.h + 0.3, h.col, { seed: 4, n: 10, alpha: 0.08 });
          fillPoly(c, [[h.x0 - 0.1, h.h - 0.5], [(h.x0 + h.x1) / 2, h.h + 0.3], [h.x1 + 0.1, h.h - 0.5]], '#c8553a');
          for (let k = 0; k < 4; k++) line(c, [[h.x0 + k * 0.1, h.h - 0.5 + k * 0.2], [h.x1 - k * 0.1, h.h - 0.5 + k * 0.2]], 'rgba(90,25,10,.45)', 0.012);
          // Säulen/Tor
          const dx = (h.x0 + h.x1) / 2; fr(c, dx - 0.5, yK, dx + 0.5, yK + 1.1, '#2a1a12'); strokePoly(c, rect(dx - 0.5, yK, dx + 0.5, yK + 1.1), '#8a5a32', 0.05);
          for (const s of [-1, 1]) for (let k = 0; k < 2; k++) fr(c, dx + s * (0.75 + k * 0.5) - 0.07, yK, dx + s * (0.75 + k * 0.5) + 0.07, h.h - 0.6, '#f4ead0');
          fr(c, h.x0 + 0.1, h.h - 0.65, h.x1 - 0.1, h.h - 0.5, '#f4ead0'); fr(c, h.x0 + 0.1, h.h - 0.6, h.x1 - 0.1, h.h - 0.57, C.lapis);
        } else {
          fr(c, h.x0, yK - 0.05, h.x1, h.h + 0.1, h.col); bricks(c, h.x0, yK - 0.05, h.x1, h.h + 0.1, { bw: 0.3, bh: 0.15, base: h.col, seed: i + 30, vary: 0.1, mortar: mix(h.col, '#3a2410', 0.3) });
          const nd = Math.max(1, Math.round((h.x1 - h.x0) / 1.2));
          for (let k = 0; k < nd; k++) { const dx = h.x0 + ((h.x1 - h.x0) * (k + 0.5)) / nd; if (k % 2 === 0) { fr(c, dx - 0.3, yK, dx + 0.3, yK + 0.9, '#2a1a12'); strokePoly(c, rect(dx - 0.3, yK, dx + 0.3, yK + 0.9), '#7a4a28', 0.04); } else { fr(c, dx - 0.18, yK + 0.9, dx + 0.18, yK + 1.2, '#3a2a1a'); } }
          for (let k = 0; k < nd; k++) { const dx = h.x0 + ((h.x1 - h.x0) * (k + 0.5)) / nd; for (let yy = yK + 1.7; yy < h.h - 0.4; yy += 0.7) { fr(c, dx - 0.16, yy, dx + 0.16, yy + 0.34, '#3a2a1a'); fr(c, dx - 0.2, yy + 0.34, dx + 0.2, yy + 0.38, 'rgba(255,240,200,.4)'); } }
          fr(c, h.x0, h.h - 0.06, h.x1, h.h + 0.1, 'rgba(255,240,200,.3)');
        }
        sideLight(c, h.x0, yK, h.x1, h.h + 0.3, { left: 'rgba(255,240,200,.15)', right: 'rgba(50,20,0,.2)' });
      });
    },
  });
  // Kai (Quader) mit Treppen
  const quay = rect(0, yW - 0.1, W, yK);
  layers.push({
    shapes: [quay], fill: C.sand,
    deco(c) {
      blocks(c, 0, yW - 0.1, W, yK, { ch: 0.26, bw: 0.8, base: '#dcc088', seed: 21, vary: 0.12 });
      fr(c, 0, yK - 0.1, W, yK, 'rgba(255,245,215,.4)'); fr(c, 0, yK - 0.1, W, yK - 0.08, 'rgba(70,40,10,.4)');
      vGrad(c, 0, yW - 0.1, W, yW + 0.3, 'rgba(0,0,0,0)', 'rgba(20,50,50,.25)');
      // Kaitreppen (zurückgesetzt, dunkler)
      for (const sx of [2.2, 8.0]) { for (let i = 0; i < 6; i++) { const y = yK - 0.1 - i * 0.12; fr(c, sx - 0.55 + i * 0.03, y - 0.12, sx + 0.55 - i * 0.03, y, i % 2 ? '#b8995f' : '#c8a96f'); fr(c, sx - 0.55 + i * 0.03, y - 0.01, sx + 0.55 - i * 0.03, y, 'rgba(255,245,215,.5)'); } }
      // Ringe / Anbindelöcher
      for (let x = 0.8; x < W; x += 1.6) { if (Math.abs(x - 2.2) < 0.8 || Math.abs(x - 8) < 0.8) continue; strokePoly(c, blob(x, yK - 0.34, 0.07, 0.07, 0, 12), '#3a2a1a', 0.025); }
    },
  });
  // Poller (vorn auf der Kaikante)
  const bol = [];
  for (let x = 0.9; x < W; x += 2.0) { if (Math.abs(x - 2.2) < 0.9 || Math.abs(x - 8.0) < 0.9) continue; bol.push(poly([[x - 0.14, yK - 0.02], [x + 0.14, yK - 0.02], [x + 0.11, yK + 0.2], [x + 0.17, yK + 0.27], [x + 0.1, yK + 0.33], [x - 0.1, yK + 0.33], [x - 0.17, yK + 0.27], [x - 0.11, yK + 0.2]], 1)); }
  layers.push({ shapes: bol, fill: '#9b8a6a', deco(c) { fillGrad(c, rect(-1, yK, W + 1, yK + 0.4), -1, 0, W + 1, 0, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0)']]); for (const p of bol) { fillGrad(c, p, p[0][0], 0, p[1][0], 0, [[0, 'rgba(255,245,215,.4)'], [1, 'rgba(40,20,0,.4)']]); } for (let x = 0.9; x < W; x += 2.0) { if (Math.abs(x - 2.2) < 0.9 || Math.abs(x - 8.0) < 0.9) continue; curve(c, [[x - 0.13, yK + 0.2], [x, yK + 0.17], [x + 0.13, yK + 0.2]], 'rgba(40,20,0,.6)', 0.02, { alpha: 1 }); } } });
  // Wasser davor
  const water = poly([[-0.2, -0.0], [W + 0.2, 0], [W + 0.2, yW], ...Array.from({ length: 23 }, (_, i) => { const x = W + 0.2 - i * ((W + 0.4) / 22); return [x, yW + 0.03 * Math.sin(i * 1.7)]; })], 0);
  layers.push({
    shapes: [water], fill: { top: '#3d9aa6', bottom: '#2a6f86' },
    deco(c) { waterLines(c, -0.2, W + 0.2, 0, yW, 7, 'rgba(235,255,250,.5)'); fillGrad(c, rect(-0.2, 0, W + 0.2, yW), 0, yW, 0, 0, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(0,30,50,.3)']]); },
  });
  return mk('hafen_kulisse', 'Hafen (Kai mit Speicherhäusern)', { body: { z: 1, layers } },
    { base: [W / 2, 0], kai: [W / 2, yK], wasser: [W / 2, yW], top: { rel: [0.5, 1] } },
    { kind: 'scenery', lengthM: 11, note: 'Wasserstreifen y<0.5 vorn, Kaikante y≈1.25' }, { w: o.w ?? W, floor: 0 });
}
