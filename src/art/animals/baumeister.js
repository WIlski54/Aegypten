// Baumeister (1,70 m): Oberaufseher mit Kopftuch (Khat), wadenlangem Schurz und Perlenkette, Messstab in armA,
// aufgerollte Messleine mit Knoten in armB.  opts.pose: 'stand' (Vorgabe) | 'walk'
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'baumeister', name: 'Baumeister', heightM: 1.7, sex: 'm', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'kopftuch', garment: 'schurz_lang', collar: 'perlen', sandals: true,
    armA: { u: 0.25, f: 1.3, hand: 'fist' }, holdA: { prop: 'stab', len: 0.48 },
    armB: { u: -0.3, f: -0.1, hand: 'fist' }, holdB: 'messleine',
  });
  s.meta.ranges.armA = [0, 0.2];
  return s;
}
