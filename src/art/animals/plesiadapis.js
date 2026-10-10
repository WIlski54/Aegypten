// Plesiadapis (Paläozän): eichhörnchenartig auf allen vieren, lange Krallen, buschiger Schwanz, nagerartige Schneidezähne; ~60 cm inkl. Schwanz.
// Entwurf in "Einheiten" (u = 0.0105 m); Blick nach +x, Boden y = 0.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.0105);
  const C = { top: '#76573f', mid: '#a58260', belly: '#f1e3c4', dark: '#4a3629', pink: '#e8a596', nose: '#3a2a26', claw: '#3d3027', tooth: '#fff2cc', ink: 'rgba(50,38,28,.88)' };

  // ---- Rumpf: gewölbter Eichhörnchenrücken (Hinterteil höher) ----
  const trunk = K.S(K.blob(0.0, 9.7, 8.4, 5.6, 0.05), K.blob(-6.2, 10.6, 6.5, 6.3), K.blob(6.8, 9.2, 5.2, 5.0));

  const claws = (pts) => pts.map(([x, y, a]) => K.tuft(x, y, a, 1.75, 0.85, 0.35));
  const allClaws = [];
  const nearArm = K.limb([[7.6, 6.8, 3.6], [8.6, 3.6, 2.7], [9.6, 1.2, 2.5]]);
  const nearHand = K.poly([[8.5, 1.9], [8.7, 0.3], [10.4, 0.0], [12.6, 0.2], [13.0, 0.9], [11.8, 1.6], [9.8, 2.4]], 2);
  const nearHandClaws = claws([[12.4, 0.9, -0.15], [12.1, 0.45, -0.5], [12.5, 1.3, 0.25]]); allClaws.push(...nearHandClaws);
  const farArm = K.limb([[10.8, 6.8, 3.2], [11.8, 3.6, 2.5], [12.8, 1.2, 2.3]]);
  const farHand = K.poly([[11.7, 1.9], [11.9, 0.3], [13.6, 0.0], [15.8, 0.2], [16.2, 0.9], [15.0, 1.6], [13.0, 2.4]], 2);
  const farHandClaws = claws([[15.6, 0.9, -0.15], [15.3, 0.45, -0.5], [15.7, 1.3, 0.25]]); const farClaws = [...farHandClaws];
  const nearThigh = K.blob(-7.0, 7.5, 4.7, 4.9, 0.3);
  const nearShin = K.limb([[-7.6, 5.4, 3.8], [-6.8, 2.5, 2.7], [-5.6, 1.3, 2.5]]);
  const nearHindFoot = K.poly([[-8.0, 2.3], [-8.4, 0.4], [-6.6, 0.0], [-3.2, 0.0], [-0.8, 0.4], [-0.4, 1.0], [-1.6, 1.6], [-4.0, 1.9], [-6.4, 2.8]], 2);
  const nearHindClaws = claws([[-1.0, 0.9, -0.1], [-1.3, 0.4, -0.45], [-0.8, 1.35, 0.3]]); allClaws.push(...nearHindClaws);
  const farThigh = K.blob(-3.8, 7.5, 4.2, 4.4, 0.2);
  const farShin = K.limb([[-4.2, 5.4, 3.4], [-3.6, 2.5, 2.5], [-2.6, 1.3, 2.3]]);
  const farHindFoot = K.poly([[-4.8, 2.3], [-5.2, 0.4], [-3.4, 0.0], [0.0, 0.0], [2.4, 0.4], [2.8, 1.0], [1.6, 1.6], [-0.8, 1.9], [-3.2, 2.8]], 2);
  const farHindClaws = claws([[2.2, 0.9, -0.1], [1.9, 0.4, -0.45], [2.4, 1.35, 0.3]]); farClaws.push(...farHindClaws);

  // ---- Kopf: lange Nagerschnauze, kleine runde Ohren ----
  const head = K.S(K.blob(13.0, 10.9, 4.5, 4.1, 0.05), K.blob(18.0, 9.5, 4.0, 2.1, -0.18), K.blob(11.6, 8.2, 2.6, 2.0));
  const ear = K.blob(11.0, 14.5, 1.9, 1.8);
  const earFar = K.blob(14.4, 14.7, 1.6, 1.5);
  const jawShape = K.limb([[13.4, 7.1, 3.4], [16.4, 6.4, 3.0], [19.4, 7.2, 1.9], [21.0, 8.0, 0.9]]);
  const incisors = K.S(K.poly([[20.0, 8.6], [20.0, 5.6], [20.6, 4.9], [21.6, 5.0], [21.9, 5.8], [21.6, 8.6]], 1));

  // ---- Schwanz: buschig, locker gewellt ----
  const tailCtrl = [[-10.8, 12.9, 5.6], [-15.2, 14.3, 8.0], [-20.0, 15.2, 10.0], [-25.0, 14.8, 10.4], [-29.5, 16.4, 9.0], [-33.0, 19.4, 6.4], [-34.8, 22.4, 3.2], [-34.8, 24.6, 0.9]];
  const tail = K.bushyLimb(tailCtrl, { every: 2.3, len: 2.2, tw: 2.2, from: 0.1, ang: 0.4, bend: 0.12 });
  const tailPivot = K.pt([-10.8, 12.9]);
  const rimc = 'rgba(50,38,28,.9)';

  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farThigh, farShin, farHindFoot, farHindClaws, farArm, farHand, farHandClaws, earFar), fill: { top: '#4a3629', bottom: '#755840' }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb); for (const cl of farClaws) K.fillM(c, cl, '#2a211b', 1); }, K.rim(K.S(farThigh, farShin, farHindFoot, farHindClaws, farArm, farHand, farHandClaws, earFar), { w: 0.2, color: rimc })) },
      { shapes: trunk, fill: { stops: [[0, C.top], [0.45, C.mid], [0.7, '#cdb48f'], [0.84, C.belly], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(50,35,15,.15)' });
          K.fur(c, bb, '#3f2d20', 30, 2.6, 0.55, { seed: 4, alpha: 0.4 });
          K.fur(c, bb, '#f4e8cc', 14, 2.2, 0.5, { seed: 9, alpha: 0.42, box: { x0: bb.x0, y0: bb.y0, w: bb.w, h: bb.h * 0.4 } });
        }, K.rim(trunk, { w: 0.22, color: rimc })) },
      { shapes: K.S(nearThigh, nearShin, nearHindFoot, nearHindClaws, nearArm, nearHand, nearHandClaws), fill: { top: C.mid, bottom: '#dbc4a0' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(50,35,15,.2)' });
          K.fur(c, bb, '#3f2d20', 8, 2.0, 0.5, { seed: 31, alpha: 0.38, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.35, w: bb.w, h: bb.h * 0.5 } });
          // helle Haut auf Händen und Füßen, dunkle Krallen
          K.paintPoly(c, [[-8, 0.1], [-1.4, 0.1], [-1.6, 1.4], [-6, 2.4]], '#dcb8a2', 0.9, 1);
          K.paintPoly(c, [[8.7, 0.1], [12.6, 0.1], [12.0, 1.5], [9.6, 2.5]], '#dcb8a2', 0.9, 1);
          for (const cl of allClaws) K.fillM(c, cl, C.claw, 1);
        }, K.rim(K.S(nearThigh, nearShin, nearHindFoot, nearHindClaws, nearArm, nearHand, nearHandClaws), { w: 0.2, color: rimc })) },
      { shapes: incisors, fill: { top: C.tooth, bottom: '#f8e2a8' }, stroke: null,
        deco: K.deco((c) => { K.curve(c, [[20.85, 7.0], [20.9, 5.3]], 'rgba(120,85,50,.55)', 0.2); }, K.rim(incisors, { w: 0.2, color: 'rgba(110,80,50,.9)', soft: 0.06 })) },
      { shapes: K.S(head), fill: { stops: [[0, C.top], [0.5, C.mid], [0.8, '#cdb48f'], [1, '#e6d3b0']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(50,35,15,.10)' });
          K.paintBlob(c, 19.0, 9.3, 3.2, 1.4, -0.15, '#c9ae88', 0.55);                  // hellere Schnauze
          K.fur(c, bb, '#3f2d20', 8, 1.8, 0.45, { seed: 12, alpha: 0.35, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.35, w: bb.w * 0.55, h: bb.h * 0.6 } });
          K.paintBlob(c, 13.0, 8.7, 1.2, 0.8, 0, '#e8a595', 0.4);                       // Bäckchen
          K.paintBlob(c, 21.6, 10.0, 0.95, 0.8, -0.1, C.nose, 1);                         // Nase
          K.curve(c, [[21.0, 8.7], [19.2, 8.0], [16.8, 8.1], [15.0, 8.7]], C.ink, 0.26);
          for (const [x, y] of [[18.8, 9.0], [19.8, 9.2], [19.3, 9.9]]) K.paintBlob(c, x, y, 0.17, 0.17, 0, 'rgba(50,35,25,.65)', 0.9);
          K.bead(c, 15.0, 11.5, 1.25);
          K.curve(c, [[13.2, 13.5], [15.0, 14.0], [16.6, 13.2]], 'rgba(50,35,25,.45)', 0.26);
        }, K.rim(K.S(head), { w: 0.22, color: rimc })) },
      { shapes: [ear], fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 11.1, 14.4, 1.2, 1.15, 0, C.pink, 0.9); }, K.rim([ear], { w: 0.2, color: rimc })) },
    ] },
    jaw: { z: 0, pivot: K.pt([13.4, 7.7]), layers: [
      { shapes: [jawShape], fill: { top: '#d0b891', bottom: C.belly }, stroke: null, deco: K.rim([jawShape], { w: 0.2, color: rimc }) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: K.S(tail), fill: { top: '#6a4d37', bottom: '#a98862' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.rings(c, tailCtrl, { step: 4.6, color: '#3f2d20', w: 1.3, alpha: 0.3, from: 0.1, to: 0.9, reach: 14 });
          K.rings(c, tailCtrl, { step: 99, color: '#3f2d20', w: 5.5, alpha: 0.5, from: 0.9, to: 1, reach: 14 });
          K.fur(c, bb, '#3f2d20', 20, 2.4, 0.55, { seed: 2, alpha: 0.35, ang: Math.PI * 0.6 });
          K.fur(c, bb, '#f2e2c0', 16, 2.4, 0.55, { seed: 5, alpha: 0.4, ang: Math.PI * 0.6 });
        }, K.rim(K.S(tail), { w: 0.22, color: rimc })) },
    ] },
  };
  return {
    id: 'plesiadapis', parts,
    anchors: { head: K.pt([15, 11]), mouth: K.pt([21.0, 8.4]), eye: K.pt([15.0, 11.5]), back: K.pt([-4, 16]), foot: K.pt([-3, 0]) },
    meta: { name: 'Plesiadapis', lengthM: 0.6, ranges: { jaw: [0, -0.45], tail: [0, -0.35] } },
  };
}
