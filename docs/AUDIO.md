# Klangmaschine – Dokumentation (Ägypten-Buch)

Reines Web Audio, keine Audiodateien (außer den eingebetteten Erzähl-Clips aus `src/data/narration.generated.js`), keine Bibliotheken.
Alles in `src/audio/` (ca. 124 KiB Quelltext, nicht minifiziert). Die Klangmaschine stammt aus dem Dino-Buch; Kern, Pool, Master-Kette und öffentliche API sind unverändert,
Klänge, Szenen, Musik und Tierstimmen sind für Ägypten neu (warm, ruhig, nichts Schauriges: kein Heulen, keine Schreie, keine Knalleffekte).

| Datei | Inhalt |
|---|---|
| `audio.js` | `AudioEngine` (öffentliche API, Frame-Schleife, Ducking, `renderOffline`) |
| `synth.js` | Kern: Rauschpuffer, Hüllkurven, `Voice` (Stimmen-Pool-Eintrag), `Rig` (Graph, Busse, Master-Kette, Hall) |
| `inst.js` | Klangbausteine: Harfe/Laute (`pluck`), Rohrflöte Ney (`ney`), Horn, Rahmentrommel (`drum`), Sistrum (`rattle`), Tonleitern (`SC`, `degMidi`) |
| `sfx.js` | 52 Geräusche + Drosselung (`GAP`) |
| `voices.js` | 30 Tierstimmen/Götterklänge (FM + subtraktiv + Formanten), `cine`-Varianten |
| `scenes.js` | 10 Atmosphären (`Scenes`) mit szenenbezogenen ctl, ctl-Schichten (`Layers`: tension, timeLapse, wind, underwater, rainfall) |
| `music.js` | generative Betten je Seite, Titelthema (kurz/lang/voll), Abschiedsmelodie |
| `narration.js` | Erzählstimme: MP3-Clips, Rückfall Sprachsynthese, Untertitel satzweise |
| `levels.js` | automatisch kalibrierte Pegelkorrekturen (nicht von Hand pflegen) |

## API

```js
const audio = new AudioEngine(app);          // app.calm, app.station, app.stage.tier werden gelesen
```

Felder (alle frei setzbar): `enabled` (Ton an), `volume` (0…1, Standard 0.6), `cine` (dramatischere Tierstimmen), `captions`,
`speaking` (nur lesen), `autoNarrate`, `onCaption(text)` (leer = ausblenden), `onSpeaking(bool)`; zusätzlich `unlocked`, `ctx`, `rig`.

| Methode | Wirkung |
|---|---|
| `unlock()` | Bei jeder Geste aufrufen (iOS): erzeugt/ setzt den `AudioContext` fort, spielt einen Stille-Puffer, weckt die Sprachsynthese. Vorher passiert nichts (Aufrufe werden verworfen, `setScene`/`ctl` werden gemerkt und beim Start angewandt). |
| `setEnabled(b)` | Aus: Master 0, Szene/Musik/Layer weg, Erzählung stoppt, Kontext wird nach 0.35 s angehalten. An: Kontext läuft, Szene und ctl-Werte kommen zurück. |
| `setVolume(v)` | Master-Gain mit Rampe (30 ms). Die Lautstärke ist *der* Master-Regler (siehe Hörschutz). |
| `sfx(name, opts?)` | Einmal-Geräusch. Unbekannte Namen werden still ignoriert. Je Name gedrosselt (`GAP`). |
| `voice(id)` | Tierstimme eines Actors (Götter-ids: kurzer Harfenklang); gleiche Tiere unterbrechen sich; Wiederholung < 0.25 s wird verschluckt; unbekannte ids → leises Blip. |
| `setScene(id)` | Atmosphäre + Musik wechseln (Überblendung 1.2 s). Unbekannte ids bleiben ohne Wirkung. |
| `ctl(name, v)` | Kontinuierlicher Wert 0…1 (siehe unten). Unbekannte Namen: still ignoriert. |
| `silence(sec = 3, delay = 0)` | Alles außer Erzählstimme sanft (0.5 s) auf 0, `sec` s halten, 1.8 s zurück. Für besondere Momente (wird im Ägypten-Buch derzeit nicht gebraucht). |
| `narrate({ id, text })` | Liest vor, liefert ein Promise (löst am Ende oder bei Abbruch auf). Startet vorherige Erzählung neu. |
| `stopNarration()` | Bricht sanft ab (60 ms Rampe), Untertitel werden geleert, `speaking → false`. |
| `onPageShown(i)` | Nach der Landung einer Seite: nach 0.9 s liest die Stimme `PAGES_DE[i].narr` (nur wenn `autoNarrate`, Ton an, nichts spricht und `app.station === i`). Wird durch Umblättern/`stopNarration` entwertet. |
| `update(dt)` | Pro Frame (Untertitel, Scheduler, Aufräumen). Keine Allokationen im Normalfall; zusätzlich ein 150-ms-Sicherheitstakt. |
| `renderOffline(kind, name, seconds, o)` | Testhilfe, siehe unten. |

