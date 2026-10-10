// Thot: Ibiskopf mit Mondscheibe in der Sichel, Schreibpalette (ferne Hand) und Anch.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({
    id: 'thot', name: 'Thot', heightM: 1.75, head: 'ibis', crown: 'mond',
    armB: { u: 0.30, f: 1.40, hand: 'fist' }, holdB: { prop: 'g_palette', ang: 0.1 },
    ...opts,
  });
}
