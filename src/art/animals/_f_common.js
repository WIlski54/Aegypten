// Group F helpers: fur tufts, feather marks, coarse fur strokes, small geometry utilities.
// (Own helper file; does not touch dsl.js / paint.js.)
import { spline, poly } from '../dsl.js';
import { mulberry32 } from '../../engine/util.js';

export const rad = (d) => (d * Math.PI) / 180;

// scale a [x,y] polygon by s around the origin
export const scl = (p, s) => p.map(([x, y]) => [x * s, y * s]);
// scale limb controls [x,y,w]
export const sclC = (c, s) => c.map(([x, y, w]) => [x * s, y * s, (w ?? 0) * s]);

// Sample a smooth edge from control points [x,y] -> dense points
export function edge(ctrl, per = 8) {
  return spline(ctrl.map((p) => [p[0], p[1], 0]), per).map((p) => [p[0], p[1]]);
}

// Fur tufts along an edge: triangles pointing along dir. Returns array of polygons (to be added to a layer's shapes
// so the SILHOUETTE itself becomes furry / feathery - paper-cut look).
//   pts: dense polyline, step = spacing between tufts (m), len = tuft length, w = tuft base width
//   dir: [dx,dy] mean direction (pointing out of the body), jitter: relative variation, curl: sideways bend of the tip
export function tufts(pts, { step = 0.03, len = 0.04, w = 0.035, dir = [0, -1], radial = null, bias = [0, 0], jitter = 0.35, seed = 1, curl = 0, inset = 0.35 } = {}) {
  const r = mulberry32(seed);
  const out = [];
  // resample polyline at roughly 'step'
  const res = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    acc += d;
    if (acc >= step) { res.push(pts[i]); acc = 0; }
  }
  const dl = Math.hypot(dir[0], dir[1]) || 1;
  const dx = dir[0] / dl, dy = dir[1] / dl;
  for (let i = 0; i < res.length - 1; i++) {
    const a = res[i], b = res[i + 1];
    const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
    const k = 1 + (r() - 0.5) * 2 * jitter;
    const L = len * k;
    // slightly randomised direction
    const ang = (r() - 0.5) * jitter * 0.9;
    const c = Math.cos(ang), s = Math.sin(ang);
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let bdx = dx, bdy = dy;
    if (radial) { bdx = mx - radial[0] + bias[0]; bdy = my - radial[1] + bias[1]; const bl = Math.hypot(bdx, bdy) || 1; bdx /= bl; bdy /= bl; }
    const ex = bdx * c - bdy * s, ey = bdx * s + bdy * c;
    // base pushed slightly inward (against dir) so tufts overlap the body
    const bx0 = a[0] - ex * len * inset * 0.5, by0 = a[1] - ey * len * inset * 0.5;
    const bx1 = b[0] - ex * len * inset * 0.5, by1 = b[1] - ey * len * inset * 0.5;
    const cx = (tx / tl) * curl * L;
    const cy = (ty / tl) * curl * L;
    const ov = (w / step - 1) * 0.5; // overlap factor: wider tufts overlap neighbours
    out.push([[bx0 - tx * ov, by0 - ty * ov], [bx1 + tx * ov, by1 + ty * ov], [mx + ex * L + cx, my + ey * L + cy]]);
  }
  return out;
}

