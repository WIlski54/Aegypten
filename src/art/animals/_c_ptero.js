// Shared builder for the two pterosaurs (view from below/front, symmetric). Wings pivot at the shoulders and flap IN THE PAPER PLANE.
// wing  = right wing (+x): positive angle (counter-clockwise) raises the tip.
// wing2 = left wing  (-x): mirror image: negative angle raises the tip.
import { limb, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { curve, mirrorX, resample, strokePath, fillPoly, glow } from './_c_helpers.js';

const shiftPts = (pts, dy) => pts.map(([x, y, ...r]) => [x, y + dy, ...r]);
const flipPts = (pts) => pts.map(([x, y, ...r]) => [-x, y, ...r]);

// cfg: { sh, lead, trail, arm, finger, claws:[ctrl,...], colors:{memTop,memBot,bone,boneHi,fibre}, fibres, dy, hideX }
export function pteroWingParts(cfg) {
  const dy = cfg.dy || 0;
  const col = Object.assign({ memTop: '#e8c08a', memBot: '#f7e3bf', bone: '#6b4a36', boneHi: 'rgba(255,230,190,.45)', fibre: 'rgba(110,60,30,.22)', tip: 'rgba(90,40,25,0.6)' }, cfg.colors);
  const build = (side) => {
    const F = (pts) => shiftPts(side > 0 ? pts : flipPts(pts), dy);
    const sh = F([cfg.sh])[0];
    const lead = curve(F(cfg.lead).map((p) => [p[0], p[1]]), 12);
    const trail = curve(F(cfg.trail).map((p) => [p[0], p[1]]), 12);
    const last = F(cfg.trail).slice(-1)[0];
    const hid = side > 0 ? 0.0 : -0.0;
    const membrane = lead.concat(trail, [[hid, last[1]], [hid, sh[1]]]);
    const arm = limb(F(cfg.arm), { per: 10 });
    const finger = limb(F(cfg.finger), { per: 12 });
    const wr = F([cfg.finger[0]])[0];
    const knob = blob(wr[0], wr[1], wr[2] * 0.62, wr[2] * 0.62);
    const claws = (cfg.claws || []).map((cl) => limb(F(cl), { per: 6 }));
    const root = blob(sh[0], sh[1], cfg.arm[0][2] * 0.6, cfg.arm[0][2] * 0.6);
    // fibre lines: fan from the leading bones to the trailing edge
    const Ls = resample(lead, 60), Ts = resample(trail.slice().reverse(), 60);
    const fibres = [];
    const N = cfg.fibres || 9;
    for (let k = 1; k <= N; k++) {
      const f = (k / (N + 1)) * 0.96 + 0.02;
      const a = Ls[Math.round(f * 59)], b = Ts[Math.round(f * 59)];
      fibres.push([[a[0] + (b[0] - a[0]) * 0.12, a[1] + (b[1] - a[1]) * 0.12], [b[0] - (b[0] - a[0]) * 0.03, b[1] - (b[1] - a[1]) * 0.03]]);
    }
    const boneLine = F(cfg.arm).map((p) => [p[0], p[1]]).concat(F(cfg.finger).slice(1).map((p) => [p[0], p[1]]));
    const layers = [
      {
        shapes: [membrane], fill: { top: col.memTop, bottom: col.memBot },
        deco: (c, bb) => {
          volume(c, bb, { dark: 'rgba(120,70,30,0.16)', light: 'rgba(255,250,225,0.2)' });
          for (const f of fibres) strokePath(c, f, col.fibre, Math.max(0.006, bb.w * 0.0035), 1);
          glow(c, sh[0] + side * 0.5, sh[1] - 0.25 * (cfg.span || 1), 0.7 * (cfg.span || 1), 0.4 * (cfg.span || 1), 'rgba(255,245,215,0.9)', 0.3);
          // bold dark wing tips
          const tp = Ls[53], sp = cfg.span || 1;
          glow(c, tp[0], tp[1], 0.26 * sp, 0.2 * sp, col.tip, 0.85);
        },
      },
      {
        shapes: [root, arm, finger, knob].concat(claws), fill: { top: col.bone, bottom: col.bone },
        deco: (c) => {
          strokePath(c, boneLine, col.boneHi, Math.max(0.01, (cfg.arm[0][2]) * 0.14), 1);
        },
      },
    ];
    return { sh, layers };
  };
  const R = build(1), L = build(-1);
  return {
    wing: { z: 0, pivot: R.sh, layers: R.layers },
    wing2: { z: 0.5, pivot: L.sh, layers: L.layers },
  };
}

// symmetric closed outline from the right half (top -> bottom, x >= 0); points with x==0 are shared
export function symOutline(half) {
  const right = half.map((p) => p.slice());
  const left = [];
  for (let i = half.length - 1; i >= 0; i--) { if (half[i][0] === 0) continue; left.push([-half[i][0], half[i][1], half[i][2]]); }
  return right.concat(left);
}
