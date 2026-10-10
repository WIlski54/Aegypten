// Gruppe O1 – Goldener Thron des Tutanchamun (frontal): Löwenbeine, Armlehnen mit Flügelschlangen, Rückenlehne mit Königsszene (Zierde).
// Gebaut in cm, skaliert via finish() auf 1,0 m Höhe.
import {
  K, spec, blob, limb, poly, rect, rrect, arcPts, stroke2poly, shade, mix, sym, fillPoly, strokePoly,
  gold, inlay, flat, goldFill, bevel, gloss, volume, seg, ln, dotAt, ellipseAt, bands, uraeusFront, glyph, TAU,
} from './_eg_royal_kit.js';

function lionHead(x, y, s) {
  const mane = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; mane.push(blob(x + Math.cos(a) * 0.42 * s, y + Math.sin(a) * 0.42 * s, 0.17 * s, 0.17 * s, 0, 10)); }
  mane.push(blob(x, y, 0.45 * s, 0.45 * s, 0, 24));
  const face = blob(x, y - 0.03 * s, 0.3 * s, 0.33 * s, 0, 22);
  const m = gold(mane, { dir: 'v', gloss: false, stroke: 'rgba(100,60,8,.7)' });
  const f = {
    shapes: [face], fill: { stops: [[0, '#fff0b3'], [0.6, '#e8bc48'], [1, '#c4952a']], dir: 'v' }, stroke: 'rgba(100,60,8,.75)',
    deco(c) {
      for (const sg of [-1, 1]) { ellipseAt(c, x + sg * 0.12 * s, y + 0.07 * s, 0.06 * s, 0.035 * s, K.lapisLo); dotAt(c, x + sg * 0.12 * s, y + 0.07 * s, 0.018 * s, K.black); }
      ellipseAt(c, x, y - 0.05 * s, 0.07 * s, 0.05 * s, K.goldLo, 0.9);
      ln(c, [[x, y - 0.08 * s], [x, y - 0.18 * s]], K.goldLo, 0.014 * s, 0.9);
      ln(c, [[x - 0.1 * s, y - 0.2 * s], [x, y - 0.16 * s], [x + 0.1 * s, y - 0.2 * s]], K.goldLo, 0.014 * s, 0.9);
    },
  };
  return [m, f];
}

function lionLeg(x, w = 7.4) {
  const h = w / 2;
  const shaft = poly([[x - h * 0.78, 6], [x + h * 0.78, 6], [x + h * 0.9, 20], [x + h * 1.05, 34], [x + h * 1.05, 40], [x - h * 1.05, 40], [x - h * 1.05, 34], [x - h * 0.9, 20]], 2);
  const paw = blob(x, 3.0, h * 1.2, 3.2, 0, 20);
  const base = poly(rrect(x - h * 1.35, 0, x + h * 1.35, 2.0, 0.8, 4), 0);
  return gold([shaft, paw, base], {
    dir: 'h', deco(c) {
      // Krallen und Zehen
      for (let i = -1; i <= 1; i++) ln(c, [[x + i * h * 0.5, 4.6], [x + i * h * 0.55, 1.4]], K.goldLo, 0.22, 0.8);
      // Muskelkontur
      ln(c, [[x - h * 0.4, 28], [x - h * 0.55, 18], [x - h * 0.3, 9]], 'rgba(120,70,8,.4)', 0.35);
      ln(c, [[x + h * 0.4, 28], [x + h * 0.55, 18], [x + h * 0.3, 9]], 'rgba(120,70,8,.35)', 0.35);
    },
  });
}

// Zierband: Reihe aus Rechteck-Einlagen (Lapislazuli / Karneol / Türkis)
function inlayRow(x0, x1, y0, y1, n, cols) {
  const out = cols.map(() => []);
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) out[i % cols.length].push(rect(x0 + i * w + w * 0.1, y0, x0 + (i + 1) * w - w * 0.1, y1));
  return out.map((sh, i) => inlay(sh, cols[i], { bevel: false, volume: false, stroke: 'rgba(40,25,5,.5)' }));
}

