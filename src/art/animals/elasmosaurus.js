// Elasmosaurus (Oberkreide, ~10 m): kleiner Kopf auf extrem langem Hals, kompakter Rumpf, vier Paddel.
// Teile: body (Rumpf + Schwanz + die zwei fernen Paddel), neck (Hals+Kopf, Pivot an der Schulter, hebt sich wie ein Periskop),
// flipperA (vorderes nahes Paddel), flipperB (hinteres nahes Paddel).
import { blob, limb, poly, move } from '../dsl.js';
import { volume, stripes, spots, eye } from '../paint.js';
import { smooth, strip, along, strokePath, fillPoly, teeth, glow } from './_c_helpers.js';

export default function make(opts = {}) {
  const DY = 0.58;                       // lifts the lowest paddle tip to y~0.05
  const Y = (p) => move(p, 0, DY);
  const NP = [4.55, 1.5 + DY];           // neck pivot (Schulter)
  const FA = [4.3, 0.8 + DY];            // front paddle pivot
  const FB = [2.75, 0.66 + DY];          // hind paddle pivot

  // ---- body: barrel + tapering tail ----
  const hull = Y(smooth([
    [5.36, 1.3], [5.14, 1.85], [4.5, 2.1], [3.7, 2.18], [2.9, 2.08], [2.3, 1.82], [1.7, 1.55], [1.1, 1.32], [0.55, 1.2], [0.0, 1.14, 1],
    [0.55, 1.03], [1.1, 1.0], [1.7, 0.9], [2.2, 0.66], [2.9, 0.42], [3.7, 0.34], [4.5, 0.4], [5.02, 0.62],
  ], 8));
  const farF = Y(limb([[4.95, 0.82, 0.5], [4.72, 0.42, 0.62], [4.36, 0.06, 0.62], [4.0, -0.18, 0.44], [3.8, -0.28, 0.2]], { per: 8 }));
  const farB = Y(limb([[3.25, 0.72, 0.46], [3.02, 0.4, 0.56], [2.68, 0.1, 0.56], [2.32, -0.12, 0.4], [2.12, -0.22, 0.18]], { per: 8 }));

  // ---- neck: long, slender, gentle S-curve, small head ----
  const nk = [
    [NP[0], NP[1], 0.95], [5.4, 1.52 + DY, 0.74], [6.4, 1.78 + DY, 0.58], [7.3, 2.22 + DY, 0.46], [8.0, 2.8 + DY, 0.38],
    [8.6, 3.45 + DY, 0.33], [9.25, 3.9 + DY, 0.3], [9.9, 4.02 + DY, 0.28],
  ];
  const neck = limb(nk, { per: 12 });
  const hx = 9.85, hy = 4.0 + DY;
  const head = smooth([
    [hx - 0.15, hy + 0.2], [hx + 0.3, hy + 0.23], [hx + 0.7, hy + 0.15], [hx + 0.98, hy + 0.04, 1], [hx + 0.7, hy - 0.05], [hx + 0.3, hy - 0.12], [hx - 0.15, hy - 0.16],
  ], 6);

  // ---- paddles ----
  const ctrlA = [[FA[0], FA[1], 0.5], [3.7, 0.32 + DY, 0.66], [3.0, -0.05 + DY, 0.68], [2.35, -0.32 + DY, 0.5], [1.95, -0.45 + DY, 0.2]];
  const ctrlB = [[FB[0], FB[1], 0.48], [2.2, 0.28 + DY, 0.62], [1.55, -0.02 + DY, 0.64], [0.95, -0.28 + DY, 0.46], [0.6, -0.4 + DY, 0.18]];
  const padA = limb(ctrlA, { per: 10 });
  const padB = limb(ctrlB, { per: 10 });
  const rootA = blob(FA[0], FA[1], 0.26, 0.26), rootB = blob(FB[0], FB[1], 0.25, 0.25);

  const greenD = '#4b7a4a', greenM = '#76a05a', cream = '#f0e5b8';
  const padFill = { top: '#4f7e4c', bottom: '#8db367' };
  const padDeco = (ctrl) => (c, bb) => {
    volume(c, bb, { dark: 'rgba(30,40,15,0.18)', light: 'rgba(255,250,210,0.18)' });
    fillPoly(c, strip(ctrl, 0.1, -0.45, 10), 'rgba(246,236,190,0.55)');           // lighter underside of the paddle
    strokePath(c, ctrl.map((p) => [p[0], p[1]]).slice(0, 4), 'rgba(40,60,30,.28)', 0.02);
  };

  const parts = {
    body: {
      z: 1,
      layers: [
        { shapes: [farF, farB], fill: { top: '#3c6240', bottom: '#5c8650' }, deco: (c, bb) => volume(c, bb) },
        {
          shapes: [hull], fill: { stops: [[0, '#4a7848'], [0.38, '#6c9a58'], [0.58, '#b4c987'], [0.72, cream], [1, cream]], dir: 'v' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(30,40,15,0.12)', light: 'rgba(255,250,210,0.16)' });
            stripes(c, { x0: 0.5, x1: 5.0, y0: bb.y0, y1: bb.y1, w: 4.5, h: bb.h }, '#2f5a36', 9, { width: 0.1, slant: 0.1, alpha: 0.38 });
            glow(c, 3.6, 1.95 + DY, 1.4, 0.15, 'rgba(255,255,255,0.7)', 0.25);
          },
        },
      ],
    },
    neck: {
      z: 0, pivot: NP,
      layers: [
        {
          shapes: [blob(NP[0], NP[1], 0.45, 0.45), neck, head], fill: '#6f9c58',
          deco: (c, bb) => {
            // lighter belly line along the underside of the neck, darker back
            fillPoly(c, strip(nk, -0.12, -0.6, 12), 'rgba(246,236,190,0.9)');
            fillPoly(c, strip(nk, 0.62, 0.15, 12), 'rgba(40,80,40,0.28)');
            // bold bands across the neck
            for (let i = 1; i < 12; i++) {
              const a = along(nk, i / 13, 12); const h = a.w * 0.55;
              strokePath(c, [[a.x + a.nx * h, a.y + a.ny * h], [a.x - a.nx * h * 0.2, a.y - a.ny * h * 0.2]], '#2f5a36', Math.max(0.04, a.w * 0.12), 0.4);
            }
            // head
            eye(c, hx + 0.38, hy + 0.08, 0.098, { color: '#1b120c', look: 0.35 });
            strokePath(c, [[hx + 0.96, hy + 0.03], [hx + 0.55, hy - 0.02], [hx + 0.25, hy + 0.0], [hx + 0.2, hy + 0.04]], 'rgba(40,25,10,.8)', 0.014);
          },
        },
        { shapes: teeth([[hx + 0.94, hy + 0.02], [hx + 0.45, hy - 0.04]], 5, 0.07, 0.05, 1), fill: '#fff8e0', stroke: null },
      ],
    },
    flipperA: {
      z: 2, pivot: FA,
      layers: [{ shapes: [rootA, padA], fill: padFill, deco: padDeco(ctrlA) }],
    },
    flipperB: {
      z: 2, pivot: FB,
      layers: [{ shapes: [rootB, padB], fill: padFill, deco: padDeco(ctrlB) }],
    },
  };
  return {
    id: 'elasmosaurus', parts,
    anchors: { head: [hx + 0.4, hy], mouth: [hx + 0.96, hy], eye: [hx + 0.38, hy + 0.08], back: [3.6, 2.07 + DY], shoulder: NP, tail: [0.2, 1.1 + DY], foot: [3.4, 0.35 + DY] },
    meta: { name: 'Elasmosaurus', lengthM: 10, epoch: 'Oberkreide', ranges: { neck: [0, 0.7], flipperA: [0, 0.6], flipperB: [0, 0.5] }, flap: { neck: [-0.35, 0.7], flipperA: [-0.5, 0.6], flipperB: [-0.5, 0.5] } },
  };
}
