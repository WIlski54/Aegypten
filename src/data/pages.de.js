// Seitentexte (Deutsch, Klasse 5/6). index = Station 0..8.
//   name     Kapitelname (Tooltip)       era   Zeitalter-Kopf           years  Jahre
//   title    Seitentitel                 card  Text auf der gedruckten Karte (kurz, 3 bis 4 Sätze)
//   narr     Einführung (Erzählstimme)   hint  Hinweiszeile unten
//   color    Punktfarbe (Zeitalter)
export const PAGES_DE = [
  {
    id: 'erduhr', name: 'Willkommen und Erduhr', era: 'Willkommen', years: '4,54 Milliarden Jahre', color: '#d9a441',
    title: 'Hallo, kleine Forscherin, hallo, kleiner Forscher!',
    kicker: 'Willkommen',
    card: 'Willkommen im großen Dinosaurier-Popup-Buch! Wir reisen durch viele Millionen Jahre und besuchen die Tiere von damals. Zieh an den Laschen, tippe die Tiere an und finde die versteckten Säugetiere.',
    narr: 'Willkommen im großen Dinosaurier-Popup-Buch! Wir reisen gemeinsam durch viele Millionen Jahre. Zuerst schauen wir auf die Erduhr. Stell dir vor, die ganze Geschichte der Erde passt auf einen einzigen Tag. Zieh an der Lasche und dreh den Zeiger!',
    hint: 'Dreh den Zeiger und schau ins Zeitfenster • tippe auf die Uhr • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'trias', name: 'Trias', era: 'Die Trias', years: '252–201 Mio. Jahre', color: '#c8693a',
    title: 'Morgendämmerung der Dinosaurier', kicker: 'Die Trias',
    card: 'Vor mehr als 200 Millionen Jahren gab es nur einen riesigen Kontinent: Pangaea. Es war heiß und trocken. Die ersten Dinosaurier waren klein und flink. Niemand ahnte, wie groß ihre Nachkommen einmal werden würden.',
    narr: 'Wir sind in der Trias, vor gut zweihundert Millionen Jahren. Alles Land der Erde hängt zusammen: ein einziger Riesenkontinent namens Pangaea. Es ist heiß und trocken. Die ersten Dinosaurier sind noch klein und sehr flink. Zieh an der Lasche und lass das Rudel rennen!',
    hint: 'Zieh die RENN!-Lasche • tippe ein Tier • öffne die Pangaea-Klappe • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'jura-wald', name: 'Jura-Wald', era: 'Der Jura', years: '201–145 Mio. Jahre', color: '#3f8f5a',
    title: 'Riesen des Jura', kicker: 'Der Jura-Wald',
    card: 'Im Jura wurde es feucht und grün. Riesige Pflanzenfresser zogen durch hohe Wälder und fraßen die Blätter aus den Baumkronen. Hinter einem Baumstamm schaut ein Jäger hervor.',
    narr: 'Willkommen im Jura-Wald. Hier ist es feucht und grün, und die Bäume sind hoch. Der Riese in der Mitte ist ein Sauropode. Mit dem langen Hals frisst er Blätter aus den Baumkronen. Aber pass auf: Hinter dem Baumstamm schaut ein Jäger hervor. Schiebe den Hals nach oben und schwing den Schwanz!',
    hint: 'Schiebe den Halslänge-Regler • zieh SCHWING! • tippe ein Tier • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'jura-lagune', name: 'Jura-Lagune', era: 'Der Jura', years: 'vor etwa 150 Mio. Jahren', color: '#5aa9d6',
    title: 'Das Wunder von Solnhofen', kicker: 'Die Lagune',
    card: 'Vor etwa 150 Millionen Jahren lag im heutigen Bayern eine warme Lagune. Tote Tiere sanken in feinen Kalkschlamm. Dort wurden sie zu Fossilien, sogar mit Abdrücken von Federn. So kennen wir den Urvogel Archaeopteryx.',
    narr: 'Wir sind in einer warmen Lagune im heutigen Bayern, vor etwa hundertfünfzig Millionen Jahren. Hier lebten Archaeopteryx, der Urvogel, und viele andere Tiere. Wenn ein Tier starb, sank es in den feinen Kalkschlamm. Zieh am Schieber Zeit vergeht und sieh, wie daraus ein Fossil wird!',
    hint: 'Zieh FLATTER! • schiebe „Zeit vergeht“ • tippe ein Tier • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'kreide-meer', name: 'Kreide-Meer', era: 'Die Kreide', years: '145–66 Mio. Jahre', color: '#1f5f8f',
    title: 'Flügel über dem Meer', kicker: 'Das Kreide-Meer',
    card: 'In der Kreidezeit flogen riesige Flugsaurier über das Meer. Im Wasser schwammen Tiere mit langem Hals und starke Jäger. Aber Achtung: Keines dieser Tiere war ein Dinosaurier. Man nennt sie Cousins der Dinosaurier.',
    narr: 'Hier ist das Meer der Kreidezeit. Über den Wellen segelt ein Flugsaurier, und unter Wasser schwimmen riesige Reptilien. Aber Achtung: Keines dieser Tiere ist ein Dinosaurier. Sie sind Cousins. Zieh an den Laschen, dann stürzt Pteranodon nach einem Fisch. Und tippe auf die Wellen!',
    hint: 'Zieh FLATTER! und STURZ! • schiebe „Periskop“ • tippe auf die Wellen • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'spaetkreide', name: 'Könige der Kreide', era: 'Die Kreide', years: 'vor 68–66 Mio. Jahren', color: '#e76f51',
    title: 'Könige der Kreide', kicker: 'Nordamerika',
    card: 'Kurz vor dem Ende der Dinosaurierzeit lebten in Nordamerika berühmte Tiere: Tyrannosaurus rex, Triceratops und der gepanzerte Ankylosaurus. Pass auf: Irgendwo versteckt sich auch ein kleines Säugetier.',
    narr: 'Jetzt sind wir kurz vor dem Ende der Dinosaurierzeit, in Nordamerika. Hier leben die berühmtesten Dinosaurier: Tyrannosaurus rex, Triceratops und Ankylosaurus. Zieh an der Lasche und lass den T. rex zubeißen! Und such das winzige Säugetier, das sich hier versteckt.',
    hint: 'Zieh BEISS! • schiebe „Kopf runter!“ • tippe ein Tier • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'nest', name: 'Dino-Babys', era: 'Die Kreide', years: 'vor 76–74 Mio. Jahren', color: '#2a9d8f',
    title: 'Dino-Babys', kicker: 'Die Nistkolonie',
    card: 'Maiasaura heißt „gute Mutter-Echse“. In Montana fand man ganze Nistplätze mit Eiern und Jungtieren. So wissen wir: Manche Dinosaurier kümmerten sich um ihren Nachwuchs.',
    narr: 'Das hier ist eine Nistkolonie in Montana, vor etwa fünfundsiebzig Millionen Jahren. Maiasaura bedeutet gute Mutter-Echse. Zieh an der Lasche Schlüpfe, dann brechen die Eier auf. Und mit dem Schieber Sonnenuntergang kuscheln sich die Babys an.',
    hint: 'Zieh SCHLÜPFE! • schiebe „Sonnenuntergang“ • tippe ein Tier • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'einschlag', name: 'Einschlag', era: 'Das Ende der Kreide', years: 'vor etwa 66 Mio. Jahren', color: '#a4161a',
    title: 'Der Tag, an dem der Himmel brannte', kicker: 'Vor 66 Millionen Jahren',
    card: 'Vor etwa 66 Millionen Jahren schlug ein riesiger Asteroid auf die Erde. Danach war der Himmel lange grau. Viele Arten starben aus, auch die großen Dinosaurier. Eine Gruppe überlebte: die Vögel.',
    narr: 'Das ist der Tag, an dem sich alles veränderte. Vor etwa sechsundsechzig Millionen Jahren raste ein Asteroid auf die Erde zu. Zieh an der Lasche Meteor und sieh, was passiert. Wichtig: Es ist nichts Schlimmes zu sehen. Und am Ende gibt es auch eine gute Nachricht.',
    hint: 'Zieh METEOR! • öffne die Klappe „Spurensuche“ • tippe ein Tier • fass die Seite an und zieh sie zum Umblättern',
  },
  {
    id: 'finale', name: 'Säugetiere und Vormenschen', era: 'Das Känozoikum', years: 'vor 66 bis 3,7 Mio. Jahren', color: '#e9c46a',
    title: 'Die Stunde der Säugetiere – und ein Spaziergang in der Asche', kicker: 'Die letzte Seite',
    card: 'Nach dem Einschlag konnten sich die Säugetiere ausbreiten. Schiebe den Zeitsprung-Regler und sieh, wie sich die Landschaft verändert. Ganz am Ende, vor 3,7 Millionen Jahren, gehen frühe Vormenschen durch frische Vulkanasche.',
    narr: 'Das ist die letzte Seite. Nach dem Einschlag ändert sich die Welt. Die Säugetiere breiten sich aus, und es gibt bald viele neue Arten. Links wachsen aus Farnen Wälder. Rechts kannst du am Zeitsprung-Regler ziehen. Die Landschaft verändert sich, bis du in Laetoli ankommst, vor drei Komma sieben Millionen Jahren. Dort gehen frühe Vormenschen durch frische Vulkanasche.',
    hint: 'Zieh WACHSE! • schiebe den Zeitsprung-Regler • am Ende: LAUF! • tippe Lucy und die Tiere',
  },
];

