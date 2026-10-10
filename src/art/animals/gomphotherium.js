// Gomphotherium (Miozän), shoulder height ~3 m: elephant relative with FOUR tusks (two long upper tusks curving down
// and up again, two shorter flattened lower tusks on a long chin) and a trunk.
// Parts: body (z1), trunk (z0, behind the face; pivot at the nose/trunk base; + = trunk up (trumpet), - = down/back).
import { blob, limb, poly, xf } from '../dsl.js';
import { eye, volume } from '../paint.js';
import { tufts, furEdge, clumps, glow, curve, furStrokes, rings } from './_f_common.js';

export default function make(opts = {}) {
  const C = { top: '#7d695d', bottom: '#bda994', far: '#5e4d44', farB: '#8f7d6d', ear: '#d7a091', tusk: '#f7efd6', tuskB: '#e3d3a8', nail: '#efe3c4' };
  const TP = [2.08, 2.34]; // trunk pivot (nose root, inside the head)

  // ---------------------------------------------------------------- BODY
  const torso = poly([
    [-2.25, 2.2], [-2.1, 2.62], [-1.2, 2.92], [0.0, 3.0], [0.95, 2.97], [1.45, 2.7], [1.5, 2.0], [1.3, 1.55], [0.3, 1.3], [-1.0, 1.34], [-2.0, 1.7],
  ], 3);
  const head = poly([
    [0.85, 2.95], [1.3, 3.1], [1.78, 2.92], [2.08, 2.62], [2.24, 2.34], [2.3, 2.1], [2.4, 1.9], [3.02, 1.74], [3.14, 1.56], [2.95, 1.42], [2.4, 1.3], [1.8, 1.3], [1.35, 1.5], [1.0, 2.0],
  ], 2);
  const legC = (x, yTop, wTop, kx, fx, w1, w2) => limb([[x, yTop, wTop], [x + (kx - x) * 0.4, yTop - 0.8, w1], [kx, 0.9, w2], [fx, 0.30, w2 * 0.96]]);
  const foot = (x, s = 1) => [blob(x + 0.04, 0.15, 0.34 * s, 0.15 * s), ...[0.18, 0.05, -0.08].map((d) => blob(x + 0.3 * s + d * 0.0, 0.11, 0.05, 0.05))];
  const nails = (x) => [blob(x + 0.34, 0.12, 0.07, 0.065), blob(x + 0.22, 0.09, 0.07, 0.065), blob(x + 0.08, 0.075, 0.065, 0.06)];
  const legFN = legC(0.8, 2.3, 0.82, 0.86, 0.86, 0.64, 0.56), legFF = legC(1.28, 2.2, 0.74, 1.3, 1.3, 0.6, 0.52);
  const legHN = limb([[-1.45, 2.3, 1.1], [-1.35, 1.5, 0.76], [-1.5, 0.75, 0.58], [-1.44, 0.30, 0.55]]);
  const legHF = limb([[-0.95, 2.2, 1.0], [-0.85, 1.5, 0.72], [-1.0, 0.75, 0.56], [-0.94, 0.30, 0.52]]);
  const tail = limb([[-2.2, 2.35, 0.2], [-2.38, 1.95, 0.14], [-2.4, 1.5, 0.1]]);
  const tailTuft = tufts([[-2.5, 1.62], [-2.4, 1.3], [-2.3, 1.55]], { step: 0.06, len: 0.22, w: 0.1, dir: [0, -1], jitter: 0.4, seed: 4 });
  const earP = poly([[1.05, 2.9], [0.82, 2.72], [0.78, 2.3], [0.98, 1.98], [1.28, 2.0], [1.4, 2.4], [1.32, 2.8]], 2);
  const earIn = poly([[1.06, 2.78], [0.92, 2.65], [0.9, 2.35], [1.02, 2.15], [1.2, 2.2], [1.26, 2.45], [1.2, 2.7]], 2);
  const earFar = xf(earP, { x: 0.14, y: 0.05 });
  // tusks
  const upperN = limb([[2.3, 2.16, 0.26], [2.75, 1.98, 0.22], [3.3, 1.84, 0.19], [3.85, 1.9, 0.14], [4.22, 2.14, 0.06]]);
  const upperF = limb([[2.4, 2.22, 0.22], [2.86, 2.06, 0.19], [3.4, 1.95, 0.16], [3.92, 2.03, 0.12], [4.28, 2.25, 0.05]]);
  const lowerN = limb([[2.9, 1.58, 0.24], [3.35, 1.45, 0.22], [3.78, 1.38, 0.16], [4.02, 1.4, 0.08]]);
  const lowerF = limb([[2.9, 1.64, 0.2], [3.38, 1.52, 0.18], [3.76, 1.46, 0.13], [3.98, 1.5, 0.06]]);
  const furBack = clumps([[-2.0, 2.5, 0.1], [-1.2, 2.88, 0.1], [0.0, 2.95, 0.1], [0.9, 2.93, 0.1]], +1, { step: 0.2, rx: 0.16, ry: 0.07, push: -0.03, sweep: 0.8, seed: 3, jitter: 0.3 });
  const forelock = tufts([[1.1, 3.04], [1.3, 3.1], [1.6, 3.0], [1.78, 2.9]], { step: 0.07, len: 0.14, w: 0.12, dir: [0, 1], bias: [-0.35, 0], jitter: 0.5, seed: 12, curl: 0.5 });

  const wr = (c, list, col, w, a) => { for (const f of list) curve(c, f, col, w, { alpha: a }); };
  const body = {
    z: 1,
    layers: [
      { shapes: [earFar], fill: C.far },
      { shapes: [upperF, lowerF], fill: { top: C.tuskB, bottom: '#c7b588' } },
      { shapes: [legFF, ...foot(1.3), legHF, ...foot(-0.94)], fill: { top: C.far, bottom: C.farB }, deco: (c, bb) => volume(c, bb, { dark: 'rgba(30,15,8,.35)' }) },
      { shapes: [tail, ...tailTuft], fill: { top: '#6a574c', bottom: '#4a3a32' } },
      {
        shapes: [torso, head, ...furBack, ...forelock], fill: { top: C.top, bottom: C.bottom },
        deco: (c, bb) => {
          volume(c, bb, { dark: 'rgba(55,35,25,0.3)' });
          glow(c, 0.0, 1.55, 1.5, 0.3, '#e9d8c0', 0.5);
          wr(c, [[[0.7, 2.7], [0.55, 2.1], [0.7, 1.6]], [[0.4, 2.8], [0.25, 2.2], [0.35, 1.7]], [[-0.1, 2.8], [-0.2, 2.2], [-0.12, 1.75]]], '#4d3a30', 0.03, 0.32);
          wr(c, [[[-1.3, 2.6], [-1.6, 2.2], [-1.45, 1.8]], [[-0.9, 2.7], [-1.2, 2.3], [-1.05, 1.9]]], '#4d3a30', 0.03, 0.3);
          furStrokes(c, bb, '#35261f', 36, { len: 0.2, w: 0.022, ang: -Math.PI / 2 - 0.2, alpha: 0.22, seed: 6 });
          // friendly face: cheek glow, eye, brow wrinkle, little smile
          glow(c, 1.75, 2.05, 0.28, 0.2, '#e8a090', 0.35);
          curve(c, [[1.42, 2.76], [1.58, 2.8], [1.75, 2.73]], '#3e2a22', 0.03, { alpha: 0.7 });
          curve(c, [[2.2, 1.78], [1.95, 1.62], [1.7, 1.66], [1.58, 1.76]], '#3a271f', 0.03, { alpha: 0.8 });
          eye(c, 1.6, 2.58, 0.115, { color: '#2b1a12', white: '#fff6e4', look: 0.25 });
        },
      },
      { shapes: [legFN, ...foot(0.86), legHN, ...foot(-1.44)], fill: { top: C.top, bottom: '#b4a08c' }, deco: (c, bb) => { volume(c, bb, { dark: 'rgba(40,22,15,.4)' });
        wr(c, [[[0.55, 1.15], [0.88, 1.05], [1.15, 1.15]], [[0.55, 0.65], [0.86, 0.58], [1.1, 0.66]], [[-1.8, 1.15], [-1.45, 1.05], [-1.15, 1.15]]], '#4d3a30', 0.025, 0.28); } },
      { shapes: [...nails(0.86), ...nails(-1.44)], fill: C.nail, stroke: 'rgba(60,40,25,.45)' },
      { shapes: [lowerN], fill: { top: C.tusk, bottom: C.tuskB }, deco: (c, bb) => { curve(c, [[3.1, 1.52], [3.6, 1.42]], '#b8a574', 0.025, { alpha: 0.5 }); } },
      { shapes: [earP], fill: { top: C.top, bottom: '#a58f7e' }, deco: (c, bb) => volume(c, bb) },
      { shapes: [earIn], fill: C.ear, stroke: null, deco: (c, bb) => volume(c, bb, { dark: 'rgba(120,50,40,.25)' }) },
    ],
  };

  // ---------------------------------------------------------------- TRUNK
  const trunkC = [[1.98, 2.42, 0.62], [2.38, 2.2, 0.56], [2.7, 1.68, 0.46], [2.86, 1.05, 0.36], [2.78, 0.55, 0.27], [2.52, 0.24, 0.2], [2.3, 0.27, 0.12]];
  const trunkTip = [blob(2.26, 0.27, 0.1, 0.075, -0.5)];
  const trunk = {
    z: 2, pivot: TP,
    layers: [{
      shapes: [limb(trunkC), ...trunkTip], fill: { top: '#85705f', bottom: '#b09b88' },
      deco: (c, bb) => {
        volume(c, bb, { dark: 'rgba(55,35,25,0.3)' });
        rings(c, trunkC, '#4a382e', { n: 16, from: 0.12, to: 0.97, w: 0.026, alpha: 0.35 });
      },
    }],
  };
  // near upper tusk: own STATIC piece in front of the trunk (the tusk flanks the trunk, so it must cover it)
  const tusk = {
    z: 3,
    layers: [{ shapes: [upperN], fill: { top: C.tusk, bottom: C.tuskB }, deco: (c, bb) => { curve(c, [[2.5, 2.1], [3.3, 1.9], [3.9, 1.95]], '#b8a574', 0.03, { alpha: 0.5 }); } }],
  };
  return {
    id: 'gomphotherium', parts: { body, trunk, tusk },
    anchors: { head: [1.9, 2.5], mouth: [2.5, 1.8], eye: [1.88, 2.5], back: [-0.2, 3.0], foot: [0.9, 0], trunkTip: [2.3, 0.27], trunkBase: TP },
    meta: {
      name: 'Gomphotherium', lengthM: 6, heightM: 3.1, shoulderHeightM: 3.0,
      pivots: { trunk: TP }, ranges: { trunk: [0, 1.9] }, downRange: { trunk: -0.25 },
    },
  };
}
