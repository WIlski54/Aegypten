// =====================================================================================================
// _eg_person.js – Baukasten "Profil-Mensch im Stil der ägyptischen Wandmalerei als Papierschnitt"
// (Gruppe P; wird von Gruppe G für Götter mit Tierköpfen wiederverwendet)
// =====================================================================================================
//
// Benutzung:
//   import { person } from './_eg_person.js';
//   export default (o = {}) => person({ id: 'pharao', name: 'Pharao', heightM: 1.7, head: 'nemes', ... , ...o });
//   -> liefert ein fertiges Figuren-Spec { id, parts, anchors, meta } (Meter, Boden y=0, Blick nach +x).
//
// TEILE (Standard-Namen, z = vorn/hinten):
//   legA  (fernes Bein, z 0, Pivot Hüfte)       armB (fernerer Arm an der HINTEREN Schulter, z 1, Pivot Schulter)
//   legB  (nahes Bein,  z 2, Pivot Hüfte)       body (Rumpf, Kopf, Kleidung, Kopfbedeckung, z 3)
//   armA  (naher Arm an der VORDEREN Schulter, z 4, Pivot Schulter)
//   stuhl (nur pose:'chair', z -1, unbeweglich)
//   Ägyptische Schulter ("Aspektive"): Schultern frontal breit, Kopf/Beine im Profil. armA hängt an der vorderen,
//   armB an der hinteren Schulterkante – wie in der Wandmalerei. Bei shoulders:'profil' (Europäer) sitzen beide
//   Arme am selben Schulterpunkt.
//   Bei pose 'sit' (Schneidersitz) und Gewand 'mumie' gehören die Beine zum body (keine legA/legB).
//   Requisiten in der Hand gehören zum jeweiligen Arm (drehen mit).
//
// OPTIONEN (alle optional):
//   id, name, heightM        Kennung, Anzeigename, Körpergröße stehend in m (ohne Krone/Hut)
//   sex      'm' | 'w'       Geschlecht (Hautfarbe nach Kanon: Männer rotbraun, Frauen ocker)
//   age      'erw' | 'jung' | 'kind'   Proportionen (Kind: großer Kopf, kurze Glieder)
//   style    'eg' | 'eu'     'eu' = Europäer (1822/1922): natürliches Auge ohne Lidstrich, Profilschultern, helle Haut
//   shoulders 'eg' | 'profil'
//   skin     Hautfarbe '#rrggbb' (Vorgabe nach sex/age/style), skinFar optional
//   build    Schulterbreite/Kraft (1 = normal, 1.1 kräftig, 0.92 schlank)
//   headScale Kopfgröße (Vorgabe erw 0.98, jung 1.04, kind 1.28)
//   pose     'stand' (Füße fast zusammen) | 'walk' (ägyptischer Schreitschritt, beide Sohlen flach)
//            | 'pull' (nach vorn gebeugt, zieht) | 'kneel' (kniet auf einem Knie) | 'sit' (Schneidersitz am Boden)
//            | 'chair' (sitzt auf einem Stuhl, Teil 'stuhl') | 'carry' (= walk, Hände an der Tragestange)
//   lean     zusätzliche Rumpfneigung nach vorn (rad)
//   head     Kopfbedeckung/Frisur:
//            'kurz' (runde Kurzhaarperücke), 'bob' (schulterlange Perücke), 'lang' (dreiteilige Perücke mit Strähne
//            vor der Schulter; Frauen, Göttinnen), 'kahl' (Priester), 'jugendlocke' (Kind: kahl mit Seitenzopf),
//            'zopf' (Mädchen: Kappe + Pferdeschwanz), 'kopftuch' (Khat), 'nemes' (gestreiftes Königskopftuch),
//            'krone_weiss' (Hedjet), 'krone_rot' (Deschret), 'krone_doppel' (Pschent), 'krone_blau' (Khepresch),
//            'kappe' (Kappe + Stirnband, Platz für aufgesetzte Kronen), 'melone' (hellenistische Melonenfrisur mit Diadem,
//            Kleopatra), 'hut1922' (Homburg + Kurzhaar), 'locken1822' (dunkle Locken + Koteletten),
//            'anubis' (Schakalmaske über dem Kopf), 'custom' (siehe headFn)
//   headFn   (K) => ({ layers:[...], earOver?, hideFace?, hideEar?, eye?:[x,y], top?:[x,y] })  eigener Kopf (Götter).
//            K = { P(x,y), pts(arr), blob(x,y,rx,ry,rot), limb([[x,y,w],..]), pen, hs, col }  Kopf-Lokalkoordinaten:
//            Ursprung ≈ Ohr, Nase bei x≈+0.095, Scheitel y≈+0.085, Kinn y≈−0.09 (Einheit ≈ Körperhöhe/1.03).
//            Beispiel: siehe headAnubis() unten (exportiert als HEADS.anubis).
//   uraeus   true/false     Kobra an der Stirn (Vorgabe bei Kronen/Nemes true)
//   nemesCol ['#e0b040','#2a5aa0']  Streifenfarben des Nemes
//   band     Farbe eines Stirnbands (bei 'lang','kurz','zopf'), z. B. '#c0432e'; lotus: true = Lotosblüte am Band
//   beard    'none' | 'koenig' (gerader Zeremonialbart) | 'gott' (vorn gebogen) | 'schnurr' (Schnurrbart, eu)
//   reed     true = Ersatz-Binse hinter dem Ohr (Schreiber)
//   earring  true = goldener Ohrring
//   garment  'schurz' (knielanger Leinenschurz) | 'schurz_kurz' (Arbeiter) | 'schurz_lang' (wadenlang)
//            | 'gewand' (langes Wesir-Gewand) | 'kleid' (Frauen-Trägerkleid, hem = Saumhöhe) | 'chiton' (hellenist. Gewand
//            mit Mantel) | 'mumie' (eingewickelt, Beine geschlossen) | 'anzug1922' | 'gehrock1822'
//   hem      Saumhöhe über dem Boden in Körpereinheiten (Kleid: 0.06 = knöchellang, 0.2 = wadenlang)
//   royal    true = Königsschurz: Goldgürtel + Schurzlatz mit Streifen
//   garmentCol Hauptfarbe des Gewands (Vorgabe Leinen), mantleCol (Chiton-Mantel)
//   collar   'none' | 'breit' (Usech-Halskragen bunt) | 'gold' | 'perlen' (schmale Kette)
//   bands    true = Goldreifen an Oberarm und Handgelenk
//   leopard  true = Leopardenfell (Sem-Priester)
//   sandals  true = Sandalen
//   armA/armB  Armhaltung: Name aus ARM_POSES ('haengen','faust','vor','vorHoch','brust','brustB','heben','zeigen',
//            'schlagen','tragen','ziehen','schreiben','halten','kneten','giessen','werfen','hacken','lupe','rueck')
//            oder { u, f, hand:'open'|'fist', hb } (u = Oberarm, f = Unterarm, Winkel ab senkrecht nach unten, + = nach vorn)
//   armBFront true = ferner Arm VOR dem Rumpf (z 3.5), z. B. für über der Brust gekreuzte Arme
//   holdA/holdB Requisit in der Hand: Name aus PROPS ('stab','zepter','was','krummstab','wedel','anch','speer','netz',
//            'rolle','binse','teigschale','brotbrett','krug','hes','ball','pferdchen','hacke','schlaegel','meissel',
//            'messleine','seil','pinsel','feder','lupe','raeucherarm','schale','palette')
//            oder { prop, ang, len, ...propOpts } (ang = Richtung der Requisit-Achse in rad, mathematisch)
//   carry    'stange' = Tragestange auf der Schulter (Teil von body), poleLen in Körpereinheiten (Vorgabe 1.1)
//   lap      'papyrus' = Papyrus auf dem Schoß (pose 'sit')
//   cols     Farbüberschreibungen { hair, wig, linen, linenSh, gold, ... }
//
// META: name, heightM, pose, ranges (armA/armB/legA/legB je nach Pose), swing (Laufzyklus), pivots, crownW (Kopfbreite m)
// ANCHORS: head, eye, mouth, krone (Scheitel, Sitz einer Krone), top (oberster Punkt), handA, handB, gripA, gripB,
//          shoulderA, shoulderB, hip, foot, chest, poleFront/poleBack (bei carry)
// =====================================================================================================
import { blob, limb, poly, xf } from '../dsl.js';
import { volume } from '../paint.js';

// ---------------------------------------------------------------- Palette (verbindlich laut Brief)
export const EG = {
  skinM: '#b5693a', skinW: '#d9a95a', skinKindM: '#c47e4a', skinKindW: '#e4b96c', skinEU: '#ecbf9c',
  linen: '#f6efe0', linenSh: '#d9cdb4', hair: '#1c1816', hairHi: '#4a423c',
  gold: '#e0b040', goldL: '#fff0b3', goldD: '#8a5f1c', lapis: '#2a5aa0', turq: '#3bb3a8', carn: '#c0432e',
  papyrus: '#5b9a4b', nil: '#3f8f5a', sand: '#d9b97a', mud: '#b9824f', ink: '#1c1816',
  wood: '#9a6a3a', woodD: '#6a4424', copper: '#c27a3e', clay: '#b0603a', redCrown: '#c23a2c', white: '#fbf7ec',
};

// ---------------------------------------------------------------- small math
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const down = (p, ang, l) => [p[0] + Math.sin(ang) * l, p[1] - Math.cos(ang) * l];
const rotv = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
export const shade = (a, t) => mix(a, '#000000', t);
export const tint = (a, t) => mix(a, '#ffffff', t);

// ---------------------------------------------------------------- pen: painting in UNIT coordinates
// M maps unit coords -> meters, U = meters per unit. All widths are in units.
export function makePen(M, U) {
  const P = (c, p) => { const q = M(p); return c.tf(q[0], q[1]); };
  const pen = {
    P,
    curve(c, pts, col, w, a = 1, cap = 'round') {
      if (pts.length < 2) return;
      const { ctx, S } = c; ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = Math.max(1, w * U * S); ctx.lineCap = cap; ctx.lineJoin = 'round';
      const Q = pts.map((p) => P(c, p)); ctx.beginPath(); ctx.moveTo(Q[0][0], Q[0][1]);
      for (let i = 1; i < Q.length - 1; i++) { const mx = (Q[i][0] + Q[i + 1][0]) / 2, my = (Q[i][1] + Q[i + 1][1]) / 2; ctx.quadraticCurveTo(Q[i][0], Q[i][1], mx, my); }
      const L = Q[Q.length - 1]; ctx.lineTo(L[0], L[1]); ctx.stroke(); ctx.restore();
    },
    line(c, pts, col, w, a = 1, cap = 'round') {
      const { ctx, S } = c; ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = Math.max(1, w * U * S); ctx.lineCap = cap; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach((p, i) => { const [X, Y] = P(c, p); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
    },
    fill(c, pts, col, a = 1) {
      const { ctx } = c; ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = a; ctx.beginPath();
      pts.forEach((p, i) => { const [X, Y] = P(c, p); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill(); ctx.restore();
    },
    dot(c, p, r, col, a = 1) {
      const { ctx, S } = c; const [X, Y] = P(c, p); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y, Math.max(0.8, r * U * S), 0, 6.2832); ctx.fill(); ctx.restore();
    },
    ell(c, p, rx, ry, rot, col, a = 1) {
      const { ctx, S } = c; const [X, Y] = P(c, p); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(X, Y, Math.max(0.6, rx * U * S), Math.max(0.6, ry * U * S), -rot, 0, 6.2832); ctx.fill(); ctx.restore();
    },
    // lower half of an ellipse outline (collar bands); rot = model rotation (ccw)
    arcLow(c, p, rx, ry, rot, col, w, a = 1) {
      const { ctx, S } = c; const [X, Y] = P(c, p); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, w * U * S);
      ctx.beginPath(); ctx.ellipse(X, Y, Math.max(0.5, rx * U * S), Math.max(0.5, ry * U * S), -rot, 0, Math.PI); ctx.stroke(); ctx.restore();
    },
    glow(c, p, r, col, a = 0.4) {
      const { ctx, S } = c; const [X, Y] = P(c, p); const R = Math.max(1, r * U * S);
      ctx.save(); const g = ctx.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, R, 0, 6.2832); ctx.fill(); ctx.restore();
    },
    tintAll(c, col, a) { const { ctx } = c; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, c.W, c.H); ctx.restore(); },
    // bands across a strand: pts along strand, draws perpendicular strokes at fractions ts
    vol(c, bb, dark = 'rgba(40,20,8,0.22)', light = 'rgba(255,248,225,0.18)') { volume(c, bb, { dark, light }); },
  };
  return pen;
}

// ---------------------------------------------------------------- arm poses (u = upper arm, f = forearm; rad from straight down, + = forward)
export const ARM_POSES = {
  haengen: { u: 0.05, f: 0.12, hand: 'open' },
  rueck: { u: -0.10, f: -0.04, hand: 'open' },
  faust: { u: 0.04, f: 0.10, hand: 'fist' },
  vor: { u: 0.28, f: 1.30, hand: 'fist' },       // Unterarm waagrecht nach vorn (Stab halten)
  vorHoch: { u: 0.45, f: 1.75, hand: 'fist' },   // Unterarm schräg nach oben vorn
  brust: { u: 0.30, f: 2.95, hand: 'fist' },     // Faust vor der Brust (Krummstab)
  brustB: { u: 0.95, f: 2.25, hand: 'fist' },    // ferner Arm quer vor der Brust (mit armBFront)
  heben: { u: 2.3, f: 2.7, hand: 'open' },       // erhoben (Anbetung)
  zeigen: { u: 0.9, f: 1.45, hand: 'open', hb: 0.0 },
  schlagen: { u: 2.0, f: 2.9, hand: 'fist' },    // Schlägel erhoben
  tragen: { u: 2.55, f: 3.75, hand: 'fist' },    // Hand an der Stange auf der Schulter
  ziehen: { u: 1.05, f: 1.35, hand: 'fist' },    // nach vorn gestreckt, zieht ein Seil
  schreiben: { u: 0.55, f: 1.62, hand: 'fist' }, // Hand mit Binse über dem Papyrus
  halten: { u: 0.22, f: 1.45, hand: 'fist' },    // Gefäß vor dem Bauch
  kneten: { u: 0.45, f: 1.75, hand: 'fist' },
  giessen: { u: 0.65, f: 1.55, hand: 'fist' },
  werfen: { u: 2.6, f: 2.5, hand: 'fist' },      // Speer über dem Kopf
  hacken: { u: 0.95, f: 1.15, hand: 'fist' },
  lupe: { u: 0.75, f: 1.75, hand: 'fist' },
};

// ---------------------------------------------------------------- canonical shapes (torso frame: hip joint = [0,0])
const TORSO = {
  m: [[-0.072, -0.03], [-0.064, 0.05], [-0.053, 0.11], [-0.058, 0.17], [-0.080, 0.225], [-0.106, 0.268], [-0.120, 0.292],
    [-0.116, 0.314], [-0.090, 0.326], [-0.030, 0.332], [0.040, 0.334], [0.096, 0.326], [0.122, 0.310], [0.128, 0.288],
    [0.114, 0.258], [0.094, 0.230], [0.083, 0.20], [0.070, 0.165], [0.056, 0.12], [0.058, 0.08], [0.068, 0.03], [0.072, -0.03]],
  w: [[-0.072, -0.03], [-0.066, 0.05], [-0.050, 0.11], [-0.054, 0.17], [-0.072, 0.225], [-0.096, 0.268], [-0.108, 0.292],
    [-0.104, 0.314], [-0.080, 0.326], [-0.028, 0.332], [0.036, 0.334], [0.086, 0.326], [0.108, 0.310], [0.113, 0.288],
    [0.100, 0.258], [0.094, 0.238], [0.101, 0.214], [0.094, 0.190], [0.070, 0.170], [0.052, 0.12], [0.056, 0.08], [0.070, 0.03], [0.076, -0.03]],
  profil: [[-0.070, -0.03], [-0.062, 0.06], [-0.056, 0.12], [-0.064, 0.20], [-0.070, 0.26], [-0.062, 0.305], [-0.036, 0.328],
    [0.015, 0.334], [0.048, 0.318], [0.066, 0.28], [0.072, 0.22], [0.064, 0.15], [0.060, 0.08], [0.066, 0.0], [0.068, -0.03]],
};
const FOOT = [[-0.032, 0.006], [-0.041, -0.016], [-0.037, -0.037], [-0.020, -0.045], [0.060, -0.045], [0.108, -0.044], [0.122, -0.040],
  [0.121, -0.033], [0.100, -0.029], [0.060, -0.022], [0.030, -0.008], [0.016, 0.010], [-0.010, 0.017]];
