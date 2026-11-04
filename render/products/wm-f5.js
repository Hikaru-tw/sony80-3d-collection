// Sony Sports Walkman WM-F5 (1983), the first water-resistant Walkman. Face art: tex/wm-f5.png.
// 100.4 x 125.2 x 42.1 mm overall incl. protrusions (walkman.land) = body 91.3 x 120 x 35.5 + belt clip, latch, hinge and
// knobs (Sony's service manual: 100.4 x 125.2 x 42.1 incl. projections, 91.8 x 120.8 x 35.3 without; its parts list puts
// PHONES A / B, the dial scale, TUNING and VOL on the top end and DX/LOCAL and TAPE inside the bay).
// Width and height: both straight-on fronts (V&A W.12-1992, walkman.land) give the face 0.76 wide:tall, as the
// sticker does. Depth: the straight top-end photo (wl_top_end, 9.9 px/mm) puts the seam 21 mm behind the face, the back
// 35.5 mm behind it and the belt clip's top 2-5 mm further; the thumbscrew head stands ~8 mm off the back (V&A: 4.5 cm).
// The cassette loads from the BACK. The door-open photos (wl_inside_door_open, wl_blue_inside) look into the back: the
// knobs sit on the mirror side of a front view, and the back door's window shows through the slot of the belt clip
// (rect_back). So:
//   front shell (face, fixed): rubber control pad, top-end jacks / dial scale / TUNING and VOL knobs, rating label on the
//     bottom end; holds the deck, battery well and radio board
//   back door: hinged on the right side (two yellow blocks on the front shell, 8-33 and 86-111 mm from the top, and the
//     door's slim knuckle between them), smoked window with
//     an amber seal, metal catch strip along its free edge, black belt clip (outline, raised spring clip with its slot,
//     ribs and knurled thumbscrew measured on rect_back, 10 px/mm)
//   latch: black frame on the left side, pivoting in its ribbed grip at the front (wl_blue_front_left, top-end photo);
//     a side plate with rivets runs back, wraps round the back-left corner and ends in a flat bar on the door's left
//     margin (rect_back: x -31..-44, pins at its ends); opened, it lies out to the left (wl_inside_door_open)
// Inside (door-open photos, seen from the back): head, pinch roller and capstan on the hinge side, chrome spindles,
// battery well with two AA cells beside them on the latch side, NORM/METAL switch below it, guide post; direct-drive
// motor under the capstan; main board right behind the face (Sony's service manual: outline, key cut-outs, part
// layout; solder side forward), the cells lying on it; FM tuning gang, scale drum, volume pot and jack bodies under the
// top end; DC IN 3V jack under a rubber plug low on the left side.
// setExplode(t): the latch swings out, the back door opens on its right hinge and the cassette lifts out (t 0-0.5), then
// the deck mechanism lifts out of the front shell and moves aside to the left, showing the radio board (t 0.5-1).
import { buildCassette } from '../cassette.js';

