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

// ================================================================================================
// Ägypten-Werkzeug (angehängt): Palette, Menschen im Wandmalerei-Profil, Kronen, Bauwerke, Pflanzen, Wasser, Schiffe
// ================================================================================================
export const EG = {
  skinM: '#b5693a', skinF: '#d9a95a', linen: '#f6efe0', linenSh: '#d9cdb4', wig: '#1c1816',
  gold: '#e0b040', goldHi: '#fff0b3', goldDk: '#8a5f1c', lapis: '#2a5aa0', turq: '#3bb3a8', carn: '#c0432e',
  papyrus: '#5b9a4b', nile: '#3f8f5a', sand: '#d9b97a', mud: '#b9824f',
};
const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
// Farbton ändern: k > 0 dunkler (warm), k < 0 heller (cremig); Eingabe und Ausgabe '#rrggbb'
export function tone(c, k) { const a = hex(c); return toHex(k >= 0 ? mixc(a, [34, 18, 8], k) : mixc(a, [255, 248, 230], -k)); }
// Maßstab der Leinwand (Geräte-Pixel je Szenen-Einheit), damit Schlagschatten mit der Auflösung mitwachsen
export function gk(g) { const m = g.getTransform(); return Math.hypot(m.a, m.b) || 1; }
// Papierform wie paper(), aber mit auflösungsunabhängigem Schatten (K = gk(g) vor dem Skalieren)
export function cut(g, fill, path, o = {}) {
  const K = o.K || gk(g);
  g.save();
  if (o.shadow !== false) { g.shadowColor = o.shCol || 'rgba(30,12,4,.36)'; g.shadowOffsetX = (o.sx ?? 1.2) * K; g.shadowOffsetY = (o.sy ?? 2) * K; g.shadowBlur = (o.blur ?? 1.6) * K; }
  g.fillStyle = fill; g.beginPath(); path(g); g.fill();
  g.shadowColor = 'transparent';
  if (o.edge !== false) { g.lineWidth = o.lw ?? 0.9; g.strokeStyle = o.edgeCol || 'rgba(255,245,220,.62)'; g.lineJoin = 'round'; g.stroke(); }
  g.restore();
}
function ik(sx, sy, hx, hy, l1, l2, bend) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 0.001; const m = l1 + l2 - 0.05;
  if (d > m) { dx *= m / d; dy *= m / d; d = m; hx = sx + dx; hy = sy + dy; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a)), ux = dx / d, uy = dy / d;
  return [[sx, sy], [sx + ux * a - uy * hh * bend, sy + uy * a + ux * hh * bend], [hx, hy]];
}

// ---- Kronen (Ursprung: Mitte der Kopfoberseite, Blick nach rechts, Einheit ~ Kopfbreite 10)
function uraeusDraw(g, x, y, k = 1) {
  g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = EG.gold; g.strokeStyle = EG.goldDk; g.lineWidth = 0.5;
  g.beginPath(); g.moveTo(-1.2, 2); g.quadraticCurveTo(-1.6, -1, -0.3, -2.2); g.quadraticCurveTo(0.8, -3.2, 1.7, -2.3); g.quadraticCurveTo(1.2, -1.2, 1.1, 0); g.quadraticCurveTo(1.4, 1.4, 0.8, 2); g.closePath(); g.fill(); g.stroke(); g.restore();
}
export function crownDraw(g, kind) {
  const red = () => {
    g.save(); g.lineJoin = 'round';
    const path = (c) => { c.moveTo(-6.4, 1.2); c.lineTo(-6.9, -21.5); c.quadraticCurveTo(-4.5, -25, -1.2, -22.4); c.lineTo(1.4, -9); c.quadraticCurveTo(3.8, -6, 4.9, -4); c.quadraticCurveTo(6, -1.5, 5.6, 1.2); c.closePath(); };
    cut(g, EG.carn, path, { sx: 0.8, sy: 1.1, blur: 1, lw: 0.7 });
    g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.moveTo(-6.4, 1); g.lineTo(-6.8, -21); g.lineTo(-5.3, -22); g.lineTo(-5, 1); g.fill();
    g.fillStyle = 'rgba(80,10,5,.22)'; g.beginPath(); g.moveTo(-1.2, -22); g.lineTo(1.4, -9); g.quadraticCurveTo(3.8, -6, 4.9, -4); g.lineTo(2.6, -9); g.lineTo(0.2, -22); g.fill();
    // Spirale vorn
    g.strokeStyle = tone(EG.carn, 0.3); g.lineWidth = 0.75; g.beginPath(); g.moveTo(4.2, -5.2); g.quadraticCurveTo(7.2, -9, 7.6, -14.5); g.stroke();
    g.beginPath(); g.arc(7.6, -15.9, 1.4, 1.6, 7.4); g.stroke();
    g.restore();
  };
  const white = (dx = 0) => {
    g.save(); g.translate(dx, 0); g.lineJoin = 'round';
    const path = (c) => { c.moveTo(-5, 1); c.quadraticCurveTo(-4.7, -9, -2.6, -15); c.quadraticCurveTo(-5.2, -18.5, -3.6, -22.5); c.quadraticCurveTo(0, -28, 3.6, -22.5); c.quadraticCurveTo(5.2, -18.5, 2.6, -15); c.quadraticCurveTo(4.7, -9, 5, 1); c.closePath(); };
    cut(g, EG.linen, path, { sx: 0.8, sy: 1.1, blur: 1, lw: 0.7, edgeCol: 'rgba(120,100,60,.45)' });
    g.fillStyle = 'rgba(120,100,60,.2)'; g.beginPath(); g.moveTo(1.2, -26.4); g.quadraticCurveTo(5.2, -18.5, 2.6, -15); g.quadraticCurveTo(4.7, -9, 5, 1); g.lineTo(1.4, 1); g.quadraticCurveTo(2.8, -10, 0.6, -15); g.quadraticCurveTo(3.4, -19, 1.2, -26.4); g.fill();
    g.restore();
  };
  if (kind === 'rot') red();
  else if (kind === 'weiss') white();
  else if (kind === 'doppel') { red(); white(0.8); }
  else if (kind === 'blau') {
    g.save(); const path = (c) => { c.moveTo(-5.4, 1); c.quadraticCurveTo(-6.6, -8, -4, -12.5); c.quadraticCurveTo(-0.5, -15.6, 3.4, -12.2); c.quadraticCurveTo(5.6, -6, 5.4, 1); c.closePath(); };
    cut(g, EG.lapis, path, { sx: 0.8, sy: 1.1, blur: 1, lw: 0.7 }); g.fillStyle = EG.gold;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(-3.4 + i * 1.5 + (j % 2) * 0.7, -1.5 - j * 3.4, 0.45, 0, TAU); g.fill(); }
    g.restore();
  }
}
// Kronen-Symbol frei platzieren (x,y = Mitte der Unterkante)
export function crownIcon(g, x, y, s, kind, dir = 1) { g.save(); g.translate(x, y); g.scale(dir * s, s); crownDraw(g, kind); uraeusDraw(g, 5.2, -2.2, 0.8); g.restore(); }

