// Stegosaurus (Oberjura, ~9 m): abwechselnde grosse Rueckenplatten, vier Schwanzstacheln (Thagomizer), winziger tiefer Kopf,
// hoher Ruecken ueber den Hueften, kurze Vorderbeine.
// Teile: body (Rumpf, Kopf, Beine, Rueckenplatten), tail (Pivot an der Hueftes, Schwanz + Schwanzplatten + vier Stacheln; hoch = negativ).
import { blob, limb, poly, xf, move, band, samples, fillPoly, strokePoly, curve, cuteEye, cheek, mix, dark, light, line, dot, volume, claw } from './_b_kit.js';

const PAL = { back: '#c8923a', mid: '#dcae5a', belly: '#f6e6ae', mark: '#6a4217', leg: '#b8802e', eye: '#6b3a1a', horn: '#f1e0b0' };
const PL = { near: ['#f7994d', '#c8432e'], far: ['#b9533a', '#742421'], vein: 'rgba(120,28,18,0.5)', rim: 'rgba(90,25,15,0.6)', tail: ['#f69a52', '#c9462f'] };

// Rueckenplatte: Blattform, Basis bei (x,y0), Hoehe h, Breite w, nach hinten geneigt
function plate(x, y0, h, w, lean = 0.12) {
  const pts = [[-w / 2, -0.3], [w / 2, -0.3], [w * 0.52, h * 0.3], [w * 0.4, h * 0.68], [w * 0.08, h], [-w * 0.3, h * 0.82], [-w * 0.52, h * 0.4]];
  return xf(poly(pts, 2), { x, y: y0, rot: lean });
}
function plateLayer(pl, cols, rimCol) {
  return {
    shapes: [pl.shape], fill: { top: cols[0], bottom: cols[1] }, stroke: rimCol,
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,10,10,0.25)', light: 'rgba(255,235,200,0.25)' });
      const cx = (bb.x0 + bb.x1) / 2, w = bb.w, h = bb.h;
      // Adern: drei Kurven fachfoermig von der Basis nach oben
      for (let i = -1; i <= 1; i++) {
        line(c, [[cx + i * w * 0.12, bb.y0 + h * 0.1], [cx + i * w * 0.2 + w * 0.02, bb.y0 + h * 0.45], [cx + i * w * 0.18 - w * 0.04, bb.y0 + h * 0.8]], PL.vein, Math.max(0.02, w * 0.045), { alpha: 1 });
      }
      // heller Rand oben und rundum (trennt die Platten voneinander)
      line(c, [[bb.x0 + w * 0.15, bb.y0 + h * 0.62], [cx - w * 0.1, bb.y1 - h * 0.08], [bb.x1 - w * 0.2, bb.y0 + h * 0.62]], 'rgba(255,238,200,.55)', Math.max(0.02, w * 0.05));
      strokePoly(c, pl.shape, cols[2] || 'rgba(255,240,205,0.85)', 0.07);
    },
  };
}

