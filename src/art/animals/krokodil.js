// Nilkrokodil (Crocodylus niloticus), ~4,5 m: lange Schnauze, Augenbuckel, Rückenschilde, kräftiger Schwanz, freundliches Lächeln.
// Teile: body (Rumpf, Kopf, Rückenschilde), jaw (Unterkiefer, Pivot Kiefergelenk, negativ = auf),
//        tail (Pivot Hüfte; schwingt, negativ = Spitze nach oben), legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte,
//        armA (nahes Vorderbein), armB (fernes) – Pivot Schulter. Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { top: '#7c8a3e', mid: '#9aa14a', belly: '#efe3a8', dark: '#4a5526', far: '#58652e', farB: '#8a8f4c', gold: '#e8b93c', ink: 'rgba(40,48,20,.9)' };
  const rimc = 'rgba(40,48,20,.9)';

  // ---- Rumpf mit Hals, Schultern und Hüfte ----
  const spine = [[-70, 44, 54], [-30, 44, 60], [10, 44, 62], [50, 44, 52], [74, 46, 44]];
  const torso = K.S(K.limb(spine, { per: 10 }), K.blob(-10, 38, 78, 26, 0.0));
  // Kopf: lange Schnauze mit Nasenknolle, Augenbuckel
  const head = K.poly([
    [58, 66], [84, 73], [112, 65], [140, 59], [166, 56], [181, 58], [186, 50], [182, 39], [160, 33], [120, 32], [84, 33], [60, 35], [52, 46],
  ], 2);
  const noseKnob = K.blob(173, 60, 10, 7.5, 0.1);
  const eyeBump = K.S(K.blob(86, 76, 12, 9, 0.1), K.blob(84, 70, 11, 11));
  const nostril = null;
  const tailBase = [[-60, 44, 46], [-100, 40, 36], [-140, 34, 27], [-185, 29, 18], [-225, 25, 11], [-265, 22, 4]];
  const tail = K.limb(tailBase, { per: 12 });
  // Rückenschilde: Reihe kleiner Dreiecke über Rücken und Schwanz
  const scutesBody = K.ridge([[70, 44, 52], [30, 44, 62], [-10, 44, 62], [-50, 44, 56], [-60, 44, 46]], { every: 9, h: 5.2, w: 7.5, side: -1, from: 0, to: 1 });
  const scutesTail = K.ridge([[-60, 44, 46], [-100, 40, 36], [-140, 34, 27], [-185, 29, 18], [-225, 25, 11], [-262, 22, 5]], { every: 9, h: 4.4, w: 7, side: -1, from: 0.0, to: 1 });

  // ---- Beine: gewinkelt, mit gespreizten Zehen ----
  const legShape = (hx, hy, kx, ky, fx, w) => K.S(
    K.limb([[hx, hy, w * 1.2], [kx, ky, w], [fx - 4, 7, w * 0.8]], { per: 10 }),
    K.limb([[fx - 6, 5, w * 0.9], [fx + 10, 2.4, w * 0.6], [fx + 20, 2.0, w * 0.35]], { per: 6 }),
    K.limb([[fx - 6, 5, w * 0.8], [fx + 7, 4.2, w * 0.5], [fx + 15, 5.5, w * 0.3]], { per: 6 }),
    K.blob(fx - 2, 4, 9, 4.6, 0.0));
  const hindNear = K.S(K.blob(-60, 36, 20, 17, 0.0), legShape(-60, 36, -76, 15, -60, 12));
  const hindFar = legShape(-46, 36, -34, 16, -26, 11);
  const foreNear = K.S(K.blob(46, 36, 17, 15, 0.0), legShape(46, 36, 34, 15, 52, 10.5));
  const foreFar = legShape(60, 36, 74, 15, 80, 10);
  const claws = (c, x, y) => { for (let i = 0; i < 3; i++) K.paintBlob(c, x + 12 + i * 3.2, y - 0.6 + (i - 1) * 0.0, 0.9, 0.9, 0, '#f0e6c0', 0.9); };
  const legPart = (shapes, far, piv, z, tx) => ({
    z, pivot: K.pt(piv), layers: [
      { shapes, fill: far ? { top: C.far, bottom: C.farB } : { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(20,28,5,.28)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,250,200,.18)' });
          K.scaleMarks(c, bb, 'rgba(40,50,15,.5)', 3.4, { alpha: 0.35 }); }, K.rim(shapes, { w: 0.2, color: rimc })) },
    ],
  });

  // ---- Körper ----
  const bodyLayers = [
    { shapes: K.S(torso, head, noseKnob, eyeBump, scutesBody), fill: { stops: [[0, C.dark], [0.28, C.top], [0.62, C.mid], [0.82, C.belly], [1, C.belly]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(30,40,5,.12)', light: 'rgba(255,250,200,.18)' });
        // Rückenbänder (dunkle Querstreifen)
        for (let i = 0; i < 8; i++) K.curve(c, [[-62 + i * 15, 82], [-60 + i * 15, 62], [-66 + i * 15, 48]], 'rgba(50,60,18,.42)', 5.5 - i * 0.2);
        K.scaleMarks(c, bb, 'rgba(40,50,15,.5)', 4.2, { alpha: 0.3 });
        // helle Bauchplatten
        for (let i = 0; i < 12; i++) K.curve(c, [[-66 + i * 11, 22], [-64 + i * 11, 28]], 'rgba(150,130,60,.5)', 0.7);
        // Kopf: Lippenlinie mit Lächeln, Zähne, Nasenloch, Auge
        K.paintBlob(c, 120, 43, 62, 6, 0.0, '#f5ecb8', 0.55);
        K.curve(c, [[184, 44], [160, 38], [120, 36], [88, 38], [68, 44], [60, 49]], C.ink, 1.0);
        K.paintBlob(c, 175, 63, 2.6, 1.5, 0.0, '#2a3010', 1);
        K.paintBlob(c, 108, 48, 14, 7, 0.0, '#c7d36a', 0.18);
        K.bead(c, 88, 75, 6.2, { color: '#241c08', ring: '#e8b93c', look: 0.2 });
        K.curve(c, [[76, 83], [86, 87], [97, 83]], 'rgba(40,50,15,.6)', 1.0);
        K.curve(c, [[130, 62], [152, 58]], 'rgba(255,255,230,.3)', 1.2);
      }, K.rim(K.S(torso, head, noseKnob, eyeBump, scutesBody), { w: 0.22, color: rimc })) },
    // wenige, einfache Zähne (stumpfe Dreiecke an der Oberlippe)
    { shapes: [[168, 36], [150, 33.5], [132, 32.5], [114, 32.5], [98, 33]].map(([x, y]) => K.poly([[x - 3, y + 0.5], [x + 0.3, y - 5.4], [x + 3, y + 0.5]], 0)), fill: '#fffaea', stroke: 'rgba(90,80,40,.55)' },
  ];

  // ---- Unterkiefer ----
  const jawShape = K.poly([[56, 38], [90, 34], [130, 32], [170, 33], [180, 36], [178, 41], [150, 36.5], [110, 36.5], [80, 40], [60, 46]], 1);
  const jawBody = K.S(K.limb([[58, 34, 14], [100, 29, 11], [140, 29, 8], [176, 34, 6]], { per: 10 }), jawShape);
  const jawTeeth = [[160, 34.5], [140, 32], [120, 31], [102, 31]].map(([x, y]) => K.poly([[x - 2.6, y], [x, y + 4.6], [x + 2.6, y]], 0));
  const jaw = {
    z: 0, pivot: K.pt([62, 40]), layers: [
      { shapes: jawBody, fill: { top: C.mid, bottom: C.belly }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(30,40,5,.15)' }); K.paintBlob(c, 118, 36, 52, 3.6, 0, '#d5707a', 0.9); }, K.rim(jawBody, { w: 0.2, color: rimc })) },
      { shapes: jawTeeth, fill: '#fffaea', stroke: 'rgba(90,80,40,.55)' },
    ],
  };

  const tailPart = {
    z: 1, pivot: K.pt([-58, 44]), layers: [
      { shapes: K.S(tail, scutesTail), fill: { stops: [[0, C.dark], [0.4, C.top], [0.72, C.mid], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,40,5,.1)', light: 'rgba(255,250,200,.16)' });
          for (let i = 0; i < 9; i++) K.curve(c, [[-80 - i * 20, 64], [-78 - i * 20, 38], [-82 - i * 20, 14]], 'rgba(50,60,18,.45)', 5.2 - i * 0.4);
          K.scaleMarks(c, bb, 'rgba(40,50,15,.5)', 3.8, { alpha: 0.28 });
        }, K.rim(K.S(tail, scutesTail), { w: 0.2, color: rimc })) },
    ],
  };

  const parts = {
    body: { z: 2, layers: bodyLayers },
    jaw,
    tail: tailPart,
    legA: { ...legPart(hindFar, true, [-46, 36], 1), },
    armB: legPart(foreFar, true, [60, 36], 1),
    legB: legPart(hindNear, false, [-60, 36], 3),
    armA: legPart(foreNear, false, [46, 36], 3),
  };
  const sw = [-0.3, 0.3];
  return {
    id: 'krokodil', parts,
    anchors: { head: K.pt([120, 52]), mouth: K.pt([180, 40]), eye: K.pt([88, 70]), back: K.pt([0, 66]), foot: K.pt([0, 0]), tailTip: K.pt([-265, 22]) },
    meta: {
      name: 'Nilkrokodil', lengthM: 4.5, heightM: 0.8,
      ranges: { jaw: [0, -0.6], tail: [0, -0.3], legA: [0, 0.3], legB: [0, -0.3], armA: [0, -0.3], armB: [0, 0.3] },
      swing: { tail: [-0.3, 0.12], legA: sw, legB: sw, armA: sw, armB: sw },
      gait: [['legB', 'armB'], ['legA', 'armA']],
    },
  };
}
