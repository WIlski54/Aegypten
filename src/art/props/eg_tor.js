// Gruppe O2 – Tor der Unterwelt (id `tor_unterwelt`, 4,5 m hoch, ~4,7 m breit). Dokumentation: Kopf von eg_ritual.js.
// Parts: nacht (z0) < body (z1: Steinrahmen mit Flügelsonne) < flA, flB (z2: Türflügel, Pivot = untere Außenkante).
import {
  P, goldH, goldV, lapisV, lapisH, turqV, rect, rrect, shift, ring, limb, blob, poly, leaf, starPoly,
  ankhPolys, djedPolys, wasPolys, fillPoly, fillPolys, sparkle, cylinder, rectFill, ellipseFill, curve, volume, finish, rngOf, mix,
} from './_eg_ritual_kit.js';

/** Öffnet die Flügel um die senkrechte Achse (t 0..1, max ≈ 83°). flA schwingt links, flB rechts zum Betrachter hin. */
export function torOeffnen(fig, t, { max = 1.45 } = {}) {
  if (fig.parts.flA) fig.parts.flA.rotation.y = -t * max;
  if (fig.parts.flB) fig.parts.flB.rotation.y = t * max;
}

const OPEN = 1.2, LEAF_Y0 = 0.12, LEAF_Y1 = 3.7;

function leafPart(sg) {
  const x0 = sg < 0 ? -OPEN : -0.02, x1 = sg < 0 ? 0.02 : OPEN;
  const body = rect(x0, LEAF_Y0, x1, LEAF_Y1);
  const pxm = sg < 0 ? -0.6 : 0.6;            // Panelmitte
  const pw0 = pxm - 0.47, pw1 = pxm + 0.47;
  const panels = [[0.32, 1.52], [1.68, 2.92], [3.08, 3.56]];
  const hx = sg < 0 ? -0.08 : 0.08;           // Griff an der Mittelkante
  const handle = ring(hx * 1.0, 1.92, 0.12, 0.12, 0.062, 0.062, 28);
  const handleStem = rect(hx - 0.03, 1.8, hx + 0.03, 2.04);
  return {
    z: 2, pivot: [sg < 0 ? -OPEN : OPEN, LEAF_Y0],
    layers: [
      {
        shapes: [body], fill: lapisH,
        deco(c, bb) {
          volume(c, bb, { dark: 'rgba(0,0,40,0.3)', light: 'rgba(200,225,255,0.18)' });
          // Goldrahmen
          const fr = 0.07;
          rectFill(c, x0, LEAF_Y0, x1, LEAF_Y0 + fr, P.gold); rectFill(c, x0, LEAF_Y1 - fr, x1, LEAF_Y1, P.gold);
          rectFill(c, x0, LEAF_Y0, x0 + fr, LEAF_Y1, P.gold); rectFill(c, x1 - fr, LEAF_Y0, x1, LEAF_Y1, P.gold);
          rectFill(c, x0 + fr, LEAF_Y0 + fr, x1 - fr, LEAF_Y0 + fr + 0.02, P.goldLo, 0.55);
          // Felder
          panels.forEach(([y0, y1], i) => {
            rectFill(c, pw0 - 0.05, y0 - 0.05, pw1 + 0.05, y1 + 0.05, P.gold);
            rectFill(c, pw0 - 0.02, y0 - 0.02, pw1 + 0.02, y1 + 0.02, P.goldLo, 0.6);
            const { ctx } = c;
            fillPoly(c, rect(pw0, y0, pw1, y1), '#14307a');
            fillPoly(c, rect(pw0, y0, pw1, y0 + (y1 - y0) * 0.5), '#1c4590', 0.55);
            if (i === 0) fillPolys(c, djedPolys(pxm, y0 + 0.08, y1 - y0 - 0.16), P.gold);
            if (i === 1) fillPolys(c, ankhPolys(pxm, y0 + 0.08, y1 - y0 - 0.16, 1.15), P.gold);
            if (i === 2) for (let k = -2; k <= 2; k++) fillPoly(c, starPoly(pxm + k * 0.19, (y0 + y1) / 2, 0.075), P.turqHi);
            // Nieten
            for (const [sx, sy] of [[pw0 - 0.02, y0 - 0.02], [pw1 + 0.02, y0 - 0.02], [pw0 - 0.02, y1 + 0.02], [pw1 + 0.02, y1 + 0.02]]) ellipseFill(c, sx, sy, 0.028, 0.028, P.goldHi);
          });
          sparkle(c, x0 + 0.2, 3.52, 0.07, { alpha: 0.6 });
        },
      },
      { shapes: [handle, handleStem], fill: goldH, deco(c, bb) { cylinder(c, bb); } },
    ],
  };
}

