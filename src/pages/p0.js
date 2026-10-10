// Station 0: Willkommen + Zeitrad der Sonne (Pop-up-Zifferblatt, 3300 bis 30 v. Chr.)
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { blob, poly } from '../art/dsl.js';
import { textCard, printLabel, SERIF, RED, INK, roundRect, blotches, speckles } from '../engine/pagepaint.js';
import { PAGES_DE, CARDS_DE } from '../data/pages.de.js';
import { Popup } from '../engine/popup.js';
import { TAU, clamp, lerp, smooth } from '../engine/util.js';
import { cracks } from './common.js';

// ---- Zeitrad der Sonne: der Zeiger läuft von 3300 v. Chr. (oben) einmal im Kreis bis 30 v. Chr.
export const BCE0 = 3300, BCE1 = 30; // Beginn und Ende des Rades (Jahre v. Chr.)
export const hourOf = (bce) => 24 * ((BCE0 - bce) / (BCE0 - BCE1));   // Jahr -> "Stunde" 0..24 (Winkel)
export const bceOf = (hour) => BCE0 - (BCE0 - BCE1) * (hour / 24);   // "Stunde" -> Jahr v. Chr.
export function fmtBce(y) { return `ca. ${Math.round(y / 10) * 10 >= 1000 ? Math.round(y / 10) * 10 : Math.round(y / 5) * 5} v. Chr.`.replace(/(\d)(\d{3}) v/, '$1.$2 v'); }
export const EVENTS = [
  { id: 'narmer', bce: 3100, label: 'Zwei Länder werden eins' },
  { id: 'djoser', bce: 2650, label: 'Die erste Stufenpyramide' },
  { id: 'cheops', bce: 2560, label: 'Cheops-Pyramide' },
  { id: 'hatschepsut', bce: 1470, label: 'Hatschepsut regiert' },
  { id: 'tut', bce: 1323, label: 'Tutanchamun' },
  { id: 'ramses', bce: 1260, label: 'Ramses II.' },
  { id: 'alex', bce: 331, label: 'Alexandria wird gegründet' },
  { id: 'kleo', bce: 30, label: 'Kleopatra, das Ende' },
];
export const ERAS = [
  { name: 'Frühzeit', from: 3300, to: 2686, col: '#c9a96a' },
  { name: 'Altes Reich', from: 2686, to: 2181, col: '#e0a83a' },
  { name: 'Zwischenzeit', from: 2181, to: 2055, col: '#a89a82' },
  { name: 'Mittleres Reich', from: 2055, to: 1650, col: '#2f7fa8' },
  { name: 'Zwischenzeit', from: 1650, to: 1550, col: '#a89a82' },
  { name: 'Neues Reich', from: 1550, to: 1070, col: '#c8452c' },
  { name: 'Späte Zeit', from: 1070, to: 332, col: '#7a5a9a' },
  { name: 'Ptolemäer', from: 332, to: 30, col: '#2a9d8f' },
];
const R = 3.05, CY = 3.3;

