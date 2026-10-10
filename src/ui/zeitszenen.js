// Zeitfenster-Szenen zur Erduhr (nur Zeiträume, die das Buch nicht selbst erzählt; Dinosaurier und Meteor gehören dem Buch).
// Jede Szene: Beginn (Mio. Jahre vor heute), Sprungziel für die Antipp-Punkte, Texte und eine Zeichenfunktion draw(g, t, o) auf 480 x 300.
import { SW, SH, TAU, lerp, clamp, smooth, rng, mixc, css, hex, paper, vgrad, circle, glow, ridge, ellipse, limb, stars, makeStars, hominid } from './zeitkit.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const RND = rng(4242);
const STARS = makeStars(70, 11, 230);

// ---------------------------------------------------------------- 1 Feuerball Erde (mit Mondentstehung)
const CRUST = Array.from({ length: 12 }, () => [RND() * SW, 190 + RND() * 120, 26 + RND() * 40, 10 + RND() * 22, RND() * 3]);
const DEBRIS = Array.from({ length: 34 }, () => [-0.9 - RND() * 1.3, 40 + RND() * 120, 1.5 + RND() * 2.5, RND()]);
function feuer(g, t, o) {
  const T = t % 10;
  g.fillStyle = '#10060a'; g.fillRect(0, 0, SW, SH); stars(g, STARS, t, 0.8);
  glow(g, 240, 300, 280, '255,100,30', 0.5);
  const pg = g.createRadialGradient(240, 300, 10, 240, 420, 270); pg.addColorStop(0, '#ffc050'); pg.addColorStop(0.35, '#e5561b'); pg.addColorStop(0.72, '#7a1e10'); pg.addColorStop(1, '#2a0c0c');
  g.save(); g.beginPath(); g.arc(240, 420, 250, 0, TAU); g.clip(); g.fillStyle = pg; g.fillRect(0, 150, SW, 160);
  for (const c of CRUST) { const x = (c[0] + t * 3 * (c[4] - 1.5)) % (SW + 80) - 40; g.fillStyle = 'rgba(40,12,12,.72)'; g.beginPath(); g.ellipse(x, c[1], c[2], c[3], 0.2 * c[4], 0, TAU); g.fill(); }
  g.strokeStyle = `rgba(255,170,60,${0.55 + 0.25 * sin(t * 2)})`; g.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(30 + i * 70, 300); g.lineTo(60 + i * 65 + sin(t + i) * 4, 250 - (i % 3) * 14); g.lineTo(40 + i * 72, 215); g.stroke(); }
  g.restore();
  // Theia kommt von rechts oben und trifft links
  const u = clamp(T / 3.2), p = u * u;
  if (T < 3.2) {
    const x = lerp(470, 145, p), y = lerp(15, 188, p), r = lerp(14, 26, p);
    glow(g, x, y, r * 3.2, '255,140,50', 0.5);
    for (let k = 1; k < 7; k++) { glow(g, x + k * 9, y - k * 5, r * 1.6, '255,110,40', 0.22 - k * 0.025); }
    const tg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); tg.addColorStop(0, '#c9784a'); tg.addColorStop(1, '#4a2018');
    g.fillStyle = tg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  } else {
    const k = T - 3.2, f = Math.max(0, 1 - k / 0.7) * (o.calm ? 0.3 : 0.7);
    if (f > 0) glow(g, 145, 190, 150, '255,225,160', f);
    for (let i = 0; i < DEBRIS.length; i++) {
      const d = DEBRIS[i], tau = k, conv = smooth(clamp((k - 2.2) / 3.4));
      const dx = 145 + (-d[0]) * d[1] * (1 - Math.exp(-tau * 1.1)) * 0.9 * (i % 2 ? 1 : -0.6), dy = 190 - d[1] * 0.9 * (1 - Math.exp(-tau * 1.4)) + 28 * tau * tau * 0.18;
      const x = lerp(dx, 375, conv), y = lerp(dy, 78, conv), a = (1 - smooth(clamp((k - 4.8) / 1.4))) * clamp(1.4 - k * 0.15, 0.5, 1);
      if (a > 0.02) { g.fillStyle = `rgba(255,${150 + d[3] * 90 | 0},70,${a})`; g.beginPath(); g.arc(x, y, d[2], 0, TAU); g.fill(); }
    }
    const mr = 22 * smooth(clamp((k - 1.8) / 4.2));
    if (mr > 0.5) {
      const mx = lerp(300, 375, smooth(clamp((k - 1.8) / 4.2))), my = lerp(120, 78, smooth(clamp((k - 1.8) / 4.2)));
      glow(g, mx, my, mr * 2.2, '255,240,210', 0.18);
      const mg = g.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 1, mx, my, mr); mg.addColorStop(0, '#f2eee4'); mg.addColorStop(1, '#8c8478');
      g.fillStyle = mg; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      g.fillStyle = 'rgba(90,84,76,.35)'; for (const c of [[-6, -4, 4], [5, 5, 3], [3, -8, 2.2], [-8, 6, 2.5]]) { g.beginPath(); g.arc(mx + c[0] * mr / 22, my + c[1] * mr / 22, c[2] * mr / 22, 0, TAU); g.fill(); }
    }
  }
  if (T > 9.4) { g.fillStyle = `rgba(16,6,10,${(T - 9.4) / 0.6})`; g.fillRect(0, 0, SW, SH); }
}

// ---------------------------------------------------------------- 2 Urozean
const RAIN = Array.from({ length: 80 }, () => [RND() * SW, RND() * SH, 0.6 + RND() * 0.7]);
function urozean(g, t, o) {
  vgrad(g, [[0, '#241a38'], [0.6, '#5a3448'], [1, '#8a4a50']]);
  for (let i = 0; i < 6; i++) { const x = ((i * 120 + t * (6 + i * 2)) % (SW + 200)) - 100; g.fillStyle = 'rgba(30,18,40,.55)'; g.beginPath(); g.ellipse(x, 30 + (i % 3) * 30, 90, 22, 0, 0, TAU); g.fill(); }
  const ev = t % 4.2;
  if (!o.calm && ev < 0.14) { g.fillStyle = `rgba(210,220,255,${0.2 * (1 - ev / 0.14)})`; g.fillRect(0, 0, SW, SH); }
  if (ev < 0.4) { const a = 1 - ev / 0.4; g.strokeStyle = o.calm ? `rgba(255,250,220,${a * 0.35})` : `rgba(255,250,220,${a})`; g.lineWidth = 2.2; g.beginPath(); g.moveTo(300, 40); g.lineTo(286, 90); g.lineTo(302, 96); g.lineTo(272, 160); g.lineTo(282, 164); g.lineTo(262, 205); g.stroke(); }
  for (const [vx, s] of [[80, 1], [410, 0.85]]) {
    paper(g, '#2c1a22', (c) => { c.moveTo(vx - 70 * s, 235); c.lineTo(vx - 12 * s, 128); c.lineTo(vx + 12 * s, 128); c.lineTo(vx + 70 * s, 235); c.closePath(); });
    glow(g, vx, 128, 38, '255,120,40', 0.7);
    for (let i = 0; i < 9; i++) { const ph = (t * 0.9 + i * 0.37 + vx) % 1.4, x = vx + (i - 4) * 5 * ph, y = 128 - 60 * ph + 70 * ph * ph; g.fillStyle = `rgba(255,${150 + i * 8},60,${1 - ph / 1.4})`; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); }
  }
  g.fillStyle = 'rgba(255,255,255,.28)'; const mt = (t * 0.5) % 5; if (mt < 0.7) { g.strokeStyle = `rgba(255,200,120,${0.8 - mt})`; g.lineWidth = 2; g.beginPath(); g.moveTo(40 + mt * 400, 20 + mt * 90); g.lineTo(5 + mt * 400, mt * 90); g.stroke(); }
  const wl = 215; paper(g, '#2a5f78', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 6) c.lineTo(x, wl + sin(x * 0.04 + t * 1.4) * 3 + sin(x * 0.11 - t * 2) * 1.5); c.lineTo(SW + 10, SH + 10); c.closePath(); }, { shadow: false });
  vgrad(g, [[0, 'rgba(120,200,220,.25)'], [1, 'rgba(10,40,60,.6)']], wl, SH);
  g.strokeStyle = 'rgba(200,225,235,.55)'; g.lineWidth = 1;
  for (const r of RAIN) { const x = (r[0] - t * 40 * r[2]) % SW, y = (r[1] + t * 360 * r[2]) % SH; const xx = x < 0 ? x + SW : x; g.beginPath(); g.moveTo(xx, y); g.lineTo(xx - 5, y + 14); g.stroke(); }
  for (let i = 0; i < 7; i++) { const ph = (t * 0.25 + i * 0.14) % 1; g.fillStyle = `rgba(230,240,245,${0.35 * (1 - ph)})`; g.beginPath(); g.arc(60 + i * 62, wl - ph * 40, 14 + ph * 16, 0, TAU); g.fill(); }
}

