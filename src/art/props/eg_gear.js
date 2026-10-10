// Gruppe O1 – kleinere Grab- und Königsgegenstände: dolch_eisen, truhe, fackel, ushabti, kartusche. (Narmer-Palette: eg_narmer.js)
// Gebaut in cm, skaliert via finish().
import {
  K, spec, blob, limb, poly, rect, rrect, stroke2poly, sym, ring, arcPts, spline, fillPoly, strokePoly, bandedLimb, rngOf, shade, mix,
  gold, inlay, flat, goldFill, ironFill, silverFill, bevel, gloss, volume, seg, ln, dotAt, ellipseAt, bands, glyph, frieze, intersect, TAU,
} from './_eg_royal_kit.js';

const PI = Math.PI;

// ---- Eisendolch mit Goldgriff (Tutanchamun; Eisen aus Meteorit) --------------------------------------------------------------------------
export function dolch_eisen(opts = {}) {
  const sheath = !!opts.sheath;
  // Klinge (Blattform) zeigt nach +x
  const blade = poly([[-3.4, 2.7], [2, 2.9], [9, 2.4], [15.5, 1.3], [20.4, 0], [15.5, -1.3], [9, -2.4], [2, -2.9], [-3.4, -2.7]], 1);
  const bladeL = {
    shapes: [blade], fill: { stops: [[0, '#7c8892'], [0.34, '#c9d4db'], [0.5, '#f0f6f9'], [0.68, '#a9b6bf'], [1, '#56626b']], dir: 'v' }, stroke: 'rgba(30,38,46,.85)',
    deco(c, bb) {
      // Mittelgrat + Hohlkehlen
      ln(c, [[-3, 0], [8, 0], [19, 0]], 'rgba(40,50,60,.65)', 0.2);
      ln(c, [[-2.5, 1.5], [9, 1.2], [16, 0.5]], 'rgba(255,255,255,.55)', 0.18);
      ln(c, [[-2.5, -1.5], [9, -1.2], [16, -0.5]], 'rgba(40,50,60,.35)', 0.18);
      gloss(c, bb, { ang: 0.05, pos: 0.28, w: 0.12, a: 0.5, color: '255,255,255' });
    },
  };
  const layers = [bladeL];
  if (sheath) {
    const sh = poly([[-3.6, 3.6], [8, 3.4], [16, 2.2], [21.6, 0], [16, -2.2], [8, -3.4], [-3.6, -3.6]], 1);
    layers.length = 0;
    layers.push(gold([sh], { dir: 'v', deco(c) { for (let i = 0; i < 8; i++) dotAt(c, 0 + i * 2.4, 0, 0.5, i % 2 ? K.lapis : K.carn); ln(c, [[-3, 0], [20.5, 0]], K.goldLo, 0.18, 0.7); } }));
  }
  // Parierstück (Mondsichel aus Gold)
  layers.push(gold([blob(-4.4, 0, 1.7, 4.1, 0, 20)], { dir: 'h', deco(c) { for (let i = -2; i <= 2; i++) dotAt(c, -4.4, i * 1.4, 0.42, i % 2 ? K.lapis : K.turq); } }));
  // Griff mit Granulation und Einlagen
  const grip = poly([[-13.4, 1.4], [-5.2, 1.7], [-5.2, -1.7], [-13.4, -1.4]], 1);
  layers.push(gold([grip], {
    dir: 'v', deco(c) {
      for (let i = 0; i < 6; i++) { const x = -12.8 + i * 1.35; for (const y of [-0.7, 0, 0.7]) dotAt(c, x + (y ? 0.3 : 0), y, 0.2, K.goldHi, 0.9); }
      for (const x of [-9.3, -7.9]) { ln(c, [[x, 1.6], [x, -1.6]], K.lapisLo, 0.3, 0.95); }
    },
  }));
  // Knauf aus Bergkristall mit Goldfassung
  layers.push(gold([blob(-14.6, 0, 1.2, 2.9, 0, 18)], { dir: 'h', gloss: false }));
  layers.push({
    shapes: [blob(-16.7, 0, 2.9, 3.2, 0, 24)], fill: { stops: [[0, '#ffffff'], [0.5, '#e4f2f6'], [1, '#a9c6d0']], dir: 'v' }, stroke: 'rgba(70,95,105,.8)',
    deco(c) { dotAt(c, -17.6, 1.2, 0.8, 'rgba(255,255,255,.95)'); ln(c, [[-18.4, -0.8], [-16, -1.8]], 'rgba(120,160,175,.5)', 0.2); },
  });
  return spec('dolch_eisen', 'Eisendolch mit Goldgriff', { body: { z: 1, layers } }, { grip: [-9, 0], tip: [20.4, 0] },
    { lengthM: 0.35, ranges: {}, desc: 'Dolch aus Meteoriteneisen, Griff aus Gold, Knauf aus Bergkristall' }, { w: opts.w || 0.35 });
}

