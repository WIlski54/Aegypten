// Hauskatze (Felis catus, Nubische Falbkatze): schlank, sandfarben mit dunklen Streifen an Beinen und Schwanz, große Ohren,
// goldene Augen mit dunklem "Lidstrich" wie in der Wandmalerei. Heilig als Tier der Bastet. ~55 cm mit Schwanz.
// opts.pose: 'sit' (Standard; sitzt aufrecht, Schwanz ums Pfötchen) oder 'walk' (schreitet, Schwanz hoch).
// opts.ring = true: kleiner goldener Ohrring. opts.coat: 'gestreift' (Standard) | 'rot' | 'grau'.
// Teile 'sit': body (Rumpf, Kopf, Ohren), tail (Pivot Schwanzansatz), legA (fernes Vorderbein), legB (nahes Vorderbein) – Pivot Schulter.
// Teile 'walk': body (Rumpf, Kopf), tail (Pivot Schwanzansatz), legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte,
//               armA (nahes Vorderbein), armB (fernes) – Pivot Schulter. Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const walk = opts.pose === 'walk';
  const coat = opts.coat || 'gestreift';
  const C = ({
    gestreift: { top: '#b88a52', mid: '#cfa468', low: '#f0dfb6', dark: '#5a3b20', far: '#8b6538', farB: '#a98350' },
    rot: { top: '#c9783a', mid: '#dd9a58', low: '#f6e2bc', dark: '#8c4a20', far: '#9c5a2a', farB: '#c98a4e' },
    grau: { top: '#7e7a78', mid: '#9d9894', low: '#e6e0d4', dark: '#3c3836', far: '#5e5a58', farB: '#7e7a78' },
  })[coat];
  const rimc = 'rgba(70,42,20,.9)';
  const pink = '#e99a8e', gold = '#e0b040';

  // ---- Kopf (lokal, Mittelpunkt (0,0), schaut nach +x) ----
  const makeHead = (ox, oy, rot, sc) => {
    const H = K.place(ox, oy, rot, sc);
    const skull = K.S(H.blob(0, 0, 7.6, 6.6), H.blob(-0.5, -3.2, 6.6, 3.6), H.blob(5.6, -2.2, 3.8, 3.0));
    const earN = H.poly([[-4.4, 4.6], [-3.4, 13.8], [1.6, 5.8]], 1), earF = H.poly([[1.6, 5.8], [5.4, 12.4], [6.4, 3.6]], 1);
    const earNin = H.poly([[-3.4, 6.2], [-2.8, 11.4], [0.4, 6.8]], 1);
    return { H, skull, earN, earF, earNin };
  };
  const headLayers = (h, tone) => {
    const { H } = h;
    const out = [];
    out.push({ shapes: [h.earF], fill: { top: C.far, bottom: C.farB }, stroke: null, deco: K.rim([h.earF], { w: 0.2, color: rimc }) });
    out.push({ shapes: h.skull, fill: { stops: [[0, C.top], [0.5, C.mid], [0.8, C.low], [1, C.low]] }, stroke: null,
      deco: K.deco((c, bb) => K.shade(c, bb, { dark: 'rgba(60,35,15,.12)', light: 'rgba(255,240,200,.18)' }), H.d((c, bb) => {
        // Stirn-"M" und Wangenstreifen
        K.curve(c, [[-1, 5.4], [-0.6, 3.4]], C.dark, 0.7, { alpha: 0.75 }); K.curve(c, [[1.2, 5.6], [1.2, 3.4]], C.dark, 0.7, { alpha: 0.75 }); K.curve(c, [[3.4, 5.2], [3, 3.4]], C.dark, 0.7, { alpha: 0.75 });
        K.curve(c, [[-5, -0.8], [-2.5, -1.4]], C.dark, 0.7, { alpha: 0.55 }); K.curve(c, [[-5, -2.4], [-2.5, -2.6]], C.dark, 0.7, { alpha: 0.5 });
        K.paintBlob(c, 5.8, -2.4, 3.6, 2.8, 0, '#f6ecd0', 0.9);                      // helle Schnauze
        K.paintBlob(c, 8.6, -1.2, 1.1, 0.8, 0, pink, 1);                               // Näschen
        K.curve(c, [[8.6, -1.8], [8.2, -3.4], [6.4, -4.0]], 'rgba(70,40,25,.8)', 0.4);
        K.curve(c, [[8.4, -3.2], [10.6, -3.6]], 'rgba(255,255,255,.7)', 0.22); K.curve(c, [[8.4, -2.6], [11, -2.4]], 'rgba(255,255,255,.7)', 0.22);   // Schnurrhaare
        // Auge mit Lidstrich bis zur Schläfe
        K.bead(c, 3.1, 1.5, 1.85, { color: '#12100a', ring: '#e8c23c', look: 0.2 });
        K.curve(c, [[1.0, 1.5], [-1.4, 1.3], [-3.6, 0.4]], '#1a120c', 0.5);
        K.curve(c, [[0.6, 3.0], [2.8, 4.3], [5, 3.2]], 'rgba(40,24,12,.55)', 0.45);
      }), K.rim(h.skull, { w: 0.22, color: rimc })) });
    out.push({ shapes: [h.earN], fill: { top: C.top, bottom: C.mid }, stroke: null,
      deco: K.deco(H.d((c) => { K.paintPoly(c, [[-3.4, 6.2], [-2.8, 11.6], [0.5, 6.8]], pink, 0.9, 1); K.curve(c, [[-3, 12.6], [-4, 9.4]], C.dark, 0.7, { alpha: 0.45 }); }), K.rim([h.earN], { w: 0.2, color: rimc })) });
    if (opts.ring) out.push({ shapes: [H.blob(-4.0, 6.6, 1.4, 1.7)], fill: gold, stroke: 'rgba(120,80,20,.95)', deco: null });
    return out;
  };

  // ---- Schwanz ----
  const ringsOn = (ctrl, n) => (c) => { K.rings(c, ctrl, { step: 3.4, color: C.dark, w: 1.3, alpha: 0.7, reach: 7, offset: 2 }); };

  if (!walk) {
    // ============== SITZEND ==============
    const head = makeHead(7.6, 27.5, -0.05, 0.92);
    const haunch = K.S(K.blob(-5, 9, 10.5, 9.2, 0.25), K.limb([[-6, 8, 14], [-1, 15, 12.5], [3.4, 22, 9.4]], { per: 12 }), K.blob(4.4, 15.5, 6.8, 8.6, 0.1));
    const hindFoot = K.S(K.blob(3, 2.3, 8.6, 2.5, 0), K.blob(10, 1.6, 3.6, 1.8, 0));
    const foreN = K.S(K.limb([[6.5, 17, 6.2], [8, 9, 4.6], [8.6, 3, 4.2]], { per: 8 }), K.blob(10, 1.7, 4.6, 2.2, 0));
    const foreF = K.S(K.limb([[4, 17, 5.8], [5.5, 9, 4.4], [6.3, 3, 4.0]], { per: 8 }), K.blob(7.6, 1.7, 4.4, 2.1, 0));
    const body = {
      z: 2, layers: [
        { shapes: haunch, fill: { stops: [[0, C.top], [0.45, C.mid], [0.8, C.low], [1, C.low]] }, stroke: null,
          deco: K.deco((c, bb) => {
            K.shade(c, bb, { dark: 'rgba(60,35,15,.2)', light: 'rgba(255,240,200,.16)' });
            for (let i = 0; i < 4; i++) K.curve(c, [[-12 + i * 2.6, 17 - i * 0.6], [-9.5 + i * 2.6, 11 - i * 0.6], [-11 + i * 2.6, 5]], C.dark, 0.9, { alpha: 0.4 });
            K.fur(c, bb, C.dark, 12, 3, 0.4, { seed: 4, alpha: 0.28, ang: Math.PI * 0.95 });
            K.curve(c, [[-9, 13], [-4, 15], [-1, 11]], C.dark, 0.7, { alpha: 0.35 });
          }, K.rim(haunch, { w: 0.22, color: rimc })) },
        { shapes: hindFoot, fill: { top: C.mid, bottom: C.low }, stroke: null, deco: K.deco((c, bb) => { K.curve(c, [[8, 3], [8.2, 1]], 'rgba(70,40,20,.4)', 0.4); K.curve(c, [[10.2, 3], [10.4, 1]], 'rgba(70,40,20,.4)', 0.4); }, K.rim(hindFoot, { w: 0.2, color: rimc })) },
        ...headLayers(head),
      ],
    };
    const leg = (shapes, far) => ({
      z: far ? 1 : 3, pivot: K.pt(far ? [4, 18] : [6.5, 18]), layers: [{ shapes, fill: far ? { top: C.far, bottom: C.farB } : { top: C.mid, bottom: C.low }, stroke: null,
        deco: K.deco((c, bb) => { K.curve(c, [[9, 4.8], [9.2, 1]], 'rgba(70,40,20,.4)', 0.4); K.curve(c, [[11, 4.6], [11.2, 1]], 'rgba(70,40,20,.4)', 0.4);
          K.curve(c, [[5.4, 12], [8.2, 12.6]], C.dark, 0.7, { alpha: 0.5 }); }, K.rim(shapes, { w: 0.2, color: rimc })) }],
    });
    // Schwanz: legt sich vorn um die Pfoten
    const tailC = [[-12, 6, 6], [-18, 3.4, 4.2], [-12, 1.2, 3.8], [2, 0.9, 3.6], [14, 1.7, 3.4], [19, 4.6, 3.0], [18.6, 7.6, 2.2]];
    const tail = K.limb(tailC, { per: 10 });
    const tailPart = {
      z: 3, pivot: K.pt([-12, 6]), layers: [{ shapes: [tail], fill: { top: C.mid, bottom: C.top }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(60,35,15,.18)' }); K.rings(c, tailC, { step: 3.6, color: C.dark, w: 1.3, alpha: 0.7, reach: 5.5, offset: 5 }); K.paintBlob(c, 18.6, 7.6, 2.2, 2.4, 0, C.dark, 0.95); }, K.rim([tail], { w: 0.2, color: rimc })) }],
    };
    return {
      id: 'katze', parts: { body, tail: tailPart, legA: leg(foreF, true), legB: leg(foreN, false) },
      anchors: { head: K.pt([7, 27]), mouth: K.pt([15, 25]), eye: K.pt([10, 28.6]), back: K.pt([-6, 20]), foot: K.pt([5, 0]), tailTip: K.pt([18.6, 7.6]) },
      meta: { name: 'Hauskatze', lengthM: 0.55, heightM: 0.4, pose: 'sit', ranges: { tail: [0, -0.3], legA: [0, -0.4], legB: [0, -0.4] }, swing: { tail: [-0.25, 0.1], legA: [-0.3, 0.1], legB: [-0.3, 0.1] } },
    };
  }

  // ============== GEHEND ==============
  const head = makeHead(30, 30, -0.1, 1.0);
  const torso = K.S(K.blob(0, 25, 18, 8.4, 0.02), K.blob(11, 26, 9, 9), K.blob(-12, 25, 9, 8.2));
  const neck = K.limb([[10, 26, 11], [20, 29, 9], [26, 30, 8]], { per: 8 });
  const fore = (x, far) => K.S(K.limb([[x, 22, 6], [x + 1.5, 13, 4.2], [x + 1.5, 3, 3.8]], { per: 8 }), K.blob(x + 3.4, 1.6, 4.4, 2.1, 0));
  const hind = (x) => K.S(K.limb([[x, 23, 9], [x + 3.5, 14, 5.2], [x - 2.5, 8, 3.8], [x - 1, 2.8, 3.6]], { per: 8 }), K.blob(x + 1.6, 1.6, 4.6, 2.1, 0));
  const legL = (shapes, far, piv, z) => ({
    z, pivot: K.pt(piv), layers: [{ shapes, fill: far ? { top: C.far, bottom: C.farB } : { top: C.mid, bottom: C.low }, stroke: null,
      deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(60,35,15,.25)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,240,200,.1)' });
        K.curve(c, [[bb.x0 / K.u + 1, 14], [bb.x1 / K.u - 1, 14.4]], C.dark, 0.7, { alpha: 0.55 }); K.curve(c, [[bb.x0 / K.u + 1, 10], [bb.x1 / K.u - 1, 10.4]], C.dark, 0.7, { alpha: 0.5 }); }, K.rim(shapes, { w: 0.2, color: rimc })) }],
  });
  const body = {
    z: 2, layers: [
      { shapes: K.S(torso, neck), fill: { stops: [[0, C.top], [0.5, C.mid], [0.8, C.low], [1, C.low]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,35,15,.2)', light: 'rgba(255,240,200,.16)' });
          for (let i = 0; i < 7; i++) K.curve(c, [[-14 + i * 4.4, 33], [-13 + i * 4.4, 27], [-14 + i * 4.4, 22]], C.dark, 1.0, { alpha: 0.35 });
          K.fur(c, bb, C.dark, 12, 3, 0.4, { seed: 4, alpha: 0.25, ang: Math.PI * 0.95 });
        }, K.rim(K.S(torso, neck), { w: 0.22, color: rimc })) },
      ...headLayers(head),
    ],
  };
  const tailC = [[-18, 27, 5.4], [-26, 30, 4.4], [-30, 38, 4], [-28, 46, 3.6], [-22, 50, 3.2], [-18, 48, 2.6]];
  const tail = K.limb(tailC, { per: 10 });
  const tailPart = {
    z: 1, pivot: K.pt([-17, 27]), layers: [{ shapes: [tail], fill: { top: C.mid, bottom: C.top }, stroke: null,
      deco: K.deco((c, bb) => { K.rings(c, tailC, { step: 3.8, color: C.dark, w: 1.3, alpha: 0.7, reach: 5, offset: 5 }); K.paintBlob(c, -18, 48, 2.3, 2.3, 0, C.dark, 0.95); }, K.rim([tail], { w: 0.2, color: rimc })) }],
  };
  const sw = [-0.35, 0.35];
  return {
    id: 'katze',
    parts: {
      body, tail: tailPart,
      legA: legL(hind(-13), true, [-12, 24], 1), armB: legL(fore(8, true), true, [8, 23], 1),
      legB: legL(hind(-8), false, [-7, 24], 3), armA: legL(fore(13, false), false, [13, 23], 3),
    },
    anchors: { head: K.pt([30, 30]), mouth: K.pt([39, 28]), eye: K.pt([33, 31.6]), back: K.pt([-2, 33]), foot: K.pt([0, 0]), tailTip: K.pt([-18, 48]) },
    meta: { name: 'Hauskatze', lengthM: 0.55, heightM: 0.52, pose: 'walk', ranges: { tail: [0, -0.3], legA: [0, 0.35], legB: [0, -0.35], armA: [0, -0.35], armB: [0, 0.35] },
      swing: { tail: [-0.2, 0.2], legA: sw, legB: sw, armA: sw, armB: sw }, gait: [['legB', 'armB'], ['legA', 'armA']] },
  };
}
