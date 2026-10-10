// Bäckerin (1,55 m): Frau im wadenlangen Leinenkleid mit Stirnband, Teigschale im fernen Arm (vor dem Bauch),
// der nahe Arm knetet (ranges.armA: [0, -0.3] = Faust drückt in den Teig).
// opts.tool: 'teig' (Vorgabe, Teigschale) | 'brot' (Brotbrett mit Laiben)
import { person } from './_eg_person.js';

export default function make(opts = {}) {
  const brot = opts.tool === 'brot';
  const s = person({
    id: 'baeckerin', name: 'Bäckerin', heightM: 1.55, sex: 'w', pose: opts.pose === 'walk' ? 'walk' : 'stand',
    head: 'lang', band: '#c0432e', garment: 'kleid', hem: 0.16, collar: 'perlen',
    armB: brot ? { u: 0.25, f: 1.55, hand: 'fist' } : { u: 0.5, f: 1.75, hand: 'fist' }, armBFront: true,
    holdB: brot ? 'brotbrett' : { prop: 'teigschale', dx: 0.07 },
    armA: brot ? 'haengen' : { u: 0.05, f: 2.2, hand: 'fist' },
  });
  s.meta.ranges.armA = brot ? [0, 0.4] : [0, -0.3];
  s.meta.ranges.armB = [0, 0];
  return s;
}
