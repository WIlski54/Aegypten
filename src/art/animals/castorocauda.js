// Castorocauda (Mitteljura): otter-/biberähnlich, flacher beschuppter Schwanz, Schwimmhäute, ~45 cm.
// Entwurf in "Einheiten" (u = 0.0085 m); Blick nach +x, Boden y = 0.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.0085);
  const C = { top: '#5d4535', mid: '#876748', belly: '#dcc5a0', dark: '#3f2e25', skin: '#c99d78', skinD: '#a9795a', nose: '#2e211d', ink: 'rgba(40,24,14,.85)', tail: '#4e3d38' };

  // ---- Rumpf ----
  const trunk = K.S(K.blob(-2.5, 9.8, 12.2, 6.0, 0.02), K.blob(-10.5, 9.6, 6.0, 6.0), K.blob(5.2, 9.6, 6.6, 6.0));

  // ---- Beine (Schwimmfüße) ----
  const nearThigh = K.limb([[-12.0, 9.8, 9.0], [-8.6, 7.2, 8.0], [-5.6, 4.9, 5.2]], { per: 10 });
  const nearShin = K.limb([[-5.8, 5.0, 5.0], [-8.4, 3.0, 3.6], [-9.6, 1.5, 3.0]]);
  const nearHindFoot = K.poly([[-10.5, 2.2], [-11.0, 0.5], [-9.0, 0.0], [-5.6, 0.0], [-3.5, 0.6], [-3.4, 1.3], [-4.6, 1.5], [-6.5, 1.8], [-8.8, 2.8]], 2);
  const farThigh = K.blob(-6.4, 7.0, 4.2, 4.0, 0.2);
  const farShin = K.limb([[-6.6, 5.4, 3.8], [-5.8, 2.4, 2.5], [-4.8, 1.3, 2.2]]);
  const farHindFoot = K.poly([[-7.0, 2.2], [-7.4, 0.5], [-5.4, 0.0], [-2.2, 0.0], [-0.4, 0.6], [-0.3, 1.3], [-1.5, 1.5], [-3.4, 1.8], [-5.4, 2.8]], 2);
  const nearArm = K.limb([[6.4, 6.8, 4.6], [7.2, 3.6, 3.2], [8.0, 1.8, 2.8]]);
  const nearHand = K.poly([[6.4, 2.6], [6.6, 0.5], [8.2, 0.0], [10.4, 0.0], [11.6, 0.7], [11.3, 1.5], [9.6, 1.9], [8.0, 3.0]], 2);
  const farArm = K.limb([[9.2, 6.8, 4.0], [10.0, 3.6, 2.8], [10.8, 1.8, 2.5]]);
  const farHand = K.poly([[9.2, 2.6], [9.4, 0.5], [11.0, 0.0], [13.2, 0.0], [14.4, 0.7], [14.1, 1.5], [12.4, 1.9], [10.8, 3.0]], 2);

  // ---- Kopf: rundliches Gesicht, stumpfe Schnauze, kleines rundes Ohr ----
  const head = K.S(K.blob(14.0, 11.9, 5.3, 4.9, 0.1), K.blob(19.6, 10.7, 4.2, 2.6, -0.12), K.blob(11.8, 9.4, 2.6, 2.2));
  const cheekTufts = K.S(K.tuft(12.4, 8.6, 3.9, 2.8, 2.0), K.tuft(10.9, 10.2, 3.5, 2.6, 2.0), K.tuft(10.2, 12.0, 3.3, 2.4, 1.8));
  const ear = K.blob(11.3, 15.9, 1.7, 1.6);
  const jawShape = K.limb([[14.2, 8.0, 3.8], [17.6, 7.2, 3.3], [20.6, 8.0, 2.2], [22.0, 8.8, 0.9]]);

  // ---- Schwanz: flacher Biberkelle, beschuppt ----
  const tail = K.limb([[-12.6, 10.8, 4.8], [-16.5, 9.9, 5.8], [-21.0, 8.0, 7.2], [-25.6, 6.2, 7.6], [-29.5, 5.0, 5.8], [-31.3, 4.5, 2.4], [-31.6, 4.4, 0.8]], { per: 12 });
  const tailPivot = K.pt([-12.8, 10.8]);

  const toes = (c, pts) => { for (const q of pts) K.curve(c, q, 'rgba(70,40,25,.6)', 0.22); };

  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farThigh, farShin, farHindFoot, farArm, farHand), fill: { top: '#4a362b', bottom: '#7a5640' }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb); },
          K.rim(K.S(farThigh, farShin, farHindFoot, farArm, farHand), { w: 0.2 })) },
      { shapes: trunk, fill: { stops: [[0, C.top], [0.4, C.mid], [0.65, '#b99870'], [0.8, C.belly], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(50,28,10,.16)' });
          K.fur(c, bb, '#3b2a20', 34, 2.6, 0.55, { seed: 3, alpha: 0.38 });
          K.fur(c, bb, '#f2dcb6', 14, 2.2, 0.5, { seed: 9, alpha: 0.4, box: { x0: bb.x0, y0: bb.y0, w: bb.w, h: bb.h * 0.35 } });
        }, K.rim(trunk, { w: 0.22 })) },
      { shapes: K.S(nearThigh, nearShin, nearHindFoot, nearArm, nearHand), fill: { top: C.mid, bottom: C.skin }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(50,28,10,.22)' });
          K.fur(c, bb, '#3b2a20', 8, 2.0, 0.26, { seed: 31, alpha: 0.35, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.45, w: bb.w, h: bb.h * 0.55 } });
          // Schwimmhäute + Zehen
          K.paintPoly(c, [[-10.5, 0.1], [-4, 0.1], [-3.5, 1.3], [-9, 2.4]], C.skin, 0.9, 1);
          K.paintPoly(c, [[6.6, 0.1], [11.6, 0.1], [11.3, 1.4], [8, 2.6]], C.skin, 0.9, 1);
          toes(c, [[[-8.6, 1.9], [-6.6, 0.9], [-3.9, 0.9]], [[-8.8, 1.2], [-7, 0.5], [-4.8, 0.3]], [[8.2, 1.9], [9.8, 1.0], [11.5, 0.9]], [[8.0, 1.2], [9.4, 0.4], [10.8, 0.3]]]);
        }, K.rim(K.S(nearThigh, nearShin, nearHindFoot, nearArm, nearHand), { w: 0.2 })) },
      { shapes: K.S(head, cheekTufts), fill: { stops: [[0, C.top], [0.45, C.mid], [0.78, '#b99870'], [1, '#d9bf96']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(50,28,10,.10)' });
          K.paintBlob(c, 20.2, 9.7, 3.4, 1.7, -0.1, '#ead7b4', 0.8);           // heller Schnauzenfleck
          K.fur(c, bb, '#3b2a20', 8, 1.8, 0.25, { seed: 12, alpha: 0.35, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.4, w: bb.w * 0.55, h: bb.h * 0.6 } });
          K.paintBlob(c, 22.6, 10.9, 1.05, 0.85, 0.1, C.nose, 1);                // Nase
          K.curve(c, [[22.0, 9.0], [20.3, 8.5], [18.0, 8.6], [16.3, 9.1]], C.ink, 0.28);
          for (const [x, y] of [[19.4, 9.7], [20.4, 9.9], [19.8, 10.5], [20.9, 10.5]]) K.paintBlob(c, x, y, 0.2, 0.2, 0, 'rgba(60,35,25,.7)', 0.9);
          K.bead(c, 16.9, 12.6, 1.35);
          K.curve(c, [[15.1, 14.5], [16.9, 15.0], [18.5, 14.1]], 'rgba(50,28,14,.45)', 0.28);
        }, K.rim(K.S(head, cheekTufts), { w: 0.22 })) },
      { shapes: [ear], fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 11.4, 15.8, 1.0, 0.95, 0, '#d9967f', 0.9); }, K.rim([ear], { w: 0.2 })) },
    ] },
    jaw: { z: 0, pivot: K.pt([14.4, 8.4]), layers: [
      { shapes: [jawShape], fill: { top: '#d6b890', bottom: C.belly }, stroke: null, deco: K.rim([jawShape], { w: 0.2 }) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: [tail], fill: { top: C.dark, bottom: C.tail }, stroke: null,
        deco: K.deco((c, bb) => {
          K.scaleMarks(c, bb, '#d2b9a0', 1.7, { alpha: 0.38, w: 0.2 });
          K.shade(c, bb, { dark: 'rgba(20,10,5,.25)', light: 'rgba(255,240,220,.12)' });
        }, K.rim([tail], { w: 0.22 })) },
    ] },
  };
  return {
    id: 'castorocauda', parts,
    anchors: { head: K.pt([15.5, 11.5]), mouth: K.pt([22.0, 9.0]), eye: K.pt([16.9, 12.6]), back: K.pt([-2.5, 15.8]), foot: K.pt([-3, 0]) },
    meta: { name: 'Castorocauda', lengthM: 0.46, ranges: { jaw: [0, -0.45], tail: [0, -0.3] } },
  };
}
