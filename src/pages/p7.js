// Station 7: Tal der Könige und Tutanchamun
// Links das Felsental mit dem Zug der Sargträger (TRAGEN), rechts der Totentempel der Hatschepsut und vorn die aufklappbare Grabkammer
// (Treppe mit versiegelter Tür, dahinter die Kammer im Fackelschimmer). Laschen: TÜR, SCHÄTZE, TRAGEN.
// Alles wird aus den Laschenwerten abgeleitet (rückwärts spulbar); beim Verlassen der Seite wird alles zurückgesetzt.
import * as THREE from 'three';
import { mood } from '../engine/scene.js';
import { printLabel, pebbles, grassTufts, blotches } from '../engine/pagepaint.js';
import { makeFigure } from '../engine/popup.js';
import { softTexture } from '../engine/effects.js';
import { lerp, clamp, smooth, TAU, mulberry32 } from '../engine/util.js';
import { panelPart, cracks, leftCard, dither, softLight } from './common.js';
import { rockPart, plinthPart, kammerWandPart, kammerSidePart, sillPart, signPart, floorCanvas, glowPlane } from './_eg_p7_kit.js';

const IDX = 7;

// ---- Maße (Seitenkoordinaten)
const TX = 3.45, TH = 3.3;                                   // Mitte und Höhe der Grabtreppe
const RX0 = 5.45, RX1 = 11.05, RZB = -0.95, RZF = 1.15, RH = 3.0;   // Grabkammer: x-Bereich, hinten, vorn, Wandhöhe
const LANE = -0.9;                                           // Weg des Sargzuges (z)
const CX0 = -9.1, CX1 = -5.5;                                // Mitte des Zuges: Start und Ziel

