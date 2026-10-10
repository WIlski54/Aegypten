// Gruppe B: Ei-Geometrie und Malerei (egg, egg_hatching). Alles in Metern, Ei liegt waagerecht, spitzeres Ende nach +x.
import { poly, fillPoly, strokePoly, curve, mulberry32, mix, dark, light, line, dot } from './_b_kit.js';

export const EGG = { a: 0.1, b: 0.057, k: 0.13 };       // Halblaenge, Halbbreite, Asymmetrie
export const eggTop = (x, e = EGG) => { const u = x / e.a; return e.b * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - e.k * u); };

// Randpunkte des Eis (Mittelpunkt (0,0)) von x0..x1 entlang der Oberkante (upper=true) bzw. Unterkante
export function eggArc(x0, x1, upper, n = 40, e = EGG) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    // dichtere Abtastung an den Spitzen
    const t = i / n; const s = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const x = x0 + (x1 - x0) * s; const y = eggTop(x, e); pts.push([x, upper ? y : -y]);
  }
  return pts;
}
export function eggOutline(cy = EGG.b, e = EGG) {
  const up = eggArc(-e.a, e.a, true, 44, e), lo = eggArc(e.a, -e.a, false, 44, e);
  return up.concat(lo.slice(1, -1)).map(([x, y]) => [x, y + cy]);
}

// Tupfen: weich verteilte braune Flecken, seeded; liefert Liste {x,y,r}
export function eggSpots(seed, n = 13, e = EGG) {
  const r = mulberry32(seed); const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 400) {
    const x = (r() * 2 - 1) * e.a * 0.86, y = (r() * 2 - 1) * eggTop(x, e) * 0.85;
    const rad = 0.005 + r() * r() * 0.012 + 0.002;
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < (o.r + rad) * 1.15)) continue;
    out.push({ x, y, r: rad, tone: r() });
  }
  return out;
}
export function paintSpots(c, list, cy, tones = ['#8f5a2a', '#b27840', '#744420']) {
  const { ctx, tf, S } = c;
  ctx.save();
  for (const s of list) {
    const [X, Y] = tf(s.x, s.y + cy); const R = s.r * S;
    ctx.globalAlpha = 0.9; ctx.fillStyle = tones[s.tone < 0.45 ? 0 : s.tone < 0.8 ? 1 : 2];
    ctx.beginPath(); ctx.ellipse(X, Y, R * 1.12, R * 0.88, s.tone * 6, 0, 6.2832); ctx.fill();
  }
  ctx.restore();
}
// Glanzstreifen oben links
export function paintShine(c, cy, e = EGG) {
  const pts = []; for (let i = 0; i <= 10; i++) { const x = -e.a * 0.62 + i * e.a * 0.1; pts.push([x, cy + eggTop(x, e) * 0.72 - i * 0.0006]); }
  line(c, pts, 'rgba(255,255,250,.75)', 0.0075, { alpha: 1 });
}
// Zickzack-Rand (unregelmaessig, seeded): Punkte links -> rechts, y = cy + Versatz
export function zigLine(cy, e = EGG, amp = 0.015, teeth = 6, seed = 3) {
  const r = mulberry32(seed * 131 + 7); const pts = [[-e.a, cy]]; const n = teeth * 2;
  for (let i = 1; i < n; i++) {
    const u = -1 + (2 * i) / n + (r() - 0.5) * 0.05; const x = u * e.a;
    const env = Math.pow(Math.max(0, 1 - u * u), 0.4);
    const sgn = i % 2 ? 1 : -1; pts.push([x, cy + sgn * amp * env * (0.65 + r() * 0.7)]);
  }
  pts.push([e.a, cy]); return pts;
}
// duenner Innenrand-Strich: Form mit doppelter Breite zeichnen, Rest wird vom Layer-Clip abgeschnitten
export function edgeLine(c, pts, color = 'rgba(80,45,15,.7)', w = 0.0016) { strokePoly(c, pts, color, w * 2); }
// Risse im Deckel (seeded, variierbar): Hauptrisse von einem Startpunkt abwaerts zum Rand
export function paintCracks(c, cy, variant = 0, e = EGG) {
  const r = mulberry32(1013 + variant * 7919); const col = '#5a3418';
  const startX = 0.006 + (r() - 0.5) * 0.04; const startY = cy + eggTop(startX, e) * 0.9;
  const nMain = 3 + (variant % 2);
  for (let m = 0; m < nMain; m++) {
    let x = startX + (r() - 0.5) * 0.008, y = startY - 0.004;
    const dir = (m - (nMain - 1) / 2) * 0.55 + (r() - 0.5) * 0.35; // Fachwinkel (0 = gerade nach unten)
    const pts = [[x, y]];
    const steps = 5 + Math.floor(r() * 3);
    for (let s = 0; s < steps; s++) {
      const a = dir + (s % 2 ? 0.6 : -0.6) * (0.5 + r() * 0.6);
      const l = 0.0085 + r() * 0.007;
      x += Math.sin(a) * l * 1.35; y -= Math.cos(a) * l * 0.9;
      pts.push([x, y]);
      if (r() < 0.38) { // kleiner Seitenriss
        const sa = a + (r() < 0.5 ? 1 : -1) * (0.9 + r() * 0.5); const sl = 0.006 + r() * 0.006;
        line(c, [[x, y], [x + Math.sin(sa) * sl * 1.3, y - Math.cos(sa) * sl]], col, 0.0034, { alpha: 0.9 });
      }
    }
    line(c, pts, '#fff4d8', 0.0082, { alpha: 0.6 });
    line(c, pts, col, 0.0046, { alpha: 0.95 });
  }
  dot(c, startX, startY - 0.004, 0.0048, col, 0.9);
}
