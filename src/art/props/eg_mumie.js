// Gruppe O2 – Mumifizierung: mumie_bahre, leinenbahn, harzkrug.
//
// mumie_bahre (2 m): Parts `body` (löwenfüßige Bahre mit Löwenkopf rechts, Webgurt, darauf die ganz in Leinenbinden gewickelte Form
//   mit goldener Maskenandeutung links und Perlenkragen) und `tuch` (z davor: weißes Leinentuch mit Farbsaum über Brust bis Füße).
//   Keine Haut, kein Gesicht außer der Goldmaske-Andeutung. Würdevoll, Handwerk statt Horror.
// leinenbahn (2 m): `body` (zwei Pfosten mit Gabeln + durchhängende Leine) und `bahn1..bahn5` (Tücher und Binden, Pivot = Aufhängung an der Leine;
//   meta.ranges.bahnN = [0, 0.12] pendeln im Wind).
// harzkrug (0,4 m): `opts.variant` 0 Tonkrug mit Harzpfropfen, 1 Alabaster-Salbgefäß, 2 Fayence-Krug (türkis), 3 Topf mit Leinentuch-Verschluss.
import {
  P, goldH, goldV, lapisV, turqV, carnV, linenV, rect, rrect, shift, ring, arcLimb, limb, blob, poly, spline, TAU, ankhPolys,
  fillPoly, fillPolys, sparkle, cylinder, rectFill, ellipseFill, curve, strokes, volume, finish, rngOf, mix, shade, sineY,
} from './_eg_ritual_kit.js';
import { variantOf } from './_e_kit.js';

const mk = (id, name, parts, anchors, meta, o) => finish({ id, parts, anchors, meta: { name, ...meta } }, o);
const lerpFn = (pts) => (x) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) { const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0] || 1); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t; }
  return pts[pts.length - 1][1];
};

