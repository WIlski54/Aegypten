// Seitentexte (Deutsch, Klasse 5/6). index = Station 0..8.
//   name     Kapitelname (Tooltip)       era   Epoche-Kopf           years  Jahre
//   title    Seitentitel                 card  Text auf der gedruckten Karte (kurz, 3 bis 4 Sätze)
//   narr     Einführung (Erzählstimme)   hint  Hinweiszeile unten
//   color    Punktfarbe (Epoche)
export const PAGES_DE = [
  {
    id: 'zeitrad', name: 'Willkommen und Zeitrad', era: 'Willkommen', years: 'ca. 3100 v. Chr. bis 30 v. Chr.', color: '#d9a441',
    title: 'Hallo, kleine Forscherin, hallo, kleiner Forscher!',
    kicker: 'Willkommen',
    card: 'Willkommen im großen Ägypten-Popup-Buch! Das alte Ägypten gab es über 3000 Jahre lang. Wir reisen durch alle Epochen und besuchen Pharaonen, Götter und Handwerker. Zieh an den Laschen, tippe die Figuren an und finde die versteckten Sonnenkäfer.',
    narr: 'Willkommen im großen Ägypten-Popup-Buch! Wir reisen gemeinsam durch dreitausend Jahre. Zuerst schauen wir auf das Zeitrad der Sonne. Zieh an der Lasche und dreh den Zeiger, dann siehst du, wie sich Ägypten verändert.',
    hint: 'Dreh den Zeiger und schau ins Zeitfenster • zieh SONNE! und die Barke • tippe die Pyramide • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'nil', name: 'Das Geschenk des Nil', era: 'Vor den Pharaonen', years: 'bis ca. 3100 v. Chr.', color: '#3f8f5a',
    title: 'Das Geschenk des Nil', kicker: 'Der Nil',
    card: 'Ägypten liegt in der Wüste. Ohne den Nil gäbe es hier kein Leben. Jedes Jahr trat der Fluss über die Ufer. Er ließ fruchtbaren Schlamm zurück, und darin wuchsen Getreide und Gemüse. Die Ägypter nannten das gute Land „das Schwarze Land“, die Wüste „das Rote Land“.',
    narr: 'Das hier ist der Nil. Ringsum ist Wüste, aber am Fluss ist es grün. Jedes Jahr kam die Flut, und danach war der Boden fruchtbar. Zieh am Schieber Flut und sieh, wie das Wasser steigt. Tippe auf die Tiere am Ufer.',
    hint: 'Schiebe FLUT! • öffne den NILOMETER • zieh SCHÖPFEN • tippe ein Tier • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'reich', name: 'Ein Pharao, zwei Länder', era: 'Frühzeit', years: 'ca. 3100 bis 2650 v. Chr.', color: '#d9a441',
    title: 'Ein Pharao, zwei Länder', kicker: 'Das geeinte Reich',
    card: 'Ägypten bestand aus zwei Teilen: Unterägypten im Norden (am Delta) und Oberägypten im Süden (am Fluss). Vor etwa 5000 Jahren wurden sie ein Reich. Der Pharao trug eine Doppelkrone aus der roten und der weißen Krone.',
    narr: 'Hier siehst du zwei Länder. Links liegt Unterägypten mit der roten Krone, rechts Oberägypten mit der weißen Krone. Zieh an den beiden Laschen Nord und Süd. Wenn beide Kronen zusammenkommen, wird daraus die Doppelkrone des Pharaos.',
    hint: 'Zieh NORD und SÜD • schiebe DATUM • tippe eine Figur • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'gizeh', name: 'Die Pyramiden von Gizeh', era: 'Altes Reich', years: 'ca. 2600 bis 2500 v. Chr.', color: '#e0a83a',
    title: 'Die Pyramiden von Gizeh', kicker: 'Das Alte Reich',
    card: 'Die Cheops-Pyramide ist das größte Bauwerk aus dieser Zeit. Sie wurde in rund 26 Jahren gebaut, aus etwa 2,3 Millionen Steinblöcken. Gebaut haben sie Tausende bezahlte Arbeiter. Sie bekamen Essen, und sie wurden sogar in Gräbern neben den Pyramiden beigesetzt.',
    narr: 'Das hier ist Gizeh, vor über viertausendfünfhundert Jahren. Diese riesigen Pyramiden wurden von Arbeitern gebaut, nicht von Sklaven. Zieh am Hebel Bauen und sieh die Pyramide wachsen. Mit Schnitt klappst du sie auf und schaust hinein.',
    hint: 'Zieh BAUEN! • öffne SCHNITT • zieh den SCHLITTEN • tippe eine Figur • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'goetter', name: 'Götter und das Totengericht', era: 'Mittleres Reich', years: 'ca. 2000 bis 1700 v. Chr.', color: '#1f5f8f',
    title: 'Götter und das Totengericht', kicker: 'Der Glaube',
    card: 'Die Ägypter verehrten viele Götter. Ra war der Sonnengott, Osiris herrschte über das Totenreich. Viele Ägypter glaubten: Nach dem Tod wird das Herz gegen eine Feder gewogen. Die Feder steht für die Wahrheit.',
    narr: 'Wir sind in einem Tempel voller Götter. Viele Ägypter glaubten, dass im Totenreich das Herz gewogen wird. Auf der anderen Waagschale liegt eine Feder, die Feder der Wahrheit. Zieh am Schieber Waage und sieh zu.',
    hint: 'Schiebe WAAGE • zieh TOR • zieh die BARKE • tippe einen Gott • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'mumie', name: 'Die Mumienwerkstatt', era: 'Neues Reich', years: 'ca. 1500 bis 1100 v. Chr.', color: '#c8452c',
    title: 'Die Mumienwerkstatt', kicker: 'Chemie für die Ewigkeit',
    card: 'Die Ägypter wollten, dass der Körper nach dem Tod erhalten bleibt. Dafür legten sie ihn in Natron, ein Salz. Das Salz entzieht dem Körper das Wasser. Ohne Wasser können Bakterien nicht wachsen, und nichts verfault.',
    narr: 'Das hier ist eine Mumienwerkstatt. Die Ägypter wussten schon viel über Salz und Wasser. Zieh am Schieber Tage und sieh, wie die Zeit vergeht. Mit der Lasche Natron streust du das Salz auf.',
    hint: 'Schiebe TAGE • zieh NATRON • öffne KANOPEN • tippe etwas an • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'alltag', name: 'Alltag, Schrift und Papyrus', era: 'Neues Reich', years: 'ca. 1300 bis 1100 v. Chr.', color: '#2a9d8f',
    title: 'Alltag, Schrift und Papyrus', kicker: 'Das Arbeiterdorf',
    card: 'In Deir el-Medina wohnten die Handwerker, die die Gräber im Tal der Könige bauten. Wir wissen viel über sie, weil sie schrieben: Briefe, Einkaufslisten und Beschwerden, sogar den ersten bekannten Streik. Als Schreibzeug diente Papyrus.',
    narr: 'Wir schauen in ein Haus im Arbeiterdorf. Hier wird gebacken, geschrieben und gespielt. Zieh am Schieber Schreiben, dann schreibt der Schreiber Hieroglyphen. Mit Zeichen siehst du, was sie bedeuten.',
    hint: 'Schiebe SCHREIBEN • zieh ZEICHEN • zieh MAHLEN • öffne SENET • tippe etwas an • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'tal', name: 'Tal der Könige', era: 'Neues Reich', years: 'ca. 1500 bis 1200 v. Chr.', color: '#a4161a',
    title: 'Tal der Könige und Tutanchamun', kicker: 'Das Königsgrab',
    card: 'Im Tal der Könige wurden die Pharaonen des Neuen Reiches beigesetzt. Das Grab von Tutanchamun blieb fast unberührt. Howard Carter entdeckte es im November 1922. Darin lagen mehr als fünftausend Gegenstände, auch eine Goldmaske.',
    narr: 'Das hier ist das Tal der Könige. Zieh an der Lasche Tür und öffne das Grab von Tutanchamun. Mit dem Schieber Schätze siehst du, was die Ägypter ihrem jungen König mitgegeben haben.',
    hint: 'Zieh TÜR • schiebe SCHÄTZE • zieh TRAGEN • tippe etwas an • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'finale', name: 'Kleopatra und der Stein von Rosette', era: 'Späte Zeit', years: '332 v. Chr. bis heute', color: '#e9c46a',
    title: 'Der Stein, der Hieroglyphen lesbar machte', kicker: 'Die letzte Seite',
    card: 'Alexandria war die große Hafenstadt am Meer. Dort herrschte Kleopatra VII. als letzte Königin, bis 30 v. Chr. Später vergaß man, wie man Hieroglyphen liest. Erst der Stein von Rosette half: Er trägt denselben Text in drei Schriften.',
    narr: 'Das ist die letzte Seite. Links liegt Alexandria mit dem Leuchtturm. Rechts sitzt ein Gelehrter und studiert den Stein von Rosette. Schiebe 3 Sprachen und sieh, wie aus Zeichen Wörter werden. Mit Finale fährt die Sonnenbarke noch einmal an allem vorbei.',
    hint: 'Schiebe 3 SPRACHEN • zieh LEUCHTTURM • zieh FINALE • tippe etwas an • fass die Seite an und zieh sie zum Umblättern',
  },
];

