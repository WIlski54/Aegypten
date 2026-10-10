// Esel (Equus africanus asinus), ~1,4 m lang, 1,1 m Schulterhöhe: graubraun, helle Schnauze und heller Bauch, dunkles Schulterkreuz,
// lange Ohren mit dunklen Spitzen, kurze aufrechte Mähne, Quastenschwanz. Das Lasttier des Alten Ägypten.
// Teile: body, neck (Hals + Kopf + Ohren + Mähne, Pivot Schulter; negativ = Kopf senkt sich), tail (Pivot Kruppe),
//        legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte, armA (nahes Vorderbein), armB (fernes) – Pivot Schulter.
// Entwurf in cm; Blick nach +x, Boden y = 0. Optionen: opts.sock = true (helle Fesseln).
import { kit } from './_t_kit.js';
import { buildEquid } from './_t_equid.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { top: '#9b9187', mid: '#b4a99c', low: '#ebe3d2', leg: '#9a9086', far: '#6f675f', farB: '#8d857b', hoof: '#3a3430', mane: '#4a423c', maneLo: '#2b2622',
    muzzle: '#f1e8d6', earIn: '#ecc9c0', earTip: '#3a332e', furD: '#5f564d', cross: '#3d352f', ink: 'rgba(60,50,45,.9)', eyeRing: '#efe2c8' };
  if (opts.sock) C.sock = '#f4ecdc';
  const P = { H: 112, LL: 54, L: 58, depth: 50, belly: 1.0, legW: 8.4, neckLen: 36, neckAng: 42, arch: 1, neckW: 22, headLen: 50, headAng: 36, headW: 1.25,
    earLen: 26, earAng: 80, mane: 'short', tail: 'rope', shoulderCross: true, C };
  const { parts, anchors } = buildEquid(K, P);
  const sw = [-0.3, 0.3];
  return {
    id: 'esel', parts, anchors,
    meta: {
      name: 'Esel', lengthM: 1.4, heightM: 1.35, shoulderHeightM: 1.1,
      ranges: { neck: [0, -0.4], tail: [0, 0.35], legA: [0, 0.3], legB: [0, -0.3], armA: [0, -0.3], armB: [0, 0.3] },
      swing: { neck: [-0.1, 0.1], tail: [-0.3, 0.3], legA: sw, legB: sw, armA: sw, armB: sw },
      gait: [['legB', 'armB'], ['legA', 'armA']],
    },
  };
}