// ---- Bemalte Truhe mit gewölbtem Deckel ----------------------------------------------------------------------------------------------------
function lotusPapyrus(c, x0, x1, y, h) {
  const n = Math.round((x1 - x0) / (h * 0.62));
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + (i + 0.5) * step;
    if (i % 2 === 0) { // Lotosblüte (blau)
      seg(c, [x, y], [x, y + h * 0.4], K.papyrus, h * 0.07);
      ellipseAt(c, x, y + h * 0.62, h * 0.13, h * 0.3, '#3d78c0', 1);
      ellipseAt(c, x - h * 0.2, y + h * 0.56, h * 0.1, h * 0.26, '#6aa0dd', 1, 0.5); ellipseAt(c, x + h * 0.2, y + h * 0.56, h * 0.1, h * 0.26, '#6aa0dd', 1, -0.5);
    } else {          // Papyrusdolde (grün)
      seg(c, [x, y], [x, y + h * 0.5], K.papyrus, h * 0.07);
      for (let k = -2; k <= 2; k++) seg(c, [x, y + h * 0.5], [x + k * h * 0.12, y + h * 0.92 - Math.abs(k) * h * 0.07], '#4b9a3f', h * 0.05);
    }
  }
}
export function truhe(opts = {}) {
  const W = 40, bodyY0 = 8, bodyY1 = 49;
  const body = [];
  const feet = [rect(-W + 1, 0, -W + 7, bodyY0 + 1), rect(W - 7, 0, W - 1, bodyY0 + 1)];
  body.push(flat(feet, '#8a5a32', { bevel: true }));
  const box = rect(-W, bodyY0, W, bodyY1);
  body.push({
    shapes: [box], fill: { stops: [[0, '#f6ead0'], [1, '#e6d4ac']], dir: 'v' }, stroke: 'rgba(70,40,15,.7)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(90,60,20,.25)', light: 'rgba(255,255,255,.2)' });
      // Rahmen aus Rot/Gelb/Blau-Schachbrett
      const edge = (x0, x1, y, h) => {
        const n = Math.round((x1 - x0) / h);
        for (let i = 0; i < n; i++) fillPoly(c, [[x0 + i * (x1 - x0) / n, y], [x0 + (i + 1) * (x1 - x0) / n, y], [x0 + (i + 1) * (x1 - x0) / n, y + h], [x0 + i * (x1 - x0) / n, y + h]], [K.carn, '#e7c04a', '#3d78c0'][i % 3]);
      };
      edge(-W, W, bodyY1 - 3.6, 3.6); edge(-W, W, bodyY0, 3.6);
      // Mittelfeld: Lotos-Papyrus-Fries oben und unten, mittig Sonnenkäfer-ähnlicher Fries aus Ankh/Was
      lotusPapyrus(c, -W + 3, W - 3, bodyY0 + 5, 9);
      lotusPapyrus(c, -W + 3, W - 3, bodyY1 - 14, 9);
      ln(c, [[-W + 2, 23.6], [W - 2, 23.6]], K.carn, 0.5, 0.9); ln(c, [[-W + 2, 32], [W - 2, 32]], K.carn, 0.5, 0.9);
      const seq = ['ankh', 'was', 'djed'];
      for (let i = 0; i < 9; i++) glyph(c, seq[i % 3], -W + 8 + i * ((2 * W - 16) / 8), 24.4, 6.6, i % 2 ? '#3d78c0' : K.carnLo, 0.5);
      // Beschläge
      for (const sx of [-W + 1.6, W - 1.6]) { fillPoly(c, [[sx - 1.6, bodyY0], [sx + 1.6, bodyY0], [sx + 1.6, bodyY1], [sx - 1.6, bodyY1]], K.gold); }
    },
  });
  // Deckel: gewölbt, Scharnier hinten (links), Pivot an der linken Unterkante
  const lidPts = [[-W - 1.5, bodyY1], [-W - 0.5, bodyY1 + 6]];
  for (let i = 0; i <= 16; i++) { const a = PI - (i / 16) * PI; lidPts.push([Math.cos(a) * (W + 0.5), bodyY1 + 6 + Math.sin(a) * 10.5]); }
  lidPts.push([W + 1.5, bodyY1]);
  const lid = poly(lidPts, 0);
  const lidL = {
    shapes: [lid], fill: { stops: [[0, '#f6ead0'], [1, '#dfc89a']], dir: 'v' }, stroke: 'rgba(70,40,15,.7)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(90,60,20,.25)', light: 'rgba(255,255,255,.25)' });
      // Federmuster auf dem Deckel
      for (let i = 0; i < 12; i++) { const x = -W + 4 + i * 6.8; ellipseAt(c, x, bodyY1 + 8.6, 2.6, 4, i % 2 ? '#3d78c0' : K.carn, 0.9, 0); }
      fillPoly(c, [[-W - 2, bodyY1], [W + 2, bodyY1], [W + 2, bodyY1 + 3.4], [-W - 2, bodyY1 + 3.4]], K.gold);
      for (let i = 0; i < 16; i++) dotAt(c, -W + 2 + i * 5.2, bodyY1 + 1.7, 0.7, i % 2 ? K.lapis : K.carn);
    },
  };
  const knob = gold([blob(0, bodyY1 + 17, 2.4, 2.4, 0, 14), rect(-0.9, bodyY1 + 12, 0.9, bodyY1 + 16)], { dir: 'v', gloss: false });
  const parts = {
    body: { z: 1, layers: body },
    lid: { z: 2, pivot: [-W - 1, bodyY1], layers: [lidL, knob] },
  };
  return spec('truhe', 'Bemalte Truhe', parts, { lock: [0, 36], lidTop: [0, bodyY1 + 17] },
    { lengthM: 0.8, ranges: { lid: [0, 0.9] }, desc: 'Truhe aus Holz, weiß grundiert und bemalt (nach der Truhe des Tutanchamun); Deckel öffnet nach hinten (Pivot links)' }, { w: opts.w || 0.8 });
}

