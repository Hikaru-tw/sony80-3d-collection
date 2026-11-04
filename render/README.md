# CHF 90 cassette wobble GIF — render pipeline

Recreates the `sonywalk.gif` style (3D flat-shaded, pixel look, transparent, 23 frames @ 100 ms, looping)
for the `cassette.png` illustration.

## Setup (once)
    npm install            # pulls three.js
    pip install playwright pillow numpy && python -m playwright install chromium

## Render
    python prep.py                                   # un-rotates cassette.png into front/back textures
    python render.py out=chf90.gif tex=nearest       # pixel-art look (main deliverable)
    python render.py out=chf90_smooth.gif tex=linear # smoother texture filtering

Tunable via `key=value` args (see the `P` object in render.html):
`yaw0`/`yawA` (base yaw / sway amplitude, deg), `pit0`/`pitA` (tilt), `rollA`, `depth` (shell thickness),
`dist` (camera distance = size), `fov`, `amb`/`dir` (side lighting), `edges=0` (no outline lines), `lit=1` (shade front too).
Outputs land next to render.py along with a `*.sheet.png` contact sheet and `*_frame0.png`.

## Full 3D model (model.html + render2.py)
`model.html` builds the cassette procedurally in Three.js from the measured illustration layout
(`analyze.py` extracts the feature boxes from `front.png`; `prep2.py` cuts the side-A label and derives side B):
hollow two-half shell with mid seam, structural plates with a recessed reel window, tape packs + hub rims + white
hubs with 6 teeth, cream centre tape window (dark tape / tan pad), 5 recessed cross-head screws, 2 round + 2 square
through-holes, recessed lower panel with bevel highlight, write-protect tabs on the top edge, head opening on the
bottom edge, and the paper label (A / B) with its window cut-out.

    python prep2.py
    python render2.py mode=wobble    out=chf90_3d_wobble.gif            # reference-style sway, 23 f @ 100 ms
    python render2.py mode=turntable out=chf90_3d_turntable.gif n=36 pitch=18 dist=4.3
    python render2.py mode=hero      out=chf90_3d_hero.png tex=linear size=1000 yaw=30 pitch=18 dist=3.6
    python render2.py mode=glb       out=chf90.glb                       # glTF binary export (textures embedded)

Same `key=value` overrides as before, plus `depth` (shell thickness, default 0.19 = 12 mm / 63.8 mm),
`size`/`scale` (output px / pixel-block size), `n`/`dur` (frames / ms), `yaw`/`pitch` for stills and turntable tilt.
Units in the GLB: cassette height = 1.0.

## Faithful shell (v2) — references in `reference image/real-product/`
Side B and the edges are modelled after real Sony CHF 90 photos (tapedeck.org side-B photo, Flickr side-A photo,
Wikipedia cassette anatomy / write-protect photos), kept in the illustration's flat inked style:
- side B: same label with "B" + "C-90", ring-shaped screw bosses at the corners (no screw heads), small centre slot
- bottom edge: pinch-roller/erase windows under the capstan holes + wide head window with pressure pad on its shield, tape ribbon across
- top edge: two write-protect tab slots with tabs; short edges plain with the half-shell seam
(v2/v3 layout constants were in illustration px; since v4 they live in `cassette.js` in millimetres, see below.)
Hero views: `mode=hero yaw=205 pitch=-22` (side B), `yaw=15 pitch=-72` (bottom edge), `yaw=15 pitch=72` (top edge).

## Interactive viewer (three.js)
`output/chf90_viewer.html` is a single self-contained page (three.js r170 + OrbitControls + the model + label textures
inlined, ~1 MB) — double-click it, no server needed. Drag to orbit, scroll to zoom, right-drag to pan; preset views
(3/4, side A, side B, top edge, bottom edge) and toggles for auto-rotate, outlines, pixel look and spinning reels.
Light/dark follows the OS theme.

The model itself now lives in `cassette.js` (`buildCassette(THREE, {labelA, labelB, edges, depth})`) and is shared by
`model.html` (render pipeline) and the viewer. After editing it, rebuild the viewer with:

    python build_viewer.py      # writes viewer.html (+ viewer_artifact.html body fragment for hosting)

## Inside structure (v3)
The model is now two real half-shells (each with half the edge wall) around a modelled interior: hub bodies with a
full supply pack and a nearly empty take-up pack, the tape path over the two guide rollers and along the head windows,
felt pressure pad on its leaf spring and magnetic shield, guide pins, graphite slip sheets on both halves, five screw
posts (on the B half) and the write-protect tabs. `buildCassette()` exposes `userData.setExplode(0..1)`,
`userData.setGhost(bool)`, `userData.parts` (named anchor points) and `userData.reels`.
Viewer: "Inside" preset, "Open shell" slider, "See-through" and "Part names". Pipeline: `render2.py ... explode=0.8` /
`ghost=1` (e.g. `chf90_3d_exploded.png` = `mode=hero yaw=38 pitch=26 dist=4.8 explode=0.8`).

Centre window: clear tinted pane (`C.pane`, opacity 0.18) in the cream frame; slip sheets are translucent graphite (opacity 0.62) so the tape packs read through the windows as on the real shell.

## Real dimensions (v4)
`cassette.js` was rebuilt in millimetres; the earlier versions used 1 px = 1/341 on both axes, which made the shell
97.3 mm wide instead of 100.4 mm, and modelled it as a uniform 12 mm slab with the lower trapezoid recessed.
- footprint 100.4 x 63.8 mm (IEC 60094-7), corner radius 4 mm, 0.6 mm round-over on the outer face edges
- 11 mm body with the raised 12 mm trapezoid around the head openings (ramps on three sides, flush with the bottom
  edge). The trapezoidal thickened portion is documented in EP0440424; its height is not in any public source found,
  so 0.5 mm per side is an estimate (guide rollers are 8.4 mm long, which rules out a much thinner body)
- head side: 5 openings (pinch roller, erase, head, erase, pinch roller); write-protect tabs in pockets on the top edge
- positions measured on the straight-on Flickr / tapedeck.org photos: label, window band, hubs 42.5 mm apart,
  centre window with concave ends and its printed scale, corner screws 3.5 mm from the edges, centre screw,
  capstan holes, square locating holes, guide rollers
- window: smoked pane recessed in the face with the hub openings and a clear centre window; hollow hubs with
  6 drive teeth (see-through, as on the real shell); C90 supply pack 25 mm radius
- interior: guide rollers (pins at y 57.95 mm, 8 mm flanges, 7.1 mm waist, 8 mm long; measured through the shell on the
  straightened side-A photo, side B agrees) on pins, guide pins at the head window, U-shaped
  shield + leaf spring + felt pad, slip sheets, screw posts, locating-hole bosses