// ---------------------------------------------------------------- 3 Stromatolithen und Bakterien
const BACT = Array.from({ length: 9 }, () => [RND() * 80 - 40, RND() * 70 - 35, RND() * 6, 0.6 + RND()]);
function strom(g, t) {
  vgrad(g, [[0, '#ffe3b5'], [1, '#ffc58a']], 0, 62); g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(90, 36, 16 + sin(t) * 0.5, 0, TAU); g.fill();
  vgrad(g, [[0, '#62d0c4'], [0.6, '#2a8f98'], [1, '#17606e']], 60, SH);
  g.save(); g.globalAlpha = 0.16; for (let i = 0; i < 5; i++) { const x = ((i * 110 + t * 14) % (SW + 120)) - 60; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x, 62); g.lineTo(x + 40, 62); g.lineTo(x + 120, SH); g.lineTo(x + 50, SH); g.fill(); } g.restore();
  paper(g, '#d8bf86', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, 252 + sin(x * 0.05) * 4); c.lineTo(SW + 10, SH + 10); c.closePath(); });
  const domes = [[60, 52, 44], [135, 40, 52], [215, 58, 46], [292, 44, 50]], tones = ['#7d6a3a', '#a08a4c', '#6b5a32', '#b59a58', '#8a7640'];
  for (const [cx, h, w] of domes) {
    g.save(); g.shadowColor = 'rgba(0,30,40,.4)'; g.shadowOffsetY = 3; g.shadowBlur = 2; g.fillStyle = '#6b5a32'; g.beginPath(); g.ellipse(cx, 254, w / 2, h, 0, Math.PI, 0); g.fill(); g.restore();
    g.save(); g.beginPath(); g.ellipse(cx, 254, w / 2, h, 0, Math.PI, 0); g.clip();
    for (let k = 0; k < 6; k++) { g.fillStyle = tones[k % 5]; g.beginPath(); g.ellipse(cx, 254, (w / 2) * (1 - k * 0.15), h * (1 - k * 0.16), 0, Math.PI, 0); g.fill(); }
    g.restore();
    for (let i = 0; i < 4; i++) { const ph = (t * 0.28 + i * 0.27 + cx * 0.013) % 1; g.fillStyle = `rgba(255,255,255,${0.7 * (1 - ph * 0.5)})`; g.beginPath(); g.arc(cx + sin(ph * 9 + i) * 6 + (i - 1.5) * 6, 254 - h - ph * 150, 1.6 + (i % 2), 0, TAU); g.fill(); }
  }
  // Lupe
  g.save(); g.shadowColor = 'rgba(0,20,30,.5)'; g.shadowOffsetY = 3; g.shadowBlur = 4; g.fillStyle = '#103a4a'; g.beginPath(); g.arc(392, 132, 58, 0, TAU); g.fill(); g.restore();
  g.save(); g.beginPath(); g.arc(392, 132, 55, 0, TAU); g.clip(); vgrad(g, [[0, '#9be0c8'], [1, '#4aa59a']], 70, 195);
  for (const b of BACT) { const x = 392 + b[0] + sin(t * b[3] + b[2]) * 7, y = 132 + b[1] + cos(t * b[3] * 0.8 + b[2]) * 6, ang = sin(t * 0.7 + b[2]) * 1.2, ln = 15 + (b[2] % 3) * 3 + 3 * sin(t * 0.5 + b[2]);
    g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = '#3d9a3a'; g.strokeStyle = '#a8e08a'; g.lineWidth = 1.2; g.beginPath(); g.roundRect(-ln / 2, -4, ln, 8, 4); g.fill(); g.stroke(); g.restore(); }
  g.restore();
  g.strokeStyle = '#c99a3e'; g.lineWidth = 5; g.beginPath(); g.arc(392, 132, 56, 0, TAU); g.stroke(); g.strokeStyle = 'rgba(255,240,180,.8)'; g.lineWidth = 1.2; g.beginPath(); g.arc(392, 132, 59, 0, TAU); g.stroke();
  g.strokeStyle = '#c99a3e'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(430, 172); g.lineTo(458, 202); g.stroke();
}

// ---------------------------------------------------------------- 4 Sauerstoff: Meer rostet, Himmel wird blau
const GREEN = hex('#5c8a5a'), RUST = hex('#a44a2a'), BLUE = hex('#2f7fbf'), TEAL = hex('#3f8f8f'), SKYA = hex('#c4784a'), SKYB = hex('#8cc4ef');
function sauerstoff(g, t) {
  const L = 14, T = t % L, u = clamp(T / (L - 1.5));
  const sea = u < 0.45 ? mixc(GREEN, RUST, smooth(u / 0.45)) : u < 0.72 ? mixc(RUST, TEAL, smooth((u - 0.45) / 0.27)) : mixc(TEAL, BLUE, smooth((u - 0.72) / 0.28));
  const skyT = mixc(SKYA, SKYB, smooth(clamp(u * 1.15))), skyB = mixc(hex('#e8b080'), hex('#d6ecfb'), smooth(clamp(u * 1.15)));
  vgrad(g, [[0, css(skyT)], [1, css(skyB)]], 0, 118);
  const wl = 118; vgrad(g, [[0, css(mixc(sea, [255, 255, 255], 0.12))], [1, css(mixc(sea, [10, 20, 30], 0.45))]], wl, SH);
  // Sediment mit Rostbändern wächst
  const hgt = 18 + 52 * u;
  paper(g, '#7a6a5a', (c) => { c.rect(-5, SH - hgt, SW + 10, hgt + 5); }, { shadow: false });
  g.save(); g.beginPath(); g.rect(0, SH - hgt, SW, hgt); g.clip();
  for (let y = SH; y > SH - hgt; y -= 7) { const k = Math.round((SH - y) / 7); g.fillStyle = k % 2 ? '#a8432a' : '#58504a'; g.fillRect(0, y - 7, SW, 7); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, y - 7, SW, 1); }
  g.restore();
  // Bakterienmatten (grün) und Blasen
  for (const x of [70, 160, 250, 340, 420]) {
    const y = SH - hgt; paper(g, '#3d8a3a', (c) => { c.ellipse(x, y, 26, 7, 0, Math.PI, 0); });
    for (let i = 0; i < 3; i++) {
      const ph = (T * 0.22 + i * 0.33 + x * 0.007) % 1, by = y - 4 - ph * (y - 40), bx = x + sin(ph * 8 + i * 2) * 8 + (i - 1) * 8;
      g.fillStyle = 'rgba(255,255,255,.75)'; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.beginPath(); g.arc(bx, by, 4.2, 0, TAU); g.fill(); g.stroke();
      if (i === 1 && by > wl - 4) { g.fillStyle = '#2a5a7a'; g.font = 'bold 6px Georgia'; g.textAlign = 'center'; g.fillText('O₂', bx, by + 2.2); }
    }
  }
  if (u > 0.5) for (let i = 0; i < 6; i++) { const ph = (T * 0.2 + i * 0.17) % 1; g.fillStyle = `rgba(255,255,255,${0.7 * (1 - ph)})`; g.font = 'bold 8px Georgia'; g.textAlign = 'center'; g.fillText('O₂', 40 + i * 78 + sin(ph * 6 + i) * 6, wl - 4 - ph * 70); }
  g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(0, wl - 1, SW, 1.5);
  if (T > L - 1.5) { g.fillStyle = `rgba(0,0,0,${(T - (L - 1.5)) / 1.5 * 0.5})`; g.fillRect(0, 0, SW, SH); }
}

