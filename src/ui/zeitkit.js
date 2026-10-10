// Werkzeug für die Zeitfenster-Szenen: Papierschnitt-Look auf einer 2D-Leinwand (480 x 300), Hilfsformen, einfache Urmenschen.
import { mulberry32, lerp, clamp, smooth, TAU } from '../engine/util.js';

export const SW = 480, SH = 300;
export { lerp, clamp, smooth, TAU };
export const rng = (seed) => mulberry32(seed);
export const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
export const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

// Papierform: weicher Schlagschatten, heller Schnittrand
export function paper(g, fill, path, o = {}) {
  g.save();
  if (o.shadow !== false) { g.shadowColor = o.shCol || 'rgba(30,12,4,.38)'; g.shadowOffsetX = o.sx ?? 1.5; g.shadowOffsetY = o.sy ?? 2.5; g.shadowBlur = o.blur ?? 2; }
  g.fillStyle = fill; g.beginPath(); path(g); g.fill();
  g.shadowColor = 'transparent';
  if (o.edge !== false) { g.lineWidth = o.lw ?? 1.1; g.strokeStyle = o.edgeCol || 'rgba(255,245,220,.7)'; g.stroke(); }
  g.restore();
}
export function vgrad(g, stops, y0 = 0, y1 = SH) {
  const gr = g.createLinearGradient(0, y0, 0, y1); for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(0, y0, SW, y1 - y0);
}
export function circle(g, x, y, r) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); }
export function glow(g, x, y, r, col, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
}
// Hügel-/Wellenband von links nach rechts, unten geschlossen
export function ridge(g, base, amp, freq, ph, fill, o = {}) {
  paper(g, fill, (c) => {
    c.moveTo(-10, SH + 10);
    for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, base + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 2.3 + ph * 1.7) * amp * 0.4);
    c.lineTo(SW + 10, SH + 10); c.closePath();
  }, o);
}
export function ellipse(g, x, y, rx, ry, rot = 0) { g.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); g.ellipse(x, y, rx, ry, rot, 0, TAU); }
// Gliedmaße als dicke Linie mit hellem Rand
export function limb(g, pts, w, col, edge = true) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const trace = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
  if (edge) { trace(); g.lineWidth = w + 2; g.strokeStyle = 'rgba(255,245,220,.55)'; g.stroke(); }
  trace(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); g.restore();
}
export function stars(g, list, t, a = 1) {
  for (let i = 0; i < list.length; i++) { const s = list[i]; g.fillStyle = `rgba(255,248,230,${(0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * s[3] + s[4]))) * a})`; g.fillRect(s[0], s[1], s[2], s[2]); }
}
export function makeStars(n, seed, ymax = SH) { const r = rng(seed), out = []; for (let i = 0; i < n; i++) out.push([r() * SW, r() * ymax, r() < 0.15 ? 2 : 1, 0.8 + r() * 2, r() * 6]); return out; }

// Urmensch (Fußpunkt x,y; Höhe ca. 60 * s; dir = +1 blickt nach rechts)
// pose: 'walk' (ph = Schrittphase), 'knap' (ph = Schlag 0..1), 'sit', 'stand'
export function hominid(g, x, y, s, dir, pose, ph, o = {}) {
  const skin = o.skin || '#8a5a3a', hair = o.hair || '#3a2316', shade = o.light ? o.light : null;
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  let hip, sh, head, legs = [], arms = [];
  if (pose === 'walk') {
    hip = [0, -30]; sh = [3, -50]; head = [6, -57];
    for (let k = 0; k < 2; k++) {
      const p = ph + k * Math.PI, a = Math.sin(p) * 0.6, b = Math.max(0, -Math.cos(p)) * 0.9;
      const knee = [hip[0] + Math.sin(a) * 15 + 2, hip[1] + Math.cos(a) * 15], foot = [knee[0] + Math.sin(a - b) * 15, knee[1] + Math.cos(a - b) * 15];
      legs.push([hip, knee, foot]);
      const aa = Math.sin(p + Math.PI) * 0.7; arms.push([[sh[0], sh[1] + 2], [sh[0] + Math.sin(aa) * 8, sh[1] + 10 + Math.cos(aa) * 4], [sh[0] + Math.sin(aa) * 12 + 1, sh[1] + 20]]);
    }
  } else if (pose === 'knap') {
    const hit = Math.pow(Math.sin(clamp(ph) * Math.PI), 2);
    hip = [-4, -13]; sh = [8, -30]; head = [15, -34];
    legs.push([hip, [8, -22], [14, -2]], [hip, [4, -18], [8, -1]]);
    const hand = [26 + hit * 3, -30 + hit * 24];
    arms.push([[sh[0], sh[1] + 2], [sh[0] + 12, sh[1] - 2 + (1 - hit) * -8], hand], [[sh[0], sh[1] + 3], [sh[0] + 9, sh[1] + 12], [27, -9]]);
  } else if (pose === 'sit') {
    hip = [0, -7]; sh = [1, -29]; head = [3, -36];
    legs.push([hip, [12, -19], [15, -1]], [hip, [9, -16], [11, -1]]);
    arms.push([[sh[0], sh[1] + 2], [8, -16], [13, -21]]);
  } else { hip = [0, -30]; sh = [1, -50]; head = [2, -57]; legs.push([hip, [1, -15], [1, 0]], [hip, [-3, -15], [-3, 0]]); arms.push([[sh[0], sh[1] + 2], [-3, -33], [-3, -22]]); }
  const col = shade || skin;
  for (const l of legs) limb(g, l, 7, col);
  limb(g, [hip, sh], 12, col);
  for (const a of arms) limb(g, a, 5, col);
  g.fillStyle = col; g.beginPath(); g.arc(head[0], head[1], 6.4, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,245,220,.55)'; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = hair; g.beginPath(); g.arc(head[0] - 1.6, head[1] - 2, 6.6, Math.PI * 0.95, Math.PI * 2.05); g.fill();
  if (o.bun) { g.beginPath(); g.arc(head[0] - 6, head[1] - 3, 3.2, 0, TAU); g.fill(); }
  g.fillStyle = '#1a0f08'; g.beginPath(); g.arc(head[0] + 3.2, head[1] - 0.6, 0.9, 0, TAU); g.fill();
  g.restore();
}
