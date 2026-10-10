// Gruppe S2 (Bauwerke, Schiffe, Innenräume): gemeinsamer Baukasten.
// Palette (verbindlich laut Brief), Rechteck-/Trapez-Helfer, Malhilfen für Lehmziegel, Quader, Putz, Holz, Hieroglyphen-ZIERDE
// (echte, einfache Zeichen als Dekor, nie Wörter), Kehlleiste/Wulst, Sternenband, bemalte Wandfiguren im Profil.
// Alles in Metern, y nach oben; Malen in Modellkoordinaten über den Painter `c` (siehe _e_kit.js).
import { volume, line } from '../paint.js';
import {
  blob, limb, poly, xf, spline, TAU, rngOf, variantOf, mix, shade, leaf, wavy, ribbon, clipBelow, beads, centerline, along, strand,
  fillPoly, fillPolys, fillGrad, strokePoly, pathPoly, curve, strokes, gradient, finish,
} from './_e_kit.js';

export {
  volume, line, blob, limb, poly, xf, spline, TAU, rngOf, variantOf, mix, shade, leaf, wavy, ribbon, clipBelow, beads, centerline, along, strand,
  fillPoly, fillPolys, fillGrad, strokePoly, pathPoly, curve, strokes, gradient, finish,
};

// ---- Palette -------------------------------------------------------------------------------------
export const C = {
  skinM: '#b5693a', skinF: '#d9a95a', linen: '#f6efe0', linenSh: '#d9cdb4', hair: '#1c1816',
  gold: '#e0b040', goldLt: '#fff0b3', goldDk: '#8a5f1c', lapis: '#2a5aa0', lapisDk: '#1b3f78', lapisLt: '#4f7fc4',
  turq: '#3bb3a8', carn: '#c0432e', carnDk: '#8e2f20', papyrus: '#5b9a4b', nile: '#3f8f5a',
  sand: '#d9b97a', sandLt: '#ecd49a', sandDk: '#b8955a', sandSh: '#a8844a',
  mud: '#b9824f', mudLt: '#d0a06a', mudDk: '#8f5e36', black: '#1c1816', granite: '#a85e4c', graniteDk: '#7e4538', graniteLt: '#c98a72',
  wood: '#8a5a32', woodLt: '#b07c48', woodDk: '#5c3a1e', lime: '#f1e8d0', limeSh: '#d9cdb0', sky: '#bfe3ee', water: '#3a8fa0',
};

// ---- Geometrie ---------------------------------------------------------------------------------------
export const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/** Trapez: unten xb0..xb1 bei yb, oben xt0..xt1 bei yt. */
export const trap = (xb0, xb1, yb, xt0, xt1, yt) => [[xb0, yb], [xb1, yb], [xt1, yt], [xt0, yt]];
/** Rechteck mit zerklüfteter (zerbröckelter) Oberkante, z. B. Lehmziegelmauern. */
export function crumbleTop(x0, x1, yb, yt, { amp = 0.08, step = 0.16, seed = 1, bevel = 0 } = {}) {
  const r = rngOf(seed, 5); const pts = [[x0, yb]];
  const n = Math.max(2, Math.round((x1 - x0) / step));
  pts.push([x0 + bevel, yt - amp * r()]);
  for (let i = 1; i < n; i++) pts.push([x0 + ((x1 - x0) * i) / n, yt - amp * r() * 1.4 + (i % 2 ? 0 : amp * 0.3)]);
  pts.push([x1 - bevel, yt - amp * r()]); pts.push([x1, yb]);
  return pts;
}
/** Rundbogen-Öffnung (Polygon) mit Halbkreis oben. */
export function archPoly(cx, y0, w, hStraight, n = 14) {
  const r = w / 2, pts = [[cx - r, y0], [cx + r, y0], [cx + r, y0 + hStraight]];
  for (let i = 1; i < n; i++) { const a = (i / n) * Math.PI; pts.push([cx + Math.cos(a) * r, y0 + hStraight + Math.sin(a) * r]); }
  pts.push([cx - r, y0 + hStraight]);
  return pts;
}

