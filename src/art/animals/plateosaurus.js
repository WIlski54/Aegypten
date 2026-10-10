// Plateosaurus (Obertrias, ~8 m): langer Hals, kleiner Kopf, kraeftiger Koerper, grosse Daumenkralle, halb-zweibeinig.
// Teile: body (Rumpf, Schwanz, Beine, Arme), neck (Hals+Kopf, Pivot an den Schultern; Heben zu Zweigen = positiv).
import { blob, limb, poly, xf, move, claw, band, fillPoly, curve, cuteEye, cheek, crossStripes, mix, dark, light, line, dot, volume } from './_b_kit.js';

const PAL = { back: '#bf7448', mid: '#d4955f', belly: '#efd9a8', mark: '#7d3f25', leg: '#a8623c', claw: '#5a3820', eye: '#6b3a1a' };

export default function make(opts = {}) {
  // ---------- Rumpf ----------
  const torso = poly([
    [-1.25, 2.0], [-0.6, 2.42], [0.3, 2.62], [1.25, 2.62], [1.95, 2.35], [2.2, 1.85], [1.95, 1.22], [1.2, 0.92], [0.2, 0.92], [-0.6, 1.22], [-1.25, 1.75],
  ], 3);
  const tailCtrl = [[-0.7, 2.02, 1.2], [-1.7, 2.02, 0.85], [-2.7, 1.9, 0.46], [-3.5, 1.66, 0.22], [-4.15, 1.42, 0.02]];
  const tail = limb(tailCtrl);
  // Hinterbeine (nah / fern)
  const legCtrl = [[-0.02, 1.85, 1.15], [0.38, 1.32, 0.92], [0.6, 0.95, 0.6], [0.38, 0.62, 0.44], [0.16, 0.38, 0.38], [0.3, 0.14, 0.34]];
  const legShape = (dx, dy = 0) => {
    const l = limb(legCtrl.map(([x, y, w]) => [x + dx, y + dy, w]));
    const foot = limb([[0.2 + dx, 0.2 + dy, 0.28], [0.58 + dx, 0.09 + dy, 0.22], [1.0 + dx, 0.05 + dy, 0.13]]);
    const thigh = blob(0.18 + dx, 1.55 + dy, 0.58, 0.46, -0.5);
    return [l, foot, thigh];
  };
  const legNear = legShape(0), legFar = legShape(-0.55);
  const toes = (dx) => [0, 1, 2].map((i) => limb([[0.82 + dx, 0.09 - i * 0.025, 0.14], [1.08 + dx + i * 0.03, 0.06 - i * 0.02, 0.12], [1.25 + dx + i * 0.02, 0.04 - i * 0.015, 0.07]], { per: 6 }));
  // Arme mit Daumenkralle
  const armCtrl = (dx, dy = 0) => [[1.38 + dx, 1.82 + dy, 0.4], [1.52 + dx, 1.35 + dy, 0.3], [1.88 + dx, 1.08 + dy, 0.25], [2.08 + dx, 0.98 + dy, 0.21]];
    const armFar = [limb(armCtrl(-0.36, 0.03)), blob(1.74, 0.97, 0.11, 0.085, -0.3)];
  const thumbClaw = [claw(2.1, 1.0, -0.15, 0.66, 0.19, -1.25)];
  const fingers = [0, 1].map((i) => limb([[2.12, 0.99 - i * 0.05, 0.07], [2.3, 0.9 - i * 0.07, 0.055], [2.38, 0.84 - i * 0.09, 0.02]], { per: 6 }));

  // ---------- Hals + Kopf ----------
  const neckCtrl = [[1.4, 2.1, 0.95], [1.85, 2.62, 0.62], [2.27, 3.14, 0.45], [2.72, 3.54, 0.35], [3.2, 3.7, 0.31], [3.6, 3.64, 0.28]];
  const neckShape = limb(neckCtrl);
  const HC = [3.6, 3.64], HS = 1.3;                       // Kopf-Ursprung (Halsende) und Massstab
  const hp = (dx, dy) => [HC[0] + dx * HS, HC[1] + dy * HS];
  const head = poly([
    hp(-0.2, 0.22), hp(0.1, 0.3), hp(0.38, 0.27), hp(0.58, 0.19), hp(0.74, 0.08), hp(0.78, -0.04), hp(0.72, -0.16), hp(0.5, -0.24), hp(0.2, -0.32), hp(-0.05, -0.32), hp(-0.22, -0.18),
  ], 3);

  // ---------- Layers: ferne Gliedmassen, Rumpf, nahes Bein, naher Arm ----------
  const farLimbs = {
    shapes: [...legFar, ...toes(-0.55), ...armFar], fill: { top: dark(PAL.leg, 0.28), bottom: dark(PAL.leg, 0.4) },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(20,8,0,.25)' }); },
  };
  const main = {
    shapes: [torso, tail], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,25,5,0.2)', light: 'rgba(255,240,200,0.18)' });
      for (let i = 0; i < 8; i++) line(c, [[-0.8 + i * 0.3, 2.65], [-0.95 + i * 0.3, 1.85]], PAL.mark, 0.1, { alpha: 0.42 });
      crossStripes(c, tailCtrl, PAL.mark, 7, { half: 1.15, width: 0.12, alpha: 0.42, t0: 0.12, t1: 0.82, tilt: 0.1 });
      fillPoly(c, blob(0.5, 0.55, 1.75, 0.75), PAL.belly, 0.97);          // heller Bauch
      fillPoly(c, band(tailCtrl, 0.3, 1.6), PAL.belly, 0.92);            // heller Schwanzbauch
    },
  };
  const legN = {
    shapes: [...legNear, ...toes(0)], fill: { top: PAL.back, bottom: PAL.leg },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(50,20,0,0.3)', light: 'rgba(255,240,200,0.2)' });
      line(c, [[0.45, 1.75], [0.7, 1.15], [0.5, 0.95]], PAL.mark, 0.06, { alpha: 0.35 });
    },
  };
  const armN = {
    shapes: [limb(armCtrl(0)), blob(2.1, 0.95, 0.12, 0.09, -0.3), ...fingers], fill: { top: PAL.mid, bottom: PAL.leg },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(50,20,0,0.3)' }); },
  };
  const clawL = { shapes: thumbClaw, fill: { top: '#7a4e2e', bottom: PAL.claw }, stroke: 'rgba(30,15,5,0.7)', deco(c, bb) { volume(c, bb, { dark: 'rgba(20,10,0,0.3)', light: 'rgba(255,230,190,0.28)' }); } };

  const neckLayer = {
    shapes: [neckShape, head], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,25,5,0.14)', light: 'rgba(255,240,200,0.2)' });
      crossStripes(c, neckCtrl, PAL.mark, 6, { half: 1.1, width: 0.075, alpha: 0.4, t0: 0.2, t1: 0.86, tilt: -0.25 });
      fillPoly(c, band(neckCtrl.slice(0, 5), -1.5, -0.1), PAL.belly, 0.95);   // heller Hals-Unterseite
      // Kopf: hellere Unterseite, Nasenloch, Laecheln, grosses Auge
      fillPoly(c, [hp(-0.24, -0.14), hp(0.2, -0.2), hp(0.55, -0.15), hp(0.82, -0.1), hp(0.82, -0.45), hp(-0.24, -0.45)], PAL.belly, 0.95);
      curve(c, [hp(0.72, -0.1), hp(0.52, -0.14), hp(0.34, -0.13), hp(0.22, -0.07), hp(0.17, -0.02)], 'rgba(70,30,10,.85)', 0.018);
      dot(c, ...hp(0.64, 0.05), 0.016, 'rgba(60,25,10,.85)');
      cuteEye(c, ...hp(0.27, 0.07), 0.1, { iris: PAL.eye });
      curve(c, [hp(0.12, 0.2), hp(0.27, 0.25), hp(0.42, 0.2)], 'rgba(70,30,10,.55)', 0.02);
      cheek(c, ...hp(0.36, -0.1), 0.06, '#ee8f78', 0.5);
    },
  };

  const shoulder = [1.4, 2.1];
  return {
    id: 'plateosaurus',
    parts: {
      neck: { z: 0, pivot: shoulder, layers: [neckLayer] },
      body: { z: 1, layers: [farLimbs, main, legN, armN, clawL] },
    },
    anchors: { head: hp(0.4, 0), mouth: hp(0.74, -0.1), eye: hp(0.27, 0.07), back: [0.2, 2.45], foot: [0.6, 0], tail: [-4.7, 1.3], shoulder },
    meta: { name: 'Plateosaurus', lengthM: 8, ranges: { neck: [0, 0.35] } },
  };
}