function paintScene(c) {
  const ink = 'rgba(40,22,8,.85)';
  const P = (pts, col) => { fillPoly(c, pts, col); strokePoly(c, pts, ink, 0.28); };
  const pts = (...a) => a;
  // Aton-Sonne mit Strahlen
  const sx = 0, sy = 91.5;
  for (let i = -5; i <= 5; i++) seg(c, [sx + i * 0.5, sy - 3.2], [sx + i * 2.3, 76], K.gold, 0.22, 0.95);
  dotAt(c, sx, sy, 3.5, '#8a5f1c'); dotAt(c, sx, sy, 3.1, K.carn); dotAt(c, sx - 0.5, sy + 0.5, 1.1, K.carnHi);
  // --- König sitzend (links, schaut nach rechts) ---
  const chair = [[-13.4, 59.5], [-4.2, 59.5], [-4.2, 63.2], [-12.2, 63.2], [-12.2, 74], [-13.4, 74]];
  P(chair, K.gold);
  seg(c, [-12.5, 59.5], [-12.5, 56.8], K.gold, 0.8); seg(c, [-4.8, 59.5], [-4.8, 56.8], K.gold, 0.8);
  // Beine + Schurz
  P([[-9.8, 63.2], [-3.4, 63.2], [-3.4, 61.4], [-3.0, 61.4], [-3.0, 56.6], [-4.6, 56.6], [-4.6, 61.4], [-9.8, 61.4]], K.skinM);
  P([[-11, 62.6], [-4.2, 62.6], [-4.2, 66.6], [-10.2, 66.6]], K.linen);
  // Oberkörper, Arm, Kopf
  P([[-10.2, 66.4], [-6.2, 66.4], [-6.0, 73.2], [-8, 74.4], [-10, 73.6]], K.skinM);
  P([[-7, 72.2], [-2.6, 71.4], [-2.4, 70.2], [-7, 70.8]], K.skinM);
  P([[-8.4, 74.2], [-6.2, 74.2], [-6.4, 75.2], [-6.0, 78.2], [-8.6, 78.4], [-8.9, 75.6]], K.skinM);
  P([[-9, 77.4], [-5.8, 77.4], [-5.6, 80.4], [-7.4, 82], [-9, 80.4]], K.lapis);   // Blaue Krone
  dotAt(c, -6.9, 76.7, 0.3, K.black);
  // --- Königin stehend (rechts, schaut nach links) ---
  P([[2.6, 56.4], [9.2, 56.4], [9.8, 62], [9, 72.6], [3.6, 72.6], [2.8, 64]], K.linen);
  P([[3.4, 72.2], [8.8, 72.2], [8.6, 74.6], [4.2, 74.6]], K.linen);
  P([[5.2, 74.4], [7.4, 74.4], [7.2, 75.4], [7.4, 78], [4.8, 78.2], [4.9, 75.6]], K.skinF);
  dotAt(c, 5.7, 76.8, 0.3, K.black);
  P([[3.8, 77.4], [8, 77.4], [8.2, 79.8], [6, 80.6], [3.7, 79.6]], K.black);       // Perücke
  P([[4.4, 80.4], [7.6, 80.4], [8, 86.4], [6, 87.4], [4, 86.4]], K.gold);           // Krone mit Federn
  seg(c, [5.2, 87], [5.0, 90.2], K.carn, 0.7); seg(c, [6.8, 87], [7.0, 90.2], K.lapis, 0.7);
  // Arm mit Salbgefäß
  P([[3.8, 72], [-1.4, 71.2], [-1.4, 70], [3.8, 70.6]], K.skinF);
  P([[-2.2, 69.6], [-0.4, 69.6], [-0.4, 72.8], [-2.2, 72.8]], K.turq);
}

