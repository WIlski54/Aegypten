// scenes.js – Atmosphären je Seite (Schleifen, die überblenden), Ereignisströme (Frösche, Hämmern, Rufe, Glöckchen …)
// und die globalen ctl-Schichten (Erwartung, Zeitraffer, Wind, Unterwasser, Regen).
import { clamp, mtof, env, LEVELS_LIN } from './synth.js';
import { playVoice, playBird } from './voices.js';
import { degMidi, pluck, ney, horn, rattle } from './inst.js';

const PI2 = Math.PI / 2;
/** Gleichleistungs-Überblendung in 6 Linienstücken (hoch: 0→1, runter: aktuell→0); überschreibt noch ausstehende Rampen. */
function xfade(p, t, sec, up, cur) {
  p.cancelScheduledValues(t); p.setValueAtTime(cur, t);
  for (let i = 1; i <= 6; i++) { const x = (i / 6) * PI2; p.linearRampToValueAtTime(up ? cur + (1 - cur) * Math.sin(x) : cur * Math.cos(x), t + (sec * i) / 6); }
}

/** Eine laufende Atmosphäre: Dauerquellen + Ereignisströme; alle Ausgaben laufen über `out` (Überblendung) und `body` (Kalibrierung). */
export class Scene {
  constructor(R, id, dest, t0, fade) {
    this.R = R; this.c = R.ctx; this.id = id; this.t0 = t0; this.srcs = []; this.nodes = []; this.str = []; this.cv = {}; this.onCtl = {}; this.onEvent = null; this.dead = false; this.fading = false;
    this.out = this.g(0); this.out.connect(dest); xfade(this.out.gain, t0, fade, true, 0);
    this.trim = LEVELS_LIN('scene:' + id); this.body = this.g(this.trim); this.body.connect(this.out);
  }
  g(v = 1) { const n = this.c.createGain(); n.gain.value = v; this.nodes.push(n); return n; }
  f(type, freq, q = 0.7) { const n = this.c.createBiquadFilter(); n.type = type; n.frequency.value = freq; n.Q.value = q; this.nodes.push(n); return n; }
  loop(kind, rate = 1) { const s = this.c.createBufferSource(); s.buffer = this.R.noiseBuf(kind); s.loop = true; if (rate !== 1) s.playbackRate.value = rate; s.start(this.t0, this.R.rng() * 2.5); this.srcs.push(s); return s; }
  osc(type, f, delay = 0) { const o = this.c.createOscillator(); o.type = type; o.frequency.value = f; o.start(this.t0 + delay); this.srcs.push(o); return o; }
  /** Langsamer Modulator: Sinus (rate Hz) mit ± depth auf einen AudioParam. */
  lfo(rate, depth, param, delay = 0) { const o = this.osc('sine', rate, delay), g = this.g(depth); o.connect(g); g.connect(param); return o; }
  /** Puls-Modulator 0…1 (Tastverhältnis duty) – gibt den Gain zurück, dessen gain-Parameter gepulst wird. */
  pulseGate(rate, duty, delay = 0) {
    const o = this.c.createOscillator(), g = this.g(duty); o.setPeriodicWave(this.R.pulse(duty)); o.frequency.value = rate; o.start(this.t0 + delay); this.srcs.push(o); o.connect(g.gain); return g;
  }
  /** Ereignisstrom: fn(t) im Abstand a…b s (Zufall); k() skaliert den Abstand (große Werte = pausiert). */
  stream(fn, a, b, k, first) { this.str.push({ fn, a, b, k, next: this.t0 + (first ?? this.R.rng() * b) }); }
  voice(prio = 0) { return this.R.voice(prio, this.body, ''); }
  tick(from, to) {
    if (this.fading || this.dead) return;
    const R = this.R;
    for (const s of this.str) {
      while (s.next < to) {
        const kk = s.k ? s.k() : 1;
        if (kk < 0) { s.next = to + 0.4; break; } // pausiert (z. B. Vögel kurz vor dem Einschlag): später erneut prüfen
        if (R.list.length < R.max * 0.75) s.fn(Math.max(s.next, from));
        s.next += (s.a + R.rng() * (s.b - s.a)) * Math.max(kk, 0.05);
      }
    }
  }
  setCtl(name, v) { this.cv[name] = v; if (this.onCtl[name]) this.onCtl[name](v, this.c.currentTime); }
  fadeOut(t, sec) {
    this.fading = true; xfade(this.out.gain, t, sec, false, this.out.gain.value);
    const e = t + sec + 0.1; for (const s of this.srcs) { try { s.stop(e); } catch (x) { /* egal */ } }
    if (this.srcs.length) this.srcs[0].onended = () => this.free(); else this.free();
    setTimeout(() => this.free(), Math.max(0, e - this.c.currentTime) * 1000 + 800);
  }
  free() { this.dead = true; for (const n of this.nodes) { try { n.disconnect(); } catch (e) { /* egal */ } } this.nodes.length = 0; this.srcs.length = 0; }
}

