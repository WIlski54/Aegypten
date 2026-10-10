// Hathor-Kuh (Hausrind, Göttin der Liebe, Musik und Mutterschaft): ~1,5 m hoch (mit Sonnenscheibe 1,65 m), sanfter Blick,
// Leier-Hörner mit goldener Sonnenscheibe (Karneol-Ring, Uräus) dazwischen. Gleicher Baukasten wie der Ochse (ochse.js, opts.kind = 'kuh').
// Teile: body (Rumpf, Euter), head (Hals + Kopf + Hörner + Scheibe + Ohren, Pivot Schulter; negativ = Kopf senkt sich),
//        tail (Pivot Kruppe), legA (fernes Hinterbein), legB (nahes Hinterbein), armA (nahes Vorderbein), armB (fernes). Optionen: opts.coat 'rot' (Standard) | 'gescheckt' | 'schwarz'.
import ochse from './ochse.js';

export default function make(opts = {}) {
  return ochse({ coat: 'rot', ...opts, kind: 'kuh', yoke: false });
}
