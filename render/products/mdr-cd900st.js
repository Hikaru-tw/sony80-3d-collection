// Sony MDR-CD900ST (1989) studio monitor headphones. Face art: tex/mdr-cd900st.png (the logo plate).
// Sony publishes no dimensions (200 g, 40 mm drivers, 2.5 m straight cord). The cup is measured on photos of it and of
// the MDR-7506, which shares the housing, pads and yoke (reference image/real-product/mdr-cd900st/, notes in SOURCES.md).
// Method: on the face-on 7506 photo the round drum gives the camera tilt (17.5 deg, seen from below); the photo is
// de-tilted into a flat frame and edges are read off brightness profiles along rays, with the tilt's parallax taken out
// for parts lying deeper than the drum (U = 0.835 converts that photo frame to mm). In mm:
//   drum (the raised round boss for the logo) 52.8 across, 12 proud of the flat face: the folded 7506 shows a cup
//   side-on (drum 110-118 px tall against 485-537 px across), and Sony's 7506 service manual draws it as a deep
//   cylinder; the other photos range 7-18 mm (the face-on one's dark band below the drum may be partly shadow)
//   housing: egg-shaped, 72 wide x 83 long - its upper half a circle (r 35.9), its lower half an ellipse 47.1 down, the
//   whole 2.4 mm above the drum centre (the face is 12 mm deeper than the drum's top, so it shows lower in the photo);
//   thin (5.5 mm) with a rounded edge (~2.4 mm)
//   yoke: a band on edge round the drum, 57.1-64.1 across (3.5 thick) and 6.5 deep, 2.2 mm clear of the drum, its lower
//   edge 3.3 mm above the face; the ends run straight down the drum's sides to rounded tabs, riveted to bosses on the
//   drum 6.2 mm below its centre (the tilt axis; the rivet head sits in a sunk ring), each over a small stop block
//   (8.7 x 3.1, a square mark on it) on the face (folded 7506 side-on and close-up, the manual's hanger and housing)
//   pads: 2.4 mm proud of the housing at the sides, ~2 at the bottom, 16 thick, opening 38 x 50 (DIY-Audio-Heaven)
//   CD900ST face: chrome ring 50 mm round the logo plate (worn face-on photo, against the yoke)
//   scale, two independent checks: the 7506 baffle photo (40 mm driver frame) gives the housing 70.6 x 84.9; the pads
//   (sold at ~79 wide) stand 2.4 mm proud of it at each side in the face-on photo -> 71-73 wide; the band's height
//   above the drum (5.56 drum radii in DIY-Audio-Heaven's product photo) matches the model's 5.59
// The band and the hanger parts are drawn in the photo frame's units and scaled by U.
// From the photos:
//   wide padded headband with stitched (beaded) edges; its ends run straight into slim black end caps with a
//   red R / blue L pill across the outer face and two screws side by side on the inner face; a flat steel slider with
//   printed scale marks runs out of each cap (a few mm show at rest) to a ribbed connector and the arm, all on one
//   straight axis; the arm joins the yoke's top; a thin wire loops from the cap to the arm; the chrome ring round the
//   black logo plate on the drum (SONY, red "for DIGITAL" band); leatherette pads; the straight cord leaves the LEFT
//   cup through a boot out of the bottom of the drum, lying on the face (Sony's, Quercus's and Ohkubo's photos), to a
//   6.3 mm plug with a knurled chrome body, two knurled collar rings and a coil-spring strain relief (Quercus's photo)
// Modelled at rest, the spring band pulling the pads together; band over +y, cups at +-x; turned so the default view
// shows the R cup as the sticker does (the sticker draws its face rounder than the real 3/4 view allows).
// Inside (MDR-7506 / CD900ST family; DIY-Audio-Heaven's and iFixit's 7506 photos: the baffle with a round felt disc
// (66 mm) and four screws (54.6 mm apart) round the 40 mm driver, which sits near the middle of the housing, a little
// below the drum's centre; the foam disc comes away with the pad): baffle, driver (dome, magnet, terminals), felt damping in the
// housing, cord entry and wiring. setExplode(t): the band opens and the sliders run out (t 0-0.4), the pads come off,
// then the baffles with the drivers lift out of the housings.
export default {
  id: 'mdr-cd900st', name: 'Sony MDR-CD900ST', textures: ['tex/mdr-cd900st'], ink: 1.5, fit: 1.08,
  openLabel: 'Open up', insideView: [-25, 15, 1.1],     // viewer: [camera azimuth (+ = the product's right), elevation, distance x fit]
  build(THREE, K, T, P) {
    const root = new THREE.Group(), g = new THREE.Group(); root.add(g);
    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    const q = P && P.q, num = (k, d) => q && q.has(k) ? parseFloat(q.get(k)) : d;
    const bandM = K.mat(0x3f3b3a), padM = K.mat(0x5f5d5d), cupM = K.mat(0x4f4d4d), black = K.mat(0x2b2726), dark = K.mat(0x1f1d1c);
    const steel = K.mat(0xc9ccd0), chrome = K.mat(0xdcdfe2), redM = K.mat(0xe60012), blueM = K.mat(0x2f6fd6), screwM = K.mat(0x9f9fa0);
    const canvasMat = (w, h, draw, rep) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
      return K.mat(0xffffff, { map: t });
    };
    const ring = (ro, ri) => { const s = K.circle(0, 0, ro); s.holes.push(K.hole(0, 0, ri)); return s; };
    // the housing's egg outline: upper half a circle (rt), lower half an ellipse (rt across, rb down), its centre EY above
    // the drum's
    const EY = 2.4;
    const eggPts = (rt, rb, n = 48) => [...Array(2 * n)].map((_, i) => { const a = Math.PI * i / n; return [rt * Math.cos(a), (i < n ? rt : rb) * Math.sin(a) + EY]; });
    const egg = (rt, rb) => K.poly(eggPts(rt, rb));
    const U = 0.835;   // photo frame units -> mm (band and hanger parts are drawn in photo units)
    // cup local x = front-back, y = up, z = outward; origin = the drum centre on the baffle plane (see the header)
    const HR = 35.9, HB = -47.1, HBo = HB + EY;            // housing: upper radius (and half-width), bottom (egg frame, cup frame)
    const ZF = 5.5, RD = 26.4, ZD = ZF + 12, RR = 25.1, PR = 23.8;  // flat face, drum radius and top, chrome ring, logo plate radius
    const YR = 30.3, YT = 3.5, YH = 6.5, ZY = ZF + 3.3 + YH / 2, YP = -6.2;   // yoke: centre-line radius, thickness, depth, mid-depth; pivot height
    const XC = 16, DY = -1.6, PY = (HR + HB) / 2 + EY;    // pad thickness (pads meet at x 0); driver centre; pad opening centre
    // each hanger is one straight axis from the top of the yoke up into the band, tilted out PHI;
    // along it (photo units): arm 0-19, ribbed connector 18-38, steel slider 38-64 (6 shows at rest), end cap 44-65 with
    // the band's end inside it at 58 (7506 side view, CD900ST photos)
    const PHI = 12 * Math.PI / 180, AX = XC + ZY, AY = YR + YT / 2, TE = 58 * U, EXT = 16 * U;
    const XE = AX + TE * Math.sin(PHI), YE = AY + TE * Math.cos(PHI), YA = 171.75 * U;   // band end, band apex (pivot when the band opens)
    // logo plate: the sticker draws it as a foreshortened circle - inside its black outline an ellipse 2 x 169.6 by
    // 2 x 206.9 px, short axis at 52.1 deg (image y down), centre (734.0, 1035.7) - with SONY's baseline at 21 deg. The
    // plate's disc maps affinely onto that ellipse (3-4 px inside the outline, so the drawn outline and the white ring
    // outside it never show on the 3D plate), turned so SONY's baseline comes out level
    const [TW, TH] = [1176, 1392], PCX = 734.0, PCY = 1035.7, PA1 = 164, PA2 = 200, PPHI = 52.1 * Math.PI / 180;
    const PPSI = Math.atan(PA1 / PA2 * Math.tan(21 * Math.PI / 180 - PPHI)), cf = Math.cos(PPHI), sf = Math.sin(PPHI), cp = Math.cos(PPSI), sp_ = Math.sin(PPSI);
    const MP = { uv: (x, y) => {
      const X = x / PR, Y = -y / PR, u = PA1 * (cp * X - sp_ * Y), v = PA2 * (sp_ * X + cp * Y);
      return [(PCX + cf * u - sf * v) / TW, 1 - (PCY + sf * u + cf * v) / TH];
    } };

    // ================= headband: padded band with beaded edges (bends open about its apex) =================
    // the last span runs along the hanger axis, so the band goes straight into its end cap
    const [ex, ey] = [XE + 14 * U * Math.sin(PHI), YE + 14 * U * Math.cos(PHI)];
    const half = [[XE, YE], [ex, ey], ...[[53.5, 124.75], [56.5, 138.75], [53, 152.25], [42.5, 162.75], [23.5, 169.75]].map(([x, y]) => [x * U, y * U]), [0, YA]];
    const ctrl = [...half.slice(0, -1).map(([x, y]) => [-x, y]), ...half.slice().reverse().map(([x, y]) => [x, y])];
    const curve = new THREE.CatmullRomCurve3(ctrl.map(([x, y]) => new THREE.Vector3(x, y, 0)));
    const pts = curve.getPoints(120);
    // the sweep's frame keeps its normal along z for this flat curve, so t is the band's width front to back and
    // w its thickness across the arch
    const band = K.strip(pts.map(p => [p.x, p.y, 0]), 10 * U, 42 * U, bandM, { segs: 200, round: 3.5 * U });
    const beadM = canvasMat(16, 8, x => { x.fillStyle = '#3f3b3a'; x.fillRect(0, 0, 16, 8); x.fillStyle = '#231916'; x.fillRect(12, 0, 4, 8); }, [140, 1]);
    const welts = [-20.5 * U, 20.5 * U].map(z => K.tube(pts.map(p => [p.x, p.y, z]), 2.2 * U, beadM, { segs: 240, radial: 8 }));
    g.add(band, ...welts);
    const bend = [band, ...welts].map(m => { m.frustumCulled = false; const a = m.geometry.attributes; return { m, pos: a.position.array.slice(), nrm: a.normal.array.slice() }; });

    // ================= the two sides: end cap, slider, connector, arm, yoke, cup =================
    const sides = [], lowers = [], wires = [], pads = [], baffles = [], stretch = [];
    const tubeGeo = (p, r, segs, radial) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v => new THREE.Vector3(...v))), segs, r, radial, false);
    const wireAt = (s, e) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 44.5, -15], [s * 2, 38 - e * 0.4, -22], [s * 2, 22 - e, -22], [0, 12 - e, -10.5]].map(v => new THREE.Vector3(...v))), 40, 1.3, 6, false);
    for (const s of [-1, 1]) {
      const side = new THREE.Group(), sideIn = new THREE.Group(); side.position.set(0, YA, 0); sideIn.position.set(0, -YA, 0); side.add(sideIn); g.add(side); sides.push(side);
      // hanger frame: local y up the axis, local x across it (outward = s * x), z = band width
      const H = new THREE.Group(); H.position.set(s * AX, AY, 0); H.rotation.z = -s * PHI; sideIn.add(H);
      const Hs = new THREE.Group(); Hs.scale.setScalar(U); H.add(Hs);                 // end cap parts, photo units
      const lower = new THREE.Group(); H.add(lower); lowers.push(lower);               // everything below the cap slides out along the axis
      const Ls = new THREE.Group(); Ls.scale.setScalar(U); lower.add(Ls);              // slider, connector, arm, photo units
      // end cap over the band's end: a lip where the slider comes out, the marker pill outside, two screws inside
      Hs.add(K.slab(K.rr(0, 56, 14, 18, 3), -23.5, 23.5, { side: black, front: black, bevel: 1.2, rim: 'both' }));
      Hs.add(K.slab(K.rr(0, 45.5, 12, 3.4, 1), -22.5, 22.5, { side: black, front: black, bevel: 0.4, rim: 'both' }));
      const pill = K.slab(K.rr(0, 0, 20, 7.5, 3.7), 0, 0.9, { side: s > 0 ? redM : blueM, front: s > 0 ? redM : blueM, bevel: 0.4, rim: 'front' });
      pill.rotation.y = s * Math.PI / 2; pill.position.set(s * 6.9, 56, 0); Hs.add(pill);   // long across the band's width
      const mk = canvasMat(64, 48, (x, w, h) => { x.fillStyle = s > 0 ? '#e60012' : '#2f6fd6'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s > 0 ? 'R' : 'L', w / 2, h / 2 + 2); });
      const mp = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.5), mk); mp.rotation.y = s * Math.PI / 2; mp.position.set(s * 7.85, 56, 0); Hs.add(mp);
      for (const z of [-11.5, 11.5]) {   // side by side across the width, on the face towards the head
        Hs.add(K.cylX(54, z, s > 0 ? -7.7 : 6.9, s > 0 ? -6.9 : 7.7, 2.1, { side: screwM, front: screwM, back: screwM, segs: 16 }));
        Hs.add(K.box(0.3, 0.6, 3, -s * 7.75, 54, z, dark));
      }
      // steel slider (hidden in the cap at rest), printed scale on its outer face
      Ls.add(K.edges(K.box(1.5, 26, 12, 0, 51, 0, steel)));
      const scale = canvasMat(32, 256, (x, w, h) => {
        x.fillStyle = '#c9ccd0'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b2726';
        for (let i = 0; i < 12; i++) { const y = 10 + i * 20; x.fillRect(4, y, i % 4 ? 12 : 22, 3); }
      });
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(10, 24), scale); sp.position.set(s * 0.8, 51, 0); sp.rotation.y = s * Math.PI / 2; Ls.add(sp);
      // ribbed connector (fine ribs across its outer face), arm into the top of the yoke
      Ls.add(K.edges(K.box(12, 20, 21, 0, 28, 0, black)));
      for (let i = 0; i < 8; i++) Ls.add(K.box(0.5, 0.8, 17, s * 6.2, 20.5 + i * 2.1, 0, dark));
      Ls.add(K.slab(K.rr(0, 9, 9, 20, 2), -10, 10, { side: black, front: black, bevel: 1, rim: 'both' }));
      const wire = new THREE.Mesh(wireAt(s, 0), black); wire.scale.setScalar(U); H.add(wire); wires.push(wire);   // thin loop from the cap to the arm
      // cup holder undoes the axis tilt: the cup hangs level, the yoke's top at the start of the hanger axis
      const holder = new THREE.Group(); holder.rotation.z = s * PHI; lower.add(holder);
      const cup = new THREE.Group(); cup.position.set(-s * (AX - XC), -AY, 0); cup.rotation.y = s * Math.PI / 2; holder.add(cup);   // cup local +z = outward
      // yoke: a band on edge round the drum (thin across, deep along the drum), 2.2 mm clear of it and above the flat face;
      // its ends run straight down the drum's sides to rounded tabs riveted to the drum 6 mm below its centre (the tilt
      // axis), each over a small stop block standing on the face (7506 stowed and service-manual views)
      cup.add(K.strip(K.arc(0, 0, YR, 0, 180, 64, ZY), YT, YH, black, { segs: 128, round: 1 }));
      const tab = new THREE.Shape().moveTo(-ZY - YH / 2, 0.3).lineTo(-ZY + YH / 2, 0.3).lineTo(-ZY + YH / 2, YP).absarc(-ZY, YP, YH / 2, 0, -Math.PI, true).lineTo(-ZY - YH / 2, 0.3);
      const onX = (m, cy = 0, cz = 0) => { m.rotation.y = Math.PI / 2; m.position.set(0, cy, cz); return m; };   // slab along x (shape x = -z)
      for (const x of [-1, 1]) {
        const xo = x * (YR + YT / 2), xi = x * (YR - YT / 2);
        cup.add(onX(K.slab(tab, Math.min(xo, xi), Math.max(xo, xi), { side: black, front: black, back: black, bevel: 0.5, rim: 'both' })));
        cup.add(onX(K.slab(ring(3, 2.25), Math.min(xo, xo + x * 0.08), Math.max(xo, xo + x * 0.08), { side: dark, front: dark, back: dark, segs: 32, rim: x > 0 ? 'front' : 'back' }), YP, ZY));   // rivet's sunk ring
        cup.add(K.cylX(YP, ZY, Math.min(xo - x * 0.1, xo + x * 0.6), Math.max(xo - x * 0.1, xo + x * 0.6), 2.2, { side: black, front: black, back: black, bevel: 0.25, segs: 28, rim: x > 0 ? 'front' : 'back' }));
        cup.add(K.cylX(YP, ZY, Math.min(x * (RD - 1.5), xi), Math.max(x * (RD - 1.5), xi), 3, { side: black, front: black, back: black, segs: 24 }));   // pivot boss
        cup.add(K.edges(K.box(6.2, 8.7, 3.1, x * 27.1, YP + 1.05, ZF + 1.55, black)));                                        // stop block
        cup.add(K.box(0.2, 1.6, 1.4, x * 30.25, YP + 1.1, ZF + 1.5, dark));                                                   //   its square mark
      }
      // housing: flat face with a rounded edge, the drum, chrome ring and logo plate
      cup.add(K.slab(egg(HR, -HB), 0.5, ZF, { side: cupM, front: cupM, back: cupM, bevel: 2.4, bevelSegs: 5, rim: 'front' }));
      cup.add(K.cylZ(0, 0, ZF - 1, ZD, RD, { side: cupM, front: cupM, back: cupM, bevel: 1.2, segs: 96, rim: 'front' }));         // drum
      cup.add(K.slab(ring(RR, PR - 0.2), ZD - 0.5, ZD + 0.8, { side: chrome, front: chrome, bevel: 0.4, segs: 96 }));             // chrome ring
      cup.add(K.slab(K.circle(0, 0, PR), ZD - 0.3, ZD + 0.5, { front: K.art, side: black, M: MP, segs: 96, rim: 'front' }));    // logo plate
      // pad: the housing's outline 2.4 mm proud at the sides, 2 at the bottom; 38 x 50 opening; 16 thick, well rounded
      const pad = egg(HR + 2.4, -HB + 2); pad.holes.push(new THREE.Path().absellipse(0, PY, 19, 25, 0, 2 * Math.PI, true));
      const padMesh = K.slab(pad, -XC, 0, { side: padM, front: padM, back: padM, bevel: 4.5, bevelSegs: 6 });
      const foamM = K.mat(0x6a6a6a);
      padMesh.add(K.slab(K.ellipse(0, PY, 19.5, 25.5), -3.5, -1, { side: foamM, front: foamM, back: foamM, segs: 48 }));   // foam disc, comes off with the pad (iFixit 7506 pad guide)
      cup.add(padMesh); pads.push(padMesh);
      // baffle (lifts out): round felt disc and four screws round the driver near the housing's middle; felt in the housing
      const bf = new THREE.Group(); cup.add(bf); baffles.push(bf);
      const bs = egg(HR - 2.3, -HB - 2.3); bs.holes.push(K.hole(0, DY, 20.5));
      const felt = K.mat(0x4a4a4c);
      bf.add(K.slab(bs, -1.5, 0.5, { side: dark, front: dark, back: dark, rim: 'back' }));
      const drv = new THREE.Group(); drv.position.y = DY; bf.add(drv);
      const fd = K.circle(0, 0, 33); fd.holes.push(K.hole(0, 0, 20.5));
      drv.add(K.slab(fd, -1.8, -1.5, { side: felt, front: felt, back: felt, segs: 72 }));
      for (const [x, y] of [[27.3, 0], [-27.3, 0], [0, 27.3], [0, -27.3]]) drv.add(K.cylZ(x, y, -2.4, -1.7, 1.6, { side: screwM, back: screwM, segs: 12 }));
      drv.add(K.slab(ring(20, 17.5), -3, 1, { side: black, front: black, back: black, segs: 48, rim: 'back' }));                   // 40 mm driver frame
      drv.add(K.lathe([[0, -6], [5, -5.6], [9, -4.8], [12.5, -3.4], [15.5, -2.2], [17.5, -1.5], [17.5, -1], [0, -1]], K.mat(0xc8c3b6), 48));   // dome
      drv.add(K.cylZ(0, 0, 0.5, 7, 11.5, { side: steel, front: black, back: steel, segs: 40, rim: 'front' }));   // magnet
      // leads from the driver's terminals up to the wire into the hanger; they stay on the housing and stretch when the
      // baffle lifts out (see setExplode), as does the cord's end inside the left cup
      for (const [x, c] of [[-5.5, redM], [5.5, K.mat(0xf2f0ea)]]) {
        drv.add(K.edges(K.box(2.8, 3.6, 1.1, x, 15.5, 1.2, K.mat(0xd6a740))));
        const f = e => [[x, 15.5 + DY, 1.8 - e], [x * 1.4, 21.5 + DY, 2.6 - e / 2], [x * 0.6, 27.5 + DY, 2.4]];
        const lead = new THREE.Mesh(tubeGeo(f(0), 0.65, 20, 6), c); cup.add(lead); stretch.push({ m: lead, f, r: 0.65, segs: 20, radial: 6 });
      }
      cup.add(K.cylZ(0, DY, 0.15, 0.4, 27, { side: K.mat(0x8a8a8a), back: K.mat(0x8a8a8a), segs: 48 }));   // felt
      if (s < 0) {   // cord: a boot out of the bottom of the left cup's drum, lying on the face; the cord runs on down past the housing
        const boot = K.lathe([[0, 0], [2.8, 0], [2.8, 1.8], [2.6, 5], [2.3, 9], [2.1, 11], [0, 11]], black, 24); boot.rotation.x = Math.PI / 2; boot.position.set(0, -RD + 0.8, ZF + 2.7); cup.add(boot);
        // the cord hooks back under the cup into the plug, so the plug's tip lies where the old, shorter plug's did and
        // the framing (bounding sphere) is unchanged
        const [PX, PYc, PZ] = [-6.3, HB - 51.1, 4];
        cup.add(K.tube([[0, -RD - 9.5, ZF + 2.4], [0, -42, ZF + 2.3], [0, HBo - 3, ZF + 2], [0.5, HBo - 11, ZF + 0.8], [-4, HB - 30, 6], [-12, HB - 42, 7], [-17.5, HB - 48, 6], [-15, HB - 51, 4.6], [PX - 3, PYc, PZ], [PX + 0.5, PYc, PZ]], 1.9, black, { segs: 90, radial: 10 }));
        // 6.3 mm stereo plug as on the CD900ST (Quercus's photo, lengths measured against the 6.35 mm shaft): 22 mm coil
        // spring strain relief (7.4 across), a collar with two knurled rings, the knurled chrome body (12.4 x 23), sleeve,
        // black insulator, ring, insulator and the pointed tip (33 mm shaft); 96 mm long, axis along the cup's x
        const plug = new THREE.Group(); plug.position.set(PX, PYc, PZ); plug.rotation.y = Math.PI / 2; cup.add(plug);   // plug z = cup x
        const knurl = (len, r) => canvasMat(32, 32, x => {
          x.fillStyle = '#d9dcdf'; x.fillRect(0, 0, 32, 32); x.strokeStyle = '#7d8085'; x.lineWidth = 3;
          x.beginPath(); x.moveTo(-8, 40); x.lineTo(40, -8); x.moveTo(-8, -8); x.lineTo(40, 40); x.moveTo(-8, 8); x.lineTo(8, -8); x.moveTo(24, 40); x.lineTo(40, 24); x.moveTo(-8, 24); x.lineTo(8, 40); x.moveTo(24, -8); x.lineTo(40, 8); x.stroke();
        }, [28, Math.max(1, Math.round(len / (2 * Math.PI * r / 28)))]);
        const cyl = (z0, z1, r, side, cap = chrome, segs = 32) => {   // along plug z; CylinderGeometry so a texture wraps round it
          const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, z1 - z0, segs, 1, false).rotateX(Math.PI / 2), [side, cap, cap]);
          m.position.z = (z0 + z1) / 2; plug.add(m); return m;
        };
        const coil = [[0, 0]]; for (let i = 0; i < 34; i++) { const z = 22 * i / 34; coil.push([3.4, z], [3.7, z + 0.16], [3.7, z + 0.48]); } coil.push([3.4, 22], [0, 22]);
        plug.add(K.lathe(coil, chrome, 32));                                                                           // spring: 34 turns
        cyl(22, 25.5, 5.7, chrome); cyl(25.5, 30, 6.6, knurl(4.5, 6.6)); cyl(30, 30.8, 6, chrome); cyl(30.8, 35.8, 6.6, knurl(5, 6.6));   // collar
        cyl(35.8, 39.8, 6.2, chrome); cyl(39.8, 61.6, 6.2, knurl(21.8, 6.2)); cyl(61.6, 63.2, 6.1, chrome);            // knurled body
        cyl(63.2, 78.7, 3.175, steel, steel, 24); cyl(78.7, 79.8, 3.1, dark, dark, 24); cyl(79.8, 86, 3.175, steel, steel, 24); cyl(86, 87.1, 3.1, dark, dark, 24);
        plug.add(K.lathe([[0, 87.1], [3.175, 87.1], [3.175, 87.9], [2.3, 88.7], [2.3, 89.5], [3.175, 91.3], [3.175, 91.9], [0.35, 96.1], [0, 96.2]], steel, 32));   // tip
        // cord inside, to the driver's terminal (its end follows the driver out)
        const f = e => [[0, -RD + 1.5, -0.3], [-9, -21, -0.3], [-14, -5, -0.3 - e * 0.45], [-5, DY + 12, 0.6 - e]];
        const cin = new THREE.Mesh(tubeGeo(f(0), 1.1, 30, 6), black); cup.add(cin); stretch.push({ m: cin, f, r: 1.1, segs: 30, radial: 6 });
      }
    }

    g.userData.setExplode = t => {
      const a = sm(t / 0.4), b = sm((t - 0.35) / 0.35), c = sm((t - 0.6) / 0.4), ang = 0.24 * a;
      [-1, 1].forEach((s, i) => {
        sides[i].rotation.z = s * ang; lowers[i].position.y = -EXT * a;   // the sliders run out of the end caps
        wires[i].geometry.dispose(); wires[i].geometry = wireAt(s, 16 * a);
      });
      for (const { m, pos, nrm } of bend) {   // the band opens: each slice turns about the apex in step with the ends
        const p = m.geometry.attributes.position, n = m.geometry.attributes.normal;
        for (let i = 0; i < p.count; i++) {
          const x = pos[3 * i], y = pos[3 * i + 1], u = Math.min(1, Math.abs(x) / XE), f = Math.sign(x) * ang * u * u, cs = Math.cos(f), sn = Math.sin(f);
          p.setXY(i, x * cs - (y - YA) * sn, YA + x * sn + (y - YA) * cs);
          n.setXY(i, nrm[3 * i] * cs - nrm[3 * i + 1] * sn, nrm[3 * i] * sn + nrm[3 * i + 1] * cs);
        }
        p.needsUpdate = n.needsUpdate = true;
      }
      pads.forEach(m => { m.position.set(0, -52 * b, -17 * b); });   // pads come off inwards and drop clear of the drivers
      baffles.forEach(m => { m.position.z = -13 * c; });  // then the baffles with the drivers
      stretch.forEach(o => { o.m.geometry.dispose(); o.m.geometry = tubeGeo(o.f(13 * c), o.r, o.segs, o.radial); });   // leads follow the drivers
    };
    g.userData.setExplode(0);
    root.rotation.set(num('rx', 0.15), num('ry', -1.05), num('rz', 0.15));   // sticker's 3/4 view at the default pose
    root.userData.setExplode = g.userData.setExplode;
    return root;
  },
};
