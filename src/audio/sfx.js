// sfx.js – Einmal-Geräusche. Jede Funktion: (R = Rig, t = Startzeit, o = Optionen). Jedes Geräusch ist ein einziger Voice (ein Pool-Platz).
// Alle Einsätze haben mindestens 1.5 ms Anstieg (Ticks) bzw. 3–10 ms (Dumpfes/Lautes); nichts startet oder endet mit einem Sprung.
import { clamp, mtof, env } from './synth.js';
import { playBird } from './voices.js';
import { playMelody } from './music.js';
import { degMidi, pluck, horn, rattle, amNoise } from './inst.js';

const mk = (R, name, prio = 1, bus = 'fx') => R.voice(prio, bus, 'sfx:' + name);
const dm = (i, root = 74) => degMidi(i, root, 'phryg'); // Töne der Klingel-Geräusche: phrygisch-dominant (D)
/** Ausgangs-Hüllkurve: dur Sekunden Gesamtlänge, a Einblenden, danach Haltepegel p bis 80 %, dann Ausklang auf 0. */
const shape = (v, t, dur, a = 0.05, p = 1) => { const g = v.g(0); env(g.gain, t, [[0, 0], [a, p], [dur * 0.8, p * 0.8], [dur, 0]]); g.connect(v.out); return g; };

