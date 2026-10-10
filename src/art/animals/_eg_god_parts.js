// =====================================================================================================
// _eg_god_parts.js – Köpfe und Kopfschmuck für die Götter (Gruppe G); wird von _eg_god_kit.js benutzt.
// Alle Funktionen zeichnen in Kopf-Lokalkoordinaten (K aus person(): K.P, K.pts, K.blob, K.limb, K.pen, K.hs).
// Rückgabe der head*-Funktionen: { layers, hideFace, hideEar, beardStrap, top } wie ein headFn des Baukastens.
// =====================================================================================================
import { poly } from '../dsl.js';
import { EG, tint, shade } from './_eg_person.js';

export const P = (K, arr, sm = 1) => poly(K.pts(arr), sm);
export const RED = '#c8402c';

// ------------------------------------------------------------------ Kopfschmuck-Bausteine
// Perücke (dreiteilig): hängt hinten über die Schulter, vorn eine Strähne vor der Brust
export function wig(K, o = {}) {
  const col = o.wigCol || EG.lapis, hi = o.wigHi || tint(col, 0.28);
  const pts = [[-0.02, 0.07], [-0.095, 0.074], [-0.130, 0.02], [-0.142, -0.08], [-0.146, -0.19], [-0.104, -0.212], [-0.074, -0.15], [-0.046, -0.108], [-0.004, -0.10],
    [0.0, -0.246], [0.050, -0.246], [0.046, -0.10], [0.036, -0.04], [0.02, 0.02]];
  return [{
    shapes: [P(K, pts, 1)], fill: { top: tint(col, 0.1), bottom: shade(col, 0.1) },
    deco: (c, bb) => {
      const { pen, hs } = K;
      for (let i = 0; i < 9; i++) { const x = -0.145 + i * 0.012; pen.line(c, [K.P(x + 0.03, 0.08), K.P(x, -0.1), K.P(x - 0.004, -0.22)], hi, 0.0036 * hs, 0.75); }
      for (let i = 0; i < 4; i++) pen.line(c, [K.P(0.004 + i * 0.012, -0.04), K.P(0.004 + i * 0.012, -0.25)], hi, 0.0036 * hs, 0.75);
      pen.vol(c, bb, 'rgba(0,0,0,0.22)', 'rgba(255,255,255,0.10)');
      if (o.wigRings !== false) { for (const y of [-0.186, -0.206]) pen.line(c, [K.P(-0.15, y), K.P(-0.08, y - 0.006)], EG.gold, 0.008 * hs, 0.95); for (const y of [-0.222, -0.240]) pen.line(c, [K.P(-0.006, y), K.P(0.054, y)], EG.gold, 0.008 * hs, 0.95); }
    },
  }];
}

// Kobra (Uräus) aufgerichtet an (x,y), Größe s
export function cobra(K, x, y, s = 1) {
  const { pen, hs } = K;
  const body = K.limb([[x - 0.012 * s, y - 0.004 * s, 0.015 * s], [x + 0.004 * s, y + 0.008 * s, 0.017 * s], [x + 0.002 * s, y + 0.026 * s, 0.016 * s], [x + 0.008 * s, y + 0.040 * s, 0.014 * s]]);
  const hood = K.blob(x + 0.006 * s, y + 0.032 * s, 0.014 * s, 0.021 * s, 0.1);
  const hd = K.blob(x + 0.014 * s, y + 0.054 * s, 0.0105 * s, 0.0085 * s, 0.2);
  return {
    shapes: [body, hood, hd], fill: { top: EG.goldL, bottom: EG.gold },
    deco: (c) => { pen.line(c, [K.P(x + 0.006 * s, y + 0.016 * s), K.P(x + 0.008 * s, y + 0.046 * s)], EG.lapis, 0.0045 * hs * s, 1); pen.dot(c, K.P(x + 0.017 * s, y + 0.056 * s), 0.0028 * hs * s, EG.carn); },
  };
}

// Sonnenscheibe (rot mit Goldrand), Mittelpunkt (x,y), Radius r -> zwei Layer
export function sunDisc(K, x, y, r, o = {}) {
  const { pen } = K, red = o.col || RED;
  return [
    { shapes: [K.blob(x, y, r + 0.010, r + 0.010, 0, 40)], fill: { top: EG.goldL, bottom: EG.goldD } },
    {
      shapes: [K.blob(x, y, r, r, 0, 40)], fill: { top: tint(red, 0.18), bottom: shade(red, 0.12) },
      deco: (c) => { pen.dot(c, K.P(x - r * 0.25, y + r * 0.3), r * 0.55, 'rgba(255,230,190,0.30)'); pen.dot(c, K.P(x - r * 0.35, y + r * 0.42), r * 0.2, 'rgba(255,255,255,0.28)'); },
    },
  ];
}

// Sonnenscheibe mit Uräus vorn (Ra)
export function sunUraeusDisc(K, x = -0.01, y = 0.150, r = 0.066) {
  return [...sunDisc(K, x, y, r), cobra(K, x + r * 0.95, y - r * 1.15, 1.2)];
}

