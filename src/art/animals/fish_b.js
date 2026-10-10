// fish_b: Fisch mit langer Schnauze, Aspidorhynchus-artig (~0,6 m): Schnabelkiefer, Rautenschuppen, Rueckenflosse weit hinten. Teile: body, tail (Pivot am Schwanzstiel).
import { limb, blob, poly } from '../dsl.js';
import { volume, eye } from '../paint.js';
import { smooth, strokePath, glow, curve, outline, fan, ganoid } from './_c_helpers.js';

export default function make(opts = {}) {
  const OUT = 'rgba(40,40,15,.62)';
  const DY = 0.012;
  const S = (pts) => pts.map(([x, y, ...r]) => [x, y + DY, ...r]);
  const D = (pts) => pts.map(([x, y, ...r]) => [x, 0.056 + (y - 0.056) * 1.18, ...r]);   // a bit deeper body for charm
  const TP = [0.095, 0.056 + DY];
  const hull = smooth(S(D([
    [0.11, 0.063], [0.17, 0.075], [0.25, 0.087], [0.34, 0.093], [0.42, 0.091], [0.47, 0.082], [0.5, 0.07], [0.508, 0.058], [0.52, 0.05, 1],
    [0.49, 0.041], [0.46, 0.033], [0.42, 0.025], [0.34, 0.021], [0.25, 0.027], [0.17, 0.039], [0.11, 0.046], [0.088, 0.046], [0.088, 0.066],
  ])), 8);
  const cap = blob(TP[0], TP[1], 0.0115, 0.0115);
  const rostrum = limb(S([[0.45, 0.072, 0.044], [0.51, 0.064, 0.026], [0.565, 0.059, 0.014], [0.612, 0.057, 0.0]]), { per: 10 });
  const dorsal = smooth(S([[0.22, 0.084], [0.185, 0.134, 1], [0.165, 0.128], [0.15, 0.075]]), 6);
  const anal = smooth(S([[0.2, 0.034], [0.172, -0.005, 1], [0.146, 0.0], [0.142, 0.04]]), 6);
  const pelvic = smooth(S([[0.31, 0.03], [0.292, 0.002, 1], [0.27, 0.008], [0.278, 0.032]]), 6);
  const pect = smooth(S([[0.385, 0.044], [0.352, 0.03], [0.336, 0.012, 1], [0.364, 0.03], [0.376, 0.028]]), 5);
  const tailFin = smooth(S([[0.1, 0.07], [0.06, 0.088], [0.0, 0.12, 1], [0.022, 0.078], [0.03, 0.056], [0.022, 0.034], [0.0, -0.004, 1], [0.06, 0.026], [0.1, 0.042]]), 7);
  const tailRoot = blob(TP[0], TP[1], 0.011, 0.011);

  const L = (shapes, fill, deco) => ({ shapes, fill, stroke: null, deco: (c, bb) => { if (deco) deco(c, bb); outline(c, shapes, OUT, 0.003); } });
  const finFill = { top: '#e0903f', bottom: '#f0c06e' };
  return {
    id: 'fish_b',
    parts: {
      body: {
        z: 1,
        layers: [
          L([dorsal, anal, pelvic], finFill, (c, bb) => {
            volume(c, bb);
            fan(c, S([[0.22, 0.084], [0.15, 0.075]]), S([[0.185, 0.134], [0.165, 0.128]]), 'rgba(140,70,20,.45)', 0.002, 4);
            fan(c, S([[0.2, 0.034], [0.142, 0.04]]), S([[0.172, -0.005], [0.146, 0.0]]), 'rgba(140,70,20,.45)', 0.002, 4);
          }),
          L([hull, cap, rostrum], { stops: [[0, '#5f7236'], [0.3, '#8a9440'], [0.55, '#d4c264'], [0.78, '#efdc92'], [1, '#f5e8b8']], dir: 'v' }, (c, bb) => {
            volume(c, bb, { dark: 'rgba(60,50,10,0.14)', light: 'rgba(255,250,210,0.18)' });
            ganoid(c, { x0: 0.09, x1: 0.46, y0: 0.03 + DY, y1: 0.092 + DY, w: 0.37, h: 0.062 }, 'rgba(70,60,15,1)', { size: 0.026, alpha: 0.3, slant: 0.9 });
            strokePath(c, curve(S([[0.1, 0.057], [0.25, 0.063], [0.4, 0.066]]), 6), 'rgba(255,250,215,.6)', 0.006, 1);
            glow(c, 0.3, 0.09 + DY, 0.15, 0.013, 'rgba(255,255,230,0.9)', 0.3);
            strokePath(c, curve(S([[0.41, 0.092], [0.398, 0.062], [0.408, 0.034]]), 6), 'rgba(60,50,15,.38)', 0.0025, 1);        // gill cover
            strokePath(c, S([[0.518, 0.051], [0.49, 0.054], [0.455, 0.052]]), 'rgba(40,30,10,.8)', 0.003, 1);                  // mouth line
            eye(c, 0.438, 0.068 + DY, 0.0135, { color: '#14181c', look: 0.4 });
          }),
          L([pect], { top: '#e9a455', bottom: '#f5cf86' }, (c, bb) => volume(c, bb)),
        ],
      },
      tail: {
        z: 0, pivot: TP,
        layers: [
          L([tailRoot, tailFin], { top: '#cf8a38', bottom: '#f0c670' }, (c, bb) => {
            volume(c, bb);
            fan(c, S([[0.1, 0.07], [0.04, 0.09], [0.0, 0.12]]), S([[0.1, 0.056], [0.03, 0.056], [0.02, 0.056]]), 'rgba(120,60,15,.35)', 0.002, 5);
            fan(c, S([[0.1, 0.042], [0.04, 0.022], [0.0, -0.004]]), S([[0.1, 0.056], [0.03, 0.056], [0.02, 0.056]]), 'rgba(120,60,15,.35)', 0.002, 5);
          }),
        ],
      },
    },
    anchors: { head: [0.46, 0.07 + DY], mouth: [0.612, 0.057 + DY], eye: [0.438, 0.068 + DY], back: [0.3, 0.093 + DY], tail: [0.0, 0.056 + DY], belly: [0.3, 0.021 + DY], foot: [0.3, 0.021 + DY] },
    meta: { name: 'Schnabelfisch (Aspidorhynchus-Typ)', lengthM: 0.6, epoch: 'Jura', ranges: { tail: [0, 0.5] }, flap: { tail: [-0.5, 0.5] } },
  };
}
