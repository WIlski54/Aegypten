// Zeitfenster-Szenen zum alten Ägypten (reine 2D-Zeichnung, prozedural, Papierschnitt-Look).
// Jede Szene: { at (Jahre v. Chr., absteigend sortiert), short, when, era, title, cap, fact, draw(g, t, o) } auf 480 x 300; o.calm = ruhiger Modus.
import { SW, SH, TAU, lerp, clamp, smooth, rng, mixc, css, hex, paper, vgrad, circle, glow, ridge, ellipse, limb, stars, makeStars,
  EG, tone, gk, cut, egyptian, crownIcon, frustum, pyramid, stepPyramid, obeliskShape, column, palm, papyrus, reeds, lotus, bird, sunDisc, nilWater, crags, smoke, ship, horse, pharos, tinyHand } from './zeitkit.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const ease = (u) => smooth(clamp(u));
const mod = (a, n) => ((a % n) + n) % n;
const STARS = makeStars(60, 77, 170);

// ---------------------------------------------------------------- gemeinsame Bauteile
// Schilfhütte (Kuppel aus Schilfbündeln), Mitte x, Boden base, Breite w, Höhe h
function hut(g, x, base, w, h, o = {}) {
  const K = gk(g);
  g.fillStyle = 'rgba(60,30,10,.25)'; g.beginPath(); g.ellipse(x + w * 0.08, base + 1, w * 0.56, 3, 0, 0, TAU); g.fill();
  const dome = (c) => { c.moveTo(x - w / 2, base); c.bezierCurveTo(x - w / 2, base - h * 1.33, x + w / 2, base - h * 1.33, x + w / 2, base); c.closePath(); };
  cut(g, o.col || '#d9b968', dome, { K });
  g.save(); g.beginPath(); dome(g); g.clip();
  g.strokeStyle = 'rgba(120,85,30,.38)'; g.lineWidth = 0.7;
  for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(x + i * w / 10, base); g.quadraticCurveTo(x + i * w / 16, base - h * 0.7, x + i * w / 90, base - h); g.stroke(); }
  g.strokeStyle = '#a0803a'; g.lineWidth = 1.4; for (const f of [0.28, 0.55, 0.8]) { g.beginPath(); g.ellipse(x, base - h * f + 2, w * 0.5 * (1 - f * 0.78), 3.2 * (1 - f * 0.4), 0, 0.15, PI - 0.15); g.stroke(); }
  g.fillStyle = 'rgba(70,40,10,.2)'; g.fillRect(x + w * 0.12, base - h * 1.2, w, h * 1.3);
  g.restore();
  g.fillStyle = '#4a3220'; g.beginPath(); g.moveTo(x - w * 0.1 - 5.5, base); g.lineTo(x - w * 0.1 - 5.5, base - h * 0.34); g.quadraticCurveTo(x - w * 0.1, base - h * 0.5, x - w * 0.1 + 5.5, base - h * 0.34); g.lineTo(x - w * 0.1 + 5.5, base); g.closePath(); g.fill();
  g.strokeStyle = '#c9a050'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, base - h + 1); g.lineTo(x + 1, base - h - 5); g.stroke(); g.beginPath(); g.moveTo(x - 3, base - h - 3); g.lineTo(x + 1, base - h - 5); g.lineTo(x + 4, base - h - 2.5); g.stroke();
}
// Schlitten mit Steinblock, von n Arbeitern nach rechts gezogen (Fußpunkt x,y). Arbeiter sind bezahlte Handwerker im Schurz.
function haul(g, x, y, s, dir, t, n, ph, o = {}) {
  const K = gk(g), figs = [];
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  cut(g, '#8a5a30', (c) => { c.moveTo(-26, 0); c.lineTo(22, 0); c.quadraticCurveTo(28, 0, 29, -5); c.lineTo(26, -5); c.lineTo(-26, -5); c.closePath(); }, { K, sx: 1, sy: 1.4, blur: 1, lw: 0.6 });
  cut(g, '#ead7a4', (c) => c.rect(-22, -22, 40, 17), { K, sx: 1, sy: 1.6, blur: 1.2, lw: 0.7 });
  g.fillStyle = 'rgba(120,80,30,.2)'; g.fillRect(-22, -22, 40, 4); g.strokeStyle = 'rgba(120,80,30,.35)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(-2, -22); g.lineTo(-2, -5); g.stroke();
  g.restore();
  const base = [x + dir * s * 27, y - 3 * s]; let prev = base;
  for (let i = 0; i < n; i++) {
    const px = x + dir * s * (50 + i * 24), r = egyptian(g, px, y, s * 0.95, dir, 'pull', ph + i * 0.9, { kilt: i % 2 ? '#f6efe0' : '#efe1c4', head: i % 3 === 2 ? 'band' : undefined });
    g.strokeStyle = '#6a4a28'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(r.hand[0], r.hand[1]); g.stroke(); prev = r.hand; figs.push(r);
  }
  return figs;
}
// zum Schluss ein Hauch Wüstenstaub
function dust(g, x, y, t, o = {}) { smoke(g, x, y, t, { col: '220,190,140', a: 0.4, h: 14, grow: 5, drift: -10, n: 5, calm: o.calm }); }

// ---------------------------------------------------------------- 1 Siedlungen am Nil (ca. 3300 v. Chr.)
function siedlung(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm;
  vgrad(g, [[0, '#7fc4dc'], [0.55, '#f8dfae'], [1, '#fdebc4']], 0, 176);
  sunDisc(g, 372, 126, 15, '#fff0b8', '255,200,110', 0.6);
  crags(g, 162, 46, 11, '#e4cb94', { strata: 'rgba(150,110,50,.22)' });
  ridge(g, 164, 2, 0.05, 1, '#78ae5e', { shadow: false });
  for (const [px, ph] of [[26, 0], [84, 2], [396, 1], [452, 3]]) palm(g, px, 168, 30, T, ph, { calm: o.calm, lean: 2 });
  nilWater(g, 168, 246, T, { sunX: 372, calm: o.calm, top: '#5cbcc6', bot: '#2a8196' });
  // Fischer im Papyrusboot, einer wirft das Netz, einer paddelt
  const bx = 168 + sin(T * 0.35) * 14, by = 206;
  const lotusX = [[300, 220], [330, 230], [420, 214]];
  for (const [lx, ly] of lotusX) lotus(g, lx, ly, 0.9, T, lx, lx % 2 ? 'weiss' : 'blau');
  ship(g, bx, by, 1.5, 1, T, { kind: 'reed', calm: o.calm });
  const f1 = egyptian(g, bx - 18, by - 5, 0.78, 1, 'pull', 0.4 + sin(T * 0.9) * 0.2, { lean: 0.28, kilt: '#efe1c4' });
  const net = (f) => { const a = f.hand, wx = a[0] + 30, wy = by + 6; g.strokeStyle = '#6a4a28'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0] + 18, a[1] - 4, wx, wy - 2); g.stroke();
    g.fillStyle = 'rgba(244,230,190,.35)'; g.strokeStyle = 'rgba(244,230,190,.85)'; g.lineWidth = 0.6; g.beginPath(); g.ellipse(wx + 4, wy + sin(T * 1.7) * 0.8, 12, 4, 0.1, 0, TAU); g.fill(); g.stroke();
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(wx + 4 + i * 4.2, wy - 3.6); g.lineTo(wx + 4 + i * 3.4, wy + 3.8); g.stroke(); } };
  net(f1);
  const f2 = egyptian(g, bx + 22, by - 5, 0.74, 1, 'row', T * 1.6, {});
  g.strokeStyle = '#7a4f2a'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(f2.hand[0] - 10, f2.hand[1] - 4); g.lineTo(f2.hand[0] + 13, f2.hand[1] + 28); g.stroke();
  // zweites Boot in der Ferne
  ship(g, 318 + sin(T * 0.25 + 2) * 10, 190, 0.8, -1, T, { kind: 'reed', ph: 2, calm: o.calm });
  egyptian(g, 318 + sin(T * 0.25 + 2) * 10, 187, 0.42, -1, 'stand', 0, {});
  // springender Fisch
  { const ph = mod(T * 0.17, 1); if (ph < 0.2) { const u = ph / 0.2, fx = 262 + u * 26, fy = 226 - sin(u * PI) * 20; g.save(); g.translate(fx, fy); g.rotate(-0.9 + u * 1.8); g.fillStyle = '#b9ccd2'; g.beginPath(); g.ellipse(0, 0, 6, 2.4, 0, 0, TAU); g.fill(); g.fillStyle = '#8ea6b0'; g.beginPath(); g.moveTo(-5, 0); g.lineTo(-9, -3); g.lineTo(-9, 3); g.fill(); g.restore(); } }
  // Ufer: Grün und Sand
  ridge(g, 247, 4, 0.03, 0.5, '#86b866');
  ridge(g, 262, 3, 0.04, 2.1, '#dcbd7c');
  papyrus(g, 24, 252, 46, T, 0, { n: 4, calm: o.calm }); papyrus(g, 244, 250, 40, T, 2, { n: 3, calm: o.calm }); papyrus(g, 470, 252, 50, T, 1, { n: 4, calm: o.calm });
  reeds(g, 210, 250, 22, T, 1, 4); reeds(g, 460, 256, 18, T, 3, 3);
  hut(g, 66, 274, 66, 46); hut(g, 136, 281, 52, 36, { col: '#cfae5e' }); hut(g, 392, 276, 62, 42); hut(g, 448, 284, 48, 32, { col: '#cfae5e' });
  smoke(g, 136, 244, T, { h: 52, n: 7 });
  // Trockengestell mit Fischen
  g.strokeStyle = '#7a4f2a'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(214, 291); g.lineTo(214, 262); g.moveTo(262, 291); g.lineTo(262, 262); g.moveTo(210, 264); g.lineTo(266, 264); g.stroke();
  for (let i = 0; i < 4; i++) { const fx = 222 + i * 12; g.fillStyle = '#a9bcc4'; g.beginPath(); g.ellipse(fx, 273, 2.8, 8, 0, 0, TAU); g.fill(); g.fillStyle = '#7e95a0'; g.beginPath(); g.moveTo(fx, 281); g.lineTo(fx - 3, 286); g.lineTo(fx + 3, 286); g.fill(); }
  // Menschen am Ufer: Frau mit Krug, Kind, Mann mit Korb
  const wx = 330 + sin(T * 0.28) * 36, wd = cos(T * 0.28) >= 0 ? 1 : -1;
  egyptian(g, wx, 296, 0.82, wd, 'carry', T * 3.4, { sex: 'f', hold: 'jarHead' });
  egyptian(g, 188, 298, 0.52, 1, 'stand', T, { child: true, wig: false });
  egyptian(g, 288, 288, 0.74, -1, 'walk', T * 2.6, { hold: 'basketHead', head: undefined });
  palm(g, 14, 280, 104, T, 1, { calm: o.calm, lean: 8, dates: true }); palm(g, 468, 284, 94, T, 3, { calm: o.calm, lean: -6 });
  for (let k = 0; k < 3; k++) bird(g, mod(T * 12 + k * 170, 560) - 40, 62 + k * 15 + sin(T + k) * 3, 0.9, T, k, '#fffaf0', '#1c1816', o.calm);
}

