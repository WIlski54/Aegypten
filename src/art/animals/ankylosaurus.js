// Ankylosaurus (Oberkreide, ~6,5 m): breit, niedrig, gepanzert mit Knochenplatten und Dornen, grosse Schwanzkeule.
// Teile: body (Rumpf, Kopf, Beine, Rueckenpanzer), tail (Pivot an der Hueftel, Schwanz samt Keule; hoch = negativ).
import { blob, limb, poly, xf, move, band, fillPoly, strokePoly, curve, cuteEye, cheek, mix, dark, light, line, dot, volume, spots } from './_b_kit.js';

const PAL = { back: '#9a5538', mid: '#b97a50', belly: '#efd6a8', mark: '#5a2e1c', leg: '#8a4a30', plate: ['#f1dca0', '#cfae6a'], plateEdge: 'rgba(70,35,15,0.7)',
  bone: ['#ead09a', '#b48e4e'], eye: '#6b3a1a', beak: '#e8d09a' };

const interp = (tab, x) => {
  if (x <= tab[0][0]) return tab[0][1]; if (x >= tab[tab.length - 1][0]) return tab[tab.length - 1][1];
  for (let i = 0; i < tab.length - 1; i++) if (x <= tab[i + 1][0]) { const t = (x - tab[i][0]) / (tab[i + 1][0] - tab[i][0]); return tab[i][1] + (tab[i + 1][1] - tab[i][1]) * t; }
  return 0;
};
// Knochenplatte (Oval mit Kiel) in Deko
function scute(c, x, y, rx, ry, rot = 0, alt = false) {
  const { ctx, tf, S } = c; const [X, Y] = tf(x, y);
  ctx.save(); ctx.translate(X, Y); ctx.rotate(-rot);
  const g = ctx.createLinearGradient(0, -ry * S, 0, ry * S); g.addColorStop(0, alt ? '#f8e8b8' : PAL.plate[0]); g.addColorStop(1, alt ? '#d8b878' : PAL.plate[1]);
  ctx.beginPath(); ctx.ellipse(0, 0, rx * S, ry * S, 0, 0, 6.2832); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = Math.max(1, 0.014 * S); ctx.strokeStyle = PAL.plateEdge; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-rx * S * 0.6, ry * S * 0.05); ctx.lineTo(rx * S * 0.6, -ry * S * 0.05);
  ctx.lineWidth = Math.max(1, 0.016 * S); ctx.strokeStyle = 'rgba(120,70,30,0.55)'; ctx.stroke();
  ctx.restore();
}

