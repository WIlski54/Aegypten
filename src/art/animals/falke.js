// Falke (Horusfalke, Falco peregrinus/biarmicus), ~40 cm hoch, sitzend: aufrechte Haltung, gebänderter Rücken, helle Brust mit Tropfen,
// gelbe Wachshaut und Fänge, die typische dunkle Wangenzeichnung ("Horusauge"). Das Tier des Horus.
// Teile: body (Rumpf, Schwanz, Fänge), head (Kopf mit Hakenschnabel, Pivot am Hals; ±0,35 drehen/nicken),
//        wing (nahe Schwinge, Pivot Schulter; negativ = Flügel hebt/öffnet sich nach hinten-oben), wing2 (ferne Schwinge, gleiche Logik).
// Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';
import { birdLeg, plumes } from './_t_bird.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { back: '#6d5f52', backHi: '#857463', dark: '#3c332c', cream: '#f2e6c8', creamLo: '#d8c7a0', yellow: '#f0c23c', beak: '#d6d2c8', beakTip: '#4a4540', ink: 'rgba(55,42,32,.9)' };
  const SH = [2, 28.5]; // Schulter
  const NK = [3.5, 31]; // Halsansatz

  // ---- Rumpf: aufrechtes Ei, leicht nach vorn geneigt ----
  const torso = K.S(K.blob(0, 20, 9.6, 14, -0.14, 40), K.blob(3.5, 26, 7.5, 9, 0.0), K.blob(-2, 11, 7, 9, -0.2));
  const tailF = plumes(K, [[-4, 11, -11, -1, 3.4], [-2, 10, -7, -2, 3.2], [-6, 12, -14, 3, 3.2]], 0.05);
  const leg = (x, far) => {
    const sh = [K.limb([[x, 9, 3.8], [x + 0.4, 4, 3.2]], { per: 6 }),
      K.limb([[x + 0.4, 3.6, 3], [x + 4.2, 1.3, 2.2], [x + 6.6, 1.0, 1.2]], { per: 5 }), K.limb([[x + 0.4, 3.6, 3], [x + 3.4, 2.3, 2], [x + 5, 2.4, 1.1]], { per: 5 }),
      K.limb([[x + 0.2, 3.6, 2.6], [x - 3, 1.4, 1.8]], { per: 4 })];
    return { shapes: sh, far };
  };
  const legs = [leg(-3, true), leg(2, false)];

  const bodyLayers = [
    { shapes: tailF, fill: { top: '#7a6a5a', bottom: '#4c4036' }, stroke: null,
      deco: K.deco((c) => { for (let i = 0; i < 3; i++) K.curve(c, [[-5 - i * 2.4, 10 - i * 3.6], [-8 - i * 2.4, 8 - i * 3.6]], 'rgba(40,30,22,.5)', 0.9); }, K.rim(tailF, { w: 0.14, color: C.ink })) },
    { shapes: legs[0].shapes, fill: '#d6a43a', stroke: null, deco: K.rim(legs[0].shapes, { w: 0.14, color: 'rgba(90,60,20,.9)' }) },
    { shapes: legs[1].shapes, fill: C.yellow, stroke: null, deco: K.rim(legs[1].shapes, { w: 0.14, color: 'rgba(110,70,20,.9)' }) },
    { shapes: torso, fill: { stops: [[0, C.back], [0.45, C.backHi], [0.62, C.cream], [1, C.creamLo]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,40,20,.2)', light: 'rgba(255,240,210,.2)' });
        // Brusttropfen
        for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) K.paintBlob(c, 4.4 + q * 2.7 - r * 0.4, 28 - r * 4.2, 0.8, 1.4, 0, '#6a5646', 0.7);
        K.fur(c, bb, C.dark, 12, 3.5, 0.5, { seed: 3, alpha: 0.28, ang: Math.PI * 1.45 });
      }, K.rim(torso, { w: 0.18, color: C.ink })) },
  ];

  // ---- Kopf (Pivot am Hals) ----
  const headB = K.S(K.blob(6, 38.5, 7.4, 6.9, 0.0), K.limb([[3.4, 31, 9], [4.4, 35, 8.6], [5, 39, 7.6]], { per: 8 }));
  const beak = K.poly([[11.6, 40.2], [15.0, 39.6], [16.6, 37.2], [16.4, 33.6], [14.8, 35.2], [12.4, 36], [11.2, 37.4]], 1.5);
  const cere = K.blob(12.2, 39.0, 1.6, 1.2, 0.3);
  const headPart = {
    z: 1, pivot: K.pt(NK), layers: [
      { shapes: headB, fill: { top: '#7a6a5a', bottom: '#cdbfa0' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,40,20,.18)', light: 'rgba(255,240,210,.18)' });
          K.paintBlob(c, 7.4, 34.6, 5, 3.4, -0.2, C.cream, 0.95);                       // helle Wange / Kehle
          // Horus-Zeichnung: schwarzer Wangenstreif unter dem Auge + Schlieren nach hinten
          K.curve(c, [[8.6, 37.4], [8.9, 34.6], [8, 31.6]], '#1c1612', 1.5);
          K.curve(c, [[7.0, 38.2], [3.6, 37.6], [1.6, 35.6]], '#1c1612', 0.8);
          K.paintBlob(c, 3.6, 42.2, 4.8, 2.4, 0.1, '#5a4a3c', 0.85);                  // dunkle Kappe
          K.bead(c, 8.2, 39.4, 1.7, { color: '#100c08', ring: '#f2cf5a', look: 0.2 });
        }, K.rim(headB, { w: 0.18, color: C.ink })) },
      { shapes: [beak], fill: { top: '#e2ded4', bottom: '#9d998f' }, stroke: null, deco: K.deco((c) => { K.paintBlob(c, 15.6, 34.4, 1.2, 1.8, 0.2, C.beakTip, 0.9); K.curve(c, [[12.2, 36.2], [14.4, 35.6]], 'rgba(40,35,30,.6)', 0.3); }, K.rim([beak], { w: 0.14, color: C.ink })) },
      { shapes: [cere], fill: C.yellow, stroke: 'rgba(110,70,20,.9)' },
    ],
  };

  // ---- Flügel (angelegt; Pivot Schulter) ----
  const mkWing = (far) => {
    const dx = far ? -3.4 : 0, dy = far ? 1.2 : 0;
    const arm = K.limb([[SH[0] + dx, SH[1] + dy, 9], [-1.5 + dx, 22.5 + dy, 11], [-6 + dx, 14 + dy, 9.4], [-9.4 + dx, 5 + dy, 4.2]], { per: 12 });
    const fl = plumes(K, [[-4 + dx, 17 + dy, -10.6 + dx, 2 + dy, 3.4], [-6 + dx, 17 + dy, -13.2 + dx, 5 + dy, 3.2], [-2 + dx, 17 + dy, -7.6 + dx, 1 + dy, 3.2], [-8 + dx, 18 + dy, -15 + dx, 9 + dy, 3]], 0.04);
    return {
      z: far ? 0 : 3, pivot: K.pt([SH[0] + dx, SH[1] + dy]), layers: [
        { shapes: fl, fill: far ? '#3f352d' : '#4a3f35', stroke: null, deco: K.rim(fl, { w: 0.12, color: 'rgba(30,24,18,.9)' }) },
        { shapes: [arm], fill: far ? { top: '#5a4e43', bottom: '#4a4036' } : { top: '#8a7966', bottom: '#6d5f52' }, stroke: null,
          deco: K.deco((c, bb) => {
            K.shade(c, bb, { dark: 'rgba(30,20,10,.25)', light: 'rgba(255,240,210,.14)' });
            for (let i = 0; i < 3; i++) for (let q = 0; q < 3; q++) K.paintBlob(c, -1 - i * 2.2 - q * 0.6 + dx, 24 - q * 4.8 + dy, 1.0, 0.7, 0.2, far ? '#6a5d51' : '#a4927b', 0.7);
            for (let q = 0; q < 3; q++) K.curve(c, [[-3 - q * 1.6 + dx, 18 - q * 3.2 + dy], [-5 - q * 1.6 + dx, 17.2 - q * 3.2 + dy]], 'rgba(30,22,14,.45)', 0.5);
          }, K.rim([arm], { w: 0.16, color: C.ink })) },
      ],
    };
  };

  return {
    id: 'falke',
    parts: { wing2: mkWing(true), head: headPart, body: { z: 2, layers: bodyLayers }, wing: mkWing(false) },
    anchors: { head: K.pt([6, 38.5]), mouth: K.pt([15.5, 34.5]), eye: K.pt([8.2, 39.4]), back: K.pt([-2, 32]), foot: K.pt([2, 0]), shoulder: K.pt(SH), crown: K.pt([4, 45]) },
    meta: { name: 'Falke (Horusfalke)', heightM: 0.45, lengthM: 0.4, ranges: { head: [0, 0.3], wing: [0, -1.5], wing2: [0, -1.3] }, swing: { head: [-0.25, 0.25], wing: [-1.2, 0], wing2: [-1.1, 0] } },
  };
}