// ---- Primitive Malhilfen -----------------------------------------------------------------------------
/** schnelles Füllrechteck in Modellkoordinaten */
export function fr(c, x0, y0, x1, y1, col, alpha = 1) {
  const { ctx, tf } = c; const [a, b] = tf(x0, y1), [d, e] = tf(x1, y0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.fillRect(a, b, d - a, e - b); ctx.restore();
}
/** Auf ein Polygon begrenzt malen */
export function clipTo(c, pts, fn) {
  const { ctx } = c; ctx.save(); pathPoly(c, pts); ctx.clip(); fn(); ctx.restore();
}
export const clipRect = (c, x0, y0, x1, y1, fn) => clipTo(c, rect(x0, y0, x1, y1), fn);
/** Füllen + Kontur */
export function shp(c, pts, fill, { stroke = null, lw = 0.012, alpha = 1 } = {}) {
  fillPoly(c, pts, fill, alpha); if (stroke) strokePoly(c, pts, stroke, lw);
}
/** Waagerechter Farbverlauf (links -> rechts) als Lichtseite/Schatten über ein Rechteck */
export function sideLight(c, x0, y0, x1, y1, { left = 'rgba(255,240,200,.22)', right = 'rgba(40,20,5,.28)' } = {}) {
  fillGrad(c, rect(x0, y0, x1, y1), x0, 0, x1, 0, [[0, left], [0.5, 'rgba(0,0,0,0)'], [1, right]]);
}
/** Senkrechter Verlauf oben -> unten */
export function vGrad(c, x0, y0, x1, y1, top, bottom, alpha = 1) {
  fillGrad(c, rect(x0, y0, x1, y1), 0, y1, 0, y0, [[0, top], [1, bottom]], alpha);
}
/** Innen-Vignette: dunkelt Ränder eines Rechtecks ab (Raumtiefe) */
export function vignette(c, x0, y0, x1, y1, { a = 0.3, k = 0.22 } = {}) {
  const w = (x1 - x0) * k, h = (y1 - y0) * k;
  fillGrad(c, rect(x0, y0, x0 + w, y1), x0, 0, x0 + w, 0, [[0, `rgba(30,15,5,${a})`], [1, 'rgba(30,15,5,0)']]);
  fillGrad(c, rect(x1 - w, y0, x1, y1), x1, 0, x1 - w, 0, [[0, `rgba(30,15,5,${a})`], [1, 'rgba(30,15,5,0)']]);
  fillGrad(c, rect(x0, y1 - h, x1, y1), 0, y1, 0, y1 - h, [[0, `rgba(30,15,5,${a * 1.1})`], [1, 'rgba(30,15,5,0)']]);
  fillGrad(c, rect(x0, y0, x1, y0 + h * 0.8), 0, y0, 0, y0 + h * 0.8, [[0, `rgba(30,15,5,${a * 0.6})`], [1, 'rgba(30,15,5,0)']]);
}

// ---- Material: Lehmziegel, Quader, Putz, Holz --------------------------------------------------------
/** Lehmziegelverband im Rechteck. */
export function bricks(c, x0, y0, x1, y1, o = {}) {
  const { bw = 0.34, bh = 0.16, base = C.mud, vary = 0.18, seed = 1, mortar = null, gap = 0.014, hi = 0.2 } = o;
  const rng = rngOf(seed, 77);
  fr(c, x0, y0, x1, y1, mortar || mix(base, '#2a1a0e', 0.45));
  const rows = Math.ceil((y1 - y0) / bh);
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * bh, off = (r % 2) * bw * 0.5 + (o.shift || 0);
    for (let x = x0 - off; x < x1; x += bw) {
      const a0 = Math.max(x0, x + gap / 2), a1 = Math.min(x1, x + bw - gap / 2), b0 = y + gap / 2, b1 = Math.min(y1, y + bh - gap / 2);
      if (a1 - a0 < 0.02 || b1 - b0 < 0.02) continue;
      const t = rng();
      fr(c, a0, b0, a1, b1, t < 0.5 ? mix(base, '#fff4d6', (0.5 - t) * vary * 2) : mix(base, '#2a1a0e', (t - 0.5) * vary * 2));
      if (hi) { fr(c, a0, b1 - gap * 1.1, a1, b1, 'rgba(255,240,205,.22)', hi * 1.2); fr(c, a0, b0, a1, b0 + gap * 1.1, 'rgba(40,20,5,.2)', hi * 1.2); }
    }
  }
}
/** Quadermauerwerk (Sandstein): Schichten mit versetzten Fugen. */
export function blocks(c, x0, y0, x1, y1, o = {}) {
  const { ch = 0.32, bw = 0.7, base = C.sand, vary = 0.1, seed = 1, joint = 'rgba(95,65,30,.55)', jw = 0.012 } = o;
  const rng = rngOf(seed, 78);
  fr(c, x0, y0, x1, y1, base);
  const rows = Math.ceil((y1 - y0) / ch);
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * ch, off = ((r * 0.37) % 1) * bw;
    for (let x = x0 - off; x < x1; x += bw * (0.8 + rng() * 0.4)) {
      const a0 = Math.max(x0, x), a1 = Math.min(x1, x + bw), b1 = Math.min(y1, y + ch);
      const t = rng();
      if (a1 - a0 > 0.03) fr(c, a0, y, a1, b1, t < 0.5 ? '#fff4d6' : '#3a2410', Math.abs(t - 0.5) * vary);
      fr(c, x, y, x + jw, b1, joint, 0.8);
    }
    fr(c, x0, y, x1, y + jw, joint, 0.85);
  }
}
/** Gipsputz / Kalkanstrich: ruhige Fläche mit zarter Fleckung. */
export function plaster(c, x0, y0, x1, y1, base, { seed = 3, n = 60, alpha = 0.1 } = {}) {
  fr(c, x0, y0, x1, y1, base);
  const rng = rngOf(seed, 79);
  for (let i = 0; i < n; i++) {
    const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0), r = 0.05 + rng() * 0.18;
    fillPoly(c, blob(x, y, r, r * (0.5 + rng() * 0.5), rng() * 3, 10), rng() < 0.5 ? '#fff6dc' : '#6a4a2a', alpha * (0.6 + rng() * 0.8));
  }
}
/** Holzmaserung in Rechteck (waagerechte Fasern). */
export function woodGrain(c, x0, y0, x1, y1, base, { seed = 4, n = 14, dir = 'h', dark = '#3a2410' } = {}) {
  fr(c, x0, y0, x1, y1, base);
  const rng = rngOf(seed, 80);
  for (let i = 0; i < n; i++) {
    if (dir === 'h') { const y = y0 + rng() * (y1 - y0), xa = x0 + rng() * (x1 - x0) * 0.4, xb = xa + (x1 - x0) * (0.3 + rng() * 0.6); curve(c, [[xa, y], [(xa + xb) / 2, y + (rng() - 0.5) * 0.02], [Math.min(xb, x1), y]], dark, 0.008, { alpha: 0.28 }); }
    else { const x = x0 + rng() * (x1 - x0), ya = y0 + rng() * (y1 - y0) * 0.4, yb = ya + (y1 - y0) * (0.3 + rng() * 0.6); curve(c, [[x, ya], [x + (rng() - 0.5) * 0.02, (ya + yb) / 2], [x, Math.min(yb, y1)]], dark, 0.008, { alpha: 0.28 }); }
  }
}
/** Palmstamm-Balken im Querschnitt (Kreise mit Jahresringen). */
export function logEnds(c, x0, x1, y, r, { gap = 0.04, seed = 5, col = '#8d6038' } = {}) {
  const rng = rngOf(seed, 81);
  for (let x = x0 + r; x <= x1 - r + 1e-6; x += r * 2 + gap) {
    const rr = r * (0.9 + rng() * 0.15);
    fillPoly(c, blob(x, y + (rng() - 0.5) * r * 0.2, rr, rr, 0, 14), mix(col, '#2a1a0e', rng() * 0.2));
    fillPoly(c, blob(x, y, rr * 0.62, rr * 0.62, 0, 12), mix(col, '#fff4d6', 0.22), 0.9);
    fillPoly(c, blob(x, y, rr * 0.28, rr * 0.28, 0, 10), mix(col, '#2a1a0e', 0.25), 0.9);
  }
}