// ---- Fackel ---------------------------------------------------------------------------------------------------------------------------------------
export function fackel(opts = {}) {
  const handle = limb([[0, 0, 3.2], [0.3, 20, 3.4], [0, 37, 4.0]], { per: 6 });
  const body = [];
  body.push(flat([handle], { stops: [[0, '#9a6a3a'], [0.5, '#b9824f'], [1, '#7a4a28']], dir: 'h' }, {
    bevel: true, deco(c) {
      for (let y = 4; y < 36; y += 6) ln(c, [[-1.4, y], [0.2, y + 1.2], [1.6, y]], 'rgba(60,30,10,.4)', 0.25);
      for (const y of [8, 28]) { fillPoly(c, [[-2.2, y], [2.2, y], [2.2, y + 1.6], [-2.2, y + 1.6]], K.gold); }
    },
  }));
  // Wickel (Leinen/Harz) oben, rußgeschwärzt
  const wrap = poly([[-4.6, 36], [4.6, 36], [5.4, 42], [4.4, 49], [0, 51], [-4.4, 49], [-5.4, 42]], 2);
  body.push({
    shapes: [wrap], fill: { stops: [[0, '#f0e4c0'], [0.6, '#cdb98a'], [1, '#6a5232']], dir: 'v' }, stroke: 'rgba(60,40,15,.7)',
    deco(c, bb) {
      volume(c, bb);
      for (let y = 37; y < 50; y += 2.6) ln(c, [[-5.4, y], [0, y + 1.4], [5.4, y]], 'rgba(90,60,25,.55)', 0.35);
      ellipseAt(c, 0, 49.4, 4.2, 2.4, 'rgba(40,20,5,.65)');
    },
  });
  const flame = poly([[0, 49], [3.8, 51], [5, 55.5], [3.4, 60], [0.8, 64.5], [0, 67], [-0.9, 64], [-3.2, 60.5], [-5, 55.5], [-3.8, 51]], 3);
  const inner = poly([[0, 50.4], [2.2, 52], [2.6, 55.6], [1.2, 59.5], [0, 61.5], [-1.2, 59], [-2.6, 55.4], [-2.2, 52]], 3);
  const flameL = [
    { shapes: [flame], fill: { stops: [[0, '#ffd84a'], [0.5, '#ff9b24'], [1, '#e8531c']], dir: 'v' }, stroke: 'rgba(160,50,10,.6)' },
    { shapes: [inner], fill: { stops: [[0, '#fff6c0'], [1, '#ffe27a']], dir: 'v' }, stroke: null },
  ];
  const parts = { body: { z: 1, layers: body }, flamme: { z: 2, pivot: [0, 49], layers: flameL } };
  return spec('fackel', 'Fackel', parts, { flame: [0, 56], tip: [0, 67], hand: [0, 20] },
    { heightM: 0.6, ranges: { flamme: [0, 0.2] }, desc: 'Handfackel aus Holzstab mit öl-/harzgetränktem Leinenwickel; Flamme (flamme) flackert um die Basis' }, { h: opts.h || 0.6 });
}

