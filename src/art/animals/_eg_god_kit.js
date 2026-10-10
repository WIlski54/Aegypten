// =====================================================================================================
// _eg_god_kit.js – Baukasten "Götter" (Gruppe G): Tierköpfe, Kronen und Götterzeichen auf dem Profil-Menschen
// aus _eg_person.js (dessen Datei bleibt unverändert; hier wird nur die öffentliche API benutzt).
// Köpfe und Schmuck liegen in _eg_god_parts.js.
// =====================================================================================================
//
//   import { god } from './_eg_god_kit.js';
//   export default (o = {}) => god({ id: 'ra', name: 'Ra', heightM: 1.85, head: 'falke', crown: 'sonne', ...o });
//
// god(o) = person(o) mit eigenem Kopf (head: 'custom' + headFn) und Götter-Voreinstellungen. Optionen zusätzlich zu person():
//   head    'falke' | 'ibis' | 'katze' | 'krokodil' | 'schakal' | 'skarabaeus'   Tierkopf (Gesicht wird ersetzt, Hals bleibt Mensch)
//           | 'mensch'  menschliches Gesicht, Kopf aus person() (humanHead: 'lang' (Vorgabe) | 'krone_weiss' ...)
//   crown   'sonne' (Scheibe + Uräus) | 'doppel' (Pschent) | 'atef' (Osiris) | 'thron' (Isis) | 'hathor' (Kuhhörner + Scheibe + Kuhohr)
//           | 'feder' (Ma'at) | 'mond' (Thot) | 'sobek' (Scheibe + zwei Federn) | 'skarab' (nur Käfer) | 'keine'
//   crownFn (K, o) => Layer[] | { pre:[], post:[] }   eigener Schmuck (überschreibt crown)
//   hold    'was' (Was-Zepter, Götter; Vorgabe) | 'wadj' (Papyrus-Zepter, Göttinnen; Vorgabe bei sex 'w') | 'palette' | 'keine'
//           Jeder Gott trägt das Anch (Lebenszeichen) in der nahen Hand (armA, streckt es nach vorn) und das Zepter
//           in der fernen Hand (armB, steht senkrecht vor dem Körper auf dem Boden). holdA/holdB/armA/armB überschreibbar.
//   headCol, throatCol, wigCol, wigHi, wig:false   Farben des Tierkopfes bzw. der dreiteiligen Perücke
//   pose    'stand' (Vorgabe) | 'walk' (Schreitschritt)
// Vorgaben: Kopfgröße 1,2 bei Tierköpfen, Goldkragen, Königsschurz (Götter) bzw. Trägerkleid (Göttinnen), Sandalen, Armreifen.
// Eigene Requisiten (in PROPS des Personen-Baukastens eingetragen): g_anch (großes Anch), g_was, g_wadj.
// Alle heightM-Angaben sind die Körperhöhe ohne Kopfschmuck; mit Krone sind die Götter 0,25-0,45 m höher (meta.heightM = Gesamthöhe).
// =====================================================================================================
import { blob, limb, poly } from '../dsl.js';
import { person, HEADS, PROPS, EG, tint, shade } from './_eg_person.js';
import { wig, cobra, sunDisc, sunUraeusDisc, feather, pschent, moon, throne, lyreHorns, cowEar, sobekCrown, atefParts,
  headFalcon, headIbis, headCat, headCroc, headJackal, headScarab } from './_eg_god_parts.js';

export * from './_eg_god_parts.js';

