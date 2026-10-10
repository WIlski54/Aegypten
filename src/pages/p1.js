// Station 1: Das Geschenk des Nil (vor ca. 3100 v. Chr.). FLUT!-Schieber, NILOMETER-Klappe, SCHÖPFEN-Faden.
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { textCard, printLabel, SERIF, blotches, speckles, grassTufts, pebbles } from '../engine/pagepaint.js';
import { PAGES_DE } from '../data/pages.de.js';
import { poseAmt } from '../engine/popup.js';
import { sunGlow } from '../engine/effects.js';
import { lerp, clamp, smooth, TAU, mulberry32 } from '../engine/util.js';
import { panelPart, softLight, dither } from './common.js';
import {
  fxRate, ramp, RipplePool, makeFloodSheet, signPart, doorOutsideTex, doorInsideTex, DOOR_ZONES,
  makeShaftWater, shaftWaterTex, makePointer, makeDoorCard,
} from './_eg_p1_kit.js';

const IDX = 1;

// ---- Landschaftsformen auf der Seite (globale x, Tiefe z) -----------------------------------------------------------
const RB = (x) => -1.38 + 0.07 * Math.sin(x * 0.9) + 0.05 * Math.sin(x * 2.1 + 1);        // Fluss: hinteres Ufer
const RF = (x) => -0.3 + 0.09 * Math.sin(x * 0.7 + 2) + 0.05 * Math.sin(x * 1.7);         // Fluss: vorderes Ufer
const BL = (x) => 3.05 + 0.16 * Math.sin(x * 0.55) + 0.1 * Math.sin(x * 1.4 + 1);         // Schwarzes Land: vordere Kante

