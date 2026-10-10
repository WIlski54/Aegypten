// Eoraptor – "Morgenröte-Räuber", kleiner flinker Zweibeiner der Obertrias, ~1 m. Salbeigrün, Flecken, flinke Beine.
// Teile: body, jaw (Pivot Kiefergelenk), legA (fern), legB (nah) (Pivot Hüfte).
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { loop, soft, fillPoly, strokePoly, bar, underBand, topAt, theropodLeg, claws, teethRow, bigEye, rotPt, dorsalSpots, wedge, scaleSpec } from './_a_kit.js';

const HIP = [0.01, 0.345];
const HEAD0 = [0.43, 0.655], HEAD_ROT = -0.12, HS = 1.0;

function makeRaw(opts = {}) {
  const C = { back: '#6c9460', backLo: '#5d8553', belly: '#f4e8b6', dark: '#2f5035', accent: '#e8a04a', leg: '#6a9160', legFar: '#4c7046', cream: '#fbf0cc', pink: '#e0806c', eye: '#22160c' };
  const H = (p) => { const [x, y] = rotPt([HEAD0[0] + p[0] * HS, HEAD0[1] + p[1] * HS], HEAD0[0], HEAD0[1], HEAD_ROT); return [x, y]; };
  const Hs = (pts) => pts.map(H);

  // Rumpf + Hals + Schwanz in einem Strang (Schwanz hinten, leicht aufgerollt)
  const spineC = [
    [-0.64, 0.46, 0.008], [-0.52, 0.385, 0.03], [-0.34, 0.355, 0.075], [-0.15, 0.38, 0.135], [0.02, 0.405, 0.2], [0.17, 0.415, 0.2],
    [0.27, 0.45, 0.145], [0.33, 0.52, 0.105], [0.375, 0.59, 0.09], [0.425, 0.65, 0.085],
  ];
  const spine = limb(spineC, { per: 14 });
  const chest = blob(0.14, 0.385, 0.165, 0.135, 0.05, 40);
  const bellyB = blob(-0.02, 0.37, 0.19, 0.125, -0.05, 40);
  // Kopf: kurze Schnauze, runder Schädel (lokal, Länge ~0.2)
  const headL = [
    [0.205, 0.0], [0.18, 0.027], [0.13, 0.05], [0.07, 0.068], [0.01, 0.074], [-0.04, 0.06], [-0.055, 0.015], [-0.04, -0.03], [-0.005, -0.048],
    [0.06, -0.045], [0.12, -0.034], [0.17, -0.022],
  ];
  const head = loop(Hs(headL), 8);
  const teeth = teethRow(H([0.12, -0.034]), H([0.195, -0.018]), 3, 0.022, 0.016, 1, 0.1).map((t) => poly(t));
  const arm = limb([[0.22, 0.40, 0.055], [0.265, 0.325, 0.042], [0.34, 0.29, 0.03], [0.40, 0.295, 0.017]], { per: 10 });
  const fingers = [limb([[0.375, 0.293, 0.016], [0.43, 0.305, 0.009]], { per: 4 }), limb([[0.375, 0.288, 0.015], [0.435, 0.282, 0.008]], { per: 4 })];
  const bodyShapes = [spine, chest, bellyB, head, arm].concat(fingers);
  const sil = loop([[0.5, 0.65], [0.44, 0.73], [0.36, 0.66], [0.3, 0.55], [0.22, 0.49], [0.0, 0.51], [-0.3, 0.41], [-0.64, 0.47],
    [-0.4, 0.33], [-0.1, 0.27], [0.1, 0.26], [0.22, 0.32], [0.3, 0.45], [0.4, 0.6]], 6);

  const bodyLayers = [
    { shapes: bodyShapes, fill: { top: C.back, bottom: C.backLo },
      deco(c, bb) {
        soft(c, underBand(sil, -0.5, 0.42, (x) => (x > 0.28 ? 0.045 : x > -0.2 ? 0.13 : 0.05)), C.belly, 0.035, 1);
        dorsalSpots(c, sil, -0.55, 0.3, 26, 0.012, 0.03, (x) => (x > -0.2 ? 0.11 : 0.04), C.dark, 0.55);
        // Ringe am Schwanz
        for (let i = 0; i < 5; i++) { const x = -0.22 - i * 0.075; const t = topAt(sil, x); if (t === null) continue; wedge(c, x, t + 0.01, t - 0.07 + i * 0.008, 0.026 - i * 0.003, -0.01, C.dark, 0.55); }
        volume(c, bb, { dark: 'rgba(30,50,30,0.2)', light: 'rgba(255,250,210,0.2)' });
      } },
    { shapes: teeth, fill: C.cream, stroke: 'rgba(80,90,50,0.45)' },
    { shapes: [head], fill: { top: C.back, bottom: '#8fb27a' }, stroke: null,
      deco(c, bb) {
        soft(c, Hs([[-0.07, -0.05], [0.22, -0.03], [0.22, 0.005], [-0.07, 0.0]]), C.belly, 0.02, 0.95);
        const cheek = H([0.0, 0.0]); soft(c, [[cheek[0] - 0.03, cheek[1] - 0.012], [cheek[0], cheek[1] + 0.02], [cheek[0] + 0.03, cheek[1] - 0.012]], C.accent, 0.012, 0.85);
        strokePoly(c, Hs([[0.185, -0.014], [0.12, -0.03], [0.05, -0.04]]), 'rgba(40,60,30,0.85)', 0.005, 1);
        const n = H([0.17, 0.02]); fillPoly(c, [[n[0] - 0.005, n[1] - 0.002], [n[0], n[1] + 0.005], [n[0] + 0.007, n[1] - 0.002]], 'rgba(40,60,30,0.75)');
        const e = H([0.065, 0.03]); bigEye(c, e[0], e[1], 0.026, { color: C.eye });
        strokePoly(c, Hs([[0.1, 0.07], [0.045, 0.073], [-0.01, 0.065]]), C.dark, 0.012, 0.6);
      } },
  ];

  const jawPivot = H([0.0, -0.025]);
  const jawShape = loop(Hs([[-0.01, -0.02], [0.06, -0.038], [0.13, -0.03], [0.185, -0.016], [0.19, -0.04], [0.15, -0.062], [0.08, -0.07], [0.02, -0.065], [-0.02, -0.05]]), 8);
  const lining = loop(Hs([[-0.01, 0.0], [0.08, -0.005], [0.18, -0.01], [0.19, -0.03], [0.08, -0.05], [-0.01, -0.045]]), 6);

  const mkLeg = (foot, far) => {
    const lg = theropodLeg({ hip: HIP, foot, L: [0.17, 0.18, 0.13], metaAng: 1.2, widths: [0.115, 0.135, 0.07, 0.05, 0.034, 0.032], toe: 0.085, toeW: 0.03, kneeSide: 1 });
    const col = far ? C.legFar : C.leg;
    return {
      z: far ? 0 : 2, pivot: HIP.slice(),
      layers: [
        { shapes: lg.shapes, fill: { top: col, bottom: far ? '#a7b886' : '#cfd9a2' },
          deco(c, bb) {
            bar(c, [HIP[0] + 0.02, HIP[1] - 0.07], 0.45, 0.14, 0.03, C.dark, far ? 0.3 : 0.45);
            dorsalSpots(c, lg.thigh, HIP[0] - 0.03, HIP[0] + 0.1, 5, 0.008, 0.016, 0.1, C.dark, far ? 0.3 : 0.45);
            volume(c, bb, { dark: 'rgba(30,50,30,0.22)', light: 'rgba(255,250,210,0.12)' });
          } },
        { shapes: claws(lg.clawPts, 0.028, 0.017, -0.1), fill: '#3a3a22', stroke: null },
      ],
    };
  };

  const parts = {};
  parts.body = { z: 1, layers: bodyLayers };
  parts.jaw = { z: 0, pivot: jawPivot, layers: [
    { shapes: [lining], fill: C.pink, stroke: null },
    { shapes: [jawShape], fill: { top: '#d5dca0', bottom: C.cream } },
  ] };
  parts.legA = mkLeg(0.09, true);
  parts.legB = mkLeg(-0.045, false);
  return {
    id: 'eoraptor',
    parts,
    anchors: { head: H([0.1, 0.03]), mouth: H([0.2, -0.02]), eye: H([0.065, 0.03]), back: [-0.05, 0.5], foot: [0.03, 0], hip: HIP.slice(), tailTip: [-0.64, 0.46] },
    meta: { name: 'Eoraptor', lengthM: 1, massKg: 10, period: 'Obertrias',
      ranges: { jaw: [0, -0.5], legA: [0, 0.5], legB: [0, 0.5] }, // Ruhe 0, Ausschlag ±0.5 rad (Beine gegenphasig, +: Fuß nach vorn)
      swing: { legA: [-0.5, 0.5], legB: [-0.5, 0.5] } },
  };
}

// gezeichnet in bequemen Zahlen, hier auf die echte Größe gebracht (Faktor 0.78)
const K = 0.78;
export default function make(opts = {}) { return scaleSpec(makeRaw(opts), K); }
