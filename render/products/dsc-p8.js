// Sony Cyber-shot DSC-P8 (2003), red. Face art: tex/dsc-p8.png. 108 x 51.5 x 35.1 mm incl. the lens (Sony Japan spec via
// kakaku.com; the sticker's body is drawn at exactly 108 : 51.5). From reference image/real-product/dsc-p8/ (Sony's photo,
// Commons P8 / P9 photos, iFixit's DSC-P10 guides - the P10 is the 5 MP twin in the same body):
//   front cover red with a silver seam band behind it; round right-hand end concentric with the 3x zoom; silver grip,
//   flash, optical viewfinder window, AF lamp; "3x OPTICAL ZOOM" printed on the round end
//   top: silver plate from the grip end to just past the mic with the mode dial (shutter button in its centre), POWER
//   lamp, POWER button and mic holes in a row; the raised viewfinder hump behind the plate, from the dial to above the
//   finder window (P8 front 3/4 and P10 straight-on photos: x -20.5 .. 5.5 mm), its back a black eyepiece frame with
//   three small lamps
//   back (P10 back and bottom photos, scaled on the bottom plate): LCD x -6.5 .. 30.5 mm, 5-way pad at x -24.5 with a
//   button above-left, MENU below-left and one below-right, W/T zoom rocker in the top corner at the grip end, speaker
//   holes under it, DC IN / A/V OUT / USB cover along the bottom edge under the pad; their printed icons and labels,
//   SONY by the LCD, OPEN on the end door
//   bottom: rating plate over the whole flat bottom, tripod socket at x -14 towards the front; left end: battery /
//   Memory Stick door, strap eyelet above it
// Inside (iFixit DSC-P10): lens block with its orange flex behind the zoom, xenon flash in a clear reflector with the big
// black capacitor, main board behind the front over the grip half, LCD module and the key board (gold switch pads,
// DC / A/V / USB jacks) behind, NP-FC11 battery and
// Memory Stick under the grip, both entering from the left end. The dial, top plate, bottom plate and end door stay on
// the chassis when the covers come off, as in the teardown. setExplode(t): the lens extends as at power-on (t 0-0.3),
// then the covers come apart.
export default {
  id: 'dsc-p8', name: 'Sony Cyber-shot DSC-P8', textures: ['tex/dsc-p8'], ink: 1.5,
  openLabel: 'Open up', insideView: [-62, 22, 1.4],    // viewer: [azimuth, elevation, distance x fit]
  build(THREE, K) {
    const g = new THREE.Group(), W = 108, H = 51.5, D = 27, X0 = -W / 2, X1 = W / 2, Y1 = H / 2, ZF = D / 2, ZB = -D / 2, ZS = ZF - 9.5;
    const front = new THREE.Group(), back = new THREE.Group(), mid = new THREE.Group(), lens = new THREE.Group(), inner = new THREE.Group();
    g.add(front, back, mid, lens, inner);
    const M = K.mapping([76, 128, 1458, 787], [X0, Y1, X1, -Y1]);
    const red = K.mat(0xd8323f), redDk = K.mat(0xb0262f), silver = K.mat(0xc8ccd0), silverLt = K.mat(0xdfe2e5), steel = K.mat(0x9ea3a8), dark = K.mat(0x2e2a29), black = K.mat(0x1d1d1f);
    // grip-end corners as drawn on the sticker (top 7 mm, bottom 6 mm); the lens end is a half circle round the zoom
    const outline = (inset = 0) => K.rr(0, 0, W - 2 * inset, H - 2 * inset, [7 - inset, Y1 - inset, Y1 - inset, 6 - inset].map(r => Math.max(0.5, r)));
    const hollow = (inset, t) => { const s = outline(inset), h = new THREE.Path(); outline(inset + t).getPoints(12).forEach((q, i) => i ? h.lineTo(q.x, q.y) : h.moveTo(q.x, q.y)); s.holes.push(h); return s; };
    // the zoom's drawn rings are circles about 1138.8, 455.5 px (least-squares fits to the mid-lines of the black rings:
    // 178.9, 242.1 and 284.9 px; the glass's black disc is 131.7 px about 1141.8, 457)
    const [lx, ly] = M.mm(1138.8, 455.5), r = px => M.sx(px), RX = X1 - Y1;   // RX: centre of the round end
    const lensHole = () => K.hole(lx, ly, r(284.9) + 0.3);
    // ---- front cover: face (art) + walls, grip, flash, finder, AF lamp; seam band; back cover ----
    // The walls run unbevelled into the straight middle band of the rounded face / back plates, so the shell reads as one
    // moulding: a groove there inked as a dashed line at grazing angles, and walls meeting the plates edge to edge left
    // pixel cracks (ink specks along the edge).
    const face = outline(); face.holes.push(lensHole());
    front.add(K.slab(face, ZF - 2, ZF, { front: K.art, side: red, back: redDk, bevel: 0.8, M, rim: 'front' }));   // full outline at ZF-1.2 .. ZF-0.8
    front.add(K.slab(hollow(0, 1.4), ZS, ZF - 1, { side: red, front: red, back: redDk }));
    // grip and flash window: outlines traced on the art (tex/dsc-p8.png, px), the mid-line of each black ink outline, so
    // their rims run inside the drawn lines (the hand-placed outlines stood up to 10 px outside, a silver band round each);
    // finder and AF lamp are drawn solid black, so they take the black's outer edge
    const traced = pts => K.poly(pts.map(p => M.mm(...p)));
    const GRIP = [[429.1, 501.2], [433.8, 515.4], [437.1, 528.3], [445.7, 554.3], [453.6, 585.1], [468.4, 638.0], [470.5, 650.8], [470.4, 661.9], [468.0, 670.7], [463.8, 677.5], [458.7, 683.2], [453.0, 688.0], [446.8, 692.1], [440.0, 695.2], [432.6, 696.6], [424.8, 696.6], [416.8, 695.6], [408.9, 693.8], [401.1, 691.4], [393.4, 688.1], [372.1, 676.3], [365.6, 672.2], [353.7, 663.2], [343.0, 654.0], [333.5, 644.8], [304.8, 611.0], [294.1, 596.5], [276.0, 566.3], [271.9, 556.4], [266.4, 540.0], [260.0, 524.6], [251.5, 490.5], [251.3, 471.9], [250.3, 455.2], [250.2, 446.2], [252.1, 421.9], [253.7, 411.2], [256.2, 400.3], [266.5, 372.0], [278.1, 346.3], [285.5, 332.5], [294.7, 319.7], [305.2, 306.8], [311.0, 300.7], [317.4, 295.4], [324.1, 291.1], [331.2, 288.0], [338.6, 286.6], [346.2, 287.6], [353.7, 291.1], [360.8, 296.7], [367.5, 303.6], [373.5, 312.1], [378.8, 322.3], [383.2, 333.5], [386.8, 345.1], [396.7, 383.0], [408.3, 420.2], [412.2, 440.5], [417.2, 458.4], [420.8, 468.5], [425.0, 483.4]];
    const FLASH = [[703.2, 225.3], [702.8, 229.9], [701.9, 234.5], [700.4, 239.0], [698.2, 243.4], [695.3, 247.5], [684.7, 258.3], [676.9, 264.4], [672.5, 266.9], [667.2, 268.8], [660.8, 269.8], [641.3, 270.1], [609.4, 269.6], [597.6, 270.2], [587.4, 269.5], [569.6, 270.1], [557.2, 268.5], [541.9, 269.5], [523.7, 269.6], [509.5, 269.0], [486.1, 269.7], [479.1, 269.4], [472.4, 268.6], [466.6, 266.9], [461.9, 264.5], [457.7, 261.6], [450.4, 255.0], [443.6, 247.5], [440.8, 243.4], [438.6, 239.1], [437.3, 234.5], [436.6, 225.3], [437.9, 216.1], [439.2, 211.6], [441.1, 207.2], [446.7, 199.2], [453.7, 192.1], [457.7, 188.9], [462.3, 186.3], [473.2, 182.4], [485.4, 180.6], [497.6, 180.3], [520.6, 181.2], [537.0, 180.5], [548.1, 181.4], [558.4, 180.5], [568.0, 180.5], [580.5, 181.5], [597.0, 181.4], [609.9, 180.4], [627.0, 180.4], [640.2, 181.2], [659.5, 181.4], [665.8, 182.4], [671.6, 184.0], [676.7, 186.3], [684.7, 192.3], [691.4, 199.4], [697.4, 207.3], [699.8, 211.6], [701.6, 216.1], [702.7, 220.6]];
    front.add(K.slab(traced(GRIP), ZF - 0.6, ZF + 1.6, { front: K.art, side: silver, bevel: 0.8, M, rim: 'front', artEdge: true }));
    front.add(K.slab(traced(FLASH), ZF - 0.6, ZF + 0.9, { front: K.art, side: silver, bevel: 0.4, M, rim: 'front', artEdge: true }));   // flash window
    front.add(K.slab(K.rr(...M.mm(811.75, 225.25), r(145), M.sy(101.5), 1.5), ZF - 0.6, ZF + 0.8, { front: K.art, side: dark, bevel: 0.3, M, rim: 'front' }));   // finder window
    front.add(K.cylZ(...M.mm(933.2, 191.9), ZF - 0.6, ZF + 0.9, r(32), { front: K.art, side: dark, bevel: 0.4, M, rim: 'front' }));                        // AF lamp
    front.add(K.cylZ(lx, ly, ZF - 1.2, ZF + 1.2, r(284.9), { front: K.art, side: silver, bevel: 0.5, M, segs: 72, rim: 'front', artEdge: true }));        // outer lens ring (on the cover)
    mid.add(K.slab(hollow(0, 1.2), ZS - 1.4, ZS, { side: silverLt, front: silverLt, back: silverLt, bevel: 0.3, rim: 'both' }));                          // silver seam band
    back.add(K.slab(hollow(0, 1.4), ZB + 1, ZS - 1.4, { side: red, front: redDk, back: redDk }));
    back.add(K.slab(outline(), ZB, ZB + 2, { side: red, front: redDk, back: red, bevel: 0.8, rim: 'back' }));       // full outline at ZB+0.8 .. ZB+1.2
    // "3x OPTICAL ZOOM" printed on the round end of the front cover (Sony's photo): white letters only, on a strip of the
    // end's own cylinder, kept out of the ink pass so it adds no outline
    const endTxt = (() => {
      const c = document.createElement('canvas'); c.width = 128; c.height = 192; const x = c.getContext('2d');
      x.fillStyle = '#f2f2f2'; x.textAlign = 'center'; x.font = 'bold 76px Arial'; x.fillText('3x', 64, 92); x.font = 'bold 22px Arial'; x.fillText('OPTICAL', 64, 128); x.fillText('ZOOM', 64, 154);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      return new THREE.MeshLambertMaterial({ map: t, transparent: true, depthWrite: false });
    })();
    {
      const R = Y1 + 0.05, a = 6.2 / R, z0 = ZS + 0.6, z1 = ZF - 1.4, n = 12, pos = [], nor = [], uv = [], idx = [];
      for (let i = 0; i <= n; i++) {
        const t = -a + 2 * a * i / n, c = Math.cos(t), s = Math.sin(t);
        for (const [z, u] of [[z1, 0], [z0, 1]]) { pos.push(RX + R * c, R * s, z); nor.push(c, s, 0); uv.push(u, i / n); }   // reads front to back
      }
      for (let i = 0; i < n; i++) { const p = 2 * i; idx.push(p, p + 1, p + 3, p, p + 3, p + 2); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
      const et = new THREE.Mesh(geo, endTxt); et.userData.noInk = true; front.add(et);
    }
    // ---- top: silver plate, mode dial with the shutter in its centre, POWER lamp + button, mic (on the chassis) ----
    const top = Y1, dx = M.mm(391, 0)[0], zp = ZS + 2.5;   // plate / dial centre line, z 0 .. 13
    const plate = K.slab(K.rr(0, 0, 46.5, 13, [6, 5.5, 5.5, 6]), top - 0.6, top + 0.9, { side: silver, front: silver, bevel: 0.4, rim: 'front' });
    plate.rotation.x = -Math.PI / 2; plate.position.set(-24.75, 0, zp); inner.add(plate);   // local y -> -z; from where the corner rounds (x -48) to just past the mic
    const dial = K.slab(K.gear(0, 0, r(136), r(141), 40), top + 0.6, top + 4.6, { side: silver, front: silverLt, bevel: 0.4, rim: 'front' });
    dial.rotation.x = -Math.PI / 2; dial.position.set(dx, 0, zp); inner.add(dial);
    inner.add(K.cylY(dx, zp, top + 4.4, top + 5.5, 4.7, { side: steel, front: silverLt, bevel: 0.3, rim: 'front' }));   // shutter button (~9.4 mm in the photos)
    for (let k = 0; k < 8; k++) {   // mode symbols round the shutter, as tangential dashes
      const a = (k + 0.5) * Math.PI / 4, mk = K.box(1.6, 0.3, 0.6, dx + 7.6 * Math.cos(a), top + 4.62, zp - 7.6 * Math.sin(a), dark);
      mk.rotation.y = a + Math.PI / 2; inner.add(mk);
    }
    // oval POWER lamp, POWER button, mic (7 holes in a hexagonal rosette) in a row: x -17 / -12.4 / -6.8 from the P8
    // front 3/4 and P10 front photos (scaled on the flash / finder windows)
    const lamp = K.slab(K.rr(0, 0, 2.2, 1.2, 0.55), top + 0.85, top + 1.1, { side: K.mat(0x3fc06a), front: K.mat(0x3fc06a) });
    lamp.rotation.x = -Math.PI / 2; lamp.position.set(-16.9, 0, ZS + 3.5); inner.add(lamp);   // clear of the dial's knurl
    inner.add(K.cylY(-12.4, ZS + 3.5, top + 0.8, top + 1.7, 2.6, { side: silver, front: silverLt, bevel: 0.3, rim: 'front' }));   // POWER
    for (const [mx, mz] of [[0, 0], [-1.6, 0], [1.6, 0], [-0.8, -1.39], [0.8, -1.39], [-0.8, 1.39], [0.8, 1.39]])
      inner.add(K.cylY(-6.8 + mx, ZS + 3.5 + mz, top + 0.85, top + 0.95, 0.42, { side: dark, front: dark, segs: 10 }));   // mic
    // viewfinder hump (part of the back cover) behind the plate, x -20.5 .. 5.5; its back is the black eyepiece frame
    // that stands out of the back face, eyepiece glass in the middle and three small lamps on the grip side
    const hx = -7.5, hump = K.slab(K.rr(0, 0, 26, -ZB, [3, 3, 1, 1]), top - 1, top + 4.4, { side: red, front: red, bevel: 1, rim: 'front' });
    hump.rotation.x = -Math.PI / 2; hump.position.set(hx, 0, ZB / 2); back.add(hump);   // z ZB .. 0
    back.add(K.slab(K.rr(hx, top - 0.2, 24, 9.8, 1.2), ZB - 2.5, ZB + 3, { side: black, front: black, back: black, bevel: 0.5, rim: 'back' }));   // eyepiece frame, y top-5.1 .. top+4.7
    back.add(K.edges(K.box(8.5, 5, 0.1, hx + 1, top + 0.9, ZB - 2.55, K.mat(0x404850))));                                                     // eyepiece glass
    for (const [k, c] of [[0, 0x3fc06a], [1, 0xff8a3a], [2, 0xff8a3a]]) back.add(K.cylZ(hx - 9.5, top + 2.6 - 2.3 * k, ZB - 2.65, ZB - 2.3, 0.6, { side: K.mat(c), back: K.mat(c), segs: 16 }));
    // left end (chassis): battery / Memory Stick door on the flat of the end face, strap eyelet above it
    const jc = K.slab(K.rr(0, 0, 19, 31, 3), -X0 - 0.4, -X0 + 0.5, { side: redDk, front: redDk, back: redDk, rim: 'front' }); jc.rotation.y = -Math.PI / 2; jc.position.set(0, -3, -1.5); inner.add(jc);
    for (let i = 0; i < 4; i++) inner.add(K.box(0.3, 1, 12, X0 - 0.55, -16 + i * 1.8, -1.5, red));   // its grip ridges
    const eye = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.7, 10, 20, Math.PI), silver); eye.rotation.z = Math.PI / 2; eye.position.set(X0 + 0.2, 16, -2); inner.add(eye);   // half ring standing out of the end face
    // ---- back face: LCD, keys, speaker, jack cover ----
    const backFace = (shape, z0, z1, m, rim = 'back') => back.add(K.slab(shape, z0, z1, { side: m, front: m, back: m, bevel: 0.4, rim }));
    const LX = 12, PX = -24.5, PY = -4;   // LCD and control-pad centres
    backFace(K.rr(LX, -1, 37, 29, 2), ZB - 0.6, ZB + 0.2, K.mat(0x3a3a3e));                               // LCD bezel
    const lcdM = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 96; const x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 128, 96); gr.addColorStop(0, '#2b3c52'); gr.addColorStop(0.55, '#1a2533'); gr.addColorStop(1, '#2e4158'); x.fillStyle = gr; x.fillRect(0, 0, 128, 96); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(8, 6, 40, 84); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return K.mat(0xffffff, { map: t }); })();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(30.5, 23), lcdM); scr.rotation.y = Math.PI; scr.position.set(LX, -1, ZB - 0.64); back.add(scr);
    backFace(K.circle(PX, PY, 7.2), ZB - 0.9, ZB + 0.2, silver);                                           // control pad
    backFace(K.circle(PX, PY, 2.6), ZB - 1.4, ZB - 0.8, silverLt);                                         //   centre
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; back.add(K.box(1.6, 1.6, 0.3, PX + 5 * Math.cos(a), PY + 5 * Math.sin(a), ZB - 1.05, dark)); }
    backFace(K.rr(-38, 16.5, 19.5, 8, 2.5), ZB - 0.5, ZB + 0.2, steel);                                    // zoom rocker: W | T on a frame
    for (const x of [-33.4, -42.6]) backFace(K.rr(x, 16.5, 8.4, 5.6, 2), ZB - 1.3, ZB - 0.3, silver);
    for (const [x, y] of [[-15.5, 5.5], [-15.5, -11], [-33.5, -11]]) backFace(K.circle(x, y, 2.4), ZB - 0.9, ZB + 0.2, silver);   // display, MENU, delete
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) back.add(K.cylZ(-39.5 - 2 * i, -3 - 2 * j, ZB - 0.15, ZB + 0.2, 0.4, { side: dark, back: dark, segs: 10 }));   // speaker
    backFace(K.rr(-26.5, -19.75, 33, 8.5, 1.5), ZB - 0.35, ZB + 0.2, redDk);                              // DC IN / A/V OUT / USB cover
    // ---- printing on the back and the end door (P10 back photo, ifixit_p10_back_3q.jpg; the P8 operating instructions'
    // "Identifying the parts"; ITmedia: DC IN, A/V OUT, USB left to right under the cover). White on the red shell, as Sony
    // prints on its coloured bodies; dark on the silver rocker keys. Each print is a see-through plane just off its face,
    // kept out of the ink pass like the "3x OPTICAL ZOOM" on the round end ----
    const printed = (w, h, x, y, z, draw, ry = Math.PI, ppm = 40) => {   // draw in mm, plane-local: u to the viewer's right, v down
      const c = document.createElement('canvas'); c.width = Math.round(w * ppm); c.height = Math.round(h * ppm); const ctx = c.getContext('2d'); ctx.scale(ppm, ppm);
      ctx.fillStyle = ctx.strokeStyle = '#f4f2f0'; ctx.lineWidth = 0.22; ctx.lineJoin = ctx.lineCap = 'round'; draw(ctx);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: t, transparent: true, depthWrite: false }));
      m.position.set(x, y, z); m.rotation.y = ry; m.userData.noInk = true; return m;
    };
    back.add(printed(104, 48, 0, 0, ZB - 0.03, x => {
      const at = (wx, wy) => [52 - wx, 24 - wy];   // world mm on the back -> plane mm (seen from behind, +x is on the left)
      const text = (s, wx, wy, hgt, rot = 0) => { const [u, v] = at(wx, wy); x.save(); x.translate(u, v); x.rotate(rot); x.font = `bold ${hgt / 0.72}px Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 0, 0); x.restore(); };
      const path = (pts, close, fill) => { x.beginPath(); pts.forEach(([wx, wy], i) => { const [u, v] = at(wx, wy); i ? x.lineTo(u, v) : x.moveTo(u, v); }); if (close) x.closePath(); fill ? x.fill() : x.stroke(); };
      const ring = (wx, wy, r) => { const [u, v] = at(wx, wy); x.beginPath(); x.arc(u, v, r, 0, 7); x.stroke(); };
      // round the control pad, 9.6 mm out: flash (up), self-timer (left as seen), macro (right), quick review (down)
      const fx = PX, fy = PY + 9.6; path([[fx + 0.3, fy + 1.1], [fx - 0.5, fy - 0.05], [fx + 0.15, fy - 0.05], [fx - 0.35, fy - 1.1], [fx + 0.55, fy + 0.2], [fx - 0.1, fy + 0.2]], true, true);
      ring(PX + 9.6, PY, 0.85); path([[PX + 9.6, PY + 0.55], [PX + 9.6, PY], [PX + 9.2, PY - 0.3]]); path([[PX + 9.6, PY + 0.85], [PX + 9.6, PY + 1.2]]);
      path([[PX - 9.6, PY - 1.1], [PX - 9.6, PY - 0.1]]); path([[PX - 10.3, PY + 0.9], [PX - 10.3, PY + 0.1], [PX - 9.6, PY - 0.25], [PX - 8.9, PY + 0.1], [PX - 8.9, PY + 0.9], [PX - 9.6, PY + 0.45], [PX - 10.3, PY + 0.9]], true, true);
      path([[PX - 1, PY - 9], [PX + 1, PY - 9], [PX + 1, PY - 10.4], [PX - 1, PY - 10.4]], true); path([[PX + 0.35, PY - 9.35], [PX - 0.35, PY - 9.7], [PX + 0.35, PY - 10.05]], true, true);
      // display button: the LCD on / off symbol above it; MENU and image size / delete under theirs
      path([[-16.6, 9.1], [-14.4, 9.1], [-14.4, 10.6], [-16.6, 10.6]], true); path([[-16.1, 9.85], [-14.9, 9.85]]);
      text('MENU', -15.5, -14.45, 1.25);
      path([[-35.4, -13.85], [-34.2, -13.85], [-34.2, -15.05], [-35.4, -15.05]], true); path([[-34.8, -13.85], [-34.8, -15.05]]); path([[-35.4, -14.45], [-34.2, -14.45]]);   // image size
      path([[-32.9, -13.95], [-31.7, -13.95]]); path([[-32.75, -14.1], [-32.6, -15.1], [-32, -15.1], [-31.85, -14.1]], true);                                             // delete
      text('/', -33.5, -14.45, 1.2);
      text('SONY', -9.5, -9, 2.1, Math.PI / 2);   // along the LCD's edge, reading downwards
    }));
    // the rocker's keys: W nearer the LCD, T at the corner
    for (const [s, kx] of [['W', -33.4], ['T', -42.6]]) back.add(printed(6, 4, kx, 16.5, ZB - 1.33, x => {
      x.fillStyle = '#3a3c3f'; x.font = 'bold 3.2px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 3, 2.15);
    }));
    back.add(printed(31, 7, -26.5, -19.75, ZB - 0.38, x => {   // on the jack cover, left to right as seen: DC IN, A/V OUT, USB
      x.font = 'bold 1.6px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DC IN', 6, 3.5); x.fillText('A/V OUT', 15.5, 3.5);
      x.beginPath(); x.moveTo(23, 3.5); x.lineTo(28, 3.5); x.moveTo(24.4, 3.5); x.lineTo(25.4, 2.4); x.lineTo(26.6, 2.4); x.moveTo(25, 3.5); x.lineTo(26, 4.6); x.lineTo(26.8, 4.6); x.stroke();
      x.beginPath(); x.moveTo(28.4, 3.5); x.lineTo(27.6, 3.05); x.lineTo(27.6, 3.95); x.fill(); x.beginPath(); x.arc(23, 3.5, 0.4, 0, 7); x.fill();
    }));
    inner.add(printed(16, 28, X0 - 0.6, -3, -1.5, x => {   // the battery / Memory Stick door on the end: OPEN and its arrow, above the grip ridges
      x.font = 'bold 2.4px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('OPEN', 8, 6.5);
      x.beginPath(); x.moveTo(8, 12.2); x.lineTo(6.4, 9.6); x.lineTo(9.6, 9.6); x.fill(); x.fillRect(7.5, 8.2, 1, 1.6);
    }, -Math.PI / 2));
    // ---- bottom: the lower cabinet over the flat bottom, tripod socket. Red on the red P8 (service manual parts list:
    // CABINET (LOWER) ASSY (RED); the blue / silver / white cameras share one part), with the rating text printed on it
    // towards the lens end, a caution label over the tripod socket and a screw at each end (iFixit's P10 bottom photo) ----
    const bp = K.slab(K.rr(0, 0, 75.5, 25, 1.5), -Y1 - 0.35, -Y1 + 0.2, { side: red, front: red, back: red, rim: 'back' }); bp.rotation.x = -Math.PI / 2; bp.position.set(-10, 0, 0); inner.add(bp);   // x -47.75 .. 27.75
    const underDecal = (w, h, x, z, draw, ppm = 24) => {   // facing down, text reading towards the lens end, its top towards the front
      const c = document.createElement('canvas'); c.width = Math.round(w * ppm); c.height = Math.round(h * ppm); const ctx = c.getContext('2d'); ctx.scale(ppm, ppm); draw(ctx);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.mat(0xffffff, { map: t })); m.rotation.x = Math.PI / 2; m.position.set(x, -Y1 - 0.4, z); inner.add(m);
    };
    underDecal(30, 11, 11.5, -3.8, x => {
      x.fillStyle = '#c9cdd0'; x.fillRect(0, 0, 30, 11); x.fillStyle = '#222'; x.textBaseline = 'middle';
      x.font = 'bold 1.6px Georgia, serif'; x.fillText('SONY', 1, 1.6); x.font = '1.05px Arial'; x.fillText('MODEL NO.  DSC-P8', 6.2, 1.6);
      x.fillText('DIGITAL STILL CAMERA', 1, 3.3); x.fillText('DC 3.6V', 1, 5); x.fillText('No.', 9, 5);
      x.fillText('SONY CORPORATION        MADE IN JAPAN', 1, 7); x.fillText('This device complies with Part 15 of the FCC Rules.', 1, 8.7);
    });
    underDecal(13, 6, -15, -8, x => {
      x.fillStyle = '#e9ebec'; x.fillRect(0, 0, 13, 6); x.strokeStyle = '#222'; x.lineWidth = 0.15; x.strokeRect(0.3, 0.3, 12.4, 5.4);
      x.fillStyle = '#222'; x.font = 'bold 0.95px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CAUTION', 6.5, 1.3);
      x.font = '0.6px Arial'; ['RISK OF ELECTRIC SHOCK', 'DO NOT OPEN', 'ATTENTION', 'RISQUE DE CHOC ELECTRIQUE'].forEach((s, i) => x.fillText(s, 6.5, 2.5 + i * 0.9));
    });
    for (const sx of [14.2, -42.5]) {
      inner.add(K.cylY(sx, -11, -Y1 - 0.6, -Y1 - 0.3, 1.3, { side: steel, back: steel, segs: 16, rim: 'back' }));
      const sl = K.box(2, 0.1, 0.35, sx, -Y1 - 0.62, -11, dark); sl.rotation.y = 0.5; inner.add(sl);
    }
    inner.add(K.cylY(-13.8, 3, -Y1 - 0.45, -Y1 + 1, 3.2, { side: steel, front: steel, back: steel, rim: 'back' }));                             // tripod socket: ring
    inner.add(K.cylY(-13.8, 3, -Y1 - 0.5, -Y1 + 1, 2.1, { side: black, front: black, back: black, segs: 24 }));                                 //   and its threaded hole
    // ---- zoom lens: bezel stays on the cover, two telescoping stages and the glass (caps carry the drawn rings) ----
    const z = ZF, st1 = new THREE.Group(), st2 = new THREE.Group(); lens.add(st1); st1.add(st2);
    st1.add(K.cylZ(lx, ly, z - 9, z + 3.4, r(242.1), { front: K.art, side: silver, bevel: 0.5, M, segs: 72, rim: 'front', artEdge: true }));
    st2.add(K.cylZ(lx, ly, z - 6, z + 6.4, r(178.9), { front: K.art, side: steel, bevel: 0.5, M, segs: 72, rim: 'front', artEdge: true }));
    st2.add(K.cylZ(...M.mm(1141.8, 457), z + 6.2, z + 8.1, r(131.7), { front: K.art, side: dark, bevel: 0.5, M, segs: 72, rim: 'front' }));

    // ================= inside =================
    const pcbEdge = K.mat(0x2f6e3a), gold = K.mat(0xd6a740), orange = K.mat(0xe0902a), cellM = K.mat(0x3a3d42), clear = K.mat(0xe8eef2);
    const pcb = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
      x.fillStyle = '#2a7360'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#3f9a80'; x.lineWidth = 3;
      for (let i = 0; i < 18; i++) { x.beginPath(); const a = (i * 97) % 256, b = (i * 53) % 256; x.moveTo(a, b); x.lineTo(a + 30, b); x.lineTo(a + 30, (b + 60) % 256); x.stroke(); }
      x.fillStyle = '#c9cdd0'; for (let i = 0; i < 120; i++) x.fillRect((i * 71) % 256, (i * 113) % 256, 5, 3);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 30, 1 / 30); return K.mat(0xffffff, { map: t });
    })();
    // lens block (silver box) round the zoom, its corners rounded to clear the round end (inner radius 24.35 mm), CCD
    // behind, orange flex towards the board
    // (service manual, lens section: the barrel is round, the zoom motor in a box on its upper corner towards the grip; the
    // CCD sits behind it on the CD-432 board)
    inner.add(K.cylZ(lx, ly, -6, ZS - 1.5, 19.4, { side: silver, front: silver, back: silver, bevel: 0.6, segs: 48, rim: 'both' }));
    inner.add(K.edges(K.box(12, 13, 8, lx - 17.5, ly + 13, -2, silver)));                                          // zoom motor housing
    inner.add(K.slab(K.rr(lx + 2, ly - 2, 30, 12, 1), -8.1, -7.5, { front: pcb, back: pcb, side: pcbEdge, rim: 'back' }));   // CD-432 board
    inner.add(K.cylZ(lx, ly, ZS - 1.5, ZF - 1.4, r(242.1) + 0.6, { side: silver, front: steel, back: steel, segs: 72, rim: 'front' }));   // fixed barrel the stages run out of (hidden behind the cover's ring when closed)
    inner.add(K.edges(K.box(14, 12, 1.4, lx, ly, -6.8, K.mat(0x4a3a6a))));                                         // CCD
    inner.add(K.strip([[lx - 18, ly - 12, -6.6], [lx - 24, ly - 16, -7.6], [lx - 29, ly - 12, -8]], 9, 0.3, orange, { segs: 30 }));
    // flash: xenon tube in a clear reflector behind the window, the big capacitor beside it
    const [fx, fy] = M.mm(570, 225);
    // (right behind its window, z 7.5 .. 11, above the main board's step: the P10 photo with the front off has it at the
    // front, level with the board; it sat 10 mm further back)
    inner.add(K.edges(K.box(r(269) - 1, M.sy(92) - 0.6, 3.5, fx, fy, 9.25, clear)));
    inner.add(K.cylX(fy, 8.6, fx - 9, fx + 9, 1, { side: K.mat(0xf6f1d8) }));
    inner.add(K.cylX(14.6, -1, X0 + 4, X0 + 28, 6, { side: black, front: steel, back: steel, rim: 'both' }));          // flash capacitor, above the battery
    inner.add(K.strip([[X0 + 28, 14.6, -1], [-22, 16, 3], [fx - 4, fy - 2.5, 7.4]], 6, 0.3, orange, { segs: 16 }));
    // NP-FC11 battery and the Memory Stick under the grip, both entering from the left end (the end door is marked for both)
    inner.add(K.slab(K.rr(X0 + 19, -8, 31, 33, 2), -4.5, 4.5, { side: cellM, front: cellM, back: cellM, bevel: 0.8, rim: 'both' }));
    const lab = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#3a3d42'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#e9e9e9'; x.font = 'bold 20px Arial'; x.fillText('SONY', 34, 40); x.font = '14px Arial'; x.fillText('InfoLITHIUM', 20, 66); x.fillText('NP-FC11', 34, 90); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return K.mat(0xffffff, { map: t }); })();
    const bl = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), lab); bl.position.set(X0 + 19, -8, 4.56); inner.add(bl);
    const msM = K.mat(0x7b4fa8);
    inner.add(K.slab(K.rr(-27, -3, 50, 21.5, 1), -7.2, -4.6, { side: msM, front: msM, back: msM, bevel: 0.3, rim: 'both' }));   // Memory Stick, 50 x 21.5 mm
    // key board behind the back keys (gold switch pads, DC / A/V / USB jacks under the jack cover), LCD module beside it
    inner.add(K.slab(K.rr(-28.25, 0, 43.5, 42, 2), -9.6, -8.4, { front: pcb, back: pcb, side: pcbEdge, rim: 'back' }));   // x -50 .. -6.5
    for (const [x, y] of [[-24.5, -4], [-24.5, 1], [-24.5, -9], [-29.5, -4], [-19.5, -4], [-33.4, 16.5], [-42.6, 16.5], [-15.5, 5.5], [-15.5, -11], [-33.5, -11]]) inner.add(K.cylZ(x, y, -10.1, -9.6, 1.9, { side: gold, back: gold }));
    for (const [x, y, w, h] of [[-44, 4, 8, 8], [-42, -8, 6, 5], [-10, 16, 6, 4]]) inner.add(K.edges(K.box(w, h, 1.2, x, y, -10.2, black)));
    inner.add(K.edges(K.box(5, 4, 1.8, -14, -19.5, -10.5, dark)));                                                  // DC IN
    inner.add(K.edges(K.box(5, 4, 1.8, -26, -19.5, -10.5, K.mat(0xf0c419))));                                       // A/V OUT (yellow)
    inner.add(K.edges(K.box(8, 3.4, 1.8, -38, -19.5, -10.5, steel)));                                               // USB
    inner.add(K.slab(K.rr(12, -1, 37, 30, 1.5), -11.4, -8.6, { side: silver, front: silver, back: silver, bevel: 0.4, rim: 'back' }));   // LCD module, x -6.5 .. 30.5
    inner.add(K.box(8, 6, 0.3, -6.5, 10, -8.2, orange));                                                            // its flex onto the board
    // main board right behind the front cover, over the grip half (iFixit DSC-P10, front cover off: ifixit_p10_board.jpg,
    // scaled on the 51.5 mm height, ~11.4 px/mm): it reaches the top at the grip end and steps down under the flash; four
    // round power inductors (101 / 220 / 100 / 220) in a column along the grip edge, a flex connector above them, black
    // tape down the left and across the bottom, the big chips in the middle, two flex connectors on its lens-side edge,
    // a crystal and a screw near the bottom. z 5.2 .. 6: in front of the battery and the flash capacitor
    {
      const bx0 = -48.3, bx1 = 6, by0 = -23.6, by1 = 23.6, zb0 = 5.2, zb1 = 6;
      const ppm = 16, cw = Math.round((bx1 - bx0) * ppm), ch = Math.round((by1 - by0) * ppm);
      const c = document.createElement('canvas'); c.width = cw; c.height = ch; const x = c.getContext('2d');
      x.fillStyle = '#2f8a7c'; x.fillRect(0, 0, cw, ch);
      let s = 11; const rnd = () => (s = s * 16807 % 2147483647) / 2147483647;
      x.strokeStyle = '#3f9d8e'; x.lineWidth = 3;
      for (let i = 0; i < 70; i++) { const px = rnd() * cw, py = rnd() * ch; x.beginPath(); x.moveTo(px, py); rnd() < 0.5 ? x.lineTo(px + 30 + rnd() * 120, py) : x.lineTo(px, py + 30 + rnd() * 120); x.stroke(); }
      for (let i = 0; i < 260; i++) {   // small SMD parts: chip resistors / capacitors, a few SOT packages
        const px = rnd() * cw, py = rnd() * ch, big = rnd() < 0.15, w = big ? 28 : 10 + rnd() * 8, h = big ? 22 : 6 + rnd() * 4, v = rnd() < 0.5;
        x.fillStyle = big ? '#1e2022' : ['#2a2522', '#b8875a', '#d6d2c8', '#3a3430'][Math.floor(rnd() * 4)];
        x.fillRect(px, py, v ? h : w, v ? w : h);
      }
      x.fillStyle = '#e8efe8'; x.font = 'bold 22px Arial'; x.save(); x.translate(4.6 * ppm, 30 * ppm); x.rotate(-Math.PI / 2); x.fillText('SFP-GNK', 0, 0); x.restore();
      x.fillText('EA3', 17 * ppm, 30.5 * ppm);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      const boardM = K.mat(0xffffff, { map: t }), MB = K.mapping([0, 0, cw, ch], [bx0, by1, bx1, by0], t);
      inner.add(K.slab(K.poly([[bx0, by1], [-28, by1], [-28, 14], [bx1, 14], [bx1, by0], [bx0, by0]]), zb0, zb1, { front: boardM, side: pcbEdge, back: pcbEdge, M: MB, rim: 'front' }));
      const labelled = (txt, cx, cy, r) => {   // inductor: dark drum, its value printed on top
        const lc = document.createElement('canvas'); lc.width = lc.height = 64; const lx2 = lc.getContext('2d');
        lx2.fillStyle = '#2a2a2c'; lx2.fillRect(0, 0, 64, 64); lx2.fillStyle = '#d8d8d8'; lx2.font = 'bold 24px Arial'; lx2.textAlign = 'center'; lx2.textBaseline = 'middle'; lx2.fillText(txt, 32, 34);
        const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
        inner.add(K.cylZ(cx, cy, zb1, zb1 + 2.4, r, { front: K.mat(0xffffff, { map: lt }), side: K.mat(0x2a2a2c), M: K.mapping([0, 0, 64, 64], [cx - r, cy + r, cx + r, cy - r], lt), segs: 28, rim: 'front' }));
      };
      [['101', 7.3], ['220', 2.1], ['100', -4.5], ['220', -11.5]].forEach(([v, y]) => labelled(v, -43.9, y, 2.2));
      const tapeM = K.mat(0x1c1c1c);
      inner.add(K.box(9.6, 26.6, 0.25, -36, 10.3, zb1 + 0.13, tapeM));                                   // tape down the left
      const tp = K.box(26, 7.6, 0.25, -29.5, -19.6, zb1 + 0.13, tapeM); tp.rotation.z = -0.05; inner.add(tp);   // and across the bottom
      for (const [cx, cy, w, h, hh] of [[-13.6, 0, 9, 9, 1.2], [-29.4, -8.6, 8.8, 9.4, 1.1], [-25.9, 4.3, 7, 6, 1], [-5.8, 9.4, 6, 6, 1], [-17.5, 9.5, 4, 3, 0.8], [-6, -5.5, 4.5, 4.5, 0.9]])
        inner.add(K.edges(K.box(w, h, hh, cx, cy, zb1 + hh / 2, black)));                             // chips
      const fpc = K.mat(0xe8e2d2);
      for (const [cx, cy, h] of [[2.6, 6.2, 13.4], [2.6, -7.2, 9.6]]) {                                  // flex connectors to the lens block
        inner.add(K.edges(K.box(4.4, h, 1.4, cx, cy, zb1 + 0.7, fpc)));
        inner.add(K.box(1.2, h - 1.2, 0.1, cx - 0.6, cy, zb1 + 1.45, dark));
      }
      inner.add(K.edges(K.box(4, 8.4, 1.4, -46, 17.2, zb1 + 0.7, fpc)));                                // flex connector above the inductors
      inner.add(K.edges(K.box(6, 2.4, 1, -4.3, -16.8, zb1 + 0.5, fpc)));
      inner.add(K.edges(K.box(5.2, 2.6, 1, -12, -19.3, zb1 + 0.5, K.mat(0xd9dcdf))));                    // crystal
      inner.add(K.cylZ(-46, -19, zb1, zb1 + 0.9, 1.5, { side: steel, front: steel, segs: 16, rim: 'front' }));   // screw
      for (const rz of [0, Math.PI / 2]) { const sl = K.box(2.2, 0.4, 0.1, -46, -19, zb1 + 0.95, dark); sl.rotation.z = rz; inner.add(sl); }
    }

    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    g.userData.setExplode = t => {
      const a = sm(t / 0.3), b = sm((t - 0.3) / 0.7);
      st1.position.z = 8 * a; st2.position.z = 8 * a;   // lens extends: each stage another 8 mm (st2 rides on st1)
      front.position.z = 42 * b;                        // front cover comes forward, the lens block stays
      back.position.z = -40 * b; mid.position.z = -16 * b;
    };
    g.userData.setExplode(0);
    return g;
  },
};