// ---- Mensch im Profil der Wandmalerei. Fußpunkt (x,y), Höhe ca. 65 * s, dir = +1 blickt nach rechts.
// pose: 'stand' | 'walk' | 'pull' | 'carry' | 'sit' | 'raise' | 'offer' | 'point' | 'row' | 'pour' | 'bend'
// ph = Schrittphase (rad). o: sex ('m'|'f'), skin, dress, kilt (Farbe), wig ('short'|'long'|false), head ('nemes'|'rot'|'weiss'|'doppel'|'blau'|'band'),
//    beard, collar, hold ('staff'|'regalia'|'jarHead'|'basketHead'|'lotus'|'fan'|'ankh'|'tray'|'scroll'|'sack'|'pole'), belt, apron, handA/handB [dx,dy] (Schulter-relativ), lean, child
// Rückgabe: { hand:[x,y] (nahe Hand), hand2, head:[x,y] (Kopfoberseite), top } in Leinwandkoordinaten
export function egyptian(g, x, y, s, dir, pose, ph, o = {}) {
  const K = gk(g), F = o.sex === 'f' || !!o.dress;
  const skin = o.skin || (F ? EG.skinF : EG.skinM), skinD = tone(skin, 0.2), lin = o.kilt || EG.linen, linD = tone(lin, 0.1);
  let hipY = -31, lean = 0, bob = 0, fFar, fNear, hFar = [-2, 21], hNear = [2, 21];
  const stride = (a, k) => { const p = ph + k; return [Math.sin(p) * a, Math.max(0, Math.cos(p)) * (a * 0.55)]; };
  if (pose === 'walk' || pose === 'carry' || pose === 'pull') {
    const a = pose === 'pull' ? 8 : 9; fNear = stride(a, 0); fFar = stride(a, Math.PI);
    if (pose === 'walk') { hNear = [-Math.sin(ph) * 8 + 1, 20]; hFar = [Math.sin(ph) * 8, 20]; }
    if (pose === 'carry') { hNear = [2, -13.5]; hFar = [Math.sin(ph) * 6, 20]; }
    if (pose === 'pull') { lean = 0.42; hipY = -29.5; hNear = [15.5, 6]; hFar = [13.5, 5]; }
    bob = Math.abs(Math.sin(ph)) * -0.7;
  } else if (pose === 'sit') { hipY = -17; fNear = [15, 0]; fFar = [13.5, 0]; hNear = [9, 17]; hFar = [8, 17]; }
  else if (pose === 'bend') { lean = 0.5; hipY = -29; fNear = [3, 0]; fFar = [-3, 0]; hNear = [14, 14]; hFar = [12, 14]; }
  else {
    fNear = [3, 0]; fFar = [-3, 0];
    if (pose === 'raise') { hNear = [13, -8 + Math.sin(ph) * 1.2]; hFar = [11.5, -6 - Math.sin(ph) * 1.2]; }
    else if (pose === 'offer') { hNear = [14, 5 + Math.sin(ph) * 0.8]; hFar = [11, 7]; }
    else if (pose === 'point') { hNear = [18, -3 + Math.sin(ph) * 0.8]; }
    else if (pose === 'pour') { hNear = [13, 6]; hFar = [8, 10]; }
    else if (pose === 'row') { hNear = [11 + Math.sin(ph) * 5, 8 + Math.cos(ph) * 3]; hFar = [10 + Math.sin(ph) * 5, 7 + Math.cos(ph) * 3]; }
    else if (pose === 'stand') { hNear = [2.5 + Math.sin(ph) * 0.6, 21]; }
  }
  if (o.lean != null) lean = o.lean; if (o.handA) hNear = o.handA; if (o.handB) hFar = o.handB;
  if (o.hold === 'staff' && !o.handA) hNear = [10, 14];
  const cl = Math.cos(lean), sl = Math.sin(lean), P = (px, py) => [px * cl - py * sl, hipY + bob + px * sl + py * cl];
  const S = P(0.6, -19), rel = (v) => [S[0] + v[0] * cl - v[1] * sl, S[1] + v[0] * sl + v[1] * cl];
  const hc = P(1.6, -27.6), headScale = o.child ? 1.2 : 1;
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  const W = (p) => [x + dir * s * p[0], y + s * p[1]];
  const sh = { K, sx: 1, sy: 1.6, blur: 1.3, lw: 0.7 };
  const armPts = (hand) => { const H = rel(hand); return ik(S[0], S[1], H[0], H[1], 11, 11, 1); };
  const legPts = (f, hipX) => ik(hipX, hipY + bob, f[0], -1.6 - f[1], 16, 16, -1);
  // 1 ferner Arm, 2 Beine
  if (o.cloak) { // Umhang hinter dem Körper (Schultern bis Waden), flattert beim Gehen
    const fl = (pose === 'walk' ? Math.sin(ph) * 2 : 0) + 1;
    cut(g, o.cloak, (c) => { const a = P(-1.5, -20.5), b = P(2, -20.5), d = P(-6 - fl, 14), e = P(-11 - fl * 1.5, 12); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1] + 6); c.lineTo(e[0], e[1] + 8); c.closePath(); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  }
  const aFar = armPts(hFar); limb(g, aFar, 3.6, skinD);
  const longDress = F && pose !== 'sit' && o.longDress !== false;
  const lFar = legPts(fFar, -1), lNear = legPts(fNear, 1);
  limb(g, [...lFar, [lFar[2][0] + 4.5, lFar[2][1]]], 4.1, skinD); limb(g, [...lNear, [lNear[2][0] + 4.5, lNear[2][1]]], 4.3, skin);
  // 3 Rumpf
  const tp = [[-4, 0], [4, 0], [3.2, -8], [5.4, -15.5], [5, -19.4], [3, -21.2], [-1.6, -21.2], [-5.2, -18.8], [-5.2, -12], [-3.6, -6]];
  cut(g, skin, (c) => { tp.forEach((q, i) => { const v = P(q[0], q[1]); i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]); }); c.closePath(); }, sh);
  { const a = P(0.2, -18.5), b = P(1.1, -24.5); limb(g, [a, b], 4.6, skin, false); }
  // 4 Schurz oder Kleid
  if (longDress) {
    const sw = Math.sin(ph) * (pose === 'walk' || pose === 'carry' ? 1.8 : 0.4);
    cut(g, lin, (c) => { const a = P(-3.9, -17.5), b = P(4.5, -16.8); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(5.2, -12); c.lineTo(6.4 + sw, -1.2); c.lineTo(-5 + sw * 0.4, -1.2); c.lineTo(-4.6, -12); c.closePath(); }, sh);
    g.strokeStyle = linD; g.lineWidth = 0.5; g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(-3 + i * 2.6, -20); g.lineTo(-3.6 + i * 3 + sw * 0.3, -2); } g.stroke();
    g.fillStyle = o.belt || EG.carn; const b0 = P(-4, -3), b1 = P(4.6, -3); g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.lineTo(b1[0], b1[1] + 2.4); g.lineTo(b0[0], b0[1] + 2.4); g.fill();
  } else if (!o.naked) {
    const sw = pose === 'walk' || pose === 'carry' || pose === 'pull' ? Math.sin(ph) * 1.1 : 0;
    cut(g, lin, (c) => { const a = P(-3.9, -2), b = P(4.5, -2), d = P(9.6 + sw, 14), e = P(-2.6, 13.4); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); }, sh);
    g.strokeStyle = linD; g.lineWidth = 0.45; g.beginPath(); for (let i = 0; i < 4; i++) { const a = P(-2.4 + i * 1.8, -1), d = P(-1 + i * 2.8 + sw, 13); g.moveTo(a[0], a[1]); g.lineTo(d[0], d[1]); } g.stroke();
    g.fillStyle = o.belt || EG.gold; const b0 = P(-4, -3.6), b1 = P(4.6, -3.6); g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.lineTo(b1[0], b1[1] + 2.4); g.lineTo(b0[0], b0[1] + 2.4); g.fill();
    if (o.apron) { const a = P(4.2, -2), b = P(10.6, 6), d = P(4.4, 10); g.fillStyle = EG.gold; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill(); }
  }
  // Kragen
  if (o.collar) {
    const cs = o.collar === 'gold' ? [EG.gold, EG.goldDk, EG.gold] : [EG.gold, EG.lapis, EG.turq, EG.carn];
    const c0 = P(0.9, -19.8);
    for (let i = 0; i < cs.length; i++) { const r = 6.6 - i * 1.5; g.fillStyle = cs[i]; g.beginPath(); g.ellipse(c0[0], c0[1], r * 0.75, r, lean, 0, Math.PI); g.fill(); }
    g.fillStyle = skin; g.beginPath(); g.ellipse(c0[0], c0[1] - 0.2, 2.4 * 0.75, 2.4, lean, 0, Math.PI); g.fill();
  }
  // 5 Kopf
  g.save(); g.translate(hc[0], hc[1]); g.rotate(lean * 0.6); if (headScale !== 1) g.scale(headScale, headScale);
  const head = o.head;
  const headPath = (c) => { c.moveTo(-4.8, -0.5); c.bezierCurveTo(-5, -4.8, -1.6, -6.6, 1.6, -6.3); c.quadraticCurveTo(4.3, -6, 4.9, -3.6); c.lineTo(5.6, -1.6); c.lineTo(7.9, 1.1); c.lineTo(6.0, 2.0); c.lineTo(6.2, 2.9); c.lineTo(5.6, 3.5); c.lineTo(5.7, 4.5); c.quadraticCurveTo(5.3, 5.8, 3.6, 5.9); c.lineTo(0.3, 5.9); c.quadraticCurveTo(-3.8, 5.6, -4.6, 2.5); c.closePath(); };
  cut(g, skin, headPath, sh);
  if (head === 'nemes') {
    const nem = (c) => { c.moveTo(5.2, -3.9); c.bezierCurveTo(5.4, -7.8, 0.8, -9, -3.2, -7.8); c.bezierCurveTo(-7.4, -6.6, -8.4, -0.5, -7.8, 3.6); c.lineTo(-8.6, 13.6); c.lineTo(-1.5, 12.8); c.lineTo(-1.3, 4); c.quadraticCurveTo(0.4, 2.4, 0.5, -1); c.lineTo(0.6, -2.4); c.quadraticCurveTo(2.6, -3.8, 5.2, -3.9); };
    const lap = (c) => { c.moveTo(-0.4, 4.2); c.lineTo(2.9, 4.4); c.lineTo(3.6, 14.2); c.lineTo(-0.1, 14.4); c.closePath(); };
    for (const pth of [nem, lap]) {
      cut(g, EG.gold, pth, { K, sx: 0.8, sy: 1, blur: 1, lw: 0.6 });
      g.save(); g.beginPath(); pth(g); g.clip(); g.fillStyle = EG.lapis; for (let yy = -9.4; yy < 15; yy += 2.4) g.fillRect(-10, yy, 16, 1.15); g.restore();
    }
  } else if (head === 'band') {
    cut(g, EG.linen, (c) => { c.moveTo(-5.2, -3.6); c.bezierCurveTo(-5.4, -7.6, 1, -9, 4.6, -5.4); c.lineTo(4.9, -3.4); c.lineTo(-5.2, -2.6); c.closePath(); }, sh);
  } else if (o.wig !== false && !(head === 'rot' || head === 'weiss' || head === 'doppel' || head === 'blau') || o.wig) {
    const lg = (o.wig || (F ? 'long' : 'short')) === 'long';
    cut(g, o.hair || EG.wig, (c) => {
      c.moveTo(5.0, -3.6); c.bezierCurveTo(5.4, -7.6, 1, -8.8, -2.6, -7.6); c.bezierCurveTo(-6.8, -6.4, -7.4, -1, -7, lg ? 6 : 4.4);
      if (lg) { c.lineTo(-7.6, 13.4); c.lineTo(-1.6, 12.8); c.lineTo(-1.2, 5); } else c.lineTo(-1.2, 4.6);
      c.quadraticCurveTo(0.4, 2.2, 0.6, -0.8); c.lineTo(0.6, -2.4); c.quadraticCurveTo(2.6, -3.7, 5.0, -3.6);
    }, { K, sx: 0.8, sy: 1, blur: 1, lw: 0.6, edgeCol: 'rgba(255,245,220,.4)' });
    if (o.bun) { g.fillStyle = o.hair || EG.wig; g.beginPath(); g.arc(-7.4, 3.2, 3.6, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,245,220,.35)'; g.lineWidth = 0.5; g.stroke(); }
    if (F && o.hairband !== false && !o.diadem) { g.fillStyle = o.hairband || EG.turq; g.beginPath(); g.moveTo(-6.6, -3.4); g.lineTo(4.6, -3.7); g.lineTo(4.8, -2.4); g.lineTo(-6.7, -1.7); g.fill(); }
  }
  if (head === 'rot' || head === 'weiss' || head === 'doppel' || head === 'blau') {
    cut(g, EG.wig, (c) => { c.moveTo(4.6, -4); c.bezierCurveTo(5, -6.6, 1, -7.8, -2.6, -7); c.bezierCurveTo(-6.4, -6, -7, -1, -6.8, 4.4); c.lineTo(-1.2, 4.6); c.quadraticCurveTo(0.4, 2.2, 0.6, -0.8); c.lineTo(0.6, -2.4); c.quadraticCurveTo(2.6, -3.7, 4.6, -4); }, { K, sx: 0.6, sy: 0.8, blur: 0.8, lw: 0.5, edgeCol: 'rgba(255,245,220,.35)' });
    g.save(); g.translate(0, -5.5); crownDraw(g, head); g.restore();
  }
  if (head === 'hoch') { // hohe flache Krone (Nofretete-Stil)
    cut(g, EG.lapis, (c) => { c.moveTo(-6.2, -4.4); c.lineTo(-7.2, -17); c.lineTo(3.4, -17.6); c.lineTo(5, -4.8); c.closePath(); }, { K, sx: 0.8, sy: 1, blur: 1, lw: 0.6 });
    g.fillStyle = EG.gold; g.beginPath(); g.moveTo(-6.2, -4.4); g.lineTo(-6.45, -7.4); g.lineTo(5.1, -7.8); g.lineTo(5, -4.8); g.fill();
    g.fillStyle = EG.carn; g.fillRect(-7, -15, 10.2, 1.3);
  }
  if (o.diadem) { g.fillStyle = typeof o.diadem === 'string' ? o.diadem : EG.gold; g.beginPath(); g.moveTo(-6.6, -3.2); g.quadraticCurveTo(-1, -6.2, 5, -4.6); g.lineTo(5.1, -3.2); g.quadraticCurveTo(-1, -4.8, -6.7, -1.7); g.closePath(); g.fill(); }
  if (head === 'nemes' || head === 'rot' || head === 'weiss' || head === 'doppel' || head === 'blau' || head === 'hoch' || o.diadem === true) uraeusDraw(g, 5.6, o.diadem ? -4.4 : -5.6, 0.75);
  if (o.beard) { cut(g, o.beard === true ? EG.lapis : o.beard, (c) => { c.moveTo(4.4, 5); c.lineTo(6.2, 5.2); c.lineTo(6.0, 12); c.lineTo(4.8, 12.4); c.closePath(); }, { K, sx: 0.7, sy: 1, blur: 0.8, lw: 0.5 }); }
  // Auge: Mandel mit Lidstrich bis zur Schläfe
  g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(3.1, -1.7, 1.5, 0.85, 0.06, 0, TAU); g.fill();
  g.fillStyle = '#16100c'; g.beginPath(); g.arc(3.6, -1.7, 0.65, 0, TAU); g.fill();
  g.strokeStyle = '#16100c'; g.lineWidth = 0.55; g.lineCap = 'round'; g.beginPath(); g.moveTo(4.5, -1.8); g.quadraticCurveTo(1, -2.6, -2.2, -2.1); g.stroke();
  g.beginPath(); g.moveTo(1.4, -3.6); g.lineTo(4.8, -3.4); g.stroke();
  g.strokeStyle = tone(skin, 0.45); g.lineWidth = 0.4; g.beginPath(); g.moveTo(5.9, 2.9); g.lineTo(5.2, 3.2); g.stroke();
  g.restore();
  // 6 naher Arm
  const aNear = armPts(hNear); limb(g, aNear, 4.1, skin);
  const hd = aNear[2]; g.fillStyle = skin; g.beginPath(); g.arc(hd[0], hd[1], 2, 0, TAU); g.fill();
  if (pose === 'pull') { const hf = aFar[2]; g.fillStyle = skinD; g.beginPath(); g.arc(hf[0], hf[1], 1.9, 0, TAU); g.fill(); }
  // 7 Gegenstände in der Hand
  const hold = o.hold, wood = '#7a4f2a';
  if (hold === 'staff') { g.strokeStyle = wood; g.lineWidth = 1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(hd[0], hd[1] + 31); g.lineTo(hd[0], hd[1] - 22); g.stroke(); g.fillStyle = EG.gold; g.beginPath(); g.arc(hd[0], hd[1] - 22, 1.8, 0, TAU); g.fill(); }
  else if (hold === 'pole') { g.strokeStyle = wood; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(hd[0] - 6, hd[1] + 6); g.lineTo(hd[0] + 18, hd[1] - 5); g.stroke(); }
  else if (hold === 'regalia') {
    g.lineCap = 'round'; g.strokeStyle = EG.gold; g.lineWidth = 1.5; g.beginPath(); g.moveTo(hd[0] - 4, hd[1] + 7); g.lineTo(hd[0] + 2, hd[1] - 9); g.stroke();
    g.beginPath(); g.moveTo(hd[0] + 2, hd[1] - 9); g.quadraticCurveTo(hd[0] + 7, hd[1] - 11, hd[0] + 5, hd[1] - 6); g.stroke();
    g.strokeStyle = EG.lapis; g.lineWidth = 0.9; g.beginPath(); g.moveTo(hd[0] - 3.4, hd[1] + 5.5); g.lineTo(hd[0] + 1.6, hd[1] - 7.5); g.stroke();
    g.strokeStyle = EG.gold; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hd[0] - 3, hd[1] - 8); g.lineTo(hd[0] + 3, hd[1] + 6); g.stroke();
    g.strokeStyle = EG.carn; g.lineWidth = 0.9; for (const k of [-1.4, 0, 1.4]) { g.beginPath(); g.moveTo(hd[0] - 3, hd[1] - 8); g.lineTo(hd[0] - 6 + k, hd[1] - 2); g.stroke(); }
  } else if (hold === 'ankh') { g.strokeStyle = EG.gold; g.lineWidth = 1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(hd[0], hd[1]); g.lineTo(hd[0], hd[1] + 9); g.moveTo(hd[0] - 3.2, hd[1] + 3.5); g.lineTo(hd[0] + 3.2, hd[1] + 3.5); g.stroke(); g.beginPath(); g.ellipse(hd[0], hd[1] - 2.2, 2, 2.6, 0, 0, TAU); g.stroke(); }
  else if (hold === 'lotus') { g.strokeStyle = EG.papyrus; g.lineWidth = 1; g.beginPath(); g.moveTo(hd[0], hd[1]); g.lineTo(hd[0] + 3, hd[1] - 8); g.stroke(); g.fillStyle = '#9ec7ee'; g.strokeStyle = EG.lapis; g.lineWidth = 0.5; for (const a of [-0.6, 0, 0.6]) { g.save(); g.translate(hd[0] + 3, hd[1] - 8); g.rotate(a); g.beginPath(); g.ellipse(0, -2.8, 1.4, 3.2, 0, 0, TAU); g.fill(); g.stroke(); g.restore(); } }
  else if (hold === 'scroll') { g.fillStyle = '#efe2b8'; g.strokeStyle = '#a8895a'; g.lineWidth = 0.5; g.beginPath(); g.roundRect(hd[0] - 1.6, hd[1] - 3, 3.2, 7.5, 1.2); g.fill(); g.stroke(); }
  else if (hold === 'tray') { cut(g, EG.mud, (c) => c.roundRect(hd[0] - 6, hd[1] + 1, 13, 2, 1), { K, sx: 0.5, sy: 0.8, blur: 0.6, lw: 0.4 }); g.fillStyle = '#e9c27a'; g.beginPath(); g.ellipse(hd[0] - 2.6, hd[1] - 0.6, 2.4, 1.8, 0, Math.PI, 0); g.fill(); g.fillStyle = EG.carn; g.beginPath(); g.arc(hd[0] + 3, hd[1] - 0.6, 1.9, 0, TAU); g.fill(); }
  else if (hold === 'jarHead' || hold === 'basketHead') {
    const top = P(1.4, -34.6);
    if (hold === 'jarHead') cut(g, '#c98a56', (c) => { c.moveTo(top[0] - 2.4, top[1]); c.quadraticCurveTo(top[0] - 6.5, top[1] - 5, top[0] - 2.6, top[1] - 11); c.lineTo(top[0] - 1.9, top[1] - 13); c.lineTo(top[0] + 1.9, top[1] - 13); c.lineTo(top[0] + 2.6, top[1] - 11); c.quadraticCurveTo(top[0] + 6.5, top[1] - 5, top[0] + 2.4, top[1]); c.closePath(); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
    else { cut(g, '#d6b26a', (c) => { c.moveTo(top[0] - 5.4, top[1] - 8); c.lineTo(top[0] - 3.2, top[1]); c.lineTo(top[0] + 3.2, top[1]); c.lineTo(top[0] + 5.4, top[1] - 8); c.closePath(); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 }); g.fillStyle = '#e9d9a8'; g.beginPath(); g.ellipse(top[0] - 2, top[1] - 9.4, 2.5, 2.2, 0, 0, TAU); g.ellipse(top[0] + 2, top[1] - 9.6, 2.4, 2.2, 0, 0, TAU); g.fill(); }
  } else if (hold === 'sack') { cut(g, '#d8c79a', (c) => { c.ellipse(hd[0] - 5, hd[1] - 10, 7.5, 5.2, -0.3, 0, TAU); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 }); }
  else if (hold === 'fan') {
    g.strokeStyle = wood; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(hd[0] - 1, hd[1] + 12); g.lineTo(hd[0] + 3, hd[1] - 20); g.stroke();
    const fx = hd[0] + 3, fy = hd[1] - 20, sw = Math.sin(ph) * 0.12;
    for (let i = 0; i < 7; i++) { const a = -0.2 + sw - (i / 6) * 1.7; g.save(); g.translate(fx, fy); g.rotate(a - 0.5); g.fillStyle = i % 2 ? '#fff4e6' : '#fffaf2'; g.strokeStyle = 'rgba(120,100,60,.45)'; g.lineWidth = 0.4; g.beginPath(); g.ellipse(8, 0, 9, 2.6, 0, 0, TAU); g.fill(); g.stroke(); g.restore(); }
    g.fillStyle = EG.gold; g.beginPath(); g.arc(fx, fy, 1.7, 0, TAU); g.fill();
  }
  g.restore();
  return { hand: W(hd), hand2: W(aFar[2]), head: W(P(1.6, -34)), top: y - 65 * s, W };
}

// ---- Pyramiden und Stufen (Dreiviertelansicht): Zentrum (cx,cy) der Grundfläche, Breite w, Höhe h, r = Verkleinerung nach oben (0 = Spitze)
export function frustum(g, cx, cy, w, h, r, o = {}) {
  const K = o.K || gk(g), lit = o.lit || '#e9d3a0', dark = o.dark || '#b8975f', topc = o.top || tone(lit, -0.12);
  const Fp = [cx + 0.08 * w, cy + 0.065 * w], L = [cx - 0.5 * w, cy + 0.005 * w], R = [cx + 0.5 * w, cy - 0.005 * w], B = [cx - 0.08 * w, cy - 0.065 * w];
  const up = (p) => [cx + (p[0] - cx) * r, cy + (p[1] - cy) * r - h];
  const Ft = up(Fp), Lt = up(L), Rt = up(R), Bt = up(B);
  const face = (a, b, c, d, col, sh) => cut(g, col, (q) => { q.moveTo(a[0], a[1]); q.lineTo(b[0], b[1]); q.lineTo(c[0], c[1]); q.lineTo(d[0], d[1]); q.closePath(); }, { K, shadow: sh, lw: o.lw ?? 0.7, edgeCol: o.edgeCol || 'rgba(255,245,220,.5)', sx: 1.4, sy: 2, blur: 2 });
  face(L, Fp, Ft, Lt, lit, o.shadow !== false); face(Fp, R, Rt, Ft, dark, false);
  if (r > 0.001) face(Lt, Ft, Rt, Bt, topc, false);
  if (o.courses) {
    g.save(); g.lineWidth = 0.5;
    for (let i = 1; i < o.courses; i++) {
      const f = i / o.courses, a = [L[0] + (Lt[0] - L[0]) * f, L[1] + (Lt[1] - L[1]) * f], b = [Fp[0] + (Ft[0] - Fp[0]) * f, Fp[1] + (Ft[1] - Fp[1]) * f], c = [R[0] + (Rt[0] - R[0]) * f, R[1] + (Rt[1] - R[1]) * f];
      g.strokeStyle = 'rgba(90,60,25,.24)'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.strokeStyle = 'rgba(40,20,5,.2)'; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke();
    }
    g.restore();
  }
  return { apex: [cx, cy - h], F: Fp, L, R, Lt, Rt, Ft, Bt };
}
export function pyramid(g, cx, cy, w, h, o = {}) { return frustum(g, cx, cy, w, h, o.r || 0, o); }
// Stufenpyramide: n Stufen, die ersten 'built' (Kommazahl erlaubt) sichtbar; Breite w, Gesamthöhe h
export function stepPyramid(g, cx, cy, w, h, n, built, o = {}) {
  let y = cy, wi = w; const th = h / n;
  for (let i = 0; i < n; i++) {
    const k = clamp(built - i); if (k <= 0) break;
    frustum(g, cx, y, wi, th * k, 0.9, { ...o, courses: 0, lw: 0.9, shadow: i === 0 });
    y -= th * k; wi = wi * 0.9 * 0.82;
  }
}
export function obeliskShape(g, x, base, h, w, o = {}) {
  const K = gk(g), col = o.col || '#c4856a';
  cut(g, col, (c) => { c.moveTo(x - w / 2, base); c.lineTo(x - w * 0.34, base - h * 0.88); c.lineTo(x, base - h); c.lineTo(x + w * 0.34, base - h * 0.88); c.lineTo(x + w / 2, base); c.closePath(); }, { K });
  g.fillStyle = 'rgba(60,20,10,.22)'; g.beginPath(); g.moveTo(x, base); g.lineTo(x, base - h); g.lineTo(x + w * 0.34, base - h * 0.88); g.lineTo(x + w / 2, base); g.fill();
  g.fillStyle = EG.gold; g.beginPath(); g.moveTo(x - w * 0.34, base - h * 0.88); g.lineTo(x, base - h); g.lineTo(x + w * 0.34, base - h * 0.88); g.closePath(); g.fill();
}

// ---- Säule mit bemaltem Bündelschaft (Papyrusbündel), Mitte x, Fuß base, Höhe h, Breite w
export function column(g, x, base, h, w, o = {}) {
  const K = gk(g), body = o.col || '#e6cf9c';
  cut(g, body, (c) => { c.moveTo(x - w * 0.5, base); c.lineTo(x - w * 0.42, base - h * 0.84); c.lineTo(x + w * 0.42, base - h * 0.84); c.lineTo(x + w * 0.5, base); c.closePath(); }, { K });
  g.save(); g.beginPath(); g.moveTo(x - w * 0.5, base); g.lineTo(x - w * 0.42, base - h * 0.84); g.lineTo(x + w * 0.42, base - h * 0.84); g.lineTo(x + w * 0.5, base); g.closePath(); g.clip();
  g.fillStyle = 'rgba(80,45,15,.18)'; g.fillRect(x + w * 0.1, base - h, w, h);
  g.strokeStyle = 'rgba(120,80,30,.35)'; g.lineWidth = 0.6; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * w * 0.2, base); g.lineTo(x + i * w * 0.17, base - h * 0.84); g.stroke(); }
  g.fillStyle = o.band1 || EG.carn; g.fillRect(x - w, base - h * 0.84, 2 * w, h * 0.04); g.fillStyle = o.band2 || EG.turq; g.fillRect(x - w, base - h * 0.8, 2 * w, h * 0.03);
  g.fillStyle = o.band1 || EG.carn; g.fillRect(x - w, base - h * 0.2, 2 * w, h * 0.03); g.fillStyle = EG.lapis; g.fillRect(x - w, base - h * 0.17, 2 * w, h * 0.02);
  g.restore();
  cut(g, o.cap || EG.papyrus, (c) => { c.moveTo(x - w * 0.42, base - h * 0.84); c.quadraticCurveTo(x - w * 0.95, base - h * 0.9, x - w * 0.8, base - h); c.lineTo(x + w * 0.8, base - h); c.quadraticCurveTo(x + w * 0.95, base - h * 0.9, x + w * 0.42, base - h * 0.84); c.closePath(); }, { K });
  g.strokeStyle = 'rgba(20,60,20,.4)'; g.lineWidth = 0.6; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * w * 0.15, base - h * 0.85); g.lineTo(x + i * w * 0.34, base - h * 0.995); g.stroke(); }
  cut(g, '#d8bf86', (c) => c.rect(x - w * 0.8, base - h * 1.04, w * 1.6, h * 0.05), { K, sx: 0.6, sy: 1, blur: 0.8 });
}

