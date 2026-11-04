// Sony CD Walkman D-E350 (2002) with its headphones, arranged as on the sticker (lid facing the viewer). Lid art: tex/d-e350.png.
// 130.6 x 150.5 x 26.3 mm (successor D-E356CK, iFixit; sibling D-E330: 131 x 151 x 26). The sticker agrees once its outline
// is read properly: lid 972 px across = 130.8 mm puts the bottom of the LCD panel 149 mm below the top.
// From reference image/real-product/d-e350/ (Sony's photo, Commons D-E330, iFixit D-E356CK teardown):
//   body a rounded octagon above (its corners just clear the round lid) and a squarer skirt below carrying the buttons:
//   OPEN and VOL -/+ on the left, play (long) and two round keys on the right; silver LCD panel across the front with
//   SOUND and MENU; HOLD on the front edge; phones jack on the left side by OPEN, DC IN on the right (the D-E350 / D-E351
//   operating instructions, "Connect" and "Play" drawings); lid hinged at the far edge, its underside ribbed round a hub
//   over the spindle with the window's frame and the latch hook (radiomuseum's open-lid photo of a D-E350)
//   back: battery door on the right (two AA side by side), oval rating label, two rubber feet and a screw
// Inside, from the D-E350/E351/E351SR/E353/E355/E356CK service manual (2002) and iFixit's D-E356CK teardown: deck plate
// with the turntable at the lid centre and the pickup slot running to the upper left; the CDM-3125ER mechanism under it
// (black chassis on three rubber mounts, pickup on its shaft and feed screw, sled motor and gear cover underneath, the
// spindle motor's can down through the board's notch); the main board across the front half, pattern side to the back
// (outline, copper and through holes from the manual's printed wiring board, tex/d-e350_board.png), copper sheet over the
// system controller; battery well on the right, its front wall on the board's cut-out.
// setExplode(t): lid swings up and the CD lifts off (t 0-0.5), then the back comes away.
export default {
  id: 'd-e350', name: 'Sony CD Walkman D-E350', textures: ['tex/d-e350', 'tex/d-e350_board'], ink: 1.5,
  openLabel: 'Open up', insideView: [-20, -36, 1.3],    // viewer: [azimuth, elevation, distance x fit]
  build(THREE, K, T, P) {
    const g = new THREE.Group(), RL = 65.4, ZT = 13.15, ZB = -13.15, ZC = 9;   // lid radius; top, back; body top
    const body = new THREE.Group(), lid = new THREE.Group(), lidIn = new THREE.Group(), back = new THREE.Group(), inner = new THREE.Group(), cd = new THREE.Group();
    const cover = new THREE.Group(); g.add(body, lid, cover, inner); lid.add(lidIn); inner.add(cd); cover.add(back);
    cover.position.set(-RL, 0, ZB); back.position.set(RL, 0, -ZB);   // back shell opens like a book on its left edge
    const M = K.mapping([738 - 486, 690 - 486, 738 + 486, 690 + 486], [-RL, RL, RL, -RL]);   // lid circle: 486 px radius
    const rimM = K.mat(0x1d52a3), lidM = K.mat(0x0068b5), lidUnder = K.mat(0x2a5d9e), silver = K.mat(0xd8dbdd), btnM = K.mat(0xc3c8cc), dark = K.mat(0x2b2726), steel = K.mat(0xb7bcc0);
    const se = (n, a, b, k) => {   // superellipse half: k = +1 upper, -1 lower; points from +x round to -x
      const pts = []; for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI, c = Math.cos(t), s = Math.sin(t); pts.push([a * Math.sign(c) * Math.abs(c) ** (2 / n), k * b * Math.abs(s) ** (2 / n)]); }
      return pts;
    };
    // ---- outline: rounded octagon above, squarer skirt below, and the LCD panel's lobe at the front ----
    // The sticker draws the panel as a lobe hanging below the skirt with a notch at each end; the real body (Sony's photo,
    // iFixit's back view of the D-E356CK) has one smooth outline with the silver panel inset in it, SOUND and MENU on its
    // bottom edge. So the panel keeps the drawn lobe (its art), and the body / back shell take the union of skirt and lobe
    // with the notches faired out (U below).
    const panelPx = [[452, 1240], [480, 1222], [560, 1206], [640, 1200], [738, 1198], [840, 1200], [920, 1206], [975, 1222], [1000, 1240], [975, 1262], [900, 1290], [820, 1312], [738, 1322], [650, 1314], [570, 1298], [500, 1272]];   // outer edge of its drawn outline
    const lobe = new THREE.CatmullRomCurve3(panelPx.map(p => new THREE.Vector3(...M.mm(...p), 0)), true, 'centripetal').getPoints(240).slice(0, -1).map(v => [v.x, v.y]);   // smooth, not 16 facets
    const offset = (pts, d) => {   // closed polygon offset along its normals, d > 0 outwards
      const n = pts.length, o = Math.sign(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * p[1], 0));
      return pts.map((p, i) => { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty); return [p[0] + o * d * ty / l, p[1] - o * d * tx / l]; });
    };
    const skirtR = th => { const c = Math.cos(th), s = Math.sin(th), n = s >= 0 ? 2.4 : 5.1, b = s >= 0 ? RL : 73; return ((Math.abs(c) / RL) ** n + (Math.abs(s) / b) ** n) ** (-1 / n); };   // the old outline() in polar form
    const U = (() => {   // convex hull of skirt and lobe (lobe taken 0.3 mm in, so the panel's silver wall stands just proud): fills <= 2.6 mm by the lobe's tips
      const pts = [...Array.from({ length: 720 }, (_, i) => { const t = 2 * Math.PI * i / 720, r = skirtR(t); return [r * Math.cos(t), r * Math.sin(t)]; }), ...offset(lobe, -0.3)].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), half = list => { const h = []; for (const p of list) { while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); } h.pop(); return h; };
      return [...half(pts), ...half([...pts].reverse())];   // monotone chain, counter-clockwise
    })();
    const uShape = (sc = 1) => K.poly(U.map(([x, y]) => [x * sc, y * sc]));
    const inside = (poly, [x, y]) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
    const dense = pts => pts.flatMap((p, i) => { const q = pts[(i + 1) % pts.length], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]))); return Array.from({ length: n }, (_, k) => [p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]); });   // <= 1 mm steps
    const rimLine = (pts, z, keep) => {   // feature line along a closed outline, only where keep(): a line buried in another solid shows through at grazing angles
      const runs = []; let run = [];
      pts.forEach(p => { if (keep(p)) run.push(new THREE.Vector3(p[0], p[1], z)); else if (run.length) { runs.push(run); run = []; } });
      if (run.length) { if (runs.length && keep(pts[0])) runs[0] = [...run, ...runs[0]]; else runs.push(run); }
      if (runs.length === 1 && runs[0].length === pts.length) return [new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(runs[0]), K.lineMat)];
      return runs.filter(r => r.length > 1).map(r => new THREE.Line(new THREE.BufferGeometry().setFromPoints(r), K.lineMat));
    };
    // ---- body: walls round the lid bay, the back shell, the LCD panel across the front ----
    const RD = 63, walls = uShape(); walls.holes.push(K.hole(0, 0, RD));                    // RD: the bay under the lid
    body.add(K.slab(walls, ZB + 6, ZC, { side: rimM, front: rimM, back: rimM, bevel: 1.2 }));
    body.add(...rimLine(dense(U), ZC - 1.2, p => !inside(lobe, p)));   // rim: not where the panel covers it
    // lip round the bay: the walls' bevelled bay edge and the lid's rounded underside left a wedge through which the light
    // deck showed as specks at grazing angles; this closes it (just under the walls' top, so no coplanar faces)
    const lip = K.circle(0, 0, RD + 1.3); lip.holes.push(K.hole(0, 0, 61.5));
    body.add(K.slab(lip, ZC - 2.8, ZC - 0.02, { side: rimM, front: rimM, back: rimM }));
    body.add(...rimLine(K.circle(0, 0, 61.5).getPoints(96).slice(0, -1).map(v => [v.x, v.y]), ZC - 0.02, () => true));   // the bay's edge, seen with the lid open
    back.add(K.slab(uShape(), ZB, ZB + 1.3, { side: rimM, front: rimM, back: rimM, bevel: 1, rim: 'back' }));   // back shell: plate ...
    const bw = uShape(), bwh = new THREE.Path(); uShape(0.96).getPoints().reverse().forEach((q, i) => i ? bwh.lineTo(q.x, q.y) : bwh.moveTo(q.x, q.y)); bw.holes.push(bwh);
    back.add(K.slab(bw, ZB + 1.2, ZB + 6.2, { side: rimM, front: rimM, back: rimM, bevel: 0.6 }));               // ... and its walls
    const low = se(5.1, RL * 0.98, 73 * 0.98, -1).filter(([x, y]) => Math.hypot(x, y) > RD + 0.3);   // the drawn skirt between the lid circle and the edge
    const a0 = Math.atan2(low[0][1], low[0][0]), a1 = Math.atan2(low[low.length - 1][1], low[low.length - 1][0]);
    const arc = Array.from({ length: 41 }, (_, i) => { const a = a1 + ((a0 < a1 ? a0 + 2 * Math.PI : a0) - a1) * i / 40; return [RD * Math.cos(a), RD * Math.sin(a)]; });
    body.add(K.face(K.poly([...low, ...arc]), ZC + 0.02, M));
    // silver LCD panel: flush with the skirt (its top just above the skirt's, same art, so no seam; it used to sit 0.6 mm
    // low and the skirt's edge cut a blue stripe across it), wrapping down the front to the shell seam. Bevel 1.6 keeps the
    // skirt walls (bevel 1.2, 0.3 mm inside) hidden under its rounded edge; its foot sits 0.4 mm above theirs (both at ZB + 6
    // z-fought blue / silver inside, seen with the back open).
    body.add(K.slab(K.poly(lobe), ZB + 6.4, ZC + 0.1, { front: K.art, side: silver, back: silver, bevel: 1.6, M }));
    body.add(...rimLine(lobe, ZC - 1.5, p => !inside(U, p)));   // its rim where it stands clear of the skirt
    const lobeOut = offset(lobe, 1);
    // SOUND and MENU keys on the panel's front wall towards its ends (not drawn on the sticker). Measured along the silver strip
    // on radiomuseum's head-on front-edge photo of a D-E350: key centres at 0.10 and 0.905 of the strip, keys ~9.5 mm long
    for (const xb of [-31, 27]) {
      const k = lobe.reduce((m, p, i) => Math.abs(p[0] - xb) < 2 && (m < 0 || p[1] < lobe[m][1]) ? i : m, -1), [px, py] = lobe[k];
      const n = new THREE.Vector3(lobeOut[k][0] - px, lobeOut[k][1] - py, 0).normalize(), t = new THREE.Vector3(0, 0, 1).cross(n);
      const keyM = K.slab(K.rr(0, 0, 9.5, 2.4, 1.15), 0, 1, { side: btnM, front: btnM, back: btnM, bevel: 0.3, rim: 'front' });
      keyM.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(t, new THREE.Vector3(0, 0, 1), n));
      keyM.position.set(px - 0.3 * n.x, py - 0.3 * n.y, ZC - 3.4); body.add(keyM);
    }
    // ---- lid: hinged along the far edge, disc window ----
    lid.position.set(0, RL - 1.5, ZC); lidIn.position.set(0, -(RL - 1.5), -ZC);
    // the shell keeps its outside; its flat underside cap is dropped, and the rim and recess under it (below, with the
    // ribs) close it from beneath
    const lidShell = K.slab(K.circle(0, 0, RL - 1), ZC + 0.1, ZT, { front: K.art, side: lidM, back: lidUnder, bevel: 1.8, M, segs: 96, rim: 'front' });
    lidShell.geometry.groups = lidShell.geometry.groups.filter(gr => gr.materialIndex !== 2);
    lidIn.add(lidShell);
    // disc window and the keys below: outlines traced on the art (tex/d-e350.png, px), the mid-line of each part's black ink
    // outline, so the rims run inside the drawn lines and the art on top lines up with the part (they were an ellipse,
    // circles and pills placed by eye: OPEN and play sat off their drawings and the round keys' rims ran outside theirs)
    const traced = pts => K.poly(pts.map(p => M.mm(...p)));
    const WIN = [[996.2, 939.6], [988.3, 961.5], [979.8, 977.1], [970.6, 991.5], [968.0, 994.8], [951.6, 1012.9], [934.6, 1029.7], [915.1, 1043.9], [889.8, 1059.8], [873.1, 1066.6], [850.3, 1072.4], [840.5, 1074.0], [819.8, 1076.3], [809.2, 1075.8], [793.2, 1073.2], [787.9, 1071.8], [772.4, 1065.9], [767.5, 1063.4], [763.0, 1060.3], [754.5, 1053.2], [743.0, 1041.3], [739.7, 1036.8], [737.0, 1032.0], [732.6, 1021.8], [727.3, 1006.3], [726.1, 1001.0], [725.5, 990.0], [726.1, 968.9], [726.5, 963.9], [727.6, 958.8], [735.9, 930.6], [740.9, 917.8], [745.2, 909.9], [752.5, 898.9], [758.2, 887.9], [762.7, 881.0], [767.8, 874.6], [788.3, 855.2], [796.6, 846.5], [813.3, 835.1], [823.3, 827.2], [830.8, 823.2], [838.8, 820.0], [855.3, 811.9], [873.5, 806.9], [883.1, 805.3], [908.6, 802.9], [919.3, 803.3], [929.7, 805.3], [945.1, 810.1], [960.6, 816.2], [965.4, 818.9], [969.7, 822.4], [981.3, 834.2], [988.3, 842.6], [991.2, 847.3], [993.7, 852.3], [997.6, 862.5], [1000.7, 873.0], [1001.4, 878.5], [1002.7, 905.0], [1002.6, 910.2], [1000.9, 920.4]];
    lidIn.add(K.slab(traced(WIN), ZT - 0.5, ZT + 0.8, { front: K.art, side: silver, bevel: 0.4, M, rim: 'front', artEdge: true }));
    lidIn.add(K.edges(K.box(24, 2.4, 2.4, 0, 61.4, ZC + 1.3, lidUnder)));                     // hinge block, inside the lid's footprint
    // ---- buttons on the skirt ----
    const key = (shape, h = 1.5) => body.add(K.slab(shape, ZC - 0.4, ZC + h, { front: K.art, side: btnM, bevel: 0.5, M, rim: 'front', artEdge: true }));
    [[379.1, 1092.8, 19.3], [472.2, 1162.8, 19], [1067.6, 1115.5, 19.1], [994.7, 1167.2, 18.5]].forEach(([x, y, r]) => key(K.circle(...M.mm(x, y), M.sx(r))));   // VOL -, +; two round keys
    const PLAY = [[1149.1, 1048.4], [1145.2, 1052.4], [1139.7, 1060.2], [1134.1, 1066.4], [1122.2, 1077.8], [1116.6, 1081.7], [1115.0, 1082.1], [1113.6, 1081.8], [1110.2, 1079.6], [1105.4, 1074.9], [1102.3, 1070.6], [1102.0, 1067.7], [1104.0, 1063.7], [1109.7, 1056.8], [1119.6, 1043.0], [1133.5, 1029.4], [1142.0, 1020.5], [1147.2, 1016.3], [1148.8, 1015.7], [1151.8, 1015.6], [1155.4, 1017.4], [1160.3, 1021.9], [1161.8, 1024.2], [1162.5, 1026.9], [1162.4, 1032.7], [1161.2, 1035.8], [1158.5, 1039.1]];
    const OPEN = [[319.9, 1005.6], [320.5, 1012.2], [319.8, 1017.0], [316.8, 1025.8], [313.8, 1030.6], [303.4, 1042.1], [294.3, 1050.2], [289.3, 1053.0], [287.6, 1053.2], [284.5, 1051.7], [282.0, 1048.6], [279.6, 1042.0], [275.1, 1017.6], [272.0, 991.7], [269.6, 981.8], [269.1, 970.9], [269.7, 969.1], [271.5, 966.1], [275.3, 963.0], [278.4, 961.9], [280.1, 962.0], [283.7, 963.1], [295.6, 969.2], [300.2, 972.2], [311.1, 982.6], [317.5, 991.2], [319.3, 996.5]];
    key(traced(PLAY));                                                                               // play / pause (long)
    key(traced(OPEN), 1.1);                                                                          // OPEN
    // ---- edges: HOLD on the front wall between VOL - and +, phones jack (left side), DC IN (right side, behind the play
    // keys). Both jacks sit where the service manual's board has their pins (J301 at y -15 ... -28 on the left edge, the
    // same black 4-pin socket iFixit's lifted-board photo shows there; J401 at y -35.6 on the right tip, the gold socket
    // on iFixit's inside photo), centred on the board's top face; HOLD slides along the hull's straight front-left wall
    // (S802 is under it at x -42) ----
    const hold = K.edges(K.box(7, 1.6, 3.2, -41.91, -72.78, -3, K.mat(0x9aa0a5))); hold.rotation.z = -0.467; body.add(hold);
    body.add(K.cylX(-22, -3.8, -65.8, -63, 3.3, { side: silver, back: silver, front: silver, rim: 'back' }), K.cylX(-22, -3.8, -65.9, -63, 1.9, { side: dark, back: dark, front: dark }));
    body.add(K.cylX(-34.6, -3.8, 63, 65.5, 3, { side: dark, front: silver, back: dark, rim: 'front' }), K.cylX(-34.6, -3.8, 63, 65.6, 1.5, { side: dark, front: dark }));   // the socket's opening
    // ---- back, from radiomuseum's two photos of real D-E350s: rm_de350_back_door_open.jpg is taken square on (its outline
    // is within 2 % of the body's 130.6 x 150.5 mm proportions, 2.34 px/mm) and fixes the label, feet and screw;
    // rm_de350_back.jpg (tilted) the battery door, which the other photo shows open ----
    // battery door (right, seen from behind on the left): from its inner edge at x 21, where it hinges (it stands up there
    // in the door-open photo), out to the shell's edge, y -28 ... 48; it follows the outline, 1.4 mm inside it. It was a
    // 32 x 54 mm panel 8 mm in from the edge
    const doorPts = (() => {
      let poly = offset(U, -1.4);
      for (const [ax, sg, v] of [[0, 1, 21], [1, 1, -28], [1, -1, 48]]) {   // clip to x >= 21, -28 <= y <= 48
        const inn = p => sg * (p[ax] - v) >= 0, out = [];
        poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length];
          if (inn(p)) out.push(p);
          if (inn(p) !== inn(q)) { const t = (v - p[ax]) / (q[ax] - p[ax]); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } });
        poly = out;
      }
      return poly;
    })();
    back.add(K.slab(K.poly(doorPts), ZB - 0.4, ZB + 0.4, { side: rimM, front: rimM, back: rimM, rim: 'back', segs: 64 }));   // no bevel: its outline on the sharp edge (at a bevel's foot the door hid its own far edges -> dashes)
    for (let i = 0; i < 4; i++) back.add(K.box(14, 0.6, 0.3, 42, 8 - i * 1.6, ZB - 0.5, K.mat(0x174790)));   // grip lines, mid-door
    const lbl = (() => {   // the photos' label: black, white print, SONY, model and serial, ratings, CE and the Walkman logo
      const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
      x.fillStyle = '#141414'; x.beginPath(); x.ellipse(256, 256, 254, 254, 0, 0, 7); x.fill(); x.fillStyle = '#e4e4e4'; x.textAlign = 'center';
      x.font = 'bold 40px Georgia, serif'; x.fillText('SONY®', 256, 88); x.font = 'bold 22px Arial'; x.fillText('MODEL No.  D-E350', 256, 122);
      x.textAlign = 'left'; x.font = '15px Arial'; ['SONY CORP.', 'MADE IN CHINA'].forEach((s, i) => x.fillText(s, 92, 154 + i * 20));
      x.fillRect(250, 140, 150, 34); x.fillStyle = '#141414'; x.font = '24px Arial'; x.fillText('2143097', 270, 166); x.fillStyle = '#e4e4e4';
      x.font = 'bold 21px Arial'; ['PORTABLE CD PLAYER', 'DC 4.5V EXTERNAL DC SUPPLY', 'BATTERY SUPPLY  1.5V × 2', 'R6 SIZE AA OR EQUIVALENT'].forEach((s, i) => x.fillText(s, 84, 226 + i * 30));
      x.textAlign = 'center'; x.font = 'bold 48px Arial'; x.fillText('CE', 256, 386); x.font = 'italic bold 30px Georgia, serif'; x.fillText('W• WALKMAN', 256, 452);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return K.mat(0xffffff, { map: t });
    })();
    const lb = new THREE.Mesh(new THREE.CircleGeometry(1, 64), lbl); lb.scale.set(22, 26, 1); lb.rotation.y = Math.PI; lb.position.set(-4, -3, ZB - 0.05); back.add(lb);   // was 19 x 23 at (-12, 2), from the D-E356CK
    // rubber feet (2) and the screw (1) of the manual's cabinet exploded view: two 8 mm feet 38.5 mm either side of the
    // middle at y -50, and one screw on the centre line 8 mm from the hinge edge (both photos; iFixit's D-E356CK agrees)
    const footM = K.mat(0x2a2b2e);
    for (const x of [-38.5, 38.5]) back.add(K.cylZ(x, -50, ZB - 1, ZB + 0.3, 4, { side: footM, front: footM, back: footM, bevel: 0.4, rim: 'back' }));
    back.add(K.cylZ(0, 57.5, ZB - 0.02, ZB + 0.3, 2.1, { side: dark, back: K.mat(0x15171a), rim: 'back' }));   // screw well
    back.add(K.cylZ(0, 57.5, ZB - 0.04, ZB + 0.3, 1.35, { side: steel, back: steel }));                       // screw head
    for (const a of [0, Math.PI / 2]) { const sl = K.box(2.1, 0.35, 0.04, 0, 57.5, ZB - 0.06, K.mat(0x55595e)); sl.rotation.z = a + Math.PI / 4; back.add(sl); }   // cross slot

    // ================= inside =================
    const deckM = K.mat(0xc9ccd0), black = K.mat(0x26292c), pcbEdge = K.mat(0x2f6e3a), copper = K.mat(0xc98a5a), orange = K.mat(0xe0902a), cellBlue = K.mat(0x2b4e9c), brass = K.mat(0xc9a24a);
    const decal = (shape, z, mat) => {   // flat face at z with the texture spread over its bounding box
      const geo = new THREE.ShapeGeometry(shape, 24); geo.computeBoundingBox(); const bb = geo.boundingBox, p = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
      geo.translate(0, 0, z); return new THREE.Mesh(geo, mat);
    };
    const canvasMat = (w, h, draw, repeat) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'));
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
      return K.mat(0xffffff, { map: t });
    };
    // ---- lid underside, from radiomuseum's photo of a D-E350 with the lid open (rm_de350_open_lid.jpg): a rim round a
    // shallow recess, a hub over the spindle with two rings and eight ribs at 45 degrees, the disc window's frame round its
    // tinted pane, and the latch hook above OPEN. The photo is oblique (it puts the window 23 mm right of the hub, the
    // sticker 17); sizes are its ratios, scaled so the window sits where the sticker draws it, which also lets the front
    // rib pass just left of the frame and the outer ring run into it, as photographed. ----
    const ZR = ZC + 1.6, ZRb = ZR - 1.15;   // recess plane (1.5 above the rim); rib bottoms clear the CD by 0.85, the hub the centring boss by 0.55
    const lidU = { side: lidUnder, front: lidUnder, back: lidUnder };
    const rimRing = K.circle(0, 0, RL - 2.8); rimRing.holes.push(K.hole(0, 0, RL - 3.8));   // flat 1 mm inside the shell's round-over
    lidIn.add(K.slab(rimRing, ZC + 0.1, ZR + 0.01, { ...lidU, segs: 96 }));
    lidIn.add(K.slab(K.circle(0, 0, RL - 3.4), ZR, ZR + 0.3, { ...lidU, segs: 96 }));          // recess ceiling
    lidIn.add(...rimLine(K.circle(0, 0, RL - 3.8).getPoints(96).slice(0, -1).map(v => [v.x, v.y]), ZC + 0.1, () => true));
    const wb = WIN.map(p => M.mm(...p)), xs = wb.map(p => p[0]), ys = wb.map(p => p[1]);
    const W = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2], RW = 16.3, RP = 12.3;   // window frame centre (16.97, -33.59), outer / pane radii
    const ribOpts = { ...lidU, rim: 'back', segs: 64 };
    for (const r of [10.5, 22.5]) {   // rings, 0.9 wide; where the outer one runs into the frame it is buried in it (its bottom 0.05 higher)
      const s = K.circle(0, 0, r + 0.45); s.holes.push(K.hole(0, 0, r - 0.45));
      lidIn.add(K.slab(s, ZRb, ZR + 0.2, { ...ribOpts, segs: 96 }));
    }
    const ribShape = (a, t0, t1) => { const c = Math.cos(a), s = Math.sin(a), nx = -s * 0.45, ny = c * 0.45; return K.poly([[c * t0 + nx, s * t0 + ny], [c * t1 + nx, s * t1 + ny], [c * t1 - nx, s * t1 - ny], [c * t0 - nx, s * t0 - ny]]); };
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      const off = Math.abs(W[0] * s - W[1] * c), tw = W[0] * c + W[1] * s;   // frame centre's distance from the rib's line, and along it
      const enter = off < RW + 0.45 ? tw - Math.sqrt((RW + 0.45) ** 2 - off ** 2) : Infinity;
      lidIn.add(K.slab(ribShape(a, 10.93, 22.07), ZRb, ZR + 0.2, ribOpts));                    // between the rings
      const t1 = Math.min(44, enter + 1.6);                                                     // into the frame, short of its pane
      if (t1 > 23.5) lidIn.add(K.slab(ribShape(a, 22.93, t1), ZRb, ZR + 0.2, ribOpts));
    }
    lidIn.add(K.cylZ(0, 0, ZRb, ZR + 0.2, 2.4, ribOpts));                                       // hub
    lidIn.add(K.cylZ(0, 0, ZRb - 0.05, ZRb + 0.2, 0.7, { side: K.mat(0x1d4378), back: K.mat(0x1d4378) }));   // its pin
    const frame = K.circle(W[0], W[1], RW); frame.holes.push(K.hole(W[0], W[1], RP));
    lidIn.add(K.slab(frame, ZR - 1.2, ZR + 0.2, { ...ribOpts, segs: 96 }));
    const pane = new THREE.Mesh(new THREE.CircleGeometry(RP, 64), canvasMat(256, 256, x => {   // tinted clear pane, the room's light on it
      const gr = x.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, '#b7b0d8'); gr.addColorStop(0.45, '#d9c3dd'); gr.addColorStop(1, '#a8bfdc');
      x.fillStyle = gr; x.fillRect(0, 0, 256, 256); x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.moveTo(40, 256); x.lineTo(110, 256); x.lineTo(256, 110); x.lineTo(256, 40); x.fill();
    }));
    pane.rotation.y = Math.PI; pane.position.set(W[0], W[1], ZR - 0.4); lidIn.add(pane);
    // latch hook on the rim above OPEN (the photo's upper left with the lid up); inside the bay's lip and outside the CD when shut
    const ah = -141 * Math.PI / 180, hook = K.edges(K.box(5, 1.2, ZR + 0.2 - (ZC - 1), 60.7 * Math.cos(ah), 60.7 * Math.sin(ah), (ZR + 0.2 + ZC - 1) / 2, lidUnder));
    hook.rotation.z = ah + Math.PI / 2; lidIn.add(hook);
    // deck plate under the lid, cut for the turntable and the pickup slot (towards the upper left)
    const deck = K.circle(0, 0, RD), slot = new THREE.Path();
    const sd = [-0.7584, 0.6518], sn = [-sd[1], sd[0]], sp = (a, b) => [a * sd[0] + b * sn[0], a * sd[1] + b * sn[1]];   // the mechanism's axes (fit below)
    [sp(-4, -19), sp(56, -19), sp(56, 19), sp(-4, 19)].reverse().forEach(([x, y], i) => i ? slot.lineTo(x, y) : slot.moveTo(x, y));
    deck.holes.push(slot);
    inner.add(K.slab(deck, ZC - 3.6, ZC - 2.8, { side: deckM, front: deckM, rim: 'front', segs: 96 }));
    inner.add(decal(K.rr(38, 8, 24, 33, 1), ZC - 2.78, canvasMat(256, 352, x => {   // printed laser / caution text on the deck
      x.fillStyle = '#c9ccd0'; x.fillRect(0, 0, 256, 352); x.fillStyle = '#55595e'; x.font = '15px Arial';
      ['CLASS 1 LASER PRODUCT', 'LUOKAN 1 LASERLAITE', 'KLASS 1 LASERAPPARAT', '', 'CAUTION', 'INVISIBLE LASER', 'RADIATION WHEN OPEN', 'AVOID EXPOSURE', 'TO BEAM', '', 'ESP MAX  CD-R/RW', 'D-E350'].forEach((s, i) => x.fillText(s, 14, 30 + i * 26));
    })));
    // ESP MAX switch: a slide on the deck at the front left of the bay, seen with the lid open (operating instructions,
    // "To maximize the skip protection performance")
    inner.add(K.slab(K.rr(-43, -31, 11, 4.8, 1.4), ZC - 2.8, ZC - 2.72, { side: black, front: black, rim: 'front' }));
    inner.add(K.slab(K.rr(-45.4, -31, 4.4, 3.8, 0.9), ZC - 2.8, ZC - 1.8, { side: btnM, front: btnM, bevel: 0.3, rim: 'front' }));
    inner.add(decal(K.rr(-43, -25.6, 14, 4, 0.5), ZC - 2.76, canvasMat(256, 72, x => {
      x.fillStyle = '#c9ccd0'; x.fillRect(0, 0, 256, 72); x.fillStyle = '#55595e'; x.font = 'bold 40px Arial'; x.textAlign = 'center'; x.fillText('ESP  OFF  ON', 128, 52);
    })));
    inner.add(K.lathe([[0, ZC - 3], [11.5, ZC - 3], [11.5, ZC - 1.6], [7.4, ZC - 1.6], [7.4, ZC - 0.6], [6.2, ZC - 0.1], [0, ZC - 0.1]], black, 48));   // turntable + centring boss
    for (let i = 0; i < 3; i++) { const a = i / 3 * 2 * Math.PI; inner.add(K.cylZ(6.9 * Math.cos(a), 6.9 * Math.sin(a), ZC - 1.6, ZC - 0.5, 0.8, { side: steel })); }   // clamp balls
    // ---- CD mechanism (CDM-3125ER, manual 6-2): chassis outline traced on iFixit's photo of the D-E356CK's (the same
    // mechanism) in its own axes, a from the spindle along the pickup's travel, b across (sp() above), 0.170 mm per photo
    // pixel. That scale makes the turntable flange (r 13.2) just clear the motor can (r 11.6 on the inside photo), parks
    // the lens at r 57, and lands two of the three rubber-mounted ears on the board's post notch and post hole (within 2 mm)
    const ZB0 = ZB + 5, ZB1 = ZB + 6, CH0 = ZB1 + 0.55, CH1 = ZC - 4.7, CH2 = ZC - 3.7;   // board back / top face; chassis underside, lip, top
    const CH = [[57.87, -17.87], [31.91, -18.3], [31.49, -28.93], [7.23, -29.36], [1.28, -24.68], [-5.53, -19.57], [-11.06, -13.19], [-15.74, -5.96], [-17.02, -0.85], [-16.6, 9.36], [-14.04, 12.77], [-8.94, 17.02], [6.38, 20], [14.89, 22.13], [53.19, 22.13], [59.03, 20.81], [60.16, 17.31], [61.16, -13.32], [60.42, -16.37]];   // far corners pulled in to r 62.6 (the bay wall's bevel)
    const EARS = [[19.32, -33.61, 3.8, [19.32, -27]], [-22.98, 3.83, 4.4, [-15, 3.5]], [37.02, 28.93, 4.6, [37.02, 20]]];   // top, right, bottom: centre, rubber radius, root inside the body
    const abPoly = pts => K.poly(pts.map(q => sp(...q)));
    const abHole = pts => { const p = new THREE.Path(); pts.forEach((q, i) => { const [x, y] = sp(...q); i ? p.lineTo(x, y) : p.moveTo(x, y); }); p.closePath(); return p; };
    const abRect = (a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
    const capsule = ([a0, b0], [a1, b1], r) => { const t = Math.atan2(b1 - b0, a1 - a0), pts = [];
      for (let i = 0; i <= 12; i++) { const u = t - Math.PI / 2 + Math.PI * i / 12; pts.push([a1 + r * Math.cos(u), b1 + r * Math.sin(u)]); }
      for (let i = 0; i <= 12; i++) { const u = t + Math.PI / 2 + Math.PI * i / 12; pts.push([a0 + r * Math.cos(u), b0 + r * Math.sin(u)]); }
      return pts; };
    const abBox = (a0, a1, b0, b1, z0, z1, m) => { const [x, y] = sp((a0 + a1) / 2, (b0 + b1) / 2), bx = K.edges(K.box(a1 - a0, b1 - b0, z1 - z0, x, y, (z0 + z1) / 2, m)); bx.rotation.z = Math.atan2(sd[1], sd[0]); return bx; };
    const along = m => { m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(sd[0], sd[1], 0)); return m; };   // a cylZ turned onto the a axis
    const chLow = abPoly(CH); chLow.holes.push(abHole(abRect(12, 58, -14, 18.5)));           // open underneath where the sled runs
    inner.add(K.slab(chLow, CH0, CH1, { side: black, back: black, front: black, rim: 'back' }));
    const chLip = abPoly(CH); chLip.holes.push(abHole(abRect(14, 59.5, -6.8, 8.9)));         // top lip with the lens window
    inner.add(K.slab(chLip, CH1, CH2, { side: black, back: black, front: black, rim: 'front' }));
    const rubber = K.mat(0x1c1c1e);
    for (const [a, b, r, root] of EARS) {
      inner.add(K.slab(abPoly(capsule(root, [a, b], r + 0.8)), CH0, CH0 + 1.5, { side: black, back: black, front: black, rim: 'back' }));   // ear
      const [x, y] = sp(a, b); inner.add(K.cylZ(x, y, CH0 - 0.4, CH0 + 2.6, r, { side: rubber, back: rubber, front: rubber, rim: 'back' }));   // insulator (56)
    }
    const fl = K.circle(0, 0, 13.2); fl.holes.push(K.hole(0, 0, 11.6));
    inner.add(K.slab(fl, CH2, CH2 + 0.08, { side: steel, front: steel }));                     // spindle motor's flange, seen round the turntable
    inner.add(K.cylZ(0, 0, ZB + 2.6, CH0, 11.4, { side: steel, back: steel, rim: 'back' }));   // its can, down through the board's notch (r 13.2)
    // pickup (DAX-25E) parked at the inner end on its guide shaft (63) and feed screw (53), the screw's gear by the spindle
    inner.add(abBox(18, 32, -12.5, 17.5, -2.5, 1.5, K.mat(0x3a3d41)));                         // sled
    inner.add(abBox(19, 31, -5, 7, 1.5, 4.2, K.mat(0x9da2a7)));                                // optical block
    const [qx, qy] = sp(25, 0.5);
    inner.add(K.cylZ(qx, qy, ZC - 4.2, ZC - 3.4, 2.1, { side: dark, front: K.mat(0x5a4fa8), rim: 'front' }));   // objective lens
    inner.add(K.tube([[...sp(9, 17), -0.5], [...sp(59, 17), -0.5]], 0.9, steel, { segs: 4, radial: 8 }));
    inner.add(K.tube([[...sp(9, -12), -0.5], [...sp(57.5, -12), -0.5]], 1.2, K.mat(0x7d8287), { segs: 4, radial: 10 }));
    const gearM = K.mat(0xe8e4da), gear = along(K.cylZ(0, 0, -0.6, 0.6, 3.2, { side: gearM, front: gearM, back: gearM, rim: 'both' }));
    gear.position.set(...sp(13.5, -12), -0.5); inner.add(gear);
    // sled motor (M902) and the gear cover (51) hang under the chassis' raised end, behind the board
    const m902 = along(K.cylZ(0, 0, -6, 6, 2.5, { side: steel, front: K.mat(0x8a8f94), back: K.mat(0x8a8f94), rim: 'both' }));
    m902.position.set(...sp(16, -23), CH0 - 2.4); inner.add(m902);
    inner.add(abBox(4.5, 10, -27, -18, CH0 - 2.9, CH0, K.mat(0xd3d7da)));
    // pickup flex: down beside the sled through the open underside, then flat to CN501 on the board's top face
    inner.add(abBox(21.5, 28.5, 18, 18.3, CH0 - 0.3, 1.2, orange));
    inner.add(abBox(21.5, 28.5, 18, 27.6, CH0 - 0.45, CH0 - 0.15, orange));
    inner.add(abBox(21, 29.2, 26.6, 28.6, ZB1, ZB1 + 1.1, K.mat(0xeeeae0)));                   // CN501
    // the CD (Sony CD-R): printed label up, clear centre ring, rainbow underside
    const cdTop = canvasMat(512, 512, x => {
      const gr = x.createLinearGradient(0, 0, 512, 512); gr.addColorStop(0, '#e9ecef'); gr.addColorStop(0.5, '#c4cad1'); gr.addColorStop(1, '#eef0f2');
      x.fillStyle = gr; x.beginPath(); x.arc(256, 256, 256, 0, 7); x.fill(); x.fillStyle = '#d7dee6'; x.beginPath(); x.arc(256, 256, 70, 0, 7); x.fill();
      x.fillStyle = '#1d3d73'; x.font = 'bold 54px Georgia, serif'; x.fillText('SONY', 186, 150); x.font = 'bold 40px Arial'; x.fillText('CD-R', 212, 400); x.font = '22px Arial'; x.fillText('700MB  80min', 196, 436);
    });
    const cdUnder = canvasMat(256, 256, x => {
      const gr = x.createConicGradient ? x.createConicGradient(0, 128, 128) : null;
      if (gr) { ['#d9dde3', '#9fd3ff', '#e7c6ff', '#fff3a8', '#b9f5c9', '#d9dde3'].forEach((c, i) => gr.addColorStop(i / 5, c)); x.fillStyle = gr; } else x.fillStyle = '#cfd6de';
      x.fillRect(0, 0, 256, 256);
    });
    const discShape = K.circle(0, 0, 60); discShape.holes.push(K.hole(0, 0, 7.5));                   // 120 mm disc, 15 mm centre hole
    const disc = K.slab(discShape, 0, 1.2, { front: cdTop, side: K.mat(0xd0d6dc), back: cdUnder, segs: 96, rim: 'front' });
    disc.geometry.attributes.position && (() => {   // UVs: map the disc 0..1 across its diameter
      const p = disc.geometry.attributes.position, uv = disc.geometry.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 120 + 0.5, p.getY(i) / 120 + 0.5); uv.needsUpdate = true;
    })();
    cd.add(disc); cd.position.z = ZC - 1.6;
    // spindle motor's label, on the can's underside (seen with the back off)
    const mlab = decal(K.rr(0, 0, 13, 7, 0.5), 0, canvasMat(128, 64, x => { x.fillStyle = '#5ce65c'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#222'; x.font = 'bold 18px Arial'; x.fillText('RF-310C', 20, 40); }));
    mlab.rotation.y = Math.PI; mlab.position.set(1, 2, ZB + 2.55); inner.add(mlab);
    // ---- main board (1-682-797-12): outline, copper and through holes from the service manual's printed wiring board
    // (5-3, side B, the pattern side, which faces the back), registered by its chips (IC401 / IC801 / IC601 QFP bodies
    // 10 / 12 / 14 mm and IC603's 17.1 mm SOJ all give 0.0423 mm per pixel) and its spindle notch (circle fit, r 13.2)
    // centred on the turntable; iFixit's inside photo then puts IC603, IC401 and the motor can within 1.6 mm ----
    const BOARD = [[-62.6, -14.8], [-61.8, -26.0], [-61.2, -30.7], [-60.7, -31.4], [-59.3, -31.5], [-58.8, -31.9], [-58.5, -34.6], [-57.9, -35.4], [-57.3, -39.6], [-57.7, -40.9], [-57.0, -45.6], [-56.8, -46.0], [-53.3, -49.6], [-47.6, -54.6], [-45.3, -54.3], [-40.6, -57.9], [-40.1, -59.7], [-34.7, -62.8], [-34.1, -62.5], [-29.9, -64.4], [-29.4, -65.2], [-26.9, -66.2], [-19.8, -68.4], [-12.4, -70.0], [12.4, -70.0], [16.8, -69.2], [24.0, -67.2], [31.2, -64.4], [38.0, -61.0], [38.1, -60.1], [41.2, -58.2], [42.1, -58.5], [45.9, -55.9], [51.6, -51.2], [57.0, -45.8], [57.1, -44.7], [56.5, -44.2], [57.0, -40.5], [57.8, -40.2], [57.9, -39.5], [58.6, -39.3], [59.1, -38.7], [59.4, -29.8], [58.7, -29.3], [57.4, -29.3], [52.0, -23.7], [50.6, -23.6], [50.3, -23.8], [50.2, -24.4], [49.7, -24.5], [49.1, -24.2], [45.8, -24.4], [45.4, -24.4], [45.1, -24.8], [44.5, -24.7], [44.3, -24.2], [43.9, -24.0], [36.2, -24.4], [35.5, -24.5], [35.4, -25.1], [34.8, -25.3], [34.3, -25.0], [31.2, -25.1], [30.5, -25.2], [30.2, -25.6], [29.6, -25.5], [29.4, -25.0], [28.9, -24.7], [25.1, -24.9], [23.7, -24.3], [23.1, -23.6], [22.7, -22.7], [22.4, -17.6], [21.8, -17.0], [21.6, -11.8], [22.1, -11.3], [22.1, -11.1], [21.7, -6.0], [20.7, -6.0], [20.2, -6.5], [13.3, -6.5], [12.8, -6.0], [11.8, -6.0], [10.9, -7.5], [9.4, -9.3], [8.0, -10.5], [6.2, -11.6], [4.7, -12.3], [2.4, -13.0], [-1.1, -13.2], [-4.2, -12.5], [-7.5, -10.9], [-8.5, -10.1], [-10.3, -8.2], [-11.8, -6.0], [-19.3, -6.0], [-19.8, -5.5], [-26.1, -5.5], [-26.6, -6.0], [-28.7, -6.0], [-37.8, 1.9], [-38.6, 2.4], [-39.2, 2.4], [-40.0, 2.1], [-42.4, -0.6], [-43.7, -1.5], [-45.1, -2.0], [-47.4, -2.4], [-49.3, -2.1], [-50.9, -1.3], [-52.2, 0.1], [-53.0, 2.1], [-59.4, 2.1], [-59.9, 1.5], [-59.9, -13.5], [-60.3, -13.9], [-61.9, -14.0], [-62.4, -14.3]];
    const BHOLES = [[-51.94, -16.18, 1.94], [15.66, -16.24, 2.99], [15.0, -57.46, 1.75], [43.49, -33.99, 1.74]];   // the big drilled holes (the middle one takes the right mount's post)
    const boardTex = T['tex/d-e350_board'], MB = K.mapping([0, 0, 1230, 735], [-63, 3, 60, -70.5], boardTex);
    const bs = K.poly(BOARD); BHOLES.forEach(([x, y, r]) => bs.holes.push(K.hole(x, y, r)));
    inner.add(K.slab(bs, ZB0, ZB1, { front: K.mat(0x2f6e3a), back: K.mat(0xffffff, { map: boardTex }), side: pcbEdge, M: MB, segs: 32, rim: 'back' }));
    // parts on the pattern side, hanging towards the back: centres and bodies from the manual's outlines
    const under = (cx, cy, w, h, t, m) => { const b = K.edges(K.box(w, h, t, cx, cy, ZB0 - t / 2, m)); inner.add(b); return b; };
    const merged = (list, m) => {   // many small boxes as one mesh: [[w, h, d, x, y, z], ...]
      const pos = [], nor = [];
      for (const [w, h, d, x, y, z] of list) { const b = new THREE.BoxGeometry(w, h, d).toNonIndexed(); b.translate(x, y, z); pos.push(...b.attributes.position.array); nor.push(...b.attributes.normal.array); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      inner.add(new THREE.Mesh(geo, m));
    };
    const tin = K.mat(0xc9ccca);
    // copper sheet over IC801 (system control) and its neighbours, as iFixit's photo has it: a window over one part and a
    // notch in its edge round Q402
    const sheet = K.poly([[-0.06, -34.8], [-34.6, -32.3], [-44, -32.9], [-44, -50.2], [-38.3, -50.2], [-38.3, -56.4], [-1.3, -56.4], [-1.0, -45.2], [-3.0, -44.3], [-3.7, -41.5], [-3.0, -38.7], [-0.8, -37.8]]);
    const win = new THREE.Path(); [[-41.4, -43.3], [-30.3, -43.3], [-30.3, -37.8], [-41.4, -37.8]].forEach(([x, y], i) => i ? win.lineTo(x, y) : win.moveTo(x, y)); win.closePath(); sheet.holes.push(win);
    inner.add(K.slab(sheet, ZB0 - 0.3, ZB0, { side: copper, back: K.mat(0xd0915f), rim: 'back' }));
    under(-35.8, -40.6, 2.2, 1.4, 0.7, black);                                                   // the part in its window
    under(17.48, -40.58, 10, 10, 1.4, black);                                                    // IC401 BH6571KVT (power / motor driver), 64-pin
    under(-15.31, -16.83, 17.1, 7.6, 3.0, black);                                                // IC603 4M DRAM (ESP memory), SOJ-26
    under(-48.38, -37.37, 7.8, 5.3, 1.6, black);                                                 // IC302 (headphone amplifier), SSOP-24
    under(12.76, -21.34, 3.0, 1.6, 1.1, black); under(20.69, -54.99, 2.9, 1.6, 1.1, black);   // IC405, IC403
    const leads = [];
    for (let i = 0; i < 16; i++) { const o = -3.75 + i * 0.5; leads.push([0.22, 1, 0.15, 17.48 + o, -46.08, ZB0 - 0.1], [0.22, 1, 0.15, 17.48 + o, -35.08, ZB0 - 0.1], [1, 0.22, 0.15, 11.98, -40.58 + o, ZB0 - 0.1], [1, 0.22, 0.15, 22.98, -40.58 + o, ZB0 - 0.1]); }
    for (let i = 0; i < 13; i++) { const x = -22.93 + i * 1.27; leads.push([0.45, 0.7, 1.6, x, -20.88, ZB0 - 0.8], [0.45, 0.7, 1.6, x, -12.78, ZB0 - 0.8]); }
    for (let i = 0; i < 12; i++) { const x = -51.955 + i * 0.65; leads.push([0.3, 1, 0.15, x, -40.52, ZB0 - 0.1], [0.3, 1, 0.15, x, -34.22, ZB0 - 0.1]); }
    merged(leads, tin);
    for (const [x, y] of [[-39.77, -23.37], [-55.06, -43.43], [-3.7, -26.95], [19.11, -25.07], [3.86, -49.49], [26.54, -55.08]]) under(x, y, 3.2, 1.6, 1.4, K.mat(0x2a2522));   // tantalum capacitors (C301, C305, C629, C415, C408, C402)
    for (const [x, y] of [[-0.25, -39.13], [-34.03, -11.03]]) under(x, y, 2.9, 1.5, 1, black);   // Q402, Q601
    const solder = [];
    for (let i = 0; i < 18; i++) solder.push([-15.23 + i * 1.7988, -67.01, 0.62]);              // LCD801's 18 pins (the display sits on the other side)
    [[-61.97, -14.59], [-60.56, -18.31], [-60.03, -25.78], [-59.57, -28.04], [-56.18, -27.83]].forEach(([x, y]) => solder.push([x, y, 0.85]));   // phones jack J301
    solder.push([57.32, -35.64, 0.85]);                                                          // DC IN jack J401
    for (const [x, y, r] of solder) inner.add(K.cylZ(x, y, ZB0 - 0.7, ZB0, r, { side: tin, back: tin, segs: 10 }));
    // posts up from the back shell to the mechanism's mounts: the right one through the board's 6 mm hole, the lower one
    // through its notch
    for (const [x, y, r] of [[15.66, -16.24, 2.4], [...sp(EARS[2][0], EARS[2][1]), 2.6], [...sp(EARS[0][0], EARS[0][1]), 2.4]]) back.add(K.cylZ(x, y, ZB + 1.2, CH0 - 0.4, r, { side: rimM, front: rimM, rim: 'front' }));
    // ---- battery well on the right, its front wall on the board's cut-out; terminals BT402 (B-) and BT400 (B+) at
    // x 32.8 / 47.8 fix the cells' centres and polarity ----
    const WX = 40.5, WY = 4.6, well = K.rr(WX, WY, 33, 55.8, 2), wh = new THREE.Path(); K.rr(WX, WY, 31, 53.8, 1.5).getPoints(4).forEach((q, i) => i ? wh.lineTo(q.x, q.y) : wh.moveTo(q.x, q.y)); well.holes.push(wh);
    inner.add(K.slab(well, ZB + 1.3, ZC - 3.7, { side: K.mat(0x9a9ea3), rim: 'back' }));
    for (const [x, dir] of [[32.8, 1], [47.8, -1]]) {   // - / + at the front
      const y0 = -20.6, y1 = 29.9;
      inner.add(K.cylY(x, -4.3, y0, y1, 6.9, { side: cellBlue, front: steel, back: steel, rim: 'both' }));
      inner.add(K.cylY(x, -4.3, dir > 0 ? y1 - 15 : y0, dir > 0 ? y1 : y0 + 15, 6.95, { side: brass }));
      inner.add(K.cylY(x, -4.3, dir > 0 ? y1 : y0 - 1.3, dir > 0 ? y1 + 1.3 : y0, 2.6, { side: steel }));
      inner.add(K.edges(K.box(8, 0.3, 8, x, -22.05, -4.3, steel)));                              // front contact
    }
    inner.add(K.edges(K.box(24, 0.3, 8, 40.3, 31.35, -4.3, steel)));                              // link contact at the back

    // headphones: band arching over the player, sliders, black drivers with orange foam pads
    const hp = new THREE.Group(); hp.position.z = -2; g.add(hp);
    const bandM = K.mat(0xe4e6e7), slider = K.mat(0x8a8e92), pad = K.mat(0xf5a100), padIn = K.mat(0xd97d0b);
    const BR = M.sx(600);
    hp.add(K.strip(K.arc(0, 0, BR, 200, -20, 64), 2.2, 6, bandM, { segs: 160 }));   // 6 mm wide front to back, 2.2 thick (flat curve: t is the z extent)
    for (const s of [-1, 1]) {
      hp.add(K.strip(K.arc(0, 0, BR - 1, s < 0 ? 196 : -16, s < 0 ? 155 : 25, 12), 4, 7.5, slider, { segs: 32 }));
      const [px, py] = M.mm(s < 0 ? 168 : 1308, 1040), yTop = BR * Math.sin(-20 * Math.PI / 180), xArm = s * BR * Math.cos(20 * Math.PI / 180);
      hp.add(K.tube([[xArm, yTop, 0], [xArm + s * 2, (yTop + py) / 2, 0], [px + s * 2, py + 12, 0]], 2.4, slider, { segs: 16 }));   // arm down to the driver
      hp.add(K.cylX(py, 0, Math.min(px, px + s * 5), Math.max(px, px + s * 5), 15, { side: dark, bevel: 1.5, rim: 'both' }));
      hp.add(K.cylX(py, 0, Math.min(px, px - s * 13), Math.max(px, px - s * 13), 22, { side: pad, front: s < 0 ? padIn : pad, back: s < 0 ? pad : padIn, bevel: 4, rim: s < 0 ? 'front' : 'back' }));
    }
    const hpOn = !(P.q && P.q.get('hp') === '0');

    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    g.userData.setExplode = t => {
      const a = sm(t / 0.35), c = sm((t - 0.3) / 0.25);
      lid.rotation.x = -1.75 * a;                 // lid swings up on its far-edge hinge
      // the CD lifts 10 mm off the turntable, then tilts up about its near edge E as E travels back to the hinge, ending
      // label out and leaning 2 mm off the open lid. (It used to turn about its centre, which swung the near edge ~6 mm down
      // through the deck and chassis mid-lift.) Far edge stays >= 3.7 mm in front of the lid all the way.
      const la = Math.min(1, c / 0.3), u = Math.max(0, (c - 0.3) / 0.7), ph = 1.39 * (1 - (1 - u) ** 2);
      const ey = -60 + 122.4 * u, ez = ZC - 1.6 + 10 * la - (ZC - 1.6 + 10 - 13.2) * u + 10 * Math.sin(Math.PI * u);
      cd.position.set(0, ey + 60 * Math.cos(ph), ez + 60 * Math.sin(ph)); cd.rotation.x = ph;
      // back shell opens flat to the left (as seen from the front), swinging out behind the player: -PI ends in the same
      // place but sweeps the shell forward through the body on the way
      // It first drops 7 mm straight off (its posts slide out of the board's hole and notch; swinging at once brought the
      // walls' top edge, which rises 6 mm above the hinge, inwards through the board's left edge)
      const bl = sm((t - 0.5) / 0.12), br = sm((t - 0.58) / 0.42);
      cover.position.z = ZB - 7 * bl; cover.rotation.y = Math.PI * br;
      hp.visible = hpOn && t < 0.01;              // headphones step aside while it is open
    };
    g.userData.setExplode(0);
    return g;
  },
};
