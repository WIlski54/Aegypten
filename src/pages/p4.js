// Station 4: Götter und Totengericht (Tempelhalle, Waage, Tor der Unterwelt, Sonnenbarke)
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { textCard, printLabel, SERIF, roundRect, blotches, speckles } from '../engine/pagepaint.js';
import { PAGES_DE } from '../data/pages.de.js';
import { poseAmt } from '../engine/popup.js';
import { Spring, TAU, clamp, lerp, smooth } from '../engine/util.js';
import { panelPart, leftCard } from './common.js';
import { poly } from '../art/dsl.js';
import { sunGlow, softTexture } from '../engine/effects.js';
import { waageSet, torOeffnen } from '../art/props/eg_ritual.js';

const IDX = 4;

// ---- Maße und Plätze
const GOD_WS = 1.0;                         // Maßstab der Götterreihe (alle gleich, damit die Größen stimmen)
const GOD_H = { ra: 2.13, osiris: 2.25, isis: 1.98, horus: 2.24, hathor: 1.97, bastet: 1.9, sobek: 2.25 };
const SOCKEL_H = 0.34;
const ROW_Z = -1.6;
const ROW = [['ra', -10.55], ['horus', -8.95], ['sobek', -7.35], ['bastet', -5.75], ['hathor', -4.15], ['isis', -2.55], ['osiris', -0.95]];
const WG = { x: 7.7, z: -0.9, h: 3.0 };       // Waage
const TOR = { x: 3.15, z: -3.2, h: 4.25 };
const BARKE = { x0: -10.4, x1: 10.5, y: 3.15, z: -2.7, len: 2.6 };

const GLOW_COL = { ra: [1, 0.78, 0.35], horus: [0.5, 0.75, 1], sobek: [0.5, 0.9, 0.7], bastet: [1, 0.85, 0.5], hathor: [1, 0.6, 0.6], isis: [0.7, 0.8, 1], osiris: [0.6, 1, 0.7], anubis: [0.8, 0.7, 1], thot: [0.8, 0.9, 1], maat: [1, 0.95, 0.7], ammit: [1, 0.8, 0.6] };

// ---- Sockel aus Papierschnitt: goldener Block mit schwarzem Feld und Lapis-Raute
function sockelPart() {
  const w = 1.3, h = SOCKEL_H;
  const body = poly([[-w / 2, 0], [w / 2, 0], [w / 2 - 0.05, h], [-w / 2 + 0.05, h]]);
  return {
    layers: [{
      shapes: [body], fill: { top: '#f0cf72', bottom: '#b8862d' },
      deco: (c, bb) => {
        const { ctx, tf, S } = c;
        const [x0, y0] = tf(-w / 2 + 0.14, h - 0.09), [x1, y1] = tf(w / 2 - 0.14, 0.09);
        ctx.fillStyle = '#17203f'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        ctx.strokeStyle = 'rgba(255,225,140,.9)'; ctx.lineWidth = 0.014 * S; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        const [cx, cy] = tf(0, h / 2), r = 0.085 * S;
        ctx.fillStyle = '#3a78c8'; ctx.beginPath(); ctx.moveTo(cx - r * 1.4, cy); ctx.lineTo(cx, cy - r); ctx.lineTo(cx + r * 1.4, cy); ctx.lineTo(cx, cy + r); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.28, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x0 - 0.1 * S, tf(0, h - 0.015)[1], (x1 - x0) + 0.2 * S, 0.012 * S);
      },
    }],
  };
}

