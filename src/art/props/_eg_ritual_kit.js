// Gruppe O2 (Totengericht und Mumifizierung): gemeinsamer Baukasten.
// Palette (verbindlich aus dem Brief), Gold-/Lapis-Fills, Geometrie (Rechteck, Ringe MIT Loch, Spiegelung),
// Malhilfen in Modellkoordinaten (Glanzsterne, Bänder, Zylinderlicht, Glyphen) und Zeichenfunktionen für die
// heiligen Zeichen (Anch, Djed, Was, Udjat), die auch als Zierde auf Kulissen benutzt werden.
// Alles in Metern bzw. in einem frei gewählten Einheitsrahmen; `mk()` skaliert über `finish()` auf die Zielgröße.
import { blob, limb, poly, xf, spline, TAU, mix, shade, fillPoly, fillPolys, strokePoly, fillGrad, curve, strokes, finish, rngOf, clipBelow, pathPoly, rock, leaf, fan, cluster } from './_e_kit.js';
import { volume, line, dot } from '../paint.js';

export { blob, limb, poly, xf, spline, TAU, mix, shade, fillPoly, fillPolys, strokePoly, fillGrad, curve, strokes, finish, rngOf, clipBelow, pathPoly, rock, leaf, fan, cluster, volume, line, dot };

// ---- Palette ---------------------------------------------------------------------------------
export const P = {
  skinM: '#b5693a', skinF: '#d9a95a', linen: '#f6efe0', linenSh: '#d9cdb4', hair: '#1c1816',
  gold: '#e0b040', goldHi: '#fff0b3', goldLo: '#8a5f1c',
  lapis: '#2a5aa0', lapisLo: '#17386e', lapisHi: '#5b8ad0',
  turq: '#3bb3a8', turqLo: '#1f7f78', turqHi: '#8fe0d4',
  carn: '#c0432e', carnLo: '#8a2a1c', carnHi: '#e6785a',
  papy: '#5b9a4b', nil: '#3f8f5a', sand: '#d9b97a', sandLo: '#a98a52', mud: '#b9824f', mudLo: '#7a5230',
  black: '#1c1816', night: '#0f1c3c',
};

// ---- Fills -------------------------------------------------------------------------------------
/** Gold waagerecht (Zylinderlicht) bzw. senkrecht (Licht oben). */
export const goldH = { stops: [[0, '#9a6c20'], [0.22, '#f5d676'], [0.5, '#e0b040'], [1, '#8a5f1c']], dir: 'h' };
export const goldV = { stops: [[0, '#ffe9a0'], [0.4, '#e0b040'], [1, '#9a6c20']], dir: 'v' };
export const lapisV = { stops: [[0, '#3d70b8'], [0.5, '#2a5aa0'], [1, '#17386e']], dir: 'v' };
export const lapisH = { stops: [[0, '#17386e'], [0.28, '#3d70b8'], [0.6, '#2a5aa0'], [1, '#17386e']], dir: 'h' };
export const turqV = { stops: [[0, '#6fd6c8'], [0.5, '#3bb3a8'], [1, '#1f7f78']], dir: 'v' };
export const carnV = { stops: [[0, '#e6785a'], [0.45, '#c0432e'], [1, '#8a2a1c']], dir: 'v' };
export const linenV = { stops: [[0, '#fffaf0'], [0.55, '#f6efe0'], [1, '#d9cdb4']], dir: 'v' };