// ---- Zierzeichen (Hieroglyphen als DEKOR, einzelne echte Zeichen, keine Wörter) -------------------------
// x = Mitte, yb = Unterkante, h = Höhe.
export function glyph(c, kind, x, yb, h, col = C.goldDk, lw = null) {
  const w = lw ?? h * 0.075;
  const L = (pts, ww = w) => line(c, pts, col, ww);
  switch (kind) {
    case 'ankh': {
      strokePoly(c, blob(x, yb + h * 0.8, h * 0.14, h * 0.2, 0, 18), col, w);
      L([[x - h * 0.24, yb + h * 0.58], [x + h * 0.24, yb + h * 0.58]]);
      L([[x, yb + h * 0.6], [x, yb]]);
      break;
    }
    case 'djed': {
      L([[x, yb + 0.02 * h], [x, yb + h * 0.74]], w * 1.5);
      L([[x - h * 0.14, yb + h * 0.02], [x + h * 0.14, yb + h * 0.02]], w * 1.2);
      for (const k of [0.74, 0.83, 0.92]) L([[x - h * 0.2, yb + h * k], [x + h * 0.2, yb + h * k]], w * 0.9);
      break;
    }
    case 'was': {
      L([[x, yb + h * 0.1], [x, yb + h * 0.88]], w * 1.1);
      L([[x, yb + h * 0.1], [x - h * 0.1, yb]]); L([[x, yb + h * 0.1], [x + h * 0.1, yb]]);
      L([[x, yb + h * 0.86], [x + h * 0.1, yb + h * 0.97], [x + h * 0.18, yb + h * 0.92]]);
      break;
    }
    case 'nb': {
      const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; pts.push([x + Math.cos(a) * h * 0.4, yb + h * 0.5 + Math.sin(a) * h * 0.45]); }
      fillPoly(c, pts.concat([[x + h * 0.4, yb + h * 0.5], [x - h * 0.4, yb + h * 0.5]]), col);
      break;
    }
    case 'sonne': {
      strokePoly(c, blob(x, yb + h * 0.5, h * 0.4, h * 0.4, 0, 22), col, w);
      fillPoly(c, blob(x, yb + h * 0.5, h * 0.1, h * 0.1, 0, 10), col);
      break;
    }
    case 'wasser': {
      for (const dy of [0.28, 0.5, 0.72]) L([[x - h * 0.4, yb + h * dy], [x - h * 0.2, yb + h * (dy + 0.1)], [x, yb + h * dy], [x + h * 0.2, yb + h * (dy + 0.1)], [x + h * 0.4, yb + h * dy]], w * 0.85);
      break;
    }
    case 'auge': {
      const up = [], dn = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12, xx = x - h * 0.42 + t * h * 0.84, yy = Math.sin(t * Math.PI) * h * 0.2; up.push([xx, yb + h * 0.45 + yy]); dn.push([xx, yb + h * 0.45 - yy * 0.7]); }
      strokePoly(c, up.concat(dn.reverse()), col, w * 0.8);
      fillPoly(c, blob(x + h * 0.04, yb + h * 0.45, h * 0.1, h * 0.1, 0, 12), col);
      L([[x - h * 0.4, yb + h * 0.66], [x + h * 0.36, yb + h * 0.66]], w * 0.8);
      L([[x - h * 0.05, yb + h * 0.3], [x - h * 0.05, yb + h * 0.12], [x - h * 0.2, yb + h * 0.02]], w * 0.8);
      break;
    }
    case 'feder': {
      L([[x, yb], [x, yb + h * 0.98]], w * 0.8);
      fillPoly(c, leaf(x, yb + h * 0.06, Math.PI / 2, h * 0.9, h * 0.34, { fat: 0.42 }), col);
      L([[x, yb + h * 0.04], [x, yb + h * 0.9]], w * 0.4);
      break;
    }
    case 'lotus': {
      for (const a of [-0.7, 0, 0.7]) fillPoly(c, leaf(x, yb + h * 0.1, Math.PI / 2 + a, h * (a ? 0.7 : 0.9), h * 0.26, { fat: 0.5 }), col);
      L([[x, yb + h * 0.1], [x, yb]], w * 0.8);
      break;
    }
    case 'schilf': {
      fillPoly(c, leaf(x, yb, Math.PI / 2, h, h * 0.2, { fat: 0.5 }), col);
      break;
    }
    case 'stern': star5(c, x, yb + h * 0.5, h * 0.5, col); break;
    case 'wellen': {
      L([[x - h * 0.45, yb + h * 0.4], [x - h * 0.22, yb + h * 0.6], [x, yb + h * 0.4], [x + h * 0.22, yb + h * 0.6], [x + h * 0.45, yb + h * 0.4]], w);
      break;
    }
    default: break;
  }
}
/** Fünfzackiger Stern (Sternendecke) */
export function star5(c, x, y, r, col, alpha = 1) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  fillPoly(c, pts, col, alpha);
}
/** Reihe von Zierzeichen, gleichmäßig verteilt */
export function glyphRow(c, x0, x1, yb, h, kinds, col, { pitch = h * 1.2, lw = null } = {}) {
  const n = Math.max(1, Math.round((x1 - x0) / pitch)); const p = (x1 - x0) / n;
  for (let i = 0; i < n; i++) glyph(c, kinds[i % kinds.length], x0 + p * (i + 0.5), yb, h, Array.isArray(col) ? col[i % col.length] : col, lw);
}

