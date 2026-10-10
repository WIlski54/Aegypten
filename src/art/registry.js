// Registry of all animal / prop specs. Each module default-exports a factory returning a spec.
import coelophysis from './animals/coelophysis.js';
import trex from './animals/trex.js';
import human from './animals/human.js';
import a from './reg_a.js';
import b from './reg_b.js';
import c from './reg_c.js';
import d from './reg_d.js';
import e from './reg_e.js';
import f from './reg_f.js';

export const ANIMALS = { coelophysis, trex, human, ...a, ...b, ...c, ...d, ...e, ...f };
