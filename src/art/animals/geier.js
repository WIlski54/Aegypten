// Geier (Gänsegeier Gyps fulvus), Schutzgöttin Nechbet von Elkab, ~80 cm Körperhöhe: sandbraunes Gefieder, dunkle Schwingen,
// heller Federkragen, kahler rosagrauer Kopf, Hakenschnabel (hier bewusst sanft). Standard: Flügel weit GEÖFFNET (wie auf der Königskrone / dem Stirnband).
// Teile: body (Rumpf, Schwanz, Fänge, Federkragen), neck (Hals + Kopf, Pivot Schulter; ±0,35 nicken),
//        wing (nahe Schwinge, Pivot Schulter; Ruhe = offen, positiv = Flügel schließt sich nach hinten-unten, max 2.0 = angelegt),
//        wing2 (ferne Schwinge, gleiche Logik; ist etwas höher gespreizt). Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';
import { birdLeg, plumes } from './_t_bird.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { body: '#b48f5e', bodyHi: '#cdaa77', belly: '#e0c898', cov: '#c9a672', dark: '#4a3a2c', darkHi: '#6a5440', ruff: '#f4ecd8', skin: '#cfa89a', beak: '#d7c58e', beakTip: '#5a4a36', leg: '#a8a08c', ink: 'rgba(70,50,30,.9)' };
  const SH = [4, 44];   // Schulter / Pivot der Flügel
  const NP = [10, 46];  // Halsansatz

  // ---- Rumpf: kräftig, nach vorn geneigt ----
  const torso = K.S(K.blob(0, 34, 18, 13.5, 0.55), K.blob(9, 40, 11, 11, 0), K.blob(-9, 26, 9, 8, 0.4));
  const tailF = plumes(K, [[-10, 24, -24, 8, 5], [-7, 23, -17, 5, 4.6], [-12, 25, -27, 14, 4.6]], 0.05);
  const leg = (x) => birdLeg(K, [[x, 26], [x + 1, 16], [x, 6], [x + 0.5, 3.5]], 5, 11, { spread: 1 });
  const legF = leg(-1), legN = leg(5);
  const ruff = K.S(...[0, 1, 2, 3, 4, 5, 6].map((i) => { const a = 0.4 + i * 0.5; return K.tuft(10 + Math.cos(a) * 6, 49 + Math.sin(a) * 4 - 6, a + 0.9, 7, 5.6, 0.2); }), K.blob(11, 47, 7.5, 7.5));

  const bodyLayers = [
    { shapes: tailF, fill: { top: C.darkHi, bottom: C.dark }, stroke: null, deco: K.rim(tailF, { w: 0.16, color: 'rgba(30,22,14,.9)' }) },
    { shapes: legF, fill: '#8c8570', stroke: null, deco: K.rim(legF, { w: 0.16, color: 'rgba(40,30,20,.85)' }) },
    { shapes: legN, fill: C.leg, stroke: null, deco: K.rim(legN, { w: 0.16, color: 'rgba(40,30,20,.85)' }) },
    { shapes: torso, fill: { top: C.bodyHi, bottom: C.body }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,40,20,.22)', light: 'rgba(255,240,200,.18)' });
        K.paintBlob(c, 9, 30, 7, 9, 0.2, C.belly, 0.8);
        K.fur(c, bb, '#7a5a38', 14, 5, 0.6, { seed: 8, alpha: 0.35, ang: Math.PI * 1.3 });
      }, K.rim(torso, { w: 0.2, color: C.ink })) },
    { shapes: ruff, fill: { top: '#ffffff', bottom: C.ruff }, stroke: null,
      deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(100,80,60,.2)', light: 'rgba(255,255,255,.2)' }); }, K.rim(ruff, { w: 0.14, color: 'rgba(110,90,70,.8)' })) },
  ];

  // ---- Hals + Kopf (Pivot an der Schulter) ----
  const neckC = [[10, 46, 12], [15, 52, 9], [19, 58, 7.6], [22, 63, 7.4]];
  const neckL = K.limb(neckC, { per: 10 });
  const headB = K.S(K.blob(24, 64.4, 7.6, 6.9, 0.1), K.blob(28.6, 62, 5, 4, -0.2));
  const beak = K.poly([[28.4, 66], [33, 66.2], [36.2, 63.4], [36, 59.6], [34.2, 60.4], [32, 62.4], [28.6, 62.6]], 1.5);
  const neckPart = {
    z: 1, pivot: K.pt(NP), layers: [
      { shapes: K.S(neckL, headB), fill: { top: '#d8b4a6', bottom: C.skin }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(90,50,40,.2)', light: 'rgba(255,230,210,.18)' });
          K.fur(c, bb, '#fff8ea', 10, 3.2, 0.5, { seed: 5, alpha: 0.7, ang: Math.PI * 1.45, spread: 0.7 });   // wolliger Flaum
          K.bead(c, 26.4, 65.6, 2.3, { color: '#140c06', ring: '#e8b24a', look: 0.2 });
          K.curve(c, [[23.2, 67.8], [26.4, 68.6], [29, 67.2]], 'rgba(90,50,40,.5)', 0.6);
        }, K.rim(K.S(neckL, headB), { w: 0.18, color: C.ink })) },
      { shapes: [beak], fill: { top: '#e8d8a4', bottom: C.beak }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 35, 61.4, 1.3, 2.2, 0.2, C.beakTip, 0.9); K.curve(c, [[30, 63.2], [34, 62.4]], 'rgba(70,50,30,.55)', 0.4); }, K.rim([beak], { w: 0.14, color: C.ink })) },
    ],
  };

  // ---- Flügel (offen als Fächer um die Schulter) ----
  const mkWing = (far) => {
    const rot = far ? -0.4 : 0, dx = far ? -2 : 0, dy = far ? 2 : 0;
    const rt = [SH[0] + dx, SH[1] + dy];
    const feathers = [];
    const N = 9;
    for (let i = 0; i < N; i++) {
      const a = (112 + i * 10.5) * Math.PI / 180 + rot, len = 60 - i * 2.8;
      feathers.push(K.limb([[rt[0] + Math.cos(a) * 8, rt[1] + Math.sin(a) * 8, 6.4], [rt[0] + Math.cos(a) * len * 0.6, rt[1] + Math.sin(a) * len * 0.6, 7.4], [rt[0] + Math.cos(a + 0.02) * len, rt[1] + Math.sin(a + 0.02) * len, 3.6], [rt[0] + Math.cos(a + 0.02) * (len + 2), rt[1] + Math.sin(a + 0.02) * (len + 2), 0.8]], { per: 8 }));
    }
    const am = (126 * Math.PI) / 180 + rot;
    const covBlob = K.S(
      K.limb([[rt[0], rt[1], 16], [rt[0] + Math.cos(am) * 20, rt[1] + Math.sin(am) * 20, 15], [rt[0] + Math.cos(am) * 38, rt[1] + Math.sin(am) * 38, 8], [rt[0] + Math.cos(am) * 44, rt[1] + Math.sin(am) * 44, 2]], { per: 10 }),
      K.blob(rt[0] + Math.cos(am + 0.8) * 14, rt[1] + Math.sin(am + 0.8) * 14, 12, 13, am));
    return {
      z: far ? 0 : 3, pivot: K.pt(rt), layers: [
        { shapes: feathers, fill: far ? { top: '#4a3a2c', bottom: '#33281e' } : { top: C.darkHi, bottom: C.dark }, stroke: null,
          deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(20,10,0,.25)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,230,180,.15)' }); }, K.rim(feathers, { w: 0.14, color: 'rgba(25,18,10,.9)' })) },
        { shapes: covBlob, fill: far ? { top: '#a07e52', bottom: '#82633e' } : { top: C.cov, bottom: C.body }, stroke: null,
          deco: K.deco((c, bb) => {
            K.shade(c, bb, { dark: 'rgba(60,40,20,.2)', light: 'rgba(255,240,200,.18)' });
            const tf = rt; for (let q = 0; q < 3; q++) for (let r = 0; r < 4; r++) K.paintBlob(c, tf[0] + Math.cos(am + (q - 1) * 0.28) * (10 + r * 7), tf[1] + Math.sin(am + (q - 1) * 0.28) * (10 + r * 7), 1.8, 1.2, am, far ? '#c0a070' : '#e2c795', 0.7);
          }, K.rim(covBlob, { w: 0.16, color: C.ink })) },
      ],
    };
  };

  return {
    id: 'geier',
    parts: { wing2: mkWing(true), neck: neckPart, body: { z: 2, layers: bodyLayers }, wing: mkWing(false) },
    anchors: { head: K.pt([25, 63]), mouth: K.pt([35, 61]), eye: K.pt([26, 65]), back: K.pt([-2, 44]), foot: K.pt([2, 0]), shoulder: K.pt(SH), crown: K.pt([24, 71]) },
    meta: { name: 'Geier (Nechbet)', heightM: 0.8, lengthM: 0.8, ranges: { neck: [0, 0.35], wing: [0, 2.0], wing2: [0, 1.9] }, swing: { neck: [-0.25, 0.25], wing: [-0.25, 0.25], wing2: [-0.25, 0.25] } },
  };
}
