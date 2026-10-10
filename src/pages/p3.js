// Station 3: Die Pyramiden von Gizeh (ca. 2600 bis 2500 v. Chr.)
// Links hinten die Baustelle (Pyramide im Bau mit Rampe, Steinbruch, Siedlung), rechts die fertigen Pyramiden und die Sphinx.
// Laschen: BAUEN! (Schichten wachsen, Rampe und Arbeiter folgen, rückwärts spulbar), SCHNITT (Klappe mit Querschnitt, Kammern antippen),
// SCHLITTEN (Ochse zieht den Steinblock, ein Helfer gießt Wasser vor die Kufen).
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { textCard, printLabel, SERIF, RED, INK, roundRect, pebbles, grassTufts, blotches, speckles } from '../engine/pagepaint.js';
import { PAGES_DE } from '../data/pages.de.js';
import { poseAmt, makeFlat } from '../engine/popup.js';
import { ANIMALS } from '../art/registry.js';
import { lerp, clamp, smooth, TAU, Spring } from '../engine/util.js';
import { panelPart, cracks, strata, dither, softLight } from './common.js';
import { sunGlow } from '../engine/effects.js';

const IDX = 3;

// ------------------------------------------------------------------ Maße der Baustelle (linke Seite, Seitenkoordinaten)
const NL = 12;                                   // Schichten von pyramide_bau
const PYX = -3.55, PYZ = -2.4, PYH = 4.3;        // Pyramide im Bau: Mitte, Tiefe, Höhe
const PHALF = (3.95 * PYH) / 5;                  // halbe Basisbreite in Welteinheiten
const faceX = (y) => PYX - PHALF * (1 - y / PYH);   // linke Pyramidenkante in Höhe y
const RAMP_Z = -1.35, RAMP_LEN = 5.0, RAMP_WS = RAMP_LEN / 6;
const RAMP_SLOPE = (1.854 - 0.176) / (2.555 + 2.741);              // Steigung der Rampenoberfläche (Modell)
const rampSurf = (xm) => 0.176 + RAMP_SLOPE * (xm + 2.741);          // Oberfläche in Modellkoordinaten
const RAMP_END = rampSurf(3.0) * RAMP_WS;                           // Höhe der Oberfläche am hohen Ende (Maßstab 1)
const V0 = 0.42;                                 // Startwert des Hebels BAUEN!

// Schlittenbahn (Ochse): Strecke des Schlittens
const LANE_Z = -0.1, LA = -10.0, LB = -5.0;

// Sphinx (rechte Seite)
const SPX = 9.0, SPZ = 0.45, SPLEN = 4.5;

// ------------------------------------------------------------------ kleine Helfer
const fxRate = (app) => (app.stage && app.stage.tier ? app.stage.tier.fx : 1) * (app.calm ? 0.5 : 1);

// Anker einer Figur in Seitenkoordinaten (berücksichtigt Spiegelung, Hüpfen und Neigung der Figur)
const _ap = [0, 0];
function anchorXY(a, name) {
  const f = a.fig, an = f.anchors[name], sx = f.group.scale.x;
  let lx = an.x, ly = an.y; const r = f.root.rotation.z;
  if (r) { const c = Math.cos(r), s = Math.sin(r); const nx = lx * c - ly * s, ny = lx * s + ly * c; lx = nx; ly = ny; }
  _ap[0] = a.popup.group.position.x + f.group.position.x + lx * sx;
  _ap[1] = a.popup.group.position.y + f.root.position.y + ly;
  return _ap;
}

// dünnes Seilstück (Streifen) zwischen zwei Punkten; hängt in einem Pop-up, damit es mitfaltet
function makeRope(parent, color = 0xb79458, w = 0.045) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
  m.castShadow = false; parent.add(m);
  const dk = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x6e4a22, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }));
  dk.position.z = -0.002; m.add(dk); dk.scale.set(1, 0.5, 1); dk.position.y = -0.2;
  return { mesh: m, set(x0, y0, x1, y1, z = 0.12) { const dx = x1 - x0, dy = y1 - y0; const l = Math.hypot(dx, dy) || 0.001; m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); m.rotation.z = Math.atan2(dy, dx); m.scale.set(l, w, 1); } };
}

// Beine eines Menschen / Vierbeiners im Gehzyklus (ph = Phase im Bogenmaß, amp 0..1)
function walkLegs(fig, ph, amp = 1) {
  const sw = fig.meta.swing || {};
  const s = Math.sin(ph) * amp;
  const mid = (r, k) => lerp(r[0], r[1], 0.5 + 0.5 * k);
  if (fig.meta.gait) {
    for (const [i, pair] of fig.meta.gait.entries()) for (const p of pair) { const r = sw[p] || [-0.3, 0.3]; fig.rotatePart(p, mid(r, i ? -s : s)); }
  } else {
    for (const [p, k] of [['legA', s], ['legB', -s]]) { const r = sw[p] || [-0.34, 0.34]; fig.rotatePart(p, mid(r, k)); }
  }
}
function restLegs(fig) {
  for (const p of ['legA', 'legB', 'armA', 'armB']) if (fig.parts[p] && fig.meta.swing && fig.meta.swing[p] && !(p.startsWith('arm') && fig.meta.pose === 'pull')) fig.rotatePart(p, 0);
}

