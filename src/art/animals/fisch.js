// Nilfisch, ~80 cm. opts.kind: 'barsch' (Nilbarsch Lates niloticus: lang, großes Maul, zwei Rückenflossen, silbergrau/oliv)
//                          oder 'tilapia' (Nil-Tilapie Oreochromis niloticus: hoch und oval, zarte Querbänder, langer Rückenflossensaum, rosa Bauch).
// Die Tilapia ist der Fisch auf vielen Wandbildern (die "Buntbarsch"-Form). Teile: body (Rumpf, Flossen, Kopf),
// tail (Schwanzflosse, Pivot am Schwanzstiel; schlängelt: ±0,35 rad). Entwurf in cm; Blick nach +x; der Fisch schwebt (Unterkante ca. y = 0).
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const T = opts.kind === 'tilapia';
  const C = T
    ? { top: '#6f7c58', mid: '#a8b08a', low: '#ecd8bc', fin: '#8e9a6c', finHi: '#d7705e', ink: 'rgba(50,60,36,.9)' }
    : { top: '#6c7a6a', mid: '#b7c2b5', low: '#f1ecd9', fin: '#86957f', finHi: '#c5d0bb', ink: 'rgba(45,58,50,.9)' };
  const rimc = C.ink;
  const D = T ? 29 : 21;          // Körperhöhe
  const y0 = 9;                    // Unterkante des Rumpfes (Flossen reichen darunter bis ca. y = 1)
  const cy = y0 + D / 2;           // Mittellinie
  const px = -24;                  // Schwanzstiel (Pivot)

  // ---- Rumpf ----
  const bodyPts = T
    ? [[40, cy - 1], [37, cy + 7], [28, cy + 13], [16, cy + 15.5], [2, cy + 15], [-12, cy + 10], [-24, cy + 4], [-27, cy + 1.2], [-27, cy - 1.8], [-24, cy - 4.5], [-12, cy - 11], [2, cy - 14.4], [16, cy - 13.4], [28, cy - 9], [36, cy - 5.6]]
    : [[42, cy - 1], [38, cy + 5], [29, cy + 9.4], [16, cy + 11], [0, cy + 10], [-14, cy + 6.4], [-26, cy + 3.4], [-28, cy + 1], [-28, cy - 1.6], [-26, cy - 3.6], [-14, cy - 7], [0, cy - 10.4], [16, cy - 10.4], [27, cy - 7.6], [37, cy - 4.4]];
  const bodyShape = K.poly(bodyPts, 2);
  // Flossen
  const dors1 = T
    ? K.poly([[22, cy + 13.4], [19, cy + 23.4], [11, cy + 21], [4, cy + 22], [-4, cy + 20], [-12, cy + 17], [-18, cy + 12], [-6, cy + 9]], 1)
    : K.poly([[18, cy + 9.6], [14, cy + 19.5], [9, cy + 15], [5, cy + 18.5], [1, cy + 13], [-3, cy + 15.5], [-5, cy + 9]], 0.5);
  const dors2 = T ? null : K.poly([[-8, cy + 7.6], [-10, cy + 14], [-17, cy + 12.4], [-23, cy + 9], [-22, cy + 4]], 1);
  const anal = T
    ? K.poly([[-6, cy - 10], [-10, cy - 17], [-18, cy - 13], [-22, cy - 6]], 1)
    : K.poly([[-10, cy - 6.2], [-13, cy - 12.2], [-20, cy - 8], [-22, cy - 3]], 1);
  const pelvic = T ? K.poly([[14, cy - 12], [8, cy - 21.5], [3, cy - 18], [6, cy - 12]], 1) : K.poly([[12, cy - 9.6], [7, cy - 16], [2, cy - 12.6], [5, cy - 9]], 1);
  const pect = K.poly([[22, cy - 3], [10, cy - 9.2], [8.4, cy - 5], [13, cy - 0.5]], 1.5);

  const finDeco = (rays) => (c, bb) => {
    K.shade(c, bb, { dark: 'rgba(30,40,20,.18)', light: 'rgba(255,255,230,.12)' });
    for (const r of rays) K.curve(c, r, 'rgba(40,52,30,.35)', 0.35);
  };
  const dRays = T ? [[[20, cy + 14], [16, cy + 21]], [[12, cy + 14], [10, cy + 20]], [[4, cy + 14], [3, cy + 20]], [[-4, cy + 13], [-4, cy + 18]], [[-10, cy + 12], [-12, cy + 15]]]
    : [[[16, cy + 10], [14, cy + 18]], [[11, cy + 10], [9.5, cy + 15]], [[6, cy + 10], [5.5, cy + 17]], [[1, cy + 10], [1, cy + 12]]];

  const layers = [
    { shapes: K.S(pelvic, anal), fill: C.fin, stroke: null, deco: K.deco(finDeco([]), K.rim(K.S(pelvic, anal), { w: 0.16, color: rimc })) },
    { shapes: K.S(dors1, dors2), fill: { top: T ? '#c76c58' : C.fin, bottom: C.fin }, stroke: null,
      deco: K.deco(finDeco(dRays), K.rim(K.S(dors1, dors2), { w: 0.16, color: rimc })) },
    { shapes: [bodyShape], fill: { stops: [[0, C.top], [0.3, C.top], [0.55, C.mid], [0.85, C.low], [1, C.low]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(40,50,35,.1)', light: 'rgba(255,255,240,.22)' });
        if (T) for (let i = 0; i < 6; i++) K.curve(c, [[24 - i * 7.5, cy + 15], [23 - i * 7.5, cy], [24 - i * 7.5, cy - 12]], 'rgba(60,70,40,.22)', 2.4);
        else { K.curve(c, [[30, cy + 2], [10, cy + 0.5], [-14, cy - 1]], 'rgba(255,255,255,.35)', 1.2); }
        K.scaleMarks(c, bb, 'rgba(50,60,40,.4)', T ? 3.6 : 3.2, { alpha: 0.28 });
        // Kiemendeckel + Maul + Auge
        K.curve(c, [[27, cy + 9], [24.5, cy + 2], [26, cy - 6]], rimc, 0.8);
        K.curve(c, T ? [[38, cy - 2.4], [33, cy - 4.6], [30, cy - 3.2]] : [[40, cy - 1], [32, cy - 4.6], [26, cy - 2.4], [24, cy - 1]], rimc, T ? 0.8 : 0.9);
        K.paintBlob(c, 30, cy - 4, 3.5, 2.5, 0.0, T ? '#f2a89a' : '#f5c9b8', 0.35);
        K.bead(c, T ? 31 : 32, cy + (T ? 4.6 : 3.2), T ? 3.6 : 3.3, { color: '#14110a', ring: '#e8b93c', look: 0.25 });
      }, K.rim([bodyShape], { w: 0.2, color: rimc })) },
    { shapes: [pect], fill: { top: C.fin, bottom: C.mid }, stroke: null,
      deco: K.deco(finDeco([[[20, cy - 3.4], [11, cy - 7]], [[18, cy - 3], [10, cy - 5]]]), K.rim([pect], { w: 0.16, color: rimc })) },
  ];

  // ---- Schwanzflosse (beweglich) ----
  const stalk = K.limb([[-18, cy + 0.8, 8], [-30, cy + 0.4, 5.2]], { per: 8 });
  const fan = T
    ? K.poly([[-28, cy + 0.6], [-35, cy + 8.8], [-47, cy + 12.4], [-52, cy + 6], [-50, cy], [-52, cy - 6], [-47, cy - 12.4], [-35, cy - 8.8]], 2)
    : K.poly([[-28, cy + 0.6], [-37, cy + 7.6], [-48, cy + 10.4], [-52, cy + 5], [-49, cy], [-52, cy - 5], [-48, cy - 10.4], [-37, cy - 7.6]], 2);
  const tail = {
    z: 1, pivot: K.pt([px, cy + 0.6]), layers: [
      { shapes: K.S(stalk, fan), fill: { stops: [[0, C.mid], [0.4, C.fin], [1, C.top]], dir: 'h' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,40,20,.15)', light: 'rgba(255,255,230,.1)' });
          for (let i = -3; i <= 3; i++) K.curve(c, [[-34, cy + 0.6 + i * 0.9], [-44, cy + 0.6 + i * 3.1], [-50, cy + 0.6 + i * 3.4]], 'rgba(40,52,30,.4)', 0.4);
        }, K.rim(K.S(stalk, fan), { w: 0.18, color: rimc })) },
    ],
  };

  return {
    id: 'fisch', parts: { body: { z: 2, layers }, tail },
    anchors: { head: K.pt([34, cy]), mouth: K.pt([41, cy - 1]), eye: K.pt([32, cy + 3.5]), back: K.pt([0, cy + 14]), foot: K.pt([0, y0]), tailTip: K.pt([-52, cy]) },
    meta: { name: T ? 'Nil-Tilapie' : 'Nilbarsch', lengthM: 0.8, kind: T ? 'tilapia' : 'barsch', ranges: { tail: [0, 0.35] }, swing: { tail: [-0.35, 0.35] } },
  };
}