// Straußenfeder (senkrecht, leicht nach hinten geneigt) von (x,y) Höhe h Breite w
export function feather(K, x, y, h, w = 0.05, o = {}) {
  const { pen, hs } = K, lean = o.lean ?? -0.03, col = o.col || '#fbf7ec', bar = o.bar || '#c9c0a8';
  const top = [x + lean, y + h];
  const L = [[x - w * 0.15, y], [x - w * 0.55 + lean * 0.3, y + h * 0.18], [x - w * 0.62 + lean * 0.6, y + h * 0.45], [x - w * 0.45 + lean * 0.85, y + h * 0.75], [top[0] - w * 0.1, top[1] - 0.004], [top[0] + w * 0.02, top[1]],
    [top[0] + w * 0.25, top[1] - h * 0.06], [x + w * 0.55 + lean * 0.85, y + h * 0.72], [x + w * 0.62 + lean * 0.6, y + h * 0.42], [x + w * 0.5 + lean * 0.3, y + h * 0.15], [x + w * 0.15, y]];
  return {
    shapes: [P(K, L, 2)], fill: { top: col, bottom: shade(col, 0.07) },
    deco: (c) => {
      pen.line(c, [K.P(x, y), K.P(x + lean * 0.5, y + h * 0.5), K.P(top[0], top[1] - 0.004)], bar, 0.006 * hs, 0.95);
      for (let i = 1; i < 9; i++) { const t = i / 9.5, px = x + lean * t * t * 1.1, py = y + h * t; pen.line(c, [K.P(px, py), K.P(px - w * 0.55 * (1 - t * 0.6), py + h * 0.05)], bar, 0.0032 * hs, 0.55); pen.line(c, [K.P(px, py), K.P(px + w * 0.55 * (1 - t * 0.6), py + h * 0.05)], bar, 0.0032 * hs, 0.55); }
      if (o.bands) { for (let i = 0; i < 4; i++) { const t = 0.2 + i * 0.2, py = y + h * t; pen.line(c, [K.P(x - w, py), K.P(x + w, py)], o.bands, 0.012 * hs, 0.8); } }
    },
  };
}

// Pschent (Doppelkrone) mit Sitz auf dem Kopf; base = y der Schädeldecke
export function pschent(K, base = 0.075, o = {}) {
  const { pen, hs } = K, red = o.redCol || EG.redCrown, b = base;
  const back = P(K, [[0.074, b - 0.02], [0.078, b + 0.034], [-0.022, b + 0.036], [-0.026, b + 0.13], [-0.030, b + 0.19], [-0.076, b + 0.196], [-0.080, b + 0.12], [-0.094, b + 0.04], [-0.102, b - 0.016], [-0.10, b - 0.06], [0.0, b - 0.05]], 1);
  const white = P(K, [[0.054, b + 0.025], [0.060, b + 0.07], [0.052, b + 0.125], [0.042, b + 0.17], [0.042, b + 0.200], [0.028, b + 0.222], [0.006, b + 0.226], [-0.010, b + 0.212], [-0.014, b + 0.182], [-0.022, b + 0.135], [-0.028, b + 0.075], [-0.032, b + 0.025]], 2);
  const cap = P(K, [[0.074, b - 0.026], [0.078, b + 0.040], [-0.04, b + 0.042], [-0.094, b + 0.034], [-0.104, b - 0.016], [-0.10, b - 0.06], [-0.04, b - 0.062], [0.0, b - 0.05]], 1);
  const curl = K.limb([[-0.004, b + 0.030, 0.010], [0.040, b + 0.062, 0.009], [0.084, b + 0.092, 0.009], [0.104, b + 0.114, 0.009], [0.108, b + 0.130, 0.009], [0.098, b + 0.140, 0.009], [0.088, b + 0.132, 0.008], [0.094, b + 0.122, 0.006]]);
  const redFill = { top: tint(red, 0.1), bottom: shade(red, 0.15) };
  return [
    { shapes: [back], fill: redFill, deco: (c, bb) => pen.vol(c, bb, 'rgba(40,0,0,0.25)') },
    { shapes: [white], fill: { top: '#ffffff', bottom: '#e6e0d0' }, deco: (c, bb) => { pen.vol(c, bb, 'rgba(60,50,30,0.2)'); pen.curve(c, [K.P(0.036, b + 0.06), K.P(0.04, b + 0.14), K.P(0.026, b + 0.2)], '#ffffff', 0.01 * hs, 0.8); } },
    { shapes: [cap], fill: redFill, deco: (c, bb) => { pen.vol(c, bb, 'rgba(40,0,0,0.22)'); pen.line(c, [K.P(-0.1, b - 0.02), K.P(0.076, b - 0.02)], EG.gold, 0.010 * hs, 0.95); } },
    { shapes: [curl], fill: EG.gold, stroke: 'rgba(80,50,10,0.6)' },
  ];
}