// ---- Pflanzen
export function palm(g, x, base, h, t, ph, o = {}) {
  const K = gk(g), sw = Math.sin(t * 0.7 + ph) * 2.2 * (o.calm ? 0.4 : 1), lean = o.lean ?? h * 0.07, tw = h * 0.04;
  const topX = x + lean + sw * 0.4, topY = base - h, mx = x + lean * 0.35;
  cut(g, o.trunk || '#9a7048', (c) => { c.moveTo(x - tw, base); c.quadraticCurveTo(mx - tw * 0.7, base - h * 0.5, topX - tw * 0.5, topY); c.lineTo(topX + tw * 0.5, topY); c.quadraticCurveTo(mx + tw * 0.7, base - h * 0.5, x + tw, base); c.closePath(); }, { K, sx: 1.2, sy: 1.4, blur: 1.4 });
  g.strokeStyle = 'rgba(60,35,15,.4)'; g.lineWidth = 0.7;
  for (let i = 1; i < 10; i++) { const f = i / 10, yy = base - h * f, xx = x + (topX - x) * f * f * 0.9, ww = lerp(tw, tw * 0.5, f); g.beginPath(); g.moveTo(xx - ww, yy); g.quadraticCurveTo(xx, yy + 1.2, xx + ww, yy); g.stroke(); }
  if (o.dates) { g.fillStyle = '#a2562a'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(topX - 4 + (i % 4) * 2.6, topY + 3 + Math.floor(i / 4) * 3, 1.3, 1.9, 0, 0, TAU); g.fill(); } }
  const n = 9, L = h * 0.5;
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + (k - (n - 1) / 2) * 0.46 + Math.sin(t * 0.9 + ph + k) * 0.03 * (o.calm ? 0.4 : 1), droop = 0.5 + Math.abs(k - (n - 1) / 2) * 0.1;
    const ex = topX + Math.cos(a) * L, ey = topY + Math.sin(a) * L * 0.55 + L * droop * 0.45, cx = topX + Math.cos(a) * L * 0.55, cy = topY + Math.sin(a) * L * 0.95 - L * 0.1;
    const pts = []; for (let i = 0; i <= 9; i++) { const f = i / 9, ix = (1 - f) * (1 - f) * topX + 2 * (1 - f) * f * cx + f * f * ex, iy = (1 - f) * (1 - f) * topY + 2 * (1 - f) * f * cy + f * f * ey; pts.push([ix, iy]); }
    const wd = (f, i) => L * 0.085 * Math.sin(Math.PI * Math.pow(f, 0.7)) * (i % 2 ? 1 : 0.55) + 0.4;
    const leaf = (c) => {
      for (let i = 0; i <= 9; i++) { const nx = pts[Math.min(9, i + 1)][0] - pts[Math.max(0, i - 1)][0], ny = pts[Math.min(9, i + 1)][1] - pts[Math.max(0, i - 1)][1], nl = Math.hypot(nx, ny) || 1, w = wd(i / 9, i); const px = pts[i][0] - ny / nl * w, py = pts[i][1] + nx / nl * w; i ? c.lineTo(px, py) : c.moveTo(px, py); }
      for (let i = 9; i >= 0; i--) { const nx = pts[Math.min(9, i + 1)][0] - pts[Math.max(0, i - 1)][0], ny = pts[Math.min(9, i + 1)][1] - pts[Math.max(0, i - 1)][1], nl = Math.hypot(nx, ny) || 1, w = wd(i / 9, i + 1); c.lineTo(pts[i][0] + ny / nl * w, pts[i][1] - nx / nl * w); }
      c.closePath();
    };
    cut(g, k % 2 ? '#3f8f4a' : '#4ea057', leaf, { K, sx: 0.8, sy: 1, blur: 0.8, lw: 0.5, edgeCol: 'rgba(210,240,170,.45)' });
  }
}
// Papyrusstauden: n Halme mit Dolden
export function papyrus(g, x, base, h, t, ph, o = {}) {
  const n = o.n || 5, calm = o.calm ? 0.4 : 1;
  for (let i = 0; i < n; i++) {
    const f = (i - (n - 1) / 2) / ((n - 1) / 2 || 1), hh = h * (0.78 + 0.22 * Math.cos(f * 1.4)) * (i % 2 ? 0.92 : 1), sw = Math.sin(t * 0.9 + ph + i) * 2 * calm, tx = x + f * h * 0.18 + sw, ty = base - hh;
    g.strokeStyle = i % 2 ? '#4a8a40' : '#5b9a4b'; g.lineWidth = 1.7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + f * 3, base); g.quadraticCurveTo(x + f * h * 0.1, base - hh * 0.55, tx, ty); g.stroke();
    g.lineWidth = 0.7; g.strokeStyle = '#6faa55';
    for (let k = 0; k < 15; k++) { const a = -Math.PI / 2 + (k - 7) * 0.2, L = h * 0.2 * (0.85 + 0.15 * Math.cos((k - 7) * 0.4)); g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.7 - 1, tx + Math.cos(a) * L, ty + Math.sin(a) * L * 0.85 + L * 0.28 + Math.sin(t * 1.3 + k + ph) * calm); g.stroke(); }
    g.fillStyle = '#4a8a40'; g.beginPath(); g.arc(tx, ty, 1.5, 0, TAU); g.fill();
  }
}
export function reeds(g, x, base, h, t, ph, n = 5, col = '#6a9a4a') {
  g.strokeStyle = col; g.lineWidth = 1.2; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const f = i - (n - 1) / 2, hh = h * (0.7 + 0.3 * Math.abs(Math.sin(i * 2.3))), sw = Math.sin(t * 1.1 + ph + i) * 2.5; g.beginPath(); g.moveTo(x + f * 2.5, base); g.quadraticCurveTo(x + f * 3.5 + sw * 0.4, base - hh * 0.6, x + f * 4 + sw + f * 2, base - hh); g.stroke(); }
}
export function lotus(g, x, y, s, t, ph, kind = 'blau') {
  g.save(); g.translate(x, y + Math.sin(t * 0.9 + ph) * 0.4); g.scale(s, s);
  cut(g, '#4f9a55', (c) => { c.ellipse(0, 0, 9, 3, 0, 0.12, TAU - 0.12); c.lineTo(0, 0); }, { sx: 0.6, sy: 1, blur: 1, lw: 0.5, K: gk(g) });
  if (kind) {
    const col = kind === 'weiss' ? '#fff6e8' : '#8fb8ee', ed = kind === 'weiss' ? 'rgba(200,170,110,.7)' : EG.lapis;
    for (const a of [-0.75, 0.75, -0.38, 0.38, 0]) { g.save(); g.translate(0, -1.5); g.rotate(a); g.fillStyle = col; g.strokeStyle = ed; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-2.6, -4, 0, -8.6); g.quadraticCurveTo(2.6, -4, 0, 0); g.fill(); g.stroke(); g.restore(); }
    g.fillStyle = EG.gold; g.beginPath(); g.arc(0, -3, 1.1, 0, TAU); g.fill();
  }
  g.restore();
}
// ---- Sonne, Wasser, Felsen, Rauch
export function sunDisc(g, x, y, r, col = '#ffdf8a', glowCol = '255,200,100', ga = 0.55) { glow(g, x, y, r * 4, glowCol, ga); glow(g, x, y, r * 2, glowCol, ga * 0.7); g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - r * 0.25, y - r * 0.25, r * 0.55, 0, TAU); g.fill(); }
export function nilWater(g, y0, y1, t, o = {}) {
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, o.top || '#4fb4c0'); gr.addColorStop(1, o.bot || '#1f6f8e'); g.fillStyle = gr; g.fillRect(-4, y0, SW + 8, y1 - y0);
  const rows = o.rows ?? 8, spd = o.calm ? 0.5 : 1;
  for (let r = 0; r < rows; r++) {
    const f = (r + 0.4) / rows, yy = y0 + (y1 - y0) * Math.pow(f, 1.35), step = 26 + f * 34, len = 9 + f * 14, off = (t * (3 + f * 7) * spd * (r % 2 ? 1 : -1) + r * 37) % step;
    g.strokeStyle = o.hi || `rgba(255,255,255,${0.2 + f * 0.25})`; g.lineWidth = 0.8 + f * 0.8; g.lineCap = 'round';
    for (let x = -step + off; x < SW + step; x += step) { const xx = x + (r % 3) * 9; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + len / 2, yy - 1.6 - f * 1.6 + Math.sin(t * 1.3 + x * 0.05 + r) * 0.8 * spd, xx + len, yy); g.stroke(); }
  }
  if (o.sunX != null) {
    for (let r = 0; r < rows * 2; r++) { const f = r / (rows * 2), yy = y0 + (y1 - y0) * f, w = (6 + f * 40) * (0.7 + 0.3 * Math.sin(t * 2 + r * 1.7)); g.fillStyle = `rgba(${o.sunCol || '255,236,170'},${0.55 * (1 - f * 0.5)})`; g.fillRect(o.sunX - w / 2 + Math.sin(t * 1.2 + r) * 3, yy, w, 1.4 + f * 1.2); }
  }
}
// Gezackter Wüsten-/Kalksteinzug (feste Form über seed)
export function crags(g, base, hgt, seed, fill, o = {}) {
  const r = rng(seed), pts = []; let x = -20; const stepW = o.stepW || 46;
  while (x < SW + 30) { pts.push([x, base - hgt * (0.35 + r() * 0.65)]); x += stepW * (0.6 + r() * 0.9); }
  cut(g, fill, (c) => { c.moveTo(-20, SH + 10); c.lineTo(-20, pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], q = pts[i]; c.lineTo(p[0] + (q[0] - p[0]) * 0.28, p[1]); c.lineTo(p[0] + (q[0] - p[0]) * 0.46, q[1]); } c.lineTo(SW + 30, pts[pts.length - 1][1]); c.lineTo(SW + 30, SH + 10); c.closePath(); }, { shadow: o.shadow, sy: 1.4 });
  if (o.strata) { g.strokeStyle = o.strata; g.lineWidth = 0.8; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(-10, base - hgt * (0.1 + i * 0.2)); g.lineTo(SW + 10, base - hgt * (0.1 + i * 0.2)); g.stroke(); } }
}
// Rauchfahne
export function smoke(g, x, y, t, o = {}) {
  const n = o.n || 7, calm = o.calm ? 0.5 : 1;
  for (let i = 0; i < n; i++) { const ph = (t * 0.22 * calm + i / n) % 1; g.fillStyle = `rgba(${o.col || '235,225,210'},${(o.a ?? 0.5) * (1 - ph)})`; g.beginPath(); g.arc(x + Math.sin(ph * 5 + i) * (3 + ph * 6) + ph * (o.drift ?? 14), y - ph * (o.h || 60), 2 + ph * (o.grow || 8), 0, TAU); g.fill(); }
}

