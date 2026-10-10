// Archaeopteryx – Urvogel des Oberjura, ~0,5 m. Gefiederte Flügel mit drei Fingerkrallen, lange Schwanzfeder-Reihe an knöchernem Schwanz,
// bezahnter Schnabel, kräftige Hinterbeine mit Federhosen. Posen: Standard (steht, Flügel halb angehoben) und {pose:'fly'} (Flügel weit offen).
// Teile: body, jaw (Pivot Kiefergelenk), wing (nah, vor dem Körper), wing2 (fern, hinter dem Körper) – beide Pivot Schulter.
import { limb, poly, blob } from '../dsl.js';
import { volume } from '../paint.js';
import { loop, soft, fillPoly, strokePoly, theropodLeg, claws, teethRow, bigEye, rotPt, featherAt, featherLayers, featherLayer, makeWing, scaleSpec } from './_a_kit.js';

const DEG = Math.PI / 180;

function makeRaw(opts = {}) {
  const fly = opts.pose === 'fly';
  const C = {
    body: '#8a6a50', bodyLo: '#765a44', belly: '#efe0bf', head: '#6a5040', cheek: '#f0d9a0', beak: '#f4d27c', leg: '#e8a63c', legLo: '#c98a2c', claw: '#2e2318',
    wing: '#2f3b57', wingMid: '#27324b', wingTip: '#7391b4', wingBase: '#4a4a56', cover: '#7a5e48', tail: '#2f3b57', eye: '#20140a', pink: '#d9776a', tooth: '#fffaf0',
  };
  const P = fly ? {
    torso: [0.0, 0.3, 0.092, 0.058, 0.1], neck: [[0.06, 0.315, 0.075], [0.09, 0.327, 0.058], [0.108, 0.335, 0.052]],
    head0: [0.118, 0.338], headRot: -0.06, hip: [-0.015, 0.275], rump: [-0.085, 0.292], tailEnd: [-0.44, 0.285], S: [0.03, 0.325],
  } : {
    torso: [0.015, 0.18, 0.1, 0.07, 0.4], neck: [[0.06, 0.2, 0.075], [0.083, 0.232, 0.06], [0.094, 0.255, 0.052]],
    head0: [0.106, 0.266], headRot: 0.12, hip: [0.0, 0.13], rump: [-0.075, 0.165], tailEnd: [-0.42, 0.115], S: [0.035, 0.212],
  };
  const H0 = P.head0, HR = P.headRot, HS = 1.0;
  const H = (p) => rotPt([H0[0] + p[0] * HS, H0[1] + p[1] * HS], H0[0], H0[1], HR);
  const Hs = (pts) => pts.map(H);

  // ---- Rumpf, Hals, Kopf ----------------------------------------------------------------------
  const torso = blob(P.torso[0], P.torso[1], P.torso[2], P.torso[3], P.torso[4], 48);
  const neck = limb(P.neck, { per: 10 });
  const headL = [[0.108, -0.004], [0.1, 0.014], [0.075, 0.034], [0.045, 0.05], [0.012, 0.06], [-0.025, 0.052], [-0.043, 0.022], [-0.043, -0.02], [-0.02, -0.042], [0.02, -0.034], [0.06, -0.02], [0.095, -0.013]];
  const head = loop(Hs(headL), 8);
  const nape = [0, 1].map((i) => featherAt(H([-0.03, 0.035 - i * 0.02])[0], H([-0.03, 0.035 - i * 0.02])[1], (178 + i * 14) * DEG - HR * 0, 0.05 - i * 0.006, 0.022));
  const teeth = teethRow(H([0.06, -0.021]), H([0.1, -0.012]), 3, 0.014, 0.011, 1, 0.1).map((t) => poly(t));

  // ---- Schwanz: knöcherner Kern + gefiederte Wedel ------------------------------------------------
  const R = P.rump, E = P.tailEnd;
  const tcore = [[R[0], R[1], 0.045], [R[0] + (E[0] - R[0]) * 0.3, R[1] + (E[1] - R[1]) * 0.3 + 0.004, 0.022], [R[0] + (E[0] - R[0]) * 0.65, R[1] + (E[1] - R[1]) * 0.65, 0.011], [E[0], E[1], 0.006]];
  const tcoreL = limb(tcore, { per: 12 });
  const axis = (t) => { // Punkt + Tangente auf dem Schwanzkern
    const a = [R[0] + (E[0] - R[0]) * t, R[1] + (E[1] - R[1]) * t + 0.006 * Math.sin(t * 3.14)];
    return a;
  };
  const vane = (side) => {
    const pts = [axis(0.12)], tips = [], n = 13;
    for (let i = 0; i <= n; i++) {
      const t = 0.12 + (0.88 * i) / n; const a = axis(t);
      const len = (0.036 + 0.02 * Math.sin(Math.min(1, t * 1.2) * 2.6)) * (1 - 0.35 * Math.max(0, t - 0.8));
      const tip = [a[0] - 0.046, a[1] + side * len];
      const nxt = axis(Math.min(1, t + 0.88 / n / 2));
      pts.push(tip); pts.push([nxt[0] - 0.03, nxt[1] + side * len * 0.72]);
      tips.push([a, tip]);
    }
    pts.push(axis(1.0));
    return { poly: poly(pts, 0), tips };
  };
  const vU = vane(+1), vL = vane(-1);

  // ---- Beine: Oberschenkel gefiedert (Körperfarbe), Lauf orange -----------------------------------------
  const mkLeg = (foot, far) => {
    if (!fly) {
      const lg = theropodLeg({ hip: P.hip, foot, L: [0.07, 0.085, 0.06], metaAng: 1.1, widths: [0.085, 0.09, 0.034, 0.02, 0.015, 0.014], toe: 0.05, toeW: 0.013, kneeSide: 1 });
      const hallux = limb([[lg.toeBase[0] - 0.004, 0.02, 0.014], [lg.toeBase[0] - 0.03, 0.012, 0.011]], { per: 4 });
      return { thigh: [lg.thigh], lower: [lg.shin, lg.meta].concat(lg.toes, [hallux]), claws: claws(lg.clawPts.concat([[lg.toeBase[0] - 0.034, 0.012]]), 0.016, 0.01, -0.1) };
    }
    const a = far ? 0.015 : 0, b = far ? 0.01 : 0, h = P.hip;
    const th = limb([[h[0], h[1], 0.085], [h[0] - 0.03 - a, h[1] - 0.03, 0.06], [h[0] - 0.055 - a, h[1] - 0.045, 0.04]], { per: 8 });
    const sh = limb([[h[0] - 0.055 - a, h[1] - 0.045, 0.02], [h[0] - 0.1 - a, h[1] - 0.065 - b, 0.014], [h[0] - 0.14 - a, h[1] - 0.06 - b, 0.011]], { per: 8 });
    const toes = [0, 1, 2].map((i) => limb([[h[0] - 0.14 - a, h[1] - 0.06 - b, 0.01], [h[0] - 0.16 - a, h[1] - 0.065 - b - i * 0.006 + 0.006, 0.008], [h[0] - 0.18 - a, h[1] - 0.07 - b - i * 0.012 + 0.01, 0.005]], { per: 4 }));
    return { thigh: [th], lower: [sh].concat(toes), claws: [] };
  };
  const legFar = mkLeg(0.09, true), legNear = mkLeg(-0.025, false);
  // Federhosen am Oberschenkel
  const trousers = [0, 1, 2].map((i) => featherAt(P.hip[0] - 0.01 - i * 0.014, P.hip[1] - 0.012 - i * 0.012, (fly ? 195 + i * 8 : 235 - i * 14) * DEG, 0.08 - i * 0.008, 0.034));

  // ---- Flügel (Pivot Schulter): Vorderkante = Arm+Hand, Armschwingen + Handschwingen dahinter, 3 Fingerkrallen -----------
  const S = P.S;
  const mkWing = (far) => {
    const theta = (fly ? 112 : 142) * DEG + (far ? 0.2 : 0);
    const pal = far
      ? (kind, i, t) => (kind === 'cover' ? [[0, '#5a4838'], [1, '#7c6554']] : [[0, '#3a3a48'], [0.5, '#232c42'], [0.88, '#2c3753'], [1, '#5f7898']])
      : (kind, i, t) => (kind === 'cover' ? [[0, C.cover], [1, '#a3856a']] : [[0, C.wingBase], [0.4, i % 2 ? C.wing : C.wingMid], [0.85, i % 2 ? C.wingMid : C.wing], [1, C.wingTip]]);
    return makeWing({ S, theta, L: fly ? 0.23 : 0.2, handFrac: 0.52, nSec: 6, nPrim: 8, secLen: 0.15, primLen: fly ? 0.21 : 0.19, fw: 0.044, pal, armFill: far ? '#5a4838' : C.cover, armW: [0.05, 0.036, 0.02], clawN: far ? 0 : 3, clawLen: 0.034 }).layers;
  };

  // ---- Schichten Körper -------------------------------------------------------------------------
  const bodyLayers = [];
  bodyLayers.push({ shapes: legFar.lower, fill: { top: '#b8802a', bottom: '#d89a38' }, deco(c, bb) { volume(c, bb, { dark: 'rgba(60,30,10,0.3)' }); } });
  if (legFar.claws.length) bodyLayers.push({ shapes: legFar.claws, fill: C.claw, stroke: null });
  // Schwanzwedel (hinter dem Rumpf)
  const tailDeco = (c) => {
    vU.tips.concat(vL.tips).forEach(([a, tip]) => strokePoly(c, [a, tip], 'rgba(200,220,245,0.35)', 0.002, 1));
  };
  bodyLayers.push({ shapes: [tcoreL], fill: '#6a5242' });
  bodyLayers.push({ shapes: [vL.poly], fill: { stops: [[0, '#3a3a4c'], [0.5, C.tail], [1, '#6a86a8']], dir: 'h' }, deco: tailDeco });
  bodyLayers.push({ shapes: [vU.poly], fill: { stops: [[0, '#3a3a4c'], [0.5, C.tail], [1, '#6a86a8']], dir: 'h' }, deco: tailDeco });
  bodyLayers.push({ shapes: trousers.map((p) => p), fill: { top: '#3a4560', bottom: '#27324b' }, deco(c) { } });
  bodyLayers.push({ shapes: [torso, neck, head].concat(legNear.thigh), fill: { top: C.body, bottom: C.bodyLo },
    deco(c, bb) {
      // Bauch hell
      soft(c, [[P.torso[0] - 0.02, P.torso[1] - 0.075], [P.torso[0] + 0.12, P.torso[1] - 0.05], [P.torso[0] + 0.1, P.torso[1] + 0.0], [P.torso[0] + 0.02, P.torso[1] - 0.02], [P.torso[0] - 0.09, P.torso[1] - 0.05]], C.belly, 0.02, 1);
      soft(c, limb(P.neck.map((p) => [p[0] + 0.012, p[1] - 0.006, p[2] * 0.5]), { per: 8 }), C.belly, 0.015, 0.9);
      // Kopf dunkler, Wange hell
      soft(c, head, C.head, 0.015, 0.95);
      soft(c, Hs([[-0.03, -0.01], [0.02, -0.035], [0.03, 0.0], [-0.01, 0.02]]), C.cheek, 0.012, 0.9);
      soft(c, Hs([[0.05, -0.02], [0.11, -0.012], [0.1, 0.012], [0.05, 0.0]]), C.beak, 0.008, 1);
      const e = H([0.03, 0.024]); bigEye(c, e[0], e[1], 0.0215, { color: C.eye });
      strokePoly(c, Hs([[0.1, -0.012], [0.07, -0.02], [0.03, -0.028]]), 'rgba(70,40,15,0.75)', 0.0028, 1);
      const nn = H([0.088, 0.012]); fillPoly(c, [[nn[0] - 0.003, nn[1]], [nn[0], nn[1] + 0.004], [nn[0] + 0.004, nn[1] - 0.001]], 'rgba(60,30,10,0.8)');
      volume(c, bb, { dark: 'rgba(50,30,15,0.2)', light: 'rgba(255,240,210,0.18)' });
    } });
  bodyLayers.push({ shapes: teeth, fill: C.tooth, stroke: 'rgba(110,80,50,0.4)' });
  bodyLayers.push({ shapes: legNear.lower, fill: { top: C.leg, bottom: C.legLo }, deco(c, bb) { volume(c, bb, { dark: 'rgba(60,30,10,0.25)' }); } });
  if (legNear.claws.length) bodyLayers.push({ shapes: legNear.claws, fill: C.claw, stroke: null });

  // ---- Kiefer ----------------------------------------------------------------------------------
  const jawPivot = H([-0.005, -0.025]);
  const jawShape = loop(Hs([[-0.01, -0.02], [0.05, -0.027], [0.09, -0.018], [0.096, -0.034], [0.065, -0.05], [0.02, -0.054], [-0.02, -0.042]]), 8);
  const lining = loop(Hs([[-0.01, -0.005], [0.05, -0.012], [0.095, -0.016], [0.09, -0.035], [0.03, -0.04], [-0.01, -0.035]]), 5);
  const jawTeeth = teethRow(H([0.06, -0.027]), H([0.09, -0.019]), 2, 0.011, 0.009, -1, -0.1).map((t) => poly(t));

  const parts = {};
  parts.body = { z: 1, layers: bodyLayers };
  parts.jaw = { z: 0, pivot: jawPivot, layers: [
    { shapes: [lining], fill: C.pink, stroke: null },
    { shapes: [jawShape], fill: { top: '#e8c680', bottom: C.beak } },
    { shapes: jawTeeth, fill: C.tooth, stroke: 'rgba(110,80,50,0.4)' },
  ] };
  parts.wing = { z: 3, pivot: S.slice(), layers: mkWing(false) };
  parts.wing2 = { z: 0, pivot: S.slice(), layers: mkWing(true) };

  return {
    id: 'archaeopteryx',
    parts,
    anchors: { head: H([0.05, 0.02]), mouth: H([0.105, -0.015]), eye: H([0.03, 0.024]), back: [0.0, fly ? 0.36 : 0.24], foot: [0.0, 0.0], shoulder: S.slice(), tailTip: [E[0], E[1]] },
    meta: { name: 'Archaeopteryx', lengthM: 0.5, period: 'Oberjura', pose: fly ? 'fly' : 'stand',
      // wing/wing2: Ruhe 0 = gezeichnete Haltung (Flügel oben), positiv (gegen den Uhrzeigersinn) = Flügel schwingt nach hinten/unten (Abschlag), negativ = weiter anheben
      ranges: fly ? { jaw: [0, -0.5], wing: [0, 1.0], wing2: [0, 0.95] } : { jaw: [0, -0.5], wing: [0, 0.55], wing2: [0, 0.5] },
      swing: fly ? { wing: [-0.45, 1.0], wing2: [-0.45, 0.95] } : { wing: [-0.6, 0.55], wing2: [-0.6, 0.5] } },
  };
}

// gezeichnet in bequemen Zahlen, hier auf die echte Größe gebracht (Faktor 0.75)
const K = 0.75;
export default function make(opts = {}) { return scaleSpec(makeRaw(opts), K); }
