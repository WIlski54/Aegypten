// Kleopatra VII. (1,60 m): hellenistische Melonenfrisur mit Haarknoten, Diadem (Königsbinde) mit Uräus, Ohrringe,
// langes Gewand (Chiton) mit Mantel; würdevoll, hält eine Schriftrolle (Bibliothek von Alexandria).
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'kleopatra', name: 'Kleopatra VII.', heightM: 1.6, sex: 'w', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'melone', earring: true, garment: 'chiton', mantleCol: '#5a3f8a', collar: 'perlen', sandals: true,
    armA: { u: 0.35, f: 1.55, hand: 'fist' }, holdA: { prop: 'rolle', ang: 1.25 },
    armB: 'rueck',
  });
  s.meta.ranges.armA = [0, 0.3];
  return s;
}
