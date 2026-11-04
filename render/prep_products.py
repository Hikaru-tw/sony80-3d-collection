"""Textures for the 8 products from the client's master illustration (Sony 80週年插畫FA_0505.ai, artboard 1).

    python prep_products.py [path/to/Sony 80週年插畫FA_0505.ai]

With the .ai: rasterises artboard 1 at 300 dpi (Poppler's pdftocairo) and cuts the 8 colour stickers into
../reference image/illustrations/<id>.png (transparent background). Without it, the existing PNGs there are used.
Then writes tex/<id>.png + tex/<id>_lo.png (pixel-look GIFs) for the 7 product models, and re-cuts the CHF 90 label
(label_a / label_b, full + _lo) from the straight-on master art.
"""
import subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from scipy import ndimage as ndi

S = Path(__file__).parent
ILL = S.parent / "reference image" / "illustrations"
PRODUCTS = ["tps-l2", "wm-f5", "d-e350", "dsc-p8", "kv-1310", "mdr-cd900st", "tr-55"]
Image.MAX_IMAGE_PIXELS = None


def cut_stickers(ai):
    tmp = Path(tempfile.mkdtemp())
    for r in (72, 300):
        subprocess.run(["pdftocairo", "-png", "-r", str(r), "-f", "1", "-l", "1", "-singlefile", str(ai), str(tmp / f"p{r}")], check=True)
    lo = np.array(Image.open(tmp / "p72.png").convert("RGB")).astype(int)
    hi = Image.open(tmp / "p300.png").convert("RGB"); k = hi.width / lo.shape[1]
    panel = lo[60, 60]                                                # beige column behind the colour stickers
    cells = {"tps-l2": (0, 0), "chf": (0, 1), "wm-f5": (0, 2), "kv-1310": (0, 3), "dsc-p8": (1, 0), "tr-55": (1, 1), "mdr-cd900st": (1, 2), "d-e350": (1, 3)}
    rows, cols = [(40, 470), (470, 800), (800, 1180), (1180, 1600)], [(38, 480), (945, 1388)]   # artboard 1 layout, 72 dpi px
    ILL.mkdir(parents=True, exist_ok=True)
    for n, (ci, ri) in cells.items():
        (x0, x1), (y0, y1) = cols[ci], rows[ri]
        fg = np.abs(lo[y0:y1, x0:x1] - panel).sum(-1) > 30
        lab, cnt = ndi.label(fg); big = 1 + int(np.argmax(ndi.sum(fg, lab, range(1, cnt + 1))))
        ys, xs = np.where(lab == big)
        crop = hi.crop(tuple(int(v * k) for v in (x0 + xs.min() - 4, y0 + ys.min() - 4, x0 + xs.max() + 5, y0 + ys.max() + 5)))
        a = np.array(crop).astype(int); bg = np.abs(a - panel).sum(-1) < 40
        lab2, _ = ndi.label(bg); edge = set(np.unique(np.concatenate([lab2[0], lab2[-1], lab2[:, 0], lab2[:, -1]]))) - {0}
        alpha = np.where(np.isin(lab2, list(edge)), 0, 255).astype(np.uint8)
        Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), "RGBA").save(ILL / f"{n}.png")
        print("sticker", n, crop.size)


def product_textures():
    (S / "tex").mkdir(exist_ok=True)
    for n in PRODUCTS:
        im = Image.open(ILL / f"{n}.png").convert("RGBA")
        im.save(S / "tex" / f"{n}.png")
        im.resize((round(im.width * 0.2), round(im.height * 0.2)), Image.LANCZOS).save(S / "tex" / f"{n}_lo.png")
        print("tex", n, im.size)


def chf_labels():
    """Same label rect as prep2.py (front.png px 30,32,488,245 of the 520 x 341 shell), located on the master art."""
    im = Image.open(ILL / "chf.png").convert("RGBA"); a = np.array(im).astype(int)
    dark = (a[..., :3].sum(-1) < 200) & (a[..., 3] > 0)
    ys = np.where(dark.any(1))[0]; top, bot = ys.min(), ys.max()
    row = dark[top + int(0.15 * (bot - top))]; xs = np.where(row)[0]; left, right = xs.min(), xs.max()   # above the side ears
    sx, sy = (right - left + 1) / 520, (bot - top + 1) / 341
    box = (round(left + 30 * sx), round(top + 32 * sy), round(left + 488 * sx), round(top + 245 * sy))
    la = im.crop(box).convert("RGB")
    f = la.width / 458                                                # prep2.py worked on a 458 px wide label
    lb = la.copy(); d = ImageDraw.Draw(lb)
    d.rectangle(tuple(round(v * f) for v in (12, 118, 43, 151)), fill=(237, 110, 44))   # cover the 'A' with the band orange
    try:
        font = ImageFont.truetype("arialbd.ttf", round(30 * f))
    except OSError:
        font = ImageFont.load_default()
    d.text((round(27 * f), round(134 * f)), "B", fill=(33, 23, 20), font=font, anchor="mm")
    for name, img in (("label_a", la), ("label_b", lb)):
        img.save(S / f"{name}.png"); img.resize((229, round(229 * img.height / img.width)), Image.LANCZOS).save(S / f"{name}_lo.png")
    print("chf labels", la.size, "from shell box", (left, top, right, bot))


if __name__ == "__main__":
    if len(sys.argv) > 1:
        cut_stickers(Path(sys.argv[1]))
    product_textures()
    chf_labels()
