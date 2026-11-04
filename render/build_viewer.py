"""Bundle three.js + OrbitControls + cassette.js + label textures into one self-contained viewer.
Writes viewer.html (double-click, works from file://) and viewer_artifact.html (body fragment for hosting)."""
import re, base64
from pathlib import Path
S = Path(__file__).parent

def wrap_three(src):
    # last `export{a as A,...};` -> return object; whole file becomes an IIFE assigning window-level THREE
    i = src.rfind("export{")
    if i < 0: i = src.rfind("export {")
    head, tail = src[:i], src[i:]
    names = tail[tail.index("{") + 1: tail.rindex("}")]
    pairs = []
    for ent in names.split(","):
        ent = ent.strip()
        if not ent: continue
        if " as " in ent: loc, exp = [p.strip() for p in ent.split(" as ")]
        else: loc = exp = ent
        pairs.append("%s:%s" % (exp, loc))
    return "var THREE=(function(){\"use strict\";\n" + head + "\nreturn {" + ",".join(pairs) + "};})();\n"

def wrap_addon(src, exported):
    m = re.search(r"import\s*\{([^}]*)\}\s*from\s*['\"]three['\"];?", src)
    imports = ",".join(n.strip() for n in m.group(1).split(",") if n.strip())
    body = src[:m.start()] + src[m.end():]
    body = re.sub(r"export\s*\{[^}]*\};?", "", body)
    return "var %s=(function(){\"use strict\";const {%s}=THREE;\n%s\nreturn %s;})();\n" % (exported, imports, body, exported)

three = wrap_three((S / "node_modules/three/build/three.module.min.js").read_text(encoding="utf-8"))
orbit = wrap_addon((S / "node_modules/three/examples/jsm/controls/OrbitControls.js").read_text(encoding="utf-8"), "OrbitControls")
cassette = (S / "cassette.js").read_text(encoding="utf-8").replace("export function buildCassette", "function buildCassette")
bundle = three + orbit + cassette
b64 = lambda p: "data:image/png;base64," + base64.b64encode((S / p).read_bytes()).decode()
# the two logos (brand/): Sony's wordmark as an inline SVG path, Hikaru's as a PNG used as a CSS mask
SONY_PATH = re.search(r'\sd="([^"]+)"', (S / "brand" / "sony.svg").read_text(encoding="utf-8")).group(1)
brand = lambda t: t.replace("__SONY_PATH__", SONY_PATH).replace("__HIKARU_PNG__", b64("brand/hikaru.png"))

src = (S / "viewer_src.html").read_text(encoding="utf-8")
head = brand(src[src.index("<!--HEAD-->") + len("<!--HEAD-->"): src.index("<!--BODY-->")])
body = brand(src[src.index("<!--BODY-->") + len("<!--BODY-->"):])
body = body.replace("/*__BUNDLE__*/", bundle).replace("__LABEL_A__", b64("label_a.png")).replace("__LABEL_B__", b64("label_b.png"))

full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        + head + '</head>\n<body>' + body + '</body>\n</html>\n')
# In the public repo (Hikaru-tw/sony80-3d-collection) the site's front page is index.html at the root, so the pages'
# links to each other point there; ../public/publish.py makes the same changes when it copies from the workshop repo
SITE = S.parent / "index.html"
(S / "viewer.html").write_text(full, encoding="utf-8")
(S.parent / "output" / "chf90_viewer.html").write_text(full.replace('href="./sony80_viewer.html"', 'href="../index.html"') if SITE.exists() else full, encoding="utf-8")
(S / "viewer_artifact.html").write_text(head + body, encoding="utf-8")
print("viewer.html", (S / "viewer.html").stat().st_size, "bytes; artifact", (S / "viewer_artifact.html").stat().st_size, "bytes")

# ---------- 8-product viewer: kit.js + products/*.js + their stickers -> ../output/sony80_viewer.html ----------
import io, json
kit = (S / "kit.js").read_text(encoding="utf-8").replace("export function makeKit", "function makeKit")
mods, assets, thumbs = [], {}, {}
for p in sorted((S / "products").glob("*.js")):
    js = re.sub(r"^import .*?;[ \t]*$", "", p.read_text(encoding="utf-8"), flags=re.M)   # chf.js imports cassette.js, already in the bundle
    mods.append(js.replace("export default", "PRODUCTS[%s] =" % json.dumps(p.stem), 1))
    names = re.findall(r"'([^']+)'", re.search(r"textures:\s*\[([^\]]*)\]", js).group(1))
    for n in names: assets[n], assets[n + "_lo"] = b64(n + ".png"), b64(n + "_lo.png")
    ill = S.parent / "reference image" / "illustrations" / (p.stem + ".png")
    try:   # 2x thumbnails of the stickers for the product strip; falls back to the _lo texture without Pillow
        from PIL import Image
        im = Image.open(ill); im.thumbnail((72, 72), Image.LANCZOS); out = io.BytesIO(); im.save(out, "PNG", optimize=True)
        thumbs[p.stem] = "data:image/png;base64," + base64.b64encode(out.getvalue()).decode()
    except Exception:
        thumbs[p.stem] = assets[names[0] + "_lo"]
bundle = (three + orbit + cassette + kit + "var PRODUCTS={};\n" + "\n".join(mods)
          + "\nvar ASSETS=" + json.dumps(assets) + ";\nvar THUMBS=" + json.dumps(thumbs) + ";\n")
src = (S / "products_viewer_src.html").read_text(encoding="utf-8")
head = brand(src[src.index("<!--HEAD-->") + len("<!--HEAD-->"): src.index("<!--BODY-->")]).replace("<!--FAVICON-->", '<link rel="icon" type="image/png" href="%s">' % thumbs["chf"])
body = brand(src[src.index("<!--BODY-->") + len("<!--BODY-->"):]).replace("/*__BUNDLE__*/", bundle)
out = S.parent / "output" / "sony80_viewer.html"
page = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        + head + '</head>\n<body>' + body + '</body>\n</html>\n')
out.write_text(page, encoding="utf-8")
print(out.name, out.stat().st_size, "bytes")
if SITE.exists():
    SITE.write_text(page.replace('href="./gifs/index.html"', 'href="./output/gifs/index.html"').replace('href="./chf90_viewer.html"', 'href="./output/chf90_viewer.html"')
                        .replace('var GIF_BASE = "./gifs/";', 'var GIF_BASE = "./output/gifs/";'), encoding="utf-8")
    print("index.html (the site) rewritten")

# ---------- the GIF gallery page: ../output/gifs/index.html ----------
gallery = brand((S / "gallery_src.html").read_text(encoding="utf-8"))
if SITE.exists(): gallery = gallery.replace('href="../sony80_viewer.html', 'href="../../index.html')
(S.parent / "output" / "gifs" / "index.html").write_text(gallery, encoding="utf-8")
print("gifs/index.html", len(gallery), "bytes")
