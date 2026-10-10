// voices.js – synthetische Tierstimmen (FM + subtraktive Synthese mit Formantfiltern), Vogelrufe, Piepser.
// Jede Art ist eine kleine Liste von „Silben“ (freundlich und kurz, nichts Schauriges). Der Schalter `cine` macht
// die Laute etwas rauer und länger. Götter-Ids geben keinen Tierlaut, sondern einen kurzen, würdevollen Harfenklang.
import { clamp, env } from './synth.js';
import { pluck } from './inst.js';

// Stützpunkte [[tn, Hz], …] (tn 0…1) → Float32Array mit n Werten, geometrisch interpoliert, mit etwas Zittern (jit).
function contour(pts, n, jit, rnd) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 0 : i / (n - 1); let k = 1; while (k < pts.length - 1 && pts[k][0] < x) k++;
    const a = pts[k - 1], b = pts[k], u = b[0] === a[0] ? 1 : clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
    out[i] = a[1] * Math.pow(b[1] / a[1], u) * (1 + (jit ? (rnd() - 0.5) * 2 * jit : 0));
  }
  return out;
}
const AMP = [[0, 0], [0.14, 1], [0.7, 0.8], [1, 0]];

/**
 * Stimmsynthese: Sägezahn/Dreieck (+FM, +Sub, +Hauch) → Formantfilter (parallele Bandpässe) → Hüllkurve → Rauigkeit (AM)
 * → Sättigung → Tiefpass. p: d f w saw vib fm sub nz low lc F amp rough drive lp g
 */
function vocal(v, t, p, dest) {
  const d = p.d, e = t + d + 0.06, n = Math.max(6, Math.round(d * 48)), saw = p.saw ?? 1, f0 = saw > 0 ? contour(p.f, n, p.jit ?? 0.012, v.R.rng) : null; // saw 0 = nur Hauch (Schnaufen, Zischen)
  let mean = 0; if (f0) { for (let i = 0; i < n; i++) mean += f0[i]; mean /= n; }
  const src = v.g(1);
  if (saw > 0) {
    const o = v.osc(p.w || 'sawtooth', 100, t, e); o.frequency.setValueCurveAtTime(f0, t, d);
    if (p.vib) v.vib(o, p.vib[0], p.vib[1] * mean, t, e);
    if (p.fm) { // FM: Modulator folgt der Tonhöhe, der Index wandert von fm[1] nach fm[2]
      const m = v.osc('sine', 100, t, e), mg = v.g(0), r = p.fm[0];
      m.frequency.setValueCurveAtTime(f0.map((x) => x * r), t, d);
      env(mg.gain, t, [[0, p.fm[1] * mean * r], [d, p.fm[2] * mean * r]]); m.connect(mg); mg.connect(o.frequency);
    }
    const og = v.g(saw); o.connect(og); og.connect(src);
    if (p.sub) { const s = v.osc('sine', 100, t, e), sg = v.g(p.sub); s.frequency.setValueCurveAtTime(f0.map((x) => x * 0.5), t, d); s.connect(sg); sg.connect(src); }
  }
  if (p.nz) { const nn = v.noise('white', t, e), ng = v.g(p.nz); nn.connect(ng); ng.connect(src); }
  const mix = v.g(1);
  for (const [fr, q, gn] of p.F) { // Formanten: Mittenfrequenz kann gleiten (Vokalfärbung)
    const bp = v.f('bandpass', Array.isArray(fr) ? fr[0] : fr, q), fg = v.g(gn);
    if (Array.isArray(fr)) { bp.frequency.setValueAtTime(fr[0], t); bp.frequency.linearRampToValueAtTime(fr[1], t + d); }
    src.connect(bp); bp.connect(fg); fg.connect(mix);
  }
  if (p.low !== 0 && saw > 0) { const lf = v.f('lowpass', p.lc || 260, 0.7), lg = v.g(p.low ?? 0.6); src.connect(lf); lf.connect(lg); lg.connect(mix); } // Grundton/Grollen bleibt erhalten
  const amp = v.g(0); env(amp.gain, t, (p.amp || AMP).map(([x, a]) => [x * d, a * (p.g ?? 1)]));
  mix.connect(amp); let n2 = amp;
  if (p.rough) { const rg = v.g(1 - p.rough[1] / 2), l = v.osc('sine', p.rough[0], t, e), lg = v.g(p.rough[1] / 2); l.connect(lg); lg.connect(rg.gain); n2.connect(rg); n2 = rg; }
  if (p.drive) { const sh = v.shaper(p.drive), hp = v.f('highpass', 22, 0.7); n2.connect(sh); sh.connect(hp); n2 = hp; } // Sättigung erzeugt Gleichanteil → Hochpass dahinter
  if (p.lp) { const lp = v.f('lowpass', p.lp, 0.6); n2.connect(lp); n2 = lp; }
  n2.connect(dest);
}

