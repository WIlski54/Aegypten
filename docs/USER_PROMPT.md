

# Prompt: Dinosaurier-Popup-Buch durch die Erdzeitalter
 · 
Das ist ein ausführlicher Prompt für ein 3D-Popup-Buch im Browser: neun Stationen von der Trias bis zu den ersten Hominiden, mit Zieh-Laschen, Effekten und Sound komplett aus Code. Ab „Prompt 1“ kannst du alles kopieren und weiterbearbeiten; Stellen mit [ANPASSEN] sind Entscheidungen, die bei dir liegen.

## Referenz: Was in den Videos zu sehen ist
Beide Aufnahmen zeigen dasselbe Ergebnis: „The Dinosaur Pop-Up Book“, eine Browser-Seite, die ein KI-Modell in einem YouTube-Vergleichstest gebaut hat. Zu sehen sind drei der neun Seiten.
- 
**Aufbau:** Aufgeschlagenes Buch auf dunklem Holztisch, perspektivische 3D-Ansicht von leicht oben. Unten eine Pillenleiste mit Pfeilen und neun farbigen Punkten; ein Tooltip nennt den Kapitelnamen (z. B. „The Sky“).
- 
**Papier-Look:** Alles wirkt wie Scherenschnitt. Kulissen stehen in mehreren Ebenen mit welliger Oberkante, Figuren sind aufgerichtete Papierformen mit weißem Schnittrand, dazu weiche Schatten und Papiertextur.
- 
**Gesehene Seiten:** (2) „The Dawn of the Dinosaurs“ mit roter Wüste, glühender Sonne, Coelophysis, Plateosaurus und Nest. (3) „Giants of the Jurassic“ mit Nadelbäumen, Brachiosaurus mit verstellbarem Hals und Stegosaurus. (4) „Wings Over the Sea“ mit Pterosauriern an Fäden, Papier-Wellen und Klippe.
- 
**Mechaniken:** Aufgedruckte Zieh-Laschen und Schieberknöpfe („RUN!“, „Move the NECK“, „SWING!“, „FLAP!“, „DIVE!“). Ein Tier anklicken öffnet eine Info-Karte. Eine Seitenecke ziehen blättert um. Ziehen auf freier Fläche dreht die Kamera, Scrollen zoomt, danach springt die Ansicht zurück (Taste R).
- 
**Info-Karte:** Name, Aussprache und Namensbedeutung, Lebenszeit in Mio. Jahren mit Periode, Größe mit Mensch-Silhouette als Maßstab, Nahrung, ein rot markierter „Wow!“-Fakt und ein Schließen-Knopf.
- 
**Oberfläche:** Kleiner Titel oben links, drei runde Knöpfe oben rechts (vermutlich Leseansicht, Ton, Hilfe), eine Hinweiszeile unten, die zur Seite passt. Der Hilfe-Dialog nennt die Tasten ←/→, R, M (Ton) und Esc.
- 
**Technik:** Laut Hilfetext ist „every page, fold, dinosaur, texture and sound“ aus Code gemacht. Es gibt also keine Bild- und Audiodateien; der Dateipfad im Browser deutet auf eine einzelne index.html hin.
Grenzen meiner Auswertung: Ich sehe nur Bilder und habe den Ton nicht gehört, die Soundvorgaben unten sind daher mein eigener Entwurf. Alle Seiten, die in den Videos nicht vorkommen, habe ich selbst geplant.

## Stellschrauben: Was du ändern kannst
Diese Vorgaben habe ich im Prompt angenommen. Wenn du eine änderst, passe die markierte Stelle im Prompt an.
Thema
Vorgabe im Prompt
Alternative
Sprache
Deutsch, Du-Ansprache
Englisch oder zweisprachig
Zielgruppe
Sek I (Klasse 5–10), Faktenkarten auch für die Oberstufe
Grundschule oder nur Oberstufe
Geräte
iPad (Safari, Touch) und Desktop
nur Desktop
Technik
Three.js, eine einzelne index.html, alles aus Code
React Three Fiber, Babylon.js
Umfang
9 Stationen (Titelseite + 8 Doppelseiten)
6 kompakt oder 12
Ton
synthetisiert per Web Audio
echte CC0-Audiodateien
Deployment
optional Flask-Wrapper für GitHub und Coolify
rein statisch
Finale
ein Seitenpaar mit Zeitsprung-Schieber
zwei getrennte Seiten (Säugetiere, Hominiden)
Code-Kommentare
Englisch
Deutsch

## Prompt 1: Auftrag, Zielgruppe, Technik
Ab hier bis zum Abschnitt „Faktenbasis“ ist der Text für den Coding-Agenten gedacht.
Du bist Creative Developer (WebGL/Three.js), Paper-Engineer und Illustrator in einem. Baue „Das große Dinosaurier-Popup-Buch – Eine Reise durch die Erdzeitalter“: ein liebevoll gestaltetes, interaktives 3D-Popup-Buch für den Browser. Es soll sich anfühlen wie ein echtes, handgefertigtes Papierbuch, das jemand aufklappt, und man will jede Seite anfassen.

