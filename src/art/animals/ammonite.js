// Ammonit (~0,25 m): gerippte Spiralschale mit Perlmutt-Schimmer; Kopf mit grossen Augen und Fangarmen schaut aus der Muendung (Blick nach +x).
// Teil: body.
import { limb, blob, poly } from '../dsl.js';
import { volume, eye } from '../paint.js';
import { smooth, strokePath, glow, curve, outline, pearl, scaleSpec, fillPoly } from './_c_helpers.js';

export default function make(opts = {}) {
  const R = 0.125, G = 1.9, CX = 0.0, PHI_E = (80 * Math.PI) / 180;
  let CY = 0;
  const rAt = (u) => R * Math.pow(G, u);
  const phiAt = (u) => PHI_E - 2 * Math.PI * u;                 // u<=0: clockwise growth, aperture on top facing +x
  const pt = (u, f = 1) => { const r = rAt(u) * f, a = phiAt(u); return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };

  // lowest point of the spiral sits on y=0.004
  let minY = 1e9; for (let k = 0; k <= 120; k++) minY = Math.min(minY, pt(-1 + k / 120)[1]);
  CY = 0.004 - minY;
  // silhouette: last whorl (outer spiral) + aperture step
  const shell = [];
  for (let k = 0; k <= 120; k++) shell.push(pt(-1 + k / 120));

  // ribs + sutures
  const ribs = [];
  const nPerTurn = 28;
  for (let j = 0; j <= nPerTurn * 3; j++) {
    const u = -(nPerTurn * 3 - j) / nPerTurn;           // from -3 .. 0
    if (u < -1.75) continue;
    if (u > -0.02) continue;
    const a = pt(u, 1), b = pt(u - 1, 1);              // outer edge point and inner edge point (one turn earlier)
    const a2 = phiAt(u - 0.5) ; const mid = [CX + rAt(u - 0.5) * 1.06 * Math.cos(a2 + 0.22), CY + rAt(u - 0.5) * 1.06 * Math.sin(a2 + 0.22)];
    ribs.push({ a, b, mid, w: rAt(u) });
  }
  const suture = [];
  for (let k = 0; k <= 400; k++) suture.push(pt(-4 + (k / 400) * 3.98));

  // soft body (designed for CY=0.14, shifted with the shell)
  const DYB = CY - 0.14;
  const hd = [0.056, 0.232 + DYB];
  const head = blob(hd[0], hd[1], 0.046, 0.04, -0.2);
  const sh = (ctrl) => ctrl.map(([x, y, w]) => [x, y + DYB, w]);
  const arms = [
    limb(sh([[0.075, 0.244, 0.02], [0.115, 0.252, 0.017], [0.155, 0.246, 0.012], [0.185, 0.228, 0.006]]), { per: 8 }),
    limb(sh([[0.08, 0.232, 0.022], [0.12, 0.232, 0.018], [0.162, 0.218, 0.013], [0.19, 0.195, 0.006]]), { per: 8 }),
    limb(sh([[0.078, 0.22, 0.02], [0.112, 0.208, 0.017], [0.145, 0.188, 0.012], [0.162, 0.162, 0.006]]), { per: 8 }),
    limb(sh([[0.07, 0.21, 0.018], [0.095, 0.192, 0.015], [0.118, 0.168, 0.011], [0.128, 0.145, 0.005]]), { per: 8 }),
  ];
  const OUT = 'rgba(70,35,15,.6)';
  const spec = {
    id: 'ammonite',
    parts: {
      body: {
        z: 1,
        layers: [
          { shapes: arms, fill: { top: '#f0c3b0', bottom: '#e29f8c' }, stroke: null, deco: (c, bb) => { volume(c, bb, { dark: 'rgba(120,50,40,0.18)', light: 'rgba(255,240,220,0.2)' }); outline(c, arms, OUT, 0.0035); } },
          {
            shapes: [head], fill: { top: '#f3cdb8', bottom: '#e7a995' }, stroke: null,
            deco: (c, bb) => {
              volume(c, bb, { dark: 'rgba(120,50,40,0.2)', light: 'rgba(255,240,220,0.2)' });
              eye(c, 0.07, 0.236 + DYB, 0.02, { color: '#1b120c', look: 0.45 });
              strokePath(c, [[0.1, 0.222 + DYB], [0.088, 0.214 + DYB], [0.075, 0.214 + DYB]], 'rgba(90,35,25,.6)', 0.003, 1);
              outline(c, [head], OUT, 0.0035);
            },
          },
          {
            shapes: [shell], fill: { stops: [[0, '#f0b074'], [0.5, '#d98542'], [1, '#a9552a']], dir: 'v' }, stroke: null,
            deco: (c, bb) => {
              volume(c, bb, { dark: 'rgba(60,25,5,0.2)', light: 'rgba(255,240,200,0.2)' });
              // ribs: bold, slightly forward-curving
              for (const r of ribs) {
                strokePath(c, curve([r.b, r.mid, r.a], 5), 'rgba(110,52,18,.5)', Math.max(0.0018, r.w * 0.04), 1);
              }
              // light rib crests
              for (let i = 0; i < ribs.length; i += 1) {
                const r = ribs[i]; if (r.w < R * 0.52) continue;
                const q = [(r.mid[0] + r.a[0]) / 2 + 0.0008, (r.mid[1] + r.a[1]) / 2 + 0.0008];
                strokePath(c, [r.mid, q], 'rgba(255,230,180,.35)', Math.max(0.0012, r.w * 0.025), 1);
              }
              strokePath(c, suture, 'rgba(70,30,10,.55)', 0.0035, 1);
              glow(c, 0.01, 0.22 + DYB, 0.09, 0.045, 'rgba(255,250,220,0.9)', 0.35, 0.3);
              pearl(c, { x0: -0.125, x1: 0.125, y0: CY - 0.125, y1: CY + 0.125, w: 0.25, h: 0.25 }, { alpha: 0.55, seed: 9, bands: 6 });
              outline(c, [shell], OUT, 0.004);
            },
          },
        ],
      },
    },
    anchors: { head: hd, eye: [0.07, 0.236 + DYB], mouth: [0.1, 0.22 + DYB], back: [0.0, CY + 0.125], foot: [0.0, 0.004] },
    meta: { name: 'Ammonit', lengthM: 0.3, epoch: 'Jura', ranges: {} },
  };
  return spec;
}
