// inst.js – ägyptisch angehauchte Klangbausteine (Harfe, Laute, Rohrflöte Ney, Rahmentrommel, Sistrum, Horn) und Tonleitern.
// Alle Funktionen arbeiten auf einer Voice `v` (Pool-Eintrag aus synth.js) und planen nur voraus (kein Zustand, keine Frame-Arbeit).
import { clamp, mtof, env } from './synth.js';

/** Tonleitern (Halbtöne über der Tonika): kleine Terz bzw. große Terz mit übermäßiger Sekunde. */
export const SC = {
  phryg: [0, 1, 4, 5, 7, 8, 10], // phrygisch-dominant (D Es Fis G A B C): übermäßige Sekunde Es–Fis
  hmin: [0, 2, 3, 5, 7, 8, 11], // harmonisch Moll: kleine Terz, übermäßige Sekunde B–Cis
  nah: [0, 2, 3, 5, 7, 8, 10], // natürlich Moll (Nahawand) – etwas weicher
  min5: [0, 3, 5, 7, 10], // Moll-Pentatonik für ganz ruhige Betten
};
/** MIDI-Note der Stufe i (0 = Tonika, negativ = darunter) in der Tonleiter sc über dem Grundton root. */
export function degMidi(i, root = 62, sc = 'phryg') {
  const s = SC[sc], n = s.length, k = Math.floor(i / n);
  return root + s[i - k * n] + 12 * k;
}

// ---------------------------------------------------------------- gezupfte Saiten
const HARP = [[1, 1, 1.9], [2, 0.55, 1.1], [3, 0.3, 0.7], [4, 0.18, 0.45], [5.03, 0.09, 0.3], [6.06, 0.04, 0.2]];
const LUTE = [[1, 1, 0.75], [2, 0.7, 0.4], [3, 0.42, 0.25], [4, 0.24, 0.15], [5.02, 0.12, 0.1]];
/** Gezupfte Saite (inst 'harp' = lange Harfe, 'lute' = kurze Laute/Oud). vel 0…1. */
export function pluck(v, t, m, vel, dest, inst) {
  const f = mtof(m), k = clamp(1.5 - (m - 48) / 48, 0.45, 1.6), base = inst === 'lute' ? LUTE : HARP; // höhere Saiten klingen kürzer
  v.bell(t, f, base.map(([r, a, d]) => [r, a, d * k]), 0.3 * vel, dest);
  v.nz(t, { kind: 'white', f: Math.min(f * 3.5, 9000), q: 1.5, a: 0.001, d: 0.018, peak: 0.035 * vel, dest });
}

// ---------------------------------------------------------------- Rohrflöte (Ney)
/** Ein Ney-Ton: Sinus mit leichtem Anblasen von unten, Vibrato erst später, Hauchrauschen, weicher Einsatz (0.1 s) und Ausklang (0.4 s). d = Haltezeit. */
export function ney(v, t, m, d, vel, dest) {
  const f = mtof(m), e = t + d + 0.5, o = v.osc('sine', f * 0.965, t, e), o2 = v.osc('sine', f * 2, t, e), o3 = v.osc('sine', f * 3, t, e);
  o.frequency.setValueAtTime(f * 0.965, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.1);
  v.vib(o, 4.8, f * 0.006, t + 0.3, e); v.vib(o2, 4.8, f * 0.012, t + 0.3, e);
  const g = v.g(0), g2 = v.g(0.2), g3 = v.g(0.09); o.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g); g.connect(dest || v.out);
  env(g.gain, t, [[0, 0], [0.1, 0.11 * vel], [d * 0.75, 0.09 * vel], [d + 0.45, 0]]);
  const nn = v.noise('white', t, e), bp = v.f('bandpass', f * 2.2, 2.5), ng = v.g(0); nn.connect(bp); bp.connect(ng); ng.connect(dest || v.out);
  env(ng.gain, t, [[0, 0], [0.07, 0.035 * vel], [d * 0.8, 0.02 * vel], [d + 0.45, 0]]);
}

// ---------------------------------------------------------------- Horn (langes, tiefes Signalhorn, weich)
export function horn(v, t, f, d, vel, dest) {
  const e = t + d + 0.9, o = v.osc('sawtooth', f * 0.94, t, e), lp = v.f('lowpass', 480, 0.9), g = v.g(0);
  o.frequency.setValueAtTime(f * 0.94, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.3); v.vib(o, 4.4, f * 0.004, t + 0.6, e);
  lp.frequency.setValueAtTime(260, t); lp.frequency.linearRampToValueAtTime(560, t + d * 0.6); o.connect(lp); lp.connect(g); g.connect(dest || v.out);
  env(g.gain, t, [[0, 0], [0.45, 0.2 * vel], [d, 0.17 * vel], [d + 0.85, 0]]);
}

// ---------------------------------------------------------------- Schlag
/** Rahmentrommel: 'dum' (Mitte, tief), 'tak' (Rand, trocken), 'ka' (leiser Nebenschlag). */
export function drum(v, t, kind, vel, dest) {
  if (kind === 'dum') { v.tone(t, { f: 165, f2: 88, gl: 0.09, a: 0.003, d: 0.3, peak: 0.5 * vel, dest }); v.nz(t, { type: 'lowpass', f: 700, a: 0.002, d: 0.07, peak: 0.22 * vel, dest }); }
  else if (kind === 'tak') { v.nz(t, { kind: 'white', f: 2600, q: 1.4, a: 0.0015, d: 0.05, peak: 0.22 * vel, dest }); v.tone(t, { f: 330, f2: 260, a: 0.002, d: 0.06, peak: 0.1 * vel, dest }); }
  else v.nz(t, { f: 1500, q: 1, a: 0.002, d: 0.03, peak: 0.1 * vel, dest });
}
/** Sistrum-Rasseln: n kleine Metallplättchen in span Sekunden, schwillt an und klingt ab. */
export function rattle(v, t, vel, dest, n = 12, span = 0.55) {
  const r = v.R.rng;
  for (let i = 0; i < n; i++) {
    const s = t + (i + r() * 0.6) * (span / n), a = vel * (0.45 + 0.55 * Math.sin((Math.PI * (i + 0.5)) / n));
    v.tone(s, { f: 4200 + r() * 4200, a: 0.001, d: 0.05, peak: 0.07 * a, dest });
    v.nz(s, { kind: 'white', type: 'highpass', f: 5500, a: 0.001, d: 0.022, peak: 0.08 * a, dest });
  }
}

/** Rauschen → Filter → Pegel mit Amplitudenmodulationen lfo [[Hz, Tiefe], …]; gibt den Pegelknoten zurück (Ausgang mit dest verbinden). */
export function amNoise(v, t, e, { kind = 'pink', type = 'bandpass', f = 1000, q = 1, base = 0.5, lfo = [], dest }) {
  const n = v.noise(kind, t, e), fl = v.f(type, f, q), ga = v.g(base); n.connect(fl); fl.connect(ga);
  for (const [r, d] of lfo) { const l = v.osc('sine', r, t, e), lg = v.g(d); l.connect(lg); lg.connect(ga.gain); }
  if (dest) ga.connect(dest); return ga;
}
