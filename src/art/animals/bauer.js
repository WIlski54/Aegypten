// Bauer (1,65 m): einfacher Schurz, Hacke aus Holz in beiden Händen. ranges.armA/armB: [0, 0.7] = Hacke heben
// (zurück auf 0 = schlagen). opts.hut: true = Strohhut.
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'bauer', name: 'Bauer', heightM: 1.65, sex: 'm', pose: 'walk', lean: 0.18,
    head: opts.hut ? 'strohhut' : 'kurz', garment: 'schurz_kurz',
    armA: { u: 0.85, f: 1.05, hand: 'fist' }, holdA: { prop: 'hacke', ang: -1.05 },
    armB: { u: 0.7, f: 1.0, hand: 'fist' },
  });
  s.meta.ranges.armA = [0, 0.7];
  s.meta.ranges.armB = [0, 0.7];
  return s;
}
