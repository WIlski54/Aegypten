// Pakicetus (Eozän): Vorfahr der Wale, aber noch an Land: wolfs-/otterähnlich, lange Schnauze, kurze kräftige Beine, langer Schwanz; ~1,8 m.
// Entwurf in "Einheiten" (u = 0.0085 m); Blick nach +x, Boden y = 0. Augen sitzen (wie beim echten Tier) hoch oben auf dem Schädel.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.0085);
  const C = { top: '#58483c', mid: '#8c7860', belly: '#e6d8b8', dark: '#35322f', hoof: '#2c2622', pink: '#d9a396', nose: '#2b2321', tooth: '#fffaf0', ink: 'rgba(40,34,30,.9)', snout: '#b8a78a' };
  const rimc = 'rgba(38,32,28,.9)';

  // ---- Rumpf: lang, tief, kräftig ----
  const trunk = K.S(K.blob(0, 41, 38.5, 16.4, 0.0), K.blob(-29, 40.8, 17.5, 16.8), K.blob(26, 40.2, 17.5, 16.6),
    K.limb([[30, 42.5, 33], [43, 45.5, 29], [54, 47.5, 25]], { per: 12 }), K.blob(45, 48, 13, 11.5, 0.2));

  const nearFore = K.limb([[25, 35, 20], [26, 24, 12.5], [27.4, 12, 9.4], [28.4, 1.8, 8.6]]);
  const nearForeFoot = K.poly([[22.5, 5.5], [22.5, 0], [38.5, 0], [39, 3.4], [31, 6]], 1);
  const farFore = K.limb([[36, 35, 17], [37, 24, 11], [38.4, 12, 8.6], [39.4, 1.8, 7.8]]);
  const farForeFoot = K.poly([[33.5, 5.5], [33.5, 0], [49.5, 0], [50, 3.4], [42, 6]], 1);
  // Hinterbein als Z (Hüfte -> Knie vorn -> Ferse hinten -> Fuß)
  const nearHindThigh = K.limb([[-29, 39, 25], [-22, 31, 16], [-20.5, 27.5, 12]], { per: 10 });
  const nearHind = K.limb([[-20.5, 28, 12], [-27, 17, 9.4], [-30.5, 8.5, 8.4], [-30, 2, 8.2]]);
  const nearHindFoot = K.poly([[-34.5, 6.5], [-34.5, 0], [-17.5, 0], [-17, 3.4], [-25, 6.5]], 1);
  const farHindThigh = K.limb([[-19, 39, 22], [-12, 31, 14], [-10.5, 27.5, 11]], { per: 10 });
  const farHind = K.limb([[-10.5, 28, 11], [-17, 17, 8.6], [-20.5, 8.5, 7.6], [-20, 2, 7.4]]);
  const farHindFoot = K.poly([[-24.5, 6.5], [-24.5, 0], [-7.5, 0], [-7, 3.4], [-15, 6.5]], 1);

  // ---- Kopf: lange Schnauze, Augen hoch oben, kleine runde Ohren ----
  const head = K.S(K.blob(62, 47.0, 15.4, 13.2, 0.05), K.blob(80, 44.0, 15.8, 7.2, -0.16));
  const upperTeeth = K.S(K.poly([[79, 38.2], [80.8, 33.2], [82.6, 38.2]], 1), K.poly([[84, 37.8], [85.6, 33.4], [87.2, 37.6]], 1), K.poly([[88.6, 37.4], [90, 33.6], [91.3, 37.2]], 1));
  const ear = K.blob(54.5, 58.6, 4.8, 4.6);
  const earFar = K.blob(61.5, 59.4, 4.0, 3.8);
  const jawShape = K.S(K.limb([[63, 37.5, 13.5], [72, 34.6, 10.6], [84, 34.4, 7.8], [93, 36.2, 3.8]]),
    K.poly([[79.4, 36.6], [81.2, 41.8], [83.0, 36.6]], 1), K.poly([[85.4, 36.4], [87.0, 41.2], [88.6, 36.4]], 1));

  // ---- Schwanz: lang, kräftig, nach hinten verjüngt ----
  const tailCtrl = [[-44, 42, 19], [-60, 41.5, 16], [-78, 37, 12.5], [-95, 29, 9.5], [-108, 20, 6.5], [-116, 15.5, 4], [-121, 16.5, 1.4]];
  const tail = K.S(K.limb(tailCtrl, { per: 14 }));
  const tailPivot = K.pt([-46, 42]);

  const hoofDots = (c, xs, y) => { for (const x of xs) K.paintBlob(c, x, y, 1.6, 2.2, 0, C.hoof, 0.95); };

  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farFore, farForeFoot, farHindThigh, farHind, farHindFoot, earFar), fill: { top: '#352b25', bottom: '#5d4e41' }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb); hoofDots(c, [43.8, 46.6, 49.0], 2.2); hoofDots(c, [-12, -9.5, -7.7], 2.2); }, K.rim(K.S(farFore, farForeFoot, farHindThigh, farHind, farHindFoot, earFar), { w: 0.28, color: rimc })) },
      { shapes: trunk, fill: { stops: [[0, C.top], [0.45, C.mid], [0.66, '#b8a687'], [0.8, C.belly], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,25,15,.14)' });
          K.paintBlob(c, 49, 33, 8, 8.5, 0.3, '#f0e4c6', 0.85);                               // heller Kehl-/Brustfleck
          K.fur(c, bb, '#2c2825', 36, 3.6, 0.8, { seed: 4, alpha: 0.32 });
          K.fur(c, bb, '#f1e8cf', 14, 3.2, 0.7, { seed: 9, alpha: 0.38, box: { x0: bb.x0, y0: bb.y0, w: bb.w, h: bb.h * 0.35 } });
        }, K.rim(trunk, { w: 0.28, color: rimc })) },
      { shapes: K.S(nearHindThigh, nearHind, nearHindFoot, nearFore, nearForeFoot), fill: { top: C.mid, bottom: '#bfae91' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,25,15,.2)' });
          K.fur(c, bb, '#2c2825', 8, 3.2, 0.7, { seed: 31, alpha: 0.32, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.35, w: bb.w, h: bb.h * 0.5 } });
          hoofDots(c, [33.5, 36, 38.2], 2.2); hoofDots(c, [-22.5, -20, -17.9], 2.2);
        }, K.rim(K.S(nearHindThigh, nearHind, nearHindFoot, nearFore, nearForeFoot), { w: 0.26, color: rimc })) },
      { shapes: K.S(head, upperTeeth), fill: { stops: [[0, C.top], [0.5, C.mid], [0.82, '#b8a687'], [1, '#d6c7a8']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(30,25,15,.10)' });
          K.paintBlob(c, 82, 43, 12.5, 4.2, -0.16, C.snout, 0.55);                             // hellere Schnauze
          K.fur(c, bb, '#2c2825', 8, 3.0, 0.7, { seed: 12, alpha: 0.3, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.35, w: bb.w * 0.5, h: bb.h * 0.6 } });
          for (const [x, y] of [[79, 38.2], [84, 37.8], [88.6, 37.4]]) K.paintPoly(c, [[x, y + 0.4], [x + 1.8, y - 5.0], [x + 3.6, y + 0.4]], C.tooth, 1, 1);
          K.paintBlob(c, 94.2, 42.2, 3.2, 2.6, -0.16, C.nose, 1);                              // Nase
          K.curve(c, [[93.5, 38.6], [88, 37.3], [80, 36.6], [72, 37.2], [67, 39.4]], C.ink, 0.8);
          K.paintBlob(c, 70.5, 40.5, 3.4, 2.2, 0, '#e8a595', 0.38);                            // Bäckchen
          K.bead(c, 69.0, 54.0, 4.2);
          K.curve(c, [[63.5, 58.6], [69.0, 60.2], [74.0, 57.8]], 'rgba(30,25,20,.45)', 0.8);
        }, K.rim(K.S(head, upperTeeth), { w: 0.28, color: rimc })) },
      { shapes: [ear], fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 54.6, 58.4, 2.9, 2.7, 0, C.pink, 0.88); }, K.rim([ear], { w: 0.26, color: rimc })) },
    ] },
    jaw: { z: 0, pivot: K.pt([63, 38.5]), layers: [
      { shapes: K.S(jawShape), fill: { top: '#a8987e', bottom: C.belly }, stroke: null,
        deco: K.deco((c) => { for (const [x, y] of [[79.4, 36.6], [85.4, 36.4]]) K.paintPoly(c, [[x, y + 0.2], [x + 1.7, y + 5.2], [x + 3.4, y + 0.2]], C.tooth, 1, 1); }, K.rim(K.S(jawShape), { w: 0.26, color: rimc })) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: K.S(tail), fill: { top: '#40342c', bottom: '#7d6c58' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.rings(c, tailCtrl, { step: 12, color: '#262320', w: 3.2, alpha: 0.28, from: 0.3, to: 0.95, reach: 24 });
          K.fur(c, bb, '#2a2623', 14, 3.4, 0.8, { seed: 2, alpha: 0.3, ang: Math.PI - 0.2 });
        }, K.rim(K.S(tail), { w: 0.28, color: rimc })) },
    ] },
  };
  return {
    id: 'pakicetus', parts,
    anchors: { head: K.pt([66, 46]), mouth: K.pt([93, 38.5]), eye: K.pt([69, 53.4]), back: K.pt([0, 56.5]), foot: K.pt([0, 0]) },
    meta: { name: 'Pakicetus', lengthM: 1.8, ranges: { jaw: [0, -0.5], tail: [0, -0.3] } },
  };
}
