"""Drive model.html (the cassette) or product.html?id=<product> headlessly: wobble GIF, 360 turntable GIF, hero still, GLB.
smooth=1 downsamples the frames with Lanczos (render at res=2*size) instead of the nearest-neighbour pixel look."""
import base64, io, sys, threading, functools, http.server, socketserver, math
from pathlib import Path
from PIL import Image
import numpy as np
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)
mode = args.pop("mode", "wobble")
out = HERE / args.pop("out", "chf90_" + mode + ".gif")
N = int(args.pop("n", 23 if mode == "wobble" else 36)); DUR = int(args.pop("dur", 100))
OUT_SIZE = int(args.pop("size", 500)); SCALE = int(args.pop("scale", 2))
still_yaw, still_pitch = float(args.pop("yaw", 30)), float(args.pop("pitch", 18))
SMOOTH = args.pop("smooth", "0") == "1"
PAGE = "product.html" if "id" in args else "model.html"
args.setdefault("res", str(OUT_SIZE // SCALE))
query = "&".join(k + "=" + v for k, v in args.items())

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(HERE)))
threading.Thread(target=srv.serve_forever, daemon=True).start()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 1200, "height": 1200})
    pg.on("console", lambda m: print("[console]", m.text)); pg.on("pageerror", lambda e: print("[pageerror]", e))
    pg.goto("http://127.0.0.1:%d/%s?%s" % (srv.server_address[1], PAGE, query))
    pg.wait_for_function("window.READY === true", timeout=120000)
    if mode == "glb":
        data = pg.evaluate("window.exportGLB()")
        out = out.with_suffix(".glb"); out.write_bytes(base64.b64decode(data)); print("wrote", out, out.stat().st_size, "bytes"); b.close(); srv.shutdown(); sys.exit()
    if mode == "hero":
        urls = [pg.evaluate("window.renderStill(%s,%s,%d)" % (still_yaw, still_pitch, OUT_SIZE))]
    elif mode == "turntable":
        urls = pg.evaluate("window.renderTurntable(%d,%s)" % (N, still_pitch))
    else:
        urls = pg.evaluate("window.renderWobble(%d)" % N)
    b.close()
srv.shutdown()

dec = lambda u: Image.open(io.BytesIO(base64.b64decode(u.split(",", 1)[1]))).convert("RGBA")
if mode == "hero":
    out = out.with_suffix(".png"); dec(urls[0]).save(out); print("wrote", out); sys.exit()
frames = [dec(u).resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS if SMOOTH else Image.NEAREST) for u in urls]

alpha = [np.array(f)[..., 3] >= 128 for f in frames]
rgb = [np.array(f.convert("RGB")) for f in frames]
allpix = np.concatenate([r[m] for r, m in zip(rgb, alpha)])
pal_img = Image.fromarray(allpix.reshape(1, -1, 3)).quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
palette = pal_img.getpalette()[: 255 * 3] + [0, 0, 0]
gif_frames = []
for r, m in zip(rgb, alpha):
    idx = np.array(Image.fromarray(r).quantize(palette=pal_img, dither=Image.Dither.NONE), dtype=np.uint8)
    idx[~m] = 255
    fr = Image.fromarray(idx, "P"); fr.putpalette(palette); gif_frames.append(fr)
gif_frames[0].save(out, save_all=True, append_images=gif_frames[1:], duration=DUR, loop=0, transparency=255, disposal=2, optimize=False)

cols, tw = 6, 250; rows = math.ceil(len(frames) / cols)
sheet = Image.new("RGBA", (cols * tw, rows * tw), (255, 255, 255, 255))
for i, f in enumerate(frames): sheet.alpha_composite(f.resize((tw, tw), Image.NEAREST), ((i % cols) * tw, (i // cols) * tw))
sheet.save(out.with_suffix(".sheet.png")); frames[0].save(out.with_name(out.stem + "_frame0.png"))
print("wrote", out, out.stat().st_size, "bytes;", len(frames), "frames", frames[0].size)