function wingFeathers(c, sg, y) {
  // drei Federreihen eines Flügels (Karneol unten lang, Türkis, Lapis oben kurz), Wurzel nahe der Scheibe, nach außen und leicht unten
  const rows = [
    { n: 11, L: 0.5, W: 0.085, y0: y - 0.1, col: P.carn, hi: P.carnHi, ang: -0.5, x0: 0.3, x1: 1.5 },
    { n: 11, L: 0.36, W: 0.075, y0: y - 0.03, col: P.turq, hi: P.turqHi, ang: -0.36, x0: 0.3, x1: 1.55 },
    { n: 11, L: 0.24, W: 0.065, y0: y + 0.04, col: P.lapisHi, hi: '#b6d0f5', ang: -0.2, x0: 0.3, x1: 1.6 },
  ];
  for (const r of rows) {
    for (let i = r.n - 1; i >= 0; i--) {
      const t = i / (r.n - 1), x = r.x0 + (r.x1 - r.x0) * t;
      const base = [sg * x, r.y0 + 0.02 * t];
      const a = sg > 0 ? r.ang : Math.PI - r.ang;
      const f = leaf(base[0], base[1], a, r.L, r.W, { fat: 0.55, n: 6 });
      fillPoly(c, f, r.col);
      fillPoly(c, leaf(base[0], base[1], a, r.L * 0.6, r.W * 0.4, { fat: 0.55, n: 6 }), r.hi, 0.6);
    }
  }
}

