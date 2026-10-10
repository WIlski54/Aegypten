// music.js – sehr leise, generative Musik: Spieluhr-/Celesta-Motive in Pentatonik, je Zeitalter andere Klangfarbe und Tonart.
// Beim Einschlag Stille; im Finale ein warmes Pad mit Flöte. Der Scheduler arbeitet mit Vorausschau (tick(von, bis)).
import { clamp, mtof, env, LEVELS_LIN } from './synth.js';

const SC = { maj5: [0, 2, 4, 7, 9], min5: [0, 3, 5, 7, 10] };
const midi = (c, d) => c.root + SC[c.sc][((d % 5) + 5) % 5] + 12 * Math.floor(d / 5);

// ---- Instrumente: Teiltöne [[Verhältnis, Amplitude, Abklingzeit s]]
const PART = {
  box: [[1, 1, 1.6], [2.01, 0.16, 0.45], [6.27, 0.09, 0.1]], // Spieluhr: Zunge mit metallischem „Ting“
  cel: [[1, 1, 1.3], [4, 0.3, 0.45], [2, 0.1, 0.8], [3, 0.05, 0.3]], // Celesta: starker 4. Teilton
  mar: [[1, 1, 0.6], [4, 0.2, 0.12], [10, 0.05, 0.04]], // Marimba: kurz, warm
  kal: [[1, 1, 0.95], [5.4, 0.18, 0.1], [2, 0.08, 0.3]], // Kalimba
  gls: [[1, 1, 2.2], [2.76, 0.22, 0.9], [5.4, 0.08, 0.3]], // Glasharfe/Wasserklang: lange Ausklänge
};
/** Einzelner Ton eines Instruments (Voice v, Zeit t, MIDI-Note m, Anschlagstärke vel). */
export function note(v, inst, t, m, vel, dest) {
  v.bell(t, mtof(m), PART[inst], 0.32 * vel, dest);
  if (inst === 'cel' || inst === 'mar') v.nz(t, { kind: 'white', f: 3500, type: 'highpass', a: 0.002, d: 0.012, peak: 0.02 * vel, dest }); // winziger Anschlag
}

// ---- Stimmung je Szene: inst, root (MIDI-Tonika), sc (Tonleiter), deg [min,max] (Stufen), st (Notenabstand s), len (Noten je Phrase), gap (Pause s), vel, rev (Hall)
export const MUSIC = {
  cover: { inst: 'box', root: 72, sc: 'maj5', deg: [0, 7], st: [0.55, 0.9], len: [3, 5], gap: [5, 9], vel: 0.55, rev: 0.6 },
  erduhr: { inst: 'cel', root: 65, sc: 'maj5', deg: [0, 7], st: [0.4, 0.7], len: [3, 6], gap: [3, 7], vel: 0.7, rev: 0.5 },
  trias: { inst: 'mar', root: 62, sc: 'min5', deg: [0, 6], st: [0.35, 0.6], len: [3, 6], gap: [3, 7], vel: 0.7, rev: 0.3 },
  'jura-wald': { inst: 'kal', root: 67, sc: 'maj5', deg: [0, 7], st: [0.45, 0.75], len: [3, 5], gap: [4, 8], vel: 0.7, rev: 0.5 },
  'jura-lagune': { inst: 'gls', root: 69, sc: 'maj5', deg: [0, 8], st: [0.5, 0.9], len: [3, 5], gap: [4, 8], vel: 0.65, rev: 0.6 },
  'kreide-meer': { inst: 'box', root: 74, sc: 'maj5', deg: [-2, 7], st: [0.55, 1.0], len: [3, 5], gap: [4, 9], vel: 0.65, rev: 0.6 },
  spaetkreide: { inst: 'mar', root: 57, sc: 'min5', deg: [0, 6], st: [0.7, 1.1], len: [3, 4], gap: [5, 10], vel: 0.6, rev: 0.4 },
  nest: { inst: 'box', root: 75, sc: 'maj5', deg: [0, 6], st: [0.6, 0.95], len: [3, 5], gap: [4, 8], vel: 0.55, rev: 0.5 },
  einschlag: null, // Stille
  finale: { pad: true, inst: 'flute', root: 72, sc: 'maj5', deg: [0, 7], st: [0.9, 1.6], len: [3, 5], gap: [5, 9], vel: 0.8, rev: 0.5 },
};
const CHORDS = [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]]; // C – Am – F – G(sus)

