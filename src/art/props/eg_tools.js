// Gruppe O3 – Werkzeug & Baustelle: steinblock, schlitten (Parts body, steinblock, seil), mahlstein, hacke, netz, kupfermeissel, holzschlaegel, messleine.
// Alle Maße in Metern, Blick nach +x, Boden y=0.
import {
  P, blob, limb, poly, spline, mk, L, rect, rrect, ring, quader, lump, polyline, rotPts, speckle, hatch, grain, gloss, bevel, ropeTwist, ropePolys,
  fillPoly, strokePoly, curve, strokes, line, dot, rngOf, norm, volume, TAU,
} from './_eg_daily_kit.js';

// ------------------------------------------------------------------------------------------------
// Kalksteinblock 1 m: Quader in leichter Schrägsicht, Meißelspuren, Fossilien, rote Maurerlinie, abgeschlagene Ecke
function blockLayers(x0, y0, w, h, dx, dy, seed, { rope = false } = {}) {
  const q = quader(x0, y0, w, h, dx, dy);
  const chip = poly([[x0, y0], [x0 + w - 0.12, y0], [x0 + w - 0.03, y0 + 0.07], [x0 + w, y0 + 0.16], [x0 + w, y0 + h], [x0, y0 + h]], 0);
  const stone = (c, bb, base, n) => {
    speckle(c, bb, ['#bfae8a', '#fff6dc', '#cdbb94'], n, 0.003, 0.012, seed, 0.5);
  };
  return [
    {
      shapes: [q.side], fill: '#c3b08a',
      deco(c, bb) { stone(c, bb, null, 40); hatch(c, bb, 'rgba(90,70,40,.3)', 0.04, 1.0, 0.004, 1); volume(c, bb, { dark: 'rgba(60,40,20,.25)', light: 'rgba(255,240,200,.05)' }); },
    },
    {
      shapes: [q.top], fill: '#f0e5c4',
      deco(c, bb) {
        stone(c, bb, null, 40);
        const r = rngOf(seed, 3);
        for (let i = 0; i < 18; i++) { const x = bb.x0 + r() * bb.w, y = bb.y0 + r() * bb.h; strokes(c, [[x, y, x + 0.05, y + 0.012]], 'rgba(150,125,85,.4)', 0.004, 1); }
      },
    },
    {
      shapes: [chip], fill: { stops: [[0, '#e8dab6'], [1, '#d4c39c']], dir: 'v' },
      deco(c, bb) {
        stone(c, bb, null, 120);
        const r = rngOf(seed, 9);
        // Meißelspuren: kurze, schräge Doppelstriche in Feldern
        for (let i = 0; i < 70; i++) {
          const x = bb.x0 + 0.04 + r() * (bb.w - 0.08), y = bb.y0 + 0.04 + r() * (bb.h - 0.08), l = 0.04 + r() * 0.06;
          strokes(c, [[x, y, x + l, y + l * 0.7], [x + 0.012, y - 0.01, x + l + 0.012, y + l * 0.7 - 0.01]], 'rgba(120,98,62,.38)', 0.004, 1);
        }
        // Fossilien (Nummuliten): kleine Scheibchen
        for (let i = 0; i < 9; i++) {
          const x = bb.x0 + 0.08 + r() * (bb.w - 0.16), y = bb.y0 + 0.06 + r() * (bb.h - 0.12), rr = 0.012 + r() * 0.012;
          fillPoly(c, blob(x, y, rr, rr * 0.7, 0.3, 12), '#f7efd4', 0.9); strokePoly(c, blob(x, y, rr, rr * 0.7, 0.3, 12), 'rgba(110,90,60,.6)', 0.003, 1);
        }
        // rote Maurerlinie und Zeichen (Arbeitertrupp)
        line(c, [[bb.x0 + 0.04, bb.y0 + h * 0.5], [bb.x1 - 0.05, bb.y0 + h * 0.5 + 0.01]], '#b8501f', 0.012, { alpha: 0.75 });
        line(c, [[bb.x0 + w * 0.2, bb.y0 + h * 0.2], [bb.x0 + w * 0.2 + 0.05, bb.y0 + h * 0.2 + 0.07], [bb.x0 + w * 0.2 + 0.1, bb.y0 + h * 0.2]], '#b8501f', 0.012, { alpha: 0.75 });
        // Kanten
        line(c, [[bb.x0 + 0.005, bb.y1 - 0.01], [bb.x1, bb.y1 - 0.01]], '#fff8e0', 0.012, { alpha: 0.6 });
        if (rope) {
          for (const fx of [0.24, 0.74]) {
            const xs = bb.x0 + w * fx;
            const ctrl = [[xs, bb.y0 - 0.02], [xs + 0.01, bb.y0 + h * 0.5], [xs, bb.y1 + 0.02]];
            fillPoly(c, limb(ctrl.map((p) => [p[0], p[1], 0.045]), { per: 6 }), '#b79458');
            strokePoly(c, limb(ctrl.map((p) => [p[0], p[1], 0.045]), { per: 6 }), 'rgba(60,35,15,.7)', 0.004, 1);
            ropeTwist(c, ctrl, 0.045, 'rgba(70,45,20,.7)', 0.026);
          }
        }
        volume(c, bb, { dark: 'rgba(70,50,25,.22)', light: 'rgba(255,248,220,.15)' });
      },
    },
  ];
}