// ====== Bahre mit Mumie ==========================================================================================
export function mumie_bahre(opts = {}) {
  const bedTop = 0.5;
  // ---------------- Bahre: Rahmen mit Fuß- und Kopfbrett, Löwenbeine (Gold), kleine Löwenkopf-Zier am Fußbrett
  const rail = rrect(-1.0, 0.32, 1.0, bedTop, 0.03);
  const footboard = poly([[0.9, 0.32], [1.04, 0.32], [1.04, 0.7], [0.98, 0.76], [0.9, 0.72]], 1);
  const headboard = poly([[-1.04, 0.32], [-0.92, 0.32], [-0.92, 0.58], [-0.98, 0.62], [-1.04, 0.56]], 1);
  const leg = (x0, hind) => [
    limb(hind ? [[x0 + 0.02, 0.4, 0.17], [x0 - 0.03, 0.28, 0.12], [x0, 0.17, 0.085], [x0, 0.06, 0.11]] : [[x0, 0.4, 0.16], [x0 + 0.01, 0.28, 0.115], [x0, 0.16, 0.085], [x0, 0.06, 0.11]], { per: 6 }),
    blob(x0 + 0.05, 0.03, 0.11, 0.032, 0, 20),
  ];
  const nearLegs = [...leg(-0.78, true), ...leg(0.7, false)];
  const farLegs = [...leg(-0.62, true), ...leg(0.84, false)];
  const lionHead = [blob(1.0, 0.79, 0.075, 0.07, 0, 24), blob(1.07, 0.765, 0.05, 0.036, -0.15, 18), blob(0.95, 0.855, 0.024, 0.026, 0, 12)];
  const lionMane = [...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => blob(0.95 + Math.cos(i * 0.9 + 1.5) * 0.085, 0.79 + Math.sin(i * 0.9 + 1.5) * 0.085, 0.045, 0.045, 0, 12)), blob(0.95, 0.76, 0.09, 0.1, 0, 22)];
  const webbing = rect(-0.9, 0.3, 0.88, 0.33);

  // ---------------- Mumie
  const topCtrl = [[-0.62, 0.62, 0], [-0.46, 0.7, 0], [-0.25, 0.725, 0], [0.0, 0.72, 0], [0.25, 0.7, 0], [0.5, 0.668, 0], [0.7, 0.632, 0], [0.82, 0.595, 0], [0.88, 0.545, 0]];
  const topS = spline(topCtrl, 8);
  const topAt = lerpFn(topS.map(([x, y]) => [x, y]));
  const torso = poly([[-0.62, bedTop], ...topS.map(([x, y]) => [x, y]), [0.88, bedTop]]);
  const HX = -0.73, HY = 0.665, HR = 0.15;
  const head = poly([[HX - 0.15, bedTop], [HX - 0.135, 0.6], [HX - 0.1, 0.72], [HX - 0.05, 0.795], [HX + 0.05, 0.795], [HX + 0.1, 0.72], [HX + 0.135, 0.6], [HX + 0.15, bedTop]], 2);

  const goldHead = { stops: [[0, '#fff0b3'], [0.4, '#e0b040'], [1, '#8a5f1c']], dir: 'v' };
  const body = {
    z: 1, layers: [
      { shapes: farLegs, fill: { top: '#b8892a', bottom: '#6e4a16' }, deco(c, bb) { cylinder(c, bb, { dark: 'rgba(30,15,0,0.35)', light: 'rgba(255,230,160,0.2)', at: 0.15 }); } },
      { shapes: nearLegs, fill: goldH, deco(c, bb) { cylinder(c, bb, { dark: 'rgba(60,30,0,0.3)', light: 'rgba(255,250,210,0.3)', at: 0.2 }); for (const x0 of [-0.73, 0.75]) for (let k = -1; k <= 1; k++) curve(c, [[x0 + k * 0.045, 0.045], [x0 + k * 0.05, 0.012]], P.goldLo, 0.007, { alpha: 0.8 }); } },
      {
        shapes: [rail, footboard, headboard], fill: goldV,
        deco(c, bb) {
          cylinder(c, bb, { dark: 'rgba(60,30,0,0.18)', light: 'rgba(255,250,210,0.25)', at: 0.1 });
          // Einlagen-Fries am Rahmen: Lapis / Türkis / Karneol zwischen Goldstegen
          rectFill(c, -1.0, 0.335, 1.0, 0.352, P.goldLo, 0.5);
          rectFill(c, -0.98, 0.37, 0.88, 0.48, P.lapisLo, 0.95);
          for (let k = 0; k < 29; k++) { const x = -0.97 + k * 0.064; rectFill(c, x, 0.382, x + 0.05, 0.468, [P.lapis, P.turq, P.carn][k % 3], 1); rectFill(c, x, 0.382, x + 0.05, 0.41, '#ffffff', 0.18); }
          rectFill(c, -1.0, 0.485, 1.0, 0.5, P.gold, 1);
          // Fußbrett: Anch-Zeichen und Perlen
          fillPolys(c, ankhPolys(0.97, 0.45, 0.2, 1), P.lapis);
          rectFill(c, 0.9, 0.7, 1.04, 0.72, P.lapis, 0.9);
          sparkle(c, -0.9, 0.44, 0.04);
        },
      },
      { shapes: lionMane, fill: { top: '#b8892a', bottom: '#6e4a16' }, deco(c, bb) { volume(c, bb); } },
      {
        shapes: lionHead, fill: goldH,
        deco(c, bb) {
          cylinder(c, bb, { dark: 'rgba(60,30,0,0.25)', light: 'rgba(255,250,210,0.3)', at: 0.25 });
          ellipseFill(c, 0.95, 0.855, 0.013, 0.015, P.carn);
          ellipseFill(c, 1.03, 0.805, 0.013, 0.01, '#fff8e6'); ellipseFill(c, 1.034, 0.805, 0.008, 0.008, P.lapisLo);
          curve(c, [[1.0, 0.82], [1.03, 0.83], [1.06, 0.817]], '#1a1612', 0.006);
          ellipseFill(c, 1.115, 0.775, 0.011, 0.008, '#2a1a10');
          curve(c, [[1.105, 0.75], [1.07, 0.738], [1.03, 0.745]], P.goldLo, 0.006, { alpha: 0.9 });
        },
      },
      // Mumienform: Leinenbinden
      {
        shapes: [torso, head], fill: { top: '#fffaf0', bottom: '#e4d9c0' },
        deco(c, bb) {
          volume(c, bb, { dark: 'rgba(110,85,40,0.35)', light: 'rgba(255,255,255,0.2)' });
          const bands = (x0, x1, y, yy, step, dir, col, a) => { for (let x = x0; x < x1; x += step) curve(c, [[x, y], [x + dir * 0.09, yy]], col, 0.007, { alpha: a }); };
          bands(-0.62, -0.1, 0.5, 0.8, 0.05, -1, P.linenSh, 0.9);
          bands(-0.1, 0.9, 0.5, 0.8, 0.052, 1, P.linenSh, 0.9);
          bands(-0.6, 0.9, 0.5, 0.82, 0.052, 1, '#ffffff', 0.35);
          for (const x of [-0.5, 0.05, 0.5]) rectFill(c, x, bedTop, x + 0.012, topAt(x) - 0.01, P.linenSh, 0.7);
          // Perlenkragen auf der Brust (Lapis/Türkis/Gold/Karneol)
          const cols = [P.lapis, P.turq, P.gold, P.carn, P.lapis, P.turq];
          cols.forEach((col, i) => {
            const x0 = -0.6 + i * 0.045;
            const pts = []; for (let k = 0; k <= 6; k++) { const x = x0 + (k / 6) * 0.045; pts.push([x, topAt(x) - 0.002]); }
            const lower = []; for (let k = 6; k >= 0; k--) { const x = x0 + (k / 6) * 0.045; lower.push([x, topAt(x) - 0.1 - i * 0.002]); }
            fillPoly(c, pts.concat(lower), col, 0.95);
          });
          sparkle(c, -0.36, 0.69, 0.04, { alpha: 0.7 });
        },
      },
      // Goldene Maske (Andeutung): gestreiftes Kopftuch, Gesicht frontal zum Betrachter, kleiner Bart
      {
        shapes: [head], fill: goldHead,
        deco(c, bb) {
          cylinder(c, bb, { dark: 'rgba(60,30,0,0.28)', light: 'rgba(255,250,210,0.3)', at: 0.2 });
          // Streifen des Kopftuchs (Lapis), Stirnband
          for (let k = -5; k <= 5; k++) { const x = HX + k * 0.03; rectFill(c, x - 0.007, bedTop, x + 0.007, 0.82, P.lapis, 0.95); }
          rectFill(c, HX - 0.16, 0.74, HX + 0.16, 0.755, P.gold, 1); rectFill(c, HX - 0.16, 0.755, HX + 0.16, 0.768, P.lapisLo, 1);
          // Gesichtsfläche
          ellipseFill(c, HX, HY - 0.012, 0.07, 0.092, '#f7da7c');
          ellipseFill(c, HX - 0.02, HY + 0.03, 0.04, 0.05, '#fff0b3', 0.35);
          for (const sg of [-1, 1]) {
            curve(c, [[HX + sg * 0.012, HY + 0.034], [HX + sg * 0.034, HY + 0.046], [HX + sg * 0.058, HY + 0.034]], P.lapisLo, 0.01);
            ellipseFill(c, HX + sg * 0.034, HY + 0.02, 0.019, 0.011, '#fff8e6'); ellipseFill(c, HX + sg * 0.034, HY + 0.02, 0.009, 0.009, P.lapisLo);
            curve(c, [[HX + sg * 0.012, HY + 0.016], [HX + sg * 0.052, HY + 0.016], [HX + sg * 0.07, HY + 0.026]], '#1a1612', 0.006);
          }
          curve(c, [[HX, HY + 0.012], [HX - 0.004, HY - 0.025], [HX + 0.006, HY - 0.033]], P.goldLo, 0.007, { alpha: 0.9 });
          curve(c, [[HX - 0.025, HY - 0.062], [HX, HY - 0.07], [HX + 0.025, HY - 0.062]], P.carnLo, 0.01, { alpha: 0.95 });
          // Geierkopf-Uräus-Andeutung: kleine Goldkugel mit Karneol auf der Stirn
          ellipseFill(c, HX, 0.775, 0.016, 0.016, P.carn); ellipseFill(c, HX, 0.775, 0.008, 0.008, P.goldHi);
          // Zeremonialbart
          fillPoly(c, limb([[HX, HY - 0.075, 0.03], [HX + 0.004, 0.545, 0.026], [HX + 0.014, 0.515, 0.03]], { per: 4 }), P.lapis);
          sparkle(c, HX - 0.1, HY + 0.1, 0.03);
        },
      },
    ],
  };

  // ---------------- Tuch (liegt über Bauch bis Füßen, fällt seitlich bis über die Rahmenoberkante)
  const xa = -0.22, xb = 0.9, yH = 0.47;
  const topPts = []; for (let k = 0; k <= 30; k++) { const x = xa + ((xb - xa) * k) / 30; topPts.push([x, topAt(Math.min(x, 0.88)) + 0.022]); }
  const hem = []; for (let k = 30; k >= 0; k--) { const x = xa + ((xb - xa) * k) / 30; hem.push([x, yH + 0.01 * Math.sin(k * 0.9)]); }
  const cloth = poly([[xa - 0.03, yH + 0.03], [xa - 0.012, topPts[0][1] - 0.01], ...topPts, [xb + 0.02, yH + 0.05], ...hem], 0);
  const tuch = {
    z: 3, layers: [{
      shapes: [cloth], fill: { stops: [[0, '#fffdf6'], [0.55, '#f6efe0'], [1, '#d9cdb4']], dir: 'v' },
      deco(c, bb) {
        volume(c, bb, { dark: 'rgba(110,85,40,0.25)', light: 'rgba(255,255,255,0.15)' });
        for (let k = 0; k < 11; k++) {
          const x = -0.16 + k * 0.1;
          curve(c, [[x, topAt(Math.min(x, 0.86)) + 0.0], [x + 0.014, 0.55], [x - 0.008, yH + 0.01]], '#bfb08e', 0.012, { alpha: 0.55 });
          curve(c, [[x + 0.03, topAt(Math.min(x + 0.03, 0.86)) - 0.01], [x + 0.04, 0.55], [x + 0.025, yH + 0.02]], '#ffffff', 0.008, { alpha: 0.7 });
        }
        // Farbsaum
        rectFill(c, xa - 0.05, yH, xb + 0.05, yH + 0.035, P.lapis, 0.95);
        rectFill(c, xa - 0.05, yH + 0.035, xb + 0.05, yH + 0.045, P.gold, 1);
        rectFill(c, xa - 0.05, yH + 0.045, xb + 0.05, yH + 0.055, P.carn, 1);
        for (let k = 0; k < 24; k++) ellipseFill(c, xa + 0.02 + k * 0.047, yH + 0.017, 0.007, 0.007, P.goldHi, 0.9);
        for (let k = 0; k < 58; k++) curve(c, [[xa + k * 0.0198, yH + 0.01], [xa + k * 0.0198, yH - 0.025]], '#e8dcc0', 0.006, { alpha: 0.9 });
      },
    }],
  };

  const spec = {
    id: 'mumie_bahre', parts: { body, tuch },
    anchors: { base: [0, 0], oben: [0, 0.9], kopf: [HX, HY], brust: [-0.4, 0.72], fuesse: [0.75, 0.62], bettflaeche: [0, bedTop] },
    meta: { name: 'Mumie auf Löwenbahn (eingewickelt)', lengthM: 2.0, ranges: {}, swing: {} },
  };
  return finish(spec, { w: opts.w ?? 2.0 });
}

