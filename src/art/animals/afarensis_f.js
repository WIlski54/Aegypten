// Australopithecus afarensis, female ("Lucy"), ~1.05 m, Pliocene. Upright, slightly stooped, long arms, covered in brown fur.
import { hominid } from './_f_hominid.js';

export default function make(opts = {}) {
  const pose = opts.pose === 'stand' ? 'stand' : 'walk';
  const h = hominid({
    id: 'afarensis_f', heightM: 1.05, pose,
    hipY: 0.44, shY: 0.775, lean: 0.10, tw: 1.2, lw: 1.15, belly: 1.25, hs: 0.95, armK: 1.0, legK: 1.0,
    prog: 1.0, brow: 1.4, smile: 1.0, eyeR: 0.0215, hairStyle: 'f', seed: 3,
    furCol: { top: '#6e4832', bottom: '#a07846', dark: '#3b2415', light: '#c9a066', hair: '#7c5636', hair2: '#5b3a25' },
  });
  return {
    id: 'afarensis_f', parts: h.parts, anchors: h.anchors,
    meta: {
      name: 'Australopithecus afarensis (Weibchen, „Lucy“)', lengthM: 1.05, heightM: 1.05, pose,
      pivots: { armA: h.anchors.shoulder, armB: h.anchors.shoulder, legA: h.anchors.hip, legB: h.anchors.hip },
      ranges: pose === 'walk'
        ? { armA: [0, 0.8], armB: [0, -0.8], legA: [0, -0.62], legB: [0, 0.62] }
        : { armA: [0, 0.5], armB: [0, -0.5], legA: [0, 0.32], legB: [0, -0.32] },
    },
  };
}
