// Miocene ape (Proconsul-like), ~0.7 m long, tailless, walks on all fours along branches. Very cute: big round head, big eyes.
// Parts: body (everything but the near arm), arm (near foreleg; pivot = shoulder; + = reach forward, - = swing back).
import { blob, limb, poly, xf } from '../dsl.js';
import { eye, volume } from '../paint.js';
import { tufts, furEdge, furStrokes, glow, curve } from './_f_common.js';

export default function make(opts = {}) {
  const C = { top: '#8a683a', bottom: '#dcc386', dark: '#4a3318', light: '#ecd9a0', skin: '#d6ab82', skinB: '#bd8d66', hand: '#6a5036', ear: '#e5a690' };
  const SH = [0.21, 0.35]; // shoulder pivot (near arm)

  // torso: back slightly arched, round tailless rump, deep chest
  const torso = poly([
    [-0.31, 0.30], [-0.28, 0.375], [-0.16, 0.415], [0.0, 0.43], [0.15, 0.455], [0.26, 0.44], [0.30, 0.37], [0.285, 0.29], [0.2, 0.225], [0.04, 0.2], [-0.12, 0.205], [-0.25, 0.23],
  ], 3);
  const bellyT = tufts([[0.2, 0.25], [0.12, 0.215], [0.02, 0.205], [-0.1, 0.208]], { step: 0.04, len: 0.04, w: 0.06, dir: [0, -1], jitter: 0.4, seed: 3, inset: 1.2 });
  const rumpT = tufts([[-0.42, 0.34], [-0.43, 0.28], [-0.39, 0.22]], { step: 0.04, len: 0.035, w: 0.06, radial: [-0.28, 0.3], jitter: 0.4, seed: 8, inset: 1.2 });

  // legs: near hind, far hind, far fore (near fore = arm part)
  const legHN = limb([[-0.17, 0.31, 0.19], [-0.13, 0.2, 0.12], [-0.155, 0.09, 0.09], [-0.15, 0.048, 0.08]]);
  const footHN = limb([[-0.15, 0.052, 0.08], [-0.09, 0.032, 0.066], [-0.04, 0.03, 0.046]]);
  const toesHN = [limb([[-0.07, 0.038, 0.038], [-0.035, 0.03, 0.032], [-0.012, 0.026, 0.022]]), limb([[-0.07, 0.044, 0.032], [-0.04, 0.044, 0.027], [-0.018, 0.04, 0.019]])];
  const legHF = limb([[-0.03, 0.31, 0.17], [0.01, 0.2, 0.11], [-0.02, 0.09, 0.082], [-0.01, 0.048, 0.074]]);
  const footHF = limb([[-0.01, 0.052, 0.074], [0.05, 0.032, 0.062], [0.1, 0.03, 0.044]]);
  const legFF = limb([[0.20, 0.34, 0.14], [0.17, 0.22, 0.095], [0.15, 0.11, 0.078], [0.15, 0.058, 0.072]]);
  const handFF = limb([[0.15, 0.057, 0.072], [0.195, 0.036, 0.06], [0.235, 0.032, 0.042]]);

  // head: enlarged (K) and moved up/forward; all head coordinates go through P()
  const HX = 0.015, HY = 0.045, K = 1.16, HC = [0.31, 0.43];
  const P = (x, y) => [HC[0] + (x + HX - HC[0]) * K, HC[1] + (y + HY - HC[1]) * K];
  const mv = (p) => p.map(([x, y]) => P(x, y));
  const skull = blob(...P(0.335, 0.435), 0.118 * K, 0.103 * K, 0.1);
  const muzzle = poly(mv([[0.38, 0.47], [0.44, 0.46], [0.495, 0.425], [0.50, 0.395], [0.47, 0.37], [0.42, 0.355], [0.37, 0.365], [0.36, 0.42]]), 2);
  const cheekT = tufts(mv([[0.30, 0.38], [0.34, 0.345], [0.38, 0.335]]), { step: 0.03, len: 0.04, w: 0.045, dir: [-0.5, -1], jitter: 0.4, seed: 5, inset: 1.2 });
  const crownT = tufts(mv([[0.25, 0.485], [0.3, 0.527], [0.36, 0.537], [0.41, 0.517]]), { step: 0.03, len: 0.035, w: 0.045, radial: P(0.33, 0.43), bias: [-0.2, 0.2], jitter: 0.45, seed: 6, inset: 1.2 });
  const ear = blob(...P(0.265, 0.455), 0.042 * K, 0.048 * K, 0.1);
  const earIn = blob(...P(0.268, 0.455), 0.024 * K, 0.03 * K, 0.1);
  const earF = blob(...P(0.315, 0.50), 0.04 * K, 0.045 * K, 0);
  const neck = limb([[0.2, 0.37, 0.22], [0.29, 0.44, 0.19], [0.35, 0.47, 0.17]]);

  const dark = (c, a = 0.14) => { c.ctx.save(); c.ctx.fillStyle = `rgba(30,22,10,${a})`; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore(); };
  const strokes = (c, bb, k = 1) => {
    furStrokes(c, bb, C.dark, Math.round(30 * k), { len: 0.05, w: 0.0085, ang: -Math.PI / 2 - 0.35, alpha: 0.32, seed: 2 });
    furStrokes(c, bb, C.light, Math.round(22 * k), { len: 0.045, w: 0.0075, ang: -Math.PI / 2 - 0.35, alpha: 0.28, seed: 3 });
  };

  const body = {
    z: 1,
    layers: [
      { shapes: [legHF, footHF, legFF, handFF], fill: { top: '#6a4e2c', bottom: '#9a7c4e' }, deco: (c, bb) => { volume(c, bb); } },
      { shapes: [earF], fill: '#6a4e2c', stroke: null },
      { shapes: [legHN, footHN, ...toesHN], fill: { top: C.top, bottom: '#b09462' }, deco: (c, bb) => { volume(c, bb, { dark: 'rgba(40,25,10,.3)' }); strokes(c, bb, 0.6); } },
      {
        shapes: [torso, neck, ...bellyT], fill: { top: C.top, bottom: C.bottom },
        deco: (c, bb) => { volume(c, bb, { dark: 'rgba(40,25,10,0.28)' }); glow(c, 0.0, 0.24, 0.3, 0.08, C.light, 0.45); strokes(c, bb, 1.0); },
      },
      { shapes: [ear], fill: { top: C.top, bottom: C.ear }, deco: () => { } },
      { shapes: [earIn], fill: C.ear, stroke: null },
      {
        shapes: [skull, ...cheekT, ...crownT], fill: { top: '#6e5230', bottom: '#a58455' },
        deco: (c, bb) => { furStrokes(c, bb, C.dark, 18, { len: 0.04, w: 0.007, ang: Math.PI + 0.7, alpha: 0.4, seed: 7 }); furStrokes(c, bb, C.light, 14, { len: 0.04, w: 0.006, ang: Math.PI + 0.7, alpha: 0.3, seed: 8 }); },
      },
      {
        // bare face mask: muzzle + eye area
        shapes: [muzzle, blob(...P(0.395, 0.445), 0.062 * K, 0.06 * K)], fill: { top: C.skin, bottom: C.skinB },
        deco: (c, bb) => {
          const p = (x, y) => P(x, y);
          glow(c, ...p(0.37, 0.4), 0.05 * K, 0.035 * K, '#e68f80', 0.4);
          curve(c, [p(0.373, 0.488), p(0.405, 0.495), p(0.435, 0.478)], C.dark, 0.011 * K, { alpha: 0.9 }); // brow
          eye(c, ...p(0.405, 0.452), 0.034 * K, { color: '#2a1a0c', white: '#fff7e2', look: 0.3 });
          curve(c, [p(0.388, 0.43), p(0.405, 0.424), p(0.425, 0.43)], '#9a6a48', 0.004, { alpha: 0.6 });
          // nostril + smile
          c.ctx.save(); c.ctx.fillStyle = 'rgba(60,35,22,.9)'; c.ctx.beginPath(); const [X, Y] = c.tf(...p(0.487, 0.41)); c.ctx.ellipse(X, Y, 0.007 * c.S, 0.005 * c.S, 0.5, 0, 6.2832); c.ctx.fill(); c.ctx.restore();
          curve(c, [p(0.488, 0.385), p(0.46, 0.372), p(0.425, 0.375), p(0.405, 0.388)], '#6a3a2a', 0.0065, { alpha: 0.9 });
        },
      },
    ],
  };
  // near arm: z in front of the body, pivot at the shoulder; reaching down/forward, hand curled
  const armC = [[SH[0], SH[1], 0.14], [SH[0] + 0.04, 0.22, 0.10], [SH[0] + 0.07, 0.115, 0.082], [SH[0] + 0.075, 0.058, 0.075]];
  const armHand = [limb([[SH[0] + 0.075, 0.06, 0.075], [SH[0] + 0.12, 0.038, 0.062], [SH[0] + 0.16, 0.034, 0.042]]), limb([[SH[0] + 0.125, 0.044, 0.032], [SH[0] + 0.153, 0.04, 0.027], [SH[0] + 0.172, 0.034, 0.019]])];
  const armT = furEdge(armC, -1, { step: 0.035, len: 0.025, gravity: 0.6, from: 0.2, to: 0.85, seed: 12, bias: [-0.1, 0], w: 0.05, over: 1.4 });
  const arm = {
    z: 2, pivot: SH,
    layers: [
      { shapes: [limb(armC), ...armT], fill: { top: C.top, bottom: '#b49a68' }, deco: (c, bb) => { volume(c, bb, { dark: 'rgba(40,25,10,.3)' }); strokes(c, bb, 0.5); } },
      { shapes: armHand, fill: { top: '#7a5e40', bottom: C.hand } },
    ],
  };
  return {
    id: 'miocene_ape', parts: { body, arm },
    anchors: { head: P(0.38, 0.45), mouth: P(0.47, 0.385), eye: P(0.405, 0.452), back: [-0.05, 0.4], foot: [-0.1, 0], shoulder: SH },
    meta: { name: 'Früher Menschenaffe (Proconsul-artig)', lengthM: 0.75, heightM: 0.6, pivots: { arm: SH }, ranges: { arm: [0, 0.85] }, backRange: { arm: -0.45 } },
  };
}
