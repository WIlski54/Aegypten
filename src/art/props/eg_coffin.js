// Gruppe O1 – Särge: sarkophag_gold (anthropoider Goldsarg, Parts `body` = Sargtrog, `lid` = abnehmbarer Deckel) und
// sarkophag_stein (Quarzit-Steinsarkophag mit Granitdeckel, `body` + `lid`). Gebaut in cm.
import {
  K, spec, blob, limb, poly, rect, rrect, stroke2poly, sym, shade, mix, fillPoly, place, bandedLimb, spline,
  gold, inlay, flat, goldFill, bevel, gloss, volume, seg, ln, dotAt, ellipseAt, bands, uraeusFront, glyph, TAU,
} from './_eg_royal_kit.js';
import { maskLayers } from './eg_mask.js';

const PI = Math.PI;

// Umriss des Mumienkörpers (Höhe 200, Mitte x=0); `grow` vergrößert seitlich (Sargtrog)
function mummyOutline(grow = 0, top = 0) {
  const g = grow;
  return sym([
    [0, 200.5 + top], [8, 199.5 + top], [13.4, 194 + top / 2], [15.6, 186], [17.4, 178], [19.4, 171], [24.6 + g, 167], [26.8 + g, 160], [26.4 + g, 150], [25.4 + g, 130], [24 + g, 110],
    [22.6 + g, 90], [21 + g, 70], [19 + g, 45], [17.4 + g, 20], [16.6 + g, 6], [15.6 + g, 0 - grow * 0.4], [0, 0 - grow * 0.4],
  ], 1);
}

// Flügelfächer (Geier und Kobra umfassen den Körper): Federn in drei Reihen
function wingFan(sg, px, py) {
  const rows = [[], [], []];
  const cfg = [{ L: 50, w: 6.2, n: 9, col: 0 }, { L: 38, w: 6.0, n: 9, col: 1 }, { L: 26, w: 5.6, n: 9, col: 2 }];
  cfg.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const t = i / (r.n - 1);
      const th = -PI / 2 + sg * (0.1 + t * 1.12);
      const dx = Math.cos(th), dy = Math.sin(th);
      const L = r.L * (1 - 0.22 * Math.abs(t - 0.35));
      rows[ri].push(blob(px + dx * L / 2, py + dy * L / 2, r.w / 2, L / 2, th - PI / 2 + PI, 12));
    }
  });
  return [inlay(rows[0], K.lapis, { bevel: true, volume: false }), inlay(rows[1], K.carn, { bevel: true, volume: false }), inlay(rows[2], K.turq, { bevel: true, volume: false })];
}

// Rishi-Federmuster (Schuppen) unten
function featherRows(y0, y1) {
  const out = [[], [], []];
  const rowsN = 7, h = (y1 - y0) / rowsN;
  for (let r = 0; r < rowsN; r++) {
    const y = y0 + r * h;
    const n = 6 + (r % 2 ? 0 : 1);
    const w = 36 / n;
    for (let i = 0; i < n + 1; i++) {
      const x = -18 + i * w + (r % 2 ? w / 2 : 0);
      out[(i + r) % 3].push(blob(x, y + h * 0.6, w * 0.55, h * 0.9, 0, 14));
    }
  }
  return [inlay(out[0], K.lapis, { bevel: true, volume: false }), inlay(out[1], K.carn, { bevel: true, volume: false }), inlay(out[2], K.turq, { bevel: true, volume: false })];
}

export function sarkophag_gold(opts = {}) {
  // ---- Deckel ----
  const lidOutline = mummyOutline(0, 0);
  const lid = [];
  lid.push(gold([lidOutline], { dir: 'h', ga: 0.35 }));
  // Rishi unten + Flügel + Zepter + Kopf
  lid.push(...featherRows(6, 76));
  lid.push(...wingFan(-1, -1, 120), ...wingFan(1, 1, 120));
  // Querband unter dem Kragen
  lid.push(gold([rect(-24.6, 119.4, 24.6, 124)], { dir: 'v', gloss: false }));
  // Arme (gekreuzt): von der Schulter schräg zur gegenüberliegenden Hand
  const armR = limb([[22, 136, 6.6], [10, 130.5, 6.4], [-4, 125.5, 6.2]], { per: 8 });
  const armL = limb([[-22, 136, 6.6], [-10, 130.5, 6.4], [4, 125.5, 6.2]], { per: 8 });
  const hands = [blob(-5, 125.4, 4.3, 3.9, 0.3, 16), blob(5, 125.4, 4.3, 3.9, -0.3, 16)];
  lid.push(gold([armR, armL], { dir: 'v', deco(c) {
    for (const sg of [-1, 1]) { ln(c, [[sg * 14, 133.4], [sg * 14.4, 127.8]], K.lapis, 1.1); ln(c, [[sg * 17, 134.4], [sg * 17.4, 129]], K.carn, 1.1); }
  } }));
  // Krummstab (rechts hängend) und Wedel (links): aus Gliedern, Spitzen über der Brust
  const crookSeg = bandedLimb([[4.6, 125, 3.2], [10, 112, 3.2], [15, 96, 3.2], [19, 82, 3.2]], 8);
  const flailSeg = bandedLimb([[-4.6, 125, 3.2], [-10, 112, 3.2], [-15, 96, 3.2], [-19, 82, 3.2]], 8);
  lid.push(inlay([...crookSeg.filter((_, i) => i % 2 === 0), ...flailSeg.filter((_, i) => i % 2 === 0)], K.lapis, { bevel: true }));
  lid.push(gold([...crookSeg.filter((_, i) => i % 2 === 1), ...flailSeg.filter((_, i) => i % 2 === 1)], { dir: 'v', gloss: false }));
  lid.push(gold(hands, { dir: 'v' }));
  // Perlenschnüre am Wedel
  const strands = [[-19, 82], [-21.5, 70], [-23, 58]].map((p, k) => limb([[p[0], p[1], 0.9], [p[0] - 0.5, p[1] - 6, 0.9], [p[0] - 0.2, p[1] - 12, 0.9]], { per: 4 }));
  lid.push(gold(strands, { dir: 'v', gloss: false }));
  // Kopf = Maske (Nemes, Gesicht, Kragen, Bart, Geier + Kobra)
  lid.push(...place(maskLayers(), 1.12, 0, 135));
  // Fußsaum
  lid.push(gold([rect(-16, 0, 16, 4.4)], { dir: 'v', gloss: false, deco(c) { for (let i = 0; i < 9; i++) dotAt(c, -13.4 + i * 3.35, 2.2, 0.8, i % 2 ? K.lapis : K.carn); } }));

  // ---- Sargtrog (Kasten) mit Leinenfüllung ----
  const caseOuter = mummyOutline(3.6, 2);
  const caseInner = mummyOutline(-1.2, 0);
  const body = [];
  body.push(gold([caseOuter], { dir: 'h', gloss: true, ga: 0.3, deco(c) {
    for (let i = 0; i < 26; i++) { const y = 10 + i * 7.2; for (const sg of [-1, 1]) dotAt(c, sg * (22 + (y > 120 ? 4 : 0) - (y < 40 ? 3 : 0)), y, 0.7, i % 2 ? K.lapis : K.carn); }
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