function clockFace(c) {
  const { ctx, S, tf } = c;
  const [cx, cy] = tf(0, CY);
  const arc = (r0, r1, a0, a1, col) => {
    ctx.beginPath(); ctx.arc(cx, cy, r1 * S, -Math.PI / 2 + a0, -Math.PI / 2 + a1, false); ctx.arc(cx, cy, r0 * S, -Math.PI / 2 + a1, -Math.PI / 2 + a0, true); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };
  const ang = (bce) => (hourOf(bce) / 24) * TAU;
  // Sonnenstrahlen am Rand (goldene Dreiecke)
  ctx.fillStyle = '#e0b040';
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * TAU - Math.PI / 2, w = 0.045;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - w) * (R - 0.05) * S, cy + Math.sin(a - w) * (R - 0.05) * S);
    ctx.lineTo(cx + Math.cos(a) * (R + 0.2) * S, cy + Math.sin(a) * (R + 0.2) * S); ctx.lineTo(cx + Math.cos(a + w) * (R - 0.05) * S, cy + Math.sin(a + w) * (R - 0.05) * S); ctx.closePath(); ctx.fill();
  }
  // face
  ctx.fillStyle = '#f7edd3'; ctx.beginPath(); ctx.arc(cx, cy, R * S, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(cx, cy, 0.3 * S, cx, cy, R * S); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(120,80,30,.12)'); ctx.fillStyle = g; ctx.fill();
  // gold rim
  ctx.lineWidth = 0.16 * S; ctx.strokeStyle = '#b8862d'; ctx.beginPath(); ctx.arc(cx, cy, (R - 0.08) * S, 0, TAU); ctx.stroke();
  ctx.lineWidth = 0.04 * S; ctx.strokeStyle = '#fff0b3'; ctx.beginPath(); ctx.arc(cx, cy, (R - 0.02) * S, 0, TAU); ctx.stroke();
  // Epochenring
  for (const e of ERAS) arc(R - 0.78, R - 0.36, ang(e.from), ang(e.to), e.col);
  ctx.strokeStyle = 'rgba(60,30,10,.5)'; ctx.lineWidth = 0.012 * S; ctx.beginPath(); ctx.arc(cx, cy, (R - 0.36) * S, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, (R - 0.78) * S, 0, TAU); ctx.stroke();
  for (const e of ERAS) { const a = ang(e.from) - Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 0.78) * S, cy + Math.sin(a) * (R - 0.78) * S); ctx.lineTo(cx + Math.cos(a) * (R - 0.36) * S, cy + Math.sin(a) * (R - 0.36) * S); ctx.stroke(); }
  // Epochen-Namen entlang des Rings (kleine gedrehte Schrift in den breiten Sektoren)
  ctx.save(); ctx.fillStyle = '#fff8e6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `bold ${0.17 * S}px ${SERIF}`;
  for (const e of ERAS) {
    if (e.name === 'Zwischenzeit') continue;
    const a = (ang(e.from) + ang(e.to)) / 2 - Math.PI / 2, rr = (R - 0.57) * S;
    ctx.save(); ctx.translate(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); ctx.rotate(a + Math.PI / 2); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 2; ctx.fillText(e.name, 0, 0); ctx.restore();
  }
  ctx.restore();
  // Teilstriche (alle 100 Jahre) und Jahreszahlen (alle 500)
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let y = 3300; y >= 30; y -= 100) {
    if (y > 3300 || y < 30) continue;
    const a = ang(y) - Math.PI / 2, major = y % 500 === 0;
    ctx.lineWidth = (major ? 0.045 : 0.018) * S;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 0.36) * S, cy + Math.sin(a) * (R - 0.36) * S); ctx.lineTo(cx + Math.cos(a) * (R - (major ? 0.2 : 0.28)) * S, cy + Math.sin(a) * (R - (major ? 0.2 : 0.28)) * S); ctx.stroke();
  }
  for (const y of [3000, 2500, 2000, 1500, 1000, 500]) { const a = ang(y) - Math.PI / 2; ctx.font = `bold ${0.21 * S}px ${SERIF}`; ctx.fillText(String(y), cx + Math.cos(a) * (R - 0.96) * S, cy + Math.sin(a) * (R - 0.96) * S); }
  // Mitte: Sonnenscheibe
  const sg = ctx.createRadialGradient(cx - 0.12 * S, cy - 0.12 * S, 0.05 * S, cx, cy, 0.9 * S); sg.addColorStop(0, '#fff3b0'); sg.addColorStop(0.55, '#f0c24a'); sg.addColorStop(1, '#c99224');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 0.86 * S, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8a5f1c'; ctx.lineWidth = 0.03 * S; ctx.stroke();
  ctx.textAlign = 'center'; ctx.font = `italic bold ${0.27 * S}px ${SERIF}`; ctx.fillStyle = '#7a1a1a'; ctx.fillText('Zeitrad', cx, cy + 0.28 * S);
  ctx.font = `${0.15 * S}px ${SERIF}`; ctx.fillStyle = '#5a3d22'; ctx.fillText('3300 bis 30 v. Chr.', cx, cy + 0.52 * S);
}

