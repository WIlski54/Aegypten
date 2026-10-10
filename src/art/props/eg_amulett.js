// Gruppe O2 – Schutzzeichen: Anch, Djed, Udjat (Horusauge), Herzskarabäus-Amulett.
// Alle sind farbige Papierplatten (Gold/Lapis/Türkis/Karneol), frontal, Mitte x=0, Basis y=0.
import {
  P, goldH, goldV, lapisV, turqV, carnV, rect, rrect, shift, ring, arcLimb, limb, blob, poly, ankhPolys, djedParts,
  fillPoly, fillPolys, sparkle, cylinder, rectFill, ellipseFill, curve, strokes, volume, finish, mix,
} from './_eg_ritual_kit.js';

const mk = (id, name, parts, anchors, meta, o) => finish({ id, parts, anchors, meta: { name, ...meta } }, o);

// ------------------------------------------------------------------------------------------------
// Anch (Zeichen des Lebens) 0,3 m. opts.stoff: 'gold' (Standard) | 'tuerkis' | 'karneol'
export function ankh(opts = {}) {
  const stoff = opts.stoff || 'gold';
  const base = { gold: goldH, tuerkis: turqV, karneol: carnV }[stoff] || goldH;
  const inlay = { gold: P.lapis, tuerkis: P.gold, karneol: P.gold }[stoff];
  const outer = ankhPolys(0, 0, 1, 1);
  const inner = ankhPolys(0, 0.012, 1, 0.42);
  const layers = [
    {
      shapes: outer, fill: base,
      deco(c, bb) {
        if (stoff === 'gold') cylinder(c, bb, { dark: 'rgba(60,30,0,0.25)', light: 'rgba(255,250,210,0.35)' });
        else volume(c, bb);
        sparkle(c, -0.14, 0.98, 0.07);
      },
    },
    { shapes: inner, fill: inlay, deco(c, bb) { volume(c, bb, { dark: 'rgba(0,0,20,0.3)', light: 'rgba(255,255,255,0.18)' }); } },
  ];
  return mk('ankh', 'Anch', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, loop: { rel: [0.5, 0.76] } }, { kind: 'amulett', lengthM: 0.3, bedeutung: 'Leben' }, { h: opts.h ?? 0.3 });
}

// ------------------------------------------------------------------------------------------------
// Djed-Pfeiler (Stabilität, Osiris) 0,4 m: Lapis-Schaft, vier goldene Querbalken, Goldsockel.
export function djed(opts = {}) {
  const d = djedParts(0, 0, 1);
  const layers = [
    {
      shapes: [d.base, d.shaft], fill: lapisV,
      deco(c, bb) {
        cylinder(c, bb, { dark: 'rgba(0,0,30,0.35)', light: 'rgba(200,225,255,0.3)' });
        // goldene Streifen am Schaft
        for (let y = 0.12; y < 0.6; y += 0.11) rectFill(c, -0.12, y, 0.12, y + 0.022, P.gold, 0.85);
      },
    },
    { shapes: [d.base], fill: goldH, deco(c, bb) { cylinder(c, bb); } },
    {
      shapes: d.bars, fill: goldH,
      deco(c, bb) {
        cylinder(c, bb, { dark: 'rgba(60,30,0,0.3)', light: 'rgba(255,250,210,0.3)', at: 0.2 });
        volume(c, bb, { dark: 'rgba(60,30,0,0.25)', light: 'rgba(255,250,210,0.15)' });
        for (let i = 0; i < 4; i++) {
          const yy = 0.63 + i * 0.1, w = 0.15 + (i % 2) * 0.012;
          rectFill(c, -w + 0.03, yy + 0.026, w - 0.03, yy + 0.046, i % 2 ? P.turq : P.carn, 0.9);
        }
        sparkle(c, -0.1, 0.97, 0.05);
      },
    },
  ];
  return mk('djed', 'Djed-Pfeiler', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] } }, { kind: 'amulett', lengthM: 0.4, bedeutung: 'Stabilität (Osiris)' }, { h: opts.h ?? 0.4 });
}

