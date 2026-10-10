// Gruppe O3 – Werkzeug & Baustelle: steinblock, schlitten (Parts body, steinblock, seil), mahlstein, hacke, netz, kupfermeissel, holzschlaegel, messleine.
// Alle Maße in Metern, Blick nach +x, Boden y=0.
import {
  P, blob, limb, poly, spline, mk, L, rect, rrect, ring, quader, lump, polyline, rotPts, speckle, hatch, grain, gloss, bevel, ropeTwist, ropePolys, rotCtx, clipConvex,
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

// ------------------------------------------------------------------------------------------------
// Hacke 0,8 m: zweiteilige Holzhacke (Stiel + Blatt), mit Seil verzurrt; die Blattspitze steht auf dem Boden
export function hacke(opts = {}) {
  const handle = limb([[-0.33, 0.82, 0.05], [-0.2, 0.62, 0.055], [-0.07, 0.42, 0.06], [0.02, 0.28, 0.06]], { per: 8 });
  const blade = poly([[-0.05, 0.4], [0.04, 0.38], [0.4, 0.1], [0.44, 0.02], [0.43, -0.0], [0.3, -0.01], [-0.06, 0.28]], 1);
  const brace = limb([[-0.2, 0.58, 0.03], [0.0, 0.34, 0.03], [0.2, 0.2, 0.03]], { per: 6 });
  const wood = (c, bb) => { grain(c, bb, 'rgba(60,35,15,.45)', 24, { len: 0.18, w: 0.004, seed: 9, ang: -0.9 }); volume(c, bb, { dark: 'rgba(50,28,10,.3)', light: 'rgba(255,225,170,.15)' }); };
  const lash1 = [[-0.08, 0.36], [0.0, 0.32], [0.08, 0.26]], lash2 = [[-0.22, 0.6], [-0.16, 0.54], [-0.1, 0.5]];
  return mk('hacke', 'Hacke', {
    body: {
      layers: [
        { shapes: [blade], fill: { top: '#c08a52', bottom: '#9a6a3a' }, deco(c, bb) { wood(c, bb); fillPoly(c, [[0.44, 0.02], [0.43, 0.0], [0.3, -0.01], [0.33, 0.05], [0.4, 0.07]], 'rgba(60,35,15,.55)'); } },
        { shapes: [brace], fill: P.holzD, deco: wood },
        { shapes: [handle], fill: { top: '#b98349', bottom: '#8f5f30' }, deco(c, bb) { wood(c, bb); line(c, [[-0.34, 0.8], [-0.21, 0.6], [-0.08, 0.4]], 'rgba(255,230,180,.4)', 0.01); } },
        {
          shapes: [...ropePolys(lash1, 0.05), ...ropePolys(lash2, 0.04)], fill: '#c9a96a',
          deco(c, bb) { ropeTwist(c, lash1, 0.05, 'rgba(70,45,20,.8)', 0.022); ropeTwist(c, lash2, 0.04, 'rgba(70,45,20,.8)', 0.02); },
        },
      ],
    },
  }, { spitze: [0.42, 0.0], griff: [-0.33, 0.82] }, { lengthM: 0.8, material: 'Akazienholz, Seil' }, {});
}

// ------------------------------------------------------------------------------------------------
// Fischernetz 1 m: zwei Stangen, Oberleine mit Holzschwimmern, Netz mit echten Maschen (Löcher), Senksteine unten
export function netz(opts = {}) {
  const mesh = 0.125, sw = 0.02;
  const region = [[-0.44, 0.88], [0.44, 0.88], [0.47, 0.62], [0.39, 0.34], [0.17, 0.15], [-0.17, 0.15], [-0.39, 0.34], [-0.47, 0.62]].reverse();
  const strips = [];
  const knotPts = [];
  for (const dir of [1, -1]) {
    for (let k = -14; k <= 14; k++) {
      const d = [Math.SQRT1_2, dir * Math.SQRT1_2], n = [-d[1], d[0]];
      const o = [n[0] * k * mesh, 0.5 + n[1] * k * mesh];
      const a = [o[0] - d[0] * 1.6, o[1] - d[1] * 1.6], b = [o[0] + d[0] * 1.6, o[1] + d[1] * 1.6];
      const q = [[a[0] + n[0] * sw / 2, a[1] + n[1] * sw / 2], [b[0] + n[0] * sw / 2, b[1] + n[1] * sw / 2], [b[0] - n[0] * sw / 2, b[1] - n[1] * sw / 2], [a[0] - n[0] * sw / 2, a[1] - n[1] * sw / 2]];
      const cl = clipConvex(q, region);
      if (cl.length >= 3) strips.push(cl);
    }
  }
  // Knoten: Kreuzungen der beiden Scharen (u,v = Streifenindizes)
  for (let i = -14; i <= 14; i++) for (let j = -14; j <= 14; j++) {
    const x = (j - i) * mesh * Math.SQRT1_2 * Math.SQRT1_2 * 1 + 0, y = 0.5 + (i + j) * mesh * Math.SQRT1_2 * Math.SQRT1_2 * 1;
    void x; void y;
  }
  const edge = polyline([[-0.44, 0.88], [0.44, 0.88], [0.47, 0.62], [0.39, 0.34], [0.17, 0.15], [-0.17, 0.15], [-0.39, 0.34], [-0.47, 0.62], [-0.44, 0.88]], 0.026);
  const poleL = limb([[-0.52, 0.0, 0.05], [-0.5, 0.5, 0.045], [-0.47, 0.98, 0.04]], { per: 8 });
  const poleR = limb([[0.52, 0.0, 0.05], [0.5, 0.5, 0.045], [0.47, 0.98, 0.04]], { per: 8 });
  const top = limb([[-0.47, 0.9, 0.03], [-0.2, 0.86, 0.03], [0.2, 0.86, 0.03], [0.47, 0.9, 0.03]], { per: 8 });
  const floats = []; for (let i = 0; i < 7; i++) { const x = -0.36 + i * 0.12; floats.push(blob(x, 0.89, 0.04, 0.026, 0, 14)); }
  const sinkers = []; for (let i = 0; i < 7; i++) { const t = i / 6; const x = -0.34 + t * 0.68; const y = 0.15 + Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.2; sinkers.push(blob(x, y - 0.02, 0.026, 0.034, 0, 12)); }
  const wood = (c, bb) => { grain(c, bb, 'rgba(60,35,15,.45)', 14, { len: 0.2, w: 0.004, seed: 5, ang: 1.55 }); volume(c, bb, { dark: 'rgba(50,28,10,.3)', light: 'rgba(255,225,170,.15)' }); };
  return mk('netz', 'Fischernetz', {
    body: {
      layers: [
        { shapes: [poleL, poleR], fill: { top: '#b98349', bottom: '#8f5f30' }, deco: wood },
        { shapes: [edge, ...strips], fill: '#d9c28a', deco(c, bb) { volume(c, bb, { dark: 'rgba(90,60,20,.3)', light: 'rgba(255,245,210,.2)' }); } },
        { shapes: [top], fill: '#c9a96a', deco(c, bb) { ropeTwist(c, [[-0.47, 0.9], [-0.2, 0.86], [0.2, 0.86], [0.47, 0.9]], 0.03, 'rgba(70,45,20,.7)', 0.022); } },
        { shapes: floats, fill: { top: '#d4a560', bottom: '#9a6a3a' }, deco(c, bb) { for (let i = 0; i < 7; i++) line(c, [[-0.36 + i * 0.12, 0.872], [-0.36 + i * 0.12, 0.906]], 'rgba(60,35,15,.5)', 0.004); } },
        { shapes: sinkers, fill: { top: '#9b9288', bottom: '#6e675f' }, deco(c, bb) { speckle(c, bb, ['#d9d2c4', '#4a443d'], 14, 0.003, 0.006, 3, 0.6); } },
      ],
    },
  }, { oberleine: [0, 0.88], mitte: [0, 0.5] }, { lengthM: 1.0, material: 'Flachsnetz' }, {});
}

// ------------------------------------------------------------------------------------------------
// Kupfermeißel 0,35 m: Holzgriff mit Schnurwicklung, Kupferschaft mit grünlicher Patina, schräge Schneide; lehnt mit der Schneide am Boden
export function kupfermeissel(opts = {}) {
  const ang = -0.32;
  const R = (p) => rotPts(p, ang, 0, 0);
  const handle = rrect(-0.175, -0.03, -0.04, 0.03, 0.02);
  const shaft = poly([[-0.05, -0.016], [0.1, -0.017], [0.16, -0.032], [0.185, 0.0], [0.16, 0.032], [0.1, 0.017], [-0.05, 0.016]], 0);
  const bevelF = poly([[0.14, -0.026], [0.185, 0.0], [0.16, 0.032], [0.14, 0.022]], 0);
  return mk('kupfermeissel', 'Kupfermeißel', {
    body: {
      layers: [
        {
          shapes: [R(handle)], fill: { top: '#b98349', bottom: '#8f5f30' },
          deco(c, bb) {
            const r = rotCtx(c, ang);
            grain(r, { x0: -0.175, y0: -0.03, w: 0.135, h: 0.06 }, 'rgba(60,35,15,.5)', 8, { len: 0.06, w: 0.003, seed: 2 });
            for (let x = -0.16; x < -0.05; x += 0.014) line(r, [[x, -0.03], [x + 0.008, 0.03]], '#e8d9b4', 0.006, { alpha: 0.9 });
            line(r, [[-0.17, 0.014], [-0.045, 0.014]], 'rgba(255,230,180,.45)', 0.004);
          },
        },
        {
          shapes: [R(shaft)], fill: { top: '#e08a50', bottom: '#b3562c' },
          deco(c, bb) {
            const r = rotCtx(c, ang);
            fillPoly(r, blob(-0.03, 0.0, 0.03, 0.012, 0, 12), '#4fa58a', 0.7);
            fillPoly(r, blob(0.06, -0.004, 0.02, 0.008, 0, 10), '#4fa58a', 0.5);
            line(r, [[-0.04, 0.007], [0.15, 0.008]], 'rgba(255,225,180,.7)', 0.004);
            fillPoly(r, bevelF, '#f2b073', 0.9);
          },
        },
      ],
    },
  }, { schneide: [0.16, -0.05], griff: [-0.15, 0.02] }, { lengthM: 0.35, material: 'Kupfer' }, {});
}

// ------------------------------------------------------------------------------------------------
// Holzschlägel 0,35 m: Rundholz-Schlägel mit tonnenförmigem Kopf; steht leicht schräg
export function holzschlaegel(opts = {}) {
  const ang = -0.16;
  const R = (p) => rotPts(p, ang, 0, 0);
  const handle = rrect(-0.02, 0.0, 0.02, 0.3, 0.012);
  const head = poly([[-0.1, 0.27], [-0.1, 0.36], [-0.07, 0.395], [0.07, 0.395], [0.1, 0.36], [0.1, 0.27], [0.07, 0.245], [-0.07, 0.245]], 2);
  return mk('holzschlaegel', 'Holzschlägel', {
    body: {
      layers: [
        {
          shapes: [R(handle)], fill: { stops: [[0, '#c08a52'], [0.5, '#e0aa6c'], [1, '#a0703a']], dir: 'h' },
          deco(c, bb) { const r = rotCtx(c, ang); for (let y = 0.02; y < 0.12; y += 0.014) line(r, [[-0.02, y], [0.02, y + 0.006]], '#e8d9b4', 0.005, { alpha: 0.9 }); grain(r, { x0: -0.02, y0: 0.12, w: 0.04, h: 0.15 }, 'rgba(60,35,15,.45)', 8, { len: 0.1, w: 0.003, seed: 3, ang: 1.57 }); },
        },
        {
          shapes: [R(head)], fill: { top: '#a0703a', bottom: '#6e4423' },
          deco(c, bb) {
            const r = rotCtx(c, ang);
            grain(r, { x0: -0.1, y0: 0.25, w: 0.2, h: 0.14 }, 'rgba(40,20,8,.5)', 18, { len: 0.14, w: 0.004, seed: 4 });
            for (const y of [0.275, 0.365]) line(r, [[-0.1, y], [0.1, y]], 'rgba(30,15,5,.55)', 0.006);
            for (const x of [-0.1, 0.1]) line(r, [[x, 0.255], [x, 0.385]], 'rgba(30,15,5,.4)', 0.008);
            line(r, [[-0.08, 0.385], [0.06, 0.385]], 'rgba(255,230,180,.5)', 0.006);
            volume(c, bb, { dark: 'rgba(30,15,5,.3)', light: 'rgba(255,225,170,.1)' });
          },
        },
      ],
    },
  }, { kopf: [0, 0.32], griff: [0, 0.05] }, { lengthM: 0.35, material: 'Holz' }, {});
}

// ------------------------------------------------------------------------------------------------
// Messleine 0,6 m: zwei Pflöcke, gespannte Schnur mit Knoten (Elle) und bunten Stoffmarken; um den linken Pflock gewickelt
export function messleine(opts = {}) {
  const x0 = -0.28, x1 = 0.28;
  const stake = (x) => limb([[x, 0.0, 0.012], [x, 0.04, 0.04], [x, 0.24, 0.045], [x, 0.29, 0.06]], { per: 6 });
  const cord = [[x0, 0.2], [x0 + 0.14, 0.17], [0, 0.16], [x1 - 0.14, 0.17], [x1, 0.2]];
  const sp = spline(cord.map((p) => [p[0], p[1], 0]), 12);
  const at = (t) => { const f = t * (sp.length - 1), i = Math.min(sp.length - 2, Math.floor(f)), u = f - i; return [sp[i][0] + (sp[i + 1][0] - sp[i][0]) * u, sp[i][1] + (sp[i + 1][1] - sp[i][1]) * u]; };
  const knots = [0.14, 0.3, 0.46, 0.62, 0.78, 0.92].map(at);
  const flag = ([x, y]) => poly([[x - 0.008, y - 0.01], [x + 0.008, y - 0.01], [x + 0.007, y - 0.05], [x, y - 0.04], [x - 0.007, y - 0.05]], 0);
  const wood = (c, bb) => { grain(c, bb, 'rgba(60,35,15,.45)', 10, { len: 0.1, w: 0.003, seed: 2, ang: 1.55 }); volume(c, bb, { dark: 'rgba(50,28,10,.3)', light: 'rgba(255,225,170,.15)' }); };
  return mk('messleine', 'Messleine', {
    body: {
      layers: [
        { shapes: [stake(x0), stake(x1)], fill: { stops: [[0, '#c08a52'], [0.5, '#dcaa6c'], [1, '#a0703a']], dir: 'h' }, deco: wood },
        { shapes: [rrect(x0 - 0.04, 0.1, x0 + 0.04, 0.23, 0.02)], fill: '#d9c28a', deco(c, bb) { for (let y = 0.11; y < 0.23; y += 0.014) line(c, [[x0 - 0.04, y], [x0 + 0.04, y + 0.006]], 'rgba(100,70,30,.65)', 0.004); } },
        { shapes: ropePolys(cord, 0.016), fill: '#e0cb92', deco(c, bb) { ropeTwist(c, cord, 0.016, 'rgba(90,60,25,.6)', 0.014); } },
        { shapes: knots.map(([x, y]) => blob(x, y, 0.017, 0.015, 0, 10)), fill: '#c9a96a' },
        { shapes: knots.filter((_, i) => i % 2 === 0).map(flag), fill: P.karneol },
        { shapes: knots.filter((_, i) => i % 2 === 1).map(flag), fill: P.lapis },
      ],
    },
  }, { pflock_a: [x0, 0.29], pflock_b: [x1, 0.29], schnur: [0, 0.16] }, { lengthM: 0.6, material: 'Flachsschnur' }, {});
}
