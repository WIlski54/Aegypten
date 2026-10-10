// Skarabäus (Pillendreher), ~3 cm. Das "versteckte" Tier jeder Seite: kugeliger Rücken mit Flügeldecken-Linie, gezackter Kopfschild.
// Teile: body (alles), legA/legB (Pivot an der Hüfte, Schwingen für ein kleines Zappeln).
import { blob, limb, poly } from '../dsl.js';
import { volume, line, dot } from '../paint.js';

export default function make(opts = {}) {
  const tone = opts.tone || 'blue'; // 'blue' (Lapis/Türkis) oder 'black'
  const C = tone === 'black'
    ? { top: '#2c3b44', bottom: '#0f1a22', hi: 'rgba(120,200,210,.55)', leg: '#141c22' }
    : { top: '#2f7fa8', bottom: '#14385e', hi: 'rgba(160,240,225,.65)', leg: '#10304e' };
  const shell = blob(0, 0.46, 0.50, 0.44, 0, 48);
  const prothorax = blob(0.40, 0.42, 0.28, 0.33, 0, 36);
  const head = poly([[0.58, 0.34], [0.72, 0.36], [0.82, 0.32], [0.84, 0.26], [0.78, 0.2], [0.64, 0.18], [0.56, 0.22]], 1);
  // gezackter Kopfschild (Clypeus): vier kleine Zähne vorn
  const horns = [0.215, 0.255, 0.295, 0.335].map((y, i) => poly([[0.82, y - 0.022], [0.90 - (i % 2) * 0.012, y], [0.82, y + 0.022]]));
  const body = {
    z: 1,
    layers: [
      { shapes: [shell, prothorax], fill: { top: C.top, bottom: C.bottom },
        deco(c, bb) {
          line(c, [[-0.02, 0.88], [-0.04, 0.46], [-0.03, 0.06]], 'rgba(8,16,26,.8)', 0.03, { alpha: 1 });
          line(c, [[0.30, 0.74], [0.26, 0.45], [0.30, 0.16]], 'rgba(8,16,26,.6)', 0.022, { alpha: 1 });
          line(c, [[-0.30, 0.78], [-0.1, 0.84], [0.18, 0.84]], C.hi, 0.04, { alpha: 1 });
          volume(c, bb, { dark: 'rgba(0,10,30,.35)', light: 'rgba(200,255,245,.25)' });
        } },
      { shapes: [head].concat(horns), fill: C.leg, stroke: 'rgba(255,240,200,.5)',
        deco(c) { dot(c, 0.7, 0.3, 0.03, '#f5e6b0', 1); dot(c, 0.71, 0.3, 0.013, '#0a0f14', 1); } },
    ],
  };
  const leg = (x, far, ph, reach) => ({
    z: far ? 0 : 2, pivot: [x, 0.24],
    layers: [{ shapes: [limb([[x, 0.26, 0.09], [x + 0.12 * ph, 0.12, 0.06], [x + reach * ph, -0.0, 0.045]], { per: 6 }), blob(x + reach * ph, 0.0, 0.06, 0.028, 0.2, 10)], fill: C.leg }],
  });
  return {
    id: 'skarabaeus',
    parts: { body, legA: leg(-0.2, true, -1, 0.2), legB: leg(0.3, false, 1, 0.22), legC: leg(0.06, false, 1, 0.1) },
    anchors: { head: [0.78, 0.28], back: [0, 0.9], foot: [0, 0] },
    meta: { name: 'Skarabäus', lengthM: 0.03, ranges: { legA: [0, 0.5], legB: [0, -0.5], legC: [0, 0.4] }, swing: { legA: [-0.4, 0.4], legB: [-0.4, 0.4], legC: [-0.4, 0.4] } },
  };
}