const SHOE = [[-0.034, 0.010], [-0.044, -0.016], [-0.042, -0.045], [0.080, -0.045], [0.116, -0.042], [0.126, -0.032], [0.118, -0.020],
  [0.080, -0.012], [0.040, 0.004], [0.012, 0.020], [-0.012, 0.022]];
const FACE = [[-0.030, 0.080], [0.010, 0.085], [0.040, 0.077], [0.058, 0.061], [0.067, 0.041], [0.069, 0.025], [0.071, 0.014],
  [0.080, -0.002], [0.089, -0.017], [0.095, -0.027], [0.093, -0.034], [0.083, -0.037], [0.078, -0.038], [0.082, -0.042], [0.087, -0.047],
  [0.085, -0.051], [0.079, -0.053], [0.083, -0.057], [0.081, -0.062], [0.074, -0.066], [0.074, -0.072], [0.070, -0.081], [0.059, -0.088],
  [0.040, -0.090], [0.019, -0.084], [0.000, -0.070], [-0.020, -0.052], [-0.048, -0.040], [-0.066, -0.012], [-0.070, 0.020], [-0.062, 0.050], [-0.050, 0.068]];

// =====================================================================================================
export function person(o = {}) {
  const C = Object.assign({}, EG, o.cols || {});
  const id = o.id || 'person';
  const sex = o.sex || 'm';
  const age = o.age || 'erw';
  const style = o.style || 'eg';
  const kid = age === 'kind';
  const shoulders = o.shoulders || (style === 'eu' ? 'profil' : 'eg');
  const skin = o.skin || (style === 'eu' ? EG.skinEU : kid ? (sex === 'w' ? EG.skinKindW : EG.skinKindM) : (sex === 'w' ? EG.skinW : EG.skinM));
  const skinD = shade(skin, 0.22), skinL = tint(skin, 0.18);
  const hs = o.headScale ?? (kid ? 1.28 : age === 'jung' ? 1.08 : 1.03);
  const build = o.build ?? 1;
  const tx = (o.tx ?? (kid ? 0.84 : 1)) * build;
  const ty = o.ty ?? (kid ? 0.80 : 1);
  const legK = o.legK ?? (kid ? 0.78 : 1);
  const armK = o.armK ?? (kid ? 0.80 : 1);
  const lw = (o.limbW ?? (sex === 'w' ? 0.9 : 1)) * (kid ? 0.92 : 1) * Math.sqrt(build);
  const garment = o.garment || (style === 'eu' ? 'anzug1922' : sex === 'w' ? 'kleid' : 'schurz');
  const mummy = garment === 'mumie';
  let pose = o.pose || 'stand';
  if (mummy) pose = 'stand';
  const headStyle = o.head || (sex === 'w' ? 'lang' : 'kurz');
  const legLen = (0.232 + 0.222) * legK, ankleH = 0.045 * (kid ? 0.9 : 1);
  const footK = kid ? 0.82 : sex === 'w' ? 0.92 : 1;
  const OCT = [0.032, 0.445]; // head origin in torso frame (before scaling)
  const headTopCT = OCT[1] * ty + 0.083 * hs;
  const stature = ankleH + legLen + headTopCT;
  const heightM = o.heightM || 1.7;
  const U = heightM / stature;
  let gy = 0; // ground level (unit) – set after the legs are built
  const M = (p) => [p[0] * U, (p[1] - gy) * U];
  const pen = makePen(M, U);
  const SC = (pl) => pl.map(M);
  const farShade = (L) => ({ ...L, deco: (c, bb) => { if (L.deco) L.deco(c, bb); pen.tintAll(c, 'rgb(30,15,5)', 0.13); } });

  // ------------------------------------------------------------ lower-body pose
  const stdHip = ankleH + legLen;
  let Hp = [0, stdHip], lean = (o.lean || 0);
  let LP = null; // leg params {th, sh, psi, toes}
  if (pose === 'stand') LP = { A: { th: 0.075, sh: 0.075 }, B: { th: -0.035, sh: -0.035 } };
  else if (pose === 'walk' || pose === 'carry') LP = { A: { th: 0.25, sh: 0.25 }, B: { th: -0.23, sh: -0.23 } };
  else if (pose === 'pull') { LP = { A: { th: 0.55, sh: 0.18 }, B: { th: -0.42, sh: -0.42 } }; lean += 0.42; Hp = [0, stdHip - 0.05 * legK]; }
  else if (pose === 'kneel') { LP = { A: { th: 1.42, sh: 0.0 }, B: { th: 0.06, sh: -1.57, psi: -1.05, toes: true } }; Hp = [0, ankleH * 0.2 + 0.232 * legK + 0.012]; }
  else if (pose === 'chair') { LP = { A: { th: 1.52, sh: 0.06 }, B: { th: 1.45, sh: -0.04 } }; Hp = [0, ankleH + 0.222 * legK + 0.02]; }
  else if (pose === 'sit') { LP = null; Hp = [0, 0.075]; lean += -0.02; }

  // torso transform: canonical torso frame -> unit frame
  const TR = -lean;
  const T = (p) => { const v = rotv([p[0] * tx, p[1] * ty], TR); return [Hp[0] + v[0], Hp[1] + v[1]]; };
  const Tp = (arr) => arr.map(T);

  // ------------------------------------------------------------ LEGS
  const tl = 0.232 * legK, sl = 0.222 * legK;
  const legGeom = (L) => {
    const K = down(Hp, L.th, tl), A = down(K, L.sh, sl);
    const Tm = down(Hp, L.th, tl * 0.5), Sm0 = down(K, L.sh, sl * 0.45);
    const Sm = add(Sm0, mul([Math.cos(L.sh), Math.sin(L.sh)], -0.010));
    const ctrl = [[Hp[0], Hp[1], 0.108 * lw], [Tm[0], Tm[1], 0.090 * lw], [K[0], K[1], 0.060 * lw], [Sm[0], Sm[1], 0.064 * lw], [A[0], A[1] + 0.006, 0.040 * lw]];
    return { K, A, ctrl };
  };
  const trousers = garment === 'anzug1922' || garment === 'gehrock1822';
  const footShape = (A, psi, shoe) => xf(poly((shoe ? SHOE : FOOT).map(([x, y]) => [x * footK, y * footK]), 2), { x: A[0], y: A[1], rot: psi || 0 });
  const legs = {};
  if (LP && !mummy) for (const k of ['A', 'B']) legs[k] = legGeom(LP[k]);
  // ground: lowest point of the feet / knees
  {
    let mn = 1e9;
    for (const k of Object.keys(legs)) {
      const g = legs[k];
      for (const p of footShape(g.A, LP[k].psi, trousers)) mn = Math.min(mn, p[1]);
      mn = Math.min(mn, g.K[1] - 0.03 * lw);
    }
    if (pose === 'sit') mn = 0;
    if (mummy) mn = 0;
    gy = mn === 1e9 ? 0 : mn;
  }

  // ------------------------------------------------------------ TORSO + NECK
  const torsoKey = shoulders === 'profil' ? 'profil' : sex === 'w' ? 'w' : 'm';
  const torsoPts = o.armBFront && shoulders !== 'profil' ? TORSO[torsoKey].map(([x, y]) => (x < -0.05 && y > 0.2 ? [x * (1 - 0.2 * Math.min(1, (y - 0.2) / 0.08)), y] : [x, y])) : TORSO[torsoKey];
  const torso = poly(Tp(torsoPts), 1);
  const SA = shoulders === 'profil' ? T([0.004, 0.292]) : T([sex === 'w' ? 0.088 : 0.098, 0.296]);
  const SB = shoulders === 'profil' ? T([-0.004, 0.292]) : o.armBFront ? T([sex === 'w' ? -0.066 : -0.074, 0.29]) : T([sex === 'w' ? -0.088 : -0.098, 0.296]);
  // head transform
  const tilt = (o.headTilt || 0) - lean * 0.35;
  const O = add(T([OCT[0], 0.33]), rotv([0, (OCT[1] - 0.33) * ty + (hs - 0.98) * 0.06], TR * 0.65));
  const TH = (p) => { const v = rotv([p[0] * hs, p[1] * hs], tilt); return [O[0] + v[0], O[1] + v[1]]; };
  const K = {
    P: (x, y) => TH([x, y]), pts: (arr) => arr.map(TH),
    blob: (x, y, rx, ry = rx, rot = 0, n = 28) => { const q = TH([x, y]); return blob(q[0], q[1], rx * hs, ry * hs, rot + tilt, n); },
    limb: (ctrl, opt) => limb(ctrl.map(([x, y, w]) => { const q = TH([x, y]); return [q[0], q[1], w * hs]; }), opt),
    pen, hs, col: C, skin, skinD,
  };
  const neckTop = TH([0.012, -0.055]);
  const neck = limb([[...T([0.012, 0.29]), 0.075 * tx], [...lerp2(T([0.014, 0.31]), neckTop, 0.5), 0.066 * Math.max(1, hs * 0.9)], [neckTop[0], neckTop[1], 0.07 * hs]]);

  const bodyLayers = [];
  const skinFill = { top: skinL, bottom: skin };
  // torso skin
  bodyLayers.push({
    shapes: [torso, neck], fill: { top: skin, bottom: shade(skin, 0.08) },
    deco: (c, bb) => {
      pen.vol(c, bb);
      if (shoulders !== 'profil' && !kid) { // gentle chest line + navel
        pen.curve(c, [T([0.02, 0.215]), T([0.055, 0.205]), T([0.08, 0.215])], skinD, 0.006, 0.45);
      }
    },
  });

  // cross-legged seat: thighs + crossed shins (part of body)
  let sitKnee = null;
  if (pose === 'sit') {
    const knee = [Hp[0] + 0.27 * legK, 0.062];
    sitKnee = knee;
    const shin = limb([[knee[0] + 0.012, 0.040, 0.070 * lw], [Hp[0] + 0.13 * legK, 0.030, 0.064 * lw], [Hp[0] + 0.02, 0.030, 0.058 * lw]]);
    const foot = xf(poly(FOOT.map(([x, y]) => [x * footK, y * footK]), 2), { x: knee[0] - 0.035, y: 0.050, rot: -0.12, flipX: true });
    const thighs = limb([[Hp[0] - 0.03, Hp[1], 0.14 * lw], [Hp[0] + 0.12 * legK, 0.078, 0.122 * lw], [knee[0], knee[1], 0.10 * lw]]);
    bodyLayers.push({ shapes: [shin, foot], fill: { top: skin, bottom: skinD }, deco: (c, bb) => pen.vol(c, bb) });
    bodyLayers.push({ shapes: [thighs], fill: { top: skinL, bottom: skin }, deco: (c, bb) => { pen.vol(c, bb); pen.curve(c, [[knee[0] - 0.01, 0.095], [knee[0] + 0.02, 0.085]], skinD, 0.004, 0.6); } });
  }

  // ------------------------------------------------------------ GARMENTS
  const linen = o.garmentCol || C.linen, linenSh = C.linenSh;
  const pleats = (c, x0, x1, y0, y1, n, slant = 0.25, col = linenSh, a = 0.75) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
      pen.line(c, [T([x, y0]), T([x + slant * (y1 - y0), y1])], col, 0.006, a);
    }
  };
  const hemY = (h) => (h - Hp[1] + gy) / ty; // ground-relative hem height -> torso frame y
  if (mummy) {
    const sh = hemY(0.0);
    const wrap = poly(Tp([[-0.11, 0.30], [-0.11, 0.20], [-0.08, 0.05], [-0.075, -0.10], [-0.07, -0.25], [-0.065, sh + 0.02], [-0.07, sh], [0.15, sh], [0.15, sh + 0.04], [0.09, sh + 0.06], [0.075, -0.25],
      [0.085, -0.05], [0.10, 0.10], [0.12, 0.24], [0.12, 0.31], [0.05, 0.335], [-0.04, 0.335]]), 1);
    bodyLayers.push({
      shapes: [wrap], fill: { top: o.garmentCol || C.linen, bottom: linenSh },
      deco: (c, bb) => {
        pen.vol(c, bb);
        for (let i = 0; i < 14; i++) { const y = 0.30 - i * ((0.30 - sh) / 14); pen.line(c, [T([-0.12, y + 0.02]), T([0.16, y - 0.015])], linenSh, 0.007, 0.8); }
        if (o.mummyBand !== false) pen.line(c, [T([0.06, 0.12]), T([0.05, sh + 0.04])], C.gold, 0.02, 0.9);
      },
    });
  }
  const kiltTop = 0.115;
  const mkKilt = (hemCT, frontX, backX, col = linen) => poly(Tp([[-0.064, kiltTop], [-0.074, 0.05], [-0.086, -0.04], [backX, hemCT], [backX + 0.03, hemCT - 0.008], [0.04, hemCT - 0.012], [frontX, hemCT - 0.002],
    [frontX - 0.012, hemCT + 0.05], [0.082, -0.03], [0.064, 0.06], [0.062, kiltTop]]), 1);
  const beltLayer = (gold) => ({
    shapes: [poly(Tp([[-0.066, kiltTop + 0.012], [0.066, kiltTop + 0.012], [0.064, kiltTop - 0.022], [-0.068, kiltTop - 0.022]]), 0)],
    fill: gold ? C.gold : shade(linen, 0.08),
    deco: (c) => { if (gold) { for (let i = 0; i < 7; i++) { const x = -0.06 + i * 0.02; pen.line(c, [T([x, kiltTop + 0.01]), T([x + 0.01, kiltTop - 0.02])], C.lapis, 0.006, 0.9); } } },
  });
  let kiltHem = null;
  if (garment === 'schurz' || garment === 'schurz_kurz' || garment === 'schurz_lang') {
    const hemCT = pose === 'sit' ? -0.03 : garment === 'schurz' ? -0.150 : garment === 'schurz_kurz' ? -0.105 : hemY(0.17);
    kiltHem = hemCT;
    const front = garment === 'schurz_lang' ? 0.15 : garment === 'schurz' ? 0.125 : 0.10;
    const kc = garment === 'schurz_kurz' ? (o.garmentCol || '#efe6d2') : linen;
    if (pose === 'sit') {
      const k = sitKnee, bt = T([0.0, kiltTop]);
      const lapKilt = poly([T([-0.066, kiltTop]), T([0.062, kiltTop]), [Hp[0] + 0.07, 0.142], [k[0] - 0.05, 0.134], [k[0] - 0.03, 0.11], [k[0] - 0.04, 0.07], [Hp[0] + 0.08, 0.05], [Hp[0] - 0.04, 0.035], [Hp[0] - 0.085, 0.05], [T([-0.086, 0.0])[0], bt[1] - 0.06]], 1);
      bodyLayers.push({ shapes: [lapKilt], fill: { top: kc, bottom: mix(kc, linenSh, 0.6) }, deco: (c, bb) => { pen.vol(c, bb, 'rgba(60,40,15,0.18)'); for (let i = 0; i < 6; i++) pen.line(c, [[Hp[0] - 0.05 + i * 0.035, 0.13], [Hp[0] - 0.06 + i * 0.04, 0.03]], linenSh, 0.005, 0.6); } });
    } else bodyLayers.push({
      shapes: [mkKilt(hemCT, front, garment === 'schurz_lang' ? -0.115 : -0.098, kc)], fill: { top: kc, bottom: mix(kc, linenSh, 0.5) },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(60,40,15,0.18)');
        if (garment !== 'schurz_kurz') pleats(c, -0.05, front - 0.02, kiltTop - 0.02, hemCT + 0.01, garment === 'schurz_lang' ? 9 : 7, 0.18);
        // wrap edge (front panel)
        pen.curve(c, [T([0.03, kiltTop - 0.01]), T([0.07, (kiltTop + hemCT) / 2]), T([front - 0.012, hemCT + 0.004])], linenSh, 0.008, 0.9);
      },
    });
    bodyLayers.push(beltLayer(!!o.royal));
    if (o.royal) {
      const ap = poly(Tp([[0.040, kiltTop - 0.02], [0.088, kiltTop - 0.02], [0.098, hemCT + 0.015], [0.050, hemCT + 0.012]]), 0);
      bodyLayers.push({
        shapes: [ap], fill: C.gold,
        deco: (c) => {
          for (let i = 0; i < 9; i++) { const y = kiltTop - 0.035 - i * ((kiltTop - hemCT) / 10); pen.line(c, [T([0.04, y]), T([0.1, y])], i % 2 ? C.lapis : C.carn, 0.008, 0.95); }
          pen.line(c, [T([0.069, kiltTop - 0.02]), T([0.074, hemCT + 0.015])], C.goldD, 0.004, 0.7);
        },
      });
    }
  }
  if (garment === 'gewand') {
    const h = hemY(o.hem ?? 0.06);
    kiltHem = h;
    const robe = poly(Tp([[-0.090, 0.252], [-0.070, 0.20], [-0.060, 0.12], [-0.075, 0.02], [-0.095, -0.15], [-0.125, h + 0.04], [-0.135, h], [0.15, h], [0.145, h + 0.05], [0.10, -0.12],
      [0.075, 0.03], [0.062, 0.11], [0.074, 0.17], [0.092, 0.215], [0.100, 0.252]]), 1);
    bodyLayers.push({
      shapes: [robe], fill: { top: linen, bottom: mix(linen, linenSh, 0.6) },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(60,40,15,0.16)');
        for (let i = 0; i < 6; i++) { const x = -0.08 + i * 0.04; pen.line(c, [T([x * 0.8, 0.2]), T([x * 1.05 + 0.01, h + 0.01])], linenSh, 0.006, 0.6); }
        pen.line(c, [T([-0.09, 0.248]), T([0.10, 0.248])], linenSh, 0.008, 0.9);
      },
    });
    // ties over the shoulders
    bodyLayers.push({ shapes: [limb([[...T([0.0, 0.33]), 0.012], [...T([0.03, 0.29]), 0.011], [...T([0.05, 0.255]), 0.01]]), limb([[...T([0.04, 0.33]), 0.012], [...T([0.07, 0.29]), 0.011], [...T([0.08, 0.255]), 0.01]])], fill: linenSh });
  }
  if (garment === 'kleid') {
    const h = hemY(o.hem ?? 0.07);
    kiltHem = h;
    const dc = o.garmentCol || linen;
    const dress = poly(Tp([[-0.094, 0.262], [-0.074, 0.225], [-0.054, 0.17], [-0.050, 0.11], [-0.066, 0.04], [-0.080, -0.04], [-0.094, -0.18], [-0.112, h + 0.02], [-0.118, h], [0.125, h], [0.122, h + 0.03], [0.100, -0.18],
      [0.080, -0.03], [0.058, 0.07], [0.054, 0.125], [0.074, 0.168], [0.096, 0.192], [0.103, 0.215], [0.100, 0.248], [0.098, 0.262]]), 1);
    bodyLayers.push({
      shapes: [dress, limb([[...T([0.06, 0.262]), 0.026], [...T([0.035, 0.33]), 0.022]])], fill: { top: dc, bottom: mix(dc, linenSh, 0.55) },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(60,40,15,0.16)');
        for (let i = 0; i < 5; i++) { const x = -0.06 + i * 0.035; pen.curve(c, [T([x, 0.08]), T([x - 0.005, -0.1]), T([x * 1.35 + 0.01, h + 0.01])], linenSh, 0.005, 0.55); }
        if (o.sash) pen.line(c, [T([-0.055, 0.12]), T([0.058, 0.12])], o.sash, 0.018, 0.95);
      },
    });
  }
  if (garment === 'chiton') {
    const h = hemY(o.hem ?? 0.05);
    kiltHem = h;
    const dc = o.garmentCol || '#f4ecdc';
    const robe = poly(Tp([[-0.110, 0.30], [-0.095, 0.25], [-0.070, 0.18], [-0.058, 0.11], [-0.072, 0.03], [-0.090, -0.12], [-0.118, h + 0.03], [-0.128, h], [0.140, h], [0.135, h + 0.04], [0.105, -0.12],
      [0.082, 0.02], [0.064, 0.10], [0.080, 0.165], [0.100, 0.20], [0.112, 0.26], [0.118, 0.30], [0.08, 0.322], [0.02, 0.326], [-0.06, 0.32]]), 1);
    bodyLayers.push({
      shapes: [robe], fill: { top: dc, bottom: mix(dc, linenSh, 0.6) },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(60,40,15,0.16)');
        for (let i = 0; i < 7; i++) { const x = -0.07 + i * 0.03; pen.curve(c, [T([x, 0.10]), T([x + 0.004, -0.1]), T([x * 1.3 + 0.012, h + 0.01])], linenSh, 0.005, 0.6); }
        pen.line(c, [T([-0.13, h + 0.012]), T([0.14, h + 0.012])], C.gold, 0.012, 0.95);
      },
    });
    // mantle (himation) draped diagonally from the back shoulder to the front hip
    const mc = o.mantleCol || '#5a3f8a';
    const mantle = poly(Tp([[-0.118, 0.31], [-0.06, 0.322], [-0.02, 0.30], [0.05, 0.20], [0.095, 0.10], [0.11, 0.02], [0.115, -0.08], [0.06, -0.06], [-0.02, 0.0], [-0.08, 0.06], [-0.10, -0.05], [-0.115, -0.2], [-0.13, -0.10], [-0.125, 0.12]]), 2);
    bodyLayers.push({
      shapes: [mantle], fill: { top: tint(mc, 0.1), bottom: shade(mc, 0.15) },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(20,10,30,0.25)');
        pen.curve(c, [T([-0.10, 0.29]), T([0.0, 0.2]), T([0.07, 0.08]), T([0.10, -0.05])], shade(mc, 0.35), 0.008, 0.7);
        pen.curve(c, [T([-0.08, 0.06]), T([0.0, 0.03]), T([0.1, -0.05])], C.gold, 0.012, 0.95);
      },
    });
  }
  if (garment === 'anzug1922') {
    const jc = o.garmentCol || '#8a7a62';
    const jacket = poly(Tp([[-0.078, -0.12], [-0.072, 0.0], [-0.064, 0.10], [-0.072, 0.20], [-0.078, 0.27], [-0.068, 0.315], [-0.040, 0.338], [0.012, 0.344], [0.050, 0.326], [0.074, 0.28], [0.080, 0.21],
      [0.072, 0.14], [0.070, 0.06], [0.080, -0.02], [0.084, -0.11], [0.03, -0.13]]), 1);
    bodyLayers.push({
      shapes: [jacket], fill: { top: tint(jc, 0.06), bottom: shade(jc, 0.12) },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(30,20,10,0.25)');
        // waistcoat + shirt opening (V) at the front
        pen.fill(c, [T([0.074, 0.29]), T([0.040, 0.325]), T([0.040, 0.20]), T([0.072, 0.17])], shade(jc, 0.2), 0.95);
        pen.fill(c, [T([0.070, 0.30]), T([0.043, 0.33]), T([0.050, 0.25]), T([0.072, 0.24])], '#f4efe4', 1);
        pen.curve(c, [T([0.043, 0.33]), T([0.038, 0.24]), T([0.05, 0.12]), T([0.084, -0.11])], shade(jc, 0.35), 0.008, 0.9);
        for (const y of [0.16, 0.10, 0.04]) pen.dot(c, T([0.074, y]), 0.007, '#3a2e22');
        pen.line(c, [T([-0.07, 0.02]), T([-0.01, 0.03])], shade(jc, 0.3), 0.006, 0.7); // pocket
        pen.line(c, [T([0.0, 0.25]), T([0.04, 0.25])], shade(jc, 0.3), 0.005, 0.7);
      },
    });
    // bow tie + collar
    bodyLayers.push({ shapes: [poly(Tp([[0.052, 0.338], [0.078, 0.33], [0.070, 0.312], [0.050, 0.322]]), 0)], fill: '#f4efe4' });
    bodyLayers.push({ shapes: [poly(Tp([[0.064, 0.322], [0.084, 0.334], [0.086, 0.31], [0.066, 0.316]]), 1)], fill: '#5a2a24' });
  }
  if (garment === 'gehrock1822') {
    const jc = o.garmentCol || '#2e3646';
    const coatPts = [[-0.080, -0.26], [-0.074, -0.10], [-0.068, 0.02], [-0.062, 0.10], [-0.072, 0.20], [-0.078, 0.27], [-0.068, 0.32], [-0.040, 0.345], [-0.005, 0.36], [0.030, 0.35], [0.064, 0.30], [0.078, 0.24],
      [0.074, 0.16], [0.066, 0.07], [0.076, -0.02], [0.092, -0.20], [0.096, -0.255], [0.02, -0.262]];
    const coat = poly(Tp(pose === 'chair' ? [[-0.09, -0.07], [-0.074, -0.02], ...coatPts.slice(2, 16), [0.09, -0.02], [0.13, -0.04], [0.14, -0.075], [0.02, -0.08]] : coatPts), 1);
    bodyLayers.push({
      shapes: [coat], fill: { top: tint(jc, 0.08), bottom: shade(jc, 0.1) },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(10,10,20,0.28)', 'rgba(255,255,255,0.10)');
        pen.fill(c, [T([0.072, 0.29]), T([0.035, 0.33]), T([0.045, 0.18]), T([0.074, 0.18])], '#d8c9a8', 1); // waistcoat
        pen.curve(c, [T([0.036, 0.33]), T([0.03, 0.22]), T([0.06, 0.10]), T([0.09, -0.2])], tint(jc, 0.25), 0.008, 0.8);
        for (const y of [0.15, 0.08, 0.01]) pen.dot(c, T([0.07, y]), 0.006, '#c9a64a');
        pen.curve(c, [T([-0.07, 0.02]), T([-0.02, 0.0]), T([0.02, 0.01])], shade(jc, 0.4), 0.007, 0.7);
      },
    });
    // high white collar + cravat
    bodyLayers.push({ shapes: [poly(Tp([[0.020, 0.33], [0.080, 0.330], [0.090, 0.37], [0.074, 0.39], [0.040, 0.36], [0.015, 0.36]]), 1)], fill: '#fbf8ef' });
    bodyLayers.push({ shapes: [poly(Tp([[0.03, 0.335], [0.082, 0.33], [0.088, 0.29], [0.065, 0.28], [0.05, 0.31]]), 1)], fill: '#f1ece0', deco: (c) => pen.line(c, [T([0.05, 0.33]), T([0.075, 0.30])], '#cfc6b2', 0.005) });
  }

  // leopard skin (Sem priest)
  if (o.leopard) {
    const pelt = poly(Tp([[-0.122, 0.30], [-0.070, 0.326], [-0.010, 0.318], [0.045, 0.27], [0.080, 0.20], [0.088, 0.10], [0.082, 0.02], [0.05, -0.08], [0.0, -0.13], [-0.05, -0.16], [-0.09, -0.12], [-0.098, 0.0], [-0.112, 0.14], [-0.126, 0.24]]), 2);
    const paw = limb([[...T([0.06, 0.02]), 0.04], [...T([0.075, -0.07]), 0.034], [...T([0.08, -0.15]), 0.03]]);
    const tail = limb([[...T([-0.06, -0.12]), 0.028], [...T([-0.08, -0.2]), 0.022], [...T([-0.07, -0.27]), 0.016]]);
    bodyLayers.push({
      shapes: [pelt, paw, tail], fill: { top: '#e2b04a', bottom: '#c88a2e' },
      deco: (c, bb) => {
        pen.vol(c, bb, 'rgba(60,30,5,0.25)');
        let s = 3;
        const R = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        for (let i = 0; i < 46; i++) {
          const x = -0.11 + R() * 0.2, y = -0.18 + R() * 0.49;
          const p = T([x, y]);
          for (let k = 0; k < 4; k++) pen.dot(c, add(p, [Math.cos(k * 1.57 + 0.4) * 0.008, Math.sin(k * 1.57 + 0.4) * 0.008]), 0.0042, '#3a220e', 0.9);
        }
        for (const t of [0.0, 0.33, 0.66, 1]) { const p = lerp2(T([0.07, -0.14]), T([0.09, -0.15]), t); pen.dot(c, p, 0.003, '#3a220e'); }
      },
    });
  }

  // ------------------------------------------------------------ COLLAR
  const collar = o.collar || 'none';
  if (collar !== 'none' && !trousers) {
    const prof = shoulders === 'profil';
    const ccx = prof ? 0.03 : 0.010, rx = prof ? 0.062 : (sex === 'w' ? 0.104 : 0.112), ry = collar === 'perlen' ? 0.06 : (prof ? 0.075 : 0.095);
    const cc = [ccx, 0.330];
    const pts = [];
    const a0 = collar === 'perlen' ? 0.42 : 0.2;
    for (let i = 0; i <= 24; i++) { const a = Math.PI + a0 + (i / 24) * (Math.PI - 2 * a0); pts.push([cc[0] + Math.cos(a) * rx, cc[1] + Math.sin(a) * ry]); }
    const inner = [];
    for (let i = 24; i >= 0; i--) { const a = Math.PI + a0 + (i / 24) * (Math.PI - 2 * a0); inner.push([cc[0] + Math.cos(a) * rx * (collar === 'perlen' ? 0.8 : 0.42), cc[1] + Math.sin(a) * ry * (collar === 'perlen' ? 0.8 : 0.42)]); }
    const shape = poly(Tp(pts.concat(inner)), 0);
    const ctr = T(cc), crot = TR;
    bodyLayers.push({
      shapes: [shape], fill: collar === 'perlen' ? C.lapis : C.gold,
      deco: (c) => {
        const R = (k) => [rx * tx * k, ry * ty * k];
        if (collar === 'breit' || collar === 'gold') {
          const bands = collar === 'breit' ? [[0.93, C.goldL, 0.035], [0.83, C.carn, 0.022], [0.73, C.turq, 0.022], [0.63, C.lapis, 0.022], [0.53, C.gold, 0.02]] : [[0.90, C.goldL, 0.03], [0.76, C.lapis, 0.016], [0.62, C.goldL, 0.02], [0.52, C.carn, 0.014]];
          for (const [k, col, w] of bands) { const [a, b] = R(k); pen.arcLow(c, ctr, a, b, crot, col, w, 0.95); }
          // drop beads along the outer edge
          for (let i = 1; i < 16; i++) { const a = Math.PI + (i / 16) * Math.PI; const q = rotv([Math.cos(a) * rx * tx * 0.97, Math.sin(a) * ry * ty * 0.97], crot); pen.dot(c, add(ctr, q), 0.0075, collar === 'breit' ? C.lapis : C.goldD, 0.9); }
        } else {
          const [a, b] = R(0.9); pen.arcLow(c, ctr, a, b, crot, C.turq, 0.012, 1);
          for (let i = 1; i < 12; i++) { const a2 = Math.PI + (i / 12) * Math.PI; const q = rotv([Math.cos(a2) * rx * tx * 0.9, Math.sin(a2) * ry * ty * 0.9], crot); pen.dot(c, add(ctr, q), 0.006, C.carn, 1); }
          const q = rotv([0, -ry * ty * 1.0], crot); pen.dot(c, add(ctr, q), 0.012, C.gold, 1);
        }
      },
    });
  }

  // ------------------------------------------------------------ HEAD
  const face = poly(FACE.map(TH), 1);
  const H = (x, y) => TH([x, y]);
  let head = { layers: [], earOver: false, hideFace: false, hideEar: false };
  const hfn = o.head === 'custom' && o.headFn ? o.headFn : HEADS[headStyle] || HEADS.kurz;
  head = Object.assign(head, hfn(K, o, { sex, kid, style }) || {});
  const eyeStyle = style === 'eu' ? 'eu' : 'eg';
  const faceLayer = {
    shapes: [face], fill: { top: skinL, bottom: skin },
    deco: (c) => {
      pen.glow(c, H(0.040, -0.040), 0.028 * hs, '#e07a5a', sex === 'w' || kid ? 0.42 : 0.28);
      if (head.scalp) pen.glow(c, H(-0.02, 0.07), 0.04 * hs, '#fff3d8', 0.35);
      // brow
      const ink = style === 'eu' ? (o.browCol || '#3a2a20') : C.ink;
      if (eyeStyle === 'eg') {
        pen.curve(c, [H(0.010, 0.029), H(0.030, 0.037), H(0.052, 0.038), H(0.068, 0.030)], ink, 0.0075 * hs, 1);
        const up = [H(0.066, 0.010), H(0.058, 0.019), H(0.044, 0.023), H(0.030, 0.019), H(0.022, 0.012)];
        const lo = [H(0.066, 0.010), H(0.056, 0.003), H(0.042, 0.001), H(0.030, 0.005), H(0.022, 0.012)];
        pen.fill(c, up.concat(lo.slice().reverse()), '#fbf7ec', 1);
        pen.dot(c, H(0.048, 0.0115), 0.0088 * hs, '#1c1816', 1);
        pen.dot(c, H(0.051, 0.015), 0.0026 * hs, '#ffffff', 1);
        pen.curve(c, up.concat([H(0.006, 0.013)]), ink, 0.0052 * hs, 1);
        pen.curve(c, lo, ink, 0.0038 * hs, 1);
      } else {
        pen.curve(c, [H(0.026, 0.033), H(0.045, 0.039), H(0.066, 0.031)], ink, (o.browW || 0.0065) * hs, 1);
        const up = [H(0.064, 0.012), H(0.056, 0.020), H(0.044, 0.022), H(0.033, 0.017), H(0.028, 0.012)];
        const lo = [H(0.064, 0.012), H(0.055, 0.005), H(0.042, 0.004), H(0.032, 0.007), H(0.028, 0.012)];
        pen.fill(c, up.concat(lo.slice().reverse()), '#fbf7ec', 1);
        pen.dot(c, H(0.050, 0.0125), 0.0074 * hs, o.irisCol || '#4a3020', 1);
        pen.dot(c, H(0.051, 0.0125), 0.0040 * hs, '#120c08', 1);
        pen.dot(c, H(0.053, 0.0155), 0.0022 * hs, '#ffffff', 1);
        pen.curve(c, up, '#2a1c14', 0.0042 * hs, 1);
        pen.curve(c, [H(0.06, 0.004), H(0.044, 0.0)], skinD, 0.003 * hs, 0.6);
      }
      // nose wing + mouth (gentle smile)
      pen.curve(c, [H(0.078, -0.026), H(0.072, -0.031), H(0.076, -0.035)], skinD, 0.0045 * hs, 0.8);
      pen.fill(c, [H(0.086, -0.046), H(0.080, -0.041), H(0.078, -0.052), H(0.082, -0.060), H(0.076, -0.058)], o.lipCol || shade(skin, sex === 'w' ? 0.12 : 0.18), 0.55);
      pen.curve(c, [H(0.083, -0.0525), H(0.076, -0.0525), H(0.068, -0.048)], shade(skin, 0.5), 0.0045 * hs, 0.95);
      if (o.beard === 'schnurr') pen.fill(c, [H(0.084, -0.040), H(0.070, -0.039), H(0.058, -0.046), H(0.066, -0.049), H(0.080, -0.047), H(0.087, -0.045)], o.hairCol || '#4a3426', 1);
    },
  };
  const ear = blob(...H(-0.006, -0.008), 0.016 * hs, 0.025 * hs, 0.18 + tilt, 24);
  const earLayer = {
    shapes: [ear], fill: { top: skinL, bottom: skin },
    deco: (c) => {
      pen.curve(c, [H(-0.002, 0.008), H(-0.012, 0.0), H(-0.010, -0.018), H(-0.002, -0.024)], skinD, 0.004 * hs, 0.8);
      if (o.earring) { pen.dot(c, H(-0.006, -0.034), 0.0065 * hs, C.gold, 1); }
    },
  };
  if (!head.hideFace) bodyLayers.push(faceLayer);
  if (!head.hideEar && !head.earOver) bodyLayers.push(earLayer);
  for (const L of head.layers) bodyLayers.push(L);
  if (!head.hideEar && head.earOver) bodyLayers.push(earLayer);
  if (o.earring && !head.hideEar) bodyLayers.push({ shapes: [blob(...H(-0.006, -0.040), 0.008 * hs, 0.011 * hs, 0, 16)], fill: C.gold, deco: (c) => pen.dot(c, H(-0.006, -0.040), 0.004 * hs, C.carn) });
  // reed pen behind the ear
  if (o.reed) bodyLayers.push({ shapes: [limb([[...H(-0.04, 0.075), 0.009 * hs], [...H(0.05, 0.02), 0.008 * hs]])], fill: '#c9b77a', deco: (c) => pen.dot(c, H(0.048, 0.021), 0.004 * hs, C.ink) });
  // beard
  const beard = o.beard || 'none';
  if (beard === 'koenig' || beard === 'gott') {
    const bp = beard === 'koenig'
      ? [[0.052, -0.080], [0.070, -0.083], [0.076, -0.150], [0.058, -0.155], [0.050, -0.10]]
      : [[0.052, -0.080], [0.070, -0.083], [0.080, -0.140], [0.094, -0.160], [0.086, -0.172], [0.064, -0.160], [0.052, -0.10]];
    bodyLayers.push({
      shapes: [poly(bp.map(TH), 1)], fill: beard === 'koenig' && o.beardCol ? o.beardCol : (o.beardCol || C.hair),
      deco: (c) => { for (let i = 0; i < 6; i++) { const y = -0.092 - i * 0.011; pen.line(c, [H(0.048, y), H(0.082, y - 0.004)], C.hairHi, 0.004 * hs, 0.9); } },
    });
    if (head.beardStrap !== false) bodyLayers.push({ shapes: [limb([[...H(0.056, -0.080), 0.006 * hs], [...H(0.02, -0.066), 0.006 * hs], [...H(-0.004, -0.040), 0.005 * hs]])], fill: C.hair, stroke: null });
  }

  // ------------------------------------------------------------ SITTING: papyrus on the lap
  if (pose === 'sit' && o.lap === 'papyrus') {
    const x0 = Hp[0] + 0.07, x1 = Hp[0] + 0.25 * legK;
    const roll = blob(x0, 0.162, 0.021, 0.025, 0.3);
    const sheet = poly([[x0 + 0.004, 0.182], [x1, 0.160], [x1 - 0.004, 0.136], [x0 + 0.004, 0.142]], 0);
    bodyLayers.push({
      shapes: [sheet, roll], fill: { top: '#f5e9c2', bottom: '#e1cf98' },
      deco: (c) => {
        for (let i = 0; i < 4; i++) { const y0 = 0.172 - i * 0.008; pen.line(c, [[x0 + 0.035, y0], [x0 + 0.13, y0 - 0.011]], i === 0 ? C.carn : C.ink, 0.0042, 0.8); }
        pen.ell(c, [x0, 0.162], 0.011, 0.015, 0.3, '#d8c48a', 1);
      },
    });
  }

  // carry pole on the near shoulder
  let poleF = null, poleB = null;
  if (o.carry === 'stange') {
    const L = o.poleLen ?? 1.1;
    const s0 = T([0.06, 0.345]);
    const ang = (o.poleAng ?? 0) + 0;
    poleF = add(s0, [Math.cos(ang) * L * 0.5, Math.sin(ang) * L * 0.5]);
    poleB = add(s0, [-Math.cos(ang) * L * 0.5, -Math.sin(ang) * L * 0.5]);
    bodyLayers.push({ shapes: [limb([[...poleB, 0.032], [...poleF, 0.032]], { caps: true })], fill: { top: tint(C.wood, 0.1), bottom: C.woodD }, deco: (c, bb) => { pen.vol(c, bb); for (const t of [0.04, 0.96]) pen.dot(c, lerp2(poleB, poleF, t), 0.012, C.gold, 1); } });
  }

  // ------------------------------------------------------------ ARMS
  const resolveArm = (v, dflt) => {
    const b = typeof v === 'string' ? ARM_POSES[v] : v;
    return Object.assign({}, ARM_POSES[dflt], b || {});
  };
  const sleeve = garment === 'anzug1922' ? (o.garmentCol || '#8a7a62') : garment === 'gehrock1822' ? (o.garmentCol || '#2e3646') : mummy ? (o.garmentCol || C.linen) : null;
  const shortSleeve = garment === 'chiton' ? (o.garmentCol || '#f4ecdc') : null;
  const armGeom = (S, a) => {
    const ua = 0.165 * armK, fa = 0.150 * armK;
    const E = down(S, a.u, ua), W = down(E, a.f, fa);
    const Um = down(S, a.u, ua * 0.5), Fm = down(E, a.f, fa * 0.5);
    const ctrl = [[S[0], S[1], 0.074 * lw * Math.min(1.1, tx)], [Um[0], Um[1], 0.060 * lw], [E[0], E[1], 0.046 * lw], [Fm[0], Fm[1], 0.046 * lw], [W[0], W[1], 0.035 * lw]];
    const hd = a.f + (a.hb || 0);
    const d = [Math.sin(hd), -Math.cos(hd)], pp = [Math.cos(hd), Math.sin(hd)];
    const at = (t, s = 0) => [W[0] + d[0] * t + pp[0] * s, W[1] + d[1] * t + pp[1] * s];
    let hand, G;
    const hk = lw * (kid ? 0.95 : 1);
    if (a.hand === 'fist') {
      G = at(0.030 * hk);
      hand = [blob(G[0], G[1], 0.031 * hk, 0.026 * hk, Math.atan2(d[1], d[0]), 24), blob(...at(0.022 * hk, 0.017 * hk), 0.012 * hk, 0.011 * hk, 0, 16), limb([[W[0], W[1], 0.034 * lw], [...at(0.02 * hk), 0.04 * hk]])];
    } else {
      G = at(0.05 * hk);
      hand = [limb([[W[0], W[1], 0.034 * lw], [...at(0.03 * hk), 0.041 * hk], [...at(0.066 * hk, -0.002), 0.032 * hk], [...at(0.088 * hk, -0.004), 0.012 * hk]]),
        limb([[...at(0.012 * hk, 0.012 * hk), 0.017 * hk], [...at(0.036 * hk, 0.024 * hk), 0.012 * hk], [...at(0.048 * hk, 0.026 * hk), 0.006 * hk]])];
    }
    return { S, E, W, ctrl, hand, G, d, pp, hd };
  };
  const armParts = {};
  const grips = {};
  const mkArm = (name, S, cfg, holdSpec, far) => {
    const g = armGeom(S, cfg);
    grips[name] = g;
    const layers = [];
    const pr = holdSpec ? makeProp(holdSpec, g, { C, pen, gy, hs, U, lw, kid, far }) : { under: [], over: [] };
    for (const L of pr.under) layers.push(L);
    const arm = limb(g.ctrl);
    if (sleeve) {
      const sc = g.ctrl.map(([x, y, w], i) => [x, y, w * (i === 4 ? 1.35 : 1.25)]);
      layers.push({ shapes: [limb(sc)], fill: { top: tint(sleeve, 0.08), bottom: shade(sleeve, 0.1) }, deco: (c, bb) => { pen.vol(c, bb, 'rgba(20,10,5,0.25)'); pen.curve(c, [lerp2(g.S, g.E, 0.95), g.E, lerp2(g.E, g.W, 0.1)], shade(sleeve, 0.3), 0.006, 0.6); } });
      if (!mummy) layers.push({ shapes: [limb([[...lerp2(g.E, g.W, 0.86), 0.05 * lw], [...g.W, 0.046 * lw]])], fill: '#f7f2e6' });
      layers.push({ shapes: g.hand, fill: skinFill, deco: (c, bb) => pen.vol(c, bb) });
    } else {
      layers.push({
        shapes: [arm, ...g.hand], fill: skinFill,
        deco: (c, bb) => {
          pen.vol(c, bb);
          if (o.bands) {
            const p1 = lerp2(g.S, g.E, 0.62), n1 = rotv(norm(sub(g.E, g.S)), Math.PI / 2);
            pen.line(c, [add(p1, mul(n1, 0.05)), add(p1, mul(n1, -0.05))], C.gold, 0.018, 1);
            pen.line(c, [add(p1, mul(n1, 0.05)), add(p1, mul(n1, -0.05))], C.lapis, 0.006, 1);
            const p2 = lerp2(g.E, g.W, 0.84), n2 = rotv(norm(sub(g.W, g.E)), Math.PI / 2);
            pen.line(c, [add(p2, mul(n2, 0.04)), add(p2, mul(n2, -0.04))], C.gold, 0.02, 1);
            pen.line(c, [add(p2, mul(n2, 0.04)), add(p2, mul(n2, -0.04))], C.carn, 0.006, 1);
          }
          // fingers hint for open hand
          if (cfg.hand !== 'fist') pen.line(c, [add(g.W, mul(g.d, 0.05 * lw)), add(g.W, mul(g.d, 0.085 * lw))], skinD, 0.003, 0.6);
          else pen.curve(c, [add(g.G, add(mul(g.d, 0.012), mul(g.pp, -0.016))), add(g.G, mul(g.d, 0.024)), add(g.G, add(mul(g.d, 0.012), mul(g.pp, 0.012)))], skinD, 0.004, 0.7);
        },
      });
      if (shortSleeve) layers.push({ shapes: [limb([[g.S[0], g.S[1], 0.09], [...lerp2(g.S, g.E, 0.5), 0.075]])], fill: { top: shortSleeve, bottom: mix(shortSleeve, linenSh, 0.5) }, deco: (c) => pen.line(c, [add(lerp2(g.S, g.E, 0.5), [-0.03, 0.0]), add(lerp2(g.S, g.E, 0.5), [0.03, 0.0])], C.gold, 0.01, 0.9) });
    }
    for (const L of pr.over) layers.push(L);
    const part = { z: 0, pivot: M(S), layers: far ? layers.map(farShade) : layers };
    return part;
  };
  const defA = 'haengen', defB = 'rueck';
  const cfgA = resolveArm(o.armA, defA), cfgB = resolveArm(o.armB, defB);
  armParts.armA = mkArm('armA', SA, cfgA, o.holdA, false);
  armParts.armB = mkArm('armB', SB, cfgB, o.holdB, !o.armBFront);

  // ------------------------------------------------------------ LEG PARTS
  const legParts = {};
  const legCol = trousers ? (o.trouserCol || (garment === 'gehrock1822' ? '#d6c49c' : (o.garmentCol || '#8a7a62'))) : null;
  const mkLeg = (k, far) => {
    const g = legs[k], L = LP[k];
    const layers = [];
    if (trousers) {
      const tc = g.ctrl.map(([x, y, w], i) => [x, y, w * (i === 0 ? 1.15 : i === 4 ? 1.9 : 1.35)]);
      layers.push({ shapes: [limb(tc)], fill: { top: tint(legCol, 0.05), bottom: shade(legCol, 0.12) }, deco: (c, bb) => { pen.vol(c, bb, 'rgba(20,10,5,0.22)'); pen.curve(c, [lerp2(g.K, Hp, 0.4), g.K, lerp2(g.K, g.A, 0.3)], shade(legCol, 0.25), 0.006, 0.6); } });
      layers.push({ shapes: [footShape(g.A, L.psi, true)], fill: { top: '#4a3a30', bottom: '#241a14' }, deco: (c) => { const s = footShape(g.A, L.psi, true); pen.line(c, [s[Math.floor(s.length * 0.08)], s[Math.floor(s.length * 0.32)]], '#6a5a4a', 0.004, 0.6); } });
    } else {
      layers.push({ shapes: [limb(g.ctrl), footShape(g.A, L.psi, false)], fill: { top: skinL, bottom: skin }, deco: (c, bb) => { pen.vol(c, bb); pen.curve(c, [add(g.K, [0.02, 0.01]), add(g.K, [0.026, -0.006])], skinD, 0.004, 0.5); } });
      if (o.sandals) {
        const s = xf(poly([[-0.044, -0.038], [0.124, -0.038], [0.128, -0.046], [-0.046, -0.046]].map(([x, y]) => [x * footK, y * footK]), 1), { x: g.A[0], y: g.A[1], rot: L.psi || 0 });
        layers.push({ shapes: [s], fill: '#c9a26a', deco: () => {} });
        layers.push({ shapes: [limb([[...add(g.A, rotv([0.07 * footK, -0.034 * footK], L.psi || 0)), 0.006], [...add(g.A, rotv([0.004, -0.004], L.psi || 0)), 0.007]])], fill: '#a67c45', stroke: null });
      }
    }
    return { z: 0, pivot: M(Hp), layers: far ? layers.map(farShade) : layers };
  };
  if (LP && !mummy) { legParts.legA = mkLeg('A', true); legParts.legB = mkLeg('B', false); }

  // ------------------------------------------------------------ CHAIR (pose 'chair')
  let chair = null;
  if (pose === 'chair') {
    const seatY = Hp[1] - 0.045, wc = o.chairCol || '#7a4a2a';
    const seat = poly([[-0.12, seatY], [0.17, seatY], [0.17, seatY - 0.035], [-0.12, seatY - 0.035]], 1);
    const legF = poly([[0.13, seatY - 0.03], [0.155, seatY - 0.03], [0.15, gy], [0.132, gy]], 0);
    const legBk = poly([[-0.115, seatY - 0.03], [-0.09, seatY - 0.03], [-0.095, gy], [-0.115, gy]], 0);
    const back = poly([[-0.12, seatY], [-0.095, seatY], [-0.075, seatY + 0.36], [-0.105, seatY + 0.37]], 1);
    const rail = limb([[-0.11, seatY + 0.34, 0.035], [-0.07, seatY + 0.35, 0.035]]);
    chair = { z: -1, layers: [{ shapes: [seat, legF, legBk, back, rail], fill: { top: tint(wc, 0.1), bottom: shade(wc, 0.2) }, deco: (c, bb) => { pen.vol(c, bb); pen.line(c, [[-0.1, seatY + 0.12], [-0.088, seatY + 0.28]], shade(wc, 0.35), 0.008, 0.7); } }] };
  }

  // ------------------------------------------------------------ ASSEMBLE
  const fin = (L) => ({ ...L, shapes: L.shapes.map(SC) });
  const finPart = (P) => ({ ...P, layers: P.layers.map(fin) });
  const parts = {};
  parts.body = finPart({ z: 3, layers: bodyLayers });
  if (legParts.legA) parts.legA = finPart({ ...legParts.legA, z: 0 });
  parts.armB = finPart({ ...armParts.armB, z: o.armBFront ? 3.5 : 1 });
  if (legParts.legB) parts.legB = finPart({ ...legParts.legB, z: 2 });
  parts.armA = finPart({ ...armParts.armA, z: 4 });
  if (chair) parts.stuhl = finPart(chair);

  // anchors
  const topY = head.top ? TH(head.top) : H(0.0, 0.085);
  let maxY = -1e9; for (const P of Object.values(parts)) for (const L of P.layers) for (const s of L.shapes) for (const p of s) if (p[1] > maxY) maxY = p[1];
  const anchors = {
    head: M(H(0.0, 0.0)), eye: M(H(0.046, 0.012)), mouth: M(H(0.084, -0.052)), krone: M(H(-0.004, 0.084)), top: [M(topY)[0], maxY],
    handA: M(grips.armA.W), handB: M(grips.armB.W), gripA: M(grips.armA.G), gripB: M(grips.armB.G),
    shoulderA: M(SA), shoulderB: M(SB), hip: M(Hp), chest: M(T([0.06, 0.22])), back: M(T([-0.07, 0.22])),
    foot: legs.B ? [M(legs.B.A)[0], 0] : [0, 0],
  };
  if (poleF) { anchors.poleFront = M(poleF); anchors.poleBack = M(poleB); }
  const ranges = {};
  if (LP && !['kneel', 'chair'].includes(pose)) { ranges.legA = [0, -0.35]; ranges.legB = [0, 0.35]; }
  ranges.armA = [0, 0.5]; ranges.armB = [0, -0.5];
  const walkish = LP && !['kneel', 'chair'].includes(pose);
  const sw = mummy ? 0 : (garment === 'kleid' || garment === 'gewand' || garment === 'chiton' || garment === 'schurz_lang') ? 0.16 : 0.34;
  const meta = {
    name: o.name || id, heightM, lengthM: heightM, pose,
    pivots: { armA: M(SA), armB: M(SB), legA: M(Hp), legB: M(Hp) },
    ranges,
    swing: walkish ? { legA: [-sw, sw], legB: [-sw, sw], armA: [-0.25, 0.25], armB: [-0.25, 0.25] } : {},
    crownW: 0.2 * hs * U,
  };
  return { id, parts, anchors, meta };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };

// =====================================================================================================
// HEADS: (K, o, info) -> { layers, earOver, hideFace, hideEar, scalp, top }   (head-local coords, see header)
// =====================================================================================================
const wigTex = (K, kind = 'curls') => (c, bb) => {
  const { pen } = K; const hs = K.hs;
  if (kind === 'curls') {
    for (let r = 0; r < 14; r++) {
      const y = 0.10 - r * 0.0135;
      for (let i = 0; i < 12; i++) { const x = -0.11 + i * 0.016 + (r % 2) * 0.008; pen.curve(c, [K.P(x - 0.007, y), K.P(x, y - 0.007), K.P(x + 0.007, y)], EG.hairHi, 0.0035 * hs, 0.75); }
    }
  } else {
    for (let i = 0; i < 16; i++) { const x = -0.13 + i * 0.012; pen.line(c, [K.P(x + 0.03, 0.11), K.P(x - 0.005, 0.03), K.P(x, -0.26)], EG.hairHi, 0.0035 * hs, 0.7); }
  }
  pen.vol(c, bb, 'rgba(0,0,0,0.2)', 'rgba(255,255,255,0.10)');
};
const headBand = (K, col, lotus, front = [0.064, 0.050], back = [-0.098, 0.040]) => {
  const L = [{ shapes: [K.limb([[back[0], back[1], 0.016], [(front[0] + back[0]) / 2, front[1] + 0.012, 0.016], [front[0], front[1], 0.015]])], fill: col, deco: (c) => { for (let i = 0; i < 6; i++) K.pen.dot(c, K.P(back[0] + 0.03 + i * 0.022, front[1] + 0.006), 0.003 * K.hs, EG.goldL, 0.9); } }];
  if (lotus) L.push({ shapes: [K.blob(back[0] - 0.006, back[1], 0.012, 0.012), K.limb([[back[0], back[1] + 0.004, 0.016], [back[0] - 0.035, back[1] + 0.03, 0.03], [back[0] - 0.05, back[1] + 0.04, 0.0]])], fill: { top: '#ffffff', bottom: '#9fc3e6' } });
  return L;
};
const uraeus = (K, x = 0.066, y = 0.054) => ({
  shapes: [K.limb([[x - 0.006, y - 0.004, 0.012], [x + 0.008, y + 0.010, 0.014], [x + 0.006, y + 0.028, 0.018], [x + 0.012, y + 0.038, 0.012]]), K.blob(x + 0.008, y + 0.026, 0.011, 0.016, 0.1)],
  fill: EG.gold, deco: (c) => { K.pen.line(c, [K.P(x + 0.006, y + 0.016), K.P(x + 0.008, y + 0.034)], EG.lapis, 0.004 * K.hs, 1); K.pen.dot(c, K.P(x + 0.014, y + 0.036), 0.0025 * K.hs, EG.carn); },
});

