// Station 8 (Finale): Kleopatra, der Stein von Rosette und die Parade der Stationsfiguren.
// Links Alexandria (Hafen, Leuchtturm, Bibliothek, Handelsschiff, Kleopatra), rechts ein Gelehrtenzimmer um 1822 mit dem Rosetta-Stein.
// Laschen: LEUCHTTURM (L), 3 SPRACHEN (R, Bänder nacheinander + Namenslinie), FINALE (R, Sonnenbarke + Parade, Käferzähler).
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { textCard, SERIF, RED, INK } from '../engine/pagepaint.js';
import { PAGES_DE } from '../data/pages.de.js';
import { ANIMALS_DE } from '../data/animals.de.js';
import { Popup, poseAmt, FOLD } from '../engine/popup.js';
import { sunGlow, softTexture } from '../engine/effects.js';
import { animalPicture } from '../engine/thumbs.js';
import { clamp, lerp, smooth, TAU, mulberry32 } from '../engine/util.js';
import { panelPart, dither, softLight } from './common.js';
import { drawCartouche } from '../art/props/eg_glyphs.js';

const IDX = 8;
const HID = Object.keys(ANIMALS_DE).filter((k) => ANIMALS_DE[k].hidden);

// ------------------------------------------------------------------ kleine Helfer
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); return c; };
const tex = (c, aniso = 4) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
// Painter für die Glyphen-Funktionen aus eg_glyphs.js (Meter, y nach oben)
const painter = (c, S) => ({ ctx: c.getContext('2d'), S, W: c.width, H: c.height, tf: (x, y) => [x * S, c.height - y * S], rng: mulberry32(5) });
// flaches, bedrucktes Blatt, das auf der Seite liegt
function pageSheet(side, w, h, canvas, x, z, { rot = 0, order = 2 } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(canvas, 8), transparent: true, depthWrite: false }));
  m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, 0.014, z); m.renderOrder = order;
  side.add(m); return m;
}
// Fläche mit eigener Textur in einem Pop-up (mitfaltend)
function popupPlane(side, { x, y = 0, z, w, h, map, cx = 0, cy = 0, opacity = 1, additive = false, color = 0xffffff, rotZ = 0 }) {
  const pop = new Popup(side, { x, y, z, name: 'p8-plane', k: 90, d: 12 });
  const mat = new THREE.MeshBasicMaterial({ map, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, color });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(cx, cy, 0); m.renderOrder = 3; m.castShadow = false;
  const holder = new THREE.Group(); holder.rotation.z = rotZ; holder.add(m); pop.add(holder);
  side.addPopup(pop); pop.mesh = m; pop.holder = holder; return pop;
}

// ------------------------------------------------------------------ Hieroglyphen-Kartusche PTOLEMAIOS (Bildfolge wie auf dem Stein)
const NAME = ['matte', 'brot', 'kueken', 'loewe', 'eule', 'schilfblatt', 'schilfblatt', 'stoff'];

// ------------------------------------------------------------------ Namensschild „Ptolemaios in drei Schriften“
const NS_W = 5.4, NS_H = 1.75, NS_PX = 190;
function drawNameSheet(c, k) { // k = {h,d,g}: Einblendung der Spalten 0..1
  const g = c.getContext('2d'), S = NS_PX, W = c.width, H = c.height;
  g.clearRect(0, 0, W, H);
  g.save(); g.shadowColor = 'rgba(40,20,5,.35)'; g.shadowBlur = 0.12 * S; g.shadowOffsetY = 0.04 * S;
  g.fillStyle = '#f6edd2'; rr(g, 0.1 * S, 0.1 * S, W - 0.2 * S, H - 0.2 * S, 0.1 * S); g.fill(); g.restore();
  g.strokeStyle = 'rgba(139,30,30,.35)'; g.lineWidth = 0.015 * S; rr(g, 0.2 * S, 0.2 * S, W - 0.4 * S, H - 0.4 * S, 0.06 * S); g.stroke();
  g.fillStyle = RED; g.font = `bold ${0.23 * S}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('Der Name „Ptolemaios“ in drei Schriften', W / 2, 0.42 * S);
  const cols = [
    { key: 'h', name: 'Hieroglyphen', col: '#b8862d' },
    { key: 'd', name: 'Demotisch', col: '#2aa39a' },
    { key: 'g', name: 'Griechisch', col: '#2a5aa0' },
  ];
  const cw = (W - 0.6 * S) / 3, x0 = 0.3 * S, y0 = 0.62 * S, ch = H - y0 - 0.3 * S;
  cols.forEach((cl, i) => {
    const x = x0 + i * cw + 0.05 * S, w = cw - 0.1 * S, on = k[cl.key];
    g.save(); g.globalAlpha = 0.4 + 0.6 * on;
    g.fillStyle = on > 0.5 ? '#fffaf0' : '#e7dcc0'; rr(g, x, y0, w, ch, 0.08 * S); g.fill();
    g.lineWidth = 0.045 * S; g.strokeStyle = cl.col; g.setLineDash(on > 0.5 ? [] : [0.12 * S, 0.09 * S]); rr(g, x, y0, w, ch, 0.08 * S); g.stroke(); g.setLineDash([]);
    g.restore();
    g.fillStyle = cl.col; g.font = `bold ${0.165 * S}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(cl.name, x + w / 2, y0 + 0.17 * S);
    const cx = x + w / 2, cy = y0 + ch * 0.62;
    if (on > 0.5) {
      if (i === 0) {
        drawCartouche(painter(c, S), NAME.slice().reverse(), cx / S, (H - cy) / S, 1.4, 0.42, { flip: false, ink: '#2b1a10', bg: '#fff6d8', style: 'color', ring: '#2b1a10' });
      } else if (i === 1) { // Alltagsschrift: fließende Zierstriche (kein Text)
        g.strokeStyle = '#1f6f68'; g.lineWidth = 0.028 * S; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); let px = cx + 0.62 * S; g.moveTo(px, cy - 0.04 * S);
        for (let j = 0; j < 9; j++) { const nx = px - 0.14 * S; g.quadraticCurveTo(px - 0.07 * S, cy + (j % 2 ? 0.2 : -0.2) * S, nx, cy + (j % 3 === 0 ? 0.05 : -0.04) * S); px = nx; }
        g.stroke();
      } else {
        g.fillStyle = '#16315e'; g.font = `bold ${0.205 * S}px ${SERIF}`; g.fillText('ΠΤΟΛΕΜΑΙΟΣ', cx, cy);
      }
    } else {
      g.fillStyle = 'rgba(120,90,50,.55)'; g.font = `bold ${0.4 * S}px ${SERIF}`; g.fillText('?', cx, cy);
    }
  });
}

