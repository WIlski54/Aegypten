// music.js – sehr leise, generative Musik: Harfe, Laute, Rohrflöte (Ney), Rahmentrommel und Sistrum in phrygisch-dominanter bzw. harmonisch-Moll-Tonleiter
// (kleine Terz / übermäßige Sekunde). Je Seite ein eigenes Bett, dazu das feste Titelthema (Cover, Zeitrad) und seine volle Variante im Finale.
// Der Scheduler arbeitet mit Vorausschau (tick(von, bis)); jede Zeile/Phrase ist ein einziger Voice (ein Pool-Platz).
import { clamp, mtof, LEVELS_LIN } from './synth.js';
import { SC, pluck, ney, drum, rattle } from './inst.js';

/** Titelthema in D (phrygisch-dominant): [Schlag, Halbtöne über D4, Dauer in Schlägen]; vier Zeilen zu je 8 Schlägen. */
export const THEME = [
  [0, 7, 1], [1, 5, 0.5], [1.5, 4, 0.5], [2, 1, 1], [3, 0, 1], [4, 1, 1], [5, 4, 2],
  [8, 5, 1], [9, 4, 0.5], [9.5, 1, 0.5], [10, 0, 1], [11, -2, 1], [12, 0, 3],
  [16, 8, 1], [17, 7, 0.5], [17.5, 5, 0.5], [18, 4, 1], [19, 5, 1], [20, 7, 2],
  [24, 5, 1], [25, 4, 0.5], [25.5, 1, 0.5], [26, 0, 1], [27, 1, 1], [28, 0, 4],
];
const DRUMS = [[0, 'dum'], [1.5, 'tak'], [2, 'dum'], [3, 'tak'], [3.5, 'ka']]; // ein Takt (4 Schläge) Rahmentrommel zum vollen Thema

const midi = (c, d) => { const s = SC[c.sc], n = s.length, k = Math.floor(d / n); return c.root + s[d - k * n] + 12 * k; };
const pick = (r, list) => { let w = 0; for (const x of list) w += x[1]; let u = r() * w; for (const x of list) { u -= x[1]; if (u <= 0) return x[0]; } return list[0][0]; };

// ---- Stimmung je Szene: root (MIDI-Tonika), sc (Tonleiter), deg [min,max] (Stufen), st (Notenabstand s), len (Noten je Phrase), gap (Pause s), vel, rev (Hall),
//      mix (Instrumente mit Gewicht), perc (Rahmentrommel-Muster), pad (leise Bordun-Fläche), theme ('short' | 'long' | 'full'), themeAt (erster Einsatz s), tgap (Pause zwischen Themen s), beat (Schlag s)
export const MUSIC = {
  cover: { theme: 'short', themeAt: 2, tgap: [14, 20], beat: 0.8, root: 62, sc: 'phryg', vel: 0.55, rev: 0.6 },
  zeitrad: { theme: 'long', themeAt: 1.5, tgap: [10, 16], beat: 0.78, root: 62, sc: 'phryg', vel: 0.6, rev: 0.55 },
  nil: { mix: [['harp', 5], ['ney', 5]], root: 57, sc: 'phryg', deg: [0, 8], st: [0.5, 0.9], len: [3, 5], gap: [4, 8], vel: 0.6, rev: 0.55 },
  reich: { mix: [['lute', 5], ['ney', 3], ['harp', 2]], root: 62, sc: 'phryg', deg: [0, 8], st: [0.3, 0.55], len: [3, 6], gap: [3, 6], vel: 0.65, rev: 0.35,
    perc: { beat: 0.42, vel: 0.5, pat: ['dum', null, 'tak', null, 'dum', 'dum', 'tak', null] } },
  gizeh: { mix: [['harp', 5], ['ney', 5]], root: 55, sc: 'hmin', deg: [0, 7], st: [0.7, 1.1], len: [3, 4], gap: [5, 9], vel: 0.6, rev: 0.5 },
  goetter: { mix: [['ney', 6], ['harp', 4]], root: 57, sc: 'hmin', deg: [0, 7], st: [0.9, 1.4], len: [3, 4], gap: [5, 9], vel: 0.6, rev: 0.85 },
  mumie: { mix: [['lute', 6], ['ney', 4]], root: 55, sc: 'min5', deg: [0, 6], st: [0.8, 1.3], len: [3, 4], gap: [6, 11], vel: 0.5, rev: 0.7 },
  alltag: { mix: [['lute', 6], ['harp', 2], ['ney', 2]], root: 64, sc: 'phryg', deg: [0, 8], st: [0.28, 0.5], len: [4, 7], gap: [3, 6], vel: 0.6, rev: 0.3,
    perc: { beat: 0.38, vel: 0.4, pat: ['tak', null, 'ka', null, 'dum', null, 'ka', 'tak'] } },
  tal: { mix: [['harp', 5], ['ney', 5]], root: 59, sc: 'hmin', deg: [0, 6], st: [0.9, 1.5], len: [3, 4], gap: [6, 12], vel: 0.55, rev: 0.8 },
  finale: { theme: 'full', themeAt: 9, tgap: [50, 65], beat: 0.78, root: 62, sc: 'phryg', mix: [['harp', 5], ['ney', 5]], deg: [0, 8], st: [0.7, 1.2], len: [3, 5], gap: [5, 9], vel: 0.7, rev: 0.55,
    pad: { notes: [38, 45, 50], lp: 420, lvl: 0.05 } },
};

