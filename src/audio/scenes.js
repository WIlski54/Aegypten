// scenes.js – Atmosphären je Zeitalter (Schleifen, die überblenden), Ereignisströme (Tropfen, Rufe, Zirpen …)
// und die globalen ctl-Schichten (Spannung, Zeitraffer, Wind, Unterwasser).
import { clamp, mtof, LEVELS_LIN } from './synth.js';
import { playVoice, playBird } from './voices.js';

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
/** Grillen: Sinusträger, gepulst im Zirp-Takt (Pulsfolge ≈ 32 Hz, Zirpen ≈ 2.4×/s) – Wellenformen per PeriodicWave. */
function crickets(S, { n, f0, lvl, dest }) {
  for (let i = 0; i < n; i++) {
    const r = S.R.rng, car = S.osc('sine', f0 * (0.93 + r() * 0.14), r()), gp = S.pulseGate(30 + r() * 6, 0.5, r()), gc = S.pulseGate(2.1 + r() * 0.7, 0.45, r() * 1.2), out = S.g(lvl);
    car.connect(gp); gp.connect(gc); gc.connect(out); out.connect(dest || S.body);
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
const pan = (S, v) => { if (S.c.createStereoPanner) v.panTo(S.R.rng() * 1.6 - 0.8); };

// ---- Ereignisse (jeweils ein kurzer Voice im Ziel `S.body`, niedrige Priorität)
const drop = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; const f = 900 + S.R.rng() * 1500; v.tone(t, { f, f2: f * 1.25, gl: 0.03, a: 0.002, d: 0.09, peak: lvl }); v.send(0.4 * S.trim); pan(S, v); };
const plop = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; const f = 300 + S.R.rng() * 800; v.tone(t, { f, f2: f * 1.6, gl: 0.06, a: 0.004, d: 0.08, peak: lvl }); pan(S, v); };
const far = (S, ids, dist) => (t) => { const v = playVoice(S.R, ids[(S.R.rng() * ids.length) | 0], t, { dest: S.body, dist, prio: 0, sendScale: S.trim }); if (v) pan(S, v); };
const birds = (S, kinds, rev = 0.25, dest) => (t) => { const v = playBird(S.R, t, { dest: dest || S.body, prio: 0, kind: kinds[(S.R.rng() * kinds.length) | 0], rev: rev * S.trim }); if (v) pan(S, v); };
const rustleEv = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; v.nz(t, { kind: 'white', f: 2400 + S.R.rng() * 2200, q: 2.2, a: 0.012, d: 0.05 + S.R.rng() * 0.1, peak: lvl }); pan(S, v); };
const peepEv = (S, lvl) => (t) => {
  const v = S.voice(); if (!v) return; const n = 1 + ((S.R.rng() * 3) | 0), f0 = 2400 + S.R.rng() * 1100;
  for (let i = 0; i < n; i++) { const s = t + i * 0.2, p = v.tone(s, { f: f0, f2: f0 * 1.18, gl: 0.05, a: 0.01, d: 0.1, peak: lvl }); v.vib(p, 9, 40, s, s + 0.16); }
  pan(S, v);
};
const flapEv = (S, lvl) => (t) => { const v = S.voice(); if (!v) return; for (let i = 0; i < 3; i++) v.nz(t + i * (0.14 + i * 0.02), { type: 'lowpass', f: 1100, f2: 450, a: 0.03, d: 0.1, peak: lvl }); pan(S, v); };

