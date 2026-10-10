// Heiliger Ibis (Threskiornis aethiopicus), ~75 cm: weißer Körper, nackter schwarzer Kopf und Hals, langer abwärts gebogener Schnabel,
// schwarze Schmuckfedern über dem Schwanz, dünne dunkle Beine. Der Vogel des Thot.
// Teile: body (Rumpf, Flügel, Schwanzfedern), neck (Hals + Kopf + Schnabel, Pivot an der Schulter: nicken, positiv = Kopf hoch,
//        negativ = Kopf nach unten/vorn), legA (fernes Bein), legB (nahes Bein) – Pivot Hüfte (beide hängen unter dem Bauch).
// Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';
import { birdLeg, plumes } from './_t_bird.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { white: '#fbf6e8', shade: '#ddd8cb', black: '#2c2a33', blackHi: '#4b4858', beak: '#34313a', leg: '#3a3036', legFar: '#251f25', ink: 'rgba(60,55,60,.8)' };
  const NP = [14, 54]; // Schulter/Halsansatz

  // ---- Rumpf: Tropfenform, leicht nach vorn geneigt ----
  const torso = K.S(K.blob(0, 49, 25, 16.5, 0.05), K.blob(14, 52, 14, 14), K.blob(-16, 46, 14, 11, -0.15));
  // Schwanz-/Schmuckfedern: dunkel, hängen über dem Bürzel
  const tailPl = plumes(K, [[-12, 52, -34, 43, 4.6], [-10, 49, -32, 36, 4.4], [-8, 46, -27, 30, 3.8]], 0.08);
  // angelegter Flügel: weiß, Handschwingen schwarz
  const wing = K.limb([[10, 56, 13], [-2, 52, 18], [-18, 45, 15], [-28, 38, 7]], { per: 12 });
  const wingTips = plumes(K, [[-14, 47, -31, 38, 3.0], [-10, 47, -27, 35, 2.8], [-6, 46, -23, 33, 2.6]], 0.06);
  const fluff = K.S(...[[16, 41], [10, 38], [3, 36], [-4, 36]].map(([x, y], i) => K.tuft(x, y, -1.9 + i * 0.05, 5, 3.4, 0.3)));

  // ---- Hals + Kopf + Schnabel (EIN Teil) ----
  const neckC = [[14, 52, 14], [21, 61, 9.4], [22, 69, 8], [26, 77, 7.6]];
  const neckL = K.limb(neckC, { per: 12 });
  const headB = K.blob(30, 78, 7.6, 6.8, 0.1);
  const beak = K.limb([[32, 77.5, 6.6], [41, 76.5, 5.2], [51, 72, 3.8], [58.5, 63.5, 1.0]], { per: 14 });
  const beakLow = K.limb([[34, 75.5, 2.4], [43, 74, 2.0], [52, 69.5, 1.4], [58, 63.4, 0.5]], { per: 10 });

  const neckPart = {
    z: 1, pivot: K.pt(NP), layers: [
      { shapes: K.S(neckL, headB), fill: { top: C.blackHi, bottom: C.black }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(0,0,0,.25)', light: 'rgba(160,150,180,.22)' });
          K.curve(c, [[19, 58], [23, 62], [20, 66]], 'rgba(150,140,170,.25)', 0.8);
          K.bead(c, 32, 79.5, 3.1, { color: '#120e12', ring: '#e7d6b0', look: 0.15 });
        }, K.rim(K.S(neckL, headB), { w: 0.18, color: 'rgba(20,18,24,.9)' })) },
      { shapes: [beak], fill: { top: '#4a4652', bottom: C.beak }, stroke: null,
        deco: K.deco((c) => { K.curve(c, [[35, 75.6], [44, 74.3], [53, 69.6]], 'rgba(230,225,240,.35)', 0.5); }, K.rim([beak], { w: 0.16, color: 'rgba(20,18,24,.9)' })) },
    ],
  };

  const bodyLayers = [
    { shapes: tailPl, fill: { top: C.blackHi, bottom: C.black }, stroke: null,
      deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(0,0,0,.2)', light: 'rgba(170,160,200,.3)' }); }, K.rim(tailPl, { w: 0.14, color: 'rgba(20,18,24,.9)' })) },
    { shapes: K.S(torso, fluff), fill: { top: C.white, bottom: C.shade }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(100,95,110,.28)', light: 'rgba(255,255,255,.3)' });
        K.fur(c, bb, '#bdb6a6', 14, 4.5, 0.5, { seed: 4, alpha: 0.4, ang: Math.PI + 0.25, spread: 0.4 });
      }, K.rim(K.S(torso, fluff), { w: 0.16, color: 'rgba(80,75,85,.85)' })) },
    { shapes: [wing], fill: { top: '#fffdf4', bottom: '#e6e1d4' }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(100,95,110,.2)', light: 'rgba(255,255,255,.2)' });
        for (let i = 0; i < 5; i++) K.curve(c, [[2 - i * 6, 55 - i * 2.2], [-3 - i * 6, 52 - i * 2.4], [-8 - i * 6, 48 - i * 2.6]], 'rgba(120,115,125,.3)', 0.55);
      }, K.rim([wing], { w: 0.14, color: 'rgba(80,75,85,.7)' })) },
    { shapes: wingTips, fill: { top: C.blackHi, bottom: C.black }, stroke: null, deco: K.rim(wingTips, { w: 0.12, color: 'rgba(20,18,24,.9)' }) },
  ];

  const leg = (hx, ax, far) => {
    const sh = birdLeg(K, [[hx, 40], [hx + 1.5, 24], [hx - 2.5, 11], [ax, 3]], 2.2, 7.5);
    return { z: 1, pivot: K.pt([hx, 40]), layers: [{ shapes: sh, fill: far ? C.legFar : C.leg, stroke: null, deco: K.rim(sh, { w: 0.1, color: 'rgba(20,18,24,.7)' }) }] };
  };

  const parts = {
    neck: neckPart,
    body: { z: 2, layers: bodyLayers },
    legA: leg(-6, -2, true),
    legB: leg(6, 8, false),
  };
  return {
    id: 'ibis', parts,
    anchors: { head: K.pt([30, 78]), mouth: K.pt([58, 64]), eye: K.pt([31, 79]), back: K.pt([-2, 66]), foot: K.pt([0, 0]), shoulder: K.pt(NP) },
    meta: {
      name: 'Heiliger Ibis', heightM: 0.75, lengthM: 0.75,
      ranges: { neck: [0, -0.5], legA: [0, 0.3], legB: [0, -0.3] },
      swing: { neck: [-0.35, 0.2], legA: [-0.3, 0.3], legB: [0.3, -0.3] },
    },
  };
}
