// Sony TR-55 (1955), Japan's first transistor radio, made by Tokyo Tsushin Kogyo. Face art: tex/tr-55.png.
// Size 140 x 89 x 38 mm (radiomuseum.org, Wikipedia; Smithsonian NMAH 706158 gives 44.5 mm deep, over the knob).
// From reference image/real-product/tr-55/ (Sony's photo, radiomuseum.org front / 3/4 / back / inside photos):
//   green case; TRANSISTORIZED in raised letters on the top band; a thin green rim round the perforated aluminium
//   grille that fills the rest of the front; dial window with a clear bulged cover (kc scale, Sony pointer shield);
//   dark green tuning knob lettered TOKYO TSUSHIN KOGYO LTD; volume / OFF thumbwheel in a slot low on the right side;
//   two grooves along the top of each side; feet under the bottom; latch tab on top at the back
//   back: snap-on cover with 3 x 8 round holes, a hexagonal flip cap on its screw, the antenna / earphone socket plate seen
//   through a shield-shaped opening, TOKYO TSUSHIN KOGYO, LTD. / SONY-RADIO (small) MODEL TR55 / MADE IN JAPAN moulded in
// The photo puts the band ~6 mm deeper and the dial and knob ~4 mm lower than the sticker draws them, so the parts sit
// where the photo has them and each carries its own piece of the art (band, grille, dial, knob).
// Inside (radiomuseum.org chassis photos, the circuit label inside the back): four AA (UM-3) cells along the bottom,
// two end to end in two rows, on a pull ribbon; 2.5" speaker behind the left of the grille; tuning gang behind the
// dial; dark phenolic board with four IF cans, the output transformer with its SERIAL NO. label and yellow paper
// capacitors over the speaker's magnet, five transistors; a steel rail over the cells; the socket plate on the chassis. setExplode(t): the back cover folds down on its bottom
// edge, showing the circuit label inside it, then the cells come out on their ribbon.
export default {
  id: 'tr-55', name: 'Sony TR-55', textures: ['tex/tr-55'], ink: 1.5,
  openLabel: 'Open up', insideView: [-150, 28, 1.25],    // viewer: [camera azimuth (+ = the product's right), elevation, distance x fit]
  build(THREE, K) {
    const g = new THREE.Group(), W = 140, H = 89, X1 = W / 2, Y1 = H / 2, ZF = 19, ZB = -19;
    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    const green = K.mat(0x74a985), greenDk = K.mat(0x5d8f6e), greenLt = K.mat(0x9ac9a9), grilleM = K.mat(0xb4afa6), dark = K.mat(0x2b2724);
    const chrome = K.mat(0xd9dadb), steel = K.mat(0xb7bbbf), peach = K.mat(0xc98a55), brass = K.mat(0xd6a740), cloth = K.mat(0xe2d6b8);
    const plateM = K.mat(0xa38878), maroon = K.mat(0x4a1c24), brassDull = K.mat(0xc4a070);   // back photo: grey-brown socket plate, maroon sockets
    const canvasMat = (w, h, draw) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      return K.mat(0xffffff, { map: t });
    };
    const decal = (m, w, h, x, y, z, ry = 0, parent = g) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; parent.add(p); return p; };
    const ringOf = (outer, hole) => { const hp = new THREE.Path(); hole.getPoints(16).forEach((q, i) => i ? hp.lineTo(q.x, q.y) : hp.moveTo(q.x, q.y)); outer.holes.push(hp); return outer; };
    const outline = (inset = 0) => K.rr(0, 0, W - 2 * inset, H - 2 * inset, Math.max(0.5, 6 - inset));

    // ================= case =================
    // solid front cap (rounded front edge, speaker cloth on its inside), straight walls, rounded back rim round the cover
    // (bevel 1.7 leaves a 0.4 mm straight band: asked for 2.2, K.slab clamps it to 0.002 mm short of half the 3.8 mm, and
    // that band's sliver triangles rasterise with wild depths, which the ink pass drew as a dotted line down each side)
    g.add(K.slab(outline(), ZF - 5, ZF - 1.2, { side: green, front: green, back: cloth, bevel: 1.7 }));
    // walls 0.05 mm inside the cap's and the rim's outline: where their end faces touched those surfaces they z-fought as dashes
    g.add(K.slab(ringOf(outline(0.05), outline(2.5)), ZB + 3, ZF - 3, { side: green, front: green, back: green }));
    // (the bevel rounds the hole's edge too, so it stays under half the 2.5 mm wall: a wider one turns the back face inside out)
    g.add(K.slab(ringOf(outline(), outline(2.5)), ZB, ZB + 6, { side: green, front: green, back: green, bevel: 1.2 }));
    // top band with the raised TRANSISTORIZED letters (sticker band, stretched to the photo's 14 mm); its top corners follow
    // the drawn band's rounded ends (6 mm), a tighter corner shows the sticker's white paper outside the drawn outline
    const MB = K.mapping([100, 122, 1305, 206], [-68.5, 42, 68.5, 28]);
    g.add(K.slab(K.rr(0, 35, 137, 14, [6, 6, 0.5, 0.5]), ZF - 2.4, ZF - 0.9, { front: K.art, side: green, M: MB, rim: 'front' }));
    // green rim and the perforated grille inside it
    const gy = (26.2 - 42.6) / 2;
    g.add(K.slab(ringOf(K.rr(0, (27.6 - 44) / 2, 138.6, 71.6, [2, 2, 5, 5]), K.rr(0, gy, 134, 68.8, [1.5, 1.5, 4, 4])), ZF - 2.4, ZF, { side: green, front: greenLt, bevel: 0.5, rim: 'front' }));
    // one mapping for grille, dial and knob: the sticker's dial-to-knob spacing matches the photo at its 0.1133 mm/px,
    // so the knob is pinned to the photo's place; the grille runs 5 mm further left than drawn, hence the wider x scale
    const MG = K.mapping([125, 228, 1285, 845], [-67, 26.47, 70.55, -43.44]);
    g.add(K.slab(K.rr(0, gy, 134.2, 69, [1.5, 1.5, 4, 4]), ZF - 2.2, ZF - 1, { front: K.art, side: grilleM, M: MG }));
    // dial window: chrome bezel, dial under a bulged clear cover (the dome carries the dial art)
    const [wx, wy] = [44.8, 9.7], MW = MG;
    g.add(K.slab(ringOf(K.rr(wx, wy, 38.6, 26.9, 3.5), K.rr(wx, wy, 35.6, 23.9, 2.5)), ZF - 1.2, ZF + 0.6, { side: chrome, front: chrome, bevel: 0.3, rim: 'front' }));
    g.add(K.dome(K.rr(wx, wy, 35.8, 24.1, 2.6), ZF - 0.4, 1.6, MW));
    // tuning knob
    const [kx, ky, kr] = [44.7, -23.5, 15.6], MK = K.mapping([1067 - 143, 669 - 143, 1067 + 143, 669 + 143], [kx - kr, ky + kr, kx + kr, ky - kr]);
    g.add(K.cylZ(kx, ky, ZF - 1.2, ZF + 5, kr, { front: K.art, side: greenDk, bevel: 1.2, M: MK, segs: 64, rim: 'front' }));
    // right side: volume / OFF thumbwheel in its slot (radiomuseum 3/4 photo: slot 9.6 x 20.5 mm, 7 mm behind the front edge,
    // 2 mm above the bottom; OFF on a pad just above it; a green ribbed wheel ~20 mm across bulges ~1 mm out of the slot,
    // with the copper face of the wheel showing through the slot above and below it)
    const [vz, vy] = [ZF - 11.9, -32];
    decal(canvasMat(64, 136, (x, w, h) => {
      x.fillStyle = '#211c19'; x.fillRect(0, 0, w, h); x.fillStyle = '#c98a55';
      x.fillRect(5, h * 0.06, w - 10, h * 0.16); x.fillRect(5, h * 0.72, w - 10, h * 0.14);
    }), 9.6, 20.5, X1 + 0.06, -32.25, vz, Math.PI / 2);
    decal(canvasMat(96, 38, (x, w, h) => { x.fillStyle = '#7cb08c'; x.fillRect(0, 0, w, h); x.fillStyle = '#2f4a3a'; x.font = 'bold 26px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('OFF', w / 2, h / 2 + 1); }), 9.6, 3.8, X1 + 0.06, -19.5, vz, Math.PI / 2);
    g.add(K.slab(K.gear(X1 + 1.2 - 9.8, vy, 9.4, 9.8, 36), vz - 3.5, vz + 3.5, { side: greenDk, front: peach, back: peach, segs: 72 }));
    // the channel along the top of both sides (two lines: the photo's step ~18 and ~28 mm below the top), feet, latch tab
    for (const s of [-1, 1]) for (const y of [26, 16.5]) g.add(K.box(0.3, 0.8, 27, s * (X1 + 0.05), y, -3.5, greenDk));
    for (const s of [-1, 1]) g.add(K.edges(K.box(7, 1.8, 30, s * 45, -Y1 - 0.9, 0, greenDk)));   // ~7 mm wide seen from the front (Sony photo)
    g.add(K.edges(K.box(10, 1.6, 5, 0, Y1 + 0.5, ZB + 4.5, green)));

    // ================= back cover (folds down on its bottom edge) =================
    const coverP = new THREE.Group(), cover = new THREE.Group(); coverP.position.set(0, -Y1 + 2.6, ZB); cover.position.set(0, Y1 - 2.6, -ZB); coverP.add(cover); g.add(coverP);
    // the cover fills the rim's opening exactly (a 0.1 mm gap let the inside flicker through the seam as a dashed ink line)
    const rounded = (pts, r) => {   // polygon with rounded corners (r per corner)
      const s = new THREE.Shape(), n = pts.length, V = (p) => new THREE.Vector2(p[0], p[1]);
      for (let i = 0; i < n; i++) {
        const P = V(pts[i]), A = V(pts[(i + n - 1) % n]), B = V(pts[(i + 1) % n]), ri = Array.isArray(r) ? r[i] : r;
        const a = P.clone().add(A.clone().sub(P).setLength(ri)), b = P.clone().add(B.clone().sub(P).setLength(ri));
        i ? s.lineTo(a.x, a.y) : s.moveTo(a.x, a.y); s.quadraticCurveTo(P.x, P.y, b.x, b.y);
      }
      s.closePath(); return s;
    };
    // Measured on the radiomuseum back photo, mapped to mm through the 3 x 8 hole grid (affine fit, 0.26 mm rms; it puts the
    // back face's corners at +-70, +-42). The socket plate is not stuck on the cover: it sits behind a shield-shaped opening
    // in it, recessed by the cover's thickness (the photo shows the opening's wall in shadow down its left side)
    const opening = [[61.6, -17], [46.9, -17], [51.4, -36.6], [57.4, -36.6]];
    cover.add(K.slab(ringOf(K.rr(0, 0, W - 5, H - 5, 3.5), rounded(opening, 2.5)), ZB - 0.4, ZB + 1.6, { side: green, front: greenDk, back: green, bevel: 0.4, rim: 'back' }));
    // 3 x 8 holes ~4.2 mm across, 10.1 mm apart, rows at 22 / 12 / 2 mm above the middle
    for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) cover.add(K.cylZ(35.5 - i * 10.1, 22.2 - r * 10.1, ZB - 0.5, ZB - 0.3, 2.1, { back: dark, side: dark, segs: 16 }));
    // flip cap: an elongated hexagon 15.8 x 31 mm, widest just above the middle and only a little narrower at its round
    // lower end, which wraps the brass screw it pivots on (4.8 mm head)
    cover.add(K.slab(rounded([[50.7, 15.2], [57.5, 15.2], [62, 0.6], [59, -15.8], [50.4, -15.8], [46.2, 1]], [2, 2, 4, 3.5, 3.5, 4]), ZB - 1.4, ZB - 0.3, { side: green, back: green, front: green, bevel: 0.3, rim: 'back' }));
    cover.add(K.lathe([[0, -2.1 + ZB], [1.5, -2.05 + ZB], [2.2, -1.75 + ZB], [2.4, -1.3 + ZB]], brassDull, 24).translateX(54.9).translateY(-12.5));   // screw head on the cap's tip
    cover.add(K.cylZ(63.4, -13.6, ZB - 0.9, ZB - 0.3, 0.8, { back: green, side: green, segs: 10 }));                                          // locating pin
    // socket plate behind the opening (wider all round, so no face of it meets the opening's wall): antenna socket (dark
    // oval, two pin holes) over the earphone jack's boss. It belongs to the chassis, not the cover: the photo taken with the
    // back off still has it in the lower corner (seen from behind), so it stays when the cover folds down
    g.add(K.slab(rounded(opening.map(([x, y]) => [54.4 + (x - 54.4) * 1.2, -26.8 + (y + 26.8) * 1.16]), 3), ZB + 1.6, ZB + 2.4, { side: plateM, back: plateM, front: plateM }));
    g.add(K.slab(K.rr(54.6, -20.6, 8.6, 4.8, 2.3), ZB + 1.3, ZB + 1.65, { back: maroon, side: maroon, segs: 12 }));                       // antenna socket
    for (const x of [52.4, 56.8]) g.add(K.cylZ(x, -20.4, ZB + 1.25, ZB + 1.35, 0.7, { back: dark, side: dark, segs: 10 }));
    g.add(K.slab(ringOf(K.circle(54.8, -31, 3.4), K.circle(54.8, -31, 2)), ZB + 0.6, ZB + 1.65, { back: maroon, side: maroon, segs: 24 }));   // earphone jack
    g.add(K.cylZ(54.8, -31, ZB + 1.1, ZB + 1.2, 2.05, { back: dark, side: dark, segs: 20 }));
    // moulded lettering, each run fitted to its span on the photo (mm; x runs right to left as seen from behind): SONY-RADIO and
    // TR55 large, MODEL small between them on the same baseline, the maker's line above and MADE IN JAPAN below
    decal(canvasMat(1024, 224, x => {
      x.fillStyle = '#74a985'; x.fillRect(0, 0, 1024, 224);
      const run = (txt, x0, x1, yc, cap, style = 'italic bold') => {   // canvas: 16 px/mm, left edge x = +32, top edge y = -26.6
        x.font = `${style} ${Math.round(cap * 16 / 0.716)}px Arial`; const w0 = x.measureText(txt).width;
        x.save(); x.translate((32 - x0) * 16, (-26.6 - yc + cap / 2) * 16); x.scale((x0 - x1) * 16 / w0, 1);
        x.fillStyle = '#5c8d6c'; x.fillText(txt, 1.5, 1.5); x.fillStyle = '#93c3a0'; x.fillText(txt, 0, 0); x.restore();   // raised: lit top, shadow below
      };
      run('TOKYO TSUSHIN KOGYO, LTD.', 21.5, -21.6, -29.1, 1.6);
      run('SONY-RADIO', 29.6, -3.1, -34, 2.6); run('MODEL', -5.2, -14.6, -34.65, 1.3); run('TR55', -17.2, -29.6, -34, 2.6);
      run('MADE IN JAPAN', 13.3, -13.2, -37.8, 1.2, 'italic');
    }), 64, 14, 0, -33.6, ZB - 0.45, Math.PI, cover);
    // the circuit label glued inside the cover, redrawn from radiomuseum's photo of it (rm_tr55_back_label.png, 500 px wide,
    // the label 452 x 314 px of it). Drawn in the photo's pixel coordinates: every part, value and line of text sits where
    // the photo has it. The schematic is the TR-55's own, five transistors in a row (2T51 converter, two 2T52 IF stages,
    // 2T53 driver, 2T12 output), the 1T33 diodes, the dash-dot link from the volume control to the switch; wires the photo
    // cannot resolve are joined by the shortest run. Below it: the earphone and antenna plugs, a UM-3 cell going into the
    // tray with its pull ribbon, OFF / VOLUME CONTROL, the frequency range and battery type, the boxed Sony script and the
    // maker's name. Left out: the paper's tears and stains and a collector's marker note.
    decal(canvasMat(1600, 1056, (x, w, h) => {
      x.fillStyle = '#e7cf98'; x.fillRect(0, 0, w, h);
      x.setTransform(w / 452, 0, 0, h / 314, -6 * w / 452, -32 * h / 314);   // photo px: label x 6 .. 458, y 32 .. 346
      const ink = '#a5402a', paper = '#e7cf98';
      x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = 0.85; x.lineCap = 'round'; x.lineJoin = 'round';
      const L = (...p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); x.stroke(); };
      const dot = (px, py) => { x.beginPath(); x.arc(px, py, 1, 0, 7); x.fill(); };
      const clear = (px, py, rw, rh) => { x.fillStyle = paper; x.fillRect(px - rw, py - rh, 2 * rw, 2 * rh); x.fillStyle = ink; };
      const tx = (s, px, py, size = 5.6, width = 0, style = 'bold', fam = 'Arial') => {   // text from its left end at baseline py, squeezed to width
        x.font = `${style} ${size}px ${fam}`; x.save(); x.translate(px, py); if (width) x.scale(width / x.measureText(s).width, 1); x.fillText(s, 0, 0); x.restore();
      };
      const res = (px, py, len, horiz) => {   // zigzag over its wire
        horiz ? clear(px, py, len / 2, 2.2) : clear(px, py, 2.2, len / 2);
        x.beginPath(); for (let i = 0; i <= 8; i++) { const t = -len / 2 + len * i / 8, o = i % 8 ? (i % 2 ? 1.7 : -1.7) : 0; horiz ? x.lineTo(px + t, py + o) : x.lineTo(px + o, py + t); } x.stroke();
      };
      const cap = (px, py, horiz, el = false) => {   // two plates across the wire; electrolytic: one curved, with +
        horiz ? clear(px, py, 1.1, 2.6) : clear(px, py, 2.6, 1.1);
        if (horiz) { L(px - 1.2, py - 3, px - 1.2, py + 3); el ? (x.beginPath(), x.arc(px + 4, py, 3.3, 2.4, 3.9), x.stroke()) : L(px + 1.2, py - 3, px + 1.2, py + 3); if (el) tx('+', px - 5, py - 2.5, 4.5); }
        else { L(px - 3, py - 1.2, px + 3, py - 1.2); el ? (x.beginPath(), x.arc(px, py + 4, 3.3, -2.3, -0.8), x.stroke()) : L(px - 3, py + 1.2, px + 3, py + 1.2); if (el) tx('+', px + 2.5, py - 2.5, 4.5); }
      };
      const vcap = (px, py) => { cap(px, py, false); L(px - 4, py + 4, px + 4, py - 4); L(px + 4, py - 4, px + 2.2, py - 3.8); };   // tuning gang section
      const coil = (px, y0, y1, side = 1, horiz = false) => {   // loops along a wire, bulging to one side
        const n = Math.max(3, Math.round(Math.abs(y1 - y0) / 2.6)), st = (y1 - y0) / n;
        horiz ? clear((y0 + y1) / 2, px, Math.abs(y1 - y0) / 2, 1.8) : clear(px, (y0 + y1) / 2, 1.8, Math.abs(y1 - y0) / 2);
        x.beginPath(); for (let i = 0; i < n; i++) { const c = y0 + st * (i + 0.5); horiz ? x.arc(c, px, Math.abs(st) / 2, Math.PI, 0, side < 0) : x.arc(px, c, Math.abs(st) / 2, -Math.PI / 2, Math.PI / 2, side < 0); } x.stroke();
      };
      const tr = (px, py, r = 8.4) => {   // transistor: circle, base bar, collector up and emitter (arrow) down to the right
        x.fillStyle = paper; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); x.fillStyle = ink; x.stroke();
        L(px - r, py, px - 2.6, py); L(px - 2.6, py - 4.2, px - 2.6, py + 4.2); L(px - 2.6, py - 1.6, px + 3, py - r + 1.4, px + 3, py - r); L(px - 2.6, py + 1.6, px + 3, py + r - 1.4, px + 3, py + r);
        x.beginPath(); x.moveTo(px + 2.2, py + r - 2.2); x.lineTo(px - 0.2, py + r - 2.6); x.lineTo(px + 1.2, py + r - 4.4); x.fill();
      };
      const diode = (px, py, dir = -1) => { clear(px, py, 2.2, 2.4); x.beginPath(); x.moveTo(px - 2 * dir, py - 2.2); x.lineTo(px - 2 * dir, py + 2.2); x.lineTo(px + 1.8 * dir, py); x.fill(); L(px + 1.8 * dir, py - 2.2, px + 1.8 * dir, py + 2.2); };
      // ---- wiring: top rail, bottom rail, the emitter return, AGC line, neutralising line ----
      L(88, 52, 433, 52); L(20, 185, 446, 185); L(55, 174, 182, 174); L(94, 138, 236, 138); L(106, 43, 219, 43);
      L(22, 59, 36, 59); L(22, 59, 22, 185);                                                     // tuning gang to the bottom rail
      L(36, 42, 36, 80); L(34, 80, 34, 112); L(34, 86, 43.6, 86); L(20, 112, 55, 112);            // aerial coil, its base winding, 0.01 to the emitter
      L(55, 76.6, 55, 66, 66, 66, 66, 62, 79, 62, 79, 68, 88, 68); L(55, 93.4, 55, 104, 65, 104); L(65, 84, 75, 84, 75, 185); L(55, 104, 55, 174);
      L(88, 52, 88, 75, 97, 75, 97, 63, 88, 63);                                                  // IF 1 can
      L(89, 91, 89, 87, 109.6, 87); L(89, 101, 94, 101, 94, 138); L(94, 104, 124, 104); L(121, 95.4, 121, 104, 124, 104, 124, 174); L(121, 78.6, 121, 76, 140, 76, 140, 70, 144, 70);
      L(106, 43, 106, 87); L(144, 52, 144, 75, 153, 75, 153, 63, 144, 63);                        // IF 2 can
      L(124, 121, 143, 121, 143, 185);                                                            // AGC diode to the rail
      L(146, 92, 146, 89, 166.6, 89); L(146, 102, 151, 102, 151, 138); L(151, 106, 181, 106); L(178, 97.4, 178, 106, 181, 106, 181, 174); L(163, 43, 163, 89);
      L(189, 52, 189, 138); L(178, 80.6, 178, 78, 192, 78, 192, 72, 200, 72);
      L(200, 54, 200, 80, 209, 80, 209, 66, 200, 66);                                             // IF 3 can
      L(219, 43, 219, 90, 236, 90, 236, 116); L(200, 92, 200, 88, 219, 88); L(200, 104, 200, 128, 222, 128); L(222, 104, 222, 128); L(219, 104, 222, 104); L(236, 134, 236, 185);
      L(240, 125, 248, 125, 248, 116, 269.6, 116); L(266, 116, 266, 146, 295, 146, 295, 99, 281, 99, 281, 107.6); L(281, 124.4, 281, 161);
      L(263, 161, 323, 161); L(263, 161, 263, 185); L(274, 99, 274, 77);                          // driver: emitter line, coupling
      L(274, 77, 302, 77, 309, 77, 309, 52); L(309, 67, 340, 67, 340, 70);                        // driver transformer primary to the rail; 30u decoupling
      L(306, 71, 312, 71, 312, 96, 319.6, 96); L(331, 87.6, 331, 79, 357, 79, 357, 52);       // output stage
      L(331, 104.4, 331, 112, 323, 112, 323, 185);
      L(345, 122, 345, 117, 367, 117, 367, 71, 383, 71); L(383, 81, 383, 140, 375, 140, 375, 144); L(345, 136, 345, 144, 353, 144, 353, 185); L(353, 144, 373, 144);
      L(398, 144, 398, 150, 407, 150);
      L(407, 52, 407, 185); L(429, 52, 429, 185); L(407, 110, 429, 110); L(446, 52, 446, 185);   // supply filter, battery
      // ---- parts ----
      x.beginPath(); x.arc(36, 41, 1.3, 0, 7); x.stroke(); tx('A', 20, 44, 6);
      cap(36, 50, false); tx('5P', 41, 54); vcap(22, 68); coil(36, 59, 77); coil(34, 80, 92, -1);
      tr(52, 85); tx('2T-51', 40, 69, 5.6, 15); coil(66, 62, 76); coil(65, 84, 104, -1); vcap(75, 94);
      cap(40, 112, true); tx('0.01', 33, 123, 5.6, 12); res(55, 153, 10); tx('1K', 38, 157);
      coil(88, 63, 75); cap(97, 69, false); coil(89, 91, 101, -1);
      tr(118, 87); tx('60P', 112, 49, 5.6, 10); cap(131, 43, true); tx('200P', 113, 61, 5.6, 14); tx('2T-52', 112, 72, 5.6, 15);
      cap(104, 104, true); tx('0.05', 100, 116, 5.6, 12); res(124, 155, 10); tx('2.2K', 106, 160, 5.6, 12);
      diode(136, 121); tx('1T-33', 128, 115, 5.6, 15);
      coil(144, 63, 75); cap(153, 69, false); coil(146, 92, 102, -1);
      tr(175, 89); tx('5P', 171, 50); cap(189, 43, true); tx('200P', 170, 62, 5.6, 14); tx('2T-52', 169, 73, 5.6, 15);
      cap(161, 106, true); tx('0.05', 158, 117, 5.6, 12); res(189, 123, 10); tx('100K', 160, 128, 5.6, 13); res(181, 157, 10); tx('1K', 164, 160);
      coil(200, 66, 80); cap(209, 73, false); tx('200P', 203, 62, 5.6, 13); coil(200, 92, 104, -1);
      diode(227, 90, 1); tx('1T-33', 230, 83, 5.6, 15); cap(222, 114, false); tx('0.01', 204, 111, 5.6, 12);
      cap(213, 128, true, true); tx('3', 210, 137); res(236, 125, 16); L(244, 125, 239, 125); x.beginPath(); x.moveTo(238.4, 125); x.lineTo(241.4, 123.4); x.lineTo(241.4, 126.6); x.fill(); tx('VR-20K', 216, 160, 5.6, 19);
      cap(256, 116, true, true); tx('3', 246, 137); tx('2T-53', 249, 101, 5.6, 15); tr(278, 116); res(266, 132, 10); tx('3.3K', 268, 143, 5.6, 12);
      cap(295, 122, false); tx('0.01', 300, 111, 5.6, 12);
      coil(77, 274, 302, -1, true); L(273, 74, 311, 74); coil(71, 276, 306, 1, true);              // driver transformer: windings either side of the core
      cap(327, 67, true, true); tx('30µ', 320, 56, 5.6, 9); L(337, 70, 343, 70); L(338.2, 71.6, 341.8, 71.6); L(339.3, 73.2, 340.7, 73.2);   // to chassis
      tr(328, 96); coil(323, 116, 138); L(335, 114, 335, 140); L(337, 114, 337, 140); coil(345, 122, 136, -1); tx('8Ω', 350, 120);
      cap(323, 170, false, true); tx('30µ', 330, 177, 5.6, 9); cap(274, 161, true, true); tx('30µ', 265, 173, 5.6, 9); res(305, 161, 14, true); tx('100Ω', 284, 173, 5.6, 13);
      coil(383, 71, 81); x.strokeRect(385.5, 71, 3, 10); L(388.5, 71, 397, 64, 397, 88, 388.5, 81); tx('SPEAKER', 372, 51, 5.6, 26);
      L(373, 144, 373, 155, 401, 155, 401, 144); L(386, 144, 390, 148, 394, 144); L(398, 144, 398, 152); tx('J', 388, 137);
      cap(407, 78, false, true); tx('30µ', 411, 70, 5.6, 9); res(429, 85, 10); tx('2.2K', 409, 106, 5.6, 12); res(429, 140, 12); tx('560Ω', 409, 136, 5.6, 14);
      cap(418, 185, true, true); tx('30µ', 410, 178, 5.6, 9);
      for (let i = 0; i < 4; i++) { const yb = 100 + i * 7.5; clear(446, yb + 2, 4, 3.6); L(442, yb, 450, yb); L(444, yb + 3.2, 448, yb + 3.2); }
      tx('+', 440, 99, 5); tx('–', 441, 135, 5); tx('6V', 434, 82, 5.6);
      dot(433, 52); dot(445, 52); L(433, 52, 444, 47.6); tx('SW', 431, 47, 5.6, 9);
      x.setLineDash([3.5, 1.6, 0.8, 1.6]); L(259, 152, 353, 152, 435, 60); x.setLineDash([]);   // volume control ganged with the switch
      [[36, 59], [22, 59], [55, 104], [55, 112], [34, 112], [75, 106], [88, 52], [94, 104], [124, 104], [124, 121], [106, 43], [163, 43], [144, 52], [151, 106], [181, 106], [189, 52],
        [200, 54], [219, 88], [222, 104], [222, 128], [236, 90], [266, 146], [295, 99], [266, 116], [281, 161], [263, 161], [309, 52], [309, 67], [357, 52], [323, 161], [353, 144],
        [367, 117], [407, 110], [429, 110], [407, 52], [429, 52], [55, 174], [124, 174], [181, 174], [94, 138], [151, 138], [189, 138], [143, 185], [236, 185], [323, 185], [353, 185], [407, 185], [429, 185]].forEach(p => dot(...p));
      // ---- how to load it ----
      tx('EAR-PHONE PLUG', 34, 223, 6.2, 64); tx('ANTENNA-PLUG', 36, 256, 6.2, 62); tx('OFF', 101, 306, 6.2, 13); tx('VOLUME CONTROL', 34, 333, 6.2, 68);
      x.save(); x.translate(121, 222); x.rotate(-0.55); x.strokeRect(-11, -3, 18, 6); L(7, -1.6, 13, -1.2, 16, 0, 13, 1.2, 7, 1.6); L(-11, 0, -16, 0); x.restore();   // earphone plug
      L(110, 228, 103, 238, 118, 247, 136, 293); L(141, 267, 141, 293);                      // its cord down to the jack; antenna plug's lead
      x.strokeRect(136, 271, 10, 14); x.beginPath(); x.ellipse(141, 271, 5, 1.8, 0, 0, 7); x.stroke();
      tx('BATTERY', 215, 230, 6.2, 31); tx('UM-3', 212, 245, 6.2, 18);
      x.strokeRect(181, 251, 66, 14); x.strokeRect(177, 255, 4, 6); L(240, 251, 240, 265);
      for (const [cx, s] of [[171, '+'], [253, '–']]) { x.beginPath(); x.arc(cx, 258, 3.6, 0, 7); x.stroke(); tx(s, cx - 2, 260.2, 6); }
      L(214, 270, 202, 290); x.beginPath(); x.moveTo(199, 295); x.lineTo(198.6, 287.6); x.lineTo(205.2, 290.6); x.fill();     // into the tray
      tx('PULL', 275, 254, 6.2, 18); for (const ax of [262, 271]) { L(ax, 270, ax + 3.4, 260); x.beginPath(); x.moveTo(ax + 4.4, 257); x.lineTo(ax + 1.2, 261); x.lineTo(ax + 5.8, 262); x.fill(); }   // pull up
      L(132, 288, 296, 288, 292, 330, 126, 330, 132, 288); L(135, 294, 290, 294); L(130, 324, 288, 324);                       // the tray
      for (const yc of [300, 313]) for (const [x0, x1] of [[150, 212], [214, 276]]) {
        x.strokeRect(x0, yc - 5, x1 - x0, 10); for (let k = 0; k < 4; k++) { const ax = x0 + 10 + k * 13; L(ax + 2.4, yc - 2, ax, yc, ax + 2.4, yc + 2); }
      }
      x.save(); x.fillStyle = '#9b3b26'; x.beginPath(); x.moveTo(258, 272); x.lineTo(268, 270); x.lineTo(276, 330); x.lineTo(262, 331); x.closePath(); x.fill(); x.restore();   // pull ribbon
      x.beginPath(); x.arc(120, 321, 8, -2.6, -1.2); x.stroke(); x.beginPath(); x.moveTo(121.6, 312.8); x.lineTo(126, 314.2); x.lineTo(122.6, 317); x.fill();   // the wheel's turn
      L(131, 300, 131, 322); x.strokeRect(128, 298, 6, 26);                                                                  // volume wheel at the tray's end
      tx('FREQUENCY RANGE', 327, 212, 6.2, 71); tx('535KC – 1605KC', 329, 223, 6.2, 69); tx('BATTERY', 346, 239, 6.2, 29);
      tx('TYPE-UM-3 or UM-3A', 325, 248, 6.2, 73); tx('1.5V × 4', 329, 258, 6.2, 37);
      x.strokeRect(359, 269, 33, 56); x.save(); x.translate(376, 298); x.rotate(-1.15); tx('Sony', -17, 5, 15, 34, 'italic', 'Georgia, serif'); x.restore();
      tx('TOKYO TSUSHIN KOGYO, LTD.', 310, 338, 6.6, 123, 'italic bold');
    }), 109, 72, -9.5, 0, ZB + 1.65, 0, cover).rotation.z = Math.PI;   // x -64 .. 45: clear of the socket opening   // upside down on the cover, so it reads from behind once the cover is folded down

    // ================= inside =================
    const inner = new THREE.Group(); g.add(inner);
    const phenolic = K.mat(0x3a2b22), boardEdge = K.mat(0x2c2019), yellowM = K.mat(0xe4c24a), red = K.mat(0xc2372a), cream = K.mat(0xe8dcc0), blue = K.mat(0x4f74a8);
    const flip = geo => { const g2 = geo.clone(), ix = g2.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g2.computeVertexNormals(); return g2; };
    // 2.5" speaker behind the left of the grille: cone (both faces), basket, magnet
    const spk = new THREE.Group(); spk.position.set(-33, 6, -1.6); inner.add(spk);
    const cone = K.lathe([[31, 14.5], [29, 13.5], [16, 8], [9, 6], [9, 4.5]], K.mat(0x8a7f70), 48);
    spk.add(cone, new THREE.Mesh(flip(cone.geometry), cone.material));
    spk.add(K.slab(ringOf(K.circle(0, 0, 32), K.circle(0, 0, 29)), 13, 15, { side: steel, front: steel, back: steel, rim: 'back' }));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; spk.add(K.tube([[30 * Math.cos(a), 30 * Math.sin(a), 13], [12 * Math.cos(a), 12 * Math.sin(a), 3]], 1, steel, { segs: 8, radial: 6 })); }
    spk.add(K.cylZ(0, 0, -6, 4.5, 11, { side: steel, back: dark, front: steel, segs: 32, rim: 'back' }));
    // ---- chassis and board, laid out as in radiomuseum's photo taken with the back off (rm_tr55_inside.png). Its lower
    // corner holds the socket plate seen through the cover's opening, which scales and places it (~4.5 px/mm). Seen from
    // behind: the tuning gang fills the upper left, the dark phenolic board the middle with the four IF cans staggered on it,
    // the output transformer (SERIAL NO. printed sideways) and yellow paper capacitors stand over the speaker's magnet on the
    // right, and a steel rail runs along the top of the battery compartment. Depths follow from what is in front: the
    // magnet's back is at z -7.6, the cover's inside at -17.4. Parts too small to read on the photo are placed in the gaps.
    const metal = K.mat(0xc8c3b8), copperM = K.mat(0xc8642e);
    inner.add(K.edges(K.box(116, 1, 31, -8, -41.6, -1, steel)));                                      // plate under the cells
    inner.add(K.edges(K.box(1, 37, 31, 50, -23.5, -1, steel)));                                       // and up the side, below the gang
    // tuning gang behind the dial: back plate with a slotted screw, the red-dot trimmer, a hole and a cheese-head screw
    inner.add(K.edges(K.box(34, 36.5, 22, 42.75, 13.7, 1, metal)));                                   // x 25.75 .. 59.75, y -4.55 .. 31.95
    const screwHead = (x, y, r, rot) => {
      inner.add(K.cylZ(x, y, -11.2, -10, r, { side: brass, back: brass, segs: 20, rim: 'back' }));
      const sl = K.box(2 * r - 0.6, 0.6, 0.3, x, y, -11.3, dark); sl.rotation.z = rot; inner.add(sl);
    };
    screwHead(45.7, 18, 3, 0.6); screwHead(33.3, 29.3, 2.2, -0.3);
    inner.add(K.cylZ(45.7, 4.8, -10.8, -10, 2.6, { side: brass, back: brass, segs: 20, rim: 'back' }));   // trimmer, red dot
    inner.add(K.cylZ(44.4, 4.8, -10.9, -10.8, 0.8, { back: red, side: red, segs: 10 }));
    inner.add(K.cylZ(56.6, 2.1, -10.05, -10, 1.3, { back: dark, side: dark, segs: 16 }));
    inner.add(K.cylZ(kx, ky, 9, ZF - 1.2, 3, { side: steel, segs: 16 }));                             // knob shaft to the drive drum
    inner.add(K.cylZ(kx, ky, 6, 9, 4.5, { side: brass, front: brass, back: brass, segs: 32 }));        // drive drum (between the cells' contact plate and the side plate)
    // aerial coil over the socket plate: copper winding on a yellow former
    inner.add(K.cylX(-12, -10, 36, 47, 3.2, { side: copperM, front: copperM, back: copperM, segs: 20 }));
    inner.add(K.cylX(-12, -10, 34, 49, 2.2, { side: yellowM, front: yellowM, back: yellowM, segs: 16 }));
    // phenolic board, x -21 .. 25, y -20.5 .. 34
    inner.add(K.slab(K.rr(2, 6.75, 46, 54.5, 1.5), -5.5, -4, { side: boardEdge, front: phenolic, back: phenolic, rim: 'back' }));
    for (const [x, y] of [[5, 18.7], [-10.3, 15.1], [16.6, -13.5], [-8.2, -12.9]]) {                  // IF cans, adjustment hole on top
      inner.add(K.edges(K.box(12, 12, 9, x, y, -10, metal)));
      inner.add(K.cylZ(x, y, -14.6, -14.5, 2.4, { back: dark, side: dark, segs: 16 }));
    }
    // output transformer under its clamp, behind the magnet, its label printed sideways (reads top to bottom from behind)
    inner.add(K.edges(K.box(24, 29.6, 7.5, -33.6, 4.6, -11.8, cream)));                              // x -45.6 .. -21.6, y -10.2 .. 19.4
    inner.add(K.edges(K.box(24.6, 6, 7.9, -33.6, 16.5, -11.8, metal)));
    decal(canvasMat(220, 235, (x, w, h) => {
      x.fillStyle = '#ead9a6'; x.fillRect(0, 0, w, h); x.fillStyle = '#a8432f'; x.textBaseline = 'middle';
      x.font = 'bold 30px Arial'; x.fillText('SERIAL NO.', 12, 32, w - 24);
      x.fillStyle = '#2f4f9a'; x.font = 'bold 28px Arial'; x.fillText('m b', 12, 80);
      x.fillStyle = '#a8432f'; x.font = 'bold 52px Arial'; x.fillText('57913', 22, 132, w - 34);
      x.font = 'bold 28px Arial'; x.fillText('SONY-RADIO', 12, 192, w - 24);
    }), 22, 23.5, -33.6, 1.6, -15.6, Math.PI, inner).rotation.z = -Math.PI / 2;
    // yellow paper capacitors: above and below the transformer, one standing at its right
    inner.add(K.cylX(24.8, -12, -45.6, -21.2, 3.6, { side: yellowM, front: cream, back: cream, segs: 20 }));
    inner.add(K.cylX(-16.6, -12, -45.6, -21.2, 3.4, { side: yellowM, front: cream, back: cream, segs: 20 }));
    inner.add(K.cylY(-50.5, -12, -2, 24, 3.4, { side: yellowM, front: cream, back: cream, segs: 20 }));
    // small parts on the board (photo positions where they read): a grey box capacitor, two green dipped capacitors and a
    // long green one, orange resistors, a grey tubular capacitor; the five transistors in the gaps (red dot on top)
    const greenCap = K.mat(0x5f9a3c), greyCap = K.mat(0xa9b4bd), resM = K.mat(0xd27a45), tranM = K.mat(0x3a3f45);
    inner.add(K.edges(K.box(6, 12.6, 5, 16.4, 19.6, -8, greyCap)));
    inner.add(K.cylY(18.9, -7.6, 6, 12.8, 2, { side: greenCap, front: greenCap, back: greenCap, segs: 14 }));
    inner.add(K.cylY(-2.3, -7.6, 2.4, 12.8, 2, { side: greenCap, front: greenCap, back: greenCap, segs: 14 }));
    inner.add(K.cylX(-1.2, -7.8, 7.8, 20.8, 2.2, { side: greenCap, front: greenCap, back: greenCap, segs: 14 }));
    for (const [x0, x1, y] of [[-16.7, -4.5, 27.6], [-11.2, 0, -1.2]]) inner.add(K.cylX(y, -7.5, x0, x1, 2, { side: resM, front: resM, back: resM, segs: 12 }));
    for (const [x, y0, y1] of [[23, -2.4, 5.4], [7.7, -15.7, -5], [-17.8, -15.7, -4.6]]) inner.add(K.cylY(x, -7.5, y0, y1, 2, { side: resM, front: resM, back: resM, segs: 12 }));
    inner.add(K.cylY(1.6, -8.3, -13.5, -4.6, 2.6, { side: greyCap, front: greyCap, back: greyCap, segs: 14 }));
    for (const [x, y] of [[2, 29.5], [8, 29.5], [-2.6, 23.5], [14, -5.4], [22.5, 29]]) {
      inner.add(K.cylZ(x, y, -10.5, -5.5, 1.6, { side: tranM, back: tranM, segs: 16 }));
      inner.add(K.cylZ(x, y, -10.6, -10.5, 0.6, { back: red, side: red, segs: 8 }));
    }
    // steel rail along the top of the battery compartment (an angle: face to the back, flange forward over the cells)
    inner.add(K.edges(K.box(98, 2.8, 1, -6, -22.2, -16, metal)));                                    // y -23.6 .. -20.8
    inner.add(K.edges(K.box(98, 1, 3, -6, -21.3, -14, metal)));
    // earphone jack body behind the plate, volume pot behind the thumbwheel
    inner.add(K.edges(K.box(8, 9, 9, 54.8, -30, -12, dark)));                                            // (beyond the side plate at x 50)
    inner.add(K.cylZ(X1 + 1.2 - 9.8, vy, vz - 10, vz - 3.6, 6, { side: steel, back: steel, segs: 24, rim: 'back' }));
    // wiring: battery leads from the left contact plate to the board, speaker lead, jack lead (through the side plate)
    // (the battery leads climb the contact plate's outer side first and the jack lead stays 3 mm over the cells' ends:
    // the cells slide out under them)
    [[0xc2372a, 0], [0x2b2724, 2], [0xe4c24a, 4]].forEach(([c, o]) => inner.add(K.tube([[-62.6, -25.4, 3 + o], [-63, -21, 3 + o], [-52, -17.5, 2 + o], [-30, -16 + o * 0.5, -7], [-20, -14 + o * 0.5, -6.4]], 0.7, K.mat(c), { segs: 40, radial: 6 })));
    inner.add(K.tube([[-33, -6, -7], [-26, -9, -7], [-19, -10, -6.4]], 0.7, K.mat(0x2b2724), { segs: 20, radial: 6 }));
    inner.add(K.tube([[22, -18, -6.4], [36, -19.5, -9], [46, -24, -10], [49.4, -30, -10]], 0.7, K.mat(0xc2372a), { segs: 30, radial: 6 }));
    // four UM-3 cells in two rows of two, on a cloth pull ribbon (they come out with it)
    const cells = new THREE.Group(); inner.add(cells);
    const cellM = canvasMat(256, 64, (x, w, h) => { x.fillStyle = '#9b2a24'; x.fillRect(0, 0, w, h); x.fillStyle = '#1d1d1f'; x.fillRect(0, 0, w, 10); x.fillRect(0, h - 10, w, 10); x.fillStyle = '#f2e6c8'; x.font = 'bold 26px Arial'; x.textAlign = 'center'; x.fillText('UM-3  1.5V', w / 2, h / 2 + 9); });
    for (const z of [6, -9]) for (const [x0, x1] of [[-62, -11.5], [-11.5, 39]]) {
      cells.add(K.cylX(-33.5, z, x0 + 0.4, x1 - 1.4, 7.1, { side: cellM, front: steel, back: steel, segs: 24 }));
      cells.add(K.cylX(-33.5, z, x1 - 1.4, x1 - 0.4, 2.4, { side: steel, front: steel, segs: 12 }));   // + terminal
    }
    // pull ribbon: under the cells and up behind them. The path's first leg runs along z with no x or y in it, which leaves
    // the strip's frame to rounding noise (it came out as a 0.3 mm fin standing on edge); a slight slope pins the normal
    // to x, so t (10 mm) is the ribbon's width across x and w (0.3 mm) its thickness
    // (points every ~10 mm along the bottom: with only its ends given, the curve sagged 1 mm through the plate under the cells
    // and, once out, into the cover; it now runs between the cells' bottom at -40.6 and the plate at -41.1)
    cells.add(K.strip([[-40, -40.9, 14], [-40, -40.87, 4], [-40, -40.83, -6], [-40, -40.8, -13], [-40, -40.2, -16.3], [-40, -37, -16.9], [-40, -30, -16.9], [-40, -26.5, -15.5]], 0.3, 10, cloth, { segs: 60 }));
    for (const x of [-62.6, 39.6]) inner.add(K.edges(K.box(1, 15, 30, x, -33.5, -1.5, steel)));       // contact plates (inside the case: 28 mm tall ran 3 mm out of its bottom)

    g.userData.setExplode = t => {
      const a = sm(t / 0.5), b = sm((t - 0.45) / 0.55);
      coverP.rotation.x = -1.618 * a;             // the back cover folds down behind the radio, its far edge at feet level
      // the cells come out the back on their ribbon, lifted over the hinge, and lie on the open cover (tilted to its 2.7 deg slope)
      cells.rotation.x = (Math.PI / 2 - 1.618) * b;
      // lift: up 2 mm early, before the ribbon's lowest point reaches the cover's hinge edge, and no more, so the cells' tops
      // pass 0.5 mm under the rail; down again as they settle on the cover
      cells.position.set(0, 0.2 * b + 2 * sm(b / 0.18) * (1 - sm((b - 0.7) / 0.3)), -35.9 * b);
      inner.visible = t > 0.001;
    };
    g.userData.setExplode(0);
    return g;
  },
};
