// Registry group T (Tiere): id -> factory. Das versteckte Käferchen jeder Seite ist hier schon fertig (skarab1..9).
import skarabaeus from './animals/skarabaeus.js';
import krokodil from './animals/krokodil.js';
import ibis from './animals/ibis.js';
import reiher from './animals/reiher.js';
import fisch from './animals/fisch.js';
import ochse from './animals/ochse.js';
import esel from './animals/esel.js';
import pferd from './animals/pferd.js';
import katze from './animals/katze.js';
import falke from './animals/falke.js';
import kobra from './animals/kobra.js';
import nilpferd from './animals/nilpferd.js';
const sk = (tone) => (o = {}) => skarabaeus({ tone, ...o });
export default {
  skarabaeus,
  kobra,
  falke,
  katze,
  katze_walk: (o = {}) => katze({ ...o, pose: 'walk' }),
  katze_ring: (o = {}) => katze({ ...o, ring: true }),
  pferd,
  esel,
  ochse,
  ochse_joch: (o = {}) => ochse({ ...o, yoke: true }),
  fisch,
  fisch_tilapia: (o = {}) => fisch({ ...o, kind: 'tilapia' }),
  reiher,
  ibis,
  krokodil,
  nilpferd,
  skarab1: sk('blue'), skarab2: sk('black'), skarab3: sk('blue'), skarab4: sk('black'), skarab5: sk('blue'),
  skarab6: sk('black'), skarab7: sk('blue'), skarab8: sk('black'), skarab9: sk('blue'),
};
