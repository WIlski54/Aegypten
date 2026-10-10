// Rotkehlchen (Erithacus rubecula), 14 cm – rundlich, orangerote Brust, braune Oberseite, sehr freundlich.
// Posen: Standard (steht, Flügel angelegt) und {pose:'fly'} (Flügel offen).
// Teile: body, jaw (winziger Unterschnabel, Pivot Schnabelwurzel), wing (nah, Pivot Schulter), wing2 (fern, nur bei fly).
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { soft, fillPoly, strokePoly, loop, featherAt, featherLayers, featherLayer, makeWing, claws, bigEye, rotPt, scaleSpec } from './_a_kit.js';

const DEG = Math.PI / 180;

export default function make(opts = {}) {
  const fly = opts.pose === 'fly';
  const C = { back: '#8c6b48', backLo: '#7a5b3c', belly: '#f4ecd9', bib: '#e8622b', bibHi: '#f08a3a', grey: '#a9b4ba', beak: '#4b3628', leg: '#6d4e3b', eye: '#1e130b', wingMid: '#7a5a3d', wingDk: '#5d4330', tip: '#d1b184' };
  const P = fly ? {
    torso: [0.0, 0.05, 0.052, 0.042, 0.12], head: [0.047, 0.066, 0.03], S: [0.012, 0.062], beakBase: [0.071, 0.062], tail0: [-0.042, 0.048], tailAng: [168, 192],
  } : {
    torso: [0.0, 0.082, 0.053, 0.05, 0.5], head: [0.04, 0.124, 0.031], S: [0.008, 0.1], beakBase: [0.065, 0.122], tail0: [-0.038, 0.07], tailAng: [158, 188],
  };

  // ---- Körper: Rumpf + Kopf als runde Form, Schwanz aus Federn -----------------------------------------
  const torso = blob(P.torso[0], P.torso[1], P.torso[2], P.torso[3], P.torso[4], 48);
  const headB = blob(P.head[0], P.head[1], P.head[2], P.head[2] * 0.96, 0, 36);
  const nuck = blob((P.torso[0] + P.head[0]) / 2 + 0.003, (P.torso[1] + P.head[1]) / 2 + 0.004, 0.036, 0.034, 0, 28);
  const beakU = poly([[P.beakBase[0] - 0.012, P.beakBase[1] + 0.008], [P.beakBase[0] + 0.015, P.beakBase[1] + 0.0015], [P.beakBase[0] + 0.0175, P.beakBase[1] - 0.001], [P.beakBase[0] - 0.012, P.beakBase[1] - 0.003]], 1);
  const tailF = featherLayers(P.tail0[0], P.tail0[1], 4, (t) => ({ ang: (P.tailAng[0] + (P.tailAng[1] - P.tailAng[0]) * t) * DEG, len: 0.075 - Math.abs(t - 0.45) * 0.01, w: 0.024 }),
    (t, i) => [[0, '#6e5236'], [0.7, i % 2 ? '#7d5d3f' : '#6a4e34'], [1, '#9a7a56']], { rachis: 'rgba(255,240,215,0.18)' });

  // ---- Beine (nur Standard) ------------------------------------------------------------------------
  const legs = [];
  if (!fly) {
    [[0.002, true], [0.017, false]].forEach(([x, far]) => {
      const hipY = 0.052;
      const l = limb([[x, hipY, 0.008], [x + 0.004, 0.027, 0.0055], [x + 0.006, 0.006, 0.0045]], { per: 6 });
      const toes = [0.026, 0.021, 0.014].map((len, i) => limb([[x + 0.006, 0.006, 0.0042], [x + 0.006 + len * 0.6, 0.004, 0.0036], [x + 0.006 + len, 0.0028 + (i === 1 ? 0 : 0), 0.0028]], { per: 4 }));
      const back = limb([[x + 0.006, 0.006, 0.0042], [x - 0.012, 0.0035, 0.003]], { per: 4 });
      legs.push({ shapes: [l, back].concat(toes), far });
    });
  }

  // ---- Körperlayer ------------------------------------------------------------------------------
  const bodyLayers = [];
  bodyLayers.push(...tailF);
  if (!fly) bodyLayers.push({ shapes: legs[0].shapes, fill: '#5a4030', deco(c, bb) { } });
  if (!fly) bodyLayers.push({ shapes: legs[1].shapes, fill: C.leg, deco(c, bb) { } }); // beide Beine unter dem Rumpf: der Bauch deckt die Hüfte
  bodyLayers.push({ shapes: [torso, headB, nuck, beakU], fill: { top: C.back, bottom: C.backLo },
    deco(c, bb) {
      const [tx, ty, rx, ry, rot] = P.torso, [hx, hy, hr] = P.head;
      // Bauch hell
      const bel = blob(tx + 0.006, ty - 0.026, rx * 0.95, ry * 0.62, rot * 0.6, 32);
      soft(c, bel, C.belly, 0.012, 1);
      // Brust/Gesicht: blaugrauer Saum, darüber das Orangerot (Latz von der Stirn bis zur Brust)
      const bibOuter = loop([[hx + 0.032, hy + 0.012], [hx + 0.012, hy + 0.036], [hx - 0.012, hy + 0.028], [hx - 0.02, hy - 0.006], [tx - 0.012, ty + 0.012], [tx - 0.004, ty - 0.03], [tx + 0.03, ty - 0.046], [tx + 0.062, ty - 0.012], [tx + 0.062, ty + 0.03], [hx + 0.036, hy - 0.004]], 6);
      const bib = loop([[hx + 0.034, hy + 0.008], [hx + 0.012, hy + 0.03], [hx - 0.008, hy + 0.024], [hx - 0.014, hy - 0.004], [tx - 0.006, ty + 0.01], [tx + 0.004, ty - 0.026], [tx + 0.03, ty - 0.04], [tx + 0.056, ty - 0.01], [tx + 0.058, ty + 0.028], [hx + 0.036, hy - 0.008]], 6);
      soft(c, bibOuter, C.grey, 0.008, 0.95);
      soft(c, bib, C.bib, 0.009, 1);
      soft(c, blob(hx + 0.014, hy - 0.006, 0.02, 0.016, 0, 20), C.bibHi, 0.01, 0.7);
      // Wangenstrich
      strokePoly(c, [[hx + 0.034, hy - 0.016], [hx + 0.012, hy - 0.016]], 'rgba(60,40,25,0.25)', 0.002, 1);
      // große freundliche Augen
      c.ctx.save(); c.ctx.restore();
      bigEye(c, hx + 0.014, hy + 0.008, 0.0105, { color: C.eye, white: C.eye, look: 0.0 });
      fillPoly(c, [[hx + 0.056, hy + 0.003], [hx + 0.052, hy - 0.004], [hx + 0.062, hy - 0.002]], 'rgba(0,0,0,0.0)');
      volume(c, bb, { dark: 'rgba(50,30,15,0.2)', light: 'rgba(255,240,210,0.2)' });
    } });
  bodyLayers.push({ shapes: [beakU], fill: C.beak, stroke: null });

  // ---- Unterschnabel (winzig) ---------------------------------------------------------------------
  const bb0 = P.beakBase;
  const jawShape = poly([[bb0[0] - 0.012, bb0[1] - 0.002], [bb0[0] + 0.012, bb0[1] - 0.002], [bb0[0] + 0.0125, bb0[1] - 0.005], [bb0[0] + 0.006, bb0[1] - 0.011], [bb0[0] - 0.01, bb0[1] - 0.011]], 1);
  const jawPivot = [bb0[0] - 0.008, bb0[1] - 0.004];

  // ---- Flügel -------------------------------------------------------------------------------------
  const S = P.S;
  const mkWing = (far) => {
    if (!fly) {
      // angelegter Flügel: blattförmig von der Schulter nach hinten-unten, Handschwingen-Spitzen schauen heraus
      const sx = S[0], sy = S[1];
      const tips = [0, 1, 2, 3].map((i) => featherAt(sx - 0.06 - i * 0.004, sy - 0.032 + i * 0.002, (196 + i * 5) * DEG, 0.052 - i * 0.004, 0.02));
      const main = limb([[sx + 0.016, sy + 0.01, 0.03], [sx - 0.014, sy - 0.004, 0.052], [sx - 0.05, sy - 0.02, 0.046], [sx - 0.088, sy - 0.034, 0.016]], { per: 12 });
      return [
        { shapes: tips, fill: { top: '#5d4330', bottom: '#4e3827' }, deco(c) { } },
        { shapes: [main], fill: { top: '#9a7a54', bottom: '#7a5b3d' },
          deco(c, bb) {
            // Flügelbinden: helle Federspitzen in 2 Reihen, mutig und grob
            const { ctx, tf, S: SC } = c; ctx.save(); ctx.strokeStyle = 'rgba(214,184,140,0.85)'; ctx.lineWidth = Math.max(1, 0.0032 * SC); ctx.lineCap = 'round';
            for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) {
              const x = sx - 0.012 - q * 0.02 - r * 0.008, y = sy + 0.004 - q * 0.007 - r * 0.014; const [X, Y] = tf(x, y);
              ctx.beginPath(); ctx.arc(X, Y, 0.0095 * SC, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
            }
            ctx.restore();
            strokePoly(c, [[sx + 0.01, sy + 0.012], [sx - 0.05, sy - 0.01], [sx - 0.085, sy - 0.03]], 'rgba(60,40,25,0.3)', 0.002, 1);
            volume(c, bb, { dark: 'rgba(40,25,10,0.25)', light: 'rgba(255,235,200,0.2)' });
          } },
      ];
    }
    const theta = 106 * DEG + (far ? 0.22 : 0);
    const pal = (kind, i, t) => {
      if (kind === 'cover') return far ? [[0, '#6c4f36'], [1, '#8a6a4a']] : [[0, '#8a6948'], [0.7, '#9a7852'], [1, C.tip]];
      if (kind === 'sec') return far ? [[0, '#5a412e'], [1, '#79593d']] : [[0, '#6b4e35'], [0.7, C.wingMid], [1, '#a78559']];
      return far ? [[0, '#523927'], [1, '#6b4d35']] : [[0, '#5d4330'], [0.8, i % 2 ? '#6c4f36' : '#5a412e'], [1, '#b69770']];
    };
    return makeWing({ S, theta, L: 0.085, handFrac: 0.5, nSec: 5, nPrim: 6, secLen: 0.055, primLen: 0.075, fw: 0.022, pal, armFill: far ? '#6c4f36' : '#8a6948', armW: [0.026, 0.018, 0.01], covers: 2, coverLen: 0.035 }).layers;
  };

  const parts = {};
  parts.body = { z: 1, layers: bodyLayers };
  parts.jaw = { z: 0, pivot: jawPivot, layers: [{ shapes: [jawShape], fill: C.beak }] };
  parts.wing = { z: 3, pivot: S.slice(), layers: mkWing(false) };
  if (fly) parts.wing2 = { z: 0, pivot: S.slice(), layers: mkWing(true) };

  const K = 0.72; // gezeichnet in bequemen Zahlen, auf 14 cm skaliert
  return scaleSpec({
    id: 'robin',
    parts,
    anchors: { head: [P.head[0], P.head[1]], mouth: [P.beakBase[0] + 0.018, P.beakBase[1] - 0.004], eye: [P.head[0] + 0.014, P.head[1] + 0.008], back: [P.torso[0], P.torso[1] + 0.04], foot: [0.01, 0.0], shoulder: S.slice(), tailTip: [-0.11, fly ? 0.05 : 0.07] },
    meta: { name: 'Rotkehlchen', lengthM: 0.14, pose: fly ? 'fly' : 'stand',
      ranges: fly ? { jaw: [0, -0.5], wing: [0, 1.0], wing2: [0, 0.95] } : { jaw: [0, -0.5], wing: [0, -0.6] },
      swing: fly ? { wing: [-0.45, 1.0], wing2: [-0.45, 0.95] } : { wing: [-0.9, 0.2] } }, // fly: + = Flügel schlägt nach hinten/unten; stand: - = Flügel lüften
  }, K);
}