// Mondscheibe in der Sichel (Thot)
export function moon(K, x = 0.0, y = 0.148) {
  const { pen, hs } = K;
  const crescent = K.limb([[x - 0.074, y + 0.012, 0.016], [x - 0.060, y - 0.030, 0.026], [x - 0.020, y - 0.056, 0.030], [x + 0.020, y - 0.056, 0.030], [x + 0.060, y - 0.030, 0.026], [x + 0.074, y + 0.012, 0.016]]);
  return [
    { shapes: [crescent], fill: { top: EG.goldL, bottom: EG.gold }, deco: (c, bb) => pen.vol(c, bb) },
    { shapes: [K.blob(x, y + 0.004, 0.050, 0.050, 0, 36)], fill: { top: '#ffffff', bottom: '#d6dfe8' }, deco: (c) => { pen.dot(c, K.P(x - 0.014, y + 0.014), 0.012 * hs, 'rgba(180,195,215,.5)'); pen.dot(c, K.P(x + 0.016, y - 0.008), 0.008 * hs, 'rgba(180,195,215,.5)'); pen.dot(c, K.P(x + 0.01, y + 0.03), 0.006 * hs, 'rgba(180,195,215,.45)'); } },
  ];
}

// Thronzeichen (Isis)
export function throne(K, y0 = 0.080) {
  const { pen, hs } = K;
  const blk = P(K, [[-0.066, y0], [0.062, y0], [0.062, y0 + 0.080], [-0.016, y0 + 0.080], [-0.016, y0 + 0.170], [-0.066, y0 + 0.170]], 0.8);
  return [{
    shapes: [blk], fill: { top: tint(EG.lapis, 0.2), bottom: shade(EG.lapis, 0.15) },
    deco: (c, bb) => {
      pen.vol(c, bb, 'rgba(0,0,30,0.3)', 'rgba(255,255,255,0.12)');
      pen.line(c, [K.P(-0.062, y0 + 0.004), K.P(0.058, y0 + 0.004), K.P(0.058, y0 + 0.076), K.P(-0.012, y0 + 0.076), K.P(-0.012, y0 + 0.166), K.P(-0.062, y0 + 0.166), K.P(-0.062, y0 + 0.004)], EG.gold, 0.007 * hs, 1);
      for (let i = 0; i < 5; i++) { const x = -0.044 + i * 0.024; pen.line(c, [K.P(x, y0 + 0.012), K.P(x, y0 + 0.056)], i % 2 ? EG.carn : '#fbf7ec', 0.012 * hs, 1); }
      pen.line(c, [K.P(-0.052, y0 + 0.09), K.P(-0.052, y0 + 0.15)], EG.turq, 0.010 * hs, 1);
      pen.line(c, [K.P(-0.03, y0 + 0.09), K.P(-0.03, y0 + 0.15)], EG.carn, 0.010 * hs, 1);
    },
  }];
}

// Kuhhörner-Leier mit Sonnenscheibe (Hathor)
export function lyreHorns(K, y0 = 0.084) {
  const { pen, hs } = K;
  const mk = (sd) => K.limb([[sd * 0.040, y0 - 0.004, 0.026], [sd * 0.072, y0 + 0.030, 0.022], [sd * 0.084, y0 + 0.078, 0.020], [sd * 0.070, y0 + 0.128, 0.014], [sd * 0.046, y0 + 0.158, 0.006]]);
  const hornFill = { top: tint(EG.gold, 0.2), bottom: shade(EG.gold, 0.1) };
  const deco = (c, bb) => { pen.vol(c, bb); for (let i = 0; i < 4; i++) pen.curve(c, [K.P(-0.08, y0 + 0.04 + i * 0.03), K.P(-0.088, y0 + 0.05 + i * 0.03)], EG.goldD, 0.004 * hs, 0.5); };
  return [
    { shapes: [mk(1)], fill: shade(EG.gold, 0.12), deco: (c, bb) => pen.vol(c, bb) },
    ...sunDisc(K, 0.0, y0 + 0.095, 0.052),
    { shapes: [mk(-1)], fill: hornFill, deco },
    cobra(K, 0.020, y0 + 0.05, 1.0),
  ];
}

// Kuhohr (Hathor): ragt seitlich aus der Perücke
export function cowEar(K) {
  const { pen } = K;
  const ear = P(K, [[-0.050, 0.050], [-0.088, 0.088], [-0.138, 0.084], [-0.150, 0.056], [-0.124, 0.030], [-0.080, 0.018]], 1.5);
  return { shapes: [ear], fill: { top: '#e0a560', bottom: '#b5773a' }, deco: (c) => { pen.fill(c, K.pts([[-0.074, 0.050], [-0.100, 0.070], [-0.130, 0.066], [-0.122, 0.048], [-0.092, 0.036]]), '#f3cfa6', 0.95); } };
}

// Sobek-Krone: Scheibe zwischen zwei Federn
export function sobekCrown(K) {
  return [feather(K, -0.032, 0.088, 0.20, 0.036, { col: '#fbf7ec', bands: EG.carn, lean: -0.02 }), feather(K, 0.040, 0.088, 0.20, 0.036, { col: '#fbf7ec', bands: EG.turq, lean: -0.01 }), ...sunDisc(K, 0.005, 0.122, 0.042), cobra(K, 0.044, 0.088, 0.9)];
}

