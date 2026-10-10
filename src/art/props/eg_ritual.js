// Gruppe O2 – Totengericht: Waage, Herz, Maat-Feder, Tor der Unterwelt, vier Kanopenkrüge.
//
// ===== WAAGE (id `waage`, 2,2 m hoch, Vorderansicht, Herz links / Feder rechts) =============================================
// Parts (z hinten -> vorn):  staender (z0)  <  schale_herz, schale_feder (z1)  <  balken (z2)
//   staender      Sockel + Lapis-Säule mit Glyphen (feststehend).
//   balken        Waagebalken mit Nabe, Zeiger („Zunge“) und Endknöpfen. Pivot = Nabe (Anker `pivot`).
//   schale_herz   Aufhängung (drei Ketten, V-förmig) + Schale. Pivot = Aufhängepunkt am LINKEN Balkenende (Anker `endHerz`).
//   schale_feder  dasselbe am RECHTEN Balkenende (Anker `endFeder`).
// So hängen Balken und Schalen zusammen (die Engine kennt keine Gruppen-Hierarchie, jeder Part ist ein eigenes Gelenk):
//   Der Balken dreht um die Nabe `pivot`; die beiden Schalen hängen mit ihrem Pivot an den Balkenenden und müssen von der Seite
//   mitgeführt werden, damit sie gerade herunterhängen (wie echte Waagschalen, Schwerkraft!). Dafür gibt es die Hilfsfunktion
//       import { waageSet } from '../art/props/eg_ritual.js';
//       waageSet(fig, theta, { sway })     // theta in rad, positiv = Herz-Seite sinkt (gegen den Uhrzeigersinn)
//   Sie setzt balken.rotation.z = theta und verschiebt die Pivots der Schalen auf die neuen Balkenenden:
//       Ende(Herz)  = pivot + R(theta)·(-L, 0)     Ende(Feder) = pivot + R(theta)·(+L, 0),   L = halbe Balkenlänge
//   (Offset gegenüber der Ruhelage × worldScale in g.position; Schalen behalten rotation.z = 0 bzw. leichtes Pendeln `sway`.)
//   Wer lieber selbst rechnet: Ruhelage der Parts in `g.userData.rest` (px,py), Anker aus spec.anchors (Modellmeter).
//   Schalen-Inhalt (Herz/Feder-Prop): in Ruhelage bei Anker `tellerHerz`/`tellerFeder`, dieselbe Verschiebung wie die Schale.
//   meta.ranges: balken [0, 0.5] (±0.5 erlaubt; + = Herz schwerer), schale_* [0, 0.15] (nur Pendeln).
//   Gelenktest per Galerie `pose=balken:0.3` dreht nur den Balken (Schalen bleiben stehen, Nähte am Balkenende überlappen).
//
// ===== TOR DER UNTERWELT (id `tor_unterwelt`, 4,5 m) =======================================================================
// Parts: nacht (z0, Sternenhimmel der Duat hinter dem Tor) < body (z1, Steinrahmen mit Flügelsonne) < flA, flB (z2, Türflügel)
//   flA = linker Flügel (Pivot an der linken Außenkante unten), flB = rechter Flügel (Pivot rechte Außenkante unten).
//   Empfohlen: Schwingen um die SENKRECHTE Achse (echtes Aufschwingen zum Betrachter):  flA.rotation.y = -t·1.45,
//   flB.rotation.y = +t·1.45  (t 0..1)  -> Hilfsfunktion `torOeffnen(fig, t)`.  Alternativ (nur rotation.z via rotatePart):
//   meta.ranges.flA = [0, 0.9], flB = [0, -0.9] (fächert die Flügel nach außen).
//
// ===== KANOPEN (kanope_mensch / _pavian / _schakal / _falke, 0,5 m) =======================================================
// Parts: body (Krug, z1), deckel (Kopfdeckel, z2; Pivot = Mitte der Deckelunterkante). Frontalansicht (wie echte Kanopen).
//   Deckel öffnet: Seite hebt `deckel.position.y += meta.lift * worldScale` und/oder kippt ihn (ranges.deckel [0,-0.5]).
//   Im Krugmund ist nur Dunkel zu sehen (kein Inhalt).
import {
  P, goldH, goldV, lapisV, lapisH, turqV, carnV, rect, rrect, mirror, shift, ring, arcLimb, limb, blob, poly, xf, spline, TAU,
  ankhPolys, djedPolys, wasPolys, fillPoly, fillPolys, strokePoly, sparkle, cylinder, rectFill, ellipseFill, curve, strokes, line, dot,
  volume, finish, mix, shade, rngOf, fillGrad,
} from './_eg_ritual_kit.js';

