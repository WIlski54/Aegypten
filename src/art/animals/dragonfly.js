// Libelle (Jura, Fluegelspannweite ~0,3 m): vier glasklar wirkende Fluegel mit Adern, schlanker Hinterleib. Seitenansicht, zwei sichtbare Fluegelpaare.
// Teile: body, wing (nahes Paar, vorn), wing2 (fernes Paar, hinten), Pivot am Thorax; Schlag = Drehung um den Thorax.
import { limb, blob, poly } from '../dsl.js';
import { volume, eye, line } from '../paint.js';
import { smooth, strokePath, fillPoly, glow, curve, outline, pearl, scaleSpec } from './_c_helpers.js';

const DEG = Math.PI / 180;

// one wing: root at P, direction alpha (rad), length L, max width W. Leading edge is the right-hand side of the direction.
function wingGeo(P, alpha, L, W, { root = 0.3 } = {}) {
  const dx = Math.cos(alpha), dy = Math.sin(alpha), nx = -dy, ny = dx;     // n = left of direction
  const sm = (x) => x * x * (3 - 2 * x);
  const half = (t) => { const bp = root + (1 - root) * sm(Math.min(1, t / 0.32)); const tp = t < 0.86 ? 1 : Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.86) / 0.14, 2))); return W * bp * tp; };
  const world = (u, v) => [P[0] + dx * u + nx * v, P[1] + dy * u + ny * v];
  const lead = [], trail = [];
  const N = 40;
  for (let k = 0; k <= N; k++) {
    const t = k / N, u = L * t, h = half(t);
    lead.push(world(u, -0.38 * h)); trail.push(world(u, 0.62 * h));
  }
  const outline_ = lead.concat(trail.reverse());
  // veins: longitudinal at fractions f of the chord (0 = costa), cross veins in between
  const fr = [0, 0.1, 0.3, 0.55, 0.8, 0.97];
  const longi = fr.map((f) => { const pts = []; for (let k = 0; k <= 30; k++) { const t = (k / 30) * 0.97, u = L * t, h = half(t); pts.push(world(u, -0.38 * h + f * h)); } return pts; });
  const cross = [];
  for (let k = 1; k < 12; k++) {
    const t = 0.08 + (k / 12) * 0.82, u = L * t, h = half(t);
    for (let j = 0; j < fr.length - 1; j++) {
      const jit = ((k * 7 + j * 5) % 6) / 6 * 0.03;
      cross.push([world(u + jit * L, -0.38 * h + fr[j] * h), world(u + (jit + 0.012) * L, -0.38 * h + fr[j + 1] * h)]);
    }
  }
  // pterostigma: dark cell on the leading edge near the tip
  const ps = [0.78, 0.88].map((t) => { const u = L * t, h = half(t); return [world(u, -0.38 * h), world(u, -0.38 * h + 0.11 * h)]; });
  const stigma = [ps[0][0], ps[1][0], ps[1][1], ps[0][1]];
  return { poly: outline_, longi, cross, stigma, root: world(0.0, 0) };
}

