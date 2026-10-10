// Gemeinsame generische Kulissen (aus dem Dino-Buch übernommen, hier nur die noch genutzten): Palme, Akazie, Schilf, Gras, Busch, Felsbrocken, Wolken, Sonne, Wellenband.
import { palm, acacia } from './props/plants_trees.js';
import { grass_tuft, bush, reeds } from './props/plants_small.js';
import { boulder } from './props/rocks.js';
import { cloud_a, cloud_b, sun_disc, wave_strip } from './props/sky_fx.js';

export default {
  palm: (o) => palm(o),
  acacia: (o) => acacia(o),
  grass_tuft: (o) => grass_tuft(o),
  bush: (o) => bush(o),
  reeds: (o) => reeds(o),
  boulder: (o) => boulder(o),
  cloud_a: (o) => cloud_a(o),
  cloud_b: (o) => cloud_b(o),
  sun_disc: (o) => sun_disc(o),
  wave_strip: (o) => wave_strip(o),
};