/** Zwitschern/Pfeifen: Sinus mit Gleiten (f0→f1[→f2]) und optionaler FM. Note: [Beginn, Dauer, f0, f1, Amp, FM-Index, f2] */
function chirps(v, t, p, dest) {
  for (const [dt, d, f0, f1, a, idx, f2] of p.n) {
    const s = t + dt, e = s + d + 0.05, te = s + (f2 ? d * 0.5 : d), o = v.osc('sine', f0, s, e);
    o.frequency.setValueAtTime(f0, s); o.frequency.exponentialRampToValueAtTime(f1, te); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d);
    if (p.vr) v.vib(o, p.vr, f0 * 0.02, s, e);
    if (idx) {
      const r = p.fmr || 2, m = v.osc('sine', f0 * r, s, e), mg = v.g(idx * f0 * r * 0.4);
      m.frequency.setValueAtTime(f0 * r, s); m.frequency.exponentialRampToValueAtTime(f1 * r, te); if (f2) m.frequency.exponentialRampToValueAtTime(f2 * r, s + d);
      m.connect(mg); mg.connect(o.frequency);
    }
    const g = v.g(0); env(g.gain, s, [[0, 0], [Math.min(0.012, d * 0.25), a], [d * 0.65, a * 0.85], [d, 0]]); o.connect(g); g.connect(dest);
  }
}
/** Klickfolge (Delfin, Panzerklappern, Eier): Zeiten ts in s, Bandpass f/q. */
function clicks(v, t, p, dest) {
  const ts = p.ts, e = t + ts[ts.length - 1] + 0.06, n = v.noise('white', t, e), bp = v.f('bandpass', p.f, p.q || 3), g = v.g(0);
  n.connect(bp); bp.connect(g); g.connect(dest); g.gain.setValueAtTime(0, t);
  for (const x of ts) { const s = t + x; g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(p.a, s + 0.0015); g.gain.exponentialRampToValueAtTime(p.a * 0.02, s + 0.009); g.gain.linearRampToValueAtTime(0, s + 0.012); }
  if (p.body) for (const x of ts) v.tone(t + x, { f: p.body, f2: p.body * 0.7, a: 0.002, d: 0.03, peak: p.a * 0.5, dest });
}
// ------------------------------------------------------------------ Vogelrufe (auch für Atmosphären und sfx 'tweet')
/** Zufälliger kurzer Vogelruf als Notenliste für chirps(). kind 0 Strophe, 1 zwei Pfeiftöne, 2 Triller, 3 Zirpen, 4 tiefer Ruf (Savanne). */
export function birdNotes(R, kind) {
  const r = R.rng, out = [];
  if (kind === 0) { let f = 3600 + r() * 1400, x = 0; const n = 5 + ((r() * 4) | 0); for (let i = 0; i < n; i++) { const d = 0.06 + r() * 0.06; out.push([x, d, f, f * (0.7 + r() * 0.6), 0.8, 0.35]); x += d + 0.03 + r() * 0.04; f *= 0.9 + r() * 0.16; } }
  else if (kind === 1) { const f = 2800 + r() * 800; out.push([0, 0.2, f * 1.15, f * 1.3, 0.9, 0, f * 1.05], [0.3, 0.3, f * 1.05, f * 0.8, 0.8, 0]); }
  else if (kind === 2) { const f = 3800 + r() * 800; for (let i = 0; i < 7; i++) out.push([i * 0.065, 0.04, f, f * 1.25, 0.7, 0.3]); }
  else if (kind === 3) { const f = 4200 + r() * 900; out.push([0, 0.06, f, f * 1.2, 0.8, 0.2], [0.11, 0.05, f * 1.05, f * 1.3, 0.6, 0.2]); }
  else { const f = 700 + r() * 300; out.push([0, 0.18, f * 0.8, f * 1.25, 0.9, 0.5], [0.26, 0.3, f * 1.25, f * 0.7, 0.9, 0.5]); }
  return out;
}

