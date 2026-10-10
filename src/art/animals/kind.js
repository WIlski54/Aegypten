// Kind (1,10 m): opts.sex 'm' (Junge mit Jugendlocke, kleiner Schurz, Holzpferdchen auf Rädern) | 'w' (Mädchen mit
// Pferdeschwanz, Kleidchen, Lederball).  Gehpose; armA hält das Spielzeug.
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const w = opts.sex === 'w';
  const s = person({
    id: 'kind', name: w ? 'Mädchen' : 'Junge', heightM: 1.1, sex: w ? 'w' : 'm', age: 'kind', pose: opts.pose === 'stand' ? 'stand' : 'walk',
    head: w ? 'zopf' : 'jugendlocke', band: w ? '#3bb3a8' : undefined, garment: w ? 'kleid' : 'schurz_kurz', hem: 0.16, collar: 'perlen',
    armA: w ? { u: 1.2, f: 2.1, hand: 'fist' } : { u: 0.45, f: 1.35, hand: 'fist' }, holdA: w ? 'ball' : 'pferdchen',
    armB: 'rueck',
  });
  s.meta.ranges.armA = [0, 0.4];
  return s;
}
