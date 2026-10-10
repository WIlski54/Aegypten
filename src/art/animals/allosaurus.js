// Allosaurus – Oberjura, ~9 m. Langer, niedriger Schädel mit großen Augenwülsten (Tränenbein-Hörnern) und Nasenkamm,
// kräftiger Schwanz, drei Finger an den Armen. Terrakotta mit dunklen Streifen und rotorangem Kamm.
// Teile: body (alles inkl. Beine, Schwanz), jaw (Pivot Kiefergelenk).
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { loop, soft, fillPoly, strokePoly, wedge, topOf, underBandOf, theropodLeg, claws, teethRow, bigEye, rotPt } from './_a_kit.js';

const HIP = [0.1, 2.45];
const HEAD0 = [2.95, 3.72], HEAD_ROT = -0.1, HS = 1.0;

export default function make(opts = {}) {
  const C = { back: '#b8602f', backLo: '#a85428', belly: '#f1d9a5', stripe: '#4d2512', crest: '#d8452c', crestLo: '#f08a3c', leg: '#b05a2c', legFar: '#85421f', cream: '#fbf1d2', pink: '#d9776a', eye: '#2a170c' };
  const H = (p) => { const [x, y] = rotPt([HEAD0[0] + p[0] * HS, HEAD0[1] + p[1] * HS], HEAD0[0], HEAD0[1], HEAD_ROT); return [x, y]; };
  const Hs = (pts) => pts.map(H);

  // Rumpf + Hals
  const spineC = [[-0.6, 2.8, 1.15], [0.2, 2.74, 1.55], [1.2, 2.62, 1.6], [2.0, 2.7, 1.4], [2.5, 3.0, 1.0], [2.8, 3.3, 0.82], [3.0, 3.58, 0.8]];
  const spine = limb(spineC, { per: 14 });
  const belly = blob(1.0, 2.5, 1.55, 0.88, -0.05, 60);
  const tailC = [[-4.2, 2.85, 0.04], [-3.5, 2.7, 0.22], [-2.6, 2.66, 0.55], [-1.7, 2.74, 0.9], [-0.7, 2.82, 1.25], [0.2, 2.78, 1.4]];
  const tail = limb(tailC, { per: 14 });

  // Kopf: lang und niedrig, Tränenbein-Horn über/vor dem Auge, Nasenkamm
  const headL = [
    [1.98, 0.03], [1.94, 0.18], [1.76, 0.31], [1.5, 0.38], [1.25, 0.44], [1.04, 0.5], [0.88, 0.56], [0.74, 0.52], [0.58, 0.55], [0.44, 0.64], [0.24, 0.6], [0.02, 0.48],
    [-0.14, 0.26], [-0.15, 0.0], [-0.06, -0.24], [0.22, -0.2], [0.5, -0.15], [0.9, -0.12], [1.3, -0.12], [1.65, -0.1], [1.95, -0.06],
  ];
  const head = loop(Hs(headL), 6);
  const hornL = poly([[0.66, 0.42], [0.74, 0.66], [0.84, 0.98], [0.98, 0.72], [1.12, 0.46]], 2);   // großes Tränenbein-Horn
  const horn = hornL.map(H);
  const postL = loop(Hs([[0.34, 0.58], [0.4, 0.74], [0.5, 0.76], [0.58, 0.62]]), 6);              // Wulst über dem Auge hinten
  const ridge = loop(Hs([[1.2, 0.42], [1.35, 0.52], [1.6, 0.5], [1.78, 0.38], [1.55, 0.36]]), 6); // niedriger Nasenkamm
  const teeth = teethRow(H([1.0, -0.12]), H([1.88, -0.08]), 5, 0.2, 0.14, 1, 0.12).map((t) => poly(t));

  // Arm mit drei Fingern
  const arm = limb([[1.95, 2.6, 0.34], [2.3, 2.18, 0.27], [2.75, 2.02, 0.2], [3.05, 2.1, 0.15]], { per: 10 });
  const fingers = [limb([[2.98, 2.1, 0.13], [3.35, 2.24, 0.08]], { per: 4 }), limb([[3.0, 2.05, 0.13], [3.4, 2.05, 0.08]], { per: 4 }), limb([[2.98, 2.0, 0.12], [3.32, 1.88, 0.07]], { per: 4 })];
  const fClaws = claws([[3.4, 2.26], [3.45, 2.05], [3.37, 1.86]], 0.13, 0.08, -0.25);

  const all = [spine, belly, tail, head, arm, horn, ridge];
  const bellyBand = underBandOf([spine, belly, tail], -4.1, 2.5, (x) => (x > 1.6 ? 0.4 : x > -1.6 ? 0.68 : 0.3 + (x + 4.4) * 0.12), 120);
  const throat = [H([-0.1, -0.2]), H([0.6, -0.2]), H([0.6, -0.02]), H([-0.1, 0.1])];

  const mkLeg = (foot, far) => {
    const lg = theropodLeg({ hip: HIP, foot, L: [1.15, 1.1, 0.8], metaAng: 1.15, widths: [0.95, 1.12, 0.6, 0.45, 0.3, 0.29], toe: 0.62, toeW: 0.25, kneeSide: 1 });
    const col = far ? C.legFar : C.leg;
    return [
      { shapes: lg.shapes, fill: { top: col, bottom: far ? '#b88457' : '#e3b27c' },
        deco(c, bb) {
          wedge(c, HIP[0] - 0.3, HIP[1] + 0.4, HIP[1] - 0.5, 0.2, 0.25, C.stripe, far ? 0.3 : 0.42);
          wedge(c, HIP[0] + 0.1, HIP[1] + 0.5, HIP[1] - 0.7, 0.18, 0.25, C.stripe, far ? 0.3 : 0.42);
          volume(c, bb, { dark: 'rgba(50,20,8,0.25)', light: 'rgba(255,230,190,0.12)' });
        } },
      { shapes: claws(lg.clawPts, 0.18, 0.11, -0.12), fill: '#3a2414', stroke: null },
    ];
  };

  const bodyLayers = []
    .concat(mkLeg(0.8, true))
    .concat([
      { shapes: all.concat(fingers, [postL]), fill: { top: C.back, bottom: C.backLo },
        deco(c, bb) {
          soft(c, bellyBand, C.belly, 0.17, 1);
          for (let i = 0; i < 17; i++) {
            const x = 1.7 - i * 0.37;
            const t = topOf([spine, tail, belly], x); if (t === null) continue;
            const len = x > -1 ? 0.8 : 0.42 + 0.3 * Math.max(0, (x + 4.2) / 3.2);
            wedge(c, x, t + 0.05, t - len, 0.3 - Math.max(0, -x) * 0.03, -0.15, C.stripe, 0.58);
          }
          volume(c, bb, { dark: 'rgba(50,20,8,0.22)', light: 'rgba(255,230,190,0.2)' });
          soft(c, head, '#c97542', 0.12, 0.5);
          soft(c, throat, C.belly, 0.09, 0.9);
          soft(c, Hs([[0.0, -0.2], [2.0, -0.12], [2.0, 0.0], [0.3, 0.06]]), '#f3d8a2', 0.08, 0.9);
          strokePoly(c, Hs([[0.3, 0.55], [0.22, 0.4], [0.12, 0.25]]), C.stripe, 0.075, 0.45);
          strokePoly(c, Hs([[0.08, 0.45], [0.02, 0.32], [-0.04, 0.18]]), C.stripe, 0.07, 0.45);
          const n = H([1.8, 0.2]); c.ctx.save(); c.ctx.fillStyle = 'rgba(50,25,10,0.8)'; const [X, Y] = c.tf(n[0], n[1]);
          c.ctx.beginPath(); c.ctx.ellipse(X, Y, 0.05 * c.S, 0.03 * c.S, -0.5, 0, 6.28); c.ctx.fill(); c.ctx.restore();
          strokePoly(c, Hs([[1.92, -0.06], [1.5, -0.1], [1.0, -0.1], [0.6, -0.1], [0.4, -0.08], [0.28, -0.03]]), 'rgba(55,25,10,0.85)', 0.03, 1);
          // Kamm, Horn und Augenwulst in Rotorange (weich), mit hellem Glanzstrich
          soft(c, horn, C.crest, 0.045, 0.95); soft(c, ridge, C.crest, 0.04, 0.9); soft(c, postL, '#cf5a30', 0.04, 0.85);
          soft(c, Hs([[0.78, 0.7], [0.86, 0.95], [0.95, 0.74]]), C.crestLo, 0.03, 0.9);
          strokePoly(c, Hs([[0.78, 0.55], [0.85, 0.85]]), 'rgba(255,235,200,0.55)', 0.035, 1);
          strokePoly(c, Hs([[1.3, 0.47], [1.6, 0.46]]), 'rgba(255,235,200,0.5)', 0.025, 1);
          const e = H([0.64, 0.28]); bigEye(c, e[0], e[1], 0.125, { color: C.eye });
        } },
      { shapes: fClaws, fill: '#3a2414', stroke: null },
      { shapes: teeth, fill: C.cream, stroke: 'rgba(110,80,50,0.45)' },
    ])
    .concat(mkLeg(0.15, false));

  const jawPivot = H([0.2, -0.1]);
  const jawShape = loop(Hs([[1.9, -0.04], [1.97, -0.2], [1.78, -0.4], [1.4, -0.52], [1.0, -0.62], [0.6, -0.68], [0.28, -0.64], [0.04, -0.48], [0.0, -0.15], [0.3, 0.0], [1.0, 0.0], [1.6, 0.0]]), 6);
  const lining = loop(Hs([[0.0, 0.05], [0.6, 0.05], [1.5, 0.0], [1.85, -0.04], [1.7, -0.32], [1.0, -0.45], [0.3, -0.45], [0.0, -0.3]]), 5);
  const jawTeeth = teethRow(H([1.15, -0.1]), H([1.8, -0.08]), 4, 0.15, 0.11, -1, -0.1).map((t) => poly(t));

  const parts = {};
  parts.body = { z: 1, layers: bodyLayers };
  parts.jaw = { z: 0, pivot: jawPivot, layers: [
    { shapes: [lining], fill: C.pink, stroke: null },
    { shapes: [jawShape], fill: { top: '#e2b17a', bottom: C.cream } },
    { shapes: jawTeeth, fill: C.cream, stroke: 'rgba(110,80,50,0.45)' },
  ] };
  return {
    id: 'allosaurus',
    parts,
    anchors: { head: H([0.9, 0.2]), mouth: H([1.97, -0.1]), eye: H([0.64, 0.28]), back: [0.4, 3.5], foot: [0.45, 0.0], hip: HIP.slice(), tailTip: [-4.55, 2.85] },
    meta: { name: 'Allosaurus', lengthM: 9, massKg: 2000, period: 'Oberjura', ranges: { jaw: [0, -0.5] } },
  };
}