// Zusätzliche Karten (nicht Tiere)
export const CARDS_DE = {
  erduhr: {
    name: 'Die Erduhr', say: '', tts: '',
    wow: 'Alle Dinosaurier zusammen gab es nur von etwa 22:47 Uhr bis 23:39 Uhr. Der Mensch kommt erst kurz vor Mitternacht.',
    text: 'Wir pressen die 4,54 Milliarden Jahre der Erde auf 24 Stunden. Dann beginnt die Erde um 0 Uhr. Die ersten Säugetiere erscheinen gegen 22:55 Uhr. Der Homo sapiens betritt die Bühne etwa 6 Sekunden vor Mitternacht.',
    note: 'Der Moment der Zeigerposition wird im Buch aus den Jahreszahlen berechnet. Alle Zeiten sind gerundet.',
    noCompare: true, tags: ['Erdgeschichte'], fragen: ['Wie spät ist es auf der Erduhr, als die Dinosaurier starben?'],
  },
  iridium: {
    name: 'Spurensuche: Iridium', say: 'sprich: i-RI-di-um', tts: 'Iridium',
    wow: 'In einer dünnen grauen Tonschicht fanden Forscher viel mehr Iridium als sonst. Das ist die Spur des Asteroiden.',
    text: 'Iridium hat die Ordnungszahl 77 und das Zeichen Ir. In der Erdkruste ist es sehr selten, in Meteoriten kommt es häufiger vor. 1980 fanden Luis und Walter Alvarez mit ihren Kollegen überall auf der Welt an der gleichen Gesteinsschicht auffällig viel Iridium. Das war ein wichtiger Hinweis auf den Einschlag.',
    note: 'Es ist die Grenze zwischen Kreide und Paläogen. Auch Vulkane können etwas Iridium liefern. Zusammen mit dem Krater passt der Einschlag am besten.',
    noCompare: true, tags: ['Chemie', 'Iridium', 'Einschlag'], fragen: ['Wofür steht Ir im Periodensystem und welche Ordnungszahl hat es?'],
  },
  chicxulub: {
    name: 'Der Einschlag', say: 'sprich: tschick-schu-LUB', tts: 'Tschikschulub',
    when: 'vor etwa 66,0 Mio. Jahren', wow: 'Der Krater bei Chicxulub in Mexiko ist etwa 180 km breit.',
    text: 'Der Asteroid war etwa 10 bis 15 km groß. Beim Einschlag wurden Staub und Asche hoch in die Luft geschleudert. Die Sonne wurde lange verdeckt. Pflanzen bekamen weniger Licht, und viele Tiere fanden kaum noch Nahrung. Rund drei Viertel aller Arten verschwanden.',
    note: 'Auch die riesigen Vulkane der Dekkan-Trappen in Indien spielten wohl eine Rolle. Der Einschlag gilt aber als Hauptauslöser.',
    noCompare: true, tags: ['Einschlag', 'Massenaussterben'], fragen: ['Wie groß war der Asteroid, wie groß der Krater?'],
  },
  ueberlebende: {
    name: 'Eine Gruppe hat überlebt', wow: 'Eine Gruppe von Dinosauriern hat überlebt: die Vögel.',
    text: 'Nach dem Einschlag war die Luft voller Staub. Die großen Dinosaurier verschwanden. Kleine Tiere kamen besser zurecht, auch Säugetiere und Vögel. Heute gibt es etwa 10 000 Vogelarten.',
    noCompare: true, tags: ['Vögel', 'Überleben'],
  },
  album: {
    name: 'Familienalbum der versteckten Säugetiere', wow: 'Säugetiere gibt es schon fast so lange wie Dinosaurier.',
    text: 'Das sind die winzigen frühen Säugetiere und Seitenzweige, die du gefunden hast. Keines davon ist ein sicherer direkter Vorfahre von uns Menschen. Aber sie zeigen: Säugetiere lebten schon zur Zeit der Dinosaurier.',
    noCompare: true, tags: ['Säugetiere'],
  },
  zeitluecke: {
    name: 'Die große Zeitlücke', wow: 'Menschen und Dinosaurier sind sich nie begegnet.',
    text: 'Zwischen dem Einschlag vor 66 Mio. Jahren und Lucy vor 3,2 Mio. Jahren liegen rund 63 Mio. Jahre. Die Zeit der Dinosaurier dauerte von etwa 231 bis 66 Mio. Jahren, also rund 165 Mio. Jahre.',
    noCompare: true, tags: ['Zeit'], fragen: ['Wie viele Millionen Jahre liegen zwischen dem Einschlag und Lucy?'],
  },
};
