// Registry group S1 (Landschaft, Pyramiden, Pflanzen): id -> factory. Owned by art group S1.
import { pyramide_gizeh, pyramide_cheops, pyramide_bau } from './props/eg_land.js';

export default {
  pyramide_gizeh: (o) => pyramide_gizeh(o),
  pyramide_cheops: (o) => pyramide_cheops(o),
  pyramide_bau: (o) => pyramide_bau(o),
};