export default function make(opts = {}) {
  // ---------- Rumpf ----------
  const torso = poly([
    [-1.45, 1.15], [-1.25, 1.72], [-0.7, 2.05], [0.1, 2.12], [0.8, 2.05], [1.3, 1.88], [1.68, 1.55], [1.8, 1.15], [1.6, 0.78], [1.0, 0.5],
    [0.2, 0.45], [-0.6, 0.5], [-1.2, 0.68],
  ], 3);
  const topY = (x) => interp([[-1.5, 1.2], [-1.25, 1.72], [-0.7, 2.05], [0.1, 2.12], [0.8, 2.05], [1.3, 1.88], [1.68, 1.55], [1.85, 1.2]], x);
  // Kopf (breit-dreieckig, Hoerner hinten) + Hals; um den Halsansatz um 20 % vergroessert
  const HH = (x, y) => [1.95 + (x - 1.95) * 1.2, 1.2 + (y - 1.2) * 1.2];
  const hpoly = (pts, sm) => poly(pts.map(([x, y]) => HH(x, y)), sm);
  const head = hpoly([[2.0, 1.4], [2.35, 1.45], [2.7, 1.36], [2.98, 1.2], [3.12, 1.05], [3.08, 0.92], [2.9, 0.84], [2.55, 0.8], [2.2, 0.8], [1.98, 0.9]], 2);
  const neck = blob(1.85, 1.2, 0.6, 0.5, 0.0, 24);
  const hornB = hpoly([[2.25, 1.38], [2.05, 1.58], [1.55, 1.72], [1.84, 1.42], [1.95, 1.2]], 1);          // oberes Hinterhauptshorn (zeigt nach hinten oben)
  const hornC = hpoly([[2.2, 0.98], [2.0, 0.8], [1.5, 0.62], [1.82, 0.92], [1.95, 1.12]], 1);               // unteres Wangenhorn
  // Beine kurz und kraeftig
  const toes = (x) => [0, 1, 2].map((i) => blob(x + 0.3 - i * 0.015, 0.05 + i * 0.055, 0.1, 0.07, 0.0, 12));
  const nails = (x) => [0, 1, 2].map((i) => blob(x + 0.36 - i * 0.015, 0.05 + i * 0.055, 0.045, 0.04, 0.0, 10));
  const frontL = (dx) => [limb([[1.1 + dx, 0.78, 0.72], [1.18 + dx, 0.45, 0.6], [1.22 + dx, 0.12, 0.52]]), blob(1.36 + dx, 0.09, 0.4, 0.14, 0.0, 20), ...toes(1.36 + dx)];
  const hindL = (dx) => [limb([[-0.8 + dx, 0.85, 0.86], [-0.7 + dx, 0.5, 0.68], [-0.7 + dx, 0.12, 0.58]]), blob(-0.52 + dx, 0.09, 0.44, 0.14, 0.0, 20), ...toes(-0.52 + dx)];
  const farLegs = {
    shapes: [...frontL(-0.5), ...hindL(0.5)], fill: { top: dark(PAL.leg, 0.2), bottom: dark(PAL.leg, 0.36) },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(30,10,0,.28)' }); },
  };
  const legDeco = (xf0) => (c, bb) => {
    volume(c, bb, { dark: 'rgba(40,15,0,0.3)', light: 'rgba(255,230,190,0.16)' });
    for (let i = 0; i < 3; i++) scute(c, bb.x0 + bb.w * 0.5 + (i % 2 ? 0.05 : -0.04), bb.y0 + bb.h * (0.4 + i * 0.2), 0.14, 0.085, 0.1, i % 2 === 0);
    nails(xf0).forEach((n) => fillPoly(c, n, '#f3e2b8'));
  };
  const frontN = { shapes: frontL(0), fill: { top: PAL.back, bottom: PAL.leg }, deco: legDeco(1.36) };
  const hindN = { shapes: hindL(0), fill: { top: PAL.back, bottom: PAL.leg }, deco: legDeco(-0.52) };

  const main = {
    shapes: [torso, neck], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(50,20,5,0.24)', light: 'rgba(255,230,190,0.16)' });
      fillPoly(c, blob(0.1, 0.12, 2.1, 0.5), PAL.belly, 0.97);                          // heller Bauch
      // Panzerplatten: drei versetzte Reihen
      const rows = [[0.2, -0.78, 1.5, 6], [0.5, -0.72, 1.48, 6], [0.8, -0.65, 1.38, 5]];
      const n = 7;
      for (let r = 0; r < 4; r++) {
        for (let i = 0; i < n + (r % 2 === 1 ? 0 : -1); i++) {
          const x = -1.25 + 0.42 * i + (r % 2 === 1 ? 0 : 0.21); const y = topY(x) - 0.2 - r * 0.34 - (r === 2 ? 0.02 : 0);
          const slope = (topY(x + 0.1) - topY(x - 0.1)) / 0.2;
          if (y > 0.78) scute(c, x, y, 0.2, 0.13, Math.atan(slope) * 0.8, (i + r) % 2 === 0);
        }
      }
    },
  };
  // Rueckendornen (Knochen) auf der Rueckenlinie
  const spikeAt = (x, h, w = 0.26, lean = -0.15) => xf(poly([[-w / 2, -0.08], [w / 2, -0.08], [0.0 + lean * h, h]], 1), { x, y: topY(x) });
  const dorsal = [-1.2, -0.95, -0.7, -0.45, -0.2, 0.05, 0.3, 0.55, 0.8, 1.05, 1.3, 1.52];
  const hs = (x) => 0.26 + 0.1 * Math.cos((x + 1.0) * 2.5) ** 2 + (x > 1.1 ? 0.18 : 0) + (x < -0.95 ? 0.16 : 0);
  const dorsalLayer = {
    shapes: dorsal.map((x) => spikeAt(x, hs(x))), fill: { top: PAL.bone[0], bottom: PAL.bone[1] }, stroke: 'rgba(70,35,15,0.6)',
    deco(c, bb) { volume(c, bb, { dark: 'rgba(100,60,20,0.25)', light: 'rgba(255,255,240,0.25)' }); },
  };
  const hornsLayer = { shapes: [hornB, hornC], fill: { top: PAL.bone[0], bottom: PAL.bone[1] }, stroke: 'rgba(70,35,15,0.6)', deco(c, bb) { volume(c, bb, { dark: 'rgba(100,60,20,0.3)' }); } };
  const headLayer = {
    shapes: [head], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(50,20,5,0.22)', light: 'rgba(255,230,190,0.18)' });
      fillPoly(c, [HH(2.95, 1.3), HH(3.3, 1.3), HH(3.3, 0.6), HH(2.9, 0.6), HH(2.92, 1.0)], PAL.beak, 0.97);        // heller Schnabel
      fillPoly(c, [HH(2.0, 0.95), HH(2.5, 0.92), HH(3.0, 0.9), HH(3.0, 0.6), HH(2.0, 0.6)], PAL.belly, 0.55);
      scute(c, ...HH(2.45, 1.32), 0.2, 0.08, 0.0, true); scute(c, ...HH(2.75, 1.26), 0.15, 0.07, -0.25, false);
      curve(c, [HH(3.05, 0.96), HH(2.85, 0.9), HH(2.62, 0.9), HH(2.48, 0.96)], 'rgba(60,30,12,.85)', 0.03);
      dot(c, ...HH(3.0, 1.08), 0.03, 'rgba(60,30,12,.85)');
      cuteEye(c, ...HH(2.52, 1.14), 0.14, { iris: PAL.eye });
      curve(c, [HH(2.34, 1.28), HH(2.52, 1.34), HH(2.72, 1.27)], 'rgba(50,25,10,.7)', 0.05);
      cheek(c, ...HH(2.7, 0.95), 0.1, '#f09a8a', 0.5);
    },
  };

  // ---------- Schwanz mit Keule ----------
  const tailCtrl = [[-1.2, 1.25, 1.1], [-1.9, 1.3, 0.85], [-2.5, 1.32, 0.6], [-2.95, 1.31, 0.46]];
  const tailShape = limb(tailCtrl);
  const clubC = [-3.35, 1.31];
  const club = [blob(clubC[0], clubC[1], 0.52, 0.44, 0.0, 30), poly([[-3.15, 1.66], [-3.42, 1.98], [-3.62, 1.64]], 1), poly([[-3.15, 0.96], [-3.42, 0.66], [-3.62, 1.0]], 1), poly([[-3.8, 1.38], [-4.15, 1.3], [-3.8, 1.22]], 1)];
  const tspike = (x, y, h) => xf(poly([[-0.12, -0.05], [0.12, -0.05], [-0.05, h]], 1), { x, y });
  const tailSpikes = [[-2.0, 1.6, 0.34], [-2.4, 1.62, 0.32], [-2.8, 1.6, 0.28]].map(([x, y, h]) => tspike(x, y, h));
  const tailSpikesLow = [[-2.05, 1.0, -0.32], [-2.5, 0.99, -0.3]].map(([x, y, h]) => xf(poly([[-0.11, 0.05], [0.11, 0.05], [-0.05, h]], 1), { x, y }));
  const tailLayerMain = {
    shapes: [tailShape], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(50,20,5,0.24)', light: 'rgba(255,230,190,0.16)' });
      fillPoly(c, band(tailCtrl, 0.35, 1.6), PAL.belly, 0.95);
      for (let i = 0; i < 4; i++) scute(c, -1.55 - i * 0.43, 1.37 + i * 0.0, 0.17, 0.12, -0.02, i % 2 === 0);
    },
  };
  const tailSpikeLayer = {
    shapes: [...tailSpikes, ...tailSpikesLow], fill: { top: PAL.bone[0], bottom: PAL.bone[1] }, stroke: 'rgba(70,35,15,0.6)',
    deco(c, bb) { volume(c, bb, { dark: 'rgba(100,60,20,0.25)' }); },
  };
  const clubLayer = {
    shapes: club, fill: { top: '#f0d9a2', bottom: '#bf9a5c' }, stroke: 'rgba(70,35,15,0.65)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(100,60,20,0.3)', light: 'rgba(255,255,240,0.3)' });
      // Knochenfurchen quer ueber die Keule
      for (let i = -2; i <= 2; i++) line(c, [[clubC[0] - 0.4 + i * 0.01, clubC[1] + i * 0.18 + 0.1], [clubC[0] + 0.3, clubC[1] + i * 0.16]], 'rgba(120,80,40,.4)', 0.025);
      dot(c, clubC[0] - 0.1, clubC[1] + 0.15, 0.07, 'rgba(120,80,40,.3)');
    },
  };

  const hip = [-1.2, 1.25];
  return {
    id: 'ankylosaurus',
    parts: {
      tail: { z: 0, pivot: hip, layers: [tailSpikeLayer, tailLayerMain, clubLayer] },
      body: { z: 1, layers: [farLegs, main, dorsalLayer, hindN, frontN, hornsLayer, headLayer] },
    },
    anchors: { head: HH(2.6, 1.1), mouth: HH(3.05, 0.95), eye: HH(2.52, 1.14), back: [0.1, 2.4], foot: [1.3, 0], club: clubC, hip },
    meta: { name: 'Ankylosaurus', lengthM: 6.5, ranges: { tail: [-0.6, 0.6] } },
  };
}
