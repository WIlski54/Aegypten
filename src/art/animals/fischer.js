// Fischer (1,65 m): steht (im Papyrusboot der Seite), kurzer Schurz, Stirnband. opts.tool: 'speer' (Vorgabe,
// zweizackiger Fischspeer über dem Kopf; ranges.armA [0, -0.9] = wirft/stößt nach vorn unten) | 'netz' (hält ein Netz).
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const netz = opts.tool === 'netz';
  const s = person({
    id: 'fischer', name: 'Fischer', heightM: 1.65, sex: 'm', pose: 'stand',
    head: 'kurz', band: '#3bb3a8', garment: 'schurz_kurz',
    armA: netz ? { u: 0.6, f: 1.2, hand: 'fist' } : { u: 2.55, f: 2.35, hand: 'fist' }, holdA: netz ? 'netz' : { prop: 'speer', ang: -0.45, t0: -0.32, len: 0.36 },
    armB: netz ? 'rueck' : { u: 0.8, f: 1.2, hand: 'open' },
  });
  s.meta.ranges.armA = [0, -0.9];
  return s;
}