**Erweiterungen gegenüber dem Stub:** `catalog()` (Listen der Namen/ids), `stats()` (Pool-Größe, Zustand, Szene), `renderOffline`, die Felder `unlocked/ctx/rig`,
die `sfx`-Optionen und die ctl-Namen `hush`, `flood`, `build`, `scale`, `salt`, `torch`, `parade`. Alle Stub-Methodennamen sind unverändert.

### sfx-Namen (52) und Optionen

Gemeinsame Namen aus `docs/PAGE_GUIDE.md` (alle vorhanden): `turn` (`fwd`, `steps`) · `lift` · `land` (`cover`: schwerer Einband) · `grab` · `snap` · `card` (`close`) · `found` (Glitzern, Skarabäus-Fund) · `tick` (`rate`, `fast`) · `gong` · `slide` (`v` 0…1: Tonhöhe folgt der Zugstrecke) ·
`flapOpen` · `flapClose` · `pop` · `footstep` (`v`, `big`) · `stomp` (`big`) · `swing` · `flap` · `splash` (`big`) · `bubble` · `dive` · `wave` · `crack` · `peep` · `whoosh` · `rumble` (`dur`) · `thud` · `chime` (`note`: Stufe der Tonleiter) · `grow` · `rustle` ·
`horn` (tiefes weiches Signalhorn, `f` Grundton in Hz, Standard 98) · `tapp` · `woodcrack` · `ping` · `musicbox` (≈ 16 s, Titelthema auf der Harfe, `beat`) · `tweet` · außerdem `splinter` (geblieben).

**Neu für Ägypten** (alle Optionen optional, unbekannte werden ignoriert):

| Name | Klang | Optionen |
|---|---|---|
| `chisel` | Meißel/Schlägel auf Stein: helles „Tink“ + dumpfer Schlag | `n` Schläge 1…4, `v` Härte 0…1 |
| `sand` | Sand rieselt (körniges Rauschen) | `dur` 0.3…6 s (Standard 1.4), `v` Menge 0…1 |
| `quern` | Mahlstein, kratzendes Hin und Her (≈ 2 Strich/s) | `dur` (Standard 1.5 s) |
| `sistrum` | Rasseln der Metallplättchen | `n` Plättchen 6…24, `v` Stärke |
| `harp` | Zupfton der Harfe | `note` Stufe der Tonleiter D phrygisch-dominant (0 = D5, 7 = D6, negativ = tiefer), `midi` frei, `inst: 'lute'`, `vel` |
| `scale` | Waage: zwei feine Metalltick + leises Quietschen | `v` Neigung 0…1 (Tonhöhe des Quietschens), `tick: true` = nur Ticken |
| `door` | schwere Tür/Tor knarrt auf, Steinschaben, leises Ausrasten | `dur` (Standard 1.9 s), `v` Tonhöhe |
| `fire` | kurzes Knistern, regelbar | `v` Stärke 0…1 (Dichte und Pegel), `dur` (Standard 1.3 s) |
| `oar` | Ruderplatsch: Holz an der Dolle, Eintauchen, Tropfen | `big` kräftiger Zug |
| `sail` | Segel flattert, Nachrascheln | `v` Wind 0…1 |
| `water` | Wasser schöpfen: Eintauchen, Füllen, Ausgießen | – |
| `papyrus` | Papyrus knistert (trockenes Papier) | – |
| `bread` | Teig kneten: weiche Drücker | `n` Drücker 1…5 |
| `gold` | heller Glanzton, drei aufsteigende Glöckchen | – |
| `seal` | Siegel/Stempel auf Ton | – |
| `torch` | Fackel an: Auffauchen, „Fwump“, Knistern | – |

