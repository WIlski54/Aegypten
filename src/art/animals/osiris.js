// Osiris: eingewickelt (Mumienform), grüne Haut, Atef-Krone, Götterbart, Krummstab und Wedel vor der Brust.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({
    id: 'osiris', name: 'Osiris', heightM: 1.7, head: 'mensch', humanHead: 'krone_weiss', crown: 'atef', 
    skin: '#4c9a58', garment: 'mumie', mummyBand: false, collar: 'breit', hold: 'keine', sandals: false, royal: false, bands: false,
    armA: { u: 0.22, f: 2.45, hand: 'fist' }, holdA: { prop: 'krummstab', ang: Math.PI / 2 - 0.25, len: 0.2 },
    armB: { u: 0.62, f: 2.2, hand: 'fist' }, holdB: { prop: 'wedel', ang: 0.9, len: 0.15, strandDir: -0.55 },
    ...opts,
  });
}
