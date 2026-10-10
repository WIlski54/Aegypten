// Registry group O1 (Königs- und Grabschätze, Kronen): id -> factory.
import { weisse_krone, rote_krone, doppelkrone, nemes, blaue_krone, krummstab_wedel } from './props/eg_crowns.js';

export default {
  weisse_krone: (o) => weisse_krone(o),
  rote_krone: (o) => rote_krone(o),
  doppelkrone: (o) => doppelkrone(o),
  nemes: (o) => nemes(o),
  blaue_krone: (o) => blaue_krone(o),
  krummstab_wedel: (o) => krummstab_wedel(o),
};
