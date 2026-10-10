// Gruppe S2 – Gelehrtenzimmer um 1822 (Station 8, rechte Seite): Tapetenwand mit Holzvertäfelung, Bücherregal, Fenster mit Licht,
// Schreibtisch, Globus. Parts: body (Raum), regal, fenster, tisch, globus. Tischplatte y≈1.4 (Rosetta-Stein o. Ä. kann darauf stehen).
import {
  C, rect, trap, archPoly, fr, clipTo, shp, sideLight, vGrad, vignette, plaster, woodGrain, glyph, mk, opt,
  blob, limb, poly, mix, shade, rngOf, leaf, wavy, spline,
  fillPoly, fillPolys, fillGrad, strokePoly, curve, strokes, line,
} from './_eg_arch_kit.js';

function books(c, x0, x1, y, hmax, seed) {
  const rng = rngOf(seed, 6);
  const cols = ['#7a2e2e', '#2e5a3e', '#2a3f6a', '#b28a56', '#4a3020', '#8a4a2a', '#5a3a6a', '#c9a060', '#3a4a3a', '#9a3a2a'];
  let x = x0 + 0.04;
  while (x < x1 - 0.1) {
    const w = 0.07 + rng() * 0.09, h = hmax * (0.62 + rng() * 0.38);
    if (rng() < 0.08 && x < x1 - 0.5) { // liegender Stapel
      const n = 2 + Math.floor(rng() * 2);
      for (let k = 0; k < n; k++) { const col = cols[Math.floor(rng() * cols.length)]; fr(c, x, y + k * 0.1, x + 0.34, y + k * 0.1 + 0.095, col); fr(c, x, y + k * 0.1 + 0.07, x + 0.34, y + k * 0.1 + 0.08, 'rgba(255,240,200,.5)'); fr(c, x, y + k * 0.1 + 0.0, x + 0.34, y + k * 0.1 + 0.01, 'rgba(0,0,0,.3)'); }
      x += 0.38; continue;
    }
    const col = cols[Math.floor(rng() * cols.length)], lean = rng() < 0.04 ? 0.08 : 0;
    const q = [[x, y], [x + w, y], [x + w + lean, y + h], [x + lean, y + h]];
    fillPoly(c, q, col); strokePoly(c, q, 'rgba(20,10,5,.55)', 0.008);
    fr(c, x + 0.012, y + h * 0.82, x + w - 0.012, y + h * 0.82 + 0.018, '#e0b040'); fr(c, x + 0.012, y + h * 0.28, x + w - 0.012, y + h * 0.28 + 0.012, '#e0b040');
    fr(c, x + w * 0.2, y, x + w * 0.3, y + h, 'rgba(255,255,255,.14)');
    x += w + 0.008 + (lean ? 0.1 : 0);
  }
}