export function tor_unterwelt(opts = {}) {
  // ---- Steinrahmen (Gold) ----
  const postL = rect(-2.1, 0, -OPEN, 3.7), postR = rect(OPEN, 0, 2.1, 3.7);
  const lintel = rect(-2.1, 3.64, 2.1, 4.12);
  const cornice = poly([[-2.12, 4.1], [2.12, 4.1], [2.16, 4.2], [2.24, 4.36], [2.38, 4.5], [-2.38, 4.5], [-2.24, 4.36], [-2.16, 4.2]]);
  const sill = rect(-OPEN - 0.05, 0, OPEN + 0.05, 0.12);
  const rimX = 2.1;
  const frameLayer = {
    shapes: [postL, postR, lintel, cornice],
    fill: { stops: [[0, '#f0cf6a'], [0.5, '#e0b040'], [1, '#a77a26']], dir: 'v' },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,30,0,0.28)', light: 'rgba(255,250,210,0.25)' });
      // Pfosten: Lapis-Rand und Glyphenband
      for (const sg of [-1, 1]) {
        const xa = sg < 0 ? -2.1 : OPEN, xb = sg < 0 ? -OPEN : 2.1;
        rectFill(c, xa, 0, xb, 3.7, P.goldLo, 0.18);
        rectFill(c, xa + 0.06, 0.12, xb - 0.06, 3.6, P.lapisLo, 0.95);
        rectFill(c, xa + 0.09, 0.15, xb - 0.09, 3.57, '#1c4590', 0.95);
        const cx = (xa + xb) / 2;
        const seq = [ankhPolys, djedPolys, wasPolys];
        for (let k = 0; k < 6; k++) fillPolys(c, seq[k % 3](cx, 0.22 + k * 0.56, 0.46, 1), P.gold);
        rectFill(c, xa + 0.06, 0.12, xb - 0.06, 0.15, P.gold, 0.9);
        rectFill(c, xa + 0.06, 3.57, xb - 0.06, 3.6, P.gold, 0.9);
      }
      // Flügelsonne am Sturz
      fillPoly(c, rect(-2.1, 3.64, 2.1, 4.12), P.lapisLo, 0.0);
      rectFill(c, -2.0, 3.7, 2.0, 4.06, '#1c3f84', 0.95);
      rectFill(c, -2.0, 3.7, 2.0, 3.73, P.gold, 0.9); rectFill(c, -2.0, 4.03, 2.0, 4.06, P.gold, 0.9);
      for (const sg of [-1, 1]) wingFeathers(c, sg, 3.93);
      // Sonnenscheibe + Uräen
      ellipseFill(c, 0, 3.9, 0.2, 0.2, P.goldLo); ellipseFill(c, 0, 3.9, 0.17, 0.17, P.gold); ellipseFill(c, 0, 3.9, 0.11, 0.11, P.carn); ellipseFill(c, -0.03, 3.93, 0.04, 0.04, P.carnHi);
      for (const sg of [-1, 1]) {
        fillPoly(c, limb([[sg * 0.27, 3.74, 0.07], [sg * 0.27, 3.86, 0.06], [sg * 0.27, 3.95, 0.05], [sg * 0.25, 4.02, 0.07]], { per: 5 }), P.papy);
        ellipseFill(c, sg * 0.25, 4.03, 0.05, 0.05, P.gold);
      }
      // Hohlkehle: Palmblatt-Fries
      for (let k = 0; k < 28; k++) {
        const x = -2.2 + k * 0.158; const col = [P.lapis, P.turq, P.carn][k % 3];
        rectFill(c, x, 4.14, x + 0.118, 4.34, col, 0.95);
        rectFill(c, x + 0.118, 4.14, x + 0.158, 4.34, P.goldLo, 0.55);
      }
      rectFill(c, -2.4, 4.44, 2.4, 4.5, P.gold, 0.9);
      sparkle(c, -1.9, 4.38, 0.1);
    },
  };
  const sillLayer = {
    shapes: [sill], fill: { top: '#ead09a', bottom: '#b3935a' },
    deco(c, bb) { volume(c, bb); },
  };
  const rng = rngOf(opts.seed ?? 3, 5);
  const nightRect = rect(-OPEN - 0.12, 0.1, OPEN + 0.12, 3.78);
  const nacht = {
    z: 0, layers: [{
      shapes: [nightRect], fill: { stops: [[0, '#0b1230'], [0.55, '#14307a'], [1, '#0b1230']], dir: 'v' },
      deco(c, bb) {
        // warmer Horizont unten (Hoffnung auf den Sonnenaufgang)
        const { ctx, tf } = c; const [x0, y0] = tf(0, 0.1), [x1, y1] = tf(0, 1.9);
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, 'rgba(224,150,60,0.75)'); g.addColorStop(0.5, 'rgba(192,67,46,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, c.W, c.H); ctx.restore();
        for (let k = 0; k < 46; k++) {
          const x = -1.25 + rng() * 2.5, y = 0.7 + rng() * 3.0, r = 0.04 + rng() * 0.055;
          fillPoly(c, starPoly(x, y, r), k % 4 === 0 ? P.turqHi : P.goldHi, 0.95);
        }
        for (let k = 0; k < 6; k++) sparkle(c, -1.1 + rng() * 2.2, 1.0 + rng() * 2.6, 0.08, { color: '#fff6d0' });
      },
    }],
  };
  const spec = {
    id: 'tor_unterwelt',
    parts: { nacht, body: { z: 1, layers: [frameLayer, sillLayer] }, flA: leafPart(-1), flB: leafPart(1) },
    anchors: {
      base: [0, 0], top: [0, 4.5], mitte: [0, 1.9], oeffnung: [0, 1.9], hingeA: [-OPEN, LEAF_Y0], hingeB: [OPEN, LEAF_Y0], sonne: [0, 3.9],
    },
    meta: {
      name: 'Tor der Unterwelt', heightM: 4.5,
      ranges: { flA: [0, 0.9], flB: [0, -0.9] }, swing: {},
      hinge: 'Schwingen um senkrechte Achse: torOeffnen(fig, t) setzt flA.rotation.y=-t*1.45, flB.rotation.y=+t*1.45',
    },
  };
  return finish(spec, { h: opts.h ?? 4.5 });
}