// ------------------------------------------------------------------ Requisiten: große, gut lesbare Götterzeichen
const axisOf = (G, a) => { const d = [Math.cos(a), Math.sin(a)], r = [Math.sin(a), -Math.cos(a)]; return (t, s = 0) => [G[0] + d[0] * t + r[0] * s, G[1] + d[1] * t + r[1] * s]; };
PROPS.g_anch = (g, s, { C, pen }) => {
  const a = s.ang ?? -Math.PI / 2, A = axisOf(g.G, a), k = s.k ?? 1.8;
  const loop = blob(...A(-0.012 * k), 0.034 * k * 0.9, 0.024 * k * 0.9, a);
  const stem = poly([A(0.012 * k, -0.008 * k), A(0.012 * k, 0.008 * k), A(0.092 * k, 0.013 * k), A(0.092 * k, -0.013 * k)], 0);
  const bar = limb([[...A(0.026 * k, -0.046 * k), 0.017 * k * 0.8], [...A(0.026 * k, 0.046 * k), 0.017 * k * 0.8]]);
  const col = s.col || C.gold;
  return {
    under: [{ shapes: [loop, stem, bar], fill: { top: tint(col, 0.25), bottom: shade(col, 0.1) }, deco: (c) => { pen.ell(c, A(-0.014 * k), 0.018 * k * 0.9, 0.0105 * k * 0.9, a, '#fbf0d0', 1); pen.line(c, [A(0.03 * k), A(0.088 * k)], shade(col, 0.3), 0.004, 0.5); } }],
    over: [],
  };
};
PROPS.g_was = (g, s, { C, pen, gy }) => {
  const a = s.ang ?? Math.PI / 2 + 0.03, A = axisOf(g.G, a), sa = Math.sin(a);
  const t0 = Math.abs(sa) > 0.2 ? (gy + 0.004 - g.G[1]) / sa : -0.5, t1 = s.len ?? 0.27, col = s.col || C.gold;
  const shaft = limb([[...A(t0 + 0.02), 0.021], [...A(t1), 0.021]]);
  const fork = [limb([[...A(t0 + 0.03), 0.018], [...A(t0 - 0.002, -0.026), 0.013]]), limb([[...A(t0 + 0.03), 0.018], [...A(t0 - 0.002, 0.026), 0.013]])];
  // Kopf des Was-Zepters: langer, nach unten gebogener Schnabel nach vorn, zwei eckige Ohren nach hinten
  const snout = limb([[...A(t1 - 0.012, 0), 0.040], [...A(t1 + 0.026, 0.044), 0.040], [...A(t1 + 0.024, 0.100), 0.032], [...A(t1 - 0.020, 0.140), 0.018]]);
  const ears = [limb([[...A(t1 + 0.006, -0.002), 0.020], [...A(t1 + 0.062, -0.030), 0.016]]), limb([[...A(t1 - 0.010, -0.002), 0.020], [...A(t1 + 0.040, -0.040), 0.016]])];
  return {
    under: [{
      shapes: [shaft, snout, ...ears, ...fork], fill: { top: tint(col, 0.25), bottom: shade(col, 0.1) },
      deco: (c, bb) => {
        pen.vol(c, bb);
        for (let i = 0; i < 5; i++) pen.line(c, [A(t0 + 0.14 + i * 0.07, -0.022), A(t0 + 0.14 + i * 0.07, 0.022)], i % 2 ? C.lapis : C.turq, 0.01, 1);
        pen.dot(c, A(t1 + 0.02, 0.098), 0.006, C.carn, 1);
      },
    }],
    over: [],
  };
};
// Schreibpalette mit zwei Tintennäpfen und Binsenpinsel (Thot), quer vor dem Körper gehalten
PROPS.g_palette = (g, s, { C, pen }) => {
  const a = s.ang ?? 0.08, A = axisOf(g.G, a);
  const board = poly([A(-0.04, -0.030), A(0.27, -0.030), A(0.27, 0.030), A(-0.04, 0.030)], 1.2);
  const reed = limb([[...A(0.02, 0.040), 0.010], [...A(0.24, 0.044), 0.008]]);
  return {
    under: [{ shapes: [board], fill: { top: '#f0dcae', bottom: '#cfae6a' }, deco: (c) => {
      pen.line(c, [A(-0.01, 0), A(0.17, 0)], '#a07a3a', 0.012, 0.8);
      pen.dot(c, A(0.205, 0.0), 0.016, C.ink, 1); pen.dot(c, A(0.245, 0.0), 0.016, C.carn, 1);
    } }, { shapes: [reed], fill: '#b99a58', stroke: null }],
    over: [],
  };
};
PROPS.g_wadj =(g, s, { C, pen, gy }) => {
  const a = s.ang ?? Math.PI / 2 + 0.04, A = axisOf(g.G, a), sa = Math.sin(a);
  const t0 = Math.abs(sa) > 0.2 ? (gy + 0.004 - g.G[1]) / sa : -0.5, t1 = s.len ?? 0.5;
  const shaft = limb([[...A(t0), 0.020], [...A(t1), 0.019]]);
  const col = s.col || C.papyrus;
  const umbel = [];
  for (let i = -2; i <= 2; i++) umbel.push(limb([[...A(t1 - 0.01), 0.016], [...A(t1 + 0.04, i * 0.020), 0.012], [...A(t1 + 0.085, i * 0.046), 0.009]]));
  return {
    under: [{ shapes: [shaft], fill: { top: tint(col, 0.2), bottom: shade(col, 0.1) }, deco: (c) => { for (let i = 0; i < 5; i++) pen.line(c, [A(t0 + 0.1 + i * 0.1, -0.02), A(t0 + 0.1 + i * 0.1, 0.02)], shade(col, 0.25), 0.006, 0.7); } },
      { shapes: umbel, fill: { top: tint(col, 0.35), bottom: col }, deco: (c) => { for (const i of [-1, 0, 1]) pen.dot(c, A(t1 + 0.085, i * 0.046), 0.006, C.carn, 0.9); } }],
    over: [],
  };
};

