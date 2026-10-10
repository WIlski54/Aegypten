// Multituberculata (Vielhöckerzähner, Cimexomys-artig): nagetierartig, rundlich, große Schneidezähne, kurzer Schwanz, ~18 cm.
// Entwurf in "Einheiten" (u = 0.0075 m); Blick nach +x, Boden y = 0.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.0075);
  const C = { top: '#8c7667', mid: '#a89080', belly: '#f1e6d1', dark: '#4d3d35', stripe: '#5a463b', pink: '#ee9f94', nose: '#e0788a', tooth: '#fff4d2', ink: 'rgba(55,35,25,.85)' };

  // ---- Rumpf: pummelig-rund wie ein Hamster ----
  const trunk = K.S(K.blob(-0.9, 4.9, 5.5, 4.4, 0.02), K.blob(-4.2, 4.6, 3.5, 3.8), K.blob(2.3, 4.8, 3.4, 3.7));

  const nearFore = K.limb([[2.0, 2.8, 2.6], [2.5, 1.3, 2.1], [3.4, 0.55, 2.0]]);
  const farFore = K.limb([[3.6, 2.8, 2.3], [4.1, 1.3, 1.9], [5.0, 0.55, 1.8]]);
  const nearThigh = K.blob(-4.5, 3.3, 2.8, 2.6, 0.3);
  const nearHind = K.limb([[-4.8, 2.4, 2.6], [-4.3, 1.0, 1.9], [-2.9, 0.55, 1.8]]);
  const farThigh = K.blob(-2.2, 3.4, 2.4, 2.3, 0.2);
  const farHind = K.limb([[-2.4, 2.4, 2.3], [-1.9, 1.0, 1.7], [-0.6, 0.55, 1.6]]);

  // ---- Kopf: runde Kalotte, stumpfe Nagerschnauze, dicke Backen ----
  const head = K.S(K.blob(5.9, 6.1, 3.8, 3.6, 0.05), K.blob(9.0, 5.1, 2.5, 2.2, -0.1), K.blob(6.0, 4.1, 3.3, 2.5));
  const ear = K.blob(4.3, 9.3, 1.55, 1.5);
  const earFar = K.blob(6.9, 9.5, 1.3, 1.25);
  const jawShape = K.limb([[5.6, 3.4, 3.0], [8.0, 2.7, 2.6], [10.0, 3.1, 1.6]]);
  const incisors = K.S(K.poly([[10.0, 4.4], [10.1, 1.5], [10.6, 0.65], [11.9, 0.7], [12.3, 1.6], [11.9, 4.4]], 1));

  // ---- Schwanz: kurz, dick, mit kleinem Büschel ----
  const tail = K.S(K.limb([[-6.4, 5.0, 3.2], [-8.6, 5.2, 2.9], [-10.5, 6.1, 2.4], [-11.5, 7.5, 1.5]], { per: 10 }));
  const tailPivot = K.pt([-6.4, 5.0]);

  const rimc = 'rgba(48,30,22,.88)';
  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farFore, farThigh, farHind, earFar), fill: { top: '#4d3d35', bottom: '#78624f' }, stroke: null,
        deco: K.deco((c, bb) => K.shade(c, bb), K.rim(K.S(farFore, farThigh, farHind, earFar), { w: 0.14, color: rimc })) },
      { shapes: trunk, fill: { stops: [[0, C.top], [0.45, C.mid], [0.68, '#cdb9a5'], [0.84, C.belly], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,35,20,.15)' });
          // dunkler Rückenstreifen
          K.curve(c, [[-8.2, 7.6], [-5, 9.0], [-1.0, 9.6], [3, 9.4], [5.5, 8.6]], C.stripe, 1.2, { alpha: 0.8 });
          K.fur(c, bb, '#3d2f28', 18, 1.7, 0.4, { seed: 3, alpha: 0.38 });
          K.fur(c, bb, '#fffaf0', 10, 1.5, 0.35, { seed: 9, alpha: 0.45, box: { x0: bb.x0, y0: bb.y0, w: bb.w, h: bb.h * 0.4 } });
        }, K.rim(trunk, { w: 0.15, color: rimc })) },
      { shapes: K.S(nearFore, nearThigh, nearHind), fill: { top: C.mid, bottom: '#d9c5b2' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,35,20,.2)' });
          K.fur(c, bb, '#3d2f28', 5, 1.4, 0.35, { seed: 31, alpha: 0.35 });
          K.paintBlob(c, 3.1, 0.7, 0.7, 0.5, 0, C.pink, 0.85);       // Pfötchen
          K.paintBlob(c, -3.2, 0.7, 0.8, 0.5, 0, C.pink, 0.85);
        }, K.rim(K.S(nearFore, nearThigh, nearHind), { w: 0.15, color: rimc })) },
      { shapes: incisors, fill: { top: C.tooth, bottom: '#f8e2a8' }, stroke: null,
        deco: K.deco((c) => { K.curve(c, [[11.15, 3.0], [11.2, 0.9]], 'rgba(120,85,50,.55)', 0.14); }, K.rim(incisors, { w: 0.14, color: 'rgba(110,80,50,.9)', soft: 0.06 })) },
      { shapes: K.S(head), fill: { stops: [[0, C.top], [0.5, C.mid], [0.8, '#cdb9a5'], [1, '#e8dac6']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,35,20,.10)' });
          K.curve(c, [[5.2, 9.5], [6.8, 9.0], [8.8, 7.8]], C.stripe, 0.7, { alpha: 0.55 });    // Stirnstreifen
          K.fur(c, bb, '#3d2f28', 6, 1.2, 0.35, { seed: 12, alpha: 0.32 });
          K.paintBlob(c, 5.6, 4.0, 1.2, 0.8, 0, '#f2a79c', 0.5);                                // Bäckchen
          K.paintBlob(c, 11.0, 5.5, 0.8, 0.65, 0.1, C.nose, 1);                                   // Nase
          K.curve(c, [[10.3, 4.2], [8.6, 3.7], [7.0, 3.7], [6.1, 4.1]], C.ink, 0.2);
          for (const [x, y] of [[8.3, 4.8], [9.1, 4.6], [8.6, 5.5]]) K.paintBlob(c, x, y, 0.13, 0.13, 0, 'rgba(60,40,30,.6)', 0.9);
          K.bead(c, 7.4, 6.7, 1.05);
        }, K.rim(K.S(head), { w: 0.15, color: rimc })) },
      { shapes: [ear], fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 4.35, 9.2, 1.0, 0.95, 0, C.pink, 0.95); }, K.rim([ear], { w: 0.14, color: rimc })) },
    ] },
    jaw: { z: 0, pivot: K.pt([5.8, 3.7]), layers: [
      { shapes: [jawShape], fill: { top: '#d6c4b0', bottom: C.belly }, stroke: null, deco: K.rim([jawShape], { w: 0.14, color: rimc }) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: K.S(tail), fill: { top: '#5d493f', bottom: '#8c7667' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.paintBlob(c, -11.2, 7.1, 1.7, 1.7, 0, '#efe2cc', 0.9);                               // helle Schwanzspitze
          K.fur(c, bb, '#3d2f28', 8, 1.4, 0.3, { seed: 2, alpha: 0.4, ang: Math.PI - 0.3 });
        }, K.rim(K.S(tail), { w: 0.14, color: rimc })) },
    ] },
  };
  return {
    id: 'multituberculate', parts,
    anchors: { head: K.pt([6.5, 6.0]), mouth: K.pt([10.4, 3.6]), eye: K.pt([7.4, 6.7]), back: K.pt([-1, 9.2]), foot: K.pt([-0.5, 0]) },
    meta: { name: 'Vielhöckerzähner (Multituberculata)', lengthM: 0.18, ranges: { jaw: [0, -0.5], tail: [0, -0.5] } },
  };
}
