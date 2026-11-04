"""Link-preview image for the site: ../output/social.png, 1200 x 630 (Open Graph, and GitHub's social preview).
The title, both logos and the first frame of each smooth GIF, laid out as a small HTML page and screenshotted with
Playwright so the logos stay vector-sharp. Run after make_gifs.py.
    python make_social.py
"""
import base64, re
from pathlib import Path
from playwright.sync_api import sync_playwright

S = Path(__file__).parent
GIFS = S.parent / "output" / "gifs"
IDS = ["chf", "tps-l2", "wm-f5", "d-e350", "dsc-p8", "kv-1310", "mdr-cd900st", "tr-55"]
uri = lambda p, mime: "data:%s;base64,%s" % (mime, base64.b64encode(p.read_bytes()).decode())
sony = re.search(r'\sd="([^"]+)"', (S / "brand" / "sony.svg").read_text(encoding="utf-8")).group(1)

tiles = "".join('<img src="%s" alt="">' % uri(GIFS / f"{i}_smooth.gif", "image/gif") for i in IDS)
html = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #FFFFFF; color: #211714; font-family: "IBM Plex Sans", "Segoe UI", sans-serif; }
  .page { position: relative; width: 1200px; height: 630px; box-sizing: border-box; padding: 64px 60px 56px 72px; display: grid; grid-template-columns: 392px 1fr; gap: 24px; }
  .left { display: flex; flex-direction: column; }
  .sony { height: 34px; width: auto; fill: #000000; align-self: flex-start; }
  .eyebrow { margin-top: 56px; font-size: 15px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #6E6158; }
  h1 { margin: 12px 0 0; font-size: 54px; line-height: 1.02; font-weight: 600; letter-spacing: -0.015em; }
  p { margin: 22px 0 0; font-size: 21px; line-height: 1.45; color: #6E6158; }
  .credit { margin-top: auto; display: flex; align-items: center; gap: 14px; }
  .credit span { font-size: 13px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #6E6158; }
  .credit i { display: block; width: 120px; height: 25px; background: #211714; -webkit-mask: url(%(hikaru)s) center / contain no-repeat; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); gap: 8px; align-self: center; }
  .grid img { width: 100%%; aspect-ratio: 1; object-fit: contain; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: #E5642A; }
</style></head><body><div class="page">
  <div class="left">
    <svg class="sony" viewBox="0 0 1280 225.28"><path d="%(sony)s"/></svg>
    <div class="eyebrow">80th Anniversary</div>
    <h1>3D Collection</h1>
    <p>Eight Sony classics, 1955 to 2003, in real millimetres. Turn them, open them up, make your own GIFs.</p>
    <div class="credit"><span>Created by</span><i></i></div>
  </div>
  <div class="grid">%(tiles)s</div>
  <div class="bar"></div>
</div></body></html>""" % {"hikaru": uri(S / "brand" / "hikaru.png", "image/png"), "sony": sony, "tiles": tiles}

out = S.parent / "output" / "social.png"
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.set_content(html, wait_until="networkidle")
    pg.wait_for_timeout(300)
    pg.screenshot(path=str(out))
    b.close()
print("wrote", out)