// ------------------------------------------------------------------------------------------------
// Udjat / Horusauge 0,25 m (Breite ~0,25): Gold-Rahmen, weißes Auge, Lapis-Braue, Wangenstreif und Spirale.
const bez = (a, b, c, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]]; });
function udjatShapes(g) {
  const up = bez([-0.5 - g, 0.0], [0, 0.46 + g * 1.5], [0.5 + g, 0.03]);
  const lo = bez([0.5 + g, 0.03], [0, -0.30 - g * 1.5], [-0.5 - g, 0.0]);
  const almond = up.concat(lo.slice(1, -1));
  const brow = limb([[-0.56, 0.3, 0.07 + g], [-0.28, 0.46, 0.1 + g], [0.18, 0.5, 0.1 + g], [0.6, 0.36, 0.07 + g]], { per: 8 });
  const cheek = limb([[0.0, -0.14, 0.1 + g], [0.0, -0.36, 0.1 + g], [-0.12, -0.48, 0.08 + g]], { per: 8 });
  // Spirale: Schwanz vom äußeren Augenwinkel, dann eingerollt
  const S = [0.5, -0.36];
  const ctrl = [[0.5, 0.0, 0.08 + g], [0.62, -0.11, 0.08 + g], [0.69, -0.26, 0.08 + g]];
  for (let k = 0; k <= 16; k++) {
    const t = k / 16, a = (-8 - 380 * t) * Math.PI / 180, r = 0.19 - 0.12 * t;
    ctrl.push([S[0] + Math.cos(a) * r, S[1] + Math.sin(a) * r, (0.08 - 0.02 * t) + g]);
  }
  const spiral = limb(ctrl, { per: 4 });
  return { almond, brow, cheek, spiral };
}
export function udjat(opts = {}) {
  const o = udjatShapes(0.022), i = udjatShapes(0);
  const iris = blob(0.02, 0.05, 0.15, 0.15, 0, 28);
  const layers = [
    { shapes: [o.almond, o.brow, o.cheek, o.spiral], fill: goldH, deco(c, bb) { cylinder(c, bb, { dark: 'rgba(60,30,0,0.3)', light: 'rgba(255,250,210,0.3)', at: 0.2 }); } },
    { shapes: [i.brow, i.cheek, i.spiral], fill: lapisV, deco(c, bb) { cylinder(c, bb, { dark: 'rgba(0,0,30,0.3)', light: 'rgba(200,225,255,0.3)' }); } },
    { shapes: [i.almond], fill: { top: '#fffaf0', bottom: '#e8dcc0' }, deco(c, bb) { volume(c, bb, { dark: 'rgba(120,90,40,0.25)', light: 'rgba(255,255,255,0.1)' }); } },
    {
      shapes: [iris], fill: { top: '#2a5aa0', bottom: '#0f1c3c' },
      deco(c) {
        ellipseFill(c, 0.02, 0.05, 0.075, 0.075, '#0b0f1e'); ellipseFill(c, 0.0, 0.1, 0.03, 0.03, '#ffffff', 0.9);
      },
    },
  ];
  return mk('udjat', 'Udjat (Horusauge)', { body: { z: 1, layers } },
    { eye: [0.02, 0.05], top: { rel: [0.5, 1] } }, { kind: 'amulett', lengthM: 0.25, bedeutung: 'Schutz, Heilung' }, { w: opts.w ?? 0.25 });
}

// ------------------------------------------------------------------------------------------------
// Herzskarabäus 0,12 m: Skarabäus in dunkelgrünem Stein, vergoldeter Rahmen mit Öse.
function scarabShapes() {
  const head = blob(0, 0.33, 0.13, 0.085, 0, 20);
  const pro = poly([[-0.15, 0.27], [0.15, 0.27], [0.22, 0.12], [-0.22, 0.12]], 2);
  const elytra = blob(0, -0.12, 0.25, 0.38, 0, 36);
  const legs = [];
  for (const sd of [-1, 1]) {
    legs.push(limb([[sd * 0.2, 0.2, 0.05], [sd * 0.31, 0.27, 0.045], [sd * 0.37, 0.2, 0.04]], { per: 5 }));
    legs.push(limb([[sd * 0.23, -0.02, 0.05], [sd * 0.36, 0.02, 0.045], [sd * 0.4, -0.06, 0.04]], { per: 5 }));
    legs.push(limb([[sd * 0.21, -0.26, 0.05], [sd * 0.33, -0.34, 0.045], [sd * 0.36, -0.44, 0.04]], { per: 5 }));
  }
  return { head, pro, elytra, legs };
}
export function amulett_herzskarabaeus(opts = {}) {
  const sc = scarabShapes();
  const frameOval = blob(0, 0, 0.52, 0.66, 0, 44);
  const loop = ring(0, 0.76, 0.12, 0.12, 0.062, 0.062, 24);
  const stoneOval = blob(0, 0, 0.44, 0.58, 0, 44);
  const green = { stops: [[0, '#4fa07a'], [0.5, '#2f6f55'], [1, '#17402e']], dir: 'v' };
  const layers = [
    {
      shapes: [frameOval, loop], fill: goldV,
      deco(c, bb) {
        cylinder(c, bb, { dark: 'rgba(60,30,0,0.25)', light: 'rgba(255,250,210,0.3)' });
        // Perlenkranz im Rahmen
        for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2; ellipseFill(c, Math.cos(a) * 0.485, Math.sin(a) * 0.625, 0.022, 0.022, k % 2 ? P.carn : P.turq, 0.95); }
      },
    },
    { shapes: [stoneOval], fill: { top: '#1f3f66', bottom: '#0f1c3c' }, deco(c, bb) { volume(c, bb); } },
    {
      shapes: [sc.head, sc.pro, sc.elytra, ...sc.legs], fill: green,
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(0,10,5,0.4)', light: 'rgba(200,255,220,0.25)' });
        curve(c, [[0, 0.1], [0, -0.5]], '#0d2a1d', 0.018, { alpha: 0.8 });
        curve(c, [[-0.15, 0.27], [0.0, 0.24], [0.15, 0.27]], '#0d2a1d', 0.014, { alpha: 0.8 });
        curve(c, [[-0.2, 0.12], [0, 0.1], [0.2, 0.12]], '#0d2a1d', 0.014, { alpha: 0.8 });
        for (let k = 0; k < 4; k++) { const y = -0.02 - k * 0.12; curve(c, [[-0.22 + k * 0.025, y], [-0.1, y - 0.03]], '#0d2a1d', 0.01, { alpha: 0.5 }); curve(c, [[0.22 - k * 0.025, y], [0.1, y - 0.03]], '#0d2a1d', 0.01, { alpha: 0.5 }); }
        sparkle(c, -0.12, -0.05, 0.05, { alpha: 0.7 });
        for (const sd of [-1, 1]) for (const [x, y] of [[0.05, 0.31], [0.07, 0.34]]) ellipseFill(c, sd * x, y, 0.012, 0.012, '#fff6d0', 0.9);
      },
    },
  ];
  return mk('amulett_herzskarabaeus', 'Herzskarabäus', { body: { z: 1, layers } },
    { loop: { rel: [0.5, 0.95] }, center: [0, 0] }, { kind: 'amulett', lengthM: 0.12, bedeutung: 'Schutz des Herzens beim Totengericht' }, { h: opts.h ?? 0.12 });
}
