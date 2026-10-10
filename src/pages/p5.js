// Station 5: Mumienwerkstatt (Chemie-Schwerpunkt). Links Regal, Kanopen und Textkarte, rechts die Werkstatt mit Bahre, Licht und Natron.
// Laschen: TAGE (0 bis 70 Tage, Phasen, Wasserbalken), NATRON (Salz aufstreuen), KANOPEN (vier Deckel nacheinander).
// Der Körper wird nie gezeigt: nur die bedeckte Bahre. Keine Organe, kein Horror.
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { printLabel, SERIF, INK, blotches, speckles, pebbles } from '../engine/pagepaint.js';
import { PAGES_DE } from '../data/pages.de.js';
import { lerp, clamp, smooth, TAU, mulberry32 } from '../engine/util.js';
import { cracks, leftCard } from './common.js';
import { C, rect, fr, bricks, plaster, woodGrain, logEnds, vignette, stripeBand, blocks, jar, glyph } from '../art/props/_eg_arch_kit.js';
import { fillPoly, strokePoly, blob, curve, mix } from '../art/props/_e_kit.js';
import { DAYS, PHASES, phaseIndex, moisture, canvasPlane, drawStrip, drawTag, drawNote, STRIP_W, STRIP_H } from './_eg_p5_ui.js';

const IDX = 5;
const SK = ['#2a5aa0', '#2f9c93', '#a8362a', '#3f8f5a'];

