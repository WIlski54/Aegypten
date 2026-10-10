// Karten Station 7 und 8 (Deutsch, Klasse 5/6).
export const CARDS_C = {
  // ------------------------------------------------------------ Station 7: Tal der Könige
  tal_der_koenige: {
    name: 'Das Tal der Könige', say: '', tts: 'Tal der Könige', when: 'ca. 1539 bis 1075 v. Chr.', period: 'Neues Reich', whereLabel: 'Ort', where: 'am Westufer des Nils bei Theben (Luxor)',
    wow: 'Über der Schlucht ragt ein Berg, der aussieht wie eine natürliche Pyramide.',
    text: 'Im Tal der Könige liegen über 60 Gräber von Pharaonen und hohen Beamten. Die Gräber sind tief in den Felsen gehauen. Die Wände sind bemalt. Man wollte Räuber abschrecken: Der Eingang wurde versteckt.',
    note: 'Fast alle Gräber wurden schon im Altertum ausgeraubt.', tags: ['Grab', 'Neues Reich'], fragen: ['Warum baute man die Königsgräber im Tal und nicht als Pyramiden?'],
  },
  tutanchamun: {
    name: 'Tutanchamun', say: 'sprich: tut-an-CHA-mun', tts: 'Tutanchamun', meaning: 'Bedeutung: „lebendes Abbild des Amun“.', when: 'regierte ca. 1332 bis 1323 v. Chr.', period: 'Neues Reich', dietLabel: 'Aufgabe', diet: 'Pharao, noch ein Kind bei Amtsantritt', whereLabel: 'Ort', where: 'Theben, Grab KV62', size: 'etwa 1,6 m', specId: 'tutanchamun', sizeM: 1.6,
    wow: 'Er starb mit etwa 18 bis 19 Jahren. Sein Grab ist das am besten erhaltene Königsgrab, das man kennt.',
    text: 'Tutanchamun wurde mit etwa 9 Jahren König. Er war nicht besonders bedeutend. Berühmt wurde er, weil sein Grab fast unberührt blieb. Darin lagen mehr als 5000 Gegenstände.',
    note: 'Die Todesursache ist nicht endgültig geklärt: Wahrscheinlich waren Komplikationen eines Beinbruchs im Spiel, Malaria wurde nachgewiesen.', tags: ['Pharao', 'Grab'], fragen: ['Warum ist Tutanchamun so berühmt?'],
  },
  tutmaske: {
    name: 'Die Goldmaske', say: '', tts: 'Goldmaske', when: 'um 1323 v. Chr.', period: 'Neues Reich', whereLabel: 'Ort', where: 'Grab KV62, heute im Museum in Kairo', size: 'etwa 54 cm hoch · 10 kg Gold', specId: 'tutmaske', sizeM: 0.54,
    wow: 'Die Maske wiegt über 10 Kilogramm. Augen und Streifen sind mit Edelsteinen und Glas eingelegt.',
    text: 'Die Maske lag auf dem Gesicht der Mumie. Auf der Stirn sitzen ein Geier und eine Kobra. Sie sind die Schutzgöttinnen von Ober- und Unterägypten. Das Kopftuch hat blaue Streifen aus Glas und Halbedelstein.',
    tags: ['Schatz', 'Grab'], fragen: ['Woraus besteht die Goldmaske?'],
  },
  thron: {
    name: 'Der Goldene Thron', say: '', tts: 'Thron', when: 'um 1330 v. Chr.', whereLabel: 'Ort', where: 'Grab KV62', specId: 'thron_tut', sizeM: 1.0,
    wow: 'Auf der Lehne sieht man den jungen König und seine Frau Anchesenamun.',
    text: 'Der Thron ist aus Holz und mit Gold und Silber überzogen. Die Armlehnen haben die Form von Schlangen. Die Füße sind wie Löwenpfoten geformt.',
    tags: ['Schatz'], fragen: ['Welche Tiere sind am Thron abgebildet?'],
  },
  sarg: {
    name: 'Die drei Särge', say: '', tts: 'Särge', when: 'um 1323 v. Chr.', whereLabel: 'Ort', where: 'Grab KV62', specId: 'sarkophag_gold', sizeM: 2.0,
    wow: 'Der innerste Sarg ist aus massivem Gold und wiegt über 100 Kilogramm.',
    text: 'Tutanchamuns Mumie lag in drei ineinander gesteckten Särgen. Die beiden äußeren sind aus Holz mit Gold. Der innere ist aus Gold. Alle drei steckten in einem Steinsarkophag. Darüber standen vier vergoldete Schreine.',
    tags: ['Schatz', 'Grab'], fragen: ['Wie viele Särge waren ineinander geschachtelt?'],
  },
  schrein: {
    name: 'Die goldenen Schreine', say: '', tts: 'Schreine', when: 'um 1323 v. Chr.', whereLabel: 'Ort', where: 'Grab KV62', specId: 'schrein_gold', sizeM: 3,
    wow: 'Die vier Schreine passen wie russische Matroschka-Puppen ineinander.',
    text: 'Die Schreine standen um den Steinsarkophag. Sie waren aus Holz und mit Blattgold belegt. Auf den Wänden stehen Zaubersprüche aus dem Totenbuch.',
    tags: ['Schatz', 'Grab'], fragen: ['Was stand um den Steinsarkophag?'],
  },
  streitwagen: {
    name: 'Der Streitwagen', say: '', tts: 'Streitwagen', when: 'Neues Reich', whereLabel: 'Ort', where: 'Grab KV62 (sechs Wagen)', specId: 'streitwagen', sizeM: 2,
    wow: 'Im Grab standen sechs Streitwagen, auseinandergebaut.',
    text: 'Streitwagen kamen um 1600 v. Chr. nach Ägypten, wohl mit den Hyksos. Sie waren schnell und leicht. Gezogen wurden sie von Pferden. Damit jagte man auch.',
    tags: ['Schatz', 'Technik'], fragen: ['Woher kamen die Streitwagen?'],
  },
  dolch: {
    name: 'Der Dolch aus Meteoriteneisen', say: '', tts: 'Dolch', when: 'um 1323 v. Chr.', whereLabel: 'Ort', where: 'Grab KV62', specId: 'dolch_eisen', sizeM: 0.35,
    wow: 'Die Klinge besteht aus Eisen, das vom Himmel kam, aus einem Meteoriten.',
    text: 'Eisen war damals sehr selten und wertvoll. Man hat den Dolch untersucht: Sein Metall enthält viel Nickel. Das passt zu Eisen aus Meteoriten. Der Griff ist aus Gold.',
    note: 'Das Ergebnis stammt aus einer Untersuchung von 2016. Die Herkunft ist sehr wahrscheinlich, aber nicht hundertprozentig sicher.', tags: ['Schatz', 'Metall'], fragen: ['Woher stammte das Eisen des Dolches?'],
  },
  carter: {
    name: 'Howard Carter', say: 'sprich: HAU-ard KAR-ter', tts: 'Hauard Karter', when: '1874 bis 1939', dietLabel: 'Beruf', diet: 'Archäologe', whereLabel: 'Ort', where: 'Tal der Könige', specId: 'carter', sizeM: 1.75,
    wow: 'Er suchte jahrelang vergeblich, dann fand er am 4. November 1922 eine Stufe.',
    text: 'Howard Carter suchte im Tal der Könige nach dem Grab von Tutanchamun. Sein Geldgeber war Lord Carnarvon. Am 26. November 1922 sah er das erste Mal in die Vorkammer. Dort lagen Truhen, Betten und Statuen voller Gold. Die Ausgrabung dauerte rund zehn Jahre.',
    note: 'Ein „Fluch der Pharaonen“ ist eine Erfindung von Zeitungen.', tags: ['Archäologie'], fragen: ['Wann entdeckte Howard Carter das Grab?'],
  },
  hatschepsut: {
    name: 'Hatschepsut', say: 'sprich: hat-SCHEP-sut', tts: 'Hatschepsut', meaning: 'Bedeutung: „Die Erste unter den edlen Damen“.', when: 'regierte ca. 1479 bis 1458 v. Chr.', period: 'Neues Reich', dietLabel: 'Aufgabe', diet: 'Pharao', whereLabel: 'Ort', where: 'Theben, Totentempel Deir el-Bahari', specId: 'hatschepsut', sizeM: 1.65,
    wow: 'Sie war eine der wenigen Frauen, die als Pharao regierte. Auf Bildern trägt sie oft einen falschen Bart.',
    text: 'Hatschepsut regierte zuerst für ihren jungen Stiefsohn Thutmosis III., dann als Pharao. Sie ließ eine Handelsreise in das Land Punt schicken. Von dort brachte man Weihrauch, Gold und Bäume. Ihr Totentempel liegt in Terrassen vor einer Felswand.',
    tags: ['Pharao', 'Neues Reich'], fragen: ['Was brachte die Reise nach Punt?'],
  },
  ramses: {
    name: 'Ramses II.', say: 'sprich: RAM-ses', tts: 'Ramses der Zweite', when: 'regierte ca. 1279 bis 1213 v. Chr.', period: 'Neues Reich', dietLabel: 'Aufgabe', diet: 'Pharao', whereLabel: 'Ort', where: 'Pi-Ramesse, Abu Simbel', specId: 'ramses', sizeM: 1.75,
    wow: 'Er regierte rund 66 Jahre lang, länger als fast alle Pharaonen.',
    text: 'Ramses II. baute viele Tempel, darunter Abu Simbel mit vier riesigen Statuen. Er führte Kriege und schloss später einen Friedensvertrag mit den Hethitern. Er war berühmt und regierte sehr lange.',
    tags: ['Pharao', 'Neues Reich'], fragen: ['Wie lange regierte Ramses II.?'],
  },

  // ------------------------------------------------------------ Station 8: Kleopatra und Rosetta
  kleopatra: {
    name: 'Kleopatra VII.', say: 'sprich: kle-o-PA-tra', tts: 'Kleopatra die Siebte', when: '69 bis 30 v. Chr.', period: 'Ptolemäerzeit', dietLabel: 'Aufgabe', diet: 'letzte Königin von Ägypten', whereLabel: 'Ort', where: 'Alexandria', specId: 'kleopatra', sizeM: 1.6,
    wow: 'Kleopatra sprach mehrere Sprachen. Sie war die erste Herrscherin ihrer Familie, die auch Ägyptisch lernte.',
    text: 'Kleopatra stammte aus der Familie der Ptolemäer. Sie sprach Griechisch und lernte Ägyptisch. Sie versuchte, Ägypten unabhängig zu halten. Nach ihrem Tod im Jahr 30 v. Chr. wurde Ägypten eine römische Provinz.',
    note: 'Wir kennen ihre Geschichte vor allem aus römischen Berichten. Die waren nicht neutral.', tags: ['Königin', 'Ptolemäer'], fragen: ['Welche Sprachen sprach Kleopatra?'],
  },
  alexandria: {
    name: 'Alexandria', say: 'sprich: a-lek-SAN-dri-a', tts: 'Alexandria', when: 'gegründet 331 v. Chr.', period: 'Ptolemäerzeit', whereLabel: 'Ort', where: 'am Mittelmeer, Nildelta',
    wow: 'Die Stadt wurde von Alexander dem Großen gegründet und trägt seinen Namen.',
    text: 'Alexandria wurde zur größten Stadt am Mittelmeer. Dort lagen ein großer Hafen, der Leuchtturm Pharos und die berühmte Bibliothek. Gelehrte aus vielen Ländern forschten und schrieben hier.',
    tags: ['Stadt'], fragen: ['Wer gründete Alexandria?'],
  },
  leuchtturm: {
    name: 'Der Leuchtturm von Alexandria', say: 'sprich: LOICH-turm', tts: 'Leuchtturm', when: 'um 280 v. Chr. fertig', whereLabel: 'Ort', where: 'Insel Pharos vor Alexandria', size: 'über 100 m hoch (Schätzungen)', specId: null,
    wow: 'Er gehörte zu den sieben Weltwundern. Ein Erdbeben ließ ihn im Mittelalter einstürzen.',
    text: 'Auf der Spitze brannte ein Feuer. Ein Spiegel sollte das Licht weit auf das Meer werfen. Im Französischen und Italienischen heißt „Leuchtturm“ bis heute nach der Insel „phare“ und „faro“.',
    note: 'Wie genau der Leuchtturm aussah und wie hoch er war, wissen wir nicht sicher.', tags: ['Bauwerk'], fragen: ['Wozu diente der Leuchtturm?'],
  },
  bibliothek: {
    name: 'Die Bibliothek von Alexandria', say: '', tts: 'Bibliothek von Alexandria', when: 'ab ca. 290 v. Chr.', whereLabel: 'Ort', where: 'Alexandria',
    wow: 'Sie sollte alle Schriften der Welt sammeln. Der Überlieferung nach mussten Schiffe ihre Bücher zum Abschreiben abgeben.',
    text: 'In der Bibliothek lagen Hunderttausende Papyrusrollen. Gelehrte wie Euklid arbeiteten in Alexandria. Die Bibliothek verfiel mit der Zeit und wurde nicht an einem einzigen Tag verbrannt.',
    note: 'Wie viele Rollen es genau gab, wissen wir nicht. Die Zahl „700 000“ ist eine antike Schätzung.', tags: ['Wissen'], fragen: ['Was sammelte die Bibliothek von Alexandria?'],
  },
  rosetta: {
    name: 'Der Stein von Rosette', sci: 'Rosetta-Stein', say: 'sprich: ro-SET-te', tts: 'Rosette', when: 'beschriftet 196 v. Chr., gefunden 1799', whereLabel: 'Heute', where: 'Britisches Museum, London', size: 'etwa 1,1 m hoch', specId: 'rosetta_stein', sizeM: 1.1,
    wow: 'Der Text steht dreimal auf dem Stein: in Hieroglyphen, in Demotisch und auf Griechisch.',
    text: 'Griechisch konnten Forscher lesen. So ließ sich der Text mit den beiden ägyptischen Schriften vergleichen. Der Stein ist aus dunklem Granodiorit. Er trägt einen Erlass des Königs Ptolemaios V.',
    note: 'Ägypten wünscht sich den Stein zurück. Darüber wird gestritten.', tags: ['Schrift', 'Entdeckung'], fragen: ['Welche drei Schriften stehen auf dem Stein?'],
  },
  champollion: {
    name: 'Jean-François Champollion', say: 'sprich: schampo-li-ON', tts: 'Schampoljon', when: '1790 bis 1832', dietLabel: 'Beruf', diet: 'Sprachforscher aus Frankreich', whereLabel: 'Ort', where: 'Paris', specId: 'champollion', sizeM: 1.7,
    wow: 'Er lernte schon als Kind viele Sprachen. 1822 gelang es ihm, die Hieroglyphen zu entziffern.',
    text: 'Champollion verglich die Namen in Kartuschen. Zum Beispiel „Ptolemaios“ auf dem Stein. Er erkannte: Hieroglyphen sind Laut- und Bildzeichen zugleich. Ein Vorgänger, Thomas Young, hatte 1814 schon einige Zeichen richtig gedeutet.',
    tags: ['Schrift', 'Entdeckung'], fragen: ['Wann entzifferte Champollion die Hieroglyphen?'],
  },
  ptolemaios: {
    name: 'Die Kartusche „Ptolemaios“', say: '', tts: 'Ptolemaios', when: 'auf dem Stein von Rosette', whereLabel: 'Ort', where: 'Stein von Rosette',
    wow: 'Eine Kartusche ist ein Namensring. Darin standen die Namen von Königen.',
    text: 'Der Name Ptolemaios kommt auf dem Stein mehrmals vor, auf Griechisch und in Hieroglyphen. So konnte man Zeichen und Laute zuordnen: p, t, o, l, m, i, s.',
    tags: ['Schrift'], fragen: ['Wozu dienten Kartuschen?'],
  },
  segelschiff: {
    name: 'Das Handelsschiff', say: '', tts: 'Handelsschiff', when: 'Ptolemäerzeit', whereLabel: 'Ort', where: 'Hafen von Alexandria',
    wow: 'Ägypten lieferte Getreide an die Städte rund um das Mittelmeer.',
    text: 'Von Alexandria aus segelten Schiffe nach Griechenland und Rom. Sie brachten Getreide, Papyrus und Glas. Auf dem Rückweg hatten sie Wein, Öl und Metall an Bord.',
    tags: ['Schiff', 'Handel'], fragen: ['Was lieferte Ägypten über das Meer?'],
  },
};