export const HEADS = {
  kurz(K, o) {
    const wig = K.pts([[0.062, 0.056], [0.052, 0.079], [0.026, 0.097], [-0.010, 0.106], [-0.050, 0.100], [-0.080, 0.080], [-0.100, 0.046], [-0.108, 0.0], [-0.104, -0.045], [-0.092, -0.074],
      [-0.062, -0.086], [-0.032, -0.082], [-0.014, -0.062], [-0.002, -0.032], [0.010, -0.002], [0.022, 0.028], [0.040, 0.047]]);
    const L = [{ shapes: [poly(wig, 1)], fill: o.wigCol || EG.hair, deco: wigTex(K, 'curls') }];
    if (o.band) L.push(...headBand(K, o.band, o.lotus));
    if (o.uraeus) L.push(uraeus(K));
    return { layers: L };
  },
  bob(K, o) {
    const wig = K.pts([[0.062, 0.056], [0.052, 0.080], [0.025, 0.100], [-0.012, 0.108], [-0.052, 0.101], [-0.088, 0.078], [-0.110, 0.032], [-0.120, -0.04], [-0.122, -0.11], [-0.115, -0.158],
      [-0.06, -0.170], [-0.012, -0.152], [0.010, -0.122], [0.008, -0.06], [0.006, -0.02], [0.016, 0.014], [0.030, 0.035], [0.046, 0.050]]);
    const L = [{ shapes: [poly(wig, 1)], fill: o.wigCol || EG.hair, deco: wigTex(K, 'strands') }];
    if (o.band) L.push(...headBand(K, o.band, o.lotus));
    if (o.uraeus) L.push(uraeus(K));
    return { layers: L };
  },
  lang(K, o) {
    const cap = K.pts([[0.062, 0.056], [0.052, 0.080], [0.025, 0.100], [-0.012, 0.109], [-0.054, 0.102], [-0.088, 0.080], [-0.110, 0.040], [-0.120, -0.02], [-0.126, -0.10], [-0.130, -0.18], [-0.126, -0.232],
      [-0.090, -0.244], [-0.062, -0.200], [-0.050, -0.12], [-0.040, -0.07], [-0.020, -0.04], [0.016, 0.010], [0.030, 0.032], [0.046, 0.050]]);
    const lap = K.pts([[0.004, 0.02], [0.022, 0.028], [0.034, -0.03], [0.040, -0.12], [0.046, -0.200], [0.048, -0.250], [0.002, -0.256], [-0.004, -0.19], [-0.010, -0.10], [-0.014, -0.03]]);
    const L = [
      { shapes: [poly(cap, 1)], fill: o.wigCol || EG.hair, deco: wigTex(K, 'strands') },
    ];
    if (o.band) L.push(...headBand(K, o.band, o.lotus));
    if (o.uraeus) L.push(uraeus(K));
    L.push({ shapes: [poly(lap, 1)], fill: o.wigCol || EG.hair, deco: (c, bb) => { for (let i = 0; i < 4; i++) K.pen.line(c, [K.P(0.004 + i * 0.012, 0.0), K.P(0.004 + i * 0.012, -0.25)], EG.hairHi, 0.0035 * K.hs, 0.75); if (o.wigRings !== false) for (const y of [-0.215, -0.235]) K.pen.line(c, [K.P(-0.006, y), K.P(0.05, y)], o.ringCol || EG.gold, 0.008 * K.hs, 0.95); } });
    return { layers: L };
  },
  kahl(K, o) {
    const L = [];
    if (o.uraeus) L.push(uraeus(K));
    return { layers: L, scalp: true };
  },
  jugendlocke(K, o) {
    const lock = K.limb([[-0.038, 0.050, 0.030], [-0.058, 0.0, 0.030], [-0.062, -0.06, 0.026], [-0.050, -0.105, 0.022], [-0.030, -0.120, 0.018], [-0.020, -0.105, 0.012]]);
    return {
      scalp: true, earOver: false,
      layers: [{ shapes: [lock], fill: o.wigCol || EG.hair, deco: (c) => { for (let i = 0; i < 8; i++) { const p = K.P(-0.05 - (i < 6 ? 0.008 : 0), 0.04 - i * 0.02); K.pen.curve(c, [[p[0] - 0.012 * K.hs, p[1]], [p[0], p[1] - 0.006 * K.hs], [p[0] + 0.012 * K.hs, p[1]]], EG.hairHi, 0.004 * K.hs, 0.8); } } }],
    };
  },
  zopf(K, o) {
    const cap = K.pts([[0.060, 0.056], [0.050, 0.078], [0.024, 0.096], [-0.012, 0.103], [-0.048, 0.097], [-0.078, 0.076], [-0.094, 0.040], [-0.098, 0.0], [-0.085, -0.032], [-0.060, -0.035], [-0.036, -0.012], [-0.016, 0.018], [0.012, 0.034], [0.040, 0.046]]);
    const tail = K.limb([[-0.085, 0.03, 0.040], [-0.112, -0.03, 0.036], [-0.118, -0.10, 0.030], [-0.108, -0.16, 0.022]]);
    const L = [{ shapes: [poly(cap, 1), tail], fill: o.wigCol || EG.hair, deco: wigTex(K, 'strands') },
      { shapes: [K.blob(-0.106, -0.168, 0.016, 0.016)], fill: EG.gold }];
    if (o.band) L.push(...headBand(K, o.band, o.lotus, [0.060, 0.050], [-0.092, 0.040]));
    return { layers: L, earOver: true };
  },
  kopftuch(K, o) {
    const col = o.clothCol || EG.linen;
    const cloth = K.pts([[0.066, 0.050], [0.066, 0.070], [0.042, 0.095], [0.0, 0.106], [-0.046, 0.100], [-0.082, 0.074], [-0.100, 0.030], [-0.106, -0.020], [-0.118, -0.070], [-0.112, -0.118], [-0.080, -0.128],
      [-0.060, -0.090], [-0.046, -0.050], [-0.032, -0.020], [-0.026, 0.010], [-0.012, 0.030], [0.020, 0.042], [0.046, 0.046]]);
    return {
      earOver: true,
      layers: [{ shapes: [poly(cloth, 1)], fill: { top: col, bottom: mix(col, EG.linenSh, 0.6) }, deco: (c, bb) => { K.pen.vol(c, bb, 'rgba(60,40,15,0.2)'); K.pen.curve(c, [K.P(0.066, 0.055), K.P(0.0, 0.048), K.P(-0.03, 0.02)], o.bandCol || EG.linenSh, 0.008 * K.hs, 1); K.pen.curve(c, [K.P(-0.07, 0.0), K.P(-0.09, -0.06), K.P(-0.088, -0.11)], EG.linenSh, 0.005 * K.hs, 0.9); } }],
    };
  },
  nemes(K, o) {
    const [c1, c2] = o.nemesCol || [EG.gold, EG.lapis];
    const shape = K.pts([[0.068, 0.050], [0.068, 0.068], [0.046, 0.093], [0.004, 0.106], [-0.042, 0.102], [-0.078, 0.084], [-0.104, 0.050], [-0.128, 0.0], [-0.146, -0.055], [-0.152, -0.095], [-0.126, -0.112],
      [-0.060, -0.104], [-0.020, -0.100], [-0.014, -0.180], [-0.008, -0.250], [0.044, -0.250], [0.040, -0.170], [0.032, -0.100], [0.016, -0.054], [0.006, -0.022], [0.012, 0.010], [0.028, 0.032], [0.050, 0.044]]);
    const L = [{
      shapes: [poly(shape, 1)], fill: c1,
      deco: (c, bb) => {
        for (let i = 0; i < 26; i++) { const y = 0.11 - i * 0.0145; K.pen.line(c, [K.P(-0.17, y + 0.01), K.P(0.08, y - 0.006)], c2, 0.0072 * K.hs, 1); }
        K.pen.vol(c, bb, 'rgba(0,0,0,0.18)', 'rgba(255,255,255,0.12)');
        K.pen.curve(c, [K.P(0.068, 0.052), K.P(0.03, 0.04), K.P(0.008, 0.012), K.P(0.006, -0.02)], c1, 0.012 * K.hs, 1);
      },
    }];
    if (o.uraeus !== false) L.push(uraeus(K, 0.068, 0.056));
    return { layers: L, earOver: true };
  },
  kappe(K, o) {
    const cap = K.pts([[0.064, 0.050], [0.062, 0.072], [0.040, 0.094], [0.0, 0.104], [-0.044, 0.099], [-0.078, 0.076], [-0.094, 0.040], [-0.096, 0.004], [-0.080, -0.016], [-0.050, -0.004], [-0.026, 0.020], [0.010, 0.034], [0.042, 0.042]]);
    const L = [{ shapes: [poly(cap, 1)], fill: o.capCol || '#2f3a5a', deco: (c, bb) => K.pen.vol(c, bb, 'rgba(0,0,0,0.25)') }];
    L.push(...headBand(K, o.band || EG.gold, false, [0.064, 0.050], [-0.094, 0.020]));
    if (o.uraeus !== false) L.push(uraeus(K));
    return { layers: L, earOver: true };
  },
  krone_weiss(K, o) {
    const sh = K.pts([[0.066, 0.046], [0.074, 0.080], [0.076, 0.120], [0.068, 0.168], [0.054, 0.212], [0.044, 0.248], [0.046, 0.274], [0.032, 0.294], [0.008, 0.300], [-0.010, 0.288], [-0.016, 0.262], [-0.032, 0.228],
      [-0.062, 0.178], [-0.088, 0.120], [-0.100, 0.060], [-0.098, 0.010], [-0.084, -0.020], [-0.052, -0.006], [-0.026, 0.020], [0.010, 0.034], [0.040, 0.040]]);
    const L = [{ shapes: [poly(sh, 2)], fill: { top: '#ffffff', bottom: '#e6e0d0' }, deco: (c, bb) => { K.pen.vol(c, bb, 'rgba(60,50,30,0.22)'); K.pen.curve(c, [K.P(0.05, 0.06), K.P(0.058, 0.15), K.P(0.035, 0.24)], '#ffffff', 0.01 * K.hs, 0.8); K.pen.curve(c, [K.P(-0.07, 0.07), K.P(-0.04, 0.17), K.P(-0.005, 0.25)], '#cfc6b0', 0.008 * K.hs, 0.6); } }];
    if (o.uraeus !== false) L.push(uraeus(K));
    return { layers: L, earOver: true, top: [0.01, 0.30] };
  },
  krone_rot(K, o) {
    const red = o.redCol || EG.redCrown;
    const sh = K.pts([[0.066, 0.046], [0.070, 0.112], [-0.022, 0.114], [-0.026, 0.200], [-0.030, 0.258], [-0.074, 0.262], [-0.078, 0.200], [-0.092, 0.120], [-0.100, 0.060], [-0.098, 0.010], [-0.084, -0.020], [-0.052, -0.006],
      [-0.026, 0.020], [0.010, 0.034], [0.040, 0.040]]);
    const curl = K.limb([[-0.004, 0.106, 0.010], [0.030, 0.140, 0.009], [0.066, 0.176, 0.009], [0.086, 0.198, 0.009], [0.090, 0.214, 0.009], [0.080, 0.224, 0.009], [0.070, 0.216, 0.008], [0.076, 0.206, 0.006]]);
    const L = [{ shapes: [poly(sh, 1)], fill: { top: tint(red, 0.08), bottom: shade(red, 0.15) }, deco: (c, bb) => { K.pen.vol(c, bb, 'rgba(40,0,0,0.25)'); K.pen.line(c, [K.P(-0.05, 0.11), K.P(-0.05, 0.25)], tint(red, 0.25), 0.008 * K.hs, 0.6); } },
      { shapes: [curl], fill: EG.gold, stroke: 'rgba(80,50,10,0.6)' }];
    if (o.uraeus !== false) L.push(uraeus(K));
    return { layers: L, earOver: true, top: [-0.05, 0.262] };
  },
  krone_doppel(K, o) {
    const red = o.redCol || EG.redCrown;
    const back = K.pts([[0.066, 0.046], [0.070, 0.112], [-0.022, 0.114], [-0.026, 0.215], [-0.030, 0.272], [-0.076, 0.276], [-0.080, 0.200], [-0.092, 0.120], [-0.100, 0.060], [-0.098, 0.010], [-0.084, -0.020], [-0.052, -0.006],
      [-0.026, 0.020], [0.010, 0.034], [0.040, 0.040]]);
    const white = K.pts([[0.052, 0.100], [0.058, 0.150], [0.050, 0.205], [0.040, 0.250], [0.040, 0.282], [0.026, 0.302], [0.004, 0.306], [-0.010, 0.292], [-0.014, 0.262], [-0.022, 0.215], [-0.028, 0.160], [-0.032, 0.100]]);
    const cap = K.pts([[0.066, 0.046], [0.070, 0.116], [-0.040, 0.118], [-0.092, 0.110], [-0.100, 0.060], [-0.098, 0.010], [-0.084, -0.020], [-0.052, -0.006], [-0.026, 0.020], [0.010, 0.034], [0.040, 0.040]]);
    const curl = K.limb([[-0.004, 0.108, 0.010], [0.040, 0.140, 0.009], [0.082, 0.170, 0.009], [0.100, 0.190, 0.009], [0.104, 0.206, 0.009], [0.094, 0.216, 0.009], [0.084, 0.208, 0.008], [0.090, 0.198, 0.006]]);
    const redFill = { top: tint(red, 0.08), bottom: shade(red, 0.15) };
    const L = [
      { shapes: [poly(back, 1)], fill: redFill, deco: (c, bb) => K.pen.vol(c, bb, 'rgba(40,0,0,0.25)') },
      { shapes: [poly(white, 2)], fill: { top: '#ffffff', bottom: '#e6e0d0' }, deco: (c, bb) => { K.pen.vol(c, bb, 'rgba(60,50,30,0.2)'); K.pen.curve(c, [K.P(0.035, 0.13), K.P(0.04, 0.2), K.P(0.025, 0.27)], '#ffffff', 0.01 * K.hs, 0.8); } },
      { shapes: [poly(cap, 1)], fill: redFill, deco: (c, bb) => K.pen.vol(c, bb, 'rgba(40,0,0,0.22)') },
      { shapes: [curl], fill: EG.gold, stroke: 'rgba(80,50,10,0.6)' },
    ];
    if (o.uraeus !== false) L.push(uraeus(K));
    return { layers: L, earOver: true, top: [0.01, 0.306] };
  },
  krone_blau(K, o) {
    const sh = K.pts([[0.066, 0.046], [0.076, 0.090], [0.074, 0.140], [0.058, 0.182], [0.028, 0.208], [-0.014, 0.216], [-0.056, 0.202], [-0.088, 0.168], [-0.110, 0.112], [-0.124, 0.050], [-0.128, 0.0], [-0.114, -0.024],
      [-0.088, -0.022], [-0.052, -0.004], [-0.026, 0.020], [0.010, 0.034], [0.040, 0.040]]);
    const ribbons = [K.limb([[-0.108, 0.0, 0.020], [-0.13, -0.08, 0.018], [-0.14, -0.15, 0.016]]), K.limb([[-0.094, -0.004, 0.018], [-0.106, -0.08, 0.016], [-0.11, -0.14, 0.014]])];
    const L = [
      { shapes: ribbons, fill: EG.carn },
      {
        shapes: [poly(sh, 1)], fill: { top: '#3a6cc0', bottom: '#1e468a' },
        deco: (c, bb) => {
          for (let r = 0; r < 8; r++) for (let i = 0; i < 10; i++) { const x = -0.12 + i * 0.022 + (r % 2) * 0.011, y = 0.02 + r * 0.024; K.pen.dot(c, K.P(x, y), 0.0058 * K.hs, EG.gold, 0.95); }
          K.pen.vol(c, bb, 'rgba(0,0,30,0.25)', 'rgba(255,255,255,0.14)');
          K.pen.curve(c, [K.P(0.066, 0.05), K.P(0.0, 0.038), K.P(-0.06, 0.0), K.P(-0.11, -0.02)], EG.gold, 0.008 * K.hs, 1);
        },
      },
    ];
    if (o.uraeus !== false) L.push(uraeus(K, 0.072, 0.07));
    return { layers: L, earOver: true, top: [-0.014, 0.216] };
  },
  melone(K, o) {
    const hc = o.wigCol || '#3a2418';
    const cap = K.pts([[0.064, 0.052], [0.058, 0.076], [0.032, 0.096], [-0.006, 0.104], [-0.046, 0.098], [-0.078, 0.078], [-0.096, 0.044], [-0.100, 0.006], [-0.088, -0.024], [-0.064, -0.030], [-0.040, -0.010], [-0.022, 0.018], [0.004, 0.032], [0.040, 0.044]]);
    const curls = [K.blob(0.060, 0.052, 0.012), K.blob(0.054, 0.040, 0.010), K.blob(0.044, 0.034, 0.009), K.blob(-0.104, -0.040, 0.034, 0.030), K.blob(-0.082, -0.050, 0.018)];
    const L = [{
      shapes: [poly(cap, 1), ...curls], fill: { top: tint(hc, 0.1), bottom: hc },
      deco: (c, bb) => {
        for (let i = 0; i < 6; i++) { const y = 0.09 - i * 0.022; K.pen.curve(c, [K.P(0.058, y - 0.02), K.P(0.0, y + 0.004), K.P(-0.07, y - 0.012), K.P(-0.098, y - 0.05)], tint(hc, 0.3), 0.005 * K.hs, 0.8); }
        K.pen.curve(c, [K.P(-0.125, -0.03), K.P(-0.104, -0.012), K.P(-0.086, -0.04)], tint(hc, 0.3), 0.004 * K.hs, 0.8);
        K.pen.vol(c, bb, 'rgba(0,0,0,0.2)');
      },
    }];
    // diadem band (Ptolemaic royal ribbon) with uraeus and ribbon ends at the nape
    L.push({ shapes: [K.limb([[-0.096, 0.040, 0.014], [-0.02, 0.098, 0.014], [0.050, 0.074, 0.014], [0.066, 0.058, 0.013]]), K.limb([[-0.096, 0.040, 0.012], [-0.122, -0.010, 0.012], [-0.130, -0.08, 0.010]])], fill: o.diademCol || EG.white, deco: (c) => { for (let i = 0; i < 5; i++) K.pen.dot(c, K.P(-0.07 + i * 0.03, 0.084 - Math.abs(i - 2) * 0.008), 0.0035 * K.hs, EG.gold); } });
    L.push(uraeus(K, 0.064, 0.062));
    return { layers: L, earOver: true };
  },
  hut1922(K, o) {
    const hc = o.hairCol || '#4a3426';
    const hair = K.pts([[0.040, 0.050], [0.020, 0.066], [-0.020, 0.072], [-0.060, 0.060], [-0.078, 0.030], [-0.076, -0.010], [-0.062, -0.030], [-0.040, -0.012], [-0.024, 0.012], [-0.004, 0.030], [0.020, 0.040]]);
    const hat = o.hatCol || '#5a4a3a';
    const brim = K.limb([[-0.118, 0.080, 0.014], [-0.090, 0.068, 0.016], [0.0, 0.066, 0.016], [0.080, 0.071, 0.016], [0.104, 0.082, 0.012]]);
    const crown = K.pts([[-0.074, 0.066], [-0.072, 0.120], [-0.058, 0.146], [-0.014, 0.152], [0.018, 0.142], [0.044, 0.150], [0.064, 0.134], [0.068, 0.066]]);
    return {
      earOver: true, beardStrap: false, top: [0.0, 0.152],
      layers: [
        { shapes: [poly(hair, 1)], fill: hc, deco: (c) => { for (let i = 0; i < 6; i++) K.pen.line(c, [K.P(-0.07 + i * 0.012, 0.04), K.P(-0.074 + i * 0.012, -0.02)], tint(hc, 0.25), 0.004 * K.hs, 0.7); } },
        { shapes: [brim, poly(crown, 1)], fill: { top: tint(hat, 0.1), bottom: shade(hat, 0.1) }, deco: (c, bb) => { K.pen.vol(c, bb, 'rgba(0,0,0,0.25)'); K.pen.line(c, [K.P(-0.073, 0.084), K.P(0.067, 0.084)], o.hatBand || '#2a2018', 0.016 * K.hs, 1); K.pen.curve(c, [K.P(-0.02, 0.15), K.P(0.0, 0.13), K.P(0.02, 0.14)], shade(hat, 0.4), 0.005 * K.hs, 0.8); } },
      ],
    };
  },
  locken1822(K, o) {
    const hc = o.hairCol || '#2a1c14';
    const cap = K.pts([[0.050, 0.060], [0.030, 0.086], [-0.010, 0.096], [-0.050, 0.090], [-0.080, 0.066], [-0.090, 0.020], [-0.084, -0.028], [-0.062, -0.040], [-0.040, -0.016], [-0.020, 0.016], [0.004, 0.036], [0.030, 0.048]]);
    const curls = [[0.056, 0.064, 0.016], [0.040, 0.084, 0.020], [0.010, 0.098, 0.022], [-0.026, 0.102, 0.022], [-0.060, 0.090, 0.022], [-0.084, 0.064, 0.022], [-0.096, 0.030, 0.020], [-0.094, -0.008, 0.018], [-0.080, -0.036, 0.016]].map(([x, y, r]) => K.blob(x, y, r));
    const side = K.limb([[0.004, 0.034, 0.020], [0.014, -0.010, 0.020], [0.022, -0.050, 0.016], [0.030, -0.066, 0.008]]);
    return {
      earOver: false,
      layers: [{ shapes: [poly(cap, 1), ...curls, side], fill: { top: tint(hc, 0.12), bottom: hc }, deco: (c, bb) => { for (const [x, y] of [[0.04, 0.08], [0.0, 0.09], [-0.04, 0.09], [-0.07, 0.06], [-0.085, 0.02]]) K.pen.curve(c, [K.P(x - 0.01, y - 0.006), K.P(x, y + 0.006), K.P(x + 0.01, y - 0.004)], tint(hc, 0.35), 0.004 * K.hs, 0.8); K.pen.vol(c, bb, 'rgba(0,0,0,0.2)'); } }],
    };
  },
  strohhut(K, o) { // Kurzhaar + flacher Strohhut (Feldarbeit)
    const base = HEADS.kurz(K, { ...o, band: undefined });
    const brim = K.limb([[-0.13, 0.072, 0.016], [-0.06, 0.088, 0.018], [0.03, 0.090, 0.018], [0.11, 0.078, 0.014]]);
    const crown = K.pts([[-0.07, 0.085], [-0.05, 0.135], [-0.01, 0.150], [0.03, 0.138], [0.05, 0.088]]);
    base.layers.push({ shapes: [brim, poly(crown, 1)], fill: { top: '#ead48c', bottom: '#c9a85a' }, deco: (c, bb) => { for (let i = 0; i < 12; i++) K.pen.line(c, [K.P(-0.13 + i * 0.022, 0.065), K.P(-0.12 + i * 0.02, 0.15)], '#a8883e', 0.003 * K.hs, 0.6); K.pen.line(c, [K.P(-0.068, 0.095), K.P(0.052, 0.095)], EG.carn, 0.009 * K.hs, 0.9); } });
    base.top = [-0.01, 0.15];
    return base;
  },
  anubis(K, o) { return headAnubis(K, o); },
};

