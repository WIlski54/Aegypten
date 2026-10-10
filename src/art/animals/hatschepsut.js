// Hatschepsut (1,65 m): weiblicher Pharao mit Nemes, Uräus und falschem Königsbart, Königsschurz, Halskragen.
// Hautton ocker (Frau), Krummstab in armA, Wedel hängt in armB.  opts.pose: 'walk' (Vorgabe) | 'stand'
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'hatschepsut', name: 'Hatschepsut', heightM: 1.65, sex: 'w', pose: opts.pose === 'stand' ? 'stand' : 'walk',
    head: 'nemes', beard: 'koenig', garment: 'schurz', royal: true, collar: 'breit', bands: true, sandals: true, earring: true,
    armA: { u: 0.22, f: 1.42, hand: 'fist' }, holdA: { prop: 'krummstab', ang: Math.PI / 2 - 0.04, len: 0.15 },
    armB: { u: -0.10, f: 0.02, hand: 'fist' }, holdB: { prop: 'wedel', ang: Math.PI / 2 + 0.75, strandDir: -Math.PI / 2 - 0.35 },
  });
  s.meta.ranges.armA = [0, 0.25];
  return s;
}