// ---------------------------------------------------------------------------------------------------- Teile (Papier-Flats)
// Text in Teil-Koordinaten malen
function txt(c, str, x, y, size, { col = INK, bold = false, italic = false, align = 'center' } = {}) {
  const { ctx, tf, S } = c; const [X, Y] = tf(x, y);
  ctx.save(); ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size * S}px ${SERIF}`; ctx.fillText(str, X, Y); ctx.restore();
}

// Lehmwand der linken Seite (passend zur Wand der rechten Seite)
function wallLeftPart(W) {
  const x0 = -W / 2, x1 = W / 2;
  const body = rect(x0, 0, x1, 4.52), roof = rect(x0, 4.5, x1, 4.8);
  return {
    layers: [
      {
        shapes: [body], fill: C.mud,
        deco(c) {
          plaster(c, x0, 0, x1, 4.6, '#c68e5c', { seed: 31, alpha: 0.16, n: 170 });
          bricks(c, x0, 0, x0 + 0.45, 4.6, { bw: 0.3, bh: 0.15, base: '#b9824f', seed: 41, vary: 0.2 });
          bricks(c, x1 - 0.45, 0, x1, 4.6, { bw: 0.3, bh: 0.15, base: '#b9824f', seed: 42, vary: 0.2 });
          fr(c, x0 + 0.45, 0, x1 - 0.45, 0.5, C.carn); fr(c, x0 + 0.45, 0.5, x1 - 0.45, 0.54, C.black); fr(c, x0 + 0.45, 0.54, x1 - 0.45, 0.58, '#f3e9cc');
          for (let x = x0 + 0.7; x < x1 - 0.5; x += 0.55) fr(c, x, 0.12, x + 0.13, 0.4, 'rgba(255,225,170,.13)');
          const r = mulberry32(77);
          for (let i = 0; i < 12; i++) { const x = x0 + 0.7 + r() * (W - 1.4), y = 0.8 + r() * 3.4; bricks(c, x, y, x + 0.45 + r() * 0.3, y + 0.3, { bw: 0.15, bh: 0.075, base: '#b07844', seed: 60 + i, vary: 0.2, gap: 0.01 }); }
          // warmes Licht von rechts (von der Öffnung her)
          const { ctx, tf } = c; const [ax, ay] = tf(x1, 3); const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, 4.5 * c.S); g.addColorStop(0, 'rgba(255,225,150,.22)'); g.addColorStop(1, 'rgba(255,225,150,0)');
          ctx.fillStyle = g; ctx.fillRect(0, 0, c.W, c.H);
          vignette(c, x0, 0, x1, 4.5, { a: 0.16, k: 0.1 });
        },
      },
      {
        shapes: [roof], fill: '#a87442',
        deco(c) { fr(c, x0, 4.5, x1, 4.8, '#9c6a3c'); fr(c, x0, 4.73, x1, 4.8, '#c99a62'); logEnds(c, x0 + 0.04, x1 - 0.04, 4.62, 0.1, { gap: 0.05, seed: 78 }); fr(c, x0, 4.5, x1, 4.53, 'rgba(30,10,0,.4)'); },
      },
    ],
  };
}

// Holzregal mit vier Brettern; gemalte Krüge im Hintergrund, die echten Krüge stehen davor
const REGAL = { W: 3.4, H: 3.55, ys: [0.5, 1.4, 2.3, 3.2] };
function regalPart() {
  const { W, H, ys } = REGAL, x0 = -W / 2, x1 = W / 2;
  const back = rect(x0 + 0.1, 0.1, x1 - 0.1, H - 0.1);
  const frame = [rect(x0, 0, x0 + 0.14, H), rect(x1 - 0.14, 0, x1, H), rect(x0 - 0.05, H - 0.14, x1 + 0.05, H), ...ys.map((y) => rect(x0 - 0.05, y - 0.08, x1 + 0.05, y + 0.02))];
  return {
    layers: [
      {
        shapes: [back], fill: '#5a3820',
        deco(c) {
          fr(c, x0, 0, x1, H, '#4e301a');
          const cols = ['#c9783c', '#e0c088', '#2a2220', '#2a5aa0', '#c0432e', '#efe3c4', '#3bb3a8', '#a9693a'], kinds = ['rund', 'hoch', 'amphore', 'napf', 'flasche'];
          const r = mulberry32(19);
          // gemalte Krüge in den Lücken (die vordere Mitte bleibt für die echten Krüge frei)
          for (const [yi, xs] of [[0, [-1.25, -0.5, 0.25, 1.0]], [1, [-1.25, 1.25]], [2, [-1.25, 1.3]], [3, [-1.15, -0.4, 0.4, 1.15]]]) {
            for (const x of xs) { const h = 0.46 + r() * 0.22; jar(c, x, ys[yi] + 0.02, h, kinds[Math.floor(r() * 5)], cols[Math.floor(r() * cols.length)], { band: r() < 0.5 ? '#e0b040' : '#2a5aa0' }); }
          }
          const { ctx } = c;
          for (const y of ys) { const [a, b] = c.tf(x0, y + 0.02), [d, e] = c.tf(x1, y - 0.6); const g = ctx.createLinearGradient(0, b, 0, e); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,3,0,.28)'); ctx.fillStyle = g; ctx.fillRect(a, b, d - a, e - b); }
        },
      },
      {
        shapes: frame, fill: '#7a4a2a',
        deco(c) {
          woodGrain(c, x0, 0, x0 + 0.14, H, '#7f4e2c', { seed: 3, dir: 'v', n: 6 }); woodGrain(c, x1 - 0.14, 0, x1, H, '#7f4e2c', { seed: 4, dir: 'v', n: 6 });
          fr(c, x0 - 0.05, H - 0.14, x1 + 0.05, H, '#8d5c34');
          for (const y of ys) { woodGrain(c, x0 - 0.05, y - 0.08, x1 + 0.05, y + 0.02, '#b07c48', { seed: 8 + y * 3, n: 5 }); fr(c, x0 - 0.05, y - 0.01, x1 + 0.05, y + 0.02, 'rgba(255,235,190,.4)'); fr(c, x0 - 0.05, y - 0.08, x1 + 0.05, y - 0.055, 'rgba(40,15,0,.45)'); }
          fr(c, x0 + 0.1, 0, x0 + 0.14, H, 'rgba(0,0,0,.25)'); fr(c, x0, 0, x0 + 0.02, H, 'rgba(255,230,170,.3)');
        },
      },
    ],
  };
}

// Sockel der Kanopen (Kalkstein, Farbband)
function sockelPart(W, H) {
  const x0 = -W / 2, x1 = W / 2;
  return {
    layers: [{
      shapes: [rect(x0, 0, x1, H - 0.1), rect(x0 - 0.08, H - 0.1, x1 + 0.08, H)], fill: C.sand,
      deco(c) {
        blocks(c, x0, 0, x1, H - 0.1, { ch: 0.2, bw: 0.62, base: '#e3cb94', seed: 5, joint: 'rgba(110,80,40,.5)' });
        fr(c, x0 + 0.1, 0.16, x1 - 0.1, 0.3, C.linen);
        stripeBand(c, x0 + 0.1, x1 - 0.1, 0.17, 0.29, [C.carn, C.lapis, C.nile, C.gold], { step: 0.14 });
        fr(c, x0 - 0.08, H - 0.1, x1 + 0.08, H, '#efd9a2'); fr(c, x0 - 0.08, H - 0.1, x1 + 0.08, H - 0.085, 'rgba(60,30,5,.35)'); fr(c, x0 - 0.08, H - 0.025, x1 + 0.08, H, 'rgba(255,250,220,.5)');
        vignette(c, x0, 0, x1, H, { a: 0.14, k: 0.1 });
      },
    }],
  };
}

// niedriger Tisch für die Amulette
function tischPart(W, H) {
  const x0 = -W / 2, x1 = W / 2;
  const top = rect(x0 - 0.05, H - 0.12, x1 + 0.05, H), apron = rect(x0 + 0.06, H - 0.3, x1 - 0.06, H - 0.12);
  const legs = [rect(x0 + 0.08, 0, x0 + 0.24, H - 0.3), rect(x1 - 0.24, 0, x1 - 0.08, H - 0.3), rect(x0 + 0.04, 0, x0 + 0.3, 0.08), rect(x1 - 0.3, 0, x1 - 0.04, 0.08)];
  return {
    layers: [{
      shapes: [top, apron, ...legs], fill: '#8a5a32',
      deco(c) {
        woodGrain(c, x0 - 0.05, H - 0.12, x1 + 0.05, H, '#b07c48', { seed: 5, n: 6 });
        fr(c, x0 - 0.05, H - 0.12, x1 + 0.05, H - 0.095, 'rgba(40,15,0,.4)'); fr(c, x0 - 0.05, H - 0.02, x1 + 0.05, H, 'rgba(255,235,190,.45)');
        fr(c, x0 + 0.06, H - 0.3, x1 - 0.06, H - 0.12, '#7a4a2a');
        stripeBand(c, x0 + 0.1, x1 - 0.1, H - 0.27, H - 0.16, [C.lapis, C.gold, C.carn, C.turq], { step: 0.1 });
        for (const lx of [[x0 + 0.08, x0 + 0.24], [x1 - 0.24, x1 - 0.08]]) woodGrain(c, lx[0], 0, lx[1], H - 0.3, '#8a5a32', { seed: 6, dir: 'v', n: 4 });
      },
    }],
  };
}

// Wandbild "Mumifizieren": vier Schritte als einfache Bildzeichen
function muralPart(W, H) {
  const x0 = -W / 2, x1 = W / 2;
  return {
    layers: [{
      shapes: [rect(x0, 0, x1, H)], fill: '#f1e2b8',
      deco(c) {
        fr(c, x0, 0, x1, H, '#f1e2b8'); plaster(c, x0, 0, x1, H, '#efdcae', { seed: 12, n: 40, alpha: 0.08 });
        fr(c, x0 + 0.07, 0.07, x1 - 0.07, H - 0.07, C.carn); fr(c, x0 + 0.12, 0.12, x1 - 0.12, H - 0.12, '#f6ebc6');
        fr(c, x0 + 0.17, 0.17, x1 - 0.17, H - 0.17, '#f1e2b8');
        txt(c, 'Mumifizieren', 0, H - 0.4, 0.34, { bold: true, col: '#7a1a1a' });
        txt(c, 'etwa 70 Tage', 0, H - 0.74, 0.22, { italic: true, col: '#5a3d22' });
        const cx = [-1.85, -0.62, 0.62, 1.85], cy = 0.72, lab = ['Reinigen', 'Trocknen', 'Salben', 'Wickeln'], R = 0.42;
        cx.forEach((x, i) => {
          fillPoly(c, blob(x, cy, R, R, 0, 28), '#fbf3d9'); strokePoly(c, blob(x, cy, R, R, 0, 28), 'rgba(122,26,26,.6)', 0.022);
          txt(c, lab[i], x, 0.2, 0.2, { bold: true, col: '#4a3220' });
          if (i < 3) { const ax = x + 0.62; fillPoly(c, [[ax - 0.05, cy + 0.07], [ax + 0.06, cy + 0.07], [ax + 0.06, cy + 0.14], [ax + 0.17, cy], [ax + 0.06, cy - 0.14], [ax + 0.06, cy - 0.07], [ax - 0.05, cy - 0.07]], '#7a1a1a', 0.75); }
        });
        // 1 Reinigen: Wellen und Tropfen
        glyph(c, 'wasser', cx[0], cy - 0.26, 0.5, '#2f7fb0', 0.035);
        for (const [dx, dy] of [[-0.18, 0.26], [0.02, 0.3], [0.2, 0.24]]) fillPoly(c, [[cx[0] + dx, cy + dy + 0.1], [cx[0] + dx - 0.045, cy + dy], [cx[0] + dx + 0.045, cy + dy]], '#5fb5e0');
        // 2 Trocknen: Salzwürfel
        for (const [dx, dy, s] of [[-0.14, -0.12, 0.17], [0.1, -0.1, 0.15], [-0.02, 0.07, 0.17], [0.19, 0.09, 0.12], [-0.2, 0.12, 0.12]]) { const q = [[cx[1] + dx - s / 2, cy + dy - s / 2], [cx[1] + dx + s / 2, cy + dy - s / 2], [cx[1] + dx + s / 2, cy + dy + s / 2], [cx[1] + dx - s / 2, cy + dy + s / 2]]; fillPoly(c, q, '#ffffff'); strokePoly(c, q, 'rgba(100,130,170,.7)', 0.014); }
        // 3 Salben: Krug mit Öl
        jar(c, cx[2], cy - 0.3, 0.56, 'rund', '#c9783c', { band: '#2a5aa0' });
        // 4 Wickeln: Leinenrolle
        fillPoly(c, blob(cx[3], cy, 0.24, 0.3, 0, 24), '#f6efe0'); strokePoly(c, blob(cx[3], cy, 0.24, 0.3, 0, 24), '#bfb08e', 0.016);
        for (let k = -2; k <= 2; k++) curve(c, [[cx[3] - 0.22, cy + k * 0.1], [cx[3], cy + k * 0.1 - 0.05], [cx[3] + 0.22, cy + k * 0.1]], '#cfc1a0', 0.012);
        fillPoly(c, [[cx[3] + 0.14, cy - 0.24], [cx[3] + 0.38, cy - 0.32], [cx[3] + 0.4, cy - 0.22], [cx[3] + 0.18, cy - 0.14]], '#f6efe0');
      },
    }],
  };
}

// Schild "Versuch: Apfel mumifizieren" (für den Unterricht)
function signPart() {
  return {
    layers: [{
      shapes: [rect(-0.07, 0, 0.07, 0.8), rect(-0.85, 0.55, 0.85, 1.6)], fill: '#8a5a32',
      deco(c) {
        woodGrain(c, -0.85, 0.55, 0.85, 1.6, '#b07c48', { seed: 9, n: 10 });
        fr(c, -0.79, 0.61, 0.79, 1.54, '#f1e2b8'); fr(c, -0.79, 0.61, 0.79, 0.64, 'rgba(60,30,5,.2)');
        txt(c, 'Versuch', 0, 1.4, 0.3, { bold: true, col: '#7a1a1a' });
        txt(c, 'Apfel mumifizieren', 0, 1.19, 0.15, { italic: true, col: '#4a3220' });
        // zwei Apfelstücke: eins mit Salz (weiße Kruste), eins ohne
        for (const [x, salt] of [[-0.35, true], [0.35, false]]) {
          fillPoly(c, blob(x, 0.93, 0.21, 0.2, 0, 20), '#f5e9b8'); strokePoly(c, blob(x, 0.93, 0.21, 0.2, 0, 20), '#b5483a', 0.04);
          if (salt) for (const [dx, dy] of [[-0.09, 0.07], [0.07, 0.04], [0, -0.08], [0.1, -0.09], [-0.11, -0.04], [0.0, 0.1]]) fillPoly(c, [[x + dx - 0.03, dy + 0.93 - 0.03], [x + dx + 0.03, dy + 0.93 - 0.03], [x + dx + 0.03, dy + 0.93 + 0.03], [x + dx - 0.03, dy + 0.93 + 0.03]], '#ffffff');
          fillPoly(c, [[x - 0.012, 1.11], [x + 0.012, 1.11], [x + 0.035, 1.19], [x + 0.0, 1.19]], '#4a7a2e');
          txt(c, salt ? 'mit Salz' : 'ohne Salz', x, 0.7, 0.13, { col: '#4a3220', bold: true });
        }
      },
    }],
  };
}

// ---------------------------------------------------------------------------------------------------- Seite
export default {
  id: 'mumie',
  mood: mood({ key: '#ffdcae', keyI: 2.35, sky: '#ffe6c4', gnd: '#8a5a3a', hemiI: 1.8, pos: [-12, 20, 9] }),
  motes: { colors: [[1, 0.9, 0.62], [1, 0.82, 0.5], [1, 0.95, 0.8]], size: 0.05, alpha: 0.42, dy: 0.03, dx: 0.04, tw: 1.3, density: 0.7 },
  atmo: 'mumie',
  base() {
    return {
      L: {
        paper: '#f1e4c6', ground: { back: '#dcbd8e', front: '#c8a06c' }, margin: 0.34, pageNo: 2 * IDX + 1, seed: 51,
        draw(ctx, m) {
          blotches(m, { x0: -12, x1: 0, z0: -4.4, z1: 4.4, n: 14, rmin: 1, rmax: 2.2, colors: ['rgba(255,236,190,.16)'], seed: 6 });
          cracks(m, { x0: -11.6, x1: -0.4, z0: -1.0, z1: 4.0, n: 46, seed: 7, color: 'rgba(110,70,30,.2)' });
          pebbles(m, { x0: -11, x1: -0.8, z0: -0.2, z1: 3.6, n: 7, seed: 12 });
          leftCard(null, IDX)(ctx, m);
        },
      },
      R: {
        paper: '#f1e4c6', ground: { back: '#dcbd8e', front: '#c8a06c' }, margin: 0.34, pageNo: 2 * IDX + 2, seed: 52,
        draw(ctx, m) {
          blotches(m, { x0: 0, x1: 12, z0: -4.4, z1: 4.4, n: 14, rmin: 1, rmax: 2.2, colors: ['rgba(255,236,190,.16)'], seed: 9 });
          cracks(m, { x0: 0.6, x1: 11.4, z0: -0.8, z1: 4.0, n: 60, seed: 13, color: 'rgba(110,70,30,.22)' });
          // Lichtfleck auf dem Boden (die Öffnung wirft Licht in die Werkstatt)
          const g = ctx.createRadialGradient(m.x(6.9), m.z(-0.5), 0, m.x(6.9), m.z(-0.5), 3.2 * m.S); g.addColorStop(0, 'rgba(255,238,170,.5)'); g.addColorStop(1, 'rgba(255,238,170,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(m.x(6.9), m.z(-0.5), 3.4 * m.S, 2.4 * m.S, 0, 0, TAU); ctx.fill();
          // Binsenmatte unter der Bahre
          ctx.save(); const x0 = 4.8, x1 = 8.9, z0 = -1.9, z1 = 0.55;
          ctx.fillStyle = '#c9a863'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(m.x(x0), m.z(z0), (x1 - x0) * m.S, (z1 - z0) * m.S, 0.1 * m.S) : ctx.rect(m.x(x0), m.z(z0), (x1 - x0) * m.S, (z1 - z0) * m.S); ctx.fill();
          ctx.strokeStyle = 'rgba(110,75,30,.35)'; ctx.lineWidth = Math.max(1, 0.018 * m.S);
          for (let x = x0 + 0.12; x < x1; x += 0.16) { ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z0)); ctx.lineTo(m.x(x), m.z(z1)); ctx.stroke(); }
          ctx.strokeStyle = 'rgba(255,240,190,.3)'; for (let z = z0 + 0.1; z < z1; z += 0.2) { ctx.beginPath(); ctx.moveTo(m.x(x0), m.z(z)); ctx.lineTo(m.x(x1), m.z(z)); ctx.stroke(); }
          ctx.strokeStyle = '#8f6a2c'; ctx.lineWidth = 0.05 * m.S; ctx.strokeRect(m.x(x0), m.z(z0), (x1 - x0) * m.S, (z1 - z0) * m.S);
          ctx.restore();
          // verstreute Salzkörner um den Haufen
          speckles(m, { x0: 8.3, x1: 10.8, z0: -0.5, z1: 1.2, n: 80, color: 'rgba(255,255,255,.75)', size: 0.028, seed: 3 });
          pebbles(m, { x0: 1, x1: 11, z0: 0.5, z1: 3.6, n: 5, seed: 14 });
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app;
    const V = new THREE.Vector3();
    const st = { day: 0, nat: 0, tageTouched: false, lastPi: 0, kan: [0, 0, 0, 0], kanShown: [0, 0, 0, 0], kanOpen: [false, false, false, false], bump: [0, 0, 0, 0], beis: 0, glitter: 0 };
    this._st = st;
    const calmK = () => (app.calm ? 0.5 : 1);
    const fxK = () => app.stage.tier.fx * calmK();
    const tap = (pop, fn) => { pop.pickMeshes = pop.fig ? pop.fig.hit.slice() : [pop.cut.mesh]; for (const m of pop.pickMeshes) m.userData.tap = fn; };
    const card = (id) => () => app.openCardById(id);

    // ================================================================ Wände
    const WL = 11.55, wallL = ctx.flat(wallLeftPart(WL), { x: -5.975, z: -3.65, name: 'wandL', delay: 0, ppu: 72, border: 0.04 });
    const wallR = ctx.prop('werkstatt_wand', { x: 5.7, z: -3.6, len: 11, delay: 0.02 });
    yield;
    // Wandbild (tippen: Karte Mumifizieren)
    const mural = ctx.flat(muralPart(5.2, 1.85), { x: -4.8, y: 2.6, z: -3.5, name: 'wandbild', delay: 0.1, ppu: 110, border: 0.03 });
    tap(mural, card('mumifizierung'));
    // Regal mit Harzkrügen
    const RX = -9.75, RZ = -3.2, RS = 1.14;
    ctx.flat(regalPart(), { x: RX, z: RZ, ws: RS, name: 'regal', delay: 0.06, ppu: 100, border: 0.03 });
    const krug = [];
    [[0, -0.7, 1], [1, 0.62, 1], [2, -0.45, 2], [3, 0.72, 2]].forEach(([v, lx, row], i) => {
      const p = ctx.prop('harzkrug', { x: RX + lx * RS, z: RZ + 0.16, y: (REGAL.ys[row] + 0.02) * RS, h: 0.58 * RS, variant: { variant: v }, delay: 0.14 + i * 0.03 });
      krug.push(p);
    });
    // verstecktes Käferchen: steht hinter dem zweiten Krug im Regal, nur Rücken und Fühler lugen hervor
    const kaefer = ctx.stand('skarab6', { x: RX + (0.62 - 0.27) * RS, z: RZ + 0.08, y: (REGAL.ys[1] + 0.02) * RS, len: 0.6, facing: 1, delay: 0.3, hidden: true, hint: false, hitPad: 0.2 });
    kaefer.onWake = (a) => {
      a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.3; }, { done: () => { a.hop = 0; } });
      const kr = krug[1]; kr.group.userData.wig = 0.9; app.audio.voice('skarabaeus');
    };
    ctx.onUpdate((dt) => { const kr = krug[1], w = kr.group.userData.wig || 0; if (w > 0) { kr.group.userData.wig = Math.max(0, w - dt * 1.6); kr.pivot.rotation.z = Math.sin(w * 24) * 0.06 * w; } else kr.pivot.rotation.z = 0; });
    yield;

    // ================================================================ Kanopen auf dem Sockel
    const SX = -4.8, SZ = -1.2, SH = 0.6, KH = 1.75, KD = 1.3;
    ctx.flat(sockelPart(5.5, SH), { x: SX, z: SZ, name: 'sockel', delay: 0.1, ppu: 120, border: 0.03 });
    const KN = [['kanope_mensch', 'Amset', 'Mensch'], ['kanope_pavian', 'Hapi', 'Pavian'], ['kanope_schakal', 'Duamutef', 'Schakal'], ['kanope_falke', 'Kebehsenuef', 'Falke']];
    const kan = KN.map(([id, nm, an], i) => {
      const pop = ctx.prop(id, { x: SX - 1.5 * KD + i * KD, z: SZ + 0.02, y: SH, h: KH, delay: 0.2 + i * 0.04 });
      const lid = pop.fig.parts.deckel, rest = lid.userData.rest, lift = (pop.fig.meta.lift || 0.14) * pop.fig.ws;
      const tag = canvasPlane(1.22, 0.52, 150);
      drawTag(tag, nm, an, SK[i]);
      tag.mesh.position.set(0, -SH + 0.34, 0.95); tag.mesh.scale.setScalar(0.001); tag.mat.opacity = 0; pop.add(tag.mesh); pop.side.own(tag);
      tap(pop, () => { st.bump[i] = 1; app.audio.sfx('chime', { note: i * 2 }); app.openCardById('kanopen'); });
      return { pop, lid, rest, lift, tag };
    });
    yield;
    // Tisch mit Amuletten
    const TX = -0.95, TZ = -1.3, TH = 0.8;
    const tisch = ctx.flat(tischPart(1.8, TH), { x: TX, z: TZ, name: 'tisch', delay: 0.14, ppu: 120, border: 0.03 });
    const herz = ctx.prop('amulett_herzskarabaeus', { x: TX - 0.58, z: TZ + 0.12, y: TH, h: 0.7, delay: 0.3 });
    tap(herz, card('herzskarabaeus'));
    ctx.prop('udjat', { x: TX - 0.1, z: TZ + 0.1, y: TH, h: 0.58, delay: 0.32 });
    ctx.prop('ankh', { x: TX + 0.33, z: TZ + 0.12, y: TH, h: 0.78, delay: 0.34 });
    ctx.prop('djed', { x: TX + 0.68, z: TZ + 0.1, y: TH, h: 0.84, delay: 0.36 });
    yield;

    // ================================================================ Rechte Seite: Werkstatt
    // Leinenbahnen (rücken im Verlauf der Tage der Bahre näher)
    const LX0 = 1.75, LX1 = 3.2;
    const linen = ctx.prop('leinenbahn', { x: LX0, z: -1.9, len: 3.0, delay: 0.1 });
    tap(linen, card('leinenbinden'));
    const priest = ctx.stand('priester', { x: 3.2, z: 0.3, h: 3.0, facing: 1, delay: 0.2, card: null, hint: false });
    priest.onWake = (a) => { a.tw.add(1.2, (k) => { a.fig.rotatePart('armA', Math.sin(k * Math.PI) * 0.3); a.hop = Math.sin(k * Math.PI) * 0.06; }, { done: () => { a.hop = 0; } }); app.audio.voice('priester'); };
    // Bahre
    const bahre = ctx.prop('mumie_bahre', { x: 6.8, z: -0.5, len: 4.2, delay: 0.16 });
    tap(bahre, card('mumie_bahre'));
    yield;
    // Natron
    const heap = ctx.prop('natron_haufen', { x: 9.8, z: -0.35, len: 2.1, delay: 0.24 });
    tap(heap, card('natron'));
    const heapMat = heap.fig.cuts[0].material;
    const schale = ctx.prop('natron_schale', { x: 9.35, z: 0.95, len: 1.25, delay: 0.28 });
    tap(schale, card('natron'));
    const einb = ctx.stand('einbalsamierer', { x: 11.0, z: 0.5, h: 3.2, facing: -1, delay: 0.26 });
    einb.setFacing(-1);
    {
      const armG = einb.fig.parts.armA, piv = einb.fig.spec.parts.armA.pivot, ws = einb.fig.ws, ha = einb.fig.spec.anchors.handA;
      einb.hand = new THREE.Vector3((ha[0] - piv[0]) * ws, (ha[1] - piv[1]) * ws, 0.06); einb.armG = armG;
    }
    einb.onWake = (a) => { a.tw.add(1.3, (k) => { a.fig.rotatePart('armA', Math.sin(k * Math.PI) * 0.5); a.hop = Math.sin(k * Math.PI) * 0.05; }, { done: () => { a.hop = 0; } }); };
    // Hinweis über dem Natron
    const note = canvasPlane(3.1, 0.9, 150);
    drawNote(note, 'Salz zieht Wasser an', 'Es entzieht dem Körper Wasser');
    note.mesh.position.set(0, 1.85, 0.2); note.mesh.scale.setScalar(0.001); note.mat.opacity = 0; heap.add(note.mesh); heap.side.own(note);
    // Versuchsschild
    const sign = ctx.flat(signPart(), { x: 1.35, z: 1.15, ws: 1.5, name: 'versuch', delay: 0.3, ppu: 130, border: 0.03 });
    tap(sign, card('mumifizieren_versuch'));
    yield;

    // ================================================================ Licht durch die Öffnung
    const OX = 1.05; // Öffnungsmitte relativ zur Wandmitte
    const beamGeo = new THREE.BufferGeometry();
    const bpos = new Float32Array(12), buv = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);
    beamGeo.setAttribute('position', new THREE.BufferAttribute(bpos, 3)); beamGeo.setAttribute('uv', new THREE.BufferAttribute(buv, 2)); beamGeo.setIndex([0, 2, 1, 1, 2, 3]);
    const bc = document.createElement('canvas'); bc.width = 64; bc.height = 128; { const g = bc.getContext('2d'); const gv = g.createLinearGradient(0, 0, 0, 128); gv.addColorStop(0, 'rgba(255,238,170,.75)'); gv.addColorStop(0.55, 'rgba(255,230,150,.28)'); gv.addColorStop(1, 'rgba(255,225,140,0)'); g.fillStyle = gv; g.fillRect(0, 0, 64, 128); g.globalCompositeOperation = 'destination-in'; const gh = g.createLinearGradient(0, 0, 64, 0); gh.addColorStop(0, 'rgba(0,0,0,0)'); gh.addColorStop(0.15, 'rgba(0,0,0,1)'); gh.addColorStop(0.85, 'rgba(0,0,0,1)'); gh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gh; g.fillRect(0, 0, 64, 128); }
    const btex = new THREE.CanvasTexture(bc); btex.colorSpace = THREE.SRGBColorSpace;
    const bmat = new THREE.MeshBasicMaterial({ map: btex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0.62 });
    const beam = new THREE.Mesh(beamGeo, bmat); beam.renderOrder = 4; beam.frustumCulled = false;
    wallR.add(beam); wallR.side.own({ dispose() { beamGeo.dispose(); bmat.dispose(); btex.dispose(); } });
    const setBeam = (shift) => {
      // oben an der Öffnung, unten als Fleck auf dem Boden vor der Bahre (Sonne wandert mit den Tagen)
      const t0 = OX - 1.2, t1 = OX + 1.25, b0 = OX - 1.55 + shift, b1 = OX + 1.3 + shift;
      bpos.set([t0, 3.2, 0.1, t1, 3.2, 0.1, b0, 0.03, 3.3, b1, 0.03, 3.3]); beamGeo.attributes.position.needsUpdate = true;
    };
    setBeam(0);
    yield;

    // ================================================================ Zeitleiste auf der Seite
    const strip = canvasPlane(STRIP_W, STRIP_H, 190, { flat: true });
    strip.mesh.position.set(6.3, 0.016, 2.25); ctx.R.add(strip.mesh); ctx.R.own(strip);
    drawStrip(strip, 0);
    ctx.R.addTap(strip.mesh, card('mumifizierung'));

    // ================================================================ Laschen
    const tage = ctx.control('R', { id: 'tage', label: 'TAGE', a: [2.3, 3.78], b: [5.9, 3.78], size: [1.85, 0.95], color: '#c0432e', value: 0, hold: true, ticks: 7 });
    const natron = ctx.control('R', { id: 'natron', label: 'NATRON', a: [8.5, 3.78], b: [10.0, 3.78], size: [2.0, 0.95], color: '#2a6aa0', value: 0, springBack: true });
    const kanopen = ctx.control('L', { id: 'kanopen', label: 'KANOPEN', a: [-4.2, 3.8], b: [-1.5, 3.8], size: [2.2, 0.95], color: '#b8862d', value: 0, hold: true, ticks: 4 });

    const BX = 6.8; // Bahre (Mitte)
    const applyDay = (immediate) => {
      const d = st.day, pi = phaseIndex(d), a = clamp((d - 4) / 40);
      drawStrip(strip, d, { touched: st.tageTouched });
      // Salz nimmt Wasser auf: dunkelt leicht, wird flacher
      const wet = smooth(a);
      heapMat.color.setRGB(lerp(1, 0.84, wet), lerp(1, 0.8, wet), lerp(1, 0.72, wet));
      heap.fig.root.scale.y = 1 - 0.14 * wet;
      // Leinenbinden rücken heran
      linen.group.position.x = lerp(LX0, LX1, smooth(clamp((d - 44) / 22)));
      setBeam(lerp(-0.5, 0.7, d / DAYS));
      if (pi === 3 && st.lastPi < 3) { st.glitter = 2.2; app.audio.sfx('sistrum'); app.audio.sfx('chime', { note: 4 }); }
      if (pi !== st.lastPi) { if (pi > st.lastPi) app.audio.sfx('tapp'); st.lastPi = pi; }
      st.beis = pi === 3 ? 1 : 0;
    };
    tage.on((v) => { st.day = v * DAYS; if (v > 0.002) st.tageTouched = true; applyDay(); });
    tage.onGrab = () => app.audio.sfx('grab'); tage.onTick = (v) => app.audio.sfx('slide', { v }); tage.onRelease = () => app.audio.sfx('snap');
    natron.on((v) => { st.nat = v; app.audio.ctl('salt', v); });
    natron.onGrab = () => app.audio.sfx('grab'); natron.onTick = (v) => app.audio.sfx('sand', { v }); natron.onRelease = () => { app.audio.sfx('snap'); app.audio.ctl('salt', 0); };
    kanopen.on((v) => {
      for (let i = 0; i < 4; i++) {
        const k = clamp(v * 4.2 - i); st.kan[i] = k;
        if (k > 0.55 && !st.kanOpen[i]) { st.kanOpen[i] = true; app.audio.sfx('chime', { note: i * 2 + 1 }); st.bump[i] = Math.max(st.bump[i], 0.6); burstLid(i); }
        if (k < 0.3) st.kanOpen[i] = false;
      }
    });
    kanopen.onGrab = () => app.audio.sfx('grab'); kanopen.onTick = (v) => app.audio.sfx('slide', { v }); kanopen.onRelease = () => app.audio.sfx('snap');
    function burstLid(i) {
      const w = ctx.world(kan[i].pop.group.position.x, SH + KH + 0.1, kan[i].pop.group.position.z + 0.3);
      const n = Math.max(2, Math.round(7 * fxK()));
      for (let j = 0; j < n; j++) app.fx.glow.emit({ x: w.x + (Math.random() - 0.5) * 0.4, y: w.y + Math.random() * 0.2, z: w.z, vx: (Math.random() - 0.5) * 0.35, vy: 0.3 + Math.random() * 0.4, vz: 0.1, life: 1.2, size: 0.12, alpha: 0.85, color: [1, 0.85, 0.4], drag: 1.2 });
    }

    // ================================================================ Frame-Update
    let acc = { salt: 0, drop: 0, dust: 0, gold: 0 };
    const tmpA = new THREE.Vector3();
    ctx.onUpdate((dt, t) => {
      const calm = app.calm;
      // Kanopendeckel
      for (let i = 0; i < 4; i++) {
        const K = kan[i];
        st.kanShown[i] += (st.kan[i] - st.kanShown[i]) * (1 - Math.exp(-dt * 9));
        st.bump[i] = Math.max(0, st.bump[i] - dt * 2.2);
        const s = st.kanShown[i], b = Math.sin(st.bump[i] * Math.PI) * 0.35 + (calm ? 0 : Math.sin(t * 1.7 + i * 1.3) * 0.02 * s);
        K.lid.position.y = K.rest.py + K.lift * (s * 0.8 + b * 0.4);
        K.pop.fig.rotatePart('deckel', -0.3 * s);
        const ta = clamp((s - 0.35) / 0.4);
        K.tag.mat.opacity = ta; const sc = Math.max(0.001, 0.4 + 0.6 * smooth(ta)); K.tag.mesh.scale.setScalar(sc);
        
      }
      // Leinenbahnen pendeln
      const wrap = clamp((st.day - 40) / 20), amp = (0.35 + 0.65 * wrap) * (calm ? 0.4 : 1);
      for (let i = 1; i <= 5; i++) linen.fig.rotatePart('bahn' + i, (0.5 + 0.5 * Math.sin(t * (0.9 + i * 0.13) + i * 1.7)) * 0.12 * amp);
      // Priester salbt während "Salben und Wickeln"
      const wk = phaseIndex(st.day) === 2 ? 1 : 0;
      priest.wk = (priest.wk || 0) + (wk - (priest.wk || 0)) * (1 - Math.exp(-dt * 3));
      if (priest.tw.list.length === 0) priest.fig.rotatePart('armA', priest.wk * (0.1 + 0.1 * Math.sin(t * 1.4)));
      // Einbalsamierer streut Salz
      const n = st.nat;
      if (einb.tw.list.length === 0) einb.fig.rotatePart('armA', n * (0.28 + 0.14 * Math.sin(t * 15 * (calm ? 0.4 : 1))));
      if (n > 0.04 && ctx.spread.active) {
        acc.salt += dt * (46 * n) * fxK();
        einb.armG.localToWorld(tmpA.copy(einb.hand));
        while (acc.salt >= 1) {
          acc.salt -= 1;
          app.fx.dust.emit({ x: tmpA.x + (Math.random() - 0.5) * 0.12, y: tmpA.y, z: tmpA.z + (Math.random() - 0.3) * 0.15, vx: -0.9 - Math.random() * 0.4, vy: 0.15 + Math.random() * 0.25, vz: 0.35 + Math.random() * 0.2, life: 0.9, size: 0.06 + Math.random() * 0.04, alpha: 0.95, color: [0.98, 0.98, 1], grav: 6.5, drag: 0.4 });
        }
      } else acc.salt = 0;
      // Hinweisschild über dem Natron
      const tn = clamp(n * 3 - 0.2);
      note.mat.opacity = tn; note.mesh.scale.setScalar(Math.max(0.001, 0.5 + 0.5 * smooth(tn)));
      // Wassertröpfchen wandern von der Bahre ins Salz (Salz zieht Wasser an)
      const dry = (st.day > 4 && st.day < 44 ? 0.5 : 0);
      const dr = (n * 0.9 + dry) * fxK() * 3.2;
      if (dr > 0.05 && ctx.spread.active) {
        acc.drop += dt * dr;
        while (acc.drop >= 1) {
          acc.drop -= 1;
          const w = ctx.world(BX + 1.0 + Math.random() * 0.8, 1.2 + Math.random() * 0.3, -0.7 + Math.random() * 0.5);
          app.fx.dust.emit({ x: w.x, y: w.y, z: w.z, vx: 1.05 + Math.random() * 0.2, vy: 0.5 + Math.random() * 0.15, vz: 0.1 + Math.random() * 0.1, life: 1.6, size: 0.085, alpha: 0.85, color: [0.45, 0.76, 0.98], grav: 1.0, drag: 0.1 });
        }
      } else acc.drop = 0;
      // Staubflimmern im Lichtstrahl
      if (ctx.spread.active) {
        acc.dust += dt * 7 * fxK();
        while (acc.dust >= 1) {
          acc.dust -= 1;
          const s = Math.random(), sh = lerp(-0.5, 0.7, st.day / DAYS);
          const x = lerp(5.7 + OX - 1.2 + Math.random() * 2.4, 5.7 + OX - 1.55 + sh + Math.random() * 2.8, s), y = lerp(3.1, 0.3, s) + (Math.random() - 0.5) * 0.3, z = lerp(-3.4, -0.4, s);
          const w = ctx.world(x, y, z);
          app.fx.glow.emit({ x: w.x, y: w.y, z: w.z, vx: (Math.random() - 0.5) * 0.06, vy: 0.03 + Math.random() * 0.05, vz: (Math.random() - 0.5) * 0.04, life: 3.4 + Math.random() * 2, size: 0.04 + Math.random() * 0.04, alpha: 0.7, color: [1, 0.92, 0.65], drag: 0.2 });
        }
      }
      // Beisetzung: goldenes Funkeln über der Bahre
      if (st.glitter > 0) {
        st.glitter -= dt; acc.gold += dt * 22 * fxK();
        while (acc.gold >= 1) { acc.gold -= 1; const w = ctx.world(BX - 1.6 + Math.random() * 3.2, 1.3 + Math.random() * 0.6, -0.7 + Math.random() * 0.5); app.fx.glow.emit({ x: w.x, y: w.y, z: w.z, vx: 0, vy: 0.25 + Math.random() * 0.2, vz: 0.05, life: 1.4, size: 0.11, alpha: 0.9, color: [1, 0.84, 0.35], drag: 0.8 }); }
      }
      // sanftes Atmen des Lichtstrahls
      bmat.opacity = 0.56 + (calm ? 0 : 0.07 * Math.sin(t * 0.7));
    });
  },
  onDeactivate(ctx) {
    for (const c of [...ctx.R.controls, ...ctx.L.controls]) c.setValue(0, { snap: true });
    const st = this._st; if (st) { st.nat = 0; st.glitter = 0; st.tageTouched = false; }
  },
};
