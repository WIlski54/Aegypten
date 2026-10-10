// Wesir (1,70 m): oberster Beamter, langes Leinengewand mit Halsbändern, schulterlange Perücke, Goldkette,
// Amtsstab in armA, Papyrusrolle in armB.  opts.pose: 'walk' (Vorgabe) | 'stand'
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'wesir', name: 'Wesir', heightM: 1.7, sex: 'm', pose: opts.pose === 'stand' ? 'stand' : 'walk',
    head: 'bob', garment: 'gewand', collar: 'gold', sandals: true,
    armA: { u: 0.28, f: 1.3, hand: 'fist' }, holdA: { prop: 'stab', len: 0.5 },
    armB: { u: -0.08, f: 0.05, hand: 'fist' }, holdB: { prop: 'rolle', ang: -1.2 },
  });
  s.meta.ranges.armA = [0, 0.2];
  return s;
}
