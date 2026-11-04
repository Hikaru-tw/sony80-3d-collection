// Sony Walkman TPS-L2 (1979) with its MDR-3L2 headphones, arranged as on the 80th-anniversary sticker.
// Player 88 x 133.5 x 29 mm (walkman.land; Sony's 1981 brochure: 8.8 x 13.4 x 2.9 cm). Face art: tex/tps-l2.png.
// Everything off the face follows the reference photos in reference image/real-product/tps-l2/ (MoDiP, Wikimedia
// Commons, the 1981 brochure), measured on photos rectified to mm by refs.py:
//   silver L-frame over the front strip and the right side only (the back is blue to the edge, MoDiP underside view)
//   right side, from the top: FF / REW / PLAY keys in the rear half, MIC grille and the long STOP-EJECT key in the front
//   half, the twin LEFT / RIGHT volume sliders, DC IN 3V near the bottom
//   top end: orange knurled HOTLINE button with its label plate, HEADPHONES A / B jacks (green rings), OPERATION lamp,
//   and their printed labels (placed on the rectified top-end photo); the silver frame's caps cover the top and bottom
//   back: battery door over the bottom 39 mm, wrapping the rounded back-left edge, latch tab, outlined STEREO moulded in
//   near the top; left side: dark ribbed inset panel, screws, a slide switch; right side printing (MIC, STOP EJECT, scales,
//   LEFT RIGHT VOLUME, DC IN 3V, SONY) as a decal on the flat of the wall
// Inside (teardown_*.jpg, Dave Jones' 1979 teardown on Commons): the cassette stands behind the door with its tape edge
// to the right; head and guides at its centre, capstan + pinch roller 20 mm towards the top, brass flywheel behind;
// white nylon gear and pulley behind the take-up reel, belts, a long brass motor along the left side; on the back the
// main board (1-601-515) and the servo amp board (1-601-516), conductor sides out, outlined and textured from the service
// manual's mounting diagram (archive.org), with felt pads and loose wiring; two AA cells across the bottom in a black tray;
// the jack board (HOT LINE switch, HEADPHONES jacks) under the top end and the AF amp board with the volume slide pot
// inside the right wall.
// setExplode(t): the door swings open on its left hinge and the cassette pops out (t 0-0.45), then the back cover swings
// open on its back-left edge and the silver side frame slides away (t 0.35-1), roughly as the real one comes apart.
import { buildCassette } from '../cassette.js';