export default function make(opts = {}) {
  // ---------- Rumpf mit hoher Huefte, Hals und kleinem tiefem Kopf ----------
  const torso = poly([
    [-1.2, 1.95], [-0.9, 2.45], [-0.4, 2.8], [0.2, 2.92], [0.9, 2.8], [1.5, 2.5], [2.1, 2.2], [2.6, 2.0], [2.92, 1.8],
    [2.85, 1.5], [2.5, 1.3], [1.9, 1.25], [1.0, 1.3], [0.2, 1.42], [-0.6, 1.6], [-1.15, 1.7],
  ], 3);
  const neckCtrl = [[2.2, 1.95, 1.1], [2.8, 1.65, 0.8], [3.2, 1.3, 0.62]];
  const neck = limb(neckCtrl);
  const HC = [3.15, 1.3], HS = 1.3; const hp = (dx, dy) => [HC[0] + dx * HS, HC[1] + dy * HS];
  const head = poly([
    hp(-0.15, 0.1), hp(0.15, 0.13), hp(0.43, 0.04), hp(0.67, -0.12), hp(0.79, -0.26), hp(0.73, -0.36), hp(0.45, -0.4), hp(0.13, -0.38), hp(-0.13, -0.28), hp(-0.21, -0.08),
  ], 2);

  // Beine
  const hindCtrl = (dx) => [[0.05 + dx, 2.1, 1.15], [0.3 + dx, 1.5, 0.95], [0.18 + dx, 0.8, 0.6], [0.22 + dx, 0.22, 0.5]];
  const hindFoot = (dx) => [limb([[0.16 + dx, 0.22, 0.48], [0.55 + dx, 0.1, 0.4], [0.86 + dx, 0.07, 0.28]]), ...[0, 1, 2].map((i) => blob(0.86 + dx + 0.04 * i, 0.2 - i * 0.085, 0.1, 0.075, 0.0, 12))];
  const frontCtrl = (dx) => [[2.1 + dx, 1.75, 0.85], [2.2 + dx, 1.0, 0.58], [2.25 + dx, 0.3, 0.5]];
  const frontFoot = (dx) => [limb([[2.23 + dx, 0.22, 0.5], [2.5 + dx, 0.1, 0.38], [2.68 + dx, 0.07, 0.26]]), ...[0, 1, 2].map((i) => blob(2.68 + dx + 0.03 * i, 0.19 - i * 0.07, 0.085, 0.065, 0.0, 12))];
  const hindL = (dx) => [limb(hindCtrl(dx)), ...hindFoot(dx)];
  const frontL = (dx) => [limb(frontCtrl(dx)), ...frontFoot(dx)];

  // Platten: [x, Basis-y, Hoehe, Breite]
  const nearP = [[2.45, 1.95, 0.8, 0.58], [1.78, 2.22, 1.2, 0.72], [1.1, 2.5, 1.55, 0.84], [0.4, 2.75, 1.78, 0.9], [-0.3, 2.75, 1.65, 0.88], [-0.94, 2.5, 1.3, 0.76]];
  const farP = [[2.12, 2.0, 0.78, 0.5], [1.44, 2.32, 1.1, 0.62], [0.75, 2.62, 1.4, 0.72], [0.05, 2.8, 1.45, 0.76], [-0.62, 2.64, 1.15, 0.66]];
  const mkP = (list, cols, lean) => list.map(([x, y, h, w]) => plateLayer({ shape: plate(x, y, h, w, lean) }, cols, PL.rim));

  const farLegs = {
    shapes: [...hindL(-0.62), ...frontL(0.55)], fill: { top: dark(PAL.leg, 0.2), bottom: dark(PAL.leg, 0.34) },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(30,10,0,.25)' }); },
  };
  const main = {
    shapes: [torso, neck, head], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,30,0,0.2)', light: 'rgba(255,240,190,0.2)' });
      for (let i = 0; i < 8; i++) line(c, [[-1.0 + i * 0.4, 3.0], [-1.2 + i * 0.4, 1.95]], PAL.mark, 0.11, { alpha: 0.5 });
      fillPoly(c, blob(0.8, 0.95, 2.5, 0.52), PAL.belly, 0.97);                                  // heller Bauch
      fillPoly(c, band(neckCtrl, -1.6, -0.1), PAL.belly, 0.95);                                    // helle Kehle
      // Kopf: Schnabel heller, Mund, Auge
      fillPoly(c, [hp(0.5, -0.1), hp(0.85, -0.1), hp(0.85, -0.5), hp(0.45, -0.5)], PAL.horn, 0.95);
      curve(c, [hp(0.75, -0.3), hp(0.55, -0.31), hp(0.33, -0.28), hp(0.2, -0.22)], 'rgba(70,35,10,.85)', 0.026);
      dot(c, ...hp(0.7, -0.14), 0.02, 'rgba(60,30,10,.85)');
      cuteEye(c, ...hp(0.12, -0.04), 0.115, { iris: PAL.eye });
      cheek(c, ...hp(0.26, -0.24), 0.08, '#f0907a', 0.5);
    },
  };
  const hindN = {
    shapes: hindL(0), fill: { top: PAL.back, bottom: PAL.leg },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(50,25,0,0.3)', light: 'rgba(255,240,190,0.2)' }); line(c, [[0.55, 2.35], [0.85, 1.4], [0.4, 0.95]], PAL.mark, 0.07, { alpha: 0.3 }); },
  };
  const frontN = {
    shapes: frontL(0), fill: { top: PAL.back, bottom: PAL.leg },
    deco(c, bb) { volume(c, bb, { dark: 'rgba(50,25,0,0.3)', light: 'rgba(255,240,190,0.2)' }); },
  };

  // ---------- Schwanz mit Platten und vier Stacheln (Faecher) ----------
  const tailCtrl = [[-0.5, 2.05, 1.3], [-1.5, 2.15, 1.0], [-2.5, 2.15, 0.74], [-3.5, 2.07, 0.52], [-4.4, 1.98, 0.34], [-5.15, 1.92, 0.14]];
  const tailSamples = samples(tailCtrl, 12);
  const tailY = (x) => { let b = tailSamples[0]; for (const p of tailSamples) if (Math.abs(p.x - x) < Math.abs(b.x - x)) b = p; return b; };
  const tailShape = limb(tailCtrl);
  const thorn = (x, y, deg, len, w) => {
    const a = (deg * Math.PI) / 180; const c = Math.cos(a), s = Math.sin(a);
    return limb([[x, y, w], [x + c * len * 0.5, y + s * len * 0.5, w * 0.72], [x + c * len, y + s * len, 0.025]], { per: 6 });
  };
  const thorns = [
    { s: thorn(-3.8, 2.08, 72, 1.05, 0.42), far: true }, { s: thorn(-4.18, 2.04, 97, 1.25, 0.44), far: false },
    { s: thorn(-4.56, 2.0, 122, 1.15, 0.42), far: true }, { s: thorn(-4.92, 1.96, 148, 0.95, 0.38), far: false },
  ];
  const thornLayer = (t) => ({
    shapes: [t.s], fill: t.far ? { top: '#b98e4c', bottom: '#80561f' } : { top: '#e6c27a', bottom: '#a8742f' }, stroke: 'rgba(60,30,10,0.65)',
    deco(c, bb) { volume(c, bb, { dark: 'rgba(90,60,30,0.28)', light: 'rgba(255,255,240,0.3)' }); },
  });
  const tailTop = (x) => { const p = tailY(x); return p.y + p.w / 2; };
  const tailPlatesNear = [[-1.3, 0.95, 0.62], [-2.0, 0.78, 0.52], [-2.7, 0.6, 0.42]].map(([x, h, w]) => [x, tailTop(x) - 0.12, h, w]);
  const tailPlatesFar = [[-1.65, 0.88, 0.58], [-2.35, 0.7, 0.48], [-3.05, 0.5, 0.38]].map(([x, h, w]) => [x, tailTop(x) - 0.1, h, w]);
  const tailMain = {
    shapes: [tailShape], fill: { top: PAL.back, bottom: PAL.mid },
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(60,30,0,0.2)', light: 'rgba(255,240,190,0.2)' });
      for (let i = 0; i < 5; i++) line(c, [[-1.1 - i * 0.7, 2.7], [-1.2 - i * 0.7, 1.5]], PAL.mark, 0.1, { alpha: 0.5 });
      fillPoly(c, band(tailCtrl, 0.35, 1.6), PAL.belly, 0.95);
    },
  };

  const hip = [-0.5, 2.05];
  return {
    id: 'stegosaurus',
    parts: {
      tail: { z: 0, pivot: hip, layers: [...mkP(tailPlatesFar, PL.far, 0.16), thornLayer(thorns[0]), thornLayer(thorns[2]), ...mkP(tailPlatesNear, PL.tail, 0.16), thornLayer(thorns[1]), thornLayer(thorns[3]), tailMain].map((l, i, a) => l) },
      body: { z: 1, layers: [...mkP(farP, PL.far, 0.1), ...mkP(nearP, PL.near, 0.12), farLegs, main, hindN, frontN] },
    },
    anchors: { head: hp(0.3, -0.15), mouth: hp(0.75, -0.3), eye: hp(0.12, -0.04), back: [0.3, 3.9], foot: [0.4, 0], tail: [-5.1, 1.92], spikes: [-4.6, 2.8], hip },
    meta: { name: 'Stegosaurus', lengthM: 9, ranges: { tail: [-0.5, 0.5] } },
  };
}
