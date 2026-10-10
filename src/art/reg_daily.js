// Registry group daily (O3): id -> factory. Alltag, Schrift, Werkzeug, Rosetta-Stein.
import glyphe, { GLYPH_IDS } from './props/eg_glyphs.js';
import rosetta_stein from './props/eg_rosetta.js';
import { steinblock, schlitten } from './props/eg_tools.js';
import { papyrusrolle, schreibpalette, ostrakon } from './props/eg_script.js';

const glyphs = Object.fromEntries(GLYPH_IDS.map((g) => ['glyphe_' + g, (o) => glyphe({ ...(typeof o === 'object' && o ? o : {}), g })]));

export default {
  glyphe: (o) => glyphe(o),
  rosetta_stein: (o) => rosetta_stein(o),
  steinblock: (o) => steinblock(o),
  schlitten: (o) => schlitten(o),
  papyrusrolle: (o) => papyrusrolle(o),
  schreibpalette: (o) => schreibpalette(o),
  ostrakon: (o) => ostrakon(o),
  ...glyphs,
};