// ---------------------------------------------------------------- 2 Zwei Länder werden eins (ca. 3100 v. Chr.)
function zweiLaender(g, t, o) {
  const cm = o.calm ? 0.5 : 1, T = t * cm, L = 15, C = mod(t, L);
  vgrad(g, [[0, '#86c9df'], [0.6, '#f6e2b4'], [1, '#fbecc8']], 0, 200);
  // Unterägypten (links): grünes Delta mit Kanälen, Papyrus
  g.save(); g.beginPath(); g.moveTo(-5, 0); g.lineTo(238, 0); for (let y = 0; y <= SH; y += 10) g.lineTo(238 + sin(y * 0.05) * 4, y); g.lineTo(-5, SH); g.closePath(); g.clip();
  ridge(g, 166, 3, 0.04, 0.5, '#8cc26a', { shadow: false }); ridge(g, 188, 4, 0.035, 2, '#74b25a'); ridge(g, 226, 3, 0.04, 4, '#5fa04e');
  g.fillStyle = '#4aaec0'; for (const [cy, w] of [[200, 160], [236, 200]]) { g.beginPath(); g.moveTo(0, cy); g.quadraticCurveTo(w * 0.5, cy - 14, w, cy + 6); g.lineTo(w, cy + 12); g.quadraticCurveTo(w * 0.5, cy - 4, 0, cy + 10); g.fill(); }
  for (const [px, py, ph] of [[26, 262, 0], [74, 276, 2], [124, 258, 1], [176, 272, 3]]) papyrus(g, px, py, 56, T, ph, { n: 5, calm: o.calm });
  for (const [bx, by] of [[40, 190], [100, 196], [160, 186]]) bird(g, bx + sin(T * 0.5 + bx) * 6, by - 40 - (bx % 3) * 10, 0.8, T, bx, '#fffaf0', '#1c1816', o.calm);
  g.restore();
  // Oberägypten (rechts): Wüste, Kalksteinfelsen, Lotosteich
  g.save(); g.beginPath(); g.moveTo(242, 0); g.lineTo(SW + 5, 0); g.lineTo(SW + 5, SH); for (let y = SH; y >= 0; y -= 10) g.lineTo(242 + sin(y * 0.05 + 1) * 4, y); g.closePath(); g.clip();
  crags(g, 176, 58, 5, '#e2c48a', { strata: 'rgba(150,100,40,.25)' }); ridge(g, 204, 5, 0.03, 1, '#e8cd92'); ridge(g, 240, 4, 0.035, 3, '#dcbb78');
  g.fillStyle = '#3f9bb6'; g.beginPath(); g.ellipse(386, 262, 82, 20, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(386, 258, 74, 14, 0, PI, TAU); g.fill();
  for (const [lx, ly, k] of [[350, 262, 'weiss'], [388, 268, 'blau'], [420, 258, 'weiss'], [372, 254, 'blau'], [404, 273, 'blau']]) lotus(g, lx, ly, 1.1, T, lx, k);
  palm(g, 292, 244, 78, T, 1, { calm: o.calm, lean: 5, dates: true }); palm(g, 462, 250, 92, T, 4, { calm: o.calm, lean: -6 });
  g.restore();
  // Mitte: Sockel und König
  const kx = 240, ky = 262, ks = 2.15;
  cut(g, '#c4985e', (c) => { c.rect(kx - 52, ky, 104, 26); }, { sx: 1.5, sy: 3, blur: 3 });
  g.fillStyle = EG.gold; g.fillRect(kx - 52, ky, 104, 3); g.fillStyle = EG.lapis; g.fillRect(kx - 52, ky + 5, 104, 2); g.fillStyle = 'rgba(70,35,10,.16)'; g.fillRect(kx - 52, ky + 8, 104, 18);
  g.strokeStyle = 'rgba(80,45,15,.3)'; g.lineWidth = 0.6; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(kx - 52 + i * 26, ky + 8); g.lineTo(kx - 52 + i * 26, ky + 26); g.stroke(); }
  glow(g, kx + 4, 150, 105, '255,226,150', 0.5);
  const king = egyptian(g, kx, ky, ks, 1, 'stand', T * 0.8, { collar: true, beard: true, apron: true, hold: 'regalia', belt: EG.gold });
  // Kronen: Rot (Unterägypten), Weiß (Oberägypten), dann beide zusammen
  const crownAt = (kind, since, outP) => {
    const drop = clamp(since / 0.7), e = 1 - Math.pow(1 - drop, 3), yo = -(1 - e) * 60 - (outP != null ? outP * 55 : 0), a = outP != null ? 1 - outP : clamp(since / 0.2) * (C > 14.2 ? 1 - clamp((C - 14.2) / 0.8) : 1);
    if (a <= 0.01) return; g.save(); g.globalAlpha = a; crownIcon(g, king.head[0], king.head[1] + 2.5 * ks + yo, ks, kind); g.restore();
  };
  let kind, since, prevK = null;
  if (C < 4.8) { kind = 'rot'; since = C; } else if (C < 9.6) { kind = 'weiss'; since = C - 4.8; prevK = 'rot'; } else { kind = 'doppel'; since = C - 9.6; prevK = 'weiss'; }
  if (prevK && since < 0.6) crownAt(prevK, 1, since / 0.6);
  crownAt(kind, since);
  if (since < 1.0 && !o.calm || (o.calm && since < 0.6)) { for (let i = 0; i < 9; i++) { const a = i * TAU / 9 + 0.3, r = 8 + since * 55, px = king.head[0] + 6 + cos(a) * r, py = king.head[1] - 22 + sin(a) * r * 0.8; g.fillStyle = `rgba(255,236,160,${1 - since / 1.0})`; g.fillRect(px - 1.3, py - 1.3, 2.6, 2.6); g.fillRect(px - 0.5, py - 3.4, 1, 6.8); } }
  // Kronen-Schilder unten, die zur Doppelkrone zusammenlaufen
  const merge = ease((C - 8.2) / 1.3), fadeAll = C > 14.2 ? clamp((C - 14.2) / 0.8) : 0;
  const plate = (px, kindIcon, label, active, ex) => {
    const u = ex, X = lerp(px, kx + 4, u), Y = lerp(270, 90, u), a = (1 - u) * (1 - fadeAll * 0.5) + 0;
    if (a <= 0.02) return; g.save(); g.globalAlpha = a;
    if (active) glow(g, X, Y - 14, 34, kindIcon === 'rot' ? '230,90,60' : '255,250,230', 0.5 + 0.2 * sin(t * 4 * cm));
    cut(g, '#e9d9a8', (c) => c.roundRect(X - 38, Y + 2, 76, 14, 3), { sx: 1, sy: 1.6, blur: 1.4, lw: 0.6 });
    g.fillStyle = '#4a3418'; g.font = 'bold 8.5px Georgia'; g.textAlign = 'center'; g.fillText(label, X, Y + 12);
    crownIcon(g, X, Y - 1, 2.05, kindIcon); g.restore();
  };
  plate(66, 'rot', 'Unterägypten', C < 4.8 || C > 9.6, merge); plate(414, 'weiss', 'Oberägypten', (C >= 4.8 && C < 9.6) || C > 9.6, merge);
  { const a = ease((C - 10.2) / 0.6) * (1 - fadeAll); if (a > 0.02) { g.save(); g.globalAlpha = a; cut(g, '#e9d9a8', (c) => c.roundRect(kx - 40, ky + 8, 80, 14, 3), { sx: 1, sy: 1.6, blur: 1.4, lw: 0.6 }); g.fillStyle = '#4a3418'; g.font = 'bold 8.5px Georgia'; g.textAlign = 'center'; g.fillText('Doppelkrone', kx, ky + 18); g.restore(); } }
}