// ---- Bänder, Kehlleiste, Wulst, Sternendecke -----------------------------------------------------------
/** Farbstreifen-Zierband (Rot/Blau/Grün/Gold-Wechsel) */
export function stripeBand(c, x0, x1, y0, y1, cols = [C.carn, C.lapis, C.nile, C.gold], { seed = 1, step = 0.12 } = {}) {
  fr(c, x0, y0, x1, y1, C.linen);
  let i = 0;
  for (let x = x0; x < x1; x += step, i++) fr(c, x, y0, Math.min(x1, x + step * 0.82), y1, cols[i % cols.length]);
  fr(c, x0, y1 - (y1 - y0) * 0.12, x1, y1, 'rgba(255,255,255,.25)');
}
/** Kehlleiste (Hohlkehle): senkrechte Pflanzenblatt-Streifen, Verlauf; oben Rundstab */
export function cavetto(c, x0, y0, x1, y1, { base = C.sand, cols = [C.turq, C.lapis, C.carn], step = 0.09, torus = true } = {}) {
  fr(c, x0, y0, x1, y1, base);
  let i = 0;
  for (let x = x0 + step * 0.2; x < x1 - step * 0.4; x += step, i++) fr(c, x, y0 + (y1 - y0) * 0.08, x + step * 0.55, y1 - (y1 - y0) * 0.1, cols[i % cols.length], 0.9);
  fillGrad(c, rect(x0, y0, x1, y1), 0, y1, 0, y0, [[0, 'rgba(255,245,210,.35)'], [1, 'rgba(60,30,10,.35)']]);
  if (torus) fr(c, x0, y0, x1, y0 + (y1 - y0) * 0.12, 'rgba(60,35,15,.3)');
}
/** Waagerechter Rundstab (Seil) */
export function torusH(c, x0, x1, y0, y1, { base = C.sand, step = 0.07 } = {}) {
  fr(c, x0, y0, x1, y1, base);
  for (let x = x0; x < x1; x += step) strokes(c, [[x, y0, x + step * 0.7, y1]], 'rgba(90,55,20,.5)', 0.012, 1);
  fillGrad(c, rect(x0, y0, x1, y1), 0, y1, 0, y0, [[0, 'rgba(255,245,210,.4)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(50,25,5,.4)']]);
}
/** Senkrechter Rundstab (Wulst an Pylon-Kanten) */
export function torusV(c, x0, x1, y0, y1, { base = C.sand, step = 0.08 } = {}) {
  fr(c, x0, y0, x1, y1, base);
  for (let y = y0; y < y1; y += step) strokes(c, [[x0, y, x1, y + step * 0.7]], 'rgba(90,55,20,.5)', 0.012, 1);
  fillGrad(c, rect(x0, y0, x1, y1), x0, 0, x1, 0, [[0, 'rgba(255,245,210,.4)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(50,25,5,.4)']]);
}
/** Sternendecke: blauer Grund, gelbe Fünfzack-Sterne, Goldrahmen unten */
export function starCeiling(c, x0, y0, x1, y1, { base = C.lapisDk, star = C.gold, pitch = 0.5, r = 0.11, seed = 2 } = {}) {
  fr(c, x0, y0, x1, y1, base);
  fillGrad(c, rect(x0, y0, x1, y1), 0, y1, 0, y0, [[0, 'rgba(255,255,255,.1)'], [1, 'rgba(0,0,20,.22)']]);
  let row = 0;
  for (let y = y0 + (y1 - y0) * 0.5; y > y0 + r; y -= pitch) row++;
  const rows = Math.max(1, Math.round((y1 - y0) / pitch));
  for (let j = 0; j < rows; j++) {
    const y = y0 + (y1 - y0) * ((j + 0.5) / rows);
    for (let x = x0 + pitch * (j % 2 ? 0.75 : 0.25); x < x1; x += pitch) star5(c, x, y, r, star);
  }
}

