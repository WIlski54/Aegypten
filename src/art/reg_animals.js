// Registry group T (Tiere): id -> factory. Das versteckte Käferchen jeder Seite ist hier schon fertig (skarab1..9).
import skarabaeus from './animals/skarabaeus.js';
const sk = (tone) => (o = {}) => skarabaeus({ tone, ...o });
export default {
  skarabaeus,
  skarab1: sk('blue'), skarab2: sk('black'), skarab3: sk('blue'), skarab4: sk('black'), skarab5: sk('blue'),
  skarab6: sk('black'), skarab7: sk('blue'), skarab8: sk('black'), skarab9: sk('blue'),
};