// ---------------------------------------------------------------- 5 Zelle mit Kern (Mitochondrien-Geschichte)
function zelle(g, t) {
  const L = 14, T = t % L;
  g.fillStyle = '#143a48'; g.fillRect(0, 0, SW, SH);
  const bg = g.createRadialGradient(240, 150, 20, 240, 150, 260); bg.addColorStop(0, '#2d7c90'); bg.addColorStop(1, '#0f2d3b'); g.fillStyle = bg; g.fillRect(0, 0, SW, SH);
  for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(200,240,235,.15)'; g.beginPath(); g.arc((i * 97) % SW + sin(t * 0.3 + i) * 8, (i * 53) % SH + cos(t * 0.35 + i) * 8, 1.5 + (i % 3), 0, TAU); g.fill(); }
  const cx = 230, cy = 150;
  g.save(); g.shadowColor = 'rgba(0,20,30,.5)'; g.shadowOffsetY = 4; g.shadowBlur = 3; g.fillStyle = '#d9f2c2'; g.strokeStyle = '#8dcc7a'; g.lineWidth = 3;
  g.beginPath(); for (let a = 0; a <= TAU + 0.1; a += 0.15) { const r = 108 + sin(a * 3 + t * 0.8) * 4 + sin(a * 5 - t) * 2; const x = cx + cos(a) * r * 1.2, y = cy + sin(a) * r * 0.84; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.closePath(); g.fill(); g.restore(); g.stroke();
  // Kern
  g.fillStyle = '#7f6bb0'; g.strokeStyle = '#4a3a80'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(cx - 20, cy - 10, 46, 38, 0.2, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#4a3a80'; g.beginPath(); g.arc(cx - 14, cy - 12, 10, 0, TAU); g.fill();
  g.strokeStyle = '#c9b8f0'; g.lineWidth = 1.4; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(cx - 20, cy - 10, 18 + i * 5, 0.5 + i, 1.6 + i); g.stroke(); }
  // Bakterium wird verschluckt und wird zum Mitochondrium
  const k = smooth(clamp((T - 1.5) / 4)), bx = lerp(430, cx + 55, k), by = lerp(60, cy + 35, k);
  const mito = (x, y, r, a) => { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = '#f08a4a'; g.strokeStyle = '#a84a1a'; g.lineWidth = 1.8; g.beginPath(); g.roundRect(-17, -9, 34, 18, 9); g.fill(); g.stroke(); g.strokeStyle = '#a84a1a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-9, -6); g.lineTo(-9, 2); g.lineTo(-3, 2); g.lineTo(-3, -5); g.lineTo(3, -5); g.lineTo(3, 3); g.lineTo(9, 3); g.lineTo(9, -3); g.stroke(); g.restore(); };
  mito(cx + 70, cy + 52, 0.4, 1); mito(cx - 70, cy + 55, -0.5, 1); mito(cx + 8, cy - 62, 0.1, 1);
  if (T < 8) { g.save(); g.translate(bx, by); g.rotate(sin(t * 2) * 0.4 + 0.3); g.fillStyle = '#3d9a3a'; g.strokeStyle = '#a8e08a'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(-13, -6, 26, 12, 6); g.fill(); g.stroke(); g.restore(); }
  else { const f = smooth(clamp((T - 8) / 1.2)); g.save(); g.globalAlpha = f; mito(cx + 55, cy + 35, 0.3, 1); g.restore(); }
  if (T > 12.4) { g.fillStyle = `rgba(15,45,59,${(T - 12.4) / 1.6})`; g.fillRect(0, 0, SW, SH); }
}

// ---------------------------------------------------------------- 6 Schneeball Erde
const SPARK = Array.from({ length: 36 }, () => [RND() * SW, 120 + RND() * 170, RND() * 6, 1 + RND() * 2]);
function schnee(g, t) {
  vgrad(g, [[0, '#b6d6ee'], [0.7, '#e4f2fa'], [1, '#fafdff']], 0, 190);
  glow(g, 360, 62, 110, '255,250,225', 0.8); g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(360, 62, 17, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,235,.7)'; g.lineWidth = 1.5; for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + t * 0.15; g.beginPath(); g.moveTo(360 + cos(a) * 24, 62 + sin(a) * 24); g.lineTo(360 + cos(a) * (36 + 6 * sin(t * 2 + i)), 62 + sin(a) * (36 + 6 * sin(t * 2 + i))); g.stroke(); }
  // Vulkan am Horizont, der langsam raucht
  paper(g, '#8a95a8', (c) => { c.moveTo(70, 190); c.lineTo(112, 140); c.lineTo(128, 140); c.lineTo(170, 190); c.closePath(); });
  for (let i = 0; i < 6; i++) { const ph = (t * 0.2 + i / 6) % 1; g.fillStyle = `rgba(90,86,96,${0.5 * (1 - ph)})`; g.beginPath(); g.arc(120 + ph * 50 + sin(i) * 4, 138 - ph * 55, 7 + ph * 16, 0, TAU); g.fill(); }
  const so = { shCol: 'rgba(60,110,150,.3)' }; ridge(g, 195, 5, 0.03, 0.4, '#dcecf6', so); ridge(g, 225, 7, 0.022, 2.0, '#c4dff0', so); ridge(g, 258, 6, 0.04, 4.0, '#a9cfe6', so);
  g.strokeStyle = 'rgba(70,120,160,.45)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(30 + i * 80, 280); g.lineTo(60 + i * 78, 252); g.lineTo(48 + i * 80, 236); g.lineTo(70 + i * 76, 214); g.stroke(); }
  for (const s of SPARK) { const a = 0.2 + 0.8 * Math.max(0, sin(t * 2.5 + s[2])) ** 6; g.fillStyle = `rgba(255,255,255,${a})`; const x = s[0], y = s[1]; g.fillRect(x - s[3], y - 0.5, s[3] * 2, 1); g.fillRect(x - 0.5, y - s[3], 1, s[3] * 2); }
  g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 40; i++) { const x = ((i * 43 + t * (50 + (i % 5) * 10)) % (SW + 20)) - 10, y = (i * 29) % 290 + sin(t * 2 + i) * 4; g.fillRect(x, y, 3, 1.2); }
}

// ---------------------------------------------------------------- 7 Ediacara: weiche Wesen
function jelly(g, x, y, s, t, ph, col) {
  const pul = 1 + 0.12 * sin(t * 2.2 + ph); g.save(); g.translate(x, y); g.scale(s, s);
  for (let i = -3; i <= 3; i++) { g.strokeStyle = 'rgba(255,230,240,.6)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(i * 5, 0); for (let k = 1; k <= 6; k++) g.lineTo(i * 5 + sin(t * 2 + k * 0.9 + i + ph) * 3, k * 6); g.stroke(); }
  g.shadowColor = 'rgba(0,30,50,.3)'; g.shadowOffsetY = 2; g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 20 * pul, 15 / pul, 0, Math.PI, 0); g.closePath(); g.fill();
  g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(255,245,235,.7)'; g.lineWidth = 1; g.stroke(); g.restore();
}
function frond(g, x, y, h, t, ph) {
  g.save(); g.translate(x, y); const sw = sin(t * 0.8 + ph) * 6; g.strokeStyle = '#4a7a4a'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(sw * 0.5, -h * 0.5, sw, -h); g.stroke();
  for (let i = 1; i <= 7; i++) { const f = i / 8, px = sw * f * f * 1.2 + 0, py = -h * f, l = 16 * (1 - f * 0.55); g.fillStyle = i % 2 ? '#7fb78a' : '#6ba87a'; g.beginPath(); g.ellipse(px - l / 2, py, l / 2, 3.2, -0.3, 0, TAU); g.fill(); g.beginPath(); g.ellipse(px + l / 2, py, l / 2, 3.2, 0.3, 0, TAU); g.fill(); }
  g.restore();
}
function ediacara(g, t) {
  vgrad(g, [[0, '#4fb0c2'], [0.5, '#2a7f9c'], [1, '#164c68']]);
  g.save(); g.globalAlpha = 0.12; for (let i = 0; i < 4; i++) { const x = ((i * 130 + t * 10) % (SW + 100)) - 50; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 36, 0); g.lineTo(x + 90, SH); g.lineTo(x + 30, SH); g.fill(); } g.restore();
  paper(g, '#cdb68a', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, 246 + sin(x * 0.03) * 4 + sin(x * 0.15) * 1.5); c.lineTo(SW + 10, SH + 10); c.closePath(); });
  frond(g, 60, 262, 90, t, 0); frond(g, 120, 258, 70, t, 2); frond(g, 400, 262, 100, t, 4); frond(g, 440, 256, 64, t, 1);
  // Dickinsonia kriecht
  const dx = 150 + ((t * 7) % 200), dy = 255;
  g.save(); g.translate(dx, dy); g.shadowColor = 'rgba(0,20,30,.35)'; g.shadowOffsetY = 2; g.fillStyle = '#d9a0a8'; g.beginPath(); g.ellipse(0, 0, 34, 10, 0, 0, TAU); g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(120,50,70,.55)'; g.lineWidth = 1.2; for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(i * 5.4, -9 * (1 - Math.abs(i) / 7)); g.lineTo(i * 5.4 + 2, 9 * (1 - Math.abs(i) / 7)); g.stroke(); } g.restore();
  jelly(g, 100 + sin(t * 0.3) * 30, 90 + sin(t * 0.5) * 10, 1.1, t, 0, 'rgba(255,200,215,.85)');
  jelly(g, 270 + sin(t * 0.25 + 2) * 40, 130 + sin(t * 0.4) * 12, 0.85, t, 2, 'rgba(255,225,190,.85)');
  jelly(g, 380 + sin(t * 0.35 + 1) * 30, 70 + sin(t * 0.45 + 1) * 8, 0.7, t, 4, 'rgba(215,235,255,.85)');
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 30; i++) g.fillRect((i * 71 + t * 8 * (1 + i % 3)) % SW, (i * 37 + sin(t + i) * 5) % 230, 1.6, 1.6);
}

