// Arbeiter (1,65 m): bezahlter Pyramiden-Arbeiter im einfachen Schurz mit Stirnband, nach vorn gebeugt, zieht an einem Seil
// (Seilende in armA zeigt nach vorn, Anker gripA). Gehzyklus über meta.swing (legA/legB gegenphasig).
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'arbeiter', name: 'Arbeiter', heightM: 1.65, sex: 'm', pose: 'pull', build: 1.05,
    head: 'kurz', band: '#f6efe0', garment: 'schurz_kurz',
    armA: { u: 1.25, f: 1.45, hand: 'fist' }, holdA: { prop: 'seil', ang: -0.18, len: opts.ropeLen ?? 0.45 },
    armB: { u: 1.05, f: 1.3, hand: 'fist' },
  });
  s.meta.ranges.armA = [0, -0.25];
  s.meta.ranges.armB = [0, -0.25];
  return s;
}
