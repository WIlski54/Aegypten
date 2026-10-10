// Registry group O1 (Königs- und Grabschätze, Kronen): id -> factory.
import { weisse_krone, rote_krone, doppelkrone, nemes, blaue_krone, krummstab_wedel } from './props/eg_crowns.js';
import { tutmaske } from './props/eg_mask.js';
import { thron_tut } from './props/eg_throne.js';
import { schrein_gold } from './props/eg_shrine.js';
import { sarkophag_gold, sarkophag_stein } from './props/eg_coffin.js';
import { streitwagen } from './props/eg_chariot.js';
import { dolch_eisen, truhe, fackel, ushabti, kartusche } from './props/eg_gear.js';
import { narmer_palette } from './props/eg_narmer.js';

export default {
  weisse_krone: (o) => weisse_krone(o),
  rote_krone: (o) => rote_krone(o),
  doppelkrone: (o) => doppelkrone(o),
  nemes: (o) => nemes(o),
  blaue_krone: (o) => blaue_krone(o),
  krummstab_wedel: (o) => krummstab_wedel(o),
  tutmaske: (o) => tutmaske(o),
  thron_tut: (o) => thron_tut(o),
  schrein_gold: (o) => schrein_gold(o),
  sarkophag_gold: (o) => sarkophag_gold(o),
  sarkophag_stein: (o) => sarkophag_stein(o),
  streitwagen: (o) => streitwagen(o),
  dolch_eisen: (o) => dolch_eisen(o),
  truhe: (o) => truhe(o),
  fackel: (o) => fackel(o),
  ushabti: (o) => ushabti(o),
  kartusche: (o) => kartusche(o),
  narmer_palette: (o) => narmer_palette(o),
};