export default function make(opts = {}) {
  const OUT = 'rgba(25,55,60,.65)';
  const P1 = [0.125, 0.07], P2 = [0.118, 0.068];
  const Lw = 0.15;
  // near pair (steeper V), far pair (wider V)
  const nF = wingGeo(P1, 66 * DEG, Lw, 0.034), nH = wingGeo(P1, 114 * DEG, Lw * 0.97, 0.046, { root: 0.45 });
  const fF = wingGeo(P2, 44 * DEG, Lw * 0.96, 0.034), fH = wingGeo(P2, 138 * DEG, Lw * 0.93, 0.046, { root: 0.45 });

  const wingLayers = (geos, tint, veinCol, alpha) => {
    const shapes = geos.map((g) => g.poly);
    return [{
      shapes, fill: { top: tint[0], bottom: tint[1] }, stroke: null,
      deco: (c, bb) => {
        volume(c, bb, { dark: 'rgba(60,110,130,0.14)', light: 'rgba(255,255,255,0.35)' });
        pearl(c, bb, { alpha: 0.22, seed: 12, bands: 4 });
        for (const g of geos) {
          glow(c, g.root[0], g.root[1], 0.03, 0.03, 'rgba(235,170,60,1)', 0.5);                       // amber base
          for (const x of g.cross) strokePath(c, x, veinCol, 0.001, 0.4 * alpha);
          g.longi.forEach((l, i) => strokePath(c, l, veinCol, i === 0 ? 0.0034 : 0.0016, i === 0 ? 0.95 * alpha : 0.75 * alpha));
          fillPoly(c, g.stigma, '#3a2a14', 0.9);
        }
        outline(c, shapes, OUT, 0.0022);
      },
    }];
  };

  // ---- body ----
  const head = blob(0.176, 0.058, 0.024, 0.022);
  const thorax = blob(0.126, 0.058, 0.035, 0.028, 0.25);
  const abdCtrl = [[0.108, 0.054, 0.032], [0.06, 0.049, 0.021], [0.0, 0.046, 0.0145], [-0.05, 0.045, 0.0115], [-0.098, 0.044, 0.0075]];
  const abdomen = limb(abdCtrl, { per: 12 });
  const cerci = [limb([[-0.095, 0.046, 0.005], [-0.112, 0.056, 0.003]], { per: 4 }), limb([[-0.095, 0.043, 0.005], [-0.113, 0.036, 0.003]], { per: 4 })];
  const legs = [0.11, 0.128, 0.146].map((x, i) => limb([[x, 0.04, 0.0065], [x + 0.012 + i * 0.002, 0.02, 0.005], [x + 0.022 + i * 0.004, 0.003, 0.0035]], { per: 5 }));
  const bodyShapes = [head, thorax, abdomen].concat(cerci);
  const L = (shapes, fill, deco) => ({ shapes, fill, stroke: null, deco: (c, bb) => { if (deco) deco(c, bb); outline(c, shapes, OUT, 0.0028); } });

  return {
    id: 'dragonfly',
    parts: {
      body: {
        z: 1,
        layers: [
          L(legs, '#27434a', (c, bb) => volume(c, bb)),
          L(bodyShapes, { top: '#2f9a86', bottom: '#1f6270' }, (c, bb) => {
            volume(c, bb, { dark: 'rgba(5,30,40,0.25)', light: 'rgba(255,255,230,0.22)' });
            // yellow rings on the abdomen
            for (let i = 0; i < 9; i++) {
              const t = 0.12 + i * 0.1; const x = 0.1 - t * 0.2 * 1.0;
              const xx = 0.09 - i * 0.0215; const w = 0.0245 - i * 0.0014;
              strokePath(c, [[xx, 0.046 + w * 0.5], [xx - 0.003, 0.046 - w * 0.5]], '#f1dc4c', 0.0058, 0.95);
            }
            // thorax stripes
            strokePath(c, [[0.108, 0.078], [0.122, 0.04]], '#f1dc4c', 0.0075, 0.95);
            strokePath(c, [[0.128, 0.082], [0.141, 0.043]], '#f1dc4c', 0.0075, 0.95);
            glow(c, 0.13, 0.078, 0.03, 0.01, 'rgba(255,255,255,0.9)', 0.35);
            // big friendly compound eye
            eye(c, 0.182, 0.062, 0.0205, { color: '#10343a', white: '#7fd9d6', look: 0.35 });
          }),
        ],
      },
      wing2: { z: 0, pivot: P2, layers: wingLayers([fF, fH], ['#bcd6e0', '#e1eef0'], 'rgba(40,80,95,1)', 0.8) },
      wing: { z: 2, pivot: P1, layers: wingLayers([nF, nH], ['#cfe7ef', '#f4fbf8'], 'rgba(35,75,90,1)', 1) },
    },
    anchors: { head: [0.178, 0.058], eye: [0.182, 0.062], mouth: [0.2, 0.046], back: [0.126, 0.086], tail: [-0.112, 0.046], foot: [0.14, 0], thorax: P1 },
    meta: { name: 'Libelle (Jura)', lengthM: 0.3, spanM: 0.3, epoch: 'Jura', ranges: { wing: [0, 0.55], wing2: [0, 0.45] }, flap: { wing: [-0.35, 0.55], wing2: [-0.3, 0.45] } },
  };
}