export default {
  id: 'tps-l2', name: 'Sony Walkman TPS-L2', textures: ['tex/tps-l2', 'label_a', 'label_b', 'tex/tps-l2_main', 'tex/tps-l2_servo'], ink: 1.5,   // outlines + overlaps; part edges are drawn as rim lines (no crease detection: it dashes on bevels)
  openLabel: 'Open up', insideView: [150, 24, 1.15],   // viewer: [azimuth, elevation, distance x fit]
  build(THREE, K, T, P) {
    const g = new THREE.Group(), W = 88, H = 133.5, D = 29, X0 = -W / 2, X1 = W / 2, Y1 = H / 2, ZF = D / 2, ZB = -D / 2;
    const shell = new THREE.Group(), cover = new THREE.Group(), back = new THREE.Group(), side = new THREE.Group(), door = new THREE.Group(), doorIn = new THREE.Group(), inner = new THREE.Group();
    g.add(shell, cover, side, door, inner); door.add(doorIn); cover.add(back);
    const M = K.mapping([323, 343, 1012, 1357], [X0, Y1, X1, -Y1]);
    const blue = K.mat(0x4f8bc6), blueDk = K.mat(0x3a6c9f), silver = K.mat(0xd3d5d6), silverDk = K.mat(0xa9adb1), dark = K.mat(0x2e2a29);
    const orange = K.mat(0xf5a100), green = K.mat(0x3fae6a), white = K.mat(0xf2f2f0), red = K.mat(0xd8382c);
    const knurlOf = (base, dimple, pitch) => {   // knurled faces: fine dimples (cap UVs are in mm)
      const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
      x.fillStyle = base; x.fillRect(0, 0, 16, 16); x.fillStyle = dimple; x.fillRect(5, 5, 6, 6);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / pitch, 1 / pitch);
      return K.mat(0xffffff, { map: t });
    };
    const knurl = knurlOf('#d3d5d6', '#a7acb0', 1.2);
    // printed / embossed lettering: a transparent decal (w x h mm) drawn in mm units, facing +z before it is turned
    const decal = (w, h, draw, ppm = 24) => {
      const c = document.createElement('canvas'); c.width = Math.round(w * ppm); c.height = Math.round(h * ppm);
      const x = c.getContext('2d'); x.scale(c.width / w, c.height / h); x.textAlign = 'center'; x.textBaseline = 'middle'; draw(x);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.mat(0xffffff, { map: t, transparent: true, depthWrite: false }));
    };
    const fit = (x, s, cx, cy, size, w, color, font = 'Helvetica, Arial, sans-serif', stroke = 0) => {   // text fitted to w mm wide
      x.save(); x.font = `bold ${size}px ${font}`; const m = x.measureText(s).width;
      x.translate(cx, cy); x.scale(Math.min(w / m, 1.6), 1);
      if (stroke) { x.strokeStyle = color; x.lineWidth = stroke; x.lineJoin = 'round'; x.strokeText(s, 0, 0); } else { x.fillStyle = color; x.fillText(s, 0, 0); }
      x.restore();
    };
    const xs = M.mm(862, 0)[0];          // sticker: cassette door | silver strip (x = 24.8)
    const ZP = ZF - 1.6;                 // inner face of the door plates and the silver strip (1.6 mm thick)
    // profile in (x, z) run along y: local shape y = -z, so pathXZ takes [x, z] pairs
    const along = (pts, y0, y1, mats, bevel = 0.6) => {
      const s = K.poly(pts.map(([x, z]) => [x, -z]));
      const m = K.slab(s, y0, y1, { front: mats[0], side: mats[1], back: mats[2], bevel, segs: 12, rim: 'both' }); m.rotation.x = -Math.PI / 2;
      return m;
    };
    const arcXZ = (cx, cz, r, a0, a1, n = 6) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });

    // ---- case: hollow blue sleeve (1.2 mm walls) in pieces, so it can come apart ----
    const RB = 5, TW = 1.2, xw = X1 - 1.6, cx = X0 + RB, cz = ZB + RB;
    back.add(along([...arcXZ(cx, cz, RB, 180, 270), [xw, ZB], [xw, ZB + TW], ...arcXZ(cx, cz, RB - TW, 270, 180)], -Y1, Y1, [blue, blue, blue], 0.4));   // back wall + rounded back-left edge
    // battery door: a 0.3 mm skin over the bottom 39 mm of the back that wraps the rounded back-left edge (MoDiP back
    // view), so its seam runs round the corner instead of a flat plate standing proud of the curve
    back.add(along([...arcXZ(cx, cz, RB + 0.3, 180, 270, 12), [xw - 0.3, ZB - 0.3], [xw - 0.3, ZB + 0.1], ...arcXZ(cx, cz, RB - 0.1, 270, 180, 12)], -Y1 + 0.8, -Y1 + 39, [blue, blue, blue], 0));
    shell.add(along([[X0, cz], [X0 + TW, cz], [X0 + TW, ZP], [X0, ZP]], -Y1, Y1, [blue, blue, blue], 0.4));   // left wall
    // top and bottom ends: square-edged plates reaching half-way into the back and left walls and 0.05 mm short of their
    // tops, so the walls' inner rim lines are buried in the plate (they showed as dashes in the groove between bevels)
    const endPts = [[X0 + 0.6, ZP], [xw, ZP], [xw, ZB + 0.6], ...arcXZ(cx, cz, RB - 0.6, 270, 180)];
    shell.add(along(endPts, Y1 - TW, Y1 - 0.05, [blue, blue, blue], 0), along(endPts, -Y1 + 0.05, -Y1 + TW, [blue, blue, blue], 0));
    // ---- silver L-frame: front strip + right side wall, rounded outer corner ----
    const RS = 2.5;
    side.add(along([[xs, ZF], ...arcXZ(X1 - RS, ZF - RS, RS, 90, 0), ...arcXZ(X1 - 1, ZB + 1, 1, 0, -90, 3), [xw, ZB], [xw, ZP], [xs, ZP]], -Y1, Y1, [silver, silver, silver]));
    side.add(K.face(K.rr((xs + X1 - RS) / 2, 0, X1 - RS - xs, H - 1.2, 0), ZF + 0.02, M));   // the strip's drawn face (dot, outline)
    // silver end caps over the frame's top / bottom, the full depth (the top end photos): the frame's outline inset 0.65 mm,
    // so they sit inside its rounded corners and end bevels (a box here poked out of the 2.5 mm front-right round)
    const capPts = [[xs + 0.1, ZF - 0.65], ...arcXZ(X1 - RS, ZF - RS, RS - 0.65, 90, 0), ...arcXZ(X1 - 1, ZB + 1, 0.35, 0, -90, 3), [xs + 0.1, ZB + 0.65]];
    side.add(along(capPts, Y1 - 1.15, Y1 + 0.05, [silver, silver, silver], 0.2), along(capPts, -Y1 - 0.05, -Y1 + 1.15, [silver, silver, silver], 0.2));
    // ---- front: top band (fixed) and the cassette door (hinged on the left edge), window recessed ----
    const seam = M.mm(0, 509)[1], gap = 0.35;
    const topBand = K.slab(K.rr((X0 + xs) / 2, (seam + gap + Y1) / 2, xs - X0, Y1 - seam - gap, [3, 0, 0, 0]), ZP, ZF, { front: K.art, side: blue, bevel: 0.5, M, rim: 'front' });
    { // the sticker draws the HOTLINE button over the case's top outline: hold the band's top 0.9 mm to the outline row below it,
      // or a sliver of orange shows along the front's top edge
      const p = topBand.geometry.attributes.position, uv = topBand.geometry.attributes.uv;
      for (let i = 0; i < p.count; i++) { const [u, v] = M.uv(p.getX(i), Math.min(p.getY(i), Y1 - 0.9)); uv.setXY(i, u, v); }
      uv.needsUpdate = true;
    }
    shell.add(topBand);
    // dark backing behind the 0.7 mm gap between the band and the door: through it the cassette's orange label and the
    // board showed as coloured flecks along the seam (the photo has a dark line there). Above the cassette's top (y 42.2)
    shell.add(K.box(xs - X0 - TW, 3, 0.3, (X0 + TW + xs) / 2, seam, ZP - 0.25, dark));
    const [wx0, wy0] = M.mm(456, 668), [wx1, wy1] = M.mm(674, 1185);
    const lid = K.rr((X0 + xs) / 2, (seam - gap - Y1) / 2, xs - X0, seam - gap + Y1, [0, 0, 0, 3]);
    const win = new THREE.Path(); K.rr((wx0 + wx1) / 2, (wy0 + wy1) / 2, wx1 - wx0, wy0 - wy1, 2.3).getPoints(6).forEach((p, i) => i ? win.lineTo(p.x, p.y) : win.moveTo(p.x, p.y));
    lid.holes.push(win);
    door.position.set(X0, 0, ZF); doorIn.position.set(-X0, 0, -ZF);   // hinge line: the door's front-left edge
    cover.position.set(X0, 0, ZB); back.position.set(-X0, 0, -ZB);    // the back cover opens like a book on its back-left edge
    doorIn.add(K.slab(lid, ZP, ZF, { front: K.art, side: blue, bevel: 0.5, M, rim: 'front' }));
    const lining = K.rr((wx0 + wx1) / 2, (wy0 + wy1) / 2, wx1 - wx0, wy0 - wy1, 2.3), hole = new THREE.Path();
    K.rr((wx0 + wx1) / 2, (wy0 + wy1) / 2, wx1 - wx0 - 0.5, wy0 - wy1 - 0.5, 2.05).getPoints(6).forEach((p, i) => i ? hole.lineTo(p.x, p.y) : hole.moveTo(p.x, p.y));
    lining.holes.push(hole); doorIn.add(K.slab(lining, ZP + 0.55, ZF - 0.05, { side: dark, front: dark, back: dark }));   // dark walls of the window opening
    doorIn.add(K.face(K.rr((wx0 + wx1) / 2, (wy0 + wy1) / 2, wx1 - wx0, wy0 - wy1, 2.3), ZP + 0.6, M));   // window, 1 mm below the door
    doorIn.add(K.edges(K.box(xs - X0 - 6, seam + Y1 - 6, 0.6, (X0 + xs) / 2, (seam - Y1) / 2, ZP - 0.3, dark)));   // inner door lining (seen when open)
    // Against the rectified straight-on photo (rect_front.png, 10 px/mm), the sticker draws SONY 43 % too wide and 3 mm low,
    // the arrow twice its size, and the strip's dot 7 mm low (window, seam and WALKMAN agree). Each is covered with the
    // sticker's own plain blue / silver and drawn again, from the same art, at the photo's size and place. SONY keeps its
    // 4.4 mm below the seam (the sticker's seam is 1.2 mm lower than the photo's).
    const piece = (px, mm, z, parent) => parent.add(K.face(K.rr((mm[0] + mm[2]) / 2, (mm[1] + mm[3]) / 2, mm[2] - mm[0], mm[1] - mm[3], 0), z, K.mapping(px, mm)));
    const fromTL = (l, t, r, b) => [X0 + l, Y1 - t, X0 + r, Y1 - b];   // mm from the front's left / top edges -> x0, y0, x1, y1
    const plainBlue = [705, 650, 775, 690], plainSilver = [945, 960, 972, 1000];   // uniform patches of the sticker
    piece(plainBlue, fromTL(7.4, 27.7, 58.2, 38.4), ZF + 0.03, doorIn);                                  // drawn SONY covered
    piece([381, 555, 779, 633], fromTL(13.5 - 0.71, 26.2 - 0.5, 47.4 + 0.71, 31.7 + 0.5), ZF + 0.06, doorIn);   // SONY, 33.9 x 5.5 mm
    piece(plainBlue, fromTL(46.8, 64.9, 65, 97.1), ZF + 0.03, doorIn);                                   // drawn arrow covered
    piece([691, 837, 830, 1079], fromTL(53.4 - 0.34, 66.7 - 0.44, 60.6 + 0.34, 83.7 + 0.44), ZF + 0.06, doorIn);   // arrow, 7.2 x 17 mm
    piece(plainSilver, fromTL(72, 88, 78.9, 95.1), ZF + 0.05, side);                                     // drawn dot covered
    piece([887, 1011, 941, 1065], fromTL(73.45, 82.15, 77.55, 86.25), ZF + 0.08, side);                  // dot, 3.5 mm

    // ---- right side (x = X1): u = depth from the front, v = distance from the top ----
    const zu = u => ZF - u, yv = v => Y1 - v;
    const sideBox = (u0, u1, v0, v1, out, mats) => {   // flat block standing out of the right side; mats: outer face, the rest
      const b = new THREE.Mesh(new THREE.BoxGeometry(out, v1 - v0, u1 - u0), [mats[0], mats[1], mats[1], mats[1], mats[1], mats[1]]);
      b.position.set(X1 + out / 2, yv((v0 + v1) / 2), zu((u0 + u1) / 2)); return b;
    };
    const key = (u0, u1, v0, v1, out, cap, r = 1) => {   // key with rounded edges; cap = its outer face
      const m = K.slab(K.rr(-zu((u0 + u1) / 2), yv((v0 + v1) / 2), u1 - u0, v1 - v0, r), X1 - 0.5, X1 + out, { front: cap, side: silverDk, bevel: 0.6, rim: 'front' });
      m.rotation.y = Math.PI / 2; return m;   // local x -> world -z, local z -> world x
    };
    side.add(K.edges(sideBox(2.5, 9, 2.5, 10, 0.5, [silverDk, silverDk])));                         // MIC grille plate
    for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) side.add(K.cylX(yv(3.6 + j * 1.15), zu(3.4 + i * 1.2), X1 + 0.4, X1 + 0.62, 0.38, { side: dark, front: dark, segs: 8 }));
    side.add(key(2.6, 10, 13, 41, 2, silver, 1.5));                                                 // STOP / EJECT
    side.add(key(3.8, 8.4, 14, 20, 2.7, knurl));                                                    //   its knurled tip
    [[1, 6.5], [9, 14.5], [19, 33]].forEach(([v0, v1]) => side.add(key(12.2, 19.8, v0, v1, 3.4, knurl)));   // FF, REW, PLAY
    side.add(K.edges(sideBox(11.5, 21.5, 50, 92, 0.2, [silverDk, silverDk])));                      // volume channel
    for (const u of [13.8, 18.2]) side.add(sideBox(u, u + 1, 52, 90, 0.3, [dark, dark]));          //   its two slits
    for (let k = 0; k <= 10; k++) side.add(sideBox(22.5, 24.5, 51 + k * 2, 51.3 + k * 2, 0.3, [dark, dark]));   //   10-0 scale
    for (const [u0, u1, v0] of [[12.4, 16.2, 64], [16.8, 20.6, 60]]) side.add(key(u0, u1, v0, v0 + 18, 2.6, knurl, 0.8));   // LEFT / RIGHT sliders (as photographed)
    side.add(K.cylX(yv(117), zu(20.5), X1 - 0.2, X1 + 0.3, 3.6, { side: silverDk, front: silverDk }));   // DC IN 3V
    side.add(K.cylX(yv(117), zu(20.5), X1 - 0.2, X1 + 0.35, 2, { side: dark, front: dark }));
    // printing on the right side (Commons / brochure close-ups): MIC, the key arrows, STOP EJECT, both volume scales,
    // LEFT RIGHT VOLUME, DC IN 3V, SONY. Kept inside the flat part of the wall (u 3-27.5), clear of the rounded edges
    const sideInk = '#55595d', u0 = 3, v0 = 1;
    const sidePrint = decal(24.5, 131.5, x => {
      const at = (u, v) => [u - u0, v - v0], tri = (u, v, up) => { const [px, py] = at(u, v); x.beginPath(); x.moveTo(px, py + (up ? -0.55 : 0.55)); x.lineTo(px - 0.55, py + (up ? 0.45 : -0.45)); x.lineTo(px + 0.55, py + (up ? 0.45 : -0.45)); x.fill(); };
      x.fillStyle = sideInk;
      fit(x, 'MIC', ...at(5.75, 11.6), 1.8, 3.6, sideInk);
      tri(11.1, 2.9, true); tri(11.1, 4.4, true); tri(11.1, 10.8, false); tri(11.1, 12.3, false); tri(11.1, 25, true);   // FF, REW, PLAY
      fit(x, 'STOP', ...at(6.6, 45.5), 2.2, 5.6, sideInk); fit(x, 'EJECT', ...at(6.6, 48), 2.2, 6.6, sideInk);
      [['10', 51], ['5', 61], ['0', 71]].forEach(([s, v]) => { fit(x, s, ...at(26.2, v), 1.6, s.length * 0.8, sideInk); fit(x, s, ...at(10.6, v), 1.6, s.length * 0.8, sideInk); });
      for (let k = 1; k < 10; k++) if (k !== 5) { const [px, py] = at(10.5, 51 + 2 * k); x.beginPath(); x.arc(px, py, 0.18, 0, 7); x.fill(); }
      fit(x, 'LEFT', ...at(14.3, 93.7), 1.6, 3.4, sideInk); fit(x, 'RIGHT', ...at(19.2, 93.7), 1.6, 4, sideInk);
      fit(x, 'VOLUME', ...at(16.6, 96.1), 2.1, 7, sideInk);
      fit(x, 'DC IN 3V', ...at(20.8, 123.4), 1.5, 5.5, sideInk);
      fit(x, 'SONY', ...at(5.6, 130), 2, 5, sideInk, 'Georgia, "Times New Roman", serif');
    });
    sidePrint.rotation.y = Math.PI / 2; sidePrint.position.set(X1 + 0.03, yv(v0 + 131.5 / 2), zu(u0 + 24.5 / 2)); side.add(sidePrint);

    // ---- top end (y = Y1) ----
    const top = Y1;
    const btn = K.slab(K.rr(0, 0, 12, 8, 1.5), top - 1, top + 4.5, { front: knurlOf('#f5a100', '#d98a00', 0.7), side: orange, bevel: 0.8, rim: 'front' });   // HOTLINE, knurled top
    btn.rotation.x = -Math.PI / 2; btn.position.set(-18.5, 0, 7); shell.add(btn);
    shell.add(K.edges(K.box(5, 0.3, 2.5, -10.5, top + 0.1, 1, white)));                              // its label plate
    const onTop = (m, x, y, z) => { m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); shell.add(m); return m; };   // decal lying on the top, read from the front
    onTop(decal(5, 2.5, x => fit(x, 'HOTLINE', 2.5, 1.3, 1.5, 4.3, '#211714'), 40), -10.5, top + 0.27, 1);
    // HEADPHONES A / B over the jacks, OPERATION by the lamp, measured on the rectified top-end photo (rect_top.png)
    onTop(decal(32.5, 16, x => {
      const ink = '#dfe4ea', at = (px, pz) => [px + 9, pz + 13];
      fit(x, 'HEADPHONES', ...at(12.1, -2.4), 2.5, 17.2, ink);
      fit(x, 'A', ...at(5.2, 0.4), 2.5, 1.6, ink); fit(x, 'B', ...at(18.6, 0.2), 2.5, 1.6, ink);
      fit(x, 'OPERATION', ...at(13, -9.2), 1.9, 10.6, ink);
    }), 7.25, top + 0.03, -5);
    for (const x of [4.2, 19.5]) {                                                                   // HEADPHONES A / B
      shell.add(K.cylY(x, 6.7, top - 0.5, top + 0.35, 3.3, { side: green, front: green, rim: 'front' }));
      shell.add(K.cylY(x, 6.7, top - 0.5, top + 0.5, 2.5, { side: silverDk, front: silverDk }));
      shell.add(K.cylY(x, 6.7, top - 0.5, top + 0.55, 1.6, { side: dark, front: dark }));
    }
    shell.add(K.cylY(20.6, -9.5, top - 0.5, top + 0.3, 0.9, { side: red, front: red }));            // OPERATION lamp

    // ---- back (z = ZB): battery door across the bottom (above, with the case), latch tab, screws, embossed STEREO ----
    back.add(K.slab(K.rr(0.5, -Y1 + 39 + 3.4, 12, 6.5, 1), ZB - 1.2, ZB + 0.2, { side: blueDk, front: blueDk, back: blueDk, bevel: 0.3, rim: 'back' }));
    for (let i = 0; i < 3; i++) back.add(K.box(10, 0.5, 0.3, 0.5, -Y1 + 39 + 1.6 + i * 1.8, ZB - 1.3, blue));   // tab grip ridges
    for (const [x, y] of [[39, Y1 - 5], [36, -23]]) back.add(K.cylZ(x, y, ZB - 0.3, ZB + 0.2, 1.1, { side: silverDk, back: silverDk, front: silverDk, segs: 16 }));
    // outlined STEREO moulded into the back near the top, read from behind (MoDiP back view; rect_back.png: x 13-70 mm
    // from the right edge, 4-12 mm from the top): a dark edge under a light one, like a raised outline catching the light
    const emboss = decal(58, 10, x => {
      fit(x, 'STEREO', 29.12, 5.15, 10, 56, '#335f8c', 'Helvetica, Arial, sans-serif', 0.32);   // shade below
      fit(x, 'STEREO', 28.88, 4.85, 10, 56, '#6c9fd2', 'Helvetica, Arial, sans-serif', 0.32);   // light above
    }, 16);
    emboss.rotation.y = Math.PI; emboss.position.set(X1 - 41.5, Y1 - 8, ZB - 0.04); back.add(emboss);

    // ---- left side (x = X0): dark inset panel, screws, slide switch ----
    const ribs = (() => {   // the panel's fine ribs along its length (MoDiP back view), 0.9 mm pitch (cap UVs are in mm)
      const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
      x.fillStyle = '#3a6c9f'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#30608f'; x.fillRect(0, 0, 5, 16);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 0.9, 1 / 0.9);
      return K.mat(0xffffff, { map: t });
    })();
    const ls = K.slab(K.rr(0, 0, 18, 122, 1.5), -X0 - 0.2, -X0 + 0.3, { side: blueDk, front: ribs, back: blueDk, rim: 'front' });   // turned to face -x
    ls.rotation.y = -Math.PI / 2; ls.position.z = 1.5; shell.add(ls);
    for (const y of [-50, 38, 56]) shell.add(K.cylX(y, 1.5, X0 - 0.55, X0, 1.1, { side: silverDk, front: silverDk, back: silverDk, segs: 16 }));
    shell.add(K.box(0.4, 15, 5, X0 - 0.4, -19, 1.5, dark));
    shell.add(K.box(1.2, 4, 3, X0 - 0.8, -22, 1.5, silverDk));                                      // its knob

    // ================= inside =================
    const black = K.mat(0x2b2726), chrome = K.mat(0xd9dcdf), steel = K.mat(0xb7bcc0), brass = K.mat(0xc9a24a), nylon = K.mat(0xf3f1ea);
    const rubber = K.mat(0x1f1c1b), pcbEdge = K.mat(0x2f6e3a), felt = K.mat(0x34302d), capBlue = K.mat(0x2c5fb3), cellBlue = K.mat(0x2b4e9c);
    // cassette (the CHF 90 model, mm scale): stood on end behind the door, tape edge to the right; hubs line up with the drawn reels
    const CZ = 6.2, cas = buildCassette(THREE, { labelA: T.label_a, labelB: T.label_b, edges: true });
    cas.scale.setScalar(63.8); cas.rotation.z = Math.PI / 2; cas.position.set(-9.75, -8, CZ); inner.add(cas);
    // deck plate (black, behind the cassette) with the reel spindles
    inner.add(K.slab(K.rr(-6.4, 5, 72.6, 78, 1.5), -0.6, 0.1, { side: black, rim: 'front' }));
    for (const y of [13.25, -29.25]) {
      inner.add(K.cylZ(-13, y, 0.1, 1.0, 5.5, { side: brass, rim: 'front' }));
      inner.add(K.cylZ(-13, y, 1.0, 7.3, 3.3, { side: black, bevel: 0.6, rim: 'front' }));
      inner.add(K.cylZ(-13, y, 7.3, 8.0, 1.4, { side: nylon }));
    }
    // tape path at the cassette's open edge: guides, head, capstan + pinch roller
    for (const y of [-21, 5]) inner.add(K.lathe([[0, 0.3], [2.2, 0.3], [1.1, 10], [0, 10.6]], steel, 20).translateX(23.3).translateY(y));
    inner.add(K.slab(K.rr(27, -8, 8, 16, 1), 0.1, 1.3, { side: steel, rim: 'front' }));               // head bracket
    inner.add(K.slab(K.rr(25.3, -8, 4.6, 9, 1.2), 1.3, 11.4, { side: chrome, bevel: 0.6, rim: 'front' }));   // playback head
    inner.add(K.cylZ(23.6, 12.5, -5.5, 12, 0.9, { side: steel }));                                    // capstan
    inner.add(K.cylZ(28.2, 14.6, 2, 11, 4, { side: rubber, bevel: 0.5, rim: 'both' }));                // pinch roller
    inner.add(K.cylZ(28.2, 14.6, 11, 11.7, 1.4, { side: brass }));
    const arm = K.box(3, 12, 1.2, 0, 0, 0, steel); arm.position.set(31, 19.5, 11.8); arm.rotation.z = 0.5; inner.add(K.edges(arm));
    // drive: flywheel on the capstan, nylon gear + pulley behind the take-up reel, belts, motor along the left side
    inner.add(K.cylZ(23.6, 12.5, -5.5, -2.5, 11, { side: brass, rim: 'both' }));                       // flywheel
    inner.add(K.cylZ(23.6, 12.5, -2.5, -1.6, 3, { side: brass }));
    inner.add(K.slab(K.gear(-11, 13, 9, 9.7, 36), -4.6, -2.2, { side: nylon, rim: 'front' }));          // take-up gear
    inner.add(K.cylZ(-11, 13, -2.2, -0.6, 3, { side: nylon }));
    inner.add(K.cylZ(-26, 9, -5, -2.2, 8.5, { side: nylon, rim: 'both' }));                            // pulley
    inner.add(K.cylZ(-26, 9, -4, -3.2, 8.6, { side: K.mat(0xc9c6bd) }));
    inner.add(K.cylZ(-26, 9, -2.2, -1.4, 1.6, { side: brass }));
    const loop = (c1, r1, a10, a11, c2, r2, a20, a21, z) => [...K.arc(c1[0], c1[1], r1, a10, a11, 12, z), ...K.arc(c2[0], c2[1], r2, a20, a21, 12, z)];
    inner.add(K.tube(loop([23.6, 12.5], 11.4, -95, 95, [-26, 9], 8.9, 85, 275, -3.6), 0.55, rubber, { closed: true, segs: 120, radial: 6 }));   // flywheel belt
    inner.add(K.tube([[-26, 17.9, -4.6], [-31, 21.5, -5], [-35, 22.2, -1.6], [-38.4, 22.2, -5], [-35, 22.2, -10.2], [-30, 18, -6], [-26, 0.1, -4.6], [-17, 9, -4.6]], 0.5, rubber, { closed: true, segs: 120, radial: 6 }));   // motor belt
    inner.add(K.cylY(-35, -6.8, 24, 59.5, 6, { side: brass, front: steel, back: steel, rim: 'both' }));   // motor (taped can)
    inner.add(K.cylY(-35, -6.8, 59.5, 61.5, 5.2, { side: steel, front: black }));
    inner.add(K.cylY(-35, -6.8, 20.8, 24, 2.2, { side: brass }));                                      // its pulley
    // ---- boards on the back, conductor side out: outlines and copper from the service manual's 5-2 mounting diagram
    // (conductor side), scaled by the five SIP-8 ICs' 2.54 mm pin pitch (58.7 / 59.4 px per mm across / down the scan) and
    // mirrored left-right (the drawing looks at the back). Main board 1-601-515: 80 x 50 mm, its tall part (SONY 1-601-515,
    // DIP IN) along the right wall reaching down beside the battery tray, the long diagonal and the r 13.75 arc along its
    // top round the take-up drive; servo amp board 1-601-516 (IC601, the TAPE SPEED trimmer) 47.6 x 31.2 mm above it,
    // between the motor and the right wall. Both placed on Dave Jones' inside-back photo (the servo board's 45 mm photo
    // width matches); the conductor sides carry the drawing's copper and a tinned joint at every through hole.
    const MAIN = [[42.2, 6.2], [41.5, 6.7], [27.9, 6.7], [27.4, 6.2], [27.4, 1.1], [26.9, 0.6], [21.4, 0.6], [20.9, 1.1], [20.9, 2.5], [15.4, 6.4], [14.9, 6.7], [11.5, 6.7], [-19.5, -0.6], [-23.8, -0.1], [-27.2, 1.6], [-29.2, 3.3], [-30.9, 5.3], [-32.0, 6.8], [-32.8, 7.4], [-37.2, 7.4], [-37.9, 6.8], [-37.9, -33.8], [-37.2, -34.5], [20.4, -34.5], [21.1, -35.2], [21.1, -42.3], [21.7, -43.0], [41.5, -43.0], [42.2, -42.3]];
    const SERVO = [[23.4, 59.7], [21.3, 62.0], [-23.3, 62.0], [-24.2, 61.2], [-24.2, 31.7], [-23.5, 31.1], [22.7, 31.1], [23.4, 31.7]];
    const phenolic = K.mat(0xb8682f), pcbSide = K.mat(0x7a4a26);
    for (const [pts, tex, [x0, y1, x1, y0], [w, h]] of [[MAIN, 'tex/tps-l2_main', [-38.5, 8.5, 43.5, -44.5], [820, 530]], [SERVO, 'tex/tps-l2_servo', [-25.5, 63.5, 24.5, 30.5], [500, 330]]])
      inner.add(K.slab(K.poly(pts), -11.8, -10.6, { front: phenolic, back: K.mat(0xffffff, { map: T[tex] }), side: pcbSide, M: K.mapping([0, 0, w, h], [x0, y1, x1, y0], T[tex]), segs: 32, rim: 'back' }));
    // felt pads and the tape strip where the photo has them (three pads over the servo board, one by SONY 1-601-515)
    for (const [x, y, w, h] of [[36.8, -27.6, 10, 17.4], [5.8, 36.4, 31, 9.4], [1.2, 55.7, 37.4, 10], [-15.6, 41.1, 11.4, 18.8]]) inner.add(K.slab(K.rr(x, y, w, h, 1), -12.6, -11.8, { side: felt, rim: 'back' }));
    inner.add(K.slab(K.rr(10.1, -17.8, 13.2, 29.8, 0.5), -12.05, -11.8, { side: K.mat(0xeeeae0) }));   // tape strip
    // component side (towards the mechanism): the SIP-8 ICs standing on their pin rows, the TONE switch S301, trimmer RV601
    // and the larger electrolytics, where the mounting diagram has them
    for (const [x, y, alongY] of [[20.64, -15.92, 1], [11.28, -16.95, 1], [-12.63, -15.33, 1], [-25.11, -15.22, 1], [6.88, 37.37, 0]])   // IC201, IC101, IC102, IC202 (CX182 / CX184), IC601 (CX183)
      inner.add(K.edges(K.box(alongY ? 2.8 : 21, alongY ? 21 : 2.8, 6, x, y, -7.6, black)));
    inner.add(K.edges(K.box(8.5, 6.5, 4, -31.3, -13.2, -8.6, K.mat(0x3a3533))));                          // S301 TONE (HIGH / LOW)
    inner.add(K.edges(K.box(6, 6, 2, -6.8, 60.2, -9.6, K.mat(0xeeeae0))));                                // RV601 TAPE SPEED
    for (const [x, y, r] of [[24, -1.6, 2], [13.4, -1.7, 2], [-8.1, -10.2, 2], [-4.9, -10.7, 1.7], [6.2, -14.9, 1.7], [25.2, -14.5, 1.7], [-25.1, -27.3, 2.4], [-35.4, -25.7, 2.4],
      [-33.7, -3.1, 2.4], [-32, -31.4, 2.4], [-11, -32.2, 1.6], [-5, -30.7, 1.6], [8.6, 33.8, 2], [3.9, 33.8, 2]])   // C205, C105, C301, C103, C108, C208, C115, C215, C118, C218, C113, C213; C601, C605
      inner.add(K.cylZ(x, y, -10.6, -6.1, r, { side: capBlue, front: steel }));
    [[0xd8382c, [[12, 60], [14, 40], [2, 20], [-14, 5], [-22, -15], [-30, -34]]], [0x3c79c8, [[16, 58], [10, 30], [-4, 12], [-6, -10], [-18, -28], [-26, -34]]],
     [0xe8c23a, [[8, 56], [0, 36], [-20, 22], [-30, 20], [-35, 21]]], [0xf1efe8, [[30, -50], [24, -40], [10, -30], [-5, -20], [-12, -34]]]].forEach(([c, pts], i) =>
      inner.add(K.tube(pts.map(([x, y], j) => [x, y, -12.2 - 0.25 * ((i + j) % 2)]), 0.45, K.mat(c), { segs: 60, radial: 6 })));
    // two AA cells across the bottom in a black tray (open towards the battery door), DC IN jack block
    const tray = K.rr(-10.8, -50.1, 63.6, 30.6, 1), well = new THREE.Path();
    K.rr(-10.8, -50.1, 61.2, 28.2, 0.6).getPoints(4).forEach((p, i) => i ? well.lineTo(p.x, p.y) : well.moveTo(p.x, p.y));
    tray.holes.push(well); inner.add(K.slab(tray, -13.1, 0.1, { side: black, rim: 'back' }));
    inner.add(K.box(61.2, 28.2, 0.4, -10.8, -50.1, -0.1, black));
    for (const [y, dir] of [[-57.4, 1], [-42.8, -1]]) {
      const x0 = -36.05, x1 = 14.45, xp = dir > 0 ? x1 : x0;
      inner.add(K.cylX(y, -6.5, x0, x1, 6.8, { side: cellBlue, front: steel, back: steel, rim: 'both' }));
      inner.add(K.cylX(y, -6.5, dir > 0 ? x1 - 15 : x0, dir > 0 ? x1 : x0 + 15, 6.85, { side: brass }));   // printed band at the + end
      inner.add(K.cylX(y, -6.5, dir > 0 ? x1 : x0 - 1.3, dir > 0 ? x1 + 1.3 : x0, 2.6, { side: steel }));   // + terminal
      const xn = dir > 0 ? x0 : x1, coil = [];                                                          // spring at the - end
      for (let k = 0; k <= 40; k++) { const a = k / 40 * 5 * 2 * Math.PI, r = 4.5 - k * 0.04; coil.push([xn - dir * (k / 40) * 3.6, y + r * Math.cos(a), -6.5 + r * Math.sin(a)]); }
      inner.add(K.tube(coil, 0.3, steel, { segs: 120, radial: 5 }));
    }
    inner.add(K.edges(K.box(8, 10, 9, 36, -52, -6, black)));                                         // DC IN jack block
    // ---- the two small boards, from the service manual (5-2 mounting diagram; 6-1 exploded view) ----
    const copperOf = seed => {   // conductor side: phenolic with copper runs and tinned pads (mm UVs, 40 mm tile, drawn wrapped)
      const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
      let s = seed; const r = () => (s = s * 16807 % 2147483647) / 2147483647, tile = f => { for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) { x.save(); x.translate(ox, oy); f(); x.restore(); } };
      x.fillStyle = '#b8682f'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#d9a35c'; x.lineCap = x.lineJoin = 'round';
      for (let i = 0; i < 22; i++) { const w = 6 + r() * 10, pts = [[r() * 256, r() * 256]]; for (let k = 0; k < 2; k++) { const [px, py] = pts[pts.length - 1]; pts.push(r() < 0.5 ? [px + (r() - 0.5) * 140, py] : [px, py + (r() - 0.5) * 140]); }
        tile(() => { x.lineWidth = w; x.beginPath(); pts.forEach(([px, py], k) => k ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke(); }); }
      x.fillStyle = '#e3e1d8'; for (let i = 0; i < 40; i++) { const px = r() * 256, py = r() * 256; tile(() => { x.beginPath(); x.arc(px, py, 4, 0, 7); x.fill(); }); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 40, 1 / 40); return K.mat(0xffffff, { map: t });
    };
    // jack board 1-601-518 (A-3075-038-A): flat under the top end, between the motor and the right wall, component side
    // up. On it the HOT LINE push switch S801 under the orange button and the white HEADPHONES jack block J801 (1-507-665)
    // under the two jack rings; R801-R815, C801 / C802 along it, conductor side down (towards the cassette)
    inner.add(along([[-26, 1.5], [-13, 1.5], [-11, 0], [28, 0], [28, 12.4], [-26, 12.4]], 57, 58.2, [phenolic, pcbSide, copperOf(31)], 0));
    inner.add(K.edges(K.box(26, 6.3, 9.4, 11.85, 61.35, 6.7, K.mat(0xeeeae0))));                  // J801 block, x -1..24.7; its top 1 mm under the top plate (0.05 mm under, it bled through the plate's depth in the 250 px GIF renders)
    inner.add(K.edges(K.box(6, 4, 6, -18.5, 60.2, 7, black)));                                      // S801
    inner.add(K.cylY(-18.5, 7, 62.2, 65.7, 1.2, { side: steel, segs: 12 }));                       //   its plunger, up to the button
    for (const [x, z, alongX] of [[-8, 3, 1], [-8, 6, 1], [-12.5, 9.5, 0], [-5.5, 9.5, 0], [26, 4, 0], [26, 9, 0]])   // resistors R80x
      inner.add(alongX ? K.cylX(58.2 + 1.1, z, x - 2.2, x + 2.2, 0.9, { side: K.mat(0xc9a77a), segs: 8 }) : K.cylZ(x, 58.2 + 1.1, z - 2.2, z + 2.2, 0.9, { side: K.mat(0xc9a77a), segs: 8 }));
    for (const [x, z] of [[-24, 4], [-24, 9]]) inner.add(K.cylY(x, z, 58.2, 63, 1.8, { side: capBlue, front: steel, segs: 16 }));   // C801, C802
    // AF amp board 1-601-517: an 11.4 x 50 mm strip standing inside the right wall, carrying the dual 20k slide pot
    // RV101 / RV201 (VOLUME L / R) whose two tabs come out through the wall's slits into the LEFT / RIGHT sliders
    const af = K.slab(K.rr(2, -2, 11.4, 50, 0.6), 38.8, 40, { front: copperOf(57), side: pcbSide, back: phenolic, rim: 'both' });
    af.rotation.y = Math.PI / 2; inner.add(af);   // local x -> world -z, local z -> world x: x 38.8 .. 40, z -7.7 .. 3.7
    inner.add(K.edges(K.box(2.2, 42, 7.6, 41.1, -4, -2, K.mat(0x2f3a33))));                       // the pot's body
    inner.add(K.edges(K.box(2.2, 42, 0.4, 41.1, -4, 1.9, steel)), K.edges(K.box(2.2, 42, 0.4, 41.1, -4, -5.9, steel)));   // its frame
    for (const [z, y] of [[0.2, -6.25], [-4.2, -2.25]]) inner.add(K.edges(K.box(1.2, 3, 0.9, 41.8, y, z, steel)));   // tabs to LEFT / RIGHT, up to the wall
    // wiring to the main board: the jack board's leads down the right side, the pot's from its lower end
    [[0xf1efe8, 0], [0xd8382c, 1.1], [0x3c79c8, 2.2], [0x2a2a2a, 3.3]].forEach(([c, o]) => inner.add(K.tube([[26 - o * 0.5, 57, 2 + o * 0.6], [33 + o * 0.3, 40, -4 - o * 0.4], [35.5, 15, -9 - o * 0.3], [37 - o, 6, -10.2]], 0.4, K.mat(c), { segs: 40, radial: 6 })));
    [[0xd8382c, 0], [0xf1efe8, 1], [0x3c79c8, 2]].forEach(([c, o]) => inner.add(K.tube([[38.6, -26 - o, -5 + o], [36, -30, -9], [33 - 2 * o, -33, -10.2]], 0.4, K.mat(c), { segs: 30, radial: 6 })));

    // MDR-3L2 headphones in a plane just behind the player, as on the sticker; the parts follow the MDR-3L2 service manual's
    // exploded view (sm_tpsl2_mdr3l2_*.png) and the museum photos (commons_exhibit_headphones.jpg, the manual's cover photo):
    //   head band 4-865-911: flat steel strip, 9 mm wide, ending in grey sleeves with a window on the outside
    //   hangers 4-865-914 / 915: a strip riding on the band's outer face (stopper 4-865-907 at its top end), out through the
    //   sleeve and down to an arm with a pivot stud that ends in a ring round the ornamental cover
    //   ornamental cover X-4865-901 / 902: silver disc printed SONY, a grille of dots, R / L and MDR-3L2
    //   housing 4-865-910: dark stepped cup behind the cover; ear pad 4-865-901: blue foam, Ø48 x 14; cord bushing 4-865-917
    // The real hangers hang the cups ~95 mm below the sleeves' tops; here they are slid in, as the sticker draws them.
    // R is on the player's right (our left), as if the player wore them.
    const hp = new THREE.Group(); hp.position.z = -6; g.add(hp);
    const hpOn = !(P.q && P.q.get('hp') === '0');   // hp=0: player alone (measuring renders)
    const bandM = K.mat(0xeef0f0), hangM = K.mat(0xc9cdd0), sleeveM = K.mat(0xa9adb1), housingM = K.mat(0x55595e), hpDark = K.mat(0x3a3a3c);
    const padM = K.mat(0x3d84b9), padIn = K.mat(0x2a6087);
    const R = 72, cy = 30, BT = 1.2, BW = 9, yC = -31, o = R + BT / 2;   // band centre-line radius, thickness, width; cup centre height
    // band: semicircle and straight legs down into the sleeves, in the x-y plane, BW wide in z
    hp.add(K.slab(K.poly([...K.arc(0, cy, o, 0, 180, 72), [-o, 13], [-(R - BT / 2), 13], ...K.arc(0, cy, R - BT / 2, 180, 0, 72), [R - BT / 2, 13], [o, 13]]),
      -BW / 2, BW / 2, { side: bandM, bevel: 0.3, rim: 'both' }));
    for (const s of [-1, 1]) {
      // hanger strip, 1 mm thick on the band's outer face, 5 mm wide: from 40 degrees up the arc, down through the sleeve
      hp.add(K.slab(K.poly([[o, -6], [o + 1, -6], ...K.arc(0, cy, o + 1, 0, 40, 12), ...K.arc(0, cy, o, 40, 0, 12)].map(([x, y]) => [s * x, y])), -2.5, 2.5, { side: hangM, bevel: 0.3, rim: 'both' }));
      const ta = 37 * Math.PI / 180, stop = new THREE.Group();   // stopper: a round stud standing on the strip's top end
      stop.add(K.cylY(0, 0, 0, 1.3, 1.9, { side: hpDark, bevel: 0.4, segs: 24, rim: 'back' }));
      stop.rotation.z = s > 0 ? ta - Math.PI / 2 : Math.PI / 2 - ta; stop.position.set(s * (o + 1) * Math.cos(ta), cy + (o + 1) * Math.sin(ta), 0); hp.add(stop);
      // sleeve on the band's end, y 10-32: inner plate, side walls, and an outer plate with a window onto the strip
      const plateX = (shape, xa, xb, m, opts = {}) => { const k = K.slab(shape, Math.min(s * xa, s * xb), Math.max(s * xa, s * xb), { side: m, rim: 'both', ...opts }); k.rotation.y = Math.PI / 2; return k; };   // shape in (-z, y), thickness along x
      const win = K.rr(0, 21, 11.6, 22, 0.8); win.holes.push(K.rr(0, 21, 4.4, 12, 0.6));
      hp.add(plateX(win, 73.6, 74.8, sleeveM, { bevel: 0.25 }));
      hp.add(K.edges(K.box(1, 22, 11.6, s * 70.9, 21, 0, sleeveM)));
      for (const z of [-5.2, 5.2]) hp.add(K.edges(K.box(4.4, 22, 1.2, s * 72.6, 21, z, sleeveM)));
      // arm and ring of the hanger: one plate behind the cup, tangent to the ring at 50 / 130 degrees
      const arm = K.poly([[-2.5, -4], ...K.arc(0, yC, 15, 130, 410, 56), [2.5, -4]]); arm.holes.push(K.hole(0, yC, 12.4));
      hp.add(plateX(arm, 72, 73.9, hangM, { bevel: 0.3 }));
      hp.add(K.edges(K.box(0.5, 3, 3, s * 74.15, -9, 0, hpDark)));                                  // pivot stud
      // housing: dark stepped cup from the pad to the hanger ring
      const hs = K.lathe([[0, 0], [21.6, 0], [22, 0.4], [22, 1.6], [20.6, 2.2], [19.8, 2.8], [19.4, 4.8], [17.6, 6.1], [15.6, 6.5], [0, 6.5]], housingM, 64);
      hs.rotation.y = s * Math.PI / 2; hs.position.set(s * 65.6, yC, 0); hp.add(hs);
      // ornamental cover in the ring, its print as a decal (the cover photo: SONY, 16 x 5 grille dots, R, MDR-3L2)
      hp.add(K.cylX(yC, 0, s > 0 ? 72.2 : -74.6, s > 0 ? 74.6 : -72.2, 12.2, { side: hangM, bevel: 0.6, segs: 48, rim: 'both' }));
      const face = decal(24, 24, x => {
        x.fillStyle = '#d3d5d6'; x.beginPath(); x.arc(12, 12, 11.6, 0, 7); x.fill();
        x.strokeStyle = '#8f9397'; x.lineWidth = 0.3; x.beginPath(); x.arc(12, 12, 11, 0, 7); x.stroke();
        fit(x, 'SONY', 12, 6.6, 2.2, 6.6, '#3b3b3b', 'Georgia, "Times New Roman", serif');
        x.fillStyle = '#bfc2c5'; x.beginPath(); x.roundRect(3.6, 9, 16.8, 5.6, 1.2); x.fill();
        x.fillStyle = '#3a3d40';
        for (let i = 0; i < 16; i++) for (let j = 0; j < 5; j++) { x.beginPath(); x.arc(4.6 + i * 0.987, 9.8 + j * 1.0, 0.3, 0, 7); x.fill(); }
        fit(x, s < 0 ? 'R' : 'L', 12, 17, 2.4, 1.8, '#3b3b3b');
        fit(x, 'MDR-3L2', 12, 19.6, 1.1, 5.6, '#55585b');
      });
      face.rotation.y = s * Math.PI / 2; face.position.set(s * 74.65, yC, 0); hp.add(face);
      // cord bushing, down from the ring's bottom
      const bu = K.lathe([[0, 0], [2.2, 0], [2.2, 1.5], [1.6, 7], [1.3, 7.5], [0, 7.5]], hpDark, 24);
      bu.rotation.x = Math.PI / 2; bu.position.set(s * 73, yC - 14.2, 0); hp.add(bu);
      const ox = s * 66;                                                          // ear pad, x 52-66
      hp.add(K.cylX(yC, 0, Math.min(ox, ox - s * 14), Math.max(ox, ox - s * 14), 24, { side: padM, front: s < 0 ? padIn : padM, back: s < 0 ? padM : padIn, bevel: 4, rim: s < 0 ? 'front' : 'back' }));   // one line, on the side facing the player
    }

    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    g.userData.setExplode = t => {
      const a = sm(t / 0.45), b = sm((t - 0.35) / 0.65);
      door.rotation.y = -1.8 * a; cas.position.z = CZ + 10 * a;   // door swings open, the cassette pops out
      cover.rotation.y = Math.PI * b; side.position.x = 26 * b;   // back cover opens flat to the left like a book, silver frame slides away
      hp.visible = hpOn && t < 0.01;                              // headphones step aside while it is open
    };
    g.userData.setExplode(0);
    return g;
  },
};