// ---- Feuerschalen: Ständer aus Gold und Schwarz, Flamme als eigenes Blatt (flackert sanft)
function brazierPart() {
  const body = poly([[-0.46, 0.88], [0.46, 0.88], [0.4, 0.7], [0.26, 0.6], [0.1, 0.55], [0.1, 0.22], [0.3, 0.12], [0.3, 0], [-0.3, 0], [-0.3, 0.12], [-0.1, 0.22], [-0.1, 0.55], [-0.26, 0.6], [-0.4, 0.7]], 1);
  return {
    layers: [{
      shapes: [body], fill: { top: '#f0cf72', bottom: '#a87420' },
      deco: (c) => {
        const { ctx, tf, S } = c;
        const band = (y0, y1, col) => { const [xa, ya] = tf(-0.5, y1), [xb, yb] = tf(0.5, y0); ctx.fillStyle = col; ctx.fillRect(xa, ya, xb - xa, yb - ya); };
        band(0.0, 0.07, '#17203f'); band(0.74, 0.8, '#2d5aa6'); band(0.8, 0.83, '#17203f'); band(0.34, 0.4, '#2d5aa6');
        ctx.fillStyle = 'rgba(255,255,255,.28)'; const [hx, hy] = tf(-0.04, 0.5); ctx.fillRect(hx, hy, 0.025 * S, -0.2 * S);
      },
    }],
  };
}
function flamePart() {
  const f = poly([[0, 0], [0.19, 0.1], [0.23, 0.34], [0.11, 0.62], [0.03, 0.95], [-0.03, 0.7], [-0.13, 0.62], [-0.23, 0.34], [-0.19, 0.1]], 2);
  return {
    layers: [{
      shapes: [f], fill: { top: '#ffe98a', bottom: '#e8601a' }, stroke: null,
      deco: (c) => { const { ctx, tf, S } = c; const [x, y] = tf(0, 0.22); const g = ctx.createRadialGradient(x, y, 0, x, y, 0.28 * S); g.addColorStop(0, 'rgba(255,255,230,.95)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 0.4 * S, y - 0.4 * S, 0.8 * S, 0.8 * S); },
    }],
  };
}

// ---- Zeilen der Anzeige auf der Seite (Zustand der Waage), kurz und freundlich
const STATES = {
  mid: ['Herz gegen Feder:', 'Was ist schwerer?'],
  light: ['Das Herz ist leicht.', 'Das ist gut!'],
  even: ['Im Gleichgewicht:', 'Ma’at lächelt.'],
  heavy: ['Das Herz ist schwer.', 'Ammit schaut nur neugierig.'],
};
function stateCanvas(key) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 176; const g = c.getContext('2d');
  const lines = STATES[key];
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,10,.7)'; g.shadowBlur = 8; g.shadowOffsetY = 3;
  g.fillStyle = '#ffe7a6'; g.font = `bold 66px ${SERIF}`; g.fillText(lines[0], 512, 52);
  g.fillStyle = '#fff6df'; g.font = `italic 54px ${SERIF}`; g.fillText(lines[1], 512, 124);
  return c;
}

