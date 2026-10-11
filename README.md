# Das große Ägypten-Popup-Buch

Ein 3D-Popup-Buch im Browser: neun Stationen vom Nil und der Einigung der Beiden Länder über die Pyramiden von Gizeh, Götter, Mumienwerkstatt, Alltag und das Tal der Könige bis zu Kleopatra und dem Stein von Rosette. Für Klasse 5/6, mit Erzählstimme, Info-Karten und Arbeitsblatt-Export. Die Engine stammt aus dem „Großen Dinosaurier-Popup-Buch“, Inhalt und Kunst sind neu.

- **Online ansehen** (nach dem Einschalten von GitHub Pages, siehe `tools/publish-pages.sh`): https://wilski54.github.io/Aegypten/
- **Eine Datei**: `dist/index.html` (alles eingebettet). Doppelklick genügt, auch von der Festplatte (`file://`) und auf dem iPad (Safari).
- **Keine externen Anfragen**: keine Bibliotheken, Schriften, Bilder oder Töne aus dem Netz. Keine Cookies, kein Tracking. Alle Grafiken, Texturen und Klänge entstehen im Code; die Erzählstimme steckt als MP3 in der Datei.
- **Gespeichert wird nur im Browser** (`localStorage`, nur auf diesem Gerät): Lautstärke, Ton an/aus, Ruhiger Modus, Untertitel, Auto-Vorlesen und welche versteckten Sonnenkäfer du gefunden hast. Alles ist mit Rückfall gebaut; ohne Speicher läuft das Buch trotzdem.

## Bedienung

| Was | Wie |
|---|---|
| Buch öffnen | Auf den Deckel tippen |
| Umblättern | Die Seite irgendwo anfassen und zur Buchmitte ziehen, oder an der umgeknickten Ecke ziehen, Pfeile unten, die neun Farbpunkte, Tasten ← und → |
| Laschen und Schieber | Bunte Laschen anfassen und ziehen. Manche springen zurück, manche bleiben stehen |
| Figuren und Gegenstände | Antippen: sie reagieren und zeigen eine Info-Karte (mit Größenvergleich zum Menschen, wo sinnvoll). Der Lautsprecher-Knopf liest die Karte vor |
| Umschauen | Auf freier Fläche ziehen: Kamera schwenkt, nach ein paar Sekunden kehrt sie zurück |
| Lesen: heranzoomen und verschieben | Zwei Finger: spreizen zum Zoomen, beide Finger gemeinsam bewegen zum Verschieben. Maus: Mausrad zoomt, Umschalt + Ziehen oder rechte Taste verschiebt. **Hand-Knopf** (Taste **V**): ein Finger verschiebt statt zu blättern. **Haus-Knopf** (Taste **0**): Ansicht zurücksetzen |
| Zeitfenster (Zeitrad) | Auf der ersten Seite zeigt ein frei auf dem Tisch schwebendes Bild neben dem Buch zur Stellung des Zeigers passende Szenen (12 Stück von 3300 bis 30 v. Chr.). Pfeile und Punkte im Fenster springen zur nächsten Szene |
| Leseansicht | Auge-Knopf oder Taste **R**: Blick von oben |
| Wetter | Wolken-Knopf oder Taste **W** |
| Ton | Lautsprecher-Knopf oder Taste **M** |
| Vorlesen | „Vorlesen“ neben der Navigation liest die Seiteneinführung. Standardmäßig spricht die Stimme jede Seite kurz von selbst (abschaltbar) |
| Hilfe | Fragezeichen oder Taste **?** / **H** |

Adresszusatz `?tier=low`, `?tier=med` oder `?tier=high` erzwingt eine Qualitätsstufe (sonst automatisch).

## Die Stationen

| # | Station | Zeit | Zum Anfassen |
|---|---|---|---|
| 0 | Deckel, Willkommen, Zeitrad der Sonne | 3300 bis 30 v. Chr. | Zeiger drehen, SONNE!, BARKE |
| 1 | Das Geschenk des Nil | bis ca. 3100 v. Chr. | FLUT!, NILOMETER, SCHÖPFEN |
| 2 | Ein Pharao, zwei Länder | ca. 3100 bis 2650 v. Chr. | NORD, SÜD (= Doppelkrone), DATUM |
| 3 | Die Pyramiden von Gizeh | ca. 2600 bis 2500 v. Chr. | BAUEN!, SCHNITT, SCHLITTEN |
| 4 | Götter und das Totengericht | ca. 2000 bis 1700 v. Chr. | WAAGE, TOR, BARKE |
| 5 | Die Mumienwerkstatt (Chemie-Schwerpunkt) | ca. 1500 bis 1100 v. Chr. | TAGE, NATRON, KANOPEN |
| 6 | Alltag, Schrift und Papyrus | ca. 1300 bis 1100 v. Chr. | SCHREIBEN, ZEICHEN, MAHLEN, SENET |
| 7 | Tal der Könige und Tutanchamun | ca. 1500 bis 1200 v. Chr. | TÜR, SCHÄTZE, TRAGEN |
| 8 | Kleopatra, Rosetta-Stein, Finale | 332 v. Chr. bis heute | 3 SPRACHEN, LEUCHTTURM, FINALE |

**Such sie!** Auf jeder Seite versteckt sich ein winziger Sonnenkäfer (Skarabäus), insgesamt neun. Der Zähler oben rechts zeigt, wie viele gefunden sind; danach öffnet sich die Käfersammlung.

