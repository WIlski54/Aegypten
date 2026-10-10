// Gruppe O1 – Vergoldeter Schrein (frontal) mit Doppeltür: Parts `body`, `doorA` (linker Flügel, Pivot an der linken Angel),
// `doorB` (rechter Flügel, Pivot an der rechten Angel). Hohlkehlengesims mit geflügelter Sonnenscheibe, Djed-/Was-/Anch-Zierde.
// Gebaut in cm, skaliert via finish() auf 3 m Höhe.
import {
  K, spec, blob, limb, poly, rect, rrect, stroke2poly, sym, shade, mix, fillPoly,
  gold, inlay, flat, goldFill, bevel, gloss, volume, seg, ln, dotAt, ellipseAt, bands, uraeusFront, glyph, TAU,
} from './_eg_royal_kit.js';

const DOOR_X = 56, DOOR_Y0 = 18, DOOR_Y1 = 236;

// Zierleiste: Feldreihe aus Glyphen
function glyphColumn(c, x, y0, y1, names, s, col, w) {
  const n = Math.max(1, Math.floor((y1 - y0) / (s * 1.25)));
  for (let i = 0; i < n; i++) glyph(c, names[i % names.length], x, y0 + ((y1 - y0 - s) * i) / Math.max(1, n - 1), s, col, w);
}

// geflügelte Sonnenscheibe (Behedeti) im Gesims
function wingedSun(cx, cy) {
  const layers = [];
  const beamY = cy + 9;
  const rows = [[], [], []];
  const lens = [24, 18, 12];
  for (const sg of [-1, 1]) {
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 11; i++) {
        const t = i / 10;
        const x = cx + sg * (17 + t * 66 + (r % 2 ? 2.6 : 0)), by = beamY + t * 3.5;
        const len = lens[r] * (1 - 0.32 * t), w = 6.6 - t * 0.9;
        rows[r].push(blob(x, by - len / 2, w / 2, len / 2, sg * (0.05 + t * 0.12), 12));
      }
    }
  }
  const beam = [stroke2poly([[cx - 86, beamY + 4.2], [cx - 50, beamY + 2.2], [cx - 14, beamY]], 4.4), stroke2poly([[cx + 86, beamY + 4.2], [cx + 50, beamY + 2.2], [cx + 14, beamY]], 4.4)];
  layers.push(inlay(rows[0], K.lapis, { bevel: true, volume: false }));
  layers.push(inlay(rows[1], K.carn, { bevel: true, volume: false }));
  layers.push(inlay(rows[2], K.turq, { bevel: true, volume: false }));
  layers.push(gold(beam, { dir: 'v', gloss: false }));
  layers.push(gold([blob(cx, cy + 1, 14.4, 14.4, 0, 32)], { dir: 'v', gloss: false, stroke: 'rgba(100,60,8,.9)' }));
  layers.push({
    shapes: [blob(cx, cy + 1, 11, 11, 0, 32)], fill: { stops: [[0, K.carnHi], [0.6, K.carn], [1, K.carnLo]], dir: 'v' }, stroke: 'rgba(100,60,8,.9)',
    deco(c, bb) { gloss(c, bb, { ang: 0.9, pos: 0.3, w: 0.15, a: 0.5 }); dotAt(c, cx - 3, cy + 4.5, 2.2, 'rgba(255,220,200,.6)'); },
  });
  layers.push(uraeusFront(cx - 19, cy - 14, 24), uraeusFront(cx + 19, cy - 14, 24));
  return layers;
}

function leafField(x0, x1, y0, y1, n, cols) {
  const groups = cols.map(() => []);
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) groups[i % cols.length].push(rect(x0 + i * w + w * 0.12, y0, x0 + (i + 1) * w - w * 0.12, y1));
  return cols.map((cl, i) => inlay(groups[i], cl, { bevel: false, volume: false, stroke: 'rgba(40,25,5,.5)' }));
}

function doorLeaf(sg) {
  // Flügel: Innenkante bei x=sg*0.6, Angel außen bei x = sg*DOOR_X
  const xa = sg * (DOOR_X + 0.4), xb = sg * 0.5;
  const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
  const frame = rect(x0, DOOR_Y0, x1, DOOR_Y1);
  const cx = (x0 + x1) / 2;
  const fW = x1 - x0;
  const layers = [];
  layers.push(gold([frame], { dir: 'h', deco(c) {
    // drei Felder mit Lapis-Rahmen
    for (let i = 0; i < 3; i++) {
      const fy0 = DOOR_Y0 + 8 + i * 70, fy1 = fy0 + 62;
      const fx0 = x0 + 6, fx1 = x1 - 6;
      c.ctx.save();
      const outer = [[fx0, fy0], [fx1, fy0], [fx1, fy1], [fx0, fy1]];
      fillPoly(c, outer, K.lapis);
      fillPoly(c, [[fx0 + 2.6, fy0 + 2.6], [fx1 - 2.6, fy0 + 2.6], [fx1 - 2.6, fy1 - 2.6], [fx0 + 2.6, fy1 - 2.6]], '#e8bc48');
      c.ctx.restore();
      const names = [['djed', 'was'], ['ankh', 'djed'], ['was', 'ankh']][i];
      glyph(c, names[0], cx - fW * 0.17, fy0 + 12, 38, K.carnLo, 2.2);
      glyph(c, names[1], cx + fW * 0.17, fy0 + 12, 38, K.lapisLo, 2.2);
      for (let k = 0; k < 6; k++) dotAt(c, fx0 + 6 + k * ((fx1 - fx0 - 12) / 5), fy0 + 1.3, 0.9, K.goldHi);
    }
  } }));
  // Randeinlage an der Angelseite
  layers.push(inlay([rect(Math.min(sg * DOOR_X, sg * (DOOR_X - 3.4)), DOOR_Y0, Math.max(sg * DOOR_X, sg * (DOOR_X - 3.4)), DOOR_Y1)], K.turq, { bevel: true }));
  // Riegel in der Mitte
  const bx = sg * 6.6;
  layers.push(gold([blob(bx, 128, 4.2, 4.2, 0, 16), rect(sg * 1.5 - 2.2, 126.4, sg * 1.5 + 2.2, 129.6), rect(bx - 1, 112, bx + 1, 144)], { dir: 'v', gloss: false }));
  return { shapes: frame, layers, hinge: [sg * DOOR_X, 127] };
}