// ------------------------------------------------------------------ Querschnitt-Karte (Klappe): Papierplatte mit gemaltem Querschnitt
const SC = { x0: -4.2, x1: 4.2, y0: -0.18, y1: 4.82 };
const SC_LABELS = [
  // Beschriftung (Text in zwei Zeilen), Tag-Mitte, Ankerpunkt der Kammer
  { t: ['Königs-', 'kammer'], tag: [2.95, 3.12], at: [0.66, 2.42], col: '#c0432e' },
  { t: ['Königinnen-', 'kammer'], tag: [2.95, 1.9], at: [0.62, 1.48], col: '#2a5aa0' },
  { t: ['Große', 'Galerie'], tag: [-3.0, 3.1], at: [-0.5, 1.95], col: '#b07a14' },
  { t: ['Eingang'], tag: [-3.1, 1.95], at: [-2.52, 1.36], col: '#5a4130' },
  { t: ['Kammer', 'im Felsen'], tag: [2.95, 0.42], at: [0.55, 0.38], col: '#6b559a' },
];
// antippbare Kammern (Kreise in Modellkoordinaten)
const SC_HOT = [
  { x: 0.66, y: 2.42, r: 0.7 }, { x: 0.55, y: 1.46, r: 0.62 }, { x: -0.5, y: 1.95, r: 0.7 }, { x: -2.4, y: 1.4, r: 0.55 }, { x: 0.5, y: 0.38, r: 0.65 },
  { x: 0.5, y: 3.15, r: 0.5 }, { x: -0.7, y: 2.9, r: 0.4 }, { x: 1.4, y: 2.65, r: 0.4 },
];
function schnittPart() {
  const src = ANIMALS.pyramide_schnitt().parts.body.layers;
  const r = 0.28;
  const rr = [[SC.x0 + r, SC.y0], [SC.x1 - r, SC.y0], [SC.x1, SC.y0 + r], [SC.x1, SC.y1 - r], [SC.x1 - r, SC.y1], [SC.x0 + r, SC.y1], [SC.x0, SC.y1 - r], [SC.x0, SC.y0 + r]];
  const back = {
    shapes: [rr], fill: { top: '#cfe5ee', bottom: '#f3e4b8' },
    deco(c) {
      const { ctx, tf, S } = c;
      const g = ctx.createRadialGradient(...tf(2.4, 4.2), 0, ...tf(2.4, 4.2), 3.2 * S);
      g.addColorStop(0, 'rgba(255,244,200,.75)'); g.addColorStop(1, 'rgba(255,244,200,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, c.W, c.H);
      ctx.strokeStyle = 'rgba(139,30,30,.38)'; ctx.lineWidth = 0.025 * S; ctx.setLineDash([0.12 * S, 0.1 * S]);
      const [a0, b0] = tf(SC.x0 + 0.17, SC.y1 - 0.17), [a1, b1] = tf(SC.x1 - 0.17, SC.y0 + 0.17); ctx.strokeRect(a0, b0, a1 - a0, b1 - b0); ctx.setLineDash([]);
    },
  };
  const top = {
    shapes: [rr], fill: 'rgba(0,0,0,0)', stroke: null,
    deco(c) {
      const { ctx, tf, S } = c;
      const font = (px, b = true, it = false) => { ctx.font = `${it ? 'italic ' : ''}${b ? 'bold ' : ''}${px * S}px ${SERIF}`; };
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      font(0.4); ctx.fillStyle = RED; let [x, y] = tf(SC.x0 + 0.42, SC.y1 - 0.5); ctx.fillText('Querschnitt', x, y);
      font(0.27, false, true); ctx.fillStyle = '#5a3d22'; [x, y] = tf(SC.x0 + 0.42, SC.y1 - 0.92); ctx.fillText('der Cheops-Pyramide', x, y);
      ctx.textAlign = 'right'; font(0.27, true, true); ctx.fillStyle = '#7a1a1a';
      [x, y] = tf(SC.x1 - 0.42, SC.y1 - 0.5); ctx.fillText('Tippe auf eine', x, y); [x, y] = tf(SC.x1 - 0.42, SC.y1 - 0.86); ctx.fillText('Kammer!', x, y);
      // Etiketten mit Leitlinie
      ctx.textAlign = 'center'; font(0.3);
      for (const L of SC_LABELS) {
        const wTxt = Math.max(...L.t.map((s) => ctx.measureText(s).width)) / S, h = 0.38 * L.t.length + 0.16, w = wTxt + 0.3;
        const [tx, ty] = L.tag;
        // Leitlinie vom Etikett zur Kammer
        ctx.strokeStyle = 'rgba(40,20,8,.85)'; ctx.lineWidth = 0.028 * S; ctx.lineCap = 'round';
        const ex = L.at[0] > tx ? tx + w / 2 * 0.9 : tx - w / 2 * 0.9;
        let [px, py] = tf(ex, ty); ctx.beginPath(); ctx.moveTo(px, py); [px, py] = tf(L.at[0], L.at[1]); ctx.lineTo(px, py); ctx.stroke();
        ctx.fillStyle = '#fff6df'; ctx.strokeStyle = 'rgba(40,20,8,.9)'; ctx.beginPath(); ctx.arc(px, py, 0.06 * S, 0, TAU); ctx.fill(); ctx.stroke();
        // Etikett
        const [x0, y0] = tf(tx - w / 2, ty + h / 2); ctx.fillStyle = '#fff6df'; ctx.strokeStyle = L.col; ctx.lineWidth = 0.05 * S;
        roundRect(ctx, x0, y0, w * S, h * S, 0.1 * S); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3a2615'; L.t.forEach((s, i) => { const [qx, qy] = tf(tx, ty + (L.t.length - 1) * 0.19 - i * 0.38); ctx.fillText(s, qx, qy + 0.02 * S); });
      }
    },
  };
  return { layers: [back, ...src, top] };
}

function coverCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath(); };
  const k = w / 900;
  g.fillStyle = '#f6edd6'; rr(0, 0, w, h, 26 * k); g.fill();
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e6c06a'); gr.addColorStop(1, '#cc9a42');
  g.fillStyle = gr; rr(14 * k, 14 * k, w - 28 * k, h - 28 * k, 20 * k); g.fill();
  g.strokeStyle = 'rgba(255,244,205,.8)'; g.lineWidth = 3 * k; g.setLineDash([12 * k, 9 * k]); rr(32 * k, 32 * k, w - 64 * k, h - 64 * k, 14 * k); g.stroke(); g.setLineDash([]);
  // Pyramide mit Schnitt
  const cx = w * 0.27, by = h * 0.76, pw = w * 0.2, ph = h * 0.5;
  g.fillStyle = '#f7efd4'; g.beginPath(); g.moveTo(cx - pw, by); g.lineTo(cx, by - ph); g.lineTo(cx + pw, by); g.closePath(); g.fill();
  g.strokeStyle = '#7a4f1c'; g.lineWidth = 4 * k; g.stroke();
  g.fillStyle = '#d8583c'; rr(cx - pw * 0.2, by - ph * 0.58, pw * 0.5, ph * 0.16, 6 * k); g.fill();
  g.fillStyle = '#4a7cc4'; rr(cx - pw * 0.25, by - ph * 0.3, pw * 0.42, ph * 0.12, 6 * k); g.fill();
  g.strokeStyle = '#f2c25a'; g.lineWidth = 9 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - pw * 0.52, by - ph * 0.2); g.lineTo(cx - pw * 0.04, by - ph * 0.5); g.stroke();
  g.fillStyle = '#7a4f1c'; g.beginPath(); g.moveTo(cx - pw - 8 * k, by + 12 * k); g.lineTo(cx + pw + 8 * k, by + 12 * k); g.lineTo(cx + pw + 8 * k, by + 30 * k); g.lineTo(cx - pw - 8 * k, by + 30 * k); g.fill();
  g.textAlign = 'center'; g.fillStyle = '#7a1a1a';
  g.font = `bold ${88 * k}px ${SERIF}`; g.fillText('SCHNITT', w * 0.69, h * 0.43);
  g.fillStyle = '#4a2c12'; g.font = `italic ${42 * k}px ${SERIF}`; g.fillText('Ein Blick ins Innere', w * 0.69, h * 0.56);
  g.fillStyle = '#fff6df'; g.font = `bold ${38 * k}px ${SERIF}`; g.fillText('Tippe zum Aufklappen', w * 0.69, h * 0.8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// weicher dunkler Streifen für nassen Sand
function wetTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  const gx = g.createLinearGradient(0, 0, 256, 0); gx.addColorStop(0, 'rgba(110,70,35,0)'); gx.addColorStop(0.12, 'rgba(110,70,35,.5)'); gx.addColorStop(0.9, 'rgba(110,70,35,.55)'); gx.addColorStop(1, 'rgba(110,70,35,0)');
  g.fillStyle = gx; g.beginPath(); g.ellipse(128, 32, 128, 26, 0, 0, TAU); g.fill();
  g.globalCompositeOperation = 'destination-in'; const gy = g.createLinearGradient(0, 0, 0, 64); gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(0.35, '#000'); gy.addColorStop(0.65, '#000'); gy.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gy; g.fillRect(0, 0, 256, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ------------------------------------------------------------------ Seite
export default {
  id: 'gizeh',
  mood: mood({ key: '#fff0cc', keyI: 2.45, sky: '#e6f0f0', gnd: '#a98255', hemiI: 1.85, pos: [-12, 21, 9], rim: 0.2 }),
  motes: { colors: [[1, 0.9, 0.62], [1, 0.97, 0.85], [0.95, 0.8, 0.5]], size: 0.075, alpha: 0.42, dy: 0.06, dx: 0.1, tw: 1.2, density: 0.8 },
  atmo: 'gizeh',
  base() {
    const d = PAGES_DE[IDX];
    return {
      L: {
        ground: { back: '#ecd9a6', front: '#dbbd82' }, margin: 0.3, pageNo: 2 * IDX + 1, seed: 31,
        draw(ctx, m) {
          blotches(m, { x0: -12, x1: 0, z0: -3.5, z1: 4.3, n: 18, rmin: 0.9, rmax: 2.2, colors: ['rgba(255,244,214,.2)', 'rgba(150,110,50,.1)'], seed: 31 });
          cracks(m, { x0: -11.6, x1: -0.4, z0: -1.0, z1: 4.0, n: 46, seed: 5, color: 'rgba(110,70,30,.2)' });
          // Schlittenbahn: festgetretene Spur
          ctx.save(); ctx.lineCap = 'butt';
          ctx.strokeStyle = 'rgba(248,228,180,.55)'; ctx.lineWidth = 1.05 * m.S; ctx.beginPath(); ctx.moveTo(m.x(-11.8), m.z(LANE_Z + 0.35)); ctx.lineTo(m.x(-0.8), m.z(LANE_Z + 0.35)); ctx.stroke();
          ctx.strokeStyle = 'rgba(150,95,45,.3)'; ctx.lineWidth = 0.025 * m.S; ctx.setLineDash([0.18 * m.S, 0.14 * m.S]);
          for (const off of [-0.12, 0.82]) { ctx.beginPath(); ctx.moveTo(m.x(-11.8), m.z(LANE_Z + off)); ctx.lineTo(m.x(-0.8), m.z(LANE_Z + off)); ctx.stroke(); }
          ctx.restore();
          pebbles(m, { x0: -11, x1: -0.8, z0: -0.4, z1: 3.6, n: 12, seed: 8 });
          grassTufts(m, { x0: -11, x1: -1, z0: 0.0, z1: 3.7, n: 4, seed: 6, color: '#8a9a4a', h: 0.26 });
          textCard(m, { x: -11.35, z: 0.62, w: 5.9, h: 3.25, kicker: d.kicker, title: d.title, body: d.card, size: 0.272, titleSize: 0.4, sub: d.years });
        },
      },
      R: {
        ground: { back: '#e9d29b', front: '#d2b074' }, margin: 0.35, pageNo: 2 * IDX + 2, seed: 32,
        draw(ctx, m) {
          blotches(m, { x0: 0, x1: 12, z0: -3.5, z1: 4.3, n: 18, rmin: 0.9, rmax: 2.2, colors: ['rgba(255,244,214,.2)', 'rgba(150,110,50,.1)'], seed: 32 });
          cracks(m, { x0: 0.6, x1: 11.4, z0: -0.5, z1: 4.0, n: 56, seed: 12, color: 'rgba(110,70,30,.24)' });
          pebbles(m, { x0: 1, x1: 11, z0: 0.2, z1: 3.6, n: 12, seed: 14 });
          grassTufts(m, { x0: 1, x1: 11.4, z0: 0.2, z1: 3.8, n: 4, seed: 15, color: '#8a9a4a', h: 0.26 });
          printLabel(m, 'Gizeh bei Kairo', 9.0, 3.45, { size: 0.24, color: 'rgba(100,65,30,.6)', italic: true, bold: false });
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app, L = ctx.L, R = ctx.R;
    const tapProp = (pop, id, meshes) => { if (!pop || !pop.fig) return; pop.pickMeshes = (meshes || pop.fig.hit).slice(); for (const mm of pop.pickMeshes) mm.userData.tap = () => app.openCardById(id, pop.group.position.x); };
    const hop = (a, h = 0.3, dur = 0.6) => a.tw.add(dur, (k) => { a.hop = Math.sin(k * Math.PI) * h; }, { done: () => { a.hop = 0; } });
    const puff = (x, y, z, n = 3, o = {}) => {
      const rate = fxRate(app); if (rate <= 0) return;
      const w = ctx.world(x, y, z); const k = Math.max(1, Math.round(n * rate));
      for (let i = 0; i < k; i++) app.fx.dust.emit({ x: w.x + (Math.random() - 0.5) * 0.3, y: w.y, z: w.z + 0.1, vx: (o.vx || 0) + (Math.random() - 0.5) * 0.4, vy: 0.25 + Math.random() * 0.35, vz: (Math.random() - 0.5) * 0.3, life: o.life || 1.0, size: o.size || 0.3, alpha: o.alpha ?? 0.5, color: o.color || [0.93, 0.8, 0.58], drag: 1.6, grow: 2 });
    };

    // ---------------------------------------------------------------- Kulissen: Himmel, Wüste
    for (const sd of ['L', 'R']) {
      const x0 = sd === 'L' ? -11.75 : 0.2, x1 = sd === 'L' ? -0.2 : 11.75;
      ctx.flat(panelPart(x0, x1, 5.0, { fill: { top: '#6fb6d8', bottom: '#fbe6b8' }, wave: 0.28, freq: 3, phase: sd === 'L' ? 0.4 : 2.0, seed: sd === 'L' ? 2 : 5, deco: (c, bb) => { softLight(c, bb, { color: 'rgba(255,238,175,.6)', cx: sd === 'L' ? 0.25 : 0.7, cy: 0.5, r: 0.7 }); dither(c, bb, '#fff', { n: 100, alpha: 0.12, size: 0.04 }); } }), { z: -4.05, lean: -0.05, name: 'sky' + sd, delay: 0, ppu: 70, border: 0.04 });
      ctx.flat(panelPart(x0, x1, 1.55, { fill: { top: '#e7c27c', bottom: '#d6a85f' }, wave: 0.34, freq: sd === 'L' ? 3.6 : 2.9, step: 0.16, phase: sd === 'L' ? 1.0 : 3.0, seed: 9, deco: (c, bb) => { strata(c, bb, ['#f0cf90', '#d8aa62', '#e8c27c'], { n: 5, seed: 4, alpha: 0.3 }); dither(c, bb, '#8a5a24', { n: 90, alpha: 0.2 }); } }), { z: -3.3, lean: -0.03, name: 'hill' + sd, delay: 0.04, ppu: 70 });
    }
    yield;
    const sun = ctx.prop('sun_disc', { x: -9.4, y: 2.55, z: -3.9, h: 1.7, delay: 0.1, cast: false });
    const glow = sunGlow({ size: 8, color: 0xffd27a }); glow.position.set(0, 1.0, -0.06); sun.add(glow); glow.scale.setScalar(0.5);
    ctx.onUpdate((dt, t) => glow.userData.update(t));
    const clouds = [ctx.prop('cloud_a', { x: -3.6, y: 3.95, z: -3.85, len: 2.6, delay: 0.2, cast: false }), ctx.prop('cloud_b', { x: 5.2, y: 3.9, z: -3.9, len: 2.5, delay: 0.24, cast: false }), ctx.prop('cloud_a', { x: 10.2, y: 3.5, z: -3.85, len: 2.0, delay: 0.26, cast: false })];
    const cloudX = [-3.6, 5.2, 10.2];
    ctx.prop('wuestenduene', { x: -6, z: -3.05, len: 11.6, delay: 0.06, variant: { seed: 1 } });
    ctx.prop('wuestenduene', { x: 6, z: -3.05, len: 11.6, delay: 0.06, variant: { seed: 2 } });
    yield;

    // ---------------------------------------------------------------- rechts: die fertigen Pyramiden, Sphinx
    const trio = ctx.prop('pyramide_gizeh', { x: 6.4, z: -2.75, len: 10.6, delay: 0.14 });
    tapProp(trio, 'cheops', [trio.fig.hit[0]]);
    ctx.prop('wuestenduene', { x: 6.2, z: -1.7, len: 10.5, delay: 0.16, variant: { seed: 3 } });
    const sphinx = ctx.stand('sphinx', { x: SPX, z: SPZ, len: SPLEN, facing: -1, delay: 0.3, card: 'sphinx', hitPad: 0.2 });
    sphinx.setFacing(-1);
    sphinx.hitMeshes = sphinx.fig.hit.slice();   // keine große Trefferfläche: der Käfer dahinter muss antippbar bleiben
    sphinx.onWake = (a) => { a.tw.add(0.9, (k) => { a.hop = Math.sin(k * Math.PI) * 0.06; }, { done: () => { a.hop = 0; } }); puff(SPX - 1.6, 0.1, SPZ + 0.5, 4); app.audio.sfx('sand'); };
    ctx.prop('palm', { x: 10.7, z: -1.9, h: 3.4, delay: 0.3, facing: -1 });
    ctx.prop('dattelpalme', { x: 6.9, z: -1.25, h: 2.7, delay: 0.32 });
    ctx.prop('grass_tuft', { x: 11.3, z: 0.9, len: 0.8, delay: 0.4 });
    // verstecktes Käferchen: hinter dem Schwanzbogen der Sphinx (in der Nische zwischen Schwanz und Hinterbein)
    const kaefer = ctx.stand('skarab4', { x: SPX + 1.85, z: SPZ - 0.35, len: 0.8, facing: -1, delay: 0.5, hidden: true, hint: false, hitPad: 0.2 });
    kaefer.setFacing(-1);
    kaefer.onWake = (a) => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.35; }, { done: () => { a.hop = 0; } }); app.audio.voice('skarabaeus'); };
    yield;

    // ---------------------------------------------------------------- links: Baustelle
    ctx.prop('steinbruch_wand', { x: -9.1, z: -3.1, len: 5.6, delay: 0.1 });
    ctx.prop('palm', { x: -10.5, z: -1.9, h: 3.2, delay: 0.3 });
    const pyr = ctx.prop('pyramide_bau', { x: PYX, z: PYZ, h: PYH, delay: 0.14 });
    pyr.pickMeshes = []; // wird je nach sichtbaren Schichten gefüllt
    const pyrHit = pyr.fig.hit.slice();
    for (const mm of pyrHit) mm.userData.tap = () => app.openCardById('cheops', PYX);
    yield;
    // Siedlung der Arbeiter (Deko, antippbar)
    const house = ctx.prop('lehmhaus', { x: -1.8, z: -1.15, len: 3.1, delay: 0.3 });
    const wall = ctx.prop('ziegelmauer', { x: -3.7, z: -0.75, len: 2.8, delay: 0.32, variant: 1 });
    tapProp(house, 'arbeitersiedlung'); tapProp(wall, 'arbeitersiedlung');
    // Rampe
    const ramp = ctx.prop('rampe', { x: -8.5, z: RAMP_Z, len: RAMP_LEN, delay: 0.2 });
    yield;
    // Steinmetz mit Block und Werkzeug
    const smBlock = ctx.prop('steinblock', { x: -3.25, z: 1.5, len: 1.15, delay: 0.4 });
    const steinmetz = ctx.stand('steinmetz', { x: -4.45, z: 1.55, h: 1.15, facing: 1, delay: 0.42, card: 'steinmetz' });
    const tools = ctx.prop('steinblock', { x: -2.0, z: 2.0, len: 0.8, delay: 0.44, variant: { seed: 4 } });
    const meissel = ctx.prop('kupfermeissel', { x: -2.15, y: 0.5, z: 2.1, len: 0.62, delay: 0.46 });
    ctx.prop('holzschlaegel', { x: -1.8, y: 0.5, z: 2.1, h: 0.5, delay: 0.46 });
    tapProp(meissel, 'kupfermeissel');
    const baumeister = ctx.stand('baumeister', { x: -1.0, z: 1.25, h: 1.45, facing: -1, delay: 0.46, card: 'baumeister' });
    baumeister.setFacing(-1);
    yield;

    // ---------------------------------------------------------------- Schlittenzug: Schlitten, Ochse, Arbeiter, Wasser-Helfer
    const sled = ctx.stand('schlitten', { x: LA, z: LANE_Z, len: 2.2, facing: 1, delay: 0.5, card: 'schlitten', hitPad: 0.2 });
    const ox = ctx.stand('ochse_joch', { x: LA + 3.6, z: LANE_Z - 0.05, len: 1.85, facing: 1, delay: 0.52, id: 'ochse', card: 'ochse' });
    const puller = ctx.stand('arbeiter', { x: LA + 2.0, z: LANE_Z + 0.2, h: 1.15, facing: 1, delay: 0.54, card: 'arbeiter', variant: { ropeLen: 0.05 } });
    const helper = ctx.stand('arbeiter', { x: LA + 1.2, z: LANE_Z + 0.5, h: 1.15, facing: 1, delay: 0.56, card: 'arbeiter', variant: { ropeLen: 0.02 } });
    const jug = ctx.fig('amphore', { h: 0.46, thickness: 0.02 }); L.own(jug);
    const jugG = new THREE.Group(); jug.group.position.set(0, -0.2, 0); jugG.add(jug.group); helper.popup.add(jugG);
    jug.setCast(false);
    const ropeLane = makeRope(sled.popup.pivot, 0xb79458, 0.05);
    const ropeLane2 = makeRope(sled.popup.pivot, 0xb79458, 0.05);
    const wetTex = wetTexture();
    const wet = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: wetTex, transparent: true, depthWrite: false, opacity: 0.0 }));
    wet.rotation.x = -Math.PI / 2; wet.position.set(LA, 0.014, LANE_Z + 0.05); wet.renderOrder = 1; L.add(wet);
    yield;

    // ---------------------------------------------------------------- Arbeiter auf der Rampe
    const rsled = ctx.stand('schlitten', { x: -9.5, z: -0.7, len: 1.7, facing: 1, delay: 0.5, card: 'schlitten', hitPad: 0.15 });
    const rw = [ctx.stand('arbeiter', { x: -8.5, z: -0.5, h: 1.05, facing: 1, delay: 0.52, card: 'arbeiter', variant: { ropeLen: 0.05 } }), ctx.stand('arbeiter', { x: -7.9, z: -0.45, h: 1.05, facing: 1, delay: 0.54, card: 'arbeiter', variant: { ropeLen: 0.05 } })];
    const ropeRamp = makeRope(rsled.popup.pivot, 0xb79458, 0.045);
    yield;

    // ---------------------------------------------------------------- rechte Seite: SCHNITT-Klappe
    const CW = 6.0, cws = CW / (SC.x1 - SC.x0), CH = (SC.y1 - SC.y0) * cws;
    const CARD_X = 3.4, CARD_Z = -0.5;
    const hinge = new THREE.Group(); hinge.position.set(CARD_X, 0.03, CARD_Z); R.add(hinge);
    const card = makeFlat(schnittPart(), { ws: cws, ppu: Math.min(app.q.ppu, 170), thickness: 0.04, border: 0.05, name: 'p3:schnitt', maxTex: 2048 });
    R.own(card);
    card.mesh.position.set(0, -SC.y0 * cws, 0); card.mesh.castShadow = true; card.mesh.receiveShadow = false;
    hinge.add(card.mesh);
    const cover = new THREE.Mesh(new THREE.PlaneGeometry(CW + 0.08, CH + 0.08), new THREE.MeshBasicMaterial({ map: coverCanvas(900, Math.round(900 * (CH + 0.08) / (CW + 0.08))), transparent: true, alphaTest: 0.5 }));
    cover.rotation.set(0, Math.PI, Math.PI); cover.position.set(0, CH / 2, -0.04 - 0.004); hinge.add(cover);
    const CLOSED = 1.5, OPEN = -0.07;
    const flap = new Spring(0, 70, 11);
    let cardCool = 0;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 28), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    ring.position.z = 0.02; ring.visible = false; card.mesh.add(ring); ring.userData.k = 0;
    const lp = new THREE.Vector3();
    const chamberAt = (hit) => {
      lp.copy(hit.point); card.mesh.worldToLocal(lp);
      let best = null, bd = 1e9; for (const h of SC_HOT) { const d = Math.hypot(lp.x - h.x, lp.y - h.y); if (d < h.r && d < bd) { bd = d; best = h; } }
      return best;
    };
    R.addTap(card.mesh, (hit) => {
      if (flap.target < 0.5) { flap.set(1); app.audio.sfx('flapOpen'); return; }
      const h = hit && chamberAt(hit);
      if (h) {
        ring.position.set(h.x, h.y, 0.02); ring.scale.setScalar(h.r / 0.65); ring.visible = true; ring.userData.k = 1; app.audio.sfx('chime', { note: 2 });
        if (cardCool <= 0) { cardCool = 1.2; setTimeout(() => app.openCardById('cheops', CARD_X), 250); }
      } else { flap.set(0); app.audio.sfx('flapClose'); }
    });
    yield;

    // ---------------------------------------------------------------- Laschen
    const bau = ctx.control('R', { id: 'bauen', label: 'BAUEN!', a: [5.6, 3.85], b: [10.4, 3.85], size: [2.2, 1.0], color: '#c8452c', value: V0, springBack: false, hold: true, ticks: NL });
    const lane = ctx.control('L', { id: 'schlitten', label: 'SCHLITTEN', a: [-4.4, 3.85], b: [-1.0, 3.85], size: [2.5, 1.0], color: '#2a7a9a', value: 0, springBack: true });

    // ---------------------------------------------------------------- BAUEN!: Schichten, Rampe, Arbeiter
    const st = { v: V0, vPrev: V0, layer: Math.floor(V0 * NL), dv: 0, ph: 0, rs: 1, rcx: -8.5, rsX: -9.5, ctlT: 0 };
    const pyrParts = pyr.fig.parts;
    const slope = Math.atan(RAMP_SLOPE);
    const surfaceAt = (X) => { // Höhe der Rampenoberfläche (Weltkoordinaten) und Neigung an der Stelle X
      const k = RAMP_WS * st.rs, xm = (X - st.rcx) / k;
      if (xm <= -3.0) return [0, 0];
      const y = rampSurf(Math.min(xm, 3.0)) * k;
      return [y, xm > 3.0 ? 0 : slope * smooth(clamp((xm + 3.0) / 0.6))];
    };
    const place = (a, X, Z, ang, yOff = 0) => { const [y, sl] = surfaceAt(X); a.popup.group.position.set(X, y + yOff, Z); a.fig.root.rotation.z = ang === undefined ? sl : ang; };
    function applyBuild(v) {
      st.v = v;
      const t = v * NL;
      pyr.pickMeshes.length = 0;
      for (let j = 0; j < NL; j++) {
        const s = smooth(clamp(t - j, 0, 1)), p = pyrParts['schicht' + j];
        p.visible = s > 0.004; p.scale.y = Math.max(s, 0.001); p.position.y = ((j * PYH) / NL) * (1 - s);
        if (p.visible) pyr.pickMeshes.push(pyrHit[j]);
      }
      // Rampe wächst mit und lehnt immer an der Pyramidenkante
      const Ht = 0.3 + (RAMP_END * 0.98 - 0.3) * smooth(clamp(v / 0.55));
      const s = Ht / RAMP_END; st.rs = s;
      st.rcx = faceX(Ht) + 0.06 - 3.0 * RAMP_WS * s;
      ramp.group.scale.setScalar(s); ramp.group.position.x = st.rcx;
      // Zug auf der Rampe: unten warten, mit dem Bau nach oben
      const xr = st.rcx + 3.0 * RAMP_WS * s;
      const SA = -10.35, SB = xr - 2.35;
      const SX = lerp(SA, SB, smooth(clamp(v)) * 0.6 + clamp(v) * 0.4);
      const slopeAng = (X) => surfaceAt(X)[1];
      place(rsled, SX, -1.0, undefined);
      place(rw[0], SX + 1.5, -0.9, undefined); place(rw[1], SX + 2.15, -0.84, undefined);
      rsled.fig.parts.steinblock.visible = v < 0.999;
      // Seil
      const sa = anchorXY(rsled, 'seilende'); const ax = sa[0], ay = sa[1];
      const hb = anchorXY(rw[1], 'gripA'); const bx = hb[0], by = hb[1];
      const rl = rsled.popup.group.position; ropeRamp.set(ax - rl.x, ay - rl.y, bx - rl.x, by - rl.y, 0.1);
      void slopeAng;
    }
    st.layer = Math.floor(V0 * NL);
    applyBuild(V0);
    bau.on((v) => {
      applyBuild(v);
      const l = Math.floor(v * NL);
      if (l !== st.layer) { st.layer = l; app.audio.sfx('chisel'); app.audio.sfx('thud'); }
      if (Math.abs(v - st.ctlT) > 0.004) { st.ctlT = v; app.audio.ctl('build', v); }
    });
    bau.onGrab = () => app.audio.sfx('grab'); bau.onTick = (v) => app.audio.sfx('slide', { v }); bau.onRelease = () => app.audio.sfx('snap');
    lane.onGrab = () => app.audio.sfx('grab'); lane.onTick = (v) => app.audio.sfx('sand', { v }); lane.onRelease = () => app.audio.sfx('snap');

    // ---------------------------------------------------------------- Tier-/Figuren-Reaktionen
    let hitT = 0, hitK = 0; // Steinmetz: Schlag-Takt
    steinmetz.onWake = () => { hitT = 0; hitK = 3; };
    const hitPose = (a, amt) => poseAmt(a.fig, 'armA', amt);
    baumeister.onWake = (a) => { a.tw.add(1.2, (k) => { poseAmt(a.fig, 'armB', Math.sin(k * Math.PI)); a.hop = Math.sin(k * Math.PI * 2) * 0.03; }, { done: () => { a.hop = 0; } }); };
    ox.onWake = (a) => { a.tw.add(1.0, (k) => { poseAmt(a.fig, 'head', Math.sin(k * Math.PI)); a.hop = Math.sin(k * Math.PI) * 0.06; }, { done: () => { a.hop = 0; } }); };
    for (const a of [puller, helper, ...rw]) a.onWake = (aa) => hop(aa, 0.12, 0.5);
    sled.onWake = (a) => { a.tw.add(0.5, (k) => { a.hop = Math.sin(k * Math.PI) * 0.04; }, { done: () => { a.hop = 0; } }); };
    rsled.onWake = sled.onWake;

    // ---------------------------------------------------------------- pro Frame
    let lanePh = 0, laneX = LA, rampPh = 0, rampSX = null, dustT = 0, waterT = 0, buildDustT = 0;
    ctx.onUpdate((dt, t) => {
      if (!ctx.spread.active) return;
      const rate = fxRate(app);
      // ---- Schlittenzug
      const lv = lane.sp.x;
      const X = lerp(LA, LB, lv), dX = X - laneX; laneX = X;
      const moving = Math.abs(dX) > 0.0005;
      if (moving) lanePh += dX * 5.2;
      const pour = smooth(clamp(lv * 25));
      sled.popup.group.position.x = X; sled.popup.group.position.y = 0;
      puller.popup.group.position.x = X + 2.15; helper.popup.group.position.x = X + 1.15; ox.popup.group.position.x = X + 3.85;
      for (const a of [puller, ox]) if (moving) { walkLegs(a.fig, lanePh + (a === ox ? 0 : Math.PI * 0.5), 1); a.hop = Math.abs(Math.sin(lanePh * (a === ox ? 1 : 1))) * (a === ox ? 0.025 : 0.04); } else if (!a.tw.list.length) { restLegs(a.fig); a.hop = 0; }
      if (moving) walkLegs(helper.fig, lanePh + Math.PI * 0.2, 1); else restLegs(helper.fig);
      if (!ox.tw.list.length) { poseAmt(ox.fig, 'head', 0.25 + 0.2 * Math.sin(t * 0.9)); poseAmt(ox.fig, 'tail', 0.5 + 0.5 * Math.sin(t * 1.7 + 1)); }
      // Seile: Schlitten -> Arbeiter -> Joch des Ochsen
      { const se = anchorXY(sled, 'seilende'); const sx = se[0], sy = se[1];
        const gp = anchorXY(puller, 'gripA'); const gx = gp[0], gy = gp[1];
        const yk = anchorXY(ox, 'yoke'); const yx = yk[0], yy = yk[1];
        const o = sled.popup.group.position;
        ropeLane.set(sx - o.x, sy - o.y, gx - o.x, gy - o.y, 0.14); ropeLane2.set(gx - o.x, gy - o.y, yx - o.x, yy - o.y, -0.02); }
      // Helfer gießt: Krug neigt sich, Wasser tropft vor die Kufen, Streifen aus nassem Sand wird länger
      { const ha = anchorXY(helper, 'handA'); jugG.position.set(ha[0] - helper.popup.group.position.x, ha[1] - helper.popup.group.position.y + 0.02, 0.12);
        jugG.rotation.z = lerp(0.1, -1.32, pour) + (pour > 0.5 ? Math.sin(t * 3.1) * 0.05 : 0);
        const pX = X + 2.0, x0 = LA - 1.0, len = Math.max(0.01, pX - x0 - 0.2);
        wet.scale.set(len, 0.8, 1); wet.position.x = x0 + 0.1 + len / 2; wet.material.opacity = smooth(clamp(lv * 12)) * 0.8;
        if (pour > 0.5 && rate > 0) {
          waterT += dt * 22 * rate; const mx = ha[0] + 0.4, my = ha[1] - 0.12;
          while (waterT > 1) { waterT -= 1; const w = ctx.world(mx, my, LANE_Z + 0.5 + 0.1); app.fx.dust.emit({ x: w.x, y: w.y, z: w.z, vx: 0.5 + Math.random() * 0.3, vy: 0.1, vz: 0, life: 0.55, size: 0.06, alpha: 0.85, color: [0.62, 0.8, 0.95], grav: 6.5, drag: 0.3 }); }
        }
        // Staub hinter den Kufen
        if (moving && rate > 0) { dustT += Math.abs(dX) * 9 * rate; while (dustT > 1) { dustT -= 1; puff(X - 1.0, 0.08, LANE_Z + 0.1, 1, { size: 0.24, alpha: 0.32, color: [0.55, 0.4, 0.26], life: 0.9 }); } }
      }
      // ---- BAUEN!: Gehzyklus auf der Rampe, Staub oben
      const v = bau.sp.x, dv = v - st.vPrev; st.vPrev = v;
      if (Math.abs(dv) > 0.00015) rampPh += dv * 150;
      const walking = Math.abs(dv) > 0.00015;
      for (const [i, a] of rw.entries()) { if (walking) { walkLegs(a.fig, rampPh + i * 1.9, 1); } else if (!a.tw.list.length) { restLegs(a.fig); } }
      if (walking && rate > 0) {
        buildDustT += Math.abs(dv) * 520 * rate;
        const top = clamp(v * NL, 0, NL), ty = (Math.ceil(top) / NL) * PYH * 0.98 * Math.min(1, 1.0);
        const hw = PHALF * (1 - ty / PYH);
        while (buildDustT > 1) { buildDustT -= 1; puff(PYX + (Math.random() - 0.5) * 2 * hw * 0.8, Math.min(ty, PYH * 0.99), PYZ + 0.5, 1, { size: 0.34, alpha: 0.4 }); }
        if (Math.random() < 0.3) { const sp = rsled.popup.group.position; puff(sp.x - 0.4, sp.y + 0.05, -0.55, 1, { size: 0.22, alpha: 0.3, color: [0.6, 0.45, 0.3] }); }
      }
      // ---- Steinmetz klopft regelmäßig (Ruhiger Modus: langsamer, ohne Splitter)
      hitT -= dt;
      const period = app.calm ? 2.6 : (hitK > 0 ? 0.9 : 1.5);
      if (hitT <= 0) { hitT = period; steinmetz.tw.add(0.42, (k) => { hitPose(steinmetz, Math.sin(k * Math.PI)); }, {}); hitK = Math.max(0, hitK - 1);
        setTimeout(() => { if (!ctx.spread.active) return; app.audio.sfx('chisel'); if (!app.calm) puff(-3.7, 0.45, 1.75, 2, { size: 0.12, alpha: 0.7, color: [0.97, 0.93, 0.8], life: 0.7 }); }, 190); }
      if (!steinmetz.tw.list.length) hitPose(steinmetz, 0);
      // ---- Baumeister: wiegt sich ein wenig
      if (!baumeister.tw.list.length) { poseAmt(baumeister.fig, 'armB', 0.25 * (0.5 + 0.5 * Math.sin(t * 0.6))); poseAmt(baumeister.fig, 'armA', 0.4 * Math.sin(t * 0.5)); }
      // ---- Wolken, Sonne
      for (let i = 0; i < clouds.length; i++) clouds[i].group.position.x = cloudX[i] + Math.sin(t * (0.04 + i * 0.012) + i) * 1.2;
      glow.scale.setScalar(0.5 + 0.02 * Math.sin(t * 0.7));
    });
    // Klappe (läuft auch beim Umblättern: klappt flach, sobald die Seite sich hebt)
    R.onUpdate((dt) => {
      cardCool = Math.max(0, cardCool - dt);
      const fk = flap.update(dt), sc = R.scrub();
      hinge.rotation.x = lerp(CLOSED, OPEN, clamp(fk, 0, 1.12) * sc);
      hinge.position.y = 0.03;
      if (ring.visible) { ring.userData.k = Math.max(0, ring.userData.k - dt * 1.4); ring.material.opacity = ring.userData.k * 0.9; ring.scale.multiplyScalar(1 + dt * 0.4); if (ring.userData.k <= 0) ring.visible = false; }
    });
    // der Käfer, die Pyramiden & Co. brauchen keine weitere Logik; Zustand für onDeactivate merken
    ctx.spread.p3 = { bau, lane, flap, card: card.mesh, setFlap: (k) => flap.set(k), st, applyBuild };
  },
  onDeactivate(ctx) {
    const s = ctx.spread.p3; if (!s) return;
    s.lane.setValue(0, { snap: true }); s.bau.setValue(V0, { snap: true }); s.applyBuild(V0);
    s.flap.snap(0);
  },
};
