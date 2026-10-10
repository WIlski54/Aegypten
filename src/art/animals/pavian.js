// Mantelpavian (Papio hamadryas), sitzend, ~80 cm: silbergraue Schultermähne, rosa-braunes Gesicht mit langer Schnauze, Hände auf den Knien.
// Das Tier des Thot (Gott der Schrift und der Weisheit). Freundlich, aufmerksam, mit Mähne wie ein kleiner Schreiber-Gelehrter.
// Teile: body (Rumpf, Mähne, ferne Gliedmaßen), head (Kopf + Hals, Pivot Halsansatz; ±0,3), armA (nahe Schulter-Arm, Pivot Schulter; hebt sich, negativ = Arm geht vor/hoch),
//        armB (ferner Arm), tail (Pivot Schwanzansatz). Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { mane: '#bdb8ae', maneHi: '#e0dcd2', maneLo: '#8c867b', fur: '#8b867c', furLo: '#b0aa9e', far: '#6e695f', farB: '#8c877c', face: '#b97d68', faceD: '#7e4c3c', pink: '#e49a8c', hand: '#7a6a5c', ink: 'rgba(60,56,50,.9)' };
  const rimc = C.ink;
  const NB = [13, 57];
  const SHO = [8, 50];

  // ---- Rumpf ----
  const seat = K.S(K.blob(-6, 14, 17, 14, 0.1), K.limb([[-9, 16, 28], [-3, 32, 26], [6, 46, 22]], { per: 12 }), K.blob(9, 42, 13, 14, 0.1));
  // Mähne: große silberne Fellwolke über Schultern und Rücken mit Zotteln
  const maneBase = K.S(K.blob(1, 51, 16, 14.5, 0.1), K.blob(-8, 44, 13, 13, 0.1));
  const maneTufts = [];
  for (let i = 0; i < 12; i++) {
    const a = 1.35 + (i / 11) * 3.0;             // vom Nacken über den Rücken nach unten
    maneTufts.push(K.blob(1 + Math.cos(a) * 15.5, 51 + Math.sin(a) * 14, 5.2, 4.8, a + 1.57, 14));
  }
  const mane = K.S(maneBase, maneTufts);
  // Beine
  const thighN = K.S(K.limb([[-2, 17, 17], [15, 23, 13.4], [26, 10, 9.6]], { per: 10 }), K.blob(30, 2.8, 9.4, 3.2, 0));
  const thighF = K.S(K.limb([[-8, 17, 16], [8, 22, 12.4], [19, 10, 9]], { per: 10 }), K.blob(23, 2.8, 8.6, 3.0, 0));
  const armN = K.S(K.limb([[SHO[0], SHO[1], 11], [18, 38, 8.4], [22, 28, 7]], { per: 10 }), K.blob(24, 25.4, 5.4, 3.6, -0.5));
  const armF = K.S(K.limb([[SHO[0] - 2, SHO[1], 10], [12, 38, 7.6], [15, 29, 6.4]], { per: 10 }), K.blob(17, 26.4, 5, 3.4, -0.5));
  // Schwanz (dünn, hängt hinten)
  const tailC = [[-20, 10, 4.4], [-30, 8, 3.6], [-36, 2.6, 3.2], [-30, 1.2, 3]];
  const tail = K.limb(tailC, { per: 10 });

  const furDeco = (c, bb, col = '#6a655b') => { K.shade(c, bb, { dark: 'rgba(30,25,15,.22)', light: 'rgba(255,250,235,.14)' }); K.fur(c, bb, col, 14, 5, 0.6, { seed: 5, alpha: 0.3, ang: Math.PI * 1.1 }); };
  const bodyLayers = [
    { shapes: thighF, fill: { top: C.far, bottom: C.farB }, stroke: null, deco: K.rim(thighF, { w: 0.2, color: rimc }) },
    { shapes: seat, fill: { stops: [[0, C.fur], [0.6, C.furLo], [1, C.furLo]] }, stroke: null,
      deco: K.deco((c, bb) => { furDeco(c, bb); K.paintBlob(c, 10, 40, 9, 11, 0.1, '#cfa89a', 0.55); }, K.rim(seat, { w: 0.24, color: rimc })) },
    { shapes: mane, fill: { top: C.maneHi, bottom: C.mane }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,55,45,.25)', light: 'rgba(255,255,250,.2)' });
        K.fur(c, bb, C.maneLo, 22, 7, 0.7, { seed: 9, alpha: 0.4, ang: Math.PI * 1.25, spread: 0.6 });
        K.fur(c, bb, '#ffffff', 14, 6, 0.6, { seed: 12, alpha: 0.35, ang: Math.PI * 1.2, spread: 0.6 });
      }, K.rim(mane, { w: 0.2, color: rimc })) },
    { shapes: thighN, fill: { stops: [[0, C.fur], [0.6, C.furLo], [1, C.furLo]] }, stroke: null,
      deco: K.deco((c, bb) => { furDeco(c, bb); K.paintBlob(c, 30, 3.4, 5, 2, 0, C.hand, 0.8); }, K.rim(thighN, { w: 0.22, color: rimc })) },
  ];

  const armPart = (shapes, far, piv, z) => ({
    z, pivot: K.pt(piv), layers: [{ shapes, fill: far ? { top: C.far, bottom: C.farB } : { top: C.fur, bottom: C.furLo }, stroke: null,
      deco: K.deco((c, bb) => { furDeco(c, bb); K.paintBlob(c, far ? 17 : 24, far ? 26.4 : 25.4, 4.6, 3.1, -0.5, C.hand, 0.95); }, K.rim(shapes, { w: 0.22, color: rimc })) }],
  });

  // ---- Kopf ----
  const Hh = K.place(21, 67, -0.12, 1.0);
  const neck = K.limb([[12, 56, 19], [16, 62, 15], [19, 66, 13]], { per: 8 });
  const skull = K.S(Hh.blob(0, 0, 9.2, 8.6), Hh.poly([[3, 5.4], [13, 3.8], [21, -1.6], [23.6, -7.6], [20, -13], [10, -12.4], [3, -6.8]], 2), Hh.blob(22.6, -7.2, 4.8, 4.6, -0.2));
  const ear = Hh.blob(-6, -0.4, 2.7, 3.6, 0.1);
  const hairTop = K.S(Hh.limb([[-4, 6, 8], [2, 9.6, 8], [8, 8.4, 6]], { per: 6 }), ...[0, 1, 2, 3, 4].map((i) => K.tuft(...Hh.T([-9 + i * 2.8, 5.4 - i * 0.2]), 2.5 + i * 0.12 + 0.1, 7, 4.6, 0.2)));
  const headLayers = [
    { shapes: K.S(neck, skull), fill: { top: C.maneHi, bottom: C.mane }, stroke: null,
      deco: K.deco((c, bb) => K.shade(c, bb, { dark: 'rgba(60,50,40,.2)', light: 'rgba(255,250,240,.14)' }), Hh.d((c) => {
        K.paintPoly(c, [[4, 6.4], [12, 7], [19, 3], [23.6, -2.6], [24.4, -8.4], [21, -13.4], [10, -13.6], [4, -10], [1.6, -3.6]], C.face, 1, 2);   // nacktes Gesicht
        K.fur(c, c.layerBox || bb, C.maneLo, 6, 4, 0.5, { seed: 2, alpha: 0.3 });
        K.paintBlob(c, 17, -9.6, 7, 3, -0.15, '#d6a898', 0.8);                                // Schnauzenunterseite
        K.paintBlob(c, 22.8, -7.4, 3.6, 3.4, 0, C.faceD, 0.65);                               // Nasenspitze
        K.paintBlob(c, 24.2, -5.6, 0.8, 0.55, 0.3, '#2a1a14', 0.95);                         // Nasenloch
        K.paintBlob(c, 12, -2.6, 5, 3.4, 0.2, C.pink, 0.4);                                   // Bäckchen
        K.curve(c, [[21.4, -11.6], [15, -11.2], [10, -9.6], [7.4, -7]], 'rgba(70,35,25,.8)', 0.6);   // Mund (Lächeln)
        K.curve(c, [[4, 4.6], [9.6, 5.4], [13.6, 3.4]], 'rgba(60,35,25,.8)', 1.2);              // Augenbrauenwulst
        K.bead(c, 9.2, 1.9, 2.2, { color: '#140c06', ring: '#e8c890', look: 0.25 });
      }), K.rim(K.S(neck, skull), { w: 0.24, color: rimc })) },
    { shapes: [ear], fill: C.pink, stroke: 'rgba(80,45,30,.6)' },
  ];

  return {
    id: 'pavian',
    parts: {
      head: { z: 3, pivot: K.pt(NB), layers: headLayers },
      armB: armPart(armF, true, SHO.map((v, i) => v - (i ? 0 : 2)), 1),
      body: { z: 2, layers: bodyLayers },
      armA: armPart(armN, false, SHO, 4),
      tail: { z: 1, pivot: K.pt([-20, 10]), layers: [{ shapes: [tail], fill: { top: C.furLo, bottom: C.fur }, stroke: null, deco: K.rim([tail], { w: 0.18, color: rimc }) }] },
    },
    anchors: { head: K.pt([21, 67]), mouth: K.pt([42, 58]), eye: K.pt([30, 69]), back: K.pt([-6, 62]), foot: K.pt([20, 0]), hand: K.pt([24, 25]) },
    meta: { name: 'Mantelpavian (Thot-Tier)', heightM: 0.8, lengthM: 0.7, pose: 'sit', ranges: { head: [0, 0.3], armA: [0, -0.9], armB: [0, -0.5], tail: [0, 0.3] }, swing: { head: [-0.2, 0.2], armA: [-0.5, 0], tail: [-0.2, 0.2] } },
  };
}
