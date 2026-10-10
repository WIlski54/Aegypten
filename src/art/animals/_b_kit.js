// Gruppe B: gemeinsame Helfer (Farben, Mal-Hilfen, Kurven) fuer die Pflanzenfresser-Figuren.
// Alles in METERN, Blick nach +x.
import { blob, limb, poly, xf, move, spline } from '../dsl.js';
import { eye, volume, spots, stripes, line, dot } from '../paint.js';
import { mulberry32 } from '../../engine/util.js';

// ---------- Farben ----------
const h2r = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const r2h = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); };
export const dark = (c, t = 0.25) => mix(c, '#2a1608', t);
export const light = (c, t = 0.25) => mix(c, '#fff6dc', t);

// ---------- Malen ----------
export function fillPoly(c, pts, color, alpha = 1) {
  const { ctx, tf } = c;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
  pts.forEach((p, i) => { const [X, Y] = tf(p[0], p[1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
  ctx.closePath(); ctx.fill(); ctx.restore();
}
export function strokePoly(c, pts, color, w, alpha = 1) {
  const { ctx, tf, S } = c;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, w * S); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); pts.forEach((p, i) => { const [X, Y] = tf(p[0], p[1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
  ctx.closePath(); ctx.stroke(); ctx.restore();
}
// weiche Kurve durch Kontrollpunkte [x,y]
export function curve(c, ctrl, color, w, { alpha = 1, per = 8 } = {}) {
  const pts = spline(ctrl.map((p) => [p[0], p[1], 0]), per).map((p) => [p[0], p[1]]);
  line(c, pts, color, w, { alpha });
}
// Freundliches grosses Auge: weisser Rand, bernsteinfarbene Iris, dunkle Pupille, Glanzlicht
export function cuteEye(c, x, y, r, { iris = '#6b3f1d', look = 0.18, lid = null, sleepy = 0 } = {}) {
  const { ctx, tf, S } = c;
  const [X, Y] = tf(x, y); const R = Math.max(2.5, r * S);
  ctx.save();
  ctx.beginPath(); ctx.arc(X, Y, R, 0, 6.2832); ctx.fillStyle = '#fffaf0'; ctx.fill();
  ctx.lineWidth = Math.max(1, R * 0.16); ctx.strokeStyle = 'rgba(40,24,10,.85)'; ctx.stroke();
  const px = X + R * look, py = Y + R * 0.04;
  ctx.beginPath(); ctx.arc(px, py, R * 0.7, 0, 6.2832); ctx.fillStyle = iris; ctx.fill();
  ctx.beginPath(); ctx.arc(px + R * 0.04, py, R * 0.44, 0, 6.2832); ctx.fillStyle = '#1a0e08'; ctx.fill();
  ctx.beginPath(); ctx.arc(px + R * 0.24, py - R * 0.26, R * 0.2, 0, 6.2832); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(px - R * 0.2, py + R * 0.24, R * 0.09, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
  if (lid) { // Oberlid in Koerperfarbe (freundlicher, leicht muede Blick)
    ctx.beginPath(); ctx.arc(X, Y, R * 1.02, Math.PI * (1.0 + 0.0), Math.PI * 2, false);
    ctx.lineTo(X + R, Y - R * sleepy); ctx.lineTo(X - R, Y - R * sleepy); ctx.closePath();
    ctx.fillStyle = lid; ctx.fill();
    ctx.beginPath(); ctx.moveTo(X - R, Y - R * sleepy); ctx.lineTo(X + R, Y - R * sleepy);
    ctx.lineWidth = Math.max(1, R * 0.16); ctx.strokeStyle = 'rgba(40,24,10,.85)'; ctx.stroke();
  }
  ctx.restore();
}
// Wange / Rouge
export function cheek(c, x, y, r, color = '#f0907a', alpha = 0.55) {
  const { ctx, tf, S } = c; const [X, Y] = tf(x, y);
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(X, Y, r * S, r * S * 0.7, 0, 0, 6.2832); ctx.fill(); ctx.restore();
}

// ---------- Kurven-Geometrie ----------
// Normale (links der Laufrichtung) an jedem Sample einer Kontrollkurve [x,y,w]
export function samples(ctrl, per = 10) {
  const S = spline(ctrl, per); const out = [];
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    out.push({ x: S[i][0], y: S[i][1], w: S[i][2], tx, ty, nx: -ty, ny: tx });
  }
  return out;
}
// Band entlang einer Kontrollkurve zwischen den Offsets a..b (Anteil der halben Breite; + = links der Laufrichtung)
export function band(ctrl, a, b, per = 10) {
  const s = samples(ctrl, per); const A = [], B = [];
  for (const p of s) {
    const h = p.w / 2; A.push([p.x + p.nx * h * a, p.y + p.ny * h * a]); B.push([p.x + p.nx * h * b, p.y + p.ny * h * b]);
  }
  return A.concat(B.reverse());
}
// Punkt auf der Kurve bei Anteil t (0..1) samt Normale
export function at(ctrl, t, per = 20) {
  const s = samples(ctrl, per); const i = Math.max(0, Math.min(s.length - 1, Math.round(t * (s.length - 1)))); return s[i];
}
// Kontrollkurve seitlich verschoben (k = Anteil der halben Breite) und Breite skaliert
export function shifted(ctrl, k, ws = 1) {
  const n = ctrl.length;
  return ctrl.map((p, i) => {
    const a = ctrl[Math.max(0, i - 1)], b = ctrl[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const h = p[2] / 2 * k; return [p[0] - ty * h, p[1] + tx * h, p[2] * ws];
  });
}
// Dreieck / Dorn mit gerundeter Spitze: Basis a->b, Spitze in Richtung (dx,dy)*len ab Basismitte
export function spike(a, b, tip, round = 1) {
  return poly([a, tip, b], round);
}
// Krallen-Sichel: von p in Richtung ang (rad) mit Laenge len und Dicke w, leicht gekruemmt (curl rad)
export function claw(px, py, ang, len, w, curl = 0.5) {
  const ctrl = []; const n = 5;
  for (let i = 0; i <= n; i++) {
    const t = i / n; const a = ang + curl * t * t; const d = len * t;
    const x = px + Math.cos(ang) * d * 0.55 + Math.cos(a) * d * 0.45, y = py + Math.sin(ang) * d * 0.55 + Math.sin(a) * d * 0.45;
    ctrl.push([x, y, w * (1 - t * 0.92) + 0.001]);
  }
  return limb(ctrl, { per: 6 });
}
// Zuckerlinie entlang einer Kontrollkurve (wellig, fuer Streifen quer zur Laufrichtung)
export function crossStripes(c, ctrl, color, n, { half = 1.2, width = 0.06, alpha = 0.5, t0 = 0.05, t1 = 0.95, tilt = 0.0 } = {}) {
  const s = samples(ctrl, 14);
  for (let i = 0; i < n; i++) {
    const t = t0 + (t1 - t0) * (n === 1 ? 0.5 : i / (n - 1));
    const p = s[Math.round(t * (s.length - 1))];
    const h = p.w / 2 * half;
    const ax = p.x + p.nx * h + p.tx * tilt * h, ay = p.y + p.ny * h + p.ty * tilt * h;
    const bx = p.x - p.nx * h - p.tx * tilt * h, by = p.y - p.ny * h - p.ty * tilt * h;
    line(c, [[ax, ay], [(ax + bx) / 2 + p.tx * width * 0.5, (ay + by) / 2 + p.ty * width * 0.5], [bx, by]], color, width, { alpha });
  }
}
export { blob, limb, poly, xf, move, spline, eye, volume, spots, stripes, line, dot, mulberry32 };
