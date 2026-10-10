// Station 2: Ein Pharao, zwei Länder (ca. 3100 bis 2650 v. Chr.)
// Zweigeteilte Bühne: links Unterägypten (Delta, Papyrus, rote Krone), rechts Oberägypten (Lotos, Felsen, weiße Krone).
// Laschen NORD / SÜD schieben die Kronen auf den Kopf des Pharao (beide = Doppelkrone + Goldkonfetti),
// DATUM blendet zwischen der Narmer-Palette (um 3100) und dem Hofstaat des Djoser (um 2650) über.
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { blob, poly } from '../art/dsl.js';
import { printLabel, SERIF, RED, INK, textCard, blotches, speckles, pebbles, grassTufts } from '../engine/pagepaint.js';
import { PAGES_DE } from '../data/pages.de.js';
import { makeFigure, poseAmt } from '../engine/popup.js';
import { lerp, clamp, smooth, TAU, easeOutBack } from '../engine/util.js';
import { sunGlow } from '../engine/effects.js';
import { panelPart, cracks, strata, dither, softLight } from './common.js';

const IDX = 2;

// ------------------------------------------------------------------ Bühnenmaße (Seitenrahmen)
const PH = { x: 2.1, z: 0.5, podH: 0.46, ws: 0 };          // Pharao: Mitte, Tiefe, Podesthöhe
const ROW = 1.0;                                             // vordere Kante der Podeste (z)
const RED_X = -1.7, WHITE_X = 5.75;                         // Sockel der beiden Kronen
const PED_H = 0.72;                                          // Höhe der Kronen-Sockel
const DATUM_CX = 9.3;                                       // Mitte des Zeit-Bildes rechts