export default {
  id: 'wm-f5', name: 'Sony Sports Walkman WM-F5', textures: ['tex/wm-f5', 'label_a', 'label_b', 'tex/wm-f5_board'], ink: 1.5,
  openLabel: 'Open up', insideView: [145, 28, 1.3],     // viewer: [azimuth (+ = the product's right), elevation, distance x fit]
  build(THREE, K, T, P) {
    // x right, y up, z front. ZF face, ZK seam (front shell | back door), ZB back of the door
    const g = new THREE.Group(), W = 91.3, H = 120, X0 = -W / 2, X1 = W / 2, Y1 = H / 2, ZF = 21, ZK = 0, ZB = -14.5;
    const front = new THREE.Group(), latch = new THREE.Group(), lIn = new THREE.Group(), cover = new THREE.Group(), backIn = new THREE.Group();
    const inner = new THREE.Group(), mech = new THREE.Group();
    g.add(front, latch, cover, inner); latch.add(lIn); cover.add(backIn); inner.add(mech);
    const M = K.mapping([122, 140, 925, 1195], [X0, Y1, X1, -Y1]);
    const yellow = K.mat(0xfbca5b), gray = K.mat(0x8c8c8c), rubber = K.mat(0x4c4949), black = K.mat(0x2b2726);
    const green = K.mat(0x3fae6a), steel = K.mat(0xb7bcc0), chrome = K.mat(0xd9dcdf), dark = K.mat(0x1f1c1b);
    const RC = 7;   // corner radius of the face outline
    const path = shape => { const p = new THREE.Path(); shape.getPoints(8).forEach((q, i) => i ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y)); return p; };
    const ring = (w, h, r, t) => { const s = K.rr(0, 0, w, h, r); s.holes.push(path(K.rr(0, 0, w - 2 * t, h - 2 * t, Math.max(0.5, r - t)))); return s; };
    // prisms along y (outline in x, z) and along x (outline in z, y): K.slab turned on its side
    const prismY = (shape, y0, y1, o) => { const m = K.slab(shape, y0, y1, o); m.rotation.x = -Math.PI / 2; return m; };   // shape (x, -z); front cap faces +y
    const prismX = (shape, x0, x1, o) => { const m = K.slab(shape, x0, x1, o); m.rotation.y = Math.PI / 2; return m; };    // shape (-z, y); front cap faces +x
    const yv = v => Y1 - v;   // mm from the top -> y

    // ================= front shell (fixed): face, walls, top end, bottom label =================
    front.add(K.slab(K.rr(0, 0, W, H, RC), ZF - 4.6, ZF, { front: K.art, side: yellow, bevel: 2, M, rim: 'front' }));   // face (its back round-over hides in the walls)
    front.add(K.slab(ring(W, H, RC, 1.8), ZK + 0.15, ZF - 2.6, { side: yellow, front: yellow, back: yellow, rim: 'back' }));   // walls down to the seam
    // rubber control pad (tilted egg-shaped oval) and its buttons, raised off the face. Every outline is traced on the art
    // (tex/wm-f5.png, px): the mid-line of its black ink outline, so each part's rim runs inside the drawn line and the art
    // on its top lines up with the part (they were an ellipse, a triangle and a pill placed by eye, and at a slant their
    // rims and walls cut across the drawn shapes)
    const z0 = ZF, avg = p => (M.sx(p) + M.sy(p)) / 2, traced = pts => K.poly(pts.map(p => M.mm(...p)));
    const PAD = [[831.9, 493.6], [820.5, 520.2], [813.8, 532.4], [809.8, 538.1], [801.0, 548.7], [787.9, 563.3], [770.0, 580.2], [747.6, 598.2], [723.8, 620.9], [706.4, 634.8], [684.0, 655.6], [673.8, 663.6], [650.7, 677.4], [638.0, 683.6], [624.6, 688.6], [610.5, 692.0], [596.1, 693.7], [581.2, 694.9], [566.1, 694.6], [551.0, 692.7], [536.2, 688.8], [521.7, 683.5], [507.8, 676.9], [494.3, 669.0], [481.9, 659.6], [470.6, 648.9], [459.8, 637.6], [454.8, 631.6], [450.2, 625.2], [442.5, 611.6], [435.8, 597.6], [430.7, 582.9], [427.2, 567.9], [425.0, 552.8], [424.6, 545.2], [424.7, 530.1], [426.1, 515.2], [427.3, 507.9], [430.8, 493.6], [435.3, 479.9], [441.3, 466.9], [449.0, 454.8], [466.0, 433.4], [474.9, 423.9], [497.1, 403.0], [547.9, 360.0], [573.9, 335.6], [583.7, 327.4], [594.4, 319.5], [605.9, 312.6], [624.8, 304.0], [645.1, 297.6], [659.4, 294.6], [674.0, 292.9], [681.5, 292.8], [704.1, 293.9], [719.1, 296.5], [733.7, 301.2], [754.8, 310.6], [761.6, 314.3], [774.8, 322.7], [787.1, 332.4], [798.3, 343.3], [803.5, 349.2], [812.8, 361.8], [820.5, 375.4], [829.3, 397.1], [833.9, 411.8], [835.8, 419.2], [838.1, 434.4], [838.5, 442.0], [838.4, 457.1], [837.2, 472.0], [836.0, 479.3], [834.2, 486.5]];
    const PLAY = [[601.3, 572.8], [602.7, 577.1], [602.9, 579.3], [602.3, 583.6], [600.7, 587.7], [599.4, 589.6], [595.9, 592.8], [589.1, 596.3], [578.4, 600.0], [570.5, 603.5], [551.2, 608.7], [534.8, 616.2], [524.2, 618.7], [508.8, 624.1], [503.4, 624.3], [496.2, 622.4], [492.0, 620.0], [488.5, 616.7], [486.1, 612.5], [485.4, 607.5], [485.6, 602.2], [486.3, 597.1], [488.0, 592.0], [496.3, 575.9], [500.6, 568.6], [508.4, 549.2], [514.3, 541.1], [523.9, 520.6], [528.4, 514.2], [532.2, 510.9], [534.2, 509.8], [536.4, 509.3], [540.9, 509.5], [545.2, 511.2], [549.1, 514.4], [553.9, 520.6], [559.9, 525.6], [565.5, 533.4], [572.5, 540.0], [580.0, 548.3], [585.0, 553.1], [598.4, 568.8]];
    const OFF = [[761.5, 546.5], [743.6, 561.9], [705.9, 596.1], [695.8, 604.4], [691.8, 607.1], [688.0, 608.9], [684.4, 609.9], [677.7, 610.2], [674.6, 609.7], [668.9, 607.7], [663.9, 604.5], [661.7, 602.6], [659.8, 600.4], [656.8, 595.3], [655.2, 589.5], [655.2, 580.1], [657.3, 573.5], [662.1, 566.7], [678.4, 551.3], [690.1, 541.8], [713.3, 520.2], [718.6, 516.2], [725.3, 509.2], [746.8, 490.0], [754.1, 484.7], [757.7, 483.1], [764.5, 481.6], [771.0, 481.8], [776.7, 483.7], [781.6, 486.9], [787.6, 493.2], [790.2, 498.4], [791.6, 504.3], [791.6, 510.6], [790.8, 514.0], [787.6, 520.8], [785.2, 524.3], [778.8, 530.8]];
    front.add(K.slab(traced(PAD), z0 - 0.5, z0 + 2.2, { front: K.art, side: rubber, bevel: 0.8, M, rim: 'front', artEdge: true }));
    const raised = (shape, h = 1.1) => front.add(K.slab(shape, z0 + 2, z0 + 2 + h, { front: K.art, side: rubber, bevel: 0.4, M, rim: 'front', artEdge: true }));
    [[632.8, 366, 27.7], [554.5, 436, 27.5], [753.4, 388.5, 33.7]].forEach(([x, y, r]) => raised(K.circle(...M.mm(x, y), avg(r))));   // two white keys, blue FM key
    raised(traced(PLAY));                                                                               // play
    raised(traced(OFF));                                                                                // OFF slider

    // top end: HEADPHONES A (open, green ring) and B (grey rubber cap), the FM dial scale, TUNING and VOL knobs (service
    // manual, "Parts identification": 1 PHONES jacks, 2 dial scale, 3 TUNING, 4 VOL; DX/LOCAL is inside, below)
    const top = Y1, fromLeft = mm => X0 + mm, zFront = mm => ZF - mm;
    front.add(K.cylY(fromLeft(11.9), zFront(10.1), top - 0.5, top + 0.35, 3.6, { side: green, front: green, rim: 'front' }));   // HEADPHONES A
    front.add(K.cylY(fromLeft(11.9), zFront(10.1), top - 0.5, top + 0.45, 2.1, { side: dark, front: dark }));
    front.add(K.cylY(fromLeft(25.3), zFront(10.1), top - 0.5, top + 0.35, 3.6, { side: green, front: green }));                 // HEADPHONES B ...
    front.add(K.cylY(fromLeft(25.3), zFront(10.1), top - 0.5, top + 3.6, 4.2, { side: gray, bevel: 0.9, rim: 'front' }));      // ... under its rubber cap
    front.add(K.edges(K.box(9.4, 0.3, 3.5, fromLeft(38.4), top + 0.1, zFront(17.35), dark)));                                  // dial scale window (rect_top)
    // lettering on the top end, measured on rect_top (10 px/mm): A, B and MHz moulded, TUNING and VOL printed
    const topText = (txt, x, d, h, w, color, scale = null) => {
      const k = 48, c = document.createElement('canvas'); c.width = Math.ceil(w * k); c.height = Math.ceil(h * 1.5 * k); const t2 = c.getContext('2d');
      if (scale) { t2.fillStyle = '#1f1c1b'; t2.fillRect(0, 0, c.width, c.height); }
      t2.fillStyle = color; t2.font = `bold ${Math.round(h * k)}px Arial`; t2.textAlign = 'center'; t2.textBaseline = 'middle';
      if (scale) for (let i = 0; i <= 10; i++) t2.fillRect(c.width * (0.06 + 0.088 * i), c.height * (i % 5 ? 0.62 : 0.5), 3, c.height * 0.3);
      t2.fillText(txt, c.width / 2, c.height * (scale ? 0.3 : 0.5));
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 1.5), K.mat(0xffffff, { map: tx, transparent: !scale }));
      m.rotation.x = -Math.PI / 2; m.position.set(fromLeft(x), top + (scale ? 0.27 : 0.03), zFront(d)); front.add(m);
    };
    topText('88    98    108', 38.4, 17.35, 1.0, 9.0, '#e8e2cf', true);                                                     // the scale in the window
    for (const [t, x, d, h, w, col] of [['A', 14.4, 2.8, 1.6, 3, '#c79c1e'], ['B', 19.9, 2.8, 1.6, 3, '#c79c1e'], ['MHz', 38.2, 13.4, 1.9, 9, '#c79c1e'],
      ['TUNING', 38.7, 3.1, 2.0, 15, '#231f1e'], ['VOL ●', 67.2, 3.1, 2.2, 10, '#231f1e']]) topText(t, x, d, h, w, col);
    for (const [mm, dots] of [[54.9, false], [77.3, true]]) {
      // the skirt (r 8.9 at 14.5 mm from the face) reaches 2.4 mm past the seam: it stands on a collar, clear of the door's lip
      // knob height: Sony's 125.2 mm overall less the 120 mm body and the door lip's 0.6 below leaves 4.6 mm above the top
      const x = fromLeft(mm), z = zFront(14.5), skirt = K.slab(K.gear(0, 0, 8.4, 8.9, 32), top + 0.7, top + 3.3, { side: black, bevel: 0.3, rim: 'front' });
      skirt.rotation.x = -Math.PI / 2; skirt.position.set(x, 0, z); front.add(skirt);
      front.add(K.cylY(x, z, top - 0.3, top + 0.8, 6.2, { side: black }));
      front.add(K.cylY(x, z, top + 3.1, top + 4.4, 8.1, { side: yellow, bevel: 0.5, rim: 'front' }));
      if (dots) for (let k = 0; k < 9; k++) { const a = (k / 9) * 1.75 * Math.PI + 0.9; front.add(K.cylY(x + 5.6 * Math.cos(a), z + 5.6 * Math.sin(a), top + 4.3, top + 4.6, 0.55 + k * 0.06, { side: gray, segs: 10 })); }
    }
    // DC IN 3V jack under a grey rubber plug low on the left side, at the latch's lower end (service manual: parts
    // identification 13 and the DC jack packing; Sony's blue unit photo), in line with the board's J301 (the drawing puts
    // it 1.6 mm higher, where the latch's lower pivot pin and grip would sweep through the plug)
    front.add(prismX(K.rr(-13.25, -44, 7, 5, 1.6), X0 - 0.6, X0 + 0.3, { side: gray, bevel: 0.25, rim: 'back' }));
    {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
      x.fillStyle = '#3a3836'; x.font = 'bold 40px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DC IN 3V', 128, 34);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const dcl = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), K.mat(0xffffff, { map: t, transparent: true, depthWrite: false }));
      dcl.rotation.y = -Math.PI / 2; dcl.position.set(X0 - 0.03, -48.3, 13.25); dcl.userData.noInk = true; front.add(dcl);
    }
    // bottom end: rating label on the front shell (wl_bottom_end: 1.9-14.6 mm behind the face)
    const lbl = (() => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
      x.fillStyle = '#e9e9e6'; x.fillRect(0, 0, 512, 128); x.strokeStyle = '#333'; x.lineWidth = 3; x.strokeRect(300, 10, 200, 108);
      x.fillStyle = '#222'; x.font = 'bold 26px Georgia, serif'; x.fillText('SONY', 14, 34); x.font = '20px Arial'; x.fillText('WM-F5', 110, 32);
      x.font = '14px Arial'; ['STEREO CASSETTE PLAYER', 'FREQ RANGE:FM87.5-108MHz', 'BATT SUPPLY:1.5V×2 IEC R6', 'SIZE AA', 'SONY CORP.'].forEach((s, i) => x.fillText(s, 14, 54 + i * 16));
      ['FCC ID:AK896AWM-F5', 'SONY', 'MADE IN JAPAN'].forEach((s, i) => x.fillText(s, 312, 40 + i * 26));
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return K.mat(0xffffff, { map: t });
    })();
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(50, 12.5), lbl); lb.rotation.x = Math.PI / 2; lb.position.set(-4, -Y1 - 0.05, ZF - 8.45); front.add(lb);

    // right side: door hinge. Two blocks on the front shell (V&A front: 8-31 and 87-111 mm from the top, ~6.5 mm proud; top-end
    // photo: they straddle the seam, 2.5 mm in front of it to 7.5 behind), the door's slim knuckle between them. The pin sits
    // at the blocks' outer back corner, so the door clears them all the way round to lying open flat
    const HX = X1 + 4.4, HZ = ZK - 5.0;
    const block = K.poly([[X1 - 0.3, -2.5], [X1 + 4.6, -2.5], [X1 + 6.5, -0.6], [X1 + 6.5, 5.6], [X1 + 4.6, 7.5], [X1 + 0.7, 7.5], [X1 + 0.7, -0.15], [X1 - 0.3, -0.15]]);   // (x, -z)
    for (const [v0, v1] of [[8, 33], [86, 111]]) front.add(prismY(block, yv(v1), yv(v0), { side: yellow, bevel: 0.5, rim: 'both' }));
    front.add(K.cylY(HX, HZ, yv(111.5), yv(7.5), 0.8, { side: steel, front: steel, back: steel }));   // pin

    // ================= latch: a frame on the left side pivoting in its ribbed grip at the front; it wraps round the
    // back-left corner and its flat bar (rect_back: x -31..-44, v 24-110) holds the door's left margin down =================
    // pivot at the grip's front inner edge, so every part of the frame swings outwards, clear of the side wall
    const PX = X0 - 0.9, PZ = 14.5, GY = (yv(24) + yv(100)) / 2;
    latch.position.set(PX, 0, PZ); lIn.position.set(-PX, 0, -PZ);
    lIn.add(prismX(K.rr(-8.5, GY, 13, 76, 2.2), X0 - 3.3, X0 - 2.2, { side: rubber, bevel: 0.4, rim: 'back' }));    // ribbed grip (top photo: z 2-15, ~3.5 mm proud)
    for (let k = 0; k < 5; k++) lIn.add(K.box(0.6, 70, 0.9, X0 - 3.25, GY, 4.1 + k * 2.2, dark));                   // its ribs, to 3.55 mm proud
    for (const [a, b] of [[yv(24), yv(24) + 1.2], [yv(100) - 1.2, yv(100)]]) lIn.add(K.cylY(PX, PZ, a, b, 0.7, { side: steel, front: steel, back: steel }));   // pivot pins
    lIn.add(prismX(K.poly([[-(ZB + 1), yv(110)], [-(ZB + 1), yv(24)], [-PZ, yv(26)], [-PZ, yv(100)]]), X0 - 2.4, X0 - 0.9, { side: black, bevel: 0.4, rim: 'back' }));   // side plate
    lIn.add(K.box(0.15, 62, 18, X0 - 0.775, GY, -3.5, steel));                                                   // catch spring on its inner face (proud of it, clear of the door's lip)
    for (const y of [yv(30), yv(102)]) lIn.add(K.cylX(y, -6, X0 - 2.9, X0 - 2.3, 1.3, { side: dark, back: dark }));   // rivets
    lIn.add(prismY(K.poly([[X0 - 2.4, -(ZB + 1)], [X0 - 0.9, -(ZB + 1)], [X0 - 0.9, -(ZB - 0.2)], [X0 + 2.5, -(ZB - 0.2)], [X0 + 2.5, -(ZB - 2.2)],
      [X0 - 0.6, -(ZB - 2.2)], [X0 - 1.7, -(ZB - 1.9)], [X0 - 2.3, -(ZB - 1.0)]]), yv(110), yv(24), { side: black, rim: 'both' }));   // wrap round the corner
    // the flat bar on the back: 8.5 mm wide from the corner wrap inwards, so ~6 mm of yellow shows between it and the belt
    // clip's plate (rect_back.png, every row from v 30 to 90; it was 13 mm, leaving a 1.5 mm sliver the ink broke into dashes)
    lIn.add(prismY(K.rr(-39.75, -(ZB - 2.6), 8.5, 4.8, 2.3), yv(110), yv(24), { side: black, bevel: 0.5, rim: 'both' }));
    for (const [a, b] of [[yv(24), yv(24) + 1], [yv(110) - 1, yv(110)]]) lIn.add(K.cylY(-39.75, ZB - 2.6, a, b, 1.1, { side: steel, front: steel, back: steel }));   // its pins

    // ================= back door (hinged on the right) =================
    cover.position.set(HX, 0, HZ); backIn.position.set(-HX, 0, -HZ);
    const WIN = [-7.75, -2, 16.5, 74];   // window: centre x, y, width, height (v 25-99, through the clip's slot)
    const backShape = K.rr(0, 0, W, H, RC); backShape.holes.push(path(K.rr(WIN[0], WIN[1], WIN[2], WIN[3], 3)));
    backIn.add(K.slab(backShape, ZB, ZB + 2.6, { side: yellow, bevel: 1.2, rim: 'back' }));                     // back wall
    backIn.add(K.slab(ring(W, H, RC, 1.6), ZB + 1.3, ZK - 1.4, { side: yellow }));                              // side walls
    backIn.add(K.slab(ring(W + 1.2, H + 1.2, RC + 0.6, 1.6), ZK - 1.4, ZK - 0.15, { side: yellow, rim: 'both' }));   // lip over the front shell
    backIn.add(K.slab(K.rr(WIN[0], WIN[1], WIN[2] + 0.4, WIN[3] + 0.4, 3), ZB + 0.9, ZB + 1.3, { side: dark, front: K.mat(0x3a4148), back: K.mat(0x3a4148) }));   // smoked pane
    const seal = K.rr(WIN[0], WIN[1], WIN[2] + 10, WIN[3] + 10, 5); seal.holes.push(path(K.rr(WIN[0], WIN[1], WIN[2] + 0.6, WIN[3] + 0.6, 3)));
    backIn.add(K.slab(seal, ZB + 2.6, ZB + 3.1, { side: K.mat(0xc98a3a), rim: 'front' }));                       // amber seal round the window
    backIn.add(K.edges(K.box(14.5, 104, 0.3, X0 + 1.6 + 7.25, 0, ZB + 2.75, steel)));                           // catch strip along the free edge
    for (const y of [51, -51]) backIn.add(K.box(42, 2.5, 0.6, 0, y, ZB + 2.9, black));                          // cassette hold-down springs
    // the door's knuckle between the hinge blocks: round about the pin (it never sweeps into the blocks) + a web to the door's wall
    backIn.add(K.cylY(HX, HZ, yv(84.5), yv(34.5), 1.4, { side: yellow, front: yellow, back: yellow, rim: 'both' }));
    backIn.add(prismY(K.rr((X1 - 0.3 + HX) / 2, -(HZ - 1), HX - X1 + 0.3, 2, 0.6), yv(84.5), yv(34.5), { side: yellow, rim: 'both' }));
    // belt clip: base plate (outline from rect_back), its slot over the window, raised spring clip, ribs, thumbscrew
    const pv = pts => pts.map(([x, v]) => [x, yv(v)]);
    const plate = K.poly(pv([[-0.6, 2.5], [-29.5, 2.5], [-29.5, 119], [-1.9, 119], [-1.9, 115], [18.65, 95], [40.15, 95], [40.15, 46.5], [21.15, 50.5], [-0.6, 22.5]]));
    plate.holes.push(path(K.rr(-6.35, yv(66.25), 11, 28.5, 1)));
    backIn.add(K.slab(plate, ZB - 2.2, ZB + 0.15, { side: black, bevel: 0.6, rim: 'back' }));
    backIn.add(prismY(K.rr(-15.05, -(ZB + 1.7), 28.9, 7.8, 0.8), top - 0.05, top + 1.3, { side: black, bevel: 0.4, rim: 'front' }));   // hook over the top edge
    backIn.add(K.slab(K.rr(-23.1, yv(26.3), 13.5, 18.5, 2), ZB - 3.4, ZB - 1.8, { side: black, bevel: 0.5, rim: 'back' }));           // screw boss
    const clip = K.poly(pv([[18.65, 51.5], [-0.85, 51.5], [-0.85, 80.5], [-11.85, 80.5], [-11.85, 51.5], [-20.35, 51.5], [-20.35, 95.5], [18.65, 95.5]]));
    backIn.add(K.slab(clip, ZB - 6.4, ZB - 1.9, { side: black, bevel: 0.8, rim: 'back' }));
    [[94, 14.65, -17.35], [96.9, 13.15, -16.85], [99.8, 10.15, -16.35], [102.7, 7.15, -16.35], [105.6, 3.65, -16.35], [108.5, 0.65, -15.85]]
      .forEach(([v, xl, xr]) => backIn.add(K.box(xl - xr, 1.1, 0.7, (xl + xr) / 2, yv(v), ZB - 2.35, dark)));   // grip ridges
    backIn.add(K.slab(K.gear(-23.35, yv(29), 5.0, 5.35, 36), ZB - 7.8, ZB - 3.3, { side: chrome, bevel: 0.3, rim: 'back' }));   // knurled thumbscrew
    backIn.add(K.box(7, 1.1, 0.6, -23.35, yv(29), ZB - 7.85, dark));                                                         // its slot

    // ================= inside =================
    const nylon = K.mat(0xf3f1ea), pcbEdge = K.mat(0x2f6e3a), cellBlue = K.mat(0x2b4e9c), brass = K.mat(0xc9a24a);
    const pcb = (() => {   // board: green, tinned pads, traces (cap UVs are in mm)
      const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
      x.fillStyle = '#2f7a3f'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#4c9a58'; x.lineWidth = 5;
      for (let i = 0; i < 14; i++) { x.beginPath(); const a = (i * 97) % 256, b = (i * 53) % 256; x.moveTo(a, b); x.lineTo(a + 40, b); x.lineTo(a + 40, (b + 70) % 256); x.stroke(); }
      x.fillStyle = '#c9cdd0'; for (let i = 0; i < 90; i++) { x.beginPath(); x.arc((i * 71) % 256, (i * 113) % 256, 5, 0, 7); x.fill(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 45, 1 / 45);
      return K.mat(0xffffff, { map: t });
    })();
    // black rubber seal round the bay, just inside the seam (0.05 mm off the walls so the faces never coincide)
    inner.add(K.slab(ring(W - 3.7, H - 3.7, RC - 1.85, 2.0), ZK + 0.15, ZK + 0.9, { side: dark, rim: 'back' }));

    // --- deck mechanism (lifts out in the second stage). Deck surface ZD faces the door; parts stand off it towards -z ---
    const ZD = 1.5, SX = 0, SY = [-25.3, 17.2];          // spindle line; hub spacing 42.5
    const CAP = [31.55, -28.55];                          // capstan: through the cassette's capstan hole
    // battery well: centre x, y, width, height (latch side, beside the spindles). Its inner edge 6.9 mm from the spindle line,
    // as the bay photo has it (6 mm); the service manual's battery leads leave the board's left edge at its two ends
    const WELL = [-22.5, 11.5, 29.2, 53];
    const deck = K.rr(0, 0, 82.5, 111, 3); deck.holes.push(path(K.rr(WELL[0], WELL[1], WELL[2] + 2.2, WELL[3] + 2.2, 2.1)));   // round the battery well's rim
    mech.add(K.slab(deck, ZD, ZD + 0.8, { side: black, rim: 'back' }));
    for (const y of SY) {
      mech.add(K.cylZ(SX, y, ZD - 0.8, ZD, 3.8, { side: chrome, back: chrome, rim: 'back' }));
      mech.add(K.cylZ(SX, y, ZD - 6.4, ZD - 0.8, 2.4, { side: chrome, back: chrome, bevel: 0.5, rim: 'back' }));
      mech.add(K.cylZ(SX, y, ZD - 7, ZD - 6.4, 1, { side: nylon, back: nylon }));
    }
    mech.add(K.slab(K.rr(31, -9.5, 16, 29, 1.5), ZD - 0.5, ZD, { side: steel, back: steel, rim: 'back' }));       // head carriage
    mech.add(K.slab(K.rr(37.6, -4.05, 6, 9, 1.2), ZD - 10, ZD - 0.5, { side: chrome, back: chrome, bevel: 0.6, rim: 'back' }));   // head (face on the tape)
    mech.add(K.cylZ(38, CAP[1], ZD - 9.8, ZD - 0.6, 3.6, { side: dark, back: dark, bevel: 0.5, rim: 'both' }));      // pinch roller
    mech.add(K.edges(K.box(3, 10, 1, 36.5, CAP[1] + 7, ZD - 10.3, steel)));                                          // its arm
    mech.add(K.cylZ(CAP[0], CAP[1], ZD - 9.6, ZD + 7, 1, { side: steel, back: steel }));                             // capstan
    mech.add(K.cylZ(27, 13, ZD - 5.8, ZD, 2.2, { side: nylon, back: nylon, rim: 'back' }));                          // guide post
    // selector block: TAPE (NORM / METAL) and SENS (DX / LOCAL) side by side, the knobs of the board's S302 and S1 (service
    // manual mounting diagram: 6.3 mm apart, TAPE nearer the spindles; the bay photo: 6.8 mm, same order and height)
    mech.add(K.edges(K.box(18, 26, 0.5, -26.8, -33.4, ZD - 0.25, black)));
    mech.add(K.box(4, 7, 0.1, -23.7, -33.4, ZD - 0.55, steel));
    mech.add(K.box(4, 7, 0.1, -30, -33.4, ZD - 0.55, steel));
    // battery well: a low wall round two AA cells along the height; the cells lie on the main board, whose brown phenolic
    // with the + / - printing is the well's floor in the bay photo. The cell nearer the spindles has + at its lower end
    const tray = ring(WELL[2] + 2, WELL[3] + 2, 2, 1); inner.add(K.slab(tray, ZD, 10.5, { side: black, back: black, rim: 'back' }).translateX(WELL[0]).translateY(WELL[1]));
    const CZC = 8.65, CR = 7.05;
    for (const [x, dir] of [[WELL[0] + 7.3, -1], [WELL[0] - 7.3, 1]]) {
      const y0 = WELL[1] - 25.25, y1 = WELL[1] + 25.25;
      inner.add(K.cylY(x, CZC, y0, y1, CR, { side: cellBlue, front: steel, back: steel, rim: 'both' }));
      inner.add(K.cylY(x, CZC, dir > 0 ? y1 - 15 : y0, dir > 0 ? y1 : y0 + 15, CR + 0.05, { side: brass }));
      inner.add(K.cylY(x, CZC, dir > 0 ? y1 : y0 - 1.2, dir > 0 ? y1 + 1.2 : y0, 2.6, { side: steel }));
    }
    // direct-drive motor under the capstan
    mech.add(K.cylZ(CAP[0], CAP[1], ZD + 0.8, ZD + 7.1, 11, { side: steel, back: steel, front: K.mat(0x55595d), rim: 'both' }));
    mech.add(K.cylZ(CAP[0], CAP[1], ZD + 7.1, ZD + 7.6, 5, { side: dark, front: dark }));
    // cassette (CHF 90 model): side A towards the door, its tape edge on the hinge side where the head is
    const CZ = ZD - 6.6, cas = buildCassette(THREE, { labelA: T.label_a, labelB: T.label_b, edges: true });
    cas.scale.setScalar(63.8); cas.rotation.set(0, Math.PI, Math.PI / 2, 'ZYX'); cas.position.set(SX + 3.25, (SY[0] + SY[1]) / 2, CZ); mech.add(cas);

    // --- under the top end: jack bodies, DX switch, FM tuning gang (TUNING), volume pot (VOL) ---
    for (const mm of [11.9, 25.3]) inner.add(K.cylY(fromLeft(mm), zFront(10.1), 47, top - 0.5, 3.4, { side: black, rim: 'back' }));
    inner.add(K.edges(K.box(12, 8, 8, fromLeft(54.9), 53.5, zFront(14.5), K.mat(0xe8e6df))));
    inner.add(K.cylY(fromLeft(77.3), zFront(14.5), 48, 56, 4, { side: K.mat(0x2e5a3a), rim: 'both' }));
    for (const mm of [54.9, 77.3]) inner.add(K.cylY(fromLeft(mm), zFront(14.5), 56, top - 0.3, 1.6, { side: steel }));
    // dial scale drum under the scale window (service manual: "scale drum assy" on the mechanism, turned by TUNING)
    inner.add(K.cylZ(fromLeft(38.4), 54.2, 2.45, 5.4, 4.6, { side: K.mat(0xf2f0ea), front: K.mat(0xd9dcdf), back: K.mat(0xd9dcdf), segs: 32, rim: 'both' }));
    // main board, from Sony's WM-F5 service manual (6-1 mounting diagram, US model), placed by fitting its five cut-outs to
    // the front pad's keys (0.4 mm rms): directly behind the face, solder side forward (a repair photo shows the two LEDs and
    // the pad's switches there), 75.2 x 103.9 mm. The cut-outs pass the rubber pad's plungers for the three round keys, play
    // and OFF. Its component side faces the deck; the texture is the manual's copper pattern showing through the brown
    // phenolic, with silkscreen. Part positions are read off the same drawing; parts it puts under the cells (L1, Q1, Q4,
    // Q7, Q8) are left out, and IC301 sits on the solder side
    const ZP = 15.75, ZPF = 16.35, BX0 = -37.6, BX1 = 37.6, BY0 = -56.5, BY1 = 47.4;
    const boardTex = T['tex/wm-f5_board'], MB = K.mapping([0, 0, 752, 1039], [BX0, BY1, BX1, BY0], boardTex);
    const KEY_HOLES = [[25.92, 31.84, 3.14], [12.47, 34.09, 2.61], [3.65, 26.22, 2.37]];
    const OFF_HOLE = [[29.9, 18.5], [29.8, 17.3], [29.3, 16.6], [19.8, 7.8], [18.9, 7.4], [17.7, 7.3], [16.7, 7.7], [16.1, 8.2], [15.5, 9.4], [15.5, 10.4], [16.0, 11.6], [25.4, 20.2], [26.5, 20.8], [28.1, 20.7], [29.3, 19.8]];
    const PLAY_HOLE = [[6.4, 12.8], [6.5, 8.1], [-2.2, 4.7], [-3.2, 4.6], [-4.0, 5.2], [-4.3, 5.9], [-3.8, 7.3], [-3.1, 8.4], [0.5, 15.5], [1.4, 16.9], [1.8, 17.1], [2.7, 16.9]];
    const polyPath = pts => { const p = new THREE.Path(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; };
    const shrink = (pts, d) => { const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length; return pts.map(([x, y]) => { const l = Math.hypot(x - cx, y - cy); return [x - (x - cx) / l * d, y - (y - cy) / l * d]; }); };
    const board = K.rr((BX0 + BX1) / 2, (BY0 + BY1) / 2, BX1 - BX0, BY1 - BY0, 1.5);
    KEY_HOLES.forEach(([x, y, r]) => board.holes.push(path(K.circle(x, y, r))));
    board.holes.push(polyPath(OFF_HOLE), polyPath(PLAY_HOLE));
    inner.add(K.slab(board, ZP, ZPF, { front: K.mat(0x9a6a48), back: K.mat(0xffffff, { map: boardTex }), side: K.mat(0x5a3020), M: MB, segs: 32, rim: 'back' }));
    // the rubber pad's plungers, seen through the cut-outs
    KEY_HOLES.forEach(([x, y, r]) => inner.add(K.cylZ(x, y, 13.6, 16.4, r - 0.5, { side: rubber, back: rubber, segs: 24, rim: 'back' })));
    [OFF_HOLE, PLAY_HOLE].forEach(pts => inner.add(K.slab(K.poly(shrink(pts, 0.6)), 13.6, 16.4, { side: rubber, back: rubber, rim: 'back' })));
    // parts on the component side (towards the deck, z < ZP); x, y read off the mounting diagram through the same fit
    const flat = (cx, cy, w, h, t, m, rz = 0) => { const b = K.edges(K.box(w, h, t, cx, cy, ZP - t / 2, m)); b.rotation.z = rz; inner.add(b); return b; };
    flat(11.3, -10.4, 5.7, 13.7, 1.6, black);                                                                      // IC1 (FM IF / MPX), 20 pins
    for (let k = 0; k < 10; k++) for (const s of [-1, 1]) flat(11.3 + s * 3.15, -10.4 - 5.85 + k * 1.3, 0.8, 0.4, 0.35, steel);
    flat(21.25, -53, 19.6, 2.2, 5.5, black);                                                                       // IC601 (motor control), single in line, standing
    const ifCan = (cx, cy, s, h, core) => { flat(cx, cy, s, s, h, steel); inner.add(K.cylZ(cx, cy, ZP - h - 0.2, ZP - h, s * 0.28, { back: K.mat(core), side: K.mat(core), segs: 16 })); };
    ifCan(-5.4, 17, 5, 4.5, 0xf0d23a); ifCan(26.6, -12, 6, 5, 0xe86b8a);                                          // T1, T2
    flat(-6.05, 9.2, 3.9, 5.7, 4.5, K.mat(0xe88a2a)); flat(-4.8, -12.3, 6.2, 3.3, 4.5, K.mat(0x3c79c8));           // CF1, CF2 (ceramic filters)
    flat(31.3, 5.4, 6.4, 12.6, 3.2, black); flat(31.3, 5.4, 2.2, 3, 4.2, K.mat(0xd9dcdf));                         // S301 (TAPE / FM) and its lever
    flat(-23.7, -33.7, 3.6, 8, 3, black); flat(-30, -33.1, 3.6, 7, 3, black);                                      // S302 (TAPE), S1 (DX / LOCAL) under the selector block
    for (const [x, y] of [[34.7, -51.7], [13.5, -20.2]]) { flat(x, y, 4, 4, 1.8, K.mat(0xf2f0ea)); inner.add(K.cylZ(x, y, ZP - 2.2, ZP - 1.8, 1.4, { back: K.mat(0x3c79c8), side: K.mat(0x3c79c8), segs: 16 })); }   // RV601, RV1 trimmers
    for (const [x, y] of [[32.1, -26.7], [28.5, -30.6], [24.5, -37.4], [23.6, -40.4], [16.2, -37.1], [15.9, -40.1], [21.25, -44.9], [9.3, -38.6], [6.1, -52.6], [1.6, -45.2], [1.3, -52],
      [-11.2, -20.8], [-24.6, -17.5], [-27.6, -24.6], [-8.8, -39.2], [-16.2, -40.4], [-23.7, -39.2], [5.8, 38.3], [-3.2, 27.2], [-1.1, -3.5], [1.3, 3.3]])
      flat(x, y, 2.9, 1.6, 1.1, K.mat(0x2b2a2c));                                                                  // transistors (Q601 ... Q9), flat packages
    for (const [x, y] of [[33.8, -46.7], [27.5, -45.5], [-12, -27], [20.5, 30], [-34, -48.5]]) inner.add(K.cylZ(x, y, ZP - 4.5, ZP, 1.7, { side: K.mat(0x2c5fb3), back: steel, segs: 16, rim: 'back' }));   // electrolytics
    // DC IN 3V jack at the board's left edge (J301), its barrel out to the side wall; connectors where the leads leave
    flat(-38.5, -43.2, 10.5, 6, 5, black); inner.add(K.cylX(-43.6, ZP - 2.5, -43.8, -43.6, 1.6, { side: dark, front: dark, back: dark, segs: 16 }));
    const plug = K.mat(0xe8e2d2);
    for (const [x, y, w, h] of [[-34.8, -48.6, 3.2, 6], [-3, -54.4, 8, 2.6], [33.6, 1.6, 3.2, 5]]) flat(x, y, w, h, 2.2, plug);   // head, motor, cassette-switch leads
    [[0xd8382c, -35.5, 38.9, -37, 32.4], [0x2b2724, -35.5, -15.9, -37, -17.1]].forEach(([c, x0, y0, x1, y1]) =>   // battery leads: well ends to the board edge
      inner.add(K.tube([[x0, y0, 13.2], [x0 - 1.1, y0 + (y1 - y0) * 0.4, 14.6], [x1, y1, ZP - 0.5]], 0.45, K.mat(c), { segs: 20, radial: 6 })));

    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    g.userData.setExplode = t => {
      const l = sm(t / 0.15), a = sm((t - 0.08) / 0.37), c = sm((t - 0.3) / 0.2), b = sm((t - 0.5) / 0.22), s = sm((t - 0.66) / 0.34);
      latch.rotation.y = 1.75 * l;                     // the latch swings out on its front pivot, the bar lifting off the back
      cover.rotation.y = -2.9 * a;                     // the door opens on the right hinge, nearly flat
      cas.position.z = CZ - 13 * c;                    // the cassette lifts out
      mech.position.set(-96 * s, 0, -19 * b);          // the deck mechanism lifts clear of the front shell (its battery well
                                                       // reaches through the board), then moves aside to the left, uncovering the board
    };
    g.userData.setExplode(0);
    return g;
  },
};
