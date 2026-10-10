# EGYPT BRIEF – Gemeinsamer Auftrag für alle Mitwirkenden

Projekt: **„Das große Ägypten-Popup-Buch“**, ein 3D-Popup-Buch im Browser (three.js, eine einzige HTML-Datei, alles aus Code),
Zielgruppe Klasse 5/6 (Faktenkarten auch für Ältere lesbar), Sprache Deutsch, Du-Ansprache. Auftraggeber ist ein Chemielehrer (Stephan, Gesamtschule Meiderich).
Die Engine stammt aus dem fertigen „Großen Dinosaurier-Popup-Buch“. **Engine, Seitenlogik und Papierschnitt-Technik bleiben gleich, nur Inhalt und Kunst sind neu.**
Der Auftraggeber legt Wert auf: wissenschaftlich/historisch sauber, warm und neugierig („Staunen statt Gruseln“), wenig Chemie (nur Station 5 hat einen Chemie-Schwerpunkt).

Alle Pfade relativ zur **Projektwurzel** (dein Worktree bzw. `/home/user/Aegypten`). Die alten Hinweise auf `/home/claude/dino-popup-buch` in `docs/*.md` gelten nicht mehr.
**Referenz-Projekt (Dino-Buch, nur lesen, nie ändern):** `/tmp/claude-0/-home-user-Aegypten/f4199043-c3d5-5ea3-a339-0af68ad8c35f/scratchpad/dino/` – dort liegen viele Beispiel-Figuren in `src/art/animals/*.js`, Kulissen in `src/art/props/*.js`, Seiten in `src/pages/p1…p8.js`.
Qualitätsmaßstab: so liebevoll, lesbar und sauber wie die Dino-Figuren (Beispiel: `…/dino/src/art/animals/coelophysis.js`, `trex.js`, `human.js`, `_f_hominid.js`).

## Pflichtlektüre (vor dem Start)
`docs/ART_GUIDE.md` (Figuren-Spec-Format, DSL, Malhilfen, Galerie), `docs/PAGE_GUIDE.md` (Seitenbau, SpreadCtx, Koordinaten), `src/art/dsl.js`, `src/art/paint.js`,
`src/engine/figure.js`, `src/engine/papercut.js`, `src/art/props/_e_kit.js` (Kulissen-Helfer, `finish()`), `src/art/props/plants_trees.js` (Palme) und die Dino-Beispiele oben.

## Stil „Ägyptische Wandmalerei als Papierschnitt“
- Papierschnitt mit hellem Schnittrand und Gouache-Textur (das macht die Engine automatisch), kräftige klare Silhouetten, wenige mutige Details, lesbar auch bei 3 cm Höhe.
- **Menschen** im charmanten Profil der Wandmalerei: Kopf im Profil, großes Mandelauge mit schwarzem Lidstrich bis zur Schläfe, schlanke Taille, kräftige Schultern, flache Füße, freundliches Gesicht. Keine Karikaturen, keine Ironie.
- **Farben (verbindlich als Palette):** Haut Männer rotbraun `#b5693a`, Frauen gelblich-ocker `#d9a95a`, Kinder heller; Leinen `#f6efe0` (mit zartem Schatten `#d9cdb4`); Perücke/Haar `#1c1816`; Gold `#e0b040` (heller `#fff0b3`, dunkler `#8a5f1c`); Lapislazuli `#2a5aa0`; Türkis `#3bb3a8`; Karneol `#c0432e`; Papyrus-Grün `#5b9a4b`; Nilgrün `#3f8f5a`; Sandstein `#d9b97a`; Lehmziegel `#b9824f`; Schwarz (Erde, Osiris-Haut-Variante nur grün).
- Hieroglyphen und Schriftbänder sind **Zierde** (echte, einfache Zeichen, keine erfundenen „Sätze“), nie Buchstabenfolgen, die falsche Wörter ergeben. Eigennamen nur mit korrekt lesbaren Zeichen.
- Respekt: Götter und Glauben sachlich und würdevoll darstellen, nie als „Fabelwesen“. Mumien als Handwerk, nie als Horror: kein Blut, keine Knochen, keine Innereien, keine Leichenteile.
- Keine Gewalt, keine Sklavendarstellung (die Pyramiden bauten bezahlte Arbeiter mit Verpflegung).
- Figuren dürfen bewusst unmaßstäblich skaliert werden; die echte Größe steht in `meta`.

