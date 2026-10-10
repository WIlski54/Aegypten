// Träger (1,65 m): trägt eine Tragestange auf der Schulter (Teil von body; Anker poleFront/poleBack für den Sarg),
// die nahe Hand hält die Stange. Gehzyklus über meta.swing. opts.poleLen: Stangenlänge in Körpereinheiten (Vorgabe 1.1)
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const s = person({
    id: 'traeger', name: 'Träger', heightM: 1.65, sex: 'm', pose: 'carry', build: 1.05,
    head: 'kurz', band: '#f6efe0', garment: 'schurz_kurz', carry: 'stange', poleLen: opts.poleLen ?? 1.1,
    armA: { u: 0.55, f: 3.42, hand: 'fist' },
    armB: { u: -0.15, f: 0.05, hand: 'open' },
  });
  s.meta.ranges.armA = [0, 0];
  s.meta.ranges.armB = [0, -0.3];
  s.meta.swing.armA = [0, 0];
  return s;
}
