// Schakal (Anubis-Tier), sitzend, ~90 cm mit Ohren: schlanker Körper, lange Schnauze, hohe spitze Ohren, aufrechte würdevolle Haltung.
// opts.coat: 'schwarz' (Standard, Anubis: schwarz wie fruchtbare Nilerde, mit Goldkragen) | 'natur' (sandgoldener Goldschakal, ohne Kragen).
// opts.collar = false schaltet den Kragen ab. Teile: body (Rumpf, Hinterbein, Vorderbeine, Kragen), head (Hals + Kopf + Ohren, Pivot Halsansatz; ±0,25 drehen),
//        tail (Pivot Schwanzansatz, schwingt am Boden). Entwurf in cm; Blick nach +x, Boden y = 0.
import { kit } from './_t_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const natur = opts.coat === 'natur';
  const C = natur
    ? { top: '#b8884a', mid: '#d3a566', low: '#f0dcb2', far: '#8d6535', farB: '#b08850', dark: '#5a3b1c', earIn: '#f0c9b4', ink: 'rgba(80,50,22,.9)', muz: '#f5e6c4' }
    : { top: '#2c262e', mid: '#3d3640', low: '#51495a', far: '#1d191f', farB: '#2e2832', dark: '#120f13', earIn: '#8a5a58', ink: 'rgba(15,12,18,.95)', muz: '#4d4551' };
  const collar = opts.collar !== false && !natur;
  const rimc = C.ink;
  const NB = [13, 58]; // Halsansatz

  // ---- Rumpf (sitzend) ----
  const haunch = K.S(K.blob(-12, 17, 21, 17.5, 0.25), K.limb([[-16, 18, 30], [-5, 38, 27], [8, 53, 21]], { per: 12 }), K.blob(12, 45, 12.5, 16, 0.1));
  const hindFoot = K.S(K.blob(5, 3.4, 15, 3.8, 0), K.blob(18, 2.4, 5, 2.6, 0));
  const foreN = K.S(K.limb([[14, 46, 11], [16.5, 25, 8], [17.4, 6, 7.6]], { per: 10 }), K.blob(21.4, 2.8, 8, 3.0, 0));
  const foreF = K.S(K.limb([[9, 46, 10], [11.5, 25, 7.4], [12.4, 6, 7]], { per: 10 }), K.blob(16.4, 2.8, 7.6, 2.8, 0));

  const bodyLayers = [
    { shapes: foreF, fill: { top: C.far, bottom: C.farB }, stroke: null, deco: K.rim(foreF, { w: 0.2, color: rimc }) },
    { shapes: haunch, fill: { stops: [[0, C.top], [0.5, C.mid], [0.85, C.low], [1, C.low]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(0,0,0,.25)', light: 'rgba(255,240,220,.12)' });
        K.fur(c, bb, natur ? '#5a3b1c' : '#0e0b10', 16, 6, 0.8, { seed: 3, alpha: 0.4, ang: Math.PI * 1.1 });
        K.curve(c, [[-20, 28], [-9, 34], [-1, 26]], 'rgba(255,255,255,.1)', 1.2);
        if (natur) K.paintBlob(c, 10, 38, 5, 14, 0.1, '#f6e8c6', 0.9);
      }, K.rim(haunch, { w: 0.24, color: rimc })) },
    { shapes: hindFoot, fill: { top: C.mid, bottom: C.low }, stroke: null, deco: K.rim(hindFoot, { w: 0.2, color: rimc }) },
    { shapes: foreN, fill: { top: C.mid, bottom: C.low }, stroke: null,
      deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(0,0,0,.2)' }); K.curve(c, [[22, 4.5], [22.4, 1.2]], natur ? 'rgba(80,50,22,.5)' : 'rgba(255,255,255,.18)', 0.5); K.curve(c, [[25, 4.2], [25.4, 1.2]], natur ? 'rgba(80,50,22,.5)' : 'rgba(255,255,255,.18)', 0.5); }, K.rim(foreN, { w: 0.2, color: rimc })) },
  ];
  if (collar) {
    // Wesech-Kragen (Lapis, Türkis, Gold, Karneol) als vier Bögen um den Halsansatz
    const arc = (r, w) => { const pts = []; for (let i = 0; i <= 10; i++) { const a = 3.5 + (6.15 - 3.5) * i / 10; pts.push([14 + Math.cos(a) * r, 59 + Math.sin(a) * r * 0.85, w]); } return K.limb(pts, { per: 4 }); };
    [[18, 4.2, '#2a5aa0'], [14, 3.4, '#3bb3a8'], [10.8, 3.2, '#e0b040'], [8, 2.4, '#c0432e']].forEach(([r, w, col]) => bodyLayers.push({ shapes: [arc(r, w)], fill: col, stroke: 'rgba(30,20,10,.55)' }));
  }

  // ---- Kopf + Hals ----
  const Hh = K.place(21, 75, -0.06, 1.0);
  const neck = K.limb([[12, 52, 20], [15, 63, 15.4], [19, 72, 13.4]], { per: 10 });
  const skull = K.S(Hh.blob(0, 0, 10.6, 9.6), Hh.poly([[4, 4.8], [18, 3], [32, -1.2], [34.6, -4.2], [32, -7.2], [22, -8.2], [8, -9.4], [2, -4]], 2), Hh.blob(33.6, -3.2, 3.1, 2.6, -0.2));
  const earN = Hh.poly([[-10, 5.4], [-7, 29], [3, 8]], 1.5), earF = Hh.poly([[1, 8], [8, 27.6], [10.4, 3.8]], 1.5);
  const earNin = Hh.poly([[-7.6, 8], [-6.2, 24.4], [-0.4, 9.6]], 1);
  const headLayers = [
    { shapes: [earF], fill: { top: C.far, bottom: C.farB }, stroke: null, deco: K.rim([earF], { w: 0.2, color: rimc }) },
    { shapes: K.S(neck, skull), fill: { stops: [[0, C.top], [0.5, C.mid], [0.85, C.low], [1, C.low]] }, stroke: null,
      deco: K.deco((c, bb) => K.shade(c, bb, { dark: 'rgba(0,0,0,.2)', light: 'rgba(255,240,220,.12)' }), Hh.d((c) => {
        K.paintBlob(c, 20, -4.6, 13, 3.4, -0.08, C.muz, natur ? 0.9 : 0.55);              // hellere Schnauzenunterseite
        K.paintBlob(c, 33.8, -3, 2.8, 2.3, 0, '#1a1418', 1);                                // Nase
        K.paintBlob(c, 34.4, -2.4, 0.7, 0.5, 0, 'rgba(255,255,255,.7)', 1);
        K.curve(c, [[33, -6.4], [22, -6.6], [13, -6], [9, -3.6]], natur ? 'rgba(60,35,15,.85)' : 'rgba(255,230,200,.45)', 0.55);       // Mundlinie (leichtes Lächeln)
        K.bead(c, 9.2, 2.6, 1.9, { color: '#1a0f06', ring: '#e8b840', look: 0.2 });
        K.curve(c, [[6.8, 3.4], [2, 3.6], [-3, 1.4]], natur ? '#3a2410' : '#e0b040', 0.55);   // Lidstrich
        K.curve(c, [[11, 7], [7, 8.2], [4, 6.6]], natur ? 'rgba(60,35,15,.5)' : 'rgba(255,240,220,.2)', 0.55);
      }), K.rim(K.S(neck, skull), { w: 0.24, color: rimc })) },
    { shapes: [earN], fill: { top: C.top, bottom: C.mid }, stroke: null,
      deco: K.deco(Hh.d((c) => { K.paintPoly(c, [[-7.6, 8], [-6.2, 24.4], [-0.4, 9.6]], C.earIn, 0.9, 1); }), K.rim([earN], { w: 0.2, color: rimc })) },
  ];
  const headPart = { z: 1, pivot: K.pt(NB), layers: headLayers };

  // ---- Schwanz ----
  const tailC = [[-30, 11, 9], [-42, 6, 7.4], [-37, 1.8, 6.4], [-24, 1.4, 5.4], [-12, 1.2, 4]];
  const tail = K.limb(tailC, { per: 10 });
  const tailPart = { z: 3, pivot: K.pt([-30, 11]), layers: [{ shapes: [tail], fill: { top: C.mid, bottom: C.top }, stroke: null,
    deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(0,0,0,.2)' }); K.fur(c, bb, natur ? '#5a3b1c' : '#0e0b10', 8, 5, 0.7, { seed: 6, alpha: 0.4, ang: Math.PI }); if (natur) K.paintBlob(c, -12, 1.4, 5, 3, 0, '#3a2410', 0.9); }, K.rim([tail], { w: 0.2, color: rimc })) }] };

  return {
    id: 'schakal',
    parts: { head: headPart, body: { z: 2, layers: bodyLayers }, tail: tailPart },
    anchors: { head: K.pt([21, 75]), mouth: K.pt([55, 71]), eye: K.pt([30, 77]), back: K.pt([-8, 45]), foot: K.pt([10, 0]), neck: K.pt(NB), ear: K.pt([16, 100]) },
    meta: { name: 'Schakal (Anubis-Tier)', heightM: 0.92, lengthM: 0.9, pose: 'sit', coat: natur ? 'natur' : 'schwarz', ranges: { head: [0, 0.25], tail: [0, 0.3] }, swing: { head: [-0.15, 0.15], tail: [-0.2, 0.2] } },
  };
}
