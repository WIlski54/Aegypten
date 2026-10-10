// Registry group daily (O3): id -> factory. Alltag, Schrift, Werkzeug, Rosetta-Stein.
import glyphe, { GLYPH_IDS } from './props/eg_glyphs.js';

const glyphs = Object.fromEntries(GLYPH_IDS.map((g) => ['glyphe_' + g, (o) => glyphe({ ...(typeof o === 'object' && o ? o : {}), g })]));

export default {
  glyphe: (o) => glyphe(o),
  ...glyphs,
};