// ---------------------------------------------------------------- 8 Kambrium: Trilobit und Anomalocaris
function trilobit(g, x, y, s, t, curl) {
  g.save(); g.translate(x, y); g.scale(s, s * (1 - 0.15 * curl)); const L = 1 - 0.45 * curl;
  g.shadowColor = 'rgba(0,25,35,.4)'; g.shadowOffsetY = 3; g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(0, 0, 36 * L, 17, 0, 0, TAU); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = '#a07a50'; g.beginPath(); g.ellipse(18 * L, 0, 14 * L, 15, 0, -Math.PI / 2, Math.PI / 2); g.fill();
  for (let i = -3; i <= 3; i++) { g.strokeStyle = 'rgba(60,35,20,.55)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(i * 4.2 * L - 6 * L, -16); g.quadraticCurveTo(i * 4.2 * L - 3 * L, 0, i * 4.2 * L - 6 * L, 16); g.stroke(); }
  g.fillStyle = '#e8d8b0'; g.beginPath(); g.arc(24 * L, -7, 2.4, 0, TAU); g.arc(24 * L, 7, 2.4, 0, TAU); g.fill();
  g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.1; for (let i = 0; i < 6; i++) { const w = sin(t * 8 + i) * 2 * (1 - curl); g.beginPath(); g.moveTo(-14 * L + i * 6 * L, 15); g.lineTo(-16 * L + i * 6 * L + w, 22); g.moveTo(-14 * L + i * 6 * L, -15); g.lineTo(-16 * L + i * 6 * L - w, -22); g.stroke(); }
  g.strokeStyle = '#6a4a2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(34 * L, -4); g.lineTo(52 * L, -12 + sin(t * 3) * 2); g.moveTo(34 * L, 4); g.lineTo(52 * L, 12 - sin(t * 3) * 2); g.stroke();
  g.restore();
}
function anomalo(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#d98a4e'; g.strokeStyle = 'rgba(255,245,220,.6)'; g.lineWidth = 1;
  for (let i = 0; i < 8; i++) { const px = -52 + i * 12, wob = sin(t * 5 - i * 0.7) * 4; g.fillStyle = i % 2 ? '#e29a5a' : '#c97a42'; g.beginPath(); g.ellipse(px, wob + 11, 9, 5, 0.3, 0, TAU); g.fill(); g.beginPath(); g.ellipse(px, wob - 11, 9, 5, -0.3, 0, TAU); g.fill(); }
  g.shadowColor = 'rgba(0,25,35,.4)'; g.shadowOffsetY = 3; g.fillStyle = '#e8a86a'; g.beginPath(); g.ellipse(-8, 0, 52, 10, 0, 0, TAU); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = '#c97a42'; g.beginPath(); g.moveTo(-58, 0); g.lineTo(-76, -9 + sin(t * 5) * 3); g.lineTo(-76, 9 - sin(t * 5) * 3); g.closePath(); g.fill();
  g.fillStyle = '#f0b878'; g.beginPath(); g.ellipse(46, 0, 12, 9, 0, 0, TAU); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(48, -9, 3.6, 0, TAU); g.arc(48, 9, 3.6, 0, TAU); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(49, -9, 1.6, 0, TAU); g.arc(49, 9, 1.6, 0, TAU); g.fill();
  g.strokeStyle = '#a0522a'; g.lineWidth = 3; g.lineCap = 'round'; for (const k of [-1, 1]) { g.beginPath(); g.moveTo(54, k * 3); g.quadraticCurveTo(70, k * (10 + sin(t * 4) * 3), 66, k * 22); g.stroke(); for (let q = 0; q < 4; q++) { g.beginPath(); g.moveTo(62 + q, k * (6 + q * 4)); g.lineTo(60 + q, k * (9 + q * 4)); g.stroke(); } }
  g.fillStyle = '#3a1a10'; g.beginPath(); g.arc(57, 0, 3, 0, TAU); g.fill();
  g.restore();
}
function kambrium(g, t) {
  const L = 14, T = t % L;
  vgrad(g, [[0, '#58c6d6'], [0.55, '#2a8fb0'], [1, '#14587a']]);
  g.save(); g.globalAlpha = 0.14; for (let i = 0; i < 5; i++) { const x = ((i * 110 + t * 12) % (SW + 100)) - 40; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 30, 0); g.lineTo(x + 100, SH); g.lineTo(x + 40, SH); g.fill(); } g.restore();
  paper(g, '#d6c08c', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, 252 + sin(x * 0.03 + 1) * 5); c.lineTo(SW + 10, SH + 10); c.closePath(); });
  for (const [x, h, col] of [[40, 70, '#d9728a'], [110, 50, '#e8b04a'], [400, 80, '#d9728a'], [450, 56, '#e8b04a']]) { paper(g, col, (c) => { c.moveTo(x - 9, 258); c.lineTo(x - 7, 258 - h); c.lineTo(x + 7, 258 - h); c.lineTo(x + 9, 258); c.closePath(); }); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, 258 - h, 6, 2.5, 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 5; i++) { const x = 150 + i * 56; g.strokeStyle = '#3f9a5a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 262); for (let k = 1; k <= 6; k++) g.lineTo(x + sin(t * 1.2 + k * 0.7 + i) * 6, 262 - k * 11); g.stroke(); }
  // Anomalocaris schwimmt von rechts nach links oben durch, Trilobit rollt sich ein
  const au = clamp((T - 4.2) / 6), ax = lerp(560, -120, au), ay = 80 + sin(T * 1.4) * 12;
  const near = clamp(1 - Math.abs(ax - 260) / 220), curl = smooth(near);
  const tx = 130 + ((T * 12) % 260) * 1; trilobit(g, tx, 236, 0.9, t, curl);
  if (au > 0 && au < 1) { g.save(); g.translate(ax, ay); g.scale(-1, 1); anomalo(g, 0, 0, 1.05, t); g.restore(); }
  for (let i = 0; i < 24; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect((i * 83 + t * 10) % SW, (i * 41 + sin(t + i) * 6) % 235, 1.6, 1.6); }
}

