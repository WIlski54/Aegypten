// Ra (Sonnengott): Falkenkopf, rote Sonnenscheibe mit Uräus, Anch + Was-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'ra', name: 'Ra', heightM: 1.8, head: 'falke', headCol: '#8a6a3c', crown: 'sonne', ...opts });
}