// ------------------------------------------------------------------ Szenen (Builder: S → Dauerquellen und Ströme einrichten)
export const BUILD = {
  cover(S) { // fast still: dunkler Raumton
    const s = S.loop('brown'), lp = S.f('lowpass', 220, 0.5), g = S.g(0.6); s.connect(lp); lp.connect(g); g.connect(S.body);
    const h = S.osc('sine', 62), hg = S.g(0.012); h.connect(hg); hg.connect(S.body);
  },
  erduhr(S) { // leises Tick-Tack + Raumton
    const s = S.loop('brown'), lp = S.f('lowpass', 300, 0.5), g = S.g(0.9); s.connect(lp); lp.connect(g); g.connect(S.body);
    const h = S.osc('sine', 100), hg = S.g(0.015), h2 = S.osc('sine', 150.3), hg2 = S.g(0.008); h.connect(hg); hg.connect(S.body); h2.connect(hg2); hg2.connect(S.body);
    let par = 0;
    S.stream((t) => {
      par ^= 1; const v = S.voice(); if (!v) return; const k = par ? 1 : 0.78;
      v.tone(t, { f: 2300 * k, f2: 1800 * k, a: 0.0015, d: 0.02, peak: 0.5 }); v.nz(t, { kind: 'white', f: 3600 * k, q: 3, a: 0.0015, d: 0.013, peak: 0.35 }); v.tone(t, { f: 480 * k, a: 0.002, d: 0.04, peak: 0.2 }); v.send(0.12 * S.trim);
    }, 0.5, 0.5, null, 0.1);
  },
  trias(S) { // trockener Wind + Zikaden
    wind(S, { lvl: 0.5, f: 700, q: 0.5, gust: 0.55, rate: 0.1 });
    wind(S, { lvl: 0.12, f: 2300, q: 1.2, gust: 0.6, rate: 0.17 });
    insects(S, { n: 3, f0: 5200, spread: 0.45, lvl: 0.3, am: [62, 96], slow: [0.06, 0.16] });
  },
  'jura-wald'(S) { // feuchter Wald: Blätterwind, Insektenchor, Tropfen, ferne tiefe Rufe
    wind(S, { lvl: 0.4, f: 900, q: 0.5, type: 'lowpass', gust: 0.4, rate: 0.09 });
    wind(S, { lvl: 0.09, f: 3200, q: 0.8, gust: 0.6, rate: 0.13 });
    insects(S, { n: 4, f0: 3400, spread: 1, lvl: 0.2, am: [36, 72], slow: [0.1, 0.3] });
    S.stream(drop(S, 0.22), 1.6, 5.5); S.stream(far(S, ['brachiosaurus', 'plateosaurus'], 0.85), 14, 28);
  },
  'jura-lagune'(S) { // sanftes Plätschern, ferne Insekten, gelegentlich Flügelschlag
    const s = S.loop('pink'), lp = S.f('lowpass', 800, 0.6), g = S.g(0.3); s.connect(lp); lp.connect(g); g.connect(S.body); S.lfo(0.33, 0.12, g.gain); S.lfo(0.21, 0.08, g.gain, 1.3); S.lfo(0.17, 250, lp.frequency);
    const sp = S.loop('white'), hp = S.f('highpass', 3500, 0.5), sg = S.g(0.03); sp.connect(hp); hp.connect(sg); sg.connect(S.body); S.lfo(0.29, 0.02, sg.gain);
    wind(S, { lvl: 0.1, f: 600, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.1 });
    insects(S, { n: 2, f0: 6200, spread: 0.3, lvl: 0.08, am: [50, 80] });
    S.stream(plop(S, 0.1), 0.25, 0.8); S.stream(flapEv(S, 0.16), 7, 15);
  },
  'kreide-meer'(S) { // Brandung, Wind, ferne Flugsaurier-Rufe
    surf(S, { lvl: 0.6, rate: 0.115 }); surf(S, { lvl: 0.25, rate: 0.083 });
    wind(S, { lvl: 0.22, f: 650, q: 0.5, gust: 0.5, rate: 0.11 });
    S.stream(far(S, ['pteranodon', 'rhamphorhynchus', 'pteranodon'], 0.7), 9, 20);
  },
  spaetkreide(S) { // dumpfes Grollen (Sub), dunkler Wind, vereinzelt tiefe Rufe
    const s = S.loop('brown'), lp = S.f('lowpass', 60, 0.7), g = S.g(1.2); s.connect(lp); lp.connect(g); g.connect(S.body); S.lfo(0.13, 0.35, g.gain);
    const a = S.osc('sine', 38), b = S.osc('sine', 41.5), ag = S.g(0.25); a.connect(ag); b.connect(ag); ag.connect(S.body);
    wind(S, { lvl: 0.3, f: 600, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.08 });
    S.stream(far(S, ['triceratops', 'trex', 'ankylosaurus'], 0.8), 12, 25);
  },
  nest(S) { // Rascheln, Piepsen, warmes tiefes Brummen, Abendgrillen
    const bases = [[55, 0.3], [110, 0.2], [165, 0.07]], hum = S.g(0.5), lp = S.f('lowpass', 420, 0.5);
    for (const [f, a] of bases) { const o = S.osc('sine', f), g = S.g(a); o.connect(g); g.connect(lp); } lp.connect(hum); hum.connect(S.body); S.lfo(0.22, 0.2, hum.gain);
    wind(S, { lvl: 0.1, f: 800, q: 0.5, type: 'lowpass', gust: 0.5, rate: 0.1 });
    crickets(S, { n: 2, f0: 4300, lvl: 0.012 });
    S.stream(rustleEv(S, 0.1), 0.2, 0.6); S.stream(peepEv(S, 0.12), 1.5, 5);
  },
  einschlag(S) { // unruhiger Wind und Vogelrufe; Spannung (ctl) und Einschlag (sfx) steuern, danach fast Stille
    const R = S.R, wg = wind(S, { lvl: 0.3, f: 520, q: 0.6, gust: 0.6, rate: 0.16 });
    const s = S.loop('brown'), lp = S.f('lowpass', 50, 0.7), rg = S.g(0); s.connect(lp); lp.connect(rg); rg.connect(S.body); // ferne Vulkane
    const tn = () => S.cv.tension || 0;
    let post = false, base = 0.3;
    S.onCtl.tension = (v, now) => { const k = post ? 0 : v; wg.gain.setTargetAtTime(base * (1 + 1.1 * k), now, 0.5); rg.gain.setTargetAtTime(1.0 * k * k, now, 0.4); };
    S.stream(birds(S, [0, 1, 2, 3], 0.3), 2.5, 6, () => (post || tn() > 0.8 ? -1 : 1 / (1 + 4 * tn()))); // je unruhiger, desto öfter – kurz vor dem Einschlag verstummen sie
    S.stream(flapEv(S, 0.2), 6, 12, () => (post || tn() < 0.15 ? -1 : 0.5));
    S.onEvent = (name, t) => {
      if (name !== 'impact') return;
      post = true; base = 0.07; wg.gain.cancelScheduledValues(t); wg.gain.setTargetAtTime(base, t + 1.5, 2.5); rg.gain.setTargetAtTime(0, t, 2);
      S.stream(birds(S, [4], 0.5), 1e6, 1e6, null, t - S.t0 + 11 + R.rng() * 2); // ein einzelner Vogelruf, lange danach
    };
  },
  finale(S) { // warme Atmosphäre: Vögel, weicher Wind, später Savannengrillen, leiser Regen (ctl)
    const fG = S.g(1), sG = S.g(0), cG = S.g(0), rG = S.g(0);
    fG.connect(S.body); sG.connect(S.body); cG.connect(S.body); rG.connect(S.body);
    wind(S, { lvl: 0.22, f: 700, q: 0.5, type: 'lowpass', gust: 0.45, rate: 0.09 });
    wind(S, { lvl: 0.1, f: 1500, q: 0.6, gust: 0.6, rate: 0.12, dest: sG }); // trockener, helle Savanne
    insects(S, { n: 3, f0: 3600, spread: 0.7, lvl: 0.13, am: [34, 60], dest: fG });
    crickets(S, { n: 4, f0: 4600, lvl: 0.05, dest: cG });
    const rn = S.loop('white'), rh = S.f('highpass', 1400, 0.5), rl = S.f('lowpass', 8500, 0.5), rp = S.g(0.5); rn.connect(rh); rh.connect(rl); rl.connect(rp); rp.connect(rG);
    S.stream(birds(S, [0, 1, 2, 3], 0.3, fG), 1.4, 4.2, () => { const w = Math.cos((S.cv.timeLapse || 0) * PI2); return w < 0.1 ? -1 : 1 / w; });
    S.stream(birds(S, [1, 4, 3], 0.4, sG), 4, 9, () => { const w = Math.sin((S.cv.timeLapse || 0) * PI2); return w < 0.1 ? -1 : 1 / w; });
    S.stream(drop(S, 0.12), 0.07, 0.3, () => ((S.cv.rain || 0) > 0.05 ? 1 : -1));
    S.onCtl.timeLapse = (v, now) => {
      const sm = clamp((v - 0.5) / 0.5, 0, 1);
      fG.gain.setTargetAtTime(Math.cos(v * PI2), now, 0.35); sG.gain.setTargetAtTime(Math.sin(v * PI2), now, 0.35); cG.gain.setTargetAtTime(sm * sm * (3 - 2 * sm), now, 0.5);
    };
    S.onCtl.rain = (v, now) => rG.gain.setTargetAtTime(v * 0.9, now, 0.6);
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
const PENT = [0, 2, 4, 7, 9];
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
      if (!this.tn) { // Pfeifen (zwei leicht verstimmte Sinus), Drohnen (Sägezahn tief), Luftrauschen
        const L = (this.tn = this.mk({})), t = now; L.out.connect(R.bus.atmo);
        L.w1 = this.src(L, c.createOscillator(), t); L.w2 = this.src(L, c.createOscillator(), t); L.wg = this.node(L, c.createGain()); L.wg.gain.value = 0;
        L.w1.connect(L.wg); L.w2.connect(L.wg); L.wg.connect(L.out); L.w1.frequency.value = 500; L.w2.frequency.value = 503;
        const vb = this.src(L, c.createOscillator(), t), vg = this.node(L, c.createGain()); vb.frequency.value = 5.5; vg.gain.value = 7; vb.connect(vg); vg.connect(L.w1.frequency);
        L.dr = this.src(L, c.createOscillator(), t); L.dr.type = 'sawtooth'; L.dr.frequency.value = 55; const dl = this.node(L, c.createBiquadFilter()); dl.type = 'lowpass'; dl.frequency.value = 170; L.dg = this.node(L, c.createGain()); L.dg.gain.value = 0;
        L.dr.connect(dl); dl.connect(L.dg); L.dg.connect(L.out);
        const ns = this.noiseNode(L, 'white', t); L.bp = this.node(L, c.createBiquadFilter()); L.bp.type = 'bandpass'; L.bp.Q.value = 2; L.bp.frequency.value = 900; L.hg = this.node(L, c.createGain()); L.hg.gain.value = 0;
        ns.connect(L.bp); L.bp.connect(L.hg); L.hg.connect(L.out); L.out.gain.setTargetAtTime(1, now, 0.1);
      }
      const L = this.tn, f = 500 * Math.pow(7, v);
      L.w1.frequency.setTargetAtTime(f, now, 0.15); L.w2.frequency.setTargetAtTime(f * 1.006, now, 0.15); L.bp.frequency.setTargetAtTime(f * 1.5, now, 0.15); L.dr.frequency.setTargetAtTime(52 + 22 * v, now, 0.3);
      L.wg.gain.setTargetAtTime(0.05 * Math.pow(v, 1.4), now, 0.2); L.dg.gain.setTargetAtTime(0.15 * Math.pow(v, 1.2), now, 0.3); L.hg.gain.setTargetAtTime(0.06 * Math.pow(v, 2.2), now, 0.25);
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
        if (v) { const lvl = 0.10 + 0.08 * this.v.timeLapse; v.bell(t, mtof(60 + PENT[i % 5] + 12 * (((i / 5) | 0) % 3) + Math.round(this.v.timeLapse * 5)), [[1, 1, 0.35], [4, 0.2, 0.08]], lvl); }
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
