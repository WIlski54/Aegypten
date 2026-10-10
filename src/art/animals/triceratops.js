// Triceratops (Oberkreide, ~8,5 m): drei Hoerner, grosser Nackenschild mit Zackenrand, Schnabel, massiger Koerper.
// Teile: body (Rumpf, Schwanz, Beine), head (Kopf samt Schild und Hoernern, Pivot an der Halsbasis; Senken/Angreifen = negativ).
// Der Kopf liegt hinter dem Rumpf (z kleiner): der Schild ragt wie ein Faecher hinter den Schultern auf.
import { blob, limb, poly, xf, move, band, fillPoly, strokePoly, curve, cuteEye, cheek, mix, dark, light, line, dot, volume, spots } from './_b_kit.js';

const PAL = { back: '#6b8795', mid: '#8eaab3', belly: '#ece5ce', mark: '#3e5662', leg: '#5c7886', eye: '#6b3a1a',
  horn: '#f6e3b0', hornD: '#c9a468', beak: '#ecd49c', frill: ['#f48e58', '#d4553b'], frillIn: '#f9bd82', frillDot: '#fff3d4', nail: '#f6e8c6' };

export default function make(opts = {}) {
  // ---------- Rumpf ----------
  const torso = poly([
    [-1.8, 2.1], [-1.5, 2.75], [-0.9, 3.0], [-0.1, 2.95], [0.7, 2.85], [1.3, 2.7], [1.85, 2.4], [2.1, 2.0], [1.95, 1.5], [1.4, 1.1],
    [0.4, 0.95], [-0.5, 1.0], [-1.2, 1.12], [-1.7, 1.4],
  ], 3);
  const tailCtrl = [[-1.5, 2.05, 1.05], [-2.2, 1.85, 0.7], [-2.8, 1.5, 0.38], [-3.35, 1.1, 0.04]];
  const tail = limb(tailCtrl);
  // Beine (saeulenartig); Fuss mit drei Zehen, helle Naegel
  const toeBlobs = (x) => [0, 1, 2].map((i) => blob(x + 0.5 - i * 0.02, 0.07 + i * 0.065, 0.14, 0.09, 0.0, 14));
  const nailBlobs = (x) => [0, 1, 2].map((i) => blob(x + 0.58 - i * 0.02, 0.07 + i * 0.065, 0.06, 0.055, 0.0, 12));
  const frontL = (dx) => [limb([[1.2 + dx, 1.9, 1.15], [1.5 + dx, 1.05, 0.9], [1.6 + dx, 0.3, 0.78]]), blob(1.7 + dx, 0.17, 0.62, 0.2, 0.0, 24), ...toeBlobs(1.7 + dx)];
  const hindL = (dx) => [limb([[-0.95 + dx, 2.0, 1.4], [-0.75 + dx, 1.3, 1.1], [-0.85 + dx, 0.5, 0.85]]), blob(-0.65 + dx, 0.17, 0.7, 0.2, 0.0, 24), ...toeBlobs(-0.65 + dx)];
  const farLegs = {
    shapes: [...frontL(-0.75), ...hindL(0.75)], fill: { top: dark(PAL.leg, 0.12), bottom: dark(PAL.leg, 0.26) },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(5,15,25,.28)' }); nailBlobs(1.7 - 0.75).concat(nailBlobs(-0.65 + 0.75)).forEach((n) => fillPoly(c, n, '#d8c9a0')); },
  };
  const main = {
    shapes: [torso, tail], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(10,25,40,0.22)', light: 'rgba(240,250,255,0.16)' });
      spots(c, { x0: -1.7, y0: 1.9, w: 3.4, h: 1.1 }, PAL.mark, 11, 0.07, 0.17, { seed: 17, alpha: 0.4 });
      for (let i = 0; i < 4; i++) line(c, [[-2.0 - i * 0.33, 2.4 - i * 0.18], [-2.0 - i * 0.33 - 0.05, 1.2]], PAL.mark, 0.09, { alpha: 0.35 });
      fillPoly(c, blob(0.1, 0.55, 2.6, 0.95), PAL.belly, 0.97);                      // heller Bauch
      fillPoly(c, band(tailCtrl, 0.3, 1.6), PAL.belly, 0.93);
    },
  };
  const legStyle = (seed) => (c, bb) => {
    volume(c, bb, { dark: 'rgba(10,25,40,0.3)', light: 'rgba(240,250,255,0.16)' });
    spots(c, { x0: bb.x0, y0: 0.8, w: bb.w, h: 1.4 }, PAL.mark, 3, 0.05, 0.1, { seed, alpha: 0.35 });
  };
  const frontN = { shapes: frontL(0), fill: { top: PAL.back, bottom: PAL.leg }, deco(c, bb) { legStyle(3)(c, bb); nailBlobs(1.7).forEach((n) => fillPoly(c, n, PAL.nail)); } };
  const hindN = { shapes: hindL(0), fill: { top: PAL.back, bottom: PAL.leg }, deco(c, bb) { legStyle(5)(c, bb); line(c, [[-0.7, 2.3], [-0.45, 1.55], [-0.7, 1.0]], PAL.mark, 0.06, { alpha: 0.3 }); nailBlobs(-0.65).forEach((n) => fillPoly(c, n, PAL.nail)); } };

  // ---------- Kopf (lokale Koordinaten u = entlang der Schaedelachse, v = senkrecht) ----------
  const O = [1.7, 2.05], ANG = -0.38, SC = 1.35; const ca = Math.cos(ANG), sa = Math.sin(ANG);
  const H = (u, v) => [O[0] + (u * ca - v * sa) * SC, O[1] + (u * sa + v * ca) * SC];
  const skull = poly([
    H(-0.1, 0.45), H(0.4, 0.62), H(0.9, 0.7), H(1.3, 0.68), H(1.7, 0.62), H(2.0, 0.56), H(2.3, 0.4), H(2.54, 0.16), H(2.6, -0.04), H(2.44, -0.24),
    H(2.05, -0.44), H(1.5, -0.62), H(1.0, -0.66), H(0.5, -0.58), H(0.0, -0.42),
  ], 2);
  const neckStub = [blob(1.95, 1.7, 0.8, 0.8, 0.0, 28), blob(1.65, 2.1, 0.7, 0.6, 0.0, 24)];
  // Hoerner: Basis im Schaedel versteckt
  const hornShape = (pts) => limb(pts.map(([u, v, w]) => [...H(u, v), w * SC]), { per: 8 });
  const browN = hornShape([[0.85, 0.62, 0.38], [1.4, 1.0, 0.28], [1.95, 1.2, 0.16], [2.3, 1.25, 0.02]]);
  const browF = hornShape([[0.75, 0.6, 0.36], [1.2, 1.05, 0.27], [1.65, 1.38, 0.15], [1.95, 1.58, 0.02]]);
  const noseH = hornShape([[1.95, 0.5, 0.34], [2.12, 0.78, 0.24], [2.2, 1.12, 0.02]]);
  // Nackenschild: abgerundetes Viereck (Superellipse) mit Zackenrand, nach hinten geneigt
  const FC = [1.78, 3.22], FR = [1.22, 1.08], FT = 0.46;
  const sup = (a, n = 2.7) => { const c = Math.cos(a), si = Math.sin(a); return [Math.sign(c) * Math.pow(Math.abs(c), 2 / n), Math.sign(si) * Math.pow(Math.abs(si), 2 / n)]; };
  const fpt = (a, k = 1, extra = 0) => { const [sx, sy] = sup(a); const ex = sx * (FR[0] * k + extra), ey = sy * (FR[1] * k + extra);
    return [FC[0] + ex * Math.cos(FT) - ey * Math.sin(FT), FC[1] + ex * Math.sin(FT) + ey * Math.cos(FT)]; };
  const frillPts = (() => {
    const pts = []; const a0 = -0.45, a1 = Math.PI * 1.2, n = 16;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n; pts.push(fpt(a));
      if (i < n) pts.push(fpt(a + (a1 - a0) / (2 * n), 1, 0.2));
    }
    pts.push([1.7, 2.35], [2.4, 2.4], [2.75, 2.7]);
    return pts;
  })();
  const frillShape = poly(frillPts, 1);
  const frillLayer = {
    shapes: [frillShape, blob(2.1, 2.55, 0.65, 0.55)], fill: { top: PAL.frill[0], bottom: PAL.frill[1] },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(100,20,10,0.22)', light: 'rgba(255,240,210,0.2)' });
      fillPoly(c, Array.from({ length: 36 }, (_, i) => fpt((i / 36) * Math.PI * 2, 0.7)), PAL.frillIn, 0.5);
      for (let i = 0; i < 8; i++) { const a = -0.3 + i * 0.52; line(c, [fpt(a, 0.18), fpt(a, 0.82)], 'rgba(160,45,28,.42)', 0.08); }
      const nD = 14;
      for (let i = 0; i <= nD; i++) { const a = -0.38 + (Math.PI * 1.15 + 0.38) * (i / nD); const p = fpt(a, 0.9); dot(c, p[0], p[1], 0.07, PAL.frillDot, 0.95); }
    },
  };
  const hornPaint = (c, bb) => { volume(c, bb, { dark: 'rgba(120,80,30,0.32)', light: 'rgba(255,255,245,0.3)' }); };
  const hornLayer = (shape, far) => ({ shapes: [shape], fill: far ? { top: '#c9b07a', bottom: '#9a7f4c' } : { top: PAL.horn, bottom: PAL.hornD }, stroke: 'rgba(70,45,15,0.65)', deco: hornPaint });
  const skullLayer = {
    shapes: [skull, ...neckStub], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(10,25,40,0.2)', light: 'rgba(240,250,255,0.18)' });
      spots(c, { x0: bb.x0, y0: bb.y0 + 0.6, w: bb.w * 0.6, h: bb.h * 0.6 }, PAL.mark, 6, 0.04, 0.08, { seed: 4, alpha: 0.35 });
      fillPoly(c, [H(2.05, 0.7), H(3.0, 0.7), H(3.0, -0.8), H(2.0, -0.8), H(2.03, 0.0)], PAL.beak, 0.97);           // heller Schnabel
      fillPoly(c, [H(0.3, -0.34), H(1.2, -0.3), H(2.1, -0.28), H(2.1, -0.9), H(0.2, -0.9)], PAL.belly, 0.7);       // hellerer Kiefer
      curve(c, [H(2.52, -0.1), H(2.2, -0.2), H(1.7, -0.3), H(1.25, -0.33), H(1.0, -0.26)], 'rgba(60,40,25,.85)', 0.04);
      dot(c, ...H(2.18, 0.28), 0.036, 'rgba(70,45,30,.85)');
      cuteEye(c, ...H(1.15, 0.34), 0.2, { iris: PAL.eye });
      cheek(c, ...H(1.45, -0.12), 0.12, '#f09a8a', 0.5);
    },
  };

  const pivot = [1.65, 2.1];
  return {
    id: 'triceratops',
    parts: {
      head: { z: 0.5, pivot, layers: [frillLayer, hornLayer(browF, true), hornLayer(noseH, false), skullLayer, hornLayer(browN, false)] },
      body: { z: 1, layers: [farLegs, main, hindN, frontN] },
    },
    anchors: { head: H(1.4, 0.0), mouth: H(2.5, -0.15), eye: H(1.15, 0.34), horn: H(2.3, 1.25), frill: FC, back: [-0.4, 3.0], foot: [2.0, 0], tail: [-3.3, 1.1], neck: pivot },
    meta: { name: 'Triceratops', lengthM: 8.5, ranges: { head: [0, -0.28] } },
  };
}
