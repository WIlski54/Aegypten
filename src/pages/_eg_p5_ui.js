// Station 5 (Mumienwerkstatt): Daten und Zeichner für die Zeitleiste, den Wasserbalken und die kleinen Beschriftungen.
// Der 70-Tage-Rahmen folgt Herodot; "Trocknen mit Natron" wird mit rund 40 Tagen markiert (neuere Darstellungen).
import * as THREE from 'three';
import { SERIF, INK, roundRect } from '../engine/pagepaint.js';
import { clamp, lerp } from '../engine/util.js';

export const DAYS = 70;
export const PHASES = [
  { id: 'rein', name: 'Reinigung', short: 'Reinigung', d0: 0, d1: 4, col: '#3bb3a8', note: 'Der Körper wird gewaschen und vorbereitet.' },
  { id: 'trock', name: 'Trocknen mit Natron', short: 'Trocknen mit Natron: rund 40 Tage', d0: 4, d1: 44, col: '#c0432e', note: 'Das Salz zieht das Wasser an.' },
  { id: 'wickel', name: 'Salben und Wickeln', short: 'Salben und Wickeln', d0: 44, d1: 66, col: '#d9a62e', note: 'Öle, Harze und Leinenbinden.' },
  { id: 'beis', name: 'Beisetzung', short: 'Beisetzung', d0: 66, d1: 70, col: '#2a5aa0', note: 'Der Trauerzug bringt die Mumie zum Grab.' },
];
export const phaseIndex = (d) => (d < PHASES[1].d0 ? 0 : d < PHASES[2].d0 ? 1 : d < PHASES[3].d0 ? 2 : 3);

// Wassergehalt (schematisch, 1 = anfangs, fällt beim Trocknen stark, danach kaum noch)
export function moisture(d) {
  if (d <= 4) return 1 - 0.04 * (d / 4);
  const m44 = 0.16;
  if (d <= 44) return 0.12 + 0.84 * Math.exp(-(d - 4) * 0.0785);
  return m44 - 0.035 * clamp((d - 44) / 26);
}

// ---------------------------------------------------------------------------------------------------- Leinwand-Meshes
export function canvasPlane(w, h, ppu, { additive = false, opacity = 1, flat = false } = {}) {
  const cv = document.createElement('canvas'); cv.width = Math.round(w * ppu); cv.height = Math.round(h * ppu);
  const g = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  if (flat) mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 3;
  return { mesh, cv, g, tex, mat, S: ppu, w, h, dispose() { tex.dispose(); mat.dispose(); mesh.geometry.dispose(); } };
}

