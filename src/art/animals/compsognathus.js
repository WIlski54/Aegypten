// Compsognathus – hühnergroßer Läufer des Oberjura, ~0,9 m, flaumig (Dino-Küken-Charme).
// Teile: body, jaw (Pivot Kiefergelenk), legA (fern), legB (nah) (Pivot Hüfte).
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { featherAt as featherAtK, loop, overBand as overBandP, soft, fillPoly, strokePoly, bar, underBand, topAt, theropodLeg, claws, teethRow, bigEye, rotPt, dorsalSpots, fluff, scaleSpec } from './_a_kit.js';

const HIP = [0.015, 0.285];
const HEAD0 = [0.335, 0.585], HEAD_ROT = -0.14, HS = 1.1;

function makeRaw(opts = {}) {
  const C = { back: '#9d7d58', backLo: '#8c6e4a', fluff: '#d98c4c', fluffLo: '#c68248', belly: '#f3e4be', dark: '#58391f', leg: '#b58a58', legFar: '#8a6238', cream: '#fbf0d0', pink: '#e0806c', eye: '#22160c' };
  const H = (p) => { const [x, y] = rotPt([HEAD0[0] + p[0] * HS, HEAD0[1] + p[1] * HS], HEAD0[0], HEAD0[1], HEAD_ROT); return [x, y]; };
  const Hs = (pts) => pts.map(H);

  const spineC = [
    [-0.58, 0.385, 0.006], [-0.46, 0.325, 0.024], [-0.3, 0.30, 0.065], [-0.13, 0.325, 0.115], [0.02, 0.35, 0.165], [0.13, 0.36, 0.165],
    [0.215, 0.39, 0.12], [0.265, 0.45, 0.09], [0.295, 0.52, 0.075], [0.33, 0.575, 0.07],
  ];
  const spine = limb(spineC, { per: 14 });
  const chest = blob(0.115, 0.325, 0.135, 0.115, 0.05, 40);
  const bellyB = blob(-0.02, 0.315, 0.15, 0.11, -0.05, 40);
  const headL = [
    [0.15, -0.002], [0.128, 0.02], [0.092, 0.038], [0.05, 0.052], [0.005, 0.058], [-0.035, 0.044], [-0.048, 0.01], [-0.035, -0.03],
    [0.0, -0.042], [0.05, -0.036], [0.1, -0.024], [0.135, -0.012],
  ];
  const head = loop(Hs(headL), 8);
  const teeth = teethRow(H([0.09, -0.024]), H([0.14, -0.012]), 3, 0.02, 0.014, 1, 0.1).map((t) => poly(t));
  const arm = limb([[0.2, 0.345, 0.045], [0.235, 0.285, 0.034], [0.285, 0.255, 0.024], [0.33, 0.262, 0.014]], { per: 10 });
  const fingers = [limb([[0.31, 0.26, 0.013], [0.36, 0.272, 0.008]], { per: 4 }), limb([[0.31, 0.255, 0.012], [0.36, 0.25, 0.007]], { per: 4 })];

  // Flaum: kleine runde Büschel am Rand (Rücken/Schwanz/Hals/Bauch), Schopf am Kopf, Pinsel an der Schwanzspitze
  const lt = (t) => 0.85 + 0.3 * Math.sin(Math.min(1, t * 1.3) * 3.0);
  const fl = fluff(spineC, { side: 1, t0: 0.03, t1: 0.93, n: 56, len: 0.03, w: 0.028, tilt: 1.2, seed: 5, lenTaper: lt, shape: 'blob', inset: 0.9, jitter: 0.15 })
    .concat(fluff(spineC, { side: -1, t0: 0.1, t1: 0.72, n: 24, len: 0.026, w: 0.026, tilt: 1.2, seed: 9, shape: 'blob', inset: 0.9, jitter: 0.15 }))
    .concat(fluff([[-0.56, 0.38, 0.012], [-0.62, 0.395, 0.012], [-0.69, 0.42, 0.012]], { side: 1, n: 5, len: 0.075, w: 0.034, tilt: 4, seed: 2, shape: 'leaf', jitter: 2.2, inset: 0 }));
  const crest = [0, 1, 2].map((i) => { const q = H([-0.02 - i * 0.012, 0.052 - i * 0.004]); return featherAtK(q[0], q[1], (112 + i * 26) * Math.PI / 180, 0.05 - i * 0.008, 0.024); });
  const thighFuzz = (hip, knee) => fluff([[hip[0] + 0.02, hip[1] + 0.02, 0.1], [(hip[0] + knee[0]) / 2, (hip[1] + knee[1]) / 2, 0.1], [knee[0], knee[1], 0.07]], { side: -1, n: 8, len: 0.028, w: 0.026, tilt: 1.0, seed: 17, shape: 'blob', inset: 0.9, back: 1 });
  const sil = loop([[0.4, 0.57], [0.34, 0.64], [0.3, 0.56], [0.25, 0.45], [0.18, 0.42], [0.0, 0.44], [-0.3, 0.34], [-0.6, 0.39],
    [-0.4, 0.28], [-0.1, 0.24], [0.1, 0.225], [0.2, 0.28], [0.27, 0.4], [0.33, 0.54]], 6);

  const bodyLayers = [
    { shapes: [spine, chest, bellyB, head, arm].concat(fingers, fl, crest), fill: { top: C.back, bottom: C.backLo },
      deco(c, bb) {
        soft(c, underBand(sil, -0.45, 0.36, (x) => (x > 0.22 ? 0.04 : x > -0.15 ? 0.115 : 0.04)), C.belly, 0.03, 1);
        dorsalSpots(c, sil, -0.5, 0.25, 30, 0.008, 0.02, (x) => (x > -0.15 ? 0.09 : 0.035), C.dark, 0.5);
        for (let i = 0; i < 6; i++) { const x = -0.18 - i * 0.07; const t = topAt(sil, x); if (t === null) continue; fillPoly(c, [[x - 0.012, t + 0.01], [x + 0.012, t + 0.01], [x, t - 0.06 + i * 0.006]], C.dark, 0.5); }
        // Rücken-Mähne in Rostorange (weich), Flaumstriche hell + dunkel
        soft(c, overBandP(sil, -0.6, 0.3, 0.06), C.fluff, 0.035, 0.9);
        soft(c, overBandP(sil, -0.6, 0.3, 0.025), '#e8b27a', 0.02, 0.8);
        soft(c, crest, C.fluff, 0.012, 0.9);
        volume(c, bb, { dark: 'rgba(60,30,10,0.2)', light: 'rgba(255,245,210,0.2)' });
      } },
    { shapes: teeth, fill: C.cream, stroke: 'rgba(110,80,50,0.4)' },
    { shapes: [head], fill: { top: '#b88a58', bottom: '#d8b27a' }, stroke: null,
      deco(c, bb) {
        soft(c, Hs([[-0.06, -0.05], [0.16, -0.025], [0.16, 0.005], [-0.06, 0.0]]), C.belly, 0.018, 0.95);
        strokePoly(c, Hs([[0.13, -0.01], [0.09, -0.02], [0.04, -0.03]]), 'rgba(70,35,15,0.85)', 0.004, 1);
        const n = H([0.118, 0.018]); fillPoly(c, [[n[0] - 0.004, n[1] - 0.002], [n[0], n[1] + 0.004], [n[0] + 0.006, n[1] - 0.002]], 'rgba(70,35,15,0.75)');
        const e = H([0.045, 0.02]); bigEye(c, e[0], e[1], 0.023, { color: C.eye });
      } },
  ];

  const jawPivot = H([0.0, -0.022]);
  const jawShape = loop(Hs([[-0.01, -0.018], [0.05, -0.034], [0.1, -0.026], [0.14, -0.012], [0.142, -0.034], [0.105, -0.056], [0.05, -0.062], [0.0, -0.056], [-0.02, -0.04]]), 8);
  const lining = loop(Hs([[-0.01, 0.0], [0.06, -0.004], [0.14, -0.01], [0.14, -0.03], [0.06, -0.045], [-0.01, -0.04]]), 6);

  const mkLeg = (foot, far) => {
    const lg = theropodLeg({ hip: HIP, foot, L: [0.13, 0.155, 0.12], metaAng: 1.15, widths: [0.1, 0.115, 0.06, 0.04, 0.028, 0.026], toe: 0.07, toeW: 0.024, kneeSide: 1 });
    const col = far ? C.legFar : C.leg;
    return {
      z: far ? 0 : 2, pivot: HIP.slice(),
      layers: [
        { shapes: lg.shapes.concat(far ? [] : thighFuzz(HIP, lg.knee)), fill: { top: col, bottom: far ? '#b79568' : '#e8c890' },
          deco(c, bb) {
            dorsalSpots(c, lg.thigh, HIP[0] - 0.04, HIP[0] + 0.08, 5, 0.006, 0.013, 0.09, C.dark, far ? 0.3 : 0.45);
            volume(c, bb, { dark: 'rgba(60,30,10,0.22)', light: 'rgba(255,245,210,0.12)' });
          } },
        { shapes: claws(lg.clawPts, 0.024, 0.014, -0.1), fill: '#40291a', stroke: null },
      ],
    };
  };

  const parts = {};
  parts.body = { z: 1, layers: bodyLayers };
  parts.jaw = { z: 0, pivot: jawPivot, layers: [
    { shapes: [lining], fill: C.pink, stroke: null },
    { shapes: [jawShape], fill: { top: '#dcbd86', bottom: C.cream } },
  ] };
  parts.legA = mkLeg(0.075, true);
  parts.legB = mkLeg(-0.04, false);
  return {
    id: 'compsognathus',
    parts,
    anchors: { head: H([0.08, 0.03]), mouth: H([0.15, -0.02]), eye: H([0.045, 0.02]), back: [-0.05, 0.43], foot: [0.03, 0], hip: HIP.slice(), tailTip: [-0.62, 0.4] },
    meta: { name: 'Compsognathus', lengthM: 0.9, massKg: 3, period: 'Oberjura',
      ranges: { jaw: [0, -0.5], legA: [0, 0.5], legB: [0, 0.5] }, // Ruhe 0, Ausschlag ±0.5 rad (Beine gegenphasig, +: Fuß nach vorn)
      swing: { legA: [-0.5, 0.5], legB: [-0.5, 0.5] } },
  };
}

// gezeichnet in bequemen Zahlen, hier auf die echte Größe gebracht (Faktor 0.8)
const K = 0.8;
export default function make(opts = {}) { return scaleSpec(makeRaw(opts), K); }
