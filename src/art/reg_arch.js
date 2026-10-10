// Registry group arch (S2: Bauwerke, Schiffe, Innenräume): id -> factory. Fabriken akzeptieren opts (bzw. das `variant`-Objekt der Seite).
import { lehmhaus } from './props/eg_rooms.js';
import { tempelhalle_wand, werkstatt_wand } from './props/eg_walls.js';
import { obelisk, tempel_pylon, saeule_papyrus, saeule_lotus, mastaba } from './props/eg_arch.js';
import { schaduf, nilometer, grabtreppe, ziegelmauer, hafen_kulisse } from './props/eg_arch2.js';
import { totentempel_hatschepsut, abu_simbel, leuchtturm_pharos, bibliothek_alexandria } from './props/eg_monuments.js';
import { gelehrtenzimmer } from './props/eg_study.js';
import { schilfboot, segelboot_nil } from './props/eg_ships.js';
import { sonnenbarke, segelschiff_griechisch } from './props/eg_ships2.js';

export default {
  lehmhaus: (o) => lehmhaus(o),
  tempelhalle_wand: (o) => tempelhalle_wand(o),
  werkstatt_wand: (o) => werkstatt_wand(o),
  obelisk: (o) => obelisk(o),
  tempel_pylon: (o) => tempel_pylon(o),
  saeule_papyrus: (o) => saeule_papyrus(o),
  saeule_lotus: (o) => saeule_lotus(o),
  saeule_papyrus_einzeln: (o) => saeule_papyrus({ ...(o || {}), n: 1 }),
  saeule_lotus_einzeln: (o) => saeule_lotus({ ...(o || {}), n: 1 }),
  mastaba: (o) => mastaba(o),
  schaduf: (o) => schaduf(o),
  nilometer: (o) => nilometer(o),
  grabtreppe: (o) => grabtreppe(o),
  ziegelmauer: (o) => ziegelmauer(o),
  ziegelmauer_tor: (o) => ziegelmauer({ ...(o || {}), variant: 1 }),     // Komfort-Aliase (Galerie/Seiten)
  ziegelmauer_ruine: (o) => ziegelmauer({ ...(o || {}), variant: 2 }),
  hafen_kulisse: (o) => hafen_kulisse(o),
  totentempel_hatschepsut: (o) => totentempel_hatschepsut(o),
  abu_simbel: (o) => abu_simbel(o),
  leuchtturm_pharos: (o) => leuchtturm_pharos(o),
  bibliothek_alexandria: (o) => bibliothek_alexandria(o),
  gelehrtenzimmer: (o) => gelehrtenzimmer(o),
  schilfboot: (o) => schilfboot(o),
  segelboot_nil: (o) => segelboot_nil(o),
  sonnenbarke: (o) => sonnenbarke(o),
  segelschiff_griechisch: (o) => segelschiff_griechisch(o),
};
