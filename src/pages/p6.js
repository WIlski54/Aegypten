// Station 6: Alltag, Schrift und Papyrus – das Arbeiterdorf Deir el-Medina (ca. 1300 bis 1100 v. Chr.)
// Rechts: das aufgeschnittene Lehmhaus mit Hof, Backstube, Schreibstube, Wohnraum und Dach, belebt mit Figuren und Hausrat.
// Davor eine Papyrus-Fläche, auf der beim Schreiben die Hieroglyphen-Platten nacheinander aufleuchten (Laute auf Wunsch beschriftet).
// Links: Textkarte, Dorf Deir el-Medina (antippbar), Streik-Schild und die SENET-Klappe.
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { textCard, printLabel, SERIF, INK, RED, roundRect, pebbles, grassTufts, blotches, speckles } from '../engine/pagepaint.js';
import { PAGES_DE } from '../data/pages.de.js';
import { poseAmt, paperCard } from '../engine/popup.js';
import { sunGlow, softTexture } from '../engine/effects.js';
import { lerp, clamp, smooth, easeOutBack, TAU, mulberry32, Tweens } from '../engine/util.js';
import { panelPart, cracks, dither, softLight, strata } from './common.js';
import { poly, blob } from '../art/dsl.js';
import { animalPicture } from '../engine/thumbs.js';
import { GLYPH_INFO } from '../art/props/eg_glyphs.js';

const IDX = 6;

// ---- Maße (Weltmaße auf der rechten Seite) -------------------------------------------------------------------
const HX = 6.05, HZ = -0.35, HLEN = 11.3;    // Haus: Mitte x, Standebene z, Breite
const WS = HLEN / 11;                        // Maßstab gegenüber den Spec-Koordinaten des Hauses (Breite 11 m)
const X = (m) => HX + m * WS, Y = (m) => m * WS;      // Hauskoordinaten (Mitte x = 0, Boden y = 0) -> Welt
const FL = Y(0.22), FU = Y(2.83);            // Fußböden: unten (Hof, Backstube, Wohnraum) und oben (Schreibstube, Dach)
const ZI = HZ + 0.04;                        // Standebene der Möbel und Figuren in den Räumen
const SHEET = { x: 6.25, z: 2.2, w: 8.7, d: 1.55 };   // Papyrus-Fläche vor dem Haus
const PZ = 1.72;                             // Standlinie der Hieroglyphen-Platten
const GLYPHS = ['eule', 'wasser', 'mund', 'schilfblatt', 'geier', 'fuss', 'kueken', 'korb'];
const GX0 = 2.75, GDX = 1.0;

const MOOD = mood({ key: '#ffd7a2', keyI: 2.5, sky: '#fff0d2', gnd: '#9a5e3c', hemiI: 1.75, pos: [-14, 16, 9] });

// ---- kleine Teile (Specs für ctx.flat) -------------------------------------------------------------------------
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const arch = (cx, y0, hw, h) => {
  const pts = [[cx - hw, y0]]; const n = 10, r = hw, yb = y0 + h - r;
  pts.push([cx - hw, yb]);
  for (let i = 1; i < n; i++) { const a = Math.PI - (Math.PI * i) / n; pts.push([cx + Math.cos(a) * r, yb + Math.sin(a) * r]); }
  pts.push([cx + hw, yb], [cx + hw, y0]);
  return pts;
};

// Dorf Deir el-Medina: Reihe flacher Lehmziegelhäuser (Hintergrund links)
function villagePart(x0, x1, seed) {
  const r = mulberry32(seed), houses = [], shapes = [];
  let x = x0;
  while (x < x1 - 0.8) {
    const w = Math.min(x1 - x, 1.5 + r() * 1.2), h = 1.15 + r() * 0.95;
    houses.push({ x, w, h, tone: r(), door: 0.2 + r() * 0.35, stair: r() < 0.4 });
    shapes.push(poly(rect(x, 0, x + w + 0.02, h)));
    if (r() < 0.55) shapes.push(poly(rect(x + w * 0.1, h - 0.01, x + w * 0.45, h + 0.34)));   // Aufbau auf dem Dach
    x += w - 0.04;
  }
  return {
    layers: [{
      shapes, fill: { top: '#e2b985', bottom: '#c99562' },
      deco(c, bb) {
        const { ctx, tf, S } = c;
        for (const hs of houses) {
          const [X0, Y0] = tf(hs.x, hs.h), [X1, Y1] = tf(hs.x + hs.w, 0);
          ctx.fillStyle = hs.tone < 0.33 ? '#e9c897' : hs.tone < 0.66 ? '#d8aa74' : '#e1b98a'; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
          ctx.fillStyle = 'rgba(255,245,215,.35)'; ctx.fillRect(X0, Y0, 0.07 * S, Y1 - Y0);
          ctx.fillStyle = 'rgba(80,40,10,.22)'; ctx.fillRect(X1 - 0.09 * S, Y0, 0.09 * S, Y1 - Y0);
          // Dachkante
          ctx.fillStyle = 'rgba(70,35,10,.3)'; ctx.fillRect(X0, Y0, X1 - X0, 0.05 * S);
          // Tür mit türkisem Rahmen
          const dx = hs.x + hs.w * hs.door, dw = 0.34, dh = 0.7;
          const d = arch(dx, 0, dw / 2, dh);
          ctx.beginPath(); d.forEach(([px, py], i) => { const [a, b] = tf(px, py); if (i) ctx.lineTo(a, b); else ctx.moveTo(a, b); }); ctx.closePath();
          ctx.fillStyle = '#2b1a12'; ctx.fill(); ctx.lineWidth = 0.05 * S; ctx.strokeStyle = '#3bb3a8'; ctx.stroke();
          // Fenster
          if (hs.w > 1.9) { const [a, b] = tf(hs.x + hs.w * 0.72, hs.h - 0.35); ctx.fillStyle = '#4a2c1a'; ctx.fillRect(a, b, 0.2 * S, 0.17 * S); }
        }
        // Ziegelfugen leicht
        ctx.strokeStyle = 'rgba(120,70,30,.22)'; ctx.lineWidth = Math.max(1, 0.012 * S);
        for (let y = 0.15; y < bb.y1; y += 0.15) { const [a, b] = tf(bb.x0, y), [e] = tf(bb.x1, y); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(e, b); ctx.stroke(); }
      },
    }],
  };
}

