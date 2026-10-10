// Einbalsamierer (1,75 m): Priester mit Anubis-Schakalmaske (nur Maske, Mensch darunter), langer Leinenschurz,
// Halskragen; armA hält ein Libationsgefäß (gießt/streut: ranges.armA [0, -0.5]). opts.tool: 'hes' (Vorgabe) | 'schale' (Natronschale)
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const schale = opts.tool === 'schale';
  const s = person({
    id: 'einbalsamierer', name: 'Einbalsamierer', heightM: 1.75, sex: 'm', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'anubis', garment: 'schurz_lang', collar: 'breit', bands: true,
    armA: { u: 0.35, f: 1.45, hand: 'fist' }, holdA: schale ? 'schale' : { prop: 'hes', ang: Math.PI / 2 },
    armB: 'rueck',
  });
  s.meta.ranges.armA = [0, -0.5];
  return s;
}