// ====== Leinenbahn =======================================================================================================
export function leinenbahn(opts = {}) {
  const postH = 1.36, px = 0.95;
  const ropeY = (x) => 1.27 - 0.12 * (1 - (x / px) * (x / px));
  const post = (x) => [limb([[x, 0.0, 0.11], [x, 0.6, 0.085], [x, 1.2, 0.075]], { per: 6 }), limb([[x, 1.16, 0.06], [x - 0.065, 1.36, 0.045]], { per: 4 }), limb([[x, 1.16, 0.06], [x + 0.065, 1.36, 0.045]], { per: 4 }), blob(x, 0.03, 0.16, 0.05, 0, 18)];
  const posts = [...post(-px), ...post(px)];
  const rope = limb(Array.from({ length: 9 }, (_, i) => { const x = -px + (2 * px * i) / 8; return [x, ropeY(x), 0.022]; }), { per: 6 });
  const bodyPart = {
    z: 1, layers: [
      {
        shapes: posts, fill: { stops: [[0, '#6a4426'], [0.35, '#a8744a'], [1, '#6a4426']], dir: 'h' },
        deco(c, bb) {
          for (const x of [-px, px]) for (let y = 0.15; y < 1.15; y += 0.2) curve(c, [[x - 0.07, y], [x, y - 0.02], [x + 0.07, y]], '#3e2614', 0.01, { alpha: 0.5 });
          for (const x of [-px, px]) ellipseFill(c, x, 0.03, 0.12, 0.03, '#8a8a7a', 0.9);
        },
      },
      { shapes: [rope], fill: { top: '#e6c98a', bottom: '#a98a52' }, deco(c) { for (let i = 0; i < 70; i++) { const x = -px + (2 * px * i) / 70; curve(c, [[x, ropeY(x) - 0.012], [x + 0.012, ropeY(x) + 0.012]], '#7a5a2a', 0.004, { alpha: 0.7 }); } } },
    ],
  };
  const defs = [
    { x: -0.68, w: 0.42, h: 0.66, stripe: P.lapis },
    { x: -0.34, w: 0.12, h: 0.98, strip: true },
    { x: 0.0, w: 0.5, h: 0.78, stripe: P.carn },
    { x: 0.37, w: 0.12, h: 0.9, strip: true },
    { x: 0.68, w: 0.4, h: 0.62, stripe: P.turq },
  ];
  const parts = { body: bodyPart };
  const ranges = {};
  defs.forEach((d, i) => {
    const top = ropeY(d.x) + 0.035, bot = top - d.h, x0 = d.x - d.w / 2, x1 = d.x + d.w / 2;
    const hem = []; const nw = d.strip ? 3 : 7;
    for (let k = nw * 2; k >= 0; k--) { const t = k / (nw * 2); hem.push([x0 + (x1 - x0) * t, bot + 0.012 * Math.sin(k * 1.7) + (d.strip ? 0 : 0.01 * Math.sin(k * 0.8))]); }
    const shape = poly([[x0 - 0.005, top], [x1 + 0.005, top - 0.01], [x1 + 0.01, (top + bot) / 2], ...hem, [x0 - 0.01, (top + bot) / 2]], 0);
    parts['bahn' + (i + 1)] = {
      z: 2 + i * 0.01, pivot: [d.x, ropeY(d.x)], layers: [{
        shapes: [shape], fill: { stops: [[0, '#fffdf6'], [0.5, '#f6efe0'], [1, '#d9cdb4']], dir: 'v' },
        deco(c, bb) {
          volume(c, bb, { dark: 'rgba(110,85,40,0.28)', light: 'rgba(255,255,255,0.12)' });
          const n = d.strip ? 2 : 5;
          for (let k = 1; k < n; k++) { const x = x0 + (k / n) * d.w; curve(c, [[x, top - 0.05], [x + 0.012, (top + bot) / 2], [x - 0.006, bot + 0.04]], '#bfb08e', 0.01, { alpha: 0.5 }); }
          if (d.strip) { for (let y = top - 0.08; y > bot; y -= 0.06) curve(c, [[x0, y], [x1, y - 0.02]], '#d9cdb4', 0.006, { alpha: 0.9 }); }
          else {
            rectFill(c, x0 - 0.02, bot + 0.07, x1 + 0.02, bot + 0.1, d.stripe, 0.95); rectFill(c, x0 - 0.02, bot + 0.1, x1 + 0.02, bot + 0.112, P.gold, 0.95);
            rectFill(c, x0 - 0.02, bot + 0.04, x1 + 0.02, bot + 0.05, d.stripe, 0.7);
          }
          rectFill(c, x0 - 0.02, top - 0.06, x1 + 0.02, top - 0.052, '#cfc2a2', 0.7);   // Umschlag über der Leine
          for (let k = 0; k < Math.floor(d.w / 0.012); k++) curve(c, [[x0 + k * 0.012 + 0.004, bot + 0.012], [x0 + k * 0.012 + 0.004, bot - 0.012]], '#efe5cc', 0.005, { alpha: 0.9 });
        },
      }],
    };
    ranges['bahn' + (i + 1)] = [0, 0.12];
  });
  const spec = {
    id: 'leinenbahn', parts,
    anchors: { base: [0, 0], leine: [0, 1.15], linkesEnde: [-px, 1.27], rechtesEnde: [px, 1.27] },
    meta: { name: 'Leinenbahnen auf der Leine', lengthM: 2.0, ranges, swing: {} },
  };
  return finish(spec, { w: opts.w ?? 2.0 });
}

