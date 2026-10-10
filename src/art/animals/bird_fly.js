// Kleine fliegende Vogelsilhouette (Kreide–Paläogen-Szene): ~0,3 m, schlicht, warmes Dunkelbraun.
// Teile: body, wing (nah, Pivot Schulter), wing2 (fern, Pivot Schulter). Flügelschlag: meta.ranges.wing / wing2.
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { soft, dot, featherAt, featherLayers, makeWing, scaleSpec } from './_a_kit.js';

const DEG = Math.PI / 180;

export default function make(opts = {}) {
  const C = { body: '#5d4030', bodyHi: '#7a5a44', wing: '#4b3326', wingTip: '#6e4f3b', far: '#3a271c', farTip: '#573c2c', beak: '#3a281d', eye: '#f3e3c4' };
  const y0 = 0.045;                       // Unterkante des Körpers knapp über y=0
  const torso = blob(0.0, y0 + 0.0, 0.072, 0.04, 0.1, 44);
  const neck = blob(0.052, y0 + 0.012, 0.03, 0.028, 0, 24);
  const head = blob(0.072, y0 + 0.02, 0.025, 0.024, 0, 28);
  const beak = poly([[0.088, y0 + 0.027], [0.124, y0 + 0.014], [0.09, y0 + 0.01]], 1);
  const tail = featherLayers(-0.06, y0 - 0.002, 3, (t) => ({ ang: (170 + t * 22) * DEG, len: 0.09 - Math.abs(t - 0.5) * 0.02, w: 0.03 }), () => [[0, C.body], [1, C.wingTip]], { rachis: null });

  const S = [0.012, y0 + 0.018];
  const mkWing = (far) => makeWing({
    S, theta: (104 * DEG) + (far ? 0.24 : 0), L: 0.1, handFrac: 0.5, nSec: 4, nPrim: 6, secLen: 0.075, primLen: 0.105, fw: 0.03,
    pal: (kind, i) => (far ? [[0, C.far], [1, C.farTip]] : [[0, C.wing], [0.6, C.wing], [1, C.wingTip]]), armFill: far ? C.far : C.wing, armW: [0.034, 0.022, 0.012], covers: 0, rachis: null,
  }).layers;

  const bodyLayers = tail.concat([
    { shapes: [torso, neck, head, beak], fill: { top: C.body, bottom: '#4a3224' },
      deco(c, bb) {
        soft(c, blob(0.01, y0 - 0.022, 0.06, 0.02, 0.05, 24), C.bodyHi, 0.012, 0.75);
        dot(c, 0.08, y0 + 0.027, 0.0055, C.eye, 1);
        volume(c, bb, { dark: 'rgba(30,15,5,0.2)', light: 'rgba(255,230,200,0.14)' });
      } },
  ]);
  const parts = {
    body: { z: 1, layers: bodyLayers },
    wing: { z: 3, pivot: S.slice(), layers: mkWing(false) },
    wing2: { z: 0, pivot: S.slice(), layers: mkWing(true) },
  };
  return scaleSpec({
    id: 'bird_fly',
    parts,
    anchors: { head: [0.07, y0 + 0.02], mouth: [0.124, y0 + 0.013], eye: [0.08, y0 + 0.027], back: [0.0, y0 + 0.04], shoulder: S.slice(), tailTip: [-0.15, y0 - 0.002], foot: [0.0, y0 - 0.03] },
    meta: { name: 'Kleiner Vogel (Flug)', lengthM: 0.3, period: 'Kreide/Paläogen',
      // wing/wing2: Ruhe 0 = Flügel oben (gezeichnet); + = Abschlag nach hinten/unten (gegen den Uhrzeigersinn), - = weiter anheben
      ranges: { wing: [0, 1.0], wing2: [0, 0.95] },
      swing: { wing: [-0.4, 1.0], wing2: [-0.4, 0.95] } },
  }, 1.05);
}