// ------------------------------------------------------------------ kleine Malhelfer (Modellkoordinaten, Meter)
const rectPoly = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
function band(c, x0, y0, x1, y1, col, alpha = 1) {
  const [ax, ay] = c.tf(x0, y1), [bx, by] = c.tf(x1, y0);
  c.ctx.save(); c.ctx.globalAlpha = alpha; c.ctx.fillStyle = col; c.ctx.fillRect(ax, ay, bx - ax, by - ay); c.ctx.restore();
}
function zigzag(c, x0, x1, y, h, n, col, alpha = 1) {
  const { ctx, tf } = c; ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = alpha;
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const a = tf(x0 + i * w, y), b = tf(x0 + (i + 0.5) * w, y + h), d = tf(x0 + (i + 1) * w, y);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// Papyrusdolden (Wappenzeichen Unterägyptens)
function emblemPapyrus(c, cx, y0, s, col, stem) {
  const { ctx, tf } = c; ctx.save(); ctx.lineCap = 'round';
  const stalks = [[-0.42, 0.62, 0.9], [0, 0.82, 1.0], [0.42, 0.62, 0.9]];
  for (const [dx, h, k] of stalks) {
    const [x0, yy0] = tf(cx + dx * 0.15 * s, y0), [x1, yy1] = tf(cx + dx * s, y0 + h * s);
    ctx.strokeStyle = stem; ctx.lineWidth = 0.05 * s * c.S; ctx.beginPath(); ctx.moveTo(x0, yy0); ctx.lineTo(x1, yy1); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 0.022 * s * c.S;
    for (let i = 0; i < 11; i++) {
      const a = -0.15 + (i / 10) * (Math.PI + 0.3);
      ctx.beginPath(); ctx.moveTo(x1, yy1); ctx.lineTo(x1 + Math.cos(a) * 0.26 * s * k * c.S, yy1 - Math.sin(a) * 0.26 * s * k * c.S); ctx.stroke();
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x1, yy1, 0.035 * s * c.S, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// Lotosblüte (Wappenzeichen Oberägyptens)
function emblemLotus(c, cx, y0, s, petal, line, stem) {
  const { ctx, tf } = c; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const [bx, by] = tf(cx, y0 + 0.5 * s), [sx, sy] = tf(cx, y0);
  ctx.strokeStyle = stem; ctx.lineWidth = 0.06 * s * c.S; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, by); ctx.stroke();
  const pet = (ang, len, wid) => {
    ctx.save(); ctx.translate(bx, by); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(wid * c.S, -len * 0.55 * c.S, 0, -len * c.S); ctx.quadraticCurveTo(-wid * c.S, -len * 0.55 * c.S, 0, 0); ctx.closePath();
    ctx.fillStyle = petal; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 0.025 * s * c.S; ctx.stroke(); ctx.restore();
  };
  pet(-1.15, 0.62 * s, 0.17 * s); pet(1.15, 0.62 * s, 0.17 * s); pet(-0.6, 0.82 * s, 0.2 * s); pet(0.6, 0.82 * s, 0.2 * s); pet(0, 0.95 * s, 0.22 * s);
  ctx.restore();
}

// ------------------------------------------------------------------ Bauteile (Papierschnitt-Specs)
// Thronpodest mit zwei Stufen (dick extrudiert: Oberseite begehbar)
function podestPart(W = 3.7, H = PH.podH) {
  const s = 0.34, h2 = H * 0.5;
  const shape = poly([[-W / 2, 0], [W / 2, 0], [W / 2, h2], [W / 2 - s, h2], [W / 2 - s, H], [-W / 2 + s, H], [-W / 2 + s, h2], [-W / 2, h2]]);
  return {
    edge: '#e8d29c',
    layers: [{
      shapes: [shape], fill: { top: '#f0dba4', bottom: '#d9b872' },
      deco(c, bb) {
        band(c, -W / 2, 0, W / 2, 0.045, '#8a5f1c', 0.9); band(c, -W / 2, h2 - 0.04, W / 2, h2, '#e0b040');
        band(c, -W / 2 + s, H - 0.05, W / 2 - s, H, '#e0b040');
        zigzag(c, -W / 2 + 0.05, W / 2 - 0.05, 0.05, 0.11, Math.round(W / 0.22), '#2a5aa0', 0.9);
        zigzag(c, -W / 2 + s + 0.05, W / 2 - s - 0.05, h2 + 0.02, 0.1, Math.round((W - 2 * s) / 0.22), '#c0432e', 0.85);
        dither(c, bb, '#8a5f1c', { n: 60, alpha: 0.16, size: 0.03, seed: 3 });
      },
    }],
  };
}
// Sockel für eine Krone (Block mit Farbfeld)
function pedestalPart(w, h, base, dark, rim) {
  return {
    edge: base,
    layers: [{
      shapes: [rectPoly(-w / 2, 0, w / 2, h)], fill: { top: base, bottom: dark },
      deco(c, bb) {
        band(c, -w / 2, h - 0.07, w / 2, h, '#e0b040'); band(c, -w / 2, 0, w / 2, 0.06, '#8a5f1c', 0.8);
        c.ctx.strokeStyle = rim; c.ctx.lineWidth = 0.025 * c.S;
        const [x0, y0] = c.tf(-w / 2 + 0.1, h - 0.14), [x1, y1] = c.tf(w / 2 - 0.1, 0.12); c.ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        zigzag(c, -w / 2 + 0.14, w / 2 - 0.14, 0.14, 0.08, 7, rim, 0.8);
        dither(c, bb, '#000', { n: 40, alpha: 0.1, size: 0.025, seed: 5 });
      },
    }],
  };
}
// Wappentafel (Bogenfenster) mit Emblem
function plaquePart(w, h, fill, rim, emblem) {
  const r = w / 2, pts = [[-r, 0]];
  pts.push([-r, h - r]);
  for (let i = 1; i < 20; i++) { const a = Math.PI - (i / 20) * Math.PI; pts.push([Math.cos(a) * r, h - r + Math.sin(a) * r]); }
  pts.push([r, h - r], [r, 0]);
  return {
    edge: rim,
    layers: [{
      shapes: [poly(pts)], fill: fill,
      deco(c, bb) {
        const { ctx, tf } = c;
        const inset = 0.13; ctx.strokeStyle = '#e0b040'; ctx.lineWidth = 0.05 * c.S; ctx.beginPath();
        const [ax, ay] = tf(-r + inset, 0.0); ctx.moveTo(ax, ay);
        const [bx, by] = tf(-r + inset, h - r); ctx.lineTo(bx, by);
        for (let i = 1; i <= 24; i++) { const a = Math.PI - (i / 24) * Math.PI; const [px, py] = tf(Math.cos(a) * (r - inset), h - r + Math.sin(a) * (r - inset)); ctx.lineTo(px, py); }
        const [ex, ey] = tf(r - inset, 0.0); ctx.lineTo(ex, ey); ctx.stroke();
        softLight(c, bb, { color: 'rgba(255,255,255,.28)', cx: 0.5, cy: 0.75, r: 0.6 });
        emblem(c, bb);
      },
    }],
  };
}
// Hintergrundwand für die Narmer-Palette
function wandPart(w, h) {
  const shape = poly([[-w / 2, 0], [w / 2, 0], [w / 2, h - 0.35], [w / 2 + 0.12, h - 0.35], [w / 2 + 0.12, h], [-w / 2 - 0.12, h], [-w / 2 - 0.12, h - 0.35], [-w / 2, h - 0.35]]);
  return {
    edge: '#d8b878',
    layers: [{
      shapes: [shape], fill: { top: '#ecd199', bottom: '#d5ad68' },
      deco(c, bb) {
        band(c, -w / 2 - 0.12, h - 0.35, w / 2 + 0.12, h, '#c0432e'); band(c, -w / 2 - 0.12, h - 0.38, w / 2 + 0.12, h - 0.35, '#e0b040');
        zigzag(c, -w / 2 - 0.1, w / 2 + 0.1, h - 0.34, 0.2, 22, '#2a5aa0', 0.9);
        band(c, -w / 2, 0, w / 2, 0.55, '#b5693a', 0.5); band(c, -w / 2, 0.52, w / 2, 0.58, '#e0b040');
        zigzag(c, -w / 2 + 0.05, w / 2 - 0.05, 0.06, 0.18, 20, '#f6efe0', 0.8);
        // zwei schlichte Rahmenfelder
        c.ctx.strokeStyle = 'rgba(138,95,28,.7)'; c.ctx.lineWidth = 0.025 * c.S;
        const [x0, y0] = c.tf(-w / 2 + 0.2, h - 0.6), [x1, y1] = c.tf(w / 2 - 0.2, 0.8); c.ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        softLight(c, bb, { color: 'rgba(255,240,190,.45)', cx: 0.5, cy: 0.55, r: 0.65 });
        dither(c, bb, '#8a5f1c', { n: 90, alpha: 0.14, size: 0.04, seed: 9 });
      },
    }],
  };
}
// kleiner Steinsockel (Palette, Falke)
function blockPart(w, h, base = '#e3cb94', dark = '#c9a766') {
  return { edge: base, layers: [{ shapes: [rectPoly(-w / 2, 0, w / 2, h)], fill: { top: base, bottom: dark }, deco(c, bb) { band(c, -w / 2, h - 0.05, w / 2, h, '#e0b040', 0.9); dither(c, bb, '#8a5f1c', { n: 30, alpha: 0.16, size: 0.03, seed: 4 }); } }] };
}

// ------------------------------------------------------------------ Überblenden (Material-Transparenz, rückwärts spulbar)
function fadable(pop) {
  const mats = [];
  pop.pivot.traverse((o) => {
    if (o.isMesh && Array.isArray(o.material) && o.material.length === 2) { o.material = [o.material[0], o.material[1].clone()]; mats.push(o.material[0], o.material[1]); }
  });
  const meshes = []; pop.pivot.traverse((o) => { if (o.isMesh && Array.isArray(o.material)) meshes.push(o); });
  return { pop, mats, meshes, a: 1, tr: false };
}
function setFade(f, a) {
  if (Math.abs(a - f.a) < 0.002 && f.set) return; f.a = a; f.set = true;
  const tr = a < 0.995;
  const flip = tr !== f.tr; f.tr = tr;
  for (const m of f.mats) { m.transparent = tr; m.opacity = a; m.depthWrite = !tr || a > 0.6; if (flip) m.needsUpdate = true; }
  for (const o of f.meshes) o.castShadow = a > 0.5;
  f.pop.pivot.visible = a > 0.01;
}

export default {
  id: 'reich',
  mood: mood({ key: '#fff0cc', keyI: 2.4, sky: '#f5f6e2', gnd: '#a08850', hemiI: 1.85, pos: [-12, 21, 9], rim: 0.1 }),
  motes: { colors: [[1, 0.9, 0.55], [1, 0.97, 0.82], [0.85, 0.96, 0.7]], size: 0.06, alpha: 0.38, dy: 0.05, dx: 0.07, tw: 1.1, density: 0.7 },
  atmo: 'reich',

  base() {
    const d = PAGES_DE[IDX];
    return {
      L: {
        paper: '#f2ecd0', ground: { back: '#d6e3a6', front: '#a9c97a' }, margin: 0.35, pageNo: 2 * IDX + 1, seed: 31,
        draw(ctx, m) {
          blotches(m, { x0: -12, x1: 0, z0: -4.2, z1: 4.2, n: 18, rmin: 0.8, rmax: 2.0, colors: ['rgba(60,130,70,.12)', 'rgba(255,248,200,.14)', 'rgba(40,110,90,.10)'], seed: 6 });
          // Delta: verzweigter Nil (gemalt, rechte Hälfte der linken Seite)
          const arm = (pts, w) => { ctx.beginPath(); pts.forEach(([x, z], i) => { const [X, Y] = m.pt(x, z); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.lineWidth = w * m.S; ctx.stroke(); };
          ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          const arms = [[[-0.3, 2.3], [-1.6, 2.2], [-2.9, 2.5], [-4.3, 2.2], [-5.4, 1.5]], [[-1.6, 2.2], [-2.4, 3.0], [-3.4, 3.2], [-4.8, 3.0]], [[-2.9, 2.5], [-3.5, 1.7], [-4.2, 1.15]]];
          for (const [col, k] of [['rgba(236,226,160,.9)', 1.18], ['rgba(150,160,90,.5)', 1.0], ['#3a9bb0', 0.78], ['#62c0c2', 0.5], ['rgba(220,248,244,.55)', 0.2]]) {
            ctx.strokeStyle = col;
            arms.forEach((a, i) => arm(a, (i === 0 ? 0.62 : 0.4) * k));
          }
          ctx.restore();
          grassTufts(m, { x0: -11, x1: -0.6, z0: -0.2, z1: 3.7, n: 22, seed: 5, color: '#3f8a45', h: 0.34 });
          speckles(m, { x0: -12, x1: 0, z0: -1.5, z1: 4, n: 120, color: 'rgba(250,255,210,.2)', size: 0.02, seed: 7 });
          textCard(m, { x: -11.35, z: 0.55, w: 5.9, h: 3.35, kicker: d.kicker, title: d.title, sub: d.years, body: d.card, size: 0.262, titleSize: 0.38, tilt: -0.012 });
          printLabel(m, 'UNTERÄGYPTEN', RED_X, 1.85, { size: 0.24, color: '#8a2a1e' });
          printLabel(m, 'im Norden · Delta', RED_X, 2.12, { size: 0.17, color: '#4a6a32', bold: false, italic: true });
        },
      },
      R: {
        paper: '#f4ecd2', ground: { back: '#efe3bd', front: '#dcc590' }, margin: 0.35, pageNo: 2 * IDX + 2, seed: 32,
        draw(ctx, m) {
          blotches(m, { x0: 0, x1: 12, z0: -4.2, z1: 4.2, n: 18, rmin: 0.8, rmax: 2.0, colors: ['rgba(255,255,255,.18)', 'rgba(200,150,70,.10)'], seed: 9 });
          cracks(m, { x0: 0.6, x1: 11.4, z0: -0.8, z1: 4.0, n: 50, seed: 12, color: 'rgba(110,70,30,.2)' });
          // Lotos-Teich vor der weißen Krone
          const [px, pz] = m.pt(WHITE_X, 2.15);
          ctx.save();
          for (const [col, k] of [['rgba(236,226,160,.95)', 1.0], ['#4aa6b8', 0.88], ['#79cdd0', 0.6]]) {
            ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(px, pz, 2.0 * k * m.S, 0.78 * k * m.S, -0.03, 0, TAU); ctx.fill();
          }
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.03 * m.S;
          for (let i = 0; i < 7; i++) { const a = i * 0.9, x = px + Math.cos(a) * 1.3 * m.S * (0.5 + (i % 3) * 0.25), y = pz + Math.sin(a) * 0.45 * m.S * (0.6 + (i % 2) * 0.3); ctx.beginPath(); ctx.moveTo(x - 0.2 * m.S, y); ctx.quadraticCurveTo(x, y - 0.06 * m.S, x + 0.2 * m.S, y); ctx.stroke(); }
          ctx.restore();
          pebbles(m, { x0: 6.5, x1: 11.2, z0: 1.8, z1: 3.1, n: 8, seed: 11 });
          grassTufts(m, { x0: 0.8, x1: 11.4, z0: 0.3, z1: 3.8, n: 8, seed: 15, color: '#9a9a4a', h: 0.28 });
          printLabel(m, 'OBERÄGYPTEN', WHITE_X, 3.05, { size: 0.24, color: '#6a5a8a' });
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app, L = ctx.L, R = ctx.R;
    const SK = ['L', 'R'];
    const cuts = []; // fadable Gruppen werden unten gesammelt
    // ---------------------------------------------------------------- Kulissenebenen
    for (const s of SK) {
      const x0 = s === 'L' ? -11.75 : 0.2, x1 = s === 'L' ? -0.2 : 11.75;
      const left = s === 'L';
      ctx.flat(panelPart(x0, x1, 5.0, {
        fill: left ? { top: '#9fd5c4', bottom: '#f6ecbb' } : { top: '#b7dcf0', bottom: '#fdf1d2' }, wave: 0.28, freq: 3, phase: left ? 0.4 : 2.0, seed: left ? 2 : 5,
        deco: (c, bb) => { softLight(c, bb, { color: 'rgba(255,238,170,.6)', cx: left ? 0.85 : 0.2, cy: 0.5, r: 0.8 }); dither(c, bb, '#fff', { n: 100, alpha: 0.12, size: 0.04 }); },
      }), { z: -4.05, lean: -0.05, name: 'sky' + s, delay: 0, ppu: 60, border: 0.04 });
      // fernes Band: links grüne Marsch, rechts Kalkfelsen
      ctx.flat(panelPart(x0, x1, left ? 2.1 : 2.9, {
        fill: left ? { top: '#79b97a', bottom: '#5b9a63' } : { top: '#ecd7a2', bottom: '#d3ac6c' }, wave: left ? 0.4 : 0.6, freq: left ? 4 : 2.6, step: left ? 0.12 : 0.2, phase: left ? 1.0 : 3.3, seed: left ? 8 : 3,
        deco: (c, bb) => { if (left) { dither(c, bb, '#1d5a3a', { n: 140, alpha: 0.16 }); dither(c, bb, '#d9f0a0', { n: 90, alpha: 0.14, size: 0.04 }); } else { strata(c, bb, ['#f4e2b0', '#c8a066', '#e6c88c', '#b98a52'], { n: 8, seed: 4, alpha: 0.32 }); dither(c, bb, '#6b4a1c', { n: 130, alpha: 0.15 }); } },
      }), { z: -3.3, lean: -0.03, name: 'far' + s, delay: 0.05, ppu: 60 });
    }
    yield;
    // Nil als verbindendes Band hinter der Bühne
    ctx.prop('nil_wasser', { x: -5.9, z: -2.35, len: 11.5, delay: 0.1, variant: { tone: 'hell' } });
    ctx.prop('nil_wasser', { x: 5.9, z: -2.35, len: 11.5, delay: 0.1, variant: { tone: 'hell' } });
    const sun = ctx.prop('sun_disc', { x: PH.x + 0.4, y: 2.1, z: -3.9, h: 2.5, delay: 0.1, cast: false });
    const glow = sunGlow({ size: 8.5, color: 0xffd27a }); glow.position.set(0, 1.0, -0.06); glow.scale.setScalar(0.5); sun.add(glow);
    ctx.onUpdate((dt, t) => glow.userData.update(t));
    const cl1 = ctx.prop('cloud_a', { x: -5.5, y: 3.7, z: -3.85, len: 2.8, delay: 0.2, cast: false });
    const cl2 = ctx.prop('cloud_b', { x: 7.5, y: 4.0, z: -3.85, len: 2.4, delay: 0.25, cast: false });
    ctx.onUpdate((dt, t) => { if (app.calm) return; cl1.group.position.x = -5.5 + Math.sin(t * 0.05) * 1.5; cl2.group.position.x = 7.5 + Math.sin(t * 0.04 + 1) * 1.3; });
    ctx.prop('wuestenduene', { x: 6.1, z: -3.0, len: 11.2, delay: 0.08, variant: { seed: 2 } });
    ctx.prop('dattelpalme', { x: 3.3, z: -2.7, h: 3.5, delay: 0.2, facing: -1 });
    ctx.prop('palm', { x: -11.0, z: -2.5, h: 3.7, delay: 0.2 });
    ctx.prop('palm', { x: -7.2, z: -2.9, h: 3.0, delay: 0.22, facing: -1 });
    yield;
    // Unterägypten: Papyrus und Schilf
    ctx.prop('papyrus', { x: -9.7, z: -1.45, h: 2.6, delay: 0.2, variant: { seed: 1 } });
    ctx.prop('papyrus', { x: -6.1, z: -1.6, h: 2.2, delay: 0.24, variant: { seed: 3 } });
    ctx.prop('papyrus', { x: -3.2, z: -1.1, h: 2.6, delay: 0.26, variant: { seed: 5 } });
    ctx.prop('reeds', { x: -4.6, z: -0.9, h: 1.3, delay: 0.3 });
    ctx.prop('reeds', { x: -0.7, z: -1.0, h: 1.2, delay: 0.3, facing: -1 });
    // Oberägypten: Lotos auf dem Teich
    ctx.prop('lotus', { x: 5.0, z: 1.95, len: 1.6, delay: 0.3 });
    ctx.prop('lotus', { x: 6.5, z: 2.45, len: 1.5, delay: 0.32, facing: -1 });
    ctx.prop('lotus', { x: 5.8, z: 2.2, len: 1.2, delay: 0.34 });
    yield;

    // ---------------------------------------------------------------- Thronpodest, Pharao
    const podW = 3.9, podX = PH.x + 0.1;
    const podium = ctx.flat(podestPart(podW), { x: podX, z: ROW, delay: 0.3, thickness: ROW - (PH.z - 0.5) + 0.05, border: 0.03, ppu: 110, name: 'podest' });
    podium.cut.mesh.receiveShadow = true;
    const ph = ctx.stand('pharao', { x: PH.x, z: PH.z, y: PH.podH, h: 3.7, delay: 0.5, hitPad: 0.3, variant: { crown: 'keine', pose: 'stand' }, name: 'Pharao' });
    const pfig = ph.fig; PH.ws = pfig.ws;
    const midx = ((pfig.bbox.x0 + pfig.bbox.x1) / 2) * pfig.ws;
    const headA = pfig.anchors.krone;                        // Platz der Kronen (Figur-Koordinaten)
    ph.onWake = (a) => {
      const k = app.calm ? 0.5 : 1;
      a.tw.add(1.1, (t) => { const s = Math.sin(t * Math.PI); poseAmt(a.fig, 'armA', s); poseAmt(a.fig, 'armB', s * 0.8); a.hop = s * 0.1 * k; }, { done: () => { a.hop = 0; poseAmt(a.fig, 'armA', 0); poseAmt(a.fig, 'armB', 0); } });
    };
    ph.behaviors.push((dt, t, a) => { if (a.tw.list.length === 0 && !app.calm) { poseAmt(a.fig, 'armB', 0.5 + 0.5 * Math.sin(t * 0.8)); } });

    // ---------------------------------------------------------------- Kronen-Sockel und Wappentafeln
    const redPed = ctx.flat(pedestalPart(1.25, PED_H, '#c24a33', '#8f2a1c', '#fbe3b0'), { x: RED_X, z: PH.z + 0.45, delay: 0.3, thickness: 0.9, border: 0.03, ppu: 130, name: 'sockelRot' });
    const whitePed = ctx.flat(pedestalPart(1.25, PED_H, '#f7efe0', '#d6c9ac', '#c0432e'), { x: WHITE_X, z: PH.z + 0.45, delay: 0.3, thickness: 0.9, border: 0.03, ppu: 130, name: 'sockelWeiss' });
    const plaqueRed = ctx.flat(plaquePart(1.8, 3.0, { top: '#3f8f5a', bottom: '#2c6e45' }, '#c9a050', (c) => emblemPapyrus(c, 0, 1.55, 1.15, '#f2e6b0', '#cfe39a')), { x: RED_X, z: PH.z - 0.45, delay: 0.26, thickness: 0.18, border: 0.04, ppu: 100, name: 'tafelRot', lean: -0.02 });
    const plaqueWhite = ctx.flat(plaquePart(1.8, 3.0, { top: '#f8f1de', bottom: '#e2d4b2' }, '#c9a050', (c) => emblemLotus(c, 0, 1.5, 1.35, '#cfe8f6', '#2a5aa0', '#3f8f5a')), { x: WHITE_X, z: PH.z - 0.45, delay: 0.26, thickness: 0.18, border: 0.04, ppu: 100, name: 'tafelWeiss', lean: -0.02 });

    // ---------------------------------------------------------------- Kronen (hängen am Körper des Pharao: folgen Atmen und Hüpfen)
    const HS = 1, RS = 1.45;                                         // Kronenmaßstab relativ zur Pharaofigur (Modell-Meter)
    const mkCrown = (id, k, h) => { const f = makeFigure(id, { h: h * pfig.ws * k * HS, thickness: 0.03, border: 0.012 }); f.meta.k = k; pfig.root.add(f.group); R.own(f); return f; };
    const crownR = mkCrown('rote_krone', 1, 0.36), crownW = mkCrown('weisse_krone', 1, 0.40), crownD = mkCrown('doppelkrone', 1, 0.5);
    const anchorBase = (f) => { const b = f.anchors.base; return b ? b.x : 0; };
    const setCrown = (f, x, y, z, rot = 0, sc = 1) => { f.group.position.set(x - anchorBase(f) * sc, y, z); f.group.rotation.z = rot; f.group.scale.set(sc, sc, sc); f.group.rotation.order = 'ZYX'; };
    // Koordinaten in Figur-Raum: Seite x -> localX
    const lx = (pageX) => pageX - PH.x + midx;
    const headX = headA.x, headY = headA.y;
    const pedTop = PED_H - PH.podH;                           // Sockeloberkante relativ zur Fußhöhe des Pharao
    const restN = { x: lx(RED_X), y: pedTop + 0.02, z: 0.02 }, restS = { x: lx(WHITE_X), y: pedTop + 0.02, z: 0.02 };
    const headZ = 0.1;
    // Zustand
    const st = { n: 0, s: 0, dbl: false, dblK: 0, dblT: 0 };
    const place = (f, rest, v, dir) => {
      const t = smooth(clamp(v)), arc = Math.sin(t * Math.PI);
      setCrown(f, lerp(rest.x, headX, t), lerp(rest.y, headY, t) + arc * 1.7, lerp(rest.z, headZ, t), dir * arc * 0.45, lerp(RS, 1, t));
    };
    const confetti = () => {
      const n = Math.round(46 * app.stage.tier.fx * (app.calm ? 0.45 : 1));
      const w = ctx.world(PH.x + (headX - midx), PH.podH + headY + 0.25, PH.z + 0.3);
      const cols = [[1, 0.82, 0.26], [1, 0.94, 0.62], [0.88, 0.62, 0.16], [0.35, 0.78, 0.7], [0.92, 0.35, 0.25]];
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, sp = 0.8 + Math.random() * 1.6;
        app.fx.dust.emit({ x: w.x + (Math.random() - 0.5) * 0.4, y: w.y + (Math.random() - 0.3) * 0.3, z: w.z, vx: Math.cos(a) * sp, vy: 1.6 + Math.random() * 1.8, vz: Math.sin(a) * sp * 0.6 + 0.3, life: 1.8 + Math.random() * 0.8, size: 0.1 + Math.random() * 0.1, alpha: 0.95, color: cols[i % cols.length], drag: 0.9, grav: 3.2 });
        if (i % 3 === 0) app.fx.glow.emit({ x: w.x, y: w.y, z: w.z + 0.1, vx: Math.cos(a) * sp * 0.6, vy: 1.0 + Math.random(), vz: 0.2, life: 1.2, size: 0.34, alpha: 0.8, color: [1, 0.85, 0.35], drag: 1.2 });
      }
    };
    const apply = () => {
      const both = st.n >= 0.985 && st.s >= 0.985;
      if (both && !st.dbl) { st.dbl = true; st.dblT = 0; confetti(); app.audio.sfx('gold'); app.audio.sfx('chime', { note: 7 }); if (!app.calm) app.cam.shake && app.cam.shake(0.012, 0.25); }
      else if (!both && st.dbl && (st.n < 0.95 || st.s < 0.95)) { st.dbl = false; }
      place(crownR, restN, st.n, -1); place(crownW, restS, st.s, 1);
      crownR.group.visible = !st.dbl; crownW.group.visible = !st.dbl; crownD.group.visible = st.dbl;
    };
    setCrown(crownD, headX, headY, headZ);
    apply();
    ctx.onUpdate((dt) => { if (st.dbl) { st.dblT += dt; setCrown(crownD, headX, headY, headZ, 0, 0.6 + 0.4 * easeOutBack(clamp(st.dblT / 0.55))); } });
    // Laschen
    const nord = ctx.control('L', { id: 'nord', label: 'NORD', a: [-4.9, 3.7], b: [-1.1, 3.7], size: [1.9, 0.95], color: '#b2392a', value: 0, springBack: false, hold: true });
    const sued = ctx.control('R', { id: 'sued', label: 'SÜD', a: [1.4, 3.7], b: [4.3, 3.7], size: [1.9, 0.95], color: '#8e7ab0', value: 0, springBack: false, hold: true });
    nord.on((v) => { st.n = v; apply(); }); sued.on((v) => { st.s = v; apply(); });
    for (const c of [nord, sued]) { c.onGrab = () => app.audio.sfx('grab'); c.onTick = (v) => app.audio.sfx('slide', { v }); c.onRelease = () => app.audio.sfx('snap'); }

    // Antippen der Kronen
    const tapCrown = (f, id, enabled) => { for (const m of f.hit) R.addTap(m, () => { app.audio.sfx('chime', { note: id === 'doppelkrone' ? 9 : 4 }); app.openCardById(id, PH.x); }, enabled); };
    tapCrown(crownR, 'rote_krone', () => !st.dbl); tapCrown(crownW, 'weisse_krone', () => !st.dbl); tapCrown(crownD, 'doppelkrone', () => st.dbl);
    const tapFlat = (pop, id) => { const m = pop.cut.mesh; pop.pickMeshes = [m]; m.userData.tap = () => app.openCardById(id, pop.group.position.x); };
    tapFlat(plaqueRed, 'rote_krone'); tapFlat(plaqueWhite, 'weisse_krone');
    yield;

    // ---------------------------------------------------------------- Kobra (Uräus) und Falke (Horus)
    const kobra = ctx.stand('kobra', { x: -3.35, z: PH.z + 0.65, h: 1.0, delay: 0.5, name: 'Kobra' });
    kobra.behaviors.push((dt, t, a) => { if (a.tw.list.length === 0) poseAmt(a.fig, 'head', app.calm ? 0.2 : 0.35 + 0.35 * Math.sin(t * 0.9)); });
    kobra.onWake = (a) => a.tw.add(1.0, (t) => { poseAmt(a.fig, 'head', Math.sin(t * Math.PI)); a.hop = Math.sin(t * Math.PI) * 0.06; }, { done: () => { a.hop = 0; } });
    const perch = ctx.flat(blockPart(0.9, 0.5), { x: 3.85, z: PH.z + 0.55, y: PH.podH, delay: 0.4, thickness: 0.5, border: 0.025, ppu: 150, name: 'sitzstein' });
    const falke = ctx.stand('falke', { x: 3.85, z: PH.z + 0.3, y: PH.podH + 0.5, len: 0.8, delay: 0.55, name: 'Falke' });
    falke.behaviors.push((dt, t, a) => { if (a.tw.list.length === 0) poseAmt(a.fig, 'head', app.calm ? 0 : 0.5 + 0.5 * Math.sin(t * 0.6 + 1)); });
    falke.onWake = (a) => a.tw.add(1.1, (t) => { const s = Math.sin(t * Math.PI); poseAmt(a.fig, 'wing', s * 0.7); poseAmt(a.fig, 'wing2', s * 0.7); a.hop = s * 0.1; }, { done: () => { a.hop = 0; poseAmt(a.fig, 'wing', 0); poseAmt(a.fig, 'wing2', 0); } });
    yield;

    // ---------------------------------------------------------------- DATUM: Narmer-Palette  <->  Hofstaat des Djoser
    const A0 = [], A1 = [];                                    // Gruppen: um 3100 / um 2650
    const wand = ctx.flat(wandPart(4.3, 3.5), { x: DATUM_CX, z: -1.5, delay: 0.3, thickness: 0.25, border: 0.04, ppu: 80, name: 'palettenwand' });
    const plinth = ctx.flat(blockPart(2.2, 0.55, '#e3cb94', '#c9a766'), { x: DATUM_CX, z: -0.55, delay: 0.34, thickness: 0.7, border: 0.03, ppu: 130, name: 'palettensockel' });
    const pal = ctx.stand('narmer_palette', { x: DATUM_CX, z: -0.75, y: 0.55, h: 2.45, delay: 0.4, hitPad: 0.15, name: 'Narmer-Palette' });
    pal.onWake = (a) => a.tw.add(0.8, (t) => { a.hop = Math.sin(t * Math.PI) * 0.1; }, { done: () => { a.hop = 0; } });
    A0.push(fadable(wand), fadable(plinth), fadable(pal.popup));
    const pyr = ctx.prop('stufenpyramide', { x: 9.5, z: -1.55, len: 4.2, delay: 0.36 });
    const wes = ctx.stand('wesir', { x: 7.55, z: -0.1, h: 2.55, delay: 0.5, name: 'Wesir' });
    const sch = ctx.stand('schreiber', { x: 8.95, z: 0.6, h: 1.6, delay: 0.5, name: 'Schreiber', variant: { pose: 'sit' } });
    wes.onWake = (a) => a.tw.add(1.0, (t) => { poseAmt(a.fig, 'armA', Math.sin(t * Math.PI)); a.hop = Math.sin(t * Math.PI) * 0.06; }, { done: () => { a.hop = 0; poseAmt(a.fig, 'armA', 0); } });
    sch.onWake = (a) => a.tw.add(1.2, (t) => { poseAmt(a.fig, 'armA', Math.sin(t * Math.PI * 3) * 0.5 + 0.5); }, { done: () => { poseAmt(a.fig, 'armA', 0); } });
    A1.push(fadable(pyr), fadable(wes.popup), fadable(sch.popup));
    const pyrTap = () => { pyr.pickMeshes = pyr.fig.hit.slice(); for (const m of pyr.fig.hit) m.userData.tap = () => app.openCardById('stufenpyramide', pyr.group.position.x); };
    pyrTap();
    const hm = new Map([[pal, pal.hitMeshes], [wes, wes.hitMeshes], [sch, sch.hitMeshes]]);
    const pyrHit = pyr.pickMeshes;
    const date = { v: 0 };
    const setDatum = (v) => {
      date.v = v;
      const k = smooth(clamp((v - 0.3) / 0.4)); const a0 = 1 - k, a1 = k;
      for (const f of A0) setFade(f, a0); for (const f of A1) setFade(f, a1);
      pal.hitMeshes = a0 > 0.5 ? hm.get(pal) : []; wes.hitMeshes = a1 > 0.5 ? hm.get(wes) : []; sch.hitMeshes = a1 > 0.5 ? hm.get(sch) : []; pyr.pickMeshes = a1 > 0.5 ? pyrHit : [];
      drawDate(v);
    };
    // Jahres-Schild auf dem Boden
    const cv = document.createElement('canvas'); cv.width = 800; cv.height = 210; const g = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    disp.rotation.x = -Math.PI / 2; disp.position.set(DATUM_CX, 0.012, 2.05); R.add(disp);
    let lastKey = '';
    const drawDate = (v) => {
      const yr = Math.round(lerp(3100, 2650, v) / 10) * 10, early = v < 0.5;
      const key = yr + '|' + early; if (key === lastKey) return; lastKey = key;
      g.clearRect(0, 0, cv.width, cv.height); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#7a1a1a'; g.font = `bold 86px ${SERIF}`; g.fillText('um ' + yr + ' v. Chr.', 400, 70);
      g.fillStyle = '#4a3220'; g.font = `italic 44px ${SERIF}`; g.fillText(early ? 'Die Palette des Narmer' : 'Der Hofstaat des Djoser', 400, 150);
      tex.needsUpdate = true;
    };
    R.own({ dispose() { tex.dispose(); disp.geometry.dispose(); disp.material.dispose(); } });
    setDatum(0);
    const datum = ctx.control('R', { id: 'datum', label: 'DATUM', a: [7.0, 3.7], b: [10.0, 3.7], size: [2.2, 0.95], color: '#b8862d', value: 0, snaps: [0, 1], springBack: false, ticks: 1 });
    datum.on((v) => setDatum(v));
    datum.onGrab = () => app.audio.sfx('grab'); datum.onTick = (v) => app.audio.sfx('slide', { v }); datum.onRelease = () => app.audio.sfx('snap');
    datum.onSnap = (v) => { app.audio.sfx(v > 0.5 ? 'chisel' : 'seal'); };
    printLabel; // (Beschriftung steht im Boden-Schild)
    yield;

    // ---------------------------------------------------------------- verstecktes Käferchen: am Fuß der Stufenpyramide, halb hinter einem Stein
    const rock = ctx.prop('boulder', { x: 11.0, z: -0.2, len: 1.5, delay: 0.5, variant: { seed: 4 } });
    const kaefer = ctx.stand('skarab3', { x: 10.7, y: 0.15, z: -0.55, len: 0.95, facing: 1, delay: 0.56, hidden: true, hint: false, hitPad: 0.25 });
    kaefer.onWake = (a) => { a.tw.add(0.7, (t) => { a.hop = Math.sin(t * Math.PI) * 0.35; }, { done: () => { a.hop = 0; } }); app.audio.voice('skarabaeus'); };
    kaefer.cover = rock;
    ctx.spread.reset = () => { nord.setValue(0); sued.setValue(0); datum.setValue(0); };
  },
  onDeactivate(ctx) { if (ctx.spread.reset) ctx.spread.reset(); },
};