## Figuren-Vertrag (Spec-Format siehe `docs/ART_GUIDE.md`)
- Eine Datei pro Figur/Requisit unter `src/art/animals/<id>.js` (Figuren) bzw. `src/art/props/<gruppenname>.js` (mehrere Kulissen in einer Datei erlaubt); eigene Helfer als `_xyz_kit.js` im selben Ordner. **Ändere nicht** `dsl.js`, `paint.js`, `src/engine/*`, `src/ui/*`, `src/pages/*`, `src/data/*` (außer du bist ausdrücklich dafür zuständig).
- Eintrag in **deiner** Registry-Datei `src/art/reg_<gruppe>.js` (`export default { id: factory, ... }`). Nur diese Datei teilst du dir mit niemandem.
- Koordinaten: Meter, y nach oben, Boden bei y=0, Figur schaut nach **+x**. `meta: { name, lengthM|heightM, ranges, swing, flap }`, `anchors`, Teile-Namen exakt wie unten.
- **Standard-Teilenamen** (die Seiten greifen darauf zu): `body` (Pflicht), `armA` (nah, z größer) / `armB` (fern) mit Pivot an der Schulter, `legA` (fern) / `legB` (nah) mit Pivot an der Hüfte (Laufzyklus: gegenphasig), `head` (nur wenn beweglich), `jaw`, `neck` (Hals+Kopf, Pivot an der Schulter), `tail`, `wing`/`wing2`, `lid` (Deckel), `door`, … Eigene Teile sind erlaubt und in der Tabelle zu dokumentieren.
- Bewegliche Teile müssen dort, wo sie ansetzen, in den Körper hineinragen und vom Körper verdeckt werden (siehe ART_GUIDE), damit beim Drehen um ±0,5 rad keine Lücke klafft.
- `meta.ranges[teil] = [ruhe, maximum]` in Radiant, positive Winkel = gegen den Uhrzeigersinn (Figur schaut nach rechts). `meta.swing[teil] = [min,max]` für Laufzyklen.
- Varianten per Optionen: `make({ crown:'weiss' })` usw., in der Tabelle als `opts` dokumentiert.
- **Prüfen:** Galerie bauen und ansehen (Read-Tool auf das PNG!), iterieren bis erkennbar und hübsch, auch bei `cell=220`:
  ```
  node build.mjs --gallery --out=$OUT/gallery.html
  node tools/gallery.mjs $OUT/sheet.png html=$OUT/gallery.html ids=a,b,c cols=3 cell=420 [mode=scale] [pose=armA:-0.5,legB:0.4]
  ```
  `$OUT` = dein eigenes Verzeichnis unter `/tmp/claude-0/` (z. B. `/tmp/claude-0/art_<gruppe>`), **nie** `dist/`. `mode=scale` zeigt alle im selben Maßstab mit 1,75-m-Mensch. `pose=` testet Gelenknähte.
- Kulissen-Requisiten (Pflanzen, Bauwerke, Landschaft, Gegenstände) werden über `ctx.prop('<id>', { x, z, y, len|h, facing, variant })` auf Seiten gestellt. Ihr Spec ist derselbe Typ wie eine Figur (siehe `props/*.js` und `_e_kit.js`), `meta.lengthM`/`heightM` = echte Größe. Große Kulissen dürfen mehrere Parts haben (z. B. `schicht0..schicht11`).
- Budget: Texturgrößen moderat halten (die Engine begrenzt über `ppu`/`maxTex`), keine Allokationen pro Frame, keine Bilddateien, keine externen Anfragen.
- Arbeite im eigenen **Git-Worktree**: `ln -s /home/user/Aegypten/node_modules node_modules` (einmalig), committe regelmäßig in deinem Branch (kleine, aussagekräftige Commits, deutsche Messages mit Co-Authored-By-Zeile wie im Repo-Log). **Nicht pushen**, nicht mergen: das macht der Koordinator.

