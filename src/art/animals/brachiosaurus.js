// Brachiosaurus / Giraffatitan (Oberjura, ~22 m, Schulterhoehe ~6 m): Vorderbeine laenger als Hinterbeine, sehr langer steil
// aufragender Hals, kleiner Kopf mit Nasenaufwoelbung, kurzer Schwanz.
// Teile: body (Rumpf, Schwanz, Beine), neck (Hals+Kopf, Pivot an der Schulter; Heben = positiv).
import { blob, limb, poly, xf, move, band, at, fillPoly, curve, cuteEye, cheek, mix, dark, light, line, dot, volume, spots, mulberry32 } from './_b_kit.js';

const PAL = { back: '#8c7ba2', mid: '#a597b9', belly: '#eee0cb', mark: '#5d4c7a', leg: '#7a6a91', claw: '#f6ecd6', eye: '#8a5a22' };

export default function make(opts = {}) {
  // ---------- Rumpf (Rueckenlinie steigt zu den Schultern an) ----------
  const torso = poly([
    [-0.6, 4.5], [0.8, 4.95], [2.4, 5.25], [4.0, 5.72], [5.3, 6.12], [6.5, 6.0], [7.4, 5.4], [7.9, 4.45], [7.65, 3.4],
    [6.6, 2.9], [4.8, 2.82], [3.0, 2.9], [1.5, 3.05], [0.2, 3.35], [-0.7, 3.9],
  ], 3);
  const tailCtrl = [[-0.2, 4.15, 2.1], [-2.0, 3.98, 1.5], [-3.9, 3.55, 0.98], [-5.7, 2.9, 0.54], [-7.2, 2.35, 0.24], [-8.15, 2.05, 0.02]];
  const tail = limb(tailCtrl);

  // ---------- Beine (Saeulen), Vorderbeine hoeher als Hinterbeine ----------
  const frontCtrl = (dx) => [[6.25 + dx, 4.9, 1.3], [6.5 + dx, 3.7, 2.0], [6.62 + dx, 2.2, 1.45], [6.68 + dx, 1.0, 1.2]];
  const hindCtrl = (dx) => [[1.4 + dx, 4.6, 1.5], [1.62 + dx, 3.4, 2.4], [1.78 + dx, 2.0, 1.65], [1.84 + dx, 0.95, 1.28]];
  // Fuss mit drei Zehenhoeckern vorn
  const foot = (x, w = 0.9) => [blob(x, 0.3, w, 0.32, 0.0, 28), poly([[x - w * 0.9, 0.0], [x + w * 0.9, 0.0], [x + w * 0.9, 0.35], [x - w * 0.9, 0.5]], 2),
    ...[0, 1, 2].map((i) => blob(x + w * (0.9 - i * 0.07), 0.12 + i * 0.12, 0.17, 0.12, 0.0, 14))];
  const legF = (dx) => [limb(frontCtrl(dx)), ...foot(6.8 + dx, 0.8)];
  const legH = (dx) => [limb(hindCtrl(dx)), ...foot(2.05 + dx, 0.92)];
  const nails = (x, w) => [0, 1, 2].map((i) => blob(x + w * (0.9 - i * 0.07) + 0.09, 0.12 + i * 0.12, 0.085, 0.07, 0.0, 12));

  // ---------- Hals (steil) + Kopf ----------
  const PV = [5.7, 4.8], ROT0 = 0.1;   // Ruhehaltung: Hals um 0,1 rad steiler als der Entwurf
  const rp = (x, y) => { const dx = x - PV[0], dy = y - PV[1], c = Math.cos(ROT0), s = Math.sin(ROT0); return [PV[0] + dx * c - dy * s, PV[1] + dx * s + dy * c]; };
  const neckCtrl = [[5.7, 4.8, 1.9], [6.3, 6.4, 1.62], [7.1, 8.3, 1.28], [8.0, 10.2, 1.0], [8.9, 11.7, 0.8], [9.7, 12.6, 0.68], [10.35, 12.9, 0.6]].map(([x, y, w]) => [...rp(x, y), w]);
  const neckShape = limb(neckCtrl);
  const T = rp(10.2, 12.88), HR = -0.14 + ROT0, HS = 1.15;
  const hp = (dx, dy) => { const x = dx * HS, y = dy * HS; return [T[0] + x * Math.cos(HR) - y * Math.sin(HR), T[1] + x * Math.sin(HR) + y * Math.cos(HR)]; };
  const head = poly([
    hp(-0.42, 0.22), hp(-0.32, 0.46), hp(0.05, 0.64), hp(0.34, 0.96), hp(0.6, 1.1), hp(0.92, 0.92), hp(1.2, 0.62), hp(1.42, 0.4), hp(1.5, 0.14),
    hp(1.4, -0.08), hp(0.98, -0.2), hp(0.5, -0.3), hp(0.0, -0.36), hp(-0.4, -0.12),
  ], 2);

  // ---------- Layers ----------
  const spotSeed = 21;
  const farLegs = {
    shapes: [...legF(-1.1), ...legH(1.25)], fill: { top: dark(PAL.leg, 0.1), bottom: dark(PAL.leg, 0.22) },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(15,5,30,.28)' }); },
  };
  const main = {
    shapes: [torso, tail], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,20,70,0.22)', light: 'rgba(255,240,230,0.18)' });
      spots(c, { x0: -7.5, y0: 3.7, w: 14, h: 2.4 }, PAL.mark, 11, 0.28, 0.55, { seed: spotSeed, alpha: 0.5 });
      spots(c, { x0: -7.0, y0: 2.6, w: 6, h: 1.5 }, PAL.mark, 5, 0.16, 0.3, { seed: 5, alpha: 0.45 });
      fillPoly(c, blob(3.5, 2.3, 5.8, 1.15), PAL.belly, 0.97);                         // heller Bauch
      fillPoly(c, band(tailCtrl, 0.4, 1.6), PAL.belly, 0.93);                           // heller Schwanzbauch
    },
  };
  const legNearF = {
    shapes: legF(0), fill: { top: PAL.back, bottom: PAL.leg },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(30,10,60,0.32)', light: 'rgba(255,240,230,0.16)' }); spots(c, { x0: bb.x0, y0: 2.2, w: bb.w, h: 2.6 }, PAL.mark, 3, 0.14, 0.3, { seed: 9, alpha: 0.4 }); nails(6.8, 0.8).forEach((n) => fillPoly(c, n, PAL.claw)); },
  };
  const legNearH = {
    shapes: legH(0), fill: { top: PAL.back, bottom: PAL.leg },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(30,10,60,0.32)', light: 'rgba(255,240,230,0.16)' }); spots(c, { x0: bb.x0, y0: 2.2, w: bb.w, h: 2.6 }, PAL.mark, 3, 0.14, 0.3, { seed: 13, alpha: 0.4 }); nails(2.05, 0.92).forEach((n) => fillPoly(c, n, PAL.claw)); },
  };
  const neckLayer = {
    shapes: [neckShape, head], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,20,70,0.14)', light: 'rgba(255,240,230,0.2)' });
      spots(c, { x0: 5.6, y0: 5.5, w: 3.2, h: 7 }, PAL.mark, 8, 0.12, 0.25, { seed: 31, alpha: 0.45 });
      fillPoly(c, band(neckCtrl.slice(0, 6), -1.6, -0.2), PAL.belly, 0.96);                // helle Kehle (Vorderseite des Halses)
      // Kopf: helle Unterseite, Nasenloch, Mundwinkel, Auge
      fillPoly(c, [hp(-0.45, -0.1), hp(0.0, -0.1), hp(0.5, -0.04), hp(1.0, -0.02), hp(1.55, 0.0), hp(1.55, -0.5), hp(-0.45, -0.5)], PAL.belly, 0.95);
      curve(c, [hp(1.44, 0.02), hp(1.2, -0.02), hp(0.95, -0.03), hp(0.7, -0.01)], 'rgba(70,40,30,.8)', 0.04);
      dot(c, ...hp(0.66, 0.94), 0.05, 'rgba(60,35,45,.85)');
      cuteEye(c, ...hp(0.3, 0.36), 0.19, { iris: PAL.eye });
      curve(c, [hp(0.06, 0.56), hp(0.28, 0.62), hp(0.52, 0.56)], 'rgba(60,40,60,.5)', 0.05);
      cheek(c, ...hp(0.62, 0.06), 0.1, '#f09a8a', 0.5);
    },
  };

  const pivot = [5.7, 4.8];
  return {
    id: 'brachiosaurus',
    parts: {
      neck: { z: 0, pivot, layers: [neckLayer] },
      body: { z: 1, layers: [farLegs, main, legNearH, legNearF] },
    },
    anchors: { head: hp(0.7, 0.2), mouth: hp(1.45, 0.05), eye: hp(0.3, 0.36), back: [3.5, 5.4], foot: [6.8, 0], tail: [-8.1, 2.05], shoulder: pivot },
    meta: { name: 'Brachiosaurus', lengthM: 22, ranges: { neck: [-0.25, 0.3] } },
  };
}