// ---------------------------------------------------------------- 9 Tiktaalik: Fisch an Land
function tiktaalik(g, x, y, s, ang, t, push) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.shadowColor = 'rgba(30,20,10,.4)'; g.shadowOffsetY = 3;
  g.fillStyle = '#8a8a4a'; g.beginPath(); g.moveTo(-58, 0); g.lineTo(-76, -9 + sin(t * 4) * 2); g.lineTo(-76, 9 - sin(t * 4) * 2); g.closePath(); g.fill();
  g.fillStyle = '#a2a15a'; g.beginPath(); g.ellipse(-12, 0, 48, 13, 0, 0, TAU); g.fill();
  g.fillStyle = '#b7b66a'; g.beginPath(); g.moveTo(24, -11); g.quadraticCurveTo(60, -9, 68, 0); g.quadraticCurveTo(60, 9, 24, 11); g.closePath(); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = '#e8e4b0'; g.beginPath(); g.arc(42, -5, 3.4, 0, TAU); g.arc(51, -5, 3, 0, TAU); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(43, -5, 1.5, 0, TAU); g.arc(52, -5, 1.4, 0, TAU); g.fill();
  g.strokeStyle = '#6f6f3a'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-40 + i * 11, -11); g.lineTo(-38 + i * 11, 11); g.stroke(); }
  const fa = 0.5 + 0.7 * push; limb(g, [[16, 9], [20 + 8 * sin(fa), 20], [26 + 10 * sin(fa), 28 + 2 * cos(fa)]], 6, '#8a8a4a'); limb(g, [[2, 9], [4 + 6 * sin(fa + 1), 19], [8 + 8 * sin(fa + 1), 27]], 5, '#7a7a40');
  g.restore();
}
function reed(g, x, y, h, t, ph) { g.strokeStyle = '#3f7a3a'; g.lineWidth = 2; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * 5, y); g.quadraticCurveTo(x + i * 5 + sin(t * 1.1 + ph + i) * 4, y - h * 0.5, x + i * 7 + sin(t * 1.1 + ph + i) * 6, y - h + Math.abs(i) * 8); g.stroke(); } }
function tiktaalikScene(g, t) {
  const L = 16, T = t % L;
  vgrad(g, [[0, '#f6e0b0'], [0.7, '#fbd7a0'], [1, '#f8c88a']], 0, 190); glow(g, 100, 80, 120, '255,220,150', 0.55); g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(100, 80, 18, 0, TAU); g.fill();
  ridge(g, 160, 6, 0.02, 1, '#b8a874');
  // Wasser links, Uferbank rechts
  paper(g, '#3d9aa8', (c) => { c.moveTo(-10, 180); c.lineTo(250, 180); c.lineTo(330, 290); c.lineTo(-10, 300); c.closePath(); });
  vgrad(g, [[0, 'rgba(255,255,255,.22)'], [1, 'rgba(10,50,70,.4)']], 180, 300);
  paper(g, '#a8895a', (c) => { c.moveTo(250, 180); c.lineTo(SW + 10, 180); c.lineTo(SW + 10, SH + 10); c.lineTo(310, SH + 10); c.lineTo(250, 190); c.closePath(); }, { shadow: false });
  paper(g, '#9a7a4c', (c) => { c.moveTo(220, 205); c.quadraticCurveTo(300, 190, SW + 10, 225); c.lineTo(SW + 10, SH + 10); c.lineTo(260, SH + 10); c.closePath(); });
  for (const [x, h] of [[390, 56], [430, 40], [460, 62], [345, 30]]) { g.strokeStyle = '#4a7a3a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, 232); g.lineTo(x, 232 - h); g.moveTo(x, 232 - h * 0.6); g.lineTo(x - 9, 232 - h * 0.85); g.moveTo(x, 232 - h * 0.45); g.lineTo(x + 9, 232 - h * 0.7); g.stroke(); g.fillStyle = '#b0a040'; g.beginPath(); g.arc(x, 232 - h, 3, 0, TAU); g.fill(); }
  reed(g, 40, 250, 70, t, 0); reed(g, 88, 262, 55, t, 2);
  // Weg: Wasser (150,236) -> Ufer (330,238), Pause, zurück
  let u; if (T < 6) u = smooth(T / 6); else if (T < 9) u = 1; else if (T < 15) u = 1 - smooth((T - 9) / 6); else u = 0;
  const x = lerp(140, 330, u), y = lerp(246, 244, u) - 8 * sin(u * PI) * 0.3, moving = (T < 6 || (T > 9 && T < 15)) ? 1 : 0;
  const push = moving ? 0.5 + 0.5 * sin(t * 4) : 0.2;
  tiktaalik(g, x, y, 0.72, -0.05 * u, t, push);
  if (T >= 6 && T < 8.4) { const ph = (T - 6) / 2.4; g.fillStyle = `rgba(255,255,255,${0.7 * (1 - ph)})`; g.beginPath(); g.arc(x + 54 * 0.72, y - 18 - ph * 14, 3 + ph * 3, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,110,130,.35)'; g.fillRect(0, 232, 250, 1);
}

// ---------------------------------------------------------------- 10 Karbon: Sumpfwald mit Riesenlibelle
function schuppenbaum(g, x, base, h, w, t, ph, col) {
  const sw = sin(t * 0.5 + ph) * 2.5;
  g.save(); g.shadowColor = 'rgba(10,30,10,.35)'; g.shadowOffsetX = 2; g.shadowOffsetY = 2; g.fillStyle = col;
  g.beginPath(); g.moveTo(x - w, base); g.lineTo(x - w * 0.6 + sw, base - h); g.lineTo(x + w * 0.6 + sw, base - h); g.lineTo(x + w, base); g.closePath(); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = 'rgba(30,50,20,.4)'; for (let r = 0; r < h / 11; r++) for (let c = -1; c <= 1; c++) { const yy = base - 6 - r * 11, ww = w * (1 - r * 11 / h * 0.3), xx = x + c * ww * 0.55 + (r % 2) * ww * 0.27 + sw * r * 11 / h; g.beginPath(); g.moveTo(xx, yy - 5); g.lineTo(xx + 4, yy); g.lineTo(xx, yy + 5); g.lineTo(xx - 4, yy); g.closePath(); g.fill(); }
  for (const k of [-1, 1]) { const tx = x + sw + k * w * 1.9, ty = base - h - 26; limb(g, [[x + sw + k * w * 0.4, base - h], [tx, ty]], 4, '#4a6a32'); for (let q = 0; q < 7; q++) { const a = -PI / 2 + (q - 3) * 0.42 + sin(t * 0.9 + q + ph) * 0.05; limb(g, [[tx, ty], [tx + cos(a) * 16, ty + sin(a) * 16]], 2.4, '#5c9a3e', false); } }
  g.restore();
}
function farn(g, x, y, s, t, ph) { g.strokeStyle = '#3f8a3a'; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { const a = -PI / 2 + i * 0.4 + sin(t * 0.8 + ph + i) * 0.05; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + cos(a) * 20 * s, y + sin(a) * 26 * s - 6 * s, x + cos(a) * 36 * s + i * 4 * s, y + sin(a) * 28 * s + 16 * s); g.stroke(); } }
function libelle(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s); const fl = sin(t * 34);
  for (const k of [-1, 1]) for (const [dx, len] of [[8, 36], [-6, 32]]) { g.save(); g.translate(dx, 0); g.rotate(k * (0.35 + 0.5 * fl) - PI / 2 * 0); g.fillStyle = 'rgba(210,235,245,.55)'; g.strokeStyle = 'rgba(80,110,120,.6)'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, k * 18, 7, len / 2 + 6, 0, 0, TAU); g.fill(); g.stroke(); g.restore(); }
  g.fillStyle = '#2a6a5a'; g.strokeStyle = 'rgba(255,245,220,.5)'; g.lineWidth = 1; g.beginPath(); g.roundRect(-52, -2.6, 70, 5.2, 2.6); g.fill(); g.stroke();
  g.fillStyle = '#3a8a70'; g.beginPath(); g.ellipse(22, 0, 8, 6.5, 0, 0, TAU); g.fill(); g.fillStyle = '#e04a2a'; g.beginPath(); g.arc(26, -3, 3, 0, TAU); g.arc(26, 3, 3, 0, TAU); g.fill();
  g.restore();
}
function karbon(g, t) {
  vgrad(g, [[0, '#a8c8a0'], [0.6, '#7ea87c'], [1, '#4f7a58']]);
  for (let i = 0; i < 4; i++) { const x = ((i * 190 + t * 6) % (SW + 300)) - 150; g.fillStyle = 'rgba(235,245,230,.22)'; g.beginPath(); g.ellipse(x, 120 + i * 20, 150, 22, 0, 0, TAU); g.fill(); }
  schuppenbaum(g, 70, 250, 160, 14, t, 0, '#5a6f3a'); schuppenbaum(g, 190, 250, 190, 15, t, 1.7, '#4f6a34'); schuppenbaum(g, 330, 250, 170, 14, t, 3, '#5a6f3a'); schuppenbaum(g, 430, 250, 140, 12, t, 4.3, '#4f6a34');
  paper(g, '#3c6a52', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, 252 + sin(x * 0.04 + t * 0.6) * 2); c.lineTo(SW + 10, SH + 10); c.closePath(); }, { shadow: false });
  vgrad(g, [[0, 'rgba(220,245,225,.25)'], [1, 'rgba(10,40,30,.4)']], 252, SH);
  farn(g, 30, 255, 1.1, t, 0); farn(g, 140, 260, 0.9, t, 2); farn(g, 270, 258, 1.2, t, 4); farn(g, 380, 262, 1, t, 1); farn(g, 465, 258, 1.1, t, 3);
  const x = ((t * 55) % 700) - 110, y = 100 + sin(t * 1.2) * 18 + sin(t * 3) * 3;
  libelle(g, x, y, 1.0, t);
  for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(255,255,230,.5)'; g.fillRect((i * 67 + t * 6) % SW, (i * 43 + sin(t * 0.8 + i) * 8) % 220, 1.6, 1.6); }
}