## Seitenplan und Bedarf (Ids sind der Vertrag mit den Seitenbauern – exakt so benennen)
Koordinatenrahmen der Seiten: linke Seite x ∈ [−12,0], rechte x ∈ [0,12], Tiefe z ∈ [−4.25,4.25]; Kulissenwand ≤ 5.0 hoch, alles andere ≤ 5.5; Textkarte links unten.

### Station 0 – Titelseite „Zeitrad der Sonne“ (ca. 3100 v. Chr. bis 30 v. Chr.)
Nil bei Sonnenaufgang, drei Pyramiden und ein Obelisk als Kulisse, Sonne (SONNE!-Lasche), Papierschiff (Barke, Fadenzug), Zeitrad-Scheibe (baut der Koordinator).
### Station 1 – Das Geschenk des Nil (vor ca. 3100 v. Chr.; Nilgrün/Sandgold)
FLUT!-Schieber (Wasserstand, Felder grün), NILOMETER (Klappe mit Stufenmarken), SCHÖPFEN (Schaduf-Faden). Tiere: Nilpferd, Krokodil, Ibis; Menschen: Fischer im Papyrusboot, Bauer mit Hacke; Pflanzen: Papyrus, Lotos, Schilf, Palme.
### Station 2 – Ein Pharao, zwei Länder (ca. 3100–2650 v. Chr.)
Zweigeteilte Bühne: links Unterägypten (Delta, Papyrus, **rote Krone**), rechts Oberägypten (Lotos, **weiße Krone**). Laschen NORD/SÜD setzen die Kronen auf die Pharao-Figur, beide zusammen = **Doppelkrone**. DATUM-Regler: Narmer-Palette (um 3100) ↔ Hofstaat Djosers (um 2650) mit Stufenpyramide.
### Station 3 – Pyramiden von Gizeh (ca. 2600–2500 v. Chr.)
BAUEN!-Hebel (Pyramide wächst in Schichten, rückwärts spulbar), SCHNITT-Klappe (Querschnitt mit Königskammer, Großer Galerie, Schächten), SCHLITTEN-Faden (Steinblock auf Kufen, Helfer begießt den Sand). Sphinx, Arbeiter, Steinmetz, Baumeister, Ochsen, Arbeitersiedlung.
### Station 4 – Götter und Totengericht (ca. 2000–1700 v. Chr.; Lapislazuli/Gold/Schwarz)
Tempelhalle mit Götterreihe, große Waage (WAAGE-Schieber: Herz gegen Feder), TOR-Lasche (Tor der Unterwelt), BARKE-Faden (Sonnenbarke des Ra). Götter (alle antippbar), Ammit (niedlich, kein Schrecken).
### Station 5 – Mumienwerkstatt (ca. 1500–1100 v. Chr.; Karneolrot/Lehmbraun)
TAGE-Schieber (0–70 Tage, Feuchtigkeitsbalken sinkt), NATRON-Lasche (Salz aufstreuen, Partikel), KANOPEN-Lasche (vier Krüge öffnen). Einbalsamierer, Natron, Leinenbinden, Harze, Herzskarabäus. **Chemie-Schwerpunkt dieses Buches.** Der Körper wird nie gezeigt (eingewickelte Form unter Tuch auf der Bahre, würdevoll).
### Station 6 – Alltag, Schrift und Papyrus (Arbeiterdorf Deir el-Medina, ca. 1300–1100 v. Chr.; Lehmgelb/Terrakotta/Türkis)
Aufgeschnittenes Lehmziegelhaus: Dach (Schlafplatz), Wohnraum, Backstube, Schreibstube, Hof. SCHREIBEN-Schieber (Schreiber, Hieroglyphen leuchten auf), ZEICHEN-Lasche (Lautwerte), MAHLEN-Faden, SENET-Klappe (Brettspiel).
### Station 7 – Tal der Könige (ca. 1500–1200 v. Chr.; Karneol/Fels-Ocker/Gold/Nacht)
Felswände mit Grabeingängen, Totentempel der Hatschepsut (Terrassen), aufklappbare Grabkammer. TÜR-Lasche (versiegelte Grabtreppe), SCHÄTZE-Schieber (Schrein, Sarkophag, Goldmaske), TRAGEN-Hebel (drei geschachtelte Särge). Howard Carter 1922.
### Station 8 – Kleopatra, Rosetta-Stein, Finale (332 v. Chr. bis heute)
Links Alexandria (Leuchtturm, Bibliothek, Hafen, Schiffe), rechts ein Gelehrtenzimmer um 1822 (Rosetta-Stein, Lupe, Federkiel). 3-SPRACHEN-Schieber (Hieroglyphen/Demotisch/Griechisch), LEUCHTTURM-Lasche, FINALE-Hebel (Sonnenbarke fährt in einer Parade an allen Stationsfiguren vorbei). Käfer-Zähler.
Auf jeder Seite versteckt sich ein winziger Skarabäus (fertig: `skarabaeus.js`, ids `skarab1..9`).

