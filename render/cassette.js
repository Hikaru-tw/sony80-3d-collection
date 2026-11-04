// cassette.js — procedural Sony CHF 90 compact cassette in the illustration's flat inked style.
// Shared by model.html (headless render pipeline) and viewer.html (interactive viewer).
// v4: built in real millimetres. Footprint 100.4 x 63.8 mm (IEC 60094-7); feature positions measured on straight-on
// photos of a 1978 CHF 90 (reference image/real-product). Layout origin = top-left corner of side A, y down (towards
// the head openings); world units: cassette height = 1.0. Shell: 11 mm body with the raised 12 mm trapezoid around the
// head openings, rounded outer edges, two hollow half-shells (each with half the edge wall) around a real interior:
// hubs with drive teeth, tape packs, tape path over the guide rollers, pressure pad on its leaf spring inside the
// shield, slip sheets, screw posts, write-protect tabs.
export function buildCassette(THREE, opts) {
  const { labelA, labelB, edges = true, depth = 0.19, shell = 'tan' } = opts;
  const L = 100.4, H = 63.8, S = 1 / H;                          // footprint (mm); mm -> world
  const HB = depth / S / 2, HS = HB - 0.5;                       // half thickness: head-area plateau (12 mm) / body (11 mm)
  const TP = 1.2, TW = 1.2, RB = 0.6, RC = 4;                    // face plate, edge wall, edge round-over, corner radius
  const ZC = HS - TP;                                            // inner ceiling = interior half-height
  const D2R = Math.PI / 180;
  const X = x => (x - L / 2) * S, Y = y => (H / 2 - y) * S;
  const V = (x, y, z) => [X(x), Y(y), z * S];                    // mm (y down) -> world point
  const v2 = (x, y) => new THREE.Vector2(X(x), Y(y));

  // ---------- layout (mm; symmetric about x = 50.2 where it matters so the shell flips onto side B) ----------
  const LABEL = [5.8, 6.2, 94.6, 45.4];                          // paper label; its artwork window lines up with WIN
  const WIN = [15.9, 21.3, 84.7, 36.0];                          // window cut in the label
  const WIN_CUT = [15.5, 20.9, 85.1, 36.4];                      // matching cut in the face plate (holds the smoked pane)
  const HUB_Y = 28.65, HUBS = [[28.95, HUB_Y], [71.45, HUB_Y]];  // hub centres, 42.5 mm apart
  const HUB_HOLE = 6.3;                                          // hub opening in the window
  const CWIN = [37.4, HUB_Y - 6.4, 63.0, HUB_Y + 6.4], CWIN_SAG = 1.4;   // centre tape window, concave ends
  const SCREWS = [[3.5, 3.5], [96.9, 3.5], [3.5, 60.3], [96.9, 60.3], [50.2, 53.4]];   // heads on A, posts on B
  const CAPSTAN = [[25.7, 60.2], [74.7, 60.2]], CAP_R = 2.2;     // capstan holes
  const LOCATE = [[36.5, 58.4], [63.9, 58.4]], LOC_A = 1.9;      // square deck-locating holes (half side)
  const TRAP = { top: 48.4, x0: 18.6, x1: 81.8, b0: 16.4, b1: 84.0, ramp: 0.8 };   // raised head area: top edge, top & edge corners
  const BOTTOM_OPEN = [[19.0, 31.0], [33.4, 37.4], [41.2, 59.2], [63.0, 67.0], [69.4, 81.4]];   // pinch roller, erase, head, erase, pinch roller
  const TABS = [[7.7, 13.9], [86.5, 92.7]];                      // write-protect tab slots, top edge
  const ROLLERS = [[10.2, 57.95], [90.2, 57.95]];                // guide-roller pins, measured through the shell on the side A photo
  const ROLLER = { flange: 4.0, waist: 3.55, len: 8.0 };         // the white rollers read ~8 mm across; the waist puts the tape at y 61.6
  const GUIDE_PINS = [[40.0, 60.6], [60.4, 60.6]];
  const TAPE_W = 3.81, TAPE_T = 0.2, HUB_R = 10.8, PACK_R = [25.0, 11.6];   // C90 pack is ~25 mm radius when full
  const yE = H - RB, slantX = (xt, xb, y) => xt + (xb - xt) * (y - TRAP.top) / (H - TRAP.top);
  const E0 = slantX(TRAP.x0, TRAP.b0, yE), E1 = slantX(TRAP.x1, TRAP.b1, yE);   // plateau extent where it meets the edge round-over

  const C = {
    tan: 0xbeae9a, tanLight: 0xe8d7b9, dark: 0x1d1210, outline: 0x211714, smoke: 0x2e2725, rim: 0xc9cbcc,
    white: 0xffffff, screw: 0x2c2523, screwX: 0x9a9a9a, tape: 0x3a2a24, felt: 0xf1e8d8, shield: 0x9c9c9c,
    spring: 0xb08d57, roller: 0xf4efe6, pin: 0x6b6158, sheet: 0x8d8780, pane: 0xfff8ec, mark: 0x3a3330,
    smokeShell: 0x40352f,                                        // the real 1978 shell: smoked translucent plastic
  };
  const shellMats = [];
  const mat = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...extra });
  const smat = (color, extra = {}) => { const m = mat(color, extra); m.userData.base = { transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite }; shellMats.push(m); return m; };
  const lineMat = new THREE.LineBasicMaterial({ color: C.outline });
  const bodyMats = [], faceMats = [];                            // shell plastic (body / outer faces): tan or smoked
  let gridTex = null;
  function shellGrid() {   // the fine moulded grid on the real shell's faces (1.1 mm pitch)
    if (gridTex || typeof document === 'undefined') return gridTex;
    const c = document.createElement('canvas'); c.width = c.height = 16;
    const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, 16, 3); x.fillRect(0, 0, 3, 16);
    gridTex = new THREE.CanvasTexture(c); gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping; gridTex.repeat.set(1 / S / 1.1, 1 / S / 1.1);
    gridTex.colorSpace = THREE.SRGBColorSpace; gridTex.anisotropy = 4;
    return gridTex;
  }

  // ---------- geometry helpers ----------
  function Geo() {   // non-indexed triangles with explicit normals; quad winding follows the normals
    const P = [], N = [];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const unit = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const put = (vs, ns) => vs.forEach((v, i) => { P.push(...v); N.push(...ns[i]); });
    return {
      quad(a, b, c, d, na, nb = na, nc = nb, nd = na) {
        const h = [na[0] + nb[0] + nc[0] + nd[0], na[1] + nb[1] + nc[1] + nd[1], na[2] + nb[2] + nc[2] + nd[2]];
        if (dot(cross(sub(c, a), sub(d, b)), h) >= 0) put([a, b, c, a, c, d], [na, nb, nc, na, nc, nd]);
        else put([a, c, b, a, d, c], [na, nc, nb, na, nd, nc]);
      },
      flat(pts, hint) {   // planar polygon (tri or quad) with its geometric normal, oriented towards `hint`
        let n = unit(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
        if (dot(n, hint) < 0) { n = n.map(v => -v); pts = pts.slice().reverse(); }
        put([pts[0], pts[1], pts[2]], [n, n, n]);
        if (pts.length === 4) put([pts[0], pts[2], pts[3]], [n, n, n]);
      },
      mesh(m) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); return new THREE.Mesh(g, m); },
    };
  }
  function Lines() {
    const a = [];
    return {
      seg(p, q) { a.push(...p, ...q); },
      loop(pts, z) { for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a.push(p.x, p.y, z * S, q.x, q.y, z * S); } },
      addTo(g) { if (!edges || !a.length) return; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); g.add(new THREE.LineSegments(geo, lineMat)); },
    };
  }
  // contours: arrays of world-space Vector2, counter-clockwise in world
  function rrC(x0, y0, x1, y1, r, seg = 6) {
    const pts = [];
    for (const [cx, cy, a0] of [[x1 - r, y1 - r, -90], [x1 - r, y0 + r, 0], [x0 + r, y0 + r, 90], [x0 + r, y1 - r, 180]])
      for (let i = 0; i <= seg; i++) { const a = (a0 + 90 * i / seg) * D2R; pts.push(v2(cx + r * Math.cos(a), cy - r * Math.sin(a))); }
    return pts;
  }
  const circC = (cx, cy, r, seg = 40) => Array.from({ length: seg }, (_, i) => { const a = i / seg * 2 * Math.PI; return v2(cx + r * Math.cos(a), cy - r * Math.sin(a)); });
  function windowC([x0, y0, x1, y1], sag, seg = 10) {   // rectangle whose short ends bow inwards
    const pts = [v2(x0, y1)];
    for (let i = 0; i <= seg; i++) { const t = i / seg; pts.push(v2(x1 - sag * Math.sin(Math.PI * t), y1 + (y0 - y1) * t)); }
    for (let i = 0; i <= seg; i++) { const t = i / seg; if (i) pts.push(v2(x0 + sag * Math.sin(Math.PI * t), y0 + (y1 - y0) * t)); else pts.push(v2(x0, y0)); }
    pts.pop();
    return pts;
  }
  function shapeOf(outer, holes = []) { const s = new THREE.Shape(outer); holes.forEach(h => s.holes.push(new THREE.Path(h))); return s; }
  function cap(outer, holes, z, m, up = true) {   // flat face at height z (mm), facing +z or -z
    const g = new THREE.ShapeGeometry(shapeOf(outer, holes)); g.translate(0, 0, z * S);
    if (!up) {
      const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
      const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 0, -1);
    }
    return new THREE.Mesh(g, m);
  }
  function extrude(shape, z0, z1, m, segs = 12) {
    const g = new THREE.ExtrudeGeometry(shape, { depth: (z1 - z0) * S, bevelEnabled: false, curveSegments: segs });
    g.translate(0, 0, z0 * S);
    return new THREE.Mesh(g, m);
  }
  function holeWall(geo, pts, z0, z1) {   // vertical wall around a hole contour, normals facing into the hole
    const n = pts.length; let area = 0;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a.x * b.y - b.x * a.y; }
    const sg = area > 0 ? 1 : -1, en = [];
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], l = Math.hypot(b.x - a.x, b.y - a.y) || 1; en.push([-(b.y - a.y) / l * sg, (b.x - a.x) / l * sg, 0]); }
    const blend = (e, f) => { if (e[0] * f[0] + e[1] * f[1] < 0.8) return e; const x = e[0] + f[0], y = e[1] + f[1], l = Math.hypot(x, y); return [x / l, y / l, 0]; };
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, a = pts[i], b = pts[j], na = blend(en[i], en[(i + n - 1) % n]), nb = blend(en[i], en[j]);
      geo.quad([a.x, a.y, z0 * S], [b.x, b.y, z0 * S], [b.x, b.y, z1 * S], [a.x, a.y, z1 * S], na, nb, nb, na);
    }
  }
  function topEdges(mesh, zmin, angle = 40) {   // outline lines on the plane z >= zmin (world)
    const eg = new THREE.EdgesGeometry(mesh.geometry, angle), p = eg.attributes.position.array, keep = [];
    for (let i = 0; i < p.length; i += 6) if (p[i + 2] >= zmin && p[i + 5] >= zmin) keep.push(...p.slice(i, i + 6));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3));
    return new THREE.LineSegments(g, lineMat);
  }
  function remapUV(geo, [x0, y0, x1, y1]) {   // cap UVs from world x,y -> texture rect
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - X(x0)) / (X(x1) - X(x0)), (pos.getY(i) - Y(y1)) / (Y(y0) - Y(y1)));
    uv.needsUpdate = true;
  }
  function box(w, h, d, cx, cy, cz, m) { const b = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), m); b.position.set(...V(cx, cy, cz)); return b; }
  function bar([x0, y0], [x1, y1], t, d, m, z = 0) {   // flat strip from p0 to p1 (mm), t thick, d tall in z
    const len = Math.hypot(x1 - x0, y1 - y0), b = box(len, t, d, (x0 + x1) / 2, (y0 + y1) / 2, z, m);
    b.rotation.z = Math.atan2(-(y1 - y0), x1 - x0); return b;
  }
  function cyl(r, h, cx, cy, cz, m, segs = 32) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, h * S, segs), m); c.rotation.x = Math.PI / 2; c.position.set(...V(cx, cy, cz)); return c; }
  const pol = (r, a) => new THREE.Vector2(r * S * Math.cos(a), r * S * Math.sin(a));
  const ringShape = (r0, r1, seg = 48) => { const s = new THREE.Shape(); s.absarc(0, 0, r1 * S, 0, 2 * Math.PI, false); s.holes.push(new THREE.Path().absarc(0, 0, r0 * S, 0, 2 * Math.PI, true)); return s; };

  // ---------- shell outline samples (CCW in world), straight sides split where openings / the plateau start ----------
  const OUT = (() => {
    const s = [], seg = 12, add = (x, y, nx, ny, side) => s.push({ x, y, nx, ny, side });
    const arc = (cx, cy, a0) => { for (let i = 1; i < seg; i++) { const a = (a0 + 90 * i / seg) * D2R; add(cx + RC * Math.cos(a), cy - RC * Math.sin(a), Math.cos(a), Math.sin(a), 'corner'); } };
    [RC, ...BOTTOM_OPEN.flat(), E0, E1, L - RC].sort((a, b) => a - b).forEach(x => add(x, H, 0, -1, 'bottom'));
    arc(L - RC, H - RC, -90);
    add(L, H - RC, 1, 0, 'right'); add(L, RC, 1, 0, 'right');
    arc(L - RC, RC, 0);
    [RC, ...TABS.flat(), L - RC].sort((a, b) => b - a).forEach(x => add(x, 0, 0, 1, 'top'));
    arc(RC, RC, 90);
    add(0, RC, -1, 0, 'left'); add(0, H - RC, -1, 0, 'left');
    arc(RC, H - RC, 180);
    return s;
  })();
  function segInfo(a, b) {
    const m = (a.x + b.x) / 2, inside = list => list.some(([o0, o1]) => m > o0 && m < o1);
    if (a.side === 'bottom' && b.side === 'bottom') return { h: m > E0 && m < E1 ? HB : HS, open: inside(BOTTOM_OPEN) };
    if (a.side === 'top' && b.side === 'top') return { h: HS, open: inside(TABS) };
    return { h: HS, open: false };
  }
  const SEG = OUT.map((a, i) => segInfo(a, OUT[(i + 1) % OUT.length]));
  const AN = 4, C45 = Math.SQRT1_2;   // round-over segments
  const outerProfile = (h, z0) => {   // [inward d, z, outward weight, up weight]
    // every strip carries the breakpoints its neighbours use (ZC where an opening starts, HS - RB where the plateau
    // starts), so adjacent strips meet vertex to vertex: T-junctions there left pixel cracks along the edge wall
    const zs = [z0, ...[ZC, HS - RB].filter(z => z > z0 + 1e-6 && z < h - RB - 1e-6), h - RB];
    const p = zs.map(z => [0, z, 1, 0]);
    for (let k = 1; k <= AN; k++) { const f = k / AN * Math.PI / 2; p.push([RB - RB * Math.cos(f), h - RB + RB * Math.sin(f), Math.cos(f), Math.sin(f)]); }
    return p;
  };
  const Pt = (s, d, z) => V(s.x - d * s.nx, s.y + d * s.ny, z);
  const Nm = (s, p) => [s.nx * p[2], s.ny * p[2], p[3]];

  // ---------- one half-shell, built with its face at +z (half B is turned over afterwards) ----------
  function buildHalf(side, labelTex) {
    const A = side === 'A', g = new THREE.Group(), geo = Geo(), ln = Lines(), n = OUT.length;
    const m = smat(C.tan), mf = smat(C.tan); bodyMats.push(m); faceMats.push(mf);   // mf: outer faces (take the grid texture)
    // edge wall + rounded face edge, swept along the outline; openings keep only the face-plate lip
    for (let i = 0; i < n; i++) {
      const a = OUT[i], b = OUT[(i + 1) % n], { h, open } = SEG[i], prof = outerProfile(h, open ? ZC : 0);
      for (let j = 0; j < prof.length - 1; j++) { const p = prof[j], q = prof[j + 1]; geo.quad(Pt(a, p[0], p[1]), Pt(b, p[0], p[1]), Pt(b, q[0], q[1]), Pt(a, q[0], q[1]), Nm(a, p), Nm(b, p), Nm(b, q), Nm(a, q)); }
      if (open) { geo.quad(Pt(a, 0, ZC), Pt(b, 0, ZC), Pt(b, TW, ZC), Pt(a, TW, ZC), [0, 0, -1]); ln.seg(Pt(a, 0, ZC), Pt(b, 0, ZC)); }
      else {
        const ia = [-a.nx, -a.ny, 0], ib = [-b.nx, -b.ny, 0];
        geo.quad(Pt(a, TW, 0), Pt(b, TW, 0), Pt(b, TW, ZC), Pt(a, TW, ZC), ia, ib, ib, ia);
        geo.quad(Pt(a, 0, 0), Pt(b, 0, 0), Pt(b, TW, 0), Pt(a, TW, 0), [0, 0, -1]);
        ln.seg(Pt(a, 0, 0), Pt(b, 0, 0));                                      // half-shell seam
      }
      const dz = RB * (1 - C45);
      ln.seg(Pt(a, dz, h - dz), Pt(b, dz, h - dz));                            // face outline on the round-over
      const nx = SEG[(i + 1) % n], t = [-b.ny, b.nx, 0], back = t.map(v => -v);
      if (open !== nx.open) { geo.quad(Pt(b, 0, 0), Pt(b, TW, 0), Pt(b, TW, ZC), Pt(b, 0, ZC), nx.open ? t : back); ln.seg(Pt(b, 0, 0), Pt(b, 0, ZC)); }
      if (h !== nx.h) {   // end face of the raised round-over: the band between the two profiles, arc point to arc point
        const lo = outerProfile(HS, 0).slice(-AN - 1), hi = outerProfile(HB, 0).slice(-AN - 1), fn = nx.h > h ? back : t;
        for (let k = 0; k < AN; k++) geo.quad(Pt(b, lo[k][0], lo[k][1]), Pt(b, lo[k + 1][0], lo[k + 1][1]), Pt(b, hi[k + 1][0], hi[k + 1][1]), Pt(b, hi[k][0], hi[k][1]), fn);
        ln.seg(Pt(b, dz, HS - dz), Pt(b, dz, HB - dz));
      }
    }
    // holes through the plate (and the plateau); blind recesses for the screw heads (A) / screw bosses (B)
    const faceHoles = [], ceilHoles = [], trapHoles = [];
    const through = (c, top, inTrap) => { faceHoles.push(c); ceilHoles.push(c); if (inTrap) trapHoles.push(c); holeWall(geo, c, ZC, top); ln.loop(c, top); };
    const win = rrC(...WIN_CUT, 1.6);
    through(win, HS, false);
    CAPSTAN.forEach(([x, y]) => through(circC(x, y, CAP_R, 28), HB, true));
    LOCATE.forEach(([x, y]) => through(rrC(x - LOC_A, y - LOC_A, x + LOC_A, y + LOC_A, 0.6, 3), HB, true));
    const blind = (c, top, dep, floorMat, inTrap) => { faceHoles.push(c); if (inTrap) trapHoles.push(c); holeWall(geo, c, top - dep, top); ln.loop(c, top); g.add(cap(c, [], top - dep, floorMat)); };
    if (A) {                                                                  // 5 cross-head screws in counterbores
      const headM = smat(C.screw), slotM = smat(C.screwX);
      SCREWS.forEach(([x, y], i) => {
        const top = i < 4 ? HS : HB, fl = top - 0.75;
        blind(circC(x, y, 1.9, 28), top, 0.75, m, i === 4);
        g.add(cyl(1.7, 0.5, x, y, fl + 0.25, headM, 24));
        for (const rot of [0, Math.PI / 2]) { const c = box(2.3, 0.42, 0.04, x, y, fl + 0.52, slotM); c.rotation.z = rot; g.add(c); }
      });
    } else {   // the screw bosses show through side B as dark spots, the centre one too (tapedeck.org photo)
      const dimM = smat(C.dark); SCREWS.forEach(([x, y], i) => blind(circC(x, y, 1.2, 24), i < 4 ? HS : HB, 0.4, dimM, i === 4));
    }
    // caps follow the swept outline vertex for vertex (no T-junctions where the edge wall splits at the openings,
    // which left pixel cracks to the background along the face edge, the plateau edge and the ceiling)
    const inset = d => OUT.map(s => v2(s.x - d * s.nx, s.y + d * s.ny));
    g.add(cap(inset(RB), faceHoles, HS, mf));                                     // outer face
    g.add(cap(inset(TW), ceilHoles, ZC, m, false));                               // inner ceiling
    // raised head area: trapezoid plateau with ramps on three sides, flush with the bottom edge
    const T = [[E0, yE], [TRAP.x0, TRAP.top], [TRAP.x1, TRAP.top], [E1, yE]];
    const off = (p, q, o) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy), nx = dy / l, ny = -dx / l; return [[p[0] + nx * o, p[1] + ny * o], [dx, dy]]; };   // shifted line through p,q
    const isect = ([p, u], [q, v]) => { const t = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / (u[0] * v[1] - u[1] * v[0]); return [p[0] + u[0] * t, p[1] + u[1] * t]; };
    const lL = off(T[0], T[1], TRAP.ramp), lT = off(T[1], T[2], TRAP.ramp), lR = off(T[2], T[3], TRAP.ramp), lE = [[0, yE], [1, 0]];
    const B = [isect(lL, lE), isect(lL, lT), isect(lT, lR), isect(lR, lE)];
    const Tcap = [...T, ...BOTTOM_OPEN.flat().filter(x => x > E0 && x < E1).sort((a, b) => b - a).map(x => [x, yE])];   // edge vertices shared with the wall
    g.add(cap(Tcap.map(([x, y]) => v2(x, y)), trapHoles, HB, mf));
    for (let k = 0; k < 3; k++) {
      const [ox, oy] = [B[k][0] + B[k + 1][0] - T[k][0] - T[k + 1][0], B[k][1] + B[k + 1][1] - T[k][1] - T[k + 1][1]];
      geo.flat([V(...B[k], HS), V(...B[k + 1], HS), V(...T[k + 1], HB), V(...T[k], HB)], [ox, -oy, 0.5]);
      ln.seg(V(...T[k], HB), V(...T[k + 1], HB)); ln.seg(V(...B[k], HS), V(...B[k + 1], HS));
    }
    geo.flat([V(...B[0], HS), V(...T[0], HB), V(...T[0], HS)], [0, -1, 0]);
    geo.flat([V(...B[3], HS), V(...T[3], HB), V(...T[3], HS)], [0, -1, 0]);
    g.add(geo.mesh(m));
    // paper label with its window cut-out
    const lab = extrude(shapeOf(rrC(...LABEL, 1.2), [rrC(...WIN, 1.6)]), HS, HS + 0.12, smat(C.white, { map: labelTex }), 6);
    remapUV(lab.geometry, LABEL); g.add(lab);
    if (edges) g.add(topEdges(lab, (HS + 0.12) * S - 1e-5));
    // smoked window pane (recessed in the plate cut) with the hub openings and the clear centre window
    const panelTop = HS - 0.35;
    g.add(extrude(shapeOf(win, [...HUBS.map(([x, y]) => circC(x, y, HUB_HOLE, 48)), windowC(CWIN, CWIN_SAG)]), ZC, panelTop,
      smat(C.smoke, { transparent: true, opacity: 0.86 })));
    HUBS.forEach(([x, y]) => {                                                // light hub-boss rings
      const r = extrude(ringShape(HUB_HOLE, HUB_HOLE + 0.7), panelTop, panelTop + 0.18, smat(C.rim), 48);
      r.position.x = X(x); r.position.y = Y(y); g.add(r);
      if (edges) { const e = topEdges(r, (panelTop + 0.18) * S - 1e-5); e.position.copy(r.position); g.add(e); }
    });
    const e = 0.7, rim = extrude(shapeOf(windowC([CWIN[0] - e, CWIN[1] - e, CWIN[2] + e, CWIN[3] + e], CWIN_SAG), [windowC(CWIN, CWIN_SAG)]), panelTop, panelTop + 0.2, smat(C.tanLight));
    g.add(rim); if (edges) g.add(topEdges(rim, (panelTop + 0.2) * S - 1e-5));
    const paneZ = ZC + 0.35;
    g.add(extrude(shapeOf(windowC(CWIN, CWIN_SAG)), paneZ, paneZ + 0.06, mat(C.pane, { transparent: true, opacity: 0.14, depthWrite: false })));
    const markM = mat(C.mark), cx = (CWIN[0] + CWIN[2]) / 2;                   // the scale printed on the CHF window
    g.add(box(CWIN[2] - CWIN[0] - 5, 0.14, 0.03, cx, HUB_Y, paneZ + 0.08, markM));
    for (let k = -4; k <= 4; k++) g.add(box(0.14, k ? 0.9 : 1.8, 0.03, cx + k * 2.4, HUB_Y + (k ? 0.45 : 0), paneZ + 0.08, markM));
    // graphite slip sheet lining the inside of the half (cut out at the hubs and the centre window)
    g.add(extrude(shapeOf(rrC(4, 4, L - 4, 50, 3), [...HUBS.map(([x, y]) => circC(x, y, 6.4, 40)), rrC(CWIN[0] - 0.8, CWIN[1] - 0.6, CWIN[2] + 0.8, CWIN[3] + 0.6, 1)]),
      ZC - 0.12, ZC - 0.02, mat(C.sheet)));
    // locating-hole bosses and guide-roller pin bosses on the inside
    LOCATE.forEach(([x, y]) => { const bs = shapeOf(rrC(x - LOC_A - 0.8, y - LOC_A - 0.8, x + LOC_A + 0.8, y + LOC_A + 0.8, 1.2, 3), [rrC(x - LOC_A, y - LOC_A, x + LOC_A, y + LOC_A, 0.6, 3)]); g.add(extrude(bs, 0.02, ZC, m)); });
    ROLLERS.forEach(([x, y]) => { const r = extrude(ringShape(0.6, 1.3, 24), ZC - 0.35, ZC, m); r.position.x = X(x); r.position.y = Y(y); g.add(r); });
    if (A) {
      parts.push({ name: 'Paper label', object: g, offset: new THREE.Vector3(...V(22, 12, HS + 0.12)) });
      parts.push({ name: 'Screw', object: g, offset: new THREE.Vector3(...V(96.9, 3.5, HS)) });
      parts.push({ name: 'Capstan hole', object: g, offset: new THREE.Vector3(...V(25.7, 60.2, HB)) });
      parts.push({ name: 'Raised head area', object: g, offset: new THREE.Vector3(...V(62, 51, HB)) });
    } else {
      SCREWS.forEach(([x, y]) => { const p = extrude(ringShape(0.8, 1.8, 24), -ZC, ZC, m); p.position.x = X(x); p.position.y = Y(y); g.add(p); });   // screw posts span the interior
      TABS.forEach(([a, b], i) => {                                           // write-protect tabs in their pockets
        const zt = 2 * ZC - 0.2;
        const tab = box(b - a - 1.0, 1.2, zt, (a + b) / 2, 1.0, 0, m); g.add(tab);
        g.add(box(0.8, 5.2, 2 * ZC, a - 0.4, TW + 2.6, 0, m), box(0.8, 5.2, 2 * ZC, b + 0.4, TW + 2.6, 0, m), box(b - a + 1.6, 0.8, 2 * ZC, (a + b) / 2, TW + 5.6, 0, m));
        if (i === 0) parts.push({ name: 'Write-protect tab', object: g, offset: new THREE.Vector3(...V((a + b) / 2, 0.4, 0)) });
      });
      parts.push({ name: 'Screw post', object: g, offset: new THREE.Vector3(...V(3.5, 60.3, 0)) });
      parts.push({ name: 'Slip sheet', object: g, offset: new THREE.Vector3(...V(50.2, 12, ZC - 0.12)) });
    }
    ln.addTo(g);
    return g;
  }

  // ---------- interior: hubs + tape packs, tape path, guide rollers, pressure pad assembly ----------
  function buildInterior() {
    const g = new THREE.Group(), white = mat(C.white), tapeM = mat(C.tape);
    const ringMesh = (r0, r1, z0, z1, m, seg = 48) => extrude(ringShape(r0, r1, seg), z0, z1, m, seg);
    HUBS.forEach(([cx, cy], i) => {
      const hub = new THREE.Group(); hub.position.set(X(cx), Y(cy), 0); hub.userData.reel = true;
      hub.add(ringMesh(9.6, HUB_R, -2.0, 2.0, white));                        // drum the tape winds on
      hub.add(ringMesh(5.3, 9.6, -0.5, 0.5, white));                          // web (runs into the tube wall: no sliver gap between the two polygons)
      const bore = [], teeth = 6, seg = 6, rIn = 4.3, rTip = 3.2, hw = 0.7, dIn = Math.asin(hw / rIn), dTip = Math.asin(hw / rTip);
      for (let k = 0; k < teeth; k++) {                                       // drive bore with 6 inward teeth
        const a = (k + 0.5) * 2 * Math.PI / teeth;
        bore.push(pol(rIn, a - dIn), pol(rTip, a - dTip), pol(rTip, a + dTip), pol(rIn, a + dIn));
        for (let q = 1; q < seg; q++) bore.push(pol(rIn, a + dIn + (2 * Math.PI / teeth - 2 * dIn) * q / seg));
      }
      const tube = new THREE.Shape(); tube.absarc(0, 0, 5.7 * S, 0, 2 * Math.PI, false); tube.holes.push(new THREE.Path(bore));
      hub.add(extrude(tube, -(HS - 0.5), HS - 0.5, white, 40));
      hub.add(ringMesh(HUB_R - 0.15, PACK_R[i], -TAPE_W / 2, TAPE_W / 2, tapeM, 72));   // wound tape pack (seated on the drum)
      g.add(hub); reels.push(hub);
      parts.push({ name: i === 0 ? 'Supply reel (full)' : 'Take-up reel', object: hub, offset: new THREE.Vector3(0, PACK_R[i] * S * 0.6, TAPE_W / 2 * S) });
    });
    // tape path: supply pack -> left roller -> along the head openings -> right roller -> take-up pack
    const [RL, RR] = ROLLERS, rr = ROLLER.waist + TAPE_T / 2, TAPE_Y = RL[1] + rr;
    const tangent = (c1, r1, c2, r2, left) => {   // outer common tangent: touch points on circle 1 and circle 2
      const dx = c2[0] - c1[0], dy = c2[1] - c1[1], phi = Math.atan2(dy, dx), al = Math.acos((r1 - r2) / Math.hypot(dx, dy));
      const ns = [phi + al, phi - al].map(t => [Math.cos(t), Math.sin(t)]), nv = left ? (ns[0][0] < ns[1][0] ? ns[0] : ns[1]) : (ns[0][0] > ns[1][0] ? ns[0] : ns[1]);
      return [[c1[0] + r1 * nv[0], c1[1] + r1 * nv[1]], [c2[0] + r2 * nv[0], c2[1] + r2 * nv[1]], Math.atan2(nv[1], nv[0])];
    };
    const arcPts = (c, r, a0, a1, k = 8) => Array.from({ length: k + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / k; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; });
    const [s0, s1, sa] = tangent(HUBS[0], PACK_R[0] + TAPE_T / 2, RL, rr, true);
    const [t0, t1, ta] = tangent(HUBS[1], PACK_R[1] + TAPE_T / 2, RR, rr, false);
    const path = [s0, ...arcPts(RL, rr, sa, Math.PI / 2), ...arcPts(RR, rr, Math.PI / 2, ta), t0];
    {   // one continuous ribbon (mitred joints) instead of separate bars, which left wedge gaps at every bend
      const rg = Geo(), n = path.length, nrm = [];
      for (let i = 0; i < n; i++) {
        const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
        nrm.push([-dy / l, dx / l]);
      }
      const off = (i, s) => [path[i][0] + nrm[i][0] * s * TAPE_T / 2, path[i][1] + nrm[i][1] * s * TAPE_T / 2];
      const wn = i => [nrm[i][0], -nrm[i][1], 0];   // layout y is down
      for (let i = 0; i < n - 1; i++) for (const s of [1, -1]) {
        const p = off(i, s), q = off(i + 1, s), np = wn(i).map(v => v * s), nq = wn(i + 1).map(v => v * s);
        rg.quad(V(...p, -TAPE_W / 2), V(...q, -TAPE_W / 2), V(...q, TAPE_W / 2), V(...p, TAPE_W / 2), np, nq, nq, np);
        const zt = s * TAPE_W / 2, a0 = off(i, 1), a1 = off(i, -1), b0 = off(i + 1, 1), b1 = off(i + 1, -1);
        rg.quad(V(...a0, zt), V(...a1, zt), V(...b1, zt), V(...b0, zt), [0, 0, s]);
      }
      for (const [i, j] of [[0, 1], [n - 1, n - 2]]) {   // end caps where the ribbon meets the packs
        const a0 = off(i, 1), a1 = off(i, -1), dx = path[i][0] - path[j][0], dy = path[i][1] - path[j][1], l = Math.hypot(dx, dy);
        rg.quad(V(...a0, -TAPE_W / 2), V(...a1, -TAPE_W / 2), V(...a1, TAPE_W / 2), V(...a0, TAPE_W / 2), [dx / l, -dy / l, 0]);
      }
      g.add(rg.mesh(tapeM));
    }
    parts.push({ name: 'Tape (3.81 mm)', object: g, offset: new THREE.Vector3(...V(26, TAPE_Y, TAPE_W / 2)) });
    const { flange: rf, waist: rw, len: rl } = ROLLER, h2 = rl / 2;
    const rollerGeo = new THREE.LatheGeometry([[0.6, -h2], [rf, -h2], [rf, -h2 + 0.4], [rw, -h2 + 0.7], [rw, h2 - 0.7], [rf, h2 - 0.4], [rf, h2], [0.6, h2]].map(([r, z]) => new THREE.Vector2(r * S, z * S)), 48);
    const rollerM = mat(C.roller), pinM = mat(C.pin);
    ROLLERS.forEach(([x, y], i) => {
      const r = new THREE.Mesh(rollerGeo, rollerM); r.rotation.x = Math.PI / 2; r.position.set(...V(x, y, 0)); g.add(r);
      g.add(cyl(0.6, 2 * ZC, x, y, 0, pinM, 16));
      if (i === 0) parts.push({ name: 'Guide roller', object: g, offset: new THREE.Vector3(...V(x, y, 4)) });
    });
    GUIDE_PINS.forEach(([x, y]) => g.add(cyl(0.8, 2 * ZC, x, y, 0, pinM, 16)));
    // pressure pad assembly: U-shaped mu-metal shield, phosphor-bronze leaf spring, felt pad against the tape
    const shieldM = mat(C.shield), springM = mat(C.spring), cxm = L / 2;
    g.add(box(16.0, 0.3, 6.4, cxm, 57.75, 0, shieldM), box(0.3, 3.3, 6.4, cxm - 8.0, 59.25, 0, shieldM), box(0.3, 3.3, 6.4, cxm + 8.0, 59.25, 0, shieldM));
    g.add(bar([cxm - 3.2, 59.7], [cxm + 3.2, 59.7], 0.25, 2.6, springM), bar([cxm - 3.2, 59.7], [cxm - 7.4, 58.1], 0.25, 2.6, springM), bar([cxm + 3.2, 59.7], [cxm + 7.4, 58.1], 0.25, 2.6, springM));
    g.add(box(4.2, TAPE_Y - TAPE_T / 2 - 59.85, 3.6, cxm, (59.85 + TAPE_Y - TAPE_T / 2) / 2, 0, mat(C.felt)));
    parts.push({ name: 'Pressure pad', object: g, offset: new THREE.Vector3(...V(cxm - 1, 61, 1.8)) });
    parts.push({ name: 'Magnetic shield', object: g, offset: new THREE.Vector3(...V(cxm + 6, 57.75, 3.2)) });
    return g;
  }

  const reels = [], parts = [];
  const model = new THREE.Group();
  const faceA = buildHalf('A', labelA);
  const faceB = buildHalf('B', labelB); faceB.rotation.y = Math.PI;
  const interior = buildInterior();
  model.add(faceA, faceB, interior);
  const GAP = 0.6;
  model.userData.reels = reels;
  model.userData.faceA = faceA; model.userData.faceB = faceB; model.userData.interior = interior;
  model.userData.parts = parts.slice();
  model.userData.dims = { length: L, height: H, thickness: 2 * HB, body: 2 * HS, scale: S };
  model.userData.setExplode = t => { faceA.position.z = t * GAP; faceB.position.z = -t * GAP; };
  let ghost = false;
  const applyGhost = () => shellMats.forEach(m => {
    const b = m.userData.base; m.transparent = ghost || b.transparent; m.opacity = ghost ? Math.min(0.28, b.opacity) : b.opacity; m.depthWrite = ghost ? false : b.depthWrite; m.needsUpdate = true;
  });
  model.userData.setGhost = on => { ghost = !!on; applyGhost(); };
  model.userData.setShell = kind => {   // 'tan' = the illustration, 'smoke' = the real smoked translucent shell
    const smoke = kind === 'smoke';
    [...bodyMats, ...faceMats].forEach(m => { m.color.setHex(smoke ? C.smokeShell : C.tan); m.userData.base = { transparent: smoke, opacity: smoke ? 0.62 : 1, depthWrite: !smoke }; });
    faceMats.forEach(m => { m.map = smoke ? shellGrid() : null; });
    applyGhost();
  };
  if (shell !== 'tan') model.userData.setShell(shell);
  return model;
}
