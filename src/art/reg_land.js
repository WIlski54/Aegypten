// Registry group S1 (Landschaft, Pyramiden, Pflanzen): id -> factory. Owned by art group S1.
import { pyramide_gizeh, pyramide_cheops, pyramide_bau } from './props/eg_land.js';
import { pyramide_schnitt } from './props/eg_schnitt.js';
import { sphinx } from './props/eg_sphinx.js';
import { wuestenduene, nil_wasser, feld_getreide } from './props/eg_terrain.js';
import { stufenpyramide, rampe, steinbruch_wand, felsental_tal } from './props/eg_fels.js';
import { papyrus, lotus, dattelpalme, sykomore, oase } from './props/eg_plants.js';

export default {
  pyramide_gizeh: (o) => pyramide_gizeh(o),
  pyramide_cheops: (o) => pyramide_cheops(o),
  pyramide_bau: (o) => pyramide_bau(o),
  pyramide_schnitt: (o) => pyramide_schnitt(o),
  sphinx: (o) => sphinx(o),
  wuestenduene: (o) => wuestenduene(o),
  nil_wasser: (o) => nil_wasser(o),
  feld_getreide: (o) => feld_getreide(o),
  stufenpyramide: (o) => stufenpyramide(o),
  rampe: (o) => rampe(o),
  steinbruch_wand: (o) => steinbruch_wand(o),
  felsental_tal: (o) => felsental_tal(o),
  papyrus: (o) => papyrus(o),
  lotus: (o) => lotus(o),
  dattelpalme: (o) => dattelpalme(o),
  sykomore: (o) => sykomore(o),
  oase: (o) => oase(o),
};