## Inventar nach Gruppen
Spalten: **id** (exakt) · echte Größe · Teile/Besonderheiten. Alles, was nicht dasteht, entscheidest du; bei Unsicherheit lieber schlicht und sauber als überladen.

### Gruppe P – Menschen (`reg_people.js`, Kit: `src/art/animals/_eg_person.js`)
Baue **zuerst einen Baukasten** `_eg_person.js` (Profil-Mensch aus: Torso, Kopf mit Perücke/Kopfbedeckung, Schurz/Kleid, Arme, Beine; Optionen für Geschlecht, Kopfbedeckung, Kleidung, Schmuck, Requisit in der Hand, Pose). Dann die Figuren. **Der Baukasten wird von der Götter-Gruppe wiederverwendet (Tierköpfe auf Menschenkörpern), halte ihn sauber, dokumentiere die Optionen im Dateikopf und committe ihn früh.**
Teile je Figur: `body` (Rumpf, Kopf, Schurz/Kleid, Kopfbedeckung), `armA`/`armB` (Pivot Schulter), `legA`/`legB` (Pivot Hüfte; bei langem Kleid dürfen die Beine verdeckt sein, dann nur Gehbewegung des Kleides durch kleine Rotation).
| id | Größe | Hinweise |
|---|---|---|
| pharao | 1,70 m | `opts.crown`: 'weiss','rot','doppel','nemes','blau'; Kinnbart, Krummstab und Wedel (Geißel) in den Händen; Goldkragen, weißer Schurz; Gehpose + Standpose |
| tutanchamun | 1,60 m | junger König, Nemeskopftuch gestreift Blau/Gold, Goldkragen |
| hatschepsut | 1,65 m | weiblicher Pharao mit Nemes und falschem Bart, Schurz |
| ramses | 1,75 m | Blaue Krone (Khepresch), Standpose mit Speer oder Zepter |
| wesir | 1,70 m | langes Leinengewand, Stab, Perücke |
| schreiber | 1,60 m (sitzend 1,0) | `opts.pose`: 'stand' / 'sit' (im Schneidersitz, Papyrusrolle auf dem Knie); Arm `armA` beweglich (schreibt: `ranges.armA`) |
| baeckerin | 1,55 m | Frau mit Teigschale oder Brotbrett; armA bewegt (kneten) |
| braeuerin | 1,55 m | Frau mit Krug; Arm gießt |
| kind | 1,10 m | `opts.sex`: 'm' (Jugendlocke) / 'w'; hält Spielzeug |
| arbeiter | 1,65 m | zieht an einem Seil nach vorn gebeugt (Gehzyklus mit Zugpose); bezahlter Arbeiter, einfacher Schurz |
| steinmetz | 1,65 m | kniet/steht, Holzschlägel und Kupfermeißel, armA schlägt (Range) |
| baumeister | 1,70 m | Messleine/Stab, Schurz, Kopftuch |
| bauer | 1,65 m | Hacke, armA/armB schwingen, Strohhut optional |
| fischer | 1,65 m | steht im Boot, Speer oder Netz (armA wirft) |
| einbalsamierer | 1,75 m | Priester mit Anubis-Schakalmaske (Maske nur Kopf, Mensch darunter), armA beweglich (streut/gießt) |
| priester | 1,70 m | kahlköpfig, Leinenschurz, Leopardenfell optional |
| traeger | 1,65 m | trägt Tragestangen auf der Schulter (für den Sarg), Gehzyklus |
| carter | 1,75 m | Howard Carter 1922: Hut, Weste, Pinsel in der Hand, Profil, europäische Kleidung |
| champollion | 1,70 m | Gelehrter 1822: Gehrock, Federkiel, Profil |
| kleopatra | 1,60 m | Kleopatra VII.: Diadem mit Uräus, Lockenfrisur im hellenistischen Stil, langes Gewand, würdevoll (keine „Verführerin“) |
| gelehrter_sitzend | 1,1 m | Alternative zu Champollion am Schreibtisch (Pose 'sit', mit Lupe in `armA`) |

