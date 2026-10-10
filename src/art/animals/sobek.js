// Sobek: freundlicher Krokodilkopf, Sonnenscheibe zwischen zwei Federn, Anch + Was-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'sobek', name: 'Sobek', heightM: 1.8, head: 'krokodil', crown: 'sobek', ...opts });
}