function clockPart() {
  const disc = blob(0, CY, R + 0.28, R + 0.28, 0, 96);
  const foot = poly([[-1.15, 0], [1.15, 0], [0.7, CY - R + 0.6], [-0.7, CY - R + 0.6]]);
  return { layers: [{ shapes: [disc, foot], fill: '#f7edd3', deco: (c) => clockFace(c), stroke: null }] };
}
function handPart() {
  const hand = poly([[-0.1, -0.45], [0.1, -0.45], [0.07, R - 0.95], [0, R - 0.5], [-0.07, R - 0.95]]);
  const hub = blob(0, 0, 0.26, 0.26, 0, 24);
  return { layers: [{ shapes: [hand, hub], fill: { top: '#d62828', bottom: '#8d1111' }, stroke: 'rgba(40,0,0,.55)' }] };
}

function displayCanvas() {
  const c = document.createElement('canvas'); c.width = 768; c.height = 240; return c;
}

export default {
  id: 'zeitrad',
  mood: mood({ key: '#ffe9c4', keyI: 2.3, sky: '#fff3de', gnd: '#8a6a4a', hemiI: 1.8 }),
  motes: { colors: [[1, 0.9, 0.6], [1, 1, 0.85]], size: 0.06, alpha: 0.4, dy: 0.05, dx: 0.08, tw: 1.1, density: 0.6 },
  atmo: 'zeitrad',
  base() {
    const L = PAGES_DE[0];
    return {
      L: {
        paper: '#f2e6c8', ground: { back: '#ecd9aa', front: '#dcc08a' }, margin: 0.4, pageNo: 1,
        draw(ctx, m) {
          blotches(m, { x0: -12, x1: 0, z0: -4.4, z1: 4.4, n: 16, rmin: 1, rmax: 2.4, colors: ['rgba(255,244,214,.18)'], seed: 4 });
          textCard(m, { x: -10.6, z: -3.2, w: 9.3, h: 4.35, kicker: L.kicker, title: L.title, body: L.card, size: 0.37, titleSize: 0.56, tilt: -0.012 });
          // timeline legend: eight eras as coloured dots
          const names = ['Nil', 'Zwei Länder', 'Gizeh', 'Götter', 'Mumie', 'Alltag', 'Tal der Könige', 'Kleopatra'];
          const cols = PAGES_DE.slice(1).map((p) => p.color);
          printLabel(m, 'Deine Reise durch Ägypten', -5.95, 2.0, { size: 0.3, color: RED, italic: true });
          names.forEach((n, i) => {
            const x = -10.2 + i * 1.22, z = 3.0;
            ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(m.x(x), m.z(z), 0.2 * m.S, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff4d0'; ctx.lineWidth = 0.05 * m.S; ctx.stroke();
            ctx.strokeStyle = 'rgba(80,45,15,.35)'; ctx.lineWidth = 0.02 * m.S; if (i) { ctx.beginPath(); ctx.moveTo(m.x(x - 1.22 + 0.22), m.z(z)); ctx.lineTo(m.x(x - 0.22), m.z(z)); ctx.stroke(); }
            printLabel(m, String(i + 1), x, z + 0.01, { size: 0.2, color: '#fff', bold: true });
            const parts = n.split('-'); parts.forEach((pp, j) => printLabel(m, parts.length > 1 ? (j ? pp : pp + '-') : pp, x, z + 0.52 + j * 0.21, { size: 0.185, color: '#5a3d22' }));
          });
        },
      },
      R: {
        ground: { back: '#e2cd96', front: '#c9a96a' }, margin: 0.35, pageNo: 2,
        draw(ctx, m) {
          cracks(m, { x0: 0.6, x1: 11.4, z0: -0.5, z1: 4.0, n: 70, seed: 12, color: 'rgba(110,70,30,.28)' });
          // display field + slot labels
          ctx.fillStyle = 'rgba(60,30,10,.18)'; roundRect(ctx, m.x(3.5), m.z(1.55), 5.8 * m.S, 1.1 * m.S, 0.2 * m.S); ctx.fill();
          printLabel(m, '0 Uhr', 2.55, 4.0, { size: 0.19, color: '#6b4a2a' });
          printLabel(m, '24 Uhr', 9.4, 4.0, { size: 0.19, color: '#6b4a2a' });
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app;
    // ---- the clock stands on the right page
    const clock = ctx.flat(clockPart(), { x: 6.4, z: -1.2, ws: 1, name: 'zeitrad', delay: 0.05, thickness: 0.05, border: 0.07, ppu: Math.min(app.q.ppu, 180), maxTex: 1536, lean: -0.05 });
    yield;
    const handCut = ctx.flat(handPart(), { x: 0, z: 0, name: 'zeiger', thickness: 0.03, border: 0.03 });
    // re-parent the hand into the clock so it folds with it, pivoting at the clock centre
    handCut.group.removeFromParent(); ctx.R.popups.splice(ctx.R.popups.indexOf(handCut), 1);
    const handG = new THREE.Group(); handG.position.set(0, CY, 0.09);
    handG.add(...handCut.pivot.children); clock.add(handG);
    // tap on the clock face -> card
    const faceMesh = clock.cut.mesh; faceMesh.userData.tap = () => app.openCardById('zeitrad');
    clock.pickMeshes = [faceMesh];

    // ---- live display on the page (time + event)
    const cv = displayCanvas(), g = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.1), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    disp.rotation.x = -Math.PI / 2; disp.position.set(6.4, 0.012, 2.1); ctx.R.add(disp);
    let lastKey = '';
    const draw = (h) => {
      const bce = bceOf(h);
      let ev = null; for (const e of EVENTS) { if (Math.abs(bce - e.bce) < 38) ev = e; }
      const era = ERAS.find((e) => bce <= e.from && bce >= e.to) || ERAS[ERAS.length - 1];
      const key = Math.round(bce / 10) + (ev ? ev.id : ''); if (key === lastKey) return; lastKey = key;
      g.clearRect(0, 0, cv.width, cv.height);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#7a1a1a'; g.font = `bold 78px ${SERIF}`; g.fillText(h > 23.99 ? '30 v. Chr.' : h < 0.01 ? '3300 v. Chr.' : fmtBce(bce), cv.width / 2, 66);
      g.fillStyle = '#4a3220'; g.font = `italic 40px ${SERIF}`; g.fillText(era.name, cv.width / 2, 136);
      if (ev) { g.fillStyle = '#a4161a'; g.font = `bold 36px ${SERIF}`; g.fillText('★ ' + ev.label, cv.width / 2, 200); }
      tex.needsUpdate = true;
    };
    draw(0);
    // ---- control: turn the hand
    const ctl = ctx.control('R', { id: 'zeiger', label: 'Zeiger drehen', a: [3.4, 3.35], b: [9.4, 3.35], size: [2.9, 1.0], color: '#b8862d', value: 0, springBack: false, hold: true, ticks: 24 });
    let hourLast = 0, midnight = false;
    ctl.on((v) => {
      v = clamp(v, 0, 1); const h = v * 24; handG.rotation.z = -(v * TAU); draw(h);
      const hi = Math.floor(h);
      if (hi !== hourLast) { hourLast = hi; app.audio.sfx('tick', { rate: Math.abs(v - (ctl._pv ?? v)) }); }
      if (v > 0.995 && !midnight) { midnight = true; app.audio.sfx('gong'); app.fx.burst && 0; }
      if (v < 0.97) midnight = false;
      ctl._pv = v;
    });
    ctl.onTick = (v) => app.audio.sfx('tick', { fast: true });
    if (app.timewin) { app.timewin.attach(ctl); app.timewin.setHour(0); }
    ctx.onUpdate((dt, t) => { if (app.timewin && ctx.spread.active) app.timewin.setHour(ctl.sp.x * 24); });
    // hint: let the hand sweep once when the page appears
    this._hint = true;
    ctx.spread.hintSweep = () => { ctl.touched = true; ctl.setValue(0.07, { silent: false }); setTimeout(() => { if (!ctl.dragging && ctl.v < 0.1) ctl.setValue(0); }, 900); };
  },
  onDeactivate(ctx) { if (ctx.app.timewin) ctx.app.timewin.hide(); },
  onActivate(ctx) { if (ctx.app.timewin) ctx.app.timewin.show(); setTimeout(() => ctx.spread.hintSweep && ctx.spread.active && ctx.spread.hintSweep(), 1700); },
};