// ====== Harzkrug =========================================================================================================
export function harzkrug(opts = {}) {
  const v = variantOf(opts, 4);
  const resin = '#3a2012', resinHi = '#8a4a1c';
  let shapes, fill, deco, extraLayers = [], name = 'Harzkrug';
  if (v === 0) {
    const body = limb([[0, 0.01, 0.2], [0, 0.08, 0.34], [0, 0.2, 0.44], [0, 0.3, 0.34], [0, 0.36, 0.2], [0, 0.42, 0.18]], { per: 8, caps: false });
    const lip = rrect(-0.15, 0.4, 0.15, 0.46, 0.025);
    const handles = [arcLimb(-0.2, 0.33, 0.1, 0.1, Math.PI * 0.55, Math.PI * 1.45, 0.045), arcLimb(0.2, 0.33, 0.1, 0.1, -Math.PI * 0.45, Math.PI * 0.45, 0.045)];
    const plug = poly([[-0.12, 0.45], [0.12, 0.45], [0.1, 0.5], [0.04, 0.545], [-0.03, 0.55], [-0.09, 0.51]], 1);
    shapes = [body, foot(0.2)];
    fill = { stops: [[0, '#8a4e28'], [0.3, '#d99058'], [0.65, '#b9824f'], [1, '#6a3c1c']], dir: 'h' };
    deco = (c, bb) => {
      volume(c, bb, { dark: 'rgba(40,15,0,0.28)', light: 'rgba(255,220,170,0.15)' });
      rectFill(c, -0.25, 0.27, 0.25, 0.3, P.lapis, 0.95); rectFill(c, -0.25, 0.3, 0.25, 0.31, P.goldHi, 0.9); rectFill(c, -0.25, 0.14, 0.25, 0.16, P.carn, 0.95);
      for (let i = -5; i <= 5; i++) ellipseFill(c, i * 0.04, 0.285, 0.008, 0.008, P.goldHi, 0.9);
      sparkle(c, -0.14, 0.2, 0.04, { alpha: 0.55 });
    };
    extraLayers = [
      { shapes: handles, fill: { top: '#c47a47', bottom: '#8a4e28' }, deco(c, bb) { cylinder(c, bb); } },
      { shapes: [lip], fill: { top: '#d99058', bottom: '#8a4e28' }, deco(c, bb) { cylinder(c, bb, { at: 0.2 }); rectFill(c, -0.15, 0.425, 0.15, 0.44, P.lapis, 0.9); } },
      {
        shapes: [plug, limb([[0.11, 0.45, 0.05], [0.115, 0.38, 0.04], [0.11, 0.33, 0.035]], { per: 4 }), blob(0.108, 0.318, 0.026, 0.03)], fill: { stops: [[0, '#8a4a1c'], [0.5, '#3a2012'], [1, '#1c0e06']], dir: 'v' },
        deco(c) { sparkle(c, -0.04, 0.52, 0.03, { color: '#ffd58a', alpha: 0.8 }); },
      },
    ];
    name = 'Harzkrug (Ton, mit Harz)';
  } else if (v === 1) {
    const body = limb([[0, 0.01, 0.3], [0, 0.1, 0.44], [0, 0.2, 0.48], [0, 0.29, 0.36], [0, 0.34, 0.2]], { per: 8, caps: false });
    const lip = rrect(-0.26, 0.335, 0.26, 0.385, 0.022);
    shapes = [body, foot(0.3)];
    fill = { stops: [[0, '#cbbd9a'], [0.28, '#fbf3df'], [0.6, '#eadfc4'], [1, '#b9aa84']], dir: 'h' };
    deco = (c, bb) => {
      volume(c, bb, { dark: 'rgba(90,60,20,0.22)', light: 'rgba(255,255,255,0.15)' });
      rectFill(c, -0.3, 0.26, 0.3, 0.29, P.lapis, 0.95); rectFill(c, -0.3, 0.29, 0.3, 0.3, P.gold, 0.95);
      rectFill(c, -0.3, 0.08, 0.3, 0.1, P.lapis, 0.95); rectFill(c, -0.3, 0.1, 0.3, 0.108, P.gold, 0.95);
      for (let i = 0; i < 7; i++) { const x = -0.18 + i * 0.06; fillPoly(c, poly([[x - 0.02, 0.15], [x, 0.23], [x + 0.02, 0.15]], 1), i % 2 ? P.turq : P.carn, 0.95); }
      sparkle(c, -0.18, 0.2, 0.04);
    };
    extraLayers = [
      { shapes: [lip], fill: goldH, deco(c, bb) { cylinder(c, bb, { at: 0.2 }); rectFill(c, -0.26, 0.355, 0.26, 0.365, P.lapis, 0.9); } },
      { shapes: [blob(-0.27, 0.36, 0.02, 0.02), blob(0.27, 0.36, 0.02, 0.02)], fill: goldH },
      { shapes: [blob(0, 0.4, 0.07, 0.05, 0, 18)], fill: { stops: [[0, '#8a4a1c'], [1, '#3a2012']], dir: 'v' }, deco(c) { sparkle(c, -0.025, 0.415, 0.025, { color: '#ffd58a', alpha: 0.9 }); } },
    ];
    name = 'Salbgefäß (Alabaster)';
  } else if (v === 2) {
    const body = limb([[0, 0.01, 0.22], [0, 0.1, 0.38], [0, 0.26, 0.46], [0, 0.4, 0.3], [0, 0.5, 0.16], [0, 0.55, 0.15]], { per: 8, caps: false });
    const lip = poly([[-0.13, 0.52], [0.13, 0.52], [0.17, 0.6], [-0.17, 0.6]], 1);
    shapes = [body, foot(0.22)];
    fill = { stops: [[0, '#1f7f78'], [0.3, '#6fd6c8'], [0.6, '#3bb3a8'], [1, '#17625d']], dir: 'h' };
    deco = (c, bb) => {
      volume(c, bb, { dark: 'rgba(0,40,40,0.28)', light: 'rgba(220,255,250,0.2)' });
      rectFill(c, -0.28, 0.4, 0.28, 0.42, '#14307a', 0.95); rectFill(c, -0.28, 0.14, 0.28, 0.16, '#14307a', 0.95);
      for (let i = -3; i <= 3; i++) { const x = i * 0.075; fillPoly(c, poly([[x - 0.036, 0.16], [x, 0.38], [x + 0.036, 0.16]], 2), '#14307a', 0.9); fillPoly(c, poly([[x - 0.02, 0.17], [x, 0.3], [x + 0.02, 0.17]], 2), '#8fe0d4', 0.85); }
      sparkle(c, -0.16, 0.3, 0.04);
    };
    extraLayers = [{ shapes: [lip], fill: { stops: [[0, '#14307a'], [1, '#0f1c3c']], dir: 'v' }, deco(c, bb) { cylinder(c, bb, { at: 0.2 }); rectFill(c, -0.17, 0.555, 0.17, 0.565, P.gold, 0.9); } }];
    name = 'Fayence-Krug';
  } else {
    const body = limb([[0, 0.01, 0.3], [0, 0.08, 0.44], [0, 0.2, 0.46], [0, 0.29, 0.4], [0, 0.33, 0.36]], { per: 8, caps: false });
    shapes = [body, foot(0.3)];
    fill = { stops: [[0, '#7a4a28'], [0.3, '#c98a56'], [0.65, '#a96f3c'], [1, '#5a3418']], dir: 'h' };
    deco = (c, bb) => {
      volume(c, bb, { dark: 'rgba(40,15,0,0.28)', light: 'rgba(255,220,170,0.12)' });
      rectFill(c, -0.25, 0.11, 0.25, 0.14, P.mudLo, 0.7);
      for (let i = -4; i <= 4; i++) curve(c, [[i * 0.05 - 0.02, 0.09], [i * 0.05, 0.15]], '#f4e2b8', 0.006, { alpha: 0.7 });
    };
    const cloth = poly([[-0.21, 0.31], [-0.17, 0.4], [-0.1, 0.47], [-0.05, 0.53], [0.02, 0.55], [0.07, 0.5], [0.12, 0.46], [0.18, 0.39], [0.21, 0.31]], 2);
    extraLayers = [
      {
        shapes: [cloth, limb([[0.08, 0.34, 0.03], [0.12, 0.28, 0.025]], { per: 3 })], fill: { stops: [[0, '#fffdf6'], [0.6, '#eadfc8'], [1, '#c9bb9a']], dir: 'v' },
        deco(c, bb) {
          volume(c, bb, { dark: 'rgba(110,85,40,0.25)', light: 'rgba(255,255,255,0.12)' });
          for (let k = -3; k <= 3; k++) curve(c, [[k * 0.05, 0.34], [k * 0.035, 0.44], [k * 0.01, 0.52]], '#bfb08e', 0.007, { alpha: 0.6 });
          curve(c, [[-0.2, 0.335], [0, 0.31], [0.2, 0.335]], '#7a5a2a', 0.022, { alpha: 1 });
          curve(c, [[-0.2, 0.34], [0, 0.318], [0.2, 0.34]], '#e6c98a', 0.007, { alpha: 0.9 });
        },
      },
      { shapes: [limb([[-0.17, 0.32, 0.05], [-0.18, 0.25, 0.04], [-0.17, 0.2, 0.036]], { per: 4 }), blob(-0.17, 0.19, 0.03, 0.035), limb([[0.12, 0.3, 0.04], [0.125, 0.23, 0.03]], { per: 3 }), blob(0.125, 0.215, 0.024, 0.03)], fill: { stops: [[0, '#9a5a22'], [1, '#3a2012']], dir: 'v' }, deco(c) { sparkle(c, -0.175, 0.24, 0.02, { color: '#ffd58a', alpha: 0.9 }); } },
    ];
    name = 'Topf mit Leinenverschluss';
  }
  const layers = [{ shapes, fill, deco }, ...extraLayers];
  const heights = [0.4, 0.34, 0.45, 0.4];
  return mk('harzkrug', name, { body: { z: 1, layers } },
    { base: [0, 0], top: { rel: [0.5, 1] } }, { kind: 'requisit', heightM: 0.4, varianten: ['tonkrug', 'alabaster', 'fayence', 'topf_tuch'] }, { h: opts.h ?? 0.4 });
}
function foot(w) { return rrect(-w * 0.45, 0, w * 0.45, 0.03, 0.01); }