export const SFX = {
  // ---------- Papier und Mechanik
  turn(R, t, o) { // Umblättern: Rauschen mit Bandpass-Sweep (vorwärts aufwärts, rückwärts abwärts), bei mehreren Seiten gestaffelt
    const v = mk(R, 'turn'); if (!v) return; const n = clamp(o.steps || 1, 1, 3), up = o.fwd !== false;
    for (let i = 0; i < n; i++) {
      const s = t + i * 0.26;
      v.nz(s, { f: up ? 600 : 3200, f2: up ? 3400 : 700, q: 1.1, a: 0.16, d: 0.38, peak: 0.55 });
      v.nz(s + 0.05, { kind: 'white', type: 'highpass', f: 5200, a: 0.1, d: 0.25, peak: 0.06 });
    }
    v.tone(t + (n - 1) * 0.26 + 0.36, { f: 190, f2: 110, a: 0.005, d: 0.09, peak: 0.16 });
  },
  lift(R, t) { const v = mk(R, 'lift'); if (!v) return; v.nz(t, { f: 900, f2: 1800, q: 1, a: 0.05, d: 0.16, peak: 0.25 }); },
  land(R, t, o) { // Seite fällt auf: weiches Plumpsen; Einband schwerer
    const v = mk(R, 'land'); if (!v) return;
    if (o.cover) { v.tone(t, { f: 72, f2: 40, a: 0.006, d: 0.32, peak: 0.45 }); v.nz(t, { kind: 'brown', type: 'lowpass', f: 320, a: 0.004, d: 0.2, peak: 0.35 }); }
    else { v.tone(t, { f: 96, f2: 58, a: 0.005, d: 0.16, peak: 0.5 }); v.nz(t, { type: 'lowpass', f: 520, a: 0.003, d: 0.09, peak: 0.3 }); }
  },
  grab(R, t) { const v = mk(R, 'grab'); if (!v) return; v.nz(t, { kind: 'white', f: 2800, q: 2, a: 0.003, d: 0.05, peak: 0.22 }); v.tone(t, { f: 520, f2: 380, a: 0.003, d: 0.05, peak: 0.16 }); },
  snap(R, t) { // Einrasten: weicher Klick
    const v = mk(R, 'snap'); if (!v) return;
    v.tone(t, { f: 1250, f2: 900, a: 0.002, d: 0.045, peak: 0.28 }); v.nz(t, { kind: 'white', type: 'highpass', f: 3500, a: 0.002, d: 0.02, peak: 0.16 }); v.tone(t, { f: 240, f2: 160, a: 0.002, d: 0.07, peak: 0.4 });
  },
  card(R, t, o) { // Karte auf/zu: leises Papier
    const v = mk(R, 'card'); if (!v) return; const up = !o.close;
    v.nz(t, { f: up ? 1500 : 2600, f2: up ? 2600 : 1500, q: 1.2, a: 0.05, d: 0.22, peak: 0.2 }); v.tone(t + 0.02, { f: up ? 660 : 500, f2: up ? 880 : 400, a: 0.004, d: 0.05, peak: 0.08 });
  },
  found(R, t) { // Fund eines versteckten Skarabäus: kleines Glitzern in der Tonleiter des Buchs
    const v = mk(R, 'found', 3); if (!v) return;
    [0, 2, 4, 7].forEach((d, i) => v.bell(t + i * 0.085, mtof(dm(d + 7)), [[1, 1, 1.1], [3, 0.26, 0.45], [2, 0.1, 0.6]], 0.3));
    v.bell(t + 0.4, mtof(dm(14)), [[1, 1, 1.4], [3, 0.2, 0.5]], 0.18); v.send(0.4);
  },
  tick(R, t, o) { // Uhr- bzw. Zeitradticken (Tick/Tack im Wechsel); schneller beim Drehen
    const v = mk(R, 'tick'); if (!v) return; R.tickPar = !R.tickPar; const k = (R.tickPar ? 1 : 0.78) * (1 + Math.min(0.4, (o.rate || 0) * 0.8)), s = o.fast ? 0.7 : 1;
    v.tone(t, { f: 2400 * k, f2: 1900 * k, a: 0.0015, d: 0.018 * s, peak: 0.3 }); v.nz(t, { kind: 'white', f: 3800 * k, q: 3, a: 0.0015, d: 0.012 * s, peak: 0.22 }); v.tone(t, { f: 520 * k, a: 0.002, d: 0.03 * s, peak: 0.12 });
  },
  gong(R, t) { // weicher Gong
    const v = mk(R, 'gong', 3); if (!v) return; const f = 98;
    v.bell(t, f, [[1, 0.5, 5], [1.51, 0.35, 4.2], [2.02, 0.3, 3.4], [2.76, 0.18, 2.4], [3.13, 0.14, 2], [4.1, 0.08, 1.2]], 0.7);
    v.nz(t, { kind: 'brown', type: 'lowpass', f: 300, a: 0.012, d: 0.25, peak: 0.25 }); v.send(0.35);
  },
  slide(R, t, o) { // Reibung beim Ziehen: Tonhöhe folgt der Zugstrecke v (0…1)
    const v = mk(R, 'slide', 0); if (!v) return; const x = clamp(o.v ?? 0.5, 0, 1);
    v.nz(t, { f: 380 + x * 2200, q: 3.5, a: 0.015, d: 0.08, peak: 0.22 }); v.nz(t, { kind: 'white', type: 'highpass', f: 4500, a: 0.01, d: 0.05, peak: 0.03 });
  },
  flapOpen(R, t) { const v = mk(R, 'flapOpen'); if (!v) return; v.tone(t, { f: 330, f2: 220, a: 0.005, d: 0.08, peak: 0.15 }); v.nz(t, { f: 700, f2: 2400, q: 1.2, a: 0.08, d: 0.17, peak: 0.35 }); },
  flapClose(R, t) { const v = mk(R, 'flapClose'); if (!v) return; v.nz(t, { f: 2400, f2: 700, q: 1.2, a: 0.05, d: 0.12, peak: 0.3 }); v.tone(t + 0.1, { f: 160, f2: 100, a: 0.004, d: 0.08, peak: 0.25 }); },
  pop(R, t) { const v = mk(R, 'pop'); if (!v) return; v.tone(t, { f: 340, f2: 900, gl: 0.04, a: 0.003, d: 0.1, peak: 0.4 }); v.nz(t, { kind: 'white', type: 'highpass', f: 4000, a: 0.002, d: 0.012, peak: 0.07 }); },

  // ---------- Schritte und Wucht
  footstep(R, t, o) { // leichtes Getrappel (o.big → schwer)
    if (o.big) return SFX.stomp(R, t, { big: false });
    const v = mk(R, 'footstep', 0); if (!v) return; const k = 0.85 + clamp(o.v ?? 0.5, 0, 1) * 0.3, n = 1 + (R.rng() < 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) { const s = t + i * 0.045, p = k * (0.85 + R.rng() * 0.3); v.tone(s, { f: 210 * p, f2: 105 * p, a: 0.003, d: 0.07, peak: 0.35 }); v.nz(s, { type: 'lowpass', f: 700 * p, a: 0.002, d: 0.05, peak: 0.3 }); }
  },
  stomp(R, t, o) { // dumpfer Schritt mit minimalem Bodenbeben
    const v = mk(R, 'stomp', 2); if (!v) return; const b = o.big !== false ? 1 : 0.6;
    v.tone(t, { f: 58 * (b > 0.9 ? 1 : 1.3), f2: 31, gl: 0.35, a: 0.008, d: 0.45 * b + 0.2, peak: 0.8 });
    v.tone(t, { f: 118, f2: 62, gl: 0.2, a: 0.008, d: 0.22, peak: 0.34 }); // Oberton, damit kleine Lautsprecher es hören
    v.nz(t, { kind: 'brown', type: 'lowpass', f: 140, f2: 60, a: 0.01, d: 0.5 * b, peak: 0.6 }); v.nz(t, { type: 'lowpass', f: 900, a: 0.003, d: 0.06, peak: 0.22 });
    if (b > 0.9) v.nz(t + 0.02, { kind: 'brown', type: 'lowpass', f: 55, a: 0.1, d: 0.9, peak: 0.3 });
  },
  swing(R, t) { const v = mk(R, 'swing'); if (!v) return; v.nz(t, { f: 300, f2: 1400, q: 1, a: 0.2, d: 0.12, peak: 0.4 }); v.nz(t + 0.28, { f: 1400, f2: 380, q: 1, a: 0.01, d: 0.25, peak: 0.34 }); v.tone(t, { f: 120, f2: 90, a: 0.1, d: 0.3, peak: 0.1 }); },
  flap(R, t) { // Flügelschlag: zwei weiche „Fwup“
    const v = mk(R, 'flap'); if (!v) return;
    for (let i = 0; i < 2; i++) { const s = t + i * 0.15, p = 0.9 + R.rng() * 0.2; v.nz(s, { type: 'lowpass', f: 1200 * p, f2: 500, q: 0.8, a: 0.03, d: 0.1, peak: 0.35 }); v.tone(s, { f: 140 * p, f2: 90, a: 0.01, d: 0.1, peak: 0.15 }); }
  },
  splash(R, t, o) { // Platschen (o.big → größer, länger)
    const v = mk(R, 'splash'); if (!v) return; const b = o.big ? 1 : 0.6;
    v.nz(t, { kind: 'white', f: 2000, f2: 900, q: 0.8, a: 0.005, d: 0.5 * b + 0.2, peak: 0.5 }); v.nz(t, { type: 'highpass', f: 4000, a: 0.004, d: 0.2 * b + 0.1, peak: 0.15 });
    const n = o.big ? 6 : 3; for (let i = 0; i < n; i++) { const s = t + 0.03 + R.rng() * 0.4 * b, f = 350 + R.rng() * 700; v.tone(s, { f, f2: f * 1.9, gl: 0.05, a: 0.004, d: 0.07, peak: 0.14 }); }
  },
  bubble(R, t) { const v = mk(R, 'bubble', 0); if (!v) return; const f = 400 + R.rng() * 500; v.tone(t, { f, f2: f * 1.8, gl: 0.05, a: 0.004, d: 0.07, peak: 0.3 }); },
  dive(R, t) { const v = mk(R, 'dive'); if (!v) return; v.nz(t, { kind: 'white', f: 3000, f2: 500, q: 2, a: 0.08, d: 0.55, peak: 0.35 }); v.tone(t, { f: 1500, f2: 450, a: 0.05, d: 0.6, peak: 0.12 }); },
  wave(R, t) { const v = mk(R, 'wave'); if (!v) return; v.nz(t, { type: 'lowpass', f: 400, f2: 1800, q: 0.7, a: 0.5, d: 0.9, peak: 0.45 }); v.nz(t + 0.3, { kind: 'white', type: 'highpass', f: 3000, a: 0.5, d: 0.8, peak: 0.12 }); },
  crack(R, t) { // Knacken: drei kleine Brüche
    const v = mk(R, 'crack'); if (!v) return;
    for (let i = 0; i < 3; i++) { const s = t + R.rng() * 0.1; v.nz(s, { kind: 'white', f: 2500 + R.rng() * 2000, q: 5, a: 0.001, d: 0.012, peak: 0.4 }); v.tone(s, { f: 900, f2: 500, a: 0.0015, d: 0.02, peak: 0.12 }); }
  },
  splinter(R, t) { // Splitter: viele winzige helle Tickser
    const v = mk(R, 'splinter'); if (!v) return;
    for (let i = 0; i < 9; i++) { const s = t + R.rng() * 0.32; v.tone(s, { f: 1500 + R.rng() * 2500, a: 0.001, d: 0.025, peak: 0.1 + R.rng() * 0.08 }); v.nz(s, { kind: 'white', type: 'highpass', f: 3000, a: 0.001, d: 0.01, peak: 0.06 }); }
  },
  peep(R, t) { // Küken-Piepsen: hohe Sinus-Blips mit Vibrato
    const v = mk(R, 'peep'); if (!v) return;
    for (let i = 0; i < 2; i++) { const s = t + i * 0.19, f = 2700 + R.rng() * 500, p = v.tone(s, { f, f2: f * 1.2, gl: 0.05, a: 0.008, d: 0.1, peak: 0.3 }); v.vib(p, 9, 45, s, s + 0.15); }
  },
  whoosh(R, t) { const v = mk(R, 'whoosh'); if (!v) return; v.nz(t, { type: 'lowpass', f: 220, f2: 1100, q: 0.8, a: 0.25, d: 0.65, peak: 0.6 }); v.tone(t, { f: 100, f2: 55, a: 0.2, d: 0.7, peak: 0.35 }); v.nz(t + 0.1, { kind: 'white', type: 'highpass', f: 2500, a: 0.3, d: 0.4, peak: 0.07 }); },
  rumble(R, t, o) { // tiefes Grollen mit langsamem Zittern (AM über eigenen Gain, damit das Ende sauber ausläuft)
    const d = o.dur || 1.8, v = mk(R, 'rumble', 2); if (!v) return;
    const am = v.g(0.75), l = v.osc('sine', 7.5, t, t + d + 0.5), lg = v.g(0.25); l.connect(lg); lg.connect(am.gain); am.connect(v.out);
    v.nz(t, { kind: 'brown', type: 'lowpass', f: 90, q: 0.7, a: 0.2, d, peak: 0.8, dest: am }); v.tone(t, { f: 41, a: 0.25, d, peak: 0.25, dest: am });
  },
  thud(R, t) { const v = mk(R, 'thud'); if (!v) return; v.tone(t, { f: 105, f2: 52, a: 0.005, d: 0.2, peak: 0.6 }); v.nz(t, { type: 'lowpass', f: 400, a: 0.003, d: 0.08, peak: 0.3 }); },
  chime(R, t, o) { const v = mk(R, 'chime'); if (!v) return; const m = dm(o.note != null ? o.note : 7 + ((R.rng() * 7) | 0), 74); v.bell(t, mtof(m), [[1, 1, 1.6], [2.76, 0.25, 0.4], [5.4, 0.1, 0.15]], 0.3); v.send(0.3); },
  grow(R, t) { // „WACHSE!“: Rascheln + aufsteigende Töne
    const v = mk(R, 'grow', 2); if (!v) return;
    v.nz(t, { f: 1200, f2: 3600, q: 1.5, a: 0.35, d: 0.5, peak: 0.3 });
    for (let i = 0; i < 6; i++) v.bell(t + 0.08 + i * 0.1, mtof(dm(i, 67)), [[1, 1, 0.5], [4, 0.15, 0.1]], 0.16);
    v.bell(t + 0.75, mtof(dm(13)), [[1, 1, 1.2], [2.76, 0.2, 0.3]], 0.14); v.send(0.25);
  },
  rustle(R, t) { // Blätter, Schilf, Stoff rascheln
    const v = mk(R, 'rustle'); if (!v) return;
    v.nz(t, { f: 2000, q: 0.7, a: 0.08, d: 0.3, peak: 0.12 });
    for (let i = 0; i < 5; i++) v.nz(t + R.rng() * 0.4, { kind: 'white', f: 2800 + R.rng() * 1800, q: 2.5, a: 0.01, d: 0.06, peak: 0.1 + R.rng() * 0.12 });
  },
  horn(R, t, o) { // tiefes, weiches Signalhorn (Tempel, Tal); o.f = Grundfrequenz (Standard 98 Hz)
    const v = mk(R, 'horn', 2); if (!v) return; horn(v, t, o.f || 98, 1.6, 1); v.send(0.45);
  },
  tapp(R, t) { const v = mk(R, 'tapp', 0); if (!v) return; const p = 0.92 + R.rng() * 0.16; v.tone(t, { f: 190 * p, f2: 120 * p, a: 0.003, d: 0.06, peak: 0.28 }); v.nz(t, { type: 'lowpass', f: 900, a: 0.003, d: 0.05, peak: 0.22 }); v.nz(t, { kind: 'white', type: 'highpass', f: 4000, a: 0.005, d: 0.08, peak: 0.04 }); },
  woodcrack(R, t) { // Holzkrachen
    const v = mk(R, 'woodcrack', 2); if (!v) return;
    v.nz(t, { f: 1400, f2: 500, q: 1.5, a: 0.002, d: 0.06, peak: 0.55 });
    for (let i = 0; i < 3; i++) v.nz(t + 0.06 + i * 0.11 + R.rng() * 0.05, { f: 800 - i * 150, f2: 350, q: 2, a: 0.002, d: 0.08 + i * 0.03, peak: 0.35 - i * 0.07 });
    v.tone(t, { f: 90, f2: 50, a: 0.004, d: 0.22, peak: 0.5 });
  },
  ping(R, t) { const v = mk(R, 'ping'); if (!v) return; v.tone(t, { f: 1760, a: 0.003, d: 0.55, peak: 0.28 }); v.tone(t, { f: 3520, a: 0.003, d: 0.2, peak: 0.06 }); v.send(0.2); },
  musicbox(R, t, o) { playMelody(R, t, o); }, // Abschiedsmelodie: Titelthema auf der Harfe (ca. 16 s)
  tweet(R, t, o) { playBird(R, t, o); },

  // ---------- Ägypten: Handwerk, Haushalt, Tempel
  chisel(R, t, o) { // Meißel/Schlägel auf Stein: helles „Tink“ + dumpfer Holzschlag; o.n = Schläge (1…4), o.v = Härte 0…1
    const v = mk(R, 'chisel'); if (!v) return; const n = clamp(o.n || 1, 1, 4), p = 0.92 + R.rng() * 0.16, h = clamp(o.v ?? 0.6, 0, 1);
    for (let i = 0; i < n; i++) {
      const s = t + i * 0.17, q = p * (1 + i * 0.03);
      v.bell(s, 1850 * q, [[1, 1, 0.09], [1.62, 0.5, 0.06], [2.7, 0.25, 0.04]], 0.2 + 0.2 * h); v.tone(s, { f: 230 * q, f2: 140 * q, a: 0.002, d: 0.07, peak: 0.35 });
      v.nz(s, { kind: 'white', f: 3300, q: 1.6, a: 0.001, d: 0.015, peak: 0.28 });
    }
    v.send(0.2);
  },
  sand(R, t, o) { // Sand rieselt: körniges Rauschen (drei unrunde Modulationen); o.dur (s), o.v = Menge 0…1
    const v = mk(R, 'sand', 0); if (!v) return; const d = clamp(o.dur || 1.4, 0.3, 6), x = clamp(o.v ?? 0.6, 0, 1), e = t + d + 0.15, out = shape(v, t, d, 0.12, 0.25 + 0.45 * x);
    const hp = v.f('highpass', 3000, 0.5); amNoise(v, t, e, { kind: 'white', f: 5200, q: 0.8, base: 0.5, lfo: [[13, 0.15], [19.7, 0.15], [29.3, 0.12]], dest: hp }); hp.connect(out);
    for (let i = 0; i < 3; i++) v.tone(t + d * (0.2 + 0.2 * i) + R.rng() * 0.1, { f: 2600 + R.rng() * 1500, a: 0.001, d: 0.01, peak: 0.04 * x }); // einzelne größere Körner
  },
  quern(R, t, o) { // Mahlstein: kratzendes Hin und Her (≈ 2 Strich/s); o.dur (s)
    const v = mk(R, 'quern'); if (!v) return; const d = clamp(o.dur || 1.5, 0.4, 6), e = t + d + 0.15, out = shape(v, t, d, 0.1, 0.8);
    amNoise(v, t, e, { f: 900, q: 1.1, base: 0.5, lfo: [[2.1, 0.45]], dest: out });
    amNoise(v, t, e, { kind: 'white', type: 'highpass', f: 3200, q: 0.5, base: 0.08, lfo: [[2.1, 0.07], [11, 0.03]], dest: out });
    amNoise(v, t, e, { kind: 'pink', type: 'lowpass', f: 220, q: 0.7, base: 0.4, lfo: [[2.1, 0.3]], dest: out });
  },
  sistrum(R, t, o) { // Sistrum-Rasseln: Metallplättchen; o.n = Plättchen (6…24), o.v = Stärke 0…1
    const v = mk(R, 'sistrum'); if (!v) return; const x = clamp(o.v ?? 0.7, 0, 1);
    rattle(v, t, 0.5 + 0.5 * x, v.out, clamp(o.n || 14, 6, 24), 0.55); v.tone(t + 0.05, { f: 4200, a: 0.004, d: 0.28, peak: 0.05 }); v.send(0.3);
  },
  harp(R, t, o) { // Zupfton der Harfe; o.note = Stufe der Tonleiter (0 = D5, 7 = D6, negativ = tiefer), o.midi = frei, o.inst = 'lute'
    const v = mk(R, 'harp'); if (!v) return; const m = o.midi ?? dm(o.note ?? 3 + ((R.rng() * 6) | 0), 74);
    pluck(v, t, m, clamp(o.vel ?? 0.9, 0.2, 1), v.out, o.inst === 'lute' ? 'lute' : 'harp'); v.send(0.25);
  },
  scale(R, t, o) { // Waage: zwei feine Metalltick + leises Quietschen; o.v = Neigung 0…1 (Tonhöhe des Quietschens), o.tick = nur Ticken
    const v = mk(R, 'scale'); if (!v) return; const x = clamp(o.v ?? 0.5, 0, 1);
    for (let i = 0; i < 2; i++) v.bell(t + i * 0.13, 2900 * (i ? 0.86 : 1), [[1, 1, 0.05], [2.4, 0.4, 0.03]], 0.28);
    if (o.tick) return;
    const lp = v.f('lowpass', 1500, 1.1); lp.connect(v.out); const s = v.tone(t + 0.05, { w: 'sawtooth', f: 380 + 260 * x, f2: 330 + 220 * x, a: 0.03, d: 0.3, peak: 0.07, dest: lp }); v.vib(s, 19, 14, t + 0.05, t + 0.4);
  },
  door(R, t, o) { // schwere Tür/Tor knarrt auf: tiefes Knarren (Haftreibung), Steinschaben, leises Ausrasten; o.dur (s), o.v = Tonhöhe 0…1
    const v = mk(R, 'door', 2); if (!v) return; const d = clamp(o.dur || 1.9, 0.8, 5), x = clamp(o.v ?? 0.5, 0, 1), e = t + d + 0.5, out = shape(v, t, d, 0.25, 0.9);
    const cr = v.osc('sawtooth', 105 + 40 * x, t, e); cr.frequency.setValueAtTime(105 + 40 * x, t); cr.frequency.linearRampToValueAtTime(140 + 40 * x, t + d * 0.5); cr.frequency.linearRampToValueAtTime(98 + 30 * x, t + d);
    const bp = v.f('bandpass', 500, 5); bp.frequency.setValueAtTime(450, t); bp.frequency.exponentialRampToValueAtTime(1400, t + d * 0.55); bp.frequency.exponentialRampToValueAtTime(600, t + d);
    const am = v.g(0.55), l = v.osc('sine', 17, t, e), lg = v.g(0.4); l.connect(lg); lg.connect(am.gain); cr.connect(bp); bp.connect(am); const cg = v.g(0.5); am.connect(cg); cg.connect(out);
    amNoise(v, t, e, { kind: 'pink', type: 'lowpass', f: 260, q: 0.7, base: 0.25, lfo: [[3.1, 0.1]], dest: out });
    v.tone(t + d, { f: 110, f2: 62, a: 0.01, d: 0.22, peak: 0.3 }); v.send(0.3);
  },
  fire(R, t, o) { // kurzes Knistern; o.v = Stärke 0…1 (Dichte der Knacker und Pegel), o.dur (s)
    const v = mk(R, 'fire', 0); if (!v) return; const x = clamp(o.v ?? 0.5, 0, 1), d = clamp(o.dur || 1.3, 0.3, 6), e = t + d + 0.15, out = shape(v, t, d, 0.08, 0.35 + 0.65 * x);
    amNoise(v, t, e, { kind: 'pink', f: 1300, q: 0.5, base: 0.3, lfo: [[7.3, 0.2], [11.7, 0.15]], dest: out });
    const n = Math.round(3 + x * 14); for (let i = 0; i < n; i++) v.nz(t + R.rng() * d * 0.9, { kind: 'white', f: 2500 + R.rng() * 3500, q: 3, a: 0.001, d: 0.006 + R.rng() * 0.014, peak: 0.12 + 0.3 * R.rng() * (0.4 + 0.6 * x) });
  },
  oar(R, t, o) { // Ruderplatsch: Holzknacken an der Dolle + Eintauchen + Tropfen; o.big = kräftiger Zug
    const v = mk(R, 'oar'); if (!v) return; const b = o.big ? 1.25 : 1;
    v.tone(t, { f: 210, f2: 150, a: 0.002, d: 0.05, peak: 0.28 });
    v.nz(t + 0.03, { f: 900, f2: 420, q: 0.9, a: 0.01, d: 0.28 * b, peak: 0.42 }); v.nz(t + 0.03, { kind: 'white', type: 'highpass', f: 3500, a: 0.004, d: 0.12, peak: 0.08 });
    const f = 280 + R.rng() * 100; v.tone(t + 0.05, { f, f2: f * 2.2, gl: 0.06, a: 0.004, d: 0.1, peak: 0.22 });
    for (let i = 0; i < 3; i++) { const g = 500 + R.rng() * 600; v.tone(t + 0.22 + i * 0.07 + R.rng() * 0.04, { f: g, f2: g * 1.7, gl: 0.04, a: 0.003, d: 0.05, peak: 0.1 }); }
  },
  sail(R, t, o) { // Segel flattert: vier weiche Tuchschläge, dann Nachrascheln; o.v = Wind 0…1
    const v = mk(R, 'sail'); if (!v) return; const x = clamp(o.v ?? 0.6, 0, 1);
    for (let i = 0; i < 4; i++) { const s = t + i * (0.13 + 0.03 * i), p = 0.9 + R.rng() * 0.2; v.nz(s, { f: 750 * p, f2: 350, q: 0.6, a: 0.012, d: 0.12, peak: (0.55 - i * 0.1) * (0.6 + 0.4 * x) }); v.tone(s, { f: 150 * p, f2: 100, a: 0.01, d: 0.08, peak: 0.14 }); }
    v.nz(t + 0.5, { f: 1500, q: 0.6, a: 0.1, d: 0.4, peak: 0.1 * (0.5 + x) });
  },
  water(R, t) { // Wasser schöpfen: Eintauchen, Füllen (aufsteigende Blubbern), Ausgießen
    const v = mk(R, 'water'); if (!v) return;
    v.nz(t, { f: 380, f2: 1100, q: 1.2, a: 0.05, d: 0.35, peak: 0.35 });
    for (let i = 0; i < 5; i++) { const f = 350 + R.rng() * 500; v.tone(t + 0.08 + i * 0.09 + R.rng() * 0.04, { f, f2: f * 1.8, gl: 0.05, a: 0.004, d: 0.07, peak: 0.16 }); }
    v.nz(t + 0.5, { kind: 'white', f: 2200, q: 0.6, a: 0.06, d: 0.5, peak: 0.22 });
    for (let i = 0; i < 3; i++) { const f = 700 + R.rng() * 800; v.tone(t + 0.9 + i * 0.08, { f, f2: f * 1.5, gl: 0.04, a: 0.003, d: 0.05, peak: 0.08 }); }
  },
  papyrus(R, t) { // Papyrus knistert: trockenes Papier
    const v = mk(R, 'papyrus'); if (!v) return;
    v.nz(t, { f: 2400, q: 0.7, a: 0.03, d: 0.35, peak: 0.2 }); v.nz(t + 0.1, { f: 700, q: 1, a: 0.04, d: 0.25, peak: 0.1 });
    for (let i = 0; i < 8; i++) v.nz(t + R.rng() * 0.45, { kind: 'white', f: 3000 + R.rng() * 3000, q: 3, a: 0.001, d: 0.01 + R.rng() * 0.02, peak: 0.1 + 0.18 * R.rng() });
  },
  bread(R, t, o) { // Teig kneten: weiche Drücker mit feuchtem Schmatzen; o.n = Drücker (1…5)
    const v = mk(R, 'bread'); if (!v) return; const n = clamp(o.n || 3, 1, 5);
    for (let i = 0; i < n; i++) {
      const s = t + i * 0.28;
      v.tone(s, { f: 220, f2: 140, a: 0.012, d: 0.1, peak: 0.3 }); v.nz(s, { type: 'lowpass', f: 900, f2: 380, q: 0.8, a: 0.015, d: 0.12, peak: 0.4 }); v.nz(s + 0.05, { f: 900, f2: 400, q: 4, a: 0.02, d: 0.09, peak: 0.08 });
    }
  },
  gold(R, t) { // heller Glanzton: drei aufsteigende Glöckchen mit Funkeln
    const v = mk(R, 'gold', 2); if (!v) return;
    [10, 12, 14].forEach((d, i) => v.bell(t + i * 0.07, mtof(dm(d)), [[1, 1, 1.5], [2.01, 0.4, 0.9], [3.01, 0.18, 0.5], [4.2, 0.08, 0.3]], 0.22));
    v.nz(t, { kind: 'white', type: 'highpass', f: 7000, a: 0.003, d: 0.15, peak: 0.04 }); v.send(0.35);
  },
  seal(R, t) { // Siegel/Stempel: dumpfer Druck auf Ton, kurzes Schmatzen
    const v = mk(R, 'seal'); if (!v) return;
    v.tone(t, { f: 190, f2: 110, a: 0.003, d: 0.12, peak: 0.4 }); v.nz(t, { f: 900, q: 0.9, a: 0.002, d: 0.04, peak: 0.45 }); v.nz(t, { kind: 'white', f: 2400, q: 1.2, a: 0.001, d: 0.02, peak: 0.15 }); v.nz(t + 0.06, { type: 'lowpass', f: 1000, f2: 400, a: 0.01, d: 0.08, peak: 0.08 });
  },
  torch(R, t) { // Fackel an: Auffauchen (Rauschen steigt), tiefes „Fwump“, einzelne Knister
    const v = mk(R, 'torch', 2); if (!v) return;
    v.nz(t, { f: 280, f2: 1700, q: 1.1, a: 0.12, d: 0.3, peak: 0.45 }); v.nz(t, { kind: 'brown', type: 'lowpass', f: 260, a: 0.02, d: 0.35, peak: 0.3 }); v.tone(t, { f: 110, f2: 70, a: 0.02, d: 0.3, peak: 0.25 }); v.nz(t, { f: 700, f2: 1400, q: 0.6, a: 0.04, d: 0.3, peak: 0.3 });
    for (let i = 0; i < 6; i++) v.nz(t + 0.25 + R.rng() * 0.8, { kind: 'white', f: 2500 + R.rng() * 3500, q: 3, a: 0.001, d: 0.006 + R.rng() * 0.014, peak: 0.12 + 0.2 * R.rng() });
  },
};
export const SFX_NAMES = Object.keys(SFX);

/** Mindestabstand je Name (s), damit häufiges Aufrufen (Ziehen, Schritte) nicht zuklebt. */
export const GAP = {
  turn: 0.15, lift: 0.1, land: 0.1, grab: 0.1, snap: 0.06, card: 0.1, found: 0.3, tick: 0.035, gong: 0.5, slide: 0.05, flapOpen: 0.2, flapClose: 0.2, pop: 0.06,
  footstep: 0.08, stomp: 0.15, swing: 0.25, flap: 0.12, splash: 0.1, bubble: 0.06, dive: 0.3, wave: 0.4, crack: 0.04, splinter: 0.08, peep: 0.06,
  whoosh: 0.3, rumble: 0.5, thud: 0.06, chime: 0.08, grow: 0.4, rustle: 0.12, horn: 0.5, tapp: 0.07, woodcrack: 0.15, ping: 0.08,
  musicbox: 2, tweet: 0.1,
  chisel: 0.1, sand: 0.3, quern: 0.4, sistrum: 0.25, harp: 0.05, scale: 0.15, door: 0.8, fire: 0.15, oar: 0.25, sail: 0.3, water: 0.4, papyrus: 0.2, bread: 0.25, gold: 0.2, seal: 0.2, torch: 0.5,
};
