// Hyracotherium ("Urpferdchen", Eozän): fuchsgroß, ~35 cm Schulterhöhe, gewölbter Rücken, vorn vier Zehen, kurze Mähne, freundliches Gesicht.
// Entwurf in cm (u = 0.01 m); Blick nach +x, Boden y = 0.
import { kit } from './_d_kit.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { top: '#a7653a', mid: '#c98c58', belly: '#f6e6c6', dark: '#5f321a', sock: '#ecd7ae', hoof: '#3f2a1f', pink: '#eea296', nose: '#4a2b25', cream: '#fff0d2', ink: 'rgba(70,35,18,.88)' };
  const rimc = 'rgba(70,35,18,.9)';

  // ---- Rumpf: kompakt, gewölbter Rücken (Kruppe höher als Widerrist), tiefe Brust ----
  const trunk = K.S(K.blob(0, 26.0, 17.2, 7.6, 0.0), K.blob(-11.5, 28.4, 8.6, 8.3), K.blob(11.5, 24.8, 8.4, 8.2),
    K.limb([[11, 27, 12], [17, 29.5, 10], [23, 31.6, 8.8]], { per: 12 }));
  // kurze Mähne: weiche, nach hinten gelegte Büschel am Halsrücken
  const maneTuft = (x, y, a, L) => K.limb([[x, y, 3.4], [x + Math.cos(a) * L * 0.55, y + Math.sin(a) * L * 0.55 + 0.25, 2.9], [x + Math.cos(a) * L, y + Math.sin(a) * L + 0.1, 1.3]], { per: 8 });
  const mane = K.S(...[[11.4, 32.4], [13.4, 33.4], [15.4, 34.3], [17.4, 35.1], [19.4, 35.8], [21.4, 36.4], [23.4, 37.0]].map(([x, y], i) => maneTuft(x, y, 2.05 + i * 0.03, 3.8)));

  const nearFore = K.limb([[12.4, 20.0, 6.4], [13.2, 13.0, 4.4], [13.6, 6.0, 3.2], [14.0, 1.4, 3.0]]);
  const nearForeFoot = K.poly([[12.5, 2.5], [12.4, 0.0], [17.8, 0.0], [17.9, 1.2], [15.8, 2.5]], 1);
  const farFore = K.limb([[16.8, 20.0, 5.8], [17.6, 13.0, 4.0], [18.0, 6.0, 3.0], [18.4, 1.4, 2.8]]);
  const farForeFoot = K.poly([[16.9, 2.5], [16.8, 0.0], [22.2, 0.0], [22.3, 1.2], [20.2, 2.5]], 1);
  // Hinterbein: Hüfte -> Knie vorn -> Sprunggelenk hinten -> Fuß (wie bei Hirsch/Hund)
  const nearHindThigh = K.limb([[-13.2, 25.8, 12.6], [-9.8, 21.2, 10.4], [-7.6, 17.4, 7]], { per: 10 });
  const nearHind = K.limb([[-7.8, 18.0, 6.6], [-11.0, 11.0, 4.6], [-12.4, 6.6, 3.4], [-11.8, 1.4, 3.1]]);
  const nearHindFoot = K.poly([[-12.8, 2.5], [-12.9, 0.0], [-7.7, 0.0], [-7.6, 1.2], [-9.9, 2.5]], 1);
  const farHindThigh = K.limb([[-8.2, 25.8, 11.4], [-4.9, 21.2, 9.4], [-2.8, 17.4, 6.4]], { per: 10 });
  const farHind = K.limb([[-3.0, 18.0, 6.0], [-6.2, 11.0, 4.2], [-7.6, 6.6, 3.1], [-7.0, 1.4, 2.9]]);
  const farHindFoot = K.poly([[-8.0, 2.5], [-8.1, 0.0], [-2.9, 0.0], [-2.8, 1.2], [-5.1, 2.5]], 1);

  // ---- Kopf: freundliche lange Schnauze, große Augen, aufrechte Ohren ----
  const head = K.S(K.blob(27.4, 32.2, 5.8, 5.2, 0.1), K.blob(34.2, 30.0, 6.2, 2.9, -0.28));
  const ear = K.limb([[24.2, 36.4, 4.2], [23.6, 40.0, 3.4], [23.9, 43.0, 1.3]], { per: 10 });
  const earFar = K.limb([[28.8, 36.8, 3.8], [29.0, 40.2, 3.0], [29.4, 42.8, 1.2]], { per: 10 });
  const jawShape = K.limb([[27.8, 28.2, 4.2], [31.8, 26.8, 3.6], [36.4, 27.4, 2.4], [39.0, 28.4, 1.2]]);

  // ---- Schwanz: kurz, fuchsartig mit heller Spitze ----
  const tailCtrl = [[-18.4, 30.0, 4.2], [-22.6, 28.6, 3.0], [-26.0, 25.0, 3.2], [-27.6, 20.8, 4.8], [-27.4, 17.2, 3.4], [-27.0, 15.0, 1.0]];
  const tail = K.S(K.limb(tailCtrl, { per: 12 }));
  const tailPivot = K.pt([-18.6, 30.0]);

  const toes = (c, x0, n, y = 0.9) => { for (let i = 0; i < n; i++) K.paintBlob(c, x0 + i * 1.4, y, 0.62, 0.78, 0, C.hoof, 0.95); };

  const parts = {
    body: { z: 2, layers: [
      { shapes: K.S(farFore, farForeFoot, farHindThigh, farHind, farHindFoot, earFar), fill: { top: '#6b3a20', bottom: '#a47850' }, stroke: null,
        deco: K.deco((c, bb) => { K.shade(c, bb); toes(c, 17.8, 4); toes(c, -7.2, 3); }, K.rim(K.S(farFore, farForeFoot, farHindThigh, farHind, farHindFoot, earFar), { w: 0.22, color: rimc })) },
      { shapes: trunk, fill: { stops: [[0, C.top], [0.42, C.mid], [0.66, '#e0b98a'], [0.8, C.belly], [1, C.belly]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(80,40,15,.14)' });
          K.dapples(c, bb, C.cream, 22, 0.7, 1.35, { seed: 6, alpha: 0.62, boxD: { x0: -16, y0: 27, w: 30, h: 8 } });
          K.fur(c, bb, '#6a3a1f', 18, 3.2, 0.7, { seed: 4, alpha: 0.35 });
          K.fur(c, bb, '#fff0d2', 12, 2.8, 0.6, { seed: 9, alpha: 0.4, box: { x0: bb.x0, y0: bb.y0, w: bb.w, h: bb.h * 0.35 } });
        }, K.rim(trunk, { w: 0.24, color: rimc })) },
      { shapes: K.S(nearHindThigh, nearHind, nearHindFoot, nearFore, nearForeFoot), fill: { stops: [[0, C.mid], [0.55, '#d9a874'], [0.8, C.sock], [1, C.sock]] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(80,40,15,.18)' });
          K.dapples(c, bb, C.cream, 6, 0.7, 1.3, { seed: 16, alpha: 0.6, boxD: { x0: -17, y0: 20, w: 9, h: 8 } });
          toes(c, 13.4, 4); toes(c, -12.2, 3);
        }, K.rim(K.S(nearHindThigh, nearHind, nearHindFoot, nearFore, nearForeFoot), { w: 0.22, color: rimc })) },
      { shapes: K.S(mane), fill: { top: C.dark, bottom: '#8a4f2a' }, stroke: null,
        deco: K.deco((c, bb) => { K.fur(c, bb, '#3a1c0c', 10, 2.0, 0.5, { seed: 3, alpha: 0.4, ang: Math.PI * 0.6 }); }, K.rim(K.S(mane), { w: 0.2, color: rimc })) },
      { shapes: K.S(head), fill: { stops: [[0, C.top], [0.5, C.mid], [0.82, '#d9b085'], [1, '#e9cfa6']] }, stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(80,40,15,.10)' });
          K.paintBlob(c, 35.0, 29.5, 4.8, 1.7, -0.3, '#f1dcb6', 0.7);                   // hellere Schnauze
          K.fur(c, bb, '#6a3a1f', 8, 2.2, 0.55, { seed: 12, alpha: 0.32, box: { x0: bb.x0, y0: bb.y0 + bb.h * 0.4, w: bb.w * 0.5, h: bb.h * 0.5 } });
          K.paintBlob(c, 28.4, 29.4, 1.7, 1.1, 0, '#f4a090', 0.45);                         // Bäckchen
          K.paintBlob(c, 39.5, 28.8, 1.4, 1.1, -0.3, C.nose, 1);                           // Nase
          K.curve(c, [[39.3, 27.7], [36.0, 27.0], [32.6, 27.3], [30.4, 28.4], [29.2, 29.3]], C.ink, 0.38);
          K.bead(c, 30.8, 33.7, 2.0);
          K.curve(c, [[28.0, 37.0], [30.8, 37.7], [33.2, 36.6]], 'rgba(70,35,18,.45)', 0.38);
        }, K.rim(K.S(head), { w: 0.24, color: rimc })) },
      { shapes: [ear], fill: { top: C.top, bottom: C.mid }, stroke: null,
        deco: K.deco((c) => { K.paintBlob(c, 23.8, 39.8, 1.1, 2.5, 0, C.pink, 0.88); }, K.rim([ear], { w: 0.22, color: rimc })) },
    ] },
    jaw: { z: 0, pivot: K.pt([28.2, 29.2]), layers: [
      { shapes: [jawShape], fill: { top: '#dcb68c', bottom: C.belly }, stroke: null, deco: K.rim([jawShape], { w: 0.22, color: rimc }) },
    ] },
    tail: { z: 1, pivot: tailPivot, layers: [
      { shapes: K.S(tail), fill: { top: '#7d4524', bottom: '#b57e50' }, stroke: null,
        deco: K.deco((c, bb) => {
          K.paintBlob(c, -27.1, 15.4, 3.2, 3.2, 0.1, C.cream, 0.95);                          // helle Spitze
          K.fur(c, bb, '#4f2a14', 8, 2.2, 0.5, { seed: 2, alpha: 0.4, ang: Math.PI * 1.45 });
        }, K.rim(K.S(tail), { w: 0.22, color: rimc })) },
    ] },
  };
  return {
    id: 'hyracotherium', parts,
    anchors: { head: K.pt([28, 32.5]), mouth: K.pt([38.8, 28.0]), eye: K.pt([30.4, 33.5]), back: K.pt([-2, 34]), foot: K.pt([0, 0]) },
    meta: { name: 'Hyracotherium', shoulderHeightM: 0.35, lengthM: 0.7, ranges: { jaw: [0, -0.45], tail: [0, -0.4] } },
  };
}