// ---------------------------------------------------------------- 11 Perm: das große Sterben
const ASH = Array.from({ length: 60 }, () => [RND() * SW, RND() * SH, 0.5 + RND(), 1 + RND() * 2.2]);
function perm(g, t, o) {
  const L = 14, T = t % L;
  vgrad(g, [[0, '#2a1410'], [0.5, '#7a3418'], [1, '#c8601e']], 0, 210); glow(g, 330, 70, 90, '255,150,60', 0.35);
  g.fillStyle = 'rgba(255,140,60,.55)'; g.beginPath(); g.arc(330, 70, 22, 0, TAU); g.fill();
  for (let i = 0; i < 6; i++) { const x = ((i * 130 + t * 8) % (SW + 260)) - 130; g.fillStyle = 'rgba(40,24,22,.72)'; g.beginPath(); g.ellipse(x, 38 + (i % 3) * 26, 110, 30, 0, 0, TAU); g.fill(); }
  ridge(g, 200, 6, 0.02, 1.2, '#4a2a22');
  paper(g, '#7a5238', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, 226 + sin(x * 0.025) * 5); c.lineTo(SW + 10, SH + 10); c.closePath(); });
  g.strokeStyle = 'rgba(40,20,12,.6)'; g.lineWidth = 1.4; for (let i = 0; i < 12; i++) { const x = i * 42 + 10; g.beginPath(); g.moveTo(x, 232); g.lineTo(x + 14, 250); g.lineTo(x + 6, 272); g.lineTo(x + 22, 298); g.moveTo(x + 14, 250); g.lineTo(x + 34, 258); g.stroke(); }
  // Lavaspalte links mit Fontäne
  g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(40, 226); g.lineTo(60, 200); g.lineTo(76, 226); g.closePath(); g.fill(); glow(g, 58, 214, 70, '255,130,40', 0.6);
  for (let i = 0; i < 16; i++) { const ph = (t * 0.8 + i * 0.13) % 1.3, x = 58 + (i - 8) * 6 * ph, y = 214 - 100 * ph + 90 * ph * ph; g.fillStyle = `rgba(255,${160 + i * 4},60,${1 - ph / 1.3})`; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); }
  g.strokeStyle = '#ff7a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(66, 226); g.quadraticCurveTo(120, 240, 150, 262 + sin(t) * 2); g.stroke();
  // toter Baum
  g.strokeStyle = '#2a1812'; g.lineWidth = 5; g.beginPath(); g.moveTo(420, 232); g.lineTo(418, 170); g.moveTo(419, 190); g.lineTo(440, 168); g.moveTo(418, 178); g.lineTo(398, 156); g.stroke();
  // Trilobit: kriecht, bleibt stehen, wird zu Stein
  const stone = smooth(clamp((T - 7) / 4)), tx = 170 + clamp(T / 6) * 120;
  trilobit(g, tx, 262, 0.8, T < 6.5 ? t : 0, 0);
  if (stone > 0.01) { g.fillStyle = `rgba(120,112,104,${0.85 * stone})`; g.beginPath(); g.ellipse(tx, 262, 34, 15, 0, 0, TAU); g.fill(); g.strokeStyle = `rgba(70,64,58,${0.5 * stone})`; g.lineWidth = 1.2; g.stroke(); }
  g.fillStyle = 'rgba(200,190,180,.7)';
  for (const a of ASH) { const x = (a[0] + sin(t * 0.5 + a[1]) * 10 - t * 6) % SW, y = (a[1] + t * 22 * a[2]) % SH; g.fillRect(x < 0 ? x + SW : x, y, a[3], a[3]); }
  if (T > L - 1.2) { g.fillStyle = `rgba(20,10,8,${(T - (L - 1.2)) / 1.2})`; g.fillRect(0, 0, SW, SH); }
}

// ---------------------------------------------------------------- 12 und 13 „Das Buch erzählt weiter“
function buchZeit(g, t) {
  const day = (t * 0.07) % 1;
  const keys = [[0, '#0e1630', '#27386a'], [0.2, '#f0a070', '#ffd9a0'], [0.5, '#58a8ea', '#bfe4fb'], [0.8, '#f08a5a', '#ffc88a'], [1, '#0e1630', '#27386a']];
  let i = 0; while (i < keys.length - 2 && day > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1], k = smooth(clamp((day - a[0]) / (b[0] - a[0])));
  vgrad(g, [[0, css(mixc(hex(a[1]), hex(b[1]), k))], [1, css(mixc(hex(a[2]), hex(b[2]), k))]], 0, 220);
  const night = day < 0.12 || day > 0.9; if (night) stars(g, STARS, t, 0.9);
  const sa = (day - 0.12) / 0.78 * PI, sunX = 240 - cos(sa) * 200, sunY = 215 - sin(sa) * 170;
  if (day > 0.1 && day < 0.9) { glow(g, sunX, sunY, 70, '255,235,170', 0.6); g.fillStyle = '#fff3c8'; g.beginPath(); g.arc(sunX, sunY, 14, 0, TAU); g.fill(); }
  else { const mt = (day < 0.5 ? day + 0.1 : day - 0.9) / 0.2, mA = clamp(mt) * PI; g.fillStyle = '#f2eee0'; g.beginPath(); g.arc(240 - cos(mA) * 180, 120 - sin(mA) * 60, 11, 0, TAU); g.fill(); }
  const nightK = night ? 1 : 0;
  ridge(g, 205, 8, 0.02, 0.5, nightK ? '#1d2a44' : '#6e9a6a'); ridge(g, 232, 6, 0.03, 2, nightK ? '#16203a' : '#4f8858');
  // aufgeschlagenes Buch mit blätternder Seite
  g.save(); g.translate(240, 238);
  paper(g, '#7a1e1e', (c) => { c.roundRect(-118, 4, 236, 22, 6); });
  paper(g, '#f6eed6', (c) => { c.moveTo(-112, 6); c.quadraticCurveTo(-60, -8, 0, 4); c.lineTo(0, 22); c.quadraticCurveTo(-60, 10, -112, 22); c.closePath(); });
  paper(g, '#f6eed6', (c) => { c.moveTo(112, 6); c.quadraticCurveTo(60, -8, 0, 4); c.lineTo(0, 22); c.quadraticCurveTo(60, 10, 112, 22); c.closePath(); });
  g.strokeStyle = 'rgba(120,90,60,.35)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-100 + i * 2, 8 + i * 3); g.lineTo(-14, 8 + i * 3 - 1); g.stroke(); }
  const ft = (t * 0.5) % 2, fl = smooth(clamp(ft)), w = cos(fl * PI);
  if (ft < 1) { g.fillStyle = '#fffaf0'; g.strokeStyle = 'rgba(120,90,60,.5)'; g.beginPath(); g.moveTo(0, 4); g.quadraticCurveTo(w * 45, -8 - 14 * sin(fl * PI), w * 98, 6 - 6 * sin(fl * PI)); g.lineTo(w * 98, 22 - 4 * sin(fl * PI)); g.lineTo(0, 22); g.closePath(); g.fill(); g.stroke(); }
  g.restore();
}

