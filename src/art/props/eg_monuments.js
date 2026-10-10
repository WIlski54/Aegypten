// Gruppe S2 – große Bauwerke (Frontalansicht): Totentempel der Hatschepsut, Abu Simbel, Leuchtturm von Pharos, Bibliothek von Alexandria.
import {
  C, rect, trap, crumbleTop, archPoly, fr, clipTo, shp, sideLight, vGrad, vignette, bricks, blocks, plaster, woodGrain,
  glyph, glyphRow, star5, stripeBand, cavetto, torusH, torusV, mk, opt,
  blob, limb, poly, mix, shade, rngOf, leaf, wavy, ribbon, spline,
  fillPoly, fillPolys, fillGrad, strokePoly, curve, strokes, volume, line,
} from './_eg_arch_kit.js';

// ================================================================================================
// TOTENTEMPEL_HATSCHEPSUT ~11 m breit: Terrassentempel von Deir el-Bahari: drei Terrassen mit Säulengängen (Pfeilerreihen im Schatten),
// Mittelrampen, davor Vorhof; dahinter die steile, senkrecht gefurchte Kalksteinwand (Part `fels`, liegt hinter dem Tempel).
export function totentempel_hatschepsut(o0 = {}) {
  const o = opt(o0);
  const W = 11, cx = 5.5;
  // Felswand (hinten): goldene Klippe mit senkrechten Rinnen
  const cliffTop = [[0, 3.7], [0.35, 4.5], [1.2, 4.9], [2.0, 5.0], [2.8, 5.15], [3.6, 5.25], [4.4, 5.35], [5.5, 5.55], [6.6, 5.35], [7.4, 5.25], [8.2, 5.15], [9.0, 5.0], [9.8, 4.9], [10.65, 4.5], [11, 3.7]];
  const cliff = poly([[0, 1.0], ...cliffTop, [11, 1.0]], 0);
  const fels = {
    z: -8, layers: [{
      shapes: [cliff], fill: { top: '#e6b974', bottom: '#c78e4e' },
      deco(c) {
        const rng = rngOf(5, 5);
        // senkrechte Erosionsrinnen
        for (let i = 0; i < 70; i++) { const x = rng() * 11, y0 = 1.0 + rng() * 3.6, l = 0.6 + rng() * 1.8; fr(c, x, y0 - l, x + 0.05 + rng() * 0.08, y0, 'rgba(110,60,20,.28)'); fr(c, x + 0.07, y0 - l, x + 0.1, y0, 'rgba(255,235,185,.28)'); }
        // Schichtbänder
        for (const y of [1.6, 2.2, 2.9, 3.6, 4.3, 4.9]) curve(c, wavy(-0.2, 11.2, y, 0.04, 4, { n: 40, phase: y * 3 }), 'rgba(110,60,20,.4)', 0.02, { alpha: 1 });
        fillGrad(c, cliff, 0, 0, 11, 0, [[0, 'rgba(255,240,200,.25)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(90,40,10,.3)']]);
        vGrad(c, -0.2, 4.3, 11.2, 5.6, 'rgba(255,245,210,.3)', 'rgba(0,0,0,0)');
        for (let i = 0; i < 30; i++) fillPoly(c, blob(rng() * 11, 1.0 + rng() * 3.8, 0.04 + rng() * 0.05, 0.03 + rng() * 0.03, 0, 6), rng() < 0.5 ? 'rgba(255,240,200,.3)' : 'rgba(90,50,20,.25)');
      },
    }],
  };
  // Terrassen
  const terr = [
    { y0: 0.0, y1: 1.1, hw: 5.0, n: 26 },
    { y0: 1.1, y1: 2.2, hw: 4.7, n: 24 },
    { y0: 2.2, y1: 3.3, hw: 4.2, n: 22 },
  ];
  const layers = [];
  const lime = '#f0e4c0', limeSh = '#d6c392';
  terr.forEach((t, ti) => {
    // Terrassenkörper (Stützmauer + Portikus), Mittelgasse für Rampe wird freigelassen (dunkel) und von Rampe überdeckt
    layers.push({
      shapes: [rect(cx - t.hw, t.y0, cx + t.hw, t.y1)], fill: lime,
      deco(c) {
        const x0 = cx - t.hw, x1 = cx + t.hw;
        blocks(c, x0, t.y0, x1, t.y1, { ch: 0.22, bw: 0.7, base: lime, seed: 40 + ti, vary: 0.08, joint: 'rgba(120,90,50,.45)' });
        // Portikus: dunkler Hintergrund
        const py0 = t.y0 + 0.14, py1 = t.y1 - 0.16;
        fr(c, x0 + 0.12, py0, x1 - 0.12, py1, '#4a3626'); fillGrad(c, rect(x0, py0, x1, py1), 0, py1, 0, py0, [[0, 'rgba(255,200,140,.18)'], [1, 'rgba(0,0,0,.25)']]);
        // Rückwand-Reliefstreifen (angedeutet)
        for (let x = x0 + 0.3; x < x1 - 0.3; x += 0.6) fr(c, x, py0 + 0.1, x + 0.3, py1 - 0.12, 'rgba(200,120,70,.25)');
        // Pfeiler
        const n = t.n, step = (2 * t.hw - 0.3) / n;
        for (let i = 0; i <= n; i++) {
          const x = x0 + 0.15 + step * i;
          fr(c, x - 0.08, py0, x + 0.08, py1, lime); fr(c, x - 0.08, py0, x - 0.045, py1, 'rgba(255,255,240,.5)'); fr(c, x + 0.04, py0, x + 0.08, py1, 'rgba(120,80,30,.4)');
        }
        // Dach/Gesims
        fr(c, x0, t.y1 - 0.16, x1, t.y1, lime); fr(c, x0, t.y1 - 0.16, x1, t.y1 - 0.14, 'rgba(120,80,30,.5)'); fr(c, x0, t.y1 - 0.03, x1, t.y1, 'rgba(255,255,240,.6)');
        fr(c, x0, t.y1 - 0.12, x1, t.y1 - 0.08, C.lapis, 0.8); // blaues Zierband
        // Sockel
        fr(c, x0, t.y0, x1, t.y0 + 0.14, limeSh); fr(c, x0, t.y0 + 0.12, x1, t.y0 + 0.14, 'rgba(255,255,240,.5)');
        sideLight(c, x0, t.y0, x1, t.y1, { left: 'rgba(255,250,230,.15)', right: 'rgba(80,50,10,.22)' });
        if (ti === 0) vGrad(c, x0, t.y0, x1, t.y0 + 0.4, 'rgba(0,0,0,0)', 'rgba(70,40,10,.2)');
      },
    });
  });
  // Mittelrampe: Frontansicht einer Rampe mit Brüstungen (Steigung als Schrägstriche)
  const ramp = [rect(cx - 0.75, 0, cx + 0.75, 1.1), rect(cx - 0.7, 1.1, cx + 0.7, 2.2)];
  layers.push({
    shapes: ramp, fill: '#f6edcf',
    deco(c) {
      for (const [y0, y1] of [[0, 1.1], [1.1, 2.2]]) {
        const hw = y0 === 0 ? 0.75 : 0.7;
        fr(c, cx - hw, y0, cx + hw, y1, '#f6edcf');
        for (let y = y0 + 0.06; y < y1; y += 0.12) line(c, [[cx - hw + 0.12, y], [cx + hw - 0.12, y + 0.06]], 'rgba(130,95,50,.45)', 0.012);
        fr(c, cx - hw, y0, cx - hw + 0.12, y1, '#e8d8a8'); fr(c, cx + hw - 0.12, y0, cx + hw, y1, '#c9b27a'); // Brüstungen
        fr(c, cx - hw, y0, cx - hw + 0.015, y1, 'rgba(255,255,240,.7)');
      }
      sideLight(c, cx - 0.75, 0, cx + 0.75, 2.2, { left: 'rgba(255,255,240,.15)', right: 'rgba(80,50,10,.2)' });
    },
  });
  // Oberste Terrasse: Sanktuarium-Portal im Fels + zwei Pfeilerstatuen (Osiris)
  layers.push({
    shapes: [rect(cx - 0.6, 3.3, cx + 0.6, 3.45), poly([[cx - 0.45, 3.3], [cx + 0.45, 3.3], [cx + 0.4, 3.9], [cx - 0.4, 3.9]], 0)], fill: '#8a5a32',
    deco(c) { fr(c, cx - 0.45, 3.3, cx + 0.45, 3.9, '#2a1a12'); strokePoly(c, rect(cx - 0.45, 3.3, cx + 0.45, 3.9), '#e8d6a0', 0.06); fr(c, cx - 0.6, 3.3, cx + 0.6, 3.45, '#e8d6a0'); glyph(c, 'sonne', cx, 3.55, 0.25, C.gold, 0.02); },
  });
  // Osiris-Pfeilerstatuen (Standfiguren, bunt angedeutet): links und rechts von Rampe oben
  const stat = [];
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const x = cx + s * (1.2 + k * 0.5); stat.push(rect(x - 0.12, 2.25, x + 0.12, 3.1), blob(x, 3.17, 0.1, 0.12, 0, 12)); }
  layers.push({
    shapes: stat, fill: '#e8dcc0',
    deco(c) {
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
        const x = cx + s * (1.2 + k * 0.5);
        fr(c, x - 0.12, 2.25, x + 0.12, 3.1, '#efe3c4'); fillPoly(c, blob(x, 3.17, 0.1, 0.12, 0, 12), '#6fb08a'); fr(c, x - 0.12, 2.6, x + 0.12, 2.64, C.carn); fr(c, x - 0.1, 2.95, x + 0.1, 3.0, C.gold);
        fillGrad(c, rect(x - 0.12, 2.25, x + 0.12, 3.3), x - 0.12, 0, x + 0.12, 0, [[0, 'rgba(255,255,240,.3)'], [1, 'rgba(60,30,0,.3)']]);
        strokes(c, [[x - 0.06, 2.9, x + 0.06, 2.9]], C.black, 0.012, 1);
      }
    },
  });
  // Vorhof: Sand und niedrige Bäume (Weihrauchbäume) als Punkte
  layers.unshift({
    shapes: [poly([[0.2, 0], [W - 0.2, 0], [W - 0.5, 0.12], [0.5, 0.12]], 0)], fill: '#e8cf94',
    deco(c) { fr(c, 0, 0, W, 0.2, '#e8cf94'); },
  });
  return mk('totentempel_hatschepsut', 'Totentempel der Hatschepsut (Deir el-Bahari)', { body: { z: 1, layers }, fels },
    { base: [cx, 0], rampeFuss: [cx, 0], terrasse1: [cx, 1.1], terrasse2: [cx, 2.2], terrasse3: [cx, 3.3], top: { rel: [0.5, 1] } },
    { kind: 'building', lengthM: 11, note: 'Part fels = Felswand dahinter; drei Terrassen mit Säulengängen' }, { w: o.w ?? W, floor: 0 });
}