// ------------------------------------------------------------------ Arten
const rep = (n, dt, f) => Array.from({ length: n }, (_, i) => f(i, i * dt)); // n Silben im Abstand dt
const SP = {
  // ---- Nil und Ufer
  nilpferd: [...rep(4, 0.34, (i, at) => ({ k: 'v', at, d: 0.26, f: [[0, 150 - i * 8], [0.35, 215 - i * 10], [1, 120 - i * 6]], rough: [38, 0.55], nz: 0.22, sub: 0.4, F: [[[520, 420], 4, 1], [[1000, 820], 4, 0.6]], lp: 2200 })), // Grunzlachen: vier „Honks“ …
    { k: 'v', at: 1.55, d: 0.9, f: [[0, 130], [0.4, 110], [1, 70]], rough: [14, 0.6], nz: 0.2, sub: 0.5, F: [[[380, 300], 4, 1], [[800, 600], 4, 0.6]], lp: 1800 }], // … und ein langes, tiefes Ausatmen/Gähnen
  krokodil: [{ k: 'v', d: 0.9, saw: 0, nz: 1, F: [[3800, 1.5, 1], [7000, 1.2, 0.5]], amp: [[0, 0], [0.15, 1], [0.6, 0.8], [1, 0]], g: 0.7 }, // Zischen
    { k: 'v', at: 0.7, d: 1.1, f: [[0, 68], [0.5, 60], [1, 50]], rough: [16, 0.7], sub: 0.6, nz: 0.1, F: [[[210, 190], 4, 1], [[450, 380], 4, 0.7]], lp: 900, g: 0.8 }], // Brummen
  ibis: [{ k: 'v', d: 0.32, f: [[0, 540], [0.3, 450], [1, 330]], rough: [70, 0.65], nz: 0.35, F: [[900, 4, 1], [1700, 4, 0.6], [2800, 4, 0.2]], low: 0, lp: 4000 },
    { k: 'v', at: 0.42, d: 0.28, f: [[0, 500], [0.3, 420], [1, 300]], rough: [70, 0.65], nz: 0.35, F: [[850, 4, 1], [1650, 4, 0.6], [2700, 4, 0.2]], low: 0, lp: 4000 }], // heiseres „Kräh“, zweimal
  reiher: [{ k: 'v', d: 0.55, f: [[0, 310], [0.15, 420], [1, 230]], rough: [48, 0.7], nz: 0.4, drive: 1.5, F: [[[800, 650], 3, 1], [[1700, 1400], 3, 0.8], [[2800, 2300], 4, 0.3]], low: 0.2, lp: 4200 }],
  falke: [{ k: 'b', n: [[0, 0.2, 4300, 3300, 1, 0.5], [0.27, 0.2, 4400, 3300, 1, 0.5], [0.54, 0.24, 4500, 3200, 1, 0.5]], fmr: 2 }], // heller Ruf, kurz
  wasservogel: rep(5, 0.17, (i, at) => ({ k: 'v', at: at + (i > 2 ? 0.05 : 0), d: 0.1, f: [[0, 460 - i * 15], [1, 360 - i * 10]], rough: [70, 0.4], nz: 0.12, F: [[[900, 800], 5, 1], [[2000, 1700], 5, 0.7]], low: 0, lp: 4000 })), // Schnattern
  fisch: [{ k: 'p', n: 4, dt: 0.17 }],
  kobra: [{ k: 'v', d: 1.0, saw: 0, nz: 1, F: [[3500, 1.2, 1], [6500, 1, 0.6]], amp: [[0, 0], [0.2, 1], [0.8, 0.7], [1, 0]], g: 0.8 }], // langes, leises Zischen
  geier: [{ k: 'v', d: 0.7, saw: 0, nz: 1, F: [[3000, 1.5, 1], [5500, 1.2, 0.5]], amp: [[0, 0], [0.2, 1], [0.7, 0.7], [1, 0]], g: 0.6 },
    { k: 'v', at: 0.5, d: 0.5, f: [[0, 260], [1, 180]], rough: [30, 0.8], nz: 0.5, F: [[600, 3, 1], [1300, 3, 0.7]], lp: 3000 }],
  // ---- Haus- und Nutztiere, Steppe
  katze: [{ k: 'v', d: 0.42, f: [[0, 420], [0.45, 760], [1, 640]], F: [[[420, 880], 6, 1], [[2300, 1500], 6, 0.5]], vib: [6, 0.02], nz: 0.05, low: 0, jit: 0.01 }, // Mi–
    { k: 'v', at: 0.4, d: 0.38, f: [[0, 640], [1, 400]], F: [[[880, 420], 6, 1], [[1500, 900], 6, 0.45]], low: 0, nz: 0.04 }, // –au
    { k: 'v', at: 1.0, d: 1.3, f: [[0, 85], [1, 80]], rough: [26, 0.9], nz: 0.55, F: [[300, 2, 1], [900, 1.5, 0.5]], low: 0.5, lp: 1200, g: 0.45, amp: [[0, 0], [0.25, 1], [0.75, 0.9], [1, 0]] }], // Schnurren
  ochse: [{ k: 'v', d: 1.4, f: [[0, 92], [0.3, 124], [0.7, 114], [1, 88]], vib: [5, 0.02], nz: 0.05, sub: 0.3, F: [[[400, 480], 5, 1], [[760, 650], 5, 0.6]], lp: 2400 }], // Muhen
  kuh: [{ k: 'v', d: 1.1, f: [[0, 150], [0.3, 195], [0.7, 180], [1, 140]], vib: [5.5, 0.02], nz: 0.05, sub: 0.2, F: [[[460, 560], 5, 1], [[900, 760], 5, 0.6]], lp: 2800 }], // heller und kürzer
  esel: [{ k: 'v', d: 0.5, f: [[0, 330], [0.5, 640], [1, 720]], rough: [40, 0.5], nz: 0.15, F: [[[600, 720], 5, 1], [[2000, 2300], 5, 0.7]], low: 0 }, // I–
    { k: 'v', at: 0.52, d: 0.55, f: [[0, 380], [1, 250]], rough: [40, 0.5], nz: 0.18, F: [[[800, 620], 5, 1], [[1300, 1000], 5, 0.6]], low: 0.2 }, // –A
    { k: 'v', at: 1.15, d: 0.35, f: [[0, 350], [1, 640]], rough: [40, 0.5], nz: 0.15, F: [[[600, 700], 5, 1], [[2000, 2200], 5, 0.7]], low: 0 },
    { k: 'v', at: 1.52, d: 0.42, f: [[0, 330], [1, 230]], rough: [40, 0.5], nz: 0.18, F: [[[800, 600], 5, 1], [[1300, 950], 5, 0.6]], low: 0.2 }],
  pferd: [{ k: 'v', d: 1.15, f: [[0, 820], [0.2, 1500], [0.45, 1250], [0.75, 800], [1, 420]], rough: [55, 0.4], nz: 0.15, vib: [7, 0.015], F: [[[1300, 1900], 5, 1], [[2800, 2600], 5, 0.5]], low: 0, lp: 5000 }, // Wiehern
    { k: 'v', at: 1.25, d: 0.5, f: [[0, 210], [1, 150]], rough: [18, 0.5], nz: 0.25, F: [[500, 3, 1], [1100, 3, 0.5]], g: 0.5 }], // Schnauben
  schakal: [{ k: 'v', d: 0.16, f: [[0, 480], [1, 330]], F: [[[700, 600], 6, 1], [[1500, 1300], 5, 0.4]], nz: 0.06 }, // freundliches Bellen …
    { k: 'v', at: 0.24, d: 0.16, f: [[0, 470], [1, 320]], F: [[[700, 600], 6, 1], [[1500, 1300], 5, 0.4]], nz: 0.06 },
    { k: 'v', at: 0.55, d: 0.5, f: [[0, 500], [0.4, 900], [1, 700]], vib: [7, 0.03], F: [[[650, 800], 6, 1], [[1500, 1700], 5, 0.5]] }], // … und ein kurzes Jaulen
  pavian: [{ k: 'v', d: 0.2, f: [[0, 210], [1, 150]], rough: [30, 0.5], nz: 0.25, drive: 1.5, F: [[[550, 450], 4, 1], [[1200, 950], 4, 0.6]] },
    { k: 'v', at: 0.3, d: 0.22, f: [[0, 220], [1, 150]], rough: [30, 0.5], nz: 0.25, drive: 1.5, F: [[[550, 450], 4, 1], [[1200, 950], 4, 0.6]] },
    { k: 'v', at: 0.7, d: 0.5, f: [[0, 150], [1, 100]], rough: [20, 0.6], nz: 0.2, F: [[400, 4, 1], [900, 4, 0.5]] }],
  skarabaeus: [{ k: 'v', d: 0.45, w: 'square', f: [[0, 190], [0.5, 240], [1, 200]], rough: [55, 0.85], F: [[1400, 4, 1], [2800, 4, 0.5]], low: 0, lp: 4500, g: 0.6 }, // leises Surren …
    { k: 'b', at: 0.5, n: [[0, 0.05, 5200, 6200, 0.6, 0.3], [0.08, 0.05, 5400, 6400, 0.6, 0.3], [0.16, 0.06, 5600, 6600, 0.5, 0.3]] }], // … und Zirpen
  // ---- Götter: kein Tierlaut, sondern ein würdevoller Harfenklang (MIDI-Noten)
  ra: [{ k: 'g', m: [74, 81, 86] }], osiris: [{ k: 'g', m: [62, 69, 66] }], isis: [{ k: 'g', m: [69, 74, 78] }], horus: [{ k: 'g', m: [70, 74, 81] }], anubis: [{ k: 'g', m: [57, 62, 66] }],
  thot: [{ k: 'g', m: [66, 70, 74] }], maat: [{ k: 'g', m: [81, 78, 74] }], hathor: [{ k: 'g', m: [69, 66, 74] }], bastet: [{ k: 'g', m: [74, 70, 69] }], sobek: [{ k: 'g', m: [55, 62, 67] }],
  ammit: [{ k: 'g', m: [62, 66, 62] }], chepre: [{ k: 'g', m: [67, 74, 79] }], nut: [{ k: 'g', m: [86, 81, 78, 74] }],
};
const ALIAS = {}; for (let i = 1; i <= 9; i++) ALIAS['skarab' + i] = 'skarabaeus'; // versteckte Käfer auf jeder Seite
export const VOICE_IDS = Object.keys(SP);

