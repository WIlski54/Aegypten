// Purgatorius (Wende Kreide/Paläogen): eichhörnchenartiger Urprimaten-Verwandter, ~10 cm + buschiger Schwanz; sitzt aufrecht,
// große Augen, kleine Greifhände. Entwurf in "Einheiten" (u = 0.008 m); Blick nach +x, Boden y = 0.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.008);
  const C = { top: '#bd6d33', mid: '#d58a4a', belly: '#f8e4c2', dark: '#7a3e1c', ring: '#6b3416', pink: '#f0a595', nose: '#d6667a', ink: 'rgba(80,38,18,.85)' };

  // ---- Körper: sitzt aufrecht, Rücken rund ----
  const tailCtrl = [[-3.2, 3.6, 3.2], [-6.6, 3.0, 4.6], [-9.6, 4.8, 5.4], [-10.8, 8.2, 5.8], [-9.6, 11.6, 5.0], [-7.6, 13.8, 3.2], [-6.4, 15.0, 1.2]];
  const trunk = K.S(K.blob(-1.3, 3.4, 3.9, 3.3, 0.2), K.limb([[-1.8, 3.8, 6.5], [-1.2, 6.2, 5.9], [0.2, 8.7, 4.8]], { per: 12 }), K.blob(1.2, 6.2, 2.7, 3.0));
  const nearThigh = K.blob(-0.9, 3.0, 3.1, 2.8, 0.3);
  const nearFoot = K.limb([[0.8, 1.1, 2.1], [3.2, 0.55, 1.7], [5.2, 0.5, 1.4]]);
  const farFoot = K.limb([[2.2, 1.1, 1.9], [4.6, 0.55, 1.5], [6.6, 0.5, 1.2]]);
  const farArm = K.limb([[2.3, 8.0, 1.5], [3.6, 6.4, 1.2], [5.0, 7.2, 1.1]]);
  const nearArm = K.S(K.limb([[1.0, 8.2, 1.9], [2.2, 6.2, 1.5], [3.9, 7.2, 1.3]]), K.blob(4.3, 7.4, 1.0, 0.85));

  // ---- Kopf: runde Kalotte, spitze Schnauze, riesige Augen ----
  const head = K.S(K.blob(2.5, 11.5, 2.9, 2.6, 0.05), K.blob(5.4, 10.7, 2.0, 1.3, -0.1));
  const ear = K.blob(1.1, 13.7, 1.35, 1.3);
  const farEar = K.blob(3.7, 14.0, 1.1, 1.05);
  const jawShape = K.limb([[3.0, 9.8, 2.0], [4.8, 9.2, 1.8], [6.2, 9.7, 1.0]]);

  const tail = K.bushyLimb(tailCtrl, { every: 1.7, len: 1.5, tw: 1.7, from: 0.1, ang: 0.4, bend: 0.12 });
  const tailPivot = K.pt([-3.2, 3.6]);
  const rimc = 'rgba(80,38,18,.9)';

  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farFoot, farArm, farEar), fill: { top: '#8a4a22', bottom: '#b8703e' }, stroke: null,
        deco: K.deco((c, bb) => K.shade(c, bb), K.rim(K.S(farFoot, farArm, farEar), { w: 0.14, color: rimc })) },
      { shapes: trunk, fill: { top: C.top, bottom: '#b4642d' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(80,35,10,.16)' });
          K.paintBlob(c, 2.1, 5.4, 1.9, 3.3, 0.1, C.belly, 0.97);                  // heller Bauch/Brustlatz
          K.fur(c, bb, '#7a3e1c', 22, 1.8, 0.4, { seed: 4, alpha: 0.42 });
          K.fur(c, bb, '#f3b878', 14, 1.7, 0.4, { seed: 9, alpha: 0.45 });
        }, K.rim(trunk, { w: 0.14, color: rimc })) },
      { shapes: K.S(nearThigh, nearFoot), fill: { top: C.mid, bottom: '#e9a766' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(80,35,10,.2)' });
          K.fur(c, bb, '#7a3e1c', 8, 1.6, 0.4, { seed: 31, alpha: 0.38 });
          K.paintBlob(c, 4.9, 0.75, 0.95, 0.5, 0, C.pink, 0.9);               // Zehen
        }, K.rim(K.S(nearThigh, nearFoot), { w: 0.14, color: rimc })) },
      { shapes: K.S(head), fill: { stops: [[0, C.top], [0.55, C.mid], [1, '#f4cf9c']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(80,35,10,.10)' });
          K.paintBlob(c, 5.6, 10.5, 1.7, 0.8, -0.1, C.belly, 0.75);                // helle Schnauze
          K.fur(c, bb, '#7a3e1c', 6, 1.2, 0.35, { seed: 12, alpha: 0.32 });
          K.paintBlob(c, 2.9, 10.0, 0.75, 0.5, 0, '#f08e80', 0.5);                  // Bäckchen
          K.paintBlob(c, 7.2, 11.0, 0.62, 0.52, 0.1, C.nose, 1);                    // Nase
          K.curve(c, [[6.9, 10.3], [5.8, 10.0], [4.7, 10.1], [4.1, 10.5]], C.ink, 0.17);
          K.bead(c, 4.0, 11.95, 1.05);
          K.curve(c, [[2.8, 13.6], [3.9, 13.9], [4.9, 13.2]], 'rgba(80,38,18,.45)', 0.17);
        }, K.rim(K.S(head), { w: 0.14, color: rimc })) },
      { shapes: [ear], fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 1.15, 13.6, 0.8, 0.75, 0, C.pink, 0.9); }, K.rim([ear], { w: 0.13, color: rimc })) },
      { shapes: K.S(nearArm), fill: { top: C.mid, bottom: '#efb577' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.paintBlob(c, 4.3, 7.35, 0.95, 0.8, 0, C.pink, 0.95);                      // Greifhand
          for (const [x0, y0, x1, y1] of [[4.0, 7.9, 4.35, 7.35], [4.55, 7.85, 4.75, 7.3]]) K.ink(c, [[x0, y0], [x1, y1]], 'rgba(120,50,40,.7)', 0.12);
          K.fur(c, bb, '#7a3e1c', 3, 1.2, 0.35, { seed: 41, alpha: 0.35 });
        }, K.rim(K.S(nearArm), { w: 0.13, color: rimc })) },
    ] },
    jaw: { z: 0, pivot: K.pt([3.1, 9.9]), layers: [
      { shapes: [jawShape], fill: { top: '#f1c590', bottom: C.belly }, stroke: null, deco: K.rim([jawShape], { w: 0.12, color: rimc }) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: K.S(tail), fill: { top: '#a85a28', bottom: '#cf8446' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.rings(c, tailCtrl, { step: 3.4, color: C.ring, w: 1.3, alpha: 0.5, from: 0.08, to: 0.98, reach: 12 });
          K.fur(c, bb, '#6b3416', 16, 1.7, 0.4, { seed: 2, alpha: 0.35, ang: Math.PI * 0.5 });
          K.fur(c, bb, '#ffd9a0', 12, 1.7, 0.4, { seed: 5, alpha: 0.4, ang: Math.PI * 0.5 });
        }, K.rim(K.S(tail), { w: 0.14, color: rimc })) },
    ] },
  };
  return {
    id: 'purgatorius', parts,
    anchors: { head: K.pt([3.4, 11.5]), mouth: K.pt([6.9, 10.2]), eye: K.pt([4.0, 12.0]), back: K.pt([-3.6, 6.0]), foot: K.pt([2.0, 0]) },
    meta: { name: 'Purgatorius', lengthM: 0.17, bodyLengthM: 0.1, ranges: { jaw: [0, -0.5], tail: [0, -0.45] } },
  };
}
