// Limulus (Pfeilschwanzkrebs, ~0,3 m): leicht schraege Aufsicht - Helm-Panzer mit hufeisenfoermigem Rand, Hinterleib mit Randstacheln,
// langer Schwanzstachel, Beine schauen unter dem Rand hervor. Teil: body.
import { limb, blob, poly } from '../dsl.js';
import { volume, eye, dot, scalesTexture } from '../paint.js';
import { smooth, strokePath, glow, curve, outline, scaleSpec } from './_c_helpers.js';

export default function make(opts = {}) {
  const OUT = 'rgba(45,28,8,.62)';
  // horseshoe flange (oblique top view): rounded front, pointed rear corners ("genal spines")
  const flange = smooth([
    [0.262, 0.056], [0.25, 0.092], [0.21, 0.114], [0.15, 0.122], [0.1, 0.112], [0.07, 0.094], [0.056, 0.082],
    [0.072, 0.064], [0.07, 0.04], [0.036, 0.022, 1], [0.1, 0.026], [0.16, 0.022], [0.218, 0.03], [0.252, 0.046],
  ], 8);
  // helmet dome on top
  const dome = smooth([[0.222, 0.05], [0.222, 0.08], [0.196, 0.125], [0.152, 0.148], [0.108, 0.136], [0.084, 0.104], [0.082, 0.07], [0.104, 0.05], [0.16, 0.044]], 8);
  // abdomen plate with spines
  const abd = smooth([[0.078, 0.078], [0.074, 0.048], [0.05, 0.024], [0.012, 0.022], [-0.014, 0.044], [-0.012, 0.074], [0.014, 0.094], [0.05, 0.094]], 6);
  const spines = [];
  [0.062, 0.04, 0.018, -0.004].forEach((x) => spines.push([[x + 0.009, 0.03], [x - 0.009, 0.023], [x - 0.014, 0.001]]));      // near-side spines (down)
  [0.058, 0.036, 0.014].forEach((x) => spines.push([[x + 0.008, 0.088], [x - 0.008, 0.094], [x - 0.012, 0.118]]));            // far-side spines (up)
  const telson = limb([[0.0, 0.055, 0.034], [-0.055, 0.05, 0.02], [-0.128, 0.04, 0.0]], { per: 10 });
  const legs = [];
  [0.1, 0.125, 0.15, 0.175, 0.2].forEach((x, i) => legs.push(limb([[x, 0.034, 0.012], [x + 0.005 - i * 0.002, 0.016, 0.01], [x - 0.006 + i * 0.004, 0.0, 0.006]], { per: 5 })));
  legs.push(limb([[0.235, 0.044, 0.015], [0.262, 0.026, 0.011], [0.275, 0.006, 0.007]], { per: 5 }));

  const L = (shapes, fill, deco) => ({ shapes, fill, stroke: null, deco: (c, bb) => { if (deco) deco(c, bb); outline(c, shapes, OUT, 0.0035); } });
  const spec = {
    id: 'limulus',
    parts: {
      body: {
        z: 1,
        layers: [
          L(legs, '#5a4423', (c, bb) => volume(c, bb)),
          L([telson], { top: '#8a7038', bottom: '#4f3d1c' }, (c, bb) => volume(c, bb)),
          L([abd].concat(spines), { top: '#8a7238', bottom: '#c3a25a' }, (c, bb) => {
            volume(c, bb);
            strokePath(c, [[0.07, 0.07], [0.03, 0.058], [-0.01, 0.06]], 'rgba(40,25,5,.4)', 0.004, 1);
            for (let k = 0; k < 4; k++) strokePath(c, [[0.062 - k * 0.019, 0.092], [0.058 - k * 0.019, 0.03]], 'rgba(40,25,5,.25)', 0.0035, 1);
            glow(c, 0.04, 0.082, 0.035, 0.016, 'rgba(255,240,180,0.8)', 0.4);
          }),
          L([flange], { stops: [[0, '#b69446'], [0.5, '#d4b567'], [1, '#e9d193']], dir: 'v' }, (c, bb) => {
            volume(c, bb, { dark: 'rgba(60,40,10,0.22)', light: 'rgba(255,248,210,0.15)' });
            strokePath(c, curve([[0.04, 0.03], [0.1, 0.034], [0.16, 0.03], [0.22, 0.038], [0.255, 0.052]], 6), 'rgba(80,55,15,.45)', 0.004, 1);
          }),
          L([dome], { stops: [[0, '#6a5628'], [0.5, '#8c7536'], [0.85, '#b39650'], [1, '#c8ae6c']], dir: 'v' }, (c, bb) => {
            volume(c, bb, { dark: 'rgba(40,25,5,0.2)', light: 'rgba(255,245,200,0.22)' });
            scalesTexture(c, bb, '#3d2e0e', { size: 0.016, alpha: 0.08 });
            strokePath(c, curve([[0.1, 0.1], [0.14, 0.14], [0.19, 0.126], [0.218, 0.078]], 6), 'rgba(50,35,8,.5)', 0.006, 1);   // median ridge
            strokePath(c, curve([[0.092, 0.08], [0.125, 0.112], [0.17, 0.11], [0.205, 0.068]], 6), 'rgba(50,35,8,.32)', 0.005, 1);
            glow(c, 0.15, 0.138, 0.06, 0.02, 'rgba(255,245,190,0.9)', 0.5);
            dot(c, 0.165, 0.142, 0.0035, '#2a2208', 0.9); dot(c, 0.148, 0.143, 0.0027, '#2a2208', 0.9);
            eye(c, 0.19, 0.098, 0.0125, { color: '#1a1408', look: 0.3 });
          }),
        ],
      },
    },
    anchors: { head: [0.2, 0.09], eye: [0.19, 0.098], mouth: [0.255, 0.04], back: [0.15, 0.148], tail: [-0.128, 0.04], foot: [0.15, 0] },
    meta: { name: 'Limulus (Pfeilschwanzkrebs)', lengthM: 0.32, epoch: 'Jura', ranges: {} },
  };
  return scaleSpec(spec, 0.8);
}