// Schakalmaske (Einbalsamierer) bzw. Schakalkopf (Anubis). Beispiel für eigene Köpfe der Götter-Gruppe.
export function headAnubis(K, o = {}) {
  const black = o.maskCol || '#1e1a1c';
  const [c1, c2] = o.nemesCol || [EG.gold, EG.lapis];
  // striped lappets (tripartite headdress) behind the mask
  const lap = K.pts([[-0.02, 0.06], [-0.090, 0.066], [-0.124, 0.02], [-0.138, -0.08], [-0.142, -0.200], [-0.100, -0.218], [-0.070, -0.150], [-0.040, -0.110], [0.000, -0.100], [0.004, -0.250], [0.052, -0.250], [0.048, -0.100], [0.036, -0.04], [0.020, 0.02]]);
  const head = K.pts([[-0.074, 0.064], [-0.050, 0.098], [-0.004, 0.108], [0.040, 0.090], [0.080, 0.058], [0.124, 0.034], [0.166, 0.016], [0.184, 0.004], [0.184, -0.012], [0.166, -0.022], [0.120, -0.030],
    [0.080, -0.044], [0.052, -0.064], [0.022, -0.082], [-0.020, -0.072], [-0.060, -0.030], [-0.078, 0.020]]);
  const ear = K.pts([[-0.056, 0.080], [-0.050, 0.170], [-0.036, 0.226], [-0.022, 0.214], [-0.004, 0.150], [0.010, 0.090]]);
  const L = [
    { shapes: [poly(lap, 1)], fill: c1, deco: (c, bb) => { for (let i = 0; i < 22; i++) { const y = 0.07 - i * 0.0145; K.pen.line(c, [K.P(-0.16, y), K.P(0.06, y - 0.004)], c2, 0.0072 * K.hs, 1); } K.pen.vol(c, bb, 'rgba(0,0,0,0.18)'); } },
    { shapes: [poly(ear, 1)], fill: black, deco: (c) => { K.pen.fill(c, K.pts([[-0.044, 0.096], [-0.040, 0.170], [-0.032, 0.204], [-0.020, 0.170], [-0.010, 0.100]]), '#5a4a50', 0.9); } },
    {
      shapes: [poly(head, 1)], fill: { top: '#3a3436', bottom: black },
      deco: (c, bb) => {
        const pen = K.pen, hs = K.hs;
        pen.vol(c, bb, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.12)');
        const up = [K.P(0.074, 0.050), K.P(0.064, 0.060), K.P(0.048, 0.062), K.P(0.034, 0.054)];
        const lo = [K.P(0.074, 0.050), K.P(0.062, 0.044), K.P(0.046, 0.044), K.P(0.034, 0.054)];
        pen.fill(c, up.concat(lo.slice().reverse()), '#fbf3d8', 1);
        pen.dot(c, K.P(0.058, 0.053), 0.006 * hs, '#1c1816', 1);
        pen.dot(c, K.P(0.060, 0.055), 0.002 * hs, '#ffffff', 1);
        pen.curve(c, up.concat([K.P(0.014, 0.056)]), EG.gold, 0.005 * hs, 1);
        pen.curve(c, lo, EG.gold, 0.0035 * hs, 1);
        pen.curve(c, [K.P(0.182, -0.008), K.P(0.150, -0.018), K.P(0.110, -0.024)], '#8a7a80', 0.004 * hs, 0.9);
        pen.dot(c, K.P(0.178, 0.002), 0.006 * hs, '#000000', 1);
        pen.curve(c, [K.P(0.03, -0.072), K.P(0.0, -0.06), K.P(-0.03, -0.05)], EG.gold, 0.008 * hs, 0.95);
      },
    },
  ];
  return { layers: L, hideFace: true, hideEar: true, beardStrap: false, top: [-0.036, 0.226] };
}

