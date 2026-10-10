// Registry group arch (S2: Bauwerke, Schiffe, Innenräume): id -> factory. Fabriken akzeptieren opts (bzw. das `variant`-Objekt der Seite).
import { lehmhaus } from './props/eg_rooms.js';
import { tempelhalle_wand, werkstatt_wand } from './props/eg_walls.js';
import { obelisk, tempel_pylon, saeule_papyrus, saeule_lotus, mastaba } from './props/eg_arch.js';
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
  mastaba: (o) => mastaba(o),
  schilfboot: (o) => schilfboot(o),
  segelboot_nil: (o) => segelboot_nil(o),
  sonnenbarke: (o) => sonnenbarke(o),
  segelschiff_griechisch: (o) => segelschiff_griechisch(o),
};
