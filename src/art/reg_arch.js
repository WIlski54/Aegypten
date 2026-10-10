// Registry group arch (S2: Bauwerke, Schiffe, Innenräume): id -> factory. Fabriken akzeptieren opts (bzw. das `variant`-Objekt der Seite).
import { lehmhaus } from './props/eg_rooms.js';
import { tempelhalle_wand, werkstatt_wand } from './props/eg_walls.js';

export default {
  lehmhaus: (o) => lehmhaus(o),
  tempelhalle_wand: (o) => tempelhalle_wand(o),
  werkstatt_wand: (o) => werkstatt_wand(o),
};
