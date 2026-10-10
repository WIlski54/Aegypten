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
    if (a <= 0.01) return; g.save(); g.globalAlpha = a; crownIcon(g, king.head[0], king.head[1] + 3.6 * ks + yo, ks, kind); g.restore();
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

export const SCENES = [{ draw: siedlung }, { draw: zweiLaender }, { draw: stufenpyramide }, { draw: rampe }];