// ------------------------------------------------------------------ Käferleiste (Zähler app.found.size / 9)
const KL_W = 4.6, KL_H = 1.3, KL_PX = 170;
function drawBeetleStrip(c, found) {
  const g = c.getContext('2d'), S = KL_PX, W = c.width, H = c.height;
  g.clearRect(0, 0, W, H);
  g.save(); g.shadowColor = 'rgba(40,20,5,.35)'; g.shadowBlur = 0.1 * S; g.shadowOffsetY = 0.04 * S;
  g.fillStyle = '#f6edd2'; rr(g, 0.1 * S, 0.1 * S, W - 0.2 * S, H - 0.2 * S, 0.1 * S); g.fill(); g.restore();
  g.strokeStyle = 'rgba(139,30,30,.35)'; g.lineWidth = 0.014 * S; rr(g, 0.19 * S, 0.19 * S, W - 0.38 * S, H - 0.38 * S, 0.06 * S); g.stroke();
  const n = HID.filter((k) => found.has(k)).length;
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = RED; g.font = `bold ${0.22 * S}px ${SERIF}`;
  g.fillText('Deine Sonnenkäfer', 0.36 * S, 0.43 * S);
  g.textAlign = 'right'; g.fillStyle = n === HID.length ? '#2a7a45' : INK; g.font = `bold ${0.3 * S}px ${SERIF}`;
  g.fillText(`${n} / ${HID.length}`, W - 0.36 * S, 0.43 * S);
  const sw = (W - 0.5 * S) / HID.length, sy = 0.62 * S, sh = H - sy - 0.3 * S;
  HID.forEach((id, i) => {
    const x = 0.25 * S + i * sw + 0.03 * S, w = sw - 0.06 * S, got = found.has(id);
    g.fillStyle = got ? '#e9d7a8' : '#d9ccaa'; rr(g, x, sy, w, sh, 0.06 * S); g.fill();
    g.strokeStyle = got ? '#b8862d' : 'rgba(120,90,50,.45)'; g.lineWidth = got ? 0.03 * S : 0.015 * S; rr(g, x, sy, w, sh, 0.06 * S); g.stroke();
    let pic = null; try { pic = animalPicture('skarab9', 120, 80, { dark: !got }); } catch (e) { /* ignore */ }
    if (pic) g.drawImage(pic, x + 0.02 * S, sy + 0.02 * S, w - 0.04 * S, (w - 0.04 * S) * 80 / 120);
    g.fillStyle = got ? '#3a2615' : '#8a6b3f'; g.font = `bold ${0.14 * S}px ${SERIF}`; g.textAlign = 'center';
    g.fillText(got ? String(i + 1) : '?', x + w / 2, sy + sh - 0.1 * S);
  });
}

// ------------------------------------------------------------------ Schild „Zeitspanne“ (Karte zeitluecke)
function zeitPart() {
  const board = [[-1.05, 0.62], [1.05, 0.62], [1.05, 2.0], [-1.05, 2.0]];
  const post = [[-0.08, 0], [0.08, 0], [0.08, 0.7], [-0.08, 0.7]];
  return {
    layers: [{
      shapes: [board, post], fill: '#f1e4c4', stroke: 'rgba(60,30,10,.5)',
      deco(c) {
        const { ctx, tf, S } = c; const t = (x, y) => tf(x, y);
        ctx.fillStyle = '#7a4a2a'; { const [a, b] = t(-0.08, 0.02); ctx.fillRect(a, b - 0.7 * S, 0.16 * S, 0.7 * S); }
        const [bx, by] = t(-1.0, 1.95); ctx.fillStyle = '#fbf3dc'; ctx.fillRect(bx, by, 2.0 * S, 1.28 * S);
        ctx.strokeStyle = 'rgba(139,30,30,.45)'; ctx.lineWidth = 0.02 * S; ctx.strokeRect(bx, by, 2.0 * S, 1.28 * S);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let [X, Y] = t(0, 1.8); ctx.fillStyle = RED; ctx.font = `bold ${0.17 * S}px ${SERIF}`; ctx.fillText('Wie lange ist das her?', X, Y);
        const bar = (y, w0, col, label, big) => {
          const [x0, y0] = t(-0.88, y);
          ctx.fillStyle = '#5a3d22'; ctx.textAlign = 'left'; ctx.font = `${0.105 * S}px ${SERIF}`; ctx.fillText(label, x0, y0 - 0.2 * S);
          ctx.fillStyle = col; ctx.fillRect(x0, y0 - 0.1 * S, w0 * S, 0.22 * S);
          ctx.fillStyle = '#fff'; ctx.font = `bold ${0.135 * S}px ${SERIF}`; ctx.textBaseline = 'middle'; ctx.fillText(big, x0 + 0.07 * S, y0 + 0.01 * S);
        };
        bar(1.42, 1.76, '#b8862d', 'Cheops bis Kleopatra', 'ca. 2500 Jahre');
        bar(0.92, 1.45, '#2a9d8f', 'Kleopatra bis heute', 'gut 2050 Jahre');
        ctx.fillStyle = '#3f8f5a';
      },
    }],
  };
}

