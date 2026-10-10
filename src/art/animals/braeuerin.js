// Brauerin (1,55 m): Frau im Leinenkleid mit Stirnband, hält einen Bierkrug am Hals vor sich.
// ranges.armA: [0, -0.55] = Arm senkt sich nach vorn, der Krug kippt und gießt.
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'braeuerin', name: 'Brauerin', heightM: 1.55, sex: 'w', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'lang', band: '#3bb3a8', garment: 'kleid', hem: 0.15, collar: 'perlen',
    armA: { u: 0.35, f: 1.55, hand: 'fist' }, holdA: { prop: 'krug', ang: Math.PI / 2 },
    armB: 'rueck',
  });
  s.meta.ranges.armA = [0, -0.55];
  return s;
}