// Atef-Krone (Osiris): zwei Federn (hinten / vorn) und Widderhörner am Ansatz der weißen Krone
export function atefParts(K) {
  const { pen } = K;
  const far = feather(K, -0.056, 0.14, 0.26, 0.040, { col: '#fbf7ec', bands: EG.lapis, lean: -0.035 });
  const near = feather(K, 0.050, 0.15, 0.25, 0.040, { col: '#fbf7ec', bands: EG.carn, lean: 0.0 });
  const ram = K.limb([[-0.040, 0.100, 0.022], [-0.078, 0.082, 0.022], [-0.090, 0.040, 0.020], [-0.066, 0.012, 0.016], [-0.042, 0.030, 0.010]]);
  const horn = { shapes: [ram], fill: { top: tint(EG.gold, 0.15), bottom: EG.goldD }, deco: (c, bb) => pen.vol(c, bb) };
  const beard = P(K, [[0.046, -0.078], [0.076, -0.082], [0.092, -0.116], [0.122, -0.134], [0.120, -0.156], [0.090, -0.150], [0.062, -0.118]], 1.2);
  const bd = { shapes: [beard], fill: { top: EG.lapis, bottom: shade(EG.lapis, 0.2) }, deco: (c) => { for (let i = 0; i < 6; i++) pen.line(c, [K.P(0.05, -0.09 - i * 0.017), K.P(0.115, -0.1 - i * 0.017)], EG.gold, 0.004 * K.hs, 0.8); } };
  return { pre: [far], post: [near, horn, cobra(K, 0.062, 0.086, 0.9), bd] };
}

// ------------------------------------------------------------------ Tierköpfe
// ---- Falke (Ra, Horus)
export function headFalcon(K, o = {}) {
  const { pen, hs } = K;
  const col = o.headCol || '#3d4a6c', hi = tint(col, 0.22);
  const L = [];
  if (o.wig !== false) L.push(...wig(K, o));
  const skull = P(K, [[-0.064, -0.03], [-0.080, 0.02], [-0.064, 0.066], [-0.028, 0.097], [0.024, 0.101], [0.060, 0.089], [0.083, 0.062], [0.098, 0.046], [0.082, 0.0], [0.074, -0.04],
    [0.060, -0.07], [0.036, -0.088], [0.0, -0.092], [-0.034, -0.078], [-0.054, -0.058]], 1);
  const beak = P(K, [[0.074, 0.058], [0.100, 0.050], [0.126, 0.040], [0.148, 0.018], [0.156, -0.008], [0.152, -0.032], [0.142, -0.040], [0.136, -0.020], [0.120, -0.010], [0.100, -0.012], [0.082, -0.002], [0.070, 0.02]], 1.5);
  L.push({
    shapes: [skull], fill: { top: hi, bottom: col },
    deco: (c, bb) => {
      pen.vol(c, bb, 'rgba(0,0,10,0.28)', 'rgba(255,255,255,0.14)');
      pen.ell(c, K.P(0.036, -0.056), 0.052 * hs, 0.032 * hs, 0.15, o.throatCol || '#f2e6c8', 0.92);                  // helle Kehle
      for (let i = 0; i < 4; i++) pen.curve(c, [K.P(-0.04 + i * 0.026, 0.092 - i * 0.004), K.P(-0.036 + i * 0.026, 0.076), K.P(-0.04 + i * 0.026, 0.066)], shade(col, 0.35), 0.004 * hs, 0.7);
      pen.curve(c, [K.P(0.064, 0.018), K.P(0.070, -0.010), K.P(0.060, -0.036)], '#14110e', 0.0068 * hs, 1);     // Horus-Zeichnung: Träne
      pen.curve(c, [K.P(0.034, 0.034), K.P(-0.006, 0.030), K.P(-0.040, 0.012), K.P(-0.062, -0.006)], '#14110e', 0.0068 * hs, 1);
      pen.dot(c, K.P(0.052, 0.036), 0.0145 * hs, '#f6dc7a', 1);
      pen.dot(c, K.P(0.054, 0.036), 0.0095 * hs, '#14110e', 1);
      pen.dot(c, K.P(0.057, 0.040), 0.0028 * hs, '#ffffff', 1);
      pen.curve(c, [K.P(0.036, 0.054), K.P(0.054, 0.058), K.P(0.070, 0.046)], '#14110e', 0.0055 * hs, 1);
    },
  });
  L.push({
    shapes: [beak], fill: { top: '#f1d27a', bottom: '#cfa23a' },
    deco: (c, bb) => { pen.vol(c, bb, 'rgba(60,30,0,0.25)', 'rgba(255,255,255,0.2)'); pen.dot(c, K.P(0.095, 0.034), 0.0045 * hs, '#5a3a10', 1); pen.curve(c, [K.P(0.084, -0.004), K.P(0.112, -0.008), K.P(0.134, -0.02)], '#6a4a14', 0.0045 * hs, 0.9); },
  });
  return { layers: L, hideFace: true, hideEar: true, beardStrap: false, top: [0.0, 0.10] };
}