// ---------------------------------------------------------------- 3 Stufenpyramide (ca. 2650 v. Chr., Teaser)
function stufenpyramide(g, t, o) {
  const cm = o.calm ? 0.5 : 1, L = 22, C = mod(t, L);
  vgrad(g, [[0, '#8fcde2'], [0.65, '#f5e6bc'], [1, '#f9ecc8']], 0, 220);
  sunDisc(g, 70, 70, 16, '#fff0b8', '255,214,130', 0.5);
  crags(g, 196, 26, 9, '#e8d3a0', { shadow: false });
  // Umfassungsmauer mit Nischen
  cut(g, '#efe2bc', (c) => c.rect(-10, 200, SW + 20, 30), { sx: 0, sy: 2, blur: 2, lw: 0.5 });
  g.fillStyle = 'rgba(110,80,35,.24)'; for (let x = 4; x < SW; x += 17) g.fillRect(x, 207, 7, 19); g.fillStyle = '#e1d0a0'; g.fillRect(-10, 200, SW + 20, 4);
  ridge(g, 236, 4, 0.03, 1, '#e4c78a');
  // wachsende Stufenpyramide
  const u = clamp(C / 14), stage = Math.min(5, Math.floor(u * 6)), fr = u * 6 - stage, built = u >= 1 ? 6 : stage + ease(fr / 0.72);
  const fade = C > 19 ? 1 - clamp((C - 19) / 1.2) : 1, px = 240, py = 252;
  g.save(); g.globalAlpha = fade;
  const lit = '#f1e1b6', dk = '#c5a975';
  stepPyramid(g, px, py, 232, 162, 6, built, { lit, dark: dk });
  g.restore();
  if (C > 13.2 && C < 19 && !o.calm) { const a = 0.35 * (1 - Math.abs(C - 15.5) / 3); glow(g, px, py - 162, 110, '255,230,150', Math.max(0, a)); }
  // Baustelle: kleine Hebehölzer und Stoßstaub an der wachsenden Stufe
  if (C < 14) { const topY = py - (stage + ease(fr / 0.72)) * 27, wd = 232 * Math.pow(0.738, stage) * 0.5; dust(g, px + wd * 0.9, topY + 10, t, o); dust(g, px - wd * 0.8, topY + 12, t + 1.5, o); }
  // Pfad mit Trägern und Schlitten
  paper(g, '#d6b574', (c) => { c.moveTo(-10, 276); c.quadraticCurveTo(240, 262, SW + 10, 280); c.lineTo(SW + 10, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: false });
  const ph = t * 3 * cm;
  haul(g, mod(t * 9 * cm, 640) - 150, 292, 0.62, 1, t, 3, ph);
  for (let i = 0; i < 3; i++) egyptian(g, mod(-t * 11 * cm + i * 70 + 460, 640) - 80, 281 + (i % 2) * 5, 0.5, -1, 'carry', ph + i, { hold: 'basketHead', kilt: '#efe1c4' });
  egyptian(g, 408, 292, 0.8, -1, 'point', t, { hold: 'staff', head: 'band' }); // Baumeister
  palm(g, 22, 262, 66, t * cm, 1, { calm: o.calm, lean: 4 }); palm(g, 462, 262, 60, t * cm, 3, { calm: o.calm, lean: -4 });
  for (let k = 0; k < 2; k++) bird(g, mod(t * 10 * cm + k * 240, 560) - 40, 52 + k * 20, 0.8, t * cm, k, '#fffaf0', '#1c1816', o.calm);
}

// ---------------------------------------------------------------- 4 Pyramide mit Rampe (ca. 2560 v. Chr., Teaser)
function rampe(g, t, o) {
  const cm = o.calm ? 0.5 : 1, T = t * cm;
  vgrad(g, [[0, '#7fc3dc'], [0.55, '#f7e4b6'], [1, '#e9cf92']], 0, SH);
  sunDisc(g, 410, 56, 14, '#fff3c4', '255,232,150', 0.5);
  ridge(g, 222, 3, 0.03, 0.2, '#ecd49c', { shadow: false });
  const cx = 150, cy = 250, w = 236, h = 146, topF = 0.84, r = 0.17;
  const pyr = frustum(g, cx, cy, w, h * topF, r, { lit: '#f0dfb2', dark: '#c3a574', courses: 14 });
  // Rampe an der rechten Flanke: breiter Damm aus Lehmziegeln und Schutt
  const f0 = 0.6, B = [lerp(pyr.R[0], pyr.Rt[0], f0), lerp(pyr.R[1], pyr.Rt[1], f0)], A = [458, cy + 2], Cc = [pyr.R[0] - 1, cy + 1], m = (B[1] - A[1]) / (B[0] - A[0]);
  cut(g, '#d9ae7a', (c) => { c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(Cc[0], Cc[1]); c.closePath(); }, { sx: 2, sy: 2, blur: 2, lw: 0.9 });
  g.save(); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.lineTo(Cc[0], Cc[1]); g.closePath(); g.clip();
  g.strokeStyle = 'rgba(110,70,30,.3)'; g.lineWidth = 0.8; for (let y2 = cy - 4; y2 > B[1]; y2 -= 6) { g.beginPath(); g.moveTo(0, y2); g.lineTo(SW, y2); g.stroke(); }
  g.strokeStyle = 'rgba(110,70,30,.2)'; for (let y2 = cy - 4, k = 0; y2 > B[1]; y2 -= 6, k++) for (let x2 = (k % 2) * 9; x2 < SW; x2 += 18) { g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2, y2 - 6); g.stroke(); }
  g.fillStyle = 'rgba(70,40,10,.14)'; g.fillRect(0, cy - 20, SW, 30);
  g.restore();
  g.strokeStyle = '#f0d6a0'; g.lineWidth = 2; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
  for (let i = 1; i < 9; i++) { const f = i / 9, px = lerp(A[0], B[0], f), py2 = lerp(A[1], B[1], f); g.strokeStyle = '#7a4f2a'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(px, py2); g.lineTo(px, py2 - 5); g.stroke(); }
  // Zuggruppen laufen die Rampe hinauf (Schlitten mit Steinblöcken)
  for (let k = 0; k < 3; k++) {
    const u = mod(T * 0.05 + k / 3, 1), px = lerp(A[0] - 24, B[0] + 70, u), yy = A[1] + m * (px - A[0]), a = clamp(u / 0.06) * clamp((1 - u) / 0.08);
    g.save(); g.globalAlpha = a; g.translate(px, yy - 1); g.transform(1, m, 0, 1, 0, 0); haul(g, 0, 0, 0.44, -1, T, 3, T * 3 + k); g.restore();
  }
  // oben auf der Pyramide setzen Arbeiter die Blöcke
  { const tx = (pyr.Lt[0] + pyr.Rt[0]) / 2, ty = (pyr.Lt[1] + pyr.Rt[1]) / 2 + 3; for (let i = 0; i < 3; i++) egyptian(g, tx - 12 + i * 14, ty + (i % 2) * 2, 0.34, i % 2 ? -1 : 1, 'bend', T * 2 + i, { kilt: '#efe1c4' }); }
  // Arbeiter am Lager: Brot, Bier, Rast (bezahlt und versorgt)
  paper(g, '#dcbc80', (c) => { c.moveTo(-10, 262); c.quadraticCurveTo(200, 254, SW + 10, 270); c.lineTo(SW + 10, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: false });
  cut(g, '#c98e58', (c) => { c.moveTo(14, 258); c.lineTo(96, 258); c.lineTo(104, 276); c.lineTo(6, 276); c.closePath(); }, { sx: 1.5, sy: 2.4, blur: 2 }); // Schattendach
  g.strokeStyle = '#6a4a28'; g.lineWidth = 2; g.beginPath(); g.moveTo(16, 258); g.lineTo(14, 290); g.moveTo(94, 258); g.lineTo(98, 290); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 5; i++) g.fillRect(14 + i * 17, 259, 8, 17);
  for (let i = 0; i < 3; i++) { const jx = 118 + i * 14; cut(g, '#b8734a', (c) => { c.moveTo(jx - 4, 296); c.quadraticCurveTo(jx - 8, 286, jx - 3, 280); c.lineTo(jx + 3, 280); c.quadraticCurveTo(jx + 8, 286, jx + 4, 296); c.closePath(); }, { sx: 0.8, sy: 1.2, blur: 1, lw: 0.5 }); }
  for (let i = 0; i < 3; i++) { const bx = 168 + i * 20; cut(g, '#d6b26a', (c) => { c.moveTo(bx - 8, 296); c.lineTo(bx - 6, 285); c.lineTo(bx + 6, 285); c.lineTo(bx + 8, 296); c.closePath(); }, { sx: 0.8, sy: 1.2, blur: 1, lw: 0.5 }); g.fillStyle = '#ecd7a0'; g.beginPath(); g.ellipse(bx - 2, 285, 3.6, 2.6, 0, 0, TAU); g.ellipse(bx + 3, 285.5, 3.2, 2.4, 0, 0, TAU); g.fill(); }
  egyptian(g, 40, 292, 0.8, 1, 'sit', 0, { kilt: '#efe1c4' }); egyptian(g, 70, 292, 0.8, -1, 'sit', 0, {});
  egyptian(g, 214, 296, 0.85, -1, 'offer', t * cm, { sex: 'f', hold: 'tray' });
  egyptian(g, 330, 294, 0.85, 1, 'carry', T * 3, { hold: 'jarHead', kilt: '#efe1c4' });
  egyptian(g, 372, 292, 0.8, -1, 'stand', T, { hold: 'staff', head: 'band' });
  for (let k = 0; k < 2; k++) bird(g, mod(T * 12 + k * 260, 560) - 40, 40 + k * 22, 0.8, T, k, '#fffaf0', '#1c1816', o.calm);
}


