// Spektral-Plausibilität der Klangmaschine (wir können nicht hören – also Spektrum und Zeitverlauf lesen).
//   node tools/audio-egypt-report.mjs [verzeichnis=/tmp/claude-0/audio_test/wav] [filter]
// Liest die WAV-Dateien von tools/audio-check.mjs und gibt je Klang aus: Spitze, RMS, Anteil der Energie in fünf Bändern
// (<150 Hz, 150–600, 0.6–2.5k, 2.5–6k, >6k), Tonhaltigkeit (stärkste Spektrallinie über ihrer Umgebung, dB; hohe Werte = Pfeifen/Brummen),
// Schwankung (Standardabweichung des 100-ms-Pegels in dB) und den Anteil „stiller“ 100-ms-Abschnitte (< −20 dB unter dem Maximum).
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || '/tmp/claude-0/audio_test/wav', filt = process.argv[3] || '';
const SR = 44100, W = 4096;
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], xr = re[i + k + len / 2], xi = im[i + k + len / 2], vr = xr * cr - xi * ci, vi = xr * ci + xi * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } }
  }
}
const db = (x) => (x > 1e-12 ? 10 * Math.log10(x) : -120);
function readWav(f) { const b = fs.readFileSync(f), n = (b.length - 44) / 2, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = b.readInt16LE(44 + i * 2) / 32768; return x; }
function analyze(x) {
  const N = x.length; let pk = 0, sq = 0; for (let i = 0; i < N; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; sq += x[i] * x[i]; }
  const re = new Float64Array(W), im = new Float64Array(W), P = new Float64Array(W / 2); let frames = 0;
  const step = Math.max(W / 2, Math.floor((N - W) / 120));
  for (let s = 0; s + W <= N && frames < 140; s += step) { for (let k = 0; k < W; k++) { re[k] = x[s + k] * (0.5 - 0.5 * Math.cos((2 * Math.PI * k) / W)); im[k] = 0; } fft(re, im); for (let k = 0; k < W / 2; k++) P[k] += re[k] * re[k] + im[k] * im[k]; frames++; }
  const edges = [0, 150, 600, 2500, 6000, SR / 2], band = new Array(5).fill(0); let tot = 0;
  for (let k = 1; k < W / 2; k++) { const f = (k * SR) / W; for (let b = 0; b < 5; b++) if (f >= edges[b] && f < edges[b + 1]) { band[b] += P[k]; break; } tot += P[k]; }
  let tonal = -99; // stärkste Linie (ab 80 Hz) gegen den Mittelwert der Umgebung (±40 Bins ohne die inneren ±4)
  for (let k = 8; k < W / 2 - 45; k++) { if (P[k] < P[k - 1] || P[k] < P[k + 1]) continue; let s = 0, c = 0; for (let j = -40; j <= 40; j++) { if (Math.abs(j) <= 4 || k + j < 1) continue; s += P[k + j]; c++; } tonal = Math.max(tonal, db(P[k]) - db(s / c)); }
  const F = Math.round(SR * 0.1), lv = []; for (let i = 0; i + F <= N; i += F) { let s = 0; for (let k = 0; k < F; k++) s += x[i + k] * x[i + k]; lv.push(db(s / F)); }
  const mx = Math.max(...lv), mean = lv.reduce((a, b) => a + b, 0) / lv.length, sd = Math.sqrt(lv.reduce((a, b) => a + (b - mean) ** 2, 0) / lv.length), quiet = (100 * lv.filter((v) => v < mx - 20).length) / lv.length;
  return { pk: 20 * Math.log10(pk + 1e-12), rms: 10 * Math.log10(sq / N + 1e-12), band: band.map((v) => (100 * v) / (tot || 1)), tonal, sd, quiet };
}
const rows = fs.readdirSync(dir).filter((f) => f.endsWith('.wav') && f.includes(filt)).sort();
console.log('Name'.padEnd(46), 'Spitze', '   RMS', ' <150', ' <600', ' <2.5k', ' <6k', ' >6k', 'Tonal', ' Schw.', 'Stille%');
for (const f of rows) {
  const a = analyze(readWav(path.join(dir, f))), p = (v, w = 5) => v.toFixed(0).padStart(w);
  console.log(f.replace(/\.wav$/, '').slice(0, 45).padEnd(46), a.pk.toFixed(1).padStart(6), a.rms.toFixed(1).padStart(6), ...a.band.map((v, i) => p(v, i === 2 ? 6 : 5)), a.tonal.toFixed(0).padStart(5), a.sd.toFixed(1).padStart(6), a.quiet.toFixed(0).padStart(6));
}
