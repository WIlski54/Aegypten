// Australopithecus afarensis, juvenile, ~0.85 m. Big head, big eyes, round belly, tousled hair, curious and playful.
import { hominid } from './_f_hominid.js';

export default function make(opts = {}) {
  const pose = opts.pose === 'stand' ? 'stand' : 'walk';
  const h = hominid({
    id: 'afarensis_child', heightM: 0.85, pose,
    hipY: 0.40, shY: 0.735, lean: 0.14, tw: 1.08, lw: 1.12, belly: 1.45, hs: 1.28, armK: 0.95, legK: 0.9, tilt: 0.1,
    prog: 0.72, brow: 0.5, smile: 1.5, mouthOpen: 0.014, eyeR: 0.026, eyeLook: 0.35, ears: 1.35, hairStyle: 'c', footScale: 1.12, seed: 11,
    unitH: 1.12,
    poseAdj: pose === 'walk' ? { legA: { th: 0.42, sh: 0.16, psi: 0.08 }, legB: { th: -0.34, sh: -0.86, psi: -0.60 }, armA: { u: -0.45, f: -0.2 }, armB: { u: 0.9, f: 1.2 } } : { armB: { u: 0.5, f: 0.8 } },
    furCol: { top: '#7a5133', bottom: '#b88b52', dark: '#44281a', light: '#d2ab6e', hair: '#8f6740', hair2: '#6a4529' },
    skinCol: { top: '#c99a70', bottom: '#b0805a' },
  });
  return {
    id: 'afarensis_child', parts: h.parts, anchors: h.anchors,
    meta: {
      name: 'Australopithecus afarensis (Jungtier)', lengthM: 0.85, heightM: 0.85, pose,
      pivots: { armA: h.anchors.shoulder, armB: h.anchors.shoulder, legA: h.anchors.hip, legB: h.anchors.hip },
      ranges: pose === 'walk'
        ? { armA: [0, 0.9], armB: [0, -0.9], legA: [0, -0.6], legB: [0, 0.6] }
        : { armA: [0, 0.6], armB: [0, -0.6], legA: [0, 0.35], legB: [0, -0.35] },
    },
  };
}
