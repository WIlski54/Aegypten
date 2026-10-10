// sfx.js – Einmal-Geräusche. Jede Funktion: (R = Rig, t = Startzeit, o = Optionen). Jedes Geräusch ist ein einziger Voice (ein Pool-Platz).
// Alle Einsätze haben mindestens 1.5 ms Anstieg (Ticks) bzw. 3–10 ms (Dumpfes/Lautes); nichts startet oder endet mit einem Sprung.
import { clamp, mtof } from './synth.js';
import { playVoice, playBird } from './voices.js';
import { playMelody } from './music.js';

const PENT = [0, 2, 4, 7, 9];
const pent = (i, root = 72) => root + PENT[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5);
const mk = (R, name, prio = 1, bus = 'fx') => R.voice(prio, bus, 'sfx:' + name);

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
    if (o.cover) { v.tone(t, { f: 72, f2: 40, a: 0.006, d: 0.32, peak: 0.6 }); v.nz(t, { kind: 'brown', type: 'lowpass', f: 320, a: 0.004, d: 0.2, peak: 0.5 }); }
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
  found(R, t) { // Fund eines versteckten Säugetiers: kleines Celesta-Glitzern
    const v = mk(R, 'found', 3); if (!v) return;
    [76, 79, 84, 88].forEach((m, i) => v.bell(t + i * 0.085, mtof(m), [[1, 1, 1.1], [4, 0.28, 0.4], [2, 0.1, 0.6]], 0.3));
    v.bell(t + 0.4, mtof(91), [[1, 1, 1.4], [4, 0.2, 0.5]], 0.18); v.send(0.4);
  },
  tick(R, t, o) { // Uhrticken (Tick/Tack im Wechsel); schneller beim Drehen
    const v = mk(R, 'tick'); if (!v) return; R.tickPar = !R.tickPar; const k = (R.tickPar ? 1 : 0.78) * (1 + Math.min(0.4, (o.rate || 0) * 0.8)), s = o.fast ? 0.7 : 1;
    v.tone(t, { f: 2400 * k, f2: 1900 * k, a: 0.0015, d: 0.018 * s, peak: 0.3 }); v.nz(t, { kind: 'white', f: 3800 * k, q: 3, a: 0.0015, d: 0.012 * s, peak: 0.22 }); v.tone(t, { f: 520 * k, a: 0.002, d: 0.03 * s, peak: 0.12 });
  },
  gong(R, t) { // weicher Gong bei Mitternacht
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
  footstep(R, t, o) { // leichtes Getrappel des Rudels (o.big → schwer)
    if (o.big) return SFX.stomp(R, t, { big: false });
    const v = mk(R, 'footstep', 0); if (!v) return; const k = 0.85 + clamp(o.v ?? 0.5, 0, 1) * 0.3, n = 1 + (R.rng() < 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) { const s = t + i * 0.045, p = k * (0.85 + R.rng() * 0.3); v.tone(s, { f: 210 * p, f2: 105 * p, a: 0.003, d: 0.07, peak: 0.35 }); v.nz(s, { type: 'lowpass', f: 700 * p, a: 0.002, d: 0.05, peak: 0.3 }); }
  },
  stomp(R, t, o) { // dumpfer Sub-Bass-Schritt mit minimalem Bodenbeben
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
  chomp(R, t) { // Biss: Bums + Holzklack, ein leichtes Nachklappen
    const v = mk(R, 'chomp'); if (!v) return;
    v.tone(t, { f: 170, f2: 70, a: 0.004, d: 0.12, peak: 0.6 }); v.nz(t, { f: 900, q: 1, a: 0.003, d: 0.05, peak: 0.5 });
    v.tone(t + 0.11, { f: 120, f2: 60, a: 0.004, d: 0.08, peak: 0.3 }); v.nz(t + 0.11, { f: 700, q: 1, a: 0.003, d: 0.04, peak: 0.22 });
  },
  crack(R, t) { // Knacken: drei kleine Brüche
    const v = mk(R, 'crack'); if (!v) return;
    for (let i = 0; i < 3; i++) { const s = t + R.rng() * 0.1; v.nz(s, { kind: 'white', f: 2500 + R.rng() * 2000, q: 5, a: 0.001, d: 0.012, peak: 0.4 }); v.tone(s, { f: 900, f2: 500, a: 0.0015, d: 0.02, peak: 0.12 }); }
  },
  splinter(R, t) { // Holzsplitter: viele winzige helle Tickser
    const v = mk(R, 'splinter'); if (!v) return;
    for (let i = 0; i < 9; i++) { const s = t + R.rng() * 0.32; v.tone(s, { f: 1500 + R.rng() * 2500, a: 0.001, d: 0.025, peak: 0.1 + R.rng() * 0.08 }); v.nz(s, { kind: 'white', type: 'highpass', f: 3000, a: 0.001, d: 0.01, peak: 0.06 }); }
  },
  peep(R, t) { // Küken-Piepsen: hohe Sinus-Blips mit Vibrato
    const v = mk(R, 'peep'); if (!v) return;
    for (let i = 0; i < 2; i++) { const s = t + i * 0.19, f = 2700 + R.rng() * 500, p = v.tone(s, { f, f2: f * 1.2, gl: 0.05, a: 0.008, d: 0.1, peak: 0.3 }); v.vib(p, 9, 45, s, s + 0.15); }
  },
  hatch(R, t) { // Schlüpfen: Risse, Papierschale klappt auf, ganz leises Piepsen
    const v = mk(R, 'hatch', 2); if (!v) return;
    for (let i = 0; i < 4; i++) { const s = t + i * 0.07 + R.rng() * 0.04; v.nz(s, { kind: 'white', f: 2500 + R.rng() * 2000, q: 5, a: 0.001, d: 0.012, peak: 0.35 }); }
    v.nz(t + 0.2, { f: 600, f2: 2400, q: 1.2, a: 0.05, d: 0.15, peak: 0.25 });
    const p = v.tone(t + 0.45, { f: 2900, f2: 3400, gl: 0.06, a: 0.01, d: 0.1, peak: 0.16 }); v.vib(p, 9, 45, t + 0.45, t + 0.6);
  },
  whoosh(R, t) { const v = mk(R, 'whoosh'); if (!v) return; v.nz(t, { type: 'lowpass', f: 220, f2: 1100, q: 0.8, a: 0.25, d: 0.65, peak: 0.6 }); v.tone(t, { f: 100, f2: 55, a: 0.2, d: 0.7, peak: 0.35 }); v.nz(t + 0.1, { kind: 'white', type: 'highpass', f: 2500, a: 0.3, d: 0.4, peak: 0.07 }); },
  rumble(R, t, o) { // tiefes Grollen mit langsamem Zittern (AM über eigenen Gain, damit das Ende sauber ausläuft)
    const d = o.dur || 1.8, v = mk(R, 'rumble', 2); if (!v) return;
    const am = v.g(0.75), l = v.osc('sine', 7.5, t, t + d + 0.5), lg = v.g(0.25); l.connect(lg); lg.connect(am.gain); am.connect(v.out);
    v.nz(t, { kind: 'brown', type: 'lowpass', f: 90, q: 0.7, a: 0.2, d, peak: 0.8, dest: am }); v.tone(t, { f: 41, a: 0.25, d, peak: 0.25, dest: am });
  },
  impact(R, t, o) { // Einschlag: tiefer Boom (Sub 30–40 Hz) mit Rauschen, weicher Einsatz (8 ms), über den Limiter begrenzt
    const v = R.voice(3, 'over', 'sfx:impact'); if (!v) return; const k = R.calm ? 0.8 : 1;
    v.tone(t, { f: 40, f2: 27, gl: 1.4, a: 0.008, d: 2.8, peak: 0.85 * k });
    v.tone(t, { f: 80, f2: 54, gl: 1.2, a: 0.01, d: 1.6, peak: 0.34 * k }); // Oberton für kleine Lautsprecher
    v.tone(t, { f: 120, f2: 80, gl: 1.0, a: 0.01, d: 0.9, peak: 0.12 * k });
    v.nz(t, { kind: 'brown', type: 'lowpass', f: 700, f2: 70, a: 0.012, d: 2.2, peak: 0.7 * k });
    v.nz(t, { type: 'bandpass', f: 1000, f2: 300, q: 0.7, a: 0.008, d: 0.25, peak: 0.25 * k }); // weicher „Knall“
  },
  thud(R, t) { const v = mk(R, 'thud'); if (!v) return; v.tone(t, { f: 105, f2: 52, a: 0.005, d: 0.2, peak: 0.6 }); v.nz(t, { type: 'lowpass', f: 400, a: 0.003, d: 0.08, peak: 0.3 }); },
  chime(R, t, o) { const v = mk(R, 'chime'); if (!v) return; const m = o.note != null ? pent(o.note, 79) : pent((R.rng() * 7) | 0, 79); v.bell(t, mtof(m), [[1, 1, 1.6], [2.76, 0.25, 0.4], [5.4, 0.1, 0.15]], 0.3); v.send(0.3); },
  grow(R, t) { // „WACHSE!“: Rascheln + aufsteigende Töne
    const v = mk(R, 'grow', 2); if (!v) return;
    v.nz(t, { f: 1200, f2: 3600, q: 1.5, a: 0.35, d: 0.5, peak: 0.3 });
    for (let i = 0; i < 6; i++) v.bell(t + 0.08 + i * 0.1, mtof(pent(i, 74)), [[1, 1, 0.5], [4, 0.15, 0.1]], 0.16);
    v.bell(t + 0.75, mtof(91), [[1, 1, 1.2], [2.76, 0.2, 0.3]], 0.14); v.send(0.25);
  },
  rustle(R, t) { // Blätter rascheln
    const v = mk(R, 'rustle'); if (!v) return;
    v.nz(t, { f: 2000, q: 0.7, a: 0.08, d: 0.3, peak: 0.12 });
    for (let i = 0; i < 5; i++) v.nz(t + R.rng() * 0.4, { kind: 'white', f: 2800 + R.rng() * 1800, q: 2.5, a: 0.01, d: 0.06, peak: 0.1 + R.rng() * 0.12 });
  },
  horn(R, t, o) { playVoice(R, 'brachiosaurus', t, { cine: o.cine }); }, // tiefes Hornen des Sauropoden
  tapp(R, t) { const v = mk(R, 'tapp', 0); if (!v) return; const p = 0.92 + R.rng() * 0.16; v.tone(t, { f: 190 * p, f2: 120 * p, a: 0.003, d: 0.06, peak: 0.28 }); v.nz(t, { type: 'lowpass', f: 900, a: 0.003, d: 0.05, peak: 0.22 }); v.nz(t, { kind: 'white', type: 'highpass', f: 4000, a: 0.005, d: 0.08, peak: 0.04 }); },
  fossil(R, t) { // „Klack“ mit kurzem Hall
    const v = mk(R, 'fossil', 2); if (!v) return;
    v.nz(t, { kind: 'white', f: 1900, q: 3, a: 0.0015, d: 0.012, peak: 0.5 }); v.tone(t, { f: 820, f2: 380, a: 0.0015, d: 0.035, peak: 0.35 }); v.tone(t, { f: 260, f2: 150, a: 0.002, d: 0.06, peak: 0.3 }); v.send(0.6);
  },
  woodcrack(R, t) { // Holzkrachen
    const v = mk(R, 'woodcrack', 2); if (!v) return;
    v.nz(t, { f: 1400, f2: 500, q: 1.5, a: 0.002, d: 0.06, peak: 0.55 });
    for (let i = 0; i < 3; i++) v.nz(t + 0.06 + i * 0.11 + R.rng() * 0.05, { f: 800 - i * 150, f2: 350, q: 2, a: 0.002, d: 0.08 + i * 0.03, peak: 0.35 - i * 0.07 });
    v.tone(t, { f: 90, f2: 50, a: 0.004, d: 0.22, peak: 0.5 });
  },
  ping(R, t) { const v = mk(R, 'ping'); if (!v) return; v.tone(t, { f: 1760, a: 0.003, d: 0.55, peak: 0.28 }); v.tone(t, { f: 3520, a: 0.003, d: 0.2, peak: 0.06 }); v.send(0.2); },
  musicbox(R, t, o) { playMelody(R, t, o); }, // Abschiedsmelodie (ca. 16 s)
  tinnitus(R, t) { // Ohrensausen nach dem Einschlag: leise, hoch, weich ein- und ausblendend
    const v = R.voice(3, 'over', 'sfx:tinnitus'); if (!v) return; const g = v.g(0), a = v.osc('sine', 5600, t, t + 8), b = v.osc('sine', 5640, t, t + 8), c = v.osc('sine', 3300, t, t + 8), cg = v.g(0.25);
    c.connect(cg); cg.connect(g); a.connect(g); b.connect(g); g.connect(v.out);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.5); g.gain.setValueAtTime(0.5, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0005, t + 7.4); g.gain.linearRampToValueAtTime(0, t + 7.6);
  },
  tweet(R, t, o) { playBird(R, t, o); },
};
export const SFX_NAMES = Object.keys(SFX);

/** Mindestabstand je Name (s), damit häufiges Aufrufen (Ziehen, Schritte) nicht zuklebt. */
export const GAP = {
  turn: 0.15, lift: 0.1, land: 0.1, grab: 0.1, snap: 0.06, card: 0.1, found: 0.3, tick: 0.035, gong: 0.5, slide: 0.05, flapOpen: 0.2, flapClose: 0.2, pop: 0.06,
  footstep: 0.08, stomp: 0.15, swing: 0.25, flap: 0.12, splash: 0.1, bubble: 0.06, dive: 0.3, wave: 0.4, chomp: 0.12, crack: 0.04, splinter: 0.08, peep: 0.06,
  hatch: 0.2, whoosh: 0.3, rumble: 0.5, impact: 1.5, thud: 0.06, chime: 0.08, grow: 0.4, rustle: 0.12, horn: 0.5, tapp: 0.07, fossil: 0.3, woodcrack: 0.15, ping: 0.08,
  musicbox: 2, tinnitus: 2, tweet: 0.1,
};
