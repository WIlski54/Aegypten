// Gelehrter am Schreibtisch (sitzend, ca. 1,1 m hoch inkl. Stuhl): wie Champollion um 1822, sitzt auf einem Stuhl
// (Teil 'stuhl'), Lupe in armA (ranges.armA [0, 0.25] = Lupe heben), Notizblatt in armB.
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'gelehrter_sitzend', name: 'Gelehrter (Champollion)', heightM: 1.45, sex: 'm', style: 'eu', pose: 'chair',
    head: 'locken1822', garment: 'gehrock1822',
    armA: { u: 0.85, f: 1.6, hand: 'fist' }, holdA: { prop: 'lupe', ang: 0.35 },
    armB: { u: 0.5, f: 1.3, hand: 'fist' }, holdB: { prop: 'blatt', ang: 0.1 },
  });
  s.meta.ranges.armA = [0, 0.25];
  s.meta.heightM = 1.1;
  return s;
}
