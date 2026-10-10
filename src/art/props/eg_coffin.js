// Gruppe O1 – Särge: sarkophag_gold (anthropoider Goldsarg, Parts `body` = Sargtrog, `lid` = abnehmbarer Deckel) und
// sarkophag_stein (Quarzit-Steinsarkophag mit Granitdeckel, `body` + `lid`). Gebaut in cm.
import {
  K, spec, blob, limb, poly, rect, rrect, stroke2poly, sym, shade, mix, fillPoly, place, bandedLimb, spline, intersect, clipEach, subtract, halfWidthAt, rngOf,
  gold, inlay, flat, goldFill, bevel, gloss, volume, seg, ln, dotAt, ellipseAt, bands, uraeusFront, glyph, TAU,
} from './_eg_royal_kit.js';
import { maskLayers } from './eg_mask.js';

const PI = Math.PI;

// Umriss des Mumienkörpers (Höhe 200, Mitte x=0); `grow` vergrößert seitlich (Sargtrog)
const MUMMY = [
  [0, 200.5], [8, 199.5], [13.4, 194], [15.6, 186], [17.4, 178], [19.4, 171], [24.6, 167], [26.8, 160], [26.4, 150], [25.4, 130], [24, 110],
  [22.6, 90], [21, 70], [19, 45], [17.4, 20], [16.6, 6], [15.6, 0], [0, 0],
];
function mummyOutline(grow = 0, top = 0) {
  const g = grow;
  const pts = MUMMY.map(([x, y], i) => [i === 0 || i === MUMMY.length - 1 ? x : x + (y > 168 ? g * 0.3 : g), y === 200.5 ? y + top : y === 0 ? -grow * 0.4 : y]);
  return sym(pts, 1);
}

// Flügelfächer (Geier und Kobra umfassen den Körper): Federn in drei Reihen
function wingFan(sg, px, py, clip) {
  const rows = [[], [], []];
  const cfg = [{ L: 52, w: 6.6, n: 9 }, { L: 40, w: 6.4, n: 9 }, { L: 28, w: 6.0, n: 9 }];
  cfg.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const t = i / (r.n - 1);
      const th = -PI / 2 + sg * (0.03 + t * 0.95);
      const dx = Math.cos(th), dy = Math.sin(th);
      const L = r.L * (1 - 0.1 * t);
      rows[ri].push(blob(px + dx * L / 2, py + dy * L / 2, r.w / 2, L / 2, th + PI / 2, 12));
    }
  });
  const cl = (arr) => clipEach(arr, clip);
  return [inlay(cl(rows[0]), K.lapis, { bevel: true, volume: false }), inlay(cl(rows[1]), K.carn, { bevel: true, volume: false }), inlay(cl(rows[2]), K.turq, { bevel: true, volume: false })];
}

// Rishi-Federmuster (Schuppen) unten, Reihen von unten nach oben, obere Reihen überdecken die unteren
function featherRows(y0, y1, clip) {
  const layers = [];
  const rowsN = 9, h = (y1 - y0) / rowsN;
  const cols = [K.lapis, K.carn, K.turq];
  for (let r = 0; r < rowsN; r++) {
    const y = y0 + r * h;
    const n = 6;
    const w = 40 / n;
    const groups = [[], [], []];
    for (let i = -1; i < n + 1; i++) {
      const x = -20 + i * w + (r % 2 ? w / 2 : 0) + w / 2;
      const pts = [[x - w / 2, y + h * 2.1], [x + w / 2, y + h * 2.1]];
      for (let k = 0; k <= 10; k++) { const a = (k / 10) * PI; pts.push([x + Math.cos(a) * w / 2, y + h * 0.9 - Math.sin(a) * h * 0.9]); }
      groups[(((i + r) % 3) + 3) % 3].push(pts);
    }
    groups.forEach((g, gi) => layers.push(inlay(clipEach(g, clip), cols[gi], { bevel: true, volume: false })));
  }
  return layers;
}

