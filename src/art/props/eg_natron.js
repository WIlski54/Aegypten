// Gruppe O2 – Natron (Salz): natron_haufen (1 m) und natron_schale (0,5 m).
// Salz ist an kleinen, würfelförmigen Kristallen erkennbar: viele helle Würfelchen mit Lichtkante, blauweißem Schatten und Glanzsternen.
import {
  P, rect, rrect, blob, poly, limb, fillPoly, sparkle, cylinder, rectFill, ellipseFill, curve, strokes, volume, finish, rngOf, goldH, mix,
} from './_eg_ritual_kit.js';

const mk = (id, name, parts, anchors, meta, o) => finish({ id, parts, anchors, meta: { name, ...meta } }, o);

/** Erzeugt Kristallliste im Haufen-Profil (hw = halbe Breite, H = Höhe, y0 = Fußlinie). */
function crystals(seed, { hw, H, y0, n, smin, smax, cx = 0, power = 1.3 }) {
  const r = rngOf(seed, 17);
  const prof = (x) => { const t = Math.abs(x - cx) / hw; return t >= 1 ? 0 : H * Math.pow(Math.cos((t * Math.PI) / 2), power); };
  const list = [];
  let tries = 0;
  while (list.length < n && tries++ < n * 40) {
    const x = cx + (r() * 2 - 1) * hw, y = y0 + r() * H;
    if (y > y0 + prof(x) + smax * 0.2) continue;
    list.push({ x, y, s: smin + r() * (smax - smin) * (0.5 + 0.5 * (1 - (y - y0) / H)), rot: r() * Math.PI, tint: r(), k: r() });
  }
  // oben zuerst malen, unten überlappt
  list.sort((a, b) => b.y - a.y);
  list.reverse();
  return { list, prof };
}
const cubePoly = (k) => {
  const h = k.s / 2, c = Math.cos(k.rot), s = Math.sin(k.rot);
  return [[-h, -h], [h, -h], [h, h], [-h, h]].map(([x, y]) => [k.x + x * c - y * s, k.y + x * s + y * c]);
};
function paintSalt(c, list) {
  for (const k of list) {
    const q = cubePoly(k), [A, B, C2, D] = q;
    const base = k.tint < 0.55 ? '#ffffff' : k.tint < 0.85 ? '#f3f7fb' : '#f9f3e3';
    fillPoly(c, q, base);
    // Lichtkante (oben links) und Schattenseite (unten rechts) – wirkt wie ein Würfelchen
    fillPoly(c, [A, B, [(B[0] + C2[0]) / 2, (B[1] + C2[1]) / 2], [(A[0] + D[0]) / 2, (A[1] + D[1]) / 2]], '#ffffff', 0.95);
    fillPoly(c, [C2, D, [(A[0] + D[0]) / 2, (A[1] + D[1]) / 2], [(B[0] + C2[0]) / 2, (B[1] + C2[1]) / 2]], k.k < 0.5 ? '#d9e4f1' : '#e3ebf5', 0.55);
    const { ctx, tf, S } = c;
    ctx.save(); ctx.strokeStyle = 'rgba(140,160,195,0.45)'; ctx.lineWidth = Math.max(1, S * 0.005); ctx.lineJoin = 'round';
    ctx.beginPath(); q.forEach((p, i) => { const [X, Y] = tf(p[0], p[1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.closePath(); ctx.stroke(); ctx.restore();
  }
}
function glints(c, list, n, seed, size) {
  const r = rngOf(seed, 29);
  for (let i = 0; i < n; i++) {
    const k = list[Math.floor(r() * list.length)];
    const gs = size * (0.7 + r() * 0.8);
    ellipseFill(c, k.x - k.s * 0.15, k.y + k.s * 0.2, gs * 0.55, gs * 0.55, '#9fcdf2', 0.4);
    sparkle(c, k.x - k.s * 0.15, k.y + k.s * 0.2, gs, { color: '#ffffff', alpha: 1 });
  }
}

// ---- Haufen -----------------------------------------------------------------------------------------
export function natron_haufen(opts = {}) {
  const hw = 0.5, H = 0.5;
  const { list, prof } = crystals(opts.seed ?? 5, { hw: 0.48, H, y0: 0.03, n: 520, smin: 0.032, smax: 0.062 });
  // Grundkörper (verhindert Löcher) + Kristalle am Rand (rauer Umriss) + verstreute Körner
  const pts = [];
  for (let i = 0; i <= 40; i++) { const x = -0.46 + (0.92 * i) / 40; pts.push([x, 0.02 + prof(x) * 0.93]); }
  const mound = poly([[-0.46, 0.0], ...pts, [0.46, 0.0]], 1);
  const r = rngOf(9, 3);
  const grains = [];
  for (let i = 0; i < 26; i++) { const x = (r() * 2 - 1) * 0.62, s = 0.02 + r() * 0.025; grains.push(cubePoly({ x, y: 0.014 + r() * 0.03, s, rot: r() * 3 })); }
  const layers = [{
    shapes: [mound, ...list.map(cubePoly), ...grains], fill: { stops: [[0, '#ffffff'], [0.6, '#e7eef6'], [1, '#dfe8f2']], dir: 'v' },
    deco(c, bb) {
      paintSalt(c, list);
      for (const g of grains) fillPoly(c, g, '#f4f8fc');
      volume(c, bb, { dark: 'rgba(90,110,150,0.14)', light: 'rgba(255,255,255,0.12)' });
      // sanfte Lichtkante links
      glints(c, list.filter((k) => k.y > 0.1), 22, 2, 0.04);
      sparkle(c, -0.17, 0.4, 0.09); sparkle(c, 0.12, 0.28, 0.07);
    },
  }];
  return mk('natron_haufen', 'Natron-Haufen', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, streu: { rel: [0.5, 0.95] } }, { kind: 'requisit', lengthM: 1.0 }, { w: opts.w ?? 1.0 });
}

// ---- Schale mit Salz ---------------------------------------------------------------------------------
export function natron_schale(opts = {}) {
  const rimY = 0.16;
  const { list, prof } = crystals(opts.seed ?? 8, { hw: 0.19, H: 0.15, y0: rimY - 0.015, n: 230, smin: 0.022, smax: 0.04, power: 1.1 });
  const bowl = poly([[-0.25, rimY], [0.25, rimY], [0.235, rimY - 0.05], [0.18, rimY - 0.11], [0.1, rimY - 0.145], [-0.1, rimY - 0.145], [-0.18, rimY - 0.11], [-0.235, rimY - 0.05]], 2);
  const foot = rrect(-0.09, 0.0, 0.09, 0.03, 0.012);
  const rim = rrect(-0.27, rimY - 0.025, 0.27, rimY + 0.012, 0.014);
  const pts = [];
  for (let i = 0; i <= 30; i++) { const x = -0.19 + (0.38 * i) / 30; pts.push([x, rimY - 0.015 + prof(x) * 0.93]); }
  const mound = poly([[-0.19, rimY - 0.02], ...pts, [0.19, rimY - 0.02]], 1);
  const layers = [
    {
      shapes: [bowl, foot], fill: { stops: [[0, '#a3643a'], [0.3, '#d99058'], [0.65, '#b9824f'], [1, '#7a4a28']], dir: 'h' },
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(40,15,0,0.28)', light: 'rgba(255,220,170,0.15)' });
        rectFill(c, -0.26, rimY - 0.07, 0.26, rimY - 0.048, P.lapis, 0.95);
        for (let i = -6; i <= 6; i++) ellipseFill(c, i * 0.036, rimY - 0.059, 0.008, 0.008, P.goldHi, 0.9);
        // Zickzack-Wasserband (Zierde)
        const z = []; for (let i = 0; i <= 18; i++) z.push([-0.2 + i * 0.0222, rimY - 0.095 + (i % 2 ? 0.013 : -0.002)]);
        curve(c, z, P.turq, 0.009, { alpha: 0.95 });
        sparkle(c, -0.16, rimY - 0.04, 0.03, { alpha: 0.6 });
      },
    },
    { shapes: [rim], fill: { top: '#4a3020', bottom: '#2a1a10' }, deco(c, bb) { cylinder(c, bb, { dark: 'rgba(0,0,0,0.3)', light: 'rgba(255,230,200,0.2)', at: 0.2 }); } },
    {
      shapes: [mound, ...list.map(cubePoly)], fill: { stops: [[0, '#ffffff'], [0.6, '#e7eef6'], [1, '#dfe8f2']], dir: 'v' },
      deco(c, bb) {
        paintSalt(c, list); volume(c, bb, { dark: 'rgba(90,110,150,0.12)', light: 'rgba(255,255,255,0.1)' });
        glints(c, list, 7, 4, 0.03); sparkle(c, -0.07, rimY + 0.1, 0.05);
      },
    },
  ];
  return mk('natron_schale', 'Natron-Schale', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, rand: [0, rimY] }, { kind: 'requisit', lengthM: 0.5 }, { w: opts.w ?? 0.5 });
}
