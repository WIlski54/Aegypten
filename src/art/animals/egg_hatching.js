// Schluepfendes Ei (~0,2 m): bottom = untere Schale mit gezacktem Rand, cap = Deckel (Pivot am hinteren Eispitzen-Rand), klappt nach oben auf.
// opts.variant (0..n) variiert die Risse im Deckel, opts.seed die Tupfen.
import { poly, fillPoly, strokePoly, light, dark } from './_b_kit.js';
import { EGG, eggArc, eggTop, eggSpots, paintSpots, paintShine, zigLine, paintCracks, edgeLine } from './_b_egg.js';
import { volume } from '../paint.js';

export default function make(opts = {}) {
  const variant = opts.variant ?? 0; const seed = opts.seed ?? 5; const e = EGG; const cy = e.b;
  const spotsList = eggSpots(seed, 13);
  const rim = zigLine(cy, e, 0.0155, 6, 3 + (opts.rimSeed ?? 0)); // Zackenlinie links -> rechts
  const capPts = eggArc(-e.a, e.a, true, 44, e).map(([x, y]) => [x, y + cy]).concat(rim.slice().reverse());
  const botPts = rim.concat(eggArc(e.a, -e.a, false, 44, e).map(([x, y]) => [x, y + cy]).slice(1, -1));
  // kleine Haltezunge am Scharnier: ragt unter die Bodenschale, damit beim Aufklappen keine Luecke klafft
  const hinge = [-e.a + 0.0, cy];
  const tab = poly([[-e.a + 0.004, cy + 0.004], [-e.a + 0.028, cy + 0.002], [-e.a + 0.03, cy - 0.016], [-e.a + 0.008, cy - 0.012]], 1);
  const inner = rim.concat(rim.slice().reverse().map(([x, y]) => [x, y - 0.009 * Math.max(0.2, 1 - Math.abs(x / e.a) ** 3)]));
  return {
    id: 'egg_hatching',
    parts: {
      bottom: {
        z: 1, layers: [{
          shapes: [botPts], fill: { top: '#ecd9a8', bottom: '#d6b982' }, stroke: null,
          deco(c, bb) {
            volume(c, bb, { dark: 'rgba(120,70,20,0.3)', light: 'rgba(255,255,240,0.2)' });
            paintSpots(c, spotsList, cy);
            fillPoly(c, inner, '#f8e8c4', 0.92);   // heller Saum = Schaleninnenseite am Rand
            edgeLine(c, botPts);
          },
        }],
      },
      cap: {
        z: 2, pivot: hinge, layers: [{
          shapes: [capPts], fill: { top: '#f4e4ba', bottom: '#e3cb98' }, stroke: null,
          deco(c, bb) {
            volume(c, bb, { dark: 'rgba(120,70,20,0.22)', light: 'rgba(255,255,240,0.3)' });
            paintSpots(c, spotsList, cy);
            paintShine(c, cy);
            paintCracks(c, cy, variant);
            edgeLine(c, capPts);
          },
        }],
      },
    },
    anchors: { top: [0, cy + e.b], crack: [-0.012, cy + e.b * 0.9], rim: [0.02, cy], hinge, center: [0, cy], base: [0, 0] },
    meta: { name: 'Schluepfendes Dinosaurier-Ei', lengthM: 0.2, ranges: { cap: [0, 1.1] } },
  };
}