### Gruppe T – Tiere (`reg_animals.js`; `skarabaeus` und `skarab1..9` bleiben bestehen, nichts löschen)
| id | echte Größe | Teile/Besonderheiten |
|---|---|---|
| nilpferd | 4 m lang | `body`, `jaw` (großes Gähnen, Range −0.7), `legA/legB`; freundliches, rundes Gesicht, kleine Ohren, Augen über dem Wasser |
| krokodil | 4,5 m | Nilkrokodil, `body`, `jaw`, `tail` (schwingt), `legA/legB`; wenige einfache Zähne, freundlicher Ausdruck |
| ibis | 0,75 m | Heiliger Ibis: weißer Körper, schwarzer Kopf, langer gebogener Schnabel, `neck` (Pivot Schulter; Nicken), `legA/legB` |
| reiher | 1 m | Graureiher (Ähnlich Bennu-Vogel), `neck` (S-Kurve), `legA/legB` |
| falke | 0,4 m | sitzender Falke, `wing` (öffnet), `head` optional |
| katze | 0,55 m (mit Schwanz) | Hauskatze, sitzend und gehend (`opts.pose`), `tail`, `legA/legB`, Ohrenring Gold optional |
| ochse | 2,4 m | Rind, `body`, `legA/legB`, `tail`, `head`, Joch optional (`opts.yoke`), zieht Schlitten |
| esel | 1,4 m | `body`, `legA/legB`, `tail`, `neck` |
| pferd | 2,2 m | Streitwagenpferd mit Federbusch, Zaumzeug; `legA/legB`, `tail`, `neck` |
| fisch | 0,8 m | Nilbarsch/Tilapia (`opts.kind`: 'barsch','tilapia'), `tail` (schlängelt) |
| kobra | 0,4 m hoch | Uräus-Kobra, aufgerichtet, `body`, `head` (Haube weitet sich; Range) |
| schakal | 0,9 m | sitzend, Anubis-Tier |
| pavian | 0,8 m | sitzend, Thot-Tier |
| geier | 0,8 m | Geier (Nechbet), Flügel geöffnet für Krone |
| wasservogel | 0,4 m | Ente/Gans, `legA/legB`, `neck` |
| kuh | 1,5 m | Hathor-Kuh, mit Sonnenscheibe zwischen den Hörnern |

### Gruppe G – Götter (`reg_gods.js`, wird nach dem Personen-Baukasten gestartet, nutzt `_eg_person.js`)
ra (Falkenkopf, Sonnenscheibe mit Uräus), osiris (eingewickelt, grüne Haut, Atefkrone, Krummstab und Wedel), isis (Thron-Kopfschmuck), horus (Falkenkopf, Doppelkrone), anubis (Schakalkopf), thot (Ibiskopf, Schreibpalette), maat (Straußenfeder im Haar), hathor (Kuhohren, Sonnenscheibe), bastet (Katzenkopf), sobek (Krokodilkopf), ammit (Mischwesen aus Krokodil/Löwe/Nilpferd, bewusst niedlich-papierhaft), chepre (Skarabäuskopf), nut (Himmelsgöttin als langer Bogen mit Sternen, flaches Kulissenband, Länge 11 m). Alle ca. 1,7–2,2 m, Standpose (+ Gehpose).

