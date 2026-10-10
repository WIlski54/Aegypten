// Jean-François Champollion (1,70 m) um 1822: dunkle Locken mit Koteletten, dunkler Gehrock, Weste, hoher weißer
// Kragen mit Halstuch, helle Hose; Federkiel in armA (erhoben), Notizblatt in armB.  opts.pose: 'stand' | 'walk'
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'champollion', name: 'Jean-François Champollion', heightM: 1.7, sex: 'm', style: 'eu', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'locken1822', garment: 'gehrock1822',
    armA: { u: 0.6, f: 2.3, hand: 'fist' }, holdA: { prop: 'feder', ang: 1.2 },
    armB: { u: 0.1, f: 0.9, hand: 'fist' }, holdB: { prop: 'blatt', ang: 0.3 },
  });
  s.meta.ranges.armA = [0, 0.3];
  return s;
}