export function schrein_gold(opts = {}) {
  const body = [];
  // Sockel (Kufen)
  body.push(gold([poly(rrect(-116, 0, 116, 18, 5, 4), 0)], { dir: 'v', deco(c) { for (let i = 0; i < 13; i++) dotAt(c, -104 + i * 17.3, 9, 1.8, i % 2 ? K.lapis : K.carn); } }));
  // Korpus
  body.push(gold([rect(-94, 16, 94, 250)], { dir: 'h', gloss: true, ga: 0.35, deco(c) {
    for (const sg of [-1, 1]) {
      glyphColumn(c, sg * 77, 30, 232, ['djed', 'was', 'ankh'], 24, i2c(sg), 1.7);
      glyphColumn(c, sg * 64.5, 30, 232, ['was', 'ankh', 'djed'], 24, K.lapisLo, 1.5);
    }
  } }));
  // Randband aus Lapis an der Außenkante
  body.push(inlay([rect(-94, 16, -90, 250), rect(90, 16, 94, 250)], K.lapis, { bevel: true }));
  // Türöffnung (dunkler Innenraum) + Innenschrein
  body.push({
    shapes: [rect(-DOOR_X, DOOR_Y0, DOOR_X, DOOR_Y1)], fill: { stops: [[0, '#40301a'], [0.5, '#16100a'], [1, '#0b0805']], dir: 'v' }, stroke: 'rgba(0,0,0,.6)',
    deco(c) {
      fillPoly(c, [[-38, 40], [38, 40], [38, 206], [-38, 206]], '#3a2a12');
      fillPoly(c, [[-35, 43], [35, 43], [35, 203], [-35, 203]], '#5a4219');
      for (let i = 0; i < 4; i++) glyph(c, ['djed', 'was'][i % 2], -20 + (i % 2) * 40, 60 + Math.floor(i / 2) * 70, 38, '#b88a2a', 2);
      // glitzernde Punkte
      for (let i = 0; i < 28; i++) dotAt(c, -52 + ((i * 37) % 104), 22 + ((i * 53) % 210), 0.8, 'rgba(255,230,150,.25)');
    },
  });
  // Türrahmen (Gold) mit Sturz
  body.push(gold([rect(-DOOR_X - 6, DOOR_Y0, -DOOR_X, DOOR_Y1 + 10), rect(DOOR_X, DOOR_Y0, DOOR_X + 6, DOOR_Y1 + 10), rect(-DOOR_X - 6, DOOR_Y1, DOOR_X + 6, DOOR_Y1 + 12)], { dir: 'h', gloss: false }));
  // Gesims
  body.push(gold([poly(rrect(-100, 246, 100, 258, 5, 4), 0)], { dir: 'v', deco(c) { for (let i = -48; i < 48; i++) seg(c, [i * 2.1, 247], [i * 2.1 + 1.6, 257], 'rgba(120,70,8,.55)', 0.45); } }));
  const cavetto = poly([[-98, 257], [-100, 270], [-106, 283], [-114, 296], [114, 296], [106, 283], [100, 270], [98, 257]], 1);
  body.push(gold([cavetto], { dir: 'v', gloss: false, deco(c) {
    for (let i = -22; i <= 22; i++) seg(c, [i * 4.7, 258], [i * 4.9, 296], 'rgba(130,80,8,.3)', 0.5);
  } }));
  // Rohrstab-/Hohlkehlen-Bekrönung: Reihe aufrechter Schilfblätter (Kheker)
  const kh = [[], [], []];
  for (let i = 0; i < 40; i++) kh[i % 3].push(poly([[-113 + i * 5.7, 294], [-113 + i * 5.7 + 4.6, 294], [-113 + i * 5.7 + 4.6, 303], [-113 + i * 5.7 + 2.3, 307], [-113 + i * 5.7, 303]], 1));
  body.push(inlay(kh[0], K.lapis, { bevel: true, volume: false }), inlay(kh[1], K.carn, { bevel: true, volume: false }), inlay(kh[2], K.turq, { bevel: true, volume: false }));
  body.push(gold([rect(-116, 292, 116, 296)], { dir: 'v', gloss: false }));
  body.push(...wingedSun(0, 272));
  const dA = doorLeaf(-1), dB = doorLeaf(1);
  const parts = {
    body: { z: 1, layers: body },
    doorA: { z: 2, pivot: dA.hinge, layers: dA.layers },
    doorB: { z: 2, pivot: dB.hinge, layers: dB.layers },
  };
  return spec('schrein_gold', 'Vergoldeter Schrein', parts, { front: [0, 127], hingeA: dA.hinge, hingeB: dB.hinge, inside: [0, 125] },
    { heightM: 3.0, ranges: { doorA: [0, 1.4], doorB: [0, -1.4] }, desc: 'Schrein aus vergoldetem Holz mit Doppeltür; Türflügel öffnen um die Y-Achse (Angel an der Außenkante)' }, { h: opts.h || 3.0 });
}
function i2c(sg) { return sg < 0 ? K.carnLo : K.lapisLo; }
