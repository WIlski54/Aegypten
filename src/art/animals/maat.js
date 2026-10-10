// Ma'at: Straußenfeder im Stirnband, Trägerkleid, Anch + Papyrus-Zepter.
import { god } from './_eg_god_kit.js';
export default function make(opts = {}) {
  return god({ id: 'maat', name: "Ma'at", heightM: 1.65, sex: 'w', head: 'mensch', crown: 'feder', band: '#2a5aa0', garmentCol: '#f6efe0', hem: 0.06, sash: '#2a5aa0', ...opts });
}