// ---- Geschirr / Kleinteile (Dekor, Hintergrund) ----------------------------------------------------------
/** Krug im Profil. kind: 'rund' | 'hoch' | 'amphore' | 'napf' | 'flasche' */
export function jar(c, x, yb, h, kind = 'rund', col = '#c9783c', { band = null, shade: sh = true } = {}) {
  let pts;
  const prof = {
    rund: [[0.0, 0.02], [0.3, 0.0], [0.42, 0.25], [0.46, 0.5], [0.38, 0.74], [0.2, 0.86], [0.2, 0.92], [0.27, 1.0]],
    hoch: [[0.0, 0.02], [0.2, 0.0], [0.27, 0.3], [0.3, 0.6], [0.24, 0.84], [0.17, 0.9], [0.17, 0.95], [0.24, 1.0]],
    amphore: [[0.0, 0.0], [0.04, 0.0], [0.14, 0.12], [0.34, 0.4], [0.36, 0.6], [0.26, 0.82], [0.12, 0.88], [0.12, 0.97], [0.2, 1.0]],
    napf: [[0.0, 0.0], [0.28, 0.0], [0.4, 0.4], [0.5, 0.95], [0.52, 1.0]],
    flasche: [[0.0, 0.0], [0.34, 0.0], [0.4, 0.2], [0.34, 0.5], [0.12, 0.7], [0.1, 0.9], [0.17, 1.0]],
  }[kind] || [];
  const half = spline(prof.map(([w, t]) => [w, t, 0]), 6);
  pts = half.map(([w, t]) => [x + w * h * 0.9, yb + t * h]).concat(half.slice().reverse().map(([w, t]) => [x - w * h * 0.9, yb + t * h]));
  const fillc = col;
  fillPoly(c, pts, fillc); strokePoly(c, pts, 'rgba(50,25,10,.55)', h * 0.02);
  if (sh) fillGrad(c, pts, x - h * 0.45, 0, x + h * 0.45, 0, [[0, 'rgba(255,240,200,.28)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(30,10,0,.32)']]);
  if (band) {
    clipTo(c, pts, () => { fr(c, x - h, yb + h * 0.46, x + h, yb + h * 0.58, band); fr(c, x - h, yb + h * 0.3, x + h, yb + h * 0.34, band, 0.7); });
  }
  return pts;
}

