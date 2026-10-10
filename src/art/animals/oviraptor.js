// Oviraptor – gefiederter Eierbrüter der Oberkreide, ~1,8 m. Zahnloser Papageienschnabel, hoher Kamm,
// Flügelfedern an den Armen, Schwanzfächer. Posen: Standard (stehend, Federn angelegt) und {pose:'brood'} (hockt flach über dem Nest,
// Flügelfedern seitlich über das Gelege ausgebreitet; Körper tief, Boden y=0).
// Teile: body (Rumpf/Hals/Kopf/Schwanz+Fächer/Beine), jaw (Unterschnabel, Pivot Kiefergelenk), wing (Arm+Federn, Pivot Schulter).
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { loop, soft, fillPoly, strokePoly, wedge, bar, underBand, underBandOf, topOf, theropodLeg, claws, bigEye, rotPt, featherAt, featherLayer, featherLayers, dorsalSpots, scaleSpec } from './_a_kit.js';

const DEG = Math.PI / 180;

function makeRaw(opts = {}) {
  const brood = opts.pose === 'brood';
  const C = {
    back: '#a97d52', backLo: '#9a7048', belly: '#f6eedb', neck: '#e9dcc0', crest: '#e2512c', crestLo: '#f39a3d', beak: '#f2b13a', beakLo: '#e08f2c', skin: '#9fd0d6',
    teal: '#2c6e78', tealLo: '#1f5360', tealHi: '#4a9aa0', tip: '#fbf4e2', brown: '#6a4630', leg: '#e8c98a', legFar: '#c9a76a', claw: '#3c2a1c', eye: '#22140a', pink: '#d9776a',
  };

  // ------------------------------------------------------------------------------------------
  // Pose-Parameter
  // ------------------------------------------------------------------------------------------
  const P = brood ? {
    torso: [0.04, 0.52, 0.52, 0.34, 0.03], chestB: [0.32, 0.52, 0.32, 0.31],
    neck: [[0.34, 0.52, 0.42], [0.52, 0.62, 0.3], [0.6, 0.78, 0.21], [0.56, 0.92, 0.17], [0.62, 1.0, 0.15]],
    head0: [0.65, 1.0], headRot: -0.2,
    tail: [[-0.3, 0.5, 0.36], [-0.62, 0.45, 0.27], [-0.9, 0.37, 0.15], [-1.08, 0.31, 0.06]], fan: [-1.05, 0.31],
    fanAng: [128, 205], shoulder: [0.16, 0.7],
  } : {
    torso: [0.06, 1.0, 0.43, 0.29, 0.08], chestB: [0.28, 1.02, 0.28, 0.27],
    neck: [[0.3, 1.02, 0.38], [0.5, 1.12, 0.27], [0.57, 1.28, 0.2], [0.52, 1.44, 0.16], [0.57, 1.58, 0.145]],
    head0: [0.63, 1.64], headRot: -0.1,
    tail: [[-0.3, 1.02, 0.34], [-0.62, 1.02, 0.24], [-0.92, 1.07, 0.13], [-1.08, 1.13, 0.05]], fan: [-1.06, 1.12],
    fanAng: [135, 215], shoulder: [0.3, 1.07],
  };
  const H0 = P.head0, HR = P.headRot, HS = 1.25;
  const H = (p) => rotPt([H0[0] + p[0] * HS, H0[1] + p[1] * HS], H0[0], H0[1], HR);
  const Hs = (pts) => pts.map(H);

  // ---- Rumpf, Hals, Schwanz ------------------------------------------------------------------
  const torso = blob(P.torso[0], P.torso[1], P.torso[2], P.torso[3], P.torso[4], 56);
  const chestB = blob(P.chestB[0], P.chestB[1], P.chestB[2], P.chestB[3], 0, 40);
  const neck = limb(P.neck, { per: 14 });
  const tail = limb(P.tail, { per: 14 });

  // ---- Kopf (lokal, Länge ~0.3): hoher Kamm, kurzer tiefer Schnabel, Kinn kurz --------------------
  const headL = [
    [0.298, -0.088], [0.318, -0.04], [0.292, 0.02], [0.22, 0.065], [0.14, 0.09], [0.085, 0.112], [0.065, 0.2], [0.005, 0.275], [-0.08, 0.262], [-0.14, 0.17],
    [-0.17, 0.05], [-0.15, -0.05], [-0.07, -0.09], [0.05, -0.078], [0.15, -0.062], [0.24, -0.068],
  ];
  const head = loop(Hs(headL), 6);
  const crestPoly = loop(Hs([[0.09, 0.1], [0.075, 0.2], [0.01, 0.285], [-0.08, 0.27], [-0.12, 0.17], [-0.02, 0.1]]), 6);
  const beakPoly = loop(Hs([[0.3, -0.087], [0.322, -0.04], [0.29, 0.02], [0.2, 0.05], [0.14, 0.0], [0.17, -0.07]]), 6);

  // ---- Beine ----------------------------------------------------------------------------------
  const mkLegShapes = (foot, far) => {
    if (!brood) {
      const lg = theropodLeg({ hip: [0.02, 0.8], foot, L: [0.36, 0.4, 0.32], metaAng: 1.2, widths: [0.3, 0.34, 0.15, 0.105, 0.075, 0.068], toe: 0.22, toeW: 0.07, kneeSide: 1 });
      // Federhosen: kurze Federn am hinteren/unteren Rand des Oberschenkels
      const hip = [0.02, 0.8], K = lg.knee;
      const fringe = [0, 1, 2, 3, 4, 5].map((i) => {
        const t = 0.15 + i * 0.15; const bx = hip[0] + (K[0] - hip[0]) * t - 0.07, by = hip[1] + (K[1] - hip[1]) * t - 0.07;
        return featherAt(bx, by, (258 - i * 3) * DEG, 0.16 - i * 0.012, 0.075);
      });
      return { shapes: lg.shapes.concat(far ? [] : fringe), claws: claws(lg.clawPts, 0.05, 0.034, -0.1), thighTop: lg.thigh, fringe };
    }
    // hockend: Oberschenkel nach vorn, Unterschenkel zurück, Fuß flach am Boden
    const k = far ? 0.06 : 0;
    const th = limb([[0.0, 0.34, 0.3], [0.18 + k, 0.32, 0.26], [0.36 + k, 0.24, 0.17]], { per: 10 });
    const sh = limb([[0.36 + k, 0.24, 0.17], [0.22 + k, 0.13, 0.11], [0.08 + k, 0.07, 0.08]], { per: 10 });
    const mt = limb([[0.08 + k, 0.07, 0.08], [0.3 + k, 0.045, 0.065]], { per: 6 });
    const toes = [0, 1, 2].map((i) => limb([[0.3 + k, 0.04, 0.06], [0.4 + k + i * 0.012, 0.03 + i * 0.002 - 0.006 * i, 0.05], [0.5 + k + i * 0.01, 0.022, 0.03]], { per: 5 }));
    return { shapes: [th, sh, mt].concat(toes), claws: claws([[0.53 + k, 0.025], [0.545 + k, 0.022], [0.55 + k, 0.02]], 0.05, 0.03, -0.05), thighTop: th };
  };
  const legFar = mkLegShapes(brood ? 0.0 : -0.1, true), legNear = mkLegShapes(brood ? 0.0 : 0.15, false);

  // ---- Schwanzfächer (hinter Schwanz/Körper) -----------------------------------------------------
  const fanN = 8;
  const fanLayers = featherLayers(P.fan[0], P.fan[1], fanN,
    (t, i) => ({ ang: (P.fanAng[0] + (P.fanAng[1] - P.fanAng[0]) * t) * DEG, len: 0.46 - Math.abs(t - 0.5) * 0.16, w: 0.085 }),
    (t, i) => [[0, C.brown], [0.55, i % 2 ? C.tealLo : C.teal], [0.82, i % 2 ? C.teal : C.tealHi], [1, C.tip]],
    { rachis: 'rgba(255,245,225,0.3)' });
  const tailTipBlob = blob(P.fan[0] + 0.02, P.fan[1], 0.05, 0.04, 0, 16);

  // ---- Körperlayer -------------------------------------------------------------------------------
  const bodyShapes = [torso, chestB, neck, tail, head, crestPoly, beakPoly];
  const bellyBand = underBandOf([torso, chestB, neck, tail], -1.0, 0.5, (x) => (x > 0.3 ? 0.07 : x > -0.5 ? 0.18 : 0.06), 80);
  const bodyLayers = [];
  bodyLayers.push(...legFar.shapes.length ? [{ shapes: legFar.shapes, fill: { top: C.legFar, bottom: '#e6d1a0' }, deco(c, bb) { volume(c, bb, { dark: 'rgba(60,40,20,0.3)', light: 'rgba(255,245,220,0.1)' }); } },
    { shapes: legFar.claws, fill: C.claw, stroke: null }] : []);
  bodyLayers.push(...fanLayers);
  bodyLayers.push({
    shapes: bodyShapes, fill: { top: C.back, bottom: C.backLo },
    deco(c, bb) {
      // Hals/Brust/Bauch hell, Rücken braun: weicher Übergang
      soft(c, bellyBand, C.belly, 0.07, 1);
      soft(c, neck, C.neck, 0.1, 0.85);
      const nk = P.neck;
      soft(c, limb(nk.map((p, i) => [p[0] - 0.02, p[1], p[2] * 0.62]), { per: 10 }), C.belly, 0.07, 0.9);
      soft(c, head, C.neck, 0.07, 0.75);
      // große Federschuppen am Rücken (mutig statt Mikrotextur)
      const { ctx, tf, S } = c; ctx.save(); ctx.strokeStyle = 'rgba(70,40,20,0.35)'; ctx.lineWidth = Math.max(1, 0.012 * S); ctx.lineCap = 'round';
      const tp = P.torso;
      for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) {
        const x = tp[0] - 0.3 + q * 0.12 + (r % 2) * 0.06, y = tp[1] + 0.12 - r * 0.07;
        const [X, Y] = tf(x, y); ctx.beginPath(); ctx.arc(X, Y, 0.045 * S, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
      ctx.restore();
      // Gesicht: nackte Haut um Auge, Kamm rotorange, Schnabel gelb-orange
      soft(c, Hs([[0.02, 0.0], [0.16, 0.0], [0.17, 0.08], [0.02, 0.1], [-0.03, 0.05]]), C.skin, 0.025, 0.9);
      soft(c, crestPoly, C.crest, 0.04, 0.96);
      soft(c, Hs([[0.04, 0.2], [0.0, 0.25], [-0.07, 0.24], [-0.02, 0.17]]), C.crestLo, 0.03, 0.85);
      soft(c, beakPoly, C.beak, 0.02, 1);
      soft(c, Hs([[0.2, -0.08], [0.32, -0.04], [0.28, 0.02]]), C.beakLo, 0.015, 0.7);
      strokePoly(c, Hs([[0.31, -0.07], [0.27, -0.045], [0.2, -0.06], [0.1, -0.07]]), 'rgba(90,50,20,0.7)', 0.007, 1);
      const nn = H([0.23, 0.035]); fillPoly(c, [[nn[0] - 0.008, nn[1] - 0.005], [nn[0] + 0.01, nn[1] + 0.004], [nn[0], nn[1] + 0.012]], 'rgba(80,40,10,0.7)');
      const e = H([0.085, 0.035]); bigEye(c, e[0], e[1], 0.042, { color: C.eye });
      volume(c, bb, { dark: 'rgba(60,35,15,0.18)', light: 'rgba(255,245,220,0.15)' });
    },
  });
  bodyLayers.push({ shapes: legNear.shapes, fill: { top: C.leg, bottom: '#f1e0b2' },
    deco(c, bb) {
      // Federhosen: weiße Federbüschel am Oberschenkel
      const tt = legNear.thighTop;
      soft(c, tt, C.belly, 0.05, 0.9);
      (legNear.fringe || []).forEach((f) => soft(c, f, C.belly, 0.01, 0.95));
      (legNear.fringe || []).forEach((f, i) => { const a = f[0], b = f[Math.floor(f.length / 2)]; strokePoly(c, [[a[0], a[1]], [b[0], b[1]]], 'rgba(150,120,80,0.28)', 0.006, 1); });
      volume(c, bb, { dark: 'rgba(60,40,20,0.22)', light: 'rgba(255,245,220,0.1)' });
    } });
  bodyLayers.push({ shapes: legNear.claws, fill: C.claw, stroke: null });

  // ---- Unterschnabel -----------------------------------------------------------------------------
  const jawPivot = H([-0.02, -0.06]);
  const jawShape = loop(Hs([[-0.03, -0.05], [0.1, -0.066], [0.22, -0.07], [0.275, -0.076], [0.272, -0.118], [0.2, -0.148], [0.1, -0.155], [0.0, -0.145], [-0.05, -0.1]]), 6);
  const lining = loop(Hs([[-0.02, -0.02], [0.1, -0.03], [0.26, -0.05], [0.26, -0.09], [0.1, -0.1], [-0.03, -0.09]]), 5);

  // ---- Flügel (Pivot Schulter) ---------------------------------------------------------------------
  const S = P.shoulder;
  const wingLayers = [];
  const wcol = (i, n) => [[0, '#7a5a40'], [0.35, i % 2 ? C.tealLo : C.teal], [0.8, i % 2 ? C.teal : C.tealHi], [1, C.tip]];
  if (!brood) {
    // angelegt: Federn zeigen nach hinten-unten entlang der Flanke
    const W = [S[0] - 0.2, S[1] - 0.1]; // Handgelenk
    wingLayers.push(...featherLayers(W[0], W[1], 8, (t, i) => ({ ang: (200 - t * 34) * DEG, len: 0.82 - t * 0.2, w: 0.12 }), (t, i) => wcol(i), { rachis: 'rgba(255,245,225,0.3)' }));
    wingLayers.push(...featherLayers(S[0] - 0.08, S[1] - 0.06, 6, (t, i) => ({ x: S[0] - 0.02 - t * 0.24, y: S[1] - 0.04 - t * 0.05, ang: (192 - t * 8) * DEG, len: 0.5 - t * 0.04, w: 0.12 }), (t, i) => [[0, '#a07850'], [0.6, '#8a6342'], [1, '#c9a173']], { rachis: 'rgba(255,245,225,0.25)' }));
    // Arm / Schulter (Deckfedern)
    wingLayers.push({ shapes: [blob(S[0] - 0.08, S[1] - 0.05, 0.2, 0.12, 0.2, 32)], fill: { top: '#b88a5c', bottom: '#9a7048' },
      deco(c, bb) { soft(c, [[S[0] - 0.3, S[1] - 0.12], [S[0] + 0.05, S[1] - 0.12], [S[0] + 0.05, S[1] - 0.22], [S[0] - 0.3, S[1] - 0.22]], C.neck, 0.04, 0.6); volume(c, bb, { dark: 'rgba(60,35,15,0.2)', light: 'rgba(255,245,220,0.2)' }); } });
  } else {
    // ausgebreitet: Federvorhang über das Gelege
    wingLayers.push(...featherLayers(S[0], S[1], 12, (t, i) => ({ ang: (192 + t * 155) * DEG, len: 0.76 - Math.abs(t - 0.5) * 0.24, w: 0.15 }), (t, i) => wcol(i), { rachis: 'rgba(255,245,225,0.3)' }));
    wingLayers.push(...featherLayers(S[0], S[1], 9, (t, i) => ({ ang: (205 + t * 130) * DEG, len: 0.46 - Math.abs(t - 0.5) * 0.12, w: 0.15 }), (t, i) => [[0, '#a07850'], [0.6, '#8a6342'], [1, '#d6b184']], { rachis: 'rgba(255,245,225,0.25)' }));
    wingLayers.push({ shapes: [blob(S[0], S[1] - 0.02, 0.2, 0.14, 0, 28)], fill: { top: '#b88a5c', bottom: '#9a7048' }, deco(c, bb) { volume(c, bb, { dark: 'rgba(60,35,15,0.2)', light: 'rgba(255,245,220,0.2)' }); } });
  }

  const parts = {};
  parts.body = { z: 1, layers: bodyLayers };
  parts.jaw = { z: 0, pivot: jawPivot, layers: [
    { shapes: [lining], fill: C.pink, stroke: null },
    { shapes: [jawShape], fill: { top: C.beak, bottom: C.beakLo }, deco(c) { strokePoly(c, Hs([[0.04, -0.12], [0.16, -0.135], [0.26, -0.112]]), 'rgba(120,70,20,0.35)', 0.008, 1); } },
  ] };
  parts.wing = { z: 3, pivot: S.slice(), layers: wingLayers };

  return {
    id: 'oviraptor',
    parts,
    anchors: { head: H([0.1, 0.05]), mouth: H([0.3, -0.07]), eye: H([0.085, 0.035]), back: [brood ? 0.0 : 0.05, brood ? 0.78 : 1.26], foot: [brood ? 0.3 : 0.0, 0.0], shoulder: S.slice(), nest: [0.0, 0.15], tailTip: [P.fan[0], P.fan[1]] },
    meta: { name: 'Oviraptor', lengthM: 1.8, period: 'Oberkreide', pose: brood ? 'brood' : 'stand',
      ranges: brood ? { jaw: [0, -0.45], wing: [0, -0.35] } : { jaw: [0, -0.45], wing: [0, -1.1] } }, // wing: negativ = Arm/Federn heben
  };
}

// gezeichnet in bequemen Zahlen, hier auf die echte Größe gebracht (Faktor 0.71)
const K = 0.71;
export default function make(opts = {}) { return scaleSpec(makeRaw(opts), K); }
