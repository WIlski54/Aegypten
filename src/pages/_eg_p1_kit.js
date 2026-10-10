// Hilfen für Station 1 (Das Geschenk des Nil): Partikelrate, Wasserringe, Flutdecke, Schilder, Nilometer-Klappe, Wasserstandsanzeige.
import * as THREE from 'three';
import { clamp, lerp, TAU, mulberry32 } from '../engine/util.js';
import { poly } from '../art/dsl.js';
import { SERIF, roundRect } from '../engine/pagepaint.js';

export const fxRate = (app) => app.stage.tier.fx * (app.calm ? 0.5 : 1);
export const ramp = (v, a, b) => clamp((v - a) / (b - a));

export function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = Math.max(16, Math.round(w)); cv.height = Math.max(16, Math.round(h));
  draw(cv.getContext('2d'), cv.width, cv.height);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}

// ---- Wasserringe: flache Ringe, die auf der Seite aufgehen und verblassen ---------------------------------------
export class RipplePool {
  constructor(side, { n = 8, color = 0xffffff, y = 0.034, op = 0.7 } = {}) {
    this.group = new THREE.Group(); side.add(this.group); this.op = op; this.cur = 0;
    this.geo = new THREE.RingGeometry(0.84, 1, 40); this.geo.rotateX(-Math.PI / 2);
    this.items = [];
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, fog: false });
      const m = new THREE.Mesh(this.geo, mat); m.position.y = y; m.visible = false; m.renderOrder = 3; this.group.add(m);
      this.items.push({ m, mat, age: 0, life: 1, r1: 1, zs: 0.6 });
    }
  }
  emit(x, z, r1 = 0.8, life = 1.7, zs = 0.62) {
    const it = this.items[this.cur]; this.cur = (this.cur + 1) % this.items.length;
    it.m.position.x = x; it.m.position.z = z; it.m.visible = true; it.age = 0; it.life = life; it.r1 = r1; it.zs = zs;
  }
  update(dt) {
    for (const it of this.items) {
      if (!it.m.visible) continue;
      it.age += dt; const k = it.age / it.life;
      if (k >= 1) { it.m.visible = false; continue; }
      const r = 0.06 + it.r1 * (1 - (1 - k) * (1 - k));
      it.m.scale.set(r, 1, r * it.zs);
      it.mat.opacity = this.op * Math.pow(1 - k, 1.5);
    }
  }
  clear() { for (const it of this.items) it.m.visible = false; }
}

// ---- Flutdecke: flache, durchscheinende Wasserfläche auf der Seite. Hinterkante z0 (am Fluss), Vorderkante z0 + len*L -----
export function floodTexture(seed = 3) {
  return canvasTex(1024, 256, (g, W, H) => {
    const r = mulberry32(seed);
    g.clearRect(0, 0, W, H);
    // Farbverlauf: oben (am Fluss) satt, vorn (Rand) klarer
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(58,138,134,.86)'); gr.addColorStop(0.7, 'rgba(84,168,150,.74)'); gr.addColorStop(1, 'rgba(120,190,160,.62)');
    // Fläche mit wellig auslaufendem Vorderrand (periodisch in x)
    const edge = (x) => H * 0.88 + Math.sin((x / W) * TAU * 3) * H * 0.045 + Math.sin((x / W) * TAU * 7 + 1.3) * H * 0.02;
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); for (let x = W; x >= 0; x -= 8) g.lineTo(x, edge(x)); g.closePath(); g.fill();
    // Wellenbögen
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2.4; g.lineCap = 'round';
    for (let row = 0; row < 5; row++) {
      let x = r() * 120;
      while (x < W) {
        const L = 70 + r() * 90, y = H * (0.12 + row * 0.16) + r() * 10;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L * 0.25, y - 7, x + L * 0.5, y); g.quadraticCurveTo(x + L * 0.75, y + 7, x + L, y); g.stroke();
        x += L + 90 + r() * 140;
      }
    }
    // Schaumsaum am Rand
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= W; x += 6) { const y = edge(x) - 3; if (x) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
    g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 70; i++) { const x = r() * W; g.beginPath(); g.arc(x, edge(x) - 8 - r() * 16, 1.4 + r() * 2.2, 0, TAU); g.fill(); }
    // Lichtflecken
    g.fillStyle = 'rgba(255,255,230,.35)'; for (let i = 0; i < 26; i++) { const x = r() * W, y = H * (0.08 + r() * 0.7); g.beginPath(); g.ellipse(x, y, 10 + r() * 22, 1.8 + r() * 1.6, 0, 0, TAU); g.fill(); }
  });
}
export function makeFloodSheet(side, { x0, x1, z0, op = 1 } = {}) {
  const w = x1 - x0;
  const tex = floodTexture(5); tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(w / 3.8, 1);
  const geo = new THREE.PlaneGeometry(w, 1); geo.translate(0, -0.5, 0);
  const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const mesh = new THREE.Mesh(geo, mat); mesh.rotation.x = -Math.PI / 2; mesh.position.set((x0 + x1) / 2, 0.028, z0); mesh.renderOrder = 2; mesh.visible = false;
  side.add(mesh);
  return { mesh, mat, tex, set(len) { mesh.visible = len > 0.04; mesh.scale.y = Math.max(0.001, len); }, flow(dt) { tex.offset.x += dt * 0.012; } };
}