// Theben-Berge: sanfte Kalksteinhänge mit einer Spitze
function hillsPart(x0, x1, h, seed, peakAt = null) {
  const shapes = [poly(panelPart(x0, x1, h, { wave: h * 0.28, freq: 2.4, phase: seed, seed, step: 0.2 }).layers[0].shapes[0])];
  if (peakAt !== null) shapes.push(poly([[peakAt - 2.1, h - 0.6], [peakAt - 0.15, h + 1.5], [peakAt + 0.12, h + 1.52], [peakAt + 2.3, h - 0.7]], 1));
  return {
    layers: [{
      shapes, fill: { top: '#e7c394', bottom: '#cf9f6c' },
      deco(c, bb) {
        strata(c, bb, ['#f0d3a4', '#c9976a', '#e0b583', '#bd8a5c'], { n: 9, wave: 0.07, seed: 4, alpha: 0.32 });
        dither(c, bb, '#7a4a22', { n: 110, alpha: 0.16, size: 0.045, seed: 3 });
        dither(c, bb, '#fff3d0', { n: 70, alpha: 0.26, size: 0.04, seed: 5 });
      },
    }],
  };
}

// Holzschild auf zwei Pfosten
function signPart(w, h, l1, l2, { y0 = 0.75, accent = '#3bb3a8' } = {}) {
  const board = poly(rect(-w / 2, y0, w / 2, y0 + h), 1);
  const posts = [poly(rect(-w * 0.34, 0, -w * 0.34 + 0.12, y0 + h * 0.25)), poly(rect(w * 0.34 - 0.12, 0, w * 0.34, y0 + h * 0.25))];
  return {
    layers: [
      { shapes: posts, fill: '#7a5030', deco: (c, bb) => { dither(c, bb, '#3a2010', { n: 30, alpha: 0.25, size: 0.02 }); } },
      {
        shapes: [board], fill: { top: '#ecd9a4', bottom: '#d9bf80' },
        deco(c, bb) {
          const { ctx, tf, S } = c;
          dither(c, bb, '#8a6a30', { n: 50, alpha: 0.18, size: 0.025, seed: 2 });
          ctx.strokeStyle = accent; ctx.lineWidth = 0.05 * S;
          const [a, b] = tf(bb.x0 + 0.1, bb.y1 - 0.1), [e, f] = tf(bb.x1 - 0.1, bb.y0 + 0.1);
          ctx.strokeRect(a, b, e - a, f - b);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const [cx, cy] = tf((bb.x0 + bb.x1) / 2, bb.y0 + bb.h * 0.62);
          ctx.fillStyle = RED; ctx.font = `bold ${0.3 * S}px ${SERIF}`; ctx.fillText(l1, cx, cy);
          const [cx2, cy2] = tf((bb.x0 + bb.x1) / 2, bb.y0 + bb.h * 0.3);
          ctx.fillStyle = '#4a3220'; ctx.font = `italic ${0.18 * S}px ${SERIF}`; ctx.fillText(l2, cx2, cy2);
        },
      },
    ],
  };
}

// Schlafmatte mit Kopfstütze und Tuch
function matPart() {
  const mat = poly(rect(-0.8, 0, 0.8, 0.1), 1);
  const rest = poly([[-0.62, 0.1], [-0.5, 0.26], [-0.2, 0.26], [-0.08, 0.1]], 1);
  return {
    layers: [
      {
        shapes: [mat], fill: '#d9b866',
        deco(c, bb) {
          const { ctx, tf, S } = c; ctx.strokeStyle = 'rgba(120,70,20,.4)'; ctx.lineWidth = Math.max(1, 0.012 * S);
          for (let x = bb.x0; x < bb.x1; x += 0.07) { const [a, b] = tf(x, bb.y0), [e, f] = tf(x, bb.y1); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(e, f); ctx.stroke(); }
          ctx.fillStyle = '#3bb3a8'; for (let k = 0; k < 6; k++) { const [a, b] = tf(bb.x0 + 0.2 + k * 0.25, bb.y0 + 0.04); ctx.fillRect(a, b, 0.1 * S, 0.03 * S); }
        },
      },
      { shapes: [rest], fill: { top: '#a86a3a', bottom: '#7a4a28' } },
      { shapes: [poly([[0.05, 0.1], [0.55, 0.1], [0.62, 0.17], [0.45, 0.2], [0.15, 0.19]], 1)], fill: '#f6efe0', deco: (c, bb) => { const { ctx, tf, S } = c; ctx.fillStyle = '#c0432e'; const [a, b] = tf(0.1, 0.16); ctx.fillRect(a, b, 0.5 * S, 0.02 * S); } },
    ],
  };
}

// niedriger Holztisch / Hocker für das Senet-Brett
function tablePart(w, h) {
  const top = poly(rect(-w / 2, h - 0.07, w / 2, h), 1);
  const legs = [poly(rect(-w / 2 + 0.06, 0, -w / 2 + 0.16, h - 0.07)), poly(rect(w / 2 - 0.16, 0, w / 2 - 0.06, h - 0.07))];
  const bar = poly(rect(-w / 2 + 0.1, h * 0.35, w / 2 - 0.1, h * 0.35 + 0.05));
  return { layers: [{ shapes: [...legs, bar], fill: '#8a5a32', deco: (c, bb) => { dither(c, bb, '#3a2010', { n: 30, alpha: 0.3, size: 0.02 }); } }, { shapes: [top], fill: { top: '#b98450', bottom: '#8a5a32' }, deco: (c, bb) => { const { ctx, tf, S } = c; ctx.fillStyle = '#e0b040'; const [a, b] = tf(bb.x0, bb.y1 - 0.015); ctx.fillRect(a, b, bb.w * S, 0.012 * S); } }] };
}

