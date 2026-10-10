// Maiasaura-Baby (~0,6 m): sehr niedlich – grosse Augen, runder Kopf, Stummelbeine, kleiner Entenschnabel.
// Teile: body (Rumpf, Kopf, Beine, Schwanz), jaw (Unterschnabel, Pivot am Mundwinkel; Oeffnen = negativ).
import { blob, limb, poly, band, fillPoly, curve, cuteEye, cheek, mix, dark, light, line, dot, volume, spots } from './_b_kit.js';

const PAL = { back: '#a7bd62', mid: '#c4d386', belly: '#fbf2c8', mark: '#5f7430', bill: ['#fbbd72', '#f09a48'], eye: '#7a4420', leg: '#93aa50' };
const K = 0.55; // Entwurf in "Babyeinheiten", Skalierung auf Meter
const B = (x, y, rx, ry = rx, rot = 0, n = 30) => blob(x * K, y * K, rx * K, ry * K, rot, n);
const L = (ctrl, o) => limb(ctrl.map(([x, y, w]) => [x * K, y * K, w * K]), o);
const Pp = (pts, sm = 0) => poly(pts.map(([x, y]) => [x * K, y * K]), sm);
const Q = (x, y) => [x * K, y * K];

export default function make(opts = {}) {
  // ---------- Entwurf: Rumpf rund, Kopf gross (ca. 40 % der Rumpfhoehe) ----------
  const body = B(-0.03, 0.21, 0.27, 0.215, 0.14);
  const tailCtrl = [[-0.2, 0.25, 0.24], [-0.38, 0.23, 0.16], [-0.52, 0.27, 0.02]];
  const tail = L(tailCtrl);
  const neck = B(0.18, 0.32, 0.17, 0.17);
  const head = B(0.29, 0.43, 0.22, 0.195, 0.05, 36);
  const bill = Pp([[0.4, 0.53], [0.6, 0.515], [0.7, 0.47], [0.72, 0.415], [0.65, 0.39], [0.4, 0.39]], 2);
  const crestBump = B(0.37, 0.605, 0.075, 0.035, -0.15, 16);
  // Stummelbeine
  const hindL = (dx) => [L([[0.02 + dx, 0.19, 0.21], [0.04 + dx, 0.1, 0.17], [0.05 + dx, 0.025, 0.15]]), B(0.1 + dx, 0.03, 0.11, 0.05, 0, 16)];
  const armL = (dx) => [L([[0.22 + dx, 0.2, 0.1], [0.28 + dx, 0.1, 0.08], [0.31 + dx, 0.03, 0.08]]), B(0.34 + dx, 0.03, 0.05, 0.035, 0, 12)];
  const farLimbs = {
    shapes: [...hindL(-0.14), ...armL(-0.1)], fill: { top: dark(PAL.leg, 0.15), bottom: dark(PAL.leg, 0.28) }, stroke: 'rgba(50,35,10,0.18)',
    deco(c, bb) { volume(c, bb, { dark: 'rgba(20,35,5,.25)' }); },
  };
  const main = {
    shapes: [body, tail, neck], fill: { top: PAL.back, bottom: PAL.mid }, stroke: 'rgba(50,35,10,0.18)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,60,10,0.18)', light: 'rgba(255,255,220,0.25)' });
      // Streifen auf dem Ruecken, Tupfen
      for (let i = 0; i < 5; i++) line(c, [Q(-0.35 + i * 0.14, 0.52), Q(-0.4 + i * 0.14, 0.27)], PAL.mark, 0.03, { alpha: 0.3 });
      spots(c, { x0: -0.3 * K, y0: 0.22 * K, w: 0.5 * K, h: 0.18 * K }, PAL.mark, 4, 0.008, 0.016, { seed: 3, alpha: 0.3 });
      fillPoly(c, B(0.06, 0.0, 0.34, 0.2).map(([x, y]) => [x, y]), PAL.belly, 0.97);
      fillPoly(c, band(tailCtrl.map(([x, y, w]) => [x * K, y * K, w * K]), 0.3, 1.6), PAL.belly, 0.95);
    },
  };
  const hindN = { shapes: hindL(0), fill: { top: PAL.back, bottom: PAL.leg }, stroke: 'rgba(50,35,10,0.18)', deco(c, bb) { volume(c, bb, { dark: 'rgba(30,50,5,0.28)', light: 'rgba(255,255,220,0.2)' }); } };
  const armN = { shapes: armL(0), fill: { top: PAL.mid, bottom: PAL.leg }, stroke: 'rgba(50,35,10,0.18)', deco(c, bb) { volume(c, bb, { dark: 'rgba(30,50,5,0.25)' }); } };
  const headLayer = {
    shapes: [head, bill, crestBump], fill: { top: PAL.back, bottom: PAL.mid }, stroke: 'rgba(50,35,10,0.18)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(40,60,10,0.16)', light: 'rgba(255,255,220,0.3)' });
      // Schnabel orange, Bauch-Kinn hell, grosse Augen mit Glanz, Wange rosa
      fillPoly(c, [Q(0.46, 0.6), Q(0.82, 0.6), Q(0.82, 0.39), Q(0.44, 0.39), Q(0.47, 0.45)], PAL.bill[0], 0.97);
      fillPoly(c, [Q(0.12, 0.34), Q(0.3, 0.34), Q(0.4, 0.37), Q(0.42, 0.2), Q(0.1, 0.2)], PAL.belly, 0.9);
      curve(c, [Q(0.71, 0.395), Q(0.62, 0.385), Q(0.52, 0.388), Q(0.44, 0.4)], 'rgba(100,50,15,.85)', 0.01);
      dot(c, ...Q(0.62, 0.49), 0.007, 'rgba(100,50,15,.9)'); dot(c, ...Q(0.66, 0.485), 0.007, 'rgba(100,50,15,.9)');
      dot(c, ...Q(0.7, 0.46), 0.011, '#fffaf0', 0.95);                       // Eizahn
      cuteEye(c, ...Q(0.32, 0.465), 0.092 * K, { iris: PAL.eye, look: 0.1 });
      cheek(c, ...Q(0.42, 0.375), 0.022, '#f58f86', 0.6);
    },
  };
  // Unterschnabel: dreht um den Mundwinkel, liegt hinter dem Kopf
  const jawPivot = Q(0.4, 0.4);
  const jaw = Pp([[0.36, 0.43], [0.55, 0.415], [0.68, 0.41], [0.68, 0.35], [0.6, 0.305], [0.45, 0.295], [0.36, 0.33]], 2);
  const jawLayer = {
    shapes: [jaw], fill: { top: PAL.bill[0], bottom: PAL.bill[1] }, stroke: 'rgba(90,45,10,0.28)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(120,60,10,0.25)', light: 'rgba(255,240,200,0.25)' });
      fillPoly(c, [Q(0.34, 0.44), Q(0.68, 0.415), Q(0.68, 0.375), Q(0.4, 0.385)], '#ee8d84', 0.95);   // Mundinneres, sichtbar beim Oeffnen
    },
  };

  return {
    id: 'maiasaura_baby',
    parts: {
      jaw: { z: 0, pivot: jawPivot, layers: [jawLayer] },
      body: { z: 1, layers: [farLimbs, main, hindN, armN, headLayer] },
    },
    anchors: { head: Q(0.4, 0.45), mouth: Q(0.7, 0.4), eye: Q(0.32, 0.465), back: Q(0.0, 0.43), foot: Q(0.05, 0), tail: Q(-0.52, 0.27) },
    meta: { name: 'Maiasaura (Jungtier)', lengthM: 0.6, ranges: { jaw: [0, -0.5] } },
  };
}
