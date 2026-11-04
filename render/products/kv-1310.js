// Sony Trinitron KV-1310 (1968), the first Trinitron colour TV. Face art: tex/kv-1310.png.
// Size: Sony's US brochure for its twin, the KV-1210U, gives 17 3/4 x 14 1/4 x 15 5/8 in (451 x 362 x 397 mm) over the
// handle, feet, mask and back cover; Smithsonian NMAH 706163 also has the 17 3/4 in width. Sony's KV-1310 photo,
// rectified onto that width, puts the wood case at 451 x 329 mm (the knobs and the channel dial come out round there),
// and the sticker's layout matches it (reference image/real-product/kv-1310/rect_front_*.png). From the photos:
//   walnut sleeve, open front and back, a silver trim lining its front; the black panel recessed inside carries the
//   protruding picture-tube mask (cream pinstripe, SONY badge), the raised right-hand panel (speaker grille, TRINITRON
//   badge, COLOR badge, VHF channel dial) and the control strip (hue, colour, brightness, picture, PULL ON/VOL, two
//   earphone jacks); carrying handle: a square-ended black bar with a silver top on two round posts over a base plate
//   back (KV-1210U brochure drawing, Science Museum KV-1320UB): black plastic cover standing out of the sleeve, vents
//   along its rounded top edge, neck cover, antenna terminals, local/distance switch, breaker reset button, AC cord on
//   two hooks; antenna mount above it, hold knobs on top
//   underside (KV-1210U service manual figs. 2-2, 2-5, 2-6): riveted 8 x 7 slot vent plate and two bolted round feet on
//   the case bottom; slots, feet and the cover screws B1 / B2 under the back cover
// Inside (KV-1310E chassis photos on radiomuseum.org, Sony's Trinitron brochure pages): 12" 90-degree Trinitron tube
// with its implosion band, aperture grille and single in-line gun; copper deflection yoke and magnet rings on the neck,
// neck board; HV lead from the anode cap to the flyback in its clear housing, silver shield behind it; yellow-paper
// VHF turret tuner behind the dial, speaker behind the grille;
// main board on the left, signal board under the neck, power transformer, pots behind the knobs.
// From the KV-1200U / 1210U service manual too: the convergence anode cap clamped on the neck behind the beam alignment
// magnets, the plastic yoke mount on the bell, the H. / V. hold pots under the top knobs on a chassis rail; populated
// boards, the main board's solder side with its jumpers, and the wiring in tied bundles.
// setExplode(t): the wood case slides off forward (the chassis leaves the cabinet), the back cover comes off, then a
// quarter of the tube is cut away and the three beams run from the gun to the aperture grille.
export default {
  id: 'kv-1310', name: 'Sony Trinitron KV-1310', textures: ['tex/kv-1310'], ink: 1.5,
  openLabel: 'Open up', insideView: [112, 34, 1.2],      // viewer: [camera azimuth (+ = the set's right), elevation, distance x fit]
  build(THREE, K) {
    // depth (radiomuseum's side-on photo of a KV-1210U: wood case 496 px, back cover 332 px behind it, mask 60 px ahead,
    // scaled to the brochure's 397 mm overall): wood case 222 mm, back cover 150 mm behind it (housing to -187, neck cover
    // to -207), mask and dial 25 mm in front. The case is not as deep as it is tall: the tube's neck lives in the back cover
    const g = new THREE.Group(), W = 451, H = 329, X1 = W / 2, Y1 = H / 2, ZF = 165, ZB = ZF - 222, DZ = 11;   // DZ: back-face details moved forward to the new housing back (-187)
    const P = (x, y) => [x - X1, Y1 - y];   // the measured layout: mm from the case's left and top edges, front view
    const sleeve = new THREE.Group(), front = new THREE.Group(), rear = new THREE.Group(), inner = new THREE.Group();
    g.add(sleeve, front, rear, inner);
    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    const wood = K.mat(0x956235), woodDk = K.mat(0x6e431f), panel = K.mat(0x595757), maskM = K.mat(0x3f3b3a), silver = K.mat(0xd9dadb), chrome = K.mat(0xc9cacb);
    const black = K.mat(0x2b2a2a), dark = K.mat(0x1f1e1e), plateM = K.mat(0xd2cdd0), redM = K.mat(0xcf3223), steel = K.mat(0xb7bbbf), white = K.mat(0xf2f0ea);
    const canvasMat = (w, h, draw, rep) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
      return K.mat(0xffffff, { map: t });
    };
    const decal = (m, w, h, x, y, z, ry = 0, parent = front) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; parent.add(p); return p; };
    const ring = (outer, hole) => { const hp = new THREE.Path(); hole.getPoints(16).forEach((q, i) => i ? hp.lineTo(q.x, q.y) : hp.moveTo(q.x, q.y)); outer.holes.push(hp); return outer; };
    // Long frames (case, trim, mask ring, back cover, handle bar) as dense outlines extruded in steps: a long, sub-pixel-thin
    // triangle (a corner facet 330 mm deep, or a 450 mm cap/bevel band a few mm wide) interpolates its depth badly, and the
    // ink pass then stamps dots along the edges. Straight runs are split every `step` mm, arcs get 2 * `arc` facets. Only for
    // rings and long extrusions: a solid cap built this way gets long fan triangles (small plates keep K.slab).
    const dense = (shape, step = 14, arc = 3) => {
      const fill = c => { const pts = c.getPoints(arc), out = []; if (pts[0].equals(pts[pts.length - 1])) pts.pop();
        pts.forEach((a, i) => { const b = pts[(i + 1) % pts.length], n = Math.ceil(a.distanceTo(b) / step); for (let k = 0; k < n; k++) out.push(a.clone().lerp(b, k / n)); });
        return out; };
      const sh = new THREE.Shape(fill(shape)); sh.holes = shape.holes.map(h => new THREE.Path(fill(h))); return K.clean ? K.clean(sh, 1) : sh;
    };
    const bigSlab = (shape, z0, z1, o, steps = 1, arc = 3) => {
      const sh = dense(shape, 14, arc), m = K.slab(sh, z0, z1, { ...o, segs: 1 });
      if (steps > 1) {
        const b = Math.max(0, Math.min(o.bevel || 0, (z1 - z0) / 2 - 1e-3));
        const geo = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0 - 2 * b, steps, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 3, curveSegments: 1 });
        geo.translate(0, 0, z0 + b); const [lids, sides] = geo.groups;
        geo.clearGroups(); geo.addGroup(lids.start, lids.count / 2, 2); geo.addGroup(lids.start + lids.count / 2, lids.count / 2, 0); geo.addGroup(sides.start, sides.count, 1);
        if (o.M) K.applyUV(geo, o.M);
        m.geometry.dispose(); m.geometry = geo;
      }
      return m;
    };
    const sbox = (w, h, d, x, y, z, m) => K.edges(new THREE.Mesh(new THREE.BoxGeometry(w, h, d, Math.ceil(w / 14), Math.ceil(h / 14), Math.ceil(d / 14)), m)).translateX(x).translateY(y).translateZ(z);   // long thin box faces split the same way
    const label = (w, h, s, font, ls = '0px', bg = '#595757', fg = '#efefef') => canvasMat(w, h, x => {
      x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = font; x.letterSpacing = ls; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, w / 2, h / 2 + 1);
    });

    // ================= wood case: sleeve, handle, feet =================
    sleeve.add(bigSlab(ring(K.rr(0, 0, W, H, 6), K.rr(0, -2.5, W - 24, 301, 0)), ZB, ZF, { front: wood, side: wood, back: woodDk, bevel: 2.5, rim: 'both' }, 12));
    // the four long corners (6 mm round-overs running front to back) get a crisp line down their middle, like the rims
    // round the front and back faces: seen from above or behind, top and side otherwise meet with only a change of shade
    { const c = 6 * (1 - Math.SQRT1_2), pts = [];
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) pts.push(new THREE.Vector3(sx * (W / 2 - c), sy * (H / 2 - c), ZB + 2.5), new THREE.Vector3(sx * (W / 2 - c), sy * (H / 2 - c), ZF - 2.5));
      sleeve.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), K.lineMat)); }
    // handle (Sony's photo): a straight, square-ended black bar with a white top on two round posts, over one long base
    // plate; 27 mm tall, so handle + case + 6 mm feet = the brochure's 14 1/4 in (362 mm). Small black feet near the corners
    sleeve.add(K.edges(K.box(216, 2, 30, 0, Y1 + 1, 10, black)));                                                                          // base plate
    for (const s of [-1, 1]) sleeve.add(K.cylY(s * 89, 10, Y1 + 2, Y1 + 15.2, 5, { side: black, front: black, segs: 20 }));      // posts
    sleeve.add(bigSlab(K.rr(0, Y1 + 20.6, 222, 11, 0), 1, 19, { side: black, front: black, bevel: 1 }));                      // bar
    sleeve.add(K.box(219, 1, 15.4, 0, Y1 + 26.5, 10, silver));                                                                           // its top
    for (const s of [-1, 1]) sleeve.add(K.edges(K.box(16, 9.5, 22, s * 193, -Y1 - 1.25, ZF - 34, dark)));                       // front feet
    // underside (KV-1210U service manual, figs. 2-2, 2-5, 2-6: the set lies on its face, the cabinet's bottom seen from
    // below, its left there the set's right; positions as fractions of the bottom's width and depth): a riveted vent plate
    // with 8 x 7 slots over 6-82 % of the width (from the right) and 6-58 % of the depth (from the back), and two round
    // feet, each with a centre bolt (D1, D2 in the manual) and three screws round it
    const yb = -Y1, zAt = f => ZB + f * (ZF - ZB), xAt = f => X1 - f * W;
    const vx0 = xAt(0.815), vx1 = xAt(0.062), vz0 = zAt(0.06), vz1 = zAt(0.58), vcx = (vx0 + vx1) / 2, vcz = (vz0 + vz1) / 2;
    const ventPlate = K.slab(K.rr(vcx, -vcz, vx1 - vx0, vz1 - vz0, 6), yb - 1.2, yb + 0.1, { side: maskM, front: maskM, back: maskM, bevel: 0.3, rim: 'back' });
    ventPlate.rotation.x = -Math.PI / 2; sleeve.add(ventPlate);   // shape (x, -z), thickness along y
    for (let i = 0; i < 8; i++) for (let j = 0; j < 7; j++)
      sleeve.add(K.box(30.5, 0.4, 5.5, vx0 + (vx1 - vx0) * (i + 0.5) / 8, yb - 1.3, vz0 + 12 + j * ((vz1 - vz0 - 24) / 6), dark));
    for (const [fx, fz] of [[0, 0], [0.5, 0], [1, 0], [0, 1], [0.5, 1], [1, 1]])
      sleeve.add(K.cylY(vx0 + 4 + fx * (vx1 - vx0 - 8), vz0 + 4 + fz * (vz1 - vz0 - 8), yb - 1.9, yb - 1, 1.6, { side: steel, segs: 12 }));   // rivets
    for (const [f, d] of [[0.33, 0.7], [0.847, 0.59]]) {
      const fx = xAt(f), fz = zAt(d);
      sleeve.add(K.cylY(fx, fz, yb - 3, yb + 0.1, 9.5, { side: dark, front: dark, back: black, bevel: 1, segs: 32, rim: 'back' }));   // foot
      sleeve.add(K.cylY(fx, fz, yb - 4.2, yb - 2.9, 4.5, { side: steel, back: steel, segs: 20, rim: 'back' }));                          // bolt
      for (const a of [Math.PI, Math.PI / 3, -Math.PI / 3]) sleeve.add(K.cylY(fx + 15 * Math.sin(a), fz + 15 * Math.cos(a), yb - 1, yb + 0.1, 2.4, { side: steel, back: steel, segs: 12 }));   // screws: one behind, two in front
    }

    // ================= front: trim, recessed panel, tube mask, right-hand panel, control strip =================
    // wood shows 8.5 mm at the sides and bottom, 14.5 mm at the top; the trim is 5.5 mm (rect_front.png)
    front.add(bigSlab(ring(K.rr(0, -3, W - 17, 306, 3), K.rr(0, -3, W - 28, 295, 1)), ZF - 30, ZF + 1.2, { front: silver, side: chrome, bevel: 0.8, rim: 'front' }, 3));
    front.add(K.slab(K.rr(0, -2.5, W - 24.2, 300.8, 1), ZF - 14, ZF - 11, { front: panel, side: panel, back: dark }));
    // mask: sticker frame (white pinstripe, dark bezel) on its face, the glass (screen art) sunk 18 mm inside it
    const [fx0, fy1] = P(21, 32), [fx1, fy0] = P(338, 284), GX = -42.5, GY = 9.5, GW = 266, GH = 204;
    const MS = K.mapping([172, 226, 1060, 903], [fx0, fy1, fx1, fy0]), MG = K.mapping([243, 283, 1015, 832], [GX - GW / 2, GY + GH / 2, GX + GW / 2, GY - GH / 2]);
    const glassShape = () => K.rr(GX, GY, GW, GH, 24);
    front.add(bigSlab(ring(K.rr((fx0 + fx1) / 2, (fy0 + fy1) / 2, fx1 - fx0, fy1 - fy0, 7), glassShape()), ZF - 12, ZF + 22, { front: K.art, side: maskM, bevel: 2, M: MS, rim: 'front' }, 3, 6));
    front.add(K.dome(glassShape(), ZF + 4, 9, MG));
    // SONY badge, measured on rect_front.png (4 px/mm): bar to bar 61 mm over a 10.5 mm plate, letters 44 x 6.5 mm,
    // centred 167 mm from the left and 277 mm from the top (the sticker draws it at about half that width)
    const [bx, by] = P(167.2, 277.2);
    front.add(K.slab(K.rr(bx, by, 62, 10.5, 0.6), ZF + 21, ZF + 23.2, { side: chrome, front: dark, rim: 'front' }));
    decal(canvasMat(512, 80, (x, w, h) => {
      x.fillStyle = '#2b2827'; x.fillRect(0, 0, w, h); x.fillStyle = '#e9e9e9'; x.fillRect(4, 8, 5, 64); x.fillRect(w - 9, 8, 5, 64);
      x.font = 'bold 78px Georgia, serif'; x.textBaseline = 'alphabetic'; const tw = x.measureText('SONY').width;
      x.save(); x.translate(w / 2 - 185, h / 2 + 27); x.scale(370 / tw, 1); x.fillText('SONY', 0, 0); x.restore();   // 44 mm wide, 6.5 mm caps
    }), 61, 9.6, bx, by, ZF + 23.25);
    // right-hand panel: speaker grille, TRINITRON badge, dial plate with the COLOR badge and the VHF channel dial
    const [rx0, ry1] = P(341, 30), [rx1, ry0] = P(416, 284), rcx = (rx0 + rx1) / 2;
    front.add(K.slab(K.rr(rcx, (ry0 + ry1) / 2, rx1 - rx0, ry1 - ry0, 2), ZF - 12, ZF + 7.5, { front: silver, side: chrome, bevel: 1.2, rim: 'front' }));
    const [, gy1] = P(0, 32), [, gy0] = P(0, 156), gcy = (gy0 + gy1) / 2;
    front.add(K.slab(K.rr(rcx, gcy, 71, gy1 - gy0, 1), ZF + 7, ZF + 8.6, { side: dark, front: dark, rim: 'front' }));
    decal(canvasMat(256, 448, (x, w, h) => {
      x.fillStyle = '#a89e92'; x.fillRect(0, 0, w, h); x.fillStyle = '#6f675e';
      for (let r = 0, yy = 7; yy < h - 3; yy += 8, r++) for (let xx = 7 + (r % 2) * 4; xx < w - 3; xx += 8) { x.beginPath(); x.arc(xx, yy, 2, 0, 7); x.fill(); }
    }), 70, gy1 - gy0 - 1, rcx, gcy, ZF + 8.65);
    decal(canvasMat(512, 94, (x, w) => {
      x.fillStyle = '#3f3b3a'; x.fillRect(0, 0, w, 58); x.fillStyle = '#d2cdd0'; x.fillRect(0, 58, w, 36);
      x.fillStyle = '#f4f4f4'; x.font = 'bold 40px Arial'; x.letterSpacing = '9px'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TRINITRON', w / 2 + 4, 31);
      ['#e60012', '#22ac38', '#1d8fd8'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.ellipse(w * (i * 2 + 1) / 6, 76, 72, 12, 0, 0, 7); x.fill(); });
    }), 71, 13, rcx, Y1 - 164, ZF + 7.6);
    const [, py1] = P(0, 171.5), [, py0] = P(0, 282);
    front.add(K.slab(K.rr(rcx, (py0 + py1) / 2, 71, py1 - py0, 1), ZF + 7, ZF + 8.6, { side: chrome, front: plateM, rim: 'front' }));
    const [cbx, cby] = P(379, 190.5);
    front.add(K.slab(K.rr(cbx, cby, 11, 13, 0.6), ZF + 8.6, ZF + 10, { side: dark, front: dark, rim: 'front' }));
    decal(canvasMat(64, 76, (x, w, h) => {
      x.fillStyle = '#1d1c1c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8e8e8'; x.lineWidth = 3; x.strokeRect(5, 5, w - 10, h - 10);
      x.fillStyle = '#f2f2f2'; x.font = 'bold 17px Arial Narrow, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('COLOR', w / 2, h / 2 + 1);
    }), 10.4, 12.4, cbx, cby, ZF + 10.05);
    front.add(K.box(1.8, 7, 0.8, ...P(377.5, 213), ZF + 9, redM));   // index mark over the dial
    const [dx, dy] = P(377.5, 247), MD = K.mapping([1097, 692, 1303, 898], [dx - 25.5, dy + 25.5, dx + 25.5, dy - 25.5]);
    front.add(K.cylZ(dx, dy, ZF + 8.6, ZF + 13, 25.5, { front: K.art, side: chrome, bevel: 1, M: MD, segs: 64, rim: 'front' }));   // number ring
    front.add(K.cylZ(dx, dy, ZF + 13, ZF + 19, 12.5, { front: K.art, side: chrome, bevel: 0.8, M: MD, segs: 48, rim: 'front' }));  // centre knob
    const bar = K.edges(K.box(30, 6.5, 6, dx, dy, ZF + 22, K.mat(0xefeff0))); bar.rotation.z = Math.PI / 4; front.add(bar);
    // control strip: four knobs (sticker caps on chrome skirts), PULL ON/VOL, earphone jacks, the strip's lettering
    const knob = (sx, sy, x, y) => {
      const Mk = K.mapping([sx - 40, sy - 40, sx + 40, sy + 40], [x - 8.5, y + 8.5, x + 8.5, y - 8.5]);
      front.add(K.cylZ(x, y, ZF - 11, ZF + 1.5, 6, { side: chrome, segs: 32 }));
      front.add(K.cylZ(x, y, ZF + 1.5, ZF + 13, 8.5, { front: K.art, side: chrome, bevel: 1, M: Mk, segs: 40, rim: 'front' }));
    };
    [[222.5, 45], [323, 79], [425.5, 113], [527.5, 147]].forEach(([sx, x]) => knob(sx, 957.5, ...P(x, 301)));
    knob(1200, 957.5, ...P(379, 303));
    for (const y of [296.5, 307.5]) {
      const [x, yy] = P(419, y);
      front.add(K.cylZ(x, yy, ZF - 11.5, ZF - 9.6, 3.6, { front: chrome, side: chrome, segs: 24, rim: 'front' }));
      front.add(K.cylZ(x, yy, ZF - 9.7, ZF - 9.5, 1.9, { front: dark, side: dark, segs: 16 }));
    }
    // the strip's lettering spans 206 .. 337.5 mm on rect_front.png (131 mm; it was 82): fitted to that width
    decal(canvasMat(1024, 40, x => {
      const s = 'SOLID STATE  |  TRINITRON COLOR';
      x.fillStyle = '#595757'; x.fillRect(0, 0, 1024, 40); x.fillStyle = '#efefef'; x.font = '28px Arial'; x.letterSpacing = '6px'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const tw = x.measureText(s).width; x.save(); x.translate(512, 21); x.scale(1001 / tw, 1); x.fillText(s, 0, 0); x.restore();
    }), 134, 5, ...P(271.75, 300), ZF - 10.9);
    decal(canvasMat(512, 64, x => {   // PULL ON/VOL: 370 .. 395 mm on the photo (25 mm wide; it was ~12)
      x.fillStyle = '#595757'; x.fillRect(0, 0, 512, 64); x.fillStyle = '#efefef'; x.font = 'bold 40px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const tw = x.measureText('PULL ON/VOL').width; x.save(); x.translate(256, 34); x.scale(474 / tw, 1); x.fillText('PULL ON/VOL', 0, 0); x.restore();
    }), 27, 3.2, ...P(382.5, 289.5), ZF - 10.9);

    // ================= back cover =================
    // back plate in the sleeve's opening, round the housing (KV-1320UB back photo): top band and two side strips
    for (const [x0, x1, y0, y1] of [[-213.2, 213.2, 122, 147.8], [-213.2, -178, -152.8, 122], [200, 213.2, -152.8, 122]])
      rear.add(K.box(x1 - x0, y1 - y0, 2.5, (x0 + x1) / 2, (y0 + y1) / 2, ZB - 2.25, black));
    const hy0 = -Y1 + 1, hy1 = 122;
    const hous = bigSlab(K.rr(122, (hy0 + hy1) / 2, 130, hy1 - hy0, [0, 22, 2, 0]), -178, 200, { side: black, front: black, back: black, bevel: 1.5, rim: 'both' }, 14, 6);
    hous.rotation.y = Math.PI / 2; rear.add(hous);   // profile drawn in (depth behind the sleeve, height), run across the width
    for (let x = -168; x < 192; x += 8.5) {   // housing spans x -178..200: the back plate shows beside it, as on the KV-1320UB
      rear.add(K.box(3.2, 15, 0.6, x, 86, -187.3, dark));      // vents under the rounded top edge
      rear.add(K.box(3.2, 0.6, 9, x, hy1 + 0.3, -150, dark));  // and on top, before the rounded edge
      rear.add(K.box(3.2, 9, 0.6, x, -152, -187.3, dark));     // and along the bottom
    }
    rear.add(K.slab(K.rr(GX, -8, 190, 150, 26), -207, -186.5, { side: black, back: black, front: black, bevel: 8, segs: 32, rim: 'back' }));   // neck cover
    for (const x0 of [GX - 66, GX + 10]) for (let i = 0; i < 9; i++) rear.add(K.box(2.6, 13, 0.6, x0 + i * 6.5, 40, -207.3, dark));
    rear.add(K.cylZ(GX + 44, -42, -208, -207, 12, { side: black, back: black, segs: 32, rim: 'back' }));
    rear.add(K.slab(K.rr(135, 0, 44, 80, 3), -194, -186.5, { side: black, back: black, front: black, bevel: 1.5, rim: 'back' }));       // antenna terminals
    for (const [x, y] of [[126, 18], [144, 18], [126, -14], [144, -14]]) rear.add(K.cylZ(x, y, -197.5, -194, 3.4, { side: steel, segs: 16, rim: 'back' }));
    rear.add(K.edges(K.box(16, 7, 2, 150, -62, -188, dark)));                                       // local / distance switch
    rear.add(K.cylZ(124, -61, -193, -187, 3.6, { side: redM, segs: 20, rim: 'back' }));             // breaker reset
    rear.add(K.edges(K.box(20, 24, 4, 150, -120, -188.5, dark)));                                   // AC inlet
    for (const [x, y] of [[-150, 66], [150, 66], [175, 104]]) rear.add(K.cylZ(x, y, -188, -187, 3, { side: silver, segs: 16, rim: 'back' }));
    const cordM = K.mat(0xe4e4e0);
    for (const x of [62, -142]) rear.add(K.edges(K.box(10, 22, 12, x, -100, -193, dark)));          // cord hooks
    const coil = (rx, ry, z) => K.tube(Array.from({ length: 24 }, (_, i) => { const a = i / 24 * 2 * Math.PI; return [-40 + rx * Math.cos(a), -100 + ry * Math.sin(a), z]; }), 2.6, cordM, { closed: true, segs: 96, radial: 8 });
    rear.add(coil(104, 9, -200), coil(100, 12, -203));
    rear.add(K.tube([[150, -120, -191], [138, -112, -197], [100, -106, -201], [64, -100, -201]], 2.6, cordM, { segs: 30, radial: 8 }));
    rear.add(K.edges(K.box(24, 30, 16, -20, -116, -212, cordM)));                                   // plug
    decal(canvasMat(256, 72, (x, w) => {
      x.fillStyle = '#c8a24a'; x.fillRect(0, 0, w, 72); x.fillStyle = '#3a2a10'; x.textAlign = 'center';
      x.font = 'bold 15px Arial'; x.fillText('SONY CORPORATION', w / 2, 22); x.font = '13px Arial'; x.fillText('MODEL KV-1310   AC 100V 50/60Hz', w / 2, 42); x.fillText('MADE IN JAPAN', w / 2, 60);
    }), 64, 18, 10, -132, -187.4, Math.PI, rear);
    // antenna mount (a sheet-steel U on the housing top, open at the top), hold knobs and rear feet placed as on the
    // KV-1320UB's back (Science Museum photo, scaled on the housing width); the mount stands near the front of the housing
    // top, just behind the wood case (KV-1210U side photo; the KV-1320UB back photo agrees), the knobs half-way back
    for (const x of [-6, 40]) rear.add(K.edges(K.box(2, 27, 25, x, hy1 + 13.5, -75, steel)));
    rear.add(K.edges(K.box(48, 27, 2, 17, hy1 + 13.5, -86.5, steel)));
    for (const x of [128, 90]) rear.add(K.cylY(x, -112, hy1, hy1 + 9, 7, { side: dark, front: black, segs: 24, rim: 'front' }));   // hold knobs
    for (const x of [124, -112]) rear.add(K.edges(K.box(15, 9.5, 22, x, -Y1 - 1.25, -175, dark)));      // rear feet
    // the housing's underside (KV-1210U manual fig. 2-2): a run of ~40 slots running front to back between the feet, and
    // the two screws by the back edge (B1, B2) that hold the cover; placed on this cover's feet
    for (let x = -65; x <= 104; x += 4.25) rear.add(K.box(2.2, 0.4, 44, x, hy0 - 0.1, -117, dark));
    for (const x of [150, -138]) rear.add(K.cylY(x, -178, hy0 - 1.2, hy0 + 0.1, 3.8, { side: silver, back: silver, segs: 16, rim: 'back' }));

    // ================= inside =================
    const glassDk = K.mat(0x4a4f52), funnelM = K.mat(0x3c3e40), neckM = K.mat(0xc6d4cc), copper = K.mat(0xc77a3c), galv = K.mat(0xbfc3c6), yellow = K.mat(0xe7c75a), ferrite = K.mat(0x4a4a4c);
    const blue = K.mat(0x2e6db4), beige = K.mat(0xd8c9a3), brown = K.mat(0x6b4a2b), boardEdge = K.mat(0x6b5a2a);
    const boardM = canvasMat(256, 256, x => {
      x.fillStyle = '#a08c4e'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#7d6a35'; x.lineWidth = 4;
      for (let i = 0; i < 16; i++) { const a = (i * 97) % 256, b = (i * 53) % 256; x.beginPath(); x.moveTo(a, b); x.lineTo(a + 40, b); x.lineTo(a + 40, (b + 70) % 256); x.stroke(); }
      x.fillStyle = '#f0ead8'; for (let i = 0; i < 40; i++) x.fillRect((i * 71) % 256, (i * 113) % 256, 10, 2);
    }, [1 / 40, 1 / 40]);
    const flip = geo => { const g2 = geo.clone(), ix = g2.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g2.computeVertexNormals(); return g2; };
    // picture tube: faceplate skirt (z 129-168) and funnel morphing from its superellipse to the 29 mm neck at z -40
    const ZT = ZF - 36, LT = 169, NS = 96, NR = 24, AX = 138, AY = 107;
    const tubeAt = (t, i, inset = 0) => {
      const th = i / NS * 2 * Math.PI, c = Math.cos(th), s = Math.sin(th);
      const ex = Math.sign(c) * Math.abs(c) ** 0.4, ey = Math.sign(s) * Math.abs(s) ** 0.4 * AY / AX, q = sm((t - 0.1) / 0.7);
      const r = 15 + (AX - 15) * (1 - t ** 2.2) ** 1.8 - inset;
      return [GX + r * (ex + (c - ex) * q), GY + r * (ey + (s - ey) * q), ZT - LT * t];
    };
    const neckAt = (t, i, inset = 0) => { const th = i / NS * 2 * Math.PI; return [GX + (14.5 - inset) * Math.cos(th), GY + (14.5 - inset) * Math.sin(th), -40 - 100 * t]; };
    // glass wall as two shells (outer faces out, inner faces in), so the cut-away shows its inside from any angle
    const shell = (fn, nk, i0, i1, k0, k1, m) => {
      const pos = [], idx = [], ni = i1 - i0 + 1, nr = k1 - k0 + 1;
      for (const inset of [0, 2.5]) for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) pos.push(...fn(k / nk, i % NS, inset));
      for (const [o, out] of [[0, true], [ni * nr, false]]) for (let k = 0; k < nr - 1; k++) for (let i = 0; i < ni - 1; i++) {
        const a = o + k * ni + i, b = a + 1, c = a + ni + 1, d = a + ni;
        if (out) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      return new THREE.Mesh(geo, m);
    };
    inner.add(shell(tubeAt, NR, NS / 4, NS, 0, NR, funnelM), shell(neckAt, 4, NS / 4, NS, 0, 4, neckM));
    const wipe = [shell(neckAt, 4, 0, NS / 4, 0, 4, neckM)];   // cut-away quarter (+x +y), removed from the neck towards the face
    for (let k = NR; k > 0; k -= 3) wipe.push(shell(tubeAt, NR, 0, NS / 4, k - 3, k, funnelM));
    wipe.forEach(m => inner.add(m));
    const skirtPts = Array.from({ length: NS }, (_, i) => tubeAt(0, i));
    const outline = (sx, sy) => skirtPts.map(([x, y]) => [GX + (x - GX) * sx, GY + (y - GY) * sy]);
    const ringPts = (o, h) => { const s = K.poly(o), hp = new THREE.Path(); h.forEach(([x, y], i) => i ? hp.lineTo(x, y) : hp.moveTo(x, y)); s.holes.push(hp); return s; };
    inner.add(K.slab(ringPts(outline(1, 1), outline(0.97, 0.96)), ZT, ZF + 3, { side: glassDk, front: glassDk, back: glassDk }));
    inner.add(K.slab(ringPts(outline(1.016, 1.02), outline(1, 1)), ZT + 6, ZT + 20, { side: steel, front: steel, back: steel, rim: 'both' }));   // implosion band
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      inner.add(K.edges(K.box(16, 16, 2.5, GX + sx * 128, GY + sy * 98, ZT + 13, steel)));              // band ears
      inner.add(K.cylZ(GX + sx * 128, GY + sy * 98, ZT + 13, ZF - 14, 3, { side: galv, segs: 12 }));   // posts to the panel
    }
    // faceplate inside: phosphor stripes, aperture grille (vertical wires on a heavy frame)
    decal(canvasMat(48, 4, x => { ['#d8463c', '#4cbf5a', '#3f78e0'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * 16, 0, 13, 4); }); x.fillStyle = '#1e1e1e'; [13, 29, 45].forEach(v => x.fillRect(v, 0, 3, 4)); }, [80, 1]), 236, 176, GX, GY, ZF - 16, Math.PI, inner);
    decal(canvasMat(16, 4, x => { x.fillStyle = '#9ea4aa'; x.fillRect(0, 0, 16, 4); x.fillStyle = '#26282a'; x.fillRect(11, 0, 5, 4); }, [80, 1]), 236, 176, GX, GY, ZF - 26, Math.PI, inner);
    for (const s of [-1, 1]) {
      inner.add(K.edges(K.box(200, 7, 7, GX, GY + s * 91.5, ZF - 28, galv)));
      inner.add(K.edges(K.box(5, 150, 6, GX + s * 121, GY, ZF - 28, galv)));
    }
    // gun: electrode stack on glass bead rods, three in-line apertures
    [[-138, -128, 7, steel], [-128, -124, 8, dark], [-124, -110, 8.5, steel], [-110, -106, 9, dark], [-106, -80, 10, steel], [-80, -76, 10, dark], [-76, -62, 11, steel]]
      .forEach(([z0, z1, r, m]) => inner.add(K.cylZ(GX, GY, z0, z1, r, { side: m, front: m, back: m, segs: 24, rim: 'both' })));
    for (const s of [-1, 1]) inner.add(K.edges(K.box(3, 2.4, 70, GX, GY + s * 11.5, -100, white)));
    for (const ddx of [-3.2, 0, 3.2]) inner.add(K.cylZ(GX + ddx, GY, -61.9, -61.6, 1.3, { front: dark, side: dark, segs: 12 }));
    inner.add(K.cylZ(GX, GY, -152, -140, 16, { side: black, front: black, back: black, segs: 32, rim: 'back' }));   // tube socket
    inner.add(K.slab(K.rr(GX, GY, 64, 56, 2), -155.5, -154, { side: boardEdge, front: boardM, back: boardM, rim: 'back' }));   // neck board
    for (const [x, y, w, h] of [[-18, 14, 10, 6], [14, 16, 8, 8], [-16, -16, 12, 5], [16, -14, 6, 10]]) inner.add(K.edges(K.box(w, h, 4, GX + x, GY + y, -157.5, x > 0 ? blue : beige)));
    // deflection yoke (copper windings in black rings), convergence / purity magnets
    const yoke = K.lathe([[54, 9], [40, -3], [31, -14], [22, -27], [17.5, -40], [17, -52], [27, -52], [29, -44], [37, -30], [49, -16], [61, -3], [67, 5], [67, 9], [54, 9]], copper, 48);
    const yRing1 = K.lathe([[57, 9], [70, 9], [70, 13], [57, 13], [57, 9]], black, 48), yRing2 = K.lathe([[15.5, -58], [24, -58], [24, -52], [15.5, -52], [15.5, -58]], black, 32);
    [yoke, yRing1, yRing2].forEach(m => { m.position.set(GX, GY, 0); inner.add(m); });
    [[-96, white], [-101, black], [-106, white]].forEach(([z, m]) => { const r = K.lathe([[15.2, z], [24, z], [24, z + 3], [15.2, z + 3], [15.2, z]], m, 32); r.position.set(GX, GY, 0); inner.add(r); });
    // anode cap on the funnel, HV lead to the flyback (yellow winding on a ferrite U core) above the main board
    const pa = new THREE.Vector3(...tubeAt(0.32, 32)), out = new THREE.Vector3(pa.x - GX, pa.y - GY, 0).normalize().multiplyScalar(10).add(new THREE.Vector3(0, 0, 4));
    const cap = K.lathe([[0, 0], [13, 0], [11, 4], [6, 7], [0, 7.5]], redM, 24); cap.position.copy(pa); cap.lookAt(pa.clone().add(out)); inner.add(cap);
    const pc = pa.clone().addScaledVector(out, 0.7);
    inner.add(K.tube([[pc.x, pc.y, pc.z], [-140, 132, 62], [-160, 135.5, 40]], 3, redM, { segs: 40, radial: 10 }));
    // the convergence anode: a Trinitron's second high-voltage connection (KV-1200U / 1210U service manual, 2-11 and 2-12:
    // "Install the two anode caps", "Move the two caps along the leads"). It is on the neck, not the funnel: the beam
    // alignment magnet assembly goes on with "the rear edge ... in contact with the convergence anode cap", the "two-terminal
    // group at the 12 o'clock position", and the cap takes "two bolts". So it is a band clamped round the neck just behind
    // the magnet rings, its lug and bolts on top; its lead loops forward over the yoke to the high-voltage case, as the
    // KV-1310E photo from above shows a white lead running round the yoke down to the neck
    {
      const zc0 = -116, zc1 = -107, bandM = K.mat(0x9a9fa3);
      const band = K.lathe([[14.6, zc0], [19, zc0], [19, zc1], [14.6, zc1], [14.6, zc0]], bandM, 32); band.position.set(GX, GY, 0); inner.add(band);
      inner.add(K.edges(K.box(10, 8, 9, GX, GY + 22, (zc0 + zc1) / 2, bandM)));                                   // lug at 12 o'clock
      for (const s of [-1, 1]) inner.add(K.cylY(GX + s * 3, (zc0 + zc1) / 2, GY + 26, GY + 28.4, 1.6, { side: steel, segs: 10, rim: 'front' }));   // its two bolts
      inner.add(K.tube([[GX, GY + 26, -111.5], [GX - 6, GY + 50, -95], [GX - 30, GY + 88, -40], [-120, 122, 40], [-150, 127.5, 48]], 2.4, redM, { segs: 60, radial: 10 }));
    }
    // yoke mount (the same manual, figs. 2-29 and 2-30: "the plastic assembly that supports the deflection yoke is
    // permanently affixed to the bell of the picture tube"): a collar round the yoke's front, four feet glued to the funnel
    // on the diagonals, a bridge across its top, and the two wing screws (T1) on its side that clamp the yoke; the clamp
    // screw on the band round the yoke's neck end. The collar clears the yoke's front ring by 1 mm, its front edge stands
    // 1 mm off the glass (funnel r 70 on the diagonals at z 22), and the feet lie 0.2 mm proud of the glass
    {
      const mountM = K.mat(0xd8d2c2, { side: THREE.DoubleSide });
      const collar = K.lathe([[71, -6], [74, -6], [74, 22], [71, 22], [71, -6]], mountM, 64); collar.position.set(GX, GY, 0); inner.add(collar);
      const t0 = (ZT - 22) / LT, t1 = 0.5, ln = [];
      for (const ic of [12, 36, 60, 84]) {   // 45, 135, 225, 315 degrees
        const at = (a, b, o) => new THREE.Vector3(...tubeAt(t0 + (t1 - t0) * a, ic - 1.8 + 3.6 * b, o));
        const pos = [], quad = (p, q, r, s) => pos.push(...p.toArray(), ...q.toArray(), ...r.toArray(), ...p.toArray(), ...r.toArray(), ...s.toArray());
        const N = 6;
        for (let k = 0; k < N; k++) for (let j = 0; j < 2; j++) for (const o of [-2.4, -0.2]) quad(at(k / N, j / 2, o), at((k + 1) / N, j / 2, o), at((k + 1) / N, (j + 1) / 2, o), at(k / N, (j + 1) / 2, o));
        for (let k = 0; k < N; k++) for (const b of [0, 1]) quad(at(k / N, b, -2.4), at((k + 1) / N, b, -2.4), at((k + 1) / N, b, -0.2), at(k / N, b, -0.2));   // long sides
        for (const a of [0, 1]) quad(at(a, 0, -2.4), at(a, 1, -2.4), at(a, 1, -0.2), at(a, 0, -0.2));                                                 // ends
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
        inner.add(new THREE.Mesh(geo, mountM));
        const rimPts = [...Array.from({ length: N + 1 }, (_, k) => at(k / N, 0, -2.4)), ...Array.from({ length: N + 1 }, (_, k) => at(1 - k / N, 1, -2.4))];
        inner.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(rimPts), K.lineMat));
      }
      inner.add(K.edges(K.box(64, 4, 10, GX, GY + 79, 9, mountM)));                                               // bridge
      for (const s of [-1, 1]) inner.add(K.edges(K.box(6, 9, 8, GX + s * 26, GY + 73.5, 9, mountM)));             //   its two uprights
      for (const a of [70, 110].map(d => d * Math.PI / 180)) {   // wing screws T1 on the collar's side, near the top
        const c = Math.cos(a), s = Math.sin(a), shaft = K.edges(K.box(5, 2.6, 2.6, GX + 76.5 * c, GY + 76.5 * s, 15, steel)), wing = K.edges(K.box(1.4, 3.2, 9, GX + 79.5 * c, GY + 79.5 * s, 15, steel));
        shaft.rotation.z = wing.rotation.z = a; inner.add(shaft, wing);
      }
      inner.add(K.edges(K.box(8, 5, 6, GX - 27, GY, -55, steel)), K.cylX(GY, -55, GX - 37, GX - 31, 1.8, { side: steel, front: steel, segs: 10, rim: 'front' }));   // clamp screw
    }
    // high-voltage section, as on radiomuseum's KV-1310E chassis photos (from above and from the left): the flyback in a
    // clear plastic housing on a bracket at the top of the left side, the HV rectifier standing up through its lid, and a
    // silver sheet-metal shield (stamped 1-439-099-16, a tag strip on it) behind, over the main board. The housing is
    // drawn see-through and kept out of the ink pass, its edges outlined, so the winding inside shows as on the photos
    inner.add(K.edges(K.box(4, 60, 56, -188, 98, 40, galv)));                                          // bracket
    inner.add(K.edges(K.box(10, 38, 32, -172, 100, 39, ferrite)));                                     // U core
    inner.add(K.slab(K.rr(-158, 100, 24, 24, 5), 28, 50, { side: copper, front: yellow, back: yellow, bevel: 1.5, rim: 'both' }));   // winding
    inner.add(K.cylY(-160, 40, 112, 132, 4.5, { side: neckM, front: white, segs: 20, rim: 'front' }));                               // HV rectifier
    {
      const geo = new THREE.BoxGeometry(38, 46, 42), clearM = K.mat(0xeee4c8, { transparent: true, opacity: 0.32, depthWrite: false });
      const hv = new THREE.Mesh(geo, clearM); hv.position.set(-163, 103, 39); hv.userData.noInk = true; inner.add(hv);   // x -182..-144, y 80..126, z 18..60
      const ed = new THREE.LineSegments(new THREE.EdgesGeometry(geo), K.lineMat); ed.position.copy(hv.position); inner.add(ed);
    }
    inner.add(K.edges(K.box(34, 52, 64, -163, 110, -18, silver)));                                     // shield, x -180..-146, y 84..136, z -50..14
    decal(canvasMat(256, 128, (x, w, h) => {
      x.fillStyle = '#c9ccce'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3c3e'; x.font = 'bold 30px Arial'; x.textAlign = 'center';
      x.fillText('1-439-099-16', w / 2, 56); x.font = 'bold 24px Arial'; x.fillText('PAGx', w / 2, 96);
      x.fillStyle = '#b5b8ba'; x.fillRect(20, 6, 6, h - 12); x.fillRect(w - 26, 6, 6, h - 12);   // pressed ribs
    }), 40, 20, -180.05, 118, -18, -Math.PI / 2, inner);
    inner.add(K.edges(K.box(1.2, 10, 28, -180.6, 94, -18, K.mat(0xb8642c))));                         // tag strip
    for (let i = 0; i < 6; i++) inner.add(K.cylX(94, -29.5 + i * 4.6, -181.6, -181.2, 1, { side: steel, front: steel, segs: 8 }));
    // speaker behind the grille (3 1/8 x 4 3/4 in oval), VHF tuner behind the dial, pots behind the knobs
    const spk = new THREE.Group(); spk.position.set(rcx, gcy, ZF - 15); spk.scale.set(79 / 121, 1, 1); inner.add(spk);
    const cone = K.lathe([[60.5, 0], [56, -3], [22, -20], [14, -22], [14, -24]], K.mat(0x8a7f70), 40);
    spk.add(cone, new THREE.Mesh(flip(cone.geometry), cone.material));
    spk.add(K.slab(ring(K.circle(0, 0, 60.5), K.circle(0, 0, 54)), -3, 0, { side: steel, front: steel, back: steel, rim: 'back' }));
    inner.add(K.cylZ(rcx, gcy, ZF - 58, ZF - 40, 20, { side: ferrite, back: steel, segs: 32, rim: 'back' }));
    for (const s of [-1, 1]) inner.add(K.edges(K.box(3, 6, 26, rcx + s * 18, gcy, ZF - 30, steel)));
    // VHF turret tuner behind the channel dial: a drum between two frame plates, its rotary contact wafer (brown phenolic,
    // red contacts) at the back end. The KV-1210U's BT-602 is drawn with a sheet-steel case (service manual exploded view),
    // so the drum is steel here; the later KV-1310E's tuner is wrapped in yellow paper (radiomuseum chassis photo)
    {
      const paperM = K.mat(0xb3b8bc), wafer = K.mat(0x7a3b22);
      inner.add(K.cylZ(dx, dy, ZF - 20, ZF - 14.2, 3, { side: steel, segs: 12 }));                     // shaft from the dial
      inner.add(K.cylZ(dx, dy, ZF - 85, ZF - 23, 28, { side: paperM, front: steel, back: steel, segs: 40, rim: 'both' }));
      for (const z of [ZF - 22, ZF - 86]) inner.add(K.edges(K.box(62, 62, 2, dx, dy, z, galv)));        // frame plates
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) inner.add(K.cylZ(dx + sx * 28.5, dy + sy * 28.5, ZF - 85, ZF - 23, 1.4, { side: galv, segs: 8 }));
      inner.add(K.cylZ(dx, dy, ZF - 94, ZF - 87, 27, { side: wafer, back: wafer, front: wafer, segs: 40, rim: 'back' }));
      for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, c = K.box(2.6, 6, 0.8, dx + 21 * Math.cos(a), dy + 21 * Math.sin(a), ZF - 94.4, redM); c.rotation.z = a + Math.PI / 2; inner.add(c); }
    }
    inner.add(K.edges(K.box(30, 18, 40, dx - 8, dy + 14, ZF - 122, galv)));   // fine-tuning drive
    for (const xx of [45, 79, 113, 147]) { const [x, y] = P(xx, 301); inner.add(K.cylZ(x, y, ZF - 26, ZF - 14, 8.5, { side: steel, back: brown, segs: 24, rim: 'back' })); }
    inner.add(K.cylZ(...P(379, 303), ZF - 30, ZF - 14, 9, { side: steel, back: brown, segs: 24, rim: 'back' }));
    inner.add(sbox(150, 26, 2, -129.5, -136.5, ZF - 15, galv));
    // chassis: base plate, main board on the left, signal board under the neck, power transformer
    inner.add(sbox(370, 1.5, 300, 11, -151.6, 0, galv));   // within the back housing's width (x -178..200), which it runs into
    // main board, hinged on the left (component side towards the tube). It used to run to z 125, where the funnel's glass
    // (x -176 at z 100) passes through it; it now ends at z 88, 1.2 mm clear. Its outer face is the solder side: copper
    // pattern, tinned pads and the insulated jumpers of the KV-1310E side photo (rmf_chassis_side.jpg), below
    const solderM = canvasMat(512, 512, x => {
      x.fillStyle = '#6b6440'; x.fillRect(0, 0, 512, 512);
      let s = 5; const r = () => (s = s * 16807 % 2147483647) / 2147483647, tile = f => { for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { x.save(); x.translate(ox, oy); f(); x.restore(); } };
      x.strokeStyle = '#b98a4e'; x.lineCap = 'round'; x.lineJoin = 'round';
      for (let i = 0; i < 70; i++) {   // traces: short runs of straight legs, drawn wrapped so the tile repeats seamlessly
        const w = 3 + r() * 5, pts = [[r() * 512, r() * 512]];
        for (let k = 0; k < 3; k++) { const [px, py] = pts[pts.length - 1]; pts.push(r() < 0.5 ? [px + (r() - 0.5) * 200, py] : [px, py + (r() - 0.5) * 200]); }
        tile(() => { x.lineWidth = w; x.beginPath(); pts.forEach(([px, py], k) => k ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke(); });
      }
      x.fillStyle = '#d9cfb4';
      for (let i = 0; i < 260; i++) { const px = r() * 512, py = r() * 512, rr = 3 + r() * 3; tile(() => { x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill(); }); }
    }, [1 / 64, 1 / 64]);
    const lb = K.slab(K.rr(-3.5, -20, 183, 200, 3), 172, 174, { side: boardEdge, front: solderM, back: boardM, rim: 'both' }); lb.rotation.y = -Math.PI / 2; inner.add(lb);
    const bb = K.slab(K.rr(-55, 0, 240, 200, 3), -147.5, -146, { side: boardEdge, front: boardM, back: boardM, rim: 'both' }); bb.rotation.x = -Math.PI / 2; inner.add(bb);
    let seed = 11; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    // ---- board population: a 9 mm grid filled the way the KV-1310E's boards are (radiomuseum photos): rows of carbon
    // resistors lying flat, ceramic discs on edge, blue and black electrolytics, metal-can transistors, IF cans, trimmers
    // and film capacitors, each kind merged into one mesh. Kinds and density follow the photos; the placement is generic
    // (the manual pages kept have no layout of the 1968 boards). maxH(a, b) caps a part's height where glass is near ----
    const partM = {
      res: K.mat(0xc9a77a), resDk: K.mat(0x8f5a36), disc: K.mat(0xc8642c), discY: K.mat(0xd9a24a), elB: K.mat(0x2e6db4), elK: K.mat(0x2b2a2a),
      alu: K.mat(0xc9ccce), can: K.mat(0xb9bdc1), trim: K.mat(0xece6d4), filmY: K.mat(0xe2b93b), filmR: K.mat(0xb8402e),
    };
    const populate = (m4, u0, u1, v0, v1, keepOut, maxH, sd) => {   // board frame: a, b in its plane, h along its normal; m4 maps (a, b, h) to the chassis
      const R = () => (sd = sd * 16807 % 2147483647) / 2147483647, C = 9, nu = Math.floor((u1 - u0) / C), nv = Math.floor((v1 - v0) / C);
      const used = new Set(), geos = new Map(), lines = [];
      const put = (geo, m) => { const g2 = geo.toNonIndexed().applyMatrix4(m4); (geos.get(m) || geos.set(m, []).get(m)).push(g2); };
      const seg = (p, q) => lines.push(new THREE.Vector3(...p).applyMatrix4(m4), new THREE.Vector3(...q).applyMatrix4(m4));
      const circ = (a, b, r, h) => { for (let k = 0; k < 12; k++) { const t0 = k * Math.PI / 6, t1 = t0 + Math.PI / 6; seg([a + r * Math.cos(t0), b + r * Math.sin(t0), h], [a + r * Math.cos(t1), b + r * Math.sin(t1), h]); } };
      const stand = (a, b, r, h, m, top) => { const g = new THREE.CylinderGeometry(r, r, h, 12); g.rotateX(Math.PI / 2); g.translate(a, b, h / 2 + 0.3); put(g, m); if (top) { const t = new THREE.CircleGeometry(r * 0.85, 12); t.translate(a, b, h + 0.32); put(t, top); } circ(a, b, r, h + 0.3); };
      const lie = (a, b, r, l, alongU, m) => { const g = new THREE.CylinderGeometry(r, r, l, 8); if (alongU) g.rotateZ(Math.PI / 2); g.translate(a, b, r + 0.8); put(g, m); };
      const disc = (a, b, r, alongU, m) => { const g = new THREE.CylinderGeometry(r, r, 1.8, 12); g.rotateZ(Math.PI / 2); if (!alongU) g.rotateZ(Math.PI / 2); g.translate(a, b, r + 1.4); put(g, m); };   // on edge, its face across the row
      const box = (a, b, w, d, h, m) => { const g = new THREE.BoxGeometry(w, d, h); g.translate(a, b, h / 2 + 0.3); const e = new THREE.EdgesGeometry(g).attributes.position; for (let k = 0; k < e.count; k += 2) seg([e.getX(k), e.getY(k), e.getZ(k)], [e.getX(k + 1), e.getY(k + 1), e.getZ(k + 1)]); put(g, m); };
      const ctr = (i, j) => [u0 + (i + 0.5) * C, v0 + (j + 0.5) * C];
      const free = (i, j) => i < nu && j < nv && !used.has(i * 1000 + j) && !keepOut(...ctr(i, j));
      for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
        if (!free(i, j)) continue;
        const [a, b] = ctr(i, j), k = R(), big = free(i + 1, j) && free(i, j + 1) && free(i + 1, j + 1);
        const lim = maxH(a, b), lim2 = big ? Math.min(lim, maxH(a + C, b), maxH(a, b + C), maxH(a + C, b + C)) : 0;
        const take = () => { for (const [di, dj] of [[0, 0], [1, 0], [0, 1], [1, 1]]) used.add((i + di) * 1000 + j + dj); };
        const au = ((i >> 2) + (j >> 3)) % 2 === 0;   // resistor rows run one way per 4 x 8 block
        if (k < 0.06 && lim2 >= 17) { take(); box(a + C / 2, b + C / 2, 12, 12, 15, partM.can); box(a + C / 2, b + C / 2, 3.4, 3.4, 15.8, partM.trim); }    // IF can and its slug
        else if (k < 0.1 && lim2 >= 18) { take(); stand(a + C / 2, b + C / 2, 6.2, 17, R() < 0.5 ? partM.elB : partM.elK, partM.alu); }                // large electrolytic
        else if (lim < 3) continue;
        else if (k < 0.42 || lim < 9) for (const o of [-2.2, 2.2]) lie(a + (au ? 0 : o), b + (au ? o : 0), 1.25, 6.5, au, R() < 0.8 ? partM.res : partM.resDk);   // a pair of resistors
        else if (k < 0.55) disc(a, b, 3 + R(), au, R() < 0.6 ? partM.disc : partM.discY);
        else if (k < 0.67) stand(a, b, 2.6 + R() * 1.6, Math.min(lim - 1, 6 + R() * 6), R() < 0.6 ? partM.elB : partM.elK, partM.alu);              // small electrolytic
        else if (k < 0.77) stand(a, b, 2.5, 4.6, partM.can, partM.can);                                                                               // metal-can transistor
        else if (k < 0.82) box(a, b, 7.5, 7.5, 3.5, partM.trim);                                                                                      // trimmer
        else if (k < 0.89) box(a, b, ...(R() < 0.5 ? [8, 4] : [4, 8]), 6, R() < 0.5 ? partM.filmY : partM.filmR);                                  // film capacitor
      }
      for (const [m, list] of geos) {
        const pos = [], nor = [];
        for (const g2 of list) { pos.push(...g2.attributes.position.array); nor.push(...g2.attributes.normal.array); }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
        inner.add(new THREE.Mesh(geo, m));
      }
      inner.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines), K.lineMat));
    };
    // the funnel's outer surface nearest the main board: its leftmost x at height y in the cross-section at z
    const glassLeftX = (y, z) => {
      const t = (ZT - z) / LT; if (t < 0 || t > 1) return Infinity;
      let best = Infinity;
      for (let i = 0; i < NS; i++) { const [x0, y0] = tubeAt(t, i), [x1, y1] = tubeAt(t, i + 1); if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) best = Math.min(best, x0 + (x1 - x0) * (y - y0) / (y1 - y0)); }
      return best;
    };
    const near = (a, b, ca, cb, r) => Math.abs(a - ca) < r && Math.abs(b - cb) < r;
    populate(new THREE.Matrix4().set(0, 0, 1, -172, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1), -116, 76, -91, 84,   // main board: a = y, b = z, h = x + 172
      (a, b) => (a > 12 && a < 68 && b > -84 && b < -36) || near(a, b, 40, -34, 10) || near(a, b, -60, -82, 10),   // heat sink; where the yoke and neck leads land
      (a, b) => Math.min(...[[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]].map(([da, db]) => glassLeftX(a + da, b + db))) + 172 - 1.5, 101);
    // regulator heat sink: bare aluminium fins (KV-1200U/1210U service manual, Fig. 2-4, rear view with the cover off)
    const alu = K.mat(0xd9dcde);
    inner.add(K.edges(K.box(4, 44, 36, -169, 40, -60, alu)));
    for (let i = 0; i < 6; i++) inner.add(K.box(10, 44, 1.2, -164, 40, -76 + i * 6.4, alu));      // heat sink fins
    populate(new THREE.Matrix4().set(0, 1, 0, 0, 0, 0, 1, -146, 1, 0, 0, 0, 0, 0, 0, 1), -96, 96, -171, 61, () => false, () => Infinity, 202);   // signal board: a = z, b = x, h = y + 146
    inner.add(K.box(70, 56, 62, 125, -122.8, -105, ferrite));            // power transformer: core (no edge lines: they'd show through the 1.5 mm base plate from below)
    inner.add(K.edges(K.box(46, 44, 76, 125, -120, -105, copper)));      //   windings
    // H. / V. hold controls (KV-1210U manual 2-5, fig. 2-11: two pots on a bracket, screws H1-H2) under the hold knobs on
    // the housing top (x 90 and 128, z -112). The knobs pull off before the cover comes off, so pots and bracket belong
    // to the chassis: here on a rail along its top right (fig. 2-28: the chassis is screwed to the front panel along its
    // top, S1-S4). It runs inboard of the speaker (whose rim starts at x 120 here) to a tab on the front panel
    inner.add(sbox(20, 1.5, 286, 110, 118.75, 3, galv), sbox(1.5, 15, 286, 100.75, 111.25, 3, galv));   // L-section rail, z -140 .. 146
    inner.add(K.edges(K.box(20, 15.75, 7, 110, 111.1, 149.5, galv)));                                      // front tab to the panel
    inner.add(K.edges(K.box(60, 1.5, 26, 110, 104.75, -112, galv)));                                       // pot bracket under the rail
    for (const x of [90, 128]) {
      inner.add(K.cylY(x, -112, 94, 104, 8, { side: steel, front: steel, back: brown, segs: 24, rim: 'back' }));   // pot
      inner.add(K.cylY(x, -112, 105.5, 108, 4, { side: steel, segs: 16, rim: 'front' }));                           // bushing and nut
      inner.add(K.cylY(x, -112, 108, 120, 2, { side: steel, segs: 12, rim: 'front' }));                              // shaft, up to the knob
      for (const o of [-3.5, 0, 3.5]) inner.add(K.box(1.4, 5, 0.6, x + o, 92, -103.7, steel));                     // solder lugs
    }
    // ---- wiring: tied bundles, as the KV-1310E chassis photos and the KV-1210U manual's figures show it everywhere. A
    // bundle's wires are offset round its path in the path's own frames, and a nylon tie closes it every 45 mm. The wires
    // and ties are kept out of the ink pass (outlined, a bundle turns into a black rope and its ties into beads). Routes keep
    // clear of the tube (below its bottom edge along the front, outside the main board's solder side), of the boards'
    // parts and of each other ----
    const wireM = [0xd43a2f, 0xf2f0ea, 0x2e6db4, 0x2a2a2a, 0xf0c419, 0x2f9e44, 0x8a8f94, 0xe07a26, 0x7b4fa0, 0x8a5a36].map(c => K.mat(c)), tieM = K.mat(0xf3f1ea);
    const bundle = (pts, n, r = 0.75, c0 = 0) => {
      const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), L = curve.getLength(), N = Math.max(8, Math.ceil(L / 5)), fr = curve.computeFrenetFrames(N, false);
      const offs = [[0, 0]];
      for (const [ring, cnt] of [[1, 6], [2, 12]]) for (let k = 0; k < cnt && offs.length < n; k++) { const a = k / cnt * 2 * Math.PI + ring * 0.3; offs.push([2.05 * r * ring * Math.cos(a), 2.05 * r * ring * Math.sin(a)]); }
      offs.forEach(([u, v], w) => {
        const Q = Array.from({ length: N + 1 }, (_, i) => curve.getPointAt(i / N).addScaledVector(fr.normals[i], u).addScaledVector(fr.binormals[i], v));
        const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Q), N * 2, r, 6, false), wireM[(c0 + w) % wireM.length]);
        m.userData.noInk = true; inner.add(m);
      });
      const R = (n > 7 ? 4.1 : n > 1 ? 2.05 : 0) * r + r + 0.35;
      for (let s = 25; s < L - 12; s += 45) {
        const u = s / L, tie = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 2.4, 14), tieM);
        tie.position.copy(curve.getPointAt(u)); tie.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(u)); tie.userData.noInk = true; inner.add(tie);
      }
    };
    // main harness along the bottom front, below the tube, from the tuner side to the left, then up the main board's solder
    // side, where its wires fan out to the board (the side photo); branches to the four front controls and to PULL ON / VOL
    bundle([[140, -124, 112], [100, -126, 112], [0, -126, 110], [-100, -126, 110], [-160, -126, 112], [-181, -112, 100], [-180, -95, 84], [-179, -20, 80], [-178.5, 50, 78]], 10);
    for (const [xx, c0] of [[45, 2], [79, 4], [113, 6], [147, 1]]) { const [x] = P(xx, 0); bundle([[x + 4, -126, 112], [x + 2, -131, 126], [x, -135, 137]], 3, 0.6, c0); }
    bundle([[142, -125, 113], [148, -131, 124], [153.5, -136, 133]], 4, 0.6, 3);
    bundle([[128, 15, 116], [112, -40, 115], [110, -100, 114], [118, -122, 113]], 2, 0.7, 1);                                  // speaker leads, left of the tuner
    inner.add(K.tube([[dx - 20, dy - 28, 90], [100, -117, 100], [0, -117, 104], [-100, -117, 104], [-165, -117, 100], [-183, -104, 70]], 2.4, dark, { segs: 60, radial: 8 }));   // tuner coax
    bundle([[125, -118, -72], [150, -128, -20], [152, -129, 60], [151, -131, 100], [152, -134, 130]], 3, 0.8, 3);              // AC: power transformer to the PULL ON switch
    bundle([[88, -112, -105], [40, -136, -112], [-100, -136, -114], [-165, -128, -105], [-181, -100, -85], [-178.5, -70, -72]], 4, 0.8, 5);   // transformer to the main board
    bundle([[GX - 30, GY - 20, -156], [-120, -40, -140], [-160, -60, -100], [-169, -60, -82]], 6, 0.7, 2);                    // neck board to the main board
    bundle([[GX + 18, GY + 20, -52], [GX - 20, GY + 45, -60], [-140, 52, -48], [-169, 40, -34]], 5, 0.75, 0);                 // yoke leads, landing just ahead of the heat sink
    bundle([[-182, 90, -22], [-184, 82, -30], [-180, 66, -42], [-177.5, 52, -48]], 6, 0.6, 4);                                 // HV tag strip to the board
    bundle([[109, 90, -112], [0, 98, -126], [-120, 92, -110], [-165, 88, -80], [-177, 84, -70], [-178, 70, -62]], 3, 0.6, 6);   // hold controls, over the board's top edge to its solder side
    for (let i = 0; i < 28; i++) {   // jumpers on the solder side, fanning out from the harness to the board
      const yl = -85 + rnd() * 130, ye = -112 + rnd() * 185, ze = -88 + rnd() * 165, zl = 74;
      const w = K.tube([[-176.2, yl, zl], [-178.2 - rnd() * 1.6, (yl + ye) / 2 + (rnd() - 0.5) * 24, (zl + ze) / 2], [-175, ye, ze]], 0.65, wireM[i % wireM.length], { segs: 24, radial: 5 });
      w.userData.noInk = true; inner.add(w);
    }
    // the three beams, from the gun to one point on the grille (shown once the tube is cut open)
    const beamGeo = new THREE.CylinderGeometry(1.4, 1.4, 1, 8, 1); beamGeo.rotateX(Math.PI / 2); beamGeo.translate(0, 0, 0.5);
    const target = new THREE.Vector3(GX + 72, GY + 52, ZF - 27), beamG = new THREE.Group(); beamG.userData.noInk = true; inner.add(beamG);   // light, not parts: no outline
    const beams = [[-3.2, 0xff4136], [0, 0x2ecc40], [3.2, 0x2f7cf6]].map(([ddx, col], i) => {
      const m = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: col })), from = new THREE.Vector3(GX + ddx, GY, -61.5), to = target.clone().add(new THREE.Vector3((i - 1) * 1.4, 0, 0));
      m.position.copy(from); m.lookAt(to); m.userData.len = from.distanceTo(to); beamG.add(m); return m;
    });

    g.userData.setExplode = t => {
      const a = sm(t / 0.45), b = sm((t - 0.3) / 0.4), c = sm((t - 0.62) / 0.38), gb = sm((c - 0.5) / 0.5);
      sleeve.position.z = 380 * a;     // the case slides off the front
      rear.position.z = -130 * b;      // back cover off
      inner.visible = t > 0.001;
      wipe.forEach((m, i) => { m.visible = c <= i * 0.55 / wipe.length; });
      beams.forEach(m => { m.visible = gb > 0.001; m.scale.set(1, 1, Math.max(1e-3, m.userData.len * gb)); });
    };
    g.userData.setExplode(0);
    return g;
  },
};
