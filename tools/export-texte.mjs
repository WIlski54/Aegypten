// Exportiert alle Texte des Buchs als texte.json (Grundlage für Arbeitsblätter). usage: node tools/export-texte.mjs [out.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES_DE, CARDS_DE } from '../src/data/pages.de.js';
import { ANIMALS_DE } from '../src/data/animals.de.js';
import { SCENES } from '../src/ui/zeitszenen.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Zuordnung Karte → Station aus den Abschnittskommentaren ("// ---- ... Station N ...") in den Kartendateien
const station = {};
for (const f of ['animals.de.js', 'cards_a.de.js', 'cards_b.de.js', 'cards_c.de.js']) {
  let cur = null;
  for (const line of fs.readFileSync(path.join(root, 'src/data', f), 'utf8').split('\n')) {
    const m = line.match(/^\s*\/\/ -{5,} Station (\d)/); if (m) { cur = +m[1]; continue; }
    const k = line.match(/^  ([a-z_0-9]+): [\{s]/); if (k && cur !== null) station[k[1]] = cur;
  }
}
for (const k of Object.keys(ANIMALS_DE)) if (/^skarab\d$/.test(k)) station[k] = +k.slice(-1) - 1;
for (const k of Object.keys(CARDS_DE)) station[k] = { zeitrad: 0, album: 8, zeitluecke: 8 }[k] ?? null;

const kartentyp = (id, c) => (CARDS_DE[id] ? 'info' : c.hidden ? 'versteckter Sonnenkäfer' : 'karte');
const card = (id, c) => ({
  id, typ: kartentyp(id, c), station: station[id] ?? null, name: c.name,
  zusatzname: c.sci || null, aussprache: c.say || null, bedeutung: c.meaning || null,
  zeit: c.when || null, epoche: c.period || null,
  groesse: c.size || null, aufgabeOderNahrung: c.diet || null, ort: c.where || null,
  wow: c.wow || null, text: c.text || null, hinweisUnsicherheit: c.note || null,
  stichworte: c.tags || [], fragenFuerArbeitsblatt: c.fragen || [],
});
const cards = [...Object.entries(ANIMALS_DE), ...Object.entries(CARDS_DE)].map(([id, c]) => card(id, c));
const pages = PAGES_DE.map((p, i) => ({
  station: i, id: p.id, kapitel: p.name, epoche: p.era, jahre: p.years, titel: p.title, kicker: p.kicker || null,
  kartentext: p.card, erzaehltext: p.narr, bedienhinweis: p.hint,
  karten: cards.filter((c) => c.station === i).map((c) => c.id),
}));
const out = {
  titel: 'Das große Ägypten-Popup-Buch – alle Texte',
  zielgruppe: 'Klasse 5/6 (einfache, kurze Sätze; Du-Ansprache)',
  hinweis: 'Jahreszahlen sind gerundet („ca.“) und entsprechen dem Stand, der in facts.md belegt ist. Die Erzähltexte werden im Buch von einer Neuro-TTS-Stimme gesprochen.',
  seiten: pages, karten: cards,
  zeitfenster: SCENES.map((s) => ({ id: s.id, zeit: s.when, epoche: s.era, titel: s.title, text: s.cap, merksatz: s.fact, jahrVChr: s.at })),
  arbeitsblattIdeen: [
    { thema: 'Zeitstrahl', aufgabe: 'Ordne Epochen, Bauwerke und Herrscher auf einem Zeitstrahl von 3100 bis 30 v. Chr. (Karten: Feld zeit).' },
    { thema: 'Pyramiden-Rechnung', aufgabe: 'Die Cheops-Pyramide hat etwa 2,3 Millionen Blöcke und wurde in rund 26 Jahren gebaut. Wie viele Blöcke sind das pro Tag? Pro Stunde bei 10 Stunden Arbeit?' },
    { thema: 'Natron und Wasser (Chemie)', aufgabe: 'Schulversuch „Apfel mumifizieren“ (Karte mumifizieren_versuch): Gewichtsverlust täglich messen, Diagramm zeichnen, Ergebnis erklären (Salz zieht Wasser an; ohne Wasser keine Bakterien).' },
    { thema: 'Hieroglyphen', aufgabe: 'Schreibe deinen Namen mit den Einkonsonantenzeichen (Karte hieroglyphen). Vokale lässt man weg.' },
    { thema: 'Schlitten und Sand (Physik)', aufgabe: 'Warum braucht man weniger Kraft, wenn man den Sand vor dem Schlitten befeuchtet? Plane einen Versuch (Karte schlitten).' },
    { thema: 'Totengericht', aufgabe: 'Welche Regeln sprach der Tote? Welche würden heute noch passen? (Karte waage)' },
    { thema: 'Zeitspanne', aufgabe: 'Wie viele Jahre liegen zwischen Cheops und Kleopatra, wie viele zwischen Kleopatra und heute? (Karte zeitluecke)' },
    { thema: 'Museumsschild', aufgabe: 'Schreibe ein Museumsschild für einen Fund aus dem Grab des Tutanchamun (Karten tutmaske, dolch, thron).' },
  ],
  lizenz: 'Texte: eigene Formulierung, frei für den Unterricht.',
};
const file = process.argv[2] || path.join(root, 'texte.json');
fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
const noStation = cards.filter((c) => c.station === null).map((c) => c.id);
console.log(`geschrieben: ${file}  Seiten ${pages.length}, Karten ${cards.length}, ohne Station: ${noStation.join(',') || '–'}`);