// =====================================================================================================
// PROPS in der Hand: makeProp(spec, armGeom, env) -> { under:[layers], over:[layers] }   (unit coords)
// spec: 'name' | { prop:'name', ang, len, ... }.  Grip G = Faustmitte, a = Achsrichtung (rad, mathematisch).
// =====================================================================================================
export function makeProp(spec, g, env) {
  const s = typeof spec === 'string' ? { prop: spec } : spec;
  const fn = PROPS[s.prop];
  if (!fn) return { under: [], over: [] };
  return fn(g, s, env);
}
const axis = (G, a) => { const d = [Math.cos(a), Math.sin(a)], r = [Math.sin(a), -Math.cos(a)]; return (t, s = 0) => [G[0] + d[0] * t + r[0] * s, G[1] + d[1] * t + r[1] * s]; };
const bandsAlong = (pen, A, t0, t1, n, w, colA, colB, lineW) => (c) => {
  for (let i = 0; i <= n; i++) { const t = t0 + ((t1 - t0) * i) / n; pen.line(c, [A(t, -w), A(t, w)], i % 2 ? colB : colA, lineW, 1); }
};
const staffTo = (G, a, gy) => { const sa = Math.sin(a); return Math.abs(sa) > 0.2 ? (gy + 0.004 - G[1]) / sa : -0.5; };

