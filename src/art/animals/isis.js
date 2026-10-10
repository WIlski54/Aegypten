// Isis: Thronzeichen auf dem Kopf, rotes Trägerkleid, Anch + Papyrus-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'isis', name: 'Isis', heightM: 1.68, sex: 'w', head: 'mensch', crown: 'thron', band: '#e0b040', garmentCol: '#c0432e', hem: 0.06, sash: '#e0b040', ...opts });
}