### Gruppe S1 – Landschaft, Pyramiden, Pflanzen (`reg_land.js`)
| id | Größe | Hinweise |
|---|---|---|
| pyramide_gizeh | 3 Pyramiden, ca. 8 m breit | Cheops, Chephren, Mykerinos mit Kalksteinverkleidung (helle Spitze bei Chephren), wellige Wüste davor |
| pyramide_cheops | 5 m hoch | Einzelne große Pyramide, Quader-Struktur, Licht/Schatten-Seite |
| pyramide_bau | 5 m hoch | Parts `schicht0 … schicht11` (nach oben kleiner), Seite zeigt Quader; Seite blendet je nach Hebelwert Schichten ein (z-Reihenfolge von unten nach oben) |
| pyramide_schnitt | 4,5 m | Querschnitt: Königskammer, Große Galerie, Schächte, Königinnenkammer, Gänge; gut beschriftbar durch Farben |
| stufenpyramide | 3,5 m | Djoser in Sakkara, sechs Stufen |
| sphinx | 6 m lang | von der Seite, Löwenkörper, Königskopf mit Nemes |
| rampe | 6 m lang | Schräge Baurampe aus Lehm und Stein mit Seitenpfählen |
| steinbruch_wand | 6 m | Kalksteinwand mit Abbauspuren |
| felsental_tal | 11 m breit | Tal der Könige: Felswände, Eingänge, pyramidenförmiger Gipfel hinten |
| wuestenduene | 11 m breit, 1,2 m hoch | zwei Varianten `variant.seed` |
| nil_wasser | 11 m | Wasserstreifen mit hellen Wellen, Varianten dunkel/hell |
| feld_getreide | 5 m | Streifen mit Getreide in Wachstumsstufen `opts.stage` 0..1 (kahl → grün → goldgelb) |
| papyrus | 2,5 m | Papyruspflanze, Büschel mit Dolden (`variant.seed`) |
| lotus | 0,6 m | Lotosblüten (weiß/blau) mit Blättern (schwimmend) |
| dattelpalme | 4,5 m | mit Datteln (ergänzt die vorhandene `palm`) |
| sykomore | 4 m | Feigenbaum |
| oase | 4 m | kleine Wasserfläche mit Palmen (optional) |
Vorhandene generische Requisiten (nicht neu bauen): `palm`, `acacia`, `reeds`, `grass_tuft`, `bush`, `boulder`, `cloud_a`, `cloud_b`, `sun_disc`, `wave_strip`, `mesa_red`, `cliff_layers`.

### Gruppe S2 – Bauwerke, Schiffe, Innenräume (`reg_arch.js`)
| id | Größe | Hinweise |
|---|---|---|
| obelisk | 4 m | Granitnadel mit goldenem Pyramidion, Zierzeichen |
| tempel_pylon | 5 m | Doppelturm-Tor mit Fahnenmasten, bemalte Reliefs (Zierde) |
| saeule_papyrus | 3,5 m | Papyrusbündelsäule, bemalt; Reihe über `len` |
| saeule_lotus | 3,5 m | Lotosknospensäule |
| tempelhalle_wand | 11 m breit, 5 m hoch | Innenwand mit bemaltem Götterfries und Sternendecke-Band, Lapislazuli/Gold/Schwarz (Hintergrund Station 4) |
| mastaba | 2,5 m | flaches Bankgrab |
| lehmhaus | 11 m breit | aufgeschnittenes zweistöckiges Lehmziegelhaus mit Dach, Wohnraum, Backstube, Schreibstube (leere Räume, Möbel kommen von Gruppe O3); Parts `dach`, `wohnraum`, `backstube`, `schreibstube`, `hof` einzeln ansprechbar |
| werkstatt_wand | 11 m breit | Hintergrund der Mumienwerkstatt: Lehmwand, Regale mit Krügen, Öffnung ins Licht, Karneolrot/Lehm |
| grabtreppe | 3 m | Treppe zum versiegelten Grabeingang, Part `tuer` (Pivot unten, öffnet nach vorn) |
| totentempel_hatschepsut | 11 m | Terrassentempel Deir el-Bahari mit Säulengängen vor der Felswand |
| abu_simbel | 5 m | Felsfassade mit vier Kolossalfiguren (Teaser für Zeitfenster) |
| leuchtturm_pharos | 5,5 m | Leuchtturm von Alexandria, dreistufig, Feuerschale oben (Part `feuer` leer, Seite setzt Licht) |
| bibliothek_alexandria | 5 m | Säulenhalle mit Giebel |
| hafen_kulisse | 11 m | Kaianlage, Poller, Stufen, Wasser davor |
| gelehrtenzimmer | 11 m | Zimmer um 1822: Schreibtisch, Bücherregal, Fenster mit Licht, Globus (Parts `tisch`, `regal`, `fenster`) |
| schilfboot | 3,5 m | Papyrusboot mit hochgezogenem Bug und Heck |
| segelboot_nil | 4 m | Nilschiff mit Segel (`sail` Part: wölbt sich) |
| sonnenbarke | 3 m | Sonnenbarke des Ra: goldener Rumpf, Sonnenscheibe, Ruder |
| segelschiff_griechisch | 4 m | Handelsschiff Alexandria |
| schaduf | 3 m | Schwengelbrunnen: `body` (Pfosten), `arm` (Pivot am Pfosten, Range ±0.5), `eimer` (an Seil) |
| nilometer | 3 m | Treppenbrunnen mit Marken am Rand, Part `marken` |
| ziegelmauer | 6 m | Lehmziegelmauer, Varianten |

