// Gruppe T: Baukasten für Pferdeartige (Esel, Pferd). buildEquid(K, P) liefert { parts, anchors, NP } im Standardformat.
// Teile: body (Rumpf, Tuch), neck (Hals + Kopf + Ohren + Mähne [+ Zaumzeug, Federbusch], Pivot Schulter; negativ = Kopf senkt sich),
//        tail (Pivot Kruppe), legA (fernes Hinterbein), legB (nahes Hinterbein) – Pivot Hüfte, armA (nahes Vorderbein), armB (fernes) – Pivot Schulter.
// P: H Widerristhöhe, LL Bauchfreiheit, L halbe Rumpflänge, depth Rumpftiefe, neckLen/neckAng(Grad)/arch, neckW, headLen/headAng(Grad abwärts)/headW,
//    earLen/earAng(Grad), legW, mane ('flow'|'short'), tail ('flow'|'rope'), C (Farben), cloth, bridle, plume, belly (Bauchrundung).
// Alle Maße in Designeinheiten (cm bei kit(0.01)).
export function buildEquid(K, P) {
  const { H, LL, L, depth, C } = P;
  const rimc = C.ink;
  const backY = H - 4, bellyY = LL + 4;
  const rT = (backY - bellyY) / 2, cyT = (backY + bellyY) / 2;
  const legW = P.legW;
  const rad = (d) => (d * Math.PI) / 180;

  // ---- Rumpf ----
  const trunk = K.S(
    K.blob(0, cyT, L * 1.0, rT * (P.belly || 1.0), 0.0),
    K.blob(0.6 * L, cyT + 3, 0.42 * L, rT * 1.08),                      // Brust und Widerrist
    K.blob(-0.62 * L, cyT + 2, 0.42 * L, rT * 1.04),                    // Kruppe
    K.blob(0.0, cyT - rT * 0.1, L * 0.95, rT * 0.9));
  const rump = K.blob(-0.98 * L, cyT + rT * 0.45, 7, 8);

  // ---- Beine ----
  const hoof = (x) => K.S(K.blob(x + 1, 3.2, legW * 0.62, 3.6, 0), K.blob(x + 3, 1.8, legW * 0.6, 2.4, 0.0));
  const fore = (x) => K.S(
    K.limb([[x, bellyY + rT * 0.55, legW * 1.6], [x + 0.5, LL * 0.52, legW * 1.05], [x, LL * 0.38, legW * 0.78], [x + 0.5, LL * 0.14, legW * 0.86], [x + 1.4, 5, legW * 0.8]], { per: 10 }), hoof(x));
  const hind = (x) => K.S(
    K.limb([[x, bellyY + rT * 0.7, legW * 2.0], [x + 0.1 * L, LL * 0.8, legW * 1.4], [x - 0.04 * L, LL * 0.42, legW * 0.88], [x - 0.02 * L, LL * 0.14, legW * 0.8], [x - 0.01 * L, 5, legW * 0.78]], { per: 10 }), hoof(x - 0.01 * L));
  const foreN = fore(0.62 * L), foreF = fore(0.4 * L), hindN = hind(-0.66 * L), hindF = hind(-0.4 * L);
  const hoofx = { foreN: 0.62 * L + 1, foreF: 0.4 * L + 1, hindN: -0.67 * L, hindF: -0.41 * L };
  const legFill = (far) => (far ? { top: C.far, bottom: C.farB } : { stops: [[0, C.top], [0.45, C.mid], [0.8, C.leg], [1, C.leg]] });
  const legPart = (shapes, far, piv, z, hx) => ({
    z, pivot: K.pt(piv), layers: [
      { shapes, fill: legFill(far), stroke: null,
        deco: K.deco((c, bb) => {
          K.shade(c, bb, { dark: 'rgba(40,20,8,.3)', light: far ? 'rgba(0,0,0,0)' : 'rgba(255,230,190,.1)' });
          K.paintBlob(c, hx + 1, 3.6, legW * 0.66, 3.8, 0, C.hoof, 1);
          if (C.sock) K.paintBlob(c, hx + 1, 13, legW * 0.5, 9, 0, C.sock, far ? 0.5 : 0.85);
        }, K.rim(shapes, { w: 0.22, color: rimc })) },
    ],
  });

  // ---- Hals ----
  const NP = [0.62 * L + 4, cyT + rT * 0.5];
  const na = rad(P.neckAng), nL = P.neckLen;
  const polll = [NP[0] + Math.cos(na) * nL, NP[1] + Math.sin(na) * nL];
  const mid = [NP[0] + Math.cos(na) * nL * 0.5 - Math.sin(na) * (P.arch || 0), NP[1] + Math.sin(na) * nL * 0.5 + Math.cos(na) * (P.arch || 0)];
  const neckC = [[NP[0], NP[1], P.neckW * 1.35], [mid[0], mid[1], P.neckW * 0.95], [polll[0], polll[1], P.neckW * 0.62]];
  const neckL = K.limb(neckC, { per: 14 });

  // ---- Kopf (lokal: x entlang der Achse vom Genick zur Nase, y senkrecht, 1 = Kopflänge) ----
  const ha = -rad(P.headAng), Hd = P.headLen, hw = P.headW || 1;
  const W = ([lx, ly]) => [polll[0] + (lx * Math.cos(ha) - ly * hw * Math.sin(ha)) * Hd, polll[1] + (lx * Math.sin(ha) + ly * hw * Math.cos(ha)) * Hd];
  const headLocal = P.headShape || [[-0.1, 0.0], [-0.04, 0.17], [0.22, 0.135], [0.58, 0.095], [0.9, 0.075], [1.04, 0.01], [1.03, -0.075], [0.92, -0.115], [0.6, -0.105], [0.34, -0.165], [0.14, -0.26], [-0.05, -0.2], [-0.12, -0.08]];
  const head = K.poly(headLocal.map(W), 2);
  const muz = K.blob(...W([0.96, -0.015]), 0.1 * Hd, 0.115 * Hd * hw, ha, 24);
  // Ohren
  const ea = rad(P.earAng), eL = P.earLen;
  const earBase = W([0.05, 0.14]);
  const ear = K.limb([[earBase[0], earBase[1], eL * 0.36], [earBase[0] + Math.cos(ea) * eL * 0.5, earBase[1] + Math.sin(ea) * eL * 0.5, eL * 0.34], [earBase[0] + Math.cos(ea + 0.12) * eL, earBase[1] + Math.sin(ea + 0.12) * eL, eL * 0.08]], { per: 10 });
  const earFar = K.limb([[earBase[0] + 3, earBase[1] - 1, eL * 0.32], [earBase[0] + 3 + Math.cos(ea - 0.28) * eL * 0.5, earBase[1] - 1 + Math.sin(ea - 0.28) * eL * 0.5, eL * 0.3], [earBase[0] + 3 + Math.cos(ea - 0.18) * eL, earBase[1] - 1 + Math.sin(ea - 0.18) * eL, eL * 0.07]], { per: 10 });
  // Mähne
  const crest = K.path(neckC, 14);
  const maneT = [];
  const nTuft = P.mane === 'short' ? 8 : 18;
  for (let i = 0; i < nTuft; i++) {
    const t = (i + 0.5) / nTuft, p = crest[Math.min(crest.length - 1, Math.floor(t * (crest.length - 1)))];
    const nx = -p.ty, ny = p.tx; // links der Laufrichtung = oben/hinten
    const e = p.w / 2 - 2;
    const bx = p.x + nx * e, by = p.y + ny * e;
    if (P.mane === 'short') maneT.push(K.tuft(bx, by, Math.atan2(ny, nx) + 0.15, 7, 2.6, -0.1));
    else maneT.push(K.tuft(bx - nx * 3, by - ny * 3, Math.atan2(ny, nx) + 0.75 + 0.1 * Math.sin(i), 17 + 3 * Math.sin(i * 1.7), 8.5, -0.3));
  }
  const forelock = P.mane === 'short' ? K.tuft(...W([0.02, 0.17]), 1.2, 6, 2.4, 0) : K.tuft(...W([0.02, 0.17]), 0.9, 12, 4, -0.3);
  // Zaumzeug
  const bridleS = [];
  if (P.bridle) {
    const nb = (a, b, w) => K.limb([W(a).concat(w), W(b).concat(w)], { per: 4 });
    bridleS.push(nb([0.82, 0.05], [0.82, -0.12], 1.5));      // Nasenriemen
    bridleS.push(nb([0.08, 0.14], [0.78, -0.09], 1.2));      // Backenstück diagonal
    bridleS.push(nb([0.18, 0.15], [0.14, -0.2], 1.2));       // Kehlriemen
    bridleS.push(K.limb([W([0.78, -0.09]).concat(1.3), [W([0.78, -0.09])[0] - 6, W([0.78, -0.09])[1] - 22, 1.0], [polll[0] - 4, NP[1] - 6, 1.0]], { per: 8 })); // Zügel
  }
  // Federbusch: goldene Fassung mit drei Federn (Lapis, Karneol, Türkis)
  const plumeL = [];
  if (P.plume) {
    const pb = W([0.0, 0.17]);
    const f = (ang, len, w) => K.limb([[pb[0], pb[1], 2.2], [pb[0] + Math.cos(ang) * len * 0.5, pb[1] + Math.sin(ang) * len * 0.5, w], [pb[0] + Math.cos(ang) * len, pb[1] + Math.sin(ang) * len, w * 0.35], [pb[0] + Math.cos(ang) * len * 1.05, pb[1] + Math.sin(ang) * len * 1.05, 0.5]], { per: 10 });
    plumeL.push({ s: f(2.0, 22, 7.4), col: '#2a5aa0' }, { s: f(1.3, 24, 7.4), col: '#c0432e' }, { s: f(1.65, 29, 7.8), col: '#3bb3a8' });
    plumeL.cup = K.blob(pb[0], pb[1] + 1, 4, 3.4, 0.2);
  }

  const neckLayers = [
    { shapes: K.S(earFar), fill: { top: C.far, bottom: C.farB }, stroke: null, deco: K.rim(K.S(earFar), { w: 0.18, color: rimc }) },
    { shapes: K.S(maneT), fill: { top: C.mane, bottom: C.maneLo }, stroke: null, deco: K.rim(K.S(maneT), { w: 0.14, color: 'rgba(25,15,10,.85)' }) },
    { shapes: K.S(neckL, head, muz), fill: { stops: [[0, C.top], [0.5, C.mid], [0.8, C.low], [1, C.low]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(40,20,8,.16)', light: 'rgba(255,235,200,.16)' });
        K.fur(c, bb, C.furD, 10, 5, 0.6, { seed: 5, alpha: 0.28, ang: Math.PI * 0.95 });
        const e = W([0.3, 0.035]);
        K.paintBlob(c, ...W([0.88, -0.03]), 0.17 * Hd, 0.1 * Hd, ha, C.muzzle, 0.75);            // hellere Schnauze
        K.paintBlob(c, ...W([0.22, -0.1]), 0.1 * Hd, 0.06 * Hd, ha, '#f2a595', 0.35);            // Bäckchen
        K.paintBlob(c, ...W([0.97, 0.02]), 0.032 * Hd, 0.02 * Hd, ha + 0.6, '#2a1814', 0.95);     // Nüster
        K.curve(c, [W([1.03, -0.07]), W([0.9, -0.09]), W([0.74, -0.07])], 'rgba(50,25,15,.75)', 0.8);   // Mundlinie, leicht lächelnd
        K.curve(c, [W([0.74, -0.07]), W([0.7, -0.045])], 'rgba(50,25,15,.75)', 0.8);
        K.bead(c, e[0], e[1], 0.056 * Hd, { color: '#1b100a', look: 0.2, ring: C.eyeRing || '#e9d6b4' });
        K.curve(c, [W([0.2, 0.1]), W([0.3, 0.115]), W([0.4, 0.09])], 'rgba(40,20,10,.5)', 0.8);
      }, K.rim(K.S(neckL, head, muz), { w: 0.24, color: rimc })) },
  ];
  if (P.bridle) neckLayers.push({ shapes: K.S(bridleS), fill: C.strap, stroke: null, deco: K.rim(K.S(bridleS), { w: 0.1, color: 'rgba(60,20,10,.9)' }) });
  if (P.bridle) neckLayers.push({ shapes: [K.blob(...W([0.82, -0.12]), 2.2, 2.2), K.blob(...W([0.08, 0.14]), 2.6, 2.6)], fill: '#e0b040', stroke: 'rgba(120,80,20,.9)' });
  neckLayers.push({ shapes: K.S(ear), fill: { top: C.top, bottom: C.mid }, stroke: null,
    deco: K.deco((c) => { K.paintBlob(c, earBase[0] + Math.cos(ea) * eL * 0.5, earBase[1] + Math.sin(ea) * eL * 0.5, eL * 0.14, eL * 0.34, ea - 1.5708, C.earIn, 0.9); if (C.earTip) K.paintBlob(c, earBase[0] + Math.cos(ea) * eL * 0.9, earBase[1] + Math.sin(ea) * eL * 0.9, eL * 0.1, eL * 0.14, ea - 1.5708, C.earTip, 0.95); }, K.rim(K.S(ear), { w: 0.2, color: rimc })) });
  neckLayers.push({ shapes: [forelock], fill: C.mane, stroke: null, deco: K.rim([forelock], { w: 0.12, color: 'rgba(25,15,10,.85)' }) });
  if (P.plume) {
    neckLayers.splice(1, 0, ...plumeL.map((f) => ({ shapes: [f.s], fill: f.col, stroke: null,
      deco: K.deco((c, bb) => { K.shade(c, bb, { dark: 'rgba(0,0,30,.2)', light: 'rgba(255,255,255,.18)' }); }, K.rim([f.s], { w: 0.16, color: 'rgba(40,25,50,.9)' })) })),
    { shapes: [plumeL.cup], fill: '#e0b040', stroke: 'rgba(120,80,20,.9)' });
  }

  // ---- Schwanz ----
  const tp = [-0.98 * L, cyT + rT * 0.7];
  const tailS = P.tail === 'rope'
    ? K.S(K.limb([[tp[0], tp[1], 7], [tp[0] - 6, tp[1] - 22, 4], [tp[0] - 8, tp[1] - 46, 3.4], [tp[0] - 7, tp[1] - 58, 3]], { per: 10 }), K.blob(tp[0] - 7, tp[1] - 66, 6, 11, 0.05))
    : K.S(K.limb([[tp[0], tp[1], 12], [tp[0] - 16, tp[1] - 16, 13], [tp[0] - 26, tp[1] - 44, 12], [tp[0] - 28, tp[1] - 74, 8], [tp[0] - 24, tp[1] - 92, 2]], { per: 12 }));
  const tailPart = {
    z: 1, pivot: K.pt(tp), layers: [{ shapes: tailS, fill: { top: C.mane, bottom: C.maneLo }, stroke: null,
      deco: K.deco((c, bb) => { K.fur(c, bb, 'rgba(0,0,0,1)', 9, 8, 0.5, { seed: 4, alpha: 0.28, ang: -Math.PI / 2, spread: 0.3 }); }, K.rim(tailS, { w: 0.2, color: 'rgba(25,15,10,.9)' })) }],
  };

  // ---- Rumpf-Layer ----
  const bodyLayers = [
    { shapes: K.S(trunk, rump), fill: { stops: [[0, C.top], [0.45, C.mid], [0.72, C.low], [1, C.low]] }, stroke: null,
      deco: K.deco((c, bb) => {
        K.shade(c, bb, { dark: 'rgba(40,20,8,.16)', light: 'rgba(255,235,200,.18)' });
        K.fur(c, bb, C.furD, 24, 6, 0.7, { seed: 8, alpha: 0.22, ang: Math.PI * 0.95 });
        if (P.shoulderCross) { K.curve(c, [[0.48 * L, backY - 4], [0.5 * L, cyT], [0.47 * L, bellyY + rT * 0.7]], C.cross, 3.2, { alpha: 0.45 }); K.curve(c, [[0.05 * L, backY - 1], [0.45 * L, backY - 2.5], [0.62 * L, backY - 4]], C.cross, 2.2, { alpha: 0.4 }); }
        if (P.cloth) {
          // buntes Satteltuch (Lapis, Karneol, Gold) unter dem Widerrist
          const x0 = 0.06 * L, x1 = 0.46 * L, ty = backY - 2, by = backY - 36;
          const poly = [[x0, ty], [x1, ty - 1], [x1 - 2, by], [x0 + 3, by - 2]];
          K.paintPoly(c, poly, '#2a5aa0', 1, 0);
          K.paintPoly(c, [[x0 + 2, ty - 6], [x1 - 1, ty - 7], [x1 - 1.5, ty - 12], [x0 + 2.5, ty - 11]], '#e0b040', 1, 0);
          K.paintPoly(c, [[x0 + 2.5, ty - 18], [x1 - 1.5, ty - 19], [x1 - 1.8, ty - 24], [x0 + 3, ty - 23]], '#c0432e', 1, 0);
          K.paintPoly(c, [[x0 + 3, ty - 28], [x1 - 2, ty - 29], [x1 - 2.2, by + 1], [x0 + 3.2, by]], '#3bb3a8', 1, 0);
          K.curve(c, [[x0, by - 2], [x0 + 6, by - 8], [x0 + 12, by - 2], [x0 + 19, by - 8], [x0 + 26, by - 2], [x1 - 2, by - 6]], '#e0b040', 1.2);
        }
        if (P.bridle) K.curve(c, [[0.6 * L + 6, cyT + rT * 0.3], [0.62 * L + 8, bellyY + rT * 0.6]], C.strap, 1.4, { alpha: 0.9 });
      }, K.rim(K.S(trunk, rump), { w: 0.24, color: rimc })) },
  ];

  const parts = {
    neck: { z: 1, pivot: K.pt(NP), layers: neckLayers },
    body: { z: 2, layers: bodyLayers },
    tail: tailPart,
    legA: legPart(hindF, true, [-0.4 * L, bellyY + rT * 0.7], 1, hoofx.hindF),
    armB: legPart(foreF, true, [0.4 * L, bellyY + rT * 0.55], 1, hoofx.foreF),
    legB: legPart(hindN, false, [-0.66 * L, bellyY + rT * 0.7], 3, hoofx.hindN),
    armA: legPart(foreN, false, [0.62 * L, bellyY + rT * 0.55], 3, hoofx.foreN),
  };
  const anchors = {
    head: K.pt(W([0.5, 0.0])), mouth: K.pt(W([1.03, -0.07])), eye: K.pt(W([0.3, 0.035])), back: K.pt([0, backY]), foot: K.pt([0, 0]),
    shoulder: K.pt(NP), tailTip: K.pt([tp[0] - 24, tp[1] - 90]), withers: K.pt([0.55 * L, backY]),
  };
  return { parts, anchors };
}
