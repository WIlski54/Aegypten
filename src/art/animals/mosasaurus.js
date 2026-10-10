// Mosasaurus (Oberkreide, ~11 m): eidechsenartig, lange kraeftige Kiefer, vier Paddel, Fluke am Schwanz.
// Teile: body (Rumpf+Kopf+3 Paddel), jaw (Unterkiefer, Pivot am Kiefergelenk, schnappt auf), tail (Pivot am Schwanzansatz),
// flipperA (vorderes nahes Paddel).
import { blob, limb, poly } from '../dsl.js';
import { volume, stripes, spots, scalesTexture, eye } from '../paint.js';
import { smooth, strip, strokePath, fillPoly, teeth, glow, vgrad } from './_c_helpers.js';

export default function make(opts = {}) {
  const TP = [5.25, 1.4];   // tail pivot (Hueften)
  const JP = [9.3, 1.16];   // jaw pivot
  const FP = [8.15, 0.95];  // front paddle pivot

  // ---- body: torso + short neck + long skull ----
  const hull = smooth([
    [11.1, 1.36], [10.96, 1.52], [10.5, 1.68], [10.05, 1.86], [9.6, 1.98], [9.0, 2.08], [8.2, 2.18], [7.2, 2.22], [6.4, 2.18], [5.8, 2.06], [5.4, 1.9],
    [5.45, 0.88], [5.9, 0.62], [6.8, 0.52], [7.8, 0.56], [8.5, 0.72], [8.95, 0.95], [9.2, 1.1],
    [9.9, 1.15], [10.5, 1.2], [10.98, 1.25],
  ], 8);
  const rear = blob(TP[0], TP[1], 0.54, 0.54);
  const paddleNH = limb([[6.05, 0.82, 0.4], [5.7, 0.55, 0.48], [5.3, 0.3, 0.44], [4.95, 0.15, 0.26], [4.8, 0.1, 0.12]], { per: 8 });
  const paddleFH = limb([[6.5, 0.8, 0.36], [6.25, 0.5, 0.44], [5.95, 0.25, 0.4], [5.7, 0.1, 0.22], [5.6, 0.06, 0.1]], { per: 8 });
  const paddleFF = limb([[8.5, 0.9, 0.42], [8.2, 0.55, 0.5], [7.75, 0.28, 0.46], [7.35, 0.12, 0.28], [7.2, 0.07, 0.1]], { per: 8 });

  const upperTeeth = teeth([[10.95, 1.24], [9.65, 1.13]], 8, 0.11, 0.075, 1);   // hang down from the upper jaw edge

  // ---- lower jaw: deep, strong ----
  const jawShape = smooth([
    [9.1, 1.2], [9.75, 1.2], [10.5, 1.23], [10.95, 1.25], [10.98, 1.12, 1], [10.55, 0.93], [9.95, 0.81], [9.45, 0.76], [9.15, 0.86],
  ], 6);
  const jawRoot = blob(JP[0], JP[1], 0.2, 0.2);
  const lowerTeeth = teeth([[10.9, 1.24], [9.8, 1.2]], 7, -0.11, 0.075, 1);       // point up from the jaw edge

  // ---- tail with crescent fluke (lower lobe bigger) ----
  const tailCtrl = [[TP[0], TP[1], 1.0], [4.3, 1.42, 0.92], [3.3, 1.37, 0.74], [2.4, 1.27, 0.56], [1.75, 1.15, 0.44]];
  const tailLimb = limb(tailCtrl, { per: 12 });
  const fluke = smooth([
    [0.18, 2.02, 1], [0.75, 1.9], [1.2, 1.62], [1.6, 1.3], [1.55, 1.02], [1.25, 0.7], [0.8, 0.34], [0.1, 0.1, 1],
    [0.52, 0.46], [0.85, 0.8], [0.95, 1.1], [0.8, 1.4], [0.5, 1.7],
  ], 8);
  const tailRoot = blob(TP[0], TP[1], 0.52, 0.52);

  const footCtrl = [[FP[0], FP[1], 0.44], [7.7, 0.62, 0.56], [7.2, 0.34, 0.54], [6.8, 0.16, 0.34], [6.62, 0.08, 0.14]];
  const padA = limb(footCtrl, { per: 10 });
  const padRoot = blob(FP[0], FP[1], 0.24, 0.24);

  const top = '#6e4527', mid = '#a26a36', cream = '#f1e1b4';
  const rust = '#d08a3c';
  const parts = {
    body: {
      z: 1,
      layers: [
        { shapes: [paddleFF, paddleFH], fill: { top: '#4a2c17', bottom: '#6b4325' }, deco: (c, bb) => volume(c, bb) },
        { shapes: [paddleNH], fill: { top: '#734a28', bottom: '#a97a46' }, deco: (c, bb) => volume(c, bb) },
        {
          shapes: [hull, rear], fill: { stops: [[0, top], [0.5, mid], [0.68, '#d2a763'], [0.8, cream], [1, cream]], dir: 'v' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(40,25,10,0.12)', light: 'rgba(255,248,210,0.16)' });
            scalesTexture(c, bb, '#3c2e12', { size: 0.17, alpha: 0.13 });
            // bold dark blotches on the back
            spots(c, { x0: 5.6, x1: 9.0, y0: 1.55, y1: 2.1, w: 3.4, h: 0.55 }, '#3a2010', 9, 0.07, 0.15, { seed: 8, alpha: 0.55 });
            glow(c, 7.4, 2.1, 1.6, 0.14, 'rgba(255,255,255,0.7)', 0.22);
            // cheek, brow, nostril
            glow(c, 9.55, 1.4, 0.35, 0.22, 'rgba(255,240,180,0.7)', 0.35);
            strokePath(c, [[9.75, 1.82], [10.0, 1.88], [10.3, 1.82]], 'rgba(40,25,10,.55)', 0.035);
            strokePath(c, [[10.82, 1.45], [10.9, 1.42]], 'rgba(40,25,10,.9)', 0.03);
            // mouth line with a friendly upturn
            strokePath(c, [[10.97, 1.27], [10.5, 1.215], [9.95, 1.17], [9.5, 1.15], [9.3, 1.19], [9.22, 1.27]], 'rgba(40,25,10,.85)', 0.022);
            eye(c, 10.0, 1.58, 0.16, { color: '#1b120c', look: 0.35 });
            // front paddle on far side stays dark; hind near paddle: lighter edge
          },
        },
        { shapes: upperTeeth, fill: '#fff7dc', stroke: null },
      ],
    },
    jaw: {
      z: 0, pivot: JP,
      layers: [
        {
          shapes: [jawRoot, jawShape], fill: { top: '#b98d58', bottom: '#f1e1b4' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(40,25,10,0.18)', light: 'rgba(255,248,210,0.1)' });
            scalesTexture(c, bb, '#3c2e12', { size: 0.15, alpha: 0.1 });
            fillPoly(c, strip([[9.2, 1.2, 0.06], [10.0, 1.2, 0.06], [10.95, 1.25, 0.04]], 0.5, -0.5, 8), 'rgba(222,120,130,0.95)');
            strokePath(c, [[9.5, 0.9], [10.2, 0.99], [10.8, 1.1]], 'rgba(60,40,15,.22)', 0.02);
          },
        },
        { shapes: lowerTeeth, fill: '#fff7dc', stroke: null },
      ],
    },
    tail: {
      z: 0, pivot: TP,
      layers: [{
        shapes: [tailRoot, tailLimb, fluke], fill: { top: '#5d3a20', bottom: '#98693a' },
        deco: (c, bb) => {
          vgrad(c, 2.22, 0.52, [[0, top], [0.5, mid], [0.68, '#d2a763'], [0.8, cream], [1, cream]]);
          volume(c, bb, { dark: 'rgba(40,25,10,0.12)', light: 'rgba(255,248,210,0.16)' });
          scalesTexture(c, bb, '#3c2e12', { size: 0.17, alpha: 0.13 });
          stripes(c, { x0: 2.0, x1: 5.1, y0: bb.y0, y1: bb.y1, w: 3.1, h: bb.h }, rust, 6, { width: 0.16, slant: -0.1, alpha: 0.38 });
          strokePath(c, [[1.45, 1.2], [1.0, 1.7], [0.5, 1.95]], 'rgba(235,215,150,.35)', 0.04);
          strokePath(c, [[1.45, 1.05], [1.0, 0.6], [0.4, 0.25]], 'rgba(235,215,150,.35)', 0.04);
        },
      }],
    },
    flipperA: {
      z: 2, pivot: FP,
      layers: [{
        shapes: [padRoot, padA], fill: { top: '#7a4f2a', bottom: '#b8874d' },
        deco: (c, bb) => { volume(c, bb); fillPoly(c, strip(footCtrl, 0.15, -0.5, 10), 'rgba(236,223,180,0.45)'); strokePath(c, footCtrl.map((p) => [p[0], p[1]]).slice(0, 4), 'rgba(60,40,15,.28)', 0.02); },
      }],
    },
  };
  return {
    id: 'mosasaurus', parts,
    anchors: { head: [10.2, 1.5], mouth: [11.0, 1.2], eye: [10.0, 1.52], back: [7.0, 2.08], tail: [1.0, 1.1], shoulder: FP, foot: [7.0, 0.55] },
    meta: { name: 'Mosasaurus', lengthM: 11, epoch: 'Oberkreide', ranges: { jaw: [0, -0.55], tail: [0, 0.35], flipperA: [0, 0.6] }, flap: { jaw: [0, -0.55], tail: [-0.35, 0.35], flipperA: [-0.5, 0.6] } },
  };
}
