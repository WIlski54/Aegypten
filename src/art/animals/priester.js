// Priester (1,70 m): kahlgeschoren, langer Leinenschurz, Leopardenfell (opts.leopard: false = ohne), Räucherarm
// (Weihrauch) in armA.  opts.pose: 'stand' (Vorgabe) | 'walk'
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'priester', name: 'Priester', heightM: 1.7, sex: 'm', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'kahl', garment: 'schurz_lang', leopard: opts.leopard !== false, collar: 'perlen', sandals: true,
    armA: { u: 0.45, f: 1.5, hand: 'fist' }, holdA: 'raeucherarm',
    armB: { u: 0.7, f: 1.9, hand: 'open', hb: 0.2 }, armBFront: false,
  });
  s.meta.ranges.armA = [0, 0.3];
  return s;
}