// ---- Bemalte Wandfiguren (Profil, Wandmalerei-Stil), für Friese ---------------------------------------
// h = Gesamthöhe, (x, yb) = Mitte Fußlinie, dir = +1 (schaut rechts) / -1 (links).
// kind: horus ra anubis thot hathor isis maat osiris pharao
export function wallFigure(c, x, yb, h, kind = 'horus', { dir = 1, outline = 'rgba(40,20,5,.75)', hold = 'ankh' } = {}) {
  const P = (px, py) => [x + dir * px * h, yb + py * h];
  const poly_ = (pts) => pts.map(([a, b]) => P(a, b));
  const lw = h * 0.012;
  const fill = (pts, col) => { const q = poly_(pts); fillPoly(c, q, col); strokePoly(c, q, outline, lw); };
  const limbf = (ctrl, col) => { const q = limb(ctrl.map(([a, b, w]) => { const p = P(a, b); return [p[0], p[1], w * h]; }), { per: 5 }); fillPoly(c, q, col); strokePoly(c, q, outline, lw); };
  const female = kind === 'hathor' || kind === 'isis' || kind === 'maat';
  const mummy = kind === 'osiris';
  const skin = mummy ? '#5fa070' : female ? C.skinF : C.skinM;
  const headSkin = { horus: '#3a2a20', ra: '#3a2a20', anubis: '#1c1816', thot: C.linen }[kind] || skin;
  if (!mummy) {
    // fernes Bein, nahes Bein, Füße
    limbf([[0.0, 0.5, 0.075], [-0.04, 0.27, 0.065], [-0.095, 0.05, 0.05]], skin);
    fill([[-0.115, 0.058], [0.02, 0.05], [0.03, 0.0], [-0.115, 0.0]], skin);
    limbf([[0.02, 0.5, 0.075], [0.075, 0.27, 0.065], [0.125, 0.05, 0.05]], skin);
    fill([[0.105, 0.058], [0.245, 0.05], [0.255, 0.0], [0.105, 0.0]], skin);
  }
  // Gewand
  if (mummy) {
    fill([[-0.1, 0.0], [0.11, 0.0], [0.13, 0.5], [0.14, 0.76], [-0.14, 0.76], [-0.12, 0.5]], '#e8dcc0');
    for (let k = 0; k < 8; k++) { const q = poly_([[-0.13, 0.08 + k * 0.085], [0.13, 0.12 + k * 0.085]]); strokePoly(c, q, 'rgba(120,100,60,.35)', lw * 0.8); }
  } else if (female) {
    fill([[-0.1, 0.77], [0.1, 0.77], [0.12, 0.45], [0.13, 0.06], [-0.1, 0.06], [-0.11, 0.45]], kind === 'isis' ? C.linen : kind === 'maat' ? C.carn : C.linen);
    fill([[-0.04, 0.8], [0.05, 0.8], [0.06, 0.74], [-0.03, 0.74]], C.gold);
  } else {
    fill([[-0.115, 0.585], [0.105, 0.585], [0.2, 0.47], [0.17, 0.33], [-0.1, 0.33]], C.linen);
    fill([[-0.115, 0.585], [0.105, 0.585], [0.105, 0.55], [-0.115, 0.55]], C.gold);
    const pl = [[-0.04, 0.55, -0.03, 0.34], [0.03, 0.55, 0.05, 0.34], [0.1, 0.55, 0.12, 0.34]];
    for (const [a, b, d, e] of pl) strokePoly(c, poly_([[a, b], [d, e]]), C.linenSh, lw * 0.9);
  }
  // Oberkörper (frontal, schmale Taille), Arme, Kragen
  if (!mummy && !female) fill([[-0.075, 0.585], [0.075, 0.585], [0.125, 0.7], [0.135, 0.8], [-0.135, 0.8], [-0.125, 0.7]], skin);
  if (female) fill([[-0.075, 0.6], [0.075, 0.6], [0.12, 0.7], [0.13, 0.8], [-0.13, 0.8], [-0.12, 0.7]], skin);
  // hinterer Arm hängt
  if (!mummy) limbf([[-0.07, 0.775, 0.055], [-0.115, 0.62, 0.05], [-0.1, 0.5, 0.045]], skin);
  // Halskragen (Wesech)
  const col = [];
  for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; col.push([0.01 + Math.cos(a) * 0.125, 0.8 + Math.sin(a) * 0.1]); }
  fill([[0.135, 0.8], ...col.slice().reverse(), [-0.115, 0.8]].map((p) => p), C.lapis);
  const col2 = col.map(([a, b]) => [a * 0.82 + 0.0018, (b - 0.8) * 0.72 + 0.8]);
  fill([[0.1, 0.8], ...col2.slice().reverse(), [-0.09, 0.8]], C.gold);
  // Hals
  fill([[-0.035, 0.79], [0.045, 0.79], [0.04, 0.855], [-0.03, 0.855]], headSkin === C.linen ? skin : (kind === 'horus' || kind === 'ra' || kind === 'anubis' ? skin : skin));
  // Kopf je Art
  const hx = 0.012, hy = 0.915;
  const head = () => {
    if (['horus', 'ra', 'anubis', 'thot'].includes(kind)) {
      if (kind === 'anubis') {
        fill([[hx - 0.05, hy - 0.05], [hx + 0.05, hy - 0.04], [hx + 0.17, hy - 0.025], [hx + 0.17, hy - 0.002], [hx + 0.06, hy + 0.02], [hx + 0.05, hy + 0.06], [hx - 0.04, hy + 0.06]], '#1c1816');
        fill([[hx - 0.045, hy + 0.05], [hx - 0.025, hy + 0.17], [hx + 0.02, hy + 0.06]], '#1c1816'); // Ohr
        fill([[hx - 0.07, hy + 0.0], [hx - 0.05, hy + 0.06], [hx - 0.09, hy - 0.1], [hx - 0.05, hy - 0.1]], '#1c1816'); // Mähne/Nacken
        fillPoly(c, blob(...P(hx + 0.045, hy + 0.012), h * 0.011, h * 0.011, 0, 8), '#fff0b3');
      } else if (kind === 'thot') {
        fill([[hx - 0.05, hy - 0.05], [hx + 0.045, hy - 0.045], [hx + 0.055, hy + 0.03], [hx + 0.02, hy + 0.065], [hx - 0.045, hy + 0.06]], C.linen);
        const bk = limb([[hx + 0.04, hy + 0.02, 0.028], [hx + 0.11, hy + 0.0, 0.02], [hx + 0.165, hy - 0.05, 0.013], [hx + 0.17, hy - 0.1, 0.006]].map(([a, b, w]) => { const p = P(a, b); return [p[0], p[1], w * h]; }), { per: 5 });
        fillPoly(c, bk, '#2a2420'); strokePoly(c, bk, outline, lw * 0.8);
        fill([[hx - 0.06, hy + 0.05], [hx + 0.03, hy + 0.07], [hx + 0.05, hy + 0.0], [hx - 0.01, hy - 0.08], [hx - 0.08, hy - 0.1]], '#1c1816'); // Perücke
        fillPoly(c, blob(...P(hx + 0.035, hy + 0.02), h * 0.009, h * 0.009, 0, 8), '#c0432e');
      } else { // Falke
        fill([[hx - 0.05, hy - 0.05], [hx + 0.05, hy - 0.04], [hx + 0.065, hy + 0.0], [hx + 0.04, hy + 0.05], [hx + 0.0, hy + 0.065], [hx - 0.045, hy + 0.055]], '#3a2a20');
        fill([[hx + 0.045, hy + 0.025], [hx + 0.105, hy + 0.0], [hx + 0.11, hy - 0.035], [hx + 0.07, hy - 0.01], [hx + 0.045, hy - 0.01]], C.gold);
        fill([[hx - 0.065, hy + 0.045], [hx - 0.01, hy + 0.07], [hx + 0.03, hy + 0.02], [hx - 0.01, hy - 0.08], [hx - 0.085, hy - 0.1]], '#1c1816'); // Federkragen
        fillPoly(c, blob(...P(hx + 0.03, hy + 0.025), h * 0.011, h * 0.009, 0, 8), '#fff0b3');
        strokePoly(c, poly_([[hx + 0.03, hy + 0.0], [hx + 0.02, hy - 0.04], [hx - 0.0, hy - 0.05]]), '#1c1816', lw * 0.9);
      }
    } else { // Mensch
      fill([[hx - 0.04, hy - 0.055], [hx + 0.04, hy - 0.05], [hx + 0.05, hy - 0.02], [hx + 0.065, hy - 0.005], [hx + 0.05, hy + 0.0], [hx + 0.052, hy + 0.025], [hx + 0.035, hy + 0.06], [hx - 0.03, hy + 0.065]], skin);
      fillPoly(c, blob(...P(hx + 0.03, hy + 0.025), h * 0.011, h * 0.008, 0, 8), '#fff8e6');
      strokePoly(c, poly_([[hx + 0.02, hy + 0.03], [hx + 0.065, hy + 0.034]]), '#1c1816', lw * 0.9);
      fill([[hx - 0.075, hy - 0.1], [hx - 0.065, hy + 0.045], [hx - 0.02, hy + 0.085], [hx + 0.045, hy + 0.07], [hx + 0.05, hy + 0.04], [hx - 0.01, hy + 0.045], [hx - 0.03, hy - 0.0], [hx - 0.03, hy - 0.1]], '#1c1816');
    }
    // Kopfschmuck
    if (kind === 'ra') {
      fill([[hx - 0.035, hy + 0.08], [hx + 0.035, hy + 0.08], [hx + 0.03, hy + 0.09], [hx - 0.03, hy + 0.09]], C.gold);
      fillPoly(c, blob(...P(hx, hy + 0.15), h * 0.06, h * 0.06, 0, 18), C.carn); strokePoly(c, blob(...P(hx, hy + 0.15), h * 0.06, h * 0.06, 0, 18), outline, lw);
      strokePoly(c, blob(...P(hx, hy + 0.15), h * 0.044, h * 0.044, 0, 18), C.gold, lw * 1.3);
    } else if (kind === 'horus') {
      fill([[hx - 0.05, hy + 0.08], [hx + 0.045, hy + 0.08], [hx + 0.035, hy + 0.15], [hx + 0.02, hy + 0.22], [hx - 0.005, hy + 0.24], [hx - 0.02, hy + 0.17], [hx - 0.045, hy + 0.17]], '#f6efe0');
      fill([[hx - 0.01, hy + 0.14], [hx + 0.03, hy + 0.14], [hx + 0.02, hy + 0.22], [hx - 0.005, hy + 0.24], [hx - 0.02, hy + 0.17]], C.carn);
    } else if (kind === 'hathor') {
      for (const s of [-1, 1]) { const q = limb([[hx - 0.0, hy + 0.08, 0.016], [hx + s * 0.07 + 0.0, hy + 0.12, 0.016], [hx + s * 0.085, hy + 0.19, 0.01]].map(([a, b, w]) => { const p = P(a, b); return [p[0], p[1], w * h]; }), { per: 5 }); fillPoly(c, q, C.goldDk); }
      fillPoly(c, blob(...P(hx, hy + 0.15), h * 0.045, h * 0.045, 0, 18), C.carn); strokePoly(c, blob(...P(hx, hy + 0.15), h * 0.045, h * 0.045, 0, 18), C.gold, lw * 1.2);
    } else if (kind === 'isis') {
      fill([[hx - 0.04, hy + 0.08], [hx + 0.04, hy + 0.08], [hx + 0.04, hy + 0.115], [hx + 0.025, hy + 0.115], [hx + 0.025, hy + 0.18], [hx - 0.045, hy + 0.18], [hx - 0.045, hy + 0.12]], C.lapis);
    } else if (kind === 'maat') {
      fill([[hx - 0.03, hy + 0.08], [hx + 0.02, hy + 0.08], [hx + 0.03, hy + 0.2], [hx + 0.0, hy + 0.23], [hx - 0.03, hy + 0.2]], C.linen);
      strokePoly(c, poly_([[hx - 0.003, hy + 0.09], [hx - 0.001, hy + 0.22]]), outline, lw);
    } else if (kind === 'osiris') {
      fill([[hx - 0.04, hy + 0.075], [hx + 0.04, hy + 0.075], [hx + 0.045, hy + 0.14], [hx + 0.03, hy + 0.2], [hx + 0.0, hy + 0.27], [hx - 0.03, hy + 0.2], [hx - 0.045, hy + 0.14]], '#f6efe0');
      for (const s of [-1, 1]) fill([[hx + s * 0.04, hy + 0.2], [hx + s * 0.075, hy + 0.17], [hx + s * 0.06, hy + 0.22]], C.carn);
    } else if (kind === 'pharao') {
      fill([[hx - 0.075, hy - 0.1], [hx - 0.065, hy + 0.045], [hx - 0.02, hy + 0.095], [hx + 0.05, hy + 0.08], [hx + 0.05, hy + 0.04], [hx - 0.01, hy + 0.045], [hx - 0.03, hy - 0.0], [hx - 0.03, hy - 0.1]], C.lapis);
      fillPoly(c, blob(...P(hx + 0.045, hy + 0.095), h * 0.012, h * 0.012, 0, 8), C.gold);
    }
  };
  if (mummy) { fill([[-0.04, 0.78], [0.045, 0.78], [0.04, 0.855], [-0.03, 0.855]], skin); fill([[hx - 0.04, hy - 0.055], [hx + 0.04, hy - 0.05], [hx + 0.05, hy - 0.02], [hx + 0.06, hy - 0.005], [hx + 0.05, hy + 0.0], [hx + 0.05, hy + 0.025], [hx + 0.035, hy + 0.06], [hx - 0.04, hy + 0.065]], skin); fillPoly(c, blob(...P(hx + 0.03, hy + 0.025), h * 0.011, h * 0.008, 0, 8), '#fff8e6'); }
  else head();
  // vorderer Arm mit Zeichen
  if (mummy) {
    const arm = (sx) => limbf([[sx * 0.1, 0.74, 0.05], [sx * 0.07, 0.68, 0.05]], '#5fa070');
    arm(1); arm(-1);
    strokePoly(c, poly_([[0.0, 0.73], [0.17, 0.78], [0.2, 0.72]]), C.gold, lw * 2);
    strokePoly(c, poly_([[0.0, 0.7], [0.15, 0.62]]), C.gold, lw * 2);
  } else {
    limbf([[0.045, 0.775, 0.055], [0.12, 0.69, 0.05], [0.215, 0.665, 0.045]], skin);
    const sym = hold || 'ankh';
    const gx = 0.235, gy = 0.6;
    if (sym === 'ankh') {
      const R = (a, b) => P(a, b);
      const q = blob(...R(gx, gy + 0.115), h * 0.032, h * 0.05, 0, 14); strokePoly(c, q, C.goldDk, lw * 2.2);
      strokePoly(c, poly_([[gx - 0.055, gy + 0.062], [gx + 0.055, gy + 0.062]]), C.goldDk, lw * 2.2);
      strokePoly(c, poly_([[gx, gy + 0.065], [gx, gy]]), C.goldDk, lw * 2.2);
    } else if (sym === 'was') {
      strokePoly(c, poly_([[gx, 0.0], [gx, 0.84]]), C.goldDk, lw * 2.2);
      strokePoly(c, poly_([[gx, 0.84], [gx + 0.045, 0.88], [gx + 0.07, 0.855]]), C.goldDk, lw * 2.2);
    }
  }
}

// ---- Abschluss-Helfer ---------------------------------------------------------------------------------
/** Standard-spec Erzeuger mit finish(). */
export const mk = (id, name, parts, anchors, meta, o) => finish({ id, parts, anchors, meta: { name, ...meta } }, o);
/** opts robust: Zahl (variant) oder Objekt */
export const opt = (o) => (o && typeof o === 'object' ? o : o != null ? { variant: o } : {});