// ================================================================================================
// ABU_SIMBEL ~5 m: Felsfassade des Großen Tempels: Hohlkehle mit Pavianreihe, vier sitzende Kolossalstatuen (Doppelkrone, Nemes),
// Eingang mit Ra-Horachte-Nische. Sandstein, zarte Bemalung nur an Kronen/Nemes (Teaser).
export function abu_simbel(o0 = {}) {
  const o = opt(o0);
  const hw0 = 3.4, hw1 = 3.0, yF = 4.35;       // Fassade unten/oben, Höhe bis Hohlkehle
  const facade = poly([[-hw0, 0], [hw0, 0], [hw1 + 0.05, yF], [-hw1 - 0.05, yF]], 0);
  const corn = rect(-hw1 - 0.2, yF - 0.02, hw1 + 0.2, yF + 0.4);
  const baboons = [];
  for (let i = 0; i < 11; i++) { const x = -hw1 + 0.15 + (i * (2 * hw1 - 0.3)) / 10; baboons.push(blob(x, yF + 0.5, 0.11, 0.1, 0, 12), rect(x - 0.1, yF + 0.38, x + 0.1, yF + 0.5)); }
  const cxs = [-2.25, -0.95, 0.95, 2.25];
  const stat = (x) => [
    rect(x - 0.45, 0, x + 0.45, 0.14),                           // Sockel
    rect(x - 0.38, 0.1, x - 0.06, 1.2), rect(x + 0.06, 0.1, x + 0.38, 1.2),   // Unterschenkel
    rect(x - 0.45, 1.1, x + 0.45, 1.42),                          // Knie / Schoß
    poly([[x - 0.34, 1.35], [x + 0.34, 1.35], [x + 0.32, 2.1], [x + 0.46, 2.45], [x - 0.46, 2.45], [x - 0.32, 2.1]], 0), // Rumpf
    rect(x - 0.52, 1.2, x - 0.34, 2.35), rect(x + 0.34, 1.2, x + 0.52, 2.35),  // Oberarme
    rect(x - 0.15, 2.4, x + 0.15, 2.58),                          // Hals
    blob(x, 2.85, 0.27, 0.34, 0, 24),                             // Gesicht
    poly([[x - 0.34, 2.45], [x - 0.3, 3.05], [x - 0.24, 3.28], [x + 0.24, 3.28], [x + 0.3, 3.05], [x + 0.34, 2.45], [x + 0.22, 2.45], [x + 0.2, 2.75], [x - 0.2, 2.75], [x - 0.22, 2.45]], 0), // Nemes
    poly([[x - 0.17, 3.2], [x + 0.17, 3.2], [x + 0.13, 3.62], [x + 0.06, 3.62], [x + 0.1, 3.9], [x - 0.02, 3.9], [x - 0.02, 3.62], [x - 0.13, 3.62]], 0), // Doppelkrone (Schaft)
  ];
  const layers = [
    {
      shapes: [facade, corn, ...baboons], fill: '#e0b070',
      deco(c) {
        const rng = rngOf(8, 8);
        fr(c, -hw0 - 0.2, 0, hw0 + 0.2, yF, '#dcae6c');
        for (let i = 0; i < 40; i++) fr(c, -hw0 + rng() * 2 * hw0, 0.2 + rng() * 4, 0.04, 0.0, 'rgba(0,0,0,0)');
        // senkrechte Bahnen (Meißelspuren) + Verwitterung
        for (let i = 0; i < 60; i++) { const x = -3.4 + rng() * 6.8, y0 = 0.1 + rng() * 4.1, l = 0.3 + rng() * 1.0; fr(c, x, y0 - l, x + 0.03 + rng() * 0.04, y0, 'rgba(120,70,20,.22)'); }
        for (let i = 0; i < 40; i++) fillPoly(c, blob(-3.3 + rng() * 6.6, rng() * 4.2, 0.04 + rng() * 0.05, 0.03 + rng() * 0.04, 0, 6), rng() < 0.5 ? 'rgba(255,240,200,.3)' : 'rgba(110,60,20,.25)');
        // Hohlkehle oben
        cavetto(c, -hw1 - 0.25, yF - 0.02, hw1 + 0.25, yF + 0.4, { base: '#e4b878', cols: ['#d9a05a', '#c98a46', '#d9a05a'], step: 0.1 });
        // Pavianreihe
        for (const b of baboons) {}
        for (let i = 0; i < 11; i++) { const x = -hw1 + 0.15 + (i * (2 * hw1 - 0.3)) / 10; fillPoly(c, blob(x, yF + 0.5, 0.11, 0.1, 0, 12), '#ecc080'); fillPoly(c, rect(x - 0.1, yF + 0.38, x + 0.1, yF + 0.5), '#d9a864'); fillPoly(c, [[x - 0.02, yF + 0.5], [x + 0.06, yF + 0.5], [x + 0.03, yF + 0.44]], 'rgba(90,50,10,.4)'); }
        // Eingang
        fr(c, -0.4, 0, 0.4, 1.65, '#2a1a12'); strokePoly(c, rect(-0.4, 0, 0.4, 1.65), '#c68c4c', 0.07);
        fr(c, -0.5, 1.65, 0.5, 1.75, '#c68c4c');
        // Nische mit Ra-Horachte über dem Eingang
        fr(c, -0.38, 1.85, 0.38, 2.95, '#9a6a3a'); fr(c, -0.32, 1.9, 0.32, 2.9, '#e8c690'); strokePoly(c, rect(-0.38, 1.85, 0.38, 2.95), '#7a4a1e', 0.03);
        wallFig(c, 0, 1.9, 0.95);
        fillGrad(c, facade, -3.4, 0, 3.4, 0, [[0, 'rgba(255,245,210,.22)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(80,35,5,.3)']]);
        vGrad(c, -3.5, 0, 3.5, 0.5, 'rgba(0,0,0,0)', 'rgba(90,50,10,.25)');
      },
    },
    {
      shapes: cxs.flatMap(stat), fill: '#ecc588',
      deco(c) {
        for (const x of cxs) {
          const sx = x;
          // Grundton heller als Fassade
          fr(c, sx - 0.6, 0, sx + 0.6, 4, '#eec78c');
          // Schattenkanten, Gliederung
          fillGrad(c, rect(sx - 0.55, 0, sx + 0.55, 4), sx - 0.55, 0, sx + 0.55, 0, [[0, 'rgba(255,250,225,.35)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(90,45,10,.3)']]);
          // Beine: Spalt, Knie-Linie
          fr(c, sx - 0.03, 0.1, sx + 0.03, 1.2, 'rgba(90,45,10,.55)'); fr(c, sx - 0.45, 1.1, sx + 0.45, 1.13, 'rgba(90,45,10,.45)'); fr(c, sx - 0.45, 1.39, sx + 0.45, 1.42, 'rgba(255,248,225,.5)');
          // Hände auf den Knien
          for (const s of [-1, 1]) { fillPoly(c, [[sx + s * 0.1, 1.2], [sx + s * 0.44, 1.2], [sx + s * 0.44, 1.38], [sx + s * 0.1, 1.38]], '#e4b878'); line(c, [[sx + s * 0.16, 1.3], [sx + s * 0.42, 1.3]], 'rgba(90,45,10,.4)', 0.01); }
          // Schurz-Falten, Brust
          line(c, [[sx - 0.3, 1.5], [sx - 0.3, 2.05]], 'rgba(90,45,10,.3)', 0.012); line(c, [[sx + 0.3, 1.5], [sx + 0.3, 2.05]], 'rgba(90,45,10,.3)', 0.012);
          // Halskragen (gold/blau-Andeutung)
          fillPoly(c, [[sx - 0.3, 2.45], [sx + 0.3, 2.45], [sx + 0.22, 2.12], [sx - 0.22, 2.12]], '#d9b050'); line(c, [[sx - 0.22, 2.2], [sx + 0.22, 2.2]], C.lapis, 0.025); line(c, [[sx - 0.26, 2.32], [sx + 0.26, 2.32]], C.turq, 0.025);
          // Gesicht
          fillPoly(c, blob(sx, 2.85, 0.24, 0.31, 0, 24), '#f1cf98');
          fillGrad(c, blob(sx, 2.85, 0.24, 0.31, 0, 24), sx - 0.24, 0, sx + 0.24, 0, [[0, 'rgba(255,250,225,.35)'], [1, 'rgba(90,45,10,.25)']]);
          for (const s of [-1, 1]) { fillPoly(c, [[sx + s * 0.05, 2.9], [sx + s * 0.18, 2.93], [sx + s * 0.18, 2.89]], '#6a4018'); line(c, [[sx + s * 0.05, 2.96], [sx + s * 0.19, 2.98]], '#6a4018', 0.012); }
          line(c, [[sx, 2.92], [sx - 0.02, 2.78], [sx + 0.02, 2.76]], 'rgba(90,45,10,.5)', 0.012);
          line(c, [[sx - 0.08, 2.67], [sx + 0.0, 2.65], [sx + 0.08, 2.67]], '#a8683a', 0.014);
          // Bart
          fillPoly(c, [[sx - 0.04, 2.6], [sx + 0.04, 2.6], [sx + 0.03, 2.38], [sx - 0.03, 2.38]], '#5a7fb5');
          // Nemes: Streifen
          for (let k = 0; k < 6; k++) { const y = 2.5 + k * 0.1; line(c, [[sx - 0.32 + k * 0.01, y], [sx - 0.22, y + 0.02]], C.lapis, 0.02); line(c, [[sx + 0.32 - k * 0.01, y], [sx + 0.22, y + 0.02]], C.lapis, 0.02); }
          for (const s of [-1, 1]) fillPoly(c, [[sx + s * 0.22, 2.45], [sx + s * 0.34, 2.45], [sx + s * 0.3, 3.05], [sx + s * 0.24, 3.0]], 'rgba(42,90,160,.55)');
          fillPoly(c, [[sx - 0.24, 3.1], [sx + 0.24, 3.1], [sx + 0.22, 3.28], [sx - 0.22, 3.28]], '#d9b050');
          // Doppelkrone: unten weiß, oben rot
          fillPoly(c, [[sx - 0.17, 3.2], [sx + 0.17, 3.2], [sx + 0.13, 3.62], [sx - 0.13, 3.62]], '#f6efe0');
          fillPoly(c, [[sx - 0.13, 3.62], [sx - 0.02, 3.62], [sx - 0.02, 3.9], [sx + 0.1, 3.9], [sx + 0.06, 3.62], [sx + 0.13, 3.62], [sx + 0.13, 3.55], [sx - 0.13, 3.55]], C.carn);
          // Uräus
          fillPoly(c, blob(sx, 3.18, 0.03, 0.04, 0, 8), C.gold);
        }
      },
    },
  ];
  return mk('abu_simbel', 'Felstempel von Abu Simbel', { body: { z: 1, layers } },
    { base: [0, 0], eingang: [0, 0], top: { rel: [0.5, 1] } }, { kind: 'building', heightM: 5, note: 'Teaser: vier Kolosse Ramses II.' }, { h: o.h ?? 5, floor: 0 });
}
// kleine stehende Wandfigur (Ra-Horachte) in der Nische: falkenköpfig, Sonnenscheibe
function wallFig(c, x, yb, h) {
  // reuse kit's painter
  wallFigureLazy(c, x, yb, h);
}
import { wallFigure } from './_eg_arch_kit.js';
function wallFigureLazy(c, x, yb, h) { wallFigure(c, x, yb, h, 'ra', { dir: 1, outline: 'rgba(60,30,5,.7)', hold: 'was' }); }