const mk = (id, name, parts, anchors, meta, o) => finish({ id, parts, anchors, meta: { name, ...meta } }, o);
const d2r = (d) => d * Math.PI / 180;

// ====== Waage ===================================================================================================
export function waageSet(fig, theta, { sway = 0 } = {}) {
  const A = fig.spec.anchors, s = fig.worldScale;
  const L = (A.endFeder[0] - A.endHerz[0]) / 2;
  const c = Math.cos(theta), sn = Math.sin(theta);
  fig.rotatePart('balken', theta);
  const set = (name, sign) => {
    const g = fig.parts[name]; if (!g) return;
    const r = g.userData.rest || { px: g.position.x, py: g.position.y };
    g.position.x = r.px + sign * L * (c - 1) * s;
    g.position.y = r.py + sign * L * sn * s;
    g.rotation.z = sway;
  };
  set('schale_herz', -1); set('schale_feder', 1);
  return { dxHerz: -L * (c - 1), dyHerz: -L * sn, dxFeder: L * (c - 1), dyFeder: L * sn };
}

export function waage(opts = {}) {
  const hubY = 1.78, L = 0.9, chain = 0.62, rimY = hubY - chain;
  // --- Ständer ---------------------------------------------------------------------------------
  const plinthA = rrect(-0.74, 0, 0.74, 0.11, 0.02), plinthB = rrect(-0.56, 0.1, 0.56, 0.21, 0.02);
  const column = poly([[-0.13, 0.2], [0.13, 0.2], [0.098, 1.66], [-0.098, 1.66]]);
  const capital = poly([[-0.2, 1.62], [0.2, 1.62], [0.2, 1.69], [0.09, 1.72], [0.09, 1.9], [-0.09, 1.9], [-0.09, 1.72], [-0.2, 1.69]], 0);
  const finialStem = rect(-0.03, 1.9, 0.03, 2.0);
  const finialDisc = blob(0, 2.1, 0.1, 0.1, 0, 28);
  const stand = {
    z: 0, layers: [
      {
        shapes: [plinthA, plinthB], fill: { top: '#ead09a', bottom: '#b3935a' },
        deco(c, bb) {
          volume(c, bb);
          for (let k = 0; k < 14; k++) rectFill(c, -0.68 + k * 0.0975, 0.025, -0.68 + k * 0.0975 + 0.06, 0.075, k % 2 ? P.turq : P.lapis, 0.95);
          rectFill(c, -0.74, 0.0, 0.74, 0.016, P.goldLo, 0.5); rectFill(c, -0.56, 0.18, 0.56, 0.21, P.gold, 0.9);
          for (let k = 0; k < 9; k++) rectFill(c, -0.5 + k * 0.125, 0.125, -0.5 + k * 0.125 + 0.065, 0.165, k % 2 ? P.carn : P.goldHi, 0.85);
        },
      },
      {
        shapes: [column], fill: lapisH,
        deco(c, bb) {
          rectFill(c, -0.15, 0.2, 0.15, 0.245, P.gold); rectFill(c, -0.15, 1.5, 0.15, 1.545, P.gold); rectFill(c, -0.15, 0.84 - 0.0, 0.15, 0.87, P.gold, 0.9);
          fillPolys(c, ankhPolys(0, 0.29, 0.27, 1), P.gold);
          fillPolys(c, djedPolys(0, 0.93, 0.27), P.gold);
          fillPolys(c, wasPolys(0, 0.56, 0.27), P.gold);
          rectFill(c, -0.15, 1.2, 0.15, 1.235, P.gold, 0.9); rectFill(c, -0.13, 1.215, 0.13, 1.225, P.turq, 0.9);
        },
      },
      {
        shapes: [capital, finialStem, finialDisc], fill: goldH,
        deco(c) {
          cylinder(c, { x0: -0.2, x1: 0.2, y0: 1.6, y1: 2.2 });
          ellipseFill(c, 0, 2.1, 0.06, 0.06, P.lapis); ellipseFill(c, 0, 2.1, 0.028, 0.028, P.carn); sparkle(c, -0.04, 2.14, 0.04);
          for (let k = 0; k < 5; k++) ellipseFill(c, -0.15 + k * 0.075, 1.655, 0.014, 0.014, k % 2 ? P.carn : P.turq);
        },
      },
    ],
  };
  // --- Balken ------------------------------------------------------------------------------------------------------------------
  const beam = limb([[-L, hubY, 0.07], [-0.45, hubY, 0.095], [0, hubY, 0.11], [0.45, hubY, 0.095], [L, hubY, 0.07]], { per: 6 });
  const hub = blob(0, hubY, 0.13, 0.13, 0, 30);
  const crest = poly([[-0.05, hubY + 0.1], [0.05, hubY + 0.1], [0, hubY + 0.2]], 1);
  const pointer = poly([[-0.03, hubY - 0.05], [0.03, hubY - 0.05], [0.007, hubY - 0.40], [-0.007, hubY - 0.40]]);
  const knobs = [blob(-L, hubY, 0.065, 0.065, 0, 18), blob(L, hubY, 0.065, 0.065, 0, 18)];
  const beamPart = {
    z: 2, pivot: [0, hubY], layers: [
      {
        shapes: [beam, crest], fill: goldH,
        deco(c, bb) {
          volume(c, bb, { dark: 'rgba(60,30,0,0.28)', light: 'rgba(255,250,210,0.3)' });
          rectFill(c, -0.7, hubY - 0.012, 0.7, hubY + 0.012, P.lapis, 0.95);
          for (let k = -4; k <= 4; k++) { if (k === 0) continue; ellipseFill(c, k * 0.1 + Math.sign(k) * 0.05, hubY, 0.022, 0.022, k % 2 ? P.carn : P.turq); }
        },
      },
      { shapes: [pointer], fill: { top: '#f5d676', bottom: '#b07a20' }, deco(c, bb) { cylinder(c, bb); } },
      { shapes: knobs, fill: turqV, deco(c, bb) { volume(c, bb); } },
      {
        shapes: [hub], fill: goldH,
        deco(c) { cylinder(c, { x0: -0.13, x1: 0.13, y0: hubY - 0.13, y1: hubY + 0.13 }); ellipseFill(c, 0, hubY, 0.075, 0.075, P.lapis); ellipseFill(c, 0, hubY, 0.03, 0.03, P.goldHi); sparkle(c, -0.07, hubY + 0.08, 0.035); },
      },
    ],
  };
  // --- Schalen ------------------------------------------------------------------------------------------------------------------
  const schale = (sign, accent) => {
    const ax = sign * L;
    const chains = [
      limb([[ax, hubY, 0.026], [ax - 0.15, hubY - chain * 0.5, 0.022], [ax - 0.28, rimY + 0.02, 0.026]], { per: 4 }),
      limb([[ax, hubY, 0.026], [ax, rimY + 0.02, 0.022]], { per: 4 }),
      limb([[ax, hubY, 0.026], [ax + 0.15, hubY - chain * 0.5, 0.022], [ax + 0.28, rimY + 0.02, 0.026]], { per: 4 }),
    ];
    const bowl = poly([[ax - 0.32, rimY + 0.01], [ax + 0.32, rimY + 0.01], [ax + 0.27, rimY - 0.07], [ax + 0.16, rimY - 0.125], [ax - 0.16, rimY - 0.125], [ax - 0.27, rimY - 0.07]], 2);
    const foot = rrect(ax - 0.1, rimY - 0.165, ax + 0.1, rimY - 0.11, 0.015);
    const rim = rrect(ax - 0.345, rimY - 0.005, ax + 0.345, rimY + 0.04, 0.02);
    const hookRing = ring(ax, hubY - 0.012, 0.045, 0.045, 0.022, 0.022, 20);
    return {
      z: 1, pivot: [ax, hubY], layers: [
        { shapes: chains, fill: goldV, deco(c, bb) { cylinder(c, bb); } },
        {
          shapes: [bowl, foot], fill: goldV,
          deco(c, bb) {
            cylinder(c, bb, { dark: 'rgba(60,30,0,0.3)', light: 'rgba(255,250,210,0.3)', at: 0.2 });
            rectFill(c, ax - 0.3, rimY - 0.045, ax + 0.3, rimY - 0.03, accent, 0.95);
            for (let k = -2; k <= 2; k++) ellipseFill(c, ax + k * 0.1, rimY - 0.088, 0.017, 0.017, k % 2 ? P.goldHi : accent, 0.95);
            sparkle(c, ax - 0.18, rimY - 0.04, 0.04);
          },
        },
        {
          shapes: [rim], fill: goldH,
          deco(c, bb) { cylinder(c, bb, { dark: 'rgba(60,30,0,0.3)', light: 'rgba(255,250,210,0.35)', at: 0.15 }); rectFill(c, ax - 0.34, rimY + 0.008, ax + 0.34, rimY + 0.024, accent, 0.9); },
        },
        { shapes: [hookRing], fill: goldH, deco(c, bb) { cylinder(c, bb); } },
      ],
    };
  };
  const spec = {
    id: 'waage', parts: { staender: stand, schale_herz: schale(-1, P.carn), schale_feder: schale(1, P.lapis), balken: beamPart },
    anchors: {
      pivot: [0, hubY], endHerz: [-L, hubY], endFeder: [L, hubY], tellerHerz: [-L, rimY + 0.045], tellerFeder: [L, rimY + 0.045],
      base: [0, 0], top: [0, 2.2],
    },
    meta: {
      name: 'Waage des Totengerichts', heightM: 2.2,
      ranges: { balken: [0, 0.5], schale_herz: [0, 0.15], schale_feder: [0, 0.15] },
      swing: { balken: [-0.5, 0.5] }, kinematik: 'waageSet(fig, theta): Schalen-Pivot = pivot + R(theta)*(∓L,0); L = halber Abstand endHerz/endFeder',
    },
  };
  return finish(spec, { h: opts.h ?? 2.2, centerX: true });
}

