// Maiasaura (Oberkreide, ~9 m, Hadrosaurier): flache Entenschnabel-Schnauze, kleiner Kamm ueber den Augen, kraeftige Hinterbeine, geht vierbeinig.
// Teile: body (Rumpf, Schwanz, Beine), neck (Hals+Kopf, Pivot an den Schultern; Senken zum Nest = negativ). Kein jaw: Hals und Kiefer
// sind getrennte flache Teile, ein Kiefer wuerde die Halsdrehung nicht mitmachen.
import { blob, limb, poly, xf, move, band, fillPoly, curve, cuteEye, cheek, crossStripes, mix, dark, light, line, dot, volume, spots } from './_b_kit.js';

const PAL = { back: '#8a9a48', mid: '#aab665', belly: '#f0e2a6', mark: '#4c5a22', leg: '#76863c', bill: ['#f6b162', '#e68f3c'], crest: '#f08a3a', eye: '#6b3a1a', hoof: '#f1e2b4' };

export default function make(opts = {}) {
  // ---------- Rumpf ----------
  const torso = poly([
    [-1.5, 2.05], [-1.1, 2.52], [-0.4, 2.78], [0.5, 2.84], [1.3, 2.76], [1.95, 2.5], [2.25, 2.0], [2.1, 1.45], [1.4, 1.15], [0.5, 1.05],
    [-0.4, 1.15], [-1.1, 1.45],
  ], 3);
  const tailCtrl = [[-1.2, 2.2, 1.2], [-2.3, 2.22, 0.9], [-3.4, 2.12, 0.62], [-4.3, 1.9, 0.34], [-5.0, 1.66, 0.02]];
  const tail = limb(tailCtrl);
  // Hinterbeine
  const hindL = (dx) => {
    const l = limb([[-0.05 + dx, 2.05, 1.3], [0.45 + dx, 1.4, 1.0], [0.3 + dx, 0.88, 0.62], [0.1 + dx, 0.52, 0.46], [0.22 + dx, 0.16, 0.4]]);
    const foot = limb([[0.18 + dx, 0.2, 0.34], [0.55 + dx, 0.1, 0.28], [0.88 + dx, 0.06, 0.18]]);
    const toes = [0, 1, 2].map((i) => blob(0.92 + dx + i * 0.03, 0.14 - i * 0.065, 0.08, 0.06, 0.0, 12));
    return [l, foot, ...toes, blob(0.22 + dx, 1.62, 0.62, 0.5, -0.5, 26)];
  };
  const hoofP = (dx) => [0, 1, 2].map((i) => blob(0.95 + dx + i * 0.03, 0.14 - i * 0.065, 0.045, 0.04, 0.0, 10));
  // Vorderbeine (schlank), gehen mit
  const frontL = (dx, dy = 0) => {
    const l = limb([[1.5 + dx, 1.8, 0.7], [1.56 + dx, 1.3, 0.52], [1.66 + dx, 0.72, 0.4], [1.74 + dx, 0.2, 0.36]]);
    return [l, blob(1.84 + dx, 0.08, 0.26, 0.1, 0.0, 16), ...[0, 1, 2].map((i) => blob(2.04 + dx - i * 0.0, 0.13 - i * 0.05, 0.07, 0.05, 0.0, 10))];
  };
  const farLegs = {
    shapes: [...hindL(-0.62), ...frontL(-0.55)], fill: { top: dark(PAL.leg, 0.2), bottom: dark(PAL.leg, 0.34) },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(20,25,0,.28)' }); },
  };
  const main = {
    shapes: [torso, tail], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,50,10,0.22)', light: 'rgba(255,250,200,0.2)' });
      for (let i = 0; i < 9; i++) line(c, [[-1.3 + i * 0.36, 2.95], [-1.45 + i * 0.36, 1.95]], PAL.mark, 0.12, { alpha: 0.42 });
      crossStripes(c, tailCtrl, PAL.mark, 8, { half: 1.15, width: 0.13, alpha: 0.42, t0: 0.12, t1: 0.88, tilt: 0.1 });
      spots(c, { x0: -1.3, y0: 1.7, w: 3.2, h: 0.6 }, PAL.mark, 6, 0.04, 0.09, { seed: 8, alpha: 0.28 });
      fillPoly(c, blob(0.35, 0.85, 2.0, 0.65), PAL.belly, 0.97);
      fillPoly(c, band(tailCtrl, 0.35, 1.6), PAL.belly, 0.93);
    },
  };
  const hindN = {
    shapes: hindL(0), fill: { top: PAL.back, bottom: PAL.leg },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(30,40,5,0.3)', light: 'rgba(255,250,200,0.2)' }); line(c, [[0.6, 2.3], [0.85, 1.5], [0.45, 1.0]], PAL.mark, 0.07, { alpha: 0.3 }); hoofP(0).forEach((h) => fillPoly(c, h, PAL.hoof)); },
  };
  const frontN = {
    shapes: frontL(0), fill: { top: PAL.back, bottom: PAL.leg },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(30,40,5,0.3)', light: 'rgba(255,250,200,0.2)' }); },
  };

  // ---------- Hals + Kopf (Entenschnabel) ----------
  const neckCtrl = [[1.7, 2.35, 1.1], [2.1, 2.8, 0.7], [2.5, 3.1, 0.52], [2.95, 3.2, 0.44], [3.3, 3.12, 0.42]];
  const neckShape = limb(neckCtrl);
  const HC = [3.3, 3.08], HS = 1.45; const hp = (dx, dy) => [HC[0] + dx * HS, HC[1] + dy * HS];
  const head = poly([
    hp(-0.2, 0.26), hp(0.12, 0.34), hp(0.42, 0.32), hp(0.78, 0.22), hp(1.05, 0.12), hp(1.2, 0.05), hp(1.24, -0.06), hp(1.18, -0.18), hp(0.85, -0.24),
    hp(0.45, -0.29), hp(0.15, -0.3), hp(-0.08, -0.17), hp(-0.2, 0.03),
  ], 2);
  const crest = poly([hp(0.05, 0.32), hp(0.22, 0.46), hp(0.4, 0.46), hp(0.52, 0.3)], 2);
  const neckLayer = {
    shapes: [neckShape, head, crest], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,50,10,0.14)', light: 'rgba(255,250,200,0.2)' });
      crossStripes(c, neckCtrl, PAL.mark, 5, { half: 1.1, width: 0.09, alpha: 0.42, t0: 0.2, t1: 0.85, tilt: -0.25 });
      fillPoly(c, band(neckCtrl, -1.5, -0.15), PAL.belly, 0.95);
      fillPoly(c, [hp(-0.25, -0.12), hp(0.3, -0.1), hp(0.8, -0.02), hp(1.0, 0.0), hp(1.0, -0.45), hp(-0.25, -0.45)], PAL.belly, 0.95);
      // Entenschnabel: orange, vorn breit
      fillPoly(c, [hp(0.88, 0.3), hp(1.45, 0.3), hp(1.45, -0.4), hp(0.82, -0.4), hp(0.86, -0.05)], PAL.bill[0], 0.97);
      curve(c, [hp(1.2, -0.09), hp(1.02, -0.12), hp(0.84, -0.1), hp(0.7, -0.05)], 'rgba(90,45,15,.85)', 0.03);
      dot(c, ...hp(1.08, 0.06), 0.026, 'rgba(90,45,15,.9)');
      dot(c, ...hp(1.16, 0.06), 0.026, 'rgba(90,45,15,.9)');
      cuteEye(c, ...hp(0.4, 0.1), 0.11, { iris: PAL.eye });
      curve(c, [hp(0.25, 0.22), hp(0.4, 0.27), hp(0.56, 0.22)], 'rgba(60,45,20,.55)', 0.03);
      // Kamm: orange mit hellen Streifen
      fillPoly(c, [hp(0.0, 0.3), hp(0.2, 0.5), hp(0.44, 0.5), hp(0.58, 0.28)], PAL.crest, 0.92);
      line(c, [hp(0.22, 0.34), hp(0.3, 0.46)], '#fbe0a8', 0.024, { alpha: 0.8 });
      line(c, [hp(0.34, 0.34), hp(0.4, 0.46)], '#fbe0a8', 0.024, { alpha: 0.8 });
      cheek(c, ...hp(0.62, -0.1), 0.085, '#f0907a', 0.5);
    },
  };

  const pivot = [1.7, 2.35];
  return {
    id: 'maiasaura',
    parts: {
      neck: { z: 0, pivot, layers: [neckLayer] },
      body: { z: 1, layers: [farLegs, main, hindN, frontN] },
    },
    anchors: { head: hp(0.6, 0.0), mouth: hp(1.25, -0.1), eye: hp(0.4, 0.1), back: [0.4, 2.75], foot: [0.6, 0], tail: [-5.0, 1.66], nest: [3.5, 0.2], neck: pivot },
    meta: { name: 'Maiasaura', lengthM: 9, ranges: { neck: [0, -0.35] } },
  };
}