### Gruppe O1 – Königs- und Grabschätze, Kronen (`reg_royal.js`)
| id | Größe | Hinweise |
|---|---|---|
| weisse_krone | 0,5 m | Hedjet |
| rote_krone | 0,5 m | Deschret mit Spirale |
| doppelkrone | 0,8 m | Pschent |
| nemes | 0,4 m | gestreiftes Kopftuch mit Uräus |
| blaue_krone | 0,4 m | Khepresch |
| krummstab_wedel | 0,9 m | Heqa-Szepter und Nechacha-Wedel gekreuzt |
| tutmaske | 0,54 m | Goldmaske des Tutanchamun: Gold, Lapislazuli-Streifen, Uräus, Geier und Kobra, Hals-Kragen; würdevoll, nicht gruselig; frontal oder halbprofil |
| thron_tut | 1,0 m | goldener Thron mit Löwenfüßen, Rücklehne mit Königs-Szene (Zierde) |
| schrein_gold | 3 m | vergoldeter Schrein mit Doppeltür (`door` Parts) |
| sarkophag_gold | 2,0 m | anthropoider Sarg (Gold/Lapis) – Deckel `lid` |
| sarkophag_stein | 2,6 m | Quarzit-Steinsarkophag |
| streitwagen | 2 m | zweirädrig, Gold, Räder drehen (`radA`, `radB`) |
| dolch_eisen | 0,35 m | Eisendolch, Goldgriff |
| truhe | 0,8 m | bemalte Truhe mit Deckel `lid` |
| narmer_palette | 0,64 m | Palette des Narmer (nur Siegel-Motiv, ohne Gewalt: Doppelkrone, Stierkopf-Zierden, Hathorköpfe) |
| fackel | 0,6 m | Fackel mit Flammenfläche `flamme` |
| ushabti | 0,3 m | Totenfigürchen |
| kartusche | 0,6 m | Namensring mit Zierzeichen |

