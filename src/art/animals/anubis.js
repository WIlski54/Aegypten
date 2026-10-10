// Anubis: schwarzer Schakalkopf mit hohen Ohren, Goldkragen, Anch + Was-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'anubis', name: 'Anubis', heightM: 1.8, head: 'schakal', ...opts });
}