export class Music {
  constructor(R) { this.R = R; this.id = ''; this.cfg = null; this.next = 1e9; this.live = []; this.motif = null; this.pad = null; this.th = null; this.tStart = 1e9; this.pFired = false; }
  /** Szene wechseln: laufende Phrasen sanft ausblenden, neues Motiv starten. */
  setScene(id, t, fade = 1.2) {
    this.stop(fade); this.id = id; this.cfg = MUSIC[id] || null; this.motif = null;
    const c = this.cfg; if (!c) return;
    const r = this.R.rng;
    this.next = c.mix ? t + fade + 0.6 + r() * 1.5 : 1e9;
    this.tStart = c.theme ? t + fade + (c.themeAt ?? 1.5) : 1e9;
    if (c.pad) this.buildPad(t + fade * 0.5);
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
    this.next = 1e9; this.tStart = 1e9; this.th = null;
  }
  /** Steuerwert: 'parade' (Finale-Hebel) löst das volle Titelthema sofort aus (einmal, bis der Wert wieder unter 0.2 fällt). */
  ctl(name, v, now) {
    if (name !== 'parade' || !this.cfg || this.cfg.theme !== 'full') return;
    if (v < 0.2) this.pFired = false;
    else if (v > 0.5 && !this.pFired && !this.th) { this.pFired = true; this.tStart = Math.min(this.tStart, (now ?? this.R.ctx.currentTime) + 0.4); }
  }
  tick(from, to) {
    const c = this.cfg; if (!c) return;
    while (this.next < to) { this.phrase(); if (this.live.length > 12) this.live = this.live.filter((v) => !v.dead); }
    if (c.theme) {
      if (!this.th && this.tStart < to) this.startTheme(Math.max(this.tStart, from));
      while (this.th && this.th.tl < to) this.themeLine();
    }
  }
  motifFor(c, short) {
    const r = this.R.rng, lo = c.deg[0], hi = c.deg[1], N = SC[c.sc].length;
    let n = c.len[0] + ((r() * (c.len[1] - c.len[0] + 1)) | 0); if (short) n = Math.max(2, n - 1);
    let m = this.motif && r() < 0.5 ? this.motif.slice() : null; // Motiv wiederholen und leicht verändern
    if (m) { const i = (r() * m.length) | 0; m[i] = clamp(m[i] + (r() < 0.5 ? -1 : 1), lo, hi); }
    else {
      m = []; let d = clamp([0, 0, 2, N - 3][(r() * 4) | 0], lo, hi);
      for (let i = 0; i < n; i++) { m.push(d); d = clamp(d + [-2, -1, -1, 0, 1, 1, 2][(r() * 7) | 0], lo, hi); }
      if (r() < 0.65) m[n - 1] = clamp(0, lo, hi); // gern auf der Tonika enden
    }
    return (this.motif = m);
  }
  phrase() {
    const c = this.cfg, R = this.R, r = R.rng, inst = pick(r, c.mix), isNey = inst === 'ney', v = R.voice(2, 'music', 'music:' + this.id);
    if (!v) { this.next += 2; return; }
    const m = this.motifFor(c, isNey); let t = this.next; const t0 = t;
    for (let i = 0; i < m.length; i++) {
      let nm = midi(c, m[i]);
      if (isNey) { if (nm < 62) nm += 12; const d = c.st[1] * 1.5 + r() * 1.2; ney(v, t, nm, d, c.vel * (0.75 + 0.25 * r()), v.out); t += d * 0.75 + 0.3; }
      else { pluck(v, t, nm, c.vel * (0.7 + 0.3 * r()), v.out, inst); t += c.st[0] + r() * (c.st[1] - c.st[0]); }
    }
    if (c.perc) { const p = c.perc, n = Math.min(24, Math.floor((t - t0) / p.beat)); for (let i = 0; i < n; i++) { const k = p.pat[i % p.pat.length]; if (k) drum(v, t0 + i * p.beat, k, p.vel * (0.8 + 0.2 * r()), v.out); } }
    if (c.rev) v.send(c.rev);
    this.live.push(v); this.next = t + c.gap[0] + r() * (c.gap[1] - c.gap[0]);
  }
  // ---- Titelthema: Zeile für Zeile geplant (je Zeile ein Voice)
  startTheme(t) {
    const c = this.cfg, nl = c.theme === 'short' ? 2 : 4; this.th = { li: 0, nl, t0: t, tl: t };
    this.next = Math.max(this.next, t + nl * 8 * c.beat + 3); // das Bett pausiert während des Themas
  }
  themeLine() {
    const c = this.cfg, R = this.R, r = R.rng, th = this.th, li = th.li, b = c.beat, t0 = th.t0 + li * 8 * b, full = c.theme === 'full', lead = c.theme !== 'short' && li > 0, v = R.voice(2, 'music', 'music:' + this.id);
    if (v) {
      for (const [bt, st, d] of THEME) {
        if (bt < li * 8 || bt >= li * 8 + 8) continue;
        const t = th.t0 + bt * b, vel = c.vel * (0.85 + 0.15 * r());
        pluck(v, t, c.root + st, vel, v.out, 'harp');
        if (lead && d >= 1) ney(v, t + 0.02, c.root + st + 12, d * b * 0.95, c.vel * (full ? 0.75 : 0.5), v.out);
      }
      if (full) {
        for (let k = 0; k < 8; k++) pluck(v, t0 + k * b, c.root - 12 + [0, 7, 12, 7][k % 4], c.vel * 0.4, v.out, 'harp'); // Harfenbegleitung über dem Orgelpunkt D
        if (li > 0) for (let bar = 0; bar < 2; bar++) for (const [bt, k] of DRUMS) drum(v, t0 + (bar * 4 + bt) * b, k, c.vel * 0.55, v.out);
        if (li >= 2) rattle(v, t0, c.vel * 0.7, v.out, 12, 0.6);
      }
      if (c.rev) v.send(c.rev);
      this.live.push(v);
    }
    th.li++;
    if (th.li >= th.nl) { this.tStart = th.t0 + th.nl * 8 * b + c.tgap[0] + r() * (c.tgap[1] - c.tgap[0]); this.th = null; }
    else th.tl = th.t0 + th.li * 8 * b;
  }
  /** Leiser Bordun (Grundton, Quinte, Oktave): Sägezähne, je zwei leicht verstimmt, Tiefpass mit langsamem Wabern; 4 s Einblendung. */
  buildPad(t) {
    const R = this.R, c = R.ctx, P = this.cfg.pad, out = c.createGain(), lp = c.createBiquadFilter(), oscs = [];
    out.gain.value = 0; out.connect(R.bus.music); lp.type = 'lowpass'; lp.frequency.value = P.lp; lp.Q.value = 0.6; lp.connect(out);
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.055; lg.gain.value = P.lp * 0.3; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(t);
    const tr = LEVELS_LIN('music:' + this.id + ':pad');
    for (const n of P.notes) for (let k = 0; k < 2; k++) {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.value = mtof(n) * (k ? 1.004 : 0.996); g.gain.value = P.lvl; o.connect(g); g.connect(lp); o.start(t); oscs.push(o);
    }
    oscs.push(lfo); oscs[0].onended = () => { for (const o of oscs) { try { o.disconnect(); } catch (e) { /* egal */ } } lp.disconnect(); out.disconnect(); };
    out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(tr, t + 4);
    this.pad = { out, oscs };
  }
}

/** Abschiedsmelodie „musicbox“ (sfx): das Titelthema auf der Harfe, ca. 16 s (o.beat = Schlaglänge, Standard 0.5 s), zum Schluss ein hoher Ton. */
export function playMelody(R, t, o = {}) {
  const v = R.voice(3, 'music', 'sfx:musicbox'); if (!v) return null;
  const b = o.beat || 0.5;
  for (const [bt, st] of THEME) pluck(v, t + (bt + (bt > 24 ? (bt - 24) * (bt - 24) * 0.02 : 0)) * b, 62 + st + 12, 0.85, v.out, 'harp');
  pluck(v, t + 33 * b, 62 + 24, 0.4, v.out, 'harp');
  v.send(0.55); return v;
}
