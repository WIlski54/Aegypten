// Australopithecus afarensis, male, ~1.4 m, Pliocene. Stronger build, heavy brow, fur mantle on the shoulders, calm dignified look.
import { hominid } from './_f_hominid.js';

export default function make(opts = {}) {
  const pose = opts.pose === 'stand' ? 'stand' : 'walk';
  const h = hominid({
    id: 'afarensis_m', heightM: 1.4, pose,
    hipY: 0.445, shY: 0.79, lean: 0.08, tw: 1.34, lw: 1.32, belly: 0.95, hs: 0.9, armK: 1.06, legK: 1.0,
    prog: 1.15, brow: 1.8, smile: 0.55, eyeR: 0.0215, eyeLook: 0.3, hairStyle: 'm', mane: 1.0, footScale: 1.08, seed: 7,
    poseAdj: pose === 'walk' ? { legA: { th: 0.44, sh: 0.17, psi: 0.08 }, legB: { th: -0.36, sh: -0.86, psi: -0.58 }, armA: { u: -0.32, f: -0.04 }, armB: { u: 0.34, f: 0.62 } } : {},
    furCol: { top: '#5f3e29', bottom: '#8f6a3e', dark: '#33200f', light: '#b8955f', hair: '#6e4a2c', hair2: '#4a2f1c' },
    skinCol: { top: '#b9875f', bottom: '#9b6a48' },
  });
  return {
    id: 'afarensis_m', parts: h.parts, anchors: h.anchors,
    meta: {
      name: 'Australopithecus afarensis (Männchen)', lengthM: 1.4, heightM: 1.4, pose,
      pivots: { armA: h.anchors.shoulder, armB: h.anchors.shoulder, legA: h.anchors.hip, legB: h.anchors.hip },
      ranges: pose === 'walk'
        ? { armA: [0, 0.7], armB: [0, -0.7], legA: [0, -0.58], legB: [0, 0.58] }
        : { armA: [0, 0.5], armB: [0, -0.5], legA: [0, 0.3], legB: [0, -0.3] },
    },
  };
}
