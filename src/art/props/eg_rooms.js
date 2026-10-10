// Gruppe S2 – Innenräume: Lehmhaus (aufgeschnittenes Puppenhaus), Tempelhalle-Wand, Werkstatt-Wand, Gelehrtenzimmer.
import {
  C, rect, trap, crumbleTop, archPoly, fr, clipTo, clipRect, shp, sideLight, vGrad, vignette, bricks, blocks, plaster, woodGrain, logEnds,
  glyph, glyphRow, star5, stripeBand, cavetto, torusH, starCeiling, jar, wallFigure, mk, opt,
  blob, limb, poly, mix, shade, rngOf, leaf, wavy, ribbon, spline,
  fillPoly, fillPolys, fillGrad, strokePoly, curve, strokes, volume,
} from './_eg_arch_kit.js';
import { line } from '../paint.js';

// ================================================================================================
// LEHMHAUS: zweistöckiges Lehmziegelhaus aus Deir el-Medina, vorn aufgeschnitten. ~11 m breit, 5 m hoch.
// Aufteilung (x von links): Hof | Backstube (unten) + Schreibstube (oben) | Wohnraum (unten) + Dach-Terrasse (oben) | Außentreppe.
// Parts: body (Mauerwerk, Decken, Treppe), hof, backstube, wohnraum, schreibstube (Rückwände der Räume, hinter dem Mauerwerk), dach (Brüstung + Schilfdach).
export function lehmhaus(o0 = {}) {
  const o = opt(o0);
  // Raster
  const wA = [0, 0.25], hof = [0.25, 2.65], wB = [2.65, 2.9], bak = [2.9, 6.1], wC = [6.1, 6.35], woh = [6.35, 9.15], wD = [9.15, 9.4], stairX = [9.4, 10.9];
  const F0 = 0.18, S1b = 2.43, S1t = 2.78, S2b = 4.68, S2t = 4.98, TOP = 5.0;
  const ov = 0.012;
  // ---- Mauerwerk ----
  const plinth = rect(0, 0, 10.9, F0 + ov);
  const wallsLow = [rect(wA[0], F0, wA[1] + ov, S1b - 0.05), rect(wB[0], F0, wB[1] + ov, S1b), rect(wC[0], F0, wC[1] + ov, S1b), rect(wD[0], F0, wD[1], S1b)];
  const wallLowTops = [];
  const wallsUp = [rect(wB[0], S1t - ov, wB[1], S2t), rect(wC[0], S1t - ov, wC[1], S2t)];
  const slab1 = rect(wB[0], S1b, wD[1], S1t);
  const slab2 = rect(wB[0], S2b, wC[1], S2t);
  // Außentreppe: Stufen aufsteigend zur Terrasse (Mauerwerk)
  const nSt = 9, run = (stairX[1] - stairX[0]) / nSt;
  const stair = [[stairX[0] - ov, F0], [stairX[0] - ov, S1t]];
  for (let i = 0; i < nSt; i++) { const yt = S1t - ((S1t - F0) / nSt) * i; stair.push([stairX[0] + run * i, yt]); stair.push([stairX[0] + run * (i + 1), yt]); }
  stair.push([stairX[1], F0]);
  const parapetHof = [crumbleTop(wB[0], wB[1] + ov, S1b, S1b + 0.12, { amp: 0.03, step: 0.1, seed: 3 })];

  const body = {
    z: 2, layers: [
      { // Fundament / Sockel
        shapes: [plinth], fill: '#8a7254',
        deco(c, bb) {
          const rng = rngOf(3, 5);
          fr(c, 0, 0, 11, F0, '#7d6648');
          for (let x = 0.05; x < 10.9; x += 0.26 + rng() * 0.2) { const w = 0.16 + rng() * 0.22; fillPoly(c, blob(x + w / 2, 0.09, w / 2, 0.06 + rng() * 0.03, 0, 10), mix('#9a8462', rng() < 0.5 ? '#fff4d6' : '#2a1a0e', rng() * 0.25)); }
          fr(c, 0, F0 - 0.025, 10.9, F0, 'rgba(255,240,205,.3)');
        },
      },
      { // Mauern (Schnittfläche): Lehmziegel
        shapes: [...wallsLow, ...wallLowTops, ...wallsUp, ...parapetHof], fill: C.mudDk,
        deco(c, bb) {
          bricks(c, 0, F0, 10.9, 5.1, { bw: 0.3, bh: 0.15, base: '#a2693c', seed: 4, vary: 0.2, hi: 0.18 });
          for (const [a, b] of [wA, wB, wC, wD]) { sideLight(c, a, F0, b, 5, { left: 'rgba(255,235,190,.18)', right: 'rgba(40,15,0,.25)' }); }
        },
      },
      { // Decken: Palmstämme im Querschnitt in Lehm
        shapes: [slab1, slab2], fill: '#a87442',
        deco(c, bb) {
          for (const [y0, y1, a, b] of [[S1b, S1t, wB[0], wD[1]], [S2b, S2t, wB[0], wC[1]]]) {
            fr(c, a, y0, b, y1, '#9c6a3c');
            fr(c, a, y1 - 0.09, b, y1, '#c99a62'); // Lehmestrich oben
            fr(c, a, y1 - 0.1, b, y1 - 0.09, 'rgba(60,30,10,.4)');
            fr(c, a, y0, b, y0 + 0.03, 'rgba(40,20,5,.35)');
            logEnds(c, a + 0.03, b - 0.03, y0 + (y1 - y0 - 0.1) * 0.5 + 0.0, 0.1, { gap: 0.045, seed: y0 * 10 });
          }
        },
      },
      { // Außentreppe
        shapes: [stair], fill: '#b88958',
        deco(c, bb) {
          bricks(c, stairX[0] - 0.05, F0, stairX[1], S1t + 0.05, { bw: 0.3, bh: 0.15, base: '#b07c4a', seed: 9, vary: 0.18 });
          for (let i = 0; i < nSt; i++) {
            const y = S1t - ((S1t - F0) / nSt) * i, x = stairX[0] + run * i;
            fr(c, x, y - 0.03, x + run, y, 'rgba(255,240,200,.55)'); // Trittkante hell
            fr(c, x + run - 0.02, y - (S1t - F0) / nSt, x + run, y, 'rgba(30,15,0,.4)');
          }
          fillGrad(c, stair, 0, 0, 0, 3, [[0, 'rgba(30,15,0,.4)'], [1, 'rgba(255,235,190,.12)']]);
        },
      },
    ],
  };

  // ---- Raum-Rückwände (hinter dem Mauerwerk, Öffnungen im Body) ----
  const room = (x0, x1, y0, y1, paint) => ({
    z: -9,
    layers: [{ shapes: [rect(x0 - 0.1, y0 - 0.1, x1 + 0.1, y1 + 0.1)], fill: '#e8d6a8', deco(c, bb) { paint(c, x0, y0, x1, y1); vignette(c, x0, y0, x1, y1, { a: 0.28, k: 0.2 }); } }],
  });
  const roomWoh = room(woh[0], woh[1], F0, S1b, (c, x0, y0, x1, y1) => {
    plaster(c, x0 - 0.2, y0, x1 + 0.2, y1 + 0.2, '#ecdcb2', { seed: 11, alpha: 0.12 });
    // Sockelband in Rot/Ocker mit hellem Rand
    fr(c, x0 - 0.2, y0, x1 + 0.2, y0 + 0.62, '#b3583a'); fr(c, x0 - 0.2, y0 + 0.62, x1 + 0.2, y0 + 0.68, C.black); fr(c, x0 - 0.2, y0 + 0.68, x1 + 0.2, y0 + 0.72, '#f3e9cc');
    for (let x = x0; x < x1; x += 0.28) fr(c, x, y0 + 0.2, x + 0.09, y0 + 0.5, 'rgba(255,225,170,.16)');
    // Zierband unter der Decke: Lotos/Knospen im Wechsel
    fr(c, x0 - 0.2, y1 - 0.34, x1 + 0.2, y1 - 0.3, C.lapis); fr(c, x0 - 0.2, y1 - 0.12, x1 + 0.2, y1 - 0.08, C.lapis);
    glyphRow(c, x0 + 0.1, x1 - 0.1, y1 - 0.3, 0.2, ['lotus', 'schilf'], [C.nile, C.carn], { pitch: 0.28 });
    // Tür in den Hinterraum (dunkel, mit Rahmen)
    const d = archPoly(x0 + 0.55, y0, 0.55, 1.15);
    fillPoly(c, d.map(([x, y]) => [x * 1.0, y]), '#2a1a12'); strokePoly(c, d, '#8a5a32', 0.04);
    fr(c, x0 + 0.3, y0, x0 + 0.34, y0 + 1.3, 'rgba(0,0,0,0)');
    // Fensterschlitz mit Licht
    fr(c, x1 - 0.55, y1 - 0.95, x1 - 0.3, y1 - 0.5, '#fff1b0'); fr(c, x1 - 0.55, y1 - 0.95, x1 - 0.3, y1 - 0.5, 'rgba(120,200,230,.35)');
    strokePoly(c, rect(x1 - 0.55, y1 - 0.95, x1 - 0.3, y1 - 0.5), '#7a5030', 0.03);
    // Lichtkegel schräg
    fillPoly(c, [[x1 - 0.55, y1 - 0.95], [x1 - 0.3, y1 - 0.95], [x1 - 1.3, y0 + 0.1], [x1 - 1.9, y0 + 0.1]], 'rgba(255,240,180,.16)');
    // Boden
    fr(c, x0 - 0.2, y0, x1 + 0.2, y0 + 0.1, '#9c7447'); fr(c, x0 - 0.2, y0 + 0.1, x1 + 0.2, y0 + 0.13, 'rgba(255,235,190,.3)');
  });
  const roomBak = room(bak[0], bak[1], F0, S1b, (c, x0, y0, x1, y1) => {
    plaster(c, x0 - 0.2, y0, x1 + 0.2, y1 + 0.2, '#d8a468', { seed: 12, alpha: 0.14 });
    // Ruß über dem Ofenbereich (rechts) und Rauchabzug
    fillGrad(c, rect(x0 - 0.2, y0, x1 + 0.2, y1 + 0.2), 0, y1, 0, y0 + 0.3, [[0, 'rgba(40,25,18,.5)'], [1, 'rgba(40,25,18,0)']]);
    fillPoly(c, blob(x1 - 0.8, y1 - 0.25, 0.7, 0.4, 0, 20), 'rgba(30,18,10,.35)');
    fr(c, x1 - 1.05, y1 - 0.5, x1 - 0.7, y1 - 0.2, '#fff1b0'); strokePoly(c, rect(x1 - 1.05, y1 - 0.5, x1 - 0.7, y1 - 0.2), '#6a4020', 0.03);
    // Wandnischen (Regal) links oben
    for (let i = 0; i < 3; i++) { const nx = x0 + 0.3 + i * 0.55; fr(c, nx, y1 - 0.95, nx + 0.4, y1 - 0.5, '#7a4a28'); fr(c, nx, y1 - 0.5 - 0.05, nx + 0.4, y1 - 0.5, 'rgba(255,225,170,.3)'); fr(c, nx, y1 - 0.95, nx + 0.4, y1 - 0.9, 'rgba(0,0,0,.3)'); }
    // Sockelband Ocker
    fr(c, x0 - 0.2, y0, x1 + 0.2, y0 + 0.4, '#a5693c'); fr(c, x0 - 0.2, y0 + 0.4, x1 + 0.2, y0 + 0.44, C.black);
    fr(c, x0 - 0.2, y0, x1 + 0.2, y0 + 0.1, '#7e5a3a');
  });
  const roomSchr = room(bak[0], bak[1], S1t, S2b, (c, x0, y0, x1, y1) => {
    plaster(c, x0 - 0.2, y0, x1 + 0.2, y1 + 0.2, '#f3ead0', { seed: 13, alpha: 0.08 });
    // Sockel mit Schachbrett Blau/Weiß/Rot
    fr(c, x0 - 0.2, y0, x1 + 0.2, y0 + 0.5, '#fff6dc');
    for (let i = 0, x = x0 - 0.2; x < x1 + 0.2; x += 0.25, i++) { fr(c, x, y0, x + 0.25, y0 + 0.25, i % 2 ? C.lapis : '#fff6dc'); fr(c, x, y0 + 0.25, x + 0.25, y0 + 0.5, i % 2 ? '#fff6dc' : C.carn); }
    fr(c, x0 - 0.2, y0 + 0.5, x1 + 0.2, y0 + 0.55, C.black);
    // hohes Fenster links mit Lichtstreifen
    fr(c, x0 + 0.35, y1 - 0.8, x0 + 0.85, y1 - 0.25, '#cfeaf2'); fillGrad(c, rect(x0 + 0.35, y1 - 0.8, x0 + 0.85, y1 - 0.25), 0, y1 - 0.25, 0, y1 - 0.8, [[0, '#fff3b8'], [1, '#bfe3ee']]);
    strokePoly(c, rect(x0 + 0.35, y1 - 0.8, x0 + 0.85, y1 - 0.25), '#7a5030', 0.035);
    fillPoly(c, [[x0 + 0.35, y1 - 0.8], [x0 + 0.85, y1 - 0.8], [x0 + 1.9, y0 + 0.5], [x0 + 1.2, y0 + 0.5]], 'rgba(255,245,190,.16)');
    // Nischen mit Rollen, rechts oben
    for (let i = 0; i < 2; i++) { const nx = x1 - 1.4 + i * 0.65; fr(c, nx, y1 - 0.85, nx + 0.5, y1 - 0.35, '#b78a58'); for (let k = 0; k < 4; k++) fillPoly(c, blob(nx + 0.1 + k * 0.1, y1 - 0.5, 0.045, 0.045, 0, 8), '#f6efe0'); }
    // oberer Zierstreifen
    fr(c, x0 - 0.2, y1 - 0.1, x1 + 0.2, y1 - 0.05, C.turq);
  });
  const roomHof = {
    z: -9, layers: [{
      shapes: [rect(hof[0] - 0.1, F0 - 0.05, hof[1] + 0.1, S1b + 0.05)], fill: '#c99a64',
      deco(c, bb) {
        const x0 = hof[0], x1 = hof[1], y0 = F0, y1 = S1b;
        bricks(c, x0 - 0.2, y0, x1 + 0.2, y1 + 0.2, { bw: 0.3, bh: 0.15, base: '#cfa06a', seed: 21, vary: 0.14, mortar: '#9a6c40' });
        // Tor zur Gasse (links), Holztür angelehnt
        const d = archPoly(x0 + 0.65, y0, 0.72, 1.1);
        fillPoly(c, d, '#241812'); strokePoly(c, d, '#6e4a2a', 0.05);
        fillPoly(c, [[x0 + 0.65, y0], [x0 + 0.99, y0 + 0.04], [x0 + 0.99, y0 + 1.2], [x0 + 0.65, y0 + 1.5]], '#8a5a32');
        strokePoly(c, [[x0 + 0.65, y0], [x0 + 0.99, y0 + 0.04], [x0 + 0.99, y0 + 1.2], [x0 + 0.65, y0 + 1.5]], '#4a2e16', 0.03);
        // Boden: Sand/Lehm
        fr(c, x0 - 0.2, y0, x1 + 0.2, y0 + 0.14, '#e0c288'); fr(c, x0 - 0.2, y0 + 0.14, x1 + 0.2, y0 + 0.17, 'rgba(120,80,30,.35)');
        // Sonne von oben
        fillGrad(c, rect(x0 - 0.2, y0, x1 + 0.2, y1 + 0.2), 0, y1 + 0.2, 0, y0, [[0, 'rgba(255,240,180,.25)'], [1, 'rgba(255,240,180,0)']]);
        vignette(c, x0 - 0.1, y0, x1 + 0.1, y1, { a: 0.18, k: 0.2 });
      },
    }],
  };
  // ---- Dach-Terrasse: Rückbrüstung, Schilfdach auf zwei Pfosten ----
  const tx0 = wC[1], tx1 = stairX[0] + 0.6;
  const parapet = crumbleTop(tx0 - 0.02, wD[1] - 0.05, S1t - 0.01, S1t + 0.62, { amp: 0.08, step: 0.12, seed: 8 });
  const postL = rect(7.1, S1t, 7.2, 4.3), postR = rect(9.0, S1t, 9.1, 4.3);
  const mat = [[6.95, 4.34], [9.25, 4.34], [9.25, 4.44], [6.95, 4.44]];
  const roofMat = [[6.9, 4.28], [9.3, 4.28], [9.3, 4.46], [6.9, 4.46]];
  const dach = {
    z: -4, layers: [
      {
        shapes: [parapet], fill: '#c79a64',
        deco(c) {
          bricks(c, tx0 - 0.1, S1t, wD[1], S1t + 0.7, { bw: 0.3, bh: 0.15, base: '#c99b66', seed: 31, vary: 0.14 });
          fr(c, tx0, S1t, wD[1], S1t + 0.06, 'rgba(60,30,10,.35)');
          sideLight(c, tx0, S1t, wD[1], S1t + 0.7, { left: 'rgba(255,240,200,.1)', right: 'rgba(60,30,0,.14)' });
        },
      },
      { // Pfosten
        shapes: [postL, postR], fill: C.wood,
        deco(c, bb) { woodGrain(c, 7, S1t, 9.2, 4.4, C.wood, { dir: 'v', n: 12 }); sideLight(c, 7, S1t, 9.2, 4.4, { left: 'rgba(255,230,180,.2)', right: 'rgba(30,10,0,.3)' }); },
      },
      { // Schilfmatten-Dach
        shapes: [roofMat], fill: '#d9b866',
        deco(c, bb) {
          fr(c, 6.9, 4.28, 9.3, 4.46, '#dcbc6a');
          for (let x = 6.9; x < 9.3; x += 0.06) fr(c, x, 4.28, x + 0.02, 4.46, 'rgba(120,80,20,.35)');
          fr(c, 6.9, 4.28, 9.3, 4.32, 'rgba(60,30,0,.4)'); fr(c, 6.9, 4.42, 9.3, 4.46, 'rgba(255,245,200,.4)');
          for (const x of [7.5, 8.2, 8.9]) fr(c, x, 4.28, x + 0.04, 4.46, '#8a5a32');
        },
      },
    ],
  };
  const parts = { body, hof: roomHof, backstube: roomBak, schreibstube: roomSchr, wohnraum: roomWoh, dach };
  const anchors = {
    hof: [(hof[0] + hof[1]) / 2, F0], backstube: [(bak[0] + bak[1]) / 2, F0], wohnraum: [(woh[0] + woh[1]) / 2, F0],
    schreibstube: [(bak[0] + bak[1]) / 2, S1t], dach: [(woh[0] + wD[1]) / 2, S1t], dachkante: [stairX[0] + 0.2, S1t],
    top: { rel: [0.5, 1] },
  };
  return mk('lehmhaus', 'Lehmziegelhaus (aufgeschnitten)', parts, anchors, {
    kind: 'building', lengthM: 11, rooms: ['hof', 'backstube', 'wohnraum', 'schreibstube', 'dach'],
    note: 'Raumparts liegen hinter dem Mauerwerk (body) in Öffnungen; Möbel/Figuren davor stellen',
  }, { w: o.w ?? 11, floor: 0 });
}