export default {
  id: 'goetter',
  mood: mood({ key: '#ffd6a0', keyI: 2.1, sky: '#c8d4ff', gnd: '#3b3156', hemiI: 1.55, pos: [-12, 20, 9], rim: 0 }),
  motes: { colors: [[1, 0.85, 0.5], [1, 0.95, 0.75], [0.7, 0.8, 1]], size: 0.055, alpha: 0.42, dy: 0.06, dx: 0.05, tw: 1.0, density: 0.7 },
  atmo: 'goetter',
  base() {
    const FLOOR = { back: '#2a3b6e', front: '#16224a' };
    const tiles = (m, x0, x1) => {
      const { ctx } = m;
      ctx.save(); ctx.strokeStyle = 'rgba(240,200,110,.15)'; ctx.lineWidth = Math.max(1, 0.022 * m.S);
      for (let x = x0; x <= x1 + 0.01; x += 1.5) { ctx.beginPath(); ctx.moveTo(m.x(x), m.z(-4.2)); ctx.lineTo(m.x(x), m.z(4.2)); ctx.stroke(); }
      for (let z = -3.9; z <= 4.2; z += 1.5) { ctx.beginPath(); ctx.moveTo(m.x(x0), m.z(z)); ctx.lineTo(m.x(x1), m.z(z)); ctx.stroke(); }
      ctx.restore();
    };
    return {
      L: {
        paper: '#e9dcb6', ground: FLOOR, margin: 0.4, pageNo: 2 * IDX + 1, seed: 41,
        draw(ctx, m) {
          blotches(m, { x0: -12, x1: 0, z0: -4.2, z1: 4.2, n: 14, rmin: 0.9, rmax: 2.2, colors: ['rgba(120,160,255,.10)', 'rgba(255,215,140,.07)'], seed: 7 });
          tiles(m, -12, 0);
          speckles(m, { x0: -11.6, x1: -0.4, z0: -3.8, z1: 4.0, n: 260, color: 'rgba(255,230,160,.18)', size: 0.025, seed: 5 });
          leftCard(null, IDX)(ctx, m);
        },
      },
      R: {
        ground: FLOOR, margin: 0.35, pageNo: 2 * IDX + 2, seed: 42,
        draw(ctx, m) {
          blotches(m, { x0: 0, x1: 12, z0: -4.2, z1: 4.2, n: 14, rmin: 0.9, rmax: 2.2, colors: ['rgba(120,160,255,.10)', 'rgba(255,215,140,.07)'], seed: 9 });
          tiles(m, 0, 12);
          speckles(m, { x0: 0.6, x1: 11.4, z0: -3.8, z1: 4.0, n: 260, color: 'rgba(255,230,160,.18)', size: 0.025, seed: 6 });
          // Läufer unter der Waage: Lapis mit Goldrand
          const rx = 4.35, rz = -1.7, rw = 7.15, rh = 3.95;
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,10,.45)'; ctx.shadowBlur = 0.12 * m.S; ctx.shadowOffsetY = 0.05 * m.S;
          ctx.fillStyle = '#2d5aa6'; roundRect(ctx, m.x(rx), m.z(rz), rw * m.S, rh * m.S, 0.12 * m.S); ctx.fill(); ctx.shadowColor = 'transparent';
          ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 0.08 * m.S; roundRect(ctx, m.x(rx + 0.16), m.z(rz + 0.16), (rw - 0.32) * m.S, (rh - 0.32) * m.S, 0.08 * m.S); ctx.stroke();
          ctx.strokeStyle = '#17203f'; ctx.lineWidth = 0.03 * m.S; roundRect(ctx, m.x(rx + 0.3), m.z(rz + 0.3), (rw - 0.6) * m.S, (rh - 0.6) * m.S, 0.05 * m.S); ctx.stroke();
          // Rautenmuster
          ctx.strokeStyle = 'rgba(255,225,140,.22)'; ctx.lineWidth = 0.02 * m.S;
          ctx.beginPath(); ctx.rect(m.x(rx + 0.3), m.z(rz + 0.3), (rw - 0.6) * m.S, (rh - 0.6) * m.S); ctx.clip();
          for (let k = -6; k < 12; k += 0.6) { ctx.beginPath(); ctx.moveTo(m.x(rx + k), m.z(rz)); ctx.lineTo(m.x(rx + k + rh), m.z(rz + rh)); ctx.moveTo(m.x(rx + k + rh), m.z(rz)); ctx.lineTo(m.x(rx + k), m.z(rz + rh)); ctx.stroke(); }
          ctx.restore();
          // Beschriftung am Schieber
          printLabel(m, 'Herz leicht', 5.5, 4.07, { size: 0.17, color: 'rgba(255,230,160,.85)', italic: true, bold: false });
          printLabel(m, 'Gleichgewicht', 8.0, 4.07, { size: 0.17, color: 'rgba(255,230,160,.85)', italic: true, bold: false });
          printLabel(m, 'Herz schwer', 10.5, 4.07, { size: 0.17, color: 'rgba(255,230,160,.85)', italic: true, bold: false });
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app, side = ctx.R;
    const S = (this.S = {});            // Laufzeitzustand (zum Zurücksetzen und für Tests)
    const world = (x, y, z) => ctx.world(x, y, z);
    const calmK = () => (app.calm ? 0.35 : 1);
    const fxK = () => app.stage.tier.fx * (app.calm ? 0.5 : 1);
    const glowAt = (x, y, z, o = {}) => app.fx.glow.emit({ x, y, z, vx: 0, vy: 0.3, vz: 0, life: 1, size: 0.12, alpha: 0.8, color: [1, 0.85, 0.5], ...o });
    const tapProp = (pop, id, extra = []) => {
      if (!pop || !pop.fig) return;
      pop.pickMeshes = [...pop.fig.hit, ...extra];
      for (const m of pop.fig.hit) m.userData.tap = () => app.openCardById(id);
    };

    // ---------------------------------------------------------------- Hintergrund: Wand, Sternenhimmel
    for (const sd of ['L', 'R']) {
      const x0 = sd === 'L' ? -11.9 : 0.1, x1 = sd === 'L' ? -0.1 : 11.9;
      ctx.flat(panelPart(x0, x1, 4.9, { fill: { top: '#0f1a45', bottom: '#223a78' }, wave: 0.0, freq: 3, seed: 3 }), { z: -4.12, name: 'back' + sd, delay: 0, ppu: 40, border: 0.03 });
    }
    yield;
    ctx.prop('tempelhalle_wand', { x: -6.0, z: -4.0, len: 11.4, delay: 0.02, cast: false });
    ctx.prop('tempelhalle_wand', { x: 6.0, z: -4.0, len: 11.4, delay: 0.04, cast: false });
    yield;
    // Nut wölbt sich als Sternenband über die rechte Hälfte
    const nut = ctx.prop('nut', { x: 6.0, z: -3.75, len: 11.3, delay: 0.1, cast: false });
    tapProp(nut, 'nut');
    yield;

    // ---------------------------------------------------------------- Götterreihe auf Sockeln (links)
    const gods = {};
    const sparkleAt = (a, id, n = 14) => {
      const p = a.popup.group.position;
      const col = GLOW_COL[id] || [1, 0.85, 0.5];
      for (let i = 0; i < Math.round(n * fxK()); i++) {
        const w = world(p.x + (Math.random() - 0.5) * 1.0, p.y + 0.6 + Math.random() * 1.7, p.z + 0.25);
        app.fx.glow.emit({ x: w.x, y: w.y, z: w.z, vx: (Math.random() - 0.5) * 0.4, vy: 0.3 + Math.random() * 0.5, vz: 0.1, life: 1.1 + Math.random() * 0.6, size: 0.1 + Math.random() * 0.1, alpha: 0.8, color: col, drag: 0.8 });
      }
    };
    const godWake = (id) => (a) => {
      a.tw.add(1.1, (k) => { const s = Math.sin(k * Math.PI); poseAmt(a.fig, 'armA', s); poseAmt(a.fig, 'armB', s * 0.7); a.hop = s * 0.07 * calmK(); }, { done: () => { a.hop = 0; poseAmt(a.fig, 'armA', 0.2); poseAmt(a.fig, 'armB', 0); } });
      sparkleAt(a, id);
    };
    const idleArms = (a, ph) => a.behaviors.push((dt, t) => { if (a.tw.list.length === 0) { poseAmt(a.fig, 'armA', 0.2 + 0.18 * Math.sin(t * 0.7 + ph) * calmK()); poseAmt(a.fig, 'armB', 0.1 + 0.1 * Math.sin(t * 0.5 + ph * 2) * calmK()); } });
    ROW.forEach(([id, x], i) => {
      ctx.flat(sockelPart(), { x, z: ROW_Z + 0.06, delay: 0.12 + i * 0.015, name: 'sockel' + i, border: 0.025, ppu: 130 });
      const last = id === 'osiris';
      const a = ctx.stand(id, { x, z: ROW_Z, y: SOCKEL_H - 0.02, h: GOD_H[id] * GOD_WS, facing: last ? -1 : 1, delay: 0.14 + i * 0.015 });
      if (last) a.setFacing(-1);
      a.onWake = godWake(id);
      if (id !== 'osiris') idleArms(a, i * 1.3);
      gods[id] = a;
    });
    yield;

    // ---------------------------------------------------------------- Mitte rechts: Tor, Waage, Anubis, Thot, Maat, Ammit
    const tor = ctx.prop('tor_unterwelt', { x: TOR.x, z: TOR.z, h: TOR.h, delay: 0.1, cast: false });
    tapProp(tor, 'tor_unterwelt');
    // Licht hinter den Flügeln (additiv): nur sichtbar, wenn das Tor offen ist
    const tf = tor.fig, tws = tf.worldScale;
    const opn = tf.anchors.oeffnung || new THREE.Vector3(0, 2 * tws, 0);
    const lightMat = new THREE.MeshBasicMaterial({ map: softTexture(), color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const lightPl = new THREE.Mesh(new THREE.PlaneGeometry(2.6 * tws * 1.1, 3.8 * tws * 0.95), lightMat); lightPl.position.set(opn.x, 2.05 * tws, 0.03); lightPl.renderOrder = 3;
    tf.group.add(lightPl);
    const floorMat = new THREE.MeshBasicMaterial({ map: softTexture(), color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const floorLight = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.6), floorMat); floorLight.rotation.x = -Math.PI / 2; floorLight.position.set(opn.x, 0.014, 1.5); floorLight.renderOrder = 2;
    tf.group.add(floorLight);
    // Sternchen im Durchgang
    const starTex = softTexture();
    const stars = [];
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: starTex, color: 0xcfe2ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.position.set(opn.x + (((i * 37) % 11) / 11 - 0.5) * 1.9 * tws, (0.7 + ((i * 53) % 13) / 13 * 2.7) * tws, 0.035); m.userData.ph = i * 1.7; m.renderOrder = 4; tf.group.add(m); stars.push(m);
    }

    const wp = ctx.prop('waage', { x: WG.x, z: WG.z, h: WG.h, delay: 0.16, cast: true });
    const wf = wp.fig, ws = wf.worldScale, A = wf.spec.anchors;
    // Herz und Feder liegen in den Schalen (Kind der jeweiligen Schale, folgt dem Pendeln)
    const putOn = (id, h, part, tellerKey, endKey, zOff) => {
      const f = ctx.fig(id, { h, thickness: 0.02, border: 0.02 });
      const cx = ((f.bbox.x0 + f.bbox.x1) / 2) * f.ws;
      f.group.position.set((A[tellerKey][0] - A[endKey][0]) * ws - cx, (A[tellerKey][1] - A[endKey][1]) * ws, zOff);
      wf.parts[part].add(f.group); ctx.R.own(f); return f;
    };
    const herzF = putOn('herz', 0.4, 'schale_herz', 'tellerHerz', 'endHerz', 0.07);
    const federF = putOn('feder_maat', 0.74, 'schale_feder', 'tellerFeder', 'endFeder', 0.07);
    tapProp(wp, 'waage');
    for (const m of herzF.hit) m.userData.tap = () => app.openCardById('herz');
    for (const m of federF.hit) m.userData.tap = () => app.openCardById('maat');
    wp.pickMeshes.push(...herzF.hit, ...federF.hit);

    const anubis = ctx.stand('anubis', { x: WG.x - 2.7, z: WG.z + 0.5, h: 2.3, facing: 1, delay: 0.2 });
    const thot = ctx.stand('thot', { x: WG.x + 2.4, z: WG.z + 0.5, h: 2.15, facing: -1, delay: 0.22 });
    thot.setFacing(-1);
    const maat = ctx.stand('maat', { x: 11.0, z: WG.z - 0.95, h: 2.2, facing: -1, delay: 0.24 });
    maat.setFacing(-1);
    const ammit = ctx.stand('ammit', { x: WG.x + 1.9, z: WG.z + 1.9, len: 2.0, facing: -1, delay: 0.26 });
    ammit.setFacing(-1);
    gods.anubis = anubis; gods.thot = thot; gods.maat = maat; gods.ammit = ammit;
    anubis.onWake = (a) => { shake(a); sparkleAt(a, 'anubis', 8); };
    thot.onWake = godWake('thot'); maat.onWake = godWake('maat');
    ammit.onWake = (a) => { curious(a); };
    idleArms(maat, 0.7);
    // Thot schreibt ab und zu (Hand mit Palette)
    thot.behaviors.push((dt, t) => { if (thot.tw.list.length === 0) { poseAmt(thot.fig, 'armA', 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.2)) * (S.thotBusy || 0.25) * calmK()); poseAmt(thot.fig, 'armB', 0.1); } });
    anubis.behaviors.push((dt, t) => { if (anubis.tw.list.length === 0) { poseAmt(anubis.fig, 'armA', 0.25 + 0.15 * Math.sin(t * 0.8) * calmK()); poseAmt(anubis.fig, 'armB', 0.1); } });
    // Ammit: Schwanzwedeln, Atmen, kleine Kopfdrehung
    ammit.behaviors.push((dt, t) => {
      if (ammit.tw.list.length === 0) { poseAmt(ammit.fig, 'tail', 0.5 + 0.5 * Math.sin(t * 2.1) * calmK()); poseAmt(ammit.fig, 'jaw', 0.05 + 0.05 * Math.sin(t * 0.9) * calmK()); ammit.fig.root.rotation.z = 0; ammit.fig.root.rotation.y = 0; }
    });
    function shake(a) {
      a.tw.add(1.6, (k) => {
        const s = Math.sin(k * 2 * TAU) * Math.sin(k * Math.PI) * 0.38 * calmK();
        a.fig.root.rotation.y = s; a.fig.root.rotation.z = -Math.abs(s) * 0.1;
        poseAmt(a.fig, 'armA', 0.3 + 0.5 * Math.sin(k * Math.PI));
      }, { done: () => { a.fig.root.rotation.y = 0; a.fig.root.rotation.z = 0; poseAmt(a.fig, 'armA', 0.2); } });
    }
    function curious(a) {
      a.tw.add(2.2, (k) => {
        const s = Math.sin(k * Math.PI), w = Math.sin(k * 3 * TAU) * s * 0.14 * calmK();
        a.fig.root.rotation.z = w; a.hop = s * 0.12 * calmK();
        poseAmt(a.fig, 'jaw', 0.15 + 0.2 * (0.5 + 0.5 * Math.sin(k * 6 * TAU)) * s); poseAmt(a.fig, 'tail', 0.5 + 0.5 * Math.sin(k * 7 * TAU));
      }, { done: () => { a.fig.root.rotation.z = 0; a.hop = 0; poseAmt(a.fig, 'jaw', 0); } });
      app.audio.voice('ammit');
    }
    yield;

    // ---------------------------------------------------------------- Feuerschalen (Fackelschimmer) beiderseits des Falzes
    const fires = [];
    for (const [fx, fz, ph] of [[-2.5, 1.1, 0], [2.7, 1.2, 2.1]]) {
      ctx.flat(brazierPart(), { x: fx, z: fz, ws: 1.3, delay: 0.2, name: 'schale' + fx, border: 0.03, ppu: 150 });
      const fl = ctx.flat(flamePart(), { x: fx, z: fz + 0.03, y: 1.09, ws: 1.3, delay: 0.24, name: 'flamme' + fx, border: 0.02, ppu: 130 });
      fl.cut.mesh.castShadow = false;
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), new THREE.MeshBasicMaterial({ map: softTexture(), color: 0xff9a40, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      gl.position.set(0, 0.65, 0.05); gl.renderOrder = 3; fl.add(gl);
      const fg = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 5.0), new THREE.MeshBasicMaterial({ map: softTexture(), color: 0xff8a30, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
      fg.rotation.x = -Math.PI / 2; fg.position.set(0, -1.09 + 0.012, 0.0); fg.renderOrder = 2; fl.add(fg);
      fires.push({ fl, gl, fg, ph });
    }
    ctx.onUpdate((dt, t) => {
      const fk = app.calm ? 0 : 1;
      for (const f of fires) {
        const w = fk * (Math.sin(t * 6.1 + f.ph) * 0.06 + Math.sin(t * 9.7 + f.ph * 2) * 0.03);
        f.fl.group.scale.set(1 - w * 0.5, 1 + w * 1.4, 1); f.fl.group.rotation.z = fk * Math.sin(t * 3.1 + f.ph) * 0.05;
        const q = 0.5 + fk * w * 1.2; f.gl.material.opacity = q; f.fg.material.opacity = 0.3 + fk * w * 0.9;
      }
    });
    yield;

    // ---------------------------------------------------------------- Sonnenbarke
    const barke = ctx.prop('sonnenbarke', { x: BARKE.x0, y: BARKE.y, z: BARKE.z, len: BARKE.len, delay: 0.3, cast: false });
    tapProp(barke, 'sonnenbarke');
    const bf = barke.fig;
    const bglow = sunGlow({ size: 3.4, color: 0xffc860 });
    const sch = bf.anchors.scheibe || new THREE.Vector3(0, 1.2, 0);
    bglow.position.set(sch.x, sch.y, 0.08); bf.root.add(bglow);
    S.barkeX = BARKE.x0;

    // ---------------------------------------------------------------- Käferchen: hinter dem Sockel der Waage
    const kaefer = ctx.stand('skarab5', { x: WG.x + 0.95, z: WG.z - 0.25, len: 0.78, facing: 1, delay: 0.5, hidden: true, hint: false, hitPad: 0.25 });
    kaefer.onWake = (a) => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.35; }, { done: () => { a.hop = 0; } }); app.audio.voice('skarabaeus'); };
    yield;

    // ---------------------------------------------------------------- Anzeige auf der Seite
    const stTex = {}, stMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
    const stMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 1.065), stMat);
    stMesh.rotation.x = -Math.PI / 2; stMesh.position.set(WG.x - 0.2, 0.016, 2.72); ctx.R.add(stMesh);
    const setState = (key) => {
      if (S.state === key) return; S.state = key;
      if (!stTex[key]) { const t = new THREE.CanvasTexture(stateCanvas(key)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; stTex[key] = t; ctx.R.textures.push(t); }
      stMat.map = stTex[key]; stMat.needsUpdate = true;
    };
    setState('even');

    // ---------------------------------------------------------------- Laschen
    const wCtl = ctx.control('R', { id: 'waage', label: 'WAAGE', a: [6.0, 3.75], b: [10.0, 3.75], size: [2.2, 0.95], color: '#2a5aa0', value: 0.5, springBack: false, hold: true, ticks: 4 });
    const tCtl = ctx.control('R', { id: 'tor', label: 'TOR', a: [1.4, 3.75], b: [3.0, 3.75], size: [1.5, 0.95], color: '#b8862d', value: 0, springBack: false, hold: true });
    const bCtl = ctx.control('L', { id: 'barke', label: 'BARKE', a: [-4.7, 3.8], b: [-1.4, 3.8], size: [1.9, 0.95], color: '#c8841f', value: 0, springBack: false, hold: true });
    S.wCtl = wCtl; S.tCtl = tCtl; S.bCtl = bCtl;

    // WAAGE: Federung des Balkens (leichtes Nachschwingen), Zustandswechsel lösen kleine Reaktionen aus
    const bal = new Spring(0, 24, 3.2); S.bal = bal;
    let wv = 0.5, zone = 'even', zoneCool = 0, sway = 0, lastTh = 0, tick = 0;
    const zoneOf = (v) => (v < 0.2 ? 'light' : v > 0.82 ? 'heavy' : Math.abs(v - 0.5) < 0.07 ? 'even' : 'mid');
    const react = (z) => {
      setState(z);
      if (z === 'heavy') { curious(ammit); shake(anubis); S.thotBusy = 0.1; app.audio.sfx('wood'); }
      else if (z === 'even') {
        S.thotBusy = 1;
        app.audio.sfx('chime');
        for (let i = 0; i < Math.round(16 * fxK()); i++) { const w = world(WG.x + (Math.random() - 0.5) * 2.4, WG.h * 0.55 + Math.random() * 1.1, WG.z + 0.3); glowAt(w.x, w.y, w.z, { vy: 0.3 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.4, life: 1.3 + Math.random(), size: 0.1 + Math.random() * 0.1 }); }
        poseAmt(maat.fig, 'armA', 0.9);
      } else if (z === 'light') {
        S.thotBusy = 0.6;
        for (let i = 0; i < Math.round(10 * fxK()); i++) { const w = world(WG.x - 0.9 + (Math.random() - 0.5) * 0.6, WG.h * 0.7 + Math.random() * 0.8, WG.z + 0.3); glowAt(w.x, w.y, w.z, { life: 1.2, color: [0.8, 0.9, 1], size: 0.1 }); }
      } else S.thotBusy = 0.25;
    };
    wCtl.on((v) => {
      wv = v; bal.set((v - 0.5) * 0.8);
      app.audio.ctl('scale', v);
      const z = zoneOf(v);
      if (z !== zone) { zone = z; if (zoneCool <= 0 && ctx.spread.active) { zoneCool = 1.2; react(z); } else setState(z); }
    });
    wCtl.onGrab = () => app.audio.sfx('grab'); wCtl.onTick = (v) => app.audio.sfx('scale', { v }); wCtl.onRelease = () => app.audio.sfx('snap');
    ctx.onUpdate((dt, t) => {
      zoneCool = Math.max(0, zoneCool - dt);
      const th = bal.update(dt);
      const vel = (th - lastTh) / Math.max(dt, 1e-3); lastTh = th;
      sway += (clamp(-vel * 0.09, -0.16, 0.16) - sway) * Math.min(1, dt * 8);
      waageSet(wf, th, { sway: sway * calmK() });
    });

    // TOR: Flügel öffnen, Licht und Sternenband werden sichtbar
    tCtl.on((v) => {
      const k = smooth(clamp(v)); S.door = k;
      torOeffnen(tf, k);
      lightMat.opacity = 1.0 * k * (app.calm ? 0.6 : 1); floorMat.opacity = 0.55 * k * (app.calm ? 0.6 : 1);
      app.audio.ctl('door', v);
    });
    tCtl.onGrab = () => app.audio.sfx('grab'); tCtl.onTick = (v) => app.audio.sfx('door', { v }); tCtl.onRelease = () => app.audio.sfx('snap');
    ctx.onUpdate((dt, t) => {
      const k = S.door || 0;
      for (const m of stars) { const tw = 0.55 + 0.45 * Math.sin(t * (app.calm ? 0.5 : 1.3) + m.userData.ph); m.material.opacity = k * tw * 0.95; m.visible = k > 0.02; }
      lightPl.visible = floorLight.visible = k > 0.01;
    });

    // BARKE: fährt von links nach rechts durch die obere Bildhälfte, Sonne glüht
    bCtl.on((v) => {
      S.barkeX = lerp(BARKE.x0, BARKE.x1, v); S.barkeV = v;
      barke.group.position.x = S.barkeX;
    });
    bCtl.onGrab = () => app.audio.sfx('grab'); bCtl.onTick = (v) => app.audio.sfx('oar', { v }); bCtl.onRelease = () => app.audio.sfx('snap');
    let lastBx = S.barkeX, trailT = 0;
    ctx.onUpdate((dt, t) => {
      const sp = (S.barkeX - lastBx) / Math.max(dt, 1e-3); lastBx = S.barkeX;
      barke.group.position.y = BARKE.y + Math.sin(t * 1.4 + S.barkeX * 0.6) * 0.07 * calmK();
      barke.pivot.rotation.z = Math.sin(t * 1.1 + S.barkeX * 0.5) * 0.03 * calmK() + clamp(sp * 0.004, -0.04, 0.04);
      poseAmt(bf, 'ruder', 0.5 + 0.5 * Math.sin(t * 1.8 + S.barkeX));
      bglow.userData.update(t, calmK() * 0.5 + 0.5);
      if (ctx.spread.active && Math.abs(sp) > 0.3) {
        trailT += dt * Math.min(Math.abs(sp), 6) * 4 * fxK();
        while (trailT > 1) { trailT -= 1; const w = world(S.barkeX - Math.sign(sp) * (0.9 + Math.random() * 0.7), BARKE.y + 0.5 + Math.random() * 1.0, BARKE.z + 0.15); glowAt(w.x, w.y, w.z, { vx: -Math.sign(sp) * 0.3, vy: 0.1 + Math.random() * 0.3, life: 1.2, size: 0.1 + Math.random() * 0.12, color: [1, 0.82, 0.4], alpha: 0.7 }); }
      }
    });
    // leises Funkeln am Sonnenschein der Waage-Szene (nur im ruhigen Dauerbetrieb, wenig)
    yield;
  },

  onActivate(ctx) {
    const S = this.S; if (!S) return;
    S.wCtl && S.wCtl.setValue(0.5, { snap: true });
    S.bal && S.bal.snap(0);
  },
  onDeactivate(ctx) {
    const S = this.S; if (!S) return;
    for (const c of [S.wCtl, S.tCtl, S.bCtl]) c && c.setValue(c.id === 'waage' ? 0.5 : 0, { snap: true });
    if (S.bal) S.bal.snap(0);
    S.thotBusy = 0.25; S.state = null;
  },
};
