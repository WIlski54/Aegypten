// Uräus-Kobra (Naja haje, Ägyptische Kobra), ~40 cm hoch aufgerichtet: oliv-goldbraune Schuppen, aufgespreizte Haube, ruhiger Blick,
// kein Gruseln – die Schutzschlange der Pharaonenstirn. Kleiner Kopf mit freundlichem Auge, helle Kehle mit dunklem Querband.
// Teile: body (aufgerollter Schwanz, S-Kurve, Rumpf bis zum Haubenansatz), head (Haube + Kopf, Pivot am Haubenansatz;
//        negativ = Kobra neigt sich nach vorn, positiv = Kopf geht zurück). Optionen: opts.hood = 'weit' (Standard) | 'schmal'.
// Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { top: '#8f7d36', mid: '#b09a46', low: '#ecdca0', dark: '#5a4a1c', band: '#3b2d12', ink: 'rgba(60,48,15,.9)' };
  const hw = opts.hood === 'schmal' ? 0.62 : 1;
  const BASE = [3.5, 23]; // Haubenansatz / Pivot

  // ---- Körper: flach auf dem Boden, dann S-förmig nach oben ----
  const bodyC = [[-27, 1.6, 1.2], [-21, 2.6, 3.8], [-13, 4, 7], [-4, 4.6, 9.4], [6, 6, 10.6], [12, 11, 10.2], [10.5, 17, 9.4], [5, 21.5, 8.6], [3.5, 25, 8]];
  const bodyL = K.limb(bodyC, { per: 14 });

  // ---- Haube + Kopf ----
  const hoodC = [[3.5, 22, 8], [3, 27, 15 * hw], [3.6, 33, 17 * hw], [6.4, 38, 11 * hw]];
  const hood = K.limb(hoodC, { per: 12 });
  const headB = K.S(K.blob(10.5, 40.5, 6.2, 4.5, -0.12), K.blob(15.5, 39.4, 3.6, 2.8, -0.2));
  const headPart = {
    z: 1, pivot: K.pt(BASE), layers: [
      { shapes: K.S(hood, headB), fill: { stops: [[0, C.mid], [0.4, C.top], [0.75, C.top], [1, C.dark]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(40,30,5,.25)', light: 'rgba(255,245,190,.2)' });
          K.scaleMarks(c, bb, 'rgba(60,48,15,.55)', 2.6, { alpha: 0.35 });
          // helle Kehlseite der Haube vorn + dunkles Querband
          K.paintBlob(c, 9.2, 31.4, 2.0 * hw + 0.8, 7.6, 0.08, C.low, 0.9);
          K.curve(c, [[6.8, 27.2], [10, 28], [13, 27.4]], C.band, 1.8, { alpha: 0.85 });
          K.curve(c, [[7.5, 31.5], [10.5, 32.2]], 'rgba(120,100,40,.55)', 0.5);
          // Haubenzeichnung: zwei sanfte Bögen
          K.curve(c, [[-2, 28], [-1.6, 33], [1, 37]], 'rgba(60,48,15,.45)', 1.0);
          // Gesicht
          K.paintBlob(c, 12, 38.4, 4.4, 1.5, -0.15, C.low, 0.9);
          K.curve(c, [[19, 38.8], [15.5, 37.9], [12.4, 38.2]], 'rgba(50,38,10,.8)', 0.5);   // Mundlinie
          K.paintBlob(c, 18.2, 40.4, 0.45, 0.3, 0, '#2a1e08', 1);
          K.bead(c, 12.6, 41.2, 1.15, { color: '#120e04', ring: '#e8c24a', look: 0.2 });
        }, K.rim(K.S(hood, headB), { w: 0.18, color: C.ink })) },
    ],
  };

  const bodyLayers = [
    { shapes: K.S(bodyL), fill: { top: C.mid, bottom: C.top }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(40,30,5,.3)', light: 'rgba(255,245,190,.22)' });
        K.scaleMarks(c, bb, 'rgba(60,48,15,.55)', 2.6, { alpha: 0.35 });
        K.rings(c, bodyC, { step: 6.4, color: 'rgba(70,52,16,.6)', w: 2.0, alpha: 0.5, reach: 12, offset: 3, from: 0.0, to: 1 });
        // helle Bauchseite vorn am aufgerichteten Teil
      }, K.rim(K.S(bodyL), { w: 0.2, color: C.ink })) },
  ];

  return {
    id: 'kobra',
    parts: { head: headPart, body: { z: 2, layers: bodyLayers } },
    anchors: { head: K.pt([11, 40.5]), mouth: K.pt([18, 38.6]), eye: K.pt([12.4, 41.2]), back: K.pt([-4, 10]), foot: K.pt([0, 0]), base: K.pt(BASE) },
    meta: { name: 'Uräus-Kobra', heightM: 0.45, lengthM: 0.5, ranges: { head: [0, -0.35] }, swing: { head: [-0.12, 0.12] }, hood: opts.hood || 'weit' },
  };
}
