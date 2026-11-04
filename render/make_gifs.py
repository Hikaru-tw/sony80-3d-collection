"""Render the 8 product GIFs (pixel + smooth) with one shared framing, plus a contact sheet.

    python make_gifs.py [id ...]          # default: all 8

Writes ../output/gifs/<id>_pixel.gif (250 px render, nearest-neighbour x2, sticker-style 2 px ink) and
../output/gifs/<id>_smooth.gif (1000 px render, Lanczos to 500, same line weight); 500 x 500, transparent,
23 frames @ 100 ms, the sonywalk.gif sway. Extra key=value args are passed through to render2.py.
"""
import subprocess, sys, math
from pathlib import Path
from PIL import Image, ImageSequence

S = Path(__file__).parent
OUT = S.parent / "output" / "gifs"
IDS = ["chf", "tps-l2", "wm-f5", "d-e350", "dsc-p8", "kv-1310", "mdr-cd900st", "tr-55"]
extra = [a for a in sys.argv[1:] if "=" in a]
ids = [a for a in sys.argv[1:] if "=" not in a] or IDS
OUT.mkdir(parents=True, exist_ok=True)
STYLES = {"pixel": [], "smooth": ["tex=linear", "res=1000", "smooth=1"]}

procs = []
for i in ids:
    for style, args in STYLES.items():
        cmd = [sys.executable, str(S / "render2.py"), "mode=wobble", f"id={i}", f"out={OUT / f'{i}_{style}.gif'}", *args, *extra]
        procs.append((i, style, subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)))
    if len(procs) >= 6:                                   # a few headless Chromiums at a time
        for i_, s_, p in procs: print(i_, s_, p.communicate()[0].strip().splitlines()[-1])
        procs = []
for i_, s_, p in procs: print(i_, s_, p.communicate()[0].strip().splitlines()[-1])
for f in list(OUT.glob("*.sheet.png")) + list(OUT.glob("*_frame0.png")): f.unlink()

# contact sheet: first frame of every GIF, pixel row over smooth row
tiles = [(i, s) for s in STYLES for i in IDS if (OUT / f"{i}_{s}.gif").exists()]
cols, tw = len(IDS), 250
sheet = Image.new("RGB", (cols * tw, math.ceil(len(tiles) / cols) * tw), "white")
for k, (i, s) in enumerate(tiles):
    fr = next(ImageSequence.Iterator(Image.open(OUT / f"{i}_{s}.gif"))).convert("RGBA").resize((tw, tw), Image.LANCZOS)
    sheet.paste(fr, ((k % cols) * tw, (k // cols) * tw), fr)
sheet.save(OUT / "contact_sheet.png"); print("contact sheet", sheet.size)
