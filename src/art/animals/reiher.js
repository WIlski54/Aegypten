// Graureiher (Ardea cinerea), ~1 m: blaugrauer Rücken, weißer Hals und Kopf, schwarzer Streif über dem Auge mit Nackenschopf,
// langer gelber Dolchschnabel, lange gelbbraune Beine. Steht in der Ägyptischen Kunst für den Bennu-Vogel (Phönix, Sonne, Neubeginn).
// Teile: body (Rumpf, Flügel, Schwanz), neck (S-förmiger Hals + Kopf + Schnabel, Pivot an der Schulter; negativ = Hals streckt nach vorn/unten),
//        legA (fernes Bein), legB (nahes Bein) – Pivot Hüfte. Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';
import { birdLeg, plumes } from './_t_bird.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { back: '#93a1ad', backLo: '#73828f', white: '#f6f3ea', shade: '#d9d6cb', black: '#2a2c34', beak: '#f0b43a', beakLo: '#d98f2a', leg: '#b69a62', legFar: '#8f7745' };
  const NP = [13, 66];

  const torso = K.S(K.blob(0, 62, 24, 14, 0.2), K.blob(14, 67, 13, 13.5), K.blob(-17, 58, 13, 9.5, 0.3));
  const tailPl = plumes(K, [[-16, 58, -42, 49, 4.6], [-12, 55, -38, 44, 4.2]], 0.06);
  const wing = K.limb([[10, 68, 13], [-4, 64, 17], [-20, 57, 14], [-34, 50, 5]], { per: 12 });
  const flightF = plumes(K, [[-16, 57, -40, 47, 3.0], [-12, 56, -35, 45, 2.8], [-8, 56, -30, 44, 2.6]], 0.06);
  // lange Schmuckfedern an der Brust (Reiher-typische Zotteln) und Schulter
  const breastPl = plumes(K, [[24, 62, 25.5, 51, 3.4], [20, 60, 20.5, 50, 3.2], [16, 58, 15, 49, 3.0]], -0.05);
  const scapPl = plumes(K, [[4, 70, -14, 55, 2.6], [8, 70, -8, 56, 2.4]], 0.1);

  // ---- Hals: elegante S-Kurve ----
  const neckC = [[13, 66, 14], [23, 75, 10.4], [17, 85, 8], [18, 94, 7], [24, 101, 7]];
  const neckL = K.limb(neckC, { per: 14 });
  const headB = K.blob(28, 102, 8, 6.6, 0.1);
  const beak = K.limb([[32, 102.5, 6], [46, 99.6, 4], [64, 94.6, 1.0]], { per: 12 });
  const beakLo = K.limb([[33, 100.5, 2.4], [48, 97.5, 1.8], [62, 93.6, 0.6]], { per: 10 });
  const crest = plumes(K, [[22, 104, 4, 98, 1.7], [23, 103, 6, 92, 1.5]], -0.12);

  const neckPart = {
    z: 1, pivot: K.pt(NP), layers: [
      { shapes: crest, fill: C.black, stroke: null, deco: K.rim(crest, { w: 0.1, color: C.black }) },
      { shapes: K.S(neckL, headB), fill: { top: C.white, bottom: C.shade }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(100,100,110,.2)', light: 'rgba(255,255,255,.2)' });
          // schwarzer Augenstreif + Nackenband
          K.paintBlob(c, 24, 104, 7.4, 2.4, 0.15, C.black, 0.95);
          K.curve(c, [[16, 103], [10, 100], [5, 96]], C.black, 1.6);
          // Halsstreifen (Brust-Tropfen vorne)
          for (let i = 0; i < 4; i++) K.curve(c, [[24 - i * 1.1, 78 + i * 2.5], [22.4 - i * 1.1, 76 + i * 2.5]], 'rgba(60,64,76,.65)', 1.1);
          K.bead(c, 29, 103.4, 3.1, { color: '#171212', ring: '#f2cc58', look: 0.15 });
        }, K.rim(K.S(neckL, headB), { w: 0.18, color: 'rgba(80,80,92,.8)' })) },
      { shapes: [beak], fill: { top: '#f6c85a', bottom: C.beakLo }, stroke: null,
        deco: K.deco((c) => { K.curve(c, [[34, 101.6], [48, 98.2], [60, 94.8]], 'rgba(120,70,10,.5)', 0.45); }, K.rim([beak], { w: 0.14, color: 'rgba(120,80,20,.9)' })) },
    ],
  };

  const bodyLayers = [
    { shapes: K.S(tailPl, flightF), fill: { top: '#8a97a4', bottom: '#4c5764' }, stroke: null, deco: K.rim(K.S(tailPl, flightF), { w: 0.14, color: 'rgba(40,46,58,.9)' }) },
    { shapes: torso, fill: { stops: [[0, C.back], [0.45, C.back], [0.6, C.white], [1, C.shade]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(90,95,110,.25)', light: 'rgba(255,255,255,.22)' });
        K.fur(c, bb, '#6f7d8b', 12, 5, 0.6, { seed: 7, alpha: 0.35, ang: Math.PI + 0.2, spread: 0.3 });
        // schwarze Schulterflecken
        K.paintBlob(c, 12, 70, 5, 3.2, 0.5, C.black, 0.85);
      }, K.rim(torso, { w: 0.16, color: 'rgba(80,80,92,.85)' })) },
    { shapes: breastPl, fill: { top: '#fcfaf2', bottom: '#cfcbbf' }, stroke: null, deco: K.rim(breastPl, { w: 0.1, color: 'rgba(110,110,118,.7)' }) },
    { shapes: [wing], fill: { top: '#a1aeb9', bottom: '#7e8c99' }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(40,50,70,.22)', light: 'rgba(255,255,255,.16)' });
        for (let i = 0; i < 5; i++) K.curve(c, [[4 - i * 6.5, 67 - i * 2.6], [-1 - i * 6.5, 63 - i * 2.8], [-6 - i * 6.5, 60 - i * 3]], 'rgba(60,72,90,.35)', 0.55);
      }, K.rim([wing], { w: 0.14, color: 'rgba(60,70,84,.8)' })) },
    { shapes: scapPl, fill: { top: '#b5c1cb', bottom: '#8795a2' }, stroke: null, deco: K.rim(scapPl, { w: 0.1, color: 'rgba(60,70,84,.7)' }) },
  ];

  const leg = (hx, ax, far) => {
    const sh = birdLeg(K, [[hx, 54], [hx + 1.2, 36], [hx - 1.2, 20], [ax, 3.5]], 2.6, 10);
    return { z: 1, pivot: K.pt([hx, 54]), layers: [{ shapes: sh, fill: far ? C.legFar : C.leg, stroke: null, deco: K.rim(sh, { w: 0.1, color: 'rgba(70,50,20,.75)' }) }] };
  };

  const parts = {
    neck: neckPart,
    body: { z: 2, layers: bodyLayers },
    legA: leg(-5, -2, true),
    legB: leg(7, 9, false),
  };
  return {
    id: 'reiher', parts,
    anchors: { head: K.pt([28, 102]), mouth: K.pt([64, 95]), eye: K.pt([28.6, 103]), back: K.pt([-2, 76]), foot: K.pt([0, 0]), shoulder: K.pt(NP) },
    meta: {
      name: 'Graureiher', heightM: 1.05, lengthM: 0.9,
      ranges: { neck: [0, -0.45], legA: [0, 0.3], legB: [0, -0.3] },
      swing: { neck: [-0.3, 0.15], legA: [-0.3, 0.3], legB: [0.3, -0.3] },
    },
  };
}