export function thron_tut(opts = {}) {
  const layers = [];
  // Rückenlehne (Rahmen aus Gold)
  const back = poly(rrect(-23, 50, 23, 104, 3.5, 5), 0);
  const backFrame = gold([back], {
    dir: 'h', deco(c) {
      // Federmuster-Leiste oben
      for (let i = 0; i < 12; i++) ellipseAt(c, -20.2 + i * 3.67, 101.2, 1.1, 1.7, i % 2 ? K.lapis : K.carn, 0.9);
    },
  });
  // Silberfeld mit Szene
  const panel = poly(rrect(-18.4, 54.4, 18.4, 98.4, 1.5, 4), 0);
  const panelLayer = {
    shapes: [panel], fill: { stops: [[0, '#f4f7f8'], [0.6, K.silver], [1, '#9aa2a7']], dir: 'v' }, stroke: 'rgba(60,40,10,.8)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,70,80,.25)', light: 'rgba(255,255,255,.2)' });
      paintScene(c);
      // Schmuckband am Rand (Perlenreihe)
      for (let i = 0; i < 20; i++) { dotAt(c, -17.2 + i * 1.81, 55.4, 0.4, i % 2 ? K.lapis : K.carn); }
      for (let i = 0; i < 20; i++) { dotAt(c, -17.2 + i * 1.81, 97.4, 0.4, i % 2 ? K.lapis : K.carn); }
    },
  };
  layers.push(backFrame, panelLayer);
  // Seitenpfosten der Lehne (Lapis-Streifen)
  layers.push(inlay([rect(-22.6, 56, -19.6, 98), rect(19.6, 56, 22.6, 98)], K.lapis, { bevel: true }));
  // Armlehnen (Flügelschlangen): Flügelbrett mit Schuppenfedern, davor die gekrönte Uräusschlange
  const arm = (sg) => poly([[sg * 22, 46], [sg * 29.8, 46], [sg * 30.2, 62], [sg * 28, 67], [sg * 22, 66]], 1);
  const wings = gold([arm(-1), arm(1)], {
    dir: 'v', deco(c) {
      for (const sg of [-1, 1]) for (let r = 0; r < 4; r++) for (let i = 0; i < 2; i++) {
        const col = [K.lapis, K.carn, K.turq, K.lapis][r];
        ellipseAt(c, sg * (23.6 + i * 3.6), 49.2 + r * 4.4, 1.5, 2.0, col, 0.9, 0);
      }
    },
  });
  layers.push(wings);
  // Beine + Verstrebung
  layers.push(lionLeg(-23.4), lionLeg(23.4));
  layers.push(gold([rect(-24, 13, 24, 18)], { dir: 'v', deco(c) { for (let i = 0; i < 9; i++) glyph(c, ['was', 'ankh', 'djed'][i % 3], -19.8 + i * 4.95, 13.7, 3.6, K.goldLo, 0.28); } }));
  // Zarge/Sitzfläche vorn
  layers.push(gold([rect(-30, 38, 30, 47)], { dir: 'v' }));
  layers.push(...inlayRow(-28.2, 28.2, 40.2, 44.8, 14, [K.lapis, K.carn, K.turq]));
  // Löwenköpfe an den Ecken
  layers.push(...lionHead(-23.4, 32, 11), ...lionHead(23.4, 32, 11));
  // Armlehnen-Kobras
  layers.push(uraeusFront(-26, 56, 18), uraeusFront(26, 56, 18));
  // kleine Doppelkronen auf den Schlangenköpfen
  const mini = (x) => [
    inlay([blob(x, 74.6, 2.5, 1.9, 0, 14)], K.carn, { bevel: true, volume: false }),
    flat([blob(x, 78.4, 1.7, 3.6, 0, 14)], K.linen, { bevel: true }),
  ];
  layers.push(...mini(-26), ...mini(26));
  const parts = { body: { z: 1, layers } };
  return spec('thron_tut', 'Goldener Thron des Tutanchamun', parts, { seat: [0, 47], back: [0, 80] },
    { heightM: 1.0, ranges: {}, desc: 'Thron aus vergoldetem Holz mit Silber- und Edelstein-Einlagen; Rückenlehne zeigt König und Königin' }, { h: opts.h || 1.0 });
}