Entfernt (Dino-spezifisch): `chomp`, `hatch`, `fossil`, `impact`, `tinnitus`. Unbekannte Namen werden still ignoriert. Es gibt keinen Knall- oder Blitzeffekt; die Basisgeräusche liegen roh bei ≤ −9 dBFS, Varianten (z. B. `turn{steps:3}` −6,3, `fire{v:1}` −6,7) höchstens bei −6 dBFS (siehe Pegel).

### Tierstimmen (30 ids + Aliase)

`nilpferd` (vier „Honks“ = Grunzlachen + tiefes Ausatmen/Gähnen) · `krokodil` (Zischen + leises Brummen) · `ibis` (heiseres „Kräh“, zweimal) · `reiher` (Krächzen) · `falke` (heller Ruf, kurz, bewusst nicht zu hoch) · `katze` (Miau + Schnurren) ·
`ochse` (Muhen) · `kuh` (heller, kürzer) · `esel` (I-A, zweimal) · `pferd` (Wiehern + Schnauben) · `kobra` (Zischen) · `schakal` (zwei freundliche Beller + kurzes Jaulen) · `pavian` (zwei Bell-Grunzer + tiefer Laut) ·
`geier` (Zischen + Krächzen) · `wasservogel` (Schnattern) · `fisch` (Plätschern) · `skarabaeus` (leises Surren + Zirpen).
Aliase: `skarab1` … `skarab9` → `skarabaeus`.
**Götter** (`ra osiris isis horus anubis thot maat hathor bastet sobek ammit chepre nut`) geben bewusst keinen Tierlaut, sondern einen kurzen, würdevollen Harfenklang aus drei bis vier Tönen (je Gott eine eigene Figur). Menschen-ids und unbekannte ids: leises Blip (0.1 s).
`cine = true` macht die Laute etwas länger und rauer (eigene Pegelkalibrierung, Spitze −2 dB höher als Standard; Götterklänge ändern sich nicht).

### Szenen (10) und Musik

`cover zeitrad nil reich gizeh goetter mumie alltag tal finale` (= Seiten-`atmo`-ids = `PAGES_DE[i].id`). `setScene('cover')` für das geschlossene Buch. Unbekannte ids bleiben ohne Wirkung (die Seite davor läuft weiter).

| Szene | Atmosphäre | szenenbezogener ctl |
|---|---|---|
| `cover` | fast still, warmer Raumton (Grundton D + Quinte, kaum hörbar) | – |
| `zeitrad` | leises Plätschern, Zikaden, ferne Rohrflöte (alle 12…24 s), leiser Wind | – |
| `nil` | Wasser, Froschchor, Wasservögel (ibis/reiher/wasservogel fern), Wind im Schilf, Fischplatscher | `flood` 0…1: mehr und hellerer Wasserrauschen (bis ≈ +8 dB) |
| `reich` | Markt aus der Ferne (formantisches Murmeln, Rufe), Esel/Ochse fern, Windspiel, Fanfarenrest, Wind | – |
| `gizeh` | Hammer/Meißel im Takt (drei versetzte Gruppen), Rufe der Arbeitsgruppen als dumpfes Murmeln, Wüstenwind, Ochse fern | `build` 0…1: mehr Hämmerer (1 → 3 Gruppen, dichter), lauteres Murmeln |
| `goetter` | Tempelhalle: Hallenluft, tiefer Chorton (A, Quinte, Oktave durch „O“-Formanten, atmet langsam), Weihrauch-Glöckchen mit viel Hall, Sistrum leise | `scale` 0…1: sanftes Ticken der Waage (dichter bei größerem Wert) |
| `mumie` | gedeckter Raum, Rezitation als formantisches Murmeln (flüsternd, kein Gesang), Sandrieseln, Leinenrascheln | `salt` 0…1: mehr Rieseln (heller, bis ≈ +1 dB) |
| `alltag` | Mahlen, Backofen-Knistern, Geflügel/Esel fern, Kinderlachen aus der Ferne, Lautenklang aus dem Nachbarhaus | – |
| `tal` | Fackelknistern, Tropfen mit Hall, tiefer Hornton (alle 28…50 s), Wüstenwind | `torch` 0…1: Fackeln lodern stärker (bis ≈ +4.5 dB) |
| `finale` | Meeresrauschen, Wellen, ferne Hafenrufe, Wasservögel, Segelflattern | `parade` 0…1: Jubel der Parade (leises Murmeln); löst zugleich das volle Titelthema aus (einmal, bis der Wert wieder unter 0.2 fällt) |