export function sarkophag_gold(opts = {}) {
  // ---- Deckel ----
  const lidOutline = mummyOutline(0, 0);
  const inner = mummyOutline(-2.6, 0);
  const lid = [];
  lid.push(gold([lidOutline], { dir: 'h', ga: 0.35 }));
  lid.push(...featherRows(5, 78, inner));
  lid.push(...wingFan(-1, -1.5, 121, inner), ...wingFan(1, 1.5, 121, inner));
  // Querband unter dem Kragen
  lid.push(gold([rect(-24.6, 119.6, 24.6, 124)], { dir: 'v', gloss: false }));
  // Arme (gekreuzt) und die gestreiften Zepter darauf
  const armR = limb([[22, 134, 5.4], [10, 129.5, 5.4], [-5, 125, 5.2]], { per: 8 });
  const armL = limb([[-22, 134, 5.4], [-10, 129.5, 5.4], [5, 125, 5.2]], { per: 8 });
  lid.push(gold([armR, armL], { dir: 'v' }));
  const crookSeg = bandedLimb([[7, 124.4, 3.2], [-2, 128.2, 3.2], [-12, 132.4, 3.2], [-21, 136.8, 3.0], [-24.4, 140.2, 2.6]], 9);
  const flailSeg = bandedLimb([[-7, 124.4, 3.2], [2, 128.2, 3.2], [12, 132.4, 3.2], [21, 136.8, 3.0]], 8);
  lid.push(inlay([...crookSeg.filter((_, i) => i % 2 === 0), ...flailSeg.filter((_, i) => i % 2 === 0)], K.lapis, { bevel: true }));
  lid.push(gold([...crookSeg.filter((_, i) => i % 2 === 1), ...flailSeg.filter((_, i) => i % 2 === 1)], { dir: 'v', gloss: false }));
  // Fäuste
  lid.push(gold([blob(-6.4, 124.4, 3.6, 3.3, 0.3, 16), blob(6.4, 124.4, 3.6, 3.3, -0.3, 16)], { dir: 'v' }));
  // Wedelschnüre (hängen von der rechten Schulter)
  const beadsDown = [];
  for (const [x, y] of [[21.5, 135], [23, 135.4], [24.4, 135.8]]) for (let k = 0; k < 4; k++) beadsDown.push(blob(x + 0.2 * k, y - 2.2 - k * 3.4 + 7, 1.2, 1.2, 0, 10));
  lid.push(inlay(beadsDown, K.carn, { bevel: true, volume: false }));
  // Kopf = Maske (Nemes, Gesicht, Kragen, Bart, Geier + Kobra)
  lid.push(...place(maskLayers(), 1.12, 0, 135));
  // Fußsaum
  lid.push(gold([rect(-16, 0, 16, 4.4)], { dir: 'v', gloss: false, deco(c) { for (let i = 0; i < 9; i++) dotAt(c, -13.4 + i * 3.35, 2.2, 0.8, i % 2 ? K.lapis : K.carn); } }));

  // ---- Sargtrog (Kasten) mit Leinenfüllung ----
  const caseOuter = mummyOutline(3.6, 2);
  const caseInner = mummyOutline(-1.2, 0);
  const body = [];
  body.push(gold([caseOuter], { dir: 'h', gloss: true, ga: 0.3, deco(c) {
    for (let i = 0; i < 26; i++) { const y = 10 + i * 6.6; for (const sg of [-1, 1]) dotAt(c, sg * (halfWidthAt(MUMMY, y) + 1.9), y, 0.75, i % 2 ? K.lapis : K.carn); }
  } }));
  body.push({
    shapes: [caseInner], fill: { stops: [[0, '#fbf6ea'], [0.5, K.linen], [1, K.linenSh]], dir: 'h' }, stroke: 'rgba(80,60,30,.5)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(110,85,40,.25)', light: 'rgba(255,255,255,.2)' });
      // Leinenbinden (diagonal)
      for (let y = 4; y < 200; y += 4.6) { ln(c, [[-26, y], [0, y + 3.2], [26, y]], 'rgba(150,125,85,.5)', 0.35); }
      // Goldene Perlennetz-Andeutung
      for (let y = 20; y < 160; y += 14) for (let x = -14; x <= 14; x += 14) dotAt(c, x + ((y / 14) % 2) * 7 - 3.5, y, 0.8, K.gold, 0.85);
    },
  });
  const parts = {
    body: { z: 1, layers: body },
    lid: { z: 2, pivot: [0, 100], layers: lid },
  };
  return spec('sarkophag_gold', 'Goldsarg (anthropoid)', parts, { head: [0, 182], chest: [0, 125], foot: [0, 4], lidTop: [0, 200] },
    { heightM: 2.0, ranges: { lid: [0, 0.35] }, desc: 'Anthropoider Sarg aus Gold mit Einlagen: Deckel (lid) lässt sich abheben, darunter der Sargtrog' }, { h: opts.h || 2.0 });
}

