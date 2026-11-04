// kit.js — shared helpers for the product models (products/*.js).
// Units are millimetres: x right, y up, z towards the viewer (the front face of a product faces +z).
// The illustration sticker (tex/<id>.png) is used as artwork: a mapping ties sticker pixels to model millimetres, so any
// front-facing cap can show the drawn face (labels, dials, logos) while the geometry around it is real.
export function makeKit(THREE, { art = null } = {}) {
  const K = { THREE };
  // surfaces sit polygon-offset behind the 1 px feature lines drawn on their edges; 1 unit left those lines dashed where a
  // face is seen nearly face-on, 4 keep them whole (a few millionths of a unit of depth: nothing behind shows through)
  K.mat = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 4, ...extra });
  K.art = art ? K.mat(0xffffff, { map: art }) : null;
  K.lineMat = new THREE.LineBasicMaterial({ color: 0x211714 });   // crisp 1 px feature lines, as on the CHF 90

  // sticker pixel rect [px0, py0, px1, py1] (y down) <-> model rect [x0, yTop, x1, yBottom] (mm, y up)
  K.mapping = ([px0, py0, px1, py1], [x0, y0, x1, y1], tex = art) => {
    const [W, H] = tex.userData.size || [tex.image.width, tex.image.height], fx = (x1 - x0) / (px1 - px0), fy = (y1 - y0) / (py1 - py0);
    return {
      mm: (px, py) => [x0 + (px - px0) * fx, y0 + (py - py0) * fy],
      sx: p => p * Math.abs(fx), sy: p => p * Math.abs(fy),          // pixel lengths -> mm
      uv: (x, y) => [(px0 + (x - x0) / fx) / W, 1 - (py0 + (y - y0) / fy) / H],
    };
  };
  K.applyUV = (geo, M, ox = 0, oy = 0) => {   // planar projection of the sticker along z
    const p = geo.attributes.position;
    let uv = geo.attributes.uv;
    if (!uv) { uv = new THREE.Float32BufferAttribute(new Float32Array(p.count * 2), 2); geo.setAttribute('uv', uv); }
    for (let i = 0; i < p.count; i++) { const [u, v] = M.uv(p.getX(i) + ox, p.getY(i) + oy); uv.setXY(i, u, v); }
    uv.needsUpdate = true;
    return geo;
  };

  // ---------- 2D shapes (mm) ----------
  K.rr = (cx, cy, w, h, r) => {   // rounded rectangle; r = number or [tl, tr, br, bl]
    const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r], x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
    const s = new THREE.Shape(), H = Math.PI / 2;
    s.moveTo(x0 + bl, y0); s.lineTo(x1 - br, y0); if (br) s.absarc(x1 - br, y0 + br, br, -H, 0, false);
    s.lineTo(x1, y1 - tr); if (tr) s.absarc(x1 - tr, y1 - tr, tr, 0, H, false);
    s.lineTo(x0 + tl, y1); if (tl) s.absarc(x0 + tl, y1 - tl, tl, H, 2 * H, false);
    s.lineTo(x0, y0 + bl); if (bl) s.absarc(x0 + bl, y0 + bl, bl, 2 * H, 3 * H, false);
    return s;
  };
  K.circle = (cx, cy, r) => new THREE.Shape().absarc(cx, cy, r, 0, 2 * Math.PI, false);
  K.hole = (cx, cy, r) => new THREE.Path().absarc(cx, cy, r, 0, 2 * Math.PI, true);
  K.ellipse = (cx, cy, rx, ry, rot = 0) => new THREE.Shape().absellipse(cx, cy, rx, ry, 0, 2 * Math.PI, false, rot);
  K.poly = pts => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  K.gear = (cx, cy, r0, r1, teeth) => {   // ribbed knob outline: alternating r0 / r1
    const pts = [];
    for (let i = 0; i < teeth * 2; i++) { const a = i / (teeth * 2) * 2 * Math.PI, r = i % 2 ? r0 : r1; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return K.poly(pts);
  };

  // ---------- solids ----------
  // three r170's ExtrudeGeometry cracks open along a side where an outline has two points ~1e-16 mm apart (its bevel
  // vector turns NaN there), and K.rr's zero-length straights and arc joins make such points: K.clean rebuilds an
  // outline and its holes from their points with near-duplicates dropped (same tessellation, all straight segments).
  // It also splits straight runs longer than 10 mm: a bevel or wall strip that is one quad along a 100 mm edge is two
  // needle-thin triangles, and SwiftShader (the headless renderer of the GIFs) interpolates their depth badly, leaving
  // evenly spaced wrong pixels that the ink pass turns into specks
  const SEG = 10;
  const dedupe = pts => {
    const out = [];
    for (const p of pts) if (!out.length || out[out.length - 1].distanceTo(p) > 1e-6) out.push(p);
    while (out.length > 3 && out[0].distanceTo(out[out.length - 1]) <= 1e-6) out.pop();
    const res = [];
    out.forEach((a, i) => {
      const b = out[(i + 1) % out.length], n = Math.ceil(a.distanceTo(b) / SEG);
      res.push(a); for (let k = 1; k < n; k++) res.push(a.clone().lerp(b, k / n));
    });
    return res;
  };
  K.clean = (shape, segs = 24) => {
    const { shape: o, holes } = shape.extractPoints(segs), s = new THREE.Shape(dedupe(o));
    s.holes = holes.map(h => new THREE.Path(dedupe(h)));
    return s;
  };
  // shape extruded from z0 to z1, optional round-over on both faces; materials: front cap / sides / back cap.
  // Pass M (a mapping) to put the sticker on the front cap.
  // rim: 'front' | 'back' | 'both' draws the outline (and holes) where the bevel starts, a clean line around the part.
  // artEdge: the front round-over takes the front material too (the sticker, planar-mapped), not the side colour. For a
  // part whose outline runs down the middle of a drawn ink line: the round-over then shows the inner half of that line
  // instead of a light ring laid over it.
  K.slab = (shape, z0, z1, { front, side, back = side, bevel = 0, M = null, segs = 24, bevelSegs = 3, rim = null, artEdge = false } = {}) => {
    // a bevel too big for the thickness is clamped so a straight band of at least 0.2 mm (or half a thin slab) is left:
    // a near-zero band (the old d/2 - 0.001) drew wrong depths that the ink pass turned into specks
    const d = z1 - z0, b = Math.max(0, Math.min(bevel, d / 2 - Math.min(0.1, d / 4)));
    shape = K.clean(shape, segs);
    const g = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * b, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: bevelSegs, curveSegments: segs });
    g.translate(0, 0, z0 + b);
    const [lids, sides] = g.groups;
    g.clearGroups(); g.addGroup(lids.start, lids.count / 2, 2); g.addGroup(lids.start + lids.count / 2, lids.count / 2, 0);
    if (artEdge && b > 0) {   // non-indexed: move the front round-over's triangles to the head of the sides range
      const pos = g.attributes.position, s0 = sides.start, zb = z1 - b - 1e-4, lead = [], rest = [];
      for (let t = s0; t < s0 + sides.count; t += 3) (Math.min(pos.getZ(t), pos.getZ(t + 1), pos.getZ(t + 2)) >= zb ? lead : rest).push(t);
      for (const a of Object.values(g.attributes)) {
        const k = a.itemSize, src = a.array.slice(s0 * k, (s0 + sides.count) * k); let o = s0 * k;
        for (const t of [...lead, ...rest]) { a.array.set(src.subarray((t - s0) * k, (t - s0 + 3) * k), o); o += 3 * k; }
      }
      g.addGroup(s0, lead.length * 3, 0); g.addGroup(s0 + lead.length * 3, rest.length * 3, 1);
    } else g.addGroup(sides.start, sides.count, 1);
    if (M) K.applyUV(g, M);
    const mesh = new THREE.Mesh(g, [front || side, side, back]);
    if (rim) {
      const loops = [shape, ...shape.holes].map(c => c.getPoints(segs));
      const at = z => loops.forEach(pts => mesh.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, z))), K.lineMat)));
      if (rim !== 'back') at(z1 - b);
      if (rim !== 'front') at(z0 + b);
    }
    return mesh;
  };
  K.edges = mesh => { mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), K.lineMat)); return mesh; };   // box-like parts
  K.face = (shape, z, M, segs = 32) => {   // flat decal facing +z
    const g = new THREE.ShapeGeometry(shape, segs); g.translate(0, 0, z); K.applyUV(g, M);
    return new THREE.Mesh(g, K.art);
  };
  K.box = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); return b; };
  K.cylZ = (cx, cy, z0, z1, r, opts = {}) => K.slab(K.circle(cx, cy, r), z0, z1, { segs: 40, ...opts });
  K.cylX = (cy, cz, x0, x1, r, opts = {}) => { const m = K.cylZ(0, 0, x0, x1, r, opts); m.rotation.y = Math.PI / 2; m.position.set(0, cy, cz); return m; };   // front cap faces +x
  K.cylY = (cx, cz, y0, y1, r, opts = {}) => { const m = K.cylZ(0, 0, y0, y1, r, opts); m.rotation.x = -Math.PI / 2; m.position.set(cx, 0, cz); return m; };  // front cap faces +y
  K.dome = (shape, z, h, M, rings = 10, segs = 64) => {   // bulged cap over a 2D outline (CRT glass), sticker-mapped
    const outline = shape.getPoints(segs); if (outline[0].equals(outline[outline.length - 1])) outline.pop();
    const c = outline.reduce((a, p) => a.add(p), new THREE.Vector2()).multiplyScalar(1 / outline.length), n = outline.length, pos = [], idx = [];
    for (let k = 0; k <= rings; k++) {
      const t = 1 - k / rings;
      for (const p of outline) pos.push(c.x + (p.x - c.x) * t, c.y + (p.y - c.y) * t, z + h * (1 - t * t));
    }
    for (let k = 0; k < rings; k++) for (let i = 0; i < n; i++) {
      const a = k * n + i, b = k * n + (i + 1) % n, cc = (k + 1) * n + (i + 1) % n, d = (k + 1) * n + i;
      idx.push(a, b, cc, a, cc, d);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    if (THREE.ShapeUtils.isClockWise(outline)) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } }
    g.computeVertexNormals(); K.applyUV(g, M);
    return new THREE.Mesh(g, K.art);
  };
  K.lathe = (profile, m, segs = 48) => {   // profile [[r, z], ...] revolved around the z axis
    const g = new THREE.LatheGeometry(profile.map(([r, z]) => new THREE.Vector2(r, z)), segs); g.rotateX(Math.PI / 2);
    return new THREE.Mesh(g, m);
  };
  K.tube = (pts, r, m, { segs = 64, radial = 12, closed = false } = {}) =>
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed), segs, r, radial, closed), m);
  // flat band along a path: t along the path's normal, w along its binormal. For a flat curve in the x-y plane the
  // normal is z, so t is the band's width front to back (z) and w its thickness in the plane of the curve
  K.strip = (pts, w, t, m, { segs = 96, round = 0 } = {}) => {
    const shape = K.clean(round ? K.rr(0, 0, t, w, Math.min(round, t / 2 - 1e-3, w / 2 - 1e-3)) : K.rr(0, 0, t, w, 0), 12);
    const g = new THREE.ExtrudeGeometry(shape, { steps: segs, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))) });
    return new THREE.Mesh(g, m);
  };
  K.arc = (cx, cy, r, a0, a1, n = 24, z = 0) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a), z]; });
  return K;
}