Musik gibt es für alle Seiten. Tonleitern mit kleiner Terz bzw. übermäßiger Sekunde: phrygisch-dominant (D Es Fis G A B C), harmonisch Moll, Moll-Pentatonik. Instrumente: Harfe und Laute (gezupft, additiv mit kurzem Zupfrauschen), Rohrflöte Ney (Sinus + Obertöne, Anblasen, spätes Vibrato, Hauch), Rahmentrommel (`dum`/`tak`/`ka`), Sistrum.
Die Betten sind sehr leise, mit Pausen von 3…12 s (Phrasen enden gern auf dem Grundton, wiederholte Motive werden leicht verändert):

* **Titelthema** (`THEME` in `music.js`, D-phrygisch-dominant, vier Zeilen zu je 8 Schlägen, ≈ 22 s): `cover` spielt die ersten zwei Zeilen auf der Harfe (alle 14…20 s), `zeitrad` das ganze Thema mit Ney-Oberstimme (alle 10…16 s), `finale` die **volle Variante** (Harfe + Ney, Harfenbegleitung über dem Orgelpunkt D, Rahmentrommel ab der 2. Zeile, Sistrum ab der 3., Bordun-Fläche D–A–D) erstmals 9 s nach Seitenstart und dann alle 50…65 s, außerdem sofort bei `ctl('parade', >0.5)`. Zwischen den Themen spielt das Finale ein Harfen-/Ney-Bett.
* `nil` (Harfe/Ney, A), `reich` (Laute/Ney + leise Rahmentrommel), `gizeh` (Harfe/Ney, G harmonisch Moll, ruhig), `goetter` (Ney/Harfe, viel Hall), `mumie` (Laute/Ney, Moll-Pentatonik, sehr leise), `alltag` (Laute, flott, leise Rahmentrommel), `tal` (Harfe/Ney, spärlich).
* `musicbox` (sfx) = das Titelthema auf der Harfe, ≈ 16 s, gegen Ende langsamer.

### ctl-Werte (0…1)

| Name | Wirkung |
|---|---|
| `flood` `build` `scale` `salt` `torch` `parade` | siehe Szenentabelle (nur in der jeweiligen Szene; Wert wird gemerkt und beim Szenenwechsel angewandt) |
| `tension` | „Erwartung“: tiefer Bordun (Grundton + Quinte) + Hauch Luft, wächst mit dem Wert. Kein Pfeifen. Bei 0 baut sich die Schicht nach 3 s ab. |
| `timeLapse` | Zeitraffer-Regler: sirrendes Ticken + aufsteigendes Arpeggio in D-phrygisch-dominant, **nur solange sich der Wert bewegt** (klingt nach ≈ 1 s Stillstand aus, die Schicht wird nach 4 s abgebaut). |
| `rainfall` | Leiser Regen über jeder Seite (Rauschen + Tropfen auf Papier). |
| `wind` | Zusätzliche Windschicht über jeder Szene. |
| `underwater` | Tiefpass auf Atmo- und Musik-Bus von 22 kHz → 450 Hz (exponentiell) + leises Blubbern. Läuft auch bei Ton aus mit. |
| `hush` | Dämpft alle Busse außer Stimme auf `1 − v` (z. B. für ruhige Momente). |

Kleinste Änderung, die verarbeitet wird: 0.003 (Schutz vor Aufruf-Flut aus Schiebereglern). Unbekannte Namen werden still ignoriert. `silence(sec, delay)` gibt es weiterhin (kein Seiten-Ereignis verwendet es mehr; `over`-Bus bleibt für Spezialfälle).

## Erzählung

* Clip-ids: `cover`, `page<i>`, `card_<id>` (`main.js` übergibt `card:<id>`, das wird zu `card_<id>` normalisiert). Clips stammen aus `narration.generated.js` (Base64-MP3), werden erst beim Abspielen dekodiert (LRU-Cache: 4 Stück).
* Untertitel: der übergebene `text` wird in Sätze geteilt (Abkürzungen wie „ca.“, „Mio.“, „z. B.“ trennen nicht; ohne Lookbehind wegen älterer Safari-Versionen). Sätze werden nach Zeichenanteil über die Clip-Dauer verteilt, gekoppelt an die Audiouhr. Weicht der gezeigte Text stark vom gesprochenen ab, laufen die Untertitel leicht versetzt.
* Ohne Clip: `speechSynthesis` satzweise (deutsche Stimme bevorzugt, „natürlich“ klingende zuerst). Startet in 2 s keine Äußerung, laufen die Untertitel im Zeittakt (≈ 14 Zeichen/s) weiter.
* Ton aus: keine Sprache, Untertitel laufen im Zeittakt.
* Ducking während der Erzählung: Musik und Atmo auf 35 %, Effekte auf 70 % (Rampe 80 ms rein, 250 ms raus).
* Gemessene Pegel der eingebetteten Clips: Spitze ≈ −3 dBFS, Sprach-RMS ≈ −17,4 dBFS (Bus `voice`, kein Zusatz-Gain).

