// Tutanchamun (1,60 m): junger König, Nemes gestreift Blau/Gold mit Uräus, Goldkragen, Königsschurz, Ohrringe,
// Spazierstock mit Goldbändern in armA (in seinem Grab lagen über 100 Stöcke), armB hängt locker.
// opts.pose: 'walk' (Vorgabe) | 'stand'
import { person, EG } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'tutanchamun', name: 'Tutanchamun', heightM: 1.6, sex: 'm', age: 'jung', pose: opts.pose === 'stand' ? 'stand' : 'walk', build: 0.94,
    head: 'nemes', nemesCol: [EG.gold, EG.lapis], earring: true, garment: 'schurz', royal: true, collar: 'gold', bands: true, sandals: true,
    armA: { u: 0.3, f: 1.3, hand: 'fist' }, holdA: { prop: 'stab', gold: true, len: 0.42 },
    armB: 'rueck',
  });
  s.meta.ranges.armA = [0, 0.2];
  return s;
}
