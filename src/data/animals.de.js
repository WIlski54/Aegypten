import { CARDS_A } from './cards_a.de.js';
import { CARDS_B } from './cards_b.de.js';
import { CARDS_C } from './cards_c.de.js';

// Alle Figuren- und Infokarten (Deutsch, Klasse 5/6, Du-Ansprache).
// Felder pro Karte:
//   name        Anzeigename           sci         ggf. wissenschaftlicher Name / ägyptischer Name    say   "sprich: ..."   tts  Sprechschreibweise für die Vorlesestimme
//   meaning     Bedeutung des Namens  when        Zeit (Text)   period  Epoche
//   size        Größe (Text)          diet        Nahrung / Aufgabe   where  Ort
//   wow         "Wow!"-Fakt (max. 2 Sätze)   text   Erklärtext (kurz)   note  Hinweis zur Unsicherheit der Forschung
//   specId      Zeichnung für den Größenvergleich (Schlüssel in art/registry.js)   sizeM  Höhe/Länge in m für den Vergleich
//   hidden      true = versteckter Sonnenkäfer (Mini-Karte)
//   fragen      Anschluss für ein Arbeitsblatt     tags  Stichworte
const skarab = (n, o) => ({
  name: `Sonnenkäfer Nr. ${n}`, sci: 'Skarabäus (ägyptisch: Cheper)', say: 'sprich: ska-ra-BÄ-us', tts: 'Skarabäus',
  when: 'in allen Epochen', size: 'so groß wie eine Münze (2 bis 3 cm)', specId: null, hidden: true,
  tags: ['Skarabäus', 'Glück'], ...o,
});

const SK = {
  skarab1: skarab(1, {
    wow: 'Der Käfer formt eine Kugel aus Dung, rollt sie weg und legt seine Eier hinein.',
    text: 'Du hast einen Sonnenkäfer gefunden! Das ist ein Pillendreher. Er rollt Dungkugeln rückwärts über den Boden. In der Kugel wächst später seine Brut heran.',
    fragen: ['Was macht ein Pillendreher mit der Kugel?'],
  }),
  skarab2: skarab(2, {
    wow: 'Die Ägypter sahen im rollenden Käfer ein Bild für die Sonne, die über den Himmel wandert.',
    text: 'Der Gott Chepre trug einen Käfer auf dem Kopf oder hatte einen Käferkopf. Er stand für die Morgensonne: Wie der Käfer die Kugel schiebt, so schiebt Chepre die Sonne in den neuen Tag.',
    fragen: ['Welcher Gott gehörte zur Morgensonne?'],
  }),
  skarab3: skarab(3, {
    wow: 'Manche Skarabäus-Amulette haben auf der Unterseite Namen und Zeichen. Man benutzte sie als Siegel.',
    text: 'Aus Stein oder Fayence schnitt man kleine Käfer. Auf der flachen Unterseite standen Hieroglyphen. Man drückte sie in Ton oder Lehm und siegelte so Krüge, Kisten und Briefe.',
    fragen: ['Wofür benutzte man Skarabäus-Siegel?'],
  }),
  skarab4: skarab(4, {
    wow: 'Auf manche Mumien legte man einen Herzskarabäus. Er sollte beim Totengericht helfen.',
    text: 'Das Herz war für die Ägypter der Sitz von Gedanken und Gefühlen. Beim Totengericht wurde es gewogen. Der Herzskarabäus sollte dafür sorgen, dass das Herz nichts Schlechtes verrät.',
    note: 'Das ist der Glaube der Ägypter, so steht es in den Totenbuch-Sprüchen.',
    fragen: ['Was wurde beim Totengericht gewogen?'],
  }),
  skarab5: skarab(5, {
    wow: 'Echte Pillendreher finden ihren Weg nachts mit Hilfe der Milchstraße.',
    text: 'Forscher zeigten 2013: Afrikanische Pillendreher laufen auch in sternklaren Nächten geradeaus. Sie orientieren sich am hellen Band der Milchstraße. Damit rollen sie ihre Kugel schnell von anderen Käfern weg.',
    fragen: ['Woran orientieren sich Pillendreher nachts?'],
  }),
  skarab6: skarab(6, {
    wow: 'Skarabäus-Amulette gab es aus Fayence, Speckstein, Halbedelstein und sogar aus Gold.',
    text: 'Fayence ist eine Art Keramik mit glasiger, oft blauer oder grüner Oberfläche. Die Ägypter machten damit viel Schmuck. Der Käfer war ein beliebtes Muster, weil er Glück bringen sollte.',
    fragen: ['Aus welchen Materialien machte man Skarabäen?'],
  }),
  skarab7: skarab(7, {
    wow: 'Manche Pharaonen ließen große Gedenk-Skarabäen mit Nachrichten herstellen und verschicken.',
    text: 'Unter Amenophis III. gab es Skarabäen, auf denen besondere Ereignisse standen, zum Beispiel eine Hochzeit oder eine Jagd. Man verschickte sie wohl an Beamte und Verbündete.',
    note: 'Wie viele davon verschickt wurden und an wen, wissen wir nicht genau.',
    fragen: ['Wofür nutzte man Gedenk-Skarabäen?'],
  }),
  skarab8: skarab(8, {
    wow: 'Auch heute arbeiten Pillendreher als Müllabfuhr: In Australien setzte man sie gezielt gegen Kuhdung ein.',
    text: 'Pillendreher vergraben Dung und düngen so den Boden. In Australien gab es zu viel Kuhdung, weil die einheimischen Käfer ihn nicht beseitigen konnten. Deshalb brachte man ab den 1960er Jahren passende Dungkäfer ins Land.',
    fragen: ['Wie helfen Dungkäfer der Natur?'],
  }),
  skarab9: skarab(9, {
    wow: 'Der Käfer ist sogar ein Hieroglyphenzeichen. Es bedeutet „werden“ und „entstehen“.',
    text: 'Das Zeichen für „Cheper“ zeigt einen Käfer. Das ägyptische Wort bedeutet „werden, entstehen, sein“. So passt das Zeichen zur Sonne, die jeden Morgen neu entsteht.',
    fragen: ['Was bedeutet das Käfer-Zeichen in Hieroglyphen?'],
  }),
};

export const ANIMALS_DE = { ...SK, ...CARDS_A, ...CARDS_B, ...CARDS_C };