export function steinblock(opts = {}) {
  const o = norm(opts);
  const w = 1.0, h = 0.55;
  return mk('steinblock', 'Kalksteinblock', { body: { layers: blockLayers(0, 0, w, h, 0.17, 0.12, o.seed ?? 3, { rope: !!o.seil }) } },
    { top: [0.5, h + 0.12], front: [0.5, h * 0.5] }, { lengthM: 1.0, heightM: h + 0.12, material: 'Kalkstein' }, {});
}

// ------------------------------------------------------------------------------------------------
// Schlitten 2 m: zwei Kufen mit hochgebogenem Bug, Querbalken, Ladefläche, Steinblock mit Seilschlingen; Zugseil (Part `seil`)
export function schlitten(opts = {}) {
  const o = norm(opts);
  const withBlock = o.block !== false;
  const W = P.holz;
  const runner = limb([[-0.82, 0.07, 0.07], [-0.5, 0.045, 0.085], [0.4, 0.045, 0.085], [0.74, 0.07, 0.08], [0.9, 0.17, 0.075], [0.95, 0.27, 0.06]], { per: 9 });
  const runnerB = limb([[-0.74, 0.1, 0.06], [-0.5, 0.075, 0.07], [0.4, 0.075, 0.07], [0.7, 0.1, 0.07]], { per: 8 });
  const beams = [-0.62, -0.3, 0.02, 0.34, 0.62].map((x) => rrect(x - 0.045, 0.07, x + 0.045, 0.2, 0.015));
  const deck = rrect(-0.78, 0.17, 0.78, 0.25, 0.02);
  const wood = (c, bb) => { grain(c, bb, 'rgba(60,35,15,.45)', 40, { len: 0.2, w: 0.004, seed: 5 }); volume(c, bb, { dark: 'rgba(50,28,10,.3)', light: 'rgba(255,225,170,.12)' }); };
  const parts = {
    body: {
      z: 0,
      layers: [
        { shapes: [runnerB], fill: P.holzD, deco: wood },
        { shapes: beams, fill: { top: P.holzH, bottom: W }, deco(c, bb) { wood(c, bb); for (const x of [-0.62, -0.3, 0.02, 0.34, 0.62]) dot(c, x, 0.135, 0.018, 'rgba(60,35,15,.55)'); } },
        { shapes: [runner], fill: { top: W, bottom: P.holzD }, deco(c, bb) { wood(c, bb); line(c, [[-0.8, 0.09], [0.4, 0.075], [0.7, 0.095], [0.88, 0.19]], 'rgba(255,225,170,.4)', 0.012, { alpha: 1 }); } },
        { shapes: [deck], fill: { top: P.holzH, bottom: W }, deco(c, bb) { wood(c, bb); for (let x = -0.6; x < 0.8; x += 0.3) line(c, [[x, 0.17], [x, 0.25]], 'rgba(50,28,10,.5)', 0.005); } },
      ],
    },
  };
  if (withBlock) {
    parts.steinblock = { z: 1, layers: blockLayers(-0.5, 0.25, 0.98, 0.5, 0.11, 0.08, o.seed ?? 3, { rope: true }) };
  }
  // Zugseil vom Bug nach vorn, Schlinge am Ende
  const rc = [[0.94, 0.27], [1.05, 0.33], [1.22, 0.38], [1.42, 0.44]];
  parts.seil = {
    z: 2, pivot: [0.94, 0.27],
    layers: [
      {
        shapes: [...ropePolys(rc, 0.048), ring(1.5, 0.47, 0.07, 0.035, 20)], fill: '#b79458',
        deco(c, bb) { ropeTwist(c, rc, 0.048, 'rgba(70,45,20,.75)', 0.028); volume(c, bb, { dark: 'rgba(60,40,15,.25)', light: 'rgba(255,240,200,.18)' }); },
      },
    ],
  };
  return mk('schlitten', 'Schlitten mit Steinblock', parts, { seilende: [1.5, 0.47], bug: [0.94, 0.27], last: [0, 0.5] }, {
    lengthM: 2.3, heightM: 0.8, ranges: { seil: [0, 0.3] }, material: 'Zedernholz',
  }, {});
}