export class Music {
  constructor(R) { this.R = R; this.id = ''; this.cfg = null; this.next = 1e9; this.live = []; this.motif = null; this.pad = null; this.chord = 0; }
  /** Szene wechseln: laufende Phrasen sanft ausblenden, neues Motiv starten. */
  setScene(id, t, fade = 1.2) {
    this.stop(fade); this.id = id; this.cfg = MUSIC[id] || null; this.motif = null;
    if (!this.cfg) { this.next = 1e9; return; }
    this.next = t + fade + 0.6 + this.R.rng() * 1.5;
    if (this.cfg.pad) this.buildPad(t + fade * 0.5);
  }
  stop(fade = 1.2) {
    for (const v of this.live) if (!v.dead) v.kill(fade);
    this.live.length = 0;
    const p = this.pad;
    if (p) {
      const now = this.R.ctx.currentTime; p.out.gain.cancelScheduledValues(now); p.out.gain.setTargetAtTime(0, now, fade / 4);
      for (const o of p.oscs) { try { o.stop(now + fade + 0.3); } catch (e) { /* egal */ } }
      this.pad = null;
    }
    this.next = 1e9;
  }
  tick(from, to) {
    if (!this.cfg) return;
    while (this.next < to) { if (this.cfg.inst === 'flute') this.flute(); else this.phrase(); if (this.live.length > 12) this.live = this.live.filter((v) => !v.dead); }
    const p = this.pad;
    if (p && to > p.change) { // Akkordwechsel: Töne gleiten sanft
      this.chord = (this.chord + 1) % CHORDS.length; const ch = CHORDS[this.chord];
      for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) p.oscs[i * 2 + k].frequency.setTargetAtTime(mtof(ch[i]) * (k ? 1.004 : 0.996), Math.max(p.change, from), 1.6);
      p.change += 11 + this.R.rng() * 4;
    }
  }
  motifFor(c) {
    const r = this.R.rng, lo = c.deg[0], hi = c.deg[1], n = c.len[0] + ((r() * (c.len[1] - c.len[0] + 1)) | 0);
    let m = this.motif && r() < 0.55 ? this.motif.slice() : null; // Motiv wiederholen und leicht verändern
    if (m) { const i = (r() * m.length) | 0; m[i] = clamp(m[i] + (r() < 0.5 ? -1 : 1), lo, hi); }
    else { m = []; let d = lo + ((r() * (hi - lo)) | 0); for (let i = 0; i < n; i++) { m.push(d); d = clamp(d + [-2, -1, -1, 0, 1, 1, 2][(r() * 7) | 0], lo, hi); } }
    return (this.motif = m);
  }
  phrase() {
    const c = this.cfg, r = this.R.rng, v = this.R.voice(2, 'music', 'music:' + this.id);
    if (!v) { this.next += 2; return; }
    const m = this.motifFor(c); let t = this.next;
    for (let i = 0; i < m.length; i++) { note(v, c.inst, t, midi(c, m[i]), c.vel * (0.7 + 0.3 * r()), v.out); t += c.st[0] + r() * (c.st[1] - c.st[0]); }
    if (c.rev) v.send(c.rev);
    this.live.push(v); this.next = t + c.gap[0] + r() * (c.gap[1] - c.gap[0]);
  }
  /** Flöte (Finale): Sinus+Dreieck, spätes Vibrato, Hauchrauschen, weiche Atemhüllkurve. */
  flute() {
    const c = this.cfg, R = this.R, r = R.rng, v = R.voice(2, 'music', 'music:flute');
    if (!v) { this.next += 2; return; }
    const m = this.motifFor(c); let t = this.next;
    for (let i = 0; i < m.length; i++) {
      const f = mtof(midi(c, m[i]) + 12), d = 0.9 + r() * 0.9, e = t + d + 0.5;
      const o = v.osc('sine', f, t, e), o2 = v.osc('triangle', f, t, e), g = v.g(0), g2 = v.g(0.25);
      v.vib(o, 5.2, f * 0.006, t + 0.25, e); o.connect(g); o2.connect(g2); g2.connect(g);
      env(g.gain, t, [[0, 0], [0.16, 0.085 * c.vel], [d * 0.7, 0.07 * c.vel], [d + 0.35, 0]]);
      const nn = v.noise('white', t, e), bp = v.f('bandpass', f * 2, 3), ng = v.g(0); nn.connect(bp); bp.connect(ng); ng.connect(v.out);
      env(ng.gain, t, [[0, 0], [0.1, 0.02], [d * 0.7, 0.012], [d + 0.35, 0]]);
      g.connect(v.out); t += c.st[0] + r() * (c.st[1] - c.st[0]) + d * 0.4;
    }
    v.send(c.rev); this.live.push(v); this.next = t + c.gap[0] + r() * (c.gap[1] - c.gap[0]);
  }
  /** Warmes Pad: drei Akkordtöne, je zwei leicht verstimmte Sägezähne, Tiefpass mit langsamem Wabern; 4 s Einblendung. */
  buildPad(t) {
    const R = this.R, c = R.ctx, out = c.createGain(), lp = c.createBiquadFilter(), ch = CHORDS[this.chord = 0], oscs = [];
    out.gain.value = 0; out.connect(R.bus.music); lp.type = 'lowpass'; lp.frequency.value = 650; lp.Q.value = 0.6; lp.connect(out);
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.055; lg.gain.value = 220; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(t);
    const tr = LEVELS_LIN('music:pad');
    for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.value = mtof(ch[i]) * (k ? 1.004 : 0.996); g.gain.value = 0.05; o.connect(g); g.connect(lp); o.start(t); oscs.push(o);
    }
    oscs.push(lfo); oscs[0].onended = () => { for (const o of oscs) { try { o.disconnect(); } catch (e) { /* egal */ } } lp.disconnect(); out.disconnect(); };
    out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(tr, t + 4);
    this.pad = { out, oscs, change: t + 12 };
  }
}

/** Abschiedsmelodie „musicbox“ (sfx): kleines Wiegenlied in C-Pentatonik, gegen Ende langsamer, ca. 16 s. */
export function playMelody(R, t, o = {}) {
  const v = R.voice(3, 'music', 'sfx:musicbox'); if (!v) return null;
  const M = [[0, 76], [1, 79], [2, 81], [3, 79], [4, 76], [5, 74], [6, 72], [8, 74], [9, 76], [10, 79], [11, 76], [12, 74], [13, 72], [14, 69],
    [16, 72], [17, 74], [18, 76], [19, 79], [20, 81], [21, 79], [22, 76], [23, 74], [24, 72], [25, 76], [26, 74], [28, 72], [28, 60]];
  const beat = o.beat || 0.52;
  for (const [b, m] of M) { const tt = t + (b + (b > 20 ? (b - 20) * (b - 20) * 0.012 : 0)) * beat; note(v, 'box', tt, m, 0.85, v.out); }
  note(v, 'box', t + 28.9 * beat, 84, 0.45, v.out);
  v.send(0.55); return v;
}