// ---- Ibis (Thot): schwarzer Kopf, langer, nach unten gebogener Schnabel
export function headIbis(K, o = {}) {
  const { pen, hs } = K;
  const col = o.headCol || '#2a2832', hi = tint(col, 0.3);
  const L = [];
  if (o.wig !== false) L.push(...wig(K, o));
  const skull = P(K, [[-0.062, -0.03], [-0.070, 0.03], [-0.046, 0.078], [0.0, 0.094], [0.044, 0.084], [0.066, 0.058], [0.078, 0.030], [0.082, 0.002], [0.072, -0.040], [0.052, -0.070], [0.020, -0.088], [-0.016, -0.090], [-0.046, -0.072]], 1);
  const beak = P(K, [[0.060, 0.046], [0.096, 0.040], [0.136, 0.022], [0.176, -0.010], [0.206, -0.054], [0.222, -0.102], [0.219, -0.116], [0.206, -0.100], [0.182, -0.068], [0.148, -0.038], [0.110, -0.016], [0.080, -0.010], [0.064, 0.0]], 1.5);
  L.push({
    shapes: [skull], fill: { top: hi, bottom: col },
    deco: (c, bb) => {
      pen.vol(c, bb, 'rgba(0,0,10,0.3)', 'rgba(200,200,255,0.16)');
      pen.curve(c, [K.P(-0.04, 0.07), K.P(0.0, 0.082), K.P(0.04, 0.07)], hi, 0.006 * hs, 0.6);
      pen.curve(c, [K.P(0.062, 0.056), K.P(0.034, 0.048), K.P(-0.01, 0.03), K.P(-0.04, -0.01)], EG.gold, 0.0046 * hs, 0.95);
      pen.dot(c, K.P(0.042, 0.032), 0.0120 * hs, '#f6dc7a', 1);
      pen.dot(c, K.P(0.044, 0.032), 0.0075 * hs, '#120e12', 1);
      pen.dot(c, K.P(0.046, 0.035), 0.0024 * hs, '#ffffff', 1);
    },
  });
  L.push({
    shapes: [beak], fill: { top: '#b9a888', bottom: '#7d6c56' },
    deco: (c, bb) => { pen.vol(c, bb, 'rgba(40,20,0,0.3)', 'rgba(255,255,255,0.2)'); pen.curve(c, [K.P(0.09, 0.024), K.P(0.14, 0.004), K.P(0.186, -0.04), K.P(0.208, -0.09)], '#4a3c2c', 0.0045 * hs, 0.8); pen.dot(c, K.P(0.080, 0.028), 0.0042 * hs, '#3a2c20', 0.9); },
  });
  return { layers: L, hideFace: true, hideEar: true, beardStrap: false, top: [0.0, 0.094] };
}