// ---- Schild (Holzbrett auf Pfosten) als Papier-Part. text/sub gedruckt ------------------------------------------
export function signPart(w, text, sub, { post = 0.8, h = 0.62, fill = ['#ecd9a6', '#d6ba7c'] } = {}) {
  const board = poly([[-w / 2, post], [w / 2, post], [w / 2, post + h], [-w / 2, post + h]], 2);
  const stem = poly([[-0.055, 0], [0.055, 0], [0.05, post + 0.06], [-0.05, post + 0.06]], 0);
  return {
    layers: [
      { shapes: [stem], fill: { top: '#8a6238', bottom: '#6a4824' } },
      {
        shapes: [board], fill: { top: fill[0], bottom: fill[1] }, stroke: 'rgba(80,45,15,.5)',
        deco(c) {
          const { ctx, tf, S } = c;
          const [cx, cy] = tf(0, post + h * (sub ? 0.64 : 0.5));
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          let fs = h * (sub ? 0.34 : 0.42) * S; ctx.font = `bold ${fs}px ${SERIF}`;
          while (ctx.measureText(text).width > (w - 0.18) * S && fs > 8) { fs -= 1; ctx.font = `bold ${fs}px ${SERIF}`; }
          ctx.fillStyle = '#6b1d1d'; ctx.fillText(text, cx, cy);
          if (sub) { const [sx, sy] = tf(0, post + h * 0.26); ctx.font = `italic ${h * 0.24 * S}px ${SERIF}`; ctx.fillStyle = '#5a3d22'; ctx.fillText(sub, sx, sy); }
          const [ax, ay] = tf(-w / 2 + 0.07, post + h - 0.07); const [bx, by] = tf(w / 2 - 0.07, post + 0.07);
          ctx.strokeStyle = 'rgba(120,70,25,.55)'; ctx.lineWidth = Math.max(1, 0.012 * S); ctx.strokeRect(ax, ay, bx - ax, by - ay);
        },
      },
    ],
  };
}