// Kino-Variante für Stimmen ohne eigenes `c`: länger, rauer, mit Sättigung und mehr Hauch
const cineOf = (p) => (p.c ? { ...p, ...p.c } : { ...p, d: p.d * 1.2, rough: p.rough ? [p.rough[0], Math.min(0.9, p.rough[1] + 0.2)] : [24, 0.4], drive: 3, nz: (p.nz || 0) + 0.12 });

/** Plätschern (Fisch): n kurze Wasserstöße mit kleinen Blasen. */
function splashes(v, t, p, dest) {
  const r = v.R.rng;
  for (let i = 0; i < p.n; i++) {
    const s = t + i * p.dt + r() * 0.05;
    v.nz(s, { kind: 'white', f: 1800 + r() * 1500, f2: 800, q: 0.9, a: 0.004, d: 0.12 + r() * 0.1, peak: 0.5, dest });
    const f = 400 + r() * 500; v.tone(s + 0.02, { f, f2: f * 1.8, gl: 0.05, a: 0.004, d: 0.07, peak: 0.2, dest });
  }
}

/**
 * Tierstimme abspielen. o: cine, dist (0…1: ferne, dumpfe Variante für Atmosphären), dest (Zielknoten statt fx-Bus), prio.
 * Gibt die Voice zurück (oder null). Unbekannte ids → leises Blip.
 */
