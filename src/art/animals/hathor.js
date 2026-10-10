// Hathor: Kuhohren, Kuhhörner mit roter Sonnenscheibe, türkises Trägerkleid, Anch + Papyrus-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'hathor', name: 'Hathor', heightM: 1.68, sex: 'w', head: 'mensch', crown: 'hathor', band: '#c0432e', garmentCol: '#3bb3a8', hem: 0.06, sash: '#e0b040', ...opts });
}
