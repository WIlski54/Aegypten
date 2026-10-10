// Gruppe O2 – Kanopenkrüge der vier Horussöhne (frontal, 0,5 m). Dokumentation: Kopf von eg_ritual.js.
// Parts: body (Krug, z1), deckel (Kopfdeckel, z2, Pivot = Mitte der Deckelunterkante). Der Krugmund ist unter dem Deckel dunkel.
// Farbcode je Sohn (Band und Glyphenfeld): Amset/Mensch Lapis, Hapi/Pavian Türkis, Duamutef/Schakal Karneol, Kebehsenuef/Falke Nilgrün.
import {
  P, goldH, goldV, rect, rrect, ring, scaleLayers, limb, blob, poly, leaf, ankhPolys, djedPolys, wasPolys, fillPoly, fillPolys, sparkle, cylinder,
  rectFill, ellipseFill, curve, strokes, volume, finish, mix, shade, rngOf,
} from './_eg_ritual_kit.js';

const mk = (id, name, parts, anchors, meta, o) => finish({ id, parts, anchors, meta: { name, ...meta } }, o);
const J = 0.30, C = 0.335, HC = 0.43;   // Krugrand, Kragenoberkante, Kopfmitte

const KINDS = {
  mensch: { id: 'kanope_mensch', name: 'Kanope Amset (Menschenkopf)', son: 'Amset', accent: P.lapis, accentLo: P.lapisLo },
  pavian: { id: 'kanope_pavian', name: 'Kanope Hapi (Paviankopf)', son: 'Hapi', accent: P.turq, accentLo: P.turqLo },
  schakal: { id: 'kanope_schakal', name: 'Kanope Duamutef (Schakalkopf)', son: 'Duamutef', accent: P.carn, accentLo: P.carnLo },
  falke: { id: 'kanope_falke', name: 'Kanope Kebehsenuef (Falkenkopf)', son: 'Kebehsenuef', accent: P.nil, accentLo: '#245a39' },
};

// ---- Krug -----------------------------------------------------------------------------------------
function jarBody(k) {
  const prof = limb([[0, 0.012, 0.13], [0, 0.07, 0.185], [0, 0.15, 0.205], [0, 0.23, 0.19], [0, 0.285, 0.16], [0, J + 0.01, 0.15]], { per: 8, caps: false });
  const foot = rrect(-0.07, 0, 0.07, 0.03, 0.01);
  const mouth = blob(0, J, 0.074, 0.02, 0, 24);
  return {
    z: 1, layers: [
      {
        shapes: [prof, foot], fill: { stops: [[0, '#cbbd9a'], [0.28, '#fbf3df'], [0.6, '#eadfc4'], [1, '#b9aa84']], dir: 'h' },
        deco(c, bb) {
          volume(c, bb, { dark: 'rgba(90,60,20,0.25)', light: 'rgba(255,255,255,0.15)' });
          // Bänder: Schulter (Farbe) und Fuß (Gold)
          rectFill(c, -0.13, 0.255, 0.13, 0.285, k.accent, 0.95); rectFill(c, -0.13, 0.285, 0.13, 0.296, P.gold, 0.95);
          rectFill(c, -0.13, 0.02, 0.13, 0.05, P.gold, 0.95); rectFill(c, -0.13, 0.05, 0.13, 0.058, k.accent, 0.95);
          for (let i = -4; i <= 4; i++) ellipseFill(c, i * 0.022, 0.27, 0.006, 0.006, P.goldHi, 0.9);
          // Glyphenfeld
          rectFill(c, -0.05, 0.085, 0.05, 0.245, P.gold, 0.95);
          rectFill(c, -0.044, 0.091, 0.044, 0.239, k.accentLo, 1);
          fillPolys(c, ankhPolys(0, 0.196, 0.04, 1), P.goldHi);
          fillPolys(c, djedPolys(0, 0.145, 0.04), P.goldHi);
          fillPolys(c, wasPolys(0, 0.097, 0.04), P.goldHi);
          sparkle(c, -0.07, 0.2, 0.025, { alpha: 0.7 });
        },
      },
      // Mund: dunkel, ragt unter dem Deckel hervor
      { shapes: [mouth], fill: '#2a1e14', stroke: null, deco(c) { ellipseFill(c, 0, J + 0.003, 0.07, 0.012, '#4a3828'); } },
    ],
  };
}

