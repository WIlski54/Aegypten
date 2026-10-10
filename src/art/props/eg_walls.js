// Gruppe S2 – Innenwände als Bühnenhintergrund: Tempelhalle (Station 4), Werkstatt (Station 5), Gelehrtenzimmer (Station 8).
import {
  C, rect, trap, crumbleTop, archPoly, fr, clipTo, clipRect, shp, sideLight, vGrad, vignette, bricks, blocks, plaster, woodGrain, logEnds,
  glyph, glyphRow, star5, stripeBand, cavetto, torusH, starCeiling, jar, wallFigure, mk, opt,
  blob, limb, poly, mix, shade, rngOf, leaf, wavy, ribbon, spline,
  fillPoly, fillPolys, fillGrad, strokePoly, curve, strokes, volume, line,
} from './_eg_arch_kit.js';

// ================================================================================================
// TEMPELHALLE_WAND: Innenwand, 11 m breit, 5 m hoch. Lapislazuli-Wand, schwarzer Boden mit Goldleiste,
// bemalter Götterfries (Prozession auf Osiris zu), Kheker-Band, Sternendecke. Unten bewusst ruhig (Götter-Figuren stehen davor).
export function tempelhalle_wand(o0 = {}) {
  const o = opt(o0);
  const W = 11, H = 5;
  const layers = [
    { // Wand + Boden
      shapes: [rect(0, 0, W, 2.75)], fill: { top: '#3d70b4', bottom: '#1f4688' },
      deco(c, bb) {
        const rng = rngOf(41, 2);
        for (let i = 0; i < 200; i++) fillPoly(c, blob(rng() * W, 0.3 + rng() * 2.7, 0.03 + rng() * 0.07, 0.02 + rng() * 0.05, rng() * 3, 7), rng() < 0.55 ? 'rgba(255,255,255,.09)' : 'rgba(10,20,60,.14)');
        for (let x = -0.5; x < W + 0.5; x += 0.55) strokes(c, [[x, 0.3, x + 2.4, 2.7], [x + 2.4, 0.3, x, 2.7]], 'rgba(255,230,150,.12)', 0.012, 1);
        for (const x of [0.04, 2.75, 5.5, 8.25, 10.96]) { fr(c, x - 0.07, 0.3, x + 0.07, 2.7, 'rgba(10,15,45,.35)'); fr(c, x - 0.012, 0.3, x + 0.012, 2.7, 'rgba(255,225,140,.5)'); }
        vGrad(c, 0, 0.3, W, 1.4, 'rgba(0,0,0,0)', 'rgba(5,10,40,.35)');
        fr(c, 0, 0, W, 0.3, C.black);
        for (let x = 0; x < W; x += 1.1 + (x % 2) * 0.3) fr(c, x, 0, x + 0.012, 0.3, 'rgba(255,255,255,.1)');
        fr(c, 0, 0.27, W, 0.3, C.gold); fr(c, 0, 0.3, W, 0.34, C.goldDk); fr(c, 0, 0.27, W, 0.285, C.goldLt);
      },
    },
    { // Zierband
      shapes: [rect(0, 2.7, W, 2.85)], fill: C.linen,
      deco(c) { stripeBand(c, 0, W, 2.7, 2.85, [C.carn, C.lapis, C.turq, C.gold], { step: 0.16 }); },
    },
    { // Fries
      shapes: [rect(0, 2.85, W, 4.4)], fill: '#ecdcaa',
      deco(c) {
        plaster(c, 0, 2.85, W, 4.4, '#efdfb0', { seed: 7, alpha: 0.12, n: 70 });
        fr(c, 0, 2.85, W, 2.9, C.carn); fr(c, 0, 2.9, W, 2.925, C.black); fr(c, 0, 4.35, W, 4.4, C.carn); fr(c, 0, 4.325, W, 4.35, C.black);
        fr(c, 0, 3.0, W, 3.03, 'rgba(120,70,30,.5)');
        const seq = [['ra', 'was'], ['anubis', 'ankh'], ['thot', 'ankh'], ['horus', 'was'], ['hathor', 'ankh'], ['isis', 'ankh'], ['maat', 'ankh'], ['osiris', 'ankh']];
        const pitch = W / seq.length;
        seq.forEach(([k, hold], i) => wallFigure(c, pitch * (i + 0.5) - 0.08, 3.05, 1.2, k, { dir: 1, hold }));
        for (let i = 0; i < seq.length - 1; i++) glyph(c, ['djed', 'ankh', 'was', 'djed', 'ankh', 'was', 'djed'][i], pitch * (i + 1), 3.12, 0.46, C.goldDk, 0.028);
      },
    },
    { // Kheker-Band
      shapes: [rect(0, 4.4, W, 4.6)], fill: C.linen,
      deco(c) {
        const cols = [C.carn, C.lapis, C.nile, C.gold];
        let i = 0;
        for (let x = 0.03; x < W; x += 0.18, i++) { fr(c, x, 4.42, x + 0.12, 4.54, cols[i % 4]); fillPoly(c, [[x, 4.54], [x + 0.12, 4.54], [x + 0.06, 4.6]], cols[i % 4]); }
      },
    },
    { // Sternendecke
      shapes: [rect(0, 4.6, W, H)], fill: C.lapisDk,
      deco(c) {
        starCeiling(c, 0, 4.6, W, H, { pitch: 0.4, r: 0.1 });
        fr(c, 0, 4.6, W, 4.65, C.gold); fr(c, 0, 4.65, W, 4.675, C.goldDk); fr(c, 0, 4.6, W, 4.615, C.goldLt);
        fr(c, 0, H - 0.05, W, H, C.gold);
      },
    },
  ];
  return mk('tempelhalle_wand', 'Tempelhalle (Innenwand)', { body: { z: 0, layers } },
    { base: [W / 2, 0], top: { rel: [0.5, 1] }, friesRechts: [W - 0.7, 3.2] }, { kind: 'wall', lengthM: 11 }, { w: o.w ?? W, floor: 0 });
}

