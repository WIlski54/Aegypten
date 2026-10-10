// Station 7 (Tal der Könige): eigene Kulissen-Parts (Sockel, Wände der Grabkammer, Schild) und Texturen.
// Alle Maße in Welteinheiten (ws = 1), Ursprung der Parts: Mitte unten (x = 0, y = 0).
import * as THREE from 'three';
import { C, rect, crumbleTop, fr, blocks, plaster, vGrad, sideLight, vignette, starCeiling, stripeBand, glyphRow, fillPoly, strokePoly, curve, blob, rngOf, mix, star5 } from '../art/props/_eg_arch_kit.js';
import { SERIF } from '../engine/pagepaint.js';

// Sandstein-Sockel für Statuen
export function plinthPart(w, h, seed = 3) {
  const x0 = -w / 2, x1 = w / 2, capH = Math.min(0.12, h * 0.3);
  return {
    layers: [
      {
        shapes: [rect(x0, 0, x1, h - capH)], fill: C.sand,
        deco(c) {
          blocks(c, x0, 0, x1, h - capH, { ch: (h - capH) / 2, bw: w * 0.7, base: '#d8bb7c', seed, joint: 'rgba(95,65,30,.5)' });
          sideLight(c, x0, 0, x1, h, { left: 'rgba(255,245,210,.25)', right: 'rgba(60,30,5,.3)' });
          vGrad(c, x0, 0, x1, 0.25, 'rgba(0,0,0,0)', 'rgba(70,40,10,.3)');
        },
      },
      {
        shapes: [rect(x0 - 0.07, h - capH, x1 + 0.07, h)], fill: C.sandLt,
        deco(c) { fr(c, x0 - 0.07, h - 0.025, x1 + 0.07, h, 'rgba(255,255,255,.5)'); fr(c, x0 - 0.07, h - capH, x1 + 0.07, h - capH + 0.025, 'rgba(80,45,10,.35)'); },
      },
    ],
  };
}

// Rückwand der Grabkammer: dunkler Grund, Sternendecke oben, Zierband, Zeichenreihen (nur einzelne Zierzeichen, keine Wörter)
export function kammerWandPart(W, H) {
  const x0 = -W / 2, x1 = W / 2;
  return {
    layers: [{
      shapes: [crumbleTop(x0, x1, 0, H, { amp: 0.05, step: 0.35, seed: 5 })], fill: '#241a12',
      deco(c) {
        plaster(c, x0, 0, x1, H, '#2c2016', { seed: 9, n: 80, alpha: 0.08 });
        // Sternendecke (oben) und Goldleiste
        starCeiling(c, x0, H - 0.62, x1, H, { base: '#1d2f66', star: '#f0c850', pitch: 0.34, r: 0.075 });
        fr(c, x0, H - 0.68, x1, H - 0.62, '#e0b040');
        stripeBand(c, x0, x1, H - 1.0, H - 0.68, [C.carn, C.lapis, C.nile, C.gold], { step: 0.14 });
        fr(c, x0, H - 1.04, x1, H - 1.0, '#e0b040');
        // zwei Register mit Zierzeichen auf Putzfeldern
        const rows = [[1.55, 0.42], [0.82, 0.38]];
        rows.forEach(([y, h], i) => {
          fr(c, x0 + 0.2, y - 0.1, x1 - 0.2, y + h + 0.12, i ? '#d6b57c' : '#dcc088', 0.2);
          glyphRow(c, x0 + 0.4, x1 - 0.4, y, h, i ? ['was', 'ankh', 'djed', 'auge'] : ['ankh', 'djed', 'feder', 'was', 'sonne'], [C.goldDk, C.lapisLt, C.carn, '#e0b040'], { pitch: 0.62, lw: 0.022 });
        });
        // senkrechte Felderung
        for (let x = x0 + 0.9; x < x1 - 0.5; x += 1.6) fr(c, x, 0.16, x + 0.035, H - 1.1, 'rgba(224,176,64,.35)');
        fr(c, x0, 0, x1, 0.16, '#5a3e24');
        vGrad(c, x0, 0, x1, 0.7, 'rgba(0,0,0,0)', 'rgba(0,0,0,.35)');
        sideLight(c, x0, 0, x1, H, { left: 'rgba(255,225,160,.14)', right: 'rgba(0,0,0,.25)' });
      },
    }],
  };
}

