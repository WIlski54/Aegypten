// Dinosaurier-Ei (~0,2 m): cremig mit braunen Tupfen. Ein Teil: body.
import { poly, fillPoly, light } from './_b_kit.js';
import { EGG, eggOutline, eggSpots, paintSpots, paintShine, edgeLine } from './_b_egg.js';
import { volume } from '../paint.js';

export default function make(opts = {}) {
  const seed = opts.seed ?? 5; const cy = EGG.b;
  const spotsList = eggSpots(seed, 13);
  const outline = eggOutline(cy);
  return {
    id: 'egg',
    parts: {
      body: {
        z: 1,
        layers: [{
          shapes: [outline], fill: { top: '#f4e4ba', bottom: '#dcc18c' }, stroke: null,
          deco(c, bb) {
            volume(c, bb, { dark: 'rgba(120,70,20,0.28)', light: 'rgba(255,255,240,0.3)' });
            paintSpots(c, spotsList, cy);
            paintShine(c, cy);
            edgeLine(c, outline);
          },
        }],
      },
    },
    anchors: { top: [0, cy * 2], center: [0, cy], base: [0, 0], crack: [-0.01, cy * 1.7] },
    meta: { name: 'Dinosaurier-Ei', lengthM: 0.2, ranges: {} },
  };
}
