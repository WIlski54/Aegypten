// Registry of all figure / prop specs. Each module default-exports { id: factory }.
// Jede Gruppe besitzt EINE Datei (reg_<gruppe>.js) und trägt nur dort ein.
import human from './animals/human.js';
import e from './reg_e.js';          // generische Kulissen (Palme, Akazie, Schilf, Wolken, Sonne, Wellen, Felsen)
import people from './reg_people.js'; // P  Menschen
import animals from './reg_animals.js'; // T  Tiere
import gods from './reg_gods.js';     // G  Götter
import land from './reg_land.js';     // S1 Landschaft, Pyramiden, Pflanzen
import arch from './reg_arch.js';     // S2 Bauwerke, Schiffe, Innenräume
import royal from './reg_royal.js';   // O1 Königs- und Grabschätze, Kronen
import ritual from './reg_ritual.js'; // O2 Totengericht, Mumifizierung
import daily from './reg_daily.js';   // O3 Alltag, Schrift, Werkzeug, Rosetta

export const ANIMALS = { human, ...e, ...people, ...animals, ...gods, ...land, ...arch, ...royal, ...ritual, ...daily };
