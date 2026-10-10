// Pharao (1,70 m): Königsschurz mit Goldgürtel und Schurzlatz, breiter Halskragen, Zeremonialbart,
// Krummstab (armA, Unterarm nach vorn, Haken auf Schulterhöhe) und Wedel/Geißel (armB, hängt hinten).
// opts.crown: 'weiss' (Hedjet, Oberägypten) | 'rot' (Deschret, Unterägypten) | 'doppel' (Pschent, Vorgabe) | 'nemes' | 'blau' (Khepresch)
//             | 'keine' (Kappe mit Stirnband – Platz für eine aufgesetzte Krone, Anker 'krone', meta.crownW)
// opts.pose:  'walk' (Schreitschritt, Vorgabe) | 'stand' (Füße fast geschlossen)
import { person } from './_eg_person.js';

export const CROWNS = { weiss: 'krone_weiss', rot: 'krone_rot', doppel: 'krone_doppel', nemes: 'nemes', blau: 'krone_blau', keine: 'kappe' };

export default function make(opts = {}) {
  const crown = CROWNS[opts.crown] ? opts.crown : 'doppel';
  const pose = opts.pose === 'stand' ? 'stand' : 'walk';
  const s = person({
    id: 'pharao', name: 'Pharao', heightM: 1.7, sex: 'm', pose,
    head: CROWNS[crown], beard: 'koenig', garment: 'schurz', royal: true, collar: 'breit', bands: true, sandals: true,
    armA: { u: 0.22, f: 1.42, hand: 'fist' }, holdA: { prop: 'krummstab', ang: Math.PI / 2 - 0.04, len: 0.15 },
    armB: { u: -0.10, f: 0.02, hand: 'fist' }, holdB: { prop: 'wedel', ang: Math.PI / 2 + 0.75, strandDir: -Math.PI / 2 - 0.35 },
  });
  s.meta.crown = crown;
  s.meta.ranges.armA = [0, 0.25];
  s.meta.ranges.armB = [0, -0.25];
  return s;
}
