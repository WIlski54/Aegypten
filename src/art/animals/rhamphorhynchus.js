// Rhamphorhynchus (Oberjura, Spannweite ~1,8 m): gleiche Ansicht/Mechanik wie Pteranodon (von unten/vorn, symmetrisch).
// Langer duenner Schwanz mit rautenfoermigem Segel, bezahnter Schnabel. Teile: body (inkl. Kopf+Schwanz), wing (rechts), wing2 (links).
import { limb, blob, poly } from '../dsl.js';
import { volume, eye } from '../paint.js';
import { smooth, strokePath, fillPoly, glow, teeth } from './_c_helpers.js';
import { pteroWingParts, symOutline } from './_c_ptero.js';

export default function make(opts = {}) {
  const DY = 0.07;
  const S = (pts) => pts.map(([x, y, ...r]) => [x, y + DY, ...r]);
  const SH = [0.15, 1.05 + DY];

  const W = pteroWingParts({
    dy: DY, sh: [0.15, 1.05], span: 0.9,
    lead: [[0.15, 1.05], [0.32, 1.12], [0.5, 1.18], [0.72, 1.09], [0.93, 0.9]],
    trail: [[0.93, 0.9], [0.78, 0.9], [0.55, 0.86], [0.34, 0.8], [0.2, 0.8]],
    arm: [[0.15, 1.05, 0.1], [0.33, 1.11, 0.075], [0.5, 1.18, 0.058]],
    finger: [[0.5, 1.18, 0.058], [0.72, 1.1, 0.042], [0.86, 0.98, 0.025], [0.93, 0.9, 0.008]],
    claws: [
      [[0.5, 1.18, 0.035], [0.6, 1.28, 0.008]],
      [[0.5, 1.18, 0.035], [0.5, 1.3, 0.008]],
      [[0.5, 1.18, 0.035], [0.4, 1.27, 0.008]],
    ],
    colors: { memTop: '#e08a38', memBot: '#f8d48c', bone: '#6e3418', fibre: 'rgba(120,50,15,.3)' },
    fibres: 6,
  });

  // ---- body ----
  const torso = smooth(symOutline([[0, 1.22], [0.1, 1.18], [0.155, 1.08], [0.155, 0.96], [0.11, 0.86], [0.05, 0.81], [0, 0.79]]), 8);
  const neck = limb([[0, 1.18, 0.15], [0, 1.26, 0.13], [0, 1.33, 0.13]], { per: 6 });
  const headHalf = [[0, 1.68, 1], [0.022, 1.62], [0.038, 1.52], [0.06, 1.44], [0.092, 1.375], [0.13, 1.33], [0.125, 1.285], [0.082, 1.25], [0, 1.24]];
  const head = smooth(symOutline(headHalf), 8);
  // needle teeth along both sides of the beak, pointing outward and slightly forward
  const edgeR = headHalf.slice(0, 6).map(([x, y]) => [x, y]);
  const edgeL = edgeR.map(([x, y]) => [-x, y]);
  const toothSet = teeth(edgeR, 4, 0.046, 0.034, 1, 0.16, 0.94, -0.3).concat(teeth(edgeL, 4, 0.046, 0.034, -1, 0.16, 0.94, -0.3));
  const tailLine = limb([[0, 0.9, 0.07], [0, 0.62, 0.042], [0, 0.42, 0.033], [0, 0.32, 0.03]], { per: 8 });
  const vane = poly([[0, 0.36], [0.105, 0.18], [0, 0.0], [-0.105, 0.18]], 0);
  const legR = limb([[0.08, 0.92, 0.08], [0.12, 0.84, 0.06], [0.14, 0.77, 0.045]], { per: 6 });
  const legL = limb([[-0.08, 0.92, 0.08], [-0.12, 0.84, 0.06], [-0.14, 0.77, 0.045]], { per: 6 });
  const footR = poly([[0.12, 0.8], [0.23, 0.74], [0.17, 0.72], [0.13, 0.74]], 1);
  const footL = poly([[-0.12, 0.8], [-0.23, 0.74], [-0.17, 0.72], [-0.13, 0.74]], 1);

  const parts = {
    body: {
      z: 1,
      layers: [
        { shapes: [tailLine, legR, legL, footR, footL], fill: '#2d6f69', deco: (c, bb) => volume(c, bb) },
        {
          shapes: [vane], fill: { top: '#ee6a43', bottom: '#d2472c' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(80,20,10,0.18)', light: 'rgba(255,230,200,0.22)' });
            strokePath(c, [[0, 0.31], [0, 0.06]], 'rgba(255,225,170,.7)', 0.02, 1);
            strokePath(c, [[-0.065, 0.18], [0.065, 0.18]], 'rgba(255,225,170,.5)', 0.014, 1);
          },
        },
        {
          shapes: [torso], fill: { top: '#a9d1bf', bottom: '#e5f0dc' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(30,70,60,0.16)', light: 'rgba(255,255,235,0.2)' });
            for (let k = 0; k < 3; k++) strokePath(c, [[-0.09, 1.12 - k * 0.1], [0, 1.07 - k * 0.1], [0.09, 1.12 - k * 0.1]], 'rgba(30,90,80,.28)', 0.014, 1);
          },
        },
        { shapes: [neck], fill: { top: '#3b8d84', bottom: '#5fb0a0' }, deco: (c, bb) => volume(c, bb) },
        { shapes: toothSet, fill: '#fffbe6', stroke: null },
        {
          shapes: [head], fill: { stops: [[0, '#f0d78a'], [0.45, '#ecd283'], [0.55, '#3f9187'], [1, '#2f7d75']], dir: 'v' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(20,60,50,0.16)', light: 'rgba(255,255,225,0.2)' });
            strokePath(c, [[0, 1.64], [0, 1.4]], 'rgba(90,60,20,.45)', 0.01, 1);
            eye(c, 0.078, 1.285, 0.042, { color: '#1b120c', look: 0.0 });
            eye(c, -0.078, 1.285, 0.042, { color: '#1b120c', look: 0.0 });
          },
        },
      ],
    },
    wing: W.wing,
    wing2: W.wing2,
  };
  return {
    id: 'rhamphorhynchus', parts,
    anchors: { head: [0, 1.45], mouth: [0, 1.68], eye: [0.078, 1.285], back: [0, 1.0], shoulderR: SH, shoulderL: [-SH[0], SH[1]], tipR: [0.93, 0.9 + DY], tipL: [-0.93, 0.9 + DY], tail: [0, 0.15], foot: [0, 0.0] },
    meta: {
      name: 'Rhamphorhynchus', lengthM: 1.7, spanM: 1.8, epoch: 'Oberjura', view: 'from-below',
      ranges: { wing: [0, 0.65], wing2: [0, -0.65] },
      flap: { wing: [-0.5, 0.65], wing2: [0.5, -0.65] },
    },
  };
}