// ---- Köpfe --------------------------------------------------------------------------------------
const collar = () => rrect(-0.092, J - 0.012, 0.092, C, 0.014);
function collarLayer(k) {
  return {
    shapes: [collar()], fill: goldH,
    deco(c, bb) { cylinder(c, bb, { at: 0.2 }); rectFill(c, -0.092, J + 0.005, 0.092, J + 0.016, k.accent, 0.95); for (let i = -3; i <= 3; i++) ellipseFill(c, i * 0.026, J + 0.0105, 0.004, 0.004, P.goldHi); },
  };
}
function eyeFront(c, x, y, rx, ry, { iris = '#2a1a10', white = '#fff8e6', liner = true, kohl = 1 } = {}) {
  ellipseFill(c, x, y, rx, ry, white); ellipseFill(c, x, y, ry * 0.95, ry * 0.95, iris); ellipseFill(c, x + ry * 0.3, y + ry * 0.35, ry * 0.3, ry * 0.3, '#ffffff', 0.9);
}

function headMensch(k) {
  const nemes = poly([[-0.125, C - 0.004], [-0.108, 0.40], [-0.095, 0.47], [-0.06, 0.51], [-0.02, 0.525], [0.02, 0.525], [0.06, 0.51], [0.095, 0.47], [0.108, 0.40], [0.125, C - 0.004]], 1);
  const face = blob(0, HC - 0.006, 0.058, 0.078, 0, 32);
  return [
    collarLayer(k),
    {
      shapes: [nemes], fill: goldH,
      deco(c, bb) {
        // Streifen blau/gold (Lappen waagerecht, Kappe schräg)
        for (let y = C; y < 0.53; y += 0.026) rectFill(c, -0.14, y, 0.14, y + 0.0125, P.lapis, 0.92);
        rectFill(c, -0.13, 0.465, 0.13, 0.48, P.gold, 1); rectFill(c, -0.13, 0.48, 0.13, 0.494, P.lapisLo, 1);
        cylinder(c, bb, { dark: 'rgba(0,0,30,0.3)', light: 'rgba(255,255,255,0.25)' });
        sparkle(c, -0.075, 0.5, 0.03);
      },
    },
    {
      shapes: [face], fill: { top: '#c47a47', bottom: '#a05a2e' },
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(60,20,0,0.25)', light: 'rgba(255,220,170,0.2)' });
        const ey = HC + 0.018;
        for (const sg of [-1, 1]) {
          // Braue, Kajal-Auge
          curve(c, [[sg * 0.012, ey + 0.032], [sg * 0.032, ey + 0.043], [sg * 0.058, ey + 0.034]], '#1c1816', 0.011, { alpha: 1 });
          eyeFront(c, sg * 0.032, ey, 0.019, 0.013);
          curve(c, [[sg * 0.012, ey - 0.002], [sg * 0.05, ey + 0.0], [sg * 0.068, ey + 0.012]], '#1c1816', 0.007, { alpha: 1 });
        }
        curve(c, [[0, ey - 0.004], [-0.004, HC - 0.03], [0.007, HC - 0.04]], '#8a4a24', 0.008, { alpha: 0.8 });
        curve(c, [[-0.022, HC - 0.057], [0, HC - 0.066], [0.022, HC - 0.057]], '#7a2a1c', 0.011, { alpha: 1 });
        ellipseFill(c, -0.04, HC - 0.045, 0.011, 0.007, '#e8a070', 0.35);
        ellipseFill(c, 0.04, HC - 0.045, 0.011, 0.007, '#e8a070', 0.35);
      },
    },
    { shapes: [rrect(-0.012, 0.37, 0.012, 0.394, 0.006)], fill: P.lapis, stroke: null, deco() {} },
  ].slice(0, 3);
}

