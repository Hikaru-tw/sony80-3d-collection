"""Headless-render the cassette wobble and encode a transparent, looping GIF."""
import base64, io, sys, threading, functools, http.server, socketserver, json, math
from pathlib import Path
from PIL import Image
import numpy as np
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
N, DUR, OUT_SIZE, SCALE = 23, 100, 500, 2
args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)
out_name = args.pop("out", "chf90.gif")
res = int(args.get("res", OUT_SIZE // SCALE)); args["res"] = str(res)
query = "&".join(f"{k}={v}" for k, v in args.items())

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(HERE)))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 600, "height": 600})
    pg.on("console", lambda m: print("[console]", m.text))
    pg.on("pageerror", lambda e: print("[pageerror]", e))
    pg.goto(f"http://127.0.0.1:{port}/render.html?{query}")
    pg.wait_for_function("window.READY === true", timeout=60000)
    urls = pg.evaluate(f"window.renderFrames({N})")
    b.close()
srv.shutdown()

frames = []
for u in urls:
    im = Image.open(io.BytesIO(base64.b64decode(u.split(",", 1)[1]))).convert("RGBA")
    if SCALE != 1:
        im = im.resize((im.width * OUT_SIZE // (res), im.height * OUT_SIZE // res), Image.NEAREST) if res * SCALE == OUT_SIZE else im.resize((OUT_SIZE, OUT_SIZE), Image.NEAREST)
    frames.append(im)

# --- GIF: global 255-colour palette + index 255 reserved for transparency ---
alpha = [np.array(f)[..., 3] >= 128 for f in frames]
rgb = [np.array(f.convert("RGB")) for f in frames]
allpix = np.concatenate([r[m] for r, m in zip(rgb, alpha)])
sample = Image.fromarray(allpix.reshape(1, -1, 3))
pal_img = sample.quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
palette = pal_img.getpalette()[: 255 * 3] + [0, 0, 0]
gif_frames = []
for r, m in zip(rgb, alpha):
    q = Image.fromarray(r).quantize(palette=pal_img, dither=Image.Dither.NONE)
    idx = np.array(q, dtype=np.uint8)
    idx[~m] = 255
    fr = Image.fromarray(idx, "P"); fr.putpalette(palette)
    gif_frames.append(fr)
out = HERE / out_name
gif_frames[0].save(out, save_all=True, append_images=gif_frames[1:], duration=DUR, loop=0,
                   transparency=255, disposal=2, optimize=False)

# contact sheet for review (checkerboard-free: composite on white)
cols, tw = 6, 250
rows = math.ceil(N / cols)
sheet = Image.new("RGBA", (cols * tw, rows * tw), (255, 255, 255, 255))
for i, f in enumerate(frames):
    sheet.alpha_composite(f.resize((tw, tw), Image.NEAREST), ((i % cols) * tw, (i // cols) * tw))
sheet.save(out.with_suffix(".sheet.png"))
frames[0].save(out.with_name(out.stem + "_frame0.png"))
print("wrote", out, out.stat().st_size, "bytes;", len(frames), "frames", frames[0].size)
