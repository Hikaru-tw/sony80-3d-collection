// Sony CHF 90 compact cassette (1980 illustration) — the full model lives in ../cassette.js.
import { buildCassette } from '../cassette.js';

export default {
  id: 'chf', name: 'Sony Tape CHF 90', textures: ['label_a', 'label_b'], ink: 1, openLabel: 'Open shell', insideView: [-62, 34, 1.5],   // its own drawn lines cover the detail; ink adds the outer outline
  build(THREE, K, T, P) {
    const m = buildCassette(THREE, { labelA: T.label_a, labelB: T.label_b, edges: true, shell: P.shell });
    // backing a real shell has behind the windows (hub cores, far slip sheet): stops the GIF seeing through to the page
    const S = 1 / 63.8, back = K.mat(0xd9d0c2), core = K.mat(0xf2f2f2);
    const backing = K.box(30 * S, 14 * S, 0.3 * S, 0, (31.9 - 28.65) * S, 0, back);
    m.add(backing);
    for (const x of [28.95, 71.45]) m.add(K.cylZ((x - 50.2) * S, (31.9 - 28.65) * S, -0.4 * S, 0.4 * S, 4.4 * S, { side: core }));
    // the backing is only a stand-in seen through the closed windows; once the shell opens it would float between the reels
    const open = m.userData.setExplode;
    m.userData.setExplode = t => { open(t); backing.visible = t < 0.02; };
    return m;
  },
};
