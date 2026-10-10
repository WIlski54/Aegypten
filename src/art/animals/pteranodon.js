// Pteranodon (Oberkreide, Spannweite ~6 m): Ansicht von unten/vorn, symmetrisch. Schnabel zeigt nach oben, Kamm nach hinten (unten im Bild).
// Teile: body (Koerper+Kopf+Kamm), wing (rechts, +x), wing2 (links, -x), beide Pivot an den Schultern; Fluegelschlag in der Papierebene.
import { limb, blob, poly } from '../dsl.js';
import { volume, spots } from '../paint.js';
import { smooth, strokePath, fillPoly, glow, teeth } from './_c_helpers.js';
import { pteroWingParts, symOutline } from './_c_ptero.js';
import { eye } from '../paint.js';

export default function make(opts = {}) {
  const DY = -0.62;                     // legs' lower end at y~0
  const S = (pts) => pts.map(([x, y, ...r]) => [x, y + DY, ...r]);
  const SH = [0.3, 1.62 + DY];

  // ---- wings (right wing defined; left is mirrored) ----
  const W = pteroWingParts({
    dy: DY, sh: [0.3, 1.62], span: 3,
    lead: [[0.3, 1.62], [0.75, 1.8], [1.2, 1.93], [1.9, 1.86], [2.5, 1.66], [3.0, 1.34]],
    trail: [[3.0, 1.34], [2.5, 1.26], [1.9, 1.12], [1.2, 0.98], [0.62, 0.94], [0.22, 1.0]],
    arm: [[0.3, 1.62, 0.22], [0.72, 1.72, 0.17], [1.2, 1.87, 0.13]],
    finger: [[1.2, 1.87, 0.13], [1.95, 1.78, 0.09], [2.55, 1.58, 0.055], [3.0, 1.34, 0.016]],
    claws: [
      [[1.2, 1.87, 0.06], [1.42, 2.03, 0.014]],
      [[1.2, 1.87, 0.06], [1.24, 2.1, 0.014]],
      [[1.2, 1.87, 0.06], [1.03, 2.04, 0.014]],
    ],
    colors: { memTop: '#c97650', memBot: '#eeb48e', bone: '#55352a', fibre: 'rgba(100,38,20,.3)' },
    fibres: 10,
  });

  // ---- body: torso, neck, head with toothless beak, big backward crest ----
  const torso = smooth(S(symOutline([[0, 1.84], [0.17, 1.78], [0.3, 1.58], [0.32, 1.34], [0.26, 1.14], [0.16, 0.99], [0, 0.94]])), 8);
  const neck = limb(S([[0, 1.7, 0.3], [0, 2.0, 0.24], [0, 2.4, 0.24]]), { per: 8 });
  const head = smooth(S(symOutline([[0, 3.9, 1], [0.034, 3.74], [0.068, 3.46], [0.108, 3.16], [0.16, 2.94], [0.222, 2.76], [0.268, 2.6], [0.26, 2.44], [0.2, 2.31], [0, 2.26]])), 8);
  const crest = smooth(S(symOutline([[0, 2.46], [0.12, 2.42], [0.165, 2.26], [0.15, 2.0], [0.095, 1.72], [0, 1.28, 1]])), 8);
  const legR = limb(S([[0.12, 1.12, 0.13], [0.2, 0.92, 0.1], [0.24, 0.74, 0.07]]), { per: 8 });
  const legL = limb(S([[-0.12, 1.12, 0.13], [-0.2, 0.92, 0.1], [-0.24, 0.74, 0.07]]), { per: 8 });
  const footR = poly(S([[0.2, 0.78], [0.4, 0.68], [0.3, 0.66], [0.24, 0.66]]), 1);
  const footL = poly(S([[-0.2, 0.78], [-0.4, 0.68], [-0.3, 0.66], [-0.24, 0.66]]), 1);
  const tailStub = limb(S([[0, 1.05, 0.1], [0, 0.78, 0.05]]), { per: 6 });

  const parts = {
    body: {
      z: 1,
      layers: [
        { shapes: [legR, legL, footR, footL, tailStub], fill: { top: '#a99681', bottom: '#8b7864' }, deco: (c, bb) => volume(c, bb) },
        {
          shapes: [torso], fill: { top: '#d9c7a8', bottom: '#f3e8cf' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(90,60,30,0.14)', light: 'rgba(255,250,225,0.2)' });
            // soft belly chevrons + shoulder shading
            for (let k = 0; k < 4; k++) strokePath(c, [[-0.17, 1.52 + DY - k * 0.18], [0, 1.43 + DY - k * 0.18], [0.17, 1.52 + DY - k * 0.18]], 'rgba(120,85,50,.22)', 0.02, 1);
          },
        },
        { shapes: [neck], fill: { top: '#a8947c', bottom: '#cdb99c' }, deco: (c, bb) => volume(c, bb) },
        {
          shapes: [crest], fill: { top: '#e8663a', bottom: '#cf4a2c' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(80,20,10,0.18)', light: 'rgba(255,230,200,0.2)' });
            strokePath(c, [[0, 2.3 + DY], [0, 1.5 + DY]], 'rgba(255,205,150,.6)', 0.022, 1);
            for (let k = 0; k < 4; k++) strokePath(c, [[-0.17, 2.12 + DY - k * 0.19], [0, 2.03 + DY - k * 0.19], [0.17, 2.12 + DY - k * 0.19]], 'rgba(110,30,15,.3)', 0.034, 1);
          },
        },
        {
          shapes: [head], fill: { stops: [[0, '#e6bb55'], [0.5, '#e0b150'], [0.58, '#a28d75'], [1, '#85725f']], dir: 'v' },
          deco: (c, bb) => {
            volume(c, bb, { dark: 'rgba(60,40,20,0.15)', light: 'rgba(255,250,225,0.18)' });
            strokePath(c, [[0, 3.82 + DY], [0, 3.0 + DY]], 'rgba(70,45,15,.5)', 0.014, 1);        // seam of the bill
            eye(c, 0.155, 2.56 + DY, 0.08, { color: '#1b120c', look: 0.0 });
            eye(c, -0.155, 2.56 + DY, 0.08, { color: '#1b120c', look: 0.0 });
          },
        },
      ],
    },
    wing: W.wing,
    wing2: W.wing2,
  };
  return {
    id: 'pteranodon', parts,
    anchors: { head: [0, 2.9 + DY], mouth: [0, 3.85 + DY], eye: [0.15, 2.55 + DY], back: [0, 1.4 + DY], shoulderR: SH, shoulderL: [-SH[0], SH[1]], tipR: [3.0, 1.34 + DY], tipL: [-3.0, 1.34 + DY], foot: [0, 0.74 + DY] },
    meta: {
      name: 'Pteranodon', lengthM: 6, spanM: 6, epoch: 'Oberkreide', view: 'from-below',
      ranges: { wing: [0, 0.6], wing2: [0, -0.6] },
      flap: { wing: [-0.45, 0.6], wing2: [0.45, -0.6] },
    },
  };
}