// ------------------------------------------------------------------ Bausteine
/** Wind: zwei gegeneinander versetzte Rauschquellen (links/rechts) → Filter → Pegel mit unregelmäßigen Böen (zwei LFOs). */
function wind(S, { lvl, f, q = 0.7, type = 'bandpass', gust = 0.5, rate = 0.12, fm = 0.3, kind = 'pink', dest }) {
  const flt = S.f(type, f, q), ga = S.g(1), g = S.g(lvl);
  for (const pan of [-0.7, 0.7]) {
    let n = S.loop(kind);
    if (S.c.createStereoPanner) { const p = S.c.createStereoPanner(); p.pan.value = pan; S.nodes.push(p); n.connect(p); n = p; }
    n.connect(flt);
  }
  gust = Math.min(gust, 0.65); flt.connect(ga); ga.connect(g); g.connect(dest || S.body);
  S.lfo(rate, gust, ga.gain); S.lfo(rate * 1.618, gust * 0.5, ga.gain, 0.7); S.lfo(rate * 0.71, f * fm, flt.frequency);
  return g; // g.gain = Grundpegel (die Böen liegen davor)
}
/** Insektenchor / Zikaden: schmalbandiges Rauschen, langsam ein- und ausgeblendet (Schwarm) und schnell amplitudenmoduliert (Schnarren). */
function insects(S, { n, f0, spread = 0.5, lvl, am = [30, 70], slow = [0.07, 0.22], q = 14, dest }) {
  for (let i = 0; i < n; i++) {
    const r = S.R.rng, f = f0 * (1 + (n > 1 ? i / (n - 1) - 0.5 : 0) * spread), bp = S.f('bandpass', f, q), ga = S.g(0.5), gb = S.g(0.5), out = S.g(lvl);
    const s = S.loop('white'); s.connect(bp); bp.connect(ga); ga.connect(gb); gb.connect(out); out.connect(dest || S.body);
    S.lfo(slow[0] + r() * (slow[1] - slow[0]), 0.5, ga.gain, r() * 3); S.lfo(am[0] + r() * (am[1] - am[0]), 0.5, gb.gain, r());
  }
}
/** Brandung: Rauschen, dessen Pegel und Tiefpass einer asymmetrischen Welle folgen (schneller Anstieg, langes Ausrollen) + Gischt. */
function surf(S, { lvl, rate }) {
  const s = S.loop('pink'), lp = S.f('lowpass', 900, 0.6), g = S.g(lvl * 0.56), w = S.c.createOscillator(), wg = S.g(lvl * 0.49), wf = S.g(630);
  w.setPeriodicWave(S.R.surf()); w.frequency.value = rate; w.start(S.t0); S.srcs.push(w);
  s.connect(lp); lp.connect(g); g.connect(S.body); w.connect(wg); wg.connect(g.gain); w.connect(wf); wf.connect(lp.frequency);
  const fs = S.loop('white'), hp = S.f('highpass', 2500, 0.5), fl = S.f('lowpass', 8000, 0.5), fg = S.g(lvl * 0.1), w2 = S.c.createOscillator(), w2g = S.g(lvl * 0.1);
  w2.setPeriodicWave(S.R.surf()); w2.frequency.value = rate; w2.start(S.t0 + 0.8); S.srcs.push(w2);
  fs.connect(hp); hp.connect(fl); fl.connect(fg); fg.connect(S.body); w2.connect(w2g); w2g.connect(fg.gain);
}
/** Wasser: Rauschen mit langsam wogendem Tiefpass + feines Glitzern; gibt {g, lp, sg} zurück (ctl `flood` verstärkt). */
function water(S, { lvl, f = 800, spark = 0.03, rate = 1, dest }) {
  const s = S.loop('pink'), lp = S.f('lowpass', f, 0.6), g = S.g(lvl); s.connect(lp); lp.connect(g); g.connect(dest || S.body);
  S.lfo(0.33 * rate, lvl * 0.4, g.gain); S.lfo(0.21 * rate, lvl * 0.27, g.gain, 1.3); S.lfo(0.17 * rate, f * 0.3, lp.frequency);
  const sp = S.loop('white'), hp = S.f('highpass', 3500, 0.5), sg = S.g(spark); sp.connect(hp); hp.connect(sg); sg.connect(dest || S.body); S.lfo(0.29 * rate, spark * 0.6, sg.gain);
  return { g, lp, sg };
}
/** Formantisches Murmeln (Menschen aus der Ferne, Rezitation): Rauschen → zwei Bandpässe (Vokalfarbe wandert) → Silbentakt → Phrasenatmung. Gibt den Ausgangs-Gain zurück. */
function murmur(S, { n = 3, lvl, f1 = 520, f2 = 1500, syl = 3.6, lp = 3000, dest }) {
  const out = S.g(lvl), r = S.R.rng; out.connect(dest || S.body);
  for (let i = 0; i < n; i++) {
    const s = S.loop('pink'), b1 = S.f('bandpass', f1 * (0.8 + 0.4 * r()), 4), b2 = S.f('bandpass', f2 * (0.8 + 0.4 * r()), 5), mix = S.g(1), sy = S.g(0.5), ph = S.g(0.6), l = S.f('lowpass', lp, 0.5);
    s.connect(b1); s.connect(b2); b1.connect(mix); b2.connect(mix); mix.connect(sy); sy.connect(ph); ph.connect(l); l.connect(out);
    S.lfo(syl * (0.8 + 0.4 * r()), 0.42, sy.gain, r()); S.lfo(syl * 1.37 * (0.85 + 0.3 * r()), 0.15, sy.gain, r());
    S.lfo(0.25 + 0.3 * r(), 0.4, ph.gain, r() * 2); S.lfo(0.4 + 0.3 * r(), f1 * 0.25, b1.frequency); S.lfo(0.33 + 0.3 * r(), f2 * 0.2, b2.frequency);
  }
  return out;
}
/** Feuerbett: gleichmäßiges Prasseln (hell, unregelmäßig moduliert) + warmes Brodeln; gibt den Ausgangs-Gain zurück. */
function fireBed(S, { lvl, dest }) {
  const out = S.g(lvl), n = S.loop('pink'), hp = S.f('highpass', 1400, 0.5), ga = S.g(0.3); n.connect(hp); hp.connect(ga); ga.connect(out); out.connect(dest || S.body);
  S.lfo(7.3, 0.2, ga.gain); S.lfo(11.7, 0.15, ga.gain, 0.3); S.lfo(3.1, 0.08, ga.gain, 0.7);
  const lo = S.loop('brown'), lf = S.f('lowpass', 200, 0.5), lg = S.g(0.5); lo.connect(lf); lf.connect(lg); lg.connect(out); S.lfo(0.7, 0.2, lg.gain);
  return out;
}
/** Sandrieseln: körniges, helles Rauschen aus drei unrunden Modulationen. */
function sandBed(S, { lvl, dest }) {
  const out = S.g(lvl), n = S.loop('white'), hp = S.f('highpass', 3200, 0.5), bp = S.f('bandpass', 5200, 0.8), ga = S.g(0.5); n.connect(hp); hp.connect(bp); bp.connect(ga); ga.connect(out); out.connect(dest || S.body);
  S.lfo(13, 0.15, ga.gain); S.lfo(19.7, 0.15, ga.gain, 0.2); S.lfo(29.3, 0.12, ga.gain, 0.5);
  return out;
}
/** Mahlstein: kratzendes Hin und Her (≈ 1.6 Hz) mit tiefem Rumpeln. */
function quernBed(S, { lvl, dest }) {
  const out = S.g(lvl), n = S.loop('pink'), bp = S.f('bandpass', 900, 1.1), ga = S.g(0.5); n.connect(bp); bp.connect(ga); ga.connect(out); out.connect(dest || S.body); S.lfo(1.6, 0.45, ga.gain);
  const w = S.loop('white'), hp = S.f('highpass', 3200, 0.5), wg = S.g(0.08); w.connect(hp); hp.connect(wg); wg.connect(out); S.lfo(1.6, 0.07, wg.gain);
  const lo = S.loop('brown'), lf = S.f('lowpass', 220, 0.7), lg = S.g(0.4); lo.connect(lf); lf.connect(lg); lg.connect(out); S.lfo(1.6, 0.3, lg.gain);
  return out;
}
const pan = (S, v) => { if (S.c.createStereoPanner) v.panTo(S.R.rng() * 1.6 - 0.8); };
const lv = (x) => (typeof x === 'function' ? x() : x);