// ---- Geometrie ---------------------------------------------------------------------------------
export const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/** Rechteck mit gerundeten Ecken (r) */
export function rrect(x0, y0, x1, y1, r, n = 5) {
  const pts = [];
  const arc = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI); arc(x1 - r, y0 + r, Math.PI * 1.5);
  return pts;
}
export const mirror = (p, ax = 0) => p.map(([x, y]) => [2 * ax - x, y]).reverse();
export const shift = (p, dx, dy) => p.map(([x, y]) => [x + dx, y + dy]);
const sArea = (p) => { let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return a / 2; };
/** Polygon mit Loch (Außen- und Innenkontur, durch einen Null-Steg verbunden) – die Engine macht daraus ein echtes Loch. */
export function keyhole(outer, inner) {
  const o = outer.slice();
  let i = inner.slice();
  if (Math.sign(sArea(o)) === Math.sign(sArea(i))) i = i.reverse();
  return o.concat([o[0]], i, [i[0]], [o[0]]);
}
export function ring(cx, cy, rox, roy, rix, riy, n = 40) {
  return keyhole(blob(cx, cy, rox, roy, 0, n), blob(cx, cy, rix, riy, 0, n));
}
/** Bogen als Strang (Winkel a0..a1, Radius rx/ry, Breite w) */
export function arcLimb(cx, cy, rx, ry, a0, a1, w, n = 14) {
  const ctrl = [];
  for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * (k / n); ctrl.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, w]); }
  return limb(ctrl, { per: 3 });
}
/** Punkte entlang einer Wellenlinie (für Tuchsäume) */
export function sineY(x0, x1, y, amp, waves, n = 24, ph = 0) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t, y + amp * Math.sin(t * waves * TAU + ph)]); }
  return pts;
}

// ---- Malen (Modellkoordinaten) ---------------------------------------------------------------------
export function rectFill(c, x0, y0, x1, y1, color, alpha = 1) {
  const { ctx, tf } = c; const [a, b] = tf(x0, y1), [d, e] = tf(x1, y0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(a, b, d - a, e - b); ctx.restore();
}
/** Vierzackiger Glanzstern */
export function sparkle(c, x, y, r, { color = '#ffffff', alpha = 0.95, thin = 0.22 } = {}) {
  const { ctx, tf, S } = c; const [X, Y] = tf(x, y); const R = Math.max(1.5, r * S), t = R * thin;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(X, Y - R); ctx.quadraticCurveTo(X + t, Y - t, X + R, Y); ctx.quadraticCurveTo(X + t, Y + t, X, Y + R);
  ctx.quadraticCurveTo(X - t, Y + t, X - R, Y); ctx.quadraticCurveTo(X - t, Y - t, X, Y - R); ctx.fill(); ctx.restore();
}
/** Waagerechter Lichtverlauf (links hell, rechts dunkel) über den Layer: gibt runden Körpern Volumen. */
export function cylinder(c, bb, { dark = 'rgba(30,15,5,0.34)', light = 'rgba(255,248,220,0.28)', at = 0.28 } = {}) {
  const { ctx, tf } = c;
  const [x0, y0] = tf(bb.x0, (bb.y0 + bb.y1) / 2), [x1, y1] = tf(bb.x1, (bb.y0 + bb.y1) / 2);
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, 'rgba(0,0,0,0.08)'); g.addColorStop(at, light); g.addColorStop(Math.min(0.9, at + 0.3), 'rgba(0,0,0,0)'); g.addColorStop(1, dark);
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, c.W, c.H); ctx.restore();
}
export function ellipseFill(c, cx, cy, rx, ry, color, alpha = 1, rot = 0) {
  const { ctx, tf, S } = c; const [X, Y] = tf(cx, cy);
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(X, Y, rx * S, ry * S, -rot, 0, TAU); ctx.fill(); ctx.restore();
}