// ---- Schiffe (Profil, dir = +1 Bug nach rechts, Länge ca. 124 * s, Wasserlinie bei y). o.kind: 'nil' | 'greek' | 'reed'
export function ship(g, x, y, s, dir, t, o = {}) {
  const K = gk(g), calm = o.calm ? 0.5 : 1, kind = o.kind || 'nil', bob = Math.sin(t * 1.3 + (o.ph || 0)) * 1.2 * s * calm, pitch = Math.sin(t * 1.0 + (o.ph || 0)) * 0.015 * calm;
  g.save(); g.translate(x, y + bob); g.rotate(pitch * dir); g.scale(dir * s, s); const wood = o.hull || '#a9683a';
  if (kind === 'reed') {
    cut(g, '#d6c070', (c) => { c.moveTo(-34, -13); c.quadraticCurveTo(-30, 3, -6, 4); c.lineTo(10, 4); c.quadraticCurveTo(32, 3, 38, -16); c.quadraticCurveTo(26, -3, 10, -3); c.lineTo(-10, -3); c.quadraticCurveTo(-26, -3, -34, -13); c.closePath(); }, { K, sx: 1, sy: 1.8 });
    g.strokeStyle = '#8a7030'; g.lineWidth = 0.9; for (const bx of [-26, -14, 0, 14, 28]) { g.beginPath(); g.moveTo(bx, 3.6); g.lineTo(bx + 0.5, -2.4); g.stroke(); }
    g.restore(); return;
  }
  const greek = kind === 'greek';
  const hull = (c) => {
    if (greek) { c.moveTo(-60, -34); c.quadraticCurveTo(-56, -18, -50, -8); c.quadraticCurveTo(-40, 5, -20, 5); c.lineTo(34, 5); c.quadraticCurveTo(54, 4, 62, -9); c.lineTo(68, -11); c.lineTo(60, -14); c.lineTo(44, -13); c.lineTo(-40, -13); c.quadraticCurveTo(-52, -18, -57, -30); c.quadraticCurveTo(-62, -36, -60, -34); c.closePath(); }
    else { c.moveTo(-62, -36); c.quadraticCurveTo(-56, -14, -48, -6); c.quadraticCurveTo(-38, 4, -20, 4); c.lineTo(32, 4); c.quadraticCurveTo(50, 3, 58, -10); c.quadraticCurveTo(64, -20, 62, -30); c.quadraticCurveTo(56, -20, 46, -14); c.lineTo(-44, -14); c.quadraticCurveTo(-54, -20, -57, -32); c.closePath(); }
  };
  if (!greek) { g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.6; g.lineCap = 'round'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(-50 + sx * 4, -13); g.lineTo(-42 + sx * 9, -26); g.stroke(); } }
  cut(g, wood, hull, { K, sx: 1.2, sy: 2, blur: 1.6 });
  g.save(); g.beginPath(); hull(g); g.clip();
  g.fillStyle = o.band || EG.carn; g.fillRect(-70, -15.5, 140, 3.2); g.fillStyle = EG.turq; g.fillRect(-70, -12.3, 140, 1.8);
  g.fillStyle = 'rgba(40,15,0,.2)'; g.fillRect(-70, -1, 140, 8);
  if (greek) { g.fillStyle = '#f3e6c8'; g.fillRect(-70, -9, 140, 1.4); }
  g.restore();
  if (!greek) { for (const [ex, ey, d] of [[-60.5, -35, 1], [61.5, -31, -1]]) { g.fillStyle = EG.gold; g.beginPath(); g.moveTo(ex, ey + 4); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.lineTo(ex + Math.cos(a) * 8 * d * 0.8, ey + Math.sin(a) * 8); g.lineTo(ex + Math.cos(a + 0.27) * 3.5, ey + Math.sin(a + 0.27) * 3.5); } g.closePath(); g.fill(); } }
  else { g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(52, -7, 3.6, 2.4, 0, 0, TAU); g.fill(); g.fillStyle = '#1b2a4a'; g.beginPath(); g.arc(53, -7, 1.3, 0, TAU); g.fill(); g.strokeStyle = '#6a3a1a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-60, -34); g.quadraticCurveTo(-64, -42, -57, -45); g.stroke(); }
  const cargo = o.cargo;
  if (cargo === 'baskets') { for (let i = 0; i < 5; i++) { const bx = -26 + i * 11 + (i % 2) * 2, by = -14 - (i % 2) * 7; cut(g, i % 2 ? '#c9a05a' : '#dcb878', (c) => { c.moveTo(bx - 5, by); c.lineTo(bx - 3.4, by - 8); c.lineTo(bx + 3.4, by - 8); c.lineTo(bx + 5, by); c.closePath(); }, { K, sx: 0.6, sy: 1, blur: 0.8, lw: 0.5 }); g.fillStyle = '#f4e3a0'; g.beginPath(); g.ellipse(bx, by - 8, 3.3, 1.6, 0, Math.PI, 0); g.fill(); } }
  if (cargo === 'trees') { for (let i = 0; i < 3; i++) { const bx = -20 + i * 18; cut(g, '#c9a05a', (c) => { c.moveTo(bx - 5, -14); c.lineTo(bx - 3.6, -21); c.lineTo(bx + 3.6, -21); c.lineTo(bx + 5, -14); c.closePath(); }, { K, sx: 0.6, sy: 1, blur: 0.8, lw: 0.5 }); g.strokeStyle = '#7a5530'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx, -21); g.lineTo(bx, -33); g.stroke(); g.fillStyle = i % 2 ? '#5b9a4b' : '#4f8f45'; for (const [dx, dy, r] of [[-3, -33, 4], [3, -35, 4.4], [0, -38, 3.8]]) { g.beginPath(); g.arc(bx + dx, dy, r, 0, TAU); g.fill(); } } }
  if (cargo === 'sacks') { for (let i = 0; i < 4; i++) { const bx = -24 + i * 14; cut(g, i % 2 ? '#d8c79a' : '#e6d6a8', (c) => { c.ellipse(bx, -20, 7, 6, 0, 0, TAU); }, { K, sx: 0.6, sy: 1, blur: 0.8, lw: 0.5 }); } }
  if (o.sail !== false) {
    const mx = o.mastX ?? (greek ? 2 : 4), mh = o.mastH ?? (greek ? 72 : 62), bill = 2.5 + 3.5 * Math.sin(t * 0.8 + (o.ph || 0)) * calm, sw = o.sailW ?? (greek ? 56 : 50), sh = o.sailH ?? (greek ? 36 : 40), top = -14 - mh;
    g.strokeStyle = '#6a4326'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(mx, -12); g.lineTo(mx, top); g.stroke();
    for (const sx of [-1, 1]) { g.lineWidth = 0.7; g.strokeStyle = 'rgba(70,45,20,.8)'; g.beginPath(); g.moveTo(mx, top); g.lineTo(sx < 0 ? -56 : 59, sx < 0 ? -34 : -22); g.stroke(); }
    const sc = (c) => { c.moveTo(mx - sw / 2, top + 4); c.quadraticCurveTo(mx, top + 4 + bill * 1.2, mx + sw / 2, top + 4); c.lineTo(mx + sw / 2 - 2, top + 4 + sh + bill * 0.3); c.quadraticCurveTo(mx + bill, top + 4 + sh + bill * 1.4, mx - sw / 2 + 2, top + 4 + sh + bill * 0.3); c.closePath(); };
    cut(g, o.sailCol || '#f6efe0', sc, { K, sx: 1, sy: 1.6, blur: 1.4 });
    g.save(); g.beginPath(); sc(g); g.clip();
    if (greek) { for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#b83a2c' : '#f6efe0'; g.fillRect(mx - sw / 2 + i * sw / 9, top, sw / 9 + 0.5, sh + 12); } }
    else { g.fillStyle = EG.carn; g.fillRect(mx - sw / 2, top + sh - 6, sw, 3); g.fillStyle = EG.lapis; g.fillRect(mx - sw / 2, top + sh - 2.4, sw, 3); g.fillStyle = EG.turq; g.fillRect(mx - sw / 2, top + 6.5, sw, 2.2); g.fillStyle = EG.gold; g.fillRect(mx - sw / 2, top + 4, sw, 2.5); }
    g.fillStyle = 'rgba(90,60,25,.12)'; g.fillRect(mx + 2, top, sw, sh + 14);
    g.restore();
    g.strokeStyle = '#6a4326'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(mx - sw / 2 - 3, top + 4); g.lineTo(mx + sw / 2 + 3, top + 4); g.stroke(); g.beginPath(); g.moveTo(mx - sw / 2 + 1, top + sh + 4); g.lineTo(mx + sw / 2 - 1, top + sh + 4); g.stroke();
  }
  if (!greek) { g.strokeStyle = '#5a3a1e'; g.lineWidth = 2.2; g.lineCap = 'round'; for (const k of [0, 1]) { g.beginPath(); g.moveTo(-50 - k * 3, -22 + k * 2); g.lineTo(-62 - k * 5, 12); g.stroke(); g.fillStyle = '#7a4f2a'; g.beginPath(); g.ellipse(-62 - k * 5, 12, 2, 5, 0.2, 0, TAU); g.fill(); } }
  const nO = o.oars ?? 0;
  for (let i = 0; i < nO; i++) { const ox = -32 + i * (64 / Math.max(1, nO - 1)), sw2 = Math.sin(t * 2.2 * (o.rowSpd || 1) + (o.ph || 0)) * 5 * calm; g.strokeStyle = '#5a3a1e'; g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(ox + 3, -13); g.lineTo(ox - 10 + sw2, 11); g.stroke(); g.fillStyle = '#7a4f2a'; g.beginPath(); g.ellipse(ox - 10 + sw2, 11, 1.4, 3.4, 0.4, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(-30 + i * 14 + Math.sin(t * 2 + i) * 1.5, 4.6, 6, 1.3, 0, 0, TAU); g.fill(); }
  g.restore();
}

// Leuchtturm von Pharos: Fuß (x, base), Höhe h, built 0..1 Baufortschritt; oben Feuerkorb
export function pharos(g, x, base, h, t, built = 1, o = {}) {
  const K = gk(g), lit = o.lit || '#eadfc4', dk = o.dark || '#bdae8c', calm = o.calm ? 0.5 : 1;
  const tiers = [[0, 0.5, 0.26, 'sq'], [0.5, 0.78, 0.15, 'oct'], [0.78, 0.94, 0.09, 'cyl']];
  for (const [a, b, wf, kind] of tiers) {
    const y0 = base - h * a, hh = h * Math.max(0, Math.min(b, built) - a); if (hh <= 0.5) continue;
    const w0 = h * wf, w1 = (kind === 'sq' ? wf * 0.84 : wf * 0.94) * h;
    cut(g, lit, (c) => { c.moveTo(x - w0 / 2, y0); c.lineTo(x - w1 / 2, y0 - hh); c.lineTo(x + w1 / 2, y0 - hh); c.lineTo(x + w0 / 2, y0); c.closePath(); }, { K, sx: 1.6, sy: 1.8, blur: 2 });
    g.fillStyle = dk; g.beginPath(); g.moveTo(x + w0 * (kind === 'oct' ? 0.16 : 0.08), y0); g.lineTo(x + w1 * (kind === 'oct' ? 0.16 : 0.08), y0 - hh); g.lineTo(x + w1 / 2, y0 - hh); g.lineTo(x + w0 / 2, y0); g.fill();
    g.strokeStyle = 'rgba(100,80,40,.28)'; g.lineWidth = 0.6; for (let i = 1; i < Math.floor(hh / 7); i++) { const yy = y0 - i * 7, f = i * 7 / hh, ww = lerp(w0, w1, f); g.beginPath(); g.moveTo(x - ww / 2, yy); g.lineTo(x + ww / 2, yy); g.stroke(); }
    g.fillStyle = 'rgba(40,30,20,.55)'; const nw = Math.floor(hh / 17); for (let i = 0; i < nw; i++) { const yy = y0 - 10 - i * 17; if (yy > y0 - hh + 4) g.fillRect(x - 1.4 - w0 * 0.05, yy - 4, 2.8, 5.5); }
    cut(g, '#d8c9a4', (c) => c.rect(x - w1 / 2 - 2, y0 - hh - 1.8, w1 + 4, 2.4), { K, sx: 0.6, sy: 1, blur: 0.8, lw: 0.5 });
  }
  if (built >= 0.96) {
    const topY = base - h * 0.94 - 2;
    g.fillStyle = '#d8c9a4'; g.fillRect(x - h * 0.05, topY - 1, h * 0.1, 2); g.fillStyle = EG.gold; g.beginPath(); g.moveTo(x - 1.3, topY - 1); g.lineTo(x - 2, topY - h * 0.1); g.lineTo(x + 2, topY - h * 0.1); g.lineTo(x + 1.3, topY - 1); g.fill();
    const fl = 1 + Math.sin(t * 9) * 0.12 * calm; glow(g, x, topY - h * 0.12, h * 0.28 * fl, '255,170,60', 0.6); g.fillStyle = '#ff9a2c'; g.beginPath(); g.moveTo(x - 3.2, topY - h * 0.1); g.quadraticCurveTo(x - 3.5, topY - h * 0.16 * fl, x, topY - h * 0.22 * fl); g.quadraticCurveTo(x + 3.5, topY - h * 0.16 * fl, x + 3.2, topY - h * 0.1); g.fill();
    g.fillStyle = '#ffe27a'; g.beginPath(); g.moveTo(x - 1.6, topY - h * 0.1); g.quadraticCurveTo(x, topY - h * 0.17 * fl, x + 1.6, topY - h * 0.1); g.fill();
  }
}
// kleine Hand an einem Strahl (Aton): Handfläche mit vier Fingern, zeigt in Richtung ang
export function tinyHand(g, x, y, ang, s, col) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.fillStyle = col; g.strokeStyle = 'rgba(255,245,220,.7)'; g.lineWidth = 0.4;
  g.beginPath(); g.ellipse(0, 0, 2.2, 1.7, 0, 0, TAU); g.fill();
  for (let i = -1.5; i <= 1.5; i++) { g.beginPath(); g.roundRect(1.4, i * 0.95 - 0.38, 2.7, 0.78, 0.4); g.fill(); }
  g.beginPath(); g.ellipse(0.4, 2.1, 1.2, 0.6, 0.7, 0, TAU); g.fill();
  g.restore();
}