// ---- Ereignisse (jeweils ein kurzer Voice im Ziel `S.body`, niedrige Priorität)
const drop = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; const f = 900 + S.R.rng() * 1500; v.tone(t, { f, f2: f * 1.25, gl: 0.03, a: 0.002, d: 0.09, peak: lvl }); v.send(0.4 * S.trim); pan(S, v); };
const plop = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; const f = 300 + S.R.rng() * 800; v.tone(t, { f, f2: f * 1.6, gl: 0.06, a: 0.004, d: 0.08, peak: lvl }); pan(S, v); };
const far = (S, ids, dist) => (t) => { const v = playVoice(S.R, ids[(S.R.rng() * ids.length) | 0], t, { dest: S.body, dist, prio: 0, sendScale: S.trim }); if (v) pan(S, v); };
const birds = (S, kinds, rev = 0.25, dest) => (t) => { const v = playBird(S.R, t, { dest: dest || S.body, prio: 0, kind: kinds[(S.R.rng() * kinds.length) | 0], rev: rev * S.trim }); if (v) pan(S, v); };
const rustleEv = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; v.nz(t, { kind: 'white', f: 2400 + S.R.rng() * 2200, q: 2.2, a: 0.012, d: 0.05 + S.R.rng() * 0.1, peak: lvl }); pan(S, v); };
const flapEv = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; for (let i = 0; i < 3; i++) v.nz(t + i * (0.14 + i * 0.02), { type: 'lowpass', f: 1100, f2: 450, a: 0.03, d: 0.1, peak: lvl }); pan(S, v); };
const frogEv = (S, lvl) => (t) => { // Froschchor: kurze Quaker durch einen Bandpass
  const v = S.voice(); if (!v) return; const r = S.R.rng, bp = v.f('bandpass', 900 + r() * 500, 3), n = 1 + ((r() * 4) | 0), f = 280 + r() * 160; bp.connect(v.out);
  for (let i = 0; i < n; i++) v.tone(t + i * 0.1, { w: 'sawtooth', f, f2: f * 1.12, gl: 0.04, a: 0.004, d: 0.06, peak: lvl, dest: bp });
  pan(S, v);
};
const neyEv = (S, root, sc, vel) => (t) => { // ferne Rohrflöte: 2…4 lange Töne, gedämpft und mit Hall
  const v = S.voice(); if (!v) return; const r = S.R.rng, lp = v.f('lowpass', 1800, 0.6), n = 2 + ((r() * 3) | 0), pool = [0, 2, 4, 5, 7]; let tt = t; lp.connect(v.out);
  for (let i = 0; i < n; i++) { let m = degMidi(pool[(r() * pool.length) | 0], root, sc); if (m < 66) m += 12; const d = 1.1 + r() * 1.3; ney(v, tt, m, d, vel, lp); tt += d * 0.8 + 0.3; }
  v.send(0.55 * S.trim); pan(S, v);
};
const bellEv = (S, lvl, rev, lo = 7) => (t) => { // Windspiel / Weihrauch-Glöckchen: helle Töne mit langem Ausklang
  const v = S.voice(); if (!v) return; const r = S.R.rng, n = 1 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) v.bell(t + i * (0.12 + r() * 0.2), mtof(degMidi(lo + ((r() * 7) | 0), 74, 'phryg')), [[1, 1, 2.2], [2.76, 0.45, 1.2], [5.4, 0.18, 0.5]], lvl);
  v.send(rev * S.trim); pan(S, v);
};
const hornEv = (S, lvl, f = 87) => (t) => { const v = S.voice(); if (!v) return; horn(v, t, f, 2 + S.R.rng(), lvl, v.out); v.send(0.7 * S.trim); pan(S, v); }; // tiefer Hornton, selten
const fanfareEv = (S, lvl) => (t) => { // Fanfarenrest aus der Ferne: zwei weiche Hornstöße
  const v = S.voice(); if (!v) return; const lp = v.f('lowpass', 1100, 0.6); lp.connect(v.out);
  horn(v, t, 294, 0.35, lvl, lp); horn(v, t + 0.5, 392, 1.1, lvl, lp); v.send(0.8 * S.trim); pan(S, v);
};
const hammerEv = (S, lvl, p = 1) => (t) => { // Hammer/Meißel auf Stein
  const v = S.voice(); if (!v) return; const l = lv(lvl), q = p * (0.95 + S.R.rng() * 0.1);
  v.bell(t, 1850 * q, [[1, 1, 0.08], [1.62, 0.5, 0.05]], l * 0.6); v.tone(t, { f: 230 * q, f2: 140 * q, a: 0.002, d: 0.07, peak: l * 0.7 }); v.nz(t, { kind: 'white', f: 3300, q: 1.6, a: 0.001, d: 0.015, peak: l * 0.5 });
  v.send(0.25 * S.trim); pan(S, v);
};
const crackleEv = (S, lvl) => (t) => { // einzelne Knister/Funken
  const v = S.voice(); if (!v) return; const r = S.R.rng, l = lv(lvl), n = 1 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) v.nz(t + i * (0.03 + r() * 0.07), { kind: 'white', f: 2500 + r() * 3500, q: 3, a: 0.001, d: 0.006 + r() * 0.014, peak: l * (0.4 + 0.6 * r()) });
  pan(S, v);
};
const tickEv = (S, lvl) => { let par = 0; return (t) => { // Waagen-Ticken, abwechselnd hoch/tief
  const v = S.voice(); if (!v) return; par ^= 1; v.bell(t, par ? 2900 : 2500, [[1, 1, 0.05], [2.4, 0.4, 0.03]], lvl); v.send(0.5 * S.trim); pan(S, v);
}; };
const sistrumEv = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; rattle(v, t, lvl, v.out, 9, 0.5); v.send(0.6 * S.trim); pan(S, v); };
const luteEv = (S, vel) => (t) => { // ein paar Laute-Töne aus dem Nachbarhaus (gedämpft)
  const v = S.voice(); if (!v) return; const r = S.R.rng, lp = v.f('lowpass', 2200, 0.6), n = 3 + ((r() * 3) | 0); let tt = t, d = (r() * 4) | 0; lp.connect(v.out);
  for (let i = 0; i < n; i++) { pluck(v, tt, degMidi(d, 60, 'phryg'), vel * (0.7 + 0.3 * r()), lp, 'lute'); d = clamp(d + [-1, 1, 1, 2, -2][(r() * 5) | 0], 0, 8); tt += 0.3 + r() * 0.25; }
  v.send(0.35 * S.trim); pan(S, v);
};
/** Rufe aus der Ferne (Markt, Hafen, Arbeitsgruppen): 1…2 kurze Silben mit Vokalfarbe, tiefpassgefiltert. */
const callEv = (S, vel, f0, vowels = [[450, 800], [750, 1200]]) => (t) => {
  const v = S.voice(); if (!v) return; const r = S.R.rng, lp = v.f('lowpass', 1500, 0.6), n = 1 + ((r() * 2) | 0); lp.connect(v.out);
  for (let i = 0; i < n; i++) shout(v, t + i * 0.34, f0 * (0.85 + r() * 0.3), 0.22 + r() * 0.1, vowels[(r() * vowels.length) | 0], lp, vel);
  v.send(0.6 * S.trim); pan(S, v);
};
/** Kinderlachen aus der Ferne: „ha-ha-ha“, hoch, fallende Tonhöhe, stark gedämpft. */
const laughEv = (S, vel) => (t) => {
  const v = S.voice(); if (!v) return; const r = S.R.rng, lp = v.f('lowpass', 1800, 0.6), n = 3 + ((r() * 3) | 0), f = 520 + r() * 120; lp.connect(v.out);
  for (let i = 0; i < n; i++) shout(v, t + i * 0.15, f * (1 - i * 0.04), 0.08, [850, 1300], lp, vel * (1 - i * 0.1));
  v.send(0.6 * S.trim); pan(S, v);
};
function shout(v, s, f, d, vowel, dest, vel) {
  const o = v.osc('sawtooth', f, s, s + d + 0.05), g = v.g(0), b1 = v.f('bandpass', vowel[0], 5), b2 = v.f('bandpass', vowel[1], 5), mix = v.g(1);
  o.frequency.setValueAtTime(f, s); o.frequency.linearRampToValueAtTime(f * 0.85, s + d);
  o.connect(b1); o.connect(b2); b1.connect(mix); b2.connect(mix); mix.connect(g); g.connect(dest);
  env(g.gain, s, [[0, 0], [0.04, vel], [d * 0.7, vel * 0.8], [d, 0]]);
}