// ====== Herz (ib-Gefäß) ===================================================================================================
function heartOutline() {
  const pts = [];
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * TAU;
    pts.push([16 * Math.pow(Math.sin(t), 3), 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)]);
  }
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const sx = 0.92 / (x1 - x0), sy = 0.78 / (y1 - y0);
  return pts.map(([x, y]) => [(x - (x0 + x1) / 2) * sx, (y - y0) * sy]);
}
export function herz(opts = {}) {
  const body = heartOutline();
  const neck = rect(-0.075, 0.55, 0.075, 0.9);
  const rimTop = rrect(-0.14, 0.87, 0.14, 0.96, 0.035);
  const handles = [arcLimb(-0.44, 0.56, 0.13, 0.15, d2r(100), d2r(280), 0.05), arcLimb(0.44, 0.56, 0.13, 0.15, d2r(-100), d2r(80), 0.05)];
  const layers = [
    { shapes: handles, fill: goldH, deco(c, bb) { cylinder(c, bb); } },
    {
      shapes: [body], fill: carnV,
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(60,0,0,0.38)', light: 'rgba(255,200,170,0.28)' });
        // goldener Gürtel
        curve(c, [[-0.4, 0.42], [-0.2, 0.36], [0, 0.34], [0.2, 0.36], [0.4, 0.42]], P.gold, 0.06, { alpha: 0.95 });
        curve(c, [[-0.4, 0.45], [-0.2, 0.39], [0, 0.37], [0.2, 0.39], [0.4, 0.45]], P.goldHi, 0.012, { alpha: 0.8 });
        for (let k = -2; k <= 2; k++) ellipseFill(c, k * 0.14, 0.355 + Math.abs(k) * 0.024 * 0.9 + (k === 0 ? -0.005 : 0), 0.017, 0.017, P.turq);
        ellipseFill(c, -0.25, 0.64, 0.1, 0.055, '#ffffff', 0.34, -0.7);
        sparkle(c, -0.3, 0.66, 0.06);
      },
    },
    { shapes: [neck], fill: goldH, deco(c, bb) { cylinder(c, bb); } },
    { shapes: [rimTop], fill: goldH, deco(c, bb) { cylinder(c, bb, { at: 0.2 }); rectFill(c, -0.125, 0.895, 0.125, 0.915, P.lapis, 0.9); } },
  ];
  return mk('herz', 'Herz (ib-Gefäß)', { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] }, center: [0, 0.4] }, { kind: 'requisit', heightM: 0.2 }, { h: opts.h ?? 0.2 });
}