// Fur fringe along one side of a limb-like strand. ctrl = [[x,y,w],...] (same as limb); sgn = +1 left of travel
// direction, -1 right. gravity (0..1) pulls tufts toward straight down. Returns tuft polygons.
export function furEdge(ctrl, sgn, { step = 0.03, len = 0.035, gravity = 0.5, bias = [0, 0], from = 0, to = 1, seed = 1, jitter = 0.35, inset = 0.5, curl = 0, over = 1.0 } = {}) {
  const S = spline(ctrl, 12);
  const i0 = Math.floor(from * (S.length - 1)), i1 = Math.ceil(to * (S.length - 1));
  const r = mulberry32(seed);
  const out = [];
  let last = null;
  for (let i = i0; i <= i1; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const nx = -ty * sgn, ny = tx * sgn, h = S[i][2] / 2;
    const P = [S[i][0] + nx * h, S[i][1] + ny * h, nx, ny];
    if (!last) { last = P; continue; }
    if (Math.hypot(P[0] - last[0], P[1] - last[1]) < step) continue;
    const mx = (P[0] + last[0]) / 2, my = (P[1] + last[1]) / 2;
    let vx = (P[2] + last[2]) / 2 * (1 - gravity) + bias[0], vy = (P[3] + last[3]) / 2 * (1 - gravity) - gravity + bias[1];
    const ang = (r() - 0.5) * jitter, ca = Math.cos(ang), sa = Math.sin(ang);
    const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
    const ex = vx * ca - vy * sa, ey = vx * sa + vy * ca;
    const L = len * (1 + (r() - 0.5) * 2 * jitter);
    const ux = P[0] - last[0], uy = P[1] - last[1];
    const k = over;
    out.push([[last[0] - ex * len * inset * 0.5 - ux * (k - 1) * 0.5, last[1] - ey * len * inset * 0.5 - uy * (k - 1) * 0.5],
      [P[0] - ex * len * inset * 0.5 + ux * (k - 1) * 0.5, P[1] - ey * len * inset * 0.5 + uy * (k - 1) * 0.5],
      [mx + ex * L - ux * curl, my + ey * L - uy * curl]]);
    last = P;
  }
  return out;
}

// A single curved fur lock (tapered teardrop) from p0 along a quadratic bend to the tip.
export function lock(x, y, ang, len, w, bend = 0.3) {
  const n = 7, pts = [];
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const nx = -dy, ny = dx;
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const cx = x + dx * len * t + nx * bend * len * t * t;
    const cy = y + dy * len * t + ny * bend * len * t * t;
    const hw = (w / 2) * Math.sin(Math.PI * Math.min(1, t * 0.82 + 0.1)) * (1 - t * 0.55);
    L.push([cx + nx * hw, cy + ny * hw]); R.push([cx - nx * hw, cy - ny * hw]);
  }
  return L.concat(R.reverse());
}

// Coarse fur strokes (bold, few) painted into the clipped layer. Strokes follow a flow angle with jitter.
export function furStrokes(c, bb, color, n, { len = 0.05, w = 0.008, ang = -Math.PI / 2 - 0.35, jit = 0.5, alpha = 0.5, seed = 5, bend = 0.25 } = {}) {
  const { ctx, tf, S } = c; const r = mulberry32(seed);
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, w * S);
  for (let i = 0; i < n; i++) {
    const x = bb.x0 + r() * bb.w, y = bb.y0 + r() * bb.h;
    const a = ang + (r() - 0.5) * jit * 2, L = len * (0.6 + r() * 0.8);
    const mx = x + Math.cos(a) * L * 0.5 + Math.cos(a + 1.57) * bend * L * 0.3, my = y + Math.sin(a) * L * 0.5 + Math.sin(a + 1.57) * bend * L * 0.3;
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
    const [X, Y] = tf(x, y), [MX, MY] = tf(mx, my), [EX, EY] = tf(ex, ey);
    ctx.beginPath(); ctx.moveTo(X, Y); ctx.quadraticCurveTo(MX, MY, EX, EY); ctx.stroke();
  }
  ctx.restore();
}

// Feather marks: bold scallop chevrons (little "u" arcs) tiled over the layer bbox.
export function featherMarks(c, bb, color, { size = 0.09, alpha = 0.35, seed = 3, w = 0.012, jit = 0.2 } = {}) {
  const { ctx, tf, S } = c; const r = mulberry32(seed);
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = Math.max(1, w * S); ctx.lineCap = 'round';
  let row = 0;
  for (let y = bb.y1 - size * 0.4; y > bb.y0; y -= size * 0.72, row++) {
    for (let x = bb.x0 + (row % 2) * size * 0.5; x < bb.x1 + size; x += size) {
      const X0 = x + (r() - 0.5) * size * jit, Y0 = y + (r() - 0.5) * size * jit * 0.6;
      const [a, b] = tf(X0 - size * 0.4, Y0 + size * 0.15), [m, n] = tf(X0, Y0 - size * 0.32), [d, e] = tf(X0 + size * 0.4, Y0 + size * 0.15);
      ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(m, n, d, e); ctx.stroke();
    }
  }
  ctx.restore();
}