// ---------------------------------------------------------------- 14 Lucy am See (Hadar)
function flamingo(g, x, y, s, t, ph) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#e07a8a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -18); g.stroke(); g.fillStyle = '#f2a0ae'; g.beginPath(); g.ellipse(0, -22, 9, 6, 0.2, 0, TAU); g.fill(); g.strokeStyle = '#f2a0ae'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(6, -24); g.quadraticCurveTo(14, -34 + sin(t * 0.8 + ph) * 4, 8, -42 + sin(t * 0.8 + ph) * 2); g.stroke(); g.fillStyle = '#333'; g.beginPath(); g.arc(9, -42 + sin(t * 0.8 + ph) * 2, 1.6, 0, TAU); g.fill(); g.restore(); }
function akazie(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#3a2a1a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-4, -30, 6, -52); g.moveTo(5, -48); g.lineTo(-22, -66); g.moveTo(5, -48); g.lineTo(32, -64); g.stroke(); paper(g, '#5a7a32', (c) => { c.ellipse(4, -70, 62, 13, 0, 0, TAU); }); g.fillStyle = 'rgba(160,190,90,.5)'; g.beginPath(); g.ellipse(-8, -73, 40, 7, 0, 0, TAU); g.fill(); g.restore(); }
function lucy(g, t) {
  const L = 14, T = t % L;
  vgrad(g, [[0, '#8ec4ea'], [0.6, '#cfe2ea'], [1, '#ffe2a8']], 0, 190); glow(g, 380, 70, 110, '255,240,190', 0.6); g.fillStyle = '#fff4cc'; g.beginPath(); g.arc(380, 70, 16, 0, TAU); g.fill();
  ridge(g, 168, 10, 0.012, 2.4, '#9a8aa8'); ridge(g, 182, 6, 0.02, 0.7, '#8a9a6a');
  paper(g, '#47b0b0', (c) => { c.moveTo(-10, 190); c.lineTo(SW + 10, 190); c.lineTo(SW + 10, 228); c.lineTo(-10, 224); c.closePath(); }, { shadow: false });
  g.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 8; i++) g.fillRect(30 + i * 58 + sin(t + i) * 6, 200 + (i % 3) * 8, 22, 1.4);
  flamingo(g, 330, 214, 0.9, t, 0); flamingo(g, 358, 220, 0.8, t, 2); flamingo(g, 395, 212, 0.75, t, 4); flamingo(g, 300, 222, 0.7, t, 1);
  akazie(g, 70, 232, 1.15);
  paper(g, '#d6b86a', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, 236 + sin(x * 0.03 + 2) * 5); c.lineTo(SW + 10, SH + 10); c.closePath(); });
  g.strokeStyle = '#8a9a3a'; g.lineWidth = 1.6; for (let i = 0; i < 40; i++) { const x = (i * 29) % SW, y = 258 + (i * 17) % 38; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sin(t * 1.5 + i) * 3, y - 10 - (i % 3) * 3); g.stroke(); }
  const x = -30 + (T / L) * 560, ph = t * 5.2;
  hominid(g, x, 272 + sin(ph * 2) * 0.8, 1.15, 1, 'walk', ph, { skin: '#8a5a3a', bun: true });
  if (T > 2) { g.fillStyle = '#d6a030'; g.beginPath(); g.arc(x + 18, 272 - 33 + sin(ph) * 2, 3.4, 0, TAU); g.fill(); }
}

// ---------------------------------------------------------------- 15 Homo habilis in der Olduvai-Schlucht
function giraffe(g, x, y, s, t, ph) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#b8884a'; g.strokeStyle = 'rgba(255,245,220,.5)'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, -24, 14, 8, 0, 0, TAU); g.fill(); for (const lx of [-8, -3, 5, 10]) { g.strokeStyle = '#a8783a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(lx, -20); g.lineTo(lx + sin(t * 1.5 + lx + ph) * 1.5, 0); g.stroke(); } g.strokeStyle = '#b8884a'; g.lineWidth = 4; g.beginPath(); g.moveTo(10, -28); g.lineTo(17 + sin(t * 0.7 + ph) * 2, -54); g.stroke(); g.fillStyle = '#b8884a'; g.beginPath(); g.ellipse(20 + sin(t * 0.7 + ph) * 2, -56, 5, 3, -0.3, 0, TAU); g.fill(); g.restore(); }
function habilis(g, t) {
  const L = 14, T = t % L, cyc = (T % 1.4) / 1.4, hits = Math.floor(T / 1.4);
  vgrad(g, [[0, '#7ab8e4'], [1, '#e8e0c4']], 0, 170); glow(g, 240, 20, 130, '255,240,200', 0.5);
  ridge(g, 150, 4, 0.02, 1, '#b8a468');
  giraffe(g, 300, 168, 0.9, t, 0); giraffe(g, 345, 172, 0.7, t, 2);
  // Schluchtwände mit Schichten
  const wall = (side) => { const sx = side < 0 ? 0 : SW; paper(g, '#c07a4a', (c) => { c.moveTo(sx, 0); c.lineTo(sx + side * -140, 0); c.lineTo(sx + side * -105, 120); c.lineTo(sx + side * -70, 190); c.lineTo(sx + side * -120, SH + 10); c.lineTo(sx, SH + 10); c.closePath(); });
    g.save(); g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx + side * -140, 0); g.lineTo(sx + side * -105, 120); g.lineTo(sx + side * -70, 190); g.lineTo(sx + side * -120, SH + 10); g.lineTo(sx, SH + 10); g.closePath(); g.clip();
    const cols = ['#c07a4a', '#e0b070', '#a85a3a', '#d8c088', '#8a4a30', '#e4c890']; for (let i = 0; i < 10; i++) { g.fillStyle = cols[(i + (side < 0 ? 0 : 3)) % 6]; g.fillRect(Math.min(sx, sx + side * -150), 8 + i * 32 + side * 4, 160, 14 + (i % 3) * 5); }
    g.restore(); };
  wall(-1); wall(1);
  paper(g, '#d6b878', (c) => { c.moveTo(-10, SH + 10); c.lineTo(60, 232); for (let x = 60; x <= 420; x += 10) c.lineTo(x, 226 + sin(x * 0.03) * 3 + 4 * (1 - Math.abs(x - 240) / 180)); c.lineTo(SW + 10, SH + 10); c.closePath(); });
  // Flocken
  for (let i = 0; i < Math.min(hits, 9); i++) { g.fillStyle = i % 2 ? '#8a8478' : '#a29a8a'; g.beginPath(); g.moveTo(262 + i * 7, 274 + (i % 3) * 3); g.lineTo(270 + i * 7, 271 + (i % 3) * 3); g.lineTo(268 + i * 7, 277 + (i % 3) * 3); g.closePath(); g.fill(); }
  // Werkzeug-Herstellung: Schlagstein auf Kern
  hominid(g, 215, 276, 1.25, 1, 'knap', cyc, { skin: '#7a4c30', hair: '#2a1a10' });
  g.fillStyle = '#7a756a'; g.beginPath(); g.ellipse(250, 276, 11, 7, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,245,220,.5)'; g.lineWidth = 1; g.stroke();
  if (cyc > 0.44 && cyc < 0.7) { const k = (cyc - 0.44) / 0.26; for (let i = 0; i < 6; i++) { const a = -0.4 - i * 0.5; g.fillStyle = `rgba(255,${210 + i * 6},120,${1 - k})`; g.beginPath(); g.arc(250 + cos(a) * 24 * k, 272 + sin(a) * 26 * k + 10 * k * k, 1.8, 0, TAU); g.fill(); } }
  if (T > L - 0.8) { g.fillStyle = `rgba(30,20,10,${(T - (L - 0.8)) / 0.8 * 0.6})`; g.fillRect(0, 0, SW, SH); }
}

// ---------------------------------------------------------------- 16 Homo sapiens am Feuer
function sapiens(g, t) {
  vgrad(g, [[0, '#070d1c'], [0.7, '#162644'], [1, '#2a3050']]);
  g.save(); g.translate(240, 300); g.rotate(t * 0.01); g.translate(-240, -300); stars(g, STARS, t, 1); g.restore();
  g.fillStyle = '#f2eee0'; g.beginPath(); g.arc(80, 60, 14, 0, TAU); g.fill(); g.fillStyle = '#0d1630'; g.beginPath(); g.arc(87, 56, 13, 0, TAU); g.fill();
  ridge(g, 214, 8, 0.02, 0.9, '#10182c'); ridge(g, 240, 5, 0.03, 2.2, '#0c1224');
  paper(g, '#241c28', (c) => { c.moveTo(-10, SH + 10); for (let x = -10; x <= SW + 10; x += 8) c.lineTo(x, 252 + sin(x * 0.04 + 1) * 3); c.lineTo(SW + 10, SH + 10); c.closePath(); }, { shadow: false });
  const fl = 0.85 + 0.15 * sin(t * 13) * sin(t * 7.3);
  glow(g, 240, 262, 170 * fl, '255,150,50', 0.55); glow(g, 240, 266, 70 * fl, '255,210,110', 0.7);
  const li = '#c8884a';
  hominid(g, 150, 276, 1.2, 1, 'sit', 0, { skin: li, hair: '#1a100a' }); hominid(g, 330, 276, 1.2, -1, 'sit', 0, { skin: li, hair: '#1a100a', bun: true }); hominid(g, 396, 274, 0.8, -1, 'sit', 0, { skin: li, hair: '#1a100a' });
  g.fillStyle = '#4a2c18'; g.beginPath(); g.ellipse(240, 278, 28, 5, 0, 0, TAU); g.fill();
  for (let k = 0; k < 3; k++) { const w = (22 - k * 6) * fl, h = (46 - k * 11) * (0.9 + 0.2 * sin(t * (9 + k * 3) + k)); g.fillStyle = ['#e8501c', '#ff9a2c', '#ffe27a'][k]; g.beginPath(); g.moveTo(240 - w, 276); g.quadraticCurveTo(240 - w * 0.4 + sin(t * 8 + k) * 3, 276 - h * 0.6, 240 + sin(t * 6 + k) * 4, 276 - h); g.quadraticCurveTo(240 + w * 0.4 + sin(t * 8 + k) * 3, 276 - h * 0.6, 240 + w, 276); g.closePath(); g.fill(); }
  for (let i = 0; i < 12; i++) { const ph = (t * 0.45 + i * 0.083) % 1; g.fillStyle = `rgba(255,${190 + i * 4},90,${1 - ph})`; g.fillRect(240 + sin(ph * 6 + i * 2) * 18 * ph + (i - 6) * 1.5, 262 - ph * 120, 1.8, 1.8); }
}