All layout constants (`LABEL`, `WIN`, `HUBS`, `SCREWS`, `CAPSTAN`, `LOCATE`, `TRAP`, `BOTTOM_OPEN`, `TABS`, `ROLLERS`, ...)
are at the top of `cassette.js` (mm, origin top-left of side A, y down). New option `shell: 'smoke'`
(`render2.py ... shell=smoke`, viewer toggle "Smoked shell") switches to the real smoked translucent shell with its
moulded 1.1 mm grid; `model.userData.setShell('tan' | 'smoke')` at runtime. `model.userData.dims` holds the measurements.
`compare.py` writes `chf90_reference_comparison.png` and `chf90_accuracy_overlay.png`.
The GLB export no longer dumps `userData` (Object3D references) into glTF extras, which had inflated it by several MB.

## Product set: 8 models, one pipeline
- `kit.js` - shared helpers in millimetres (x right, y up, z = front). `K.mapping(stickerPxRect, mmRect)` ties sticker
  pixels to model mm, so any front-facing cap (`K.slab(..., { front: K.art, M })`) shows the drawn face while the solid
  around it is real; `M.mm(px, py)` places 3D parts on drawn features. Also rounded slabs, cylinders on any axis,
  ribbed knobs (`K.gear`), bands along paths (`K.strip`), a bulged CRT cap (`K.dome`).
- `products/<id>.js` - one module per product: `{ id, name, textures, build(THREE, K, T, P), ink?, fit? }`.
  `chf.js` wraps `cassette.js`. Sticker coordinates in each file were measured on the 300 dpi art.
- `product.html?id=<id>` - same API as `model.html` (`render2.py id=<id> ...` picks it). Every model is centred and
  scaled to one bounding-sphere radius (`fit` nudges it), and a screen-space ink pass draws sticker-style outlines:
  silhouettes, depth jumps and sharp creases (`ink: 2`, default) or silhouettes only (`ink: 1`, the cassette, whose own
  drawn lines carry the detail). `ink: 1.5` keeps silhouettes and depth jumps (one part in front of another) but drops
  crease detection, which dashes along bevelled edges; part edges are then drawn as crisp 1 px lines like the
  cassette's, with `K.slab(..., { rim: 'front' | 'back' | 'both' })` or `K.edges(box)` (TPS-L2 so far). Smooth renders
  and the viewer add a half-tone ring outside the ink for smoother lines. Line weight scales with `res` (`inkw=` overrides).