// ---------------------------------------------------------------------------------------------------- Zeitleiste (liegt auf der Seite)
export const STRIP_W = 10.6, STRIP_H = 2.4;
export function drawStrip(P, day, { touched = false } = {}) {
  const key = Math.round(day) + '|' + touched; if (key === P._key) return; P._key = key;
  const { g, S, cv } = P; const u = (v) => v * S;
  g.clearRect(0, 0, cv.width, cv.height);
  const d = Math.round(day), pi = phaseIndex(day), ph = PHASES[pi], m = moisture(day);
  const dark = (c) => (c === '#d9a62e' ? '#8a5f1c' : c);
  // Papierband
  g.save();
  g.shadowColor = 'rgba(40,20,5,.35)'; g.shadowBlur = u(0.08); g.shadowOffsetY = u(0.03);
  g.fillStyle = 'rgba(250,241,218,.97)'; roundRect(g, u(0.1), u(0.06), u(STRIP_W - 0.2), u(STRIP_H - 0.16), u(0.14)); g.fill();
  g.restore();
  g.strokeStyle = 'rgba(139,30,30,.35)'; g.lineWidth = u(0.016); roundRect(g, u(0.2), u(0.16), u(STRIP_W - 0.4), u(STRIP_H - 0.36), u(0.09)); g.stroke();
  const T = (str, x, y, size, { col = INK, bold = false, italic = false, align = 'left' } = {}) => {
    g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${u(size)}px ${SERIF}`; g.fillText(str, u(x), u(y));
  };
  // Kopfzeile: Tag + Phase
  T('Tag', 0.45, 0.62, 0.34, { col: '#6b4a2a', bold: true });
  T(String(d), 1.62, 0.6, 0.78, { col: '#8B1E1E', bold: true });
  T('von 70', 2.58, 0.7, 0.26, { col: '#6b4a2a', italic: true });
  g.strokeStyle = 'rgba(139,30,30,.3)'; g.lineWidth = u(0.014); g.beginPath(); g.moveTo(u(3.9), u(0.34)); g.lineTo(u(3.9), u(0.94)); g.stroke();
  g.fillStyle = ph.col; g.beginPath(); g.arc(u(4.2), u(0.44), u(0.13), 0, 6.283); g.fill();
  T(touched || d > 0 ? ph.name : 'Zieh am Schieber TAGE', 4.45, 0.44, 0.36, { bold: true, col: dark(ph.col) });
  T(touched || d > 0 ? ph.note : 'Wie lange dauert das? Bis zu 70 Tage.', 4.45, 0.82, 0.25, { italic: true, col: '#5a3d22' });
  // Wasserbalken
  T('Wasser im Körper', 0.45, 1.2, 0.27, { bold: true, col: '#2d5a7a' });
  const bx0 = 3.25, bx1 = STRIP_W - 1.6, by = 1.2, bh = 0.32;
  g.fillStyle = 'rgba(60,40,20,.14)'; roundRect(g, u(bx0), u(by - bh / 2), u(bx1 - bx0), u(bh), u(bh / 2)); g.fill();
  const fw = Math.max(bh, (bx1 - bx0) * m);
  const gr = g.createLinearGradient(u(bx0), 0, u(bx1), 0); gr.addColorStop(0, '#2f8fc4'); gr.addColorStop(1, '#6ec6e6');
  g.fillStyle = gr; roundRect(g, u(bx0), u(by - bh / 2), u(fw), u(bh), u(bh / 2)); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; roundRect(g, u(bx0 + 0.06), u(by - bh / 2 + 0.04), u(Math.max(0.05, fw - 0.12)), u(bh * 0.28), u(bh * 0.14)); g.fill();
  g.strokeStyle = 'rgba(40,70,100,.5)'; g.lineWidth = u(0.014); roundRect(g, u(bx0), u(by - bh / 2), u(bx1 - bx0), u(bh), u(bh / 2)); g.stroke();
  T(Math.round(m * 100) + ' %', STRIP_W - 0.5, by, 0.3, { bold: true, align: 'right', col: '#2d5a7a' });
  // Zeitleiste: Abschnitte, Trocknen hervorgehoben
  const tx0 = 0.5, tx1 = STRIP_W - 0.5, ty = 1.72, th = 0.34, k = (tx1 - tx0) / DAYS;
  PHASES.forEach((p, i) => { const a = tx0 + p.d0 * k, b = tx0 + p.d1 * k; g.fillStyle = p.col; g.fillRect(u(a), u(ty - th / 2), u(b - a - 0.03), u(th)); });
  const px = tx0 + clamp(day, 0, DAYS) * k;
  g.fillStyle = 'rgba(250,241,218,.6)'; g.fillRect(u(px), u(ty - th / 2 - 0.01), u(tx1 - px), u(th + 0.02));
  g.strokeStyle = '#7a1f18'; g.lineWidth = u(0.03); g.strokeRect(u(tx0 + PHASES[1].d0 * k), u(ty - th / 2 - 0.025), u((PHASES[1].d1 - PHASES[1].d0) * k - 0.03), u(th + 0.05));
  T('Trocknen mit Natron: rund 40 Tage', tx0 + (PHASES[1].d0 + PHASES[1].d1) / 2 * k, ty, 0.24, { bold: true, align: 'center', col: '#fff6e0' });
  T('Salben, Wickeln', tx0 + (PHASES[2].d0 + PHASES[2].d1) / 2 * k, ty, 0.21, { bold: true, align: 'center', col: '#4a3010' });
  T('Reinigung', tx0, 2.08, 0.22, { bold: true, col: '#2a7f77' });
  T('Beisetzung', tx1, 2.08, 0.22, { bold: true, align: 'right', col: '#2a5aa0' });
  // Marke
  g.fillStyle = '#8B1E1E'; g.beginPath(); g.moveTo(u(px), u(ty - th / 2 - 0.02)); g.lineTo(u(px - 0.13), u(ty - th / 2 - 0.22)); g.lineTo(u(px + 0.13), u(ty - th / 2 - 0.22)); g.closePath(); g.fill();
  g.fillRect(u(px - 0.018), u(ty - th / 2), u(0.036), u(th + 0.06));
  P.tex.needsUpdate = true;
}

// ---------------------------------------------------------------------------------------------------- Namensschild über einem Kanopenkrug
export function drawTag(P, line1, line2, col) {
  const { g, S, cv } = P; const u = (v) => v * S;
  g.clearRect(0, 0, cv.width, cv.height);
  g.save(); g.shadowColor = 'rgba(30,15,5,.4)'; g.shadowBlur = u(0.05); g.shadowOffsetY = u(0.02);
  g.fillStyle = '#f6edd6'; roundRect(g, u(0.03), u(0.03), P.w * S - u(0.06), P.h * S - u(0.08), u(0.09)); g.fill(); g.restore();
  g.fillStyle = col; roundRect(g, u(0.08), u(0.08), P.w * S - u(0.16), P.h * S - u(0.18), u(0.06)); g.fill();
  g.fillStyle = '#fff6df'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 0.24; g.font = `bold ${u(fs)}px ${SERIF}`; while (g.measureText(line1).width > P.w * S - u(0.3) && fs > 0.1) { fs -= 0.01; g.font = `bold ${u(fs)}px ${SERIF}`; }
  g.fillText(line1, P.w * S / 2, P.h * S * 0.38);
  g.font = `italic ${u(0.17)}px ${SERIF}`; g.fillText(line2, P.w * S / 2, P.h * S * 0.72);
  P.tex.needsUpdate = true;
}

// kleiner Hinweis (z. B. "Salz zieht Wasser an")
export function drawNote(P, text, sub, col = '#2a5aa0') {
  const { g, S, cv } = P; const u = (v) => v * S;
  g.clearRect(0, 0, cv.width, cv.height);
  g.save(); g.shadowColor = 'rgba(30,15,5,.4)'; g.shadowBlur = u(0.06); g.shadowOffsetY = u(0.02);
  g.fillStyle = '#fbf3dc'; roundRect(g, u(0.05), u(0.04), P.w * S - u(0.1), P.h * S - u(0.12), u(0.12)); g.fill(); g.restore();
  g.fillStyle = col; roundRect(g, u(0.12), u(0.11), P.w * S - u(0.24), P.h * S - u(0.26), u(0.08)); g.fill();
  g.fillStyle = '#fff8e6'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `bold ${u(0.25)}px ${SERIF}`; g.fillText(text, P.w * S / 2, P.h * S * (sub ? 0.38 : 0.47));
  if (sub) { g.font = `italic ${u(0.17)}px ${SERIF}`; g.fillText(sub, P.w * S / 2, P.h * S * 0.68); }
  P.tex.needsUpdate = true;
}
