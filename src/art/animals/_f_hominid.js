// Group F: shared builder for the Australopithecus afarensis family (female "Lucy", male, child).
// Everything is drawn in a unit frame (standing height ~1) and scaled to METERS at the end. Facing +x.
// Parts: body (trunk+head), armA/armB (pivot = shoulder), legA/legB (pivot = hip). A = near side (in front), B = far side (behind).
import { blob, limb, poly, xf } from '../dsl.js';
import { eye, volume } from '../paint.js';
import { furEdge, tufts, furStrokes, glow, curve, lock, down, scl, sclC } from './_f_common.js';

const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

// ---- walking / standing pose tables (angles from straight down; + = forward / counter-clockwise) ----
const POSES = {
  walk: {
    hipDrop: 0.018, leanAdd: 0.0,
    legA: { th: 0.48, sh: 0.20, psi: 0.10 }, legB: { th: -0.40, sh: -0.90, psi: -0.60 },
    armA: { u: -0.40, f: -0.10 }, armB: { u: 0.40, f: 0.80 },
  },
  stand: {
    hipDrop: 0.0, leanAdd: 0.0,
    legA: { th: 0.05, sh: -0.04, psi: 0.0 }, legB: { th: 0.22, sh: -0.02, psi: 0.0 },
    armA: { u: -0.04, f: 0.10 }, armB: { u: 0.20, f: 0.34 },
  },
};

// Two-pass: build once, measure the lowest foot point, rebuild shifted so the lowest point sits exactly on the ground (y = 0).
export function hominid(o) {
  const first = buildHominid(o, 0);
  return Math.abs(first._minY) < 1e-6 ? first : buildHominid(o, -first._minY);
}

