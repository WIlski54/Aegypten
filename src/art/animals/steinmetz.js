// Steinmetz (1,65 m): kniet (Vorgabe) oder steht (opts.pose 'stand'); Holzschlägel in armA (erhoben),
// Kupfermeißel in armB vorn unten. ranges.armA: [0, -0.9] = Schlag nach unten.
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const kneel = opts.pose !== 'stand';
  const s = person({
    id: 'steinmetz', name: 'Steinmetz', heightM: 1.65, sex: 'm', pose: kneel ? 'kneel' : 'stand', build: 1.05,
    head: 'kurz', garment: 'schurz_kurz',
    armA: { u: 1.9, f: 2.85, hand: 'fist' }, holdA: { prop: 'schlaegel', ang: Math.PI / 2 + 0.55 },
    armB: kneel ? { u: 0.75, f: 1.2, hand: 'fist' } : { u: 0.55, f: 1.0, hand: 'fist' }, armBFront: true, holdB: { prop: 'meissel', ang: -0.55 },
  });
  s.meta.ranges.armA = [0, -0.9];
  s.meta.ranges.armB = [0, 0];
  return s;
}
