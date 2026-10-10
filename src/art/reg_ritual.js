// Registry group ritual (O2: Totengericht und Mumifizierung): id -> factory.
import { waage, herz, feder_maat, tor_unterwelt, kanope } from './props/eg_ritual.js';
import { natron_haufen, natron_schale } from './props/eg_natron.js';
import { mumie_bahre, leinenbahn, harzkrug } from './props/eg_mumie.js';
import { ankh, djed, udjat, amulett_herzskarabaeus } from './props/eg_amulett.js';

export default {
  waage: (o) => waage(o),
  herz: (o) => herz(o),
  feder_maat: (o) => feder_maat(o),
  tor_unterwelt: (o) => tor_unterwelt(o),
  kanope_mensch: (o) => kanope('mensch', o),
  kanope_pavian: (o) => kanope('pavian', o),
  kanope_schakal: (o) => kanope('schakal', o),
  kanope_falke: (o) => kanope('falke', o),
  natron_haufen: (o) => natron_haufen(o),
  natron_schale: (o) => natron_schale(o),
  mumie_bahre: (o) => mumie_bahre(o),
  leinenbahn: (o) => leinenbahn(o),
  harzkrug: (o) => harzkrug(o),
  ankh: (o) => ankh(o),
  djed: (o) => djed(o),
  udjat: (o) => udjat(o),
  amulett_herzskarabaeus: (o) => amulett_herzskarabaeus(o),
};