// periodische Hügelkette (nahtlos scrollbar über SW)
function hillBand(g, base, amp, off, fill, o = {}) {
  paper(g, fill, (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 6) { const u = (x + off) / SW * TAU; c.lineTo(x, base + amp * (sin(u * 2 + (o.ph || 0)) + 0.5 * sin(u * 5 + 1 + (o.ph || 0)))); } c.lineTo(SW + 10, SH + 10); c.closePath(); }, { shadow: o.shadow === true, sy: 1.5 });
}
// Tempeltor (Pylon) mit Fahnenmasten, Mitte x, Boden base
function pylon(g, x, base, w, h) {
  const K = gk(g);
  for (const sx of [-1, 1]) {
    const cx = x + sx * w * 0.3;
    cut(g, '#e9d6a6', (c) => { c.moveTo(cx - w * 0.2, base); c.lineTo(cx - w * 0.16, base - h); c.lineTo(cx + w * 0.16, base - h); c.lineTo(cx + w * 0.2, base); c.closePath(); }, { K, sx: 1.4, sy: 1.8, blur: 1.6 });
    g.fillStyle = 'rgba(100,70,30,.2)'; g.fillRect(cx + 1, base - h, w * 0.18, h);
    g.strokeStyle = '#7a4f2a'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(cx, base - h * 0.5); g.lineTo(cx, base - h - 12); g.stroke();
    g.fillStyle = EG.carn; g.beginPath(); g.moveTo(cx, base - h - 12); g.lineTo(cx + 7, base - h - 9); g.lineTo(cx, base - h - 6); g.fill();
  }
  cut(g, '#e9d6a6', (c) => c.rect(x - w * 0.15, base - h * 0.78, w * 0.3, h * 0.78), { K, shadow: false });
  g.fillStyle = '#4a3220'; g.fillRect(x - w * 0.07, base - h * 0.5, w * 0.14, h * 0.5);
  g.fillStyle = EG.gold; g.fillRect(x - w * 0.15, base - h * 0.8, w * 0.3, 2);
}
// Terrassentempel vor Felswand (Deir el-Bahari), Mitte x, Boden base, Breite w, Höhe h der Terrassen
function terrassentempel(g, x, base, w, h) {
  const K = gk(g);
  cut(g, '#d9b27a', (c) => { c.moveTo(x - w * 0.78, base + 6); c.lineTo(x - w * 0.72, base - h * 1.8); c.lineTo(x - w * 0.3, base - h * 2.15); c.lineTo(x + w * 0.1, base - h * 1.95); c.lineTo(x + w * 0.5, base - h * 2.2); c.lineTo(x + w * 0.78, base - h * 1.7); c.lineTo(x + w * 0.82, base + 6); c.closePath(); }, { K, sx: 1.5, sy: 2, blur: 2 });
  g.strokeStyle = 'rgba(120,80,35,.3)'; g.lineWidth = 0.9; for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(x + i * w * 0.12, base - h * 1.1); g.lineTo(x + i * w * 0.12 + 3, base - h * 2.0 + Math.abs(i) * 4); g.stroke(); }
  for (let i = 0; i < 3; i++) {
    const ww = w * (1 - i * 0.14), yb = base - i * h / 3, hh = h / 3 - 1;
    cut(g, '#efe0b8', (c) => c.rect(x - ww / 2, yb - hh, ww, hh), { K, sx: 1.2, sy: 1.6, blur: 1.4, lw: 0.6 });
    g.fillStyle = 'rgba(90,60,25,.42)'; const nc = Math.floor(ww / 7); for (let k = 0; k < nc; k++) g.fillRect(x - ww / 2 + 4 + k * (ww - 8) / (nc - 1) - 1.2, yb - hh + 3, 2.4, hh - 5);
    g.fillStyle = '#d6c08a'; g.fillRect(x - ww / 2 - 1, yb - hh - 1.4, ww + 2, 2.2);
  }
  g.fillStyle = '#f6ecc8'; g.beginPath(); g.moveTo(x - w * 0.05, base); g.lineTo(x + w * 0.05, base); g.lineTo(x + w * 0.02, base - h * 0.9); g.lineTo(x - w * 0.02, base - h * 0.9); g.fill();
}
function weihrauchStein(g, x, y, s) { g.fillStyle = '#f1dfa0'; g.strokeStyle = 'rgba(160,120,40,.6)'; g.lineWidth = 0.4; g.beginPath(); g.ellipse(x, y, 1.7 * s, 1.3 * s, 0.4, 0, TAU); g.fill(); g.stroke(); }
// Korb mit goldenen Weihrauchklümpchen
function harzKorb(g, x, base, s) {
  const K = gk(g);
  cut(g, '#c9a05a', (c) => { c.moveTo(x - 10 * s, base); c.lineTo(x - 7 * s, base - 11 * s); c.lineTo(x + 7 * s, base - 11 * s); c.lineTo(x + 10 * s, base); c.closePath(); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  g.strokeStyle = 'rgba(100,60,20,.4)'; g.lineWidth = 0.6; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(x - 9 * s, base - i * 3.6 * s); g.lineTo(x + 9 * s, base - i * 3.6 * s); g.stroke(); }
  for (let i = 0; i < 9; i++) weihrauchStein(g, x - 6 * s + (i % 5) * 3 * s, base - 11.5 * s - (i % 2) * 1.6 * s, s);
}

// ---------------------------------------------------------------- 5 Schiffe mit Weihrauch aus Punt (ca. 2000 v. Chr.)
function puntSchiffe(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm;
  vgrad(g, [[0, '#6cb2d6'], [0.5, '#f7d8a0'], [1, '#f6bf8a']], 0, 176);
  sunDisc(g, 86, 134, 19, '#ffe9a8', '255,170,90', 0.75);
  crags(g, 170, 34, 21, '#e6bf86', { shadow: false });
  ridge(g, 172, 2, 0.05, 1, '#7fb060', { shadow: false });
  pylon(g, 420, 174, 70, 36);
  for (const [px, ph] of [[300, 0], [346, 2], [470, 1]]) palm(g, px, 176, 30, T, ph, { calm: o.calm, lean: 2 });
  nilWater(g, 174, 262, T, { sunX: 86, calm: o.calm, top: '#76bcc4', bot: '#2d7c92', sunCol: '255,214,150' });
  // Flussschiffe fahren vorbei
  ship(g, mod(T * 6 + 290, 700) - 110, 196, 0.62, 1, T, { cargo: 'sacks', ph: 1, calm: o.calm, hull: '#b27a46' });
  ship(g, mod(T * 7 + 470, 720) - 120, 214, 0.86, 1, T, { cargo: 'baskets', ph: 2, calm: o.calm, sailCol: '#fbf3dc' });
  ship(g, mod(T * 9 + 80, 740) - 130, 240, 1.12, 1, T, { cargo: 'baskets', oars: 6, rowSpd: 0.8, calm: o.calm });
  // Kai mit Priester, Räucherschale und Körben
  paper(g, '#dcc08a', (c) => { c.moveTo(-10, 262); c.lineTo(SW + 10, 266); c.lineTo(SW + 10, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: true });
  g.fillStyle = '#c8aa72'; g.fillRect(-10, 266, SW + 20, 4); g.strokeStyle = 'rgba(110,80,40,.35)'; g.lineWidth = 0.7; for (let x = -4; x < SW; x += 24) { g.beginPath(); g.moveTo(x, 266); g.lineTo(x, 270); g.stroke(); }
  // Räucherschale
  const sx = 150, sy = 292, K = gk(g);
  cut(g, '#d6a838', (c) => { c.moveTo(sx - 5, sy); c.lineTo(sx - 2, sy - 22); c.lineTo(sx + 2, sy - 22); c.lineTo(sx + 5, sy); c.closePath(); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  cut(g, EG.gold, (c) => { c.moveTo(sx - 11, sy - 24); c.quadraticCurveTo(sx, sy - 12, sx + 11, sy - 24); c.closePath(); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  glow(g, sx, sy - 25, 14, '255,120,40', 0.65 + 0.2 * sin(T * 6));
  smoke(g, sx, sy - 26, T, { h: 80, n: 9, col: '248,240,255', a: 0.55, drift: 10, grow: 7, calm: o.calm });
  egyptian(g, 112, 296, 1.2, 1, 'raise', T * 1.4, { wig: false, collar: 'gold', kilt: '#fffaf0' });
  egyptian(g, 192, 296, 0.95, -1, 'offer', T, { sex: 'f', hold: 'tray' });
  harzKorb(g, 262, 294, 1.2); harzKorb(g, 286, 298, 1.0); harzKorb(g, 340, 296, 1.3);
  egyptian(g, mod(-T * 12 + 600, 700) - 60, 300, 1.0, -1, 'carry', T * 3.2, { hold: 'basketHead', kilt: '#efe1c4' });
  // kleiner Weihrauchbaum im Topf
  cut(g, '#c98a56', (c) => { c.moveTo(210, 298); c.lineTo(213, 288); c.lineTo(229, 288); c.lineTo(232, 298); c.closePath(); }, { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  g.strokeStyle = '#7a5530'; g.lineWidth = 2; g.beginPath(); g.moveTo(221, 288); g.quadraticCurveTo(216, 276, 224, 266); g.moveTo(221, 282); g.quadraticCurveTo(228, 276, 232, 270); g.stroke();
  g.fillStyle = '#6aa24e'; for (const [dx, dy, r] of [[224, 263, 6], [231, 268, 5], [216, 272, 4.5], [221, 258, 4]]) { g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.fill(); }
  palm(g, 462, 300, 70, T, 3, { calm: o.calm, lean: -6 }); papyrus(g, 28, 300, 44, T, 1, { n: 4, calm: o.calm });
  for (let k = 0; k < 2; k++) bird(g, mod(T * 11 + k * 250, 560) - 40, 56 + k * 18, 0.85, T, k, '#fffaf0', '#1c1816', o.calm);
}

// ---------------------------------------------------------------- 6 Streitwagen und Pferd (Hyksos, ca. 1700 v. Chr.)
function wagen(g, t, o) {
  const cm = o.calm ? 0.5 : 1, T = t * cm, v = 62 * cm, ph = T * 7.2;
  vgrad(g, [[0, '#86c6e0'], [0.55, '#f8e2b0'], [1, '#fbe9c4']], 0, 205);
  sunDisc(g, 392, 70, 17, '#fff0b8', '255,214,130', 0.55);
  hillBand(g, 176, 8, t * 5 * cm, '#e6cd96'); hillBand(g, 202, 6, t * 12 * cm + 90, '#dcc17f', { ph: 2 });
  // ferne Siedlung im Delta: Lehmhäuser und Palmen scrollen langsam
  for (let i = 0; i < 6; i++) { const x = mod(i * 110 + 40 - t * 16 * cm, 660) - 90; cut(g, '#cda26c', (c) => c.rect(x, 192, 24, 14), { sx: 0.8, sy: 1.2, blur: 1, lw: 0.5 }); g.fillStyle = '#4a3220'; g.fillRect(x + 9, 198, 5, 8); palm(g, x + 40, 207, 34, T, i, { calm: o.calm, lean: 2 }); }
  paper(g, '#e6c88a', (c) => { c.moveTo(-10, 232); c.lineTo(SW + 10, 232); c.lineTo(SW + 10, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: false });
  hillBand(g, 232, 3, t * 26 * cm + 40, '#e0be7e', { ph: 1 });
  // Fahrbahn
  paper(g, '#d6b26e', (c) => { c.moveTo(-10, 262); c.lineTo(SW + 10, 262); c.lineTo(SW + 10, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: true });
  g.fillStyle = 'rgba(120,80,30,.2)'; for (let i = 0; i < 16; i++) { const x = mod(i * 47 - t * v, 560) - 40; g.beginPath(); g.ellipse(x, 270 + (i % 4) * 7, 6 + (i % 3) * 2, 1.8, 0, 0, TAU); g.fill(); }
  // Pferd und Wagen
  const hs = 1.6, hx = 338, gy = 280, bounce = Math.abs(sin(ph * 0.5)) * 1.5 * (o.calm ? 0.4 : 1);
  const ws = 1.85, ax = hx - 172, wr = 14 * ws, wy = gy;
  g.save(); g.translate(0, -bounce * 0.5);
  // Deichsel zum Pferd
  g.strokeStyle = '#7a4a22'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax + 6 * ws, wy - 19 * ws); g.quadraticCurveTo(hx - 10, gy - 40 * hs, hx + 14 * hs, gy - 55 * hs); g.stroke();
  // Wagenkasten
  const K = gk(g);
  g.save(); g.translate(ax, wy); g.scale(ws, ws);
  cut(g, EG.gold, (c) => { c.moveTo(-13, -16); c.lineTo(-13, -22); c.quadraticCurveTo(-8, -32, 0, -38); c.quadraticCurveTo(6, -43, 11, -40); c.lineTo(12, -16); c.closePath(); }, { K, sx: 1.2, sy: 1.6, blur: 1.4, lw: 0.7 });
  g.fillStyle = EG.carn; g.beginPath(); g.moveTo(-10, -17); g.lineTo(-10, -22); g.quadraticCurveTo(-6, -30, 0, -35); g.quadraticCurveTo(5, -38, 9, -37); g.lineTo(10, -17); g.closePath(); g.fill();
  g.fillStyle = EG.lapis; g.fillRect(-13, -18, 25, 2.2); g.fillStyle = EG.turq; g.beginPath(); g.arc(3, -27, 2.6, 0, TAU); g.fill(); g.fillStyle = EG.gold; g.beginPath(); g.arc(3, -27, 1.1, 0, TAU); g.fill();
  g.restore();
  // Lenker
  const drv = egyptian(g, ax - 1, wy - 17 * ws, 1.6, 1, 'point', T, { kilt: '#c9503a', head: 'band', collar: 'gold', handA: [12, 4] });
  // Rad mit Speichen
  g.save(); g.translate(ax, wy - wr); g.shadowColor = 'rgba(30,12,4,.4)'; g.shadowOffsetX = 1.2 * K; g.shadowOffsetY = 2 * K; g.shadowBlur = 1.6 * K;
  g.strokeStyle = '#8a5a2e'; g.lineWidth = 2.8; g.beginPath(); g.arc(0, 0, wr, 0, TAU); g.stroke(); g.shadowColor = 'transparent';
  g.strokeStyle = '#f2dca0'; g.lineWidth = 0.6; g.beginPath(); g.arc(0, 0, wr + 1.5, 0, TAU); g.stroke();
  const ang = (t * v) / wr; g.strokeStyle = '#a0713a'; g.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const a = ang + i * PI / 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(cos(a) * wr, sin(a) * wr); g.stroke(); }
  g.fillStyle = EG.gold; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill();
  g.restore();
  g.restore();
  horse(g, hx, gy - bounce, hs, 1, T, { ph, calm: o.calm });
  // Zügel
  g.strokeStyle = '#5a3a1e'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(drv.hand[0], drv.hand[1]); g.quadraticCurveTo((drv.hand[0] + hx + 46 * hs) / 2, drv.hand[1] + 6, hx + 44 * hs, gy - 62 * hs - bounce); g.stroke();
  // Staub hinter dem Rad und den Hufen
  for (let i = 0; i < 8; i++) { const u = mod(T * 1.4 + i / 8, 1); g.fillStyle = `rgba(214,184,130,${0.5 * (1 - u)})`; g.beginPath(); g.arc(ax - 12 - u * 60, gy - 2 - u * 8 + (i % 3), 3 + u * 9, 0, TAU); g.fill(); }
  // Vordergrund: Gräser fliegen vorbei
  for (let i = 0; i < 5; i++) { const x = mod(i * 140 + 30 - t * v * 1.5, 700) - 110; reeds(g, x, 296, 22, T, i, 4, '#7fa850'); }
  for (let k = 0; k < 2; k++) bird(g, mod(T * 13 + k * 260, 560) - 40, 40 + k * 22, 0.85, T, k, '#fffaf0', '#1c1816', o.calm);
}

// ---------------------------------------------------------------- 7 Hatschepsut und die Punt-Flotte (ca. 1470 v. Chr.)
function hatschepsut(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm;
  vgrad(g, [[0, '#6fbfe0'], [0.55, '#f9e6b8'], [1, '#fdeecb']], 0, 190);
  sunDisc(g, 70, 56, 16, '#fff3c4', '255,232,150', 0.5);
  terrassentempel(g, 372, 176, 150, 54);
  ridge(g, 178, 2, 0.05, 1, '#78ae5e', { shadow: false });
  nilWater(g, 180, SH, T, { calm: o.calm, top: '#4fb4c8', bot: '#1f6f90' });
  // Flotte mit Weihrauchbäumen, Segel gebläht
  ship(g, mod(T * 5 + 330, 640) - 100, 200, 0.6, 1, T, { cargo: 'trees', ph: 3, calm: o.calm, hull: '#b27a46' });
  ship(g, mod(T * 7 + 150, 660) - 110, 222, 0.82, 1, T, { cargo: 'trees', oars: 6, ph: 1, rowSpd: 0.8, calm: o.calm });
  ship(g, mod(T * 9 + 470, 700) - 120, 250, 1.1, 1, T, { cargo: 'trees', oars: 6, ph: 2, rowSpd: 0.8, calm: o.calm });
  // Kai mit Königin und Gefolge
  paper(g, '#dcc08a', (c) => { c.moveTo(-10, 252); c.lineTo(250, 256); c.lineTo(250, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: true });
  g.fillStyle = '#c8aa72'; g.fillRect(-10, 256, 260, 4); g.strokeStyle = 'rgba(110,80,40,.35)'; g.lineWidth = 0.7; for (let x = 2; x < 250; x += 22) { g.beginPath(); g.moveTo(x, 256); g.lineTo(x, 260); g.stroke(); }
  // Baldachin-Standarte
  g.strokeStyle = '#7a4f2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(24, 296); g.lineTo(24, 168); g.stroke(); g.fillStyle = EG.carn; g.beginPath(); g.moveTo(24, 168); g.quadraticCurveTo(40 + sin(T * 1.6) * 3, 172, 54 + sin(T * 1.6) * 4, 190); g.lineTo(24, 186); g.fill(); g.fillStyle = EG.gold; g.beginPath(); g.arc(24, 166, 3, 0, TAU); g.fill();
  const q = egyptian(g, 130, 289, 1.85, 1, 'point', T * 1.2, { sex: 'f', head: 'nemes', beard: true, collar: true, kilt: '#fffaf0', belt: EG.gold, apron: true, longDress: false, handA: [20.5, 2 + sin(T * 1.2) * 1] });
  egyptian(g, 62, 290, 1.3, 1, 'stand', T, { hold: 'fan', head: 'band' });
  egyptian(g, 200, 293, 1.15, -1, 'offer', T, { hold: 'scroll', kilt: '#efe1c4', head: 'band' });
  egyptian(g, 226, 293, 1.0, -1, 'carry', T * 3, { hold: 'basketHead', kilt: '#efe1c4' });
  harzKorb(g, 162, 297, 1.0);
  palm(g, 232, 262, 52, T, 1, { calm: o.calm, lean: 3 });
  for (let k = 0; k < 3; k++) bird(g, mod(T * 11 + k * 190, 560) - 40, 46 + k * 16, 0.85, T, k, '#fffaf0', '#1c1816', o.calm);
}

// ---------------------------------------------------------------- 8 Echnaton und die Sonnenscheibe Aton (ca. 1350 v. Chr.)
function aton(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm, sxp = 188, syp = 66, R = 29;
  vgrad(g, [[0, '#e0683a'], [0.4, '#f6a35a'], [0.75, '#fbd890'], [1, '#fde8b4']], 0, 230);
  glow(g, sxp, syp, 190, '255,230,150', 0.55);
  crags(g, 214, 34, 31, '#d8a066', { shadow: false });
  ridge(g, 224, 3, 0.04, 2, '#e3b878', { shadow: false });
  paper(g, '#e8cf98', (c) => { c.moveTo(-10, 240); c.lineTo(SW + 10, 240); c.lineTo(SW + 10, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: false });
  g.strokeStyle = 'rgba(120,80,30,.25)'; g.lineWidth = 0.8; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, 246 + i * 11); g.lineTo(SW, 246 + i * 11); g.stroke(); } for (let i = -4; i < 14; i++) { g.beginPath(); g.moveTo(240 + (i - 5) * 50, 240); g.lineTo(240 + (i - 5) * 90, SH); g.stroke(); }
  for (const fx of [26, 60]) { g.strokeStyle = '#7a4f2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, 244); g.lineTo(fx, 120); g.stroke(); g.fillStyle = EG.carn; g.beginPath(); g.moveTo(fx, 120); g.quadraticCurveTo(fx + 14 + sin(T * 2 + fx) * 2, 124, fx + 22 + sin(T * 2 + fx) * 3, 140); g.lineTo(fx, 140); g.fill(); g.fillStyle = EG.gold; g.fillRect(fx, 140, 10, 2); }
  palm(g, 450, 244, 56, T, 2, { calm: o.calm, lean: -3 });
  // Königsfamilie (Positionen), Gesichter als Ziel der Strahlen
  const fam = [[330, 284, 1.75, 'k'], [392, 288, 1.65, 'q'], [432, 290, 1.0, 'd'], [456, 292, 0.82, 'd']];
  const targets = fam.map(([x, y, s]) => [x - s * 6.5, y - 58 * s]);
  // Strahlen (hinter den Figuren), jeder endet in einer kleinen Hand
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = 0.1 * PI + i / (N - 1) * 0.8 * PI, sw = sin(T * 0.9 + i * 1.3) * 0.012 * (o.calm ? 0.4 : 1);
    const L = 110 + ((i * 37) % 5) * 11, ex = sxp + cos(a + sw) * (R + L), ey = syp + sin(a + sw) * (R + L);
    if (ey > 226) continue;
    drawRay(g, sxp, syp, R, a + sw, L, 0.62);
    tinyHand(g, ex, ey, a + sw, 1.2, EG.gold);
  }
  targets.forEach(([tx, ty], i) => { const a = Math.atan2(ty - syp, tx - sxp), d = Math.hypot(tx - sxp, ty - syp) - 10 - R; drawRay(g, sxp, syp, R, a, d, 0.95); });
  // Altar mit Gaben
  const ax = 238, ay = 266, K = gk(g);
  cut(g, '#dcc08a', (c) => c.rect(ax - 24, ay - 22, 48, 22), { K, sx: 1.5, sy: 2.4, blur: 2 }); g.fillStyle = 'rgba(80,50,15,.2)'; g.fillRect(ax, ay - 22, 24, 22); g.fillStyle = EG.gold; g.fillRect(ax - 24, ay - 22, 48, 2.5);
  for (let i = 0; i < 3; i++) { g.fillStyle = '#c08040'; g.beginPath(); g.ellipse(ax - 15 + i * 7, ay - 24, 3.2, 3, 0, PI, TAU); g.fill(); }
  for (let i = 0; i < 2; i++) { g.strokeStyle = EG.papyrus; g.lineWidth = 0.9; g.beginPath(); g.moveTo(ax + 6 + i * 8, ay - 22); g.lineTo(ax + 5 + i * 9, ay - 34); g.stroke(); g.fillStyle = '#9ec7ee'; g.beginPath(); g.ellipse(ax + 5 + i * 9, ay - 36, 2.2, 3.4, 0, 0, TAU); g.fill(); }
  const fl = 1 + 0.15 * sin(T * 9); glow(g, ax - 6, ay - 30, 12, '255,160,60', 0.5); g.fillStyle = '#f08a2c'; g.beginPath(); g.moveTo(ax - 9, ay - 25); g.quadraticCurveTo(ax - 10, ay - 33 * fl, ax - 6, ay - 38 * fl); g.quadraticCurveTo(ax - 2, ay - 33 * fl, ax - 3, ay - 25); g.fill();
  // Königsfamilie blickt zur Sonne
  egyptian(g, 330, 284, 1.75, -1, 'raise', T * 1.3, { head: 'blau', collar: true, apron: true, kilt: '#fffaf0' });
  egyptian(g, 392, 288, 1.65, -1, 'raise', T * 1.3 + 1, { sex: 'f', head: 'hoch', collar: true, kilt: '#fffaf0' });
  egyptian(g, 432, 290, 1.0, -1, 'raise', T * 1.3 + 2, { sex: 'f', child: true, wig: false, kilt: '#fffaf0' });
  egyptian(g, 456, 292, 0.82, -1, 'raise', T * 1.3 + 3, { sex: 'f', child: true, wig: false, kilt: '#fffaf0' });
  // Hände mit Anch vor den Gesichtern
  targets.forEach(([tx, ty]) => { const a = Math.atan2(ty - syp, tx - sxp), d = Math.hypot(tx - sxp, ty - syp) - 10, hx = sxp + cos(a) * d, hy = syp + sin(a) * d;
    tinyHand(g, hx, hy, a, 1.5, EG.gold); const ax2 = hx + cos(a) * 6, ay2 = hy + sin(a) * 6;
    g.strokeStyle = EG.gold; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax2, ay2 - 1); g.lineTo(ax2, ay2 + 7); g.moveTo(ax2 - 3, ay2 + 2.5); g.lineTo(ax2 + 3, ay2 + 2.5); g.stroke(); g.beginPath(); g.ellipse(ax2, ay2 - 2.6, 1.7, 2.3, 0, 0, TAU); g.stroke(); });
  // Sonnenscheibe Aton
  const dg = g.createRadialGradient(sxp - 8, syp - 8, 2, sxp, syp, R); dg.addColorStop(0, '#fff2b8'); dg.addColorStop(0.5, '#ffbe4a'); dg.addColorStop(1, '#e8602a');
  g.fillStyle = dg; g.beginPath(); g.arc(sxp, syp, R, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,245,200,.8)'; g.lineWidth = 1.5; g.stroke();
  g.strokeStyle = EG.gold; g.lineWidth = 1; g.beginPath(); g.arc(sxp, syp, R - 5, 0, TAU); g.stroke();
  for (let k = 0; k < 4; k++) bird(g, mod(T * 10 + k * 150, 560) - 40, 36 + (k % 2) * 40, 0.8, T, k, '#fffaf0', '#1c1816', o.calm);
}
function drawRay(g, x, y, R, a, L, al) {
  const x0 = x + cos(a) * R, y0 = y + sin(a) * R, x1 = x + cos(a) * (R + L), y1 = y + sin(a) * (R + L), nx = -sin(a), ny = cos(a);
  const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(255,236,160,${al})`); gr.addColorStop(1, `rgba(255,205,100,${al * 0.9})`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x0 + nx * 1, y0 + ny * 1); g.lineTo(x1 + nx * 2.4, y1 + ny * 2.4); g.lineTo(x1 - nx * 2.4, y1 - ny * 2.4); g.lineTo(x0 - nx * 1, y0 - ny * 1); g.closePath(); g.fill();
}

// ---------------------------------------------------------------- 9 Der junge König auf dem Thron (Tutanchamun, ca. 1332-1323 v. Chr.)
function lionLeg(g, x, y0, y1, w) {
  const K = gk(g);
  cut(g, EG.gold, (c) => { c.moveTo(x - w * 0.5, y0); c.bezierCurveTo(x - w, y0 + (y1 - y0) * 0.4, x - w * 0.5, y0 + (y1 - y0) * 0.7, x - w * 0.7, y1 - 3); c.lineTo(x - w * 0.8, y1); c.lineTo(x + w * 1.1, y1); c.lineTo(x + w * 0.9, y1 - 3); c.bezierCurveTo(x + w * 0.5, y0 + (y1 - y0) * 0.65, x + w * 0.7, y0 + (y1 - y0) * 0.35, x + w * 0.4, y0); c.closePath(); }, { K, sx: 1, sy: 1.6, blur: 1.4, lw: 0.7 });
  g.strokeStyle = EG.goldDk; g.lineWidth = 0.6; for (const k of [0.3, 0.6]) { g.beginPath(); g.moveTo(x - w * 0.4, y0 + (y1 - y0) * k); g.lineTo(x + w * 0.5, y0 + (y1 - y0) * k); g.stroke(); }
}
function thron(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm, K = gk(g);
  // Wand: Sternendecke, Fries, Wandmalerei
  g.fillStyle = '#f0dcab'; g.fillRect(0, 0, SW, 240);
  vgrad(g, [[0, '#1f3f86'], [1, '#2a5aa0']], 0, 50);
  for (let i = 0; i < 26; i++) { const x = 9 + i * 18.5, y = 14 + (i % 2) * 14; g.fillStyle = EG.goldHi; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -PI / 2 + k * PI / 5, r = k % 2 ? 1.6 : 4; g.lineTo(x + cos(a) * r, y + sin(a) * r); } g.closePath(); g.fill(); }
  g.fillStyle = EG.gold; g.fillRect(0, 50, SW, 3); g.fillStyle = EG.carn; g.fillRect(0, 53, SW, 5); g.fillStyle = EG.turq; g.fillRect(0, 58, SW, 4); g.fillStyle = EG.gold; g.fillRect(0, 62, SW, 2);
  for (let i = 0; i < 16; i++) { const x = 15 + i * 30.5; g.strokeStyle = EG.goldDk; g.lineWidth = 1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 90); g.lineTo(x, 106); g.moveTo(x - 4, 96); g.lineTo(x + 4, 96); g.stroke(); g.beginPath(); g.ellipse(x, 86.5, 2.1, 3, 0, 0, TAU); g.stroke(); }
  g.fillStyle = 'rgba(160,110,50,.25)'; g.fillRect(0, 76, SW, 1.2); g.fillRect(0, 118, SW, 1.2);
  g.fillStyle = EG.carn; g.fillRect(0, 216, SW, 24); g.fillStyle = EG.gold; g.fillRect(0, 216, SW, 2.5); g.fillStyle = 'rgba(255,255,255,.1)'; for (let i = 0; i < 24; i++) g.fillRect(i * 20 + 3, 222, 10, 14);
  // Lichtstrahl durch ein hohes Fenster
  g.save(); g.globalAlpha = 0.22 + 0.06 * sin(T * 0.8); g.fillStyle = '#fff2c0'; g.beginPath(); g.moveTo(300, 0); g.lineTo(350, 0); g.lineTo(250, 250); g.lineTo(170, 250); g.closePath(); g.fill(); g.restore();
  // Boden: Fliesen
  for (let r = 0; r < 6; r++) { const y0 = 240 + r * 11, y1 = y0 + 11; for (let c = -2; c < 16; c++) { const x0 = c * 36 + (r % 2) * 18; g.fillStyle = (c + r) % 2 ? '#c99f5f' : '#b98c4a'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 36, y0); g.lineTo(x0 + 36 + 3, y1); g.lineTo(x0 + 3, y1); g.closePath(); g.fill(); } }
  vgrad(g, [[0, 'rgba(60,30,10,.35)'], [1, 'rgba(60,30,10,0)']], 240, 262);
  column(g, 36, 244, 205, 32, { col: '#f0d9a2' }); column(g, 462, 244, 205, 32, { col: '#f0d9a2' });
  // roter Läufer
  g.fillStyle = EG.carn; g.beginPath(); g.moveTo(60, 300); g.lineTo(100, 254); g.lineTo(420, 254); g.lineTo(450, 300); g.closePath(); g.fill(); g.fillStyle = EG.gold; g.fillRect(100, 254, 320, 1.8);
  const gy = 276;
  g.save(); g.translate(232, gy); g.scale(1.22, 1.22); g.translate(-232, -gy);
  const kx = 232, ks = 1.85, fy = gy - 14;
  cut(g, '#d9a94a', (c) => c.roundRect(kx - 6, gy - 14, 66, 14, 2), { K, sx: 1.2, sy: 2, blur: 2, lw: 0.7 });
  g.fillStyle = EG.lapis; g.fillRect(kx - 4, gy - 11, 62, 3); g.fillStyle = EG.turq; g.fillRect(kx - 4, gy - 7, 62, 2);
  const seatY = fy - 17 * ks + 3, bx = kx - 32, fx = kx + 40;
  lionLeg(g, bx + 6, seatY + 6, gy, 7); lionLeg(g, fx - 2, seatY + 6, fy + 0, 7);
  cut(g, EG.gold, (c) => { c.moveTo(bx - 4, seatY - 106); c.quadraticCurveTo(bx + 18, seatY - 116, bx + 22, seatY - 100); c.lineTo(bx + 22, seatY + 8); c.lineTo(bx - 4, seatY + 8); c.closePath(); }, { K, sx: 1.4, sy: 2, blur: 2, lw: 0.8 });
  g.fillStyle = EG.lapis; g.fillRect(bx - 1, seatY - 86, 20, 70); g.fillStyle = EG.turq; g.fillRect(bx + 2, seatY - 82, 14, 62);
  g.fillStyle = EG.gold; g.beginPath(); g.arc(bx + 9, seatY - 66, 6.5, 0, TAU); g.fill(); g.strokeStyle = EG.goldDk; g.lineWidth = 0.6; for (let i = 0; i < 8; i++) { const a = i * PI / 4; g.beginPath(); g.moveTo(bx + 9 + cos(a) * 6.5, seatY - 66 + sin(a) * 6.5); g.lineTo(bx + 9 + cos(a) * 11, seatY - 66 + sin(a) * 11); g.stroke(); }
  cut(g, EG.gold, (c) => c.roundRect(bx - 4, seatY - 2, fx - bx + 22, 12, 2), { K, sx: 1.4, sy: 2, blur: 2, lw: 0.8 });
  g.fillStyle = EG.carn; for (let i = 0; i < 12; i++) g.fillRect(bx + i * 7.4, seatY + 2, 4, 3);
  // Armlehne mit Inlays
  cut(g, EG.gold, (c) => { c.moveTo(bx + 24, seatY - 20); c.lineTo(fx + 6, seatY - 20); c.quadraticCurveTo(fx + 12, seatY - 8, fx + 6, seatY); c.lineTo(bx + 24, seatY); c.closePath(); }, { K, sx: 1, sy: 1.6, blur: 1.4, lw: 0.7 });
  for (let i = 0; i < 9; i++) { g.fillStyle = [EG.lapis, EG.turq, EG.carn][i % 3]; g.fillRect(bx + 28 + i * 6, seatY - 16, 4.4, 4.4); g.fillStyle = [EG.carn, EG.lapis, EG.turq][i % 3]; g.fillRect(bx + 28 + i * 6, seatY - 9, 4.4, 4); }
  // König
  egyptian(g, kx, fy, ks, 1, 'sit', T * 0.4, { head: 'nemes', collar: true, beard: true, hold: 'regalia' });
  g.restore();
  egyptian(g, 118, gy - 4, 1.6, 1, 'stand', T * 1.1, { hold: 'fan', head: 'band', collar: 'gold', handA: [8, -3] });
  egyptian(g, 396, gy + 6, 1.4, -1, 'offer', T * 1.2, { hold: 'tray', kilt: '#efe1c4', head: 'band' });
  egyptian(g, 430, gy + 12, 1.1, -1, 'carry', T * 3, { sex: 'f', hold: 'jarHead' });
  // Goldglanz
  const ng = o.calm ? 3 : 7;
  for (let i = 0; i < ng; i++) { const ph = mod(T * 0.7 + i * 0.37, 1), px = [bx + 8, bx + 40, kx + 6, fx, bx + 14, kx - 4, fx - 6][i % 7], py = [seatY - 100, seatY + 4, seatY - 60, seatY + 30, seatY - 40, seatY - 12, seatY + 3][i % 7], a = sin(ph * PI);
    g.fillStyle = `rgba(255,248,200,${a * 0.95})`; g.fillRect(px - 0.6, py - 4 * a, 1.2, 8 * a); g.fillRect(px - 4 * a, py - 0.6, 8 * a, 1.2); }
  // Staubkörnchen im Licht
  for (let i = 0; i < 14; i++) { const x = 190 + mod(i * 53 + T * 6, 150) + sin(T + i) * 3, y = mod(i * 41 + T * 9, 230); g.fillStyle = 'rgba(255,248,210,.55)'; g.fillRect(x, y, 1.4, 1.4); }
}

// ---------------------------------------------------------------- 10 Ramses II. und der Felsentempel von Abu Simbel (ca. 1260 v. Chr.)
function koloss(g, x, base, s) {
  const K = gk(g), rock = '#e2b672', sh = '#c4935a', op = { K, sx: 1.2, sy: 1.8, blur: 1.6, lw: 0.7, edgeCol: 'rgba(255,240,200,.55)' };
  cut(g, tone(rock, 0.06), (c) => c.rect(x - 22 * s, base - 9 * s, 44 * s, 9 * s), op);
  for (const sx of [-1, 1]) cut(g, rock, (c) => c.rect(x + sx * 9 * s - 7.5 * s, base - 36 * s, 15 * s, 28 * s), { ...op, shadow: false });
  cut(g, rock, (c) => c.rect(x - 17 * s, base - 46 * s, 34 * s, 12 * s), op);
  cut(g, rock, (c) => { c.moveTo(x - 14 * s, base - 46 * s); c.lineTo(x - 15 * s, base - 70 * s); c.lineTo(x + 15 * s, base - 70 * s); c.lineTo(x + 14 * s, base - 46 * s); c.closePath(); }, { ...op, shadow: false });
  // Arme auf den Knien
  for (const sx of [-1, 1]) { g.fillStyle = tone(rock, 0.1); g.fillRect(x + sx * 15 * s - 3 * s, base - 62 * s, 6 * s, 24 * s); g.fillStyle = rock; g.fillRect(x + sx * 10 * s - 4 * s, base - 40 * s, 9 * s, 5 * s); }
  g.fillStyle = tone(rock, 0.12); g.fillRect(x - 3 * s, base - 46 * s, 6 * s, 3 * s); // Schurzdreieck
  g.fillStyle = sh; g.fillRect(x + 4 * s, base - 70 * s, 11 * s, 24 * s); g.fillRect(x + 10 * s, base - 36 * s, 7 * s, 28 * s);
  // Kopf mit Nemes und Doppelkrone
  cut(g, rock, (c) => { c.moveTo(x - 16 * s, base - 62 * s); c.lineTo(x - 11 * s, base - 82 * s); c.quadraticCurveTo(x, base - 86 * s, x + 11 * s, base - 82 * s); c.lineTo(x + 16 * s, base - 62 * s); c.lineTo(x + 8 * s, base - 70 * s); c.lineTo(x - 8 * s, base - 70 * s); c.closePath(); }, { ...op, shadow: false });
  g.strokeStyle = 'rgba(120,70,30,.45)'; g.lineWidth = 0.7; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x - 11 * s, base - 80 * s + i * 3 * s); g.lineTo(x + 11 * s, base - 80 * s + i * 3 * s); g.stroke(); }
  cut(g, tone(rock, -0.1), (c) => c.roundRect(x - 6.4 * s, base - 82 * s, 12.8 * s, 15 * s, 3 * s), { ...op, shadow: false });
  g.fillStyle = 'rgba(90,50,20,.55)'; g.fillRect(x - 4 * s, base - 76 * s, 2.6 * s, 1.2 * s); g.fillRect(x + 1.4 * s, base - 76 * s, 2.6 * s, 1.2 * s); g.fillRect(x - 0.8 * s, base - 74 * s, 1.6 * s, 3 * s); g.fillRect(x - 2.4 * s, base - 70 * s, 4.8 * s, 1 * s);
  cut(g, rock, (c) => { c.moveTo(x - 5 * s, base - 82 * s); c.lineTo(x - 6 * s, base - 98 * s); c.quadraticCurveTo(x - 3 * s, base - 101 * s, x, base - 99 * s); c.lineTo(x + 1 * s, base - 88 * s); c.lineTo(x + 5 * s, base - 82 * s); c.closePath(); }, { ...op, shadow: false });
  cut(g, tone(rock, -0.14), (c) => { c.moveTo(x - 2.5 * s, base - 90 * s); c.quadraticCurveTo(x - 4 * s, base - 99 * s, x, base - 107 * s); c.quadraticCurveTo(x + 4 * s, base - 99 * s, x + 2.5 * s, base - 90 * s); c.closePath(); }, { ...op, shadow: false });
}
function abuSimbel(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm, K = gk(g), L = 16, C = mod(t, L);
  vgrad(g, [[0, '#5b6cb4'], [0.45, '#e8967f'], [0.78, '#f9cf8e'], [1, '#fde6b6']], 0, 230);
  // Sonne steigt über dem Nil auf
  const sx = 13, sy = 228 - ease(C / 9) * 54 + (C > 12 ? 0 : 0);
  glow(g, sx, sy, 150, '255,200,120', 0.7); sunDisc(g, sx, sy, 15, '#fff0b8', '255,190,100', 0.7);
  crags(g, 240, 40, 61, '#c99660', { shadow: false });
  // Felsmassiv mit Fassade
  cut(g, '#d6a468', (c) => { c.moveTo(24, 268); c.lineTo(28, 120); c.lineTo(80, 84); c.lineTo(150, 66); c.lineTo(240, 58); c.lineTo(330, 64); c.lineTo(404, 84); c.lineTo(456, 118); c.lineTo(458, 268); c.closePath(); }, { K, sx: 2, sy: 2.4, blur: 3 });
  g.strokeStyle = 'rgba(110,70,30,.28)'; g.lineWidth = 0.9; for (let i = 0; i < 24; i++) { const x = 30 + i * 18; g.beginPath(); g.moveTo(x, 270); g.lineTo(x + (i % 3) * 3 - 3, 86 + Math.abs(i - 12) * 3); g.stroke(); }
  cut(g, '#e4b97a', (c) => { c.moveTo(86, 268); c.lineTo(110, 98); c.lineTo(370, 98); c.lineTo(394, 268); c.closePath(); }, { K, sx: 1.5, sy: 2, blur: 2, lw: 0.8 });
  g.fillStyle = 'rgba(255,240,190,.2)'; g.beginPath(); g.moveTo(86, 268); g.lineTo(110, 98); g.lineTo(240, 98); g.lineTo(240, 268); g.fill();
  // Gesims mit Pavian-Fries
  cut(g, '#d8a868', (c) => c.rect(104, 88, 272, 12), { K, sx: 1.2, sy: 1.6, blur: 1.4, lw: 0.7 });
  for (let i = 0; i < 22; i++) { const bx = 112 + i * 12.2; g.fillStyle = '#9a6a38'; g.beginPath(); g.ellipse(bx, 93.5, 2.2, 3.1, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(bx, 90.2, 1.6, 0, TAU); g.fill(); }
  g.fillStyle = EG.gold; g.fillRect(104, 86, 272, 2);
  // Kolosse
  for (const cx of [131, 190, 290, 349]) koloss(g, cx, 268, 1.28);
  // Eingang mit Nische und Lichtfall
  g.fillStyle = '#e4b97a'; g.fillRect(218, 190, 44, 78);
  g.fillStyle = '#2a1608'; g.fillRect(224, 220, 32, 48);
  const lg = g.createLinearGradient(0, 220, 0, 268); lg.addColorStop(0, 'rgba(255,196,96,0)'); lg.addColorStop(1, `rgba(255,214,130,${0.55 + 0.25 * ease(C / 9)})`); g.fillStyle = lg; g.fillRect(224, 220, 32, 48);
  g.fillStyle = `rgba(255,224,150,${0.35 + 0.4 * ease(C / 9)})`; g.beginPath(); g.moveTo(224, 268); g.lineTo(256, 268); g.lineTo(240, 236); g.closePath(); g.fill();
  cut(g, '#c89158', (c) => c.rect(222, 194, 36, 22), { K, sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  g.fillStyle = '#2a1608'; g.fillRect(226, 197, 28, 17); g.fillStyle = EG.lapis; g.fillRect(234, 202, 12, 12); g.fillStyle = EG.gold; g.beginPath(); g.arc(240, 200, 3.2, 0, TAU); g.fill(); g.fillStyle = EG.turq; g.fillRect(237.5, 205, 5, 9);
  // Lichtstrahl der Sonne zum Eingang
  g.save(); g.globalAlpha = 0.16 + 0.12 * ease(C / 9); g.fillStyle = '#ffe9a8'; g.beginPath(); g.moveTo(sx + 6, sy - 6); g.lineTo(sx + 6, sy + 10); g.lineTo(240, 268); g.lineTo(224, 262); g.closePath(); g.fill(); g.restore();
  // Terrasse, Nil und Boot
  paper(g, '#dcc08a', (c) => { c.moveTo(-10, 266); c.lineTo(SW + 10, 266); c.lineTo(SW + 10, 280); c.lineTo(-10, 280); c.closePath(); }, { shadow: true });
  nilWater(g, 280, SH + 4, T, { calm: o.calm, rows: 3, top: '#5aa6c0', bot: '#2a6e90', sunX: sx, sunCol: '255,214,140' });
  ship(g, 370 + sin(T * 0.3) * 8, 292, 0.5, -1, T, { calm: o.calm, ph: 2 });
  // Menschen am Eingang
  for (const [px, ph, fl] of [[200, 0, 1], [276, 1, -1], [160, 2, 1], [318, 3, -1]]) egyptian(g, px, 268, 0.5, fl, 'raise', T * 1.2 + ph, { wig: false, kilt: '#fffaf0' });
  egyptian(g, 214, 270, 0.52, 1, 'stand', T, {}); egyptian(g, 262, 270, 0.52, -1, 'offer', T, { hold: 'tray' });
  palm(g, 14, 268, 54, T, 2, { calm: o.calm, lean: 3 }); palm(g, 468, 268, 60, T, 4, { calm: o.calm, lean: -4 });
  for (let k = 0; k < 3; k++) bird(g, mod(T * 11 + k * 190, 560) - 40, 34 + k * 11, 0.8, T, k, '#fffaf0', '#1c1816', o.calm);
}

// ---------------------------------------------------------------- Hilfen für die Hafenszenen
function gerüstKran(g, x, base, topY, t, o) {
  g.strokeStyle = '#7a4f2a'; g.lineWidth = 1.4; g.lineCap = 'round';
  for (const dx of [-14, 14]) { g.beginPath(); g.moveTo(x + dx, base); g.lineTo(x + dx, topY); g.stroke(); }
  for (let y = base; y > topY + 10; y -= 14) { g.lineWidth = 1; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y - 14); g.moveTo(x + 14, y); g.lineTo(x - 14, y - 14); g.stroke(); g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.stroke(); }
  // Kranarm mit Block am Seil
  g.lineWidth = 2.2; g.beginPath(); g.moveTo(x + 14, topY + 6); g.lineTo(x + 40, topY - 6); g.moveTo(x - 14, topY + 6); g.lineTo(x + 6, topY - 18); g.lineTo(x + 40, topY - 6); g.stroke();
  const u = mod(t * (o.calm ? 0.04 : 0.08), 1), by = lerp(base - 4, topY + 18, ease(u)); g.lineWidth = 0.8; g.beginPath(); g.moveTo(x + 36, topY - 5); g.lineTo(x + 36, by - 8); g.stroke();
  cut(g, '#ead7a4', (c) => c.rect(x + 28, by - 8, 16, 10), { sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
}
function pflock(g, x, y) { g.fillStyle = '#7a4f2a'; g.beginPath(); g.moveTo(x - 1.2, y); g.lineTo(x, y - 7); g.lineTo(x + 1.2, y); g.fill(); }

// ---------------------------------------------------------------- 11 Alexander gründet Alexandria (331 v. Chr.)
function alexandria(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm, K = gk(g);
  vgrad(g, [[0, '#6fb9e0'], [0.55, '#cfe9f0'], [1, '#f5ecd0']], 0, 160);
  sunDisc(g, 408, 46, 15, '#fffbe0', '255,244,200', 0.45);
  nilWater(g, 140, SH, T, { calm: o.calm, top: '#58b6d2', bot: '#14578a', hi: 'rgba(255,255,255,.4)' });
  // Pharos-Insel mit Leuchtturm im Bau
  paper(g, '#e3cd96', (c) => { c.moveTo(318, 214); c.quadraticCurveTo(350, 200, 400, 202); c.quadraticCurveTo(450, 200, 486, 216); c.lineTo(486, 226); c.quadraticCurveTo(400, 236, 318, 226); c.closePath(); });
  gerüstKran(g, 400, 204, 106, T, o);
  pharos(g, 400, 204, 150, T, 0.57, { calm: o.calm });
  cut(g, '#ead7a4', (c) => c.rect(446, 204, 14, 8), { sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 }); cut(g, '#ead7a4', (c) => c.rect(458, 206, 10, 6), { sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  egyptian(g, 430, 206, 0.34, -1, 'carry', T * 3, { hold: 'sack' }); egyptian(g, 348, 210, 0.3, 1, 'walk', T * 3, {});
  // Schiffe im Hafen
  ship(g, 260 + sin(T * 0.2) * 6, 186, 0.62, 1, T, { kind: 'greek', oars: 6, calm: o.calm, ph: 1 });
  ship(g, 120 + sin(T * 0.25 + 1) * 6, 160, 0.42, -1, T, { calm: o.calm, ph: 3 });
  // Festland: Sand mit Stadtplan (Pflöcke und Messschnur)
  paper(g, '#e7d19a', (c) => { c.moveTo(-10, SH + 10); c.lineTo(-10, 222); c.quadraticCurveTo(80, 214, 170, 230); c.quadraticCurveTo(260, 246, 300, SH + 10); c.closePath(); });
  g.fillStyle = '#d3b878'; g.beginPath(); g.moveTo(-10, SH + 10); g.lineTo(-10, 262); c2(g); g.fill();
  g.strokeStyle = EG.carn; g.lineWidth = 0.9;
  const stakes = [[40, 262], [108, 258], [176, 262], [30, 288], [112, 284], [184, 290]];
  for (const [a, b] of [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]]) { g.beginPath(); g.moveTo(stakes[a][0], stakes[a][1] - 5); g.lineTo(stakes[b][0], stakes[b][1] - 5); g.stroke(); }
  for (const [px, py] of stakes) pflock(g, px, py);
  // Fundament-Steine und Säulenstümpfe
  for (let i = 0; i < 4; i++) cut(g, '#eddab0', (c) => c.rect(210 + i * 17, 276 - (i % 2) * 6, 14, 9), { sx: 0.8, sy: 1.2, blur: 1, lw: 0.6 });
  for (let i = 0; i < 3; i++) { column(g, 218 + i * 34, 252, 34 + i * 6 * 0, 10, { col: '#f3e6c2' }); }
  // Alexander, Baumeister, Arbeiter
  egyptian(g, 98, 278, 1.7, 1, 'point', T * 1.2, { skin: '#dba46c', hair: '#6a4422', diadem: '#fffaf0', kilt: '#c0432e', belt: EG.gold, cloak: '#8a1f2a', handA: [20.5, 1 + sin(T * 1.2)], collar: false });
  egyptian(g, 60, 284, 1.4, 1, 'offer', T, { skin: '#d3a06a', hair: '#3a2616', kilt: '#fffaf0', hold: 'scroll', handA: [13, 4] });
  egyptian(g, 156, 292, 1.2, -1, 'stand', T * 1.4, { skin: '#d3a06a', hair: '#3a2616', kilt: '#e8dcc0', hold: 'staff' });
  egyptian(g, mod(T * 8, 520) - 20, 300, 0.9, 1, 'carry', T * 3, { hold: 'sack', skin: '#c88a55', kilt: '#efe1c4' });
  for (let k = 0; k < 4; k++) bird(g, mod(T * 12 + k * 150, 560) - 40, 60 + k * 12 + sin(T + k) * 4, 0.85, T, k, '#ffffff', '#6a6a70', o.calm);
}
function c2(g) { g.quadraticCurveTo(60, 258, 140, 272); g.quadraticCurveTo(220, 288, 250, SH + 10); g.closePath(); }

// ---------------------------------------------------------------- 12 Kleopatra, die letzte Herrscherin (30 v. Chr.)
const STARS12 = makeStars(70, 91, 150);
function kleopatra(g, t, o) {
  const cm = o.calm ? 0.45 : 1, T = t * cm, K = gk(g);
  vgrad(g, [[0, '#262c66'], [0.45, '#7a4a86'], [0.8, '#e1866c'], [1, '#f6bf84']], 0, 176);
  stars(g, STARS12, T, 0.9);
  g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(84, 52, 12, 0, TAU); g.fill(); g.fillStyle = '#3a3a78'; g.beginPath(); g.arc(90, 48, 11, 0, TAU); g.fill();
  nilWater(g, 168, SH, T, { calm: o.calm, top: '#3e5a9c', bot: '#101d44', hi: 'rgba(255,230,190,.35)', sunX: 392, sunCol: '255,170,80' });
  // Leuchtturm Pharos mit Feuer und Lichtkegeln
  paper(g, '#8a7a6a', (c) => { c.moveTo(310, 204); c.quadraticCurveTo(360, 192, 400, 194); c.quadraticCurveTo(450, 192, 490, 206); c.lineTo(490, 214); c.quadraticCurveTo(400, 224, 310, 214); c.closePath(); }, { shadow: false });
  const topY = 194 - 160 * 0.94 - 2, sw = o.calm ? 0.35 : sin(T * 0.7) * 0.2;
  for (const d of [-1, 1]) { const bx0 = 400, by0 = topY - 12, ex = 400 + d * 230, ey = by0 - 30 + sw * 36, gr = g.createLinearGradient(bx0, by0, ex, ey); gr.addColorStop(0, 'rgba(255,225,150,.38)'); gr.addColorStop(1, 'rgba(255,225,150,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(bx0, by0 - 2); g.lineTo(ex, ey - 20); g.lineTo(ex, ey + 26); g.lineTo(bx0, by0 + 2); g.closePath(); g.fill(); }
  pharos(g, 400, 196, 160, T, 1, { calm: o.calm, lit: '#d8cdb6', dark: '#a89a86' });
  // Hafen: Schiffe mit Laternen
  for (const [sx2, sy2, sc, d, k] of [[210, 196, 0.62, 1, 'greek'], [300, 188, 0.5, -1, 'nil'], [88, 190, 0.5, 1, 'nil']]) { ship(g, sx2 + sin(T * 0.2 + sx2) * 5, sy2, sc, d, T, { kind: k, calm: o.calm, ph: sx2, oars: k === 'greek' ? 6 : 0, hull: k === 'greek' ? '#6a4026' : undefined }); glow(g, sx2 + 4, sy2 - 38 * sc, 14, '255,190,90', 0.6); }
  // Palastterrasse mit Säulen und Fackeln
  paper(g, '#c9b894', (c) => { c.moveTo(-10, 244); c.lineTo(260, 250); c.lineTo(290, SH + 10); c.lineTo(-10, SH + 10); c.closePath(); }, { shadow: true });
  g.fillStyle = '#b3a07c'; g.fillRect(-10, 244, 270, 6); g.strokeStyle = 'rgba(80,60,30,.35)'; g.lineWidth = 0.7; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(i * 24, 250); g.lineTo(i * 24 - 12, SH); g.stroke(); }
  for (const cx of [36, 124, 212]) { column(g, cx, 246, 120, 22, { col: '#d9c9a3' }); const fl = 1 + 0.2 * sin(T * 8 + cx); glow(g, cx + 16, 188, 26 * fl, '255,160,70', 0.55); g.strokeStyle = '#6a4a28'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx + 14, 214); g.lineTo(cx + 17, 192); g.stroke(); g.fillStyle = '#ff9a2c'; g.beginPath(); g.moveTo(cx + 14, 193); g.quadraticCurveTo(cx + 13, 183 * 1, cx + 17, 178 - 3 * fl); g.quadraticCurveTo(cx + 21, 184, cx + 20, 193); g.fill(); }
  // Kleopatra: Diadem mit Uräus, Haarknoten, langes Gewand
  const q = egyptian(g, 168, 292, 1.95, 1, 'offer', T * 0.8, { sex: 'f', skin: '#e0b27a', hair: '#3a2616', bun: true, diadem: true, collar: true, kilt: '#fbf3e0', belt: EG.gold, hold: 'ankh', handA: [14, 7] });
  egyptian(g, 74, 296, 1.5, 1, 'stand', T, { hold: 'fan', head: 'band', sex: 'f', handA: [9, -3], kilt: '#f4ead2' });
  egyptian(g, 236, 300, 1.1, -1, 'offer', T, { hold: 'tray', kilt: '#efe1c4' });
  for (let k = 0; k < 3; k++) bird(g, mod(T * 9 + k * 210, 560) - 40, 90 + k * 16, 0.7, T, k, '#d9d3e8', '#3a3a58', o.calm);
}


// ---------------------------------------------------------------- Liste
// at = Jahr v. Chr. (absteigend sortiert), zugleich Sprungziel der Punkte
export const SCENES = [
  { id: 'siedlung', at: 3300, short: 'Nil-Dörfer', when: 'ca. 3300 v. Chr.', era: 'Frühzeit', title: 'Dörfer am Nil', cap: 'Die Menschen leben in Dörfern am Fluss. Sie bauen Hütten aus Schilf und fangen Fische im Nil.', fact: 'Jedes Jahr überschwemmt der Nil das Land und lässt fruchtbaren Schlamm für die Felder zurück.', draw: siedlung },
  { id: 'zweilaender', at: 3100, short: 'Zwei Länder', when: 'ca. 3100 v. Chr.', era: 'Frühzeit', title: 'Zwei Länder werden eins', cap: 'Unterägypten im Norden trägt die rote Krone, Oberägypten im Süden die weiße. Ein König vereint beide Länder und trägt nun die Doppelkrone.', fact: 'Oft wird König Narmer als erster König genannt, doch die Forscher sind sich nicht ganz sicher.', draw: zweiLaender },
  { id: 'stufenpyramide', at: 2650, short: 'Stufenpyramide', when: 'ca. 2650 v. Chr.', era: 'Altes Reich', title: 'Stufe um Stufe nach oben', cap: 'König Djoser lässt in Sakkara die erste große Steinpyramide bauen. Aus einem flachen Grab wächst Stufe um Stufe ein Turm.', fact: 'Die Stufenpyramide hat sechs Stufen und ist rund 60 Meter hoch.', draw: stufenpyramide },
  { id: 'pyramidenbau', at: 2560, short: 'Pyramidenbau', when: 'ca. 2600–2560 v. Chr.', era: 'Altes Reich', title: 'Der Bau einer Pyramide', cap: 'Viele Arbeiter ziehen Steinblöcke auf Schlitten eine Rampe hinauf. Es waren keine Sklaven: Sie bekamen Essen, Bier und ein Dach über dem Kopf.', fact: 'Die Cheops-Pyramide besteht nach Schätzungen aus etwa 2,3 Millionen Steinblöcken.', draw: rampe },
  { id: 'punt', at: 2000, short: 'Weihrauch', when: 'ca. 2000 v. Chr.', era: 'Mittleres Reich', title: 'Weihrauch aus Punt', cap: 'Schiffe bringen Weihrauch aus dem Land Punt. Es lag weit im Süden, wohl in Ostafrika. Die Ägypter brauchen den Duft für ihre Tempel.', fact: 'Weihrauch ist das Harz von Bäumen und duftet, wenn man es verbrennt.', draw: puntSchiffe },
  { id: 'streitwagen', at: 1700, short: 'Streitwagen', when: 'ca. 1700 v. Chr.', era: 'Mittleres Reich', title: 'Pferd und Wagen kommen', cap: 'Um diese Zeit kommen Menschen aus dem Nahen Osten ins Nildelta. Man nennt sie Hyksos. Mit ihnen werden Pferd und Wagen in Ägypten üblich.', fact: 'Ein Rad mit Speichen ist leichter als eine volle Scheibe und macht den Wagen schnell.', draw: wagen },
  { id: 'hatschepsut', at: 1470, short: 'Punt-Flotte', when: 'ca. 1470 v. Chr.', era: 'Neues Reich', title: 'Hatschepsuts Flotte', cap: 'Hatschepsut regiert Ägypten als Pharao. Sie schickt Schiffe nach Punt, um Weihrauch und andere Schätze zu holen.', fact: 'Auf den Wänden ihres Tempels in Deir el-Bahari ist die Reise abgebildet, sogar mit Bäumen auf den Schiffen.', draw: hatschepsut },
  { id: 'aton', at: 1350, short: 'Aton', when: 'ca. 1350 v. Chr.', era: 'Neues Reich', title: 'Echnaton und die Sonne', cap: 'Pharao Echnaton verehrt nur noch einen Gott: die Sonnenscheibe Aton. Für sie baut er eine neue Hauptstadt in der Wüste.', fact: 'Auf Bildern streckt die Sonne ihre Strahlen mit kleinen Händen zur Königsfamilie aus.', draw: aton },
  { id: 'tutanchamun', at: 1323, short: 'Junger König', when: 'ca. 1332–1323 v. Chr.', era: 'Neues Reich', title: 'Ein König als Kind', cap: 'Tutanchamun wird mit etwa neun Jahren Pharao. Er sitzt auf einem Thron aus Holz und Gold.', fact: 'Er wurde nur etwa 18 oder 19 Jahre alt.', draw: thron },
  { id: 'abusimbel', at: 1260, short: 'Abu Simbel', when: 'ca. 1260 v. Chr.', era: 'Neues Reich', title: 'Der Felsentempel von Abu Simbel', cap: 'Ramses II. lässt einen Tempel in den Felsen hauen. Vier riesige Statuen von ihm sitzen vor dem Eingang.', fact: 'Jede der vier Statuen ist etwa 20 Meter hoch.', draw: abuSimbel },
  { id: 'alexandria', at: 331, short: 'Alexandria', when: '331 v. Chr.', era: 'Ptolemäer', title: 'Alexandria entsteht', cap: 'Alexander der Große kommt 332 v. Chr. nach Ägypten und gründet 331 v. Chr. am Meer die Stadt Alexandria. Der Leuchtturm kommt erst später dazu.', fact: 'Alexandria wird später durch seine große Bibliothek berühmt.', draw: alexandria },
  { id: 'kleopatra', at: 30, short: 'Kleopatra', when: '30 v. Chr.', era: 'Ptolemäer', title: 'Kleopatra, die letzte Herrscherin', cap: 'Kleopatra VII. ist die letzte Herrscherin des alten Ägypten. Sie lebt in Alexandria und soll viele Sprachen gesprochen haben.', fact: 'Nach ihrem Tod 30 v. Chr. wird Ägypten eine Provinz des Römischen Reiches.', draw: kleopatra },
];

// Szene zum Jahr (v. Chr.): die letzte, deren at >= bce ist (vor der ersten Szene: die erste)
export function sceneIndexAt(bce) { let k = 0; for (let i = 0; i < SCENES.length; i++) if (SCENES[i].at >= bce) k = i; return k; }