// ================================================================================================
// LEUCHTTURM_PHAROS ~5,5 m: dreistufig (quadratisch – achteckig – rund), Plattformen, Fenster, Rampentor; oben Feuerschale
// (Part `feuer`: kleine Flamme, die Seite setzt das Licht), bekrönende Statue. Auf einem Felsensockel.
export function leuchtturm_pharos(o0 = {}) {
  const o = opt(o0);
  const t1 = trap(-0.95, 0.95, 0.35, -0.72, 0.72, 2.45);
  const p1 = rect(-0.82, 2.4, 0.82, 2.56);
  const t2 = trap(-0.58, 0.58, 2.56, -0.5, 0.5, 4.1);
  const p2 = rect(-0.66, 4.05, 0.66, 4.2);
  const t3 = trap(-0.36, 0.36, 4.2, -0.33, 0.33, 4.85);
  const lantern = [rect(-0.44, 4.84, 0.44, 4.95), rect(-0.4, 4.95, -0.34, 5.35), rect(-0.12, 4.95, -0.06, 5.35), rect(0.06, 4.95, 0.12, 5.35), rect(0.34, 4.95, 0.4, 5.35), rect(-0.46, 5.32, 0.46, 5.42)];
  const bowl = poly([[-0.3, 5.42], [0.3, 5.42], [0.22, 5.55], [-0.22, 5.55]], 1);
  const rockP = poly([[-1.9, 0], [-1.6, 0.18], [-1.1, 0.3], [-0.95, 0.38], [0.95, 0.38], [1.2, 0.28], [1.7, 0.2], [2.0, 0]], 1);
  const stoneC = '#eee4cb';
  const layers = [
    { // Felsensockel
      shapes: [rockP], fill: '#a89478',
      deco(c) { const rng = rngOf(2, 2); for (let i = 0; i < 12; i++) fillPoly(c, blob(-1.8 + i * 0.32, 0.12 + rng() * 0.1, 0.2, 0.1, 0, 8), mix('#a89478', rng() < 0.5 ? '#fff4d6' : '#2a1a0e', 0.25)); vGrad(c, -2, 0, 2.1, 0.4, 'rgba(255,255,255,.2)', 'rgba(40,20,0,.3)'); },
    },
    {
      shapes: [t1, p1, t2, p2, t3], fill: stoneC,
      deco(c) {
        // Tier 1
        clipTo(c, t1, () => {
          blocks(c, -1, 0.35, 1, 2.45, { ch: 0.2, bw: 0.55, base: stoneC, seed: 3, vary: 0.08, joint: 'rgba(110,100,80,.45)' });
          fr(c, -1, 0.35, 0, 2.45, 'rgba(255,255,255,.18)'); fillGrad(c, rect(-1, 0.35, 1, 2.45), -1, 0, 1, 0, [[0, 'rgba(255,255,255,.2)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(60,70,100,.35)']]);
          // Tor mit Rampe und Fenster
          fr(c, -0.2, 0.35, 0.2, 0.85, '#2a1e18'); fillPoly(c, [[-0.2, 0.85], [0.2, 0.85], [0.0, 1.0]], '#2a1e18'); strokePoly(c, [[-0.2, 0.35], [-0.2, 0.85], [0, 1.0], [0.2, 0.85], [0.2, 0.35]], '#c9b88a', 0.04);
          for (const [x, y] of [[-0.45, 1.3], [0.45, 1.3], [0, 1.65], [-0.4, 2.0], [0.4, 2.0]]) { fr(c, x - 0.07, y, x + 0.07, y + 0.22, '#3a2a22'); fr(c, x - 0.08, y + 0.22, x + 0.08, y + 0.25, '#c9b88a'); }
        });
        fr(c, -0.82, 2.4, 0.82, 2.56, '#e6d9b8'); fr(c, -0.82, 2.4, 0.82, 2.43, 'rgba(60,40,10,.4)'); fr(c, -0.82, 2.53, 0.82, 2.56, 'rgba(255,255,245,.7)');
        for (let x = -0.78; x < 0.8; x += 0.12) fr(c, x, 2.46, x + 0.05, 2.52, 'rgba(120,100,70,.3)');
        // Tier 2 (achteckig angedeutet: Kanten)
        clipTo(c, t2, () => {
          blocks(c, -0.7, 2.56, 0.7, 4.1, { ch: 0.2, bw: 0.45, base: '#e8dec4', seed: 4, vary: 0.08, joint: 'rgba(110,100,80,.45)' });
          for (const x of [-0.28, 0.28]) line(c, [[x, 2.56], [x * 0.9, 4.1]], 'rgba(90,80,60,.4)', 0.015);
          fillGrad(c, rect(-0.6, 2.56, 0.6, 4.1), -0.6, 0, 0.6, 0, [[0, 'rgba(255,255,255,.25)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(60,70,100,.38)']]);
          for (const y of [2.95, 3.4, 3.8]) { fr(c, -0.06, y, 0.06, y + 0.2, '#3a2a22'); }
          fr(c, -0.09, 3.26, 0.09, 3.28, '#c9b88a');
        });
        fr(c, -0.66, 4.05, 0.66, 4.2, '#e6d9b8'); fr(c, -0.66, 4.05, 0.66, 4.08, 'rgba(60,40,10,.4)'); fr(c, -0.66, 4.17, 0.66, 4.2, 'rgba(255,255,245,.7)');
        // Tier 3 rund (Schattierung)
        clipTo(c, t3, () => { fr(c, -0.4, 4.2, 0.4, 4.85, '#ece2c8'); fillGrad(c, rect(-0.4, 4.2, 0.4, 4.85), -0.36, 0, 0.36, 0, [[0, 'rgba(255,255,255,.4)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(60,70,100,.5)']]); for (let y = 4.3; y < 4.8; y += 0.16) fr(c, -0.4, y, 0.4, y + 0.012, 'rgba(110,100,80,.35)'); fr(c, -0.05, 4.45, 0.05, 4.65, '#3a2a22'); });
        vGrad(c, -1.1, 0.35, 1.1, 0.8, 'rgba(0,0,0,0)', 'rgba(50,40,20,.2)');
      },
    },
    { // Laterne mit Säulen + Feuerschale
      shapes: [...lantern, bowl], fill: '#d9c9a0',
      deco(c) { fr(c, -0.5, 4.84, 0.5, 5.45, 'rgba(0,0,0,0)'); fr(c, -0.4, 4.95, 0.4, 5.32, '#ffe9a8'); fillGrad(c, rect(-0.4, 4.95, 0.4, 5.32), 0, 5.32, 0, 4.95, [[0, '#fff6cf'], [1, '#ffcf70']]); for (const x of [-0.37, -0.09, 0.09, 0.37]) fr(c, x - 0.035, 4.95, x + 0.035, 5.35, '#efe4c8'); fr(c, -0.46, 5.32, 0.46, 5.42, '#c8553a'); fr(c, -0.44, 4.84, 0.44, 4.95, '#e6d9b8'); fillPoly(c, bowl, C.gold); fillGrad(c, bowl, -0.3, 0, 0.3, 0, [[0, 'rgba(255,255,255,.4)'], [1, 'rgba(80,40,0,.3)']]); },
    },
  ];
  // Statue (Poseidon/Zeus-Helios) als kleine Figur über der Feuerschale: Pfosten + Figur (gold)
  const statueShapes = [rect(-0.04, 5.55, 0.04, 5.85)];
  layers.push({ shapes: statueShapes, fill: C.gold, deco(c) { fr(c, -0.05, 5.55, 0.05, 5.85, '#e0b040'); } });
  // Flamme als eigener Part: bewegt/ausgeblendet durch die Seite (Pivot unten)
  const fy = (y) => 5.52 + (y - 5.52) * 0.6, fx = (x) => x * 0.8;
  const flame = poly([[-0.22, 5.52], [-0.12, 5.75], [-0.18, 5.95], [-0.02, 5.82], [0.04, 6.15], [0.12, 5.85], [0.22, 5.95], [0.2, 5.7], [0.26, 5.52]].map(([x, y]) => [fx(x), fy(y)]), 2);
  const feuer = {
    z: 5, pivot: [0, 5.52],
    layers: [{ shapes: [flame], fill: { top: '#ffd24a', bottom: '#ee6a1c' }, deco(c) { fillPoly(c, poly([[-0.12, 5.54], [-0.06, 5.72], [0.0, 5.62], [0.05, 5.9], [0.1, 5.72], [0.14, 5.54]].map(([x, y]) => [fx(x), fy(y)]), 2), '#fff3a8'); } }],
  };
  return mk('leuchtturm_pharos', 'Leuchtturm von Pharos', { body: { z: 1, layers: layers.slice(0, 4) }, feuer },
    { base: [0, 0.35], feuer: [0, 5.55], tor: [0, 0.35], top: { rel: [0.5, 1] } },
    { kind: 'building', heightM: 5.5, ranges: { feuer: [0, 0.1] }, note: 'Part feuer = kleine Flamme (Pivot Feuerschale); Seite kann sie ausblenden/ersetzen und Licht setzen. Statue nicht enthalten (Gold-Pfosten)' }, { h: o.h ?? 5.5, floor: 0 });
}