// ---- Katze (Bastet): runder Kopf, zwei spitze Ohren, goldene Augen mit Lidstrich
export function headCat(K, o = {}) {
  const { pen, hs } = K;
  const col = o.headCol || '#d29a54', hi = tint(col, 0.2), dk = shade(col, 0.42);
  const L = [];
  if (o.wig !== false) L.push(...wig(K, o));
  const earF = P(K, [[0.004, 0.086], [0.020, 0.160], [0.050, 0.205], [0.066, 0.150], [0.070, 0.090]], 1);
  L.push({ shapes: [earF], fill: shade(col, 0.2), deco: (c) => { pen.fill(c, K.pts([[0.024, 0.100], [0.038, 0.160], [0.054, 0.178], [0.060, 0.120]]), '#c97a6a', 0.9); } });
  const skull = P(K, [[-0.062, -0.03], [-0.074, 0.02], [-0.064, 0.066], [-0.024, 0.092], [0.030, 0.094], [0.068, 0.076], [0.090, 0.048], [0.102, 0.022], [0.112, 0.006], [0.110, -0.012], [0.098, -0.024], [0.094, -0.040], [0.082, -0.064], [0.058, -0.082], [0.024, -0.090], [-0.016, -0.088], [-0.046, -0.072]], 1);
  L.push({
    shapes: [skull], fill: { top: hi, bottom: col },
    deco: (c, bb) => {
      pen.vol(c, bb, 'rgba(60,20,0,0.26)', 'rgba(255,240,200,0.18)');
      pen.ell(c, K.P(0.07, -0.042), 0.044 * hs, 0.034 * hs, 0.2, '#f6e8c8', 0.95);
      pen.ell(c, K.P(0.02, -0.07), 0.04 * hs, 0.02 * hs, 0.0, '#f6e8c8', 0.8);
      pen.curve(c, [K.P(0.0, 0.092), K.P(0.004, 0.066), K.P(0.012, 0.086)], dk, 0.006 * hs, 0.9);
      pen.curve(c, [K.P(0.026, 0.094), K.P(0.026, 0.07), K.P(0.034, 0.088)], dk, 0.006 * hs, 0.9);
      pen.curve(c, [K.P(-0.03, 0.088), K.P(-0.03, 0.066), K.P(-0.022, 0.082)], dk, 0.006 * hs, 0.9);
      pen.curve(c, [K.P(-0.012, 0.0), K.P(-0.05, -0.012), K.P(-0.068, -0.04)], dk, 0.0075 * hs, 0.85);
      pen.curve(c, [K.P(0.0, -0.025), K.P(-0.03, -0.045), K.P(-0.05, -0.06)], dk, 0.0065 * hs, 0.8);
      pen.fill(c, [K.P(0.074, 0.024), K.P(0.062, 0.040), K.P(0.044, 0.044), K.P(0.028, 0.034), K.P(0.022, 0.026), K.P(0.034, 0.012), K.P(0.054, 0.008)], '#fbf3d8', 1);
      pen.dot(c, K.P(0.050, 0.026), 0.0135 * hs, '#a6b848', 1);
      pen.ell(c, K.P(0.050, 0.026), 0.0042 * hs, 0.0125 * hs, 0, '#1a1208', 1);
      pen.dot(c, K.P(0.054, 0.032), 0.0026 * hs, '#ffffff', 1);
      pen.curve(c, [K.P(0.074, 0.024), K.P(0.062, 0.041), K.P(0.044, 0.046), K.P(0.028, 0.037), K.P(0.0, 0.030), K.P(-0.03, 0.018)], '#16110c', 0.0058 * hs, 1);
      pen.curve(c, [K.P(0.074, 0.024), K.P(0.054, 0.007), K.P(0.032, 0.012)], '#16110c', 0.004 * hs, 1);
      pen.fill(c, K.pts([[0.112, 0.006], [0.100, 0.012], [0.096, -0.004], [0.106, -0.012]]), '#d9786a', 1);
      pen.curve(c, [K.P(0.104, -0.014), K.P(0.098, -0.032), K.P(0.082, -0.036), K.P(0.07, -0.028)], '#5a2c14', 0.0042 * hs, 0.9);
      pen.curve(c, [K.P(0.098, -0.026), K.P(0.086, -0.044)], '#5a2c14', 0.0034 * hs, 0.7);
    },
  });
  const earN = P(K, [[-0.058, 0.066], [-0.052, 0.152], [-0.034, 0.212], [-0.008, 0.176], [0.018, 0.140], [0.034, 0.094]], 1);
  L.push({
    shapes: [earN], fill: { top: hi, bottom: col },
    deco: (c, bb) => { pen.vol(c, bb, 'rgba(60,20,0,0.22)'); pen.fill(c, K.pts([[-0.040, 0.092], [-0.036, 0.150], [-0.030, 0.186], [-0.014, 0.160], [0.006, 0.130], [0.016, 0.100]]), '#c97a6a', 0.9); pen.curve(c, [K.P(-0.03, 0.18), K.P(-0.04, 0.15)], dk, 0.005 * hs, 0.7); },
  });
  const wh = [[[0.088, -0.020], [0.150, -0.002]], [[0.090, -0.030], [0.156, -0.034]], [[0.088, -0.040], [0.146, -0.066]]].map(([a, b]) => K.limb([[...a, 0.0034], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.004, 0.003], [...b, 0.0012]]));
  L.push({ shapes: wh, fill: '#f6efe0', stroke: null });
  L.push({ shapes: [K.blob(-0.034, 0.100, 0.0085, 0.0085, 0, 16)], fill: EG.gold, deco: (c) => pen.dot(c, K.P(-0.034, 0.100), 0.0035 * hs, EG.carn) });
  return { layers: L, hideFace: true, hideEar: true, beardStrap: false, top: [-0.03, 0.212] };
}