// ---- Nilometer-Klappe: Außenseite (Tür) und Innenseite (Pegeltafel) -----------------------------------------------
export function doorOutsideTex(w, h) {
  const S = 170;
  return canvasTex(w * S, h * S, (g, W, H) => {
    g.fillStyle = '#f2e8cc'; roundRect(g, 0, 0, W, H, 0.05 * S); g.fill();
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#e6cd92'); gr.addColorStop(1, '#cfb072');
    g.fillStyle = gr; roundRect(g, 0.07 * S, 0.07 * S, W - 0.14 * S, H - 0.14 * S, 0.05 * S); g.fill();
    // Quaderfugen
    g.strokeStyle = 'rgba(110,75,30,.35)'; g.lineWidth = 2;
    for (let y = 0.5 * S; y < H - 0.2 * S; y += 0.42 * S) { g.beginPath(); g.moveTo(0.1 * S, y); g.lineTo(W - 0.1 * S, y); g.stroke(); const off = ((Math.round(y / (0.42 * S)) % 2) ? 0.35 : 0.8) * S; for (let x = off; x < W - 0.1 * S; x += 0.9 * S) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 0.42 * S); g.stroke(); } }
    // Lapis-Band oben und unten
    g.fillStyle = '#2a5aa0'; g.fillRect(0.1 * S, 0.14 * S, W - 0.2 * S, 0.16 * S); g.fillStyle = '#e0b040'; g.fillRect(0.1 * S, 0.32 * S, W - 0.2 * S, 0.035 * S);
    g.fillStyle = '#2a5aa0'; g.fillRect(0.1 * S, H - 0.3 * S, W - 0.2 * S, 0.16 * S); g.fillStyle = '#e0b040'; g.fillRect(0.1 * S, H - 0.335 * S, W - 0.2 * S, 0.035 * S);
    // Wasser-Zeichen (drei Zickzack-Linien, Zierde)
    g.strokeStyle = '#2a5aa0'; g.lineWidth = 0.075 * S; g.lineJoin = 'round'; g.lineCap = 'round';
    for (let k = 0; k < 3; k++) { const y = H * 0.30 + k * 0.17 * S; g.beginPath(); for (let i = 0; i <= 6; i++) { const x = W * 0.5 + (i - 3) * 0.12 * S, yy = y + (i % 2 ? -0.045 : 0.045) * S; if (i) g.lineTo(x, yy); else g.moveTo(x, yy); } g.stroke(); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#6b1d1d';
    let fs = 0.25 * S; g.font = `bold ${fs}px ${SERIF}`; while (g.measureText('NILOMETER').width > W - 0.4 * S) { fs -= 1; g.font = `bold ${fs}px ${SERIF}`; }
    g.fillText('NILOMETER', W / 2, H * 0.55);
    g.font = `italic ${0.16 * S}px ${SERIF}`; g.fillStyle = '#5a3d22'; g.fillText('Wie hoch ist die Flut?', W / 2, H * 0.55 + 0.34 * S);
    // Pfeil + Tippen
    g.fillStyle = '#8b1e1e'; g.font = `bold ${0.17 * S}px ${SERIF}`; g.fillText('tippe zum Öffnen', W / 2, H - 0.62 * S);
    g.beginPath(); g.moveTo(W / 2, H - 0.46 * S); g.lineTo(W / 2 - 0.14 * S, H - 0.58 * S + 0.02 * S); g.lineTo(W / 2 + 0.14 * S, H - 0.58 * S + 0.02 * S); g.closePath();
    // Griffknauf
    g.fillStyle = '#e0b040'; g.beginPath(); g.arc(W / 2, H * 0.83, 0.075 * S, 0, TAU); g.fill(); g.strokeStyle = '#8a5f1c'; g.lineWidth = 2; g.stroke();
  });
}
export const DOOR_ZONES = [
  { name: 'Niedrigwasser', note: 'vor der Flut', col: '#c9a064' },
  { name: 'Flut zu klein', note: 'schlechte Ernte', col: '#d98a4a' },
  { name: 'Gute Flut', note: 'gute Ernte', col: '#5aa05a' },
  { name: 'Flut zu groß', note: 'Schäden', col: '#3a7ac0' },
];
export function doorInsideTex(w, h) {
  const S = 170;
  return canvasTex(w * S, h * S, (g, W, H) => {
    g.fillStyle = '#f2e8cc'; roundRect(g, 0, 0, W, H, 0.05 * S); g.fill();
    g.fillStyle = '#fbf3da'; roundRect(g, 0.07 * S, 0.07 * S, W - 0.14 * S, H - 0.14 * S, 0.05 * S); g.fill();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#6b1d1d';
    g.font = `bold ${0.2 * S}px ${SERIF}`; g.fillText('Der Pegel', W / 2, 0.3 * S);
    g.font = `italic ${0.13 * S}px ${SERIF}`; g.fillStyle = '#5a3d22'; g.fillText('Schieb FLUT! und schau zu', W / 2, 0.52 * S);
    const top = 0.75 * S, bot = H - 0.2 * S, rh = (bot - top) / DOOR_ZONES.length;
    DOOR_ZONES.forEach((z, i) => {
      const y = top + i * rh;
      g.fillStyle = z.col; roundRect(g, 0.26 * S, y + 0.05 * S, W - 0.38 * S, rh - 0.1 * S, 0.06 * S); g.fill();
      g.fillStyle = '#fff8e6'; g.textAlign = 'center';
      const cx = 0.26 * S + (W - 0.38 * S) / 2, maxW = W - 0.5 * S;
      let f1 = 0.15 * S; g.font = `bold ${f1}px ${SERIF}`; while (g.measureText(z.name).width > maxW && f1 > 6) { f1 -= 1; g.font = `bold ${f1}px ${SERIF}`; }
      g.fillText(z.name, cx, y + rh * 0.38);
      let f2 = 0.12 * S; g.font = `${f2}px ${SERIF}`; while (g.measureText(z.note).width > maxW && f2 > 6) { f2 -= 1; g.font = `${f2}px ${SERIF}`; }
      g.fillText(z.note, cx, y + rh * 0.7);
    });
    // Markierungsstreifen links (dort läuft der Zeiger)
    g.fillStyle = 'rgba(90,60,25,.35)'; g.fillRect(0.12 * S, top, 0.04 * S, bot - top);
    return;
  });
}

