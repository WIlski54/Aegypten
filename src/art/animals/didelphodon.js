// Didelphodon (Oberkreide): kräftiger beutelratten-/Beutelteufel-artiger Säuger, ~50 cm; breiter Schädel, kurze Beine, dicker Schwanz.
// Entwurf in "Einheiten" (u = 0.008 m); Blick nach +x, Boden y = 0.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.008);
  const C = { top: '#4a3d37', mid: '#6d5a4c', belly: '#cdb594', dark: '#2f2622', skin: '#b78a74', bib: '#efe2c6', nose: '#e08a96', ink: 'rgba(30,18,12,.88)' };

  // ---- Rumpf: stämmig ----
  const trunk = K.S(K.blob(-2.2, 10.2, 12.4, 6.9, 0.03), K.blob(-11.2, 9.9, 6.6, 6.8), K.blob(6.5, 10.4, 7.2, 7.0));

  // ---- Beine: kurz und kräftig ----
  const nearThigh = K.limb([[-12.4, 11.0, 10.8], [-8.6, 7.6, 9.4], [-5.6, 5.0, 6.2]], { per: 10 });
  const nearShin = K.limb([[-5.8, 5.1, 6.0], [-8.6, 3.0, 4.4], [-9.8, 1.4, 3.8]]);
  const nearHindFoot = K.poly([[-11.4, 2.3], [-11.8, 0.5], [-9.6, 0.0], [-6.0, 0.0], [-4.0, 0.6], [-3.9, 1.5], [-5.2, 1.9], [-7.4, 2.1], [-9.4, 3.0]], 2);
  const farThigh = K.blob(-6.0, 7.0, 4.6, 4.4, 0.2);
  const farShin = K.limb([[-6.2, 5.2, 4.2], [-5.4, 2.3, 3.4], [-4.4, 1.2, 3.2]]);
  const farHindFoot = K.poly([[-7.4, 2.2], [-7.8, 0.5], [-5.6, 0.0], [-2.0, 0.0], [0.0, 0.6], [0.1, 1.5], [-1.2, 1.9], [-3.4, 2.1], [-5.4, 3.0]], 2);
  const nearArm = K.limb([[7.4, 6.6, 6.2], [8.4, 3.4, 4.4], [9.4, 1.5, 4.0]]);
  const nearHand = K.poly([[7.4, 2.6], [7.6, 0.5], [9.6, 0.0], [12.4, 0.0], [13.8, 0.7], [13.5, 1.6], [11.6, 2.0], [9.2, 3.2]], 2);
  const farArm = K.limb([[11.0, 6.6, 5.4], [11.8, 3.4, 4.0], [12.6, 1.5, 3.6]]);
  const farHand = K.poly([[11.0, 2.6], [11.2, 0.5], [13.2, 0.0], [16.0, 0.0], [17.4, 0.7], [17.1, 1.6], [15.2, 2.0], [12.8, 3.2]], 2);

  // ---- Kopf: breiter, kräftiger Schädel, große Backen ----
  const head = K.S(K.blob(17.0, 12.8, 6.9, 6.5, 0.05), K.blob(23.6, 11.4, 5.6, 3.5, -0.1), K.blob(14.6, 9.6, 4.6, 3.4));
  const fang = K.poly([[25.6, 8.5], [26.6, 6.7], [27.2, 8.6]], 1);
  const ear = K.blob(13.3, 18.6, 2.5, 2.4);
  const earFar = K.blob(17.6, 19.0, 2.1, 2.0);
  const jawShape = K.limb([[16.8, 7.6, 5.0], [21.0, 6.6, 4.6], [25.2, 7.2, 3.4], [27.8, 8.4, 1.6]]);
  const tooth = K.poly([[26.0, 7.9], [26.8, 9.6], [27.5, 8.0]], 1);

  // ---- Schwanz: dick an der Basis (Fettreserve), läuft spitz aus ----
  const tail = K.limb([[-14.0, 10.8, 7.6], [-19.0, 10.0, 7.5], [-24.0, 8.3, 7.0], [-28.4, 6.4, 6.2], [-31.8, 5.6, 4.8], [-33.8, 5.8, 3.0], [-34.6, 6.3, 1.1]], { per: 12 });
  const tailPivot = K.pt([-14.2, 10.8]);

  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farThigh, farShin, farHindFoot, farArm, farHand, earFar), fill: { top: '#2f2622', bottom: '#51403a' }, stroke: null,
        deco: K.deco((c, bb) => K.shade(c, bb), K.rim(K.S(farThigh, farShin, farHindFoot, farArm, farHand, earFar), { w: 0.2, color: 'rgba(15,8,5,.9)' })) },
      { shapes: trunk, fill: { stops: [[0, C.top], [0.5, C.mid], [0.74, '#9c8368'], [0.88, C.belly], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,15,8,.18)' });
          K.paintBlob(c, 9.0, 8.4, 3.6, 5.0, 0.2, C.bib, 0.95);                    // heller Brustlatz (wie beim Beutelteufel)
          K.fur(c, bb, '#241b17', 36, 2.8, 0.6, { seed: 4, alpha: 0.42 });
          K.fur(c, bb, '#a58f78', 14, 2.4, 0.5, { seed: 11, alpha: 0.4, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.35, w: bb.w, h: bb.h * 0.5 } });
        }, K.rim(trunk, { w: 0.22, color: 'rgba(20,10,6,.88)' })) },
      { shapes: K.S(nearThigh, nearShin, nearHindFoot, nearArm, nearHand), fill: { top: C.mid, bottom: '#8f7160' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,15,8,.22)' });
          K.fur(c, bb, '#241b17', 8, 2.2, 0.5, { seed: 31, alpha: 0.35, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.35, w: bb.w, h: bb.h * 0.5 } });
          K.paintPoly(c, [[-11.4, 0.1], [-4, 0.1], [-3.9, 1.4], [-9.4, 2.6]], C.skin, 0.9, 1);
          K.paintPoly(c, [[7.6, 0.1], [13.8, 0.1], [13.5, 1.5], [9.2, 2.8]], C.skin, 0.9, 1);
          for (const q of [[[-7.4, 1.8], [-5.4, 0.9], [-4.1, 0.9]], [[-8.4, 1.0], [-6.4, 0.4], [-4.9, 0.3]], [[9.4, 1.8], [11.4, 0.9], [13.3, 0.9]], [[9.0, 1.0], [11.0, 0.4], [12.6, 0.3]]])
            K.curve(c, q, 'rgba(50,28,20,.65)', 0.24);
        }, K.rim(K.S(nearThigh, nearShin, nearHindFoot, nearArm, nearHand), { w: 0.2, color: 'rgba(20,10,6,.88)' })) },
      { shapes: K.S(head, fang), fill: { stops: [[0, C.top], [0.5, C.mid], [0.8, '#9c8368'], [1, '#bfa886']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,15,8,.12)' });
          K.paintBlob(c, 24.5, 11.0, 3.8, 2.2, -0.1, '#8e7662', 0.6);               // Schnauze etwas heller
          K.fur(c, bb, '#241b17', 12, 2.2, 0.5, { seed: 12, alpha: 0.35, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.35, w: bb.w * 0.6, h: bb.h * 0.6 } });
          K.paintBlob(c, 29.0, 12.0, 1.35, 1.1, 0.1, C.nose, 1);                      // große Nase
          K.paintPoly(c, [[25.6, 8.9], [26.6, 6.7], [27.2, 8.9]], '#fff8e8', 1, 1);   // Zahn
          K.curve(c, [[28.0, 9.4], [25.5, 8.5], [22.0, 8.6], [19.4, 9.3], [18.2, 10.0]], C.ink, 0.3);
          K.bead(c, 20.4, 13.6, 1.5, { ring: 'rgba(224,190,130,.9)' });
          K.curve(c, [[18.2, 16.0], [20.4, 16.6], [22.4, 15.6]], 'rgba(15,8,5,.5)', 0.3);
        }, K.rim(K.S(head, fang), { w: 0.22, color: 'rgba(20,10,6,.88)' })) },
      { shapes: [ear], fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 13.4, 18.5, 1.6, 1.5, 0, '#d98f86', 0.95); }, K.rim([ear], { w: 0.2, color: 'rgba(20,10,6,.88)' })) },
    ] },
    jaw: { z: 0, pivot: K.pt([17.0, 8.4]), layers: [
      { shapes: [jawShape, tooth], fill: { top: '#a99276', bottom: C.belly }, stroke: null,
        deco: K.deco((c) => { K.paintPoly(c, [[26.0, 8.1], [26.8, 9.7], [27.5, 8.1]], '#fff8e8', 1, 1); }, K.rim([jawShape, tooth], { w: 0.2, color: 'rgba(20,10,6,.88)' })) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: [tail], fill: { top: C.dark, bottom: '#6a5547' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.fur(c, bb, '#1c1411', 20, 2.4, 0.5, { seed: 2, alpha: 0.45, ang: Math.PI - 0.25 });
          K.fur(c, bb, '#9a846d', 8, 2.2, 0.4, { seed: 7, alpha: 0.35, ang: Math.PI - 0.25 });
        }, K.rim([tail], { w: 0.22, color: 'rgba(15,8,5,.9)' })) },
    ] },
  };
  return {
    id: 'didelphodon', parts,
    anchors: { head: K.pt([20, 12.5]), mouth: K.pt([28.0, 9.0]), eye: K.pt([20.4, 13.6]), back: K.pt([-2, 17.2]), foot: K.pt([-3, 0]) },
    meta: { name: 'Didelphodon', lengthM: 0.5, ranges: { jaw: [0, -0.45], tail: [0, -0.3] } },
  };
}