function headPavian(k) {
  const mane = poly([[-0.13, C - 0.004], [-0.125, 0.4], [-0.105, 0.47], [-0.07, 0.515], [-0.03, 0.535], [0.03, 0.535], [0.07, 0.515], [0.105, 0.47], [0.125, 0.4], [0.13, C - 0.004]], 1);
  const ears = [blob(-0.07, HC + 0.01, 0.018, 0.024), blob(0.07, HC + 0.01, 0.018, 0.024)];
  const face = blob(0, HC - 0.002, 0.056, 0.075, 0, 30);
  const muzzle = blob(0, HC - 0.032, 0.04, 0.043, 0, 24);
  return [
    collarLayer(k),
    {
      shapes: [mane], fill: { stops: [[0, '#d2d2c8'], [0.5, '#a5a69c'], [1, '#6c6d66']], dir: 'v' },
      deco(c, bb) {
        // Mähne: schräge helle Strähnen
        const r = rngOf(4, 8);
        const L = [];
        for (let i = 0; i < 40; i++) { const x = -0.12 + r() * 0.24, y = C + r() * 0.2; L.push([x, y, x + (x > 0 ? 0.01 : -0.01), y - 0.045]); }
        strokes(c, L, '#f1f1e8', 0.005, 0.6);
        const L2 = [];
        for (let i = 0; i < 30; i++) { const x = -0.12 + r() * 0.24, y = C + r() * 0.2; L2.push([x, y, x + (x > 0 ? 0.008 : -0.008), y - 0.04]); }
        strokes(c, L2, '#4a4b44', 0.004, 0.45);
        volume(c, bb, { dark: 'rgba(30,25,15,0.25)', light: 'rgba(255,255,255,0.1)' });
      },
    },
    { shapes: ears, fill: '#5b4a40', deco(c) { ellipseFill(c, -0.07, HC + 0.01, 0.009, 0.014, '#b07a68'); ellipseFill(c, 0.07, HC + 0.01, 0.009, 0.014, '#b07a68'); } },
    {
      shapes: [face], fill: { top: '#6b5a4e', bottom: '#4a3a30' },
      deco(c, bb) {
        // Brauenwulst, Augen, Schnauze
        rectFill(c, -0.056, HC + 0.032, 0.056, HC + 0.045, '#3a2c24', 0.65);
        ellipseFill(c, 0, HC - 0.034, 0.037, 0.04, '#8a7466'); ellipseFill(c, 0, HC - 0.044, 0.026, 0.026, '#a08a7a', 0.7);
        for (const sg of [-1, 1]) {
          eyeFront(c, sg * 0.027, HC + 0.016, 0.014, 0.012, { iris: '#7a4a12', white: '#f1d890' });
          ellipseFill(c, sg * 0.027, HC + 0.016, 0.007, 0.007, '#14100c');
          ellipseFill(c, sg * 0.01, HC - 0.03, 0.005, 0.009, '#2a1c14');
        }
        curve(c, [[-0.02, HC - 0.062], [0, HC - 0.067], [0.02, HC - 0.062]], '#2a1c14', 0.007, { alpha: 0.9 });
        sparkle(c, -0.04, HC + 0.05, 0.015, { alpha: 0.4 });
      },
    },
  ];
}

function headSchakal(k) {
  const ears = [poly([[-0.1, 0.41], [-0.088, 0.575], [-0.03, 0.5], [-0.04, 0.43]], 1), poly([[0.1, 0.41], [0.088, 0.575], [0.03, 0.5], [0.04, 0.43]], 1)];
  const head = poly([[-0.07, 0.455], [-0.068, 0.49], [-0.035, 0.52], [0.035, 0.52], [0.068, 0.49], [0.07, 0.455], [0.05, 0.41], [0.03, 0.375], [0.024, 0.345], [-0.024, 0.345], [-0.03, 0.375], [-0.05, 0.41]], 1);
  const ruff = poly([[-0.1, C - 0.004], [-0.092, 0.39], [-0.06, 0.41], [0.06, 0.41], [0.092, 0.39], [0.1, C - 0.004]], 1);
  const dark = { top: '#2e2723', bottom: '#14100e' };
  return [
    collarLayer(k),
    { shapes: [ruff], fill: dark, deco(c, bb) { const r = rngOf(2, 4); const L = []; for (let i = 0; i < 22; i++) { const x = -0.09 + r() * 0.18; L.push([x, 0.4, x * 1.08, 0.345]); } strokes(c, L, '#4a4038', 0.004, 0.6); } },
    { shapes: ears, fill: dark, deco(c) { fillPoly(c, poly([[-0.092, 0.45], [-0.082, 0.55], [-0.05, 0.5], [-0.052, 0.455]], 1), P.gold, 0.9); fillPoly(c, poly([[0.092, 0.45], [0.082, 0.55], [0.05, 0.5], [0.052, 0.455]], 1), P.gold, 0.9); } },
    {
      shapes: [head], fill: dark,
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(0,0,0,0.3)', light: 'rgba(255,230,200,0.14)' });
        curve(c, [[0, 0.5], [0, 0.4]], '#4a4038', 0.014, { alpha: 0.7 });
        ellipseFill(c, 0, 0.352, 0.022, 0.014, '#050403');
        curve(c, [[0, 0.345], [0, 0.325]], '#0a0806', 0.004);
        for (const sg of [-1, 1]) {
          curve(c, [[sg * 0.012, 0.462], [sg * 0.03, 0.478], [sg * 0.06, 0.468]], P.gold, 0.007);
          ellipseFill(c, sg * 0.034, 0.455, 0.018, 0.011, '#f2cf6a', 1, sg * 0.35);
          ellipseFill(c, sg * 0.036, 0.455, 0.007, 0.009, '#14100c');
          ellipseFill(c, sg * 0.039, 0.459, 0.003, 0.003, '#ffffff', 0.9);
          curve(c, [[sg * 0.014, 0.447], [sg * 0.046, 0.447], [sg * 0.068, 0.462]], P.gold, 0.004, { alpha: 0.9 });
        }
      },
    },
  ];
}