- `render2.py ... smooth=1` downsamples with Lanczos instead of the nearest-neighbour pixel look.
- `prep_products.py` cuts the stickers from the master `.ai` (needs Poppler's `pdftocairo`), writes `tex/<id>.png` and
  the 20 % `tex/<id>_lo.png` used by the pixel GIFs (mappings stay in full-res px), and re-cuts the CHF label.
- `make_gifs.py [ids]` renders `../output/gifs/<id>_pixel.gif` and `<id>_smooth.gif` plus `contact_sheet.png`.
- `make_social.py` draws `../output/social.png` (1200 x 630) from the smooth GIFs' first frames: the site's link preview.
- `refs.py <id>` - accuracy check per product, like `compare.py` for the cassette: each photographed face is rectified
  onto its real size from four corner pixels (listed in `REFS`), the model is rendered orthographically at the same mm
  scale (`product.html?ortho=<span mm>`; the TPS-L2 also takes `hp=0` to hide the headphones), and
  `../output/refs/<id>_accuracy_overlay.png` shows photo | model | 50 % blend on a 10 mm grid per face (big products
  set their own `span`, `res`, sheet `ppm` and `grid` step: the KV-1310 uses 2 px/mm and a 50 mm grid);
  `<id>_reference_comparison.png` puts the reference photos beside renders at matching angles. Done so far: TPS-L2,
  WM-F5, D-E350, DSC-P8, MDR-CD900ST (these three comparison only: no straight-on photo), KV-1310 and TR-55.
- Insides: a module can set `userData.setExplode(t)` on its root (and `openLabel`, `insideView: [az, el, dist]`); the viewer
  then shows the Inside panel and view button, `product.html?explode=<t>` renders it. The TPS-L2 opens like the 1979
  teardown: door swings open on its left hinge and the CHF 90 cassette pops out, then the back cover opens flat and the
  silver frame slides off, showing the battery tray, boards, wiring, flywheel, gears, belts, motor and the tape head.
  The WM-F5 loads its cassette from the back: the latch swings out, the back door (belt clip and window) opens on its
  right-hand hinge and the cassette lifts out, then the deck mechanism lifts out of the front shell and moves aside:
  head, pinch roller and capstan on the hinge side, chrome spindles, two AA cells in their well on the latch side with
  the NORM/METAL switch below, direct-drive motor, tuning gang and volume pot under the knobs, radio board behind the deck.
  The D-E350: the lid swings up on its far-edge hinge (its ribbed underside, hub and window frame now showing) and the
  CD lifts off to stand against it, then the back swings
  out behind the player on its left edge and lies flat: deck with the turntable and pickup slot, sled on its rails, spindle motor in the black chassis, main board
  with copper shield across the lower half, two AA cells along the right (layout from iFixit's D-E356CK teardown).
  The DSC-P8: the zoom extends as at power-on, then the front and back covers come apart round the lens block, xenon
  flash with its capacitor, NP-FC11 battery and Memory Stick, LCD module and main board (iFixit's DSC-P10 guides).
  The KV-1310: the wood case slides off the front and the back cover comes off, then a quarter of the picture tube is
  cut away (from the neck towards the face) and the three beams run from the single in-line gun to the aperture grille;
  around it the copper yoke and magnet rings, neck board, anode cap and HV lead to the flyback, speaker, VHF tuner,
  main and signal boards, power transformer and the pots behind the knobs (KV-1310E chassis photos). The beams are
  flagged `userData.noInk`, which keeps a part out of the normal pass (no outline), as the feature lines are.
  `insideView` uses the viewer's camera azimuth (+ = the product's right): `product.html?yaw=Y` is azimuth -Y.
  The MDR-CD900ST: the band opens and the sliders run out, the pads (with their foam discs) come off and drop, then the
  felt-covered baffles lift out with the 40 mm drivers (dome, magnet, terminals and leads); felt damping in the housing.
  The TR-55: the back cover folds down on its bottom edge with the circuit label inside it face up, then the four UM-3
  cells come out the back on their pull ribbon: 2.5" speaker, tuning gang behind the dial, phenolic board with four IF
  cans, the SERIAL NO. output transformer, paper capacitors and five transistors, earphone jack and volume pot
  (radiomuseum.org chassis photos and the label's own drawing).
- `products_viewer_src.html` - the 8-product viewer. `build_viewer.py` bundles it with three.js, OrbitControls,
  `cassette.js`, `kit.js`, every `products/*.js`, their textures (full + `_lo`) and sticker thumbnails into
  `../output/sony80_viewer.html`. Models build on first visit with the same normalisation, light and ink pass as
  `product.html`; "3/4" (camera azimuth -22) is the GIFs' centre pose (`yaw0` 22: the model turned the other way,
  same view) and "Pixel look" renders at 1/4 resolution with the `_lo` stickers.
  Adjust panel. Camera: zoom 0.45-4.5x of the presets' framing, logarithmic and synced to the wheel. Lens 8-60 degrees,
  a dolly zoom that keeps the framing. Near and far follow the camera's distance to the model, so the ink pass and the
  decals 0.02-0.05 mm off their faces keep their depth precision at a narrow lens. Light: the key light rides in the
  camera frame as before; angle / height default to the GIFs' (0.3, 0.7, 0.65), i.e. 24.8 / 44.4 degrees, key 1.9,
  fill 1.6. Look: the ground colours the stage behind the transparent canvas; the outline multiplies the ink width.
  Light and look persist in localStorage (`sony80viewer.look`, best effort). Number keys pick the presets.
  1.00x is `product.html`'s camera (distance 4.1 at 30 degrees; it was 4.07 before the export came in).
  Motion: one loop drives Play, Showcase and the GIFs. Sway is `renderWobble` as a camera orbit (azimuth -9 sin,
  elevation -8 cos round the view, the same as turning the model 22 +/- 9 and tipping it 12 -/+ 8); Turntable is one
  turn; Open up holds closed, opens, holds open and closes, with half the sway. While it plays, the zoom and pan stay the
  user's. Dragging pauses the loop, and it carries on round the new view.
  Export: the scene goes through the same three passes into its own square targets (no MSAA, like `product.html`), the
  composite writes sRGB itself (three does no output conversion into a render target), and the pixels are read back.
  Pixel = render at size/2, doubled; smooth = render at 2x size, 2:1 Lanczos-3 on premultiplied colour (what Pillow
  does). Then one median-cut palette over 6-bit bins for all frames, alpha cut at 128 into index 255, an LZW encoder
  after omggif, and disposal 2. All 8 also packs a stored zip. Checked headless against `output/gifs/tr-55_*`: the pixel
  version has the same alpha mask on all 23 frames, the smooth one 0.9997 IoU, and mean RGB differs by about 2 levels
  (palette).
  Fixes on the way: Outlines off used to hide the noInk parts too (KV-1310 wires, DSC-P8 printing), because the normal
  pass and the outline toggle shared one list, and the pass set them all visible again afterwards. Now feature lines and noInk parts are separate lists, and each part keeps its own visibility.
  A resize (fullscreen, phone rotation) no longer closes Inside. A long product line ellipsizes instead of widening the
  page past the window.
  Outlines and zoom: the ink used to be a fixed few pixels wide at every zoom while the illustration's own lines scale,
  so zoomed in the model's outline looked thin and fussy next to the face art, and zoomed out it looked heavy. Now,
  zoomed in by z (capped at 2.5x), the normal, ink and clean-up passes run on a 1/z-size corner of their targets
  (`inkFit`: render-target viewports, a `uvScale` / `uvMax` in each shader, samples clamped to the corner). The
  composite scales the ink back up bilinearly and sharpens it with `smoothstep(0.3, 0.7)`, so lines and small details
  grow like a close-up of the 1.00x picture. Tiny parts become round dots, not the 8-armed stars that thicker rings
  would draw. Zoomed out, the width scales down (to 1 px). The speck filter moved from the composite into its own pass
  (`cleanMaterial`) so it still runs at ink resolution. At 1.00x every pass covers its whole target and the sharpening
  is off (the composite reads its own pixel, unfiltered), so the output is the same as before: an All 8 export comes out
  byte-identical to the previous viewer's for every product but the KV-1310 (below), and the TR-55 check still
  matches the GIF set exactly (pixel) and at 0.9997 IoU (smooth). The pixel look and pixel-style exports keep fixed pixels. `product.html` now spreads its
  rings for widths over 4 px like the viewer (no change at the GIF set's widths; checked pixel-identical).
  Two model fixes from the same review:
  - The KV-1310 case's four long corners (6 mm round-overs front to back) get a crisp line down their middle, like
    the rims round its faces. From above or behind, top and side met with only a change of shade.
  - The WM-F5's flat bar on the back is 8.5 mm wide, not 13. `rect_back.png` shows ~6 mm of yellow between it and the
    belt clip's plate on every row; the model left a 1.5 mm sliver that the ink broke into a dashed line.
  The KV-1310 GIFs were re-rendered (the new corner line shows on the 3/4 sway); the WM-F5's came out byte-identical.
  Headless SwiftShader drops and restores the WebGL context right after load (both viewers), logging shader-link
  errors that recover on their own; on a real GPU (`--use-angle=d3d11`) the console is clean.

## Glitch and accuracy pass (v5)
Every model was checked from 12 directions, closed and opening (explode 0.25 / 0.5 / 0.75 / 1), in close-up and in the
pixel look, and against its reference photos. Shared fixes:
- `kit.js` `K.clean(shape, segs)`: three r170's `ExtrudeGeometry` has no duplicate-point merge, and where an outline has
  two points ~1e-16 mm apart (K.rr's zero-length straights and arc joins) its bevel vector breaks and a crack opens
  down that side of the solid. `K.slab` and `K.strip` now rebuild every outline from its points with near-duplicates
  dropped (same tessellation). Cracks showed on the WM-F5, DSC-P8, TR-55 and MDR-CD900ST. It also splits straight
  runs longer than 10 mm: a bevel strip that is one quad along a 100 mm edge is two needle-thin triangles whose depth
  SwiftShader (which renders the GIFs) interpolates badly, leaving evenly spaced wrong pixels that became ink specks.
- `K.slab` clamps a bevel too big for the slab so a straight band of at least 0.2 mm is left; the old near-zero band
  drew wrong depths that the ink pass turned into specks (the TR-55's sides).
- `K.mat` offsets surfaces by 4 polygon-offset units (was 1), which keeps the 1 px rim lines whole on faces seen
  nearly face-on; it is a few millionths of a unit of depth, so nothing behind shows through.
- The ink pass (`product.html` and the viewer) measured "one part in front of another" as a depth jump between
  neighbouring pixels, which a face seen nearly edge-on also has: at some sway frames it inked the KV-1310's whole left
  side and the TR-55's whole top face. It now compares a neighbour against the face's own depth there, predicted two
  ways: extrapolated from the opposite neighbour (1/z is linear across a flat face on screen), and the face's own plane
  (its view-space normal from the normal pass) carried to the neighbour's view ray, which also holds across the crease
  between two bevel facets (the TR-55's top showed a dashed line there). Only a depth neither prediction explains inks.
- Speck filter: the ink pass now writes its ink amount to a mask and a composite pass mixes it in, dropping any ink pixel
  with 5 or fewer full-ink pixels in its 5 x 5 window (and its half-tone ring). A real line is at least 2 px thick (both
  sides of an edge are inked) and runs on, so it has 6 or more even at its end; what is dropped are the single pixels and
  short dashes whose depth or normal came out wrong where a thin face is seen edge-on (the last ones were on the
  TPS-L2's sliding frame and HOTLINE button, the WM-F5 hinge, the DSC-P8 flex and the TR-55's top band at 1000 px).
- Checks used: an open-edge scan of every closed solid (all 8 report none) and A/B renders at the GIF poses.
- `refs.py`: the D-E350's two photo comparisons were rendered from the wrong side of the player (lid face-on, rotated,
  against photos taken low over the front edge); their poses are corrected, as are the WM-F5's two inside views (back door).
- Raised parts that carry the sticker art are registered to it. The WM-F5's control pad, play key and OFF slider, the
  D-E350's disc window and keys, and the DSC-P8's grip and flash window had outlines placed by eye. Their rims and walls cut
  across the drawn shapes, most visibly at a slant. Each outline is now traced on the texture: it runs along the middle of
  the part's black ink outline (the zero crossing of distance-to-outside minus distance-to-fill, sampled along rays,
  Douglas-Peucker to 0.3 px). Round parts are least-squares circles: the DSC-P8's zoom rings are concentric about
  1138.8, 455.5 px, not the old 1142, 457. Solid-black parts (the DSC-P8 finder and AF lamp) take the black's outer edge.
  The new `artEdge` option of `K.slab` paints a part's front round-over with the art too. The bevel then continues the
  drawn black line instead of laying a light ring over it.
- The D-E350's back shell swung forward through the player as it opened (rotation -PI). It now swings out behind (+PI);
  the open pose is the same.
- Printing the sticker gets wrong, checked on the rectified straight-on photos:
  - TPS-L2: the sticker draws SONY 43 % too wide and 3 mm low, the arrow twice its size, and the strip's dot 7 mm low.
    Each is covered with the sticker's own plain colour and drawn again, from the same art, at the photo's size and
    place. A dark backing behind the band | door seam stops the cassette's label showing through it as coloured flecks.
  - KV-1310: the SONY badge was half its width (now a 61 mm plate with 44 mm letters). The control strip's lettering
    and PULL ON/VOL were about 60 % and 50 % of their widths. Each is now fitted to its measured span.
  - `refs.py`: the D-E350's two open-lid comparisons were rendered from below; they now look down from the front edge.
- Insides re-checked against the teardown photos:
  - DSC-P8: iFixit's DSC-P10 photo with the front cover off (ifixit_p10_board.jpg, scaled on the 51.5 mm height)
    shows the main board right behind the front, over the grip half; the model had nothing there. It is added, stepping
    down under the flash: four round power inductors (101 / 220 / 100 / 220) along the grip edge, a flex connector above
    them, black tape down the left and across the bottom, the large chips, two flex connectors towards the lens block, a
    crystal and a screw. The flash reflector sat 10 mm behind its window; it now sits right behind it, level with the
    board as on the photo.
  - KV-1310: radiomuseum's KV-1310E chassis photos (from above and from the left; the set's left is the image's right
    from above, fixed by the main board hinged out on the left in the side photo). The tuner behind the channel dial is
    a turret drum between two frame plates, with a brown contact wafer at the back; it was a plain box.
    The flyback sits in a clear plastic housing with the HV rectifier standing up through its lid; it is drawn
    see-through, kept out of the ink pass and outlined, so the winding shows. Behind it is a silver sheet-metal shield
    stamped 1-439-099-16 with a tag strip. Clearances to the funnel come from the tube's own profile. The speaker leads
    clear the tuner drum by 7.4 mm.
  - KV-1310, from the service manual of its US twin, the KV-1200U/1210U (archive.org; pages kept as kv1210u_sm_*.png).
    That chassis (1969) is closer to the 1968 KV-1310 than the 1973 KV-1310E, whose front differs. It confirms the
    turret tuner (BT-602), the hinged CD board on the left with a finned regulator heat sink, the socket board on the
    neck, and the high-voltage insulator case with its rectifier. Changes made from it: a second anode cap and lead (a
    Trinitron's convergence anode; "Install the two anode caps"); the heat sink is bare aluminium (Fig. 2-4); the tuner
    drum is steel as the BT-602 is drawn (the KV-1310E's is wrapped in yellow paper). The leads clear each other by 2.4 mm.
    The underside comes from the same manual's figs. 2-2, 2-5 and 2-6. Those photos show the set lying on its face, so
    their left is the set's right. Positions are measured as fractions of the bottom's width and depth.
    - Cabinet bottom: a riveted vent plate with 8 x 7 slots, x -142 ... 198 and z -44 ... 72 (offset to the right, as in
      both photos). Two round feet with a centre bolt (D1 / D2) and three screws each: at x 77, 70 % of the depth from
      the back, and at x -157, 59 %.
    - Back cover underside: about 40 slots running front to back between its feet, and the two cover screws by the
      back edge (B1 / B2). These are placed on this cover's feet, since the KV-1210U cover is wider than the KV-1320UB
      one the back follows.
    - Chassis detail, from the same manual (2-5, 2-10, 2-11; figs. 2-11, 2-28 to 2-30) and the KV-1310E photos. The
      inside had the tube and a few large parts, two boards scattered with 40-odd random parts, and seven loose wires.
      - Convergence anode moved to the neck. The manual fits the beam alignment magnet assembly with "the rear edge ... in
        contact with the convergence anode cap", its "two-terminal group at the 12 o'clock position", and fastens the cap
        with "two bolts". So the second cap (it had been beside the main one on the funnel) is now a band clamped round
        the neck behind the magnet rings (z -116 ... -107), its lug and two bolts on top. Its lead loops forward over the
        yoke to the high-voltage case, as the white lead does round the yoke in the KV-1310E photo from above. The two
        leads clear each other by 2.4 mm; this one clears the yoke collar by 33 mm.
      - Yoke mount ("the plastic assembly that supports the deflection yoke is permanently affixed to the bell"; figs.
        2-29, 2-30). A collar r 71-74 round the yoke's front, z -6 ... 22, 1 mm clear of its front ring and 1 mm off the
        glass. Four feet on the diagonals lie on the funnel 0.2 mm proud of it, out to t 0.5. A bridge with two uprights
        crosses the top, the two wing screws T1 sit on its side, and the clamp screw is on the band at the yoke's neck end.
      - H. / V. hold controls (fig. 2-11). The knobs pull off before the cover comes off, so the two pots stay with the
        chassis: on a bracket under the knobs (x 90 / 128, z -112), shafts up to the housing top. The bracket hangs off an
        L-section rail along the chassis top right (fig. 2-28 has it screwed to the front panel along its top, S1-S4),
        inboard of the speaker, with a tab to the panel.
      - Main board. It ran to z 125, but the funnel's glass reaches x -176 at z 100 and passed through it; it now ends at
        z 88, 1.2 mm clear. Its outer face is the solder side: copper pattern, tinned pads and 28 insulated jumpers fanning
        out from the harness, as in the KV-1310E side photo.
      - Boards populated on a 9 mm grid, the kinds and density of the KV-1310E boards' photos: pairs of carbon resistors
        in rows, ceramic discs on edge, blue and black electrolytics, metal-can transistors, IF cans, trimmers and film
        caps, each kind one merged mesh. On the main board, part heights are capped by the gap to the funnel's glass,
        measured from the tube's own cross-section. The placement is generic; no layout of the 1968 boards is on the
        manual pages kept.
      - Wiring as tied bundles: the main harness along the bottom front (below the tube) from the tuner side to the main
        board's solder side, with branches to the four front controls and PULL ON / VOL; speaker leads left of the tuner;
        the tuner coax; AC from the power transformer to the switch; transformer, neck board, yoke, HV tag strip and hold
        controls to the main board. Wires and ties are kept out of the ink pass, since an outlined bundle turns into a
        black rope. Checked by sampling every wire against the glass, both boards and their parts zones, and the other
        parts: none passes through anything except where it lands. The hold-control run had gone through the main board
        and now goes over its top edge; the yoke leads had grazed the heat sink by 0.3 mm.
  - DSC-P8, from Sony's DSC-P8 service manual (level 2, supplied as a PDF; pages kept as sm_p8_*.png). Its circuit-
    boards location page confirms the layout the model already had from the P10 photos: SY-83 main board behind the
    front over the grip half, SW-386 control / LCD-drive board behind the LCD, ST-81 flash board with its capacitor
    along the top, MS-130 Memory Stick board, JK-244 jack board at the bottom, CD-432 CCD board behind the lens. Changes:
    the lower cabinet is red on the red P8 (the parts list orders it per colour); it was silver. It now has the rating
    text printed on it, a caution label by the tripod socket and a screw at each end (iFixit's P10 bottom photo). The
    lens block is round with the zoom motor in a box on its upper corner (lens-section exploded view); it was a
    rounded square. The CD-432 board was added behind it.
  - D-E350, from Sony's D-E350/E351/E351SR/E353/E355/E356CK service manual (supplied as a PDF; pages kept as
    sm_de350_*.png). The main board is rebuilt from its printed-wiring-board page. The side-B (pattern side) copper raster
    is registered to model mm by the chips: IC401 / IC801 / IC601 QFP bodies of 10 / 12 / 14 mm and IC603's 17.1 mm SOJ
    all give 0.0423 mm per pixel. Its spindle notch, a clean r 13.2 circle, is centred on the turntable. iFixit's inside
    photo of the D-E356CK (the same board) then lands IC603, IC401 and the motor can within 1.6 mm. So the board now has
    its real outline: a D across the front half, cut away for the battery well, notched round the motor can and the
    lower mechanism post. Its 375 through holes are tinned pads on the pattern side, it carries the manual's reference
    designators, and that side faces the back (`tex/d-e350_board.png`, generated from the PDF). On that side sit the
    copper sheet over IC801 (shape, window and the notch round Q402 from iFixit's photo), IC401, IC603, IC302, IC405 and
    IC403, tantalum capacitors, the LCD connector's 18 pins and the jacks' pins.
    The CDM-3125ER mechanism is traced on iFixit's pickup-chassis photo. That photo's scale (0.170 mm per pixel) makes the
    turntable flange just clear the motor can and parks the lens at r 57. It also lands two of the three rubber-mounted
    ears on the board's post hole (r 3) and post notch (r 7.6). The mechanism carries the pickup on its guide shaft and
    feed screw, with the sled motor and gear cover under its raised end. The posts come up from the back shell, so the
    back now drops 7 mm before it swings: swinging at once brought its walls' top edge through the board.
    The battery well follows the board's cut-out (front wall at y -24.5). The terminals BT402 (B-) and BT400 (B+) put
    the cells at x 32.8 / 47.8, 5 mm further in than before, with - / + at the front; the back door follows them. Outside:
    the phones jack moves back to y -22 on the left side, where the board has its pins (J301, y -15 ... -28) and iFixit's
    lifted-board photo its black socket; the "beside OPEN" reading of the operating instructions' angled drawing was
    wrong. DC IN moves to y -34.6 (J401's pin, the gold socket on iFixit's photo). Both jacks are centred on the board's
    top face. HOLD moves to x -42, between VOL - and +, as the manual's controls drawing, its switch S802 and the
    label on iFixit's open-lid photo have it. It now lies along the front-left wall; it used to be turned across it, 7 mm
    left.
  - Left open: the US manual shows a black high-voltage cage with the power transformer on its rear. Its figures
    (2-4, 2-34, 2-36) don't fix which side of the chassis it sits on, so the KV-1310E photos' arrangement stands.

Per product (evidence in brackets; `reference image/real-product/` unless noted):
- CHF 90 (`cassette.js`): the face, ceiling and head-area tops are built from the edge wall's own outline, the wall
  strips share break points, the raised round-over end follows the curve, the hub web runs into the hub tube and the
  tape is one ribbon: 238 one-pixel see-through holes and the specks on the bottom edge are gone. The plate that stops
  the GIF seeing through the closed windows hides once the shell opens. Guide rollers: pins at y 57.95 mm, 8 mm flanges,
  7.1 mm waist (side-A photo straightened on the five screws; side B agrees). Side B shows the centre screw boss.
- TPS-L2: the HOTLINE button's orange no longer bleeds onto the front band; the battery door is a skin wrapping the
  rounded back-left edge (it stood 1.8 mm proud); the silver end caps follow the frame outline instead of poking
  through its corner; end plates no longer leave a dashed groove. Added from the photos: knurled HOTLINE top, the
  printing on the top end (HOTLINE, HEADPHONES A / B, OPERATION) and right side (MIC, key arrows, STOP EJECT, volume
  scales, DC IN 3V), the moulded STEREO on the back (`rect_back.png`) and the ribbed left panel (MoDiP). The headphones
  keep the sticker's blue pads (Sony's museum unit has blue ones; others have orange).
  Boards from Sony's TPS-L2 service manual (archive.org; pages kept as sm_tpsl2_*.png). Its 5-2 mounting diagram is a
  conductor-side scan. The five SIP-8 ICs' 2.54 mm pin pitch scales it: 58.7 / 59.4 px per mm across / down, a 1 % scan
  stretch. It is mirrored left-right onto the model, since the conductor sides face the back, and the boards are placed
  on Dave Jones' inside-back photo.
  - Main board 1-601-515: 80 x 50 mm. Its tall part (SONY 1-601-515, DIP IN) runs along the right wall and reaches down
    beside the battery tray. It is notched under the flywheel, and along its top run the long diagonal and the r 13.75
    arc round the take-up drive.
  - Servo amp board 1-601-516: 47.6 x 31.2 mm, above it between the motor and the right wall. The photo measures it
    45 mm wide.
  Both conductor sides are textured from the scan (`tex/tps-l2_main.png`, `tps-l2_servo.png`): the halftone copper,
  with the drawing's annotations filtered out, a tinned joint at each of the 258 through holes it shows, and the board
  numbers where the scan prints them. They replace the generic pattern and the rectangles the old boards had. The felt
  pads (one by SONY 1-601-515, three over the servo board) and the tape strip moved to where the photo has them. On the
  component side, the SIP ICs (IC101/201/102/202, IC601), S301 TONE, the RV601 TAPE SPEED trimmer and the larger
  electrolytics now stand where the diagram puts them. The two small boards are now in, from the same diagram and
  exploded view 6-1. The jack board 1-601-518 lies flat under the top end (y 57-58.2, x -26 ... 28, clear of the motor),
  component side up. It carries the HOT LINE push switch S801 with its plunger up to the orange button, the white
  HEADPHONES jack block J801 under the two jack rings, R80x and C801 / C802. Its top is 1 mm under the top plate: at
  0.05 mm it bled through the plate's depth in the 250 px GIF renders. The AF amp board 1-601-517 is an 11.4 x 50 mm
  strip standing inside the right wall (x 38.8-40), carrying the dual 20k slide pot RV101 / RV201 (VOLUME L / R), its
  two tabs at the wall's slits under the LEFT / RIGHT sliders. Both have conductor sides and leads down to the main
  board. The battery case is the black tray with its terminals and springs (part 3-557-550). The 6 specks speck.py finds at explode 0.75 (pose 180:35) were already there: they are the
  battery spring's coil seen through the tray's gap.
  MDR-3L2 headphones rebuilt from their service manual (the same file's last three pages: exploded view, disassembly,
  cover photo) and Sony's museum photo (`commons_exhibit_headphones.jpg`), still in the sticker's arrangement:
  - Head band: a flat steel strip, 9 x 1.2 mm, not the old thin round arch. Grey sleeves on its ends (y 10-32) have a
    window on the outside.
  - Hangers: a 5 mm strip rides on the band's outer face. It runs from a stopper stud 40 degrees up the arc, through
    the sleeve, down to a pivot stud and an arm that ends in a ring round the ornamental cover.
  - Ornamental covers: SONY, a 16 x 5 grille of dots, R / L and MDR-3L2, laid out as on the manual's cover photo.
    R sits on the player's right (our left), as if the player wore them.
  - Housing: a dark stepped cup, Ø44 mm.
  - Cord bushings: on the rings' bottoms. The cord itself is left out, as on the sticker.
  The real hangers hang the cups about 95 mm below the sleeves' tops; here they are slid in, as the sticker draws them.
- WM-F5: rebuilt as the back-loading player it is. The door-open photos look into the back (the knobs sit on the
  mirror side of a front view, and the back door's window shows through the belt clip's slot in `rect_back.png`); the
  old model opened the face and had the inside mirrored. Depth 35.5 mm (straight top-end photo, 9.9 px/mm: seam 21 mm
  behind the face), 41.9 mm with the clip against the spec's 42.1. Belt clip re-measured on `rect_back.png` (spring
  clip with its window slot, ribs, knurled thumbscrew, top hook); latch with its ribbed grip at the front of the left
  side and a flat bar on the back's left margin; hinge blocks on the right at 8-33 and 86-111 mm from the top (V&A
  front, Sony's photo); jack A open, jack B under its grey rubber cap as on Sony's yellow unit. Fixed on the way: a
  floating spindle base, the capstan through the cassette wall, a flickering latch spring, the latch and door knuckles
  sweeping through the shell while opening, and the mechanism hiding the board when fully open. Sony's WM-F5 service
  manual (cover and "Parts identification", the pages elektrotanya.com previews) gives 100.4 x 125.2 x 42.1 mm with
  projections and 91.8 x 120.8 x 35.3 mm without, which the body matches; the top end carries PHONES A / B, the FM
  dial scale, TUNING and VOL, and DX/LOCAL and TAPE sit inside the bay (the model had a DX/LOCAL slot on the top end:
  it is now the dial-scale window with its MHz / TUNING / VOL / A / B lettering placed on `rect_top.png`, and the
  SENS slider sits beside TAPE on the selector block as in `wl_inside_door_open.jpg`). The knobs are lowered to the
  4.6 mm the 125.2 mm height leaves above the body, the latch grip to the 3.5 mm the top photo shows. Uncertain: the
  latch's pivot and the board layout (the manual's later pages are not public), spindle line and cassette height +-3 mm.
  The opened latch matches both door-open photos (out past the bay in `wl_inside_door_open.jpg`, standing up at the top
  left in `wl_blue_inside.jpg`; see the comparison sheet). Board: a repair photo with the front shell off (Stereo2go
  WM-F5 thread, viewed in the browser, not kept) shows it directly behind the face and filling it, ~86 mm wide on the
  22.4 mm knob spacing, solder side forward carrying the two LEDs and the control-pad switches, a wiring harness along
  the bottom. Now rebuilt from Sony's WM-F5 service manual (supplied as a PDF): its 6-1 mounting diagram is registered to
  the model by fitting the board's five cut-outs to the front pad's keys (three round keys, play, OFF; 0.4 mm rms). That
  fit also puts the phone jacks within 1 mm and VOL within 1.1 mm of their photo-measured places, and the battery leads
  at the two ends of the well. The board is 75.2 x 103.9 mm, x -37.6..37.6, y -56.5..47.4, at z 15.75-16.35 right behind
  the face, cut for the rubber pad's plungers (modelled, seen through the cut-outs). Its component side shows brown
  phenolic with the manual's copper pattern showing through and added silkscreen; the bay photo's brown floor with the
  + / - printing is this board, so the cells lie on it and the well has no hole in the board and a low wall. Parts from
  the drawing: IC1 (20 pins), IC601 (single in line, standing), IF cans T1 and T2, ceramic filters CF1 and CF2, S301,
  S302 and S1 switches, RV601 and RV1 trimmers, the flat transistors and a few electrolytics, the DC IN jack (J301) and
  white connectors where the head, motor and cassette-switch leads leave. Parts the drawing puts under the cells (L1, Q1,
  Q4, Q7, Q8) are left out; IC301 is on the solder side. Moved to match: the battery well 4 mm towards the latch (its
  inner edge 6.9 mm from the spindles, the bay photo's 6), the cells' polarity (+ at the lower end of the cell nearer
  the spindles, as printed in the photo), the TAPE / SENS sliders to the manual's S302 / S1 (6.3 mm apart, the photo
  6.8; TAPE nearer the spindles). Added outside: the DC IN 3V jack's grey rubber plug low on the left side at the
  latch's lower end, with its label (parts identification 13, the DC-jack packing page, Sony's blue unit photo), 1.6 mm
  lower than the drawing's J301 so the latch's lower pivot pin and grip swing clear of it; the dial-scale drum under the
  scale window. Not settled: the drawing puts IF can T1 and filter CF1 just beside the cells, which only fits with the
  well where it now is; the spindle line itself stays a photo estimate (+-3 mm).
- D-E350: body, back plate and walls share one smooth outline with the silver panel set flush into it (Sony's photo;
  iFixit's convex back), which removes the lumpy silhouette, the blue stripe across the panel and the panel's shading
  bands; the disc window follows the drawn ring (fitted ellipse); a lip ring closes the gap round the lid; outlines are
  drawn only along exposed edges. Opening: the CD lifts before it tilts (it cut 6 mm through the deck), the pickup
  ribbon runs outside the board. Added: SOUND and MENU keys, the CD's centre hole, the board laid out as in iFixit's
  inside-back photo. Sony's D-E350 / D-E351 operating instructions (2001) confirm the size (130.6 x 26.3 x 150.5 mm
  without projections) and the control layout (OPEN front left, VOL pair left of the LCD, play keys down the right,
  SOUND and MENU at the ends of the front strip, HOLD on the front) and put the phones jack on the left side and DC IN
  on the right: the model had the two swapped (from a sibling's photo) and now follows the manual (their positions along
  the sides: see the service-manual notes above, which also supersede the HOLD measurement below). The ESP MAX
  slide switch it shows on the deck at the front left of the bay was missing and is added.
  SOUND and MENU measured along the silver strip on radiomuseum's head-on front-edge photo of a real D-E350: their
  centres at 0.10 and 0.905 of the strip (the model had 0.14 and 0.93, 3 and 2 mm right) and ~9.5 mm long (was 8);
  now 0.105 and 0.903, within 0.4 mm. HOLD, measured the same way, is within about 1 mm. The LCD window is the client's
  art and sits ~2 mm right of the photo's. Uncertain: battery-well height and back-shell roundness (angled photos).
  Lid underside and back feet, from radiomuseum's photos of a real D-E350 (`rm_de350_open_lid.jpg`, `rm_de350_back.jpg`):
  the lid was a solid 4 mm disc with a flat blue underside. Its flat cap is now dropped (the shell's outside is
  unchanged: the GIFs are pixel-identical) and closed from below by a 1 mm flat rim and a recess 1.5 mm up. In the
  recess are a hub over the spindle with a pin, rings at r 10.5 and 22.5, eight 0.9 mm ribs at 45 degrees out to
  r 44, the disc window's frame (r 16.3) round a tinted pane (r 12.3), and the latch hook on the rim above OPEN. The
  photo is oblique (it puts the window 23 mm right of the hub; the sticker has 17), so its ratios are scaled to put the
  window where the sticker draws it. That leaves the front rib passing 0.2 mm left of the frame and the outer ring
  running into it, as photographed. Clearances, stepping `setExplode`: closed, the ribs are 0.85 mm above the CD and the
  hub 0.55 above the centring boss; the hook stands 0.1 mm outside the CD's edge and 0.2 inside the bay's lip; open,
  the CD leans 1.07 mm off the hook. Back: two 8 mm rubber feet at x +-38, y -44 and the screw at (0, 59), 6 mm from
  the hinge edge (the manual's cabinet parts 2 and 1; both back photos agree to ~2 mm).
  Back re-measured on radiomuseum's door-open photo (`rm_de350_back_door_open.jpg`). It is taken square on: its outline
  is within 2 % of the body's 130.6 x 150.5 mm proportions, 2.34 px/mm. The battery door now runs from x 21 (its inner
  edge, where it hinges: it stands up there in that photo) out to the shell's edge, y -28 ... 48. It follows the
  outline 1.4 mm inside, clipped from the back shell's own hull. It had been a 32 x 54 mm panel 8 mm in from the
  edge. The label is the real one: black, centred at (-4, -3) and 44 x 52 mm (it had been navy, 38 x 46 at (-12, 2),
  taken from the D-E356CK), with the photos' text: MODEL No. D-E350, MADE IN CHINA, PORTABLE CD PLAYER, DC 4.5V
  EXTERNAL DC SUPPLY, BATTERY SUPPLY 1.5V x 2, R6 SIZE AA, CE and the Walkman logo. The feet move to y -50
  (x +-38.5) and the screw to (0, 57.5).
- DSC-P8: the lens block no longer pokes out of the round end; "3x OPTICAL ZOOM" (on the round end in Sony's photo) is
  white lettering on the curve instead of a darker square; thicker face and back plates remove the dashed V-groove;
  the battery door fits the rounded corners; the strap eyelet is a half ring; inside parts no longer intersect; the
  extended zoom sits on a fixed barrel. From the P10 front/back/bottom photos: viewfinder hump at x -20.5...5.5 with
  the black eyepiece frame and lamps, top controls 4-5 mm further left and a 9.4 mm shutter, LCD 10 mm toward the grip,
  pad and keys moved, W/T rocker at the top corner, speaker holes, the DC IN / A/V / USB cover on the back's bottom
  edge, the rating plate and tripod socket (ITmedia's 2003 review: under the cover at the bottom of the back sit DC IN,
  A/V OUT and USB, left to right). Back colour: no red P8 is photographed from behind, but Sony's launch photos of all
  four colours (Bordeaux Red among them) show one-colour shells, so the back cover is red. Hump height +-2 mm.
  Printing on the back (the P10 back photo and the P8 operating instructions' "Identifying the parts"), white on the
  red shell: flash, self-timer, macro and quick-review icons round the control pad, the display symbol, MENU, image
  size / delete, SONY along the LCD's edge, W / T on the rocker's keys (dark on silver), DC IN / A/V OUT / USB on the
  jack cover, and OPEN with its arrow on the battery / Memory Stick door. Each is a see-through plane kept out of the
  ink pass. The door's print shows in the GIFs' sway; elsewhere the GIFs differ only by palette shifts.
- KV-1310: long thin triangles in the case's rounded corners and bands made the ink pass stamp dashes and specks;
  outlines are now split every 14 mm and extruded in steps (`dense()` / `bigSlab()`), and the transformer's edge lines
  no longer show through the base plate. From Sony's photo: a straight square-ended handle with a silver top on two
  posts at +-89 mm (27 mm high), small black front feet 32 mm in from the sides, so the total height is the brochure's
  362 mm; from the KV-1320UB back: rear feet, hold knobs and the antenna bracket. Depth: radiomuseum's side-on photo
  of a KV-1210U (the KV-1310's US twin) shows the wood case 496 px deep, the black back cover standing 332 px behind it
  and the mask 60 px in front; on the brochure's 397 mm overall that is a 222 mm case, a 150 mm back cover and 25 mm
  of mask and dial. The model had a 330 mm case (as deep as it is tall) with a 53 mm back cover, so the tube sat wholly
  inside the wood; the case is now 222 mm, the back housing stands 130 mm behind it and the neck cover 150 mm,
  enclosing the tube's neck as on the real set (its top 42 mm below the case top, as in the photo). The antenna
  mount moves to the front of the housing top, the handle 22 mm forward (both from the same photo, and the KV-1320UB
  back agrees), and the chassis base plate and main board move inside the housing's width. Cabinet depth dial to neck
  cover: 398 mm. The Smithsonian's own KV-1310 (NMAH 706163, Open Access API) is listed at 15 x 15 x 17 3/4 in overall.
  The wood colour follows the illustration, not the darker walnut of the photos.
- MDR-CD900ST: the logo plates map onto the sticker's elliptical plate (339 x 414 px, measured) instead of a circle that
  caught its white ring; the leads stay attached when the drivers lift out. The 6.3 mm plug is the real one (Quercus
  photo): pointed tip, two insulators, ring, sleeve, knurled chrome body, collar and a 22 mm coil-spring strain relief,
  about 96 mm in all. The pads stay smooth on purpose. The real leatherette creases, but the client's illustration
  draws smooth, puffy pads and a smooth band, and the model follows the art.
- TR-55: specks down both sides (a clamped bevel, above), a dashed back-cover seam, an inside-out back rim and white
  corners on the TRANSISTORIZED band fixed; the pull ribbon lies flat; when opened the cover stops at feet level and
  the cells lie on it, with no interior collisions. From the radiomuseum photos: back holes 4.5 mm higher, the
  hexagonal flip cap and its screw, the socket plate with the antenna socket and earphone jack; a 20 mm green ribbed
  volume wheel in a 9.6 x 20.5 mm slot with OFF above it (was a 28 mm peach wheel); 7 mm feet at x +-45; the board as
  in the chassis photo (gang, 2 x 2 IF cans, SERIAL NO. transformer, paper capacitors).
  Back cover re-measured (rm_tr55_back.png, mapped to mm through the hole grid, 0.26 mm rms; checked by drawing the
  outlines back onto the photo). The socket plate sits behind a shield-shaped opening in the cover, recessed by the
  cover's thickness; it had been stuck on top. The opening, antenna socket (8.6 x 4.8 oval) and jack are about 2 mm
  lower than before. The flip cap is 15.8 x 31 mm and only a little narrower at its round lower end. Its brass screw is
  4.8 mm across (was 3.4). In the moulded lettering, MODEL is small between the large SONY-RADIO and TR55, each run
  spans its measured width, and the letters are raised (lit top, shadow below).
  Inside re-laid from rm_tr55_inside.png (taken with the back off). Its lower corner holds the socket plate seen through
  the opening, which gives the photo's scale (~4.5 px/mm) and place. So the plate belongs to the chassis and stays put
  when the cover folds down; the circuit label stops short of the opening. Seen from behind, the tuning gang fills the
  upper left (34 x 36.5 mm: slotted screw, red-dot trimmer, hole). The board is dark phenolic, x -21..25, y -20.5..34,
  with the four 12 mm IF cans staggered as photographed. The output transformer (24 x 29.6 mm under its clamp, SERIAL NO.
  printed sideways) and three yellow paper capacitors stand behind the speaker's magnet, which hides most of the speaker
  as on the photo. Also new: an aerial coil over the socket plate, a steel rail over the battery compartment, and the
  small parts in the board's gaps (photo positions where they read). Fixes to the cells' exit, clearances measured on the
  geometry: the cells now pass 0.5 mm under the rail with a smaller, earlier lift. The battery and jack leads are
  re-routed; the cells had cut through them by up to 5.6 mm. The pull ribbon's path has points along its bottom; it had
  sagged 1 mm through the plate under the cells and into the cover. The drive drum is 9 mm across; at 12 mm it cut the
  side plate and the cells' contact plate.
  Circuit label redrawn from `rm_tr55_back_label.png`. It was a stand-in (a frame, random lines, five circles and a few
  words). It is now drawn in the photo's own pixel coordinates (label 452 x 314 px, onto the 109 x 72 mm decal), so every
  part sits where the photo has it. The schematic: aerial coil and tuning gang, the 2T51 converter with its oscillator
  coil, two 2T52 IF stages in their cans with the 60P / 5P neutralising caps, the 1T33 AGC and detector diodes, VR-20K,
  the 2T53 driver and its transformer, the 2T12 output stage with the 8-ohm output transformer, speaker, jack J, the
  30 uF / 2.2K / 560-ohm supply filter, SW and the 6 V battery, with every value as printed (the radiomuseum page
  confirms the transistor types). The dash-dot line runs from the volume control to the switch. Below: the earphone
  and antenna plugs, BATTERY UM-3 going into the tray of four with the PULL ribbon, OFF / VOLUME CONTROL, FREQUENCY
  RANGE 535KC - 1605KC, BATTERY TYPE-UM-3 or UM-3A 1.5V x 4, the boxed Sony script and TOKYO TSUSHIN KOGYO, LTD.
  Wires the 500 px photo cannot resolve are joined by the shortest run, so the drawing follows the label's layout but
  is not a verified circuit. The paper's tears and stains and a collector's marker note are left out. The label stays
  turned so it reads from behind with the cover folded down. Taken off and turned over, as photographed, the real one
  has its Sony box beside the socket opening.

Judgement calls: the KV-1310's case is 451 x 329 mm: the width is Sony's (US brochure for the KV-1210U twin,
Smithsonian), the height comes from Sony's photo rectified onto that width (knobs and dial come out round), which also
fits the brochure's 362 mm over handle and feet. The sticker's layout matches that photo, so each part carries its own
piece of the art (mask, screen, dial, knob caps) at its measured place; its anode cap and flyback sit on the tube's
left so the HV lead stays out of the cut-away. The D-E350 size comes from its sibling/successor spec sheets.
The MDR-CD900ST has no published dimensions. Its cup is measured on a face-on photo of the MDR-7506 (same housing):
the round drum gives the camera tilt, the photo is de-tilted, edges are read off brightness profiles along rays and
the tilt's parallax is removed for deeper parts. Result: an egg-shaped housing 72 x 83 mm (upper half a circle round
the drum, lower half longer), a 52.8 mm drum standing 12 mm proud of a thin housing, pads 2.4 mm proud of the housing.
The drum's height and the hinge come from the folded 7506 seen side-on and Sony's 7506 service-manual drawing: the yoke
is a band on edge round the drum whose ends run down its sides to rounded tabs, riveted to the drum 6 mm below its
centre over small stop blocks; the photos disagree on the drum's height (7-18 mm), so 12 mm is the side-on reading,
about +-3 mm. The scale comes from two independent checks (the 7506 baffle photo's 40 mm driver frame, and the
~79 mm replacement pads), and the band's height above the drum matches a third photo. It is modelled at rest (spring
band pulling the pads together) and turned so the GIF pose shows the R cup as the sticker does. Its comparison poses
were solved from two directions measured in each photo (the visible cup's outward normal and the cup-to-band direction),
which fix all three angles.