// ---- Vogel im Flug (Ibis: weiß mit schwarzen Spitzen), Mitte x,y, Spannweite ca. 24 * s
export function bird(g, x, y, s, t, ph, col = '#fffaf0', tip = '#1c1816', calm = false) {
  const fl = Math.sin(t * (calm ? 3 : 5) + ph) * 0.55; g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const k of [-1, 1]) {
    g.save(); g.translate(k * 1.2, 0); g.rotate(k * (-0.2 - fl));
    g.fillStyle = col; g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(k * 6, -3.4, k * 12, -0.4); g.quadraticCurveTo(k * 6, 1.6, 0, 1.4); g.closePath(); g.fill();
    g.fillStyle = tip; g.beginPath(); g.moveTo(k * 8.6, -1.6); g.quadraticCurveTo(k * 12, -1.2, k * 12.8, -0.2); g.quadraticCurveTo(k * 10, 0.6, k * 8.4, 0.6); g.closePath(); g.fill();
    g.restore();
  }
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 0.6, 3.6, 1.8, 0, 0, TAU); g.fill();
  g.strokeStyle = tip; g.lineWidth = 0.9; g.beginPath(); g.moveTo(3, 0); g.quadraticCurveTo(5.4, -0.8, 6, 0.6); g.stroke(); g.beginPath(); g.moveTo(6, 0.6); g.quadraticCurveTo(8, 0.6, 9, 2.2); g.stroke();
  g.fillStyle = tip; g.beginPath(); g.arc(5.2, -0.1, 1, 0, TAU); g.fill();
  g.restore();
}

