// Morganucodon (Obertrias/Unterjura): winziges spitzmausartiges Säugetier, ~10 cm + langer dünner Schwanz.
// Entwurf in cm (u = 0.0085 m). Blick nach +x, Boden y = 0.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.0085);
  const h = (x, y) => [1.5 + (x - 1.5) * 1.14, 3.0 + (y - 3.0) * 1.14];   // Kopf etwas größer = herziger
  const hp = (pts) => pts.map(([x, y]) => h(x, y));
  const C = { top: '#8f5535', mid: '#b07046', belly: '#f3dbb4', dark: '#6a3a22', pink: '#ec9a8e', nose: '#d86a7c', ink: 'rgba(60,30,16,.85)' };

  // ---- Körper (rund, pummelig, leicht angehoben) ----
  const trunk = [K.blob(-1.2, 3.15, 3.2, 2.2, 0.03), K.blob(-3.0, 3.05, 1.9, 2.0), K.blob(1.0, 3.05, 2.1, 2.05)];

  const farFore = K.limb([[1.9, 1.9, 1.3], [2.2, 1.0, 1.05], [2.9, 0.5, 1.05]]);
  const farHind = K.limb([[-1.8, 2.0, 1.8], [-1.6, 1.1, 1.15], [-0.8, 0.5, 1.05]]);
  const nearFore = K.limb([[0.7, 1.9, 1.5], [0.95, 1.0, 1.15], [1.75, 0.5, 1.1]]);
  const nearHind = [K.blob(-2.8, 2.0, 1.55, 1.4, 0.3), K.limb([[-3.0, 1.3, 1.4], [-2.8, 0.6, 1.15], [-1.7, 0.5, 1.05]])];

  // Kopf: große runde Kalotte, kurze spitze Schnauze, leicht gesenkt
  const head = K.poly(hp([
    [1.0, 4.2], [1.5, 5.4], [2.9, 5.95], [4.4, 5.55], [5.8, 4.75], [7.0, 3.9], [7.45, 3.4], [7.25, 3.0], [6.2, 2.85], [4.7, 2.8],
    [3.6, 2.6], [2.8, 1.75], [1.6, 1.95], [0.8, 3.1]]), 2);
  const jawShape = K.limb(hp([[3.0, 2.25, 0], [4.4, 2.0, 0], [5.5, 2.1, 0], [6.4, 2.5, 0]]).map((q, i) => [q[0], q[1], [1.9, 1.7, 1.3, 0.55][i]]));
  const ear = [K.blob(...h(2.35, 5.85), 1.45, 1.4)];
  const farEar = [K.blob(...h(1.0, 5.2), 1.1, 1.05)];

  const tail = K.limb([[-3.2, 3.3, 2.6], [-5.2, 3.1, 1.9], [-8.0, 2.2, 1.35], [-10.7, 1.4, 1.1], [-12.8, 1.9, 0.85], [-13.9, 3.2, 0.6], [-13.4, 4.5, 0.2]], { per: 12 });
  const tailPivot = K.pt([-3.3, 3.3]);

  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farFore, farHind, farEar), fill: { top: C.dark, bottom: '#855634' }, stroke: null,
        deco: K.deco((c, bb) => K.shade(c, bb), K.rim(K.S(farFore, farHind, farEar), { w: 0.12 })) },
      { shapes: K.S(trunk), fill: { stops: [[0, C.top], [0.45, C.mid], [0.68, '#dba97a'], [0.82, C.belly], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,30,10,.16)' });
          K.fur(c, bb, '#6a3a22', 16, 1.4, 0.16, { seed: 3, alpha: 0.4 });
          K.fur(c, bb, '#f6dfb8', 8, 1.2, 0.16, { seed: 8, alpha: 0.45, box: { x0: bb.x0, y0: bb.y0, w: bb.w, h: bb.h * 0.4 } });
        }, K.rim(K.S(trunk), { w: 0.13 })) },
      { shapes: K.S(nearFore, nearHind), fill: { top: C.mid, bottom: '#e0b88a' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,30,10,.18)' });
          K.fur(c, bb, '#6a3a22', 5, 1.0, 0.16, { seed: 21, alpha: 0.35 });
          K.paintBlob(c, 2.7, 0.55, 0.45, 0.4, 0, '#f0b9a8', 0.85);   // Pfötchen
          K.paintBlob(c, -1.85, 0.55, 0.5, 0.4, 0, '#f0b9a8', 0.85);
        }, K.rim(K.S(nearFore, nearHind), { w: 0.13 })) },
      { shapes: [head], fill: { stops: [[0, C.top], [0.5, C.mid], [1, '#e4c090']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(60,30,10,.10)' });
          K.fur(c, bb, '#6a3a22', 8, 1.1, 0.16, { seed: 12, alpha: 0.35 });
          K.paintBlob(c, ...h(3.3, 3.05), 0.85, 0.55, 0, '#ee8f86', 0.5);           // Bäckchen
          K.paintBlob(c, ...h(7.2, 3.2), 0.55, 0.5, 0, C.nose, 1);                 // Nase
          K.curve(c, hp([[7.0, 2.9], [5.7, 2.8], [4.5, 2.85], [3.8, 3.15]]), C.ink, 0.16);
          K.bead(c, ...h(4.4, 4.35), 0.98);
          K.curve(c, hp([[3.6, 5.1], [4.3, 5.35], [5.0, 5.0]]), 'rgba(60,30,16,.5)', 0.15);
        }, K.rim([head], { w: 0.13 })) },
      { shapes: ear, fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, ...h(2.55, 5.65), 0.9, 0.82, 0, C.pink, 0.95); }, K.rim(ear, { w: 0.13 })) },
    ] },
    jaw: { z: 0, pivot: K.pt(h(3.0, 2.6)), layers: [
      { shapes: [jawShape], fill: { top: '#e2b98a', bottom: C.belly }, stroke: null, deco: K.rim([jawShape], { w: 0.12 }) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: [tail], fill: { top: C.dark, bottom: '#a8724c' }, stroke: null,
        deco: K.deco((c, bb) => { K.fur(c, bb, '#4b2614', 12, 1.0, 0.12, { seed: 2, alpha: 0.4, ang: Math.PI - 0.3 }); }, K.rim([tail], { w: 0.12 })) },
    ] },
  };
  return {
    id: 'morganucodon', parts,
    anchors: { head: K.pt(h(4.4, 4.0)), mouth: K.pt(h(7.2, 2.9)), eye: K.pt(h(4.4, 4.35)), back: K.pt([-1.0, 5.3]), foot: K.pt([-0.2, 0]) },
    meta: { name: 'Morganucodon', lengthM: 0.19, bodyLengthM: 0.1, ranges: { jaw: [0, -0.5], tail: [0, -0.5] } },
  };
}