// ------------------------------------------------------------------ Szenen (Builder: S → Dauerquellen und Ströme einrichten)
export const BUILD = {
  cover(S) { // fast still: warmer Raumton (Grundton D und Quinte, kaum hörbar)
    const s = S.loop('brown'), lp = S.f('lowpass', 260, 0.5), g = S.g(0.6); s.connect(lp); lp.connect(g); g.connect(S.body); S.lfo(0.11, 0.15, g.gain);
    const h = S.osc('sine', 73.4), hg = S.g(0.012), h2 = S.osc('sine', 110.1), hg2 = S.g(0.006); h.connect(hg); hg.connect(S.body); h2.connect(hg2); hg2.connect(S.body);
  },
  zeitrad(S) { // leises Plätschern, Zikaden, ferne Flöte
    water(S, { lvl: 0.2, f: 700, spark: 0.02 });
    insects(S, { n: 3, f0: 4800, spread: 0.4, lvl: 0.1, am: [40, 75], slow: [0.06, 0.16] });
    wind(S, { lvl: 0.08, f: 600, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.1 });
    S.stream(neyEv(S, 62, 'phryg', 0.6), 12, 24);
  },
  nil(S) { // Wasser, Frösche, Wasservögel, Wind im Schilf; ctl flood 0…1: mehr und schnelleres Wasser
    const w = water(S, { lvl: 0.4, f: 900, spark: 0.04 });
    const reeds = wind(S, { lvl: 0.12, f: 2200, q: 0.8, gust: 0.6, rate: 0.12 });
    wind(S, { lvl: 0.1, f: 500, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.09 });
    S.stream(frogEv(S, 0.16), 0.5, 2.2); S.stream(plop(S, 0.07), 1.5, 5);
    S.stream(far(S, ['wasservogel', 'ibis', 'reiher', 'wasservogel'], 0.7), 5, 12);
    S.onCtl.flood = (v, now) => {
      w.g.gain.setTargetAtTime(0.4 * (1 + 1.5 * v), now, 0.6); w.lp.frequency.setTargetAtTime(900 * (1 + v), now, 0.6); w.sg.gain.setTargetAtTime(0.04 * (1 + 1.5 * v), now, 0.6); reeds.gain.setTargetAtTime(0.12 * (1 + 0.6 * v), now, 0.6);
    };
  },
  reich(S) { // Markt aus der Ferne, Fanfarenrest, Windspiel, Wind
    murmur(S, { n: 3, lvl: 0.3, f1: 500, f2: 1400, syl: 3.4, lp: 1600 });
    wind(S, { lvl: 0.12, f: 700, q: 0.5, gust: 0.5, rate: 0.1 });
    S.stream(callEv(S, 0.5, 190), 3, 8); S.stream(far(S, ['esel', 'ochse'], 0.85), 22, 40);
    S.stream(bellEv(S, 0.1, 0.6), 4, 10); S.stream(fanfareEv(S, 0.7), 24, 42);
  },
  gizeh(S) { // Hämmern im Takt, Rufe der Arbeitsgruppen als dumpfes Murmeln, Wüstenwind; ctl build 0…1: mehr Arbeiter
    const b = () => S.cv.build || 0;
    wind(S, { lvl: 0.22, f: 600, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.09 }); wind(S, { lvl: 0.07, f: 1800, q: 0.8, gust: 0.6, rate: 0.14 });
    const mm = murmur(S, { n: 3, lvl: 0.25, f1: 380, f2: 900, syl: 2.8, lp: 1100 });
    S.stream(hammerEv(S, () => 0.45 + 0.3 * b(), 1), 0.8, 0.8, () => 1 / (1 + 0.35 * b()), 0.2);
    S.stream(hammerEv(S, () => 0.4 + 0.3 * b(), 0.85), 1.2, 1.2, () => (b() < 0.25 ? -1 : 1 / (1 + 0.35 * b())), 0.7);
    S.stream(hammerEv(S, () => 0.35 + 0.3 * b(), 1.2), 0.97, 0.97, () => (b() < 0.6 ? -1 : 1 / (1 + 0.35 * b())), 0.4);
    S.stream(callEv(S, 0.4, 150, [[450, 800]]), 6, 14, () => (b() < 0.15 ? -1 : 1)); S.stream(far(S, ['ochse'], 0.85), 22, 40);
    S.onCtl.build = (v, now) => mm.gain.setTargetAtTime(0.25 * (0.4 + 0.9 * v), now, 0.6);
  },
  goetter(S) { // Tempelhalle: Hall, tiefer Chorton, Weihrauch-Glöckchen, Sistrum; ctl scale 0…1: sanftes Ticken der Waage
    const s = S.loop('pink'), lp = S.f('lowpass', 400, 0.5), g = S.g(0.16); s.connect(lp); lp.connect(g); g.connect(S.body);
    const f1 = S.f('bandpass', 420, 4), f2 = S.f('bandpass', 800, 5), ch = S.g(0.5), cl = S.f('lowpass', 1100, 0.5);
    for (const [f, a] of [[55, 0.5], [55.3, 0.4], [82.4, 0.35], [82.0, 0.3], [110.2, 0.25], [109.8, 0.2]]) { const o = S.osc('sawtooth', f), og = S.g(a); o.connect(og); og.connect(f1); og.connect(f2); }
    f1.connect(ch); f2.connect(ch); ch.connect(cl); cl.connect(S.body); S.lfo(0.07, 0.25, ch.gain); S.lfo(0.11, 50, f1.frequency); S.lfo(0.09, 90, f2.frequency);
    S.stream(bellEv(S, 0.1, 1.0, 9), 5, 11); S.stream(sistrumEv(S, 0.5), 12, 24);
    S.stream(tickEv(S, 0.3), 0.55, 0.75, () => ((S.cv.scale || 0) < 0.02 ? -1 : 1 / (0.6 + 0.9 * S.cv.scale)));
  },
  mumie(S) { // gedeckter Raum, leises Murmeln (Rezitation), Sandrieseln; ctl salt 0…1: mehr Rieseln
    const s = S.loop('brown'), lp = S.f('lowpass', 280, 0.5), g = S.g(0.7); s.connect(lp); lp.connect(g); g.connect(S.body);
    const p = S.loop('pink'), bp = S.f('bandpass', 600, 0.6), pg = S.g(0.1); p.connect(bp); bp.connect(pg); pg.connect(S.body);
    murmur(S, { n: 2, lvl: 0.3, f1: 450, f2: 1100, syl: 3.8, lp: 1800 });
    const sd = sandBed(S, { lvl: 0.12 }); S.stream(rustleEv(S, 0.05), 4, 10);
    S.onCtl.salt = (v, now) => sd.gain.setTargetAtTime(0.12 + 0.55 * v, now, 0.5);
  },
  alltag(S) { // Mahlen, Schnattern, Kinderlachen aus der Ferne, Lautenklang, Backofen-Knistern
    quernBed(S, { lvl: 0.35 }); fireBed(S, { lvl: 0.15 });
    wind(S, { lvl: 0.05, f: 700, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.1 });
    S.stream(crackleEv(S, 0.25), 0.3, 1.2); S.stream(far(S, ['wasservogel', 'wasservogel', 'esel'], 0.75), 7, 15);
    S.stream(laughEv(S, 0.4), 14, 30); S.stream(luteEv(S, 0.5), 9, 18);
  },
  tal(S) { // Fackelknistern, Tropfen, tiefer Hornton, Wüstenwind; ctl torch 0…1: Fackeln lodern stärker
    const t = () => S.cv.torch || 0;
    wind(S, { lvl: 0.25, f: 500, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.08 }); wind(S, { lvl: 0.06, f: 1700, q: 0.8, gust: 0.6, rate: 0.12 });
    const lo = S.loop('brown'), lf = S.f('lowpass', 120, 0.5), lg = S.g(0.6); lo.connect(lf); lf.connect(lg); lg.connect(S.body);
    const fb = fireBed(S, { lvl: 0.12 }); S.stream(crackleEv(S, () => 0.2 + 0.2 * t()), 0.5, 1.8, () => 1 / (1 + 2 * t()));
    S.stream(drop(S, 0.22), 3, 9); S.stream(hornEv(S, 0.5), 28, 50);
    S.onCtl.torch = (v, now) => fb.gain.setTargetAtTime(0.12 * (1 + 2.2 * v), now, 0.4);
  },
  finale(S) { // Meer, Wellen, ferne Hafenrufe; ctl parade 0…1: Jubel der Parade (das volle Titelthema liegt in music.js)
    surf(S, { lvl: 0.55, rate: 0.1 }); surf(S, { lvl: 0.2, rate: 0.07 });
    wind(S, { lvl: 0.15, f: 650, q: 0.5, gust: 0.5, rate: 0.1 });
    const cr = murmur(S, { n: 2, lvl: 0, f1: 520, f2: 1500, syl: 3.2, lp: 2200 });
    S.stream(callEv(S, 0.4, 170), 8, 16); S.stream(far(S, ['wasservogel'], 0.8), 10, 20); S.stream(flapEv(S, 0.12), 7, 14);
    S.onCtl.parade = (v, now) => cr.gain.setTargetAtTime(0.3 * v, now, 0.8);
  },
};
export const SCENE_IDS = Object.keys(BUILD);