// ====== Maat-Feder ==========================================================================================================
export function feder_maat(opts = {}) {
  const bunt = opts.stil === 'bunt';
  const spineX = (s) => 0.05 * Math.sin(s * Math.PI * 0.9) - 0.01;
  const tan = (s) => { const e = 0.001; return [spineX(s + e) - spineX(s - e), 2 * e]; };
  const wf = (s) => {
    const u = (s - 0.17) / 0.83; if (u <= 0) return 0.01;
    const a = u < 0.45 ? Math.pow(Math.sin((u / 0.45) * Math.PI / 2), 0.75) : Math.pow(Math.cos(((u - 0.45) / 0.55) * Math.PI / 2), 0.62);
    return 0.115 * a;
  };
  const N = 15, left = [], right = [], barbs = [];
  const at = (s, side, w, lift = 0) => {
    const [tx, ty] = tan(s), m = Math.hypot(tx, ty); const nx = -ty / m, ny = tx / m;
    return [spineX(s) + nx * w * side + (tx / m) * lift, s + ny * w * side + (ty / m) * lift];
  };
  for (const side of [-1, 1]) {
    const arr = [];
    for (let k = 0; k <= N; k++) {
      const s = 0.18 + (0.82 * k) / N;
      const w = wf(s);
      arr.push(at(s, side, w * 0.82, 0));
      if (k < N) {
        const s2 = s + 0.41 / N;
        arr.push(at(s2, side, w * 1.0, 0.045));
        barbs.push([spineX(s), s, ...at(s2, side, w * 1.0, 0.045)]);
      }
    }
    (side < 0 ? left : right).push(...arr);
  }
  const vane = left.concat(right.reverse());
  const quill = limb([[spineX(0), 0, 0.03], [spineX(0.1), 0.1, 0.034], [spineX(0.2), 0.2, 0.03]], { per: 5 });
  const holder = rrect(spineX(0.07) - 0.045, 0.06, spineX(0.07) + 0.045, 0.15, 0.015);
  const layers = [
    {
      shapes: [vane], fill: bunt ? { stops: [[0, '#fffaf0'], [1, '#e9dfc4']], dir: 'h' } : { stops: [[0, '#ffffff'], [0.5, '#f8f1e0'], [1, '#e2d6b8']], dir: 'h' },
      deco(c, bb) {
        strokes(c, barbs.map(([x0, y0, x1, y1]) => [x0, y0, x1, y1]), '#b8a97e', 0.007, 0.65);
        if (bunt) { rectFill(c, -0.2, 0.42, 0.2, 0.5, P.lapis, 0.85); rectFill(c, -0.2, 0.58, 0.2, 0.64, P.carn, 0.85); rectFill(c, -0.2, 0.74, 0.2, 0.8, P.turq, 0.85); }
        curve(c, Array.from({ length: 12 }, (_, i) => { const s = 0.2 + i * 0.08; return [spineX(s), s]; }), '#c9a24a', 0.014, { alpha: 0.95 });
        sparkle(c, -0.07, 0.62, 0.035, { color: '#ffffff', alpha: 0.8 });
      },
    },
    { shapes: [quill], fill: { top: '#f5d676', bottom: '#b07a20' }, deco(c, bb) { cylinder(c, bb); } },
    { shapes: [holder], fill: goldH, deco(c, bb) { cylinder(c, bb); rectFill(c, spineX(0.1) - 0.04, 0.09, spineX(0.1) + 0.04, 0.105, P.lapis); } },
  ];
  return mk('feder_maat', 'Feder der Maat', { body: { z: 1, layers } },
    { base: [0, 0], tip: { rel: [0.5, 1] } }, { kind: 'requisit', heightM: 0.4 }, { h: opts.h ?? 0.4 });
}

export { tor_unterwelt, torOeffnen } from './eg_tor.js';
export { kanope } from './eg_kanope.js';
