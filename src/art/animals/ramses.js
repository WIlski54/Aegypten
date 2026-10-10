// Ramses II. (1,75 m): Blaue Krone (Khepresch) mit Uräus und Bändern, Königsbart, breiter Kragen, Königsschurz,
// Standpose mit langem Zepter (Papyrusdolde, Gold/Lapis) in armA.  opts.pose: 'stand' (Vorgabe) | 'walk'
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'ramses', name: 'Ramses II.', heightM: 1.75, sex: 'm', pose: opts.pose === 'walk' ? 'walk' : 'stand', build: 1.06,
    head: 'krone_blau', beard: 'koenig', garment: 'schurz', royal: true, collar: 'breit', bands: true, sandals: true,
    armA: { u: 0.25, f: 1.32, hand: 'fist' }, holdA: { prop: 'zepter', len: 0.5 },
    armB: { u: -0.06, f: 0.0, hand: 'fist' },
  });
  s.meta.ranges.armA = [0, 0.2];
  return s;
}
