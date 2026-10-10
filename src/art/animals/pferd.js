// Streitwagenpferd (Equus caballus, Neues Reich), ~2,2 m lang, 1,5 m Widerrist: schlank, gewölbter Hals, Federbusch zwischen den Ohren,
// Zaumzeug mit Goldbeschlägen und buntes Satteltuch. Pferde kamen erst um 1600 v. Chr. mit den Hyksos nach Ägypten.
// Teile: body, neck (Hals + Kopf + Ohren + Mähne + Zaumzeug + Federbusch, Pivot Schulter; negativ = Kopf senkt sich), tail (Pivot Kruppe),
//        legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte, armA (nahes Vorderbein), armB (fernes) – Pivot Schulter.
// Optionen: opts.coat 'braun' (Standard) | 'schimmel' | 'rappe'; opts.cloth, opts.bridle, opts.plume (Standard true). Entwurf in cm; Blick nach +x.
import { kit } from './_t_kit.js';
import { buildEquid } from './_t_equid.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const coat = opts.coat || 'braun';
  const base = {
    braun: { top: '#8c4a27', mid: '#a95f34', low: '#c07d4a', leg: '#5a301c', far: '#4d2816', farB: '#6a3c24', furD: '#5a2c16', muzzle: '#c88a5a', earIn: '#e8a898', mane: '#2a1a14', maneLo: '#1a100c' },
    schimmel: { top: '#d8d4cc', mid: '#e8e4dc', low: '#f4f0e8', leg: '#cfcbc2', far: '#a8a49c', farB: '#c2beb4', furD: '#9a958c', muzzle: '#f2cfc4', earIn: '#f2b8aa', mane: '#b9b4aa', maneLo: '#8c877e' },
    rappe: { top: '#2c2624', mid: '#3d3532', low: '#52463f', leg: '#2a2321', far: '#1c1715', farB: '#2e2724', furD: '#120e0d', muzzle: '#5a4a42', earIn: '#b88a80', mane: '#14100f', maneLo: '#0a0807' },
  }[coat] || {};
  const C = { hoof: '#2e211b', strap: '#c0432e', cross: '#000', ink: 'rgba(55,30,20,.9)', ...base, eyeRing: '#f0dec0' };
  if (coat === 'braun') C.sock = '#f6edda';
  const P = { H: 148, LL: 76, L: 86, depth: 64, belly: 0.97, legW: 12, neckLen: 62, neckAng: 52, arch: 7, neckW: 36, headLen: 58, headAng: 58, headW: 1.0,
    earLen: 15, earAng: 84, mane: 'flow', tail: 'flow', cloth: opts.cloth !== false, bridle: opts.bridle !== false, plume: opts.plume !== false, C };
  const { parts, anchors } = buildEquid(K, P);
  const sw = [-0.3, 0.3];
  return {
    id: 'pferd', parts, anchors,
    meta: {
      name: 'Pferd (Streitwagenpferd)', lengthM: 2.2, heightM: 1.9, shoulderHeightM: 1.5, coat,
      ranges: { neck: [0, -0.35], tail: [0, 0.35], legA: [0, 0.3], legB: [0, -0.3], armA: [0, -0.3], armB: [0, 0.3] },
      swing: { neck: [-0.1, 0.1], tail: [-0.3, 0.3], legA: sw, legB: sw, armA: sw, armB: sw },
      gait: [['legB', 'armB'], ['legA', 'armA']],
    },
  };
}