// ------------------------------------------------------------------ Parade
// Kleine Papierschnitt-Kopien, die mit dem FINALE-Hebel von links nach rechts durch das Buch ziehen.
const PARADE = [
  { id: 'sonnenbarke', len: 3.3, kind: 'barke' },
  { id: 'nilpferd', len: 2.5 },
  { id: 'pharao', h: 2.0 },
  { id: 'sphinx', len: 3.1 },
  { id: 'ibis', h: 1.3, nod: true },
  { id: 'schreiber', h: 1.5, variant: { pose: 'stand' } },
  { id: 'katze_walk', len: 1.2 },
  { id: 'tutmaske', h: 1.3, float: true },
  { id: 'carter', h: 2.0 },
  { id: 'wesir', h: 2.0 },
];
const LANE_Z = 0.0;
const DAY = mood({ key: '#fff0d6', keyI: 2.35, sky: '#eaf3f6', gnd: '#8a6f50', hemiI: 1.8 });
const DUSK = mood({ key: '#ffd2a0', keyI: 1.75, sky: '#a9b8dc', gnd: '#6a5040', hemiI: 1.35 });

export default {
  id: 'finale',
  mood: DAY,
  motes: { colors: [[1, 0.93, 0.72], [0.82, 0.92, 1]], size: 0.06, alpha: 0.4, dy: 0.05, dx: 0.07, tw: 1.1, density: 0.6 },
  atmo: 'finale',
  base() {
    const d = PAGES_DE[IDX];
    return {
      L: {
        ground: { back: '#6fb2d0', front: '#ece5d3' }, margin: 0.3, pageNo: 2 * IDX + 1, seed: 81,
        draw(ctx, m) {
          const S = m.S, W = ctx.canvas.width, zq = -0.95;
          // Meer hinter der Kaimauer, Marmorpflaster davor
          const sg = ctx.createLinearGradient(0, m.z(-4.4), 0, m.z(zq)); sg.addColorStop(0, '#4f9cc4'); sg.addColorStop(1, '#8fd0e2');
          ctx.fillStyle = sg; ctx.fillRect(0, 0, W, m.z(zq));
          const r = mulberry32(11);
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.03 * S; ctx.lineCap = 'round';
          for (let i = 0; i < 70; i++) { const x = -11.8 + r() * 11.8, z = -4.2 + r() * 3.2, l = 0.25 + r() * 0.5; ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z)); ctx.quadraticCurveTo(m.x(x + l * 0.5), m.z(z - 0.1), m.x(x + l), m.z(z)); ctx.stroke(); }
          ctx.fillStyle = '#ebe4d2'; ctx.fillRect(0, m.z(zq), W, ctx.canvas.height);
          ctx.fillStyle = '#d8cfba'; ctx.fillRect(0, m.z(zq), W, 0.34 * S);
          ctx.fillStyle = 'rgba(70,50,30,.35)'; ctx.fillRect(0, m.z(zq) + 0.34 * S, W, 0.03 * S);
          ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 0.05 * S; ctx.beginPath(); ctx.moveTo(0, m.z(zq) - 0.03 * S); ctx.lineTo(W, m.z(zq) - 0.03 * S); ctx.stroke();
          // Pflasterfugen
          ctx.strokeStyle = 'rgba(120,105,80,.28)'; ctx.lineWidth = 0.014 * S;
          for (let z = zq + 0.34 + 0.7; z < 4.4; z += 0.7) { ctx.beginPath(); ctx.moveTo(0, m.z(z)); ctx.lineTo(W, m.z(z)); ctx.stroke(); }
          for (let row = 0; row < 7; row++) { const z0 = zq + 0.34 + row * 0.7, off = row % 2 ? 0.45 : 0; for (let x = -12.2 + off; x < 0.2; x += 0.9) { ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z0)); ctx.lineTo(m.x(x), m.z(z0 + 0.7)); ctx.stroke(); } }
          // Marmoradern
          ctx.strokeStyle = 'rgba(150,140,125,.22)'; ctx.lineWidth = 0.02 * S;
          for (let i = 0; i < 22; i++) { const x = -11.5 + r() * 11, z = zq + 0.6 + r() * 4; ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z)); ctx.bezierCurveTo(m.x(x + 0.4), m.z(z + 0.1), m.x(x + 0.6), m.z(z - 0.2), m.x(x + 1.2), m.z(z + 0.05)); ctx.stroke(); }
          textCard(m, { x: -11.45, z: 0.42, w: 5.95, h: 3.5, kicker: d.kicker, title: d.title, body: d.card, sub: d.years, size: 0.255, titleSize: 0.37, tilt: -0.012 });
        },
      },
      R: {
        ground: { back: '#c99f68', front: '#b48a56' }, margin: 0.3, pageNo: 2 * IDX + 2, seed: 82,
        draw(ctx, m) {
          const S = m.S, W = ctx.canvas.width, r = mulberry32(21);
          // Dielenboden (Längsplanken)
          for (let z = -4.4, i = 0; z < 4.6; z += 0.46, i++) {
            ctx.fillStyle = i % 2 ? 'rgba(90,50,20,.06)' : 'rgba(255,230,180,.07)'; ctx.fillRect(0, m.z(z), W, 0.46 * S);
            ctx.strokeStyle = 'rgba(60,30,10,.32)'; ctx.lineWidth = 0.014 * S; ctx.beginPath(); ctx.moveTo(0, m.z(z)); ctx.lineTo(W, m.z(z)); ctx.stroke();
            for (let x = r() * 3; x < 12; x += 2 + r() * 3) { ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z)); ctx.lineTo(m.x(x), m.z(z + 0.46)); ctx.stroke(); }
          }
          ctx.strokeStyle = 'rgba(70,35,10,.18)'; ctx.lineWidth = 0.012 * S;
          for (let i = 0; i < 60; i++) { const x = 0.5 + r() * 11, z = -4 + r() * 8; ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z)); ctx.lineTo(m.x(x + 0.4 + r() * 0.8), m.z(z + (r() - 0.5) * 0.06)); ctx.stroke(); }
          // Teppich vor dem Tisch
          ctx.save(); ctx.fillStyle = 'rgba(150,40,35,.55)'; ctx.fillRect(m.x(5.9), m.z(-1.9), 5.5 * S, 2.7 * S);
          ctx.strokeStyle = 'rgba(240,210,120,.7)'; ctx.lineWidth = 0.04 * S; ctx.strokeRect(m.x(6.0), m.z(-1.8), 5.3 * S, 2.5 * S);
          ctx.strokeStyle = 'rgba(240,210,120,.4)'; ctx.lineWidth = 0.02 * S; ctx.strokeRect(m.x(6.15), m.z(-1.65), 5.0 * S, 2.2 * S); ctx.restore();
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app, L = ctx.L, R = ctx.R;
    const S = { P: 0, lineK: 0, sprV: 0, lampV: 0, parade: [], kl: { sig: '' }, ns: { sig: '' }, ov: { sig: '' }, endShown: false, ended: false };
    ctx.spread.p8 = S;
    const tapProp = (pop, id, fn) => { if (!pop || !pop.fig) return; pop.pickMeshes = pop.fig.hit.slice(); for (const m of pop.fig.hit) m.userData.tap = fn || (() => app.openCardById(id)); };
    const calmK = () => (app.calm ? 0.3 : 1);

    // ------------------------------------------------------------ Kulissen
    for (const sd of ['L', 'R']) {
      const x0 = sd === 'L' ? -11.75 : 0.2, x1 = sd === 'L' ? -0.2 : 11.75;
      const fill = sd === 'L' ? { top: '#66b2dc', bottom: '#f4efe0' } : { top: '#e6d6ae', bottom: '#efe0b8' };
      ctx.flat(panelPart(x0, x1, 5.0, { fill, wave: sd === 'L' ? 0.25 : 0.1, freq: 3, phase: sd === 'L' ? 0.4 : 2.0, seed: sd === 'L' ? 2 : 5, deco: (c, bb) => { if (sd === 'L') { softLight(c, bb, { color: 'rgba(255,240,190,.55)', cx: 0.4, cy: 0.55, r: 0.7 }); dither(c, bb, '#fff', { n: 80, alpha: 0.12, size: 0.04 }); } } }), { z: -4.05, lean: -0.05, name: 'sky' + sd, delay: 0, ppu: 60, border: 0.04 });
    }
    yield;
    const cl1 = ctx.prop('cloud_a', { x: -7.8, y: 3.7, z: -3.9, len: 2.8, delay: 0.1, cast: false });
    const cl2 = ctx.prop('cloud_b', { x: -1.8, y: 4.0, z: -3.9, len: 2.2, delay: 0.12, cast: false });
    ctx.onUpdate((dt, t) => { const k = calmK(); cl1.group.position.x = -7.8 + Math.sin(t * 0.05) * 1.2 * k; cl2.group.position.x = -1.8 + Math.sin(t * 0.04 + 1) * 1.0 * k; });
    // Dämmerung über dem Himmel (LEUCHTTURM)
    const tintC = cv(8, 128), tg = tintC.getContext('2d'); { const gr = tg.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(14,26,70,1)'); gr.addColorStop(1, 'rgba(60,40,90,.35)'); tg.fillStyle = gr; tg.fillRect(0, 0, 8, 128); }
    const dusk = popupPlane(L, { x: -6, z: -3.97, w: 11.5, h: 5.0, cy: 2.5, map: tex(tintC, 1), opacity: 0 });
    dusk.lean = -0.05; dusk.mesh.renderOrder = 1;
    yield;
    const hafen = ctx.prop('hafen_kulisse', { x: -6.0, z: -3.5, len: 11.0, delay: 0.1 });
    tapProp(hafen, 'alexandria');
    const bib = ctx.prop('bibliothek_alexandria', { x: -8.7, z: -2.6, h: 4.2, delay: 0.18 });
    tapProp(bib, 'bibliothek');
    const turm = ctx.prop('leuchtturm_pharos', { x: -2.0, z: -2.35, h: 5.35, delay: 0.24 });
    tapProp(turm, 'leuchtturm');
    yield;
    // Feuer, Glut und Lichtkegel des Leuchtturms
    const fa = turm.fig.anchors.feuer, fx0 = fa.x + turm.fig.group.position.x, fy0 = fa.y;
    const fireGlow = sunGlow({ size: 3.4, color: 0xffa640, rays: false, opacity: 1 });
    fireGlow.position.set(fx0, fy0 + 0.05, 0.12); fireGlow.scale.setScalar(0.1); turm.add(fireGlow);
    const beamC = cv(512, 128), bg = beamC.getContext('2d');
    { const g1 = bg.createLinearGradient(512, 0, 0, 0); g1.addColorStop(0, 'rgba(255,236,160,.85)'); g1.addColorStop(0.5, 'rgba(255,236,170,.3)'); g1.addColorStop(1, 'rgba(255,236,170,0)');
      bg.fillStyle = g1; bg.beginPath(); bg.moveTo(512, 64); bg.lineTo(0, 4); bg.lineTo(0, 124); bg.closePath(); bg.fill();
      bg.globalCompositeOperation = 'destination-in'; const g2 = bg.createLinearGradient(0, 0, 0, 128); g2.addColorStop(0, 'rgba(0,0,0,.2)'); g2.addColorStop(0.5, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,.2)'); bg.fillStyle = g2; bg.fillRect(0, 0, 512, 128); }
    const BEAM_L = 10.0;
    const beam = popupPlane(L, { x: -2.0 + fx0, y: fy0, z: -2.05, w: BEAM_L, h: 3.2, cx: -BEAM_L / 2, map: tex(beamC, 2), opacity: 0, additive: true, color: 0xffe9a8 });
    yield;
    const ship = ctx.stand('segelschiff_griechisch', { x: -6.3, z: -1.55, len: 3.5, facing: 1, delay: 0.3, card: 'segelschiff', hint: false, hitPad: 0.2 });
    ship.onWake = (a) => { a.tw.add(1.4, (k) => { a.hop = Math.sin(k * Math.PI) * 0.1; poseAmt(a.fig, 'sail', Math.sin(k * Math.PI * 2) * 0.5 + 0.5); }, { done: () => { a.hop = 0; } }); app.audio.sfx('sail'); };
    ship.behaviors.push((dt, t) => { const k = calmK(); if (ship.tw.list.length === 0) { poseAmt(ship.fig, 'sail', 0.5 + 0.5 * Math.sin(t * 0.9)); poseAmt(ship.fig, 'ruder', 0.5 + 0.5 * Math.sin(t * 0.7)); } ship.hop = ship.hop || 0; ship.fig.root.rotation.z = Math.sin(t * 0.8) * 0.012 * k; });
    const waves = [-9.6, -5.9, -2.2].map((x, i) => ctx.prop('wave_strip', { x, z: -0.95, len: 3.9, delay: 0.32 + i * 0.02, cast: false, facing: i % 2 ? -1 : 1 }));
    ctx.onUpdate((dt, t) => { const k = calmK(); waves.forEach((w, i) => { w.group.position.x = [-9.6, -5.9, -2.2][i] + Math.sin(t * 0.6 + i * 1.7) * 0.22 * k; }); });
    yield;
    const kleo = ctx.stand('kleopatra', { x: -3.5, z: 0.8, h: 2.7, facing: 1, delay: 0.4, card: 'kleopatra' });
    kleo.behaviors.push((dt, t) => { if (kleo.tw.list.length === 0) poseAmt(kleo.fig, 'armA', 0.35 + 0.25 * Math.sin(t * 0.8)); });
    kleo.onWake = (a) => { a.tw.add(1.2, (k) => { poseAmt(a.fig, 'armA', Math.sin(k * Math.PI)); a.hop = Math.sin(k * Math.PI) * 0.08; }, { done: () => { a.hop = 0; } }); app.audio.sfx('harp'); };
    // Schild „Zeitspanne“
    const zl = ctx.flat(zeitPart(), { x: -1.4, z: 1.1, ws: 1.3, name: 'zeit', delay: 0.5, ppu: 130, thickness: 0.04, border: 0.04, lean: -0.04 });
    zl.pickMeshes = [zl.cut.mesh]; zl.cut.mesh.userData.tap = () => app.openCardById('zeitluecke');
    yield;
    // ------------------------------------------------------------ rechts: Gelehrtenzimmer
    const room = ctx.prop('gelehrtenzimmer', { x: 6.0, z: -2.2, len: 11.0, delay: 0.1 });
    const stone = ctx.prop('rosetta_stein', { x: 9.6, y: 1.55, z: -1.78, h: 2.45, delay: 0.3 });
    const sf = stone.fig, sbb = sf.bbox, sws = sf.ws;
    // Band-Einblendung: Streifen klappen von der Mitte auf (Skalierung um die Bandmitte)
    const BANDS = [{ part: 'band_hiero', cy: 0.9 }, { part: 'band_demot', cy: 0.56 }, { part: 'band_greek', cy: 0.25 }];
    const setBands = (v) => {
      BANDS.forEach((b, i) => {
        const k = smooth(clamp(v * 3 - i)), g = sf.parts[b.part]; if (!g) return;
        g.visible = k > 0.005; const s = 0.15 + 0.85 * k, rest = g.userData.rest;
        g.scale.set(s, s, 1); g.position.set(rest.px + (0 - rest.px) * (1 - s), rest.py + (b.cy * sws - rest.py) * (1 - s), g.position.z);
        b.k = k;
      });
      S.ovDirty = true;
    };
    const DX = -0.38; // Steinmitte: die Spec zentriert den Stein in x (Anker stehen in den Original-Koordinaten)
    // Overlay auf dem Stein: Markierungen + Namenslinie (Meter im Steinraum)
    const OW = 320, OH = Math.round(OW * sbb.h / sbb.w);
    const ovC = cv(OW, OH), ovT = tex(ovC, 4);
    const ovMesh = new THREE.Mesh(new THREE.PlaneGeometry(sbb.w * sws, sbb.h * sws), new THREE.MeshBasicMaterial({ map: ovT, transparent: true, depthWrite: false }));
    ovMesh.position.set((sbb.x0 + sbb.x1) / 2 * sws, (sbb.y0 + sbb.y1) / 2 * sws, 0.12); ovMesh.renderOrder = 4;
    sf.root.add(ovMesh);
    const ovPx = (x, y) => [(x + DX - sbb.x0) / sbb.w * OW, (sbb.y1 - y) / sbb.h * OH];
    const GHOST = [{ x0: 0.08, x1: 0.69, y0: 0.74, y1: 1.0, col: '#e0b040', name: 'Hieroglyphen' }, { x0: 0.07, x1: 0.69, y0: 0.47, y1: 0.66, col: '#3bb3a8', name: 'Demotisch' }, { x0: 0.07, x1: 0.69, y0: 0.09, y1: 0.41, col: '#7ea8ff', name: 'Griechisch' }];
    const BOX = [{ x: 0.335, y: 0.865, w: 0.58, h: 0.14, col: '#e0b040' }, { x: 0.39, y: 0.545, w: 0.5, h: 0.04, col: '#3bb3a8' }, { x: 0.22, y: 0.285, w: 0.34, h: 0.04, col: '#4f86d6' }];
    const drawOverlay = () => {
      const g = ovC.getContext('2d'); g.clearRect(0, 0, OW, OH);
      const sc = OW / sbb.w;
      // Geisterrahmen: hier erscheinen gleich die drei Schriften
      GHOST.forEach((b, i) => {
        const a = 1 - (BANDS[i].k || 0); if (a < 0.02) return;
        const [bx, by] = ovPx(b.x0, b.y1); g.save(); g.globalAlpha = 0.75 * a; g.strokeStyle = b.col; g.lineWidth = 0.008 * sc; g.setLineDash([0.025 * sc, 0.018 * sc]);
        rr(g, bx, by, (b.x1 - b.x0) * sc, (b.y1 - b.y0) * sc, 0.02 * sc); g.stroke(); g.setLineDash([]);
        g.fillStyle = b.col; g.font = `bold ${0.052 * sc}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(b.name, ovPx((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2)[0], ovPx(0, (b.y0 + b.y1) / 2)[1]); g.restore();
      });
      const k = S.lineK; if (k < 0.01) { ovT.needsUpdate = true; return; }
      g.lineCap = 'round'; g.lineJoin = 'round';
      const x0 = 0.335;
      // Linie von der Kartusche nach unten durch Demotisch bis Griechisch
      const yTop = 0.795, yBot = 0.285, yEnd = lerp(yTop, yBot, clamp(k * 1.15));
      const [lx, ly0] = ovPx(x0, yTop), [, ly1] = ovPx(x0, yEnd);
      const lg = g.createLinearGradient(0, ly0, 0, ovPx(x0, yBot)[1]); lg.addColorStop(0, '#ffd45a'); lg.addColorStop(0.5, '#4fd6c9'); lg.addColorStop(1, '#7ea8ff');
      g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 0.034 * sc; g.beginPath(); g.moveTo(lx, ly0); g.lineTo(lx, ly1); g.stroke();
      g.strokeStyle = lg; g.lineWidth = 0.014 * sc; g.setLineDash([0.03 * sc, 0.022 * sc]); g.beginPath(); g.moveTo(lx, ly0); g.lineTo(lx, ly1); g.stroke(); g.setLineDash([]);
      BOX.forEach((b, i) => {
        const on = smooth(clamp(k * 3 - i * 0.9 + (i === 0 ? 1 : 0))); if (on < 0.02) return;
        const [bx, by] = ovPx(b.x, b.y); const w = b.w * sc, h = b.h * sc;
        g.globalAlpha = on; g.lineWidth = 0.011 * sc; g.strokeStyle = b.col; g.fillStyle = b.col + '33'; rr(g, bx - w / 2, by - h / 2, w, h, h * 0.25); g.fill(); g.stroke(); g.globalAlpha = 1;
      });
      ovT.needsUpdate = true;
    };
    // Tipp-Fläche über der Kartusche -> Karte ptolemaios
    const cartHit = new THREE.Mesh(new THREE.PlaneGeometry(0.62 * sws, 0.17 * sws), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
    cartHit.position.set((0.335 + DX) * sws, 0.865 * sws, 0.16); sf.root.add(cartHit);
    cartHit.userData.tap = () => { if (S.sprV > 0.1) app.openCardById('ptolemaios'); else app.openCardById('rosetta'); };
    stone.pickMeshes = [cartHit, ...sf.hit]; for (const m of sf.hit) m.userData.tap = () => app.openCardById('rosetta');
    setBands(0);

    // Schreibzeug auf dem Tisch
    const pal = ctx.prop('schreibpalette', { x: 10.85, y: 1.55, z: -1.5, len: 0.7, delay: 0.34 });
    
    yield;
    // Gelehrter am Tisch
    const sch = ctx.stand('gelehrter_sitzend', { x: 8.2, z: -1.0, h: 2.5, facing: 1, delay: 0.4, card: 'champollion', hint: false });
    sch.behaviors.push((dt, t) => { if (sch.tw.list.length === 0) poseAmt(sch.fig, 'armA', 0.5 + 0.3 * Math.sin(t * 0.7)); });
    sch.onWake = (a) => { a.tw.add(1.4, (k) => { poseAmt(a.fig, 'armA', Math.sin(k * Math.PI)); a.hop = Math.sin(k * Math.PI) * 0.05; }, { done: () => { a.hop = 0; } }); app.audio.sfx('papyrus'); };
    // verstecktes Käferchen am Rand des Rosetta-Steins
    const kx = 9.6 + sf.width * 0.5 - 0.12;
    const kaefer = ctx.stand('skarab9', { x: kx, y: 1.55, z: -1.9, len: 0.8, facing: 1, delay: 0.5, hidden: true, hint: false, hitPad: 0.25 });
    kaefer.onWake = (a) => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.3; }, { done: () => { a.hop = 0; } }); app.audio.voice('skarabaeus'); };
    yield;

    // ------------------------------------------------------------ Namensschild und Käferleiste (auf der Seite)
    const nsC = cv(NS_W * NS_PX, NS_H * NS_PX);
    const nsMesh = pageSheet(R, NS_W, NS_H, nsC, 3.5, 2.2, { rot: 0.012 });
    const nsHit = nsMesh; R.addTap(nsHit, () => { if (S.sprV > 0.5) app.openCardById('ptolemaios'); else app.ui.showToast('Schiebe 3 SPRACHEN, dann siehst du den Namen in allen drei Schriften.'); });
    const klC = cv(KL_W * KL_PX, KL_H * KL_PX);
    const klMesh = pageSheet(L, KL_W, KL_H, klC, -2.9, 2.5, { rot: -0.01 });
    L.addTap(klMesh, () => { app.openCardById('album'); app.audio.sfx('tapp'); });
    const refreshStrip = () => {
      const sig = HID.map((k) => (app.found.has(k) ? 1 : 0)).join('');
      if (sig === S.kl.sig) return; S.kl.sig = sig; drawBeetleStrip(klC, app.found); klMesh.material.map.needsUpdate = true;
    };
    const refreshName = () => {
      const k = { h: BANDS[0].k || 0, d: BANDS[1].k || 0, g: BANDS[2].k || 0 };
      const sig = [k.h > 0.5, k.d > 0.5, k.g > 0.5].join();
      if (sig === S.ns.sig) return; S.ns.sig = sig; drawNameSheet(nsC, k); nsMesh.material.map.needsUpdate = true;
    };
    refreshName(); refreshStrip();
    // Käfer-Leuchten beim Finale
    const klGlow = new THREE.Mesh(new THREE.PlaneGeometry(KL_W + 1.4, KL_H + 1.1), new THREE.MeshBasicMaterial({ map: softTexture(), color: 0xffd66a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    klGlow.rotation.x = -Math.PI / 2; klGlow.position.set(-2.9, 0.02, 2.5); klGlow.renderOrder = 3; L.add(klGlow);

    // ------------------------------------------------------------ Parade-Figuren
    let off = 0;
    PARADE.forEach((it, i) => {
      const pop = ctx.prop(it.id, { x: -16, z: LANE_Z + (it.kind === 'barke' ? 0.15 : (i % 2 ? 0.2 : -0.1)), len: it.len, h: it.h, delay: 0.5, variant: it.variant, cast: true });
      const bw = pop.fig.width;
      const hw = bw / 2 + 0.05;
      const item = { pop, it, hw, off: off + hw, z: pop.group.position.z, side: 'L', phase: i * 1.3 };
      off += 2 * hw + (it.kind === 'barke' ? 1.2 : 0.7);
      S.parade.push(item);
    });
    S.travel = 24.5 + off + 1;
    // Wellenband unter der Sonnenbarke
    const bar = S.parade[0];
    const wave = ctx.prop('wave_strip', { x: -16, z: LANE_Z + 0.5, len: bar.hw * 2 + 0.9, delay: 0.5, cast: false });
    wave.ySc = 0.4;
    S.parade.unshift({ pop: wave, it: { id: 'wave_strip', wave: true }, hw: bar.hw + 0.3, off: bar.off, z: LANE_Z + 0.5, side: 'L', phase: 0 });
    const disc = sunGlow({ size: 3.2, color: 0xffd27a, rays: false, opacity: 0.8 });
    { const an = bar.pop.fig.anchors.scheibe; disc.position.set(an.x + bar.pop.fig.group.position.x, an.y, 0.1); bar.pop.add(disc); }
    bar.disc = disc;
    const toSide = (item, side) => {
      if (item.side === side) return; const from = item.side === 'L' ? L : R, to = side === 'L' ? L : R;
      const i = from.popups.indexOf(item.pop); if (i >= 0) from.popups.splice(i, 1);
      to.popups.push(item.pop); to.group.add(item.pop.group); item.side = side;
    };
    S.toSide = toSide;
    // Pop-up-Gelenk erneut setzen, damit sich die Figuren bei Seitenwechsel richtig aufstellen
    const paradeStep = (dt, t) => {
      const P = S.P, k = calmK();
      for (const it of S.parade) {
        const x = -13.2 - it.off + P * S.travel;
        const hw = it.hw, pop = it.pop;
        const side = x < 0 ? 'L' : 'R';
        const e = side === 'L' ? Math.min(x - hw + 11.75, -0.55 - (x + hw)) : Math.min(11.75 - (x + hw), x - hw - 0.55);
        if (e <= 0 || P <= 0.0005 || P >= 0.9995) { pop.group.visible = false; pop.group.scale.setScalar(0.0001); if (P <= 0.0005) toSide(it, 'L'); continue; }
        toSide(it, side);
        pop.group.position.x = x;
        const rise = smooth(clamp(e / 1.3));
        pop.lean = (1 - rise) * FOLD * 0.97;
        const sc = smooth(clamp(e / 0.5)) * (0.45 + 0.55 * rise);
        const sq = Math.max(0.0001, sc); pop.group.scale.set(sq, sq * (pop.ySc || 1), sq); pop.group.visible = true;
        const fig = pop.fig, ph = x * 2.6 + it.phase;
        if (it.it.wave) { pop.group.position.y = 0; continue; }
        const sw = fig.meta.swing || {};
        let bob = Math.abs(Math.sin(ph)) * 0.07;
        if (it.it.kind === 'barke') {
          bob = Math.sin(t * 1.6) * 0.05 * k; poseAmt(fig, 'ruder', 0.5 + 0.5 * Math.sin(t * 1.3)); fig.rotatePart('sonne', t * 0.5);
          if (it.disc) { it.disc.userData.update(t); it.disc.visible = true; }
        } else {
          for (const [p, o] of [['legA', 0], ['legB', Math.PI]]) { const r = sw[p]; if (r) fig.rotatePart(p, lerp(r[0], r[1], 0.5 + 0.5 * Math.sin(ph + o))); }
          for (const [p, o] of [['armA', Math.PI], ['armB', 0]]) { const r = sw[p]; if (r && fig.parts[p]) fig.rotatePart(p, lerp(r[0], r[1], 0.5 + 0.5 * Math.sin(ph + o)) * 0.6); }
          if (it.it.nod) poseAmt(fig, 'neck', 0.5 + 0.5 * Math.sin(ph * 0.9));
          if (it.it.float) bob = 0.12 + Math.sin(t * 2 + it.phase) * 0.06 * k;
          if (sw.legA == null && !it.it.float && !it.it.nod) bob *= 0.6; // Figuren ohne Beine: nur sanftes Wippen
          // wippende Teile (Tutmaske, Sphinx) ohne Gelenke
        }
        fig.root.position.y = bob;
      }
      // Rückmeldung: Ton und Käfer-Leuchten
      app.audio.ctl && app.audio.ctl('parade', clamp(P));
      const live = P > 0.01 && P < 0.995;
      const gk = live ? 0.75 + 0.25 * Math.sin(t * 3.0) * k : (S.ended ? 0.7 : 0);
      klGlow.material.opacity = lerp(klGlow.material.opacity, gk, 1 - Math.exp(-dt * 6));
      klGlow.visible = klGlow.material.opacity > 0.01;
      const pk = live || S.ended ? 1 + (0.025 + 0.012 * Math.sin(t * 5)) * k : 1; klMesh.scale.set(pk, pk, pk);
    };

    // ------------------------------------------------------------ Laschen
    const lampCtl = ctx.control('L', { id: 'turm', label: 'LEUCHTTURM', a: [-4.7, 3.85], b: [-1.3, 3.85], size: [2.3, 0.95], color: '#b8601f', value: 0, springBack: false, hold: true });
    lampCtl.on((v) => { S.lampV = v; });
    lampCtl.onGrab = () => app.audio.sfx('grab'); lampCtl.onTick = (v) => app.audio.sfx('fire', { v }); lampCtl.onRelease = () => app.audio.sfx('snap');
    const sprCtl = ctx.control('R', { id: 'sprachen', label: '3 SPRACHEN', a: [1.2, 3.85], b: [4.5, 3.85], size: [2.3, 0.95], color: '#2a5aa0', value: 0, springBack: false, hold: true, snaps: [0, 1 / 3, 2 / 3, 1], ticks: 3 });
    sprCtl.on((v) => { S.sprV = v; setBands(v); refreshName(); });
    sprCtl.onGrab = () => app.audio.sfx('grab'); sprCtl.onTick = (v) => app.audio.sfx('papyrus', { v }); sprCtl.onSnap = () => app.audio.sfx('snap'); sprCtl.onRelease = () => app.audio.sfx('snap');
    const finCtl = ctx.control('R', { id: 'finale', label: 'FINALE', a: [7.3, 3.85], b: [10.4, 3.85], size: [2.1, 0.95], color: '#c8452c', value: 0, springBack: false, hold: true });
    finCtl.on((v) => { S.target = v; });
    finCtl.onGrab = () => app.audio.sfx('grab'); finCtl.onTick = (v) => app.audio.sfx('oar', { v }); finCtl.onRelease = () => app.audio.sfx('snap');
    S.ctls = { lamp: lampCtl, spr: sprCtl, fin: finCtl }; S.target = 0;

    // ------------------------------------------------------------ pro Frame
    let fireT = 0;
    ctx.onUpdate((dt, t) => {
      const k = calmK(), v = smooth(S.lampV);
      // Flackern höchstens ~3 Hz, im Ruhigen Modus gleichmäßig
      const fl = app.calm ? 1 : 1 + 0.1 * Math.sin(t * TAU * 1.7) + 0.06 * Math.sin(t * TAU * 2.6 + 1.3);
      fireGlow.scale.setScalar(Math.max(0.0001, (0.1 + 0.9 * v) * fl)); fireGlow.userData.update(t, 0.6 + 0.6 * v); fireGlow.visible = v > 0.003 || true;
      beam.mesh.material.opacity = 1.0 * v * (app.calm ? 1 : 0.94 + 0.06 * Math.sin(t * TAU * 1.1));
      beam.holder.rotation.z = 0.2 + (app.calm ? 0 : Math.sin(t * 0.35) * 0.035 * v);
      beam.group.visible = beam.group.visible && v > 0.01;
      dusk.mesh.material.opacity = 0.8 * v; dusk.group.visible = dusk.group.visible && v > 0.01;
      if (v > 0.3 && !app.calm && ctx.spread.active) { fireT += dt; if (fireT > 0.25) { fireT = 0; const w = ctx.world(-2.0 + fx0 + (Math.random() - 0.5) * 0.3, fy0 + 0.15, -2.2); app.fx.glow.emit({ x: w.x, y: w.y, z: w.z, vx: (Math.random() - 0.5) * 0.3, vy: 0.5 + Math.random() * 0.4, vz: 0, life: 1.1, size: 0.16, alpha: 0.7 * v, color: [1, 0.65, 0.25], drag: 0.8 }); } }
      { const want = S.lampV > 0.5; if (want !== S.duskOn && ctx.spread.active) { S.duskOn = want; app.stage.setMood(want ? DUSK : DAY); } }
      // Namenslinie läuft nach, wenn alle drei Bänder da sind
      const tl = S.sprV > 0.97 ? 1 : 0; const nk = S.lineK + clamp(tl - S.lineK, -dt * 1.1, dt * 1.1);
      if (Math.abs(nk - S.lineK) > 1e-4 || S.ovDirty) { S.lineK = nk; S.ovDirty = false; drawOverlay(); }
      // Parade folgt dem Hebel mit begrenzter Geschwindigkeit
      const tg2 = S.target || 0; const pr = 0.085; S.P += clamp(tg2 - S.P, -dt * pr * 2.2, dt * pr);
      if (S.P > 0.995 && !S.ended) { S.ended = true; endShow(); } if (S.P < 0.6) { S.ended = false; S.endShown = false; }
      paradeStep(dt, t);
      refreshStrip();
    });
    const endShow = () => {
      app.audio.sfx('gold'); app.audio.sfx('chime');
      const n = HID.filter((id) => app.found.has(id)).length;
      if (!S.endShown) { S.endShown = true; app.ui.showToast(n === HID.length ? 'Alle 9 Sonnenkäfer gefunden! Tippe auf die Käferleiste für dein Album.' : `${n} von ${HID.length} Sonnenkäfern gefunden. Such weiter, sie verstecken sich auf jeder Seite!`, 4200); }
      if (!app.calm) for (let i = 0; i < 40; i++) { const w = ctx.world(-2.9 + (Math.random() - 0.5) * 4.4, 0.4, 2.4); app.fx.glow.emit({ x: w.x, y: w.y, z: w.z, vx: (Math.random() - 0.5) * 1.2, vy: 0.8 + Math.random() * 1.2, vz: (Math.random() - 0.5) * 0.6, life: 1.6, size: 0.14, alpha: 0.9, color: [1, 0.85, 0.35], drag: 0.9, grav: -0.4 }); }
    };
    // Tipp auf Kartusche/Stein und Zeitschild stehen oben; Sonnenbarke der Parade -> Karte
    const barkeTap = bar.pop; tapProp(barkeTap, 'sonnenbarke');
    S.barkePop = barkeTap;
    this._S = S;
  },
  onActivate(ctx) {
    const S = ctx.spread.p8; if (!S) return;
    S.kl.sig = ''; S.ns.sig = '';
  },
  onDeactivate(ctx) {
    const S = ctx.spread.p8; if (!S) return;
    for (const c of Object.values(S.ctls || {})) c.setValue(0, { snap: true });
    S.P = 0; S.target = 0; S.ended = false; S.endShown = false; S.lineK = 0;
    ctx.app.audio.ctl && ctx.app.audio.ctl('parade', 0);
    if (S.duskOn) { S.duskOn = false; ctx.app.stage.setMood(DAY); }
  },
};