// ---- Pferd im Profil (Fußpunkt x,y; Höhe bis zu den Ohren ca. 82 * s). o: col, ph (Trabphase), amp (Schrittweite), plume (Federbusch)
export function horse(g, x, y, s, dir, t, o = {}) {
  const K = gk(g), col = o.col || '#8a4f2c', dk = tone(col, 0.32), lt = tone(col, -0.1), ph = o.ph ?? t * 7, amp = o.amp ?? 1, calm = o.calm ? 0.5 : 1;
  g.save(); g.translate(x, y); g.scale(dir * s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  const leg = (hx, hy, p, hind, c1) => {
    const fx = hx + Math.sin(p) * 10 * amp, lift = Math.max(0, Math.cos(p)) * 8 * amp;
    const pts = ik(hx, hy, fx, -2.6 - lift, 17, 17, hind ? 1 : -1), e = 'rgba(255,245,220,.55)';
    for (const [a, b, w] of [[0, 1, 7.6], [1, 2, 4.2]]) { g.strokeStyle = e; g.lineWidth = w + 1.8; g.beginPath(); g.moveTo(pts[a][0], pts[a][1]); g.lineTo(pts[b][0], pts[b][1]); g.stroke(); }
    for (const [a, b, w] of [[0, 1, 7.6], [1, 2, 4.2]]) { g.strokeStyle = c1; g.lineWidth = w; g.beginPath(); g.moveTo(pts[a][0], pts[a][1]); g.lineTo(pts[b][0], pts[b][1]); g.stroke(); }
    g.fillStyle = '#2b2018'; g.beginPath(); g.moveTo(pts[2][0] - 2.4, pts[2][1] - 1.4); g.lineTo(pts[2][0] + 3.6, pts[2][1] - 0.6); g.lineTo(pts[2][0] + 3.6, pts[2][1] + 1.8); g.lineTo(pts[2][0] - 2.4, pts[2][1] + 1.8); g.closePath(); g.fill();
  };
  leg(-22, -34, ph + Math.PI, true, dk); leg(19, -33, ph, false, dk);
  g.strokeStyle = '#2a1a10'; g.lineWidth = 4.6; g.beginPath(); g.moveTo(-34, -46); g.quadraticCurveTo(-47, -44 + Math.sin(t * 5) * 2 * calm, -48, -24 + Math.sin(t * 4) * 3 * calm); g.stroke();
  const bodyP = (c) => {
    c.moveTo(-34, -42); c.quadraticCurveTo(-34, -53, -20, -52); c.quadraticCurveTo(0, -50, 12, -52); c.quadraticCurveTo(23, -55, 27, -66); c.quadraticCurveTo(30, -76, 36, -79);
    c.quadraticCurveTo(42, -79, 46, -73); c.quadraticCurveTo(53, -65, 59, -58); c.quadraticCurveTo(61, -54, 57, -52); c.quadraticCurveTo(50, -52, 44, -55); c.quadraticCurveTo(40, -55, 38, -51);
    c.quadraticCurveTo(33, -44, 28, -36); c.quadraticCurveTo(27, -24, 12, -22); c.quadraticCurveTo(-8, -21, -24, -25); c.quadraticCurveTo(-37, -30, -34, -42); c.closePath();
  };
  cut(g, col, bodyP, { K, sx: 1.4, sy: 2, blur: 1.6 });
  g.save(); g.beginPath(); bodyP(g); g.clip();
  g.fillStyle = lt; g.beginPath(); g.ellipse(-21, -38, 12, 14, 0.1, 0, TAU); g.fill(); g.beginPath(); g.ellipse(18, -38, 8.5, 11, -0.2, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,225,180,.14)'; g.beginPath(); g.ellipse(-4, -46, 22, 4, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(40,15,5,.22)'; g.beginPath(); g.ellipse(0, -22, 26, 5, 0, 0, TAU); g.fill();
  g.restore();
  g.strokeStyle = 'rgba(60,25,10,.35)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-10, -48); g.quadraticCurveTo(-8, -38, -14, -27); g.stroke();
  // Mähne, Ohr
  g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(12, -52); g.quadraticCurveTo(22, -56, 27, -66); g.quadraticCurveTo(30, -76, 35, -81); g.lineTo(38, -77); g.quadraticCurveTo(33, -71, 31, -62); g.quadraticCurveTo(26, -52, 14, -46); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(37, -77); g.lineTo(38.5, -82.5); g.lineTo(41.5, -76); g.closePath(); g.fill();
  // Auge, Nüstern, Zaumzeug
  g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(44, -68, 1.9, 1.4, 0.3, 0, TAU); g.fill(); g.fillStyle = '#16100c'; g.beginPath(); g.arc(44.5, -68, 1.05, 0, TAU); g.fill();
  g.strokeStyle = '#16100c'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(59, -56); g.lineTo(57.6, -56.8); g.stroke();
  g.strokeStyle = EG.gold; g.lineWidth = 1.1; g.beginPath(); g.moveTo(39, -78); g.lineTo(48, -63); g.moveTo(57.4, -54.4); g.lineTo(43, -61); g.stroke();
  g.fillStyle = EG.carn; g.beginPath(); g.arc(48.4, -62.4, 1.2, 0, TAU); g.fill();
  if (o.plume !== false) { const fl = Math.sin(t * 6) * 2 * calm; for (const [c2, dx] of [[EG.carn, 0], [EG.lapis, 2.8]]) { g.fillStyle = c2; g.beginPath(); g.moveTo(36 + dx, -79); g.quadraticCurveTo(35 + dx - fl, -92, 39 + dx - fl * 1.5, -97); g.quadraticCurveTo(41 + dx, -88, 39.6 + dx, -79); g.closePath(); g.fill(); } }
  leg(-18, -34, ph, true, col); leg(23, -33, ph + Math.PI, false, col);
  g.strokeStyle = EG.gold; g.lineWidth = 1.8; g.beginPath(); g.moveTo(10, -51); g.quadraticCurveTo(14, -36, 12, -22); g.stroke();
  g.restore();
}
