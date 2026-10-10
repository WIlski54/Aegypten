// Registry group E: id -> factory. Owned by art group E. (Pflanzen, Felsen, Requisiten; Fabriken akzeptieren opts)
import { fern_ground, tree_fern, horsetail, cycad } from './props/plants_ferns.js';
import { araucaria, conifer_round, ginkgo, magnolia, palm, acacia } from './props/plants_trees.js';
import { grass_tuft, bush, reeds } from './props/plants_small.js';
import { mesa_red, cliff_layers, boulder, rock_pillar, volcano, nest_mound, ash_mound, island_rock } from './props/rocks.js';
import { cloud_a, cloud_b, sun_disc, asteroid, wave_strip, footprint, dino_track } from './props/sky_fx.js';

export default {
  fern_ground: (o) => fern_ground(o),
  tree_fern: (o) => tree_fern(o),
  horsetail: (o) => horsetail(o),
  cycad: (o) => cycad(o),
  araucaria: (o) => araucaria(o),
  conifer_round: (o) => conifer_round(o),
  ginkgo: (o) => ginkgo(o),
  magnolia: (o) => magnolia(o),
  palm: (o) => palm(o),
  acacia: (o) => acacia(o),
  grass_tuft: (o) => grass_tuft(o),
  bush: (o) => bush(o),
  reeds: (o) => reeds(o),
  mesa_red: (o) => mesa_red(o),
  cliff_layers: (o) => cliff_layers(o),
  boulder: (o) => boulder(o),
  rock_pillar: (o) => rock_pillar(o),
  volcano: (o) => volcano(o),
  nest_mound: (o) => nest_mound(o),
  ash_mound: (o) => ash_mound(o),
  island_rock: (o) => island_rock(o),
  cloud_a: (o) => cloud_a(o),
  cloud_b: (o) => cloud_b(o),
  sun_disc: (o) => sun_disc(o),
  asteroid: (o) => asteroid(o),
  wave_strip: (o) => wave_strip(o),
  footprint: (o) => footprint(o),
  dino_track: (o) => dino_track(o),
};