// ================================================================================================
// BIBLIOTHEK_ALEXANDRIA ~5 m: hellenistische Säulenhalle mit Giebel (ionisch), dreistufiger Unterbau, Fries mit Mäander,
// blaues Giebelfeld mit goldener Scheibe; zwischen den Säulen Wandnischen mit Papyrusrollen.
export function bibliothek_alexandria(o0 = {}) {
  const o = opt(o0);
  const hw = 3.1, yS = 0.45, yC = 2.95, yE = 3.6, yP = 4.7;
  const steps = [rect(-hw - 0.45, 0, hw + 0.45, 0.15), rect(-hw - 0.3, 0.15, hw + 0.3, 0.3), rect(-hw - 0.15, 0.3, hw + 0.15, yS)];
  const cols = Array.from({ length: 6 }, (_, i) => -2.5 + i * 1.0);
  const wall = rect(-hw, yS, hw, yC);
  const colShape = (x) => [poly([[x - 0.3, yS], [x + 0.3, yS], [x + 0.25, yS + 0.12], [x - 0.25, yS + 0.12]], 0), poly([[x - 0.23, yS + 0.1], [x + 0.23, yS + 0.1], [x + 0.2, yC - 0.2], [x - 0.2, yC - 0.2]], 0), rect(x - 0.34, yC - 0.2, x + 0.34, yC - 0.1), blob(x - 0.3, yC - 0.14, 0.12, 0.12, 0, 14), blob(x + 0.3, yC - 0.14, 0.12, 0.12, 0, 14), rect(x - 0.4, yC - 0.1, x + 0.4, yC)];
  const entab = rect(-hw - 0.15, yC, hw + 0.15, yE);
  const ped = poly([[-hw - 0.3, yE], [hw + 0.3, yE], [0, yP]], 0);
  const acro = [blob(0, yP + 0.14, 0.14, 0.22, 0, 14), poly([[-hw - 0.2, yE], [-hw + 0.05, yE], [-hw - 0.08, yE + 0.34]], 0), poly([[hw + 0.2, yE], [hw - 0.05, yE], [hw + 0.08, yE + 0.34]], 0)];
  const layers = [
    { shapes: steps, fill: '#efe7d2', deco(c) { for (const [i, y] of [[0, 0], [1, 0.15], [2, 0.3]]) { fr(c, -4, y, 4, y + 0.15, i % 2 ? '#e9e0c8' : '#f1e9d4'); fr(c, -4, y + 0.12, 4, y + 0.15, 'rgba(255,255,245,.7)'); fr(c, -4, y, 4, y + 0.02, 'rgba(90,70,40,.4)'); } sideLight(c, -hw - 0.45, 0, hw + 0.45, yS, { left: 'rgba(255,255,240,.1)', right: 'rgba(60,40,10,.2)' }); } },
    { // Cellawand mit Nischen
      shapes: [wall], fill: '#d9c9a0',
      deco(c) {
        plaster(c, -hw, yS, hw, yC, '#e0d0a6', { seed: 3, n: 14, alpha: 0.1 });
        fillGrad(c, wall, 0, yC, 0, yS, [[0, 'rgba(60,40,20,.35)'], [1, 'rgba(0,0,0,.15)']]);
        // Rollen-Nischen zwischen den Säulen: 3 Reihen
        for (let i = 0; i < 5; i++) {
          const x = -2.0 + i * 1.0;
          fr(c, x - 0.33, 0.8, x + 0.33, 2.55, '#5a3e2a'); fr(c, x - 0.33, 0.8, x + 0.33, 2.55, 'rgba(0,0,0,.2)');
          for (const y of [0.9, 1.45, 2.0]) {
            fr(c, x - 0.33, y + 0.45, x + 0.33, y + 0.5, '#8a6038');
            for (let k = 0; k < 4; k++) { const rx = x - 0.26 + k * 0.17; fillPoly(c, blob(rx, y + 0.22, 0.07, 0.07, 0, 10), mix('#f2e4b8', k % 2 ? '#c9b07a' : '#fff4d6', 0.3)); fillPoly(c, blob(rx, y + 0.22, 0.03, 0.03, 0, 8), '#8a6a3a'); fr(c, rx - 0.07, y + 0.0, rx + 0.07, y + 0.22, '#eadbab'); fillPoly(c, blob(rx, y + 0.22, 0.07, 0.04, 0, 10), '#f7ecc4'); }
          }
        }
        // Tür in der Mitte? (zwischen den Säulen 3/4: Mitte x=0 liegt zwischen Säulen -0.5 und 0.5) → Tür statt Nische
        fr(c, -0.33, 0.8, 0.33, 2.55, '#2a1c14'); fr(c, -0.33, 0.45, 0.33, 2.55, '#2a1c14'); strokePoly(c, rect(-0.33, yS, 0.33, 2.2), '#c9b07a', 0.04); fr(c, -0.36, 2.2, 0.36, 2.3, '#c9b07a');
      },
    },
    { // Säulen (Marmor, kanneliert)
      shapes: cols.flatMap(colShape), fill: '#f3ecd8',
      deco(c) {
        for (const x of cols) {
          fr(c, x - 0.3, yS, x + 0.3, yC, '#f3ecd8');
          for (let k = -4; k <= 4; k++) line(c, [[x + k * 0.05, yS + 0.15], [x + k * 0.044, yC - 0.25]], 'rgba(110,100,80,.35)', 0.008);
          fillGrad(c, rect(x - 0.3, yS, x + 0.3, yC), x - 0.25, 0, x + 0.25, 0, [[0, 'rgba(255,255,255,.4)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(60,50,40,.42)']]);
          // Kapitell: Voluten
          for (const s of [-1, 1]) { const vx = x + s * 0.3, vy = yC - 0.14; fillPoly(c, blob(vx, vy, 0.12, 0.12, 0, 16), '#f6efdc'); const pts = []; for (let a = 0; a < 9; a += 0.4) pts.push([vx + Math.cos(a * s * 1.0) * (0.1 - a * 0.009), vy + Math.sin(a) * (0.1 - a * 0.009)]); line(c, pts, 'rgba(90,70,40,.7)', 0.012); }
          fr(c, x - 0.34, yC - 0.2, x + 0.34, yC - 0.1, C.lapis); fr(c, x - 0.4, yC - 0.1, x + 0.4, yC, '#e8dec0'); fr(c, x - 0.4, yC - 0.03, x + 0.4, yC, 'rgba(60,40,10,.3)');
          fr(c, x - 0.3, yS, x + 0.3, yS + 0.1, '#e8dec0');
        }
      },
    },
    { // Gebälk mit Mäander
      shapes: [entab], fill: '#efe7d2',
      deco(c) {
        fr(c, -hw - 0.15, yC, hw + 0.15, yE, '#f1e9d4');
        fr(c, -hw - 0.15, yC, hw + 0.15, yC + 0.18, '#e6dcc0'); fr(c, -hw - 0.15, yC + 0.18, hw + 0.15, yC + 0.2, 'rgba(90,70,40,.4)');
        fr(c, -hw - 0.15, yC + 0.2, hw + 0.15, yE - 0.14, '#f6efdc');
        // Mäanderband
        for (let x = -hw; x < hw - 0.05; x += 0.28) { line(c, [[x, yC + 0.26], [x, yE - 0.22], [x + 0.2, yE - 0.22], [x + 0.2, yC + 0.34], [x + 0.1, yC + 0.34], [x + 0.1, yE - 0.3]], C.carn, 0.026); }
        fr(c, -hw - 0.15, yE - 0.14, hw + 0.15, yE, '#e0d4b4'); fr(c, -hw - 0.15, yE - 0.04, hw + 0.15, yE, 'rgba(255,255,245,.7)');
        fr(c, -hw - 0.15, yC, hw + 0.15, yC + 0.02, 'rgba(60,40,10,.4)');
      },
    },
    { // Giebel
      shapes: [ped, ...acro], fill: '#efe7d2',
      deco(c) {
        fillPoly(c, [[-hw - 0.3, yE], [hw + 0.3, yE], [0, yP]], '#efe7d2');
        const inner = [[-hw + 0.25, yE + 0.14], [hw - 0.25, yE + 0.14], [0, yP - 0.38]];
        fillPoly(c, inner, C.lapisDk); fillGrad(c, inner, 0, yP, 0, yE, [[0, 'rgba(255,255,255,.12)'], [1, 'rgba(0,0,30,.25)']]);
        for (let i = 0; i < 9; i++) { const x = -1.5 + i * 0.375, yy = yE + 0.3 + ((i * 5) % 3) * 0.2; if (yy < yP - 0.7 + (Math.abs(x) < 0.4 ? -0.1 : 0.0) - Math.abs(x) * 0.3) star5(c, x, yy, 0.07, C.gold); }
        // goldene Sonne mit Flügeln in der Mitte
        fillPoly(c, blob(0, yE + 0.55, 0.2, 0.2, 0, 20), C.gold); fillPoly(c, blob(0, yE + 0.55, 0.13, 0.13, 0, 16), C.carn);
        for (const s of [-1, 1]) for (let k = 0; k < 4; k++) fillPoly(c, [[s * (0.22 + k * 0.11), yE + 0.52], [s * (0.34 + k * 0.11), yE + 0.55], [s * (0.31 + k * 0.11), yE + 0.43], [s * (0.22 + k * 0.11), yE + 0.43]], k % 2 ? C.turq : C.gold);
        line(c, [[-hw - 0.3, yE + 0.02], [hw + 0.3, yE + 0.02]], 'rgba(90,70,40,.5)', 0.02);
        strokePoly(c, inner, '#c9a860', 0.04);
        for (const [x, y] of [[0, yP + 0.14]]) { fillPoly(c, blob(x, y, 0.14, 0.22, 0, 14), C.gold); }
        for (const s of [-1, 1]) fillPoly(c, [[s * (hw + 0.2), yE], [s * (hw - 0.05), yE], [s * (hw + 0.08), yE + 0.34]], C.gold);
        fillGrad(c, [[-hw - 0.3, yE], [hw + 0.3, yE], [0, yP]], -hw, 0, hw, 0, [[0, 'rgba(255,255,245,.2)'], [1, 'rgba(60,40,10,.2)']]);
      },
    },
  ];
  return mk('bibliothek_alexandria', 'Bibliothek von Alexandria', { body: { z: 1, layers } },
    { base: [0, 0], eingang: [0, yS], top: { rel: [0.5, 1] } }, { kind: 'building', heightM: 5, note: 'Säulenhalle mit Giebel; Nischen mit Papyrusrollen' }, { h: o.h ?? 5, floor: 0 });
}
