// Nut (Himmelsgöttin): langer, flacher Bogen über der Bühne, 11 m lang (Kulissenband), dunkelblauer Körper mit goldenen Sternen.
// Sie steht auf Händen (rechts) und Füßen (links) und wölbt sich über die Erde; der Kopf schaut nach +x, dem Osten, wo die Sonne aufgeht.
// Teil: body (alles, ein Stück). Optionen: opts.stars (Anzahl der Sterne, Vorgabe 46). Entwurf in cm; Boden y = 0.
import { kit } from './_t_kit.js';
import { mulberry32 } from '../../engine/util.js';

export default function make(opts = {}) {
  const K = kit(0.01);
  const C = { top: '#1f4a90', mid: '#16377a', low: '#0d2352', gold: '#e0b040', goldL: '#fff0b3', goldD: '#8a5f1c', ink: 'rgba(8,16,40,.95)', turq: '#3bb3a8', carn: '#c0432e' };

  // ---- Körperbogen: Rumpf in der Mitte, Beine links, Arme rechts bis zum Boden ----
  const spine = K.limb([[84, 10, 36], [112, 110, 54], [182, 214, 80], [300, 300, 102], [450, 338, 112], [600, 344, 114], [750, 318, 106], [878, 262, 88], [962, 196, 58], [1024, 106, 40], [1050, 28, 28], [1052, 10, 24]], { per: 14 });
  const feet = K.S(K.blob(100, 6, 44, 8, 0.05), K.blob(1062, 7, 22, 8, 0));
  const torso = spine, legs = feet, armF = [];
  // Kopf nach vorn (Osten), leicht gesenkt: Hals vom Rumpfende nach rechts-oben
  const neck = K.limb([[870, 290, 80], [920, 322, 60], [962, 346, 50]], { per: 8 });
  const H = K.place(982, 362, -0.12, 1.4);
  const face = H.poly([[-34, 36], [-24, 52], [4, 58], [30, 50], [42, 34], [47, 14], [56, 2], [49, -4], [51, -16], [46, -26], [40, -36], [22, -46], [-6, -46], [-26, -30], [-36, -4]], 2);
  const wigB = H.poly([[-14, 56], [-48, 50], [-66, 18], [-74, -30], [-82, -92], [-52, -104], [-38, -60], [-22, -36], [8, -34], [6, -90], [34, -92], [30, -34], [12, 6], [8, 42]], 1.5);
  const stars = [];
  const r = mulberry32(opts.seed ?? 11), n = opts.stars ?? 56;
  // Sterne gleichmäßig entlang der Mittellinie des Bogens (Beine – Rumpf – Arme)
  const mid = [[80, 14, 30], [118, 120, 44], [190, 220, 60], [270, 290, 80], [380, 328, 90], [560, 336, 96], [740, 308, 90], [880, 262, 66], [960, 200, 40], [1022, 110, 30], [1050, 20, 22]];
  const seg = []; let tot = 0;
  for (let i = 1; i < mid.length; i++) { const l = Math.hypot(mid[i][0] - mid[i - 1][0], mid[i][1] - mid[i - 1][1]); seg.push(l); tot += l; }
  for (let i = 0; i < n; i++) {
    let d = ((i + r() * 0.8) / n) * tot, k = 0;
    while (k < seg.length - 1 && d > seg[k]) { d -= seg[k]; k++; }
    const t = d / seg[k], a = mid[k], b = mid[k + 1];
    const w = (a[2] + (b[2] - a[2]) * t) * 0.62, nx = -(b[1] - a[1]) / seg[k], ny = (b[0] - a[0]) / seg[k], o = (r() - 0.5) * w;
    stars.push([a[0] + (b[0] - a[0]) * t + nx * o, Math.max(12, a[1] + (b[1] - a[1]) * t + ny * o), 5 + r() * 6, r() * 1.2]);
  }
  const star = (c, x, y, R, rot, col) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = rot + (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? R * 0.42 : R; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    K.paintPoly(c, pts, col, 1);
  };

  const skyShapes = K.S(spine, feet, neck);
  const layers = [
    { shapes: [wigB], fill: { top: '#1c1816', bottom: '#2a2420' }, stroke: null,
      deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(0,0,0,.3)', light: 'rgba(255,255,255,.1)' }); for (const y of [-80, -94]) K.curve(c, [[-76, y], [-40, y - 8]], C.gold, 1.4); }, K.rim([wigB], { w: 0.22, color: C.ink })) },
    { shapes: skyShapes, fill: { stops: [[0, C.top], [0.55, C.mid], [1, C.low]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(0,0,20,.25)', light: 'rgba(120,170,255,.2)' });
        for (const [x, y, R, rot] of stars) { star(c, x, y, R * 1.15, rot, C.gold); K.paintBlob(c, x, y, R * 0.28, R * 0.28, 0, C.goldL, 0.9); }
        for (let i = 0; i < 30; i++) K.paintBlob(c, 100 + r() * 950, 20 + r() * 340, 1.6, 1.6, 0, 'rgba(255,248,220,.75)', 1);
      }, K.rim(skyShapes, { w: 0.3, color: C.ink })) },
    { shapes: [face], fill: { top: '#2a58a8', bottom: '#183a80' }, stroke: null,
      deco: H.d((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(0,0,20,.2)', light: 'rgba(150,190,255,.2)' });
        // Auge im Wandmalerei-Stil
        K.paintPoly(c, [[33, 14], [24, 22], [12, 24], [2, 19], [-2, 14], [8, 8], [22, 8]], '#fbf7ec', 1);
        K.paintBlob(c, 20, 15, 4.4, 4.4, 0, '#14100c', 1);
        K.curve(c, [[34, 14], [24, 24], [12, 26], [2, 20], [-18, 12]], C.gold, 2.2);
        K.curve(c, [[2, 34], [18, 38], [34, 33]], C.gold, 1.8);
        K.curve(c, [[52, -14], [47, -20], [38, -17]], '#06102a', 1.4);
        K.paintBlob(c, 38, -6, 7, 4, 0, '#e07a5a', 0.3);
      }, K.rim([face], { w: 0.2, color: C.ink })) },
  ];
  // Stirnband
  const band = H.limb([[-50, 38, 9], [-10, 50, 9], [30, 44, 8]], { per: 8 });
  layers.push({ shapes: [band], fill: C.gold, stroke: 'rgba(80,50,10,.6)' });

  return {
    id: 'nut',
    parts: { body: { z: 1, layers } },
    anchors: { head: K.pt([978, 344]), mouth: K.pt([1030, 340]), eye: K.pt([998, 360]), back: K.pt([560, 400]), foot: K.pt([84, 0]), hand: K.pt([1056, 8]), belly: K.pt([560, 290]) },
    meta: { name: 'Nut (Himmelsgöttin)', lengthM: 11, heightM: 4.0, ranges: {}, swing: {} },
  };
}
