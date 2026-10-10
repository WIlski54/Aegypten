// Ammit (Totenfresserin des Totengerichts), 1,5 m lang, bewusst niedlich-papierhaft: Krokodilkopf mit Lächeln, Löwen-Vorderleib (goldenes Fell, kleine Mähne),
// Nilpferd-Hinterleib (mauvegrau); eine gestickte Naht trennt die drei Tiere wie Flicken. Kein Schrecken: runde Formen, große freundliche Augen, nur drei kleine Zähne.
// Teile: body (Rumpf, Kopf, Mähne), jaw (Unterkiefer, Pivot Kiefergelenk; negativ = auf, ranges 0 .. -0,5), tail (Pivot Hüfte; schwingt),
//        legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte; armA (nahes Vorderbein), armB (fernes) – Pivot Schulter.
// Entwurf in "Designeinheiten" (1 Einheit = 0,75 cm); Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.0075);
  const C = {
    gTop: '#d9a14a', gMid: '#e8b862', gLow: '#f3dca4', gFar: '#a9742c', gFarB: '#c99346', mane: '#9c5f1f',
    hTop: '#8d7886', hMid: '#a28b97', hLow: '#c9a4a4', hFar: '#6e5b6a', hFarB: '#8b7685',
    cTop: '#6f9a52', cMid: '#8fb55c', cLow: '#e7e0a0', ink: 'rgba(58,40,40,.9)', seam: '#fff0c8',
  };
  const rimc = C.ink;

  // ---- Hinterleib (Nilpferd): rundes Hinterteil, Tonnenbauch ----
  const rump = K.S(K.blob(-48, 46, 38, 34, 0), K.blob(-10, 42, 50, 30, 0));
  // ---- Vorderleib (Löwe) mit Hals ----
  const front = K.S(K.blob(30, 50, 32, 32, 0), K.limb([[22, 52, 58], [44, 62, 50], [60, 70, 34]], { per: 10 }));
  // Mähne: Kranz aus Fellbüscheln um Hals und Schulter
  const mane = [];
  for (let i = 0; i < 11; i++) {
    const a = 1.2 + i * 0.36, cx = 46, cy = 66, r = 22;
    mane.push(K.tuft(cx + Math.cos(a) * r, cy + Math.sin(a) * r, a, 12, 7, 0.2));
  }
  // ---- Kopf (Krokodil): rund, kurze freundliche Schnauze nach vorn ----
  const skull = K.S(K.blob(70, 74, 19, 17, 0.1), K.poly([[78, 86], [100, 84], [122, 80], [132, 77], [134, 70], [128, 63], [112, 61], [90, 61], [72, 60], [62, 66]], 2));
  const eyeBump = K.blob(70, 88, 10, 8.5, 0.1), nose = K.blob(128, 79, 6.5, 5, 0.1);
  const ear = K.blob(52, 88, 7, 8, 0.2);
  const teeth = [[118, 62], [103, 61], [88, 61]].map(([x, y]) => K.poly([[x - 3.2, y + 0.5], [x + 0.2, y - 6.2], [x + 3.2, y + 0.5]], 0));
  const headAll = K.S(skull, eyeBump, nose);

  const bodyLayers = [
    { shapes: rump, fill: { stops: [[0, C.hTop], [0.45, C.hMid], [0.75, C.hLow], [1, C.hLow]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,30,50,.2)', light: 'rgba(255,235,235,.16)' });
        K.dapples(c, bb, '#f2c9bf', 8, 3, 8, { seed: 5, alpha: 0.3, boxD: { x0: -80, y0: 14, w: 80, h: 20 } });   // rosa Bauch
        K.curve(c, [[-62, 70], [-54, 52], [-62, 34]], 'rgba(70,45,65,.25)', 0.9);                                  // Hautfalte
      }, K.rim(rump, { w: 0.24, color: rimc })) },
    { shapes: front, fill: { stops: [[0, C.gTop], [0.5, C.gMid], [0.9, C.gLow], [1, C.gLow]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(90,50,10,.16)', light: 'rgba(255,245,210,.2)' });
        K.fur(c, bb, C.mane, 14, 6, 0.9, { seed: 4, alpha: 0.28, ang: Math.PI * 1.25 });
        // gestickte Naht zwischen Löwe und Nilpferd
        K.curve(c, [[3, 76], [-1, 60], [-1, 42], [3, 22]], C.seam, 0.9, { alpha: 0.95 });
        for (let i = 0; i < 9; i++) { const y = 74 - i * 6.2; K.curve(c, [[-4, y], [2, y - 1.6]], '#7a4a1a', 0.55, { alpha: 0.9 }); }
      }, K.rim(front, { w: 0.24, color: rimc })) },
    { shapes: mane, fill: { top: C.mane, bottom: '#bf802c' }, stroke: null, deco: K.rim(mane, { w: 0.16, color: rimc }) },
    { shapes: headAll, fill: { stops: [[0, C.cTop], [0.5, C.cMid], [0.78, C.cLow], [1, C.cLow]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(20,50,10,.16)', light: 'rgba(255,255,220,.2)' });
        K.curve(c, [[134, 68], [118, 61], [92, 60], [72, 60], [62, 64]], '#2f4a1a', 0.85);                        // Lächeln
        K.curve(c, [[72, 61], [64, 64]], '#2f4a1a', 0.85);
        K.paintBlob(c, 128, 79, 2.6, 1.7, 0.1, '#2a3a12', 1);                                                       // Nasenloch
        K.bead(c, 71, 89, 6.2, { color: '#241c08', ring: '#f2cf5a', look: 0.2 });                                   // großes freundliches Auge
        K.curve(c, [[59, 95], [70, 99], [81, 94]], 'rgba(30,50,15,.6)', 0.9);
        K.curve(c, [[90, 86], [110, 82], [124, 79]], 'rgba(255,255,230,.35)', 1.0);
        K.dapples(c, bb, '#d9e48a', 6, 1.6, 3, { seed: 8, alpha: 0.35, boxD: { x0: 80, y0: 70, w: 44, h: 12 } });
      }, K.rim(headAll, { w: 0.22, color: rimc })) },
    { shapes: [ear], fill: { top: C.gTop, bottom: C.gMid }, stroke: null, deco: K.deco((c) => { K.paintBlob(c, 52, 88, 3.4, 4.6, 0.2, '#e9a5a0', 0.9); }, K.rim([ear], { w: 0.2, color: rimc })) },
    { shapes: teeth, fill: '#fffaea', stroke: 'rgba(90,80,40,.55)' },
  ];

  // ---- Unterkiefer (Pivot am Kiefergelenk, ragt in den Kopf hinein) ----
  const jawShape = K.S(K.poly([[58, 68], [78, 60], [100, 57], [124, 57], [134, 61], [130, 66], [104, 62], [80, 64], [66, 70]], 2), K.blob(66, 66, 9, 7, 0));
  const jaw = {
    z: 0, pivot: K.pt([64, 67]), layers: [
      { shapes: jawShape, fill: { top: C.cMid, bottom: C.cLow }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(20,50,10,.16)' }); K.paintBlob(c, 100, 61, 30, 2.4, 0, '#e08a8a', 0.9); }, K.rim(jawShape, { w: 0.2, color: rimc })) },
    ],
  };

  // ---- Schwanz: dünn, mit Quaste (Löwe) ----
  const tailL = K.limb([[-76, 58, 14], [-100, 58, 10], [-112, 44, 8], [-110, 26, 7]], { per: 10 });
  const tuft = K.S(K.blob(-110, 24, 7, 8, 0), K.tuft(-110, 22, -1.95, 14, 7, 0.15), K.tuft(-110, 22, -1.57, 15, 7, 0), K.tuft(-110, 22, -1.2, 14, 7, -0.15));
  const tail = {
    z: 1, pivot: K.pt([-78, 56]), layers: [
      { shapes: [tailL], fill: { top: C.hMid, bottom: C.hTop }, stroke: null, deco: K.deco((c, bb) => K.shade(c, bb, { dark: 'rgba(60,30,50,.2)' }), K.rim(tailL, { w: 0.2, color: rimc })) },
      { shapes: tuft, fill: { top: C.gMid, bottom: C.mane }, stroke: null, deco: K.rim(tuft, { w: 0.16, color: rimc }) },
    ],
  };

  // ---- Beine ----
  const toes = (c, x, y) => { for (let i = -1; i <= 1; i++) K.paintBlob(c, x + i * 6.4 + 3, y, 2.6, 3.2, 0, '#f0e0d4', 0.95); };
  const hind = (hx, far) => {
    const sh = K.S(K.limb([[hx, 44, 34], [hx - 1, 24, 28], [hx, 8, 26]], { per: 8 }), K.blob(hx + 2, 5, 17, 6));
    return { shapes: sh, deco: (c, bb) => { K.shade(c, bb, { dark: 'rgba(40,20,40,.3)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,230,230,.14)' }); toes(c, hx + 2, 5); K.curve(c, [[hx - 8, 26], [hx, 23], [hx + 8, 26]], 'rgba(60,40,58,.35)', 0.8); } };
  };
  const fore = (sx, far) => {
    const sh = K.S(K.limb([[sx, 46, 28], [sx + 2, 26, 17], [sx + 3, 8, 15]], { per: 8 }), K.blob(sx + 8, 4.5, 12, 5.2));
    return { shapes: sh, deco: (c, bb) => { K.shade(c, bb, { dark: 'rgba(90,50,10,.28)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,245,210,.16)' }); for (let i = 0; i < 3; i++) K.curve(c, [[sx + 11 + i * 3.4, 6], [sx + 11.4 + i * 3.4, 2]], 'rgba(120,70,20,.55)', 0.5); } };
  };
  const legPart = (g, far, piv, z, grey) => ({
    z, pivot: K.pt(piv), layers: [{
      shapes: g.shapes, fill: grey ? (far ? { top: C.hFar, bottom: C.hFarB } : { stops: [[0, C.hTop], [0.6, C.hMid], [1, C.hLow]] }) : (far ? { top: C.gFar, bottom: C.gFarB } : { stops: [[0, C.gTop], [0.6, C.gMid], [1, C.gLow]] }),
      stroke: null, deco: K.deco(g.deco, K.rim(g.shapes, { w: 0.22, color: rimc })),
    }],
  });

  const parts = {
    body: { z: 2, layers: bodyLayers },
    jaw,
    tail,
    legA: legPart(hind(-34, true), true, [-34, 44], 1, true),
    armB: legPart(fore(42, true), true, [42, 46], 1, false),
    legB: legPart(hind(-56, false), false, [-56, 44], 3, true),
    armA: legPart(fore(26, false), false, [26, 46], 3, false),
  };
  const sw = [-0.3, 0.3];
  return {
    id: 'ammit', parts,
    anchors: { head: K.pt([72, 76]), mouth: K.pt([132, 62]), eye: K.pt([71, 89]), back: K.pt([-10, 72]), foot: K.pt([0, 0]), tailTip: K.pt([-106, 14]) },
    meta: {
      name: 'Ammit', lengthM: 1.5, heightM: 0.75,
      ranges: { jaw: [0, -0.5], tail: [0, -0.4], legA: [0, 0.3], legB: [0, -0.3], armA: [0, -0.3], armB: [0, 0.3] },
      swing: { tail: [-0.3, 0.2], legA: sw, legB: sw, armA: sw, armB: sw },
      gait: [['legB', 'armB'], ['legA', 'armA']],
    },
  };
}