// ---- Quarzit-Steinsarkophag (Längsseite) ---------------------------------------------------------------------------------------
function speckles(c, bb, n, cols, rmax, seed) {
  const r = rngOf(seed, 5);
  for (let i = 0; i < n; i++) dotAt(c, bb.x0 + r() * bb.w, bb.y0 + r() * bb.h, 0.25 + r() * rmax, cols[Math.floor(r() * cols.length)], 0.5 + r() * 0.4);
}
// Geflügelte Schutzgöttin im Flachrelief, schaut nach +x (sg = Ausrichtung). Höhe ca. 1.25*s
function goddess(c, cx, y0, s, sg, headdress) {
  const ink = 'rgba(80,50,22,.8)', lite = 'rgba(255,240,205,.34)', dark = 'rgba(80,50,22,.2)';
  const X = (x) => cx + sg * x * s, Y = (y) => y0 + y * s;
  const Q = (pts) => pts.map(([a, b]) => [X(a), Y(b)]);
  const fillQ = (pts, col) => { fillPoly(c, Q(pts), col); const q = Q(pts); ln(c, q.concat([q[0]]), ink, 0.012 * s); };
  // Flügel (hinter dem Körper): zwei breite Schwingen nach unten gefaltet
  fillQ([[-0.5, 0.78], [-0.1, 0.84], [-0.04, 0.2], [-0.2, 0.08], [-0.46, 0.2]], dark);
  fillQ([[0.5, 0.78], [0.1, 0.84], [0.04, 0.2], [0.2, 0.08], [0.46, 0.2]], dark);
  for (let i = 1; i < 5; i++) { ln(c, Q([[-0.1 - i * 0.09, 0.82 - i * 0.012], [-0.07 - i * 0.09, 0.2 + i * 0.01]]), ink, 0.008 * s); ln(c, Q([[0.1 + i * 0.09, 0.82 - i * 0.012], [0.07 + i * 0.09, 0.2 + i * 0.01]]), ink, 0.008 * s); }
  // Kleid und Arme
  fillQ([[-0.1, 0.8], [0.1, 0.8], [0.13, 0.06], [-0.13, 0.06]], lite);
  ln(c, Q([[-0.1, 0.72], [-0.34, 0.6]]), ink, 0.012 * s); ln(c, Q([[0.1, 0.72], [0.34, 0.6]]), ink, 0.012 * s);
  // Kopf im Profil + Perücke
  fillQ([[-0.06, 0.82], [0.06, 0.82], [0.1, 0.94], [0.05, 1.04], [-0.06, 1.02]], lite);
  fillQ([[-0.09, 0.8], [-0.09, 1.02], [-0.04, 1.06], [0.0, 0.86]], 'rgba(40,25,10,.55)');
  // Kopfschmuck
  if (headdress === 'thron') fillQ([[-0.07, 1.02], [0.06, 1.02], [0.06, 1.14], [0.0, 1.14], [0.0, 1.24], [-0.07, 1.24]], lite);
  else { fillQ([[-0.09, 1.04], [0.09, 1.04], [0.08, 1.12], [-0.08, 1.12]], lite); fillQ([[-0.05, 1.12], [0.05, 1.12], [0.04, 1.22], [-0.04, 1.22]], lite); }
}

