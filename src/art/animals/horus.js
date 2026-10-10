// Horus: Falkenkopf, Doppelkrone (Pschent), Anch + Was-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'horus', name: 'Horus', heightM: 1.75, head: 'falke', headCol: '#4a4540', crown: 'doppel', ...opts });
}
