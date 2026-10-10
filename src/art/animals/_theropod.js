// Parametric theropod builder: produces a spec (parts: body, jaw[, arm]) in METERS, facing +x.
import { blob, limb, poly, xf, move } from '../dsl.js';
import { eye, volume, spots, stripes, fuzz, line } from '../paint.js';

export function theropod(o) {
  const {
    id, len = 3, hipH = 0.9, bodyR = [0.45, 0.22], chest = 0.12, tail = 1.4, tailW = 0.28, tailDrop = 0.1,
    neckLen = 0.7, neckW = 0.17, neckRise = 0.55, headLen = 0.3, headH = 0.14, snout = 0.5, legW = 0.26, legLen = 0.85,
    armLen = 0.28, arm = true, colors = {}, deco = {}, belly = true, jawOpen = true, stance = 0,
  } = o;
  const C = Object.assign({ top: '#b98c4a', bottom: '#ead7a3', belly: '#f1e3b8', mark: '#6b4a24', eye: '#1b120c' }, colors);
  // body centre at origin x=0, hips at (0,hipH)
  const bx = 0.05, by = hipH + 0.05;
  const body = blob(bx, by, bodyR[0], bodyR[1], 0.08);
  const chestB = blob(bx + bodyR[0] * 0.55, by + chest * 0.3, bodyR[0] * 0.55, bodyR[1] * 0.95, 0.2);
  const tl = limb([[bx - bodyR[0] * 0.6, by + 0.02, tailW], [bx - bodyR[0] - tail * 0.35, by + 0.01 - tailDrop * 0.3, tailW * 0.7],
    [bx - bodyR[0] - tail * 0.7, by - 0.08 - tailDrop * 0.7, tailW * 0.36], [bx - bodyR[0] - tail, by - 0.12 - tailDrop, 0.02]]);
  const nx0 = bx + bodyR[0] * 0.85, ny0 = by + 0.05;
  const neck = limb([[nx0 - 0.1, ny0, neckW * 1.4], [nx0 + neckLen * 0.35, ny0 + neckRise * 0.45, neckW * 1.05],
    [nx0 + neckLen * 0.5, ny0 + neckRise * 0.85, neckW * 0.85], [nx0 + neckLen * 0.62, ny0 + neckRise, neckW * 0.8]]);
  const hx = nx0 + neckLen * 0.62, hy = ny0 + neckRise;
  const head = poly([
    [hx - 0.06, hy + headH * 0.55], [hx + headLen * 0.3, hy + headH * 0.62], [hx + headLen * snout, hy + headH * 0.32], [hx + headLen, hy + headH * 0.12],
    [hx + headLen * 1.0, hy - headH * 0.05], [hx + headLen * 0.55, hy - headH * 0.12], [hx + headLen * 0.1, hy - headH * 0.28], [hx - 0.08, hy - headH * 0.3],
  ], 2);
  const jaw = poly([
    [hx + headLen * 0.02, hy - headH * 0.14], [hx + headLen * 0.55, hy - headH * 0.12], [hx + headLen * 0.98, hy - headH * 0.12],
    [hx + headLen * 0.9, hy - headH * 0.4], [hx + headLen * 0.4, hy - headH * 0.46], [hx + headLen * 0.05, hy - headH * 0.4],
  ], 2);
  const thigh = limb([[bx - 0.02, by + 0.02, legW * 1.35], [bx + 0.14, hipH - legLen * 0.32, legW * 0.95], [bx - 0.02, hipH - legLen * 0.62, legW * 0.5],
    [bx + 0.03, 0.06, legW * 0.36]]);
  const foot = limb([[bx + 0.03, 0.06, legW * 0.33], [bx + 0.22, 0.035, legW * 0.28], [bx + 0.36, 0.02, legW * 0.18]]);
  const thigh2 = xf(thigh, { x: -0.13 + stance, y: 0 }); const foot2 = xf(foot, { x: -0.13 + stance });
  const armP = limb([[nx0 + 0.02, by - 0.08, 0.1], [nx0 + armLen * 0.4, by - 0.22, 0.07], [nx0 + armLen * 0.6, by - 0.3, 0.05]]);
  const layers = [
    { shapes: [thigh2, foot2], fill: { top: C.top, bottom: C.mark }, deco: (c, bb) => volume(c, bb, { dark: 'rgba(30,18,6,.45)' }) },
    { shapes: [tl, neck, body, chestB, thigh, foot].concat(arm ? [armP] : []), fill: { top: C.top, bottom: C.bottom }, deco: (c, bb) => {
      volume(c, bb);
      if (deco.stripes) stripes(c, bb, C.mark, deco.stripes, { width: 0.05, alpha: 0.4 });
      if (deco.spots) spots(c, bb, C.mark, deco.spots, 0.02, 0.05, { seed: 11 });
      if (deco.fuzz) fuzz(c, bb, deco.fuzz, 90, 0.07);
    } },
    { shapes: [head], fill: { top: C.top, bottom: C.bottom }, deco: (c, bb) => {
      volume(c, bb, { dark: 'rgba(40,25,10,0.2)' });
      eye(c, hx + headLen * 0.28, hy + headH * 0.18, Math.max(0.018, headH * 0.17), { color: C.eye });
      line(c, [[hx + headLen * 0.98, hy - headH * 0.06], [hx + headLen * 0.4, hy - headH * 0.14]], 'rgba(60,30,10,.7)', 0.01);
    } },
  ];
  const parts = { body: { layers: [layers[0], layers[1], layers[2]], z: 1 } };
  if (jawOpen) {
    parts.jaw = { z: 0, pivot: [hx + 0.02, hy - headH * 0.2], layers: [{ shapes: [jaw], fill: { top: C.bottom, bottom: C.belly } }] };
  }
  return { id, parts, anchors: { head: [hx + headLen * 0.5, hy], mouth: [hx + headLen, hy - headH * 0.1], foot: [bx, 0] }, meta: { len } };
}