function buildHominid(o, yShift) {
  const {
    id, name, heightM, pose = 'walk',
    // proportions (unit frame)
    hipY = 0.44, shY = 0.775, lean = 0.13, tw = 1, lw = 1, belly = 1, hs = 0.88, armK = 1, legK = 1,
    prog = 1, brow = 1, tilt = 0, smile = 1, eyeR = 0.0215, eyeLook = 0.3, mouthOpen = 0,
    hairStyle = 'f', furCol = {}, skinCol = {}, poseAdj = {}, ears = 1, mane = 0, footScale = 1,
    unitH = 1.02, seed = 1,
  } = o;
  const U = heightM / unitH; // unit -> meters
  const F = Object.assign({ top: '#6a4530', bottom: '#9a7144', dark: '#3a2414', light: '#c49c62', hair: '#5a3b26', hair2: '#3a2414' }, furCol);
  const SK = Object.assign({ top: '#c2926a', bottom: '#a97852', dark: '#7a4d34', lip: '#8a4a3a' }, skinCol);
  const P0 = Object.assign({}, POSES[pose] || POSES.walk);
  const PS = {};
  for (const k of ['legA', 'legB', 'armA', 'armB']) PS[k] = Object.assign({}, P0[k], (poseAdj && poseAdj[k]) || {});
  const hipDrop = (poseAdj && poseAdj.hipDrop != null) ? poseAdj.hipDrop : P0.hipDrop;
  const hy = hipY - hipDrop + yShift;
  const ln = lean + (P0.leanAdd || 0);
  const Hp = [0, hy];
  const torsoLen = (shY - hipY) / Math.cos(ln);
  const Sp = [torsoLen * Math.sin(ln), shY - hipDrop * 0.5 + yShift];
  const sp = (t) => lerp2(Hp, Sp, t);
  const sc = (p) => scl(p, U);
  const scC = (c) => sclC(c, U);
  const m = (p) => [p[0] * U, p[1] * U];

  // ---------------------------------------------------------------- TORSO
  const torsoCtrl = [
    [Hp[0] - 0.012, Hp[1] - 0.005, 0.16 * tw],
    [sp(0.30)[0] + 0.012, sp(0.30)[1], 0.172 * tw],
    [sp(0.66)[0] + 0.010, sp(0.66)[1], 0.182 * tw],
    [Sp[0] + 0.004, Sp[1] + 0.010, 0.16 * tw],
    [Sp[0] + 0.030, Sp[1] + 0.050, 0.115],
  ];
  const torso = limb(torsoCtrl);
  const bellyB = blob(sp(0.26)[0] + 0.03, sp(0.26)[1], 0.078 * belly * tw, 0.078 * belly, 0.1);
  const rump = blob(Hp[0] - 0.046, Hp[1] + 0.025, 0.07 * tw, 0.075, 0);
  const mantle = blob(Sp[0] - 0.005, Sp[1] + 0.008, 0.085 * tw, 0.06, 0.15);
  const N = [Sp[0] + 0.035, Sp[1] + 0.055];
  // fur fringes: back of torso (travel up => sgn +1 is the back), hip "shorts", belly, mantle
  const furBack = furEdge(torsoCtrl, +1, { step: 0.03, len: 0.034, gravity: 0.55, from: 0.05, to: 0.95, seed: seed + 1, bias: [-0.1, 0] });
  const furFront = furEdge(torsoCtrl, -1, { step: 0.034, len: 0.026, gravity: 0.65, from: 0.02, to: 0.5, seed: seed + 2 });
  const shorts = tufts([[Hp[0] - 0.11, Hp[1] - 0.025], [Hp[0] - 0.05, Hp[1] - 0.052], [Hp[0] + 0.02, Hp[1] - 0.056], [Hp[0] + 0.09, Hp[1] - 0.035]],
    { step: 0.03, len: 0.04, dir: [0.0, -1], jitter: 0.4, seed: seed + 3, bias: [0, 0] });
  const maneT = mane > 0 ? tufts([[Sp[0] - 0.08, Sp[1] + 0.03], [Sp[0] - 0.04, Sp[1] + 0.07], [Sp[0] + 0.03, Sp[1] + 0.085], [Sp[0] + 0.09, Sp[1] + 0.05]],
    { step: 0.03, len: 0.05 * mane, radial: [Sp[0], Sp[1] - 0.03], bias: [-0.2, 0], jitter: 0.4, seed: seed + 4 }) : [];

  // ---------------------------------------------------------------- HEAD (local frame -> unit frame)
  const O = [N[0] + 0.028, N[1] + 0.088 * hs];
  const ca = Math.cos(tilt), sa = Math.sin(tilt);
  const TH = ([x, y]) => { const X = x * hs, Y = y * hs; return [O[0] + X * ca - Y * sa, O[1] + X * sa + Y * ca]; };
  const deform = ([x, y]) => {
    let X = x + (prog - 1) * Math.max(0, x - 0.04) * (y < 0.02 ? 1.0 : 0.3);
    if (y > -0.012 && y < 0.03 && x > 0.05) X += (brow - 1) * 0.014;
    return [X, y];
  };
  const faceL = [
    [-0.078, 0.020], [-0.062, 0.062], [-0.020, 0.081], [0.030, 0.079], [0.066, 0.058], [0.084, 0.024],
    [0.098, 0.001], [0.092, -0.019], [0.106, -0.035], [0.119, -0.052], [0.107, -0.062], [0.117, -0.078],
    [0.113, -0.095], [0.097, -0.108], [0.084, -0.123], [0.050, -0.131], [0.000, -0.119], [-0.050, -0.086], [-0.080, -0.040],
  ].map(deform);
  const face = poly(faceL.map(TH), 1);
  const HAIR = {
    f: {
      outer: [[0.078, 0.074], [0.05, 0.098], [0.01, 0.108], [-0.04, 0.104], [-0.085, 0.078], [-0.108, 0.03], [-0.112, -0.03], [-0.1, -0.09], [-0.078, -0.13]],
      inner: [[-0.04, -0.10], [-0.01, -0.06], [0.015, -0.03], [0.026, 0.0], [0.04, 0.03], [0.055, 0.046], [0.07, 0.05]],
    },
    m: {
      outer: [[0.074, 0.07], [0.048, 0.094], [0.008, 0.104], [-0.04, 0.10], [-0.085, 0.076], [-0.108, 0.03], [-0.11, -0.03], [-0.098, -0.085], [-0.07, -0.11]],
      inner: [[-0.036, -0.09], [-0.008, -0.062], [0.016, -0.03], [0.026, 0.0], [0.04, 0.03], [0.055, 0.046], [0.068, 0.05]],
    },
    c: {
      outer: [[0.08, 0.078], [0.055, 0.104], [0.015, 0.114], [-0.035, 0.11], [-0.082, 0.084], [-0.106, 0.034], [-0.108, -0.024], [-0.096, -0.075], [-0.07, -0.10]],
      inner: [[-0.036, -0.09], [-0.008, -0.058], [0.016, -0.028], [0.028, 0.004], [0.042, 0.034], [0.058, 0.05], [0.072, 0.054]],
    },
  }[hairStyle];
  const hair = poly(HAIR.outer.concat(HAIR.inner).map(TH), 1);
  const hairContour = HAIR.outer.map(TH);
  // hair strands: overlapping curved locks around the outer contour (silhouette becomes strand-like, not a smooth helmet)
  const strandLen = { f: 0.1, m: 0.085, c: 0.06 }[hairStyle];
  const hc = TH([-0.01, 0.0]);
  const hairT = [];
  {
    const R = (() => { let a = (seed * 9301 + 49297) % 233280; return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; })();
    const pts = HAIR.outer.map(TH);
    for (let i = 1; i < pts.length - 1; i++) {
      for (let k = 0; k < 2; k++) {
        const t = k * 0.5 + 0.15 * R();
        const px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, py = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
        let ox = px - hc[0], oy = py - hc[1]; const ol = Math.hypot(ox, oy) || 1; ox /= ol; oy /= ol;
        const fx = ox * 0.3 - 0.5, fy = oy * 0.3 - 0.62; // outward blended with a backward/downward flow
        const ang = Math.atan2(fy, fx) + (R() - 0.5) * 0.3;
        const L = strandLen * hs * (0.75 + R() * 0.5) * (i > pts.length - 4 && hairStyle === 'f' ? 1.4 : 1);
        hairT.push(lock(px - Math.cos(ang) * L * 0.25, py - Math.sin(ang) * L * 0.25, ang, L, 0.05 * hs, (R() - 0.3) * 0.5));
      }
    }
  }
  let extraHair = [], beardShapes = [];
  const bl = (x, y, rx, ry = rx, rot = 0) => { const q = TH([x, y]); return blob(q[0], q[1], rx * hs, ry * hs, rot + tilt, 24); };
  if (hairStyle === 'm') {
    // swept-back crown crest (soft mounds) + short beard along the jaw (separate paler layer)
    extraHair = [];
    beardShapes = [poly([[0.0, -0.05], [0.028, -0.088], [0.06, -0.118], [0.088, -0.136], [0.07, -0.152], [0.03, -0.15], [-0.01, -0.124], [-0.022, -0.085]].map(TH), 1),
      ...tufts([[0.088, -0.138], [0.07, -0.152], [0.03, -0.15], [-0.01, -0.124]].map(TH), { step: 0.02, w: 0.03, len: 0.024, dir: [0.1, -1], jitter: 0.4, seed: seed + 6, curl: 0.4 })];
  }
  if (hairStyle === 'c') {
    // tousled curls on the crown
    extraHair = [bl(0.075, 0.082, 0.034), bl(0.04, 0.1, 0.04), bl(-0.005, 0.11, 0.042), bl(-0.05, 0.105, 0.04), bl(-0.088, 0.082, 0.036)];
  }
  if (hairStyle === 'f') {
    // longer hair at the nape hanging over the neck
    extraHair = tufts([[-0.108, -0.04], [-0.106, -0.09], [-0.082, -0.128], [-0.04, -0.10]].map(TH), { step: 0.028, len: 0.055, w: 0.045, dir: [-0.15, -1], jitter: 0.35, seed: seed + 8 });
  }
  const ear = blob(...TH([-0.010, -0.022]), 0.0155 * hs * ears, 0.025 * hs * ears, 0.25 + tilt);
  const earIn = blob(...TH([-0.007, -0.022]), 0.0085 * hs * ears, 0.016 * hs * ears, 0.25 + tilt);
  // neck (hidden behind head / hair)
  const neck = limb([[Sp[0] + 0.0, Sp[1] + 0.02, 0.125], [N[0] + 0.01, N[1] + 0.02, 0.10], [TH([-0.01, -0.08])[0], TH([-0.01, -0.08])[1], 0.10]]);

  // ---------------------------------------------------------------- LIMB GEOMETRY
  const legGeom = (L) => {
    const th = 0.215 * legK, shk = 0.19 * legK;
    const K = down(Hp, L.th, th), A = down(K, L.sh, shk);
    const Tm = add(down(Hp, L.th, th * 0.5), [Math.cos(L.th) * 0.010, Math.sin(L.th) * 0.010]);
    const Sm = add(down(K, L.sh, shk * 0.5), [-Math.cos(L.sh) * 0.006, -Math.sin(L.sh) * 0.006]);
    const ctrl = [[Hp[0], Hp[1], 0.105 * lw], [Tm[0], Tm[1], 0.125 * lw], [K[0], K[1], 0.096 * lw], [Sm[0], Sm[1], 0.090 * lw], [A[0], A[1] + 0.012, 0.064 * lw]];
    return { K, A, ctrl };
  };
  const footPoly = (A, psi) => {
    const f = footScale;
    const base = poly([[-0.036, -0.026], [-0.030, -0.046], [0.020, -0.050], [0.080, -0.050], [0.118, -0.045], [0.130, -0.034], [0.118, -0.022], [0.076, -0.016], [0.030, -0.006], [0.020, 0.012], [-0.004, 0.022], [-0.026, 0.010]].map(([x, y]) => [x * f, y * f]), 2);
    return xf(base, { x: A[0], y: A[1], rot: psi });
  };
  const toeLines = (A, psi) => {
    const f = footScale, cs = Math.cos(psi), sn = Math.sin(psi);
    const T = (x, y) => [A[0] + (x * f) * cs - (y * f) * sn, A[1] + (x * f) * sn + (y * f) * cs];
    return [[T(0.092, -0.046), T(0.100, -0.026)], [T(0.108, -0.046), T(0.120, -0.030)]];
  };
  const armGeom = (a) => {
    const ul = 0.185 * armK, fl = 0.17 * armK;
    const E = down(Sp, a.u, ul), W = down(E, a.f, fl);
    const Um = add(down(Sp, a.u, ul * 0.5), [Math.cos(a.u) * 0.006, Math.sin(a.u) * 0.006]);
    const Fm = add(down(E, a.f, fl * 0.5), [Math.cos(a.f) * 0.004, Math.sin(a.f) * 0.004]);
    const ctrl = [[Sp[0], Sp[1], 0.100 * lw], [Um[0], Um[1], 0.092 * lw], [E[0], E[1], 0.078 * lw], [Fm[0], Fm[1], 0.072 * lw], [W[0], W[1], 0.058 * lw]];
    const hAng = a.f + 0.12;
    const palm = limb([[W[0], W[1], 0.056 * lw], down(W, hAng, 0.030).concat(0.066 * lw), down(W, hAng + 0.08, 0.052).concat(0.058 * lw)]);
    const fing = (da, len, w0) => limb([down(W, hAng + da * 0.2, 0.046).concat(w0 * lw), down(W, hAng + 0.10 + da, 0.046 + len * 0.55).concat(w0 * 0.82 * lw), down(W, hAng + 0.34 + da, 0.046 + len).concat(w0 * 0.5 * lw)]);
    const thumb = limb([down(W, hAng - 0.45, 0.022).concat(0.034 * lw), down(W, hAng - 0.18, 0.050).concat(0.028 * lw), down(W, hAng + 0.10, 0.070).concat(0.017 * lw)]);
    const hand = [palm, fing(-0.10, 0.052, 0.030), fing(0.02, 0.060, 0.030), fing(0.14, 0.050, 0.027), thumb];
    return { E, W, ctrl, hand, hAng };
  };

  const legs = { legA: legGeom(PS.legA), legB: legGeom(PS.legB) };
  const arms = { armA: armGeom(PS.armA), armB: armGeom(PS.armB) };

  // ---------------------------------------------------------------- PARTS
  const furFill = { top: F.top, bottom: F.bottom };
  const legFill = { top: mix(F.top, F.bottom, 0.8), bottom: mix(F.top, F.bottom, 0.25) };
  const legFillFar = { top: '#5a3a24', bottom: '#7a5530' };
  const furFillFar = { top: '#5a3a24', bottom: '#85602f' };
  const strokes = (c, bb, k = 1, flow = -Math.PI / 2 - 0.15) => {
    const area = Math.max(0.05, bb.w * bb.h) / (U * U);
    furStrokes(c, bb, F.dark, Math.round(70 * area * k), { len: 0.06 * U, w: 0.0085 * U, ang: flow, alpha: 0.46, seed: seed + 11 });
    furStrokes(c, bb, F.light, Math.round(60 * area * k), { len: 0.055 * U, w: 0.0075 * U, ang: flow, alpha: 0.42, seed: seed + 12 });
  };
  const bodyLayers = [
    {
      shapes: [torso, bellyB, rump, mantle, neck, ...furBack, ...furFront, ...shorts, ...maneT].map((p) => sc(p)),
      fill: furFill,
      deco: (c, bb) => {
        volume(c, bb, { dark: 'rgba(40,20,8,0.30)' });
        glow(c, ...m([sp(0.62)[0] + 0.09, sp(0.62)[1] - 0.02]), 0.1 * U, 0.12 * U, F.light, 0.55);
        glow(c, ...m([sp(0.25)[0] + 0.075, sp(0.25)[1]]), 0.085 * U, 0.085 * U, F.light, 0.5);
        strokes(c, bb, 1);
      },
    },
    {
      shapes: [face].map((p) => sc(p)), fill: { top: SK.top, bottom: SK.bottom },
      deco: (c, bb) => {
        const t = (x, y) => m(TH([x, y]));
        const sU = U * hs;
        glow(c, ...t(0.045, -0.05), 0.05 * sU, 0.04 * sU, '#e0866e', 0.5); // cheek blush
        // brow ridge shade + brow line
        curve(c, [t(0.030, 0.026), t(0.060, 0.040), t(0.092, 0.030), t(0.104, 0.008)], SK.dark, 0.028 * sU, { alpha: 0.35 });
        curve(c, [t(0.036, 0.034), t(0.062, 0.046), t(0.092, 0.036)], F.dark, 0.011 * sU, { alpha: 0.95 });
        eye(c, ...t(0.058, 0.004), eyeR * sU, { color: '#4a2a12', white: '#fff7e2', look: eyeLook });
        // upper eyelid: heavier lid = calmer, wiser look
        { const [ex, ey] = c.tf(...t(0.058, 0.004)); const R = eyeR * sU * c.S;
          c.ctx.save(); c.ctx.strokeStyle = F.dark; c.ctx.globalAlpha = 0.95; c.ctx.lineCap = 'round'; c.ctx.lineWidth = Math.max(1.2, 0.0085 * sU * c.S);
          c.ctx.beginPath(); c.ctx.arc(ex, ey, R * 1.04, Math.PI * 1.02, Math.PI * 1.98); c.ctx.stroke(); c.ctx.restore(); }
        // lower lid hint
        curve(c, [t(0.040, -0.014), t(0.060, -0.020), t(0.078, -0.014)], SK.dark, 0.005 * sU, { alpha: 0.55 });
        // nostril + mouth
        const [nx, ny] = t(0.106, -0.058);
        c.ctx.save(); c.ctx.fillStyle = 'rgba(60,30,18,.85)'; c.ctx.beginPath();
        const [X, Y] = c.tf(nx, ny); c.ctx.ellipse(X, Y, 0.0065 * sU * c.S, 0.0045 * sU * c.S, 0.5, 0, 6.2832); c.ctx.fill(); c.ctx.restore();
        const sm = 0.012 * smile * sU;
        if (mouthOpen > 0) {
          const [a0, a1] = [t(0.110, -0.088), t(0.050, -0.086 + 0.006 * smile)];
          c.ctx.save(); c.ctx.fillStyle = '#6a2b24'; c.ctx.beginPath();
          const A0 = c.tf(a0[0], a0[1]), A1 = c.tf(a1[0], a1[1]), B = c.tf(...t(0.085, -0.088 - mouthOpen));
          c.ctx.moveTo(A0[0], A0[1]); c.ctx.quadraticCurveTo(B[0], B[1], A1[0], A1[1]); c.ctx.quadraticCurveTo((A0[0] + A1[0]) / 2, (A0[1] + A1[1]) / 2 - 2, A0[0], A0[1]); c.ctx.fill(); c.ctx.restore();
        }
        curve(c, [t(0.113, -0.090), t(0.090, -0.098), t(0.064, -0.094), t(0.046, -0.080 + 0.004 * smile)], SK.lip, 0.0065 * sU, { alpha: 0.9 });
        // soft chin shade
        glow(c, ...t(0.085, -0.122), 0.05 * sU, 0.03 * sU, SK.dark, 0.25);
      },
    },
    ...(beardShapes.length ? [{
      shapes: beardShapes.map((p) => sc(p)), fill: { top: F.hair2, bottom: F.hair },
      deco: (c, bb) => { furStrokes(c, bb, F.light, 30, { len: 0.03 * U, w: 0.005 * U, ang: -Math.PI / 2, jit: 0.5, alpha: 0.4, seed: seed + 23 }); },
    }] : []),
    {
      shapes: [hair, ...hairT, ...extraHair].map((p) => sc(p)),
      fill: { top: F.hair2, bottom: F.hair },
      deco: (c, bb) => {
        const area = Math.max(0.01, bb.w * bb.h) / (U * U);
        furStrokes(c, bb, F.light, Math.round(120 * area), { len: 0.035 * U, w: 0.0055 * U, ang: Math.PI + 0.5, jit: 0.7, alpha: 0.30, seed: seed + 21 });
        furStrokes(c, bb, '#1f130a', Math.round(110 * area), { len: 0.035 * U, w: 0.0055 * U, ang: Math.PI + 0.5, jit: 0.7, alpha: 0.35, seed: seed + 22 });
      },
    },
    { shapes: [ear].map((p) => sc(p)), fill: { top: SK.top, bottom: SK.bottom }, deco: (c, bb) => { } },
    { shapes: [earIn].map((p) => sc(p)), fill: '#8b5a40', stroke: null },
  ];

  const limbLayers = (g, kind, far) => {
    const thigh = limb(g.ctrl);
    const back = kind === 'leg' ? furEdge(g.ctrl, -1, { step: 0.032, len: 0.034, gravity: 0.6, from: 0.04, to: 0.8, seed: seed + 31, bias: [-0.15, 0] })
      : furEdge(g.ctrl, -1, { step: 0.03, len: 0.04, gravity: 0.7, from: 0.12, to: 1, seed: seed + 41, bias: [-0.1, 0] });
    const front = kind === 'leg' ? furEdge(g.ctrl, +1, { step: 0.04, len: 0.022, gravity: 0.5, from: 0.55, to: 0.95, seed: seed + 32 })
      : furEdge(g.ctrl, +1, { step: 0.04, len: 0.026, gravity: 0.5, from: 0.3, to: 0.95, seed: seed + 42 });
    return { thigh, tufts: [...back, ...front] };
  };

  const parts = {};
  parts.body = { z: 2, layers: bodyLayers };
  // far leg (behind body)
  const mkLeg = (name, z, far) => {
    const g = legs[name], ps = PS[name];
    const L = limbLayers(g, 'leg', far);
    const lay = [
      {
        shapes: [L.thigh, ...L.tufts].map((p) => sc(p)), fill: far ? legFillFar : legFill,
        deco: (c, bb) => { volume(c, bb, { dark: 'rgba(40,20,8,0.30)' }); strokes(c, bb, 1.0, -Math.PI / 2 - 0.1); if (far) { c.ctx.save(); c.ctx.fillStyle = 'rgba(30,15,5,0.10)'; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore(); } },
      },
      {
        shapes: [footPoly(g.A, ps.psi)].map((p) => sc(p)), fill: { top: SK.top, bottom: SK.dark },
        deco: (c, bb) => { if (far) { c.ctx.save(); c.ctx.fillStyle = 'rgba(30,15,5,0.10)'; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore(); }
          for (const ln of toeLines(g.A, ps.psi)) curve(c, ln.map((q) => m(q)), SK.dark, 0.006 * U, { alpha: 0.7 }); },
      },
    ];
    return { z, pivot: m(Hp), layers: lay };
  };
  const mkArm = (name, z, far) => {
    const g = arms[name];
    const L = limbLayers(g, 'arm', far);
    const lay = [
      {
        shapes: [L.thigh, ...L.tufts].map((p) => sc(p)), fill: far ? legFillFar : legFill,
        deco: (c, bb) => { volume(c, bb, { dark: 'rgba(40,20,8,0.30)' }); strokes(c, bb, 1.0, -Math.PI / 2 - 0.1); if (far) { c.ctx.save(); c.ctx.fillStyle = 'rgba(30,15,5,0.10)'; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore(); } },
      },
      {
        shapes: g.hand.map((p) => sc(p)), fill: { top: SK.top, bottom: SK.dark },
        deco: (c, bb) => { if (far) { c.ctx.save(); c.ctx.fillStyle = 'rgba(30,15,5,0.10)'; c.ctx.fillRect(0, 0, c.W, c.H); c.ctx.restore(); }
          const W = g.W; const d1 = down(W, g.hAng + 0.12, 0.06), d2 = down(W, g.hAng + 0.30, 0.09);
          curve(c, [m(down(W, g.hAng, 0.035)), m(d1), m(d2)], SK.dark, 0.005 * U, { alpha: 0.65 }); },
      },
    ];
    return { z, pivot: m(Sp), layers: lay };
  };
  parts.legB = mkLeg('legB', 0, true);
  parts.armB = mkArm('armB', 1, true);
  parts.legA = mkLeg('legA', 3, false);
  parts.armA = mkArm('armA', 4, false);

  const eyeP = m(TH([0.058, 0.004]));
  const mouthP = m(TH([0.108, -0.09]));
  const headP = m(O);
  return {
    parts,
    anchors: {
      head: headP, eye: eyeP, mouth: mouthP, shoulder: m(Sp), hip: m(Hp), foot: [m(legs.legA.A)[0], 0], back: m(sp(0.7)),
      handA: m(arms.armA.W), handB: m(arms.armB.W),
    },
    _minY: Math.min(...[footPoly(legs.legA.A, PS.legA.psi), footPoly(legs.legB.A, PS.legB.psi)].flat().map((q) => q[1])),
  };
}