// ================================================================================================
// WERKSTATT_WAND: Hintergrund der Mumienwerkstatt. 11 m breit, ~4,8 m hoch. Lehmputz, karneolroter Sockel, Regale mit Krügen,
// Deckenbalken, Öffnung ins Licht (Part `licht` dahinter: goldener Tag, Dünen).
export function werkstatt_wand(o0 = {}) {
  const o = opt(o0);
  const W = 11, H = 4.8, ox0 = 5.1, ox1 = 8.0, oy = 3.25;
  const pieces = [rect(0, 0, ox0, 4.52), rect(ox1, 0, W, 4.52), rect(ox0 - 0.02, oy, ox1 + 0.02, 4.52)];
  const roof = rect(0, 4.5, W, H);
  const shelfX = [[0.7, 3.9], [8.45, 10.5]];
  const shelfY = [1.0, 2.0, 3.0];
  const body = {
    z: 2, layers: [
      {
        shapes: pieces, fill: C.mud,
        deco(c) {
          const rng = rngOf(51, 3);
          plaster(c, 0, 0, W, 4.6, '#c68e5c', { seed: 15, alpha: 0.16, n: 160 });
          bricks(c, 0, 0, 0.45, 4.6, { bw: 0.3, bh: 0.15, base: '#b9824f', seed: 12, vary: 0.2 });
          bricks(c, W - 0.45, 0, W, 4.6, { bw: 0.3, bh: 0.15, base: '#b9824f', seed: 13, vary: 0.2 });
          fr(c, 0.45, 0, W - 0.45, 0.5, C.carn); fr(c, 0.45, 0.5, W - 0.45, 0.54, C.black); fr(c, 0.45, 0.54, W - 0.45, 0.58, '#f3e9cc');
          fillGrad(c, rect(0.45, 0, W - 0.45, 0.5), 0, 0.5, 0, 0, [[0, 'rgba(255,200,160,.15)'], [1, 'rgba(60,10,0,.35)']]);
          for (let x = 0.7; x < W - 0.5; x += 0.55) fr(c, x, 0.12, x + 0.13, 0.4, 'rgba(255,225,170,.13)');
          for (let i = 0; i < 9; i++) { const x = 0.7 + rng() * 9.5, y = 0.8 + rng() * 3.4; if (x > ox0 - 0.9 && x < ox1 + 0.4 && y < oy + 0.5) continue; if ((x < 4.2 || x > 8.2) && y < 3.5 && y > 0.5) continue; bricks(c, x, y, x + 0.45 + rng() * 0.3, y + 0.3, { bw: 0.15, bh: 0.075, base: '#b07844', seed: 20 + i, vary: 0.2, gap: 0.01 }); }
          fillGrad(c, rect(ox0 - 1.3, 0, ox0, 4.5), ox0, 0, ox0 - 1.3, 0, [[0, 'rgba(255,230,150,.35)'], [1, 'rgba(255,230,150,0)']]);
          fillGrad(c, rect(ox1, 0, ox1 + 1.3, 4.5), ox1, 0, ox1 + 1.3, 0, [[0, 'rgba(255,230,150,.35)'], [1, 'rgba(255,230,150,0)']]);
          vignette(c, 0, 0, W, 4.5, { a: 0.18, k: 0.12 });
        },
      },
      {
        shapes: [rect(ox0 - 0.2, oy - 0.04, ox1 + 0.2, oy + 0.3)], fill: C.wood,
        deco(c) { woodGrain(c, ox0 - 0.2, oy - 0.04, ox1 + 0.2, oy + 0.3, '#8d5c34', { n: 10, seed: 6 }); fr(c, ox0 - 0.2, oy + 0.24, ox1 + 0.2, oy + 0.3, 'rgba(255,230,180,.3)'); fr(c, ox0 - 0.2, oy - 0.04, ox1 + 0.2, oy + 0.02, 'rgba(30,10,0,.4)'); },
      },
      {
        shapes: [roof], fill: '#a87442',
        deco(c) {
          fr(c, 0, 4.5, W, H, '#9c6a3c'); fr(c, 0, H - 0.07, W, H, '#c99a62');
          logEnds(c, 0.04, W - 0.04, 4.62, 0.1, { gap: 0.05, seed: 77 });
          fr(c, 0, 4.5, W, 4.53, 'rgba(30,10,0,.4)');
        },
      },
      {
        shapes: shelfX.flatMap(([a, b]) => [rect(a, 0.55, b, 3.95), ...shelfY.map((y) => rect(a - 0.1, y - 0.07, b + 0.1, y + 0.01)), rect(a - 0.07, 0.55, a + 0.0, 4.0), rect(b, 0.55, b + 0.07, 4.0)]),
        fill: '#7a4a2a',
        deco(c) {
          for (const [a, b] of shelfX) { fr(c, a, 0.55, b, 3.95, '#7f4e2c'); fillGrad(c, rect(a, 0.55, b, 3.95), 0, 3.3, 0, 0.55, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(255,220,160,.12)']]); }
          const rng = rngOf(61, 7);
          const cols = ['#c9783c', '#e0c088', '#2a2220', '#2a5aa0', '#c0432e', '#efe3c4', '#3bb3a8', '#a9693a'];
          const kinds = ['rund', 'hoch', 'amphore', 'napf', 'flasche'];
          shelfX.forEach(([a, b], si) => shelfY.forEach((y, yi) => {
            let x = a + 0.1;
            while (x < b - 0.2) {
              const k = kinds[Math.floor(rng() * kinds.length)], hh = 0.4 + rng() * 0.45, col = cols[Math.floor(rng() * cols.length)];
              const wd = hh * (k === 'napf' ? 0.55 : 0.5);
              if (si === 1 && yi === 2) {
                fillPoly(c, [[x, y + 0.01], [x + 0.3, y + 0.01], [x + 0.3, y + 0.5], [x, y + 0.5]], '#f6efe0'); strokePoly(c, [[x, y + 0.01], [x + 0.3, y + 0.01], [x + 0.3, y + 0.5], [x, y + 0.5]], 'rgba(60,40,20,.45)', 0.012);
                fillPoly(c, blob(x + 0.15, y + 0.5, 0.15, 0.05, 0, 14), '#e9dfc6'); fr(c, x, y + 0.2, x + 0.3, y + 0.23, 'rgba(120,90,50,.4)'); x += 0.34; continue;
              }
              jar(c, x + wd, y + 0.01, hh, k, col, { band: rng() < 0.5 ? (col === '#2a2220' ? '#e0b040' : '#2a5aa0') : null });
              x += wd * 1.9 + 0.06;
            }
          }));
          for (const [a, b] of shelfX) for (const y of shelfY) { fr(c, a - 0.1, y - 0.07, b + 0.1, y + 0.01, '#b07c48'); fr(c, a - 0.1, y - 0.07, b + 0.1, y - 0.045, 'rgba(255,235,190,.4)'); fr(c, a - 0.1, y - 0.01, b + 0.1, y + 0.01, 'rgba(40,15,0,.45)'); }
          for (const [a, b] of shelfX) { fr(c, a - 0.07, 0.55, a, 4.0, '#b07c48'); fr(c, b, 0.55, b + 0.07, 4.0, '#b07c48'); }
        },
      },
    ],
  };
  const licht = {
    z: -10, layers: [{
      shapes: [rect(ox0 - 0.15, 0, ox1 + 0.15, oy + 0.15)], fill: '#fbe9a8',
      deco(c) {
        fillGrad(c, rect(ox0 - 0.2, 0, ox1 + 0.2, oy + 0.2), 0, oy + 0.2, 0, 0, [[0, '#9fd2e6'], [0.45, '#fdf0b8'], [1, '#f7d58a']]);
        const cx = (ox0 + ox1) / 2, cy = 2.35;
        for (let i = 0; i < 7; i++) { const a = -0.7 + i * 0.24; fillPoly(c, [[cx, cy], [cx + Math.cos(a + Math.PI / 2) * 3, cy + Math.sin(a + Math.PI / 2) * 3], [cx + Math.cos(a + Math.PI / 2 + 0.07) * 3, cy + Math.sin(a + Math.PI / 2 + 0.07) * 3]], 'rgba(255,250,200,.18)'); }
        fillPoly(c, blob(cx, cy, 0.34, 0.34, 0, 24), '#fffbe0'); fillPoly(c, blob(cx, cy, 0.55, 0.55, 0, 24), 'rgba(255,250,210,.4)');
        fillPoly(c, [[ox0 - 0.2, 0], [ox0 - 0.2, 0.75], [5.9, 0.95], [6.8, 0.7], [7.6, 0.9], [ox1 + 0.2, 0.6], [ox1 + 0.2, 0]], '#e6bf72');
        fillPoly(c, [[ox0 - 0.2, 0], [ox0 - 0.2, 0.45], [6.2, 0.55], [7.2, 0.4], [ox1 + 0.2, 0.5], [ox1 + 0.2, 0]], '#d4a455');
        fr(c, ox0 - 0.2, 0, ox1 + 0.2, 0.12, 'rgba(120,70,20,.3)');
      },
    }],
  };
  return mk('werkstatt_wand', 'Werkstattwand (Lehm, Regale, Lichtöffnung)', { body, licht },
    { base: [W / 2, 0], opening: [(ox0 + ox1) / 2, 0.0], top: { rel: [0.5, 1] } }, { kind: 'wall', lengthM: 11 }, { w: o.w ?? W, floor: 0 });
}