## Graph und Hörschutz

```
Quellen → Bus (music | atmo | fx | voice | over) → duck → pre → lull (hush × silence) → mix
mix → Hochpass 14 Hz → master (= Lautstärke-Regler) → Limiter (DynamicsCompressor, Schwelle −3 dB, Knie 0, 20:1, 2 ms/120 ms) → ×0.82 → Ausgang
```

* `music`/`atmo` haben einen Tiefpass (für `underwater`); `voice` und `over` umgehen `lull`.
* Jeder Gain wird mit Rampen geändert, nie mit Sprüngen. Alle Hüllkurven enden linear auf 0 (kein Klick), Einsätze ≥ 1,5–10 ms.
* Stimmen-Pool: max. 24 gleichzeitige (16 beim Tier `low`), Prioritäten 0–3 (ältere/leisere werden zuerst mit Fade geschlossen), Knoten werden nach `onended` getrennt, `sweep()` räumt Verwaiste.
* Messbefunde zur Master-Kette (siehe unten): Chrome/Safari hängen dem `DynamicsCompressor` automatisch ein Makeup-Gain an (≈ +1,7 dB beim Limiter). Es wird durch ×0.82 ausgeglichen: Ein 1-kHz-Ton mit −10 dBFS kommt mit Kette bei −10,0 dBFS heraus (Differenz 0,0 dB). Ein zusätzlicher „Glue“-Kompressor wurde verworfen, weil er Transienten deutlich einebnete.
* Im `OfflineAudioContext` fehlt dem Limiter am Anfang kurz die Einschwingzeit (erster Klang nach Start ≈ 1…3 dB leiser). Das ist ein Artefakt des Offline-Renderns und tritt nur dort auf; die Master-Tests nutzen daher 1 s Vorlauf (`o.at`).
* Am Ausgang bei Lautstärke 1.0 gemessen: `found` −9,0 dBFS, `door` −10,0, `gong` −8,9, `nilpferd` mit `cine` −6,0 (lauteste Tierstimme). Bei Standardlautstärke 0.6 liegt alles ≈ 4,4 dB darunter. Es gibt keinen Knall-/Blitz-Effekt mehr (im Dino-Buch der Einschlag).

## Pegelziele und Ausnahmen

Gemessen ohne Master (Rohsignal, `raw`), danach wirken Lautstärke-Regler und Limiter.

| Klasse | Ziel |
|---|---|
| SFX-Spitze | −9 dBFS (Standard); häufige kleine Geräusche und Transienten −10 … −12 (tick, tapp, slide, footstep, bubble, snap, chisel, seal, door, tweet …). Prüfgrenze: −12,5 … −6 |
| Tierstimme | −9 dBFS, `cine` −7 dBFS; **Ausnahmen (hohe, spitze Laute):** `falke` −12 / −10, `skarabaeus` −11 / −9, `kobra` −11 / −9 |
| Atmosphäre | RMS −28 dBFS (−32 … −24); **Ausnahme:** `cover` −46 (nur Hauch). Mit ctl-Wert 1: `nil` flood −20, `gizeh` build −26, `tal` torch −23,5 (alle anderen ≈ −27 … −28) |
| Musik | RMS −34 dBFS (−38 … −30); **Ausnahmen:** `cover` −37, `finale` −33 |

`levels.js` enthält die dB-Korrekturen je Klang; sie werden von `node tools/audio-check.mjs --calibrate` geschrieben (linear in dB, konvergiert in einem Durchlauf). Von Hand nur grob ändern, sonst neu kalibrieren.

## Tests

```
node tools/audio-check.mjs                      # Buch bauen, headless starten, alles offline rendern, messen, Live-Test
node tools/audio-check.mjs --lite               # nur die Klangmaschine bündeln (≈ 1 min statt ≈ 2,5 min)
node tools/audio-check.mjs --calibrate          # zuvor levels.js neu schreiben (2 Durchläufe, danach Messung)
node tools/audio-check.mjs --only=nil            # nur Klänge, deren Name den Teil enthält
node tools/audio-check.mjs --no-build           # vorhandenes /tmp/claude-0/audio_test/index.html wiederverwenden
```