/** Verwaltung: aktuelle Szene + auslaufende; Überblendung ≈ 1.2 s. */
export class Scenes {
  constructor(R) { this.R = R; this.cur = null; this.old = []; this.params = {}; }
  set(id, t, fade = 1.2, dest) {
    const B = BUILD[id]; if (!B) return false;
    if (this.cur) { if (this.cur.id === id && !this.cur.fading) return true; this.cur.fadeOut(t, fade); this.old.push(this.cur); }
    while (this.old.length > 2) this.old.shift().fadeOut(t, 0.15);
    const S = (this.cur = new Scene(this.R, id, dest || this.R.bus.atmo, t, fade)); B(S);
    for (const k in this.params) S.setCtl(k, this.params[k]);
    return true;
  }
  tick(from, to) {
    if (this.cur) this.cur.tick(from, to);
    for (let i = this.old.length - 1; i >= 0; i--) if (this.old[i].dead) this.old.splice(i, 1);
  }
  ctl(name, v) { this.params[name] = v; if (this.cur) this.cur.setCtl(name, v); }
  event(name, t) { if (this.cur && this.cur.onEvent) this.cur.onEvent(name, t); }
  clear(fade = 0.3) { const t = this.R.ctx.currentTime; if (this.cur) { this.cur.fadeOut(t, fade); this.old.push(this.cur); this.cur = null; } }
}