// ------------------------------------------------------------------ Gott-Baukasten
const ARMS = {
  ankhA: { u: 0.98, f: 1.55, hand: "fist" },                 // nahe Hand streckt das Anch nach vorn
  zepterB: { u: 0.50, f: 1.30, hand: "fist" },               // ferne Hand: Zepter senkrecht vor dem Körper
};
const HEAD_MAKERS = { falke: headFalcon, ibis: headIbis, katze: headCat, krokodil: headCroc, schakal: headJackal, skarabaeus: headScarab };
const CROWNS = {
  sonne: (K) => sunUraeusDisc(K),
  doppel: (K) => pschent(K, 0.085),
  thron: (K) => throne(K),
  hathor: (K) => [cowEar(K), ...lyreHorns(K)],
  feder: (K) => [feather(K, -0.012, 0.078, 0.25, 0.05, { lean: -0.03, bands: EG.turq })],
  mond: (K) => moon(K),
  sobek: (K) => sobekCrown(K),
  atef: (K) => atefParts(K),
  skarab: () => [],
  keine: () => [],
};

export function god(o = {}) {
  const sex = o.sex || 'm';
  const head = o.head || 'mensch';
  const mk = HEAD_MAKERS[head];
  const crownFn = o.crownFn || CROWNS[o.crown || 'keine'];
  const headFn = o.headFn || ((K, oo, info) => {
    const base = mk ? mk(K, o, info) : HEADS[o.humanHead || 'lang'](K, { band: o.band || EG.gold, ...o, uraeus: false });
    const extra = crownFn ? crownFn(K, o, base) : [];
    const pre = Array.isArray(extra) ? [] : extra.pre || [], post = Array.isArray(extra) ? extra : extra.post || [];
    return { ...base, layers: [...pre, ...base.layers, ...post] };   // pre: Schmuck hinter Kopf und Perücke (z. B. ferne Feder)
  });
  const hold = o.hold ?? (sex === 'w' ? 'wadj' : 'was');
  const sceptre = { was: 'g_was', wadj: 'g_wadj', palette: 'palette' }[hold];
  const spec = {
    sex, heightM: 1.8, pose: 'stand', headScale: head === 'mensch' ? 1.05 : 1.2, garment: sex === 'w' ? 'kleid' : 'schurz', royal: sex !== 'w', collar: 'breit', bands: true, sandals: true,
    armA: ARMS.ankhA, holdA: { prop: 'g_anch', ang: -Math.PI / 2 },
    armB: ARMS.zepterB, armBFront: true, holdB: sceptre ? { prop: sceptre, ang: Math.PI / 2 - 0.02 } : undefined,
    ...o, head: 'custom', headFn,
  };
  const s = person(spec);
  s.meta.name = o.name || s.meta.name;
  s.meta.god = true;
  s.meta.bodyHeightM = spec.heightM;
  s.meta.ranges.armA = [0, 0.3];
  s.meta.ranges.armB = [0, -0.2];
  for (const k of Object.keys(s.meta.ranges)) if (!s.parts[k]) delete s.meta.ranges[k];   // z. B. Osiris (eingewickelt): keine Beine
  // Gesamthöhe inkl. Kopfschmuck
  let maxY = 0; for (const p of Object.values(s.parts)) for (const L of p.layers) for (const sh of L.shapes) for (const q of sh) if (q[1] > maxY) maxY = q[1];
  s.meta.heightM = Math.round(maxY * 100) / 100;
  return s;
}
