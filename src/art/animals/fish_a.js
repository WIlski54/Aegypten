// fish_a: kleiner schlanker, silbriger Knochenfisch (~0,25 m, Jura-Heringsfisch-Typ). Teile: body, tail (Pivot am Schwanzstiel).
import { limb, blob, poly } from '../dsl.js';
import { volume, eye } from '../paint.js';
import { smooth, strokePath, glow, curve, outline, fan, fishScales, scaleSpec } from './_c_helpers.js';

export default function make(opts = {}) {
  const OUT = 'rgba(35,50,70,.62)';
  const TP = [0.05, 0.056];
  const hull = smooth([
    [0.25, 0.056, 1], [0.238, 0.068], [0.212, 0.083], [0.172, 0.093], [0.125, 0.094], [0.088, 0.086], [0.062, 0.073], [0.046, 0.068],
    [0.042, 0.044], [0.062, 0.038], [0.09, 0.027], [0.125, 0.02], [0.17, 0.021], [0.21, 0.03], [0.238, 0.043],
  ], 8);
  const cap = blob(TP[0], TP[1], 0.0125, 0.0125);
  const dorsal = smooth([[0.145, 0.088], [0.128, 0.128], [0.108, 0.14, 1], [0.098, 0.118], [0.092, 0.086]], 6);
  const anal = smooth([[0.108, 0.03], [0.09, 0.0], [0.066, 0.004, 1], [0.068, 0.034]], 6);
  const pelvic = smooth([[0.15, 0.03], [0.14, 0.004], [0.118, 0.006, 1], [0.122, 0.03]], 6);
  const pect = smooth([[0.18, 0.062], [0.15, 0.052], [0.138, 0.036, 1], [0.162, 0.05], [0.172, 0.045]], 5);
  const tailFin = smooth([[0.056, 0.07], [0.022, 0.088], [-0.03, 0.108, 1], [-0.014, 0.075], [-0.004, 0.056], [-0.014, 0.037], [-0.03, 0.004, 1], [0.022, 0.024], [0.056, 0.042]], 7);
  const tailRoot = blob(TP[0], TP[1], 0.0118, 0.0118);

  const L = (shapes, fill, deco) => ({ shapes, fill, stroke: null, deco: (c, bb) => { if (deco) deco(c, bb); outline(c, shapes, OUT, 0.0022); } });
  const finFill = { top: '#e9a98f', bottom: '#f5d2bd' };
  const spec = {
    id: 'fish_a',
    parts: {
      body: {
        z: 1,
        layers: [
          L([dorsal, anal, pelvic], finFill, (c, bb) => {
            volume(c, bb);
            fan(c, [[0.145, 0.088], [0.092, 0.086]], [[0.128, 0.128], [0.098, 0.118]], 'rgba(150,70,50,.45)', 0.0016, 4);
            fan(c, [[0.108, 0.03], [0.068, 0.034]], [[0.09, 0.0], [0.066, 0.004]], 'rgba(150,70,50,.45)', 0.0016, 3);
          }),
          L([hull, cap], { stops: [[0, '#47678a'], [0.27, '#7a9bb8'], [0.52, '#c8d6e0'], [0.76, '#eef0ec'], [1, '#f6f3ea']], dir: 'v' }, (c, bb) => {
            volume(c, bb, { dark: 'rgba(30,50,80,0.14)', light: 'rgba(255,255,255,0.18)' });
            fishScales(c, bb, 'rgba(50,75,105,1)', { size: 0.0165, alpha: 0.3, x0: 0.04, x1: 0.19, y0: 0.022, y1: 0.092 });
            strokePath(c, curve([[0.05, 0.057], [0.12, 0.062], [0.185, 0.064]], 6), 'rgba(255,255,255,.6)', 0.005, 1);       // silver lateral band
            glow(c, 0.13, 0.088, 0.07, 0.014, 'rgba(255,255,255,0.9)', 0.35);
            strokePath(c, curve([[0.194, 0.084], [0.182, 0.052], [0.195, 0.024]], 6), 'rgba(40,60,85,.5)', 0.003, 1);       // gill cover
            strokePath(c, [[0.249, 0.055], [0.232, 0.05]], 'rgba(30,40,60,.8)', 0.003, 1);                                   // mouth
            glow(c, 0.19, 0.058, 0.014, 0.022, 'rgba(255,200,190,0.9)', 0.3);                                                 // pink cheek
            eye(c, 0.218, 0.064, 0.0135, { color: '#14181c', look: 0.35 });
          }),
          L([pect], { top: '#f2c3ad', bottom: '#f8dccb' }, (c, bb) => volume(c, bb)),
        ],
      },
      tail: {
        z: 0, pivot: TP,
        layers: [
          L([tailRoot, tailFin], { top: '#56789a', bottom: '#98b3c8' }, (c, bb) => {
            volume(c, bb);
            fan(c, [[0.05, 0.07], [0.0, 0.088], [-0.028, 0.108]], [[0.05, 0.056], [0.0, 0.056], [-0.004, 0.056]], 'rgba(30,55,85,.35)', 0.0015, 4);
            fan(c, [[0.05, 0.042], [0.0, 0.024], [-0.028, 0.004]], [[0.05, 0.056], [0.0, 0.056], [-0.004, 0.056]], 'rgba(30,55,85,.35)', 0.0015, 4);
          }),
        ],
      },
    },
    anchors: { head: [0.22, 0.06], mouth: [0.25, 0.055], eye: [0.218, 0.064], back: [0.12, 0.094], tail: [-0.03, 0.056], belly: [0.12, 0.02], foot: [0.12, 0.02] },
    meta: { name: 'Knochenfisch (Leptolepis-Typ)', lengthM: 0.25, epoch: 'Jura', ranges: { tail: [0, 0.5] }, flap: { tail: [-0.5, 0.5] } },
  };
  return scaleSpec(spec, 0.9);
}