// ---- Krokodil (Sobek): lange Schnauze, freundliches Lächeln, Augenbuckel
export function headCroc(K, o = {}) {
  const { pen, hs } = K;
  const col = o.headCol || '#5f8a4a', hi = tint(col, 0.25), dk = shade(col, 0.4), belly = '#eadf9c';
  const L = [];
  if (o.wig !== false) L.push(...wig(K, o));
  const skull = P(K, [[-0.062, -0.03], [-0.072, 0.025], [-0.050, 0.068], [-0.010, 0.084], [0.030, 0.080], [0.062, 0.062], [0.092, 0.046], [0.132, 0.040], [0.178, 0.034], [0.216, 0.030], [0.236, 0.030], [0.244, 0.018], [0.242, -0.002],
    [0.232, -0.014], [0.20, -0.016], [0.15, -0.024], [0.108, -0.036], [0.084, -0.052], [0.068, -0.076], [0.042, -0.090], [0.0, -0.092], [-0.034, -0.078], [-0.054, -0.056]], 1);
  const bump = K.blob(0.052, 0.074, 0.028, 0.024, 0.1, 24), nose = K.blob(0.230, 0.036, 0.018, 0.014, 0.1, 18);
  L.push({
    shapes: [skull, bump, nose], fill: { top: hi, bottom: col },
    deco: (c, bb) => {
      pen.vol(c, bb, 'rgba(10,30,0,0.28)', 'rgba(255,255,220,0.18)');
      pen.fill(c, K.pts([[0.236, -0.012], [0.20, -0.016], [0.15, -0.024], [0.108, -0.036], [0.084, -0.052], [0.068, -0.076], [0.04, -0.09], [0.0, -0.095], [-0.04, -0.09], [-0.01, -0.07], [0.04, -0.06], [0.1, -0.052], [0.16, -0.046], [0.215, -0.042], [0.24, -0.03]]), belly, 0.95);
      for (let i = 0; i < 4; i++) pen.curve(c, [K.P(-0.05 + i * 0.026, 0.084), K.P(-0.044 + i * 0.026, 0.06), K.P(-0.052 + i * 0.026, 0.03)], dk, 0.006 * hs, 0.45);
      for (let i = 0; i < 5; i++) pen.dot(c, K.P(0.11 + i * 0.026, 0.034 - i * 0.002), 0.0042 * hs, dk, 0.4);
      pen.curve(c, [K.P(0.240, -0.004), K.P(0.20, -0.016), K.P(0.15, -0.024), K.P(0.108, -0.034), K.P(0.084, -0.046), K.P(0.07, -0.040)], '#2a3a14', 0.0058 * hs, 1);
      pen.ell(c, K.P(0.232, 0.040), 0.0075 * hs, 0.0042 * hs, 0.2, '#1c260c', 1);
      pen.dot(c, K.P(0.056, 0.072), 0.0165 * hs, '#f2d060', 1);
      pen.ell(c, K.P(0.056, 0.072), 0.0042 * hs, 0.0135 * hs, 0, '#14100a', 1);
      pen.dot(c, K.P(0.061, 0.078), 0.0028 * hs, '#ffffff', 1);
      pen.curve(c, [K.P(0.036, 0.086), K.P(0.056, 0.094), K.P(0.076, 0.084), K.P(0.092, 0.066)], '#16210a', 0.0058 * hs, 1);
    },
  });
  const teeth = [0.205, 0.17, 0.135, 0.10].map((x) => P(K, [[x - 0.007, -0.016], [x + 0.001, -0.036], [x + 0.008, -0.020]], 0));
  L.push({ shapes: teeth, fill: '#fffaea', stroke: 'rgba(90,80,40,.55)' });
  return { layers: L, hideFace: true, hideEar: true, beardStrap: false, top: [0.05, 0.096] };
}

// ---- Schakal (Anubis): schwarze, schlanke Schnauze, hohe aufrechte Ohren
export function headJackal(K, o = {}) {
  const { pen, hs } = K;
  const col = o.headCol || '#2a2630', hi = tint(col, 0.28);
  const L = [];
  if (o.wig !== false) L.push(...wig(K, o));
  const earF = P(K, [[0.008, 0.090], [0.018, 0.180], [0.042, 0.250], [0.060, 0.176], [0.058, 0.098]], 1);
  L.push({ shapes: [earF], fill: shade(col, 0.2) });
  const skull = P(K, [[-0.062, -0.03], [-0.074, 0.025], [-0.054, 0.082], [-0.006, 0.100], [0.040, 0.092], [0.074, 0.068], [0.110, 0.044], [0.152, 0.024], [0.186, 0.012], [0.200, 0.006], [0.200, -0.010], [0.186, -0.020], [0.150, -0.026], [0.110, -0.040],
    [0.080, -0.064], [0.050, -0.086], [0.008, -0.092], [-0.032, -0.078], [-0.054, -0.056]], 1);
  L.push({
    shapes: [skull], fill: { top: hi, bottom: col },
    deco: (c, bb) => {
      pen.vol(c, bb, 'rgba(0,0,10,0.3)', 'rgba(200,200,255,0.16)');
      pen.ell(c, K.P(0.12, -0.026), 0.07 * hs, 0.016 * hs, -0.12, tint(col, 0.2), 0.8);
      pen.dot(c, K.P(0.194, 0.0), 0.0085 * hs, '#000000', 1);
      pen.dot(c, K.P(0.196, 0.003), 0.0022 * hs, 'rgba(255,255,255,.7)', 1);
      pen.curve(c, [K.P(0.196, -0.014), K.P(0.15, -0.024), K.P(0.11, -0.036), K.P(0.082, -0.05)], '#8a7a88', 0.0042 * hs, 0.9);
      const up = [K.P(0.076, 0.050), K.P(0.064, 0.060), K.P(0.048, 0.062), K.P(0.034, 0.054)];
      const lo = [K.P(0.076, 0.050), K.P(0.064, 0.042), K.P(0.046, 0.042), K.P(0.034, 0.054)];
      pen.fill(c, up.concat(lo.slice().reverse()), '#fbf3d8', 1);
      pen.dot(c, K.P(0.057, 0.052), 0.0062 * hs, '#1c1816', 1);
      pen.dot(c, K.P(0.059, 0.054), 0.002 * hs, '#ffffff', 1);
      pen.curve(c, up.concat([K.P(0.006, 0.050), K.P(-0.03, 0.036)]), EG.gold, 0.0052 * hs, 1);
      pen.curve(c, lo, EG.gold, 0.0035 * hs, 1);
      pen.curve(c, [K.P(0.03, -0.075), K.P(0.0, -0.062), K.P(-0.03, -0.05)], EG.gold, 0.007 * hs, 0.95);
    },
  });
  const earN = P(K, [[-0.056, 0.078], [-0.046, 0.176], [-0.026, 0.254], [-0.004, 0.196], [0.020, 0.100]], 1);
  L.push({
    shapes: [earN], fill: { top: hi, bottom: col },
    deco: (c, bb) => { pen.vol(c, bb, 'rgba(0,0,10,0.22)'); pen.fill(c, K.pts([[-0.040, 0.100], [-0.034, 0.176], [-0.026, 0.226], [-0.014, 0.18], [0.004, 0.108]]), '#a56a64', 0.9); },
  });
  return { layers: L, hideFace: true, hideEar: true, beardStrap: false, top: [-0.026, 0.254] };
}