// ---- Wasserstand im Nilometer-Schacht: Säulen (unter der Stufenkante bleibt Wasser weg), Höhe per Aufruf -------------
export function makeShaftWater(xl, xr, floorFn, n, texture) {
  const w = (xr - xl) / n;
  const pos = new Float32Array(n * 4 * 3), uv = new Float32Array(n * 4 * 2), idx = [];
  for (let c = 0; c < n; c++) {
    const a = c * 4, x0 = xl + c * w, x1 = x0 + w;
    pos.set([x0, 0, 0, x1, 0, 0, x1, 0, 0, x0, 0, 0], a * 3);
    uv.set([c / n, 0, (c + 1) / n, 0, (c + 1) / n, 1, c / n, 1], a * 2);
    idx.push(a, a + 1, a + 2, a, a + 2, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  const nor = new Float32Array(n * 4 * 3); for (let i = 0; i < n * 4; i++) nor[i * 3 + 2] = 1;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setIndex(idx);
  const mat = new THREE.MeshLambertMaterial({ map: texture, transparent: true, opacity: 0.92, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 4;
  const bottoms = []; for (let c = 0; c < n; c++) bottoms.push(floorFn(xl + (c + 0.5) * w));
  return {
    mesh, geo, mat,
    setLevel(L) {
      const p = geo.attributes.position;
      for (let c = 0; c < n; c++) {
        const a = c * 4, b = bottoms[c], t = Math.max(b, L);
        p.setY(a, b); p.setY(a + 1, b); p.setY(a + 2, t); p.setY(a + 3, t);
      }
      p.needsUpdate = true;
    },
  };
}
export function shaftWaterTex() {
  return canvasTex(256, 256, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#6cc2ae'); gr.addColorStop(1, '#2f7a72');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(235,255,245,.55)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let y = 30; y < H; y += 46) { for (let x = -10 + ((y / 46) % 2) * 40; x < W; x += 90) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 8, x + 40, y); g.quadraticCurveTo(x + 60, y + 8, x + 80, y); g.stroke(); } }
    g.fillStyle = 'rgba(255,255,255,.65)'; g.fillRect(0, 0, W, 6);
  });
}

// ---- Pegelzeiger (kleines Fähnchen, zeigt nach links auf die Skala) -------------------------------------------------
export function makePointer(size = 0.3) {
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(size, size * 0.42); sh.lineTo(size * 1.9, size * 0.42); sh.lineTo(size * 1.9, -size * 0.42); sh.lineTo(size, -size * 0.42); sh.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0xc0392b, side: THREE.DoubleSide }));
  const edge = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0xfff0b3, side: THREE.DoubleSide }));
  edge.scale.setScalar(1.12); edge.position.set(-size * 0.07, 0, -0.002);
  const g = new THREE.Group(); g.add(edge, m); return g;
}

// ---- zweiseitige Papierklappe, am hinteren Rand (z=0) gelenkt, ragt nach +z. Fläche "top" schaut flach nach oben,
// Fläche "outer" schaut flach nach unten (aufrecht, bei Drehung um -90 Grad um x, schaut sie nach vorn).
export function makeDoorCard(w, h, texTop, texOuter, depth = 0.05) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: texTop }));
  top.rotation.x = -Math.PI / 2; top.position.set(0, depth, h / 2); top.castShadow = true; top.receiveShadow = true;
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: texOuter }));
  outer.rotation.x = Math.PI / 2; outer.position.set(0, 0, h / 2); outer.castShadow = true;
  const rim = new THREE.Mesh(new THREE.BoxGeometry(w, depth, h), new THREE.MeshLambertMaterial({ color: 0xf1e7cf }));
  rim.position.set(0, depth / 2, h / 2); rim.scale.set(0.998, 0.96, 0.998);
  g.add(top, outer, rim); g.userData.top = top; g.userData.bottom = outer; g.userData.hit = [top, outer, rim];
  return g;
}
