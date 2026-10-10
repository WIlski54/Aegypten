// Howard Carter (1,75 m) im Jahr 1922: Homburg-Hut, Schnurrbart, dreiteiliger Anzug mit Fliege, Pinsel in armA.
// Profilschultern (europäisch). opts.pose: 'stand' (Vorgabe) | 'walk'
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'carter', name: 'Howard Carter', heightM: 1.75, sex: 'm', style: 'eu', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'hut1922', beard: 'schnurr', garment: 'anzug1922', garmentCol: '#8a7a62',
    armA: { u: 0.5, f: 1.75, hand: 'fist' }, holdA: { prop: 'pinsel', ang: 0.5 },
    armB: { u: -0.05, f: 0.15, hand: 'open' },
  });
  s.meta.ranges.armA = [0, 0.35];
  return s;
}