// Soft elliptical glow / blush
export function glow(c, x, y, rx, ry, color, alpha = 0.4) {
  const { ctx, tf, S } = c; const [X, Y] = tf(x, y);
  ctx.save(); ctx.translate(X, Y); ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * S);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx * S, 0, 6.2832); ctx.fill();
  ctx.restore();
}

// Curved stroke through points (quadratic smoothing) - for brows, mouth, wrinkles
export function curve(c, pts, color, w, { alpha = 1 } = {}) {
  const { ctx, tf, S } = c;
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = Math.max(1, w * S); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const P = pts.map((p) => tf(p[0], p[1]));
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length - 1; i++) {
    const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
    ctx.quadraticCurveTo(P[i][0], P[i][1], mx, my);
  }
  const L = P[P.length - 1]; ctx.lineTo(L[0], L[1]);
  ctx.stroke(); ctx.restore();
}

// Wrinkle arcs (skin folds), a few bold curved lines
export function folds(c, list, color, w, alpha = 0.35) {
  for (const f of list) curve(c, f, color, w, { alpha });
}

// Tapered quadratic "limb" polygon from hip->knee->ankle... convenience: thin wrapper around poly smoothing
export const smoothPoly = (pts, k = 2) => poly(pts, k);

// 2-link joint placement: from origin go 'a' for len l (angles measured from straight-down, + = forward)
export function down(p, ang, l) { return [p[0] + Math.sin(ang) * l, p[1] - Math.cos(ang) * l]; }

// Ring wrinkles across a limb-like strand (trunk, tail, ...). ctrl = [[x,y,w],...]
export function rings(c, ctrl, color, { n = 10, from = 0.1, to = 0.95, w = 0.012, alpha = 0.35, bulge = 0.12, wscale = 0.42 } = {}) {
  const S = spline(ctrl, 14);
  for (let k = 0; k < n; k++) {
    const t = from + ((to - from) * k) / Math.max(1, n - 1);
    const i = Math.min(S.length - 2, Math.max(1, Math.round(t * (S.length - 1))));
    const a = S[i - 1], b = S[i + 1];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const nx = -ty, ny = tx, h = S[i][2] * wscale;
    const p0 = [S[i][0] + nx * h, S[i][1] + ny * h], p2 = [S[i][0] - nx * h, S[i][1] - ny * h];
    const mid = [S[i][0] + tx * h * bulge * 2, S[i][1] + ty * h * bulge * 2];
    curve(c, [p0, mid, p2], color, w, { alpha });
  }
}

// Tufts along an arc of an ellipse (same parametrisation as dsl.blob): angles in degrees, counter-clockwise from +x.
export function blobTufts(cx, cy, rx, ry, rot, a0, a1, opts = {}) {
  const n = Math.max(6, Math.round(Math.abs(a1 - a0) / 6)), c = Math.cos(rot), s = Math.sin(rot), pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return tufts(pts, Object.assign({ radial: [cx, cy] }, opts));
}

// Fur clumps along one side of a strand: soft rounded blobs (mane / crest) instead of pointed tufts.
export function clumps(ctrl, sgn, { step = 0.15, rx = 0.1, ry = 0.07, from = 0, to = 1, push = 0, sweep = 0.4, seed = 1, jitter = 0.25 } = {}) {
  const S = spline(ctrl, 14), r = mulberry32(seed), out = [];
  const i0 = Math.floor(from * (S.length - 1)), i1 = Math.ceil(to * (S.length - 1));
  let last = null;
  for (let i = i0; i <= i1; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const nx = -ty * sgn, ny = tx * sgn, h = S[i][2] / 2 + push;
    const px = S[i][0] + nx * h, py = S[i][1] + ny * h;
    if (last && Math.hypot(px - last[0], py - last[1]) < step) continue;
    last = [px, py];
    const k = 1 + (r() - 0.5) * 2 * jitter;
    // ellipse elongated along the normal rotated towards the flow ('sweep')
    const ang = Math.atan2(ny + (-ty) * sweep, nx + (-tx) * sweep);
    const n = 20, pts = [];
    for (let j = 0; j < n; j++) {
      const q = (j / n) * 6.2832, ex = Math.cos(q) * rx * k, ey = Math.sin(q) * ry * k;
      pts.push([px + ex * Math.cos(ang) - ey * Math.sin(ang), py + ex * Math.sin(ang) + ey * Math.cos(ang)]);
    }
    out.push(pts);
  }
  return out;
}