function headFalke(k) {
  const nape = poly([[-0.1, C - 0.004], [-0.092, 0.4], [-0.075, 0.45], [0.075, 0.45], [0.092, 0.4], [0.1, C - 0.004]], 1);
  const head = blob(0, HC + 0.012, 0.078, 0.082, 0, 36);
  const beak = poly([[-0.02, HC - 0.01], [0.02, HC - 0.01], [0.022, HC - 0.04], [0.004, HC - 0.07], [-0.003, HC - 0.066], [-0.022, HC - 0.04]], 1);
  const slate = { stops: [[0, '#56688a'], [0.5, '#3b4f72'], [1, '#26344e']], dir: 'v' };
  const stripes = [];
  for (const sg of [-1, 1]) {
    stripes.push(limb([[sg * 0.075, HC + 0.04, 0.012], [sg * 0.04, HC + 0.05, 0.016], [sg * 0.012, HC + 0.042, 0.01]], { per: 5 }));
    stripes.push(limb([[sg * 0.066, HC + 0.012, 0.01], [sg * 0.082, HC - 0.01, 0.012], [sg * 0.07, HC - 0.04, 0.008]], { per: 5 }));
    stripes.push(limb([[sg * 0.04, HC + 0.0, 0.01], [sg * 0.04, HC - 0.035, 0.014], [sg * 0.054, HC - 0.058, 0.008]], { per: 5 }));
  }
  return [
    collarLayer(k),
    {
      shapes: [nape, head], fill: slate,
      deco(c, bb) {
        for (let r = 0; r < 5; r++) for (let q = -3; q <= 3; q++) {
          const x = q * 0.026 + (r % 2) * 0.013, y = 0.36 + r * 0.022;
          if (Math.abs(x) < 0.09) curve(c, [[x - 0.012, y + 0.008], [x, y - 0.004], [x + 0.012, y + 0.008]], '#a9bddf', 0.004, { alpha: 0.45 });
        }
        volume(c, bb, { dark: 'rgba(0,0,20,0.3)', light: 'rgba(200,225,255,0.18)' });
        for (const sg of [-1, 1]) ellipseFill(c, sg * 0.048, HC - 0.03, 0.03, 0.04, '#f4ead0', 0.95, sg * 0.25);
        ellipseFill(c, 0, HC - 0.062, 0.03, 0.022, '#f4ead0', 0.95);
        sparkle(c, -0.05, 0.505, 0.022, { alpha: 0.55 });
      },
    },
    { shapes: stripes, fill: '#14110e', stroke: null },
    {
      shapes: [blob(-0.04, HC + 0.02, 0.022, 0.018, 0, 16), blob(0.04, HC + 0.02, 0.022, 0.018, 0, 16)], fill: '#1a1612', stroke: null,
      deco(c) {
        for (const sg of [-1, 1]) {
          ellipseFill(c, sg * 0.04, HC + 0.02, 0.016, 0.0135, '#e8b838'); ellipseFill(c, sg * 0.04, HC + 0.02, 0.0105, 0.0105, '#3a2410');
          ellipseFill(c, sg * 0.04, HC + 0.02, 0.005, 0.005, '#050403'); ellipseFill(c, sg * 0.0435, HC + 0.0245, 0.0028, 0.0028, '#ffffff');
        }
      },
    },
    {
      shapes: [beak], fill: { top: '#ffe08a', bottom: '#c08a1c' },
      deco(c) { curve(c, [[0, HC - 0.012], [0, HC - 0.062]], '#7a5010', 0.005, { alpha: 0.8 }); ellipseFill(c, -0.009, HC - 0.022, 0.004, 0.006, '#4a2c08'); ellipseFill(c, 0.009, HC - 0.022, 0.004, 0.006, '#4a2c08'); },
    },
  ];
}

export function kanope(kind, opts = {}) {
  const k = KINDS[kind];
  const head = { mensch: headMensch, pavian: headPavian, schakal: headSchakal, falke: headFalke }[kind](k);
  const spec = {
    id: k.id,
    parts: { body: jarBody(k), deckel: { z: 2, pivot: [0, J - 0.01], layers: scaleLayers(head, 1.14, 0, J - 0.01) } },
    anchors: { base: [0, 0], mund: [0, J], kopf: [0, HC], deckel: [0, J - 0.01], top: [0, 0.55] },
    meta: {
      name: k.name, heightM: 0.5, sohn: k.son,
      ranges: { deckel: [0, -0.5] }, swing: {}, lift: 0.14,
      hinweis: 'Deckel abheben: deckel.position.y += lift*worldScale (optional dazu ranges.deckel kippen)',
    },
  };
  return finish(spec, { h: opts.h ?? 0.5 });
}
