// Paraceratherium (Oligozän), largest land mammal ever: shoulder height ~4.8 m, hornless giant rhino with a long neck,
// pillar legs and a small head with a prehensile upper lip.
// Parts: body (z1), neck (z0, behind the shoulder; neck + head as ONE part, pivot at the shoulder; + = head up, - = head down).
// Option make({jaw:true}) splits off a lower jaw part (pivot at the gape). NOTE: a separate jaw does not follow the neck
// rotation by itself (see meta.attach) - by default the lower jaw is part of the neck/head piece.
import { blob, limb, poly, xf } from '../dsl.js';
import { eye, volume, spots } from '../paint.js';
import { tufts, furEdge, clumps, glow, curve, furStrokes } from './_f_common.js';

export default function make(opts = {}) {
  const withJaw = opts.jaw === true;
  const C = { top: '#937468', bottom: '#d8c0a8', far: '#6c574d', farB: '#a8927f', dark: '#4c3a33', ear: '#d99a8c', hoof: '#5a4a40' };
  const NP = [1.7, 4.35]; // neck pivot (shoulder)

  // ---------------------------------------------------------------- BODY
  const torso = poly([
    [-3.05, 4.05], [-2.95, 4.38], [-1.8, 4.52], [-0.4, 4.70], [0.8, 4.88], [1.6, 4.95], [2.2, 4.72], [2.55, 4.15], [2.62, 3.4],
    [2.3, 2.62], [1.5, 2.28], [0.2, 2.22], [-1.0, 2.32], [-2.0, 2.52], [-2.8, 2.95], [-3.12, 3.5],
  ], 3);
  const leg = (x, yTop, wTop, kneeX, footX, w1, w2) => limb([[x, yTop, wTop], [x + (kneeX - x) * 0.6, yTop - 1.1, w1], [kneeX, 1.2, w2], [footX, 0.45, w2 * 0.98]]);
  const foot = (x) => [blob(x + 0.1, 0.2, 0.46, 0.2, 0.0), blob(x + 0.5, 0.12, 0.15, 0.11), blob(x + 0.28, 0.11, 0.15, 0.11)];
  const legFrontN = leg(1.55, 3.3, 1.2, 1.62, 1.58, 0.92, 0.72), footFrontN = foot(1.58);
  const legFrontF = leg(2.0, 3.2, 1.1, 2.1, 2.1, 0.86, 0.68), footFrontF = foot(2.1);
  const legHindN = limb([[-1.95, 3.5, 1.7], [-1.75, 2.4, 1.15], [-2.0, 1.25, 0.8], [-1.9, 0.45, 0.74]]), footHindN = foot(-1.9);
  const legHindF = limb([[-1.4, 3.4, 1.5], [-1.2, 2.4, 1.05], [-1.45, 1.25, 0.76], [-1.35, 0.45, 0.7]]), footHindF = foot(-1.35);
  const tail = limb([[-3.05, 4.0, 0.34], [-3.35, 3.5, 0.24], [-3.4, 2.9, 0.18], [-3.38, 2.55, 0.15]]);
  const tailTuft = tufts([[-3.5, 2.7], [-3.42, 2.4], [-3.32, 2.55]], { step: 0.07, len: 0.3, w: 0.13, dir: [0, -1], jitter: 0.4, seed: 4 });
  const hoofs = (x) => [blob(x + 0.58, 0.11, 0.1, 0.1), blob(x + 0.36, 0.1, 0.1, 0.09), blob(x + 0.14, 0.095, 0.09, 0.09)];
  const hoofLayer = (xs) => ({ shapes: xs.flatMap((x) => hoofs(x)), fill: C.hoof, stroke: null });
  const wrink = (c, list, col, w, a) => { for (const f of list) curve(c, f, col, w, { alpha: a }); };

  const body = {
    z: 1,
    layers: [
      { shapes: [legFrontF, ...footFrontF, legHindF, ...footHindF], fill: { top: C.far, bottom: C.farB }, deco: (c, bb) => { volume(c, bb, { dark: 'rgba(30,15,8,.35)' }); } },
      hoofLayer([2.1, -1.35]),
      { shapes: [tail, ...tailTuft], fill: { top: '#6f5a4e', bottom: '#4c3a33' }, deco: (c, bb) => { furStrokes(c, bb, '#2a1c18', 12, { len: 0.3, w: 0.03, ang: -Math.PI / 2, alpha: 0.5 }); } },
      {
        shapes: [torso], fill: { top: C.top, bottom: C.bottom },
        deco: (c, bb) => {
          volume(c, bb, { dark: 'rgba(60,35,25,0.3)' });
          spots(c, bb, '#6a5248', 26, 0.15, 0.4, { seed: 5, alpha: 0.05 });
          glow(c, 0.3, 2.6, 1.8, 0.5, '#f0dcc4', 0.5);
          // rhino-like skin folds behind the shoulder and over the hip
          wrink(c, [[[1.1, 4.2], [0.9, 3.5], [1.05, 2.9]], [[0.8, 4.3], [0.6, 3.6], [0.75, 3.0]], [[0.5, 4.35], [0.35, 3.8], [0.45, 3.3]]], '#4a362e', 0.035, 0.4);
          wrink(c, [[[-1.6, 4.1], [-1.9, 3.6], [-1.75, 3.0]], [[-1.2, 4.2], [-1.5, 3.7], [-1.4, 3.2]], [[-2.2, 3.9], [-2.5, 3.5], [-2.35, 3.0]]], '#4a362e', 0.035, 0.38);
          furStrokes(c, bb, '#3c2c26', 30, { len: 0.35, w: 0.03, ang: -Math.PI / 2, alpha: 0.18, seed: 2 });
        },
      },
      { shapes: [legFrontN, ...footFrontN, legHindN, ...footHindN], fill: { top: C.top, bottom: '#b09a86' }, deco: (c, bb) => { volume(c, bb, { dark: 'rgba(40,22,15,.4)' });
        wrink(c, [[[1.2, 1.3], [1.6, 1.22], [1.95, 1.3]], [[-2.4, 1.4], [-1.95, 1.32], [-1.6, 1.4]]], '#4a362e', 0.03, 0.3); } },
      hoofLayer([1.58, -1.9]),
    ],
  };

  // ---------------------------------------------------------------- NECK + HEAD
  const neckC = [[1.45, 4.2, 1.75], [2.25, 4.85, 1.25], [2.95, 5.55, 0.92], [3.6, 6.1, 0.8], [3.95, 6.18, 0.82]];
  const neckL = limb(neckC);
  const mane = clumps(neckC.slice(0, 4), +1, { step: 0.2, rx: 0.2, ry: 0.1, push: -0.04, from: 0.08, to: 1, sweep: 0.9, seed: 9, jitter: 0.25 });
  const headUp = poly([
    [3.40, 6.50], [3.85, 6.60], [4.3, 6.42], [4.75, 6.12], [5.0, 5.88], [5.10, 5.70], [5.02, 5.52], [4.82, 5.47], [4.45, 5.58], [4.1, 5.66], [3.85, 5.68], [3.5, 5.9], [3.4, 6.2],
  ], 2);
  const lowerJaw = poly([
    [4.95, 5.54], [4.94, 5.34], [4.8, 5.2], [4.45, 5.1], [4.0, 5.16], [3.7, 5.4], [3.5, 5.7], [3.9, 5.72], [4.4, 5.62], [4.82, 5.47],
  ], 2);
  const ear = poly([[3.55, 6.45], [3.5, 6.85], [3.62, 7.0], [3.78, 6.88], [3.82, 6.5]], 2);
  const earIn = poly([[3.6, 6.5], [3.58, 6.8], [3.65, 6.9], [3.73, 6.8], [3.74, 6.52]], 2);
  const earFar = xf(ear, { x: 0.2, y: -0.08 });
  const tusks = [poly([[4.98, 5.5], [5.04, 5.36], [5.10, 5.5]]), poly([[4.88, 5.48], [4.93, 5.38], [4.99, 5.49]])];

  const headLayers = [
    { shapes: [earFar], fill: C.far, deco: () => { } },
    {
      shapes: [neckL, headUp].concat(withJaw ? [] : [lowerJaw]), fill: { top: C.top, bottom: '#c2ac96' },
      deco: (c, bb) => {
        volume(c, bb, { dark: 'rgba(60,35,25,0.28)' });
        
        // neck folds
        for (const t of [0.22, 0.4, 0.58, 0.74]) {
          const x = 1.6 + t * 2.2, y = 4.5 + t * 1.5;
          curve(c, [[x - 0.35, y + 0.25], [x - 0.05, y + 0.1], [x + 0.2, y + 0.25]], '#4a362e', 0.03, { alpha: 0.28 });
        }
        // lighter muzzle & lip
        glow(c, 4.8, 5.62, 0.35, 0.2, '#e8d2bb', 0.55);
        // brow ridge and friendly eye
        curve(c, [[3.98, 6.36], [4.12, 6.42], [4.3, 6.34]], '#4a362e', 0.035, { alpha: 0.7 });
        // lip fold and mouth line with gentle smile
        curve(c, [[5.07, 5.62], [4.92, 5.55], [4.6, 5.58], [4.25, 5.66], [4.05, 5.74]], '#3e2b24', 0.028, { alpha: 0.85 });
        // nostril
        c.ctx.save(); c.ctx.fillStyle = 'rgba(50,30,25,.85)'; c.ctx.beginPath(); const [X, Y] = c.tf(4.97, 5.86); c.ctx.ellipse(X, Y, 0.05 * c.S, 0.032 * c.S, -0.6, 0, 6.2832); c.ctx.fill(); c.ctx.restore();
        eye(c, 4.13, 6.22, 0.125, { color: '#2b1a12', white: '#fff6e4', look: 0.2 });
      },
    },
    { shapes: mane, fill: { top: '#5b443a', bottom: '#7a6054' }, stroke: null },
    { shapes: tusks, fill: '#f6ecd2', stroke: 'rgba(60,40,25,.5)' },
    { shapes: [ear], fill: { top: C.top, bottom: C.ear } },
    { shapes: [earIn], fill: C.ear, stroke: null },
  ];
  const neck = { z: 0, pivot: NP, layers: headLayers };

  const parts = { body, neck };
  if (withJaw) {
    parts.jaw = { z: -1, pivot: [3.9, 5.7], layers: [{ shapes: [lowerJaw], fill: { top: '#a68d7c', bottom: '#d3bda6' }, deco: (c, bb) => { volume(c, bb); glow(c, 4.6, 5.25, 0.3, 0.15, '#e8d2bb', 0.5); } },
      { shapes: [poly([[4.0, 5.7], [4.5, 5.6], [4.9, 5.5], [4.9, 5.42], [4.5, 5.5], [4.05, 5.6]], 1)], fill: '#c4695a', stroke: null }] };
  }
  const ranges = { neck: [0, -0.85] };
  if (withJaw) ranges.jaw = [0, -0.35];
  return {
    id: 'paraceratherium', parts,
    anchors: { head: [4.3, 6.0], mouth: [5.05, 5.6], eye: [4.13, 6.22], back: [-0.4, 4.7], foot: [1.6, 0], shoulder: NP },
    meta: {
      name: 'Paraceratherium', lengthM: 8, heightM: 7.0, shoulderHeightM: 4.8,
      pivots: Object.assign({ neck: NP }, withJaw ? { jaw: [3.9, 5.7] } : {}),
      ranges, upRange: { neck: 0.25 }, attach: withJaw ? { jaw: 'neck' } : {},
    },
  };
}