// Zusätzliche Karten (nicht Tiere oder Figuren)
export const CARDS_DE = {
  zeitrad: {
    name: 'Das Zeitrad der Sonne', say: '', tts: '',
    wow: 'Das alte Ägypten dauerte länger als alle Reiche, die wir heute kennen: rund 3000 Jahre.',
    text: 'Das Zeitrad zeigt die Epochen des alten Ägypten von ca. 3100 v. Chr. bis 30 v. Chr.: Frühzeit, Altes Reich, Mittleres Reich, Neues Reich, Späte Zeit und die Zeit der Ptolemäer. Wenn du den Zeiger drehst, siehst du im Zeitfenster eine passende Szene.',
    note: 'Die Jahreszahlen vor 664 v. Chr. sind ungefähr: Forscher streiten über Jahrzehnte. Deshalb steht oft „ca.“.',
    noCompare: true, tags: ['Zeit'], fragen: ['Wie lange dauerte das alte Ägypten ungefähr?'],
  },
  album: {
    name: 'Die Käfersammlung', wow: 'Der Skarabäus war für die Ägypter ein Glücksbringer.',
    text: 'Das sind die versteckten Sonnenkäfer, die du gefunden hast. Die Ägypter sahen im Pillendreher-Käfer ein Bild für die aufgehende Sonne: Wie der Käfer die Kugel rollt, so schiebt der Gott Chepre die Sonne über den Himmel.',
    noCompare: true, tags: ['Skarabäus'],
  },
  zeitluecke: {
    name: 'Die große Zeitspanne', wow: 'Zwischen Cheops und Kleopatra liegen mehr Jahre als zwischen Kleopatra und heute.',
    text: 'Die Cheops-Pyramide entstand um 2600 v. Chr. Kleopatra starb 30 v. Chr. Dazwischen liegen etwa 2500 Jahre. Von Kleopatra bis heute sind es gut 2050 Jahre.',
    noCompare: true, tags: ['Zeit'], fragen: ['Wie viele Jahre liegen zwischen dem Bau der Cheops-Pyramide und Kleopatras Tod?'],
  },
};
