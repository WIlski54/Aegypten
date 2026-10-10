// Chepre: Skarabäus statt Kopf (hält die Morgensonne), Anch + Was-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'chepre', name: 'Chepre', heightM: 1.7, head: 'skarabaeus', crown: 'skarab', ...opts });
}
