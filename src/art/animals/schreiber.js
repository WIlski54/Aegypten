// Schreiber (1,60 m stehend, ca. 1,0 m sitzend): Kurzhaarperücke, Leinenschurz, Ersatz-Binse hinter dem Ohr.
// opts.pose: 'sit' (Vorgabe: Schneidersitz, Papyrus auf dem gespannten Schurz, armA schreibt mit der Binse)
//          | 'stand' (steht, Schreibpalette unter dem fernen Arm, schreibt auf eine Rolle)
// ranges.armA: [0, 0.14] = Binse wandert über das Blatt (Schreiben hin und her).
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const sit = opts.pose !== 'stand';
  const s = person({
    id: 'schreiber', name: 'Schreiber', heightM: 1.6, sex: 'm', pose: sit ? 'sit' : 'stand',
    head: 'kurz', reed: true, garment: 'schurz', collar: 'perlen',
    armA: sit ? { u: -0.3, f: 1.65, hand: 'fist' } : { u: 0.35, f: 1.55, hand: 'fist' }, holdA: { prop: 'binse', ang: sit ? -1.1 : -0.9 },
    armB: sit ? { u: 0.0, f: 1.25, hand: 'fist' } : { u: 0.30, f: 1.45, hand: 'fist' },
    armBFront: true,
    holdB: sit ? { prop: 'papyrus', ang: -0.06, len: 0.21 } : { prop: 'rolle', ang: 0.35 },
  });
  s.meta.ranges.armA = [0, 0.14];
  s.meta.ranges.armB = [0, 0];
  return s;
}
