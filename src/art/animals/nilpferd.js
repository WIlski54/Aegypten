// Nilpferd (Hippopotamus amphibius), ~4 m lang, 1,5 m Schulterhöhe. Rundes, freundliches Gesicht, kleine Ohren, Augen und
// Nasenlöcher auf dem Kopf (so schaut es aus dem Wasser), pinke Schnauze und Bäuchlein.
// Teile: body (Rumpf, Kopf, Ohr, kurzer Schwanz), jaw (Unterkiefer, Pivot Kiefergelenk; negativ = Maul auf),
//        legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte; armA (nahes Vorderbein), armB (fernes) – Pivot Schulter.
// Entwurf in cm (u = 0,01 m); Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.0086);   // 1 Einheit = 0,86 cm: Nilpferd ~4 m lang
  const C = { top: '#8d7886', mid: '#a28b97', low: '#c9a4a4', belly: '#e3bcb2', pink: '#e9a1a0', far: '#6e5b6a', farB: '#8b7685', dark: '#4b3a48', hoof: '#d8c4b8', ink: 'rgba(58,40,56,.9)' };
  const rimc = 'rgba(58,40,56,.9)';

  // ---- Rumpf: große Tonne, tief hängender Bauch ----
  const trunk = K.S(K.blob(-30, 100, 148, 64, 0.0), K.blob(75, 98, 62, 62), K.blob(-118, 104, 62, 58), K.blob(10, 80, 130, 46));
  // Hals/Kopf-Übergang: Nacken füllt die Lücke zwischen Rumpf und Schädel
  const neckFill = K.blob(112, 108, 40, 52, 0.3);
  // ---- Kopf: breiter Kasten mit gerundeter Schnauze ----
  const head = K.poly([
    [104, 150], [126, 162], [152, 166], [180, 160], [210, 154], [240, 150], [264, 142], [278, 124], [282, 100], [272, 86],
    [240, 80], [200, 82], [160, 84], [130, 80], [104, 86], [92, 108], [94, 130],
  ], 2);
  // ---- Augenbuckel, Nasenbuckel, Ohr ----
  const eyeBump = K.S(K.blob(154, 170, 16, 12, 0.1), K.blob(152, 164, 14, 13));
  const noseBump = K.S(K.S(K.blob(258, 148, 15, 10, -0.35), K.blob(236, 152, 9, 6, -0.2)));
  const ear = K.S(K.blob(118, 168, 7.5, 12, 0.25), K.blob(121, 172, 6, 10, 0.2));
  const earFar = K.S(K.blob(106, 164, 6.5, 11, 0.15));
  // ---- Schwänzchen ----
  const tail = K.limb([[-166, 120, 11], [-182, 112, 8.5], [-190, 100, 6]], { per: 8 });

  // ---- Beine: kurze Säulen, vier runde Zehen ----
  const hindFar = K.S(K.limb([[-100, 70, 44], [-98, 40, 38], [-96, 9, 35]], { per: 8 }), K.blob(-96, 6, 22, 6.5));
  const hindNear = K.S(K.blob(-132, 76, 34, 30, 0.0), K.limb([[-130, 74, 48], [-132, 40, 40], [-130, 9, 36]], { per: 8 }), K.blob(-130, 6, 22, 6.5));
  const foreNear = K.S(K.blob(92, 72, 31, 28, 0.0), K.limb([[92, 68, 46], [94, 38, 38], [96, 9, 35]], { per: 8 }), K.blob(96, 6, 21, 6.5));
  const foreFar = K.S(K.limb([[56, 72, 42], [58, 40, 36], [60, 9, 33]], { per: 8 }), K.blob(60, 6, 20, 6.5));
  const toes = (c, x, y0 = 6) => { for (let i = -1.5; i <= 1.5; i++) { K.paintBlob(c, x + i * 7.2 + 4, y0, 3.1, 3.7, 0, C.hoof, 0.95); } };
  const legFill = (far) => (far ? { top: C.far, bottom: C.farB } : { stops: [[0, C.top], [0.6, C.mid], [1, C.low]] });
  const legPart = (shapes, far, piv, z, toeX) => ({
    z, pivot: K.pt(piv), layers: [
      { shapes, fill: legFill(far), stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(40,20,40,.32)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,230,230,.14)' });
          toes(c, toeX, 6);
          K.curve(c, [[toeX - 12, 28], [toeX - 2, 25], [toeX + 12, 28]], 'rgba(60,40,58,.35)', 0.9);
        }, K.rim(shapes, { w: 0.22, color: rimc })) },
    ],
  });

  // ---- Körper-Layer ----
  const bodyLayers = [
    { shapes: K.S(earFar, tail), fill: { top: C.far, bottom: C.farB }, stroke: null, deco: K.rim(K.S(earFar, tail), { w: 0.22, color: rimc }) },
    { shapes: K.S(trunk, neckFill), fill: { stops: [[0, C.top], [0.45, C.mid], [0.72, C.low], [0.9, C.belly], [1, C.belly]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,30,50,.16)', light: 'rgba(255,235,235,.18)' });
        // Hautfalten und weiche Flecken
        K.curve(c, [[-60, 150], [-48, 126], [-58, 102]], 'rgba(70,45,65,.28)', 1.1);
        K.curve(c, [[-90, 150], [-80, 128], [-92, 108]], 'rgba(70,45,65,.2)', 1.0);
        K.curve(c, [[60, 156], [52, 132], [62, 108]], 'rgba(70,45,65,.24)', 1.1);
        K.dapples(c, bb, '#6f5a6c', 18, 3.5, 8, { seed: 3, alpha: 0.12, boxD: { x0: -150, y0: 105, w: 270, h: 70 } });
        K.dapples(c, bb, '#f2c9bf', 10, 4, 10, { seed: 8, alpha: 0.35, boxD: { x0: -120, y0: 40, w: 220, h: 26 } });
      }, K.rim(K.S(trunk, neckFill), { w: 0.24, color: rimc })) },
    { shapes: K.S(head, eyeBump, noseBump), fill: { stops: [[0, C.top], [0.45, C.mid], [0.8, C.low], [1, C.pink]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,30,50,.12)', light: 'rgba(255,235,235,.2)' });
        K.paintBlob(c, 258, 108, 26, 24, 0, '#e9a9a6', 0.6);                          // rosa Schnauze
        K.paintBlob(c, 190, 108, 14, 9, 0.1, '#f2b2ac', 0.5);                          // Wange
        // Maulfalte mit kleinem Lächeln
        K.curve(c, [[280, 100], [262, 92], [225, 90], [190, 93], [172, 101], [166, 106]], C.ink, 1.2);
        // Nasenloch
        K.paintBlob(c, 261, 150, 4.6, 2.8, -0.5, '#3a2838', 1);
        K.paintBlob(c, 236, 153, 3.2, 2.0, -0.3, '#3a2838', 0.85);
        // Auge: groß, freundlich, sitzt oben im Buckel
        K.bead(c, 158, 168, 6.4, { color: '#241420', look: 0.25, ring: '#cdb4be' });
        K.curve(c, [[145, 178], [156, 183], [168, 177]], 'rgba(60,40,56,.55)', 1.2);
        K.curve(c, [[205, 123], [218, 119]], 'rgba(255,255,255,.35)', 1.0);
      }, K.rim(K.S(head, eyeBump, noseBump), { w: 0.24, color: rimc })) },
    { shapes: ear, fill: { top: C.top, bottom: C.pink }, stroke: null,
      deco: K.deco((c) => { K.paintBlob(c, 119, 168, 3.6, 7, 0.25, C.pink, 0.9); }, K.rim(ear, { w: 0.2, color: rimc })) },
    // Zahnfleisch-Streifen an der Oberlippe (sichtbar, wenn der Kiefer aufklappt)
    { shapes: [K.limb([[266, 83, 4], [235, 81, 4], [200, 83, 4], [160, 85, 4]], { per: 8 })], fill: '#b8525e', stroke: null },
  ];

  // ---- Unterkiefer: breit, mit kleinen stumpfen Zähnchen ----
  const jawShape = K.poly([[116, 100], [130, 90], [160, 84], [200, 76], [240, 76], [268, 80], [274, 92], [262, 100], [215, 98], [170, 100], [136, 112], [118, 110]], 2);
  const chin = K.poly([[130, 88], [150, 70], [186, 52], [238, 50], [270, 66], [270, 88], [200, 92]], 2);
  const lowTeeth = [[262, 98], [252, 99], [242, 99]].map(([x, y]) => K.poly([[x - 3.2, y], [x - 2.4, y + 5.6], [x + 0.6, y + 6], [x + 1.6, y]], 1));
  const jaw = {
    z: 0, pivot: K.pt([120, 98]), layers: [
      { shapes: K.S(jawShape, chin), fill: { top: C.low, bottom: C.belly }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(80,40,60,.2)' });
          K.paintBlob(c, 205, 90, 66, 8, 0, '#c8606a', 0.95);                              // Zunge/Mundboden
        }, K.rim(K.S(jawShape, chin), { w: 0.22, color: rimc })) },
      { shapes: lowTeeth, fill: '#fff6e0', stroke: 'rgba(80,50,50,.5)' },
    ],
  };

  const parts = {
    body: { z: 2, layers: bodyLayers },
    jaw,
    legA: legPart(hindFar, true, [-100, 70], 1, -96),
    armB: legPart(foreFar, true, [56, 72], 1, 60),
    legB: legPart(hindNear, false, [-132, 74], 3, -130),
    armA: legPart(foreNear, false, [92, 70], 3, 96),
  };
  const sw = [-0.3, 0.3];
  return {
    id: 'nilpferd', parts,
    anchors: { head: K.pt([190, 125]), mouth: K.pt([268, 96]), eye: K.pt([154, 162]), back: K.pt([-10, 165]), foot: K.pt([0, 0]), nostril: K.pt([252, 143]) },
    meta: {
      name: 'Nilpferd', lengthM: 4.0, heightM: 1.75, shoulderHeightM: 1.5,
      ranges: { jaw: [0, -0.7], legA: [0, 0.3], legB: [0, -0.3], armA: [0, -0.3], armB: [0, 0.3] },
      swing: { legA: sw, legB: sw, armA: sw, armB: sw },
      gait: [['legB', 'armB'], ['legA', 'armA']],   // gegenphasig: diagonal (nahes Hinterbein + fernes Vorderbein)
    },
  };
}