// ---- Heilige Zeichen (Polygone im Einheitsrahmen, Höhe h, Fußpunkt (x,y)) ---------------------------
/** Anch: Schlaufe oben, Querbalken, Schaft. k = Strichstärke (1 = voll, <1 für Einlagen). Liste von Polygonen (Schlaufe mit Loch). */
export function ankhPolys(x, y, h, k = 1) {
  const s = h;
  const loopCy = y + s * 0.76, loopRx = s * 0.17, loopRy = s * 0.23, th = s * 0.075 * k;
  const loop = ring(x, loopCy, loopRx + th, loopRy + th, loopRx - th, loopRy - th, 36);
  const bh = s * 0.095 * k, by = y + s * 0.43 + s * 0.0475;
  const bar = rrect(x - s * (0.3 - (1 - k) * 0.1), by - bh / 2, x + s * (0.3 - (1 - k) * 0.1), by + bh / 2, s * 0.03 * k);
  const sw = s * 0.075 * k;
  const stem = poly([[x - sw, y + (1 - k) * s * 0.04], [x + sw, y + (1 - k) * s * 0.04], [x + sw, y + s * 0.56], [x - sw, y + s * 0.56]]);
  return [loop, bar, stem];
}
/** Djed-Pfeiler: Sockel, Schaft, vier Querbalken. Rückgabe { base, shaft, bars[] }. */
export function djedParts(x, y, h) {
  const s = h;
  const base = rrect(x - s * 0.17, y, x + s * 0.17, y + s * 0.07, s * 0.02);
  const shaft = poly([[x - s * 0.10, y + s * 0.05], [x + s * 0.10, y + s * 0.05], [x + s * 0.075, y + s * 0.64], [x - s * 0.075, y + s * 0.64]]);
  const bars = [];
  for (let i = 0; i < 4; i++) {
    const yy = y + s * (0.63 + i * 0.1), w = s * (0.15 + (i % 2) * 0.012);
    bars.push(rrect(x - w, yy, x + w, yy + s * 0.075, s * 0.03));
  }
  return { base, shaft, bars };
}
export const djedPolys = (x, y, h) => { const d = djedParts(x, y, h); return [d.base, d.shaft, ...d.bars]; };
/** Was-Zepter (Macht): Schaft, geschwungener Kopf, Gabelfuß. Kleine Zierde. */
export function wasPolys(x, y, h) {
  const s = h;
  const shaft = limb([[x, y + s * 0.12, s * 0.07], [x, y + s * 0.82, s * 0.07]], { per: 2 });
  const fork = [limb([[x - s * 0.02, y + s * 0.16, s * 0.07], [x - s * 0.12, y, s * 0.07]], { per: 2 }), limb([[x + s * 0.02, y + s * 0.16, s * 0.07], [x + s * 0.12, y, s * 0.07]], { per: 2 })];
  const head = poly([[x - s * 0.08, y + s * 0.8], [x + s * 0.12, y + s * 0.86], [x + s * 0.24, y + s * 0.97], [x + s * 0.24, y + s * 1.0], [x + s * 0.1, y + s * 0.99], [x - s * 0.05, y + s * 0.93], [x - s * 0.08, y + s * 0.9]]);
  return [shaft, ...fork, head];
}

/** Fünfzackiger Stern (Sterne der Sternendecke und der Duat). */
export function starPoly(cx, cy, R, r = R * 0.42, rot = Math.PI / 2, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n; const rr = i % 2 ? r : R; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return pts;
}

/** Skaliert eine Layer-Liste samt deco um (cx,cy) mit Faktor s (Malkoordinaten der deco bleiben im Ursprungsrahmen). */
export function scaleLayers(layers, s, cx = 0, cy = 0, sy = s) {
  const tp = (p) => p.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * sy]);
  const dx = (1 - s) * cx, dy = (1 - sy) * cy;
  return layers.map((l) => ({
    ...l, shapes: l.shapes.map(tp),
    deco: l.deco ? (c, bb) => {
      const w = Object.assign(Object.create(c), {
        tf: (x, y) => c.tf(x * s + dx, y * sy + dy), px: (x, y) => c.tf(x * s + dx, y * sy + dy), S: c.S * s,
      });
      l.deco(w, { x0: (bb.x0 - dx) / s, x1: (bb.x1 - dx) / s, y0: (bb.y0 - dy) / sy, y1: (bb.y1 - dy) / sy, w: bb.w / s, h: bb.h / sy });
    } : l.deco,
  }));
}
