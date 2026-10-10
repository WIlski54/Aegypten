// voices.js – synthetische Tierstimmen (FM + subtraktive Synthese mit Formantfiltern), Vogelrufe, Piepser.
// Jede Art ist eine kleine Liste von „Silben“. Die Standardstimmen sind tiefe Brummlaute und Grollen (die echten Rufe
// der Dinosaurier sind unbekannt); der Schalter `cine` liefert die dramatische Kino-Variante.
import { clamp, env } from './synth.js';

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
/** Flügelschläge: p.n Schläge im Abstand dt. */
function flaps(v, t, p, dest) {
  for (let i = 0; i < p.n; i++) {
    const s = t + i * (p.dt + i * 0.012);
    v.nz(s, { f: 900, f2: 450, type: 'lowpass', q: 0.8, a: 0.02, d: 0.08, peak: p.a, dest });
    v.tone(s, { f: 150, f2: 95, a: 0.012, d: 0.08, peak: p.a * 0.35, dest });
  }
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
const S = (...a) => a;
const SP = {
  // ---- Trias
  coelophysis: S({ k: 'b', n: [[0, 0.13, 1500, 980, 1, 1.6], [0.18, 0.15, 1650, 1000, 1, 1.6], [0.38, 0.18, 1500, 880, 1, 1.8]], fmr: 1.7 }),
  plateosaurus: S({ k: 'v', d: 1.3, f: [[0, 112], [0.3, 128], [1, 84]], F: [[[460, 330], 5, 1], [[960, 780], 5, 0.6]], vib: [5, 0.015], nz: 0.04, sub: 0.3 }),
  eoraptor: S({ k: 'b', n: [[0, 0.07, 2500, 3300, 0.8, 0.8], [0.1, 0.07, 2700, 3500, 0.8, 0.8], [0.2, 0.1, 2400, 3700, 0.8, 0.8]], fmr: 2 }),
  morganucodon: S({ k: 'b', n: [[0, 0.05, 4600, 5600, 0.7, 0.5], [0.08, 0.05, 4800, 5900, 0.7, 0.5], [0.17, 0.07, 5000, 6200, 0.6, 0.5]] }),
  // ---- Jura
  brachiosaurus: S({ k: 'v', d: 1.9, f: [[0, 60], [0.35, 86], [0.75, 92], [1, 66]], sub: 0.5, nz: 0.03, vib: [4.5, 0.012], F: [[[300, 360], 5, 1], [[760, 700], 5, 0.7], [[1500, 1200], 4, 0.25]], lp: 2600, amp: [[0, 0], [0.2, 1], [0.7, 0.85], [1, 0]],
    c: { d: 2.6, f: [[0, 56], [0.25, 100], [0.6, 118], [1, 50]], rough: [12, 0.3], drive: 3, nz: 0.15 } }),
  stegosaurus: S({ k: 'v', d: 0.36, f: [[0, 92], [1, 66]], rough: [20, 0.4], nz: 0.15, F: [[[380, 320], 4, 1], [[820, 640], 4, 0.7]] },
    { k: 'v', at: 0.5, d: 0.44, f: [[0, 86], [1, 58]], rough: [20, 0.4], nz: 0.15, F: [[[380, 300], 4, 1], [[820, 600], 4, 0.7]] }),
  allosaurus: S({ k: 'v', d: 1.2, f: [[0, 78], [0.3, 92], [1, 52]], rough: [26, 0.55], nz: 0.28, fm: [2, 0.3, 0.1], F: [[[560, 420], 4, 1], [[1150, 900], 4, 0.7], [[2300, 1900], 4, 0.15]], drive: 2, lp: 3200,
    c: { d: 1.9, f: [[0, 210], [0.15, 150], [1, 60]], rough: [34, 0.7], nz: 0.6, drive: 5, F: [[[900, 520], 3, 1], [[1700, 1000], 3, 0.8], [[2800, 2200], 3, 0.3]], lp: 4500 } }),
  castorocauda: S({ k: 'v', d: 0.5, f: [[0, 330], [0.5, 420], [1, 300]], rough: [34, 0.8], F: [[700, 5, 1], [1800, 4, 0.5]], low: 0 }),
  archaeopteryx: S({ k: 'b', n: [[0, 0.2, 1300, 800, 1, 1.4], [0.3, 0.24, 1250, 720, 1, 1.4]], fmr: 1.5 }),
  compsognathus: S({ k: 'b', n: [[0, 0.05, 900, 700, 0.9, 1.2], [0.09, 0.05, 950, 720, 0.9, 1.2], [0.18, 0.05, 930, 700, 0.9, 1.2], [0.27, 0.06, 880, 650, 0.9, 1.2]], fmr: 2 }),
  rhamphorhynchus: S({ k: 'b', n: [[0, 0.09, 3000, 4300, 0.7, 0.3], [0.14, 0.09, 3100, 4400, 0.7, 0.3], [0.28, 0.1, 3200, 4700, 0.7, 0.3]] }),
  limulus: S({ k: 'c', ts: [0, 0.09, 0.15, 0.3], f: 2600, q: 3, a: 0.6, body: 700 }, { k: 'b', at: 0.4, n: [[0, 0.08, 400, 900, 0.6, 0]] }),
  ichthyosaurus: S({ k: 'b', n: [[0, 0.55, 2200, 4200, 0.8, 0.2, 3000]], vr: 28 }, { k: 'c', at: 0.7, ts: [0, 0.045, 0.088, 0.13, 0.17, 0.208, 0.245, 0.28, 0.313, 0.344, 0.373, 0.4], f: 4200, q: 4, a: 0.7 }),
  // ---- Kreide
  pteranodon: S({ k: 'b', n: [[0, 0.85, 1250, 2500, 1, 1.2, 850]], fmr: 1.005 }),
  elasmosaurus: S({ k: 'v', d: 2.2, f: [[0, 170], [0.35, 260], [0.7, 240], [1, 180]], w: 'triangle', fm: [2, 1.2, 0.3], vib: [3.5, 0.02], F: [[[620, 900], 6, 1], [[1500, 1200], 6, 0.4]], lp: 3000 }),
  mosasaurus: S({ k: 'v', d: 1.6, f: [[0, 46], [0.4, 40], [1, 34]], rough: [13, 0.7], sub: 0.8, nz: 0.45, F: [[[240, 200], 3, 1], [[520, 380], 3, 0.8]], lp: 1200,
    c: { d: 2.2, f: [[0, 140], [0.2, 90], [1, 36]], rough: [30, 0.75], nz: 0.7, drive: 5, F: [[[640, 380], 3, 1], [[1200, 700], 3, 0.8]], lp: 3500 } }),
  trex: S({ k: 'v', d: 1.4, f: [[0, 62], [0.35, 56], [1, 44]], sub: 0.7, rough: [22, 0.5], nz: 0.18, F: [[[300, 230], 4, 1], [[720, 520], 4, 0.7]], lp: 2400, drive: 1.5,
    c: { d: 2.3, f: [[0, 190], [0.12, 150], [0.5, 98], [1, 52]], sub: 0.6, rough: [38, 0.65], nz: 0.55, drive: 5, F: [[[780, 520], 3, 1], [[1400, 980], 3, 0.9], [[2600, 2000], 3, 0.3]], lp: 4500 } }),
  triceratops: S({ k: 'v', d: 1.3, f: [[0, 76], [0.4, 108], [1, 82]], vib: [6, 0.02], nz: 0.1, F: [[[420, 360], 5, 1], [[840, 700], 5, 0.6]] },
    { k: 'v', at: 1.15, d: 0.24, saw: 0, nz: 1, F: [[620, 5, 1], [1400, 4, 0.5]] }),
  ankylosaurus: S({ k: 'v', d: 0.25, saw: 0, nz: 1, F: [[700, 4, 1], [1500, 4, 0.4]] }, { k: 'v', at: 0.35, d: 0.75, f: [[0, 100], [1, 88]], vib: [4, 0.02], F: [[[400, 380], 5, 1], [[900, 820], 5, 0.5]] }),
  didelphodon: S({ k: 'v', d: 0.35, saw: 0, nz: 1, F: [[3800, 1.2, 1]] }, { k: 'b', at: 0.4, n: [[0, 0.07, 2300, 3000, 0.7, 0.4], [0.12, 0.07, 2400, 3200, 0.7, 0.4]] }),
  // ---- Nest
  maiasaura: S({ k: 'v', d: 1.6, f: [[0, 128], [0.4, 118], [1, 92]], vib: [4.5, 0.012], sub: 0.2, nz: 0.03, F: [[[390, 340], 6, 1], [[810, 720], 6, 0.5]] }),
  maiasaura_baby: S({ k: 'b', n: [[0, 0.12, 2600, 3100, 0.8, 0.3], [0.2, 0.12, 2700, 3300, 0.8, 0.3], [0.42, 0.15, 2500, 3200, 0.8, 0.3]], vr: 9 }),
  oviraptor: S({ k: 'v', d: 0.35, f: [[0, 330], [1, 290]], F: [[520, 6, 1], [1250, 6, 0.5]], vib: [8, 0.02] }, { k: 'v', at: 0.42, d: 0.4, f: [[0, 280], [1, 230]], F: [[520, 6, 1], [1250, 6, 0.5]], vib: [8, 0.02] },
    { k: 'v', at: 0.92, d: 0.3, f: [[0, 420], [1, 420]], rough: [22, 0.9], F: [[900, 5, 1]] }),
  multituberculate: S({ k: 'b', n: [[0, 0.04, 3400, 3900, 0.7, 0.3], [0.06, 0.04, 3500, 4000, 0.7, 0.3], [0.12, 0.04, 3400, 3900, 0.7, 0.3], [0.18, 0.04, 3600, 4100, 0.7, 0.3], [0.24, 0.05, 3300, 3800, 0.6, 0.3]], vr: 40 }),
  egg: S({ k: 'c', ts: [0, 0.22, 0.4], f: 1800, q: 3, a: 0.6, body: 900 }, { k: 'b', at: 0.7, n: [[0, 0.12, 2400, 2900, 0.5, 0.2], [0.18, 0.14, 2500, 3100, 0.5, 0.2]], lp: 1900 }),
  // ---- Känozoikum
  purgatorius: S({ k: 'b', n: [[0, 0.06, 5200, 6400, 0.7, 0.4]] }, { k: 'b', at: 0.2, n: [[0, 0.05, 5000, 6000, 0.5, 0.4]] }),
  hyracotherium: S({ k: 'v', d: 0.75, f: [[0, 700], [0.3, 1350], [0.55, 1000], [1, 1200]], rough: [17, 0.55], F: [[1200, 6, 1], [2600, 5, 0.5]], low: 0 }),
  gastornis: S({ k: 'v', d: 0.5, f: [[0, 175], [0.3, 185], [1, 120]], rough: [16, 0.35], nz: 0.15, F: [[[760, 650], 5, 1], [[1500, 1250], 5, 0.8], [[2500, 2200], 4, 0.2]] },
    { k: 'v', at: 0.62, d: 0.55, f: [[0, 165], [1, 100]], rough: [16, 0.35], nz: 0.15, F: [[[760, 600], 5, 1], [[1500, 1150], 5, 0.8], [[2500, 2100], 4, 0.2]] }),
  plesiadapis: S({ k: 'b', n: [[0, 0.04, 2000, 2600, 0.8, 0.6], [0.07, 0.03, 2300, 2800, 0.8, 0.6], [0.12, 0.04, 1900, 2500, 0.8, 0.6], [0.2, 0.03, 2400, 3000, 0.8, 0.6], [0.25, 0.04, 2100, 2700, 0.8, 0.6], [0.34, 0.05, 2300, 3000, 0.8, 0.6], [0.42, 0.04, 2000, 2500, 0.8, 0.6]] }),
  pakicetus: S({ k: 'v', d: 0.9, f: [[0, 380], [0.35, 640], [1, 420]], nz: 0.12, vib: [5, 0.02], F: [[[600, 820], 5, 1], [[1500, 1700], 5, 0.5]], low: 0 }),
  paraceratherium: S({ k: 'v', d: 2.0, f: [[0, 44], [0.4, 58], [1, 46]], rough: [9, 0.5], sub: 0.6, F: [[[210, 260], 4, 1], [[450, 420], 4, 0.7]], lp: 1400 }),
  gomphotherium: S({ k: 'v', d: 1.15, f: [[0, 300], [0.15, 520], [0.5, 470], [1, 380]], fm: [1.01, 0.1, 0.4], vib: [6, 0.01], nz: 0.1, F: [[[900, 1100], 5, 1], [[1900, 1800], 5, 0.8], [[3000, 2800], 5, 0.3]], low: 0.2 }),
  miocene_ape: S({ k: 'v', d: 0.16, f: [[0, 320], [1, 370]], F: [[360, 6, 1], [800, 6, 0.4]] }, { k: 'v', at: 0.22, d: 0.16, f: [[0, 370], [1, 420]], F: [[360, 6, 1], [800, 6, 0.4]] },
    { k: 'v', at: 0.44, d: 0.18, f: [[0, 420], [1, 480]], F: [[360, 6, 1], [800, 6, 0.4]] }, { k: 'v', at: 0.7, d: 0.4, f: [[0, 520], [0.5, 600], [1, 430]], nz: 0.1, F: [[[700, 780], 5, 1], [[1250, 1300], 5, 0.7]] }),
  afarensis_f: S({ k: 'v', d: 0.32, f: [[0, 215], [0.6, 250], [1, 225]], nz: 0.08, F: [[450, 6, 1], [1050, 6, 0.5], [2600, 6, 0.1]] }, { k: 'v', at: 0.4, d: 0.5, f: [[0, 230], [0.5, 265], [1, 200]], nz: 0.08, F: [[450, 6, 1], [1050, 6, 0.5], [2600, 6, 0.1]] }),
  afarensis_m: S({ k: 'v', d: 0.34, f: [[0, 112], [0.6, 132], [1, 118]], nz: 0.08, F: [[400, 6, 1], [900, 6, 0.5], [2400, 6, 0.1]] }, { k: 'v', at: 0.42, d: 0.55, f: [[0, 120], [0.5, 138], [1, 104]], nz: 0.08, F: [[400, 6, 1], [900, 6, 0.5], [2400, 6, 0.1]] }),
  afarensis_child: S({ k: 'v', d: 0.14, f: [[0, 360], [1, 440]], F: [[500, 6, 1], [1400, 6, 0.5]] }, { k: 'v', at: 0.2, d: 0.14, f: [[0, 380], [1, 460]], F: [[500, 6, 1], [1400, 6, 0.5]] },
    { k: 'v', at: 0.4, d: 0.14, f: [[0, 400], [1, 480]], F: [[500, 6, 1], [1400, 6, 0.5]] }, { k: 'v', at: 0.62, d: 0.3, f: [[0, 470], [1, 380]], F: [[520, 6, 1], [1300, 6, 0.5]] }),
  robin: S({ k: 'r' }),
  bird_fly: S({ k: 'w', n: 4, dt: 0.1, a: 0.5 }, { k: 'r', at: 0.55, kind: 3 }),
};
const ALIAS = { lucy: 'afarensis_f', australopithecus: 'afarensis_f', homo_fruehe: 'afarensis_m', sahelanthropus: 'miocene_ape', orrorin: 'miocene_ape', ardipithecus: 'miocene_ape' }; // Kartenname → Actor-Stimme
export const VOICE_IDS = Object.keys(SP);

// Bedeutung: Kino-Variante für Stimmen ohne eigenes `c`: länger, rauer, mit Sättigung und mehr Hauch
const cineOf = (p) => (p.c ? { ...p, ...p.c } : { ...p, d: p.d * 1.2, rough: p.rough ? [p.rough[0], Math.min(0.9, p.rough[1] + 0.2)] : [24, 0.4], drive: 3, nz: (p.nz || 0) + 0.12 });

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
    else if (it.k === 'w') flaps(v, s, it, dest);
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