### Ziel und Gefühl
- 
Neun Stationen (Titelseite plus acht Doppelseiten) von der Trias über Jura und Kreide bis zum Beginn des Säugetierzeitalters.
- 
Die **letzte Seite** zeigt das beginnende Zeitalter der Säugetiere und das Auftauchen der ersten Hominiden.
- 
Warm, neugierig, liebevoll: Staunen statt Gruseln. Kein Blut, keine Kampfszenen mit Verletzungen.
- 
Wissenschaftlich sauber nach aktuellem Forschungsstand. Unsicheres wird ehrlich als unsicher benannt. Dinosaurier und Menschen haben sich nie getroffen; das Buch macht diese Zeitlücke sichtbar.

### Zielgruppe und Umgebung [ANPASSEN]
- 
Schülerinnen und Schüler der Sekundarstufe I (Klasse 5 und 6 an einer Gesamtschule. Jüngere können sich Texte vorlesen lassen, die Faktenkarten tragen auch die Oberstufe. Das Vorlesen mit einer natürlichen und freundlichen Stimme (Neuro-TTS)
- 
Läuft auf dem iPad (Safari, Touch) im Unterricht und am Desktop (Chrome, Firefox, Safari).
- 
Oberfläche und alle Texte auf Deutsch, Du-Ansprache.

### Technische Vorgaben
- 
Three.js in der aktuellen stabilen Version, lokal eingebunden, kein CDN. Quellcode modular in src/, Build mit esbuild zu **einer** selbstständigen dist/index.html (Three.js und Code inline). So läuft sie per Doppelklick (file://) und im Dateien-Browser des iPads.
- 
Alles entsteht aus Code: Geometrie, Texturen (Canvas 2D, SVG-Pfade, prozedurales Rauschen) und Sound (Web Audio). Keine Bild-, Audio- oder Font-Dateien, keine externen Anfragen, kein Tracking (DSGVO). Schrift: Systemschriften mit Serifen (Georgia, Palatino, serif).
- 
Pointer Events für Maus, Touch und Stift. Keine Funktion hängt allein am Hover.
- 
Optional [ANPASSEN]: eine kleine Flask-App (app.py, requirements.txt, Dockerfile), die dist/ ausliefert, damit ich das Projekt wie meine anderen per GitHub und Coolify deployen kann. Können wir nach dem lokalen Bau machen!

### Arbeitsweise
- 
Stelle höchstens drei Rückfragen, falls wirklich etwas unklar ist. Sonst triff Annahmen, nenne sie kurz und leg los.
- 
Arbeite in den Meilensteinen aus „Prompt 7“ und prüfe jeden Meilenstein selbst per Screenshot, bevor du weitermachst.

## Prompt 2: Buch-Engine – Papier, Pop-up-Falten, Umblättern, Licht

### Szene
- 
Dunkler, rotbrauner Holztisch mit prozeduraler Maserung (Normal-Map) und leichter Vignette. Ein paar kleine Dinge liegen darauf (Kiesel, Blatt).
- 
Das Buch hat einen Einband mit Leinen- oder Ledertextur, sichtbare Seitenstapel links und rechts, einen Falz in der Mitte und echte Dicke. Es startet geschlossen; die Lasche „Öffne mich“ klappt den Einband auf.
- 
Kamera: Perspektive (FOV etwa 35–40°), leicht erhöht, „Leseansicht“. Ziehen lässt die Kamera orbitieren (begrenzt, gedämpft), Scrollen oder Pinch zoomt. Nach etwa 3 Sekunden Ruhe gleitet die Kamera zurück; Taste R oder der Auge-Knopf bringen sie sofort zurück.

### Papier-Look
- 
Jede Pop-up-Form ist dünnes Papier: extrudierte Shape (1–2 mm), weißer Schnittrand, leicht hellere Rückseite, Papierfasern als Bump und Rauschen, weiche Farbverläufe wie bei Gouache.
- 
Kulissen bestehen aus mehreren Ebenen hintereinander mit welliger oder gezackter Oberkante (Scherenschnitt-Tiefe).
- 
Farbwelt je Zeitalter: Trias Terrakotta, Ocker, Sonnengelb. Jura Smaragd, Moos, Himmelblau. Kreide Tiefblau, Türkis, Korallorange. Einschlag Glutrot, Aschegrau, Violett. Känozoikum Honiggold, Salbei, Abendrosa.
- 
Überschriften in tiefem Rot (#8B1E1E), Textkarten auf cremefarbenem Papier (#F3E6C8).

### Pop-up-Mechanik (mechanisch plausibel)
Baue einen Baukasten in src/engine, aus dem alle Seiten bestehen:
- 
**V-Falz (Kulisse):** Eine Wand richtet sich am Falz von 0° (flach) auf 90° auf.
- 
**Stehfigur:** Papierfigur mit Klebelasche am Fuß, die sich aufrichtet.
- 
**Box-Falz:** Felsen, Vulkan und Turm als gefaltete Quader.
- 
**Zug- und Schiebemechanik:** Laschen aus der Seite, Schieberknöpfe, Hebel und Drehscheiben (z. B. Wellen als gegeneinander verschobene Streifen).
- 
**Fadenfiguren:** Figuren an Fäden oder Drähten, etwa die Pterosaurier.
- 
**Klappen:** Fenster zum Aufklappen (Fossil, Gesteinsschicht).
- 
**Auffalten** beim Öffnen einer Doppelseite: gestaffelt von hinten nach vorn, mit gedämpftem Federmodell und leichtem Überschwingen, dazu Papierraschel-Sound.
- 
Vor dem Umblättern müssen alle Pop-ups vollständig flachgefaltet sein. Nichts darf durch Seite, Falz oder andere Elemente ragen (Kollisionsprüfung im Debug-Modus).

### Umblättern
- 
Seitenecke ziehen und loslassen: Die Seite biegt sich (Vertex-Shader oder Skelett-Biegung) mit Schwung, Schatten und sichtbarer Rückseite. Über Pfeiltasten, Pfeil-Knöpfe oder Punktleiste läuft eine kürzere Variante der Animation.

### Licht und Schatten
- 
Warmes Hauptlicht von links oben mit weichen Schatten (PCF-soft oder VSM). Papier wirft Schatten auf die Seite, Falze bekommen Kontaktschatten (Fake-AO).
- 
Jede Seite hat ihre eigene Lichtstimmung: Sonne, Dämmerung, Glut.

## Prompt 3: Bedienung – Laschen, Info-Karten, Navigation, Hilfe

### Tiere anklicken
- 
Antippen oder Anklicken „weckt“ ein Tier: eigene Animation (Kopf dreht sich, Maul öffnet sich, Hüpfer, Schwanz schwingt) und ein passender Ruf. Beim Seitenstart pulsiert jedes anklickbare Tier kurz als Hinweis, auf dem Desktop kommt ein Hover-Umriss dazu.
- 
Danach öffnet sich die **Info-Karte** als Papierkarte neben dem Tier (auf dem iPad von unten). Sie enthält:
- 
deutschen und wissenschaftlichen Namen, Aussprache („sprich: …“) und Bedeutung des Namens
- 
Lebte: Mio. Jahre plus Periode
- 
Größe: Länge, Gewicht und eine Silhouette neben einem Menschen (1,75 m) im richtigen Maßstab
- 
Nahrung und Fundort (Land)
- 
einen „Wow!“-Fakt, rot hervorgehoben, höchstens zwei Sätze
- 
Schließen per X, Esc oder Tippen daneben
- 
Alle Texte stammen aus **einer** Datendatei (src/data/animals.de.js), damit ich sie leicht korrigieren kann. Texte sind adressatengerecht und bieten Anschlussmöglichkeiten für ein späteres Arbeitsblatt.

### Laschen und Schieber
- 
Jede Seite hat ein bis zwei aufgedruckte Mechaniken mit Beschriftung (z. B. „RENN!“, „Halslänge“, „SCHWING!“). Sie lassen sich linear ziehen, mit Gummiband-Gefühl, Einrasten und einem tastbaren Klick-Geräusch. Beim Loslassen schnappt die Lasche zurück oder bleibt, je nach Mechanik.
- 
Die Hinweiszeile unten passt sich jeder Seite an, etwa: „Zieh die RENN!-Lasche • tippe ein Tier • zieh eine Seitenecke zum Umblättern“.

### Navigation
- 
Pillenleiste unten: Pfeile links und rechts, neun Punkte, farbcodiert nach Erdzeitalter, Tooltip mit Kapitelname. Die aktive Seite fällt nicht nur durch Farbe auf, sondern auch durch Größe und Ring.
- 
Oben links der kleine Buchtitel. Oben rechts drei runde Knöpfe: Leseansicht (Auge), Ton (Lautsprecher), Hilfe (?).
- 
Hilfe-Dialog „So liest man dieses Buch“: Seiten umblättern, Laschen ziehen, Tiere antippen, freie Fläche ziehen zum Umschauen, Scrollen oder Pinch zum Zoomen, Tasten ←/→, R (Leseansicht), M (Ton), Esc (Karte schließen). Letzter Satz: „Jede Seite, jede Falte, jedes Tier, jede Textur und jeder Ton in diesem Buch ist aus Code gemacht.“

### Zugänglichkeit
- 
Alle Bedienelemente sind per Tastatur erreichbar, mit sichtbarem Fokus und sinnvollen ARIA-Labels. Touch-Ziele sind mindestens 44 px groß.
- 
„Ruhiger Modus“, auch automatisch bei prefers-reduced-motion: weniger Kamerawackeln, keine Blitze, sanftere Übergänge.
- 
Textkontrast mindestens 4,5:1, Schrift in Karten mindestens 16 px.
- 
Jeder Ton hat eine visuelle Entsprechung (Symbol oder Beschriftung); nichts Wichtiges hängt allein am Ton.

## Prompt 4: Effekte und Sound

### Visuelle Effekte
Alle Effekte laufen über Qualitätsstufen (siehe Prompt 7).
- 
Schwebende Staubkörnchen im Lichtstrahl, je Seite angepasst: Pollen und Hitzeflimmern (Trias), feuchter Dunst (Jura), Gischt (Kreide), Asche und Glut (Einschlag), weiche Pollen im Gegenlicht (Känozoikum).
- 
Sonne mit weichem Glühen (Bloom nur leicht) und Lichtstrahlen. Wolken sind Papierscheiben, die sehr langsam driften.
- 
Wasser besteht aus geschichteten Papierwellen, die sich gegeneinander bewegen, mit Spritzer-Partikeln beim Eintauchen.
- 
Parallax: Beim Orbiten verschieben sich die Kulissenebenen sichtbar gegeneinander. Auf Geräten mit Bewegungssensor optional leichtes Neigen.
- 
Mikroanimationen im Leerlauf: Atmen, Blinzeln, Ohren- und Schwanzzucken. Das Papier „arbeitet“ nach dem Aufrichten kurz nach (leichtes Wippen).
- 
Seitenübergänge: ein kurzer Glanz auf dem Papier beim Umblättern, die Lichtstimmung blendet über.
- 
Besondere Momente sind der Einschlag (Seite 7) und der Zeitsprung (Seite 8), siehe dort.
- 
Photosensibilität: keine Blitzfolge über 3 Hz, Weißblitz höchstens 150 ms und im Ruhigen Modus abgeschwächt.

### Sound komplett per Web Audio
- 
Audio startet nach der ersten Berührung (iOS-Freigabe). Standard ist „an“ bei moderater Lautstärke (Master etwa 0,6, Kompressor und Limiter). M-Taste und Knopf schalten um, ein Lautstärkeregler sitzt im Hilfe-Dialog. Der Zustand darf in localStorage liegen (mit try/catch).
- 
**Papier und Mechanik:** Umblättern (gefiltertes Rauschen mit Bandpass-Sweep), Aufrichten (kurzes Knacken und Rascheln, gestaffelt), Lasche ziehen (Reibung, Tonhöhe folgt der Zugstrecke), Einrasten (weicher Klick), Karte öffnen und schließen (leises Papier).
- 
**Atmosphäre je Zeitalter** als Schleifen, die beim Umblättern überblenden: Trias trockener Wind und Zikaden. Jura feuchter Wald, Insektenchor, ferne tiefe Rufe. Kreide-Meer Brandung, Wind, Flugsaurier-Rufe. Kreide-Land dumpfes Grollen und Wind. Nest Rascheln und Piepsen. Känozoikum synthetische Vogelrufe, weicher Wind, später Savannengrillen.
- 
**Tierstimmen** (synthetisch, stilisiert): jedes Tier mit eigener Stimme aus FM- und subtraktiver Synthese mit Formantfiltern. Tiefe Brummlaute und Grollen statt Kino-Gebrüll, denn Krokodile und Vögel sind die nächsten lebenden Verwandten und die echten Rufe sind unbekannt (das sagt die Info-Karte offen). Ein Schalter „Kino-Brüllen“ liefert die dramatische Variante.
- 
**Musik** (sehr leise, generativ): zarte Spieluhr- und Celesta-Motive in Pentatonik, pro Zeitalter andere Klangfarbe und Tonart. Beim Einschlag Stille, im Finale warmes Pad mit Flöte.
- 
Struktur in src/audio: ein AudioContext, getrennte Busse (Musik, Atmo, Effekte), Voice-Pooling, Rampen auf allen Gains gegen Knacken, sauberes Stoppen beim Seitenwechsel.
- 
Als Einstieg spricht eine Erzählstimme (Neuro-TTS) einen kurzen Einführungstext für jede Seite.

## Prompt 5: Die Seiten 0 bis 7 im Detail
**Roter Faden „Versteckte Säuger“:** Auf den Seiten 1, 2, 5, 6 und 7 versteckt sich je ein winziges frühes Säugetier, schwer zu finden. Antippen zeigt eine Mini-Karte, ein Zähler (z. B. 3/5) wächst, auf der letzten Seite erscheinen alle Gefundenen als „Familienalbum“. Wichtig: Es sind frühe Säugetiere oder Seitenzweige, keine gesicherten direkten Vorfahren des Menschen, und die Karten sagen das.

### Seite 0: Titel und Erduhr
- 
**Szene:** Geschlossenes Buch auf dem Tisch, goldener Titel, Lasche „Öffne mich“. Die erste Doppelseite zeigt links einen Willkommenstext in drei Sätzen, rechts ein Pop-up-Zifferblatt „Die Erduhr“.
- 
**Erduhr:** 4,54 Mrd. Jahre sind auf 24 Stunden gepresst. Per Lasche lässt sich der Zeiger drehen. Marken: Dinosaurier etwa 22:47 bis 23:39 Uhr, erste Säuger etwa 22:55 Uhr, Homo sapiens erst etwa 6 Sekunden vor Mitternacht. Berechne alle Werte im Code aus den Jahreszahlen.
- 
**Ton:** Uhrticken, das beim Drehen schneller wird, und ein weicher Gong bei Mitternacht.

### Seite 1: Trias – „Morgendämmerung der Dinosaurier“ (ca. 252–201 Mio. Jahre)
- 
**Szene:** Heiße Wüste mit roten Felsmesas, glühende Sonne mit Strahlen, Schachtelhalme, Farne und Palmfarne. Eine kleine Klappe „Pangaea“ zeigt eine Weltkarte mit nur einem Kontinent.
- 
**Tiere und Karten:** Coelophysis (Rudel, ca. 216–203 Mio. Jahre, etwa 3 m lang, rund 20 kg), Plateosaurus (ca. 214–204 Mio. Jahre, Funde u. a. in Trossingen und Halberstadt), kleines Extra: Eoraptor (ca. 231 Mio. Jahre, Argentinien).
- 
**Mechanik:** Lasche „RENN!“ lässt das Coelophysis-Rudel über einen Pfad flitzen, mit Staubspur.
- 
**Ton:** Trockener Wind, Zikaden, Getrappel des Rudels.
- 
**Versteckter Säuger:** Morganucodon (spitzmausgroß, ca. 205 Mio. Jahre) unter einem Farnblatt.

### Seite 2: Jura-Wald – „Riesen des Jura“ (ca. 201–145 Mio. Jahre)
- 
**Szene:** Hohe Nadelbäume und Palmfarne, Dunst, Vulkanrauch im Hintergrund, ein kleiner Fluss.
- 
**Tiere und Karten:** Brachiosaurus beziehungsweise Giraffatitan (das Skelett im Museum für Naturkunde Berlin stammt aus Tansania), Stegosaurus (ca. 155–150 Mio. Jahre, etwa 9 m, Schwanzstacheln), Allosaurus (lugt hinter einem Baumstamm hervor).
- 
**Mechanik:** Schieber „Halslänge“ reckt den Hals in die Baumkronen, Blätter rascheln. Lasche „SCHWING!“ lässt den Stegosaurus-Schwanz schwingen, der Allosaurus weicht zurück.
- 
**Ton:** Feuchter Wald, tiefes Hornen des Sauropoden, dumpfe Schritte (Sub-Bass), Insektenchor.
- 
**Versteckter Säuger:** Castorocauda (biberähnlich, schwimmend, ca. 164 Mio. Jahre) am Flussufer.

### Seite 3: Jura-Lagune – „Das Wunder von Solnhofen“ (ca. 150 Mio. Jahre)
- 
**Szene:** Tropische Lagune mit Kalkschlamm, Inseln mit Gebüsch, Wolkenhimmel.
- 
**Tiere und Karten:** Archaeopteryx (Urvogel, etwa 50 cm), Compsognathus (huhngroß), Rhamphorhynchus (Flugsaurier mit langem Schwanz), Pfeilschwanzkrebs. Im tieferen Wasser ein Ichthyosaurier (z. B. Ophthalmosaurus).
- 
**Mechanik:** Lasche „FLATTER!“ lässt Archaeopteryx flattern und gleiten. Der dreistufige Schieber „Zeit vergeht“ zeigt Fossilbildung: Das Tier sinkt in den Kalkschlamm, Schichten legen sich darüber, dann klappt ein Fenster auf und eine Steinplatte mit perfektem Fossil erscheint. Die Karte erklärt die Fossilisation einfach chemisch: Kalkschlamm, sauerstoffarmer Boden, schnelle Einbettung, Mineralisierung.
- 
**Ton:** Sanftes Plätschern, leises Flügelschlagen, beim Fossil ein „Klack“ mit kurzem Hall.
- 
**Besonderheit:** Ein Wink nach Bayern, denn die Funde stammen aus Deutschland.

### Seite 4: Kreide-Meer – „Flügel über dem Meer“
- 
**Szene:** Steilküste aus Holzschichten, Meer aus Papierwellen, Wolken und Sonne.
- 
**Tiere und Karten:** Pteranodon (Spannweite etwa 6–7 m), Elasmosaurus (sehr langer Hals, rund 10 m Gesamtlänge), Mosasaurus. Alle drei sind keine Dinosaurier, die Karten nennen sie „Cousins“.
- 
**Mechanik:** Laschen „FLATTER!“ und „STURZ!“: Pteranodon schlägt die Flügel und taucht an Fäden nach einem Fisch. Schieber „Periskop“: Elasmosaurus hebt den Hals aus dem Wasser. Ein Klick auf die Wellen lässt den Mosasaurus mit Spritzern hervorschnellen.
- 
**Ton:** Brandung, Wind, stilisierte Rufe, Platschen, ein tiefes Wasser-„Whoosh“.

### Seite 5: Spätkreide an Land – „Könige der Kreide“ (ca. 68–66 Mio. Jahre, Nordamerika)
- 
**Szene:** Auenlandschaft mit Nadelbäumen, Magnolien und Farnen, Flussdelta, Wolken im Westen.
- 
**Tiere und Karten:** Tyrannosaurus rex (etwa 12 m), Triceratops (etwa 8–9 m), Ankylosaurus (Schwanzkeule). Wow-Fakt beim T. rex: Er lebte zeitlich näher an uns als am Stegosaurus, zwischen beiden liegen etwa 84 Mio. Jahre.
- 
**Mechanik:** Lasche „BEISS!“: Der Kiefer des T. rex klappt zu, er beißt in einen Baumstamm, Splitter fliegen. Schieber „Kopf runter!“ senkt die Triceratops-Hörner. Der Ankylosaurus schwingt seine Keule.
- 
**Ton:** Sub-Bass-Schritte mit minimalem Bodenbeben, tiefes Grollen, Holzkrachen.
- 
**Versteckter Säuger:** Didelphodon (beutelrattenartig, kräftiger Biss).

### Seite 6: Nest – „Dino-Babys“ (ca. 76–74 Mio. Jahre, Montana)
- 
**Szene:** Nistkolonie auf einem sandigen Hügel, Nester mit Eiern, tiefstehende Sonne, Farne.
- 
**Tiere und Karten:** Maiasaura („gute Mutter-Echse“) mit Jungtieren, Oviraptor (brütet auf einem Gelege, Federn breit). Der Name Oviraptor bedeutet „Eierdieb“, zu Unrecht, denn er brütete die eigenen Eier. Dass Maiasaura-Jungtiere eine Weile im Nest blieben, gilt als wahrscheinlich, ist aber diskutiert; die Karte sagt das.
- 
**Mechanik:** Lasche „SCHLÜPFE!“: Die Eier bekommen Risse, Papierschalen klappen auf, die Babys schlüpfen und piepsen, die Mutter senkt den Kopf. Schieber „Sonnenuntergang“ lässt das Licht wandern, die Babys kuscheln sich an.
- 
**Ton:** Knacken, Piepsen (hohe Sinus-Blips mit Vibrato), warmes tiefes Brummen.
- 
**Versteckter Säuger:** ein Vielhöckerzähner (Multituberculata, nagetierähnlich).

### Seite 7: Einschlag – „Der Tag, an dem der Himmel brannte“ (ca. 66 Mio. Jahre)
- 
**Szene:** Links die Landschaft von Seite 5 im Abendlicht, rechts ein Himmel mit Asteroid. Hinten links glühen die Vulkane der Dekkan-Trappen. Dazu eine Klappe „Spurensuche“ (siehe unten).
- 
**Ablauf per Lasche „METEOR!“:** (1) Der Himmel wird unruhig, Vögel flattern auf. (2) Ein Feuerstreifen zieht herein (Partikelschweif). (3) Einschlag mit kurzem, weichem Lichtblitz (höchstens 150 ms), Druckwellenring auf dem Papier, die Seite wackelt (im Ruhigen Modus kaum). (4) Staubwolke, der Himmel wird rot, dann grau, die Kulissen dunkeln ab, die Tiere stehen als Scherenschnitt-Silhouetten. (5) Stille. (6) Das Licht kehrt zurück, Vögel fliegen aus dem Bild: „Eine Gruppe von Dinosauriern hat überlebt: die Vögel.“
- 
**Klappe „Spurensuche“:** Querschnitt durch eine Gesteinsfolge mit einer dünnen grauen Tonschicht und einer Lupe. Die Karte erklärt das Iridium (Ir, Z = 77): in der Erdkruste selten, in Meteoriten häufiger. Luis und Walter Alvarez und Kollegen fanden die Anreicherung 1980 an der Kreide-Paläogen-Grenze.
- 
**Fakten:** Einschlag vor etwa 66,0 Mio. Jahren, Krater bei Chicxulub (Yucatán) von etwa 180 km Durchmesser, Asteroid von etwa 10–15 km. Auch der Vulkanismus der Dekkan-Trappen wird als Mitursache diskutiert; der Einschlag gilt als Hauptauslöser. Rund drei Viertel aller Arten verschwanden.
- 
**Ton:** Ansteigendes Pfeifen, dann ein tiefer Boom (30–40 Hz) mit Rauschen, danach hohes Ohrensausen, das ausblendet, fast Stille, leiser Wind, ein einzelner Vogelruf.
- 
**Versteckter Säuger:** Purgatorius, ein winziges Säugetier aus der Nähe der Primaten-Wurzel, in seiner Höhle.

## Prompt 6: Seite 8 – Finale: Das Zeitalter der Säugetiere und die ersten Hominiden
Titel der Seite: „Die Stunde der Säugetiere – und ein Spaziergang in der Asche“. Eine durchgehende Landschaft über beide Seiten: links der Anfang des Säugetierzeitalters, rechts der Weg zu den ersten Hominiden. Das ist die aufwändigste Seite des Buchs.

### Linke Seite: Nach dem Einschlag (Paläozän und Eozän, ca. 66–34 Mio. Jahre)
- 
**Szene:** Eine Farnprärie, die in einen warmen Wald übergeht. Weiches Honiglicht, Pollen im Gegenlicht.
- 
**Tiere und Karten:** Purgatorius (winzig, ca. 66 Mio. Jahre), Hyracotherium („Urpferdchen“, füchsisch groß, ca. 55–50 Mio. Jahre, Verwandte auch aus der Grube Messel bei Darmstadt), Gastornis (Riesenlaufvogel und damit ein Nachfahre der Dinosaurier). Optional: Plesiadapis und Pakicetus (Landsäuger, Walvorfahr, ca. 50 Mio. Jahre).
- 
**Mechanik:** Die Lasche „WACHSE!“ lässt die Farne zu Bäumen aufklappen, kleine Säuger kommen aus ihren Höhlen.

### Rechte Seite: Zeitsprung bis Laetoli
- 
**Zeitsprung-Schieber** unten, beschriftet von 66 bis 3,7 Mio. Jahren mit den Epochen Paläozän, Eozän, Oligozän, Miozän und Pliozän. Beim Ziehen verwandelt sich die Szene stufenlos: Regenwald, lichter Wald, Grasland und Savanne (Abkühlung und Austrocknung). Die Tiere wechseln mit, z. B. Paraceratherium (Riesennashorn, Oligozän), Gomphotherium (Rüsseltier, Miozän) und ein baumlebender Menschenaffe.
- 
**Ton beim Ziehen:** ein Zeitraffer aus sirrendem Ticken und aufsteigendem Arpeggio, während die Atmosphäre überblendet.
- 
**Am Anschlag (3,7 Mio. Jahre) liegt Laetoli** (Tansania): eine Ebene aus Vulkanasche, im Hintergrund ein Vulkan, feiner Regen. Die Lasche „LAUF!“ lässt Fußabdrücke Schritt für Schritt in die Asche entstehen, mit weichem Tapp-Geräusch. Die Spur stammt von drei Wesen, zwei großen und einem kleineren. Als aufrecht gehende Silhouette läuft Australopithecus afarensis voran.
- 
**Karte „Lucy“** (Klick auf die Silhouette): gefunden 1974 in Hadar (Äthiopien), ca. 3,2 Mio. Jahre alt, etwa 1,05 m groß, Hirnvolumen rund 400 cm³ (Schätzung) gegen rund 1350 cm³ beim heutigen Menschen als Balkenvergleich. Aufrechter Gang, vor allem Pflanzenkost. Wow-Fakt: Der Name stammt aus einem Beatles-Song, der im Lager lief.
- 
**Karte „Laetoli“:** Die Spuren sind etwa 3,7 Mio. Jahre alt, wurden 1976 vom Team um Mary Leakey entdeckt und blieben in feuchter Vulkanasche erhalten. Die Zuordnung zu Australopithecus afarensis ist üblich, aber diskutiert.
- 
**Mini-Zeitstreifen „Wer war früh dabei?“:** antippbare Kacheln für Sahelanthropus (ca. 7 Mio. Jahre, Tschad, umstritten, ob Hominin), Orrorin (ca. 6), Ardipithecus (ca. 4,4), Australopithecus (ca. 4–2) und die ersten Homo (ab etwa 2,8). Die Karte sagt klar: Der Stammbaum ist ein Busch, keine Leiter.
- 
**Begriff:** Im Buch heißen sie „frühe Hominiden (Vormenschen)“. Eine Karte erklärt, dass Hominiden die Menschenaffen und Menschen umfassen und der Zweig zum Menschen Hominini heißt.

### Zeitlücke sichtbar machen
- 
Ein Band über dem Schieber zeigt: „Zwischen dem Einschlag (66 Mio. Jahre) und Lucy (3,2 Mio. Jahre) liegen rund 63 Mio. Jahre. Menschen und Dinosaurier sind sich nie begegnet.“ Zum Vergleich läuft ein zweiter Balken für die Zeit der Dinosaurier (ca. 231–66 Mio. Jahre, also rund 165 Mio. Jahre).

### Epilog
- 
Ein Vogel (Spatz oder Rotkehlchen) landet auf dem Buchrand und schaut auf die Fußspuren. Antippen öffnet die Karte „Vögel sind Dinosaurier“.
- 
Danach erscheint das „Familienalbum“ der gefundenen Säuger. Ein Knopf „Buch schließen“ klappt den Einband zu, eine Spieluhr-Melodie klingt aus.
- 
**Ton auf der Seite:** warme Atmosphäre mit Vögeln, leiser Regen in Laetoli, weiches Tapp-Geräusch der Schritte, Pad und Flöte als Musik.

## Prompt 7: Qualität, Performance, Meilensteine, Lieferumfang

### Qualitätsmaßstab
- 
Es soll aussehen wie ein hochwertiges Papierkunst-Buch, nicht wie ein Low-Poly-Spiel: ruhige Farben, sorgfältige Silhouetten, saubere Kanten, nichts flackert (kein Z-Fighting), kein Text läuft über.
- 
Jede Tier-Silhouette ist von Hand als Pfad gebaut (src/art/silhouettes.js) und folgt dem aktuellen Forschungsstand: T. rex mit zwei Fingern, Stegosaurus mit vier Schwanzstacheln, Triceratops mit Nackenschild, Federn bei kleinen Theropoden. Eine Debug-Galerie (?gallery) zeigt alle Tiere im selben Maßstab neben einem 1,75-m-Menschen.
- 
Keine fremden Figuren, Marken oder Anlehnungen an Filmfiguren.

### Performance
- 
Ziel: 60 fps am Desktop, mindestens 30 fps auf einem aktuellen Schul-iPad. Pixel-Ratio auf 2 deckeln. Drei Qualitätsstufen (hoch, mittel, niedrig) schalten automatisch nach Frame-Zeit: Schattenauflösung, Partikelzahl, Nachbearbeitung, Anti-Aliasing.
- 
Nur die aktuelle Doppelseite und ihre Nachbarn liegen im Speicher. Ressourcen werden sauber freigegeben (dispose), Pflanzen und Partikel nutzen Instancing. Ein Ladebildschirm „Das Buch wird gefaltet …“ zeigt den Fortschritt.

### Arbeitsweise in Meilensteinen
- 
Gerüst: Build, Tisch, Buch, Kamera, Licht, Navigation, Seite 0 und 1 mit Aufrichten.
- 
Mechanik: Baukasten fertig (Falze, Laschen, Schieber, Klappen, Fäden), Umblättern, Info-Karten.
- 
Sound-Engine und Atmosphären der Seiten.
- 
Seiten 2 bis 7.
- 
Finale (Seite 8) mit Zeitsprung und Laetoli.
- 
Politur: Performance, Barrierefreiheit, Ruhiger Modus, Hilfe-Dialog, Texte gegenlesen.
- 
Optional: Flask-Wrapper, README, Deployment-Hinweise.
Nach jedem Meilenstein fotografierst du die Seiten mit einem Headless-Browser (z. B. Playwright) in der Leseansicht und aus zwei Orbit-Winkeln, siehst dir die Screenshots an und behebst Fehler (Durchdringungen, abgeschnittene Texte, falsche Maßstäbe), bevor du weitermachst. Am Ende jedes Meilensteins gibt es eine kurze Zusammenfassung mit Screenshots.

### Lieferumfang
- 
dist/index.html (Einzeldatei), src/ (modular), README.md (Bedienung, Struktur, wie man Seiten und Tiere ergänzt) und facts.md (jede Zahl mit Quelle und Stand). Optional app.py und Dockerfile.
- 
Alle Texte liegen in Datendateien (animals.de.js, pages.de.js), vorbereitet für weitere Sprachen.

### Tabu
- 
Keine externen Bibliotheken zur Laufzeit, keine Cookies, kein Tracking, keine KI-generierten Bilder, kein Blut.
- 
Nirgends der Eindruck, Menschen und Dinosaurier hätten zusammen gelebt.

## Faktenbasis zum Gegenprüfen
Dieser Abschnitt gehört nicht in den Prompt, sondern ist für dich. „Geprüft“ heißt: Ich habe die Quelle am 9. Oktober 2026 geöffnet. Alles andere stammt aus meinem Fachwissen und sollte vor dem Unterricht gegengelesen werden.
Thema
Aussage im Buch
Stand
Einschlag
ca. 66,0 Mio. Jahre (66,043 ± 0,011), Krater bei Chicxulub ca. 180 km, Asteroid ca. 10–15 km
geprüft
Iridium
Anreicherung 1980 von Alvarez et al. gemeldet
geprüft
Überlebende
Vögel als einzige Dinosaurierlinie, über 75 % der Arten verschwanden
geprüft
Dekkan-Trappen
Mitursache diskutiert, Einschlag gilt als Hauptauslöser
geprüft
Laetoli
ca. 3,7 Mio. Jahre, 1976 entdeckt, Vulkanasche, Zuordnung zu A. afarensis diskutiert
geprüft
Sahelanthropus
ca. 7 Mio. Jahre, Tschad, Hominin-Status und aufrechter Gang umstritten
geprüft
Dinosaurier im All
Maiasaura-Knochen 1985 (erster Dinosaurier im All), Coelophysis-Schädel Januar 1998 mit STS-89 zur Raumstation Mir
geprüft (Orbiter nicht in der Quelle)
Erduhr
Dinosaurier ca. 22:47–23:39 Uhr, erste Säuger ca. 22:55 Uhr, Homo sapiens ca. 6 s vor Mitternacht
gerechnet mit 4,54 Mrd. Jahren
Zeitabstände
Stegosaurus bis T. rex ca. 84 Mio. Jahre, Einschlag bis Lucy ca. 63 Mio. Jahre, Dinosaurierzeit ca. 165 Mio. Jahre
gerechnet
Lucy
ca. 3,2 Mio. Jahre, 1974 in Hadar, ca. 1,05 m, Hirnvolumen rund 400 cm³
prüfen
Archaeopteryx
ca. 150 Mio. Jahre, Solnhofener Plattenkalk, Tiere der Lagune
prüfen
Plateosaurus
ca. 214–204 Mio. Jahre, Funde Trossingen und Halberstadt
prüfen
Giraffatitan
Skelett im Museum für Naturkunde Berlin, Fundort Tansania
prüfen
Oviraptor
Name „Eierdieb“ zu Unrecht, brütete eigene Eier
prüfen
Versteckte Säuger
Morganucodon, Castorocauda, Didelphodon, Purgatorius: Alter, Fundort, Größe
prüfen
Tiergrößen und Lebenszeiten
alle übrigen Zahlen in den Info-Karten
prüfen
Quellen: Laetoli (Wikipedia), Kreide-Paläogen-Ereignis (Wikipedia), Sahelanthropus (Wikipedia), First dinosaur in space (Guinness World Records).