export function sarkophag_stein(opts = {}) {
  const W = 130;
  const box = rect(-W, 12, W, 112);
  const plinth = rect(-W - 6, 0, W + 6, 12);
  const slab = poly(rrect(-W - 7, 112, W + 7, 140, 5, 6), 0);
  const stoneFill = { stops: [[0, '#e3bf8f'], [0.35, '#d6ad78'], [0.8, '#c39563'], [1, '#a97a4c']], dir: 'v' };
  const graniteFill = { stops: [[0, '#cf7a62'], [0.5, '#b3604b'], [1, '#8d4535']], dir: 'v' };
  const body = [];
  body.push({ shapes: [plinth], fill: { top: '#b78754', bottom: '#8a5f36' }, stroke: 'rgba(60,35,10,.55)', deco(c, bb) { volume(c, bb); speckles(c, bb, 80, ['#6b4a2a', '#f3d7a5'], 0.3, 3); bevel(c, [plinth], bb); } });
  body.push({
    shapes: [box], fill: stoneFill, stroke: 'rgba(60,35,10,.55)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(70,40,10,.3)', light: 'rgba(255,240,200,.2)' });
      speckles(c, bb, 420, ['#7b5a36', '#f6e2b8', '#a47e52'], 0.32, 7);
      gloss(c, bb, { ang: 0, pos: 0.12, w: 0.07, a: 0.3, color: '255,245,215' });
      bevel(c, [box], bb);
      const ink = 'rgba(80,50,22,.7)';
      // Zierbänder oben und unten (Anch-Was-Djed, nur Zierde)
      ln(c, [[-W + 8, 98], [W - 8, 98]], ink, 0.5); ln(c, [[-W + 8, 26], [W - 8, 26]], ink, 0.5);
      const trio = ['ankh', 'was', 'djed'];
      for (let i = 0; i < 20; i++) glyph(c, trio[i % 3], -W + 22 + i * ((2 * W - 44) / 19), 100.5, 8, ink, 0.55);
      for (let i = 0; i < 20; i++) glyph(c, trio[(i + 1) % 3], -W + 22 + i * ((2 * W - 44) / 19), 14.5, 8, ink, 0.55);
      // Eckgöttinnen
      goddess(c, -W + 38, 24, 62, 1, 'thron'); goddess(c, W - 38, 24, 62, -1, 'haus');
      // Udjat-Augen
      glyph(c, 'eye', -50, 54, 26, 'rgba(60,40,70,.9)', 1.1);
      glyph(c, 'eye', 50, 54, 26, 'rgba(60,40,70,.9)', 1.1);
      // Mitte: Schenring-Kartusche-Andeutung als Zierleiste
      for (let i = 0; i < 3; i++) glyph(c, trio[i], -12 + i * 12, 46, 18, ink, 0.8);
    },
  });
  const lid = [{
    shapes: [slab], fill: graniteFill, stroke: 'rgba(50,20,10,.6)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,10,5,.35)', light: 'rgba(255,200,170,.25)' });
      speckles(c, bb, 520, ['#3a1d16', '#f0cfc0', '#6a3024', '#201010'], 0.38, 11);
      gloss(c, bb, { ang: 0, pos: 0.15, w: 0.08, a: 0.3, color: '255,220,200' });
      bevel(c, [slab], bb);
    },
  }];
  const parts = { body: { z: 1, layers: body }, lid: { z: 2, pivot: [-W - 7, 112], layers: lid } };
  return spec('sarkophag_stein', 'Steinsarkophag aus Quarzit', parts, { lidTop: [0, 140], front: [0, 60] },
    { lengthM: 2.6, ranges: { lid: [0, 0.3] }, desc: 'Sarkophag aus Quarzit mit Granitdeckel; Pivot des Deckels an der linken Unterkante' }, { w: opts.w || 2.6 });
}