## Für den Unterricht

- `texte.json`: alle Seiten- und Kartentexte mit Zeitangaben, Stichworten und **Fragen für Arbeitsblätter** (`fragenFuerArbeitsblatt`), dazu Ideen für Aufgaben (Zeitstrahl, Pyramiden-Rechnung, Natron-Versuch „Apfel mumifizieren“, Hieroglyphen, Totengericht). Neu erzeugen mit `node tools/export-texte.mjs`.
- `facts.md`: jede wichtige Zahl mit Quelle und Prüfstand („geprüft“, „Fachwissen“). **Bitte die Punkte mit „Fachwissen“ vor dem Unterricht gegenlesen.**
- Sprache: einfache, kurze Sätze, Du-Ansprache; Aussprachehilfen auf den Karten („sprich: …“). Glaube wird als „die Ägypter glaubten“ beschrieben. Mumien werden als Handwerk erklärt, der Körper wird nie gezeigt.
- Ruhiger Modus (Hilfe-Dialog, auch bei „Bewegung reduzieren“ im Betriebssystem automatisch): weniger Wackeln, Partikel und Leuchten.
- Lichtschutz: Kein Blitz, der in unter 150 ms ansteigt; Feuerschein und Fackeln flackern höchstens mit 3 Hz.

## Technik

- **three.js 0.186** (MIT), **clipper-lib** (Boost-Lizenz, Papierschnitt-Konturen), gebündelt mit **esbuild** zu einer einzigen HTML-Datei.
- **Kunst**: alle Figuren, Kulissen und Gegenstände sind Code (Papierschnitt-DSL in `src/art`), nichts ist ein Bild. Die Hieroglyphen-Platten sind vereinfacht nach der Gardiner-Liste gezeichnet.
- **Ton**: Web Audio, komplett synthetisch (Atmosphären, Musikbetten mit Harfe, Laute, Ney, Rahmentrommel und Sistrum, Tierstimmen, Geräusche). Siehe `docs/AUDIO.md`.
- **Erzählstimme**: Neuro-TTS, offline erzeugt mit Piper „de_DE-thorsten-medium“ (Stimme: Thorsten Müller, CC0) über `sherpa-onnx`, als Base64-MP3 eingebettet (24 kbps Mono). Ohne passenden Clip fällt das Buch auf die Sprachausgabe des Geräts zurück.

### Ordnerstruktur

```
dist/index.html          das fertige Buch (eine Datei)
src/main.js              App: Eingabe, Navigation, UI-Anbindung, Hauptschleife
src/engine/              Buch, Seiten, Pop-ups, Kamera, Licht, Partikel, Wetter, Papierschnitt
src/pages/p0…p8.js       die neun Stationen (+ _eg_*-Hilfsdateien)
src/art/                 Figuren, Kulissen, Gegenstände (reg_<gruppe>.js = Registry je Gruppe)
src/audio/               Klangmaschine (Szenen, Stimmen, Musik, Erzählung)
src/ui/                  Oberfläche, Zeitfenster (zeitszenen.js)
src/data/                Texte: pages.de.js, animals.de.js + cards_a/b/c.de.js, speech.js
assets/narration/        Erzähl-MP3s + Manifest + Satzzeiten + Lizenz
tools/                   Build-, Test- und Export-Skripte
docs/                    EGYPT_BRIEF.md, EGYPT_PAGES.md, ART_GUIDE.md, PAGE_GUIDE.md, AUDIO.md
facts.md, texte.json     Faktenbasis und Textexport
```

### Bauen und Testen

```bash
npm install
node build.mjs --main            # Produktion -> dist/index.html
node build.mjs --main --dev      # Entwicklung (nicht minifiziert)
node build.mjs --gallery --out=/tmp/gal.html && node tools/gallery.mjs /tmp/sheet.png html=/tmp/gal.html ids=pharao,krokodil cols=2   # Figuren ansehen
node tools/walk.mjs              # alle Stationen fotografieren
node tools/net-check.mjs         # keine externen Anfragen, keine Cookies
node tools/audio-check.mjs       # Pegelprüfung der Klangmaschine
node tools/speech-dump.mjs && python3 tools/make-narration.py --kbps 24   # Erzählstimme neu erzeugen
```

## Bekannte Grenzen (ehrlich)

- Nicht auf einem echten iPad getestet: alle Tests liefen in Chromium mit Software-WebGL. Bildrate und Touch-Gefühl sind unbekannt.
- Der **Klang wurde nicht gehört**, nur über Messwerte und Spektren abgesichert (Pegel, Clipping, Brummen). Bitte probehören; Hinweise dazu in `docs/AUDIO.md`.
- Die Hieroglyphen sind nicht von einer Ägyptologin / einem Ägyptologen geprüft.
- Einige Szenen sind klein oder leer wirkend (z. B. Station 2 im Home-Zoom); Feintuning folgt.

## Lizenzen

- **Code und im Code erzeugte Kunst:** MIT (`LICENSE`).
- **Texte, Karten, Faktenbasis, Dokumentation:** CC BY-SA 4.0 (`LICENSE-CONTENT`). Bei Weitergabe bitte „Das große Ägypten-Popup-Buch von Stephan Wilski“ nennen.
- **Erzählstimme:** Piper „thorsten-medium“, CC0 (Thorsten Müller), siehe `assets/narration/LICENSE.txt`.
- **Bestandteile von Dritten** (three.js MIT, clipper-lib Boost, …): siehe `NOTICE.md`.