// ---- Uschebti (Totenfigürchen) -------------------------------------------------------------------------------------------------------------------
export function ushabti(opts = {}) {
  const outline = sym([
    [0, 30.4], [5.4, 29.6], [8.2, 25.6], [9.2, 21.4], [7.8, 19.6], [8.6, 16.6], [8.2, 11], [7.2, 5.4], [6.2, 1.2], [4, 0], [0, 0],
  ], 1);
  const wigL = poly([[-5.4, 29.6], [5.4, 29.6], [8.4, 25], [9.4, 19.6], [7.2, 18.4], [5.6, 24], [-5.6, 24], [-7.2, 18.4], [-9.4, 19.6], [-8.4, 25]], 2);
  const body = [];
  body.push({
    shapes: [outline], fill: { stops: [[0, '#6fd3d0'], [0.35, K.turq], [1, '#1f8a86']], dir: 'h' }, stroke: 'rgba(10,60,60,.8)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(0,50,60,.28)', light: 'rgba(230,255,250,.28)' });
      gloss(c, bb, { ang: 0, pos: 0.2, w: 0.1, a: 0.5, color: '240,255,252' });
      // Zierschriftbänder (nur Ornament): Reihen aus Strichen und Zeichen in Schwarz
      const ink = 'rgba(20,20,40,.88)';
      const seq = ['ankh', 'was', 'djed', 'water', 'feather', 'reed'];
      for (let r = 0; r < 4; r++) {
        const y = 3.4 + r * 3.1;
        ln(c, [[-6.2, y + 2.6], [6.2, y + 2.6]], ink, 0.13, 0.7);
        for (let i = 0; i < 4; i++) glyph(c, seq[(i + r * 2) % seq.length], -4.2 + i * 2.8, y + 0.15, 2.2, ink, 0.22);
      }
      // gekreuzte Arme + Hacken

    },
  });
  // Hände mit Hacken
  body.push(inlay([limb([[-6.6, 19.4, 2.2], [-2, 17.6, 2.2], [3.2, 16.4, 2.2]], { per: 6 }), limb([[6.6, 19.4, 2.2], [2, 17.6, 2.2], [-3.2, 16.4, 2.2]], { per: 6 })], '#47c4bc', { bevel: false, volume: false, stroke: 'rgba(10,60,60,.6)' }));
  const hoes = [limb([[-6.4, 20.5, 0.5], [-7.2, 18.2, 0.5], [-8.2, 15.4, 0.5]], { per: 3 }), limb([[6.4, 20.5, 0.5], [7.2, 18.2, 0.5], [8.2, 15.4, 0.5]], { per: 3 })];
  body.push(inlay(hoes, K.lapisLo, { stroke: null }));
  // Perücke (Lapis/Schwarz), Gesicht, Bart
  body.push({
    shapes: [wigL], fill: { stops: [[0, '#2f4f94'], [1, K.lapisLo]], dir: 'v' }, stroke: 'rgba(5,10,40,.85)',
    deco(c, bb) { for (let i = -4; i <= 4; i++) ln(c, [[i * 1.2, 29.2], [i * 1.35, 24.4]], 'rgba(150,185,240,.35)', 0.16); },
  });
  const face = poly([[-3.6, 28.6], [3.6, 28.6], [3.7, 25.8], [2.4, 23.4], [0, 22.8], [-2.4, 23.4], [-3.7, 25.8]], 2);
  body.push({
    shapes: [face], fill: { stops: [[0, '#8fe5e0'], [1, '#32b7ae']], dir: 'v' }, stroke: 'rgba(10,60,60,.8)',
    deco(c) {
      for (const sg of [-1, 1]) { ln(c, [[sg * 0.9, 26.6], [sg * 2.0, 26.9], [sg * 3.1, 26.5]], K.ebony, 0.28); dotAt(c, sg * 1.7, 26.5, 0.25, K.ebony); }
      ln(c, [[0, 26.2], [0, 24.8]], 'rgba(10,60,60,.5)', 0.2); ln(c, [[-0.8, 24.1], [0, 23.9], [0.8, 24.1]], 'rgba(120,30,20,.8)', 0.22);
    },
  });
  body.push(inlay([poly([[-0.9, 22.8], [0.9, 22.8], [1, 20.4], [0, 19.6], [-1, 20.4]], 1)], K.lapisLo, { stroke: 'rgba(5,10,40,.8)' }));
  return spec('ushabti', 'Uschebti', { body: { z: 1, layers: body } }, { head: [0, 26], hands: [0, 18] },
    { heightM: 0.3, ranges: {}, desc: 'Totenfigürchen aus blauer Fayence: soll im Jenseits für den Verstorbenen arbeiten' }, { h: opts.h || 0.3 });
}

