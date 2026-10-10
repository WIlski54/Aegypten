// Gastornis (Paläozän/Eozän), ~2 m, flightless giant bird with a gigantic beak and tiny wings.
// Modern view: probably a plant eater (cracking seeds/nuts) - so: friendly, astonished look.
// Parts: body (everything but the lower beak), jaw (lower beak; pivot at the gape corner, negative = open).
import { blob, limb, poly, xf } from '../dsl.js';
import { eye, volume } from '../paint.js';
import { furEdge, tufts, blobTufts, featherMarks, furStrokes, glow, curve } from './_f_common.js';

export default function make(opts = {}) {
  const C = {
    top: '#7a4a32', bottom: '#d0aa7c', mark: '#4c2c1c', neck: '#a8714a', neckB: '#d6b183',
    beakTop: '#d7922e', beakBot: '#f6d273', leg: '#e2b87c', legD: '#b98a55', wing: '#5a3626', wingB: '#8d5e3e', eye: '#2a170c',
  };
  const PIV = [0.56, 1.70]; // gape corner

  // ---- legs: stout, slightly zig-zag bird legs (ankle points back), big 3-toed feet
  const legFarC = [[-0.12, 0.96, 0.30], [-0.17, 0.66, 0.22], [-0.22, 0.42, 0.17], [-0.15, 0.22, 0.15], [-0.14, 0.10, 0.14]];
  const legC = [[0.10, 0.96, 0.32], [0.05, 0.66, 0.23], [0.0, 0.42, 0.18], [0.07, 0.22, 0.16], [0.08, 0.10, 0.15]];
  const toes = (x) => [
    limb([[x, 0.12, 0.15], [x + 0.18, 0.075, 0.13], [x + 0.36, 0.05, 0.085]]),
    limb([[x, 0.13, 0.14], [x + 0.14, 0.115, 0.115], [x + 0.28, 0.085, 0.07]]),
    limb([[x, 0.10, 0.13], [x - 0.09, 0.07, 0.10], [x - 0.17, 0.04, 0.06]]),
  ];
  const claws = (x) => [
    poly([[x + 0.35, 0.075], [x + 0.46, 0.028], [x + 0.37, 0.008]]),
    poly([[x + 0.27, 0.12], [x + 0.37, 0.07], [x + 0.30, 0.05]]),
    poly([[x - 0.15, 0.07], [x - 0.24, 0.028], [x - 0.16, 0.008]]),
  ];
  const footFar = toes(-0.14), footNear = toes(0.08);

  // ---- body, neck
  const body = blob(-0.05, 1.18, 0.52, 0.34, 0.30);
  const chest = blob(0.30, 1.28, 0.30, 0.33, 0.1);
  const rump = blob(-0.42, 1.10, 0.25, 0.22, 0.2);
  const neckC = [[0.26, 1.28, 0.54], [0.38, 1.48, 0.38], [0.43, 1.66, 0.29], [0.50, 1.82, 0.33]];
  const neck = limb(neckC);
  const belly = tufts([[0.26, 0.92], [0.1, 0.86], [-0.15, 0.86], [-0.38, 0.94]], { step: 0.05, len: 0.07, w: 0.07, dir: [0, -1], jitter: 0.3, seed: 5 });
  const ruffC = tufts([[0.22, 1.50], [0.36, 1.40], [0.50, 1.36], [0.62, 1.42]], { step: 0.05, len: 0.07, w: 0.07, radial: [0.42, 1.65], bias: [0, -0.3], jitter: 0.3, seed: 6 });
  // plumage tufts on the silhouette (back, rump, breast)
  const plume = [
    ...blobTufts(-0.05, 1.18, 0.52, 0.34, 0.30, 85, 205, { step: 0.07, len: 0.085, w: 0.095, bias: [-0.5, 0.1], jitter: 0.4, seed: 21, curl: 0.5, inset: 1.2 }),
    ...blobTufts(0.30, 1.28, 0.30, 0.33, 0.1, -50, 20, { step: 0.07, len: 0.075, w: 0.09, bias: [0, -0.3], jitter: 0.4, seed: 22, curl: 0.4, inset: 1.2 }),
  ];
  // tail feathers (stiff bundle fanning back)
  const tailF = [
    limb([[-0.50, 1.16, 0.20], [-0.80, 1.14, 0.17], [-1.08, 1.04, 0.04]]),
    limb([[-0.48, 1.10, 0.20], [-0.76, 1.00, 0.17], [-1.00, 0.84, 0.04]]),
    limb([[-0.44, 1.06, 0.20], [-0.64, 0.90, 0.16], [-0.78, 0.70, 0.04]]),
  ];
  // wing (tiny)
  const wingP = poly([[0.20, 1.34], [0.04, 1.32], [-0.14, 1.20], [-0.18, 1.06], [-0.08, 1.04], [0.06, 1.12], [0.18, 1.22]], 2);
  const wingF = [limb([[-0.08, 1.08, 0.08], [-0.16, 0.96, 0.07], [-0.19, 0.86, 0.01]]), limb([[-0.02, 1.08, 0.08], [-0.07, 0.94, 0.07], [-0.09, 0.84, 0.01]]), limb([[0.04, 1.12, 0.07], [0.02, 0.98, 0.06], [0.01, 0.90, 0.01]])];
  // thigh feather "trousers"
  const thigh = blob(0.05, 1.0, 0.26, 0.26, 0.2);
  const thighFar = blob(-0.14, 1.02, 0.24, 0.23, 0.2);
  const thighFringe = tufts([[-0.20, 0.86], [-0.06, 0.77], [0.10, 0.75], [0.26, 0.83]], { step: 0.045, len: 0.07, w: 0.06, dir: [0, -1], jitter: 0.3, seed: 8 });

  // ---- head
  const skull = blob(0.52, 1.84, 0.18, 0.17, 0.1);
  const upperBeak = poly([
    [0.50, 2.00], [0.68, 2.035], [0.85, 2.0], [0.98, 1.89], [1.07, 1.75], [1.105, 1.63], [1.06, 1.585], [0.99, 1.645],
    [0.90, 1.675], [0.70, 1.695], [0.55, 1.705], [0.43, 1.76], [0.40, 1.90],
  ], 2);
  const jaw = poly([
    [0.40, 1.74], [0.56, 1.70], [0.80, 1.672], [1.0, 1.65], [1.07, 1.60], [1.03, 1.52], [0.92, 1.45], [0.76, 1.42], [0.60, 1.45], [0.47, 1.55], [0.40, 1.64],
  ], 2);
  const crest = [
    limb([[0.44, 1.96, 0.10], [0.34, 2.06, 0.07], [0.26, 2.17, 0.01]]),
    limb([[0.48, 1.98, 0.10], [0.42, 2.10, 0.07], [0.37, 2.21, 0.01]]),
    limb([[0.40, 1.92, 0.10], [0.28, 1.98, 0.07], [0.19, 2.06, 0.01]]),
  ];
  const browF = limb([[0.56, 1.99, 0.07], [0.60, 2.07, 0.05], [0.63, 2.13, 0.01]]);

  const bodyFill = { top: C.top, bottom: C.bottom };
  const legDeco = (c, bb, dark = 0) => {
    volume(c, bb, { dark: 'rgba(50,25,8,0.3)' });
    if (dark) { c.ctx.save(); c.ctx.fillStyle = `rgba(40,20,8,${dark})`; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore(); }
    // bold scale bands
    for (let y = bb.y0 + 0.05; y < bb.y1 - 0.06; y += 0.07) curve(c, [[bb.x0, y + 0.01], [(bb.x0 + bb.x1) / 2, y - 0.012], [bb.x1, y + 0.01]], '#7a5230', 0.011, { alpha: 0.4 });
  };

  const parts = {
    body: {
      z: 1,
      layers: [
        { shapes: [limb(legFarC), ...footFar], fill: { top: C.legD, bottom: '#8f6a3f' }, deco: (c, bb) => legDeco(c, bb, 0.12) },
        { shapes: claws(-0.14), fill: '#3a2a1e', stroke: null },
        { shapes: [thighFar], fill: { top: '#5e3a28', bottom: '#8a6a4a' }, deco: (c, bb) => { featherMarks(c, bb, '#2e1a10', { size: 0.1, alpha: 0.35 }); } },
        { shapes: tailF, fill: { top: '#4a2c1e', bottom: '#7b4f35' }, deco: (c, bb) => { furStrokes(c, bb, '#2a170e', 12, { len: 0.2, w: 0.012, ang: Math.PI + 0.1, jit: 0.2, alpha: 0.5 }); } },
        {
          shapes: [body, chest, rump, neck, ...belly, ...ruffC, ...plume], fill: bodyFill,
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(50,25,8,0.32)' });
            glow(c, 0.38, 1.0, 0.36, 0.28, '#f1ddb8', 0.5);
            featherMarks(c, bb, '#3b2014', { size: 0.13, alpha: 0.26, seed: 4, w: 0.014 }); furStrokes(c, bb, '#2e1a10', 60, { len: 0.12, w: 0.012, ang: -Math.PI / 2 - 0.5, alpha: 0.28, seed: 8 }); furStrokes(c, bb, '#f3dcb0', 40, { len: 0.1, w: 0.011, ang: -Math.PI / 2 - 0.5, alpha: 0.3, seed: 9 });
            // lighter neck patch
            glow(c, 0.46, 1.5, 0.15, 0.3, '#e1b98a', 0.55);
          },
        },
        { shapes: [limb(legC), ...footNear], fill: { top: C.leg, bottom: C.legD }, deco: (c, bb) => legDeco(c, bb, 0) },
        { shapes: claws(0.08), fill: '#3a2a1e', stroke: null },
        { shapes: [thigh, ...thighFringe], fill: { top: '#7a4a32', bottom: '#b88a5e' }, deco: (c, bb) => { volume(c, bb); featherMarks(c, bb, '#3b2014', { size: 0.1, alpha: 0.35, seed: 9 }); } },
        { shapes: [wingP, ...wingF], fill: { top: C.wing, bottom: C.wingB }, deco: (c, bb) => { featherMarks(c, bb, '#2a170c', { size: 0.07, alpha: 0.4, seed: 2 }); volume(c, bb); } },
        { shapes: [skull, ...crest, browF], fill: { top: '#8c5a3a', bottom: '#c8986a' }, deco: (c, bb) => { furStrokes(c, bb, '#3b2014', 18, { len: 0.12, w: 0.01, ang: Math.PI * 0.62, jit: 0.35, alpha: 0.5, seed: 3 }); } },
        {
          shapes: [upperBeak], fill: { top: C.beakTop, bottom: C.beakBot },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(90,40,5,0.28)', light: 'rgba(255,240,200,0.3)' });
            // dark culmen ridge shading + nostril + friendly smile line
            curve(c, [[0.66, 2.01], [0.84, 1.985], [0.96, 1.89], [1.04, 1.76]], '#a45f1a', 0.03, { alpha: 0.35 });
            c.ctx.save(); c.ctx.fillStyle = 'rgba(70,35,10,.8)'; c.ctx.beginPath(); const [X, Y] = c.tf(0.78, 1.86); c.ctx.ellipse(X, Y, 0.032 * c.S, 0.018 * c.S, -0.5, 0, 6.2832); c.ctx.fill(); c.ctx.restore();
            curve(c, [[1.055, 1.60], [0.96, 1.655], [0.80, 1.685], [0.62, 1.698], [0.50, 1.715], [0.44, 1.76]], '#6a3a12', 0.014, { alpha: 0.85 });
            // lighter tip
            glow(c, 1.0, 1.7, 0.1, 0.1, '#fff0b8', 0.5);
          },
        },
        {
          shapes: [blob(0.55, 1.855, 0.075, 0.075)], fill: '#fff5e0', stroke: 'rgba(60,30,10,.7)',
          deco: (c) => { eye(c, 0.555, 1.855, 0.07, { color: C.eye, white: '#fff8e6', look: 0.18 }); },
        },
      ],
    },
    jaw: {
      z: 0, pivot: PIV,
      layers: [{
        shapes: [jaw], fill: { top: '#f0c35c', bottom: '#f9dc8c' },
        deco: (c, bb) => { volume(c, bb, { dark: 'rgba(120,70,15,0.25)' }); curve(c, [[0.62, 1.50], [0.82, 1.47], [0.98, 1.54]], '#b57a22', 0.016, { alpha: 0.4 }); },
      }, {
        // inside of the lower beak (pink), only seen when the beak is open
        shapes: [poly([[0.52, 1.70], [0.8, 1.668], [1.0, 1.645], [1.04, 1.61], [0.92, 1.615], [0.72, 1.635], [0.54, 1.65]], 1)], fill: '#cf6a58', stroke: null,
      }],
    },
  };
  return {
    id: 'gastornis', parts,
    anchors: { head: [0.62, 1.85], mouth: [1.08, 1.62], eye: [0.555, 1.855], back: [-0.1, 1.52], foot: [0.1, 0] },
    meta: { name: 'Gastornis', lengthM: 2.0, heightM: 2.05, pivots: { jaw: PIV }, ranges: { jaw: [0, -0.45] } },
  };
}
