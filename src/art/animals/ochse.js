// Ochse / Hausrind (Altägyptisches Langhornrind), ~2,4 m lang, 1,3 m Widerristhöhe: rotbraun mit weißen Abzeichen,
// weit geschwungene Hörner, sanfte Augen. Zugtier für Schlitten und Pflug.
// Teile: body (Rumpf, Joch optional), head (Hals + Kopf + Hörner + Ohren, Pivot Schulter; negativ = Kopf senkt sich),
//        tail (Pivot Kruppe), legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte, armA (nahes Vorderbein), armB (fernes) – Pivot Schulter.
// Optionen: opts.yoke = true (Holzjoch mit Strick am Hals), opts.coat = 'rot' (Standard) | 'gescheckt' (weiß-braun) | 'schwarz'.
// Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const coat = opts.coat || 'rot';
  const C = coat === 'schwarz'
    ? { top: '#3a302d', mid: '#4d403a', low: '#6a5a50', far: '#2b2321', farB: '#41352f', patch: '#f3ead6', ink: 'rgba(30,22,20,.9)' }
    : coat === 'gescheckt'
      ? { top: '#e9dcc0', mid: '#f3e8d0', low: '#f6edd8', far: '#c8b894', farB: '#dcd0b0', patch: '#9a5230', ink: 'rgba(80,50,30,.9)' }
      : { top: '#a95b33', mid: '#bf7140', low: '#d89a68', far: '#7f4224', farB: '#a96a40', patch: '#f4e9d2', ink: 'rgba(70,35,18,.9)' };
  const rimc = C.ink;
  const horn = '#f1e4be', hornTip = '#5e432a', hoof = '#3a2a22', pink = '#e6a597';
  const NP = [72, 108];

  // ---- Rumpf ----
  const trunk = K.S(K.blob(0, 96, 92, 38, 0.0), K.blob(66, 96, 34, 40), K.blob(-70, 98, 32, 34), K.blob(0, 80, 82, 28));
  const hump = K.blob(58, 128, 20, 11, 0.1);
  const tailBase = K.blob(-98, 112, 8, 7);
  // Beine
  const hoofP = (x, y, w = 15) => K.S(K.blob(x, y + 5, w * 0.5, 5.4, 0.0), K.blob(x + 3, y + 3, w * 0.55, 4, 0.0));
  const foreLeg = (x, w) => K.S(K.limb([[x, 84, w * 1.35], [x + 1, 50, w], [x + 1, 24, w * 0.72], [x + 2, 11, w * 0.82]], { per: 10 }), hoofP(x + 2, 0, w));
  const hindLeg = (x, w) => K.S(K.limb([[x, 96, w * 1.6], [x + 6, 62, w * 1.15], [x - 3, 38, w * 0.74], [x - 2, 10, w * 0.8]], { per: 10 }), hoofP(x - 2, 0, w));
  const foreNear = foreLeg(70, 17), foreFar = foreLeg(46, 16), hindNear = hindLeg(-70, 18), hindFar = hindLeg(-44, 17);
  const legFill = (far) => (far ? { top: C.far, bottom: C.farB } : { stops: [[0, C.top], [0.5, C.mid], [0.78, C.low], [1, C.low]] });
  const legPart = (shapes, far, piv, z, hx) => ({
    z, pivot: K.pt(piv), layers: [
      { shapes, fill: legFill(far), stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,25,10,.28)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,230,190,.12)' });
          K.paintBlob(c, hx, 4.6, 8.5, 5.4, 0, hoof, 1);                 // Hufe
          K.curve(c, [[hx - 1, 8], [hx + 1, 2.4]], 'rgba(255,240,220,.35)', 0.7);
          K.paintBlob(c, hx, 20, 7, 14, 0, far ? C.farB : C.patch, 0.45);  // helle Fesseln ("Socken")
        }, K.rim(shapes, { w: 0.22, color: rimc })) },
    ],
  });

  // ---- Schwanz mit Quaste ----
  const tail = K.S(K.limb([[-96, 114, 7], [-104, 92, 5], [-107, 66, 4], [-106, 44, 4]], { per: 10 }), K.blob(-106, 36, 7, 14, 0.04), K.blob(-108, 30, 5, 9, 0.1));

  // ---- Kopf + Hals + Hörner (Pivot Schulter) ----
  const L = K.up(14);
  const neckC = [[70, 112, 56], [104, 114, 46], [128, 112, 38]];
  const neckL = K.limb(neckC, { per: 12 });
  const dewlap = L.s(K.blob(100, 78, 26, 15, -0.15));
  const headP = L.s(K.poly([[116, 116], [138, 118], [152, 108], [166, 90], [176, 72], [178, 56], [166, 48], [150, 54], [138, 72], [122, 86], [108, 98]], 2));
  const muzzle = L.s(K.blob(170, 58, 15, 13, 0.4));
  const hornC = [[134, 117, 14], [130, 134, 13], [128, 152, 11], [136, 170, 8], [150, 182, 5], [164, 184, 2.6], [172, 180, 0.8]];
  const hornFar = L.s(K.limb(hornC.map(([x, y, w]) => [x + 9, y - 3, w * 0.95]), { per: 12 }));
  const hornNear = L.s(K.limb(hornC, { per: 12 }));
  const ear = L.s(K.limb([[124, 112, 9], [108, 116, 8], [94, 112, 4]], { per: 8 }));
  const earFar = L.s(K.limb([[134, 112, 8], [150, 124, 7], [160, 126, 3]], { per: 8 }));

  const headLayers = [
    { shapes: K.S(hornFar, earFar), fill: { top: horn, bottom: '#d8c58f' }, stroke: null,
      deco: K.deco(L.d((c, bb) => { K.paintBlob(c, 170, 186, 12, 5, -0.4, hornTip, 0.9); }), K.rim(K.S(hornFar, earFar), { w: 0.2, color: 'rgba(90,60,30,.85)' })) },
    { shapes: K.S(neckL, dewlap, headP, muzzle), fill: { stops: [[0, C.top], [0.45, C.mid], [0.75, C.low], [1, C.low]] }, stroke: null,
      deco: K.deco(L.d((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,25,10,.18)', light: 'rgba(255,230,190,.16)' });
        K.fur(c, bb, '#7a3c20', 10, 6, 0.7, { seed: 3, alpha: 0.28, ang: Math.PI * 0.95 });
        // helle Blesse + rosa Maul
        K.paintBlob(c, 155, 90, 9, 24, -0.55, C.patch, 0.85);
        K.paintBlob(c, 171, 54, 12, 9, 0.4, pink, 0.9);
        K.paintBlob(c, 174, 56, 3, 2, 0.4, '#3a2420', 0.9);
        K.curve(c, [[176, 47], [166, 45.5], [156, 49]], 'rgba(60,30,20,.7)', 0.9);
        K.curve(c, [[132, 106], [141, 110], [150, 106]], 'rgba(60,30,20,.5)', 0.9);
        K.bead(c, 144, 98, 5.0, { color: '#1b100a', look: 0.2, ring: '#f2e4c8' });
      }), K.rim(K.S(neckL, dewlap, headP, muzzle), { w: 0.24, color: rimc })) },
    { shapes: ear, fill: { top: C.top, bottom: pink }, stroke: null,
      deco: K.deco(L.d((c) => { K.paintBlob(c, 112, 114, 8, 3, 0.1, pink, 0.85); }), K.rim(ear, { w: 0.2, color: rimc })) },
    { shapes: [hornNear], fill: { top: horn, bottom: '#e0cf9c' }, stroke: null,
      deco: K.deco(L.d((c, bb) => {
        K.paintBlob(c, 164, 183, 13, 5, -0.4, hornTip, 0.95);
        for (let i = 0; i < 3; i++) K.curve(c, [[124 + i * 3, 138 + i * 12], [134 + i * 3, 138 + i * 12]], 'rgba(120,90,50,.3)', 0.7);
      }), K.rim([hornNear], { w: 0.22, color: 'rgba(90,60,30,.9)' })) },
  ];

  // ---- Joch (optional): Holzbalken am Hals mit Strick ----
  const yokeBeam = K.limb([[100, 156, 9], [98, 118, 11], [102, 70, 9]], { per: 10 });
  const yokeCap1 = K.blob(100, 158, 8, 6.5), yokeCap2 = K.blob(102, 68, 7.5, 6);
  const yokeRope = K.limb([[92, 134, 3], [90, 100, 3.2], [92, 72, 3]], { per: 8 });

  const bodyLayers = [
    { shapes: K.S(tailBase), fill: C.top, stroke: null },
    { shapes: K.S(trunk, hump), fill: { stops: [[0, C.top], [0.5, C.mid], [0.74, C.low], [0.9, C.low], [1, C.patch]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,25,10,.16)', light: 'rgba(255,230,190,.18)' });
        K.fur(c, bb, '#7a3c20', 24, 7, 0.8, { seed: 5, alpha: 0.25, ang: Math.PI * 0.95 });
        if (coat === 'rot' || coat === 'schwarz') { K.paintBlob(c, -10, 100, 30, 14, 0.1, C.patch, 0.78); K.paintBlob(c, -70, 80, 14, 10, 0, C.patch, 0.6); }
        else { K.paintBlob(c, -50, 118, 24, 16, 0.2, C.patch, 0.9); K.paintBlob(c, 18, 108, 20, 14, 0, C.patch, 0.85); K.paintBlob(c, 78, 100, 12, 18, 0, C.patch, 0.85); K.paintBlob(c, -88, 88, 11, 16, 0, C.patch, 0.85); }
        K.curve(c, [[-62, 118], [-46, 108], [-32, 112]], 'rgba(60,25,10,.18)', 1);
      }, K.rim(K.S(trunk, hump), { w: 0.24, color: rimc })) },
  ];
  if (opts.yoke) {
    bodyLayers.push(
      { shapes: [yokeRope], fill: '#c9a96e', stroke: null, deco: K.rim([yokeRope], { w: 0.14, color: 'rgba(90,60,25,.9)' }) },
      { shapes: K.S(yokeBeam, yokeCap1, yokeCap2), fill: { top: '#b5834c', bottom: '#8c5e32' }, stroke: null,
        deco: K.deco((c) => { K.curve(c, [[98, 150], [97, 115], [101, 78]], 'rgba(255,230,180,.4)', 1.2); K.paintBlob(c, 100, 158, 3, 2.4, 0, '#e0b040', 0.9); }, K.rim(K.S(yokeBeam, yokeCap1, yokeCap2), { w: 0.22, color: 'rgba(70,40,18,.95)' })) });
  }

  const parts = {
    head: { z: 1, pivot: K.pt(NP), layers: headLayers },
    body: { z: 2, layers: bodyLayers },
    tail: { z: 1, pivot: K.pt([-96, 112]), layers: [{ shapes: tail, fill: { top: C.mid, bottom: '#3a2218' }, stroke: null,
      deco: K.deco((c) => { K.paintBlob(c, -107, 33, 6.5, 12, 0.05, '#2f1c14', 0.95); }, K.rim(tail, { w: 0.2, color: rimc })) }] },
    legA: legPart(hindFar, true, [-44, 96], 1, -46),
    armB: legPart(foreFar, true, [46, 84], 1, 48),
    legB: legPart(hindNear, false, [-70, 96], 3, -72),
    armA: legPart(foreNear, false, [70, 84], 3, 72),
  };
  const sw = [-0.3, 0.3];
  return {
    id: 'ochse', parts,
    anchors: { head: K.pt([150, 112]), mouth: K.pt([176, 74]), eye: K.pt([144, 112]), back: K.pt([0, 132]), foot: K.pt([0, 0]), yoke: K.pt([100, 112]), horn: K.pt([170, 198]), shoulder: K.pt(NP), tailTip: K.pt([-107, 30]) },
    meta: {
      name: 'Ochse', lengthM: 2.4, heightM: 2.0, shoulderHeightM: 1.3, coat, yoke: !!opts.yoke,
      ranges: { head: [0, -0.35], tail: [0, 0.4], legA: [0, 0.3], legB: [0, -0.3], armA: [0, -0.3], armB: [0, 0.3] },
      swing: { head: [-0.12, 0.08], tail: [-0.3, 0.3], legA: sw, legB: sw, armA: sw, armB: sw },
      gait: [['legB', 'armB'], ['legA', 'armA']],
    },
  };
}
