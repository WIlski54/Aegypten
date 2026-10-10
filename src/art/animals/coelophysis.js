// Coelophysis – zierlicher Räuber der Spättrias, 3 m, ~20 kg. Gestreifter, freundlicher Look.
// Teile: body (Kopf/Hals/Rumpf/Schwanz/Arm), jaw (Pivot am Kiefergelenk), legA (fern), legB (nah) (Pivot an der Hüfte).
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { loop, soft, fillPoly, strokePoly, wedge, bar, underBand, topAt, theropodLeg, claws, teethRow, bigEye, rotPt, scaleSpec } from './_a_kit.js';

const HIP = [0.02, 0.80];
const HEAD0 = [0.87, 1.49], HEAD_ROT = -0.1; // Kopfursprung (Nacken) und leichte Neigung nach unten

function makeRaw(opts = {}) {
  const C = { back: '#b6743a', backLo: '#a86a32', belly: '#f3e2b4', stripe: '#5a3317', leg: '#b0703a', legFar: '#8b5629', cream: '#f6e9c6', pink: '#d77a6a', eye: '#2a170c' };
  // lokale Kopfkoordinaten -> Modell
  const HS = 1.18; // Kopf etwas größer als real (freundlicher)
  const H = (p) => { const [x, y] = rotPt([HEAD0[0] + p[0] * HS, HEAD0[1] + p[1] * HS], HEAD0[0], HEAD0[1], HEAD_ROT); return [x, y]; };
  const Hs = (pts) => pts.map(H);

  // ---- Rumpf + Hals + Schwanz als EIN Strang ----------------------------------------------------
  const spine = limb([
    [-1.90, 1.00, 0.012], [-1.62, 0.92, 0.045], [-1.25, 0.85, 0.095], [-0.85, 0.865, 0.155], [-0.45, 0.905, 0.24], [-0.10, 0.935, 0.32],
    [0.28, 0.94, 0.33], [0.50, 0.99, 0.25], [0.62, 1.07, 0.18], [0.69, 1.21, 0.15], [0.72, 1.36, 0.135], [0.80, 1.47, 0.13],
  ], { per: 14 });
  const chest = blob(0.22, 0.87, 0.31, 0.225, 0.05, 48);
  const bellyB = blob(-0.12, 0.85, 0.38, 0.215, -0.05, 48);
  // ---- Kopf (lokal: x vorwärts, Länge ~0.42) ----------------------------------------------------
  const headL = [
    [0.43, 0.0], [0.37, 0.04], [0.27, 0.075], [0.17, 0.105], [0.07, 0.125], [-0.03, 0.115], [-0.08, 0.06], [-0.075, -0.01], [-0.04, -0.06],
    [0.04, -0.075], [0.15, -0.062], [0.27, -0.042], [0.37, -0.026],
  ];
  const head = loop(Hs(headL), 8);
  const teeth = teethRow(H([0.27, -0.042]), H([0.41, -0.022]), 4, 0.034, 0.024, 1, 0.1).map((t) => poly(t));
  // ---- Arm (klein, drei Finger) ---------------------------------------------------------------
  const arm = limb([[0.42, 0.88, 0.085], [0.50, 0.77, 0.065], [0.62, 0.725, 0.045], [0.72, 0.745, 0.025]], { per: 10 });
  const fingers = [limb([[0.68, 0.737, 0.024], [0.77, 0.755, 0.014]], { per: 4 }), limb([[0.68, 0.73, 0.022], [0.775, 0.725, 0.013]], { per: 4 })];
  const bodyShapes = [spine, chest, bellyB, head, arm].concat(fingers);
  // grobe Silhouette für Kantenabfragen (Streifen/Bauch)
  const sil = loop([[1.28, 1.5], [0.95, 1.6], [0.84, 1.5], [0.74, 1.3], [0.55, 1.1], [0.35, 1.07], [-0.2, 1.1], [-0.8, 0.96], [-1.5, 0.9], [-1.9, 1.0],
    [-1.5, 0.82], [-0.8, 0.77], [-0.2, 0.66], [0.3, 0.66], [0.55, 0.85], [0.7, 1.1], [0.8, 1.3], [0.88, 1.43], [1.1, 1.46]], 6);

  const bodyLayers = [
    { shapes: bodyShapes, fill: { top: C.back, bottom: C.backLo },
      deco(c, bb) {
        // Bauch hell, weich auslaufend
        const bel = underBand(sil, -1.2, 0.8, (x) => (x > 0.45 ? 0.08 : x > -0.5 ? 0.19 : 0.07 + (x + 1.2) * 0.05));
        soft(c, bel, C.belly, 0.055, 1);
        soft(c, underBand(sil, 0.52, 0.88, 0.06), C.belly, 0.03, 0.95); // Kehle
        // mutige Streifen: Rumpf + Schwanz
        for (let i = 0; i < 12; i++) {
          const x = 0.32 - i * 0.16;
          const t = topAt(sil, x); if (t === null) continue;
          const len = x > -0.6 ? 0.22 : 0.12 + 0.07 * Math.max(0, (x + 1.8) / 1.2);
          wedge(c, x, t + 0.02, t - len, 0.08 - Math.max(0, -x) * 0.016, -0.05, C.stripe, 0.62);
        }
        // Halsringe
        [[0.60, 1.07], [0.665, 1.17], [0.70, 1.28], [0.735, 1.38]].forEach(([x, y]) => bar(c, [x, y], 0.12, 0.2, 0.04, C.stripe, 0.55));
        volume(c, bb, { dark: 'rgba(60,30,10,0.18)', light: 'rgba(255,240,200,0.18)' });
      } },
    { shapes: teeth, fill: C.cream, stroke: 'rgba(110,80,50,0.4)' },
    { // Kopf-Details
      shapes: [head], fill: { top: C.back, bottom: '#c78a4c' }, stroke: null,
      deco(c, bb) {
        soft(c, Hs([[-0.1, -0.075], [0.45, -0.045], [0.45, 0.012], [-0.1, 0.0]]), C.belly, 0.03, 0.95);
        strokePoly(c, Hs([[0.07, 0.062], [-0.02, 0.025], [-0.07, -0.01]]), C.stripe, 0.028, 0.7); // Augenstreifen
        strokePoly(c, Hs([[0.40, -0.012], [0.28, -0.032], [0.16, -0.05], [0.07, -0.058]]), 'rgba(70,35,15,0.8)', 0.008, 1); // Mundlinie
        const n = H([0.355, 0.032]); fillPoly(c, [[n[0] - 0.01, n[1] - 0.004], [n[0], n[1] + 0.008], [n[0] + 0.012, n[1] - 0.004]], 'rgba(70,35,15,0.75)');
        const e = H([0.12, 0.052]); bigEye(c, e[0], e[1], 0.042, { color: C.eye });
      } },
  ];

  // ---- Kiefer --------------------------------------------------------------------------------
  const jawPivot = H([0.04, -0.05]);
  const jawShape = loop(Hs([[0.02, -0.035], [0.16, -0.058], [0.28, -0.04], [0.405, -0.024], [0.415, -0.058], [0.34, -0.092], [0.22, -0.1], [0.1, -0.1], [0.0, -0.085]]), 8);
  const lining = loop(Hs([[0.0, 0.0], [0.16, -0.005], [0.38, -0.01], [0.40, -0.035], [0.2, -0.07], [0.0, -0.075]]), 6);
  const jawTeeth = teethRow(H([0.25, -0.04]), H([0.38, -0.024]), 3, 0.024, 0.02, -1, -0.1).map((t) => poly(t));

  // ---- Beine ---------------------------------------------------------------------------------
  const mkLeg = (foot, far) => {
    const lg = theropodLeg({ hip: HIP, foot, L: [0.38, 0.41, 0.28], metaAng: 1.2, widths: [0.23, 0.27, 0.13, 0.095, 0.065, 0.06], toe: 0.16, toeW: 0.05, kneeSide: 1 });
    const col = far ? C.legFar : C.leg;
    return {
      z: far ? 0 : 2, pivot: HIP.slice(),
      layers: [
        { shapes: lg.shapes, fill: { top: col, bottom: far ? '#a67846' : '#e0b878' },
          deco(c, bb) {
            bar(c, [HIP[0] + 0.02, HIP[1] - 0.14], 0.45, 0.3, 0.05, C.stripe, far ? 0.35 : 0.5);
            bar(c, [lg.knee[0] - 0.06, lg.knee[1] + 0.07], 0.5, 0.2, 0.04, C.stripe, far ? 0.35 : 0.5);
            volume(c, bb, { dark: 'rgba(60,30,10,0.22)', light: 'rgba(255,240,200,0.12)' });
          } },
        { shapes: claws(lg.clawPts, 0.05, 0.03, -0.1), fill: '#4a2f1a', stroke: null },
      ],
    };
  };

  const parts = {};
  parts.body = { z: 1, layers: bodyLayers };
  parts.jaw = { z: 0, pivot: jawPivot, layers: [
    { shapes: [lining], fill: C.pink, stroke: null },
    { shapes: [jawShape], fill: { top: '#e8c88c', bottom: C.belly } },
    { shapes: jawTeeth, fill: C.cream, stroke: 'rgba(110,80,50,0.4)' },
  ] };
  parts.legA = mkLeg(0.24, true);
  parts.legB = mkLeg(-0.10, false);

  return {
    id: 'coelophysis',
    parts,
    anchors: { head: H([0.18, 0.04]), mouth: H([0.43, -0.03]), eye: H([0.12, 0.052]), back: [-0.1, 1.1], foot: [0.08, 0.0], hip: HIP.slice(), tailTip: [-1.9, 1.0] },
    meta: { name: 'Coelophysis', lengthM: 3, massKg: 20, period: 'Spättrias',
      ranges: { jaw: [0, -0.55], legA: [0, 0.5], legB: [0, 0.5] }, // Ruhe 0, Ausschlag ±0.5 rad (Beine gegenphasig, +: Fuß nach vorn)
      swing: { legA: [-0.5, 0.5], legB: [-0.5, 0.5] } },
  };
}

// gezeichnet in bequemen Zahlen, hier auf die echte Größe gebracht (Faktor 0.915)
const K = 0.915;
export default function make(opts = {}) { return scaleSpec(makeRaw(opts), K); }