export function gelehrtenzimmer(o0 = {}) {
  const o = opt(o0);
  const W = 11, H = 5, FL = 0.45;
  const wallL = [rect(0, 0, W, H)];
  const body = {
    z: 0, layers: [{
      shapes: wallL, fill: '#eadbae',
      deco(c) {
        // Tapete: senkrechte Streifen + kleine Rauten
        fr(c, 0, FL, W, H, '#ecdeb4');
        for (let x = 0.05; x < W; x += 0.5) { fr(c, x, 1.5, x + 0.12, 4.7, 'rgba(120,140,70,.28)'); fr(c, x + 0.2, 1.5, x + 0.22, 4.7, 'rgba(120,100,50,.2)'); for (let y = 1.75; y < 4.6; y += 0.5) fillPoly(c, [[x + 0.3, y], [x + 0.35, y + 0.06], [x + 0.3, y + 0.12], [x + 0.25, y + 0.06]], 'rgba(160,60,40,.35)'); }
        plaster(c, 0, 1.5, W, 4.7, 'rgba(0,0,0,0)', { seed: 9, n: 40, alpha: 0.06 });
        // Holzvertäfelung
        fr(c, 0, FL, W, 1.45, '#7a4a2a'); woodGrain(c, 0, FL, W, 1.45, '#7a4a2a', { n: 40, seed: 3 });
        for (let x = 0.3; x < W - 0.4; x += 1.1) { fr(c, x, 0.65, x + 0.9, 1.3, 'rgba(0,0,0,.18)'); fr(c, x + 0.04, 0.69, x + 0.86, 1.26, '#84532f'); fr(c, x, 1.3, x + 0.9, 1.32, 'rgba(255,230,180,.3)'); fr(c, x, 0.65, x + 0.9, 0.67, 'rgba(0,0,0,.3)'); }
        fr(c, 0, 1.45, W, 1.58, '#8a5a34'); fr(c, 0, 1.55, W, 1.58, 'rgba(255,230,180,.4)'); fr(c, 0, 1.45, W, 1.47, 'rgba(0,0,0,.35)');
        fr(c, 0, FL - 0.05, W, FL + 0.08, '#5a3a22');
        // Gesims
        fr(c, 0, 4.72, W, H, '#f4ecd8'); fr(c, 0, 4.72, W, 4.76, 'rgba(90,70,40,.4)'); fr(c, 0, 4.84, W, 4.88, 'rgba(90,70,40,.3)'); fr(c, 0, 4.76, W, 4.84, '#e8dcc0');
        for (let x = 0.1; x < W; x += 0.3) fr(c, x, 4.88, x + 0.14, 4.98, 'rgba(120,100,70,.25)');
        // Boden: Dielen
        fr(c, 0, 0, W, FL - 0.05, '#a0703f'); woodGrain(c, 0, 0, W, FL - 0.05, '#a0703f', { n: 30, seed: 4 });
        for (let x = 0; x < W; x += 1.3) fr(c, x, 0, x + 0.012, FL - 0.05, 'rgba(40,20,5,.4)');
        fillGrad(c, rect(0, 0, W, FL - 0.05), 0, FL, 0, 0, [[0, 'rgba(255,230,180,.0)'], [1, 'rgba(30,10,0,.2)']]);
        // Lichtfleck vom Fenster auf Wand + Boden
        fillPoly(c, [[4.5, 1.4], [6.2, 1.4], [7.6, 0.0], [5.7, 0.0]], 'rgba(255,240,170,.22)');
        // Bild: gerahmter Stich (Pyramide) über dem Schreibtisch
        fr(c, 8.75, 3.05, 10.35, 4.35, '#5a3a1a'); fr(c, 8.8, 3.1, 10.3, 4.3, '#c9a24a'); fr(c, 8.86, 3.16, 10.24, 4.24, '#5a3a1a'); fr(c, 8.92, 3.22, 10.18, 4.18, '#efe0b4');
        fillGrad(c, rect(8.92, 3.22, 10.18, 4.18), 0, 4.18, 0, 3.22, [[0, '#cfe4e8'], [0.6, '#f3e4b0'], [1, '#e8cc8a']]);
        fillPoly(c, [[9.1, 3.3], [9.9, 3.3], [9.48, 4.0]], '#d4a860'); fillPoly(c, [[9.5, 3.3], [9.9, 3.3], [9.48, 4.0]], '#b88a48'); fillPoly(c, [[9.8, 3.3], [10.14, 3.3], [9.95, 3.62]], '#c99a58');
        fr(c, 8.92, 3.22, 10.18, 3.3, '#e0c27a');
        fr(c, 8.75, 3.05, 10.35, 3.07, 'rgba(0,0,0,.3)');
        // Wand-Schatten an den Rändern
        vignette(c, 0, FL, W, H, { a: 0.15, k: 0.06 });
      },
    }],
  };
  // Bücherregal
  const rx0 = 0.3, rx1 = 3.55;
  const sh = [0.5, 1.45, 2.4, 3.35];
  const regal = {
    z: 2, layers: [{
      shapes: [rect(rx0, 0.12, rx1, 4.45), rect(rx0 - 0.08, 4.4, rx1 + 0.08, 4.6)], fill: '#7a4a2a',
      deco(c) {
        woodGrain(c, rx0, 0.12, rx1, 4.45, '#7a4a2a', { n: 30, seed: 7 });
        fr(c, rx0 + 0.12, 0.3, rx1 - 0.12, 4.38, '#3a2414'); fillGrad(c, rect(rx0 + 0.12, 0.3, rx1 - 0.12, 4.38), 0, 4.38, 0, 0.3, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]);
        const ys = [0.5, 1.45, 2.4, 3.35];
        ys.forEach((y, i) => { books(c, rx0 + 0.12, rx1 - 0.12, y + 0.07, 0.82, 20 + i); });
        [0.43, 1.38, 2.33, 3.28].forEach((y) => { fr(c, rx0 + 0.08, y, rx1 - 0.08, y + 0.08, '#8e5a32'); fr(c, rx0 + 0.08, y + 0.06, rx1 - 0.08, y + 0.08, 'rgba(255,230,180,.45)'); fr(c, rx0 + 0.08, y, rx1 - 0.08, y + 0.015, 'rgba(0,0,0,.45)'); });
        // oberstes Fach: Schriftrollen/Papiere statt Bücher: Rest leer-dunkel + eine Büste (Gipsfigur)
        fr(c, rx0 + 0.12, 4.3, rx1 - 0.12, 4.38, '#8e5a32');
        // Rahmen
        fr(c, rx0, 0.12, rx0 + 0.12, 4.45, '#8a5a34'); fr(c, rx1 - 0.12, 0.12, rx1, 4.45, '#6e4426'); fr(c, rx0, 0.12, rx1, 0.3, '#6e4426');
        fr(c, rx0 - 0.08, 4.4, rx1 + 0.08, 4.6, '#8a5a34'); fr(c, rx0 - 0.08, 4.4, rx1 + 0.08, 4.43, 'rgba(0,0,0,.4)'); fr(c, rx0 - 0.08, 4.57, rx1 + 0.08, 4.6, 'rgba(255,230,180,.4)');
        fr(c, rx0, 0.12, rx0 + 0.015, 4.45, 'rgba(255,230,180,.35)');
        // Lehnleiter (Bibliotheksleiter) angedeutet
      },
    }],
  };
  // Fenster mit Vorhängen
  const wx0 = 4.2, wx1 = 6.5, wy0 = 1.7, wy1 = 4.35;
  const fenster = {
    z: 2, layers: [{
      shapes: [rect(wx0 - 0.15, wy0 - 0.12, wx1 + 0.15, wy1 + 0.2)], fill: '#f4efe2',
      deco(c) {
        fr(c, wx0 - 0.15, wy0 - 0.12, wx1 + 0.15, wy1 + 0.2, '#f1ead6');
        // Himmel + Dächer
        fillGrad(c, rect(wx0, wy0, wx1, wy1), 0, wy1, 0, wy0, [[0, '#a9d4ea'], [0.55, '#e8f0e0'], [1, '#fbe6a8']]);
        fillPoly(c, blob(5.9, 3.7, 0.7, 0.16, 0, 14), 'rgba(255,255,255,.7)'); fillPoly(c, blob(5.0, 3.95, 0.5, 0.1, 0, 14), 'rgba(255,255,255,.6)');
        fillPoly(c, [[wx0, wy0], [wx0, 2.35], [4.5, 2.35], [4.6, 2.55], [4.9, 2.55], [5.0, 2.3], [5.4, 2.3], [5.5, 2.5], [5.9, 2.5], [6.0, 2.2], [6.5, 2.2], [wx1, 2.4], [wx1, wy0]], '#8a7a6a');
        fillPoly(c, [[wx0, wy0], [wx0, 2.1], [4.6, 2.1], [4.8, 2.2], [5.2, 2.0], [5.8, 2.15], [6.3, 1.95], [wx1, 2.05], [wx1, wy0]], '#a08f78');
        for (const [x, y] of [[4.7, 2.5], [5.2, 2.27], [6.1, 2.5]]) fr(c, x - 0.04, y, x + 0.04, y + 0.2, '#6a5a4a');
        // Fenstersprossen: 2 Flügel x 4 Scheiben je Höhe 3
        const xm = (wx0 + wx1) / 2;
        for (const x of [wx0, xm, wx1]) fr(c, x - 0.03, wy0, x + 0.03, wy1, '#f4efe2');
        for (let i = 1; i < 4; i++) { const y = wy0 + ((wy1 - wy0) * i) / 4; fr(c, wx0, y - 0.025, wx1, y + 0.025, '#f4efe2'); }
        for (const x of [(wx0 + xm) / 2, (xm + wx1) / 2]) fr(c, x - 0.02, wy0, x + 0.02, wy1, '#f4efe2');
        strokePoly(c, rect(wx0, wy0, wx1, wy1), '#c9bd9a', 0.03);
        // Fensterbank
        fr(c, wx0 - 0.25, wy0 - 0.12, wx1 + 0.25, wy0, '#e8dcc0'); fr(c, wx0 - 0.25, wy0 - 0.12, wx1 + 0.25, wy0 - 0.1, 'rgba(255,255,245,.7)');
        // Vorhänge (grün, Goldborte), Raffhalter
        for (const s of [-1, 1]) {
          const xa = s < 0 ? wx0 - 0.3 : wx1 - 0.15, xb = s < 0 ? wx0 + 0.15 : wx1 + 0.3;
          fillPoly(c, [[xa, wy1 + 0.2], [xb, wy1 + 0.2], [xb, wy0 - 0.1], [xa, wy0 - 0.1]].map(([x, y]) => [x, y]), '#2e6a46');
          for (let k = 0; k < 5; k++) { const x = xa + (xb - xa) * (k / 4); line(c, [[x, wy1 + 0.18], [x + 0.01, wy0 - 0.08]], k % 2 ? 'rgba(10,50,30,.5)' : 'rgba(150,220,170,.3)', 0.02); }
          fr(c, xa, wy1 + 0.1, xb, wy1 + 0.2, '#e0b040'); fr(c, s < 0 ? xa : xb - 0.03, wy0 - 0.1, s < 0 ? xa + 0.03 : xb, wy1 + 0.2, '#e0b040');
          fillPoly(c, blob((xa + xb) / 2, 2.55, 0.05, 0.05, 0, 8), '#e0b040'); fr(c, xa, 2.5, xb, 2.55, '#e0b040');
        }
        fr(c, wx0 - 0.4, wy1 + 0.05, wx1 + 0.4, wy1 + 0.2, '#6e4426'); fr(c, wx0 - 0.4, wy1 + 0.05, wx1 + 0.4, wy1 + 0.07, 'rgba(255,230,180,.5)');
        for (const x of [wx0 - 0.4, wx1 + 0.4]) fillPoly(c, blob(x, wy1 + 0.13, 0.08, 0.08, 0, 10), '#e0b040');
      },
    }],
  };
  // Globus auf Standfuß
  const gx = 6.95, gy = 1.65, gr = 0.38;
  const globus = {
    z: 3, layers: [{
      shapes: [blob(gx, gy, gr, gr, 0, 28), rect(gx - 0.04, 0.45, gx + 0.04, gy - gr + 0.03), poly([[gx - 0.3, 0.12], [gx + 0.3, 0.12], [gx + 0.18, 0.3], [gx - 0.18, 0.3], [gx - 0.07, 0.45], [gx + 0.07, 0.45]], 0), blob(gx, gy, gr + 0.05, gr + 0.05, 0, 24)], fill: '#8a5a34',
      deco(c) {
        fr(c, gx - 0.4, 0.1, gx + 0.4, 0.46, '#7a4a2a'); woodGrain(c, gx - 0.4, 0.1, gx + 0.4, 1.3, '#7a4a2a', { dir: 'v', n: 8, seed: 2 });
        fillPoly(c, blob(gx, gy, gr, gr, 0, 28), '#d9c78a');
        const globe = blob(gx, gy, gr, gr, 0, 28);
        // Meer und Kontinente
        fillPoly(c, globe, '#8fb7c4');
        fillPoly(c, poly([[gx - 0.25, gy + 0.2], [gx - 0.05, gy + 0.3], [gx + 0.12, gy + 0.1], [gx - 0.02, gy - 0.12], [gx - 0.15, gy - 0.05], [gx - 0.3, gy + 0.02]], 2), '#d8c488');
        fillPoly(c, poly([[gx + 0.08, gy + 0.28], [gx + 0.28, gy + 0.18], [gx + 0.3, gy - 0.05], [gx + 0.18, gy - 0.22], [gx + 0.08, gy - 0.1]], 2), '#cdb878');
        fillPoly(c, poly([[gx - 0.12, gy - 0.18], [gx, gy - 0.3], [gx + 0.05, gy - 0.12]], 2), '#d8c488');
        for (const k of [-0.2, 0, 0.2]) { curve(c, [[gx - gr, gy + k], [gx, gy + k * 1.1 + 0.02], [gx + gr, gy + k]], 'rgba(80,60,30,.35)', 0.008, { alpha: 1 }); }
        fillGrad(c, globe, gx - gr, gy + gr, gx + gr, gy - gr, [[0, 'rgba(255,255,255,.4)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(40,30,10,.45)']]);
        // Meridianring
        strokePoly(c, blob(gx, gy, gr + 0.05, gr + 0.05, 0, 28), '#b8862c', 0.03); strokePoly(c, blob(gx, gy, gr + 0.05, gr + 0.05, 0, 28), 'rgba(255,230,150,.5)', 0.01);
        fr(c, gx - 0.3, 0.12, gx + 0.3, 0.16, 'rgba(255,230,180,.3)');
      },
    }],
  };
  // Schreibtisch
  const tx0 = 7.6, tx1 = 10.9, ty = 1.55, th = 0.14;
  const tisch = {
    z: 3, layers: [{
      shapes: [rect(tx0 - 0.1, ty - th, tx1 + 0.1, ty), rect(tx0, 0.12, tx0 + 1.0, ty - th), rect(tx1 - 1.0, 0.12, tx1, ty - th), rect(tx0 + 1.0, ty - 0.35, tx1 - 1.0, ty - th)], fill: '#7a4a2a',
      deco(c) {
        woodGrain(c, tx0 - 0.1, 0.12, tx1 + 0.1, ty, '#7a4a2a', { n: 40, seed: 5 });
        // Platte
        fr(c, tx0 - 0.1, ty - th, tx1 + 0.1, ty, '#8e5a32'); fr(c, tx0 - 0.1, ty - 0.02, tx1 + 0.1, ty, 'rgba(255,235,190,.5)'); fr(c, tx0 - 0.1, ty - th, tx1 + 0.1, ty - th + 0.02, 'rgba(0,0,0,.4)');
        fr(c, tx0 + 1.0, ty - 0.35, tx1 - 1.0, ty - th, '#6e4426');
        // Kniefreiheit (dunkel)
        fr(c, tx0 + 1.0, 0.12, tx1 - 1.0, ty - 0.35, '#2a1a10'); fillGrad(c, rect(tx0 + 1.0, 0.12, tx1 - 1.0, ty - 0.35), 0, ty - 0.35, 0, 0.12, [[0, 'rgba(0,0,0,.2)'], [1, 'rgba(0,0,0,0)']]);
        fr(c, tx0 + 1.0, 0.12, tx1 - 1.0, 0.15, 'rgba(255,230,180,.2)');
        // Schubladenschränke
        for (const [a, b] of [[tx0, tx0 + 1.0], [tx1 - 1.0, tx1]]) {
          fr(c, a, 0.12, b, ty - th, '#7a4a2a');
          for (let i = 0; i < 3; i++) { const y0 = 0.2 + i * 0.37, y1 = y0 + 0.33; fr(c, a + 0.06, y0, b - 0.06, y1, '#8e5a32'); fr(c, a + 0.06, y1 - 0.02, b - 0.06, y1, 'rgba(0,0,0,.4)'); fr(c, a + 0.06, y0, b - 0.06, y0 + 0.02, 'rgba(255,235,190,.4)'); fillPoly(c, blob((a + b) / 2, (y0 + y1) / 2, 0.035, 0.035, 0, 10), '#e0b040'); }
          fr(c, a, 0.12, a + 0.03, ty - th, 'rgba(255,230,180,.3)'); fr(c, b - 0.03, 0.12, b, ty - th, 'rgba(0,0,0,.3)');
        }
        // Mittelschublade
        fr(c, tx0 + 1.3, ty - 0.3, tx1 - 1.3, ty - th - 0.02, '#8e5a32'); fillPoly(c, blob((tx0 + tx1) / 2, ty - 0.2, 0.04, 0.04, 0, 10), '#e0b040');
        // Sockel
        fr(c, tx0 - 0.02, 0.12, tx0 + 1.02, 0.18, '#5a3a22'); fr(c, tx1 - 1.02, 0.12, tx1 + 0.02, 0.18, '#5a3a22');
        sideLight(c, tx0, 0.12, tx1, ty, { left: 'rgba(255,235,190,.1)', right: 'rgba(30,10,0,.22)' });
      },
    }, { // Tintenfass + Bücherstapel (rechts außen), mittig bleibt die Platte frei
      shapes: [rect(tx1 - 0.65, ty, tx1 - 0.05, ty + 0.28), blob(tx0 + 0.5, ty + 0.06, 0.08, 0.06, 0, 10), poly([[tx0 + 0.5, ty + 0.1], [tx0 + 0.62, ty + 0.5], [tx0 + 0.56, ty + 0.5]], 0)], fill: '#5a3a6a',
      deco(c) {
        const stack = [['#7a2e2e', 0.0], ['#2e5a3e', 0.09], ['#2a3f6a', 0.18]];
        stack.forEach(([col, dy], i) => { fr(c, tx1 - 0.65 + i * 0.02, ty + dy, tx1 - 0.05 - i * 0.03, ty + dy + 0.09, col); fr(c, tx1 - 0.65 + i * 0.02, ty + dy + 0.065, tx1 - 0.05 - i * 0.03, ty + dy + 0.075, 'rgba(255,240,200,.55)'); fr(c, tx1 - 0.65 + i * 0.02, ty + dy, tx1 - 0.05 - i * 0.03, ty + dy + 0.01, 'rgba(0,0,0,.3)'); });
        fillPoly(c, blob(tx0 + 0.5, ty + 0.06, 0.08, 0.06, 0, 10), '#1c1816'); fillPoly(c, blob(tx0 + 0.48, ty + 0.08, 0.02, 0.012, 0, 6), 'rgba(255,255,255,.4)');
        fillPoly(c, poly([[tx0 + 0.52, ty + 0.1], [tx0 + 0.68, ty + 0.5], [tx0 + 0.6, ty + 0.5]], 0), '#f6efe0'); line(c, [[tx0 + 0.52, ty + 0.1], [tx0 + 0.61, ty + 0.32]], '#c9b890', 0.01);
      },
    }],
  };
  return mk('gelehrtenzimmer', 'Gelehrtenzimmer um 1822', { body, regal, fenster, tisch, globus },
    { base: [W / 2, 0], tischplatte: [(tx0 + tx1) / 2, ty], tischMitte: [(tx0 + tx1) / 2, ty], fenster: [(wx0 + wx1) / 2, 3.0], regal: [(rx0 + rx1) / 2, 0.45], globus: [gx, gy + gr], boden: [W / 2, 0.2], top: { rel: [0.5, 1] } },
    { kind: 'room', lengthM: 11, note: 'Tischplatte y≈1.4 (Rosetta-Stein etc. darauf), Tischmitte frei' }, { w: o.w ?? W, floor: 0 });
}