// ---- Kartusche (Namensring) --------------------------------------------------------------------------------------------------------------------------
export function kartusche(opts = {}) {
  // Aufrechtes Oval aus einem Seilring mit Querstrich unten; Zierzeichen innen (opts.signs oder Standard)
  const signs = opts.signs || ['ankh', 'was', 'djed'];
  const outer = blob(0, 30, 11.4, 29.8, 0, 56);
  const ringShape = ring(0, 30, 0, 1, 0, TAU, 4); // Platzhalter (nicht verwendet)
  const rope = [];
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU;
    const x = Math.cos(a) * 9.8, y = 30 + Math.sin(a) * 28.2;
    rope.push(blob(x, y, 1.9, 1.9, 0, 10));
  }
  const field = blob(0, 30, 8.4, 26.6, 0, 56);
  const bar = poly(rrect(-12.8, 0.4, 12.8, 3.9, 1.3, 4), 0);
  const layers = [];
  layers.push(gold([outer, bar], { dir: 'h', ga: 0.3 }));
  layers.push({
    shapes: [field], fill: { stops: [[0, '#fff6dc'], [1, '#efe0b4']], dir: 'v' }, stroke: 'rgba(110,70,15,.8)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(110,80,30,.18)', light: 'rgba(255,255,255,.2)' });
      const n = signs.length;
      for (let i = 0; i < n; i++) glyph(c, signs[i], 0, 10 + i * (40 / n), Math.min(15, 36 / n), i % 2 ? K.lapisLo : K.carnLo, 0.9);
    },
  });
  // Seilwindungen auf dem Ring (diagonale Striche)
  layers.push({
    shapes: [outer], fill: 'rgba(0,0,0,0)', stroke: null,
    deco(c) {
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU, c0 = Math.cos(a), s0 = Math.sin(a);
        seg(c, [c0 * 8.9, 30 + s0 * 26.9], [c0 * 11.9 + 0.6 * s0, 30 + s0 * 29.9 - 0.6 * c0], 'rgba(120,70,8,.55)', 0.4);
      }
    },
  });
  void ringShape; void rope;
  return spec('kartusche', 'Kartusche (Namensring)', { body: { z: 1, layers } }, { center: [0, 30] },
    { heightM: 0.6, ranges: {}, desc: 'Ovaler Namensring der Pharaonen: Das Seil schützt den Namen; hier mit Zierzeichen (Anch, Was, Djed)' }, { h: opts.h || 0.6 });
}
