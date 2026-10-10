// Bastet: Katzenkopf, grünes Trägerkleid, Anch + Papyrus-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'bastet', name: 'Bastet', heightM: 1.65, sex: 'w', head: 'katze', garmentCol: '#5b9a4b', hem: 0.06, sash: '#e0b040', ...opts });
}