// ------------------------------------------------------------------ ctl-Schichten (unabhängig von der Szene)
export class Layers {
  constructor(R) { this.R = R; this.v = { tension: 0, timeLapse: 0, wind: 0, underwater: 0, rainfall: 0 }; this.tn = null; this.tl = null; this.wd = null; this.rn = null; this.nextDrop = 0; this.prev = 0; this.act = 0; this.lastA = -1; this.arp = 0; this.nextArp = 0; this.nextBub = 0; this.idle = { tn: 0, tl: 0, wd: 0, rn: 0 }; }
  mk(extra) { // gemeinsame Hülle: Ausgangs-Gain auf dem Atmo-Bus, Quellenliste
    const c = this.R.ctx, L = { out: c.createGain(), srcs: [], nodes: [], ...extra }; L.out.gain.value = 0; L.nodes.push(L.out); return L;
  }
  src(L, n, t) { n.start(t); L.srcs.push(n); return n; }
  node(L, n) { L.nodes.push(n); return n; }
  dispose(L) {
    if (!L) return; const now = this.R.ctx.currentTime;
    for (const s of L.srcs) { try { s.stop(now + 0.05); } catch (e) { /* egal */ } }
    setTimeout(() => { for (const n of L.nodes) { try { n.disconnect(); } catch (e) { /* egal */ } } }, 200);
  }
  noiseNode(L, kind, t) { const s = this.R.ctx.createBufferSource(); s.buffer = this.R.noiseBuf(kind); s.loop = true; return this.src(L, s, t); }
  /** Steuerwert setzen (now = Planzeit; Tests planen damit in die Zukunft). */
  set(name, v, now) {
    const R = this.R, c = R.ctx; now = now ?? c.currentTime; this.v[name] = v;
    if (name === 'tension') {
      if (!this.tn && v < 0.002) return;
      if (!this.tn) { // Erwartung: tiefer Bordun (Grundton + Quinte, Sägezähne durch Tiefpass) und ein Hauch Luft – kein Pfeifen
        const L = (this.tn = this.mk({})), t = now; L.out.connect(R.bus.atmo);
        L.dr = this.src(L, c.createOscillator(), t); L.dr.type = 'sawtooth'; L.dr.frequency.value = 55; L.dr2 = this.src(L, c.createOscillator(), t); L.dr2.type = 'sawtooth'; L.dr2.frequency.value = 82.5;
        const dl = this.node(L, c.createBiquadFilter()); dl.type = 'lowpass'; dl.frequency.value = 170; L.dg = this.node(L, c.createGain()); L.dg.gain.value = 0;
        L.dr.connect(dl); L.dr2.connect(dl); dl.connect(L.dg); L.dg.connect(L.out);
        const ns = this.noiseNode(L, 'white', t); L.bp = this.node(L, c.createBiquadFilter()); L.bp.type = 'bandpass'; L.bp.Q.value = 2; L.bp.frequency.value = 900; L.hg = this.node(L, c.createGain()); L.hg.gain.value = 0;
        ns.connect(L.bp); L.bp.connect(L.hg); L.hg.connect(L.out); L.out.gain.setTargetAtTime(1, now, 0.1);
      }
      const L = this.tn;
      L.bp.frequency.setTargetAtTime(700 + 900 * v, now, 0.15); L.dr.frequency.setTargetAtTime(52 + 22 * v, now, 0.3); L.dr2.frequency.setTargetAtTime((52 + 22 * v) * 1.5, now, 0.3);
      L.dg.gain.setTargetAtTime(0.15 * Math.pow(v, 1.2), now, 0.3); L.hg.gain.setTargetAtTime(0.05 * Math.pow(v, 2), now, 0.25);
    } else if (name === 'wind') {
      if (!this.wd && v < 0.002) return;
      if (!this.wd) {
        const L = (this.wd = this.mk({})), t = now; L.out.connect(R.bus.atmo);
        const bp = this.node(L, c.createBiquadFilter()), g = this.node(L, c.createGain()); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.5; g.gain.value = 0.5;
        for (let i = 0; i < 2; i++) { const s = this.noiseNode(L, 'pink', t); s.connect(bp); }
        bp.connect(g); g.connect(L.out);
        for (const [r, d] of [[0.11, 0.35], [0.18, 0.2]]) { const o = this.src(L, c.createOscillator(), t), og = this.node(L, c.createGain()); o.frequency.value = r; og.gain.value = d; o.connect(og); og.connect(g.gain); }
      }
      this.wd.out.gain.setTargetAtTime(0.16 * v, now, 0.4);
    } else if (name === 'timeLapse') {
      if (!this.tl && v < 0.002) { this.prev = v; return; }
      if (!this.tl) { // sirrendes Ticken: gepulstes, hell gefiltertes Rauschen
        const L = (this.tl = this.mk({})), t = now; L.out.connect(R.bus.fx);
        const ns = this.noiseNode(L, 'white', t), hp = this.node(L, c.createBiquadFilter()), bp = this.node(L, c.createBiquadFilter()), gate = this.node(L, c.createGain());
        hp.type = 'highpass'; hp.frequency.value = 3500; bp.type = 'bandpass'; bp.frequency.value = 5200; bp.Q.value = 1.2; gate.gain.value = 0.25;
        L.pw = this.src(L, c.createOscillator(), t); L.pw.setPeriodicWave(R.pulse(0.25)); L.pw.frequency.value = 14; L.pw.connect(gate.gain);
        ns.connect(hp); hp.connect(bp); bp.connect(gate); gate.connect(L.out); this.prev = v;
      }
    } else if (name === 'rainfall') { // Wetter-Knopf: Regenrauschen auf jeder Seite (die Szene 'finale' hat zusätzlich ihren eigenen Regen über ctl 'rain')
      if (!this.rn && v < 0.002) return;
      if (!this.rn) {
        const L = (this.rn = this.mk({})), t = now; L.out.connect(R.bus.atmo);
        const hi = this.noiseNode(L, 'white', t), hp = this.node(L, c.createBiquadFilter()), lp = this.node(L, c.createBiquadFilter()), g1 = this.node(L, c.createGain());
        hp.type = 'highpass'; hp.frequency.value = 1500; hp.Q.value = 0.5; lp.type = 'lowpass'; lp.frequency.value = 7800; lp.Q.value = 0.5; g1.gain.value = 0.085;
        hi.connect(hp); hp.connect(lp); lp.connect(g1); g1.connect(L.out);
        const lo = this.noiseNode(L, 'pink', t), bp = this.node(L, c.createBiquadFilter()), g2 = this.node(L, c.createGain());
        bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.6; g2.gain.value = 0.05; lo.connect(bp); bp.connect(g2); g2.connect(L.out);
      }
      this.rn.out.gain.setTargetAtTime(v, now, 0.6);
    } else if (name === 'underwater') {
      const f = 22000 * Math.pow(450 / 22000, v);
      R.bus.atmo.frequency.setTargetAtTime(f, now, 0.25); R.bus.music.frequency.setTargetAtTime(f, now, 0.25);
    }
  }
  /** Pro Frame: Bewegung des Zeitsprung-Reglers → Aktivität (Ticken/Arpeggio laufen nur, solange er sich bewegt); ungenutzte Schichten abbauen. */
  update(dt, now) {
    if (this.tl) {
      const d = Math.abs(this.v.timeLapse - this.prev) / Math.max(dt, 0.001); this.prev = this.v.timeLapse;
      const tgt = clamp(d * 1.6, 0, 1); this.act += (tgt - this.act) * (1 - Math.exp(-dt * (tgt > this.act ? 14 : 3.5)));
      const a = this.act < 0.02 ? 0 : this.act;
      if (Math.abs(a - this.lastA) > 0.01) { this.lastA = a; this.tl.out.gain.setTargetAtTime(a * 0.55, now, 0.05); this.tl.pw.frequency.setTargetAtTime(13 + 13 * a, now, 0.08); }
      this.idle.tl = a === 0 ? this.idle.tl + dt : 0;
      if (this.idle.tl > 4) { this.dispose(this.tl); this.tl = null; this.act = 0; }
    }
    if (this.tn) { this.idle.tn = this.v.tension < 0.002 ? this.idle.tn + dt : 0; if (this.idle.tn > 3) { this.dispose(this.tn); this.tn = null; } }
    if (this.rn) { this.idle.rn = this.v.rainfall < 0.002 ? this.idle.rn + dt : 0; if (this.idle.rn > 3) { this.dispose(this.rn); this.rn = null; } }
    if (this.wd) { this.idle.wd = this.v.wind < 0.002 ? this.idle.wd + dt : 0; if (this.idle.wd > 3) { this.dispose(this.wd); this.wd = null; } }
  }
  /** Ereignisse mit Vorausschau: aufsteigendes Arpeggio (Zeitraffer) und Blubbern (unter Wasser). */
  tick(from, to) {
    const R = this.R;
    if (this.tl && this.act > 0.1) {
      while (this.nextArp < to) {
        const t = Math.max(this.nextArp, from), i = this.arp++, v = R.voice(0, 'fx', 'sfx:chime');
        if (v) { const lvl = 0.10 + 0.08 * this.v.timeLapse; v.bell(t, mtof(degMidi((i % 7) + 7 * ((i / 7 | 0) % 3) + Math.round(this.v.timeLapse * 5), 60, 'phryg')), [[1, 1, 0.35], [4, 0.2, 0.08]], lvl); }
        this.nextArp = t + 1 / (7 + 9 * this.act);
      }
    } else { this.nextArp = Math.max(this.nextArp, from); this.arp = 0; }
    if (this.rn && this.v.rainfall > 0.1) { // einzelne Tropfen auf Papier
      while (this.nextDrop < to) {
        const t = Math.max(this.nextDrop, from), v = R.voice(0, 'fx', 'sfx:tapp');
        if (v) { const f = 1500 + R.rng() * 1900; v.tone(t, { f, f2: f * 1.3, gl: 0.025, a: 0.002, d: 0.05 + R.rng() * 0.04, peak: 0.045 * this.v.rainfall }); }
        this.nextDrop = t + (0.05 + R.rng() * 0.16) / (0.4 + this.v.rainfall);
      }
    } else this.nextDrop = Math.max(this.nextDrop, from);
    if (this.v.underwater > 0.15) {
      while (this.nextBub < to) {
        const t = Math.max(this.nextBub, from), v = R.voice(0, 'fx', 'sfx:bubble');
        if (v) { const f = 350 + R.rng() * 600; v.tone(t, { f, f2: f * 1.7, gl: 0.06, a: 0.004, d: 0.08, peak: 0.12 * this.v.underwater }); }
        this.nextBub = t + (0.18 + R.rng() * 0.5) * (1.4 - this.v.underwater);
      }
    } else this.nextBub = Math.max(this.nextBub, from);
  }
  stopAll() { for (const k of ['tn', 'tl', 'wd', 'rn']) { this.dispose(this[k]); this[k] = null; } this.act = 0; }
}