// ---- Papyrus-Fläche (Textur) ------------------------------------------------------------------------------------
function sheetCanvas() {
  const W = 1792, H = 448, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const r = mulberry32(17), m = 34;
  // unregelmäßiger Rand
  const edge = (i, n, a, b) => a + (b - a) * (0.5 + 0.5 * Math.sin(i * 1.7 + a));
  g.save();
  g.shadowColor = 'rgba(60,30,5,.38)'; g.shadowBlur = 22; g.shadowOffsetY = 6;
  g.beginPath(); g.moveTo(m, m + 6);
  for (let i = 1; i <= 60; i++) g.lineTo(m + ((W - 2 * m) * i) / 60, m + 6 + (r() - 0.5) * 7);
  for (let i = 1; i <= 16; i++) g.lineTo(W - m + (r() - 0.5) * 7, m + ((H - 2 * m) * i) / 16);
  for (let i = 59; i >= 0; i--) g.lineTo(m + ((W - 2 * m) * i) / 60, H - m + (r() - 0.5) * 7);
  for (let i = 15; i >= 0; i--) g.lineTo(m + (r() - 0.5) * 7, m + ((H - 2 * m) * i) / 16);
  g.closePath();
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ecd9a0'); gr.addColorStop(1, '#dcc382');
  g.fillStyle = gr; g.fill(); g.restore();
  g.save(); g.clip();
  // Fasern: waagerechte und senkrechte Streifen wie bei gepresstem Papyrus
  for (let y = m; y < H - m; y += 9 + r() * 6) { g.fillStyle = `rgba(150,110,50,${0.08 + r() * 0.1})`; g.fillRect(m, y, W - 2 * m, 1.5 + r() * 2); }
  for (let x = m; x < W - m; x += 40 + r() * 40) { g.fillStyle = `rgba(255,248,215,${0.1 + r() * 0.12})`; g.fillRect(x, m, 2 + r() * 3, H - 2 * m); }
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(120,80,30,${0.05 + r() * 0.08})`; g.beginPath(); g.ellipse(m + r() * (W - 2 * m), m + r() * (H - 2 * m), 10 + r() * 30, 4 + r() * 8, r() * 3, 0, TAU); g.fill(); }
  // Rand dunkler
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.55); vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(110,70,20,.28)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.restore();
  // Schreibzeile: rote Randlinie und Platz-Bögen für die Zeichen
  g.strokeStyle = 'rgba(176,48,32,.55)'; g.lineWidth = 3; g.setLineDash([12, 9]); g.strokeRect(m + 22, m + 20, W - 2 * m - 44, H - 2 * m - 40); g.setLineDash([]);
  // gestrichelte Standflächen: hier erscheinen die Zeichen
  g.strokeStyle = 'rgba(120,70,30,.4)'; g.lineWidth = 3; g.setLineDash([9, 8]);
  for (let i = 0; i < GLYPHS.length; i++) {
    const u = ((GX0 + i * GDX - (SHEET.x - SHEET.w / 2)) / SHEET.w) * W, v = ((PZ - (SHEET.z - SHEET.d / 2)) / SHEET.d) * H;
    g.beginPath(); g.ellipse(u, v, 0.42 * (W / SHEET.w), 0.14 * (H / SHEET.d), 0, 0, TAU); g.stroke();
  }
  g.setLineDash([]);
  g.fillStyle = 'rgba(120,60,25,.42)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `italic 34px ${SERIF}`;
  g.fillText('Hier erscheinen die Zeichen', W / 2, H - 70);
  return c;
}

// ---- Beschriftung eines Zeichens (liegt flach auf dem Papyrus) --------------------------------------------------
function labelCanvas(name, laut) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d');
  g.fillStyle = 'rgba(250,244,222,.94)'; roundRect(g, 6, 6, 244, 148, 26); g.fill();
  g.lineWidth = 4; g.strokeStyle = '#2a9d8f'; roundRect(g, 6, 6, 244, 148, 26); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#4a3220'; g.font = `italic 36px ${SERIF}`; g.fillText(name, 128, 38);
  g.fillStyle = '#8B1E1E'; let fs = 92; g.font = `bold ${fs}px ${SERIF}`;
  while (g.measureText(laut).width > 200 && fs > 24) { fs -= 4; g.font = `bold ${fs}px ${SERIF}`; }
  g.fillText(laut, 128, 101);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const nameOf = (k) => { const n = GLYPH_INFO[k].name; return n; };
const lautOf = (k) => GLYPH_INFO[k].laut;

// ---- SENET-Klappe -------------------------------------------------------------------------------------------------
function flapCanvas(kind) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 360; const g = c.getContext('2d');
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  g.fillStyle = '#f7edd3'; rr(0, 0, 512, 360, 28); g.fill();
  g.fillStyle = kind === 'top' ? '#2a9d8f' : '#c8693a'; rr(14, 14, 484, 332, 20); g.fill();
  g.strokeStyle = 'rgba(255,240,200,.75)'; g.lineWidth = 3; g.setLineDash([10, 8]); rr(30, 30, 452, 300, 14); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#fff3d6'; g.textAlign = 'center';
  if (kind === 'top') {
    g.font = `bold 78px ${SERIF}`; g.fillText('SENET', 256, 160);
    g.font = `italic 32px ${SERIF}`; g.fillText('klapp mich auf!', 256, 222);
    g.beginPath(); g.moveTo(256, 280); g.lineTo(226, 248); g.lineTo(286, 248); g.closePath(); g.fill();
  } else {
    g.font = `bold 64px ${SERIF}`; g.fillText('Senet', 256, 140);
    g.font = `italic 30px ${SERIF}`; g.fillText('ein Brettspiel mit 30 Feldern', 256, 204);
    g.font = `24px ${SERIF}`; g.fillText('Tippe zum Zuklappen', 256, 274);
  }
  return c;
}
const toTex = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

export default {
  id: 'alltag',
  mood: MOOD,
  motes: { colors: [[1, 0.88, 0.58], [1, 0.95, 0.78], [0.95, 0.8, 0.55]], size: 0.055, alpha: 0.42, dx: 0.1, dy: 0.06, tw: 1.2, density: 0.7 },
  atmo: 'alltag',

  // ------------------------------------------------------------------------------------------ bemalte Seitenflächen
  base() {
    const d = PAGES_DE[IDX];
    return {
      L: {
        ground: { back: '#e6c48e', front: '#d2a56a' }, margin: 0.3, pageNo: 2 * IDX + 1, seed: 61,
        draw(ctx, m) {
          blotches(m, { x0: -11.8, x1: -0.3, z0: -3, z1: 4.2, n: 22, rmin: 0.8, rmax: 2.2, colors: ['rgba(255,236,190,.2)', 'rgba(160,90,50,.1)', 'rgba(60,150,140,.07)'], seed: 7 });
          speckles(m, { x0: -11.8, x1: -0.3, z0: -3, z1: 4.2, n: 260, color: 'rgba(120,80,40,.2)', size: 0.026, seed: 8 });
          cracks(m, { x0: -11.6, x1: -0.4, z0: -1.0, z1: 4.0, n: 40, seed: 3, color: 'rgba(120,70,30,.2)' });
          // Dorfweg
          ctx.save(); ctx.strokeStyle = 'rgba(247,226,176,.55)'; ctx.lineWidth = 1.5 * m.S; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(m.x(-11.8), m.z(-0.55)); ctx.bezierCurveTo(m.x(-8), m.z(-0.9), m.x(-4), m.z(-0.1), m.x(-0.3), m.z(-0.5)); ctx.stroke(); ctx.restore();
          pebbles(m, { x0: -11, x1: -0.8, z0: -0.4, z1: 3.6, n: 12, seed: 11 });
          grassTufts(m, { x0: -11, x1: -1, z0: 0.0, z1: 3.8, n: 5, seed: 5, color: '#8a9a4a', h: 0.28 });
          // gedruckte Senet-Abbildung unter der Klappe
          const bx = -4.8, bz = 1.55, bw = 2.6, bh = 1.8;
          ctx.save(); ctx.fillStyle = '#f2e3bd'; roundRect(ctx, m.x(bx), m.z(bz), bw * m.S, bh * m.S, 0.12 * m.S); ctx.fill();
          ctx.strokeStyle = 'rgba(60,30,10,.65)'; ctx.lineWidth = 0.035 * m.S; ctx.stroke();
          try { const pic = animalPicture('senet_brett', 640, 300, { pad: 0.02 }); ctx.drawImage(pic, m.x(bx + 0.12), m.z(bz + 0.12), (bw - 0.24) * m.S, (bw - 0.24) * 300 / 640 * m.S); } catch (e) { /* ignore */ }
          ctx.restore();
          printLabel(m, 'Senet: 30 Felder', bx + bw / 2, bz + 1.36, { size: 0.2, color: '#5a3d22', italic: true, bold: false });
          printLabel(m, 'gewürfelt wurde mit Stäbchen', bx + bw / 2, bz + 1.62, { size: 0.15, color: 'rgba(90,55,25,.6)', italic: true, bold: false });
          textCard(m, { x: -11.5, z: -0.05, w: 6.0, h: 4.0, kicker: d.kicker, title: d.title, sub: d.years, body: d.card, size: 0.29, titleSize: 0.42 });
          printLabel(m, 'Deir el-Medina', -4.4, -0.3, { size: 0.19, color: 'rgba(90,55,25,.62)', italic: true, bold: false });
        },
      },
      R: {
        ground: { back: '#e3c18a', front: '#cfa266' }, margin: 0.3, pageNo: 2 * IDX + 2, seed: 62,
        draw(ctx, m) {
          blotches(m, { x0: 0.3, x1: 11.8, z0: -3, z1: 4.2, n: 22, rmin: 0.8, rmax: 2.2, colors: ['rgba(255,236,190,.2)', 'rgba(160,90,50,.1)', 'rgba(60,150,140,.07)'], seed: 9 });
          speckles(m, { x0: 0.3, x1: 11.8, z0: -3, z1: 4.2, n: 260, color: 'rgba(120,80,40,.2)', size: 0.026, seed: 10 });
          cracks(m, { x0: 0.6, x1: 11.4, z0: -0.5, z1: 4.0, n: 50, seed: 12, color: 'rgba(110,70,30,.24)' });
          // gestampfter Lehm-Vorplatz vor dem Haus
          ctx.save(); ctx.fillStyle = 'rgba(240,214,160,.45)';
          ctx.beginPath(); ctx.ellipse(m.x(6.0), m.z(HZ + 0.9), 5.9 * m.S, 1.5 * m.S, 0, 0, TAU); ctx.fill(); ctx.restore();
          pebbles(m, { x0: 1, x1: 11, z0: 0.0, z1: 3.9, n: 12, seed: 13 });
          grassTufts(m, { x0: 0.8, x1: 11.3, z0: 0.0, z1: 3.9, n: 4, seed: 15, color: '#8a9a4a', h: 0.26 });
          // Raumschilder auf dem Boden
          const lab = (t, t2, x) => { printLabel(m, t, x, HZ + 0.5, { size: 0.24, color: '#6b3a22' }); printLabel(m, t2, x, HZ + 0.78, { size: 0.15, color: 'rgba(90,55,25,.7)', italic: true, bold: false }); };
          lab('Hof', '', X(-4.0)); lab('Backstube', 'darüber: Schreibstube', X(-1.0)); lab('Wohnraum', 'darüber: Dach', X(2.3));
          printLabel(m, 'Schreib-Papyrus', SHEET.x, SHEET.z + SHEET.d / 2 + 0.58, { size: 0.17, color: 'rgba(90,55,25,.55)', italic: true, bold: false });
        },
      },
    };
  },

  // ----------------------------------------------------------------------------------------------------- Aufbau
  *build(ctx) {
    const app = ctx.app;
    const side = (x) => (x < 0 ? ctx.L : ctx.R);
    const tw = new Tweens();
    const S = (ctx.spread.p6 = { wv: 0, act: 0, ph: 0, zv: 0, mv: 0, mact: 0, mph: 0, poke: 0, kneadBoost: 0, t: 0, pour: 0, cat: 0, toy: 0, toyW: 0, mkick: 0, idleW: 3 });
    ctx.onUpdate((dt) => tw.update(dt));
    const wobble = (pop) => { tw.add(0.7, (k) => { pop.yawG.rotation.z = Math.sin(k * Math.PI * 3) * 0.07 * (1 - k); }, { done: () => { pop.yawG.rotation.z = 0; } }); };
    const tapProp = (pop, card, extra) => {
      if (!pop || !pop.fig) return;
      pop.pickMeshes = pop.fig.hit.slice();
      for (const m of pop.fig.hit) m.userData.tap = () => { wobble(pop); extra && extra(); if (card) app.openCardById(card, pop.group.position.x); };
    };
    const hop = (a, h = 0.12, dur = 0.5) => a.tw.add(dur, (k) => { a.hop = Math.sin(k * Math.PI) * h; }, { done: () => { a.hop = 0; } });
    const tapFlat = (pop, card, extra) => {
      pop.pickMeshes = [pop.cut.mesh];
      pop.cut.mesh.userData.tap = () => { extra && extra(); if (card) app.openCardById(card, pop.group.position.x); };
    };

    // ------------------------------------------------------------------- Kulissen: Himmel, Berge, Dorf
    const SIDES = [['L', -11.8, -0.15], ['R', 0.15, 11.8]];
    for (const [s, x0, x1] of SIDES) {
      const L = s === 'L', c = (x0 + x1) / 2;
      ctx.flat(panelPart(x0 - c, x1 - c, 5.0, { fill: { top: '#78bfd9', bottom: '#fde5b4' }, wave: 0.28, freq: 3, phase: L ? 0.4 : 2.0, seed: L ? 2 : 5, deco: (cc, bb) => { softLight(cc, bb, { color: 'rgba(255,230,160,.6)', cx: L ? 0.5 : 0.3, cy: 0.45, r: 0.75 }); dither(cc, bb, '#fff', { n: 100, alpha: 0.12, size: 0.04 }); } }), { x: c, z: -4.05, lean: -0.05, name: 'sky' + s, delay: 0, ppu: 70, border: 0.04 });
      ctx.flat(hillsPart(x0 - c, x1 - c, L ? 2.1 : 2.5, L ? 3 : 5, L ? -3.2 : (10.1 - c)), { x: c, z: -3.3, lean: -0.03, name: 'hills' + s, delay: 0.05, ppu: 70, border: 0.04 });
    }
    yield;
    // Sonne (Nachmittag, links) und Wolken
    const sun = ctx.prop('sun_disc', { x: -8.8, y: 2.5, z: -3.9, h: 1.7, delay: 0.1, cast: false });
    const glow = sunGlow({ size: 8.0, color: 0xffc070 }); glow.position.set(0, 0.85, -0.06); sun.add(glow);
    ctx.onUpdate((dt, t) => glow.userData.update(t));
    const cloud = ctx.prop('cloud_a', { x: -3.2, y: 3.9, z: -3.85, len: 2.6, delay: 0.2, cast: false });
    ctx.onUpdate((dt, t) => { cloud.group.position.x = -3.2 + Math.sin(t * 0.05) * 1.4; });
    // Dorf Deir el-Medina auf der linken Seite
    const vil = ctx.flat(villagePart(-5.9, 5.9, 21), { x: -6, z: -2.55, delay: 0.14, name: 'village', ppu: 80, border: 0.04 });
    tapFlat(vil, 'deir_el_medina');
    ctx.prop('dattelpalme', { x: -11.0, z: -3.0, h: 4.4, delay: 0.2 });
    ctx.prop('dattelpalme', { x: -0.9, z: -3.0, h: 3.5, delay: 0.24, facing: -1 });
    ctx.prop('ziegelmauer', { x: -2.4, z: -1.5, len: 4.6, delay: 0.26, variant: { seed: 2 } });
    yield;

    // ------------------------------------------------------------------- Streik-Schild (links)
    const sign = ctx.flat(signPart(1.9, 0.95, 'STREIK!', 'um 1157 v. Chr.'), { x: -1.55, z: 1.0, delay: 0.3, name: 'streik', ppu: 120, border: 0.03 });
    tapFlat(sign, 'streik', () => { wobbleFlat(sign); app.audio.sfx('woodcrack'); });
    function wobbleFlat(pop) { tw.add(0.7, (k) => { pop.yawG.rotation.z = Math.sin(k * Math.PI * 3) * 0.05 * (1 - k); }, { done: () => { pop.yawG.rotation.z = 0; } }); }

    // Handwerker aus dem Dorf (Steinmetz) und eine Streuner-Katze auf der Mauer
    const stein = ctx.stand('steinmetz', { x: -8.6, z: -0.75, h: 2.0, facing: 1, delay: 0.3, hitPad: 0.1 });
    ctx.prop('steinblock', { x: -7.2, z: -0.7, len: 1.25, delay: 0.32 });
    let hit = 0;
    stein.onWake = (a) => { hit = 2.4; app.audio.sfx('chisel'); };
    stein.behaviors.push((dt, t) => {
      hit = Math.max(0, hit - dt);
      const k = hit > 0 ? 1 : 0.18, ph = t * (hit > 0 ? 6.5 : 1.7);
      poseAmt(stein.fig, 'armA', 0.5 + 0.5 * Math.sin(ph) * k * (app.calm && !hit ? 0.5 : 1));
    });
    const strolch = ctx.stand('katze_walk', { x: -3.4, y: 1.52, z: -1.42, len: 1.25, facing: 1, delay: 0.34, hitPad: 0.1, id: 'katze', card: 'katze' });
    let sdir = 1, sx = -3.4;
    strolch.onWake = (a) => { hop(a, 0.12, 0.5); };
    strolch.behaviors.push((dt, t) => {
      const calm = app.calm;
      if (!calm) { sx += sdir * dt * 0.28; if (sx > -1.8) { sdir = -1; strolch.setFacing(-1); } if (sx < -4.2) { sdir = 1; strolch.setFacing(1); } strolch.popup.group.position.x = sx; }
      const ph = sx * 9, sw = strolch.fig.meta.swing || {};
      const amt = calm ? 0 : 1;
      for (const [p, off] of [['legA', 0], ['legB', Math.PI], ['armA', Math.PI], ['armB', 0]]) { const r = sw[p] || [-0.3, 0.3]; strolch.fig.rotatePart(p, lerp(r[0], r[1], 0.5 + 0.5 * Math.sin(ph + off) * amt)); }
      poseAmt(strolch.fig, 'tail', 0.5 + 0.5 * Math.sin(t * 1.2));
    });

    // ------------------------------------------------------------------- das Lehmhaus (rechts)
    const house = ctx.prop('lehmhaus', { x: HX, z: HZ, len: HLEN, delay: 0.1, border: 0.04 });
    house.pickMeshes = house.fig.hit.slice();
    for (const m of house.fig.hit) m.userData.tap = () => app.openCardById('deir_el_medina', HX);
    ctx.prop('dattelpalme', { x: 11.3, z: -3.0, h: 4.3, delay: 0.2 });
    yield;


    // ------------------------------------------------------------------- Schreibstube
    const schr = ctx.stand('schreiber', { hitPad: 0.05, x: X(-1.2), y: FU, z: ZI, h: Y(1.55), facing: 1, delay: 0.3 });
    schr.onWake = (a) => { S.poke = 1.6; hop(a, 0.04, 0.4); app.audio.sfx('papyrus'); };
    const pal = ctx.prop('schreibpalette', { x: X(0.1), y: FU, z: ZI + 0.1, len: Y(0.58), delay: 0.34 });
    const rolle = ctx.prop('papyrusrolle', { x: X(-2.1), y: FU, z: ZI + 0.06, h: Y(0.9), delay: 0.34 });
    tapProp(rolle, 'papyrusrolle', () => app.audio.sfx('papyrus'));
    yield;

    // ------------------------------------------------------------------- Backstube
    const ofen = ctx.prop('ofen', { x: X(0.1), y: FL, z: ZI, h: Y(1.5), delay: 0.28 });
    tapProp(ofen, 'bierbrot', () => app.audio.sfx('bread'));
    const ofenGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: softTexture(), color: 0xff9a40, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    ofenGlow.position.set(0, Y(0.5), 0.08); ofenGlow.renderOrder = 3; ofen.add(ofenGlow);
    const mahl = ctx.prop('mahlstein', { x: X(-0.95), y: FL, z: ZI + 0.1, len: Y(1.3), delay: 0.3 });
    tapProp(mahl, 'mahlstein', () => { S.mkick = 1; app.audio.sfx('quern'); });
    const baek = ctx.stand('baeckerin', { hitPad: 0.05, x: X(-1.7), y: FL, z: ZI, h: Y(1.75), facing: 1, delay: 0.32 });
    baek.onWake = (a) => { S.kneadBoost = 1.8; hop(a, 0.04, 0.4); app.audio.sfx('bread'); };
    const korb = ctx.prop('brotkorb', { x: X(-2.32), y: FL, z: ZI + 0.14, len: Y(0.66), delay: 0.36 });
    // verstecktes Käferchen im Brotkorb
    const kaefer = ctx.stand('skarab7', { x: X(-2.34), y: FL - 0.02, z: ZI + 0.05, len: Y(0.76), facing: 1, delay: 0.5, hidden: true, hint: false, hitPad: 0.05 });
    kaefer.proxy.scale.set(0.72, 0.62, 1);
    kaefer.proxy.position.y = Y(0.28);
    kaefer.onWake = (a) => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.3; }, { done: () => { a.hop = 0; } }); app.audio.voice('skarabaeus'); };
    yield;

    // ------------------------------------------------------------------- Hof
    const brau = ctx.stand('braeuerin', { hitPad: 0.05, x: X(-3.85), y: FL, z: ZI + 0.03, h: Y(1.75), facing: 1, delay: 0.3 });
    brau.onWake = (a) => { S.pour = 1; app.audio.sfx('splash'); };
    const krug = ctx.prop('bierkrug', { x: X(-3.0), y: FL, z: ZI + 0.1, h: Y(0.62), delay: 0.36 });
    tapProp(krug, 'bierbrot', () => app.audio.sfx('bubble'));
    const amph = ctx.prop('amphore', { x: X(-5.0), y: FL, z: ZI + 0.08, h: Y(0.95), delay: 0.36 });
    tapProp(amph, null, () => app.audio.sfx('tapp'));
    const ostr = ctx.prop('ostrakon', { x: X(-4.45), y: FL, z: ZI + 0.14, len: Y(0.55), delay: 0.4 });
    tapProp(ostr, 'papyrusrolle', () => app.audio.sfx('tapp'));
    yield;

    // ------------------------------------------------------------------- Wohnraum
    const tisch = ctx.flat(tablePart(1.0, 0.45), { x: X(2.55), y: FL, z: ZI + 0.06, ws: WS, delay: 0.34, name: 'tisch', ppu: 140 });
    const senet = ctx.prop('senet_brett', { x: X(2.55), y: FL + Y(0.45), z: ZI + 0.08, len: Y(0.78), delay: 0.4 });
    tapProp(senet, 'senet', () => app.audio.sfx('tapp'));
    const kidM = ctx.stand('kind', { hitPad: 0.05, x: X(1.5), y: FL, z: ZI, h: Y(1.55), facing: 1, delay: 0.32, variant: { sex: 'm' } });
    kidM.onWake = (a) => { S.toy = 1; hop(a, 0.1, 0.5); app.audio.sfx('tapp'); };
    const katze = ctx.stand('katze', { hitPad: 0.05, x: X(3.3), y: FL, z: ZI + 0.1, h: Y(0.62), facing: -1, delay: 0.38 });
    katze.setFacing(-1);
    katze.onWake = (a) => { S.cat = 1; hop(a, 0.14, 0.6); };
    yield;

    // ------------------------------------------------------------------- Dach
    const matte = ctx.flat(matPart(), { x: X(2.2), y: FU, z: ZI + 0.06, ws: WS, delay: 0.34, name: 'matte', ppu: 140 });
    const kidW = ctx.stand('kind', { hitPad: 0.05, x: X(3.25), y: FU, z: ZI + 0.04, h: Y(1.4), facing: -1, delay: 0.34, variant: { sex: 'w' } });
    kidW.setFacing(-1);
    kidW.onWake = (a) => { S.toyW = 1; hop(a, 0.1, 0.5); };
    yield;

    // ------------------------------------------------------------------- Papyrus-Fläche und Hieroglyphen-Platten
    const sheetTex = toTex(sheetCanvas());
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(SHEET.w, SHEET.d), new THREE.MeshLambertMaterial({ map: sheetTex, transparent: true }));
    sheet.rotation.x = -Math.PI / 2; sheet.position.set(SHEET.x, 0.014, SHEET.z); sheet.receiveShadow = true;
    ctx.addTo('R', sheet);
    const plates = [];
    const glowTex = softTexture();
    GLYPHS.forEach((k, i) => {
      const x = GX0 + i * GDX;
      const pop = ctx.prop('glyphe_' + k, { x, z: PZ, h: 0.92, delay: 0.45 + i * 0.02 });
      const g = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      g.position.set(0, 0.48, -0.05); g.renderOrder = 3; pop.add(g);
      const lt = labelCanvas(nameOf(k), lautOf(k));
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.56), new THREE.MeshBasicMaterial({ map: lt, transparent: true, opacity: 0, depthWrite: false }));
      lab.rotation.x = -Math.PI / 2; lab.position.set(x, 0.03, PZ + 0.6); lab.visible = false; lab.renderOrder = 2; ctx.addTo('R', lab);
      const P = { k, i, x, pop, glow: g, lab, g: 0, wr: 0, zk: 0, vis: 0 };
      plates.push(P);
      for (const m of pop.fig.hit) {
        m.userData.tap = () => { app.openCardById('hieroglyphen', x); app.audio.sfx('tapp'); wobble(pop); };
        ctx.R.addTap(m, m.userData.tap, () => P.vis > 0.6);
      }
      pop.pivot.visible = false;
    });
    yield;

    // ------------------------------------------------------------------- SENET-Klappe (links)
    {
      const hinge = new THREE.Group(); hinge.position.set(-3.5, 0.03, 1.55);
      const card = paperCard(2.6, 1.8, toTex(flapCanvas('top')), toTex(flapCanvas('bottom')), { depth: 0.05 });
      card.userData.bottom.rotation.set(Math.PI / 2, 0, 0);   // Unterseite zeigt nach vorn, wenn die Klappe steht
      hinge.add(card); ctx.L.add(hinge);
      let open = 0, target = 0;
      const toggle = (on) => {
        target = on === undefined ? (target ? 0 : 1) : on;
        app.audio.sfx(target ? 'flapOpen' : 'flapClose');
        if (target) { setTimeout(() => { if (target && ctx.spread.active) { app.audio.sfx('harp', { note: 2 }); app.openCardById('senet', -3.5); } }, 500); }
      };
      ctx.L.addTap(card.userData.top, () => toggle());
      card.userData.bottom.userData.tap = () => toggle(0); ctx.L.taps.push({ mesh: card.userData.bottom });
      ctx.L.onUpdate((dt) => { open += (target - open) * (1 - Math.exp(-dt * 6)); hinge.rotation.x = -open * 1.38; });
      S.flap = { close() { target = 0; }, reset() { target = 0; open = 0; hinge.rotation.x = 0; } };
    }
    yield;

    // ------------------------------------------------------------------- Laschen (rechts)
    const wctl = ctx.control('R', { id: 'schreiben', label: 'SCHREIBEN', a: [1.9, 3.75], b: [4.0, 3.75], size: [2.5, 0.95], color: '#2a9d8f', value: 0, hold: true });
    const zctl = ctx.control('R', { id: 'zeichen', label: 'ZEICHEN', a: [6.6, 3.75], b: [7.5, 3.75], size: [2.0, 0.95], color: '#c8452c', value: 0, hold: true });
    const mctl = ctx.control('R', { id: 'mahlen', label: 'MAHLEN', a: [9.7, 3.75], b: [10.4, 3.75], size: [1.9, 0.95], color: '#b8862d', value: 0, springBack: true });
    for (const c of [wctl, zctl, mctl]) { c.onGrab = () => app.audio.sfx('grab'); c.onRelease = () => app.audio.sfx('snap'); }
    wctl.onTick = (v) => app.audio.sfx('papyrus', { v });
    mctl.onTick = (v) => app.audio.sfx('quern', { v });
    let lastZ = 0;
    zctl.onTick = (v) => { if (Math.abs(v - lastZ) > 0.02) { lastZ = v; app.audio.sfx('harp', { note: Math.floor(v * 9) }); } };
    S.ctls = [wctl, zctl, mctl];

    // ------------------------------------------------------------------- Pro-Bild-Animation
    const aOf = (f, n) => f.anchors[n];
    const tmp = { x: 0, y: 0, z: 0 };
    let smokeT = 0, dustT = 0;
    ctx.onUpdate((dt, t) => {
      S.t = t;
      const calm = app.calm, fxs = app.stage.tier.fx * (calm ? 0.45 : 1);
      // --- SCHREIBEN: Platten wachsen und leuchten nacheinander
      const wv = wctl.sp.x, zv = zctl.sp.x, N = GLYPHS.length;
      const dv = Math.abs(wv - S.wv); S.wv = wv;
      S.act = lerp(S.act, Math.min(1, dv / Math.max(dt, 1e-3) * 0.5), 1 - Math.exp(-dt * 9));
      S.idleW -= dt; if (S.idleW <= 0) { S.idleW = 6 + Math.random() * 5; if (S.poke <= 0 && !calm) S.poke = 1.3; }
      S.poke = Math.max(0, S.poke - dt);
      const writing = Math.max(S.act, S.poke > 0 ? 0.7 : 0, 0);
      S.ph += dt * (7 + 9 * writing);
      const done = wv > 0.985;
      const sc = poseAmt; void sc;
      schr.fig.rotatePart('armA', done ? 0 : 0.07 + (0.02 + 0.07 * writing) * Math.sin(S.ph) + 0.01 * Math.sin(t * 1.3));
      // Binse der Palette tupft
      pal.fig.rotatePart('pinsel', 0.05 + 0.04 * Math.sin(t * 0.9) + (S.act > 0.1 ? 0.15 * Math.sin(S.ph * 0.5) : 0));
      for (const P of plates) {
        P.wr = clamp(wv * N - P.i, 0, 1);
        P.zk = clamp(zv * (N + 2) - P.i * 0.8, 0, 1);
        const target = P.wr > 0 && P.wr < 1 ? 1 : P.wr >= 1 ? 0.2 : 0;
        P.g = lerp(P.g, target, 1 - Math.exp(-dt * (target > P.g ? 12 : 3.2)));
        const vis = Math.max(smooth(P.wr), smooth(P.zk) * 0.999);
        P.vis = vis;
        const scl = vis <= 0.003 ? 0.001 : easeOutBack(clamp(vis * 1.0)) * 1;
        P.pop.pivot.visible = vis > 0.003;
        P.pop.pivot.scale.setScalar(Math.max(0.001, scl));
        const gi = calm ? Math.min(0.5, P.g * 0.5) : P.g;
        for (const cut of P.pop.fig.cuts) cut.material.emissive.setRGB(gi * 0.55, gi * 0.4, gi * 0.12);
        P.glow.material.opacity = gi * 0.6; P.glow.visible = gi > 0.01;
        P.lab.visible = P.zk > 0.01; P.lab.material.opacity = smooth(P.zk); const ls = 0.85 + 0.15 * smooth(P.zk); P.lab.scale.set(ls, ls, 1);
      }
      // --- MAHLEN
      const mv = mctl.sp.x, dmv = Math.abs(mv - S.mv); S.mv = mv;
      S.mact = lerp(S.mact, Math.min(1, dmv / Math.max(dt, 1e-3) * 0.7), 1 - Math.exp(-dt * 8));
      S.mkick = Math.max(0, (S.mkick || 0) - dt * 1.5);
      const lw = mahl.fig.parts.laeufer;
      if (lw) { lw.position.x = (lw.userData.rest ? lw.userData.rest.px : 0) + (mv - 0.5) * 0.6 + Math.sin(t * 9) * 0.015 * S.mkick; lw.rotation.z = (mv - 0.5) * 0.12; }
      S.mph += dmv * 14 + dt * (S.kneadBoost > 0 ? 6 : 1.3);
      S.kneadBoost = Math.max(0, S.kneadBoost - dt);
      const kn = Math.max(S.mact, S.kneadBoost > 0 ? 0.8 : 0);
      baek.fig.rotatePart('armA', -0.12 - (0.06 + 0.1 * kn) * Math.sin(S.mph * 1.1));
      baek.hop = 0.018 * kn * Math.abs(Math.sin(S.mph * 1.1));
      if (S.mact > 0.25 && fxs > 0.05) {
        dustT -= dt;
        if (dustT <= 0) {
          dustT = 0.07 / Math.max(0.3, fxs);
          const w = ctx.world(X(-0.95) + 0.55, FL + 0.3, ZI + 0.3);
          app.fx.dust.emit({ x: w.x + (Math.random() - 0.5) * 0.25, y: w.y, z: w.z, vx: (Math.random() - 0.3) * 0.5, vy: 0.35 + Math.random() * 0.45, vz: 0.1 + Math.random() * 0.2, life: 1.3, size: 0.26, alpha: 0.65, color: [1, 0.98, 0.9], drag: 1.3, grow: 1.8 });
        }
      }
      // --- Ofen: Flamme und Rauch
      const fl = ofen.fig.parts.flamme;
      if (fl) fl.rotation.z = calm ? 0.09 : 0.09 + 0.07 * Math.sin(t * 2.4) + 0.03 * Math.sin(t * 2.9);
      ofenGlow.material.opacity = calm ? 0.36 : 0.36 + 0.06 * Math.sin(t * 2.4);
      smokeT -= dt;
      if (smokeT <= 0 && fxs > 0.05) {
        smokeT = (calm ? 0.9 : 0.45) / Math.max(0.4, fxs);
        const w = ctx.world(X(0.1), FL + Y(1.5) - 0.02, ZI + 0.2);
        app.fx.dust.emit({ x: w.x + (Math.random() - 0.5) * 0.15, y: w.y, z: w.z, vx: (Math.random() - 0.4) * 0.05, vy: 0.3 + Math.random() * 0.12, vz: 0.02, life: 1.5, size: 0.22, alpha: 0.2, color: [0.72, 0.66, 0.6], drag: 0.6, grow: 1.6 });
      }
      // --- Leben im Haus
      const kneadIdle = 0;
      void kneadIdle;
      S.pour = Math.max(0, S.pour - dt * 0.7);
      brau.fig.rotatePart('armA', -0.1 - (S.pour > 0 ? 0.45 * Math.sin(Math.min(1, (1 - S.pour) * 1.6) * Math.PI) : 0.05 * Math.sin(t * 0.8)));
      S.toy = Math.max(0, S.toy - dt * 1.2); S.toyW = Math.max(0, S.toyW - dt * 1.2);
      kidM.fig.rotatePart('armA', 0.18 + 0.12 * Math.sin(t * 1.1) + S.toy * 0.3 * Math.sin(t * 14));
      kidW.fig.rotatePart('armA', 0.18 + 0.12 * Math.sin(t * 1.0 + 1) + S.toyW * 0.3 * Math.sin(t * 14));
      S.cat = Math.max(0, S.cat - dt * 0.9);
      poseAmt(katze.fig, 'tail', 0.5 + 0.5 * Math.sin(t * (calm ? 0.8 : 1.4)) + S.cat);
    });
    // Wunsch-Zustand der Käferchen-Popup-Position gegen Zittern: keine
  },

  onActivate(ctx) { /* nichts: Laschen starten ruhig */ },
  onDeactivate(ctx) {
    const S = ctx.spread.p6; if (!S) return;
    for (const c of S.ctls || []) c.setValue(0, { snap: true });
    if (S.flap) S.flap.reset();
  },
};