function paintLand(ctx, m, x0, x1) {
  const S = m.S;
  const path = (fa, fb, fillStyle) => {
    ctx.beginPath();
    for (let x = x0 - 0.2; x <= x1 + 0.2; x += 0.15) { const [X, Y] = m.pt(x, fa(x)); if (x <= x0 - 0.19) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    for (let x = x1 + 0.2; x >= x0 - 0.2; x -= 0.15) { const [X, Y] = m.pt(x, fb(x)); ctx.lineTo(X, Y); }
    ctx.closePath(); if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill(); }
  };
  // Rotes Land hinter dem Fluss: Windrippeln
  ctx.strokeStyle = 'rgba(150,100,40,.22)'; ctx.lineWidth = Math.max(1, 0.02 * S); ctx.lineCap = 'round';
  const r0 = mulberry32(x0 > 0 ? 11 : 7);
  for (let i = 0; i < 40; i++) { const x = x0 + r0() * (x1 - x0), z = -4 + r0() * 2.3, L = 0.5 + r0() * 0.9; ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z)); ctx.quadraticCurveTo(m.x(x + L * 0.5), m.z(z - 0.06), m.x(x + L), m.z(z)); ctx.stroke(); }
  // Uferschlamm + Fluss
  path((x) => RB(x) - 0.12, (x) => RF(x) + 0.14, '#8a7a4a');
  const gr = ctx.createLinearGradient(0, m.z(-1.4), 0, m.z(-0.25)); gr.addColorStop(0, '#2f7f84'); gr.addColorStop(0.5, '#4aa6a2'); gr.addColorStop(1, '#6cc4b8');
  path(RB, RF, gr);
  ctx.save(); path(RB, RF, null); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = Math.max(1.4, 0.026 * S);
  const r1 = mulberry32(x0 > 0 ? 21 : 17);
  for (let row = 0; row < 3; row++) { let x = x0 + r1() * 0.8; while (x < x1) { const L = 0.35 + r1() * 0.4, z = -1.05 + row * 0.27 + r1() * 0.05; ctx.beginPath(); ctx.moveTo(m.x(x), m.z(z)); ctx.quadraticCurveTo(m.x(x + L * 0.25), m.z(z - 0.04), m.x(x + L * 0.5), m.z(z)); ctx.quadraticCurveTo(m.x(x + L * 0.75), m.z(z + 0.04), m.x(x + L), m.z(z)); ctx.stroke(); x += L + 0.5 + r1() * 1.1; } }
  ctx.restore();
  // heller Saum am vorderen Ufer
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = Math.max(1.5, 0.04 * S); ctx.beginPath();
  for (let x = x0 - 0.2; x <= x1 + 0.2; x += 0.15) { const [X, Y] = m.pt(x, RF(x) - 0.01); if (x <= x0 - 0.19) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke();
  // Schwarzes Land: dunkler Nilschlamm mit Furchen
  const sg = ctx.createLinearGradient(0, m.z(-0.2), 0, m.z(3.1)); sg.addColorStop(0, '#4a3a22'); sg.addColorStop(0.5, '#5a4630'); sg.addColorStop(1, '#4b3a28');
  path((x) => RF(x) + 0.1, BL, sg);
  ctx.save(); path((x) => RF(x) + 0.1, BL, null); ctx.clip();
  const r2 = mulberry32(x0 > 0 ? 31 : 27);
  ctx.fillStyle = 'rgba(25,15,8,.28)'; for (let i = 0; i < 160; i++) { ctx.beginPath(); ctx.ellipse(m.x(x0 + r2() * (x1 - x0)), m.z(r2() * 3.3), (0.03 + r2() * 0.06) * S, (0.02 + r2() * 0.03) * S, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(170,130,90,.22)'; for (let i = 0; i < 110; i++) { ctx.beginPath(); ctx.ellipse(m.x(x0 + r2() * (x1 - x0)), m.z(r2() * 3.3), (0.025 + r2() * 0.05) * S, (0.015 + r2() * 0.025) * S, 0, 0, TAU); ctx.fill(); }
  ctx.lineWidth = Math.max(1.2, 0.02 * S);
  for (let k = 0; k < 5; k++) { ctx.strokeStyle = k % 2 ? 'rgba(20,10,4,.35)' : 'rgba(180,140,100,.25)'; ctx.beginPath(); for (let x = x0 - 0.2; x <= x1 + 0.2; x += 0.3) { const z = 0.45 + k * 0.5 + 0.06 * Math.sin(x * 1.3 + k); const [X, Y] = m.pt(x, z); if (x <= x0 - 0.19) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke(); }
  ctx.restore();
  // grüner Uferstreifen (Gras direkt am Fluss) und feine Kante zum Sand
  grassTufts({ ctx, S, x: m.x, z: m.z }, { x0: x0 + 0.2, x1: x1 - 0.2, z0: -0.05, z1: 0.3, n: 26, seed: x0 > 0 ? 5 : 3, color: '#5f9a46', h: 0.3 });
  ctx.strokeStyle = 'rgba(110,80,35,.45)'; ctx.lineWidth = Math.max(1.2, 0.025 * S); ctx.beginPath();
  for (let x = x0 - 0.2; x <= x1 + 0.2; x += 0.15) { const [X, Y] = m.pt(x, BL(x)); if (x <= x0 - 0.19) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke();
}

// ---- Felder: drei Wachstumsstufen je Streifen, der FLUT!-Wert wählt die Stufe (rückwärts spulbar) -----------------------
const FIELD_STAGES = [0.0, 0.5, 1.0];
function fieldLook(v) {
  if (v > 0.72) return { idx: 0, sy: 1, tint: 0 };
  if (v > 0.4) return { idx: 1, sy: lerp(1, 0.4, ramp(v, 0.4, 0.72)), tint: 0 };
  return { idx: 2, sy: lerp(1, 0.9, ramp(v, 0.15, 0.4)), tint: 0 };
}

// Schleierwolken und ferne Vögel (Zierde auf der Himmelswand)
function skyExtras(c, bb, seed) {
  const { ctx, tf, S } = c; const r = mulberry32(seed);
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  for (let i = 0; i < 6; i++) { const [X, Y] = tf(bb.x0 + r() * bb.w, bb.y0 + bb.h * (0.5 + r() * 0.4)); ctx.beginPath(); ctx.ellipse(X, Y, (0.7 + r() * 1.3) * S, (0.05 + r() * 0.05) * S, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(70,50,30,.55)'; ctx.lineWidth = Math.max(1.2, 0.03 * S); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 5; i++) { const [X, Y] = tf(bb.x0 + 1 + r() * (bb.w - 2), bb.y0 + bb.h * (0.45 + r() * 0.4)), w = (0.12 + r() * 0.08) * S; ctx.beginPath(); ctx.moveTo(X - w, Y - w * 0.3); ctx.quadraticCurveTo(X - w * 0.4, Y - w * 0.5, X, Y); ctx.quadraticCurveTo(X + w * 0.4, Y - w * 0.5, X + w, Y - w * 0.3); ctx.stroke(); }
}

export default {
  id: 'nil',
  mood: mood({ key: '#ffeccb', keyI: 2.3, sky: '#f7f0d4', gnd: '#6f7f4a', hemiI: 1.85, pos: [-12, 19, 10] }),
  motes: { colors: [[1, 0.92, 0.62], [0.9, 1, 0.72], [1, 0.97, 0.85]], size: 0.06, alpha: 0.42, dy: 0.07, dx: 0.1, tw: 1.2, density: 0.65 },
  atmo: 'nil',
  base() {
    const d = PAGES_DE[IDX];
    return {
      L: {
        ground: { back: '#ead59c', front: '#d9bd7e' }, margin: 0.3, pageNo: 2 * IDX + 1, seed: 11,
        draw(ctx, m) {
          paintLand(ctx, m, -12, 0);
          textCard(m, { x: -11.6, z: 0.42, w: 6.35, h: 3.12, kicker: d.kicker, title: d.title, sub: d.years, body: d.card, size: 0.31, titleSize: 0.42, tilt: -0.012 });
        },
      },
      R: {
        ground: { back: '#ead59c', front: '#d9bd7e' }, margin: 0.3, pageNo: 2 * IDX + 2, seed: 12,
        draw(ctx, m) {
          paintLand(ctx, m, 0, 12);
          // kleine Bucht für den Schaduf
          ctx.save(); const bx = 10.35, bz = -0.05;
          const bg = ctx.createRadialGradient(m.x(bx), m.z(bz), 0, m.x(bx), m.z(bz), 1.2 * m.S); bg.addColorStop(0, '#5db3ac'); bg.addColorStop(0.75, '#3f9a9a'); bg.addColorStop(1, '#2f7f84');
          ctx.fillStyle = '#8a7a4a'; ctx.beginPath(); ctx.ellipse(m.x(bx), m.z(bz), 1.28 * m.S, 0.74 * m.S, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(m.x(bx), m.z(bz), 1.14 * m.S, 0.62 * m.S, 0, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = Math.max(1.2, 0.024 * m.S);
          for (const [dx, dz] of [[-0.4, -0.1], [0.3, 0.15], [0.1, -0.3]]) { ctx.beginPath(); ctx.moveTo(m.x(bx + dx), m.z(bz + dz)); ctx.quadraticCurveTo(m.x(bx + dx + 0.12), m.z(bz + dz - 0.04), m.x(bx + dx + 0.25), m.z(bz + dz)); ctx.stroke(); }
          ctx.restore();
          printLabel(m, 'Das Schwarze Land · Kemet', 5.2, 3.0, { size: 0.21, color: 'rgba(235,215,170,.85)', italic: true, bold: false });
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app;
    const L = ctx.L, R = ctx.R;
    const S1 = (ctx.spread.p1 = {});
    const taps = [];                                   // Meshes, die beim Verlassen aufgeräumt werden müssen (nur Platzhalter)
    const tapProp = (pop, fn) => { if (!pop || !pop.fig) return; pop.pickMeshes = pop.fig.hit.slice(); for (const m of pop.fig.hit) m.userData.tap = fn; };
    const card = (id) => () => app.openCardById(id);

    // ================================================================ Kulisse: Himmel, Wüste (Rotes Land)
    for (const s of ['L', 'R']) {
      const x0 = s === 'L' ? -11.75 : 0.2, x1 = s === 'L' ? -0.2 : 11.75;
      ctx.flat(panelPart(x0, x1, 5.0, { fill: { top: '#7ec4d6', bottom: '#fdeec6' }, wave: 0.26, freq: 3, phase: s === 'L' ? 0.6 : 2.2, seed: s === 'L' ? 3 : 6, deco: (c, bb) => { softLight(c, bb, { color: 'rgba(255,238,170,.6)', cx: s === 'L' ? 0.3 : 0.7, cy: 0.45, r: 0.7 }); dither(c, bb, '#fff', { n: 90, alpha: 0.12, size: 0.04 }); skyExtras(c, bb, s === 'L' ? 5 : 9); } }), { z: -4.05, lean: -0.05, name: 'sky' + s, delay: 0, ppu: 70, border: 0.04 });
    }
    yield;
    const sun = ctx.prop('sun_disc', { x: 7.4, y: 2.9, z: -3.9, h: 1.3, delay: 0.1, cast: false });
    const glow = sunGlow({ size: 6, color: 0xffd27a, opacity: 0.7 }); glow.position.set(0, 0.65, -0.06); sun.add(glow); glow.scale.setScalar(0.6);
    ctx.onUpdate((dt, t) => glow.userData.update(t));
    ctx.prop('wuestenduene', { x: -6, z: -3.05, len: 11.6, delay: 0.06, variant: { seed: 1 } });
    ctx.prop('wuestenduene', { x: 6, z: -3.05, len: 11.6, delay: 0.06, variant: { seed: 2 } });
    ctx.prop('acacia', { x: -10.3, z: -2.7, h: 2.3, delay: 0.14 });
    ctx.prop('acacia', { x: 9.6, z: -2.75, h: 2.0, delay: 0.14, facing: -1 });
    ctx.prop('boulder', { x: 3.9, z: -2.6, len: 1.0, delay: 0.16, variant: { seed: 3 } });
    // Schild: Rotes Land
    const signR = ctx.flat(signPart(1.7, 'Das Rote Land', 'Deschret · Wüste', { post: 1.15 }), { x: -4.9, z: -2.05, delay: 0.2, name: 'signRot', ppu: 140 });
    signR.cut.mesh.userData.tap = card('schwarzes_land'); signR.pickMeshes = [signR.cut.mesh];
    yield;

    // ================================================================ Palmen und Pflanzen
    ctx.prop('dattelpalme', { x: -11.0, z: -2.1, h: 3.9, delay: 0.24 });
    ctx.prop('dattelpalme', { x: 11.0, z: -1.9, h: 3.8, delay: 0.26, facing: -1 });
    ctx.prop('palm', { x: 7.0, z: -2.5, h: 3.0, delay: 0.28 });
    ctx.prop('dattelpalme', { x: -0.9, z: -2.3, h: 3.2, delay: 0.3, facing: -1 });
    const pap = [];
    for (const [x, h, sd] of [[-10.2, 2.5, 1], [-9.1, 2.0, 2], [-8.0, 2.6, 3]]) pap.push(ctx.prop('papyrus', { x, z: -1.85, h, delay: 0.3 + sd * 0.02, variant: { seed: sd } }));
    for (const p of pap) tapProp(p, card('papyrus'));
    ctx.prop('reeds', { x: -5.5, z: -1.7, h: 1.4, delay: 0.34 });
    ctx.prop('reeds', { x: 5.4, z: -1.65, h: 1.2, delay: 0.34, facing: -1 });
    const lotus = [ctx.prop('lotus', { x: -9.7, z: -0.45, len: 1.7, delay: 0.4 }), ctx.prop('lotus', { x: -5.4, z: -0.48, len: 1.5, delay: 0.42, variant: { seed: 2 } })];
    yield;

    // ================================================================ Wasser: zwei Streifen (hinten dunkel, vorn hell), Wellen, Flutdecke
    const waterBack = [], waterFront = [];
    for (const [x, ph] of [[-6, 0], [6, 1]]) {
      waterBack.push(ctx.prop('nil_wasser', { x, z: -1.5, len: 11.4, delay: 0.18, variant: { tone: 'dunkel', seed: 3 + ph } }));
      waterFront.push(ctx.prop('nil_wasser', { x, z: -0.7, len: 11.4, delay: 0.22, variant: { tone: 'hell', seed: 1 + ph } }));
    }
    const waterTap = () => { app.audio.sfx('splash'); S1.ripples.R.emit(4 + Math.random() * 3, -0.45, 1.0, 1.7); app.openCardById('nilflut'); };
    for (const w of [...waterFront, ...waterBack]) { w.pickMeshes = w.fig.hit.slice(); for (const mm of w.fig.hit) mm.userData.tap = waterTap; }
    const ripL = new RipplePool(L, { n: 8 }), ripR = new RipplePool(R, { n: 8 });
    S1.ripples = { L: ripL, R: ripR };
    const sheetL = makeFloodSheet(L, { x0: -11.7, x1: -0.3, z0: RF(-6) + 0.02 });
    const sheetR = makeFloodSheet(R, { x0: 0.3, x1: 11.7, z0: RF(6) + 0.02 });
    yield;

    // ================================================================ Felder (Schwarzes Land), Bauer
    const FIELDS = [{ x: 3.4, z: 0.9, seed: 1 }, { x: 8.2, z: 1.8, seed: 2 }].map((fd, fi) => ({
      fd,
      pops: FIELD_STAGES.map((st, i) => {
        const pop = ctx.prop('feld_getreide', { x: fd.x, z: fd.z, len: 4.8, delay: 0.3 + fi * 0.04, variant: { stage: st, seed: fd.seed, h: 0.85 } });
        pop.pivot.visible = i === 2;
        for (const mm of pop.fig.hit) mm.userData.tap = card('schwarzes_land');
        pop.pickMeshes = i === 2 ? pop.fig.hit.slice() : [];
        return pop;
      }),
    }));
    const bauer = ctx.stand('bauer', { x: 5.3, z: 2.35, h: 1.5, facing: 1, delay: 0.4 });
    bauer.setFacing(1);
    bauer.onWake = (a) => { S1.bauerBoost = 1; app.audio.sfx('tapp'); };
    yield;

    // ================================================================ Tiere im und am Wasser
    const hippo = ctx.stand('nilpferd', { x: 3.3, z: -1.1, len: 2.7, facing: -1, delay: 0.34 });
    hippo.setFacing(-1);
    hippo.onWake = (a) => { S1.gape = 1; app.audio.sfx('splash'); S1.ripples.R.emit(a.popup.group.position.x, -0.5, 1.1, 1.8); };
    const croc = ctx.stand('krokodil', { x: 6.9, z: -0.15, len: 2.7, facing: -1, delay: 0.36 });
    croc.setFacing(-1);
    croc.onWake = (a) => { S1.snap = 1; };
    const ibis = ctx.stand('ibis', { x: -4.4, z: -0.1, len: 1.1, facing: -1, delay: 0.38 });
    ibis.setFacing(-1);
    ibis.onWake = (a) => { a.tw.add(1.1, (k) => { poseAmt(a.fig, 'neck', Math.sin(k * Math.PI)); a.hop = Math.sin(k * Math.PI) * 0.1; }, { done: () => { a.hop = 0; } }); };
    const reiher = ctx.stand('reiher', { x: -11.0, z: -0.9, h: 1.25, facing: 1, delay: 0.4, card: null });
    reiher.onWake = (a) => { a.tw.add(0.9, (k) => { poseAmt(a.fig, 'neck', Math.sin(k * Math.PI)); a.hop = Math.sin(k * Math.PI) * 0.12; }, { done: () => { a.hop = 0; } }); };
    const geese = [[-8.9, 0.1, 1], [-8.2, 0.2, -1]].map(([x, z, f], i) => { const g = ctx.stand('wasservogel', { x, z, len: 0.6, facing: f, delay: 0.4 + i * 0.02, card: null, hint: false }); g.setFacing(f); g.onWake = (a) => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.25; poseAmt(a.fig, 'neck', Math.sin(k * Math.PI * 2) * 0.6); }, { done: () => { a.hop = 0; } }); }; return g; });
    const fisch = ctx.stand('fisch', { x: 5.0, z: -1.05, len: 0.8, facing: 1, delay: 0.4, card: null, hint: false });
    fisch.popup.pivot.visible = false;
    yield;

    // ================================================================ Boot mit Fischer (links)
    const boat = ctx.prop('schilfboot', { x: -6.9, z: -1.05, len: 3.0, delay: 0.38 });
    const bf = boat.fig, bws = bf.ws, bmx = (bf.bbox.x0 + bf.bbox.x1) / 2;
    const fisher = ctx.stand('fischer', { x: -6.9, z: -1.0, h: 1.7, facing: 1, delay: 0.42 });
    {
      const ff = fisher.fig, fa = ff.spec.anchors.foot, fmx = (ff.bbox.x0 + ff.bbox.x1) / 2;
      fisher.popup.group.position.x = boat.group.position.x + (bf.spec.anchors.stand[0] - bmx) * bws - (fa[0] - fmx / 1) * ff.ws + 0.1;
      S1.deckY = bf.spec.anchors.stand[1] * bws;
    }
    const net = ctx.prop('netz', { x: -6.0, z: -0.95, len: 0.8, delay: 0.5 });
    net.pivot.visible = false;
    fisher.onWake = (a) => { if (S1.net < 0) S1.net = 0; app.audio.sfx('swing'); };
    S1.net = -1;
    yield;

    // ================================================================ Schaduf (rechts am Ufer) + Nilometer (links vorn)
    const sch = ctx.prop('schaduf', { x: 9.0, z: -0.1, h: 2.5, delay: 0.32 });
    const sf = sch.fig, sws = sf.ws;
    const armPv = sf.spec.parts.arm.pivot, tipA = sf.spec.anchors.tip, eimerPv = sf.spec.parts.eimer.pivot, eimerRest = sf.spec.anchors.eimerRuhe;
    const setArm = (a) => {
      sf.rotatePart('arm', a);
      const dx = tipA[0] - armPv[0], dy = tipA[1] - armPv[1], c = Math.cos(a), s = Math.sin(a);
      const g = sf.parts.eimer; g.position.x = (armPv[0] + dx * c - dy * s) * sws; g.position.y = (armPv[1] + dx * s + dy * c) * sws;
    };
    S1.setArm = setArm; S1.schadufTap = 0;
    tapProp(sch, () => { S1.schadufTap = 1; app.openCardById('schaduf'); });

    const nilo = ctx.prop('nilometer', { x: -2.3, z: -0.3, h: 2.6, delay: 0.3 });
    const nf = nilo.fig, nws = nf.ws, nmx = (nf.bbox.x0 + nf.bbox.x1) / 2, K = 1.0169 * nws;
    // Wasser im Schacht (Säulen unter der Stufenkante) + Zeiger
    const shaftTex = shaftWaterTex();
    const floorFn = (xo) => (xo < 1.0 ? 0.88 : Math.max(0.88, 0.62 + 0.2311 * Math.floor((xo - 1.0) / 0.1)));
    const toLoc = (xo, yo) => [(xo - 1.2) * K, yo * K];
    // Säulenbreite in lokalen Einheiten
    const sw = makeShaftWater((0.92 - 1.2) * K, (1.9 - 1.2) * K, (xl) => floorFn(xl / K + 1.2) * K, 10, shaftTex);
    sw.mesh.position.z = 0.02; nilo.add(sw.mesh); S1.sw = sw; S1.nilo = nilo;
    const ptr = makePointer(0.2); ptr.position.set((0.92 - 1.2) * K, 0, 0.045); nilo.add(ptr);
    // Klappe (Tür): unten gelenkt, klappt nach vorn auf die Seite
    const DW = 1.25, DH = 2.3;
    const door = makeDoorCard(DW, DH, doorInsideTex(DW, DH), doorOutsideTex(DW, DH), 0.05);
    for (const mm of [door.userData.top, door.userData.bottom]) { mm.material.map.colorSpace = THREE.SRGBColorSpace; mm.material.map.anisotropy = 4; }
    const hinge = new THREE.Group(); hinge.position.set(0, 0.0, 0.07); hinge.add(door); nilo.add(hinge);
    // laufender Pfeil auf der Innenseite der Klappe
    const mk = new THREE.Mesh(new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-0.16, 0.1); sh.lineTo(-0.16, -0.1); sh.closePath(); return sh; })()), new THREE.MeshBasicMaterial({ color: 0xc0392b, side: THREE.DoubleSide }));
    mk.rotation.x = -Math.PI / 2; mk.position.set(-DW / 2 + 0.17, 0.056, 0.9); door.add(mk);
    S1.doorOpen = 0; S1.doorTarget = 0; S1.doorCool = 0;
    const toggleDoor = () => {
      S1.doorTarget = S1.doorTarget ? 0 : 1; app.audio.sfx(S1.doorTarget ? 'flapOpen' : 'flapClose');
      if (S1.doorTarget) setTimeout(() => { if (S1.doorTarget && ctx.spread.active) app.openCardById('nilometer'); }, 520);
    };
    const niloTap = () => { if (S1.doorTarget && S1.doorOpen > 0.9) app.openCardById('nilometer'); else toggleDoor(); };
    nilo.pickMeshes = [...nf.hit, ...door.userData.hit];
    for (const mm of nf.hit) mm.userData.tap = niloTap;
    door.userData.top.userData.tap = toggleDoor; door.userData.bottom.userData.tap = toggleDoor; door.userData.hit[2].userData.tap = toggleDoor;
    yield;

    // ================================================================ verstecktes Käferchen im Schilf (hinter den Papyrus-Stauden)
    const kaefer = ctx.stand('skarab2', { x: -9.55, z: -1.35, len: 0.95, facing: 1, delay: 0.5, hidden: true, hint: false, hitPad: 0.25 });
    kaefer.onWake = (a) => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.35; }, { done: () => { a.hop = 0; } }); app.audio.voice('skarabaeus'); };
    const cover = ctx.prop('reeds', { x: -9.5, z: -1.15, h: 1.1, delay: 0.52, variant: { seed: 4 } });
    kaefer.cover = cover;
    yield;

    // ================================================================ Laschen
    const flut = ctx.control('R', { id: 'flut', label: 'FLUT!', a: [1.7, 3.75], b: [5.0, 3.75], size: [1.9, 0.95], color: '#2a7aa0', value: 0, springBack: false, hold: true });
    const schoep = ctx.control('R', { id: 'schoepfen', label: 'SCHÖPFEN', a: [7.6, 3.75], b: [9.5, 3.75], size: [2.3, 0.95], color: '#b8862d', value: 0, springBack: true });
    S1.flut = flut; S1.schoep = schoep;
    flut.onGrab = () => app.audio.sfx('grab'); flut.onTick = (v) => app.audio.sfx('slide', { v }); flut.onRelease = () => app.audio.sfx('snap');
    schoep.onGrab = () => app.audio.sfx('grab'); schoep.onTick = (v) => app.audio.sfx('slide', { v }); schoep.onRelease = () => app.audio.sfx('snap');

    // ================================================================ Zustand aus den Laschenwerten
    const st = { v: 0, lastAudio: -1, boatY: 0, hippoLift: 0, crocZ: -0.15, crocDist: 0, bauerPh: 0 };
    S1.gape = 0; S1.snap = 0; S1.bauerBoost = 0;
    const nilL = RF(-6), nilR = RF(6);
    const applyFlood = (v) => {
      st.v = v;
      const kb = lerp(0.6, 1.25, v), kf = lerp(0.5, 1.4, v);
      for (const w of waterBack) w.pivot.scale.y = kb;
      for (const w of waterFront) w.pivot.scale.y = kf;
      // Flutdecke: Vorderkante läuft über das Schwarze Land
      const reach = smooth(ramp(v, 0.15, 1));
      sheetR.set(reach * (2.65 - nilR)); sheetL.set(reach * (0.38 - nilL));
      // Felder
      const look = fieldLook(v);
      for (const f of FIELDS) f.pops.forEach((pop, i) => {
        const on = i === look.idx; pop.pivot.visible = on; pop.pickMeshes = on ? pop.fig.hit.slice() : [];
        pop.pivot.scale.y = on ? look.sy : 1;
      });
      // Tiere rücken mit
      st.hippoLift = 0.32 * smooth(ramp(v, 0.15, 0.95));
      st.crocZ = lerp(-0.12, -0.95, smooth(ramp(v, 0.3, 0.78)));
      st.boatY = 0.72 * smooth(ramp(v, 0.05, 0.95));
      // Nilometer: Wasserstand + Zeiger
      const Lo = 0.88 + v * 1.62; const [, ly] = toLoc(0, Lo);
      sw.setLevel(ly); ptr.position.y = ly;
      if (Math.abs(v - st.lastAudio) > 0.004) { st.lastAudio = v; app.audio.ctl('flood', v); }
    };
    flut.on((v) => applyFlood(v));
    applyFlood(0); setArm(0);

    // ================================================================ pro Frame
    const tmpV = new THREE.Vector3();
    let dripT = 0, fishT = 4, fishK = -1, fishX = 0, rippleT = 1, bauerPrev = 0, dipSfx = false;
    ctx.onUpdate((dt, t) => {
      if (!ctx.spread.active) return;
      const calm = app.calm ? 0.5 : 1, rate = fxRate(app);
      const v = st.v;
      // Wasser: sanftes Wiegen der Streifen
      waterFront[0].group.position.x = -6 + Math.sin(t * 0.55) * 0.12 * calm; waterFront[1].group.position.x = 6 + Math.sin(t * 0.5 + 1) * 0.12 * calm;
      waterBack[0].group.position.x = -6 + Math.sin(t * 0.4 + 2) * 0.18 * calm; waterBack[1].group.position.x = 6 + Math.sin(t * 0.43 + 3) * 0.18 * calm;
      sheetL.flow(dt); sheetR.flow(dt);
      // Flut hebt/senkt Boot, Fischer, Nilpferd
      const bob = Math.sin(t * 1.3) * 0.03 * calm;
      boat.group.position.y = st.boatY + bob; fisher.popup.group.position.y = st.boatY + S1.deckY + bob;
      boat.pivot.rotation.z = Math.sin(t * 0.9) * 0.012 * calm; fisher.popup.pivot.rotation.z = Math.sin(t * 0.9) * 0.012 * calm;
      hippo.popup.group.position.y = st.hippoLift + Math.sin(t * 0.8 + 1) * 0.02 * calm;
      // Nilpferd: gelegentliches Gähnen
      S1.gape = Math.max(0, S1.gape - dt * 0.7);
      if (hippo.tw.list.length === 0) { const c = (t + 3) % 12; const g = c < 2.2 ? Math.sin((c / 2.2) * Math.PI) * 0.7 : 0; poseAmt(hippo.fig, 'jaw', Math.max(g, S1.gape > 0 ? Math.sin(Math.min(1, (1 - S1.gape)) * Math.PI) * 1.0 : 0)); }
      // Krokodil: gleitet bei Flut ins Wasser (Beine laufen mit), sonst sonnt es sich mit leicht offenem Maul
      const cp = croc.popup.group.position; const dz = st.crocZ - cp.z; cp.z = st.crocZ;
      const moving = Math.abs(dz) > 0.0006;
      if (moving) { st.crocDist += Math.abs(dz); const ph = st.crocDist * 9; const sw0 = croc.fig.meta.swing || {}; const gait = croc.fig.meta.gait || [['legB', 'armB'], ['legA', 'armA']]; gait.forEach((pair, gi) => { for (const p of pair) { const r = sw0[p] || [-0.3, 0.3]; croc.fig.rotatePart(p, lerp(r[0], r[1], 0.5 + 0.5 * Math.sin(ph + gi * Math.PI))); } }); }
      else for (const p of ['legA', 'legB', 'armA', 'armB']) croc.fig.rotatePart(p, 0);
      S1.snap = Math.max(0, S1.snap - dt * 1.4);
      poseAmt(croc.fig, 'tail', 0.5 + 0.5 * Math.sin(t * (moving ? 5 : 0.9) + 1));
      poseAmt(croc.fig, 'jaw', S1.snap > 0 ? Math.sin(Math.min(1, (1 - S1.snap) * 1.6) * Math.PI) : 0.18 + 0.12 * Math.sin(t * 0.5));
      // Ibis nickt, Reiher staksst
      if (ibis.tw.list.length === 0) poseAmt(ibis.fig, 'neck', 0.35 + 0.35 * Math.sin(t * 0.7));
      geese.forEach((g, i) => { if (g.tw.list.length === 0) poseAmt(g.fig, 'neck', 0.3 + 0.3 * Math.sin(t * 0.6 + i * 2)); });
      if (reiher.tw.list.length === 0) { poseAmt(reiher.fig, 'neck', 0.3 + 0.3 * Math.sin(t * 0.45 + 2)); }
      // Bauer: hackt
      S1.bauerBoost = Math.max(0, S1.bauerBoost - dt * 0.6);
      const sp = (1.5 + S1.bauerBoost * 1.2) * (app.calm ? 0.7 : 1);
      st.bauerPh += dt * sp;
      const h = 0.5 + 0.5 * Math.sin(st.bauerPh);
      poseAmt(bauer.fig, 'armA', h); poseAmt(bauer.fig, 'armB', h * 0.92); bauer.fig.root.rotation.z = -0.07 * h * (app.calm ? 0.6 : 1);
      if (h < 0.06 && bauerPrev >= 0.06 && rate > 0 && !app.calm) { tmpV.copy(ctx.world(bauer.popup.group.position.x + 1.1, 0.05, bauer.popup.group.position.z + 0.15)); app.fx.dust.emit({ x: tmpV.x, y: tmpV.y, z: tmpV.z, vx: 0.2, vy: 0.5, vz: 0.1, life: 0.7, size: 0.2, alpha: 0.4, color: [0.35, 0.26, 0.17], drag: 1.6, grow: 1.6 }); }
      bauerPrev = h;
      // Fisch springt gelegentlich
      if (fishK < 0) { fishT -= dt * (app.calm ? 0.5 : 1); if (fishT <= 0) { fishK = 0; fishX = 4.2 + Math.random() * 1.6; fisch.popup.pivot.visible = true; ripR.emit(fishX, -1.0, 0.5, 1.2); app.audio.sfx('splash'); } }
      else { fishK += dt / 0.95; const k = Math.min(1, fishK); fisch.popup.group.position.set(fishX + k * 1.0, 0.9 * 4 * k * (1 - k) + 0.05 + st.hippoLift * 0.6, -1.05); fisch.popup.pivot.rotation.z = lerp(0.8, -0.8, k); poseAmt(fisch.fig, 'tail', 0.5 + 0.5 * Math.sin(t * 22));
        if (k >= 1) { fishK = -1; fishT = 7 + Math.random() * 6; fisch.popup.pivot.visible = false; ripR.emit(fishX + 1.0, -1.0, 0.6, 1.4); if (rate > 0) { tmpV.copy(ctx.world(fishX + 1.0, 0.7 + st.hippoLift * 0.6, -1.0)); app.fx.dust.burst(Math.round(5 * rate), { x: tmpV.x, y: tmpV.y, z: tmpV.z, life: 0.6, size: 0.1, alpha: 0.8, color: [0.85, 0.97, 1], grav: 5 }, { speed: 0.8, up: 1.2, px: 0.2, pz: 0.1 }); } } }
      // Ringe auf dem Wasser, besonders bei Flut
      rippleT -= dt * Math.max(0.5, rate) * (0.6 + v);
      if (rippleT <= 0) { rippleT = 1.4 + Math.random() * 1.8; if (Math.random() < 0.4) ripL.emit(-10 + Math.random() * 8, -0.5 + Math.random() * 0.4, 0.5, 2.2); else ripR.emit(1 + Math.random() * 7, -0.5 + Math.random() * 0.4 + v * 1.4 * Math.random(), 0.5, 2.2); }
      ripL.update(dt); ripR.update(dt);
      for (const l of lotus) l.pivot.position.y = Math.sin(t * 1.1 + l.group.position.x) * 0.012;

      // Schaduf: Schöpfen (Faden) und Antippen
      const sv = schoep.sp.x;
      const swing = S1.schadufTap > 0 ? (S1.schadufTap = Math.max(0, S1.schadufTap - dt * 0.9), Math.sin((1 - S1.schadufTap) * Math.PI * 2) * 0.5 * Math.min(1, S1.schadufTap * 3)) : 0;
      // 0..0.45: Arm taucht (rechtes Ende runter), 0.45..0.58 Eimer füllt sich, danach hebt und schwenkt er
      let a = sv < 0.45 ? lerp(0, -0.46, smooth(sv / 0.45)) : lerp(-0.46, 0.3, smooth((sv - 0.45) / 0.55));
      a += swing * 0.6;
      setArm(clamp(a, -0.5, 0.5));
      const full = smooth(ramp(sv, 0.42, 0.55)) * (sv > 0.4 ? 1 : 0);
      if (sv > 0.43 && !dipSfx) { dipSfx = true; app.audio.sfx('water', { v: 0.6 }); ripR.emit(10.4, -0.05, 0.6, 1.5); }
      if (sv < 0.3) dipSfx = false;
      if (full > 0.5 && sv > 0.52 && rate > 0) {
        dripT += dt * rate * 14 * Math.min(1, (sv - 0.5) * 4);
        while (dripT > 1) {
          dripT -= 1;
          tmpV.set(eimerPv[0] * 0 + 0, (eimerRest[1] - 0.1 - tipA[1]) * sws, 0.1); sf.parts.eimer.localToWorld(tmpV);
          app.fx.dust.emit({ x: tmpV.x + (Math.random() - 0.5) * 0.25, y: tmpV.y, z: tmpV.z + 0.05, vx: (Math.random() - 0.5) * 0.15, vy: -0.1, vz: 0, life: 0.9, size: 0.13, alpha: 0.9, color: [0.7, 0.92, 1], grav: 6 });
        }
      }

      // Netzwurf des Fischers
      if (S1.net >= 0) {
        S1.net += dt / 1.5; const k = Math.min(1, S1.net);
        const sx = fisher.popup.group.position.x + 0.6, sy = st.boatY + S1.deckY + 1.2, ex = sx + 2.4, ey = 0.1 + st.boatY * 0.4;
        const aw = k < 0.3 ? smooth(k / 0.3) : 1 - smooth((k - 0.3) / 0.5);
        poseAmt(fisher.fig, 'armA', clamp(aw, 0, 1)); poseAmt(fisher.fig, 'armB', clamp(aw * 0.5, 0, 1));
        if (k > 0.3 && k < 0.95) {
          const q = (k - 0.3) / 0.65;
          net.pivot.visible = true; net.group.position.set(lerp(sx, ex, q), lerp(sy, ey, q) + Math.sin(q * Math.PI) * 0.9, -0.95); net.pivot.rotation.z = -q * 2.2; net.pivot.scale.setScalar(lerp(0.7, 1, Math.min(1, q * 2)));
        } else if (k >= 0.95) {
          if (net.pivot.visible) { net.pivot.visible = false; ripL.emit(ex, -0.75, 0.7, 1.6); ripL.emit(ex + 0.15, -0.8, 1.0, 2.0); app.audio.sfx('splash'); if (rate > 0) { tmpV.copy(ctx.world(ex, 0.3, -0.95)); app.fx.dust.burst(Math.round(8 * rate), { x: tmpV.x, y: tmpV.y, z: tmpV.z, life: 0.7, size: 0.12, alpha: 0.85, color: [0.85, 0.97, 1], grav: 5 }, { speed: 1.0, up: 1.5, px: 0.3, pz: 0.1 }); } }
        }
        if (S1.net >= 1) { S1.net = -1; poseAmt(fisher.fig, 'armA', 0); poseAmt(fisher.fig, 'armB', 0); }
      } else if (fisher.tw.list.length === 0) { poseAmt(fisher.fig, 'armA', 0.12 + 0.1 * Math.sin(t * 0.8)); poseAmt(fisher.fig, 'armB', 0.1 + 0.05 * Math.sin(t * 0.8 + 1)); }

      // Nilometer-Klappe
      S1.doorOpen += (S1.doorTarget - S1.doorOpen) * (1 - Math.exp(-dt * 5.5));
      const dk = smooth(clamp(S1.doorOpen));
      hinge.rotation.x = lerp(-1.555, 0, dk) - (dk > 0.02 && dk < 0.98 ? Math.sin(t * 8) * 0.01 : 0);
      mk.position.z = lerp(0.92, DH - 0.37, v);
    });
    S1.ctl = { flut, schoep };
    S1.reset = () => {
      flut.setValue(0, { snap: true, silent: false }); schoep.setValue(0, { snap: true, silent: false });
      S1.doorTarget = 0; S1.doorOpen = 0; S1.net = -1; net.pivot.visible = false; S1.schadufTap = 0;
      ripL.clear(); ripR.clear(); fishK = -1; fisch.popup.pivot.visible = false; applyFlood(0); setArm(0);
      hinge.rotation.x = -1.555;
    };
  },
  onDeactivate(ctx) { const s = ctx.spread.p1; if (s && s.reset) s.reset(); },
};