// Seitenwand der Kammer (Putz mit Fries); D = Tiefe, H = Höhe
export function kammerSidePart(D, H, seed = 4) {
  const x0 = -D / 2, x1 = D / 2;
  return {
    layers: [{
      shapes: [crumbleTop(x0, x1, 0, H, { amp: 0.05, step: 0.3, seed })], fill: '#c4965f',
      deco(c) {
        plaster(c, x0, 0, x1, H, '#c9a06a', { seed: 7, n: 60, alpha: 0.1 });
        stripeBand(c, x0, x1, H - 0.5, H - 0.22, [C.carn, C.lapis, C.nile, C.gold], { step: 0.13 });
        fr(c, x0, H - 0.54, x1, H - 0.5, '#e0b040'); fr(c, x0, H - 0.22, x1, H - 0.18, '#e0b040');
        glyphRow(c, x0 + 0.3, x1 - 0.3, 1.5, 0.4, ['ankh', 'was', 'djed'], [C.goldDk, C.carnDk], { pitch: 0.6, lw: 0.02 });
        fr(c, x0, 0, x1, 0.14, '#8f6a3e');
        vGrad(c, x0, 0, x1, H, 'rgba(0,0,0,0)', 'rgba(50,25,5,.3)');
      },
    }],
  };
}

// niedrige Schwelle vorn an der Kammer
export function sillPart(W, h = 0.3) {
  const x0 = -W / 2, x1 = W / 2;
  return {
    layers: [{
      shapes: [crumbleTop(x0, x1, 0, h, { amp: 0.03, step: 0.28, seed: 8 })], fill: C.sand,
      deco(c) {
        blocks(c, x0, 0, x1, h, { ch: h / 2, bw: 0.9, base: '#dcbf84', seed: 6 });
        vGrad(c, x0, 0, x1, h, 'rgba(255,245,210,.25)', 'rgba(70,40,10,.3)');
      },
    }],
  };
}

// Schild „KV 62“ an zwei Pfosten (moderne Beschriftung, wie im Tal der Könige)
export function signPart() {
  const w = 1.5, h = 0.66, y0 = 0.5;
  return {
    layers: [
      { shapes: [rect(-0.58, 0, -0.5, y0 + 0.1), rect(0.5, 0, 0.58, y0 + 0.1)], fill: '#8a5a32', deco(c) { vGrad(c, -0.6, 0, 0.6, y0, 'rgba(255,230,180,.2)', 'rgba(40,20,5,.35)'); } },
      {
        shapes: [rect(-w / 2, y0, w / 2, y0 + h)], fill: '#f4ead0',
        deco(c) {
          const { ctx, tf, S } = c;
          strokePoly(c, rect(-w / 2 + 0.05, y0 + 0.05, w / 2 - 0.05, y0 + h - 0.05), '#8B1E1E', 0.025);
          ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const [cx, cy] = tf(0, y0 + h * 0.62); ctx.fillStyle = '#8B1E1E'; ctx.font = `bold ${0.3 * S}px ${SERIF}`; ctx.fillText('KV 62', cx, cy);
          const [dx, dy] = tf(0, y0 + h * 0.27); ctx.fillStyle = '#3a2615'; ctx.font = `italic ${0.145 * S}px ${SERIF}`; ctx.fillText('Grab des Tutanchamun', dx, dy);
          ctx.restore();
        },
      },
    ],
  };
}

// Boden der Grabkammer (liegt auf der Seite): Steinplatten
export function floorCanvas(w, d) {
  const S = 110, c = document.createElement('canvas'); c.width = Math.ceil(w * S); c.height = Math.ceil(d * S);
  const g = c.getContext('2d'), r = rngOf(11, 2);
  g.fillStyle = '#9a7448'; g.fillRect(0, 0, c.width, c.height);
  const cols = Math.round(w / 0.9), rows = Math.max(2, Math.round(d / 0.7));
  const cw = c.width / cols, rh = c.height / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const t = r(); g.fillStyle = t < 0.5 ? `rgba(255,235,190,${0.04 + (0.5 - t) * 0.2})` : `rgba(40,20,5,${0.04 + (t - 0.5) * 0.25})`;
    g.fillRect(i * cw + (j % 2 ? cw * 0.4 : 0), j * rh, cw, rh);
  }
  g.strokeStyle = 'rgba(50,28,10,.55)'; g.lineWidth = 2;
  for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, j * rh); g.lineTo(c.width, j * rh); g.stroke(); }
  for (let j = 0; j < rows; j++) for (let i = 0; i <= cols; i++) { const x = i * cw + (j % 2 ? cw * 0.4 : 0); g.beginPath(); g.moveTo(x, j * rh); g.lineTo(x, (j + 1) * rh); g.stroke(); }
  return c;
}

// weiche Leuchtfläche (additiv); liegt parallel zum Pop-up
export function glowPlane(softTex, color, w, h, opacity = 0, depthTest = true) {
  const m = new THREE.MeshBasicMaterial({ map: softTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, depthTest });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); g.scale.set(w, h, 1); g.renderOrder = 4; g.visible = opacity > 0.002;
  return g;
}

export { mix, blob, curve, fillPoly, star5, vignette };
