// Wasservogel, ~40 cm hoch. opts.kind: 'gans' (Standard: Nilgans Alopochen aegyptiaca, sandbraun mit braunem Augenfleck, weißem Flügelfeld, rosa Schnabel)
//                              oder 'ente' (Stockenten-Erpel: grüner Kopf, weißer Halsring, brauner Latz, gelber Schnabel).
// Teile: body (Rumpf, Flügel, Schwanz), neck (Hals + Kopf + Schnabel, Pivot Schulter; negativ = Kopf senkt sich/pickt), legA (fernes Bein), legB (nahes Bein) – Pivot Hüfte.
// Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';
import { birdLeg, plumes } from './_t_bird.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const duck = opts.kind === 'ente';
  const C = duck
    ? { body: '#a9a29a', bodyHi: '#c7c0b6', belly: '#e4dfd4', breast: '#8a4c34', head: '#2f8a5a', headHi: '#58b080', ring: '#fbf8f0', bill: '#e8c030', billTip: '#8a7a1c', leg: '#e8962c', legFar: '#c27a1c', wing: '#8d857c', ink: 'rgba(60,50,40,.9)' }
    : { body: '#b59a72', bodyHi: '#cdb48c', belly: '#e2d3b4', breast: '#a65a34', head: '#c8ac80', headHi: '#dec6a0', ring: '#f3e8d0', bill: '#e08a84', billTip: '#6a4a44', leg: '#e07a78', legFar: '#c05f60', wing: '#f1e8d4', ink: 'rgba(80,55,35,.9)' };
  const rimc = C.ink;
  const NP = [11, 25];

  const torso = K.S(K.blob(0, 18, 15.5, 9.8, 0.14), K.blob(9, 21, 9.5, 9.4), K.blob(-10, 17, 8, 7.6, 0.3));
  const tailF = K.S(plumes(K, [[-12, 19, -20, 21, 3.4], [-12, 18, -20, 17, 3.2]], 0.05));
  const wingS = K.limb([[7, 24, 9], [-2, 21.4, 11.4], [-12, 18, 7.6], [-19, 17, 1.2]], { per: 12 });
  const primaries = plumes(K, [[-10, 19, -20, 14.4, 2.6], [-8, 19.6, -18, 16, 2.4]], 0.04);

  // ---- Hals + Kopf ----
  const neckC = duck ? [[11, 25, 9.4], [14.5, 31, 7], [16, 37, 6.2], [18.4, 40.6, 6.2]] : [[11, 25, 9.8], [14.6, 31, 7], [15.6, 38, 5.6], [18.4, 43, 5.6]];
  const neckL = K.limb(neckC, { per: 10 });
  const hc = neckC[3];
  const headB = K.blob(hc[0] + 2.4, hc[1] + 1, 5.6, 4.9, 0.1);
  const bill = duck
    ? K.poly([[hc[0] + 6, hc[1] + 1.6], [hc[0] + 12.8, hc[1] + 0.4], [hc[0] + 14.2, hc[1] - 1.2], [hc[0] + 12, hc[1] - 2.4], [hc[0] + 6, hc[1] - 1.4]], 1.5)
    : K.poly([[hc[0] + 6, hc[1] + 1.4], [hc[0] + 10.2, hc[1] + 0.4], [hc[0] + 11, hc[1] - 1.4], [hc[0] + 9, hc[1] - 2.6], [hc[0] + 6, hc[1] - 1.6]], 1.5);
  const neckPart = {
    z: 1, pivot: K.pt(NP), layers: [
      { shapes: K.S(neckL, headB), fill: { top: C.headHi, bottom: C.head }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(40,30,15,.2)', light: 'rgba(255,245,215,.2)' });
          if (duck) { K.curve(c, [[hc[0] - 4, hc[1] - 6.4], [hc[0] + 1, hc[1] - 6.8], [hc[0] + 5, hc[1] - 6]], C.ring, 2.0); K.paintBlob(c, 13, 29, 4, 4.6, 0, C.ring, 0.9); }
          else { K.paintBlob(c, hc[0] + 3.2, hc[1] + 1.2, 2.6, 2.4, 0.2, '#7a4a30', 0.9); K.paintBlob(c, 13, 29, 4, 4, 0, C.breast, 0.5); }
          K.bead(c, hc[0] + 3.4, hc[1] + 1.4, 1.2, { color: '#140c06', ring: duck ? '#f2c860' : '#f2c050', look: 0.2, shine: true });
        }, K.rim(K.S(neckL, headB), { w: 0.16, color: rimc })) },
      { shapes: [bill], fill: { top: C.bill, bottom: C.bill }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, hc[0] + (duck ? 13 : 9.8), hc[1] - 0.8, 1.2, 1.2, 0, C.billTip, 0.9); K.curve(c, [[hc[0] + 6.4, hc[1] - 0.2], [hc[0] + (duck ? 12.4 : 9.8), hc[1] - 0.2]], 'rgba(80,40,20,.5)', 0.35); }, K.rim([bill], { w: 0.12, color: 'rgba(100,60,30,.9)' })) },
    ],
  };

  const bodyLayers = [
    { shapes: tailF, fill: C.wing, stroke: null, deco: K.rim(tailF, { w: 0.12, color: rimc }) },
    { shapes: torso, fill: { stops: [[0, C.bodyHi], [0.45, C.body], [0.72, C.belly], [1, C.belly]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,40,20,.2)', light: 'rgba(255,245,215,.2)' });
        if (duck) { K.paintBlob(c, 12, 20, 5.4, 7.6, 0, C.breast, 0.95); K.curve(c, [[11, 31], [16, 29], [17, 22]], C.ring, 1.2, { alpha: 0 }); }
        else K.paintBlob(c, 11, 20, 5, 6.6, 0, C.breast, 0.85);
        K.fur(c, bb, '#7a5a38', 10, 3, 0.4, { seed: 6, alpha: 0.28, ang: Math.PI * 1.2 });
      }, K.rim(torso, { w: 0.18, color: rimc })) },
    { shapes: [wingS], fill: duck ? { top: '#9a928a', bottom: C.wing } : { top: '#fffaf0', bottom: '#e6dcc4' }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(60,40,20,.2)', light: 'rgba(255,255,245,.2)' });
        if (duck) K.paintBlob(c, -4, 19, 4.4, 2.0, -0.2, '#2a6aa0', 0.9);
        else { K.paintBlob(c, -5, 18.4, 5.6, 2.2, -0.15, '#2e8a5a', 0.85); K.paintBlob(c, 4, 24, 2.4, 1.2, -0.3, '#7a5030', 0.6); }
        for (let i = 0; i < 4; i++) K.curve(c, [[2 - i * 3.8, 22 - i * 1.0], [-1 - i * 3.8, 19.6 - i * 1.0]], 'rgba(90,70,50,.3)', 0.4);
      }, K.rim([wingS], { w: 0.14, color: rimc })) },
    { shapes: primaries, fill: '#3a3028', stroke: null, deco: K.rim(primaries, { w: 0.1, color: 'rgba(25,18,10,.9)' }) },
  ];

  const leg = (hx, far) => {
    const sh = [K.limb([[hx, 14, 2.8], [hx + 0.4, 6, 2.2], [hx + 0.6, 2.4, 2.2]], { per: 8 }), K.poly([[hx + 0.2, 2.2], [hx + 9.6, 0.6], [hx + 8, 3.2], [hx + 2.6, 4], [hx - 1.4, 2.4]], 1)];
    return { z: 1, pivot: K.pt([hx, 14]), layers: [{ shapes: sh, fill: far ? C.legFar : C.leg, stroke: null, deco: K.rim(sh, { w: 0.1, color: 'rgba(100,45,20,.85)' }) }] };
  };

  return {
    id: 'wasservogel',
    parts: { neck: neckPart, body: { z: 2, layers: bodyLayers }, legA: leg(-1, true), legB: leg(4, false) },
    anchors: { head: K.pt([hc[0] + 2.4, hc[1] + 1]), mouth: K.pt([hc[0] + 12, hc[1]]), eye: K.pt([hc[0] + 3.4, hc[1] + 1.4]), back: K.pt([-2, 28]), foot: K.pt([2, 0]), shoulder: K.pt(NP) },
    meta: { name: duck ? 'Stockente' : 'Nilgans', heightM: 0.45, lengthM: 0.4, kind: duck ? 'ente' : 'gans', ranges: { neck: [0, -0.7], legA: [0, 0.35], legB: [0, -0.35] }, swing: { neck: [-0.2, 0.2], legA: [-0.35, 0.35], legB: [0.35, -0.35] } },
  };
}