export function playVoice(R, id, t, o = {}) {
  id = ALIAS[id] || id;
  const sp = SP[id], v = R.voice(o.prio ?? 2, o.dest || 'fx', 'voice:' + (sp ? id + (o.cine ? ':cine' : '') : 'blip'), o.dest ? '' : id);
  if (!v) return null;
  let dest = v.out, dist = o.dist || 0;
  if (!sp) { v.tone(t, { f: 880, f2: 1175, a: 0.005, d: 0.09, peak: 0.25 }); return v; }
  if (dist > 0) { const lp = v.f('lowpass', 2600 * (1 - dist) + 260, 0.6); lp.connect(v.out); dest = lp; v.out.gain.value *= 1 - 0.55 * dist; v.send((0.35 + 0.4 * dist) * (o.sendScale ?? 1)); }
  for (const it of sp) {
    const s = t + (it.at || 0);
    if (it.k === 'v') vocal(v, s, o.cine ? cineOf(it) : it, dest);
    else if (it.k === 'b') {
      let dd = dest;
      if (it.lp) { dd = v.f('lowpass', it.lp, 0.7); dd.connect(dest); }
      chirps(v, s, o.cine ? { ...it, n: it.n.map((x) => [x[0], x[1], x[2], x[3], x[4] * 1.2, (x[5] || 0) * 1.5, x[6]]) } : it, dd);
    } else if (it.k === 'c') clicks(v, s, it, dest);
    else if (it.k === 'p') splashes(v, s, it, dest);
    else if (it.k === 'g') { it.m.forEach((m, i) => pluck(v, s + i * 0.2, m, 0.85, dest, 'harp')); v.send(0.4 * (o.sendScale ?? 1)); }
    else if (it.k === 'r') chirps(v, s, { n: birdNotes(R, it.kind ?? 0), fmr: 2 }, dest);
  }
  return v;
}

/** Kurzer Vogelruf (sfx 'tweet' und Atmosphären). */
export function playBird(R, t, o = {}) {
  const v = R.voice(o.prio ?? 1, o.dest || 'fx', 'sfx:tweet'); if (!v) return null;
  const kind = o.kind ?? ((R.rng() * 4) | 0);
  chirps(v, t, { n: birdNotes(R, kind), fmr: 2 }, v.out);
  if (o.pan !== undefined) v.panTo(o.pan);
  if (o.rev) v.send(o.rev);
  return v;
}