export const PROPS = {
  stab(g, s, { C, pen, gy }) {
    const a = s.ang ?? Math.PI / 2 + 0.06, A = axis(g.G, a);
    const t0 = s.t0 ?? staffTo(g.G, a, gy), t1 = s.len ?? 0.48;
    const shapes = [limb([[...A(t0), 0.020], [...A(t1), 0.018]], { caps: true })];
    const top = s.top || 'knauf';
    const over = [];
    if (top === 'knauf') shapes.push(blob(...A(t1), 0.018, 0.016, a));
    const L = { shapes, fill: s.col ? s.col : { top: tint(C.wood, 0.15), bottom: C.woodD }, deco: (c) => { if (s.gold) bandsAlong(pen, A, t1 - 0.04, t1 - 0.12, 4, 0.02, C.gold, C.gold, 0.012)(c); } };
    if (top === 'papyrus') over.push({ shapes: [poly([A(t1 - 0.01, -0.012), A(t1 + 0.06, -0.045), A(t1 + 0.075, 0), A(t1 + 0.06, 0.045), A(t1 - 0.01, 0.012)], 1)], fill: C.papyrus });
    return { under: [L, ...over], over: [] };
  },
  zepter(g, s, env) {
    const { C, pen, gy } = env;
    const a = s.ang ?? Math.PI / 2 + 0.05, A = axis(g.G, a);
    const t0 = staffTo(g.G, a, gy), t1 = s.len ?? 0.52;
    const shaft = limb([[...A(t0), 0.019], [...A(t1), 0.019]]);
    const umbel = poly([A(t1 - 0.01, -0.012), A(t1 + 0.03, -0.034), A(t1 + 0.07, -0.046), A(t1 + 0.082, 0), A(t1 + 0.07, 0.046), A(t1 + 0.03, 0.034), A(t1 - 0.01, 0.012)], 1);
    return {
      under: [{ shapes: [shaft], fill: { top: C.goldL, bottom: C.gold }, deco: bandsAlong(pen, A, t0 + 0.04, t1 - 0.02, 26, 0.02, C.lapis, C.gold, 0.006) },
        { shapes: [umbel], fill: C.gold, deco: (c) => { pen.line(c, [A(t1 + 0.004, -0.02), A(t1 + 0.004, 0.02)], C.lapis, 0.008); pen.curve(c, [A(t1 + 0.07, -0.03), A(t1 + 0.08, 0), A(t1 + 0.07, 0.03)], C.goldL, 0.006, 0.8); } }],
      over: [],
    };
  },
  was(g, s, env) {
    const { C, pen, gy } = env;
    const a = s.ang ?? Math.PI / 2 + 0.04, A = axis(g.G, a);
    const t0 = staffTo(g.G, a, gy) + 0.03, t1 = s.len ?? 0.5;
    const shaft = limb([[...A(t0), 0.018], [...A(t1), 0.018]]);
    const headS = limb([[...A(t1 - 0.01, 0.0), 0.024], [...A(t1 + 0.02, 0.025), 0.026], [...A(t1 + 0.012, 0.075), 0.018], [...A(t1 + 0.004, 0.094), 0.010]]);
    const ears = poly([A(t1 + 0.024, 0.0), A(t1 + 0.058, -0.004), A(t1 + 0.034, 0.016)], 0);
    const fork = [limb([[...A(t0 + 0.002, 0), 0.016], [...A(t0 - 0.03, -0.014), 0.012]]), limb([[...A(t0 + 0.002, 0), 0.016], [...A(t0 - 0.03, 0.014), 0.012]])];
    const col = s.col || C.gold;
    return { under: [{ shapes: [shaft, headS, ears, ...fork], fill: { top: tint(col, 0.15), bottom: shade(col, 0.1) }, deco: (c, bb) => pen.vol(c, bb) }], over: [] };
  },
  krummstab(g, s, { C, pen }) {
    const a = s.ang ?? Math.PI / 2 + 0.15, A = axis(g.G, a);
    const t0 = -0.06, t1 = s.len ?? 0.17;
    const shaft = limb([[...A(t0), 0.02], [...A(t1), 0.02]]);
    const hook = limb([[...A(t1 - 0.005, 0), 0.02], [...A(t1 + 0.03, 0.006), 0.02], [...A(t1 + 0.044, 0.03), 0.019], [...A(t1 + 0.034, 0.056), 0.018], [...A(t1 + 0.012, 0.064), 0.017], [...A(t1 - 0.002, 0.056), 0.015]]);
    return {
      under: [{ shapes: [shaft, hook], fill: C.gold, deco: (c) => { bandsAlong(pen, A, t0 + 0.005, t1, 9, 0.02, C.lapis, C.gold, 0.009)(c); pen.curve(c, [A(t1 + 0.02, 0.0), A(t1 + 0.04, 0.03), A(t1 + 0.03, 0.054)], C.lapis, 0.008, 0.9); } }],
      over: [],
    };
  },
  wedel(g, s, { C, pen }) {
    const a = s.ang ?? Math.PI / 2 + 0.55, A = axis(g.G, a);
    const t0 = -0.04, t1 = s.len ?? 0.13;
    const handle = limb([[...A(t0), 0.018], [...A(t1), 0.018]]);
    const top = A(t1 + 0.01);
    const strands = [], beads = [];
    const dirs = s.strandDir ?? -Math.PI / 2 - 0.55;
    for (let k = 0; k < 3; k++) {
      const da = dirs + (k - 1) * 0.16;
      for (let i = 0; i < 5; i++) { const r = 0.016 + i * 0.022; const p = [top[0] + Math.cos(da) * r, top[1] + Math.sin(da) * r]; strands.push(blob(p[0], p[1], 0.0115, 0.0115, 0, 14)); beads.push([p, i]); }
    }
    return {
      under: [{ shapes: strands, fill: C.gold, deco: (c) => { for (const [p, i] of beads) pen.dot(c, p, 0.0065, i % 2 ? C.lapis : C.carn, 0.95); } },
        { shapes: [handle, blob(...top, 0.016, 0.016)], fill: C.gold, deco: bandsAlong(pen, A, t0, t1, 7, 0.02, C.lapis, C.gold, 0.008) }],
      over: [],
    };
  },
  anch(g, s, { C, pen }) {
    const a = s.ang ?? -Math.PI / 2, A = axis(g.G, a);
    const loop = blob(...A(-0.012), 0.034, 0.024, a);
    const stem = poly([A(0.012, -0.007), A(0.012, 0.007), A(0.085, 0.012), A(0.085, -0.012)], 0);
    const bar = limb([[...A(0.022, -0.042), 0.017], [...A(0.022, 0.042), 0.017]]);
    const col = s.col || C.gold;
    return {
      under: [{ shapes: [loop, stem, bar], fill: { top: tint(col, 0.2), bottom: shade(col, 0.1) }, deco: (c) => { pen.ell(c, A(-0.014), 0.018, 0.010, a, '#f6efdc', 1); } }],
      over: [],
    };
  },
  speer(g, s, { C, pen }) {
    const a = s.ang ?? -0.5, A = axis(g.G, a);
    const t0 = s.t0 ?? -0.30, t1 = s.len ?? 0.42;
    const shaft = limb([[...A(t0), 0.016], [...A(t1), 0.014]]);
    const prong = (o) => poly([A(t1 - 0.01, o - 0.006), A(t1 + 0.075, o), A(t1 - 0.01, o + 0.006)], 0);
    const barb = (o) => poly([A(t1 + 0.04, o), A(t1 + 0.03, o + Math.sign(o) * 0.012), A(t1 + 0.055, o)], 0);
    return { under: [{ shapes: [shaft], fill: { top: tint(C.wood, 0.2), bottom: C.wood } }, { shapes: [prong(-0.014), prong(0.014), barb(-0.014), barb(0.014), limb([[...A(t1 - 0.012, -0.016), 0.01], [...A(t1 - 0.012, 0.016), 0.01]])], fill: '#b9b4a8' }], over: [] };
  },
  netz(g, s, { C, pen }) {
    const G = g.G;
    const pts = [[G[0] - 0.01, G[1]], [G[0] + 0.01, G[1]], [G[0] + 0.07, G[1] - 0.16], [G[0] + 0.02, G[1] - 0.26], [G[0] - 0.06, G[1] - 0.25], [G[0] - 0.07, G[1] - 0.14]];
    return {
      under: [{
        shapes: [poly(pts, 2)], fill: 'rgba(200,180,130,1)',
        deco: (c) => {
          for (let i = 0; i < 7; i++) { pen.line(c, [[G[0] - 0.1 + i * 0.03, G[1]], [G[0] - 0.02 + i * 0.03, G[1] - 0.28]], '#7a5a30', 0.004, 0.9); pen.line(c, [[G[0] + 0.1 - i * 0.03, G[1]], [G[0] + 0.02 - i * 0.03, G[1] - 0.28]], '#7a5a30', 0.004, 0.9); }
          for (let i = 0; i < 6; i++) pen.dot(c, [G[0] - 0.05 + i * 0.022, G[1] - 0.252 + Math.abs(i - 2.5) * 0.005], 0.006, '#6a6a60');
        },
      }],
      over: [],
    };
  },
  rolle(g, s, { C, pen }) {
    const a = s.ang ?? 0.15, A = axis(g.G, a);
    const r = limb([[...A(-0.06), 0.034], [...A(0.07), 0.034]]);
    return { under: [], over: [{ shapes: [r], fill: { top: '#f3e6bc', bottom: '#d8c48a' }, deco: (c) => { pen.ell(c, A(0.07), 0.008, 0.016, a, '#c8b070'); pen.line(c, [A(-0.03, -0.018), A(-0.03, 0.018)], C.carn, 0.008); } }] };
  },
  papyrus(g, s, { C, pen }) { // offene Papyrusrolle (Rolle in der Faust, Blatt nach vorn, zum Betrachter gekippt)
    const a = s.ang ?? -0.08, A = axis(g.G, a), L = s.len ?? 0.2;
    const sheet = poly([A(0.0, -0.026), A(L, -0.020), A(L + 0.006, 0.022), A(0.0, 0.026)], 0);
    const roll = blob(...A(0.0), 0.024, 0.030, a + 0.3);
    return {
      under: [], over: [{
        shapes: [sheet, roll], fill: { top: '#f7ecc8', bottom: '#e3d29c' },
        deco: (c) => {
          for (let i = 0; i < 4; i++) { const sY = -0.016 + i * 0.011; pen.line(c, [A(0.04, sY), A(L - 0.02, sY + 0.002)], i === 0 ? C.carn : C.ink, 0.0042, 0.8); }
          for (let i = 0; i < 4; i++) pen.dot(c, A(0.06 + i * 0.03, 0.03), 0.004, C.ink, 0.7);
          pen.ell(c, A(0.0), 0.012, 0.018, a + 0.3, '#cdb67a', 1);
        },
      }],
    };
  },
  blatt(g, s, { C, pen }) { // Notizblatt / Papier (europäisch)
    const a = s.ang ?? 0.2, A = axis(g.G, a);
    const p = poly([A(-0.01, -0.02), A(0.13, -0.03), A(0.135, 0.07), A(-0.005, 0.08)], 0);
    return { under: [], over: [{ shapes: [p], fill: { top: '#fbf6e8', bottom: '#e6dcc2' }, deco: (c) => { for (let i = 0; i < 5; i++) pen.line(c, [A(0.02, 0.06 - i * 0.017), A(0.11, 0.055 - i * 0.017)], '#5a5a70', 0.0035, 0.6); } }] };
  },
  binse(g, s, { C, pen }) {
    const a = s.ang ?? -1.0, A = axis(g.G, a);
    return { under: [], over: [{ shapes: [limb([[...A(-0.035), 0.008], [...A(0.075), 0.006]])], fill: '#c9b77a', deco: (c) => pen.dot(c, A(0.074), 0.004, C.ink) }] };
  },
  palette(g, s, { C, pen }) {
    const a = s.ang ?? 0.1, A = axis(g.G, a);
    const p = poly([A(-0.03, -0.018), A(0.20, -0.018), A(0.20, 0.018), A(-0.03, 0.018)], 1);
    return { under: [{ shapes: [p], fill: '#e8d6a6', deco: (c) => { pen.dot(c, A(0.16, 0), 0.009, C.ink); pen.dot(c, A(0.185, 0), 0.009, C.carn); pen.line(c, [A(0.0, 0), A(0.13, 0)], '#b89a5a', 0.008); } }], over: [] };
  },
  teigschale(g, s, { C, pen }) {
    const G = g.G, x = G[0] + (s.dx ?? 0.03), y = G[1] + (s.dy ?? -0.005);
    const bowl = poly([[x - 0.10, y + 0.04], [x + 0.10, y + 0.04], [x + 0.085, y - 0.01], [x + 0.05, y - 0.035], [x - 0.05, y - 0.035], [x - 0.085, y - 0.01]], 2);
    const dough = blob(x, y + 0.04, 0.075, 0.032);
    return {
      under: [], over: [
        { shapes: [dough], fill: { top: '#fbf0d0', bottom: '#e8d4a0' } },
        { shapes: [bowl], fill: { top: tint(C.clay, 0.15), bottom: shade(C.clay, 0.15) }, deco: (c, bb) => { pen.vol(c, bb); pen.line(c, [[x - 0.095, y + 0.03], [x + 0.095, y + 0.03]], tint(C.clay, 0.35), 0.008, 0.8); } }],
    };
  },
  brotbrett(g, s, { C, pen }) {
    const G = g.G, x = G[0] + 0.03, y = G[1] + 0.02;
    const board = poly([[x - 0.12, y], [x + 0.12, y], [x + 0.12, y - 0.02], [x - 0.12, y - 0.02]], 1);
    const loaves = [blob(x - 0.07, y + 0.022, 0.038, 0.028), blob(x, y + 0.03, 0.04, 0.034), blob(x + 0.07, y + 0.022, 0.036, 0.026)];
    return { under: [], over: [{ shapes: loaves, fill: { top: '#e2a85a', bottom: '#b57834' }, deco: (c) => { for (const dx of [-0.07, 0, 0.07]) pen.curve(c, [[x + dx - 0.015, y + 0.03], [x + dx, y + 0.038], [x + dx + 0.015, y + 0.03]], '#f6d79a', 0.006, 0.8); } }, { shapes: [board], fill: C.wood }] };
  },
  krug(g, s, { C, pen }) {
    const a = s.ang ?? Math.PI / 2, A = axis(g.G, a);
    const col = s.col || C.clay;
    const body = poly([A(0.02, -0.03), A(0.0, -0.06), A(-0.06, -0.08), A(-0.14, -0.07), A(-0.19, -0.035), A(-0.205, 0), A(-0.19, 0.035), A(-0.14, 0.07), A(-0.06, 0.08), A(0.0, 0.06), A(0.02, 0.03)], 2);
    const neckS = poly([A(0.0, -0.032), A(0.05, -0.026), A(0.058, -0.036), A(0.066, -0.036), A(0.066, 0.036), A(0.058, 0.036), A(0.05, 0.026), A(0.0, 0.032)], 1);
    return {
      under: [{ shapes: [body, neckS], fill: { top: tint(col, 0.12), bottom: shade(col, 0.18) }, deco: (c, bb) => { pen.vol(c, bb); pen.line(c, [A(-0.08, -0.078), A(-0.08, 0.078)], C.goldL, 0.012, 0.7); pen.line(c, [A(-0.1, -0.078), A(-0.1, 0.078)], C.ink, 0.004, 0.6); } }],
      over: [],
    };
  },
  hes(g, s, { C, pen }) {
    const a = s.ang ?? Math.PI / 2, A = axis(g.G, a);
    const body = poly([A(0.03, -0.022), A(-0.03, -0.032), A(-0.11, -0.036), A(-0.15, -0.024), A(-0.155, 0.024), A(-0.11, 0.036), A(-0.03, 0.032), A(0.03, 0.022)], 2);
    const spout = limb([[...A(0.02, 0.01), 0.018], [...A(0.07, 0.04), 0.012], [...A(0.085, 0.07), 0.008]]);
    const lid = blob(...A(0.04, -0.004), 0.016, 0.022, a);
    const col = s.col || C.gold;
    return { under: [{ shapes: [body, spout, lid], fill: { top: tint(col, 0.2), bottom: shade(col, 0.12) }, deco: (c, bb) => { pen.vol(c, bb); pen.line(c, [A(-0.07, -0.035), A(-0.07, 0.035)], C.lapis, 0.008, 0.9); } }], over: [] };
  },
  ball(g, s, { C, pen }) {
    const G = g.G, p = add(G, mul(g.pp, 0.04)), r = 0.045;
    return { under: [], over: [{ shapes: [blob(p[0], p[1], r, r)], fill: { top: '#e8c070', bottom: '#b8762e' }, deco: (c) => { pen.curve(c, [[p[0] - r, p[1]], [p[0], p[1] + 0.01], [p[0] + r, p[1]]], C.carn, 0.008); pen.curve(c, [[p[0], p[1] + r], [p[0] + 0.012, p[1]], [p[0], p[1] - r]], C.turq, 0.008); } }] };
  },
  pferdchen(g, s, { C, pen }) {
    const G = g.G, x = G[0] + 0.03, y = G[1] + 0.035;
    const body = poly([[x - 0.07, y], [x + 0.04, y], [x + 0.05, y + 0.02], [x + 0.075, y + 0.06], [x + 0.095, y + 0.055], [x + 0.08, y + 0.03], [x + 0.06, y - 0.01], [x + 0.04, y - 0.04], [x - 0.06, y - 0.04], [x - 0.08, y - 0.01]], 1);
    const tail = limb([[x - 0.07, y - 0.005, 0.012], [x - 0.095, y - 0.03, 0.008]]);
    const wheels = [blob(x - 0.045, y - 0.055, 0.018), blob(x + 0.03, y - 0.055, 0.018)];
    return { under: [], over: [{ shapes: [body, tail], fill: { top: '#d6a060', bottom: '#a8743a' }, deco: (c) => { pen.dot(c, [x + 0.07, y + 0.045], 0.005, C.ink); pen.line(c, [[x - 0.04, y - 0.01], [x + 0.03, y - 0.01]], C.carn, 0.008, 0.9); } }, { shapes: wheels, fill: C.woodD, deco: (c) => { pen.dot(c, [x - 0.045, y - 0.055], 0.005, C.goldL); pen.dot(c, [x + 0.03, y - 0.055], 0.005, C.goldL); } }] };
  },
  hacke(g, s, { C, pen }) {
    const a = s.ang ?? -0.9, A = axis(g.G, a);
    const top = A(-0.10), end = A(0.30);
    const blade = [A(0.30), A(0.17, -0.20)];
    const handle = limb([[...top, 0.022], [...end, 0.02]]);
    const bl = limb([[...blade[0], 0.022], [...lerp2(blade[0], blade[1], 0.5), 0.03], [...blade[1], 0.024]]);
    return {
      under: [{ shapes: [handle, bl], fill: { top: tint(C.wood, 0.15), bottom: C.woodD }, deco: (c) => pen.line(c, [A(0.12), lerp2(blade[0], blade[1], 0.62)], '#d8c48a', 0.008, 1) }],
      over: [],
    };
  },
  schlaegel(g, s, { C, pen }) {
    const a = s.ang ?? Math.PI / 2 + 0.3, A = axis(g.G, a);
    const handle = limb([[...A(-0.03), 0.02], [...A(0.07), 0.022]]);
    const headS = poly([A(0.06, -0.026), A(0.10, -0.04), A(0.16, -0.042), A(0.19, -0.03), A(0.195, 0), A(0.19, 0.03), A(0.16, 0.042), A(0.10, 0.04), A(0.06, 0.026)], 2);
    return { under: [{ shapes: [handle, headS], fill: { top: tint(C.wood, 0.2), bottom: C.woodD }, deco: (c, bb) => { pen.vol(c, bb); pen.line(c, [A(0.12, -0.035), A(0.12, 0.035)], shade(C.wood, 0.3), 0.004, 0.6); } }], over: [] };
  },
  meissel(g, s, { C, pen }) {
    const a = s.ang ?? -0.4, A = axis(g.G, a);
    const r = poly([A(-0.06, -0.008), A(0.11, -0.007), A(0.13, -0.004), A(0.13, 0.004), A(0.11, 0.007), A(-0.06, 0.008)], 0);
    return { under: [], over: [{ shapes: [r], fill: { top: '#e0a060', bottom: C.copper }, deco: (c) => pen.line(c, [A(-0.05, 0.003), A(0.1, 0.003)], '#f6d0a0', 0.003, 0.8) }] };
  },
  messleine(g, s, { C, pen }) {
    const G = g.G, p = add(G, [0.0, -0.04]);
    const coil = blob(p[0], p[1], 0.055, 0.065);
    const tail = limb([[p[0] + 0.01, p[1] - 0.06, 0.012], [p[0] + 0.03, p[1] - 0.12, 0.011], [p[0] + 0.02, p[1] - 0.18, 0.01]]);
    return {
      under: [{ shapes: [coil, tail], fill: '#d8bf86', deco: (c) => { for (let i = 0; i < 4; i++) pen.ell(c, p, 0.05 - i * 0.012, 0.06 - i * 0.014, 0, i % 2 ? '#c4a668' : '#e8d4a2', 1); for (const t of [0.4, 0.75]) pen.dot(c, lerp2([p[0] + 0.03, p[1] - 0.12], [p[0] + 0.02, p[1] - 0.18], t), 0.009, '#8a6a3a'); } }],
      over: [],
    };
  },
  seil(g, s, { C, pen }) {
    const a = s.ang ?? -0.12, A = axis(g.G, a), L = s.len ?? 0.45;
    const r = limb([[...A(-0.06), 0.022], [...A(L * 0.5, -0.01), 0.022], [...A(L), 0.022]], { caps: false });
    return { under: [{ shapes: [r], fill: '#c8a868', deco: (c) => { for (let i = 0; i < 18; i++) { const t = -0.05 + i * (L / 17); pen.line(c, [A(t, -0.01), A(t + 0.012, 0.01)], '#8a6a3a', 0.004, 0.8); } } }], over: [] };
  },
  pinsel(g, s, { C, pen }) {
    const a = s.ang ?? 0.9, A = axis(g.G, a);
    return { under: [], over: [{ shapes: [limb([[...A(-0.03), 0.012], [...A(0.08), 0.014]])], fill: '#a0703c' }, { shapes: [poly([A(0.075, -0.012), A(0.12, -0.016), A(0.135, 0), A(0.12, 0.016), A(0.075, 0.012)], 1)], fill: '#e8dcc0', deco: (c) => pen.line(c, [A(0.08, 0), A(0.13, 0)], '#b8a888', 0.003) }] };
  },
  feder(g, s, { C, pen }) {
    const a = s.ang ?? 1.15, A = axis(g.G, a);
    const vane = poly([A(0.02, 0.0), A(0.06, 0.016), A(0.14, 0.022), A(0.20, 0.010), A(0.22, -0.004), A(0.15, -0.010), A(0.06, -0.008)], 2);
    return { under: [], over: [{ shapes: [vane, limb([[...A(-0.03), 0.006], [...A(0.21), 0.004]])], fill: { top: '#ffffff', bottom: '#e8e2d4' }, deco: (c) => { pen.line(c, [A(-0.03), A(0.21)], '#b8ae98', 0.004); for (let i = 0; i < 6; i++) pen.line(c, [A(0.05 + i * 0.026, 0), A(0.07 + i * 0.026, 0.016)], '#d8d0c0', 0.003); } }] };
  },
  lupe(g, s, { C, pen }) {
    const a = s.ang ?? 0.6, A = axis(g.G, a);
    const ring = blob(...A(0.10), 0.05, 0.05);
    return {
      under: [], over: [
        { shapes: [limb([[...A(-0.03), 0.018], [...A(0.06), 0.016]])], fill: '#4a2e1c' },
        { shapes: [ring], fill: '#b88a3a', deco: (c) => { pen.dot(c, A(0.10), 0.04, '#cfe6ee', 1); pen.dot(c, A(0.11, -0.012), 0.012, '#ffffff', 0.9); } }],
    };
  },
  raeucherarm(g, s, { C, pen }) {
    const a = s.ang ?? 0.08, A = axis(g.G, a);
    const rod = limb([[...A(-0.05), 0.02], [...A(0.26), 0.018]]);
    const hand = limb([[...A(0.25), 0.024], [...A(0.29, 0.004), 0.03], [...A(0.31, 0.0), 0.012]]);
    const cup = poly([A(0.16, -0.0), A(0.13, 0.04), A(0.20, 0.04), A(0.18, 0.0)].map((p) => p), 1);
    const cupP = A(0.165, 0.0);
    const bowl = poly([[cupP[0] - 0.03, cupP[1] + 0.045], [cupP[0] + 0.03, cupP[1] + 0.045], [cupP[0] + 0.018, cupP[1] + 0.01], [cupP[0] - 0.018, cupP[1] + 0.01]], 1);
    return {
      under: [{ shapes: [rod, hand, bowl], fill: C.gold, deco: (c) => { pen.dot(c, [cupP[0], cupP[1] + 0.05], 0.012, C.carn); pen.curve(c, [[cupP[0], cupP[1] + 0.06], [cupP[0] - 0.02, cupP[1] + 0.1], [cupP[0] + 0.01, cupP[1] + 0.14]], '#ffffff', 0.008, 0.6); } }],
      over: [],
    };
  },
  schale(g, s, { C, pen }) {
    const G = g.G, x = G[0] + (s.dx ?? 0.02), y = G[1] + 0.02;
    const bowl = poly([[x - 0.065, y + 0.02], [x + 0.065, y + 0.02], [x + 0.045, y - 0.02], [x - 0.045, y - 0.02]], 2);
    const heap = blob(x, y + 0.022, 0.05, 0.022);
    return { under: [], over: [{ shapes: [heap], fill: '#fbfbf6', deco: (c) => { for (let i = 0; i < 5; i++) pen.dot(c, [x - 0.03 + i * 0.015, y + 0.03], 0.003, '#c8d8e0'); } }, { shapes: [bowl], fill: { top: tint(C.clay, 0.2), bottom: C.clay } }] };
  },
};