export default {
  id: 'tal',
  mood: mood({ key: '#ffd3a0', keyI: 2.35, sky: '#ffe5c2', gnd: '#8c5a38', hemiI: 1.75, pos: [-12, 19, 9], rim: 0.16 }),
  motes: { colors: [[1, 0.86, 0.55], [1, 0.7, 0.4], [1, 0.95, 0.8]], size: 0.06, alpha: 0.42, dy: 0.06, dx: 0.1, tw: 1.2, density: 0.7 },
  atmo: 'tal',
  base() {
    return {
      L: {
        ground: { back: '#ead3a0', front: '#d4aa6e' }, margin: 0.3, pageNo: 2 * IDX + 1, seed: 71,
        draw(ctx, m) {
          blotches(m, { x0: -11.8, x1: -0.2, z0: -4.1, z1: 4.2, n: 30, rmin: 0.6, rmax: 2.0, colors: ['rgba(190,105,55,.14)', 'rgba(255,238,195,.18)', 'rgba(120,80,40,.10)'], seed: 71 });
          cracks(m, { x0: -11.6, x1: -0.4, z0: -2.2, z1: 4.0, n: 46, seed: 3, color: 'rgba(110,65,30,.22)' });
          // staubiger Prozessionsweg
          const path = [[-11.5, -0.75], [-9, -1.0], [-6.5, -0.8], [-4, -1.05], [-0.8, -0.85]];
          ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(252,236,196,.6)'; ctx.lineWidth = 1.5 * m.S; ctx.beginPath(); path.forEach((p, i) => { if (i) ctx.lineTo(m.x(p[0]), m.z(p[1])); else ctx.moveTo(m.x(p[0]), m.z(p[1])); }); ctx.stroke();
          ctx.strokeStyle = 'rgba(140,90,45,.32)'; ctx.lineWidth = 0.03 * m.S; ctx.setLineDash([0.2 * m.S, 0.16 * m.S]);
          for (const off of [-0.72, 0.72]) { ctx.beginPath(); path.forEach((p, i) => { if (i) ctx.lineTo(m.x(p[0]), m.z(p[1] + off)); else ctx.moveTo(m.x(p[0]), m.z(p[1] + off)); }); ctx.stroke(); }
          ctx.restore();
          pebbles(m, { x0: -11, x1: -0.8, z0: -2.0, z1: 3.6, n: 14, seed: 8 });
          grassTufts(m, { x0: -11, x1: -1, z0: -2.0, z1: 3.8, n: 6, seed: 5, color: '#a89050', h: 0.26 });
          leftCard(null, IDX)(ctx, m);
        },
      },
      R: {
        ground: { back: '#e8cd96', front: '#cf9f62' }, margin: 0.3, pageNo: 2 * IDX + 2, seed: 72,
        draw(ctx, m) {
          blotches(m, { x0: 0.2, x1: 11.8, z0: -4.1, z1: 4.2, n: 30, rmin: 0.6, rmax: 2.0, colors: ['rgba(190,105,55,.14)', 'rgba(255,238,195,.18)', 'rgba(120,80,40,.10)'], seed: 73 });
          cracks(m, { x0: 0.6, x1: 11.4, z0: -2.2, z1: 4.0, n: 50, seed: 12, color: 'rgba(110,65,30,.24)' });
          pebbles(m, { x0: 1, x1: 11, z0: -2.0, z1: 3.4, n: 14, seed: 11 });
          grassTufts(m, { x0: 0.8, x1: 11.2, z0: -2.0, z1: 3.8, n: 5, seed: 15, color: '#a89050', h: 0.26 });
          // Sandfläche vor der Grabtreppe (Ausgrabung)
          ctx.save(); ctx.fillStyle = 'rgba(252,236,196,.38)'; ctx.beginPath(); ctx.ellipse(m.x(3.3), m.z(1.7), 2.6 * m.S, 1.2 * m.S, 0, 0, TAU); ctx.fill(); ctx.restore();
          printLabel(m, 'Vorkammer', 6.9, 1.62, { size: 0.24, color: 'rgba(95,62,32,.95)', italic: true, bold: false });
          printLabel(m, 'Sargkammer', 9.75, 1.62, { size: 0.24, color: 'rgba(95,62,32,.95)', italic: true, bold: false });
        },
      },
    };
  },

  *build(ctx) {
    const app = ctx.app, spread = ctx.spread, L = ctx.L, R = ctx.R, audio = app.audio;
    const sfx = (n, o) => { if (audio.sfx) audio.sfx(n, o); };
    const ac = (n, v) => { if (audio.ctl) audio.ctl(n, v); };
    const soft = softTexture();
    const rnd = mulberry32(7007);
    const fxk = () => app.stage.tier.fx * (app.calm ? 0.45 : 1);
    const matsOf = (o) => (o.mats ? o.mats : o.fig ? o.fig.cuts.map((c) => c.material) : o.cut ? [o.cut.material] : o.material ? [o.material] : []);
    // Tippen auf Kulissen (Props/Flats)
    const tapPop = (pop, id) => {
      const meshes = pop.fig ? pop.fig.hit.slice() : [pop.cut.mesh];
      for (const m of meshes) m.userData.tap = () => app.openCardById(id, pop.group.position.x);
      pop.pickMeshes = meshes; pop._pm = meshes;
    };
    const hopWake = (a, h = 0.12, voice) => { a.onWake = () => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * h; }, { done: () => { a.hop = 0; } }); if (voice) audio.voice(voice); }; };

    // ============================================================ Kulissen: Himmel, Felsental, Totentempel
    for (const s of ['L', 'R']) {
      ctx.flat(panelPart(-5.85, 5.85, 5.0, { fill: { top: '#8cc3de', bottom: '#fde3b2' }, wave: 0.28, freq: 3, phase: s === 'L' ? 0.4 : 2.0, seed: s === 'L' ? 2 : 5, deco: (c, bb) => { softLight(c, bb, { color: 'rgba(255,230,160,.55)', cx: s === 'L' ? 0.3 : 0.7, cy: 0.45, r: 0.7 }); dither(c, bb, '#fff', { n: 100, alpha: 0.12, size: 0.04 }); } }), { x: s === 'L' ? -6 : 6, z: -4.05, lean: -0.05, name: 'sky' + s, delay: 0, ppu: 70, border: 0.04 });
    }
    yield;
    const tal = ctx.prop('felsental_tal', { x: -6.0, z: -3.5, len: 11.0, delay: 0.08 });
    tapPop(tal, 'tal_der_koenige');
    const temple = ctx.prop('totentempel_hatschepsut', { x: 6.0, z: -3.3, len: 10.4, delay: 0.12 });
    tapPop(temple, 'hatschepsut');
    ctx.prop('wuestenduene', { x: -6, z: -2.35, len: 11.6, delay: 0.14, variant: { seed: 1 } });
    ctx.prop('wuestenduene', { x: 6, z: -2.2, len: 11.6, delay: 0.14, variant: { seed: 2 } });
    yield;
    // Sandsteinbrocken (Kulisse)
    for (const [x, z, w, h, sd] of [[-10.3, -1.3, 1.1, 0.62, 1], [-0.7, 0.0, 0.9, 0.5, 2], [0.8, 2.5, 0.8, 0.45, 3], [11.45, 1.5, 0.8, 0.5, 4], [-4.2, 2.6, 0.8, 0.42, 5]]) ctx.flat(rockPart(w, h, sd), { x, z, name: 'fels' + sd, delay: 0.2 + sd * 0.01, ppu: 120, border: 0.025 });
    yield;

    // ============================================================ Statuen auf Sandstein-Sockeln
    const statue = (id, x, z, h, card, { facing = 1, tint = [0.93, 0.86, 0.74], delay = 0.28 } = {}) => {
      const ph = 0.42;
      ctx.flat(plinthPart(1.15, ph, Math.round(x * 3)), { x, z, name: 'sockel-' + id, delay: delay - 0.04, ppu: 110, border: 0.025 });
      const a = ctx.stand(id, { x, z: z + 0.04, y: ph, h, facing, delay, card, hint: true });
      a.setFacing(facing);
      for (const m of a.mats) m.color.setRGB(tint[0], tint[1], tint[2]);
      hopWake(a, 0.08);
      return a;
    };
    const hat = statue('hatschepsut', 0.95, -1.4, 1.85, 'hatschepsut', { facing: 1 });
    const ram = statue('ramses', -0.95, -1.95, 2.05, 'ramses', { facing: -1 });
    const tut = statue('tutanchamun', -2.5, 1.3, 1.62, 'tutanchamun', { facing: 1 });
    yield;

    // ============================================================ rechts vorn: Grabtreppe, Carter, Schild
    const treppe = ctx.prop('grabtreppe', { x: TX, z: 0.1, h: TH, delay: 0.3 });
    tapPop(treppe, 'carter');
    const tws = treppe.fig.ws;   // Welteinheiten pro Modellmeter
    const tuer = treppe.fig.parts.tuer;
    // Fackelschein im dunklen Gang hinter der Tür (additiv)
    const gangGlow = glowPlane(soft, 0xffb04a, 1.15 * tws * 1.1, 1.9 * tws, 0); gangGlow.position.set(0.95 * tws, 1.27 * tws, 0.09); treppe.fig.root.add(gangGlow);
    const sign = ctx.flat(signPart(), { x: 1.45, z: 1.35, name: 'sign', delay: 0.36, ppu: 120, border: 0.03 });
    tapPop(sign, 'tal_der_koenige');
    sign.group.rotation.y = 0.0;

    const carter = ctx.stand('carter', { x: 2.55, z: 2.05, h: 1.92, facing: 1, delay: 0.34, card: 'carter', hint: true });
    hopWake(carter, 0.06);
    // Fackel in der fernen Hand
    const ARMB = 0.5;
    const torchFig = makeFigure('fackel', { h: 0.78, thickness: 0.02, border: 0.02 });
    R.own(torchFig);
    {
      const cws = carter.fig.ws, gA = carter.fig.parts.armB;
      const piv = [-0.0068, 1.3441], grip = [0.03, 0.7278];            // Modellmeter
      const tw2 = torchFig.ws, gl = 0.19 * tw2;                         // Griffhöhe an der Fackel
      torchFig.group.rotation.z = -ARMB;                                 // Fackel bleibt senkrecht
      torchFig.group.position.set((grip[0] - piv[0]) * cws - gl * Math.sin(ARMB), (grip[1] - piv[1]) * cws - gl * Math.cos(ARMB), 0.07);
      gA.add(torchFig.group);
      carter.fig.rotatePart('armB', ARMB);
      carter.torchArm = ARMB;
    }
    const flame = torchFig.parts.flamme;
    const torchGlow = glowPlane(soft, 0xffa83c, 1.8, 1.8, 0); torchGlow.position.set(0, 0.54 * torchFig.ws, 0.12); torchFig.group.add(torchGlow);
    carter.behaviors.push(() => { carter.fig.rotatePart('armB', ARMB); });
    yield;

    // ============================================================ rechts: die aufklappbare Grabkammer (Kammer mit Schätzen)
    const lit = [];                                                  // Teile der Kammer, die mit dem Fackellicht heller werden
    const litAdd = (obj, x, { base = 0.06, act = null } = {}) => { lit.push({ mats: matsOf(obj), d: clamp((x - RX0) / (RX1 - RX0)), base, act, on: true }); return obj; };
    const RW = RX1 - RX0, RD = RZF - RZB;
    // Boden
    const ft = new THREE.CanvasTexture(floorCanvas(RW, RD)); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), new THREE.MeshLambertMaterial({ map: ft, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set((RX0 + RX1) / 2, 0.012, (RZB + RZF) / 2); floor.receiveShadow = true; R.add(floor);
    litAdd(floor, (RX0 + RX1) / 2, { base: 0.12 });
    const back = ctx.flat(kammerWandPart(RW, RH), { x: (RX0 + RX1) / 2, z: RZB, name: 'kwand', delay: 0.32, ppu: 90, border: 0.03 });
    const wallL = ctx.flat(kammerSidePart(RD, 1.55, 4), { x: RX0, z: (RZB + RZF) / 2, yaw: Math.PI / 2, name: 'kwandL', delay: 0.34, ppu: 80, border: 0.03 });
    const wallR = ctx.flat(kammerSidePart(RD, RH, 6), { x: RX1, z: (RZB + RZF) / 2, yaw: -Math.PI / 2, name: 'kwandR', delay: 0.34, ppu: 80, border: 0.03 });
    litAdd(back, (RX0 + RX1) / 2); litAdd(wallL, RX0, { base: 0.08 }); litAdd(wallR, RX1, { base: 0.08 });
    const sill = ctx.flat(sillPart(RW + 0.3, 0.3), { x: (RX0 + RX1) / 2, z: RZF + 0.02, name: 'sill', delay: 0.36, ppu: 90, border: 0.025 });
    yield;
    // Warmes Raumleuchten (additiv)
    const roomGlow = glowPlane(soft, 0xffa850, RW * 1.25, RH * 1.2, 0); roomGlow.position.set(0, RH * 0.5, 0.12); back.add(roomGlow);
    const floorGlow = glowPlane(soft, 0xff9a40, 2.8, 1.4, 0); floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.set(4.3, 0.03, 1.5); R.add(floorGlow);

    // Vorkammer
    const thron = ctx.stand('thron_tut', { x: 6.45, z: -0.45, h: 1.45, delay: 0.4, card: 'thron', hint: false });
    const wagen = ctx.stand('streitwagen', { x: 7.7, z: -0.55, len: 2.0, delay: 0.42, card: 'streitwagen', hint: false });
    const truhe = ctx.stand('truhe', { x: 6.95, z: 0.7, len: 1.0, delay: 0.44, card: null, hint: false, hitPad: 0.05 });
    const dolch = ctx.prop('dolch_eisen', { x: 6.9, z: 0.98, y: 0.8, len: 0.5, delay: 0.5 });
    tapPop(dolch, 'dolch');
    for (const a of [thron, wagen, truhe]) { litAdd(a, a.popup.group.position.x, { act: a }); a.hint = false; }
    litAdd(dolch, 6.9);
    hopWake(thron, 0.05); hopWake(truhe, 0.06);
    wagen.onWake = () => { wagen.tw.add(1.1, (k) => { const r = Math.sin(k * Math.PI) * 0.9; wagen.fig.rotatePart('radA', r); wagen.fig.rotatePart('radB', r); wagen.hop = Math.sin(k * Math.PI) * 0.05; }, { done: () => { wagen.hop = 0; wagen.fig.rotatePart('radA', 0); wagen.fig.rotatePart('radB', 0); } }); };
    yield;

    // Sargkammer: Schrein mit Goldsarg und Maske
    const SX = 9.7, SZ = -0.35;
    const schrein = ctx.stand('schrein_gold', { x: SX, z: SZ, h: 2.55, delay: 0.38, card: 'schrein', hint: false });
    const doorA = schrein.fig.parts.doorA, doorB = schrein.fig.parts.doorB;
    const innerGlow = glowPlane(soft, 0xffc860, 1.4, 2.2, 0); innerGlow.position.set(0, 1.2, 0.012); schrein.fig.root.add(innerGlow);
    const sarg = ctx.stand('sarkophag_gold', { x: SX, z: SZ + 0.004, y: 0.2, h: 1.62, delay: 0.46, card: 'sarg', hint: false });
    sarg.fig.group.visible = false; sarg.hitMeshes = [];
    const maske = ctx.prop('tutmaske', { x: SX, z: SZ + 0.1, y: 1.4, h: 1.15, delay: 0.5 });
    tapPop(maske, 'tutmaske'); maske.pivot.visible = false; maske.pickMeshes = [];
    const mGlow = glowPlane(soft, 0xffd070, 2.0, 2.0, 0); mGlow.position.set(0, 0.5, -0.02); maske.add(mGlow);
    litAdd(schrein, SX, { act: schrein }); litAdd(sarg, SX); litAdd(maske, SX);
    const ush1 = ctx.prop('ushabti', { x: 9.75, z: 0.95, h: 0.5, delay: 0.52 });
    const ush2 = ctx.prop('ushabti', { x: 10.5, z: 0.95, h: 0.5, delay: 0.54, facing: -1 });
    litAdd(ush1, 9.75); litAdd(ush2, 10.5);
    hopWake(schrein, 0.04); hopWake(sarg, 0.05);
    // verstecktes Käferchen: lugt rechts hinter der Truhe hervor (Rücken und Fühler)
    const kaefer = ctx.stand('skarab8', { x: 7.5, z: 0.44, len: 0.95, facing: 1, delay: 0.56, hidden: true, hint: false, hitPad: 0.2 });
    kaefer.setFacing(1);
    kaefer.onWake = (a) => { a.tw.add(0.7, (k) => { a.hop = Math.sin(k * Math.PI) * 0.35; }, { done: () => { a.hop = 0; } }); audio.voice('skarabaeus'); };
    litAdd(kaefer, 7.5, { base: 0.4 });
    const kGlint = glowPlane(soft, 0xffe28a, 0.4, 0.4, 0); kGlint.position.set(0.45, 0.42, 0.1); kaefer.fig.root.add(kGlint);
    yield;

    // ============================================================ links: Zug der Sargträger
    const stein = ctx.stand('sarkophag_stein', { x: -2.9, z: -1.55, len: 2.2, delay: 0.3, card: 'sarg', hint: false });
    const steinLid = stein.fig.parts.lid;
    const carriers = [];
    const defs = [
      { dx: -0.95, dz: 0, far: false }, { dx: 0.95, dz: 0, far: false },
      { dx: -0.55, dz: -0.3, far: true }, { dx: 1.3, dz: -0.3, far: true },
    ];
    defs.forEach((d, i) => {
      const a = ctx.stand('traeger', { x: CX0 + d.dx, z: LANE + d.dz, h: 1.85, facing: 1, delay: 0.3 + i * 0.03, card: 'sarg', hint: false, hitPad: 0.2 });
      if (d.far) for (const m of a.mats) m.color.setRGB(0.82, 0.78, 0.74);
      a.cd = d; a.ci = i; a.step = 0; carriers.push(a);
      hopWake(a, 0.08);
    });
    // drei ineinander gesteckte Goldsärge (liegend, von außen nach innen kleiner)
    const SCL = [1.0, 0.82, 0.64], TNT = [[0.8, 0.66, 0.5], [0.94, 0.84, 0.66], [1, 1, 1]], LEN = 2.1;
    const coffins = SCL.map((s, i) => {
      const p = ctx.prop('sarkophag_gold', { x: CX0, z: LANE + 0.12 + i * 0.07, h: LEN * s, delay: 0.4 + i * 0.03 });
      p.pivot.rotation.z = -Math.PI / 2; p.cL = LEN * s;
      for (const m of p.fig.cuts.map((c) => c.material)) m.color.setRGB(TNT[i][0], TNT[i][1], TNT[i][2]);
      tapPop(p, 'sarg');
      return p;
    });
    // kleine Beschriftung der Särge
    yield;

    // ============================================================ Laschen
    const tuerCtl = ctx.control('R', { id: 'tuer', label: 'TÜR', a: [1.9, 3.75], b: [3.3, 3.75], size: [1.7, 0.95], color: '#b3382a', value: 0, springBack: false, hold: true });
    const schaetzeCtl = ctx.control('R', { id: 'schaetze', label: 'SCHÄTZE', a: [6.4, 3.75], b: [9.0, 3.75], size: [2.4, 0.95], color: '#b8862d', value: 0, springBack: false, hold: true });
    const tragenCtl = ctx.control('L', { id: 'tragen', label: 'TRAGEN', a: [-4.9, 3.85], b: [-1.0, 3.85], size: [2.0, 0.95], color: '#2a5aa0', value: 0, springBack: false, hold: true });
    for (const c of [tuerCtl, schaetzeCtl, tragenCtl]) { c.onGrab = () => sfx('grab'); c.onRelease = () => sfx('snap'); }
    tuerCtl.onTick = (v) => sfx('slide', { v });
    schaetzeCtl.onTick = (v) => sfx('slide', { v });
    tragenCtl.onTick = (v) => sfx('footstep', { v });
    schaetzeCtl.onGrab = () => { sfx('grab'); if (tuerCtl.v < 0.6) tuerCtl.setValue(1); };   // ohne Licht keine Schätze: die Tür geht von selbst auf

    // ============================================================ Zustand und Aktualisierung
    const S = { door: 0, torchSent: 0, light: -1, doorSnd: false, goldSnd: [false, false, false], prevCarry: 0, carryX: CX0, mask: 0, sp: 0 };
    let tSpark = 0;
    const emitGlow = (x, y, z, n, o = {}) => {
      const w = ctx.world(x, y, z);
      for (let i = 0; i < n; i++) app.fx.glow.emit({ x: w.x + (rnd() - 0.5) * (o.px ?? 0.4), y: w.y + (rnd() - 0.2) * (o.py ?? 0.4), z: w.z + (rnd() - 0.5) * 0.2, vx: (rnd() - 0.5) * 0.5, vy: 0.2 + rnd() * 0.5, vz: 0, life: 0.9 + rnd() * 0.8, size: o.size ?? 0.16, alpha: o.alpha ?? 0.8, color: o.color || [1, 0.84, 0.42], drag: 1, grav: -0.05 });
    };
    function applyLight(Lk) {
      for (const it of lit) {
        const k = smooth(clamp(Lk * 1.6 - it.d * 0.6));
        const s = it.base + (1 - it.base) * k;
        for (const m of it.mats) m.color.setScalar(s);
        if (it.act) { const on = k > 0.55; if (on !== it.on) { it.on = on; if (on) { it.act.hitMeshes = it.act._hm || it.act.hitMeshes; } else { it.act._hm = it.act._hm || it.act.hitMeshes; it.act.hitMeshes = []; } } }
      }
    }
    for (const it of lit) if (it.act) { it.act._hm = it.act.hitMeshes; it.act.hitMeshes = []; it.on = false; }
    applyLight(0); S.light = 0;

    function update(dt, t) {
      const calm = app.calm;
      // ---------------- TÜR: Tür kippt, Fackelschimmer, Kammer blendet auf
      const tv = tuerCtl.sp.x;
      const kDoor = smooth(clamp(tv / 0.55)), kLight = smooth(clamp((tv - 0.3) / 0.7));
      tuer.rotation.z = 1.25 * kDoor;
      const fl = calm ? 0 : 0.07 * Math.sin(t * TAU * 1.1) + 0.04 * Math.sin(t * TAU * 2.3 + 1.3);      // höchstens 2,3 Hz
      flame.rotation.z = calm ? 0 : Math.sin(t * TAU * 1.3) * 0.1;
      torchGlow.material.opacity = (0.28 + 0.5 * kLight + fl * 0.8); torchGlow.visible = true;
      gangGlow.material.opacity = (0.9 * kDoor + fl * kDoor); gangGlow.visible = kDoor > 0.01;
      floorGlow.material.opacity = 0.34 * kLight * (1 + fl); floorGlow.visible = kLight > 0.01;
      roomGlow.material.opacity = 0.34 * kLight * (1 + fl * 0.6); roomGlow.visible = kLight > 0.01;
      if (Math.abs(kLight - S.light) > 0.002) { S.light = kLight; applyLight(kLight); }
      if (tv > 0.1 && !S.doorSnd) { S.doorSnd = true; sfx('door'); sfx('torch'); }
      if (tv < 0.04 && S.doorSnd) S.doorSnd = false;
      if (Math.abs(kLight - S.torchSent) > 0.01 || (kLight < 0.002 && S.torchSent > 0)) { S.torchSent = kLight; ac('torch', kLight); }
      kGlint.material.opacity = kLight > 0.5 ? (0.45 + (calm ? 0 : 0.2 * Math.sin(t * TAU * 0.8))) * (kLight) : 0; kGlint.visible = kGlint.material.opacity > 0.01;
      // Funken am Fackelschaft (nur sichtbar, solange die Seite aktiv ist)
      tSpark -= dt;
      if (spread.active && tSpark <= 0 && !calm) {
        tSpark = 0.34 / Math.max(0.3, fxk());
        const w = torchFig.group.getWorldPosition(_v); emitGlowAt(w.x, w.y + 0.7, w.z + 0.1, 1);
      }

      // ---------------- SCHÄTZE: Schrein öffnen, Goldsarg heraus, Maske steigt auf
      const sv = schaetzeCtl.sp.x;
      const p1 = smooth(clamp(sv / 0.3)), p2 = smooth(clamp((sv - 0.34) / 0.3)), p3 = smooth(clamp((sv - 0.7) / 0.3));
      doorA.rotation.y = -1.5 * p1; doorB.rotation.y = 1.5 * p1;
      innerGlow.material.opacity = 0.5 * p1 * (1 - p2) * kLight; innerGlow.visible = innerGlow.material.opacity > 0.01;
      const showCof = p1 > 0.03;
      sarg.fig.group.visible = showCof;
      if (showCof && kLight > 0.55) { if (!sarg.hitMeshes.length) sarg.hitMeshes = [sarg.proxy, ...sarg.fig.hit]; } else if (sarg.hitMeshes.length) sarg.hitMeshes = [];
      const cs = 1 + 0.2 * p2, cx = lerp(SX, 8.45, p2), cz = lerp(SZ + 0.004, 0.75, p2), cy = lerp(0.2, 0, p2);
      sarg.popup.group.position.set(cx, cy, cz); sarg.popup.group.scale.setScalar(cs);
      const headY = cy + 1.62 * cs * 0.93;
      maske.pivot.visible = p3 > 0.01;
      maske.group.position.set(cx, headY + 0.35 + 0.9 * p3, cz + 0.12);
      maske.group.scale.setScalar(lerp(0.3, 1, p3) * (1 + 0.012 * Math.sin(t * 1.6) * (calm ? 0 : 1)));
      mGlow.material.opacity = 0.55 * p3 * (calm ? 0.8 : 0.9 + 0.1 * Math.sin(t * TAU * 0.7)); mGlow.visible = p3 > 0.01;
      maske.pickMeshes = p3 > 0.6 && kLight > 0.55 ? maske._pm : [];
      for (let i = 0; i < 3; i++) { const on = sv > [0.06, 0.4, 0.75][i]; if (on && !S.goldSnd[i]) { S.goldSnd[i] = true; sfx(i === 0 ? 'door' : 'gold'); } if (!on && sv < [0.03, 0.34, 0.68][i]) S.goldSnd[i] = false; }
      if (p3 > 0.5 && spread.active && !calm) { S.sp -= dt; if (S.sp <= 0) { S.sp = 0.16 / Math.max(0.3, fxk()); emitGlow(maske.group.position.x, maske.group.position.y + 0.5, maske.group.position.z + 0.2, 1, { px: 0.9, py: 0.9 }); } }
      else S.sp = 0;

      // ---------------- TRAGEN: Zug der Träger
      const cv = tragenCtl.sp.x;
      const xc = lerp(CX0, CX1, cv);
      const dv = (cv - S.prevCarry); S.prevCarry = cv;
      const moving = Math.abs(dv) > 0.00008;
      for (const a of carriers) {
        const d = a.cd; a.popup.group.position.x = xc + d.dx; a.popup.group.position.z = LANE + d.dz;
        if (a.tw.list.length === 0) {
          if (moving) {
            const ph = xc * 5.0 + a.ci * 1.7 + (d.far ? 0.8 : 0);
            const sw = a.fig.meta.swing || {};
            for (const [p, off] of [['legA', 0], ['legB', Math.PI]]) { const r = sw[p] || [-0.34, 0.34]; a.fig.rotatePart(p, lerp(r[0], r[1], 0.5 + 0.5 * Math.sin(ph + off))); }
            a.hop = Math.abs(Math.sin(ph)) * (calm ? 0.03 : 0.06);
          } else { a.fig.rotatePart('legA', 0); a.fig.rotatePart('legB', 0); a.hop = 0; }
        }
      }
      if (moving && spread.active && !calm && Math.random() < Math.min(1, Math.abs(dv) * 40) * fxk()) {
        const w = ctx.world(xc + (dv > 0 ? 1.0 : -1.0) * (Math.random() - 0.2), 0.1, LANE + 0.2);
        app.fx.dust.emit({ x: w.x, y: w.y, z: w.z, vx: (Math.random() - 0.5) * 0.3, vy: 0.25 + Math.random() * 0.3, vz: 0.1, life: 0.9, size: 0.3, alpha: 0.4, color: [0.93, 0.8, 0.58], drag: 1.6, grow: 2 });
      }
      // Särge: bei der Ankunft schieben sich die drei Särge ineinander heraus
      const fan = smooth(clamp((cv - 0.88) / 0.12));
      const axisY = 1.38 * carriers[0].fig.ws + 0.3;
      coffins.forEach((p, i) => {
        p.group.position.set(xc - p.cL / 2, axisY + fan * i * 0.74, LANE + 0.12 + i * 0.07);
      });
      steinLid.rotation.z = fan * 0.16;
    }
    const _v = new THREE.Vector3();
    function emitGlowAt(x, y, z, n) {
      for (let i = 0; i < n; i++) app.fx.glow.emit({ x: x + (rnd() - 0.5) * 0.06, y, z, vx: (rnd() - 0.5) * 0.18, vy: 0.4 + rnd() * 0.4, vz: 0, life: 0.9 + rnd() * 0.6, size: 0.1, alpha: 0.7, color: [1, 0.62, 0.22], drag: 0.8, grav: -0.1 });
    }
    ctx.onUpdate(update);

    spread._p7 = {
      reset() { for (const c of [tuerCtl, schaetzeCtl, tragenCtl]) { c.setValue(0); c.touched = false; } S.doorSnd = false; S.goldSnd = [false, false, false]; },
    };
  },
  onDeactivate(ctx) { if (ctx.spread._p7) ctx.spread._p7.reset(); },
};