// ---------------------------------------------------------------- Liste
// start = ab wann (Mio. Jahre vor heute, abnehmend) die Szene gezeigt wird; at = Sprungziel der Punkte
export const SCENES = [
  { id: 'feuer', short: 'Feuerball', start: 4540, at: 4500, when: 'vor 4,5 Mrd. Jahren', era: 'Hadaikum', title: 'Feuerball Erde', cap: 'Die junge Erde ist ein glühender Felsball. Ein anderer Himmelskörper kracht hinein. Aus den Trümmern wird vermutlich unser Mond.', fact: 'Den Himmelskörper nennen Forscher „Theia“.', draw: feuer },
  { id: 'urozean', short: 'Urozean', start: 4300, at: 4150, when: 'vor 4,2 Mrd. Jahren', era: 'Hadaikum', title: 'Das erste Meer', cap: 'Die Erde kühlt ab. Es regnet und regnet, und Wasser sammelt sich im Urozean. Überall gibt es Vulkane und Blitze.', fact: 'Es gibt noch keine Luft zum Atmen und noch kein Leben.', draw: urozean },
  { id: 'strom', short: 'Bakterien', start: 3700, at: 3550, when: 'vor 3,5 Mrd. Jahren', era: 'Archaikum', title: 'Die ersten Lebewesen', cap: 'Winzige Bakterien bauen im flachen Wasser Hügel aus vielen Schichten: die Stromatolithen.', fact: 'Solche Hügel wachsen heute noch in Australien.', draw: strom },
  { id: 'sauerstoff', short: 'Sauerstoff', start: 2500, at: 2400, when: 'vor 2,4 Mrd. Jahren', era: 'Proterozoikum', title: 'Die Luft verändert sich', cap: 'Die Bakterien machen Sauerstoff. Er lässt das Eisen im Meer rosten. Danach füllt er die Luft, und der Himmel wird blau.', fact: 'Gelöstes Eisen (Fe²⁺) wird zu rotem Rost (Fe³⁺): daher die roten Streifen im Gestein.', draw: sauerstoff },
  { id: 'zelle', short: 'Zellen', start: 2000, at: 1700, when: 'vor 1,7 Mrd. Jahren', era: 'Proterozoikum', title: 'Zellen mit Kern', cap: 'Große Zellen bekommen einen Zellkern. Eine Zelle verschluckt ein Bakterium. Beide bleiben zusammen, und das Bakterium wird zum Kraftwerk der Zelle.', fact: 'Dieses Kraftwerk heißt Mitochondrium. Du hast Billionen davon.', draw: zelle },
  { id: 'schnee', short: 'Schneeball', start: 720, at: 680, when: 'vor 700 Mio. Jahren', era: 'Proterozoikum', title: 'Schneeball Erde', cap: 'Fast die ganze Erde ist gefroren. Nur an Vulkanen bleibt es ein wenig warm.', fact: 'Das Eis reichte bis zum Äquator, vermuten Forscher.', draw: schnee },
  { id: 'ediacara', short: 'Weiche Tiere', start: 600, at: 570, when: 'vor 570 Mio. Jahren', era: 'Proterozoikum', title: 'Weiche Wesen', cap: 'Die ersten großen Tiere haben noch keine Skelette. Sie sehen aus wie Blätter, Matten und Quallen.', fact: 'Man nennt sie die Ediacara-Tiere.', draw: ediacara },
  { id: 'kambrium', short: 'Panzer', start: 539, at: 515, when: 'vor 515 Mio. Jahren', era: 'Paläozoikum', title: 'Panzer und Augen', cap: 'Plötzlich gibt es viele neue Tiere: Trilobiten mit Panzer und Räuber wie Anomalocaris.', fact: 'Der Trilobit rollt sich zusammen, wenn Gefahr droht.', draw: kambrium },
  { id: 'tiktaalik', short: 'Fisch an Land', start: 410, at: 375, when: 'vor 375 Mio. Jahren', era: 'Paläozoikum', title: 'Fisch an Land', cap: 'Tiktaalik ist ein Fisch mit „Armen“. Er stützt sich auf seine Flossen und schaut aus dem Wasser.', fact: 'Er zeigt den Weg vom Wasser zum Land.', draw: tiktaalikScene },
  { id: 'karbon', short: 'Sumpfwald', start: 359, at: 310, when: 'vor 310 Mio. Jahren', era: 'Paläozoikum', title: 'Riesige Sumpfwälder', cap: 'Hohe Schuppenbäume und Farne wachsen im Sumpf. Eine Riesenlibelle saust vorbei.', fact: 'Meganeura hatte etwa 70 cm Flügelspannweite.', draw: karbon },
  { id: 'perm', short: 'Großes Sterben', start: 290, at: 256, when: 'vor 252 Mio. Jahren', era: 'Paläozoikum', title: 'Das große Sterben', cap: 'Gewaltige Vulkane in Sibirien füllen den Himmel mit Asche. Fast alles Leben stirbt aus.', fact: 'Auch die Trilobiten sterben aus. Nur etwa jede zehnte Meerestierart überlebt.', draw: perm },
  { id: 'dinos', short: 'Blättern!', start: 252, at: 150, when: 'vor 252 bis 66 Mio. Jahren', era: 'Mesozoikum', title: 'Jetzt wird geblättert!', cap: 'Das Zeitalter der Dinosaurier erlebst du im Buch. Blättere um und besuche sie!', fact: 'Auf der Uhr dauert es fast eine Stunde.', draw: buchZeit },
  { id: 'saeuger', short: 'Weiter im Buch', start: 66, at: 40, when: 'vor 66 bis 4 Mio. Jahren', era: 'Känozoikum', title: 'Das Buch erzählt weiter', cap: 'Nach den Dinosauriern erobern die Säugetiere die Erde. Mehr dazu findest du auf der letzten Seite.', fact: 'Auf der Uhr sind es noch gut 20 Minuten bis Mitternacht.', draw: buchZeit },
  { id: 'lucy', short: 'Lucy', start: 3.7, at: 3.2, when: 'vor 3,2 Mio. Jahren', era: 'Känozoikum', title: 'Lucy geht aufrecht', cap: 'Lucy lebte am See in Hadar (Äthiopien). Sie ist nur so groß wie ein Grundschulkind.', fact: 'Sie lief auf zwei Beinen und kletterte auch gut auf Bäume.', draw: lucy },
  { id: 'habilis', short: 'Homo habilis', start: 2.2, at: 1.8, when: 'vor 1,8 Mio. Jahren', era: 'Känozoikum', title: 'Der geschickte Mensch', cap: 'Homo habilis lebte auch in der Olduvai-Schlucht (Tansania). Er schlägt Steine zu scharfen Werkzeugen.', fact: '„habilis“ bedeutet „geschickt“.', draw: habilis },
  { id: 'sapiens', short: 'Homo sapiens', start: 0.5, at: 0.3, when: 'vor 300 000 Jahren', era: 'Känozoikum', title: 'Homo sapiens: das bist du!', cap: 'Menschen sitzen am Feuer. Auf der Uhr sind das die allerletzten 6 Sekunden.', fact: 'Feuer wärmt, schützt und macht Essen bekömmlicher.', draw: sapiens },
];

// Szene zur Uhrzeit: die zuletzt erreichte
export function sceneIndexAt(ma) { let k = 0; for (let i = 0; i < SCENES.length; i++) if (ma <= SCENES[i].start) k = i; return k; }
