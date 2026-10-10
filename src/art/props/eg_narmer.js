// Gruppe O1 – Narmer-Palette (Schieferpalette um 3100 v. Chr.): nur die friedlichen Motive: Hathor-/Bat-Köpfe mit Serech (Wels und Meißel),
// König mit Doppelkrone im Festzug mit Sandalenträger, Schlangenhalspanther um die Farbmulde, Stierköpfe als Zier. Flachrelief auf grünlichem Stein.
// Gebaut in cm (Höhe 64), skaliert auf 0,64 m.
import { K, spec, blob, limb, poly, sym, spline, fillPoly, volume, gloss, bevel, ln, seg, dotAt, ellipseAt, rngOf, flat, stroke2poly } from './_eg_royal_kit.js';

const LIGHT = 'rgba(206,218,200,.80)', LIGHT2 = 'rgba(224,232,216,.88)', SH = 'rgba(14,20,16,.55)', INK = 'rgba(18,26,22,.85)';

export function narmer_palette(opts = {}) {
  const outline = sym([[0, 62.4], [9, 63.4], [17, 64], [20.4, 62], [21.6, 56], [21.2, 38], [20.4, 20], [17.6, 7.6], [10, 1.2], [0, 0]], 1);
  const layer = {
    shapes: [outline], fill: { stops: [[0, '#7f8c7b'], [0.5, '#66736a'], [1, '#4a574f']], dir: 'v' }, stroke: 'rgba(15,25,20,.8)',
    deco(c, bb) {
      volume(c, bb, { dark: 'rgba(10,20,15,.3)', light: 'rgba(230,245,225,.18)' });
      // Steinmaserung
      const r = rngOf(5, 3);
      for (let i = 0; i < 260; i++) dotAt(c, bb.x0 + r() * bb.w, bb.y0 + r() * bb.h, 0.12 + r() * 0.28, r() < 0.5 ? 'rgba(30,40,34,.5)' : 'rgba(200,215,200,.35)');
      gloss(c, bb, { ang: 0.1, pos: 0.12, w: 0.07, a: 0.25, color: '230,245,225' });
      bevel(c, [outline], bb);

      // ---- Hilfsfunktionen: Flachrelief (Schatten, Fläche, Kontur)
      const R = (pts, fill = LIGHT) => {
        fillPoly(c, pts.map(([x, y]) => [x + 0.16, y - 0.16]), SH);
        fillPoly(c, pts, fill);
        const q = pts.concat([pts[0]]); ln(c, q, INK, 0.14);
      };
      const L = (pts, w = 0.14, col = INK) => ln(c, pts, col, w);
      const E = (x, y, rx, ry, fill = LIGHT, rot = 0) => { ellipseAt(c, x + 0.22, y - 0.22, rx, ry, SH, 1, rot); ellipseAt(c, x, y, rx, ry, fill, 1, rot); };

      // ---- Oberes Register: zwei Hathor-/Bat-Köpfe + Serech
      for (const sg of [-1, 1]) {
        const hx = sg * 13.6, hy = 55.2;
        // Hörner (nach außen und oben, oben eingerollt)
        const horn = spline([[hx + sg * 2.4, hy + 2.0, 1.0], [hx + sg * 4.6, hy + 3.6, 0.9], [hx + sg * 4.6, hy + 6.0, 0.8], [hx + sg * 2.8, hy + 7.0, 0.5]], 6);
        R(limb(horn.map((p) => [p[0], p[1], p[2]]), { per: 1 }), LIGHT2);
        // Kuhohren
        E(hx + sg * 3.7, hy + 0.2, 1.8, 0.85, LIGHT, sg * 0.3);
        // Gesicht (menschlich, breit)
        E(hx, hy, 3.0, 3.6, LIGHT2);
        for (const e of [-1, 1]) ellipseAt(c, hx + e * 1.2, hy + 0.8, 0.55, 0.3, 'rgba(18,26,22,.9)');
        L([[hx, hy + 0.2], [hx, hy - 1.0]], 0.14); L([[hx - 0.9, hy - 2.0], [hx, hy - 2.3], [hx + 0.9, hy - 2.0]], 0.14);
        for (const e of [-1, 1]) L([[hx + e * 2.9, hy + 1.6], [hx + e * 3.1, hy - 2.2], [hx + e * 2.6, hy - 4.6]], 0.14);
      }
      // Serech (Palastfassade): oben Wels und Meißel, unten Nischenfassade
      R([[-4.4, 46.6], [4.4, 46.6], [4.4, 59.4], [-4.4, 59.4]], LIGHT);
      R([[-3.6, 47.4], [3.6, 47.4], [3.6, 51.6], [-3.6, 51.6]], 'rgba(150,165,150,.7)');
      for (let i = -3; i <= 3; i++) L([[i * 1.0, 47.5], [i * 1.0, 51.5]], 0.12);
      // Wels (n'r)
      E(0.4, 57.0, 2.4, 0.95, LIGHT2);
      R([[-2.0, 57.0], [-3.6, 58.2], [-3.4, 55.8]], LIGHT2);
      L([[2.5, 56.8], [3.5, 56.1]], 0.12); L([[2.5, 57.2], [3.6, 57.9]], 0.12);
      dotAt(c, 1.7, 57.3, 0.2, INK);
      // Meißel (mr)
      R([[-0.5, 52.6], [0.5, 52.6], [0.8, 54.8], [-0.8, 54.8]], LIGHT2);
      R([[-1.1, 52.6], [1.1, 52.6], [0.6, 53.4], [-0.6, 53.4]], LIGHT2);

      // ---- Mittleres Register: König mit Doppelkrone (schreitet nach rechts) + Sandalenträger
      L([[-17, 44.6], [17, 44.6]], 0.12, 'rgba(18,26,22,.5)'); L([[-17, 21.6], [17, 21.6]], 0.12, 'rgba(18,26,22,.5)');
      const man = (ox, oy, k, king) => {
        const T = (pts) => pts.map(([x, y]) => [ox + x * k, oy + y * k]);
        const Rr = (pts, f) => R(T(pts), f);
        const Ll = (pts, w) => L(T(pts), w);
        const Ee = (x, y, rx, ry, f) => E(ox + x * k, oy + y * k, rx * k, ry * k, f);
        // Beine (schreitend)
        Rr(poly([[-0.6, 7], [1.2, 7], [2.6, 3], [3.4, 0.6], [1.6, 0.6], [1.0, 3.2], [-0.6, 7]], 1), LIGHT);
        Rr(poly([[-2.4, 7], [-0.6, 7], [-1.6, 3.2], [-2.4, 0.6], [-4.2, 0.6], [-3.4, 3.2]], 1), LIGHT);
        Rr([[-0.2, 0.6], [3.8, 0.6], [3.8, 0], [-0.2, 0]], LIGHT);
        // Schurz mit Gürtel
        Rr(poly([[-2.8, 11], [2.4, 11], [3.4, 6.2], [-3.2, 6.2]], 1), LIGHT2);
        Ll([[-2.8, 10.2], [2.6, 10.2]], 0.12);
        Ll([[-2.9, 10.4], [-4.8, 7.4], [-4.6, 4.2]], 0.14);        // Stierschwanz
        // Oberkörper (frontal), Arme
        Rr(poly([[-2.6, 17.2], [2.8, 17.2], [2.0, 14], [1.2, 11], [-1.4, 11], [-2.0, 14]], 1), LIGHT);
        Rr(poly([[-0.6, 17.4], [1.0, 17.4], [1.0, 18.8], [-0.6, 18.8]], 1), LIGHT2);
        if (king) {
          Rr(poly([[1.6, 16], [3.4, 15.6], [5.4, 14], [6.4, 14.2], [6.4, 13.2], [5.2, 12.8], [3.4, 14.2], [1.6, 14.4]], 1), LIGHT);
          Ll([[5.8, 13.8], [6.4, 18.6]], 0.2);
          for (let i = -1; i <= 1; i++) Ll([[6.4, 18.6], [6.4 + i * 0.9, 16.6], [6.4 + i * 1.5, 14.9]], 0.12);
        } else {
          Rr(poly([[1.6, 16], [3.4, 15.2], [5.4, 14.8], [5.4, 13.8], [3.4, 14.2], [1.6, 14.4]], 1), LIGHT);
          // Gefäß und Sandalen
          Rr(poly([[4.6, 14.2], [7.4, 14.2], [7.6, 11.6], [6.8, 10.2], [5.2, 10.2], [4.4, 11.6]], 2), LIGHT2);
          Ll([[4.6, 14.2], [6, 15.6]], 0.14);
        }
        // Kopf im Profil mit Auge und Bart
        Rr(poly([[-1.5, 18.6], [1.7, 18.6], [1.9, 20.8], [3.0, 21.4], [2.8, 22.3], [1.8, 23.2], [-1.5, 23.4]], 1), LIGHT);
        Ee(1.4, 22.2, 0.55, 0.3, 'rgba(18,26,22,.9)');
        if (king) Rr([[1.4, 18.6], [2.4, 18.6], [2.1, 17.4], [1.3, 17.4]], LIGHT2);
        if (king) {
          // Doppelkrone: rotes Hinterteil, weiße Haube, Uräus
          Rr(poly([[-2.2, 22.2], [0.2, 22.2], [0.4, 26.8], [-0.6, 27.6], [-2.0, 27]], 1), LIGHT);
          Rr(poly([[-0.8, 23.4], [2.0, 23.4], [2.2, 26.6], [1.4, 28.4], [0.2, 28.6], [-0.6, 27]], 2), LIGHT2);
          Ll([[2.0, 23.4], [3.0, 24.6], [2.4, 25.4]], 0.12);
        } else {
          Rr(poly([[-1.8, 22.4], [2.0, 22.4], [2.2, 23.6], [1.2, 24.4], [-1.6, 24.4]], 1), 'rgba(30,38,34,.7)');   // Perücke
        }
      };
      man(3.0, 21.8, 1.0, true);
      man(-9.8, 21.8, 0.82, false);

      // ---- Unteres Register: Schlangenhalspanther um die Farbmulde
      const wx = 0, wy = 14.2;
      // Mulde (ringförmiger Rand + vertieft)
      ellipseAt(c, wx + 0.28, wy - 0.28, 6.9, 6.9, SH);
      ellipseAt(c, wx, wy, 6.7, 6.7, LIGHT);
      ellipseAt(c, wx, wy, 5.1, 5.1, 'rgba(32,42,36,.95)');
      ln(c, [[wx - 4.2, wy + 2.2], [wx - 2, wy + 4.2], [wx + 1, wy + 4.7]], 'rgba(150,165,150,.35)', 0.35);
      // Hälse: je ein Strang außen um die Mulde, oben ineinander verschlungen
      const neckL = limb([[-12.4, 9.6, 1.6], [-11.4, 15.8, 1.5], [-7.2, 20.2, 1.4], [-1.6, 21.8, 1.3], [2.4, 19.4, 1.2]], { per: 8 });
      const neckR = limb([[12.4, 9.6, 1.6], [11.4, 15.8, 1.5], [7.2, 20.2, 1.4], [1.6, 21.8, 1.3], [-2.4, 19.4, 1.2]], { per: 8 });
      R(neckL, LIGHT2); R(neckR, LIGHT2);
      // Köpfe der Panther (einander zugewandt, oben auf der Mulde)
      R(poly([[2.2, 19.4], [4.6, 20.6], [5.4, 20.0], [4.6, 18.6], [3, 18.2]], 1), LIGHT); ellipseAt(c, 3.4, 19.6, 0.22, 0.22, 'rgba(18,26,22,.9)');
      R(poly([[-2.2, 19.4], [-4.6, 20.6], [-5.4, 20.0], [-4.6, 18.6], [-3, 18.2]], 1), LIGHT); ellipseAt(c, -3.4, 19.6, 0.22, 0.22, 'rgba(18,26,22,.9)');
      // Körper links/rechts mit Beinen und Schwanz
      for (const sg of [-1, 1]) {
        R(poly([[sg * 8.8, 8.2], [sg * 15.6, 8.4], [sg * 17.2, 11], [sg * 15, 12.6], [sg * 9.4, 12.2]], 2), LIGHT);
        R([[sg * 10.2, 8.4], [sg * 11.6, 8.4], [sg * 11.4, 4.2], [sg * 10.2, 4.2]], LIGHT); R([[sg * 14.2, 8.4], [sg * 15.6, 8.4], [sg * 15.4, 4.2], [sg * 14.2, 4.2]], LIGHT);
        L([[sg * 17, 11], [sg * 19, 12.4], [sg * 18.6, 15]], 0.26);
      }
      // Stierköpfe (frontal, Zierde) in den unteren Ecken
      for (const sg of [-1, 1]) {
        const bx = sg * 12.4, by = 3.0;
        const horn = spline([[bx + sg * 1.6, by + 1.2, 0.8], [bx + sg * 3.6, by + 2.8, 0.7], [bx + sg * 3.4, by + 5.0, 0.5], [bx + sg * 1.8, by + 5.6, 0.3]], 6);
        R(limb(horn.map((p) => [p[0], p[1], p[2]]), { per: 1 }), LIGHT2);
        R(poly([[bx - 1.7, by + 1.8], [bx + 1.7, by + 1.8], [bx + 1.3, by - 1.4], [bx + 0.5, by - 2.0], [bx - 0.5, by - 2.0], [bx - 1.3, by - 1.4]], 2), LIGHT2);
        for (const e of [-1, 1]) ellipseAt(c, bx + e * 0.9, by + 0.8, 0.22, 0.16, 'rgba(18,26,22,.9)');
      }
      // Rahmenlinie
      L([[-19.4, 8], [-19.8, 40], [-19.2, 58]], 0.18, 'rgba(18,26,22,.4)'); L([[19.4, 8], [19.8, 40], [19.2, 58]], 0.18, 'rgba(18,26,22,.4)');
    },
  };
  return spec('narmer_palette', 'Narmer-Palette', { body: { z: 1, layers: [layer] } }, { top: [0, 62], well: [0, 14.2], king: [3, 38] },
    { heightM: 0.64, ranges: {}, desc: 'Schieferpalette des Narmer (um 3100 v. Chr.), friedliche Motive: Hathorköpfe, Serech, König mit Doppelkrone, Schlangenhalspanther, Stierköpfe' }, { h: opts.h || 0.64 });
}