### Gruppe O2 – Totengericht und Mumifizierung (`reg_ritual.js`)
| id | Größe | Hinweise |
|---|---|---|
| waage | 2,2 m | Waage des Totengerichts: Part `staender`, `balken` (Pivot Mitte, Range ±0.5 rad), `schale_herz`, `schale_feder` (Aufhängung folgt über Kinematik der Seite: hänge sie so, dass `schale_*` mit `balken` mitkippt oder separat Pivot an den Balkenenden bereitstellen) |
| herz | 0,2 m | Herz (Gefäß, Hieroglyphen-Form „ib“), freundlich stilisiert |
| feder_maat | 0,4 m | Straußenfeder |
| tor_unterwelt | 4,5 m | Tor mit zwei Flügeln (`flA`, `flB`, Pivot an den Außenkanten, öffnen nach außen), Lapis/Gold |
| kanope_mensch / kanope_pavian / kanope_schakal / kanope_falke | 0,5 m | die vier Horus-Söhne (Amset, Hapi, Duamutef, Kebehsenuef), Parts `body`, `deckel` (Pivot unten am Deckel, hebt sich) |
| natron_haufen | 1 m | weißer Salzhaufen mit Kristallglanz |
| natron_schale | 0,5 m | Schale mit Salz |
| mumie_bahre | 2 m | eingewickelte Form mit Leinen unter Tuch auf löwenfüßiger Bahre, würdevoll, keine Haut, kein Gesicht außer Goldmaske-Andeutung |
| leinenbahn | 2 m | hängende Leinenbahnen auf Leine |
| harzkrug | 0,4 m | Salb- und Harzkrüge (`variant`) |
| amulett_herzskarabaeus | 0,12 m | Herzskarabäus mit Goldrahmen |
| udjat | 0,25 m | Horusauge |
| ankh | 0,3 m | Anch |
| djed | 0,4 m | Djed-Pfeiler |

### Gruppe O3 – Alltag, Schrift, Werkzeug, Rosetta (`reg_daily.js`)
| id | Größe | Hinweise |
|---|---|---|
| papyrusrolle | 0,4 m | Rolle mit teilweise abgerolltem Blatt, Tinte |
| schreibpalette | 0,35 m | Palette mit zwei Tintennäpfen (schwarz, rot) und Binsenpinsel |
| glyphe | 0,5 m | Spec-Fabrik: `make({ g: 'eule' })`, glyph ids: eule (m), wasser (n), mund (r), schilfblatt (i), geier (a), fuss (b), kueken (w), korb (k), strick (h), schlange (dsch), sonne (ra), wellen; je Glyphe als farbige Papierplatte, Registrierung als `glyphe_eule`, `glyphe_wasser`, … |
| bierkrug | 0,3 m | |
| brotlaib | 0,25 m | verschiedene Formen (`variant`) |
| brotkorb | 0,4 m | mit Broten |
| ofen | 1 m | Lehmbackofen mit Flamme (`flamme` Part) |
| mahlstein | 0,9 m | Part `unten`, `laeufer` (Pivot, Range ±0.3, Hin- und Herbewegung durch Seite) |
| senet_brett | 0,6 m | Brettspiel mit 30 Feldern, Spielsteine (flach, für Klappe) |
| spielzeug | 0,3 m | Holztier mit beweglichem Kiefer (`variant`), Kreisel |
| amphore | 0,6 m | Tonkrug |
| ostrakon | 0,3 m | beschriftete Scherbe |
| kupfermeissel | 0,35 m | |
| holzschlaegel | 0,35 m | |
| messleine | 0,6 m | Messschnur mit Knoten |
| steinblock | 1 m | Kalksteinquader mit Spuren |
| schlitten | 2 m | Holzschlitten mit Steinblock, Seil (`seil` Part) |
| hacke | 0,8 m | |
| netz | 1 m | Fischernetz |
| rosetta_stein | 1,1 m | dunkler Stein mit drei Schriftbändern: Parts `band_hiero` (Hieroglyphen), `band_demot` (Demotisch), `band_greek` (Griechisch), jeweils nur aus Zierzeichen, Rest ohne Text; Hieroglyphen-Band mit dem Namen Ptolemaios in Kartusche (korrekte Zeichen p, t, o, l, m, i, s) |

## Abnahme (Checkliste je Figur/Requisit)
1. Sofort erkennbar (Schlüsselmerkmale), auch klein. 2. Freundlich, würdevoll, hübsch, farblich stimmig. 3. Pivot-/Gelenktest mit `pose=` ohne Lücken. 4. `anchors` und `meta.ranges` gesetzt. 5. In deiner `reg_<gruppe>.js` registriert, Galerie baut ohne Fehler.
Am Ende: ein Gesamt-PNG `$OUT/final.png` (alle deine Ids) und eine kurze Liste: id → Teile (+ranges) → Optionen/Posen/Besonderheiten. Abgabe = Commits im Worktree-Branch + diese Liste als Antwort.