Zusätzlich liest `node tools/audio-egypt-report.mjs [wav-verzeichnis] [filter]` die WAVs und gibt je Klang Energieanteile in fünf Frequenzbändern, Tonhaltigkeit (stärkste Spektrallinie, dB über der Umgebung), Pegelschwankung und Stilleanteil aus – Hilfe, um ohne Ohren nach Dauerbrummen, Pfeifen und zu dumpfen/zu spitzen Klängen zu suchen.

Ausgabe: Tabelle (Dauer, Spitze, RMS, DC, Stille %, Schwerpunkt, Klicks Anfang/Ende, Befund), JSON in `/tmp/claude-0/audio_test/audio-check.json`, WAV-Dateien in `/tmp/claude-0/audio_test/wav/`. Exit-Code 1 bei Verstößen.

Geprüft werden (Stand dieser Fassung: **176 Klänge, 0 Verstöße, 0 Warnungen**): alle 52 sfx (+ 21 Varianten wie `land{cover}`, `chisel{n:4}`, `door{v:1}` …), 30 Stimmen mit und ohne `cine` + unbekannte id, 10 Szenen à 12 s (+ je zwei Varianten der Szenen-ctl `flood build scale salt torch parade` und `nil` unter Wasser), 10 Musikbetten à 32 s (+ Finale mit `parade`), 3 ctl-Verläufe, 4 Mastertests.
Verstoß = Spitze > −1 dBFS, < −40 dBFS, DC > 0,01, Klick am Anfang/Ende, NaN, Clipping, offenes Ende; Warnung = Zielpegel verfehlt.

Der Live-Test (13 Prüfungen) fährt die echte Engine: `unlock`, Szenen-Rundlauf, Sturm von ≈ 650 Aufrufen (Pool ≤ 24), Aufräumen nach Szenenwechseln, Erzählung mit Test-WAV und einem echten MP3-Clip, Rückfall, `stopNarration`, Ton aus/an, Konsole ohne Fehler.

`renderOffline(kind, name, seconds, o)`: `kind` = `sfx` (mit `o.opts`), `voice` (`o.cine`), `scene` (`o.ctl`, `o.layers`, `o.events`), `music` (`o.ctl`, z. B. `{ parade: 1 }`), `ctl` (`o.from` → `o.to`), `sine`; weitere Optionen `seed`, `sr`, `master`, `volume`, `at` (Vorlauf), `calm`. Rückgabe: mono `Float32Array`. Gleicher Seed = gleiches Ergebnis.

## Bekannte Schwächen

* Es konnte nicht gehört werden – Klangdesign ist über Pegel, Spektren und Spektrogramme abgesichert, nicht über Ohren. Bitte einmal auf dem iPad probehören: Tierstimmen (Nilpferd-Grunzlachen, Esel, Katze, Pferd klingen synthetisch; Schnurren ist ein Näherungsklang), Murmeln/Rezitation (Mumienwerkstatt, Markt, Hafen: formantisches Rauschen, ob es „menschlich“ wirkt, ist ungeprüft), Kinderlachen aus der Ferne, Chorton in der Tempelhalle, Hornton im Tal, das Titelthema (Melodie und Tempo), die Balance von Atmo und Musik.
* Der Chorton der Tempelhalle ist ein bewusst gleichmäßiger, langsam atmender Bordun (stärkste Spektrallinie ≈ 46 dB über der Umgebung): gewollt, aber ein Kandidat für „Dauerbrummen“, falls er stört (dann in `scenes.js` `goetter` den Pegel `g`/`ch` senken).
* iPad-Lautsprecher geben < 150 Hz kaum wieder: Hornton, Rumpeln der Tür, Nilpferd und Ochse sind dort vor allem als Obertöne hörbar. Die Betten liegen deshalb ab D3 aufwärts (Harfe/Laute/Ney).
* Sprachsynthese-Rückfall: Stimmen und Qualität hängen vom Gerät ab; ohne deutsche Stimme laufen nur Untertitel.
* Die Untertitel-Zeiten für MP3-Clips sind eine Schätzung nach Zeichenanteil, keine echten Satzgrenzen.
* `onPageShown` verlässt sich auf `app.station`; ohne dieses Feld spricht die Stimme nicht automatisch.
