// Registry group daily (O3): id -> factory. Alltag, Schrift, Werkzeug, Rosetta-Stein.
import glyphe, { GLYPH_IDS } from './props/eg_glyphs.js';
import rosetta_stein from './props/eg_rosetta.js';
import { steinblock, schlitten, hacke, netz, kupfermeissel, holzschlaegel, messleine } from './props/eg_tools.js';
import { mahlstein, ofen, brotlaib, brotkorb, bierkrug, senet_brett, spielzeug, amphore } from './props/eg_home.js';
import { papyrusrolle, schreibpalette, ostrakon } from './props/eg_script.js';

const glyphs = Object.fromEntries(GLYPH_IDS.map((g) => ['glyphe_' + g, (o) => glyphe({ ...(typeof o === 'object' && o ? o : {}), g })]));

const zz = Object.fromEntries([0,1,2,3,4,5].map((i)=>['zz_brot'+i,()=>brotlaib(i)]).concat([0,1,2].map((i)=>['zz_spiel'+i,()=>spielzeug(i)])));
export default {
  ...zz,
  glyphe: (o) => glyphe(o),
  rosetta_stein: (o) => rosetta_stein(o),
  steinblock: (o) => steinblock(o),
  schlitten: (o) => schlitten(o),
  hacke: (o) => hacke(o),
  netz: (o) => netz(o),
  kupfermeissel: (o) => kupfermeissel(o),
  holzschlaegel: (o) => holzschlaegel(o),
  messleine: (o) => messleine(o),
  papyrusrolle: (o) => papyrusrolle(o),
  schreibpalette: (o) => schreibpalette(o),
  ostrakon: (o) => ostrakon(o),
  mahlstein: (o) => mahlstein(o),
  ofen: (o) => ofen(o),
  brotlaib: (o) => brotlaib(o),
  brotkorb: (o) => brotkorb(o),
  bierkrug: (o) => bierkrug(o),
  senet_brett: (o) => senet_brett(o),
  spielzeug: (o) => spielzeug(o),
  amphore: (o) => amphore(o),
  ...glyphs,
};
