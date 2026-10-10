// Gruppe T: kleine Helfer für Vögel (Ibis, Reiher, Wasservogel, Falke, Geier). Entwurf in cm (kit(0.01)).
// birdLeg(K, pts, w, toe): dünnes Bein mit Zehen; pts = [[x,y],...] von der Hüfte bis zum Fußgelenk (y > 0), Fuß steht bei y = 0.
import { limb } from '../dsl.js';

export function birdLeg(K, pts, w = 2.2, toe = 7, { spread = 1, web = false } = {}) {
  const n = pts.length, ank = pts[n - 1];
  const leg = K.limb(pts.map(([x, y], i) => [x, y, i === 0 ? w * 1.25 : w]), { per: 8 });
  const t = (len, dy) => K.limb([[ank[0], 1.8, w * 0.95], [ank[0] + len * 0.55, 1.2 + dy * 0.4, w * 0.75], [ank[0] + len, 0.9 + dy, w * 0.5]], { per: 5 });
  const out = [leg, t(toe, 0), t(toe * 0.85 * spread, 0.5), K.limb([[ank[0], 1.8, w * 0.9], [ank[0] - toe * 0.4, 1.0, w * 0.5]], { per: 4 })];
  if (web) out.push(K.poly([[ank[0], 1.2], [ank[0] + toe, 1.0], [ank[0] + toe * 0.8, 3.2], [ank[0] + 1, 3]], 1));
  return out;
}

// a bunch of feather strands (tapered limbs) from points; used for tail plumes and wing tips. ends: [[x0,y0,x1,y1,w]]
export function plumes(K, list, bend = 0.12) {
  return list.map(([x0, y0, x1, y1, w]) => {
    const mx = (x0 + x1) / 2 + (y1 - y0) * bend, my = (y0 + y1) / 2 - (x1 - x0) * bend;
    return K.limb([[x0, y0, w], [mx, my, w * 0.9], [x1, y1, 0.3]], { per: 8 });
  });
}