// ---- Skarabäus (Chepre): ein Käfer in Aufsicht ersetzt den Kopf, die Vorderbeine halten die Sonne
export function headScarab(K, o = {}) {
  const { pen, hs } = K;
  const L = [];
  const cx = 0.0, cy = 0.012;
  const base = o.headCol || '#1f4b8c', hi = '#4a8fd0', turq = EG.turq;
  const legs = [];
  for (const sd of [-1, 1]) {
    legs.push(K.limb([[cx + sd * 0.050, cy + 0.045, 0.014], [cx + sd * 0.092, cy + 0.075, 0.012], [cx + sd * 0.104, cy + 0.108, 0.009]]));
    legs.push(K.limb([[cx + sd * 0.056, cy + 0.0, 0.013], [cx + sd * 0.100, cy - 0.004, 0.011], [cx + sd * 0.116, cy - 0.036, 0.008]]));
    legs.push(K.limb([[cx + sd * 0.048, cy - 0.04, 0.012], [cx + sd * 0.086, cy - 0.060, 0.010], [cx + sd * 0.098, cy - 0.092, 0.007]]));
  }
  L.push({ shapes: legs, fill: '#16345f', deco: (c, bb) => pen.vol(c, bb, 'rgba(0,0,20,0.3)') });
  if (o.disc !== false) L.push(...sunDisc(K, cx, cy + 0.175, 0.040));
  const shell = K.blob(cx, cy - 0.012, 0.064, 0.080, 0, 44);
  const prono = K.blob(cx, cy + 0.066, 0.052, 0.030, 0, 32);
  L.push({
    shapes: [shell, prono], fill: { top: hi, bottom: base },
    deco: (c, bb) => {
      pen.vol(c, bb, 'rgba(0,0,30,0.34)', 'rgba(200,255,245,0.26)');
      pen.line(c, [K.P(cx, cy + 0.065), K.P(cx, cy - 0.092)], '#0c1f40', 0.0058 * hs, 1);
      pen.curve(c, [K.P(cx - 0.052, cy + 0.052), K.P(cx, cy + 0.040), K.P(cx + 0.052, cy + 0.052)], '#0c1f40', 0.0050 * hs, 1);
      for (let i = 0; i < 4; i++) { const y = cy + 0.02 - i * 0.022; pen.curve(c, [K.P(cx - 0.012, y), K.P(cx - 0.036, y - 0.006), K.P(cx - 0.052, y - 0.020)], turq, 0.0045 * hs, 0.9); pen.curve(c, [K.P(cx + 0.012, y), K.P(cx + 0.036, y - 0.006), K.P(cx + 0.052, y - 0.020)], turq, 0.0045 * hs, 0.9); }
      pen.curve(c, [K.P(cx - 0.036, cy + 0.07), K.P(cx, cy + 0.082), K.P(cx + 0.036, cy + 0.07)], EG.goldL, 0.0045 * hs, 0.9);
    },
  });
  const clyp = P(K, [[cx - 0.040, cy + 0.082], [cx - 0.030, cy + 0.112], [cx - 0.020, cy + 0.100], [cx - 0.010, cy + 0.120], [cx, cy + 0.104], [cx + 0.010, cy + 0.120], [cx + 0.020, cy + 0.100], [cx + 0.030, cy + 0.112], [cx + 0.040, cy + 0.082]], 0.5);
  L.push({ shapes: [clyp], fill: '#16345f', deco: (c) => { pen.dot(c, K.P(cx - 0.014, cy + 0.094), 0.0045 * hs, EG.goldL, 1); pen.dot(c, K.P(cx + 0.014, cy + 0.094), 0.0045 * hs, EG.goldL, 1); } });
  return { layers: L, hideFace: true, hideEar: true, beardStrap: false, top: [0, cy + 0.215] };
}
